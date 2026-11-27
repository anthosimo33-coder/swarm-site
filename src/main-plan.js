// L'onboarding B du test A/B (26/11/2026) : /plan, maquette B1 retenue par le fondateur (design/Plan.dc.html pour
// l'ordinateur, design/PlanMobile.dc.html pour le téléphone). 5 questions et le plan, sans compte ; l'inscription au milieu
// (version C : la feuille sur l'app floutée) ; puis l'app à copier, la signature, et le paywall qui mène au paiement Whop
// (/app/payer/<formule>, comme les formules de l'app).
//
// Arrivée sur /plan :
// - une personne déjà connectée est un compte d'avant : elle va dans l'app, sauf si sa progression ici a dépassé
//   l'inscription (elle vient de créer son compte, ou revient de Google) ;
// - sinon le bras est tiré (src/ab.js) ; en A, la personne repart vers l'inscription d'avant.
import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { useConvexAuth, useQuery } from 'convex/react';
import { api } from '../convex/_generated/api.js';
import { enrollAb, mount, useAuthBridge } from './auth.js';
import { armFor, readPlan, savePlan, signedIn, track } from './ab.js';
import { MOBILE_QUERY } from './runtime.js';
import './styles/ds/tokens.css';
import './styles/ds/bundle.css';
import './styles/pl.css';
import './styles/plm.css';

const AFTER_SIGNUP = ['inscription', 'app', 'engagement', 'paywall'];
const firstName = (name) => (typeof name === 'string' && name.trim() ? name.trim().split(/\s+/)[0].slice(0, 24) : '');

function PlanHost() {
  const auth = useAuthBridge();
  const { isLoading, isAuthenticated } = useConvexAuth();
  const viewer = useQuery(api.users.viewer, isAuthenticated ? {} : 'skip');
  const [Page, setPage] = useState(null);
  const enrolled = useRef(false);

  // La version de l'écran (téléphone sous 860 px, sinon ordinateur), chargée seule ; l'autre si l'écran bascule.
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const load = () => (mq.matches ? import('./pages/PlanMobile.js') : import('./pages/Plan.js')).then((m) => setPage(() => m.default));
    load();
    mq.addEventListener('change', load);
    return () => mq.removeEventListener('change', load);
  }, []);

  // Compte d'avant : dans l'app. Compte tout juste créé : le bras s'écrit dessus (une fois).
  useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    const saved = readPlan();
    if (!enrolled.current && saved && AFTER_SIGNUP.includes(saved.step)) {
      enrolled.current = true;
      enrollAb();
    } else if (!enrolled.current) {
      window.location.replace('/app');
    }
  }, [isLoading, isAuthenticated]);

  if (!Page || isLoading) return null;
  return h(Page, {
    auth,
    authed: isAuthenticated,
    user: viewer ? { prenom: firstName(viewer.name) } : null,
    saved: readPlan(),
    save: savePlan,
    track: (event, props) => track(event, props),
    onPay: (formule) => window.location.assign('/app/payer/' + (formule === 'annuel' ? 'annuel' : 'mensuel')),
    onLater: () => window.location.assign('/app'),
  });
}

if (signedIn() && !(readPlan() && AFTER_SIGNUP.includes(readPlan().step))) {
  window.location.replace('/app');
} else if (!signedIn() && armFor() === 'A') {
  window.location.replace('/inscription' + window.location.search);
} else {
  mount(h(PlanHost));
}
