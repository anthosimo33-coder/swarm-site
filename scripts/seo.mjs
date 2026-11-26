// Référencement (19/11) : écrit dist/robots.txt et dist/sitemap.xml après la construction du site.
// L'adresse vient de Vercel (VERCEL_PROJECT_PRODUCTION_URL = le domaine de production, qui suivra le futur domaine
// sans rien changer ici), sinon de SITE_URL, sinon de l'adresse Vercel actuelle.
import { writeFileSync, existsSync, readFileSync } from 'node:fs';

const host = process.env.VERCEL_PROJECT_PRODUCTION_URL || (process.env.SITE_URL || '').replace(/^https?:\/\//, '') || 'swarm-site-one.vercel.app';
const site = `https://${host.replace(/\/+$/, '')}`;
// Les pages publiques ; l'app (/app), la connexion et le compte restent hors des moteurs.
const pages = [
  ['/', 'daily', '1.0'],
  ['/tarifs', 'weekly', '0.9'],
  ['/simulateur', 'monthly', '0.8'],
  ['/inscription', 'monthly', '0.6'],
  ['/cgv', 'yearly', '0.2'],
  ['/confidentialite', 'yearly', '0.2'],
  ['/mentions-legales', 'yearly', '0.2'],
];
const today = new Date().toISOString().slice(0, 10);
if (!existsSync('dist')) throw new Error('dist/ absent : lancer la construction (vite build) avant');
writeFileSync('dist/robots.txt', `User-agent: *\nAllow: /\nDisallow: /app\nDisallow: /admin\nDisallow: /compte\nDisallow: /connexion\nDisallow: /mot-de-passe-oublie\nDisallow: /confirmer-adresse\n\nSitemap: ${site}/sitemap.xml\n`);
writeFileSync('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages
  .map(([p, freq, prio]) => `  <url><loc>${site}${p === '/' ? '/' : p}</loc><lastmod>${today}</lastmod><changefreq>${freq}</changefreq><priority>${prio}</priority></url>`)
  .join('\n')}\n</urlset>\n`);
// Les réseaux exigent une adresse absolue pour l'image d'aperçu : /og.png devient ${site}/og.png, et chaque page
// publique reçoit son og:url.
for (const [file, path] of [['index.html', '/'], ['tarifs.html', '/tarifs'], ['simulateur.html', '/simulateur'], ['inscription.html', '/inscription']]) {
  const f = `dist/${file}`;
  if (!existsSync(f)) continue;
  const html = readFileSync(f, 'utf8').replaceAll('content="/og.png"', `content="${site}/og.png"`)
    .replace('<meta property="og:type"', `<meta property="og:url" content="${site}${path}">\n    <meta property="og:type"`);
  writeFileSync(f, html);
}
console.log(`robots.txt, sitemap.xml et image d'aperçu écrits pour ${site}`);
