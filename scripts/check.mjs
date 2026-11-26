// Vérifie que chaque page se rend sans erreur et sans trou vide (« undefined », « [object Object] »).
import { h } from 'preact';
import { renderToString } from 'preact-render-to-string';
import { existsSync } from 'node:fs';

import { readdirSync } from 'node:fs';

// Les données d'exemple des canevas de l'app, retirées des écrans livrés (audit S4, scripts/dc2preact.py) : remises ici
// pour que les écrans se rendent comme sur le canevas.
globalThis.__dcSample = {};
for (const f of readdirSync(new URL('../design/app/samples/', import.meta.url)).filter((f) => f.endsWith('.js'))) {
  globalThis.__dcSample[f.replace('.js', '')] = (await import(`../design/app/samples/${f}`)).default;
}

const pages = ['LP', 'LPMobile', 'Tarifs', 'TarifsMobile', 'Simulateur', 'SimulateurMobile', 'Connexion', 'Inscription', 'MotDePasse', 'Adresse']
  .map((n) => [n, `../src/pages/${n}.js`])
  .concat(readdirSync(new URL('../src/app/pages/', import.meta.url)).map((f) => [`app/${f.replace('.js', '')}`, `../src/app/pages/${f}`]));
let failed = false;
// Avis (19/11) : un avis affiché hors de la landing doit être pris mot pour mot dans le mur d'avis de la landing,
// et aucune page ne garde de gabarit (« [Prénom N.] », « [N] membres », « [Note moyenne] »).
const quotes = (html) => [...html.matchAll(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/g)].map((m) => m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim());
const lpQuotes = new Set(quotes(renderToString(h((await import('../src/pages/LP.js')).default, null))));
for (const [name, file] of pages) {
  const { default: Page } = await import(file);
  const html = renderToString(h(Page, null));
  const bad = ['undefined', '[object Object]', 'NaN'].filter((w) => html.includes(w));
  // La casse SVG doit survivre à la conversion (viewBox, linearGradient…).
  for (const w of ['viewbox=', 'preserveaspectratio=', '<lineargradient', '<radialgradient']) if (html.includes(w)) bad.push(w);
  // Chaque image doit pointer vers un fichier de public/media (jamais vers le canevas).
  if (html.includes('/_blob/')) bad.push('/_blob/');
  for (const w of ['[Prénom N.]', '[N] membres', '[N] avis', '[Note moyenne]']) if (html.includes(w)) bad.push(`gabarit d'avis ${w}`);
  if (!name.startsWith('app/')) for (const q of quotes(html)) if (q.startsWith('«') && !lpQuotes.has(q)) bad.push(`avis absent de la landing : ${q.slice(0, 40)}…`);
  for (const [, src] of html.matchAll(/src="(\/media\/[^"]+)"/g)) if (!existsSync(new URL(`../public${src}`, import.meta.url))) bad.push(`image manquante ${src}`);
  const text = html.replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ');
  console.log(`${name.padEnd(22)} ${String(html.length).padStart(7)} car. HTML · ${text.split(/\s+/).filter(Boolean).length} mots${bad.length ? ' · PROBLÈME : ' + bad.join(', ') : ''}`);
  if (bad.length) failed = true;
}
process.exit(failed ? 1 : 0);
