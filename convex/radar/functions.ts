import { ConvexError, type ObjectType, type PropertyValidators } from "convex/values";
import { internalMutation, mutation, query, type MutationCtx, type QueryCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { liveUserId } from "../session";

/**
 * Les gardes du Radar dans Kopycat (déménagé de Jarvia le 20/11/2026). Dans Jarvia, ses écrans étaient gardés par la
 * permission « radar.use » d'un projet ; dans Kopycat, ils sont réservés à l'administration : les adresses de la
 * variable ADMIN_EMAILS, comme la page /admin (convex/admin.ts). Les fonctions « e2e » de Jarvia (graines et contrôles
 * des tests de bout en bout, gardées par un secret) deviennent internes : jamais appelables depuis un navigateur.
 */

/** L'utilisateur connecté, s'il est administrateur ; sinon une erreur. */
export async function requireAdmin(ctx: QueryCtx): Promise<Id<"users">> {
  const userId = await liveUserId(ctx);
  const email = userId ? (await ctx.db.get(userId))?.email?.toLowerCase() : undefined;
  const allowed = (process.env.ADMIN_EMAILS ?? "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  if (!userId || !email || !allowed.includes(email)) throw new ConvexError({ code: "ADMIN_ONLY", message: "Réservé à l'administration." });
  return userId;
}

export type ProjectQueryCtx = QueryCtx & { userId: Id<"users"> };
export type ProjectMutationCtx = MutationCtx & { userId: Id<"users"> };

type Def<C, A extends PropertyValidators, R> = { args: A; handler: (ctx: C, args: ObjectType<A>) => R | Promise<R> };

/** Une requête des écrans du Radar : administrateurs seulement. `_permission` : le nom de la permission chez Jarvia. */
export function permissionQuery(_permission: string) {
  return <A extends PropertyValidators, R>(def: Def<ProjectQueryCtx, A, R>) =>
    query({
      args: def.args,
      handler: async (ctx: QueryCtx, args: ObjectType<A>): Promise<R> => def.handler(Object.assign({}, ctx, { userId: await requireAdmin(ctx) }), args),
    });
}

/** Une mutation des écrans du Radar : administrateurs seulement. */
export function permissionMutation(_permission: string) {
  return <A extends PropertyValidators, R>(def: Def<ProjectMutationCtx, A, R>) =>
    mutation({
      args: def.args,
      handler: async (ctx: MutationCtx, args: ObjectType<A>): Promise<R> => def.handler(Object.assign({}, ctx, { userId: await requireAdmin(ctx) }), args),
    });
}

/** Les fonctions de test de Jarvia : internes dans Kopycat. */
export const e2eMutation = internalMutation;
