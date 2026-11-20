// Ce qu'un compte peut ouvrir, et donc ce que l'app charge pour lui (sans DOM : testé par scripts/app.test.mjs).
// Sans abonnement (pro faux), l'aperçu (19/11) : Apps montre le top 3 (écran Apercu), les fiches et vidéos de ces 3 apps
// et le compte restent ouverts ; tout autre écran ouvre la fenêtre des formules.

export const HOME = '/app';
export const SIGN_OUT = '/app/deconnexion';
export const APERCU = '/app/apps';
const OPEN = [/^\/app\/apps$/, /^\/app\/apps\/[^/]+$/, /^\/app\/videos\/[^/]+$/, /^\/app\/compte$/];
export const isOpen = (pathname) => pathname === SIGN_OUT || pathname.startsWith('/app/payer/') || OPEN.some((re) => re.test(pathname));

/**
 * Audit F8 : le code de l'écran d'une adresse est-il utile ? Sans abonnement, Apps s'affiche en aperçu (Apercu) :
 * attendre le code d'Apps (~30 Ko gz) retardait l'aperçu pour rien.
 */
export const routeCodeNeeded = (routePath, { known, pro }) => !(known && !pro && routePath === APERCU);

/** Audit F8 : une adresse fermée sans abonnement attend de savoir qui est là avant de charger son code. */
export const mayLoadBeforeUser = (pathname) => isOpen(pathname) && pathname !== APERCU;

/** Audit F8 : les écrans à précharger. Sans abonnement : seulement ceux qu'il peut ouvrir (fiches, vidéos, compte). */
export const routesToWarm = (routes, pro) =>
  pro ? routes : routes.filter((r) => r.path !== APERCU && isOpen(r.path.replace(/:[a-z]+/g, 'x')));

/**
 * decodeURIComponent qui ne lève pas (audit Q31, 19/11) : /app/apps/%E0 levait URIError au chargement du module, avant le
 * montage, et laissait une page blanche. Une adresse illisible reste telle quelle (fiche introuvable, ou l'accueil).
 */
export const safeDecode = (s) => { try { return decodeURIComponent(s); } catch { return s; } };

/** Les routes compilées, puis l'adresse -> sa route, ses paramètres et la clé de ses données (null si aucune). */
export function routeMatcher(routes) {
  const compiled = routes.map((route) => {
    const names = [];
    const re = new RegExp(`^${route.path.replace(/:([a-z]+)/g, (_, n) => (names.push(n), '([^/]+)'))}$`);
    return { route, re, names };
  });
  return (path) => {
    for (const { route, re, names } of compiled) {
      const m = path.match(re);
      if (!m) continue;
      const params = Object.fromEntries(names.map((n, i) => [n, safeDecode(m[i + 1])]));
      const key = route.data ? route.data.replace(/\{([a-z]+)\}/g, (_, n) => params[n]) : null;
      return { route, params, key };
    }
    return null;
  };
}

/**
 * Audit F26 (19/11) : au clic, l'adresse changeait mais l'ancien écran restait, sans signe ni délai maximal (hors ligne,
 * pour toujours). Une fine barre de chargement paraît après 150 ms (CSS) ; au-delà de LOAD_TIMEOUT_MS, l'écran
 * « La connexion est perdue » propose de réessayer.
 */
export const LOAD_TIMEOUT_MS = 15_000;
export const loadingView = ({ loading, stalled, path, screenPath }) =>
  stalled && stalled === path ? 'stalled' : loading && loading === path && loading !== screenPath ? 'progress' : null;

/**
 * Audit F29 (19/11) : le top 3 de l'aperçu est recalculé par la synchro ; une fiche qui en sortait passait verrouillée en
 * pleine lecture, et l'écran éjectait vers Apps. On n'éjecte que si la fiche était déjà verrouillée à l'arrivée ; sinon
 * l'écran garde sa dernière valeur ouverte jusqu'à la navigation suivante.
 * arrival : { locked: verrouillée à l'arrivée, open: dernière valeur ouverte } (muté ici) ; value : la valeur actuelle.
 */
export function previewView(arrival, value) {
  const locked = !!(value && value.locked);
  if (!locked) { if (value) arrival.open = value; return { data: value, eject: false }; }
  if (arrival.locked) return { data: value, eject: true };
  return { data: arrival.open ?? value, eject: !arrival.open };
}
