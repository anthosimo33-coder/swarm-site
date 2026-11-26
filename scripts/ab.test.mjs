// Le test A/B de l'onboarding avant le paywall (26/11/2026) : le tirage du bras (src/ab.js), ce que /e accepte d'une page
// et ce qui part à PostHog (convex/abMath.ts), le bras écrit sur le compte à l'inscription (convex/ab.ts), l'événement
// « paiement » du webhook Whop (convex/whop.ts). Vraies fonctions, base en mémoire, faux PostHog.
// Usage : node scripts/ab.test.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { checker, load, memDb, root } from './test-kit.mjs';

const { ok, end } = checker();
const dir = path.join(root, 'convex');
const entry = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'kopycat-ab-')), 'entry.ts');
fs.writeFileSync(entry, ['ab', 'abMath', 'whop', 'session'].map((m) => `export * as ${m} from ${JSON.stringify(path.join(dir, m + '.ts'))};`).join('\n'));
const mods = await load(entry, [
  [/^@convex-dev\/auth\/server$/, `
export const getAuthUserId = async (ctx) => ctx.__userId ?? null;
export const getAuthSessionId = async (ctx) => ctx.__sessionId ?? null;
export const modifyAccountCredentials = async () => {}, retrieveAccount = async () => null;`],
]);
const { decideArm } = await load(path.join(root, 'src/ab.js'));

// ─── Le tirage : stable, imposable, moitié-moitié, jamais pour un robot ───
{
  let r = decideArm({ stored: 'B', forced: null, random: () => 0.1 });
  ok(r.arm === 'B' && !r.fresh, 'un bras déjà tiré reste le même (rien de nouveau à annoncer)');
  r = decideArm({ stored: null, forced: null, random: () => 0.49 });
  ok(r.arm === 'A' && r.fresh && !r.forced, 'premier passage, tirage < 0,5 : A, à garder et annoncer');
  r = decideArm({ stored: null, forced: null, random: () => 0.5 });
  ok(r.arm === 'B' && r.fresh, 'premier passage, tirage ≥ 0,5 : B');
  r = decideArm({ stored: 'A', forced: 'b', random: () => 0 });
  ok(r.arm === 'B' && r.forced && r.fresh, '?bras=b impose B (même sur un A déjà tiré), marqué « imposé »');
  r = decideArm({ stored: 'B', forced: 'B', random: () => 0 });
  ok(r.arm === 'B' && r.forced && !r.fresh, '?bras=B sur un B déjà tiré : rien de nouveau');
  r = decideArm({ stored: null, forced: 'X', random: () => 0.9 });
  ok(r.arm === 'B' && !r.forced, '?bras= inconnu : ignoré, tirage normal');
  r = decideArm({ stored: null, forced: null, random: () => 0.9, robot: true });
  ok(r.arm === 'A' && !r.fresh, 'un navigateur piloté reste en A, sans rien garder ni annoncer');
  let seed = 7, b = 0;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 20000; i++) if (decideArm({ stored: null, random: rnd }).arm === 'B') b++;
  ok(Math.abs(b / 20000 - 0.5) < 0.02, `20 000 tirages : ${(b / 200).toFixed(1)} % en B (50 % attendu)`);
}

// ─── Ce que /e accepte d'une page ───
{
  const { parsePageEvent, batchBody, testProps } = mods.abMath;
  const V = '3f2a8c1e-9b4d-4e7a-8f1c-2d3e4f5a6b7c';
  const okEv = parsePageEvent(JSON.stringify({ e: 'onboarding_vu', v: V, b: 'B', p: { etape: 3, ecran: 'niche' } }));
  ok(okEv && okEv.event === 'onboarding_vu' && okEv.bras === 'B' && okEv.props.ecran === 'niche' && okEv.user === null && !okEv.forced, 'un événement de page valide est lu');
  ok(parsePageEvent(JSON.stringify({ e: 'paiement', v: V, b: 'A' })) === null, '« paiement » ne vient jamais d\'une page (serveur seulement)');
  ok(parsePageEvent(JSON.stringify({ e: 'inscription', v: V, b: 'A' })) === null, '« inscription » non plus');
  ok(parsePageEvent(JSON.stringify({ e: 'onboarding_vu', v: 'pas-un-uuid', b: 'A' })) === null, 'identifiant qui n\'est pas un UUID : refusé');
  ok(parsePageEvent(JSON.stringify({ e: 'onboarding_vu', v: V, b: 'C' })) === null, 'bras inconnu : refusé');
  ok(parsePageEvent(JSON.stringify({ e: 'onboarding_vu', v: V, b: 'A', p: { ecran: 'x'.repeat(81) } })) === null, 'propriété trop longue : refusée');
  ok(parsePageEvent(JSON.stringify({ e: 'onboarding_vu', v: V, b: 'A', p: { ecran: { a: 1 } } })) === null, 'propriété qui n\'est pas une valeur simple : refusée');
  ok(parsePageEvent(JSON.stringify({ e: 'onboarding_vu', v: V, b: 'A', p: Object.fromEntries([...'abcdefghi'].map((k) => [k, 1])) })) === null, 'plus de 8 propriétés : refusé');
  ok(parsePageEvent('{pas du json') === null && parsePageEvent('x'.repeat(3000)) === null, 'texte illisible ou trop long : refusé');
  const withUser = parsePageEvent(JSON.stringify({ e: 'paywall_vu', v: V, b: 'A', u: 'k57abcdefghijklmnopqrstuvw', f: true, p: { ecran: 'formules' } }));
  ok(withUser && withUser.user === 'k57abcdefghijklmnopqrstuvw' && withUser.forced, 'compte connecté et bras imposé : transmis');
  const body = batchBody('phc_test', [{ event: 'inscription', distinctId: 'u1', properties: testProps('B', false), alias: V }]);
  ok(body.api_key === 'phc_test' && body.batch[0].event === '$identify' && body.batch[0].properties.$anon_distinct_id === V && body.batch[1].event === 'inscription',
    'à l\'inscription : $identify rattache le navigateur au compte, puis l\'événement');
  ok(body.batch[1].properties.bras === 'B' && body.batch[1].properties.test === 'onboarding-avant-paywall' && body.batch[1].properties.$set.bras_onboarding === 'B' && !('force' in body.batch[1].properties),
    'chaque événement porte le test, le bras, et le bras posé sur la personne');
}

// ─── Le bras écrit sur le compte à l'inscription ───
async function world({ email = 'lea@gmail.com', ageMs = 60_000 } = {}) {
  const m = memDb();
  const userId = await m.db.insert('users', { email });
  m.rows('users')[0]._creationTime = Date.now() - ageMs;
  const sessionId = await m.db.insert('authSessions', { userId, expirationTime: Infinity });
  const scheduled = [];
  const ctx = { db: m.db, __userId: userId, __sessionId: sessionId, scheduler: { runAfter: async (ms, ref, a) => { scheduled.push([ms, ref.__path, a]); } } };
  return { m, ctx, userId, scheduled };
}
const V = '3f2a8c1e-9b4d-4e7a-8f1c-2d3e4f5a6b7c';
{
  const w = await world();
  const r = await mods.ab.enroll.handler(w.ctx, { bras: 'B', visiteur: V });
  const u = w.m.rows('users')[0];
  ok(r === 'B' && u.abOnboarding === 'B' && u.abVisiteur === V && !u.abForce, 'compte créé il y a 1 min : le bras B est écrit sur le compte');
  ok(w.scheduled.length === 1 && w.scheduled[0][1] === 'ab.capture' && w.scheduled[0][2].events[0].event === 'inscription' && w.scheduled[0][2].events[0].alias === V,
    '« inscription » part à PostHog, avec le navigateur à rattacher');
  const again = await mods.ab.enroll.handler(w.ctx, { bras: 'A', visiteur: V });
  ok(again === 'B' && w.m.rows('users')[0].abOnboarding === 'B' && w.scheduled.length === 1, 'un second appel ne change pas le bras et n\'envoie rien');
}
{
  const w = await world({ ageMs: 31 * 60_000 });
  const r = await mods.ab.enroll.handler(w.ctx, { bras: 'B', visiteur: V });
  ok(r === null && !w.m.rows('users')[0].abOnboarding && !w.scheduled.length, 'compte de plus de 30 min (compte d\'avant) : hors du test');
}
{
  const w = await world({ email: 'test@exemple.fr' });
  const r = await mods.ab.enroll.handler(w.ctx, { bras: 'A', visiteur: V });
  ok(r === null && !w.m.rows('users')[0].abOnboarding, 'compte de test (@exemple.fr) : hors du test');
}
{
  const w = await world();
  const r = await mods.ab.enroll.handler(w.ctx, { bras: 'A', visiteur: V, force: true });
  ok(r === 'A' && w.m.rows('users')[0].abForce === true && w.scheduled[0][2].events[0].properties.force === true, 'bras imposé (?bras=) : écrit avec « abForce », événement marqué « force »');
}
{
  const w = await world();
  w.ctx.__userId = null;
  ok((await mods.ab.enroll.handler(w.ctx, { bras: 'B', visiteur: V })) === null, 'sans session : rien');
}

// ─── /e : relayé seulement s'il est valide, toujours 204 ───
{
  const scheduled = [];
  const ctx = { scheduler: { runAfter: async (ms, ref, a) => { scheduled.push(a); } } };
  const send = (body) => mods.ab.events(ctx, new Request('https://x.convex.site/e', { method: 'POST', body }));
  const r1 = await send(JSON.stringify({ e: 'paywall_vu', v: V, b: 'B', p: { ecran: 'plan' } }));
  const r2 = await send(JSON.stringify({ e: 'paiement', v: V, b: 'B' }));
  ok(r1.status === 204 && r2.status === 204 && r1.headers.get('Access-Control-Allow-Origin') === '*', '/e répond 204 dans tous les cas');
  ok(scheduled.length === 1 && scheduled[0].events[0].distinctId === V && scheduled[0].events[0].properties.ecran === 'plan', '/e ne relaie que l\'événement valide, au nom du navigateur');
}

// ─── PostHog : rien sans clé ; un envoi groupé avec la clé ───
{
  delete process.env.POSTHOG_KEY;
  const calls = [];
  globalThis.fetch = async (url, init) => { calls.push([String(url), JSON.parse(init.body)]); return new Response('{}', { status: 200 }); };
  const r0 = await mods.ab.capture.handler({}, { events: [{ event: 'onboarding_vu', distinctId: V, properties: {} }] });
  ok(!calls.length && /pas de clé/.test(r0), 'sans POSTHOG_KEY : rien ne part');
  process.env.POSTHOG_KEY = 'phc_test';
  await mods.ab.capture.handler({}, { events: [{ event: 'onboarding_vu', distinctId: V, properties: { bras: 'B' } }] });
  ok(calls.length === 1 && calls[0][0] === 'https://eu.i.posthog.com/batch/' && calls[0][1].api_key === 'phc_test' && calls[0][1].batch[0].distinct_id === V, 'avec la clé : un envoi groupé au serveur européen');
}

// ─── « paiement » : au premier passage d'un paiement à « payé », pour un compte du test ───
{
  const m = memDb();
  const inTest = await m.db.insert('users', { email: 'b@gmail.com', abOnboarding: 'B' });
  const outTest = await m.db.insert('users', { email: 'c@gmail.com' });
  const scheduled = [];
  const ctx = { db: m.db, scheduler: { runAfter: async (ms, ref, a) => { scheduled.push([ref.__path, a]); } } };
  const pay = (paymentId, userKey, status) => mods.whop.savePayment.handler(ctx, { paymentId, userKey, membershipId: null, total: '29.99', currency: 'eur', status, createdAt: Date.now() });
  await pay('pay_1', inTest, 'paid');
  ok(scheduled.length === 1 && scheduled[0][0] === 'ab.capture' && scheduled[0][1].events[0].event === 'paiement' && scheduled[0][1].events[0].distinctId === inTest && scheduled[0][1].events[0].properties.bras === 'B' && scheduled[0][1].events[0].properties.montant === '29.99',
    'paiement payé d\'un compte du test : « paiement » part, avec le bras et le montant');
  await pay('pay_1', inTest, 'paid');
  ok(scheduled.length === 1, 'le même paiement rejoué ne repart pas');
  await pay('pay_2', outTest, 'paid');
  ok(scheduled.length === 1, 'un compte hors du test n\'envoie rien');
  await pay('pay_3', inTest, 'failed');
  ok(scheduled.length === 1, 'un paiement échoué n\'envoie rien');
}

end();
