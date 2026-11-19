import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";

/**
 * La personne connectée (pour l'app), ou null. `name` vient de Google ; l'inscription par e-mail n'en demande pas.
 * `pro` : abonnée (tout Kopycat) ; sinon l'app montre l'aperçu (convex/boards.ts, src/app/main.js).
 */
export const viewer = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    const user = await ctx.db.get(userId);
    if (user === null) return null;
    return { email: user.email ?? null, name: user.name ?? null, pro: user.pro === true };
  },
});

/**
 * Passe un compte en Pro (ou le repasse à l'aperçu), par son e-mail. Interne : depuis le terminal seulement,
 * `npx convex run users:setPro '{"email":"…","pro":true}'` (ajouter --prod pour la production). En attendant le
 * paiement Whop, c'est la seule façon d'ouvrir tout Kopycat à un compte.
 */
export const setPro = internalMutation({
  args: { email: v.string(), pro: v.boolean() },
  handler: async (ctx, { email, pro }) => {
    const user = await ctx.db.query("users").withIndex("email", (q) => q.eq("email", email.trim().toLowerCase())).first();
    if (user === null) return { found: false };
    await ctx.db.patch(user._id, { pro: pro || undefined });
    return { found: true, pro };
  },
});
