import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "./_generated/server";

/** La personne connectée (pour la page Mon compte), ou null. */
export const viewer = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    const user = await ctx.db.get(userId);
    if (user === null) return null;
    return { email: user.email ?? null };
  },
});
