// Constats « moyenne » de l'audit du 19/11 sur l'app (src/app/main.js et ses modules) : une section par constat.
// Les modules de l'app sans DOM (watcher.js, plan.js, scroll.js) avec de faux client, fenêtre et historique ; le build
// pour ce que l'entrée embarque. Le comportement dans le navigateur est vérifié à part (rapport).
// Usage : node scripts/app.test.mjs
import fs from 'node:fs';
import path from 'node:path';
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

end();
