// Vérifie que chaque page se rend sans erreur et sans trou vide (« undefined », « [object Object] »).
import { h } from 'preact';
import { renderToString } from 'preact-render-to-string';

const pages = ['LP', 'LPMobile', 'Tarifs', 'TarifsMobile'];
let failed = false;
for (const name of pages) {
  const { default: Page } = await import(`../src/pages/${name}.js`);
  const html = renderToString(h(Page, null));
  const bad = ['undefined', '[object Object]', 'NaN'].filter((w) => html.includes(w));
  const text = html.replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ');
  console.log(`${name.padEnd(13)} ${String(html.length).padStart(7)} car. HTML · ${text.split(/\s+/).filter(Boolean).length} mots${bad.length ? ' · PROBLÈME : ' + bad.join(', ') : ''}`);
  if (bad.length) failed = true;
}
process.exit(failed ? 1 : 0);
