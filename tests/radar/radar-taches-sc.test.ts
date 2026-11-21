import fs from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { runCurve, runDiscovery } from "../../convex/radar/radarSignals";
import { runNaming } from "../../convex/radar/radarNaming";
import { runAccountReads, runNetworkSearch } from "../../convex/radar/radarNetworks";
import { DEFAULT_BUDGET, nextQueries } from "../../convex/radar/radarSignalsMath";
import { DISCOVERY_ROTATION } from "../../convex/radar/radarDiscoveryQueries";
import { fakeActionCtx, handlerOf, type CtxCall } from "./action-ctx";

/**
 * BASCULE ABSENTE = LE RADAR DE MAIN (20/11/2026). Les cinq tâches qui peuvent passer chez TikHub (découverte, courbe,
 * tournures, réseau, relevés de comptes) tournent sur un faux contexte qui note TOUT : chaque appel à ScrapeCreators
 * (adresse, clé), chaque page publique de TikTok, chaque query, mutation et tâche planifiée, avec ses arguments.
 * L'enregistrement de référence est fait sur le code de main sans la bascule (GOLDEN_WRITE=1, ce banc copié dans un
 * worktree détaché sur main) : d'abord 191b053 ; depuis la fusion des briques gratuites (#19, #24, #25, #26), b4814df
 * — la courbe lue dans la voie des relevés, le tri des hashtags, les ratés retenus ; depuis le 21/11/2026, 2191a8b (qui
 * rejouait l'enregistrement b4814df à l'identique), les réponses servies ré-anonymisées (scripts/fixtures-publiques.mjs :
 * plus d'écart commun entre les dates) et les identifiants du banc de forme synthétique. Le code d'aujourd'hui doit le
 * reproduire à l'identique, sans réglage TikHub, avec le réglage sans la clé, et avec la clé sans le réglage.
 * Ici les pages publiques de TikTok refusent toutes : les tâches entières, payant compris. Les briques elles-mêmes,
 * pages servies, bascule absente et posée : tests/radar/radar-briques-bascule.test.ts.
 * Depuis le 20/11/2026, aussi ce que la bascule a réécrit sans qu'un banc le joue : la porte de budget du réseau (sa part
 * du jour épuisée au milieu d'une app ; la part relue avant l'app suivante, une dépense déjà faite comprise) et les
 * paliers « économie » et « survie » (apps du réseau reportées, une app sans recherche comprise ; premiers relevés qui
 * attendent ; découverte coupée).
 * Les appels menés de front (8 relevés à la fois) sont comparés comme un ensemble : leur ordre dépend du hasard des
 * réponses, pas du code.
 */

const FILE = path.join(__dirname, "fixtures/taches-sc-2191a8b.json");
const FIX = path.join(__dirname, "fixtures");
const fixture = (name: string) => JSON.parse(fs.readFileSync(path.join(FIX, name), "utf8")) as Record<string, any>;
const NOW = Date.parse("2026-11-20T12:00:00Z");
const SC_KEY = "cle-sc-de-test-0123456789";
const ENV_KEYS = ["TIKHUB_API_KEY", "RADAR_TIKHUB", "SCRAPECREATORS_API_KEY"] as const;

type FetchCall = { url: string; key: string | null; auth: string | null };

/** Un refus de ScrapeCreators pour une adresse (`undefined` : la page est servie). */
type ScFail = (u: URL) => [number, Record<string, unknown>] | undefined;

/**
 * ScrapeCreators simulé : des pages réelles (tronquées), une suite tant qu'on la demande ; TikTok (pages publiques) refuse.
 * `fail` : les pages que ScrapeCreators refuse (402 à sec, 4xx, 5xx), facturées comme il les facture (0 crédit).
 */
function scFetch(calls: FetchCall[], fail?: ScFail) {
  const searchItems = fixture("sc/reseau-motcle.json").search_item_list;
  const profile = fixture("sc/profil.json");
  return vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input);
    const h = (init?.headers ?? {}) as Record<string, string>;
    calls.push({ url, key: h["x-api-key"] ?? null, auth: h.Authorization ?? null });
    const u = new URL(url);
    const ok = (body: Record<string, unknown>) => new Response(JSON.stringify({ success: true, credits_charged: 1, credits_remaining: 30_000, ...body }), { status: 200 });
    if (u.hostname === "api.scrapecreators.com") {
      const refused = fail?.(u);
      if (refused) return new Response(JSON.stringify({ success: false, ...refused[1] }), { status: refused[0] });
      const cursor = Number(u.searchParams.get("cursor") ?? 0);
      if (u.pathname === "/v1/tiktok/search/keyword") return ok({ search_item_list: searchItems, cursor: cursor + 30, has_more: 1 });
      if (u.pathname === "/v1/tiktok/search/hashtag") return ok({ aweme_list: profile.aweme_list, cursor: cursor + 20, has_more: 1 });
      if (u.pathname === "/v3/tiktok/profile/videos") {
        if (u.searchParams.get("handle") === "compte_mort") return new Response(JSON.stringify(fixture("sc/compte-inexistant.json")), { status: 404 });
        return ok({ aweme_list: profile.aweme_list, max_cursor: profile.max_cursor, has_more: 1 });
      }
      if (u.pathname === "/v2/tiktok/video") return ok({ aweme_detail: fixture("sc/video.json").aweme_detail });
      return new Response("{}", { status: 404 });
    }
    // Pages publiques de TikTok (voie gratuite des relevés) : refusées, les comptes passent au payant.
    return new Response("refus", { status: 500 });
  });
}

type Budget = typeof DEFAULT_BUDGET;
type Usage = { poste: string; credits: number; day: string };
/** Le réseau à `qty` crédits par mois (sa part d'un passage : qty ÷ 30, NETWORK_RUNS_PER_DAY = 1). */
const networkAt = (qty: number): Budget => ({ ...DEFAULT_BUDGET, postes: DEFAULT_BUDGET.postes.map((p) => (p.key === "network" ? { ...p, qty } : p)) });
function jobState(remaining: number, seenAgoMs = 60_000, budget: Budget = DEFAULT_BUDGET, today: Usage[] = []) {
  return {
    budget,
    cursor: 7,
    usage: [{ poste: "tiktok", credits: 1_000, day: "2026-11-19" }, ...today],
    day: "2026-11-20",
    month: "2026-11",
    balance: { remaining, seenAt: NOW - seenAgoMs, now: NOW, perDay: 1_000 },
    creditAlerted: {},
    recentUsage: [{ poste: "tiktok", credits: 1_000, day: "2026-11-19" }],
    th: null,
    thPrices: null,
    thPricesAt: null,
    fallbacksToday: 0,
  };
}

const account = (handle: string, first = false) => ({ id: `radarTracked_${handle}`, handle, located: false, first, dueAt: NOW - 2 * 3_600_000 });

type App = { id: string; name: string; searches: string[]; rival: boolean; deep: boolean; never: boolean; rule: { strong: string[]; weak: string[]; context: string[] }; tagCounts: unknown[] };
const app = (slug: string, searches: string[], o: Partial<App> = {}): App => ({
  id: `radarApps_${slug}`,
  name: slug.charAt(0).toUpperCase() + slug.slice(1),
  searches,
  rival: false,
  deep: false,
  never: false,
  rule: { strong: [slug], weak: [], context: [] },
  tagCounts: [],
  ...o,
});
const APPS: App[] = [
  app("lumio", ["#lumio", "lumio app"], { rival: true, deep: true, never: true }),
  app("glowup", ["glowup"]),
];
/**
 * Les paliers du solde (radarSignalsMath.creditTier, 1 000 crédits par jour) : une concurrente, jamais reportée ; une
 * app de routine ; une recherche complète d'une app non concurrente ; une app sans recherche, en recherche complète.
 */
const TIER_APPS: App[] = [...APPS, app("profonde", ["profonde app"], { deep: true }), app("vide", [], { deep: true })];
/** Deux apps de routine (jamais le rattrapage du mois) : la part du jour borne le passage. */
const ROUTINE_APPS: App[] = [app("glowup", ["glowup", "#glowup"]), app("second", ["second app"])];

type CaseOpts = { seenAgoMs?: number; budget?: Budget; apps?: App[]; spentToday?: (jobStateCalls: number) => Usage[]; fail?: ScFail };
function answers(remaining: number, o: CaseOpts = {}) {
  let attachCalls = 0;
  let jobStateCalls = 0;
  return {
    "radar/radarSignals:jobState": () => jobState(remaining, o.seenAgoMs, o.budget, o.spentToday?.(jobStateCalls++) ?? []),
    // La forme que rend dueCurve depuis #25 (la voie lit la page de chaque vidéo : son identifiant et son auteur).
    "radar/radarSignals:dueCurve": (a: Record<string, unknown>) =>
      Array.from({ length: Math.min(3, Number(a.limit)) }, (_, i) => ({
        id: `radarSignals_${i}`,
        url: `https://www.tiktok.com/@auteur_17/video/770977455900000000${i}`,
        videoId: `770977455900000000${i}`,
        handle: "auteur_17",
      })),
    "radar/radarSignals:upsertDiscovered": () => ({ inserted: 1, updated: 0, admitted: 0, attached: 0 }),
    "radar/radarNaming:applyNamed": () => ({ attached: 0, small: 0, known: 0 }),
    // La forme que rend dueApps depuis #24 : les motifs de l'app et ses hashtags déjà payés (le tri des hashtags).
    "radar/radarNetworks:dueApps": () => (o.apps ?? APPS).map((a) => structuredClone(a)),
    // Un nouveau compte à la première page de chaque passe, plus rien ensuite : une recherche complète s'arrête à 2 pages sèches.
    "radar/radarNetworks:attachFromSearch": (a: Record<string, unknown>) => ({ attached: a.step !== undefined && attachCalls++ % 3 === 0 ? 1 : 0, signals: 0, updated: 0 }),
    "radar/radarNetworks:claimAccountsLease": () => true,
    "radar/radarNetworks:releaseAccountsLease": () => false,
    "radar/radarNetworks:appRules": () => [],
    "radar/radarNetworks:dueAccounts": () => ({
      due: [...["a1", "a2", "a3", "a4", "a5", "a6", "compte_mort", "a8"].map((h) => account(h)), account("n1", true), account("n2", true)],
      parked: ["radarTracked_gare"],
    }),
    "radar/radarNetworks:probeAccount": () => account("sonde"),
  };
}

/** Avance l'horloge simulée jusqu'à ce que la tâche rende la main (les pauses de la voie gratuite sont des minuteries). */
async function drive<T>(p: Promise<T>): Promise<T> {
  let done = false;
  void p.then(
    () => (done = true),
    () => (done = true),
  );
  for (let i = 0; i < 10_000 && !done; i++) await vi.advanceTimersToNextTimerAsync();
  return p;
}

type Run = { name: string; result: unknown; fetches: FetchCall[]; ctx: CtxCall[] };

/**
 * Les soldes des paliers, à 1 000 crédits par jour (CREDIT_RESERVE 1 500) : « économie » sous 2 jours de crédits, les
 * recherches complètes des apps non concurrentes attendent ; « survie » sous 1 jour, leur routine aussi, et les premiers
 * relevés ratés par la voie gratuite attendent FIRST_READ_WAIT_MS au lieu de partir au payant.
 */
const ECONOMIE = 1_500 + 1_500;
const SURVIE = 1_500 + 500;

type Case = [string, unknown, number, CaseOpts?];
const CASES: Case[] = [
    ["runDiscovery", runDiscovery, 40_000],
    ["runCurve", runCurve, 40_000],
    ["runNaming", runNaming, 40_000],
    ["runNetworkSearch", runNetworkSearch, 40_000],
    ["runAccountReads", runAccountReads, 40_000],
    // Sous la réserve, solde lu il y a plus de 50 minutes : seule la sonde part.
    ["runAccountReads:sonde", runAccountReads, 1_000, { seenAgoMs: 2 * 3_600_000 }],
    // La part du jour du réseau (4 crédits) s'épuise au milieu de la première app : le passage s'arrête là.
    ["runNetworkSearch:part-epuisee", runNetworkSearch, 40_000, { budget: networkAt(120), apps: ROUTINE_APPS }],
    // La part se relit avant la seconde app : la première finit dans la sienne (100 crédits), puis 97 crédits du jour
    // sont relus dans jobState (dépensés par elle et par un autre passage) — il ne reste à la seconde que 3 crédits,
    // quoi que la première ait laissé de la part du départ.
    ["runNetworkSearch:depense-relue", runNetworkSearch, 40_000, { budget: networkAt(3_000), apps: ROUTINE_APPS, spentToday: (n) => (n === 0 ? [] : [{ poste: "network", credits: 97, day: "2026-11-20" }]) }],
    ["runNetworkSearch:economie", runNetworkSearch, ECONOMIE, { apps: TIER_APPS }],
    ["runNetworkSearch:survie", runNetworkSearch, SURVIE, { apps: TIER_APPS }],
    ["runAccountReads:economie", runAccountReads, ECONOMIE],
    ["runAccountReads:survie", runAccountReads, SURVIE],
    ["runDiscovery:economie", runDiscovery, ECONOMIE],
];

/**
 * LES REFUS DE SCRAPECREATORS ET LA DÉPENSE DU JOUR (21/11/2026), enregistrés sur main 2191a8b (GOLDEN_WRITE=1, ce banc
 * copié dans un export de main) : la bascule a réécrit autour de l'aiguilleur la boucle de chaque tâche (une page
 * refusée, un 402, `failed` du tri des hashtags) et sa part du passage (passLimit(passGate(allowanceParts(…,
 * todayCredits(st, poste), …)))) — or les faux de ce banc servaient toujours 200 et aucun jobState n'avait de dépense du
 * jour pour les relevés, la courbe (filet et voie) ni la découverte. Des mutants de ces chemins (402 ignoré, refus non
 * compté, `failed: false`, recherche ou vidéo refusée gardée due, todayCredits remplacé par 0) laissaient tout vert.
 */
const REFUS_FILE = path.join(__dirname, "fixtures/taches-sc-refus-2191a8b.json");
const scPath = (p: string) => (u: URL) => u.pathname === p;
/** La dépense du jour, au bord de la part du jour : 3 relevés, 1 vidéo de courbe, 5 recherches de découverte. */
const NEAR_DAY: Usage[] = [
  { poste: "tiktok", credits: 9_000 - 3, day: "2026-11-20" },
  { poste: "curve", credits: 300 - 1, day: "2026-11-20" },
  { poste: "search", credits: 150 - 5, day: "2026-11-20" },
];
const REFUS_CASES: Case[] = [
  // Réseau : ScrapeCreators à sec (402) à la passe « lumio app » sans région — le passage s'arrête, « no-credits ».
  ["runNetworkSearch:sc-402", runNetworkSearch, 40_000, { fail: (u) => (scPath("/v1/tiktok/search/keyword")(u) && u.searchParams.get("query") === "lumio app" ? [402, { message: "plus de crédits" }] : undefined) }],
  // Réseau : chaque page de « glowup » refusée (500), la page FR du hashtag « lumio » refusée (400) — une erreur par
  // passe, l'app « glowup » en erreur, le hashtag « lumio » pas retenu comme payé au bout.
  [
    "runNetworkSearch:sc-refus",
    runNetworkSearch,
    40_000,
    {
      fail: (u) => {
        if (scPath("/v1/tiktok/search/keyword")(u) && u.searchParams.get("query") === "glowup") return [500, { message: "erreur interne" }];
        if (scPath("/v1/tiktok/search/hashtag")(u) && u.searchParams.get("hashtag") === "lumio" && u.searchParams.get("region") === "FR") return [400, { message: "requête refusée" }];
        return undefined;
      },
    },
  ],
  // Découverte : une recherche refusée (500) est passée, la suite faite ; ScrapeCreators à sec (402) arrête le passage.
  ["runDiscovery:sc-refus", runDiscovery, 40_000, { fail: (u) => (scPath("/v1/tiktok/search/keyword")(u) && u.searchParams.get("query") === "argent en ligne" ? [500, { message: "erreur interne" }] : undefined) }],
  ["runDiscovery:sc-402", runDiscovery, 40_000, { fail: (u) => (scPath("/v1/tiktok/search/keyword")(u) && u.searchParams.get("query") === "business en ligne" ? [402, { message: "plus de crédits" }] : undefined) }],
  // Courbe (filet) : une vidéo refusée (404) sort de la courbe, la suite est relevée.
  ["runCurve:sc-refus", runCurve, 40_000, { fail: (u) => (scPath("/v2/tiktok/video")(u) && String(u.searchParams.get("url")).endsWith("/video/7709774559000000001") ? [404, { message: "introuvable" }] : undefined) }],
  // La dépense du jour borne la part du passage : relevés (et la courbe dans leur voie), filet de la courbe, découverte.
  ["runAccountReads:depense-du-jour", runAccountReads, 40_000, { spentToday: () => NEAR_DAY }],
  ["runCurve:depense-du-jour", runCurve, 40_000, { spentToday: () => NEAR_DAY }],
  ["runDiscovery:depense-du-jour", runDiscovery, 40_000, { spentToday: () => NEAR_DAY }],
];

async function runAll(cases: Case[] = CASES): Promise<Run[]> {
  const out: Run[] = [];
  for (const [name, fn, remaining, opts] of cases) {
    vi.setSystemTime(NOW);
    const fetches: FetchCall[] = [];
    vi.stubGlobal("fetch", scFetch(fetches, opts?.fail));
    const f = fakeActionCtx(answers(remaining, opts));
    const result = await drive(handlerOf(fn)(f.ctx, {}) as Promise<unknown>);
    out.push({ name, result, fetches, ctx: f.calls });
  }
  return out;
}

/** Un objet écrit clés triées : l'ordre des champs d'un argument ne dit rien. */
const canon = (x: unknown): string =>
  JSON.stringify(x, (_k, v: unknown) => (v && typeof v === "object" && !Array.isArray(v) ? Object.fromEntries(Object.entries(v as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b))) : v));

/**
 * Le seul écart voulu depuis main, sans rapport avec la bascule : la découverte lit les motifs des apps actives une
 * fois par passage (`appRules`, `active`) et les passe à chaque recherche (`apps` de upsertDiscovered) au lieu que
 * chaque recherche relise la table (levier L6 du 20/11/2026, sortie prouvée identique dans
 * tests/radar/radar-lectures-recherches.test.ts). Retiré de la comparaison, et vérifié à part ci-dessous.
 */
const withoutL6 = (r: Run): CtxCall[] =>
  !r.name.startsWith("runDiscovery")
    ? r.ctx
    : r.ctx
        .filter((c) => !(c.name === "radar/radarNetworks:appRules" && c.args.active === true))
        .map((c) => {
          if (c.name !== "radar/radarSignals:upsertDiscovered") return c;
          const { apps: _apps, ...args } = c.args;
          return { ...c, args };
        });

/** Une forme comparable : les appels triés (ceux menés de front n'ont pas d'ordre garanti), clés triées. */
const comparable = (runs: Run[]) =>
  runs.map((r) => ({
    name: r.name,
    result: r.result,
    fetches: r.fetches.map(canon).sort(),
    ctx: withoutL6(r).map(canon).sort(),
  }));

let savedEnv: Record<string, string | undefined>;
beforeEach(() => {
  savedEnv = Object.fromEntries(ENV_KEYS.map((k) => [k, process.env[k]]));
  for (const k of ENV_KEYS) delete process.env[k];
  process.env.SCRAPECREATORS_API_KEY = SC_KEY;
  vi.useFakeTimers({ toFake: ["Date", "setTimeout", "clearTimeout"] });
  vi.setSystemTime(NOW);
  vi.spyOn(Math, "random").mockReturnValue(0.5);
  vi.spyOn(console, "error").mockImplementation(() => undefined);
  vi.spyOn(console, "warn").mockImplementation(() => undefined);
});
afterEach(() => {
  for (const k of ENV_KEYS) {
    if (savedEnv[k] === undefined) delete process.env[k];
    else process.env[k] = savedEnv[k];
  }
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("bascule absente : les cinq tâches font ce que fait main (2191a8b)", () => {
  it("sans réglage TikHub", async () => {
    const runs = comparable(await runAll());
    if (process.env.GOLDEN_WRITE === "1") {
      fs.writeFileSync(FILE, `${JSON.stringify(runs, null, 1)}\n`);
      return;
    }
    const want = JSON.parse(fs.readFileSync(FILE, "utf8"));
    expect(runs).toEqual(want);
    // L'enregistrement couvre bien chaque chemin : pages payées de chaque sorte, relevés en erreur, sonde.
    const all = runs.flatMap((r) => r.fetches.map((x) => JSON.parse(x) as FetchCall));
    expect(all.some((x) => x.url.includes("/v1/tiktok/search/hashtag"))).toBe(true);
    expect(all.some((x) => x.url.includes("sort_by=date-posted"))).toBe(true);
    expect(all.some((x) => x.url.includes("handle=compte_mort"))).toBe(true);
    expect(runs.find((r) => r.name === "runAccountReads:sonde")!.fetches.filter((x) => x.includes("api.scrapecreators.com"))).toHaveLength(1);
    expect(all.every((x) => !x.url.includes("tikhub"))).toBe(true);
    // Les portes de budget et les paliers réécrits par la bascule (20/11/2026), interrupteur coupé : chaque scénario
    // passe bien par son chemin — sans quoi une égalité avec main ne prouverait rien.
    const of = (name: string) => runs.find((r) => r.name === name)!.ctx.map((x) => JSON.parse(x) as CtxCall);
    const outcomes = (name: string) => of(name).filter((c) => c.name === "radar/radarNetworks:finishNetworkSearch").map((c) => `${String(c.args.appId)} ${String(c.args.outcome)}`);
    const started = (name: string) => of(name).filter((c) => c.name === "radar/radarNetworks:startNetworkSearch").map((c) => String(c.args.appId)).sort();
    expect(outcomes("runNetworkSearch:part-epuisee")).toEqual(["radarApps_glowup budget"]);
    expect(outcomes("runNetworkSearch:depense-relue")).toEqual(["radarApps_glowup done", "radarApps_second budget"]);
    expect(started("runNetworkSearch")).toEqual(["radarApps_glowup", "radarApps_lumio"]);
    expect(started("runNetworkSearch:economie")).toEqual(["radarApps_glowup", "radarApps_lumio"]);
    expect(started("runNetworkSearch:survie")).toEqual(["radarApps_lumio"]);
    const paidHandles = (name: string) => runs.find((r) => r.name === name)!.fetches.map((x) => new URL((JSON.parse(x) as FetchCall).url).searchParams.get("handle")).filter(Boolean);
    expect(paidHandles("runAccountReads:economie")).toContain("n1");
    expect(paidHandles("runAccountReads:survie")).not.toContain("n1");
    expect(runs.find((r) => r.name === "runDiscovery:economie")!.fetches).toEqual([]);
  });

  it("sans réglage TikHub, refus de ScrapeCreators et dépense du jour : comme main (2191a8b)", async () => {
    const runs = comparable(await runAll(REFUS_CASES));
    if (process.env.GOLDEN_WRITE === "1") {
      fs.writeFileSync(REFUS_FILE, `${JSON.stringify(runs, null, 1)}\n`);
      return;
    }
    expect(runs).toEqual(JSON.parse(fs.readFileSync(REFUS_FILE, "utf8")));
    // Chaque scénario passe par son chemin : sans quoi une égalité avec main ne prouverait rien.
    const of = (name: string) => runs.find((r) => r.name === name)!;
    const ctxOf = (name: string) => of(name).ctx.map((x) => JSON.parse(x) as CtxCall);
    const fetchesOf = (name: string) => of(name).fetches.map((x) => new URL((JSON.parse(x) as FetchCall).url)).filter((u) => u.hostname === "api.scrapecreators.com");
    const finished = (name: string) => ctxOf(name).filter((c) => c.name === "radar/radarNetworks:finishNetworkSearch").map((c) => c.args);
    const errorsOf = (name: string) => ctxOf(name).filter((c) => c.name === "radar/radarSignals:recordRun").reduce((n, c) => n + Number(c.args.errors ?? 0), 0);
    // Réseau, 402 : l'app s'arrête « no-credits », l'app suivante n'est pas cherchée.
    expect(finished("runNetworkSearch:sc-402").map((a) => `${String(a.appId)} ${String(a.outcome)}`)).toEqual(["radarApps_lumio no-credits"]);
    // Réseau, refus : « glowup » en erreur (toutes ses pages refusées), une erreur par passe refusée, « lumio » cherchée
    // sans son hashtag retenu comme payé (sa passe FR a échoué).
    const refus = finished("runNetworkSearch:sc-refus");
    expect(refus.map((a) => `${String(a.appId)} ${String(a.outcome)}`).sort()).toEqual(["radarApps_glowup error", "radarApps_lumio done"]);
    expect(errorsOf("runNetworkSearch:sc-refus")).toBe(3);
    expect(refus.find((a) => a.appId === "radarApps_lumio")!.tags).toBeUndefined();
    // Découverte : la recherche refusée est passée (le curseur avance de toute la part), le 402 arrête le passage.
    const cursorOf = (name: string) => ctxOf(name).find((c) => c.name === "radar/radarSignals:recordRun")!.args.cursor;
    const part = 38; // 150 recherches par jour, 4 passages
    expect(cursorOf("runDiscovery:sc-refus")).toBe(nextQueries(7, part, DISCOVERY_ROTATION).cursor);
    expect(fetchesOf("runDiscovery:sc-refus")).toHaveLength(part);
    expect(fetchesOf("runDiscovery:sc-402").length).toBeLessThan(part);
    expect(cursorOf("runDiscovery:sc-402")).not.toBe(nextQueries(7, part, DISCOVERY_ROTATION).cursor);
    // Courbe : la vidéo refusée sort de la courbe, les autres sont relevées.
    const curve = ctxOf("runCurve:sc-refus").filter((c) => c.name === "radar/radarSignals:applyCurve");
    expect(curve.map((c) => [c.args.id, c.args.video === null])).toEqual([
      ["radarSignals_0", false],
      ["radarSignals_1", true],
      ["radarSignals_2", false],
    ]);
    // La dépense du jour : 3 relevés payés, 1 vidéo de courbe (filet et voie), 5 recherches.
    const paidReads = fetchesOf("runAccountReads:depense-du-jour").filter((u) => u.pathname === "/v3/tiktok/profile/videos");
    expect(paidReads).toHaveLength(3);
    expect(fetchesOf("runAccountReads:depense-du-jour").filter((u) => u.pathname === "/v2/tiktok/video")).toHaveLength(1);
    expect(fetchesOf("runCurve:depense-du-jour")).toHaveLength(1);
    expect(fetchesOf("runDiscovery:depense-du-jour")).toHaveLength(5);
  });

  // Le levier L6 (cf `withoutL6`) : les motifs lus une fois, à la première recherche servie, et passés à chacune.
  it("découverte : les motifs des apps actives lus une fois par passage et passés à chaque recherche", async () => {
    const run = (await runAll()).find((r) => r.name === "runDiscovery")!;
    const reads = run.ctx.filter((c) => c.name === "radar/radarNetworks:appRules");
    expect(reads.map((c) => c.args)).toEqual([{ active: true }]);
    const ups = run.ctx.filter((c) => c.name === "radar/radarSignals:upsertDiscovered");
    expect(ups.length).toBeGreaterThan(1);
    // La réponse prévue de appRules (une liste vide) passe telle quelle à chaque recherche.
    for (const c of ups) expect(c.args.apps).toEqual([]);
    // Lus après la première recherche, pas avant (un passage sans recherche servie ne les lit pas).
    const at = (c: CtxCall) => run.ctx.indexOf(c);
    expect(at(reads[0])).toBeGreaterThan(run.ctx.findIndex((c) => c.name === "radar/radarSignals:jobState"));
    expect(at(reads[0])).toBeLessThan(at(ups[0]));
  });

  // Les replis : une lecture refusée, ou trop d'apps pour un argument (8 192 éléments au plus) — chaque recherche relit
  // les apps elle-même, comme avant (aucun `apps`), et la lecture n'est pas retentée.
  for (const [nom, rules] of [
    ["lecture des motifs refusée", () => Promise.reject(new Error("trop de lectures"))],
    ["plus de 8 000 apps actives", () => Array.from({ length: 8_001 }, (_, i) => ({ _id: `radarApps_${i}` }))],
  ] as const) {
    it(`découverte, ${nom} : chaque recherche relit les apps (aucun motif passé), lu une seule fois`, async () => {
      vi.stubGlobal("fetch", scFetch([]));
      const f = fakeActionCtx({ ...answers(40_000), "radar/radarNetworks:appRules": rules });
      await drive(handlerOf(runDiscovery)(f.ctx, {}) as Promise<unknown>);
      const ups = f.calls.filter((c) => c.name === "radar/radarSignals:upsertDiscovered");
      expect(ups.length).toBeGreaterThan(1);
      for (const c of ups) expect("apps" in c.args).toBe(false);
      expect(f.calls.filter((c) => c.name === "radar/radarNetworks:appRules")).toHaveLength(1);
    });
  }

  it("RADAR_TIKHUB posé, clé TikHub absente : identique", async () => {
    process.env.RADAR_TIKHUB = "all,search,network-all";
    expect(comparable(await runAll())).toEqual(JSON.parse(fs.readFileSync(FILE, "utf8")));
    expect(comparable(await runAll(REFUS_CASES))).toEqual(JSON.parse(fs.readFileSync(REFUS_FILE, "utf8")));
  });

  it("clé TikHub posée, RADAR_TIKHUB absent : identique, et aucun appel à TikHub (solde compris)", async () => {
    process.env.TIKHUB_API_KEY = "cle-tikhub-de-test";
    const runs = await runAll();
    expect(comparable(runs)).toEqual(JSON.parse(fs.readFileSync(FILE, "utf8")));
    const refus = await runAll(REFUS_CASES);
    expect(comparable(refus)).toEqual(JSON.parse(fs.readFileSync(REFUS_FILE, "utf8")));
    runs.push(...refus);
    for (const r of runs) for (const f of r.fetches) expect(f.url).not.toContain("api.tikhub.io");
    // Aucun argument de recordRun ne porte de champ TikHub.
    for (const r of runs) for (const c of r.ctx.filter((x) => x.name === "radar/radarSignals:recordRun")) expect(Object.keys(c.args).filter((k) => k.startsWith("th"))).toEqual([]);
  });
});
