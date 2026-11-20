/**
 * RADAR — LE RELEVÉ GRATUIT D'UN COMPTE, sur les pages publiques de TikTok. Règles pures.
 *
 * Pourquoi : le relevé d'un compte par le fournisseur de données coûte 1 crédit, et fait 88 % de la facture
 * (13/11/2026 : 1 333 relevés par jour pour 2 162 comptes, 87 $ par mois ; 15 000 comptes en coûteraient 600).
 * Or ce qu'il rend se lit aussi, sans clé, sur deux pages publiques :
 *  - la page d'intégration du profil (`/embed/@pseudo`) : abonnés, bio, et ses 10 à 13 dernières vidéos avec leurs
 *    vues, leur légende, leur miniature ;
 *  - la page d'une vidéo (`/@pseudo/video/<id>`) : j'aime, commentaires, partages, enregistrements, son, texte à
 *    l'écran, pays, langue, durée.
 *
 * Mesuré le 13/11/2026 contre les relevés payants : sur 500 comptes, 495 lus du premier coup (les 5 autres
 * n'existent plus), 96,4 % des vidéos de la semaine retrouvées, aucun compteur de vues en retard sur 1 665, bio
 * identique 493 fois sur 495 ; sur 300 vidéos, 298 lues, date et son identiques. UNE différence : quand une vidéo
 * porte plusieurs textes à l'écran, ils n'arrivent pas dans le même ordre (24 vidéos sur 148) — une vidéo déjà
 * connue garde donc le texte qu'elle a en base.
 *
 * Comment : le profil donne la liste. Une vidéo INCONNUE, ou de moins de 48 heures, est lue sur sa page (tout ce
 * que le relevé payant donnait) ; les autres ne reçoivent que leurs vues. Dès qu'une page manque — profil refusé,
 * compte privé ou vide, vidéo inconnue illisible — le compte est relevé par le fournisseur, comme avant : la
 * qualité ne dépend jamais de la page gratuite. Et après FREE_BREAKER refus d'affilée, le passage finit en payant.
 *
 * Mesuré le 13/11/2026 sur TOUTE la flotte (2 210 comptes actifs, 6 305 pages en 10 minutes) : 2 063 profils lus du
 * premier coup, 78 de plus au second essai, les 4 095 pages vidéo lues ; 67 profils « absents » alors que le
 * fournisseur les relève sans erreur (TikTok ne sert pas leur page d'intégration) et 9 listes vides → 3,5 % des
 * comptes restent au relevé payant. Un profil « absent » n'est donc PAS un compte disparu.
 */
import { CURVE_COUNTS, CURVE_PAGES_PER_PASS, cleanText, langBucket, mentionLabel, type CurveCounts, type SignalInput } from "./radarSignalsMath";
import { cutJson } from "./radarStoreMath";
import { isTikTokVideoId, reasonOf, type UnavailableReason } from "./radarAvailabilityMath";
import { SELF_SEE_STATUS_CODE, parseTikTokPublicPage, refusalLabel } from "./tiktokPublicPage";

const HOUR = 3_600_000;

export const freeProfileUrl = (handle: string): string => `https://www.tiktok.com/embed/@${handle}`;
export const freeVideoUrl = (handle: string, videoId: string): string => `https://www.tiktok.com/@${handle}/video/${videoId}`;

/** Une vidéo de moins de 48 heures est relue en entier à chaque relevé : c'est là que ses chiffres bougent. */
export const FREE_FRESH_MS = 48 * HOUR;
/** Refus d'affilée (profil non servi) qui font finir le passage en payant. */
export const FREE_BREAKER = 6;
/** Comptes relevés au plus par passage quand le relevé est gratuit (le payant, lui, suit le budget). */
export const FREE_READS_PER_RUN = 600;

const obj = (x: unknown): Record<string, unknown> | null => (x !== null && typeof x === "object" && !Array.isArray(x) ? (x as Record<string, unknown>) : null);
const str = (x: unknown): string => (typeof x === "string" ? x : "");
const num = (x: unknown): number => {
  const n = typeof x === "number" ? x : typeof x === "string" && x.trim() !== "" ? Number(x) : NaN;
  return Number.isFinite(n) && n > 0 ? Math.round(n) : 0;
};

/** La date de publication d'une vidéo, lue dans son identifiant (ses 32 bits de poids fort sont des secondes). */
export function videoIdTime(videoId: string): number {
  try {
    return Number(BigInt(videoId) >> BigInt(32)) * 1000;
  } catch {
    return 0;
  }
}

export type FreeListed = { videoId: string; caption: string; views: number; publishedAt: number; coverUrl?: string };
export type FreeProfile = { fans: number; bio: string; private: boolean; videos: FreeListed[] };

/** Le profil public d'un compte : abonnés, bio, et ses dernières vidéos (les plus récentes d'abord). `null` si la page ne se lit pas. */
export function parseFreeProfile(html: string): FreeProfile | null {
  const list = cutJson(html, '"videoList":');
  const ui = obj(cutJson(html, '"userInfo":'));
  if (!Array.isArray(list) || !ui) return null;
  const videos: FreeListed[] = [];
  for (const raw of list) {
    const v = obj(raw);
    const videoId = str(v?.id);
    const publishedAt = videoIdTime(videoId);
    if (!v || !/^\d{15,}$/.test(videoId) || publishedAt <= 0 || videos.some((x) => x.videoId === videoId)) continue;
    const coverUrl = str(v.coverUrl) || str(v.originCoverUrl);
    videos.push({ videoId, caption: str(v.desc), views: num(v.playCount), publishedAt, ...(coverUrl ? { coverUrl } : {}) });
  }
  videos.sort((a, b) => b.publishedAt - a.publishedAt);
  return { fans: num(ui.followerCount), bio: cleanText(str(ui.signature), 300), private: ui.privateAccount === true, videos };
}

const REHYDRATION = /<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application\/json">([\s\S]*?)<\/script>/;

/**
 * Ce que la page publique d'une vidéo dit d'elle : la vidéo (`item`), ou le refus de TikTok (`status` non nul, et son
 * motif). « other » : la page est servie avec ses données, mais sans vidéo (un carrousel photo : app-context,
 * biz-context, i18n-translation, seo.abtest, a-b, pas de `webapp.video-detail` — 2 pages relevées le 20/11/2026).
 * `null` : la page ne se lit pas.
 */
export function videoDetail(html: string): { item: Record<string, unknown> | null; status: number; statusMsg: string } | "other" | null {
  const m = REHYDRATION.exec(html);
  if (!m) return null;
  let scopes: Record<string, unknown> | null = null;
  try {
    scopes = obj(obj(JSON.parse(m[1]))?.__DEFAULT_SCOPE__);
  } catch {
    return null;
  }
  if (!scopes) return null;
  const scope = obj(scopes["webapp.video-detail"]);
  if (!scope) return "other";
  return { item: obj(obj(scope.itemInfo)?.itemStruct), status: typeof scope.statusCode === "number" ? scope.statusCode : 0, statusMsg: str(scope.statusMsg) };
}

/**
 * La page publique d'une vidéo, mise dans la forme d'un relevé. « gone » : TikTok dit que la vidéo n'est plus là
 * (supprimée, privée) ; `null` : la page ne se lit pas.
 */
export function parseFreeVideo(html: string, handle: string, fallbackLang?: string): SignalInput | "gone" | null {
  const detail = videoDetail(html);
  if (!detail || detail === "other") return null;
  const it = detail.item;
  if (!it) return detail.status !== 0 ? "gone" : null;
  const videoId = str(it.id);
  const createTime = num(it.createTime);
  if (!videoId || createTime <= 0) return null;
  const author = obj(it.author) ?? {};
  const authorId = str(author.id);
  const authorStats = obj(it.authorStats) ?? {};
  const stats = obj(it.stats) ?? {};
  const video = obj(it.video) ?? {};
  const music = obj(it.music) ?? {};
  const caption = str(it.desc);
  const region = str(it.locationCreated);
  // Le texte à l'écran : chaque bloc sur une ligne, les blocs séparés comme le fait le relevé payant.
  const texts: string[] = [];
  for (const s of Array.isArray(it.stickersOnItem) ? it.stickersOnItem : []) {
    for (const t of Array.isArray(obj(s)?.stickerText) ? (obj(s)!.stickerText as unknown[]) : []) {
      const line = str(t).replace(/\s+/g, " ").trim();
      if (line) texts.push(line);
    }
  }
  const hook = cleanText(texts.join(" · "), 200);
  const mentions: { id: string; label: string }[] = [];
  for (const t of Array.isArray(it.textExtra) ? it.textExtra : []) {
    const e = obj(t);
    const id = str(e?.userId);
    if (!e || !id || id === authorId || mentions.some((x) => x.id === id)) continue;
    const label = mentionLabel(caption, num(e.start), num(e.end));
    if (label && label.length >= 3) mentions.push({ id, label: cleanText(label, 60) });
  }
  const musicId = str(music.id);
  const musicTitle = str(music.title);
  const musicOwner = str(music.authorName);
  const duration = num(video.duration);
  const coverUrl = str(video.cover) || str(video.originCover);
  const bio = str(author.signature);
  return {
    videoId,
    url: freeVideoUrl(handle, videoId),
    authorId: authorId || handle,
    authorHandle: handle,
    authorFans: num(authorStats.followerCount),
    caption,
    lang: langBucket(str(it.textLanguage) || undefined, region || undefined, fallbackLang),
    ...(region ? { region } : {}),
    publishedAt: createTime * 1000,
    ...(duration > 0 ? { durationSec: duration } : {}),
    ...(coverUrl ? { coverUrl } : {}),
    isAd: it.isAd === true,
    views: num(stats.playCount),
    likes: num(stats.diggCount),
    comments: num(stats.commentCount),
    shares: num(stats.shareCount),
    saves: num(stats.collectCount),
    ...(hook ? { hook } : {}),
    ...(musicId ? { musicId } : {}),
    ...(musicTitle ? { musicTitle: cleanText(musicTitle, 120) } : {}),
    ...(musicOwner ? { musicOwner } : {}),
    ...(mentions.length ? { mentions: mentions.slice(0, 10) } : {}),
    ...(bio ? { authorBio: cleanText(bio, 300) } : {}),
  };
}

/**
 * Ce qu'on sait déjà d'une vidéo du compte : son texte à l'écran et son son, tels que rangés, si son pays est connu,
 * et sa VRAIE date de publication (`publishedAt`, lue sur sa page ou au relevé payant).
 */
export type KnownVideo = { videoId: string; hook?: string; musicId?: string; musicTitle?: string; region?: string; publishedAt?: number };
/** Vidéos déjà rangées relues en entier pour situer un compte dont on ne connaît pas encore le pays. */
export const FREE_REGION_PAGES = 2;
/** Une vidéo connue et plus toute neuve : seules ses vues (et sa miniature, qui expire) sont rafraîchies. */
export type LightVideo = { videoId: string; views: number; coverUrl?: string };

/**
 * Ce qu'il faut lire en entier, et ce qui ne reçoit que ses vues : une vidéo inconnue, ou de moins de 48 heures,
 * est lue sur sa page ; les autres sont déjà rangées, leurs vues suffisent. `wantRegion` : le compte n'a pas encore
 * de pays — ses deux vidéos rangées les plus récentes dont on ignore le pays sont relues elles aussi (le pays d'une
 * vidéo ne se lit que sur sa page).
 *
 * « Moins de 48 heures » se juge sur la date de PUBLICATION quand on la connaît. La liste ne donne que la date lue
 * dans l'identifiant, qui est celle du TÉLÉVERSEMENT : une vidéo programmée la porte des jours avant de sortir
 * (14/11/2026 : @catsen191, 9 vidéos téléversées le 12, publiées du 12 au 14), et passait pour vieille dès sa sortie.
 */
export function freePlan(listed: readonly FreeListed[], known: readonly KnownVideo[], now: number, wantRegion = false): { detail: FreeListed[]; light: LightVideo[] } {
  const have = new Map(known.map((k) => [k.videoId, k]));
  const detail: FreeListed[] = [];
  const light: LightVideo[] = [];
  let forRegion = wantRegion ? FREE_REGION_PAGES : 0;
  for (const v of listed) {
    const k = have.get(v.videoId);
    const fresh = now - (k?.publishedAt ?? v.publishedAt) < FREE_FRESH_MS;
    const locate = !!k && !fresh && !k.region && forRegion > 0;
    if (locate) forRegion--;
    if (!k || fresh || locate) detail.push(v);
    else light.push({ videoId: v.videoId, views: v.views, ...(v.coverUrl ? { coverUrl: v.coverUrl } : {}) });
  }
  return { detail, light };
}

/** `reason` : ce que TikTok a répondu quand il n'a pas servi la page (« HTTP 429 »), pour le dire à l'arrêt. */
export type FreePage = { ok: true; text: string } | { ok: false; kind: "absent" | "suspect"; reason?: string };

/** Attente avant le second essai d'une page refusée. */
export const FREE_RETRY_MS = 2_500;

/**
 * Une page refusée est redemandée UNE fois, après une pause. Mesuré le 13/11/2026 sur les 2 210 comptes suivis, à
 * 10 pages par seconde : 80 profils refusés (« ratelimit triggered »), par rafales de 5 à 20 secondes, jamais plus
 * de 4 d'affilée ; relus ensuite, 78 passent. Une page « absente » n'est pas redemandée : c'est une réponse.
 */
export function retrying(page: (url: string) => Promise<FreePage>, pause: () => Promise<void>): (url: string) => Promise<FreePage> {
  return async (url) => {
    const first = await page(url);
    if (first.ok || first.kind === "absent") return first;
    await pause();
    return page(url);
  };
}

/** La vidéo la plus récente qu'on a déjà de ce compte (sa vraie date de publication). */
export type NewestKnown = { videoId: string; publishedAt: number };

/**
 * Pourquoi le relevé gratuit n'a pas abouti — le compte passe alors au relevé payant :
 *  absent : le profil n'existe plus à cette adresse · suspect : TikTok n'a pas servi le profil ·
 *  private / empty : rien à lire sur le profil · detail : la page d'une vidéo inconnue ne s'est pas lue ·
 *  gap : la liste ne va pas jusqu'à la dernière vidéo qu'on a de lui (cf `listGap`), et rien ne prouve qu'elle est
 *  seulement supprimée (cf `gapGone`).
 */
export type FreeWhy = "absent" | "suspect" | "private" | "empty" | "detail" | "gap";

/**
 * `gapChecked` : la dernière vidéo connue manquait à la liste, et sa page dit qu'elle n'est plus en ligne (`gapGone`) :
 * le relevé a continué ; l'appelant la marque vérifiée (radarNetworks.markGapChecked), comme le relevé payant l'aurait fait.
 */
export type FreeRead =
  | { ok: true; videos: SignalInput[]; light: LightVideo[]; profile: { fans: number; bio: string }; pages: number; gapChecked?: string }
  | { ok: false; why: FreeWhy; pages: number; reason?: string; newest?: NewestKnown };

/**
 * La liste d'un profil ne donne que ses 10 à 13 dernières vidéos (le relevé payant, 9). Un compte qui en publie plus
 * entre deux relevés en perd : celles d'avant la liste ne seraient jamais vues. On le sait quand la vidéo la plus
 * récente qu'on avait de lui n'y est plus — elle a été poussée hors de la liste, ou supprimée (sa page le dit, cf
 * `gapGone` ; sinon le relevé payant, cf `gapChecked`). Le compte est alors relevé en payant, page après page,
 * jusqu'à la retrouver.
 */
export const listGap = (listed: readonly FreeListed[], newest: NewestKnown | null): boolean =>
  newest !== null && listed.length > 0 && !listed.some((v) => v.videoId === newest.videoId);

/** Pages payantes au plus pour combler un trou (9 vidéos chacune) : 3 crédits pour ~27 vidéos publiées entre deux relevés. */
export const GAP_PAGES = 3;

/**
 * Le relevé payant d'un trou peut s'arrêter : il a retrouvé la vidéo (`found`), ou il est passé avant sa date sans
 * la voir — elle n'est plus en ligne (`done` sans `found`).
 */
export function gapReached(videos: readonly { videoId: string; publishedAt: number }[], newest: NewestKnown): { done: boolean; found: boolean } {
  const found = videos.some((v) => v.videoId === newest.videoId);
  return { found, done: found || videos.some((v) => v.publishedAt < newest.publishedAt) };
}

/*
 * LE TROU VÉRIFIÉ SUR LA PAGE DE LA VIDÉO (20/11/2026). Le relevé payant d'un trou (1 à 3 crédits ; 12, 50, 72, 132,
 * 168, 178 et 101 crédits « trou » du 14 au 20/11) sert souvent à constater que la dernière vidéo connue a été
 * SUPPRIMÉE : au moins 290 des 718 crédits « trou » du 06 au 20/11 (étude du 20/11). Sa page publique le dit sans
 * crédit. Le trou n'en est pas un si, et seulement si, `gapGone` ET `listReaches` : le relevé gratuit continue, la
 * vidéo est marquée vérifiée (`gapChecked`), comme le relevé payant l'aurait fait. Sinon, payant comme avant.
 */

/**
 * La liste du profil remonte-t-elle au-delà de la dernière vidéo connue ? C'est la règle d'arrêt même du relevé payant
 * (`gapReached`) : une vidéo publiée AVANT elle y est, donc tout ce qui est sorti depuis y est aussi, et le payant
 * n'aurait rien lu de plus (sa première page, 9 vidéos, s'arrête dessus ; la liste en porte 10 à 13). Sinon, le compte
 * a pu publier plus que la liste depuis : vrai trou possible.
 * Les dates sont les VRAIES dates de publication, celles des vidéos déjà rangées (`known`) : la date d'une vidéo de la
 * liste, lue dans son identifiant, est celle du téléversement, qu'une vidéo programmée porte des heures ou des jours
 * avant de sortir (instantané du 20/11/2026 : 5 426 vidéos rangées sur 196 334 publiées plus d'une heure après, 2 537
 * plus d'un jour) ; elle ferait croire la liste plus longue qu'elle n'est. Une vidéo qu'on n'a pas ne compte donc pas.
 * Faiblesse partagée avec le relevé payant : une vidéo ÉPINGLÉE reste en tête de liste quelle que soit sa date, et,
 * plus ancienne que la dernière connue, fait « remonter » la liste sans couvrir ce qui est sorti entre les deux. Le
 * payant s'arrête sur elle de même (sa première page porte les épinglées) : la liste, plus longue, n'y perd rien de plus.
 */
export function listReaches(listed: readonly FreeListed[], known: readonly KnownVideo[], newest: NewestKnown): boolean {
  const ids = new Set(listed.map((v) => v.videoId));
  const dated: NewestKnown[] = [];
  for (const k of known) if (ids.has(k.videoId) && k.publishedAt !== undefined) dated.push({ videoId: k.videoId, publishedAt: k.publishedAt });
  return gapReached(dated, newest).done;
}

/** Ce que TikTok dit, sous le code 10204, d'une vidéo qui n'est plus publique pour de bon (tiktokPublicPage.refusalLabel). */
const GONE_LABELS: readonly string[] = ["supprimé", "visible par son autrice uniquement"];

/**
 * La page de la vidéo dit-elle qu'elle n'est plus publique ? Supprimée, « n'existe pas », visible par son autrice
 * seule : 10204 (les autres motifs servis sous ce code, réservée aux amis ou en vérification, prennent le libellé du
 * code : pas publiques non plus). Le relevé payant ne lit que ce qui est public : il ne l'aurait pas retrouvée.
 * Rien d'autre ne conclut : une page servie (la vidéo est en ligne — une vidéo « photo », que la liste d'intégration
 * ne porte pas, en est une), bloquée hors de sa région (10231, ou « cross_border » dans le message : elle existe
 * ailleurs), un code inconnu, une page illisible.
 */
export function gapGone(html: string, videoId: string): boolean {
  const r = parseTikTokPublicPage(html, videoId);
  return r.kind === "refused" && r.statusCode === SELF_SEE_STATUS_CODE && GONE_LABELS.includes(refusalLabel(r.statusCode, r.statusMsg));
}

/**
 * Pourquoi un relevé payant est parti, compté à part dans `radarUsage.reasons` (l'écran du budget le montre) :
 * premier (le premier relevé d'un compte), repli (le gratuit n'a pas abouti), trou (liste trouée, cf `listGap`),
 * retard / coupure (pas pris par la voie gratuite, cf `overflowToPay`), sonde (relire le solde sous la réserve).
 */
export type PaidReason = "premier" | "repli" | "trou" | "retard" | "coupure" | "sonde";

/**
 * Le relevé gratuit d'un compte, de bout en bout. `page` lit une adresse ; `known` dit ce qu'on a déjà de ces
 * vidéos ; `newest`, la plus récente qu'on a de lui (sans elle, pas de contrôle de la liste). Rend les vidéos lues
 * en entier (dans la forme du relevé payant), celles dont seules les vues bougent, et le profil — ou la raison de
 * passer au payant.
 */
export async function freeRead(
  handle: string,
  io: {
    page: (url: string) => Promise<FreePage>;
    known: (videoIds: string[]) => Promise<KnownVideo[]>;
    newest?: () => Promise<NewestKnown | null>;
  },
  now: number,
  fallbackLang?: string,
  // Le compte n'a pas encore de pays : on en profite pour situer deux de ses vidéos déjà rangées.
  wantRegion = false,
): Promise<FreeRead> {
  let pages = 1;
  const p = await io.page(freeProfileUrl(handle));
  if (!p.ok) return { ok: false, why: p.kind, pages, ...(p.reason ? { reason: p.reason } : {}) };
  const profile = parseFreeProfile(p.text);
  if (!profile) return { ok: false, why: "suspect", pages, reason: "page sans profil" };
  if (profile.private) return { ok: false, why: "private", pages };
  if (profile.videos.length === 0) return { ok: false, why: "empty", pages };
  // Avant toute page de vidéo : un trou dans la liste se comble en payant, ces pages-là seraient perdues.
  const newest = io.newest ? await io.newest() : null;
  const known = await io.known(profile.videos.map((v) => v.videoId));
  let gapChecked: string | undefined;
  if (newest && listGap(profile.videos, newest)) {
    // Sa page n'est lue que si la liste remonte au-delà d'elle : sinon, supprimée ou non, le trou reste possible.
    if (!listReaches(profile.videos, known, newest)) return { ok: false, why: "gap", pages, newest };
    pages++;
    const page = await io.page(freeVideoUrl(handle, newest.videoId));
    if (!page.ok || !gapGone(page.text, newest.videoId)) return { ok: false, why: "gap", pages, newest };
    gapChecked = newest.videoId;
  }
  const byId = new Map(known.map((k) => [k.videoId, k]));
  const plan = freePlan(profile.videos, known, now, wantRegion);
  const videos: SignalInput[] = [];
  const light = [...plan.light];
  for (const listed of plan.detail) {
    pages++;
    const page = await io.page(freeVideoUrl(handle, listed.videoId));
    const parsed = page.ok ? parseFreeVideo(page.text, handle, fallbackLang) : null;
    const before = byId.get(listed.videoId);
    const asLight = (): void => void light.push({ videoId: listed.videoId, views: listed.views, ...(listed.coverUrl ? { coverUrl: listed.coverUrl } : {}) });
    if (parsed === "gone" || (!page.ok && page.kind === "absent")) {
      // Une vidéo rangée et plus toute neuve n'était relue que pour situer le compte : sans sa page, ses vues
      // suffisent, comme à tout autre relevé. Sinon, supprimée entre la liste et sa page : elle n'est plus à relever.
      if (before && now - (before.publishedAt ?? listed.publishedAt) >= FREE_FRESH_MS) asLight();
      continue;
    }
    if (!parsed) {
      // Une vidéo qu'on n'a pas encore ne peut pas entrer à moitié : le compte passe au relevé payant.
      if (!before) return { ok: false, why: "detail", pages };
      asLight();
      continue;
    }
    // Les abonnés et la bio du profil font foi ; une vidéo déjà rangée garde son texte à l'écran et son son.
    const { hook, musicId, musicTitle, ...rest } = parsed;
    videos.push({
      ...rest,
      authorFans: profile.fans,
      views: Math.max(parsed.views, listed.views),
      ...(before ? (before.hook ? { hook: before.hook } : {}) : hook ? { hook } : {}),
      ...(before ? (before.musicId ? { musicId: before.musicId } : {}) : musicId ? { musicId } : {}),
      ...(before ? (before.musicTitle ? { musicTitle: before.musicTitle } : {}) : musicTitle ? { musicTitle } : {}),
      ...(profile.bio ? { authorBio: profile.bio } : {}),
    });
  }
  return { ok: true, videos, light, profile: { fans: profile.fans, bio: profile.bio }, pages, ...(gapChecked ? { gapChecked } : {}) };
}

/** L'état du relevé gratuit pendant un passage : il s'éteint après FREE_BREAKER profils refusés d'affilée. */
export type FreeState = { on: boolean; ok: number; fallback: number; streak: number; stopped: string | null };
export const freeStart = (): FreeState => ({ on: true, ok: 0, fallback: 0, streak: 0, stopped: null });

/** Note l'issue d'un relevé gratuit. Seul un profil que TikTok n'a pas servi compte pour le coupe-circuit, qui dit pourquoi. */
export function freeNote(state: FreeState, outcome: "ok" | FreeWhy, reason?: string): FreeState {
  if (outcome === "ok") return { ...state, ok: state.ok + 1, streak: 0 };
  const streak = outcome === "suspect" ? state.streak + 1 : 0;
  const off = streak >= FREE_BREAKER;
  const stopped = `${FREE_BREAKER} profils refusés d'affilée${reason ? ` (${reason})` : ""}`;
  return { ...state, fallback: state.fallback + 1, streak, on: state.on && !off, stopped: off ? stopped : state.stopped };
}

/**
 * LA VOIE GRATUITE d'un passage. Le 13/11/2026, premier passage en production : 8 comptes relevés de front, 6
 * profils refusés d'affilée, aucun lu — alors que le même code, du poste de travail, en lit 31 sur 32 à ce rythme.
 * Les serveurs sont donc servis moins volontiers. Ce que TikTok leur sert sans arrêt, c'est le contrôle des
 * classements (convex/radarStore) : UNE page à la fois, 0,3 à 0,7 seconde entre deux. La voie gratuite prend ce
 * rythme : un compte après l'autre, une pause avant chaque page, pendant FREE_LANE_MAX_MS au plus.
 * Un compte dont le relevé gratuit n'aboutit pas (refus, page qui manque, liste trouée) part au relevé payant. Ceux
 * qu'elle n'a pas eu le temps de prendre attendent le passage suivant (toutes les 10 minutes), sauf s'ils sont en
 * retard ou que la voie s'est fermée : cf `overflowToPay`.
 * 7 minutes depuis le 16/11/2026 (5 avant) : un premier relevé lit une page par vidéo (une dizaine), la voie ne
 * prenait que 5 à 8 nouveaux comptes par passage après les comptes suivis, et 285 attendaient jusqu'à 12 heures —
 * pendant que la voie restait à l'arrêt la moitié de chaque créneau de 10 minutes. Même rythme de pages, plus longtemps.
 * Il reste une minute au relevé payant de ce qu'elle a raté (`PASS_MAX_MS`).
 */
export const FREE_LANE_MAX_MS = 7 * 60_000;

/**
 * Plus aucun relevé payant ne part après ce délai depuis le début du passage (une tâche est coupée à 10 minutes, la
 * suivante part 10 minutes après la précédente).
 */
export const PASS_MAX_MS = 8 * 60_000;

/** Ce que la voie gratuite sait d'un compte dû pour le ranger et décider s'il peut attendre. */
export type LaneAccount = { dueAt: number; lastPostAt?: number };

/** Une publication de moins de 24 heures : son second regard (à H+18) ne doit pas glisser après H+24. */
export const LANE_FRESH_POST_MS = 24 * HOUR;
/**
 * Combien un compte pas encore pris peut attendre la voie gratuite au-delà de son heure : 20 minutes s'il a publié
 * ces dernières 24 heures (le second regard, cf radarNetworkMath.SECOND_LOOK_MS), une heure sinon. Au-delà, il est
 * relevé en payant comme avant le 14/11/2026.
 */
export const LANE_WAIT_FRESH_MS = 20 * 60_000;
export const LANE_WAIT_MS = 60 * 60_000;

const freshPost = (a: LaneAccount, now: number) => a.lastPostAt !== undefined && now - a.lastPostAt < LANE_FRESH_POST_MS;

/** L'ordre de la voie : d'abord les comptes qui ont publié ces dernières 24 heures, puis les plus en retard. */
export function laneOrder<A extends LaneAccount>(accounts: readonly A[], now: number): A[] {
  return [...accounts].sort((a, b) => Number(freshPost(b, now)) - Number(freshPost(a, now)) || a.dueAt - b.dueAt);
}

/**
 * LE PREMIER RELEVÉ PAR LA VOIE GRATUITE (15/11/2026, « Oui, applique-les », fondateur). Jusque-là, le premier relevé
 * d'un compte était payant : 5 859 crédits le 15/11, le plus gros poste du suivi des apps à l'essai. La mesure C4
 * (`radarFirstReadTrials`, 100 comptes relevés des deux façons) : 100 relevés gratuits sur 100, 99,8 % des vidéos du
 * payant retrouvées, vues identiques (1 écart de plus de 10 % sur 930), son, pays et langue identiques ; les légendes
 * ne diffèrent que par les retours à la ligne, les espaces et la casse — que les motifs ignorent (texte compacté) ;
 * l'ordre des textes à l'écran change parfois (10 sur 172), comme pour tout relevé gratuit.
 * La voie prend d'abord les comptes déjà suivis, dans l'ordre habituel, puis les nouveaux (`FIRST_FREE_PER_PASS` au
 * plus) sur la place qui reste. Le 16/11/2026, les nouveaux passaient en tête : un premier relevé gratuit lit une page
 * par vidéo (une dizaine), la voie n'en faisait que 28 par passage, et les comptes suivis, pas lus à temps, partaient
 * au payant « retard » (2 077 crédits de minuit à 9 h). Un nouveau compte pas atteint attend, sans rien payer
 * (`firstReadMisses`) ; son essai attend son premier relevé (`trialDecision`, comptes en contrôle).
 */
export const FIRST_FREE_PER_PASS = 300;

export function laneQueue<A extends LaneAccount & { first: boolean }>(due: readonly A[], now: number): A[] {
  return [...laneOrder(due.filter((a) => !a.first), now), ...due.filter((a) => a.first).slice(0, FIRST_FREE_PER_PASS)];
}

/**
 * Le sort d'un PREMIER relevé que la voie gratuite n'a pas fait. Lu sans succès (`failed`) : en payant, comme avant —
 * sauf au palier « survie » (`waitFirst`), où il attend que le solde remonte. Pas atteint (`notReached`) : il attend
 * le passage suivant, jamais payé pour un retard ; sauf voie fermée (TikTok ne sert plus les profils), en payant.
 */
export function firstReadMisses<A>(failed: readonly A[], notReached: readonly A[], laneOpen: boolean, waitFirst: boolean): { pay: A[]; defer: A[] } {
  if (waitFirst) return { pay: [], defer: [...failed] };
  return { pay: [...failed, ...(laneOpen ? [] : notReached)], defer: [] };
}

/**
 * Parmi les comptes que la voie gratuite n'a pas pris, ceux qu'il faut relever en payant MAINTENANT : tous si la
 * voie s'est fermée (coupe-circuit : TikTok ne sert plus les profils, l'attente ne servirait à rien) ; sinon ceux qui
 * ont trop attendu. Les autres restent dus et passent au gratuit au passage suivant : même donnée (mesuré le 13/11),
 * quelques minutes plus tard.
 */
export function overflowToPay<A extends LaneAccount>(notReached: readonly A[], laneOpen: boolean, now: number): { pay: A[]; reason: "coupure" | "retard" } {
  if (!laneOpen) return { pay: [...notReached], reason: "coupure" };
  return { pay: notReached.filter((a) => now - a.dueAt >= (freshPost(a, now) ? LANE_WAIT_FRESH_MS : LANE_WAIT_MS)), reason: "retard" };
}

/** Une pause AVANT chaque page (le rythme auquel les serveurs sont servis). */
export function paced(page: (url: string) => Promise<FreePage>, pause: () => Promise<void>): (url: string) => Promise<FreePage> {
  return async (url) => {
    await pause();
    return page(url);
  };
}

/** Un compte que la voie gratuite n'a pas relevé : pourquoi, et (liste trouée) la vidéo à retrouver en payant. */
export type LaneMiss<A> = { account: A; why: FreeWhy; newest?: NewestKnown };

/**
 * Un profil qui n'a rien à lire, ni gratuitement ni en payant. Vérifié le 16/11/2026 sur les 25 comptes suivis
 * restés dus depuis 3 à 42 heures : 22 profils que TikTok ne sert pas — supprimés ou bannis (« 209002 »), ou passés
 * en PRIVÉ, que l'intégration refuse de la même façon (400) — et 3 profils publics vidés de leurs vidéos. Le relevé
 * payant n'y lisait rien et facturait son crédit, sans repousser le compte : il restait dû, repayé à chaque passage.
 */
export const NOTHING_TO_READ: readonly FreeWhy[] = ["absent", "private", "empty"];

/**
 * Les comptes ratés par la voie gratuite : ceux qui n'ont rien à lire (`NOTHING_TO_READ`) prennent une erreur de
 * relevé, sans crédit (un jour d'attente, en pause à la troisième d'affilée, cf radarNetworkMath.MAX_READ_ERRORS) ;
 * les autres — profil refusé, page de vidéo illisible, liste trouée — passent au payant, qui lit ce que le gratuit
 * n'a pas pu lire.
 */
export function splitMisses<A>(failed: readonly LaneMiss<A>[]): { unreadable: A[]; paid: LaneMiss<A>[] } {
  const unreadable: A[] = [];
  const paid: LaneMiss<A>[] = [];
  for (const m of failed) {
    if (NOTHING_TO_READ.includes(m.why)) unreadable.push(m.account);
    else paid.push(m);
  }
  return { unreadable, paid };
}

/** Combien de comptes la voie a ratés, par raison (rangé à chaque passage : la raison d'un repli se lit). */
export function missCounts(failed: readonly { why: FreeWhy }[]): Partial<Record<FreeWhy, number>> {
  const out: Partial<Record<FreeWhy, number>> = {};
  for (const m of failed) out[m.why] = (out[m.why] ?? 0) + 1;
  return out;
}

/** Une page du relevé payant (ScrapeCreators), sa dépense déjà comptée. */
export type PaidPage = { ok: true; videos: SignalInput[]; next: string | null } | { ok: false; noCredits: boolean };

/**
 * Le relevé payant d'un compte : une page ; une liste trouée (`gap`), page après page — GAP_PAGES au plus, tant que
 * `more()` le permet — jusqu'à retrouver sa vidéo, ou passer sa date sans la voir. Rend les vidéos lues, sans
 * doublon, et ce que le compte en garde :
 *  read : des vidéos à ranger · stop : plus de crédits (ce qui est lu reste à ranger) ·
 *  error : rien à ranger — première page refusée, ou servie SANS vidéo. Ce second cas (profil supprimé, privé,
 *  vidé : ScrapeCreators répond sans erreur, et facture) ne laissait aucune trace : le compte restait dû et repartait
 *  en payant à chaque passage (16/11/2026). C'est une erreur de relevé, comme un refus.
 */
export async function paidRead(
  page: (cursor?: string) => Promise<PaidPage>,
  more: () => boolean,
  gap?: NewestKnown,
): Promise<{ outcome: "read" | "error" | "stop"; videos: SignalInput[]; reached: { done: boolean; found: boolean } }> {
  const seen = new Set<string>();
  const videos: SignalInput[] = [];
  let reached = { done: false, found: false };
  let cursor: string | undefined;
  for (let i = 0; i < (gap ? GAP_PAGES : 1); i++) {
    if (i > 0 && !more()) break;
    const r = await page(cursor);
    if (!r.ok) {
      if (r.noCredits) return { outcome: "stop", videos, reached };
      // Une page suivante qui échoue : ce qui est déjà lu est rangé.
      if (i === 0) return { outcome: "error", videos, reached };
      break;
    }
    if (i === 0 && r.videos.length === 0) return { outcome: "error", videos, reached };
    for (const v of r.videos) {
      if (seen.has(v.videoId)) continue;
      seen.add(v.videoId);
      videos.push(v);
    }
    if (!gap) break;
    reached = gapReached(videos, gap);
    if (reached.done || !r.next) break;
    cursor = r.next;
  }
  return { outcome: "read", videos, reached };
}

/**
 * Déroule la voie gratuite : chaque compte est relevé à son tour tant qu'elle est ouverte (`alive` : le temps
 * imparti) et que le coupe-circuit n'a pas sauté. Rend l'état du passage, les comptes dont le relevé gratuit n'a pas
 * abouti (`failed`, au relevé payant) et ceux qu'elle n'a pas eu le temps de prendre (`notReached`, cf `overflowToPay`).
 * `start` : l'état laissé par les pages lues avant elle dans la même file (la courbe, cf laneAfterCurve).
 */
export async function runFreeLane<A>(
  accounts: readonly A[],
  read: (account: A) => Promise<{ ok: true } | { ok: false; why: FreeWhy; reason?: string; newest?: NewestKnown }>,
  alive: () => boolean,
  start: FreeState = freeStart(),
): Promise<{ state: FreeState; failed: LaneMiss<A>[]; notReached: A[] }> {
  let state = start;
  const failed: LaneMiss<A>[] = [];
  const notReached: A[] = [];
  for (const account of accounts) {
    if (!state.on || !alive()) {
      notReached.push(account);
      continue;
    }
    const r = await read(account);
    state = freeNote(state, r.ok ? "ok" : r.why, r.ok ? undefined : r.reason);
    if (!r.ok) failed.push({ account, why: r.why, ...(r.newest ? { newest: r.newest } : {}) });
  }
  return { state, failed, notReached };
}

/**
 * LA MESURE DU PREMIER RELEVÉ GRATUIT (C4 du dig du 13/11, mesurée avant d'être branchée, 14/11/2026). Le premier
 * relevé d'un compte reste payant ; pour un compte sur 4 (au plus 100 par jour, 400 en tout), le même compte est
 * aussi relevé gratuitement à côté — la liste de son profil, puis la page de chacune de ses vidéos de moins de
 * 14 jours (9 au plus, autant que le payant) — et les deux sont rangés côte à côte (radarFirstReadTrials). Rien de
 * ce relevé gratuit ne sert : on compare (mêmes vidéos, mêmes vues, même texte à l'écran, même son, même pays) et on
 * ne bascule que si le gratuit vaut le payant partout. 0 crédit ; ~5 à 10 pages TikTok par compte.
 */
export const TRIAL_EVERY = 4;
export const TRIAL_PER_DAY = 100;
export const TRIAL_TOTAL = 400;
export const TRIAL_DETAIL_MAX = 9;
export const TRIAL_WINDOW_MS = 14 * 24 * HOUR;

/** Un compte sur TRIAL_EVERY, toujours le même (le pseudo décide) : l'échantillon ne dépend pas de l'heure. */
export function trialPick(handle: string): boolean {
  let h = 2166136261;
  for (const c of handle.toLowerCase()) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0;
  return h % TRIAL_EVERY === 0;
}

/** Les vidéos de la liste à lire sur leur page : celles de moins de 14 jours (identifiant), les plus récentes d'abord. */
export const trialPlan = (listed: readonly FreeListed[], now: number): FreeListed[] =>
  listed.filter((v) => now - v.publishedAt < TRIAL_WINDOW_MS).slice(0, TRIAL_DETAIL_MAX);


// ─── La courbe des vues sur la page publique (20/11/2026) ────────────────────

/**
 * LA COURBE SUR LA PAGE PUBLIQUE D'UNE VIDÉO — EN MESURE. Le relevé de courbe (H+6, H+24, H+48) paie /v2/tiktok/video,
 * 1 crédit, pour six nombres : vues, j'aime, commentaires, partages, enregistrements et abonnés du compte (applyCurve ne
 * lit rien d'autre). La page publique de la vidéo les porte ; elle est lue par `parseTikTokPublicPage` (le lecteur de
 * fetchTikTokPublicStats, convex/radar/tiktokPublicPage) plutôt que par `parseFreeVideo` :
 *  - l'id servi doit être l'id demandé : la courbe écrit par signal, les compteurs d'une autre vidéo y entreraient sans
 *    bruit — parseFreeVideo prend l'id qu'on lui sert ;
 *  - un compteur absent est `null`, pas 0 : parseFreeVideo écrirait 0 j'aime sur une vidéo qui en a 5 000 ; ici il
 *    renvoie au payant ;
 *  - un refus garde son motif (radarAvailabilityMath.reasonOf) : supprimée, compte privé, réservée à son autrice ou à
 *    ses amis → « partie » (CURVE_GONE) ; hors de sa région, en vérification, motif inconnu → payant (le fournisseur la
 *    lit peut-être d'ailleurs), là où parseFreeVideo dit « gone » à tout refus.
 * La page est demandée par la voie (fetchEmbedPage : ses en-têtes, sa pause, son second essai) : une seule file, un
 * seul client vu de TikTok, un seul coupe-circuit (laneAfterCurve). Les en-têtes d'un navigateur
 * (fetchTikTokPublicStats) ne changent pas les nombres : 4 vidéos relues AUSSITÔT (moins d'une seconde) avec les deux,
 * 4 sur 4 identiques, enregistrements exacts compris (20/11/2026 18 h, du poste, scripts/radar-bancs/courbe.ts
 * --navigateur 4). Un premier banc, qui relisait des minutes plus tard, en avait 3 sur 4 : la 4e est la plus vue
 * (12,8 millions), dont les enregistrements, exacts, ont gagné 11 en 22 minutes entre les deux bancs — la croissance
 * entre les deux lectures, probablement (ses nombres « navigateur » n'avaient pas été gardés).
 *
 * POURQUOI EN MESURE (CURVE_FREE = false) : la page ARRONDIT ses compteurs dès 10 000 — à la centaine sous le million,
 * à la centaine de milliers au-dessus (16 805 vues servies « 16 800 », 12,8 millions « 12 800 000 », 1,1 million de
 * j'aime « 1 100 000 », 106 100 abonnés), `statsV2` comme `stats` ; seuls les enregistrements restent exacts. Banc du
 * 20/11/2026 (scripts/radar-bancs/courbe.ts, du poste, 24 pages, aucun refus) : 20 vidéos de la courbe, 18 lues et 2
 * refusées « hors de leur région » (au payant) ; arrondis au-delà de 10 000 : vues 18 sur 18, j'aime 8 sur 8, partages
 * 4 sur 4, commentaires 1 sur 1, abonnés 4 sur 4 ; enregistrements exacts (3 au-delà de 10 000, aucun arrondi).
 * Depuis les serveurs, même constat : le relevé des vues de Jarvia, lu sur cette page (13-19/11), a 23 vues sur 23
 * au-delà de 10 000 multiples de 100 ; la mesure C4 (14-15/11), 27 pages vidéo sur 28 au-delà de 10 000 qui ne donnent
 * pas plus que la liste arrondie, quand le payant, lu 5 à 8 minutes PLUS TÔT, donnait plus (10 037 contre 10 000). Or
 * toute vidéo de la courbe a plus de 10 000 vues (KEEP_MIN_VIEWS ; de 12 398 à 7,5 millions, médiane 120 564, sur les
 * 70 de la prod) : la page ne vaut pas le payant.
 * Le code de la bascule est là et testé. Tant que CURVE_FREE est faux, chaque vidéo due est lue sur sa page PUIS au
 * payant, le payant est rangé comme avant, et l'accord des deux est compté EN VIDÉOS dans radarUsage.measured du poste
 * « curve », même quand le payant n'a rien facturé (cf CurveMeasure) : egal, proche, ecart (écrit au journal), repli,
 * panne. Basculer — et accepter des courbes arrondies à la centaine, à la centaine de milliers au-delà du million — se
 * décidera sur ces nombres, servis aux serveurs. À la bascule, aligner aussi le poste « curve » de l'écran du budget :
 * son curseur va jusqu'à 400 vidéos/jour et sa projection compte 3 crédits par vidéo, quand la courbe relevée sur la
 * page n'en admet que CURVE_ADMISSIONS_MAX (radarSignalsMath.curveAdmissionsLeft) et ne paie que ses replis.
 */
export const CURVE_FREE = false;

/**
 * Pages de la courbe refusées d'affilée (non servies, ou servies sans données lisibles) qui arrêtent ses pages pour le
 * passage. Le reste part au payant tout de suite plutôt qu'au passage suivant : un relevé de H+6 reste à l'heure, la
 * qualité ne dépend pas de la page, et ces refus sont rares. La série continue dans la voie qui suit (laneAfterCurve).
 */
export const CURVE_BREAKER = 5;

/**
 * Les refus qui mettent la vidéo hors d'atteinte de tout lecteur anonyme : supprimée, compte privé, réservée. La page
 * ne fait PAS sortir la vidéo de la courbe : le relevé payant confirme, comme avant. Il ne coûte rien quand la vidéo est
 * vraiment partie — le fournisseur ne facture pas un appel en échec (scGet : `credits_charged`, 0 ; en prod, poste
 * curve : 19 appels, 1 erreur, 18 crédits le 10/11 ; 4, 1, 3 le 11/11) — et une sortie de courbe est définitive alors
 * qu'un compte peut redevenir public (radarAvailability relit chaque jour). Une vidéo « partie » n'évite donc aucun
 * crédit : elle n'entre pas dans saved.curve ; elle sert la mesure (la page dit-elle « partie » quand le payant le dit ?).
 */
export const CURVE_GONE: readonly UnavailableReason[] = ["removed", "private", "restricted"];

/**
 * Ce que dit la page d'une vidéo de la courbe : ses six nombres (`read`), qu'elle n'est plus là (`gone`), ou qu'il faut
 * le relevé payant (`paid` ; `refused` : TikTok n'a pas servi la page, ou l'a servie sans données — compte pour le
 * coupe-circuit).
 */
export type CurveVerdict = { kind: "read"; counts: CurveCounts } | { kind: "gone"; why: UnavailableReason } | { kind: "paid"; refused: boolean; why: string };

export function curveVerdict(page: FreePage, videoId: string): CurveVerdict {
  if (!page.ok) return { kind: "paid", refused: page.kind === "suspect", why: page.kind === "absent" ? "page absente" : (page.reason ?? "page refusée") };
  const r = parseTikTokPublicPage(page.text, videoId);
  if (r.kind === "unreadable") return { kind: "paid", refused: true, why: r.reason };
  if (r.kind === "refused") {
    const why = reasonOf(r.statusCode, r.statusMsg);
    return CURVE_GONE.includes(why) ? { kind: "gone", why } : { kind: "paid", refused: false, why: `refusée par TikTok (${why})` };
  }
  const s = r.stats;
  const read: Record<keyof CurveCounts, number | null> = {
    authorFans: s.author?.followers ?? null,
    views: s.views,
    likes: s.likes,
    comments: s.comments,
    shares: s.shares,
    saves: s.saves,
  };
  const missing = CURVE_COUNTS.filter((k) => read[k] === null);
  if (missing.length) return { kind: "paid", refused: false, why: `page sans ${missing.join(", ")}` };
  return { kind: "read", counts: read as CurveCounts };
}

/** Une vidéo de la courbe à relever : son identifiant et le pseudo de son auteur (l'adresse de sa page). */
export type CurveDue = { videoId: string; handle: string };
export type CurveRead<D> = { due: D; verdict: CurveVerdict };

/**
 * Les pages de la courbe d'un passage, une après l'autre, avec la page de la voie (`page` : pause avant chacune, second
 * essai d'une page refusée). `max` vidéos au plus (CURVE_PAGES_PER_PASS) ; le temps de la voie écoulé (`alive`), les
 * suivantes restent dues (`notReached`). Après CURVE_BREAKER refus d'affilée, plus aucune page : les suivantes partent
 * au payant (verdict `paid`, sans page). `streak` : les pages refusées d'affilée à la fin, que la voie reprend.
 */
export async function readCurvePages<D extends CurveDue>(
  due: readonly D[],
  page: (url: string) => Promise<FreePage>,
  alive: () => boolean,
  max = CURVE_PAGES_PER_PASS,
): Promise<{ reads: CurveRead<D>[]; pages: number; streak: number; stopped: string | null; notReached: D[] }> {
  const reads: CurveRead<D>[] = [];
  const notReached: D[] = [];
  let pages = 0;
  let streak = 0;
  let stopped: string | null = null;
  for (const d of due) {
    if (reads.length >= max || !alive()) {
      notReached.push(d);
      continue;
    }
    if (stopped) {
      reads.push({ due: d, verdict: { kind: "paid", refused: false, why: "coupe-circuit" } });
      continue;
    }
    // Un identifiant qui n'est pas celui d'une vidéo TikTok n'a pas de page à lire (cf radarAvailabilityMath).
    if (!isTikTokVideoId(d.videoId)) {
      reads.push({ due: d, verdict: { kind: "paid", refused: false, why: "pas une vidéo TikTok" } });
      continue;
    }
    pages++;
    const verdict = curveVerdict(await page(freeVideoUrl(d.handle, d.videoId)), d.videoId);
    reads.push({ due: d, verdict });
    if (verdict.kind === "paid" && verdict.refused) {
      streak++;
      if (streak >= CURVE_BREAKER) stopped = `${CURVE_BREAKER} pages de la courbe refusées d'affilée (${verdict.why})`;
    } else streak = 0;
  }
  return { reads, pages, streak, stopped, notReached };
}

/**
 * La voie gratuite après les pages de la courbe (revue du 20/11/2026) : la même file, vue de TikTok, donc la même série
 * de refus. La voie reprend celle de la courbe, au plus au bord de son coupe-circuit : après 5 pages de courbe
 * refusées (10 requêtes avec leurs seconds essais), un seul profil refusé la ferme — 6 pages refusées d'affilée au plus
 * par passage, 12 requêtes, comme avant la courbe (FREE_BREAKER). Sans cela, la voie repartait de zéro : jusqu'à 11
 * pages refusées d'affilée, 22 requêtes, toutes les 10 minutes. Un profil servi remet la série à zéro, comme avant.
 */
export const laneAfterCurve = (curveStreak: number): FreeState => ({ ...freeStart(), streak: Math.max(0, Math.min(curveStreak, FREE_BREAKER - 1)) });

/** L'arrondi de la page publique : exacte sous 10 000, à la centaine sous le million, à la centaine de milliers au-dessus. */
export const pageStep = (n: number): number => (n >= 1_000_000 ? 100_000 : n >= 10_000 ? 100 : 1);
/** L'arrondi de la page, compteur par compteur : les enregistrements sont servis exacts (banc du 20/11/2026 : 97 186, 50 760, 30 485). */
export const curveStep = (k: keyof CurveCounts, n: number): number => (k === "saves" ? 1 : pageStep(n));
/** Ce qu'une vidéo de la courbe gagne au plus entre la page et le relevé payant, lu APRÈS elle, à quelques secondes d'écart. */
export const CURVE_DRIFT = 0.005;

export type CurveMatch = "egal" | "proche" | "ecart";

/**
 * La page et le relevé payant d'une même vidéo, au même moment (le payant : `null` si la vidéo n'est plus là). Proche :
 * chaque écart tient dans l'arrondi de la page (aucun pour les enregistrements), plus, dans le sens du temps seulement
 * (le payant est lu après la page), CURVE_DRIFT pour ce que la vidéo a gagné entre les deux lectures.
 */
export function curveMatch(page: CurveVerdict, paid: CurveCounts | null): CurveMatch {
  if (page.kind === "gone") return paid === null ? "egal" : "ecart";
  if (page.kind !== "read" || paid === null) return "ecart";
  const diffs = CURVE_COUNTS.map((k) => ({ grown: paid[k] - page.counts[k], step: curveStep(k, paid[k]), b: paid[k] }));
  if (diffs.every((x) => x.grown === 0)) return "egal";
  return diffs.every((x) => x.grown >= -x.step && x.grown <= x.step + CURVE_DRIFT * x.b) ? "proche" : "ecart";
}

/**
 * Un relevé payant de courbe, sa dépense comptée ; `counts: null` : la vidéo n'est plus là. En échec, `refused` : le
 * fournisseur a répondu qu'il ne sert pas cette vidéo (cf scRefused) — la vidéo est partie pour lui aussi ; sinon,
 * c'est une panne (réseau, délai, erreur du fournisseur) qui ne dit rien de la vidéo.
 */
export type CurvePaid = { ok: true; counts: CurveCounts | null; credits: number } | { ok: false; credits: number; noCredits: boolean; refused: boolean };

/**
 * Le fournisseur a-t-il refusé la vidéo elle-même ? Une réponse 4xx (scrapeCreatorsApi.scGet : « HTTP 404 … »), hors
 * crédits épuisés (402) et trop de demandes (429). Un délai, une erreur réseau, une 5xx : une panne.
 */
export const scRefused = (error: string): boolean => /^HTTP 4\d\d\b/.test(error) && !/^HTTP (402|429)\b/.test(error);

/** Pourquoi un relevé payant de courbe est parti (radarUsage.reasons du poste « curve », en crédits) : la mesure (cf CURVE_FREE), repli ; retard : runCurve. */
export type CurveReason = CurveMatch | "repli" | "retard";
/**
 * La mesure côte à côte, EN VIDÉOS (radarUsage.measured du poste « curve »), facturée ou non : egal / proche / ecart
 * (la page contre le payant, cf curveMatch ; « partie » des deux côtés : egal), repli (la page n'aurait pas suffi : le
 * payant serait parti de toute façon), panne (le payant n'a rien dit : pas de mesure).
 */
export type CurveMeasure = CurveMatch | "repli" | "panne";

export type CurveTally<D> = {
  /** Relevés gratuits rangés (la page seule, CURVE_FREE). Les appels évités en sont une part : cf curveSaved. */
  free: number;
  /** Relevés payants partis (échecs compris). */
  paid: number;
  credits: number;
  errors: number;
  /** Dues, sans relevé ce passage (plus de part payante, plus de crédits) : elles le restent. */
  waiting: D[];
  reasons: Partial<Record<CurveReason, number>>;
  measured: Partial<Record<CurveMeasure, number>>;
  gaps: { due: D; page: CurveVerdict; paid: CurveCounts | null }[];
};
export const curveTally = <D>(): CurveTally<D> => ({ free: 0, paid: 0, credits: 0, errors: 0, waiting: [], reasons: {}, measured: {}, gaps: [] });

/**
 * Les appels payants qu'un passage a ÉVITÉS (radarUsage.saved.curve, revue du 20/11/2026) : sans la page, il en aurait
 * payé au plus `paidLeft` (sa part payante) ; il en a payé `paid`. Un relevé gratuit au-delà — solde sous la réserve,
 * poste coupé par palier, plafond du mois : la part est à 0 — n'évite rien, l'ancien chemin ne relevait rien du tout.
 * Juste aussi pour un passage tombé en route : ce qu'il a rangé contre ce qu'il a payé.
 */
export const curveSaved = (t: Pick<CurveTally<unknown>, "free" | "paid">, paidLeft: number): number => Math.max(0, Math.min(t.free, paidLeft - t.paid));

/**
 * Range ce que les pages ont dit. `free` (CURVE_FREE) : une page lue est rangée, sans crédit ; le reste — vidéo
 * « partie » (le payant confirme, cf CURVE_GONE), page illisible, refusée, compteur absent — part au payant, `paidLeft`
 * relevés au plus. En mesure (`free` faux), tout part au payant. Un relevé payant est rangé comme avant : la vidéo
 * introuvable, ou en panne, sort de la courbe ; plus de crédits, elle reste due, et les suivantes avec. La mesure est
 * comptée à chaque relevé payant (en vidéos), qu'il ait été facturé ou non. `out` reçoit les comptes au fil de l'eau
 * (l'appelant écrit la dépense même si une écriture tombe).
 */
export async function settleCurve<D>(
  reads: readonly CurveRead<D>[],
  io: { paid: (d: D) => Promise<CurvePaid>; apply: (d: D, counts: CurveCounts | null) => Promise<void> },
  opts: { free: boolean; paidLeft: number },
  out: CurveTally<D> = curveTally<D>(),
): Promise<CurveTally<D>> {
  let left = Math.max(0, opts.paidLeft);
  const measure = (k: CurveMeasure) => (out.measured[k] = (out.measured[k] ?? 0) + 1);
  for (const { due, verdict } of reads) {
    if (opts.free && verdict.kind === "read") {
      await io.apply(due, verdict.counts);
      out.free++;
      continue;
    }
    if (left <= 0) {
      out.waiting.push(due);
      continue;
    }
    left--;
    out.paid++;
    const r = await io.paid(due);
    out.credits += r.credits;
    if (!r.ok) out.errors++;
    if (!r.ok && r.noCredits) {
      left = 0;
      out.waiting.push(due);
      continue;
    }
    // Le payant en panne ne dit rien de la vidéo : pas de mesure. Refusée par le fournisseur : partie pour lui aussi.
    const counts = r.ok ? r.counts : null;
    const panne = !r.ok && !r.refused;
    const match = verdict.kind === "paid" || panne ? null : curveMatch(verdict, counts);
    measure(verdict.kind === "paid" ? "repli" : (match ?? "panne"));
    const reason: CurveReason = match ?? "repli";
    if (r.credits > 0) out.reasons[reason] = (out.reasons[reason] ?? 0) + r.credits;
    if (match === "ecart") out.gaps.push({ due, page: verdict, paid: counts });
    // Au pire un relevé manqué, jamais une boucle qui repaie la même vidéo (comme avant).
    await io.apply(due, counts);
  }
  return out;
}
