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
const MODS = ['whop', 'session', 'users', 'crons', 'authLimits'].filter((m) => fs.existsSync(path.join(dir, m + '.ts')));
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
    calls: [], down: false, failMemberships: false,
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
    if (whop.failMemberships) return new Response('panne', { status: 503 });
    const mem = whop.memberships[m[1]];
    if (!mem) return json({ error: 'introuvable' }, 404);
    if (m[2] && method === 'POST') { if (body?.cancel_at_period_end) mem.cancel_at_period_end = true; else mem.status = 'canceled'; }
    return json(mem);
  }
  if (p === '/memberships' && method === 'GET') return json({ data: Object.values(whop.memberships) });
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

// ─── S6 : l'adresse de retour de Whop n'accepte que le site de Kopycat ───
{
  resetWhop();
  process.env.SITE_URL = 'https://kopycat.example';
  const back = async (origin) => {
    whop.calls = [];
    await checkout(await world(), 'mensuel', NOV25, origin);
    return whop.calls.find((c) => c.path === '/checkout_configurations')?.body?.redirect_url ?? null;
  };
  ok((await back('https://kopycat-paiement.example')) === 'https://kopycat.example/app?paiement=ok', `S6 : un site tiers en https est remplacé par SITE_URL (${await back('https://kopycat-paiement.example')})`);
  ok((await back('https://swarm-site-one.vercel.app')) === 'https://swarm-site-one.vercel.app/app?paiement=ok', 'S6 : le domaine Vercel du site est gardé');
  ok((await back('http://localhost:5173')) === 'https://kopycat.example/app?paiement=ok', 'S6 : localhost refusé en prod');
  ok((await back('https://swarm-site-abc123-anthosimo33-coders-projects.vercel.app')) === 'https://kopycat.example/app?paiement=ok', 'S6 : une préversion Vercel refusée en prod');
  process.env.SWARM_DEV_ORIGINS = '1';
  ok((await back('http://localhost:5173')) === 'http://localhost:5173/app?paiement=ok' && (await back('https://swarm-site-abc123-anthosimo33-coders-projects.vercel.app')) === 'https://swarm-site-abc123-anthosimo33-coders-projects.vercel.app/app?paiement=ok', 'S6 : localhost et préversions du projet acceptés sur le dev (SWARM_DEV_ORIGINS=1)');
  ok((await back('https://swarm-site-abc.evil.vercel.app')) === 'https://kopycat.example/app?paiement=ok', 'S6 : même sur le dev, une préversion d\'un autre projet est refusée');
  delete process.env.SWARM_DEV_ORIGINS; delete process.env.SITE_URL;
}

// ─── F6 : un compte ne crée pas de liens de paiement en boucle chez Whop ───
{
  resetWhop();
  const w = await world();
  const links = () => whop.calls.filter((c) => c.path === '/checkout_configurations').length;
  const a = await checkout(w, 'mensuel', NOV25), b = await checkout(w, 'mensuel', NOV25 + 60_000);
  ok(links() === 1 && a.url && a.url === b.url, `F6 : le même lien resservi pendant 1 h, un seul créé chez Whop (${links()})`);
  await checkout(w, 'annuel', NOV25 + 120_000);
  ok(links() === 2, 'F6 : une autre formule, un autre lien');
  const c = await checkout(w, 'annuel', Date.parse('2026-12-01T00:10:00+01:00'));
  ok(links() === 3 && planOf(c) === 'plan_e3kvvjsKXFANv', 'F6 : un lien Black Friday n\'est jamais resservi après la fin du Black Friday');
  let refused = 0;
  for (let i = 0; i < 15 && !refused; i++) {
    w.m.tables.checkoutLinks = []; // forcer un nouveau lien à chaque appel
    const r = await quiet(() => checkout(w, 'mensuel', NOV25 + 200_000 + i * 1000));
    if (r.code === 'TROP_DE_DEMANDES') refused = i + 1;
  }
  ok(refused > 0 && refused <= 11, `F6 : au-delà de 10 liens neufs par heure, TROP_DE_DEMANDES (refus au ${refused || '?'}e)`);
}

// ─── Q27 : un événement Whop n'est marqué traité qu'une fois traité ───
const { createHmac } = await import('node:crypto');
async function deliver(w, id, event) {
  const ts = String(Math.floor(Date.now() / 1000)), body = JSON.stringify(event);
  const sig = 'v1,' + createHmac('sha256', Buffer.from('dGVzdA==', 'base64')).update(`${id}.${ts}.${body}`).digest('base64');
  const req = new Request('https://x.convex.site/whop/webhook', { method: 'POST', body, headers: { 'webhook-id': id, 'webhook-timestamp': ts, 'webhook-signature': sig } });
  const res = await quiet(() => mods.whop.webhook(w.ctx, req));
  return { status: res.status, text: await res.text() };
}
{
  resetWhop();
  const w = await world();
  whop.memberships.mem_q27 = { id: 'mem_q27', status: 'active', product: { id: PRODUCT }, plan: { id: 'plan_ilOWoZwgoZGwK' }, metadata: { kopycat_user: w.userId }, cancel_at_period_end: false };
  // (a) Un renvoi arrive pendant que le premier traitement tourne encore : Whop doit réessayer, pas recevoir 200.
  await w.call({ __path: 'whop.claimEvent' }, { eventId: 'evt_a', type: 'membership.went_valid' });
  const dup = await deliver(w, 'evt_a', { type: 'membership.went_valid', data: { id: 'mem_q27' } });
  ok(dup.status >= 400 && dup.status !== 401, `Q27 : un doublon pendant le traitement est renvoyé à plus tard (${dup.status} ${dup.text})`);
  // (b) Paiement reçu mais adhésion illisible : 500, et l'événement reste à traiter.
  whop.failMemberships = true;
  const pay = await deliver(w, 'evt_b', { type: 'payment.succeeded', data: { id: 'pay_1', membership_id: 'mem_q27', metadata: { kopycat_user: w.userId }, total: 29.99, currency: 'eur' } });
  whop.failMemberships = false;
  ok(pay.status === 500, `Q27 : un paiement dont l'adhésion ne se relit pas répond 500, Whop le renverra (${pay.status} ${pay.text})`);
  const again = await deliver(w, 'evt_b', { type: 'payment.succeeded', data: { id: 'pay_1', membership_id: 'mem_q27', metadata: { kopycat_user: w.userId }, total: 29.99, currency: 'eur' } });
  ok(again.status === 200 && (await w.m.db.get(w.userId)).pro === true, `Q27 : le renvoi est traité, l'accès s'ouvre (${again.status})`);
  const twice = await deliver(w, 'evt_b', { type: 'payment.succeeded', data: { id: 'pay_1' } });
  ok(twice.status === 200 && /déjà/.test(twice.text), 'Q27 : un événement traité n\'est pas refait');
}

// ─── S9 : un instantané périmé n'écrase plus le bon état ; une réconciliation quotidienne rattrape le reste ───
{
  resetWhop();
  const w = await world();
  const save = (status, updatedAt) => w.call({ __path: 'whop.saveMembership' }, { membershipId: 'mem_s9', userKey: w.userId, variantId: 'plan_ilOWoZwgoZGwK', productId: PRODUCT, status, periodDays: 30, price: '29.99', currency: 'eur', periodEnd: Date.now() + 864e5, cancelAtPeriodEnd: false, manageUrl: null, whopUpdatedAt: updatedAt });
  await save('active', 1000);
  await save('expired', 3000);
  await quiet(() => save('active', 2000)); // le went_valid lent arrive après le went_invalid
  ok((await w.m.db.get(w.userId)).pro !== true, 'S9 : un instantané plus ancien que celui rangé est ignoré (pas de Pro rouvert)');
  // Whop en panne : le repli sur la charge de l'événement ne rend jamais l'accès à une adhésion rangée sans accès.
  whop.memberships.mem_s9 = { id: 'mem_s9', status: 'expired', product: { id: PRODUCT }, plan: { id: 'plan_ilOWoZwgoZGwK' }, metadata: { kopycat_user: w.userId } };
  whop.failMemberships = true;
  const old = await deliver(w, 'evt_s9', { type: 'membership.went_valid', data: { id: 'mem_s9', status: 'active', metadata: { kopycat_user: w.userId } } });
  ok(old.status === 500 && (await w.m.db.get(w.userId)).pro !== true, `S9 : Whop en panne, un ancien went_valid rejoué ne rouvre pas l'accès (${old.status})`);
  // … mais une première activation n'est pas perdue.
  const v = await world();
  const first = await deliver(v, 'evt_s9b', { type: 'membership.went_valid', data: { id: 'mem_neuve', status: 'active', product: { id: PRODUCT }, plan: { id: 'plan_ilOWoZwgoZGwK' }, metadata: { kopycat_user: v.userId } } });
  whop.failMemberships = false;
  ok(first.status === 200 && (await v.m.db.get(v.userId)).pro === true, `S9 : Whop en panne, une première activation passe sur la charge de l'événement (${first.status})`);
  // Réconciliation : une adhésion rangée active que Whop dit expirée.
  const r = await world();
  await r.call({ __path: 'whop.saveMembership' }, { membershipId: 'mem_rec', userKey: r.userId, variantId: 'plan_ilOWoZwgoZGwK', productId: PRODUCT, status: 'active', periodDays: 30, price: '29.99', currency: 'eur', periodEnd: Date.now() - 864e5, cancelAtPeriodEnd: false, manageUrl: null });
  whop.memberships.mem_rec = { id: 'mem_rec', status: 'expired', product: { id: PRODUCT }, plan: { id: 'plan_ilOWoZwgoZGwK' }, metadata: { kopycat_user: r.userId } };
  const has = typeof mods.whop.reconcile?.handler === 'function';
  if (has) await quiet(() => mods.whop.reconcile.handler(r.ctx, {}));
  ok(has && (await r.m.db.get(r.userId)).pro !== true, 'S9 : la réconciliation relit chez Whop et coupe l\'accès d\'une adhésion expirée');
  const jobs = mods.crons?.default?.jobs ?? [];
  ok(jobs.some((j) => j.ref?.__path === 'whop.reconcile'), `S9 : réconciliation planifiée chaque jour (${jobs.map((j) => j.ref?.__path).join(', ')})`);
  // Convex refuse au déploiement un nom de tâche planifiée hors ASCII (« Invalid cron identifier »).
  ok(jobs.every((j) => /^[\x20-\x7e]+$/.test(j.name)), `crons : noms de tâches en ASCII (${jobs.filter((j) => !/^[\x20-\x7e]+$/.test(j.name)).map((j) => j.name).join(', ') || 'tous'})`);
}

// ─── S10 : un remboursement total ou un litige coupe l'accès, même si Whop laisse l'adhésion active ───
async function paidWorld(mem, pay) {
  const w = await world();
  whop.memberships[mem] = { id: mem, status: 'active', product: { id: PRODUCT }, plan: { id: 'plan_ilOWoZwgoZGwK' }, metadata: { kopycat_user: w.userId }, cancel_at_period_end: false };
  await deliver(w, 'evt_v_' + mem, { type: 'membership.went_valid', data: { id: mem } });
  await deliver(w, 'evt_p_' + mem, { type: 'payment.succeeded', data: { id: pay, membership_id: mem, metadata: { kopycat_user: w.userId }, total: 29.99, currency: 'eur' } });
  return w;
}
{
  resetWhop();
  let w = await paidWorld('mem_r1', 'pay_r1');
  const pro0 = (await w.m.db.get(w.userId)).pro === true;
  whop.calls = [];
  // La charge d'un remboursement ne porte pas l'adhésion : elle se retrouve par le paiement rangé.
  const r = await deliver(w, 'evt_rf1', { type: 'refund.updated', data: { id: 'rf_1', payment_id: 'pay_r1', status: 'succeeded', amount: 29.99 } });
  const cancelled = whop.calls.some((c) => c.method === 'POST' && c.path === '/memberships/mem_r1/cancel' && !c.body?.cancel_at_period_end);
  ok(pro0 && cancelled && (await w.m.db.get(w.userId)).pro !== true, `S10 : remboursement total, adhésion résiliée tout de suite et accès coupé (${r.status}, résiliée : ${cancelled})`);
  w = await paidWorld('mem_r2', 'pay_r2');
  await deliver(w, 'evt_rf2', { type: 'refund.updated', data: { id: 'rf_2', payment_id: 'pay_r2', status: 'succeeded', amount: 10 } });
  ok((await w.m.db.get(w.userId)).pro === true, 'S10 : remboursement partiel, l\'accès reste');
  w = await paidWorld('mem_r3', 'pay_r3');
  await deliver(w, 'evt_rf3', { type: 'refund.created', data: { id: 'rf_3', payment_id: 'pay_r3', status: 'pending', amount: 29.99 } });
  ok((await w.m.db.get(w.userId)).pro === true, 'S10 : remboursement en attente, rien ne change encore');
  w = await paidWorld('mem_d1', 'pay_d1');
  await deliver(w, 'evt_dp1', { type: 'dispute.created', data: { id: 'dp_1', payment_id: 'pay_d1' } });
  ok((await w.m.db.get(w.userId)).pro !== true, 'S10 : litige (opposition), accès coupé');
  // Un événement d'adhésion ultérieur (renouvellement) ne rouvre pas un accès coupé pour remboursement.
  whop.memberships.mem_d1.status = 'active';
  await deliver(w, 'evt_v2_d1', { type: 'membership.went_valid', data: { id: 'mem_d1' } });
  ok((await w.m.db.get(w.userId)).pro !== true, 'S10 : un went_valid ultérieur ne rouvre pas l\'accès coupé');
}

// ─── Q5 : un Pro posé à la main et une révocation à la main tiennent face aux événements Whop ───
{
  resetWhop();
  let w = await world();
  await w.call({ __path: 'users.setPro' }, { email: 'a@exemple.fr', pro: true });
  await w.call({ __path: 'whop.saveMembership' }, { membershipId: 'mem_q5', userKey: w.userId, variantId: 'plan_ilOWoZwgoZGwK', productId: PRODUCT, status: 'active', periodDays: 30, price: '29.99', currency: 'eur', periodEnd: null, cancelAtPeriodEnd: false, manageUrl: null });
  await w.call({ __path: 'whop.saveMembership' }, { membershipId: 'mem_q5', userKey: w.userId, variantId: 'plan_ilOWoZwgoZGwK', productId: PRODUCT, status: 'expired', periodDays: 30, price: '29.99', currency: 'eur', periodEnd: null, cancelAtPeriodEnd: false, manageUrl: null });
  ok((await w.m.db.get(w.userId)).pro === true, 'Q5 : l\'adhésion expire, le Pro posé à la main reste');
  w = await world();
  await w.call({ __path: 'whop.saveMembership' }, { membershipId: 'mem_q5b', userKey: w.userId, variantId: 'plan_ilOWoZwgoZGwK', productId: PRODUCT, status: 'active', periodDays: 30, price: '29.99', currency: 'eur', periodEnd: null, cancelAtPeriodEnd: false, manageUrl: null });
  await w.call({ __path: 'users.setPro' }, { email: 'a@exemple.fr', pro: false });
  await w.call({ __path: 'whop.saveMembership' }, { membershipId: 'mem_q5b', userKey: w.userId, variantId: 'plan_ilOWoZwgoZGwK', productId: PRODUCT, status: 'active', periodDays: 30, price: '29.99', currency: 'eur', periodEnd: null, cancelAtPeriodEnd: false, manageUrl: null });
  ok((await w.m.db.get(w.userId)).pro !== true, 'Q5 : une révocation à la main n\'est pas rouverte par l\'événement suivant');
  const back = await attempt(() => w.call({ __path: 'users.setPro' }, { email: 'a@exemple.fr', pro: null }));
  ok(!back.code && (await w.m.db.get(w.userId)).pro === true, `Q5 : setPro null rend la main à Whop (adhésion active : Pro) (${back.code ?? 'ok'})`);
}

// ─── Q28 : formule et prix déduits du tarif quand l'adhésion ne les porte pas ───
{
  resetWhop();
  const w = await world();
  // Adhésion v1 sans billing_period_days ni renewal_price : seul le tarif est connu.
  whop.memberships.mem_q28 = { id: 'mem_q28', status: 'active', product: { id: PRODUCT }, plan: { id: 'plan_ZxcFeAaIiBMk1' }, metadata: { kopycat_user: w.userId }, cancel_at_period_end: false };
  await deliver(w, 'evt_q28', { type: 'membership.went_valid', data: { id: 'mem_q28' } });
  const mine = await mods.whop.mine.handler(w.ctx, {});
  ok(mine?.sub?.formule === 'annuel' && Number(mine?.sub?.price) === 179.88 && mine?.sub?.currency === 'eur', `Q28 : abonnement annuel affiché « annuel », 179,88 € (${JSON.stringify(mine?.sub && { formule: mine.sub.formule, price: mine.sub.price, currency: mine.sub.currency })})`);
}

// ─── Q6 : « Vérifier mon paiement » relit chez Whop les adhésions de la personne quand le webhook n'arrive pas ───
{
  resetWhop();
  const w = await world();
  whop.memberships.mem_q6 = { id: 'mem_q6', status: 'active', product: { id: PRODUCT }, plan: { id: 'plan_ilOWoZwgoZGwK' }, metadata: { kopycat_user: w.userId }, cancel_at_period_end: false };
  whop.memberships.mem_autre = { id: 'mem_autre', status: 'active', product: { id: PRODUCT }, plan: { id: 'plan_ilOWoZwgoZGwK' }, metadata: { kopycat_user: 'users|999' }, cancel_at_period_end: false };
  const has = typeof mods.whop.verifierPaiement?.handler === 'function';
  const r = has ? await attempt(() => mods.whop.verifierPaiement.handler(w.ctx, {})) : null;
  ok(has && r?.pro === true && (await w.m.db.get(w.userId)).pro === true, `Q6 : webhook perdu, la vérification trouve l'adhésion et ouvre l'accès (${JSON.stringify(r)})`);
  ok(!(w.m.tables.subscriptions ?? []).some((x) => x.membershipId === 'mem_autre'), 'Q6 : l\'adhésion d\'une autre personne n\'est pas rangée');
  let refused = 0;
  if (has) for (let i = 0; i < 10 && !refused; i++) if ((await attempt(() => mods.whop.verifierPaiement.handler(w.ctx, {}))).code === 'TROP_DE_DEMANDES') refused = i + 2;
  ok(refused > 0, `Q6 : vérification limitée (refus au ${refused || '?'}e appel en 10 min)`);
}

end();
