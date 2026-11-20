// Copie des images (convex/imageCopy.ts), sur un faux réseau : la vraie fonction copyImage, empaquetée par esbuild, avec
// fetch et la résolution DNS remplacés.   Usage : npm run test:image   [autre imageCopy.ts]
// - Audit S30 (19/11) : une icône SVG (script compris) était rangée telle quelle et servie depuis le stockage Convex.
// - Audit S33 : corps lu en entier avant le contrôle des 4 Mo ; aucune vérification de schéma ni d'hôte.
// - Audit Q52 : tiktokCover et tiktokAvatar, exports jamais appelés.
import { mkdtempSync, rmSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
const require = createRequire(import.meta.url);
const { build } = require('esbuild');
const sharp = require('sharp');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const entry = path.resolve(process.argv[2] || path.join(root, 'convex/imageCopy.ts'));

// Faux DNS : chaque nom résout vers l'adresse donnée ici, sinon une adresse publique.
const DNS = { 'interne.example': '10.0.0.7', 'metadonnees.example': '169.254.169.254', 'v6local.example': '::1' };
globalThis.__fakeLookup = async (host) => [{ address: DNS[host] ?? '93.184.216.34', family: (DNS[host] ?? '').includes(':') ? 6 : 4 }];
// Dans node_modules du dépôt : le paquet empaqueté y trouve sharp (import dynamique, laissé hors du paquet).
const dir = mkdtempSync(path.join(root, 'node_modules', '.image-test-'));
const out = path.join(dir, 'imageCopy.mjs');
await build({ entryPoints: [entry], bundle: true, format: 'esm', platform: 'node', outfile: out, logLevel: 'error', external: ['sharp', 'heic-convert'],
  plugins: [{ name: 'dns', setup(b) {
    b.onResolve({ filter: /^(node:)?dns$/ }, () => ({ path: 'dns', namespace: 'fake' }));
    b.onLoad({ filter: /.*/, namespace: 'fake' }, () => ({ contents: 'export const promises = { lookup: (h, o) => globalThis.__fakeLookup(h, o) }; export default { promises };', loader: 'js' }));
  } }] });
const mod = await import(pathToFileURL(out).href);
// radarRegions.ts (pays et carrousels des vidéos), Convex remplacé, pour la lecture commune des pages TikTok (audit Q51).
const regionsOut = path.join(dir, 'radarRegions.mjs');
const convexDir = path.dirname(entry);
await build({ entryPoints: [path.join(convexDir, 'radarRegions.ts')], bundle: true, format: 'esm', platform: 'node', outfile: regionsOut, logLevel: 'error',
  plugins: [{ name: 'stubs', setup(b) {
    b.onResolve({ filter: /_generated\/(api|server)$/ }, () => ({ path: 'stub', namespace: 'stub' }));
    b.onLoad({ filter: /.*/, namespace: 'stub' }, () => ({ contents: 'export const internal = {}; export const internalAction = (c) => c;', loader: 'js' }));
  } }] });
const regions = await import(pathToFileURL(regionsOut).href);
rmSync(dir, { recursive: true, force: true });

// ─── Faux réseau ────────────────────────────────────────────────────────────────────────────────────────────────
const png = await sharp({ create: { width: 900, height: 900, channels: 3, background: { r: 200, g: 40, b: 90 } } }).png({ compressionLevel: 0 }).toBuffer();
const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><script>alert(document.domain)</script><rect width="64" height="64"/></svg>');
const ico = Buffer.concat([Buffer.from([0, 0, 1, 0, 1, 0, 16, 16, 0, 0, 1, 0, 32, 0]), Buffer.alloc(300, 7)]);
const fetched = [];
let pulled = 0;
/** Un corps en flux de `size` octets, par morceaux de 64 Ko ; `pulled` compte ce qui a été réellement lu. */
const stream = (size, fill = 0) => new ReadableStream({ start() { this.left = size; }, pull(c) { if (this.left <= 0) return c.close(); const n = Math.min(65_536, this.left); this.left -= n; pulled += n; c.enqueue(new Uint8Array(n).fill(fill)); } });
const SITES = {
  'https://img.example/ok.png': () => new Response(png, { headers: { 'content-type': 'image/png' } }),
  'https://img.example/icone.svg': () => new Response(svg, { headers: { 'content-type': 'image/svg+xml' } }),
  'https://img.example/menteur.png': () => new Response(svg, { headers: { 'content-type': 'image/png' } }),
  'https://img.example/favicon.ico': () => new Response(ico, { headers: { 'content-type': 'image/x-icon' } }),
  'https://img.example/annonce-geante.png': () => new Response(stream(50_000_000), { headers: { 'content-type': 'image/png', 'content-length': '50000000' } }),
  'https://img.example/flux-geant.png': () => new Response(stream(300_000_000, 0x89), { headers: { 'content-type': 'image/png' } }),
  'https://img.example/vers-metadonnees': () => new Response(null, { status: 302, headers: { location: 'http://169.254.169.254/latest/meta-data/' } }),
  'https://img.example/vers-interne': () => new Response(null, { status: 302, headers: { location: 'https://interne.example/x.png' } }),
  'https://img.example/vers-ok': () => new Response(null, { status: 301, headers: { location: '/ok.png' } }),
  'https://interne.example/x.png': () => new Response(png, { headers: { 'content-type': 'image/png' } }),
  'https://metadonnees.example/x.png': () => new Response(png, { headers: { 'content-type': 'image/png' } }),
  // Sites d'apps web : une page avec seulement une icône SVG, une page énorme.
  'https://svgseul.example/': () => new Response('<html><head><link rel="icon" type="image/svg+xml" href="/icone.svg"></head></html>', { headers: { 'content-type': 'text/html' } }),
  'https://svgseul.example/favicon.ico': () => new Response(ico, { headers: { 'content-type': 'image/x-icon' } }),
  'https://enorme.example/': () => new Response(stream(80_000_000, 0x20), { headers: { 'content-type': 'text/html' } }),
};
globalThis.fetch = async (url, init = {}) => {
  url = String(url);
  fetched.push(url);
  const f = SITES[url];
  const res = f ? f() : new Response('absent', { status: 404 });
  // Comme undici : sans redirect « manual », les redirections sont suivies sans contrôle.
  if (init.redirect !== 'manual' && res.status >= 300 && res.status < 400) return globalThis.fetch(new URL(res.headers.get('location'), url).toString(), init);
  return res;
};
const stored = [];
const ctx = { storage: { store: async (blob) => { stored.push({ type: blob.type, size: blob.size, head: Buffer.from(await blob.slice(0, 64).arrayBuffer()).toString('latin1') }); return `st${stored.length}`; }, getUrl: async (id) => `https://stockage.example/${id}` } };

let fail = 0;
const ok = (cond, msg) => { console.log((cond ? 'OK   ' : 'ÉCHEC') + ' ' + msg); if (!cond) fail++; };
const copy = async (key, source) => { stored.length = 0; fetched.length = 0; pulled = 0; const r = await mod.copyImage(ctx, key, source); return { r, stored: [...stored], fetched: [...fetched], pulled }; };

{ const c = await copy('icon:ok', 'https://img.example/ok.png'); ok(c.r && c.stored[0]?.type === 'image/webp', `PNG ordinaire : rangée en WebP (${c.stored[0]?.type ?? 'rien'})`); }
{ const c = await copy('icon:svg', 'https://img.example/icone.svg'); ok(!c.r && !c.stored.length, `SVG (script compris) : jamais rangé (audit S30 ; ${c.stored.map((x) => x.type).join() || 'rien'})`); }
{ const c = await copy('icon:menteur', 'https://img.example/menteur.png'); ok(!c.r && !c.stored.some((x) => /<svg/.test(x.head)), `SVG annoncé « image/png » : refusé d'après ses octets (${c.stored.map((x) => x.type).join() || 'rien'})`); }
{ const c = await copy('icon:ico', 'https://img.example/favicon.ico'); ok(c.r && c.stored[0]?.type === 'image/x-icon', `ICO (matriciel, illisible par sharp) : gardé tel quel (${c.stored[0]?.type ?? 'rien'})`); }
{ const c = await copy('v:1', 'https://img.example/annonce-geante.png'); ok(!c.r && c.pulled < 1_000_000, `50 Mo annoncés : refusés sans lire le corps (audit S33 ; ${c.pulled} octets lus)`); }
{ const c = await copy('v:2', 'https://img.example/flux-geant.png'); ok(!c.r && c.pulled <= 4_200_000, `flux sans taille annoncée : lecture coupée après 4 Mo (${(c.pulled / 1e6).toFixed(1)} Mo lus)`); }
for (const [src, why] of [['http://img.example/ok.png', 'http://'], ['https://127.0.0.1/x.png', 'IP de bouclage'], ['https://[::1]/x.png', 'IPv6 de bouclage'],
  ['https://10.1.2.3/x.png', 'IP privée'], ['https://localhost/x.png', 'localhost'], ['https://interne.example/x.png', 'nom qui résout vers le réseau privé'],
  ['https://metadonnees.example/x.png', 'nom qui résout vers 169.254.169.254'], ['ftp://img.example/ok.png', 'ftp://'], ['javascript:alert(1)', 'javascript:']]) {
  const c = await copy('v:3', src);
  ok(!c.r && !c.fetched.some((u) => u === src), `${why} : ni lu ni rangé (${c.fetched.join(' ') || 'aucune requête'})`);
}
{ const c = await copy('v:4', 'https://img.example/vers-metadonnees'); ok(!c.r && !c.fetched.some((u) => u.startsWith('http://169.254')), `redirection vers http://169.254.169.254 : pas suivie (${c.fetched.join(' ')})`); }
{ const c = await copy('v:5', 'https://img.example/vers-interne'); ok(!c.r && !c.fetched.includes('https://interne.example/x.png'), `redirection vers un hôte du réseau privé : pas suivie (${c.fetched.join(' ')})`); }
{ const c = await copy('v:6', 'https://img.example/vers-ok'); ok(c.r && c.stored[0]?.type === 'image/webp', `redirection ordinaire : suivie (${c.fetched.join(' ')})`); }
{ fetched.length = 0; const u = await mod.siteIcon('svgseul.example'); ok(u === 'https://svgseul.example/favicon.ico', `site à icône SVG seule : /favicon.ico à la place (${u})`); }
{ pulled = 0; const u = await mod.siteIcon('enorme.example'); ok(pulled <= 600_000, `page d'accueil énorme : lecture coupée vers 200 Ko (plus ce que le flux a mis en réserve) (${pulled} octets lus ; ${u})`); }
ok(!('tiktokCover' in mod) && !('tiktokAvatar' in mod), 'tiktokCover et tiktokAvatar, jamais appelés, retirés (audit Q52)');

// ─── Q51 : la page publique TikTok lue d'une seule façon ─────────────────────────────────────────────────────────
{
  const page = (scope) => `<html><script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application/json">${JSON.stringify({ __DEFAULT_SCOPE__: scope })}</script></html>`;
  const VID = { 'webapp.video-detail': { statusCode: 0, itemInfo: { itemStruct: { id: '7000000000000000001', locationCreated: 'fr', imagePost: { images: [{}, {}, {}] }, video: { cover: 'https://p16.tiktokcdn.com/c.jpg' } } } } };
  const PAGES = {
    'https://www.tiktok.com/@h/video/7000000000000000001': page(VID), 'https://www.tiktok.com/@tiktok/video/7000000000000000001': page(VID),
    'https://www.tiktok.com/@h/video/7000000000000000002': page({ 'webapp.video-detail': { statusCode: 10204 } }),
    'https://www.tiktok.com/@tiktok/video/7000000000000000002': page({ 'webapp.video-detail': { statusCode: 10204 } }),
    'https://www.tiktok.com/@h/video/7000000000000000003': page({ 'webapp.video-detail': { statusCode: 0, itemInfo: { itemStruct: { id: '7000000000000000003', video: {} } } } }),
    'https://www.tiktok.com/@h/video/7000000000000000004': '<html>pas de données {"cover":"https:\\u002F\\u002Fp16.tiktokcdn.com\\u002Fsecours.jpg"}</html>',
    'https://www.tiktok.com/@tiktok/video/7000000000000000004': '<html>page de contrôle</html>',
    'https://www.tiktok.com/@compte': page({ 'webapp.user-detail': { statusCode: 0, userInfo: { user: { avatarMedium: 'https://p16.tiktokcdn.com/a.jpg' } } } }),
    'https://www.tiktok.com/@parti': page({ 'webapp.user-detail': { statusCode: 10221 } }),
    'https://www.tiktok.com/@sansphoto': page({ 'webapp.user-detail': { statusCode: 0, userInfo: { user: {} } } }),
  };
  const uas = new Set();
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (url, init = {}) => { uas.add(init.headers?.['User-Agent'] ?? new Headers(init.headers).get('user-agent')); const html = PAGES[String(url)]; return html ? new Response(html, { headers: { 'content-type': 'text/html' } }) : new Response('', { status: 503 }); };
  const got = {
    cover: await mod.tiktokCoverState('h', '7000000000000000001'), coverGone: await mod.tiktokCoverState('h', '7000000000000000002'),
    coverBlank: await mod.tiktokCoverState('h', '7000000000000000003'), coverRepli: await mod.tiktokCoverState('h', '7000000000000000004'),
    coverMuet: await mod.tiktokCoverState('h', '7000000000000000009'),
    avatar: await mod.tiktokAvatarState('compte'), avatarGone: await mod.tiktokAvatarState('parti'), avatarBlank: await mod.tiktokAvatarState('sansphoto'),
    facts: await regions.videoFactsState('7000000000000000001'), factsGone: await regions.videoFactsState('7000000000000000002'),
    factsUnread: await regions.videoFactsState('7000000000000000004'), factsMuet: await regions.videoFactsState('7000000000000000009'),
  };
  globalThis.fetch = realFetch;
  const want = {
    cover: { url: 'https://p16.tiktokcdn.com/c.jpg' }, coverGone: { gone: true }, coverBlank: { blank: true }, coverRepli: { url: 'https://p16.tiktokcdn.com/secours.jpg' }, coverMuet: {},
    avatar: { url: 'https://p16.tiktokcdn.com/a.jpg' }, avatarGone: { gone: true }, avatarBlank: { blank: true },
    facts: { facts: { country: 'FR', slideshow: true, images: 3 } }, factsGone: { gone: true }, factsUnread: {}, factsMuet: {},
  };
  const bad = Object.keys(want).filter((k) => JSON.stringify(got[k]) !== JSON.stringify(want[k])).map((k) => `${k} : ${JSON.stringify(got[k])}`);
  ok(!bad.length, `pages TikTok : miniature, photo de profil, pays et carrousel lus comme avant (vidéo, disparue, sans miniature, repli, sans réponse)${bad.length ? ' ; ' + bad.join(' ; ') : ''}`);
  ok(uas.size === 1, `un seul User-Agent pour toutes les pages (${uas.size})`);
  const fs2 = await import('node:fs');
  const copies = fs2.readdirSync(convexDir).filter((f) => f.endsWith('.ts') && f !== 'tiktokPage.ts')
    .filter((f) => /__UNIVERSAL_DATA_FOR_REHYDRATION__|AppleWebKit\/605/.test(fs2.readFileSync(path.join(convexDir, f), 'utf8')));
  ok(!copies.length, `lecture des données de page et User-Agent écrits seulement dans convex/tiktokPage.ts (audit Q51)${copies.length ? ` ; copies : ${copies.join(', ')}` : ''}`);
}
console.log(fail ? `${fail} échec(s)` : 'tout passe');
process.exit(fail ? 1 : 0);
