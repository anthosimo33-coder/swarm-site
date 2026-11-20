// Ce que le Radar suit (convex/stats.ts), pour les chiffres des pages publiques : « plus de 190 apps, 4 900 comptes ».
// Arrondi vers le bas, pour que « plus de » reste vrai. Sans réponse (hors ligne, pas encore de synchronisation),
// les chiffres relevés le 14/11/2026.
//
// Audit Q46 (19/11) : le client HTTP de Convex (convex/browser, ~20 Ko, 7 Ko gz) partait sur la landing et les tarifs
// pour cette seule requête. L'API HTTP de Convex est appelée directement (POST /api/query, /api/mutation).

/**
 * Une fonction publique de convex/, par son chemin (« stats:get ») ; rend sa valeur, lève une erreur sinon. Les noms
 * sont vérifiés contre convex/ par scripts/sources.test.mjs (audit Q42).
 */
export async function convexHttp(kind, path, args = {}) {
  const res = await fetch(`${import.meta.env.VITE_CONVEX_URL}/api/${kind}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path, args, format: 'json' }),
  });
  const body = await res.json();
  if (!res.ok || body?.status !== 'success') throw new Error(body?.errorMessage ?? `Convex ${res.status}`);
  return body.value;
}

export const FALLBACK = { apps: 190, accounts: 4900 };

const down = (n, step) => Math.floor(n / step) * step;

export const roundStats = (s) =>
  s && typeof s.apps === 'number' && typeof s.accounts === 'number' && s.apps > 0 && s.accounts > 0
    ? { apps: s.apps >= 1000 ? down(s.apps, 100) : down(s.apps, 10), accounts: s.accounts >= 10000 ? down(s.accounts, 1000) : down(s.accounts, 100) }
    : FALLBACK;

export async function fetchStats() {
  try {
    return roundStats(await convexHttp('query', 'stats:get'));
  } catch {
    return FALLBACK;
  }
}

/**
 * Compte une visite du site public (admin › Mesure), une seule fois par onglet. Rien n'identifie la personne :
 * le serveur ajoute 1 au compteur de l'heure (convex/admin.ts, visit). Les navigateurs pilotés (tests) ne comptent pas.
 */
export function countVisit() {
  try {
    if (navigator.webdriver || sessionStorage.getItem('kc-visite')) return;
    sessionStorage.setItem('kc-visite', '1');
  } catch {
    return;
  }
  convexHttp('mutation', 'admin:visit').catch(() => {});
}
