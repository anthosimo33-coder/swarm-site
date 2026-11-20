// Audit S22 (19/11) : quota de pages des abonnés. Un compte Pro lisait toute la base (141 366 pages en prod le 20/11) en
// demandant les clés une par une à boards.get, sans limite. Désormais une page ne se lit qu'avec un laissez-passer
// délivré par la mutation boards.passes, qui compte les pages : 300 par heure, 1 500 par 24 h (décision du 20/11), puis
// refus jusqu'à la fin de la fenêtre. La lecture (requête réactive) ne lit ni n'écrit le compteur.
// Partie serveur : convex/boards.ts empaqueté (Convex remplacé), base en mémoire. Partie app : src/app/passes.js et
// src/app/watcher.js avec un faux client Convex.
// Usage : npm run test:quota
import fs from 'node:fs';
import path from 'node:path';
import { checker, load, memDb, root } from './test-kit.mjs';

const { ok, end } = checker();
process.env.COVER_SECRET = 'secret-de-banc';
process.env.CONVEX_SITE_URL = 'https://x.convex.site';
const SESSION = [/\.\/session$/, 'export const liveUserId = async (ctx) => ctx.userId ?? null;'];
const boards = await load(path.join(root, 'convex/boards.ts'), [SESSION]);
const quota = fs.existsSync(path.join(root, 'convex/boardQuota.ts')) ? await load(path.join(root, 'convex/boardQuota.ts')) : {};
const HOUR = 3_600_000, DAY = 24 * HOUR;
const MAX_H = quota.PAGE_QUOTA?.hour, MAX_D = quota.PAGE_QUOTA?.day, BATCH = quota.PASS_BATCH;

ok(typeof boards.passes?.handler === 'function', 'boards.passes : la mutation qui délivre les laissez-passer existe');
ok(MAX_H === 300 && MAX_D === 1500, `quota décidé le 20/11 : 300 pages par heure, 1 500 par 24 h (${MAX_H}, ${MAX_D})`);
ok(quota.PASS_MS === 2 * HOUR, `laissez-passer valable 2 h : une page relue dans ce délai ne compte pas (${quota.PASS_MS})`);
ok(BATCH >= 30 && BATCH <= 100, `laissez-passer demandés par lots (${BATCH} clés au plus par appel)`);

if (typeof boards.passes?.handler === 'function' && MAX_H && MAX_D && BATCH) {
  // ─── La base : trois abonnés, un compte gratuit, quelques pages ───
  let T = Date.UTC(2026, 10, 20, 9, 0, 0);
  const realNow = Date.now;
  Date.now = () => T;
  const m = memDb();
  const users = {};
  for (const [name, row] of Object.entries({ pro: { pro: true }, pro2: { pro: true }, pro3: { pro: true }, pro4: { pro: true }, pro5: { pro: true }, free: {} }))
    users[name] = await m.db.insert('users', { email: `${name}@exemple.fr`, ...row });
  const apps = Array.from({ length: 5 }, (_, i) => ({ slug: `app-${i}`, name: `App ${i}`, views30: 100 - i, top: [] }));
  for (const [key, data] of Object.entries({
    apps: { updatedAt: 1, apps }, 'apps:top': { updatedAt: 1, apps: apps.slice(0, 3), total: 5 }, stats: { apps: 5, accounts: 9 },
    'app:app-0': { slug: 'app-0', name: 'App 0' }, 'app:app-4': { slug: 'app-4', name: 'App 4' }, 'creator:x': { handle: 'x', fans: 1 },
  })) await m.db.insert('boards', { key, data, hash: 'h', updatedAt: 1 });
  // Les écritures en base, comptées après la mise en place.
  let writes = 0;
  for (const op of ['insert', 'patch', 'replace', 'delete']) { const f = m.db[op]; m.db[op] = (...a) => { writes++; return f(...a); }; }
  const warns = [];
  const warn = console.warn;
  console.warn = (...a) => warns.push(a.join(' '));

  const ctx = (u) => ({ db: m.db, userId: users[u] ?? null });
  const get = (u, key, pass) => boards.get.handler(ctx(u), pass === undefined ? { key } : { key, pass }).then((r) => r, (e) => ({ __error: e }));
  const take = (u, keys) => boards.passes.handler(ctx(u), { keys });
  const passErr = (r) => r?.__error?.data?.code === 'LAISSEZ_PASSER';
  const keys = (prefix, n, from = 0) => Array.from({ length: n }, (_, i) => `${prefix}${from + i}`);

  // ─── La lecture : jamais sans laissez-passer, jamais d'écriture, jamais le compteur ───
  {
    const before = m.read.boards ?? 0;
    const r = await get('pro', 'app:app-4');
    ok(passErr(r), `Pro sans laissez-passer : refus LAISSEZ_PASSER (${r?.__error?.data?.code ?? JSON.stringify(r)?.slice(0, 60)})`);
    ok((m.read.boards ?? 0) === before, 'Pro sans laissez-passer : aucune page lue');
    const s = await get('pro', 'stats');
    ok(s?.apps === 5, 'stats (chiffres publics) : lisible sans laissez-passer');
  }
  {
    writes = 0;
    const r = await take('pro', ['apps', 'app:app-4', 'app:app-4', 'stats']);
    ok(r && Object.keys(r.passes ?? {}).sort().join() === 'app:app-4,apps', `un laissez-passer par clé distincte, aucun pour stats (${Object.keys(r?.passes ?? {}).join(', ')})`);
    ok(Array.isArray(r?.refused) && r.refused.length === 0 && r.until === null, 'sous le quota : rien de refusé');
    ok(typeof r?.exp === 'number' && r.exp === T + quota.PASS_MS, `échéance des laissez-passer rendue à l'app (${r?.exp - T} ms)`);
    ok(writes === 1, `un lot de laissez-passer = une seule écriture (${writes})`);
    const p = r?.passes?.['app:app-4'];
    ok((await get('pro', 'app:app-4', p))?.slug === 'app-4', 'Pro avec son laissez-passer : la page est servie');
    ok((await get('pro', 'apps', r?.passes?.apps))?.apps?.length === 5, 'Pro avec son laissez-passer : la liste complète');
    ok(passErr(await get('pro', 'app:app-0', p)), 'laissez-passer d\'une autre page : refusé');
    ok(passErr(await get('pro2', 'app:app-4', p)), 'laissez-passer d\'un autre compte : refusé');
    const flip = p ? p.slice(0, -1) + (p.endsWith('0') ? '1' : '0') : 'x';
    ok(passErr(await get('pro', 'app:app-4', flip)), 'laissez-passer retouché : refusé');
    const exp = p ? parseInt(p.split('.')[0], 36) : 0;
    const longer = p ? (exp + DAY).toString(36) + p.slice(p.indexOf('.')) : 'x';
    ok(passErr(await get('pro', 'app:app-4', longer)), 'échéance rallongée à la main : refusé');
    const far = quota.passFor(users.pro, 'app:app-4', T + DAY);
    ok(far && passErr(await get('pro', 'app:app-4', far)), 'laissez-passer bien signé mais plus long que PASS_MS (délivré avant une baisse de la durée) : refusé');
    let crash = null;
    for (const bad of ['', 'x', '.', '123.', 'zz.zz', '9'.repeat(400)]) { const g = await get('pro', 'app:app-4', bad); if (!passErr(g)) crash = `${JSON.stringify(bad).slice(0, 20)} → ${String(g?.__error ?? JSON.stringify(g)).slice(0, 60)}`; }
    ok(!crash, `laissez-passer mal formé : refus propre${crash ? ` (${crash})` : ''}`);
    T += quota.PASS_MS - 1000;
    ok((await get('pro', 'app:app-4', p))?.slug === 'app-4', 'laissez-passer encore valable juste avant son échéance');
    T += 2000;
    ok(passErr(await get('pro', 'app:app-4', p)), 'laissez-passer échu : refusé (l\'app en redemande un)');
    T -= quota.PASS_MS + 1000;
  }
  {
    // La requête réactive ne touche jamais au compteur : sinon chaque page ouverte relancerait toutes celles déjà
    // ouvertes par la personne (et les relirait en entier).
    const r = await take('pro2', ['app:app-0', 'creator:x']);
    const q0 = m.read.pageQuota ?? 0;
    writes = 0;
    for (let i = 0; i < 20; i++) { await get('pro2', 'app:app-0', r.passes['app:app-0']); await get('pro2', 'creator:x'); await get('pro2', 'stats'); }
    ok(writes === 0, `boards.get n'écrit jamais (${writes} écriture(s))`);
    ok((m.read.pageQuota ?? 0) === q0, 'boards.get ne lit pas le compteur (pas de relance des pages ouvertes)');
  }

  // ─── Le compte gratuit : l'aperçu, inchangé ; aucun laissez-passer, aucune écriture ───
  {
    writes = 0;
    const r = await take('free', ['app:app-4', 'apps']);
    ok(r && Object.keys(r.passes ?? {}).length === 0 && writes === 0, `compte gratuit : aucun laissez-passer, rien d'écrit (${Object.keys(r?.passes ?? {}).length}, ${writes})`);
    const a = await get('free', 'apps');
    ok(a?.preview === true && a.apps.length === 3, 'compte gratuit : l\'aperçu sans laissez-passer, comme avant');
    ok((await get('free', 'app:app-4'))?.locked === true, 'compte gratuit : fiche hors du top 3 toujours verrouillée');
    ok((await take(null, ['apps']))?.passes && Object.keys((await take(null, ['apps'])).passes).length === 0, 'pas connecté : aucun laissez-passer');
  }

  // ─── Le quota : 300 par heure, 1 500 par 24 h ───
  {
    const T0 = T;
    writes = 0;
    let granted = 0, lots = 0;
    for (let i = 0; i < MAX_H; i += BATCH) { const r = await take('pro3', keys('video:', Math.min(BATCH, MAX_H - i), i)); granted += Object.keys(r.passes).length; lots++; }
    ok(granted === MAX_H, `${MAX_H} pages dans l'heure : toutes ouvertes (${granted})`);
    ok(writes === lots, `une écriture par lot, pas par page (${writes} écritures pour ${lots} lots)`);
    ok(m.rows('pageQuota').filter((r) => r.userId === users.pro3).length === 1, 'une seule ligne de compteur par compte');
    warns.length = 0;
    writes = 0;
    const r = await take('pro3', keys('video:', 5, 10_000));
    ok(Object.keys(r.passes).length === 0 && r.refused.length === 5, `${MAX_H + 1}e page de l'heure : refusée (${r.refused.length} refusées)`);
    ok(r.until === T0 + HOUR, `refus jusqu'à la fin de la fenêtre d'une heure (${(r.until - T0) / 60_000} min)`);
    ok(r.at === T, `l'heure du serveur rendue avec le refus (${r.at === T})`);
    ok(warns.length === 1 && /quota/i.test(warns[0]) && warns[0].includes(String(users.pro3)), `trace dans les journaux Convex, avec le compte (${warns[0]?.slice(0, 120)})`);
    T += 20 * 60_000;
    const again = await take('pro3', ['video:20000']);
    ok(again.refused.length === 1 && again.until === T0 + HOUR, '20 min plus tard : toujours refusé, même échéance');
    ok(warns.length === 1, 'une seule trace par fenêtre (pas une par refus)');
    ok(writes <= 1, `un refus ne compte pas : au plus une écriture pour la trace (${writes})`);
    // Le passe-droit des anciens laissez-passer : ce qui a été ouvert reste lisible.
    T = T0 + HOUR;
    const next = await take('pro3', keys('video:', BATCH, 30_000));
    ok(Object.keys(next.passes).length === BATCH, 'l\'heure suivante : de nouveau ouvert');
    // 24 h : 1 500 pages au plus, quelle que soit l'heure.
    let total = MAX_H + BATCH, refusedAt = null, until = null;
    for (let h = 1; h < 8 && refusedAt === null; h++) {
      T = T0 + h * HOUR;
      for (let i = h === 1 ? BATCH : 0; i < MAX_H; i += BATCH) {
        const x = await take('pro3', keys(`h${h}:`, Math.min(BATCH, MAX_H - i), i));
        total += Object.keys(x.passes).length;
        if (x.refused.length && refusedAt === null) { refusedAt = h; until = x.until; break; }
      }
    }
    ok(total === MAX_D, `${MAX_D} pages sur 24 h au plus (${total})`);
    ok(refusedAt === MAX_D / MAX_H && until === T0 + DAY, `au-delà, refus jusqu'à la fin des 24 h (${refusedAt} h, reprise à +${until && (until - T0) / HOUR} h)`);
    T = T0 + DAY;
    ok(Object.keys((await take('pro3', ['jour2:1'])).passes).length === 1, '24 h après la première page : de nouveau ouvert');
    T = T0;
  }
  {
    // Un lot qui déborde : servi jusqu'au plafond, le reste refusé.
    for (let i = 0; i < MAX_H - 10; i += BATCH) await take('pro4', keys('v:', Math.min(BATCH, MAX_H - 10 - i), i));
    const r = await take('pro4', keys('w:', 20));
    ok(Object.keys(r.passes).length === 10 && r.refused.length === 10 && r.refused[0] === 'w:10', `lot qui déborde : 10 ouvertes, 10 refusées (${Object.keys(r.passes).length}, ${r.refused.length})`);
    // Trop de clés d'un coup, clés vides ou démesurées : jamais plus d'un lot compté.
    const big = await take('pro5', keys('x:', BATCH + 40));
    const row = m.rows('pageQuota').find((x) => x.userId === users.pro5);
    ok(Object.keys(big.passes).length === BATCH && row?.hourN === BATCH, `${BATCH + 40} clés d'un coup : ${BATCH} au plus (${Object.keys(big.passes).length}, compteur ${row?.hourN})`);
    const odd = await take('pro5', ['', 'k'.repeat(500), 'creator:x']);
    ok(Object.keys(odd.passes).join() === 'creator:x', `clé vide ou démesurée : ni laissez-passer ni compte (${Object.keys(odd.passes).join()})`);
  }
  console.warn = warn;
  Date.now = realNow;

  // L'effacement d'un compte emporte son compteur (convex/users.ts, eraseAccount).
  const users_ts = fs.readFileSync(path.join(root, 'convex/users.ts'), 'utf8');
  ok(/query\("pageQuota"\)[\s\S]{0,200}delete/.test(users_ts.slice(users_ts.indexOf('eraseAccount'))), 'compte effacé : sa ligne de compteur aussi (users.eraseAccount)');
}

// ─── L'app : les laissez-passer demandés par lots, gardés, renouvelés ; le refus expliqué ───
{
  const app = (f) => path.join(root, 'src/app', f);
  const has = fs.existsSync(app('passes.js'));
  ok(has, 'src/app/passes.js : les laissez-passer côté app');
  if (has) {
    const { createWatcher } = await import(app('watcher.js'));
    const { createBoards, untilText, PASS_ERROR } = await import(app('passes.js'));
    let t = Date.UTC(2026, 10, 20, 13, 0, 0);
    const calls = [], subs = [], timers = [];
    let serve = (keys) => ({ passes: Object.fromEntries(keys.map((k) => [k, `P-${k}`])), exp: t + 2 * HOUR, refused: [], until: null });
    const failing = new Set(); // clés dont l'abonnement répond « laissez-passer requis »
    const client = {
      mutation: (fn, args) => { calls.push({ fn, keys: args.keys }); const r = serve(args.keys); return r instanceof Error ? Promise.reject(r) : Promise.resolve(r); },
      watchQuery: (fn, args) => {
        const sub = { fn, args, cb: null, stopped: false };
        subs.push(sub);
        return {
          localQueryResult: () => { if (failing.has(args.key)) { const e = new Error('laissez-passer'); e.data = { code: PASS_ERROR }; throw e; } return { key: args.key, pass: args.pass ?? null }; },
          onUpdate: (cb) => { sub.cb = cb; return () => { sub.stopped = true; }; },
        };
      },
    };
    const tick = () => new Promise((r) => setTimeout(r, 0));
    let pro = true;
    const watcher = createWatcher(client, { now: () => t });
    const { board } = createBoards({ client, watcher, get: 'boards.get', passes: 'boards.passes', isPro: () => pro, now: () => t, later: (f, ms) => timers.push({ f, at: t + ms }) });
    const live = (key) => subs.filter((s) => s.args.key === key && !s.stopped);

    const a = board('app:a'); board('app:b'); const st = board('stats');
    ok(a.value === undefined, 'nouvelle page : en attente de son laissez-passer');
    ok(st.value?.key === 'stats' && live('stats')[0]?.args.pass === undefined, 'stats : ouvert tout de suite, sans laissez-passer');
    await tick();
    ok(calls.length === 1 && calls[0].keys.join() === 'app:a,app:b', `les pages demandées ensemble partent en un seul appel (${calls.map((c) => c.keys.join('+')).join(' | ')})`);
    ok(live('app:a').length === 1 && live('app:a')[0].args.pass === 'P-app:a' && a.value?.pass === 'P-app:a', 'laissez-passer reçu : la page s\'ouvre avec lui');
    board('app:a'); board('app:b');
    await tick();
    ok(calls.length === 1 && live('app:a').length === 1, 'page déjà ouverte : ni nouveau laissez-passer ni nouvel abonnement');
    // Page refermée (le watcher la balaie), puis rouverte dans les 2 h : son laissez-passer resert, rien n'est recompté.
    a.listeners.add(() => {}); // l'écran affiché lit app:a
    t += 61_000;
    watcher.sweep();
    ok(!watcher.entries.has('board:app:b') && live('app:b').length === 0, 'page quittée depuis 60 s : abonnement fermé');
    const b2 = board('app:b');
    await tick();
    ok(calls.length === 1 && live('app:b').length === 1 && b2.value?.pass === 'P-app:b', 'page rouverte : son laissez-passer resert, sans nouvel appel');

    // Beaucoup de pages d'un coup (Créateurs, tous pays) : plusieurs lots.
    for (let i = 0; i < 70; i++) board(`creators:ALL:${i + 2}`);
    await tick();
    ok(calls.length === 3 && calls[1].keys.length <= 60 && calls[1].keys.length + calls[2].keys.length === 70, `70 pages d'un coup : découpées en lots (${calls.slice(1).map((c) => c.keys.length).join(' + ')})`);

    // Laissez-passer échu (la requête est relancée après son échéance) : renouvelé, la page garde sa valeur d'ici là.
    const before = a.value;
    failing.add('app:a');
    live('app:a')[0].cb();
    ok(a.value === before, 'laissez-passer échu : la page garde sa dernière valeur');
    failing.delete('app:a');
    serve = (keys) => ({ passes: Object.fromEntries(keys.map((k) => [k, `Q-${k}`])), exp: t + 2 * HOUR, refused: [], until: null });
    await tick();
    ok(calls.at(-1).keys.join() === 'app:a' && live('app:a').length === 1 && live('app:a')[0].args.pass === 'Q-app:a', 'laissez-passer échu : un nouveau est demandé et l\'abonnement repart avec lui');

    // Quota atteint : la page dit quand elle rouvre, sans redemander au serveur d'ici là.
    const U = t + 37 * 60_000;
    serve = (keys) => ({ passes: {}, exp: t + 2 * HOUR, refused: keys, until: U });
    let heard = 0;
    const z = board('app:z');
    z.listeners.add(() => heard++);
    await tick();
    ok(z.value === null && z.quota === U && heard > 0, `quota atteint : page absente, échéance connue (${z.quota === U}), écran prévenu`);
    ok(live('app:z').length === 0, 'quota atteint : aucun abonnement ouvert');
    const n = calls.length;
    const y = board('app:y');
    await tick();
    ok(calls.length === n && y.value === null && y.quota === U, 'pendant le refus : les nouvelles pages attendent sans appeler le serveur');
    ok(a.value?.pass === 'Q-app:a', 'pendant le refus : les pages déjà ouvertes restent lisibles');
    failing.add('app:a');
    live('app:a')[0].cb();
    failing.delete('app:a');
    await tick();
    ok(calls.length === n && a.value?.pass === 'Q-app:a' && a.quota === U, 'pendant le refus, une page ouverte dont le laissez-passer échoit : gardée telle quelle, sans appel');
    serve = (keys) => ({ passes: Object.fromEntries(keys.map((k) => [k, `R-${k}`])), exp: t + 2 * HOUR, refused: [], until: null });
    t = U + 1000;
    timers.splice(0).filter((x) => x.at <= t).forEach((x) => x.f());
    await tick();
    ok(z.value?.pass === 'R-app:z' && y.value?.pass === 'R-app:y' && !z.quota, 'fin du refus : les pages en attente s\'ouvrent d\'elles-mêmes');
    ok(a.value?.pass === 'R-app:a' && !a.quota && live('app:a').length === 1, 'fin du refus : la page ouverte au laissez-passer échu repart avec un nouveau');

    // Horloge de l'app en avance de 10 min sur le serveur : l'échéance suit le délai annoncé, pas l'heure du serveur.
    const SA = t - 10 * 60_000, SU = SA + 15 * 60_000;
    serve = (keys) => ({ passes: {}, exp: SA + 2 * HOUR, refused: keys, until: SU, at: SA });
    const s1 = board('app:skew');
    await tick();
    ok(s1.quota === t + 15 * 60_000, `horloge décalée : reprise dans 15 min sur l'horloge de l'app (${(s1.quota - t) / 60_000} min)`);
    const due = timers.filter((x) => x.at <= t + 15 * 60_000 + 1000);
    ok(timers.length === 1 && due.length === 1, `horloge décalée : un seul nouvel essai, à l'échéance (${timers.length} minuterie(s))`);
    serve = (keys) => ({ passes: Object.fromEntries(keys.map((k) => [k, `S-${k}`])), exp: t + 2 * HOUR, refused: [], until: null });
    t += 15 * 60_000 + 1000;
    timers.splice(0).forEach((x) => x.f());
    await tick();
    ok(s1.value?.pass === 'S-app:skew' && !s1.quota, 'horloge décalée : la page s\'ouvre à l\'échéance');

    // Compte gratuit : pas de laissez-passer (l'aperçu n'en demande pas).
    pro = false;
    const c0 = calls.length;
    const f = board('app:free');
    await tick();
    ok(calls.length === c0 && live('app:free')[0]?.args.pass === undefined && f.value?.key === 'app:free', 'compte gratuit : abonnement direct, sans laissez-passer');
    // Devenu Pro en cours de route : le serveur répond « laissez-passer requis », l'app en demande un.
    pro = true;
    failing.add('app:free');
    live('app:free')[0].cb();
    failing.delete('app:free');
    await tick();
    ok(calls.at(-1)?.keys.join() === 'app:free' && live('app:free')[0]?.args.pass === 'S-app:free', 'devenu Pro : laissez-passer demandé, abonnement repris avec lui');

    // Serveur pas encore à jour (déploiement de l'app avant celui de Convex) : lecture sans laissez-passer, sans boucle.
    serve = () => new Error('Could not find public function for \'boards:passes\'');
    const o = board('app:old');
    await tick();
    ok(live('app:old')[0]?.args.pass === undefined && o.value?.key === 'app:old', 'mutation absente (ancien serveur) : la page s\'ouvre sans laissez-passer');
    const c1 = calls.length;
    board('app:old2');
    await tick();
    ok(calls.length === c1 && live('app:old2').length === 1, 'mutation absente : pas de nouvel essai à chaque page (30 s)');

    // L'heure de reprise, à l'heure de Paris.
    const now = Date.UTC(2026, 10, 20, 13, 5); // 14 h 05 à Paris
    ok(untilText(Date.UTC(2026, 10, 20, 14, 37), now) === 'à 15 h 37', `reprise le jour même (${untilText(Date.UTC(2026, 10, 20, 14, 37), now)})`);
    ok(untilText(Date.UTC(2026, 10, 21, 8, 12), now) === 'demain à 09 h 12', `reprise le lendemain (${untilText(Date.UTC(2026, 10, 21, 8, 12), now)})`);

    const main = fs.readFileSync(app('main.js'), 'utf8');
    ok(/createBoards\(/.test(main) && /api\.boards\.passes/.test(main), 'src/app/main.js passe par les laissez-passer (createBoards, boards.passes)');
    ok(/function Quota\(/.test(main) && /untilText\(/.test(main) && /\.quota\b/.test(main), 'src/app/main.js : un écran refusé dit quand les nouvelles pages rouvrent (Quota)');
  }
}
end();
