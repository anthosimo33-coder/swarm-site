// Les deux dernières fiches ouvertes depuis la recherche (maquette 9B, validée le 24/11).
//
// La fenêtre de recherche (Palette, MPalette) annonce chaque fiche qu'on y ouvre par un évènement `kopycat:opened`
// ({ kind: 'app' | 'creator' | 'format', id }) ; ce module la range en tête de la clé `recent` des préférences du compte
// (convex/saved.ts), sans doublon, et n'en garde que deux. La fenêtre les relit par `get('saved:recent')` et les montre,
// avec leurs chiffres du jour, sous « Ouverts récemment ». Gardées sur le compte : les mêmes sur ordinateur et au
// téléphone. Le routeur (src/app/main.js) branche la lecture et l'écriture par connectRecent.

export const RECENT_MAX = 2;
const KINDS = new Set(['app', 'creator', 'format']);

/** La liste après l'ouverture de `item` : en tête, sans son ancienne place, deux au plus. Fonction pure (banc). */
export function pushRecent(list, item, at) {
  if (!item || !KINDS.has(item.kind) || typeof item.id !== 'string' || !item.id || item.id.length > 200) return null;
  const prev = Array.isArray(list) ? list.filter((x) => x && !(x.kind === item.kind && x.id === item.id)) : [];
  return [{ kind: item.kind, id: item.id, at }].concat(prev).slice(0, RECENT_MAX);
}

let io = null;
/** read() : la valeur gardée (undefined tant qu'elle charge, null si aucune) ; write(valeur) : l'enregistre. */
export function connectRecent(x) { io = x; }

if (typeof window !== 'undefined') {
  window.addEventListener('kopycat:opened', (e) => {
    if (!io) return;
    const cur = io.read();
    if (cur === undefined) return; // pas encore chargée : ne pas écraser la liste du compte par une seule fiche
    const next = pushRecent(cur, e.detail, Date.now());
    if (next) io.write(next);
  });
}
