import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

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

export const get = query({
  args: { key: v.string() },
  handler: async (ctx, { key }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    const row = await ctx.db
      .query("saved")
      .withIndex("by_user_key", (q) => q.eq("userId", userId).eq("key", key))
      .first();
    return row ? row.value : null;
  },
});

export const set = mutation({
  args: { key: v.string(), value: v.any() },
  handler: async (ctx, { key, value }) => {
    const userId = await getAuthUserId(ctx);
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
