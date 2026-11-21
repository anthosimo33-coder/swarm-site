import fs from "node:fs";
import path from "node:path";
import { getFunctionName } from "convex/server";
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { appRules, attachFromSearch } from "../../convex/radar/radarNetworks";
import { upsertDiscovered } from "../../convex/radar/radarSignals";
import { DEFAULT_BUDGET } from "../../convex/radar/radarSignalsMath";
import { MAX_PER_OTHER_APP, MAX_TRACKED } from "../../convex/radar/radarNetworkMath";
import { memoryDb, type MemoryDoc } from "./convex-memory-db";

/**
 * LEVIERS DE LA FACTURE CONVEX, SUITE (20/11/2026) : deux lectures de radarApps (~2 200 apps, 1,84 Mo le 20/11/2026)
 * relevées par la revue, qu'aucun des leviers L1-L4 ne traitait :
 *  - L5 `attachFromSearch` (une page de la recherche du réseau d'une app) : dès qu'un auteur qui cite l'app n'est pas
 *    suivi, le compteur des places (radarSignals.trackedCounts) relisait TOUTE la table. Il ne lit plus que les apps
 *    qui ont des comptes, ou pas encore de compteur (index `by_tracked_count`) : une app sans compte ne compte dans
 *    aucune somme. Le 20/11/2026 : 801 apps sur 2 187, 0,92 Mo sur 1,84. Même résultat, dans la même transaction ;
 *  - L6 `upsertDiscovered` (une recherche de découverte) : relisait toutes les apps actives à chaque recherche. Leurs
 *    motifs sont lus UNE fois par passage (`appRules`, apps actives) et passés à chaque recherche, comme pour les
 *    relevés de comptes depuis Jarvia #545 ; sans eux (e2e), relus ici comme avant.
 *
 * Deux preuves par levier, sur la base en mémoire qui compte les documents lus par table (tests/radar/convex-memory-db.ts),
 * avec 2 000 apps de plus que celles qui servent :
 *  1. la SORTIE est celle du code sans le levier, sur deux références écrites par ce test (GOLDEN_WRITE=1, valeur
 *     rendue, écritures dans l'ordre, tâches planifiées) :
 *     - BASCULE ABSENTE = MAIN : les entrées que ScrapeCreators produit (aucun `fansUnknown`), enregistrées dans un
 *       worktree détaché sur b4814df (main après les briques gratuites #19, #24, #25, #26 ; ni L5 ni L6 n'y sont) :
 *       `fixtures/leviers-convex-l5-l6-b4814df.json` ;
 *     - ENTRÉES DE TIKHUB : les mêmes scénarios, des vidéos aux abonnés non mesurés (`fansUnknown`, que seul TikHub
 *       produit et que main ne connaît pas). Le code sans levier, pour elles, est cette branche fusionnée (58f3d58)
 *       où trackedCounts relit toute la table et upsertDiscovered relit les apps actives (les deux corps d'avant
 *       8b77ffc), enregistrée dans un worktree détaché : `fixtures/leviers-convex-l5-l6-tikhub-58f3d58-sans-levier.json`.
 *       Cette copie rend aussi, au bit près, la référence de main sur les entrées de ScrapeCreators.
 *     Le code d'aujourd'hui doit reproduire chacune à l'identique ;
 *  2. les LECTURES de radarApps tombent sous un plafond que le code d'avant dépasse (plus de 2 000).
 * Les mondes sont tirés d'une graine fixe : l'égalité est prouvée sur ces mondes, pas formellement.
 */

type Ref = "main" | "tikhub";
const FILES: Record<Ref, string> = {
  main: path.join(__dirname, "fixtures/leviers-convex-l5-l6-b4814df.json"),
  tikhub: path.join(__dirname, "fixtures/leviers-convex-l5-l6-tikhub-58f3d58-sans-levier.json"),
};
const WRITE = process.env.GOLDEN_WRITE === "1";
const NOW = Date.parse("2026-11-20T12:00:00Z");
const DAY = 86_400_000;
const BULK = 2_000;

const golden: Partial<Record<Ref, Record<string, unknown>>> = {};
const recorded: Record<Ref, Record<string, unknown>> = { main: {}, tikhub: {} };

/**
 * La sortie d'un scénario, comparée à sa référence (ou rangée, en mode écriture : les deux fichiers sont écrits, et
 * seul celui de la copie qui fait foi est gardé — main pour « main », la branche sans levier pour « tikhub »).
 */
function sameAs(ref: Ref, name: string, value: unknown): void {
  const got = JSON.parse(JSON.stringify(value)) as unknown;
  if (WRITE) {
    recorded[ref][name] = got;
    return;
  }
  const want = (golden[ref] ??= JSON.parse(fs.readFileSync(FILES[ref], "utf8")) as Record<string, unknown>);
  expect(want[name], `scénario absent de la référence ${ref} : ${name}`).toBeDefined();
  expect(got).toEqual(want[name]);
}

afterAll(() => {
  if (WRITE) for (const ref of ["main", "tikhub"] as const) fs.writeFileSync(FILES[ref], `${JSON.stringify(recorded[ref], null, 1)}\n`);
});

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(NOW);
});
afterEach(() => {
  vi.useRealTimers();
});

/** Hasard à graine fixe (mulberry32). */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}

/** Un monde : des tables, des identifiants qui ne suivent pas l'ordre de création (comme en Convex). */
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
  const app = (slug: string, strong: string[], extra: Record<string, unknown> = {}) =>
    add("radarApps", {
      slug,
      name: slug.charAt(0).toUpperCase() + slug.slice(1),
      rivalOf: [],
      strong,
      weak: [],
      context: [],
      searches: [...strong],
      status: "active",
      source: "manual",
      createdAt: 0,
      trackedCount: 0,
      ...extra,
    });
  /** Une app créée avant le compteur : pas de `trackedCount` du tout. */
  const uncounted = (slug: string, strong: string[]) => {
    const a = app(slug, strong);
    delete (a as Record<string, unknown>).trackedCount;
    return a;
  };
  const tracked = (handle: string, appId: string, extra: Record<string, unknown> = {}) =>
    add("radarTracked", { platform: "tiktok", handle, appId, status: "active", matchedBy: "caption", fans: 500, videosSeen: 3, nextReadAt: NOW, readErrors: 0, addedAt: 0, ...extra });
  return { tables, add, app, uncounted, tracked };
}

type Ctx = { db: unknown; scheduler: { runAfter: (...a: unknown[]) => Promise<void>; runAt: (...a: unknown[]) => Promise<void> } };

function ctxOf(tables: Record<string, MemoryDoc[]>) {
  const mem = memoryDb(tables, { limit: null });
  const scheduled: { at: string; fn: string; args: unknown }[] = [];
  const note = (at: string) => async (when: unknown, ref: unknown, args: unknown) => void scheduled.push({ at: `${at} ${String(when)}`, fn: getFunctionName(ref as never), args });
  const ctx: Ctx = { db: mem.db, scheduler: { runAfter: note("après"), runAt: note("à") } };
  return { mem, ctx, scheduled };
}

type Handler = { _handler: (ctx: unknown, args: unknown) => Promise<unknown> };
const run = (f: unknown, ctx: unknown, args: unknown) => (f as Handler)._handler(ctx, args);

/** Une vidéo de recherche (radarSignals.signalInput). */
const video = (videoId: string, handle: string, caption: string, extra: Record<string, unknown> = {}) => ({
  videoId,
  url: `https://www.tiktok.com/@${handle}/video/${videoId}`,
  authorId: `uid_${handle}`,
  authorHandle: handle,
  authorFans: 2_000,
  caption,
  lang: "en",
  publishedAt: NOW - 20 * 3_600_000,
  isAd: false,
  views: 60_000,
  likes: 900,
  comments: 40,
  shares: 12,
  saves: 30,
  ...extra,
});

/** Les apps qui ont des comptes, ou pas encore de compteur : celles que le compteur des places doit lire. */
const counted = (w: ReturnType<typeof world>) => w.tables.radarApps.filter((a) => a.trackedCount === undefined || (a.trackedCount as number) > 0).length;

/** Ce que la base rend d'une app à la place qu'elle prend (comme radarSignals.trackedCounts la calcule). */
const place = (a: MemoryDoc) => Math.max(0, ((a.trackedCount as number | undefined) ?? 0) - (((a.net as { offTopic?: number } | undefined)?.offTopic as number | undefined) ?? 0));

// ─── L5 : le compteur des places ne lit que les apps qui ont des comptes ─────

/**
 * La masse : 2 000 apps sans compte (dont des « hors sujet » rangés à 0 compte), 60 apps suivies (des concurrentes,
 * des comptes hors sujet), 3 apps sans compteur (leurs comptes en base : comptées par leur index, puis le gardent).
 * `room` : places laissées sous le plafond de tous les comptes (MAX_TRACKED), le reste pris par une grosse app.
 */
function attachWorld(seed: number, opts: { room: number; ofApp: number }) {
  const r = rng(seed);
  const w = world();
  for (let i = 0; i < BULK; i++) w.app(`bulk${i}`, [`bulkmotif${i}`], i % 50 === 0 ? { net: { accounts: 0, active: 0, offTopic: 2, posts7d: 0 } } : {});
  for (let i = 0; i < 60; i++) {
    w.app(`suivie${i}`, [`suiviemotif${i}`], {
      trackedCount: 1 + Math.floor(r() * 120),
      ...(r() < 0.3 ? { net: { accounts: 0, active: 0, offTopic: Math.floor(r() * 30), posts7d: 0 } } : {}),
      ...(r() < 0.15 ? { rivalOf: ["snytch"] } : {}),
    });
  }
  for (let i = 0; i < 3; i++) {
    const a = w.uncounted(`ancienne${i}`, [`anciennemotif${i}`]);
    for (let k = 0; k <= i; k++) w.tracked(`ancienne${i}_c${k}`, a._id);
  }
  const target = w.app("cible", ["cibleapp"], {
    trackedCount: opts.ofApp,
    networkSearch: { requestedAt: NOW - 60_000, startedAt: NOW - 60_000, step: 1, steps: 4, attached: 0, signals: 0 },
  });
  // Les comptes déjà là, et un auteur écarté pour cette app il y a un jour (pas revérifié).
  w.tracked("connu1", target._id);
  w.tracked("connu2", w.tables.radarApps[BULK + 5]._id);
  w.add("radarRejected", { handle: "ecarte1", appId: target._id, at: NOW - DAY });
  // Une grosse app prend le reste des places.
  const used = w.tables.radarApps.reduce((s, a) => s + place(a), 0) + 1 + 2 + 3;
  w.app("grosse", ["grossemotif"], { trackedCount: MAX_TRACKED - opts.room - used });
  return { w, target };
}

describe("L5 page de recherche du réseau (attachFromSearch) : le compteur des places lit les apps qui ont des comptes", () => {
  // Deux fois : les vidéos de ScrapeCreators (référence : main), puis celles de TikHub, la quatrième sans les abonnés de
  // son auteur (référence : la branche sans le levier).
  for (const [ref, label, extra] of [
    ["main", "", {}],
    ["tikhub", ", abonnés d'une vidéo non mesurés (TikHub)", { fansUnknown: ["v4"] }],
  ] as const) {
    it(`plafond de tous les comptes${label} : deux places, puis « plein » — même pour un compte francophone ; mêmes écritures qu'avant`, async () => {
      const { w, target } = attachWorld(51, { room: 2, ofApp: 10 });
      const videos = [
        video("v1", "nouveau1", "je teste cibleapp ce soir"),
        video("v2", "connu1", "encore cibleapp"),
        video("v3", "ecarte1", "cibleapp, mon avis"),
        video("v4", "nouveau2", "cibleapp en français", { lang: "fr" }),
        video("v5", "nouveau3", "cibleapp again"),
        video("v6", "horsujet", "rien à voir"),
        video("v7", "nouveau4", "cibleapp toujours", { lang: "fr" }),
      ];
      const withAccounts = counted(w);
      const { mem, ctx, scheduled } = ctxOf(w.tables);
      const out = await run(attachFromSearch, ctx, { appId: target._id, videos, foundBy: "réseau Cible", now: NOW, step: 2, ...extra });
      sameAs(ref, `L5 plafond total${label}`, { out, writes: mem.writes(), scheduled });
      // Le scénario passe par chaque issue : deux comptes ajoutés, deux refus du plafond, les apps sans compteur comptées.
      expect(out).toMatchObject({ attached: 2 });
      const ns = mem.writes().filter((x) => x.table === "radarApps" && x.id === target._id && "networkSearch" in ((x.value ?? {}) as object));
      expect((ns.at(-1)?.value as { networkSearch: { full?: number } }).networkSearch.full).toBe(2);
      const recounted = mem.writes().filter((x) => x.op === "patch" && x.table === "radarApps" && String(w.tables.radarApps.find((a) => a._id === x.id)?.slug).startsWith("ancienne"));
      expect(recounted.map((x) => x.value)).toEqual([{ trackedCount: 1 }, { trackedCount: 2 }, { trackedCount: 3 }]);
      // Lues : les apps qui ont des comptes ou pas de compteur, et l'app cherchée (relue par son résumé de réseau).
      expect(mem.readsOf("radarApps")).toBeLessThanOrEqual(withAccounts + 2);
      expect(mem.readsOf("radarApps")).toBeLessThan(100);
    });
  }

  it("plafond de l'app : la 300e place prise, le suivant refusé, un compte francophone passe outre ; mêmes écritures qu'avant", async () => {
    const { w, target } = attachWorld(52, { room: 500, ofApp: MAX_PER_OTHER_APP - 1 });
    const videos = [video("v1", "nouveau1", "cibleapp"), video("v2", "nouveau2", "cibleapp"), video("v3", "nouveau3", "cibleapp", { lang: "fr" }), video("v4", "connu1", "cibleapp")];
    const { mem, ctx, scheduled } = ctxOf(w.tables);
    const out = await run(attachFromSearch, ctx, { appId: target._id, videos, foundBy: "réseau Cible·fr", now: NOW, step: 3 });
    sameAs("main", "L5 plafond de l'app", { out, writes: mem.writes(), scheduled });
    expect(out).toMatchObject({ attached: 2 });
    expect(mem.writes().filter((x) => x.op === "insert" && x.table === "radarTracked").map((x) => (x.value as { handle: string }).handle)).toEqual(["nouveau1", "nouveau3"]);
    expect(mem.readsOf("radarApps")).toBeLessThan(100);
  });

  it("que des auteurs déjà suivis : le compteur n'est pas lu du tout (seule l'app cherchée)", async () => {
    const { w, target } = attachWorld(53, { room: 500, ofApp: 10 });
    const { mem, ctx, scheduled } = ctxOf(w.tables);
    const out = await run(attachFromSearch, ctx, { appId: target._id, videos: [video("v1", "connu1", "cibleapp"), video("v2", "connu2", "cibleapp")], foundBy: "réseau Cible", now: NOW });
    sameAs("main", "L5 auteurs connus", { out, writes: mem.writes(), scheduled });
    expect(mem.readsOf("radarApps")).toBe(1);
  });
});

// ─── L6 : la découverte reçoit les motifs des apps actives, lus une fois par passage ──

/**
 * La masse (2 000 apps actives et 20 en pause, dont des motifs qui seraient cités), des apps citées — motif fort,
 * motif courant avec son contexte, tournure retirée, une concurrente, une au plafond de son app —, des comptes déjà
 * suivis, des signaux connus (dont un dans la courbe), une app repérée déjà vue.
 */
function discoveryWorld(seed: number) {
  const r = rng(seed);
  const w = world();
  w.add("radarSettings", { key: "global", capUsd: DEFAULT_BUDGET.capUsd, postes: DEFAULT_BUDGET.postes, cutOrder: DEFAULT_BUDGET.cutOrder, alert80: true, budgetVersion: 10, discoveryCursor: 0, curveAdmitted: 3, curveDay: "2026-11-20", updatedAt: 0 });
  const cited: MemoryDoc[] = [];
  const at = new Set([3, 400, 999, 1500, 1998]);
  for (let i = 0; i < BULK; i++) {
    w.app(`bulk${i}`, [`bulkmotif${i}`], i % 100 === 0 ? { status: "paused", strong: ["glowly"] } : {});
    if (i === 3) cited.push(w.app("glowly", ["glowly", "glowly.app"], { trackedCount: 4 }));
    if (i === 400) cited.push(w.app("pixa", [], { weak: ["pixa"], context: ["photo", "retouche"] }));
    if (i === 999) cited.push(w.app("recentfollow", ["recentfollow"], { not: ["recent following"], rivalOf: ["snytch"], trackedCount: 30 }));
    if (i === 1500) cited.push(w.app("vocaai", ["vocaai", "@voca"], { trackedCount: MAX_PER_OTHER_APP }));
    if (i === 1998) cited.push(w.app("lumiq", ["lumiq"], { net: { accounts: 3, active: 3, posts7d: 1 }, trackedCount: 3 }));
  }
  expect(at.size).toBe(5);
  w.tracked("deja_suivi", cited[0]._id);
  w.add("radarAppCandidates", { key: "@uid_marque", kind: "mention", label: "@Marque", authors: ["autre"], authorCount: 1, fromApps: [], examples: [], status: "new", firstSeenAt: NOW - DAY, lastSeenAt: NOW - DAY });
  const pieces = ["glowly", "glowly.app", "pixa photo", "pixa", "his recent following", "recentfollow", "vocaai", "@voca", "lumiq", "ma routine", "lien sur monsite.io", "#bestapp"];
  const videos = Array.from({ length: 36 }, (_, i) => {
    const caption = [pieces[Math.floor(r() * pieces.length)], r() < 0.5 ? pieces[Math.floor(r() * pieces.length)] : "", `vidéo ${i}`].join(" ").trim();
    const handle = r() < 0.15 ? "deja_suivi" : `auteur${i % 23}`;
    const young = r() < 0.4;
    return video(`d${i}`, handle, caption, {
      lang: r() < 0.3 ? "fr" : "en",
      authorFans: Math.floor(r() * 30_000),
      views: Math.floor(r() * 400_000),
      publishedAt: young ? NOW - Math.floor(r() * 30) * 3_600_000 : NOW - Math.floor(r() * 20) * DAY,
      ...(r() < 0.3 ? { mentions: [{ id: r() < 0.5 ? "uid_marque" : `uid_m${i}`, label: r() < 0.5 ? "@Marque" : `@Compte${i}` }] } : {}),
    });
  });
  // Des signaux déjà connus : un dans la courbe, un hors courbe.
  for (const [k, inCurve] of [[2, true], [7, false]] as const) {
    const v = videos[k];
    w.add("radarSignals", {
      ...v,
      platform: "tiktok",
      ratio: 1,
      snapshots: [{ at: NOW - 3_600_000, views: 10 }],
      foundBy: ["avant"],
      firstSeenAt: NOW - DAY,
      lastSeenAt: NOW - 3_600_000,
      ...(inCurve ? { curveStartedAt: NOW - 3_600_000, nextCheckAt: NOW + 3_600_000 } : {}),
    });
  }
  return { w, videos, unknownFans: videos.filter((_, i) => i % 5 === 1).map((v) => v.videoId) };
}

describe("L6 découverte (upsertDiscovered) : les motifs des apps actives passés par le passage", () => {
  // Chaque monde deux fois : les recherches de ScrapeCreators (référence : main), puis celles de TikHub, où un
  // cinquième des vidéos arrive sans les abonnés de son auteur (référence : la branche sans le levier).
  const REFS = ["main", "tikhub"] as const;
  const LABEL: Record<Ref, string> = { main: "", tikhub: ", abonnés non mesurés (TikHub)" };
  const fans = (ref: Ref, unknownFans: string[]) => (ref === "tikhub" ? { fansUnknown: unknownFans } : {});
  for (const seed of [61, 62, 63]) {
    for (const ref of REFS) {
      const label = LABEL[ref];
      it(`graine ${seed}${label} : deux recherches d'un passage, motifs lus une fois — mêmes signaux, comptes, apps repérées et courbe qu'avant`, async () => {
        const { w, videos, unknownFans } = discoveryWorld(seed);
        const extra = fans(ref, unknownFans);
        // Ce que le passage lit une fois (appRules, apps actives), puis passe à chaque recherche.
        const rules = await run(appRules, ctxOf(w.tables).ctx, { active: true });
        const withAccounts = counted(w);
        const { mem, ctx, scheduled } = ctxOf(w.tables);
        const outs: unknown[] = [];
        outs.push(await run(upsertDiscovered, ctx, { videos: videos.slice(0, 18), foundBy: "app couple·fr", now: NOW, ...extra, apps: rules }));
        outs.push(await run(upsertDiscovered, ctx, { videos: videos.slice(18), foundBy: "ce site·fr", now: NOW, apps: rules }));
        sameAs(ref, `L6 graine ${seed}${label}`, { outs, writes: mem.writes(), scheduled });
        // Le scénario passe par chaque issue (sinon l'égalité ne prouverait rien sur elle).
        const writes = mem.writes();
        expect(writes.some((x) => x.op === "insert" && x.table === "radarTracked")).toBe(true);
        expect(writes.some((x) => x.op === "insert" && x.table === "radarSignals")).toBe(true);
        expect(writes.some((x) => x.op === "patch" && x.table === "radarSignals")).toBe(true);
        expect(writes.some((x) => x.op === "insert" && x.table === "radarAppCandidates")).toBe(true);
        expect(writes.some((x) => x.table === "radarSignals" && (x.value as { appName?: string })?.appName !== undefined)).toBe(true);
        // Lues : les apps qui ont des comptes ou pas de compteur (le compteur des places), et les apps qui ont gagné un
        // compte (leur résumé de réseau). Le code d'avant relisait les 2 000 apps actives à chaque recherche.
        expect(mem.readsOf("radarApps")).toBeLessThanOrEqual(2 * (withAccounts + 10));
        expect(mem.readsOf("radarApps")).toBeLessThan(100);
      });
    }
  }

  // Les motifs de TOUTES les apps passés (en pause comprises : des apps de la masse portent « glowly », créées avant
  // Glowly) : la découverte ne retient que les actives — même sortie que la graine 61, motifs des actives seules.
  for (const ref of REFS) {
    const label = LABEL[ref];
    it(`graine 61${label}, motifs de toutes les apps passés (en pause comprises) : une app en pause n'est jamais citée, même sortie`, async () => {
      const { w, videos, unknownFans } = discoveryWorld(61);
      const extra = fans(ref, unknownFans);
      const rules = (await run(appRules, ctxOf(w.tables).ctx, {})) as { status: string }[];
      const { mem, ctx, scheduled } = ctxOf(w.tables);
      const outs: unknown[] = [];
      outs.push(await run(upsertDiscovered, ctx, { videos: videos.slice(0, 18), foundBy: "app couple·fr", now: NOW, ...extra, apps: rules }));
      outs.push(await run(upsertDiscovered, ctx, { videos: videos.slice(18), foundBy: "ce site·fr", now: NOW, apps: rules }));
      // La même référence que la graine 61 aux motifs des actives seules (sur main, `apps` n'existe pas : relues).
      sameAs(ref, `L6 graine 61${label}`, { outs, writes: mem.writes(), scheduled });
      expect(rules.some((x) => x.status === "paused")).toBe(true);
    });

    it(`sans motifs passés (e2e, recherche isolée)${label} : les apps actives relues ici, même sortie qu'avant`, async () => {
      const { w, videos, unknownFans } = discoveryWorld(64);
      const extra = fans(ref, unknownFans);
      const { mem, ctx, scheduled } = ctxOf(w.tables);
      const out = await run(upsertDiscovered, ctx, { videos, foundBy: "app couple·fr", now: NOW, ...extra });
      sameAs(ref, `L6 sans motifs${label}`, { out, writes: mem.writes(), scheduled });
    });
  }

  it("les motifs passés sont ceux des apps actives, dans l'ordre de création (la première citée l'emporte), en pause exclues", async () => {
    const { w } = discoveryWorld(65);
    const rules = (await run(appRules, ctxOf(w.tables).ctx, { active: true })) as { _id: string; status: string }[];
    const active = w.tables.radarApps.filter((a) => a.status === "active").sort((a, b) => a._creationTime - b._creationTime);
    expect(rules.map((x) => x._id)).toEqual(active.map((a) => a._id));
    expect(rules.every((x) => x.status === "active")).toBe(true);
    // Sans `active`, toutes les apps, comme les relevés de comptes les lisent depuis #545.
    const all = (await run(appRules, ctxOf(w.tables).ctx, {})) as unknown[];
    expect(all).toHaveLength(w.tables.radarApps.length);
  });
});
