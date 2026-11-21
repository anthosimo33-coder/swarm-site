import fs from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { applyCurve, claimFallback, getRadarBudgetCore, jobState, recordRun, runCurve, runDiscovery, upsertDiscovered, type JobState } from "../../convex/radar/radarSignals";
import { CREDIT_RESERVE, DEFAULT_BUDGET, POSTE_KEYS, SC_PRICE_PER_CREDIT, envelopeUsdAt, nextQueries, plannedUsd } from "../../convex/radar/radarSignalsMath";
import { DISCOVERY_ROTATION } from "../../convex/radar/radarDiscoveryQueries";
import { FREE_BREAKER } from "../../convex/radar/radarFreeMath";
import { TH_ROUTES } from "../../convex/radar/tikhubApi";
import { runNaming } from "../../convex/radar/radarNaming";
import { ACCOUNT_READ_POOL, attachFromSearch, runAccountReads, runNetworkSearch } from "../../convex/radar/radarNetworks";
import { parseScVideo } from "../../convex/radar/radarSignalsMath";
import { DEEP_PAGES, networkQueueOrder } from "../../convex/radar/radarNetworkMath";
import { jobBudget, tikhubJobs } from "../../convex/radar/radarProviders";
import { drive, fakeActionCtx, fetchLog, handlerOf, writableDb } from "./action-ctx";
import type { MemoryDoc } from "./convex-memory-db";

/**
 * Les tâches du Radar avec TikHub (20/11/2026) : la comptabilité (recordRun), ce que la requête du budget expose,
 * et — plus bas — chaque tâche branchée, sur un faux contexte d'action qui note tout ce qu'elle appelle.
 */

const NOW = Date.parse("2026-11-20T12:00:00Z");
const ENV_KEYS = ["TIKHUB_API_KEY", "RADAR_TIKHUB", "SCRAPECREATORS_API_KEY", "RADAR_TIKHUB_USD_PER_DAY"] as const;
let savedEnv: Record<string, string | undefined>;
beforeEach(() => {
  savedEnv = Object.fromEntries(ENV_KEYS.map((k) => [k, process.env[k]]));
  for (const k of ENV_KEYS) delete process.env[k];
  vi.useFakeTimers({ toFake: ["Date", "setTimeout", "clearTimeout"] });
  vi.setSystemTime(NOW);
  vi.spyOn(console, "error").mockImplementation(() => undefined);
  vi.spyOn(console, "warn").mockImplementation(() => undefined);
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

/**
 * Le faux contexte d'une tâche, avec la prise du quota de replis (radarSignals.claimFallback) jouée pour de vrai sur
 * une base en mémoire à part, mise en série comme Convex met ses mutations.
 */
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

const settingsDoc = (extra: Record<string, unknown> = {}): MemoryDoc => ({
  _id: "radarSettings_global",
  _creationTime: 1,
  key: "global",
  capUsd: DEFAULT_BUDGET.capUsd,
  postes: DEFAULT_BUDGET.postes,
  cutOrder: DEFAULT_BUDGET.cutOrder,
  alert80: true,
  budgetVersion: 10,
  discoveryCursor: 0,
  curveAdmitted: 0,
  updatedAt: 0,
  ...extra,
});

const record = (w: ReturnType<typeof writableDb>, args: Record<string, unknown>) => handlerOf(recordRun)({ db: w.db }, { now: NOW, errors: 0, ...args });

describe("recordRun : la dépense TikHub", () => {
  it("cumule appels, dollars, appels inconnus et replis par (jour, poste)", async () => {
    const w = writableDb({ radarSettings: [settingsDoc()], radarUsage: [] });
    await record(w, { poste: "tiktok", credits: 2, calls: 12, thCalls: 10, thUsd: 0.01, thUnknown: 1, thFallbacks: 2 });
    await record(w, { poste: "tiktok", credits: 0, calls: 5, thCalls: 5, thUsd: 0.005 });
    await record(w, { poste: "curve", credits: 0, calls: 3, thCalls: 3, thUsd: 0.003 });
    const rows = w.tables.radarUsage.map(({ _id, _creationTime, ...r }) => r);
    expect(rows).toEqual([
      { day: "2026-11-20", month: "2026-11", poste: "tiktok", credits: 2, calls: 17, errors: 0, thCalls: 15, thUsd: 0.015, thUnknown: 1, thFallbacks: 2 },
      { day: "2026-11-20", month: "2026-11", poste: "curve", credits: 0, calls: 3, errors: 0, thCalls: 3, thUsd: 0.003 },
    ]);
  });

  it("un passage TikHub sans appel compté (appels inconnus seuls) écrit quand même sa ligne", async () => {
    const w = writableDb({ radarSettings: [settingsDoc()], radarUsage: [] });
    await record(w, { poste: "network", credits: 0, calls: 0, thUnknown: 2 });
    expect(w.tables.radarUsage).toHaveLength(1);
    expect(w.tables.radarUsage[0].thUnknown).toBe(2);
  });

  it("sans champ TikHub, la ligne et les réglages s'écrivent comme avant (aucune clé th)", async () => {
    const w = writableDb({ radarSettings: [settingsDoc()], radarUsage: [] });
    await record(w, { poste: "tiktok", credits: 3, calls: 3, creditsRemaining: 9_000, reasons: { premier: 3 } });
    await record(w, { poste: "tiktok", credits: 1, calls: 1 });
    const keys = (o: Record<string, unknown>) => Object.keys(o).sort();
    expect(w.writes.map((x) => [x.op, x.table, keys(x.value ?? {})])).toEqual([
      ["insert", "radarUsage", ["calls", "credits", "day", "errors", "month", "poste", "reasons"]],
      ["patch", "radarSettings", ["creditsRemaining", "creditsSeenAt", "lastAccountsAt", "lastError"]],
      ["patch", "radarUsage", ["calls", "credits", "errors", "reasons"]],
      ["patch", "radarSettings", ["lastAccountsAt", "lastError"]],
    ]);
  });

  it("le solde TikHub : rangé seulement s'il est plus frais ; la dépense depuis la lecture s'ajoute, puis repart de ce qui suit la lecture", async () => {
    const w = writableDb({ radarSettings: [settingsDoc({ thBalanceUsd: 5, thFreeUsd: 0.02, thSeenAt: NOW - 1_000, thSpentSinceUsd: 0.1 })], radarUsage: [] });
    const s = () => w.tables.radarSettings[0];
    // Les deux premiers lots sont écrits une demi-seconde avant la lecture plus fraîche (NOW) : elle les compte déjà.
    vi.setSystemTime(NOW - 500);
    // Un lot de 0,05 $ + 2 appels inconnus (0,002 $) : la dépense depuis la lecture monte.
    await record(w, { poste: "tiktok", credits: 0, calls: 52, thCalls: 50, thUsd: 0.05, thUnknown: 2 });
    expect(s().thSpentSinceUsd).toBeCloseTo(0.152, 9);
    // Un solde lu AVANT le rangé : ignoré (la dépense du lot compte quand même).
    await record(w, { poste: "tiktok", credits: 0, calls: 1, thCalls: 1, thUsd: 0.001, thBalanceUsd: 9, thFreeUsd: 0, thSeenAt: NOW - 5_000, thSpentAfterUsd: 0.001 });
    expect(s().thBalanceUsd).toBe(5);
    expect(s().thSpentSinceUsd).toBeCloseTo(0.153, 9);
    // Plus frais : il remplace, et la dépense « depuis » repart de ce que le lot a payé APRÈS la lecture.
    vi.setSystemTime(NOW);
    await record(w, { poste: "tiktok", credits: 0, calls: 10, thCalls: 10, thUsd: 0.01, thBalanceUsd: 4.8, thFreeUsd: 0, thSeenAt: NOW, thSpentAfterUsd: 0.004 });
    expect([s().thBalanceUsd, s().thFreeUsd, s().thSeenAt]).toEqual([4.8, 0, NOW]);
    expect(s().thSpentSinceUsd).toBeCloseTo(0.004, 9);
  });

  // Un passage relit le solde à 14 h 40 et ne l'écrit qu'à 14 h 50 ; entre-temps, à 14 h 45, un autre passage a écrit
  // 0,30 $ de dépense (faite après 14 h 40). Corrigé le 20/11/2026 : l'écriture du solde lu remettait la dépense
  // « depuis » à la seule dépense du passage qui l'écrivait (0,02 $) : les 0,30 $ des autres disparaissaient du solde
  // estimé, qui n'était plus une borne basse (réserve entamée, paliers jugés trop tard).
  it("un solde lu plus frais n'efface pas ce que les autres passages ont écrit après la lecture ; ce qui a été écrit avant y est compté", async () => {
    const at = (hhmm: string) => Date.parse(`2026-11-20T${hhmm}:00Z`);
    const w = writableDb({ radarSettings: [settingsDoc({ thBalanceUsd: 10.5, thFreeUsd: 0, thSeenAt: at("14:20"), thSpentSinceUsd: 0 })], radarUsage: [] });
    const s = () => w.tables.radarSettings[0];
    // 14 h 30 : les relevés écrivent 0,10 $ (dépensés avant la lecture de 14 h 40, qui les compte déjà).
    vi.setSystemTime(at("14:30"));
    await record(w, { poste: "tiktok", credits: 0, calls: 100, thCalls: 100, thUsd: 0.1, now: at("14:25") });
    // 14 h 45 : les relevés écrivent 0,30 $ de plus (dépensés après 14 h 40).
    vi.setSystemTime(at("14:45"));
    await record(w, { poste: "tiktok", credits: 0, calls: 300, thCalls: 300, thUsd: 0.3, now: at("14:35") });
    expect(s().thSpentSinceUsd).toBeCloseTo(0.4, 9);
    // 14 h 50 : la courbe écrit le solde lu à 14 h 40 (10 $) et sa dépense, toute faite après la lecture.
    vi.setSystemTime(at("14:50"));
    await record(w, { poste: "curve", credits: 0, calls: 20, thCalls: 20, thUsd: 0.02, thBalanceUsd: 10, thFreeUsd: 0, thSeenAt: at("14:40"), thSpentAfterUsd: 0.02, now: at("14:40") });
    expect([s().thBalanceUsd, s().thSeenAt]).toEqual([10, at("14:40")]);
    expect(s().thSpentSinceUsd).toBeCloseTo(0.32, 9);
    // Une lecture plus fraîche encore (15 h), écrite à 15 h 01 : tout ce qui précède a été écrit avant elle.
    vi.setSystemTime(at("15:01"));
    await record(w, { poste: "tiktok", credits: 0, calls: 1, thCalls: 1, thUsd: 0.001, thBalanceUsd: 9.6, thFreeUsd: 0, thSeenAt: at("15:00"), thSpentAfterUsd: 0.001, now: at("14:55") });
    expect(s().thSpentSinceUsd).toBeCloseTo(0.001, 9);
  });

  // Le cas courant : un passage relit le solde à son ouverture (il a plus d'une minute), puis ne dépense rien chez TikHub
  // (aucune vidéo due, pas de part). Ajouté le 20/11/2026 : seul un passage qui dépensait était testé — le mutant
  // `if (lot > 0)` (sans `|| fresher`) rangeait le solde frais sans retirer les lots qu'il compte déjà : la dépense
  // était retranchée deux fois du solde estimé (/admin, paliers, postes coupés à tort).
  it("un solde lu plus frais, écrit par un passage qui n'a rien dépensé chez TikHub : les lots d'avant la lecture sont retirés, ceux d'après restent", async () => {
    const at = (hhmm: string) => Date.parse(`2026-11-20T${hhmm}:00Z`);
    const w = writableDb({ radarSettings: [settingsDoc({ thBalanceUsd: 10.5, thFreeUsd: 0, thSeenAt: at("14:20"), thSpentSinceUsd: 0 })], radarUsage: [] });
    const s = () => w.tables.radarSettings[0];
    vi.setSystemTime(at("14:30"));
    await record(w, { poste: "tiktok", credits: 0, calls: 100, thCalls: 100, thUsd: 0.1, now: at("14:25") });
    vi.setSystemTime(at("14:45"));
    await record(w, { poste: "tiktok", credits: 0, calls: 300, thCalls: 300, thUsd: 0.3, now: at("14:35") });
    expect(s().thSpentSinceUsd).toBeCloseTo(0.4, 9);
    // 14 h 50 : la courbe écrit le solde lu à 14 h 40 (10,40 $ : les 0,10 $ de 14 h 30 y sont déjà retranchés), sans
    // aucun appel TikHub.
    vi.setSystemTime(at("14:50"));
    await record(w, { poste: "curve", credits: 0, calls: 0, thBalanceUsd: 10.4, thFreeUsd: 0, thSeenAt: at("14:40"), thSpentAfterUsd: 0, now: at("14:40") });
    expect([s().thBalanceUsd, s().thSeenAt]).toEqual([10.4, at("14:40")]);
    expect(s().thSpentLots).toEqual([{ at: at("14:45"), usd: 0.3 }]);
    expect(s().thSpentSinceUsd).toBeCloseTo(0.3, 9);
    expect(w.tables.radarUsage.map((r) => r.poste)).toEqual(["tiktok"]);
  });

  it("un refus « solde insuffisant », la dernière erreur et les tarifs sont rangés", async () => {
    const w = writableDb({ radarSettings: [settingsDoc()], radarUsage: [] });
    const prices = [{ route: "/api/v1/tiktok/app/v3/fetch_user_post_videos", usd: 0.001, free: false }];
    await record(w, { poste: "curve", credits: 0, calls: 0, thDryRoute: "/api/v1/tiktok/app/v3/fetch_one_video_by_share_url", thLastError: "HTTP 402 …", thPrices: prices });
    const s = w.tables.radarSettings[0];
    expect([s.thDryAt, s.thDryRoute, s.thLastError, s.thPrices, s.thPricesAt]).toEqual([NOW, "/api/v1/tiktok/app/v3/fetch_one_video_by_share_url", "HTTP 402 …", prices, NOW]);
    expect(w.tables.radarUsage).toHaveLength(0);
  });
});

describe("jobState : ce que les tâches reçoivent", () => {
  // 23 h 30 UTC le 20/11 : déjà le 21/11 à Paris. Le jour des replis est celui de Paris (celui des lignes d'usage).
  const LATE = Date.parse("2026-11-20T23:30:00Z");
  const prices = [{ route: TH_ROUTES.profile, usd: 0.001, free: false }];
  const row = (id: string, day: string, poste: string, extra: Record<string, unknown> = {}): MemoryDoc => ({ _id: id, _creationTime: 1, day, month: "2026-11", poste, credits: 0, calls: 0, errors: 0, ...extra });
  const usage = () => [
    row("u1", "2026-11-21", "tiktok", { thCalls: 10, thUsd: 0.01, thFallbacks: 3 }),
    row("u2", "2026-11-21", "curve", { credits: 1, thFallbacks: 2 }),
    // La veille à Paris (le jour UTC de LATE) : ses replis ne comptent pas dans ceux du jour.
    row("u3", "2026-11-20", "tiktok", { thCalls: 900, thUsd: 0.9, thFallbacks: 40 }),
    row("u4", "2026-11-19", "network", { credits: 7, thCalls: 300, thUsd: 0.3, thUnknown: 6 }),
    row("u5", "2026-11-18", "insta", { credits: 100 }),
    // Hors des 4 derniers jours : ni dans le rythme, ni dans les replis du jour (mais dans le mois).
    row("u6", "2026-11-16", "tiktok", { thCalls: 5_000, thFallbacks: 50 }),
  ];
  const run = (settings: MemoryDoc) => handlerOf(jobState)({ db: writableDb({ radarSettings: [settings], radarUsage: usage() }).db }, { now: LATE }) as Promise<JobState>;

  it("les replis du jour (Paris), le solde TikHub rangé avec le rythme de ses 3 derniers jours complets, ses tarifs", async () => {
    process.env.TIKHUB_API_KEY = "cle-de-test";
    process.env.RADAR_TIKHUB = "all";
    const st = await run(settingsDoc({ thBalanceUsd: 5.4, thFreeUsd: 0.02, thSeenAt: LATE - 10_000, thSpentSinceUsd: 0.4, thPrices: prices, thPricesAt: LATE - 3_600_000 }));
    expect([st.day, st.month]).toEqual(["2026-11-21", "2026-11"]);
    expect(st.fallbacksToday).toBe(5);
    // Rythme TikHub (relevés, courbe, réseau sous `all`), en unités : 20/11 900 appels, 19/11 306 (300 appels, 6 à
    // facturation inconnue — les 7 crédits du réseau, mixte, sont la part de ScrapeCreators ce jour-là), 18/11 Instagram
    // seul — ces postes n'ont rien dépensé → 1 206 ÷ 3.
    expect(st.th).toEqual({ paidUsd: 5.4, freeUsd: 0.02, seenAt: LATE - 10_000, spentSinceUsd: 0.4, perDay: 1_206 / 3 });
    expect(st.thPrices).toEqual({ [TH_ROUTES.profile]: { usd: 0.001, free: false } });
    expect(st.thPricesAt).toBe(LATE - 3_600_000);
    expect(st.usage).toHaveLength(6);
    expect(st.recentUsage.map((u) => u.day).sort()).toEqual(["2026-11-18", "2026-11-19", "2026-11-20", "2026-11-21", "2026-11-21"]);
  });

  it("jamais lu : solde, tarifs et heure des tarifs absents (null), pas zéro ; un crédit gratuit non rangé vaut 0 ; sans poste chez TikHub, pas de rythme", async () => {
    const none = await run(settingsDoc());
    expect([none.th, none.thPrices, none.thPricesAt]).toEqual([null, null, null]);
    expect(none.fallbacksToday).toBe(5);
    const paidOnly = await run(settingsDoc({ thBalanceUsd: 1.5, thSeenAt: LATE - 1_000 }));
    expect(paidOnly.th).toEqual({ paidUsd: 1.5, freeUsd: 0, seenAt: LATE - 1_000, spentSinceUsd: 0, perDay: null });
  });
});

describe("claimFallback : le quota de replis du jour, pris dans la base avant chaque repli", () => {
  // 23 h 30 UTC le 20/11 : le 21/11 à Paris.
  const LATE = Date.parse("2026-11-20T23:30:00Z");
  const row = (id: string, day: string, thFallbacks: number): MemoryDoc => ({ _id: id, _creationTime: 1, day, month: "2026-11", poste: "tiktok", credits: 0, calls: 0, errors: 0, thFallbacks });

  it("100 par jour (Paris), replis écrits avant le suivi des prises compris ; au-delà, refusé sans écriture ; la veille ne compte pas", async () => {
    // La veille : 100 places prises. Ce jour : 97 replis écrits par des passages d'avant le suivi des prises.
    const w = writableDb({ radarSettings: [settingsDoc({ thFallbackDay: "2026-11-20", thFallbackClaims: 100 })], radarUsage: [row("u0", "2026-11-20", 50), row("u1", "2026-11-21", 97)] });
    const claim = () => handlerOf(claimFallback)({ db: w.db }, { now: LATE });
    const got = [];
    for (let i = 0; i < 4; i++) got.push(await claim());
    expect(got).toEqual([true, true, true, false]);
    expect(w.tables.radarSettings[0]).toMatchObject({ thFallbackDay: "2026-11-21", thFallbackClaims: 100 });
    const before = w.writes.length;
    expect(await claim()).toBe(false);
    expect(w.writes.length).toBe(before);
    // Les tâches et /admin voient les places prises, même pas encore écrites dans radarUsage.
    const st = (await handlerOf(jobState)({ db: w.db }, { now: LATE })) as JobState;
    expect(st.fallbacksToday).toBe(100);
    vi.setSystemTime(LATE);
    const admin = (await getRadarBudgetCore({ db: w.db } as never)) as Record<string, any>;
    expect(admin.jobs.tikhub.fallbacksToday).toBe(100);
  });
});

describe("le rythme qui dit combien de jours le solde TikHub tient", () => {
  // Le 21/11 à 9 h 30 (Paris), sous RADAR_TIKHUB=all. Les relevés coûtaient ~1 000 crédits ScrapeCreators par jour ; ils
  // sont passés chez TikHub le 20 à 14 h 27 (420 crédits avant, 500 appels TikHub après). 1,5 $ payé chez TikHub.
  // Corrigé le 20/11/2026 : les 18 et 19 (sans champ TikHub) comptaient pour 0 appel TikHub — un zéro fabriqué, « non
  // mesuré » devenu « nul » : 500 ÷ 3 = 167 par jour, 9 jours de solde et le palier « normal », au lieu de ~1,5 jour au
  // rythme réel (« economie »). Le rythme d'un fournisseur est celui des postes qu'il sert, en unités (un crédit
  // ScrapeCreators, un appel TikHub : la même page), quel que soit le fournisseur qui les a servis ce jour-là.
  const MORNING = Date.parse("2026-11-21T08:30:00Z");
  const row = (id: string, day: string, poste: string, extra: Record<string, unknown> = {}): MemoryDoc => ({ _id: id, _creationTime: 1, day, month: "2026-11", poste, credits: 0, calls: 0, errors: 0, ...extra });
  const usage = () => [
    row("u18", "2026-11-18", "tiktok", { credits: 1_000 }),
    row("u18i", "2026-11-18", "insta", { credits: 40 }),
    row("u19", "2026-11-19", "tiktok", { credits: 1_000 }),
    row("u20", "2026-11-20", "tiktok", { credits: 420, thCalls: 500, thUsd: 0.5 }),
    // Aujourd'hui : pas fini, hors du rythme.
    row("u21", "2026-11-21", "tiktok", { thCalls: 200, thUsd: 0.2 }),
  ];
  const settings = () => settingsDoc({ creditsRemaining: 40_000, creditsSeenAt: MORNING - 60_000, thBalanceUsd: 1.5, thFreeUsd: 0, thSeenAt: MORNING - 10_000, thSpentSinceUsd: 0 });

  it("les jours d'avant la bascule comptent ce que les postes de TikHub ont dépensé, pas zéro : palier « economie », ~1,5 jour", async () => {
    process.env.TIKHUB_API_KEY = "cle-de-test";
    process.env.RADAR_TIKHUB = "all";
    const st = (await handlerOf(jobState)({ db: writableDb({ radarSettings: [settings()], radarUsage: usage() }).db }, { now: MORNING })) as JobState;
    const perDay = (1_000 + 1_000 + 920) / 3;
    expect(st.th?.perDay).toBeCloseTo(perDay, 9);
    const b = jobBudget(st, tikhubJobs(), undefined, MORNING);
    expect(b.th.tier).toBe("economie");
    expect(b.th.daysLeft).toBeCloseTo(1_500 / perDay, 9);
  });

  it("/admin voit le même rythme", async () => {
    process.env.TIKHUB_API_KEY = "cle-de-test";
    process.env.RADAR_TIKHUB = "all";
    vi.setSystemTime(MORNING);
    const r = (await getRadarBudgetCore({ db: writableDb({ radarSettings: [settings()], radarUsage: usage() }).db } as never)) as Record<string, any>;
    expect(r.state.th.tier).toBe("economie");
    expect(r.state.th.daysLeft).toBeCloseTo(1_500 / ((1_000 + 1_000 + 920) / 3), 9);
  });
});

describe("le rythme qui dit combien de jours le solde ScrapeCreators tient", () => {
  // Le 21/11 à 9 h 30 (Paris). Rythme mesuré du Radar (06–12/11) : ~1 150 unités par jour, dont les relevés de comptes
  // ~930 (81 %) ; le reste : Instagram 120, transcriptions 45, découverte et tournures 40, courbe 12.
  // Corrigé le 20/11/2026 : le rythme de ScrapeCreators additionnait les CRÉDITS de chaque ligne, quel que soit le
  // fournisseur qui sert désormais le poste — le même zéro fabriqué que celui corrigé pour TikHub (thPerDay), dans les
  // deux sens. Il compte maintenant les unités de ce que ScrapeCreators sert sous le réglage en cours.
  const MORNING = Date.parse("2026-11-21T08:30:00Z");
  const days = ["2026-11-18", "2026-11-19", "2026-11-20"];
  const row = (day: string, poste: string, extra: Record<string, unknown>): MemoryDoc => ({ _id: `${day}-${poste}`, _creationTime: 1, day, month: "2026-11", poste, credits: 0, calls: 0, errors: 0, ...extra });
  const rest = (day: string) => [row(day, "insta", { credits: 120 }), row(day, "transcript", { credits: 45 }), row(day, "search", { credits: 40 })];
  const settings = (aboveReserve: number) => settingsDoc({ creditsRemaining: CREDIT_RESERVE + aboveReserve, creditsSeenAt: MORNING - 60_000 });
  const state = async (rows: MemoryDoc[], aboveReserve: number) => {
    const st = (await handlerOf(jobState)({ db: writableDb({ radarSettings: [settings(aboveReserve)], radarUsage: rows }).db }, { now: MORNING })) as JobState;
    vi.setSystemTime(MORNING);
    const admin = (await getRadarBudgetCore({ db: writableDb({ radarSettings: [settings(aboveReserve)], radarUsage: rows }).db } as never)) as Record<string, any>;
    return { st, b: jobBudget(st, tikhubJobs(), undefined, MORNING), admin: admin.state };
  };

  it("retour en arrière (RADAR_TIKHUB retiré) après 3 jours sous `all` : les relevés et la courbe repassent chez ScrapeCreators, leur rythme compte — palier « economie », pas « normal »", async () => {
    process.env.SCRAPECREATORS_API_KEY = "cle-sc-de-test";
    const rows = days.flatMap((d) => [row(d, "tiktok", { thCalls: 930, thUsd: 0.93 }), row(d, "curve", { thCalls: 12, thUsd: 0.012 }), ...rest(d)]);
    // 1 500 crédits au-dessus de la réserve, ~1 147 par jour désormais : 1,3 jour.
    const { st, b, admin } = await state(rows, 1_500);
    expect(st.balance?.perDay).toBe(930 + 12 + 120 + 45 + 40);
    expect(b.tier).toBe("economie");
    expect(b.daysLeft).toBeCloseTo(1_500 / 1_147, 9);
    expect(admin.tier).toBe("economie");
  });

  it("bascule des relevés (RADAR_TIKHUB=tiktok) après 3 jours chez ScrapeCreators : ils ne comptent plus dans son rythme — palier « normal », pas « survie »", async () => {
    process.env.SCRAPECREATORS_API_KEY = "cle-sc-de-test";
    process.env.TIKHUB_API_KEY = "cle-de-test";
    process.env.RADAR_TIKHUB = "tiktok";
    const rows = days.flatMap((d) => [row(d, "tiktok", { credits: 930 }), row(d, "curve", { credits: 12 }), ...rest(d)]);
    // 800 crédits au-dessus de la réserve, ~217 par jour chez ScrapeCreators désormais : 3,7 jours.
    const { st, b, admin } = await state(rows, 800);
    expect(st.balance?.perDay).toBe(12 + 120 + 45 + 40);
    expect(b.tier).toBe("normal");
    expect(b.cut).toEqual([]);
    expect(admin.tier).toBe("normal");
  });

  // Corrigé le 21/11/2026 : le réseau, mixte, comptait en entier dans le rythme de ScrapeCreators, appels TikHub compris.
  it("rattrapage du réseau chez TikHub (RADAR_TIKHUB=tiktok,curve,network-all, 10 500 appels par jour) : ScrapeCreators ne compte que ses ~300 crédits — palier « normal », pas « economie »", async () => {
    process.env.SCRAPECREATORS_API_KEY = "cle-sc-de-test";
    process.env.TIKHUB_API_KEY = "cle-de-test";
    process.env.RADAR_TIKHUB = "tiktok,curve,network-all";
    const rows = days.flatMap((d) => [row(d, "tiktok", { credits: 2, thCalls: 930, thUsd: 0.93 }), row(d, "network", { credits: 95, thCalls: 10_500, thUsd: 10.5 }), ...rest(d)]);
    const { st, b, admin } = await state(rows, 5_000);
    expect(st.balance?.perDay).toBe(2 + 95 + 120 + 45 + 40);
    expect(b.tier).toBe("normal");
    expect(admin.tier).toBe("normal");
  });
});

describe("getRadarBudgetCore : ce que /admin reçoit", () => {
  const monde = () =>
    writableDb({
      radarSettings: [settingsDoc({ creditsRemaining: 40_000, creditsSeenAt: NOW - 60_000, thBalanceUsd: 5.4, thFreeUsd: 0.02, thSeenAt: NOW - 10_000, thSpentSinceUsd: 0.4, thLastError: "HTTP 500 …" })],
      radarUsage: [
        { _id: "u1", _creationTime: 1, day: "2026-11-19", month: "2026-11", poste: "tiktok", credits: 100, calls: 400, errors: 0, thCalls: 300, thUsd: 0.3, thFallbacks: 4 },
        { _id: "u2", _creationTime: 2, day: "2026-11-20", month: "2026-11", poste: "tiktok", credits: 10, calls: 30, errors: 0, thCalls: 20, thUsd: 0.02, thUnknown: 1, thFallbacks: 3 },
        { _id: "u3", _creationTime: 3, day: "2026-11-20", month: "2026-11", poste: "insta", credits: 50, calls: 50, errors: 0 },
      ],
    });

  /** Ce que l'écran affiche en « Dépense de <mois> » : src/admin/Radar.js, Σ days[].credits × pricePerCredit. */
  const screenSpend = (r: Record<string, any>) => r.days.reduce((n: number, d: { credits: number }) => n + d.credits, 0) * r.pricePerCredit;

  it("sans bascule : budget ScrapeCreators seul, mêmes jours et même prévu ; TikHub exposé à part", async () => {
    const r = (await getRadarBudgetCore({ db: monde().db } as never)) as Record<string, any>;
    expect(r.days.map((d: { day: string; scCredits: number }) => [d.day, d.scCredits])).toEqual([
      ["2026-11-19", 100],
      ["2026-11-20", 60],
    ]);
    expect(r.plannedUsd).toBe(plannedUsd(DEFAULT_BUDGET));
    expect(r.state.providers.tiktok).toBe("sc");
    expect(r.state.th.paidLeft).toBeNull();
    expect(r.jobs.tikhub).toMatchObject({ keyPresent: false, jobs: [], balanceUsd: 5.4, fallbacksToday: 3, lastError: "HTTP 500 …" });
    expect(r.jobs.tikhub.estimatedUsd).toBeCloseTo(5.0, 9);
    expect(r.jobs.creditsRemaining).toBe(40_000);
    // La dépense TikHub est comptée dans le plafond, même sans bascule (elle a été payée) — et dans celle que l'écran
    // affiche.
    expect(r.spentUsdAll).toBeCloseTo(160 * 0.00188 + 0.32 + 0.001, 9);
    expect(screenSpend(r)).toBeCloseTo(r.spentUsdAll, 9);
  });

  it("avec RADAR_TIKHUB et la clé : le budget juge chaque poste chez son fournisseur, solde TikHub estimé", async () => {
    process.env.TIKHUB_API_KEY = "cle-de-test";
    process.env.RADAR_TIKHUB = "all";
    const r = (await getRadarBudgetCore({ db: monde().db } as never)) as Record<string, any>;
    expect(r.state.providers).toMatchObject({ tiktok: "tikhub", curve: "tikhub", network: "tikhub", search: "sc", insta: "sc" });
    expect(r.state.th.paidLeft).toBe(5_000);
    expect(r.state.th.allLeft).toBe(5_020);
    expect(r.jobs.tikhub).toMatchObject({ keyPresent: true, jobs: ["tiktok", "curve", "network"] });
    expect(r.days.find((d: { day: string }) => d.day === "2026-11-20")).toMatchObject({ scCredits: 60, thCalls: 20, thUnknown: 1 });
  });

  // Corrigé le 20/11/2026 : `days[].credits` restait en crédits ScrapeCreators seuls et `plannedUsd` au prix de
  // ScrapeCreators. Sous RADAR_TIKHUB=tiktok, la « Dépense de <mois> » de /admin ne comptait plus les ~930 relevés par jour
  // payés chez TikHub (~81 % de la dépense du Radar : absent n'est pas nul), et le « prévu » restait au prix
  // ScrapeCreators pour les postes basculés (~1,88 fois trop) — l'écran sur lequel le fondateur juge l'avant/après.
  it("avec RADAR_TIKHUB=tiktok : la dépense que l'écran calcule compte les dollars TikHub ; le prévu est au prix du fournisseur de chaque poste", async () => {
    process.env.TIKHUB_API_KEY = "cle-de-test";
    process.env.RADAR_TIKHUB = "tiktok";
    const r = (await getRadarBudgetCore({ db: monde().db } as never)) as Record<string, any>;
    // 160 crédits ScrapeCreators, 320 appels TikHub facturés (0,32 $) et un à facturation inconnue (au prix plein).
    expect(screenSpend(r)).toBeCloseTo(160 * SC_PRICE_PER_CREDIT + 0.32 + 0.001, 9);
    expect(screenSpend(r)).toBeCloseTo(r.spentUsdAll, 9);
    const atProviders = POSTE_KEYS.reduce((sum, k) => sum + envelopeUsdAt(DEFAULT_BUDGET, k, k === "tiktok" ? "tikhub" : "sc"), 0);
    expect(r.plannedUsd).toBeCloseTo(atProviders, 9);
    expect(r.plannedUsd).toBeLessThan(plannedUsd(DEFAULT_BUDGET));
    expect(r.days.map((d: { day: string; scCredits: number }) => [d.day, d.scCredits])).toEqual([
      ["2026-11-19", 100],
      ["2026-11-20", 60],
    ]);
  });
});

// ─── Les tâches branchées ────────────────────────────────────────────────────────────────────────────────────────

const FIX = path.join(__dirname, "fixtures");
const fixture = (name: string) => JSON.parse(fs.readFileSync(path.join(FIX, name), "utf8")) as Record<string, any>;
const synth = () => fixture("tikhub/synthetiques.json");
const freshTh = () => ({ paidUsd: 5.4, freeUsd: 0.021, seenAt: NOW - 1_000, spentSinceUsd: 0, perDay: null });

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

/** TikHub simulé : chaque route répond par sa fixture, sauf ce que `over` remplace ; ScrapeCreators par les siennes. */
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
    const sc = { success: true, credits_charged: 1, credits_remaining: 30_000 };
    if (u.pathname === "/v2/tiktok/video") return [200, { ...sc, aweme_detail: fixture("sc/video.json").aweme_detail }];
    if (u.pathname === "/v1/tiktok/search/keyword") return [200, { ...sc, search_item_list: fixture("sc/reseau-motcle.json").search_item_list }];
    if (u.pathname === "/v3/tiktok/profile/videos") return [200, { ...sc, ...fixture("sc/profil.json") }];
    return [404, {}];
  });
}

const setEnv = (radar: string) => {
  process.env.SCRAPECREATORS_API_KEY = "cle-sc-de-test";
  process.env.TIKHUB_API_KEY = "cle-th-de-test";
  process.env.RADAR_TIKHUB = radar;
};

const signal = (videoId: string, fans: number, extra: Record<string, unknown> = {}): MemoryDoc => ({
  _id: `radarSignals_${videoId}`,
  _creationTime: 5,
  platform: "tiktok",
  videoId,
  url: `https://www.tiktok.com/@auteur_17/video/${videoId}`,
  authorId: "x",
  authorHandle: "auteur_17",
  authorFans: fans,
  caption: "",
  lang: "autre",
  publishedAt: NOW - 20 * 3_600_000,
  views: 1_000,
  likes: 0,
  comments: 0,
  shares: 0,
  saves: 0,
  ratio: 0.2,
  snapshots: [{ at: NOW - 3_600_000, views: 1_000 }],
  nextCheckAt: NOW - 1,
  curveStartedAt: NOW - 20 * 3_600_000,
  foundBy: ["x"],
  firstSeenAt: NOW - 20 * 3_600_000,
  lastSeenAt: NOW - 3_600_000,
  ...extra,
});

describe("runCurve chez TikHub", () => {
  function monde(st: JobState, due: string[]) {
    const w = writableDb({ radarSignals: due.map((id) => signal(id, 5_000)) });
    const f = taskCtx({
      "radar/radarSignals:jobState": () => st,
      "radar/radarSignals:dueCurve": () => w.tables.radarSignals.map((x) => ({ id: x._id, url: x.url })),
      "radar/radarSignals:applyCurve": (a) => handlerOf(applyCurve)({ db: w.db }, a),
    });
    return { w, f };
  }

  it("les vues viennent de TikHub, les abonnés connus restent (ratio calculé dessus) ; la dépense est en dollars TikHub", async () => {
    setEnv("curve");
    const net = thAndSc();
    vi.stubGlobal("fetch", net.impl);
    const { w, f } = monde(jobStateFor(), ["7709816632507368725", "7709774559007737110"]);
    await drive(handlerOf(runCurve)(f.ctx, {}) as Promise<unknown>);
    const views = fixture("tikhub/video.json").data.aweme_detail.statistics.play_count as number;
    for (const x of w.tables.radarSignals) {
      expect(x.authorFans).toBe(5_000);
      expect(x.views).toBe(views);
      expect(x.ratio).toBeCloseTo(views / 5_000, 9);
    }
    expect(net.paths().filter((p) => p === TH_ROUTES.video)).toHaveLength(2);
    expect(net.calls.some((c) => c.url.includes("scrapecreators"))).toBe(false);
    const rec = f.named("radar/radarSignals:recordRun")[0].args;
    expect(rec).toMatchObject({ poste: "curve", credits: 0, calls: 2, errors: 0, thCalls: 2, thUsd: 0.002 });
    // Le solde est relu en fin de passage (gratuit), rangé avec la dépense faite depuis.
    expect(rec).toMatchObject({ thBalanceUsd: 5.4, thSpentAfterUsd: 0 });
  });

  // LE COUPE-CIRCUIT NE GARDE DUES QUE LES VIDÉOS QU'IL A EMPÊCHÉ DE PARTIR (20/11/2026). Une vidéo que TikHub a lui-même
  // refusée (5xx redemandé, 4xx, délai) est conclue comme un échec isolé — elle sort de la courbe, comme un échec
  // ScrapeCreators avant la bascule —, que ces refus aient fait sauter le coupe-circuit ou non. Corrigé le 20/11/2026 :
  // celles qui le faisaient sauter restaient dues, leur nextCheckAt inchangé, et revenaient en tête de la file
  // (dueCurve, par nextCheckAt) à chaque passage — trois vidéos que TikHub refuse toujours suffisaient à ce que la courbe
  // ne passe plus jamais chez TikHub. Une panne réelle coûte au plus BREAKER_FAILS vidéos par passage : jamais pire que
  // main, où chaque vidéo en échec chez ScrapeCreators sort de la courbe.
  it("TikHub tombe en panne pendant le passage, sans repli : les vidéos qu'il a refusées sortent de la courbe, la suivante (pas demandée) reste due", async () => {
    setEnv("curve");
    vi.stubGlobal("fetch", thAndSc({ [TH_ROUTES.video]: [500, synth().refus500] }).impl);
    const { w, f } = monde(jobStateFor({ fallbacksToday: 100 }), ["1", "2", "3", "4"]);
    await drive(handlerOf(runCurve)(f.ctx, {}) as Promise<unknown>);
    expect(f.named("radar/radarSignals:applyCurve").map((c) => [c.args.id, c.args.video])).toEqual([
      ["radarSignals_1", null],
      ["radarSignals_2", null],
      ["radarSignals_3", null],
    ]);
    expect(w.tables.radarSignals.filter((x) => x.nextCheckAt === NOW - 1).map((x) => x._id)).toEqual(["radarSignals_4"]);
    expect(f.named("radar/radarSignals:recordRun")[0].args).toMatchObject({ credits: 0, errors: 4 });
  });

  it("TikHub refuse la route (4xx à chaque appel), sans repli : trois refus font sauter le coupe-circuit, ces trois vidéos sortent de la courbe, la 4e n'est pas demandée", async () => {
    setEnv("curve");
    const net = thAndSc({ [TH_ROUTES.video]: [404, { detail: { code: 404, message: "Not Found" } }] });
    vi.stubGlobal("fetch", net.impl);
    const { w, f } = monde(jobStateFor({ fallbacksToday: 100 }), ["1", "2", "3", "4"]);
    await drive(handlerOf(runCurve)(f.ctx, {}) as Promise<unknown>);
    expect(f.named("radar/radarSignals:applyCurve").map((c) => c.args.id)).toEqual(["radarSignals_1", "radarSignals_2", "radarSignals_3"]);
    expect(w.tables.radarSignals.filter((x) => x.nextCheckAt === NOW - 1).map((x) => x._id)).toEqual(["radarSignals_4"]);
    // Trois refus d'affilée : en panne, la 4e vidéo n'est pas demandée.
    expect(net.paths().filter((p) => p === TH_ROUTES.video)).toHaveLength(3);
  });

  it("trois vidéos que TikHub refuse à chaque passage (leur adresse), en tête de file, repli fermé : au passage suivant, la courbe repart chez TikHub sur les autres", async () => {
    setEnv("curve");
    const bad = ["7709774559007738001", "7709774559007738002", "7709774559007738003"];
    const good = ["7709774559007738004", "7709774559007738005"];
    const net = thAndSc({ [TH_ROUTES.video]: (url) => (bad.some((id) => url.includes(id)) ? [404, { detail: { code: 404, message: "Not Found" } }] : [200, fixture("tikhub/video.json")]) });
    vi.stubGlobal("fetch", net.impl);
    // Les trois refusées sont dues depuis plus longtemps : dueCurve (index by_next_check) les rend en premier.
    const w = writableDb({ radarSignals: [...bad, ...good].map((id, i) => signal(id, 5_000, { nextCheckAt: NOW - 10 + i })) });
    const pass = async () => {
      const f = taskCtx({
        "radar/radarSignals:jobState": () => jobStateFor({ fallbacksToday: 100 }),
        "radar/radarSignals:dueCurve": () =>
          w.tables.radarSignals
            .filter((x) => typeof x.nextCheckAt === "number" && (x.nextCheckAt as number) <= Date.now())
            .sort((a, b) => (a.nextCheckAt as number) - (b.nextCheckAt as number))
            .map((x) => ({ id: x._id, url: x.url })),
        "radar/radarSignals:applyCurve": (a) => handlerOf(applyCurve)({ db: w.db }, a),
      });
      await drive(handlerOf(runCurve)(f.ctx, {}) as Promise<unknown>);
      return f;
    };
    await pass();
    // Le coupe-circuit a sauté sur les trois refusées : elles sont conclues, les deux autres attendent sans avoir été demandées.
    expect(w.tables.radarSignals.filter((x) => bad.includes(x.videoId as string)).map((x) => x.nextCheckAt)).toEqual([undefined, undefined, undefined]);
    expect(w.tables.radarSignals.filter((x) => good.includes(x.videoId as string)).every((x) => typeof x.nextCheckAt === "number" && (x.views as number) === 1_000)).toBe(true);
    net.calls.length = 0;
    const f2 = await pass();
    // L'heure suivante : TikHub relève les deux autres, sans redemander les refusées ni passer par la porte de repli.
    expect(net.calls.filter((c) => new URL(c.url).pathname === TH_ROUTES.video).map((c) => good.find((id) => c.url.includes(id)) ?? "autre")).toEqual(good);
    expect(f2.named("radar/radarSignals:applyCurve").every((c) => c.args.video !== null)).toBe(true);
    expect(net.calls.filter((c) => c.url.includes("scrapecreators"))).toHaveLength(0);
  });

  it("un échec isolé (TikHub ne tombe pas en panne) sort la vidéo de la courbe, comme chez ScrapeCreators", async () => {
    setEnv("curve");
    vi.stubGlobal("fetch", thAndSc({ [TH_ROUTES.video]: [500, synth().refus500] }).impl);
    const { w, f } = monde(jobStateFor({ fallbacksToday: 100 }), ["1"]);
    await drive(handlerOf(runCurve)(f.ctx, {}) as Promise<unknown>);
    expect(f.named("radar/radarSignals:applyCurve").map((c) => c.args.video)).toEqual([null]);
    expect(w.tables.radarSignals[0].nextCheckAt).toBeUndefined();
  });

  it("repli : TikHub à sec, la vidéo est relevée chez ScrapeCreators, avec ses abonnés", async () => {
    setEnv("curve");
    const net = thAndSc({ [TH_ROUTES.video]: [402, synth().refus402] });
    vi.stubGlobal("fetch", net.impl);
    const { w, f } = monde(jobStateFor(), ["1"]);
    await drive(handlerOf(runCurve)(f.ctx, {}) as Promise<unknown>);
    expect(w.tables.radarSignals[0].authorFans).toBe(fixture("sc/video.json").aweme_detail.author.follower_count);
    expect(f.named("radar/radarSignals:recordRun")[0].args).toMatchObject({ credits: 1, thFallbacks: 1, thDryRoute: TH_ROUTES.video });
    expect(f.named("radar/radarSignals:recordRun")[0].args.thCalls).toBeUndefined();
  });
});

describe("runCurve : budget TikHub épuisé en cours de passage", () => {
  it("la suite passe par la porte de repli ; rien n'est sorti de la courbe", async () => {
    setEnv("curve");
    const net = thAndSc();
    vi.stubGlobal("fetch", net.impl);
    const due = ["1", "2", "3", "4", "5"].map((id) => signal(id, 5_000));
    const w = writableDb({ radarSignals: due });
    // 2 unités de solde TikHub (payé + gratuit, la courbe accepte le gratuit).
    const st = jobStateFor({ th: { paidUsd: 0.001, freeUsd: 0.001, seenAt: NOW - 1_000, spentSinceUsd: 0, perDay: null } });
    const f = taskCtx({
      "radar/radarSignals:jobState": () => st,
      "radar/radarSignals:dueCurve": () => w.tables.radarSignals.map((x) => ({ id: x._id, url: x.url })),
      "radar/radarSignals:applyCurve": (a) => handlerOf(applyCurve)({ db: w.db }, a),
    });
    await drive(handlerOf(runCurve)(f.ctx, {}) as Promise<unknown>);
    expect(net.paths().filter((p) => p === TH_ROUTES.video)).toHaveLength(2);
    expect(net.paths().filter((p) => p === "/v2/tiktok/video")).toHaveLength(3);
    expect(f.named("radar/radarSignals:applyCurve").every((c) => c.args.video !== null)).toBe(true);
    expect(f.named("radar/radarSignals:recordRun")[0].args).toMatchObject({ credits: 3, thCalls: 2, thFallbacks: 3, errors: 0 });
  });
});

describe("runCurve : TikHub non appelé, repli refusé", () => {
  // Part TikHub épuisée après 2 vidéos ; le passage croit avoir de la place à la porte de repli (0 repli à son
  // ouverture), mais un autre passage a pris le quota du jour entre-temps : la base refuse la place. TikHub n'a rien dit
  // de la 3e vidéo — elle reste due (corrigé le 20/11/2026 : elle sortait de la courbe en fin de passage, comme un échec
  // isolé ; de même une vidéo dont le repli était refusé à moins de 90 s de l'échéance).
  it("la vidéo reste due, rien n'est sorti de la courbe, le passage s'arrête là", async () => {
    setEnv("curve");
    const net = thAndSc();
    vi.stubGlobal("fetch", net.impl);
    const w = writableDb({ radarSignals: ["1", "2", "3", "4", "5"].map((id) => signal(id, 5_000)) });
    const st = jobStateFor({ th: { paidUsd: 0.001, freeUsd: 0.001, seenAt: NOW - 1_000, spentSinceUsd: 0, perDay: null } });
    const f = taskCtx({
      "radar/radarSignals:jobState": () => st,
      "radar/radarSignals:dueCurve": () => w.tables.radarSignals.map((x) => ({ id: x._id, url: x.url })),
      "radar/radarSignals:applyCurve": (a) => handlerOf(applyCurve)({ db: w.db }, a),
      "radar/radarSignals:claimFallback": () => false,
    });
    await drive(handlerOf(runCurve)(f.ctx, {}) as Promise<unknown>);
    expect(net.paths().filter((p) => p === TH_ROUTES.video)).toHaveLength(2);
    expect(net.calls.filter((c) => c.url.includes("scrapecreators"))).toHaveLength(0);
    expect(f.named("radar/radarSignals:applyCurve").map((c) => c.args.id)).toEqual(["radarSignals_1", "radarSignals_2"]);
    expect(f.named("radar/radarSignals:applyCurve").every((c) => c.args.video !== null)).toBe(true);
    expect(w.tables.radarSignals.filter((x) => x.nextCheckAt === NOW - 1).map((x) => x._id)).toEqual(["radarSignals_3", "radarSignals_4", "radarSignals_5"]);
  });
});

describe("la projection du mois est la même pour toutes les tâches (RADAR_TIKHUB=tiktok)", () => {
  // Relevés : 2 000 par jour (60 000 au mois), 49 400 payés chez ScrapeCreators (92,87 $) ; courbe 20 vidéos par jour et
  // découverte 10 recherches par jour, rien de dépensé ; le reste éteint ; plafond 110 $ (84 % dépensés).
  // Projection aux fournisseurs réglés : 92,87 + 10 600 relevés à 0,001 $ + courbe 3,38 $ + recherche 0,56 $ = 107,42 $,
  // sous le plafond : rien n'est coupé. Au prix ScrapeCreators partout, 116,75 $ : recherche, courbe et relevés coupés.
  const budget = {
    ...DEFAULT_BUDGET,
    capUsd: 110,
    postes: DEFAULT_BUDGET.postes.map((p) => (p.key === "tiktok" ? { ...p, qty: 2_000 } : p.key === "curve" ? { ...p, qty: 20 } : p.key === "search" ? { ...p, qty: 10 } : { ...p, on: false })),
  };
  const usage = Array.from({ length: 19 }, (_, i) => ({ poste: "tiktok", credits: 2_600, day: `2026-11-${String(i + 1).padStart(2, "0")}` }));
  const st = () => jobStateFor({ budget, usage, recentUsage: usage.slice(-4) });
  const projected = 49_400 * 47 / 25_000 + 10_600 * 0.001 + 1_800 * 47 / 25_000 + 300 * 47 / 25_000;

  it("la courbe (non basculée) n'est pas coupée : elle relève sa part, comme le voient les relevés et /admin", async () => {
    setEnv("tiktok");
    const net = thAndSc();
    vi.stubGlobal("fetch", net.impl);
    const w = writableDb({ radarSignals: ["1", "2", "3", "4", "5"].map((id) => signal(id, 5_000)) });
    const f = taskCtx({
      "radar/radarSignals:jobState": () => st(),
      "radar/radarSignals:dueCurve": (a) => w.tables.radarSignals.slice(0, Number(a.limit)).map((x) => ({ id: x._id, url: x.url })),
      "radar/radarSignals:applyCurve": (a) => handlerOf(applyCurve)({ db: w.db }, a),
    });
    await drive(handlerOf(runCurve)(f.ctx, {}) as Promise<unknown>);
    // 1 800 relevés au mois = 60 par jour, 24 passages : 3 par passage, chez ScrapeCreators.
    expect(net.paths().filter((p) => p === "/v2/tiktok/video")).toHaveLength(3);
  });

  it("les tournures (non basculées, sans aiguilleur) ne sont pas coupées", async () => {
    setEnv("tiktok");
    const net = thAndSc();
    vi.stubGlobal("fetch", net.impl);
    const f = taskCtx({ "radar/radarSignals:jobState": () => st() });
    await drive(handlerOf(runNaming)(f.ctx, {}) as Promise<unknown>);
    expect(net.calls.filter((c) => c.url.includes("/v1/tiktok/search/keyword")).length).toBeGreaterThan(0);
  });

  it("/admin voit la même projection : le reste des relevés au prix TikHub, rien de coupé", async () => {
    setEnv("tiktok");
    const w = writableDb({
      radarSettings: [settingsDoc({ capUsd: 110, postes: budget.postes, creditsRemaining: 40_000, creditsSeenAt: NOW - 60_000 })],
      radarUsage: usage.map((u, i) => ({ _id: `u${i}`, _creationTime: i, month: "2026-11", calls: u.credits, errors: 0, ...u })),
    });
    const r = (await getRadarBudgetCore({ db: w.db } as never)) as Record<string, any>;
    expect(r.state.projectedUsd).toBeCloseTo(projected, 9);
    expect(r.state.capCut).toEqual([]);
  });
});

describe("runDiscovery chez TikHub (search)", () => {
  // Une recherche de la rotation que TikHub refuse à chaque fois (500, redemandé une fois), les autres servies ; repli
  // fermé (quota du jour atteint). Corrigé le 20/11/2026 : cet échec ISOLÉ arrêtait le passage avant d'avancer le
  // curseur, qui repartait de cette recherche au passage suivant — la découverte restait bloquée dessus, sans erreur
  // qui le dise. Avant la bascule, un échec ScrapeCreators passait la recherche et continuait.
  it("un échec isolé de TikHub (sans coupe-circuit) sur une recherche : elle est passée, les suivantes sont faites, le curseur avance au-delà", async () => {
    setEnv("search");
    const x = nextQueries(10, 1, DISCOVERY_ROTATION).queries[0];
    const net = thAndSc({
      [TH_ROUTES.search]: (url) => {
        const p = new URL(url).searchParams;
        return p.get("keyword") === x.query && p.get("region") === x.region ? [500, synth().refus500] : [200, fixture("tikhub/decouverte.json")];
      },
    });
    vi.stubGlobal("fetch", net.impl);
    const f = taskCtx({ "radar/radarSignals:jobState": () => jobStateFor({ fallbacksToday: 100 }) });
    await drive(handlerOf(runDiscovery)(f.ctx, {}) as Promise<unknown>);
    const asked = net.calls.filter((c) => new URL(c.url).pathname === TH_ROUTES.search).map((c) => new URL(c.url).searchParams.get("keyword"));
    // La recherche refusée : demandée deux fois (un 5xx est redemandé), puis les suivantes — n recherches en tout.
    const n = asked.length - 1;
    expect(n).toBeGreaterThan(1);
    expect(asked.slice(0, 2)).toEqual([x.query, x.query]);
    expect(f.named("radar/radarSignals:upsertDiscovered")).toHaveLength(n - 1);
    const rec = f.named("radar/radarSignals:recordRun")[0].args;
    expect(rec.cursor).toBe(nextQueries(10, n, DISCOVERY_ROTATION).cursor);
    expect(rec).toMatchObject({ errors: 1, thCalls: n - 1 });
  });

  it("les vidéos et leurs abonnés non mesurés partent ensemble ; la pub est marquée ; le curseur n'avance que des recherches faites ; une panne arrête", async () => {
    setEnv("search");
    let n = 0;
    const net = thAndSc({
      [TH_ROUTES.search]: () => {
        n++;
        // 1re recherche : la découverte réelle (une pub sans is_ad) ; 2e : la page réelle à un auteur sans abonnés
        // mesurés ; ensuite TikHub tombe (500, redemandé une fois) : 3e et 4e, deux échecs qui ne déclarent pas encore
        // la panne ; 5e, le 3e d'affilée, en panne.
        if (n === 1) return [200, fixture("tikhub/decouverte.json")];
        if (n === 2) return [200, fixture("tikhub/reseau-motcle.json")];
        return [500, synth().refus500];
      },
    });
    vi.stubGlobal("fetch", net.impl);
    const f = taskCtx({ "radar/radarSignals:jobState": () => jobStateFor({ fallbacksToday: 100 }) });
    await drive(handlerOf(runDiscovery)(f.ctx, {}) as Promise<unknown>);
    const up = f.named("radar/radarSignals:upsertDiscovered");
    expect(up).toHaveLength(2);
    expect((up[0].args.videos as { videoId: string; isAd: boolean }[]).filter((x) => x.isAd).map((x) => x.videoId)).toEqual(["7709666557760111870"]);
    expect(up[0].args.fansUnknown).toBeUndefined();
    expect(up[1].args.fansUnknown).toEqual(["7707975289833260236"]);
    const rec = f.named("radar/radarSignals:recordRun")[0].args;
    // Les recherches que TikHub a refusées sont passées, celle qui déclare la panne comprise : le curseur avance au-delà
    // des cinq (corrigé le 20/11/2026 : il revenait avant la 3e, et les trois refusées repassaient en tête au passage suivant).
    expect(rec.cursor).toBe(nextQueries(10, 5, DISCOVERY_ROTATION).cursor);
    expect(rec).toMatchObject({ poste: "search", credits: 0, thCalls: 2, errors: 3 });
    // Chaque recherche en échec demandée deux fois, et rien d'autre après la panne.
    expect(net.paths().filter((p) => p === TH_ROUTES.search)).toHaveLength(2 + 3 * 2);
  });
});

describe("runDiscovery chez TikHub : refus, panne et porte de repli", () => {
  // Trois recherches de suite que TikTok refuse (réponse 200 facturée, status_code ≠ 0), repli fermé : chacune est
  // payée et passée, et le 3e refus déclare TikHub en panne. Corrigé le 20/11/2026 : le début de la « suite d'échecs »
  // était posé aussi sur un refus, et la panne ramenait le curseur AVANT les trois recherches déjà payées et refusées —
  // repayées et refusées à chaque passage, la découverte bloquée dessus pour de bon.
  const upstream = (): [number, unknown] => [200, { ...synth().upstream, router: TH_ROUTES.search }];
  const failing: [string, [number, unknown][], number][] = [
    // Trois appels, chacun refusé une fois (un refus de TikTok n'est pas redemandé).
    ["trois refus de TikTok", [upstream(), upstream(), upstream()], 3],
    // Un 5xx (redemandé : deux appels, le 1er échec du coupe-circuit), puis deux refus. Les refus sont des réponses de
    // TikHub : le 5xx était isolé, pas le début d'une panne — il est passé lui aussi.
    ["un 5xx isolé puis deux refus de TikTok", [[500, synth().refus500], upstream(), upstream()], 4],
  ];
  for (const [nom, answers, calls] of failing) {
    it(`${nom} d'affilée font tomber TikHub en panne : les recherches refusées (payées) sont passées, le curseur ne revient pas avant elles`, async () => {
      setEnv("search");
      const first = nextQueries(10, 3, DISCOVERY_ROTATION).queries.map((q) => `${q.query}|${q.region}`);
      const net = thAndSc({
        [TH_ROUTES.search]: (url) => {
          const p = new URL(url).searchParams;
          const i = first.indexOf(`${p.get("keyword")}|${p.get("region")}`);
          return i >= 0 ? answers[i] : [200, fixture("tikhub/decouverte.json")];
        },
      });
      vi.stubGlobal("fetch", net.impl);
      const f = taskCtx({ "radar/radarSignals:jobState": () => jobStateFor({ fallbacksToday: 100 }) });
      await drive(handlerOf(runDiscovery)(f.ctx, {}) as Promise<unknown>);
      // Rien après la panne.
      expect(net.paths().filter((p) => p === TH_ROUTES.search)).toHaveLength(calls);
      expect(f.named("radar/radarSignals:upsertDiscovered")).toHaveLength(0);
      expect(f.named("radar/radarSignals:recordRun")[0].args.cursor).toBe(nextQueries(10, 3, DISCOVERY_ROTATION).cursor);
    });
  }

  // Un 5xx isolé (la 1re recherche), une recherche servie, puis trois 5xx d'affilée : la panne est déclarée au 3e. Chaque
  // recherche que TikHub a refusée est passée, comme un échec ScrapeCreators avant la bascule : le curseur avance au-delà
  // des cinq. Corrigé le 20/11/2026 : il revenait avant la suite d'échecs qui avait fait sauter le coupe-circuit — trois
  // recherches que TikHub refuse toujours repassaient en tête à chaque passage, et la découverte ne quittait plus ce
  // point de la rotation.
  it("un 5xx isolé, un succès, puis trois 5xx (panne) : les cinq sont passées, le curseur avance au-delà, le passage s'arrête", async () => {
    setEnv("search");
    const first = nextQueries(10, 5, DISCOVERY_ROTATION).queries.map((q) => `${q.query}|${q.region}`);
    const answers: [number, unknown][] = [[500, synth().refus500], [200, fixture("tikhub/decouverte.json")], [500, synth().refus500], [500, synth().refus500], [500, synth().refus500]];
    const net = thAndSc({
      [TH_ROUTES.search]: (url) => {
        const p = new URL(url).searchParams;
        const i = first.indexOf(`${p.get("keyword")}|${p.get("region")}`);
        return i >= 0 ? answers[i] : [200, fixture("tikhub/decouverte.json")];
      },
    });
    vi.stubGlobal("fetch", net.impl);
    const f = taskCtx({ "radar/radarSignals:jobState": () => jobStateFor({ fallbacksToday: 100 }) });
    await drive(handlerOf(runDiscovery)(f.ctx, {}) as Promise<unknown>);
    // Chaque 5xx redemandé une fois ; rien après la panne.
    expect(net.paths().filter((p) => p === TH_ROUTES.search)).toHaveLength(2 + 1 + 3 * 2);
    expect(f.named("radar/radarSignals:upsertDiscovered")).toHaveLength(1);
    const rec = f.named("radar/radarSignals:recordRun")[0].args;
    expect(rec.cursor).toBe(nextQueries(10, 5, DISCOVERY_ROTATION).cursor);
    expect(rec).toMatchObject({ errors: 4, thCalls: 1 });
    // Le passage suivant repart du curseur rangé : la première recherche demandée est la 6e, pas une des refusées.
    net.calls.length = 0;
    const f2 = taskCtx({ "radar/radarSignals:jobState": () => jobStateFor({ fallbacksToday: 100, cursor: rec.cursor as number }) });
    await drive(handlerOf(runDiscovery)(f2.ctx, {}) as Promise<unknown>);
    const asked = net.calls.filter((c) => new URL(c.url).pathname === TH_ROUTES.search).map((c) => `${new URL(c.url).searchParams.get("keyword")}|${new URL(c.url).searchParams.get("region")}`);
    const sixth = nextQueries(10, 6, DISCOVERY_ROTATION).queries[5];
    expect(asked[0]).toBe(`${sixth.query}|${sixth.region}`);
    expect(f2.named("radar/radarSignals:upsertDiscovered").length).toBeGreaterThan(0);
  });

  // Part TikHub du passage épuisée après deux recherches ; le passage croit avoir de la place à la porte de repli (aucun
  // repli à son ouverture), mais un autre passage a pris le quota : la base refuse la place. La 3e recherche n'est pas
  // lancée — elle n'est pas faite, le curseur reste avant elle (sinon la rotation la saute pour un tour complet).
  it("TikHub non appelé (part épuisée), place de repli refusée par la base : la recherche n'est pas faite, le curseur reste avant elle, le passage s'arrête", async () => {
    setEnv("search");
    const net = thAndSc({ [TH_ROUTES.search]: [200, fixture("tikhub/decouverte.json")] });
    vi.stubGlobal("fetch", net.impl);
    // 2 unités de solde TikHub (payé + gratuit : la découverte accepte le gratuit).
    const st = jobStateFor({ th: { paidUsd: 0.001, freeUsd: 0.001, seenAt: NOW - 1_000, spentSinceUsd: 0, perDay: null } });
    const f = taskCtx({ "radar/radarSignals:jobState": () => st, "radar/radarSignals:claimFallback": () => false });
    await drive(handlerOf(runDiscovery)(f.ctx, {}) as Promise<unknown>);
    expect(net.paths().filter((p) => p === TH_ROUTES.search)).toHaveLength(2);
    expect(net.calls.filter((c) => c.url.includes("scrapecreators"))).toHaveLength(0);
    expect(f.named("radar/radarSignals:upsertDiscovered")).toHaveLength(2);
    expect(f.named("radar/radarSignals:claimFallback")).toHaveLength(1);
    expect(f.named("radar/radarSignals:recordRun")[0].args.cursor).toBe(nextQueries(10, 2, DISCOVERY_ROTATION).cursor);
  });
});

describe("upsertDiscovered : abonnés non mesurés", () => {
  const app: MemoryDoc = { _id: "radarApps_trace", _creationTime: 1, slug: "trace", name: "Trace", rivalOf: [], strong: ["trace"], weak: [], context: [], searches: [], status: "active", source: "manual", createdAt: 0, trackedCount: 0 };
  const video = (videoId: string, handle: string) => ({
    videoId,
    url: `https://www.tiktok.com/@${handle}/video/${videoId}`,
    authorId: handle,
    authorHandle: handle,
    authorFans: 0,
    caption: "mon avis sur trace, la meilleure app",
    lang: "fr",
    publishedAt: NOW - 3_600_000,
    durationSec: 30,
    isAd: false,
    views: 50_000,
    likes: 1,
    comments: 0,
    shares: 0,
    saves: 0,
  });

  it("une vidéo neuve n'entre ni dans les signaux ni dans la courbe ; une connue garde ses abonnés ; l'auteur rejoint le réseau (à vérifier)", async () => {
    const w = writableDb({
      radarSettings: [settingsDoc()],
      radarApps: [app],
      radarTracked: [],
      radarRejected: [],
      radarAppCandidates: [],
      radarSignals: [signal("connue", 7_000, { authorHandle: "connue_h", curveStartedAt: undefined, nextCheckAt: undefined })],
    });
    const r = (await handlerOf(upsertDiscovered)({ db: w.db }, { videos: [video("neuve", "neuve_h"), video("connue", "connue_h")], foundBy: "trace·fr", now: NOW, fansUnknown: ["neuve", "connue"] })) as Record<string, number>;
    expect(r).toMatchObject({ inserted: 0, updated: 1 });
    expect(w.tables.radarSignals.map((x) => x.videoId)).toEqual(["connue"]);
    const connue = w.tables.radarSignals[0];
    expect(connue.authorFans).toBe(7_000);
    expect(connue.ratio).toBeCloseTo(50_000 / 7_000, 9);
    expect(w.tables.radarTracked.map((t) => [t.handle, t.fans, t.status])).toEqual([
      ["neuve_h", 0, "paused"],
      ["connue_h", 0, "paused"],
    ]);
    // Sans la liste, la même vidéo neuve entrerait (50 000 vues, 0 abonné : ratio inventé) — et dans la courbe.
    const w2 = writableDb({ radarSettings: [settingsDoc()], radarApps: [{ ...app }], radarTracked: [], radarRejected: [], radarAppCandidates: [], radarSignals: [] });
    const r2 = (await handlerOf(upsertDiscovered)({ db: w2.db }, { videos: [video("neuve", "neuve_h")], foundBy: "trace·fr", now: NOW })) as Record<string, number>;
    expect(r2).toMatchObject({ inserted: 1, admitted: 1 });
  });
});

describe("runNaming : reste chez ScrapeCreators, jugé sur son palier", () => {
  const run = async (st: JobState) => {
    const net = thAndSc();
    vi.stubGlobal("fetch", net.impl);
    const f = taskCtx({ "radar/radarSignals:jobState": () => st });
    await drive(handlerOf(runNaming)(f.ctx, {}) as Promise<unknown>);
    return { net, f };
  };

  it("ScrapeCreators au palier économie, découverte chez TikHub (normal) : aucune tournure", async () => {
    setEnv("all,search");
    const { net, f } = await run(jobStateFor({ balance: { remaining: 1_500 + 3_000, seenAt: NOW, now: NOW, perDay: 2_000 } }));
    expect(net.calls).toHaveLength(0);
    expect(f.named("radar/radarSignals:recordRun")[0].args).toMatchObject({ calls: 0, credits: 0 });
  });

  it("la part du jour se partage en unités avec la découverte chez TikHub ; aucun appel TikHub", async () => {
    setEnv("all,search");
    // 150 recherches par jour ; la découverte en a fait 140 chez TikHub aujourd'hui : il en reste 10 aux tournures.
    const usage = [{ poste: "search", credits: 0, thCalls: 140, thUsd: 0.14, day: "2026-11-20" }];
    const { net } = await run(jobStateFor({ usage, recentUsage: usage }));
    expect(net.calls).toHaveLength(10);
    expect(net.calls.every((c) => c.url.startsWith("https://api.scrapecreators.com/v1/tiktok/search/keyword") && c.url.includes("sort_by=date-posted"))).toBe(true);
  });
});

describe("runNetworkSearch chez TikHub", () => {
  type App = { id: string; name: string; searches: string[]; rival: boolean; deep: boolean; never: boolean };
  const focus = (over: Partial<App> = {}): App => ({ id: "radarApps_focus", name: "Focus Town", searches: ["#focustown", "focus town"], rival: true, deep: false, never: false, ...over });
  const motcle = () => fixture("tikhub/reseau-motcle.json");
  const pageA = () => fixture("tikhub/reseau-page.json");
  const ids = (body: Record<string, any>) => (body.data.search_item_list as { aweme_info: { aweme_id: string } }[]).map((x) => x.aweme_info.aweme_id);
  const hashtagEnd = () => ({ ...fixture("tikhub/hashtag-liste.json"), data: { ...fixture("tikhub/hashtag-liste.json").data, has_more: 0 } });

  /** TikHub : mot-clé page 0 = A (suite), page 1 = A encore (que des doublons, suite), page 2 = B (fin). Hashtag : 2 pages. */
  function network(over: Parameters<typeof thAndSc>[0] = {}) {
    return thAndSc({
      [TH_ROUTES.search]: (url) => {
        const offset = Number(new URL(url).searchParams.get("offset"));
        if (offset === 0 || offset === 30) return [200, pageA()];
        return [200, motcle()];
      },
      [TH_ROUTES.hashtagSearch]: [200, fixture("tikhub/hashtag-id.json")],
      [TH_ROUTES.hashtagVideos]: (url) => [200, new URL(url).searchParams.get("cursor") === "0" ? fixture("tikhub/hashtag-liste.json") : hashtagEnd()],
      "/v1/tiktok/search/hashtag": [200, { success: true, credits_charged: 1, credits_remaining: 30_000, aweme_list: fixture("sc/profil.json").aweme_list, cursor: 20, has_more: 1 }],
      ...over,
    });
  }

  function run(apps: App[], st: JobState, net = network()) {
    vi.stubGlobal("fetch", net.impl);
    const store = new Map<string, { cid: string | null; at: number }>();
    const f = taskCtx({
      "radar/radarSignals:jobState": () => st,
      "radar/radarNetworks:dueApps": () => apps,
      "radar/radarNetworks:attachFromSearch": () => ({ attached: 1, signals: 0 }),
      "radar/radarNetworks:hashtagIdOf": (a) => store.get(String(a.tag)) ?? null,
      "radar/radarNetworks:saveHashtagId": (a) => void store.set(String(a.tag), { cid: (a.cid as string | undefined) ?? null, at: Number(a.now) }),
    });
    return { net, f, store, done: drive(handlerOf(runNetworkSearch)(f.ctx, {}) as Promise<unknown>) };
  }
  const pathsOf = (net: ReturnType<typeof network>, p: string) => net.calls.filter((c) => new URL(c.url).pathname === p).map((c) => Object.fromEntries(new URL(c.url).searchParams));

  it("network : hashtag sans région et mot-clé FR chez TikHub, les autres passes chez ScrapeCreators ; doublons retirés, page sèche sans écriture, rien après has_more 0", async () => {
    setEnv("network");
    const { net, f, done } = run([focus()], jobStateFor());
    await done;
    // Mot-clé FR : offsets 0, 30, 60 ; la page 60 dit « plus rien » : pas de 4e page.
    expect(pathsOf(net, TH_ROUTES.search)).toEqual([0, 30, 60].map((o) => ({ keyword: "focus town", count: "30", sort_type: "0", publish_time: "90", region: "FR", offset: String(o) })));
    // Hashtag sans région : son identifiant, puis ses pages, sans paramètre de région.
    expect(pathsOf(net, TH_ROUTES.hashtagSearch)).toHaveLength(1);
    expect(pathsOf(net, TH_ROUTES.hashtagVideos)).toEqual([
      { ch_id: "6960094601675801580", count: "20", cursor: "0" },
      { ch_id: "6960094601675801580", count: "20", cursor: "20" },
    ]);
    // Hashtag FR et mot-clé sans région : chez ScrapeCreators, comme avant.
    const sc = net.calls.filter((c) => c.url.includes("api.scrapecreators.com")).map((c) => new URL(c.url));
    expect(sc.filter((u) => u.pathname === "/v1/tiktok/search/hashtag").every((u) => u.searchParams.get("region") === "FR")).toBe(true);
    expect(sc.filter((u) => u.pathname === "/v1/tiktok/search/keyword").every((u) => u.searchParams.get("region") === null)).toBe(true);
    // Le mot-clé FR : 2 écritures (la page de doublons n'en fait pas), sans doublon, abonnés non mesurés à part.
    const kw = f.named("radar/radarNetworks:attachFromSearch").filter((c) => c.args.foundBy === "réseau Focus Town·fr" && c.args.step === 4);
    expect(kw.map((c) => (c.args.videos as { videoId: string }[]).map((x) => x.videoId))).toEqual([ids(pageA()), ids(motcle())]);
    expect(kw.map((c) => c.args.fansUnknown)).toEqual([["7709909399505995044"], ["7707975289833260236"]]);
    // La page de hashtag TikHub : toutes ses vidéos, lues comme ScrapeCreators les lirait, sans liste d'abonnés inconnus.
    const ht = f.named("radar/radarNetworks:attachFromSearch").find((c) => c.args.step === 1)!;
    const raw = fixture("tikhub/hashtag-liste.json").data.aweme_list as unknown[];
    expect(ht.args.videos).toEqual(raw.map((x) => parseScVideo(x)));
    expect(ht.args.fansUnknown).toBeUndefined();
    // Comptabilité : appels TikHub en dollars, crédits ScrapeCreators à part ; l'app est cherchée en entier.
    const rec = f.named("radar/radarSignals:recordRun");
    const sum = (k: string) => rec.reduce((n, c) => n + Number(c.args[k] ?? 0), 0);
    expect(sum("thCalls")).toBe(1 + 2 + 3);
    expect(sum("credits")).toBe(sc.length);
    expect(f.named("radar/radarNetworks:finishNetworkSearch")[0].args).toMatchObject({ outcome: "done", searched: true });
  });

  it("network-all : le mot-clé sans région part en US, le hashtag FR chez TikHub ; les passes triées par date restent chez ScrapeCreators ; l'identifiant n'est cherché qu'une fois", async () => {
    setEnv("network-all");
    const { net, f, store, done } = run([focus({ deep: true, rival: false })], jobStateFor());
    await done;
    expect(pathsOf(net, TH_ROUTES.hashtagSearch)).toHaveLength(1);
    expect(store.get("focustown")).toMatchObject({ cid: "6960094601675801580" });
    expect(pathsOf(net, TH_ROUTES.hashtagVideos).some((p) => p.region === "FR")).toBe(true);
    expect(pathsOf(net, TH_ROUTES.search).some((p) => p.region === "US")).toBe(true);
    const sc = net.calls.filter((c) => c.url.includes("api.scrapecreators.com")).map((c) => new URL(c.url));
    expect(sc.length).toBeGreaterThan(0);
    expect(sc.every((u) => u.searchParams.get("sort_by") === "date-posted")).toBe(true);
    expect(f.named("radar/radarNetworks:finishNetworkSearch")[0].args).toMatchObject({ searched: true });
  });

  // Un hashtag dont TikHub ne rend pas le nom exact dans son top 10 (fetch_hashtag_search_result) : ce n'est PAS mesuré
  // que TikHub ne l'a pas, et ScrapeCreators le lisait avant la bascule. Corrigé le 20/11/2026 : sa passe ne passait que
  // par la porte de repli — fermée (quota du jour, palier), elle était vide et l'app enregistrée comme cherchée, recherche
  // complète comprise ; ouverte, une seule page. Elle est désormais lue chez ScrapeCreators comme avant la bascule, sur
  // la part du poste chez lui (ce n'est pas un repli : TikHub n'a pas échoué).
  const sans = () => ({ ...fixture("tikhub/hashtag-id.json"), data: { status_code: 0, challenge_list: fixture("tikhub/hashtag-id.json").data.challenge_list.slice(1) } });

  it("hashtag introuvable chez TikHub, repli fermé : la passe est lue chez ScrapeCreators comme avant la bascule (3 pages pour une concurrente), pas un repli ; l'absence est gardée", async () => {
    setEnv("network");
    const { net, f, store, done } = run([focus({ searches: ["#focustown"] })], jobStateFor({ fallbacksToday: 100 }), network({ [TH_ROUTES.hashtagSearch]: [200, sans()] }));
    await done;
    expect(pathsOf(net, TH_ROUTES.hashtagVideos)).toHaveLength(0);
    expect(store.get("focustown")).toMatchObject({ cid: null });
    expect(scCalls(net, "/v1/tiktok/search/hashtag").filter((p) => p.region === undefined)).toEqual([{ hashtag: "focustown" }, { hashtag: "focustown", cursor: "20" }, { hashtag: "focustown", cursor: "20" }]);
    expect(finish(f)).toEqual([{ appId: "radarApps_focus", outcome: "done", searched: true, error: undefined }]);
    // Ce n'est ni un échec ni un repli.
    expect([total(f, "thFallbacks"), total(f, "errors")]).toEqual([0, 0]);
    expect(f.named("radar/radarSignals:recordRun").some((c) => c.args.lastError !== undefined)).toBe(false);
  });

  it("hashtag introuvable chez TikHub, recherche complète : déroulée chez ScrapeCreators tant qu'elle ramène des comptes (DEEP_PAGES), et enregistrée", async () => {
    setEnv("network");
    const { net, f, done } = run([focus({ searches: ["#focustown"], deep: true, rival: false })], jobStateFor(), network({ [TH_ROUTES.hashtagSearch]: [200, sans()] }));
    await done;
    expect(scCalls(net, "/v1/tiktok/search/hashtag").filter((p) => p.region === undefined)).toHaveLength(DEEP_PAGES);
    expect(total(f, "thFallbacks")).toBe(0);
    expect(f.named("radar/radarNetworks:finishNetworkSearch")[0].args).toMatchObject({ outcome: "done", searched: true, deep: true });
  });

  it("hashtag gardé introuvable (moins de 7 jours), ScrapeCreators fermé (réserve), sous network-all : l'app reste due (« budget »), rien n'est payé ni enregistré comme cherché", async () => {
    setEnv("network-all");
    const reserve = { balance: { remaining: 1_400, seenAt: NOW - 60_000, now: NOW, perDay: 1_000 } };
    const { net, f, store, done } = run([focus({ searches: ["#focustown"], rival: false })], jobStateFor(reserve));
    store.set("focustown", { cid: null, at: NOW - 3_600_000 });
    await done;
    expect(net.calls.filter((c) => !c.url.includes("/api/v1/tikhub/user/"))).toHaveLength(0);
    expect(finish(f)).toEqual([{ appId: "radarApps_focus", outcome: "budget", searched: false, error: undefined }]);
  });

  it("paliers : ScrapeCreators en survie, TikHub normal — sous network-all, la routine passe et la recherche complète attend ; sous network, la routine attend", async () => {
    const survie = { balance: { remaining: 1_500 + 1_000, seenAt: NOW, now: NOW, perDay: 2_000 } };
    const routine = focus({ id: "radarApps_r", rival: false, deep: false });
    const complete = focus({ id: "radarApps_c", rival: false, deep: true });
    setEnv("network-all");
    const a = run([routine, complete], jobStateFor(survie));
    await a.done;
    expect(a.f.named("radar/radarNetworks:startNetworkSearch").map((c) => c.args.appId)).toEqual(["radarApps_r"]);
    setEnv("network");
    const b = run([routine], jobStateFor(survie));
    await b.done;
    expect(b.f.named("radar/radarNetworks:startNetworkSearch")).toHaveLength(0);
  });

  it("budget : une unité de part = l'identifiant du hashtag cherché, aucune page de liste ; l'app reprend au passage suivant", async () => {
    setEnv("network");
    // 100 000 par mois = 3 333,3 par jour ; 3 332 déjà dépensés chez TikHub aujourd'hui : il en reste 1.
    const usage = [{ poste: "network", credits: 0, thCalls: 3_332, thUsd: 3.332, day: "2026-11-20" }];
    const { net, f, done } = run([focus({ searches: ["#focustown"] })], jobStateFor({ usage }));
    await done;
    expect(pathsOf(net, TH_ROUTES.hashtagSearch)).toHaveLength(1);
    expect(pathsOf(net, TH_ROUTES.hashtagVideos)).toHaveLength(0);
    expect(f.named("radar/radarNetworks:finishNetworkSearch")[0].args).toMatchObject({ outcome: "budget", searched: false });
  });

  it("TikHub en panne sans repli : l'app finit en erreur avec le message, reste due, et le passage s'arrête", async () => {
    setEnv("network");
    const { net, f, done } = run([focus({ searches: ["focus town"] }), focus({ id: "radarApps_autre", searches: ["autre"] })], jobStateFor({ fallbacksToday: 100 }), network({ [TH_ROUTES.search]: [401, synth().refus401] }));
    await done;
    expect(f.named("radar/radarNetworks:finishNetworkSearch").map((c) => [c.args.appId, c.args.outcome, c.args.searched])).toEqual([["radarApps_focus", "error", false]]);
    expect(String(f.named("radar/radarNetworks:finishNetworkSearch")[0].args.error)).toContain("401");
    expect(pathsOf(net, TH_ROUTES.search)).toHaveLength(1);
  });

  // ScrapeCreators sous sa réserve (palier « reserve » : 1 400 crédits, réserve 1 500), TikHub ouvert, sous `network` :
  // chaque app a au moins une passe chez ScrapeCreators. Corrigé le 20/11/2026 : la part TikHub rendait toutes les apps
  // dues, et chacune coûtait une lecture de l'état (jobState : radarUsage du mois, réglages) et une réécriture de son
  // document (« budget »), à chaque passage, pour aucun appel — la file grossissant jusqu'aux ~2 000 apps actives.
  const reserve = { balance: { remaining: 1_400, seenAt: NOW - 60_000, now: NOW, perDay: 1_000 } };
  const many = (n: number) => Array.from({ length: n }, (_, i) => focus({ id: `radarApps_${i}`, rival: i % 2 === 0 }));

  it("ScrapeCreators fermé (réserve), TikHub ouvert : les apps qui ont besoin de ScrapeCreators ne sont ni relues ni réécrites, aucun appel", async () => {
    setEnv("network");
    const { net, f, done } = run(many(30), jobStateFor(reserve));
    await done;
    expect(f.named("radar/radarSignals:jobState")).toHaveLength(1);
    expect(f.named("radar/radarNetworks:finishNetworkSearch")).toHaveLength(0);
    expect(f.named("radar/radarNetworks:startNetworkSearch")).toHaveLength(0);
    expect(net.calls.filter((c) => !c.url.includes("/api/v1/tikhub/user/"))).toHaveLength(0);
  });

  it("ScrapeCreators se ferme en cours de passage : l'app où on le voit dit « budget » sans être commencée ni rien payer chez TikHub, les suivantes ne sont plus relues", async () => {
    setEnv("network");
    const apps = many(10);
    const net = network();
    // Chaque appel payant chez TikHub, noté avec le nombre d'apps déjà finies à ce moment.
    const paidTh: number[] = [];
    vi.stubGlobal("fetch", (async (input: string | URL | Request, init?: RequestInit) => {
      const u = String(input);
      if (u.includes("api.tikhub.io") && !u.includes("/api/v1/tikhub/user/")) paidTh.push(finish(f).length);
      return net.impl(input, init);
    }) as typeof fetch);
    let reads = 0;
    const f = taskCtx({
      // Le passage s'ouvre ScrapeCreators ouvert ; à la relecture d'avant la 2e app, il est sous sa réserve.
      "radar/radarSignals:jobState": () => (reads++ === 0 ? jobStateFor() : jobStateFor(reserve)),
      "radar/radarNetworks:dueApps": () => apps,
      "radar/radarNetworks:attachFromSearch": () => ({ attached: 1, signals: 0 }),
      "radar/radarNetworks:hashtagIdOf": () => ({ cid: "6960094601675801580", at: NOW }),
    });
    await drive(handlerOf(runNetworkSearch)(f.ctx, {}) as Promise<unknown>);
    expect(f.named("radar/radarSignals:jobState")).toHaveLength(2);
    expect(finish(f).map((x) => [x.appId, x.outcome])).toEqual([
      ["radarApps_0", "done"],
      ["radarApps_1", "budget"],
    ]);
    // La 2e app n'est pas commencée, et rien n'est payé chez TikHub pour une recherche qui serait refaite : tous les appels
    // payants ont été faits pour la 1re (garde « une passe doit partir chez ScrapeCreators, fermé »).
    expect(f.named("radar/radarNetworks:startNetworkSearch").map((c) => c.args.appId)).toEqual(["radarApps_0"]);
    expect(paidTh.length).toBeGreaterThan(0);
    expect(paidTh.every((n) => n === 0)).toBe(true);
    // Une fois ScrapeCreators vu fermé, les apps suivantes qui en ont besoin ne sont même plus relues (identifiants de
    // hashtags compris) : seules les deux premières l'ont été.
    expect(f.named("radar/radarNetworks:hashtagIdOf")).toHaveLength(2);
  });

  // TikHub sous sa réserve (solde à 0), ScrapeCreators ouvert, porte de repli fermée (quota du jour pris), sous `network`.
  // Corrigé le 20/11/2026 : une concurrente dont la première passe part chez ScrapeCreators (mot-clé sans région) payait
  // ses 3 pages, puis sa passe FR (chez TikHub) arrêtait le passage (« budget ») ; jamais reportée et remise en tête, elle
  // repayait ces pages à chaque passage (~72 crédits par jour), et aucune autre app du réseau n'avançait.
  const thDry = () => jobStateFor({ th: { ...freshTh(), paidUsd: 0, freeUsd: 0 }, fallbacksToday: 100 });
  const solo = () => focus({ id: "radarApps_solo", name: "Solo", searches: ["#solo"], rival: false });

  it("TikHub fermé, porte de repli fermée : une app qui a besoin de TikHub n'est ni commencée ni payée chez ScrapeCreators ; une app servie par ScrapeCreators seul est cherchée", async () => {
    setEnv("network");
    const { net, f, store, done } = run([focus({ searches: ["focus town"] }), solo()], thDry());
    // « solo » : son hashtag est introuvable chez TikHub (gardé moins de 7 jours) — ses passes sont chez ScrapeCreators.
    store.set("solo", { cid: null, at: NOW - 3_600_000 });
    await done;
    expect(scCalls(net, "/v1/tiktok/search/keyword")).toHaveLength(0);
    expect(f.named("radar/radarNetworks:startNetworkSearch").map((c) => c.args.appId)).toEqual(["radarApps_solo"]);
    expect(finish(f)).toEqual([{ appId: "radarApps_solo", outcome: "done", searched: true, error: undefined }]);
    expect(net.calls.filter((c) => c.url.includes("api.tikhub.io") && !c.url.includes("/api/v1/tikhub/user/"))).toHaveLength(0);
  });

  it("TikHub fermé, porte de repli fermée : une app dont le hashtag part chez TikHub (identifiant gardé) dit « budget », n'est pas commencée, et le passage continue ; les suivantes qui ont besoin de TikHub ne sont plus touchées", async () => {
    setEnv("network");
    const autre = focus({ id: "radarApps_autre", name: "Autre", searches: ["#autre"], rival: false });
    const { net, f, store, done } = run([focus({ searches: ["#focustown"] }), solo(), autre], thDry());
    store.set("focustown", { cid: "6960094601675801580", at: NOW - 3_600_000 });
    store.set("solo", { cid: null, at: NOW - 3_600_000 });
    store.set("autre", { cid: "123", at: NOW - 3_600_000 });
    await done;
    expect(f.named("radar/radarNetworks:startNetworkSearch").map((c) => c.args.appId)).toEqual(["radarApps_solo"]);
    expect(finish(f).map((x) => [x.appId, x.outcome, x.searched])).toEqual([
      ["radarApps_focus", "budget", false],
      ["radarApps_solo", "done", true],
    ]);
    expect(scCalls(net, "/v1/tiktok/search/hashtag").filter((p) => p.hashtag !== "solo")).toHaveLength(0);
    // L'état n'est relu que pour les apps touchées (à l'ouverture, puis avant « solo »).
    expect(f.named("radar/radarSignals:jobState")).toHaveLength(2);
  });

  it("ScrapeCreators fermé, recherche demandée à l'écran : l'app dit « budget », rien n'est appelé", async () => {
    setEnv("network");
    const net = network();
    vi.stubGlobal("fetch", net.impl);
    const f = taskCtx({
      "radar/radarSignals:jobState": () => jobStateFor(reserve),
      "radar/radarNetworks:appToSearch": () => focus(),
    });
    await drive(handlerOf(runNetworkSearch)(f.ctx, { appId: "radarApps_focus" }) as Promise<unknown>);
    expect(finish(f)).toEqual([{ appId: "radarApps_focus", outcome: "budget", searched: false, error: undefined }]);
    expect(f.named("radar/radarNetworks:startNetworkSearch")).toHaveLength(0);
    expect(net.calls.filter((c) => !c.url.includes("/api/v1/tikhub/user/"))).toHaveLength(0);
  });

  // ─── Échecs et replis d'une recherche de réseau (corrigés le 20/11/2026) ───
  const finish = (f: ReturnType<typeof fakeActionCtx>) => f.named("radar/radarNetworks:finishNetworkSearch").map((c) => ({ appId: c.args.appId, outcome: c.args.outcome, searched: c.args.searched, error: c.args.error }));
  const total = (f: ReturnType<typeof fakeActionCtx>, k: string) => f.named("radar/radarSignals:recordRun").reduce((n, c) => n + Number(c.args[k] ?? 0), 0);
  const scCalls = (net: ReturnType<typeof network>, p: string) =>
    net.calls.filter((c) => c.url.startsWith("https://api.scrapecreators.com") && new URL(c.url).pathname === p).map((c) => Object.fromEntries(new URL(c.url).searchParams));
  const offsets = (net: ReturnType<typeof network>) => pathsOf(net, TH_ROUTES.search).map((p) => Number(p.offset));

  const isolated: [string, [number, unknown] | Error, number[]][] = [
    ["un 5xx, redemandé une fois", [500, synth().refus500], [0, 30, 30]],
    ["un délai dépassé, facturation inconnue (pas redemandé)", new Error("TimeoutError: signal timed out"), [0, 30]],
  ];
  // Sans repli (quota du jour pris), ou porte de repli OUVERTE : une page 2 ne repasse jamais par ScrapeCreators — une
  // pagination ne se poursuit pas chez l'autre fournisseur (le décalage est celui de TikHub). Porte ouverte, la règle
  // « première page » est la seule à refuser le repli (mutant `firstPage: true` vert jusqu'au 20/11/2026).
  const gates: [string, Partial<JobState>][] = [
    ["sans repli", { fallbacksToday: 100 }],
    ["porte de repli ouverte", {}],
  ];
  for (const [nom, answer, wanted] of isolated) {
    for (const [porte, over] of gates) {
      it(`échec isolé de TikHub (${nom}) en page 2 du mot-clé FR, ${porte} : la passe s'arrête là, comme une page refusée chez ScrapeCreators ; les autres passes sont faites, l'app est cherchée (pas repayée au passage suivant)`, async () => {
        setEnv("network");
        const { net, f, done } = run(
          [focus({ searches: ["focus town"] })],
          jobStateFor(over),
          network({ [TH_ROUTES.search]: (url) => (new URL(url).searchParams.get("offset") === "0" ? [200, pageA()] : answer) }),
        );
        await done;
        expect(offsets(net)).toEqual(wanted);
        // La passe sans région (chez ScrapeCreators) est faite en entier, après celle qui a échoué.
        expect(scCalls(net, "/v1/tiktok/search/keyword").length).toBeGreaterThan(0);
        // Rien en FR chez ScrapeCreators, aucun repli.
        expect(scCalls(net, "/v1/tiktok/search/keyword").filter((p) => p.region === "FR")).toHaveLength(0);
        expect(total(f, "thFallbacks")).toBe(0);
        expect(finish(f)).toEqual([{ appId: "radarApps_focus", outcome: "done", searched: true, error: undefined }]);
        expect(total(f, "errors")).toBe(1);
      });
    }
  }

  // La part TikHub du passage s'épuise après la page 1 du mot-clé FR (un appel de solde), porte de repli ouverte : la page
  // 2 ne part ni chez TikHub ni en repli chez ScrapeCreators (pagination non mêlée, canCall et la porte le refusent
  // tous deux) ; la recherche n'est pas finie, l'app reste due (« budget »).
  it("part TikHub épuisée après la page 1 du mot-clé FR, porte de repli ouverte : la page 2 ne part pas en repli, l'app reste due", async () => {
    setEnv("network");
    const { net, f, done } = run([focus({ searches: ["focus town"] })], jobStateFor({ th: { ...freshTh(), paidUsd: 0.001, freeUsd: 0 } }));
    await done;
    expect(offsets(net)).toEqual([0]);
    expect(scCalls(net, "/v1/tiktok/search/keyword").filter((p) => p.region === "FR")).toHaveLength(0);
    expect(total(f, "thFallbacks")).toBe(0);
    expect(finish(f)).toEqual([{ appId: "radarApps_focus", outcome: "budget", searched: false, error: undefined }]);
    expect(total(f, "errors")).toBe(0);
  });

  it("budget TikHub épuisé à moins de 90 s de l'échéance (repli refusé) : rien n'est parti chez TikHub, l'app reste due (« budget »), pas cherchée à moitié", async () => {
    setEnv("network");
    const net = network();
    // La passe sans région (chez ScrapeCreators) prend 7 min 10 s : la passe FR arrive 50 s avant l'échéance (8 min).
    let slow = true;
    vi.stubGlobal("fetch", (async (input: string | URL | Request, init?: RequestInit) => {
      if (slow && String(input).includes("api.scrapecreators.com")) {
        slow = false;
        vi.setSystemTime(Date.now() + 7 * 60_000 + 10_000);
      }
      return net.impl(input, init);
    }) as typeof fetch);
    const store = new Map<string, { cid: string | null; at: number }>();
    const f = taskCtx({
      // Aucun solde TikHub : la passe FR ne peut partir que par la porte de repli, refusée si près de l'échéance.
      "radar/radarSignals:jobState": () => jobStateFor({ th: { ...freshTh(), paidUsd: 0, freeUsd: 0 } }),
      "radar/radarNetworks:dueApps": () => [focus({ searches: ["focus town"], rival: false })],
      "radar/radarNetworks:attachFromSearch": () => ({ attached: 1, signals: 0 }),
      "radar/radarNetworks:hashtagIdOf": (a) => store.get(String(a.tag)) ?? null,
    });
    await drive(handlerOf(runNetworkSearch)(f.ctx, {}) as Promise<unknown>);
    expect(offsets(net)).toEqual([]);
    expect(scCalls(net, "/v1/tiktok/search/keyword").filter((p) => p.region === "FR")).toHaveLength(0);
    expect(finish(f)).toEqual([{ appId: "radarApps_focus", outcome: "budget", searched: false, error: undefined }]);
    // Un budget épuisé n'est pas une panne : ni erreur, ni appel compté pour ce qui n'est pas parti.
    expect(total(f, "errors")).toBe(0);
    expect(total(f, "calls")).toBe(scCalls(net, "/v1/tiktok/search/keyword").length);
  });

  // LE COUPE-CIRCUIT NE GARDE DUES QUE LES APPS QU'IL A EMPÊCHÉES DE PARTIR (corrigé le 21/11/2026). L'app dont les refus le
  // font sauter est cherchée : ses refus sont conclus comme des pages refusées chez ScrapeCreators. Elle finissait en
  // erreur, jamais cherchée, et revenait en tête de file à chaque passage — ses pages ScrapeCreators repayées.
  it("trois refus TikHub d'affilée dans la même app : le coupe-circuit saute sur ses refus, l'app est cherchée ; l'app suivante n'est pas commencée, le passage s'arrête", async () => {
    setEnv("network");
    const { net, f, done } = run(
      [focus({ searches: ["focus town", "focus app", "focustown app"] }), focus({ id: "radarApps_autre", searches: ["autre"] })],
      jobStateFor({ fallbacksToday: 100 }),
      network({ [TH_ROUTES.search]: [500, synth().refus500] }),
    );
    await done;
    expect(offsets(net)).toEqual([0, 0, 0, 0, 0, 0]);
    expect(finish(f)).toEqual([{ appId: "radarApps_focus", outcome: "done", searched: true, error: undefined }]);
    // L'app suivante (une passe chez TikHub, porte de repli fermée) n'est pas touchée : rien de payé chez ScrapeCreators.
    expect(f.named("radar/radarNetworks:startNetworkSearch").map((c) => c.args.appId)).toEqual(["radarApps_focus"]);
    expect(scCalls(net, "/v1/tiktok/search/keyword").filter((p) => p.query === "autre")).toHaveLength(0);
    expect(total(f, "errors")).toBe(3);
  });

  it("quatre passes chez TikHub, le coupe-circuit saute à la 3e : la 4e est sautée sans appel ni erreur, l'app est cherchée comme une routine", async () => {
    setEnv("network");
    const { net, f, done } = run(
      [focus({ searches: ["focus town", "focus app", "focustown app", "focus timer"], deep: true })],
      jobStateFor({ fallbacksToday: 100 }),
      network({ [TH_ROUTES.search]: [500, synth().refus500] }),
    );
    await done;
    expect(pathsOf(net, TH_ROUTES.search).map((p) => p.keyword)).toEqual(["focus town", "focus town", "focus app", "focus app", "focustown app", "focustown app"]);
    const fin = f.named("radar/radarNetworks:finishNetworkSearch").map((c) => c.args);
    expect(fin.map((a) => [a.outcome, a.searched, a.deep])).toEqual([["done", true, false]]);
    expect(total(f, "errors")).toBe(3);
    // Les quatre passes sans région sont faites chez ScrapeCreators ; l'appel qui n'est pas parti n'est pas compté.
    expect(new Set(scCalls(net, "/v1/tiktok/search/keyword").map((p) => p.query))).toEqual(new Set(["focus town", "focus app", "focustown app", "focus timer"]));
    expect(total(f, "calls")).toBe(scCalls(net, "/v1/tiktok/search/keyword").length + 3);
  });

  it("deux passages, la route de recherche TikHub refuse toujours : l'app des refus n'est pas remise en tête, la suivante avance au passage d'après", async () => {
    setEnv("network");
    const apps = [focus({ searches: ["focus town", "focus app", "focustown app"] }), focus({ id: "radarApps_autre", searches: ["autre"] })];
    // La file de dueApps (networkQueueOrder) : la date de la dernière recherche, écrite par finishNetworkSearch.
    const searchedAt = new Map<string, number>();
    const passage = async () => {
      const net = network({ [TH_ROUTES.search]: [500, synth().refus500] });
      vi.stubGlobal("fetch", net.impl);
      const f = taskCtx({
        "radar/radarSignals:jobState": () => jobStateFor({ fallbacksToday: 100 }),
        "radar/radarNetworks:dueApps": () => [...apps].sort((x, y) => networkQueueOrder({ ...x, networkSearchedAt: searchedAt.get(x.id) }, { ...y, networkSearchedAt: searchedAt.get(y.id) })),
        "radar/radarNetworks:attachFromSearch": () => ({ attached: 1, signals: 0 }),
        "radar/radarNetworks:finishNetworkSearch": (a) => void (a.searched ? searchedAt.set(String(a.appId), Number(a.now)) : undefined),
      });
      await drive(handlerOf(runNetworkSearch)(f.ctx, {}) as Promise<unknown>);
      vi.setSystemTime(Date.now() + 3_600_000);
      return { net, started: f.named("radar/radarNetworks:startNetworkSearch").map((c) => String(c.args.appId)) };
    };
    const one = await passage();
    expect(one.started).toEqual(["radarApps_focus"]);
    const two = await passage();
    // L'app suivante passe en tête : son refus est conclu, puis l'app des refus d'hier, cherchée à nouveau à son tour.
    expect(two.started[0]).toBe("radarApps_autre");
    expect(scCalls(two.net, "/v1/tiktok/search/keyword")[0].query).toBe("autre");
    expect(searchedAt.has("radarApps_autre")).toBe(true);
  });

  it("clé TikHub refusée (401) à la première passe de l'app : aucun appel n'a été refusé par TikHub lui-même, l'app reste due, en erreur", async () => {
    setEnv("network");
    const { net, f, done } = run([focus({ searches: ["focus town", "focus app"] })], jobStateFor({ fallbacksToday: 100 }), network({ [TH_ROUTES.search]: [401, { detail: "clé refusée" }] }));
    await done;
    expect(offsets(net)).toEqual([0]);
    expect(finish(f).map((x) => [x.outcome, x.searched])).toEqual([["error", false]]);
  });

  const refusals: [string, [number, unknown], { errors: number; thCalls: number }][] = [
    ["refusé par TikTok (réponse 200 facturée, status_code ≠ 0)", [200, { ...synth().upstream, router: TH_ROUTES.hashtagSearch }], { errors: 1, thCalls: 1 }],
    ["en panne isolée (5xx, redemandé une fois)", [500, synth().refus500], { errors: 1, thCalls: 0 }],
  ];
  for (const [nom, answer, cost] of refusals) {
    it(`identifiant du hashtag ${nom} : repli permis, sa première page repasse par ScrapeCreators sans région, l'échec payé compris ; rien n'est gardé`, async () => {
      setEnv("network");
      const { net, f, store, done } = run([focus({ searches: ["#focustown"] })], jobStateFor(), network({ [TH_ROUTES.hashtagSearch]: answer }));
      await done;
      expect(pathsOf(net, TH_ROUTES.hashtagVideos)).toHaveLength(0);
      // Une seule page sans région chez ScrapeCreators : sa pagination ne se poursuit pas.
      expect(scCalls(net, "/v1/tiktok/search/hashtag").filter((p) => p.region === undefined)).toEqual([{ hashtag: "focustown" }]);
      expect(store.size).toBe(0);
      expect(finish(f)).toEqual([{ appId: "radarApps_focus", outcome: "done", searched: true, error: undefined }]);
      expect([total(f, "thFallbacks"), total(f, "thCalls"), total(f, "errors")]).toEqual([1, cost.thCalls, 0]);
    });

    it(`identifiant du hashtag ${nom} : sans repli, la passe est sautée (un échec), l'app est cherchée — pas une panne qui la laisserait due`, async () => {
      setEnv("network");
      const { net, f, store, done } = run([focus({ searches: ["#focustown"] })], jobStateFor({ fallbacksToday: 100 }), network({ [TH_ROUTES.hashtagSearch]: answer }));
      await done;
      expect(pathsOf(net, TH_ROUTES.hashtagVideos)).toHaveLength(0);
      expect(scCalls(net, "/v1/tiktok/search/hashtag").filter((p) => p.region === undefined)).toHaveLength(0);
      // La passe FR (chez ScrapeCreators) est faite.
      expect(scCalls(net, "/v1/tiktok/search/hashtag").filter((p) => p.region === "FR").length).toBeGreaterThan(0);
      expect(store.size).toBe(0);
      expect(finish(f)).toEqual([{ appId: "radarApps_focus", outcome: "done", searched: true, error: undefined }]);
      expect([total(f, "thFallbacks"), total(f, "thCalls"), total(f, "errors")]).toEqual([0, cost.thCalls, cost.errors]);
    });
  }

  // La part TikHub du poste est épuisée (solde à 0) : l'identifiant d'un hashtag jamais cherché ne peut pas être lu.
  // Corrigé le 20/11/2026 : le passage s'arrêtait là (issue « budget »), sans jamais essayer la porte de repli, à chaque
  // passage tant que TikHub n'était pas rechargé — les apps suivantes, même en mot-clé seul, jamais atteintes.
  it("budget TikHub épuisé, identifiant du hashtag jamais cherché : sa première page passe par la porte de repli (un repli), et le passage continue", async () => {
    setEnv("network");
    const { net, f, done } = run(
      [focus({ searches: ["#focustown"] }), focus({ id: "radarApps_autre", searches: ["autre"] })],
      jobStateFor({ th: { ...freshTh(), paidUsd: 0, freeUsd: 0 } }),
    );
    await done;
    expect(pathsOf(net, TH_ROUTES.hashtagSearch)).toHaveLength(0);
    expect(scCalls(net, "/v1/tiktok/search/hashtag").filter((p) => p.region === undefined)).toEqual([{ hashtag: "focustown" }]);
    expect(total(f, "thFallbacks")).toBeGreaterThanOrEqual(1);
    expect(finish(f).map((x) => [x.appId, x.outcome, x.searched])).toEqual([
      ["radarApps_focus", "done", true],
      ["radarApps_autre", "done", true],
    ]);
  });

  // Le solde TikHub rangé a plus d'une minute : le passage le relit à son ouverture (0,003 $ : 3 appels), et la part de
  // chaque app suivante se recalcule sur ce solde LU, moins ce que le passage a payé chez TikHub depuis. La 1re app paie
  // ses 3 pages chez TikHub ; la 2e ne voit plus rien chez TikHub (repli fermé) : « budget », aucun appel. Ajouté le
  // 20/11/2026 : `spentSinceUsd` n'était vérifié qu'à l'ouverture — mutant à 0 (le solde vu par les apps 2..N ne baisse
  // plus de ce que les précédentes ont payé) : tous les tests verts, et ici 3 appels de plus que le solde.
  it("solde TikHub lu à l'ouverture : l'app suivante voit ce solde moins ce que les précédentes ont payé chez TikHub", async () => {
    setEnv("network");
    const solde = { ...synth().solde, user_data: { ...synth().solde.user_data, balance: 0.003, free_credit: 0 } };
    const { net, f, done } = run(
      [focus({ searches: ["focus town"] }), focus({ id: "radarApps_autre", searches: ["autre"] })],
      jobStateFor({ fallbacksToday: 100, th: { ...freshTh(), seenAt: NOW - 5 * 60_000 } }),
      network({ [TH_ROUTES.balance]: [200, solde] }),
    );
    await done;
    expect(pathsOf(net, TH_ROUTES.search).map((p) => [p.keyword, Number(p.offset)])).toEqual([
      ["focus town", 0],
      ["focus town", 30],
      ["focus town", 60],
    ]);
    expect(f.named("radar/radarNetworks:finishNetworkSearch").map((c) => [c.args.appId, c.args.outcome, c.args.searched])).toEqual([
      ["radarApps_focus", "done", true],
      ["radarApps_autre", "budget", false],
    ]);
    expect(total(f, "thCalls")).toBe(3);
  });

  // Même cas, mais la base refuse la place de repli (un autre passage a pris le quota du jour) : ni l'identifiant du
  // hashtag ni sa première page ne sont lus. Rien n'a été lu de cette passe : la recherche n'est pas finie, l'app reste
  // due (« budget »), et le passage s'arrête là. Ajouté le 20/11/2026 : seul le cas où le repli passe était testé — sans
  // `complete = false`, l'app sortait « cherchée » (sa recherche complète enregistrée) sans que ce hashtag ait été lu,
  // le défaut corrigé par e736968 rouvert par un autre chemin.
  it("budget TikHub épuisé, identifiant du hashtag jamais cherché, place de repli refusée : rien n'est lu, l'app reste due (« budget »), le passage s'arrête", async () => {
    setEnv("network");
    const net = network();
    vi.stubGlobal("fetch", net.impl);
    const f = taskCtx({
      "radar/radarSignals:jobState": () => jobStateFor({ th: { ...freshTh(), paidUsd: 0, freeUsd: 0 } }),
      "radar/radarSignals:claimFallback": () => false,
      "radar/radarNetworks:dueApps": () => [focus({ searches: ["#focustown"], deep: true }), focus({ id: "radarApps_autre", searches: ["autre"] })],
      "radar/radarNetworks:attachFromSearch": () => ({ attached: 1, signals: 0 }),
      "radar/radarNetworks:hashtagIdOf": () => null,
    });
    await drive(handlerOf(runNetworkSearch)(f.ctx, {}) as Promise<unknown>);
    // La place a bien été demandée (et refusée) : c'est ce refus qui arrête la passe, pas un solde vu à l'ouverture.
    expect(f.named("radar/radarSignals:claimFallback")).toHaveLength(1);
    expect(pathsOf(net, TH_ROUTES.hashtagSearch)).toHaveLength(0);
    expect(scCalls(net, "/v1/tiktok/search/hashtag").filter((p) => p.region === undefined)).toHaveLength(0);
    expect(f.named("radar/radarNetworks:finishNetworkSearch").map((c) => [c.args.appId, c.args.outcome, c.args.searched])).toEqual([["radarApps_focus", "budget", false]]);
    // L'app suivante n'est pas commencée.
    expect(f.named("radar/radarNetworks:startNetworkSearch").map((c) => c.args.appId)).toEqual(["radarApps_focus"]);
    expect([total(f, "thFallbacks"), total(f, "errors")]).toEqual([0, 0]);
  });

  // Même cas, la porte de repli fermée par l'échéance : le passage arrive à l'app 75 s avant elle (un repli en demande
  // 90), sans être expiré (un appel TikHub en demande 60). Sans la garde, la passe partait quand même dans la boucle des
  // pages, qui ne sait pas lire un hashtag sans identifiant : l'app finissait en erreur et le passage continuait.
  it("budget TikHub épuisé, identifiant du hashtag jamais cherché, repli refusé à 75 s de l'échéance : l'app reste due (« budget »), le passage s'arrête", async () => {
    setEnv("network");
    const net = network({ "/v1/tiktok/search/hashtag": [200, { success: true, credits_charged: 1, credits_remaining: 30_000, aweme_list: fixture("sc/profil.json").aweme_list }] });
    // L'app d'avant est lue chez ScrapeCreators (son hashtag est gardé introuvable chez TikHub) ; sa première page prend
    // 6 min 45 s.
    let slow = true;
    vi.stubGlobal("fetch", (async (input: string | URL | Request, init?: RequestInit) => {
      if (slow && String(input).includes("api.scrapecreators.com")) {
        slow = false;
        vi.setSystemTime(Date.now() + 6 * 60_000 + 45_000);
      }
      return net.impl(input, init);
    }) as typeof fetch);
    const f = taskCtx({
      "radar/radarSignals:jobState": () => jobStateFor({ th: { ...freshTh(), paidUsd: 0, freeUsd: 0 } }),
      "radar/radarNetworks:dueApps": () => [
        focus({ id: "radarApps_lente", searches: ["#lente"] }),
        focus({ searches: ["#focustown"], deep: true }),
        focus({ id: "radarApps_autre", searches: ["#autre"] }),
      ],
      "radar/radarNetworks:attachFromSearch": () => ({ attached: 1, signals: 0 }),
      "radar/radarNetworks:hashtagIdOf": (a) => (a.tag === "lente" ? { cid: null, at: NOW } : null),
    });
    await drive(handlerOf(runNetworkSearch)(f.ctx, {}) as Promise<unknown>);
    expect(pathsOf(net, TH_ROUTES.hashtagSearch)).toHaveLength(0);
    expect(scCalls(net, "/v1/tiktok/search/hashtag").map((p) => p.hashtag)).toEqual(["lente", "lente"]);
    expect(f.named("radar/radarNetworks:finishNetworkSearch").map((c) => [c.args.appId, c.args.outcome, c.args.searched])).toEqual([
      ["radarApps_lente", "done", true],
      ["radarApps_focus", "budget", false],
    ]);
    expect(f.named("radar/radarNetworks:startNetworkSearch").map((c) => c.args.appId)).toEqual(["radarApps_lente", "radarApps_focus"]);
    expect([total(f, "thFallbacks"), total(f, "errors")]).toEqual([0, 0]);
  });

  // Une passe dont la première page est servie par ScrapeCreators EN REPLI ne se poursuit pas (pagination non mêlée) :
  // la recherche complète est tronquée. Corrigé le 20/11/2026 : elle était quand même enregistrée comme faite
  // (deepSearchedAt), et ne revenait jamais. Elle est désormais enregistrée comme une recherche de routine : l'app
  // revient à son prochain tour, en recherche complète.
  it("recherche complète dont une passe s'arrête après une page servie en repli : l'app est cherchée, mais sa recherche complète n'est pas enregistrée", async () => {
    setEnv("network");
    const scKw = { success: true, credits_charged: 1, credits_remaining: 30_000, search_item_list: fixture("sc/reseau-motcle.json").search_item_list, cursor: 30 };
    const { net, f, done } = run([focus({ searches: ["focus town"], deep: true, rival: false })], jobStateFor(), network({ [TH_ROUTES.search]: [500, synth().refus500], "/v1/tiktok/search/keyword": [200, scKw] }));
    await done;
    // La passe FR par pertinence : une page TikHub (redemandée), puis une page en repli, et rien de plus.
    expect(offsets(net)).toEqual([0, 0]);
    expect(scCalls(net, "/v1/tiktok/search/keyword").filter((p) => p.region === "FR" && p.sort_by === "relevance")).toHaveLength(1);
    expect(total(f, "thFallbacks")).toBe(1);
    const fin = f.named("radar/radarNetworks:finishNetworkSearch")[0].args;
    expect(fin).toMatchObject({ outcome: "done", searched: true });
    expect(fin.deep).toBe(false);
  });

  it("recherche complète dont la passe en repli n'avait de toute façon pas de page suivante : enregistrée", async () => {
    setEnv("network");
    // ScrapeCreators ne rend pas de curseur : la passe aurait fini là, chez lui aussi.
    const scKw = { success: true, credits_charged: 1, credits_remaining: 30_000, search_item_list: fixture("sc/reseau-motcle.json").search_item_list };
    const { f, done } = run([focus({ searches: ["focus town"], deep: true, rival: false })], jobStateFor(), network({ [TH_ROUTES.search]: [500, synth().refus500], "/v1/tiktok/search/keyword": [200, scKw] }));
    await done;
    expect(f.named("radar/radarNetworks:finishNetworkSearch")[0].args).toMatchObject({ outcome: "done", searched: true, deep: true });
  });

  it("mot-clé FR : première page TikHub en panne (5xx), repli permis — servie par ScrapeCreators en FR ; la suite de la passe ne repart pas chez TikHub (pas de pagination mêlée)", async () => {
    setEnv("network");
    // ScrapeCreators annonce une page suivante : seule la règle « un repli ne se poursuit pas » arrête la passe.
    const scPage = { success: true, credits_charged: 1, credits_remaining: 30_000, search_item_list: fixture("sc/reseau-motcle.json").search_item_list, cursor: 30 };
    const { net, f, done } = run([focus({ searches: ["focus town"] })], jobStateFor(), network({ [TH_ROUTES.search]: [500, synth().refus500], "/v1/tiktok/search/keyword": [200, scPage] }));
    await done;
    // Une page TikHub, redemandée une fois ; rien en page 2.
    expect(offsets(net)).toEqual([0, 0]);
    expect(scCalls(net, "/v1/tiktok/search/keyword").filter((p) => p.region === "FR")).toEqual([{ query: "focus town", date_posted: "last-3-months", sort_by: "relevance", region: "FR" }]);
    expect(f.named("radar/radarNetworks:attachFromSearch").filter((c) => c.args.foundBy === "réseau Focus Town·fr")).toHaveLength(1);
    expect([total(f, "thFallbacks"), total(f, "errors")]).toEqual([1, 0]);
    expect(finish(f)).toEqual([{ appId: "radarApps_focus", outcome: "done", searched: true, error: undefined }]);
  });
});

describe("attachFromSearch : abonnés non mesurés (mot-clé chez TikHub)", () => {
  const app: MemoryDoc = { _id: "radarApps_trace", _creationTime: 1, slug: "trace", name: "Trace", rivalOf: ["snytch"], strong: ["trace"], weak: [], context: [], searches: [], status: "active", source: "manual", createdAt: 0, trackedCount: 0 };
  const video = { videoId: "v1", url: "https://www.tiktok.com/@nouvelle/video/v1", authorId: "nouvelle", authorHandle: "nouvelle", authorFans: 0, caption: "j'adore trace", lang: "fr", publishedAt: NOW - 3_600_000, isAd: false, views: 80_000, likes: 1, comments: 0, shares: 0, saves: 0 };
  const monde = () => writableDb({ radarApps: [{ ...app }], radarTracked: [], radarRejected: [], radarSignals: [] });

  it("le compte entre (à 0 abonné, à vérifier), la vidéo neuve n'entre pas dans les signaux", async () => {
    const w = monde();
    const r = await handlerOf(attachFromSearch)({ db: w.db }, { appId: app._id, videos: [video], foundBy: "réseau Trace·fr", now: NOW, fansUnknown: ["v1"] });
    expect(r).toEqual({ attached: 1, signals: 0, updated: 0 });
    expect(w.tables.radarTracked.map((t) => [t.handle, t.fans])).toEqual([["nouvelle", 0]]);
    expect(w.tables.radarSignals).toHaveLength(0);
    // Sans la liste : 80 000 vues pour « 0 abonné », la vidéo entrerait sur un ratio inventé.
    const w2 = monde();
    expect(await handlerOf(attachFromSearch)({ db: w2.db }, { appId: app._id, videos: [video], foundBy: "réseau Trace·fr", now: NOW })).toEqual({ attached: 1, signals: 1, updated: 0 });
  });
});

describe("runAccountReads chez TikHub (tiktok)", () => {
  const account = (handle: string, first = false) => ({ id: `radarTracked_${handle}`, handle, located: false, first, dueAt: NOW - 2 * 3_600_000 });
  /**
   * Les pages publiques de TikTok refusent (500) : les comptes passent au relevé payant. `opts.www` : ce qu'elles
   * répondent à la place ; `opts.latency` : le temps que met une réponse de TikHub ou de ScrapeCreators (minuterie
   * simulée) ; `opts.ctx` : des réponses de la base à la place de celles prévues.
   */
  function reads(
    st: JobState,
    due: ReturnType<typeof account>[],
    over: Parameters<typeof thAndSc>[0] = {},
    opts: { www?: (url: string) => [number, string]; latency?: (url: string) => number; ctx?: Parameters<typeof taskCtx>[0] } = {},
  ) {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const net = thAndSc({
      [TH_ROUTES.profile]: (url) => [200, new URL(url).searchParams.get("unique_id") === "mort" ? fixture("tikhub/compte-inexistant.json") : fixture("tikhub/profil.json")],
      ...over,
    });
    const fetch = (async (input: string | URL | Request, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("www.tiktok.com")) {
        const [status, body] = opts.www?.(url) ?? [500, "refus"];
        return new Response(body, { status });
      }
      const ms = opts.latency?.(url) ?? 0;
      if (ms > 0) await new Promise<void>((done) => setTimeout(done, ms));
      return net.impl(input, init);
    }) as typeof globalThis.fetch;
    vi.stubGlobal("fetch", fetch);
    const f = taskCtx({
      "radar/radarSignals:jobState": () => st,
      "radar/radarNetworks:claimAccountsLease": () => true,
      "radar/radarNetworks:releaseAccountsLease": () => false,
      "radar/radarNetworks:appRules": () => [],
      "radar/radarNetworks:dueAccounts": () => ({ due, parked: [] }),
      "radar/radarNetworks:probeAccount": () => account("sonde"),
      // Depuis la fusion de #25 et #26 : la courbe passe d'abord dans la voie (rien de dû ici), et le relevé gratuit lit
      // ce qu'on a des vidéos de la liste AVANT de juger un trou (radarFreeMath.listReaches) — ici, rien.
      "radar/radarSignals:dueCurve": () => [],
      "radar/radarNetworks:freeKnown": () => [],
      ...opts.ctx,
    });
    return { net, f, done: drive(handlerOf(runAccountReads)(f.ctx, {}) as Promise<unknown>) };
  }
  const sum = (f: ReturnType<typeof fakeActionCtx>, k: string) => f.named("radar/radarSignals:recordRun").reduce((n, c) => n + Number(c.args[k] ?? 0), 0);
  const reasons = (f: ReturnType<typeof fakeActionCtx>) => {
    const out: Record<string, number> = {};
    for (const c of f.named("radar/radarSignals:recordRun")) for (const [k, v] of Object.entries((c.args.reasons as Record<string, number>) ?? {})) out[k] = (out[k] ?? 0) + v;
    return out;
  };

  it("les relevés payants partent chez TikHub, comptés en unités par motif, sans crédit ; un profil vide est une erreur de relevé", async () => {
    setEnv("tiktok");
    const due = [...["a1", "a2", "a3", "a4", "a5", "a6", "mort", "a8"].map((h) => account(h))];
    const { net, f, done } = reads(jobStateFor(), due);
    await done;
    expect(net.paths().filter((p) => p === TH_ROUTES.profile)).toHaveLength(8);
    expect(net.calls.filter((c) => c.url.includes("scrapecreators"))).toHaveLength(0);
    expect(f.named("radar/radarNetworks:markReadError").map((c) => c.args.accountId)).toEqual(["radarTracked_mort"]);
    expect(f.named("radar/radarNetworks:applyAccountRead")).toHaveLength(7);
    expect(reasons(f)).toEqual({ repli: 6, coupure: 2 });
    expect(sum(f, "credits")).toBe(0);
    expect(sum(f, "thCalls")).toBe(8);
    expect(sum(f, "thUsd")).toBeCloseTo(0.008, 9);
  });

  it("au-delà de 50 unités, la dépense TikHub est écrite en cours de route", async () => {
    setEnv("tiktok");
    const due = Array.from({ length: 60 }, (_, i) => account(`c${i}`));
    const { f, done } = reads(jobStateFor(), due);
    await done;
    const rec = f.named("radar/radarSignals:recordRun");
    expect(rec.length).toBeGreaterThanOrEqual(2);
    expect(Number(rec[0].args.thCalls)).toBeGreaterThanOrEqual(50);
    expect(sum(f, "thCalls")).toBe(60);
    expect(sum(f, "credits")).toBe(0);
  });

  it("ScrapeCreators sous la réserve, solde périmé : après 3 relevés chez TikHub, exactement une sonde chez ScrapeCreators", async () => {
    setEnv("tiktok");
    const st = jobStateFor({ balance: { remaining: 1_000, seenAt: NOW - 2 * 3_600_000, now: NOW, perDay: 1_000 } });
    const { net, f, done } = reads(st, ["a1", "a2", "a3"].map((h) => account(h)));
    await done;
    expect(net.paths().filter((p) => p === TH_ROUTES.profile)).toHaveLength(3);
    expect(net.calls.filter((c) => c.url.includes("api.scrapecreators.com/v3/tiktok/profile/videos"))).toHaveLength(1);
    expect(reasons(f)).toEqual({ repli: 3, sonde: 1 });
    expect(sum(f, "credits")).toBe(1);
    expect(f.named("radar/radarSignals:recordRun").some((c) => c.args.creditsRemaining === fixture("sc/profil.json").credits_remaining)).toBe(true);
  });

  it("ScrapeCreators en survie, TikHub normal : les premiers relevés ne sont pas reportés (ils partent chez TikHub)", async () => {
    setEnv("tiktok");
    const st = jobStateFor({ balance: { remaining: 1_500 + 1_000, seenAt: NOW, now: NOW, perDay: 2_000 } });
    const { net, f, done } = reads(st, [account("n1", true), account("n2", true)]);
    await done;
    expect(f.named("radar/radarNetworks:deferAccounts")).toHaveLength(0);
    expect(net.paths().filter((p) => p === TH_ROUTES.profile)).toHaveLength(2);
    expect(reasons(f)).toEqual({ premier: 2 });
  });

  describe("le plafond TikHub du jour", () => {
    const spentToday = (usd: number) => jobStateFor({ usage: [{ poste: "network", credits: 0, day: "2026-11-20", thCalls: Math.round(usd * 1000), thUsd: usd }] });
    const scProfile = (net: ReturnType<typeof thAndSc>) => net.calls.filter((c) => c.url.includes("api.scrapecreators.com/v3/tiktok/profile/videos"));

    it("5 $ déjà dépensés aujourd'hui chez TikHub (un autre poste) : aucun relevé chez TikHub ; seule la porte de repli passe chez ScrapeCreators, aucun compte en erreur", async () => {
      setEnv("tiktok");
      const { net, f, done } = reads(spentToday(5), ["a1", "a2", "a3"].map((h) => account(h)));
      await done;
      expect(net.paths().filter((p) => p === TH_ROUTES.profile)).toHaveLength(0);
      expect(scProfile(net)).toHaveLength(3);
      expect(sum(f, "thFallbacks")).toBe(3);
      expect(sum(f, "thCalls")).toBe(0);
      expect(f.named("radar/radarNetworks:markReadError")).toHaveLength(0);
    });

    // Le reste du plafond se juge sur la dépense comptée : les relevés menés de front (ACCOUNT_READ_POOL) partis avant
    // qu'elle ne l'atteigne passent encore — une borne à quelques appels près, jamais plus d'une vague.
    it("le reste du plafond borne le passage : 4,99 $ dépensés (10 appels), 30 comptes — 10 relevés chez TikHub plus au plus une vague en vol, la suite par la porte de repli", async () => {
      setEnv("tiktok");
      const { net, f, done } = reads(spentToday(4.99), Array.from({ length: 30 }, (_, i) => account(`p${i}`)));
      await done;
      const th = net.paths().filter((p) => p === TH_ROUTES.profile).length;
      expect(th).toBeGreaterThanOrEqual(10);
      expect(th).toBeLessThanOrEqual(10 + ACCOUNT_READ_POOL - 1);
      expect(sum(f, "thCalls")).toBe(th);
      expect(scProfile(net)).toHaveLength(30 - th);
      expect(sum(f, "thFallbacks")).toBe(30 - th);
      expect(f.named("radar/radarNetworks:markReadError")).toHaveLength(0);
    });

    it("RADAR_TIKHUB_USD_PER_DAY=10 : les mêmes 5 $ laissent partir les relevés chez TikHub", async () => {
      setEnv("tiktok");
      process.env.RADAR_TIKHUB_USD_PER_DAY = "10";
      const { net, done } = reads(spentToday(5), ["a1", "a2", "a3"].map((h) => account(h)));
      await done;
      expect(net.paths().filter((p) => p === TH_ROUTES.profile)).toHaveLength(3);
      expect(scProfile(net)).toHaveLength(0);
    });

    it("RADAR_TIKHUB_USD_PER_DAY=0, porte de repli fermée (quota du jour pris) : rien ne part, les comptes restent dus sans erreur", async () => {
      setEnv("tiktok");
      process.env.RADAR_TIKHUB_USD_PER_DAY = "0";
      const { net, f, done } = reads(jobStateFor({ fallbacksToday: 100 }), ["a1", "a2"].map((h) => account(h)));
      await done;
      expect(net.paths().filter((p) => p === TH_ROUTES.profile)).toHaveLength(0);
      expect(scProfile(net)).toHaveLength(0);
      expect(f.named("radar/radarNetworks:applyAccountRead")).toHaveLength(0);
      expect(f.named("radar/radarNetworks:markReadError")).toHaveLength(0);
    });
  });

  it("TikHub en panne n'empêche pas la sonde du solde ScrapeCreators", async () => {
    setEnv("tiktok");
    const st = jobStateFor({ fallbacksToday: 100, balance: { remaining: 1_000, seenAt: NOW - 2 * 3_600_000, now: NOW, perDay: 1_000 } });
    const { net, f, done } = reads(st, ["a1", "a2"].map((h) => account(h)), { [TH_ROUTES.profile]: [401, synth().refus401] });
    await done;
    expect(net.calls.filter((c) => c.url.includes("api.scrapecreators.com/v3/tiktok/profile/videos"))).toHaveLength(1);
    expect(reasons(f)).toEqual({ sonde: 1 });
    expect(f.named("radar/radarNetworks:markReadError")).toHaveLength(0);
  });

  // Un compte dont la page TikHub échoue à chaque fois (délai dépassé ou 5xx), repli fermé, sans panne de TikHub.
  // Corrigé le 20/11/2026 : l'échec rendait « skip », le compte ne prenait jamais d'erreur de relevé et repartait à
  // chaque passage (un délai payé au prix plein, un 5xx deux appels) sans jamais passer en pause. Avant la bascule, un
  // 5xx ou un délai chez ScrapeCreators donnait une erreur de relevé (en pause à la 3e).
  const lent: [string, [number, unknown] | Error][] = [
    ["délai dépassé", new Error("TimeoutError: signal timed out")],
    ["5xx redemandé", [500, { detail: { code: 500, message: "Internal server error." } }]],
  ];
  for (const [nom, answer] of lent) {
    it(`un échec isolé de TikHub sur un compte (${nom}), sans repli : une erreur de relevé pour lui seul, les autres relevés`, async () => {
      setEnv("tiktok");
      const due = ["a1", "lent", "a3", "a4"].map((h) => account(h));
      const { f, done } = reads(jobStateFor({ fallbacksToday: 100 }), due, {
        [TH_ROUTES.profile]: (url) => (new URL(url).searchParams.get("unique_id") === "lent" ? answer : [200, fixture("tikhub/profil.json")]),
      });
      await done;
      const marked = [...f.named("radar/radarNetworks:markReadError").map((c) => c.args.accountId), ...f.named("radar/radarNetworks:markReadErrors").flatMap((c) => c.args.ids as string[])];
      expect(marked).toEqual(["radarTracked_lent"]);
      expect(f.named("radar/radarNetworks:applyAccountRead").map((c) => c.args.accountId).sort()).toEqual(["radarTracked_a1", "radarTracked_a3", "radarTracked_a4"]);
    });
  }

  // Un compte que TikHub a lui-même refusé prend une erreur de relevé (un jour d'attente), coupe-circuit déclenché ou non ;
  // ceux que la panne a empêché de partir restent dus, sans erreur. Corrigé le 20/11/2026 : en panne, aucun compte refusé
  // n'était jugé — ils restaient dus, en tête, et repartaient chez TikHub à chaque passage. Une route retirée coûte au
  // plus une vague de relevés menés de front (ACCOUNT_READ_POOL) par passage : main, lui, donnait une erreur de relevé
  // à chaque compte dû refusé par ScrapeCreators.
  it("TikHub refuse la route (4xx à chaque appel) sans repli possible : les comptes refusés prennent une erreur de relevé, les suivants (pas tentés) restent dus sans erreur, le passage s'arrête", async () => {
    setEnv("tiktok");
    const due = Array.from({ length: 3 * ACCOUNT_READ_POOL }, (_, i) => account(`a${i}`));
    const { net, f, done } = reads(jobStateFor({ fallbacksToday: 100 }), due, { [TH_ROUTES.profile]: [404, { detail: { code: 404, message: "Not Found" } }] });
    await done;
    const tried = net.calls.filter((c) => new URL(c.url).pathname === TH_ROUTES.profile).map((c) => `radarTracked_${new URL(c.url).searchParams.get("unique_id")}`);
    const marked = [...f.named("radar/radarNetworks:markReadError").map((c) => c.args.accountId), ...f.named("radar/radarNetworks:markReadErrors").flatMap((c) => c.args.ids as string[])];
    expect(marked.sort()).toEqual([...tried].sort());
    expect(net.calls.filter((c) => c.url.includes("scrapecreators"))).toHaveLength(0);
    // En panne au 3e refus : les comptes suivants ne sont plus tentés.
    expect(tried.length).toBeGreaterThanOrEqual(3);
    expect(tried.length).toBeLessThanOrEqual(ACCOUNT_READ_POOL);
  });

  // Les réponses servies une à une (latence réelle) : les deux premiers refus sont jugés isolés, le troisième déclare la
  // panne. Les trois sont des refus de TikHub sur ces comptes : une erreur de relevé chacun, celui qui déclare la panne
  // compris — au passage suivant, la file ne recommence plus par eux. (Les comptes que la panne empêche de partir restent
  // dus sans erreur : « TikHub refuse la route » ci-dessus, et la clé refusée.)
  it("refus 4xx servis un à un : les trois comptes refusés prennent une erreur de relevé, celui qui déclare la panne compris", async () => {
    setEnv("tiktok");
    const due = ["a1", "a2", "a3"].map((h) => account(h));
    const delay: Record<string, number> = { a1: 1_000, a2: 2_000, a3: 3_000 };
    const { net, f, done } = reads(
      jobStateFor({ fallbacksToday: 100 }),
      due,
      { [TH_ROUTES.profile]: [404, { detail: { code: 404, message: "Not Found" } }] },
      { latency: (url) => (url.includes(TH_ROUTES.profile) ? (delay[new URL(url).searchParams.get("unique_id") ?? ""] ?? 0) : 0) },
    );
    await done;
    expect(net.paths().filter((p) => p === TH_ROUTES.profile)).toHaveLength(3);
    const marked = [...f.named("radar/radarNetworks:markReadError").map((c) => c.args.accountId), ...f.named("radar/radarNetworks:markReadErrors").flatMap((c) => c.args.ids as string[])];
    expect(marked.sort()).toEqual(["radarTracked_a1", "radarTracked_a2", "radarTracked_a3"]);
    expect(f.named("radar/radarSignals:recordRun").some((c) => String(c.args.thLastError ?? "").includes("404"))).toBe(true);
  });

  // La part TikHub du passage est à 0 (solde à sec) ; la porte de repli paraît ouverte (aucun repli du jour à
  // l'ouverture), mais un autre passage a pris le quota : la base refuse chaque place. TikHub n'a lu aucun de ces
  // comptes : rien n'est à conclure sur eux (pas d'échec isolé), et le passage s'arrête (canCall dans `more`).
  it("TikHub à sec, place de repli refusée par la base : aucun compte ne prend d'erreur de relevé, et aucun autre relevé n'est tenté", async () => {
    setEnv("tiktok");
    const due = Array.from({ length: 3 * ACCOUNT_READ_POOL }, (_, i) => account(`a${i}`));
    const { net, f, done } = reads(jobStateFor({ th: { ...freshTh(), paidUsd: 0, freeUsd: 0 } }), due, {}, { ctx: { "radar/radarSignals:claimFallback": () => false } });
    await done;
    expect(net.calls.filter((c) => !c.url.includes("/api/v1/tikhub/user/"))).toHaveLength(0);
    expect(f.named("radar/radarNetworks:markReadError")).toHaveLength(0);
    expect(f.named("radar/radarNetworks:markReadErrors")).toHaveLength(0);
    expect(f.named("radar/radarNetworks:applyAccountRead")).toHaveLength(0);
    // Seuls les relevés partis de front avant le premier refus (une vague, ACCOUNT_READ_POOL au plus) ont demandé une
    // place ; après, aucun relevé n'est tenté.
    const claims = f.named("radar/radarSignals:claimFallback").length;
    expect(claims).toBeGreaterThan(0);
    expect(claims).toBeLessThanOrEqual(ACCOUNT_READ_POOL);
    expect(sum(f, "calls")).toBe(claims);
  });

  // Une liste trouée se lit page après page (radarFreeMath.paidRead). Sa page 2 échoue chez TikHub (5xx, redemandé),
  // porte de repli OUVERTE : une pagination ne se poursuit pas chez l'autre fournisseur — le curseur est celui de TikHub.
  // Ce qui est lu reste rangé, rien ne part chez ScrapeCreators.
  it("liste trouée : la page 2 échoue chez TikHub, porte de repli ouverte — pas de repli (pagination non mêlée), la page 1 est rangée", async () => {
    setEnv("tiktok");
    const page1 = fixture("tikhub/profil.json").data as { max_cursor: number; aweme_list: { aweme_id: string; create_time: number }[] };
    // La dernière vidéo connue du compte est plus vieille que toute la page 1, et absente de sa liste publique : un trou.
    const newest = { videoId: "7700000000000000001", publishedAt: (Math.min(...page1.aweme_list.map((v) => v.create_time)) - 86_400) * 1_000 };
    const listed = page1.aweme_list.slice(0, 1).map((v) => ({ id: v.aweme_id, desc: "", playCount: 5 }));
    const profile = `<html><script>window.__data={"userInfo":${JSON.stringify({ uniqueId: "troue", followerCount: 10, signature: "", privateAccount: false })},"videoList":${JSON.stringify(listed)}}</script></html>`;
    const { net, f, done } = reads(
      jobStateFor(),
      [account("troue")],
      { [TH_ROUTES.profile]: (url) => (new URL(url).searchParams.has("max_cursor") ? [500, synth().refus500] : [200, fixture("tikhub/profil.json")]) },
      { www: () => [200, profile], ctx: { "radar/radarNetworks:freeNewest": () => newest } },
    );
    await done;
    const cursors = net.calls.filter((c) => new URL(c.url).pathname === TH_ROUTES.profile).map((c) => new URL(c.url).searchParams.get("max_cursor"));
    expect(cursors).toEqual([null, String(page1.max_cursor), String(page1.max_cursor)]);
    expect(net.calls.filter((c) => c.url.includes("scrapecreators"))).toHaveLength(0);
    expect(sum(f, "thFallbacks")).toBe(0);
    expect(reasons(f)).toEqual({ trou: 1 });
    expect(f.named("radar/radarNetworks:applyAccountRead").map((c) => (c.args.videos as unknown[]).length)).toEqual([page1.aweme_list.length]);
    expect(f.named("radar/radarNetworks:markReadError")).toHaveLength(0);
    // Ni en fin de passage : un échec isolé ne vaut une erreur de relevé que si RIEN n'a été lu du compte (`outcome ===
    // "skip"`). Ajouté le 20/11/2026 : sans cette garde, ce compte prenait une erreur de relevé (en pause à la 3e) pour
    // une page 2 manquée, sa page 1 rangée — et aucun test ne le voyait.
    expect(f.named("radar/radarNetworks:markReadErrors")).toHaveLength(0);
  });

  it("TikHub refuse la clé (401) sans repli possible : aucun compte ne prend d'erreur de relevé, le passage s'arrête", async () => {
    setEnv("tiktok");
    // La voie gratuite se ferme après FREE_BREAKER profils refusés : ces comptes-là partent au relevé payant, tous de
    // front, et la panne tombe pendant ces relevés ; les autres (« coupure ») ne doivent plus être tentés.
    const due = Array.from({ length: 3 * ACCOUNT_READ_POOL }, (_, i) => account(`a${i}`));
    const launched = Math.min(FREE_BREAKER, ACCOUNT_READ_POOL);
    const { net, f, done } = reads(jobStateFor({ fallbacksToday: 100 }), due, { [TH_ROUTES.profile]: [401, synth().refus401] });
    await done;
    expect(f.named("radar/radarNetworks:markReadError")).toHaveLength(0);
    expect(f.named("radar/radarNetworks:markReadErrors")).toHaveLength(0);
    expect(f.named("radar/radarNetworks:applyAccountRead")).toHaveLength(0);
    expect(net.calls.filter((c) => c.url.includes("scrapecreators"))).toHaveLength(0);
    expect(net.paths().filter((p) => p === TH_ROUTES.profile)).toHaveLength(launched);
    // Le passage s'arrête : les comptes suivants ne sont ni tentés, ni comptés en appels ou en erreurs (ils restent dus).
    expect([sum(f, "calls"), sum(f, "errors")]).toEqual([launched, launched]);
    expect(sum(f, "credits")).toBe(0);
    expect(f.named("radar/radarSignals:recordRun").some((c) => String(c.args.thLastError ?? "").includes("401"))).toBe(true);
  });

  // LA MINUTE DU RELEVÉ PAYANT (corrigé le 21/11/2026). La voie gratuite tourne jusqu'à 7 minutes (FREE_LANE_MAX_MS) ;
  // les relevés payants de ce qu'elle a raté ou pas atteint partent APRÈS elle, jusqu'à 8 minutes (PASS_MAX_MS) — la
  // minute de main. L'échéance de l'aiguilleur (8 minutes, dernier appel TikHub à 7) arrêtait tout relevé payant d'un
  // passage basculé dès 7 minutes : quand la voie prenait son créneau, rien n'était payé — ni chez TikHub ni par la porte
  // de repli —, et les comptes en retard, les ratés au second échec et les premiers relevés illisibles restaient dus,
  // relus pour rien en tête de la voie au passage suivant.
  describe("la voie gratuite prend ses 7 minutes : la minute qui reste au relevé payant", () => {
    /** La première page publique répond (500) quand le passage a tourné 7 min 05 s : la voie se ferme sur le temps. */
    const slowLane = () => {
      let first = true;
      return (): [number, string] => {
        if (first) {
          first = false;
          vi.setSystemTime(Date.now() + 7 * 60_000 + 5_000);
        }
        return [500, "refus"];
      };
    };
    const late = (n: number) => Array.from({ length: n }, (_, i) => account(`r${i}`));
    const profilePage = (url: string) => url.includes(TH_ROUTES.profile) || url.includes("api.scrapecreators.com/v3/tiktok/profile/videos");

    it("sans bascule (main) : les comptes en retard partent chez ScrapeCreators dans la minute qui reste", async () => {
      process.env.SCRAPECREATORS_API_KEY = "cle-sc-de-test";
      const starts: number[] = [];
      const { net, f, done } = reads(jobStateFor(), late(6), {}, { www: slowLane(), latency: (url) => (profilePage(url) && starts.push(Date.now() - NOW), 0) });
      await done;
      expect(net.calls.filter((c) => c.url.includes("api.scrapecreators.com/v3/tiktok/profile/videos"))).toHaveLength(6);
      expect(f.named("radar/radarNetworks:applyAccountRead")).toHaveLength(6);
      expect(Math.min(...starts)).toBeGreaterThanOrEqual(7 * 60_000);
    });

    it("RADAR_TIKHUB=tiktok : ils partent chez TikHub, dans la même minute", async () => {
      setEnv("tiktok");
      const starts: number[] = [];
      const { net, f, done } = reads(jobStateFor(), late(6), {}, { www: slowLane(), latency: (url) => (profilePage(url) && starts.push(Date.now() - NOW), 0) });
      await done;
      expect(net.paths().filter((p) => p === TH_ROUTES.profile)).toHaveLength(6);
      expect(net.calls.filter((c) => c.url.includes("scrapecreators"))).toHaveLength(0);
      expect(f.named("radar/radarNetworks:applyAccountRead")).toHaveLength(6);
      expect(f.named("radar/radarNetworks:markReadError")).toHaveLength(0);
      expect(Math.min(...starts)).toBeGreaterThanOrEqual(7 * 60_000);
      expect(sum(f, "thCalls")).toBe(6);
    });

    it("RADAR_TIKHUB=tiktok, TikHub à sec : ils passent par la porte de repli chez ScrapeCreators, dans la même minute", async () => {
      setEnv("tiktok");
      const starts: number[] = [];
      const st = jobStateFor({ th: { ...freshTh(), paidUsd: 0, freeUsd: 0 } });
      const { net, f, done } = reads(st, late(6), {}, { www: slowLane(), latency: (url) => (profilePage(url) && starts.push(Date.now() - NOW), 0) });
      await done;
      expect(net.paths().filter((p) => p === TH_ROUTES.profile)).toHaveLength(0);
      expect(net.calls.filter((c) => c.url.includes("api.scrapecreators.com/v3/tiktok/profile/videos"))).toHaveLength(6);
      expect(sum(f, "thFallbacks")).toBe(6);
      expect(f.named("radar/radarNetworks:applyAccountRead")).toHaveLength(6);
      expect(Math.min(...starts)).toBeGreaterThanOrEqual(7 * 60_000);
    });

    // La borne de main tient chez TikHub : le dernier relevé part à 8 minutes au plus, et son appel (30 s de délai) finit
    // au plus tard à 8 min 30 s — sous la coupure de 10 minutes et le verrou du passage (ACCOUNT_LEASE_MS).
    it("RADAR_TIKHUB=tiktok, 25 s par appel : aucun relevé ne part après 8 minutes, le passage finit avant 8 min 30 s", async () => {
      setEnv("tiktok");
      const starts: number[] = [];
      const { net, done } = reads(jobStateFor(), late(5 * ACCOUNT_READ_POOL), {}, {
        www: slowLane(),
        latency: (url) => (url.includes(TH_ROUTES.profile) ? (starts.push(Date.now() - NOW), 25_000) : 0),
      });
      await done;
      // Le raté de la voie d'abord (seul), puis les comptes en retard par vagues de front, toutes les 25 s : des relevés
      // partent après 7 min 30 s, aucun après 8 minutes, et les comptes de la vague d'après restent dus.
      const th = net.paths().filter((p) => p === TH_ROUTES.profile).length;
      expect(th).toBe(starts.length);
      expect(th).toBeGreaterThan(ACCOUNT_READ_POOL);
      expect(th).toBeLessThan(5 * ACCOUNT_READ_POOL);
      expect(Math.max(...starts)).toBeGreaterThan(7 * 60_000 + 30_000);
      expect(Math.max(...starts)).toBeLessThanOrEqual(8 * 60_000);
      expect(Date.now() - NOW).toBeLessThanOrEqual(8 * 60_000 + 30_000);
    });
  });
});

describe("échéance d'un passage basculé", () => {
  /** Chaque appel prend 40 secondes à l'horloge simulée ; 20 vidéos de courbe sont dues. */
  function slowCurve(radar: string | null) {
    if (radar === null) process.env.SCRAPECREATORS_API_KEY = "cle-sc-de-test";
    else setEnv(radar);
    const net = thAndSc();
    const starts: number[] = [];
    vi.stubGlobal("fetch", (async (input: string | URL | Request, init?: RequestInit) => {
      if (!String(input).includes("/user/")) {
        starts.push(Date.now());
        vi.setSystemTime(Date.now() + 40_000);
      }
      return net.impl(input, init);
    }) as typeof fetch);
    const due = Array.from({ length: 20 }, (_, i) => ({ id: `radarSignals_${i}`, url: `https://www.tiktok.com/@auteur_17/video/7709774559000000${String(i).padStart(3, "0")}` }));
    const f = taskCtx({ "radar/radarSignals:jobState": () => jobStateFor(), "radar/radarSignals:dueCurve": () => due });
    return { starts, f, done: drive(handlerOf(runCurve)(f.ctx, {}) as Promise<unknown>) };
  }

  it("chez TikHub : plus aucun appel ne part dans les 30 dernières secondes avant 8 minutes ; le passage finit avant 9 minutes", async () => {
    const { starts, f, done } = slowCurve("curve");
    await done;
    expect(starts.length).toBeLessThan(20);
    expect(Math.max(...starts) - NOW).toBeLessThan(8 * 60_000 - 30_000);
    expect(Date.now() - NOW).toBeLessThan(9 * 60_000);
    expect(f.named("radar/radarSignals:recordRun")).toHaveLength(1);
  });

  it("sans bascule : pas d'échéance, les 20 vidéos sont relevées comme avant", async () => {
    const { starts, done } = slowCurve(null);
    await done;
    expect(starts).toHaveLength(20);
  });

  // Corrigé le 20/11/2026 : le passage a tourné jusqu'à 7 min 29,5 s ; la vidéo suivante partait chez TikHub avec un
  // délai rogné à 500 ms, quand TikHub répond en 1,8 s (banc du 20/11/2026). Abandonnée par notre échéance, elle revenait
  // en échec isolé de TikHub (`thFailed`), payée au prix plein (facturation inconnue), et SORTAIT DÉFINITIVEMENT de la
  // courbe en fin de passage (applyCurve sans vidéo) sans avoir été relevée.
  it("un appel qui n'aurait plus son délai entier ne part pas : la vidéo reste due, rien n'est payé ni sorti de la courbe", async () => {
    setEnv("curve");
    const net = thAndSc();
    const LATENCY_MS = 1_800;
    let timeout = Infinity;
    vi.spyOn(AbortSignal, "timeout").mockImplementation((ms: number) => {
      timeout = ms;
      return new AbortController().signal;
    });
    let first = true;
    vi.stubGlobal("fetch", (async (input: string | URL | Request, init?: RequestInit) => {
      if (new URL(String(input)).pathname === TH_ROUTES.video) {
        if (timeout < LATENCY_MS) {
          vi.setSystemTime(Date.now() + timeout);
          throw new DOMException("The operation was aborted due to timeout", "TimeoutError");
        }
        // La première vidéo répond quand le passage a tourné 7 min 29,5 s.
        vi.setSystemTime(first ? NOW + 7 * 60_000 + 29_500 : Date.now() + LATENCY_MS);
        first = false;
      }
      return net.impl(input, init);
    }) as typeof fetch);
    const w = writableDb({ radarSignals: ["1", "2"].map((id) => signal(id, 5_000)) });
    const f = taskCtx({
      "radar/radarSignals:jobState": () => jobStateFor({ fallbacksToday: 100 }),
      "radar/radarSignals:dueCurve": () => w.tables.radarSignals.map((x) => ({ id: x._id, url: x.url })),
      "radar/radarSignals:applyCurve": (a) => handlerOf(applyCurve)({ db: w.db }, a),
    });
    await drive(handlerOf(runCurve)(f.ctx, {}) as Promise<unknown>);
    expect(f.named("radar/radarSignals:applyCurve").map((c) => [c.args.id, c.args.video === null])).toEqual([["radarSignals_1", false]]);
    expect(w.tables.radarSignals.find((x) => x._id === "radarSignals_2")?.nextCheckAt).toBe(NOW - 1);
    expect(net.paths().filter((p) => p === TH_ROUTES.video)).toHaveLength(1);
    const rec = f.named("radar/radarSignals:recordRun")[0].args;
    expect(rec).toMatchObject({ thCalls: 1, errors: 0 });
    expect(rec.thUnknown).toBeUndefined();
  });
});
