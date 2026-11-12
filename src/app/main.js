// L'app Swarm : réservée aux personnes connectées, une seule page à routes internes.
// La session n'est vérifiée qu'une fois ; passer d'un écran à l'autre ne recharge rien.
// Les écrans viennent du canevas de l'app (design/app, convertis par scripts/dc2preact.py)
// et reçoivent par leurs props la personne connectée (`user`) et `signOut`.
import { h } from 'preact';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { useConvexAuth, useQuery } from 'convex/react';
import { useAuthActions } from '@convex-dev/auth/react';
import { api } from '../../convex/_generated/api.js';
import { mount } from '../auth.js';
import { ROUTES } from './routes.js';
import '../styles/ds/tokens.css';
import '../styles/ds/bundle.css';
import './app.css';

const HOME = '/app';
const SIGN_OUT = '/app/deconnexion';
const clean = (path) => (path.length > 1 ? path.replace(/\/+$/, '') : path);

/** Ce que les écrans savent de la personne : prénom (si Google l'a donné), e-mail, initiale. */
function toUser(viewer) {
  const email = viewer.email ?? '';
  const prenom = viewer.name ? viewer.name.trim().split(/\s+/)[0] : null;
  return { prenom, email, initiale: (prenom || email || '?').charAt(0).toUpperCase() };
}

function App() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();
  const viewer = useQuery(api.users.viewer, isAuthenticated ? {} : 'skip');
  const [path, setPath] = useState(clean(window.location.pathname));
  const [screen, setScreen] = useState(null);
  const leaving = useRef(false);

  const leave = async () => {
    leaving.current = true;
    await signOut();
    window.location.replace('/');
  };

  // Garde : pas connecté, ou compte disparu -> connexion.
  useEffect(() => {
    if (leaving.current) return;
    if (!isLoading && !isAuthenticated) window.location.replace('/connexion');
    else if (viewer === null) void signOut();
  }, [isLoading, isAuthenticated, viewer]);

  // Liens internes à l'app : on change d'écran sans recharger la page.
  useEffect(() => {
    const onClick = (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target.closest && event.target.closest('a[href]');
      if (!link || (link.target && link.target !== '_self') || link.hasAttribute('download')) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || !(url.pathname === HOME || url.pathname.startsWith(HOME + '/'))) return;
      const next = clean(url.pathname);
      if (next === clean(window.location.pathname)) {
        if (!url.hash) event.preventDefault(); // « # » : pas encore branché, on reste
        return; // ancre de la même page : le navigateur s'en charge
      }
      event.preventDefault();
      window.history.pushState(null, '', next + url.search + url.hash);
      setPath(next);
    };
    const onPop = () => setPath(clean(window.location.pathname));
    document.addEventListener('click', onClick);
    window.addEventListener('popstate', onPop);
    return () => {
      document.removeEventListener('click', onClick);
      window.removeEventListener('popstate', onPop);
    };
  }, []);

  // Écran de l'adresse courante, chargé à la demande.
  useEffect(() => {
    if (path === SIGN_OUT) {
      void leave();
      return undefined;
    }
    const route = ROUTES[path];
    if (!route) {
      window.history.replaceState(null, '', HOME);
      setPath(HOME);
      return undefined;
    }
    let current = true;
    route.load().then((module) => {
      if (!current) return;
      document.title = `${route.title} · Swarm`;
      setScreen({ path, Page: module.default });
      window.scrollTo(0, 0);
    });
    return () => {
      current = false;
    };
  }, [path]);

  const user = useMemo(() => (viewer ? toUser(viewer) : null), [viewer]);

  // Rien tant qu'on ne sait pas qui est là : pas d'écran qui clignote.
  if (!user || !screen) return null;
  return h(screen.Page, { key: screen.path, user, signOut: leave });
}

mount(h(App, null));
