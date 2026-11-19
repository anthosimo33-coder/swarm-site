// Référencement (19/11) : écrit dist/robots.txt et dist/sitemap.xml après la construction du site.
// L'adresse vient de Vercel (VERCEL_PROJECT_PRODUCTION_URL = le domaine de production, qui suivra le futur domaine
// sans rien changer ici), sinon de SITE_URL, sinon de l'adresse Vercel actuelle.
import { writeFileSync, existsSync } from 'node:fs';

const host = process.env.VERCEL_PROJECT_PRODUCTION_URL || (process.env.SITE_URL || '').replace(/^https?:\/\//, '') || 'swarm-site-one.vercel.app';
const site = `https://${host.replace(/\/+$/, '')}`;
// Les pages publiques ; l'app (/app), la connexion et le compte restent hors des moteurs.
const pages = [
  ['/', 'daily', '1.0'],
  ['/tarifs', 'weekly', '0.9'],
  ['/inscription', 'monthly', '0.6'],
  ['/cgv', 'yearly', '0.2'],
  ['/confidentialite', 'yearly', '0.2'],
  ['/mentions-legales', 'yearly', '0.2'],
];
const today = new Date().toISOString().slice(0, 10);
if (!existsSync('dist')) throw new Error('dist/ absent : lancer la construction (vite build) avant');
writeFileSync('dist/robots.txt', `User-agent: *\nAllow: /\nDisallow: /app\nDisallow: /compte\nDisallow: /connexion\n\nSitemap: ${site}/sitemap.xml\n`);
writeFileSync('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages
  .map(([p, freq, prio]) => `  <url><loc>${site}${p === '/' ? '/' : p}</loc><lastmod>${today}</lastmod><changefreq>${freq}</changefreq><priority>${prio}</priority></url>`)
  .join('\n')}\n</urlset>\n`);
console.log(`robots.txt et sitemap.xml écrits pour ${site}`);
