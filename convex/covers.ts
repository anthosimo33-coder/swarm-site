"use node";

import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";
import { copyImage } from "./imageCopy";

/** Après un échec (vidéo supprimée, page refusée), on ne réessaie pas avant 6 h. */
const RETRY_MS = 6 * 3_600_000;

/**
 * La miniature d'une vidéo TikTok, copiée chez Swarm à la première demande (/cover/<id>,
 * convex/coverHttp.ts) : déjà rangée → son URL ; sinon lue sur la page publique de la vidéo,
 * réduite et rangée. null si la vidéo n'en donne pas.
 */
export const ensure = internalAction({
  args: { id: v.string(), handle: v.string() },
  handler: async (ctx, { id, handle }): Promise<string | null> => {
    const key = `v:${id}`;
    const known: { url: string | null; missAt: number | null } = await ctx.runQuery(internal.radarStore.mediaGet, { key });
    if (known.url) return known.url;
    if (known.missAt && Date.now() - known.missAt < RETRY_MS) return null;
    const got = await copyImage(ctx, key, `ttpage:${handle}/${id}`);
    if (!got) {
      await ctx.runMutation(internal.radarStore.markMiss, { key });
      return null;
    }
    await ctx.runMutation(internal.radarStore.saveMedia, { items: [got] });
    return got.url;
  },
});
