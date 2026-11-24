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
  // getConvexSize : le vrai, celui que Convex applique (audit Q39).
  'convex/values': `export const v = new Proxy({}, { get: () => () => ({}) }); export class ConvexError extends Error {}
    export { getConvexSize } from ${JSON.stringify(path.join(root, 'node_modules/convex/dist/esm/values/size.js'))};`,
  './session': 'export const liveUserId = async (ctx) => ctx.userId;',
  './_generated/server': 'const id = (d) => d; export const query = id, mutation = id, internalQuery = id, internalMutation = id;',
};
const dir = mkdtempSync(path.join(tmpdir(), 'saved-'));
const out = path.join(dir, 'saved.mjs');
await build({ entryPoints: [entry], bundle: true, format: 'esm', platform: 'node', outfile: out, logLevel: 'error',
  plugins: [{ name: 'stubs', setup(b) {
    b.onResolve({ filter: /.*/ }, (a) => (STUBS[a.path] !== undefined ? { path: a.path, namespace: 'stub' } : undefined));
    b.onLoad({ filter: /.*/, namespace: 'stub' }, (a) => ({ contents: STUBS[a.path], loader: 'js', resolveDir: root }));
  } }] });
const { get, set } = await import(pathToFileURL(out).href);
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
// ─── saved.set (audit Q39, S27) ───────────────────────────────────────────────────────────────────────────────
const writeDb = (users = { u: { email: 'a@b.c' } }) => {
  const tables = { saved: [], authLimits: [] };
  let next = 1;
  return { rows: tables.saved, tables, get: async (id) => users[id] ?? null,
    query: (t) => ({ withIndex: (_n, f) => { const c = {}; const q = { eq: (k, val) => ((c[k] = val), q) }; f(q);
      return { first: async () => (tables[t] ??= []).find((r) => Object.entries(c).every(([k, val]) => r[k] === val)) ?? null }; } }),
    insert: async (t, doc) => { const _id = `${t}|${next++}`; (tables[t] ??= []).push({ _id, ...doc }); return _id; },
    patch: async (id, p) => { for (const rows of Object.values(tables)) { const r = rows.find((x) => x._id === id); if (r) Object.assign(r, p); } } };
};
const put = async (key, value, { userId = 'u', users } = {}) => {
  const base = writeDb(users);
  try { await set.handler({ userId, db: base }, { key, value }); return { ok: true, rows: base.rows }; } catch (e) { return { ok: false, err: String(e.message ?? e), rows: base.rows }; }
};
for (const [k, val] of Object.entries({ ...VALUES, seen: { alerts: 1794780000000 }, follows: { apps: ['a'] } })) {
  const r = await put(k, val);
  ok(r.ok && r.rows.length === 1, `écriture acceptée : ${k} réaliste${r.ok ? '' : ` (${r.err})`}`);
}
// 85 000 caractères chinois dans un libellé : 85 Ko de JSON, mais 255 Ko pour Convex → plus de 256 000 octets avec le reste.
const cjk = [{ id: 'd', name: 'x', createdAt: 1, items: Array.from({ length: 10 }, (_, i) => ({ kind: 'video', id: String(i), label: '漢'.repeat(9_000), cover: null, at: 1 })) }];
ok(JSON.stringify(cjk).length < 256_000, `contre-épreuve : JSON de ${JSON.stringify(cjk).length} caractères, sous l'ancienne borne`);
{ const r = await put('folders', cjk); ok(!r.ok && /TROP_LOURD/.test(r.err) && !r.rows.length, `taille comptée comme Convex : ${r.ok ? 'acceptée' : r.err}`); }
for (const [k, val, why] of [
  ['follows', { apps: [{ deep: [1, 2, 3] }] }, 'un suivi qui n\'est pas un texte'],
  ['follows', { autre: 'x' }, 'un champ inconnu dans les suivis'],
  ['folders', [{ id: 'd', name: 'x', createdAt: 1, items: [{ kind: 'app', id: 'a', label: 'A', cover: null, at: 1, extra: { a: { b: 1 } } }] }], 'une arborescence dans un élément de dossier'],
  ['folders', { id: 'd' }, 'des dossiers qui ne sont pas une liste'],
  ['alertRules', [{ id: 'r', quoi: 'video', filtre: { pays: ['FR'] } }], 'une arborescence dans une alerte'],
  ['seen', { alerts: [1, 2] }, 'un « lu » qui n\'est pas une date'],
  ['seen', null, 'null'],
  ['views', [{ id: 'v', screen: 'createurs', name: 'x', q: 'niche=Foi', at: 1, filtres: { niche: ['Foi'] } }], 'une arborescence dans une vue enregistrée'],
  ['views', [{ id: 'v', screen: 'createurs', name: 'x', at: 1 }], 'une vue sans sa requête'],
]) { const r = await put(k, val); ok(!r.ok && /FORME_INVALIDE/.test(r.err) && !r.rows.length, `forme refusée : ${why} (${r.ok ? 'acceptée' : r.err})`); }
{ const r = await put('views', [{ id: 'v1', screen: 'createurs', name: 'Études · France', q: 'niche=%C3%89tudes&m=FR', at: 1 }]); ok(r.ok, `vue enregistrée (maquette D2) : acceptée${r.ok ? '' : ` (${r.err})`}`); }
// Historique de recherche (maquette 9B, 24/11) : deux fiches ouvertes au plus, de trois sortes.
{ const r = await put('recent', [{ kind: 'app', id: 'diane-ai', at: 2 }, { kind: 'creator', id: 'fantine.diane', at: 1 }]); ok(r.ok, `ouverts récemment (9B) : acceptés${r.ok ? '' : ` (${r.err})`}`); }
for (const [val, why] of [
  [[{ kind: 'app', id: 'a', at: 3 }, { kind: 'app', id: 'b', at: 2 }, { kind: 'app', id: 'c', at: 1 }], 'trois fiches au lieu de deux'],
  [[{ kind: 'video', id: 'v', at: 1 }], 'une sorte inconnue'],
  [[{ kind: 'app', id: 'a', at: 1, label: 'Diane' }], 'un champ de plus'],
]) { const r = await put('recent', val); ok(!r.ok && /FORME_INVALIDE/.test(r.err), `ouverts récemment refusés : ${why} (${r.ok ? 'acceptés' : r.err})`); }
{ const read = Array.from({ length: 60 }, (_, i) => (0xFFFFFFFF - i).toString(36)).join(' '); const r = await put('seen', { alerts: 1794780000000, alertsRead: read }); ok(r.ok, `« lu » des 60 alertes ouvertes, empreintes les plus longues (seen.alertsRead, ${read.length} caractères) : accepté${r.ok ? '' : ` (${r.err})`}`); }
{ const r = await put('alertRules', [{ id: 'r', createdAt: 1, quoi: 'video', niche: null, seuil: 1e6, marche: 'FR', langue: 'es' }]); ok(r.ok, `alerte avec un champ simple de plus : acceptée${r.ok ? '' : ` (${r.err})`}`); }
{ const r = await put('follows', VALUES.follows, { users: {} }); ok(!r.ok && /NON_CONNECTE/.test(r.err) && !r.rows.length, `compte supprimé, session encore ouverte : rien n'est réinséré (audit S27 ; ${r.ok ? 'écrit' : r.err})`); }

// Audit Q39 : un compte ne peut pas écrire sans fin.
{
  const base = writeDb();
  let refused = 0;
  for (let i = 1; i <= 400 && !refused; i++) {
    try { await set.handler({ userId: 'u', db: base }, { key: 'seen', value: { alerts: i } }); } catch (e) { if (/TROP_DE_REQUETES/.test(String(e.message ?? e))) refused = i; }
  }
  ok(refused > 250 && refused <= 301, `écritures limitées par compte (refus au ${refused || '?'}e appel en 10 min)`);
  const realNow = Date.now; Date.now = () => realNow() + 11 * 60_000;
  let after = true; try { await set.handler({ userId: 'u', db: base }, { key: 'seen', value: { alerts: 1 } }); } catch { after = false; }
  Date.now = realNow;
  ok(after, '11 min plus tard, l\'écriture repasse');
}

console.log(fail ? `${fail} échec(s)` : 'tout passe');
process.exit(fail ? 1 : 0);
