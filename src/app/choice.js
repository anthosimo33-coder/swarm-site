// Fenêtres de choix (Marché, Niche, Plateforme) — maquettes F1, F2, F3 validées le 20/11.
//
// - Ouverture : la fenêtre se déplie depuis le bas de son bouton, son contenu arrive en cascade.
// - Survol (souris ou clavier) : une pastille liquide glisse d'une option à l'autre (filtre « goo » de liquid.js).
// - Quand la liste change (recherche, choix), chaque option glisse de son ancienne place à la nouvelle (FLIP) ;
//   une niche cochée s'envole de sa ligne jusqu'à sa pastille, en haut ; les chiffres qui changent tombent.
// - Marché : l'aperçu du pays survolé se renouvelle en fondu.
// - Fermeture : la fenêtre rentre sous son bouton ; les boutons voisins glissent si le bouton a changé de largeur.
//
// Le composant (design/app/AppsA.dc.html) ne sait rien de ce module : il pose des marqueurs data-fl-* et ouvre ou
// ferme comme avant. Ce module observe le DOM, mesure avant la première image et n'anime que transform, opacity
// (et, pour le dépli, clip-path, le temps d'une ouverture, quand le fil principal est libre).

const OUT = 'cubic-bezier(0.25, 0.1, 0.1, 1)';
const HEAD = 'cubic-bezier(0.3, 0.9, 0.2, 1)';
const TAIL = 'cubic-bezier(0.6, 0, 0.2, 1)';
const DROP = 'cubic-bezier(0.2, 1.15, 0.4, 1)';
const FLOW = 'cubic-bezier(0.6, 0, 0.25, 1)';
const GHOST = 'data-fl-ghost';
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function ensureGoo() {
  if (document.getElementById('lq-goo')) return;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('width', '0'); svg.setAttribute('height', '0');
  svg.style.position = 'absolute';
  svg.innerHTML = '<defs><filter id="lq-goo" x="-50%" y="-50%" width="200%" height="200%" color-interpolation-filters="sRGB">'
    + '<feGaussianBlur in="SourceGraphic" stdDeviation="6" result="b"></feGaussianBlur>'
    + '<feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -10" result="g"></feColorMatrix>'
    + '<feComposite in="SourceGraphic" in2="g" operator="atop"></feComposite></filter></defs>';
  document.body.append(svg);
}

let live = null; // { pan, trig, rect, hl, posOpts, follow }
const barPos = new Map(); // bouton ou pastille de filtre → sa position gauche (pour les faire glisser)
let pendingChip = null; // { key, rect } : la niche qu'on vient de cocher

const clipFromTrigger = (pr, tr) => `inset(0px ${Math.max(0, pr.width - tr.width)}px ${Math.max(0, pr.height - tr.height)}px 0px round 10px)`;

// ─── survol liquide ───
function setupHighlight(pan) {
  const list = pan.querySelector('[data-fl-list]');
  if (!list) return null;
  ensureGoo();
  const layer = document.createElement('div');
  layer.className = 'fl-goo';
  layer.setAttribute('aria-hidden', 'true');
  const head = document.createElement('i'); head.className = 'fl-hl';
  const tail = document.createElement('i'); tail.className = 'fl-hl';
  layer.append(head, tail);
  list.append(layer);
  const hl = { list, layer, head, tail, y: null, shown: false };
  const go = (opt) => {
    if (!opt || opt.getAttribute('aria-disabled') === 'true') return;
    const y = opt.offsetTop;
    if (hl.y === y && hl.shown) return;
    const from = hl.y === null ? y : hl.y;
    for (const [b, dur, delay, ease] of [[head, 260, 0, HEAD], [tail, 420, 50, TAIL]]) {
      b.getAnimations().forEach((a) => a.cancel());
      b.style.transform = `translateY(${y}px)`;
      if (hl.shown && from !== y) b.animate([{ transform: `translateY(${from}px)` }, { transform: `translateY(${y}px)` }], { duration: dur, delay, easing: ease, fill: 'backwards' });
    }
    if (!hl.shown) { layer.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160, fill: 'forwards' }); hl.shown = true; }
    hl.y = y;
  };
  const leave = () => { if (hl.shown) { layer.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, fill: 'forwards' }); hl.shown = false; } };
  list.addEventListener('pointerover', (e) => go(e.target instanceof Element ? e.target.closest('.fl-opt') : null));
  list.addEventListener('pointerleave', leave);
  list.addEventListener('focusin', (e) => go(e.target instanceof Element ? e.target.closest('.fl-opt') : null));
  return hl;
}

const optKey = (el) => el.getAttribute('data-fl-opt');
function snapOpts(pan) {
  const m = new Map();
  pan.querySelectorAll('.fl-opt').forEach((el) => m.set(optKey(el), el.offsetTop));
  return m;
}

function open(pan) {
  const trig = document.querySelector('[data-fl-trig][aria-expanded="true"]');
  live = { pan, trig, rect: pan.getBoundingClientRect(), hl: null, posOpts: snapOpts(pan), kind: pan.getAttribute('data-fl') };
  live.hl = setupHighlight(pan);
  const follow = () => { if (live && live.pan === pan && pan.isConnected) live.rect = pan.getBoundingClientRect(); };
  live.follow = follow;
  window.addEventListener('scroll', follow, { capture: true, passive: true });
  window.addEventListener('resize', follow, { passive: true });
  if (reduced()) return;
  const pr = live.rect, tr = trig ? trig.getBoundingClientRect() : { width: 120, height: 36 };
  pan.animate([{ clipPath: clipFromTrigger(pr, tr), opacity: 0.6 }, { opacity: 1, offset: 0.25 }, { clipPath: 'inset(0px 0px 0px 0px round 20px)', opacity: 1 }], { duration: 440, easing: OUT });
  const blocks = [...pan.querySelectorAll('[data-fl-in], .fl-opt')].slice(0, 14);
  blocks.forEach((el, i) => {
    const isPv = el.hasAttribute('data-fl-pv');
    el.animate(isPv ? [{ opacity: 0, transform: 'translateX(14px)' }, { opacity: 1, transform: 'none' }] : [{ opacity: 0, transform: 'translateY(-8px)' }, { opacity: 1, transform: 'none' }],
      { duration: 420, delay: isPv ? 140 : 60 + i * 28, easing: OUT, fill: 'backwards' });
  });
}

function close(pan) {
  const st = live && live.pan === pan ? live : null;
  live = null;
  if (st && st.follow) { window.removeEventListener('scroll', st.follow, { capture: true }); window.removeEventListener('resize', st.follow); }
  if (!st || reduced()) return;
  const trig = st.trig && st.trig.isConnected ? st.trig : document.querySelector(`[data-fl-trig="${st.trig ? st.trig.getAttribute('data-fl-trig') : ''}"]`);
  const r = st.rect;
  pan.getAnimations({ subtree: true }).forEach((a) => a.cancel());
  pan.setAttribute(GHOST, '');
  pan.setAttribute('aria-hidden', 'true');
  Object.assign(pan.style, { position: 'fixed', left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, margin: '0', pointerEvents: 'none', zIndex: '60' });
  document.body.append(pan);
  const tr = trig ? trig.getBoundingClientRect() : { width: 120, height: 36 };
  pan.querySelectorAll('[data-fl-in], .fl-opt').forEach((el) => el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 110, fill: 'forwards' }));
  const a = pan.animate([{ clipPath: 'inset(0px 0px 0px 0px round 20px)', opacity: 1 }, { opacity: 1, offset: 0.7 }, { clipPath: clipFromTrigger(r, tr), opacity: 0 }], { duration: 320, delay: 40, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'both' });
  a.finished.then(() => pan.remove(), () => pan.remove());
}

// Les options qui ont changé de place glissent ; les nouvelles arrivent ; une niche cochée s'envole vers sa pastille.
function flowOptions() {
  if (!live || !live.pan.isConnected || reduced()) { if (live) live.posOpts = snapOpts(live.pan); return; }
  const before = live.posOpts;
  const now = snapOpts(live.pan);
  live.pan.querySelectorAll('.fl-opt').forEach((el) => {
    const k = optKey(el), y = now.get(k), y0 = before.get(k);
    if (y0 === undefined) el.animate([{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'none' }], { duration: 300, easing: OUT, fill: 'backwards' });
    else if (Math.abs(y0 - y) > 1) el.animate([{ transform: `translateY(${y0 - y}px)` }, { transform: 'none' }], { duration: 380, easing: FLOW, fill: 'backwards' });
  });
  live.posOpts = now;
  if (live.hl && live.hl.shown) {
    const hovered = live.pan.querySelector('.fl-opt:hover');
    if (hovered) { live.hl.y = hovered.offsetTop; live.hl.head.style.transform = live.hl.tail.style.transform = `translateY(${live.hl.y}px)`; }
  }
}

function flyChip() {
  if (!pendingChip || !live || reduced()) { pendingChip = null; return; }
  const chip = live.pan.querySelector(`[data-fl-chip="${CSS.escape(pendingChip.key)}"]`);
  if (!chip) return;
  const to = chip.getBoundingClientRect(), from = pendingChip.rect;
  pendingChip = null;
  chip.animate([{ transform: `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(0.92)`, opacity: 0.6 }, { opacity: 1, offset: 0.3 }, { transform: 'none', opacity: 1 }],
    { duration: 480, easing: 'cubic-bezier(0.5, 0, 0.2, 1)' });
}

// Les boutons de filtre (et les pastilles « retirer ») glissent quand l'un d'eux change de largeur.
let barRow = null;
function flowBar() {
  const items = [...document.querySelectorAll('[data-fl-trig]')];
  if (!items.length) return;
  const row = items[0].parentElement;
  if (row !== barRow) { barRow = row; barPos.clear(); } // autre écran : on repart de zéro, sans animer
  const all = [...row.children].filter((el) => el.matches('[data-fl-trig], .sw-badge'));
  for (const el of all) {
    const key = el.getAttribute('data-fl-trig') || 'chip:' + el.textContent.trim();
    const x = el.offsetLeft, x0 = barPos.get(key);
    if (x0 !== undefined && Math.abs(x0 - x) > 1 && !reduced()) el.animate([{ transform: `translateX(${x0 - x}px)` }, { transform: 'none' }], { duration: 420, easing: 'cubic-bezier(0.34, 1.3, 0.64, 1)' });
    else if (x0 === undefined && barPos.size && el.classList.contains('sw-badge') && !reduced()) el.animate([{ opacity: 0, transform: 'scale(0.85)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: DROP });
    barPos.set(key, x);
  }
}

// Un chiffre ou une valeur qui change tombe d'en haut.
const rolled = new WeakSet();
function roll(el) {
  if (rolled.has(el) || reduced()) return;
  rolled.add(el);
  requestAnimationFrame(() => rolled.delete(el));
  el.animate([{ transform: 'translateY(-0.55em)', opacity: 0, filter: 'blur(2px)' }, { transform: 'none', opacity: 1, filter: 'blur(0)' }], { duration: 360, easing: DROP });
}

let pvQueued = false;
function refreshPreview() {
  if (pvQueued || !live || reduced()) return;
  pvQueued = true;
  queueMicrotask(() => {
    pvQueued = false;
    const pv = live && live.pan.querySelector('[data-fl-pv-in]');
    if (pv) { pv.getAnimations().forEach((a) => a.cancel()); pv.animate([{ opacity: 0.25, transform: 'translateY(8px)', filter: 'blur(3px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }], { duration: 300, easing: OUT }); }
  });
}

// L'option qu'on coche : sa place avant le nouveau rendu.
document.addEventListener('click', (e) => {
  if (!(e.target instanceof Element)) return;
  // Toute fenêtre à pastilles (Niche d'Apps ; Niche, App, Contenu de Créateurs) : l'option cochée s'envole vers la sienne.
  const opt = e.target.closest('[data-fl] .fl-opt');
  if (opt && opt.closest('[data-fl]').querySelector('.fl-tray') && opt.getAttribute('aria-selected') !== 'true') {
    const lab = opt.querySelector('.fl-lab');
    pendingChip = { key: optKey(opt), rect: (lab || opt).getBoundingClientRect() };
  }
  if (!barPos.size) flowBar();
}, true);

new MutationObserver((records) => {
  let opts = false, bar = false, chip = false;
  for (const rec of records) {
    if (rec.type === 'characterData') {
      const host = rec.target.parentElement && rec.target.parentElement.closest('[data-roll], [data-fl-pv-in]');
      if (host) { if (host.hasAttribute('data-roll')) roll(host); else refreshPreview(); }
      if (rec.target.parentElement && rec.target.parentElement.closest('[data-fl-trig]')) bar = true;
      continue;
    }
    for (const n of rec.removedNodes) if (n.nodeType === 1 && !n.isConnected && n.hasAttribute('data-fl') && !n.hasAttribute(GHOST)) close(n);
    for (const n of rec.addedNodes) if (n.nodeType === 1 && n.hasAttribute('data-fl') && !n.hasAttribute(GHOST) && (!live || live.pan !== n)) open(n);
    const t = rec.target;
    if (t.nodeType !== 1) continue;
    if (live && live.pan.contains(t)) {
      if (t.closest('[data-fl-list]')) opts = true;
      if (t.closest('.fl-tray')) chip = true;
      if (t.closest('[data-fl-pv-in]')) refreshPreview();
    }
    const r = t.closest('[data-roll]');
    if (r) roll(r);
    if (t.closest && (t.matches('[data-fl-trig]') || t.closest('[data-fl-trig]') || [...t.children].some((c) => c.hasAttribute && c.hasAttribute('data-fl-trig')))) bar = true;
  }
  if (opts) flowOptions();
  if (chip) flyChip();
  if (bar) flowBar();
}).observe(document.body, { childList: true, subtree: true, characterData: true });
