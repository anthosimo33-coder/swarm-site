// En-têtes de cache de vercel.json (audit F7, 19/11) : les fichiers hashés de /assets ne se revalident jamais, les médias
// de public/ se gardent longtemps, les pages HTML restent revalidées à chaque visite (sinon un déploiement ne se voit pas).
// Les motifs sont lus comme Vercel les lit (path-to-regexp 6).   Usage : node scripts/cache.test.mjs [autre vercel.json]
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { pathToRegexp } = require('path-to-regexp');

const conf = JSON.parse(readFileSync(process.argv[2] || new URL('../vercel.json', import.meta.url), 'utf8'));
/** Le Cache-Control que Vercel pose sur ce chemin (la dernière règle qui correspond l'emporte), ou null. */
const cacheOf = (path) => {
  let out = null;
  for (const rule of conf.headers ?? []) {
    if (!pathToRegexp(rule.source).test(path)) continue;
    for (const h of rule.headers) if (h.key.toLowerCase() === 'cache-control') out = h.value;
  }
  return out;
};
const maxAge = (v) => Number((v ?? '').match(/(?:^|[ ,])max-age=(\d+)/)?.[1] ?? 0);

let fail = 0;
const ok = (cond, msg) => { console.log((cond ? 'OK   ' : 'ÉCHEC') + ' ' + msg); if (!cond) fail++; };
for (const p of ['/assets/app-Bx12Kq.js', '/assets/main-VXYjbj7u.css', '/assets/Apps-D1k9.js']) {
  const v = cacheOf(p);
  ok(/immutable/.test(v ?? '') && maxAge(v) >= 31_536_000, `${p} : immutable, un an (${v})`);
}
for (const p of ['/media/film/swarm-film.mp4', '/media/app-astra-ai.jpg', '/media/app/av-x.jpg', '/flags/fr.svg']) {
  const v = cacheOf(p);
  ok(maxAge(v) >= 86_400 && /stale-while-revalidate=\d{6,}/.test(v ?? '') && !/immutable/.test(v ?? ''), `${p} : cache long, sans immutable (${v})`);
}
// Nom de fichier non hashé : jamais immutable ; une page HTML : rien de long (elle annonce les nouveaux fichiers).
for (const p of ['/', '/app', '/app/apps/astraai', '/tarifs', '/connexion', '/cgv.html', '/favicon.svg', '/og.png', '/robots.txt', '/sitemap.xml']) {
  const v = cacheOf(p);
  ok(v === null || maxAge(v) === 0, `${p} : pas de cache long (${v ?? 'défaut de Vercel'})`);
}
console.log(fail ? `${fail} échec(s)` : 'tout passe');
process.exit(fail ? 1 : 0);
