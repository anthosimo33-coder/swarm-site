// Audit du 19/11, S3 : un compte déjà Pro ne peut pas repayer. La vraie action whop.checkout, l'API Whop simulée, une
// base en mémoire. (Le routeur, src/app/main.js, envoie un compte Pro venu d'un lien de paiement vers Réglages › Formule :
// vérifié dans le navigateur, faute de DOM sous Node.)
// Usage : node scripts/paiement-pro.test.mjs   (ou <dossier convex>, pour la contre-épreuve)
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { checker, load, memDb, root } from "./test-kit.mjs";

const dir = path.resolve(process.argv[2] ?? path.join(root, "convex"));
const entry = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "kopycat-s3-")), "entry.ts");
fs.writeFileSync(entry, ["whop", "session"].map((m) => `export * as ${m} from ${JSON.stringify(path.join(dir, m + ".ts"))};`).join("\n"));
const mods = await load(entry, [[/^@convex-dev\/auth\/server$/, `
export const getAuthUserId = async (ctx) => ctx.__userId ?? null;
export const getAuthSessionId = async (ctx) => ctx.__sessionId ?? null;
`]]);
process.env.WHOP_API_KEY = "test";

let links = 0;
const json = (x) => new Response(JSON.stringify(x), { status: 200, headers: { "content-type": "application/json" } });
globalThis.fetch = async (url, init = {}) => {
  if (/\/variants\?/.test(url)) return json({ data: [{ id: "plan_m", billing_period: 30, renewal_price: 29.99, visibility: "visible", billing_type: "renewal" }, { id: "plan_bf", billing_period: 365, renewal_price: 179.88, visibility: "visible", billing_type: "renewal" }, { id: "plan_y", billing_period: 365, renewal_price: 359.88, visibility: "hidden", billing_type: "renewal" }] });
  if (/\/checkout_configurations$/.test(url) && init.method === "POST") { links++; return json({ purchase_url: "https://whop.com/checkout/plan_x" }); }
  return new Response("?", { status: 404 });
};

/** checkout pour un compte (`pro`) avec, s'il le faut, une adhésion `status`. Rend { url } ou { code }. */
async function pay({ pro = false, status = null, cancelAtPeriodEnd = false } = {}, formule = "annuel") {
  const m = memDb();
  const userId = await m.db.insert("users", { email: "a@exemple.fr", ...(pro ? { pro: true } : {}) });
  const sessionId = await m.db.insert("authSessions", { userId, expirationTime: Date.now() + 864e5 });
  if (status) await m.db.insert("subscriptions", { userId, membershipId: "mem_1", variantId: "plan_m", status, periodDays: 30, price: "29.99", currency: "eur", periodEnd: Date.now() + 864e5, cancelAtPeriodEnd, manageUrl: null, updatedAt: 1 });
  const call = (ref, a) => { const [mod, fn] = ref.__path.split("."); return mods[mod][fn].handler({ db: m.db }, a); };
  const ctx = { __userId: userId, __sessionId: sessionId, runQuery: call, runMutation: call };
  links = 0;
  try { return { ...(await mods.whop.checkout.handler(ctx, { formule, origin: "https://swarm-site-one.vercel.app" })), links }; }
  catch (e) { return { code: e?.data?.code ?? String(e?.message ?? e), links }; }
}

const { ok, end } = checker();
let r = await pay();
ok(!!r.url && r.links === 1, "compte gratuit : lien de paiement créé");
r = await pay({ pro: true });
ok(r.code === "DEJA_ABONNE" && r.links === 0, `compte Pro (users.pro) : refusé, aucun lien créé chez Whop (${r.code ?? "lien rendu"})`);
r = await pay({ pro: true }, "mensuel");
ok(r.code === "DEJA_ABONNE" && r.links === 0, "compte Pro, formule mensuelle : refusé aussi");
r = await pay({ status: "active" });
ok(r.code === "DEJA_ABONNE" && r.links === 0, `adhésion active reçue, pro pas encore recalculé : refusé (${r.code ?? "lien rendu"})`);
r = await pay({ pro: true, status: "active", cancelAtPeriodEnd: true });
ok(r.code === "DEJA_ABONNE", "abonnement résilié en fin de période mais encore actif : refusé (Réglages propose « Reprendre »)");
r = await pay({ status: "canceled" });
ok(!!r.url, "ancienne adhésion terminée : peut se réabonner");
end();
