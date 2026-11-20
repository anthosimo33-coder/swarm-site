/**
 * Tâches de fond coupées sur ce déploiement : la synchro du Radar et les lectures du quart d'heure (pays, carrousels,
 * lecture IA) ne font rien quand elles sont lancées par le planificateur. Réglé sur le dev (`SWARM_SYNC_OFF=1`) : le
 * 19/11, la même synchro y tournait pour rien et lisait 58 Go en 7 jours sur la facture Convex. Une synchro lancée à
 * la main passe quand même : `npx convex run radarSync:run '{"manual": true}'`.
 */
export const backgroundOff = (): boolean => process.env.SWARM_SYNC_OFF === "1";
