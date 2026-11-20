// Banc des documents que la synchro écrit (convex/radarModels.ts, buildBoards), sur un export inventé
// (scripts/radar-fixture.mjs) : ce que les écrans lisent doit tenir ses promesses (liens qui mènent à une fiche, aperçu…).
// Usage : npm run test:radar   [autre radarModels.ts]
//         REEL=~/dev/swarm-site/.bench-data node scripts/radar.test.mjs   (en plus, compte les problèmes sur l'export réel)
import { h } from 'preact';
import { renderToString } from 'preact-render-to-string';
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
    for (const k of ['markets', 'niches', 'marketApps']) if (JSON.stringify(top[k]) !== JSON.stringify(apps[k])) out.push(`${k} différent de « apps »`);
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
];

let fail = 0;
const run = async (label, docs, strict) => {
  console.log(`── ${label} : ${docs.size} pages`);
  for (const [name, rule] of RULES) {
    const bad = await rule(docs);
    const okk = !bad.length;
    console.log(`${okk ? 'OK   ' : strict ? 'ÉCHEC' : 'RELEVÉ'} ${name}${okk ? '' : ` : ${bad.length} — ${bad.slice(0, 4).join(' ; ')}`}`);
    if (!okk && strict) fail++;
  }
};
await run('export inventé', boardsOf(models, fixtureRaw()), true);
if (process.env.REEL) {
  const { raw, store } = realRaw(process.env.REEL.replace(/^~/, process.env.HOME));
  await run(`export réel (${process.env.REEL})`, boardsOf(models, raw, store), false);
}
console.log(fail ? `${fail} échec(s)` : 'tout passe');
process.exit(fail ? 1 : 0);
