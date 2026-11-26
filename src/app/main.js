// L'app Kopycat : réservée aux personnes connectées, une seule page à routes internes.
// La session n'est vérifiée qu'une fois ; passer d'un écran à l'autre ne recharge rien.
// Les écrans viennent du canevas de l'app (design/app, convertis par scripts/dc2preact.py).
// Sans abonnement (user.pro faux), l'aperçu (19/11) : Apps montre le top 3 (écran Apercu), les fiches et vidéos de
// ces 3 apps et le compte restent ouverts ; tout autre écran ouvre la fenêtre des formules (Formules). Le serveur
// n'envoie de toute façon rien d'autre (convex/boards.ts) : ce routeur ne fait que l'expliquer à l'écran.
// Chacun reçoit par ses props :
//   user    { prenom, nom, email, initiale, pro, emailVerified, hasPassword }   signOut()   onPlans() : ouvre la fenêtre des formules
//   data    le document de son adresse (convex/boards.ts), déjà calculé depuis le Radar
//   params  les paramètres de l'adresse (ex. { slug: 'astraai' })
//   query   les paramètres de la requête (ex. { niche: 'Foi' } pour /app/apps?niche=Foi ; une clé répétée donne un
//           tableau). Un écran de liste y lit ses filtres et les y réécrit (history.replaceState), sans navigation (F25).
//   get(clé) un autre document (créateurs d'un autre marché, index de recherche…) :
//            undefined tant qu'il charge, null s'il n'existe pas.
//   saved(clé) / save(clé, valeur)  ce que la personne garde (convex/saved.ts) : apps et comptes
//            suivis, dossiers, règles d'alerte, déjà lu. save() s'affiche tout de suite.
import { h, Fragment } from 'preact';
// Aperçu d'une app : la ligne cliquée devient le panneau (animation, voir le fichier).
import './morph.js';
// Bascules liquides : onglets, rail, lignes d'Apps (voir le fichier).
import './liquid.js';
// Fenêtres de choix (Marché, Niche, Plateforme) : dépli, survol liquide, options qui glissent (voir le fichier).
import './choice.js';
// Alertes, boîte de réception : cadre de la ligne choisie, détail en cascade, barres (voir le fichier).
import './inbox.js';
// Fiches : la barre des sections collée en haut, qui suit la section lue et y mène (voir le fichier).
import './sections.js';
// Téléphone : feuilles du bas au doigt, barre flottante, balayer d'un onglet à l'autre, tirer pour chercher (voir les fichiers).
import './sheet.js';
import './tabbar.js';
import './swipe.js';
import './pull.js';
// Ordinateur : glisser une ligne ou une carte vers un dossier ; les explications au survol (voir les fichiers).
import { connectFolders } from './drag.js';
import './hint.js';
// La recherche : les deux dernières fiches qu'on y a ouvertes (maquette 9B, voir le fichier).
import { connectRecent } from './recent.js';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks';
import { useConvexAuth, useQuery } from 'convex/react';
import { useAuthActions } from '@convex-dev/auth/react';
import { ConvexError } from 'convex/values';
import { api } from '../../convex/_generated/api.js';
import { client, mount } from '../auth.js';
import { track } from '../ab.js';
import { MOBILE_QUERY } from '../runtime.js';
import { ROUTES } from './routes.js';
import { createWatcher } from './watcher.js';
import { createBoards, untilText } from './passes.js';
import { APERCU, HOME, LOAD_TIMEOUT_MS, SIGN_OUT, isOpen, layoutOnly, loadingView, mayLoadBeforeUser, previewView, routeCodeNeeded, routeMatcher, routesToWarm, safeDecode as dec, screenQuery } from './plan.js';
import { scrollMemory } from './scroll.js';
// Le cadre et les squelettes : l'écran de l'adresse dessiné tout de suite, son contenu en attente (voir le fichier).
import { Skeleton } from './skeleton.js';
import '../styles/ds/tokens.css';
import '../styles/ds/bundle.css';
import './app.css';

/**
 * Un écran secondaire chargé à la demande, code et CSS ensemble (audit F4 : Réglages, Aperçu, Formules et le menu du
 * compte faisaient 80 % de l'entrée de l'app, chargés au démarrage par tout le monde). Rend le composant, ou null tant
 * qu'il charge (onReady redessine) ; preload() le charge d'avance.
 */
function lazyScreen(load) {
  let Comp = null;
  let pending = null;
  const get = (onReady) => {
    if (Comp) return Comp;
    if (!pending) pending = load().then((m) => { Comp = m.default; }, () => { pending = null; });
    if (onReady) pending.then(() => Comp && onReady());
    return null;
  };
  get.preload = () => { get(); };
  return get;
}
const Apercu = lazyScreen(() => Promise.all([import('./pages/Apercu.js'), import('./styles/a-apr.css')]).then(([m]) => m));
const MApercuApps = lazyScreen(() => Promise.all([import('./pages/MApercuApps.js'), import('./styles/m-apr.css')]).then(([m]) => m));
const Formules = lazyScreen(() => Promise.all([import('./pages/Formules.js'), import('./styles/a-for.css')]).then(([m]) => m));
const MFormules = lazyScreen(() => Promise.all([import('./pages/MFormules.js'), import('./styles/m-for.css')]).then(([m]) => m));
const MenuCompte = lazyScreen(() => Promise.all([import('./pages/MenuCompte.js'), import('./styles/a-mnu.css')]).then(([m]) => m));
const Reglages = lazyScreen(() => Promise.all([import('./pages/Reglages.js'), import('./styles/a-reg.css')]).then(([m]) => m));

// L'aperçu (ce qu'un compte sans abonnement peut ouvrir, HOME, APERCU, isOpen) : src/app/plan.js.
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
// Le cadre d'avant le code (app.html, public/app-frame.js) : l'initiale du compte et son abonnement, gardés de la dernière
// visite, pour dessiner l'avatar et la bonne rubrique avant que la session ne soit vérifiée (maquette 1A).
const CADRE = 'kopycat.cadre';
const cadre = () => { try { return JSON.parse(localStorage.getItem(CADRE) || 'null'); } catch { return null; } };
const setCadre = (v) => { try { if (v) localStorage.setItem(CADRE, JSON.stringify(v)); else localStorage.removeItem(CADRE); } catch { /* stockage refusé */ } };
/** Un changement d'écran plus long que ça montre le squelette de l'écran demandé (en dessous, l'ancien reste). */
const SKELETON_AFTER_MS = 150;
// Les Réglages à une adresse (audit Q13 : l'ancienne page Compte, sans résiliation, y était encore routée sur
// ordinateur). Sur téléphone, Réglages en plein écran ; sur ordinateur, le panneau des Réglages par-dessus l'accueil.
const ACCOUNT = '/app/compte';
// Sous 860 px, ou téléphone en paysage (audit F25 : un iPhone Plus ou Pro Max couché, 932 px, recevait l'interface
// souris), l'écran mobile de l'adresse (artboard M* du canevas), sinon le desktop. Même condition que src/runtime.js.
const MOBILE = window.matchMedia(MOBILE_QUERY);
const loaderOf = (route, mobile) => (mobile && route.loadMobile) || route.load;
// Position de défilement retenue avant chaque navigation, rendue au retour arrière (audit F13).
const scroll = scrollMemory(window);
const clean = (path) => (path.length > 1 ? path.replace(/\/+$/, '') : path);

/** L'adresse affichée : chemin + requête (« /app/apps?niche=Foi »), sans l'ancre. */
const here = () => clean(window.location.pathname) + window.location.search;
// Les listes gardées ouvertes toute la session : celles que plusieurs écrans lisent (apps), la recherche ⌘K, les
// chiffres. Audit F15 : home, formats, creators:FR et alerts l'étaient aussi, jamais visités pour certains, et chaque
// réécriture renvoyait ~2,25 Mo par onglet ; ils s'ouvrent maintenant avec leur écran (et se ferment après, F3).
const WARM = ['apps', 'search', 'stats'];
const SAVED = ['follows', 'folders', 'alertRules', 'seen', 'views', 'recent'];

/** L'adresse -> sa route, ses paramètres (décodés sans lever, audit Q31) et la clé de ses données (src/app/plan.js). */
const matchRoute = routeMatcher(ROUTES);

// Démarrage : le code du premier écran se télécharge tout de suite, en même temps que la
// session se vérifie ; et la connexion aux miniatures (/cover/…) s'ouvre d'avance.
{
  // Seulement une adresse ouverte à tous (fiche, vidéo) : Accueil ou Apps dépendent de l'abonnement (audit F8).
  const first = matchRoute(clean(window.location.pathname));
  if (first && mayLoadBeforeUser(clean(window.location.pathname))) loaderOf(first.route, MOBILE.matches)().catch(() => {});
  const site = (import.meta.env.VITE_CONVEX_URL || '').replace(/\.cloud\/?$/, '.site');
  if (site.startsWith('https://')) {
    const link = Object.assign(document.createElement('link'), { rel: 'preconnect', href: site });
    document.head.appendChild(link);
  }
}

// ─── Les documents du Radar et ce que la personne garde : un abonnement par clé (src/app/watcher.js) ───
// Les listes chaudes et ce que la personne garde restent ouverts toute la session ; un autre document (fiche, vidéo,
// filtre) est fermé quand plus aucun écran ne le lit, au-delà de 20 ou après 60 s (audit F3).
const KEPT = new Set([...WARM.map((k) => `board:${k}`), ...SAVED.map((k) => `saved:${k}`)]);
const watcher = createWatcher(client, { keep: (id) => KEPT.has(id) });
// Audit S22 : un abonné ouvre chaque page avec son laissez-passer, compté sur son quota (src/app/passes.js).
const who = { pro: false }; // tenu par App, lu par les laissez-passer
const { board } = createBoards({ client, watcher, get: api.boards.get, passes: api.boards.passes, isPro: () => who.pro });
const savedEntry = (key) => watcher.watch(api.saved.get, `saved:${key}`, { key });
/** Enregistre ce que la personne garde ; l'écran le voit aussitôt (mise à jour optimiste). */
function save(key, value) {
  return client
    .mutation(api.saved.set, { key, value }, { optimisticUpdate: (store) => store.setQuery(api.saved.get, { key }, value) })
    .catch(() => {}); // refus (hors ligne, session finie) : la valeur revient à celle du serveur
}
// Glisser vers un dossier (src/app/drag.js) : les dossiers, lus et écrits comme les écrans le font (saved/save).
connectFolders({
  read: () => savedEntry('folders').value,
  write: (value) => save('folders', value),
  listen: (f) => { const e = savedEntry('folders'); e.listeners.add(f); return () => e.listeners.delete(f); },
});
// Les deux dernières fiches ouvertes depuis la recherche (src/app/recent.js), rangées dans les préférences du compte.
connectRecent({ read: () => savedEntry('recent').value, write: (value) => save('recent', value) });
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
  // L'initiale : le premier caractère entier, jamais la moitié d'un émoji (audit Q38).
  return { prenom, nom: viewer.name ?? '', email, initiale: (Array.from(prenom || email || '?')[0] || '?').toUpperCase(), pro: viewer.pro === true,
    emailVerified: viewer.emailVerified === true, hasPassword: viewer.password === true };
}

function App() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();
  const viewer = useQuery(api.users.viewer, isAuthenticated ? {} : 'skip');
  // La navigation : l'adresse (chemin + requête) et son numéro. Audit F25 : un écran de liste réécrit sa requête sans
  // naviguer (ses filtres) ; l'adresse affichée peut alors différer de `path`, et un lien vers `path` reste une
  // navigation : le numéro change, l'écran se remonte avec la requête du lien.
  const [nav, setNav] = useState(() => ({ path: here(), n: 0 }));
  const path = nav.path;
  const setPath = (next) => setNav((cur) => ({ path: next, n: cur.n + 1 }));
  const [screen, setScreen] = useState(null);
  // Audit F26 : l'adresse dont l'écran se charge, et celle qui n'est pas arrivée dans le délai (LOAD_TIMEOUT_MS).
  const [loading, setLoading] = useState(null);
  const [stalled, setStalled] = useState(null);
  const [mobile, setMobile] = useState(MOBILE.matches);
  const [, redraw] = useState(0);
  const leaving = useRef(false);
  const shownOnce = useRef(false); // un premier écran a déjà été affiché (les squelettes suivants entrent en fondu)
  // Documents lus par l'écran affiché (id -> écouteur) : leur mise à jour le redessine ; libérés au changement d'écran.
  const used = useRef(new Map());

  const leave = async () => {
    leaving.current = true;
    setCadre(null);
    await signOut();
    window.location.replace('/');
  };

  // Garde : pas connecté, ou compte disparu -> connexion.
  useEffect(() => {
    if (leaving.current) return;
    if (!isLoading && !isAuthenticated) {
      if (window.location.pathname.startsWith(PAY)) { try { sessionStorage.setItem(SUITE, window.location.pathname); } catch { /* stockage refusé */ } }
      setCadre(null);
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
  // Le cadre de la prochaine visite : l'initiale et l'abonnement de ce compte.
  useEffect(() => { if (user) setCadre({ i: user.initiale, p: user.pro ? 1 : 0 }); }, [user && user.initiale, user && user.pro]);
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
  // Test A/B de l'onboarding (26/11, src/ab.js) : la fenêtre des formules ouverte, et le départ vers le paiement, avec le
  // bras écrit sur le compte. Un compte hors du test (bras absent) n'envoie rien.
  const bras = viewer ? viewer.bras : null;
  useEffect(() => { if (plans && bras) track('paywall_vu', { ecran: 'formules' }, { arm: bras, user: viewer.id, forced: viewer.force }); }, [plans, bras]);
  useEffect(() => { if (pay && bras) track('paiement_commence', { formule: pay }, { arm: bras, user: viewer.id, forced: viewer.force }); }, [pay, bras]);
  // Un compte déjà Pro qui suit un lien de paiement : Réglages › Formule à la place (compteur : chaque lien rouvre).
  const [toPlan, setToPlan] = useState(0);
  const [planMobile, setPlanMobile] = useState(false);
  // Une rubrique des Réglages à ouvrir après un changement d'adresse (qui referme les panneaux) : /app/compte sur ordinateur.
  const [settingsNext, setSettingsNext] = useState(null);
  const [paid, setPaid] = useState(PAID ? 'wait' : pendingPay() ? 'slow' : null);
  const [checkPay, setCheckPay] = useState(null); // « Vérifier mon paiement » : null, 'busy', 'none' (pas encore trouvé), 'error'
  const verifyPay = () => {
    setCheckPay('busy');
    client.action(api.whop.verifierPaiement, {}).then((r) => setCheckPay(r && r.pro ? null : 'none'), () => setCheckPay('error'));
  };
  const proRef = useRef(false);
  proRef.current = !!(user && user.pro);
  who.pro = proRef.current;
  // Sans abonnement, l'aperçu remplace Apps : son code part dès qu'on sait qui est là (audit F4).
  const free = !!user && !user.pro;
  // Bras A du test : l'aperçu porte la carte « Tout débloquer », c'est son paywall.
  const onApercu = free && clean(path.split('?')[0]) === APERCU;
  useEffect(() => { if (onApercu && bras) track('paywall_vu', { ecran: 'apercu' }, { arm: bras, user: viewer.id, forced: viewer.force }); }, [onApercu, bras]);
  useEffect(() => { if (free) (MOBILE.matches ? MApercuApps : Apercu).preload(); }, [free]);

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
          scroll.remember();
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
      scroll.remember();
      window.history.pushState(depth ? { viewer: depth } : null, '', next + url.hash);
      setPath(next);
    };
    const onPop = () => { scroll.popped(); setPath(here()); };
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
  useEffect(() => { setMenu(false); setSettings(null); if (!path.startsWith(ACCOUNT)) setPlanMobile(false); }, [nav]);
  useEffect(() => {
    if (!settingsNext) return;
    setSettings(settingsNext);
    setSettingsNext(null);
  }, [settingsNext]);
  // Réglages › Formule, pour un compte Pro venu d'un lien de paiement. Après l'effet du dessus : un même rendu qui change
  // d'adresse (arrivée par /app/payer/…) ne la referme pas aussitôt. Sur téléphone, c'est l'écran /app/compte.
  useEffect(() => {
    if (!toPlan) return;
    if (!MOBILE.matches) { setSettings('abo'); return; }
    setPlanMobile(true);
    if (window.location.pathname !== ACCOUNT) { scroll.remember(); window.history.pushState(null, '', ACCOUNT); setPath(ACCOUNT); }
  }, [toPlan]);
  // Les sessions ouvertes (Réglages › Sécurité), lues quand le panneau du compte ou les réglages sont ouverts
  // (dès le panneau : les réglages s'ouvrent ensuite sans attendre).
  const onSettingsScreen = !!(screen && screen.mobile && screen.route.path === ACCOUNT);
  const sessions = useQuery(api.users.sessions, isAuthenticated && (settings || menu || onSettingsScreen) ? {} : 'skip');
  // L'abonnement Whop et ses paiements (Réglages › Formule et facturation).
  const abo = useQuery(api.whop.mine, isAuthenticated && (settings || menu || onSettingsScreen) ? {} : 'skip');
  // Une nouvelle adresse en attente de son clic (Réglages › Profil, « À confirmer »).
  const pendingEmail = useQuery(api.users.pendingEmail, isAuthenticated && (settings || onSettingsScreen) ? {} : 'skip');

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
    setLoading(null);
    if (path === SIGN_OUT) {
      void leave();
      return undefined;
    }
    const pathname = path.split('?')[0];
    if (pathname.startsWith(PAY)) {
      setPay(formuleOf(pathname));
      window.history.replaceState(null, '', HOME);
      setPath(HOME);
      return undefined;
    }
    if (pathname === ACCOUNT) {
      if (!mobile) {
        window.history.replaceState(null, '', HOME);
        setPath(HOME);
        setSettingsNext('profil');
        return undefined;
      }
      setScreen({ path, n: nav.n, mobile, Page: null, route: { path: ACCOUNT, title: 'Réglages' }, params: {}, query: {}, key: null });
      return undefined;
    }
    const match = matchRoute(pathname);
    if (!match) {
      window.history.replaceState(null, '', HOME);
      setPath(HOME);
      return undefined;
    }
    if (!isAuthenticated) return undefined; // le profil (viewer) arrive en parallèle
    // Audit F8 : une adresse fermée sans abonnement attend de savoir qui est là (pas de code d'Accueil chargé pour un
    // compte gratuit renvoyé vers l'aperçu) ; et l'aperçu n'attend pas le code d'Apps, qu'il n'affiche pas.
    if (!known && !mayLoadBeforeUser(pathname)) return undefined;
    if (known && !proRef.current && !isOpen(pathname)) return undefined; // l'aperçu la renvoie vers Apps (effet ci-dessus)
    const code = routeCodeNeeded(match.route.path, { known, pro: proRef.current }) ? loaderOf(match.route, mobile)() : Promise.resolve({ default: null });
    let current = true;
    setLoading(path);
    const late = setTimeout(() => { if (current) setStalled(path); }, LOAD_TIMEOUT_MS);
    Promise.all([code, match.key ? ready(match.key) : null]).then(
      ([module]) => {
        clearTimeout(late);
        if (!current) return;
        setLoading(null);
        setStalled(null);
        // L'écran d'avant cesse d'écouter ses documents : le watcher pourra fermer ceux que le nouveau ne lit pas.
        for (const [id, f] of used.current) watcher.entries.get(id)?.listeners.delete(f);
        used.current = new Map();
        // Audit F25 : la requête affichée, que l'écran a pu réécrire (ses filtres) depuis la navigation.
        const query = screenQuery(path, clean(window.location.pathname), window.location.search);
        setScreen({ path, n: nav.n, mobile, Page: module.default, route: match.route, params: match.params, query, key: match.key });
      },
      () => {
        // Fichier de l'écran introuvable (un déploiement est passé depuis l'ouverture) : on recharge.
        if (current && !leaving.current) window.location.assign(window.location.href);
      },
    );
    return () => {
      current = false;
      clearTimeout(late);
    };
  }, [nav, isAuthenticated, mobile, known, !!(user && user.pro)]);

  // Une fois le premier écran affiché : les autres écrans et les listes se chargent en
  // arrière-plan, la navigation devient instantanée.
  // Sans abonnement, seulement ce qu'il peut ouvrir (audit F8) ; tout le reste quand l'abonnement arrive.
  const warmed = useRef('');
  const proNow = !!(user && user.pro);
  useEffect(() => {
    if (!screen || !user || warmed.current === 'pro' || warmed.current === (proNow ? 'pro' : 'apercu')) return undefined;
    warmed.current = proNow ? 'pro' : 'apercu';
    const timer = setTimeout(() => {
      WARM.forEach((key) => board(key));
      SAVED.forEach((key) => savedEntry(key));
      routesToWarm(ROUTES, proNow).forEach((route) => loaderOf(route, MOBILE.matches)().catch(() => {}));
      // Les écrans secondaires, d'avance mais hors du démarrage (audit F4).
      [Reglages, MenuCompte, ...(proNow ? [] : [MOBILE.matches ? MFormules : Formules])].forEach((l) => l.preload());
    }, 800);
    return () => clearTimeout(timer);
  }, [screen, proNow]);

  // Arrivée sur un écran : titre de l'onglet, puis la position retenue (retour arrière), l'ancre demandée, ou le haut.
  const shownScreen = useRef(null);
  useEffect(() => {
    if (!screen) return;
    const d = screen.key ? board(screen.key).value : null;
    document.title = `${(d && (d.name || (d.handle && `@${d.handle}`) || d.label)) || screen.route.title} · Kopycat`;
    const id = dec(window.location.hash.slice(1));
    const target = id && document.getElementById(id);
    // Audit F25 : seule la mise en page a basculé (rotation, fenêtre redimensionnée) : même adresse, la position reste.
    const before = shownScreen.current;
    shownScreen.current = screen;
    if (!layoutOnly(before, screen)) scroll.arrive(target);
  }, [screen]);

  // Les documents lus par l'écran : on le redessine quand ils changent.
  const follow = (id, entry) => {
    if (!used.current.has(id)) {
      const f = () => redraw((n) => n + 1);
      used.current.set(id, f);
      entry.listeners.add(f);
    }
    return entry.value;
  };
  // Après chaque changement d'écran, une fois le nouvel écran rendu (ses documents écoutés) : les abonnements libres
  // anciens sont fermés (audit F3).
  useEffect(() => {
    if (!screen) return undefined;
    const t = setTimeout(() => watcher.sweep(), 0);
    return () => clearTimeout(t);
  }, [screen]);
  const saved = (key) => follow(`saved:${key}`, savedEntry(key));
  // `get('saved:recent')` : une préférence lue comme un document (la recherche, ouverte depuis chaque écran, ne reçoit que get).
  const get = (key) => (key.startsWith('saved:') ? saved(key.slice(6)) : follow(`board:${key}`, board(key)));

  // Aperçu : une fiche hors du top 3 (document verrouillé par le serveur) renvoie à Apps, fenêtre ouverte. Seulement
  // sur une adresse ouverte : un écran fermé (Accueil chargé avant que le profil arrive) relève de l'effet précédent.
  // Audit F29 : seulement si elle était verrouillée à l'arrivée ; une fiche sortie du top 3 pendant qu'on la lit garde sa
  // dernière valeur jusqu'à la navigation suivante (src/app/plan.js, previewView).
  const arrival = useRef({ screen: null, locked: false, open: null });
  if (screen && arrival.current.screen !== screen) {
    arrival.current = { screen, locked: !!(screen.key && (board(screen.key).value || {}).locked), open: null };
  }
  const view = screen && screen.key && user && !user.pro ? previewView(arrival.current, board(screen.key).value) : null;
  const lockedData = !!(view && view.eject && isOpen(screen.path.split('?')[0]));
  useEffect(() => {
    if (!lockedData) return;
    window.history.replaceState(null, '', APERCU);
    setPath(APERCU);
    setPlans(true);
  }, [lockedData]);

  // Le cadre et les squelettes (maquette 1A, src/app/skeleton.js). Au démarrage, tant que l'écran de l'adresse n'est pas
  // là (session, code, document), son squelette ; puis, à chaque changement d'écran qui dure plus de 150 ms, celui de
  // l'écran demandé, par-dessus l'ancien. Le vrai écran se pose dessous, le squelette s'efface en fondu.
  const [slow, setSlow] = useState(null);
  const screenPath = screen && screen.path;
  useEffect(() => {
    if (!loading || !screenPath || loading === screenPath) { setSlow(null); return undefined; }
    const t = setTimeout(() => setSlow(loading), SKELETON_AFTER_MS);
    return () => clearTimeout(t);
  }, [loading, screenPath]);
  const booting = !user || !screen;
  // Sans abonnement (d'après la dernière visite, tant que la session n'a pas répondu), une adresse fermée mène à Apps.
  const bootPath = !booting ? null : !user && cadre()?.p === 0 && !isOpen(path.split('?')[0]) ? APERCU : path;
  const initiale = user ? user.initiale : (cadre()?.i || '');
  const skeletonOf = (p) => h(SkeletonLayer, { key: 'skeleton', path: p ? p.split('?')[0] : null, mobile, initiale, first: !shownOnce.current });
  // Le cadre statique d'app.html s'en va une fois le squelette dessiné (deux images : la barre du bas pose sa pastille).
  useLayoutEffect(() => {
    const frame = document.getElementById('app-frame');
    if (frame) requestAnimationFrame(() => requestAnimationFrame(() => frame.remove()));
  }, []);

  // Le chargement d'un écran : une barre fine (après 150 ms), ou, au-delà du délai, « La connexion est perdue » (F26).
  const loadState = user ? loadingView({ loading, stalled, path, screenPath }) : null;
  if (loadState === 'stalled') return h(Stalled, null);
  const progress = loadState === 'progress' ? h('div', { class: 'app-progress', role: 'progressbar', 'aria-label': 'Chargement de l’écran' }) : null;
  // Tant qu'on ne sait pas qui est là, ou que l'écran n'est pas arrivé : son squelette, jamais un écran qui clignote.
  if (booting) return h(Fragment, null, skeletonOf(bootPath));
  const fresh = screen.key ? get(screen.key) : undefined;
  const data = view ? view.data : fresh;
  // Quota de pages atteint (audit S22) : l'écran dit quand les nouvelles pages rouvrent.
  const quota = data === null && screen.key ? board(screen.key).quota : null;
  if (quota) return h(Quota, { until: quota });
  // Document absent : jamais l'exemple du canevas à la place des données.
  if (data === null) return h(Missing, { fiche: Object.keys(screen.params).length > 0 });
  const onPlans = () => setPlans(true);
  const loaded = () => redraw((n) => n + 1); // un écran secondaire vient d'arriver (audit F4)
  let page;
  if (!user.pro && (screen.route.path === APERCU || (data && data.locked))) {
    // Apps sans abonnement : le top 3 et la carte « Tout débloquer » (design/app/ApercuA, MApercuApps).
    const apps = screen.route.path === APERCU ? data : get('apps');
    const ApercuPage = (screen.mobile ? MApercuApps : Apercu)(loaded);
    page = apps && !apps.locked && ApercuPage
      ? h(ApercuPage, { key: `${screen.mobile ? 'm' : 'd'}/apercu`, user, data: apps, onPlans, checkout: CHECKOUT })
      : null;
  } else if (!screen.Page) {
    page = null; // l'abonnement vient d'arriver sur l'aperçu : le code d'Apps arrive (l'effet de l'adresse le charge)
  } else {
    page = h(screen.Page, {
      // Une navigation (n) ou une bascule de mise en page (m/d) remonte l'écran ; un filtre réécrit dans l'adresse, non.
      key: `${screen.mobile ? 'm' : 'd'}${screen.n}${screen.path}`,
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
  const Sheet = plans ? (screen.mobile ? MFormules : Formules)(loaded) : null;
  const sheet = Sheet ? h(Sheet, { onClose: () => setPlans(false), checkout: CHECKOUT, total }) : null;
  const Menu = menu && !screen.mobile ? MenuCompte(loaded) : null;
  const account = Menu
    ? h(Menu, { user, total: (board('apps').value || {}).total, onClose: () => setMenu(false), onPlans: () => { setMenu(false); setPlans(true); },
        onSettings: (section) => { setMenu(false); setSettings(section); } })
    : null;
  // Réglages : les actions passent par le serveur (convex/users.ts) ; le prénom revient par viewer, qui suit.
  const settingsProps = {
    user, sessions, abo, total: (!user.pro && (board('apps').value || {}).total) || undefined, checkout: CHECKOUT,
    onCancel: (cancel, reason) => client.action(api.whop.setCancel, reason ? { cancel, reason } : { cancel }),
    onSaveName: (name) => client.mutation(api.users.setName, { name }),
    onChangePassword: (current, next) => client.action(api.users.changePassword, { current, next }),
    onChangeEmail: (email, password) => client.action(api.users.changeEmail, { email, password }),
    pendingEmail,
    onCancelEmail: () => client.mutation(api.users.cancelEmailChange, {}),
    onResendEmail: () => client.action(api.users.resendEmailChange, {}),
    onSignOutOthers: () => client.mutation(api.users.signOutOthers, {}),
    // Audit S27 : le mot de passe est demandé pour fermer un compte « mot de passe » (convex/users.ts, deleteAccount).
    onDelete: (email, password) => client.action(api.users.deleteAccount, password ? { email, password } : { email }).then(async (r) => {
      if (r && r.ok) { leaving.current = true; await signOut().catch(() => {}); window.location.replace('/'); }
      return r;
    }),
  };
  if (onSettingsScreen) {
    const toApp = () => { scroll.remember(); window.history.pushState(null, '', HOME); setPath(HOME); };
    const Settings = Reglages(loaded);
    page = Settings ? h(Settings, { key: planMobile ? 'm/reglages/abo' : 'm/reglages', ...settingsProps, mobile: true, onClose: toApp, ...(planMobile ? { section: 'abo', view: 'detail' } : {}) }) : null;
  }
  const Panel = settings && !screen.mobile ? Reglages(loaded) : null;
  const panel = Panel ? h(Panel, { key: `reglages-${settings}`, ...settingsProps, section: settings, onClose: () => setSettings(null) }) : null;
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
  // Un écran dont le code arrive encore (l'aperçu, les Réglages sur téléphone) garde aussi son squelette.
  const skeleton = skeletonOf(page ? slow : screen.path);
  if (page) shownOnce.current = true;
  return h(Fragment, null, progress, page, account, panel, sheet, payNote, paidNote, skeleton);
}

/**
 * Le squelette affiché (path : l'adresse en attente, null s'il n'y en a plus). Quand l'écran arrive, il reste le temps de
 * s'effacer en fondu par-dessus (is-out, 0,22 s), puis disparaît.
 */
function SkeletonLayer({ path, mobile, initiale, first }) {
  const [last, setLast] = useState(path ? { path, first } : null);
  useEffect(() => {
    if (path) { setLast({ path, first }); return undefined; }
    const t = setTimeout(() => setLast(null), 240);
    return () => clearTimeout(t);
  }, [path, first]);
  const show = path ? { path, first } : last;
  if (!show) return null;
  return h(Skeleton, { path: show.path, mobile, initiale, first: show.first, leaving: !path });
}

/** L'écran ne vient pas : hors ligne, ou réseau trop lent (audit F26). */
function Stalled() {
  return h('main', { class: 'app-missing', role: 'alert' },
    h('h1', null, 'La connexion est perdue'),
    h('p', null, 'L’écran ne se charge pas. Vérifie ta connexion, puis réessaie.'),
    h('a', { href: window.location.pathname + window.location.search, onClick: (e) => { e.preventDefault(); window.location.reload(); } }, 'Réessayer'),
  );
}

/**
 * Quota de pages atteint (audit S22, convex/boardQuota.ts : 300 par heure, 1 500 par 24 h). Les pages déjà ouvertes
 * restent lisibles ; celle-ci s'ouvre d'elle-même à l'heure dite (src/app/passes.js).
 */
function Quota({ until }) {
  return h('main', { class: 'app-missing', role: 'status' },
    h('h1', null, 'Beaucoup de pages ouvertes'),
    h('p', null, `Tu as ouvert beaucoup de pages en peu de temps. Les nouvelles pages rouvrent ${untilText(until)} ; celles déjà ouvertes restent lisibles.`),
    h('a', { href: HOME }, 'Retour à l’accueil'),
  );
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
  const idOf = (a) => { const m = (a.getAttribute('href') || '').match(/\/app\/videos\/([^/?#]+)/); return m ? dec(m[1]) : null; };
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
    if (MOBILE.matches) return; // mise en page mobile : pas d'aperçu flottant
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
