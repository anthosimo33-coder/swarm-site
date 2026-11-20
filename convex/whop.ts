import { ConvexError, v } from "convex/values";
import { liveUserId, liveUserIdInAction } from "./session";
import { backgroundOff } from "./background";
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
export const ACCESS = new Set(["active", "trialing", "past_due"]);
/** Une adhésion rangée donne-t-elle l'accès ? Son statut, sauf accès coupé pour remboursement ou litige (audit S10). */
export const hasAccess = (s: { status: string; revokedAt?: number }) => ACCESS.has(s.status) && !s.revokedAt;

type Json = Record<string, any>;

async function whopApi(path: string, init: { method?: string; body?: Json } = {}): Promise<any> {
  const key = process.env.WHOP_API_KEY;
  if (!key) throw new Error("WHOP_API_KEY absente");
  const res = await fetch(API + path, {
    method: init.method ?? "GET",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", Accept: "application/json" },
    body: init.body ? JSON.stringify(init.body) : undefined,
    signal: AbortSignal.timeout(15_000), // audit Q27 : une API Whop qui traîne ne bloque plus le webhook jusqu'à la coupure
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

type Variant = { id: string; title?: string | null; billing_period?: number | null; billing_type?: string; visibility?: string; renewal_price?: number; initial_price?: number; currency?: string; tax_type?: string; product?: { id?: string } };

/**
 * Black Friday (audit du 19/11, Q1 ; décision du 20/11) : l'annuel à 179,88 € jusqu'au 30/11 à minuit (Paris), puis au
 * prix normal, 359,88 € (12 × 29,99 €). La date est la même que celle des canevas (bfLeft dans design/…) ; le tarif
 * Whop est choisi ici, par la date du serveur, jamais d'après le client. Avant, le premier tarif annuel visible était
 * pris : l'annuel serait resté vendu 179,88 € après la fin annoncée.
 */
export const BF_END = Date.parse("2026-12-01T00:00:00+01:00");

/**
 * Les tarifs Whop de Kopycat Pro, fixés (audit Q26) : jamais choisis par une recherche (« le premier tarif visible
 * d'au moins 360 jours » pouvait vendre n'importe quel prix). Chacun est relu chez Whop avant de servir, et refusé si
 * son produit, son prix, sa période ou sa devise ont changé. L'annuel à 359,88 € a été créé le 20/11 (creerAnnuelNormal),
 * masqué : la liste publique des tarifs ne le montre pas, d'où les ids fixés.
 */
export const PLANS = {
  mensuel: { id: "plan_ilOWoZwgoZGwK", price: 29.99, days: 30 },
  annuelBlackFriday: { id: "plan_ZxcFeAaIiBMk1", price: 179.88, days: 365 },
  annuel: { id: "plan_e3kvvjsKXFANv", price: 359.88, days: 365 },
} as const;
type Plan = (typeof PLANS)[keyof typeof PLANS];
export const KNOWN_PLANS: ReadonlyMap<string, Plan> = new Map(Object.values(PLANS).map((p) => [p.id, p]));
export const PRICES = { mensuel: PLANS.mensuel.price, annuelBlackFriday: PLANS.annuelBlackFriday.price, annuel: PLANS.annuel.price };
export const planFor = (formule: "mensuel" | "annuel", now: number): Plan =>
  formule === "mensuel" ? PLANS.mensuel : now < BF_END ? PLANS.annuelBlackFriday : PLANS.annuel;
export const priceFor = (formule: "mensuel" | "annuel", now: number) => planFor(formule, now).price;
const cents = (x: unknown) => Math.round(Number(x) * 100);

/** Les tarifs du produit, masqués compris (par account_id : la liste par product_ids seul ne rend que les visibles). */
async function listVariants(): Promise<Variant[]> {
  const pick = (b: any): Variant[] => (Array.isArray(b) ? b : Array.isArray(b?.data) ? b.data : []);
  return pick(await whopApi(`/variants?account_id=${ACCOUNT}&product_ids=${PRODUCT}&first=100`)).filter((x) => !x.product?.id || x.product.id === PRODUCT);
}

/** Le tarif `plan` relu chez Whop ; null s'il n'existe pas, est archivé, ou ne correspond plus (produit, prix, période, devise). */
async function checkedVariant(plan: Plan): Promise<Variant | null> {
  let x: Variant & { product_id?: string };
  try {
    x = await whopApi(`/variants/${plan.id}`);
  } catch (e) {
    if (/Whop 404/.test(String(e))) return null;
    throw e;
  }
  const product = x.product?.id ?? x.product_id ?? null;
  const fine = (!product || product === PRODUCT) && (x.billing_type ?? "renewal") === "renewal" && x.visibility !== "archived"
    && cents(x.renewal_price) === cents(plan.price) && Math.abs((x.billing_period ?? 0) - plan.days) <= 1 && String(x.currency ?? "eur").toLowerCase() === "eur";
  if (!fine) console.error(`[whop] tarif ${plan.id} ne correspond plus : ${JSON.stringify({ product, prix: x.renewal_price, jours: x.billing_period, devise: x.currency, visibilite: x.visibility })}`);
  return fine ? x : null;
}

/**
 * Le tarif Whop de la formule, au prix affiché à cette date (planFor) : un tarif à un autre prix n'est jamais pris
 * (audit Q14 / Q26). Introuvable ou changé : ConvexError TARIF_INDISPONIBLE, plutôt que de vendre à un prix non affiché.
 */
async function variantFor(formule: "mensuel" | "annuel", now: number): Promise<Variant> {
  const found = await checkedVariant(planFor(formule, now));
  if (!found) throw new ConvexError({ code: "TARIF_INDISPONIBLE" });
  return found;
}

/**
 * A créé sur Whop, le 20/11, l'annuel au prix normal (PLANS.annuel), masqué, et planifié finBlackFriday. Gardé pour
 * le diagnostic : rend le tarif existant. Sans `apply`, rend ce qui serait envoyé s'il manquait.
 */
export const creerAnnuelNormal = internalAction({
  args: { apply: v.optional(v.boolean()) },
  handler: async (ctx, { apply }): Promise<Json> => {
    const existing = await checkedVariant(PLANS.annuel);
    if (existing) return { deja: existing.id, visibilite: existing.visibility ?? null };
    const bf = await checkedVariant(PLANS.annuelBlackFriday);
    if (!bf) throw new Error("tarif annuel Black Friday introuvable : rien à copier");
    const initial = cents(bf.initial_price) === cents(bf.renewal_price) ? PRICES.annuel : bf.initial_price ?? 0;
    const body: Json = {
      account_id: ACCOUNT, product_id: PRODUCT, billing_type: "renewal", billing_period: 365, renewal_price: PRICES.annuel,
      initial_price: initial, currency: bf.currency ?? "eur", visibility: "hidden",
      ...(bf.tax_type ? { tax_type: bf.tax_type } : {}), ...(bf.title ? { title: bf.title } : {}),
    };
    if (!apply) return { envoi: body, copieDe: { id: bf.id, renewal_price: bf.renewal_price, initial_price: bf.initial_price ?? null, tax_type: bf.tax_type ?? null, title: bf.title ?? null } };
    const created = await whopApi("/variants", { method: "POST", body });
    if (Date.now() < BF_END) await ctx.scheduler.runAt(BF_END, internal.whop.finBlackFriday, {});
    return { cree: created?.id ?? null, aRanger: "PLANS.annuel dans convex/whop.ts", bascule: Date.now() < BF_END ? new Date(BF_END).toISOString() : "date passée : lancer whop:finBlackFriday" };
  },
});

/** Masque un tarif sur Whop s'il ne l'est pas encore ; rend ce qui a changé. */
async function hide(plan: Plan): Promise<string | null> {
  const x: Variant = await whopApi(`/variants/${plan.id}`);
  if (x.visibility === "hidden" || x.visibility === "archived") return null;
  await whopApi(`/variants/${plan.id}`, { method: "PATCH", body: { visibility: "hidden" } });
  return `${plan.id} (${plan.price} €) masqué`;
}

/**
 * Minuit le 1/12 (Paris) : l'annuel Black Friday est masqué sur Whop. L'annuel au prix normal reste masqué : tous les
 * tarifs ne se vendent que par l'app (décision du 20/11, audit Q29), qui les choisit par leur id.
 */
export const finBlackFriday = internalAction({
  args: {},
  handler: async (): Promise<string[]> => {
    if (Date.now() < BF_END) return ["Black Friday pas fini : rien à faire"];
    const done = [await hide(PLANS.annuelBlackFriday)].filter((x): x is string => !!x);
    console.log(`[whop] fin du Black Friday : ${done.join(", ") || "rien à changer"}`);
    return done;
  },
});

/**
 * Audit Q29 (décision du 20/11) : les tarifs de Kopycat Pro ne se vendent que par l'app. Visibles, ils s'achetaient
 * aussi sur la page Whop du produit, sans compte Kopycat relié. Masqués, ils restent vendables par le lien de paiement de
 * l'app. Lancer une fois : `npx convex run --prod whop:masquerTarifs`.
 */
export const masquerTarifs = internalAction({
  args: {},
  handler: async (): Promise<string[]> => {
    const done: string[] = [];
    for (const plan of Object.values(PLANS)) { const r = await hide(plan); if (r) done.push(r); }
    console.log(`[whop] tarifs masqués : ${done.join(", ") || "rien à changer"}`);
    return done;
  },
});

/**
 * Diagnostic avant masquerTarifs : un lien de paiement pour un tarif masqué (l'annuel à 359,88 €). Rend seulement s'il
 * a été créé et si sa page répond, jamais l'adresse. metadata « essai » : un achat par ce lien serait listé sans compte.
 */
export const essaiTarifMasque = internalAction({
  args: {},
  handler: async (): Promise<Json> => {
    const x = await checkedVariant(PLANS.annuel);
    const conf = await whopApi("/checkout_configurations", { method: "POST", body: { account_id: ACCOUNT, variant_id: PLANS.annuel.id, metadata: { kopycat_user: "essai" } } });
    const url = typeof conf?.purchase_url === "string" ? conf.purchase_url : null;
    const page = url ? await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(15_000) }).then((r) => r.status, (e) => String(e)) : null;
    return { tarif: PLANS.annuel.id, visibilite: x?.visibility ?? null, lienCree: !!url, pageDuLien: page };
  },
});

/** Diagnostic (terminal) : les tarifs vus par l'API, sans secret. `npx convex run whop:tarifs [--prod]`. */
export const tarifs = internalAction({
  args: {},
  handler: async () =>
    (await listVariants()).map((x) => ({ id: x.id, prix: x.renewal_price, initial: x.initial_price ?? null, devise: x.currency, jours: x.billing_period, visibilite: x.visibility, taxe: x.tax_type, titre: x.title ?? null })),
});

// ─── Payer : le lien de paiement Whop, relié au compte ───

const LINK_REUSE_MS = 3_600_000;
const LINKS_PER_HOUR = 10;

/** Le lien de paiement créé il y a moins d'1 h pour ce compte et cette clé (tarif et site de retour), ou null. */
export const linkFor = internalQuery({
  args: { userId: v.id("users"), key: v.string(), now: v.number() },
  handler: async (ctx, { userId, key, now }) => {
    const row = await ctx.db.query("checkoutLinks").withIndex("by_user_key", (q) => q.eq("userId", userId).eq("key", key)).first();
    return row && now - row.at < LINK_REUSE_MS ? row.url : null;
  },
});
export const saveLink = internalMutation({
  args: { userId: v.id("users"), key: v.string(), url: v.string(), now: v.number() },
  handler: async (ctx, { userId, key, url, now }) => {
    const row = await ctx.db.query("checkoutLinks").withIndex("by_user_key", (q) => q.eq("userId", userId).eq("key", key)).first();
    if (row) await ctx.db.patch(row._id, { url, at: now });
    else await ctx.db.insert("checkoutLinks", { userId, key, url, at: now });
  },
});

/**
 * L'adresse où Whop renvoie après paiement (audit S6) : seulement le site de Kopycat. Avant, tout hôte https passait :
 * un vrai lien Whop de Kopycat pouvait renvoyer la personne qui paie vers une page d'hameçonnage. En prod : SITE_URL et
 * le domaine Vercel du site. Sur le dev (SWARM_DEV_ORIGINS=1) : aussi localhost et les préversions de CE projet Vercel.
 * Toute autre origine : SITE_URL.
 */
export function returnSite(origin: string): string {
  const site = (process.env.SITE_URL || "https://swarm-site-one.vercel.app").replace(/\/+$/, "");
  if (origin === site || origin === "https://swarm-site-one.vercel.app") return origin;
  if (process.env.SWARM_DEV_ORIGINS === "1"
    && (/^http:\/\/localhost(:\d{2,5})?$/.test(origin) || /^https:\/\/swarm-site-[a-z0-9-]+-anthosimo33-coders-projects\.vercel\.app$/.test(origin))) return origin;
  return site;
}

/**
 * Déjà Pro ? `users.pro` (paiement reçu, ou posé à la main) ou une adhésion qui donne accès (audit du 19/11, S3 : un
 * compte Pro pouvait repayer, deux adhésions prélevées dont une seule visible et résiliable dans Réglages).
 */
/** Le compte est-il déjà Pro (ou payé) ? null : il n'existe plus (fermé pendant qu'une session tournait, audit S27). */
export const alreadyPro = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }): Promise<boolean | null> => {
    const user = await ctx.db.get(userId);
    if (user === null) return null;
    if (user.pro === true) return true;
    return (await ctx.db.query("subscriptions").withIndex("by_user", (q) => q.eq("userId", userId)).collect()).some(hasAccess);
  },
});

/**
 * Crée le lien de paiement Whop de la formule choisie et rend l'adresse vers laquelle envoyer la personne. Pas d'écran
 * d'accord avant Whop (choix de l'user, 19/11) : la renonciation au délai de rétractation au paiement est dans les CGV.
 * Refusé à un compte déjà Pro (ConvexError DEJA_ABONNE) : le site l'envoie vers Réglages › Formule (src/app/main.js).
 * Ne voit que les adhésions déjà reçues par webhook : deux paiements ouverts avant le premier webhook restent possibles.
 */
export const checkout = action({
  args: { formule: v.union(v.literal("mensuel"), v.literal("annuel")), origin: v.string() },
  handler: async (ctx, { formule, origin }): Promise<{ url: string }> => {
    const userId = await liveUserIdInAction(ctx);
    if (userId === null) throw new Error("Non connecté");
    const pro: boolean | null = await ctx.runQuery(internal.whop.alreadyPro, { userId });
    // Audit S27 : un compte effacé ne crée plus de lien de paiement (payé, il aurait donné accès à personne).
    if (pro === null) throw new Error("Non connecté");
    if (pro) throw new ConvexError({ code: "DEJA_ABONNE" });
    // Audit F6 : chaque appel créait un objet chez Whop, sans limite. Le même lien est resservi pendant 1 h (même
    // compte, même tarif, donc jamais un lien Black Friday après la fin, même site de retour) ; au-delà de 10 liens
    // neufs par heure, TROP_DE_DEMANDES.
    const now = Date.now();
    const key = `${planFor(formule, now).id}|${returnSite(origin)}`;
    const reuse: string | null = await ctx.runQuery(internal.whop.linkFor, { userId, key, now });
    if (reuse) return { url: reuse };
    if (!(await ctx.runMutation(internal.authLimits.hit, { key: `checkout:${userId}`, max: LINKS_PER_HOUR, windowMs: 3_600_000 }))) {
      throw new ConvexError({ code: "TROP_DE_DEMANDES" });
    }
    const variant = await variantFor(formule, now);
    const site = returnSite(origin);
    const conf = await whopApi("/checkout_configurations", {
      method: "POST",
      body: { account_id: ACCOUNT, variant_id: variant.id, metadata: { kopycat_user: userId }, redirect_url: `${site}/app?paiement=ok` },
    });
    if (typeof conf?.purchase_url !== "string") throw new Error("Whop n'a pas rendu de lien de paiement");
    await ctx.runMutation(internal.whop.saveLink, { userId, key, url: conf.purchase_url, now });
    return { url: conf.purchase_url };
  },
});

// ─── L'état de l'abonnement, tenu à jour par les webhooks ───

export const activeSub = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const subs = await ctx.db.query("subscriptions").withIndex("by_user", (q) => q.eq("userId", userId)).collect();
    return subs.filter(hasAccess).sort((a, b) => (b.periodEnd ?? 0) - (a.periodEnd ?? 0))[0] ?? null;
  },
});

/** Toutes les adhésions du compte qui donnent accès à Pro (il peut y en avoir plusieurs : audit S3). */
export const accessSubs = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) =>
    (await ctx.db.query("subscriptions").withIndex("by_user", (q) => q.eq("userId", userId)).collect()).filter(hasAccess),
});

/**
 * Fermeture du compte (audit du 19/11, S2) : chaque adhésion qui donne accès est résiliée chez Whop TOUT DE SUITE (POST
 * /memberships/{id}/cancel sans cancel_at_period_end : l'accès disparaît de toute façon avec le compte), puis relue chez
 * Whop. Lève si Whop ne répond pas, ou si une adhésion reste prélevée (accès et renouvellement prévu) : le compte n'est
 * alors pas effacé, sinon la personne paierait sans compte. Rend le nombre d'adhésions résiliées.
 */
export async function cancelAllNow(ctx: ActionCtx, userId: Id<"users">): Promise<number> {
  const subs: { membershipId: string }[] = await ctx.runQuery(internal.whop.accessSubs, { userId });
  for (const s of subs) {
    try {
      await whopApi(`/memberships/${s.membershipId}/cancel`, { method: "POST" });
    } catch (e) {
      // Déjà résiliée chez Whop (instantané périmé) : la relecture le dira ; sinon la vérification plus bas refuse.
      console.error(`[whop] résiliation de ${s.membershipId} : ${String(e).slice(0, 300)}`);
    }
    await syncMembership(ctx, s.membershipId, null); // lève si Whop ne répond pas
  }
  const left: { membershipId: string; cancelAtPeriodEnd: boolean }[] = (await ctx.runQuery(internal.whop.accessSubs, { userId })).filter((s: { cancelAtPeriodEnd: boolean }) => !s.cancelAtPeriodEnd);
  if (left.length) throw new Error(`adhésion encore prélevée chez Whop : ${left.map((s) => s.membershipId).join(", ")}`);
  return subs.length;
}

/**
 * Recalcule `users.pro` : la main de l'exploitant d'abord (proManual, users:setPro), sinon les adhésions. Avant (audit Q5),
 * seules les adhésions comptaient : un Pro posé à la main disparaissait au premier événement Whop, et une révocation à
 * la main était rouverte par le suivant.
 */
export async function recomputePro(ctx: MutationCtx, userId: Id<"users">) {
  const user = await ctx.db.get(userId);
  if (!user) return false;
  const subs = await ctx.db.query("subscriptions").withIndex("by_user", (q) => q.eq("userId", userId)).collect();
  const pro = user.proManual ?? subs.some(hasAccess);
  if ((user.pro === true) !== pro) await ctx.db.patch(userId, { pro: pro || undefined });
  return pro;
}

/** Enregistre l'état d'une adhésion Whop et recalcule l'accès du compte. Rend une note pour le journal. */
export const saveMembership = internalMutation({
  args: {
    membershipId: v.string(),
    userKey: v.union(v.string(), v.null()),
    variantId: v.union(v.string(), v.null()),
    productId: v.optional(v.union(v.string(), v.null())),
    status: v.string(),
    periodDays: v.union(v.number(), v.null()),
    price: v.union(v.string(), v.null()),
    currency: v.union(v.string(), v.null()),
    periodEnd: v.union(v.number(), v.null()),
    cancelAtPeriodEnd: v.boolean(),
    manageUrl: v.union(v.string(), v.null()),
    whopUpdatedAt: v.optional(v.union(v.number(), v.null())),
  },
  handler: async (ctx, a): Promise<string> => {
    // Audit Q26 : seule une adhésion au produit Kopycat Pro, à l'un de ses tarifs, donne l'accès. Un champ absent (forme
    // de l'adhésion v1 non vérifiée sur un achat réel) ne refuse rien ; un champ présent et étranger, si.
    if ((a.productId && a.productId !== PRODUCT) || (a.variantId && !KNOWN_PLANS.has(a.variantId))) {
      console.error(`[whop] adhésion ${a.membershipId} : produit ou tarif étranger (${a.productId ?? "?"}, ${a.variantId ?? "?"}), ignorée`);
      return `adhésion ${a.membershipId} : produit ou tarif étranger, ignorée`;
    }
    const old = await ctx.db.query("subscriptions").withIndex("by_membership", (q) => q.eq("membershipId", a.membershipId)).first();
    // Audit S9 : un instantané plus ancien que celui rangé (relecture lente, renvoi tardif) n'écrase rien.
    if (old?.whopUpdatedAt && a.whopUpdatedAt && a.whopUpdatedAt < old.whopUpdatedAt) {
      return `adhésion ${a.membershipId} : instantané du ${new Date(a.whopUpdatedAt).toISOString()} plus ancien que le rangé, ignoré`;
    }
    const fromKey = a.userKey ? ctx.db.normalizeId("users", a.userKey) : null;
    const userId = (fromKey && (await ctx.db.get(fromKey)) ? fromKey : null) ?? old?.userId ?? null;
    const row = {
      userId, membershipId: a.membershipId, variantId: a.variantId ?? old?.variantId ?? null, status: a.status,
      periodDays: a.periodDays ?? old?.periodDays ?? null, price: a.price ?? old?.price ?? null, currency: a.currency ?? old?.currency ?? null,
      periodEnd: a.periodEnd ?? old?.periodEnd ?? null, cancelAtPeriodEnd: a.cancelAtPeriodEnd, manageUrl: a.manageUrl ?? old?.manageUrl ?? null,
      updatedAt: Date.now(), ...(a.whopUpdatedAt ? { whopUpdatedAt: a.whopUpdatedAt } : {}),
    };
    const before = old?.userId ?? null; // lu avant l'écriture
    if (old) await ctx.db.patch(old._id, row);
    else await ctx.db.insert("subscriptions", row);
    // Audit Q34 (19/11) : l'adhésion passée à un autre compte (metadata.kopycat_user changé chez Whop) ; l'ancien
    // titulaire gardait Pro sans adhésion. Son accès est recalculé.
    if (before && before !== userId) await recomputePro(ctx, before);
    // Audit Q73 : un paiement arrivé avant son adhésion, sans metadata, était rangé sans compte et n'apparaissait jamais
    // dans Réglages. Les paiements de cette adhésion encore sans compte lui sont rattachés.
    if (userId) await attachPayments(ctx, a.membershipId, userId);
    // Achat sans compte relié (fait hors de l'app, audit Q29) : gardé, listé par whop:sansCompte, rattaché à la main.
    if (userId === null) {
      console.error(`[whop] adhésion ${a.membershipId} sans compte Kopycat : à rattacher (npx convex run whop:rattacher)`);
      return `adhésion ${a.membershipId} ${a.status} sans compte Kopycat (pas de kopycat_user) : gardée, à rattacher`;
    }
    const pro = await recomputePro(ctx, userId);
    return `adhésion ${a.membershipId} ${a.status}${a.cancelAtPeriodEnd ? " (résiliée en fin de période)" : ""} → pro ${pro}`;
  },
});

/** Les adhésions sans compte Kopycat relié (audit Q29). `npx convex run --prod whop:sansCompte`. */
export const sansCompte = internalQuery({
  args: {},
  handler: async (ctx) =>
    (await ctx.db.query("subscriptions").withIndex("by_user", (q) => q.eq("userId", null)).collect())
      .map((s) => ({ membershipId: s.membershipId, status: s.status, variantId: s.variantId, price: s.price, updatedAt: s.updatedAt })),
});

/**
 * Rattache une adhésion (et ses paiements) au compte de cet e-mail, puis recalcule son accès.
 * `npx convex run --prod whop:rattacher '{"membershipId":"mem_…","email":"…"}'`. Refuse si l'e-mail désigne 0 ou 2 comptes.
 */
export const rattacher = internalMutation({
  args: { membershipId: v.string(), email: v.string() },
  handler: async (ctx, { membershipId, email }) => {
    const users = await ctx.db.query("users").withIndex("email", (q) => q.eq("email", email.trim().toLowerCase())).take(2);
    if (users.length !== 1) return { ok: false, raison: users.length ? "plusieurs comptes avec cet e-mail" : "aucun compte avec cet e-mail" };
    const sub = await ctx.db.query("subscriptions").withIndex("by_membership", (q) => q.eq("membershipId", membershipId)).first();
    if (!sub) return { ok: false, raison: "adhésion inconnue" };
    if (sub.userId && sub.userId !== users[0]._id) return { ok: false, raison: "adhésion déjà reliée à un autre compte" };
    await ctx.db.patch(sub._id, { userId: users[0]._id, updatedAt: Date.now() });
    await attachPayments(ctx, membershipId, users[0]._id);
    return { ok: true, pro: await recomputePro(ctx, users[0]._id) };
  },
});

/** Rattache au compte les paiements d'une adhésion encore sans compte (Q29, Q73). */
async function attachPayments(ctx: MutationCtx, membershipId: string, userId: Id<"users">) {
  for (const p of await ctx.db.query("whopPayments").withIndex("by_user", (q) => q.eq("userId", null)).collect()) {
    if (p.membershipId === membershipId) await ctx.db.patch(p._id, { userId });
  }
}

/**
 * Un statut de paiement ne recule pas (audit Q35, 19/11) : un payment.succeeded rejoué après un remboursement remettait
 * « paid », et le reçu affichait « Payé » au lieu de « Remboursé ». refunded et disputed ne cèdent qu'entre eux ; paid ne
 * redevient pas pending ni failed.
 */
const PAYMENT_RANK: Record<string, number> = { pending: 0, failed: 1, paid: 2, refunded: 3, disputed: 3 };
export const nextPaymentStatus = (before: string | null | undefined, incoming: string) =>
  before && (PAYMENT_RANK[before] ?? -1) > (PAYMENT_RANK[incoming] ?? -1) ? before : incoming;

export const savePayment = internalMutation({
  args: { paymentId: v.string(), userKey: v.union(v.string(), v.null()), membershipId: v.union(v.string(), v.null()), total: v.union(v.string(), v.null()), currency: v.union(v.string(), v.null()), status: v.string(), createdAt: v.number() },
  handler: async (ctx, a) => {
    const old = await ctx.db.query("whopPayments").withIndex("by_payment", (q) => q.eq("paymentId", a.paymentId)).first();
    let userId: Id<"users"> | null = a.userKey ? ctx.db.normalizeId("users", a.userKey) : null;
    if (userId && !(await ctx.db.get(userId))) userId = null;
    if (!userId && a.membershipId) userId = (await ctx.db.query("subscriptions").withIndex("by_membership", (q) => q.eq("membershipId", a.membershipId!)).first())?.userId ?? null;
    const row = { paymentId: a.paymentId, userId: userId ?? old?.userId ?? null, membershipId: a.membershipId ?? old?.membershipId ?? null, total: a.total ?? old?.total ?? null, currency: a.currency ?? old?.currency ?? null, status: nextPaymentStatus(old?.status, a.status), createdAt: old?.createdAt ?? a.createdAt };
    if (old) await ctx.db.patch(old._id, row);
    else await ctx.db.insert("whopPayments", row);
  },
});

export const markPayment = internalMutation({
  args: { paymentId: v.string(), status: v.string() },
  handler: async (ctx, { paymentId, status }): Promise<{ membershipId: string | null; total: string | null }> => {
    const row = await ctx.db.query("whopPayments").withIndex("by_payment", (q) => q.eq("paymentId", paymentId)).first();
    if (row) await ctx.db.patch(row._id, { status });
    else await ctx.db.insert("whopPayments", { paymentId, userId: null, membershipId: null, total: null, currency: null, status, createdAt: Date.now() });
    return { membershipId: row?.membershipId ?? null, total: row?.total ?? null };
  },
});

/** Coupe l'accès d'une adhésion (remboursement total, litige : audit S10) ; un événement ultérieur ne le rouvre pas. */
export const revoke = internalMutation({
  args: { membershipId: v.string(), reason: v.string() },
  handler: async (ctx, { membershipId, reason }) => {
    const sub = await ctx.db.query("subscriptions").withIndex("by_membership", (q) => q.eq("membershipId", membershipId)).first();
    if (!sub) return `adhésion ${membershipId} inconnue, rien à couper (${reason})`;
    if (!sub.revokedAt) await ctx.db.patch(sub._id, { revokedAt: Date.now() });
    const pro = sub.userId ? await recomputePro(ctx, sub.userId) : false;
    return `adhésion ${membershipId} : accès coupé (${reason}) → pro ${pro}`;
  },
});

/** L'adhésion rangée, ou null. */
export const subByMembership = internalQuery({
  args: { membershipId: v.string() },
  handler: async (ctx, { membershipId }) => ctx.db.query("subscriptions").withIndex("by_membership", (q) => q.eq("membershipId", membershipId)).first(),
});

/**
 * Relit l'adhésion chez Whop (source de vérité). Si Whop ne répond pas, la charge de l'événement ne sert que si elle
 * retire l'accès, ou si l'adhésion n'est pas encore rangée (une première activation n'est pas perdue). Sinon l'erreur
 * remonte : réponse 500, Whop renvoie. Avant (audit S9), un vieux went_valid rejoué pendant une panne rouvrait l'accès.
 */
async function syncMembership(ctx: ActionCtx, membershipId: string, fallback: Json | null): Promise<string> {
  let m: Json | null = fallback;
  try {
    m = await whopApi(`/memberships/${membershipId}`);
  } catch (e) {
    if (!m) throw e;
    const known = await ctx.runQuery(internal.whop.subByMembership, { membershipId });
    if (known && ACCESS.has(String(m.status ?? ""))) throw e;
  }
  if (!m) return `adhésion ${membershipId} introuvable`;
  // Audit Q28 : la période et le prix se lisent sur l'adhésion s'ils y sont, sinon sur le tarif fixé (PLANS). Avant,
  // une adhésion annuelle sans ces champs s'affichait « mensuel », sans prix, avec une période de 30 jours.
  const variantId: string | null = m.variant_id ?? m.plan_id ?? m.plan?.id ?? m.variant?.id ?? null;
  const plan = variantId ? KNOWN_PLANS.get(variantId) : undefined;
  if (typeof m.billing_period_days !== "number" || m.renewal_price == null) {
    console.log(`[whop] adhésion ${membershipId} sans période ou prix ; champs : ${Object.keys(m).join(", ")}`);
  }
  return await ctx.runMutation(internal.whop.saveMembership, {
    membershipId,
    userKey: m.metadata?.kopycat_user ? String(m.metadata.kopycat_user) : null,
    variantId,
    productId: m.product_id ?? m.product?.id ?? null,
    status: String(m.status ?? "unresolved"),
    periodDays: typeof m.billing_period_days === "number" ? m.billing_period_days : plan?.days ?? null,
    price: money(m.renewal_price) ?? (plan ? plan.price.toFixed(2) : null),
    currency: moneyCurrency(m.renewal_price, m.currency) ?? (plan ? "eur" : null),
    periodEnd: toMs(m.current_period_end ?? m.renewal_period_end ?? m.expires_at),
    cancelAtPeriodEnd: m.cancel_at_period_end === true,
    manageUrl: typeof m.manage_url === "string" ? m.manage_url : null,
    whopUpdatedAt: toMs(m.updated_at),
  });
}

/** Les adhésions rangées avec accès, à relire chez Whop (500 au plus). */
export const toReconcile = internalQuery({
  args: {},
  handler: async (ctx) =>
    (await ctx.db.query("subscriptions").order("desc").take(2000)).filter(hasAccess).slice(0, 500).map((s) => s.membershipId),
});

/**
 * Réconciliation quotidienne (audit S9, Q27) : chaque adhésion rangée avec accès est relue chez Whop. Une adhésion
 * terminée n'émet plus d'événement : sans cette relecture, un état faux (événement perdu, instantané périmé) restait
 * Pro à vie. Cron dans convex/crons.ts.
 */
export const reconcile = internalAction({
  args: {},
  handler: async (ctx): Promise<string[]> => {
    if (!process.env.WHOP_API_KEY || backgroundOff()) return [];
    const ids: string[] = await ctx.runQuery(internal.whop.toReconcile, {});
    const notes: string[] = [];
    for (const id of ids) {
      try { notes.push(await syncMembership(ctx, id, null)); } catch (e) { notes.push(`${id} : ${String(e).slice(0, 200)}`); }
    }
    console.log(`[whop] réconciliation : ${notes.join(" ; ") || "aucune adhésion avec accès"}`);
    return notes;
  },
});

// ─── Le webhook : https://<déploiement>.convex.site/whop/webhook ───

/**
 * Prend un événement à traiter (audit Q27) : « go » s'il est neuf (ou si un traitement est resté coupé plus de 5 min),
 * « busy » s'il est en cours de traitement (Whop doit le renvoyer plus tard, pas recevoir 200), « done » s'il est traité.
 */
export const claimEvent = internalMutation({
  args: { eventId: v.string(), type: v.string() },
  handler: async (ctx, { eventId, type }): Promise<"go" | "busy" | "done"> => {
    const now = Date.now();
    const row = await ctx.db.query("whopEvents").withIndex("by_event", (q) => q.eq("eventId", eventId)).first();
    if (!row) {
      await ctx.db.insert("whopEvents", { eventId, type, at: now, state: "processing" });
      return "go";
    }
    if (row.state !== "processing") return "done";
    if (now - row.at < 5 * 60_000) return "busy";
    await ctx.db.patch(row._id, { at: now });
    return "go";
  },
});
export const noteEvent = internalMutation({
  args: { eventId: v.string(), note: v.string(), release: v.boolean() },
  handler: async (ctx, { eventId, note, release }) => {
    const row = await ctx.db.query("whopEvents").withIndex("by_event", (q) => q.eq("eventId", eventId)).first();
    if (!row) return;
    // Échec : l'événement est rendu, pour que le renvoi de Whop soit traité.
    if (release) await ctx.db.delete(row._id);
    else await ctx.db.patch(row._id, { note, state: "done" });
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
  // « v1,<signature> », séparées par des espaces ; une autre version n'est pas comprise, donc refusée (audit Q41).
  const sent = header.split(" ").map((p) => p.split(",")).filter(([version, sig]) => version === "v1" && !!sig).map(([, sig]) => sig);
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
    // Un paiement réussi rattrape une activation dont l'événement se serait perdu. Un échec de la relecture remonte
    // (réponse 500, Whop renvoie) : avant, il était avalé et l'événement marqué traité (audit Q27).
    return membershipId ? `paiement ${d.id} ${status} ; ` + (await syncMembership(ctx, String(membershipId), null)) : `paiement ${d.id} ${status}`;
  }
  if (type.startsWith("refund.") || type.startsWith("dispute.")) {
    // Audit S10 : un remboursement total ou un litige coupe l'accès tout de suite, même si Whop laisse l'adhésion active.
    // L'adhésion se retrouve par le paiement rangé (la charge d'un remboursement ne la porte pas), sinon chez Whop.
    const dispute = type.startsWith("dispute.");
    if (!dispute && String(d.status ?? "succeeded") !== "succeeded") return `${type} ${d.id ?? "?"} : ${d.status}, rien à faire encore`;
    const paymentId = d.payment_id ?? d.payment?.id ?? null;
    const paid: { membershipId: string | null; total: string | null } | null = paymentId
      ? await ctx.runMutation(internal.whop.markPayment, { paymentId: String(paymentId), status: dispute ? "disputed" : "refunded" }) : null;
    let membershipId: string | null = d.membership_id ?? d.membership?.id ?? paid?.membershipId ?? null;
    let total = paid?.total ?? null;
    if (paymentId && (!membershipId || total === null)) {
      const p: Json = await whopApi(`/payments/${paymentId}`);
      membershipId ??= p.membership_id ?? p.membership?.id ?? null;
      total ??= money(p.total ?? p.final_amount ?? p.amount);
    }
    // Montant du remboursement inconnu : tenu pour total (garder l'accès après un remboursement total serait pire).
    const amount = money(d.amount ?? d.total);
    if (!dispute && amount !== null && total !== null && cents(amount) < cents(total)) return `remboursement partiel ${d.id ?? "?"} (${amount} sur ${total}) : accès gardé`;
    if (!membershipId) return `${type} ${paymentId ?? "?"} : adhésion introuvable`;
    await whopApi(`/memberships/${membershipId}/cancel`, { method: "POST" }).catch((e) => {
      if (!/Whop (404|409|422)/.test(String(e))) throw e; // déjà résiliée chez Whop : rien de plus à faire
    });
    const cut: string = await ctx.runMutation(internal.whop.revoke, { membershipId: String(membershipId), reason: dispute ? "litige" : "remboursement" });
    return `${cut} ; ${await syncMembership(ctx, String(membershipId), null)}`;
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
  const claim: "go" | "busy" | "done" = await ctx.runMutation(internal.whop.claimEvent, { eventId: id, type: String(event.type ?? "") });
  if (claim === "done") return new Response("déjà traité", { status: 200 });
  if (claim === "busy") return new Response("en cours de traitement, à renvoyer", { status: 409 });
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

// ─── Retour de Whop sans webhook (audit Q6) ───

/**
 * « Vérifier mon paiement » : relit chez Whop les adhésions du produit reliées à la personne connectée (metadata
 * kopycat_user) et les range, comme le ferait le webhook. Recours quand le webhook n'arrive pas (secret mal réglé, panne).
 * 6 vérifications par 10 min au plus. Rend si l'accès est ouvert et combien d'adhésions ont été trouvées.
 * Hypothèse : GET /memberships accepte account_id et product_ids (doc v1, non essayé sur un achat réel).
 */
export const verifierPaiement = action({
  args: {},
  handler: async (ctx): Promise<{ pro: boolean; trouvees: number }> => {
    const userId = await liveUserIdInAction(ctx);
    if (userId === null) throw new Error("Non connecté");
    if (!(await ctx.runMutation(internal.authLimits.hit, { key: `verif:${userId}`, max: 6, windowMs: 600_000 }))) throw new ConvexError({ code: "TROP_DE_DEMANDES" });
    const body = await whopApi(`/memberships?account_id=${ACCOUNT}&product_ids=${PRODUCT}&first=100`);
    const list: Json[] = Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : [];
    const mine = list.filter((m) => String(m.metadata?.kopycat_user ?? "") === userId && m.id);
    for (const m of mine) await syncMembership(ctx, String(m.id), m);
    return { pro: (await ctx.runQuery(internal.whop.alreadyPro, { userId })) === true, trouvees: mine.length };
  },
});

// ─── Réglages › Formule et facturation ───

/** L'abonnement de la personne connectée et ses paiements (Réglages). */
export const mine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await liveUserId(ctx);
    if (userId === null) return null;
    const subs = (await ctx.db.query("subscriptions").withIndex("by_user", (q) => q.eq("userId", userId)).collect())
      .sort((a, b) => Number(hasAccess(b)) - Number(hasAccess(a)) || (b.periodEnd ?? 0) - (a.periodEnd ?? 0));
    const s = subs[0];
    const payments = (await ctx.db.query("whopPayments").withIndex("by_user", (q) => q.eq("userId", userId)).collect())
      .filter((p) => p.status !== "failed").sort((a, b) => b.createdAt - a.createdAt).slice(0, 24);
    return {
      sub: s ? { formule: (s.periodDays ?? 0) >= 360 ? "annuel" : "mensuel", status: s.status, active: hasAccess(s), price: s.price, currency: s.currency, periodEnd: s.periodEnd, cancelAtPeriodEnd: s.cancelAtPeriodEnd, manageUrl: s.manageUrl } : null,
      payments: payments.map((p) => ({ id: p.paymentId, total: p.total, currency: p.currency, status: p.status, at: p.createdAt })),
    };
  },
});

/** Résilier (fin de période) ou reprendre l'abonnement en cours. L'état revient aussi par le webhook. */
export const setCancel = action({
  args: { cancel: v.boolean(), reason: v.optional(v.string()) },
  handler: async (ctx, { cancel, reason }): Promise<string> => {
    const userId = await liveUserIdInAction(ctx);
    if (userId === null) throw new Error("Non connecté");
    const sub = await ctx.runQuery(internal.whop.activeSub, { userId });
    if (!sub) throw new Error("Aucun abonnement en cours");
    // cancel_at_period_end: true est indispensable : sans lui, Whop coupe l'accès tout de suite.
    if (cancel) await whopApi(`/memberships/${sub.membershipId}/cancel`, { method: "POST", body: { cancel_at_period_end: true, ...(reason ? { reason: reason.slice(0, 200) } : {}) } });
    else await whopApi(`/memberships/${sub.membershipId}`, { method: "PATCH", body: { cancel_at_period_end: false } });
    return await syncMembership(ctx, sub.membershipId, null);
  },
});
