// Constats « moyenne » de l'audit du 19/11 sur le convertisseur des canevas (scripts/dc2preact.py) et ce qu'il produit :
// une section par constat. Lit les écrans générés (src/app/pages, src/pages, src/app/routes.js).
// Usage : node scripts/generation.test.mjs
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
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

// ─── Q12 : une police chargée par le canevas (helmet) et pas par la page HTML de l'app est chargée par l'écran ───
{
  const injects = appPages.filter(([, s]) => /\$fonts\(/.test(s)).map(([f, s]) => [f, (s.match(/\$fonts\((\[[^\]]*\])\)/) || [])[1]]);
  const doto = injects.filter(([, a]) => /family=Doto/.test(a ?? '')).map(([f]) => f).sort();
  ok(doto.join() === 'Formules.js,MFormules.js', `Q12 : Formules et MFormules chargent Doto (le décompte du Black Friday) (${doto.join(', ') || 'aucun'})`);
  ok(injects.every(([, a]) => !/family=Inter|JetBrains/.test(a ?? '')), 'Q12 : rien de ce que app.html charge déjà n\'est rechargé');
  const runtime = fs.readFileSync(path.join(root, 'src/runtime.js'), 'utf8');
  if (/export const \$fonts/.test(runtime)) {
    const { $fonts } = await import(path.join(root, 'src/runtime.js'));
    const added = [];
    globalThis.document = { querySelectorAll: () => added.map((l) => ({ getAttribute: () => l.href })), createElement: () => ({}), head: { appendChild: (l) => added.push(l) } };
    $fonts(['https://fonts.googleapis.com/css2?family=Doto:wght@800&display=swap']);
    $fonts(['https://fonts.googleapis.com/css2?family=Doto:wght@800&display=swap']);
    delete globalThis.document;
    ok(added.length === 1 && added[0].rel === 'stylesheet', `Q12 : la police est ajoutée une seule fois à la page (${added.length})`);
  } else ok(false, 'Q12 : $fonts présent dans src/runtime.js');
}

// ─── Q13 : l'ancienne page Compte (sans résiliation) n'est plus routée ; /app/compte ouvre les Réglages ───
{
  const routes = fs.readFileSync(path.join(root, 'src/app/routes.js'), 'utf8');
  const main = fs.readFileSync(path.join(root, 'src/app/main.js'), 'utf8');
  ok(!/pages\/(M?Compte)\.js/.test(routes) && !fs.existsSync(path.join(root, 'src/app/pages/Compte.js')) && !fs.existsSync(path.join(root, 'src/app/pages/MCompte.js')),
    'Q13 : plus de route ni d\'écran généré pour l\'ancienne page Compte');
  ok(/ACCOUNT\b/.test(main) && /setSettingsNext\('profil'\)/.test(main), 'Q13 : src/app/main.js ouvre les Réglages pour /app/compte (panneau sur ordinateur, plein écran sur téléphone)');
  const cgv = fs.readFileSync(path.join(root, 'public/cgv.html'), 'utf8');
  ok(!/espace Compte/.test(cgv) && /Réglages/.test(cgv), 'Q13 : les CGV nomment le vrai chemin de la résiliation (Réglages), plus « l\'espace Compte »');
}

// ─── F10 : les images de la landing sous le haut de page se chargent au défilement ───
{
  const lp = fs.readFileSync(path.join(root, 'src/pages/LP.js'), 'utf8'), lpm = fs.readFileSync(path.join(root, 'src/pages/LPMobile.js'), 'utf8');
  const imgs = (src) => [...src.matchAll(/\$h\("img", \{([^}]*)\}/g)].map((m) => m[1]);
  const lazy = (src) => imgs(src).filter((a) => /"loading": "lazy"/.test(a)).length;
  ok(lazy(lp) >= 5 && lazy(lpm) >= 4, `F10 : images en loading=lazy (LP ${lazy(lp)}/${imgs(lp).length}, LPMobile ${lazy(lpm)}/${imgs(lpm).length})`);
  ok(imgs(lp).length - lazy(lp) >= 2 && imgs(lp).length - lazy(lp) <= 5, `F10 : les images du haut de page restent chargées tout de suite (LP : ${imgs(lp).length - lazy(lp)})`);
  ok(!/data-eager/.test(lp + lpm), 'F10 : le marqueur data-eager du canevas ne part pas dans la page');
}

// ─── F11 : le film de la landing ne part qu'une fois visible, dans la bonne définition ───
{
  for (const name of ['LP', 'LPMobile']) {
    const src = fs.readFileSync(path.join(root, `src/pages/${name}.js`), 'utf8');
    const video = (src.match(/\$h\("video", \{([^}]*)\}/) || [, ''])[1];
    const mount = (src.match(/componentDidMount\(\) \{([\s\S]*?)\n  \}/) || [, ''])[1];
    ok(/"preload": "none"/.test(video) && !/"autoplay"/.test(video), `F11 : ${name}, le film ne se télécharge plus d'avance (preload=none, sans autoplay)`);
    ok(/IntersectionObserver/.test(mount) && /0\.5/.test(mount) && /film\.paused && half\(\)/.test(mount),
      `F11 : ${name}, lecture seulement quand la moitié du film est à l'écran (mesurée à chaque appel), plus de lecture sans condition au montage`);
  }
  const lp = fs.readFileSync(path.join(root, 'src/pages/LP.js'), 'utf8');
  ok(/swarm-film-720\.mp4/.test(lp) && /devicePixelRatio/.test(lp) && /saveData/.test(lp), 'F11 : sur ordinateur, le 720p sur un petit écran ou en mode économie de données');
}

// ─── F9 : la landing et les tarifs sont rendus au build ; le premier affichage n'attend plus le JS ───
{
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'kopycat-site-'));
  execFileSync('npx', ['vite', 'build', '--outDir', out, '--emptyOutDir', 'true', '--logLevel', 'error'], { cwd: root, stdio: 'ignore' });
  const script = path.join(root, 'scripts/prerender.mjs');
  if (fs.existsSync(script)) execFileSync('node', [script, out], { cwd: root, stdio: 'ignore' });
  const text = (f) => { const html = fs.readFileSync(path.join(out, f), 'utf8'); const app = (html.match(/<div id="app">([\s\S]*)<\/div>\s*(?:<noscript>[\s\S]*?<\/noscript>\s*)?<\/body>/) || [, ''])[1]; return app.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '); };
  const lp = text('index.html'), tf = text('tarifs.html');
  ok(lp.length > 2000 && /Lance ton premier business/.test(lp), `F9 : index.html porte la landing rendue (${lp.length} car. de texte)`);
  ok(tf.length > 1000 && /29,99/.test(tf), `F9 : tarifs.html porte les tarifs rendus (${tf.length} car.)`);
  const html = fs.readFileSync(path.join(out, 'index.html'), 'utf8');
  ok(/prerender-d/.test(html) && /prerender-m/.test(html) && /max-width: 860px/.test(html), 'F9 : versions ordinateur et téléphone, basculées par la même largeur que l\'app (860 px)');
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  ok(/prerender\.mjs/.test(pkg.scripts.build), 'F9 : npm run build (et donc le build Vercel) lance le pré-rendu');
  fs.rmSync(out, { recursive: true, force: true });
}

end();
