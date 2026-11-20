// Balayer d'un onglet à l'autre, d'une page à la suivante (téléphone) — maquettes T1 et T3, validées le 20/11.
//
// 1. Onglets : sur une liste [data-swipe], un geste horizontal la fait suivre le doigt ; lâchée assez loin ou assez
//    vite, elle sort de son côté, l'onglet voisin de [data-swipe-tabs] (un role=tablist) est choisi, et la nouvelle
//    liste entre de l'autre côté (la pastille des onglets coule d'elle-même, liquid.js).
// 2. Pages : dans un [data-swipe-pager] (une alerte ouverte en plein écran), le même geste sur son [data-swipe] passe à
//    la page voisine, celle de ses boutons [data-swipe-next] / [data-swipe-prev] (absent ou désactivé : bout de la
//    liste, le contenu résiste). Une page qui change autrement (la flèche touchée) : le pager change de data-swipe-at
//    (sa place dans la liste), le nouveau contenu entre du côté où l'on va. Le pager arrive de la droite quand l'écran
//    le pose (une page poussée), et repart vers la droite quand il le retire.
// Un geste vertical reste un défilement natif : [data-swipe] est en touch-action: pan-y, le navigateur défile sans
// attendre ce module (aucun écouteur bloquant). Seuls transform et opacity bougent.

const RM = window.matchMedia('(prefers-reduced-motion: reduce)');
const reduced = () => RM.matches;
const EASE = 'cubic-bezier(0.32, 0.72, 0, 1)';
const GHOST = 'data-swipe-ghost';

function tabs() {
  const list = document.querySelector('[data-swipe-tabs]');
  if (!list) return null;
  const all = [...list.querySelectorAll('[role="tab"]')];
  const cur = all.findIndex((t) => t.getAttribute('aria-selected') === 'true');
  return { all, cur };
}
const usable = (b) => (b && !b.disabled && b.getAttribute('aria-disabled') !== 'true' ? b : null);
/** Ce qu'on trouve de chaque côté du geste : l'onglet d'avant et d'après, ou la page d'avant et d'après. */
function around(s) {
  const pg = s.closest('[data-swipe-pager]');
  if (pg) return { pg, prev: usable(pg.querySelector('[data-swipe-prev]')), next: usable(pg.querySelector('[data-swipe-next]')) };
  const T = tabs();
  return { pg: null, prev: T && T.cur > 0 ? T.all[T.cur - 1] : null, next: T && T.cur >= 0 ? T.all[T.cur + 1] || null : null };
}
/** Le contenu qui bouge, quand l'écran l'a remplacé pendant la sortie. */
const moving = (N) => (N.pg ? (N.pg.isConnected ? N.pg.querySelector('[data-swipe]') : null)
  : [...document.querySelectorAll('[data-swipe]')].find((x) => !x.closest('[data-swipe-pager]')) || null);

let el = null, N = null, id = -1, x0 = 0, y0 = 0, dx = 0, mode = '', t0 = 0, raf = 0, W = 1;
let busy = null; // le pager dont ce module change lui-même la page (son data-swipe-at ne rejoue pas l'entrée)
const paint = () => {
  raf = 0;
  if (!el || !N) return;
  const edge = dx > 0 ? !N.prev : !N.next;
  const x = edge ? dx * 0.22 : dx;
  el.style.transform = `translateX(${x}px)`;
  el.style.opacity = String(1 - Math.min(0.45, (Math.abs(x) / W) * 0.6));
};

document.addEventListener('pointerdown', (e) => {
  if (e.pointerType !== 'touch' || reduced()) return;
  const s = e.target instanceof Element ? e.target.closest('[data-swipe]') : null;
  if (!s || e.target.closest('[data-swipe-skip], input, [role="slider"], [data-sheet]')) return;
  el = s; N = null; id = e.pointerId; x0 = e.clientX; y0 = e.clientY; dx = 0; mode = ''; t0 = performance.now(); W = Math.max(1, s.getBoundingClientRect().width);
}, { passive: true });

document.addEventListener('pointermove', (e) => {
  if (!el || e.pointerId !== id) return;
  const x = e.clientX - x0, y = e.clientY - y0;
  if (!mode) {
    if (Math.abs(x) > 10 && Math.abs(x) > Math.abs(y) * 1.2) {
      mode = 'h';
      N = around(el);
      el.getAnimations().forEach((a) => a.cancel());
      try { el.setPointerCapture(id); } catch (err) { /* déjà relâché */ }
    } else if (Math.abs(y) > 10) { el = null; return; } else return;
  }
  dx = x;
  if (!raf) raf = requestAnimationFrame(paint);
}, { passive: true });

function settle(e) {
  if (!el || (e && e.pointerId !== id)) return;
  const s = el, nb = N; el = null; N = null;
  if (mode !== 'h' || !nb) return;
  if (raf) { cancelAnimationFrame(raf); raf = 0; }
  const v = dx / Math.max(1, performance.now() - t0);
  const dir = dx < 0 ? 1 : -1;
  const target = dir > 0 ? nb.next : nb.prev;
  const from = s.style.transform || 'none', o = s.style.opacity || '1';
  if (e && e.type === 'pointercancel') { s.style.transform = ''; s.style.opacity = ''; return; }
  if (target && (Math.abs(dx) > W * 0.22 || Math.abs(v) > 0.45)) {
    // Le contenu sort de son côté, le voisin est choisi, le nouveau contenu entre de l'autre côté.
    const out = s.animate([{ transform: from, opacity: o }, { transform: `translateX(${-dir * W * 0.42}px)`, opacity: 0 }], { duration: 150, easing: 'cubic-bezier(0.4, 0, 1, 1)', fill: 'forwards' });
    out.finished.then(() => {
      busy = nb.pg;
      target.click();
      requestAnimationFrame(() => requestAnimationFrame(() => {
        busy = null;
        const n = s.isConnected ? s : moving(nb);
        out.cancel();
        s.style.transform = ''; s.style.opacity = '';
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

// ─── les pages : la flèche touchée, la page poussée, la page retirée ───
function turned(pg, before) {
  const a = Number(before), b = Number(pg.getAttribute('data-swipe-at'));
  if (pg === busy || reduced() || !Number.isFinite(a) || !Number.isFinite(b) || a === b) return;
  const s = pg.querySelector('[data-swipe]');
  if (!s) return;
  const dir = b > a ? 1 : -1;
  s.getAnimations().forEach((x) => x.cancel());
  // La largeur de la fenêtre (le pager est plein écran) : lire celle du contenu forcerait la mise en page qui vient de changer.
  s.animate([{ transform: `translateX(${dir * window.innerWidth * 0.3}px)`, opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 340, easing: EASE });
}
function pushed(pg) {
  if (reduced()) { pg.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160 }); return; }
  pg.animate([{ transform: 'translateX(100%)' }, { transform: 'none' }], { duration: 460, easing: EASE });
}
function popped(pg) {
  if (reduced()) return;
  // Une copie de la page repart vers la droite par-dessus la liste, puis disparaît.
  pg.getAnimations({ subtree: true }).forEach((a) => a.cancel());
  pg.setAttribute(GHOST, '');
  pg.setAttribute('aria-hidden', 'true');
  pg.style.pointerEvents = 'none';
  document.body.append(pg);
  if (pg.__y > 0) pg.scrollTop = pg.__y; // retirée, la page a perdu son défilement : la copie repart d'où on la lisait
  const a = pg.animate([{ transform: 'none' }, { transform: 'translateX(100%)' }], { duration: 320, easing: 'cubic-bezier(0.4, 0, 0.6, 1)', fill: 'forwards' });
  a.finished.then(() => pg.remove(), () => pg.remove());
}
document.addEventListener('scroll', (e) => {
  const t = e.target;
  if (t instanceof Element && t.hasAttribute('data-swipe-pager')) t.__y = t.scrollTop;
}, { capture: true, passive: true });
new MutationObserver((records) => {
  for (const rec of records) {
    if (rec.type === 'attributes') { if (rec.target.isConnected) turned(rec.target, rec.oldValue); continue; }
    // Seul le pager posé ou retiré lui-même : une page entière qui change (autre onglet de la barre) ne rejoue rien.
    for (const n of rec.removedNodes) if (n.nodeType === 1 && !n.isConnected && n.hasAttribute('data-swipe-pager') && !n.hasAttribute(GHOST)) popped(n);
    for (const n of rec.addedNodes) if (n.nodeType === 1 && n.hasAttribute('data-swipe-pager') && !n.hasAttribute(GHOST)) pushed(n);
  }
}).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-swipe-at'], attributeOldValue: true });
