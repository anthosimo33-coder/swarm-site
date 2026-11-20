/**
 * La page publique TikTok d'une vidéo ou d'un compte, lue d'une seule façon (audit Q51, 19/11 : la requête, la lecture
 * du JSON __UNIVERSAL_DATA_FOR_REHYDRATION__ et du statusCode étaient écrites 3 fois, l'en-tête User-Agent 2 fois ; une
 * copie corrigée laissait les autres en panne, et miniatures, pays et carrousels ne tombaient pas en panne ensemble).
 * Lue par convex/imageCopy.ts (miniature, photo de profil) et convex/radarRegions.ts (pays, carrousel). Module pur : ni
 * base ni Node, seulement fetch.
 */

/** L'en-tête User-Agent de toutes les lectures de pages publiques (TikTok, Instagram, sites des apps). */
export const PAGE_UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15";
/** Un serveur qui ne répond plus ne bloque pas l'action : 15 s par page, lecture du corps comprise. */
export const PAGE_MS = 15_000;
const HEADERS = { "User-Agent": PAGE_UA, "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8" };

type Get = (url: string, init: RequestInit) => Promise<Response | null>;
const plainGet: Get = (url, init) => fetch(url, { ...init, signal: AbortSignal.timeout(PAGE_MS) });

export const videoPageUrl = (id: string, handle?: string | null) => `https://www.tiktok.com/@${encodeURIComponent(handle || "tiktok")}/video/${id}`;
export const userPageUrl = (handle: string) => `https://www.tiktok.com/@${encodeURIComponent(handle)}`;

/**
 * Ce que dit la page : `detail`, la partie `scope` de ses données (webapp.video-detail, webapp.user-detail), et `html`
 * (pour un repli) ; `gone` si TikTok dit que la vidéo ou le compte n'existe pas ou plus (statusCode non nul) ; rien du
 * tout si la page n'a pas répondu (refus passager, délai). `get` : la lecture à utiliser (celle d'imageCopy.ts, qui
 * vérifie l'hôte et borne le corps), fetch avec délai sinon.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TikTokPage = { detail?: any; html?: string; gone?: boolean };
export async function tiktokPage(url: string, scope: "webapp.video-detail" | "webapp.user-detail", get: Get = plainGet): Promise<TikTokPage> {
  try {
    const res = await get(url, { headers: HEADERS });
    if (!res?.ok) return {};
    const html = await res.text();
    const m = html.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)<\/script>/);
    let detail: unknown;
    try { detail = m ? (JSON.parse(m[1]) as { __DEFAULT_SCOPE__?: Record<string, unknown> })?.__DEFAULT_SCOPE__?.[scope] : undefined; } catch { detail = undefined; }
    const status = (detail as { statusCode?: unknown } | undefined)?.statusCode;
    if (typeof status === "number" && status !== 0) return { gone: true, html };
    return { detail, html };
  } catch {
    return {};
  }
}
