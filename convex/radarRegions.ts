"use node";

import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";

/**
 * Le pays des comptes que le Radar ne situe pas (14/11 : 33 % des comptes, surtout des anglophones et des
 * francophones) : celui où leurs vidéos ont été créées, que TikTok donne gratuitement sur la page publique d'une
 * vidéo (`locationCreated`) — la même information que le Radar range sur les vidéos qu'il relève. Une vidéo par
 * essai, la suivante à l'essai d'après (3 au plus). La synchro de nuit les reprend dans le marché de chaque compte.
 */
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15";
const BATCH = 150;
const PARALLEL = 6;
const BUDGET_MS = 240_000;

/** Le pays de création d'une vidéo TikTok, lu sur sa page publique ; null si la page ne le donne pas. */
export async function videoCountry(id: string): Promise<string | null> {
  try {
    const res = await fetch(`https://www.tiktok.com/@tiktok/video/${id}`, {
      headers: { "User-Agent": UA, "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8" }, signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    const m = html.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)<\/script>/);
    if (!m) return null;
    const item = JSON.parse(m[1])?.__DEFAULT_SCOPE__?.["webapp.video-detail"]?.itemInfo?.itemStruct;
    const c = String(item?.locationCreated ?? "").toUpperCase();
    return /^[A-Z]{2}$/.test(c) ? c : null;
  } catch {
    return null;
  }
}

export const fill = internalAction({
  args: {},
  handler: async (ctx): Promise<{ read: number; found: number }> => {
    const start = Date.now();
    const batch = await ctx.runMutation(internal.radarStore.claimRegions, { limit: BATCH, now: start });
    if (!batch.length) {
      // Rien à lire : des pays lus depuis la dernière synchro réussie (la relance d'après lecture a pu être refusée
      // parce qu'une synchro tournait) ? Une synchro les met dans les écrans — au plus une par heure.
      if (await ctx.runQuery(internal.radarStore.regionsNeedSync, { now: start })) await ctx.scheduler.runAfter(0, internal.radarSync.run, {});
      return { read: 0, found: 0 };
    }
    const out: { handle: string; country: string | null }[] = [];
    let next = 0;
    const worker = async () => {
      while (next < batch.length && Date.now() - start < BUDGET_MS) {
        const r = batch[next++];
        out.push({ handle: r.handle, country: await videoCountry(r.ids[r.tries % r.ids.length]) });
      }
    };
    await Promise.all(Array.from({ length: PARALLEL }, worker));
    await ctx.runMutation(internal.radarStore.saveRegions, { items: out, now: Date.now() });
    const found = out.filter((x) => x.country).length;
    // Plus rien à lire maintenant, et des pays trouvés : une synchro les met tout de suite dans les écrans.
    const left = await ctx.runQuery(internal.radarStore.regionBatch, { limit: 1, now: Date.now() });
    if (found > 0 && left.length === 0) await ctx.scheduler.runAfter(0, internal.radarSync.run, {});
    // Il en reste : le lot suivant tout de suite (10 s), sans attendre la tâche planifiée du quart d'heure.
    if (left.length > 0 && out.length === batch.length) await ctx.scheduler.runAfter(10_000, internal.radarRegions.fill, {});
    console.log(`[pays] ${out.length} comptes lus, ${found} situés, ${left.length ? "il en reste" : "plus rien à lire"}`);
    return { read: out.length, found };
  },
});
