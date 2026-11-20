"use node";

import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { MEDIA_RETRY_MS as RETRY_MS } from "./coverSign";
import { copyImage, shrink } from "./imageCopy";

// Après un échec (vidéo supprimée, page refusée), on ne réessaie pas avant 6 h (MEDIA_RETRY_MS, convex/coverSign.ts) :
// /cover et /avatar (convex/coverHttp.ts) ne lancent même pas cette action pendant la pause.

/**
 * La miniature d'une vidéo TikTok ou Instagram, copiée chez Swarm à la première demande (/cover/<id>,
 * convex/coverHttp.ts) : déjà rangée → son URL ; sinon lue sur la page publique de la vidéo,
 * réduite et rangée. null si la vidéo n'en donne pas.
 */
/** La photo de profil d'un compte TikTok, copiée à la première demande (/avatar/<handle>). */
export const ensureAvatar = internalAction({
  args: { handle: v.string() },
  handler: async (ctx, { handle }): Promise<{ url: string | null; gone: boolean; blank?: boolean }> => {
    const key = `a:${handle}`;
    const known: { url: string | null; missAt: number | null } = await ctx.runQuery(internal.radarStore.mediaGet, { key });
    if (known.url) return { url: known.url, gone: false };
    if (known.missAt && Date.now() - known.missAt < RETRY_MS) return { url: null, gone: false, blank: true };
    const report: { gone: boolean; blank?: boolean } = { gone: false };
    const got = await copyImage(ctx, key, `ttavatar:${handle}`, report);
    if (!got) {
      // « Introuvable » seulement si TikTok le dit (compte disparu, ou sans photo) : pas sur un refus passager (16/11).
      if (report.gone || report.blank) await ctx.runMutation(internal.radarStore.markMiss, { key });
      return { url: null, gone: report.gone, blank: !!report.blank };
    }
    // L'adresse retenue : celle d'une copie faite en même temps et déjà rangée, s'il y en a une (audit Q61).
    const [kept]: { key: string; url: string }[] = await ctx.runMutation(internal.radarStore.saveMedia, { items: [got] });
    return { url: kept?.url ?? got.url, gone: false };
  },
});

export const ensure = internalAction({
  args: { id: v.string(), handle: v.string() },
  handler: async (ctx, { id, handle }): Promise<{ url: string | null; gone: boolean; blank?: boolean }> => {
    const key = `v:${id}`;
    const known: { url: string | null; missAt: number | null; heic: Id<"_storage"> | null } = await ctx.runQuery(internal.radarStore.mediaGet, { key });
    if (known.url) return { url: known.url, gone: false };
    // Copie rangée en HEIC (avant le 13/11) : convertie sur place, sans repasser par TikTok.
    if (known.heic) {
      const blob = await ctx.storage.get(known.heic);
      const small = blob ? await shrink(await blob.arrayBuffer(), "image/heic", key) : null;
      if (small) {
        const storageId = await ctx.storage.store(new Blob([small.data], { type: small.type }));
        const url = await ctx.storage.getUrl(storageId);
        if (url) {
          const [kept]: { key: string; url: string }[] = await ctx.runMutation(internal.radarStore.saveMedia, { items: [{ key, storageId, url }] });
          return { url: kept?.url ?? url, gone: false };
        }
      }
    }
    // Échec récent (TikTok a dit « disparue » ou « sans miniature ») : pas de nouvel essai avant 6 h ; rendu comme « sans
    // miniature » (un essai pour la lecture IA, qui abandonne au 3e) plutôt que « disparue » (abandon d'emblée).
    if (known.missAt && Date.now() - known.missAt < RETRY_MS) return { url: null, gone: false, blank: true };
    const source = id.startsWith("ig:") ? `igpage:${id.slice(3)}` : `ttpage:${handle}/${id}`;
    const report: { gone: boolean; blank?: boolean } = { gone: false };
    const got = await copyImage(ctx, key, source, report);
    if (!got) {
      // « Introuvable » (6 h sans réessai, vidéo cachée des listes et de sa page) seulement si TikTok le dit : vidéo
      // disparue, ou sans miniature ; un refus passager ne laisse pas de trace (16/11 : il cachait des vidéos bien
      // vivantes). Instagram : comme avant.
      const gone = report.gone || source.startsWith("igpage:");
      if (gone || report.blank) await ctx.runMutation(internal.radarStore.markMiss, { key });
      return { url: null, gone, blank: !!report.blank };
    }
    const [kept]: { key: string; url: string }[] = await ctx.runMutation(internal.radarStore.saveMedia, { items: [got] });
    return { url: kept?.url ?? got.url, gone: false };
  },
});
