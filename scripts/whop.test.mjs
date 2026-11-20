// Constats « moyenne » de l'audit du 19/11 sur le paiement Whop (convex/whop.ts) : une section par constat. Les vraies
// fonctions, une base en mémoire et un faux Whop (tarifs, adhésions, paiements, liens de paiement).
// Usage : node scripts/whop.test.mjs   (ou <dossier convex>, pour la contre-épreuve)
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { checker, load, memDb, quiet, root } from './test-kit.mjs';

const { ok, end } = checker();
const dir = path.resolve(process.argv[2] ?? path.join(root, 'convex'));
const entry = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'kopycat-whop-')), 'entry.ts');
const MODS = ['whop', 'session', 'users', 'crons'].filter((m) => fs.existsSync(path.join(dir, m + '.ts')));
fs.writeFileSync(entry, MODS.map((m) => `export * as ${m} from ${JSON.stringify(path.join(dir, m + '.ts'))};`).join('\n'));
const mods = await load(entry, [
  [/^@convex-dev\/auth\/server$/, `
export const getAuthUserId = async (ctx) => ctx.__userId ?? null;
export const getAuthSessionId = async (ctx) => ctx.__sessionId ?? null;
export const modifyAccountCredentials = async () => {}, retrieveAccount = async () => null;`],
  [/^convex\/server$/, `export const cronJobs = () => { const jobs = []; const add = (kind) => (name, ...a) => jobs.push({ kind, name, ref: a[a.length - 2], args: a[a.length - 1] }); return { jobs, daily: add('daily'), interval: add('interval'), cron: add('cron'), hourly: add('hourly') }; };`],
]);
process.env.WHOP_API_KEY = 'test';
process.env.WHOP_WEBHOOK_SECRET = 'whsec_dGVzdA==';

// ─── Le faux Whop ───
const PRODUCT = 'prod_WtWqNkTHQMRA9';
let whop;
function resetWhop() {
  whop = {
    calls: [], down: false,
    variants: {
      plan_ilOWoZwgoZGwK: { id: 'plan_ilOWoZwgoZGwK', product: { id: PRODUCT }, billing_type: 'renewal', billing_period: 30, renewal_price: 29.99, initial_price: 0, currency: 'eur', visibility: 'visible' },
      plan_ZxcFeAaIiBMk1: { id: 'plan_ZxcFeAaIiBMk1', product: { id: PRODUCT }, billing_type: 'renewal', billing_period: 365, renewal_price: 179.88, initial_price: 0, currency: 'eur', visibility: 'visible' },
      plan_e3kvvjsKXFANv: { id: 'plan_e3kvvjsKXFANv', product: { id: PRODUCT }, billing_type: 'renewal', billing_period: 365, renewal_price: 359.88, initial_price: 0, currency: 'eur', visibility: 'hidden' },
      // Un tarif hebdomadaire visible, à un autre prix : jamais vendu.
      plan_hebdo: { id: 'plan_hebdo', product: { id: PRODUCT }, billing_type: 'renewal', billing_period: 7, renewal_price: 4.99, initial_price: 0, currency: 'eur', visibility: 'visible' },
    },
    memberships: {}, payments: {},
  };
}
const json = (x, status = 200) => new Response(JSON.stringify(x), { status, headers: { 'content-type': 'application/json' } });
globalThis.fetch = async (url, init = {}) => {
  const u = new URL(String(url)), method = init.method ?? 'GET', body = init.body ? JSON.parse(init.body) : null;
  whop.calls.push({ method, path: u.pathname.replace('/api/v1', ''), query: u.search, body });
  if (whop.down) return new Response('panne', { status: 503 });
  const p = u.pathname.replace('/api/v1', '');
  let m;
  if (p === '/variants' && method === 'GET') {
    // Comme la doc : par product_ids sans account_id, seuls les tarifs visibles.
    const all = Object.values(whop.variants);
    return json({ data: u.searchParams.get('account_id') ? all : all.filter((x) => x.visibility === 'visible') });
  }
  if ((m = p.match(/^\/variants\/([^/]+)$/))) {
    const v = whop.variants[m[1]];
    if (!v) return json({ error: 'introuvable' }, 404);
    if (method === 'PATCH') Object.assign(v, body);
    return json(v);
  }
  if (p === '/variants' && method === 'POST') { const v = { id: 'plan_cree' + Object.keys(whop.variants).length, product: { id: body.product_id }, ...body }; whop.variants[v.id] = v; return json(v); }
  if (p === '/checkout_configurations' && method === 'POST') return json({ id: 'ch_1', purchase_url: 'https://whop.com/checkout/' + body.variant_id });
  if ((m = p.match(/^\/memberships\/([^/]+)(\/cancel)?$/))) {
    const mem = whop.memberships[m[1]];
    if (!mem) return json({ error: 'introuvable' }, 404);
    if (m[2] && method === 'POST') { if (body?.cancel_at_period_end) mem.cancel_at_period_end = true; else mem.status = 'canceled'; }
    return json(mem);
  }
  if ((m = p.match(/^\/payments\/([^/]+)$/))) { const pay = whop.payments[m[1]]; return pay ? json(pay) : json({ error: 'introuvable' }, 404); }
  return json({ error: 'route inconnue ' + p }, 404);
};

/** Un monde : une base, un compte (connecté), et un contexte d'action qui appelle les vraies fonctions. */
async function world({ pro, at } = {}) {
  const m = memDb();
  const userId = await m.db.insert('users', { email: 'a@exemple.fr', ...(pro ? { pro: true } : {}) });
  const sessionId = await m.db.insert('authSessions', { userId, expirationTime: Infinity });
  const scheduled = [];
  const call = (ref, a) => { const [mod, fn] = ref.__path.split('.'); const f = mods[mod]?.[fn]; if (!f) throw new Error('fonction inconnue ' + ref.__path); return f.handler(ctx, a); };
  const ctx = {
    db: m.db, __userId: userId, __sessionId: sessionId, runQuery: call, runMutation: call, runAction: call,
    scheduler: { runAfter: async (ms, ref, a) => { scheduled.push([ms, ref.__path, a]); }, runAt: async (t, ref, a) => { scheduled.push([t, ref.__path, a]); } },
  };
  return { m, ctx, userId, scheduled, call };
}
const withNow = async (at, f) => { const real = Date.now; if (at) Date.now = () => at; try { return await f(); } finally { Date.now = real; } };
const attempt = async (f) => { try { return await f(); } catch (e) { return { code: e?.data?.code ?? String(e?.message ?? e) }; } };
const NOV25 = Date.parse('2026-11-25T12:00:00+01:00'), DEC02 = Date.parse('2026-12-02T12:00:00+01:00');
const checkout = (w, formule, at, origin = 'https://swarm-site-one.vercel.app') =>
  withNow(at, () => attempt(() => mods.whop.checkout.handler(w.ctx, { formule, origin })));
const planOf = (r) => r.url?.split('/').pop() ?? r.code;

// ─── Q26 : tarifs fixés et vérifiés ; produit et tarif contrôlés à l'adhésion ───
{
  resetWhop();
  let w = await world();
  ok(planOf(await checkout(w, 'annuel', DEC02)) === 'plan_e3kvvjsKXFANv', `Q26 : le 2/12, l'annuel part au tarif fixé à 359,88 €, même masqué sur Whop (${planOf(await checkout(w, 'annuel', DEC02))})`);
  ok(planOf(await checkout(w, 'mensuel', NOV25)) === 'plan_ilOWoZwgoZGwK', 'Q26 : le mensuel part au tarif fixé, jamais au premier tarif « ≤ 31 jours » (hebdo)');
  whop.variants.plan_ilOWoZwgoZGwK.renewal_price = 34.99;
  w = await world();
  const r = await quiet(() => checkout(w, 'mensuel', NOV25));
  ok(r.code === 'TARIF_INDISPONIBLE', `Q26 : un tarif dont le prix a changé chez Whop n'est plus vendu (${planOf(r)})`);
  // Adhésion d'un autre produit ou d'un tarif inconnu : pas d'accès.
  resetWhop();
  w = await world();
  whop.memberships.mem_x = { id: 'mem_x', status: 'active', product: { id: 'prod_AUTRE' }, plan: { id: 'plan_autre' }, metadata: { kopycat_user: w.userId }, cancel_at_period_end: false };
  await quiet(() => attempt(() => w.call({ __path: 'whop.saveMembership' }, { membershipId: 'mem_x', userKey: w.userId, variantId: 'plan_autre', productId: 'prod_AUTRE', status: 'active', periodDays: null, price: null, currency: null, periodEnd: null, cancelAtPeriodEnd: false, manageUrl: null })));
  ok(!(await w.m.db.get(w.userId)).pro, 'Q26 : une adhésion à un autre produit ne donne pas Pro');
}

// ─── Q29 : tarifs vendus seulement par l'app ; un achat sans compte est noté, puis rattaché à la main ───
{
  resetWhop();
  const w = await world();
  await withNow(DEC02, () => quiet(() => attempt(() => mods.whop.finBlackFriday.handler(w.ctx, {}))));
  ok(whop.variants.plan_ZxcFeAaIiBMk1.visibility === 'hidden' && whop.variants.plan_e3kvvjsKXFANv.visibility === 'hidden', `Q29 : à minuit le 1/12, l'annuel Black Friday est masqué et l'annuel normal le reste (${whop.variants.plan_e3kvvjsKXFANv.visibility})`);
  resetWhop();
  const has = typeof mods.whop.masquerTarifs?.handler === 'function';
  ok(has, 'Q29 : action whop.masquerTarifs présente');
  if (has) {
    await quiet(() => mods.whop.masquerTarifs.handler(w.ctx, {}));
    ok(['plan_ilOWoZwgoZGwK', 'plan_ZxcFeAaIiBMk1', 'plan_e3kvvjsKXFANv'].every((id) => whop.variants[id].visibility === 'hidden') && whop.variants.plan_hebdo.visibility === 'visible', 'Q29 : les trois tarifs de Kopycat Pro masqués sur Whop, rien d\'autre touché');
    ok(planOf(await checkout(await world(), 'mensuel', NOV25)) === 'plan_ilOWoZwgoZGwK', 'Q29 : un tarif masqué se vend toujours par l\'app');
  }
  // Achat fait sur Whop sans passer par l'app : aucune metadata.
  const v = await world();
  await quiet(() => attempt(() => v.call({ __path: 'whop.saveMembership' }, { membershipId: 'mem_seul', userKey: null, variantId: 'plan_ilOWoZwgoZGwK', productId: PRODUCT, status: 'active', periodDays: 30, price: '29.99', currency: 'eur', periodEnd: Date.now() + 864e5, cancelAtPeriodEnd: false, manageUrl: null })));
  const orphans = mods.whop.sansCompte ? await v.call({ __path: 'whop.sansCompte' }, {}) : null;
  ok(Array.isArray(orphans) && orphans.length === 1 && orphans[0].membershipId === 'mem_seul', `Q29 : l'achat sans compte est gardé et listé (${orphans ? orphans.length : 'pas de whop.sansCompte'})`);
  const linked = mods.whop.rattacher ? await attempt(() => v.call({ __path: 'whop.rattacher' }, { membershipId: 'mem_seul', email: 'A@exemple.fr ' })) : null;
  ok(!!linked && (await v.m.db.get(v.userId)).pro === true && (await v.call({ __path: 'whop.sansCompte' }, {})).length === 0, `Q29 : rattaché à la main par e-mail, le compte passe Pro (${JSON.stringify(linked)})`);
}

end();
