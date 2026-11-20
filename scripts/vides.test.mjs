// Écrans vides, maquette V3 « le même geste partout » (20/11) : ce qui manque en une phrase, le geste qui le remplit, une
// sortie en un clic tirée des données. Ce banc rend les écrans générés (src/app/pages) avec les documents de banc
// (scripts/radar-fixture.mjs), sans navigateur, et vérifie la sortie en un clic :
//   1. Dossiers sans dossier : l'app proposée est la plus vue sur 30 jours (« apps ») ; « Garder » écrit un seul dossier
//      « Mes idées » qui la contient, à la forme qu'écrit AjoutDossier (saved('folders'), docs/donnees-app.md) ;
//   2. Accueil, rien de suivi : les trois apps les plus vues sur 30 jours, chacune avec « Suivre », qui ajoute son slug à
//      saved('follows').apps sans rien perdre du reste ; une fois suivie, la liste des suivis remplace l'écran vide.
// Les filtres sans résultat (Apps, Formats, Créateurs) sont vérifiés par npm run test:filtres (le compte annoncé de chaque
// « un filtre de moins » = la liste après son clic).
// Usage : node scripts/vides.test.mjs
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { h } from 'preact';
import { renderToString } from 'preact-render-to-string';
import { boardsOf, fixtureRaw, loadModels } from './radar-fixture.mjs';
import { checker, root } from './test-kit.mjs';

const { ok, end } = checker();
const docs = boardsOf(await loadModels(), fixtureRaw());
const page = async (n) => (await import(pathToFileURL(path.join(root, 'src/app/pages', n + '.js')).href)).default;
const user = { prenom: 'Léa', nom: 'Léa', email: 'lea@exemple.test', initiale: 'L', pro: true, emailVerified: true };
/** Ce que la personne garde, en mémoire : save() remplace la valeur, comme saved.set (mise à jour optimiste comprise). */
function store(init) {
  const vals = { ...init }, writes = [];
  return { vals, writes, saved: (k) => (k in vals ? vals[k] : null), save: (k, v) => { writes.push([k, v]); vals[k] = v; return Promise.resolve(); } };
}
const propsOf = (key, S) => ({ user, signOut() {}, onPlans() {}, params: {}, query: {}, data: key ? docs.get(key) : undefined,
  get: (k) => docs.get(k) ?? null, saved: S.saved, save: S.save });
function mount(Page, props) {
  const c = new Page(props);
  c.props = props;
  c.state = c.state || {};
  c.setState = (p) => { c.state = Object.assign({}, c.state, typeof p === 'function' ? p(c.state, c.props) : p); };
  return c;
}
const top = docs.get('apps').apps.slice().sort((p, q) => q.views30 - p.views30);

// ─── 1. Dossiers sans dossier ───
{
  const Dossiers = await page('Dossiers');
  const S = store({ folders: null });
  const c = mount(Dossiers, propsOf(null, S));
  const v = c.renderVals();
  ok(v.none && v.vd.app && v.vd.name === top[0].name && v.vd.cta === 'Garder ' + top[0].name,
    `Dossiers vides : le geste est montré sur l'app la plus vue sur 30 jours (${v.vd.name}, attendu ${top[0].name}), bouton « ${v.vd.cta} »`);
  ok(/vues sur 30 jours$/.test(v.vd.sub) && !/NaN|undefined/.test(v.vd.sub), `Dossiers vides : ses vues sur 30 jours (« ${v.vd.sub} »)`);
  const html = renderToString(h(Dossiers, propsOf(null, S)));
  ok(html.includes('Le signet de chaque fiche range ici') && html.includes('Mes idées') && !/undefined|NaN|\[object Object\]/.test(html), 'Dossiers vides : l\'écran se rend, sans trou');
  v.vd.keep();
  const w = S.writes.filter(([k]) => k === 'folders');
  const f = w.length === 1 && Array.isArray(w[0][1]) && w[0][1].length === 1 ? w[0][1][0] : null;
  const it = f && f.items && f.items[0];
  ok(!!f && f.name === 'Mes idées' && typeof f.id === 'string' && f.id && typeof f.createdAt === 'number' && f.items.length === 1,
    `Dossiers vides : « Garder » écrit un seul dossier « Mes idées » (${JSON.stringify(w.map((x) => x[1]))})`);
  ok(!!it && it.kind === 'app' && it.id === top[0].slug && it.label === top[0].name && it.cover === (top[0].icon || null) && typeof it.at === 'number',
    `Dossiers vides : l'app y est rangée comme AjoutDossier la range ({ kind, id, label, cover, at } : ${JSON.stringify(it)})`);
  const after = c.renderVals();
  ok(!after.none && after.folders.length === 1 && after.folders[0].name === 'Mes idées', 'Dossiers vides : après le clic, la grille montre « Mes idées »');
  // Sans liste d'apps lisible (compte sans abonnement, document verrouillé) : « Créer un dossier », comme avant.
  const locked = mount(Dossiers, { ...propsOf(null, store({ folders: [] })), get: (k) => (k === 'apps' ? { locked: true } : null) }).renderVals();
  ok(locked.none && !locked.vd.app && locked.vd.noApp, 'Dossiers vides : sans liste d\'apps, le bouton « Créer un dossier » d\'avant');
  // Tant que les dossiers chargent, rien (ni l'écran vide, ni la grille).
  const wait = mount(Dossiers, { ...propsOf(null, store({})), saved: () => undefined }).renderVals();
  ok(!wait.none && !wait.grid, 'Dossiers : rien tant que les dossiers chargent');
}

// ─── 2. Accueil, « Tes suivis » vide ───
{
  const Accueil = await page('Accueil');
  const S = store({ follows: { apps: [], creators: ['quelqu.un'], formats: ['f1'] } });
  const c = mount(Accueil, propsOf('home', S));
  const v = c.renderVals().fol;
  const want = top.slice(0, 3).map((a) => a.name).join(', ');
  ok(v.pick && !v.list && !v.empty && v.picks.map((a) => a.name).join(', ') === want,
    `Tes suivis vide : les trois apps les plus vues sur 30 jours (${v.picks.map((a) => a.name).join(', ')} ; attendu ${want})`);
  ok(v.picks.every((a) => /vues · 30 j$/.test(a.sub) && /^(FicheA\.dc\.html\?app=|\/app\/apps\/)/.test(a.href)), `Tes suivis vide : vues sur 30 jours et lien vers la fiche (${v.picks.map((a) => a.sub).join(' ; ')})`);
  const html = renderToString(h(Accueil, propsOf('home', S)));
  ok(html.includes('Suis une app : ses vues de la semaine s’affichent ici') && html.includes('Les trois plus vues sur 30 jours.') && !/undefined|NaN|\[object Object\]/.test(html),
    'Tes suivis vide : l\'écran se rend, sans trou');
  v.picks[1].follow();
  const fw = S.vals.follows;
  ok(S.writes.length === 1 && JSON.stringify(fw.apps) === JSON.stringify([top[1].slug]) && fw.creators[0] === 'quelqu.un' && fw.formats[0] === 'f1',
    `Tes suivis vide : « Suivre » ajoute l'app à follows.apps et garde le reste (${JSON.stringify(fw)})`);
  const after = c.renderVals().fol;
  ok(after.list && !after.pick && after.rows.map((r) => r.name).join() === top[1].name, `Tes suivis : après le clic, la liste des suivis (${after.rows.map((r) => r.name).join(', ')})`);
  // Rien de suivi et pas de document « apps » lisible : la phrase d'avant, avec son lien vers Apps.
  const bare = mount(Accueil, { ...propsOf('home', store({ follows: null })), get: (k) => (k === 'apps' ? null : docs.get(k) ?? null) }).renderVals().fol;
  ok(bare.empty && !bare.pick, 'Tes suivis vide, sans liste d\'apps : la phrase d\'avant et le lien vers Apps');
}

end();
