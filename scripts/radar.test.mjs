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
];

let fail = 0;
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
if (process.env.REEL) {
  const { raw, store } = realRaw(process.env.REEL.replace(/^~/, process.env.HOME));
  await run(`export réel (${process.env.REEL})`, boardsOf(models, raw, store), false, raw);
}
console.log(fail ? `${fail} échec(s)` : 'tout passe');
process.exit(fail ? 1 : 0);
