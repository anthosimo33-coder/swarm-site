import { ConvexError, v } from "convex/values";
import { liveUserId } from "./session";
import { mutation, query, type QueryCtx } from "./_generated/server";

/**
 * Ce que la personne garde dans l'app, par clé (forme de chaque valeur : docs/donnees-app.md) :
 *   follows     { apps: [slug], creators: [handle], formats: [id] }
 *   folders     [{ id, name, createdAt, items: [{ kind, id, label, cover, at }] }]
 *   alertRules  [{ id, … , createdAt }]
 *   seen        { alerts: date en ms de « Tout marquer comme lu » }
 * Le routeur (src/app/main.js) les passe aux écrans par `saved(clé)` et `save(clé, valeur)`.
 */
const KEYS = new Set(["follows", "folders", "alertRules", "seen"]);
const MAX_BYTES = 256_000;

/**
 * Une app suivie ou gardée dans un dossier sous l'ancien slug d'une app fusionnée apparaît sous celui de l'app qui l'a
 * reprise (« apps:merged », convex/radarModels.ts). Audit Q25 (19/11) : elle disparaissait de l'Accueil et des Apps
 * suivies, et son lien de dossier menait à « fiche absente ». La valeur rangée change à la prochaine sauvegarde.
 */
async function mergedApps(ctx: QueryCtx): Promise<Map<string, string>> {
  const row = await ctx.db.query("boards").withIndex("by_key", (q) => q.eq("key", "apps:merged")).first();
  return new Map((row?.data as { merged?: [string, string][] } | null)?.merged ?? []);
}
function withMerged(key: string, value: unknown, to: Map<string, string>): unknown {
  if (!to.size || !value || typeof value !== "object") return value;
  if (key === "follows") {
    const f = value as { apps?: unknown };
    if (!Array.isArray(f.apps) || !f.apps.some((s) => to.has(s))) return value;
    return { ...f, apps: [...new Set(f.apps.map((s) => (typeof s === "string" ? to.get(s) ?? s : s)))] };
  }
  if (key === "folders" && Array.isArray(value)) {
    return value.map((folder) => {
      const items = (folder as { items?: unknown })?.items;
      if (!Array.isArray(items) || !items.some((it) => it?.kind === "app" && to.has(it.id))) return folder;
      const seen = new Set<string>();
      const out = [];
      for (const it of items) {
        const next = it?.kind === "app" && to.has(it.id) ? { ...it, id: to.get(it.id) } : it;
        if (next?.kind === "app") { if (seen.has(next.id)) continue; seen.add(next.id); } // gardée deux fois : une
        out.push(next);
      }
      return { ...folder, items: out };
    });
  }
  return value;
}

export const get = query({
  args: { key: v.string() },
  handler: async (ctx, { key }) => {
    const userId = await liveUserId(ctx);
    if (userId === null) return null;
    const row = await ctx.db
      .query("saved")
      .withIndex("by_user_key", (q) => q.eq("userId", userId).eq("key", key))
      .first();
    if (!row) return null;
    return key === "follows" || key === "folders" ? withMerged(key, row.value, await mergedApps(ctx)) : row.value;
  },
});

export const set = mutation({
  args: { key: v.string(), value: v.any() },
  handler: async (ctx, { key, value }) => {
    const userId = await liveUserId(ctx);
    if (userId === null) throw new ConvexError("NON_CONNECTE");
    if (!KEYS.has(key)) throw new ConvexError("CLE_INCONNUE");
    if (JSON.stringify(value ?? null).length > MAX_BYTES) throw new ConvexError("TROP_LOURD");
    const row = await ctx.db
      .query("saved")
      .withIndex("by_user_key", (q) => q.eq("userId", userId).eq("key", key))
      .first();
    if (row) await ctx.db.patch(row._id, { value, updatedAt: Date.now() });
    else await ctx.db.insert("saved", { userId, key, value, updatedAt: Date.now() });
  },
});
