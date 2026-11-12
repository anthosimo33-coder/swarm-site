// Vérifie que chaque page se rend sans erreur et sans trou vide (« undefined », « [object Object] »).
import { h } from 'preact';
import { renderToString } from 'preact-render-to-string';
import { existsSync } from 'node:fs';

const pages = ['LP', 'LPMobile', 'Tarifs', 'TarifsMobile', 'Connexion', 'Inscription', 'Compte'];
let failed = false;
for (const name of pages) {
  const { default: Page } = await import(`../src/pages/${name}.js`);
  const html = renderToString(h(Page, null));
  const bad = ['undefined', '[object Object]', 'NaN'].filter((w) => html.includes(w));
  // La casse SVG doit survivre à la conversion (viewBox, linearGradient…).
  for (const w of ['viewbox=', 'preserveaspectratio=', '<lineargradient', '<radialgradient']) if (html.includes(w)) bad.push(w);
  // Chaque image doit pointer vers un fichier de public/media (jamais vers le canevas).
  if (html.includes('/_blob/')) bad.push('/_blob/');
  for (const [, src] of html.matchAll(/src="(\/media\/[^"]+)"/g)) if (!existsSync(new URL(`../public${src}`, import.meta.url))) bad.push(`image manquante ${src}`);
  const text = html.replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ');
  console.log(`${name.padEnd(13)} ${String(html.length).padStart(7)} car. HTML · ${text.split(/\s+/).filter(Boolean).length} mots${bad.length ? ' · PROBLÈME : ' + bad.join(', ') : ''}`);
  if (bad.length) failed = true;
}
process.exit(failed ? 1 : 0);
