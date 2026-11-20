// saved.get (convex/saved.ts), audit Q25 : une app suivie ou gardée dans un dossier sous l'ancien slug d'une app
// fusionnée revient sous celui de l'app qui l'a reprise. La vraie requête, empaquetée par esbuild, sur une base simulée.
// Usage : npm run test:saved   [autre saved.ts]
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
const require = createRequire(import.meta.url);
const { build } = require('esbuild');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const entry = path.resolve(process.argv[2] || path.join(root, 'convex/saved.ts'));
const STUBS = {
  'convex/values': 'export const v = new Proxy({}, { get: () => () => ({}) }); export class ConvexError extends Error {}',
  './session': 'export const liveUserId = async (ctx) => ctx.userId;',
  './_generated/server': 'const id = (d) => d; export const query = id, mutation = id;',
};
const dir = mkdtempSync(path.join(tmpdir(), 'saved-'));
const out = path.join(dir, 'saved.mjs');
await build({ entryPoints: [entry], bundle: true, format: 'esm', platform: 'node', outfile: out, logLevel: 'error',
  plugins: [{ name: 'stubs', setup(b) {
    b.onResolve({ filter: /.*/ }, (a) => (STUBS[a.path] !== undefined ? { path: a.path, namespace: 'stub' } : undefined));
    b.onLoad({ filter: /.*/, namespace: 'stub' }, (a) => ({ contents: STUBS[a.path], loader: 'js' }));
  } }] });
const { get } = await import(pathToFileURL(out).href);
rmSync(dir, { recursive: true, force: true });

const VALUES = {
  follows: { apps: ['vocaa', 'astraai', 'vocaai', 'inconnue'], creators: ['x'], formats: ['f'] },
  folders: [
    { id: 'd1', name: 'Langues', createdAt: 1, items: [{ kind: 'app', id: 'vocaa', label: 'Voca', cover: null, at: 1 }, { kind: 'video', id: '123', label: 'v', cover: null, at: 2 }] },
    { id: 'd2', name: 'Doublon', createdAt: 1, items: [{ kind: 'app', id: 'vocaai', label: 'Voca AI', cover: null, at: 1 }, { kind: 'app', id: 'vocaa', label: 'Voca', cover: null, at: 2 }] },
    { id: 'd3', name: 'Rien à changer', createdAt: 1, items: [{ kind: 'creator', id: 'vocaa', label: '@vocaa', cover: null, at: 1 }] },
  ],
  alertRules: [{ id: 'r', createdAt: 1, quoi: 'video', niche: null, seuil: 3, marche: null }],
};
const db = (withMap) => {
  const reads = [];
  return { reads, query: (table) => ({ withIndex: (_n, f) => {
    const c = {}; const q = { eq: (k, val) => ((c[k] = val), q) }; f(q); reads.push(`${table}[${c.key}]`);
    return { first: async () => (table === 'saved' ? (VALUES[c.key] !== undefined ? { value: VALUES[c.key] } : null)
      : table === 'boards' && c.key === 'apps:merged' && withMap ? { key: 'apps:merged', data: { merged: [['vocaa', 'vocaai'], ['whatbrandonthink', 'whatbrandonthinks']] } } : null) };
  } }) };
};
let fail = 0;
const ok = (cond, msg) => { console.log((cond ? 'OK   ' : 'ÉCHEC') + ' ' + msg); if (!cond) fail++; };
const g = async (key, withMap = true) => { const base = db(withMap); const r = await get.handler({ userId: 'u', db: base }, { key }); return [r, base.reads]; };

const [fw] = await g('follows');
ok(JSON.stringify(fw?.apps) === JSON.stringify(['vocaai', 'astraai', 'inconnue']), `suivis : ancien slug remplacé, doublon retiré (${JSON.stringify(fw?.apps)})`);
ok(JSON.stringify(fw?.creators) === '["x"]' && JSON.stringify(fw?.formats) === '["f"]', 'suivis : créateurs et formats intacts');
const [fd] = await g('folders');
ok(fd?.[0]?.items?.[0]?.id === 'vocaai' && fd[0].items[0].label === 'Voca' && fd[0].items[1].id === '123', `dossier : l'app fusionnée mène à la nouvelle (${fd?.[0]?.items?.map((i) => i.id)})`);
ok(fd?.[1]?.items?.length === 1 && fd[1].items[0].id === 'vocaai', `dossier : gardée deux fois → une seule (${fd?.[1]?.items?.map((i) => i.id)})`);
ok(fd?.[2]?.items?.[0]?.id === 'vocaa', 'dossier : un créateur au même nom n\'est pas touché');
const [ar, arReads] = await g('alertRules');
ok(JSON.stringify(ar) === JSON.stringify(VALUES.alertRules) && !arReads.some((r) => r.startsWith('boards')), `alertes : intactes, sans lire les apps (${arReads.join(' ')})`);
const [plain] = await g('follows', false);
ok(JSON.stringify(plain) === JSON.stringify(VALUES.follows), 'sans correspondance : la valeur rangée telle quelle');
ok((await get.handler({ userId: null, db: db(true) }, { key: 'follows' })) === null, 'pas connecté : rien');
console.log(fail ? `${fail} échec(s)` : 'tout passe');
process.exit(fail ? 1 : 0);
