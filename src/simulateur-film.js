// La version « film » du simulateur (/simulateur?film=1) : réservée à l'administration, par le même contrôle que /admin.
// convex/admin.ts (data) ne rend ses lignes qu'aux adresses d'ADMIN_EMAILS et null à tout autre compte : ici, une seule
// lecture, au moment le plus étroit possible (since = maintenant), seulement si quelqu'un est connecté. Chargé à la
// demande par src/main-simulateur.js : une visite sans ?film=1 ne charge ni Convex ni la connexion.
import { h, render } from 'preact';
import { useEffect } from 'preact/hooks';
import { useConvex, useConvexAuth } from 'convex/react';
import { ConvexAuthProvider } from '@convex-dev/auth/react';
import { api } from '../convex/_generated/api.js';
import { client } from './auth.js';

function Probe({ done }) {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const convex = useConvex();
  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) { done(false); return; }
    convex.query(api.admin.data, { since: Date.now() }).then((d) => done(d !== null && d !== undefined), () => done(false));
  }, [isLoading, isAuthenticated]);
  return null;
}

/** Vrai si la personne connectée est administratrice ; faux sans compte, avec un autre compte, ou en cas d'échec. */
export function isAdmin() {
  return new Promise((resolve) => {
    // Hors de la page : la session est lue par le même client et le même fournisseur que /admin, rien ne s'affiche.
    const box = document.createElement('div');
    let answered = false;
    const done = (yes) => {
      if (answered) return;
      answered = true;
      resolve(yes);
      setTimeout(() => render(null, box), 0);
    };
    render(h(ConvexAuthProvider, { client }, h(Probe, { done })), box);
  });
}
