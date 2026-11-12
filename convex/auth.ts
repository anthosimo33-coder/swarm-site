import Google from "@auth/core/providers/google";
import { ConvexCredentials } from "@convex-dev/auth/providers/ConvexCredentials";
import { convexAuth, createAccount, retrieveAccount } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";
import { Scrypt } from "lucia";
import { AUTH_ERRORS, type AuthErrorCode } from "./authErrors";

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

const fail = (code: AuthErrorCode) => new ConvexError({ code });

/** Message interne de Convex Auth -> code lisible par le site. */
function translate(error: unknown): unknown {
  if (error instanceof ConvexError) return error;
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes("TooManyFailedAttempts")) return fail(AUTH_ERRORS.TROP_DE_TENTATIVES);
  // Même e-mail, autre mot de passe. (Même mot de passe : Convex Auth connecte la personne.)
  if (message.includes("already exists")) return fail(AUTH_ERRORS.COMPTE_EXISTANT);
  // Même réponse pour « compte inconnu » et « mauvais mot de passe » :
  // ne pas révéler quelles adresses ont un compte.
  if (message.includes("InvalidSecret") || message.includes("InvalidAccountId")) {
    return fail(AUTH_ERRORS.IDENTIFIANTS_INCORRECTS);
  }
  return error;
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
        const { user } = await createAccount(ctx, {
          provider: PROVIDER,
          account: { id: email, secret },
          profile: { email },
        });
        return { userId: user._id };
      }
      if (params.flow === "signIn") {
        const found = await retrieveAccount(ctx, { provider: PROVIDER, account: { id: email, secret } });
        if (found === null) throw fail(AUTH_ERRORS.IDENTIFIANTS_INCORRECTS);
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

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: googleReady ? [password, Google] : [password],
});
