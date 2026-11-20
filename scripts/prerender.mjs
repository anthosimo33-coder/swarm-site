// Pré-rendu de la landing et des tarifs (audit F9, 19/11), lancé par npm run build après vite build.
// Avant, index.html et tarifs.html ne portaient qu'un <div id="app"></div> vide : rien ne s'affichait avant ~37 Ko gz
// de JS, et un robot ou un aperçu de partage sans JS ne voyait aucun texte. Ici, les deux versions de chaque page
// (ordinateur et téléphone) sont rendues dans #app, basculées par la même largeur que l'app (860 px) ; au chargement du
// JS, main-lp.js et main-tarifs.js vident #app et rendent la page dans la même tâche (pas d'écran vide entre les deux).
// Le rendu fige l'heure du build : le décompte du Black Friday et son bandeau suivent dès que le JS tourne.
// Usage : node scripts/prerender.mjs [dossier du build, défaut dist]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { h } from 'preact';
import { renderToString } from 'preact-render-to-string';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.resolve(process.argv[2] ?? path.join(root, 'dist'));
const PAGES = [['index.html', 'LP', 'LPMobile'], ['tarifs.html', 'Tarifs', 'TarifsMobile']];
const SWITCH = '<style>@media (max-width: 860px){#app>.prerender-d{display:none}}@media (min-width: 861px){#app>.prerender-m{display:none}}</style>';

for (const [file, desktop, mobile] of PAGES) {
  const target = path.join(dist, file);
  let html = fs.readFileSync(target, 'utf8');
  if (!html.includes('<div id="app"></div>')) throw new Error(`${file} : <div id="app"></div> introuvable (déjà pré-rendu ?)`);
  const page = async (name) => renderToString(h((await import(path.join(root, 'src/pages', `${name}.js`))).default, { stats: null }));
  const inner = `<div class="prerender-d">${await page(desktop)}</div><div class="prerender-m">${await page(mobile)}</div>`;
  html = html.replace('<div id="app"></div>', `<div id="app">${inner}</div>`).replace('</head>', `    ${SWITCH}\n  </head>`);
  fs.writeFileSync(target, html);
  console.log(`pré-rendu : ${file} (${desktop} + ${mobile}, ${Math.round(inner.length / 1024)} Ko)`);
}
