// Contrôles de cohérence entre le front et le backend, sur les sources.   Usage : npm run test:sources
// - Audit Q42 (19/11) : le front appelle le backend par anyApi, sans typage. Un nom mal écrit (api.whop.setCancle) ou une
//   fonction renommée passait tsc, check et le build, et n'échouait qu'au clic. Chaque api.<module>.<nom> de src/ doit
//   être une fonction publique exportée par convex/<module>.ts, et appelée comme ce qu'elle est (requête, mutation, action).
// - Audit Q50 (19/11) : la forme d'un id de vidéo et celle d'un pseudo ne s'écrivent qu'une fois, dans convex/coverSign.ts.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rel = (f) => path.relative(root, f);
const walk = (dir, keep) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  const f = path.join(dir, e.name);
  if (e.isDirectory()) return ['node_modules', '_generated', '.git'].includes(e.name) ? [] : walk(f, keep);
  return keep(f) ? [f] : [];
});
let fail = 0;
const ok = (cond, msg) => { console.log(`${cond ? 'OK   ' : 'ÉCHEC'} ${msg}`); if (!cond) fail++; };

// ─── Q42 : appels du front ──────────────────────────────────────────────────────────────────────────────────────
/** Les fonctions publiques de chaque module convex/ : nom → query | mutation | action. */
const exported = (mod) => {
  const f = path.join(root, 'convex', `${mod}.ts`);
  if (!fs.existsSync(f)) return null;
  const out = new Map();
  for (const m of fs.readFileSync(f, 'utf8').matchAll(/export\s+const\s+([A-Za-z_$][\w$]*)\s*=\s*(query|mutation|action)\s*\(/g)) out.set(m[1], m[2]);
  return out;
};
/** Ce que l'appel attend : la méthode du client ou le hook qui reçoit la référence. */
const KIND = { query: 'query', useQuery: 'query', watch: 'query', watchQuery: 'query', setQuery: 'query', usePaginatedQuery: 'query',
  mutation: 'mutation', useMutation: 'mutation', action: 'action', useAction: 'action' };
const calls = [];
for (const f of walk(path.join(root, 'src'), (x) => /\.(js|jsx|ts|tsx|mjs)$/.test(x) && !/src\/(app\/)?pages\//.test(x))) {
  const lines = fs.readFileSync(f, 'utf8').split('\n');
  lines.forEach((line, i) => {
    for (const m of line.matchAll(/(?:\b([A-Za-z_$][\w$]*)\s*\(\s*)?\bapi\.([A-Za-z_$][\w$]*)\.([A-Za-z_$][\w$]*)/g))
      calls.push({ where: `${rel(f)}:${i + 1}`, via: m[1] ?? null, mod: m[2], fn: m[3] });
  });
}
// Appels par l'API HTTP, sans client Convex (src/stats.js, audit Q46) : convexHttp('query', 'stats:get').
for (const f of walk(path.join(root, 'src'), (x) => /\.(js|mjs)$/.test(x) && !/src\/(app\/)?pages\//.test(x))) {
  fs.readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
    for (const m of line.matchAll(/convexHttp\(\s*'(query|mutation|action)'\s*,\s*'([A-Za-z_$][\w$]*):([A-Za-z_$][\w$]*)'/g))
      calls.push({ where: `${rel(f)}:${i + 1}`, via: m[1], mod: m[2], fn: m[3] });
  });
}
ok(calls.length >= 10, `${calls.length} appels du front au backend relevés`);
const bad = [];
for (const c of calls) {
  const fns = exported(c.mod);
  const kind = fns?.get(c.fn);
  if (!fns) bad.push(`${c.where} : api.${c.mod}.${c.fn}, aucun module convex/${c.mod}.ts`);
  else if (!kind) bad.push(`${c.where} : api.${c.mod}.${c.fn}, convex/${c.mod}.ts n'exporte aucune fonction publique « ${c.fn} »`);
  else if (c.via && KIND[c.via] && KIND[c.via] !== kind) bad.push(`${c.where} : api.${c.mod}.${c.fn} est une ${kind}, appelée par ${c.via}()`);
}
ok(!bad.length, `chaque api.<module>.<nom> du front existe et est appelé comme ce qu'il est${bad.length ? ' :\n      ' + bad.join('\n      ') : ''}`);

// ─── F27 : le jeton gardé est réutilisé au chargement ───────────────────────────────────────────────────────────
{
  const src = fs.readFileSync(path.join(root, 'src/auth.js'), 'utf8');
  const made = [...src.matchAll(/new ConvexReactClient\(([^)]*)\)/g)].map((m) => m[1]);
  ok(made.length === 1 && /initialAuthTokenReuse:\s*true/.test(made[0]), `un seul client Convex, qui réutilise le jeton gardé au chargement (audit F27 ; ${made.join(' | ') || 'aucun'})`);
}
// ─── Q46 : le client HTTP de Convex ne part pas avec les pages publiques ────────────────────────────────────────
{
  const heavy = walk(path.join(root, 'src'), (x) => /\.(js|mjs)$/.test(x)).filter((f) => /from ['"]convex\/browser['"]|ConvexHttpClient/.test(fs.readFileSync(f, 'utf8'))).map(rel);
  ok(!heavy.length, `aucune page n'importe convex/browser (audit Q46)${heavy.length ? ` : ${heavy.join(', ')}` : ''}`);
}

// ─── Q46 : src/stats.js parle à l'API HTTP de Convex comme le faisait le client ────────────────────────────────
{
  const { build } = (await import('node:module')).createRequire(import.meta.url)('esbuild');
  const out = (await build({ entryPoints: [path.join(root, 'src/stats.js')], bundle: true, format: 'esm', platform: 'neutral', write: false, logLevel: 'error',
    define: { 'import.meta.env': JSON.stringify({ VITE_CONVEX_URL: 'https://banc.convex.cloud' }) } })).outputFiles[0].text;
  const stats = await import('data:text/javascript;base64,' + Buffer.from(out).toString('base64'));
  const sent = [];
  let reply = () => ({ status: 'success', value: { apps: 519, accounts: 12_305 } });
  globalThis.fetch = async (url, init) => { sent.push([url, JSON.parse(init.body)]); const b = reply(); return { ok: b.status === 'success', status: 200, json: async () => b }; };
  globalThis.sessionStorage = { getItem: () => null, setItem: () => {} };
  globalThis.navigator ??= {};
  const s1 = await stats.fetchStats();
  ok(JSON.stringify(s1) === '{"apps":510,"accounts":12000}' && sent[0]?.[0] === 'https://banc.convex.cloud/api/query' && sent[0][1].path === 'stats:get',
    `fetchStats : POST /api/query stats:get, arrondi (${JSON.stringify(s1)} ; ${JSON.stringify(sent[0])})`);
  reply = () => ({ status: 'error', errorMessage: 'panne' });
  const s2 = await stats.fetchStats();
  ok(JSON.stringify(s2) === JSON.stringify(stats.FALLBACK), `fetchStats : panne → chiffres de repli (${JSON.stringify(s2)})`);
  sent.length = 0; reply = () => ({ status: 'success', value: null });
  stats.countVisit();
  await new Promise((r) => setTimeout(r, 10));
  ok(sent[0]?.[0] === 'https://banc.convex.cloud/api/mutation' && sent[0][1].path === 'admin:visit', `countVisit : POST /api/mutation admin:visit (${JSON.stringify(sent[0])})`);
}

// ─── Styles : le canevas reste la référence (Q44), messages centrés (Q57), encoche (Q59) ──────────────────────
{
  const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');
  const same = ['design/ds/swarm/components/bundle.css:src/styles/ds/bundle.css', 'design/ds/swarm/tokens.css:src/styles/ds/tokens.css']
    .filter((x) => { const [a, b] = x.split(':'); return read(a) !== read(b); });
  ok(!same.length, `système de design : la copie du site est celle des canevas${same.length ? ` ; différent : ${same.join(', ')}` : ''}`);
  const css = read('src/app/app.css').replace(/\/\*[\s\S]*?\*\//g, '');
  // Sélecteurs de premier niveau (hors @keyframes) : seulement ce qui est propre au site et à son routeur.
  const body = css.replace(/@keyframes[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, '');
  const selectors = [...body.matchAll(/([^{}]+)\{[^{}]*\}/g)].map((m) => m[1].trim()).flatMap((x) => x.split(',').map((y) => y.trim())).filter((x) => x && !x.startsWith('@'));
  const SITE = [/^html$/, /^body$/, /^img\.is-broken$/, /^\.app-missing( |$)/, /^\.app-paid(\.is-[a-z]+)?$/, /^\.sw-hoverplay( |$)/, /^\.sw-video:has\(img\.is-broken\)::before$/,
    /^\.sw-flag(\.sw-flag-\d+)?\[data-c(="[^"]*")?\]$/, /^nav\[aria-label="Navigation principale"\]$/];
  const design = [...new Set(selectors.filter((x) => !SITE.some((re) => re.test(x))))];
  ok(!design.length, `app.css ne porte que ce qui est propre au site (audit Q44)${design.length ? ` ; règles de dessin : ${design.slice(0, 6).join(' ; ')}` : ''}`);
  ok(/\.sw-follow-stop\s*\{\s*display:\s*none/.test(read('design/ds/swarm/components/bundle.css')), 'bouton « Suivie » : la règle qui cache « Ne plus suivre » est dans le système de design, lu par les canevas');
  const anim = (css.match(/\.app-paid\s*\{[^}]*animation:\s*([\w-]+)/) ?? [])[1];
  const kf = anim ? (css.match(new RegExp(`@keyframes ${anim}\\s*\\{((?:[^{}]*\\{[^{}]*\\})*)`)) ?? [])[1] ?? '' : '';
  const steps = [...kf.matchAll(/\{([^}]*)\}/g)].map((m) => m[1]);
  ok(!!anim && steps.length >= 2 && steps.every((x) => !/transform/.test(x) || /translate(X)?\(-50%/.test(x)) && /width:\s*max-content/.test(css.match(/\.app-paid\s*\{[^}]*\}/)?.[0] ?? ''),
    `messages de paiement : l'entrée garde translateX(-50%), largeur du contenu (audit Q57 ; animation ${anim ?? 'aucune'})`);
  ok(/safe-area-inset-left/.test(css) && /safe-area-inset-right/.test(css), 'encoche à gauche et à droite prise en compte (audit Q59)');
  ok(/interactive-widget=resizes-content/.test(read('app.html')), 'app.html : le clavier réduit la page sur Chrome Android (audit Q72)');
  const sheets = ['MAjout', 'MNouvelleAlerte'].filter((m) => !/visualViewport/.test(read(`design/app/${m}.dc.html`)));
  ok(!sheets.length, `feuilles du bas à champ : suivent le clavier (visualViewport, audit Q72)${sheets.length ? ` ; manque : ${sheets.join(', ')}` : ''}`);
  const vh = ['MAjout', 'MNouvelleAlerte', 'MApps', 'MCreateurs', 'MCreateursCartes'].filter((m) => /max-height: (88|96)vh;(?! max-height: (calc\()?(88|96)dvh)/.test(read(`design/app/${m}.dc.html`)));
  ok(!vh.length, `feuilles du bas : hauteur en dvh (audit Q72)${vh.length ? ` ; encore en vh seul : ${vh.join(', ')}` : ''}`);
}

// ─── Q50 : formes d'id et de pseudo écrites une fois ────────────────────────────────────────────────────────────
const HOME = 'convex/coverSign.ts';
// Reste à faire avec la branche des constats hauts (fichier qu'elle modifie) : radarSync.ts (coverUrl de boardOpts).
const PENDING = new Set(['convex/radarSync.ts']);
const copies = [];
for (const f of walk(root, (x) => /\.(ts|js|mjs)$/.test(x) && !/(^|\/)(dist|\.bench-data|\.claude)\//.test(rel(x)))) {
  const r = rel(f);
  if (r === HOME || r === 'scripts/sources.test.mjs' || PENDING.has(r)) continue;
  const s = fs.readFileSync(f, 'utf8');
  if (/\\d\{6,25\}/.test(s)) copies.push(`${r} (id de vidéo)`);
  // La forme qui valide un pseudo (ancrée) ; un motif qui cherche « @pseudo » dans du texte livré (check-public) n'en est pas une.
  if (/\^\[A-Za-z0-9\._\]\{2,30\}\$/.test(s)) copies.push(`${r} (pseudo)`);
}
ok(!copies.length, `formes d'id de vidéo et de pseudo écrites seulement dans ${HOME}${copies.length ? ` ; copies : ${copies.join(', ')}` : ''}`);

console.log(fail ? `${fail} échec(s)` : 'tout passe');
process.exit(fail ? 1 : 0);
