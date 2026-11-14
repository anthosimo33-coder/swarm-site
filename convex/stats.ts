import { query } from "./_generated/server";

/**
 * Ce que le Radar suit, pour les pages publiques (accueil, tarifs, connexion) : nombre d'apps listées, de comptes qui
 * les poussent (prouvés), de marchés. Seulement des totaux, lisibles sans compte ; tout le reste des données de l'app
 * est réservé aux personnes connectées (convex/boards.ts). Le document « stats » est écrit à chaque synchronisation
 * (convex/radarModels.ts). null : pas encore de synchronisation.
 */
export const get = query({
  args: {},
  handler: async (ctx) => {
    const row = await ctx.db.query("boards").withIndex("by_key", (q) => q.eq("key", "stats")).first();
    const d = row?.data as { apps?: number; accounts?: number; markets?: number; at?: number } | undefined;
    if (!d || typeof d.apps !== "number" || typeof d.accounts !== "number") return null;
    return { apps: d.apps, accounts: d.accounts, markets: d.markets ?? null, at: d.at ?? null };
  },
});
