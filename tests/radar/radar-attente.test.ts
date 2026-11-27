import { describe, expect, it } from "vitest";
import { holdListTail } from "../../convex/radar/radarAuto";
import { HOLD_KEEP_RANK, holdsForNow, listRanks } from "../../convex/radar/radarAutoMath";
import { dueApps, seedApps } from "../../convex/radar/radarNetworks";
import { memoryDb, type MemoryDoc } from "./convex-memory-db";

/**
 * LA MOITIÉ DU 25/11/2026. Le fondateur ne fait chercher pour l'instant que la meilleure moitié des apps jamais
 * cherchées : les vraies apps et le haut de la liste importée (rang ≤ HOLD_KEEP_RANK). Les autres apps à l'essai jamais
 * cherchées sont mises de côté UNE fois (radarAuto.holdListTail), avant la recharge qui relance les recherches.
 */

const NOW = Date.parse("2026-11-25T20:00:00Z");

type Handler = { _handler: (ctx: unknown, args: unknown) => Promise<unknown> };
const run = (f: unknown, ctx: unknown, args: unknown) => (f as Handler)._handler(ctx, args);

/** Un monde : identifiants dans un autre ordre que la création (comme en Convex), dates de création en suite. */
function world() {
  let seq = 0;
  const tables: Record<string, MemoryDoc[]> = {};
  const add = (table: string, fields: Record<string, unknown>): MemoryDoc => {
    seq += 1;
    const id = (Math.imul(seq, 2_654_435_761) >>> 0).toString(16).padStart(8, "0");
    const doc = { ...fields, _id: `${table}_${id}`, _creationTime: seq } as MemoryDoc;
    (tables[table] ??= []).push(doc);
    return doc;
  };
  const app = (slug: string, extra: Record<string, unknown> = {}) =>
    add("radarApps", { slug, name: slug, rivalOf: [], strong: [slug], weak: [], context: [], searches: [slug], status: "active", source: "manual", createdAt: 0, ...extra });
  const listed = (appId?: string, status: "followed" | "ignored" = "followed") =>
    add("radarAppCandidates", { kind: "liste", key: `liste:${seq}`, label: `marque ${seq}`, status, authorCount: 0, firstSeenAt: 0, lastSeenAt: 0, ...(appId ? { appId } : {}) });
  return { tables, add, app, listed };
}

describe("Radar — le rang d'import de la liste (25/11/2026)", () => {
  it("se lit dans l'ordre de création, à identifiant égal départagé, un candidat ignoré gardant sa place", () => {
    const ranks = listRanks([
      { _id: "c3", _creationTime: 30, appId: "appC" },
      { _id: "c1", _creationTime: 10 },
      { _id: "c2b", _creationTime: 20, appId: "appB" },
      { _id: "c2a", _creationTime: 20, appId: "appA" },
      { _id: "c4", _creationTime: 40, appId: "appA" },
    ]);
    // c1 (ignoré, sans app) prend le rang 1 ; c2a passe avant c2b (même milliseconde) ; un 2e candidat de appA ne la
    // fait pas reculer.
    expect([...ranks.entries()]).toEqual([
      ["appA", 2],
      ["appB", 3],
      ["appC", 4],
    ]);
  });
});

describe("Radar — quelles apps sont mises de côté (25/11/2026)", () => {
  const trial = { status: "active" as const, trialSince: 1, rivalOf: [] as string[] };

  it("le haut de la liste est gardé jusqu'au rang HOLD_KEEP_RANK compris, la suite et les apps hors liste attendent", () => {
    expect(HOLD_KEEP_RANK).toBe(691);
    expect(holdsForNow(trial, 1)).toBe(false);
    expect(holdsForNow(trial, HOLD_KEEP_RANK)).toBe(false);
    expect(holdsForNow(trial, HOLD_KEEP_RANK + 1)).toBe(true);
    expect(holdsForNow(trial, undefined)).toBe(true);
  });

  it("jamais une vraie app, une app déjà cherchée, fondue, concurrente ou déjà en pause", () => {
    expect(holdsForNow({ status: "active", rivalOf: [] }, undefined)).toBe(false);
    expect(holdsForNow({ ...trial, networkSearchedAt: 5 }, undefined)).toBe(false);
    expect(holdsForNow({ ...trial, deepSearchedAt: 5 }, undefined)).toBe(false);
    expect(holdsForNow({ ...trial, mergedInto: "x" }, undefined)).toBe(false);
    expect(holdsForNow({ ...trial, rivalOf: ["snytch"] }, undefined)).toBe(false);
    expect(holdsForNow({ ...trial, status: "paused" }, undefined)).toBe(false);
  });
});

describe("Radar — la mise de côté, une fois, sur la base (25/11/2026)", () => {
  /** Le monde de la prod en petit : la liste et ses rangs, un candidat d'un autre genre glissé avant le rang 691. */
  function scene() {
    const w = world();
    const real = w.app("vraie");
    const top = w.app("haut", { trialSince: 1 });
    const edge = w.app("bord", { trialSince: 1 });
    const over = w.app("dessous", { trialSince: 1 });
    const outside = w.app("horsliste", { trialSince: 1 });
    const searched = w.app("cherchee", { trialSince: 1, networkSearchedAt: 5 });
    const deep = w.app("complete", { trialSince: 1, deepSearchedAt: 5 });
    const merged = w.app("fondue", { trialSince: 1, mergedInto: real._id });
    const rival = w.app("concurrente", { trialSince: 1, rivalOf: ["snytch"] });
    const failed = w.app("ratee", { trialSince: 1, status: "paused", pausedReason: "essai" });
    for (let i = 0; i < 2_000; i++) w.app(`vrac${i}`);
    w.listed(top._id); // rang 1
    for (let r = 2; r < HOLD_KEEP_RANK; r++) w.listed(undefined, r % 7 === 0 ? "ignored" : "followed");
    // Un candidat d'un autre genre : il ne compte pas dans le rang (sinon « bord » passerait au rang 692).
    w.add("radarAppCandidates", { kind: "store", key: "store:1", label: "classement", status: "new", authorCount: 2, firstSeenAt: 0, lastSeenAt: 0 });
    w.listed(edge._id); // rang 691
    w.listed(over._id); // rang 692
    w.listed(searched._id);
    w.listed(deep._id);
    w.listed(merged._id);
    return { w, real, top, edge, over, outside, searched, deep, merged, rival, failed };
  }

  it("met de côté la fin de la liste et les apps hors liste, rien d'autre, et le note sur les réglages", async () => {
    const s = scene();
    const mem = memoryDb(s.w.tables);
    const held = await run(holdListTail, { db: mem.db }, {});
    expect(held).toBe(2);
    const patched = mem.writes().filter((x) => x.table === "radarApps");
    expect(patched.map((x) => x.id).sort()).toEqual([s.over._id, s.outside._id].sort());
    for (const x of patched) expect(x).toMatchObject({ op: "patch", value: { status: "paused", pausedReason: "attente" } });
    const settings = s.w.tables.radarSettings ?? [];
    expect(settings).toHaveLength(1);
    expect(settings[0]).toMatchObject({ holdTail2511Held: 2 });
    expect(typeof settings[0].holdTail2511At).toBe("number");
    // Les apps actives et les candidats de la liste, une lecture chacun : loin de la limite d'une mutation.
    expect(mem.readsOf("radarApps")).toBeLessThan(2_100);
    expect(mem.readsOf("radarAppCandidates")).toBe(HOLD_KEEP_RANK + 4);
  });

  it("une seconde fois, ne relit que les réglages et n'écrit rien", async () => {
    const s = scene();
    await run(holdListTail, { db: memoryDb(s.w.tables).db }, {});
    const again = memoryDb(s.w.tables);
    expect(await run(holdListTail, { db: again.db }, {})).toBeNull();
    expect(again.writes()).toEqual([]);
    expect(again.readsOf("radarApps")).toBe(0);
    expect(again.readsOf("radarAppCandidates")).toBe(0);
  });

  it("une app mise de côté sort de la file des recherches, celles du haut de la liste y restent", async () => {
    const s = scene();
    await run(holdListTail, { db: memoryDb(s.w.tables).db }, {});
    const due = (await run(dueApps, { db: memoryDb(s.w.tables).db }, { now: NOW })) as { id: string }[];
    const ids = new Set(due.map((a) => a.id));
    for (const kept of [s.real, s.top, s.edge]) expect(ids.has(kept._id)).toBe(true);
    for (const held of [s.over, s.outside]) expect(ids.has(held._id)).toBe(false);
  });
});

describe("Radar — TrendSaaS et GetSaaS cherchés en premier (25/11/2026)", () => {
  it("leurs recherches changent : leur réseau repart à fond et passe devant les apps jamais cherchées de la liste", async () => {
    const w = world();
    // L'état de la prod au 25/11 : TrendSaaS (de départ) cherchée le 12/11 sans recherche complète, GetSaaS (à la main)
    // cherchée à fond le 15/11, et une app de la liste jamais cherchée, créée avant elles.
    const listee = w.app("listee", { trialSince: 1 });
    const trend = w.app("trendsaas", { name: "TrendSaaS", source: "seed", strong: ["trendsaas"], searches: ["trendsaas", "trendsaas.ai"], networkSearchedAt: NOW - 13 * 86_400_000 });
    const get = w.app("getsaas", { name: "Getsaas", strong: ["getsaas"], searches: ["getsaas", "#getsaas"], networkSearchedAt: NOW - 10 * 86_400_000, deepSearchedAt: NOW - 10 * 86_400_000 });
    const mem = memoryDb(w.tables, { limit: null });
    await run(seedApps, { db: mem.db }, { force: true });
    const after = (id: string) => w.tables.radarApps.find((a) => a._id === id)!;
    expect(after(trend._id)).toMatchObject({ searches: ["trendsaas", "trendsaas.ai", "#trendsaas"], source: "seed" });
    expect(after(get._id)).toMatchObject({ name: "GetSaaS", searches: ["getsaas", "#getsaas", "getsaas.fr"], source: "seed" });
    for (const id of [trend._id, get._id]) {
      expect(after(id).networkSearchedAt).toBeUndefined();
      expect(after(id).deepSearchedAt).toBeUndefined();
    }
    const due = (await run(dueApps, { db: memoryDb(w.tables, { limit: null }).db }, { now: NOW })) as { id: string; deep: boolean }[];
    const at = (id: string) => due.findIndex((a) => a.id === id);
    expect(at(trend._id)).toBeGreaterThanOrEqual(0);
    expect(at(get._id)).toBeGreaterThanOrEqual(0);
    expect(at(trend._id)).toBeLessThan(at(listee._id));
    expect(at(get._id)).toBeLessThan(at(listee._id));
    expect(due[at(trend._id)].deep && due[at(get._id)].deep).toBe(true);
  });
});
