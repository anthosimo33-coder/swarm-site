/**
 * Tâches de fond coupées sur ce déploiement : la synchro du Radar et les lectures du quart d'heure (pays, carrousels,
 * lecture IA) ne font rien quand elles sont lancées par le planificateur. Réglé sur le dev (`SWARM_SYNC_OFF=1`) : le
 * 19/11, la même synchro y tournait pour rien et lisait 58 Go en 7 jours sur la facture Convex. Une synchro lancée à
 * la main passe quand même : `npx convex run radarSync:run '{"manual": true}'`.
 */
export const backgroundOff = (): boolean => process.env.SWARM_SYNC_OFF === "1";

/**
 * Le bail des lectures de pages TikTok (audit F24, 19/11), pris par convex/radarStore.ts takeLease : copie des miniatures
 * (4 pages à la fois, en priorité), pays et carrousels (2 chacun) le partagent, une chaîne à la fois. Avant, chacune avait
 * son propre goulot et elles partaient ensemble à la fin de la synchro : jusqu'à 12 pages TikTok à la fois depuis les
 * mêmes serveurs, alors que les refus passagers commencent vers 6 (16/11). La lecture des pays n'avait même pas de bail
 * et tournait pendant les synchros.
 */
export const TIKTOK_LEASE = "tiktok-pages";
