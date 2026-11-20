// Audit du 19/11, S1 : l'inscription sur un e-mail déjà inscrit ne doit jamais tester le mot de passe.
// Le vrai fournisseur « password » de convex/auth.ts et les vraies mutations de Convex Auth 0.0.96 (auth:store :
// createAccountFromCredentials, retrieveAccountWithCredentials, limite de 10 échecs par heure), sur une base en mémoire.
// Usage : node scripts/auth-signup.test.mjs   (ou <autre auth.ts>, pour la contre-épreuve)
import fs from "node:fs";
import path from "node:path";
import { checker, load, memDb, root } from "./test-kit.mjs";

const IMPL = path.join(root, "node_modules/@convex-dev/auth/dist/server/implementation");
const { createAccountFromCredentialsImpl } = await import(path.join(IMPL, "mutations/createAccountFromCredentials.js"));
const { retrieveAccountWithCredentialsImpl } = await import(path.join(IMPL, "mutations/retrieveAccountWithCredentials.js"));
const authFile = path.resolve(process.argv[2] ?? path.join(root, "convex/auth.ts"));
// convexAuth est remplacé pour garder sa configuration ; createAccount et retrieveAccount sont les vrais (index.js).
await load(authFile, [[/^@convex-dev\/auth\/server$/, `
export { createAccount, retrieveAccount } from ${JSON.stringify(path.join(IMPL, "index.js"))};
export const convexAuth = (config) => { globalThis.__authConfig = config; return {}; };
`]]);
const limitsFile = path.join(path.dirname(authFile), "authLimits.ts");
const limits = fs.existsSync(limitsFile) ? await load(limitsFile) : null;

const config = globalThis.__authConfig;
const raw = config.providers[0];
const provider = { ...raw, ...raw.options }; // comme Convex Auth matérialise un ConvexCredentials
let verifies = 0;
const verifySecret = provider.crypto.verifySecret;
provider.crypto = { ...provider.crypto, verifySecret: async (...a) => { verifies++; return verifySecret(...a); } };
const getProviderOrThrow = (id) => { if (id !== provider.id) throw new Error(`fournisseur ${id}`); return provider; };

const m = memDb();
let breakAccounts = false;
const db = { ...m.db, query: (t) => { if (t === "authAccounts" && breakAccounts) throw new Error("panne passagère"); return m.db.query(t); } };
const dbCtx = { db, auth: { getUserIdentity: async () => null } };
const ctx = {
  auth: { getUserIdentity: async () => null },
  runMutation: async (ref, a) => {
    if (ref === "auth:store") {
      const { type, ...args } = a.args;
      if (type === "createAccountFromCredentials") return createAccountFromCredentialsImpl(dbCtx, args, getProviderOrThrow, config);
      if (type === "retrieveAccountWithCredentials") return retrieveAccountWithCredentialsImpl(dbCtx, args, getProviderOrThrow, config);
    }
    if (ref?.__path === "authLimits.hit" && limits) return limits.hit.handler(dbCtx, a);
    throw new Error(`mutation inattendue ${ref?.__path ?? ref}`);
  },
};
const attempt = async (flow, email, password) => {
  try { return { ok: await provider.authorize({ flow, email, password }, ctx) }; } catch (e) { return { code: e?.data?.code ?? String(e?.message ?? e) }; }
};

const { ok, end } = checker();
const victim = "victime@exemple.fr", secret = "motdepasse1";
const created = await attempt("signUp", victim, secret);
ok(!!created.ok?.userId, "inscription d'une nouvelle adresse : compte créé et connecté");
const victimId = created.ok?.userId;
const limiter = () => JSON.stringify(m.rows("authRateLimits"));

// 1. signIn reste limité : 10 échecs, puis blocage.
const codes = [];
for (let i = 0; i < 11; i++) codes.push((await attempt("signIn", victim, "mauvais" + i)).code);
ok(codes.slice(0, 10).every((c) => c === "IDENTIFIANTS_INCORRECTS") && codes[10] === "TROP_DE_TENTATIVES", `signIn : 10 échecs puis « trop de tentatives » (${codes.at(-1)})`);

// 2. signUp sur l'adresse inscrite : aucun mot de passe testé, compteur d'échecs intact, jamais de connexion.
const before = limiter();
verifies = 0;
const wrong = [];
for (let i = 0; i < 20; i++) wrong.push((await attempt("signUp", victim, "essai-mdp-" + i)).code);
const right = await attempt("signUp", victim, secret);
ok(wrong.every((c) => c === "COMPTE_EXISTANT"), `signUp × 20 avec de mauvais mots de passe : « compte existant » (${[...new Set(wrong)].join(", ")})`);
ok(!right.ok && right.code === "COMPTE_EXISTANT", `signUp avec le BON mot de passe : refusé, pas connecté (${right.ok ? "connecté au compte " + (right.ok.userId === victimId ? "de la victime" : "?") : right.code})`);
ok(verifies === 0, `signUp sur un compte existant ne vérifie aucun mot de passe (${verifies} vérifications)`);
ok(limiter() === before, "signUp ne touche pas au compteur d'échecs de la connexion");

// 3. Une panne passagère n'est jamais lue comme « compte absent » (sinon createAccount revérifierait le mot de passe).
breakAccounts = true;
verifies = 0;
const broken = await attempt("signUp", victim, secret);
breakAccounts = false;
ok(!broken.ok && broken.code !== "COMPTE_EXISTANT" && verifies === 0, `panne pendant la vérification : erreur, sans connexion ni test du mot de passe (${broken.code})`);

// 4. Limite des inscriptions (création de comptes en masse) : refus au-delà, de nouveau ouvert après la fenêtre.
let refusedAt = 0;
for (let i = 1; i <= 400 && !refusedAt; i++) if ((await attempt("signUp", victim, "x".repeat(8))).code === "TROP_DE_TENTATIVES") refusedAt = i;
ok(refusedAt > 0, `inscriptions limitées : refus au ${refusedAt || "?"}e essai de la fenêtre`);
const realNow = Date.now;
Date.now = () => realNow() + 11 * 60_000;
const later = await attempt("signUp", "nouvelle@exemple.fr", "motdepasse2");
Date.now = realNow;
ok(!!later.ok?.userId && later.ok.userId !== victimId, "11 min plus tard : une nouvelle inscription passe");

end();
