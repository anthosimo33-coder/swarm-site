// Audit du 19/11, S4 : les fichiers JS publics de l'app ne livrent plus l'extrait du Radar des canevas.
//   1. scripts/dc2preact.py retire les données d'exemple (littéraux et chaînes), sans se tromper sur les chaînes, regex
//      et gabarits du code ; la génération échoue s'il en reste.
//   2. Les écrans générés n'en contiennent plus ; le build public (dist/assets) passe scripts/check-public.mjs.
//   3. Rien ne change à l'écran : sans données (exemples remis, comme scripts/check.mjs) et avec de vraies pages
//      (.bench-data/dump-dump-s4.json, produit par le banc de synchro, s'il existe), chaque écran rend le même HTML
//      qu'avant le retrait (version de référence : REF, par défaut le commit d'avant ce banc).
// Usage : node scripts/donnees-publiques.test.mjs
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { h } from 'preact';
import { renderToString } from 'preact-render-to-string';
import { checker, root } from './test-kit.mjs';

const { ok, end } = checker();
const git = (...a) => execFileSync('git', a, { cwd: root, encoding: 'utf8' }).trim();
const SAMPLE = /\/media\/app\/|\/_blob\/|\b7\d{18}\b|["'`]@[A-Za-z0-9._]{2,30}["'`]/;

// ─── 1. Le retrait, sur un code piégé ───
const tricky = `
  renderVals() {
    const re = /["'@]/g, half = 10 / 2; // une regex avec des guillemets, une division
    const tpl = \`\${half}'s "@x" \`;
    let A = [["Rizz App", "/media/app/app-rizz.jpg", "@rizz.app", "7705368869250075925"]];
    const D = this.props.data;
    if (D) A = D.apps;
    const item = this.props.item || { label: 'Astra AI', cover: '/media/app/app-astra-ai.jpg' };
    const id = D ? D.id : '7705929733220994337';
    const keep = '/media/v-7705876324832791821.jpg';
    return { A, item, id, re, tpl, keep };
  }`;
const py = spawnSync('python3', ['-c', `
import sys, json
sys.path.insert(0, ${JSON.stringify(path.join(root, 'scripts'))})
import dc2preact as d
body, samples = d.strip_samples(sys.stdin.read(), 'Essai')
print(json.dumps({'body': body, 'samples': samples}))`], { input: tricky, encoding: 'utf8' });
const res = py.status === 0 ? JSON.parse(py.stdout) : null;
ok(!!res, `dc2preact.strip_samples existe et passe le code piégé${res ? '' : ' : ' + (py.stderr || '').trim().split('\n').pop()}`);
if (res) {
  ok(!/Rizz|astra-ai|7705929733220994337|7705368869250075925/.test(res.body), 'exemples retirés : littéral déclaré, objet en ligne, chaîne d\'un ternaire');
  ok(res.body.includes(`/["'@]/g`) && res.body.includes('10 / 2') && res.body.includes(`\`\${half}'s "@x" \``), 'regex, division et gabarit intacts');
  // Le corps retiré se calcule : sans exemples, valeurs vides ; avec les exemples, les valeurs d'avant.
  const run = (sample, props) => {
    globalThis.__dcSample = sample;
    const C = new Function(`return class { constructor(p) { this.props = p; } ${res.body} }`)();
    return new C(props).renderVals();
  };
  const samples = new Function(`return {${Object.entries(res.samples).map(([k, v]) => `${JSON.stringify(k)}: ${v}`).join(',')}}`)();
  const before = new Function(`return class { constructor(p) { this.props = p; } ${tricky} }`)();
  const a = run({ Essai: samples }, {}), b = new before({}).renderVals();
  ok(JSON.stringify({ ...a, re: String(a.re) }) === JSON.stringify({ ...b, re: String(b.re) }), 'avec les exemples remis, mêmes valeurs qu\'avant');
  const empty = run({}, { data: { apps: [1], id: '42' } });
  ok(JSON.stringify(empty.A) === '[1]' && empty.id === '42' && !empty.item.cover, 'sans exemples, les vraies données passent et rien du Radar ne reste');
}

// ─── 2. Les écrans générés et les fichiers publics ───
const pagesDir = path.join(root, 'src/app/pages');
const leaking = fs.readdirSync(pagesDir).filter((f) => SAMPLE.test(fs.readFileSync(path.join(pagesDir, f), 'utf8')));
ok(!leaking.length, `écrans générés sans données du Radar (${leaking.length ? leaking.join(', ') : 'aucun'})`);
const out = fs.mkdtempSync(path.join(os.tmpdir(), 'kopycat-dist-'));
execFileSync('npx', ['vite', 'build', '--outDir', out, '--emptyOutDir', 'true', '--logLevel', 'error'], { cwd: root, stdio: 'ignore' });
const pub = spawnSync('node', [path.join(root, 'scripts/check-public.mjs'), path.join(out, 'assets')], { encoding: 'utf8' });
ok(pub.status === 0, `build : scripts/check-public.mjs passe (${(pub.stdout + pub.stderr).trim().split('\n').slice(-1)[0]})`);
fs.rmSync(out, { recursive: true, force: true });

// ─── 3. Rien ne change à l'écran ───
const ref = process.env.REF || (() => { const c = git('rev-list', '-1', 'HEAD', '--', 'scripts/check-public.mjs'); return c ? c + '^' : 'HEAD'; })();
const old = fs.mkdtempSync(path.join(os.tmpdir(), 'kopycat-ref-'));
fs.mkdirSync(path.join(old, 'src/app/pages'), { recursive: true });
fs.writeFileSync(path.join(old, 'src/runtime.js'), git('show', `${ref}:src/runtime.js`));
for (const f of fs.readdirSync(pagesDir)) fs.writeFileSync(path.join(old, 'src/app/pages', f), git('show', `${ref}:src/app/pages/${f}`));
fs.symlinkSync(path.join(root, 'node_modules'), path.join(old, 'node_modules'));
const freeze = () => { const t = Date.parse('2026-11-25T12:00:00+01:00'); Date.now = () => t; let r = 0.42; Math.random = () => (r = (r * 9301 + 49297) % 233280 / 233280); };
const render = (Page, props) => { freeze(); try { return renderToString(h(Page, props)); } catch (e) { return 'ERREUR ' + e.message; } };
const names = fs.readdirSync(pagesDir).map((f) => f.replace('.js', ''));
const mods = {};
for (const n of names) mods[n] = [(await import(path.join(old, 'src/app/pages', n + '.js'))).default, (await import(path.join(pagesDir, n + '.js'))).default];

const samples = {};
for (const f of fs.readdirSync(path.join(root, 'design/app/samples'))) samples[f.replace('.js', '')] = (await import(path.join(root, 'design/app/samples', f))).default;
const diff = [];
for (const n of names) {
  globalThis.__dcSample = undefined;
  // Seul écart voulu : un lien de vidéo sans id ne mène plus à une vraie vidéo du Radar (APP_SAMPLE de dc2preact.py).
  const same = (html) => html.replaceAll('/app/videos/7705929733220994337', '/app/videos');
  const a = same(render(mods[n][0], null));
  globalThis.__dcSample = samples;
  const b = same(render(mods[n][1], null));
  if (a !== b) diff.push(n);
}
ok(!diff.length, `sans données, exemples remis : ${names.length - diff.length}/${names.length} écrans identiques à ${ref}${diff.length ? ' — différents : ' + diff.join(', ') : ''}`);

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
  const real = [], crashed = [];
  globalThis.__dcSample = undefined; // comme dans l'app
  for (const n of names) {
    const base = KEY[n] ?? KEY[n.replace(/^M/, '')];
    const key = base ? keyOf(base) : null;
    const params = base && PARAM[base] ? { [PARAM[base]]: key.slice(base.length) } : {};
    // preview : Alertes le passe toujours à Nouvelle alerte dans l'app (l'exemple n'y sert que sur le canevas).
    const props = { data: key ? boards[key] : undefined, get: (k) => boards[k] ?? null, saved: () => null, save: () => Promise.resolve(), params, query: {}, user, signOut: () => {}, preview: () => null };
    const a = render(mods[n][0], props), b = render(mods[n][1], props);
    if (a.startsWith('ERREUR')) { crashed.push(n); continue; } // plantait déjà (Alertes avant Q3) : rien à comparer
    if (a !== b) real.push(`${n} (${key ?? 'sans clé'})`);
  }
  const cmp = names.length - crashed.length;
  ok(!real.length, `avec de vraies pages : ${cmp - real.length}/${cmp} écrans identiques à ${ref}${crashed.length ? ` (${crashed.join(', ')} plantait déjà)` : ''}${real.length ? ' — différents : ' + real.join(', ') : ''}`);
} else console.log('(pas de .bench-data/dump-dump-s4.json : rendu avec de vraies pages non vérifié)');
fs.rmSync(old, { recursive: true, force: true });
end();
