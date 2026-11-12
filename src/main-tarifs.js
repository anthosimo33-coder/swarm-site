import { h, render } from 'preact';
import { Responsive } from './runtime.js';
import Tarifs from './pages/Tarifs.js';
import TarifsMobile from './pages/TarifsMobile.js';
import './styles/tf.css';
import './styles/tfm.css';

render(h(Responsive, { desktop: Tarifs, mobile: TarifsMobile }), document.getElementById('app'));
