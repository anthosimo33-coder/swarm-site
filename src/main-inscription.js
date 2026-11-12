import { h, render } from 'preact';
import Inscription from './pages/Inscription.js';
import './styles/ds/tokens.css';
import './styles/ds/bundle.css';
import './styles/ins.css';

render(h(Inscription, null), document.getElementById('app'));
