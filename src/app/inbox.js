// Alertes, la boîte de réception — maquette B2 validée le 20/11.
//
// 1. La ligne choisie : son cadre glisse de l'ancienne ligne à la nouvelle, puis rend la main au vrai cadre.
// 2. L'alerte ouverte : ses blocs arrivent en fondu, en glissant d'un rien, en cascade.
// 3. « Reprises par jour » : chaque barre passe de sa hauteur d'avant à la nouvelle (d'une alerte à l'autre, ou quand
//    la fiche du format arrive), sans que la mise en page bouge.
//
// L'écran (design/app/AlertesA.dc.html) ne sait rien de ce module : il pose des marqueurs et se redessine comme avant.
// Ce module observe le DOM et anime l'écart avant la première image. Seuls transform et opacity bougent.
// Marqueurs : data-ib-list (la liste, qui défile), .ib-row[aria-selected] (une ligne), data-ib-detail + data-ib-key
// (le détail et l'alerte qu'il montre), data-ib-in (un bloc du détail), data-ib-bar (une barre).

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const OUT = 'cubic-bezier(0.25, 0.1, 0.1, 1)';
const FLOW = 'cubic-bezier(0.6, 0, 0.25, 1)';
const GLIDE = 'cubic-bezier(0.3, 0.9, 0.2, 1)';

// ─── 1. le cadre de la ligne choisie ───
function slide(list, from, to) {
  const lr = list.getBoundingClientRect();
  const a = from.getBoundingClientRect(), b = to.getBoundingClientRect();
  let dy = a.top - b.top;
  // Une ligne hors de vue (onglet changé, saut au clavier en fin de liste) : le cadre arrive de tout près, en fondu.
  const far = a.bottom < lr.top || a.top > lr.bottom;
  if (far) dy = Math.sign(dy) * 28;
  const ghost = document.createElement('i');
  ghost.className = 'ib-ghost';
  ghost.setAttribute('aria-hidden', 'true');
  Object.assign(ghost.style, { left: `${to.offsetLeft}px`, top: `${to.offsetTop}px`, width: `${b.width}px`, height: `${b.height}px` });
  list.querySelectorAll(':scope > .ib-ghost').forEach((g) => g.remove());
  list.append(ghost);
  list.classList.add('ib-run');
  const sy = a.height / b.height;
  const anim = ghost.animate(far
    ? [{ transform: `translateY(${dy}px)`, opacity: 0 }, { transform: 'none', opacity: 1 }]
    : [{ transform: `translateY(${dy}px) scaleY(${sy})` }, { transform: 'none' }],
  { duration: far ? 220 : 300, easing: GLIDE, fill: 'both' });
  const done = () => { if (ghost.isConnected) { ghost.remove(); if (!list.querySelector(':scope > .ib-ghost')) list.classList.remove('ib-run'); } };
  anim.finished.then(done, done);
}

// ─── 2. les blocs du détail ───
function cascade(detail) {
  const blocks = [...detail.querySelectorAll('[data-ib-in]')];
  blocks.forEach((el, i) => {
    el.getAnimations().forEach((x) => x.cancel());
    el.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 280, delay: Math.min(i, 6) * 26, easing: OUT, fill: 'backwards' });
  });
}

// ─── 3. les barres ───
const px = (style) => { const m = /(?:^|;)\s*height:\s*([\d.]+)px/.exec(style || ''); return m ? parseFloat(m[1]) : null; };
function grow(bar, from, i) {
  const h = bar.offsetHeight;
  if (!h || from === null || Math.abs(from - h) < 0.5) return;
  bar.getAnimations().forEach((x) => x.cancel());
  bar.animate([{ transform: `scaleY(${Math.max(0, from) / h})` }, { transform: 'none' }], { duration: 520, delay: i * 26, easing: FLOW, fill: 'backwards' });
}

new MutationObserver((records) => {
  if (reduced() || !document.querySelector('[data-ib-detail]')) return;
  let from = null, to = null, list = null;
  const details = new Set();
  const bars = new Map();
  for (const rec of records) {
    const t = rec.target;
    if (rec.type === 'attributes') {
      if (rec.attributeName === 'aria-selected' && t.classList && t.classList.contains('ib-row')) {
        const now = t.getAttribute('aria-selected');
        if (rec.oldValue === 'true' && now !== 'true') from = t;
        else if (rec.oldValue !== 'true' && now === 'true') { to = t; list = t.closest('[data-ib-list]'); }
      } else if (rec.attributeName === 'data-ib-key' && t.hasAttribute('data-ib-detail') && rec.oldValue !== t.getAttribute('data-ib-key')) {
        details.add(t);
      } else if (rec.attributeName === 'style' && t.hasAttribute && t.hasAttribute('data-ib-bar') && !bars.has(t)) {
        bars.set(t, px(rec.oldValue));
      }
      continue;
    }
    // Des barres qui arrivent (une alerte vidéo, puis un format) : elles poussent depuis le bas.
    for (const n of rec.addedNodes) {
      if (n.nodeType !== 1) continue;
      const found = n.hasAttribute('data-ib-bar') ? [n] : [...n.querySelectorAll('[data-ib-bar]')];
      found.forEach((b) => { if (!bars.has(b)) bars.set(b, 0); });
    }
  }
  if (from && to && list && from.isConnected) slide(list, from, to);
  details.forEach((d) => { if (d.isConnected) cascade(d); });
  if (bars.size) {
    const all = [...bars.keys()].filter((b) => b.isConnected);
    const order = (b) => [...b.parentElement.parentElement.children].indexOf(b.parentElement);
    all.forEach((b) => grow(b, bars.get(b), Math.max(0, order(b))));
  }
}).observe(document.body, { subtree: true, childList: true, attributes: true, attributeOldValue: true, attributeFilter: ['aria-selected', 'data-ib-key', 'style'] });
