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
  ['Aucun champ qu\'aucun écran ne lit : igHandle, released, firstSeenAt (audit S31, Q66)', (docs) => {
    const out = [];
    const walk = (k, x) => {
      if (Array.isArray(x)) return x.forEach((y) => walk(k, y));
      if (!x || typeof x !== 'object') return;
      for (const f of ['igHandle', 'released', 'firstSeenAt']) if (f in x) out.push(`${k} : ${f}`);
      for (const y of Object.values(x)) walk(k, y);
    };
    for (const [k, d] of docs) walk(k, d);
    // home.formats est lu par l'accueil (Main, le fil) depuis la maquette A3 du 20/11 ; avant, par aucun écran (Q66).
    const main = readFileSync(new URL('../design/app/Main.dc.html', import.meta.url), 'utf8');
    for (const f of ['formats', 'creators']) if (docs.get('home') && f in docs.get('home') && !new RegExp(`D\\.${f}\\b`).test(main)) out.push(`home.${f} : Main ne le lit pas`);
    return [...new Set(out)];
  }],
  ['Accueil, le fil (maquette A3) : un document petit, des lignes qui mènent à une fiche, le critère tenu', (docs) => {
    const out = [], home = docs.get('home'), NOW = 1794780000000;
    if (!home) return ['home absent'];
    const size = JSON.stringify(home).length;
    if (size > 20_000) out.push(`home pèse ${size} car.`);
    // Apps : la ligne « Une app accélère » reprend les chiffres de la liste des apps.
    const list = new Map((docs.get('apps')?.apps ?? []).map((a) => [a.slug, a]));
    for (const a of home.apps ?? []) {
      const r = list.get(a.slug);
      if (!r) { out.push(`home.apps : ${a.slug} absent de « apps »`); continue; }
      for (const f of ['views7', 'weekDelta', 'accounts', 'videoCount']) if (a[f] !== r[f]) out.push(`home.apps ${a.slug}.${f} = ${a[f]}, « apps » : ${r[f]}`);
      if (JSON.stringify(a.weeks) !== JSON.stringify(r.weeks) || (a.weeks ?? []).length !== 6) out.push(`home.apps ${a.slug}.weeks ≠ « apps »`);
    }
    // Formats : les premiers de « formats » repris dans les 7 derniers jours, une seule reprise, chacun avec sa fiche.
    const n = models.HOME_FORMATS ?? 3;
    const want = (docs.get('formats')?.formats ?? []).filter((f) => NOW - f.lastPostAt <= 7 * DAY).slice(0, n).map((f) => f.id);
    if (JSON.stringify((home.formats ?? []).map((f) => f.id)) !== JSON.stringify(want)) out.push(`home.formats ${(home.formats ?? []).map((f) => f.id)} ≠ ${want}`);
    if (!(home.formats ?? []).length) out.push('home.formats vide sur le banc');
    for (const f of home.formats ?? []) {
      if (!docs.has(`format:${f.id}`)) out.push(`home.formats → format:${f.id} sans fiche`);
      if ((f.members ?? []).length !== 1) out.push(`home.formats ${f.id} : ${(f.members ?? []).length} reprises`);
      for (const m of f.members ?? []) if (!docs.has(`video:${m.videoId}`)) out.push(`home.formats ${f.id} → video:${m.videoId} sans page`);
      if ('apps' in f) out.push(`home.formats ${f.id} porte ses apps`);
    }
    // Créateurs : ceux qui publient le plus sur 7 jours (dernière vidéo dans les 7 jours), avec fiche, app et vignettes.
    const nc = models.HOME_CREATORS ?? 3;
    const all = (docs.get('creators:ALL')?.creators ?? []).filter((c) => c.posts7d > 0 && c.app && c.lastPostAt !== null && NOW - c.lastPostAt <= 7 * DAY)
      .sort((p, q) => q.posts7d - p.posts7d || (q.median ?? 0) - (p.median ?? 0)).slice(0, nc).map((c) => c.handle);
    if (JSON.stringify((home.creators ?? []).map((c) => c.handle)) !== JSON.stringify(all)) out.push(`home.creators ${(home.creators ?? []).map((c) => c.handle)} ≠ ${all}`);
    if (!(home.creators ?? []).length) out.push('home.creators vide sur le banc');
    for (const c of home.creators ?? []) {
      if (!docs.has(`creator:${c.handle}`)) out.push(`home.creators → creator:${c.handle} sans fiche`);
      if (!c.app || (c.app.page !== false && !docs.has(`app:${c.app.slug}`))) out.push(`home.creators ${c.handle} : app sans fiche`);
      if ((c.best ?? []).length > 3) out.push(`home.creators ${c.handle} : ${c.best.length} vignettes`);
      for (const v of c.best ?? []) if (!docs.has(`video:${v.id}`)) out.push(`home.creators ${c.handle} → video:${v.id} sans page`);
    }
    // La vidéo du jour : la niche de son app.
    for (const v of home.videos ?? []) if (v.app && typeof v.app.niche !== 'string') out.push(`home.videos ${v.id} : app sans niche`);
    return out;
  }],
  ['Bios sans moyen de contact ni pseudo d\'un autre réseau (audit S31)', (docs) => {
    const out = [];
    for (const [k, d] of docs) for (const c of /^creators:/.test(k) ? d.creators ?? [] : /^creator:/.test(k) ? [d] : [])
      if (c.bio && /snap|📍|insta/i.test(c.bio)) out.push(`${k} @${c.handle} : ${c.bio}`);
    return out;
  }],
  ['Rythme d\'un créateur : days7 = ses vidéos suivies par jour de Paris, 7 jours, aujourd\'hui en dernier (maquette E1)', (docs, raw) => {
    const out = [], NOW = 1794780000000;
    const pDay = (t) => { const p = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(t)); return Date.parse(p + 'T00:00:00Z') / DAY; };
    const byHandle = new Map(raw.tracked.map((t) => [t.handle, t.id]));
    let seen = 0, busy = 0;
    for (const [k, d] of docs) for (const c of /^creators:/.test(k) ? d.creators ?? [] : /^creator:/.test(k) ? [d] : []) {
      seen++;
      if (!Array.isArray(c.days7) || c.days7.length !== 7) { out.push(`${k} @${c.handle} : days7 = ${JSON.stringify(c.days7)}`); continue; }
      const want = [0, 0, 0, 0, 0, 0, 0];
      for (const v of raw.trackedVideos) if (v.accountId === byHandle.get(c.handle)) { const j = pDay(NOW) - pDay(v.publishedAt); if (j >= 0 && j < 7) want[6 - j]++; }
      if (want.join() !== c.days7.join()) out.push(`${k} @${c.handle} : ${c.days7.join(',')} au lieu de ${want.join(',')}`);
      if (want.some((n) => n > 0)) busy++;
    }
    if (seen && !busy) out.push('aucun créateur de la fixture n\'a publié sur 7 jours : le test ne prouve rien');
    return [...new Set(out)].slice(0, 10);
  }],
  ['Créateurs : active7 de la 1re page = les comptes du marché qui ont publié sur 7 jours, toutes pages (maquette E1)', (docs) => {
    const out = [];
    for (const [k, d] of docs) {
      if (!/^creators:[A-Z]+$/.test(k)) continue;
      let n = (d.creators ?? []).filter((c) => c.posts7d > 0).length;
      for (let i = 2; i <= (d.pages ?? 1); i++) n += (docs.get(`${k}:${i}`)?.creators ?? []).filter((c) => c.posts7d > 0).length;
      if (d.active7 !== n) out.push(`${k} : active7 = ${d.active7}, ${n} attendus`);
    }
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

// Le nom d'un format par ce qu'on y voit (maquette C1 du 20/11) : un format « sound » porte le texte à l'écran de sa
// reprise la plus vue qui en a un (title) ; un format « hook » (déjà nommé par son texte) et un son sans texte : null.
RULES.push(['Formats : title = le texte à l\'écran de la reprise la plus vue qui en a un, null sinon (maquette C1)', (docs, raw) => {
  const out = [];
  const sig = new Map(raw.signals.map((s) => [s.videoId, s]));
  const byId = new Map(raw.formats.map((f) => [f.id, f]));
  const list = docs.get('formats')?.formats ?? [];
  const seen = { title: 0, none: 0, cut: 0 };
  for (const f of list) {
    const r = byId.get(f.id);
    if (!('title' in f)) { out.push(`${f.id} : pas de champ title`); continue; }
    let want = null;
    if (r.kind === 'sound') for (const m of [...r.members].sort((p, q) => q.views - p.views)) if ((want = models.formatTitle(m.hook ?? sig.get(m.videoId)?.hook))) break;
    if (f.title !== want) out.push(`${f.id} (${r.kind}) : ${JSON.stringify(f.title)} au lieu de ${JSON.stringify(want)}`);
    for (const k of [`format:${f.id}`]) if (docs.has(k) && docs.get(k).title !== f.title) out.push(`${k} : ${JSON.stringify(docs.get(k).title)} ≠ ${JSON.stringify(f.title)}`);
    if (r.kind === 'sound') { if (f.title) seen.title++; else seen.none++; if (f.title?.endsWith('…')) seen.cut++; }
  }
  // Sans sons nommés, sans sons muets ou sans nom coupé dans l'export inventé, la règle ne prouverait rien.
  if (!seen.title || !seen.none || !seen.cut) out.push(`l'export inventé ne couvre pas les cas (sons nommés ${seen.title}, sans texte ${seen.none}, coupés ${seen.cut})`);
  return out;
}]);

// La fiche d'une app (24/11/2026) : les formats que SES comptes reprennent, rangés par eux. Rangés par le nombre de comptes
// toutes apps confondues, les 8 formats de la fiche de Diane AI étaient des sons où elle n'avait qu'un compte.
RULES.push(['Fiche d\'app : ses formats repris par au moins 2 de ses comptes, les plus repris chez elle d\'abord ; own = ses comptes, accounts = tous ceux du format', (docs, raw) => {
  const out = [], NOW = 1794780000000;
  const byId = new Map(raw.apps.map((a) => [a.id, a]));
  const canon = (a) => { for (let i = 0; a && a.mergedInto && i < 5; i++) a = byId.get(a.mergedInto) ?? a; return a; };
  const fmt = new Map(raw.formats.map((f) => [f.id, f]));
  const own = (f, slug) => new Set(f.members.filter((m) => canon(byId.get(m.appId))?.slug === slug).map((m) => m.accountId)).size;
  const isFormat = (f) => f.accountCount >= 3 && NOW - f.lastPostAt <= 21 * DAY;
  const absorbed = models.absorbedFormats(raw.formats, isFormat);
  let shown = 0, below = 0;
  for (const [k, d] of docs) {
    if (!/^app:[^:]+$/.test(k)) continue;
    const slug = k.slice(4), list = d.formats ?? [];
    shown += list.length;
    for (const f of list) {
      const r = fmt.get(f.id), n = own(r, slug);
      if (f.own !== n) out.push(`${k} → ${f.id} : own ${f.own}, ${n} de ses comptes`);
      // Deux de ses comptes au moins (décision du 24/11/2026, écrite ici en clair : la règle ne relit pas la constante).
      if (n < 2) out.push(`${k} → ${f.id} : ${n} compte(s) de l'app seulement`);
      if (f.accounts !== r.accountCount) out.push(`${k} → ${f.id} : accounts ${f.accounts} ≠ ${r.accountCount}`);
    }
    for (let i = 1; i < list.length; i++) if (list[i].own > list[i - 1].own) out.push(`${k} : ${list[i].id} (${list[i].own}) après ${list[i - 1].id} (${list[i - 1].own})`);
    // Aucun format plus repris chez elle n'est laissé de côté.
    const floor = list.length >= models.FICHE_FORMATS ? list[list.length - 1].own : 1;
    const listed = new Set(list.map((f) => f.id));
    for (const f of raw.formats) {
      if (!isFormat(f) || absorbed.has(f.id) || listed.has(f.id)) continue;
      const n = own(f, slug);
      if (n > floor) out.push(`${k} : ${f.id} manque (${n} de ses comptes)`);
      else if (n === 1) below++;
    }
  }
  // Sans fiche qui montre un format, ni format écarté faute de comptes de l'app, la règle ne prouverait rien.
  if (!shown || !below) out.push(`l'export inventé ne couvre pas les cas (formats montrés ${shown}, écartés à 1 compte ${below})`);
  return [...new Set(out)].slice(0, 10);
}]);

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

// Le nom d'un format tiré de son texte à l'écran (formatTitle, maquette C1) : espaces resserrés, guillemets d'entourage
// retirés, coupé sur un mot vers 90 caractères avec « … », jamais au milieu d'un émoji.
const words = 'Quand tu révises la veille de l’exam et que tu te rends compte que tu n’as rien compris au cours de maths';
const TITLES = [
  ['  Quand   tu révises\n la veille  ', 'Quand tu révises la veille'], ['“POV: tu révises”', 'POV: tu révises'], ['« Il m’a écrit »', 'Il m’a écrit'],
  ['Il a dit "non"', 'Il a dit "non"'], ['', null], ['   \n ', null], [null, null], [undefined, null],
  ['a'.repeat(90), 'a'.repeat(90)], [words, 'Quand tu révises la veille de l’exam et que tu te rends compte que tu n’as rien compris…'],
  ['x'.repeat(120), 'x'.repeat(89) + '…'], ['😭'.repeat(100), '😭'.repeat(89) + '…'],
  [`${'mot '.repeat(21)}fin, et encore des mots`, `${'mot '.repeat(21)}fin…`],
  [`${'mot '.repeat(21)}fin · second texte de la vidéo`, `${'mot '.repeat(21)}fin…`], ['·'.repeat(120), null],
];
const titleFails = TITLES.filter(([inp, want]) => models.formatTitle(inp) !== want || (want && Array.from(want).length > 90));
console.log(`${titleFails.length ? 'ÉCHEC' : 'OK   '} Nom d'un format par son texte à l'écran (formatTitle, maquette C1)${titleFails.length ? ` : ${titleFails.length} — ${titleFails.slice(0, 4).map(([i, w]) => `${JSON.stringify(i)} → ${JSON.stringify(models.formatTitle(i))} au lieu de ${JSON.stringify(w)}`).join(' ; ')}` : ''}`);

// Idées d'accroches (convex/radar/radarIdeas, 24/11/2026) : une accroche dont une idée MONTRÉE couvre les reprises n'est
// plus un format à part (ni dans la liste, ni sa fiche, ni sur la fiche de son app) ; une idée pas montrée (2 comptes) ne
// couvre rien.
const ideaFails = (() => {
  const out = [], NOW = 1794780000000, raw = fixtureRaw();
  const shown = (f) => f.accountCount >= 3 && NOW - f.lastPostAt <= 21 * DAY;
  const hooks = raw.formats.filter((f) => f.kind === 'hook' && shown(f) && new Set(f.members.map((m) => m.accountId)).size >= 3);
  const [tpl, other] = hooks;
  const idea = (id, members, videos, accounts) => ({ id, kind: 'hook', key: `idee:${id}`, label: `Idée ${id}`, members, accountCount: accounts, appIds: [...new Set(members.map((m) => m.appId))],
    maxViews: Math.max(...members.map((m) => m.views)), lastPostAt: NOW - DAY, firstSeenAt: NOW - 3 * DAY, lang: 'fr', videos });
  raw.formats.push(idea('grande', tpl.members, tpl.members.map((m) => m.videoId), new Set(tpl.members.map((m) => m.accountId)).size));
  const two = other.members.filter((m, i, a) => a.findIndex((x) => x.accountId === m.accountId) === i).slice(0, 2);
  raw.formats.push(idea('petite', two, other.members.map((m) => m.videoId), 2));
  const docs = boardsOf(models, raw);
  const list = (docs.get('formats')?.formats ?? []).map((f) => f.id);
  if (list.includes(tpl.id) || docs.has(`format:${tpl.id}`)) out.push(`${tpl.id} couvert par une idée montrée, encore listé`);
  for (const [k, d] of docs) if (/^(app|creator):/.test(k) && (d.formats ?? []).some((f) => f.id === tpl.id)) out.push(`${k} cite ${tpl.id}`);
  if (!list.includes('grande')) out.push('l\'idée montrée manque à la liste');
  if (!list.includes(other.id)) out.push(`${other.id} écarté par une idée de 2 comptes`);
  if (list.includes('petite')) out.push('une idée de 2 comptes est listée');
  // La synchro garde les formats préparés une fois pour toutes ses étapes (convex/radarSync.ts : slimFormat à la lecture
  // de l'export, puis prepareFormats) : sans l'accroche couverte, sans la liste des vidéos ni le texte des reprises des
  // idées, et les mêmes pages au caractère près.
  const prepared = models.prepareFormats(raw.formats.map((f) => models.slimFormat(f, (x) => x)), NOW);
  if (prepared.some((f) => f.videos !== undefined)) out.push('préparés : une idée garde sa liste de vidéos');
  if (prepared.some((f) => f.id === tpl.id)) out.push(`préparés : ${tpl.id}, couvert, encore là`);
  for (const id of ['grande', 'petite', other.id]) if (!prepared.some((f) => f.id === id)) out.push(`préparés : ${id} perdu`);
  if (prepared.some((f) => f.key.startsWith('idee:') && f.members.some((m) => m.hook !== undefined))) out.push('préparés : une reprise d\'idée garde son texte');
  const docs2 = boardsOf(models, { ...raw, formats: prepared });
  const h = (d) => { const { updatedAt, ...rest } = d ?? {}; return JSON.stringify(rest); };
  const changed = [...new Set([...docs.keys(), ...docs2.keys()])].filter((k) => h(docs.get(k)) !== h(docs2.get(k)));
  if (changed.length) out.push(`préparés : ${changed.length} page(s) changée(s) (${changed.slice(0, 3).join(', ')})`);
  return out;
})();
console.log(`${ideaFails.length ? 'ÉCHEC' : 'OK   '} Idées d'accroches : l'accroche couverte par une idée montrée disparaît, pas les autres ; formats préparés par la synchro = mêmes pages${ideaFails.length ? ` : ${ideaFails.join(' ; ')}` : ''}`);

let fail = (bioFails.length ? 1 : 0) + (titleFails.length ? 1 : 0) + (ideaFails.length ? 1 : 0);
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
