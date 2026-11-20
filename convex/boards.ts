import { v } from "convex/values";
import { liveUserId } from "./session";
import { query, type QueryCtx } from "./_generated/server";
import { avatarUrl, COVER_ID, coverUrl, HANDLE } from "./coverSign";

/**
 * Une miniature de vidéo passe toujours par /cover/<id> (convex/coverHttp.ts) : la copie rangée
 * (redirection), sinon copiée à la première vue, et recopiée si la copie est inutilisable (HEIC).
 * Jamais un lien TikTok signé qui expire, ni un vide quand la vidéo en a une. Chaque adresse est signée
 * (convex/coverSign.ts, audit S5 et S15) : seules celles que boards.get rend ouvrent une image.
 */
function withCovers(data: unknown): unknown {
  const site = process.env.CONVEX_SITE_URL;
  if (!site) return data;
  const fix = (x: unknown): unknown => {
    if (Array.isArray(x)) return x.map(fix);
    if (!x || typeof x !== "object") return x;
    const o: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(x)) o[k] = typeof val === "object" ? fix(val) : val;
    // Un compte (créateur, auteur d'une vidéo) : sa photo de profil, servie par /avatar/<handle>.
    if (typeof o.handle === "string" && "fans" in o && HANDLE.test(o.handle)) { const a = avatarUrl(site, o.handle); if (a) o.avatar = a; }
    if ("cover" in o) {
      const id = (o.videoId ?? o.id) as unknown;
      // Sans secret de signature, aucune adresse plutôt qu'une adresse que /cover refuserait.
      if (typeof id === "string" && COVER_ID.test(id)) o.cover = coverUrl(site, id);
    }
    return o;
  };
  return fix(data);
}

/**
 * Le document d'une clé, prêt pour l'écran ; null s'il n'existe pas (ou est en cours de réécriture).
 * Une vidéo notée introuvable (mediaMiss, vidéo supprimée ou compte privé) n'a pas de fiche. Audit F14 (19/11) : ce test
 * lisait la liste globale `hidden` à CHAQUE appel, si bien que chaque vidéo notée introuvable relançait toutes les
 * requêtes ouvertes, de tous les comptes. Il ne lit plus que la ligne de cette vidéo ; les listes, elles, sont déjà
 * filtrées par la synchro (radarModels.ts, `missing`), et une miniature cassée entre deux passages est masquée par
 * l'écran (src/app/main.js, `is-broken`).
 */
async function read(ctx: QueryCtx, key: string, followed = false): Promise<unknown> {
  const row = await ctx.db.query("boards").withIndex("by_key", (q) => q.eq("key", key)).first();
  if (!row) {
    // Une app fusionnée : sa fiche est celle de l'app qui l'a reprise (audit Q25 ; un seul saut).
    const to = key.startsWith("app:") && !followed ? await mergedInto(ctx, key.slice("app:".length)) : null;
    return to ? read(ctx, `app:${to}`, true) : null;
  }
  if (key.startsWith("video:")) {
    const miss = await ctx.db.query("mediaMiss").withIndex("by_key", (q) => q.eq("key", `v:${key.slice("video:".length)}`)).first();
    if (miss) return null; // fiche « introuvable »
  }
  // Grosse page rangée en morceaux de texte (convex/radarStore.ts, saveBoards) : recollée ici.
  if (row.parts) {
    const parts = await ctx.db.query("boardParts").withIndex("by_key_i", (q) => q.eq("key", key)).collect();
    if (parts.length !== row.parts) return null; // en cours de réécriture : jamais une page tronquée
    return withCovers(JSON.parse(parts.map((p) => p.text).join("")));
  }
  return withCovers(row.data);
}

/**
 * L'app qui a repris une app fusionnée, d'après « apps:merged » (convex/radarModels.ts, audit Q25), ou null. Un lien
 * gardé (dossier, adresse notée) vers l'ancien slug mène ainsi à la bonne fiche au lieu de « fiche absente ».
 */
async function mergedInto(ctx: QueryCtx, slug: string): Promise<string | null> {
  const d = (await read(ctx, "apps:merged", true)) as { merged?: [string, string][] } | null;
  return d?.merged?.find(([from]) => from === slug)?.[1] ?? null;
}

/**
 * L'aperçu (19/11) : un compte sans abonnement (`users.pro` absent) ne reçoit que le top 3 du classement des apps
 * (trié par vues sur 30 jours), les fiches et les vidéos de ces 3 apps, et les chiffres publics (`stats`). Tout autre
 * document vaut LOCKED : verrouillé, distinct de null (absent). Le verrou est ici, pas à l'écran : rien de ce qui est
 * fermé n'arrive au navigateur.
 */
export const PREVIEW_TOP = 3; // même valeur que PREVIEW_TOP de convex/radarModels.ts (vérifié par scripts/apercu.test.mjs)
const LOCKED = { locked: true } as const;
type App = { slug: string; name: string; icon?: unknown; niche?: unknown; views30?: number };
const appsOf = (d: unknown): App[] => (d && typeof d === "object" && Array.isArray((d as { apps?: unknown }).apps) ? (d as { apps: App[] }).apps : []);
/** Les seules clés qu'un compte sans abonnement peut lire (avec stats) : toute autre répond LOCKED sans rien lire. */
const previewable = (key: string) => key === "apps" || key === "search" || key.startsWith("app:") || key.startsWith("video:");

type Top = { updatedAt?: unknown; apps: App[]; total: number };
/**
 * Le top de l'aperçu : « apps:top », écrit par la synchro (convex/radarModels.ts), quelques Ko. Audit F1 (19/11) : relire
 * « apps » (848 Ko en 4 morceaux) à chaque appel coûtait 80 fois ce qui était rendu. Tant que la synchro ne l'a pas
 * écrit (juste après un déploiement), il est tiré de « apps », comme avant.
 * Audit S29 (19/11) : seuls la date, le top et le nombre d'apps sortent. Les marchés (pays et nombre de créateurs
 * suivis), les apps par pays et les niches de la base payante partaient aussi au navigateur gratuit, qu'aucun écran
 * de l'aperçu ne lit.
 */
async function topOf(ctx: QueryCtx): Promise<Top | null> {
  const d = ((await read(ctx, "apps:top")) ?? (await read(ctx, "apps"))) as Partial<Top> | null;
  if (d === null) return null;
  // Champ par champ : rien d'autre du document n'arrive au navigateur gratuit.
  return { updatedAt: d.updatedAt, apps: appsOf(d).slice(0, PREVIEW_TOP), total: typeof d.total === "number" ? d.total : appsOf(d).length };
}

async function preview(ctx: QueryCtx, key: string): Promise<unknown> {
  if (key === "stats") return read(ctx, key);
  if (!previewable(key)) return LOCKED;
  const top = await topOf(ctx);
  if (key === "apps") return top === null ? null : { ...top, preview: true };
  const open = new Set((top?.apps ?? []).map((a) => a.slug));
  // Recherche : les apps ouvertes seulement, sans relire l'index « search » (389 Ko).
  if (key === "search") return top === null ? null : { apps: top.apps.map(({ slug, name, icon, niche, views30 }) => ({ slug, name, icon, niche, views30 })), creators: [], formats: [] };
  if (key.startsWith("app:")) {
    const slug = key.slice("app:".length);
    const to = open.has(slug) ? slug : await mergedInto(ctx, slug); // l'ancien slug d'une app du top
    return to && open.has(to) ? read(ctx, `app:${to}`) : LOCKED;
  }
  if (key.startsWith("video:")) {
    const d = (await read(ctx, key)) as { app?: { slug?: string } | null } | null;
    // Inconnue ou introuvable : la même réponse qu'une vidéo fermée (audit S15 : null disait qu'elle n'existe pas).
    if (d === null) return LOCKED;
    return d.app?.slug && open.has(d.app.slug) ? d : LOCKED;
  }
  return LOCKED;
}

/**
 * Les données d'un écran de l'app (« apps », « app:astraai », « video:<id> »…), réservées aux personnes connectées.
 * null : pas connecté, ou écran sans données ; LOCKED : fermé sans abonnement (preview).
 */
export const get = query({
  args: { key: v.string() },
  handler: async (ctx, { key }) => {
    const userId = await liveUserId(ctx);
    if (userId === null) return null;
    if ((await ctx.db.get(userId))?.pro === true) return read(ctx, key);
    return preview(ctx, key);
  },
});
