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

// Monte la version mobile sous 860 px, la version desktop au-dessus,
// et bascule si la fenêtre change de taille.
const QUERY = '(max-width: 860px)';

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
