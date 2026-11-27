import { getFunctionName } from "convex/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { catchUpKeeper, runNetworkSearch } from "../../convex/radar/radarNetworks";
import { CATCHUP_BACKOFF_MS, CATCHUP_MAX, catchUpParallel, catchUpPicks, type CatchUpApp } from "../../convex/radar/radarNetworkMath";
import { PAUSABLE_POSTES, pausedPostes } from "../../convex/radar/radarProviders";
import type { JobState } from "../../convex/radar/radarSignals";
import { DEFAULT_BUDGET, allowance, budgetState, catchUpAllowance } from "../../convex/radar/radarSignalsMath";
import { drive, fakeActionCtx, fetchLog, handlerOf } from "./action-ctx";
import { memoryDb, type MemoryDoc } from "./convex-memory-db";

/**
 * LE PLAN « UN PACK » DU 27/11/2026. Le pack ScrapeCreators doit servir aux recherches des apps jamais cherchées :
 *  - le rattrapage en parallèle (RADAR_CATCHUP_PARALLEL) lance jusqu'à n recherches d'apps jamais cherchées à la fois,
 *    chacune seule, au lieu d'une à la fois dans la tâche de l'heure (même coût, plus tôt) ;
 *  - RADAR_PAUSE_POSTES met en pause, le temps du rattrapage, les postes qui puisent aussi dans le pack (Instagram,
 *    transcriptions, découverte, pubs).
 */

const NOW = Date.parse("2026-11-27T13:00:00Z");
const MIN = 60_000;

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("Rattrapage en parallèle — le réglage (27/11/2026)", () => {
  it("absent, 0 ou illisible : coupé ; sinon un entier, borné à CATCHUP_MAX", () => {
    expect(catchUpParallel({})).toBe(0);
    expect(catchUpParallel({ RADAR_CATCHUP_PARALLEL: "" })).toBe(0);
    expect(catchUpParallel({ RADAR_CATCHUP_PARALLEL: "0" })).toBe(0);
    expect(catchUpParallel({ RADAR_CATCHUP_PARALLEL: "-3" })).toBe(0);
    expect(catchUpParallel({ RADAR_CATCHUP_PARALLEL: "six" })).toBe(0);
    expect(catchUpParallel({ RADAR_CATCHUP_PARALLEL: " 6 " })).toBe(6);
    expect(catchUpParallel({ RADAR_CATCHUP_PARALLEL: "4.7" })).toBe(4);
    expect(catchUpParallel({ RADAR_CATCHUP_PARALLEL: "99" })).toBe(CATCHUP_MAX);
  });
});

describe("Rattrapage en parallèle — quelles apps partent (27/11/2026)", () => {
  type A = CatchUpApp & { id: string };
  const app = (id: string, over: Partial<A> = {}): A => ({ id, status: "active", rivalOf: [], source: "manual", ...over });
  const running = (id: string): A => app(id, { networkSearch: { requestedAt: NOW - 2 * MIN, startedAt: NOW - MIN, step: 1, steps: 4, attached: 0, signals: 0 } });
  const finished = (id: string, outcome: "done" | "budget" | "error" | "no-credits", agoMs: number, searched = false, step = 4): A =>
    app(id, {
      ...(searched ? { networkSearchedAt: NOW - agoMs } : {}),
      networkSearch: { requestedAt: NOW - agoMs - MIN, startedAt: NOW - agoMs - MIN, finishedAt: NOW - agoMs, step, steps: 4, attached: 0, signals: 0, outcome },
    });
  const ids = (r: { picks: A[] }) => r.picks.map((a) => a.id);

  it("coupé : rien", () => {
    expect(catchUpPicks([app("a")], 0, NOW)).toEqual({ picks: [], why: "off" });
  });

  it("les apps jamais cherchées dans l'ordre de la file (de départ d'abord, puis l'ordre reçu), pas les autres", () => {
    const apps = [
      app("liste1"),
      app("cherchee", { networkSearchedAt: NOW - 8 * 86_400_000 }),
      app("liste2"),
      app("depart", { source: "seed" }),
      app("pause", { status: "paused" }),
      app("fondue", { mergedInto: "x" }),
      app("liste3"),
    ];
    expect(catchUpPicks(apps, 3, NOW)).toEqual({ picks: [apps[3], apps[0], apps[2]], why: "ok" });
  });

  it("les recherches qui tournent prennent leur place, et une app qui tourne ne repart pas", () => {
    const apps = [running("r1"), running("r2"), app("a"), app("b"), app("c")];
    expect(ids(catchUpPicks(apps, 3, NOW))).toEqual(["a"]);
    expect(catchUpPicks(apps, 2, NOW).why).toBe("busy");
    // Une recherche tombée en route (plus de 15 minutes) ne tourne plus : son app repart.
    const stale = app("s", { networkSearch: { requestedAt: NOW - 20 * MIN, step: 0, steps: 4, attached: 0, signals: 0 } });
    expect(ids(catchUpPicks([stale], 1, NOW))).toEqual(["s"]);
  });

  it("une recherche reportée faute de budget avant tout appel il y a moins de 30 minutes arrête tout ; plus vieille, non", () => {
    expect(catchUpPicks([finished("b", "budget", 5 * MIN, false, 0), app("a")], 4, NOW)).toEqual({ picks: [], why: "budget" });
    expect(ids(catchUpPicks([finished("b", "budget", CATCHUP_BACKOFF_MS + MIN, false, 0), app("a")], 4, NOW))).toEqual(["b", "a"]);
    // Coupée par le temps en cours de route (« budget » au pas 3) : rien ne s'arrête, et elle repart.
    expect(ids(catchUpPicks([finished("coupee", "budget", MIN, false, 3), app("a")], 4, NOW))).toEqual(["coupee", "a"]);
    // Une app cherchée jusqu'au bout ne compte pas, même finie à l'instant.
    expect(ids(catchUpPicks([finished("ok", "done", MIN, true), app("a")], 4, NOW))).toEqual(["a"]);
  });

  it("trois recherches en erreur ou sans crédits en 30 minutes arrêtent tout, deux non", () => {
    const two = [finished("e1", "error", MIN), finished("e2", "no-credits", 2 * MIN), app("a")];
    expect(catchUpPicks(two, 6, NOW).why).toBe("ok");
    expect(catchUpPicks([...two, finished("e3", "error", 3 * MIN)], 6, NOW)).toEqual({ picks: [], why: "errors" });
  });

  it("plus rien à chercher : vide", () => {
    expect(catchUpPicks([app("x", { networkSearchedAt: NOW - MIN })], 4, NOW)).toEqual({ picks: [], why: "empty" });
  });
});

type Handler = { _handler: (ctx: unknown, args: unknown) => Promise<unknown> };
const run = (f: unknown, ctx: unknown, args: unknown) => (f as Handler)._handler(ctx, args);

describe("Rattrapage en parallèle — sur la base (27/11/2026)", () => {
  function world() {
    let seq = 0;
    const tables: Record<string, MemoryDoc[]> = { radarApps: [] };
    const app = (slug: string, extra: Record<string, unknown> = {}) => {
      seq += 1;
      const doc = { slug, name: slug, rivalOf: [], strong: [slug], weak: [], context: [], searches: [slug, `#${slug}`], status: "active", source: "manual", createdAt: 0, ...extra, _id: `radarApps_${String(seq).padStart(4, "0")}`, _creationTime: seq } as MemoryDoc;
      tables.radarApps.push(doc);
      return doc;
    };
    for (let i = 0; i < 300; i++) app(`suivie${i}`, { networkSearchedAt: NOW - 86_400_000 });
    const never = [app("n1"), app("n2"), app("n3"), app("n4")];
    return { tables, never };
  }
  function ctxOf(tables: Record<string, MemoryDoc[]>) {
    const mem = memoryDb(tables, { limit: null });
    const scheduled: { fn: string; args: Record<string, unknown> }[] = [];
    const scheduler = { runAfter: async (_ms: number, ref: unknown, args: Record<string, unknown>) => void scheduled.push({ fn: getFunctionName(ref as never), args }) };
    return { mem, scheduled, ctx: { db: mem.db, scheduler } };
  }

  it("sans le réglage : ne lit rien, n'écrit rien, ne lance rien", async () => {
    const w = world();
    const c = ctxOf(w.tables);
    expect(await run(catchUpKeeper, c.ctx, {})).toEqual({ launched: 0, why: "off" });
    expect(c.mem.reads()).toBe(0);
    expect(c.mem.writes()).toEqual([]);
    expect(c.scheduled).toEqual([]);
  });

  it("réglé à 3 : lance les 3 premières apps jamais cherchées, notées demandées ; aussitôt rappelé, plus de place", async () => {
    vi.stubEnv("RADAR_CATCHUP_PARALLEL", "3");
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(NOW);
    try {
      const w = world();
      const c = ctxOf(w.tables);
      expect(await run(catchUpKeeper, c.ctx, {})).toEqual({ launched: 3, why: "ok" });
      const launched = w.never.slice(0, 3).map((a) => a._id);
      expect(c.scheduled).toEqual(launched.map((appId) => ({ fn: "radar/radarNetworks:runNetworkSearch", args: { appId, auto: true, catchUp: true } })));
      for (const id of launched) {
        expect(w.tables.radarApps.find((a) => a._id === id)?.networkSearch).toEqual({ requestedAt: NOW, step: 0, steps: 2, attached: 0, signals: 0 });
      }
      const again = ctxOf(w.tables);
      expect(await run(catchUpKeeper, again.ctx, {})).toEqual({ launched: 0, why: "busy" });
      expect(again.scheduled).toEqual([]);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("Rattrapage en parallèle — la tâche de l'heure lui laisse les apps jamais cherchées (27/11/2026)", () => {
  const due = (id: string, never: boolean) => ({ id, name: id, searches: [`${id} app`], rival: false, deep: never, never, rule: { strong: [id], weak: [], context: [] }, tagCounts: [] });
  const jobState = (): JobState => ({
    budget: DEFAULT_BUDGET,
    cursor: 10,
    usage: [],
    day: "2026-11-27",
    month: "2026-11",
    balance: { remaining: 24_000, seenAt: NOW - MIN, now: NOW, perDay: 100 },
    creditAlerted: {},
    recentUsage: [],
    th: null,
    thPrices: null,
    thPricesAt: NOW,
    fallbacksToday: 0,
  });

  async function hourly(parallel: string | null) {
    vi.stubEnv("SCRAPECREATORS_API_KEY", "cle-sc-de-test");
    if (parallel !== null) vi.stubEnv("RADAR_CATCHUP_PARALLEL", parallel);
    const sc = { success: true, credits_charged: 1, credits_remaining: 24_000 };
    const net = fetchLog((url) => {
      const u = new URL(url);
      if (u.hostname === "api.scrapecreators.com") return [200, { ...sc, search_item_list: [], aweme_list: [], has_more: 0 }];
      return [404, ""];
    });
    vi.stubGlobal("fetch", net.impl);
    const f = fakeActionCtx({
      "radar/radarNetworks:seedApps": () => 0,
      "radar/radarSignals:jobState": () => jobState(),
      "radar/radarNetworks:dueApps": () => [due("jamais", true), due("routine", false)],
      "radar/radarNetworks:startNetworkSearch": () => null,
      "radar/radarNetworks:attachFromSearch": () => ({ attached: 0, signals: 0, updated: 0 }),
      "radar/radarNetworks:finishNetworkSearch": () => null,
      "radar/radarSignals:recordRun": () => null,
    });
    vi.useFakeTimers({ now: NOW });
    try {
      await drive(handlerOf(runNetworkSearch)(f.ctx, {}) as Promise<unknown>);
    } finally {
      vi.useRealTimers();
    }
    return f.named("radar/radarNetworks:startNetworkSearch").map((c) => c.args.appId);
  }

  it("sans le réglage, elle cherche les deux ; réglé, la routine seule", async () => {
    expect(await hourly(null)).toEqual(["jamais", "routine"]);
    expect(await hourly("6")).toEqual(["routine"]);
  });
});

describe("Pause de postes — le réglage et la part de chaque poste (27/11/2026)", () => {
  it("seuls les postes pausables, sans doublon, sans casse", () => {
    expect(pausedPostes({})).toEqual([]);
    expect(pausedPostes({ RADAR_PAUSE_POSTES: " Insta, transcript ,search,ads,insta" })).toEqual(["insta", "transcript", "search", "ads"]);
    // Ni les relevés, ni la recherche des réseaux, ni l'analyse IA.
    expect(pausedPostes({ RADAR_PAUSE_POSTES: "tiktok,network,ai,inconnu" })).toEqual([]);
    expect(PAUSABLE_POSTES).not.toContain("network");
    expect(PAUSABLE_POSTES).not.toContain("tiktok");
  });

  it("un poste en pause n'a plus de part ; les autres gardent la leur, le rattrapage du réseau compris", () => {
    const balance = { remaining: 24_000, seenAt: NOW - MIN, now: NOW, perDay: 100 };
    const free = budgetState(DEFAULT_BUDGET, [], balance);
    const held = budgetState(DEFAULT_BUDGET, [], balance, { paused: ["insta", "transcript", "search", "ads"] });
    for (const k of ["insta", "transcript", "search", "ads"] as const) {
      expect(allowance(DEFAULT_BUDGET, free, k, 0, 24)).toBeGreaterThan(0);
      expect(allowance(DEFAULT_BUDGET, held, k, 0, 24)).toBe(0);
      expect(held.cut).toContain(k);
    }
    for (const k of ["network", "tiktok", "curve"] as const) expect(allowance(DEFAULT_BUDGET, held, k, 0, 24)).toBe(allowance(DEFAULT_BUDGET, free, k, 0, 24));
    expect(catchUpAllowance(DEFAULT_BUDGET, held, "network")).toBe(catchUpAllowance(DEFAULT_BUDGET, free, "network"));
  });
});

describe("Rattrapage en parallèle — chaque recherche lancée par lui relance la file à sa fin (27/11/2026)", () => {
  it("lancée par le rattrapage, même sans clé (sortie au premier pas) : la file est relancée ; sans `catchUp`, non", async () => {
    vi.stubEnv("SCRAPECREATORS_API_KEY", "");
    const by = fakeActionCtx({});
    expect(await handlerOf(runNetworkSearch)(by.ctx, { appId: "radarApps_1", auto: true, catchUp: true })).toEqual({ skipped: "no-key" });
    expect(by.named("radar/radarNetworks:catchUpKeeper")).toEqual([{ kind: "schedule", name: "radar/radarNetworks:catchUpKeeper", args: { delay: 0 } }]);
    const alone = fakeActionCtx({});
    await handlerOf(runNetworkSearch)(alone.ctx, { appId: "radarApps_1" });
    expect(alone.named("radar/radarNetworks:catchUpKeeper")).toEqual([]);
  });
});
