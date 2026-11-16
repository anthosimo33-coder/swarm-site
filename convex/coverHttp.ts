import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";

/**
 * GET /cover/<id de vidéo TikTok ou ig:<code>> — la miniature d'une vidéo du Radar, toujours servie par Swarm :
 * la copie rangée (redirection immédiate), sinon copiée à la première vue (1 à 2 s), puis rangée.
 * Seules les vidéos qui ont une page dans l'app sont servies (pas de copie à la demande d'un inconnu).
 */
/** Id d'une vidéo TikTok (chiffres) ou Instagram (« ig: » + code du reel). */
export const COVER_ID = /^(\d{6,25}|ig:[A-Za-z0-9_-]{5,40})$/;

/**
 * GET /avatar/<handle> — la photo de profil d'un compte suivi : la copie rangée, sinon copiée à la
 * première vue. Seuls les comptes que l'app connaît (fiche créateur, ou photo déjà rangée).
 */
export const avatar = httpAction(async (ctx, request) => {
  const handle = decodeURIComponent(new URL(request.url).pathname.split("/").pop() ?? "");
  const missing = (maxAge: number) => new Response(null, { status: 404, headers: { "Cache-Control": `public, max-age=${maxAge}` } });
  if (!/^[A-Za-z0-9._]{2,30}$/.test(handle)) return missing(86_400);
  const found: { known: boolean; url: string | null } = await ctx.runQuery(internal.radarStore.avatarLookup, { handle });
  let url = found.url;
  if (!url) {
    if (!found.known) return missing(3_600);
    url = await ctx.runAction(internal.covers.ensureAvatar, { handle });
  }
  if (!url) return missing(3_600);
  return new Response(null, { status: 302, headers: { Location: url, "Cache-Control": "public, max-age=86400" } });
});

export const cover = httpAction(async (ctx, request) => {
  const id = decodeURIComponent(new URL(request.url).pathname.split("/").pop() ?? "");
  const missing = (maxAge: number) => new Response(null, { status: 404, headers: { "Cache-Control": `public, max-age=${maxAge}` } });
  if (!COVER_ID.test(id)) return missing(86_400);
  const found: { handle: string | null; url: string | null } = await ctx.runQuery(internal.radarStore.coverLookup, { id });
  let url = found.url;
  if (!url) {
    if (found.handle === null) return missing(86_400);
    url = (await ctx.runAction(internal.covers.ensure, { id, handle: found.handle })).url;
  }
  if (!url) return missing(300); // vidéo privée ou supprimée : le navigateur peut redemander bientôt
  return new Response(null, { status: 302, headers: { Location: url, "Cache-Control": "public, max-age=86400" } });
});
