/**
 * Cadence de la synchro de nuit (convex/radarSync.ts, `run`) : une nuit sur deux depuis le 21/11/2026 (décision du
 * fondateur, coût Convex). Le cron reste quotidien à 1 h 30 UTC ; c'est `run` qui saute une nuit sur deux.
 *
 * Nuits de synchro : celles dont le jour UTC, compté depuis le 01/01/1970, est impair (le 22/11/2026 en est une). Le
 * compte ne repart pas à chaque mois : l'alternance tient aux fins de mois. Une nuit paire passe quand même si le dernier
 * passage réussi date de plus de RATTRAPAGE_MS (la nuit impaire a échoué ou n'a pas tourné) : jamais deux nuits de suite
 * sans données neuves par accident. Une synchro lancée à la main (`manual`) passe toujours.
 */

const DAY_MS = 86_400_000;
/** Au-delà, le dernier passage réussi est celui d'avant-hier : la nuit d'hier a manqué. */
export const RATTRAPAGE_MS = 30 * 3_600_000;

export function nuitDeSynchro(now: number, dernierOk: number | null): boolean {
  if (Math.floor(now / DAY_MS) % 2 === 1) return true;
  return dernierOk === null || now - dernierOk > RATTRAPAGE_MS;
}
