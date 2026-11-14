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
    return { keys: r.page.map((b) => b.key), cursor: r.continueCursor, done: r.isDone };
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

/** Démarre un passage ; null si un autre tourne déjà (lancé il y a moins de 12 min et pas fini). */
export const startRun = internalMutation({
  args: {},
  handler: async (ctx) => {
    const last = await ctx.db.query("syncRuns").withIndex("by_started").order("desc").first();
    if (last && !last.finishedAt && Date.now() - last.startedAt < 12 * 60_000) return null;
    return ctx.db.insert("syncRuns", { startedAt: Date.now() });
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
