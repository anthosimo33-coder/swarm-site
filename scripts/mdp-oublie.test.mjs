// Mot de passe oublié (24/11, parcours B) : le vrai fournisseur « password » de convex/auth.ts (flows reset,
// reset-check, reset-verification), convex/passwordReset.ts, convex/mail.ts et le gabarit du mail, avec les vraies
// mutations de Convex Auth 0.0.96 (auth:store), sur une base en mémoire. L'envoi chez Resend est remplacé par un relevé.
// Usage : node scripts/mdp-oublie.test.mjs   (ou <autre dossier convex/>, pour la contre-épreuve)
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { checker, load, memDb, root } from './test-kit.mjs';

const IMPL = path.join(root, 'node_modules/@convex-dev/auth/dist/server/implementation');
const { createAccountFromCredentialsImpl } = await import(path.join(IMPL, 'mutations/createAccountFromCredentials.js'));
const { retrieveAccountWithCredentialsImpl } = await import(path.join(IMPL, 'mutations/retrieveAccountWithCredentials.js'));
const { modifyAccountImpl } = await import(path.join(IMPL, 'mutations/modifyAccount.js'));
const dir = path.resolve(process.argv[2] ?? path.join(root, 'convex'));
const entry = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'kopycat-mdp-')), 'entry.ts');
const MODS = ['auth', 'authLimits', 'users', 'session', 'whop', 'passwordReset', 'mail', 'mailTemplates'];
fs.writeFileSync(entry, MODS.map((m) => `export * as ${m} from ${JSON.stringify(path.join(dir, m + '.ts'))};`).join('\n'));
const mods = await load(entry, [[/^@convex-dev\/auth\/server$/, `
export { createAccount, retrieveAccount, modifyAccountCredentials } from ${JSON.stringify(path.join(IMPL, 'index.js'))};
export const convexAuth = (config) => { globalThis.__authConfig = config; return {}; };
export const getAuthUserId = async (ctx) => ctx.__userId ?? null;
export const getAuthSessionId = async (ctx) => ctx.__sessionId ?? null;
`]]);
const config = globalThis.__authConfig;
const materialize = (p) => (typeof p === 'function' ? p() : p.options ? { ...p, ...p.options } : p);
const providers = config.providers.map(materialize);
const password = providers.find((p) => p.id === 'password');
const getProviderOrThrow = (id) => { const p = providers.find((x) => x.id === id); if (!p) throw new Error(`fournisseur ${id}`); return p; };

/** Une base, un contexte d'action et les e-mails planifiés (`sent`). */
function world() {
  const m = memDb();
  const sent = [];
  const scheduler = { runAfter: async (ms, ref, args) => { sent.push({ fn: ref.__path, args }); } };
  const dbCtx = { db: m.db, scheduler, auth: { getUserIdentity: async () => null } };
  const call = (ref, a) => {
    if (ref === 'auth:store') {
      const { type, ...args } = a.args;
      if (type === 'createAccountFromCredentials') return createAccountFromCredentialsImpl(dbCtx, args, getProviderOrThrow, config);
      if (type === 'retrieveAccountWithCredentials') return retrieveAccountWithCredentialsImpl(dbCtx, args, getProviderOrThrow, config);
      if (type === 'modifyAccount') return modifyAccountImpl(dbCtx, args, getProviderOrThrow);
      throw new Error('auth:store ' + type);
    }
    const [mod, fn] = ref.__path.split('.');
    const f = mods[mod]?.[fn];
    if (!f) throw new Error('fonction inconnue ' + ref.__path);
    return f.handler({ ...dbCtx, runQuery: call, runMutation: call }, a);
  };
  const ctx = { ...dbCtx, runQuery: call, runMutation: call, runAction: call };
  const auth = async (params) => {
    try { return { ok: await password.authorize(params, ctx) }; } catch (e) { return { code: e?.data?.code ?? String(e?.message ?? e), left: e?.data?.left }; }
  };
  const signIn = (email, pw) => auth({ flow: 'signIn', email, password: pw });
  const reset = (email) => auth({ flow: 'reset', email });
  const check = (email, code) => auth({ flow: 'reset-check', email, code });
  const finish = (email, code, pw) => auth({ flow: 'reset-verification', email, code, newPassword: pw });
  const lastCode = () => sent.at(-1)?.args.code;
  return { m, ctx, sent, auth, signIn, reset, check, finish, lastCode };
}

const { ok, end } = checker();
const ME = 'inscrite@exemple.fr', OLD = 'Ancien-mdp-41', NEW = 'Nouveau-velo-72';
const wrongOf = (code) => String((Number(code) + 1) % 1e6).padStart(6, '0');
const withClock = async (ms, f) => { const real = Date.now; Date.now = () => real() + ms; try { return await f(); } finally { Date.now = real; } };

// ─── 1. La demande : un code part pour un compte, rien pour une adresse inconnue, et la réponse est la même ───
{
  const w = world();
  await w.auth({ flow: 'signUp', email: ME, password: OLD });
  const known = await w.reset('  Inscrite@Exemple.fr ');
  const unknown = await w.reset('personne@exemple.fr');
  ok(known.ok === null && unknown.ok === null, `demande : même réponse, avec ou sans compte (${JSON.stringify(known)} / ${JSON.stringify(unknown)})`);
  ok(w.sent.length === 1 && w.sent[0].fn === 'mail.sendResetCode' && w.sent[0].args.to === ME, `un seul e-mail planifié, vers l'adresse du compte (${JSON.stringify(w.sent.map((s) => s.args.to))})`);
  ok(/^\d{6}$/.test(w.lastCode() ?? ''), `le code envoyé a 6 chiffres (${w.lastCode()})`);
  const rows = w.m.rows('passwordResets');
  ok(rows.length === 2 && rows.every((r) => r.tries === 0 && r.expiresAt > Date.now()), `une ligne par adresse, inconnue comprise (${rows.length})`);
  ok(rows.every((r) => !JSON.stringify(r).includes(w.lastCode())), 'le code n’est jamais rangé en clair');
  ok(rows.every((r) => !JSON.stringify(r).includes('personne@')), 'l’adresse inconnue n’est pas rangée en clair');
}

// ─── 2. Le code : 5 essais, puis il faut en redemander un ; une adresse inconnue se comporte pareil ───
{
  const w = world();
  await w.auth({ flow: 'signUp', email: ME, password: OLD });
  await w.reset(ME);
  const code = w.lastCode();
  await w.reset('personne@exemple.fr');
  const run = async (email) => { const out = []; for (let i = 0; i < 6; i++) { const r = await w.check(email, wrongOf(code)); out.push(r.code + (r.left !== undefined ? ':' + r.left : '')); } return out; };
  const a = await run(ME), b = await run('personne@exemple.fr');
  ok(a.slice(0, 5).join() === 'CODE_INVALIDE:4,CODE_INVALIDE:3,CODE_INVALIDE:2,CODE_INVALIDE:1,CODE_EPUISE', `compte : 4, 3, 2 puis 1 essai restant, puis code épuisé (${a.join(' ')})`);
  ok(a.join() === b.join(), `adresse inconnue : exactement les mêmes réponses (${b.join(' ')})`);
  ok((await w.check(ME, code)).code === 'CODE_INVALIDE', 'après épuisement, le bon code ne marche plus');
}

// ─── 3. Le bon code : vérifié sans connecter, puis le mot de passe change et la personne est connectée ───
{
  const w = world();
  const created = await w.auth({ flow: 'signUp', email: ME, password: OLD });
  const userId = created.ok.userId;
  for (let i = 0; i < 4; i++) {
    const s = await w.m.db.insert('authSessions', { userId, expirationTime: Date.now() + 864e5 });
    await w.m.db.insert('authRefreshTokens', { sessionId: s, expirationTime: Date.now() + 864e5 });
  }
  // Un tiers a bloqué la connexion de ce compte (10 échecs).
  for (let i = 0; i < 11; i++) await w.signIn(ME, 'mauvais-' + i);
  ok((await w.signIn(ME, OLD)).code === 'TROP_DE_TENTATIVES', 'avant : la connexion est bloquée par les essais d’un tiers');
  await w.reset(ME);
  const code = w.lastCode();
  await w.check(ME, wrongOf(code));
  const checked = await w.check(ME, code.slice(0, 3) + ' ' + code.slice(3));
  ok(checked.ok === null, `reset-check du bon code (espace compris) : accepté, personne n’est connecté (${JSON.stringify(checked)})`);
  const weak = await w.finish(ME, code, '12345678');
  ok(weak.code === 'MOT_DE_PASSE_TROP_COURANT', `mot de passe trop courant : refusé (${weak.code})`);
  ok(w.m.rows('passwordResets')[0]?.tries === 1, `un mot de passe refusé ne coûte pas d’essai au code (essais : ${w.m.rows('passwordResets')[0]?.tries})`);
  const done = await w.finish(ME, code, NEW);
  ok(done.ok?.userId === userId, `reset-verification : le compte est connecté (${JSON.stringify(done.ok)})`);
  ok(w.m.rows('authSessions').filter((s) => s.userId === userId).length === 0 && w.m.rows('authRefreshTokens').length === 0, 'toutes les sessions d’avant sont fermées, avec leurs jetons');
  ok(w.m.rows('passwordResets').length === 0, 'le code a servi : effacé');
  ok((await w.signIn(ME, NEW)).ok?.userId === userId, 'le nouveau mot de passe connecte (le blocage des essais est levé)');
  ok((await w.signIn(ME, OLD)).code === 'IDENTIFIANTS_INCORRECTS', 'l’ancien mot de passe ne marche plus');
  ok((await w.finish(ME, code, 'Encore-autre-93')).code === 'CODE_INVALIDE', 'le même code ne sert pas deux fois');
}

// ─── 4. Expiration, nouveau code, plafond d'envois ───
{
  const w = world();
  await w.auth({ flow: 'signUp', email: ME, password: OLD });
  await w.reset(ME);
  const first = w.lastCode();
  ok((await withClock(16 * 60_000, () => w.check(ME, first))).code === 'CODE_EXPIRE', 'au bout de 15 minutes, le code a expiré');
  await w.reset(ME);
  const second = w.lastCode();
  await w.reset(ME);
  const third = w.lastCode();
  ok(second === third || (await w.check(ME, second)).code === 'CODE_INVALIDE', 'un nouveau code remplace l’ancien');
  ok((await w.check(ME, third)).ok === null, 'le dernier code marche');
  const fourth = await w.reset(ME), other = await w.reset('personne@exemple.fr');
  ok(fourth.code === 'TROP_DE_TENTATIVES', `4e demande dans l’heure : refusée (${fourth.code ?? 'acceptée'})`);
  ok(w.sent.length === 3, `3 e-mails partis, pas 4 (${w.sent.length})`);
  for (let i = 0; i < 3; i++) await w.reset('personne@exemple.fr');
  ok(other.ok === null && (await w.reset('personne@exemple.fr')).code === 'TROP_DE_TENTATIVES', 'le plafond vaut aussi pour une adresse inconnue');
  ok((await withClock(61 * 60_000, () => w.reset(ME))).ok === null, 'une heure plus tard, une demande passe de nouveau');
}

// ─── 5. Le mail : objet, code, version texte, adresse échappée ───
{
  const mail = mods.mailTemplates.resetCodeMail('048213', 'a&b@exemple.fr');
  ok(mail.subject === '048 213 est ton code Kopycat', `objet : le code d’abord (${mail.subject})`);
  ok(mail.html.includes('048 213') && mail.text.includes('048 213'), 'le code est dans le HTML et dans le texte');
  ok(mail.html.includes('a&amp;b@exemple.fr') && !mail.html.includes('a&b@'), 'l’adresse est échappée dans le HTML');
  ok(!/[<>]/.test(mail.text) && !/undefined|null/.test(mail.html + mail.text), 'texte sans balise, rien d’indéfini');
  ok(mail.html.includes('color-scheme" content="light only'), 'fond blanc seulement (pas de mode sombre)');
  ok(mail.html.includes('https://www.kopycat.io/media/mail/kopycat-mark.png') && fs.existsSync(path.join(root, 'public/media/mail/kopycat-mark.png')), 'le logo du mail est une image servie par le site');
  let threw = false; try { mods.mailTemplates.resetCodeMail('12a456', 'x@exemple.fr'); } catch { threw = true; }
  ok(threw, 'un code qui n’a pas 6 chiffres n’est jamais mis en forme');
}

// ─── 6. L'envoi chez Resend : sans clé, échec visible ; avec clé, le bon appel ───
{
  const realFetch = globalThis.fetch, calls = [];
  globalThis.fetch = async (url, init) => { calls.push({ url, init }); return new Response(JSON.stringify({ id: 're_123' }), { status: 200 }); };
  const send = mods.mail.sendResetCode.handler;
  delete process.env.RESEND_API_KEY;
  let missing = '';
  try { await send({}, { to: ME, code: '481207' }); } catch (e) { missing = String(e.message); }
  ok(/RESEND_API_KEY/.test(missing) && calls.length === 0, `sans clé : erreur qui nomme la variable, rien n’est appelé (${missing.slice(0, 60)})`);
  process.env.RESEND_API_KEY = 're_test_cle';
  const log = console.log; console.log = () => {};
  await send({}, { to: ME, code: '481207' });
  console.log = log;
  const body = JSON.parse(calls[0]?.init.body ?? '{}');
  ok(calls[0]?.url === 'https://api.resend.com/emails' && calls[0].init.headers.Authorization === 'Bearer re_test_cle', 'appel à l’API de Resend, avec la clé');
  ok(body.from === 'Kopycat <compte@kopycat.io>' && body.to?.[0] === ME && body.subject === '481 207 est ton code Kopycat' && body.text && body.html, `expéditeur, destinataire, objet, HTML et texte (${body.from} → ${body.to})`);
  globalThis.fetch = async () => new Response('{"message":"domain not verified"}', { status: 403 });
  let refused = '';
  try { await send({}, { to: ME, code: '481207' }); } catch (e) { refused = String(e.message); }
  ok(/403/.test(refused), `Resend refuse : l’erreur remonte (${refused.slice(0, 50)})`);
  globalThis.fetch = realFetch;
  delete process.env.RESEND_API_KEY;
}

end();
