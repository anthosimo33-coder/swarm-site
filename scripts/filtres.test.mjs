// Audit F25 (19/11) : tourner un iPad (820 ↔ 1180 px) ou redimensionner la fenêtre remonte l'autre version de l'écran
// (téléphone ↔ ordinateur) ; les filtres des listes, gardés dans l'état local de l'écran, étaient perdus. Ils vivent
// maintenant dans la requête de l'adresse, avec les mêmes noms sur les deux versions. Ce banc rend les écrans de liste
// générés (src/app/pages) avec les documents de banc (scripts/radar-fixture.mjs), sans navigateur :
//   1. chaque filtre choisi sur une version est écrit dans l'adresse (history.replaceState, jamais pushState, même
//      chemin) ; l'autre version, montée avec cette requête (comme le routeur après la bascule), montre la même liste
//      que si le filtre y avait été choisi ; et le même filtre choisi sur l'autre version écrit la même requête ;
//   2. un filtre propre à l'ordinateur reste dans l'adresse quand le téléphone en change un autre, et revient au retour ;
//   3. sans props.query (le canevas), le filtre reste dans l'état local et l'adresse n'est pas touchée ;
//   4. le routeur (src/app/main.js, plan.js) remonte l'écran avec la requête affichée, pas celle de la navigation.
// Que changer un filtre ne remonte pas l'écran ni ne le ramène en haut est vu dans le navigateur (rapport de la PR).
// Usage : node scripts/filtres.test.mjs
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { h } from 'preact';
import { renderToString } from 'preact-render-to-string';
import { boardsOf, fixtureRaw, loadModels, NOW } from './radar-fixture.mjs';
import { checker, root } from './test-kit.mjs';

const { ok, end } = checker();
const docs = boardsOf(await loadModels(), fixtureRaw());
const { queryOf, screenQuery } = await import(pathToFileURL(path.join(root, 'src/app/plan.js')).href);

// ─── Une barre d'adresse et un historique de banc ───
const loc = { pathname: '/', search: '', hash: '' };
const calls = { replace: 0, push: 0 };
globalThis.location = loc;
globalThis.history = {
  state: null,
  replaceState(state, _t, url) { calls.replace++; this.state = state; if (url !== undefined && url !== null) { const u = new URL(String(url), 'https://banc.test' + loc.pathname); Object.assign(loc, { pathname: u.pathname, search: u.search, hash: u.hash }); } },
  pushState() { calls.push++; },
};
const at = (pathname, search = '') => { Object.assign(loc, { pathname, search, hash: '' }); globalThis.history.state = { y: 640 }; };
const params = () => [...new URLSearchParams(loc.search)].sort((a, b) => (a[0] + a[1]).localeCompare(b[0] + b[1]));

// ─── Les écrans ───
const page = async (n) => (await import(pathToFileURL(path.join(root, 'src/app/pages', n + '.js')).href)).default;
const user = { prenom: 'Léa', nom: 'Léa', email: 'lea@exemple.test', initiale: 'L', pro: true, emailVerified: true };
const SAVED = { alertRules: [{ id: 'r1', createdAt: NOW - 864e5, quoi: 'video', niche: null, seuil: 10, marche: 'FR' }], seen: { alerts: NOW - 3 * 864e5 } };
const propsOf = (key, query) => ({ user, signOut() {}, onPlans() {}, params: {}, ...(query ? { query } : {}), data: docs.get(key),
  get: (k) => docs.get(k) ?? null, saved: (k) => SAVED[k] ?? null, save: () => Promise.resolve() });
/** L'écran monté comme par Preact, avec un setState immédiat (le banc lit ses valeurs aussitôt). */
function mount(Page, props) {
  const c = new Page(props);
  c.props = props;
  c.state = c.state || {};
  c.setState = (p) => { c.state = Object.assign({}, c.state, typeof p === 'function' ? p(c.state, c.props) : p); };
  return c;
}
/** Le libellé d'un choix : label, l, ou pre + hit + post (fenêtres de choix d'Apps, texte cherché surligné). */
const labelOf = (o) => o.label ?? o.l ?? (typeof o.pre === 'string' ? o.pre + (o.hit || '') + (o.post || '') : undefined);
/** Le premier choix du libellé `label` qui a une action pick, n'importe où dans les valeurs. */
function pick(v, label) {
  const seen = new Set();
  const walk = (o) => {
    if (!o || typeof o !== 'object' || seen.has(o)) return null;
    seen.add(o);
    if (labelOf(o) === label && typeof o.pick === 'function') return o;
    for (const x of Array.isArray(o) ? o : Object.values(o)) { const r = walk(x); if (r) return r; }
    return null;
  };
  const hit = walk(v);
  if (!hit) throw new Error(`aucun choix « ${label} »`);
  hit.pick();
}
const run = (c, steps) => { for (const s of steps) s(c.renderVals()); return c; };
/** Ce que la liste montre, dans l'ordre : de quoi comparer deux écrans de la même version. */
const idOf = (x) => (x && typeof x === 'object' ? x.href ?? x.n ?? x.h ?? x.raw ?? x.quote ?? x.t ?? x.l ?? '' : String(x));
function shows(c) {
  const v = c.renderVals();
  const out = {};
  for (const k of ['hero', 'rows', 'cards', 'groups', 'live']) {
    if (!v[k]) continue;
    out[k] = Array.isArray(v[k]) ? v[k].map((x) => (x && Array.isArray(x.items) ? `${x.g}:${x.items.map(idOf).join('|')}` : idOf(x))) : idOf(v[k]);
  }
  return JSON.stringify(out);
}
/** Le rendu complet (comme npm run check:data) avec une requête : pas d'exception. */
function renders(Page, props, where) {
  try { renderToString(h(Page, props)); return true; } catch (e) { ok(false, `${where} : l'écran plante avec la requête ${JSON.stringify(props.query)} (${e.message})`); return false; }
}

// ─── Les listes, leurs filtres et le geste qui choisit chacun sur chaque version ───
// desk / mob : les gestes (sur les valeurs de l'écran) ; null : filtre absent de cette version (l'autre le garde).
// deskQuery : le filtre se choisit sur ordinateur par un lien (navigation) qui porte cette requête.
const t = (i, k = 'bar') => (v) => v[k][i].toggle();
const p = (label) => (v) => pick(v, label);
const LISTS = [
  { name: 'Apps', path: '/app/apps', key: 'apps', desk: 'Apps', mob: 'MApps', filters: [
    { f: 'marché', desk: [t(0), p('France')], mob: [p('France')] },
    { f: 'niches', desk: [t(1), p('Foi'), p('Langues')], mob: [p('Foi'), p('Langues')] },
    { f: 'tri', desk: [p('Qui accélèrent')], mob: [p('Qui accélèrent')] },
    { f: 'période', desk: [p('7 j')], mob: [(v) => v.togglePeriod()] },
    { f: 'plateforme', desk: [t(2), p('Instagram')], mob: null },
    { f: 'colonne de tri', desk: [(v) => v.hd.name.pick()], mob: null },
    { f: 'période personnalisée', desk: [(v) => v.cust.toggle(), p('7 derniers jours'), (v) => v.cal.apply()], mob: null },
  ], other: { desk: [t(1), p('Foi')], mob: [p('Foi')] } }, // l'autre filtre, changé sur l'autre version
  ...[['Createurs', 'MCreateurs', '/app/createurs'], ['CreateursCartes', 'MCreateursCartes', '/app/createurs/cartes']].map(([desk, mob, route]) => ({
    name: desk, path: route, key: 'creators:FR', desk, mob, filters: [
      // Téléphone (maquettes T1, T2 du 20/11) : les filtres de l'ordinateur, chacun dans sa feuille (filters[i].toggle,
      // mkb.toggle pour le marché) ; « actifs » n'est plus un filtre sur aucune des deux versions (les actifs d'abord).
      { f: 'marché', deskQuery: { m: 'US' }, mob: [(v) => v.mkb.toggle(), p('États-Unis')] },
      { f: 'type de compte', desk: [t(3, 'filters'), p('Carrousel')], mob: [t(3, 'filters'), p('Carrousel')] },
      { f: 'genre', desk: [t(4, 'filters'), p('Femmes')], mob: [t(4, 'filters'), p('Femmes')] },
      { f: 'tri', desk: [(v) => v.toggleSort(), p('Abonnés')], mob: [(v) => v.toggleSort(), p('Abonnés')] },
      { f: 'niches', desk: [t(0, 'filters'), p('Foi')], mob: [t(0, 'filters'), p('Foi')] },
      { f: 'apps', desk: [t(1, 'filters'), p('App 1')], mob: [t(1, 'filters'), p('App 1')] },
      { f: 'abonnés', desk: [t(2, 'filters'), p('Moins de 1 000')], mob: [t(2, 'filters'), p('Moins de 1 000')] },
      // Liste ou cartes (T3) : basculées sur place sur le téléphone ; l'ordinateur garde « vue » dans l'adresse.
      { f: 'vue', desk: null, mob: [p(mob === 'MCreateurs' ? 'Cartes' : 'Liste')] },
    ], other: { desk: [(v) => v.toggleSort(), p('Abonnés')], mob: [(v) => v.toggleSort(), p('Abonnés')] } })),
  { name: 'Formats', path: '/app/formats', key: 'formats', desk: 'Formats', mob: 'MFormats', filters: [
    // Niche et marché : les fenêtres de choix (maquette C1 du 20/11), comme sur Apps ; le tri est propre à l'ordinateur.
    { f: 'niche', desk: [t(1), p('Foi')], mob: [p('Foi')] },
    { f: 'type', desk: [p('Sons')], mob: [p('Sons')] },
    { f: 'marché', desk: [t(0), p('France')], mob: null },
    { f: 'tri', desk: [(v) => v.sortBtn.toggle(), p('Au-dessus de la normale')], mob: null },
  ], other: { desk: [p('Accroches')], mob: [p('Accroches')] } },
  { name: 'Alertes', path: '/app/alertes', key: 'alerts', desk: 'Alertes', mob: 'MAlertes', filters: [
    { f: 'onglet', desk: [p('Vidéos')], mob: [p('Vidéos')] },
    { f: 'mes alertes', desk: [(v) => v.toggleMine()], mob: [(v) => v.toggleMine()] },
  ], other: { desk: [p('Comptes')], mob: [p('Comptes')] } },
];

for (const L of LISTS) {
  const Desk = await page(L.desk), Mob = await page(L.mob);
  const fresh = (Page, query = {}) => { at(L.path, new URLSearchParams(query).toString() ? '?' + new URLSearchParams(query) : ''); return mount(Page, propsOf(L.key, queryOf(loc.search))); };
  for (const F of L.filters) {
    const where = `${L.name} · ${F.f}`;
    try {
      if (!F.desk && !F.deskQuery) {
        // Filtre propre au téléphone : l'ordinateur le garde dans l'adresse en changeant un autre filtre.
        const m = run(fresh(Mob), F.mob);
        const fromMob = params(), mobSays = shows(m);
        ok(fromMob.length > 0 && loc.pathname === L.path, `${where} : choisi sur le téléphone, il est dans l'adresse (${loc.search || 'rien'})`);
        ok(mobSays !== shows(fresh(Mob)), `${where} : le filtre change bien la liste du banc (sinon le banc ne prouve rien)`);
        at(L.path, '?' + new URLSearchParams(fromMob));
        renders(Desk, propsOf(L.key, queryOf(loc.search)), where);
        run(mount(Desk, propsOf(L.key, queryOf(loc.search))), L.other.desk);
        const kept = fromMob.every(([k, x]) => params().some(([k2, x2]) => k2 === k && x2 === x));
        ok(kept, `${where} (téléphone seul) : l'ordinateur le garde dans l'adresse en changeant un autre filtre (${loc.search})`);
        const back = shows(mount(Mob, propsOf(L.key, queryOf(loc.search))));
        ok(back === shows(run(run(fresh(Mob), F.mob), L.other.mob)), `${where} (téléphone seul) : de retour sur le téléphone, la liste a ce filtre et l'autre`);
        continue;
      }
      // Ordinateur : le filtre choisi, ce que l'adresse en garde.
      const push0 = calls.push;
      const d = F.deskQuery ? fresh(Desk, F.deskQuery) : run(fresh(Desk), F.desk);
      const fromDesk = params(), deskSearch = loc.search;
      const deskSays = shows(d);
      ok(fromDesk.length > 0 && loc.pathname === L.path && calls.push === push0,
        `${where} : choisi sur ordinateur, il est dans l'adresse (${loc.search || 'rien'}), sans nouvelle entrée d'historique ni changement de chemin`);
      ok(deskSays !== shows(fresh(Desk)), `${where} : le filtre change bien la liste du banc (sinon le banc ne prouve rien)`);
      at(L.path, deskSearch); // la barre d'adresse au moment de la bascule
      if (!F.mob) {
        // Filtre propre à l'ordinateur : le téléphone le garde dans l'adresse en changeant un autre filtre.
        const m = run(mount(Mob, propsOf(L.key, queryOf(loc.search))), L.other.mob);
        renders(Mob, propsOf(L.key, queryOf(loc.search)), where);
        const kept = fromDesk.every(([k, x]) => params().some(([k2, x2]) => k2 === k && x2 === x));
        ok(kept && m, `${where} (ordinateur seul) : le téléphone le garde dans l'adresse en changeant un autre filtre (${loc.search})`);
        const back = shows(mount(Desk, propsOf(L.key, queryOf(loc.search))));
        const want = shows(run(F.deskQuery ? fresh(Desk, F.deskQuery) : run(fresh(Desk), F.desk), L.other.desk));
        ok(back === want, `${where} (ordinateur seul) : de retour sur ordinateur, la liste a ce filtre et l'autre`);
        continue;
      }
      // Bascule vers le téléphone : monté avec l'adresse écrite par l'ordinateur.
      const q = queryOf(loc.search);
      const afterSwitch = shows(mount(Mob, propsOf(L.key, q)));
      renders(Mob, propsOf(L.key, q), where);
      const mOwn = run(fresh(Mob), F.mob);
      const fromMob = params(), mobSays = shows(mOwn);
      ok(afterSwitch === mobSays && mobSays !== shows(fresh(Mob)),
        `${where} : après la bascule, le téléphone montre la liste filtrée comme si le filtre y avait été choisi`);
      ok(JSON.stringify(fromMob) === JSON.stringify(fromDesk), `${where} : mêmes paramètres sur les deux versions (ordinateur ${JSON.stringify(fromDesk)}, téléphone ${JSON.stringify(fromMob)})`);
      // Retour vers l'ordinateur : monté avec l'adresse écrite par le téléphone.
      at(L.path, '?' + new URLSearchParams(fromMob));
      const dBack = mount(Desk, propsOf(L.key, queryOf(loc.search)));
      renders(Desk, propsOf(L.key, queryOf(loc.search)), where);
      ok(shows(dBack) === deskSays, `${where} : de retour sur ordinateur, la liste a le filtre choisi sur le téléphone`);
    } catch (e) {
      ok(false, `${where} : ${e.message}`);
    }
  }
  // Le canevas : pas de props.query, l'état local seul, l'adresse intacte.
  const F = L.filters.find((x) => x.desk);
  at('/canevas/' + L.desk, '');
  const replace0 = calls.replace;
  const c = mount(Desk, { ...propsOf(L.key, null) });
  const before = shows(c);
  try { run(c, F.desk); } catch (e) { ok(false, `${L.name} · canevas : ${e.message}`); }
  ok(calls.replace === replace0 && loc.search === '' && shows(c) !== before, `${L.name} · canevas (sans props.query) : le filtre ${F.f} reste dans l'état local, l'adresse n'est pas touchée`);
}

// ─── Apps : choisir un tri efface le tri par colonne (ordinateur), sur le téléphone comme sur l'ordinateur ───
{
  const Mob = await page('MApps');
  at('/app/apps', '?colonne=name&ordre=asc&m=FR');
  run(mount(Mob, propsOf('apps', queryOf(loc.search))), [p('Qui accélèrent')]);
  ok(loc.search === '?m=FR&tri=accel', `Apps : un tri choisi sur le téléphone efface la colonne de tri de l'ordinateur et garde le reste (${loc.search})`);
}

// ─── Apps : une autre plage personnalisée redessine les lignes (mémoire des lignes, rowsKey) ───
{
  const Desk = await page('Apps');
  const range = (c, label) => run(c, [(v) => v.cust.toggle(), p(label), (v) => v.cal.apply()]);
  const views = (c) => JSON.stringify(c.renderVals().rows.map((r) => r.v30));
  at('/app/apps', '');
  const live = range(range(mount(Desk, propsOf('apps', {})), '7 derniers jours'), '14 derniers jours');
  const fresh14 = range(mount(Desk, propsOf('apps', {})), '14 derniers jours');
  ok(views(live) === views(fresh14), `Apps : passer d'une plage de 7 à 14 jours redessine les vues des lignes (${views(live).slice(0, 40)} / ${views(fresh14).slice(0, 40)})`);
}

// ─── Alertes : l'alerte ouverte (boîte de réception B2, 20/11) vit dans l'adresse, propre à l'ordinateur ───
{
  const Desk = await page('Alertes'), Mob = await page('MAlertes');
  at('/app/alertes', '');
  const d = mount(Desk, propsOf('alerts', {}));
  const v0 = d.renderVals();
  const rows = v0.groups.flatMap((g) => g.items);
  ok(rows.length > 2 && !!v0.d.key && loc.search === '', `Alertes : une alerte est ouverte à l'arrivée sans rien écrire dans l'adresse (${v0.d.key || 'aucune'}, « ${loc.search} »)`);
  const other = rows.find((a) => a.key !== v0.d.key);
  other.pick();
  const v1 = d.renderVals();
  const q = new URLSearchParams(loc.search).get('alerte');
  ok(v1.d.key === other.key && q === other.key && v1.groups.flatMap((g) => g.items).filter((a) => a.on === 'true').map((a) => a.key).join() === other.key,
    `Alertes : choisir une alerte l'ouvre, la ligne choisie est seule marquée, et l'adresse la porte (alerte=${q})`);
  const back = mount(Desk, propsOf('alerts', queryOf(loc.search)));
  ok(back.renderVals().d.key === other.key, 'Alertes : remonté avec l\'adresse (bascule de mise en page), l\'ordinateur rouvre la même alerte');
  run(mount(Mob, propsOf('alerts', queryOf(loc.search))), [p('Comptes')]);
  ok(new URLSearchParams(loc.search).get('alerte') === other.key, `Alertes : le téléphone garde l'alerte ouverte dans l'adresse en changeant d'onglet (${loc.search})`);
  at('/app/alertes', '?alerte=' + encodeURIComponent(other.key));
  const t = mount(Desk, propsOf('alerts', queryOf(loc.search)));
  const tabOf = { Son: 'Formats', Format: 'Formats', 'Vidéo': 'Vidéos', Compte: 'Comptes' };
  const want = (t.renderVals().tabs.find((x) => x.l !== 'Toutes' && x.l !== tabOf[other.typ] && x.n > 0) || {}).l;
  run(t, [p(want)]);
  const vt = t.renderVals();
  ok(!new URLSearchParams(loc.search).has('alerte') && vt.groups.flatMap((g) => g.items).some((a) => a.key === vt.d.key),
    `Alertes : un onglet qui n'a pas l'alerte ouverte l'efface de l'adresse et ouvre une des siennes (${loc.search}, ${vt.d.key})`);
}

// ─── Le routeur ───
{
  const q = queryOf('?m=FR&niche=Foi&niche=Couple&__proto__=x');
  ok(q.m === 'FR' && Array.isArray(q.niche) && q.niche.join() === 'Foi,Couple' && Object.getPrototypeOf(q) === Object.prototype && q.__proto__ === 'x',
    'queryOf : une clé répétée donne un tableau, une clé seule une chaîne ; « __proto__ » est une clé comme une autre');
  ok(JSON.stringify(screenQuery('/app/apps?niche=Foi', '/app/apps', '?m=FR&tri=accel')) === '{"m":"FR","tri":"accel"}',
    'screenQuery : même chemin, l\'écran remonté reçoit la requête affichée (filtres réécrits), pas celle de la navigation');
  ok(JSON.stringify(screenQuery('/app/apps?niche=Foi', '/app/formats', '?type=Sons')) === '{"niche":"Foi"}',
    'screenQuery : autre chemin affiché (navigation en cours), la requête de la navigation');
  const main = fs.readFileSync(path.join(root, 'src/app/main.js'), 'utf8');
  ok(/screenQuery\(path, clean\(window\.location\.pathname\), window\.location\.search\)/.test(main),
    'src/app/main.js : l\'écran est monté avec screenQuery (la requête affichée)');
  ok(/key: `\$\{screen\.mobile \? 'm' : 'd'\}\$\{screen\.n\}\$\{screen\.path\}`/.test(main) && /setNav\(\(cur\) => \(\{ path: next, n: cur\.n \+ 1 \}\)\)/.test(main),
    'src/app/main.js : la clé de l\'écran suit la navigation (numéro) et la mise en page, pas la requête réécrite par l\'écran');
}

ok(calls.push === 0, 'aucun filtre n\'a ajouté d\'entrée à l\'historique (pushState jamais appelé)');
end();
