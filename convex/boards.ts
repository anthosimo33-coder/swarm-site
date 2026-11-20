import { ConvexError, v } from "convex/values";
import { liveUserId } from "./session";
import { mutation, query, type QueryCtx } from "./_generated/server";
import { SIGNED, signMark, signMedia } from "./coverSign";
import { FREE_KEYS, KEY_MAX, PASS_BATCH, PASS_ERROR, PASS_MS, passFor, passOk, takePages } from "./boardQuota";

/**
 * Une page prête pour l'écran. Audit F28 (19/11) : chaque lecture recopiait tout l'arbre de la page pour y réécrire les
 * adresses des miniatures et des photos (signées, convex/coverSign.ts). La synchro les écrit désormais elle-même, et
 * marque la page (SIGNED) : une page marquée avec la clé et les versions en cours est rendue telle quelle, sans copie.
 * Une page pas encore réécrite (juste après un déploiement) ou signée avec une autre clé est réécrite ici, comme avant.
 */
function ready(data: unknown): unknown {
  if (data && typeof data === "object" && !Array.isArray(data) && SIGNED in data) {
    const { [SIGNED]: mark, ...rest } = data as Record<string, unknown>;
    if (mark === signMark()) return rest;
    data = rest;
  }
  const site = process.env.CONVEX_SITE_URL;
  return site ? signMedia(data, site).data : data;
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
    return ready(JSON.parse(parts.map((p) => p.text).join("")));
  }
  return ready(row.data);
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
 * Abonné : chaque page demande son laissez-passer (`pass`, délivré par `passes`, audit S22 : convex/boardQuota.ts) ;
 * sans laissez-passer valable, l'erreur PASS_ERROR, sans rien lire (l'app en demande un et reprend l'abonnement ; une
 * app d'avant le quota y montre « les données arrivent »). Rien n'est lu ni écrit pour compter : la requête ne relance
 * pas les pages déjà ouvertes quand le compteur bouge.
 */
export const get = query({
  args: { key: v.string(), pass: v.optional(v.string()) },
  handler: async (ctx, { key, pass }) => {
    const userId = await liveUserId(ctx);
    if (userId === null) return null;
    if ((await ctx.db.get(userId))?.pro === true) return proRead(ctx, userId, key, pass);
    return preview(ctx, key);
  },
});

async function proRead(ctx: QueryCtx, userId: string, key: string, pass: string | undefined): Promise<unknown> {
  if (!FREE_KEYS.has(key) && !passOk(userId, key, pass, Date.now())) throw new ConvexError({ code: PASS_ERROR });
  return read(ctx, key);
}

/**
 * Les laissez-passer des pages qu'un abonné ouvre (audit S22) : un par clé, valable PASS_MS, comptés sur le quota
 * (convex/boardQuota.ts). `refused` : les clés au-delà du quota, `until` : quand de nouvelles pages rouvrent, `at` :
 * l'heure du serveur (l'app en tire son échéance, quelle que soit l'avance ou le retard de son horloge). Sans
 * abonnement, rien (l'aperçu n'en demande pas). PASS_BATCH clés au plus par appel ; l'app regroupe ses demandes.
 */
export const passes = mutation({
  args: { keys: v.array(v.string()) },
  handler: async (ctx, { keys }) => {
    const none = { passes: {} as Record<string, string>, exp: 0, refused: [] as string[], until: null as number | null, at: Date.now() };
    const userId = await liveUserId(ctx);
    if (userId === null || (await ctx.db.get(userId))?.pro !== true) return none;
    const want = [...new Set(keys)].filter((k) => k.length > 0 && k.length <= KEY_MAX && !FREE_KEYS.has(k)).slice(0, PASS_BATCH);
    if (!want.length) return none;
    const now = Date.now();
    const { granted, until } = await takePages(ctx, userId, want.length, now);
    const exp = now + PASS_MS;
    const out: Record<string, string> = {};
    for (const key of want.slice(0, granted)) {
      const p = passFor(userId, key, exp);
      if (p) out[key] = p;
    }
    return { passes: out, exp, refused: want.slice(granted), until, at: now };
  },
});
