// Fiches (app, créateur, format) : la barre des sections collée en haut — maquette 3B « des sections nettes », 20/11.
//
// 1. Suivi : l'onglet de la section qu'on lit est marqué (aria-current) ; une pastille glisse de l'ancien au nouveau.
// 2. Clic sur un onglet (ou sur un lien marqué data-fi-go) : défilement doux jusqu'à la section, juste sous la barre ;
//    la pastille part tout de suite vers sa cible et ne suit pas les sections traversées en route.
// 3. Barre collée : une ombre douce apparaît sous elle dès qu'elle tient en haut.
//
// Les écrans ne savent rien de ce module : ils posent des marqueurs, la barre colle par CSS (position: sticky).
// Seuls transform et opacity bougent. Le défilement est lu une fois par image (requestAnimationFrame), sans écriture
// avant les lectures. Marqueurs : [data-fi-bar] (la barre), a[data-fi-tab] (un onglet, href="#id" de sa section),
// a[data-fi-go] (un autre lien vers une section de la fiche, href="#id").

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const GLIDE = 'cubic-bezier(0.3, 0.9, 0.2, 1)';

let bar = null; // la barre de la fiche affichée
let tabs = []; // ses onglets
let pill = null;
let cur = -1; // l'onglet marqué
let stuck = false;
let lock = null; // { i, settled } : onglet choisi au clic, gardé pendant le défilement qu'il a lancé
let settleTimer = 0;
let frame = 0;
let resize = null;

const target = (a) => {
  const id = decodeURIComponent((a.getAttribute('href') || '').replace(/^#/, ''));
  return id ? document.getElementById(id) : null;
};

/** La pastille sous l'onglet i : largeur posée d'un coup, place en transform ; animée depuis l'ancien onglet. */
function place(i, animate) {
  const t = tabs[i];
  if (!pill || !t) return;
  const x = t.offsetLeft, w = t.offsetWidth;
  const was = pill.dataset.x !== undefined ? { x: +pill.dataset.x, w: +pill.dataset.w } : null;
  pill.style.width = `${w}px`;
  pill.style.transform = `translateX(${x}px)`;
  pill.style.opacity = '1';
  pill.dataset.x = String(x);
  pill.dataset.w = String(w);
  if (!animate || !was || reduced() || (Math.abs(was.x - x) < 1 && Math.abs(was.w - w) < 1)) return;
  pill.getAnimations().forEach((a) => a.cancel());
  pill.animate([
    { transform: `translateX(${was.x}px) scaleX(${was.w / w})` },
    { transform: `translateX(${x}px) scaleX(1)` },
  ], { duration: 420, easing: GLIDE });
}

function mark(i, animate) {
  if (i === cur) return;
  tabs.forEach((t, k) => { if (k === i) t.setAttribute('aria-current', 'true'); else t.removeAttribute('aria-current'); });
  cur = i;
  place(i, animate);
}

/** La section lue : la dernière dont le haut a passé la ligne de lecture (sous la barre) ; tout en bas, la dernière. */
function pick() {
  const b = bar.getBoundingClientRect();
  const line = b.bottom + Math.min(200, window.innerHeight * 0.25);
  let i = 0;
  for (let k = 0; k < tabs.length; k++) {
    const s = target(tabs[k]);
    if (s && s.getBoundingClientRect().top <= line) i = k;
  }
  const doc = document.documentElement;
  if (window.scrollY > 0 && window.innerHeight + window.scrollY >= doc.scrollHeight - 2) i = tabs.length - 1;
  return { i, stuck: b.top <= 0.5 && window.scrollY > 0 };
}

function update() {
  frame = 0;
  if (!bar || !bar.isConnected) return;
  const p = pick();
  if (p.stuck !== stuck) { stuck = p.stuck; bar.classList.toggle('is-stuck', stuck); }
  if (!lock) mark(p.i, true);
}

function onScroll() {
  if (!bar) return;
  if (lock) {
    // Défilement lancé par un clic : on attend qu'il s'arrête ; le défilement suivant rend la main au suivi.
    if (lock.settled) lock = null;
    else { clearTimeout(settleTimer); settleTimer = setTimeout(() => { if (lock) lock.settled = true; }, 140); }
  }
  if (!frame) frame = requestAnimationFrame(update);
}

function mount(el) {
  bar = el;
  tabs = [...el.querySelectorAll('a[data-fi-tab]')];
  cur = -1;
  stuck = false;
  lock = null;
  const host = tabs[0] && tabs[0].parentElement;
  pill = null;
  if (host) {
    pill = host.querySelector(':scope > .fi-pill');
    if (!pill) {
      pill = document.createElement('i');
      pill.className = 'fi-pill';
      pill.setAttribute('aria-hidden', 'true');
      host.prepend(pill);
    }
    delete pill.dataset.x;
    if (resize) resize.disconnect();
    // Une largeur qui change (nombres arrivés avec les données, fenêtre redimensionnée) : la pastille suit, sans animation.
    resize = new ResizeObserver(() => { if (cur >= 0) place(cur, false); });
    resize.observe(host);
  }
  const p = pick();
  stuck = p.stuck;
  bar.classList.toggle('is-stuck', stuck);
  mark(p.i, false);
}

function unmount() {
  if (resize) resize.disconnect();
  resize = null;
  bar = null;
  tabs = [];
  pill = null;
  lock = null;
}

// Une fiche qui arrive, s'en va, ou change d'onglets.
new MutationObserver(() => {
  if (bar && bar.isConnected) {
    const now = bar.querySelectorAll('a[data-fi-tab]');
    if (now.length === tabs.length && [...now].every((t, k) => t === tabs[k])) return;
  }
  const el = document.querySelector('[data-fi-bar]');
  if (el) mount(el);
  else if (bar) unmount();
}).observe(document.body, { childList: true, subtree: true });

window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', () => { if (bar && !frame) frame = requestAnimationFrame(update); }, { passive: true });

document.addEventListener('click', (e) => {
  if (!bar || !(e.target instanceof Element) || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
  const a = e.target.closest('a[data-fi-tab], a[data-fi-go]');
  if (!a) return;
  const sec = target(a);
  if (!sec) return;
  e.preventDefault();
  const i = tabs.findIndex((t) => target(t) === sec);
  const b = bar.getBoundingClientRect();
  // Sous la barre une fois collée : sa hauteur, plus un peu d'air. La première section ramène tout en haut.
  const y = i === 0 ? 0 : Math.max(0, sec.getBoundingClientRect().top + window.scrollY - b.height - 12);
  if (i >= 0) {
    mark(i, true);
    lock = { i, settled: false };
    clearTimeout(settleTimer);
    settleTimer = setTimeout(() => { if (lock) lock.settled = true; }, 400);
  }
  window.scrollTo({ top: y, behavior: reduced() ? 'auto' : 'smooth' });
  if (sec.hasAttribute('tabindex')) sec.focus({ preventScroll: true });
}, true);
