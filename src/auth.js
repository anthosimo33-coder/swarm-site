// Pont entre les formulaires générés depuis le canevas (Connexion, Inscription) et
// Convex Auth. Les pages ne connaissent pas Convex : elles reçoivent un objet `auth`
// par leurs props. Sur le canevas, il manque et les pages gardent leur comportement de maquette.
// L'app (src/app/main.js) réutilise le même client et le même montage.
import { h, render } from 'preact';
import { useEffect, useMemo, useState } from 'preact/hooks';
import { ConvexReactClient, useConvexAuth } from 'convex/react';
import { FALLBACK, fetchStats } from './stats.js';
import { ConvexAuthProvider, useAuthActions } from '@convex-dev/auth/react';
import { ConvexError } from 'convex/values';
import { AUTH_ERRORS } from '../convex/authErrors.ts';
import { api } from '../convex/_generated/api.js';
import { currentArm, isForced, visitorId } from './ab.js';

// Audit F27 (19/11) : au chargement, le client renvoyait tout de suite un jeton neuf après le jeton gardé, et le serveur
// ré-exécutait une seconde fois toutes les requêtes de l'onglet (une relecture complète de chaque page ouverte). Le
// jeton gardé est réutilisé jusqu'à peu avant son expiration (option de convex 1.48, marquée expérimentale ; un jeton
// refusé par le serveur est aussitôt remplacé). La durée du jeton (1 h) n'est pas allongée : liveUserId (convex/session.ts)
// ferme une session supprimée tout de suite, mais seul le jeton porte l'identité.
export const client = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL, { initialAuthTokenReuse: true });

// Où arrive une personne connectée : l'app.
export const APP_HOME = '/app';

const MESSAGES = {
  [AUTH_ERRORS.EMAIL_INVALIDE]: 'Cette adresse e-mail n’est pas valide.',
  [AUTH_ERRORS.MOT_DE_PASSE_TROP_COURT]: 'Ton mot de passe doit faire au moins 8 caractères.',
  [AUTH_ERRORS.MOT_DE_PASSE_TROP_LONG]: 'Ton mot de passe doit faire 128 caractères au plus.',
  [AUTH_ERRORS.MOT_DE_PASSE_TROP_COURANT]: 'Ce mot de passe est trop courant : choisis-en un moins facile à deviner.',
  [AUTH_ERRORS.IDENTIFIANTS_INCORRECTS]: 'E-mail ou mot de passe incorrect.',
  [AUTH_ERRORS.COMPTE_EXISTANT]: 'Un compte existe déjà avec cet e-mail.',
  [AUTH_ERRORS.TROP_DE_TENTATIVES]: 'Trop de tentatives. Réessaie dans quelques minutes.',
  [AUTH_ERRORS.CODE_EXPIRE]: 'Ce code a expiré. Demande-en un nouveau.',
  [AUTH_ERRORS.CODE_EPUISE]: 'Trop d’essais avec ce code. Demande-en un nouveau.',
};
// Mot de passe oublié : le plafond est de 3 codes par heure et par adresse (convex/passwordReset.ts).
const RESET_LIMIT = 'Trop de codes demandés pour cette adresse. Réessaie dans une heure.';
const wrongCode = (left) => `Ce code n’est pas le bon. Encore ${left} essai${left > 1 ? 's' : ''}, puis il faudra en demander un autre.`;
const UNKNOWN = 'Ça n’a pas marché. Réessaie dans un instant.';
const GOOGLE_FAILED = 'La connexion avec Google n’a pas marché. Réessaie, ou passe par ton e-mail.';

function failure(error, fallback = UNKNOWN) {
  const code = error instanceof ConvexError ? error.data?.code ?? null : null;
  if (code === AUTH_ERRORS.CODE_INVALIDE) return { code, message: wrongCode(Number(error.data?.left) || 1) };
  return { code, message: MESSAGES[code] ?? fallback };
}

export const mount = (child) => render(h(ConvexAuthProvider, { client }, child), document.getElementById('app'));

/**
 * Test A/B de l'onboarding (src/ab.js, convex/ab.ts) : à l'inscription, le bras tiré dans ce navigateur s'écrit sur le
 * compte. Le serveur ne le garde que pour un compte qui vient d'être créé : l'appeler après une connexion ne change rien.
 * N'attend pas plus d'1,5 s (la page change d'adresse juste après).
 */
export async function enrollAb() {
  const bras = currentArm();
  if (!bras) return;
  await Promise.race([
    client.mutation(api.ab.enroll, { bras, visiteur: visitorId(), ...(isForced() ? { force: true } : {}) }).catch(() => {}),
    new Promise((r) => setTimeout(r, 1500)),
  ]);
}

/** Connexion et inscription : une fois connectée (ou déjà connectée), la personne entre dans l'app. */
function AuthPage({ Page }) {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const auth = useAuthBridge();

  useEffect(() => {
    if (!isLoading && isAuthenticated) enrollAb().then(() => window.location.replace(APP_HOME));
  }, [isLoading, isAuthenticated]);

  // Les chiffres du Radar affichés à côté du formulaire (convex/stats.ts), arrondis comme sur l'accueil. Lus à part :
  // une réponse en échec laisse les chiffres connus, jamais une page de connexion cassée.
  const [stats, setStats] = useState(FALLBACK);
  useEffect(() => {
    let live = true;
    fetchStats().then((s) => live && setStats(s));
    return () => { live = false; };
  }, []);
  return h(Page, { auth, stats });
}

/**
 * Les actions de connexion et d'inscription passées aux pages (Connexion, Inscription, l'onboarding /plan). Chaque action
 * rend null si elle a réussi, sinon { code, message } à afficher.
 */
export function useAuthBridge() {
  const { signIn } = useAuthActions();
  return useMemo(() => ({
    async password(flow, email, password) {
      try {
        await signIn('password', { flow, email, password });
        return null;
      } catch (error) {
        return failure(error);
      }
    },
    // Mot de passe oublié (parcours B) : le code part par e-mail, puis il est vérifié, puis le nouveau mot de passe
    // connecte (la page passe alors dans l'app, comme après une connexion).
    async resetRequest(email) {
      try {
        await signIn('password', { flow: 'reset', email });
        return null;
      } catch (error) {
        const f = failure(error);
        return f.code === AUTH_ERRORS.TROP_DE_TENTATIVES ? { ...f, message: RESET_LIMIT } : f;
      }
    },
    async resetCheck(email, code) {
      try {
        await signIn('password', { flow: 'reset-check', email, code });
        return null;
      } catch (error) {
        return failure(error);
      }
    },
    async resetFinish(email, code, newPassword) {
      try {
        await signIn('password', { flow: 'reset-verification', email, code, newPassword });
        return null;
      } catch (error) {
        return failure(error);
      }
    },
    async google() {
      try {
        // Google renvoie sur cette même page, qui finit la connexion puis redirige.
        await signIn('google', { redirectTo: window.location.pathname });
        return null;
      } catch (error) {
        return failure(error, GOOGLE_FAILED);
      }
    },
  }), [signIn]);
}

export const mountAuthPage = (Page) => mount(h(AuthPage, { Page }));
