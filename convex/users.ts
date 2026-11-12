import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "./_generated/server";

/** La personne connectée (pour l'app), ou null. `name` vient de Google ; l'inscription par e-mail n'en demande pas. */
export const viewer = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    const user = await ctx.db.get(userId);
    if (user === null) return null;
    return { email: user.email ?? null, name: user.name ?? null };
  },
});
