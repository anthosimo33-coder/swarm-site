import { Component, h } from 'preact';

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

// Monte la version mobile ou desktop selon MOBILE_QUERY, et bascule si l'écran change (rotation, fenêtre).
const QUERY = MOBILE_QUERY;

export class Responsive extends Component {
  constructor(props) {
    super(props);
    this.mq = window.matchMedia(QUERY);
    this.state = { mobile: this.mq.matches };
    this.onChange = (e) => this.setState({ mobile: e.matches });
  }

  componentDidMount() {
    this.mq.addEventListener('change', this.onChange);
  }

  componentWillUnmount() {
    this.mq.removeEventListener('change', this.onChange);
  }

  // `props` : ce que la page reçoit (les chiffres du Radar sur les pages publiques, cf src/stats.js).
  render({ desktop, mobile, props }, { mobile: isMobile }) {
    return h(isMobile ? mobile : desktop, props ?? null);
  }
}
