// Audit du 19/11, Q3 : l'écran Alertes (ordinateur) plantait avec de vraies données (MKW, DEPUIS et LANGN déclarés dans
// extraVals, appelés dans baseVals : « MKW is not defined »). npm run check ne le voyait pas : il rend les écrans sans
// données. Ce banc vérifie :
//   1. aucun nom introuvable dans les écrans générés de l'app (TypeScript, --checkJs, erreur TS2304) ;
//   2. chaque écran se rend avec de vraies pages, sans exception ni trou (« undefined », « NaN », « [object Object] »),
//      si .bench-data/dump-dump-s4.json existe (pages produites par le banc de synchro, scripts/sync-bench).
// Usage : node scripts/ecrans-donnees.test.mjs
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { h } from 'preact';
import { renderToString } from 'preact-render-to-string';
import { checker, root } from './test-kit.mjs';

const { ok, end } = checker();
const pagesDir = path.join(root, 'src/app/pages');
const files = fs.readdirSync(pagesDir).filter((f) => f.endsWith('.js')).map((f) => path.join('src/app/pages', f));

// ─── 1. Noms introuvables ───
const tsc = spawnSync(path.join(root, 'node_modules/.bin/tsc'), ['--allowJs', '--checkJs', '--noEmit', '--skipLibCheck', '--target', 'es2022',
  '--module', 'esnext', '--moduleResolution', 'bundler', ...files], { cwd: root, encoding: 'utf8' });
const missing = tsc.stdout.split('\n').filter((l) => l.includes('TS2304'));
ok(!missing.length, `aucun nom introuvable dans les ${files.length} écrans de l'app${missing.length ? ' :\n      ' + missing.join('\n      ') : ''}`);

// ─── 2. Rendu avec de vraies pages ───
const dumpFile = path.join(root, '.bench-data/dump-dump-s4.json');
if (fs.existsSync(dumpFile)) {
  const boards = JSON.parse(fs.readFileSync(dumpFile, 'utf8'));
  const keyOf = (k) => Object.keys(boards).find((x) => x.startsWith(k)) ?? k;
  const KEY = {
    Accueil: 'home', Apps: 'apps', Apercu: 'apps', MApercuApps: 'apps', Formats: 'formats', Createurs: 'creators:FR', CreateursCartes: 'creators:FR', Alertes: 'alerts',
    FicheApp: 'app:', Video: 'video:', FicheFormat: 'format:', FicheCreateur: 'creator:',
  };
  const PARAM = { 'app:': 'slug', 'video:': 'id', 'format:': 'id', 'creator:': 'handle' };
  const user = { prenom: null, email: 'test@exemple.fr', initiale: 'T', pro: true };
  const broken = [];
  for (const f of files) {
    const n = path.basename(f, '.js');
    const base = KEY[n] ?? KEY[n.replace(/^M/, '')];
    if (!base) continue; // écran sans document (Dossiers, Réglages…) : rendu par npm run check
    const key = keyOf(base);
    const params = PARAM[base] ? { [PARAM[base]]: key.slice(base.length) } : {};
    const { default: Page } = await import(path.join(root, f));
    let html;
    try {
      html = renderToString(h(Page, { data: boards[key], get: (k) => boards[k] ?? null, saved: () => null, save: () => Promise.resolve(), params, query: {}, user, signOut: () => {} }));
    } catch (e) { broken.push(`${n} (${key}) : ${e.message}`); continue; }
    const text = html.replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ');
    const holes = ['undefined', 'NaN', '[object Object]'].filter((w) => text.includes(w));
    if (holes.length) broken.push(`${n} (${key}) : ${holes.join(', ')}`);
  }
  ok(!broken.length, `écrans rendus avec de vraies pages, sans exception ni trou${broken.length ? ' :\n      ' + broken.join('\n      ') : ''}`);
} else console.log('(pas de .bench-data/dump-dump-s4.json : rendu avec de vraies pages non vérifié)');
end();
