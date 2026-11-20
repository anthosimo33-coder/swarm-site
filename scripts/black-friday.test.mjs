// Audit du 19/11, Q1 (décision du 20/11) : le Black Friday finit vraiment le 30/11 à minuit (Paris). Ensuite, l'annuel
// est vendu 359,88 € (29,99 € / mois), sans −50 %, ni prix barré, ni « Économise ».
//   1. Serveur (convex/whop.ts) : checkout prend le tarif Whop au prix de la date, jamais un autre ; création du tarif
//      à 359,88 € (masqué jusqu'au 1/12) et bascule de minuit, API Whop simulée.
//   2. Écrans de prix (Tarifs, TarifsMobile, Formules, MFormules, Réglages) rendus le 25/11 puis le 2/12.
//   3. Une seule date partout ; la description de /tarifs et les CGV ne promettent plus 179,88 € après la fin.
// Usage : node scripts/black-friday.test.mjs   (ou <dossier convex>, pour la contre-épreuve du serveur)
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { h } from 'preact';
import { renderToString } from 'preact-render-to-string';
import { checker, load, memDb, quiet, root } from './test-kit.mjs';

const { ok, end } = checker();
const NOV25 = Date.parse('2026-11-25T12:00:00+01:00'), DEC02 = Date.parse('2026-12-02T12:00:00+01:00');
const DATE = "2026-12-01T00:00:00+01:00";
const realNow = Date.now;

// ─── 1. Serveur ───
const dir = path.resolve(process.argv[2] ?? path.join(root, 'convex'));
const entry = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'kopycat-q1-')), 'entry.ts');
fs.writeFileSync(entry, ['whop', 'session'].map((m) => `export * as ${m} from ${JSON.stringify(path.join(dir, m + '.ts'))};`).join('\n'));
const mods = await load(entry, [[/^@convex-dev\/auth\/server$/, `
export const getAuthUserId = async (ctx) => ctx.__userId ?? null;
export const getAuthSessionId = async (ctx) => ctx.__sessionId ?? null;
`]]);
process.env.WHOP_API_KEY = 'test';
let variants, calls;
const json = (x) => new Response(JSON.stringify(x), { status: 200, headers: { 'content-type': 'application/json' } });
globalThis.fetch = async (url, init = {}) => {
  const method = init.method ?? 'GET', body = init.body ? JSON.parse(init.body) : null;
  calls.push({ method, url: String(url), body });
  if (/\/variants\?/.test(url)) return json({ data: variants });
  // Le tarif créé reçoit l'id fixé dans convex/whop.ts (PLANS.annuel), comme celui créé en prod le 20/11.
  if (/\/variants$/.test(url) && method === 'POST') { const v = { id: 'plan_e3kvvjsKXFANv', ...body }; variants.push(v); return json(v); }
  const m = String(url).match(/\/variants\/([^/?]+)$/);
  if (m && method === 'PATCH') { Object.assign(variants.find((x) => x.id === m[1]), body); return json({}); }
  if (m) { const v = variants.find((x) => x.id === m[1]); return v ? json(v) : new Response('{"error":"introuvable"}', { status: 404 }); }
  if (/\/checkout_configurations$/.test(url)) return json({ purchase_url: 'https://whop.com/checkout/' + body.variant_id });
  return new Response('?', { status: 404 });
};
const reset = () => {
  calls = [];
  variants = [
    { id: 'plan_ZxcFeAaIiBMk1', billing_type: 'renewal', billing_period: 365, renewal_price: 179.88, initial_price: 179.88, currency: 'eur', visibility: 'visible', tax_type: 'inclusive' },
    { id: 'plan_ilOWoZwgoZGwK', billing_type: 'renewal', billing_period: 30, renewal_price: 29.99, initial_price: 29.99, currency: 'eur', visibility: 'visible', tax_type: 'inclusive' },
  ];
};
async function pay(formule, at) {
  const m = memDb();
  const userId = await m.db.insert('users', { email: 'a@exemple.fr' });
  const sessionId = await m.db.insert('authSessions', { userId, expirationTime: Infinity });
  const call = (ref, a) => { const [mod, fn] = ref.__path.split('.'); return mods[mod][fn].handler({ db: m.db }, a); };
  Date.now = () => at;
  try { return await mods.whop.checkout.handler({ __userId: userId, __sessionId: sessionId, runQuery: call, runMutation: call }, { formule, origin: 'https://swarm-site-one.vercel.app' }); }
  catch (e) { return { code: e?.data?.code ?? String(e?.message ?? e) }; }
  finally { Date.now = realNow; }
}
const planOf = (r) => r.url?.split('/').pop() ?? r.code;
reset();
ok(planOf(await pay('annuel', NOV25)) === 'plan_ZxcFeAaIiBMk1', `25/11 : l'annuel part au tarif Black Friday, 179,88 € (${planOf(await pay('annuel', NOV25))})`);
let r = await quiet(() => pay('annuel', DEC02));
ok(r.code === 'TARIF_INDISPONIBLE', `2/12, pas de tarif à 359,88 € sur Whop : refusé, jamais vendu 179,88 € (${planOf(r)})`);
ok(planOf(await pay('mensuel', DEC02)) === 'plan_ilOWoZwgoZGwK', 'le mensuel reste à 29,99 €');
// Création du tarif normal, puis bascule de minuit.
const sched = [];
const actx = { scheduler: { runAt: async (t, ref, a) => { sched.push([t, ref.__path, a]); }, runAfter: async () => null } };
const have = typeof mods.whop.creerAnnuelNormal?.handler === 'function';
ok(have, 'action whop.creerAnnuelNormal présente');
if (have) {
  Date.now = () => NOV25;
  const dry = await mods.whop.creerAnnuelNormal.handler(actx, {});
  ok(!calls.some((c) => c.method === 'POST' && /\/variants$/.test(c.url)) && dry.envoi?.renewal_price === 359.88 && dry.envoi?.billing_period === 365 && dry.envoi?.visibility === 'hidden' && dry.envoi?.initial_price === 359.88 && dry.envoi?.tax_type === 'inclusive',
    `sans apply : rien de créé, l'envoi prévu est un annuel à 359,88 €, masqué, taxe et prix initial copiés (${JSON.stringify(dry.envoi)})`);
  const made = await mods.whop.creerAnnuelNormal.handler(actx, { apply: true });
  const again = await mods.whop.creerAnnuelNormal.handler(actx, { apply: true });
  Date.now = realNow;
  ok(made.cree === 'plan_e3kvvjsKXFANv' && calls.filter((c) => c.method === 'POST' && /\/variants$/.test(c.url)).length === 1 && again.deja === 'plan_e3kvvjsKXFANv', 'apply : un seul tarif créé, même lancé deux fois');
  ok(sched.length === 1 && sched[0][0] === Date.parse(DATE) && sched[0][1] === 'whop.finBlackFriday', `bascule planifiée le 1/12 à 00:00 Paris (${sched[0] ? new Date(sched[0][0]).toISOString() : 'rien'})`);
  ok(planOf(await pay('annuel', NOV25)) === 'plan_ZxcFeAaIiBMk1', '25/11, tarif normal déjà créé (masqué) : toujours 179,88 €');
  ok(planOf(await pay('annuel', DEC02)) === 'plan_e3kvvjsKXFANv', '2/12 : l\'annuel part au tarif normal, 359,88 €, même avant la bascule');
  Date.now = () => DEC02;
  await quiet(() => mods.whop.finBlackFriday.handler({}, {}));
  Date.now = realNow;
  ok(variants.find((x) => x.id === 'plan_ZxcFeAaIiBMk1').visibility === 'hidden' && variants.find((x) => x.id === 'plan_e3kvvjsKXFANv').visibility === 'visible', 'à minuit : Black Friday masqué sur Whop, annuel normal visible');
}

// ─── 2. Écrans ───
const pages = { Tarifs: 'src/pages/Tarifs.js', TarifsMobile: 'src/pages/TarifsMobile.js', Formules: 'src/app/pages/Formules.js', MFormules: 'src/app/pages/MFormules.js', Reglages: 'src/app/pages/Reglages.js' };
const props = { Reglages: { user: { email: 'a@exemple.fr', pro: false, initiale: 'A' }, section: 'abo', abo: null, checkout: {} } };
const text = (Page, at, p) => { Date.now = () => at; try { return renderToString(h(Page, p ?? null)).replace(/<style[\s\S]*?<\/style>/g, ''); } finally { Date.now = realNow; } };
for (const [n, f] of Object.entries(pages)) {
  const { default: Page } = await import(path.join(root, f));
  const before = text(Page, NOV25, props[n]), after = text(Page, DEC02, props[n]);
  const bf = /14,99/.test(before) && /179,88/.test(before) && /−50/.test(before) && /line-through/.test(before);
  const leftovers = ['−50', 'line-through', '14,99', '179,88', 'Économise', 'Black Friday', 'J’en profite'].filter((w) => after.includes(w));
  ok(bf && !leftovers.length && /359,88/.test(after), `${n} : Black Friday le 25/11 ; le 2/12, 359,88 € sans réduction${leftovers.length ? ' — reste : ' + leftovers.join(', ') : ''}${/359,88/.test(after) ? '' : ' — 359,88 absent'}`);
}

// ─── 3. Une seule date, et les textes fixes ───
const files = ['convex/whop.ts', ...fs.readdirSync(path.join(root, 'design')).filter((f) => f.endsWith('.dc.html')).map((f) => 'design/' + f),
  ...fs.readdirSync(path.join(root, 'design/app')).filter((f) => f.endsWith('.dc.html')).map((f) => 'design/app/' + f)];
const dates = new Set();
for (const f of files) for (const m of fs.readFileSync(path.join(root, f), 'utf8').matchAll(/Date\.parse\(['"](2026-1[12]-[0-9T:+-]+)['"]\)/g)) dates.add(m[1]);
ok(dates.size === 1 && dates.has(DATE), `une seule fin du Black Friday, serveur et canevas : ${[...dates].join(', ')}`);
const meta = fs.readFileSync(path.join(root, 'tarifs.html'), 'utf8');
ok(!/179,88|−50/.test(meta), 'tarifs.html : la description ne promet plus 179,88 € (−50 %) pour toujours');
const cgv = fs.readFileSync(path.join(root, 'public/cgv.html'), 'utf8');
ok(/annuel : 359,88 € TTC par an/.test(cgv) && /30 novembre 2026/.test(cgv), 'CGV art. 3 : annuel à 359,88 €, offre Black Friday bornée au 30/11');
end();
