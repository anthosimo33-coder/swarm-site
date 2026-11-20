"use node";

import { internal } from "./_generated/api";
import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { videoFactsState } from "./radarRegions";
import { backgroundOff, TIKTOK_LEASE } from "./background";

/**
 * Les carrousels (diaporamas de photos) parmi les vidéos que Swarm montre : TikTok le dit sur la page publique de la
 * vidéo (`imagePost`), gratuitement — le Radar ne le garde pas sur les vidéos qu'il suit, et son relevé gratuit ne
 * relit jamais une vidéo déjà connue. 14/11 : sur 147 vidéos d'un essai, 14 carrousels, dont 8 que l'IA prenait pour
 * des « extraits repris » (diaporamas de photos d'acteurs, format des apps de drague). 3 essais au plus par vidéo.
 */
const BATCH = 200;
// 2 pages TikTok à la fois, comme la lecture IA (16/11 : à 6, des vagues de refus passagers de TikTok).
const PARALLEL = 2;
const BUDGET_MS = 240_000;

export const fill = internalAction({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, args): Promise<{ read: number; slideshows: number }> => {
    const start = Date.now();
    if (backgroundOff()) return { read: 0, slideshows: 0 };
    // Une seule chaîne de lecture de pages TikTok à la fois (bail commun avec la copie des miniatures et les pays,
    // audit F24), et rien pendant une synchro (convex/radarStore.ts, takeLease).
    const token = args.token ?? Math.random().toString(36).slice(2);
    if (!(await ctx.runMutation(internal.radarStore.takeLease, { name: TIKTOK_LEASE, token, ms: 6 * 60_000, now: start }))) return { read: 0, slideshows: 0 };
    const ids = await ctx.runMutation(internal.radarStore.claimSlides, { limit: BATCH, now: start });
    if (!ids.length) {
      await ctx.runMutation(internal.radarStore.dropLease, { name: TIKTOK_LEASE, token });
      return { read: 0, slideshows: 0 };
    }
    // Sans réponse de TikTok : reprise sans compter d'essai ; disparue : abandonnée ; illisible : un essai.
    const out: { videoId: string; slideshow: boolean | null; images: number; retry?: boolean; gone?: boolean }[] = [];
    let next = 0;
    const worker = async () => {
      while (next < ids.length && Date.now() - start < BUDGET_MS) {
        const videoId = ids[next++];
        const f = await videoFactsState(videoId);
        out.push(f.facts ? { videoId, slideshow: f.facts.slideshow, images: f.facts.images }
          : { videoId, slideshow: null, images: 0, ...(f.gone ? { gone: true } : f.unread ? {} : { retry: true }) });
      }
    };
    await Promise.all(Array.from({ length: PARALLEL }, worker));
    for (let i = 0; i < out.length; i += 200) await ctx.runMutation(internal.radarStore.saveSlides, { items: out.slice(i, i + 200), now: Date.now() });
    const slideshows = out.filter((x) => x.slideshow).length;
    const left = await ctx.runQuery(internal.radarStore.slideLeft, { now: Date.now() });
    // Les carrousels trouvés entrent dans les écrans à la synchro de nuit (plus de synchro relancée d'ici : 20/11).
    // Il en reste : le lot suivant tout de suite (10 s), sans attendre la tâche planifiée du quart d'heure.
    if (left && out.length === ids.length) await ctx.scheduler.runAfter(10_000, internal.radarSlides.fill, { token });
    else await ctx.runMutation(internal.radarStore.dropLease, { name: TIKTOK_LEASE, token });
    const failed = out.filter((x) => x.slideshow === null);
    const quiet = failed.filter((x) => x.retry).length, gone = failed.filter((x) => x.gone).length;
    console.log(`[carrousels] ${out.length} vidéos lues, ${slideshows} carrousels, ${failed.length} échecs (${quiet} sans réponse, ${gone} disparues, ${failed.length - quiet - gone} illisibles), ${left ? "il en reste" : "plus rien à lire"}`);
    return { read: out.length, slideshows };
  },
});
