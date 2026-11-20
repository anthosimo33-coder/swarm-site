// Contre-épreuve du verrou de convex/boards.ts : la vraie fonction get, empaquetée par esbuild (Convex remplacé par des
// doublures), sur une base simulée (boards, boardParts, mediaMiss, hidden, users).
// Usage : npm run test:apercu   (ou node scripts/apercu.test.mjs <autre boards.ts>, pour la contre-épreuve)
// Audit Q4 (19/11) : l'ancienne version laissait passer 9 modifications cassées sur 14. Chaque réponse faite à un compte
// gratuit est maintenant fouillée en entier (aucune app hors du top 3, nulle part), chaque clé des écrans et du
// préchauffage est essayée, et les vidéos masquées, les pages en morceaux et la réécriture des miniatures sont vérifiées.
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
const require = createRequire(import.meta.url);
const { build } = require('esbuild');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const entry = path.resolve(process.argv[2] || path.join(root, 'convex/boards.ts'));

// ─── La vraie fonction get, Convex remplacé ─────────────────────────────────────────────────────────────────────
const STUBS = {
  'convex/values': 'export const v = new Proxy({}, { get: () => () => ({}) }); export class ConvexError extends Error {}',
  './session': 'export const liveUserId = async (ctx) => ctx.userId;',
  './_generated/server': 'const id = (d) => d; export const query = id, internalQuery = id, mutation = id, internalMutation = id, action = id, internalAction = id, httpAction = id;',
  './_generated/api': 'const p = new Proxy({}, { get: (_t, k) => (k === "then" ? undefined : p) }); export const internal = p, api = p;',
};
const dir = mkdtempSync(path.join(tmpdir(), 'apercu-'));
const out = path.join(dir, 'boards.mjs');
await build({
  entryPoints: [entry], bundle: true, format: 'esm', platform: 'node', outfile: out, logLevel: 'error',
  plugins: [{ name: 'convex-stubs', setup(b) {
    b.onResolve({ filter: /.*/ }, (a) => {
      if (STUBS[a.path] !== undefined) return { path: a.path, namespace: 'stub' };
      // Une copie cassée (contre-épreuve) importe ses voisins de convex/ : on les prend dans le dépôt.
      if (a.path.startsWith('./') && a.importer && path.dirname(a.importer) !== path.join(root, 'convex')) return { path: path.join(root, 'convex', a.path + '.ts') };
      return undefined;
    });
    b.onLoad({ filter: /.*/, namespace: 'stub' }, (a) => ({ contents: STUBS[a.path], loader: 'js' }));
  } }],
});
const SITE = 'https://x.convex.site';
process.env.CONVEX_SITE_URL = SITE;
const { get } = await import(pathToFileURL(out).href);
rmSync(dir, { recursive: true, force: true });

// ─── Les données ────────────────────────────────────────────────────────────────────────────────────────────────
// 10 apps « zz-app-0 » à « zz-app-9 », classées par vues : seules les 3 premières sont ouvertes sans abonnement. Les
// autres (slug et nom) ne doivent apparaître dans AUCUNE réponse faite à un compte gratuit.
const slug = (i) => `zz-app-${i}`, name = (i) => `Nom secret ${i}`;
// Vidéo notée introuvable (mediaMiss, et dans la liste globale hidden). Audit F14 : boards.get ne lit plus hidden ;
// seule la fiche de la vidéo est absente, les listes sont filtrées par la synchro.
const HIDDEN_VIDEO = '2229999999';
const card = (id, i) => ({ id, platform: 'tiktok', handle: `auteur${i}`, app: slug(i), views: 10, cover: 'https://tiktok.example/signee.jpg' });
const appRow = (i) => ({ slug: slug(i), name: name(i), niche: i % 2 ? 'Foi' : 'Études', icon: null, views30: 1000 - i, accounts: 3,
  top: [card(`22200000${i}0`, i), ...(i === 0 ? [card(HIDDEN_VIDEO, 0)] : [])] });
const apps = Array.from({ length: 10 }, (_, i) => appRow(i));
const creator = (h, i) => ({ handle: h, fans: 1000, median: 500, app: { slug: slug(i), name: name(i) }, best: [card(`33300000${i}0`, i)] });
const DOCS = {
  // `extra` : un champ du document complet qui n'a rien à faire dans l'aperçu.
  apps: { updatedAt: 1, markets: [['FR', 'France', 12]], niches: ['Foi', 'Études'], apps, marketApps: [['FR', 10]], extra: [name(5)] },
  'app:zz-app-1': { slug: slug(1), name: name(1), videos: [card('2220000010', 1), card(HIDDEN_VIDEO, 1)] },
  'app:zz-app-7': { slug: slug(7), name: name(7), videos: [card('2220000070', 7)] },
  'video:2220000020': { id: '2220000020', handle: 'auteur2', fans: 10, cover: 'https://tiktok.example/x.jpg', app: { slug: slug(2), name: name(2) } },
  [`video:${HIDDEN_VIDEO}`]: { id: HIDDEN_VIDEO, cover: 'x', app: { slug: slug(1), name: name(1) } },
  'video:9990000080': { id: '9990000080', cover: 'x', app: { slug: slug(8), name: name(8) } },
  home: { apps: apps.slice(0, 4), videos: [card('2220000040', 4)] },
  formats: { formats: [{ id: 'f1', label: 'format', apps: [{ slug: slug(5), name: name(5) }] }] },
  'format:f1': { id: 'f1', apps: [{ slug: slug(5), name: name(5) }], members: [] },
  'creators:FR': { creators: [creator('createur.fr', 6)] }, 'creators:FR:2': { creators: [creator('createur.deux', 6)] },
  'creators:ALL': { creators: [creator('createur.all', 6)] },
  'creator:createur.fr': creator('createur.fr', 6),
  alerts: { videos: [card('2220000090', 9)], formats: [] },
  'apps:FR': { apps: apps.slice(3) }, 'apps@instagram': { apps: apps.slice(3) }, 'apps:FR@tiktok': { apps: apps.slice(3) },
  search: { apps: apps.map((a) => ({ slug: a.slug, name: a.name, icon: null, niche: a.niche, views30: a.views30 })), creators: [{ handle: 'x', app: name(5) }], formats: [{ id: 'f1', label: name(5) }] },
  'search:creators:2': { creators: [{ handle: 'y', app: name(6) }] },
  stats: { apps: 10, accounts: 25 },
};
// Le petit document de l'aperçu, tel que convex/radarModels.ts l'écrit (audit F1).
DOCS['apps:top'] = { updatedAt: 1, markets: DOCS.apps.markets, niches: DOCS.apps.niches, marketApps: DOCS.apps.marketApps, apps: apps.slice(0, 3), total: 10 };
const USERS = { pro: { pro: true }, free: {}, nul: { pro: false } };

/**
 * Base simulée. `parts` : clés rangées en morceaux de texte (boardParts), comme les grosses pages de prod ; `missing`
 * : clés en morceaux dont un morceau manque (page en cours de réécriture).
 */
function db({ parts = new Set(), missing = new Set(), without = new Set() } = {}) {
  const tables = { boards: [], boardParts: [], hidden: [{ ids: [HIDDEN_VIDEO], at: 1 }], mediaMiss: [{ key: `v:${HIDDEN_VIDEO}`, at: 1 }], users: [] };
  const reads = [];
  for (const [key, data] of Object.entries(DOCS)) {
    if (without.has(key)) continue;
    if (!parts.has(key)) { tables.boards.push({ key, data, hash: 'h', updatedAt: 1 }); continue; }
    const text = JSON.stringify(data), n = 3, size = Math.ceil(text.length / n);
    tables.boards.push({ key, data: null, hash: 'h', updatedAt: 1, parts: n });
    for (let i = 0; i < n; i++) if (!(missing.has(key) && i === 1)) tables.boardParts.push({ key, i, text: text.slice(i * size, (i + 1) * size) });
  }
  const run = (rows) => ({ first: async () => rows[0] ?? null, unique: async () => rows[0] ?? null, collect: async () => rows, take: async (n) => rows.slice(0, n) });
  return {
    reads,
    get: async (id) => USERS[id] ?? null,
    query: (table) => ({
      withIndex: (_name, f) => {
        const conds = [];
        const q = { eq: (field, val) => (conds.push([field, val]), q) };
        if (f) f(q);
        reads.push(`${table}${conds.length ? '[' + conds.map((c) => c[1]).join(',') + ']' : ''}`);
        return run((tables[table] ?? []).filter((r) => conds.every(([k, val]) => r[k] === val)).sort((p, q2) => (p.i ?? 0) - (q2.i ?? 0)));
      },
      ...Object.fromEntries(Object.entries(run(tables[table] ?? [])).map(([k, f]) => [k, (...a) => (reads.push(table), f(...a))])),
    }),
  };
}

let fail = 0;
const ok = (cond, msg) => { console.log((cond ? 'OK   ' : 'ÉCHEC') + ' ' + msg); if (!cond) fail++; };
const call = async (base, u, key) => {
  try { return await get.handler({ userId: u, db: base }, { key }); } catch (e) { return { __error: String(e).slice(0, 120) }; }
};
/** Ce que l'appel a lu en base (tables et clés), hors profil de la personne. */
const readsOf = async (base, u, key) => { base.reads.length = 0; await call(base, u, key); return base.reads.filter((r) => r !== 'users'); };
const leak = (x) => { const s = JSON.stringify(x) ?? ''; return (s.match(/zz-app-[3-9]|Nom secret [3-9]/g) ?? [])[0] ?? null; };

// Les clés que l'app demande : les données de chaque écran (src/app/routes.js), le préchauffage (src/app/main.js, WARM),
// et celles qu'un curieux peut taper (listes par pays ou plateforme, pages suivantes, fiches hors du top 3).
const routeKeys = [...readFileSync(path.join(root, 'src/app/routes.js'), 'utf8').matchAll(/data: "([^"]+)"/g)].map((m) => m[1]);
const warm = JSON.parse((readFileSync(path.join(root, 'src/app/main.js'), 'utf8').match(/const WARM = (\[[^\]]*\])/)?.[1] ?? '[]').replace(/'/g, '"'));
ok(routeKeys.length >= 8 && warm.length >= 5, `clés relevées : ${routeKeys.length} routes, ${warm.length} préchauffées`);
const fill = (k) => k.replace('{slug}', slug(7)).replace('{id}', k.startsWith('format') ? 'f1' : '9990000080').replace('{handle}', 'createur.fr');
const OPEN = new Set(['apps', 'search', 'stats']);
const LOCKED_KEYS = [...new Set([...routeKeys.map(fill), ...warm, 'home', 'formats', 'format:f1', 'creators:FR', 'creators:FR:2', 'creators:ALL',
  'creator:createur.fr', 'alerts', 'apps:FR', 'apps@instagram', 'apps:FR@tiktok', 'search:creators:2', 'app:zz-app-7', 'video:9990000080', 'apps:top'])].filter((k) => !OPEN.has(k));
const FREE_FIELDS = ['updatedAt', 'markets', 'niches', 'marketApps', 'apps', 'total', 'preview'];

for (const layout of ['simple', 'en morceaux', 'sans apps:top']) {
  // « en morceaux » : les pages lourdes rangées comme en prod (apps, recherche, listes, une fiche du top 3). « sans
  // apps:top » : juste après un déploiement, avant que la synchro ait écrit le document de l'aperçu.
  const base = db(layout === 'simple' ? {} : layout === 'en morceaux' ? { parts: new Set(['apps', 'search', 'creators:FR', 'app:zz-app-1', 'home']) } : { without: new Set(['apps:top']) });
  const g = (u, key) => call(base, u, key);
  console.log(`── pages ${layout}`);
  const pa = await g('pro', 'apps');
  ok(pa?.apps?.length === 10, 'Pro : les 10 apps');
  ok((await g('pro', 'app:zz-app-7'))?.slug === slug(7), 'Pro : fiche hors top 3 ouverte');
  ok((await g('pro', 'formats'))?.formats?.length === 1, 'Pro : Formats ouvert');
  ok((await g('pro', 'creators:FR'))?.creators?.length === 1, 'Pro : Créateurs ouvert');
  // Vidéo introuvable (mediaMiss) : sa fiche est absente, pour tout le monde. La liste globale hidden n'est jamais lue
  // (audit F14 : une seule vidéo notée relançait toutes les requêtes ouvertes).
  ok((await g('pro', `video:${HIDDEN_VIDEO}`)) === null, 'Pro : fiche de la vidéo introuvable absente');
  ok((await g('pro', 'video:2220000020'))?.id === '2220000020', 'Pro : fiche d\'une vidéo vivante servie');
  {
    const hiddenReads = [];
    for (const k of ['apps', 'app:zz-app-1', 'app:zz-app-7', `video:${HIDDEN_VIDEO}`, 'video:2220000020', 'creators:FR', 'stats', 'home'])
      for (const u of ['pro', 'free']) if ((await readsOf(base, u, k)).some((x) => x.startsWith('hidden'))) hiddenReads.push(`${u} ${k}`);
    ok(!hiddenReads.length, `aucune lecture de la liste globale hidden${hiddenReads.length ? ` (${hiddenReads.slice(0, 4).join(', ')})` : ''}`);
    const r = await readsOf(base, 'pro', 'video:2220000020');
    ok(r.includes('mediaMiss[v:2220000020]') && !r.some((x) => x === 'mediaMiss'), `fiche vidéo : une lecture ponctuelle de mediaMiss (${r.join(' ')})`);
  }
  // Miniatures et photos de profil : toujours servies par Kopycat (/cover, /avatar), jamais le lien TikTok signé.
  const v2 = await g('pro', 'video:2220000020');
  ok(typeof v2?.cover === 'string' && v2.cover.startsWith(`${SITE}/cover/2220000020?`), `Pro : miniature réécrite (${v2?.cover})`);
  ok(typeof v2?.avatar === 'string' && v2.avatar.startsWith(`${SITE}/avatar/auteur2?`), `Pro : photo de profil ajoutée (${v2?.avatar})`);
  ok(pa?.apps?.[0]?.top?.[0]?.cover?.startsWith(`${SITE}/cover/`), 'Pro : miniatures des listes réécrites');
  ok(!JSON.stringify(pa).includes('tiktok.example'), 'Pro : aucun lien TikTok signé dans la liste');

  for (const u of ['free', 'nul']) {
    const seen = [];
    const gf = async (key) => { const r = await g(u, key); seen.push([key, r]); return r; };
    const a = await gf('apps');
    ok(a?.apps?.length === 3 && a.apps.map((x) => x.slug).join() === [0, 1, 2].map(slug).join(), `${u} : apps = top 3 (${a?.apps?.length})`);
    ok(a?.total === 10 && a?.preview === true, `${u} : total = 10 apps suivies, marqué aperçu`);
    ok(a && Object.keys(a).every((k) => FREE_FIELDS.includes(k)), `${u} : document apps limité à ${FREE_FIELDS.join(', ')} (${a && Object.keys(a).join(', ')})`);
    ok(a?.apps?.[0]?.top?.[0]?.cover?.startsWith(`${SITE}/cover/`), `${u} : miniatures de l'aperçu réécrites`);
    ok((await gf('app:zz-app-1'))?.slug === slug(1), `${u} : fiche du top 3 ouverte`);
    ok((await gf('video:2220000020'))?.id === '2220000020', `${u} : vidéo d'une app du top 3 ouverte`);
    ok((await gf(`video:${HIDDEN_VIDEO}`)) === null || (await gf(`video:${HIDDEN_VIDEO}`))?.locked === true, `${u} : fiche de la vidéo introuvable jamais servie`);
    for (const k of LOCKED_KEYS) { const r = await gf(k); ok(r?.locked === true && Object.keys(r).length === 1, `${u} : ${k} verrouillé (${JSON.stringify(r)?.slice(0, 60)})`); }
    const s = await gf('search');
    ok(s?.apps?.length === 3 && s.creators.length === 0 && s.formats.length === 0, `${u} : recherche réduite au top 3`);
    ok((await gf('stats'))?.apps === 10, `${u} : chiffres publics ouverts`);
    const z = await gf('app:zz-inconnue');
    ok(z === null || z?.locked === true, `${u} : fiche inconnue jamais servie`);
    // Fouille de tout ce qui a été répondu : aucune app hors du top 3, dans aucun champ, à aucune profondeur.
    const leaks = seen.map(([k, r]) => [k, leak(r)]).filter(([, l]) => l);
    ok(!leaks.length, `${u} : aucune app hors du top 3 dans les ${seen.length} réponses${leaks.length ? ` (${leaks.map(([k, l]) => `${k} → ${l}`).join(' ; ')})` : ''}`);
    ok(seen.every(([, r]) => !r?.__error), `${u} : aucune erreur${seen.filter(([, r]) => r?.__error).map(([k, r]) => ` (${k} : ${r.__error})`).join('')}`);
    // Audit F1 : une clé verrouillée ne lit aucune page ; l'aperçu ne relit ni « apps » (848 Ko) ni « search » (389 Ko).
    const lockedReads = [];
    // Une fiche d'app ou de vidéo hors du top ne lit que le top (et la vidéo, pour savoir de quelle app elle est).
    const allowed = (k, x) => x === 'boards[apps:top]' || (layout === 'sans apps:top' && x === 'boards[apps]') || (k.startsWith('video:') && x === `boards[${k}]`);
    for (const k of LOCKED_KEYS) {
      const r = (await readsOf(base, u, k)).filter((x) => /^board/.test(x) && !((k.startsWith('app:') || k.startsWith('video:')) && allowed(k, x)));
      if (r.length) lockedReads.push(`${k} → ${r.join(' ')}`);
    }
    ok(!lockedReads.length, `${u} : clés verrouillées sans lecture de page${lockedReads.length ? ` (${lockedReads.slice(0, 3).join(' ; ')})` : ''}`);
    if (layout !== 'sans apps:top') for (const k of ['apps', 'search', 'app:zz-app-1', 'video:2220000020']) {
      const r = await readsOf(base, u, k);
      ok(!r.some((x) => /^board(s|Parts)\[(apps|search)\]$/.test(x)), `${u} : ${k} sans relire apps ni search (${r.join(' ')})`);
    }
  }
  ok((await g(null, 'apps')) === null && (await g(null, 'stats')) === null, 'pas connecté : rien');
}

// Page en cours de réécriture (un morceau manque) : jamais une page tronquée, jamais une erreur.
{
  const base = db({ parts: new Set(['app:zz-app-1', 'apps']), missing: new Set(['app:zz-app-1']) });
  ok((await call(base, 'pro', 'app:zz-app-1')) === null, 'Pro : page à un morceau manquant → absente');
  ok((await call(base, 'free', 'app:zz-app-1')) === null, 'gratuit : page à un morceau manquant → absente');
  ok((await call(base, 'pro', 'apps'))?.apps?.length === 10, 'Pro : les autres pages en morceaux se recollent');
}
const topOf = (f) => readFileSync(path.join(root, f), 'utf8').match(/PREVIEW_TOP = (\d+)/)?.[1];
ok(topOf('convex/boards.ts') === topOf('convex/radarModels.ts'), `PREVIEW_TOP identique dans boards.ts et radarModels.ts (${topOf('convex/boards.ts')}, ${topOf('convex/radarModels.ts')})`);
console.log(fail ? `${fail} échec(s)` : 'tout passe');
process.exit(fail ? 1 : 0);
