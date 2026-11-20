// Routes /cover/<id> et /avatar/<handle> (convex/coverHttp.ts), audit S5 et S15 : les vraies actions HTTP, empaquetées
// par esbuild, avec Convex en doublures (runQuery, runAction relevés). Usage : npm run test:cover [autre coverHttp.ts]
//  - sans signature, signature fausse, adresse mal formée : 404, sans aucune lecture ni action ;
//  - tout refus est la même réponse (statut et Cache-Control) : rien ne dit si le compte ou la vidéo est suivi ;
//  - pendant la pause qui suit un échec noté, aucune action Node ;
//  - la signature est un vrai HMAC-SHA256 (comparé à node:crypto), et les adresses de boards.get passent.
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createHmac } from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
const require = createRequire(import.meta.url);
const { build } = require('esbuild');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const entry = path.resolve(process.argv[2] || path.join(root, 'convex/coverHttp.ts'));

const STUBS = {
  './_generated/server': 'export const httpAction = (f) => f;',
  './_generated/api': 'const mk = (p) => new Proxy({}, { get: (_t, k) => (k === Symbol.toPrimitive || k === "toString" ? () => p : k === "then" ? undefined : mk(p ? p + "." + String(k) : String(k))) }); export const internal = mk("");',
};
const dir = mkdtempSync(path.join(tmpdir(), 'cover-'));
const bundle = async (file, name) => {
  const out = path.join(dir, name);
  await build({ entryPoints: [file], bundle: true, format: 'esm', platform: 'node', outfile: out, logLevel: 'error',
    plugins: [{ name: 'stubs', setup(b) {
      b.onResolve({ filter: /.*/ }, (a) => (STUBS[a.path] !== undefined ? { path: a.path, namespace: 'stub' }
        : a.path.startsWith('./') && path.dirname(a.importer) !== path.join(root, 'convex') ? { path: path.join(root, 'convex', a.path + '.ts') } : undefined));
      b.onLoad({ filter: /.*/, namespace: 'stub' }, (a) => ({ contents: STUBS[a.path], loader: 'js' }));
    } }] });
  return import(pathToFileURL(out).href);
};
process.env.COVER_SECRET = 'secret-de-banc';
const http = await bundle(entry, 'coverHttp.mjs');
const sign = await bundle(path.join(root, 'convex/coverSign.ts'), 'coverSign.mjs');
rmSync(dir, { recursive: true, force: true });

// ─── La base simulée : ce que radarStore rendrait ───────────────────────────────────────────────────────────────
const NOW = Date.now();
const WORLD = {
  covers: { '1110000001': { url: 'https://stockage/1.jpg', handle: null }, '1110000002': { url: null, handle: 'auteur' }, '1110000003': { url: null, handle: 'auteur' } },
  coverMedia: { 'v:1110000002': { url: null, missAt: null, heic: null }, 'v:1110000003': { url: null, missAt: NOW - 3_600_000, heic: null } },
  avatars: { 'connu.copie': { known: true, url: 'https://stockage/a.jpg' }, 'connu.neuf': { known: true, url: null }, 'connu.pause': { known: true, url: null } },
  avatarMedia: { 'a:connu.neuf': { url: null, missAt: null }, 'a:connu.pause': { url: null, missAt: NOW - 600_000 } },
};
function ctx() {
  const calls = [];
  return {
    calls,
    runQuery: async (fn, args) => {
      const f = String(fn); calls.push(f);
      if (f === 'radarStore.coverLookup') return WORLD.covers[args.id] ?? { url: null, handle: null };
      if (f === 'radarStore.avatarLookup') return WORLD.avatars[args.handle] ?? { known: false, url: null };
      if (f === 'radarStore.mediaGet') return WORLD.coverMedia[args.key] ?? WORLD.avatarMedia[args.key] ?? { url: null, missAt: null, heic: null };
      throw new Error('requête inattendue ' + f);
    },
    runAction: async (fn) => { const f = String(fn); calls.push(f); return { url: 'https://stockage/neuf.jpg', gone: false }; },
    runMutation: async (fn) => { calls.push(String(fn)); },
  };
}
const SITE = 'https://banc.convex.site';
const req = (url) => new Request(url.startsWith('http') ? url : SITE + url);
const hit = async (route, url) => {
  const c = ctx();
  try { const r = await http[route](c, req(url)); return { status: r.status, cache: r.headers.get('cache-control'), location: r.headers.get('location'), calls: c.calls }; }
  catch (e) { return { status: 500, cache: null, location: null, calls: [...c.calls, `erreur ${String(e).slice(0, 40)}`] }; } // Convex répondrait 500
};

let fail = 0;
const ok = (cond, msg) => { console.log((cond ? 'OK   ' : 'ÉCHEC') + ' ' + msg); if (!cond) fail++; };
const refusals = [];
const refused = (r, msg) => { refusals.push([msg, r]); ok(r.status === 404, `${msg} : 404 (${r.status}, ${r.calls.join(' ') || 'rien lu'})`); };

// Signature : un vrai HMAC-SHA256 (12 premiers octets), lié au type, à l'id et à la version.
const mac = (m) => createHmac('sha256', 'secret-de-banc').update(m).digest('hex').slice(0, 24);
const cu = sign.coverUrl?.(SITE, '1110000002'), au = sign.avatarUrl?.(SITE, 'connu.neuf');
ok(cu === `${SITE}/cover/1110000002?v=${sign.COVER_VERSION}&s=${mac(`cover:1110000002:${sign.COVER_VERSION}`)}`, `adresse de miniature signée (${cu})`);
ok(au === `${SITE}/avatar/connu.neuf?v=${sign.AVATAR_VERSION}&s=${mac(`avatar:connu.neuf:${sign.AVATAR_VERSION}`)}`, `adresse de photo signée (${au})`);
const signed = (kind, v) => (kind === 'cover' ? sign.coverUrl(SITE, v) : sign.avatarUrl(SITE, v));

// ── Sans compte : rien ne se lit, rien ne se lance ──
for (const [route, value] of [['cover', '1110000002'], ['avatar', 'connu.neuf']]) {
  const r = await hit(route, `/${route}/${value}?v=2`);
  refused(r, `${route} sans signature`);
  ok(!r.calls.length, `${route} sans signature : aucune lecture, aucune action`);
  const good = new URL(signed(route, value));
  refused(await hit(route, `/${route}/${value}?v=${good.searchParams.get('v')}&s=${'0'.repeat(24)}`), `${route} signature fausse`);
  refused(await hit(route, `/${route}/${route === 'cover' ? '1110000003' : 'connu.pause'}?${good.search.slice(1)}`), `${route} signature d'un autre`);
  refused(await hit(route, `/${route}/${value}?v=1&s=${good.searchParams.get('s')}`), `${route} ancienne version`);
  const bad = await hit(route, `/${route}/%E0%A4%A?v=1`);
  refused(bad, `${route} adresse mal formée (%)`);
}
// ── Avec une adresse signée ──
{
  const r = await hit('cover', signed('cover', '1110000001'));
  ok(r.status === 302 && r.location === 'https://stockage/1.jpg' && !r.calls.includes('covers.ensure'), 'cover signée, copie rangée : redirection, sans action');
  const n = await hit('cover', signed('cover', '1110000002'));
  ok(n.status === 302 && n.calls.includes('covers.ensure'), 'cover signée, pas encore copiée : copiée (action), redirection');
  const p = await hit('cover', signed('cover', '1110000003'));
  refused(p, 'cover signée, en pause après un échec');
  ok(!p.calls.includes('covers.ensure'), 'cover en pause : aucune action Node');
  refused(await hit('cover', signed('cover', '9990000009')), 'cover signée, vidéo inconnue');
  ok((await hit('cover', signed('cover', '1110000001') + '&r=1')).status === 302, 'cover : la relance du navigateur (&r=1) passe');
  const a = await hit('avatar', signed('avatar', 'connu.copie'));
  ok(a.status === 302 && a.location === 'https://stockage/a.jpg', 'avatar signé, copie rangée : redirection');
  const an = await hit('avatar', signed('avatar', 'connu.neuf'));
  ok(an.status === 302 && an.calls.includes('covers.ensureAvatar'), 'avatar signé, pas encore copié : copié (action)');
  const ap = await hit('avatar', signed('avatar', 'connu.pause'));
  refused(ap, 'avatar signé, en pause');
  ok(!ap.calls.includes('covers.ensureAvatar'), 'avatar en pause : aucune action Node');
  refused(await hit('avatar', signed('avatar', 'inconnu.total')), 'avatar signé, compte inconnu');
}
// Tous les refus se ressemblent : même statut, même Cache-Control, aucune redirection.
const shapes = new Set(refusals.map(([, r]) => `${r.status}|${r.cache}|${r.location}`));
ok(shapes.size === 1, `tous les refus identiques (${[...shapes].join(' ; ')})`);
// Sans aucun secret : aucune adresse produite, toutes refusées.
delete process.env.COVER_SECRET; delete process.env.JWT_PRIVATE_KEY;
ok(sign.coverUrl(SITE, '1110000001') === null && sign.avatarUrl(SITE, 'connu.copie') === null, 'sans secret : aucune adresse produite');
refused(await hit('cover', `/cover/1110000001?v=${sign.COVER_VERSION}&s=${mac(`cover:1110000001:${sign.COVER_VERSION}`)}`), 'sans secret : cover refusée');
// Convex Auth pose toujours JWT_PRIVATE_KEY : la clé en est tirée (jamais la clé elle-même), et elle signe.
process.env.JWT_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----banc';
const derived = createHmac('sha256', process.env.JWT_PRIVATE_KEY).update('kopycat:adresses-images:1').digest();
const viaJwt = sign.coverUrl(SITE, '1110000001');
ok(viaJwt?.endsWith('&s=' + createHmac('sha256', derived).update(`cover:1110000001:${sign.COVER_VERSION}`).digest('hex').slice(0, 24))
  && !viaJwt.endsWith('&s=' + createHmac('sha256', process.env.JWT_PRIVATE_KEY).update(`cover:1110000001:${sign.COVER_VERSION}`).digest('hex').slice(0, 24)), 'sans COVER_SECRET : clé tirée de JWT_PRIVATE_KEY');
ok((await hit('cover', viaJwt)).status === 302, 'sans COVER_SECRET : l\'adresse signée passe');
console.log(fail ? `${fail} échec(s)` : 'tout passe');
process.exit(fail ? 1 : 0);
