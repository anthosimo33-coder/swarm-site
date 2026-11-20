// Feuilles du bas (téléphone) — maquette T2 « Tout passe par des feuilles », validée le 20/11.
//
// - Ouverture : la feuille monte avec la courbe des feuilles d'iOS ; ouverte depuis une ligne ([data-sheet-src]), elle
//   part du haut de cette ligne et l'icône et le nom de la ligne s'envolent vers son en-tête.
// - Au doigt : tirée vers le bas (quand son contenu est en haut), elle suit le doigt, le voile pâlit ; lâchée assez
//   bas ou assez vite, elle part et se ferme, sinon elle revient avec un ressort.
// - Dans une liste d'options ([data-sheet-opts]), une pastille suit le doigt d'une option à l'autre.
// - Fermeture (bouton, voile, choix) : une copie de la feuille redescend, le voile s'efface.
//
// Les écrans posent des marqueurs et ouvrent ou ferment comme avant ; ce module observe le DOM. Seuls transform et
// opacity bougent ; les gestes du doigt passent par requestAnimationFrame.
//   data-sheet         la feuille (position fixe, en bas)    data-sheet-veil   le voile derrière (un clic ferme)
//   data-sheet-src     une ligne qui ouvre une feuille       data-sheet-ico / data-sheet-name : ce qui s'envole
//   data-sheet-in      un bloc qui arrive en cascade         data-sheet-opts / data-sheet-opt : la liste, une option

const EASE = 'cubic-bezier(0.32, 0.72, 0, 1)'; // la courbe des feuilles d'iOS
const BACK = 'cubic-bezier(0.34, 1.25, 0.64, 1)'; // le ressort du retour
const OPEN = 540;
const CLOSE = 320;
const GHOST = 'data-sheet-ghost';
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let src = null;
let srcAt = 0;
document.addEventListener('pointerdown', (e) => {
  const s = e.target instanceof Element ? e.target.closest('[data-sheet-src]') : null;
  if (s) { src = s; srcAt = performance.now(); }
}, true);

const veilOf = (sheet) => {
  const p = sheet.previousElementSibling;
  if (p && p.hasAttribute('data-sheet-veil')) return p;
  return sheet.parentElement ? sheet.parentElement.querySelector(':scope > [data-sheet-veil]') : null;
};

function flyer(el, from, to) {
  const c = el.cloneNode(true);
  c.removeAttribute('data-sheet-ico');
  c.removeAttribute('data-sheet-name');
  Object.assign(c.style, { position: 'fixed', margin: '0', left: `${from.left}px`, top: `${from.top}px`, width: `${from.width}px`, height: `${from.height}px`,
    zIndex: '80', transformOrigin: '0 0', pointerEvents: 'none', whiteSpace: 'nowrap', willChange: 'transform' });
  document.body.append(c);
  const s = to.height / Math.max(1, from.height);
  const a = c.animate([{ transform: 'none' }, { transform: `translate(${to.left - from.left}px, ${to.top - from.top}px) scale(${s})` }], { duration: OPEN, easing: EASE, fill: 'forwards' });
  return { c, a };
}

// La place de la feuille ouverte, gardée : quand l'écran la retire, elle n'a plus de rectangle (nœud détaché).
function remember(sheet) {
  if (sheet.getAnimations().some((a) => a.playState === 'running')) return;
  const r = sheet.getBoundingClientRect();
  if (r.height > 0) sheet.__rect = { left: r.left, top: r.top, width: r.width, height: r.height };
}
function watchSize(sheet) {
  if (sheet.__ro || typeof ResizeObserver === 'undefined') return;
  sheet.__ro = new ResizeObserver(() => remember(sheet));
  sheet.__ro.observe(sheet);
}

function open(sheet) {
  const veil = veilOf(sheet);
  { const r0 = sheet.getBoundingClientRect(); sheet.__rect = { left: r0.left, top: r0.top, width: r0.width, height: r0.height }; }
  watchSize(sheet);
  if (sheet.getAttribute('data-sheet-anim') === 'off') { setupDrag(sheet, veil); setupOpts(sheet); return; }
  if (reduced()) {
    sheet.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160 });
    if (veil) veil.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160 });
    setupDrag(sheet, veil); setupOpts(sheet);
    return;
  }
  const r = sheet.getBoundingClientRect();
  const row = src && src.isConnected && performance.now() - srcAt < 900 ? src : null;
  src = null;
  if (veil) veil.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, easing: 'linear' });
  if (row) {
    // La feuille part du haut de la ligne touchée : son bord haut y est posé, elle monte jusqu'à sa place.
    const rr = row.getBoundingClientRect();
    const dy = Math.max(0, Math.min(r.height, rr.top - r.top));
    sheet.animate([{ transform: `translateY(${dy}px)`, opacity: 0 }, { opacity: 1, offset: 0.12 }, { transform: 'none', opacity: 1 }], { duration: OPEN, easing: EASE });
    const pairs = [['[data-sheet-ico]'], ['[data-sheet-name]']].map(([q]) => [row.querySelector(q), sheet.querySelector(q)]).filter(([a, b]) => a && b);
    const flights = pairs.map(([a, b]) => { const f = flyer(a, a.getBoundingClientRect(), b.getBoundingClientRect()); b.style.opacity = '0'; a.style.visibility = 'hidden'; return { f, a, b }; });
    if (flights.length) setTimeout(() => flights.forEach(({ f, a, b }) => {
      b.style.opacity = '';
      a.style.visibility = '';
      f.c.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 90, fill: 'forwards' }).finished.then(() => f.c.remove(), () => f.c.remove());
    }), OPEN);
  } else {
    sheet.animate([{ transform: `translateY(${r.height}px)` }, { transform: 'none' }], { duration: OPEN, easing: EASE });
  }
  sheet.querySelectorAll('[data-sheet-in]').forEach((el, i) => {
    el.animate([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }], { duration: 420, delay: 110 + i * 34, easing: EASE, fill: 'backwards' });
  });
  setupDrag(sheet, veil);
  setupOpts(sheet);
  setTimeout(() => { if (sheet.isConnected) remember(sheet); }, OPEN + 40);
}

function close(sheet, veil) {
  if (sheet.__ro) { sheet.__ro.disconnect(); sheet.__ro = null; }
  if (sheet.hasAttribute('data-sheet-gone') || reduced()) return; // partie au doigt : déjà hors de l'écran
  const r = sheet.__rect;
  if (!r) return;
  sheet.getAnimations({ subtree: true }).forEach((a) => a.cancel());
  sheet.setAttribute(GHOST, '');
  sheet.setAttribute('aria-hidden', 'true');
  sheet.style.pointerEvents = 'none';
  // Posée là où elle était, en position fixe (elle pouvait vivre dans un conteneur, en position absolue).
  Object.assign(sheet.style, { position: 'fixed', left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px`, right: 'auto', bottom: 'auto', margin: '0', zIndex: '75', maxHeight: 'none' });
  document.body.append(sheet);
  const ghosts = [sheet];
  if (veil && !veil.isConnected) {
    veil.setAttribute(GHOST, ''); veil.tabIndex = -1;
    Object.assign(veil.style, { position: 'fixed', inset: '0', width: '100%', height: '100%', zIndex: '74', pointerEvents: 'none' });
    document.body.insertBefore(veil, sheet); ghosts.push(veil);
  }
  const from = sheet.style.transform && sheet.style.transform !== 'none' ? sheet.style.transform : 'translateY(0px)';
  const a = sheet.animate([{ transform: from }, { transform: `translateY(${r.height + 24}px)` }], { duration: CLOSE, easing: 'cubic-bezier(0.4, 0, 0.6, 1)', fill: 'forwards' });
  if (ghosts[1]) ghosts[1].animate([{ opacity: getComputedStyle(ghosts[1]).opacity }, { opacity: 0 }], { duration: CLOSE, easing: 'linear', fill: 'forwards' });
  a.finished.then(() => ghosts.forEach((g) => g.remove()), () => ghosts.forEach((g) => g.remove()));
}

// ─── au doigt : tirer la feuille vers le bas ───
function scrolledInside(sheet, target) {
  for (let el = target instanceof Element ? target : null; el && el !== sheet.parentElement; el = el.parentElement) {
    if (el.scrollTop > 0) return true;
    if (el === sheet) break;
  }
  return false;
}
function setupDrag(sheet, veil) {
  if (sheet.__sheetDrag) return;
  sheet.__sheetDrag = true;
  let y0 = null, x0 = 0, dy = 0, on = false, last = 0, lastT = 0, v = 0, raf = 0, H = 0;
  const paint = () => {
    raf = 0;
    const y = dy > 0 ? dy : dy * 0.18;
    sheet.style.transform = `translateY(${y}px)`;
    if (veil) veil.style.opacity = String(Math.max(0.08, 1 - Math.max(0, dy) / H));
  };
  const start = (x, y, target) => {
    if (target instanceof Element && target.closest('input, textarea, select, [role="slider"], [data-sheet-nodrag]')) return;
    if (scrolledInside(sheet, target)) return;
    y0 = y; x0 = x; dy = 0; on = false; last = y; lastT = performance.now(); v = 0; H = sheet.getBoundingClientRect().height;
  };
  const move = (x, y, e) => {
    if (y0 === null) return;
    const d = y - y0;
    if (!on) {
      if (Math.abs(x - x0) > 10 && Math.abs(x - x0) > Math.abs(d)) { y0 = null; return; }
      if (d > 6) { on = true; sheet.getAnimations().forEach((a) => a.cancel()); }
      else if (d < -6) { y0 = null; return; }
      else return;
    }
    if (e && e.cancelable) e.preventDefault();
    const t = performance.now();
    v = 0.7 * v + 0.3 * ((y - last) / Math.max(1, t - lastT));
    last = y; lastT = t; dy = d;
    if (!raf) raf = requestAnimationFrame(paint);
  };
  const end = () => {
    if (y0 === null) return;
    y0 = null;
    if (!on) return;
    on = false;
    if (raf) { cancelAnimationFrame(raf); raf = 0; paint(); }
    const cur = sheet.style.transform || 'none';
    if (dy > H * 0.28 || v > 0.55) {
      // Elle part au doigt, puis l'écran la ferme (par son voile, comme un clic dehors).
      const ms = Math.max(140, Math.min(300, (H - dy) / Math.max(0.8, v)));
      sheet.setAttribute('data-sheet-gone', '');
      const a = sheet.animate([{ transform: cur }, { transform: `translateY(${H + 24}px)` }], { duration: ms, easing: 'cubic-bezier(0.2, 0.6, 0.4, 1)', fill: 'forwards' });
      if (veil) veil.animate([{ opacity: veil.style.opacity || 1 }, { opacity: 0 }], { duration: ms, fill: 'forwards' });
      a.finished.then(() => {
        const close = veil && veil.isConnected ? veil : sheet.querySelector('[data-sheet-close]');
        if (close) close.click();
      }, () => {});
      return;
    }
    sheet.style.transform = '';
    sheet.animate([{ transform: cur }, { transform: 'none' }], { duration: 420, easing: BACK });
    if (veil) { const o = veil.style.opacity || '1'; veil.style.opacity = ''; veil.animate([{ opacity: o }, { opacity: 1 }], { duration: 300 }); }
  };
  sheet.addEventListener('touchstart', (e) => { if (e.touches.length === 1) start(e.touches[0].clientX, e.touches[0].clientY, e.target); }, { passive: true });
  sheet.addEventListener('touchmove', (e) => { if (e.touches.length === 1) move(e.touches[0].clientX, e.touches[0].clientY, e); }, { passive: false });
  sheet.addEventListener('touchend', end, { passive: true });
  sheet.addEventListener('touchcancel', end, { passive: true });
  // À la souris (ordinateur étroit, essais) : le même geste.
  sheet.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    start(e.clientX, e.clientY, e.target);
    if (y0 === null) return;
    const mv = (ev) => move(ev.clientX, ev.clientY, ev);
    const up = () => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); end(); };
    window.addEventListener('pointermove', mv);
    window.addEventListener('pointerup', up);
  });
}

// ─── la pastille qui suit le doigt dans une liste d'options ───
function setupOpts(sheet) {
  sheet.querySelectorAll('[data-sheet-opts]').forEach((list) => {
    if (list.__sheetOpts) return;
    list.__sheetOpts = true;
    if (getComputedStyle(list).position === 'static') list.style.position = 'relative';
    const pill = document.createElement('i');
    pill.className = 'sh-hl';
    pill.setAttribute('aria-hidden', 'true');
    list.prepend(pill);
    let shown = false, cur = null;
    const go = (opt) => {
      if (!opt || opt === cur) return;
      const lr = list.getBoundingClientRect(), r = opt.getBoundingClientRect();
      const x = r.left - lr.left + list.scrollLeft, y = r.top - lr.top + list.scrollTop;
      const from = cur && shown ? pill.style.transform : null;
      pill.style.width = `${r.width}px`;
      pill.style.height = `${r.height}px`;
      pill.style.transform = `translate(${x}px, ${y}px)`;
      if (from && !reduced()) pill.animate([{ transform: from }, { transform: pill.style.transform }], { duration: 260, easing: 'cubic-bezier(0.3, 0.9, 0.2, 1)' });
      if (!shown) { pill.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 120, fill: 'forwards' }); shown = true; }
      cur = opt;
    };
    const hide = () => { if (shown) { pill.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, fill: 'forwards' }); shown = false; cur = null; } };
    const at = (x, y) => { const el = document.elementFromPoint(x, y); return el ? el.closest('[data-sheet-opt]') : null; };
    list.addEventListener('touchstart', (e) => go(at(e.touches[0].clientX, e.touches[0].clientY)), { passive: true });
    list.addEventListener('touchmove', (e) => go(at(e.touches[0].clientX, e.touches[0].clientY)), { passive: true });
    list.addEventListener('touchend', () => setTimeout(hide, 160), { passive: true });
    list.addEventListener('pointerover', (e) => { if (e.pointerType === 'mouse') go(e.target instanceof Element ? e.target.closest('[data-sheet-opt]') : null); });
    list.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') hide(); });
  });
}

new MutationObserver((records) => {
  for (const rec of records) {
    for (const n of rec.removedNodes) {
      if (n.nodeType !== 1 || n.isConnected || n.hasAttribute(GHOST)) continue;
      const gone = n.hasAttribute('data-sheet') ? [n] : [...n.querySelectorAll('[data-sheet]')];
      for (const s of gone) close(s, s.__veil || null);
    }
    for (const n of rec.addedNodes) {
      if (n.nodeType !== 1 || n.hasAttribute(GHOST)) continue;
      const sheets = n.hasAttribute('data-sheet') ? [n] : [...n.querySelectorAll('[data-sheet]')];
      for (const s of sheets) { s.__veil = veilOf(s); open(s); }
    }
    // Une feuille déjà ouverte dont la liste d'options change (recherche) : la pastille se repose sur la nouvelle liste.
    const t = rec.target;
    if (t.nodeType === 1 && t.closest) { const s = t.closest('[data-sheet]'); if (s && !s.hasAttribute(GHOST)) setupOpts(s); }
  }
}).observe(document.body, { childList: true, subtree: true });
