// Audit du 19/11, S4 : les fichiers JS publics de l'app ne livrent plus l'extrait du Radar des canevas.
//   1. scripts/dc2preact.py retire les données d'exemple (littéraux et chaînes), sans se tromper sur les chaînes, regex
//      et gabarits du code ; la génération échoue s'il en reste.
//   2. Les écrans générés n'en contiennent plus ; le build public (dist/assets) passe scripts/check-public.mjs.
//   3. Rien ne change à l'écran : sans données (exemples remis, comme scripts/check.mjs) et avec de vraies pages
//      (.bench-data/dump-dump-s4.json, produit par le banc de synchro, s'il existe), chaque écran rend le même HTML que
//      sa version avec l'exemple en ligne (avant retrait).
// Usage : node scripts/donnees-publiques.test.mjs
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { h } from 'preact';
import { renderToString } from 'preact-render-to-string';
import { checker, root } from './test-kit.mjs';

const { ok, end } = checker();
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
// Chaque écran actuel contre le même écran où l'exemple est remis en ligne (chaque référence à __dcSample remplacée
// par la valeur rangée dans design/app/samples) : sans données, exemples remis, et avec de vraies pages, sans
// exemples comme dans l'app. Ne dépend ni de l'historique git ni des autres changements des écrans.
const samples = {};
for (const f of fs.readdirSync(path.join(root, 'design/app/samples'))) samples[f.replace('.js', '')] = (await import(path.join(root, 'design/app/samples', f))).default;
/** Le texte de l'écran avec l'exemple en ligne, comme avant le retrait. */
function inline(src) {
  const OPEN = '(globalThis.__dcSample?.[';
  let out = '', at = 0;
  for (let i = src.indexOf(OPEN); i >= 0; i = src.indexOf(OPEN, at)) {
    const m = src.slice(i).match(/^\(globalThis\.__dcSample\?\.\["([^"]+)"\]\?\.\["([^"]+)"\] \?\? /);
    let j = i + 1, depth = 1;
    while (depth) { const c = src[j]; if (c === '"' || c === "'") { j = src.indexOf(c, j + 1) + 1; continue; } if (c === '(') depth++; else if (c === ')') depth--; j++; }
    out += src.slice(at, i) + JSON.stringify(samples[m[1]][m[2]]);
    at = j;
  }
  return out + src.slice(at);
}
const old = fs.mkdtempSync(path.join(os.tmpdir(), 'kopycat-ex-'));
fs.mkdirSync(path.join(old, 'src/app/pages'), { recursive: true });
fs.copyFileSync(path.join(root, 'src/runtime.js'), path.join(old, 'src/runtime.js'));
for (const f of fs.readdirSync(pagesDir)) fs.writeFileSync(path.join(old, 'src/app/pages', f), inline(fs.readFileSync(path.join(pagesDir, f), 'utf8')));
fs.symlinkSync(path.join(root, 'node_modules'), path.join(old, 'node_modules'));
const freeze = () => { const t = Date.parse('2026-11-25T12:00:00+01:00'); Date.now = () => t; let r = 0.42; Math.random = () => (r = (r * 9301 + 49297) % 233280 / 233280); };
const render = (Page, props) => { freeze(); try { return renderToString(h(Page, props)); } catch (e) { return 'ERREUR ' + e.message; } };
const names = fs.readdirSync(pagesDir).map((f) => f.replace('.js', ''));
const mods = {};
for (const n of names) mods[n] = [(await import(path.join(old, 'src/app/pages', n + '.js'))).default, (await import(path.join(pagesDir, n + '.js'))).default];
const diff = [];
for (const n of names) {
  globalThis.__dcSample = undefined;
  const a = render(mods[n][0], null);
  globalThis.__dcSample = samples;
  const b = render(mods[n][1], null);
  if (a !== b) diff.push(n);
}
ok(!diff.length, `sans données, exemples remis : ${names.length - diff.length}/${names.length} écrans identiques à leur version avec l'exemple en ligne${diff.length ? ' — différents : ' + diff.join(', ') : ''}`);

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
  const real = [];
  for (const n of names) {
    const base = KEY[n] ?? KEY[n.replace(/^M/, '')];
    const key = base ? keyOf(base) : null;
    const params = base && PARAM[base] ? { [PARAM[base]]: key.slice(base.length) } : {};
    // preview : Alertes le passe toujours à Nouvelle alerte dans l'app (l'exemple n'y sert que sur le canevas).
    const props = { data: key ? boards[key] : undefined, get: (k) => boards[k] ?? null, saved: () => null, save: () => Promise.resolve(), params, query: {}, user, signOut: () => {}, preview: () => null };
    globalThis.__dcSample = undefined; // comme dans l'app
    const a = render(mods[n][0], props), b = render(mods[n][1], props);
    if (a !== b) real.push(`${n} (${key ?? 'sans clé'})`);
  }
  ok(!real.length, `avec de vraies pages, sans exemples : ${names.length - real.length}/${names.length} écrans identiques à leur version avec l'exemple en ligne${real.length ? ' — différents : ' + real.join(', ') : ''}`);
} else console.log('(pas de .bench-data/dump-dump-s4.json : rendu avec de vraies pages non vérifié)');
fs.rmSync(old, { recursive: true, force: true });
end();
