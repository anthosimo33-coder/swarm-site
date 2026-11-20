import fs from "node:fs";
import path from "node:path";
import { getFunctionName } from "convex/server";
import { afterEach, describe, expect, it } from "vitest";
import { tick } from "../../convex/radar/gate";
import { MEDIAN_WINDOW } from "../../convex/radar/radarNetworkMath";
import { VIDEO_KEEP_DAYS, purgeOldVideos } from "../../convex/radar/radarNetworks";
import { memoryDb, type MemoryDoc } from "./convex-memory-db";

/**
 * Ce que le déménagement du Radar ajoute dans Kopycat (20/11/2026) : l'interrupteur RADAR_ON par lequel passent toutes
 * ses tâches planifiées, leur branchement, et la purge des vidéos de plus de 6 mois.
 */

type Handler = { _handler: (ctx: unknown, args: unknown) => Promise<unknown> };
const handler = (f: unknown) => (f as Handler)._handler;
const root = path.join(__dirname, "../..");

describe("interrupteur du Radar (radar/gate.tick)", () => {
  const env = { ...process.env };
  afterEach(() => {
    process.env = { ...env };
  });
  const run = async () => {
    const scheduled: string[] = [];
    const ctx = { scheduler: { runAfter: async (_ms: number, ref: unknown) => void scheduled.push(getFunctionName(ref as never)) } };
    const r = await handler(tick)(ctx, { fn: "radar/radarNetworks:runAccountReads" });
    return { r, scheduled };
  };

  it("éteint par défaut : rien ne part tant que RADAR_ON n'est pas à 1", async () => {
    delete process.env.RADAR_ON;
    delete process.env.SWARM_SYNC_OFF;
    expect(await run()).toEqual({ r: false, scheduled: [] });
  });

  it("jamais sur le dev, même allumé (SWARM_SYNC_OFF=1)", async () => {
    process.env.RADAR_ON = "1";
    process.env.SWARM_SYNC_OFF = "1";
    expect(await run()).toEqual({ r: false, scheduled: [] });
  });

  it("allumé : lance la fonction demandée", async () => {
    process.env.RADAR_ON = "1";
    delete process.env.SWARM_SYNC_OFF;
    expect(await run()).toEqual({ r: true, scheduled: ["radar/radarNetworks:runAccountReads"] });
  });
});

describe("tâches planifiées du Radar (convex/crons.ts)", () => {
  const crons = fs.readFileSync(path.join(root, "convex/crons.ts"), "utf8");
  const targets = [...crons.matchAll(/radar\("([^"]+)"\)/g)].map((m) => m[1]);

  it("toutes passent par l'interrupteur, aucune n'appelle le Radar en direct", () => {
    expect(targets.length).toBeGreaterThanOrEqual(25);
    expect(crons).not.toMatch(/internal\.radar\.radar\w+\./);
  });

  it("chacune vise une fonction exportée du Radar", () => {
    const missing = targets.filter((t) => {
      const [file, fn] = t.split(":");
      const src = path.join(root, `convex/radar/${file}.ts`);
      return !fs.existsSync(src) || !new RegExp(`export const ${fn} = internal(Action|Mutation)\\(`).test(fs.readFileSync(src, "utf8"));
    });
    expect(missing).toEqual([]);
  });

  it("ni pubs, ni ancien Radar, ni essai des premiers relevés, ni analyses par projet", () => {
    expect(targets.filter((t) => /Ads|FirstRead|Insights|runRadarSync/.test(t))).toEqual([]);
  });
});

describe("purge des vidéos de plus de 6 mois (radarNetworks.purgeOldVideos)", () => {
  it("efface les vieilles vidéos, sauf les dernières de chaque compte (sa médiane en dépend)", async () => {
    const DAY = 86_400_000;
    const now = Date.now();
    let seq = 0;
    const video = (accountId: string, ageDays: number): MemoryDoc => ({
      _id: `radarTrackedVideos_${String(++seq).padStart(5, "0")}`,
      _creationTime: seq,
      accountId,
      appId: "radarApps_1",
      videoId: `v${seq}`,
      publishedAt: now - ageDays * DAY,
      views: 100,
      snapshots: [],
      lastSeenAt: now,
    });
    // A : 10 vidéos récentes et 30 de 7 à 12 mois → ses 30 dernières = les 10 récentes + les 20 plus récentes des vieilles.
    const a = [...Array.from({ length: 10 }, (_, i) => video("A", 5 + i)), ...Array.from({ length: 30 }, (_, i) => video("A", VIDEO_KEEP_DAYS + 20 + i * 5))];
    // B : 12 vidéos, toutes vieilles, moins que MEDIAN_WINDOW → toutes gardées.
    const b = Array.from({ length: 12 }, (_, i) => video("B", VIDEO_KEEP_DAYS + 10 + i));
    const mem = memoryDb({ radarTrackedVideos: [...a, ...b] }, { limit: null });
    const deleted: string[] = [];
    const scheduled: unknown[] = [];
    const db = mem.db as { get: unknown; query: unknown };
    const ctx = {
      db: { get: db.get, query: db.query, delete: async (id: string) => void deleted.push(id) },
      scheduler: { runAfter: async (_ms: number, _ref: unknown, args: unknown) => void scheduled.push(args) },
    };
    const n = await handler(purgeOldVideos)(ctx, {});
    const oldestA = a.slice(10).sort((x, y) => (x.publishedAt as number) - (y.publishedAt as number)).slice(0, 40 - MEDIAN_WINDOW).map((x) => x._id);
    expect(n).toBe(10);
    expect(deleted.sort()).toEqual(oldestA.sort());
    expect(scheduled).toEqual([]);
  });
});
