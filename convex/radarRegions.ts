"use node";

import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";
import { backgroundOff, TIKTOK_LEASE } from "./background";
import { tiktokPage, videoPageUrl } from "./tiktokPage";

/**
 * Le pays des comptes que le Radar ne situe pas (14/11 : 33 % des comptes, surtout des anglophones et des
 * francophones) : celui où leurs vidéos ont été créées, que TikTok donne gratuitement sur la page publique d'une
 * vidéo (`locationCreated`) — la même information que le Radar range sur les vidéos qu'il relève. Une vidéo par
 * essai, la suivante à l'essai d'après (3 au plus). La synchro de nuit les reprend dans le marché de chaque compte.
 */
const BATCH = 150;
// 2 pages TikTok à la fois, comme la lecture IA et les carrousels (16/11 : à 6, des vagues de refus passagers).
const PARALLEL = 2;
const BUDGET_MS = 240_000;

type Facts = { country: string | null; slideshow: boolean; images: number };
/**
 * Ce que la page publique d'une vidéo TikTok dit d'elle (`facts`) : son pays de création, et si c'est un carrousel
 * (diaporama de photos, `imagePost`) avec son nombre de photos. Sinon la raison de l'échec (16/11 : 260 carrousels
 * ratés en une heure, refus passagers de TikTok comptés comme des essais) : `gone`, TikTok dit que la vidéo n'existe
 * pas ou plus ; `unread`, la page répond mais sans la vidéo lisible ; rien, pas de réponse (refus, délai, page vide).
 */
export async function videoFactsState(id: string): Promise<{ facts?: Facts; gone?: boolean; unread?: boolean }> {
  const page = await tiktokPage(videoPageUrl(id), "webapp.video-detail");
  if (page.gone) return { gone: true };
  const item = page.detail?.itemInfo?.itemStruct;
  if (!item?.id) return page.detail ? { unread: true } : {};
  const c = String(item.locationCreated ?? "").toUpperCase();
  const images = Array.isArray(item.imagePost?.images) ? item.imagePost.images.length : 0;
  return { facts: { country: /^[A-Z]{2}$/.test(c) ? c : null, slideshow: !!item.imagePost, images } };
}

export const fill = internalAction({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, args): Promise<{ read: number; found: number }> => {
    const start = Date.now();
    if (backgroundOff()) return { read: 0, found: 0 };
    // Une seule chaîne de lecture de pages TikTok à la fois, et rien pendant une synchro (audit F24 : la lecture des pays
    // n'avait pas de bail, tournait pendant les synchros, et la tâche du quart d'heure pouvait en empiler une autre).
    const token = args.token ?? Math.random().toString(36).slice(2);
    if (!(await ctx.runMutation(internal.radarStore.takeLease, { name: TIKTOK_LEASE, token, ms: 6 * 60_000, now: start }))) return { read: 0, found: 0 };
    const batch = await ctx.runMutation(internal.radarStore.claimRegions, { limit: BATCH, now: start });
    // Les pays lus entrent dans les écrans à la synchro de nuit (plus de synchro relancée d'ici : 20/11).
    if (!batch.length) {
      await ctx.runMutation(internal.radarStore.dropLease, { name: TIKTOK_LEASE, token });
      return { read: 0, found: 0 };
    }
    // Un essai par vidéo, la suivante à l'essai d'après : une vidéo disparue, sans pays ou illisible compte un essai ;
    // sans réponse de TikTok, la même vidéo est reprise sans compter d'essai (16/11 : refus passagers comptés).
    const out: { handle: string; country: string | null; retry?: boolean; why?: string }[] = [];
    let next = 0;
    const worker = async () => {
      while (next < batch.length && Date.now() - start < BUDGET_MS) {
        const r = batch[next++];
        const f = await videoFactsState(r.ids[r.tries % r.ids.length]);
        out.push(f.facts?.country ? { handle: r.handle, country: f.facts.country }
          : { handle: r.handle, country: null, ...(f.facts ? { why: "sans pays" } : f.gone ? { why: "vidéo disparue" } : f.unread ? { why: "illisible" } : { retry: true, why: "sans réponse" }) });
      }
    };
    await Promise.all(Array.from({ length: PARALLEL }, worker));
    await ctx.runMutation(internal.radarStore.saveRegions, { items: out.map(({ why: _w, ...x }) => x), now: Date.now() });
    const found = out.filter((x) => x.country).length;
    const left = await ctx.runQuery(internal.radarStore.regionBatch, { limit: 1, now: Date.now() });
    // Il en reste : le lot suivant tout de suite (10 s), sans attendre la tâche planifiée du quart d'heure.
    if (left.length > 0 && out.length === batch.length) await ctx.scheduler.runAfter(10_000, internal.radarRegions.fill, { token });
    else await ctx.runMutation(internal.radarStore.dropLease, { name: TIKTOK_LEASE, token });
    const whys = Object.entries(out.reduce((n, x) => (x.why ? { ...n, [x.why]: (n[x.why] ?? 0) + 1 } : n), {} as Record<string, number>)).map(([k, n]) => `${n} ${k}`).join(", ");
    console.log(`[pays] ${out.length} comptes lus, ${found} situés${whys ? ` (échecs : ${whys})` : ""}, ${left.length ? "il en reste" : "plus rien à lire"}`);
    return { read: out.length, found };
  },
});
