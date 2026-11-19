import { getAuthSessionId, getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { internalQuery, type ActionCtx, type QueryCtx } from "./_generated/server";

/**
 * La personne connectée, seulement si sa session existe encore.
 *
 * Le jeton de Convex Auth (JWT) reste valable jusqu'à son expiration (1 h) même quand sa session est supprimée :
 * « Déconnecter les autres », un changement de mot de passe ou d'e-mail ferment les autres sessions en base, mais
 * getAuthUserId seul laisserait ces appareils lire jusqu'à l'heure suivante. Ici la session est relue : supprimée,
 * l'appareil est traité en déconnecté tout de suite, et `users.viewer` (réactif) renvoie null, ce qui le fait sortir
 * (src/app/main.js). Pour les queries et mutations ; les actions passent par `liveUserIdInAction`.
 */
export async function liveUserId(ctx: QueryCtx): Promise<Id<"users"> | null> {
  const userId = await getAuthUserId(ctx);
  if (userId === null) return null;
  const sessionId = await getAuthSessionId(ctx);
  if (sessionId === null || (await ctx.db.get(sessionId)) === null) return null;
  return userId;
}

export const sessionAlive = internalQuery({
  args: { sessionId: v.id("authSessions") },
  handler: async (ctx, { sessionId }) => (await ctx.db.get(sessionId)) !== null,
});

/** Même règle que `liveUserId`, depuis une action (pas d'accès direct à la base). */
export async function liveUserIdInAction(ctx: ActionCtx): Promise<Id<"users"> | null> {
  const userId = await getAuthUserId(ctx);
  if (userId === null) return null;
  const sessionId = await getAuthSessionId(ctx);
  if (sessionId === null || !(await ctx.runQuery(internal.session.sessionAlive, { sessionId }))) return null;
  return userId;
}
