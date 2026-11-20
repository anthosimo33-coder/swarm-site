// Contrôles de cohérence entre le front et le backend, sur les sources.   Usage : npm run test:sources
// - Audit Q42 (19/11) : le front appelle le backend par anyApi, sans typage. Un nom mal écrit (api.whop.setCancle) ou une
//   fonction renommée passait tsc, check et le build, et n'échouait qu'au clic. Chaque api.<module>.<nom> de src/ doit
//   être une fonction publique exportée par convex/<module>.ts, et appelée comme ce qu'elle est (requête, mutation, action).
// - Audit Q50 (19/11) : la forme d'un id de vidéo et celle d'un pseudo ne s'écrivent qu'une fois, dans convex/coverSign.ts.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rel = (f) => path.relative(root, f);
const walk = (dir, keep) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  const f = path.join(dir, e.name);
  if (e.isDirectory()) return ['node_modules', '_generated', '.git'].includes(e.name) ? [] : walk(f, keep);
  return keep(f) ? [f] : [];
});
let fail = 0;
const ok = (cond, msg) => { console.log(`${cond ? 'OK   ' : 'ÉCHEC'} ${msg}`); if (!cond) fail++; };

// ─── Q42 : appels du front ──────────────────────────────────────────────────────────────────────────────────────
/** Les fonctions publiques de chaque module convex/ : nom → query | mutation | action. */
const exported = (mod) => {
  const f = path.join(root, 'convex', `${mod}.ts`);
  if (!fs.existsSync(f)) return null;
  const out = new Map();
  for (const m of fs.readFileSync(f, 'utf8').matchAll(/export\s+const\s+([A-Za-z_$][\w$]*)\s*=\s*(query|mutation|action)\s*\(/g)) out.set(m[1], m[2]);
  return out;
};
/** Ce que l'appel attend : la méthode du client ou le hook qui reçoit la référence. */
const KIND = { query: 'query', useQuery: 'query', watch: 'query', watchQuery: 'query', setQuery: 'query', usePaginatedQuery: 'query',
  mutation: 'mutation', useMutation: 'mutation', action: 'action', useAction: 'action' };
const calls = [];
for (const f of walk(path.join(root, 'src'), (x) => /\.(js|jsx|ts|tsx|mjs)$/.test(x) && !/src\/(app\/)?pages\//.test(x))) {
  const lines = fs.readFileSync(f, 'utf8').split('\n');
  lines.forEach((line, i) => {
    for (const m of line.matchAll(/(?:\b([A-Za-z_$][\w$]*)\s*\(\s*)?\bapi\.([A-Za-z_$][\w$]*)\.([A-Za-z_$][\w$]*)/g))
      calls.push({ where: `${rel(f)}:${i + 1}`, via: m[1] ?? null, mod: m[2], fn: m[3] });
  });
}
ok(calls.length >= 10, `${calls.length} appels du front au backend relevés`);
const bad = [];
for (const c of calls) {
  const fns = exported(c.mod);
  const kind = fns?.get(c.fn);
  if (!fns) bad.push(`${c.where} : api.${c.mod}.${c.fn}, aucun module convex/${c.mod}.ts`);
  else if (!kind) bad.push(`${c.where} : api.${c.mod}.${c.fn}, convex/${c.mod}.ts n'exporte aucune fonction publique « ${c.fn} »`);
  else if (c.via && KIND[c.via] && KIND[c.via] !== kind) bad.push(`${c.where} : api.${c.mod}.${c.fn} est une ${kind}, appelée par ${c.via}()`);
}
ok(!bad.length, `chaque api.<module>.<nom> du front existe et est appelé comme ce qu'il est${bad.length ? ' :\n      ' + bad.join('\n      ') : ''}`);

// ─── Q50 : formes d'id et de pseudo écrites une fois ────────────────────────────────────────────────────────────
const HOME = 'convex/coverSign.ts';
// Reste à faire avec la branche des constats hauts (fichier qu'elle modifie) : radarSync.ts (coverUrl de boardOpts).
const PENDING = new Set(['convex/radarSync.ts']);
const copies = [];
for (const f of walk(root, (x) => /\.(ts|js|mjs)$/.test(x) && !/(^|\/)(dist|\.bench-data|\.claude)\//.test(rel(x)))) {
  const r = rel(f);
  if (r === HOME || r === 'scripts/sources.test.mjs' || PENDING.has(r)) continue;
  const s = fs.readFileSync(f, 'utf8');
  if (/\\d\{6,25\}/.test(s)) copies.push(`${r} (id de vidéo)`);
  if (/A-Za-z0-9\._\]\{2,30\}/.test(s)) copies.push(`${r} (pseudo)`);
}
ok(!copies.length, `formes d'id de vidéo et de pseudo écrites seulement dans ${HOME}${copies.length ? ` ; copies : ${copies.join(', ')}` : ''}`);

console.log(fail ? `${fail} échec(s)` : 'tout passe');
process.exit(fail ? 1 : 0);
