// Constats « moyenne » de l'audit du 19/11 sur l'app (src/app/main.js et ses modules) : une section par constat.
// Les modules de l'app sans DOM (watcher.js, plan.js, scroll.js) avec de faux client, fenêtre et historique ; le build
// pour ce que l'entrée embarque. Le comportement dans le navigateur est vérifié à part (rapport).
// Usage : node scripts/app.test.mjs
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import { checker, root } from './test-kit.mjs';

const { ok, end } = checker();
const app = (f) => path.join(root, 'src/app', f);
const main = fs.readFileSync(app('main.js'), 'utf8');
const has = (f) => fs.existsSync(app(f));

// ─── F3 : un abonnement que plus rien ne lit est fermé ───
{
  ok(has('watcher.js'), 'F3 : module src/app/watcher.js présent');
  if (has('watcher.js')) {
    const { createWatcher } = await import(app('watcher.js'));
    const open = new Set();
    const client = { watchQuery: (_fn, args) => ({ localQueryResult: () => ({ key: args.key }), onUpdate: () => { open.add(args.key); return () => open.delete(args.key); } }) };
    let t = 0;
    const w = createWatcher(client, { keep: (id) => id === 'board:apps', max: 20, idleMs: 60_000, now: () => t });
    w.watch('get', 'board:apps', { key: 'apps' });
    for (let i = 0; i < 100; i++) { t += 1000; const e = w.watch('get', `board:video:${i}`, { key: `video:${i}` }); const f = () => {}; e.listeners.add(f); e.listeners.delete(f); }
    const reading = w.watch('get', 'board:app:x', { key: 'app:x' });
    reading.listeners.add(() => {});
    w.sweep();
    ok(open.size <= 22 && open.has('apps') && open.has('app:x'), `F3 : 100 vidéos enchaînées, abonnements ouverts ramenés à ${open.size} (20 libres au plus, plus les gardés et les lus)`);
    ok(open.has('video:99') && !open.has('video:0'), 'F3 : les plus récents restent (retour arrière instantané), les plus anciens sont fermés');
    t += 61_000;
    w.sweep();
    ok(open.size === 2 && open.has('apps') && open.has('app:x'), `F3 : au bout de 60 s sans usage, les abonnements libres sont fermés ; restent les gardés et ceux qu'un écran lit (${[...open].join(', ')})`);
  }
  ok(/createWatcher\(/.test(main) && /\.sweep\(\)/.test(main), 'F3 : src/app/main.js passe par le watcher et le balaie au changement d\'écran');
}

// ─── F15 : seules les listes servies partout restent ouvertes toute la session ───
{
  const warm = (main.match(/const WARM = \[([^\]]*)\]/) || [, ''])[1].replace(/['\s]/g, '').split(',').filter(Boolean);
  ok(warm.sort().join() === 'apps,search,stats', `F15 : listes gardées ouvertes = apps, search (⌘K), stats (${warm.join(', ')}) ; home, formats, creators:FR et alerts s'ouvrent avec leur écran`);
}

// ─── F4 : Réglages, Aperçu, Formules et le menu du compte ne sont plus dans l'entrée de l'app ───
{
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'kopycat-app-'));
  execFileSync('npx', ['vite', 'build', '--outDir', out, '--emptyOutDir', 'true', '--manifest', '--logLevel', 'error'], { cwd: root, stdio: 'ignore' });
  const manifest = JSON.parse(fs.readFileSync(path.join(out, '.vite/manifest.json'), 'utf8'));
  const entry = manifest['app.html'];
  const closure = (key, seen = new Set()) => { if (!seen.has(key)) { seen.add(key); for (const k of manifest[key]?.imports ?? []) closure(k, seen); } return seen; };
  const startup = closure('app.html');
  const lazy = ['Reglages', 'Apercu', 'MApercuApps', 'Formules', 'MFormules', 'MenuCompte'].map((n) => `src/app/pages/${n}.js`);
  const split = lazy.filter((k) => manifest[k] && !startup.has(k) && (entry.dynamicImports ?? []).includes(k));
  ok(split.length === lazy.length, `F4 : écrans secondaires chargés à la demande (${split.length}/${lazy.length} : ${lazy.filter((k) => !split.includes(k)).map((k) => path.basename(k)).join(', ') || 'tous'})`);
  const gz = [...startup].reduce((n, k) => n + zlib.gzipSync(fs.readFileSync(path.join(out, manifest[k].file))).length, 0);
  console.log(`      (entrée de l'app au démarrage : ${(gz / 1024).toFixed(1)} Ko gz)`);
  fs.rmSync(out, { recursive: true, force: true });
}

// ─── F8 : l'aperçu n'attend plus le code d'Apps ; un compte sans abonnement ne précharge que ce qu'il peut ouvrir ───
{
  ok(has('plan.js'), 'F8 : module src/app/plan.js présent');
  if (has('plan.js')) {
    const plan = await import(app('plan.js'));
    const { ROUTES } = await import(app('routes.js')).catch(() => ({ ROUTES: null }));
    ok(plan.routeCodeNeeded('/app/apps', { known: true, pro: false }) === false && plan.routeCodeNeeded('/app/apps', { known: true, pro: true }) && plan.routeCodeNeeded('/app/apps', { known: false, pro: false }),
      'F8 : sans abonnement, Apps (aperçu) n\'attend pas le code d\'Apps ; avec, ou tant qu\'on ne sait pas, si');
    ok(!plan.mayLoadBeforeUser('/app') && !plan.mayLoadBeforeUser('/app/formats') && plan.mayLoadBeforeUser('/app/apps/astraai') && plan.mayLoadBeforeUser('/app/videos/1'),
      'F8 : une adresse fermée sans abonnement attend de savoir qui est là ; une fiche ouverte se charge tout de suite');
    const fake = [{ path: '/app' }, { path: '/app/apps' }, { path: '/app/formats' }, { path: '/app/apps/:slug' }, { path: '/app/videos/:id' }, { path: '/app/compte' }, { path: '/app/alertes' }];
    ok(plan.routesToWarm(fake, false).map((r) => r.path).join() === '/app/apps/:slug,/app/videos/:id,/app/compte' && plan.routesToWarm(fake, true).length === fake.length,
      'F8 : préchargement sans abonnement = fiches, vidéos, compte ; avec = tout');
  }
  ok(/routeCodeNeeded\(/.test(main) && /routesToWarm\(/.test(main) && /mayLoadBeforeUser\(/.test(main), 'F8 : src/app/main.js applique ces règles');
}

// ─── F13 : retour arrière, la liste revient à sa position ───
{
  ok(has('scroll.js'), 'F13 : module src/app/scroll.js présent');
  if (has('scroll.js')) {
    const { scrollMemory } = await import(app('scroll.js'));
    // Une fenêtre et un historique simulés : pile d'entrées avec leur état.
    const stack = [{ state: null }]; let at = 0;
    const win = {
      scrollY: 0, scrolled: [],
      history: { scrollRestoration: 'auto', get state() { return stack[at].state; }, replaceState(st) { stack[at].state = st; }, pushState(st) { stack.splice(at + 1); stack.push({ state: st }); at++; }, back() { at--; } },
      scrollTo(_x, y) { this.scrollY = y; this.scrolled.push(y); },
      requestAnimationFrame: (f) => f(),
    };
    const mem = scrollMemory(win);
    ok(win.history.scrollRestoration === 'manual', 'F13 : le navigateur ne rejoue plus sa propre position (elle s\'appliquait à l\'ancien écran)');
    win.scrollY = 611;
    mem.remember(); win.history.pushState({ viewer: 1 }); // clic vers une vidéo
    mem.arrive(null);
    ok(win.scrollY === 0, 'F13 : un nouvel écran arrive en haut');
    win.history.back(); mem.popped(); // retour arrière
    mem.arrive(null);
    ok(win.scrollY === 611, `F13 : au retour, la liste revient à sa position (${win.scrollY})`);
    mem.arrive(null);
    ok(win.scrollY === 0, 'F13 : un écran rendu sans retour arrière n\'est pas replacé');
  }
  ok(/scrollMemory\(/.test(main) && /\.remember\(\)/.test(main) && /\.popped\(\)/.test(main) && /\.arrive\(/.test(main), 'F13 : src/app/main.js retient la position avant chaque navigation et la rend au retour');
}

// ─── Constats « basse » (phase 2) ───
{
  const plan = await import(app('plan.js'));
  const { ROUTES } = await import(app('routes.js'));
  // Q31 : une adresse au %-encodage invalide ne fait plus planter le routeur (page blanche).
  let threw = null, m = null;
  try { m = plan.routeMatcher?.(ROUTES)('/app/apps/%E0'); } catch (e) { threw = e; }
  ok(!!plan.routeMatcher && !threw && m?.params?.slug === '%E0', `Q31 : /app/apps/%E0 ne lève pas, la fiche est simplement introuvable (${threw ? threw.name : m?.key})`);
  ok(!/decodeURIComponent\(/.test(main) && typeof plan.safeDecode === 'function' && plan.safeDecode('%E0') === '%E0' && plan.safeDecode('a%20b') === 'a b',
    'Q31 : main.js ne décode plus rien sans protection (ancre, vidéo survolée comprises)');
  // F26 : barre de chargement, puis « connexion perdue » au-delà du délai.
  const lv = plan.loadingView;
  ok(!!lv && plan.LOAD_TIMEOUT_MS === 15000 && lv({ loading: '/app/apps/x', stalled: null, path: '/app/apps/x', screenPath: '/app/apps' }) === 'progress'
    && lv({ loading: '/app/apps/x', stalled: '/app/apps/x', path: '/app/apps/x', screenPath: '/app/apps' }) === 'stalled'
    && lv({ loading: null, stalled: null, path: '/app/apps', screenPath: '/app/apps' }) === null
    && lv({ loading: '/app/a', stalled: '/app/a', path: '/app/b', screenPath: '/app' }) === null,
    'F26 : en cours → barre ; au-delà de 15 s → « connexion perdue » ; rien une fois l\'écran arrivé ou parti ailleurs');
  ok(/loadingView\(/.test(main) && /LOAD_TIMEOUT_MS/.test(main) && /app-progress/.test(main) && /\.app-progress\b[^{]*\{[^}]*animation:[^}]*\.15s/.test(fs.readFileSync(app('app.css'), 'utf8')),
    'F26 : main.js applique la règle ; la barre ne paraît qu\'après 150 ms');
  // F29 : une fiche qui sort du top 3 pendant qu'on la lit ne nous éjecte pas.
  const pv = plan.previewView;
  if (pv) {
    const open = { slug: 'a' }, locked = { locked: true };
    const a1 = { locked: false, open: null };
    const r1 = pv(a1, open), r2 = pv(a1, locked);
    const a2 = { locked: true, open: null };
    const r3 = pv(a2, locked);
    ok(!r1.eject && r2.data === open && !r2.eject && r3.eject, 'F29 : sortie du top 3 en pleine lecture → la dernière valeur reste ; verrouillée dès l\'arrivée → retour à Apps');
  } else ok(false, 'F29 : plan.previewView absente');
  ok(/previewView\(/.test(main), 'F29 : main.js l\'applique');
  // Q38 : l'initiale envoyée aux écrans est un caractère entier.
  ok(/initiale: \(Array\.from\(/.test(main) && !/initiale:[^\n]*charAt\(0\)/.test(main), 'Q38 : l\'initiale de main.js n\'est plus une moitié d\'émoji');
}

end();
