// Bascules liquides — maquette V1 « Liquide » validée le 20/11.
//
// 1. Pastilles : quand on change d'onglet (tout [role=tablist] de l'app) ou de rubrique (le rail), la pastille
//    coule vers la cible : une tête rapide, une traîne lente et, sur le rail, un filament et une goutte ; un filtre
//    « goo » (flou + seuil d'opacité) les fond en une seule matière qui s'étire, se détache, se ressoude.
// 2. Apps : au changement de classement ou de période, les lignes coulent vers leur nouvelle place (FLIP), le
//    chiffre qui change tombe d'en haut, la courbe change de forme.
// 3. Rail : la nouvelle page tombe en place, bloc par bloc.
//
// Les écrans ne savent rien de ce module : il lit l'état d'avant au clic (phase de capture), laisse le composant se
// redessiner, puis anime l'écart avant la première image. Seuls transform et opacity bougent (et, pour une courbe,
// son tracé) ; le filtre ne couvre que la pastille. Marqueurs posés par les écrans : data-key (une ligne d'Apps),
// data-lq-num (un chiffre), data-lq-spark (une courbe).

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const HEAD = 'cubic-bezier(0.3, 0.9, 0.2, 1)';
const TAIL = 'cubic-bezier(0.6, 0, 0.2, 1)';
const FLOW = 'cubic-bezier(0.6, 0, 0.25, 1)';
const DROP = 'cubic-bezier(0.2, 1.15, 0.4, 1)';
const FALL = 'cubic-bezier(0.16, 1, 0.3, 1)';

// ─── le filtre « goo » ───
let filterReady = false;
function ensureFilter() {
  if (filterReady) return;
  filterReady = true;
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.style.position = 'absolute';
  svg.innerHTML = '<defs><filter id="lq-goo" x="-50%" y="-50%" width="200%" height="200%" color-interpolation-filters="sRGB">'
    + '<feGaussianBlur in="SourceGraphic" stdDeviation="6" result="b"></feGaussianBlur>'
    + '<feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -10" result="g"></feColorMatrix>'
    + '<feComposite in="SourceGraphic" in2="g" operator="atop"></feComposite></filter></defs>';
  document.body.append(svg);
}

// ─── couleurs : le filtre a besoin d'une couleur opaque (une teinte translucide disparaîtrait au seuil) ───
const parse = (c) => { const m = String(c).match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(',').map((x) => parseFloat(x)); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
function opaque(el) {
  const layers = [];
  for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
    const c = parse(getComputedStyle(n).backgroundColor);
    if (c && c.a > 0) { layers.push(c); if (c.a >= 1) break; }
  }
  let out = { r: 5, g: 7, b: 12 };
  for (const c of layers.reverse()) out = { r: c.r * c.a + out.r * (1 - c.a), g: c.g * c.a + out.g * (1 - c.a), b: c.b * c.a + out.b * (1 - c.a) };
  return `rgb(${Math.round(out.r)}, ${Math.round(out.g)}, ${Math.round(out.b)})`;
}

const rel = (r, host) => { const h = host.getBoundingClientRect(); return { x: r.left - h.left, y: r.top - h.top, w: r.width, h: r.height }; };

/** La pastille coule de `from` à `to` (rectangles dans `host`), puis rend la main au vrai style sélectionné. */
function pour(host, from, to, color, radius, runClass) {
  ensureFilter();
  host.classList.add('lq-host', runClass);
  const layer = document.createElement('div');
  layer.className = 'lq-layer';
  layer.setAttribute('aria-hidden', 'true');
  host.append(layer);
  const blob = (r, extra) => {
    const b = document.createElement('i');
    Object.assign(b.style, { left: `${r.x}px`, top: `${r.y}px`, width: `${r.w}px`, height: `${r.h}px`, background: color, borderRadius: radius }, extra || {});
    layer.append(b);
    return b;
  };
  const dx = from.x - to.x, dy = from.y - to.y;
  const head = blob(to);
  const tail = blob(from);
  const anims = [
    head.animate([{ transform: `translate(${dx}px, ${dy}px) scale(${from.w / to.w}, ${from.h / to.h})` }, { transform: 'none' }], { duration: 340, easing: HEAD, fill: 'both' }),
    tail.animate([{ transform: 'none' }, { transform: `translate(${-dx}px, ${-dy}px) scale(${to.w / from.w}, ${to.h / from.h})` }], { duration: 540, delay: 60, easing: TAIL, fill: 'both' }),
  ];
  // Long trajet (le rail) : un filament relie la tête et la traîne, une goutte s'en détache.
  const dist = Math.hypot(dx, dy), size = Math.min(from.h, from.w);
  if (dist > size * 2.2) {
    const vertical = Math.abs(dy) >= Math.abs(dx);
    const ax = from.x + from.w / 2, ay = from.y + from.h / 2, bx = to.x + to.w / 2, by = to.y + to.h / 2;
    const thick = 16;
    if (vertical) {
      const top = Math.min(ay, by), len = Math.abs(by - ay), down = by > ay;
      const fil = blob({ x: ax - thick / 2, y: top, w: thick, h: len }, { borderRadius: `${thick / 2}px`, transformOrigin: '50% 0' });
      const start = down ? 'translateY(0) scaleY(0.04)' : `translateY(${len * 0.96}px) scaleY(0.04)`;
      const end = down ? `translateY(${len * 0.96}px) scaleY(0.04)` : 'translateY(0) scaleY(0.04)';
      anims.push(fil.animate([{ transform: start }, { transform: 'scaleY(1)', offset: 0.38 }, { transform: end }], { duration: 560, easing: 'cubic-bezier(0.45, 0, 0.3, 1)', fill: 'both' }));
    } else {
      const left = Math.min(ax, bx), len = Math.abs(bx - ax), right = bx > ax;
      const fil = blob({ x: left, y: ay - thick / 2, w: len, h: thick }, { borderRadius: `${thick / 2}px`, transformOrigin: '0 50%' });
      const start = right ? 'translateX(0) scaleX(0.04)' : `translateX(${len * 0.96}px) scaleX(0.04)`;
      const end = right ? `translateX(${len * 0.96}px) scaleX(0.04)` : 'translateX(0) scaleX(0.04)';
      anims.push(fil.animate([{ transform: start }, { transform: 'scale(1)', offset: 0.38 }, { transform: end }], { duration: 560, easing: 'cubic-bezier(0.45, 0, 0.3, 1)', fill: 'both' }));
    }
    const d = 22;
    const drop = blob({ x: ax - d / 2, y: ay - d / 2, w: d, h: d }, { borderRadius: '50%' });
    anims.push(drop.animate([
      { transform: 'translate(0, 0) scale(0.3)', opacity: 0 },
      { transform: `translate(${(bx - ax) * 0.45}px, ${(by - ay) * 0.45}px) scale(1)`, opacity: 1, offset: 0.4 },
      { transform: `translate(${bx - ax}px, ${by - ay}px) scale(0.5)`, opacity: 0 },
    ], { duration: 520, delay: 90, easing: 'cubic-bezier(0.5, 0, 0.5, 1)', fill: 'both' }));
  }
  // Le vrai style sélectionné revient d'abord (le rail le fait apparaître en fondu), la pastille s'en va ensuite.
  const done = () => { host.classList.remove(runClass); setTimeout(() => layer.remove(), 240); };
  Promise.all(anims.map((a) => a.finished)).then(done, done);
}

// ─── Apps : ce qu'il y avait avant le clic, ligne par ligne ───
function snapshotRows() {
  const rows = document.querySelectorAll('[data-pv-row][data-key]');
  if (!rows.length) return null;
  const H = window.innerHeight;
  const map = new Map();
  for (const tr of rows) {
    const r = tr.getBoundingClientRect();
    if (r.bottom < -300 || r.top > H + 300) continue;
    map.set(tr.getAttribute('data-key'), {
      top: r.top,
      nums: [...tr.querySelectorAll('[data-lq-num]')].map((n) => n.textContent),
      sparks: [...tr.querySelectorAll('[data-lq-spark]')].map((p) => p.getAttribute('d')),
    });
  }
  return map;
}

function flowRows(before) {
  const rows = [...document.querySelectorAll('[data-pv-row][data-key]')];
  const H = window.innerHeight;
  const table = rows[0] && rows[0].closest('table');
  if (table) { table.style.setProperty('--lq-row-bg', opaque(table)); table.classList.add('lq-rows'); }
  const anims = [];
  let k = 0;
  for (const tr of rows) {
    const r = tr.getBoundingClientRect();
    if (r.bottom < 0 || r.top > H) continue;
    const old = before.get(tr.getAttribute('data-key'));
    const i = k++;
    if (old) {
      const dy = old.top - r.top;
      if (Math.abs(dy) > 1) anims.push(tr.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration: 640, delay: Math.min(i, 8) * 28, easing: FLOW, fill: 'backwards' }));
      tr.querySelectorAll('[data-lq-num]').forEach((n, j) => {
        if (old.nums[j] !== undefined && old.nums[j] !== n.textContent) {
          n.animate([{ transform: 'translateY(-16px)', opacity: 0, filter: 'blur(2px)' }, { transform: 'none', opacity: 1, filter: 'blur(0)' }], { duration: 460, delay: 40 + Math.min(i, 8) * 24, easing: DROP, fill: 'backwards' });
        }
      });
      tr.querySelectorAll('[data-lq-spark]').forEach((p, j) => {
        const a = old.sparks[j], b = p.getAttribute('d');
        if (a && b && a !== b && a.split(/[ML]/).length === b.split(/[ML]/).length) {
          try { p.animate([{ d: `path("${a}")` }, { d: `path("${b}")` }], { duration: 600, delay: Math.min(i, 8) * 24, easing: FLOW, fill: 'backwards' }); } catch { /* navigateur sans morphing de tracé */ }
        }
      });
    } else {
      // Une ligne qui arrive de loin : elle tombe à sa place.
      anims.push(tr.animate([{ transform: 'translateY(-18px)', opacity: 0.2 }, { transform: 'none', opacity: 1 }], { duration: 480, delay: Math.min(i, 10) * 26, easing: FALL, fill: 'backwards' }));
    }
  }
  if (table) Promise.all(anims.map((a) => a.finished)).then(() => table.classList.remove('lq-rows'), () => table.classList.remove('lq-rows'));
}

// ─── les onglets ───
document.addEventListener('click', (e) => {
  if (reduced() || !(e.target instanceof Element)) return;
  const tab = e.target.closest('[role="tablist"] [role="tab"]');
  if (!tab) return;
  const host = tab.closest('[role="tablist"]');
  const prev = host.querySelector('[role="tab"][aria-selected="true"]');
  if (!prev || prev === tab) return;
  const from = rel(prev.getBoundingClientRect(), host);
  const color = opaque(prev);
  const radius = getComputedStyle(prev).borderRadius;
  const rows = snapshotRows();
  requestAnimationFrame(() => {
    if (!host.isConnected) return;
    const now = host.querySelector('[role="tab"][aria-selected="true"]');
    if (now) {
      const to = rel(now.getBoundingClientRect(), host);
      if (Math.abs(to.x - from.x) > 1 || Math.abs(to.y - from.y) > 1) pour(host, from, to, color, radius, 'lq-run');
    }
    if (rows) flowRows(rows);
  });
}, true);

// ─── le rail ───
document.addEventListener('click', (e) => {
  if (reduced() || !(e.target instanceof Element)) return;
  const link = e.target.closest('.sw-sidebar a.sw-side-item');
  if (!link || link.getAttribute('aria-current') === 'page' || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
  const cur = document.querySelector('.sw-sidebar .sw-side-item[aria-current="page"] .sw-side-ico');
  if (!cur) return;
  const fromVp = cur.getBoundingClientRect();
  const color = opaque(cur);
  const radius = getComputedStyle(cur).borderRadius;
  const label = link.textContent.trim();
  const t0 = performance.now();
  // La page change au même clic ; on attend que le nouveau rail soit là (au plus 1,5 s).
  const wait = () => {
    const ico = [...document.querySelectorAll('.sw-sidebar .sw-side-item[aria-current="page"]')].find((a) => a.textContent.trim() === label);
    if (!ico) { if (performance.now() - t0 < 1500) requestAnimationFrame(wait); return; }
    const host = ico.closest('.sw-sidebar');
    const target = ico.querySelector('.sw-side-ico');
    if (target) pour(host, rel(fromVp, host), rel(target.getBoundingClientRect(), host), color, radius, 'lq-run');
    fallIn(host);
  };
  requestAnimationFrame(wait);
}, true);

/** La nouvelle page tombe en place, bloc par bloc (les blocs de premier niveau de son <main>). */
function fallIn(rail) {
  const shell = rail.parentElement;
  const main = shell && (shell.querySelector(':scope > main') || shell.querySelector('main'));
  if (!main) return;
  const blocks = [...main.children].filter((el) => el.getBoundingClientRect().top < window.innerHeight).slice(0, 8);
  blocks.forEach((el, i) => el.animate([{ transform: 'translateY(-16px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 520, delay: 40 + i * 45, easing: FALL, fill: 'backwards' }));
}
