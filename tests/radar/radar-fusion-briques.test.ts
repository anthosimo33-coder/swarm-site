import fs from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { claimFallback, curveInLane, runCurve, type JobState } from "../../convex/radar/radarSignals";
import { DEFAULT_BUDGET, budgetState, type BudgetState } from "../../convex/radar/radarSignalsMath";
import { RESERVE_MISS_WAIT_MS, curveMatch, settleCurve, type CurveCounts, type CurvePaid, type FreePage } from "../../convex/radar/radarFreeMath";
import { jobBudget, reserveFor, tikhubJobs } from "../../convex/radar/radarProviders";
import { runAccountReads, runNetworkSearch } from "../../convex/radar/radarNetworks";
import { runTranscripts } from "../../convex/radar/radarSources";
import { TH_ROUTES } from "../../convex/radar/tikhubApi";
import { drive, fakeActionCtx, fetchLog, handlerOf, writableDb } from "./action-ctx";

/**
 * LA FUSION DES BRIQUES GRATUITES ET DE LA BASCULE TIKHUB (20/11/2026). main (b4814df) a ajouté des pages publiques de
 * TikTok devant les postes payants (#19 transcriptions, #24 hashtags, #25 courbe, #26 relevés) ; la branche fait servir
 * ces postes par TikHub. La règle : la porte gratuite d'abord, puis le choix du fournisseur. Ce qu'une brique lit
 * gratuitement ou décide de ne pas payer n'est payé nulle part ; ce qu'elle laisse au payant passe par l'aiguilleur
 * (radarProviders.makeRouter) ; ses compteurs (radarUsage.saved, measured) gardent leur sens quel que soit le
 * fournisseur ; la réserve de ScrapeCreators ne bloque que ce qu'il sert.
 * Aucun appel réseau : TikHub, ScrapeCreators et TikTok sont des fixtures enregistrées (tests/radar/fixtures).
 */

const NOW = Date.parse("2026-11-20T12:00:00Z");
const ENV_KEYS = ["TIKHUB_API_KEY", "RADAR_TIKHUB", "SCRAPECREATORS_API_KEY"] as const;
let savedEnv: Record<string, string | undefined>;
beforeEach(() => {
  savedEnv = Object.fromEntries(ENV_KEYS.map((k) => [k, process.env[k]]));
  for (const k of ENV_KEYS) delete process.env[k];
  vi.useFakeTimers({ toFake: ["Date", "setTimeout", "clearTimeout"] });
  vi.setSystemTime(NOW);
  vi.spyOn(Math, "random").mockReturnValue(0.5);
  vi.spyOn(console, "error").mockImplementation(() => undefined);
  vi.spyOn(console, "warn").mockImplementation(() => undefined);
  vi.spyOn(console, "log").mockImplementation(() => undefined);
});
afterEach(() => {
  vi.restoreAllMocks();
  for (const k of ENV_KEYS) {
    if (savedEnv[k] === undefined) delete process.env[k];
    else process.env[k] = savedEnv[k];
  }
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

const FIX = path.join(__dirname, "fixtures");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fixture = (name: string) => JSON.parse(fs.readFileSync(path.join(FIX, name), "utf8")) as Record<string, any>;
const synth = () => fixture("tikhub/synthetiques.json");
const freshTh = () => ({ paidUsd: 5.4, freeUsd: 0.021, seenAt: NOW - 1_000, spentSinceUsd: 0, perDay: null });

const setEnv = (radar: string | null) => {
  process.env.SCRAPECREATORS_API_KEY = "cle-sc-de-test";
  if (radar === null) return;
  process.env.TIKHUB_API_KEY = "cle-th-de-test";
  process.env.RADAR_TIKHUB = radar;
};

function jobStateFor(over: Partial<JobState> = {}): JobState {
  return {
    budget: DEFAULT_BUDGET,
    cursor: 10,
    usage: [],
    day: "2026-11-20",
    month: "2026-11",
    balance: { remaining: 40_000, seenAt: NOW - 60_000, now: NOW, perDay: 1_000 },
    creditAlerted: {},
    recentUsage: [],
    th: freshTh(),
    thPrices: null,
    thPricesAt: NOW,
    fallbacksToday: 0,
    ...over,
  };
}
/** ScrapeCreators sous la réserve (1 000 crédits, CREDIT_RESERVE 1 500) ; TikHub, lui, a son solde. */
const SC_RESERVE = { balance: { remaining: 1_000, seenAt: NOW - 60_000, now: NOW, perDay: 1_000 } };

/** Le contexte d'une tâche, la prise du quota de replis jouée pour de vrai sur une base en mémoire (comme radar-tikhub-jobs). */
function taskCtx(answers: Parameters<typeof fakeActionCtx>[0]) {
  const w = writableDb({ radarSettings: [], radarUsage: [] });
  let serial: Promise<unknown> = Promise.resolve();
  return fakeActionCtx({
    "radar/radarSignals:claimFallback": (a) => {
      const p = serial.then(() => handlerOf(claimFallback)({ db: w.db }, a));
      serial = p.catch(() => undefined);
      return p;
    },
    ...answers,
  });
}

/** TikHub et ScrapeCreators simulés par leurs fixtures ; `over` remplace une route. */
function thAndSc(over: Partial<Record<string, [number, unknown] | ((url: string) => [number, unknown] | Error)>> = {}) {
  return fetchLog((url) => {
    const u = new URL(url);
    const o = over[u.pathname];
    if (o) return typeof o === "function" ? o(url) : o;
    if (u.pathname === TH_ROUTES.balance) return [200, synth().solde];
    if (u.pathname === TH_ROUTES.prices) return [200, fixture("tikhub/tarifs.json")];
    if (u.pathname === TH_ROUTES.video) return [200, fixture("tikhub/video.json")];
    if (u.pathname === TH_ROUTES.search) return [200, fixture("tikhub/reseau-motcle.json")];
    if (u.pathname === TH_ROUTES.profile) return [200, fixture("tikhub/profil.json")];
    if (u.pathname === TH_ROUTES.hashtagSearch) return [200, fixture("tikhub/hashtag-id.json")];
    if (u.pathname === TH_ROUTES.hashtagVideos) return [200, fixture("tikhub/hashtag-liste.json")];
    const sc = { success: true, credits_charged: 1, credits_remaining: 30_000 };
    if (u.pathname === "/v2/tiktok/video") return [200, { ...sc, aweme_detail: fixture("sc/video.json").aweme_detail }];
    if (u.pathname === "/v1/tiktok/search/keyword") return [200, { ...sc, search_item_list: fixture("sc/reseau-motcle.json").search_item_list }];
    if (u.pathname === "/v1/tiktok/search/hashtag") return [200, { ...sc, aweme_list: fixture("sc/profil.json").aweme_list, cursor: 20, has_more: 1 }];
    if (u.pathname === "/v3/tiktok/profile/videos") return [200, { ...sc, ...fixture("sc/profil.json") }];
    return [404, {}];
  });
}
const scHits = (net: ReturnType<typeof fetchLog>) => net.calls.filter((c) => c.url.includes("api.scrapecreators.com"));
const thHits = (net: ReturnType<typeof fetchLog>, route: string) => net.calls.filter((c) => new URL(c.url).pathname === route);

// ─── La courbe dans la voie (#25) ────────────────────────────────────────────────────────────────────────────────

/** La vidéo de la fixture TikHub (tikhub/video.json) : ses nombres exacts, ses abonnés à 0 (non mesurés chez TikHub). */
const TH_VIDEO = "7709816632507368725";
const TH_COUNTS: CurveCounts = (() => {
  const st = fixture("tikhub/video.json").data.aweme_detail.statistics;
  return { authorFans: 0, views: st.play_count, likes: st.digg_count, comments: st.comment_count, shares: st.share_count, saves: st.collect_count };
})();
/** Sa page publique, servie avec les mêmes nombres (et les vrais abonnés de l'auteur, 5 000). */
const curvePage = (id = TH_VIDEO, followerCount = 5_000): FreePage => ({
  ok: true,
  text: `<html><script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application/json">${JSON.stringify({
    __DEFAULT_SCOPE__: {
      "webapp.video-detail": {
        statusCode: 0,
        statusMsg: "",
        itemInfo: {
          itemStruct: {
            id,
            desc: "la légende",
            author: { id: "6930", uniqueId: "auteur_17" },
            authorStats: { followerCount },
            stats: { playCount: TH_COUNTS.views, diggCount: TH_COUNTS.likes, commentCount: TH_COUNTS.comments, shareCount: TH_COUNTS.shares, collectCount: String(TH_COUNTS.saves) },
          },
        },
      },
    },
  })}</script></html>`,
});
const curveDue = (ids: string[]) => ids.map((id, i) => ({ id: `radarSignals_${i}`, url: `https://www.tiktok.com/@auteur_17/video/${id}`, videoId: id, handle: "auteur_17" }));

/** Un passage de la voie : `ids` dus (autant que la part le permet), `pages` servies dans l'ordre ; `before` : avant la suite. */
async function lane(st: JobState, ids: string[], pages: FreePage[], net = thAndSc(), before?: () => void) {
  vi.stubGlobal("fetch", net.impl);
  const f = taskCtx({ "radar/radarSignals:dueCurve": (a) => curveDue(ids).slice(0, Number(a.limit)) });
  const served = [...pages];
  const b: BudgetState = jobBudget(st, tikhubJobs(), undefined, NOW);
  const out = await curveInLane(f.ctx as never, async () => served.shift() ?? { ok: false, kind: "suspect", reason: "HTTP 429" }, st, b, NOW, () => true, false);
  before?.();
  await drive(out.rest());
  return { net, f, rec: f.named("radar/radarSignals:recordRun").map((c) => c.args), applied: f.named("radar/radarSignals:applyCurve").map((c) => c.args) };
}

describe("Fusion — la courbe dans la voie paie chez le fournisseur réglé (curveInLane, #25)", () => {
  it("RADAR_TIKHUB=curve : la part payante de la voie part chez TikHub, jamais chez ScrapeCreators ; la dépense est en appels TikHub", async () => {
    setEnv("curve");
    const { net, rec, applied } = await lane(jobStateFor(), [TH_VIDEO], [curvePage()]);
    expect(thHits(net, TH_ROUTES.video)).toHaveLength(1);
    expect(scHits(net)).toHaveLength(0);
    expect(rec).toHaveLength(1);
    expect(rec[0]).toMatchObject({ poste: "curve", credits: 0, calls: 1, errors: 0, thCalls: 1, thUsd: 0.001 });
    // Les abonnés de TikHub (0, non mesurés) ne remplacent pas les abonnés connus (radarSignals.applyCurve).
    expect(applied).toEqual([{ id: "radarSignals_0", video: TH_COUNTS, now: NOW, fansUnknown: true }]);
  });

  it("la mesure côte à côte ne compte pas les abonnés à 0 de TikHub comme un écart : non mesurés, pas nuls — et rangée à part", async () => {
    setEnv("curve");
    const { rec } = await lane(jobStateFor(), [TH_VIDEO], [curvePage()]);
    // Les cinq compteurs de la vidéo sont ceux de la page, au même instant : « egal », sans les abonnés.
    expect(rec[0].measured).toEqual({ "egal-sans-abonnes": 1 });
    expect(rec[0].reasons).toEqual({ "egal-sans-abonnes": 1 });
    // La règle elle-même : sans le drapeau, les 5 000 abonnés de la page contre les 0 de TikHub font un écart.
    const page = { kind: "read" as const, counts: { ...TH_COUNTS, authorFans: 5_000 } };
    expect(curveMatch(page, TH_COUNTS)).toBe("ecart");
    expect(curveMatch(page, TH_COUNTS, true)).toBe("egal");
  });

  // Les nombres de radarUsage.measured doivent décider la bascule CURVE_FREE : chaque clé garde UNE définition. Un relevé
  // servi par TikHub ne compare que cinq compteurs (ses abonnés ne sont pas mesurés) : il est rangé à part
  // (`…-sans-abonnes`). Corrigé le 21/11/2026 : il tombait sous egal/proche/ecart, avec les mesures à six compteurs de
  // ScrapeCreators — une page aux abonnés en retard y comptait comme un accord, sans trace d'écart.
  it("une page aux abonnés en retard : « ecart » chez ScrapeCreators ; chez TikHub, une mesure à part, jamais un « egal »", async () => {
    const counts: CurveCounts = { authorFans: 106_123, views: 50_000, likes: 4_200, comments: 310, shares: 120, saves: 900 };
    const page = { kind: "read" as const, counts: { ...counts, authorFans: 98_000 } };
    const due = { videoId: TH_VIDEO, handle: "auteur_17" };
    const settle = (paid: CurvePaid) => settleCurve([{ due, verdict: page }], { paid: async () => paid, apply: async () => undefined }, { free: false, paidLeft: 5 });
    const sc = await settle({ ok: true, counts, credits: 1 });
    expect(sc.measured).toEqual({ ecart: 1 });
    expect(sc.gaps).toHaveLength(1);
    const th = await settle({ ok: true, counts: { ...counts, authorFans: 0 }, credits: 1, fansUnknown: true });
    expect(th.measured).toEqual({ "egal-sans-abonnes": 1 });
    expect(th.reasons).toEqual({ "egal-sans-abonnes": 1 });
    // Une vidéo partie pour la page et pour TikHub : rien de compté sans les abonnés, la mesure est la même partout.
    const gone = await settleCurve([{ due, verdict: { kind: "gone", why: "private" } }], { paid: async () => ({ ok: true, counts: null, credits: 1 }), apply: async () => undefined }, { free: false, paidLeft: 5 });
    expect(gone.measured).toEqual({ egal: 1 });
  });

  it("ScrapeCreators sous la réserve, TikHub ouvert : la voie prend la courbe et la paie chez TikHub (la réserve de ScrapeCreators ne la bloque pas)", async () => {
    setEnv("curve");
    const { net, f, rec } = await lane(jobStateFor(SC_RESERVE), [TH_VIDEO], [curvePage()]);
    const due = f.named("radar/radarSignals:dueCurve");
    expect(due).toHaveLength(1);
    expect(Number(due[0].args.limit)).toBeGreaterThan(0);
    expect(thHits(net, TH_ROUTES.video)).toHaveLength(1);
    expect(rec[0]).toMatchObject({ credits: 0, thCalls: 1, measured: { "egal-sans-abonnes": 1 } });
  });

  // Comme runCurve (radar-tikhub-jobs, « le coupe-circuit ne garde dues que les vidéos qu'il a empêché de partir ») :
  // une vidéo que TikHub a refusée sort de la courbe en fin de passage, que ces refus aient fait sauter le coupe-circuit
  // ou non. Corrigé le 20/11/2026 : en panne, elles restaient dues et revenaient en tête de la file à chaque passage.
  it("TikHub tombe en panne (3 échecs), repli fermé : les trois vidéos qu'il a refusées sortent de la courbe, la mesure dit « panne »", async () => {
    setEnv("curve");
    const ids = [TH_VIDEO, "7709774559007737110", "7709774559007737111"];
    const { net, rec, applied } = await lane(jobStateFor({ fallbacksToday: 100 }), ids, ids.map((id) => curvePage(id)), thAndSc({ [TH_ROUTES.video]: [500, synth().refus500] }));
    expect(thHits(net, TH_ROUTES.video).length).toBeGreaterThanOrEqual(3);
    expect(scHits(net)).toHaveLength(0);
    expect(applied.map((a) => [a.id, a.video])).toEqual([
      ["radarSignals_0", null],
      ["radarSignals_1", null],
      ["radarSignals_2", null],
    ]);
    expect(rec[0]).toMatchObject({ credits: 0, errors: 3, measured: { panne: 3 } });
  });

  it("un échec isolé de TikHub (pas de panne), repli fermé : la vidéo sort de la courbe en fin de passage, comme chez ScrapeCreators", async () => {
    setEnv("curve");
    let n = 0;
    const net = thAndSc({ [TH_ROUTES.video]: () => (n++ < 2 ? [500, synth().refus500] : [200, fixture("tikhub/video.json")]) });
    const ids = ["7709774559007737110", TH_VIDEO];
    const { applied, rec } = await lane(jobStateFor({ fallbacksToday: 100 }), ids, ids.map((id) => curvePage(id)), net);
    expect(applied.map((a) => [a.id, a.video === null ? null : "relevé"])).toEqual([
      ["radarSignals_1", "relevé"],
      ["radarSignals_0", null],
    ]);
    expect(rec[0]).toMatchObject({ errors: 1, measured: { panne: 1, "egal-sans-abonnes": 1 } });
  });

  it("la part de la voie est celle de TikHub : un millième de dollar, porte de repli fermée — une vidéo prise, relevée chez TikHub, aucune chez ScrapeCreators", async () => {
    setEnv("curve");
    // Un millième de dollar chez TikHub : une unité, un relevé (la part ScrapeCreators du passage, elle, en ferait 6).
    const st = jobStateFor({ fallbacksToday: 100, th: { ...freshTh(), paidUsd: 0.001, freeUsd: 0 } });
    const ids = [TH_VIDEO, "7709774559007737110"];
    const { net, f, rec, applied } = await lane(st, ids, ids.map((id) => curvePage(id)));
    expect(f.named("radar/radarSignals:dueCurve")[0].args.limit).toBe(1);
    expect(thHits(net, TH_ROUTES.video)).toHaveLength(1);
    expect(scHits(net)).toHaveLength(0);
    expect(applied.map((a) => a.id)).toEqual(["radarSignals_0"]);
    expect(rec[0]).toMatchObject({ calls: 1, errors: 0, thCalls: 1, measured: { "egal-sans-abonnes": 1 } });
    expect(rec[0].lastError).toBeUndefined();
  });

  it("l'échéance du passage TikHub (8 min) atteinte avant les relevés payants : ils restent dus, sans erreur comptée (comme le filet)", async () => {
    setEnv("curve");
    const { net, rec, applied } = await lane(jobStateFor({ fallbacksToday: 100 }), [TH_VIDEO], [curvePage()], thAndSc(), () => vi.setSystemTime(NOW + 7 * 60_000 + 45_000));
    expect(thHits(net, TH_ROUTES.video)).toHaveLength(0);
    expect(applied).toEqual([]);
    // Rien relevé, rien en erreur : le passage n'écrit rien (ni erreur, ni « TikHub : plus le temps »).
    expect(rec).toEqual([]);
  });

  it("sans réglage : le relevé payant de la voie part chez ScrapeCreators, comme sur main, sans aucun champ TikHub", async () => {
    setEnv(null);
    const { net, rec } = await lane(jobStateFor({ th: null }), [TH_VIDEO], [curvePage()]);
    expect(scHits(net).map((c) => new URL(c.url).pathname)).toEqual(["/v2/tiktok/video"]);
    expect(net.calls.some((c) => c.url.includes("tikhub"))).toBe(false);
    expect(Object.keys(rec[0]).filter((k) => k.startsWith("th"))).toEqual([]);
    expect(rec[0]).toMatchObject({ credits: 1, calls: 1 });
  });
});

describe("Fusion — le filet de la courbe (runCurve) : le motif « retard » en unités, chez TikHub aussi", () => {
  it("deux relevés chez TikHub : retard 2 (des appels TikHub), crédits 0", async () => {
    setEnv("curve");
    vi.stubGlobal("fetch", thAndSc().impl);
    const f = taskCtx({
      "radar/radarSignals:jobState": () => jobStateFor(),
      "radar/radarSignals:dueCurve": () => curveDue([TH_VIDEO, "7709774559007737110"]),
    });
    await drive(handlerOf(runCurve)(f.ctx, {}) as Promise<unknown>);
    const rec = f.named("radar/radarSignals:recordRun")[0].args;
    expect(rec).toMatchObject({ credits: 0, thCalls: 2, reasons: { retard: 2 } });
    expect(f.named("radar/radarSignals:dueCurve")[0].args).toMatchObject({ net: true });
  });
});

// ─── La réserve des relevés (#26, brique 8) ──────────────────────────────────────────────────────────────────────

describe("Fusion — la réserve des relevés est celle du fournisseur qui les sert (radarProviders.reserveFor, brique 8)", () => {
  const state = (reserveReached: boolean, thTier: BudgetState["th"]["tier"]) => ({ reserveReached, th: { ...budgetState(DEFAULT_BUDGET, []).th, tier: thTier } });
  const router = (on: boolean, room: number) => ({ on, fallbackRoom: () => room });
  const gate = (sc: number) => ({ limit: (p: "sc" | "tikhub") => (p === "sc" ? sc : 0) });

  it("ScrapeCreators (ou sans bascule) : sa réserve, au bit près", () => {
    for (const r of [true, false]) {
      expect(reserveFor(state(r, "normal"), "sc", router(true, 100), gate(10))).toBe(r);
      expect(reserveFor(state(r, "reserve"), "tikhub", router(false, 0), gate(0))).toBe(r);
    }
  });

  it("TikHub sert : la réserve de ScrapeCreators ne compte pas ; celle de TikHub, seulement si la porte de repli ne peut rien faire partir", () => {
    expect(reserveFor(state(true, "normal"), "tikhub", router(true, 0), gate(0))).toBe(false);
    expect(reserveFor(state(false, "reserve"), "tikhub", router(true, 0), gate(10))).toBe(true);
    expect(reserveFor(state(false, "reserve"), "tikhub", router(true, 5), gate(0))).toBe(true);
    expect(reserveFor(state(false, "reserve"), "tikhub", router(true, 5), gate(10))).toBe(false);
    expect(reserveFor(state(false, "economie"), "tikhub", router(true, 0), gate(0))).toBe(false);
  });

  it("TikHub sert, plafond du jour atteint (solde au-dessus) : comme sa réserve — les ratés attendent si la porte de repli ne peut rien faire partir", () => {
    const capped = { reserveReached: false, th: { ...budgetState(DEFAULT_BUDGET, []).th, tier: "normal" as const, dayLeft: 0 } };
    expect(reserveFor(capped, "tikhub", router(true, 0), gate(10))).toBe(true);
    expect(reserveFor(capped, "tikhub", router(true, 5), gate(10))).toBe(false);
    expect(reserveFor({ ...capped, th: { ...capped.th, dayLeft: 1 } }, "tikhub", router(true, 0), gate(0))).toBe(false);
    expect(reserveFor({ ...capped, reserveReached: true }, "sc", router(true, 0), gate(0))).toBe(true);
    expect(reserveFor({ ...capped, reserveReached: false }, "sc", router(true, 0), gate(0))).toBe(false);
  });

  const account = (handle: string) => ({ id: `radarTracked_${handle}`, handle, located: false, first: false, dueAt: NOW - 2 * 3_600_000 });
  function reads(st: JobState, due: ReturnType<typeof account>[]) {
    const net = thAndSc();
    // Les pages publiques de TikTok refusent (500) : chaque compte est un raté de la voie gratuite.
    const fetch = (async (input: string | URL | Request, init?: RequestInit) =>
      String(input).includes("www.tiktok.com") ? new Response("refus", { status: 500 }) : net.impl(input, init)) as typeof globalThis.fetch;
    vi.stubGlobal("fetch", fetch);
    const f = taskCtx({
      "radar/radarSignals:jobState": () => st,
      "radar/radarNetworks:claimAccountsLease": () => true,
      "radar/radarNetworks:releaseAccountsLease": () => false,
      "radar/radarNetworks:appRules": () => [],
      "radar/radarNetworks:dueAccounts": () => ({ due, parked: [] }),
      "radar/radarNetworks:probeAccount": () => account("sonde"),
      "radar/radarSignals:dueCurve": () => [],
    });
    return { net, f, done: drive(handlerOf(runAccountReads)(f.ctx, {}) as Promise<unknown>) };
  }
  const deferred = (f: ReturnType<typeof fakeActionCtx>) =>
    f.named("radar/radarNetworks:deferAccounts").filter((c) => c.args.until === NOW + RESERVE_MISS_WAIT_MS).flatMap((c) => c.args.ids as string[]);

  it("relevés chez TikHub, ScrapeCreators sous la réserve : les ratés ne vont pas attendre la sonde, ils sont relevés chez TikHub", async () => {
    setEnv("tiktok");
    const { net, f, done } = reads(jobStateFor(SC_RESERVE), [account("a1"), account("a2")]);
    await done;
    expect(deferred(f)).toEqual([]);
    expect(thHits(net, TH_ROUTES.profile).map((c) => new URL(c.url).searchParams.get("unique_id"))).toEqual(["a1", "a2"]);
  });

  it("relevés chez TikHub, TikHub à sec et porte de repli fermée : les ratés attendent (brique 8), rien ne part", async () => {
    setEnv("tiktok");
    const st = jobStateFor({ fallbacksToday: 100, th: { ...freshTh(), paidUsd: 0, freeUsd: 0 } });
    const { net, f, done } = reads(st, [account("a1"), account("a2")]);
    await done;
    expect(deferred(f).sort()).toEqual(["radarTracked_a1", "radarTracked_a2"]);
    expect(thHits(net, TH_ROUTES.profile)).toHaveLength(0);
    expect(scHits(net)).toHaveLength(0);
  });

  it("relevés chez TikHub, plafond du jour atteint avec 20 $ en compte, porte de repli fermée : les ratés attendent (brique 8) au lieu d'être relus en tête de voie jusqu'à minuit", async () => {
    setEnv("tiktok");
    const st = jobStateFor({
      fallbacksToday: 100,
      th: { ...freshTh(), paidUsd: 20 },
      usage: [{ poste: "network", credits: 0, day: "2026-11-20", thCalls: 5_000, thUsd: 5 }],
    });
    const { net, f, done } = reads(st, [account("a1"), account("a2")]);
    await done;
    expect(deferred(f).sort()).toEqual(["radarTracked_a1", "radarTracked_a2"]);
    expect(thHits(net, TH_ROUTES.profile)).toHaveLength(0);
    expect(scHits(net)).toHaveLength(0);
  });
});

// ─── Le tri des hashtags (#24) ───────────────────────────────────────────────────────────────────────────────────

describe("Fusion — le tri des hashtags passe AVANT le choix du fournisseur (runNetworkSearch, #24)", () => {
  type TagCount = { tag: string; videos?: number; paid?: number; at: number };
  const focus = (tagCounts: TagCount[] = [], over: Record<string, unknown> = {}) => ({
    id: "radarApps_focus",
    name: "Focus Town",
    searches: ["#focustown"],
    rival: true,
    deep: false,
    never: false,
    rule: { strong: ["focus town", "focustown"], weak: [], context: [] },
    tagCounts,
    ...over,
  });
  /** `embed` : ce que sert la page publique du hashtag (/embed/tag/focustown). */
  function run(apps: ReturnType<typeof focus>[], st: JobState, embed: [number, string], net = thAndSc()) {
    const fetch = (async (input: string | URL | Request, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("www.tiktok.com/embed/tag/")) {
        net.calls.push({ url, key: null, auth: null });
        return new Response(embed[1], { status: embed[0] });
      }
      return net.impl(input, init);
    }) as typeof globalThis.fetch;
    vi.stubGlobal("fetch", fetch);
    const f = taskCtx({
      "radar/radarSignals:jobState": () => st,
      "radar/radarNetworks:dueApps": () => apps,
      "radar/radarNetworks:attachFromSearch": () => ({ attached: 1, signals: 0, updated: 0 }),
      "radar/radarNetworks:hashtagIdOf": () => null,
    });
    return { net, f, done: drive(handlerOf(runNetworkSearch)(f.ctx, {}) as Promise<unknown>) };
  }
  const saved = (f: ReturnType<typeof fakeActionCtx>) => {
    const out: Record<string, number> = {};
    for (const c of f.named("radar/radarSignals:recordRun")) for (const [k, n] of Object.entries((c.args.saved as Record<string, number>) ?? {})) out[k] = (out[k] ?? 0) + n;
    return out;
  };

  it("hashtag absent sur sa page, payé vide il y a un jour : ses deux passes ne paient nulle part — ni son identifiant ni sa liste chez TikHub, ni ScrapeCreators — et saved.hashtag les compte", async () => {
    setEnv("network");
    const { net, f, done } = run([focus([{ tag: "focustown", paid: 0, at: NOW - 86_400_000 }])], jobStateFor(), [404, ""]);
    await done;
    expect(net.calls.filter((c) => c.url.includes("/embed/tag/"))).toHaveLength(1);
    expect(thHits(net, TH_ROUTES.hashtagSearch)).toHaveLength(0);
    expect(thHits(net, TH_ROUTES.hashtagVideos)).toHaveLength(0);
    expect(scHits(net)).toHaveLength(0);
    expect(saved(f)).toEqual({ hashtag: 2 });
  });

  it("le même hashtag, jamais payé : il paie (« unconfirmed »), sa passe sans région chez TikHub ; la recherche réussie est retenue avec ce qu'elle a rendu", async () => {
    setEnv("network");
    const net = thAndSc({ [TH_ROUTES.hashtagVideos]: [200, { ...fixture("tikhub/hashtag-liste.json"), data: { ...fixture("tikhub/hashtag-liste.json").data, has_more: 0 } }] });
    const { f, done } = run([focus()], jobStateFor(), [404, ""], net);
    await done;
    expect(thHits(net, TH_ROUTES.hashtagSearch)).toHaveLength(1);
    expect(thHits(net, TH_ROUTES.hashtagVideos)).toHaveLength(1);
    expect(saved(f)).toEqual({});
    const listed = (fixture("tikhub/hashtag-liste.json").data.aweme_list as unknown[]).length;
    const tags = f.named("radar/radarNetworks:finishNetworkSearch")[0].args.tags as { tag: string; paid: number; absent: boolean }[];
    // Ses deux passes (sans région chez TikHub, FR chez ScrapeCreators) : ce qu'elles ont rendu, ENSEMBLE — les vidéos
    // de la page TikHub plus celles des pages ScrapeCreators, à l'unité. Corrigé le 20/11/2026 : « au moins les vidéos
    // de TikHub » était tenu par la seule passe ScrapeCreators (3 pages de 3 vidéos) ; une page servie par TikHub qui
    // ne comptait plus aurait enregistré le hashtag « payé » sans ses vidéos.
    const scPages = scHits(net).filter((c) => new URL(c.url).pathname === "/v1/tiktok/search/hashtag").length;
    const perScPage = (fixture("sc/profil.json").aweme_list as unknown[]).length;
    expect(tags.map((t) => [t.tag, t.absent])).toEqual([["focustown", true]]);
    expect(scPages).toBeGreaterThan(0);
    expect(tags[0].paid).toBe(listed + scPages * perScPage);
  });

  it("passe chez TikHub servie en repli et coupée après sa première page : le hashtag n'est pas retenu comme payé au bout", async () => {
    setEnv("network");
    // Part TikHub épuisée (solde à 0) : la première page du hashtag sans région part en repli chez ScrapeCreators, qui
    // annonce une suite ; la pagination ne se poursuit pas chez l'autre fournisseur.
    const { f, done } = run([focus()], jobStateFor({ th: { ...freshTh(), paidUsd: 0, freeUsd: 0 } }), [404, ""]);
    await done;
    const fin = f.named("radar/radarNetworks:finishNetworkSearch")[0].args;
    expect(fin).toMatchObject({ outcome: "done" });
    expect(fin.tags).toBeUndefined();
  });

  // Le coupe-circuit de TikHub saute sur les refus des mots-clés de l'app, porte de repli fermée : les passes du hashtag
  // destinées à TikHub sont empêchées de partir, sans aucun appel. Corrigé le 21/11/2026 : chacune comptait comme une
  // passe payée allée au bout (notePaidPass), le hashtag était enregistré « payé, 0 vidéo » (tagCounts) — un état non
  // mesuré rangé comme nul, sur lequel la brique #24 sautait ensuite ses deux passes (« absent ») pendant 21 jours.
  // Trois mots-clés chez TikHub avant le hashtag : sous `network`, seule leur passe FR y part.
  const breakerCases: [string, string, string[], number][] = [
    ["network-all : ses deux passes chez TikHub", "network-all", ["focus town", "focus app"], 0],
    ["network : la passe sans région chez TikHub, la passe FR payée chez ScrapeCreators", "network", ["focus town", "focus app", "focustown app"], 1],
  ];
  for (const [nom, radar, keywords, scTagPasses] of breakerCases) {
    it(`coupe-circuit sauté sur les mots-clés, porte de repli fermée (${nom}) : le hashtag jamais payé n'est pas enregistré « payé vide »`, async () => {
      setEnv(radar);
      const net = thAndSc({ [TH_ROUTES.search]: [500, synth().refus500] });
      const app = focus([], { searches: [...keywords, "#focustown"] });
      const { f, done } = run([app], jobStateFor({ fallbacksToday: 100 }), [404, ""], net);
      await done;
      // Aucun appel n'est parti pour les passes du hashtag chez TikHub (ni son identifiant, ni sa liste).
      expect(thHits(net, TH_ROUTES.hashtagSearch)).toHaveLength(0);
      expect(thHits(net, TH_ROUTES.hashtagVideos)).toHaveLength(0);
      expect(new Set(scHits(net).filter((c) => new URL(c.url).pathname === "/v1/tiktok/search/hashtag").map((c) => new URL(c.url).searchParams.get("region"))).size).toBe(scTagPasses);
      const fin = f.named("radar/radarNetworks:finishNetworkSearch").map((c) => c.args);
      // Ses refus sont conclus (le coupe-circuit ne garde dues que les apps qu'il a empêchées de partir).
      expect(fin.map((a) => a.searched)).toEqual([true]);
      // Rien n'est retenu de ce hashtag : ni « payé », ni « 0 vidéo ».
      expect(fin[0].tags).toBeUndefined();
      expect(saved(f)).toEqual({});
    });
  }
});

// ─── Le trou mesuré chez TikHub (#26, brique 4) ──────────────────────────────────────────────────────────────────

describe("Fusion — la mesure du trou (brique 4) quand le relevé payant est servi par TikHub", () => {
  it("le trou dont la page a été lue est payé chez TikHub, et l'accord des deux est compté dans radarUsage.measured", async () => {
    setEnv("tiktok");
    const page1 = fixture("tikhub/profil.json").data as { aweme_list: { aweme_id: string; create_time: number }[] };
    const oldest = Math.min(...page1.aweme_list.map((v) => v.create_time)) * 1_000;
    // La liste publique porte une vidéo connue, plus vieille que la dernière connue : elle « remonte », la page de la
    // dernière est lue (404 : « absente », non concluante) et le payant part. Sa première page passe la date de la
    // dernière connue (sa vidéo la plus ancienne est d'avant) : le payant conclut.
    const newest = { videoId: "7700000000000000009", publishedAt: oldest + 1 };
    const listedId = "7600000000000000001";
    const profile = `<html><script>window.__data={"userInfo":${JSON.stringify({ uniqueId: "troue", followerCount: 10, signature: "", privateAccount: false })},"videoList":${JSON.stringify([{ id: listedId, desc: "", playCount: 5 }])}}</script></html>`;
    const net = thAndSc();
    const fetch = (async (input: string | URL | Request, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("www.tiktok.com")) return url.includes(`/video/${newest.videoId}`) ? new Response("", { status: 404 }) : new Response(profile, { status: 200 });
      return net.impl(input, init);
    }) as typeof globalThis.fetch;
    vi.stubGlobal("fetch", fetch);
    const account = { id: "radarTracked_troue", handle: "troue", located: true, first: false, dueAt: NOW - 2 * 3_600_000 };
    const f = taskCtx({
      "radar/radarSignals:jobState": () => jobStateFor(),
      "radar/radarNetworks:claimAccountsLease": () => true,
      "radar/radarNetworks:releaseAccountsLease": () => false,
      "radar/radarNetworks:appRules": () => [],
      "radar/radarNetworks:dueAccounts": () => ({ due: [account], parked: [] }),
      "radar/radarNetworks:probeAccount": () => account,
      "radar/radarSignals:dueCurve": () => [],
      "radar/radarNetworks:freeNewest": () => newest,
      "radar/radarNetworks:freeKnown": () => [{ videoId: listedId, publishedAt: newest.publishedAt - 86_400_000 }],
    });
    await drive(handlerOf(runAccountReads)(f.ctx, {}) as Promise<unknown>);
    expect(thHits(net, TH_ROUTES.profile).length).toBeGreaterThanOrEqual(1);
    expect(scHits(net)).toHaveLength(0);
    const measured: Record<string, number> = {};
    for (const c of f.named("radar/radarSignals:recordRun")) for (const [k, n] of Object.entries((c.args.measured as Record<string, number>) ?? {})) measured[k] = (measured[k] ?? 0) + n;
    expect(Object.keys(measured)).toHaveLength(1);
    expect(Object.keys(measured)[0]).toMatch(/^trou-(?:paye|manque):absente$/);
    expect(Object.values(measured)).toEqual([1]);
    const reasons: Record<string, number> = {};
    for (const c of f.named("radar/radarSignals:recordRun")) for (const [k, n] of Object.entries((c.args.reasons as Record<string, number>) ?? {})) reasons[k] = (reasons[k] ?? 0) + n;
    expect(reasons.trou).toBeGreaterThanOrEqual(1);
  });
});

// ─── Les transcriptions (#19) ────────────────────────────────────────────────────────────────────────────────────

describe("Fusion — les transcriptions restent chez ScrapeCreators, jugées sur le budget commun (radarProviders.jobBudget, #19)", () => {
  // Relevés : 2 000 par jour (60 000 au mois), 49 400 payés chez ScrapeCreators (92,87 $ sur un plafond de 110 $ : 84 %) ;
  // transcriptions 10 par jour ; le reste éteint. Aux fournisseurs réglés (RADAR_TIKHUB=tiktok), la projection
  // (92,87 + 10 600 relevés à 0,001 $ + 300 transcriptions à 0,00188 $ = 104,03 $) passe sous le plafond : rien n'est
  // coupé. Au prix de ScrapeCreators partout (113,36 $), les transcriptions seraient coupées : la part payante à 0.
  const budget = {
    ...DEFAULT_BUDGET,
    capUsd: 110,
    postes: DEFAULT_BUDGET.postes.map((p) => (p.key === "tiktok" ? { ...p, qty: 2_000 } : p.key === "transcript" ? { ...p, qty: 10, on: true } : { ...p, on: false })),
  };
  const usage = Array.from({ length: 19 }, (_, i) => ({ poste: "tiktok", credits: 2_600, day: `2026-11-${String(i + 1).padStart(2, "0")}` }));

  it("RADAR_TIKHUB=tiktok : la part payante des transcriptions n'est pas coupée par une projection au prix ScrapeCreators", async () => {
    setEnv("tiktok");
    vi.stubGlobal("fetch", thAndSc().impl);
    const f = taskCtx({
      "radar/radarSignals:jobState": () => jobStateFor({ budget, usage, recentUsage: usage.slice(-4) }),
      "radar/radarSources:dueTranscripts": () => [],
    });
    await drive(handlerOf(runTranscripts)(f.ctx, {}) as Promise<unknown>);
    // 300 au mois = 10 par jour, 12 passages : 1 par passage ; la voie gratuite garde sa file (#19).
    expect(f.named("radar/radarSources:dueTranscripts")[0].args).toMatchObject({ limit: 1, freeLimit: 40 });
  });

  it("sans réglage : le budget de ScrapeCreators seul, comme sur main — la même projection coupe les transcriptions payantes, pas la voie gratuite", async () => {
    setEnv(null);
    vi.stubGlobal("fetch", thAndSc().impl);
    const f = taskCtx({
      "radar/radarSignals:jobState": () => jobStateFor({ budget, usage, recentUsage: usage.slice(-4), th: null }),
      "radar/radarSources:dueTranscripts": () => [],
    });
    await drive(handlerOf(runTranscripts)(f.ctx, {}) as Promise<unknown>);
    expect(f.named("radar/radarSources:dueTranscripts")[0].args).toMatchObject({ limit: 0, freeLimit: 40 });
  });
});
