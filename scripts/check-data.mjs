// Rend les écrans de l'app avec de vraies données, comme le routeur (src/app/main.js) les monte : les documents de la
// synchro (convex/radarModels.ts) passés par la vraie convex/boards.ts, pour un compte Pro et un compte gratuit, avec
// et sans suivis ni dossiers ; plus Réglages, Formules et le menu du compte avec des abonnements de la forme réelle.
// Audit Q9 (19/11) : npm run check rend chaque page sans données (h(Page, null)), donc l'exemple du canevas.
// Relève : écran qui plante ; « undefined », « NaN », « Infinity », « [object Object] », « null » dans le texte ; lien
// undefined/null/NaN ; lien interne vers une fiche qui n'existe pas (« Cette fiche n'est plus dans le Radar »).
// Usage : npm run check:data                          documents de banc (export inventé, scripts/radar-fixture.mjs)
//         REEL=~/dev/swarm-site/.bench-data npm run check:data    export et magasin réels (local, jamais en CI)
//         PAR=20 : fiches rendues par famille (défaut : toutes sur le banc, 12 sur le réel)
import { h } from 'preact';
import { renderToString } from 'preact-render-to-string';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { boardsOf, fixtureRaw, loadModels, realRaw, NOW } from './radar-fixture.mjs';
const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// ─── Les documents, et la vraie fonction boards.get ─────────────────────────────────────────────────────────────
const reel = process.env.REEL ? process.env.REEL.replace(/^~/, process.env.HOME) : null;
const models = await loadModels();
const docs = reel ? (() => { const { raw, store } = realRaw(reel); return boardsOf(models, raw, store); })() : boardsOf(models, fixtureRaw());
const PER = Number(process.env.PAR || (reel ? 12 : 1e9));

const STUBS = {
  'convex/values': 'export const v = new Proxy({}, { get: () => () => ({}) });',
  './session': 'export const liveUserId = async (ctx) => ctx.userId;',
  './_generated/server': 'const id = (d) => d; export const query = id;',
};
const dir = mkdtempSync(path.join(tmpdir(), 'check-data-'));
await require('esbuild').build({ entryPoints: [path.join(root, 'convex/boards.ts')], bundle: true, format: 'esm', platform: 'node', outfile: path.join(dir, 'boards.mjs'), logLevel: 'error',
  plugins: [{ name: 'stubs', setup(b) {
    b.onResolve({ filter: /.*/ }, (a) => (STUBS[a.path] !== undefined ? { path: a.path, namespace: 'stub' } : undefined));
    b.onLoad({ filter: /.*/, namespace: 'stub' }, (a) => ({ contents: STUBS[a.path], loader: 'js' }));
  } }] });
process.env.CONVEX_SITE_URL ??= 'https://banc.convex.site';
process.env.COVER_SECRET ??= 'secret-de-banc';
const { get } = await import(pathToFileURL(path.join(dir, 'boards.mjs')).href);
rmSync(dir, { recursive: true, force: true });
const USERS = { pro: { pro: true }, free: {} };
const db = { get: async (id) => USERS[id] ?? null, query: (table) => ({ withIndex: (_n, f) => {
  const c = {}; const q = { eq: (k, val) => ((c[k] = val), q) }; f(q);
  const row = table === 'boards' && docs.has(c.key) ? { key: c.key, data: docs.get(c.key) } : null;
  return { first: async () => row, collect: async () => [] };
} }) };
/** Ce que l'écran lit par get(clé) : demandé une première fois, puis servi au rendu suivant (get est synchrone). */
const board = (who) => { const cache = new Map(); return { cache, async load(keys) { for (const k of keys) if (!cache.has(k)) cache.set(k, await get.handler({ userId: who, db }, { key: k })); } }; };

// ─── Les écrans : les routes, et ce que le routeur monte ────────────────────────────────────────────────────────
const routes = [...readFileSync(path.join(root, 'src/app/routes.js'), 'utf8').matchAll(/path: '([^']+)', title: "[^"]*", data: (null|"[^"]*"), load: [^\n]*?import\('\.\/pages\/(\w+)\.js'\)[^\n]*?loadMobile: [^\n]*?import\('\.\/pages\/(\w+)\.js'\)/g)]
  .map(([, p, data, desk, mob]) => ({ path: p, data: data === 'null' ? null : JSON.parse(data), desk, mob }));
const page = async (n) => (await import(pathToFileURL(path.join(root, 'src/app/pages', n + '.js')).href)).default;
const APERCU = '/app/apps';
/** Les clés d'une route : la sienne, ou un échantillon de chaque fiche (app:, video:…) et ses paramètres. */
const keysOf = (r) => {
  if (!r.data) return [[null, {}]];
  const m = r.data.match(/^(\w+):\{(\w+)\}$/);
  if (!m) return [[r.data, {}]];
  return [...docs.keys()].filter((k) => k.startsWith(m[1] + ':') && k.split(':').length === 2).slice(0, PER).map((k) => [k, { [m[2]]: k.slice(m[1].length + 1) }]);
};
const top = docs.get('apps:top')?.apps ?? [];
const someVideo = [...docs.keys()].find((k) => k.startsWith('video:'))?.slice(6);
const merged = docs.get('apps:merged')?.merged ?? [];
const SAVED = {
  vide: {},
  rempli: {
    follows: { apps: [...top.map((a) => a.slug), ...merged.slice(0, 1).map(([from]) => from)], creators: [...docs.keys()].filter((k) => k.startsWith('creator:')).slice(0, 3).map((k) => k.slice(8)), formats: [...docs.keys()].filter((k) => k.startsWith('format:')).slice(0, 2).map((k) => k.slice(7)) },
    folders: [{ id: 'd1', name: 'À tester', createdAt: NOW - 864e5, items: [
      ...top.slice(0, 2).map((a, i) => ({ kind: 'app', id: a.slug, label: a.name, cover: null, at: NOW - i })),
      ...(someVideo ? [{ kind: 'video', id: someVideo, label: 'Une vidéo', cover: null, at: NOW }] : []),
    ] }],
    alertRules: [{ id: 'r1', createdAt: NOW - 864e5, quoi: 'video', niche: null, seuil: 10, marche: 'FR' }],
    seen: { alerts: NOW - 3 * 864e5 },
  },
};
const userOf = (pro) => ({ prenom: 'Léa', nom: 'Léa', email: 'lea@exemple.test', initiale: 'L', pro, emailVerified: true });

// ─── Les vérifications ──────────────────────────────────────────────────────────────────────────────────────────
const routeOf = (href) => {
  const p = href.split(/[?#]/)[0];
  for (const r of routes) {
    const re = new RegExp('^' + r.path.replace(/:(\w+)/g, '([^/]+)') + '$');
    const m = p.match(re);
    if (m) return { r, key: r.data ? r.data.replace(/\{\w+\}/, decodeURIComponent(m[1] ?? '')) : null };
  }
  return null;
};
const exists = (key) => docs.has(key) || (key.startsWith('app:') && merged.some(([from]) => `app:${from}` === key));
const problems = new Map();
const note = (kind, where, detail) => { if (!problems.has(kind)) problems.set(kind, []); problems.get(kind).push(`${where}${detail ? ' : ' + detail : ''}`); };
let renders = 0;
function inspect(where, html) {
  renders++;
  const text = html.replace(/<(style|script)[\s\S]*?<\/\1>/g, '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;|\s+/g, ' ');
  for (const w of ['undefined', 'NaN', 'Infinity', '[object Object]']) if (text.includes(w)) note(`« ${w} » dans le texte`, where, (text.match(new RegExp(`.{0,50}${w.replace(/[[\]]/g, '\\$&')}.{0,30}`)) || [''])[0].trim());
  if (/\bnull\b/.test(text)) note('« null » dans le texte', where, (text.match(/.{0,50}\bnull\b.{0,30}/) || [''])[0].trim());
  for (const [, attr, val] of html.matchAll(/\s(href|src)="([^"]*)"/g)) {
    if (/undefined|\bnull\b|NaN/.test(val.replace(/x-signature=[^&]*/g, ''))) note(`${attr} undefined/null/NaN`, where, val.slice(0, 80));
    if (attr === 'href' && val.startsWith('/app/')) {
      const r = routeOf(val);
      // Adresses que le routeur traite lui-même (src/app/main.js : SIGN_OUT, PAY).
      if (!r && (val === '/app/deconnexion' || /^\/app\/payer\/(mensuel|annuel)$/.test(val))) continue;
      if (!r) note('lien vers une adresse inconnue', where, val);
      else if (r.key && !exists(r.key)) note('lien vers une fiche absente', where, `${val} (${r.key})`);
    }
  }
}
async function show(where, Page, props) {
  try { inspect(where, renderToString(h(Page, props))); } catch (e) { renders++; note('écran qui plante', where, String(e?.message ?? e).slice(0, 140)); }
}

// ─── Les rendus ─────────────────────────────────────────────────────────────────────────────────────────────────
for (const who of ['pro', 'free']) {
  const user = userOf(who === 'pro');
  for (const [savedName, saved] of Object.entries(SAVED)) {
    const b = board(who);
    for (const r of routes) for (const mobile of [false, true]) for (const [key, params] of keysOf(r)) {
      const where = `${who} ${savedName} ${mobile ? 'mobile' : 'ordi'} ${r.path}${key ? ` ${key}` : ''}`;
      // Comme le routeur : on rend, on charge ce que l'écran a demandé, on rend à nouveau (3 tours au plus).
      let wanted = new Set(key ? [key, 'apps'] : ['apps']);
      for (let round = 0; round < 3; round++) {
        await b.load(wanted);
        const data = key ? b.cache.get(key) : undefined;
        if (data === null) break; // fiche absente : le routeur montre « Cette fiche n'est plus dans le Radar »
        const asked = new Set();
        const getFn = (k) => { asked.add(k); return b.cache.has(k) ? b.cache.get(k) : null; };
        let Page, props;
        if (who === 'free' && (r.path === APERCU || (data && data.locked))) {
          const apps = r.path === APERCU ? data : b.cache.get('apps');
          if (!apps || apps.locked) break;
          Page = await page(mobile ? 'MApercuApps' : 'Apercu');
          props = { user, data: apps, onPlans() {}, checkout: { mensuel: '/app/payer/mensuel', annuel: '/app/payer/annuel' } };
        } else {
          Page = await page(mobile ? r.mob : r.desk);
          props = { user, signOut() {}, onPlans() {}, params, query: {}, data, get: getFn, saved: (k) => saved[k] ?? null, save: async () => {} };
        }
        const fresh = [...asked].filter((k) => !b.cache.has(k));
        if (fresh.length && round < 2) { wanted = new Set(fresh); continue; }
        await show(where, Page, props);
        break;
      }
    }
  }
}
// Réglages, Formules, menu du compte : props de users.viewer, whop.mine, users.sessions (convex/users.ts, whop.ts).
{
  const Reglages = await page('Reglages');
  const subs = {
    actif: { formule: 'mensuel', status: 'active', active: true, price: '29.99', currency: 'eur', periodEnd: NOW + 10 * 864e5, cancelAtPeriodEnd: false, manageUrl: 'https://whop.com/x' },
    'annuel résilié': { formule: 'annuel', status: 'active', active: true, price: '179.88', currency: 'eur', periodEnd: NOW + 100 * 864e5, cancelAtPeriodEnd: true, manageUrl: null },
    'impayé sans prix': { formule: 'mensuel', status: 'past_due', active: true, price: null, currency: null, periodEnd: null, cancelAtPeriodEnd: false, manageUrl: null },
    expiré: { formule: 'mensuel', status: 'expired', active: false, price: '29.99', currency: 'eur', periodEnd: NOW - 864e5, cancelAtPeriodEnd: false, manageUrl: null },
  };
  const pays = [{ id: 'p1', total: '29.99', currency: 'eur', status: 'paid', at: NOW - 864e5 }, { id: 'p2', total: null, currency: null, status: 'refunded', at: NOW }];
  const total = docs.get('apps:top')?.total;
  for (const mobile of [false, true]) for (const section of ['profil', 'securite', 'abo']) {
    for (const [n, sub] of Object.entries(subs)) await show(`Réglages ${mobile ? 'mobile' : 'ordi'} ${section} Pro ${n}`, Reglages, { user: userOf(true), mobile, section, abo: { sub, payments: pays }, sessions: { since: NOW - 3e9, others: 2 }, checkout: {}, total, onClose() {} });
    await show(`Réglages ${mobile ? 'mobile' : 'ordi'} ${section} gratuit`, Reglages, { user: userOf(false), mobile, section, abo: { sub: null, payments: [] }, sessions: { since: null, others: 0 }, total, onClose() {} });
    await show(`Réglages ${mobile ? 'mobile' : 'ordi'} ${section} chargement`, Reglages, { user: userOf(true), mobile, section, abo: undefined, sessions: undefined, onClose() {} });
  }
  for (const n of ['Formules', 'MFormules']) await show(n, await page(n), { onClose() {}, checkout: { mensuel: '/app/payer/mensuel', annuel: '/app/payer/annuel' }, total });
  await show('MenuCompte gratuit', await page('MenuCompte'), { user: userOf(false), total, onClose() {}, onPlans() {}, onSettings() {} });
  await show('MenuCompte Pro', await page('MenuCompte'), { user: userOf(true), total, onClose() {}, onPlans() {}, onSettings() {} });
}

console.log(`${reel ? 'export réel' : 'export inventé'} : ${docs.size} pages, ${routes.length} routes, ${renders} rendus`);
for (const [kind, list] of problems) {
  console.log(`PROBLÈME ${kind} : ${list.length}`);
  for (const x of [...new Set(list)].slice(0, Number(process.env.EXEMPLES || 6))) console.log('    ' + x);
}
if (!problems.size) console.log('aucun problème');
process.exit(problems.size ? 1 : 0);
