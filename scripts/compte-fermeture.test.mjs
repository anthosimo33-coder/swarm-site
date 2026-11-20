// Audit du 19/11, S2 : fermer son compte résilie d'abord l'abonnement Whop, tout de suite ; si Whop ne le confirme pas,
// rien n'est effacé. Les vraies fonctions de convex/users.ts et convex/whop.ts, l'API Whop simulée, une base en mémoire ;
// puis le texte de Réglages (page générée depuis design/app/ReglagesA.dc.html).
// Usage : node scripts/compte-fermeture.test.mjs   (ou <dossier convex>, pour la contre-épreuve)
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { h } from "preact";
import { renderToString } from "preact-render-to-string";
import { checker, load, memDb, quiet, root } from "./test-kit.mjs";

const dir = path.resolve(process.argv[2] ?? path.join(root, "convex"));
const entry = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "kopycat-s2-")), "entry.ts");
fs.writeFileSync(entry, ["users", "whop", "session"].map((m) => `export * as ${m} from ${JSON.stringify(path.join(dir, m + ".ts"))};`).join("\n"));
const mods = await load(entry, [[/^@convex-dev\/auth\/server$/, `
export const getAuthUserId = async (ctx) => ctx.__userId ?? null;
export const getAuthSessionId = async (ctx) => ctx.__sessionId ?? null;
export const modifyAccountCredentials = async () => {};
// Le bon mot de passe de l'abonnée de banc : « Bon-mdp-42 » (audit S27 : la fermeture le demande).
export const retrieveAccount = async (_ctx, { account }) => (account.secret === "Bon-mdp-42" ? { user: {}, account: {} } : null);
`]]);
process.env.WHOP_API_KEY = "test";

// L'API Whop : une adhésion par id ; POST …/cancel sans cancel_at_period_end la résilie tout de suite.
let whop;
const json = (x, status = 200) => new Response(JSON.stringify(x), { status, headers: { "content-type": "application/json" } });
globalThis.fetch = async (url, init = {}) => {
  const method = init.method ?? "GET", body = init.body ? JSON.parse(init.body) : null;
  whop.calls.push({ method, url: String(url), body });
  if (whop.down) return new Response("indisponible", { status: 503 });
  const m = String(url).match(/\/memberships\/([^/?]+)(\/cancel)?$/);
  const mem = m && whop.memberships[m[1]];
  if (!mem) return json({ error: "introuvable" }, 404);
  if (m[2] && method === "POST" && !whop.ignoreCancel) { if (body?.cancel_at_period_end) mem.cancel_at_period_end = true; else mem.status = "canceled"; }
  return json(mem);
};

/** Un compte abonné (adhésion `status`), avec ce qu'il garde, une session et son identifiant. */
async function world({ status = "active", sub = true, google = false, sessionAge = 0 } = {}) {
  const m = memDb();
  const userId = await m.db.insert("users", { email: "abonnee@exemple.fr", pro: sub ? true : undefined });
  const sessionId = await m.db.insert("authSessions", { userId, expirationTime: Date.now() + 864e5 });
  if (sessionAge) m.rows("authSessions").find((x) => x._id === sessionId)._creationTime = Date.now() - sessionAge;
  const accountId = await m.db.insert("authAccounts", { userId, provider: google ? "google" : "password", providerAccountId: "abonnee@exemple.fr" });
  await m.db.insert("authRateLimits", { identifier: accountId, lastAttemptTime: 1, attemptsLeft: 3 });
  await m.db.insert("authLimits", { key: `checkout:${userId}`, n: 1, since: 1 });
  await m.db.insert("saved", { userId, key: "follows", value: {}, updatedAt: 1 });
  if (sub) await m.db.insert("subscriptions", { userId, membershipId: "mem_1", variantId: "plan_m", status, periodDays: 30, price: "29.99", currency: "eur", periodEnd: Date.now() + 20 * 864e5, cancelAtPeriodEnd: false, manageUrl: null, updatedAt: 1 });
  whop = { calls: [], down: false, ignoreCancel: false, memberships: { mem_1: { id: "mem_1", status, cancel_at_period_end: false, metadata: { kopycat_user: userId }, billing_period_days: 30, renewal_price: { amount: 29.99, currency: "eur" } } } };
  const call = (ref, a) => {
    const [mod, fn] = ref.__path.split(".");
    const f = mods[mod]?.[fn];
    if (!f) throw new Error(`fonction inconnue ${ref.__path}`);
    return f.handler({ db: m.db }, a);
  };
  // Un contexte qui sert d'action (runQuery, runMutation) comme de mutation (db) : l'ancienne fermeture était une mutation.
  const ctx = { db: m.db, __userId: userId, __sessionId: sessionId, runQuery: call, runMutation: call, runAction: call, scheduler: { runAfter: async () => null } };
  return { m, ctx, userId, close: (email, password = "Bon-mdp-42") => quiet(() => mods.users.deleteAccount.handler(ctx, password === null ? { email } : { email, password })) };
}
const cancels = () => whop.calls.filter((c) => c.method === "POST" && /\/cancel$/.test(c.url));

const { ok, end } = checker();
{
  const w = await world();
  const r = await w.close("abonnee@exemple.fr");
  ok(cancels().length === 1 && /\/memberships\/mem_1\/cancel$/.test(cancels()[0].url), `abonnée : l'adhésion est résiliée chez Whop avant l'effacement (${cancels().length} résiliation)`);
  ok(cancels().length === 1 && !cancels()[0].body?.cancel_at_period_end, "résiliation immédiate (sans cancel_at_period_end)");
  ok(r?.ok === true && !w.m.rows("users").length && !w.m.rows("saved").length && !w.m.rows("authSessions").length && !w.m.rows("authAccounts").length, "puis le compte et ce qu'il garde sont effacés");
  ok(whop.memberships.mem_1.status === "canceled", "chez Whop, plus rien n'est prélevé");
}
{
  const w = await world();
  whop.down = true;
  const r = await w.close("abonnee@exemple.fr");
  ok(r?.ok === false && w.m.rows("users").length === 1 && w.m.rows("saved").length === 1, `Whop ne répond pas : rien n'est effacé (${JSON.stringify(r)})`);
  ok(r?.reason === "resiliation", "et l'écran sait pourquoi (reason « resiliation »)");
}
{
  const w = await world();
  whop.ignoreCancel = true; // Whop répond 200 mais l'adhésion reste active et renouvelée
  const r = await w.close("abonnee@exemple.fr");
  ok(r?.ok === false && w.m.rows("users").length === 1, "Whop répond mais l'adhésion reste prélevée : rien n'est effacé");
}
{
  const w = await world();
  const r = await w.close("autre@exemple.fr");
  ok(r?.ok === false && w.m.rows("users").length === 1 && cancels().length === 0, "mauvais e-mail : rien n'est résilié ni effacé");
}
{
  const w = await world({ sub: false });
  const r = await w.close("abonnee@exemple.fr");
  ok(r?.ok === true && !w.m.rows("users").length && whop.calls.length === 0, "sans abonnement : effacé, sans appel à Whop");
}
{
  const w = await world({ status: "canceled" });
  const r = await w.close("abonnee@exemple.fr");
  ok(r?.ok === true && cancels().length === 0, "adhésion déjà terminée : rien à résilier, compte effacé");
}
// Audit S27 : l'e-mail ne suffit plus ; mot de passe, ou connexion récente pour un compte Google seul.
{
  const w = await world();
  const none = await w.close("abonnee@exemple.fr", null);
  const bad = await w.close("abonnee@exemple.fr", "mauvais-mdp-9");
  ok(none?.reason === "motdepasse" && bad?.reason === "motdepasse" && w.m.rows("users").length === 1 && cancels().length === 0,
    `S27 : sans mot de passe ou avec un faux, rien n'est résilié ni effacé (${none?.reason}, ${bad?.reason})`);
  const good = await w.close("abonnee@exemple.fr");
  ok(good?.ok === true && !w.m.rows("authRateLimits").length && !w.m.rows("authLimits").length, `S27 : avec le bon, effacé, compteurs d'échecs compris (${w.m.rows("authRateLimits").length + w.m.rows("authLimits").length} restants)`);
}
{
  const old = await world({ google: true, sub: false, sessionAge: 30 * 60_000 });
  const r1 = await old.close("abonnee@exemple.fr", null);
  const fresh = await world({ google: true, sub: false, sessionAge: 2 * 60_000 });
  const r2 = await fresh.close("abonnee@exemple.fr", null);
  ok(r1?.reason === "reconnexion" && old.m.rows("users").length === 1 && r2?.ok === true && !fresh.m.rows("users").length,
    `S27 : compte Google seul, connexion de 30 min : se reconnecter d'abord (${r1?.reason}) ; de 2 min : effacé (${r2?.ok})`);
}
const pub = Object.entries(mods.users).filter(([, f]) => f?.__kind === "mutation").map(([n]) => n);
ok(!pub.some((n) => /delete|erase/i.test(n)), `aucune mutation publique n'efface le compte sans passer par Whop (${pub.join(", ")})`);

// L'écran : avec un abonnement, la confirmation dit qu'il est résilié ; un refus de Whop a son message.
const { default: Reglages } = await import(process.env.REGLAGES_PAGE ?? path.join(root, "src/app/pages/Reglages.js"));
const screen = (abo, onDelete) => {
  const props = { user: { email: "abonnee@exemple.fr", pro: !!abo, initiale: "A" }, abo, section: "profil", onDelete };
  const page = new Reglages(props);
  page.props = props;
  page.state = { del: true, sec: "profil", delEmail: "abonnee@exemple.fr" };
  page.setState = (x) => Object.assign(page.state, typeof x === "function" ? x(page.state) : x);
  return page;
};
const subbed = { sub: { active: true, formule: "mensuel", status: "active", price: "29.99", currency: "eur", periodEnd: Date.now() + 864e5, cancelAtPeriodEnd: false }, payments: [] };
const text = (page) => renderToString(h(() => page.render())).replace(/<[^>]+>/g, " ");
ok(/résilié tout de suite/.test(text(screen(subbed))), "Réglages, abonnée : la confirmation dit que l'abonnement est résilié tout de suite");
ok(!/résilié/.test(text(screen(null))), "Réglages, sans abonnement : rien sur un abonnement");
const page = screen(subbed, async () => ({ ok: false, reason: "resiliation" }));
page.renderVals().delGo();
await new Promise((r) => setTimeout(r, 10));
ok(/Whop/.test(page.state.delErr || ""), `Réglages, refus de Whop : « ${page.state.delErr} »`);
// Audit S27 : un compte « mot de passe » le donne pour fermer ; chaque refus du serveur a son message.
{
  const sent = [];
  const pw = screen(subbed, async (email, password) => { sent.push([email, password]); return { ok: false, reason: password === "Bon-mdp-42" ? "reconnexion" : "motdepasse" }; });
  pw.props.user.hasPassword = true;
  ok(/mot de passe/i.test(text(pw)), "Réglages : le champ « Ton mot de passe » est demandé à un compte mot de passe");
  pw.renderVals().delGo();
  ok(sent.length === 0, "Réglages : sans mot de passe tapé, rien n'est envoyé");
  pw.state.delPw = "faux-mdp-1";
  pw.renderVals().delGo();
  await new Promise((r) => setTimeout(r, 10));
  ok(sent[0]?.[1] === "faux-mdp-1" && /incorrect/.test(pw.state.delErr || ""), `Réglages : le mot de passe part avec l'e-mail ; refus : « ${pw.state.delErr} »`);
}

end();
