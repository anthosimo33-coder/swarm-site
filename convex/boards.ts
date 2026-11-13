import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { query } from "./_generated/server";

/**
 * Les données d'un écran de l'app (« apps », « app:astraai », « video:<id> »…),
 * réservées aux personnes connectées. null : pas connecté, ou écran sans données.
 */
/**
 * Une miniature est toujours servie par Swarm : sa copie rangée, sinon l'adresse /cover/<id>
 * (convex/coverHttp.ts) qui la copie à la première vue. Jamais un lien TikTok signé qui expire,
 * ni un vide quand la vidéo en a une. (Les vidéos Instagram gardent leur lien.)
 */
function withCovers(data: unknown): unknown {
  const site = process.env.CONVEX_SITE_URL;
  const stored = `${process.env.CONVEX_CLOUD_URL}/api/storage/`;
  if (!site) return data;
  const fix = (x: unknown): unknown => {
    if (Array.isArray(x)) return x.map(fix);
    if (!x || typeof x !== "object") return x;
    const o: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(x)) o[k] = typeof val === "object" ? fix(val) : val;
    if ("cover" in o) {
      const id = (o.videoId ?? o.id) as unknown;
      const cover = o.cover as string | null;
      if (typeof id === "string" && /^\d{6,25}$/.test(id) && !(cover && cover.startsWith(stored))) o.cover = `${site}/cover/${id}`;
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
