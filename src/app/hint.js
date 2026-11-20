// Explications au survol (ordinateur) — maquette 7C « les plafonds dits », validée le 20/11.
//
// Un élément [data-tip] (le « i » de « au moins 30 vidéos en 7 j ») montre son texte dans une bulle, au survol ou au
// clavier (focus). La bulle est unique, en position fixe : un tableau qui défile ou un panneau qui coupe ce qui
// dépasse ne la coupe pas. Elle se pose sous l'élément, centrée, ou au-dessus faute de place ; elle n'anime que
// transform et opacity. Les écrans posent seulement le marqueur (et un aria-label pour les lecteurs d'écran).

const GAP = 8;
const EDGE = 12;
let tip = null;
let cur = null;
let timer = 0;

function bubble() {
  if (tip && tip.isConnected) return tip;
  tip = document.createElement('div');
  tip.className = 'sw-tip';
  tip.setAttribute('aria-hidden', 'true');
  document.body.append(tip);
  return tip;
}

function show(el) {
  const text = el.getAttribute('data-tip');
  if (!text || !el.isConnected) return;
  cur = el;
  const t = bubble();
  t.textContent = text;
  t.removeAttribute('data-on');
  const r = el.getBoundingClientRect();
  const w = t.offsetWidth;
  const h = t.offsetHeight;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const x = Math.round(Math.max(EDGE, Math.min(vw - w - EDGE, r.left + r.width / 2 - w / 2)));
  const below = r.bottom + GAP + h <= vh - EDGE;
  const y = Math.round(below ? r.bottom + GAP : Math.max(EDGE, r.top - GAP - h));
  const from = below ? -4 : 4;
  t.style.transition = 'none';
  t.style.transform = `translate(${x}px, ${y + from}px)`;
  void t.offsetWidth; // la position de départ est prise avant l'entrée
  t.style.transition = '';
  t.style.transform = `translate(${x}px, ${y}px)`;
  t.setAttribute('data-on', '');
}

function hide() {
  clearTimeout(timer);
  cur = null;
  if (tip) tip.removeAttribute('data-on');
}

const tipOf = (t) => (t instanceof Element ? t.closest('[data-tip]') : null);

document.addEventListener('pointerover', (e) => {
  if (e.pointerType !== 'mouse') return;
  const el = tipOf(e.target);
  if (!el || el === cur) return;
  clearTimeout(timer);
  timer = setTimeout(() => show(el), 120);
});
document.addEventListener('pointerout', (e) => {
  const el = tipOf(e.target);
  if (!el || (e.relatedTarget instanceof Node && el.contains(e.relatedTarget))) return;
  if (document.activeElement === el) return; // gardée tant que le « i » a le focus clavier
  hide();
});
document.addEventListener('focusin', (e) => {
  const el = tipOf(e.target);
  if (el && el.matches(':focus-visible')) show(el);
});
document.addEventListener('focusout', (e) => { if (tipOf(e.target)) hide(); });
window.addEventListener('scroll', hide, true);
window.addEventListener('popstate', hide);
document.addEventListener('mousedown', hide, true);
