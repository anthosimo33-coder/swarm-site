// L'app Swarm : réservée aux personnes connectées, une seule page à routes internes.
// La session n'est vérifiée qu'une fois ; passer d'un écran à l'autre ne recharge rien.
// Les écrans viennent du canevas de l'app (design/app, convertis par scripts/dc2preact.py).
// Sans abonnement (user.pro faux), l'aperçu (19/11) : Apps montre le top 3 (écran Apercu), les fiches et vidéos de
// ces 3 apps et le compte restent ouverts ; tout autre écran ouvre la fenêtre des formules (Formules). Le serveur
// n'envoie de toute façon rien d'autre (convex/boards.ts) : ce routeur ne fait que l'expliquer à l'écran.
// Chacun reçoit par ses props :
//   user    { prenom, email, initiale, pro }   signOut()   onPlans() : ouvre la fenêtre des formules
//   data    le document de son adresse (convex/boards.ts), déjà calculé depuis le Radar
//   params  les paramètres de l'adresse (ex. { slug: 'astraai' })
//   query   les paramètres de la requête (ex. { niche: 'Foi' } pour /app/apps?niche=Foi)
//   get(clé) un autre document (créateurs d'un autre marché, index de recherche…) :
//            undefined tant qu'il charge, null s'il n'existe pas.
//   saved(clé) / save(clé, valeur)  ce que la personne garde (convex/saved.ts) : apps et comptes
//            suivis, dossiers, règles d'alerte, déjà lu. save() s'affiche tout de suite.
import { h, Fragment } from 'preact';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { useConvexAuth, useQuery } from 'convex/react';
import { useAuthActions } from '@convex-dev/auth/react';
import { ConvexError } from 'convex/values';
import { api } from '../../convex/_generated/api.js';
import { client, mount } from '../auth.js';
import { ROUTES } from './routes.js';
import Apercu from './pages/Apercu.js';
import MApercuApps from './pages/MApercuApps.js';
import Formules from './pages/Formules.js';
import MFormules from './pages/MFormules.js';
import MenuCompte from './pages/MenuCompte.js';
import Reglages from './pages/Reglages.js';
import '../styles/ds/tokens.css';
import '../styles/ds/bundle.css';
import './app.css';
import './styles/a-apr.css';
import './styles/m-apr.css';
import './styles/a-for.css';
import './styles/m-for.css';
import './styles/a-mnu.css';
import './styles/a-reg.css';

const HOME = '/app';
const SIGN_OUT = '/app/deconnexion';
// L'aperçu : ce qu'un compte sans abonnement peut ouvrir. Accueil mène à Apps ; le reste ouvre les formules.
const APERCU = '/app/apps';
const OPEN = [/^\/app\/apps$/, /^\/app\/apps\/[^/]+$/, /^\/app\/videos\/[^/]+$/, /^\/app\/compte$/];
const isOpen = (pathname) => pathname === SIGN_OUT || pathname.startsWith('/app/payer/') || OPEN.some((re) => re.test(pathname));
// Paiement (Whop, convex/whop.ts) : ces adresses créent le lien de paiement Whop relié au compte et y envoient, sans
// écran entre les deux. Depuis le site (tarifs) ou un favori, elles mènent ici aussi (après connexion).
const PAY = '/app/payer/';
const CHECKOUT = { mensuel: PAY + 'mensuel', annuel: PAY + 'annuel' };
const formuleOf = (pathname) => (pathname.slice(PAY.length) === 'mensuel' ? 'mensuel' : 'annuel');
// Retour de Whop : /app?paiement=ok. L'accès vient du webhook ; l'écran attend qu'il arrive.
const PAID = new URLSearchParams(window.location.search).get('paiement') === 'ok';
// Paiement en attente d'accès (audit Q6) : gardé dans l'onglet, pour qu'un rechargement garde le message et son recours.
const PENDING = 'kopycat.paiement';
const pendingPay = () => { try { const t = Number(sessionStorage.getItem(PENDING)); return t > 0 && Date.now() - t < 7 * 864e5; } catch { return false; } };
const setPendingPay = (on) => { try { if (on) sessionStorage.setItem(PENDING, String(Date.now())); else sessionStorage.removeItem(PENDING); } catch { /* stockage refusé */ } };
const SUITE = 'kopycat.suite'; // l'achat commencé avant de se connecter
// Sous 860 px, l'écran mobile de l'adresse (artboard M* du canevas), sinon le desktop.
const MOBILE = window.matchMedia('(max-width: 860px)');
const loaderOf = (route, mobile) => (mobile && route.loadMobile) || route.load;
const clean = (path) => (path.length > 1 ? path.replace(/\/+$/, '') : path);
/** L'adresse affichée : chemin + requête (« /app/apps?niche=Foi »), sans l'ancre. */
const here = () => clean(window.location.pathname) + window.location.search;
// Les listes que l'on garde chaudes toute la session : la navigation n'attend rien.
const WARM = ['home', 'apps', 'formats', 'creators:FR', 'alerts', 'search', 'stats'];
const SAVED = ['follows', 'folders', 'alertRules', 'seen'];

/** L'adresse -> sa route, ses paramètres et la clé de ses données. */
const COMPILED = ROUTES.map((route) => {
  const names = [];
  const re = new RegExp(`^${route.path.replace(/:([a-z]+)/g, (_, n) => (names.push(n), '([^/]+)'))}$`);
  return { route, re, names };
});
function matchRoute(path) {
  for (const { route, re, names } of COMPILED) {
    const m = path.match(re);
    if (!m) continue;
    const params = Object.fromEntries(names.map((n, i) => [n, decodeURIComponent(m[i + 1])]));
    const key = route.data ? route.data.replace(/\{([a-z]+)\}/g, (_, n) => params[n]) : null;
    return { route, params, key };
  }
  return null;
}

// Démarrage : le code du premier écran se télécharge tout de suite, en même temps que la
// session se vérifie ; et la connexion aux miniatures (/cover/…) s'ouvre d'avance.
{
  const first = matchRoute(clean(window.location.pathname));
  if (first) loaderOf(first.route, MOBILE.matches)().catch(() => {});
  const site = (import.meta.env.VITE_CONVEX_URL || '').replace(/\.cloud\/?$/, '.site');
  if (site.startsWith('https://')) {
    const link = Object.assign(document.createElement('link'), { rel: 'preconnect', href: site });
    document.head.appendChild(link);
  }
}

// ─── Les documents du Radar et ce que la personne garde : un abonnement par clé, gardé toute la session ───
const watched = new Map(); // « board:clé » ou « saved:clé » -> { value, listeners: Set }
const board = (key) => watch(api.boards.get, `board:${key}`, key);
const savedEntry = (key) => watch(api.saved.get, `saved:${key}`, key);
function watch(fn, id, key) {
  let entry = watched.get(id);
  if (!entry) {
    const query = client.watchQuery(fn, { key });
    entry = { value: undefined, listeners: new Set() };
    const read = () => {
      try {
        // Pendant un renouvellement de session, le serveur renvoie tout : on garde la valeur reçue
        // (sinon l'écran retomberait un instant sur l'exemple du canevas).
        const value = query.localQueryResult();
        if (value !== undefined) entry.value = value;
      } catch {
        entry.value = null; // erreur de la requête : l'écran montre son état vide
      }
      entry.listeners.forEach((f) => f());
    };
    query.onUpdate(read);
    read();
    watched.set(id, entry);
  }
  return entry;
}
/** Enregistre ce que la personne garde ; l'écran le voit aussitôt (mise à jour optimiste). */
function save(key, value) {
  return client
    .mutation(api.saved.set, { key, value }, { optimisticUpdate: (store) => store.setQuery(api.saved.get, { key }, value) })
    .catch(() => {}); // refus (hors ligne, session finie) : la valeur revient à celle du serveur
}
/** Attend qu'un document soit arrivé (ou absent : null). */
function ready(key) {
  const entry = board(key);
  if (entry.value !== undefined) return Promise.resolve();
  return new Promise((resolve) => {
    const done = () => {
      if (entry.value === undefined) return;
      entry.listeners.delete(done);
      resolve();
    };
    entry.listeners.add(done);
  });
}

/** Ce que les écrans savent de la personne : prénom (si Google l'a donné), e-mail, initiale, abonnée ou non. */
function toUser(viewer) {
  const email = viewer.email ?? '';
  const prenom = viewer.name ? viewer.name.trim().split(/\s+/)[0] : null;
  return { prenom, nom: viewer.name ?? '', email, initiale: (prenom || email || '?').charAt(0).toUpperCase(), pro: viewer.pro === true,
    emailVerified: viewer.emailVerified === true };
}

function App() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();
  const viewer = useQuery(api.users.viewer, isAuthenticated ? {} : 'skip');
  const [path, setPath] = useState(here); // chemin + requête
  const [screen, setScreen] = useState(null);
  const [mobile, setMobile] = useState(MOBILE.matches);
  const [, redraw] = useState(0);
  const leaving = useRef(false);
  const used = useRef(new Set()); // documents lus par l'écran affiché : leur mise à jour le redessine

  const leave = async () => {
    leaving.current = true;
    await signOut();
    window.location.replace('/');
  };

  // Garde : pas connecté, ou compte disparu -> connexion.
  useEffect(() => {
    if (leaving.current) return;
    if (!isLoading && !isAuthenticated) {
      if (window.location.pathname.startsWith(PAY)) { try { sessionStorage.setItem(SUITE, window.location.pathname); } catch { /* stockage refusé */ } }
      window.location.replace('/connexion');
    }
    else if (viewer === null) void signOut();
  }, [isLoading, isAuthenticated, viewer]);

  // Le profil reste connu pendant un renouvellement de session (viewer repasse un instant à undefined).
  const lastUser = useRef(null);
  const user = useMemo(() => {
    if (viewer) lastUser.current = toUser(viewer);
    else if (viewer === null || !isAuthenticated) lastUser.current = null;
    return lastUser.current;
  }, [viewer, isAuthenticated]);
  const known = user !== null;
  // Aperçu : la fenêtre des formules, et l'abonnement lu par les gestionnaires montés une seule fois.
  const [plans, setPlans] = useState(false);
  // Panneau du compte : l'avatar de la barre latérale (ordinateur) l'ouvre au lieu de mener à Compte.
  const [menu, setMenu] = useState(false);
  // Réglages : la rubrique ouverte (« profil », « securite », « abo ») ou null. Sur téléphone, c'est l'écran /app/compte.
  const [settings, setSettings] = useState(null);
  // Paiement : la formule demandée (le lien Whop se crée dès qu'on sait qui est là), l'ouverture en cours ou ratée ;
  // et, au retour de Whop, l'attente de l'accès.
  const [pay, setPay] = useState(null);
  const [paying, setPaying] = useState(null);
  // Un compte déjà Pro qui suit un lien de paiement : Réglages › Formule à la place (compteur : chaque lien rouvre).
  const [toPlan, setToPlan] = useState(0);
  const [planMobile, setPlanMobile] = useState(false);
  const [paid, setPaid] = useState(PAID ? 'wait' : pendingPay() ? 'slow' : null);
  const [checkPay, setCheckPay] = useState(null); // « Vérifier mon paiement » : null, 'busy', 'none' (pas encore trouvé), 'error'
  const verifyPay = () => {
    setCheckPay('busy');
    client.action(api.whop.verifierPaiement, {}).then((r) => setCheckPay(r && r.pro ? null : 'none'), () => setCheckPay('error'));
  };
  const proRef = useRef(false);
  proRef.current = !!(user && user.pro);

  // Liens internes, ⌘K, largeur de l'écran.
  useEffect(() => {
    const onClick = (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (event.target.closest && event.target.closest('.sw-sidebar .sw-side-foot .sw-avatar')) {
        event.preventDefault();
        setMenu((open) => !open);
        return;
      }
      const link = event.target.closest && event.target.closest('a[href]');
      if (!link || (link.target && link.target !== '_self') || link.hasAttribute('download')) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || !(url.pathname === HOME || url.pathname.startsWith(HOME + '/'))) return;
      // Payer : direction le paiement Whop, sans changer d'écran d'ici là.
      if (url.pathname.startsWith(PAY)) {
        event.preventDefault();
        setPlans(false);
        setSettings(null);
        setMenu(false);
        setPay(formuleOf(url.pathname));
        return;
      }
      // Aperçu : un écran fermé ouvre la fenêtre des formules sans quitter l'écran ; Accueil mène à Apps.
      if (lastUser.current && !proRef.current && !isOpen(clean(url.pathname))) {
        event.preventDefault();
        if (clean(url.pathname) !== HOME) setPlans(true);
        else if (here() !== APERCU) {
          window.history.pushState(null, '', APERCU);
          setPath(APERCU);
        }
        return;
      }
      const next = clean(url.pathname) + url.search;
      if (next === here()) {
        if (!url.hash) event.preventDefault(); // même adresse : on reste
        return; // ancre de la même page : le navigateur s'en charge
      }
      event.preventDefault();
      // Visionneuse (« Regarder une par une ») : chaque vidéo ouverte retient combien de vidéos on a enchaînées depuis
      // l'écran d'origine, pour que la croix y ramène d'un coup (history.go(-n)) au lieu de revenir à la vidéo d'avant.
      const VIDEOS = HOME + '/videos/';
      const depth = url.pathname.startsWith(VIDEOS)
        ? (window.location.pathname.startsWith(VIDEOS) ? ((window.history.state && window.history.state.viewer) || 0) + 1 : 1) : 0;
      window.history.pushState(depth ? { viewer: depth } : null, '', next + url.hash);
      setPath(next);
    };
    const onPop = () => setPath(here());
    // ⌘K / Ctrl+K : chaque écran a un déclencheur [data-cmdk] qui ouvre la recherche.
    const onKey = (event) => {
      if ((event.metaKey || event.ctrlKey) && !event.altKey && event.key.toLowerCase() === 'k') {
        const trigger = document.querySelector('[data-cmdk]');
        if (trigger) {
          event.preventDefault();
          trigger.click();
        }
      }
    };
    const onWidth = (event) => setMobile(event.matches);
    MOBILE.addEventListener('change', onWidth);
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    window.addEventListener('popstate', onPop);
    return () => {
      MOBILE.removeEventListener('change', onWidth);
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('popstate', onPop);
    };
  }, []);

  // Achat commencé avant de se connecter (lien des tarifs) : il reprend une fois connecté.
  useEffect(() => {
    if (!known) return;
    let suite = null;
    try { suite = sessionStorage.getItem(SUITE); sessionStorage.removeItem(SUITE); } catch { /* stockage refusé */ }
    if (suite && suite.startsWith(PAY)) setPay(formuleOf(suite)); // déjà Pro : l'effet de paiement mène à Réglages
  }, [known]);

  // Retour de Whop : on retire ?paiement=ok de l'adresse, puis on attend que le webhook ouvre l'accès.
  useEffect(() => {
    if (!PAID) return undefined;
    setPendingPay(true);
    const params = new URLSearchParams(window.location.search);
    params.delete('paiement');
    const clean = window.location.pathname + (params.toString() ? '?' + params : '');
    window.history.replaceState(null, '', clean);
    setPath(here());
    const slow = setTimeout(() => setPaid((s) => (s === 'wait' ? 'slow' : s)), 90000);
    return () => clearTimeout(slow);
  }, []);
  useEffect(() => {
    if (!paid || paid === 'ok' || !user || !user.pro) return undefined;
    setPendingPay(false);
    setPaid('ok');
    const t = setTimeout(() => setPaid(null), 7000);
    return () => clearTimeout(t);
  }, [paid, user]);

  // Payer : le lien Whop se crée côté serveur (relié au compte), puis on y va. Tous les chemins vers le paiement passent
  // ici (clic, adresse /app/payer/…, achat repris après connexion), une fois le compte connu : un compte déjà Pro ne
  // repaie jamais (audit du 19/11, S3 : deux adhésions prélevées) et arrive dans Réglages › Formule. Le serveur refuse
  // aussi (DEJA_ABONNE), par exemple quand une adhésion est arrivée avant la mise à jour de `pro`.
  useEffect(() => {
    if (!pay || !known) return;
    const formule = pay;
    setPay(null);
    if (proRef.current) { setToPlan((n) => n + 1); return; }
    setPaying('open');
    client.action(api.whop.checkout, { formule, origin: window.location.origin }).then(
      (r) => { window.location.assign(r.url); },
      (e) => {
        if (e instanceof ConvexError && e.data && e.data.code === 'DEJA_ABONNE') { setPaying(null); setToPlan((n) => n + 1); return; }
        setPaying('error'); setTimeout(() => setPaying(null), 6000);
      },
    );
  }, [pay, known]);

  // Changer d'écran referme le panneau du compte et les réglages.
  useEffect(() => { setMenu(false); setSettings(null); if (!path.startsWith('/app/compte')) setPlanMobile(false); }, [path]);
  // Réglages › Formule, pour un compte Pro venu d'un lien de paiement. Après l'effet du dessus : un même rendu qui change
  // d'adresse (arrivée par /app/payer/…) ne la referme pas aussitôt. Sur téléphone, c'est l'écran /app/compte.
  useEffect(() => {
    if (!toPlan) return;
    if (!MOBILE.matches) { setSettings('abo'); return; }
    setPlanMobile(true);
    if (window.location.pathname !== '/app/compte') { window.history.pushState(null, '', '/app/compte'); setPath('/app/compte'); }
  }, [toPlan]);
  // Les sessions ouvertes (Réglages › Sécurité), lues quand le panneau du compte ou les réglages sont ouverts
  // (dès le panneau : les réglages s'ouvrent ensuite sans attendre).
  const onSettingsScreen = !!(screen && screen.mobile && screen.route.path === '/app/compte');
  const sessions = useQuery(api.users.sessions, isAuthenticated && (settings || menu || onSettingsScreen) ? {} : 'skip');
  // L'abonnement Whop et ses paiements (Réglages › Formule et facturation).
  const abo = useQuery(api.whop.mine, isAuthenticated && (settings || menu || onSettingsScreen) ? {} : 'skip');

  // Aperçu : une adresse fermée (lien direct, favori, retour arrière) revient à Apps, fenêtre des formules ouverte ;
  // Accueil y revient sans fenêtre.
  useEffect(() => {
    if (!user || user.pro) return;
    const pathname = path.split('?')[0];
    if (isOpen(pathname)) return;
    window.history.replaceState(null, '', APERCU);
    setPath(APERCU);
    if (pathname !== HOME) setPlans(true);
  }, [path, user]);

  // Écran de l'adresse : son code et ses données arrivent ensemble ; l'écran précédent
  // reste affiché d'ici là (pas d'écran vide, pas de données d'exemple qui clignotent).
  useEffect(() => {
    if (path === SIGN_OUT) {
      void leave();
      return undefined;
    }
    const [pathname, search = ''] = path.split('?');
    if (pathname.startsWith(PAY)) {
      setPay(formuleOf(pathname));
      window.history.replaceState(null, '', HOME);
      setPath(HOME);
      return undefined;
    }
    const match = matchRoute(pathname);
    if (!match) {
      window.history.replaceState(null, '', HOME);
      setPath(HOME);
      return undefined;
    }
    if (!isAuthenticated) return undefined; // le profil (viewer) arrive en parallèle
    let current = true;
    Promise.all([loaderOf(match.route, mobile)(), match.key ? ready(match.key) : null]).then(
      ([module]) => {
        if (!current) return;
        const query = Object.fromEntries(new URLSearchParams(search));
        setScreen({ path, mobile, Page: module.default, route: match.route, params: match.params, query, key: match.key });
      },
      () => {
        // Fichier de l'écran introuvable (un déploiement est passé depuis l'ouverture) : on recharge.
        if (current && !leaving.current) window.location.assign(window.location.href);
      },
    );
    return () => {
      current = false;
    };
  }, [path, isAuthenticated, mobile]);

  // Une fois le premier écran affiché : les autres écrans et les listes se chargent en
  // arrière-plan, la navigation devient instantanée.
  const warmed = useRef(false);
  useEffect(() => {
    if (!screen || warmed.current) return undefined;
    warmed.current = true;
    const timer = setTimeout(() => {
      WARM.forEach((key) => board(key));
      SAVED.forEach((key) => savedEntry(key));
      ROUTES.forEach((route) => loaderOf(route, MOBILE.matches)().catch(() => {}));
    }, 800);
    return () => clearTimeout(timer);
  }, [screen]);

  // Arrivée sur un écran : titre de l'onglet, puis en haut ou sur l'ancre demandée.
  useEffect(() => {
    if (!screen) return;
    const d = screen.key ? board(screen.key).value : null;
    document.title = `${(d && (d.name || (d.handle && `@${d.handle}`) || d.label)) || screen.route.title} · Kopycat`;
    const id = decodeURIComponent(window.location.hash.slice(1));
    const target = id && document.getElementById(id);
    if (target) target.scrollIntoView();
    else window.scrollTo(0, 0);
  }, [screen]);

  // Les documents lus par l'écran : on le redessine quand ils changent.
  const follow = (id, entry) => {
    if (!used.current.has(id)) {
      used.current.add(id);
      entry.listeners.add(() => redraw((n) => n + 1));
    }
    return entry.value;
  };
  const get = (key) => follow(`board:${key}`, board(key));
  const saved = (key) => follow(`saved:${key}`, savedEntry(key));

  // Aperçu : une fiche hors du top 3 (document verrouillé par le serveur) renvoie à Apps, fenêtre ouverte. Seulement
  // sur une adresse ouverte : un écran fermé (Accueil chargé avant que le profil arrive) relève de l'effet précédent.
  const lockedData = !!(screen && screen.key && user && !user.pro && isOpen(screen.path.split('?')[0])
    && (board(screen.key).value || {}).locked);
  useEffect(() => {
    if (!lockedData) return;
    window.history.replaceState(null, '', APERCU);
    setPath(APERCU);
    setPlans(true);
  }, [lockedData]);

  // Rien tant qu'on ne sait pas qui est là : pas d'écran qui clignote.
  if (!user || !screen) return null;
  const data = screen.key ? get(screen.key) : undefined;
  // Document absent : jamais l'exemple du canevas à la place des données.
  if (data === null) return h(Missing, { fiche: Object.keys(screen.params).length > 0 });
  const onPlans = () => setPlans(true);
  let page;
  if (!user.pro && (screen.route.path === APERCU || (data && data.locked))) {
    // Apps sans abonnement : le top 3 et la carte « Tout débloquer » (design/app/ApercuA, MApercuApps).
    const apps = screen.route.path === APERCU ? data : get('apps');
    page = apps && !apps.locked
      ? h(screen.mobile ? MApercuApps : Apercu, { key: `${screen.mobile ? 'm' : 'd'}/apercu`, user, data: apps, onPlans, checkout: CHECKOUT })
      : null;
  } else {
    page = h(screen.Page, {
      key: `${screen.mobile ? 'm' : 'd'}${screen.path}`,
      user,
      signOut: leave,
      onPlans,
      params: screen.params,
      query: screen.query,
      data,
      get,
      saved,
      save,
    });
  }
  const total = (!user.pro && (board('apps').value || {}).total) || undefined;
  const sheet = plans ? h(screen.mobile ? MFormules : Formules, { onClose: () => setPlans(false), checkout: CHECKOUT, total }) : null;
  const account = menu && !screen.mobile
    ? h(MenuCompte, { user, total: (board('apps').value || {}).total, onClose: () => setMenu(false), onPlans: () => { setMenu(false); setPlans(true); },
        onSettings: (section) => { setMenu(false); setSettings(section); } })
    : null;
  // Réglages : les actions passent par le serveur (convex/users.ts) ; le prénom revient par viewer, qui suit.
  const settingsProps = {
    user, sessions, abo, total: (!user.pro && (board('apps').value || {}).total) || undefined, checkout: CHECKOUT,
    onCancel: (cancel, reason) => client.action(api.whop.setCancel, reason ? { cancel, reason } : { cancel }),
    onSaveName: (name) => client.mutation(api.users.setName, { name }),
    onChangePassword: (current, next) => client.action(api.users.changePassword, { current, next }),
    onChangeEmail: (email, password) => client.action(api.users.changeEmail, { email, password }),
    onSignOutOthers: () => client.mutation(api.users.signOutOthers, {}),
    onDelete: (email) => client.action(api.users.deleteAccount, { email }).then(async (r) => {
      if (r && r.ok) { leaving.current = true; await signOut().catch(() => {}); window.location.replace('/'); }
      return r;
    }),
  };
  if (onSettingsScreen) {
    const toApp = () => { window.history.pushState(null, '', HOME); setPath(HOME); };
    page = h(Reglages, { key: planMobile ? 'm/reglages/abo' : 'm/reglages', ...settingsProps, mobile: true, onClose: toApp, ...(planMobile ? { section: 'abo', view: 'detail' } : {}) });
  }
  const panel = settings && !screen.mobile ? h(Reglages, { key: `reglages-${settings}`, ...settingsProps, section: settings, onClose: () => setSettings(null) }) : null;
  const payNote = paying
    ? h('div', { class: `app-paid is-${paying}`, role: paying === 'error' ? 'alert' : 'status' },
        paying === 'error' ? 'Le paiement n’a pas pu s’ouvrir. Réessaie dans un instant.' : 'Ouverture du paiement sécurisé…')
    : null;
  // Retour de Whop : l'accès arrive par le webhook (quelques secondes en général). Au-delà de 90 s, ou après un
  // rechargement, un recours (audit Q6) : relire le paiement chez Whop, ou écrire à l'aide.
  const link = { color: 'inherit', textDecoration: 'underline', background: 'none', border: 0, padding: 0, font: 'inherit', cursor: 'pointer' };
  const slowNote = () => [
    checkPay === 'none' ? 'Pas encore trouvé chez Whop. Réessaie dans quelques minutes. '
      : checkPay === 'error' ? 'La vérification n’a pas marché. Réessaie dans un instant. '
      : 'Ton paiement est en cours de validation chez Whop. ',
    h('button', { type: 'button', style: link, disabled: checkPay === 'busy', onClick: verifyPay }, checkPay === 'busy' ? 'Vérification…' : 'Vérifier mon paiement'),
    ' · ',
    h('a', { href: '/#faq', target: '_blank', rel: 'noopener', style: link }, 'Aide et contact'),
  ];
  const paidNote = paid
    ? h('div', { class: `app-paid is-${paid}`, role: 'status' },
        paid === 'ok' ? 'Bienvenue dans Kopycat Pro : tout est ouvert.'
          : paid === 'slow' ? slowNote()
          : 'Paiement reçu. On ouvre ton accès…')
    : null;
  return h(Fragment, null, page, account, panel, sheet, payNote, paidNote);
}

/** Une fiche qui n'existe pas (ou plus) dans le Radar, ou une liste pas encore calculée. */
function Missing({ fiche }) {
  const title = fiche ? 'Cette fiche n’est plus dans le Radar' : 'Les données arrivent';
  const text = fiche
    ? 'Le compte, la vidéo ou le format ne fait plus partie de ce que le Radar suit.'
    : 'Le Radar prépare cette page. Elle se remplira d’elle-même dans quelques minutes.';
  return h('main', { class: 'app-missing' },
    h('h1', null, title),
    h('p', null, text),
    h('a', { href: HOME }, 'Retour à l’accueil'),
  );
}

// Une image qui ne se charge pas ne laisse pas d'icône cassée. Une miniature servie par Swarm
// (/cover/…) est redemandée une fois, 4 s plus tard : la première vue la copie (1 à 3 s).
document.addEventListener('error', (event) => {
  const img = event.target;
  if (!(img instanceof HTMLImageElement)) return;
  img.classList.add('is-broken'); // masquée tout de suite : jamais d'icône d'image cassée
  if (img.src.includes('/cover/') && !img.dataset.retried) {
    img.dataset.retried = '1';
    setTimeout(() => { img.src = img.src + (img.src.includes('?') ? '&' : '?') + 'r=1'; }, 4000);
  }
}, true);
document.addEventListener('load', (event) => {
  if (event.target instanceof HTMLImageElement) event.target.classList.remove('is-broken');
}, true);

// Survol d'une miniature de vidéo (ordinateur seulement) : la vidéo s'agrandit dans une fenêtre flottante
// et se lance sans le son, après 0,35 s. TikTok : le lecteur officiel ; Instagram : la miniature en grand
// (son lecteur ne démarre pas sans clic). La fenêtre part dès que la souris quitte la miniature.
(() => {
  if (!window.matchMedia || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const W = 300, H = 534, PAD = 14;
  let timer = 0, current = null, box = null;
  const linkOf = (el) => (el && el.closest ? el.closest('a[href*="/app/videos/"]') : null);
  const idOf = (a) => { const m = (a.getAttribute('href') || '').match(/\/app\/videos\/([^/?#]+)/); return m ? decodeURIComponent(m[1]) : null; };
  const hide = () => { clearTimeout(timer); current = null; if (box) { box.remove(); box = null; } };
  const show = (a, id) => {
    hide();
    const img = a.querySelector('img');
    if (!img || !img.src || img.classList.contains('is-broken')) return;
    current = a;
    const r = a.getBoundingClientRect(), vw = window.innerWidth, vh = window.innerHeight;
    let left = r.right + PAD;
    if (left + W > vw - 12) left = r.left - W - PAD;
    if (left < 12) left = Math.max(12, (vw - W) / 2);
    const top = Math.max(12, Math.min(vh - H - 12, r.top + r.height / 2 - H / 2));
    box = document.createElement('div');
    box.className = 'sw-hoverplay';
    box.setAttribute('aria-hidden', 'true');
    box.style.cssText = 'left:' + left + 'px;top:' + top + 'px;width:' + W + 'px;height:' + H + 'px;background-image:url("' + img.src.replace(/"/g, '%22') + '")';
    if (/^\d{10,}$/.test(id)) {
      const f = document.createElement('iframe');
      f.src = 'https://www.tiktok.com/player/v1/' + id + '?autoplay=1&loop=1&controls=0&progress_bar=0&play_button=0&volume_control=0&fullscreen_button=0&timestamp=0&music_info=0&description=0&rel=0&native_context_menu=0&closed_caption=0';
      f.allow = 'autoplay; encrypted-media';
      f.tabIndex = -1;
      box.appendChild(f);
    }
    document.body.appendChild(box);
  };
  document.addEventListener('mouseover', (e) => {
    if (location.pathname.indexOf('/app/videos/') === 0) return; // déjà sur une vidéo : pas de second lecteur
    if (window.innerWidth < 861) return; // écran étroit = mise en page mobile : pas d'aperçu flottant
    const a = linkOf(e.target);
    if (!a || a === current || !a.querySelector('img')) return;
    const id = idOf(a);
    if (!id) return;
    clearTimeout(timer);
    timer = setTimeout(() => show(a, id), 350);
  });
  document.addEventListener('mouseout', (e) => {
    const a = linkOf(e.target);
    if (!a || (e.relatedTarget && a.contains(e.relatedTarget))) return;
    hide();
  });
  window.addEventListener('scroll', hide, true);
  window.addEventListener('popstate', hide);
  document.addEventListener('mousedown', hide, true);
})();

mount(h(App, null));
