// Repris de Jarvia (convex/dateFr.ts) avec le Radar, le 20/11/2026 : jour et mois calendaires à Paris.
const PARIS_YMD = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris" });

/** Mois calendaire "YYYY-MM" en Europe/Paris. */
export function monthKeyParis(ts: number): string {
  return PARIS_YMD.format(new Date(ts)).slice(0, 7);
}

/** Jour calendaire "YYYY-MM-DD" en Europe/Paris. */
export function dayKeyParis(ts: number): string {
  return PARIS_YMD.format(new Date(ts));
}
