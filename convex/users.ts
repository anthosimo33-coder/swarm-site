import { getAuthSessionId, modifyAccountCredentials, retrieveAccount } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { liveUserId, liveUserIdInAction } from "./session";
import { cancelAllNow, hasAccess, recomputePro } from "./whop";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { action, internalAction, internalMutation, internalQuery, mutation, query, type ActionCtx, type MutationCtx } from "./_generated/server";
import { signInKey } from "./authLimits";

/**
 * La personne connectée (pour l'app), ou null. `name` vient de Google ; l'inscription par e-mail n'en demande pas.
 * `pro` : abonnée (tout Kopycat) ; sinon l'app montre l'aperçu (convex/boards.ts, src/app/main.js).
 */
export const viewer = query({
  args: {},
  handler: async (ctx) => {
    const userId = await liveUserId(ctx);
    if (userId === null) return null;
    const user = await ctx.db.get(userId);
    if (user === null) return null;
    return { email: user.email ?? null, name: user.name ?? null, pro: user.pro === true, emailVerified: !!user.emailVerificationTime };
  },
});

/**
 * La main de l'exploitant sur l'accès Pro d'un compte, par son e-mail (audit Q5). Interne : depuis le terminal seulement,
 * `npx convex run users:setPro '{"email":"…","pro":true}'` (ajouter --prod pour la production).
 *   pro: true  → Pro sans paiement (compte de test, geste commercial) ;
 *   pro: false → Pro refusé, même avec un abonnement payé (fraude, litige) ;
 *   pro: null  → la main rendue : l'accès suit les adhésions Whop.
 * Un événement Whop ne défait plus ce choix (whop.recomputePro le lit d'abord).
 */
export const setPro = internalMutation({
  args: { email: v.string(), pro: v.union(v.boolean(), v.null()) },
  handler: async (ctx, { email, pro }) => {
    const user = await ctx.db.query("users").withIndex("email", (q) => q.eq("email", email.trim().toLowerCase())).first();
    if (user === null) return { found: false };
    await ctx.db.patch(user._id, { proManual: pro ?? undefined });
    return { found: true, pro: await recomputePro(ctx, user._id) };
  },
});

/**
 * Migration du 20/11 (audit Q5) : un compte Pro sans adhésion qui donne accès l'est devenu à la main (setPro d'avant) ;
 * son choix est rangé dans proManual, pour que le premier événement Whop ne l'efface pas. Lancer une fois :
 * `npx convex run --prod users:migrerProManuel`.
 */
export const migrerProManuel = internalMutation({
  args: {},
  handler: async (ctx) => {
    const done: string[] = [];
    for (const u of await ctx.db.query("users").collect()) {
      if (u.pro !== true || u.proManual !== undefined) continue;
      const subs = await ctx.db.query("subscriptions").withIndex("by_user", (q) => q.eq("userId", u._id)).collect();
      if (subs.some(hasAccess)) continue;
      await ctx.db.patch(u._id, { proManual: true });
      done.push(u._id);
    }
    return { proManuel: done.length };
  },
});

// ─── Réglages (19/11) : prénom, appareils connectés, fermeture du compte ───

/** Le prénom affiché dans l'app (Réglages › Profil). Vide : l'app retombe sur l'e-mail. 40 caractères au plus. */
export const setName = mutation({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    const userId = await liveUserId(ctx);
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
    const userId = await liveUserId(ctx);
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
    const userId = await liveUserId(ctx);
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
 * Ferme le compte (Réglages › Profil). Il faut retaper son e-mail ; sinon rien n'est effacé ({ ok: false, reason:
 * "email" }). Audit du 19/11, S2 : l'abonnement Whop est d'abord résilié tout de suite (convex/whop.ts, cancelAllNow) ;
 * avant, le compte était effacé et Whop continuait de prélever une personne sans compte. Si Whop ne confirme pas,
 * rien n'est effacé ({ ok: false, reason: "resiliation" }). Puis ce que la personne garde (`saved`), ses sessions, ses
 * identifiants et le compte. Irréversible. Une action : une mutation ne peut pas appeler Whop.
 */
export const deleteAccount = action({
  args: { email: v.string() },
  handler: async (ctx, { email }): Promise<{ ok: boolean; reason?: "email" | "resiliation" }> => {
    const userId = await liveUserIdInAction(ctx);
    if (userId === null) throw new Error("Non connecté");
    const { email: mine } = await ctx.runQuery(internal.users.credentialsOf, { userId });
    if (!mine || email.trim().toLowerCase() !== mine.trim().toLowerCase()) return { ok: false, reason: "email" };
    try {
      await cancelAllNow(ctx, userId);
    } catch (e) {
      console.error(`[compte] fermeture refusée, abonnement non résilié : ${String(e).slice(0, 300)}`);
      return { ok: false, reason: "resiliation" };
    }
    const erased: boolean = await ctx.runMutation(internal.users.eraseAccount, { userId });
    return erased ? { ok: true } : { ok: false, reason: "resiliation" };
  },
});

/** L'effacement lui-même, une fois l'abonnement résilié ; refusé (false) si une adhésion prélevée est arrivée entre-temps. */
export const eraseAccount = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }): Promise<boolean> => {
    const subs = await ctx.db.query("subscriptions").withIndex("by_user", (q) => q.eq("userId", userId)).collect();
    if (subs.some((s) => hasAccess(s) && !s.cancelAtPeriodEnd)) return false;
    for (const row of await ctx.db.query("saved").withIndex("by_user_key", (q) => q.eq("userId", userId)).collect()) {
      await ctx.db.delete(row._id);
    }
    for (const row of await ctx.db.query("checkoutLinks").withIndex("by_user_key", (q) => q.eq("userId", userId)).collect()) {
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
    return true;
  },
});

// ─── Réglages : mot de passe et e-mail (19/11) ───
// Erreurs lisibles par le site (ConvexError avec un code), comme à la connexion (convex/auth.ts).
const PASSWORD = "password";
const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const failWith = (code: string) => new ConvexError({ code });

/** L'e-mail du compte et l'existence d'un identifiant « mot de passe » (sinon : compte Google seul). */
export const credentialsOf = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    const account = await ctx.db.query("authAccounts").withIndex("userIdAndProvider", (q) => q.eq("userId", userId).eq("provider", PASSWORD)).first();
    return { email: user?.email ?? null, login: account?.providerAccountId ?? null };
  },
});

/** Vérifie le mot de passe actuel (même limite de tentatives que la connexion) ; erreur lisible sinon. */
async function checkPassword(ctx: ActionCtx, login: string, secret: string) {
  try {
    const found = await retrieveAccount(ctx, { provider: PASSWORD, account: { id: login, secret } });
    if (found === null) throw failWith("mot_de_passe_faux");
  } catch (e) {
    if (e instanceof ConvexError) throw e;
    const m = e instanceof Error ? e.message : String(e);
    if (m.includes("TooManyFailedAttempts")) throw failWith("trop_de_tentatives");
    throw failWith("mot_de_passe_faux");
  }
}

/** Change le mot de passe (Réglages › Sécurité) ; les autres appareils sont déconnectés. Rend leur nombre. */
export const changePassword = action({
  args: { current: v.string(), next: v.string() },
  handler: async (ctx, { current, next }): Promise<number> => {
    const userId = await liveUserIdInAction(ctx);
    if (userId === null) throw failWith("non_connecte");
    if (next.length < 8 || next.length > 128) throw failWith("mot_de_passe_trop_court");
    if (next === current) throw failWith("mot_de_passe_identique");
    const { login } = await ctx.runQuery(internal.users.credentialsOf, { userId });
    if (!login) throw failWith("compte_sans_mot_de_passe");
    await checkPassword(ctx, login, current);
    await modifyAccountCredentials(ctx, { provider: PASSWORD, account: { id: login, secret: next } });
    return await ctx.runMutation(internal.users.closeOtherSessions, { userId, keep: (await getAuthSessionId(ctx)) ?? null });
  },
});

/**
 * Remise d'un mot de passe par le support (audit S11, S13), tant que « mot de passe oublié » n'existe pas faute d'envoi
 * d'e-mails. Après vérification de l'identité hors de l'app : `npx convex run --prod users:resetPassword
 * '{"email":"…","password":"…"}'`. Toutes les sessions du compte sont fermées, et les compteurs d'échecs de connexion
 * remis à zéro : un compte bloqué par les essais d'un tiers (S13) se rouvre ainsi.
 */
export const resetPassword = internalAction({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, { email, password }): Promise<{ ok: boolean; raison?: string; sessionsFermees?: number }> => {
    if (password.length < 8 || password.length > 128) return { ok: false, raison: "8 à 128 caractères" };
    const found: { userId: Id<"users">; login: string } | null = await ctx.runQuery(internal.users.passwordLogin, { email: email.trim().toLowerCase() });
    if (!found) return { ok: false, raison: "aucun compte « mot de passe » avec cet e-mail" };
    await modifyAccountCredentials(ctx, { provider: PASSWORD, account: { id: found.login, secret: password } });
    const closed: number = await ctx.runMutation(internal.users.closeOtherSessions, { userId: found.userId, keep: null });
    await ctx.runMutation(internal.users.clearSignInLimits, { userId: found.userId, key: await signInKey(found.login) });
    return { ok: true, sessionsFermees: closed };
  },
});

/** L'identifiant « mot de passe » d'un e-mail, et son compte. */
export const passwordLogin = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const account = await ctx.db.query("authAccounts").withIndex("providerAndAccountId", (q) => q.eq("provider", PASSWORD).eq("providerAccountId", email)).first();
    return account ? { userId: account.userId, login: account.providerAccountId } : null;
  },
});

/** Remet à zéro les compteurs d'échecs de connexion d'un compte : celui de Convex Auth et le nôtre (par e-mail). */
export const clearSignInLimits = internalMutation({
  args: { userId: v.id("users"), key: v.string() },
  handler: async (ctx, { userId, key }) => {
    for (const a of await ctx.db.query("authAccounts").withIndex("userIdAndProvider", (q) => q.eq("userId", userId)).collect()) {
      for (const r of await ctx.db.query("authRateLimits").withIndex("identifier", (q) => q.eq("identifier", a._id)).collect()) await ctx.db.delete(r._id);
    }
    const mine = await ctx.db.query("authLimits").withIndex("by_key", (q) => q.eq("key", key)).first();
    if (mine) await ctx.db.delete(mine._id);
  },
});

export const closeOtherSessions = internalMutation({
  args: { userId: v.id("users"), keep: v.union(v.id("authSessions"), v.null()) },
  handler: async (ctx, { userId, keep }) => {
    let closed = 0;
    for (const s of await ctx.db.query("authSessions").withIndex("userId", (q) => q.eq("userId", userId)).collect()) {
      if (s._id === keep) continue;
      await dropSession(ctx, s._id);
      closed++;
    }
    return closed;
  },
});

/**
 * Change l'e-mail (Réglages › Profil) : mot de passe exigé, adresse libre ; l'identifiant de connexion suit. L'adresse
 * n'est pas encore confirmée par un lien (pas d'envoi d'e-mails avant le domaine) : « Vérifiée » disparaît.
 */
export const changeEmail = action({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, a): Promise<string> => {
    const userId = await liveUserIdInAction(ctx);
    if (userId === null) throw failWith("non_connecte");
    const email = a.email.trim().toLowerCase();
    if (!EMAIL_OK.test(email)) throw failWith("email_invalide");
    const { email: before, login } = await ctx.runQuery(internal.users.credentialsOf, { userId });
    if (!login) throw failWith("compte_sans_mot_de_passe");
    if (email === (before ?? "").toLowerCase()) throw failWith("email_identique");
    await checkPassword(ctx, login, a.password);
    const r = await ctx.runMutation(internal.users.applyEmail, { userId, email });
    if (r !== "ok") throw failWith(r);
    return email;
  },
});

export const applyEmail = internalMutation({
  args: { userId: v.id("users"), email: v.string() },
  handler: async (ctx, { userId, email }): Promise<string> => {
    const taken = (await ctx.db.query("users").withIndex("email", (q) => q.eq("email", email)).first())
      ?? (await ctx.db.query("authAccounts").withIndex("providerAndAccountId", (q) => q.eq("provider", PASSWORD).eq("providerAccountId", email)).first());
    if (taken && (("userId" in taken ? taken.userId : taken._id) !== userId)) return "email_pris";
    const account = await ctx.db.query("authAccounts").withIndex("userIdAndProvider", (q) => q.eq("userId", userId).eq("provider", PASSWORD)).first();
    if (!account) return "compte_sans_mot_de_passe";
    await ctx.db.patch(account._id, { providerAccountId: email });
    await ctx.db.patch(userId, { email, emailVerificationTime: undefined });
    return "ok";
  },
});
