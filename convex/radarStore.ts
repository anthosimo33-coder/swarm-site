import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";

/** Toutes les miniatures déjà recopiées : clé -> URL servie par Swarm. */
export const mediaMap = internalQuery({
  args: {},
  handler: async (ctx) => {
    const out: Record<string, string> = {};
    for await (const m of ctx.db.query("media")) out[m.key] = m.url;
    return out;
  },
});

/** Une image rangée (ou son dernier échec). */
export const mediaGet = internalQuery({
  args: { key: v.string() },
  handler: async (ctx, { key }) => {
    const row = await ctx.db.query("media").withIndex("by_key", (q) => q.eq("key", key)).first();
    if (row) return { url: row.url, missAt: null };
    const miss = await ctx.db.query("mediaMiss").withIndex("by_key", (q) => q.eq("key", key)).first();
    return { url: null, missAt: miss?.at ?? null };
  },
});

export const markMiss = internalMutation({
  args: { key: v.string() },
  handler: async (ctx, { key }) => {
    const miss = await ctx.db.query("mediaMiss").withIndex("by_key", (q) => q.eq("key", key)).first();
    if (miss) await ctx.db.patch(miss._id, { at: Date.now() });
    else await ctx.db.insert("mediaMiss", { key, at: Date.now() });
  },
});

/** Pour /cover/<id> : la miniature déjà rangée, sinon le compte de la vidéo (si l'app la connaît). */
export const coverLookup = internalQuery({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    const row = await ctx.db.query("media").withIndex("by_key", (q) => q.eq("key", `v:${id}`)).first();
    if (row) return { url: row.url, handle: null };
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

export const startRun = internalMutation({
  args: {},
  handler: async (ctx) => ctx.db.insert("syncRuns", { startedAt: Date.now() }),
});

export const endRun = internalMutation({
  args: { id: v.id("syncRuns"), ok: v.boolean(), counts: v.optional(v.any()), error: v.optional(v.string()) },
  handler: async (ctx, { id, ...rest }) => ctx.db.patch(id, { finishedAt: Date.now(), ...rest }),
});

/** Fiches App Store déjà cherchées : slug -> URL (ou null si introuvable). */
export const appStoreMap = internalQuery({
  args: {},
  handler: async (ctx) => {
    const out: Record<string, string | null> = {};
    for await (const r of ctx.db.query("appStore")) out[r.slug] = r.url;
    return out;
  },
});

export const saveAppStore = internalMutation({
  args: { items: v.array(v.object({ slug: v.string(), url: v.union(v.string(), v.null()) })) },
  handler: async (ctx, { items }) => {
    for (const it of items) {
      const old = await ctx.db.query("appStore").withIndex("by_slug", (q) => q.eq("slug", it.slug)).first();
      if (old) await ctx.db.patch(old._id, { url: it.url, at: Date.now() });
      else await ctx.db.insert("appStore", { ...it, at: Date.now() });
    }
  },
});
