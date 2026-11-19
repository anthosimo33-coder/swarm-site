import { getAuthSessionId, getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { internalMutation, mutation, query, type MutationCtx } from "./_generated/server";

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
    return { email: user.email ?? null, name: user.name ?? null, pro: user.pro === true, emailVerified: !!user.emailVerificationTime };
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

// ─── Réglages (19/11) : prénom, appareils connectés, fermeture du compte ───

/** Le prénom affiché dans l'app (Réglages › Profil). Vide : l'app retombe sur l'e-mail. 40 caractères au plus. */
export const setName = mutation({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Non connecté");
    const clean = Array.from(name.replace(/\s+/g, " ").trim()).slice(0, 40).join("").trim();
    await ctx.db.patch(userId, { name: clean || undefined });
    return clean;
  },
});

/** Les sessions ouvertes (Réglages › Sécurité) : depuis quand celle de cet appareil, combien d'autres. */
export const sessions = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    const current = await getAuthSessionId(ctx);
    const now = Date.now();
    const open = (await ctx.db.query("authSessions").withIndex("userId", (q) => q.eq("userId", userId)).collect())
      .filter((s) => s.expirationTime > now);
    const mine = open.find((s) => s._id === current);
    return { since: mine ? mine._creationTime : null, others: open.filter((s) => s._id !== current).length };
  },
});

/** Une session et ses jetons de renouvellement : l'appareil est déconnecté à sa prochaine requête. */
async function dropSession(ctx: MutationCtx, id: Id<"authSessions">) {
  for (const t of await ctx.db.query("authRefreshTokens").withIndex("sessionId", (q) => q.eq("sessionId", id)).collect()) {
    await ctx.db.delete(t._id);
  }
  await ctx.db.delete(id);
}

/** Déconnecte tous les autres appareils ; celui-ci reste connecté. Rend le nombre de sessions fermées. */
export const signOutOthers = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Non connecté");
    const current = await getAuthSessionId(ctx);
    let closed = 0;
    for (const s of await ctx.db.query("authSessions").withIndex("userId", (q) => q.eq("userId", userId)).collect()) {
      if (s._id === current) continue;
      await dropSession(ctx, s._id);
      closed++;
    }
    return closed;
  },
});

/**
 * Ferme le compte (Réglages › Profil) : ce que la personne garde (`saved`), ses sessions, ses identifiants et le compte.
 * Il faut retaper son e-mail ; sinon rien n'est effacé ({ ok: false }). Irréversible.
 */
export const deleteAccount = mutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Non connecté");
    const user = await ctx.db.get(userId);
    if (user === null || !user.email || email.trim().toLowerCase() !== user.email.trim().toLowerCase()) return { ok: false };
    for (const row of await ctx.db.query("saved").withIndex("by_user_key", (q) => q.eq("userId", userId)).collect()) {
      await ctx.db.delete(row._id);
    }
    for (const s of await ctx.db.query("authSessions").withIndex("userId", (q) => q.eq("userId", userId)).collect()) {
      await dropSession(ctx, s._id);
    }
    for (const a of await ctx.db.query("authAccounts").withIndex("userIdAndProvider", (q) => q.eq("userId", userId)).collect()) {
      for (const c of await ctx.db.query("authVerificationCodes").withIndex("accountId", (q) => q.eq("accountId", a._id)).collect()) {
        await ctx.db.delete(c._id);
      }
      await ctx.db.delete(a._id);
    }
    await ctx.db.delete(userId);
    return { ok: true };
  },
});
