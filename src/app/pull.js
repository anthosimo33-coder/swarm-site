// Tirer vers le bas pour chercher (téléphone) — maquette T3 « Le pouce d'abord », validée le 20/11.
//
// En haut d'une page [data-pull], la tirer vers le bas fait descendre son contenu (avec de la résistance) et apparaître
// une capsule « Chercher » ; passé le cran, la capsule s'allume ; lâchée là, la recherche s'ouvre ([data-pull-search],
// le bouton loupe de la page). Les éléments fixes (barre du bas, feuilles) ne bougent pas. Transform et opacity.

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const STEP = 76; // le cran, en pixels de contenu déplacé
const BACK = 'cubic-bezier(0.34, 1.25, 0.64, 1)';

let page = null, parts = [], cap = null, y0 = 0, x0 = 0, d = 0, on = false, armed = false, raf = 0;
const rubber = (y) => (y <= 0 ? 0 : 140 * (1 - Math.exp(-y / 220)));

function capsule() {
  if (cap && cap.isConnected) return cap;
  cap = document.createElement('div');
  cap.className = 'pl-cap';
  cap.setAttribute('aria-hidden', 'true');
  cap.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24"><path d="M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM15.5 15.5L20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg><span>Chercher</span>';
  document.body.append(cap);
  return cap;
}
const paint = () => {
  raf = 0;
  const y = rubber(d);
  for (const p of parts) p.style.transform = `translateY(${y}px)`;
  const k = Math.min(1, y / STEP);
  const c = capsule();
  c.style.opacity = String(k);
  c.style.transform = `translate(-50%, ${-30 + 46 * k}px) scale(${0.86 + 0.14 * k})`;
  const now = y >= STEP;
  if (now !== armed) { armed = now; c.classList.toggle('is-on', now); if (now && navigator.vibrate) { try { navigator.vibrate(8); } catch (e) { /* rien */ } } }
};

// Le geste n'est intercepté qu'en haut de page : l'écouteur bloquant n'est posé qu'à ce moment-là (sinon le
// navigateur défilerait en attendant ce module à chaque mouvement du doigt).
function onMove(e) {
  if (!page || e.touches.length !== 1) return;
  const y = e.touches[0].clientY - y0, x = e.touches[0].clientX - x0;
  if (!on) {
    if (y > 8 && y > Math.abs(x) * 1.3 && window.scrollY <= 0) {
      on = true;
      parts = [...page.children].filter((c) => { const pos = getComputedStyle(c).position; return pos !== 'fixed' && !c.hasAttribute('data-sheet'); });
    } else if (Math.abs(x) > 8 || y < -4) { stop(); return; } else return;
  }
  if (e.cancelable) e.preventDefault();
  d = y;
  if (!raf) raf = requestAnimationFrame(paint);
}
function stop() { page = null; document.removeEventListener('touchmove', onMove, { passive: false }); }

document.addEventListener('touchstart', (e) => {
  stop();
  if (e.touches.length !== 1 || reduced() || window.scrollY > 0) return;
  const p = e.target instanceof Element ? e.target.closest('[data-pull]') : null;
  if (!p || e.target.closest('[data-sheet], [role="dialog"], nav, input, [data-swipe-skip]')) return;
  if (!p.querySelector('[data-pull-search]')) return;
  page = p; y0 = e.touches[0].clientY; x0 = e.touches[0].clientX; d = 0; on = false; armed = false;
  document.addEventListener('touchmove', onMove, { passive: false });
}, { passive: true });

function release() {
  if (!page) return;
  const p = page; stop();
  if (!on) return;
  on = false;
  if (raf) { cancelAnimationFrame(raf); raf = 0; paint(); }
  const go = rubber(d) >= STEP;
  for (const el of parts) {
    const from = el.style.transform;
    el.style.transform = '';
    el.animate([{ transform: from || 'none' }, { transform: 'none' }], { duration: 420, easing: BACK });
  }
  parts = [];
  const c = capsule();
  const from = c.style.transform;
  c.animate([{ transform: from, opacity: c.style.opacity }, { transform: 'translate(-50%, -30px) scale(0.86)', opacity: 0 }], { duration: go ? 200 : 300, easing: 'ease-in', fill: 'forwards' })
    .finished.then(() => { c.style.opacity = '0'; c.classList.remove('is-on'); }, () => {});
  if (go) { const s = p.querySelector('[data-pull-search]'); if (s) s.click(); }
}
document.addEventListener('touchend', release, { passive: true });
document.addEventListener('touchcancel', release, { passive: true });
