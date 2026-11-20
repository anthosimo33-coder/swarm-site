// Banc des documents que la synchro écrit (convex/radarModels.ts, buildBoards), sur un export inventé
// (scripts/radar-fixture.mjs) : ce que les écrans lisent doit tenir ses promesses (liens qui mènent à une fiche, aperçu…).
// Usage : npm run test:radar   [autre radarModels.ts]
//         REEL=~/dev/swarm-site/.bench-data node scripts/radar.test.mjs   (en plus, compte les problèmes sur l'export réel)
import { h } from 'preact';
import { renderToString } from 'preact-render-to-string';
import { readFileSync } from 'node:fs';
import { boardsOf, fixtureRaw, loadModels, realRaw } from './radar-fixture.mjs';

const models = await loadModels(process.argv[2]);
const DAY = 86_400_000;

/** Chaque règle rend la liste de ses manquements (vide : tenue). */
const RULES = [
  ['apps:top = les premières apps de « apps », et leur nombre (audit F1)', (docs) => {
    const apps = docs.get('apps'), top = docs.get('apps:top'), out = [];
    if (!top) return ['apps:top absent'];
    const n = models.PREVIEW_TOP ?? 3;
    if (JSON.stringify(top.apps.map((a) => a.slug)) !== JSON.stringify(apps.apps.slice(0, n).map((a) => a.slug))) out.push(`top ${top.apps.map((a) => a.slug)} ≠ ${apps.apps.slice(0, n).map((a) => a.slug)}`);
    if (top.total !== apps.apps.length) out.push(`total ${top.total} ≠ ${apps.apps.length}`);
    // Audit S29 : rien d'autre (ni marchés, ni apps par pays, ni niches de la base payante).
    if (Object.keys(top).sort().join() !== 'apps,total,updatedAt') out.push(`champs de apps:top : ${Object.keys(top).join(', ')}`);
    if (JSON.stringify(top).length > 60_000) out.push(`apps:top pèse ${JSON.stringify(top).length} car.`);
    return out;
  }],
  ['Fiche d\'app en aperçu : même rang et même part que pour un compte Pro (audit Q15)', async (docs) => {
    const out = [];
    // Ce que boards.get rend à un compte gratuit pour « apps » (convex/boards.ts, preview) : apps:top, marqué aperçu.
    const free = { ...docs.get('apps:top'), preview: true };
    for (const page of ['FicheApp', 'MFicheApp']) {
      const { default: Page } = await import(`../src/app/pages/${page}.js`);
      for (const a of free.apps) {
        const render = (apps) => {
          const html = renderToString(h(Page, { data: docs.get(`app:${a.slug}`), get: (k) => (k === 'apps' ? apps : docs.get(k) ?? null), saved: () => null, save: async () => {}, params: { slug: a.slug }, query: {}, user: { initiale: 'T' } }));
          const text = html.replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
          return [text.match(/N°\d+ sur \d+ apps (?:de [^0-9]+?|du Radar)(?= )/)?.[0] ?? '(rang absent)', text.match(/Part (?:de sa niche|du Radar) [^ ]+/)?.[0] ?? '(part absente)'].join(' · ');
        };
        const pro = render(docs.get('apps')), apercu = render(free);
        if (pro !== apercu) out.push(`${page} ${a.slug} : Pro « ${pro} », aperçu « ${apercu} »`);
        if (/absent/.test(pro)) out.push(`${page} ${a.slug} : ${pro}`);
      }
    }
    return out;
  }],
  ['Fiche d\'app : pas plus de créateurs que l\'écran n\'en montre (6, FicheA et MFiche ; audit S29)', (docs) => {
    const out = [];
    const shown = Math.min(...['FicheA', 'MFiche'].map((f) => Number(readFileSync(new URL(`../design/app/${f}.dc.html`, import.meta.url), 'utf8').match(/D\.creators(?: \|\| \[\]\))?\.slice\(0, (\d+)\)/)?.[1] ?? 0)));
    if (!shown) out.push('nombre de créateurs montrés introuvable dans FicheA ou MFiche');
    for (const [k, d] of docs) if (/^app:/.test(k) && (d.creators ?? []).length > shown) out.push(`${k} : ${d.creators.length} créateurs pour ${shown} montrés`);
    return out;
  }],
  ['Un format cité par une fiche d\'app ou de créateur a sa fiche, ou est marqué page:false (audit Q22)', (docs) => {
    const out = [];
    for (const [k, d] of docs) {
      if (!/^(app|creator):/.test(k)) continue;
      for (const f of d.formats ?? []) {
        if (f.page !== false && !docs.has(`format:${f.id}`)) out.push(`${k} → format:${f.id}`);
        if (f.page === false && docs.has(`format:${f.id}`)) out.push(`${k} → format:${f.id} marqué sans fiche alors qu'il en a une`);
      }
    }
    return out;
  }],
  ['Une app citée sans fiche (en pause) est marquée page:false, jamais un lien mort (audit Q23)', (docs) => {
    const out = [];
    const check = (k, a) => { if (a && typeof a === 'object' && a.slug && a.page !== false && !docs.has(`app:${a.slug}`)) out.push(`${k} → app:${a.slug}`); };
    for (const [k, d] of docs) {
      if (/^(creator|video):/.test(k)) check(k, d.app);
      if (/^format:/.test(k)) for (const a of d.apps ?? []) check(k, a);
      if (/^creators:/.test(k)) for (const c of d.creators ?? []) check(k, c.app);
      if (k === 'formats' || k === 'alerts') for (const f of d.formats ?? []) for (const a of f.apps ?? []) check(k, a);
      if (k === 'alerts' || k === 'home') for (const v of d.videos ?? []) check(k, v.app);
    }
    return out;
  }],
  ['Créateurs : un compte muet depuis plus de QUIET_DAYS jours ne passe jamais devant un compte actif (audit Q24)', (docs) => {
    const out = [], quiet = (models.QUIET_DAYS ?? 30) * DAY, NOW = 1794780000000;
    for (const [k, d] of docs) {
      if (!/^creators:[A-Z]+$/.test(k)) continue;
      const list = d.creators ?? [];
      const firstActive = list.findIndex((c) => c.lastPostAt && NOW - c.lastPostAt <= quiet);
      const lastQuiet = list.map((c) => !c.lastPostAt || NOW - c.lastPostAt > quiet).lastIndexOf(true);
      const before = list.slice(0, Math.max(0, list.findLastIndex((c) => c.lastPostAt && NOW - c.lastPostAt <= quiet))).filter((c) => !c.lastPostAt || NOW - c.lastPostAt > quiet);
      if (before.length) out.push(`${k} : ${before.length} muets devant des actifs (1er : @${before[0].handle}, rang ${list.indexOf(before[0]) + 1})`);
      void firstActive; void lastQuiet;
    }
    return out;
  }],
  ['Une app fusionnée a sa correspondance ancien slug → nouveau (audit Q25)', (docs, raw) => {
    const out = [];
    const byId = new Map(raw.apps.map((a) => [a.id, a]));
    const canon = (a) => { for (let i = 0; a && a.mergedInto && i < 5; i++) a = byId.get(a.mergedInto) ?? a; return a; };
    const map = Object.fromEntries(docs.get('apps:merged')?.merged ?? []);
    for (const a of raw.apps) {
      if (!a.mergedInto) continue;
      const c = canon(a);
      if (!c || c.mergedInto || c.status !== 'active' || c.slug === a.slug) continue;
      if (map[a.slug] !== c.slug) out.push(`${a.slug} → ${map[a.slug] ?? '(rien)'} au lieu de ${c.slug}`);
    }
    for (const [from, to] of Object.entries(map)) if (!docs.has(`app:${to}`)) out.push(`${from} → ${to}, sans fiche`);
    return out;
  }],
  ['Aucun champ qu\'aucun écran ne lit : igHandle, released, firstSeenAt, home.formats (audit S31, Q66)', (docs) => {
    const out = [];
    const walk = (k, x) => {
      if (Array.isArray(x)) return x.forEach((y) => walk(k, y));
      if (!x || typeof x !== 'object') return;
      for (const f of ['igHandle', 'released', 'firstSeenAt']) if (f in x) out.push(`${k} : ${f}`);
      for (const y of Object.values(x)) walk(k, y);
    };
    for (const [k, d] of docs) walk(k, d);
    if (docs.get('home') && 'formats' in docs.get('home')) out.push('home.formats');
    return [...new Set(out)];
  }],
  ['Bios sans moyen de contact ni pseudo d\'un autre réseau (audit S31)', (docs) => {
    const out = [];
    for (const [k, d] of docs) for (const c of /^creators:/.test(k) ? d.creators ?? [] : /^creator:/.test(k) ? [d] : [])
      if (c.bio && /snap|📍|insta/i.test(c.bio)) out.push(`${k} @${c.handle} : ${c.bio}`);
    return out;
  }],
  ['Lien « voir sur la plateforme » : toujours https vers TikTok ou Instagram (audit S34)', (docs) => {
    const out = [];
    for (const [k, d] of docs) if (/^video:/.test(k) && !/^https:\/\/(www\.)?(tiktok|instagram)\.com\//.test(d.url ?? '')) out.push(`${k} : ${d.url}`);
    return out;
  }],
  ['Vues d\'une app : seulement les vidéos des comptes qui la poussent, actifs et prouvés (audit Q65)', (docs, raw) => {
    const out = [], NOW = 1794780000000;
    const acc = new Map(raw.tracked.map((t) => [t.id, t]));
    const byId = new Map(raw.apps.map((a) => [a.id, a]));
    const canon = (a) => { for (let i = 0; a && a.mergedInto && i < 5; i++) a = byId.get(a.mergedInto) ?? a; return a; };
    const pushes = (id) => { const t = acc.get(id); return t && t.status === 'active' && !(t.proof && t.proof.by === null); };
    for (const a of docs.get('apps')?.apps ?? []) {
      const want = raw.trackedVideos.filter((v) => canon(byId.get(v.appId))?.slug === a.slug && v.cites !== false && pushes(v.accountId) && NOW - v.publishedAt <= 30 * DAY)
        .reduce((n, v) => n + v.views, 0);
      if (want !== a.views30) out.push(`${a.slug} : ${a.views30} vues sur 30 j, ${want} attendues`);
      const fiche = docs.get(`app:${a.slug}`);
      for (const v of [...(a.top ?? []), ...(fiche?.videos ?? [])]) if (!pushes(raw.trackedVideos.find((x) => x.videoId === v.id)?.accountId)) out.push(`${a.slug} : vidéo ${v.id} d'un compte qui ne la pousse pas`);
    }
    return [...new Set(out)];
  }],
];

// Le contrat docs/donnees-app.md nomme chaque champ que la synchro écrit (audit Q47, Q66 : il décrivait des marchés, des
// pages et des seuils qui n'étaient plus ceux du code).
RULES.push(['docs/donnees-app.md nomme chaque champ des documents', (docs) => {
  const doc = readFileSync(new URL('../docs/donnees-app.md', import.meta.url), 'utf8');
  const keys = new Set();
  const walk = (x) => { if (Array.isArray(x)) return x.forEach(walk); if (!x || typeof x !== 'object') return; for (const [k, v] of Object.entries(x)) { keys.add(k); walk(v); } };
  for (const d of docs.values()) walk(d);
  return [...keys].filter((k) => !new RegExp(`\\b${k}\\b`).test(doc)).map((k) => `champ « ${k} » absent du contrat`);
}]);

// Nettoyage des bios (audit S31) : ce qui doit partir, et ce qui doit rester.
const BIOS = [
  ['📧 lea.b@gmail.com | Paris', 'Paris'], ['snap: lea.b | insta @lea_b', null], ['linktr.ee/leab 💕', '💕'], ['contact: lea (at) gmail (dot) com', null],
  ['lea at gmail dot com', null], ['lea @ gmail.com', null], ['👻 leab', null], ['📍Paris, France · 22 ans', null], ['19 y/o | fitness', 'fitness'],
  ['wa.me/33612345678', null], ['IG: @lea.fit', null], ['Appelle +33 6 12 34 56 78', 'Appelle'], ['https://beacons.ai/lea 🔗 collab', '🔗 collab'],
  ['business: lea[at]gmail[dot]com', null], ['Snapchat → lea.b\nTikTok France 🇫🇷', 'TikTok France 🇫🇷'],
  // Restent : la mention de l'app, les âges qui n'en sont pas, les mots ordinaires, un code promo, les puces.
  ['Ambassadrice @fitai ✨', 'Ambassadrice @fitai ✨'], ['Prof depuis 22 ans', 'Prof depuis 22 ans'], ['22 ans d\'expérience', '22 ans d\'expérience'],
  ['Big fan of Paris', 'Big fan of Paris'], ['Code promo LEA10', 'Code promo LEA10'], ['• currículo • entrevistas', '• currículo • entrevistas'],
  ['Noise app 📍\nSide hustle', 'Noise app\nSide hustle'],
];
const bioFails = BIOS.filter(([inp, want]) => models.cleanBio(inp) !== want);
console.log(`${bioFails.length ? 'ÉCHEC' : 'OK   '} Nettoyage des bios (audit S31)${bioFails.length ? ` : ${bioFails.length} — ${bioFails.slice(0, 4).map(([i, w]) => `${JSON.stringify(i)} → ${JSON.stringify(models.cleanBio(i))} au lieu de ${JSON.stringify(w)}`).join(' ; ')}` : ''}`);

let fail = bioFails.length ? 1 : 0;
const run = async (label, docs, strict, raw) => {
  console.log(`── ${label} : ${docs.size} pages`);
  for (const [name, rule] of RULES) {
    const bad = await rule(docs, raw);
    const okk = !bad.length;
    console.log(`${okk ? 'OK   ' : strict ? 'ÉCHEC' : 'RELEVÉ'} ${name}${okk ? '' : ` : ${bad.length} — ${bad.slice(0, 4).join(' ; ')}`}`);
    if (!okk && strict) fail++;
  }
};
const fixture = fixtureRaw();
await run('export inventé', boardsOf(models, fixture), true, fixture);

// Audit Q63 (19/11) : la synchro de prod passe par groupes d'apps puis une étape globale (convex/radarSync.ts) ; le
// calcul « tout d'un coup » est la référence. Leur équivalence ne tenait qu'à scripts/sync-bench/parts.mjs, lancé à la
// main sur les données du dev. La même contre-épreuve tourne ici sur l'export inventé, à chaque vérification : mêmes
// pages, même contenu, aucune page en double, mêmes files de travail, mêmes images demandées et citées.
{
  const { syncOpts: so, NOW: T } = await import('./radar-fixture.mjs');
  const st = so();
  const opts = (part) => ({ coverUrl: (id) => (models.COVER_ID.test(id) ? `${st.site}/cover/${id}` : null), ...st.opts, part });
  const hash = (d) => { const { updatedAt, ...rest } = d ?? {}; return JSON.stringify(rest); };
  const pagesOf = (raw, part) => {
    const res = models.buildBoards(raw, T, (k) => (k.startsWith('icon:') ? `https://img.example/${k}.png` : null), () => null, opts(part));
    const got = new Map([...res.boards].map(([k, d]) => [k, hash(d)]));
    for (const [k, f] of res.lazy) got.set(k, hash(f()));
    const l = res.laterTodos();
    return { got, res, need: [...res.need.keys()], used: [...res.used],
      todos: [res.regionTodo.length, res.genderTodo.length, res.langTodo.length, l.slideTodo.length, l.videoAiTodo.length] };
  };
  const mono = pagesOf(fixture, undefined);
  const byId = new Map(fixture.apps.map((a) => [a.id, a]));
  const canon = (id) => { let a = byId.get(id); for (let i = 0; a && a.mergedInto && i < 5; i++) a = byId.get(a.mergedInto) ?? a; return a?.id ?? ''; };
  const ids = [...new Set(fixture.apps.map((a) => canon(a.id)))];
  const groups = [ids.filter((_, i) => i % 3 === 0), ids.filter((_, i) => i % 3 === 1), ids.filter((_, i) => i % 3 === 2)];
  const all = new Map(), outs = [], need = new Set(), used = new Set(), todos = [0, 0, 0, 0, 0], dup = [];
  const take = (p) => {
    for (const [k, h] of p.got) { if (all.has(k)) dup.push(k); all.set(k, h); }
    p.need.forEach((k) => need.add(k)); p.used.forEach((k) => used.add(k)); p.todos.forEach((n, i) => (todos[i] += n));
  };
  for (const g of groups) {
    const set = new Set(g);
    const p = pagesOf({ ...fixture, trackedVideos: fixture.trackedVideos.filter((v) => set.has(canon(v.appId))) }, { kind: 'group', apps: set });
    outs.push(JSON.parse(JSON.stringify(p.res.out))); // comme en vrai : transmis en texte
    take(p);
  }
  take(pagesOf({ ...fixture, trackedVideos: [] }, { kind: 'global', outs }));
  const diff = [...mono.got].filter(([k, h]) => all.has(k) && all.get(k) !== h).map(([k]) => k);
  const missing = [...mono.got.keys()].filter((k) => !all.has(k)), extra = [...all.keys()].filter((k) => !mono.got.has(k));
  const sameSet = (a, b) => a.size === b.size && [...a].every((x) => b.has(x));
  const bad = [
    ...(diff.length ? [`${diff.length} pages différentes (${diff.slice(0, 3).join(' ')})`] : []),
    ...(missing.length ? [`${missing.length} manquantes (${missing.slice(0, 3).join(' ')})`] : []),
    ...(extra.length ? [`${extra.length} en trop (${extra.slice(0, 3).join(' ')})`] : []),
    ...(dup.length ? [`${dup.length} produites deux fois (${dup.slice(0, 3).join(' ')})`] : []),
    ...(todos.join() !== mono.todos.join() ? [`files ${todos} au lieu de ${mono.todos}`] : []),
    ...(!sameSet(need, new Set(mono.need)) ? ['images demandées différentes'] : []),
    ...(!sameSet(used, new Set(mono.used)) ? ['images citées différentes'] : []),
  ];
  console.log(`${bad.length ? 'ÉCHEC' : 'OK   '} Groupes + étape globale = tout d'un coup (audit Q63 : ${mono.got.size} pages, ${groups.length} groupes)${bad.length ? ' : ' + bad.join(' ; ') : ''}`);
  if (bad.length) fail++;
}
if (process.env.REEL) {
  const { raw, store } = realRaw(process.env.REEL.replace(/^~/, process.env.HOME));
  await run(`export réel (${process.env.REEL})`, boardsOf(models, raw, store), false, raw);
}
console.log(fail ? `${fail} échec(s)` : 'tout passe');
process.exit(fail ? 1 : 0);
