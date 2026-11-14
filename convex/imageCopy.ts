"use node";

import type { Id } from "./_generated/dataModel";
import type { ActionCtx } from "./_generated/server";

/**
 * Copie d'une image chez Swarm (miniature de vidéo, icône d'app), réduite à sa taille
 * d'affichage. Utilisé par la synchro de nuit (convex/radarSync.ts) et par l'adresse
 * /cover/<id> qui va chercher une miniature à la première vue (convex/covers.ts).
 *
 * Sources :
 *   itunes:<nom de l'app>           l'icône App Store de l'app (recherche par nom, France puis États-Unis)
 *   itunesid:<identifiant>          l'icône App Store de la fiche exacte (identifiant connu du Radar)
 *   site:<domaine>                  l'icône d'un site (apps web) : apple-touch-icon, sinon icône déclarée
 *   ttpage:<handle>/<id de vidéo>   la miniature lue sur la page publique de la vidéo TikTok
 *   igpage:<code du reel>           la miniature lue sur la page d'intégration publique d'Instagram
 *   ttavatar:<handle>               la photo de profil lue sur la page publique du compte TikTok
 *   https://…                       l'image elle-même (URL signée du dernier relevé)
 */

export const MAX_IMAGE_BYTES = 4_000_000;
/** Taille servie : une vignette fait au plus 360 px de large à l'écran (720 en Retina), une icône 256 px. */
const COVER_WIDTH = 480;
const ICON_SIZE = 256;
/** Photo de profil : affichée en 36 à 120 px. */
const AVATAR_SIZE = 240;
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15";
/**
 * Un serveur qui ne répond plus ne doit pas bloquer la synchro (une action Convex : 10 min au plus,
 * coupée sans rien écrire — 14/11, 10 h 09) : 15 s par appel, lecture du corps comprise.
 */
const FETCH_MS = 15_000;
const get = (url: string, init: RequestInit = {}) => fetch(url, { ...init, signal: AbortSignal.timeout(FETCH_MS) });

type StoreHit = { artworkUrl512?: string; artworkUrl100?: string; trackViewUrl?: string; trackName?: string; trackId?: number; userRatingCount?: number };
const normName = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();

/**
 * La fiche App Store est-elle bien celle de l'app ? Son titre doit COMMENCER par le nom de l'app
 * (espaces et ponctuation ignorés, « app » final facultatif) : « WingAI: Your AI Wingman » pour
 * Wing AI, « RIZZ » pour Rizz App ; jamais « Angel Magick » pour What Brandon Thinks (un site),
 * ni « Find My Airbuds » pour Airbuds. Sans fiche sûre : ni lien ni icône App Store.
 */
export function sameApp(name: string, trackName: string): boolean {
  const words = normName(name).split(" ").filter(Boolean);
  if (words.length > 1 && words[words.length - 1] === "app") words.pop();
  const want = words.join("");
  if (want.length < 3) return false;
  let acc = "";
  for (const tok of normName(trackName).split(" ").filter(Boolean)) {
    acc += tok;
    if (acc === want) return true;
    if (acc.length >= want.length) return false;
  }
  return false;
}

/** Le titre est exactement le nom de l'app (ponctuation, casse et « app » final ignorés). */
const exactName = (name: string, title: string) => {
  const w = normName(name).split(" ").filter(Boolean);
  if (w.length > 1 && w[w.length - 1] === "app") w.pop();
  const t = normName(title).split(" ").filter(Boolean);
  if (t.length > 1 && t[t.length - 1] === "app") t.pop();
  return w.join("") === t.join("");
};

/** La fiche App Store d'une app : le premier résultat de la recherche dont le titre est bien le sien. */
/** L'App Store tolère ~20 appels par minute : un appel toutes les 3,2 s, pour toute l'action. */
let nextCall = 0;
async function storeGet(url: string): Promise<{ results?: StoreHit[] }> {
  const wait = nextCall - Date.now();
  nextCall = Math.max(Date.now(), nextCall) + 3_200;
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  const res = await get(url);
  if (!res.ok) throw new Error(`App Store ${res.status}`); // refus ou panne : ce n'est pas « aucune fiche »
  return (await res.json()) as { results?: StoreHit[] };
}

/**
 * La fiche App Store d'une app d'après son nom : France puis États-Unis. Plusieurs apps différentes
 * portent ce nom (« The Ick », « Snitch ») : impossible de savoir laquelle, donc aucune fiche plutôt
 * qu'une mauvaise icône. Lève une erreur si l'App Store ne répond pas (la fiche d'avant est gardée).
 */
export async function appStoreHit(name: string): Promise<StoreHit | null> {
  for (const country of ["fr", "us"]) {
    const body = await storeGet(`https://itunes.apple.com/search?term=${encodeURIComponent(name)}&entity=software&limit=25&country=${country}`);
    const seen = new Set<unknown>();
    const hits = (body.results ?? []).filter((h) => !!h.trackName && sameApp(name, h.trackName) && !seen.has(h.trackId ?? h.trackViewUrl) && seen.add(h.trackId ?? h.trackViewUrl));
    if (hits.length === 1) return hits[0];
    if (hits.length > 1) {
      // Plusieurs titres commencent par ce nom : celui qui EST le nom (« RIZZ » pour Rizz App)…
      const exact = hits.filter((h) => exactName(name, h.trackName!));
      if (exact.length === 1) return exact[0];
      // … sinon celle qui écrase les autres en nombre d'avis (Cal AI face à ses copies), sinon aucune.
      const byRatings = [...hits].sort((p, q) => (q.userRatingCount ?? 0) - (p.userRatingCount ?? 0));
      const [a, b] = [byRatings[0].userRatingCount ?? 0, byRatings[1].userRatingCount ?? 0];
      return a >= 20 && a >= 3 * b ? byRatings[0] : null;
    }
  }
  return null;
}

/** La fiche App Store exacte d'un identifiant (connu du Radar Jarvia) : France, sinon États-Unis. */
export async function appStoreLookup(id: string): Promise<StoreHit | null> {
  if (!/^\d+$/.test(id)) return null;
  for (const country of ["fr", "us"]) {
    const body = await storeGet(`https://itunes.apple.com/lookup?id=${id}&country=${country}`);
    const hit = (body.results ?? []).find((h) => !!h.trackViewUrl);
    if (hit) return hit;
  }
  return null;
}

/** L'icône d'un site (app web) : son apple-touch-icon, sinon la plus grande icône déclarée, sinon /favicon.ico. */
export async function siteIcon(domain: string): Promise<string | null> {
  try {
    const base = `https://${domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "")}/`;
    const res = await get(base, { headers: { "User-Agent": UA, Accept: "text/html" }, redirect: "follow" });
    if (!res.ok) return null;
    const html = (await res.text()).slice(0, 200_000);
    const links = [...html.matchAll(/<link\b[^>]*>/gi)].map((m) => m[0]);
    const attr = (tag: string, k: string) => (tag.match(new RegExp(`${k}\\s*=\\s*["']([^"']+)["']`, "i")) || [])[1] ?? null;
    const icons = links.filter((t) => /rel\s*=\s*["'][^"']*icon[^"']*["']/i.test(t)).map((t) => ({
      href: attr(t, "href"), apple: /apple-touch-icon/i.test(attr(t, "rel") ?? ""), size: Number((attr(t, "sizes") ?? "0").split("x")[0]) || 0,
    })).filter((i) => i.href);
    icons.sort((p, q) => Number(q.apple) - Number(p.apple) || q.size - p.size);
    const href = icons[0]?.href ?? "/favicon.ico";
    return new URL(href, res.url || base).toString();
  } catch {
    return null;
  }
}

/** La miniature d'une vidéo TikTok, lue dans les données de sa page publique (URL signée, fraîche). */
export async function tiktokCover(handle: string, id: string): Promise<string | null> {
  try {
    const res = await get(`https://www.tiktok.com/@${encodeURIComponent(handle || "tiktok")}/video/${id}`, {
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

/** La photo de profil d'un compte TikTok, lue dans les données de sa page publique. */
export async function tiktokAvatar(handle: string): Promise<string | null> {
  try {
    const res = await get(`https://www.tiktok.com/@${encodeURIComponent(handle)}`, {
      headers: { "User-Agent": UA, "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8" },
    });
    if (!res.ok) return null;
    const html = await res.text();
    const m = html.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)<\/script>/);
    if (!m) return null;
    const user = JSON.parse(m[1])?.__DEFAULT_SCOPE__?.["webapp.user-detail"]?.userInfo?.user;
    const url = user?.avatarMedium || user?.avatarLarger || user?.avatarThumb;
    return typeof url === "string" && url.startsWith("https://") ? url : null;
  } catch {
    return null;
  }
}

/** La miniature d'un reel Instagram, lue sur sa page d'intégration publique (sans connexion). */
export async function instagramCover(code: string): Promise<string | null> {
  const decode = (u: string) => u.replace(/&amp;/g, "&");
  try {
    const res = await get(`https://www.instagram.com/reel/${encodeURIComponent(code)}/embed/`, {
      headers: { "User-Agent": UA, "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8" },
    });
    if (res.ok) {
      const html = await res.text();
      const m = html.match(/class="EmbeddedMediaImage"[^>]*src="([^"]+)"/) ?? html.match(/src="([^"]+)"[^>]*class="EmbeddedMediaImage"/);
      if (m) return decode(m[1]);
    }
    const page = await get(`https://www.instagram.com/reel/${encodeURIComponent(code)}/`, { headers: { "User-Agent": UA } });
    if (!page.ok) return null;
    const og = (await page.text()).match(/property="og:image" content="([^"]+)"/);
    return og ? decode(og[1]) : null;
  } catch {
    return null;
  }
}

/** L'URL de l'image à télécharger pour une source. */
async function imageUrl(source: string): Promise<string | null> {
  if (source.startsWith("itunesid:") || source.startsWith("itunes:")) {
    try {
      const hit = source.startsWith("itunesid:") ? await appStoreLookup(source.slice("itunesid:".length)) : await appStoreHit(source.slice("itunes:".length));
      return hit?.artworkUrl512 ?? hit?.artworkUrl100 ?? null;
    } catch {
      return null;
    }
  }
  if (source.startsWith("site:")) return siteIcon(source.slice("site:".length));
  if (source.startsWith("ttpage:")) {
    const [handle, id] = source.slice("ttpage:".length).split("/");
    return id ? tiktokCover(handle, id) : null;
  }
  if (source.startsWith("igpage:")) return instagramCover(source.slice("igpage:".length));
  if (source.startsWith("ttavatar:")) return tiktokAvatar(source.slice("ttavatar:".length));
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
    sharp.cache(false); // pas de cache d'images décodées : une action Convex a 512 Mo
    sharp.concurrency(1);
    const img = sharp(Buffer.from(buf)).rotate();
    const out = key.startsWith("icon:")
      ? await img.resize({ width: ICON_SIZE, height: ICON_SIZE, fit: "cover" }).webp({ quality: 85 }).toBuffer()
      : key.startsWith("a:")
      ? await img.resize({ width: AVATAR_SIZE, height: AVATAR_SIZE, fit: "cover" }).webp({ quality: 80 }).toBuffer()
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
    let res = await get(url, { headers: { "User-Agent": UA } });
    // Lien signé expiré : la page publique de la vidéo (TikTok ou Instagram) en donne un neuf.
    if (!res.ok && key.startsWith("v:") && !/^(ttpage|igpage):/.test(source)) {
      const id = key.slice(2);
      url = /^\d+$/.test(id) ? await tiktokCover("tiktok", id) : id.startsWith("ig:") ? await instagramCover(id.slice(3)) : null;
      if (!url) return null;
      res = await get(url, { headers: { "User-Agent": UA } });
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
