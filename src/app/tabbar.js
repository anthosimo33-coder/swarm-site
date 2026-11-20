// La barre du bas qui flotte (téléphone) — maquette T3 « Le pouce d'abord », validée le 20/11.
//
// Une pastille sous l'onglet en cours. Au toucher d'un autre onglet, elle y coule tout de suite (elle s'étire en route),
// avant même que la page change ; la page suivante la reprend là où elle était, sans saut. Seuls transform et opacity
// bougent. Marqueurs : nav[data-tabbar] (la barre), [data-tab] (un onglet, aria-current="page" pour celui en cours).

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

new MutationObserver((records) => {
  for (const rec of records) for (const n of rec.addedNodes) {
    if (n.nodeType !== 1) continue;
    const navs = n.matches('nav[data-tabbar]') ? [n] : [...n.querySelectorAll('nav[data-tabbar]')];
    navs.forEach((nav) => requestAnimationFrame(() => mount(nav)));
  }
}).observe(document.body, { childList: true, subtree: true });
window.addEventListener('resize', () => document.querySelectorAll('nav[data-tabbar]').forEach((nav) => {
  const cur = tabsOf(nav).findIndex((t) => t.getAttribute('aria-current') === 'page');
  if (cur >= 0) slide(nav, null, cur);
}), { passive: true });
requestAnimationFrame(() => document.querySelectorAll('nav[data-tabbar]').forEach(mount));
