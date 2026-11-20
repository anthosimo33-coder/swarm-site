import { v } from "convex/values";
import { mutation, query, type QueryCtx } from "./_generated/server";
import { liveUserId } from "./session";
import { ACCESS } from "./whop";

/**
 * Admin › Mesure (page /admin). Réservée aux adresses de la variable d'environnement ADMIN_EMAILS (séparées par
 * des virgules) : pour tout autre compte, `data` renvoie null et la page dit qu'elle n'existe pas.
 *
 * Le serveur renvoie les lignes brutes, la page compte : les jours se découpent à l'heure de la personne qui
 * regarde, et changer de période (aujourd'hui, 7 jours, 30 jours, tout) ne refait pas de requête.
 */

/** Comptes de test : les domaines réservés aux exemples. En prod, les 16 comptes de test sont en @exemple.fr et @ex.fr. */
const TEST = /@(exemple\.fr|ex\.fr|example\.(com|org|net))$/i;
/** Combien des dernières inscriptions portent leur e-mail et leur moyen de connexion (le fil « En direct »). */
const RECENT = 30;

async function isAdmin(ctx: QueryCtx): Promise<boolean> {
  const userId = await liveUserId(ctx);
  if (userId === null) return false;
  const email = (await ctx.db.get(userId))?.email?.toLowerCase();
  const allowed = (process.env.ADMIN_EMAILS ?? "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  return !!email && allowed.includes(email);
}

export const data = query({
  args: { since: v.number() },
  handler: async (ctx, { since }) => {
    if (!(await isAdmin(ctx))) return null;
    const users = await ctx.db.query("users").order("desc").collect();
    const emailOf = new Map(users.map((u) => [u._id as string, u.email ?? ""]));
    const isTest = (email: string) => TEST.test(email);

    const signups = [];
    for (const [i, u] of users.entries()) {
      const email = u.email ?? "";
      const row: { t: number; test: boolean; email?: string; google?: boolean } = { t: u._creationTime, test: isTest(email) };
      if (i < RECENT) {
        const accounts = await ctx.db.query("authAccounts").withIndex("userIdAndProvider", (q) => q.eq("userId", u._id)).collect();
        row.email = email;
        row.google = accounts.some((a) => a.provider === "google");
      }
      signups.push(row);
    }

    const subs = (await ctx.db.query("subscriptions").collect()).map((s) => {
      // Achat sans compte relié (audit Q29) : signalé ici, rattaché par whop:rattacher.
      const email = s.userId === null ? "sans compte (à rattacher)" : emailOf.get(s.userId) ?? "";
      return {
        t: s._creationTime, updatedAt: s.updatedAt, email, test: isTest(email), membershipId: s.membershipId,
        status: s.status, active: ACCESS.has(s.status), annual: (s.periodDays ?? 0) >= 360, periodDays: s.periodDays,
        price: Number(s.price ?? 0) || 0, periodEnd: s.periodEnd, cancelAtPeriodEnd: s.cancelAtPeriodEnd,
      };
    });

    const payments = (await ctx.db.query("whopPayments").collect()).map((p) => {
      const email = p.userId ? emailOf.get(p.userId) ?? "" : "";
      return { t: p.createdAt, email, test: isTest(email), membershipId: p.membershipId, total: Number(p.total ?? 0) || 0, status: p.status };
    });

    const visits = (await ctx.db.query("visits").withIndex("by_hour", (q) => q.gte("hour", Math.floor(since / 3_600_000))).collect())
      .map((r) => ({ hour: r.hour, n: r.n }));

    return { now: Date.now(), signups, subs, payments, visits };
  },
});

/**
 * Une visite du site public : appelée une fois par onglet (sessionStorage) depuis l'accueil et les tarifs.
 * Rien n'identifie la personne : ni cookie, ni identifiant, ni adresse IP, seulement +1 sur le compteur de l'heure.
 */
export const visit = mutation({
  args: {},
  handler: async (ctx) => {
    const hour = Math.floor(Date.now() / 3_600_000);
    const row = await ctx.db.query("visits").withIndex("by_hour", (q) => q.eq("hour", hour)).first();
    if (row) await ctx.db.patch(row._id, { n: row.n + 1 });
    else await ctx.db.insert("visits", { hour, n: 1 });
  },
});
