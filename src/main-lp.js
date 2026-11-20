import { mountResponsive } from './runtime.js';
// Les deux feuilles restent chargées d'office : le pré-rendu (scripts/prerender.mjs) montre l'une ou l'autre avant le JS.
import './styles/lp.css';
import './styles/lpm.css';

import { countVisit, fetchStats } from './stats.js';

// Une seule version chargée (audit F23), l'autre si l'écran bascule. La page s'affiche avec les chiffres du dernier
// relevé connu, puis avec ceux du Radar ; le pré-rendu du build (audit F9) reste jusqu'au premier rendu.
let stats = null;
const redraw = mountResponsive(document.getElementById('app'), {
  desktop: () => import('./pages/LP.js'),
  mobile: () => import('./pages/LPMobile.js'),
}, () => ({ stats }));
fetchStats().then((s) => { stats = s; redraw(); });
countVisit();
