import { Component, h, render } from 'preact';

// Équivalent de DCLogic (le moteur des maquettes du canevas) : un composant à état
// dont setState fusionne l'état, comme dans le canevas.
export class DCLogic extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
}

// Polices chargées par le canevas (<link> du helmet) et pas par la page HTML de l'écran : ajoutées à la page à l'import
// de l'écran, une seule fois (audit Q12 : le convertisseur jetait ces <link>, et le décompte des formules perdait Doto).
export const $fonts = (hrefs) => {
  if (typeof document === 'undefined') return;
  const have = new Set([...document.querySelectorAll('link[rel="stylesheet"]')].map((l) => l.getAttribute('href')));
  for (const href of hrefs) {
    if (have.has(href)) continue;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
    have.add(href);
  }
};

// Valeur d'un trou {{…}} : rien plutôt que « undefined ».
export const $t = (x) => (x === undefined || x === null ? '' : x);
// Liste d'un <sc-for> : tableau vide si la valeur manque.
export const $l = (x) => (Array.isArray(x) ? x : []);

// Adresse d'un attribut href, src, action… venue des données (audit S34, 19/11) : chemin relatif, http(s), mailto, tel,
// ou image en data:, sinon « # ». Le lien « voir sur la plateforme » posait telle quelle l'URL du Radar ; une valeur
// « javascript:… » aurait tourné au clic, sur l'origine de Kopycat. Les caractères de contrôle et les espaces, que les
// navigateurs ignorent dans un schéma (« java\tscript: »), sont retirés avant de le lire. Absente : reste absente.
const SAFE_SCHEMES = new Set(['http', 'https', 'mailto', 'tel']);
export const $u = (x) => {
  if (x === undefined || x === null || x === '') return x;
  const s = String(x);
  const scheme = s.replace(/[\u0000-\u0020\u007f-\u009f]/g, '').match(/^([a-z][a-z0-9+.-]*):/i);
  if (!scheme) return s;
  const k = scheme[1].toLowerCase();
  if (SAFE_SCHEMES.has(k)) return s;
  if (k === 'data' && /^\s*data:image\/(png|jpe?g|gif|webp|avif)[;,]/i.test(s)) return s;
  return '#';
};

// La mise en page mobile : sous 860 px de large, ou sur un écran tactile de moins de 500 px de haut. Audit F25 (19/11) :
// sur la seule largeur, un téléphone en paysage (iPhone Plus ou Pro Max : 932 px) recevait l'interface faite pour la
// souris. Une tablette en portrait (820, 834 px) reste mobile, en paysage (1180 px, plus de 500 px de haut) ordinateur.
// La même condition sert au routeur de l'app (src/app/main.js), à sa feuille (src/app/app.css) et au pré-rendu
// (scripts/prerender.mjs).
export const MOBILE_QUERY = '(max-width: 860px), (pointer: coarse) and (max-height: 500px)';

/**
 * Monte une page publique qui a une version ordinateur et une version téléphone (landing, tarifs) dans `el`, en ne
 * chargeant que celle qui s'affiche ; l'autre ne se charge que si l'écran bascule (rotation, fenêtre). Audit F23 (19/11) :
 * les deux versions partaient avec la page (≈ 45 % du JS jamais utilisé). Pas d'aller-retour en plus : vite.config.js
 * précharge le morceau de chaque version dans la page HTML, par l'attribut media (variantPreload). Le pré-rendu (F9) reste
 * à l'écran jusqu'au premier rendu, retiré dans la même tâche. Rend redraw(), à rappeler quand les props changent.
 * `loaders` : { desktop: () => import(…), mobile: () => import(…) } ; `props()` : ce que la page reçoit.
 */
export function mountResponsive(el, loaders, props) {
  const mq = window.matchMedia(MOBILE_QUERY);
  let Page = null;
  let want = null;
  const redraw = () => { if (Page) render(h(Page, props() ?? null), el); };
  const show = async () => {
    const side = mq.matches ? 'mobile' : 'desktop';
    want = side;
    const mod = await loaders[side]();
    if (want !== side) return; // l'écran a basculé pendant le chargement : l'autre appel dessine
    if (!Page) el.replaceChildren();
    Page = mod.default;
    redraw();
  };
  mq.addEventListener('change', show);
  show();
  return redraw;
}
