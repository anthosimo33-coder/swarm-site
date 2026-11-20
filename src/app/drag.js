// Glisser vers un dossier (ordinateur, à la souris) — maquette 5C « glisser vers un dossier », validée le 20/11.
//
// Une ligne d'Apps, une ligne ou une carte de Créateurs, une carte de Formats se saisit : bouton enfoncé et quelques
// pixels de mouvement, la ligne se soulève (une copie qui suit le pointeur, tournée, avec une ombre), la page
// s'assombrit et le dock des dossiers monte en bas. Lâchée sur un dossier, elle y est rangée, une notice permet
// d'annuler ; sur « Nouveau dossier », on tape son nom ; ailleurs, ou Échap, la copie revient à sa place. Sans
// mouvement, un clic reste un clic (aperçu, fiche).
//
// Les écrans posent des marqueurs et ne savent rien du geste :
//   data-dg         le genre de l'élément : app, creator ou format    data-dg-id     son identifiant (slug, pseudo, id)
//   data-dg-label   son libellé, rangé tel quel                       data-dg-cover  sa vignette (facultatif)
//   data-dg-name    son nom à l'écran, s'il diffère du libellé (facultatif)
// Ce qui est rangé a la forme qu'écrit AjoutDossier : { kind, id, label, cover, at }, en tête du dossier
// (saved('folders'), docs/donnees-app.md). Les dossiers se lisent et s'écrivent par le routeur (src/app/main.js,
// connectFolders) ; sans lui (le canevas), aucun glisser ne démarre et le clic garde son effet.
//
// Fluidité : la copie suit le pointeur en transform, une fois par image (requestAnimationFrame) ; le voile, le dock et
// la notice entrent et sortent en transform/opacity ; rien ne change la mise en page pendant le geste.

const START = 6; // pixels de mouvement, bouton enfoncé, avant que le glisser ne parte
const LIFT = 220; // la copie se soulève (ms)
const BACK = 340; // elle revient à sa place
const INTO = 300; // elle entre dans un dossier
const MAXW = 960; // une ligne large est réduite à cette largeur (maquette : ~900 px) ; une carte garde sa taille
const SHOWN = 4; // dossiers du dock, les plus récents d'abord
const NOTE_MS = 5000;
const EASE = 'cubic-bezier(0.2, 0.8, 0.2, 1)';
const SPRING = 'cubic-bezier(0.34, 1.3, 0.64, 1)';
const FOLDER = 'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z';
const PLUS = 'M12 5v14M5 12h14';
const CHECK = 'M5 12.5l4.5 4.5L19 7.5';
const ARROW = 'M5 12h14M13 6l6 6-6 6';

/** Les dossiers de la personne : { read() -> valeur ou undefined (en chargement), write(valeur), listen(f) -> arrêt }. */
let store = null;
export function connectFolders(s) { store = s; }

const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const ms = (d) => (reduced() ? 0 : d);

function node(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined) n.textContent = text;
  return n;
}
function icon(d, size, width) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', size);
  svg.setAttribute('height', size);
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  p.setAttribute('d', d);
  for (const [k, v] of [['fill', 'none'], ['stroke', 'currentColor'], ['stroke-width', width || '1.8'], ['stroke-linecap', 'round'], ['stroke-linejoin', 'round']]) p.setAttribute(k, v);
  svg.append(p);
  return svg;
}
const norm = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
const count = (n) => n + (n > 1 ? ' éléments' : ' élément');
const folders = () => { const v = store.read(); return v === undefined ? undefined : Array.isArray(v) ? v : []; };

// ─── Le geste : appui, seuil, glisser ────────────────────────────────────────────────────────────────────────────

let press = null; // { el, x, y } : bouton enfoncé, pas encore parti
let drag = null; // le glisser en cours (voir begin)
let swallow = false; // le clic qui suit un glisser ne compte pas

const handleOf = (t) => (t instanceof Element ? t.closest('[data-dg]') : null);

document.addEventListener('mousedown', (e) => {
  if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || drag || !store || !fine.matches) return;
  const el = handleOf(e.target);
  if (!el || !el.getAttribute('data-dg-id')) return;
  if (e.target.closest('input, textarea, select, [contenteditable="true"]')) return;
  // Ni sélection de texte ni glisser natif d'un lien ou d'une image : le geste est à nous. Le clic, lui, a lieu.
  e.preventDefault();
  press = { el, x: e.clientX, y: e.clientY };
  window.addEventListener('mousemove', onMove, true);
  window.addEventListener('mouseup', onUp, true);
}, true);

// Un lien ou une image ne part jamais en glisser natif depuis un élément qui se range.
document.addEventListener('dragstart', (e) => { if (store && handleOf(e.target)) e.preventDefault(); }, true);

// Le clic qui termine un glisser (sur la ligne, ou sur ce qui est dessous) n'ouvre rien.
window.addEventListener('click', (e) => {
  if (!swallow) return;
  e.preventDefault();
  e.stopPropagation();
}, true);

function onMove(e) {
  if (drag) {
    drag.px = e.clientX;
    drag.py = e.clientY;
    schedule();
    return;
  }
  if (!press) return;
  if (Math.hypot(e.clientX - press.x, e.clientY - press.y) < START) return;
  const p = press;
  press = null;
  if (!p.el.isConnected) { unbind(); return; }
  begin(p, e);
}

function onUp() {
  unbind();
  press = null;
  if (!drag || drag.phase !== 'drag') return;
  swallow = true;
  setTimeout(() => { swallow = false; }, 0); // le clic arrive juste après mouseup, dans la même tâche
  drop();
}

function unbind() {
  window.removeEventListener('mousemove', onMove, true);
  window.removeEventListener('mouseup', onUp, true);
}

/** La copie : la ligne d'un tableau garde ses colonnes (une table d'une ligne, largeurs mesurées) ; une carte, telle quelle. */
function ghostOf(el, r) {
  const g = node('div', 'dg-ghost sw');
  g.setAttribute('aria-hidden', 'true');
  g.inert = true;
  let c;
  let radius = '16px';
  if (el.tagName === 'TR') {
    const src = el.closest('table');
    c = node('table', src ? src.className : 'sw-table');
    c.style.cssText = `width: ${r.width}px; table-layout: fixed; border-collapse: collapse; margin: 0;`;
    const body = node('tbody');
    const row = el.cloneNode(true);
    const cells = el.children;
    Array.from(row.children).forEach((td, i) => { if (cells[i]) td.style.width = `${cells[i].getBoundingClientRect().width}px`; });
    row.style.background = 'transparent';
    body.append(row);
    c.append(body);
  } else {
    c = el.cloneNode(true);
    Object.assign(c.style, { margin: '0', width: `${r.width}px`, height: `${r.height}px`, boxShadow: 'none' });
    radius = getComputedStyle(el).borderRadius || radius;
  }
  // Les marqueurs des autres modules (aperçu, bascules, chiffres) et les identifiants ne sont pas recopiés.
  for (const n of [c, ...c.querySelectorAll('*')]) {
    for (const a of Array.from(n.attributes)) if (/^(id|key|data-(dg|pv|key|lq|mo|roll|morph|sheet).*)$/.test(a.name)) n.removeAttribute(a.name);
  }
  g.style.cssText = `left: ${r.left}px; top: ${r.top}px; width: ${r.width}px; height: ${r.height}px; border-radius: ${radius};`;
  g.append(c);
  return g;
}

function begin(p, e) {
  hideNote(); // la notice d'un rangement précédent laisse la place au dock
  const el = p.el;
  const r = el.getBoundingClientRect();
  const item = { kind: el.getAttribute('data-dg'), id: el.getAttribute('data-dg-id'), label: el.getAttribute('data-dg-label') || '',
    cover: el.getAttribute('data-dg-cover') || null };
  const ghost = ghostOf(el, r);
  const ox = p.x - r.left;
  const oy = p.y - r.top;
  ghost.style.transformOrigin = `${ox}px ${oy}px`;
  const veil = node('div', 'dg-veil');
  veil.setAttribute('aria-hidden', 'true');
  const bar = node('div', 'dg-bar sw');
  const say = node('div', 'dg-say');
  say.setAttribute('role', 'status');
  const dock = node('div', 'dg-dock');
  dock.setAttribute('role', 'group');
  dock.setAttribute('aria-label', 'Tes dossiers');
  bar.append(say, dock);
  drag = { el, r, item, name: el.getAttribute('data-dg-name') || item.label, ghost, veil, bar, say, dock, ox, oy, x0: p.x, y0: p.y, px: e.clientX, py: e.clientY,
    scale: Math.min(1, MAXW / r.width), t0: performance.now(), tiles: [], over: null, near: 0, raf: 0, phase: 'drag', loading: false, unlisten: null };
  fillDock();
  document.body.append(veil, bar, ghost);
  const sel = window.getSelection && window.getSelection();
  if (sel && sel.rangeCount) sel.removeAllRanges();
  veil.animate([{ opacity: 0 }, { opacity: 1 }], { duration: ms(200), easing: 'ease-out' });
  bar.animate([{ opacity: 0, transform: 'translate(-50%, 28px)' }, { opacity: 1, transform: 'translate(-50%, 0)' }], { duration: ms(380), easing: SPRING });
  window.addEventListener('keydown', onKey, true);
  window.addEventListener('blur', onBlur);
  if (store.listen) drag.unlisten = store.listen(() => { if (drag && drag.phase === 'drag' && drag.loading) fillDock(); });
  frame();
}

/** Le dock : les dossiers les plus récents (créés ou remplis), leur nombre d'éléments, puis « Nouveau dossier ». */
function fillDock() {
  const d = drag;
  const list = folders();
  d.loading = list === undefined;
  const same = (x) => x && x.kind === d.item.kind && x.id === d.item.id;
  const recent = (f) => (f.items || []).reduce((m, x) => Math.max(m, x.at || 0), f.createdAt || 0);
  const top = (list || []).slice().sort((a, b) => recent(b) - recent(a)).slice(0, SHOWN);
  d.dock.textContent = '';
  d.tiles = top.map((f) => {
    const inside = (f.items || []).some(same);
    const t = tile(FOLDER, f.name, inside ? 'Déjà dedans' : count((f.items || []).length));
    if (inside) t.lastChild.setAttribute('data-in', '');
    return { el: t, folder: f };
  });
  const add = tile(PLUS, 'Nouveau', 'dossier');
  add.setAttribute('aria-label', 'Nouveau dossier');
  if (d.loading) add.setAttribute('data-off', '');
  d.tiles.push({ el: add, add: true });
  d.tiles.forEach((t) => d.dock.append(t.el));
  d.say.textContent = d.loading ? 'Chargement de tes dossiers…'
    : top.length ? `Lâche sur un dossier pour y ranger ${d.name}` : `Lâche sur « Nouveau dossier » pour ranger ${d.name}`;
  d.over = null;
}

function tile(d, name, sub) {
  const t = node('div', 'dg-tile');
  t.append(icon(d, 22), node('span', 'dg-name', name), node('span', 'dg-n', sub));
  return t;
}

const schedule = () => { if (drag && !drag.raf) drag.raf = requestAnimationFrame(frame); };

/**
 * Une image : la case survolée, puis la copie à sa place sous le pointeur. Au-dessus d'un dossier, la copie rapetisse
 * (elle « entre ») ; elle reprend sa taille en s'en éloignant.
 */
function frame() {
  const d = drag;
  if (!d) return;
  d.raf = 0;
  if (d.phase !== 'drag') return;
  let over = null;
  for (const x of d.tiles) {
    const b = x.el.getBoundingClientRect();
    if (d.px >= b.left - 6 && d.px <= b.right + 6 && d.py >= b.top - 6 && d.py <= b.bottom + 6) { over = x; break; }
  }
  if (over && over.add && d.loading) over = null;
  if (over !== d.over) {
    if (d.over) d.over.el.removeAttribute('data-on');
    if (over) over.el.setAttribute('data-on', '');
    d.over = over;
  }
  const k = reduced() ? 1 : Math.min(1, (performance.now() - d.t0) / LIFT);
  const t = 1 - Math.pow(1 - k, 3);
  const goal = over ? 1 : 0;
  d.near = reduced() ? goal : Math.abs(goal - d.near) < 0.01 ? goal : d.near + (goal - d.near) * 0.22;
  const s = (1 + (d.scale - 1) * t) * (1 - 0.35 * d.near);
  d.ghost.style.transform = `translate(${d.px - d.x0}px, ${d.py - d.y0}px) rotate(${-1.5 * t}deg) scale(${s})`;
  if (k < 1 || d.near !== goal) schedule();
}

function onKey(e) {
  if (e.key !== 'Escape' || !drag) return;
  e.preventDefault();
  e.stopPropagation();
  cancel();
}
function onBlur() { if (drag && drag.phase === 'drag') cancel(); }

function drop() {
  const d = drag;
  if (d.raf) { cancelAnimationFrame(d.raf); d.raf = 0; }
  const over = d.over;
  if (!over) return cancel();
  if (over.add) return naming(over);
  file(over.folder.id, null, over);
}

// ─── La fin du geste ─────────────────────────────────────────────────────────────────────────────────────────────

/** La transformation de la copie en ce moment (celle de la dernière image). */
const nowT = (d) => d.ghost.style.transform || 'none';

/** La copie entre dans la case du dossier, en rapetissant. */
function absorb(d, t) {
  const b = t.el.getBoundingClientRect();
  const to = `translate(${b.left + b.width / 2 - d.x0}px, ${b.top + b.height / 2 - d.y0}px) rotate(-1.5deg) scale(0.08)`;
  const a = d.ghost.animate([{ transform: nowT(d), opacity: 1 }, { transform: to, opacity: 0 }], { duration: ms(INTO), easing: 'cubic-bezier(0.5, 0, 0.75, 0)', fill: 'forwards' });
  a.finished.then(() => d.ghost.remove(), () => d.ghost.remove());
  t.el.animate([{ transform: 'scale(1.06)' }, { transform: 'scale(1.16)', offset: 0.45 }, { transform: 'scale(1)' }], { duration: ms(420), delay: ms(INTO - 80), easing: 'ease-out' });
}

/** Le voile et le dock s'en vont ; le geste est fini. */
function finish(d, delay) {
  if (d.unlisten) d.unlisten();
  window.removeEventListener('keydown', onKey, true);
  window.removeEventListener('blur', onBlur);
  if (drag === d) drag = null;
  const out = { duration: ms(240), delay: ms(delay || 0), easing: 'ease-in', fill: 'forwards' };
  // Le voile, devenu transparent, reste jusqu'au prochain mouvement de la souris : la page qui réapparaît sous un
  // pointeur immobile n'ouvre pas l'aperçu d'une vidéo survolée (src/app/main.js) sans qu'on ait bougé.
  const gone = () => {
    d.veil.remove();
    for (const t of ['mousemove', 'mousedown', 'wheel']) window.removeEventListener(t, gone, true);
  };
  d.veil.style.cursor = 'default';
  d.veil.animate([{ opacity: 1 }, { opacity: 0 }], out).finished.then(() => {
    for (const t of ['mousemove', 'mousedown', 'wheel']) window.addEventListener(t, gone, true);
  }, gone);
  d.bar.animate([{ opacity: 1, transform: 'translate(-50%, 0)' }, { opacity: 0, transform: 'translate(-50%, 24px)' }], out).finished.then(() => d.bar.remove(), () => d.bar.remove());
}

/** Lâchée ailleurs, Échap : la copie revient à sa place (la ligne a pu bouger : défilement, nouvelle donnée). */
function cancel() {
  const d = drag;
  if (!d) return;
  if (d.raf) cancelAnimationFrame(d.raf);
  const sel = `[data-dg="${CSS.escape(d.item.kind)}"][data-dg-id="${CSS.escape(d.item.id)}"]`;
  const home = d.el.isConnected ? d.el : document.querySelector(sel);
  if (d.phase === 'drag' && home) {
    const h = home.getBoundingClientRect();
    const to = `translate(${h.left - d.r.left}px, ${h.top - d.r.top}px) rotate(0deg) scale(1)`;
    const a = d.ghost.animate([{ transform: nowT(d), opacity: 1 }, { opacity: 1, offset: 0.75 }, { transform: to, opacity: 0 }], { duration: ms(BACK), easing: EASE, fill: 'forwards' });
    a.finished.then(() => d.ghost.remove(), () => d.ghost.remove());
  } else d.ghost.remove();
  finish(d, 0);
}

/** L'élément, tel qu'AjoutDossier le range. */
const entryOf = (item) => ({ kind: item.kind, id: item.id, label: item.label, cover: item.cover || null, at: Date.now() });

/**
 * Range l'élément dans le dossier `fid` (ou dans `created`, un dossier neuf) ; la notice permet d'annuler. `t` : la case
 * où la copie entre (null quand elle y est déjà entrée, au nom d'un nouveau dossier).
 */
function file(fid, created, t) {
  const d = drag;
  const list = folders();
  if (list === undefined) return cancel(); // dossiers pas encore lus : on n'écrase rien
  const same = (x) => x && x.kind === d.item.kind && x.id === d.item.id;
  let target = created;
  let next;
  if (created) next = [created].concat(list);
  else {
    target = list.filter((f) => f.id === fid)[0];
    if (!target) return cancel();
    if ((target.items || []).some(same)) {
      if (t) absorb(d, t);
      finish(d, t ? INTO - 120 : 0);
      notice(target.name, null);
      return undefined;
    }
    next = list.map((f) => (f.id === fid ? Object.assign({}, f, { items: [entryOf(d.item)].concat(f.items || []) }) : f));
  }
  store.write(next);
  if (t) absorb(d, t);
  finish(d, t ? INTO - 120 : 0);
  const id = target.id;
  notice(target.name, () => {
    const cur = folders();
    if (!cur) return;
    let back = cur.map((f) => (f.id === id ? Object.assign({}, f, { items: (f.items || []).filter((x) => !same(x)) }) : f));
    if (created) back = back.filter((f) => !(f.id === id && !(f.items || []).length)); // le dossier créé pour l'occasion part avec
    store.write(back);
  });
  return undefined;
}

/** « Nouveau dossier » : la copie y entre, le dock devient un champ pour le nommer (comme AjoutDossier). */
function naming(t) {
  const d = drag;
  d.phase = 'name';
  absorb(d, t);
  d.veil.setAttribute('data-naming', '');
  d.bar.setAttribute('data-naming', '');
  d.veil.addEventListener('mousedown', (e) => { if (drag !== d) return; e.preventDefault(); cancel(); }); // à côté : rien n'est créé
  const form = node('form', 'dg-dock dg-form');
  form.setAttribute('aria-label', 'Nouveau dossier');
  const ic = node('span', 'dg-form-ic');
  ic.append(icon(FOLDER, 20));
  const input = node('input', 'dg-in');
  Object.assign(input, { type: 'text', maxLength: 60, placeholder: 'Nom du dossier', autocomplete: 'off', spellcheck: false });
  input.setAttribute('aria-label', 'Nom du nouveau dossier');
  const no = node('button', 'dg-quiet', 'Annuler');
  no.type = 'button';
  no.addEventListener('click', () => cancel());
  const go = node('button', 'sw-btn sw-btn-primary sw-btn-sm');
  go.type = 'submit';
  go.append('Créer et ranger');
  const tl = node('span', 'sw-btn-tile');
  tl.append(icon(ARROW, 15, '2.4'));
  go.append(tl);
  form.append(ic, input, no, go);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (drag !== d) return; // déjà rangé (double Entrée) ou annulé
    const name = input.value.trim();
    const list = folders();
    if (!name || list === undefined) { input.focus(); return; }
    const twin = list.filter((f) => norm(f.name) === norm(name))[0]; // un dossier de ce nom existe : on y range
    if (twin) { file(twin.id, null, null); return; }
    const now = Date.now();
    file(null, { id: now.toString(36) + Math.random().toString(36).slice(2, 6), name: name.slice(0, 200), createdAt: now, items: [entryOf(d.item)] }, null);
  });
  const swap = () => {
    if (drag !== d) return;
    d.say.textContent = `Le nouveau dossier où ranger ${d.name}`;
    d.dock.replaceWith(form);
    d.dock = form;
    form.animate([{ opacity: 0, transform: 'scale(0.96)' }, { opacity: 1, transform: 'none' }], { duration: ms(220), easing: EASE });
    input.focus();
  };
  if (reduced()) swap(); else setTimeout(swap, INTO - 60);
}

// ─── La notice « Rangé dans « … » · Annuler » ────────────────────────────────────────────────────────────────────

let note = null;
let noteTimer = 0;

function hideNote() {
  clearTimeout(noteTimer);
  const n = note;
  note = null;
  if (!n) return;
  n.animate([{ opacity: 1, transform: 'translate(-50%, 0)' }, { opacity: 0, transform: 'translate(-50%, 10px)' }], { duration: ms(200), easing: 'ease-in', fill: 'forwards' })
    .finished.then(() => n.remove(), () => n.remove());
}

function notice(name, undo) {
  if (note) { clearTimeout(noteTimer); note.remove(); note = null; }
  const n = node('div', 'dg-note sw');
  n.setAttribute('role', 'status');
  n.append(icon(CHECK, 16, '2.4'));
  const txt = node('span');
  txt.append(undo ? 'Rangé dans « ' : 'Déjà dans « ', node('b', null, name), ' »');
  n.append(txt);
  if (undo) {
    const b = node('button', 'dg-undo', 'Annuler');
    b.type = 'button';
    b.addEventListener('click', () => { undo(); hideNote(); });
    n.append(b);
  } else n.setAttribute('data-solo', '');
  const arm = () => { clearTimeout(noteTimer); noteTimer = setTimeout(hideNote, NOTE_MS); };
  n.addEventListener('mouseenter', () => clearTimeout(noteTimer));
  n.addEventListener('mouseleave', arm);
  document.body.append(n);
  n.animate([{ opacity: 0, transform: 'translate(-50%, 12px)' }, { opacity: 1, transform: 'translate(-50%, 0)' }], { duration: ms(280), delay: ms(120), easing: EASE, fill: 'backwards' });
  note = n;
  arm();
}
