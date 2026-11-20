// Audit du 19/11, S4 : aucun fichier JS public (dist/assets, servi sans compte) ne livre de données du Radar.
// Échoue s'il y trouve un id de vidéo TikTok, un « @pseudo », /_blob/ ou /media/app/, sauf ce que le site public montre
// exprès (landing, tarifs, connexion, inscription : src/pages, générées depuis design/*.dc.html). Les écrans de l'app
// n'ont droit à rien : scripts/dc2preact.py en retire les données d'exemple.
// Lancé par scripts/vercel-build.mjs après le build. Usage : node scripts/check-public.mjs [dossier, défaut dist/assets]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.resolve(process.argv[2] ?? path.join(root, 'dist/assets'));
const SAMPLE = /\/media\/app\/|\/_blob\/|\b7\d{18}\b|["'`]@[A-Za-z0-9._]{2,30}["'`]/g;
const norm = (x) => x.replace(/^["'`]|["'`]$/g, ''); // le minifieur peut changer de guillemets
const always = (x) => x === '/media/app/' || x === '/_blob/';

const site = path.join(root, 'src/pages');
const shown = new Set(fs.readdirSync(site).filter((f) => f.endsWith('.js'))
  .flatMap((f) => [...fs.readFileSync(path.join(site, f), 'utf8').matchAll(SAMPLE)].map((m) => norm(m[0])))
  .filter((x) => !always(x)));

let bad = 0;
for (const f of fs.readdirSync(dir).filter((f) => f.endsWith('.js')).sort()) {
  const hits = [...new Set([...fs.readFileSync(path.join(dir, f), 'utf8').matchAll(SAMPLE)].map((m) => norm(m[0])))]
    .filter((x) => always(x) || !shown.has(x));
  if (!hits.length) continue;
  bad++;
  console.error(`${f} : ${hits.slice(0, 6).join(', ')}${hits.length > 6 ? ' …' : ''} (${hits.length})`);
}
if (bad) {
  console.error(`\n${bad} fichier(s) public(s) livrent des données du Radar sans compte (audit S4). Régénérer : npm run gen.`);
  process.exit(1);
}
console.log(`fichiers publics : aucune donnée du Radar hors du site public (${shown.size} valeurs montrées par la landing)`);
