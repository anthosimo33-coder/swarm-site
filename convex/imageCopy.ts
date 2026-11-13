"use node";

import type { Id } from "./_generated/dataModel";
import type { ActionCtx } from "./_generated/server";

/**
 * Copie d'une image chez Swarm (miniature de vidéo, icône d'app), réduite à sa taille
 * d'affichage. Utilisé par la synchro de nuit (convex/radarSync.ts) et par l'adresse
 * /cover/<id> qui va chercher une miniature à la première vue (convex/covers.ts).
 *
 * Sources :
 *   itunes:<nom de l'app>           l'icône App Store de l'app
 *   ttpage:<handle>/<id de vidéo>   la miniature lue sur la page publique de la vidéo TikTok
 *   igpage:<code du reel>           la miniature lue sur la page d'intégration publique d'Instagram
 *   https://…                       l'image elle-même (URL signée du dernier relevé)
 */

export const MAX_IMAGE_BYTES = 4_000_000;
/** Taille servie : une vignette fait au plus 360 px de large à l'écran (720 en Retina), une icône 256 px. */
const COVER_WIDTH = 480;
const ICON_SIZE = 256;
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15";

type StoreHit = { artworkUrl512?: string; artworkUrl100?: string; trackViewUrl?: string; trackName?: string };
/** La fiche App Store d'une app, cherchée par son nom (premier résultat). */
export async function appStoreHit(name: string): Promise<StoreHit | null> {
  try {
    const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(name)}&entity=software&limit=1&country=fr`);
    if (!res.ok) return null;
    const body = (await res.json()) as { results?: StoreHit[] };
    return body.results?.[0] ?? null;
  } catch {
    return null;
  }
}

/** La miniature d'une vidéo TikTok, lue dans les données de sa page publique (URL signée, fraîche). */
export async function tiktokCover(handle: string, id: string): Promise<string | null> {
  try {
    const res = await fetch(`https://www.tiktok.com/@${encodeURIComponent(handle || "tiktok")}/video/${id}`, {
      headers: { "User-Agent": UA, "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8" },
    });
    if (!res.ok) return null;
    const html = await res.text();
    const m = html.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)<\/script>/);
    if (m) {
      try {
        const data = JSON.parse(m[1]);
        const video = data?.__DEFAULT_SCOPE__?.["webapp.video-detail"]?.itemInfo?.itemStruct?.video;
        const url = video?.cover || video?.originCover || video?.dynamicCover;
        if (typeof url === "string" && url.startsWith("https://")) return url;
      } catch {
        // données illisibles : on essaie la recherche simple ci-dessous
      }
    }
    const r = html.match(/"cover":"(https:[^"]+)"/);
    return r ? (JSON.parse(`"${r[1]}"`) as string) : null;
  } catch {
    return null;
  }
}

/** La miniature d'un reel Instagram, lue sur sa page d'intégration publique (sans connexion). */
export async function instagramCover(code: string): Promise<string | null> {
  const decode = (u: string) => u.replace(/&amp;/g, "&");
  try {
    const res = await fetch(`https://www.instagram.com/reel/${encodeURIComponent(code)}/embed/`, {
      headers: { "User-Agent": UA, "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8" },
    });
    if (res.ok) {
      const html = await res.text();
      const m = html.match(/class="EmbeddedMediaImage"[^>]*src="([^"]+)"/) ?? html.match(/src="([^"]+)"[^>]*class="EmbeddedMediaImage"/);
      if (m) return decode(m[1]);
    }
    const page = await fetch(`https://www.instagram.com/reel/${encodeURIComponent(code)}/`, { headers: { "User-Agent": UA } });
    if (!page.ok) return null;
    const og = (await page.text()).match(/property="og:image" content="([^"]+)"/);
    return og ? decode(og[1]) : null;
  } catch {
    return null;
  }
}

/** L'URL de l'image à télécharger pour une source. */
async function imageUrl(source: string): Promise<string | null> {
  if (source.startsWith("itunes:")) {
    const hit = await appStoreHit(source.slice("itunes:".length));
    return hit?.artworkUrl512 ?? hit?.artworkUrl100 ?? null;
  }
  if (source.startsWith("ttpage:")) {
    const [handle, id] = source.slice("ttpage:".length).split("/");
    return id ? tiktokCover(handle, id) : null;
  }
  if (source.startsWith("igpage:")) return instagramCover(source.slice("igpage:".length));
  return source;
}

const isHeic = (type: string | null | undefined) => /hei[cf]/i.test(type ?? "");

/** HEIC (format des miniatures du relevé TikTok, que Chrome n'affiche pas) -> JPEG. */
async function fromHeic(buf: ArrayBuffer): Promise<ArrayBuffer | null> {
  try {
    const convert = (await import("heic-convert")).default as (o: { buffer: Buffer; format: "JPEG"; quality: number }) => Promise<ArrayBuffer>;
    return await convert({ buffer: Buffer.from(buf), format: "JPEG", quality: 0.85 });
  } catch {
    return null;
  }
}

/**
 * L'image réduite à sa taille d'affichage, en WebP (5 à 10 fois plus légère) ; l'originale si la
 * réduction échoue — sauf un HEIC, converti d'abord, et jamais rangé tel quel (null).
 */
export async function shrink(buf: ArrayBuffer, type: string, key: string): Promise<{ data: ArrayBuffer; type: string } | null> {
  if (isHeic(type)) {
    const jpeg = await fromHeic(buf);
    if (!jpeg) return null;
    buf = jpeg;
    type = "image/jpeg";
  }
  try {
    const sharp = (await import("sharp")).default;
    const img = sharp(Buffer.from(buf)).rotate();
    const out = key.startsWith("icon:")
      ? await img.resize({ width: ICON_SIZE, height: ICON_SIZE, fit: "cover" }).webp({ quality: 85 }).toBuffer()
      : await img.resize({ width: COVER_WIDTH, withoutEnlargement: true }).webp({ quality: 72 }).toBuffer();
    if (out.byteLength >= buf.byteLength) return { data: buf, type };
    return { data: out.buffer.slice(out.byteOffset, out.byteOffset + out.byteLength) as ArrayBuffer, type: "image/webp" };
  } catch {
    return { data: buf, type };
  }
}

/** Télécharge, réduit et range l'image ; null si la source ne donne rien (vidéo supprimée, lien expiré). */
export async function copyImage(ctx: ActionCtx, key: string, source: string) {
  try {
    let url = await imageUrl(source);
    if (!url) return null;
    let res = await fetch(url, { headers: { "User-Agent": UA } });
    // Lien signé expiré : la page publique de la vidéo (TikTok ou Instagram) en donne un neuf.
    if (!res.ok && key.startsWith("v:") && !/^(ttpage|igpage):/.test(source)) {
      const id = key.slice(2);
      url = /^\d+$/.test(id) ? await tiktokCover("tiktok", id) : id.startsWith("ig:") ? await instagramCover(id.slice(3)) : null;
      if (!url) return null;
      res = await fetch(url, { headers: { "User-Agent": UA } });
    }
    const type = res.headers.get("content-type") ?? "";
    if (!res.ok || !type.startsWith("image/")) return null;
    const buf = await res.arrayBuffer();
    if (buf.byteLength === 0 || buf.byteLength > MAX_IMAGE_BYTES) return null;
    const small = await shrink(buf, type, key);
    if (!small) return null;
    const storageId = (await ctx.storage.store(new Blob([small.data], { type: small.type }))) as Id<"_storage">;
    const served = await ctx.storage.getUrl(storageId);
    return served ? { key, storageId, url: served } : null;
  } catch {
    return null; // l'écran montre son repli
  }
}
