// Pré-rendu de la landing et des tarifs (audit F9, 19/11), lancé par npm run build après vite build.
// Avant, index.html et tarifs.html ne portaient qu'un <div id="app"></div> vide : rien ne s'affichait avant ~37 Ko gz
// de JS, et un robot ou un aperçu de partage sans JS ne voyait aucun texte. Ici, les deux versions de chaque page
// (ordinateur et téléphone) sont rendues dans #app, basculées par la même condition que l'app (MOBILE_QUERY de
// src/runtime.js : 860 px, ou un écran tactile de moins de 500 px de haut, audit F25) ; au chargement du
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
// Le simulateur (26/11) : son premier écran entre par des animations. Le JS redessine la page en prenant la main, et
// elles repartiraient de zéro (le titre entrerait deux fois) : dans le pré-rendu, elles restent à leur premier instant.
const PAGES = [['index.html', 'LP', 'LPMobile'], ['tarifs.html', 'Tarifs', 'TarifsMobile'], ['simulateur.html', 'Simulateur', 'SimulateurMobile', { still: true }]];
const { MOBILE_QUERY } = await import(path.join(root, 'src/runtime.js'));
const SWITCH = `<style>#app>.prerender-m{display:none}@media ${MOBILE_QUERY}{#app>.prerender-d{display:none}#app>.prerender-m{display:block}}</style>`;
const STILL = '<style>#app>.prerender-d *,#app>.prerender-m *{animation-play-state:paused!important}</style>';

for (const [file, desktop, mobile, { still = false } = {}] of PAGES) {
  const target = path.join(dist, file);
  let html = fs.readFileSync(target, 'utf8');
  if (!html.includes('<div id="app"></div>')) throw new Error(`${file} : <div id="app"></div> introuvable (déjà pré-rendu ?)`);
  const page = async (name) => renderToString(h((await import(path.join(root, 'src/pages', `${name}.js`))).default, { stats: null }));
  const inner = `<div class="prerender-d">${await page(desktop)}</div><div class="prerender-m">${await page(mobile)}</div>`;
  html = html.replace('<div id="app"></div>', `<div id="app">${inner}</div>`).replace('</head>', `    ${SWITCH}${still ? STILL : ''}\n  </head>`);
  fs.writeFileSync(target, html);
  console.log(`pré-rendu : ${file} (${desktop} + ${mobile}, ${Math.round(inner.length / 1024)} Ko)`);
}
