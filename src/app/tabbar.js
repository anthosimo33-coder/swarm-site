// Le bas de l'écran (téléphone) : la barre d'onglets qui flotte (maquette T3 « Le pouce d'abord », validée le 20/11) et,
// sur les écrans de détail, la capsule retour (lot 2, 6C « Fermer au pouce », validée le 20/11, plus bas).
//
// La barre : une pastille sous l'onglet en cours. Au toucher d'un autre onglet, elle y coule tout de suite (elle s'étire
// en route), avant même que la page change ; la page suivante la reprend là où elle était, sans saut. Seuls transform et
// opacity bougent. Marqueurs : nav[data-tabbar] (la barre), [data-tab] (un onglet, aria-current="page" pour celui en cours).

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const FLOW = 'cubic-bezier(0.3, 0.9, 0.2, 1)';
let last = null; // l'onglet où la pastille est posée (d'une page à l'autre)

const tabsOf = (nav) => [...nav.querySelectorAll('[data-tab]')];
function pillOf(nav) {
  let p = nav.querySelector(':scope > .tb-pill');
  if (!p) {
    p = document.createElement('i');
    p.className = 'tb-pill';
    p.setAttribute('aria-hidden', 'true');
    nav.prepend(p);
  }
  return p;
}
const box = (nav, i) => { const t = tabsOf(nav)[i]; return t ? { x: t.offsetLeft, w: t.offsetWidth } : null; };

function slide(nav, from, to) {
  const p = pillOf(nav), b = box(nav, to);
  if (!b) return;
  p.style.width = `${b.w}px`;
  p.style.transform = `translateX(${b.x}px)`;
  p.style.opacity = '1';
  const a = from === null || from === to ? null : box(nav, from);
  if (!a || reduced()) return;
  p.getAnimations().forEach((x) => x.cancel());
  const mid = (a.x + b.x) / 2;
  p.animate([
    { transform: `translateX(${a.x}px)` },
    { transform: `translateX(${mid}px) scaleX(1.32) scaleY(0.9)`, offset: 0.42 },
    { transform: `translateX(${b.x}px)` },
  ], { duration: 460, easing: FLOW });
}

function mount(nav) {
  const cur = tabsOf(nav).findIndex((t) => t.getAttribute('aria-current') === 'page');
  if (cur < 0) { pillOf(nav).style.opacity = '0'; last = null; return; }
  slide(nav, last, cur);
  last = cur;
}

// Le toucher : la pastille part avant la navigation.
document.addEventListener('pointerdown', (e) => {
  const t = e.target instanceof Element ? e.target.closest('nav[data-tabbar] [data-tab]') : null;
  if (!t) return;
  const nav = t.closest('nav[data-tabbar]');
  const i = tabsOf(nav).indexOf(t);
  const cur = tabsOf(nav).findIndex((x) => x.getAttribute('aria-current') === 'page');
  if (i < 0 || i === cur) return;
  slide(nav, cur, i);
  last = i;
}, true);

// ─── La capsule retour des écrans de détail (fiche, vidéo, alerte ouverte) ───
//
// Pas de barre d'onglets : en bas à gauche, une capsule « ‹ <l'écran d'où l'on vient> », en bas à droite l'action
// principale, au pouce. Marqueurs : [data-thumb] (la rangée du bas, qui entre en glissant), [data-thumb-back] (la
// capsule ; un lien : son href mène à l'écran parent), [data-thumb-act] (le groupe de droite).
// D'où l'on vient : à chaque lien suivi, l'entrée d'historique que le routeur vient de créer garde l'adresse et le nom
// de l'écran quitté (history.state.from) ; l'écran le lit pour nommer sa capsule (« Accueil », « Apps », « Hypic »…).
// Toucher la capsule revient par l'historique (même position, mêmes filtres) ; sans origine connue (adresse ouverte
// directement), son lien mène à l'écran parent, qu'elle nomme. Le bouton retour du navigateur ne change pas.
const NAMES = [[/^\/app\/?$/, 'Accueil'], [/^\/app\/apps\/?$/, 'Apps'], [/^\/app\/formats\/?$/, 'Formats'], [/^\/app\/formats\//, 'Format'],
  [/^\/app\/createurs(\/cartes)?\/?$/, 'Créateurs'], [/^\/app\/alertes\/?$/, 'Alertes'], [/^\/app\/dossiers\/?$/, 'Dossiers'],
  [/^\/app\/videos\//, 'Vidéo'], [/^\/app\/compte/, 'Réglages']];
const isVideo = (p) => p.startsWith('/app/videos/');
/** Le nom d'un écran : celui de sa liste ; une fiche (app, créateur, dossier), le titre de son onglet (« Hypic · Kopycat »). */
function nameOf(pathname) {
  for (const [re, n] of NAMES) if (re.test(pathname)) return n;
  return document.title.replace(/\s*·\s*Kopycat\s*$/, '').trim() || null;
}
const here = () => window.location.pathname + window.location.search;
let pending = null; // l'écran qu'un lien touché est en train de quitter
function stamp() {
  const p = pending;
  pending = null;
  if (!p || here() === p.path) return; // pas de navigation (même adresse, écran fermé de l'aperçu…)
  const st = window.history.state || {};
  if (st.from) return;
  // Une vidéo ouverte depuis une vidéo (« Ensuite ») : la capsule ramène d'un coup à l'écran d'avant la première
  // (main.js compte la chaîne dans history.state.viewer) ; son origine est donc celle de la vidéo quittée.
  const from = isVideo(window.location.pathname) && isVideo(p.pathname) && p.state && p.state.from ? p.state.from : { path: p.path, name: p.name };
  try { window.history.replaceState({ ...st, from }, ''); } catch (e) { /* refusé : la capsule garde l'écran parent */ }
}
document.addEventListener('click', (e) => {
  if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const t = e.target instanceof Element ? e.target : null;
  const back = t && t.closest('a[data-thumb-back]');
  if (back) {
    const st = window.history.state || {};
    const n = st.viewer || (st.from ? 1 : 0);
    if (n > 0) { e.preventDefault(); window.history.go(-n); return; }
  }
  const a = t && t.closest('a[href]');
  if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
  let url;
  try { url = new URL(a.href, window.location.href); } catch (err) { return; }
  if (url.origin !== window.location.origin || !url.pathname.startsWith('/app')) return;
  pending = { path: here(), pathname: window.location.pathname, name: nameOf(window.location.pathname), state: window.history.state };
  setTimeout(stamp, 0); // filet : le clic n'est pas arrivé jusqu'à la fenêtre
}, true);
// Le routeur (main.js, sur document) a créé l'entrée pendant ce clic : on la marque avant que le nouvel écran se dessine.
window.addEventListener('click', stamp);

/** La rangée du bas arrive : la capsule glisse de la gauche, l'action monte (pas dans l'alerte ouverte, qui arrive déjà de la droite). */
function thumb(bar) {
  if (reduced() || bar.closest('[data-swipe-pager]')) return;
  bar.querySelectorAll(':scope > [data-thumb-back], :scope > [data-thumb-act]').forEach((el, i) => {
    el.animate([{ transform: i ? 'translateY(18px)' : 'translateX(-16px)', opacity: 0 }, { transform: 'none', opacity: 1 }],
      { duration: 460, delay: i ? 60 : 0, easing: 'cubic-bezier(0.32, 0.72, 0, 1)', fill: 'backwards' });
  });
}

new MutationObserver((records) => {
  for (const rec of records) for (const n of rec.addedNodes) {
    if (n.nodeType !== 1) continue;
    const found = n.matches('nav[data-tabbar], [data-thumb]') ? [n] : n.querySelectorAll('nav[data-tabbar], [data-thumb]');
    for (const el of found) {
      if (el.hasAttribute('data-thumb')) thumb(el);
      else requestAnimationFrame(() => mount(el));
    }
  }
}).observe(document.body, { childList: true, subtree: true });
window.addEventListener('resize', () => document.querySelectorAll('nav[data-tabbar]').forEach((nav) => {
  const cur = tabsOf(nav).findIndex((t) => t.getAttribute('aria-current') === 'page');
  if (cur >= 0) slide(nav, null, cur);
}), { passive: true });
requestAnimationFrame(() => document.querySelectorAll('nav[data-tabbar]').forEach(mount));
