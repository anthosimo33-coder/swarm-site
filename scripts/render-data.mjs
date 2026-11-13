// Rend un écran de l'app avec un document réel, sans navigateur ni build :
//   node scripts/render-data.mjs <Composant> <clé> [fichier boards.json]
// ex. node scripts/render-data.mjs Createurs creators:FR
//     clé « - » : écran sans document (Dossiers, Compte)
// Variables facultatives :
//   BOARDS=<boards.json>        les documents, au format [[clé, document], …]
//   SAVED=<saved.json>          ce que la personne garde : { "follows": {…}, "folders": […], … }
//   PARAMS='{"id":"x"}'         paramètres de l'adresse ;  QUERY='{"niche":"Foi"}'  paramètres de la requête
// Signale « undefined », « NaN », « Infinity », « [object Object] » dans le texte, et « undefined » dans un lien.
import { h } from 'preact';
import { renderToString } from 'preact-render-to-string';
import fs from 'node:fs';

const [, , name, key, file = process.env.BOARDS] = process.argv;
if (!name || !key || !file) {
  console.error('usage : node scripts/render-data.mjs <Composant> <clé> <boards.json>');
  process.exit(2);
}
const boards = new Map(JSON.parse(fs.readFileSync(file, 'utf8')));
const saved = process.env.SAVED ? JSON.parse(fs.readFileSync(process.env.SAVED, 'utf8')) : {};
const json = (v) => (v ? JSON.parse(v) : {});
const { default: Page } = await import(`../src/app/pages/${name}.js`);
const user = { prenom: null, email: 'test@exemple.fr', initiale: 'T' };
const props = {
  data: key === '-' ? undefined : boards.get(key) ?? null,
  get: (k) => boards.get(k) ?? null,
  saved: (k) => saved[k] ?? null,
  save: () => Promise.resolve(),
  params: json(process.env.PARAMS),
  query: json(process.env.QUERY),
  user,
  signOut: () => {},
};
const html = renderToString(h(Page, props));
const text = html.replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
const bad = ['undefined', 'NaN', 'Infinity', '[object Object]'].filter((w) => text.includes(w));
if (/(?:href|src)="[^"]*(?:undefined|null|NaN)[^"]*"/.test(html.replace(/x-signature=[^"&]*/g, ''))) bad.push('lien undefined/null');
console.log(`${name} avec « ${key} » : ${html.length} car. HTML${bad.length ? ' · PROBLÈME : ' + bad.join(', ') : ' · OK'}`);
console.log(text.slice(0, Number(process.env.CHARS || 1500)));
process.exit(bad.length ? 1 : 0);
