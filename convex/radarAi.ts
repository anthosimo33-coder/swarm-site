"use node";

import Anthropic from "@anthropic-ai/sdk";
import { jsonSchemaOutputFormat } from "@anthropic-ai/sdk/helpers/json-schema";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { internalAction, type ActionCtx } from "./_generated/server";

/**
 * Lecture des images par Claude Haiku 5.5 (clé ANTHROPIC_API_KEY, recopiée de celle du Radar, jamais affichée).
 *
 * 1. Chaque vidéo montrée : son TYPE de contenu et le TEXTE incrusté à l'écran, lus sur sa miniature. Le Radar n'a pas
 *    le texte des montages (CapCut) — 14/11, « Study for your biology exam 2x faster » de @ivylearns8 — et coupe les
 *    longs. Le carrousel, lui, vient de TikTok (convex/radarSlides.ts) et prime sur le type lu ici.
 * 2. Chaque compte surtout « ambassadeur » : le genre apparent de la personne qui se filme (photo de profil + 3
 *    miniatures). Les autres comptes sont « sans visage », sans appel.
 *
 * Essai du 14/11 sur 50 comptes : ~95 % des types justes à l'œil, une fois la catégorie « extrait repris » ajoutée
 * (sans elle, les comptes de clips de séries passaient « ambassadeur » et prenaient le genre de l'acteur).
 * SWARM_KINDS_LIMIT (dev) plafonne le nombre de lectures.
 */
const MODEL = "claude-haiku-5-5";
const PRICE_IN = 0.1 / 1e6, PRICE_OUT = 0.5 / 1e6;
const PARALLEL = 6;
const BUDGET_MS = 240_000;
export const TYPES = ["ambassadeur", "extrait_repris", "histoire_messages", "demo_ecran", "motion", "ambiance_texte", "autre"] as const;

const TYPE_RULES = `- ambassadeur : la personne qui tient le compte se filme elle-même (face caméra, parle, réagit, vlog, se montre en train d'utiliser l'app), même avec du texte par-dessus. Image de qualité téléphone, cadrage selfie ou filmé de près.
- extrait_repris : un extrait de film, de série, de drama, d'émission, de match ou une célébrité connue (acteur, rappeur, sportif), repris par le compte et non filmé par lui, généralement avec une phrase par-dessus.
- histoire_messages : des bulles de conversation (SMS, WhatsApp, iMessage, DM, interface de chat) sont visibles et sont l'élément principal, souvent sur fond de jeu vidéo ou de décor. Un simple texte posé sur une image n'en est pas une.
- demo_ecran : une capture ou un enregistrement de l'écran d'une app ou d'un site (interface visible), qui n'est pas une conversation.
- motion : animation, motion design, illustration ou 3D, personnage ou avatar généré, texte animé sur fond graphique.
- ambiance_texte : image ou vidéo d'ambiance (paysage, objet, mains, plan de coupe, photo d'illustration, photo floue d'une personne) avec un texte qui domine, sans personne qui s'adresse à la caméra.
- autre : rien de tout ça (photo de produit, image vide ou noire…).`;

const VIDEO_SYSTEM = `Tu reçois la miniature (première image) d'une vidéo TikTok ou Instagram qui fait la promotion d'une application.
1. type : son type de contenu.
${TYPE_RULES}
2. text : le texte incrusté dans l'image (titre, sous-titres, phrases posées sur la vidéo, messages d'une conversation), recopié EXACTEMENT, dans sa langue, sans traduire ni corriger, émojis compris ; une ligne de texte par ligne. Ignore l'interface de TikTok ou d'Instagram (boutons, pseudo, compteurs, durée) et les mots isolés d'un décor. Chaîne vide s'il n'y a pas de texte.`;

const GENDER_SYSTEM = `Ces images viennent d'un compte TikTok qui fait la promotion d'une application : sa photo de profil puis des miniatures de ses vidéos ou de ses carrousels de photos.
gender : la personne qui incarne ce compte, c'est-à-dire celle qui se montre elle-même (se filme, ou pose sur ses propres photos, selfies compris), souvent la même que sur la photo de profil.
- femme ou homme : son genre apparent, si on la voit clairement ;
- sans_visage : personne n'incarne le compte (pas de personne, ou seulement des célébrités, des personnages, des images reprises, des mains) ;
- incertain : plusieurs personnes différentes, ou impossible à dire.
Ne te fonde jamais sur un pseudo seul.`;

const videoSchema = {
  type: "object", additionalProperties: false, required: ["type", "text"],
  properties: { type: { type: "string", enum: [...TYPES] }, text: { type: "string" } },
} as const;
const genderSchema = {
  type: "object", additionalProperties: false, required: ["gender"],
  properties: { gender: { type: "string", enum: ["femme", "homme", "sans_visage", "incertain"] } },
} as const;

type Img = { type: "image"; source: { type: "base64"; media_type: "image/jpeg" | "image/png" | "image/webp" | "image/gif"; data: string } };

/** Une image servie par Swarm (miniature rangée, ou lue sur la page publique), en base64 ; null si absente. */
async function image(url: string): Promise<Img | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
    const type = (res.headers.get("content-type") ?? "").split(";")[0].trim();
    if (!res.ok || !/^image\/(jpeg|png|webp|gif)$/.test(type)) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 500) return null;
    return { type: "image", source: { type: "base64", media_type: type as Img["source"]["media_type"], data: buf.toString("base64") } };
  } catch {
    return null;
  }
}

const limit = () => { const n = Number(process.env.SWARM_KINDS_LIMIT); return Number.isFinite(n) && n > 0 ? n : null; };

/** Lance `work` sur chaque élément, PARALLEL à la fois, sans dépasser le budget de temps. */
async function pool<T, R>(items: T[], start: number, work: (x: T) => Promise<R>): Promise<R[]> {
  const out: R[] = [];
  let next = 0;
  await Promise.all(Array.from({ length: PARALLEL }, async () => {
    while (next < items.length && Date.now() - start < BUDGET_MS) out.push(await work(items[next++]));
  }));
  return out;
}

const LEASE_MS = 6 * 60_000;
/**
 * Lectures de pages TikTok à la fois, pour les miniatures pas encore rangées. 16/11 : 6 à la fois, ~900 en 6 min depuis les
 * serveurs de Convex, et TikTok ne répondait plus à la moitié du dernier lot (vidéos pourtant vivantes, lues une à une).
 */
const TIKTOK_AT_ONCE = 2;

/** Un goulot : au plus TIKTOK_AT_ONCE lectures de pages TikTok à la fois, pour une action. */
function pacer() {
  let busy = 0;
  const waiting: (() => void)[] = [];
  return async <T,>(f: () => Promise<T>): Promise<T> => {
    while (busy >= TIKTOK_AT_ONCE) await new Promise<void>((r) => waiting.push(r));
    busy++;
    try { return await f(); } finally { busy--; waiting.shift()?.(); }
  };
}
type Slot = ReturnType<typeof pacer>;
/**
 * Une image pour la lecture IA (miniature ou photo de profil) : rangée chez Swarm, sinon lue chez TikTok par le goulot.
 * Sans image, la raison : « disparue » (TikTok le dit : abandon), « sans réponse » (refus passager : reprise sans compter
 * d'essai), « sans miniature » / « sans photo », « image illisible » (un essai). Sans page chez Swarm (ni miniature
 * rangée) : la vidéo ou le compte n'est plus montré (sa page est partie au ménage d'une synchro), sa lecture est retirée
 * de la file — 16/11 : 93 « inconnue » sur un lot de 98, comptées comme des échecs ; la synchro la remet si elle revient.
 */
type Fetched = { img: Img | null; why?: string; retry?: boolean; gone?: boolean; unshown?: boolean };
async function coverFor(ctx: ActionCtx, slot: Slot, videoId: string): Promise<Fetched> {
  const found: { url: string | null; handle: string | null } = await ctx.runQuery(internal.radarStore.coverLookup, { id: videoId });
  let url = found.url;
  if (!url && found.handle) {
    const handle = found.handle;
    const r: { url: string | null; gone: boolean; blank?: boolean } = await slot(() => ctx.runAction(internal.covers.ensure, { id: videoId, handle }));
    url = r.url;
    if (!url) return r.gone ? { img: null, gone: true, why: "disparue" } : r.blank ? { img: null, why: "sans miniature chez TikTok" } : { img: null, retry: true, why: "sans réponse" };
  }
  if (!url) return { img: null, unshown: true };
  const img = await image(url);
  return img ? { img } : { img: null, why: "image illisible" }; // rangée mais vide ou minuscule : réessayer n'y change rien
}
async function avatarFor(ctx: ActionCtx, slot: Slot, handle: string): Promise<Fetched> {
  const found: { known: boolean; url: string | null } = await ctx.runQuery(internal.radarStore.avatarLookup, { handle });
  let url = found.url;
  if (!url) {
    if (!found.known) return { img: null, unshown: true };
    const r: { url: string | null; gone: boolean; blank?: boolean } = await slot(() => ctx.runAction(internal.covers.ensureAvatar, { handle }));
    url = r.url;
    if (!url) return r.gone ? { img: null, gone: true, why: "compte disparu" } : r.blank ? { img: null, why: "sans photo" } : { img: null, retry: true, why: "sans réponse" };
  }
  const img = await image(url);
  return img ? { img } : { img: null, why: "image illisible" };
}
/** Réponse coupée par la limite de jetons : le JSON structuré ne se lit plus (« Unterminated string in JSON »). */
const cut = (e: unknown) => e instanceof Error && /structured output/i.test(e.message);
const tally = (whys: (string | undefined)[]) =>
  Object.entries(whys.reduce((n, w) => (w ? { ...n, [w]: (n[w] ?? 0) + 1 } : n), {} as Record<string, number>)).map(([k, n]) => `${n} ${k}`).join(", ");
const newToken = () => Math.random().toString(36).slice(2);

export const fillVideos = internalAction({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, args): Promise<{ read: number; cost: number }> => {
    const start = Date.now();
    const site = process.env.CONVEX_SITE_URL;
    if (!process.env.ANTHROPIC_API_KEY || !site) return { read: 0, cost: 0 };
    // Une seule chaîne à la fois, et rien pendant une synchro.
    const token = args.token ?? newToken();
    if (!(await ctx.runMutation(internal.radarStore.takeLease, { name: "ai-videos", token, ms: LEASE_MS, now: start }))) return { read: 0, cost: 0 };
    const ids = await ctx.runMutation(internal.radarStore.claimVideoAi, { limit: 150, now: start, max: limit() });
    if (!ids.length) {
      await ctx.runMutation(internal.radarStore.dropLease, { name: "ai-videos", token });
      if (await ctx.runQuery(internal.radarStore.aiNeedSync, { now: start })) await ctx.scheduler.runAfter(0, internal.radarSync.run, {});
      return { read: 0, cost: 0 };
    }
    const client = new Anthropic();
    let tin = 0, tout = 0;
    const slot = pacer();
    type Out = { videoId: string; ok: boolean; type?: string; text?: string; retry?: boolean; gone?: boolean; unshown?: boolean; why?: string };
    const out: Out[] = await pool(ids, start, async (videoId): Promise<Out> => {
      const { img, why, retry, gone, unshown } = await coverFor(ctx, slot, videoId);
      if (!img) return { videoId, ok: false, why, retry, gone, unshown };
      try {
        // 4 000 jetons : un long texte à l'écran en écriture non latine dépassait 1 500 (16/11, JSON coupé) ;
        // on ne paie que les jetons écrits.
        const r = await client.messages.parse({
          model: MODEL, max_tokens: 4000, system: VIDEO_SYSTEM,
          output_config: { effort: "low", format: jsonSchemaOutputFormat(videoSchema) },
          messages: [{ role: "user", content: [img, { type: "text", text: "Miniature de la vidéo." }] }],
        });
        tin += r.usage.input_tokens; tout += r.usage.output_tokens;
        const p = r.parsed_output;
        if (r.stop_reason !== "end_turn" || !p) return { videoId, ok: false, why: `réponse ${r.stop_reason}` };
        return { videoId, ok: true, type: p.type, text: Array.from(p.text.trim()).slice(0, 1500).join("") };
      } catch (e) {
        console.error(`[ia vidéos] ${videoId} : ${e instanceof Error ? e.message : String(e)}`);
        return { videoId, ok: false, why: cut(e) ? "réponse coupée" : "erreur" };
      }
    });
    const whys = tally(out.map((x) => x.why));
    const unshown = out.filter((x) => x.unshown).length;
    for (let i = 0; i < out.length; i += 100) await ctx.runMutation(internal.radarStore.saveVideoAi, { items: out.slice(i, i + 100).map(({ why: _w, ...x }) => x), now: Date.now() });
    const cost = tin * PRICE_IN + tout * PRICE_OUT;
    const left = await ctx.runQuery(internal.radarStore.aiLeft, { table: "videoAi", now: Date.now() });
    const capped = limit() !== null && out.length < ids.length;
    if (left && !capped && out.length === ids.length) await ctx.scheduler.runAfter(5_000, internal.radarAi.fillVideos, { token });
    else {
      await ctx.runMutation(internal.radarStore.dropLease, { name: "ai-videos", token });
      if (await ctx.runQuery(internal.radarStore.aiNeedSync, { now: Date.now() })) await ctx.scheduler.runAfter(0, internal.radarSync.run, {});
    }
    console.log(`[ia vidéos] ${out.length} lues, ${out.filter((x) => x.ok).length} réussies${unshown ? `, ${unshown} retirées (plus montrées)` : ""}${whys ? ` (échecs : ${whys})` : ""}, ${tin}+${tout} tokens, ${cost.toFixed(4)} $, ${left ? "il en reste" : "plus rien à lire"}`);
    return { read: out.length, cost };
  },
});

export const fillGender = internalAction({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, args): Promise<{ read: number; cost: number }> => {
    const start = Date.now();
    const site = process.env.CONVEX_SITE_URL;
    if (!process.env.ANTHROPIC_API_KEY || !site) return { read: 0, cost: 0 };
    const token = args.token ?? newToken();
    if (!(await ctx.runMutation(internal.radarStore.takeLease, { name: "ai-gender", token, ms: LEASE_MS, now: start }))) return { read: 0, cost: 0 };
    const rows = await ctx.runMutation(internal.radarStore.claimGender, { limit: 100, now: start, max: limit() });
    if (!rows.length) { await ctx.runMutation(internal.radarStore.dropLease, { name: "ai-gender", token }); return { read: 0, cost: 0 }; }
    const client = new Anthropic();
    let tin = 0, tout = 0;
    // Photo de profil et 3 miniatures, par le goulot (16/11 : 6 comptes × 4 images à la fois, par /avatar et /cover).
    // Sans aucune image : reprise sans essai si TikTok n'a pas répondu, abandon si le compte a disparu, un essai sinon.
    const slot = pacer();
    type Out = { handle: string; ok: boolean; gender?: string; retry?: boolean; gone?: boolean; unshown?: boolean; why?: string };
    const out: Out[] = await pool(rows, start, async ({ handle, ids }): Promise<Out> => {
      const got = await Promise.all([avatarFor(ctx, slot, handle), ...ids.slice(0, 3).map((id) => coverFor(ctx, slot, id))]);
      const imgs = got.map((g) => g.img).filter((x): x is Img => x !== null);
      if (!imgs.length) {
        if (got[0].gone) return { handle, ok: false, gone: true, why: "compte disparu" };
        if (got.every((g) => g.unshown)) return { handle, ok: false, unshown: true };
        if (got.some((g) => g.retry)) return { handle, ok: false, retry: true, why: "sans réponse" };
        return { handle, ok: false, why: "aucune image" };
      }
      try {
        const r = await client.messages.parse({
          model: MODEL, max_tokens: 800, system: GENDER_SYSTEM,
          output_config: { effort: "low", format: jsonSchemaOutputFormat(genderSchema) },
          messages: [{ role: "user", content: [...imgs, { type: "text", text: `Compte @${handle}.` }] }],
        });
        tin += r.usage.input_tokens; tout += r.usage.output_tokens;
        const p = r.parsed_output;
        if (r.stop_reason !== "end_turn" || !p) return { handle, ok: false, why: `réponse ${r.stop_reason}` };
        return { handle, ok: true, gender: p.gender };
      } catch (e) {
        console.error(`[ia genre] @${handle} : ${e instanceof Error ? e.message : String(e)}`);
        return { handle, ok: false, why: cut(e) ? "réponse coupée" : "erreur" };
      }
    });
    const whys = tally(out.map((x) => x.why));
    const unshown = out.filter((x) => x.unshown).length;
    for (let i = 0; i < out.length; i += 100) await ctx.runMutation(internal.radarStore.saveGender, { items: out.slice(i, i + 100).map(({ why: _w, ...x }) => x), now: Date.now() });
    const cost = tin * PRICE_IN + tout * PRICE_OUT;
    const left = await ctx.runQuery(internal.radarStore.aiLeft, { table: "accountAi", now: Date.now() });
    if (left && out.length === rows.length) await ctx.scheduler.runAfter(5_000, internal.radarAi.fillGender, { token });
    else {
      await ctx.runMutation(internal.radarStore.dropLease, { name: "ai-gender", token });
      if (await ctx.runQuery(internal.radarStore.aiNeedSync, { now: Date.now() })) await ctx.scheduler.runAfter(0, internal.radarSync.run, {});
    }
    console.log(`[ia genre] ${out.length} comptes lus, ${out.filter((x) => x.ok).length} réussis${unshown ? `, ${unshown} retirés (plus montrés)` : ""}${whys ? ` (échecs : ${whys})` : ""}, ${tin}+${tout} tokens, ${cost.toFixed(4)} $, ${left ? "il en reste" : "plus rien à lire"}`);
    return { read: out.length, cost };
  },
});
