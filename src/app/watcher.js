// Les abonnements de l'app aux documents (boards.get, saved.get) : un par clé, partagé par les écrans.
// Audit F3 (19/11) : ils n'étaient jamais fermés. Chaque fiche, vidéo enchaînée, créateur survolé ou filtre restait
// abonné toute la session : ré-exécuté côté serveur à chaque renouvellement de jeton et à chaque réécriture, renvoyé
// en entier, gardé en mémoire. Ici, un abonnement que plus rien ne lit est fermé : au-delà de `max` (les moins récents
// d'abord), ou s'il n'a pas servi depuis `idleMs`. Ce que `keep` garde (listes chaudes, ce que la personne garde) et ce
// qu'un écran lit encore (écouteurs) ne sont jamais fermés.

/**
 * @param client  le client Convex (watchQuery)
 * @param opts    keep(id) : garder toujours ; max : abonnements libres gardés au plus ; idleMs : délai avant fermeture
 */
export function createWatcher(client, { keep = () => false, max = 20, idleMs = 60_000, now = () => Date.now() } = {}) {
  const entries = new Map(); // id -> { value, listeners: Set, stop, at, args }
  /**
   * L'abonnement `id` : { value, listeners, args } ; value vaut undefined tant qu'il charge. `args` null : l'entrée sans
   * abonnement (créée au besoin), en attente d'arguments (un laissez-passer, src/app/passes.js). Des arguments différents
   * de ceux de l'abonnement en cours le remplacent ; l'entrée, ses écouteurs et sa dernière valeur restent.
   * `onError(e, entry)` : vrai si l'erreur de la requête est prise en charge (la valeur reste celle d'avant).
   */
  function watch(fn, id, args, onError) {
    let entry = entries.get(id);
    if (!entry) {
      entry = { value: undefined, listeners: new Set(), stop: null, at: now(), args: null };
      entries.set(id, entry);
    }
    if (args && !(entry.args && JSON.stringify(entry.args) === JSON.stringify(args))) arm(entry, fn, args, onError);
    entry.at = now();
    return entry;
  }
  function arm(entry, fn, args, onError) {
    if (typeof entry.stop === 'function') entry.stop();
    entry.args = args;
    const query = client.watchQuery(fn, args);
    const read = () => {
      try {
        // Pendant un renouvellement de session, le serveur renvoie tout : on garde la valeur reçue
        // (sinon l'écran retomberait un instant sur un état vide).
        const value = query.localQueryResult();
        if (value !== undefined) entry.value = value;
      } catch (e) {
        if (onError && onError(e, entry)) return;
        entry.value = null; // erreur de la requête : l'écran montre son état vide
      }
      entry.listeners.forEach((f) => f());
    };
    entry.stop = query.onUpdate(read);
    read();
  }
  /** Ferme les abonnements libres : ni gardés, ni écoutés ; au-delà de `max` (les plus anciens), ou inutilisés depuis idleMs. */
  function sweep() {
    const free = [...entries].filter(([id, e]) => !keep(id) && e.listeners.size === 0).sort((a, b) => a[1].at - b[1].at);
    const over = free.length - max;
    free.forEach(([id, e], i) => {
      if (i < over || now() - e.at > idleMs) {
        if (typeof e.stop === 'function') e.stop();
        entries.delete(id);
      }
    });
  }
  return { watch, sweep, entries };
}
