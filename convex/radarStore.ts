import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { internalMutation, internalQuery, type MutationCtx, type QueryCtx } from "./_generated/server";

/**
 * Les images déjà recopiées, page par page : [clé, URL servie par Swarm].
 * (Une valeur Convex a au plus 1 024 champs et 8 192 éléments : jamais tout d'un coup.)
 */
export const mediaPage = internalQuery({
  args: { cursor: v.union(v.string(), v.null()) },
  handler: async (ctx, { cursor }) => {
    const r = await ctx.db.query("media").paginate({ cursor, numItems: 4000 });
    return { items: r.page.map((m) => [m.key, m.url] as [string, string]), cursor: r.continueCursor, done: r.isDone };
  },
});

/**
 * La liste des vidéos à ne plus montrer : ajoute (introuvable) ou retire (image rangée).
 * Un seul document, lu par chaque image rangée : on ne le réécrit que s'il change vraiment. Le
 * réécrire à chaque image faisait échouer les lots de la synchro dès que le site copiait des
 * miniatures en même temps (conflit d'écriture à chaque essai : passage prod du 14/11, 11 h 22).
 */
async function setHidden(ctx: MutationCtx, add: string[], remove: string[]) {
  if (!add.length && !remove.length) return;
  const row = await ctx.db.query("hidden").first();
  const ids = new Set(row?.ids ?? []);
  let changed = false;
  for (const k of add) { const id = k.replace(/^v:/, ""); if (!ids.has(id)) { ids.add(id); changed = true; } }
  for (const k of remove) if (ids.delete(k.replace(/^v:/, ""))) changed = true;
  if (!changed) return;
  const list = [...ids].slice(-8000); // une valeur Convex : 8 192 éléments au plus
  if (row) await ctx.db.patch(row._id, { ids: list, at: Date.now() });
  else await ctx.db.insert("hidden", { ids: list, at: Date.now() });
}

/** Une image rangée en HEIC (Chrome ne l'affiche pas) compte comme absente : elle sera recopiée. */
async function usable(ctx: QueryCtx, row: { storageId: Id<"_storage"> } | null) {
  if (!row) return false;
  const file = await ctx.db.system.get(row.storageId);
  return !!file && !/hei[cf]/i.test(file.contentType ?? "");
}

/** Une image rangée (ou son dernier échec). */
export const mediaGet = internalQuery({
  args: { key: v.string() },
  handler: async (ctx, { key }) => {
    const row = await ctx.db.query("media").withIndex("by_key", (q) => q.eq("key", key)).first();
    if (row && (await usable(ctx, row))) return { url: row.url, missAt: null, heic: null };
    if (row) return { url: null, missAt: null, heic: row.storageId }; // HEIC rangé : converti sur place
    const miss = await ctx.db.query("mediaMiss").withIndex("by_key", (q) => q.eq("key", key)).first();
    return { url: null, missAt: miss?.at ?? null, heic: null };
  },
});

/** Les miniatures introuvables, page par page : [clé, date du dernier essai]. */
export const missPage = internalQuery({
  args: { cursor: v.union(v.string(), v.null()) },
  handler: async (ctx, { cursor }) => {
    const r = await ctx.db.query("mediaMiss").paginate({ cursor, numItems: 4000 });
    return { items: r.page.map((m) => [m.key, m.at] as [string, number]), cursor: r.continueCursor, done: r.isDone };
  },
});

/** Note des miniatures introuvables (synchro). */
export const markMisses = internalMutation({
  args: { keys: v.array(v.string()) },
  handler: async (ctx, { keys }) => {
    const now = Date.now();
    for (const key of keys) {
      const miss = await ctx.db.query("mediaMiss").withIndex("by_key", (q) => q.eq("key", key)).first();
      if (miss) await ctx.db.patch(miss._id, { at: now });
      else await ctx.db.insert("mediaMiss", { key, at: now });
    }
    await setHidden(ctx, keys.filter((k) => k.startsWith("v:")), []);
  },
});

export const markMiss = internalMutation({
  args: { key: v.string() },
  handler: async (ctx, { key }) => {
    const miss = await ctx.db.query("mediaMiss").withIndex("by_key", (q) => q.eq("key", key)).first();
    if (miss) await ctx.db.patch(miss._id, { at: Date.now() });
    else await ctx.db.insert("mediaMiss", { key, at: Date.now() });
    if (key.startsWith("v:")) await setHidden(ctx, [key], []);
  },
});

/** Pour /avatar/<handle> : la photo déjà rangée, et si l'app connaît le compte (fiche, ou cité par une app). */
export const avatarLookup = internalQuery({
  args: { handle: v.string() },
  handler: async (ctx, { handle }) => {
    const row = await ctx.db.query("media").withIndex("by_key", (q) => q.eq("key", `a:${handle}`)).first();
    if (row) return { known: true, url: row.url };
    const page = await ctx.db.query("boards").withIndex("by_key", (q) => q.eq("key", `creator:${handle}`)).first();
    const miss = await ctx.db.query("mediaMiss").withIndex("by_key", (q) => q.eq("key", `a:${handle}`)).first();
    return { known: !!page || !!miss, url: null };
  },
});

/** Pour /cover/<id> : la miniature déjà rangée, sinon le compte de la vidéo (si l'app la connaît). */
export const coverLookup = internalQuery({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    const row = await ctx.db.query("media").withIndex("by_key", (q) => q.eq("key", `v:${id}`)).first();
    if (row && (await usable(ctx, row))) return { url: row.url, handle: null };
    const page = await ctx.db.query("boards").withIndex("by_key", (q) => q.eq("key", `video:${id}`)).first();
    const handle = (page?.data as { handle?: string } | undefined)?.handle;
    return { url: null, handle: handle || null };
  },
});

export const saveMedia = internalMutation({
  args: { items: v.array(v.object({ key: v.string(), storageId: v.id("_storage"), url: v.string() })) },
  handler: async (ctx, { items }) => {
    const now = Date.now();
    for (const it of items) {
      const old = await ctx.db.query("media").withIndex("by_key", (q) => q.eq("key", it.key)).first();
      if (old) {
        await ctx.storage.delete(old.storageId);
        await ctx.db.patch(old._id, { storageId: it.storageId, url: it.url, at: now });
      } else {
        await ctx.db.insert("media", { ...it, at: now });
      }
      const miss = await ctx.db.query("mediaMiss").withIndex("by_key", (q) => q.eq("key", it.key)).first();
      if (miss) await ctx.db.delete(miss._id);
    }
    await setHidden(ctx, [], items.map((it) => it.key).filter((k) => k.startsWith("v:")));
  },
});

/** Les images rangées en HEIC (avant le 13/11 midi), page par page : Chrome ne les affiche pas. */
export const heicPage = internalQuery({
  args: { cursor: v.union(v.string(), v.null()) },
  handler: async (ctx, { cursor }) => {
    const r = await ctx.db.query("media").paginate({ cursor, numItems: 2000 });
    const keys: string[] = [];
    for (const m of r.page) {
      const file = await ctx.db.system.get(m.storageId);
      if (file && /hei[cf]/i.test(file.contentType ?? "")) keys.push(m.key);
    }
    return { keys, cursor: r.continueCursor, done: r.isDone };
  },
});

/** Efface des images recopiées (fichier et ligne). */
export const dropMedia = internalMutation({
  args: { keys: v.array(v.string()) },
  handler: async (ctx, { keys }) => {
    for (const key of keys) {
      const row = await ctx.db.query("media").withIndex("by_key", (q) => q.eq("key", key)).first();
      if (!row) continue;
      await ctx.storage.delete(row.storageId);
      await ctx.db.delete(row._id);
    }
  },
});

/** Les clés des documents, page par page (un document peut peser lourd : jamais tout d'un coup). */
export const boardKeys = internalQuery({
  args: { cursor: v.union(v.string(), v.null()) },
  handler: async (ctx, { cursor }) => {
    const r = await ctx.db.query("boards").paginate({ cursor, numItems: 500 });
    return { keys: r.page.map((b) => b.key), hashes: r.page.map((b) => b.hash), cursor: r.continueCursor, done: r.isDone };
  },
});

/** Efface les documents qu'un passage n'a plus produits (fiche sortie du Radar). */
export const dropBoards = internalMutation({
  args: { keys: v.array(v.string()) },
  handler: async (ctx, { keys }) => {
    for (const key of keys) {
      const row = await ctx.db.query("boards").withIndex("by_key", (q) => q.eq("key", key)).first();
      if (row) await ctx.db.delete(row._id);
    }
  },
});

/** Écrit les documents des écrans ; un document inchangé (même empreinte) n'est pas réécrit. */
export const saveBoards = internalMutation({
  args: { items: v.array(v.object({ key: v.string(), hash: v.string(), data: v.any() })), now: v.number() },
  handler: async (ctx, { items, now }) => {
    let written = 0;
    for (const it of items) {
      const old = await ctx.db.query("boards").withIndex("by_key", (q) => q.eq("key", it.key)).first();
      if (old && old.hash === it.hash) continue;
      if (old) await ctx.db.patch(old._id, { data: it.data, hash: it.hash, updatedAt: now });
      else await ctx.db.insert("boards", { key: it.key, data: it.data, hash: it.hash, updatedAt: now });
      written++;
    }
    return written;
  },
});

/**
 * Un passage tourne-t-il ? Pas fini, et une de ses étapes a donné signe de vie il y a moins de 12 min (une étape dure
 * 10 min au plus ; la synchro par groupes en enchaîne plusieurs).
 */
const runAlive = (r: { finishedAt?: number; startedAt: number; beatAt?: number } | null, now: number) =>
  !!r && !r.finishedAt && now - (r.beatAt ?? r.startedAt) < 12 * 60_000;

/** Démarre un passage ; null si un autre tourne déjà. Un passage resté sans fin (étape coupée) est noté comme tel. */
export const startRun = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const last = await ctx.db.query("syncRuns").withIndex("by_started").order("desc").first();
    if (runAlive(last, now)) return null;
    if (last && !last.finishedAt) await ctx.db.patch(last._id, { finishedAt: now, ok: false, error: last.error ?? "interrompu : une étape s'est arrêtée sans finir" });
    return ctx.db.insert("syncRuns", { startedAt: now, beatAt: now });
  },
});

/** Signe de vie d'une étape. */
export const beat = internalMutation({
  args: { id: v.id("syncRuns") },
  handler: async (ctx, { id }) => ctx.db.patch(id, { beatAt: Date.now() }),
});

export const setStage = internalMutation({
  args: { id: v.id("syncRuns"), stage: v.any() },
  handler: async (ctx, { id, stage }) => ctx.db.patch(id, { stage, beatAt: Date.now() }),
});

/** L'état des étapes d'un passage en cours ; null s'il est fini (ou abandonné). */
export const getStage = internalQuery({
  args: { id: v.id("syncRuns") },
  handler: async (ctx, { id }) => {
    const r = await ctx.db.get(id);
    return r && !r.finishedAt ? r.stage ?? null : null;
  },
});

/** Une étape de groupe finie : le fichier de ce qu'elle transmet. */
export const groupDone = internalMutation({
  args: { id: v.id("syncRuns"), i: v.number(), out: v.id("_storage"), tail: v.id("_storage"), written: v.number() },
  handler: async (ctx, { id, i, out, tail, written }) => {
    const r = await ctx.db.get(id);
    if (!r?.stage) return;
    const outs = [...r.stage.outs]; outs[i] = out;
    const tails = [...(r.stage.tails ?? r.stage.outs.map(() => null))]; tails[i] = tail;
    const writtenBy = [...(r.stage.writtenBy ?? [])]; writtenBy[i] = written;
    await ctx.db.patch(id, { stage: { ...r.stage, outs, tails, writtenBy }, beatAt: Date.now() });
  },
});

/** Une étape coupée (temps, mémoire) : compte ses reprises, pour abandonner celle qui n'avance plus. */
export const stepRetry = internalMutation({
  args: { id: v.id("syncRuns"), step: v.string() },
  handler: async (ctx, { id, step }) => {
    const r = await ctx.db.get(id);
    if (!r?.stage) return 0;
    const retries = { ...(r.stage.retries ?? {}) };
    retries[step] = (retries[step] ?? 0) + 1;
    await ctx.db.patch(id, { stage: { ...r.stage, retries }, beatAt: Date.now() });
    return retries[step] as number;
  },
});

/** Fichiers d'étape des passages finis (ou abandonnés) pas encore effacés. */
export const staleStages = internalQuery({
  args: { keep: v.id("syncRuns") },
  handler: async (ctx, { keep }) => {
    const runs = await ctx.db.query("syncRuns").withIndex("by_started").order("desc").take(30);
    const now = Date.now();
    return runs.filter((r) => r._id !== keep && r.stage && !r.cleaned && !runAlive(r, now)).map((r) => {
      const st = r.stage as { globals?: Record<string, string[]>; outs?: (string | null)[]; tails?: (string | null)[] };
      return { id: r._id, ids: [...Object.values(st.globals ?? {}).flat(), ...[...(st.outs ?? []), ...(st.tails ?? [])].filter((x): x is string => !!x)] };
    });
  },
});

export const stageCleaned = internalMutation({
  args: { id: v.id("syncRuns") },
  handler: async (ctx, { id }) => ctx.db.patch(id, { cleaned: true }),
});

/** Empreinte rangée de chaque page demandée (null : pas de page) : l'écriture n'envoie que les pages qui changent. */
export const boardHashes = internalQuery({
  args: { keys: v.array(v.string()) },
  handler: async (ctx, { keys }) => {
    const out: (string | null)[] = [];
    for (const key of keys) out.push((await ctx.db.query("boards").withIndex("by_key", (q) => q.eq("key", key)).first())?.hash ?? null);
    return out;
  },
});

export const endRun = internalMutation({
  args: { id: v.id("syncRuns"), ok: v.boolean(), counts: v.optional(v.any()), error: v.optional(v.string()) },
  handler: async (ctx, { id, ...rest }) => ctx.db.patch(id, { finishedAt: Date.now(), ...rest }),
});

/** Fiches App Store déjà cherchées : slug -> URL (ou null si introuvable). */
export const appStoreMap = internalQuery({
  args: {},
  handler: async (ctx) => {
    const out: Record<string, { url: string | null; v: number; art: string | null }> = {};
    for await (const r of ctx.db.query("appStore")) out[r.slug] = { url: r.url, v: r.v ?? 1, art: r.art ?? null };
    return out;
  },
});

export const saveAppStore = internalMutation({
  args: { items: v.array(v.object({ slug: v.string(), url: v.union(v.string(), v.null()), v: v.number(), art: v.optional(v.union(v.string(), v.null())) })) },
  handler: async (ctx, { items }) => {
    for (const it of items) {
      const old = await ctx.db.query("appStore").withIndex("by_slug", (q) => q.eq("slug", it.slug)).first();
      if (old) await ctx.db.patch(old._id, { url: it.url, v: it.v, art: it.art ?? null, at: Date.now() });
      else await ctx.db.insert("appStore", { ...it, at: Date.now() });
    }
  },
});

/**
 * Efface les empreintes des pages (une page par appel de 500) : le passage suivant les réécrit
 * toutes. Sert à éprouver le cas lourd (nouvelles icônes partout) sur le dev avant la prod.
 */
export const resetHashes = internalMutation({
  args: { cursor: v.union(v.string(), v.null()) },
  handler: async (ctx, { cursor }) => {
    const r = await ctx.db.query("boards").paginate({ cursor, numItems: 500 });
    for (const b of r.page) await ctx.db.patch(b._id, { hash: "" });
    return { n: r.page.length, cursor: r.continueCursor, done: r.isDone };
  },
});

// ─── Pays des comptes sans pays relevé (convex/radarRegions.ts) ────────────────────────────────

/** Les pays déjà lus, page par page : [pseudo, pays]. */
export const regionPage = internalQuery({
  args: { cursor: v.union(v.string(), v.null()) },
  handler: async (ctx, { cursor }) => {
    const r = await ctx.db.query("accountRegions").paginate({ cursor, numItems: 4000 });
    return { items: r.page.filter((x) => x.country).map((x) => [x.handle, x.country] as [string, string]), cursor: r.continueCursor, done: r.isDone };
  },
});

/** Les comptes à situer (synchro) : ajoutés, ou leurs vidéos mises à jour ; un compte déjà situé ne bouge pas. */
export const saveRegionTodo = internalMutation({
  args: { items: v.array(v.object({ handle: v.string(), ids: v.array(v.string()) })) },
  handler: async (ctx, { items }) => {
    for (const it of items) {
      const row = await ctx.db.query("accountRegions").withIndex("by_handle", (q) => q.eq("handle", it.handle)).first();
      if (!row) await ctx.db.insert("accountRegions", { handle: it.handle, country: null, ids: it.ids, tries: 0, at: 0 });
      else if (!row.country && row.ids.join() !== it.ids.join()) await ctx.db.patch(row._id, { ids: it.ids, tries: 0 });
    }
  },
});

/**
 * Réserve les prochains comptes à lire (sans pays, moins de 3 essais, pas essayés depuis 6 h) : marqués « essayés
 * maintenant » tout de suite, pour que deux lectures en même temps (tâche du quart d'heure, lecture lancée par la
 * synchro) ne relisent pas les mêmes comptes — ce qui arrivait le 14/11.
 */
export const claimRegions = internalMutation({
  args: { limit: v.number(), now: v.number() },
  handler: async (ctx, { limit, now }) => {
    const rows = await ctx.db.query("accountRegions").withIndex("by_country_at", (q) => q.eq("country", null).lt("at", now - 6 * 3_600_000))
      .filter((q) => q.lt(q.field("tries"), 3)).take(limit);
    for (const r of rows) await ctx.db.patch(r._id, { at: now });
    return rows.map((r) => ({ handle: r.handle, ids: r.ids, tries: r.tries }));
  },
});

/** Faut-il une synchro ? Des pays lus depuis le début de la dernière synchro réussie, et aucune synchro depuis 1 h. */
export const regionsNeedSync = internalQuery({
  args: { now: v.number() },
  handler: async (ctx, { now }) => {
    const runs = await ctx.db.query("syncRuns").withIndex("by_started").order("desc").take(20);
    if (runs[0] && now - runs[0].startedAt < 3_600_000) return false;
    const lastOk = runs.find((r) => r.ok)?.startedAt ?? 0;
    const fresh = await ctx.db.query("accountRegions").filter((q) => q.and(q.neq(q.field("country"), null), q.gt(q.field("at"), lastOk))).first();
    return !!fresh;
  },
});

/** Les prochains comptes à lire : sans pays, moins de 3 essais, pas essayés depuis 6 h. */
export const regionBatch = internalQuery({
  args: { limit: v.number(), now: v.number() },
  handler: async (ctx, { limit, now }) => {
    const rows = await ctx.db.query("accountRegions").withIndex("by_country_at", (q) => q.eq("country", null).lt("at", now - 6 * 3_600_000))
      .filter((q) => q.lt(q.field("tries"), 3)).take(limit);
    return rows.map((r) => ({ handle: r.handle, ids: r.ids, tries: r.tries }));
  },
});

/** Le résultat d'une lecture : le pays trouvé (ou null), un essai de plus. */
export const saveRegions = internalMutation({
  args: { items: v.array(v.object({ handle: v.string(), country: v.union(v.string(), v.null()) })), now: v.number() },
  handler: async (ctx, { items, now }) => {
    for (const it of items) {
      const row = await ctx.db.query("accountRegions").withIndex("by_handle", (q) => q.eq("handle", it.handle)).first();
      if (row) await ctx.db.patch(row._id, { country: it.country, tries: row.tries + 1, at: now });
    }
  },
});

// ─── Carrousels (convex/radarSlides.ts) ────────────────────────────────────────────────────────

/**
 * Toutes les vidéos de la file, page par page : [id, nombre de photos] (0 : pas un carrousel, -1 : pas encore lue).
 * Les vidéos en attente comptent aussi : la synchro ne les ré-enregistre pas (le 14/11, ré-enregistrer 45 000 vidéos
 * avant d'écrire les pages a fait manquer le temps à la synchro de prod).
 */
export const slidePage = internalQuery({
  args: { cursor: v.union(v.string(), v.null()) },
  handler: async (ctx, { cursor }) => {
    const r = await ctx.db.query("videoSlides").paginate({ cursor, numItems: 4000 });
    return { items: r.page.map((x) => [x.videoId, x.slideshow === null ? -1 : x.slideshow ? x.images ?? 1 : 0] as [string, number]),
      cursor: r.continueCursor, done: r.isDone };
  },
});

/** Les vidéos à vérifier (synchro) : celles que les écrans montrent et qu'on n'a jamais lues. */
export const saveSlideTodo = internalMutation({
  args: { ids: v.array(v.string()) },
  handler: async (ctx, { ids }) => {
    for (const videoId of ids) {
      const row = await ctx.db.query("videoSlides").withIndex("by_video", (q) => q.eq("videoId", videoId)).first();
      if (!row) await ctx.db.insert("videoSlides", { videoId, slideshow: null, tries: 0, at: 0 });
    }
  },
});

const slideTodo = (ctx: QueryCtx, now: number, limit: number) =>
  ctx.db.query("videoSlides").withIndex("by_slideshow_at", (q) => q.eq("slideshow", null).lt("at", now - 6 * 3_600_000))
    .filter((q) => q.lt(q.field("tries"), 3)).take(limit);

/** Réserve les prochaines vidéos à lire (marquées « essayées maintenant » : deux lectures ne prennent pas les mêmes). */
export const claimSlides = internalMutation({
  args: { limit: v.number(), now: v.number() },
  handler: async (ctx, { limit, now }) => {
    const rows = await slideTodo(ctx, now, limit);
    for (const r of rows) await ctx.db.patch(r._id, { at: now });
    return rows.map((r) => r.videoId);
  },
});

export const slideLeft = internalQuery({
  args: { now: v.number() },
  handler: async (ctx, { now }) => (await slideTodo(ctx, now, 1)).length > 0,
});

/** Le résultat d'une lecture : carrousel ou non (null : page illisible, un essai de plus). */
export const saveSlides = internalMutation({
  args: { items: v.array(v.object({ videoId: v.string(), slideshow: v.union(v.boolean(), v.null()), images: v.number() })), now: v.number() },
  handler: async (ctx, { items, now }) => {
    for (const it of items) {
      const row = await ctx.db.query("videoSlides").withIndex("by_video", (q) => q.eq("videoId", it.videoId)).first();
      if (row) await ctx.db.patch(row._id, { slideshow: it.slideshow, ...(it.slideshow ? { images: it.images } : {}), tries: row.tries + 1, at: now });
    }
  },
});

/** Faut-il une synchro ? Des carrousels trouvés depuis le début de la dernière synchro réussie, aucune synchro depuis 1 h. */
export const slidesNeedSync = internalQuery({
  args: { now: v.number() },
  handler: async (ctx, { now }) => {
    const runs = await ctx.db.query("syncRuns").withIndex("by_started").order("desc").take(20);
    if (runs[0] && now - runs[0].startedAt < 3_600_000) return false;
    const lastOk = runs.find((r) => r.ok)?.startedAt ?? 0;
    return !!(await ctx.db.query("videoSlides").withIndex("by_slideshow_at", (q) => q.eq("slideshow", true).gt("at", lastOk)).first());
  },
});

// ─── Lecture IA des vidéos et des comptes (convex/radarAi.ts) ──────────────────────────────────

const RETRY_MS = 6 * 3_600_000;

/** Toutes les vidéos de la file : [id, type, texte à l'écran, lue ? 1 : 0] (en attente : connues, pas ré-enregistrées). */
export const videoAiPage = internalQuery({
  args: { cursor: v.union(v.string(), v.null()) },
  handler: async (ctx, { cursor }) => {
    const r = await ctx.db.query("videoAi").paginate({ cursor, numItems: 3000 });
    return { items: r.page.map((x) => [x.videoId, x.type ?? "", x.text ?? "", x.done ? 1 : 0] as [string, string, string, number]), cursor: r.continueCursor, done: r.isDone };
  },
});

/** Tous les comptes de la file : [pseudo, genre, lu ? 1 : 0]. */
export const genderPage = internalQuery({
  args: { cursor: v.union(v.string(), v.null()) },
  handler: async (ctx, { cursor }) => {
    const r = await ctx.db.query("accountAi").paginate({ cursor, numItems: 4000 });
    return { items: r.page.map((x) => [x.handle, x.gender ?? "", x.done ? 1 : 0] as [string, string, number]), cursor: r.continueCursor, done: r.isDone };
  },
});

export const saveVideoAiTodo = internalMutation({
  args: { ids: v.array(v.string()) },
  handler: async (ctx, { ids }) => {
    for (const videoId of ids) {
      if (!(await ctx.db.query("videoAi").withIndex("by_video", (q) => q.eq("videoId", videoId)).first())) {
        await ctx.db.insert("videoAi", { videoId, done: false, tries: 0, at: 0 });
      }
    }
  },
});

export const saveGenderTodo = internalMutation({
  args: { items: v.array(v.object({ handle: v.string(), ids: v.array(v.string()) })) },
  handler: async (ctx, { items }) => {
    for (const it of items) {
      const row = await ctx.db.query("accountAi").withIndex("by_handle", (q) => q.eq("handle", it.handle)).first();
      if (!row) await ctx.db.insert("accountAi", { handle: it.handle, done: false, ids: it.ids, tries: 0, at: 0 });
    }
  },
});

/** Réserve les prochaines vidéos à lire ; `max` : plafond de vidéos lues en tout (dev : SWARM_KINDS_LIMIT). */
export const claimVideoAi = internalMutation({
  args: { limit: v.number(), now: v.number(), max: v.union(v.number(), v.null()) },
  handler: async (ctx, { limit, now, max }) => {
    let take = limit;
    if (max !== null) take = Math.min(limit, Math.max(0, max - (await ctx.db.query("videoAi").withIndex("by_done_at", (q) => q.eq("done", true)).take(max)).length));
    if (!take) return [];
    const rows = await ctx.db.query("videoAi").withIndex("by_done_at", (q) => q.eq("done", false).lt("at", now - RETRY_MS))
      .filter((q) => q.lt(q.field("tries"), 3)).take(take);
    for (const r of rows) await ctx.db.patch(r._id, { at: now });
    return rows.map((r) => r.videoId);
  },
});

export const claimGender = internalMutation({
  args: { limit: v.number(), now: v.number(), max: v.union(v.number(), v.null()) },
  handler: async (ctx, { limit, now, max }) => {
    let take = limit;
    if (max !== null) take = Math.min(limit, Math.max(0, max - (await ctx.db.query("accountAi").withIndex("by_done_at", (q) => q.eq("done", true)).take(max)).length));
    if (!take) return [];
    const rows = await ctx.db.query("accountAi").withIndex("by_done_at", (q) => q.eq("done", false).lt("at", now - RETRY_MS))
      .filter((q) => q.lt(q.field("tries"), 3)).take(take);
    for (const r of rows) await ctx.db.patch(r._id, { at: now });
    return rows.map((r) => ({ handle: r.handle, ids: r.ids }));
  },
});

export const saveVideoAi = internalMutation({
  args: { items: v.array(v.object({ videoId: v.string(), ok: v.boolean(), type: v.optional(v.string()), text: v.optional(v.string()) })), now: v.number() },
  handler: async (ctx, { items, now }) => {
    for (const it of items) {
      const row = await ctx.db.query("videoAi").withIndex("by_video", (q) => q.eq("videoId", it.videoId)).first();
      if (!row) continue;
      if (it.ok) await ctx.db.patch(row._id, { done: true, type: it.type, text: it.text, tries: row.tries + 1, at: now });
      else await ctx.db.patch(row._id, { tries: row.tries + 1, at: now });
    }
  },
});

export const saveGender = internalMutation({
  args: { items: v.array(v.object({ handle: v.string(), ok: v.boolean(), gender: v.optional(v.string()) })), now: v.number() },
  handler: async (ctx, { items, now }) => {
    for (const it of items) {
      const row = await ctx.db.query("accountAi").withIndex("by_handle", (q) => q.eq("handle", it.handle)).first();
      if (!row) continue;
      if (it.ok) await ctx.db.patch(row._id, { done: true, gender: it.gender, tries: row.tries + 1, at: now });
      else await ctx.db.patch(row._id, { tries: row.tries + 1, at: now });
    }
  },
});

/** Reste-t-il à lire (vidéos ou comptes) ? */
export const aiLeft = internalQuery({
  args: { table: v.union(v.literal("videoAi"), v.literal("accountAi")), now: v.number() },
  handler: async (ctx, { table, now }) =>
    !!(await ctx.db.query(table).withIndex("by_done_at", (q) => q.eq("done", false).lt("at", now - RETRY_MS)).filter((q) => q.lt(q.field("tries"), 3)).first()),
});

/** Faut-il une synchro ? Des lectures faites depuis le début de la dernière synchro réussie, et aucune synchro depuis 1 h. */
export const aiNeedSync = internalQuery({
  args: { now: v.number() },
  handler: async (ctx, { now }) => {
    const runs = await ctx.db.query("syncRuns").withIndex("by_started").order("desc").take(20);
    if (runs[0] && now - runs[0].startedAt < 3_600_000) return false;
    const lastOk = runs.find((r) => r.ok)?.startedAt ?? 0;
    for (const t of ["videoAi", "accountAi"] as const) {
      if (await ctx.db.query(t).withIndex("by_done_at", (q) => q.eq("done", true).gt("at", lastOk)).first()) return true;
    }
    return false;
  },
});

// ─── Bail des lectures de fond ────────────────────────────────────────────────────────────────

/**
 * Prend (ou renouvelle) le bail `name` pour `token` : faux si une autre chaîne le tient, ou si une synchro tourne.
 * 14/11 : chaque tâche du quart d'heure lançait une chaîne de plus (lecture IA, carrousels) ; elles s'empilaient et
 * appelaient /cover en même temps que la synchro, morte en route à 21h43.
 */
export const takeLease = internalMutation({
  args: { name: v.string(), token: v.string(), ms: v.number(), now: v.number() },
  handler: async (ctx, { name, token, ms, now }) => {
    const run = await ctx.db.query("syncRuns").withIndex("by_started").order("desc").first();
    if (runAlive(run, now)) return false;
    const row = await ctx.db.query("leases").withIndex("by_name", (q) => q.eq("name", name)).first();
    if (row && row.until > now && row.token !== token) return false;
    if (row) await ctx.db.patch(row._id, { token, until: now + ms });
    else await ctx.db.insert("leases", { name, token, until: now + ms });
    return true;
  },
});

export const dropLease = internalMutation({
  args: { name: v.string(), token: v.string() },
  handler: async (ctx, { name, token }) => {
    const row = await ctx.db.query("leases").withIndex("by_name", (q) => q.eq("name", name)).first();
    if (row && row.token === token) await ctx.db.patch(row._id, { until: 0 });
  },
});

// ─── Langue des comptes (convex/radarLang.ts) ──────────────────────────────────────────────────

/** Les comptes calculés : [id, langue] ("" : on ne sait pas). */
export const langPage = internalQuery({
  args: { cursor: v.union(v.string(), v.null()) },
  handler: async (ctx, { cursor }) => {
    const r = await ctx.db.query("accountLangs").paginate({ cursor, numItems: 5000 });
    return { items: r.page.map((x) => [x.accountId, x.lang ?? ""] as [string, string]), cursor: r.continueCursor, done: r.isDone };
  },
});

export const saveLangs = internalMutation({
  args: { items: v.array(v.object({ accountId: v.string(), lang: v.union(v.string(), v.null()) })), now: v.number() },
  handler: async (ctx, { items, now }) => {
    for (const it of items) {
      const row = await ctx.db.query("accountLangs").withIndex("by_account", (q) => q.eq("accountId", it.accountId)).first();
      if (row) await ctx.db.patch(row._id, { lang: it.lang, at: now });
      else await ctx.db.insert("accountLangs", { accountId: it.accountId, lang: it.lang, at: now });
    }
  },
});
