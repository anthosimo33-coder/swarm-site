"use node";

import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { copyImage, shrink } from "./imageCopy";

/** Après un échec (vidéo supprimée, page refusée), on ne réessaie pas avant 6 h. */
const RETRY_MS = 6 * 3_600_000;

/**
 * La miniature d'une vidéo TikTok ou Instagram, copiée chez Swarm à la première demande (/cover/<id>,
 * convex/coverHttp.ts) : déjà rangée → son URL ; sinon lue sur la page publique de la vidéo,
 * réduite et rangée. null si la vidéo n'en donne pas.
 */
/** La photo de profil d'un compte TikTok, copiée à la première demande (/avatar/<handle>). */
export const ensureAvatar = internalAction({
  args: { handle: v.string() },
  handler: async (ctx, { handle }): Promise<string | null> => {
    const key = `a:${handle}`;
    const known: { url: string | null; missAt: number | null } = await ctx.runQuery(internal.radarStore.mediaGet, { key });
    if (known.url) return known.url;
    if (known.missAt && Date.now() - known.missAt < RETRY_MS) return null;
    const got = await copyImage(ctx, key, `ttavatar:${handle}`);
    if (!got) {
      await ctx.runMutation(internal.radarStore.markMiss, { key });
      return null;
    }
    await ctx.runMutation(internal.radarStore.saveMedia, { items: [got] });
    return got.url;
  },
});

export const ensure = internalAction({
  args: { id: v.string(), handle: v.string() },
  handler: async (ctx, { id, handle }): Promise<string | null> => {
    const key = `v:${id}`;
    const known: { url: string | null; missAt: number | null; heic: Id<"_storage"> | null } = await ctx.runQuery(internal.radarStore.mediaGet, { key });
    if (known.url) return known.url;
    // Copie rangée en HEIC (avant le 13/11) : convertie sur place, sans repasser par TikTok.
    if (known.heic) {
      const blob = await ctx.storage.get(known.heic);
      const small = blob ? await shrink(await blob.arrayBuffer(), "image/heic", key) : null;
      if (small) {
        const storageId = await ctx.storage.store(new Blob([small.data], { type: small.type }));
        const url = await ctx.storage.getUrl(storageId);
        if (url) {
          await ctx.runMutation(internal.radarStore.saveMedia, { items: [{ key, storageId, url }] });
          return url;
        }
      }
    }
    if (known.missAt && Date.now() - known.missAt < RETRY_MS) return null;
    const source = id.startsWith("ig:") ? `igpage:${id.slice(3)}` : `ttpage:${handle}/${id}`;
    const got = await copyImage(ctx, key, source);
    if (!got) {
      await ctx.runMutation(internal.radarStore.markMiss, { key });
      return null;
    }
    await ctx.runMutation(internal.radarStore.saveMedia, { items: [got] });
    return got.url;
  },
});
