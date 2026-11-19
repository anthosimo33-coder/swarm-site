import { h, render } from 'preact';
import { Responsive } from './runtime.js';
import Tarifs from './pages/Tarifs.js';
import TarifsMobile from './pages/TarifsMobile.js';
import './styles/tf.css';
import './styles/tfm.css';

import { countVisit, fetchStats } from './stats.js';

// La page s'affiche tout de suite (chiffres du dernier relevé connu), puis avec ceux du Radar.
const show = (stats) => render(h(Responsive, { desktop: Tarifs, mobile: TarifsMobile, props: { stats } }), document.getElementById('app'));
show(null);
fetchStats().then(show);
countVisit();
