import Google from "@auth/core/providers/google";
import { ConvexCredentials } from "@convex-dev/auth/providers/ConvexCredentials";
import { convexAuth, createAccount, retrieveAccount } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";
import { Scrypt } from "lucia";
import { AUTH_ERRORS, type AuthErrorCode } from "./authErrors";
import { signInKey } from "./authLimits";
import { internal } from "./_generated/api";
import type { MutationCtx } from "./_generated/server";

/**
 * Authentification de Swarm : e-mail + mot de passe, et Google.
 *
 * Le fournisseur « password » est écrit ici, sur l'API publique de Convex Auth
 * (ConvexCredentials + createAccount / retrieveAccount), plutôt que pris tel quel
 * (provider Password) : celui-ci signale « mauvais mot de passe », « compte
 * inconnu » ou « compte déjà existant » par des `Error` ordinaires, et Convex
 * MASQUE le message des erreurs ordinaires en production (le navigateur ne reçoit
 * que « Server Error »). Ici, ces cas deviennent des `ConvexError` portant un code
 * stable (authErrors.ts), qui traverse jusqu'au site.
 *
 * Hachage : Scrypt de Lucia, le même que le provider Password.
 */

const PROVIDER = "password";
// Assez permissif pour ne refuser aucune adresse réelle.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 128;
/**
 * Inscriptions par mot de passe, tous e-mails confondus : 300 essais par tranche de 10 min au plus (audit du 19/11, S1
 * et S8). Bien au-delà d'un afflux réel à ce jour (18 comptes en tout le 19/11) : seule une création de comptes en
 * masse par script s'y heurte. Convex ne voit pas l'adresse IP : la limite ne peut pas être par personne.
 */
const SIGNUP_MAX = 300;
const SIGNUP_WINDOW_MS = 10 * 60_000;
/**
 * Connexion (audit S12) : 10 échecs par heure et par e-mail (haché), adresse inscrite ou non. Avant, seule une adresse
 * inscrite finissait sur « trop de tentatives » (limite de Convex Auth, par compte), et une adresse inconnue répondait
 * sans calcul de mot de passe : les deux trahissaient qui a un compte. Une connexion réussie remet le compteur à zéro.
 */
const SIGNIN_MAX = 10;
const SIGNIN_WINDOW_MS = 60 * 60_000;
/** Même calcul qu'une vraie vérification (Scrypt), pour une adresse inconnue : la durée ne dit plus rien (audit S12). */
let dummyHash: Promise<string> | null = null;
const dummyVerify = async (secret: string) => {
  dummyHash ??= new Scrypt().hash("kopycat:aucun-compte");
  await new Scrypt().verify(await dummyHash, secret);
};

const fail = (code: AuthErrorCode) => new ConvexError({ code });

/** Message interne de Convex Auth -> code lisible par le site. */
function translate(error: unknown): unknown {
  if (error instanceof ConvexError) return error;
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes("TooManyFailedAttempts")) return fail(AUTH_ERRORS.TROP_DE_TENTATIVES);
  // createAccount sur un compte créé entre-temps (deux inscriptions au même instant) : refusé comme un compte existant.
  if (message.includes("already exists")) return fail(AUTH_ERRORS.COMPTE_EXISTANT);
  // Même réponse pour « compte inconnu » et « mauvais mot de passe » :
  // ne pas révéler quelles adresses ont un compte.
  if (message.includes("InvalidSecret") || message.includes("InvalidAccountId")) {
    return fail(AUTH_ERRORS.IDENTIFIANTS_INCORRECTS);
  }
  return error;
}

/**
 * Un compte « mot de passe » existe-t-il pour cet e-mail ? Demandé SANS secret : Convex Auth ne vérifie alors aucun mot
 * de passe et ne touche pas au compteur d'échecs (@convex-dev/auth 0.0.96, retrieveAccountWithCredentials.js:22-35).
 * Seule l'erreur InvalidAccountId veut dire « absent » ; toute autre erreur remonte (une panne passagère lue comme
 * « absent » renverrait vers createAccount, qui, lui, vérifie le mot de passe d'un compte existant).
 */
async function passwordAccountExists(ctx: Parameters<typeof retrieveAccount>[0], email: string): Promise<boolean> {
  try {
    await retrieveAccount(ctx, { provider: PROVIDER, account: { id: email } });
    return true;
  } catch (error) {
    if (error instanceof Error && error.message === "InvalidAccountId") return false;
    throw error;
  }
}

const password = ConvexCredentials({
  id: PROVIDER,
  authorize: async (params, ctx) => {
    const email = String(params.email ?? "").trim().toLowerCase();
    const secret = String(params.password ?? "");
    if (!EMAIL.test(email)) throw fail(AUTH_ERRORS.EMAIL_INVALIDE);
    try {
      if (params.flow === "signUp") {
        if (secret.length < PASSWORD_MIN || secret.length > PASSWORD_MAX) {
          throw fail(AUTH_ERRORS.MOT_DE_PASSE_TROP_COURT);
        }
        if (!(await ctx.runMutation(internal.authLimits.hit, { key: "signUp", max: SIGNUP_MAX, windowMs: SIGNUP_WINDOW_MS }))) {
          throw fail(AUTH_ERRORS.TROP_DE_TENTATIVES);
        }
        // Audit du 19/11, S1 : sur un e-mail déjà inscrit, createAccount vérifiait le mot de passe et CONNECTAIT si c'était
        // le bon, sans passer par la limite de 10 échecs par heure de signIn — un essai de mots de passe illimité. Un
        // compte existant est désormais refusé sans jamais regarder le mot de passe : la personne passe par « Se connecter ».
        if (await passwordAccountExists(ctx, email)) throw fail(AUTH_ERRORS.COMPTE_EXISTANT);
        const { user } = await createAccount(ctx, {
          provider: PROVIDER,
          account: { id: email, secret },
          profile: { email },
        });
        return { userId: user._id };
      }
      if (params.flow === "signIn") {
        const key = await signInKey(email);
        if (await ctx.runQuery(internal.authLimits.blocked, { key, max: SIGNIN_MAX, windowMs: SIGNIN_WINDOW_MS })) {
          throw fail(AUTH_ERRORS.TROP_DE_TENTATIVES);
        }
        let found;
        try {
          found = await retrieveAccount(ctx, { provider: PROVIDER, account: { id: email, secret } });
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          if (message.includes("InvalidAccountId")) await dummyVerify(secret);
          if (message.includes("InvalidAccountId") || message.includes("InvalidSecret")) {
            await ctx.runMutation(internal.authLimits.hit, { key, max: SIGNIN_MAX, windowMs: SIGNIN_WINDOW_MS });
          }
          throw error;
        }
        if (found === null) throw fail(AUTH_ERRORS.IDENTIFIANTS_INCORRECTS);
        await ctx.runMutation(internal.authLimits.clear, { key });
        return { userId: found.user._id };
      }
      throw new Error(`Flow inconnu : ${String(params.flow)}`);
    } catch (error) {
      throw translate(error);
    }
  },
  crypto: {
    hashSecret: (secret) => new Scrypt().hash(secret),
    verifySecret: (secret, hash) => new Scrypt().verify(hash, secret),
  },
});

// Google lit AUTH_GOOGLE_ID et AUTH_GOOGLE_SECRET dans l'environnement du déploiement.
// Tant qu'ils n'y sont pas, Google reste éteint : le bouton affiche un message au
// lieu d'envoyer la personne sur une page d'erreur de Google.
const googleReady = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);

/**
 * Audit S23 (décision du 20/11) : 3 appareils connectés au plus par compte. Avant chaque nouvelle session, les plus
 * anciennes sessions vivantes au-delà de 2 sont fermées, avec leurs jetons de renouvellement. Avant, chaque connexion
 * ajoutait une session de 30 jours, sans jamais en fermer : un compte se partageait sans limite.
 */
const MAX_SESSIONS = 3;

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: googleReady ? [password, Google] : [password],
  callbacks: {
    async beforeSessionCreation(anyCtx, { userId }) {
      const ctx = anyCtx as unknown as MutationCtx; // le crochet reçoit un contexte générique : c'est celui de auth:store
      const now = Date.now();
      const live = (await ctx.db.query("authSessions").withIndex("userId", (q) => q.eq("userId", userId)).collect())
        .filter((s) => s.expirationTime > now)
        .sort((a, b) => a._creationTime - b._creationTime);
      for (const s of live.slice(0, Math.max(0, live.length - (MAX_SESSIONS - 1)))) {
        for (const t of await ctx.db.query("authRefreshTokens").withIndex("sessionId", (q) => q.eq("sessionId", s._id)).collect()) {
          await ctx.db.delete(t._id);
        }
        await ctx.db.delete(s._id);
      }
    },
  },
});
