/**
 * Un curseur de pagination rangé en base ne vaut que pour le déploiement qui l'a créé. Ceux recopiés de Jarvia au
 * déménagement du Radar (20/11/2026), `judgeCursor` et `rejudgeCursor`, faisaient échouer le jugement des comptes et le
 * rejugement des comptes en pause à chaque passage (« Failed to parse cursor ») : aucun compte n'était plus jugé.
 */
export function isBadCursor(e: unknown): boolean {
  return e instanceof Error && /failed to parse cursor/i.test(e.message);
}

/** Une page lue depuis un curseur rangé ; s'il est illisible, depuis le début (`restarted`). Toute autre erreur remonte. */
export async function fromStoredCursor<T>(cursor: string | null, page: (cursor: string | null) => Promise<T>): Promise<{ result: T; restarted: boolean }> {
  if (cursor === null) return { result: await page(null), restarted: false };
  try {
    return { result: await page(cursor), restarted: false };
  } catch (e) {
    if (!isBadCursor(e)) throw e;
    return { result: await page(null), restarted: true };
  }
}
