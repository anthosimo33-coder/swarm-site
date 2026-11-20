/**
 * NOUVEAU RADAR — lecture PURE des sources ajoutées le 06/11/2026 (aucun accès
 * base, aucun réseau) : pubs des bibliothèques TikTok et Meta, Reels Instagram,
 * transcriptions TikTok. Formes relevées sur de vraies réponses ScrapeCreators
 * (lib/radar-sources.test.ts). Les transcriptions par les sous-titres natifs
 * (20/11/2026) reçoivent leurs pages et le payant en argument (`transcriptPass`).
 */
import { cleanText } from "./radarSignalsMath";
import { citesApp, videoApp, videoCitesApp, type AppRule } from "./radarNetworkMath";
import { videoDetail, type FreePage } from "./radarFreeMath";
import { reasonOf, type UnavailableReason } from "./radarAvailabilityMath";
import { isTextOnShot } from "./radarDisplay";
import { STORE_BREAKER } from "./radarStoreMath";

const obj = (x: unknown): Record<string, unknown> | null =>
  x !== null && typeof x === "object" && !Array.isArray(x) ? (x as Record<string, unknown>) : null;
const num = (x: unknown): number => (typeof x === "number" && Number.isFinite(x) ? x : 0);
const str = (x: unknown): string | undefined => (typeof x === "string" && x.trim() !== "" ? cleanText(x) : undefined);
const arr = (x: unknown): unknown[] => (Array.isArray(x) ? x : []);

const DAY = 86_400_000;

// ─── Pubs ────────────────────────────────────────────────────────────────────

export type AdInput = {
  platform: "tiktok" | "meta";
  adId: string;
  advertiser: string;
  text?: string;
  firstShownAt?: number;
  lastShownAt?: number;
  active: boolean;
  /** TikTok : tranche d'audience (« 0-1K ») ; Meta : variantes de la même pub. */
  audience?: string;
  variants?: number;
  platforms: string[];
  url: string;
  videoUrl?: string;
  coverUrl?: string;
};

/**
 * Une pub de la bibliothèque TikTok (`ads[i]`). Les dates arrivent en
 * millisecondes ; une pub vue dans les 2 derniers jours est dite active. La
 * recherche ne rend pas le texte de la pub.
 */
export function parseTikTokAd(raw: unknown, now: number): AdInput | null {
  const a = obj(raw);
  const adId = str(a?.id);
  if (!a || !adId) return null;
  const first = num(a.first_shown_date) || undefined;
  const last = num(a.last_shown_date) || undefined;
  const video = obj(arr(a.videos)[0]);
  return {
    platform: "tiktok",
    adId,
    advertiser: str(a.name) ?? "",
    ...(first ? { firstShownAt: first } : {}),
    ...(last ? { lastShownAt: last } : {}),
    active: last !== undefined && now - last <= 2 * DAY,
    ...(str(a.estimated_audience) ? { audience: str(a.estimated_audience) } : {}),
    platforms: ["tiktok"],
    url: str(a.url) ?? `https://library.tiktok.com/ads/detail/?ad_id=${adId}`,
    ...(str(video?.video_url) ? { videoUrl: str(video?.video_url) } : {}),
    ...(str(video?.cover_img) ? { coverUrl: str(video?.cover_img) } : {}),
  };
}

/** Une pub de la bibliothèque Meta (`searchResults[i]` ou `results[i]`) : dates en secondes. */
export function parseMetaAd(raw: unknown): AdInput | null {
  const a = obj(raw);
  const adId = str(a?.ad_archive_id) ?? (typeof a?.ad_archive_id === "number" ? String(a.ad_archive_id) : undefined);
  if (!a || !adId) return null;
  const sn = obj(a.snapshot) ?? {};
  const body = obj(sn.body);
  const text = [str(body?.text) ?? str(sn.body), str(sn.title), str(sn.link_description)].filter(Boolean).join(" · ");
  const video = obj(arr(sn.videos)[0]);
  const image = obj(arr(sn.images)[0]);
  const start = num(a.start_date);
  const end = num(a.end_date);
  return {
    platform: "meta",
    adId,
    advertiser: str(sn.page_name) ?? str(a.page_name) ?? "",
    ...(text ? { text: cleanText(text, 600) } : {}),
    ...(start ? { firstShownAt: start * 1000 } : {}),
    ...(end ? { lastShownAt: end * 1000 } : {}),
    active: a.is_active === true,
    ...(num(a.collation_count) > 1 ? { variants: num(a.collation_count) } : {}),
    platforms: arr(a.publisher_platform).filter((p): p is string => typeof p === "string").map((p) => p.toLowerCase()),
    url: str(a.url) ?? `https://www.facebook.com/ads/library/?id=${adId}`,
    ...(str(video?.video_hd_url) ?? str(video?.video_sd_url) ? { videoUrl: str(video?.video_hd_url) ?? str(video?.video_sd_url) } : {}),
    ...(str(video?.video_preview_image_url) ?? str(image?.resized_image_url)
      ? { coverUrl: str(video?.video_preview_image_url) ?? str(image?.resized_image_url) }
      : {}),
  };
}

/**
 * Une pub est-elle bien celle de l'app ? La recherche Meta par nom ramène des
 * homonymes (07/11/2026 : « Snitch » = une marque de vêtements indienne, « Shady »
 * des lunettes et « Slim Shady », « Sunsay » un chanteur et une marque d'énergie) :
 * on n'en garde que celles qui citent l'app par un motif FORT (son domaine, son
 * nom collé). Un motif faible + un mot de contexte suffit pour une légende, pas
 * pour une pub (« #dogsofinstagram » contient « insta »).
 * La bibliothèque TikTok ne rend pas le texte : on lui fait confiance seulement
 * pour une app au nom distinctif (pas de motif faible, slug de 7 lettres ou plus).
 */
export function adCitesApp(ad: Pick<AdInput, "platform" | "advertiser" | "text">, app: AppRule & { slug?: string }): boolean {
  if (citesApp(`${ad.advertiser} ${ad.text ?? ""}`, "", { strong: app.strong })) return true;
  return ad.platform === "tiktok" && !(app.weak?.length) && (app.slug?.length ?? 0) >= 7;
}

/** Jours de diffusion d'une pub : de sa première à sa dernière apparition (ou aujourd'hui si active). */
export function adRunDays(ad: Pick<AdInput, "firstShownAt" | "lastShownAt" | "active">, now: number): number | null {
  if (ad.firstShownAt === undefined) return null;
  const end = ad.active ? now : (ad.lastShownAt ?? ad.firstShownAt);
  return Math.max(1, Math.round((end - ad.firstShownAt) / DAY) + 1);
}

// ─── Instagram ───────────────────────────────────────────────────────────────

export type IgReel = {
  code: string;
  url: string;
  publishedAt: number;
  views: number;
  likes: number;
  comments: number;
  durationSec?: number;
  coverUrl?: string;
  /** Texte incrusté avec l'outil d'Instagram (le hook), s'il y en a un. */
  hook?: string;
};

/** Un Reel de `/v1/instagram/user/reels` (`items[i].media`). La légende n'y est pas. */
export function parseIgReel(raw: unknown): IgReel | null {
  const m = obj(obj(raw)?.media) ?? obj(raw);
  const code = str(m?.code);
  const takenAt = num(m?.taken_at);
  if (!m || !code || takenAt <= 0) return null;
  const clips = obj(m.clips_metadata);
  const rawHook = str(clips?.reusable_text_attribute_string)?.replace(/\s+/g, " ").trim();
  const hook = rawHook ? cleanText(rawHook, 200) : undefined;
  const cover = obj(arr(obj(m.image_versions2)?.candidates)[0]);
  const duration = num(m.video_duration);
  return {
    code,
    url: `https://www.instagram.com/reel/${code}/`,
    publishedAt: takenAt * 1000,
    views: num(m.play_count) || num(m.ig_play_count),
    likes: num(m.like_count),
    comments: num(m.comment_count),
    ...(duration > 0 ? { durationSec: Math.round(duration * 10) / 10 } : {}),
    ...(str(cover?.url) ? { coverUrl: str(cover?.url) } : {}),
    ...(hook ? { hook } : {}),
  };
}

/** Abonnés d'un profil Instagram (`/v1/instagram/profile`), `undefined` s'il est illisible. */
export function igFollowers(body: unknown): number | undefined {
  const user = obj(obj(obj(body)?.data)?.user);
  const n = obj(user?.edge_followed_by)?.count;
  return typeof n === "number" && Number.isFinite(n) ? n : undefined;
}

// ─── Transcriptions ──────────────────────────────────────────────────────────

/**
 * Le texte dit dans une vidéo (`/v1/tiktok/video/transcript`) : les segments mis
 * bout à bout, sinon le WebVTT sans ses horodatages. `null` s'il n'y a rien.
 */
export function transcriptText(body: unknown): string | null {
  const b = obj(body);
  const segs = arr(b?.transcript_with_timestamp)
    .map((x) => str(obj(x)?.text)?.trim())
    .filter((x): x is string => !!x);
  let text = segs.join(" ");
  if (!text) {
    const vtt = str(b?.transcript) ?? "";
    text = vtt
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && l !== "WEBVTT" && !/-->/.test(l) && !/^\d+$/.test(l))
      .join(" ");
  }
  text = text.replace(/\s+/g, " ").trim();
  return text ? cleanText(text, 3_000) : null;
}

/** Transcrite si elle dure au plus 2 minutes (au-delà, l'IA coûte 10 crédits la minute). */
export const TRANSCRIPT_MAX_SEC = 120;

/** Un signal tel que la base le range, ce qu'il faut pour le ranger dans la file des transcriptions. */
export type TranscriptRow = {
  platform: string;
  url: string;
  transcribedAt?: number;
  subtitlesCheckedAt?: number;
  durationSec?: number;
  appId?: string;
  caption: string;
  hook?: string;
  authorHandle: string;
  views: number;
};
export type TranscriptApp = AppRule & { _id: string; status: string; rivalOf: readonly string[] };
/** Un signal de la file : `checked`, sa page publique a déjà été lue sans sous-titres natifs à prendre. */
export type TranscriptRanked<R> = { row: R; checked: boolean };

/**
 * Un carrousel photo (`/@x/photo/<id>`) n'a rien à transcrire. Instantané du 20/11/2026 : le payant en avait
 * transcrit 26, aucun avec un mot (ni un crédit : il ne coûte que quand il rend un texte) ; leur page publique ne
 * porte pas de vidéo (radarFreeMath.videoDetail). 1 462 des 19 709 signaux TikTok en sont, et ils prenaient la tête
 * de la file (5 des 40 premiers) : la voie gratuite les relisait à chaque passage, le payant y perdait ses appels.
 */
const isPhotoPost = (url: string): boolean => url.includes("/photo/");

/**
 * La file des transcriptions (cf radarSources.dueTranscripts) : les signaux TikTok pas encore transcrits, ceux qui
 * citent une concurrente d'abord, puis une autre app suivie, puis la découverte ; les plus vus d'abord dans chaque
 * rang. Jamais une vidéo d'un compte suivi qui ne cite aucune app (elle n'est montrée nulle part), ni un « texte sur
 * plan » de 12 secondes ou moins (personne n'y parle), ni un carrousel photo. Du 06 au 09/11/2026, triées par vues
 * seules, 37 transcriptions utiles sur 173 et 18 % des vidéos de concurrents couvertes.
 */
export function rankTranscripts<R extends TranscriptRow>(rows: readonly R[], apps: readonly TranscriptApp[]): TranscriptRanked<R>[] {
  const byId = new Map(apps.map((a) => [a._id, a]));
  const active = apps.filter((a) => a.status === "active");
  const ranked: { row: R; rank: number }[] = [];
  for (const r of rows) {
    if (r.platform !== "tiktok" || r.transcribedAt !== undefined || isTextOnShot(r) || isPhotoPost(r.url)) continue;
    if (r.durationSec !== undefined && r.durationSec > TRANSCRIPT_MAX_SEC) continue;
    const own = r.appId ? byId.get(r.appId) : undefined;
    const text = { caption: r.caption, hook: r.hook, handle: r.authorHandle };
    const cited = own ? (videoCitesApp(text, own) ? own : videoApp(text, active)) : undefined;
    if (own && !cited) continue;
    ranked.push({ row: r, rank: cited ? (cited.rivalOf.length > 0 ? 0 : 1) : 2 });
  }
  return ranked
    .sort((a, b) => a.rank - b.rank || b.row.views - a.row.views)
    .map(({ row }) => ({ row, checked: row.subtitlesCheckedAt !== undefined }));
}

/**
 * Ce qu'un passage prend de la file, dans son ordre : les `free` premiers signaux dont la page n'a jamais été lue (la
 * voie gratuite, et le payant si elle se ferme), et les `paid` premiers de ceux déjà lus sans sous-titres (le payant).
 */
export function transcriptQueue<R>(ranked: readonly TranscriptRanked<R>[], free: number, paid: number): TranscriptRanked<R>[] {
  let f = 0;
  let p = 0;
  return ranked.filter((x) => (x.checked ? p++ < paid : f++ < free));
}

// ─── Les sous-titres natifs : la voie gratuite ───────────────────────────────

/**
 * LES SOUS-TITRES NATIFS DE TIKTOK (20/11/2026). La page publique d'une vidéo (celle du relevé gratuit, radarFreeMath)
 * porte ses pistes de sous-titres (`itemStruct.video.subtitleInfos`) : des WebVTT servis sans cookie (0,4 à 1 Ko),
 * chacun avec sa langue (`LanguageCodeName`, « spa-ES ») et sa source — « ASR » : la reconnaissance vocale, dans la
 * langue PARLÉE ; « MT » : une traduction automatique de celle-ci (« eng-US » d'une vidéo parlée en allemand). La
 * langue parlée est dite à côté (`claInfo.originalLanguageInfo.language`) ; `textLanguage`, lui, est celle de la
 * LÉGENDE (« en » sur une vidéo parlée en espagnol, relevé le 20/11).
 * Le transcript payant (`/v1/tiktok/video/transcript`) rend ces sous-titres natifs quand ils existent, l'IA sinon.
 *
 * Bancs du 20/11/2026, côte à côte (scripts/radar-bancs/transcriptions.ts, du poste) : 40 vidéos transcrites en payant
 * les 14 et 15/11 (67 pages), puis 200 tirées à graine fixe parmi les 260 plus récentes encore en ligne (303 pages).
 * Sur les 200 : 103 portent une piste ASR dans la langue parlée ; 101 rendent AU CARACTÈRE PRÈS le texte rangé par le
 * payant (15 langues) ; les 2 autres sont parlées en malais — le payant avait rangé la traduction anglaise (MT), ou une
 * transcription par l'IA plus juste que la piste ASR (« senarai » et non « sejarah »), comme au premier banc (1 sur
 * 1) : le malais n'est pas pris (TRANSCRIPT_FREE_LANGS). 52 n'ont aucune piste, 32 une piste « MT » seule, 4 sont
 * refusées (région, vérification) : le payant les transcrit, comme avant. 9 sont supprimées depuis. Les 32 « MT »
 * seules portent toutes une piste dans la langue parlée de Version « 8:… » : des sous-titres d'origine repris par le
 * créateur (claInfo.captionInfos : isOriginalCaption, isAutoGen faux), pas une traduction ; lues à part (mode « mt »),
 * 29 sur 31 rendent le texte payant (écarts : malais, filipino). Non prises : à prouver par leur propre banc.
 * Mesuré du poste : ce que TikTok sert aux serveurs Convex, `radarUsage.saved.transcript` le dira.
 */
export type SubtitleTrack = { lang: string; source: string; url: string };
export type SubtitlesPage = { kind: "subs"; tracks: SubtitleTrack[]; spoken?: string } | { kind: "refused"; reason: UnavailableReason } | { kind: "other" };

/**
 * Les pistes de sous-titres WebVTT d'une page vidéo, ou le refus de TikTok ; « other » : page servie sans vidéo ;
 * `null` si la page ne se lit pas.
 */
export function parseVideoSubtitles(html: string): SubtitlesPage | null {
  const d = videoDetail(html);
  if (!d) return null;
  if (d === "other") return { kind: "other" };
  if (!d.item) return d.status !== 0 ? { kind: "refused", reason: reasonOf(d.status, d.statusMsg) } : null;
  const video = obj(d.item.video) ?? {};
  const tracks: SubtitleTrack[] = [];
  for (const raw of arr(video.subtitleInfos)) {
    const t = obj(raw);
    const url = typeof t?.Url === "string" ? t.Url.trim() : "";
    const lang = typeof t?.LanguageCodeName === "string" ? t.LanguageCodeName.trim() : "";
    if (!t || !url.startsWith("https://") || !lang || String(t.Format ?? "").toLowerCase() !== "webvtt") continue;
    tracks.push({ lang, source: typeof t.Source === "string" ? t.Source.trim().toUpperCase() : "", url });
  }
  const spoken = obj(obj(video.claInfo)?.originalLanguageInfo)?.language;
  return { kind: "subs", tracks, ...(typeof spoken === "string" && spoken.trim() ? { spoken: spoken.trim() } : {}) };
}

const baseLang = (l: string): string => l.toLowerCase().split("-")[0];

/**
 * La piste à lire : la reconnaissance vocale (« ASR ») dans la langue parlée — la même langue, sinon la même langue
 * de base (« spa-MX » pour « spa-ES »). Jamais une traduction automatique (« MT ») : ce n'est pas ce qui est dit.
 * Langue parlée inconnue : la piste ASR si elle est seule ; plusieurs, on ne choisit pas (le payant le fera).
 */
export function asrTrack(subs: { tracks: readonly SubtitleTrack[]; spoken?: string }): SubtitleTrack | null {
  const asr = subs.tracks.filter((t) => t.source === "ASR");
  const spoken = subs.spoken;
  if (!spoken) return asr.length === 1 ? asr[0] : null;
  return asr.find((t) => t.lang === spoken) ?? asr.find((t) => baseLang(t.lang) === baseLang(spoken)) ?? null;
}

/**
 * Les langues (code de base de la piste ASR) où la voie gratuite est PROUVÉE neutre : aux deux bancs du 20/11/2026,
 * chaque texte gratuit dans l'une d'elles est identique au caractère au texte payant (au moins un cas, aucun écart ;
 * 101 sur 101 au banc de 200 : eng 39, spa 11, fra 10, por 7, ita 6, vie 6, ron 5, ces 4, deu 4, ind 3, tha 2, rus,
 * hun, kor, nld 1). Le malais (« msa ») : 3 écarts sur 3 — le payant y rangeait la traduction anglaise ou le texte
 * de son IA, plus juste que la piste ASR de TikTok.
 */
export const TRANSCRIPT_FREE_LANGS: readonly string[] = ["ces", "deu", "eng", "fra", "hun", "ind", "ita", "kor", "nld", "por", "ron", "rus", "spa", "tha", "vie"];
/**
 * Mode mesure (« qualité avant crédits ») : faux, une piste ASR dans une autre langue (le malais, écart prouvé ; une
 * langue jamais vue au banc) n'est pas prise — la décision est comptée (`free.held`), la vidéo marquée sans que son
 * WebVTT soit lu, et le payant la transcrit comme avant. Vrai seulement après un banc qui les prouve.
 */
export const TRANSCRIPT_FREE_ANY_LANG = false;

/**
 * Les répliques d'un WebVTT, dans l'ordre (les lignes de chaque bloc horodaté, jointes ; balises retirées) ; `null`
 * si ce n'est pas un WebVTT (page d'erreur, corps vide). L'en-tête, les blocs NOTE ou STYLE et les identifiants de
 * réplique ne sont pas du texte dit.
 */
export function webvttCues(body: string): string[] | null {
  const text = body.replace(/^﻿/, "").replace(/\r\n?/g, "\n");
  if (!/^WEBVTT(?:[ \t\n]|$)/.test(text)) return null;
  const cues: string[] = [];
  for (const block of text.split(/\n[ \t]*\n/)) {
    const lines = block.split("\n");
    const at = lines.findIndex((l) => l.includes("-->"));
    if (at < 0) continue;
    const cue = lines
      .slice(at + 1)
      .join(" ")
      .replace(/<[^>]*>/g, "")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .trim();
    if (cue) cues.push(cue);
  }
  return cues;
}

/**
 * Le texte des répliques, mis en forme EXACTEMENT comme celui du transcript payant (`transcriptText`, ses segments
 * bout à bout) : la base ne voit pas d'où il vient. `null` s'il n'y a rien.
 */
export const webvttText = (cues: readonly string[]): string | null => transcriptText({ transcript_with_timestamp: cues.map((text) => ({ text })) });

/** Les refus de TikTok qui disent que la vidéo n'est plus publique : le transcript payant n'y lirait rien non plus. */
export const SUBS_GONE: readonly UnavailableReason[] = ["removed", "private", "restricted"];

/**
 * Ce que la page publique a donné pour une vidéo :
 *  text : sa piste ASR, mise en forme · gone : supprimée ou plus publique (TikTok le dit) — rien à transcrire ·
 *  checked : page lue, rien à prendre (pas de piste ASR, traduction seule, piste vide ; page servie sans vidéo ;
 *    ou TikTok ne nous la sert pas : région, vérification, page absente ; `held` : la piste ASR est dans une langue
 *    que le banc n'a pas prouvée, TRANSCRIPT_FREE_LANGS) — le payant la prendra · miss : page ou
 *    WebVTT qui manque (`refused` : refusé ou servi sans ses données, compté pour le coupe-circuit) — le payant tout
 *    de suite, la voie gratuite la relira au passage suivant.
 * Une page servie AVEC ses données mais sans vidéo (« page sans vidéo ») n'est pas un refus : TikTok répond, et la
 * relire rendrait la même chose — elle est marquée une fois, et ne pèse pas sur le coupe-circuit.
 */
export type FreeSubs =
  | { kind: "text"; text: string; lang: string }
  | { kind: "gone" }
  | { kind: "checked"; why: string; held?: string }
  | { kind: "miss"; refused: boolean; reason: string };

/**
 * La transcription d'une vidéo par ses sous-titres natifs : sa page, puis le WebVTT de sa piste ASR (deux pages, une
 * à la fois : `page` porte la pause et le second essai).
 */
export async function freeTranscript(url: string, page: (url: string) => Promise<FreePage>): Promise<FreeSubs> {
  const p = await page(url);
  if (!p.ok) return p.kind === "absent" ? { kind: "checked", why: "page absente" } : { kind: "miss", refused: true, reason: p.reason ?? "page refusée" };
  const subs = parseVideoSubtitles(p.text);
  if (!subs) return { kind: "miss", refused: true, reason: "page sans données" };
  if (subs.kind === "other") return { kind: "checked", why: "page sans vidéo" };
  if (subs.kind === "refused") return SUBS_GONE.includes(subs.reason) ? { kind: "gone" } : { kind: "checked", why: `refus : ${subs.reason}` };
  const track = asrTrack(subs);
  if (!track) {
    const why = subs.tracks.length === 0 ? "aucune piste" : subs.tracks.some((t) => t.source === "ASR") ? "piste ASR d'une autre langue" : "traduction seule";
    return { kind: "checked", why };
  }
  if (!TRANSCRIPT_FREE_ANY_LANG && !TRANSCRIPT_FREE_LANGS.includes(baseLang(track.lang))) return { kind: "checked", why: "langue non prouvée", held: track.lang };
  const v = await page(track.url);
  if (!v.ok) return { kind: "miss", refused: v.kind === "suspect", reason: `WebVTT ${v.kind === "absent" ? "absent" : (v.reason ?? "refusé")}` };
  const cues = webvttCues(v.text);
  if (!cues) return { kind: "miss", refused: true, reason: "WebVTT illisible" };
  const text = webvttText(cues);
  return text ? { kind: "text", text, lang: track.lang } : { kind: "checked", why: "piste vide" };
}

/** Le transcript payant d'une vidéo (ScrapeCreators), dans la forme de ses appels. */
export type PaidTranscript =
  | { ok: true; value: string | null; credits: number; creditsRemaining?: number }
  | { ok: false; credits: number; noCredits: boolean; error: string; creditsRemaining?: number };

export type TranscriptIo<S> = {
  /** Une page publique de TikTok : la pause avant chacune et le second essai compris. */
  page: (url: string) => Promise<FreePage>;
  paid: (s: S) => Promise<PaidTranscript>;
  /** Range le texte d'un signal (`null` : rien à transcrire, il ne sera plus pris), ou « lu sans sous-titres ». */
  apply: (s: S, r: { text: string | null } | "checked") => Promise<void>;
  /** Faux quand la voie gratuite a fait son temps. */
  alive: () => boolean;
};

export type TranscriptPass = {
  /** `held` : parmi `checked`, les pistes ASR laissées au payant faute de banc dans leur langue (mode mesure). */
  free: { pages: number; texts: number; gone: number; checked: number; held: number; missed: number; stopped: string | null };
  paid: { calls: number; credits: number; errors: number; creditsRemaining?: number; lastError?: string };
  /**
   * Appels payants évités (radarUsage.saved.transcript) : les vidéos transcrites par leur page publique parmi les
   * `paid` premières de la file — celles que le payant aurait prises à ce passage sans la voie gratuite. 0 quand le
   * poste est coupé : rien n'aurait été payé. Une vidéo supprimée n'en est pas un : le transcript payant ne coûte rien
   * quand il ne rend pas de texte (du 06 au 15/11/2026, les crédits du poste égalent chaque jour les transcriptions
   * AVEC texte : 25/25, 50/50… 27/27). Les autres textes gratuits sont de la couverture en plus (`free.texts`).
   */
  saved: number;
};

/**
 * Pages vidéo lues au plus par passage de transcriptions (toutes les 2 heures), chacune suivie d'au plus un WebVTT :
 * 40 × 12 passages = 480 par jour, le rythme du contrôle de visibilité (radarAvailabilityMath.CHECKS_PER_RUN, 40
 * toutes les 2 heures), qui lit les mêmes pages depuis les mêmes serveurs. Le flux tient dedans : le 20/11/2026
 * (banc, mode « file », carrousels photo écartés), 424 signaux attendaient dans la file d'un passage, et 146 à 284 y
 * entraient chaque jour du 15 au 19/11 ; le retard se rattrape en deux jours, puis chaque vidéo est lue une fois (une
 * page servie sans vidéo comprise : elle est marquée, freeTranscript).
 */
export const TRANSCRIPT_FREE_PAGES = 40;
/** La voie gratuite s'arrête au bout de ce temps : le payant passe ensuite (une tâche est coupée à 10 minutes). */
export const TRANSCRIPT_FREE_MAX_MS = 4 * 60_000;

/**
 * Un passage de transcriptions. LA VOIE GRATUITE d'abord, qui ne dépend ni du budget ni du solde : les signaux de la
 * file jamais lus sur leur page, un à la fois, TRANSCRIPT_FREE_PAGES au plus, tant que `alive()` ; elle se ferme
 * après STORE_BREAKER pages refusées d'affilée (TikTok ne nous sert plus). PUIS LE PAYANT, dans la limite de `paid`
 * (allowance : 0 quand le poste est éteint ou coupé) et dans l'ordre de la file : les signaux déjà lus sans
 * sous-titres natifs, ceux dont la page a manqué, et — voie fermée seulement — ceux qu'elle n'a pas atteints.
 * Ceux qu'elle n'a pas eu le temps de prendre attendent le passage suivant, gratuit.
 */
export async function transcriptPass<S extends { url: string; checked: boolean }>(
  due: readonly S[],
  io: TranscriptIo<S>,
  limits: { pages: number; paid: number },
): Promise<TranscriptPass> {
  const free: TranscriptPass["free"] = { pages: 0, texts: 0, gone: 0, checked: 0, held: 0, missed: 0, stopped: null };
  // Ce que le payant aurait pris à ce passage sans la voie gratuite : la tête de la file, dans sa limite.
  const head = new Set(due.slice(0, Math.max(0, limits.paid)));
  let saved = 0;
  const settled = new Set<S>();
  const tried = new Set<S>();
  let streak = 0;
  for (const s of due) {
    if (s.checked) continue;
    if (free.stopped !== null || free.pages >= limits.pages || !io.alive()) break;
    free.pages++;
    const r = await freeTranscript(s.url, io.page);
    streak = r.kind === "miss" && r.refused ? streak + 1 : 0;
    if (r.kind === "text" || r.kind === "gone") {
      await io.apply(s, { text: r.kind === "text" ? r.text : null });
      settled.add(s);
      if (r.kind === "text") {
        free.texts++;
        if (head.has(s)) saved++;
      } else free.gone++;
      continue;
    }
    tried.add(s);
    if (r.kind === "checked") {
      free.checked++;
      if (r.held) free.held++;
      await io.apply(s, "checked");
    } else {
      free.missed++;
      if (streak >= STORE_BREAKER) free.stopped = `${STORE_BREAKER} pages refusées d'affilée (${r.reason})`;
    }
  }
  const open = free.stopped === null;
  const queue = due.filter((s) => !settled.has(s) && (s.checked || tried.has(s) || !open)).slice(0, Math.max(0, limits.paid));
  const paid: TranscriptPass["paid"] = { calls: 0, credits: 0, errors: 0 };
  for (const s of queue) {
    const r = await io.paid(s);
    paid.calls++;
    paid.credits += r.credits;
    if (r.creditsRemaining !== undefined) paid.creditsRemaining = r.creditsRemaining;
    if (!r.ok) {
      paid.errors++;
      paid.lastError = r.error;
      if (r.noCredits) break;
      // Vidéo supprimée ou illisible : on ne repaie pas à chaque passage.
      await io.apply(s, { text: null });
      continue;
    }
    await io.apply(s, { text: r.value });
  }
  return { free, paid, saved };
}
