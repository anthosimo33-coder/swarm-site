import { afterEach, describe, expect, it, vi } from "vitest";
import { settleTrials } from "../../convex/radar/radarAuto";
import { TRIAL_KEEP_MIN, TRIAL_MAX_WAIT_MS, TRIAL_SETTLE_MS, settleOrder } from "../../convex/radar/radarAutoMath";
import { memoryDb, type MemoryDoc } from "./convex-memory-db";

/**
 * LE TRI DES APPS À L'ESSAI (28/11/2026). Il regardait les 60 plus anciennement cherchées à chaque passage ; ces 60
 * attendaient (moins de 3 comptes actifs, comptes en contrôle) et 269 apps prêtes à être gardées n'étaient jamais
 * regardées : elles restaient cachées de Kopycat. Les prêtes passent désormais d'abord (radarAutoMath.settleOrder).
 */

const NOW = Date.parse("2026-11-28T11:00:00Z");
const HOUR = 3_600_000;

afterEach(() => {
  vi.useRealTimers();
});

describe("Apps à l'essai — l'ordre du tri (28/11/2026)", () => {
  type A = { id: string; networkSearchedAt: number; net?: { accounts: number; active: number; offTopic?: number }; networkSearch?: { attached: number; full?: number } };
  const app = (id: string, agoMs: number, active: number, accounts = active, extra: Partial<A> = {}): A => ({ id, networkSearchedAt: NOW - agoMs, net: { accounts, active, offTopic: 0 }, ...extra });

  it("les prêtes d'abord, puis celles qu'on peut trancher, puis celles qui attendraient ; les plus anciennes d'abord dans chaque groupe", () => {
    const order = settleOrder(
      [
        app("attend-ancienne", 20 * HOUR, 1, 3),
        app("prete-recente", 2 * HOUR, TRIAL_KEEP_MIN),
        app("au-bout", TRIAL_SETTLE_MS + HOUR, 1, 1),
        app("controle-longue", TRIAL_SETTLE_MS + HOUR, 1, 3),
        app("controle-au-bout", TRIAL_MAX_WAIT_MS + HOUR, 1, 3),
        app("prete-ancienne", 10 * HOUR, TRIAL_KEEP_MIN + 4),
        app("plafond", HOUR, 0, 0, { networkSearch: { attached: 0, full: 12 } }),
        app("sans-resume", 3 * HOUR, 0, 0, { net: undefined }),
      ],
      NOW,
    ).map((a) => a.id);
    expect(order).toEqual(["prete-ancienne", "prete-recente", "controle-au-bout", "au-bout", "plafond", "controle-longue", "attend-ancienne", "sans-resume"]);
  });
});

describe("Apps à l'essai — le tri sur la base (28/11/2026)", () => {
  type Handler = { _handler: (ctx: unknown, args: unknown) => Promise<unknown> };
  const run = (f: unknown, ctx: unknown, args: unknown) => (f as Handler)._handler(ctx, args);

  it("60 apps anciennes qui attendent ne cachent plus une app prête cherchée après elles : elle est gardée au premier passage", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(NOW);
    let seq = 0;
    const tables: Record<string, MemoryDoc[]> = { radarApps: [], radarTracked: [] };
    const add = (table: string, fields: Record<string, unknown>) => {
      seq += 1;
      const doc = { ...fields, _id: `${table}_${String(seq).padStart(5, "0")}`, _creationTime: seq } as MemoryDoc;
      tables[table].push(doc);
      return doc;
    };
    const trial = (slug: string, agoMs: number, active: number, vetting: number) => {
      const a = add("radarApps", {
        slug, name: slug, rivalOf: [], strong: [slug], weak: [], context: [], searches: [slug], status: "active", source: "manual", createdAt: 0,
        trialSince: NOW - agoMs - HOUR, networkSearchedAt: NOW - agoMs, net: { accounts: active + vetting, active, offTopic: 0, posts7d: 0, at: NOW },
      });
      for (let i = 0; i < active; i++) add("radarTracked", { appId: a._id, handle: `${slug}_a${i}`, status: "active", platform: "tiktok", nextReadAt: NOW });
      for (let i = 0; i < vetting; i++) add("radarTracked", { appId: a._id, handle: `${slug}_v${i}`, status: "paused", pausedReason: "vetting", platform: "tiktok", nextReadAt: NOW });
      return a;
    };
    for (let i = 0; i < 60; i++) trial(`attend${i}`, 20 * HOUR, 1, 2);
    const ready = trial("prete", 10 * HOUR, TRIAL_KEEP_MIN, 0);
    const mem = memoryDb(tables, { limit: null });
    const out = (await run(settleTrials, { db: mem.db }, {})) as { kept: number; waiting: number };
    expect(out.kept).toBe(1);
    expect(tables.radarApps.find((a) => a._id === ready._id)?.trialSince).toBeUndefined();
  });
});
