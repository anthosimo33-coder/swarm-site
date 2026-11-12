import { h, render } from 'preact';
import { Responsive } from './runtime.js';
import LP from './pages/LP.js';
import LPMobile from './pages/LPMobile.js';
import './styles/lp.css';
import './styles/lpm.css';

render(h(Responsive, { desktop: LP, mobile: LPMobile }), document.getElementById('app'));
