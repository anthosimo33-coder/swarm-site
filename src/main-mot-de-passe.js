import MotDePasse from './pages/MotDePasse.js';
import { mountAuthPage } from './auth.js';
import './styles/ds/tokens.css';
import './styles/ds/bundle.css';
import './styles/mdp.css';

// Mot de passe oublié (parcours B du canevas) : adresse, code reçu par e-mail, nouveau mot de passe, puis l'app.
mountAuthPage(MotDePasse);
