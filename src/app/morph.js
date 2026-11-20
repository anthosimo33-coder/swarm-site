// Aperçu d'une app (écran Apps, ordinateur) : la ligne cliquée devient le panneau — maquette M2 validée le 20/11.
//
// Fluidité d'abord : on mesure tout UNE fois, avant la première image, puis seules des propriétés que le
// compositeur anime sans recalculer la page bougent : transform, opacity, clip-path. Le flou du fond est fixe
// (backdrop-filter) et seule son opacité varie ; la ligne choisie reste nette par un trou dans le masque du voile.
//
// Le composant (design/app/AppsA.dc.html) ne sait rien de tout ça : il pose des marqueurs data-* et ouvre ou
// ferme le panneau comme avant. Ce module voit le panneau arriver ou partir (MutationObserver) et joue
// l'animation ; à la fermeture, il garde une copie du panneau le temps qu'il rentre dans sa ligne.
//   data-pv-row   la ligne du tableau          data-mo-ico / data-mo-name   l'icône et le nom qui s'envolent
//   data-morph    le panneau                   data-morph-veil              le voile derrière
//   data-mo-in    un bloc qui entre en cascade data-mo-count               un chiffre qui défile
//   data-mo-wipe  un tracé qui se dessine      data-mo-pop / data-mo-grow   des cases qui s'allument, des barres qui montent

// Ouverture : départ doux, milieu franc, longue arrivée (la moitié du chemin à 20 % du temps) — un départ trop
// sec (les 2/3 du chemin en 100 ms) se lit comme un saut. Fermeture : plus courte, même dessin.
const OPEN = 620;
const CLOSE = 440;
const OUT = 'cubic-bezier(0.25, 0.1, 0.1, 1)';
const IN_OUT = 'cubic-bezier(0.32, 0, 0.15, 1)';
const TEMP = 'data-mo-temp';
const GHOST = 'data-mo-ghost'; // la copie qui rentre dans sa ligne : l'observateur ne la prend pas pour une ouverture

let source = null;
let live = null;

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const rect = (el) => el.getBoundingClientRect();
const inset = (r, W, H, radius) => `inset(${r.top}px ${W - r.right}px ${H - r.bottom}px ${r.left}px round ${radius}px)`;

// La ligne cliquée, retenue avant que le composant ne se redessine.
document.addEventListener('click', (e) => {
  const row = e.target instanceof Element ? e.target.closest('[data-pv-row]') : null;
  if (row) source = row;
}, true);

function hole(veil, r) {
  const m = `linear-gradient(#000 0 0) 0 0 / 100% 100% no-repeat, linear-gradient(#000 0 0) ${r.left}px ${r.top}px / ${r.width}px ${r.height}px no-repeat`;
  veil.style.setProperty('-webkit-mask', m);
  veil.style.setProperty('-webkit-mask-composite', 'xor');
  veil.style.setProperty('mask', m);
  veil.style.setProperty('mask-composite', 'exclude');
}

function temp(aside, style) {
  const el = document.createElement('div');
  el.setAttribute(TEMP, '');
  el.setAttribute('aria-hidden', 'true');
  Object.assign(el.style, { position: 'absolute', pointerEvents: 'none', margin: '0' }, style);
  aside.append(el);
  return el;
}

/** Un clone posé sur `from`, qui vole jusqu'à `to` (translate + scale, rien d'autre). */
function flyer(aside, el, from, to, ar, duration, easing) {
  const c = el.cloneNode(true);
  c.setAttribute(TEMP, '');
  c.removeAttribute('data-mo-ico');
  c.removeAttribute('data-mo-name');
  Object.assign(c.style, {
    position: 'absolute', margin: '0', left: `${from.left - ar.left}px`, top: `${from.top - ar.top}px`, width: `${from.width}px`, height: `${from.height}px`,
    zIndex: '3', transformOrigin: '0 0', pointerEvents: 'none', whiteSpace: 'nowrap', visibility: 'visible', opacity: '1', willChange: 'transform',
  });
  aside.append(c);
  const s = to.height / from.height;
  const anim = c.animate([{ transform: 'none' }, { transform: `translate(${to.left - from.left}px, ${to.top - from.top}px) scale(${s})` }], { duration, easing, fill: 'forwards' });
  return { c, anim };
}

/** « 120,6 M » défile de 0 à 120,6, dans le même nœud texte (le composant garde la main dessus). */
function countUp(el, delay, duration) {
  const node = el.childNodes.length === 1 && el.firstChild.nodeType === 3 ? el.firstChild : null;
  if (!node) return;
  const text = node.data;
  const m = text.match(/^(\D*?)(\d[\d   ]*(?:,\d+)?)(.*)$/s);
  if (!m) return;
  const digits = m[2].replace(/[   ]/g, '');
  const value = parseFloat(digits.replace(',', '.'));
  const dec = (digits.split(',')[1] || '').length;
  if (!Number.isFinite(value) || value === 0) return;
  const nf = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
  const fmt = (v) => m[1] + nf.format(v) + m[3];
  const t0 = performance.now() + delay;
  let last = fmt(0);
  node.data = last;
  const step = (now) => {
    if (!node.isConnected || node.data !== last) return; // le composant a réécrit le chiffre : il garde la main
    const p = Math.min(1, Math.max(0, (now - t0) / duration));
    last = p === 1 ? text : fmt(value * (1 - Math.pow(2, -10 * p)));
    node.data = last;
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function details(aside, delay) {
  aside.querySelectorAll('[data-mo-in]').forEach((el, i) => {
    el.animate([{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }], { duration: 460, delay: delay + i * 45, easing: OUT, fill: 'backwards' });
  });
  aside.querySelectorAll('[data-mo-count]').forEach((el) => countUp(el, delay + 60, 760));
  aside.querySelectorAll('[data-mo-wipe]').forEach((el) => {
    el.animate([{ clipPath: 'inset(-8px 100% -8px -8px)' }, { clipPath: 'inset(-8px -8px -8px -8px)' }], { duration: 760, delay: delay + 80, easing: IN_OUT, fill: 'backwards' });
  });
  aside.querySelectorAll('[data-mo-pop]').forEach((box) => [...box.children].forEach((el, i) => {
    el.animate([{ opacity: 0.15, transform: 'scale(0.6)' }, { opacity: 1, transform: 'none' }], { duration: 320, delay: delay + 140 + i * 22, easing: OUT, fill: 'backwards' });
  }));
  aside.querySelectorAll('[data-mo-grow]').forEach((box) => [...box.children].forEach((el, i) => {
    el.style.transformOrigin = 'bottom';
    el.animate([{ transform: 'scaleY(0)' }, { transform: 'none' }], { duration: 520, delay: delay + 120 + i * 30, easing: OUT, fill: 'backwards' });
  }));
}

function open(aside, veil) {
  const row = source && source.isConnected ? source : null;
  source = null;
  if (reduced() || !row) {
    aside.animate([{ opacity: 0, transform: 'translateX(24px)' }, { opacity: 1, transform: 'none' }], { duration: 280, easing: OUT });
    if (veil) veil.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220 });
    live = { aside, veil, row: null, path: location.pathname };
    return;
  }
  // 1. Tout mesurer, une seule fois.
  const W = window.innerWidth, H = window.innerHeight;
  const rr = rect(row), ar = rect(aside);
  const rIco = row.querySelector('[data-mo-ico]'), rName = row.querySelector('[data-mo-name]');
  const aIco = aside.querySelector('[data-mo-ico]'), aName = aside.querySelector('[data-mo-name]');
  const ri = rIco && rect(rIco), rn = rName && rect(rName), ai = aIco && rect(aIco), an = aName && rect(aName);
  const cs = getComputedStyle(aside);
  const bg = cs.backgroundColor;
  const radius = parseFloat(cs.borderTopLeftRadius) || 24;

  // 2. Le voile : flou fixe, opacité qui monte, la ligne reste nette.
  if (veil) {
    hole(veil, rr);
    veil.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 420, easing: 'linear' });
  }

  // 3. La surface qui part de la ligne et devient le panneau (le fond et l'ombre du panneau la remplacent ensuite).
  const bg0 = aside.style.background, shadow0 = aside.style.boxShadow;
  aside.style.background = 'transparent';
  aside.style.boxShadow = 'none';
  const surf = temp(aside, { left: `${-ar.left}px`, top: `${-ar.top}px`, width: `${W}px`, height: `${H}px`, zIndex: '-1', background: bg, willChange: 'clip-path, opacity' });
  const shade = temp(aside, { inset: '0', zIndex: '-2', borderRadius: `${radius}px`, boxShadow: cs.boxShadow, opacity: '0', willChange: 'opacity' });
  const grow = surf.animate([
    { clipPath: inset(rr, W, H, 14), opacity: 0 },
    { opacity: 1, offset: 0.18 },
    { clipPath: inset(ar, W, H, radius), opacity: 1 },
  ], { duration: OPEN, easing: OUT, fill: 'forwards' });
  shade.animate([{ opacity: 0 }, { opacity: 1 }], { duration: OPEN * 0.6, delay: OPEN * 0.4, easing: 'linear', fill: 'forwards' });

  // 4. L'icône et le nom quittent la ligne pour l'en-tête.
  const flights = [];
  if (ri && ai) flights.push(flyer(aside, rIco, ri, ai, ar, OPEN, OUT));
  if (rn && an) flights.push(flyer(aside, rName, rn, an, ar, OPEN, OUT));
  for (const el of [rIco, rName]) if (el) el.style.visibility = 'hidden';
  for (const el of [aIco, aName]) if (el) el.style.opacity = '0';

  // 5. Le reste arrive en cascade, une fois la surface à moitié ouverte.
  details(aside, OPEN * 0.32);

  const state = { aside, veil, row, path: location.pathname, hidden: [rIco, rName].filter(Boolean) };
  live = state;
  grow.finished.then(() => {
    if (!aside.isConnected) return;
    aside.style.background = bg0;
    aside.style.boxShadow = shadow0;
    for (const el of [aIco, aName]) if (el) el.style.opacity = '';
    for (const { c } of flights) c.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, fill: 'forwards' }).finished.then(() => c.remove(), () => c.remove());
    surf.remove();
    shade.remove();
  }, () => {});

  // La page défile sous le voile : le trou suit la ligne.
  let raf = 0;
  state.follow = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; if (veil && row.isConnected) hole(veil, rect(row)); }); };
  window.addEventListener('scroll', state.follow, { capture: true, passive: true });
  window.addEventListener('resize', state.follow, { passive: true });
}

function close(aside, veil) {
  const st = live && live.aside === aside ? live : null;
  live = null;
  if (st && st.follow) {
    window.removeEventListener('scroll', st.follow, { capture: true });
    window.removeEventListener('resize', st.follow);
  }
  const restore = () => { if (st) for (const el of st.hidden || []) el.style.visibility = ''; };
  const row = st && st.row && st.row.isConnected ? st.row : null;
  // Vers la fiche complète, ou sans ligne d'origine : le panneau part sans retour à la ligne.
  if (!row || reduced() || location.pathname !== st.path) { restore(); return; }

  // Une copie du panneau et du voile, le temps de l'animation (le composant les a déjà retirés).
  aside.getAnimations({ subtree: true }).forEach((a) => a.cancel());
  aside.querySelectorAll(`[${TEMP}]`).forEach((el) => el.remove());
  aside.setAttribute(GHOST, '');
  aside.style.pointerEvents = 'none';
  aside.removeAttribute('aria-modal');
  aside.setAttribute('aria-hidden', 'true');
  const ghosts = [aside];
  veil = veil || (st && st.veil && !st.veil.isConnected ? st.veil : null);
  if (veil) { veil.setAttribute(GHOST, ''); veil.style.pointerEvents = 'none'; veil.tabIndex = -1; document.body.append(veil); ghosts.push(veil); }
  document.body.append(aside);

  const W = window.innerWidth, H = window.innerHeight;
  const ar = rect(aside), rr = rect(row);
  const rIco = row.querySelector('[data-mo-ico]'), rName = row.querySelector('[data-mo-name]');
  const aIco = aside.querySelector('[data-mo-ico]'), aName = aside.querySelector('[data-mo-name]');
  const ri = rIco && rect(rIco), rn = rName && rect(rName), ai = aIco && rect(aIco), an = aName && rect(aName);
  const cs = getComputedStyle(aside);
  const radius = parseFloat(cs.borderTopLeftRadius) || 24;

  // Le contenu s'efface d'abord, puis la surface rentre dans sa ligne, l'icône et le nom avec elle.
  aside.querySelectorAll('[data-mo-in]').forEach((el) => el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 140, easing: 'linear', fill: 'forwards' }));
  const surf = temp(aside, { left: `${-ar.left}px`, top: `${-ar.top}px`, width: `${W}px`, height: `${H}px`, zIndex: '-1', background: cs.backgroundColor, willChange: 'clip-path, opacity' });
  aside.style.background = 'transparent';
  aside.style.boxShadow = 'none';
  const back = surf.animate([
    { clipPath: inset(ar, W, H, radius), opacity: 1 },
    { opacity: 1, offset: 0.8 },
    { clipPath: inset(rr, W, H, 14), opacity: 0 },
  ], { duration: CLOSE, delay: 40, easing: IN_OUT, fill: 'both' });
  const flights = [];
  if (ai && ri) flights.push(flyer(aside, aIco, ai, ri, ar, CLOSE, IN_OUT));
  if (an && rn) flights.push(flyer(aside, aName, an, rn, ar, CLOSE, IN_OUT));
  for (const el of [aIco, aName]) if (el) el.style.visibility = 'hidden';
  if (veil) veil.animate([{ opacity: 1 }, { opacity: 0 }], { duration: CLOSE + 60, easing: 'linear', fill: 'forwards' });

  back.finished.then(() => {
    restore();
    for (const g of ghosts) g.remove();
  }, () => { restore(); for (const g of ghosts) g.remove(); });
}

new MutationObserver((records) => {
  for (const rec of records) {
    let added = null, addedVeil = null, removed = null;
    for (const n of rec.addedNodes) {
      if (n.nodeType !== 1 || n.hasAttribute(GHOST)) continue;
      if (n.hasAttribute('data-morph')) added = n;
      else if (n.hasAttribute('data-morph-veil')) addedVeil = n;
    }
    for (const n of rec.removedNodes) {
      if (n.nodeType !== 1 || n.isConnected || n.hasAttribute(GHOST)) continue; // déplacé par le composant, ou copie qui s'en va
      if (n.hasAttribute('data-morph')) removed = n;
    }
    if (removed) close(removed, null);
    if (added && (!live || live.aside !== added)) open(added, addedVeil || (added.previousElementSibling && added.previousElementSibling.hasAttribute('data-morph-veil') ? added.previousElementSibling : null));
  }
}).observe(document.body, { childList: true, subtree: true });
