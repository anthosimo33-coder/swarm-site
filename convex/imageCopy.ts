"use node";

import { promises as dns } from "node:dns";
import { isIP } from "node:net";
import type { Id } from "./_generated/dataModel";
import { PAGE_UA, tiktokPage, userPageUrl, videoPageUrl } from "./tiktokPage";
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
const UA = PAGE_UA;
/**
 * Un serveur qui ne répond plus ne doit pas bloquer la synchro (une action Convex : 10 min au plus,
 * coupée sans rien écrire — 14/11, 10 h 09) : 15 s par appel, lecture du corps comprise.
 */
const FETCH_MS = 15_000;
/** Page d'accueil d'un site, lue pour y trouver son icône : ses premiers octets seulement. */
const MAX_HTML_BYTES = 200_000;
const MAX_HOPS = 5;

/**
 * Hôtes des plateformes d'où viennent miniatures, photos et icônes App Store : connus, leurs adresses ne sont pas
 * vérifiées une à une. Tout autre hôte (site d'une app web) est résolu et refusé s'il mène au réseau privé.
 */
const KNOWN_HOSTS = /(^|\.)(tiktok\.com|tiktokcdn\.com|tiktokcdn-us\.com|tiktokcdn-eu\.com|ibyteimg\.com|byteimg\.com|muscdn\.com|tiktokv\.com|mzstatic\.com|apple\.com|instagram\.com|cdninstagram\.com|fbcdn\.net)$/i;
/** Une adresse IP du réseau privé, local, de bouclage ou réservée (v4 et v6). */
export function privateIp(ip: string): boolean {
  const v = isIP(ip);
  if (v === 4) {
    const [a, b] = ip.split(".").map(Number);
    return a === 0 || a === 10 || a === 127 || (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31)
      || (a === 192 && b === 168) || (a === 192 && b === 0) || (a === 198 && (b === 18 || b === 19)) || a >= 224;
  }
  if (v === 6) {
    const x = ip.toLowerCase();
    if (x === "::" || x === "::1") return true;
    const v4 = x.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (v4) return privateIp(v4[1]);
    return /^(fc|fd|fe8|fe9|fea|feb|ff)/.test(x) || x.startsWith("64:ff9b:") || x.startsWith("2001:db8:");
  }
  return true; // illisible : refusé
}
/**
 * L'adresse peut-elle être lue ? Audit S33 (19/11) : toute adresse, de tout schéma, vers tout hôte, était lue (une
 * icône déclarée en http://169.254.169.254/… ou vers le réseau interne passait). Seulement https, jamais une IP écrite
 * en clair ni un nom local ; un hôte inconnu doit résoudre vers des adresses publiques.
 */
export async function readable(url: string): Promise<boolean> {
  let u: URL;
  try { u = new URL(url); } catch { return false; }
  if (u.protocol !== "https:" || u.username || u.password) return false;
  const host = u.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (!host || isIP(host) || !host.includes(".") || /(^|\.)(localhost|local|internal|intranet|lan|home|corp|localdomain)$/.test(host)) return false;
  if (KNOWN_HOSTS.test(host)) return true;
  try {
    const addrs = await dns.lookup(host, { all: true });
    return addrs.length > 0 && addrs.every((a) => !privateIp(a.address));
  } catch {
    return false;
  }
}
/**
 * GET avec délai, en suivant les redirections une à une : chaque saut est revérifié (readable). null si une adresse
 * est refusée ou s'il y a trop de sauts.
 */
async function get(url: string, init: RequestInit = {}): Promise<Response | null> {
  const signal = AbortSignal.timeout(FETCH_MS);
  for (let hop = 0; hop <= MAX_HOPS; hop++) {
    if (!(await readable(url))) return null;
    const res = await fetch(url, { ...init, redirect: "manual", signal });
    const to = res.status >= 300 && res.status < 400 ? res.headers.get("location") : null;
    if (!to) return res;
    await res.body?.cancel().catch(() => {});
    url = new URL(to, url).toString();
  }
  return null;
}
/**
 * Le corps, lu au plus `max` octets : null au-delà (lecture arrêtée), ou si le serveur annonce déjà plus. Audit S33 :
 * le corps était lu en entier avant d'être comparé aux 4 Mo ; un flux de centaines de Mo tuait l'action de copie.
 */
async function readCapped(res: Response, max: number, cut = false): Promise<Uint8Array | null> {
  const announced = Number(res.headers.get("content-length") ?? NaN);
  if (!cut && Number.isFinite(announced) && announced > max) { await res.body?.cancel().catch(() => {}); return null; }
  if (!res.body) return new Uint8Array(0);
  const reader = res.body.getReader();
  const parts: Uint8Array[] = [];
  let n = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (n + value.byteLength > max) {
      await reader.cancel().catch(() => {});
      if (!cut) return null;
      parts.push(value.subarray(0, max - n));
      n = max;
      break;
    }
    parts.push(value);
    n += value.byteLength;
  }
  const out = new Uint8Array(n);
  let at = 0;
  for (const p of parts) { out.set(p, at); at += p.byteLength; }
  return out;
}

/**
 * Le format réel d'une image, d'après ses premiers octets : seulement des formats matriciels (pas de SVG, qui peut
 * porter un script). Audit S30 (19/11) : le type annoncé par le serveur suffisait, et une icône SVG était rangée telle
 * quelle, servie depuis le stockage Convex, où un script tournait à l'ouverture directe de l'adresse.
 */
export function sniff(b: Uint8Array): string | null {
  const at = (i: number, ...xs: number[]) => xs.every((x, j) => b[i + j] === x);
  const ascii = (i: number, t: string) => [...t].every((c, j) => b[i + j] === c.charCodeAt(0));
  if (b.length < 12) return null;
  if (at(0, 0xff, 0xd8, 0xff)) return "image/jpeg";
  if (at(0, 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return "image/png";
  if (ascii(0, "GIF87a") || ascii(0, "GIF89a")) return "image/gif";
  if (ascii(0, "RIFF") && ascii(8, "WEBP")) return "image/webp";
  if (ascii(4, "ftyp")) {
    // Marque principale (octets 8 à 11) puis marques compatibles, jusqu'à la fin de la boîte ftyp.
    const end = Math.min(b.length, ((b[0] << 24) | (b[1] << 16) | (b[2] << 8) | b[3]) >>> 0 || 32);
    const brands: string[] = [];
    for (let i = 8; i + 4 <= end; i += i === 8 ? 8 : 4) brands.push(String.fromCharCode(b[i], b[i + 1], b[i + 2], b[i + 3]));
    if (brands.some((x) => x === "avif" || x === "avis")) return "image/avif";
    if (brands.some((x) => /^(heic|heix|hevc|hevx|heim|heis|mif1|msf1)$/.test(x))) return "image/heic";
  }
  if (at(0, 0x00, 0x00, 0x01, 0x00)) return "image/x-icon";
  return null;
}
/** Formats qu'on peut ranger et servir tels quels (si la réduction en WebP n'y gagne rien). */
const SAFE_TYPES = new Set(["image/jpeg", "image/png", "image/gif", "image/webp", "image/avif", "image/x-icon"]);

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

/** L'App Store tolère ~20 appels par minute : un appel toutes les 3,2 s, pour toute l'action. */
let nextCall = 0;
async function storeGet(url: string): Promise<{ results?: StoreHit[] }> {
  const wait = nextCall - Date.now();
  nextCall = Math.max(Date.now(), nextCall) + 3_200;
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  const res = await get(url);
  if (!res?.ok) throw new Error(`App Store ${res?.status ?? "refusé"}`); // refus ou panne : ce n'est pas « aucune fiche »
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

/**
 * L'icône d'un site (app web) : son apple-touch-icon, sinon la plus grande icône déclarée, sinon /favicon.ico. Jamais
 * une icône SVG (audit S30) ; seuls les MAX_HTML_BYTES premiers octets de la page sont lus (audit S33).
 */
export async function siteIcon(domain: string): Promise<string | null> {
  try {
    const base = `https://${domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "")}/`;
    const res = await get(base, { headers: { "User-Agent": UA, Accept: "text/html" } });
    if (!res?.ok) return null;
    const bytes = await readCapped(res, MAX_HTML_BYTES, true);
    if (!bytes) return null;
    const html = new TextDecoder().decode(bytes);
    const links = [...html.matchAll(/<link\b[^>]*>/gi)].map((m) => m[0]);
    const attr = (tag: string, k: string) => (tag.match(new RegExp(`${k}\\s*=\\s*["']([^"']+)["']`, "i")) || [])[1] ?? null;
    const icons = links.filter((t) => /rel\s*=\s*["'][^"']*icon[^"']*["']/i.test(t)).map((t) => ({
      href: attr(t, "href"), apple: /apple-touch-icon/i.test(attr(t, "rel") ?? ""), size: Number((attr(t, "sizes") ?? "0").split("x")[0]) || 0,
      svg: /svg/i.test(attr(t, "type") ?? "") || /\.svgz?(?:[?#]|$)/i.test(attr(t, "href") ?? ""),
    })).filter((i) => i.href && !i.svg);
    icons.sort((p, q) => Number(q.apple) - Number(p.apple) || q.size - p.size);
    const href = icons[0]?.href ?? "/favicon.ico";
    const url = new URL(href, res.url || base).toString();
    return url.startsWith("https://") ? url : null;
  } catch {
    return null;
  }
}

/**
 * La miniature d'une vidéo TikTok, lue dans les données de sa page publique (URL signée, fraîche). `gone` : TikTok dit
 * que la vidéo n'existe plus ou n'est pas visible (statusCode non nul, 10204 « item doesn't exist »…). Ni l'un ni
 * l'autre : TikTok n'a pas répondu comme d'habitude (page de contrôle, refus passager) — rien n'est sûr (16/11 : sur
 * 12 vidéos ratées par la lecture IA, 11 existaient, lues une à une sans souci).
 */
export async function tiktokCoverState(handle: string, id: string): Promise<{ url?: string; gone?: boolean; blank?: boolean }> {
  const page = await tiktokPage(videoPageUrl(id, handle), "webapp.video-detail", get);
  if (page.gone) return { gone: true };
  const video = page.detail?.itemInfo?.itemStruct?.video;
  const url = video?.cover || video?.originCover || video?.dynamicCover;
  if (typeof url === "string" && url.startsWith("https://")) return { url };
  // La vidéo existe, mais TikTok ne lui donne pas (encore) de miniature (16/11 : cover, originCover, dynamicCover vides).
  if (page.detail?.statusCode === 0 && video) return { blank: true };
  // Données illisibles : la recherche simple dans la page.
  const r = page.html?.match(/"cover":"(https:[^"]+)"/);
  try { return r ? { url: JSON.parse(`"${r[1]}"`) as string } : {}; } catch { return {}; }
}

/**
 * La photo de profil d'un compte TikTok, lue dans les données de sa page publique : `gone` (TikTok dit que le compte
 * n'existe pas ou plus), `blank` (pas de photo), sinon pas de réponse.
 */
export async function tiktokAvatarState(handle: string): Promise<{ url?: string; gone?: boolean; blank?: boolean }> {
  const page = await tiktokPage(userPageUrl(handle), "webapp.user-detail", get);
  if (page.gone) return { gone: true };
  const user = page.detail?.userInfo?.user;
  const url = user?.avatarMedium || user?.avatarLarger || user?.avatarThumb;
  if (typeof url === "string" && url.startsWith("https://")) return { url };
  return user ? { blank: true } : {};
}

/** La miniature d'un reel Instagram, lue sur sa page d'intégration publique (sans connexion). */
export async function instagramCover(code: string): Promise<string | null> {
  const decode = (u: string) => u.replace(/&amp;/g, "&");
  try {
    const res = await get(`https://www.instagram.com/reel/${encodeURIComponent(code)}/embed/`, {
      headers: { "User-Agent": UA, "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8" },
    });
    if (res?.ok) {
      const html = await res.text();
      const m = html.match(/class="EmbeddedMediaImage"[^>]*src="([^"]+)"/) ?? html.match(/src="([^"]+)"[^>]*class="EmbeddedMediaImage"/);
      if (m) return decode(m[1]);
    }
    const page = await get(`https://www.instagram.com/reel/${encodeURIComponent(code)}/`, { headers: { "User-Agent": UA } });
    if (!page?.ok) return null;
    const og = (await page.text()).match(/property="og:image" content="([^"]+)"/);
    return og ? decode(og[1]) : null;
  } catch {
    return null;
  }
}

/** L'URL de l'image à télécharger pour une source ; `report` : la vidéo n'existe plus (gone), ou n'a pas de miniature (blank). */
type Report = { gone: boolean; blank?: boolean };
async function imageUrl(source: string, report?: Report): Promise<string | null> {
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
    if (!id) return null;
    const st = await tiktokCoverState(handle, id);
    if (report) { if (st.gone) report.gone = true; if (st.blank) report.blank = true; }
    return st.url ?? null;
  }
  if (source.startsWith("igpage:")) return instagramCover(source.slice("igpage:".length));
  if (source.startsWith("ttavatar:")) {
    const st = await tiktokAvatarState(source.slice("ttavatar:".length));
    if (report) { if (st.gone) report.gone = true; if (st.blank) report.blank = true; }
    return st.url ?? null;
  }
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
 * L'image réduite à sa taille d'affichage, en WebP (5 à 10 fois plus légère) ; l'originale si la réduction n'y gagne
 * rien ou échoue, seulement dans un format matriciel sûr (SAFE_TYPES : jamais un SVG, audit S30) — un HEIC est converti
 * d'abord, et jamais rangé tel quel (null).
 */
export async function shrink(buf: ArrayBuffer, type: string, key: string): Promise<{ data: ArrayBuffer; type: string } | null> {
  type = type.split(";")[0].trim().toLowerCase();
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
    if (out.byteLength >= buf.byteLength && SAFE_TYPES.has(type)) return { data: buf, type };
    return { data: out.buffer.slice(out.byteOffset, out.byteOffset + out.byteLength) as ArrayBuffer, type: "image/webp" };
  } catch {
    return SAFE_TYPES.has(type) ? { data: buf, type } : null;
  }
}

/**
 * Télécharge, réduit et range l'image ; null si la source ne donne rien. `report.gone` : la vidéo n'existe plus (dit par
 * TikTok) ; sinon un null peut n'être qu'un refus passager, à ne pas noter « introuvable ».
 */
export async function copyImage(ctx: ActionCtx, key: string, source: string, report?: Report) {
  try {
    let url = await imageUrl(source, report);
    if (!url) return null;
    let res = await get(url, { headers: { "User-Agent": UA } });
    // Lien signé expiré : la page publique de la vidéo (TikTok ou Instagram) en donne un neuf.
    if (!res?.ok && key.startsWith("v:") && !/^(ttpage|igpage):/.test(source)) {
      const id = key.slice(2);
      if (/^\d+$/.test(id)) {
        const st = await tiktokCoverState("tiktok", id);
        if (report) { if (st.gone) report.gone = true; if (st.blank) report.blank = true; }
        url = st.url ?? null;
      } else url = id.startsWith("ig:") ? await instagramCover(id.slice(3)) : null;
      if (!url) return null;
      res = await get(url, { headers: { "User-Agent": UA } });
    }
    if (!res?.ok || !(res.headers.get("content-type") ?? "").toLowerCase().startsWith("image/")) return null;
    const bytes = await readCapped(res, MAX_IMAGE_BYTES);
    if (!bytes || bytes.byteLength === 0) return null;
    // Le format vient des octets, pas de l'en-tête (un SVG annoncé « image/png » ne passe pas).
    const type = sniff(bytes);
    if (!type) return null;
    const buf = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
    const small = await shrink(buf, type, key);
    if (!small) return null;
    const storageId = (await ctx.storage.store(new Blob([small.data], { type: small.type }))) as Id<"_storage">;
    const served = await ctx.storage.getUrl(storageId);
    return served ? { key, storageId, url: served } : null;
  } catch {
    return null; // l'écran montre son repli
  }
}
