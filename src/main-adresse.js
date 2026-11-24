// La page du lien « Confirme ta nouvelle adresse » (maquettes AdrA2-A4, convex/users.ts). Elle ne demande pas d'être
// connectée : le jeton du lien suffit. Il est retiré de la barre d'adresse dès la lecture (historique, captures d'écran).
import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import Adresse from './pages/Adresse.js';
import { client, mount } from './auth.js';
import { FALLBACK, fetchStats } from './stats.js';
import { api } from '../convex/_generated/api.js';
import './styles/ds/tokens.css';
import './styles/ds/bundle.css';
import './styles/adr.css';

const token = new URLSearchParams(window.location.search).get('t') || '';
if (token) window.history.replaceState(null, '', window.location.pathname);
const adresse = {
  peek: (t) => client.action(api.users.peekEmailChange, { token: t }),
  confirm: (t) => client.action(api.users.confirmEmailChange, { token: t }),
};

function Page() {
  const [stats, setStats] = useState(FALLBACK);
  useEffect(() => {
    let live = true;
    fetchStats().then((s) => live && setStats(s));
    return () => { live = false; };
  }, []);
  return h(Adresse, { adresse, token, stats });
}

mount(h(Page));
