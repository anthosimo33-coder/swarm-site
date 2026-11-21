import fs from "node:fs";
import path from "node:path";
import { getFunctionName } from "convex/server";
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { autoFollow, triageToDo } from "../../convex/radar/radarAuto";
import { AUTO_COMMON_NOTE, autoPlan, storeTwinKey, TRIAGE_BATCH } from "../../convex/radar/radarAutoMath";
import { applyJudgmentsNow, e2eApplyJudgments, e2eJudgeAccounts, judgeWork } from "../../convex/radar/radarJudge";
import { APP_REVIEW, JUDGE_REVIEW, REVIEW_VERSION } from "../../convex/radar/radarJudgeReview";
import { memoryDb, UNDEFINED, type MemoryDoc } from "./convex-memory-db";

/**
 * LEVIERS DE LA FACTURE CONVEX (20/11/2026), SANS PERTE DE QUALITÉ. Des fonctions du Radar relisaient toute la table
 * radarApps (~2 200 apps, ~2 Mo) à chaque appel, pour quelques apps utiles :
 *  - L1 `autoFollow` (144 appels par jour) : même quand aucune app repérée n'était à regarder (une app des
 *    classements à hashtag, elle, les fait lire : elle peut être une app suivie) ;
 *  - L2 `judgeWork` (78 par jour) et `e2eJudgeAccounts` : pour les apps des comptes actifs d'une page ;
 *  - L3 `triageToDo` (48 par jour) : pour les noms des apps qui citent une quarantaine de mentions ;
 *  - L4 le périmètre de `applyJudgmentsNow` (48 par jour) : pour une dizaine de slugs relus et les apps en pause.
 *
 * Deux preuves par levier, sur une base en mémoire qui compte les documents lus PAR TABLE et note chaque écriture
 * (tests/radar/convex-memory-db.ts), avec 2 000 apps de plus que celles qui servent :
 *  1. la SORTIE est celle de main : l'enregistrement de référence (valeur rendue, écritures dans l'ordre, un champ
 *     retiré compris, tâches planifiées) a été écrit par ce test (GOLDEN_WRITE=1) dans un worktree détaché sur b4814df
 *     (main après les briques gratuites #19, #24, #25, #26 ; aucun des leviers L1-L6 n'y est), avec la base en mémoire
 *     de cette branche ; le code d'aujourd'hui doit le reproduire à l'identique. Il remplace celui de 191b053 (et de
 *     12519fd pour les apps des classements qui sont une app suivie, #21) : les 17 scénarios y sont identiques ;
 *  2. les LECTURES de radarApps tombent sous un plafond que le code d'avant dépasse (plus de 2 000).
 * Les mondes sont tirés d'une graine fixe : l'égalité est prouvée sur ces mondes, pas formellement.
 */

const FILE = path.join(__dirname, "fixtures/leviers-convex-l1-l4-b4814df.json");
const WRITE = process.env.GOLDEN_WRITE === "1";
const NOW = Date.parse("2026-11-20T12:00:00Z");
const DAY = 86_400_000;
const BULK = 2_000;

let golden: Record<string, unknown> | null = null;
const recorded: Record<string, unknown> = {};

/** La sortie d'un scénario, comparée à celle du code d'avant (ou rangée, en mode écriture). */
function sameAsBefore(name: string, value: unknown): void {
  const got = JSON.parse(JSON.stringify(value)) as unknown;
  if (WRITE) {
    recorded[name] = got;
    return;
  }
  golden ??= JSON.parse(fs.readFileSync(FILE, "utf8")) as Record<string, unknown>;
  expect(golden[name], `scénario absent de la référence : ${name}`).toBeDefined();
  expect(got).toEqual(golden[name]);
}

afterAll(() => {
  if (WRITE) fs.writeFileSync(FILE, `${JSON.stringify(recorded, null, 1)}\n`);
});

beforeEach(() => {
  // createApp date l'app créée avec Date.now() ; les minuteries restent vraies (la base en mémoire sert ses lectures
  // par setImmediate).
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

/**
 * Un monde : des tables, des identifiants et des dates de création qui ne dépendent que de lui. Comme en Convex,
 * l'ordre des identifiants n'est pas celui de la création (une permutation de la suite) : un code qui trierait par
 * identifiant au lieu de la date de création se verrait.
 */
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
  const bulk = (n: number, extra: (i: number) => Record<string, unknown> = () => ({})) => {
    for (let i = 0; i < n; i++) app(`bulk${i}`, [`bulkmotif${i}`], extra(i));
  };
  return { tables, add, app, bulk };
}

type Ctx = { db: unknown; scheduler: { runAfter: (...a: unknown[]) => Promise<void>; runAt: (...a: unknown[]) => Promise<void> } };

/** Le contexte d'une fonction Convex : la base en mémoire, et un planificateur qui note sans rien lancer. */
function ctxOf(tables: Record<string, MemoryDoc[]>) {
  const mem = memoryDb(tables, { limit: null });
  const scheduled: { at: string; fn: string; args: unknown }[] = [];
  const note = (at: string) => async (when: unknown, ref: unknown, args: unknown) => void scheduled.push({ at: `${at} ${String(when)}`, fn: getFunctionName(ref as never), args });
  const ctx: Ctx = { db: mem.db, scheduler: { runAfter: note("après"), runAt: note("à") } };
  return { mem, ctx, scheduled };
}

type Handler = { _handler: (ctx: unknown, args: unknown) => Promise<unknown> };
const run = (f: unknown, ctx: unknown, args: unknown) => (f as Handler)._handler(ctx, args);

// ─── L'outil de mesure : les écritures se relisent, les lectures se comptent par table ──

describe("base en mémoire (écritures, lectures par table)", () => {
  it("une écriture se relit par l'index, un document déjà lu ne change pas, chaque écriture est notée", async () => {
    const w = world();
    const a = w.app("une", ["une"]);
    w.add("radarTracked", { platform: "tiktok", handle: "h1", appId: a._id, status: "active" });
    const mem = memoryDb(w.tables, { limit: null });
    type Q = { withIndex: (i: string, f: (q: { eq: (f: string, v: unknown) => unknown }) => unknown) => { collect: () => Promise<MemoryDoc[]> } };
    const db = mem.db as {
      get: (id: string) => Promise<MemoryDoc | null>;
      query: (t: string) => Q;
      insert: (t: string, v: Record<string, unknown>) => Promise<string>;
      patch: (id: string, v: Record<string, unknown>) => Promise<void>;
      delete: (id: string) => Promise<void>;
    };
    const byApp = async () => (await db.query("radarTracked").withIndex("by_app", (q) => q.eq("appId", a._id)).collect()).map((t) => t.handle);
    const before = await db.get(a._id);
    const id = await db.insert("radarTracked", { platform: "tiktok", handle: "h2", appId: a._id, status: "active", note: undefined });
    await db.patch(a._id, { status: "paused", pausedReason: "perimetre" });
    await db.patch(a._id, { pausedReason: undefined });
    expect(before?.status).toBe("active");
    const after = await db.get(a._id);
    expect(after?.status).toBe("paused");
    expect("pausedReason" in (after ?? {})).toBe(false);
    expect((await db.query("radarApps").withIndex("by_status", (q) => q.eq("status", "paused")).collect()).map((x) => x._id)).toEqual([a._id]);
    expect(await byApp()).toEqual(["h1", "h2"]);
    await db.delete(id);
    expect(await byApp()).toEqual(["h1"]);
    expect(mem.writes().map((x) => `${x.op} ${x.table}`)).toEqual(["insert radarTracked", "patch radarApps", "patch radarApps", "delete radarTracked"]);
    expect(mem.writes()[2].value).toEqual({ pausedReason: UNDEFINED });
    expect(mem.readsOf("radarApps")).toBe(3);
    expect(mem.readsOf("radarTracked")).toBe(3);
    expect(mem.reads()).toBe(6);
  });
});

// ─── L1 : le suivi d'office ne lit les apps qu'à la première app repérée à regarder ──

function candidate(w: ReturnType<typeof world>, kind: string, label: string, extra: Record<string, unknown> = {}) {
  return w.add("radarAppCandidates", {
    key: `${kind}:${label.toLowerCase()}:${(w.tables.radarAppCandidates?.length ?? 0) + 1}`,
    kind,
    label,
    authors: [],
    authorCount: 0,
    fromApps: [],
    examples: [],
    status: "new",
    firstSeenAt: NOW - DAY,
    lastSeenAt: NOW - DAY,
    ...extra,
  });
}

const store = (tag: string, creators: string[], genre = "Productivity") => ({
  store: {
    storeId: `id${tag}`,
    artist: `${tag} Inc`,
    genre,
    released: "2026-01-01",
    tag,
    tagVideos: 40,
    tagViews: 400_000,
    creators: creators.map((handle) => ({ handle, why: "half" })),
  },
  authors: creators,
  authorCount: creators.length,
});

/**
 * Les apps repérées toutes écartées d'emblée (« preuve insuffisante », un seul compte, nom trop court, hors périmètre).
 * `stores` : avec deux apps des classements à hashtag, qui peuvent chacune être une app suivie (radarAutoMath.storeTwin).
 */
function skipOnlyWorld({ stores = true } = {}) {
  const w = world();
  w.bulk(BULK);
  w.app("glowly", ["glowly"]);
  if (stores) {
    candidate(w, "store", "Solo", store("soloapp", ["fan1"]));
    candidate(w, "store", "Duo boutique", store("duoshop", ["fan2", "fan3"], "Shopping"));
  }
  candidate(w, "ia", "Leadly", { authors: ["fan4"], authorCount: 1 });
  candidate(w, "market", "Ab", { market: { source: "m", productKind: "app", handle: "", org: "o", campaignUrl: "u", campaigns: 1, creators: 1, views: 1, spentCents: 1 } });
  candidate(w, "liste", "Ab", { liste: { source: "farmspot" } });
  candidate(w, "mention", "@chose", { authorCount: 3, triage: { at: NOW - DAY, kind: "other", name: "" } });
  return w;
}

/** Toutes les issues du suivi d'office dans un passage, dans l'ordre de ses sources. */
function mixedWorld() {
  const w = world();
  w.bulk(BULK);
  const glowly = w.app("glowly", ["glowly"], { trackedCount: 1 });
  // Un doublon fondu : ses motifs ne comptent plus pour « déjà suivie » ni « motif déjà pris ».
  w.app("glowlyold", ["fondusmotif"], { status: "paused", mergedInto: glowly._id });
  w.app("bookshelf", ["bookshelfapp"], { name: "Bookshelf" });
  w.app("vocaai", ["vocaai"], { name: "Vocaai" });
  w.app("pixa", ["pixaphoto"], { name: "Pixa" });
  const old = w.app("ancienne", ["ancienne"], { trackedCount: 2 });
  // Deux comptes mis en pause sous « ancienne » par une piste de l'IA : ils rejoignent l'app qu'ils poussent.
  for (const handle of ["pisteur1", "pisteur2"]) {
    w.add("radarTracked", { platform: "tiktok", handle, appId: old._id, status: "paused", pausedReason: "offTopic", matchedBy: "caption", fans: 500, videosSeen: 3, nextReadAt: NOW, readErrors: 0, addedAt: 0 });
  }
  const mkt = (label: string, handle = "") => ({ market: { source: "m", productKind: "app", handle, org: "o", campaignUrl: "u", campaigns: 2, creators: 9, views: 90_000, spentCents: 5_000 } });
  // Classements : une écartée, une suivie (3 comptes), la même sous un autre identifiant (déjà suivie dans le passage),
  // une à l'essai (2 comptes), une au nom courant.
  candidate(w, "store", "Solo", store("soloapp", ["fan1"]));
  candidate(w, "store", "Lumiq", store("lumiq", ["crea1", "crea2", "crea3", "crea4"]));
  candidate(w, "store", "Lumiq Pro", store("lumiq", ["crea5", "crea6", "crea7"]));
  candidate(w, "store", "Tryla", store("tryla", ["essai1", "essai2"]));
  candidate(w, "store", "Notes", store("notesapp", ["n1", "n2", "n3"]));
  // Place de marché : déjà suivie (motif d'une app), motif pris dans un autre, même nom qu'une app, sans verdict.
  candidate(w, "market", "Glowly", mkt("Glowly"));
  candidate(w, "market", "Voca", mkt("Voca"));
  candidate(w, "market", "Pixa", mkt("Pixa"));
  candidate(w, "market", "Waitly", mkt("Waitly"));
  candidate(w, "market", "Fondusmotif", mkt("Fondusmotif"));
  // Une piste de l'IA désignée par deux comptes.
  candidate(w, "ia", "Pistely", { authors: ["pisteur1", "pisteur2"], authorCount: 2 });
  // Listes importées : nom courant (sous « nomapp »), motif dans celui d'une app suivie, une simple.
  candidate(w, "liste", "Simple", { liste: { source: "farmspot", category: "Productivity" } });
  candidate(w, "liste", "Shelf", { liste: { source: "farmspot" } });
  candidate(w, "liste", "Quizzo", { liste: { source: "farmspot", category: "Education" } });
  // Une mention triée (app), un site trié (logiciel).
  candidate(w, "mention", "@habitoapp", { authorCount: 3, authors: ["m1", "m2", "m3"], triage: { at: NOW - DAY, kind: "app", name: "Habito" } });
  candidate(w, "domain", "deckmaker.io", { authorCount: 2, authors: ["d1", "d2"], triage: { at: NOW - DAY, kind: "software", name: "Deckmaker" } });
  return w;
}

/**
 * Le monde mixte, plus des apps des classements qui SONT une app suivie (radarAutoMath.storeTwin, 20/11/2026) : Fable,
 * qui serait « preuve insuffisante » (un seul compte, écarté de l'app il y a 3 jours : rien à rattacher) ; Orbi, trois
 * comptes, dont un qu'elle suit déjà ; Duna, homonyme d'une app en pause (aucune jumelle : elle suit le chemin habituel).
 * Les jumelles passent au milieu des créations du passage : l'instantané des apps et le compteur sont partagés.
 */
function twinWorld() {
  const w = mixedWorld();
  const fable = w.app("fable", ["fableapp"], { name: "Fable", searches: ["fable app", "#fableapp"] });
  const orbi = w.app("orbi", ["orbiapp"], { name: "Orbi", searches: ["#orbiapp"], trackedCount: 1 });
  w.app("duna", ["dunaapp"], { name: "Duna", searches: ["#dunaapp"], status: "paused" });
  w.add("radarTracked", { platform: "tiktok", handle: "orbi1", appId: orbi._id, status: "active", matchedBy: "caption", fans: 900, videosSeen: 4, nextReadAt: NOW, readErrors: 0, addedAt: 0 });
  w.add("radarRejected", { handle: "fanfable", appId: fable._id, at: NOW - 3 * DAY });
  candidate(w, "store", "Duna", store("dunaapp", ["du1", "du2", "du3"]));
  candidate(w, "store", "Orbi", store("orbiapp", ["orbi1", "orbi2", "orbi3"]));
  candidate(w, "store", "Fable", store("fableapp", ["fanfable"]));
  return w;
}

/** Le verdict de l'IA sur le motif de chaque app repérée : courant pour « Notes » et « Simple », aucun pour « Waitly ». */
function verdictsFor(w: ReturnType<typeof world>) {
  return (w.tables.radarAppCandidates ?? [])
    .filter((c) => c.label !== "Waitly")
    .map((c) => ({ id: c._id, common: c.label === "Notes" || c.label === "Simple" }));
}

describe("L1 suivi d'office (autoFollow) : les apps ne sont lues qu'à la première app repérée à regarder", () => {
  it("file vide : aucune app lue, rien d'écrit", async () => {
    const w = world();
    w.bulk(BULK);
    const { mem, ctx, scheduled } = ctxOf(w.tables);
    const r = await run(autoFollow, ctx, { now: NOW, verdicts: [] });
    sameAsBefore("L1 file vide", { r, writes: mem.writes(), scheduled });
    expect(mem.readsOf("radarApps")).toBe(0);
  });

  it("que des apps écartées d'emblée, hors classements : aucune app lue, mêmes écritures qu'avant", async () => {
    const w = skipOnlyWorld({ stores: false });
    // Le monde est bien celui annoncé, vérifié sur une copie d'avant le passage (après l'enregistrement : storeTwinKey
    // n'existe pas sur main, où la référence est écrite).
    const candidates = structuredClone(w.tables.radarAppCandidates);
    const { mem, ctx, scheduled } = ctxOf(w.tables);
    const r = await run(autoFollow, ctx, { now: NOW, verdicts: verdictsFor(w) });
    sameAsBefore("L1 écartées hors classements", { r, writes: mem.writes(), scheduled });
    for (const c of candidates) {
      expect("skip" in autoPlan(c as never)).toBe(true);
      expect(storeTwinKey(c as never)).toBeNull();
    }
    expect(mem.readsOf("radarApps")).toBe(0);
    expect(mem.writes().filter((x) => x.table === "radarAppCandidates")).toHaveLength(w.tables.radarAppCandidates.length);
  });

  it("que des apps écartées d'emblée, dont des apps des classements à hashtag : les apps lues une seule fois, mêmes écritures qu'avant", async () => {
    // Depuis le 20/11/2026 (radarAutoMath.storeTwin), une app des classements peut être une app suivie, même écartée
    // d'emblée : les apps sont lues pour elle — une fois pour tout le passage.
    const w = skipOnlyWorld();
    const candidates = structuredClone(w.tables.radarAppCandidates);
    const { mem, ctx, scheduled } = ctxOf(w.tables);
    const r = await run(autoFollow, ctx, { now: NOW, verdicts: verdictsFor(w) });
    sameAsBefore("L1 écartées", { r, writes: mem.writes(), scheduled });
    for (const c of candidates) expect("skip" in autoPlan(c as never)).toBe(true);
    expect(candidates.filter((c) => storeTwinKey(c as never) !== null)).toHaveLength(2);
    expect(mem.readsOf("radarApps")).toBe(w.tables.radarApps.length);
    expect(mem.writes().filter((x) => x.table === "radarAppCandidates")).toHaveLength(w.tables.radarAppCandidates.length);
  });

  it("apps des classements qui sont une app suivie, parmi toutes les issues : même sortie qu'avant, apps lues une seule fois", async () => {
    const w = twinWorld();
    const { mem, ctx, scheduled } = ctxOf(w.tables);
    const r = await run(autoFollow, ctx, { now: NOW, verdicts: verdictsFor(w) });
    sameAsBefore("L1 jumelles", { r, writes: mem.writes(), scheduled });
    // Le scénario passe bien par les jumelles (sinon l'égalité ne prouverait rien sur elles), et par une création.
    const notes = mem
      .writes()
      .filter((x) => x.table === "radarAppCandidates" && x.op === "patch")
      .map((x) => (x.value as { autoNote?: string }).autoNote);
    expect(notes).toEqual(expect.arrayContaining(["même app que Fable : ses comptes l'ont rejointe", "même app que Orbi : ses comptes l'ont rejointe", "suivie d'office"]));
    expect(mem.writes().filter((x) => x.op === "insert" && x.table === "radarTracked").length).toBeGreaterThanOrEqual(2);
    // Une lecture de la table pour le passage, puis des lectures une à une (l'app créée, celles que l'on patche).
    expect(mem.readsOf("radarApps")).toBeLessThan(2 * w.tables.radarApps.length);
  });

  it("toutes les issues dans un passage (suivie, essai, déjà suivie, motif pris, nom courant, sans verdict) : même sortie qu'avant", async () => {
    const w = mixedWorld();
    const { mem, ctx, scheduled } = ctxOf(w.tables);
    const r = await run(autoFollow, ctx, { now: NOW, verdicts: verdictsFor(w) });
    sameAsBefore("L1 mixte", { r, writes: mem.writes(), scheduled });
    // Le scénario passe bien par chaque issue (sinon l'égalité ne prouverait rien sur elle).
    const notes = mem
      .writes()
      .filter((x) => x.table === "radarAppCandidates" && x.op === "patch")
      .map((x) => (x.value as { autoNote?: string }).autoNote);
    expect(notes).toEqual(expect.arrayContaining(["preuve insuffisante", "suivie d'office", "déjà suivie", AUTO_COMMON_NOTE, "motif déjà pris par une autre app"]));
    expect(notes.some((n) => n?.startsWith("à l'essai"))).toBe(true);
    expect(notes.some((n) => n?.includes("nom courant"))).toBe(true);
    expect(mem.writes().filter((x) => x.op === "insert" && x.table === "radarApps").length).toBeGreaterThanOrEqual(4);
  });
});

// ─── L2 : le parcours des comptes à juger lit les apps de ses comptes actifs ──

function judgeWorld(seed: number) {
  const r = rng(seed);
  const w = world();
  w.bulk(BULK);
  const apps = Array.from({ length: 8 }, (_, i) =>
    w.app(`jugee${i}`, [`jugee${i}`], {
      searches: [`jugee${i}`, `#jugee${i}`],
      ...(i % 3 === 0 ? { pitch: `Jugee${i} range tes photos` } : {}),
      ...(i % 3 === 1 ? { nature: { digital: true, kind: "app", aboutIt: "oui", why: `jugee${i} est une app` } } : {}),
      ...(i % 4 === 2 ? { store: { storeId: `s${i}`, artist: "Studio", genre: "Photo", released: "2026-01-01" } } : {}),
    }),
  );
  const merged = w.app("jugeefondue", ["jugeefondue"], { status: "paused", mergedInto: apps[0]._id });
  const pool = [...apps.map((a) => a._id), merged._id, "radarApps_supprimee"];
  const statuses = ["active", "active", "active", "paused"];
  const matched = ["caption", "caption", "seed", "manual"];
  for (let i = 0; i < 230; i++) {
    const appId = pool[Math.floor(r() * pool.length)];
    const appSlug = (w.tables.radarApps.find((a) => a._id === appId)?.slug as string | undefined) ?? "inconnue";
    const handleCites = r() < 0.2;
    const t = w.add("radarTracked", {
      platform: "tiktok",
      handle: handleCites ? `${appSlug}_fan${i}` : `compte${i}`,
      appId,
      status: statuses[Math.floor(r() * statuses.length)],
      matchedBy: matched[Math.floor(r() * matched.length)],
      fans: 1_000,
      videosSeen: 5,
      nextReadAt: NOW,
      readErrors: 0,
      addedAt: 0,
      ...(r() < 0.3 ? { bio: r() < 0.5 ? `ambassadrice ${appSlug} app` : "maman de deux enfants" } : {}),
    });
    const n = Math.floor(r() * 5);
    for (let k = 0; k < n; k++) {
      w.add("radarTrackedVideos", {
        accountId: t._id,
        appId,
        videoId: `v${i}_${k}`,
        publishedAt: NOW - k * DAY,
        views: 100 * k,
        snapshots: [],
        lastSeenAt: NOW,
        caption: r() < 0.4 ? `je teste ${appSlug} aujourd'hui #pub` : `ma routine du matin ${k}`,
        ...(r() < 0.3 ? { hook: `le secret de ${r() < 0.5 ? appSlug : "ma peau"}` } : {}),
        ...(r() < 0.1 ? { platform: "instagram" } : {}),
      });
    }
    if (r() < 0.15) w.add("radarAccountJudgments", { accountId: t._id, appId, handle: t.handle, weak: "aucune", proof: { by: null, cites: 0, of: 0 }, verdict: "pousse", why: "déjà", at: NOW - DAY, ...(r() < 0.5 ? { v: 99 } : {}) });
  }
  return w;
}

describe("L2 parcours des comptes à juger (judgeWork, e2eJudgeAccounts) : les apps lues à la demande", () => {
  for (const seed of [11, 12]) {
    it(`graine ${seed} : mêmes comptes et même curseur qu'avant, page après page`, async () => {
      const w = judgeWorld(seed);
      const pages: unknown[] = [];
      const appReads: number[] = [];
      let cursor: string | null = null;
      let total = 0;
      for (const limit of [7, 1_000, 1_000]) {
        const { mem, ctx } = ctxOf(w.tables);
        const out = (await run(judgeWork, ctx, { cursor, limit })) as { items: { appId: string }[]; cursor: string | null; done: boolean };
        pages.push(out);
        appReads.push(mem.readsOf("radarApps"));
        total += out.items.length;
        cursor = out.cursor;
      }
      sameAsBefore(`L2 graine ${seed}`, pages);
      expect(total).toBeGreaterThan(10);
      // Les apps lues : au plus une par app du monde (9 apps, dont une fondue ; l'app supprimée ne se lit pas).
      for (const n of appReads) expect(n).toBeLessThanOrEqual(9);
    });
  }

  it("e2eJudgeAccounts : mêmes comptes demandés, même jugement écrit", async () => {
    const w = judgeWorld(13);
    const handles = (w.tables.radarTracked ?? []).slice(0, 60).map((t) => t.handle as string);
    const { mem, ctx } = ctxOf(w.tables);
    const out = await run(e2eJudgeAccounts, ctx, { handles, answers: handles.map((handle, i) => ({ handle, verdict: i % 2 ? "pousse" : "sans_rapport", why: `raison ${i}` })) });
    sameAsBefore("L2 e2eJudgeAccounts", { out, writes: mem.writes() });
    expect(mem.readsOf("radarApps")).toBeLessThanOrEqual(9);
    expect((out as { written: number }).written).toBeGreaterThan(0);
  });
});

// ─── L3 : le tri des mentions lit les noms des apps qui les citent, pas toute la table ──

function triageWorld(seed: number, n = 70) {
  const r = rng(seed);
  const w = world();
  w.bulk(BULK);
  const live = Array.from({ length: 12 }, (_, i) => w.app(`citee${i}`, [`citee${i}`]));
  const merged = w.app("fondue", ["fondue"], { status: "paused", mergedInto: live[0]._id });
  const gone = "radarApps_supprimee";
  const pool = [...live.map((a) => a._id), merged._id, gone];
  for (let i = 0; i < n; i++) {
    const kind = r() < 0.5 ? "domain" : "mention";
    const label = kind === "domain" ? `site${i}.com` : `@compte${i}`;
    const fromApps = Array.from({ length: Math.floor(r() * 4) }, () => pool[Math.floor(r() * pool.length)]);
    const x = r();
    candidate(w, kind, label, {
      authorCount: 1 + Math.floor(r() * 9),
      fromApps,
      ...(x < 0.15 ? { triage: { at: NOW, kind: "app", name: label } } : x < 0.25 ? { autoAt: NOW } : {}),
    });
  }
  return w;
}

describe("L3 tri des mentions (triageToDo) : les noms des apps lus un à un", () => {
  // 70 mentions et sites : les sites ne remplissent pas le lot, les mentions le complètent ; 160 : les sites seuls le
  // remplissent, les mentions ne sont pas lues.
  for (const [seed, n] of [[1, 70], [2, 70], [3, 70], [4, 160]]) {
    it(`graine ${seed} (${n} candidates) : mêmes lots qu'avant, apps lues ≤ apps qui les citent`, async () => {
      const w = triageWorld(seed, n);
      const { mem, ctx } = ctxOf(w.tables);
      const out = (await run(triageToDo, ctx, {})) as { apps: string[] }[];
      sameAsBefore(`L3 graine ${seed}`, out);
      expect(out.some((o) => (o as unknown as { kind: string }).kind === "mention")).toBe(n < 100);
      expect(out.length).toBe(TRIAGE_BATCH);
      const cited = new Set(
        (w.tables.radarAppCandidates ?? [])
          .filter((c) => out.some((o) => (o as unknown as { id: string }).id === c._id))
          .flatMap((c) => c.fromApps as string[]),
      );
      expect(cited.size).toBeGreaterThan(0);
      expect(mem.readsOf("radarApps")).toBeLessThanOrEqual(cited.size);
    });
  }
});

// ─── L4 : le périmètre relu ne lit que les slugs « dehors » et les apps en pause ──

const DEHORS = Object.keys(APP_REVIEW).filter((s) => APP_REVIEW[s] === "dehors");

/**
 * Un monde où chaque app du périmètre prend un état au hasard (active, concurrente, remise en route à la main, en pause
 * pour un autre motif, doublon de slug, doublon fondu), semée au hasard dans la masse des autres apps (dont des pauses
 * « essai ») : l'ordre de création décide de l'ordre des écritures.
 */
function perimeterWorld(seed: number, slugs: readonly string[]) {
  const r = rng(seed);
  const w = world();
  const states: Record<string, unknown>[] = [
    {},
    {},
    {},
    {},
    { rivalOf: ["snytch"] },
    { scopeByHand: true },
    { status: "paused", pausedReason: "perimetre" },
    { status: "paused", pausedReason: "perimetre" },
    { status: "paused", pausedReason: "essai" },
    { status: "paused" },
  ];
  w.add("radarSettings", { key: "global", reviewV: REVIEW_VERSION, reviewAt: Object.keys(JUDGE_REVIEW).length, discoveryCursor: 0, curveAdmitted: 0, updatedAt: 0 });
  let k = 0;
  const one = (slug: string) => {
    const a = w.app(slug, [`${slug.replace(/[^a-z0-9]/g, "")}motif`], states[Math.floor(r() * states.length)]);
    if (r() < 0.3) w.add("radarTracked", { platform: "tiktok", handle: `${slug}_c${k++}`, appId: a._id, status: "active", matchedBy: "caption", fans: 10, videosSeen: 1, nextReadAt: NOW, readErrors: 0, addedAt: 0 });
    return a;
  };
  const at = new Map<number, string[]>();
  const place = (slug: string) => {
    const i = Math.floor(r() * BULK);
    at.set(i, [...(at.get(i) ?? []), slug]);
  };
  for (const s of slugs) {
    place(s);
    if (r() < 0.25) place(s);
  }
  for (let i = 0; i < BULK; i++) {
    for (const s of at.get(i) ?? []) one(s);
    // D'autres apps en pause « perimetre », relues « dedans » depuis, ou dans d'autres états.
    if (i % 97 === 0) one(`remise${i}`);
    w.app(`bulk${i}`, [`bulkmotif${i}`], i % 40 === 0 ? { status: "paused", pausedReason: "essai" } : {});
  }
  // Un doublon fondu au slug relu « dehors » : jamais touché.
  const live = w.tables.radarApps.find((a) => a.slug === slugs[0]);
  if (live) w.app(slugs[0], ["fondumotif"], { status: "paused", pausedReason: "perimetre", mergedInto: live._id });
  return w;
}

describe("L4 périmètre relu (applyJudgmentsNow) : les slugs « dehors » par leur index, les pauses « périmètre » par le statut", () => {
  for (const seed of [21, 22, 23]) {
    it(`graine ${seed} : mêmes pauses, mêmes reprises, mêmes écritures dans le même ordre qu'avant`, async () => {
      const w = perimeterWorld(seed, DEHORS);
      const outApps = w.tables.radarApps.filter((a) => DEHORS.includes(a.slug as string)).length;
      const pausedBefore = w.tables.radarApps.filter((a) => a.status === "paused").length;
      const { mem, ctx } = ctxOf(w.tables);
      const out = (await run(applyJudgmentsNow, ctx, {})) as { perimeter: { paused: string[]; resumed: string[] } };
      sameAsBefore(`L4 graine ${seed}`, { out, writes: mem.writes() });
      const touched = out.perimeter.paused.length + out.perimeter.resumed.length;
      expect(out.perimeter.paused.length).toBeGreaterThan(1);
      expect(out.perimeter.resumed.length).toBeGreaterThan(0);
      // Lus : les apps des slugs relus, celles en pause (le filtre sur le motif ne réduit pas la lecture), et la
      // relecture de chaque app touchée (son résumé de réseau). Le code d'avant lisait les 2 000 apps de plus.
      expect(mem.readsOf("radarApps")).toBeLessThanOrEqual(outApps + pausedBefore + touched);
      expect(mem.readsOf("radarApps")).toBeLessThan(200);
    });
  }

  for (const seed of [31, 32]) {
    it(`e2e, graine ${seed} : périmètre donné (dehors et dedans), limité à quelques slugs, même sortie qu'avant`, async () => {
      const r = rng(seed);
      const slugs = ["alpha", "beta", "gamma", "delta", "epsilon", "zeta"];
      const w = perimeterWorld(seed, slugs);
      const apps = slugs.map((slug) => ({ slug, scope: r() < 0.6 ? ("dehors" as const) : ("dedans" as const) }));
      const only = slugs.filter(() => r() < 0.7);
      const { mem, ctx } = ctxOf(w.tables);
      const out = await run(e2eApplyJudgments, ctx, { review: [], apps, slugs: [...only, "remise97", "remise0"] });
      sameAsBefore(`L4 e2e graine ${seed}`, { out, writes: mem.writes() });
    });
  }
});
