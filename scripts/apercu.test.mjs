// Contre-épreuve du verrou de convex/boards.ts : la vraie fonction get, sur une base simulée.
// Usage : npm run test:apercu   (ou node scripts/apercu.test.mjs <autre boards.ts>, pour la contre-épreuve)
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { transformSync } = require('esbuild');
const src = readFileSync(process.argv[2] || new URL('../convex/boards.ts', import.meta.url), 'utf8')
  .replace(/^import .*$/gm, '')
  .replace(/export const /g, 'const ').replace(/export async function /g, 'async function ');
const js = transformSync(src, { loader: 'ts' }).code;
const mod = new Function('query', 'getAuthUserId', 'v', 'process', js + '\nreturn { get };');
const v = new Proxy({}, { get: () => () => ({}) });
const { get } = mod((def) => def, async (ctx) => ctx.userId, v, { env: {} });

const apps = Array.from({ length: 10 }, (_, i) => ({ slug: 'a' + i, name: 'App ' + i, views30: 1000 - i }));
const rows = {
  apps: { apps, markets: [], niches: [] },
  'app:a1': { slug: 'a1', name: 'App 1' }, 'app:a7': { slug: 'a7', name: 'App 7' },
  'video:111': { id: '111', app: { slug: 'a2' } }, 'video:999': { id: '999', app: { slug: 'a8' } },
  home: { apps: apps.slice(0, 4) }, formats: { formats: [1, 2] }, 'creators:FR': { creators: [1] },
  search: { apps: apps.map((a) => ({ slug: a.slug, name: a.name })), creators: [{ handle: 'x' }], formats: [{ id: 'f' }] },
  stats: { apps: 10 },
};
const users = { pro: { pro: true }, free: {}, nul: { pro: false } };
const ctx = (userId) => ({ userId, db: {
  get: async (id) => users[id] ?? null,
  query: (table) => ({ withIndex: (_i, f) => { let key; f({ eq: (_k, val) => { key = val; return {}; } });
    return { first: async () => (table === 'boards' ? (rows[key] ? { key, data: rows[key] } : null) : table === 'hidden' ? null : null), collect: async () => [] }; },
    first: async () => null }) } });

let fail = 0;
const ok = (cond, msg) => { console.log((cond ? 'OK   ' : 'ÉCHEC') + ' ' + msg); if (!cond) fail++; };
const g = (u, key) => get.handler(ctx(u), { key });
ok((await g('pro', 'apps')).apps.length === 10, 'Pro : les 10 apps');
ok((await g('pro', 'app:a7'))?.slug === 'a7', 'Pro : fiche hors top 3 ouverte');
ok((await g('pro', 'formats'))?.formats?.length === 2, 'Pro : Formats ouvert');
for (const u of ['free', 'nul']) {
  const a = await g(u, 'apps');
  ok(a.apps.length === 3 && a.apps.map((x) => x.slug).join() === 'a0,a1,a2', `${u} : apps = top 3 (${a.apps.length})`);
  ok(a.total === 10, `${u} : total = 10 apps suivies`);
  ok((await g(u, 'app:a1'))?.slug === 'a1', `${u} : fiche du top 3 ouverte`);
  ok((await g(u, 'app:a7'))?.locked === true, `${u} : fiche hors top 3 verrouillée`);
  ok((await g(u, 'video:111'))?.id === '111', `${u} : vidéo d'une app du top 3 ouverte`);
  ok((await g(u, 'video:999'))?.locked === true, `${u} : vidéo hors top 3 verrouillée`);
  for (const k of ['home', 'formats', 'creators:FR']) ok((await g(u, k))?.locked === true, `${u} : ${k} verrouillé`);
  const s = await g(u, 'search');
  ok(s.apps.length === 3 && s.creators.length === 0 && s.formats.length === 0, `${u} : recherche réduite au top 3`);
  ok((await g(u, 'stats'))?.apps === 10, `${u} : chiffres publics ouverts`);
  ok((await g(u, 'app:zz')) === null || (await g(u, 'app:zz'))?.locked === true, `${u} : fiche inconnue jamais servie`);
}
ok((await g(null, 'apps')) === null, 'pas connecté : rien');
console.log(fail ? `${fail} échec(s)` : 'tout passe');
process.exit(fail ? 1 : 0);
