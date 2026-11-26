import { mountResponsive } from './runtime.js';
import './styles/ds/tokens.css';
import './styles/ds/bundle.css';
// Les deux feuilles restent chargées d'office : le pré-rendu (scripts/prerender.mjs) montre l'une ou l'autre avant le JS.
import './styles/sim.css';
import './styles/simm.css';

// Le simulateur (26/11/2026) : une seule version chargée, l'autre si l'écran bascule (audit F23, comme la landing et les
// tarifs). Ses données sont dans la page (relevé du Radar du 26/11) : aucun appel au backend pour une visite.
//
// /simulateur?film=1 : la version « film », toutes les apps en clair, sans verrou ni prix, réservée à l'administration
// (les adresses d'ADMIN_EMAILS, comme /admin). Sans compte admin, la version normale, sans message.
let paywall = true;
const redraw = mountResponsive(document.getElementById('app'), {
  desktop: () => import('./pages/Simulateur.js'),
  mobile: () => import('./pages/SimulateurMobile.js'),
}, () => ({ paywall }));

if (new URLSearchParams(window.location.search).get('film') === '1') {
  import('./simulateur-film.js')
    .then(({ isAdmin }) => isAdmin())
    .then((admin) => { if (admin) { paywall = false; redraw(); } })
    .catch(() => {});
}
