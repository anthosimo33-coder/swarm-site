// Pont entre les formulaires générés depuis le canevas (Connexion, Inscription) et
// Convex Auth. Les pages ne connaissent pas Convex : elles reçoivent un objet `auth`
// par leurs props. Sur le canevas, il manque et les pages gardent leur comportement de maquette.
// L'app (src/app/main.js) réutilise le même client et le même montage.
import { h, render } from 'preact';
import { useEffect, useMemo } from 'preact/hooks';
import { ConvexReactClient, useConvexAuth } from 'convex/react';
import { ConvexAuthProvider, useAuthActions } from '@convex-dev/auth/react';
import { ConvexError } from 'convex/values';
import { AUTH_ERRORS } from '../convex/authErrors.ts';

const client = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

// Où arrive une personne connectée : l'app.
export const APP_HOME = '/app';

const MESSAGES = {
  [AUTH_ERRORS.EMAIL_INVALIDE]: 'Cette adresse e-mail n’est pas valide.',
  [AUTH_ERRORS.MOT_DE_PASSE_TROP_COURT]: 'Ton mot de passe doit faire au moins 8 caractères.',
  [AUTH_ERRORS.IDENTIFIANTS_INCORRECTS]: 'E-mail ou mot de passe incorrect.',
  [AUTH_ERRORS.COMPTE_EXISTANT]: 'Un compte existe déjà avec cet e-mail.',
  [AUTH_ERRORS.TROP_DE_TENTATIVES]: 'Trop de tentatives. Réessaie dans quelques minutes.',
};
const UNKNOWN = 'Ça n’a pas marché. Réessaie dans un instant.';
const GOOGLE_FAILED = 'La connexion avec Google n’a pas marché. Réessaie, ou passe par ton e-mail.';

function failure(error, fallback = UNKNOWN) {
  const code = error instanceof ConvexError ? error.data?.code ?? null : null;
  return { code, message: MESSAGES[code] ?? fallback };
}

export const mount = (child) => render(h(ConvexAuthProvider, { client }, child), document.getElementById('app'));

/** Connexion et inscription : une fois connectée (ou déjà connectée), la personne entre dans l'app. */
function AuthPage({ Page }) {
  const { signIn } = useAuthActions();
  const { isLoading, isAuthenticated } = useConvexAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) window.location.replace(APP_HOME);
  }, [isLoading, isAuthenticated]);

  // Chaque action rend null si elle a réussi, sinon { code, message } à afficher.
  const auth = useMemo(() => ({
    async password(flow, email, password) {
      try {
        await signIn('password', { flow, email, password });
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

  return h(Page, { auth });
}

export const mountAuthPage = (Page) => mount(h(AuthPage, { Page }));
