import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { query } from "./_generated/server";

/**
 * Les données d'un écran de l'app (« apps », « app:astraai », « video:<id> »…),
 * réservées aux personnes connectées. null : pas connecté, ou écran sans données.
 */
export const get = query({
  args: { key: v.string() },
  handler: async (ctx, { key }) => {
    if ((await getAuthUserId(ctx)) === null) return null;
    const row = await ctx.db.query("boards").withIndex("by_key", (q) => q.eq("key", key)).first();
    return row ? row.data : null;
  },
});
