// Le cadre et les squelettes de l'app — maquette 1A « le cadre tout de suite », validée le 20/11.
//
// Avant le code : app.html dessine le cadre seul (rail sur ordinateur, en-tête et barre du bas sur téléphone), la
// rubrique devinée d'après l'adresse par public/app-frame.js. Dès que le code est là, le routeur (src/app/main.js) le
// remplace par l'écran-squelette de l'adresse : le même cadre, et à la place du contenu des blocs à la forme de l'écran
// (liste en tableau, cartes, fiche…), aux mêmes marges et aux mêmes hauteurs de lignes. Quand le document de l'écran
// arrive, le vrai écran se pose dessous et le squelette s'efface en fondu : rien ne saute. Un changement d'écran qui
// dure plus de 150 ms montre de même le squelette de l'écran demandé, rubrique déjà allumée.
//
// Les écrans ne savent rien de ce module. Le dessin est dans le système de design (classes sk-*, bundle.css) ; le reflet
// qui glisse sur les blocs est un transform (jamais une animation de background-position), absent si l'on a demandé
// moins d'animations. Sans DOM ici (testé par scripts/app.test.mjs) : seulement des nœuds Preact.
import { h } from 'preact';

/** Les rubriques, dans l'ordre du rail et de la barre du bas : clé, libellé, adresse, tracé de l'icône (canevas, sb). */
export const RUBRIQUES = [
  ['accueil', 'Accueil', '/app', 'M4 11l8-6 8 6v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z'],
  ['apps', 'Apps', '/app/apps', 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z'],
  ['formats', 'Formats', '/app/formats', 'M4 5h16v14H4zM10 9l5 3-5 3z'],
  ['createurs', 'Créateurs', '/app/createurs', 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6'],
  ['alertes', 'Alertes', '/app/alertes', 'M6 16v-5a6 6 0 1 1 12 0v5l2 2H4zM10 20.5a2 2 0 0 0 4 0'],
  ['dossiers', 'Dossiers', '/app/dossiers', 'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'],
];
/** La barre du bas (téléphone) : Alertes est dans l'en-tête. */
export const TABS = ['accueil', 'apps', 'formats', 'createurs', 'dossiers'];

const SEARCH_D = 'M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM15.5 15.5L20 20';
const BELL_D = 'M6 16v-5a6 6 0 1 1 12 0v5l2 2H4zM10 20.5a2 2 0 0 0 4 0';

/** La rubrique d'une adresse (« apps » pour /app/apps/higgsfield), « accueil » pour /app, null pour une vidéo. */
export function rubriqueOf(pathname) {
  const p = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  if (p === '/app' || p === '/app/compte') return 'accueil';
  const m = p.match(/^\/app\/(apps|formats|createurs|alertes|dossiers)(\/|$)/);
  return m ? m[1] : null;
}

/** La forme de l'écran d'une adresse. */
export function kindOf(pathname) {
  const p = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  if (p === '/app/apps') return 'apps';
  if (p === '/app/formats') return 'formats';
  if (p === '/app/createurs') return 'creators';
  if (p === '/app/createurs/cartes') return 'creatorCards';
  if (p === '/app/alertes') return 'alerts';
  if (p === '/app/dossiers') return 'folders';
  if (/^\/app\/dossiers\/[^/]+$/.test(p)) return 'folder';
  if (/^\/app\/videos\/[^/]+$/.test(p)) return 'video';
  if (/^\/app\/(apps|createurs|formats)\/[^/]+$/.test(p)) return 'fiche';
  return 'home';
}

/** Les écrans téléphone sans barre du bas (vidéo, un dossier ouvert). */
export const noTabbar = (kind) => kind === 'video' || kind === 'folder';

// ─── les briques ───
const px = (n) => (typeof n === 'number' ? `${n}px` : n);
/** Un bloc qui attend (le reflet glisse dessus). */
const b = (w, ht, r, extra) => h('i', { class: 'sk-b', style: { width: px(w), height: px(ht), borderRadius: px(r ?? 8), ...extra } });
const row = (style, ...kids) => h('div', { class: 'sk-row', style }, ...kids);
const col = (style, ...kids) => h('div', { class: 'sk-col', style }, ...kids);
const card = (style, ...kids) => h('div', { class: 'sk-card', style }, ...kids);
const icon = (d, size, sw) => h('svg', { width: size, height: size, viewBox: '0 0 24 24', 'aria-hidden': 'true' },
  h('path', { d, fill: 'none', stroke: 'currentColor', 'stroke-width': sw || 1.8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
const times = (n, f) => Array.from({ length: n }, (_, i) => f(i));

/** Titre de rubrique (le vrai texte), sous-titre en attente. */
function head(title, size, sub, right, style) {
  return h('header', { class: 'sk-head', style },
    col({ gap: '6px', minWidth: 0 },
      title ? h('h1', { class: 'sk-h1', style: { fontSize: px(size), letterSpacing: size >= 40 ? '-0.04em' : '-0.035em' } }, title)
        : h('div', { class: 'sk-h1', style: { fontSize: px(size), height: px(Math.round(size * 1.05)), display: 'flex', alignItems: 'center' } }, b(330, Math.round(size * 0.82), 10)),
      h('p', { class: 'sk-p' }, b(sub, 13, 6, { display: 'inline-block', verticalAlign: 'middle' }))),
    right || null);
}
/** La barre de recherche des listes, telle qu'elle s'affichera (sans être encore active). */
const searchBox = (w, ht, label) => h('div', { class: 'sk-search', style: { flex: `0 1 ${px(w)}`, height: px(ht) } }, icon(SEARCH_D, 18), h('span', null, label));
const pills = (ws, ht) => ws.map((w) => b(w, ht || 36, 10));

// ─── ordinateur : une forme par écran (marges et hauteurs relevées sur les vrais écrans, 1440 × 900) ───
const DESK = {
  apps() {
    const cols = '28.6% 14.8% 19.2% 24.1% 13.4%';
    const line = (k) => h('div', { class: 'sk-tr', style: { gridTemplateColumns: cols, height: '125px' }, key: k },
      row({ gap: '14px', padding: '0 12px 0 20px' }, b(18, 12, 4), b(40, 40, 10), col({ gap: '9px' }, b(110 + (k % 3) * 18, 15, 6), b(170, 11, 5))),
      col({ gap: '10px', padding: '0 12px' }, b(140 - (k % 2) * 30, 26, 13), b(110, 14, 7)),
      col({ gap: '10px', padding: '0 12px' }, row({ gap: '8px' }, b(58, 78, 8), b(58, 78, 8), b(58, 78, 8)), b(120, 11, 5)),
      row({ gap: '16px', padding: '0 12px' }, col({ gap: '8px' }, b(96, 20, 6), b(112, 11, 5)), b(124, 34, 8)),
      col({ gap: '8px', padding: '0 20px 0 12px', alignItems: 'flex-end' }, b(64, 20, 6), b(58, 11, 5)));
    return [
      head('Apps', 40, 560, searchBox(440, 48, 'Chercher une app…'), { padding: '32px 32px 0' }),
      card({ margin: '24px 32px 0' },
        row({ height: '60px', padding: '0 14px', justifyContent: 'space-between' }, row({ gap: '8px' }, ...pills([144, 150, 128])), b(206, 36, 10)),
        h('span', { class: 'sk-line' }),
        row({ height: '60px', padding: '0 14px', justifyContent: 'space-between' }, row({ gap: '8px' }, ...pills([154, 155, 187])), b(196, 36, 10))),
      card({ margin: '16px 32px 0', overflow: 'hidden' },
        h('div', { class: 'sk-tr is-head', style: { gridTemplateColumns: cols, height: '39px' } },
          row({ padding: '0 20px' }, b(44, 10, 4)), row({ padding: '0 12px' }, b(52, 10, 4)), row({ padding: '0 12px' }, b(170, 10, 4)), row({ padding: '0 12px' }, b(70, 10, 4)), row({ padding: '0 20px', justifyContent: 'flex-end' }, b(70, 10, 4))),
        ...times(6, line)),
    ];
  },
  creators() {
    const cols = '4% 26.4% 13.7% 8.2% 10% 16.4% 21.3%';
    const line = (k) => h('div', { class: 'sk-tr', style: { gridTemplateColumns: cols, height: '83px' }, key: k },
      row({ padding: '0 12px 0 20px' }, b(16, 12, 4)),
      row({ gap: '12px', padding: '0 12px' }, b(42, 42, 21), col({ gap: '8px' }, b(100 + (k % 3) * 20, 15, 6), b(130, 11, 5))),
      row({ gap: '8px', padding: '0 12px' }, b(28, 28, 8), col({ gap: '7px' }, b(90, 13, 6), b(56, 10, 5))),
      row({ padding: '0 12px', justifyContent: 'flex-end' }, b(64, 14, 6)),
      row({ padding: '0 12px', justifyContent: 'flex-end' }, b(50, 18, 6)),
      col({ gap: '8px', padding: '0 12px' }, b(120, 14, 6), b(110, 11, 5)),
      row({ gap: '6px', padding: '0 20px 0 12px', justifyContent: 'flex-end' }, b(44, 58, 7), b(44, 58, 7), b(44, 58, 7)));
    return [
      head('Créateurs', 40, 560, searchBox(440, 48, 'Chercher un compte…'), { padding: '32px 32px 0' }),
      card({ margin: '24px 32px 0' }, row({ height: '60px', padding: '0 14px', gap: '8px' }, ...pills([186, 155, 145, 162, 159, 145]))),
      row({ margin: '16px 32px 0', height: '42px', justifyContent: 'space-between' }, row({ gap: '10px' }, b(250, 20, 6), b(180, 12, 5)), row({ gap: '8px' }, b(202, 42, 12), b(210, 42, 14))),
      card({ margin: '12px 32px 0', overflow: 'hidden' },
        h('div', { class: 'sk-tr is-head', style: { gridTemplateColumns: cols, height: '38px' } }, row({ padding: '0 20px' }, b(10, 10, 4)), ...times(6, (i) => row({ padding: '0 12px' }, b([60, 50, 56, 90, 50, 100][i], 10, 4)))),
        ...times(8, line)),
    ];
  },
  creatorCards() {
    const c = (k) => card({ height: '303px', padding: '16px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '14px' },
      row({ gap: '12px' }, b(44, 44, 22), col({ gap: '8px', flex: 1 }, b(110 + (k % 3) * 16, 15, 6), b(150, 11, 5)), b(96, 26, 13)),
      row({ gap: '6px' }, ...times(3, () => b('auto', 165, 12, { flex: '1 1 0' }))),
      row({ justifyContent: 'space-between', marginTop: 'auto' }, b(190, 12, 5), col({ gap: '6px', alignItems: 'flex-end' }, b(56, 20, 6), b(70, 10, 5))));
    return [
      head('Créateurs', 40, 560, searchBox(440, 48, 'Chercher un compte…'), { padding: '32px 32px 0' }),
      card({ margin: '24px 32px 0' }, row({ height: '60px', padding: '0 14px', gap: '8px' }, ...pills([186, 155, 145, 162, 159, 145]))),
      row({ margin: '24px 32px 0', height: '42px', justifyContent: 'space-between' }, row({ gap: '10px' }, b(300, 20, 6), b(180, 12, 5)), row({ gap: '8px' }, b(202, 42, 12), b(210, 42, 14))),
      h('div', { class: 'sk-grid', style: { padding: '16px 32px 48px', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '16px' } }, ...times(6, c)),
    ];
  },
  formats() {
    const c = (k) => card({ height: '140px', padding: '14px', boxSizing: 'border-box', display: 'flex', gap: '14px' },
      b(84, 112, 12), col({ gap: '10px', flex: 1, minWidth: 0 }, b(`${70 - (k % 3) * 12}%`, 15, 6), b(60, 11, 5), b(110, 11, 5), row({ gap: '10px', marginTop: 'auto' }, b(78, 13, 6), b('55%', 6, 3))));
    return [
      head('Formats', 34, 640, searchBox(360, 44, 'Chercher une accroche ou un son…'), { padding: '30px 40px 0' }),
      row({ margin: '20px 40px 0', height: '36px', justifyContent: 'space-between' }, row({ gap: '8px' }, ...pills([82, 124, 86]), h('span', { class: 'sk-sep' }), ...pills([154, 155])), row({ gap: '12px' }, b(76, 13, 6), b(160, 36, 10))),
      card({ margin: '20px 40px 0', height: '300px', padding: '26px 28px', boxSizing: 'border-box', display: 'flex', gap: '26px' },
        col({ gap: '16px', flex: 1 }, b(200, 11, 5), b(300, 34, 10), row({ gap: '8px' }, ...pills([68, 120, 98], 32)), row({ gap: '30px', marginTop: '6px' }, ...times(3, () => col({ gap: '8px' }, b(70, 28, 8), b(110, 11, 5)))), row({ justifyContent: 'space-between', marginTop: 'auto' }, b(300, 14, 6), b(166, 44, 22))),
        row({ gap: '12px', alignItems: 'flex-end' }, b(112, 200, 12), b(92, 164, 12), b(92, 164, 12), b(92, 164, 12))),
      row({ margin: '30px 40px 0', height: '23px' }, b(220, 16, 6)),
      h('div', { class: 'sk-grid', style: { margin: '14px 40px 0', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '12px' } }, ...times(9, c)),
    ];
  },
  alerts() {
    // Relevés sur AlertesA : groupes de 49 px (37 pour le premier), lignes de 65 px tous les 66,5 px ; le détail en blocs.
    const item = (k) => col({ height: '65px', marginTop: '1.5px', gap: '9px', justifyContent: 'center', padding: '0 12px 0 34px' },
      row({ justifyContent: 'space-between', gap: '16px' }, b(`${82 - (k % 4) * 9}%`, 14, 6), b(24, 11, 5)), b(`${58 - (k % 3) * 7}%`, 11, 5));
    const group = (first, w) => row({ height: first ? '37px' : '49px', padding: first ? '0 12px' : '12px 12px 0', justifyContent: 'space-between' }, b(w, 16, 6), first ? b(250, 11, 5) : null);
    return [
      head('Alertes', 34, 180, row({ gap: '8px' }, ...pills([116, 124, 96, 130], 34), h('span', { class: 'sk-sep' }), ...pills([134, 146], 34))),
      h('div', { class: 'sk-inbox' },
        card({ overflow: 'hidden', padding: '0 10px' }, group(true, 100), ...times(4, item), group(false, 46), ...times(8, (k) => item(k + 4))),
        card({ padding: '24px 26px', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
          row({ height: '42px', justifyContent: 'space-between' }, b(300, 12, 5), row({ gap: '12px' }, b(104, 40, 20), b(166, 42, 21))),
          b('78%', 30, 8, { marginTop: '13px', marginBottom: '2px' }),
          row({ gap: '34px', height: '52px', marginTop: '14px' }, ...[[200, 30], [100, 30], [130, 30]].map(([w]) => col({ gap: '9px' }, b(Math.min(w, 120), 30, 8), b(w, 11, 5)))),
          row({ height: '18px', marginTop: '20px', justifyContent: 'space-between' }, b(100, 12, 5), b(136, 12, 5)),
          b('100%', 104, 10, { marginTop: '12px' }),
          b(140, 12, 5, { marginTop: '27px' }), row({ gap: '10px', marginTop: '14px' }, ...times(5, () => b(96, 128, 12))),
          b(175, 12, 5, { marginTop: '24px' }), row({ gap: '18px', marginTop: '14px' }, ...times(4, () => row({ gap: '10px' }, b(30, 30, 15), col({ gap: '6px' }, b(120, 13, 6), b(50, 10, 5))))),
          row({ gap: '8px', marginTop: 'auto' }, b(132, 12, 5), ...pills([60, 68, 119], 32)))),
    ];
  },
  folders() {
    return [
      head('Dossiers', 40, 430, b(200, 50, 25), { padding: '32px 32px 0' }),
      h('div', { class: 'sk-grid', style: { padding: '44px 32px 64px', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '16px' } },
        ...times(3, () => card({ height: '200px', padding: '20px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '12px' }, row({ gap: '8px' }, b(64, 86, 10), b(64, 86, 10), b(64, 86, 10)), b(160, 16, 6), b(110, 11, 5)))),
    ];
  },
  folder() {
    return [
      head(null, 34, 260, row({ gap: '8px' }, b(44, 44, 22), b(150, 44, 22)), { padding: '32px 32px 0' }),
      h('div', { class: 'sk-grid', style: { padding: '28px 32px 48px', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '16px' } },
        ...times(8, () => card({ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }, row({ gap: '8px' }, b(30, 30, 15), b(110, 13, 6)), b('100%', 300, 12)))),
    ];
  },
  home() {
    const fil = (k) => card({ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '14px' }, b(42, 42, 11), col({ gap: '8px', flex: 1 }, b(150, 10, 4), b(`${56 - k * 8}%`, 15, 6), b(170, 11, 5)), b(130, 36, 8));
    // Relevés sur Main (1440) : niches 226 px (6 pastilles sur 4 rangées), suivis 165 px (2 lignes de 52), dossiers jusqu'en bas.
    const side = [
      card({ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '12px' }, row({ height: '23px' }, b(150, 15, 6)), h('div', { class: 'sk-wrap' }, ...pills([176, 150, 130, 136, 150, 96], 32))),
      card({ padding: '20px 22px 14px', display: 'flex', flexDirection: 'column' }, row({ height: '23px' }, b(90, 15, 6)),
        ...times(2, (i) => row({ height: '52px', gap: '12px', marginTop: i ? 0 : '6px', borderTop: i ? '1px solid var(--line)' : 0 }, b(32, 32, 9), col({ gap: '7px', flex: 1 }, b(90, 13, 6), b(80, 10, 5)), b(46, 22, 11)))),
      card({ padding: '20px 22px', display: 'flex', flexDirection: 'column' }, row({ height: '23px' }, b(110, 15, 6)), b('86%', 11, 5, { margin: '14px 0 18px' }), b(166, 40, 12)),
    ];
    return [
      head(null, 32, 360, null, null),
      h('div', { class: 'sk-home' },
        h('div', { class: 'sk-card sk-home-hero', style: { height: '330px', display: 'flex', overflow: 'hidden' } }, b(250, '100%', 0, { flexShrink: 0 }),
          col({ gap: '14px', flex: 1, padding: '26px 28px', minWidth: 0 }, b(150, 12, 5), b('86%', 28, 8), b('58%', 28, 8), b('92%', 13, 6), b('64%', 13, 6),
            row({ gap: '16px', marginTop: 'auto' }, b(30, 30, 8), b(170, 11, 5), h('span', { style: { flex: 1 } }), b(104, 42, 21), b(150, 42, 21)))),
        h('div', { class: 'sk-home-fil' }, row({ height: '32px' }, b(150, 15, 6)), ...times(3, fil)),
        h('aside', { class: 'sk-home-side' }, h('div', { class: 'sk-search', style: { flex: 'none', height: '46px', padding: '0 16px' } }, icon(SEARCH_D, 18), h('span', null, 'Chercher…')), ...side)),
    ];
  },
  fiche() {
    return [
      h('header', { class: 'sk-head', style: { padding: '34px 40px 0', alignItems: 'center' } },
        row({ gap: '16px' }, b(64, 64, 18), col({ gap: '10px' }, b(220, 30, 8), row({ gap: '6px' }, ...pills([170, 64, 120], 32)))),
        row({ gap: '10px' }, b(44, 44, 12), b(176, 44, 22))),
      row({ margin: '22px 40px 0' }, b(476, 42, 14)),
      h('div', { class: 'sk-fiche-1' },
        card({ padding: '22px', display: 'flex', flexDirection: 'column', gap: '12px' }, b(140, 15, 6), b(200, 36, 10), row({ gap: '10px', alignItems: 'flex-end', marginTop: 'auto', height: '150px' }, ...times(6, (i) => b('auto', 40 + i * 18, 7, { flex: '1 1 0' })))),
        col({ gap: '14px' },
          card({ flex: 1, padding: '22px', display: 'flex', flexDirection: 'column', gap: '10px' }, b(80, 15, 6), b(70, 30, 8), b('70%', 11, 5), b('100%', 8, 4)),
          card({ flex: 1, padding: '22px', display: 'flex', flexDirection: 'column', gap: '10px' }, b(90, 15, 6), b(200, 30, 8)))),
      h('div', { class: 'sk-fiche-2' },
        ...times(3, (i) => card({ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }, b(110, 15, 6), ...(i === 0 ? [b(216, 250, 14)] : times(3, () => row({ gap: '10px' }, b(30, 30, 15), col({ gap: '6px', flex: 1 }, b('80%', 13, 6), b('40%', 10, 5)))))))),
    ];
  },
};

/** La vidéo (VideoA) : pas de rail, la visionneuse en grand. */
function deskVideo() {
  return h('div', { class: 'sk-video' },
    card({ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
      row({ height: '76px', padding: '0 24px', gap: '18px', borderBottom: '1px solid var(--line)' }, b(170, 17, 6), b(60, 12, 5), b('50%', 4, 2), h('span', { style: { flex: 1 } }), b(40, 40, 20), b(40, 40, 20), b(40, 40, 20)),
      row({ flex: 1, gap: '28px', padding: '22px 24px', alignItems: 'stretch', minHeight: 0 },
        b(370, '100%', 20, { flexShrink: 0, maxHeight: '660px' }),
        col({ flex: 1, gap: '16px', minWidth: 0 }, row({ gap: '8px' }, ...pills([96, 170, 90, 64], 28)), b('60%', 15, 6), b('100%', 260, 20), b(150, 15, 6), ...times(3, () => row({ gap: '20px', height: '40px' }, b(110, 13, 6), b('50%', 13, 6)))),
        col({ width: '300px', gap: '12px', flexShrink: 0 }, b(80, 13, 6), ...times(4, () => card({ padding: '10px', display: 'flex', gap: '12px' }, b(58, 102, 8), col({ gap: '8px', flex: 1 }, b(40, 18, 9), b(110, 14, 6), b(90, 10, 5)))))),
      row({ height: '84px', padding: '0 24px', borderTop: '1px solid var(--line)', justifyContent: 'space-between' }, b(276, 50, 25), b(280, 14, 6))));
}

/** Le rail, tel que le dessinent les écrans (classes sw-sidebar du système de design). */
function rail(rub, initiale) {
  return h('nav', { class: 'sw-sidebar', 'aria-label': 'Navigation principale' },
    h('a', { class: 'sw-side-logo', href: '/app', 'aria-label': 'Kopycat, accueil' }, h('span', { class: 'sw-app-tile' }, LOGO)),
    h('span', { class: 'sw-side-item', 'aria-hidden': 'true' }, h('span', { class: 'sw-side-ico' }, icon(SEARCH_D, 22)), 'Chercher'),
    ...RUBRIQUES.map(([k, label, href, d]) => h('a', { class: 'sw-side-item', href, 'aria-current': k === rub ? 'page' : 'false', key: k }, h('span', { class: 'sw-side-ico' }, icon(d, 22)), label)),
    h('div', { class: 'sw-side-foot' }, h('span', { class: 'sw-avatar' }, initiale || '')));
}
const LOGO = h('svg', { viewBox: '0 0 24 24', 'aria-hidden': 'true' },
  ...[[5, 8, 1], [11, 5, 1], [17, 8, 1], [8, 14, 0.6], [14, 13, 0.6], [19, 17, 0.6], [11, 20, 0.6]].map(([cx, cy, o]) => h('circle', { cx, cy, r: 2.3, fill: '#FFFFFF', 'fill-opacity': o === 1 ? undefined : o })));

// ─── téléphone ───
const MLOGO = h('svg', { class: 'sw-logo-mark on-dark', width: 24, height: 24, viewBox: '0 0 24 24', 'aria-hidden': 'true', style: { width: '24px', height: '24px' } },
  ...[[5, 8, 'd-a'], [11, 5, 'd-a'], [17, 8, 'd-a'], [8, 14, 'd-b'], [14, 13, 'd-b'], [19, 17, 'd-b'], [11, 20, 'd-b']].map(([cx, cy, c]) => h('circle', { class: c, cx, cy, r: 2.3 })));
function mHead(kind, rub, initiale) {
  const back = kind === 'fiche' || kind === 'folder' || kind === 'video';
  const label = (RUBRIQUES.find((r) => r[0] === rub) || [])[1] || '';
  const tools = kind === 'video' || kind === 'folder' ? [] : [
    h('span', { class: 'sw-btn sw-btn-icon sk-m-tool' }, icon(SEARCH_D, 21)),
    h('span', { class: 'sw-btn sw-btn-icon sk-m-tool' }, icon(BELL_D, 21)),
    h('span', { class: 'sk-m-av' }, h('span', { class: 'sw-avatar' }, initiale || '')),
  ];
  return h('header', { class: 'sk-m-head' },
    h('span', { class: 'sk-m-title' },
      back ? [h('span', { class: 'sw-btn sw-btn-icon sk-m-back' }, icon('M15 6l-6 6 6 6', 22, 2)), b(150, 18, 6)]
        : rub === 'accueil' ? h('span', { class: 'sw-logo' }, MLOGO, h('span', { class: 'sw-wordmark', style: { fontSize: '20px' } }, 'kopycat'))
          : h('span', { class: 'sk-m-name' }, label)),
    ...tools);
}
function mTabbar(rub) {
  return h('nav', { 'data-tabbar': '', class: 'sk-m-tabbar', 'aria-label': 'Navigation principale' },
    ...TABS.map((k) => { const [, label, href, d] = RUBRIQUES.find((r) => r[0] === k);
      return h('a', { href, 'data-tab': '', 'aria-current': k === rub ? 'page' : 'false', class: 'sk-m-tab', key: k }, icon(d, 22, 1.9), label); }));
}
function mBody(kind) {
  const c = (k, ht) => card({ height: px(ht), padding: '14px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '12px' },
    row({ gap: '12px' }, b(18, 11, 4), b(48, 48, 14), col({ gap: '8px', flex: 1 }, b(`${70 - (k % 3) * 10}%`, 16, 6), b(130, 26, 13)), col({ gap: '8px', alignItems: 'flex-end' }, b(70, 22, 6), b(40, 11, 5))),
    row({ gap: '6px', marginTop: 'auto', justifyContent: 'flex-end' }, b('100%', 1, 0, { flex: 1, opacity: 0 }), b(56, 100, 9), b(56, 100, 9), b(56, 100, 9)));
  if (kind === 'home') return [
    col({ gap: '10px', padding: '20px 20px 0' }, b(220, 26, 8), b(260, 13, 6)),
    card({ margin: '24px 20px 0', height: '189px', display: 'flex', gap: '14px', padding: '12px', boxSizing: 'border-box' }, b(108, '100%', 12, { flexShrink: 0 }), col({ gap: '10px', flex: 1 }, b(100, 10, 4), b('90%', 18, 6), b('70%', 18, 6), b('80%', 11, 5), b(120, 36, 18, { marginTop: 'auto' }))),
    col({ gap: '10px', padding: '28px 20px 0' }, b(160, 16, 6), ...times(3, (k) => card({ height: '88px', display: 'flex', alignItems: 'center', gap: '12px', padding: '0 14px' }, b(40, 40, 11), col({ gap: '8px', flex: 1 }, b('70%', 13, 6), b('45%', 10, 5)))))];
  if (kind === 'fiche') return [
    row({ gap: '14px', padding: '20px 20px 0' }, b(72, 72, 20), col({ gap: '10px', flex: 1 }, b('70%', 24, 8), row({ gap: '6px' }, b(120, 26, 13), b(56, 26, 13)))),
    row({ padding: '18px 20px 0' }, b('100%', 54, 16)),
    col({ gap: '12px', padding: '18px 20px 0' }, card({ height: '340px' }), card({ height: '200px' }))];
  if (kind === 'video') return [row({ padding: '12px 20px 0' }, b('100%', '70vh', 20))];
  if (kind === 'folder' || kind === 'folders') return [col({ gap: '12px', padding: '20px 20px 0' }, ...times(3, (k) => card({ height: '120px' })))];
  return [
    card({ margin: '14px 20px 0', height: '60px', display: 'flex', alignItems: 'center', gap: '8px', padding: '0 8px', overflow: 'hidden' }, b(86, 44, 12), b(150, 44, 12), b(150, 44, 12)),
    col({ gap: '10px', padding: '16px 20px 0' }, ...times(4, (k) => c(k, k % 3 === 0 ? 218 : 244)))];
}

/**
 * L'écran-squelette d'une adresse. path : l'adresse (chemin seul) ; mobile : la mise en page téléphone ; initiale : celle
 * du compte, si on la connaît ; first : premier écran (le cadre statique d'app.html est encore dessus, pas d'entrée) ;
 * leaving : le vrai écran est arrivé dessous, le squelette s'efface.
 */
export function Skeleton({ path, mobile, initiale, first, leaving }) {
  const kind = kindOf(path);
  const rub = rubriqueOf(path);
  const cls = `sw sk-screen${mobile ? ' sk-m' : ''}${first ? ' is-first' : ''}${leaving ? ' is-out' : ''}`;
  const busy = { 'aria-busy': 'true', 'aria-label': 'Chargement de l’écran', role: 'status' };
  if (mobile) {
    return h('div', { class: cls, ...busy }, mHead(kind, rub, initiale), h('div', { class: 'sk-m-body' }, ...mBody(kind)), noTabbar(kind) ? null : mTabbar(rub));
  }
  if (kind === 'video') return h('div', { class: cls, ...busy }, deskVideo());
  return h('div', { class: cls, ...busy }, rail(rub, initiale), h('main', { class: `sk-main sk-k-${kind}` }, ...DESK[kind]()));
}
