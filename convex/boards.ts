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
function withCovers(data: unknown): unknown {
  const site = process.env.CONVEX_SITE_URL;
  if (!site) return data;
  const fix = (x: unknown): unknown => {
    if (Array.isArray(x)) return x.map(fix);
    if (!x || typeof x !== "object") return x;
    const o: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(x)) o[k] = typeof val === "object" ? fix(val) : val;
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
    return row ? withCovers(row.data) : null;
  },
});
