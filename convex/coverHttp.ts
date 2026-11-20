/*
 * GET /cover/<id de vidéo TikTok ou ig:<code>>?v=…&s=… — la miniature d'une vidéo du Radar, toujours servie par Kopycat :
 * la copie rangée (redirection immédiate), sinon copiée à la première vue (1 à 2 s), puis rangée.
 * GET /avatar/<handle>?v=…&s=… — la photo de profil d'un compte suivi, de la même façon.
 *
 * Audit S5 et S15 (19/11). Seules les adresses signées par boards.get (convex/coverSign.ts) sont servies : sans compte,
 * on ne peut ni lancer une copie (action Node + lecture TikTok), ni savoir quels comptes et quelles vidéos le Radar
 * suit. Tout refus (sans signature, signature fausse, adresse mal formée, inconnu, introuvable, en pause après un échec)
 * est la même réponse : 404, même Cache-Control. Pendant la pause qui suit un échec noté (mediaMiss), aucune action
 * Node n'est lancée.
 */
import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";
import { avatarSigned, coverSigned, COVER_ID, HANDLE, MEDIA_RETRY_MS } from "./coverSign";

const refused = () => new Response(null, { status: 404, headers: { "Cache-Control": "public, max-age=300" } });
const redirect = (url: string) => new Response(null, { status: 302, headers: { Location: url, "Cache-Control": "public, max-age=86400" } });

/** Le dernier segment du chemin (décodé) et les paramètres de signature ; null si l'adresse est mal formée. */
function parse(request: Request): { value: string; v: string | null; s: string | null } | null {
  try {
    const url = new URL(request.url);
    return { value: decodeURIComponent(url.pathname.split("/").pop() ?? ""), v: url.searchParams.get("v"), s: url.searchParams.get("s") };
  } catch {
    return null; // % mal formé : un refus, pas une erreur 500 au journal
  }
}
/** Un échec noté il y a moins de MEDIA_RETRY_MS (covers.ts ne réessaierait pas) : rien à lancer. */
const paused = (missAt: number | null) => !!missAt && Date.now() - missAt < MEDIA_RETRY_MS;

export const avatar = httpAction(async (ctx, request) => {
  const p = parse(request);
  if (!p || !HANDLE.test(p.value) || !avatarSigned(p.value, p.v, p.s)) return refused();
  const handle = p.value;
  const found: { known: boolean; url: string | null } = await ctx.runQuery(internal.radarStore.avatarLookup, { handle });
  if (found.url) return redirect(found.url);
  if (!found.known) return refused();
  const media: { url: string | null; missAt: number | null } = await ctx.runQuery(internal.radarStore.mediaGet, { key: `a:${handle}` });
  if (media.url) return redirect(media.url);
  if (paused(media.missAt)) return refused();
  const url = (await ctx.runAction(internal.covers.ensureAvatar, { handle })).url;
  return url ? redirect(url) : refused();
});

export const cover = httpAction(async (ctx, request) => {
  const p = parse(request);
  if (!p || !COVER_ID.test(p.value) || !coverSigned(p.value, p.v, p.s)) return refused();
  const id = p.value;
  const found: { handle: string | null; url: string | null } = await ctx.runQuery(internal.radarStore.coverLookup, { id });
  if (found.url) return redirect(found.url);
  if (found.handle === null) return refused();
  // Copie rangée en HEIC : convertie par covers.ensure, même pendant une pause.
  const media: { url: string | null; missAt: number | null; heic: unknown } = await ctx.runQuery(internal.radarStore.mediaGet, { key: `v:${id}` });
  if (!media.heic && paused(media.missAt)) return refused();
  const url = (await ctx.runAction(internal.covers.ensure, { id, handle: found.handle })).url;
  return url ? redirect(url) : refused();
});
