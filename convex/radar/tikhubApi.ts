/**
 * Client TikHub (https://api.tikhub.io) pour les postes TikTok du Radar — la bascule du 20/11/2026, réglée poste par
 * poste (convex/radar/radarProviders). Instagram et les transcriptions restent chez ScrapeCreators.
 *
 * TikHub renvoie le format BRUT de l'app TikTok, le même que ScrapeCreators (`aweme_list`, `search_item_list`,
 * `aweme_detail`) : chaque vidéo est lue par `parseScVideo`, comme chez ScrapeCreators, et les fonctions ci-dessous
 * rendent les mêmes formes que scrapeCreatorsApi pour que les tâches changent peu. Mesuré le 20/11/2026 (banc sur un
 * échantillon de la prod) : 20 relevés de profil sur 20 identiques à ScrapeCreators au même instant.
 *
 * Clé : `process.env.TIKHUB_API_KEY`, envoyée en en-tête `Authorization: Bearer`. Elle n'entre JAMAIS dans une URL,
 * un message d'erreur ou un journal (un message qui la contiendrait la voit remplacée par « *** »). Sans clé, rien
 * ne part.
 *
 * Facturation (mesurée le 20/11/2026) : toute réponse 2xx est facturée au prix de sa route (`endpoint_cost`, lu par
 * `thPrices`), réponse vide comprise ; les 4xx et 5xx sont gratuites. La réponse ne dit ni le prix ni le solde :
 * le solde se lit à part (`thBalance`, gratuit). Un appel coupé par le délai a une facturation INCONNUE : il est
 * compté à part (`spend.unknown`), au prix plein.
 */
import { TH_PRICE_USD, cleanText, parseScVideo, type SignalInput } from "./radarSignalsMath";
import { profileNextCursor } from "./scrapeCreatorsApi";

const BASE = "https://api.tikhub.io";
/** Délai d'un appel quand l'appelant n'en donne pas (il le borne par l'échéance de son passage, cf radarProviders). */
export const TH_TIMEOUT_MS = 30_000;

/** Les 7 routes TikHub du Radar : 5 payantes (0,001 $ le 20/11/2026), le solde et les tarifs (gratuites). */
export const TH_ROUTES = {
  profile: "/api/v1/tiktok/app/v3/fetch_user_post_videos",
  search: "/api/v1/tiktok/app/v3/fetch_video_search_result",
  hashtagSearch: "/api/v1/tiktok/app/v3/fetch_hashtag_search_result",
  hashtagVideos: "/api/v1/tiktok/app/v3/fetch_hashtag_video_list",
  video: "/api/v1/tiktok/app/v3/fetch_one_video_by_share_url",
  balance: "/api/v1/tikhub/user/get_user_info",
  prices: "/api/v1/tikhub/user/get_all_endpoints_info",
} as const;
export type ThRoute = (typeof TH_ROUTES)[keyof typeof TH_ROUTES];
const ROUTE_LIST: readonly string[] = Object.values(TH_ROUTES);
/** Les routes gratuites : ni facturées, ni comptées dans les appels du budget. */
const FREE_ROUTES: readonly string[] = [TH_ROUTES.balance, TH_ROUTES.prices];

/** Le tarif lu de chaque route (`get_all_endpoints_info`) : prix d'un appel, crédit gratuit accepté. */
export type ThPrices = Record<string, { usd: number; free: boolean }>;

export const thKeyPresent = () => !!process.env.TIKHUB_API_KEY;

/**
 * Pourquoi un appel a échoué :
 *  dry : solde insuffisant (402, gratuit) · key : clé refusée (401, 403) · rate : trop d'appels (429) ·
 *  down : panne de TikHub (5xx) · bad : autre refus (4xx) · upstream : réponse 200 dont `data.status_code` n'est pas 0
 *  (TikTok a refusé ; FACTURÉE) · unknown : délai dépassé ou réseau (facturation inconnue).
 */
export type ThKind = "dry" | "key" | "rate" | "down" | "bad" | "upstream" | "unknown";
/** La dépense d'un appel : `th` appels facturés, `usd` leur prix, `unknown` appels à facturation inconnue. */
export type ThSpend = { th: number; usd: number; unknown: number };
/**
 * Le résultat d'un appel. Pas de champ `credits` (exprès) : la dépense TikHub se compte en dollars, et un appelant
 * qui additionnerait des crédits ScrapeCreators ne compile pas.
 */
export type ThResult<T> = { ok: true; value: T; spend: ThSpend } | { ok: false; kind: ThKind; status?: number; error: string; spend: ThSpend };

/** `timeoutMs` : délai de l'appel ; `prices` : les tarifs lus (sinon TH_PRICE_USD) ; `fetchImpl` : pour les tests. */
export type ThOpts = { timeoutMs?: number; prices?: ThPrices | null; fetchImpl?: typeof fetch };

const NONE: ThSpend = { th: 0, usd: 0, unknown: 0 };

const obj = (x: unknown): Record<string, unknown> | null => (x !== null && typeof x === "object" && !Array.isArray(x) ? (x as Record<string, unknown>) : null);
const list = (x: unknown): unknown[] => (Array.isArray(x) ? x : []);
const more = (x: unknown): boolean => x === true || x === 1;

/**
 * Un texte sans la clé (au cas où une erreur réseau la recopierait), coupé à 200 caractères sans moitié d'emoji
 * (radarSignalsMath.cleanText). Corrigé le 21/11/2026 : coupé par `slice`, un emoji à cheval sur la coupe laissait une
 * moitié que Convex refuse — l'erreur rangée (thLastError, lastError) faisait échouer recordRun, et la dépense du
 * passage, que lit le plafond du jour, n'était plus écrite.
 */
function masked(text: string, key: string): string {
  return cleanText(key ? text.split(key).join("***") : text, 200);
}

/** Le prix d'un appel facturé de cette route : son tarif lu, sinon le prix de base. */
export const thRoutePrice = (route: string, prices?: ThPrices | null): number => (FREE_ROUTES.includes(route) ? 0 : prices?.[route]?.usd ?? TH_PRICE_USD);

/** Un appel GET. La réponse entière est rendue (`data` porte le format de l'app TikTok). */
export async function thGet(route: ThRoute, params: Record<string, string>, opts: ThOpts = {}): Promise<ThResult<Record<string, unknown>>> {
  const key = process.env.TIKHUB_API_KEY ?? "";
  if (!key) return { ok: false, kind: "key", error: "TIKHUB_API_KEY absente", spend: NONE };
  const billed = !FREE_ROUTES.includes(route);
  const price = thRoutePrice(route, opts.prices);
  const url = `${BASE}${route}?${new URLSearchParams(params).toString()}`;
  const fetchImpl = opts.fetchImpl ?? fetch;
  let status: number;
  let text: string;
  try {
    const res = await fetchImpl(url, { headers: { Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(opts.timeoutMs ?? TH_TIMEOUT_MS) });
    status = res.status;
    text = await res.text();
  } catch (e) {
    // Délai dépassé ou réseau : TikHub a peut-être répondu (et facturé). Compté à part, au prix plein.
    const msg = e instanceof Error ? `${e.name} ${e.message}` : String(e);
    return { ok: false, kind: "unknown", error: `${route} : ${masked(msg, key)}`, spend: billed ? { th: 0, usd: 0, unknown: 1 } : NONE };
  }
  let body: Record<string, unknown> = {};
  try {
    body = obj(JSON.parse(text)) ?? {};
  } catch {
    // Corps non JSON : on garde le statut, jamais l'URL.
  }
  if (status < 200 || status >= 300) {
    const detail = obj(body.detail);
    const why = typeof detail?.message === "string" ? detail.message : typeof body.message === "string" ? body.message : text;
    const kind: ThKind = status === 402 ? "dry" : status === 401 || status === 403 ? "key" : status === 429 ? "rate" : status >= 500 ? "down" : "bad";
    return { ok: false, kind, status, error: masked(`HTTP ${status} ${route} : ${why}`, key), spend: NONE };
  }
  const spend: ThSpend = billed ? { th: 1, usd: price, unknown: 0 } : NONE;
  const data = obj(body.data);
  if (data && typeof data.status_code === "number" && data.status_code !== 0) {
    const msg = typeof data.status_msg === "string" ? data.status_msg : "";
    return { ok: false, kind: "upstream", status, error: masked(`HTTP ${status} ${route} : status_code ${data.status_code} ${msg}`, key), spend };
  }
  return { ok: true, value: body, spend };
}

/**
 * Une vidéo TikHub dans la forme du Radar. TikHub n'ajoute pas `is_ad` (c'est ScrapeCreators qui l'ajoute) : la pub
 * se lit sur `commerce_info.ad_source === 1`, la règle trouvée le 20/11/2026 (59 pubs sur 59 chez ScrapeCreators, et
 * 3 qu'il ne marquait pas ; `ad_source` identique chez les deux sur 187 vidéos communes).
 */
export function thVideo(raw: unknown, fallbackLang?: string): SignalInput | null {
  const parsed = parseScVideo(raw, fallbackLang);
  if (!parsed) return null;
  const top = obj(raw);
  const v = obj(top?.aweme_info) ?? top;
  const ad = obj(v?.commerce_info)?.ad_source === 1;
  return ad && !parsed.isAd ? { ...parsed, isAd: true } : parsed;
}

const videosOf = (raw: readonly unknown[], lang?: string) => raw.map((it) => thVideo(it, lang)).filter((x): x is SignalInput => x !== null);

/** La liste brute d'une réponse de recherche : `search_item_list` d'abord (TikHub y joint un `aweme_list` vide). */
const searchItems = (data: Record<string, unknown> | null): unknown[] => {
  const items = list(data?.search_item_list);
  return items.length ? items : list(data?.aweme_list);
};

/**
 * Les vidéos dont l'auteur a 0 abonné dans une recherche TikHub : NON MESURÉ, pas zéro. ScrapeCreators n'en rend
 * aucune à 0 sur 57 ; TikHub 3 sur 43 (20/11/2026). Rangées à part (identifiants de vidéo) : un signal connu garde
 * ses abonnés, un signal neuf n'entre pas sur un ratio inventé (cf radarSignals.writeSignal).
 */
const fansUnknownOf = (videos: readonly SignalInput[]): string[] => videos.filter((v) => v.authorFans === 0).map((v) => v.videoId);

/**
 * Une page des vidéos d'un compte (`fetch_user_post_videos`, les plus récentes : `sort_type` 0), même forme que
 * scProfileVideosPage. Un compte supprimé, inexistant ou vidé répond 200 « No more videos » SANS liste, facturé
 * (ScrapeCreators répond 404 gratuit) : une liste vide, que le relevé payant traite comme une erreur de relevé
 * (radarFreeMath.paidRead, un compte mort coûte 3 appels au plus avant sa pause).
 */
export async function thProfilePage(handle: string, cursor?: string, opts: ThOpts = {}): Promise<ThResult<{ videos: SignalInput[]; next: string | null }>> {
  const r = await thGet(TH_ROUTES.profile, { unique_id: handle, count: "20", sort_type: "0", ...(cursor ? { max_cursor: cursor } : {}) }, opts);
  if (!r.ok) return r;
  const data = obj(r.value.data) ?? {};
  return { ...r, value: { videos: videosOf(list(data.aweme_list)), next: profileNextCursor(data, cursor) } };
}

/** Vidéos par page de recherche par mot-clé. */
export const TH_SEARCH_COUNT = 30;

/**
 * Une page de recherche par mot-clé pour le réseau d'une app (3 derniers mois, par pertinence). La pagination de
 * TikHub se fait par DÉCALAGE (`offset` = 30 × page) et ramène des doublons d'une page à l'autre (9 sur 60 mesurés) :
 * l'appelant dédoublonne dans la passe. `rawCount` : vidéos brutes de la page ; `next` : la page suivante quand
 * `has_more` le dit (TikHub rend `cursor` 30 même sans suite). La région est TOUJOURS explicite : sans elle, TikHub
 * cherche aux États-Unis.
 */
export async function thKeywordPage(
  value: string,
  page: number,
  region: string,
  opts: ThOpts = {},
): Promise<ThResult<{ videos: SignalInput[]; rawCount: number; next: number | undefined; fansUnknown: string[] }>> {
  const r = await thGet(
    TH_ROUTES.search,
    { keyword: value, count: String(TH_SEARCH_COUNT), sort_type: "0", publish_time: "90", region, offset: String(TH_SEARCH_COUNT * page) },
    opts,
  );
  if (!r.ok) return r;
  const data = obj(r.value.data);
  const raw = searchItems(data);
  const videos = videosOf(raw);
  return { ...r, value: { videos, rawCount: raw.length, next: more(data?.has_more) ? page + 1 : undefined, fansUnknown: fansUnknownOf(videos) } };
}

/** Recherche de découverte : vidéos de la semaine les plus aimées (`sort_type` 1, `publish_time` 7), même forme que scSearchKeyword. */
export async function thSearchKeyword(query: string, region: string, lang: string, opts: ThOpts = {}): Promise<ThResult<{ videos: SignalInput[]; fansUnknown: string[] }>> {
  const r = await thGet(TH_ROUTES.search, { keyword: query, count: String(TH_SEARCH_COUNT), sort_type: "1", publish_time: "7", region }, opts);
  if (!r.ok) return r;
  const videos = videosOf(searchItems(obj(r.value.data)), lang);
  return { ...r, value: { videos, fansUnknown: fansUnknownOf(videos) } };
}

/** Un nom de hashtag comparable : forme Unicode normale (NFC), en minuscules. */
export const hashtagKey = (tag: string): string => tag.normalize("NFC").toLowerCase();

/**
 * L'identifiant d'un hashtag (`fetch_hashtag_search_result`) : celui dont le nom est EXACTEMENT le hashtag cherché,
 * à la casse près, où qu'il soit dans la liste ; `null` sinon (TikHub propose des voisins : « focus_town »,
 * « focustowns »… pour « focustown »). Stable : l'appelant le garde (radarHashtagIds).
 */
export async function thHashtagId(tag: string, opts: ThOpts = {}): Promise<ThResult<{ cid: string; name: string } | null>> {
  const r = await thGet(TH_ROUTES.hashtagSearch, { keyword: tag, count: "10" }, opts);
  if (!r.ok) return r;
  const want = hashtagKey(tag);
  for (const it of list(obj(r.value.data)?.challenge_list)) {
    const c = obj(obj(it)?.challenge_info) ?? obj(it);
    const name = typeof c?.cha_name === "string" ? c.cha_name : undefined;
    const cid = typeof c?.cid === "string" ? c.cid : typeof c?.cid === "number" ? String(c.cid) : undefined;
    if (name !== undefined && cid && hashtagKey(name) === want) return { ...r, value: { cid, name } };
  }
  return { ...r, value: null };
}

/**
 * Une page des vidéos d'un hashtag (`fetch_hashtag_video_list`, ~20 vidéos), même forme que la page hashtag de
 * scNetworkPage : `next` est le curseur de la suite quand `has_more` le dit. Sans région, aucun paramètre (la
 * configuration mesurée le 20/11/2026 : 52 comptes rattachés contre 52 chez ScrapeCreators).
 */
export async function thHashtagPage(
  cid: string,
  cursor: number | undefined,
  region?: string,
  opts: ThOpts = {},
): Promise<ThResult<{ videos: SignalInput[]; rawCount: number; next: number | undefined }>> {
  const r = await thGet(TH_ROUTES.hashtagVideos, { ch_id: cid, count: "20", cursor: String(cursor ?? 0), ...(region ? { region } : {}) }, opts);
  if (!r.ok) return r;
  const data = obj(r.value.data);
  const raw = list(data?.aweme_list);
  const c = typeof data?.cursor === "number" ? data.cursor : typeof data?.cursor === "string" ? Number(data.cursor) : undefined;
  return { ...r, value: { videos: videosOf(raw), rawCount: raw.length, next: more(data?.has_more) && c !== undefined && Number.isFinite(c) ? c : undefined } };
}

/**
 * Infos d'une vidéo par son adresse (`fetch_one_video_by_share_url`), même adresse et même forme que scVideoInfo.
 * Vues identiques à ScrapeCreators (0 à 0,1 %), mais `follower_count` y vaut TOUJOURS 0 : l'appelant garde les
 * abonnés connus (radarSignals.applyCurve, `fansUnknown`). Une vidéo supprimée : 200 sans `aweme_detail`, facturé.
 */
export async function thVideoInfo(url: string, opts: ThOpts = {}): Promise<ThResult<SignalInput | null>> {
  const r = await thGet(TH_ROUTES.video, { share_url: url }, opts);
  if (!r.ok) return r;
  const detail = obj(r.value.data)?.aweme_detail;
  return { ...r, value: detail ? thVideo(detail) : null };
}

/** Le solde du compte TikHub (gratuit, une lecture par seconde au plus) : le payé et le crédit gratuit, en dollars. Rien d'autre n'est lu. */
export async function thBalance(opts: ThOpts = {}): Promise<ThResult<{ paidUsd: number; freeUsd: number }>> {
  const r = await thGet(TH_ROUTES.balance, {}, opts);
  if (!r.ok) return r;
  const u = obj(r.value.user_data) ?? obj(obj(r.value.data)?.user_data);
  const paid = u?.balance;
  const free = u?.free_credit;
  if (typeof paid !== "number" || !Number.isFinite(paid)) return { ok: false, kind: "bad", error: `${TH_ROUTES.balance} : solde illisible`, spend: NONE };
  return { ...r, value: { paidUsd: paid, freeUsd: typeof free === "number" && Number.isFinite(free) ? free : 0 } };
}

/** Les tarifs des 7 routes du Radar (gratuit), lus au plus une fois par jour (radarProviders). */
export async function thPrices(opts: ThOpts = {}): Promise<ThResult<ThPrices>> {
  const r = await thGet(TH_ROUTES.prices, {}, opts);
  if (!r.ok) return r;
  const out: ThPrices = {};
  for (const it of list(r.value.data)) {
    const e = obj(it);
    const uri = e?.endpoint_uri;
    if (typeof uri !== "string" || !ROUTE_LIST.includes(uri) || typeof e?.endpoint_cost !== "number") continue;
    out[uri] = { usd: e.endpoint_cost, free: e.allow_free_credit === 1 || e.allow_free_credit === true };
  }
  return { ...r, value: out };
}
