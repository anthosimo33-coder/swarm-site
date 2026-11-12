// Pont entre les pages générées depuis le canevas (Connexion, Inscription, Compte)
// et Convex Auth. Les pages ne connaissent pas Convex : elles reçoivent un objet
// `auth` (formulaires) ou `account` (page Mon compte) par leurs props. Sur le
// canevas, ces props manquent et les pages retombent sur leur comportement de maquette.
import { h, render } from 'preact';
import { useEffect, useMemo, useRef } from 'preact/hooks';
import { ConvexReactClient, useConvexAuth, useQuery } from 'convex/react';
import { ConvexAuthProvider, useAuthActions } from '@convex-dev/auth/react';
import { ConvexError } from 'convex/values';
import { api } from '../convex/_generated/api.js';
import { AUTH_ERRORS } from '../convex/authErrors.ts';

const client = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

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

// De retour de Google, l'adresse porte ?code=… (Convex Auth l'échange puis l'efface).
// Lu avant le montage, pendant qu'il est encore là.
const BACK_FROM_GOOGLE = new URLSearchParams(window.location.search).has('code');

const mount = (child) => render(h(ConvexAuthProvider, { client }, child), document.getElementById('app'));

/**
 * Connexion et inscription. `destination` : où aller une fois le compte ouvert
 * depuis cette page. Une personne déjà connectée qui arrive ici va sur /compte.
 */
function AuthPage({ Page, destination }) {
  const { signIn } = useAuthActions();
  const { isLoading, isAuthenticated } = useConvexAuth();
  const actedHere = useRef(BACK_FROM_GOOGLE);

  useEffect(() => {
    if (!isLoading && isAuthenticated) window.location.replace(actedHere.current ? destination : '/compte');
  }, [isLoading, isAuthenticated]);

  // Chaque action rend null si elle a réussi, sinon { code, message } à afficher.
  const auth = useMemo(() => ({
    async password(flow, email, password) {
      actedHere.current = true;
      try {
        await signIn('password', { flow, email, password });
        return null;
      } catch (error) {
        actedHere.current = BACK_FROM_GOOGLE;
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

/** Mon compte : réservée aux personnes connectées. */
function AccountPage({ Page }) {
  const { signOut } = useAuthActions();
  const { isLoading, isAuthenticated } = useConvexAuth();
  const viewer = useQuery(api.users.viewer, isAuthenticated ? {} : 'skip');
  const leaving = useRef(false);

  useEffect(() => {
    if (leaving.current) return;
    // Pas connecté, ou compte disparu : retour à la connexion.
    if (!isLoading && !isAuthenticated) window.location.replace('/connexion');
    else if (viewer === null) void signOut();
  }, [isLoading, isAuthenticated, viewer]);

  const account = useMemo(() => viewer && {
    email: viewer.email ?? '',
    async signOut() {
      leaving.current = true;
      await signOut();
      window.location.replace('/');
    },
  }, [viewer, signOut]);

  // Rien tant qu'on ne sait pas qui est là : pas d'écran qui clignote.
  return account ? h(Page, { account }) : null;
}

export const mountAuthPage = (Page, destination) => mount(h(AuthPage, { Page, destination }));
export const mountAccountPage = (Page) => mount(h(AccountPage, { Page }));
