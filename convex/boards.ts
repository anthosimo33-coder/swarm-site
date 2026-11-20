import { v } from "convex/values";
import { liveUserId } from "./session";
import { query, type QueryCtx } from "./_generated/server";

/**
 * Les données d'un écran de l'app (« apps », « app:astraai », « video:<id> »…),
 * réservées aux personnes connectées. null : pas connecté, ou écran sans données.
 */
/**
 * Une miniature de vidéo passe toujours par /cover/<id> (convex/coverHttp.ts) : la copie rangée
 * (redirection), sinon copiée à la première vue, et recopiée si la copie est inutilisable (HEIC).
 * Jamais un lien TikTok signé qui expire, ni un vide quand la vidéo en a une. `v` change quand
 * il faut que les navigateurs oublient leurs anciennes réponses.
 */
const COVER_VERSION = 2;
function withCovers(data: unknown): unknown {
  const site = process.env.CONVEX_SITE_URL;
  if (!site) return data;
  const fix = (x: unknown): unknown => {
    if (Array.isArray(x)) return x.map(fix);
    if (!x || typeof x !== "object") return x;
    const o: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(x)) o[k] = typeof val === "object" ? fix(val) : val;
    // Un compte (créateur, auteur d'une vidéo) : sa photo de profil, servie par /avatar/<handle>.
    if (typeof o.handle === "string" && "fans" in o && /^[A-Za-z0-9._]{2,30}$/.test(o.handle)) o.avatar = `${site}/avatar/${o.handle}?v=1`;
    if ("cover" in o) {
      const id = (o.videoId ?? o.id) as unknown;
      if (typeof id === "string" && /^(\d{6,25}|ig:[A-Za-z0-9_-]{5,40})$/.test(id)) o.cover = `${site}/cover/${id}?v=${COVER_VERSION}`;
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
async function read(ctx: QueryCtx, key: string): Promise<unknown> {
  const row = await ctx.db.query("boards").withIndex("by_key", (q) => q.eq("key", key)).first();
  if (!row) return null;
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

type Top = { updatedAt?: unknown; markets?: unknown; niches?: unknown; marketApps?: unknown; apps: App[]; total: number };
/**
 * Le top de l'aperçu : « apps:top », écrit par la synchro (convex/radarModels.ts), quelques Ko. Audit F1 (19/11) : relire
 * « apps » (848 Ko en 4 morceaux) à chaque appel coûtait 80 fois ce qui était rendu. Tant que la synchro ne l'a pas
 * écrit (juste après un déploiement), il est tiré de « apps », comme avant.
 */
async function topOf(ctx: QueryCtx): Promise<Top | null> {
  const d = ((await read(ctx, "apps:top")) ?? (await read(ctx, "apps"))) as Partial<Top> | null;
  if (d === null) return null;
  // Champ par champ : rien d'autre du document n'arrive au navigateur gratuit.
  return { updatedAt: d.updatedAt, markets: d.markets, niches: d.niches, marketApps: d.marketApps,
    apps: appsOf(d).slice(0, PREVIEW_TOP), total: typeof d.total === "number" ? d.total : appsOf(d).length };
}

async function preview(ctx: QueryCtx, key: string): Promise<unknown> {
  if (key === "stats") return read(ctx, key);
  if (!previewable(key)) return LOCKED;
  const top = await topOf(ctx);
  if (key === "apps") return top === null ? null : { ...top, preview: true };
  const open = new Set((top?.apps ?? []).map((a) => a.slug));
  // Recherche : les apps ouvertes seulement, sans relire l'index « search » (389 Ko).
  if (key === "search") return top === null ? null : { apps: top.apps.map(({ slug, name, icon, niche, views30 }) => ({ slug, name, icon, niche, views30 })), creators: [], formats: [] };
  if (key.startsWith("app:")) return open.has(key.slice("app:".length)) ? read(ctx, key) : LOCKED;
  if (key.startsWith("video:")) {
    const d = (await read(ctx, key)) as { app?: { slug?: string } | null } | null;
    if (d === null) return null;
    return d.app?.slug && open.has(d.app.slug) ? d : LOCKED;
  }
  return LOCKED;
}

export const get = query({
  args: { key: v.string() },
  handler: async (ctx, { key }) => {
    const userId = await liveUserId(ctx);
    if (userId === null) return null;
    if ((await ctx.db.get(userId))?.pro === true) return read(ctx, key);
    return preview(ctx, key);
  },
});
