import { mountAuthPage } from './auth.js';
import { armFor, signedIn } from './ab.js';
import './styles/ds/tokens.css';
import './styles/ds/bundle.css';
import './styles/ins.css';

// Test A/B de l'onboarding (26/11/2026, src/ab.js) : à la première arrivée sur l'inscription, un visiteur sur deux part
// sur l'onboarding /plan (bras B), qui demande le compte au milieu. Une personne déjà connectée reste ici (la page
// l'emmène dans l'app). Le bras tiré reste le même aux visites suivantes.
if (!signedIn() && armFor() === 'B') {
  window.location.replace('/plan' + window.location.search);
} else {
  import('./pages/Inscription.js').then((m) => mountAuthPage(m.default));
}
