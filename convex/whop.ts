import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import {
  action,
  httpAction,
  internalAction,
  internalMutation,
  internalQuery,
  query,
  type ActionCtx,
  type MutationCtx,
} from "./_generated/server";

/**
 * Paiement Whop (19/11). Lu dans la doc Whop (API v1) le 19/11 :
 * - un lien de paiement = POST /checkout_configurations { account_id, variant_id, metadata, redirect_url } → purchase_url ;
 *   la donnée `metadata` est recopiée sur l'adhésion (membership) et les paiements : c'est elle qui relie l'achat au
 *   compte Kopycat (`kopycat_user`), l'adhésion ne portant pas l'e-mail de l'acheteur ;
 * - « plan » s'appelle « variant » dans l'API (id plan_…) ; GET /variants pour les lister ;
 * - résilier en fin de période = POST /memberships/{id}/cancel { cancel_at_period_end: true } (SANS ce champ, l'accès
 *   est coupé tout de suite) ; reprendre = PATCH /memberships/{id} { cancel_at_period_end: false } ;
 * - webhooks signés selon Standard Webhooks (webhook-id, webhook-timestamp, webhook-signature « v1,<base64> »).
 * L'accès vient du webhook (ou de la relecture de l'adhésion), jamais de la page de retour.
 */
const API = "https://api.whop.com/api/v1";
const ACCOUNT = "biz_iv3yoN0Wnx23qG";
const PRODUCT = "prod_WtWqNkTHQMRA9";
/** Statuts d'adhésion qui donnent accès à Kopycat Pro. past_due : Whop relance la carte 5 jours avant d'annuler. */
const ACCESS = new Set(["active", "trialing", "past_due"]);

type Json = Record<string, any>;

async function whopApi(path: string, init: { method?: string; body?: Json } = {}): Promise<any> {
  const key = process.env.WHOP_API_KEY;
  if (!key) throw new Error("WHOP_API_KEY absente");
  const res = await fetch(API + path, {
    method: init.method ?? "GET",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", Accept: "application/json" },
    body: init.body ? JSON.stringify(init.body) : undefined,
  });
  const text = await res.text();
  let body: any = text;
  try {
    body = JSON.parse(text);
  } catch {
    /* réponse non JSON */
  }
  if (!res.ok) throw new Error(`Whop ${res.status} ${init.method ?? "GET"} ${path} : ${String(typeof body === "string" ? body : JSON.stringify(body)).slice(0, 300)}`);
  return body;
}

/** Une date Whop (ISO 8601 ou secondes Unix) en millisecondes ; null si absente. */
function toMs(x: unknown): number | null {
  if (x === null || x === undefined || x === "") return null;
  if (typeof x === "number") return x < 1e12 ? x * 1000 : x;
  const n = Number(x);
  if (Number.isFinite(n)) return n < 1e12 ? n * 1000 : n;
  const t = Date.parse(String(x));
  return Number.isFinite(t) ? t : null;
}
const money = (m: any): string | null => (m && typeof m === "object" ? (m.amount != null ? String(m.amount) : null) : m != null ? String(m) : null);
const moneyCurrency = (m: any, fallback: any): string | null => (m && typeof m === "object" && m.currency ? String(m.currency) : fallback ? String(fallback) : null);

// ─── Les tarifs (variants) du produit Kopycat Pro ───

type Variant = { id: string; billing_period?: number | null; billing_type?: string; visibility?: string; renewal_price?: number; currency?: string; tax_type?: string; product?: { id?: string } };

async function listVariants(): Promise<Variant[]> {
  const pick = (b: any): Variant[] => (Array.isArray(b) ? b : Array.isArray(b?.data) ? b.data : []);
  let list = pick(await whopApi(`/variants?product_ids=${PRODUCT}&first=50`).catch(() => null));
  if (!list.length) list = pick(await whopApi(`/variants?account_id=${ACCOUNT}&first=100`)).filter((x) => !x.product?.id || x.product.id === PRODUCT);
  return list;
}

async function variantFor(formule: "mensuel" | "annuel"): Promise<Variant> {
  const ok = (await listVariants()).filter((x) => (x.visibility ?? "visible") === "visible" && (x.billing_type ?? "renewal") === "renewal");
  const found = ok.find((x) => (formule === "annuel" ? (x.billing_period ?? 0) >= 360 : (x.billing_period ?? 0) > 0 && (x.billing_period ?? 0) <= 31));
  if (!found) throw new Error(`Aucun tarif ${formule} visible sur le produit Kopycat Pro`);
  return found;
}

/** Diagnostic (terminal) : les tarifs vus par l'API, sans secret. `npx convex run whop:tarifs [--prod]`. */
export const tarifs = internalAction({
  args: {},
  handler: async () =>
    (await listVariants()).map((x) => ({ id: x.id, prix: x.renewal_price, devise: x.currency, jours: x.billing_period, visibilite: x.visibility, taxe: x.tax_type })),
});

// ─── Payer : le lien de paiement Whop, relié au compte ───

/**
 * Crée le lien de paiement Whop de la formule choisie et rend l'adresse vers laquelle envoyer la personne. Pas d'écran
 * d'accord avant Whop (choix de l'user, 19/11) : la renonciation au délai de rétractation au paiement est dans les CGV.
 */
export const checkout = action({
  args: { formule: v.union(v.literal("mensuel"), v.literal("annuel")), origin: v.string() },
  handler: async (ctx, { formule, origin }): Promise<{ url: string }> => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Non connecté");
    const variant = await variantFor(formule);
    // Retour sur le site d'où l'on vient (prod, préversion Vercel, local) ; sinon l'adresse du site.
    const site = /^https:\/\/[a-z0-9.-]+$/i.test(origin) || /^http:\/\/localhost(:\d+)?$/.test(origin) ? origin : (process.env.SITE_URL || "https://swarm-site-one.vercel.app");
    const conf = await whopApi("/checkout_configurations", {
      method: "POST",
      body: { account_id: ACCOUNT, variant_id: variant.id, metadata: { kopycat_user: userId }, redirect_url: `${site}/app?paiement=ok` },
    });
    if (typeof conf?.purchase_url !== "string") throw new Error("Whop n'a pas rendu de lien de paiement");
    return { url: conf.purchase_url };
  },
});

// ─── L'état de l'abonnement, tenu à jour par les webhooks ───

export const activeSub = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const subs = await ctx.db.query("subscriptions").withIndex("by_user", (q) => q.eq("userId", userId)).collect();
    return subs.filter((s) => ACCESS.has(s.status)).sort((a, b) => (b.periodEnd ?? 0) - (a.periodEnd ?? 0))[0] ?? null;
  },
});

async function recomputePro(ctx: MutationCtx, userId: Id<"users">) {
  const subs = await ctx.db.query("subscriptions").withIndex("by_user", (q) => q.eq("userId", userId)).collect();
  const pro = subs.some((s) => ACCESS.has(s.status));
  const user = await ctx.db.get(userId);
  if (user && (user.pro === true) !== pro) await ctx.db.patch(userId, { pro: pro || undefined });
  return pro;
}

/** Enregistre l'état d'une adhésion Whop et recalcule l'accès du compte. Rend une note pour le journal. */
export const saveMembership = internalMutation({
  args: {
    membershipId: v.string(),
    userKey: v.union(v.string(), v.null()),
    variantId: v.union(v.string(), v.null()),
    status: v.string(),
    periodDays: v.union(v.number(), v.null()),
    price: v.union(v.string(), v.null()),
    currency: v.union(v.string(), v.null()),
    periodEnd: v.union(v.number(), v.null()),
    cancelAtPeriodEnd: v.boolean(),
    manageUrl: v.union(v.string(), v.null()),
  },
  handler: async (ctx, a): Promise<string> => {
    const old = await ctx.db.query("subscriptions").withIndex("by_membership", (q) => q.eq("membershipId", a.membershipId)).first();
    const fromKey = a.userKey ? ctx.db.normalizeId("users", a.userKey) : null;
    const userId = (fromKey && (await ctx.db.get(fromKey)) ? fromKey : null) ?? old?.userId ?? null;
    if (userId === null) return `adhésion ${a.membershipId} sans compte Kopycat (pas de kopycat_user)`;
    const row = {
      userId, membershipId: a.membershipId, variantId: a.variantId ?? old?.variantId ?? null, status: a.status,
      periodDays: a.periodDays ?? old?.periodDays ?? null, price: a.price ?? old?.price ?? null, currency: a.currency ?? old?.currency ?? null,
      periodEnd: a.periodEnd ?? old?.periodEnd ?? null, cancelAtPeriodEnd: a.cancelAtPeriodEnd, manageUrl: a.manageUrl ?? old?.manageUrl ?? null,
      updatedAt: Date.now(),
    };
    if (old) await ctx.db.patch(old._id, row);
    else await ctx.db.insert("subscriptions", row);
    const pro = await recomputePro(ctx, userId);
    return `adhésion ${a.membershipId} ${a.status}${a.cancelAtPeriodEnd ? " (résiliée en fin de période)" : ""} → pro ${pro}`;
  },
});

export const savePayment = internalMutation({
  args: { paymentId: v.string(), userKey: v.union(v.string(), v.null()), membershipId: v.union(v.string(), v.null()), total: v.union(v.string(), v.null()), currency: v.union(v.string(), v.null()), status: v.string(), createdAt: v.number() },
  handler: async (ctx, a) => {
    const old = await ctx.db.query("whopPayments").withIndex("by_payment", (q) => q.eq("paymentId", a.paymentId)).first();
    let userId: Id<"users"> | null = a.userKey ? ctx.db.normalizeId("users", a.userKey) : null;
    if (userId && !(await ctx.db.get(userId))) userId = null;
    if (!userId && a.membershipId) userId = (await ctx.db.query("subscriptions").withIndex("by_membership", (q) => q.eq("membershipId", a.membershipId!)).first())?.userId ?? null;
    const row = { paymentId: a.paymentId, userId: userId ?? old?.userId ?? null, membershipId: a.membershipId ?? old?.membershipId ?? null, total: a.total ?? old?.total ?? null, currency: a.currency ?? old?.currency ?? null, status: a.status, createdAt: old?.createdAt ?? a.createdAt };
    if (old) await ctx.db.patch(old._id, row);
    else await ctx.db.insert("whopPayments", row);
  },
});

export const markPayment = internalMutation({
  args: { paymentId: v.string(), status: v.string() },
  handler: async (ctx, { paymentId, status }) => {
    const row = await ctx.db.query("whopPayments").withIndex("by_payment", (q) => q.eq("paymentId", paymentId)).first();
    if (row) await ctx.db.patch(row._id, { status });
    else await ctx.db.insert("whopPayments", { paymentId, userId: null, membershipId: null, total: null, currency: null, status, createdAt: Date.now() });
  },
});

/** Relit l'adhésion chez Whop (source de vérité) ; à défaut, se contente de ce que l'événement a apporté. */
async function syncMembership(ctx: ActionCtx, membershipId: string, fallback: Json | null): Promise<string> {
  let m: Json | null = fallback;
  try {
    m = await whopApi(`/memberships/${membershipId}`);
  } catch (e) {
    if (!m) throw e;
  }
  if (!m) return `adhésion ${membershipId} introuvable`;
  return await ctx.runMutation(internal.whop.saveMembership, {
    membershipId,
    userKey: m.metadata?.kopycat_user ? String(m.metadata.kopycat_user) : null,
    variantId: m.variant_id ?? m.plan_id ?? m.plan?.id ?? null,
    status: String(m.status ?? "unresolved"),
    periodDays: typeof m.billing_period_days === "number" ? m.billing_period_days : null,
    price: money(m.renewal_price),
    currency: moneyCurrency(m.renewal_price, m.currency),
    periodEnd: toMs(m.current_period_end ?? m.renewal_period_end ?? m.expires_at),
    cancelAtPeriodEnd: m.cancel_at_period_end === true,
    manageUrl: typeof m.manage_url === "string" ? m.manage_url : null,
  });
}

// ─── Le webhook : https://<déploiement>.convex.site/whop/webhook ───

export const claimEvent = internalMutation({
  args: { eventId: v.string(), type: v.string() },
  handler: async (ctx, { eventId, type }) => {
    if (await ctx.db.query("whopEvents").withIndex("by_event", (q) => q.eq("eventId", eventId)).first()) return false;
    await ctx.db.insert("whopEvents", { eventId, type, at: Date.now() });
    return true;
  },
});
export const noteEvent = internalMutation({
  args: { eventId: v.string(), note: v.string(), release: v.boolean() },
  handler: async (ctx, { eventId, note, release }) => {
    const row = await ctx.db.query("whopEvents").withIndex("by_event", (q) => q.eq("eventId", eventId)).first();
    if (!row) return;
    // Échec : l'événement est rendu, pour que le renvoi de Whop soit traité.
    if (release) await ctx.db.delete(row._id);
    else await ctx.db.patch(row._id, { note });
  },
});

const enc = new TextEncoder();
const b64 = (bytes: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(bytes)));
/** Les clés possibles : le secret tel quel (doc Whop : « ne retire pas le préfixe ») ou sa partie base64 (norme). */
function keyCandidates(secret: string): Uint8Array[] {
  const keys = [enc.encode(secret)];
  const rest = secret.replace(/^(whsec_|ws_)/, "");
  try {
    keys.push(Uint8Array.from(atob(rest), (c) => c.charCodeAt(0)));
  } catch {
    /* pas du base64 */
  }
  return keys;
}
function sameText(a: string, b: string) {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}
export async function verifySignature(secret: string, id: string, ts: string, body: string, header: string): Promise<boolean> {
  const sent = header.split(" ").map((p) => p.split(",")[1]).filter(Boolean);
  const msg = enc.encode(`${id}.${ts}.${body}`);
  for (const k of keyCandidates(secret)) {
    const key = await crypto.subtle.importKey("raw", k as unknown as ArrayBuffer, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const mine = b64(await crypto.subtle.sign("HMAC", key, msg as unknown as ArrayBuffer));
    if (sent.some((s) => sameText(s, mine))) return true;
  }
  return false;
}

async function handleEvent(ctx: ActionCtx, event: Json): Promise<string> {
  const type = String(event.type ?? "");
  const d: Json = event.data ?? {};
  if (type.startsWith("membership.")) {
    if (!d.id) return "adhésion sans id";
    return await syncMembership(ctx, String(d.id), d);
  }
  if (type.startsWith("payment.")) {
    if (!d.id) return "paiement sans id";
    const status = type === "payment.succeeded" ? "paid" : type === "payment.failed" ? "failed" : String(d.status ?? type.split(".")[1]);
    const membershipId = d.membership_id ?? d.membership?.id ?? null;
    await ctx.runMutation(internal.whop.savePayment, {
      paymentId: String(d.id), userKey: d.metadata?.kopycat_user ? String(d.metadata.kopycat_user) : null,
      membershipId: membershipId ? String(membershipId) : null, total: money(d.total ?? d.final_amount ?? d.amount),
      currency: moneyCurrency(d.total, d.currency), status, createdAt: toMs(d.created_at) ?? Date.now(),
    });
    // Un paiement réussi rattrape une activation dont l'événement se serait perdu.
    return membershipId ? `paiement ${d.id} ${status} ; ` + (await syncMembership(ctx, String(membershipId), null).catch((e) => String(e))) : `paiement ${d.id} ${status}`;
  }
  if (type.startsWith("refund.") || type.startsWith("dispute.")) {
    const paymentId = d.payment_id ?? d.payment?.id ?? null;
    if (paymentId) await ctx.runMutation(internal.whop.markPayment, { paymentId: String(paymentId), status: type.startsWith("refund.") ? "refunded" : "disputed" });
    const membershipId = d.membership_id ?? d.membership?.id ?? d.payment?.membership_id ?? null;
    return membershipId ? await syncMembership(ctx, String(membershipId), null).catch((e) => String(e)) : `${type} ${paymentId ?? "?"}`;
  }
  return `ignoré : ${type}`;
}

export const webhook = httpAction(async (ctx, req) => {
  const secret = process.env.WHOP_WEBHOOK_SECRET;
  if (!secret) return new Response("webhook non configuré", { status: 500 });
  const id = req.headers.get("webhook-id");
  const ts = req.headers.get("webhook-timestamp");
  const sig = req.headers.get("webhook-signature");
  const body = await req.text();
  if (!id || !ts || !sig) return new Response("signature absente", { status: 400 });
  if (!Number.isFinite(Number(ts)) || Math.abs(Date.now() / 1000 - Number(ts)) > 300) return new Response("horodatage hors délai", { status: 400 });
  if (!(await verifySignature(secret, id, ts, body, sig))) return new Response("signature invalide", { status: 401 });
  let event: Json;
  try {
    event = JSON.parse(body);
  } catch {
    return new Response("corps illisible", { status: 400 });
  }
  if (!(await ctx.runMutation(internal.whop.claimEvent, { eventId: id, type: String(event.type ?? "") }))) return new Response("déjà traité", { status: 200 });
  try {
    const note = await handleEvent(ctx, event);
    await ctx.runMutation(internal.whop.noteEvent, { eventId: id, note: note.slice(0, 500), release: false });
    console.log(`[whop] ${event.type} : ${note}`);
    return new Response("ok", { status: 200 });
  } catch (e) {
    console.error(`[whop] ${event.type} : échec`, String(e).slice(0, 500));
    await ctx.runMutation(internal.whop.noteEvent, { eventId: id, note: String(e).slice(0, 500), release: true });
    return new Response("échec, à renvoyer", { status: 500 });
  }
});

// ─── Réglages › Formule et facturation ───

/** L'abonnement de la personne connectée et ses paiements (Réglages). */
export const mine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    const subs = (await ctx.db.query("subscriptions").withIndex("by_user", (q) => q.eq("userId", userId)).collect())
      .sort((a, b) => Number(ACCESS.has(b.status)) - Number(ACCESS.has(a.status)) || (b.periodEnd ?? 0) - (a.periodEnd ?? 0));
    const s = subs[0];
    const payments = (await ctx.db.query("whopPayments").withIndex("by_user", (q) => q.eq("userId", userId)).collect())
      .filter((p) => p.status !== "failed").sort((a, b) => b.createdAt - a.createdAt).slice(0, 24);
    return {
      sub: s ? { formule: (s.periodDays ?? 0) >= 360 ? "annuel" : "mensuel", status: s.status, active: ACCESS.has(s.status), price: s.price, currency: s.currency, periodEnd: s.periodEnd, cancelAtPeriodEnd: s.cancelAtPeriodEnd, manageUrl: s.manageUrl } : null,
      payments: payments.map((p) => ({ id: p.paymentId, total: p.total, currency: p.currency, status: p.status, at: p.createdAt })),
    };
  },
});

/** Résilier (fin de période) ou reprendre l'abonnement en cours. L'état revient aussi par le webhook. */
export const setCancel = action({
  args: { cancel: v.boolean(), reason: v.optional(v.string()) },
  handler: async (ctx, { cancel, reason }): Promise<string> => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Non connecté");
    const sub = await ctx.runQuery(internal.whop.activeSub, { userId });
    if (!sub) throw new Error("Aucun abonnement en cours");
    // cancel_at_period_end: true est indispensable : sans lui, Whop coupe l'accès tout de suite.
    if (cancel) await whopApi(`/memberships/${sub.membershipId}/cancel`, { method: "POST", body: { cancel_at_period_end: true, ...(reason ? { reason: reason.slice(0, 200) } : {}) } });
    else await whopApi(`/memberships/${sub.membershipId}`, { method: "PATCH", body: { cancel_at_period_end: false } });
    return await syncMembership(ctx, sub.membershipId, null);
  },
});
