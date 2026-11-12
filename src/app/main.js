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
    // ⌘K / Ctrl+K : chaque écran a un déclencheur [data-cmdk] qui ouvre la palette de recherche
    // (un artboard n'a pas le droit d'écouter le clavier globalement, l'app le fait pour lui).
    const onKey = (event) => {
      if ((event.metaKey || event.ctrlKey) && !event.altKey && event.key.toLowerCase() === 'k') {
        const trigger = document.querySelector('[data-cmdk]');
        if (trigger) {
          event.preventDefault();
          trigger.click();
        }
      }
    };
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    window.addEventListener('popstate', onPop);
    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('popstate', onPop);
    };
  }, []);

  // Une fois le premier écran affiché, les autres se téléchargent en arrière-plan :
  // la navigation devient instantanée (sans ça, un premier passage attend son fichier).
  const prefetched = useRef(false);
  useEffect(() => {
    if (!screen || prefetched.current) return undefined;
    prefetched.current = true;
    const timer = setTimeout(() => Object.values(ROUTES).forEach((route) => route.load().catch(() => {})), 1200);
    return () => clearTimeout(timer);
  }, [screen]);

  // Arrivée sur un écran : en haut, ou sur l'ancre demandée (ex. /app/apps/astra-ai#fa-vid).
  useEffect(() => {
    if (!screen) return;
    const id = decodeURIComponent(window.location.hash.slice(1));
    const target = id && document.getElementById(id);
    if (target) target.scrollIntoView();
    else window.scrollTo(0, 0);
  }, [screen]);

  const user = useMemo(() => (viewer ? toUser(viewer) : null), [viewer]);
  const known = user !== null;

  // Écran de l'adresse courante, chargé à la demande, une fois la personne reconnue
  // (rien à charger pour quelqu'un que la garde renvoie à la connexion).
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
    if (!known) return undefined;
    let current = true;
    route.load().then(
      (module) => {
        if (!current) return;
        document.title = `${route.title} · Swarm`;
        setScreen({ path, Page: module.default });
      },
      () => {
        // Fichier de l'écran introuvable (un déploiement est passé depuis l'ouverture) : on recharge.
        if (current && !leaving.current) window.location.assign(window.location.href);
      },
    );
    return () => {
      current = false;
    };
  }, [path, known]);

  // Rien tant qu'on ne sait pas qui est là : pas d'écran qui clignote.
  if (!user || !screen) return null;
  return h(screen.Page, { key: screen.path, user, signOut: leave });
}

mount(h(App, null));
