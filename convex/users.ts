import { getAuthSessionId, modifyAccountCredentials, retrieveAccount } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { liveUserId, liveUserIdInAction } from "./session";
import { cancelAllNow, hasAccess, recomputePro } from "./whop";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { action, internalAction, internalMutation, internalQuery, mutation, query, type ActionCtx, type MutationCtx } from "./_generated/server";
import { signInKey } from "./authLimits";
import { passwordVerdict } from "./passwordPolicy";

const PASSWORD = "password";

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
    // `name` : le prénom choisi (displayName, audit Q36), sinon le nom Google. `password` : le compte a un identifiant « mot
    // de passe » (Réglages le demande pour fermer le compte, audit S27).
    const login = await ctx.db.query("authAccounts").withIndex("userIdAndProvider", (q) => q.eq("userId", userId).eq("provider", PASSWORD)).first();
    return { email: user.email ?? null, name: user.displayName ?? user.name ?? null, pro: user.pro === true, emailVerified: !!user.emailVerificationTime,
      password: !!login };
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
    // Audit S14 : deux comptes sur une adresse (mot de passe puis Google) : refus, au lieu de servir le plus ancien.
    const users = await ctx.db.query("users").withIndex("email", (q) => q.eq("email", email.trim().toLowerCase())).take(2);
    if (users.length !== 1) return { found: false, ambiguous: users.length > 1 };
    const user = users[0];
    await ctx.db.patch(user._id, { proManual: pro ?? undefined });
    return { found: true, pro: await recomputePro(ctx, user._id) };
  },
});

/** Un compte porte-t-il déjà cette adresse (quel que soit son fournisseur) ? */
export const emailTaken = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, { email }) => !!(await ctx.db.query("users").withIndex("email", (q) => q.eq("email", email)).first()),
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

/**
 * Le prénom nettoyé : espaces ramenés à un, caractères invisibles de mise en forme retirés (audit Q38 : un U+200B passait
 * et donnait un prénom vide à l'écran) sauf le liant des émojis composés (U+200D), 40 caractères au plus.
 */
export const cleanName = (name: string) =>
  Array.from(name.replace(/(?!\u200D)\p{Cf}/gu, "").replace(/\s+/g, " ").trim()).slice(0, 40).join("").replace(/^\u200D+|\u200D+$/g, "").trim();

/**
 * Le prénom affiché dans l'app (Réglages › Profil). Vide : l'app retombe sur l'e-mail. Rangé dans displayName (audit
 * Q36) : `name` est réécrit par Convex Auth avec le nom Google à chaque connexion Google.
 */
export const setName = mutation({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    const userId = await liveUserId(ctx);
    if (userId === null) throw new Error("Non connecté");
    const clean = cleanName(name);
    await ctx.db.patch(userId, { displayName: clean || undefined });
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

/** Une session récente suffit à un compte Google seul pour fermer son compte (audit S27). */
export const RECENT_LOGIN_MS = 10 * 60_000;
type DeleteRefusal = "email" | "motdepasse" | "tentatives" | "reconnexion" | "resiliation";

/** Depuis quand la session de cet appareil existe (null si inconnue). */
export const sessionCreatedAt = internalQuery({
  args: { sessionId: v.id("authSessions") },
  handler: async (ctx, { sessionId }) => (await ctx.db.get(sessionId))?._creationTime ?? null,
});

/**
 * Ferme le compte (Réglages › Profil). Il faut retaper son e-mail, et prouver qu'on est la personne (audit S27, 19/11 :
 * l'e-mail, affiché juste au-dessus du champ, suffisait à quiconque tenait une session volée ou un appareil prêté) : son
 * mot de passe pour un compte « mot de passe » (même limite d'essais que la connexion), une connexion de moins de
 * 10 minutes pour un compte Google seul. Sinon rien n'est effacé ({ ok: false, reason }).
 * Audit du 19/11, S2 : l'abonnement Whop est d'abord résilié tout de suite (convex/whop.ts, cancelAllNow) ; avant, le
 * compte était effacé et Whop continuait de prélever une personne sans compte. Si Whop ne confirme pas, rien n'est
 * effacé (reason "resiliation"). Puis ce que la personne garde (`saved`), ses sessions, ses identifiants, ses compteurs
 * d'échecs et le compte. Irréversible. Une action : une mutation ne peut pas appeler Whop.
 */
export const deleteAccount = action({
  args: { email: v.string(), password: v.optional(v.string()) },
  handler: async (ctx, { email, password }): Promise<{ ok: boolean; reason?: DeleteRefusal }> => {
    const userId = await liveUserIdInAction(ctx);
    if (userId === null) throw new Error("Non connecté");
    const { email: mine, login } = await ctx.runQuery(internal.users.credentialsOf, { userId });
    if (!mine || email.trim().toLowerCase() !== mine.trim().toLowerCase()) return { ok: false, reason: "email" };
    if (login) {
      if (!password) return { ok: false, reason: "motdepasse" };
      try {
        await checkPassword(ctx, login, password);
      } catch (e) {
        return { ok: false, reason: e instanceof ConvexError && e.data?.code === "trop_de_tentatives" ? "tentatives" : "motdepasse" };
      }
    } else {
      const sessionId = await getAuthSessionId(ctx);
      const since: number | null = sessionId ? await ctx.runQuery(internal.users.sessionCreatedAt, { sessionId }) : null;
      if (since === null || Date.now() - since > RECENT_LOGIN_MS) return { ok: false, reason: "reconnexion" };
    }
    try {
      await cancelAllNow(ctx, userId);
    } catch (e) {
      console.error(`[compte] fermeture refusée, abonnement non résilié : ${String(e).slice(0, 300)}`);
      return { ok: false, reason: "resiliation" };
    }
    // Les compteurs d'échecs liés à ce compte (connexion par e-mail haché, liens de paiement, écritures) partent aussi.
    const limitKeys = [`checkout:${userId}`, `saved:${userId}`, ...(login ? [await signInKey(login)] : [])];
    const erased: boolean = await ctx.runMutation(internal.users.eraseAccount, { userId, limitKeys });
    if (!erased) return { ok: false, reason: "resiliation" };
    // L'adresse lue avant l'effacement : le compte n'existe plus quand l'e-mail part.
    await ctx.scheduler.runAfter(0, internal.mail.sendAccountClosed, { to: mine, at: Date.now() });
    return { ok: true };
  },
});

/** L'effacement lui-même, une fois l'abonnement résilié ; refusé (false) si une adhésion prélevée est arrivée entre-temps. */
export const eraseAccount = internalMutation({
  args: { userId: v.id("users"), limitKeys: v.optional(v.array(v.string())) },
  handler: async (ctx, { userId, limitKeys }): Promise<boolean> => {
    const subs = await ctx.db.query("subscriptions").withIndex("by_user", (q) => q.eq("userId", userId)).collect();
    if (subs.some((s) => hasAccess(s) && !s.cancelAtPeriodEnd)) return false;
    for (const row of await ctx.db.query("saved").withIndex("by_user_key", (q) => q.eq("userId", userId)).collect()) {
      await ctx.db.delete(row._id);
    }
    for (const row of await ctx.db.query("checkoutLinks").withIndex("by_user_key", (q) => q.eq("userId", userId)).collect()) {
      await ctx.db.delete(row._id);
    }
    // Un changement d'adresse en attente (son lien ne mènerait plus à rien).
    for (const row of await ctx.db.query("emailChanges").withIndex("by_user", (q) => q.eq("userId", userId)).collect()) {
      await ctx.db.delete(row._id);
    }
    // Le compteur de pages (convex/boardQuota.ts, audit S22).
    for (const row of await ctx.db.query("pageQuota").withIndex("by_user", (q) => q.eq("userId", userId)).collect()) {
      await ctx.db.delete(row._id);
    }
    for (const s of await ctx.db.query("authSessions").withIndex("userId", (q) => q.eq("userId", userId)).collect()) {
      await dropSession(ctx, s._id);
    }
    for (const a of await ctx.db.query("authAccounts").withIndex("userIdAndProvider", (q) => q.eq("userId", userId)).collect()) {
      for (const c of await ctx.db.query("authVerificationCodes").withIndex("accountId", (q) => q.eq("accountId", a._id)).collect()) {
        await ctx.db.delete(c._id);
      }
      // Le compteur d'échecs de Convex Auth, par identifiant (audit S27 : il restait orphelin).
      for (const r of await ctx.db.query("authRateLimits").withIndex("identifier", (q) => q.eq("identifier", a._id)).collect()) await ctx.db.delete(r._id);
      await ctx.db.delete(a._id);
    }
    for (const key of limitKeys ?? []) {
      const row = await ctx.db.query("authLimits").withIndex("by_key", (q) => q.eq("key", key)).first();
      if (row) await ctx.db.delete(row._id);
    }
    await ctx.db.delete(userId);
    return true;
  },
});

// ─── Réglages : mot de passe et e-mail (19/11) ───
// Erreurs lisibles par le site (ConvexError avec un code), comme à la connexion (convex/auth.ts).
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
    if (next === current) throw failWith("mot_de_passe_identique");
    const { login } = await ctx.runQuery(internal.users.credentialsOf, { userId });
    if (!login) throw failWith("compte_sans_mot_de_passe");
    // Audit S28 : la même règle qu'à l'inscription (trop court, trop long, trop courant).
    const verdict = passwordVerdict(next, login);
    if (verdict !== "ok") throw failWith(`mot_de_passe_${verdict}`);
    await checkPassword(ctx, login, current);
    await modifyAccountCredentials(ctx, { provider: PASSWORD, account: { id: login, secret: next } });
    const closed: number = await ctx.runMutation(internal.users.closeOtherSessions, { userId, keep: (await getAuthSessionId(ctx)) ?? null });
    await ctx.scheduler.runAfter(0, internal.mail.sendPasswordChanged, { to: login, at: Date.now() });
    return closed;
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
    const found: { userId: Id<"users">; login: string } | null = await ctx.runQuery(internal.users.passwordLogin, { email: email.trim().toLowerCase() });
    const verdict = passwordVerdict(password, email);
    if (verdict !== "ok") return { ok: false, raison: verdict === "trop_courant" ? "mot de passe trop courant" : "8 à 128 caractères" };
    if (!found) return { ok: false, raison: "aucun compte « mot de passe » avec cet e-mail" };
    await modifyAccountCredentials(ctx, { provider: PASSWORD, account: { id: found.login, secret: password } });
    const closed: number = await ctx.runMutation(internal.users.closeOtherSessions, { userId: found.userId, keep: null });
    await ctx.runMutation(internal.users.clearSignInLimits, { userId: found.userId, key: await signInKey(found.login) });
    await ctx.scheduler.runAfter(0, internal.mail.sendPasswordChanged, { to: found.login, at: Date.now() });
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

// ─── Changer d'adresse (24/11, maquettes AdrA1-A4 du canevas « Swarm sans abonnement ») ───
// La nouvelle adresse ne remplace l'ancienne qu'une fois confirmée : un lien part vers elle (24 heures), et la page
// /confirmer-adresse l'applique d'un clic (pas à l'ouverture : les antivirus de messagerie ouvrent les liens). Puis
// l'ancienne adresse est prévenue. Avant le 24/11, l'adresse changeait tout de suite, sans vérifier qu'elle existe.

export const EMAIL_LINK_TTL_MS = 24 * 60 * 60_000;
/** Liens demandés par compte (demande et renvoi) : 5 par heure, pour que Kopycat ne serve pas à écrire à n'importe qui. */
const EMAIL_LINK_MAX = 5;
const EMAIL_LINK_WINDOW_MS = 60 * 60_000;

const hexOf = (buf: ArrayBuffer) => Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
const tokenHash = async (token: string) => hexOf(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token)));
/** 32 octets au hasard, en hexadécimal : le jeton du lien (seule son empreinte est rangée). */
function newToken(): string {
  const buf = new Uint8Array(32);
  crypto.getRandomValues(buf);
  return hexOf(buf.buffer);
}

/** Une adresse est-elle déjà prise par un AUTRE compte ? */
async function emailTakenByOther(ctx: MutationCtx, userId: Id<"users">, email: string): Promise<boolean> {
  const taken = (await ctx.db.query("users").withIndex("email", (q) => q.eq("email", email)).first())
    ?? (await ctx.db.query("authAccounts").withIndex("providerAndAccountId", (q) => q.eq("provider", PASSWORD).eq("providerAccountId", email)).first());
  return !!taken && ("userId" in taken ? taken.userId : taken._id) !== userId;
}

/**
 * Demande de changement (Réglages › Profil) : mot de passe exigé, adresse libre. Rien ne change encore : un lien part
 * vers la nouvelle adresse. Rend { pending: true, email }.
 */
export const changeEmail = action({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, a): Promise<{ pending: true; email: string }> => {
    const userId = await liveUserIdInAction(ctx);
    if (userId === null) throw failWith("non_connecte");
    const email = a.email.trim().toLowerCase();
    if (!EMAIL_OK.test(email)) throw failWith("email_invalide");
    const { email: before, login } = await ctx.runQuery(internal.users.credentialsOf, { userId });
    if (!login) throw failWith("compte_sans_mot_de_passe");
    if (email === (before ?? "").toLowerCase()) throw failWith("email_identique");
    await checkPassword(ctx, login, a.password);
    if (!(await ctx.runMutation(internal.authLimits.hit, { key: `emailLink:${userId}`, max: EMAIL_LINK_MAX, windowMs: EMAIL_LINK_WINDOW_MS }))) {
      throw failWith("trop_de_tentatives");
    }
    const token = newToken();
    const r: string = await ctx.runMutation(internal.users.requestEmailChange, { userId, email, hash: await tokenHash(token) });
    if (r !== "ok") throw failWith(r);
    await ctx.scheduler.runAfter(0, internal.mail.sendConfirmNewEmail, { to: email, from: before ?? login, token });
    return { pending: true, email };
  },
});

export const requestEmailChange = internalMutation({
  args: { userId: v.id("users"), email: v.string(), hash: v.string() },
  handler: async (ctx, { userId, email, hash }): Promise<string> => {
    if (await emailTakenByOther(ctx, userId, email)) return "email_pris";
    const account = await ctx.db.query("authAccounts").withIndex("userIdAndProvider", (q) => q.eq("userId", userId).eq("provider", PASSWORD)).first();
    if (!account) return "compte_sans_mot_de_passe";
    for (const old of await ctx.db.query("emailChanges").withIndex("by_user", (q) => q.eq("userId", userId)).collect()) await ctx.db.delete(old._id);
    await ctx.db.insert("emailChanges", { userId, email, hash, expiresAt: Date.now() + EMAIL_LINK_TTL_MS });
    return "ok";
  },
});

/** Le changement en attente de la personne connectée (Réglages l'affiche « À confirmer »), ou null. */
export const pendingEmail = query({
  args: {},
  handler: async (ctx) => {
    const userId = await liveUserId(ctx);
    if (userId === null) return null;
    const row = await ctx.db.query("emailChanges").withIndex("by_user", (q) => q.eq("userId", userId)).first();
    return row && row.expiresAt > Date.now() ? { email: row.email, expiresAt: row.expiresAt } : null;
  },
});

/** Annule le changement en attente : le lien déjà parti ne marche plus. */
export const cancelEmailChange = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await liveUserId(ctx);
    if (userId === null) throw failWith("non_connecte");
    for (const row of await ctx.db.query("emailChanges").withIndex("by_user", (q) => q.eq("userId", userId)).collect()) await ctx.db.delete(row._id);
  },
});

/** Renvoie le lien (nouveau jeton, de nouveau 24 heures) ; l'ancien lien ne marche plus. Rend l'adresse. */
export const resendEmailChange = action({
  args: {},
  handler: async (ctx): Promise<string> => {
    const userId = await liveUserIdInAction(ctx);
    if (userId === null) throw failWith("non_connecte");
    if (!(await ctx.runMutation(internal.authLimits.hit, { key: `emailLink:${userId}`, max: EMAIL_LINK_MAX, windowMs: EMAIL_LINK_WINDOW_MS }))) {
      throw failWith("trop_de_tentatives");
    }
    const token = newToken();
    const email: string | null = await ctx.runMutation(internal.users.renewEmailChange, { userId, hash: await tokenHash(token) });
    if (email === null) throw failWith("aucun_changement");
    const { email: before, login } = await ctx.runQuery(internal.users.credentialsOf, { userId });
    await ctx.scheduler.runAfter(0, internal.mail.sendConfirmNewEmail, { to: email, from: before ?? login ?? "", token });
    return email;
  },
});

export const renewEmailChange = internalMutation({
  args: { userId: v.id("users"), hash: v.string() },
  handler: async (ctx, { userId, hash }): Promise<string | null> => {
    const row = await ctx.db.query("emailChanges").withIndex("by_user", (q) => q.eq("userId", userId)).first();
    if (!row || row.expiresAt <= Date.now()) return null;
    await ctx.db.patch(row._id, { hash, expiresAt: Date.now() + EMAIL_LINK_TTL_MS });
    return row.email;
  },
});

/** La page du lien, avant le clic : les deux adresses, ou « expire » (lien inconnu, déjà servi ou trop vieux). */
export const peekEmailChange = action({
  args: { token: v.string() },
  handler: async (ctx, { token }): Promise<{ ok: true; from: string; to: string } | { ok: false; reason: "expire" }> =>
    ctx.runQuery(internal.users.emailChangeByHash, { hash: await tokenHash(token) }),
});

export const emailChangeByHash = internalQuery({
  args: { hash: v.string() },
  handler: async (ctx, { hash }): Promise<{ ok: true; from: string; to: string } | { ok: false; reason: "expire" }> => {
    const row = await ctx.db.query("emailChanges").withIndex("by_hash", (q) => q.eq("hash", hash)).first();
    if (!row || row.expiresAt <= Date.now()) return { ok: false, reason: "expire" };
    const user = await ctx.db.get(row.userId);
    if (!user) return { ok: false, reason: "expire" };
    return { ok: true, from: user.email ?? "", to: row.email };
  },
});

/** Le clic « Confirmer cette adresse » : l'adresse change, elle est vérifiée, et l'ancienne est prévenue. */
export const confirmEmailChange = action({
  args: { token: v.string() },
  handler: async (ctx, { token }): Promise<{ ok: true; email: string } | { ok: false; reason: "expire" | "email_pris" }> => {
    const r: { ok: true; from: string; to: string } | { ok: false; reason: "expire" | "email_pris" } =
      await ctx.runMutation(internal.users.applyEmailChange, { hash: await tokenHash(token) });
    if (!r.ok) return r;
    if (r.from) await ctx.scheduler.runAfter(0, internal.mail.sendEmailChanged, { to: r.from, next: r.to, at: Date.now() });
    return { ok: true, email: r.to };
  },
});

export const applyEmailChange = internalMutation({
  args: { hash: v.string() },
  handler: async (ctx, { hash }): Promise<{ ok: true; from: string; to: string } | { ok: false; reason: "expire" | "email_pris" }> => {
    const row = await ctx.db.query("emailChanges").withIndex("by_hash", (q) => q.eq("hash", hash)).first();
    if (!row) return { ok: false, reason: "expire" };
    if (row.expiresAt <= Date.now()) {
      await ctx.db.delete(row._id);
      return { ok: false, reason: "expire" };
    }
    const user = await ctx.db.get(row.userId);
    const account = await ctx.db.query("authAccounts").withIndex("userIdAndProvider", (q) => q.eq("userId", row.userId).eq("provider", PASSWORD)).first();
    if (!user || !account) {
      await ctx.db.delete(row._id);
      return { ok: false, reason: "expire" };
    }
    // Prise entre la demande et le clic (une inscription) : refusée, le lien reste pour rien.
    if (await emailTakenByOther(ctx, row.userId, row.email)) return { ok: false, reason: "email_pris" };
    const from = user.email ?? ""; // lue avant le changement : c'est elle qu'on prévient
    await ctx.db.patch(account._id, { providerAccountId: row.email });
    await ctx.db.patch(row.userId, { email: row.email, emailVerificationTime: Date.now() });
    await ctx.db.delete(row._id);
    return { ok: true, from, to: row.email };
  },
});
