// Mot de passe oublié (24/11, parcours B) et e-mails du compte (bienvenue, mot de passe changé, compte fermé) : le vrai fournisseur « password » de convex/auth.ts (flows reset,
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
  const codes = () => sent.filter((x) => x.fn === 'mail.sendResetCode');
  const lastCode = () => codes().at(-1)?.args.code;
  return { m, ctx, sent, codes, auth, signIn, reset, check, finish, lastCode };
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
  ok(w.codes().length === 1 && w.codes()[0].args.to === ME, `un seul code planifié, vers l'adresse du compte (${JSON.stringify(w.codes().map((s) => s.args.to))})`);
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
  ok(w.codes().length === 3, `3 codes partis, pas 4 (${w.codes().length})`);
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
  const REAL = 'lea@domaine-reel.fr';
  delete process.env.RESEND_API_KEY;
  let missing = '';
  try { await send({}, { to: REAL, code: '481207' }); } catch (e) { missing = String(e.message); }
  ok(/RESEND_API_KEY/.test(missing) && calls.length === 0, `sans clé : erreur qui nomme la variable, rien n’est appelé (${missing.slice(0, 60)})`);
  process.env.RESEND_API_KEY = 're_test_cle';
  const log = console.log; console.log = () => {};
  await send({}, { to: REAL, code: '481207' });
  await send({}, { to: 'test@Exemple.fr', code: '481207' });
  console.log = log;
  const body = JSON.parse(calls[0]?.init.body ?? '{}');
  ok(calls[0]?.url === 'https://api.resend.com/emails' && calls[0].init.headers.Authorization === 'Bearer re_test_cle', 'appel à l’API de Resend, avec la clé');
  ok(calls.length === 1, `adresse de test (@exemple.fr) : rien n’est envoyé (${calls.length} appel(s) pour 2 envois)`);
  ok(body.reply_to === 'support@kopycat.io', `répondre à un e-mail arrive au support (reply_to ${body.reply_to})`);
  ok(body.from === 'Kopycat <compte@kopycat.io>' && body.to?.[0] === REAL && body.subject === '481 207 est ton code Kopycat' && body.text && body.html, `expéditeur, destinataire, objet, HTML et texte (${body.from} → ${body.to})`);
  globalThis.fetch = async () => new Response('{"message":"domain not verified"}', { status: 403 });
  let refused = '';
  try { await send({}, { to: REAL, code: '481207' }); } catch (e) { refused = String(e.message); }
  ok(/403/.test(refused), `Resend refuse : l’erreur remonte (${refused.slice(0, 50)})`);
  globalThis.fetch = realFetch;
  delete process.env.RESEND_API_KEY;
}

// ─── 7. Les e-mails du compte : planifiés au bon moment, vers la bonne adresse ───
{
  const w = world();
  const created = await w.auth({ flow: 'signUp', email: ME, password: OLD });
  const welcome = w.sent.filter((x) => x.fn === 'mail.sendWelcome');
  ok(welcome.length === 1 && welcome[0].args.to === ME, `inscription : un e-mail de bienvenue (${JSON.stringify(welcome.map((x) => x.args))})`);
  await w.auth({ flow: 'signUp', email: ME, password: OLD });
  ok(w.sent.filter((x) => x.fn === 'mail.sendWelcome').length === 1, 'inscription refusée (compte existant) : pas de second e-mail');
  await w.reset(ME);
  const code = w.lastCode();
  await w.finish(ME, code, '12345678');
  ok(!w.sent.some((x) => x.fn === 'mail.sendPasswordChanged'), 'mot de passe refusé : aucun « mot de passe changé »');
  const before = Date.now();
  await w.finish(ME, code, NEW);
  const changed = w.sent.filter((x) => x.fn === 'mail.sendPasswordChanged');
  ok(changed.length === 1 && changed[0].args.to === ME && changed[0].args.at >= before, `mot de passe oublié : « mot de passe changé » vers le compte, à l’heure du changement (${changed.length})`);
  // Réglages › Sécurité : même e-mail ; un mauvais mot de passe actuel n'en envoie aucun.
  const sessionId = await w.m.db.insert('authSessions', { userId: created.ok.userId, expirationTime: Date.now() + 864e5 });
  const actx = { ...w.ctx, __userId: created.ok.userId, __sessionId: sessionId };
  const change = async (current, next) => { try { return await mods.users.changePassword.handler(actx, { current, next }); } catch (e) { return e?.data?.code ?? String(e); } };
  const bad = await change('mauvais-mdp-1', 'Encore-autre-93');
  ok(w.sent.filter((x) => x.fn === 'mail.sendPasswordChanged').length === 1, `Réglages, mot de passe actuel faux (${bad}) : aucun e-mail`);
  await change(NEW, 'Encore-autre-93');
  const after = w.sent.filter((x) => x.fn === 'mail.sendPasswordChanged');
  ok(after.length === 2 && after[1].args.to === ME, 'Réglages : « mot de passe changé » vers le compte');
}

// ─── 8. Les gabarits : objet, heure de Paris, lien, adresse échappée, version texte ───
{
  const T = mods.mailTemplates;
  ok(T.parisDate(Date.UTC(2026, 10, 24, 9, 32)) === '24 novembre 2026 à 10 h 32', `heure de Paris en hiver (${T.parisDate(Date.UTC(2026, 10, 24, 9, 32))})`);
  ok(T.parisDate(Date.UTC(2026, 6, 1, 8, 5)) === '1 juillet 2026 à 10 h 05', `heure de Paris en été (${T.parisDate(Date.UTC(2026, 6, 1, 8, 5))})`);
  const at = Date.UTC(2026, 10, 24, 9, 32), who = 'a&b@exemple.fr';
  const mails = { change: T.passwordChangedMail(who, at), welcome: T.welcomeMail(who), closed: T.accountClosedMail(who, at) };
  const all = Object.values(mails);
  ok(all.every((m) => m.html.includes('a&amp;b@exemple.fr') && !m.html.includes('a&b@')), 'adresse échappée dans les trois HTML');
  ok(all.every((m) => !/[<>]/.test(m.text) && !/undefined|null|NaN/.test(m.html + m.text) && m.text.includes('JARVIA STUDIO')), 'versions texte sans balise, rien d’indéfini, éditeur dans le pied');
  ok(all.every((m) => m.html.includes('color-scheme" content="light only')), 'fond blanc seulement');
  ok(mails.change.subject === 'Ton mot de passe a été changé' && mails.change.html.includes('24 novembre 2026 à 10 h 32 (heure de Paris)') && mails.change.html.includes('https://www.kopycat.io/mot-de-passe-oublie') && mails.change.text.includes('https://www.kopycat.io/mot-de-passe-oublie'),
    'mot de passe changé : objet, quand, et « Ce n’était pas moi » vers le mot de passe oublié');
  ok(mails.welcome.subject === 'Ton compte Kopycat est prêt' && mails.welcome.html.includes('https://www.kopycat.io/app/apps') && mails.welcome.text.includes('TikTok, Instagram et YouTube Shorts'), 'bienvenue : objet, lien vers Apps, les trois réseaux');
  ok(mails.closed.subject === 'Ton compte Kopycat est fermé' && mails.closed.text.includes('fermé le 24 novembre 2026.') && !mails.closed.html.includes('href="https://www.kopycat.io/app'), 'compte fermé : objet, jour, aucun lien vers l’app');
}

// ─── 9. Changer d'adresse : un lien vers la nouvelle, rien ne change avant le clic, puis l'ancienne est prévenue ───
{
  const w = world();
  const created = await w.auth({ flow: 'signUp', email: ME, password: OLD });
  const userId = created.ok.userId;
  const sessionId = await w.m.db.insert('authSessions', { userId, expirationTime: Date.now() + 864e5 });
  const actx = { ...w.ctx, __userId: userId, __sessionId: sessionId };
  const U = mods.users;
  const run = async (f) => { try { return await f(); } catch (e) { return { err: e?.data?.code ?? String(e?.message ?? e) }; } };
  const change = (email, password = OLD) => run(() => U.changeEmail.handler(actx, { email, password }));
  const links = () => w.sent.filter((x) => x.fn === 'mail.sendConfirmNewEmail');
  const NEWE = 'nouvelle@exemple.fr';
  await w.auth({ flow: 'signUp', email: 'prise@exemple.fr', password: 'Autre-mdp-77' });

  ok((await change(NEWE, 'mauvais-1')).err === 'mot_de_passe_faux' && !links().length, 'mot de passe faux : refusé, aucun lien');
  ok((await change('prise@exemple.fr')).err === 'email_pris' && !links().length, 'adresse d’un autre compte : refusée, aucun lien');
  const r = await change('  Nouvelle@Exemple.fr ');
  ok(r.pending === true && r.email === NEWE, `demande : en attente, adresse nettoyée (${JSON.stringify(r)})`);
  const token = links().at(-1)?.args.token ?? '';
  ok(links().length === 1 && links()[0].args.to === NEWE && links()[0].args.from === ME && /^[0-9a-f]{64}$/.test(token), 'un lien part vers la NOUVELLE adresse, avec un jeton de 64 caractères');
  ok(w.m.rows('users').find((u) => u._id === userId)?.email === ME && (await w.signIn(ME, OLD)).ok?.userId === userId, 'avant le clic, rien ne change : on se connecte toujours avec l’ancienne adresse');
  ok(!JSON.stringify(w.m.rows('emailChanges')).includes(token), 'le jeton n’est jamais rangé en clair');
  const pend = await U.pendingEmail.handler(actx, {});
  ok(pend?.email === NEWE, `Réglages voit le changement en attente (${JSON.stringify(pend)})`);
  const peek = await U.peekEmailChange.handler(actx, { token });
  ok(peek.ok && peek.from === ME && peek.to === NEWE, 'la page du lien montre les deux adresses sans rien changer');
  ok((await U.peekEmailChange.handler(actx, { token: 'f'.repeat(64) })).ok === false, 'un faux jeton : « lien expiré »');

  // Renvoyer : nouveau jeton, l'ancien ne marche plus.
  const again = await run(() => U.resendEmailChange.handler(actx, {}));
  const token2 = links().at(-1)?.args.token;
  ok(again === NEWE && token2 && token2 !== token && (await U.peekEmailChange.handler(actx, { token })).ok === false, 'renvoyer : un nouveau lien, l’ancien ne marche plus');

  // Le clic.
  const before = Date.now();
  const done = await U.confirmEmailChange.handler(actx, { token: token2 });
  const user = w.m.rows('users').find((u) => u._id === userId);
  ok(done.ok && done.email === NEWE && user.email === NEWE && user.emailVerificationTime >= before, `confirmé : la nouvelle adresse est celle du compte, et vérifiée (${JSON.stringify(done)})`);
  ok((await w.signIn(NEWE, OLD)).ok?.userId === userId && (await w.signIn(ME, OLD)).code === 'IDENTIFIANTS_INCORRECTS', 'on se connecte avec la nouvelle adresse et le même mot de passe ; plus avec l’ancienne');
  const notice = w.sent.filter((x) => x.fn === 'mail.sendEmailChanged');
  ok(notice.length === 1 && notice[0].args.to === ME && notice[0].args.next === NEWE, `l’ancienne adresse est prévenue (${JSON.stringify(notice.map((x) => x.args.to))})`);
  ok(!w.m.rows('emailChanges').length && (await U.confirmEmailChange.handler(actx, { token: token2 })).ok === false, 'le lien ne sert qu’une fois');
  ok((await U.pendingEmail.handler(actx, {})) === null, 'plus rien en attente');
}

// ─── 10. Lien expiré, annulé, adresse prise entre-temps, plafond, fermeture du compte ───
{
  const w = world();
  const created = await w.auth({ flow: 'signUp', email: ME, password: OLD });
  const userId = created.ok.userId;
  const sessionId = await w.m.db.insert('authSessions', { userId, expirationTime: Date.now() + 864e5 });
  const actx = { ...w.ctx, __userId: userId, __sessionId: sessionId };
  const U = mods.users;
  const run = async (f) => { try { return await f(); } catch (e) { return { err: e?.data?.code ?? String(e?.message ?? e) }; } };
  const change = (email) => run(() => U.changeEmail.handler(actx, { email, password: OLD }));
  const lastToken = () => w.sent.filter((x) => x.fn === 'mail.sendConfirmNewEmail').at(-1)?.args.token;

  await change('a1@exemple.fr');
  const t1 = lastToken();
  ok((await withClock(25 * 3600_000, () => U.confirmEmailChange.handler(actx, { token: t1 }))).reason === 'expire', 'au bout de 24 heures : lien expiré, adresse inchangée');
  ok(w.m.rows('users').find((u) => u._id === userId).email === ME, 'l’adresse n’a pas bougé');

  await change('a2@exemple.fr');
  const t2 = lastToken();
  await U.cancelEmailChange.handler(actx, {});
  ok((await U.confirmEmailChange.handler(actx, { token: t2 })).reason === 'expire' && (await U.pendingEmail.handler(actx, {})) === null, 'annulé : le lien déjà parti ne marche plus');

  await change('a3@exemple.fr');
  const t3 = lastToken();
  await w.auth({ flow: 'signUp', email: 'a3@exemple.fr', password: 'Autre-mdp-77' });
  const taken = await U.confirmEmailChange.handler(actx, { token: t3 });
  ok(taken.reason === 'email_pris' && w.m.rows('users').find((u) => u._id === userId).email === ME, 'adresse prise par une inscription entre la demande et le clic : refusée');

  await change('a4@exemple.fr');
  const fifth = await change('a5@exemple.fr');
  const capped = await change('a6@exemple.fr');
  ok(fifth.pending === true && capped.err === 'trop_de_tentatives', `5 liens dans l’heure, le 6e refusé (${JSON.stringify(capped)})`);

  // La fermeture du compte efface un changement en attente.
  await w.m.db.insert('emailChanges', { userId, email: 'a7@exemple.fr', hash: 'x', expiresAt: Date.now() + 864e5 });
  await mods.users.eraseAccount.handler({ db: w.m.db }, { userId, limitKeys: [] });
  ok(!w.m.rows('emailChanges').length, 'fermer le compte efface le changement en attente');
}

// ─── 11. Les deux mails du changement d'adresse ───
{
  const T = mods.mailTemplates;
  const tok = 'a'.repeat(64);
  const c = T.confirmNewEmailMail('n&v@exemple.fr', 'old@exemple.fr', tok);
  ok(c.subject === 'Confirme ta nouvelle adresse' && c.html.includes(`https://www.kopycat.io/confirmer-adresse?t=${tok}`) && c.text.includes(`https://www.kopycat.io/confirmer-adresse?t=${tok}`),
    'confirmer : objet, et le lien (bouton, lien de secours, version texte)');
  ok(c.html.includes('n&amp;v@exemple.fr') && !c.html.includes('n&v@') && c.html.includes('Le lien marche 24 heures'), 'confirmer : adresse échappée, 24 heures');
  let threw = false; try { T.confirmNewEmailMail('x@exemple.fr', 'y@exemple.fr', 'pas-un-jeton'); } catch { threw = true; }
  ok(threw, 'un jeton mal formé n’est jamais mis dans un lien');
  const n = T.emailChangedMail('old@exemple.fr', 'new@exemple.fr', Date.UTC(2026, 10, 24, 9, 32));
  ok(n.subject === 'L’adresse de ton compte a changé' && n.html.includes('mailto:support@kopycat.io') && n.text.includes('support@kopycat.io') && n.html.includes('24 novembre 2026 à 10 h 32'),
    'ancienne adresse : objet, support@kopycat.io, quand');
  ok([c, n].every((m) => !/[<>]/.test(m.text) && !/undefined|null|NaN/.test(m.html + m.text)), 'versions texte propres, rien d’indéfini');
}

end();
