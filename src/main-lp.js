import { h, render } from 'preact';
import { Responsive } from './runtime.js';
import LP from './pages/LP.js';
import LPMobile from './pages/LPMobile.js';
import './styles/lp.css';
import './styles/lpm.css';

import { countVisit, fetchStats } from './stats.js';

// La page s'affiche tout de suite (chiffres du dernier relevé connu), puis avec ceux du Radar. Le pré-rendu du build
// (scripts/prerender.mjs, audit F9) est retiré dans la même tâche que le premier rendu : pas d'écran vide entre les deux.
document.getElementById('app').replaceChildren();
const show = (stats) => render(h(Responsive, { desktop: LP, mobile: LPMobile, props: { stats } }), document.getElementById('app'));
show(null);
fetchStats().then(show);
countVisit();
