import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { query } from "./_generated/server";

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
function withCovers(data: unknown, hidden: Set<string>): unknown {
  const site = process.env.CONVEX_SITE_URL;
  if (!site) return data;
  // Une vidéo introuvable (supprimée, compte privé) n'apparaît nulle part : retirée des listes.
  const gone = (x: unknown) =>
    (typeof x === "string" && hidden.has(x)) ||
    (!!x && typeof x === "object" && !Array.isArray(x) && "cover" in x && hidden.has(String((x as Record<string, unknown>).videoId ?? (x as Record<string, unknown>).id)));
  const fix = (x: unknown): unknown => {
    if (Array.isArray(x)) return x.filter((y) => !gone(y)).map(fix);
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

export const get = query({
  args: { key: v.string() },
  handler: async (ctx, { key }) => {
    if ((await getAuthUserId(ctx)) === null) return null;
    const row = await ctx.db.query("boards").withIndex("by_key", (q) => q.eq("key", key)).first();
    if (!row) return null;
    const hidden = new Set((await ctx.db.query("hidden").first())?.ids ?? []);
    if (key.startsWith("video:") && hidden.has(key.slice("video:".length))) return null; // fiche « introuvable »
    // Grosse page rangée en morceaux de texte (convex/radarStore.ts, saveBoards) : recollée ici.
    if (row.parts) {
      const parts = await ctx.db.query("boardParts").withIndex("by_key_i", (q) => q.eq("key", key)).collect();
      if (parts.length !== row.parts) return null; // en cours de réécriture : jamais une page tronquée
      return withCovers(JSON.parse(parts.map((p) => p.text).join("")), hidden);
    }
    return withCovers(row.data, hidden);
  },
});
