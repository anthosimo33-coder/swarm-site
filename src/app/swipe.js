// Balayer d'un onglet à l'autre (téléphone) — maquette T3 « Le pouce d'abord », validée le 20/11.
//
// Sur une liste [data-swipe], un geste horizontal la fait suivre le doigt ; lâchée assez loin ou assez vite, elle
// sort de son côté, l'onglet voisin de [data-swipe-tabs] (un role=tablist) est choisi, et la nouvelle liste entre de
// l'autre côté (la pastille des onglets coule d'elle-même, liquid.js). Un geste vertical reste un défilement natif :
// la liste est en touch-action: pan-y, le navigateur défile sans attendre ce module (aucun écouteur bloquant).
// Seuls transform et opacity bougent.

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const EASE = 'cubic-bezier(0.32, 0.72, 0, 1)';

function tabs() {
  const list = document.querySelector('[data-swipe-tabs]');
  if (!list) return null;
  const all = [...list.querySelectorAll('[role="tab"]')];
  const cur = all.findIndex((t) => t.getAttribute('aria-selected') === 'true');
  return { all, cur };
}

let el = null, id = -1, x0 = 0, y0 = 0, dx = 0, mode = '', t0 = 0, raf = 0, W = 1;
const paint = () => {
  raf = 0;
  if (!el) return;
  const T = tabs();
  const edge = !T || (dx > 0 && T.cur <= 0) || (dx < 0 && T.cur >= T.all.length - 1);
  const x = edge ? dx * 0.22 : dx;
  el.style.transform = `translateX(${x}px)`;
  el.style.opacity = String(1 - Math.min(0.45, (Math.abs(x) / W) * 0.6));
};

document.addEventListener('pointerdown', (e) => {
  if (e.pointerType !== 'touch' || reduced()) return;
  const s = e.target instanceof Element ? e.target.closest('[data-swipe]') : null;
  if (!s || e.target.closest('[data-swipe-skip], input, [role="slider"], [data-sheet]')) return;
  el = s; id = e.pointerId; x0 = e.clientX; y0 = e.clientY; dx = 0; mode = ''; t0 = performance.now(); W = Math.max(1, s.getBoundingClientRect().width);
}, { passive: true });

document.addEventListener('pointermove', (e) => {
  if (!el || e.pointerId !== id) return;
  const x = e.clientX - x0, y = e.clientY - y0;
  if (!mode) {
    if (Math.abs(x) > 10 && Math.abs(x) > Math.abs(y) * 1.2) {
      mode = 'h';
      el.getAnimations().forEach((a) => a.cancel());
      try { el.setPointerCapture(id); } catch (err) { /* déjà relâché */ }
    } else if (Math.abs(y) > 10) { el = null; return; } else return;
  }
  dx = x;
  if (!raf) raf = requestAnimationFrame(paint);
}, { passive: true });

function settle(e) {
  if (!el || (e && e.pointerId !== id)) return;
  const s = el; el = null;
  if (mode !== 'h') return;
  if (raf) { cancelAnimationFrame(raf); raf = 0; }
  const T = tabs();
  const v = dx / Math.max(1, performance.now() - t0);
  const dir = dx < 0 ? 1 : -1;
  const next = T ? T.cur + dir : -1;
  const from = s.style.transform || 'none', o = s.style.opacity || '1';
  if (e && e.type === 'pointercancel') { s.style.transform = ''; s.style.opacity = ''; return; }
  if (T && next >= 0 && next < T.all.length && (Math.abs(dx) > W * 0.22 || Math.abs(v) > 0.45)) {
    // La liste sort de son côté, l'onglet voisin est choisi, la nouvelle liste entre de l'autre côté.
    const out = s.animate([{ transform: from, opacity: o }, { transform: `translateX(${-dir * W * 0.42}px)`, opacity: 0 }], { duration: 150, easing: 'cubic-bezier(0.4, 0, 1, 1)', fill: 'forwards' });
    out.finished.then(() => {
      T.all[next].click();
      requestAnimationFrame(() => requestAnimationFrame(() => {
        const n = s.isConnected ? s : document.querySelector('[data-swipe]');
        out.cancel();
        if (!n) return;
        n.style.transform = ''; n.style.opacity = '';
        n.animate([{ transform: `translateX(${dir * W * 0.3}px)`, opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 340, easing: EASE });
      }));
    }, () => {});
  } else {
    s.style.transform = ''; s.style.opacity = '';
    s.animate([{ transform: from, opacity: o }, { transform: 'none', opacity: 1 }], { duration: 380, easing: 'cubic-bezier(0.34, 1.25, 0.64, 1)' });
  }
}
document.addEventListener('pointerup', settle, { passive: true });
document.addEventListener('pointercancel', settle, { passive: true });
