// Constats de l'audit du 19/11 sur le convertisseur des canevas (scripts/dc2preact.py) et ce qu'il produit : une section
// par constat (moyens, puis bas). Lit les écrans générés (src/app/pages, src/pages, src/app/routes.js).
// Usage : node scripts/generation.test.mjs   (DC2PREACT=<autre dc2preact.py> pour les sections qui l'importent)
import { execFileSync, spawnSync } from 'node:child_process';
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

// ─── Constats bas ────────────────────────────────────────────────────────────────────────────────────────────────
/** Lance du Python avec scripts/dc2preact.py importé comme module `d` (DC2PREACT : une autre version). */
const dc2 = (code, env = {}, input = '') => {
  const file = process.env.DC2PREACT ? path.resolve(process.env.DC2PREACT) : path.join(root, 'scripts/dc2preact.py');
  const r = spawnSync('python3', ['-c', `import importlib.util, sys, json
spec = importlib.util.spec_from_file_location('dc2preact', ${JSON.stringify(file)})
d = importlib.util.module_from_spec(spec); spec.loader.exec_module(d)
d.ROOT = __import__('pathlib').Path(${JSON.stringify(root)})
${code}`], { encoding: 'utf8', cwd: root, env: { ...process.env, ...env }, input });
  return { out: r.stdout.trim(), err: (r.stderr || '').trim(), status: r.status };
};

// ─── Q33 et F22 : ni drapeau qui retire les écrans mobiles, ni correspondance vers un artboard disparu ───
{
  const r = dc2(`print(json.dumps({'mobile': len(d.APP_MOBILE_PAGES), 'menu': any(c[1] == 'MenuCompte' for c in d.APP_COMPONENTS), 'links': sorted(d.APP_LINKS)}))`, { SWARM_SANS_MOBILE: '1' });
  const v = r.status === 0 ? JSON.parse(r.out) : null;
  ok(v && v.mobile >= 12 && v.menu, `Q33 : SWARM_SANS_MOBILE=1 ne retire plus les écrans mobiles ni MenuCompte (${v ? `${v.mobile} écrans mobiles, MenuCompte ${v.menu}` : r.err.split('\n').pop()})`);
  const canvases = fs.readdirSync(path.join(root, 'design/app')).filter((f) => f.endsWith('.dc.html')).map((f) => fs.readFileSync(path.join(root, 'design/app', f), 'utf8')).join('\n');
  const dead = (v?.links ?? []).filter((k) => !fs.existsSync(path.join(root, 'design/app', k)) && !canvases.includes(k));
  ok(v && !dead.length, `Q33, F22 : chaque correspondance de lien vise un canevas existant ou cité (${dead.join(', ') || 'aucune morte'})`);
}

// ─── Q43 : un canevas que la conversion rendrait faux arrête la génération, avec le fichier ───
{
  const canvas = (tpl, script = 'class Component extends DCLogic {\n  renderVals() { return { x: 1, go: () => {}, a: [1] }; }\n}', helmet = '') =>
    `<x-dc><helmet>${helmet}</helmet>${tpl}</x-dc>\n<script type="text/x-dc" data-dc-script>\n${script}\n</script>`;
  const CASES = [
    ['code avant la classe', canvas('<div>{{x}}</div>', 'const K = 3;\nclass Component extends DCLogic {\n  renderVals() { return { x: K }; }\n}'), 'err'],
    ['code après la classe', canvas('<div>{{x}}</div>', 'class Component extends DCLogic {\n  renderVals() { return { x: f() }; }\n}\nfunction f() { return 1; }'), 'err'],
    ['trou {{a[0]}}', canvas('<span>/ {{a[0]}}</span>'), 'err'],
    ['condition {{!x}}', canvas('<sc-if value="{{!x}}"><b>oui</b></sc-if>'), 'err'],
    ['gestionnaire « {{go}}» précédé d\'une espace', canvas('<button onClick=" {{go}}">ok</button>'), 'err'],
    ['<div/> hors SVG', canvas('<section><div class="sc"/><span>après</span></section>'), 'err'],
    ['balise jamais fermée', canvas('<section><div>texte</div>'), 'err'],
    ['<style> à attribut inconnu', canvas('<div>x</div>', undefined, '<style data-x="1">.b{color:red}</style>'), 'err'],
    ['regex avec accolade dans la classe', canvas('<div>{{x}}</div>', 'class Component extends DCLogic {\n  renderVals() { const r = /[}]/; return { x: r.test("}") ? 1 : 0 }; }\n}'), 'ok'],
    ['SVG auto-fermant', canvas('<svg viewBox="0 0 2 2"><path d="M0 0"/></svg>'), 'ok'],
    ['<style media>', canvas('<div class="b">x</div>', undefined, '<style media="(max-width: 600px)">.b{color:red}</style>'), 'ok', (o) => /@media \(max-width: 600px\)\{\.b\{color:red\}\}/.test(o.css)],
    ['keyframes : renommés dans les animations seulement', canvas('<p style="animation: pulse 2s infinite">Tape pulse 2s pour lancer</p><i style="animation: {{anim}}"></i>',
      'class Component extends DCLogic {\n  renderVals() { return { anim: \'pulse 1s\', msg: \'Tape pulse 2s pour lancer\' }; }\n}', '<style>@keyframes pulse{to{opacity:0}}.x{animation:pulse 3s}</style>'), 'ok',
      (o) => /@keyframes t-pulse/.test(o.css) && /animation:t-pulse 3s/.test(o.css) && /animation: t-pulse 2s/.test(o.js) && /"Tape pulse 2s pour lancer"/.test(o.js) && /anim: 't-pulse 1s'/.test(o.js) && /'Tape pulse 2s pour lancer'/.test(o.js)],
  ];
  const r = dc2(`import tempfile, pathlib, shutil, atexit, contextlib
tmp = pathlib.Path(tempfile.mkdtemp(dir=d.ROOT, prefix='.q43-'))
atexit.register(shutil.rmtree, tmp, True)
for k in ('src', 'pages', 'styles'):
    (tmp / k).mkdir()
d.GROUPS['site'].update({'src': tmp / 'src', 'pages': tmp / 'pages', 'styles': tmp / 'styles'})
out = []
for i, text in enumerate(json.loads(sys.stdin.read())):
    (tmp / 'src' / f'T{i}.dc.html').write_text(text)
    try:
        with contextlib.redirect_stdout(sys.stderr):
            d.convert(f'T{i}.dc.html', 'T', 't')
        out.append({'r': 'ok', 'js': (tmp / 'pages' / 'T.js').read_text(), 'css': (tmp / 'styles' / 't.css').read_text()})
    except BaseException as e:
        out.append({'r': 'err', 'msg': str(e)})
print(json.dumps(out))`, {}, JSON.stringify(CASES.map((c) => c[1])));
  const got = r.status === 0 ? JSON.parse(r.out) : [];
  const bad = CASES.map((c, i) => [c, got[i]]).filter(([[, , want, check], g]) => !g || g.r !== want || (want === 'ok' && check && !check(g)) || (want === 'err' && !/T\d+\.dc\.html/.test(g.msg)))
    .map(([[name, , want], g]) => `${name} : ${g ? g.r : r.err.split('\n').pop()}${g?.r === 'err' && want === 'ok' ? ` (${g.msg.slice(0, 80)})` : ''}`);
  ok(got.length === CASES.length && !bad.length, `Q43 : ${CASES.filter((c) => c[2] === 'err').length} canevas piégés arrêtent la génération avec leur fichier, ${CASES.filter((c) => c[2] === 'ok').length} canevas valides passent${bad.length ? ' ; faux : ' + bad.join(' ; ') : ''}`);
}

/** Sélecteurs des règles de premier niveau d'une feuille (hors @media et autres règles @). */
const topSelectors = (css) => {
  const out = [];
  let depth = 0, start = 0;
  const s = css.replace(/\/\*[\s\S]*?\*\//g, (m) => ' '.repeat(m.length));
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '{') { if (depth === 0) out.push(s.slice(start, i).trim()); depth++; }
    else if (s[i] === '}') { depth--; if (depth === 0) start = i + 1; }
    else if (s[i] === ';' && depth === 0) start = i + 1;
  }
  return out.filter((x) => !x.startsWith('@'));
};

// ─── Q45 : le survol global des liens est réservé aux souris (pas de lien blanc collant au toucher) ───
{
  const dir = path.join(root, 'src/app/styles');
  const bare = fs.readdirSync(dir).filter((f) => f.endsWith('.css')).filter((f) => topSelectors(fs.readFileSync(path.join(dir, f), 'utf8')).some((sel) => sel.split(',').some((x) => x.trim() === 'a:hover')));
  ok(!bare.length, `Q45 : aucun « a:hover » global hors @media (hover: hover) dans les CSS de l'app (${bare.join(', ') || 'aucun'})`);
}

// ─── S34 : une adresse venue des données (href, src, action…) passe par $u : jamais « javascript: » dans une page ───
{
  const raw = [...pages('src/app/pages').map(([f, t]) => [`app/${f}`, t]), ...pages('src/pages')]
    .flatMap(([f, t]) => [...t.matchAll(/"(href|src|action|formaction|poster|xlink:href)": (?!\$u\()(?!")(?!`[^`$]*`)([^,}]+)/g)].map((m) => `${f} ${m[1]}: ${m[2].slice(0, 40)}`));
  ok(!raw.length, `S34 : chaque trou d'adresse des écrans générés passe par $u (${raw.slice(0, 4).join(' ; ') || 'aucun brut'})`);
  const runtime = await import(path.join(root, 'src/runtime.js'));
  const $u = runtime.$u;
  const CASES = [['javascript:alert(1)', '#'], ['JaVaScRiPt:alert(1)', '#'], ['java\tscript:alert(1)', '#'], [' javascript:x', '#'], ['vbscript:x', '#'],
    ['data:text/html,<script>alert(1)</script>', '#'], ['https://www.tiktok.com/@a/video/1', 'https://www.tiktok.com/@a/video/1'], ['http://x.test/', 'http://x.test/'],
    ['/app/apps/x', '/app/apps/x'], ['#ancre', '#ancre'], ['?q=1', '?q=1'], ['mailto:a@b.c', 'mailto:a@b.c'], ['data:image/png;base64,AAAA', 'data:image/png;base64,AAAA'],
    [undefined, undefined], [null, null], ['', '']];
  const wrong = typeof $u === 'function' ? CASES.filter(([i, want]) => $u(i) !== want).map(([i, want]) => `${JSON.stringify(i)} → ${JSON.stringify($u(i))} au lieu de ${JSON.stringify(want)}`) : ['$u absent de src/runtime.js'];
  ok(!wrong.length, `S34 : $u laisse passer chemins, http(s), mailto, images data: ; rend « # » pour tout autre schéma (${wrong.join(' ; ') || CASES.length + ' cas'})`);
}

end();
