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
