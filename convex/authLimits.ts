import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

/**
 * Limite à fenêtre fixe : au plus `max` passages par `windowMs` pour une clé (ex. « signUp », convex/auth.ts). Rend faux
 * au-delà ; un passage refusé n'est pas compté.
 */
export const hit = internalMutation({
  args: { key: v.string(), max: v.number(), windowMs: v.number() },
  handler: async (ctx, { key, max, windowMs }): Promise<boolean> => {
    const now = Date.now();
    const row = await ctx.db.query("authLimits").withIndex("by_key", (q) => q.eq("key", key)).first();
    if (!row) { await ctx.db.insert("authLimits", { key, n: 1, since: now }); return true; }
    if (now - row.since >= windowMs) { await ctx.db.patch(row._id, { n: 1, since: now }); return true; }
    if (row.n >= max) return false;
    await ctx.db.patch(row._id, { n: row.n + 1 });
    return true;
  },
});
