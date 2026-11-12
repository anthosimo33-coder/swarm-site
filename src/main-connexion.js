import { h, render } from 'preact';
import Connexion from './pages/Connexion.js';
import './styles/ds/tokens.css';
import './styles/ds/bundle.css';
import './styles/cx.css';

render(h(Connexion, null), document.getElementById('app'));
