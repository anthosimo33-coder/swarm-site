// Constats « moyenne » de l'audit du 19/11 sur le convertisseur des canevas (scripts/dc2preact.py) et ce qu'il produit :
// une section par constat. Lit les écrans générés (src/app/pages, src/pages, src/app/routes.js).
// Usage : node scripts/generation.test.mjs
import fs from 'node:fs';
import path from 'node:path';
import { checker, root } from './test-kit.mjs';

const { ok, end } = checker();
const pages = (dir) => fs.readdirSync(path.join(root, dir)).filter((f) => f.endsWith('.js')).map((f) => [f, fs.readFileSync(path.join(root, dir, f), 'utf8')]);
const appPages = pages('src/app/pages');

// ─── Q11 : un lien de canevas sans paramètre ne mène plus à une fiche d'exemple réelle ───
{
  const hits = appPages.filter(([, s]) => /\/app\/apps\/astraai|\/app\/createurs\/zinedine\.gsbb|\/app\/videos\/7705929733220994337/.test(s)).map(([f]) => f);
  ok(!hits.length, `Q11 : aucun écran ne renvoie vers Astra AI, zinedine.gsbb ou une vidéo d'exemple (${hits.join(', ') || 'aucun'})`);
}

end();
