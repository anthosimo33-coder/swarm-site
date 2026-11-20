import Google from "@auth/core/providers/google";
import { ConvexCredentials } from "@convex-dev/auth/providers/ConvexCredentials";
import { convexAuth, createAccount, retrieveAccount } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";
import { Scrypt } from "lucia";
import { AUTH_ERRORS, type AuthErrorCode } from "./authErrors";
import { internal } from "./_generated/api";

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
