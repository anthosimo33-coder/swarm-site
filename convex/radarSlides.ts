"use node";

import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";
import { videoFacts } from "./radarRegions";

/**
 * Les carrousels (diaporamas de photos) parmi les vidéos que Swarm montre : TikTok le dit sur la page publique de la
 * vidéo (`imagePost`), gratuitement — le Radar ne le garde pas sur les vidéos qu'il suit, et son relevé gratuit ne
 * relit jamais une vidéo déjà connue. 14/11 : sur 147 vidéos d'un essai, 14 carrousels, dont 8 que l'IA prenait pour
 * des « extraits repris » (diaporamas de photos d'acteurs, format des apps de drague). 3 essais au plus par vidéo.
 */
const BATCH = 200;
const PARALLEL = 6;
const BUDGET_MS = 240_000;

export const fill = internalAction({
  args: {},
  handler: async (ctx): Promise<{ read: number; slideshows: number }> => {
    const start = Date.now();
    const ids = await ctx.runMutation(internal.radarStore.claimSlides, { limit: BATCH, now: start });
    if (!ids.length) {
      if (await ctx.runQuery(internal.radarStore.slidesNeedSync, { now: start })) await ctx.scheduler.runAfter(0, internal.radarSync.run, {});
      return { read: 0, slideshows: 0 };
    }
    const out: { videoId: string; slideshow: boolean | null; images: number }[] = [];
    let next = 0;
    const worker = async () => {
      while (next < ids.length && Date.now() - start < BUDGET_MS) {
        const videoId = ids[next++];
        const f = await videoFacts(videoId);
        out.push({ videoId, slideshow: f ? f.slideshow : null, images: f?.images ?? 0 });
      }
    };
    await Promise.all(Array.from({ length: PARALLEL }, worker));
    for (let i = 0; i < out.length; i += 200) await ctx.runMutation(internal.radarStore.saveSlides, { items: out.slice(i, i + 200), now: Date.now() });
    const slideshows = out.filter((x) => x.slideshow).length;
    const left = await ctx.runQuery(internal.radarStore.slideLeft, { now: Date.now() });
    // Plus rien à lire et des carrousels trouvés : une synchro les met dans les écrans (au plus une par heure).
    if (!left && slideshows > 0 && (await ctx.runQuery(internal.radarStore.slidesNeedSync, { now: Date.now() }))) {
      await ctx.scheduler.runAfter(0, internal.radarSync.run, {});
    }
    // Il en reste : le lot suivant tout de suite (10 s), sans attendre la tâche planifiée du quart d'heure.
    if (left && out.length === ids.length) await ctx.scheduler.runAfter(10_000, internal.radarSlides.fill, {});
    console.log(`[carrousels] ${out.length} vidéos lues, ${slideshows} carrousels, ${out.filter((x) => x.slideshow === null).length} illisibles, ${left ? "il en reste" : "plus rien à lire"}`);
    return { read: out.length, slideshows };
  },
});
