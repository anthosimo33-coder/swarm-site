// vercel.json : en-têtes de sécurité (audit S26) et routage local identique à la prod (audit Q49).
// Usage : npm run test:vercel   [autre vercel.json]
// Les motifs sont lus comme Vercel les lit (path-to-regexp 6) ; le routage local est celui de vite.config.js (route).
import { readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const require = createRequire(import.meta.url);
const { pathToRegexp } = require('path-to-regexp');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const conf = JSON.parse(readFileSync(process.argv[2] || path.join(root, 'vercel.json'), 'utf8'));
let fail = 0;
const ok = (cond, msg) => { console.log((cond ? 'OK   ' : 'ÉCHEC') + ' ' + msg); if (!cond) fail++; };

// ─── S26 : en-têtes de sécurité ──────────────────────────────────────────────────────────────────────────────────
/** Les en-têtes que Vercel pose sur ce chemin (la dernière règle qui correspond l'emporte sur une même clé). */
const headersOf = (p) => {
  const out = {};
  for (const rule of conf.headers ?? []) if (pathToRegexp(rule.source).test(p)) for (const h of rule.headers) out[h.key.toLowerCase()] = h.value;
  return out;
};
const PATHS = ['/', '/app', '/app/apps', '/app/compte', '/tarifs', '/connexion', '/inscription', '/mot-de-passe-oublie', '/admin', '/cgv', '/favicon.svg', '/assets/main-abc.js', '/media/film/swarm-film.mp4'];
const csp = (p) => Object.fromEntries((headersOf(p)['content-security-policy'] ?? '').split(';').map((d) => d.trim().split(/\s+/)).filter((d) => d[0]).map(([k, ...v]) => [k, v]));
for (const p of PATHS) {
  const h = headersOf(p), c = csp(p);
  const miss = [];
  if (!c['default-src']) miss.push('CSP');
  if (!(c['frame-ancestors'] ?? []).includes("'none'")) miss.push("frame-ancestors 'none'");
  if ((h['x-frame-options'] ?? '').toUpperCase() !== 'DENY') miss.push('X-Frame-Options');
  if (h['x-content-type-options'] !== 'nosniff') miss.push('nosniff');
  if (!h['referrer-policy']) miss.push('Referrer-Policy');
  if (!h['permissions-policy']) miss.push('Permissions-Policy');
  ok(!miss.length, `${p} : en-têtes de sécurité${miss.length ? ` absents : ${miss.join(', ')}` : ''}`);
}
{
  const c = csp('/app');
  const script = c['script-src'] ?? c['default-src'] ?? [];
  ok(script.length && script.every((x) => x === "'self'"), `scripts : seulement ceux du site (script-src ${script.join(' ')})`);
  ok((c['object-src'] ?? []).includes("'none'") && (c['base-uri'] ?? []).includes("'self'"), 'object-src none, base-uri self');
  // Ce que les pages chargent vraiment doit rester permis (sinon la prod casse) : relevé dans les sources.
  const allows = (dir, origin) => (c[dir] ?? c['default-src'] ?? []).some((s) => s === origin || (s.startsWith('https://*.') && origin.startsWith('https://') && origin.endsWith(s.slice('https://*'.length))) || (s.startsWith('wss://*.') && origin.startsWith('wss://') && origin.endsWith(s.slice('wss://*'.length))));
  const convex = (readFileSync(path.join(root, '.env.production'), 'utf8').match(/VITE_CONVEX_URL=(\S+)/) ?? [])[1];
  const site = convex?.replace('.convex.cloud', '.convex.site');
  const html = ['index.html', 'app.html', 'tarifs.html', 'connexion.html', 'inscription.html', 'mot-de-passe-oublie.html', 'admin.html'].map((f) => readFileSync(path.join(root, f), 'utf8')).join('\n');
  const pages = ['design/app/VideoA.dc.html', 'design/app/MVideo.dc.html', 'src/app/main.js'].map((f) => readFileSync(path.join(root, f), 'utf8')).join('\n');
  const need = [
    ['style-src', 'https://fonts.googleapis.com', /fonts\.googleapis\.com/.test(html)],
    ['font-src', 'https://fonts.gstatic.com', /fonts\.gstatic\.com/.test(html)],
    ['connect-src', convex, !!convex], ['connect-src', convex?.replace('https://', 'wss://'), !!convex],
    ['img-src', convex, !!convex], ['img-src', site, !!site], // copies rangées, /cover et /avatar
    ['frame-src', 'https://www.tiktok.com', /https:\/\/www\.tiktok\.com\/player/.test(pages)],
    ['frame-src', 'https://www.instagram.com', /https:\/\/www\.instagram\.com\/reel\/.*embed/.test(pages)],
  ];
  const refused = need.filter(([, , used]) => used).filter(([dir, o]) => !allows(dir, o)).map(([dir, o]) => `${dir} ${o}`);
  ok(!refused.length, `la CSP permet ce que les pages chargent (polices, backend Convex en https et wss, images, lecteurs TikTok et Instagram)${refused.length ? ` ; refusé : ${refused.join(', ')}` : ''}`);
  // Aucun script en ligne dans les pages HTML (script-src 'self' les refuserait).
  const files = [...['index.html', 'app.html', 'tarifs.html', 'connexion.html', 'inscription.html', 'mot-de-passe-oublie.html', 'admin.html'].map((f) => path.join(root, f)),
    ...readdirSync(path.join(root, 'public')).filter((f) => f.endsWith('.html')).map((f) => path.join(root, 'public', f))];
  const inline = files.filter((f) => /<script(?![^>]*\bsrc=)(?![^>]*type="application\/(ld\+)?json")[^>]*>/i.test(readFileSync(f, 'utf8')) || / on[a-z]+="/i.test(readFileSync(f, 'utf8')));
  ok(!inline.length, `aucun script en ligne ni gestionnaire on…= dans les pages HTML${inline.length ? ` : ${inline.map((f) => path.relative(root, f)).join(', ')}` : ''}`);
}

// ─── Q49 : le routage local (vite.config.js) est celui de vercel.json ──────────────────────────────────────────
// Par le middleware du serveur de dev, tel que Vite l'appelle (fichiers réels du dépôt).
const viteConfig = (await import(pathToFileURL(path.join(root, 'vite.config.js')).href)).default;
const plugin = viteConfig.plugins.flat().find((x) => x && x.configureServer);
const mws = [];
plugin.configureServer({ middlewares: { use: (f) => mws.push(f) } });
const route = (url) => {
  const req = { url, headers: {} }, res = { statusCode: 200, headers: {}, setHeader(k, v) { this.headers[k.toLowerCase()] = v; }, end() { this.ended = true; } };
  let i = 0;
  const next = () => { const f = mws[i++]; if (f) f(req, res, next); };
  next();
  return res.ended ? { redirect: res.headers.location, status: res.statusCode } : { url: req.url };
};
const CASES = [
  ['/app', { url: '/app.html' }], ['/app/apps', { url: '/app.html' }], ['/app/createurs/zinedine.gsbb', { url: '/app.html' }],
  ['/app/videos/7705929730054170541?x=1', { url: '/app.html?x=1' }], ['/app.html', { url: '/app.html' }],
  ['/tarifs', { url: '/tarifs.html' }], ['/tarifs?ref=lp', { url: '/tarifs.html?ref=lp' }], ['/cgv', { url: '/cgv.html' }], ['/admin', { url: '/admin.html' }],
  ['/compte', { redirect: '/app/compte', status: 307 }], ['/src/app/main.js', { url: '/src/app/main.js' }], ['/favicon.svg', { url: '/favicon.svg' }],
];
const wrong = CASES.filter(([u, want]) => JSON.stringify(route(u)) !== JSON.stringify(want)).map(([u, want]) => `${u} → ${JSON.stringify(route(u))} au lieu de ${JSON.stringify(want)}`);
ok(!wrong.length, `routage local = vercel.json (adresse à point, /compte, pages sans .html)${wrong.length ? ' :\n      ' + wrong.join('\n      ') : ''}`);
// Les redirections et réécritures de vercel.json sont toutes connues du test (une nouvelle doit y être ajoutée).
ok((conf.redirects ?? []).every((r) => CASES.some(([u]) => pathToRegexp(r.source).test(u.split('?')[0]))) && (conf.rewrites ?? []).every((r) => CASES.some(([u]) => pathToRegexp(r.source).test(u.split('?')[0]))),
  'chaque redirection et réécriture de vercel.json a son cas ici');
console.log(fail ? `${fail} échec(s)` : 'tout passe');
process.exit(fail ? 1 : 0);
