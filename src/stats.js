// Ce que le Radar suit (convex/stats.ts), pour les chiffres des pages publiques : « plus de 190 apps, 4 900 comptes ».
// Arrondi vers le bas, pour que « plus de » reste vrai. Sans réponse (hors ligne, pas encore de synchronisation),
// les chiffres relevés le 14/11/2026.
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api.js';

export const FALLBACK = { apps: 190, accounts: 4900 };

const down = (n, step) => Math.floor(n / step) * step;

export const roundStats = (s) =>
  s && typeof s.apps === 'number' && typeof s.accounts === 'number' && s.apps > 0 && s.accounts > 0
    ? { apps: s.apps >= 1000 ? down(s.apps, 100) : down(s.apps, 10), accounts: s.accounts >= 10000 ? down(s.accounts, 1000) : down(s.accounts, 100) }
    : FALLBACK;

export async function fetchStats() {
  try {
    return roundStats(await new ConvexHttpClient(import.meta.env.VITE_CONVEX_URL).query(api.stats.get, {}));
  } catch {
    return FALLBACK;
  }
}
