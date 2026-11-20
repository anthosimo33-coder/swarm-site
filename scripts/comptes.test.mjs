// Constats « moyenne » de l'audit du 19/11 sur les comptes (convex/auth.ts, convex/users.ts) : une section par constat.
// Le vrai fournisseur « password » et le vrai Google de convex/auth.ts, avec les vraies mutations de Convex Auth 0.0.96
// (auth:store, création de session), sur une base en mémoire.
// Usage : node scripts/comptes.test.mjs   (ou <dossier convex>, pour la contre-épreuve)
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { checker, load, memDb, quiet, root } from './test-kit.mjs';

const { ok, end } = checker();
const IMPL = path.join(root, 'node_modules/@convex-dev/auth/dist/server/implementation');
const { createAccountFromCredentialsImpl } = await import(path.join(IMPL, 'mutations/createAccountFromCredentials.js'));
const { retrieveAccountWithCredentialsImpl } = await import(path.join(IMPL, 'mutations/retrieveAccountWithCredentials.js'));
const { modifyAccountImpl } = await import(path.join(IMPL, 'mutations/modifyAccount.js'));
const { createNewAndDeleteExistingSession } = await import(path.join(IMPL, 'sessions.js'));
const dir = path.resolve(process.argv[2] ?? path.join(root, 'convex'));
process.env.AUTH_GOOGLE_ID = 'test'; process.env.AUTH_GOOGLE_SECRET = 'test'; // Google allumé, pour S25
const entry = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'kopycat-comptes-')), 'entry.ts');
const MODS = ['auth', 'authLimits', 'users', 'session', 'whop'].filter((m) => fs.existsSync(path.join(dir, m + '.ts')));
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
let verifies = 0;
const verifySecret = password.crypto.verifySecret;
password.crypto = { ...password.crypto, verifySecret: async (...a) => { verifies++; return verifySecret(...a); } };
const getProviderOrThrow = (id) => { const p = providers.find((x) => x.id === id); if (!p) throw new Error(`fournisseur ${id}`); return p; };

/** Une base et un contexte d'action : auth:store, et les fonctions internes de convex/. */
function world() {
  const m = memDb();
  const dbCtx = { db: m.db, auth: { getUserIdentity: async () => null } };
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
  const auth = async (flow, email, pw) => { try { return { ok: await password.authorize({ flow, email, password: pw }, ctx) }; } catch (e) { return { code: e?.data?.code ?? String(e?.message ?? e) }; } };
  return { m, ctx, call, auth };
}

// ─── S23 : trois appareils connectés au plus ; une nouvelle connexion déconnecte le plus ancien ───
{
  const w = world();
  const userId = await w.m.db.insert('users', { email: 'a@exemple.fr' });
  for (let i = 0; i < 5; i++) {
    const s = await w.m.db.insert('authSessions', { userId, expirationTime: Date.now() + 864e5 * (i + 1) });
    await w.m.db.insert('authRefreshTokens', { sessionId: s, expirationTime: Date.now() + 864e5 });
  }
  const other = await w.m.db.insert('users', { email: 'b@exemple.fr' });
  await w.m.db.insert('authSessions', { userId: other, expirationTime: Date.now() + 864e5 });
  const first = w.m.rows('authSessions').filter((s) => s.userId === userId).map((s) => s._id);
  await createNewAndDeleteExistingSession(w.ctx, config, userId); // la vraie création de session de Convex Auth
  const left = w.m.rows('authSessions').filter((s) => s.userId === userId).map((s) => s._id);
  ok(left.length === 3, `S23 : après une nouvelle connexion, 3 sessions vivantes au plus (${left.length})`);
  ok(!left.includes(first[0]) && !left.includes(first[1]) && left.includes(first[4]), 'S23 : les plus anciennes sont fermées, les plus récentes gardées');
  const tokens = w.m.rows('authRefreshTokens').map((t) => t.sessionId);
  ok(tokens.every((s) => left.includes(s)), 'S23 : les jetons de renouvellement des sessions fermées sont effacés');
  ok(w.m.rows('authSessions').some((s) => s.userId === other), 'S23 : les sessions d\'un autre compte ne sont pas touchées');
}

// ─── S12 : à la connexion, une adresse inconnue répond comme une adresse inscrite (compteur et durée) ───
{
  const w = world();
  await w.auth('signUp', 'inscrite@exemple.fr', 'motdepasse1');
  const codes = async (email) => { const out = []; for (let i = 0; i < 11; i++) out.push((await w.auth('signIn', email, 'mauvais-' + i)).code); return out; };
  const known = await codes('inscrite@exemple.fr'), unknown = await codes('inconnue@exemple.fr');
  ok(known.at(-1) === 'TROP_DE_TENTATIVES' && unknown.at(-1) === 'TROP_DE_TENTATIVES' && unknown.slice(0, 10).every((c) => c === 'IDENTIFIANTS_INCORRECTS'),
    `S12 : 10 échecs puis « trop de tentatives », adresse inscrite comme inconnue (inconnue : ${unknown.at(-1)})`);
  const time = async (email) => { const t = performance.now(); for (let i = 0; i < 3; i++) await w.auth('signIn', email.replace('@', `+${i}@`), 'mauvais'); return (performance.now() - t) / 3; };
  await w.auth('signUp', 'inscrite+0@exemple.fr', 'motdepasse1'); await w.auth('signUp', 'inscrite+1@exemple.fr', 'motdepasse1'); await w.auth('signUp', 'inscrite+2@exemple.fr', 'motdepasse1');
  const tk = await time('inscrite@exemple.fr'), tu = await time('autre@exemple.fr');
  ok(tu > tk * 0.5, `S12 : même ordre de durée (inscrite ${tk.toFixed(0)} ms, inconnue ${tu.toFixed(0)} ms)`);
  // Une connexion réussie remet le compteur à zéro.
  const v = world();
  await v.auth('signUp', 'c@exemple.fr', 'motdepasse1');
  for (let i = 0; i < 5; i++) await v.auth('signIn', 'c@exemple.fr', 'faux-mdp-' + i);
  await v.auth('signIn', 'c@exemple.fr', 'motdepasse1');
  const after = []; for (let i = 0; i < 6; i++) after.push((await v.auth('signIn', 'c@exemple.fr', 'faux-' + i)).code);
  ok(after.every((c) => c === 'IDENTIFIANTS_INCORRECTS'), 'S12 : une connexion réussie remet le compteur à zéro');
}

end();
