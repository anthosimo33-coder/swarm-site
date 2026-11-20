// La position de défilement, retenue à chaque navigation et rendue au retour arrière (audit F13, 19/11).
// Avant, chaque nouvel écran revenait en haut, y compris au retour : liste → fiche → retour perdait la position. La
// restauration du navigateur ne servait à rien : le nouvel écran arrive après une promesse (code et données), elle
// s'appliquait à l'ancien puis était écrasée.

/** win : la fenêtre (window), injectée pour le banc. */
export function scrollMemory(win) {
  win.history.scrollRestoration = 'manual';
  let fromPop = false;
  return {
    /** Avant de quitter l'écran (pushState) : sa position, rangée dans son entrée d'historique. */
    remember() {
      win.history.replaceState({ ...(win.history.state || {}), y: win.scrollY }, '');
    },
    /** Retour ou avance dans l'historique (popstate). */
    popped() {
      fromPop = true;
    },
    /** Le nouvel écran est affiché : sa position retenue au retour, sinon l'ancre demandée, sinon le haut. */
    arrive(anchor) {
      const state = win.history.state;
      const y = fromPop && state && typeof state.y === 'number' ? state.y : null;
      fromPop = false;
      if (y !== null) win.requestAnimationFrame(() => win.scrollTo(0, y));
      else if (anchor) anchor.scrollIntoView();
      else win.scrollTo(0, 0);
    },
  };
}
