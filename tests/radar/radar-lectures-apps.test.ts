import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { Id } from "../../convex/_generated/dataModel";
import { RESERVE_MISS_WAIT_MS } from "../../convex/radar/radarFreeMath";
import { applyAccountRead, deferAccounts, dueAccounts, holdFreeMisses, markReadError } from "../../convex/radar/radarNetworks";
import { recordRun } from "../../convex/radar/radarSignals";
import { dueStoreApps } from "../../convex/radar/radarStore";
import { exportPage } from "../../convex/radar/swarmExportPage";
import { memoryDb, type MemoryDoc } from "./convex-memory-db";

/**
 * Le 20/11/2026, la facture Convex de Jarvia : ~11 Go lus par jour par `applyAccountRead`, autant par les pages de
 * l'export lu par Swarm, encore 0,5 Go par `dueStoreApps`. Une seule cause : chacun relisait TOUTE la table
 * radarApps (2 187 apps, 1,84 Mo) à chaque appel — à chaque compte relevé, à chaque page d'export, toutes les
 * 5 minutes. La table était passée de ~400 à ~2 200 apps le 15/11 (import FarmSpot, suivi d'office).
 *
 * La base en mémoire compte les documents lus. La table simulée compte 2 000 apps de plus que celles qui servent :
 * une fonction qui la relit en entier dépasse les plafonds ci-dessous.
 */

const DAY = 86_400_000;
const NOW = Date.parse("2026-11-20T12:00:00Z");
const BULK = 2_000;

let seq = 0;
const id = (table: string) => `${table}_${String(++seq).padStart(6, "0")}`;

function app(slug: string, strong: string[], extra: Record<string, unknown> = {}): MemoryDoc {
  return {
    _id: id("radarApps"),
    _creationTime: ++seq,
    slug,
    name: slug,
    rivalOf: [],
    strong,
    weak: [],
    context: [],
    searches: [],
    status: "active",
    source: "manual",
    createdAt: 0,
    ...extra,
  };
}

function monde() {
  const apps: MemoryDoc[] = [];
  for (let i = 0; i < BULK; i++) apps.push(app(`app${i}`, [`appmotif${i}`]));
  const lumio = app("lumio", ["lumio"], { trackedCount: 1 });
  const glowup = app("glowup", ["glowup"], { trackedCount: 0 });
  const essai = app("essai", ["essaiapp"], { trialSince: NOW - DAY });
  const doublon = app("lumioo", ["lumio"], { status: "paused", mergedInto: lumio._id });
  apps.push(lumio, glowup, essai, doublon);
  const compte = (handle: string, appId: string, extra: Record<string, unknown> = {}): MemoryDoc => ({
    _id: id("radarTracked"),
    _creationTime: ++seq,
    platform: "tiktok",
    handle,
    appId,
    status: "active",
    matchedBy: "caption",
    fans: 1_000,
    videosSeen: 10,
    nextReadAt: NOW - DAY,
    readErrors: 0,
    addedAt: 0,
    ...extra,
  });
  const creatrice = compte("creatrice1", lumio._id, { readAt: NOW - 2 * DAY, proofAt: NOW - 3 * DAY });
  const testeuse = compte("testeuse", essai._id);
  const ancienne = compte("ancienne", doublon._id);
  // 10 vidéos (20 jours : hors fenêtre des formats) qui citent toutes Glowup, aucune Lumio : le compte change de réseau.
  const videos: MemoryDoc[] = [];
  for (let i = 0; i < 10; i++) {
    videos.push({
      _id: id("radarTrackedVideos"),
      _creationTime: ++seq,
      accountId: creatrice._id,
      appId: lumio._id,
      videoId: `v${i}`,
      publishedAt: NOW - 20 * DAY - i * 3_600_000,
      views: 1_000 + i,
      snapshots: [{ at: NOW - DAY, views: 1_000 + i }],
      lastSeenAt: NOW - DAY,
      caption: `mon avis sur glowup #${i}`,
    });
  }
  const tables: Record<string, MemoryDoc[]> = {
    radarApps: apps,
    radarTracked: [creatrice, testeuse, ancienne],
    radarTrackedVideos: videos,
    radarAccountJudgments: [],
    radarSignals: [],
    radarFormats: [],
    radarAppCandidates: [],
    radarStoreApps: [],
    radarSettings: [],
  };
  return { tables, apps, lumio, glowup, essai, doublon, creatrice, testeuse, ancienne };
}

/** Le contexte d'une mutation : lectures dans la base en mémoire, écritures notées (jamais relues). */
function mutationCtx(tables: Record<string, MemoryDoc[]>) {
  const mem = memoryDb(tables, { limit: null });
  const patches: { id: string; value: Record<string, unknown> }[] = [];
  const db = mem.db as { get: (id: string) => Promise<MemoryDoc | null>; query: (t: string) => unknown };
  const ctx = {
    db: {
      get: db.get,
      query: db.query,
      patch: async (id: string, value: Record<string, unknown>) => void patches.push({ id, value }),
      insert: async (table: string) => id(table),
      delete: async () => undefined,
    },
    scheduler: { runAfter: async () => undefined, runAt: async () => undefined },
  };
  return { mem, patches, ctx };
}

type Handler = { _handler: (ctx: unknown, args: unknown) => Promise<unknown> };
const handler = (f: unknown) => (f as Handler)._handler;

/** Ce qu'un passage de relevés passe à chaque relevé : les motifs des apps, lus une fois pour le passage. */
const rules = (apps: readonly MemoryDoc[]) =>
  apps.map((a) => ({
    _id: a._id,
    status: a.status,
    name: a.name,
    rivalOf: a.rivalOf,
    strong: a.strong,
    weak: a.weak,
    context: a.context,
    ...(a.not ? { not: a.not } : {}),
  }));

describe("relevé d'un compte (applyAccountRead) : les motifs des apps arrivent du passage", () => {
  it("ne relit pas la table des apps, et le compte change quand même de réseau", async () => {
    const w = monde();
    const { mem, patches, ctx } = mutationCtx(w.tables);
    await handler(applyAccountRead)(ctx, { accountId: w.creatrice._id, videos: [], light: [], now: NOW, apps: rules(w.apps) });
    expect(mem.reads()).toBeLessThan(100);
    expect(patches.find((p) => p.id === w.creatrice._id && "appId" in p.value)?.value.appId).toBe(w.glowup._id);
  });

  it("sans les motifs (relevé isolé, e2e) : il les lit lui-même, même verdict", async () => {
    const w = monde();
    const { patches, ctx } = mutationCtx(w.tables);
    await handler(applyAccountRead)(ctx, { accountId: w.creatrice._id, videos: [], light: [], now: NOW });
    expect(patches.find((p) => p.id === w.creatrice._id && "appId" in p.value)?.value.appId).toBe(w.glowup._id);
  });

  it("le passage de relevés lit les motifs une fois et les passe aux deux voies (gratuite et payante)", () => {
    const src = fs.readFileSync(path.join(__dirname, "../../convex/radar/radarNetworks.ts"), "utf8");
    const start = src.indexOf("async function accountReadsPass");
    const pass = src.slice(start, src.indexOf("\n}\n", start));
    expect(pass).toMatch(/runQuery\(internal\.radar\.radarNetworks\.appRules/);
    const calls = [...pass.matchAll(/runMutation\(internal\.radar\.radarNetworks\.applyAccountRead, \{([^}]*)\}/g)].map((m) => m[1]);
    expect(calls.length).toBe(2);
    for (const c of calls) expect(c).toMatch(/\bapps\b/);
  });
});

describe("l'échec gratuit retenu (radarFreeMath.holdMisses, brique 7, 20/11/2026)", () => {
  const MIN = 60_000;
  const passage = () => {
    const src = fs.readFileSync(path.join(__dirname, "../../convex/radar/radarNetworks.ts"), "utf8");
    const start = src.indexOf("async function accountReadsPass");
    return src.slice(start, src.indexOf("\n}\n", start));
  };

  it("posé par holdFreeMisses, rendu avec le compte dû (dueAccounts) : la voie sait que c'est son second essai", async () => {
    const w = monde();
    const { patches, ctx } = mutationCtx(w.tables);
    await handler(holdFreeMisses)(ctx, { ids: [w.creatrice._id], at: NOW - 10 * MIN });
    expect(patches).toEqual([{ id: w.creatrice._id, value: { freeMissAt: NOW - 10 * MIN } }]);
    w.creatrice.freeMissAt = NOW - 10 * MIN;
    const r = (await handler(dueAccounts)(mutationCtx(w.tables).ctx, { now: NOW, limit: 600 })) as { due: { handle: string; freeMissAt?: number }[] };
    expect(r.due.find((d) => d.handle === "creatrice1")?.freeMissAt).toBe(NOW - 10 * MIN);
    expect(r.due.find((d) => d.handle === "testeuse")).not.toHaveProperty("freeMissAt");
  });

  it("effacé par tout relevé réussi (applyAccountRead, gratuit ou payant) et par une erreur de relevé", async () => {
    const w = monde();
    w.creatrice.freeMissAt = NOW - 10 * MIN;
    const lu = mutationCtx(w.tables);
    await handler(applyAccountRead)(lu.ctx, { accountId: w.creatrice._id, videos: [], light: [], now: NOW, apps: rules(w.apps) });
    const final = lu.patches.filter((p) => p.id === w.creatrice._id && "readAt" in p.value).at(-1)?.value;
    expect(final && "freeMissAt" in final && final.freeMissAt === undefined).toBe(true);
    const err = mutationCtx(w.tables);
    await handler(markReadError)(err.ctx, { accountId: w.creatrice._id, now: NOW });
    const v = err.patches[0].value;
    expect([v.readErrors, v.nextReadAt, "freeMissAt" in v, v.freeMissAt]).toEqual([1, NOW + DAY, true, undefined]);
  });

  it("le passage retient avant de payer, et compte l'appel évité quand le compte retenu se lit gratuitement", () => {
    const pass = passage();
    // Le plan des ratés (radarFreeMath.missPlan, testé à part) reçoit la VRAIE part payante du passage — `n`, pas une
    // part supposée — et les comptes pas atteints (premiers relevés retenus au passage d'avant).
    const plan = pass.indexOf("const plan = missPlan(misses.paid, lane.notReached, { laneOpen: free.on, n, waitFirst, reserveReached: b.reserveReached }, now);");
    expect(plan).toBeGreaterThan(0);
    const hold = pass.indexOf("if (plan.hold.length) await ctx.runMutation(internal.radar.radarNetworks.holdFreeMisses, { ids: plan.hold.map((a) => a.id), at: now });");
    expect(hold).toBeGreaterThan(plan);
    // La part des retenus n'est dépensée nulle part : `limit` borne tout payant qui suit (premiers, ratés, débordement).
    const limit = pass.indexOf("limit = plan.limit;");
    expect(limit).toBeGreaterThan(plan);
    expect(pass).toMatch(/const paid = \(list: readonly DueAccount\[\], reason: PaidReason\): Promise<number> =>\s*pooled\(list, ACCOUNT_READ_POOL, \(acc\) => readPaid\(acc, limit, reason\)/);
    const premier = pass.indexOf('await paid(plan.firstPay, "premier");');
    expect(premier).toBeGreaterThan(limit);
    // Les comptes suivis ratés : leur vidéo à retrouver quel que soit le motif (un trou vérifié puis une page illisible
    // reprend le trou, revue du 20/11) et ce que sa page a dit (la mesure).
    expect(pass).toMatch(/pooled\(\s*plan\.missPay,\s*ACCOUNT_READ_POOL,\s*\(m\) => readPaid\(m\.account, limit, missReason\(m\), m\.newest, m\.seen\)/);
    expect(pass).toMatch(/const over = overflowToPay\(\s*lane\.notReached\.filter\(\(a\) => !a\.first\),\s*free\.on,\s*Date\.now\(\),\s*\);\s*await paid\(over\.pay, over\.reason\);/);
    expect(pass).not.toMatch(/holdMisses\(|reserveMisses\(|firstReadMisses\(/);
    // Relu gratuitement et rangé : les appels payants évités (l'échec retenu, ou le trou vérifié en bascule), après
    // l'écriture du relevé, et la vidéo du trou marquée vérifiée comme le payant l'aurait fait.
    const rangé = pass.indexOf("runMutation(internal.radar.radarNetworks.applyAccountRead, { accountId: acc.id, videos: f.videos");
    expect(rangé).toBeGreaterThan(0);
    const marque = pass.indexOf("if (f.gapChecked) await ctx.runMutation(internal.radar.radarNetworks.markGapChecked, { accountId: acc.id, videoId: f.gapChecked });");
    expect(marque).toBeGreaterThan(rangé);
    expect(pass.indexOf("for (const [key, calls] of Object.entries(freeReadSaved(f, acc)) as [SavedKey, number][]) usage.spare(key, calls);")).toBeGreaterThan(marque);
  });

  it("brique 4 en mesure : la page du trou n'est lue que si un payant peut partir, et l'accord est compté après le payant", () => {
    const pass = passage();
    // Une page de trou par appel de la part, au plus : sous la réserve ou poste coupé (n = 0), aucune.
    expect(pass).toMatch(/let gapPages = n;/);
    expect(pass).toMatch(/const gapPage = \(\) => gapPages-- > 0;\s*const f = await freeRead\(acc\.handle, \{ page: freePage, known, newest, gapPage \}, now, undefined, !acc\.located\);/);
    // La mesure : après le relevé payant d'un trou dont la page a été lue, avant toute écriture.
    const read = pass.indexOf("const { outcome, videos: all, reached } = read;");
    const measure = pass.indexOf("if (gap && seen) usage.measure(gapMeasure(seen, read, gap));");
    expect(read).toBeGreaterThan(0);
    expect(measure).toBeGreaterThan(read);
    expect(pass.indexOf('if (outcome === "error") await ctx.runMutation(internal.radar.radarNetworks.markReadError')).toBeGreaterThan(measure);
    // Le payant qui passe sa date sans la voir la marque vérifiée, comme avant.
    expect(pass).toMatch(/if \(gap && reached\.done && !reached\.found\) await ctx\.runMutation\(internal\.radar\.radarNetworks\.markGapChecked, \{ accountId: acc\.id, videoId: gap\.videoId \}\);/);
  });

  it("la mesure est rangée dans radarUsage.measured, même seule (ses crédits déjà écrits par une tranche d'avant)", async () => {
    const settings: MemoryDoc = { _id: id("radarSettings"), _creationTime: ++seq, key: "global" };
    const usageCtx = (rows: MemoryDoc[]) => {
      const mem = memoryDb({ radarSettings: [settings], radarUsage: rows }, { limit: null });
      const db = mem.db as { get: (id: string) => Promise<MemoryDoc | null>; query: (t: string) => unknown };
      const inserted: Record<string, unknown>[] = [];
      const patched: { id: string; value: Record<string, unknown> }[] = [];
      const ctx = {
        db: {
          get: db.get,
          query: db.query,
          insert: async (table: string, value: Record<string, unknown>) => (table === "radarUsage" && inserted.push(value), id(table)),
          patch: async (pid: string, value: Record<string, unknown>) => void patched.push({ id: pid, value }),
        },
      };
      return { ctx, inserted, patched };
    };
    const first = usageCtx([]);
    await handler(recordRun)(first.ctx, { poste: "tiktok", credits: 0, calls: 0, errors: 0, now: NOW, measured: { "trou-egal": 1 } });
    expect(first.inserted).toEqual([expect.objectContaining({ poste: "tiktok", credits: 0, calls: 0, measured: { "trou-egal": 1 } })]);
    const row: MemoryDoc = { _id: id("radarUsage"), _creationTime: ++seq, day: "2026-11-20", month: "2026-11", poste: "tiktok", credits: 7, calls: 5, errors: 0, saved: { repli: 1 }, measured: { "trou-egal": 2 } };
    const next = usageCtx([row]);
    await handler(recordRun)(next.ctx, { poste: "tiktok", credits: 3, calls: 1, errors: 0, now: NOW, measured: { "trou-egal": 1, "trou-ecart": 1 } });
    expect(next.patched.find((p) => p.id === row._id)?.value).toMatchObject({ credits: 10, calls: 6, saved: { repli: 1 }, measured: { "trou-egal": 3, "trou-ecart": 1 } });
  });
});

describe("sous la réserve, le raté attend la sonde (radarFreeMath.reserveMisses, brique 8, 20/11/2026)", () => {
  const MIN = 60_000;
  const passage = () => {
    const src = fs.readFileSync(path.join(__dirname, "../../convex/radar/radarNetworks.ts"), "utf8");
    const start = src.indexOf("async function accountReadsPass");
    return src.slice(start, src.indexOf("\n}\n", start));
  };
  const dus = async (tables: Record<string, MemoryDoc[]>, now: number) =>
    ((await handler(dueAccounts)(mutationCtx(tables).ctx, { now, limit: 600 })) as { due: { handle: string }[] }).due.map((d) => d.handle).sort();

  it("deferAccounts ne touche que l'heure du compte ; il n'est plus dû au passage suivant, il revient avec la sonde", async () => {
    const w = monde();
    expect(await dus(w.tables, NOW)).toEqual(["creatrice1", "testeuse"]);
    const { patches, ctx } = mutationCtx(w.tables);
    await handler(deferAccounts)(ctx, { ids: [w.creatrice._id], until: NOW + RESERVE_MISS_WAIT_MS });
    // Rien dans radarSettings : un seul champ, sur le compte (son échec retenu, s'il en a un, reste : cf heldSpared).
    expect(patches).toEqual([{ id: w.creatrice._id, value: { nextReadAt: NOW + RESERVE_MISS_WAIT_MS } }]);
    w.creatrice.nextReadAt = NOW + RESERVE_MISS_WAIT_MS;
    for (const k of [1, 2, 3, 4]) expect(await dus(w.tables, NOW + k * 10 * MIN)).toEqual(["testeuse"]);
    expect(await dus(w.tables, NOW + RESERVE_MISS_WAIT_MS)).toEqual(["creatrice1", "testeuse"]);
  });

  it("le passage repousse sous la réserve seulement, avant le payant, sans toucher ce que la voie n'a pas atteint ni la sonde", () => {
    const pass = passage();
    const hold = pass.indexOf("runMutation(internal.radar.radarNetworks.holdFreeMisses");
    // La réserve vient de l'état du budget du passage (missPlan → reserveMisses, testé à part).
    const reserve = pass.indexOf("reserveReached: b.reserveReached }, now);");
    const defer = pass.indexOf(
      "\n    if (plan.reserveDefer.length) await ctx.runMutation(internal.radar.radarNetworks.deferAccounts, { ids: plan.reserveDefer.map((a) => a.id), until: now + RESERVE_MISS_WAIT_MS });\n",
    );
    expect(hold).toBeGreaterThan(0);
    expect(reserve).toBeGreaterThan(0);
    expect(reserve).toBeLessThan(hold);
    expect(defer).toBeGreaterThan(hold);
    // Repoussés avant tout relevé payant (premiers relevés, comptes suivis, débordement).
    expect(pass.indexOf('await paid(plan.firstPay, "premier")')).toBeGreaterThan(defer);
    // Pas atteints : toujours la voie suivante ou le payant d'avant (firstReadMisses dans missPlan, overflowToPay),
    // jamais repoussés ici.
    expect(pass).toMatch(/missPlan\(misses\.paid, lane\.notReached,/);
    expect(pass).toMatch(/overflowToPay\(\s*lane\.notReached\.filter\(\(a\) => !a\.first\)/);
    // La sonde part toujours, après, telle quelle : le premier compte dû du passage (repoussé ou non) ou le plus ancien.
    const probe = pass.indexOf("if (needsBalanceProbe(b) && paidCalls === 0) {");
    expect(probe).toBeGreaterThan(defer);
    expect(pass).toMatch(/const probe: DueAccount \| null = due\[0\] \?\? \(await ctx\.runQuery\(internal\.radar\.radarNetworks\.probeAccount, \{\}\)\);\s*if \(probe\) await readPaid\(probe, 1, "sonde"\);/);
    // Rien de nouveau dans radarSettings : noteFreeRun garde ses champs.
    expect(pass).toMatch(/noteFreeRun, \{\s*ok: free\.ok,\s*fallback: free\.fallback,\s*why: missCounts\(lane\.failed\),\s*stopped: free\.stopped,\s*waiting: lane\.notReached\.length - over\.pay\.length,\s*now: Date\.now\(\),\s*\}/);
  });
});

describe("comptes dus (dueAccounts) : les apps actives arrivent du passage", () => {
  it("ne relit pas la table des apps", async () => {
    const w = monde();
    const { mem, ctx } = mutationCtx(w.tables);
    const active = w.apps.filter((a) => a.status === "active").map((a) => a._id);
    const r = (await handler(dueAccounts)(ctx, { now: NOW, limit: 600, active })) as { due: { handle: string }[]; parked: string[] };
    expect(mem.reads()).toBeLessThanOrEqual(w.tables.radarTracked.length);
    expect(r.due.map((d) => d.handle).sort()).toEqual(["creatrice1", "testeuse"]);
    expect(r.parked).toEqual([w.ancienne._id]);
  });
});

describe("contrôles App Store (dueStoreApps)", () => {
  it("file vide : rien à comparer, la table des apps n'est pas lue", async () => {
    const w = monde();
    const { mem, ctx } = mutationCtx(w.tables);
    const r = (await handler(dueStoreApps)(ctx, { now: NOW, limit: 60 })) as { due: unknown[]; followed: unknown[] };
    expect(r.due).toEqual([]);
    expect(mem.reads()).toBe(0);
  });
});

describe("export vers Swarm (exportPage) : une page ne lit que les apps de ses lignes", () => {
  it("vidéos d'une app : quelques lectures, pas toute la table des apps", async () => {
    const w = monde();
    const { mem, ctx } = mutationCtx(w.tables);
    const r = await exportPage(ctx as never, "trackedVideos", null, [w.lumio._id as Id<"radarApps">]);
    expect(mem.reads()).toBeLessThan(50);
    expect(r.rows).toHaveLength(10);
  });

  it("comptes : une app à l'essai reste cachée, une app fondue vaut la vraie", async () => {
    const w = monde();
    const { mem, ctx } = mutationCtx(w.tables);
    const essai = await exportPage(ctx as never, "tracked", null, [w.essai._id as Id<"radarApps">]);
    expect(essai.rows).toEqual([]);
    const fondue = await exportPage(ctx as never, "tracked", null, [w.doublon._id as Id<"radarApps">]);
    expect(fondue.rows.map((x) => (x as { handle: string }).handle)).toEqual(["ancienne"]);
    expect(mem.reads()).toBeLessThan(100);
  });
});
