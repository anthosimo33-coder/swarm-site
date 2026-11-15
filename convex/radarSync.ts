"use node";

import v8 from "node:v8";
import vm from "node:vm";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import type { FunctionReference } from "convex/server";
import { internalAction, type ActionCtx } from "./_generated/server";
import { appStoreHit, appStoreLookup, copyImage } from "./imageCopy";
import { APP_STORE_ID, buildBoards, iconKey, siteOf, type GroupOut, type Part, type RApp, type Raw, type RFormat, type RSignal, type RTracked, type RVideo } from "./radarModels";

/** Version de la règle qui associe une app à sa fiche App Store (convex/imageCopy.ts, sameApp). */
const STORE_RULE = 6; // 6 : à plusieurs candidates, titre exact ou nette avance en avis ; 5 : fiche exacte par l'identifiant du Radar ; sinon recherche France puis États-Unis, refusée si le nom est ambigu ; icône gardée

/**
 * Synchronisation quotidienne du Radar (cron, convex/crons.ts), en étapes (voir « Synchro par groupes d'apps » plus bas) :
 *  1. `run` lit l'export de Jarvia (clé JARVIA_EXPORT_SECRET) : apps, comptes, formats, signaux, et les fiches App Store ;
 *  2. `runGroup`, un par groupe d'apps : ses vidéos, puis ses fiches d'app, de créateur et ses pages vidéo ;
 *  3. `runGlobal` : les pages communes, puis le ménage (pages et images que plus rien ne cite) et les files de vérification.
 * Les images manquantes sont copiées ensuite (copyMedia). Lancer à la main : `npx convex run radarSync:run` (dev) ;
 * suivre dans `syncRuns` (un passage n'a `finishedAt` qu'une fois l'étape globale finie) et `[mem]` des journaux.
 */

const DEFAULT_EXPORT_URL = "https://giddy-bass-969.eu-west-1.convex.site";
const TABLES = ["apps", "tracked", "trackedVideos", "formats", "signals"] as const;
/** Miniatures recopiées par passage, et temps qu'on leur donne : le reste attend le passage suivant
 * (l'URL source sert en attendant). Un passage tient sous les 10 min d'une action. */
const MEDIA_PER_RUN = 400;
// 14/11 : 1 min (au lieu de 5) — copier 546 miniatures en 4 min faisait passer la synchro de 387 à 502 Mo (mémoire de
// sharp non rendue), et elle mourait à l'écriture des pages (limite 512 Mo). Les miniatures non copiées le sont à la
// première demande de /cover (la lecture IA les demande toutes) ; les icônes passent d'abord.
const MEDIA_BUDGET_MS = 4 * 60_000; // copie dans sa propre action (copyMedia), après la synchro
/**
 * Une action Convex est coupée à 10 min, sans rien noter. Le passage s'arrête de lui-même à 9 min,
 * et la copie des images laisse 3 min aux écritures (quand les icônes changent, presque toutes les
 * pages sont réécrites : plus de 3 min à un lot à la fois, passage prod du 14/11 à 12 h 15).
 */
const RUN_LIMIT_MS = 9 * 60_000;
const WRITE_RESERVE_MS = 3 * 60_000;
/** Nouvelles vidéos (ou comptes) mises en file de vérification à chaque passage, au plus. */
const TODO_MAX = 15_000;
const WRITERS = 1; // 4 écrivains en parallèle : le 14/11 un lot ne revenait jamais (passage bloqué 3 min puis coupé) ; à 3 Mo/s, un seul suffit
/** Le déploiement Convex refuse plus de 4 Mio écrits par seconde (TooManyWrites, dev du 14/11) : écriture cadencée sous ce plafond. */
const WRITE_RATE = 3_000_000;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const PARALLEL = 4; // 20, 10, 6 : pics à 740, 568, 514 Mo de tas (pages TikTok lues à la fois) pour une limite de 512 Mo, passages coupés le 14/11
/** Une miniature introuvable depuis moins de 3 jours : la vidéo est retirée des listes (au-delà, on réessaie). */
const MISS_HIDE_MS = 3 * 86_400_000;
/** Taille d'un lot d'écriture : arguments bornés, et chaque document est relu (4 096 lectures au plus par mutation). */
const BATCH_BYTES = 1_500_000;
/**
 * Mémoire au-delà de laquelle on cesse d'écrire (limite des actions : 512 Mo). 14/11 : la synchro de prod est morte à
 * l'écriture des pages ; désormais elle s'arrête proprement et se relance pour écrire le reste.
 */
const MEM_STOP = (Number(process.env.SWARM_MEM_STOP_MB) || Infinity) * 1024 * 1024; // prod : 480 ; dev : sans (processus réutilisés, déjà gros au départ)
const BATCH_ITEMS = 400;

/** Mémoire de l'action à chaque étape (journal Convex) : la limite est de 512 Mo. */
/**
 * Ramasse-miettes forcé. Node se croit loin de sa limite (fixée d'après la mémoire de la machine), alors que l'action
 * meurt à 512 Mo : il laisse s'accumuler les textes jetables (52 000 pages mises en texte pour leur empreinte) — la
 * synchro de prod est morte ainsi le 14/11 à 22h30, 30 s après le calcul des pages.
 */
const gc: () => void = (() => {
  try { v8.setFlagsFromString("--expose-gc"); return vm.runInNewContext("gc") as () => void; } catch { return () => {}; }
})();

const MEMLOG = (label: string) => { const m = process.memoryUsage(); console.log(`[mem] ${label} rss=${Math.round(m.rss / 1e6)} heap=${Math.round(m.heapUsed / 1e6)} ext=${Math.round(m.external / 1e6)} buf=${Math.round(m.arrayBuffers / 1e6)}`); };
/**
 * Une ligne de l'export, réduite à ce que Swarm utilise (15/11 : 86 000 vidéos, 76 Mo de JSON, la synchro de prod mourait
 * à 512 Mo). Vidéos suivies : sans l'adresse signée de la miniature (23 % du poids ; la copie lit la page publique),
 * les 12 derniers relevés de vues (ceux de la page vidéo), identifiants de compte et d'app partagés au lieu d'être
 * dupliqués à chaque ligne. La ligne est RECONSTRUITE, champs toujours dans le même ordre : y retirer des champs
 * (`delete`) faisait passer chaque objet en mode dictionnaire, plus du double en mémoire (banc du 15/11).
 */
type Slim = { intern: (s: string) => string; now: number };
const internOf = (k: Slim, x: unknown) => (typeof x === "string" ? k.intern(x) : x);
function slimRow(table: string, row: Record<string, unknown>, k: Slim): unknown {
  if (table === "trackedVideos") {
    return {
      accountId: internOf(k, row.accountId), appId: internOf(k, row.appId), platform: row.platform, videoId: row.videoId,
      publishedAt: row.publishedAt, views: row.views, snapshots: Array.isArray(row.snapshots) ? row.snapshots.slice(-12) : [],
      caption: row.caption, hook: row.hook, musicTitle: row.musicTitle, coverUrl: null, region: row.region, cites: row.cites,
    };
  }
  return row;
}

async function fetchTable(base: string, secret: string, table: (typeof TABLES)[number], k: Slim, only?: { apps: string[]; keep: (r: Record<string, unknown>) => boolean }) {
  const rows: unknown[] = [];
  let cursor: string | null = null;
  const apps = only ? `&apps=${only.apps.map(encodeURIComponent).join(",")}` : "";
  for (let page = 0; page < 3000; page++) {
    const url = `${base}/swarm/export?table=${table}${apps}${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${secret}` }, signal: AbortSignal.timeout(90_000) });
    if (!res.ok) throw new Error(`export ${table} : HTTP ${res.status}`);
    const body = (await res.json()) as { rows: Record<string, unknown>[]; cursor: string; done: boolean };
    for (const r of body.rows) if (!only || only.keep(r)) rows.push(slimRow(table, r, k));
    if (body.done) return rows;
    cursor = body.cursor;
  }
  throw new Error(`export ${table} : trop de pages`);
}

/**
 * Les vidéos d'un groupe d'apps : par le filtre `apps` de l'export (Jarvia #532, 100 apps par demande, une page ne lit
 * qu'une app) ; un export qui ne connaît pas encore ce filtre rend toute la table, une seule fois, triée ici.
 */
async function fetchGroupVideos(base: string, secret: string, k: Slim, ids: string[], keep: (r: Record<string, unknown>) => boolean) {
  const rows: unknown[] = [];
  for (let i = 0; i < ids.length; i += 100) {
    const part = ids.slice(i, i + 100), want = new Set(part);
    let foreign = false;
    const got = await fetchTable(base, secret, "trackedVideos", k, { apps: part, keep: (r) => { if (!want.has(String(r.appId))) foreign = true; return keep(r); } });
    rows.push(...got);
    if (foreign) return rows; // filtre ignoré : la table entière est déjà lue (et triée)
  }
  return rows;
}

/** Empreinte et taille (une seule mise en texte : 52 000 pages à empreinter, 14/11 la mémoire manquait). */
function hashLen(data: unknown): { hash: string; bytes: number } {
  const { updatedAt: _ignored, ...rest } = (data ?? {}) as Record<string, unknown>;
  const s = JSON.stringify(rest);
  return { hash: fnv(s), bytes: s.length + 40 };
}

function fnv(s: string): string {
  let h1 = 0x811c9dc5, h2 = 0x01000193;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 16777619) >>> 0;
    h2 = Math.imul(h2 ^ c, 2246822519) >>> 0;
  }
  return h1.toString(16).padStart(8, "0") + h2.toString(16).padStart(8, "0"); // même format que hashOf (empreintes rangées)
}

/** Empreinte rapide (FNV-1a sur 2×32 bits) du contenu, sans la date de calcul. */
const hashOf = (data: unknown): string => hashLen(data).hash;

/**
 * Réparation (13/11) : efface les images rangées en HEIC, recopiées ensuite en JPEG/WebP par
 * la synchro (`radarSync:run`) ou à la première vue (/cover/<id>). Rend le nombre effacé.
 */
export const repairHeic = internalAction({
  args: {},
  handler: async (ctx): Promise<number> => {
    const keys: string[] = [];
    for (let cursor: string | null = null, done = false; !done; ) {
      const page: { keys: string[]; cursor: string; done: boolean } = await ctx.runQuery(internal.radarStore.heicPage, { cursor });
      keys.push(...page.keys);
      cursor = page.cursor;
      done = page.done;
    }
    for (let i = 0; i < keys.length; i += 200) await ctx.runMutation(internal.radarStore.dropMedia, { keys: keys.slice(i, i + 200) });
    return keys.length;
  },
});

/**
 * Copie des images demandées par la synchro (icônes d'abord, puis miniatures et photos de profil), dans sa propre action :
 * sharp garde sa mémoire, et la copie faite au milieu de la synchro la faisait dépasser 512 Mo (15/11).
 */
export const copyMedia = internalAction({
  args: { items: v.array(v.object({ key: v.string(), src: v.string() })) },
  handler: async (ctx, { items }): Promise<{ copied: number; failed: number }> => {
    const start = Date.now();
    const got: { key: string; storageId: Id<"_storage">; url: string }[] = [];
    const failed: string[] = [];
    let copied = 0, nfail = 0, next = 0;
    const retried = async (go: () => Promise<unknown>) => { for (let i = 0; i < 3; i++) { try { await go(); return; } catch { await sleep(500 * (i + 1)); } } };
    const flush = async () => {
      const its = got.splice(0), keys = failed.splice(0);
      if (its.length) await retried(() => ctx.runMutation(internal.radarStore.saveMedia, { items: its }));
      if (keys.length) await retried(() => ctx.runMutation(internal.radarStore.markMisses, { keys }));
    };
    const worker = async () => {
      while (next < items.length && Date.now() - start < MEDIA_BUDGET_MS) {
        const { key, src } = items[next++];
        const r = await copyImage(ctx, key, src);
        if (r) { got.push(r); copied++; } else if (key.startsWith("v:")) { failed.push(key); nfail++; }
        if (got.length + failed.length >= 100) await flush();
      }
    };
    await Promise.all(Array.from({ length: PARALLEL }, worker));
    await flush();
    console.log(`[copie] ${copied} images copiées, ${nfail} introuvables, ${items.length - next} laissées pour le passage suivant`);
    return { copied, failed: nfail };
  },
});

// ─── Synchro par groupes d'apps (15/11) ────────────────────────────────────────────────────────────────────────────
//
// Une action Convex est coupée à 512 Mo et à 10 min ; à 24 000 comptes et 220 000 vidéos (prévision du Radar, 15/11)
// aucune n'y tient (banc : 209 Mo de tas à ×1, 577 à ×3 ; l'export seul prend 3 min 15 à ×1). Le passage enchaîne :
//  1. `run` (préparation) : apps, comptes, formats, signaux et fiches App Store, rangés en fichiers (stockage Convex) ;
//     les apps canoniques réparties en groupes d'au plus GROUP_ACCOUNTS comptes ;
//  2. `runGroup` (un par groupe) : les vidéos du groupe seulement (filtre `apps` de l'export), ses fiches d'app, de
//     créateur et ses pages vidéo écrites, et ce que les pages communes demandent rangé dans un fichier ;
//  3. `runGlobal` : listes, créateurs, formats, alertes, accueil, recherche ; puis, seulement là, les pages et images
//     que plus rien ne cite sont effacées, et les files de vérification remplies.
// Le banc (scripts/sync-bench/parts.mjs) vérifie que ce découpage produit exactement les pages du calcul d'un coup.

/** Comptes par groupe : ≈ 27 000 vidéos à 9 vidéos par compte (banc du 15/11). */
const GROUP_ACCOUNTS = Number(process.env.SWARM_GROUP_ACCOUNTS) || 3_000;
/** Reprises d'une étape coupée (temps, mémoire) avant d'abandonner le passage. */
const STEP_RETRIES = 3;
/** Une valeur rangée sans son adresse : l'étape d'un groupe sait qu'une image existe, l'adresse ne sert qu'à son groupe. */
const ELSEWHERE = "·";

type StageIds = { apps: Id<"_storage">[]; tracked: Id<"_storage">[]; formats: Id<"_storage">[]; signals: Id<"_storage">[]; stores: Id<"_storage">[] };
type Stage = {
  now: number;
  globals: StageIds;
  /** Ids canoniques des apps de chaque groupe, et ids à demander à l'export (canoniques et fondues). */
  groups: string[][];
  fetch: string[][];
  outs: (Id<"_storage"> | null)[];
  /** Clés produites, images citées et à copier de chaque groupe : lues seulement pour le ménage final. */
  tails?: (Id<"_storage"> | null)[];
  writtenBy?: number[];
  retries?: Record<string, number>;
  sizes: Record<string, number>;
};
type Stores = Record<string, { url: string | null; v: number; art: string | null }>;
/** Ce qu'une étape de groupe range pour l'étape globale (en plus de `GroupOut`). */
type GroupFile = { out: GroupOut; markets: string[]; written: number; videos: number };
type GroupTail = { used: string[]; need: [string, string][]; keys: string[] };

/** Des lignes rangées en fichiers JSON de `per` lignes (lus un à un : jamais tout le texte à la fois). */
async function stageWrite(ctx: ActionCtx, rows: unknown[], per = 4000): Promise<Id<"_storage">[]> {
  const ids: Id<"_storage">[] = [];
  for (let i = 0; i === 0 || i < rows.length; i += per) {
    ids.push(await ctx.storage.store(new Blob([JSON.stringify(rows.slice(i, i + per))], { type: "application/json" })));
  }
  return ids;
}
async function stageRead<T>(ctx: ActionCtx, ids: Id<"_storage">[], keep?: (r: T) => boolean): Promise<T[]> {
  const out: T[] = [];
  for (const id of ids) {
    const b = await ctx.storage.get(id);
    if (!b) throw new Error("étape : fichier rangé introuvable");
    for (const r of JSON.parse(await b.text()) as T[]) if (!keep || keep(r)) out.push(r);
  }
  return out;
}
async function stageDrop(ctx: ActionCtx, ids: Id<"_storage">[]) {
  for (const id of ids) { try { await ctx.storage.delete(id); } catch { /* déjà effacé */ } }
}
const stageFiles = (st: Stage) => [...Object.values(st.globals).flat(), ...[...st.outs, ...(st.tails ?? [])].filter((x): x is Id<"_storage"> => !!x)];

/** Toutes les pages d'une requête paginée de radarStore. */
async function readPages<T>(ctx: ActionCtx, query: FunctionReference<"query", "internal", { cursor: string | null }, { items: T[]; cursor: string; done: boolean }>, each: (x: T) => void) {
  for (let cursor: string | null = null, done = false; !done; ) {
    const page: { items: T[]; cursor: string; done: boolean } = await ctx.runQuery(query, { cursor });
    for (const x of page.items) each(x);
    cursor = page.cursor;
    done = page.done;
  }
}

/** Ce que Swarm sait déjà des vidéos et des comptes (tables Swarm), filtré à ce qui sert à l'étape. */
async function loadStore(ctx: ActionCtx, f: { video?: (id: string) => boolean; handle?: (h: string) => boolean; account?: (id: string) => boolean; media?: (k: string) => boolean }) {
  const all = () => true;
  const fv = f.video ?? all, fh = f.handle ?? all, fa = f.account ?? all, fm = f.media ?? all;
  const media: Record<string, string> = {};
  await readPages<[string, string]>(ctx, internal.radarStore.mediaPage, ([k, url]) => { media[k] = fm(k) ? url : ELSEWHERE; });
  const regions = new Map<string, string>();
  await readPages<[string, string]>(ctx, internal.radarStore.regionPage, ([h, c]) => regions.set(h, c));
  const slides = new Map<string, number>(), slideKnown = new Set<string>();
  await readPages<[string, number]>(ctx, internal.radarStore.slidePage, ([id, n]) => { if (!fv(id)) return; slideKnown.add(id); if (n >= 0) slides.set(id, n); });
  const ai = new Map<string, { type: string; text: string }>(), aiKnown = new Set<string>();
  await readPages<[string, string, string, number]>(ctx, internal.radarStore.videoAiPage, ([id, type, text, ok]) => { if (!fv(id)) return; aiKnown.add(id); if (ok) ai.set(id, { type, text }); });
  const genders = new Map<string, string>(), genderKnown = new Set<string>();
  await readPages<[string, string, number]>(ctx, internal.radarStore.genderPage, ([h, g, ok]) => { if (!fh(h)) return; genderKnown.add(h); if (ok) genders.set(h, g); });
  const misses = new Map<string, number>();
  await readPages<[string, number]>(ctx, internal.radarStore.missPage, ([k, at]) => misses.set(k, at));
  const langs = new Map<string, string | null>();
  await readPages<[string, string]>(ctx, internal.radarStore.langPage, ([id, l]) => { if (fa(id)) langs.set(id, l || null); });
  return { media, regions, slides, slideKnown, ai, aiKnown, genders, genderKnown, misses, langs };
}
type Store = Awaited<ReturnType<typeof loadStore>>;

function boardOpts(now: number, st: Store, stores: Stores, part?: Part) {
  const site = process.env.CONVEX_SITE_URL ?? null;
  return {
    missing: (k: string) => (st.misses.get(k) ?? 0) > now - MISS_HIDE_MS,
    coverUrl: (id: string) => (site && /^(\d{6,25}|ig:[A-Za-z0-9_-]{5,40})$/.test(id) ? `${site}/cover/${id}` : null),
    artOf: (slug: string) => stores[slug]?.art ?? null,
    regionOf: (h: string) => st.regions.get(h) ?? null,
    slidesOf: (id: string) => st.slides.get(id),
    aiOf: (id: string) => st.ai.get(id),
    genderOf: (h: string) => st.genders.get(h),
    langOf: (id: string) => (st.langs.has(id) ? st.langs.get(id) ?? null : undefined),
    part,
  };
}

const canonicalOf = (apps: RApp[]) => {
  const byId = new Map(apps.map((a) => [a.id, a]));
  return (id: string | null | undefined) => {
    let a = id ? byId.get(id) ?? null : null;
    for (let i = 0; a && a.mergedInto && i < 5; i++) a = byId.get(a.mergedInto) ?? a;
    return a?.id ?? "";
  };
};

/**
 * Écriture des pages, en flux : produites une à une, comparées par lots de 400 à l'empreinte rangée (une requête
 * par lot, plus de lecture de toutes les empreintes), seules celles qui changent partent, cadencées à WRITE_RATE.
 * S'arrête proprement à RUN_LIMIT_MS ou au-delà de MEM_STOP (l'étape reprend : ce qui est écrit n'est pas renvoyé).
 */
async function writePages(ctx: ActionCtx, boards: Map<string, unknown>, lazy: Map<string, () => unknown>, now: number, runStart: number) {
  const keys: string[] = [];
  function* pages(): Generator<[string, unknown]> {
    for (const [k, d] of boards) { boards.delete(k); keys.push(k); yield [k, d]; }
    for (const [k, f] of lazy) { lazy.delete(k); keys.push(k); yield [k, f()]; }
  }
  let written = 0, sent = 0, seen = 0;
  let stopped: "" | "mémoire pleine" | "temps écoulé" = "";
  const writeStart = Date.now();
  const send = async (items: { key: string; hash: string; data: unknown }[], bytes: number) => {
    sent += bytes;
    const wait = writeStart + ((sent - bytes) / WRITE_RATE) * 1000 - Date.now();
    if (wait > 0) await sleep(wait);
    for (let attempt = 0; ; attempt++) {
      try { written += await ctx.runMutation(internal.radarStore.saveBoards, { items, now }); return; } catch (e) {
        if (attempt >= 4 || !/TooManyWrites/.test(String(e))) throw e;
        await sleep(2_000 * (attempt + 1));
      }
    }
  };
  let pending: { key: string; hash: string; data: unknown; bytes: number }[] = [];
  let pendingBytes = 0;
  const flush = async () => {
    if (!pending.length) return;
    const items = pending;
    pending = []; pendingBytes = 0;
    const old: (string | null)[] = await ctx.runQuery(internal.radarStore.boardHashes, { keys: items.map((x) => x.key) });
    let batch: { key: string; hash: string; data: unknown }[] = [], size = 0;
    for (let j = 0; j < items.length; j++) {
      const x = items[j];
      if (old[j] === x.hash) continue;
      if (batch.length && (size + x.bytes > BATCH_BYTES || batch.length >= BATCH_ITEMS)) { await send(batch, size); batch = []; size = 0; }
      batch.push({ key: x.key, hash: x.hash, data: x.data });
      size += x.bytes;
    }
    if (batch.length) await send(batch, size);
  };
  for (const [key, data] of pages()) {
    if (++seen % 1000 === 0) gc();
    if (Date.now() - runStart > RUN_LIMIT_MS) { stopped = "temps écoulé"; break; }
    if (process.memoryUsage().rss > MEM_STOP) { gc(); if (process.memoryUsage().rss > MEM_STOP) { stopped = "mémoire pleine"; break; } }
    const { hash, bytes } = hashLen(data);
    pending.push({ key, hash, data, bytes });
    pendingBytes += bytes;
    if (pending.length >= 400 || pendingBytes >= 3 * BATCH_BYTES) await flush();
  }
  if (!stopped) await flush();
  return { written, keys, stopped, left: stopped ? pending.length + boards.size + lazy.size : 0 };
}

/** Échec d'une étape : le passage est noté raté et ses fichiers effacés (le suivant repart de zéro). */
async function failRun(ctx: ActionCtx, id: Id<"syncRuns">, e: unknown, st: Stage | null) {
  const error = e instanceof Error ? e.message : String(e);
  await ctx.runMutation(internal.radarStore.endRun, { id, ok: false, error });
  if (st) { await stageDrop(ctx, stageFiles(st)); await ctx.runMutation(internal.radarStore.stageCleaned, { id }); }
}

/** Étape coupée (temps, mémoire) : reprise dans 1 min, tant qu'elle avance ; sinon le passage est abandonné. */
async function retryStep(ctx: ActionCtx, id: Id<"syncRuns">, step: string, w: { written: number; stopped: string; left: number }, again: () => Promise<unknown>) {
  const n: number = await ctx.runMutation(internal.radarStore.stepRetry, { id, step });
  const msg = `${step} : ${w.stopped}, ${w.left} pages non écrites (${w.written} écrites)`;
  if (n > STEP_RETRIES || w.written === 0) throw new Error(`${msg}, abandon`);
  console.log(`[étape] ${msg}, reprise dans 1 min (${n}/${STEP_RETRIES})`);
  await again();
}

export const run = internalAction({
  args: {},
  handler: async (ctx): Promise<Record<string, number>> => {
    const runId = await ctx.runMutation(internal.radarStore.startRun, {});
    if (runId === null) return { skipped: 1 }; // un passage tourne déjà
    let st: Stage | null = null;
    try {
      const base = process.env.JARVIA_EXPORT_URL ?? DEFAULT_EXPORT_URL;
      const secret = process.env.JARVIA_EXPORT_SECRET;
      if (!secret) throw new Error("JARVIA_EXPORT_SECRET absente");
      // Les fichiers des passages d'avant (finis, ratés, coupés) : effacés.
      for (const r of await ctx.runQuery(internal.radarStore.staleStages, { keep: runId })) {
        await stageDrop(ctx, r.ids as Id<"_storage">[]);
        await ctx.runMutation(internal.radarStore.stageCleaned, { id: r.id });
      }
      gc(); // un processus réutilisé garde les restes du passage d'avant (15/11 : 509 Mo au départ du passage de 17h15)
      MEMLOG('départ');
      const now = Date.now();
      const pool = new Map<string, string>();
      const slim: Slim = { intern: (x) => { const y = pool.get(x); if (y) return y; pool.set(x, x); return x; }, now };
      const raw = {} as Omit<Raw, "trackedVideos">;
      for (const t of ["apps", "tracked", "formats", "signals"] as const) { (raw as Record<string, unknown>)[t] = await fetchTable(base, secret, t, slim); gc(); MEMLOG('export ' + t); }
      pool.clear();
      // Essai sur le dev seulement : des comptes marqués « placement payé » à la main (variable SWARM_TEST_PLACEMENT,
      // pseudos séparés par des virgules), tant que l'export du Radar n'envoie pas encore `placement`.
      const testPaid = (process.env.SWARM_TEST_PLACEMENT ?? "").split(",").map((h) => h.trim().replace(/^@/, "")).filter(Boolean);
      if (testPaid.length) for (const t of raw.tracked) if (testPaid.includes(t.handle)) t.placement = true;

      // Fiche App Store des apps pas encore cherchées avec la règle actuelle (titre qui commence par le
      // nom de l'app) ; une fiche qui change efface l'icône rangée, recopiée depuis la bonne fiche.
      // L'App Store limite à ~20 recherches par minute : une toutes les 3,2 s, 3 min au plus.
      const stores: Stores = await ctx.runQuery(internal.radarStore.appStoreMap, {});
      const found: { slug: string; url: string | null; v: number; art: string | null }[] = [];
      let storeErrors = 0;
      const iconsToDrop: string[] = [];
      const storeStart = Date.now();
      // Fiche vérifiée à la main (site ou identifiant) que la fiche rangée ne suit pas encore : revue d'abord.
      const pinnedOff = (slug: string) => {
        const s = stores[slug];
        if (siteOf(slug)) return !s || s.url !== null;
        return !!APP_STORE_ID[slug] && !(s?.url ?? "").includes(`/id${APP_STORE_ID[slug]}`);
      };
      const storeQueue = [...raw.apps].sort((p, q) => Number(pinnedOff(q.slug)) - Number(pinnedOff(p.slug)));
      for (const a of storeQueue) {
        if (a.mergedInto || (stores[a.slug]?.v === STORE_RULE && !pinnedOff(a.slug))) continue;
        if (Date.now() - storeStart > 180_000) break; // 3 min : le reste de l'étape doit tenir dans les 10 min d'une action
        const id = APP_STORE_ID[a.slug] ?? (a.store?.storeId ? String(a.store.storeId) : null);
        if (siteOf(a.slug)) { // app web : pas de fiche App Store, son icône vient de son site
          if (stores[a.slug]?.url) iconsToDrop.push(iconKey(a.slug));
          stores[a.slug] = { url: null, v: STORE_RULE, art: null };
          found.push({ slug: a.slug, url: null, v: STORE_RULE, art: null });
          continue;
        }
        let hit: Awaited<ReturnType<typeof appStoreHit>>;
        try {
          // Fiche épinglée : son identifiant seul (jamais la recherche par nom, qui trouverait une homonyme).
          hit = APP_STORE_ID[a.slug] ? await appStoreLookup(APP_STORE_ID[a.slug]) : (id ? await appStoreLookup(id) : null) ?? (await appStoreHit(a.name));
        } catch {
          // L'App Store refuse ou ne répond pas : on garde la fiche d'avant, l'app sera revue au prochain passage.
          if (++storeErrors >= 5) break;
          continue;
        }
        const url = hit?.trackViewUrl ?? null;
        const art = hit?.artworkUrl512 ?? hit?.artworkUrl100 ?? null;
        if (stores[a.slug] && stores[a.slug].url !== url) iconsToDrop.push(iconKey(a.slug));
        stores[a.slug] = { url, v: STORE_RULE, art };
        found.push({ slug: a.slug, url, v: STORE_RULE, art });
      }
      if (found.length) await ctx.runMutation(internal.radarStore.saveAppStore, { items: found });
      if (iconsToDrop.length) await ctx.runMutation(internal.radarStore.dropMedia, { keys: iconsToDrop });

      // Les groupes : apps canoniques, les plus fournies d'abord, GROUP_ACCOUNTS comptes au plus par groupe (une app
      // plus grosse fait son groupe à elle seule). Une app sans compte exporté n'a pas de vidéo : rien à lui demander.
      const canon = canonicalOf(raw.apps);
      const weight = new Map<string, number>();
      for (const t of raw.tracked) { const c = canon(t.appId); weight.set(c, (weight.get(c) ?? 0) + 1); }
      const groups: string[][] = [];
      let cur: string[] = [], n = 0;
      for (const c of [...new Set(raw.apps.map((a) => canon(a.id)))].sort((p, q) => (weight.get(q) ?? 0) - (weight.get(p) ?? 0) || (p < q ? -1 : 1))) {
        const w = weight.get(c) ?? 0;
        if (cur.length && n + w > GROUP_ACCOUNTS) { groups.push(cur); cur = []; n = 0; }
        cur.push(c);
        n += w;
      }
      if (cur.length) groups.push(cur);
      const fetchIds = groups.map((g) => { const set = new Set(g); return raw.apps.filter((a) => set.has(canon(a.id)) && (weight.get(canon(a.id)) ?? 0) > 0).map((a) => a.id); });

      const sizes = { apps: raw.apps.length, tracked: raw.tracked.length, formats: raw.formats.length, signals: raw.signals.length, groups: groups.length };
      st = {
        now, groups, fetch: fetchIds, outs: groups.map(() => null), sizes,
        globals: {
          apps: await stageWrite(ctx, raw.apps), tracked: await stageWrite(ctx, raw.tracked), formats: await stageWrite(ctx, raw.formats, 1000),
          signals: await stageWrite(ctx, raw.signals, 2000), stores: await stageWrite(ctx, [stores]),
        },
      };
      await ctx.runMutation(internal.radarStore.setStage, { id: runId, stage: st });
      MEMLOG(`préparation : ${groups.length} groupes`);
      await ctx.scheduler.runAfter(0, internal.radarSync.runGroup, { id: runId, i: 0 });
      return sizes;
    } catch (e) {
      await failRun(ctx, runId, e, st);
      throw e;
    }
  },
});

/** Ce dont une étape a besoin des données rangées par la préparation. */
async function loadGlobals(ctx: ActionCtx, st: Stage, keepSignal?: (s: RSignal) => boolean, read?: { apps: RApp[]; formats: RFormat[] }) {
  const apps = read?.apps ?? (await stageRead<RApp>(ctx, st.globals.apps));
  const tracked = await stageRead<RTracked>(ctx, st.globals.tracked);
  const formats = read?.formats ?? (await stageRead<RFormat>(ctx, st.globals.formats));
  const signals = await stageRead<RSignal>(ctx, st.globals.signals, keepSignal);
  const [stores] = await stageRead<Stores>(ctx, st.globals.stores);
  return { apps, tracked, formats, signals, stores };
}

export const runGroup = internalAction({
  args: { id: v.id("syncRuns"), i: v.number() },
  handler: async (ctx, { id, i }): Promise<void> => {
    const runStart = Date.now();
    const st: Stage | null = await ctx.runQuery(internal.radarStore.getStage, { id });
    if (!st) return; // passage fini ou abandonné entre-temps
    await ctx.runMutation(internal.radarStore.beat, { id });
    try {
      gc();
      MEMLOG(`groupe ${i + 1}/${st.groups.length} départ`);
      const base = process.env.JARVIA_EXPORT_URL ?? DEFAULT_EXPORT_URL;
      const secret = process.env.JARVIA_EXPORT_SECRET ?? "";
      const set = new Set(st.groups[i]);
      // Les formats d'abord : leurs reprises et les signaux récents servent à toutes les étapes (choix des formats montrés,
      // alertes) ; les autres signaux, seulement ceux des vidéos du groupe.
      const formats = await stageRead<RFormat>(ctx, st.globals.formats);
      const memberIds = new Set(formats.flatMap((f) => f.members.map((m) => m.videoId)));
      const apps = await stageRead<RApp>(ctx, st.globals.apps);
      const canon = canonicalOf(apps);
      const pool = new Map<string, string>();
      const slim: Slim = { intern: (x) => { const y = pool.get(x); if (y) return y; pool.set(x, x); return x; }, now: st.now };
      const trackedVideos = (await fetchGroupVideos(base, secret, slim, st.fetch[i], (r) => set.has(canon(r.appId as string)))) as RVideo[];
      pool.clear();
      MEMLOG(`groupe ${i + 1} : ${trackedVideos.length} vidéos`);
      const own = new Set(trackedVideos.map((v) => v.videoId));
      const g = await loadGlobals(ctx, st, (s) => own.has(s.videoId) || memberIds.has(s.videoId) || (!!s.multiplier && st.now - s.publishedAt <= 7 * 86_400_000), { apps, formats });
      const ownAcc = new Set(g.tracked.filter((t) => set.has(canon(t.appId))).map((t) => t.id));
      const ownHandles = new Set(g.tracked.filter((t) => ownAcc.has(t.id)).map((t) => t.handle));
      const store = await loadStore(ctx, {
        video: (vid) => own.has(vid), handle: (h) => ownHandles.has(h), account: (a) => ownAcc.has(a),
        media: (k) => k.startsWith("icon:") || (k.startsWith("v:") && own.has(k.slice(2))) || (k.startsWith("a:") && ownHandles.has(k.slice(2))),
      });
      const raw: Raw = { apps, tracked: g.tracked, trackedVideos, formats, signals: g.signals };
      gc();
      MEMLOG(`groupe ${i + 1} avant calcul`);
      const res = buildBoards(raw, st.now, (k) => store.media[k] ?? null, (slug) => g.stores[slug]?.url ?? null, boardOpts(st.now, store, g.stores, { kind: "group", apps: set }));
      // Comptes sans pays, comptes à genrer, langues : seulement ceux du groupe (leurs vidéos y sont).
      for (let j = 0; j < res.regionTodo.length; j += 300) await ctx.runMutation(internal.radarStore.saveRegionTodo, { items: res.regionTodo.slice(j, j + 300) });
      gc();
      MEMLOG(`groupe ${i + 1} après calcul`);
      const w = await writePages(ctx, res.boards as Map<string, unknown>, res.lazy, st.now, runStart);
      MEMLOG(`groupe ${i + 1} écriture ${w.written}`);
      if (w.stopped) {
        await retryStep(ctx, id, `groupe ${i + 1}`, w, () => ctx.scheduler.runAfter(60_000, internal.radarSync.runGroup, { id, i }));
        return;
      }
      // Vidéos à vérifier (carrousel, lecture IA) et comptes à genrer : les nouvelles seulement, une fois les pages écrites.
      const later = res.laterTodos();
      const newSlides = later.slideTodo.filter((x) => !store.slideKnown.has(x)).slice(0, TODO_MAX);
      const newAi = later.videoAiTodo.filter((x) => !store.aiKnown.has(x)).slice(0, TODO_MAX);
      const newGender = res.genderTodo.filter((x) => !store.genderKnown.has(x.handle)).slice(0, TODO_MAX);
      for (let j = 0; j < newSlides.length; j += 500) await ctx.runMutation(internal.radarStore.saveSlideTodo, { ids: newSlides.slice(j, j + 500) });
      for (let j = 0; j < newAi.length; j += 500) await ctx.runMutation(internal.radarStore.saveVideoAiTodo, { ids: newAi.slice(j, j + 500) });
      for (let j = 0; j < newGender.length; j += 300) await ctx.runMutation(internal.radarStore.saveGenderTodo, { items: newGender.slice(j, j + 300) });
      // Langue des comptes jamais calculés : par lots de 200, chacun dans sa propre action (le détecteur hors synchro).
      for (let j = 0; j < Math.min(res.langTodo.length, TODO_MAX); j += 200) await ctx.scheduler.runAfter(60_000 + j * 50, internal.radarLang.detect, { items: res.langTodo.slice(j, j + 200) });
      const file: GroupFile = { out: res.out!, markets: res.markets, written: w.written, videos: trackedVideos.length };
      // Images : celles de ses vidéos et de ses comptes seulement (icônes, photos de profil, reprises et alertes sont
      // aussi vues par l'étape globale, qui les compte).
      const ownSlugs = new Set(apps.filter((a) => set.has(canon(a.id))).map((a) => a.slug));
      const ownKey = (k: string) => (k.startsWith("v:") && own.has(k.slice(2))) || (k.startsWith("a:") && ownHandles.has(k.slice(2))) || (k.startsWith("icon:") && ownSlugs.has(k.slice(5)));
      const tail: GroupTail = { used: [...res.used].filter(ownKey), need: [...res.need].filter(([k]) => ownKey(k) && !k.startsWith("icon:")), keys: w.keys };
      const outId = await ctx.storage.store(new Blob([JSON.stringify(file)], { type: "application/json" }));
      const tailId = await ctx.storage.store(new Blob([JSON.stringify(tail)], { type: "application/json" }));
      await ctx.runMutation(internal.radarStore.groupDone, { id, i, out: outId, tail: tailId, written: w.written });
      if (i + 1 < st.groups.length) await ctx.scheduler.runAfter(0, internal.radarSync.runGroup, { id, i: i + 1 });
      else await ctx.scheduler.runAfter(0, internal.radarSync.runGlobal, { id });
    } catch (e) {
      await failRun(ctx, id, e, st);
      throw e;
    }
  },
});

export const runGlobal = internalAction({
  args: { id: v.id("syncRuns") },
  handler: async (ctx, { id }): Promise<void> => {
    const runStart = Date.now();
    const st: Stage | null = await ctx.runQuery(internal.radarStore.getStage, { id });
    if (!st) return;
    await ctx.runMutation(internal.radarStore.beat, { id });
    try {
      gc();
      MEMLOG('global départ');
      // Signaux : ceux des alertes possibles et des reprises seulement (les autres n'ont de page que dans leur groupe).
      const formats = await stageRead<RFormat>(ctx, st.globals.formats);
      const memberIds = new Set(formats.flatMap((f) => f.members.map((m) => m.videoId)));
      const g = await loadGlobals(ctx, st, (s) => memberIds.has(s.videoId) || (!!s.multiplier && st.now - s.publishedAt <= 7 * 86_400_000), { apps: await stageRead<RApp>(ctx, st.globals.apps), formats });
      const files: GroupFile[] = [];
      for (const outId of st.outs) {
        const b = outId ? await ctx.storage.get(outId) : null;
        if (!b) throw new Error("étape globale : un groupe n'a pas rangé son fichier");
        files.push(JSON.parse(await b.text()) as GroupFile);
      }
      // Les seules vidéos de cette étape : reprises et signaux que personne ne suit (leur carrousel, leur lecture IA).
      const ids = new Set([...memberIds, ...g.signals.map((s) => s.videoId)]);
      const store = await loadStore(ctx, { video: (x) => ids.has(x), handle: () => false, account: () => false, media: (k) => k.startsWith("icon:") || (k.startsWith("v:") && ids.has(k.slice(2))) });
      const raw: Raw = { apps: g.apps, tracked: g.tracked, trackedVideos: [], formats: g.formats, signals: g.signals };
      gc();
      MEMLOG('global avant calcul');
      let res: ReturnType<typeof buildBoards> | null = buildBoards(raw, st.now, (k) => store.media[k] ?? null, (slug) => g.stores[slug]?.url ?? null, boardOpts(st.now, store, g.stores, { kind: "global", outs: files.map((f) => f.out) }));
      for (const f of files) f.out = null as never; // libéré : seul le calcul s'en servait
      gc();
      MEMLOG('global après calcul');
      const w = await writePages(ctx, res.boards as Map<string, unknown>, res.lazy, st.now, runStart);
      MEMLOG(`global écriture ${w.written}`);
      const later = res.laterTodos(), markets = res.markets, resUsed = res.used, resNeed = res.need;
      res = null; // le calcul n'est plus utile : libéré avant le ménage
      gc();
      if (w.stopped) {
        await retryStep(ctx, id, "global", w, () => ctx.scheduler.runAfter(60_000, internal.radarSync.runGlobal, { id }));
        return;
      }

      // Les images qu'aucune page ne cite plus (vidéo sortie des listes) : effacées. Garde-fou : jamais plus d'un tiers
      // d'un coup (un calcul cassé ne vide pas les miniatures).
      // Ce que chaque groupe a produit, cité et demandé : lu fichier par fichier, une fois les pages écrites.
      // Images citées : seulement celles qui sont rangées (le reste n'a rien à effacer) ; à copier : celles de l'étape
      // globale, puis celles des groupes (leurs vidéos, leurs comptes : jamais deux groupes les mêmes).
      const produced = new Set(w.keys), usedStored = new Set([...resUsed].filter((k) => k in store.media));
      const globalNeed = new Set(resNeed.keys());
      let needCount = globalNeed.size;
      const icons: [string, string][] = [], others: [string, string][] = [];
      const wantCopy = (k: string, src: string) => { if (k.startsWith("icon:")) icons.push([k, src]); else if (others.length < MEDIA_PER_RUN) others.push([k, src]); };
      for (const [k, src] of resNeed) wantCopy(k, src);
      for (const tailId of st.tails ?? []) {
        const b = tailId ? await ctx.storage.get(tailId) : null;
        if (!b) throw new Error("étape globale : un groupe n'a pas rangé ses listes");
        const t = JSON.parse(await b.text()) as GroupTail;
        for (const k of t.keys) produced.add(k);
        for (const k of t.used) if (k in store.media) usedStored.add(k);
        for (const [k, src] of t.need) if (!globalNeed.has(k)) { needCount++; wantCopy(k, src); }
      }
      gc();
      MEMLOG(`global listes des groupes : ${produced.size} pages, ${usedStored.size} images citées, ${needCount} à copier`);
      const mediaKeys = Object.keys(store.media);
      const stale = mediaKeys.filter((k) => !usedStored.has(k));
      const staleOk = stale.length <= mediaKeys.length / 3;
      if (staleOk) for (let j = 0; j < stale.length; j += 200) await ctx.runMutation(internal.radarStore.dropMedia, { keys: stale.slice(j, j + 200) });
      // Les pages que ce passage n'a plus produites : effacées (leur fiche mène à « introuvable »). Même garde-fou (le
      // 15/11, une liste mal tenue a effacé 60 000 pages du dev).
      const existing: string[] = [];
      for (let cursor: string | null = null, done = false; !done; ) {
        const page: { keys: string[]; hashes: string[]; cursor: string; done: boolean } = await ctx.runQuery(internal.radarStore.boardKeys, { cursor });
        existing.push(...page.keys);
        cursor = page.cursor;
        done = page.done;
      }
      MEMLOG(`global pages rangées : ${existing.length}`);
      const gone = existing.filter((k) => !produced.has(k));
      const goneOk = gone.length <= existing.length / 3;
      if (goneOk) for (let j = 0; j < gone.length; j += 200) await ctx.runMutation(internal.radarStore.dropBoards, { keys: gone.slice(j, j + 200) });
      // Les images à copier : icônes d'abord, MEDIA_PER_RUN au plus (le reste à la première vue, par /cover).
      const copyTodo = [...icons, ...others].slice(0, MEDIA_PER_RUN);
      const newSlides = later.slideTodo.filter((x) => !store.slideKnown.has(x)).slice(0, TODO_MAX);
      const newAi = later.videoAiTodo.filter((x) => !store.aiKnown.has(x)).slice(0, TODO_MAX);
      // Pays retenus : chaque groupe ne les connaît qu'à peu près (vidéos des autres groupes absentes) ; un écart ici
      // veut dire qu'une liste par pays a pu manquer des lignes ce passage (noté, jamais vu au banc).
      const exact = [...new Set(markets)].sort().join(",");
      const counts = {
        ...st.sizes, trackedVideos: files.reduce((n, f) => n + f.videos, 0),
        boards: produced.size, written: w.written + files.reduce((n, f) => n + f.written, 0), writtenGlobal: w.written,
        mediaToCopy: copyTodo.length, mediaMissing: needCount, mediaDropped: staleOk ? stale.length : 0, boardsDropped: goneOk ? gone.length : 0,
        ...(staleOk ? {} : { mediaDropRefused: stale.length }), ...(goneOk ? {} : { boardsDropRefused: gone.length }),
        marketsMismatch: files.filter((f) => [...new Set(f.markets)].sort().join(",") !== exact).length,
        minutes: Math.round((Date.now() - (st.now)) / 6_000) / 10,
      };
      await ctx.runMutation(internal.radarStore.endRun, { id, ok: true, counts });
      await stageDrop(ctx, stageFiles(st));
      await ctx.runMutation(internal.radarStore.stageCleaned, { id });
      for (let j = 0; j < newSlides.length; j += 500) await ctx.runMutation(internal.radarStore.saveSlideTodo, { ids: newSlides.slice(j, j + 500) });
      for (let j = 0; j < newAi.length; j += 500) await ctx.runMutation(internal.radarStore.saveVideoAiTodo, { ids: newAi.slice(j, j + 500) });
      await ctx.scheduler.runAfter(0, internal.radarRegions.fill, {});
      if (copyTodo.length) await ctx.scheduler.runAfter(0, internal.radarSync.copyMedia, { items: copyTodo.map(([key, src]) => ({ key, src })) });
      await ctx.scheduler.runAfter(0, internal.radarSlides.fill, {});
      await ctx.scheduler.runAfter(0, internal.radarAi.fillVideos, {});
      await ctx.scheduler.runAfter(0, internal.radarAi.fillGender, {});
    } catch (e) {
      await failRun(ctx, id, e, st);
      throw e;
    }
  },
});
