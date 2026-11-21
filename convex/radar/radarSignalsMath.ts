/**
 * NOUVEAU RADAR — calculs PURS des signaux et du budget (aucun accès base, aucun
 * réseau). Partagé par les tâches de collecte (convex/radarSignals.ts), l'écran
 * Budget et l'outil MCP `signaux` : une règle n'existe qu'ici.
 *
 * Source : ScrapeCreators, payé au crédit (1 requête = 1 crédit, quel que soit le
 * nombre de vidéos renvoyées). Vérifié le 06/11/2026 : une recherche par mot-clé
 * renvoie 30 vidéos, « infos d'une vidéo » 1 vidéo, chacune pour 1 crédit.
 */

/** Prix d'un crédit : pack « Freelance » à 47 $ pour 25 000 crédits (06/11/2026). */
export const SC_PRICE_PER_CREDIT = 47 / 25_000;
/** Devise de facturation de ScrapeCreators : celle de tout le budget du Radar. */
export const SC_CURRENCY = "USD";
export const SC_PACK_CREDITS = 25_000;

/**
 * LES DEUX FOURNISSEURS (20/11/2026). Les postes TikTok du Radar peuvent passer chez TikHub (convex/radar/radarProviders,
 * réglage RADAR_TIKHUB) : 0,001 $ l'appel (`endpoint_cost` des routes du Radar, lu le 20/11/2026), contre 0,00188 $ le
 * crédit ScrapeCreators. Instagram et les transcriptions restent chez ScrapeCreators.
 */
export type Provider = "sc" | "tikhub";
export const PROVIDERS: readonly Provider[] = ["sc", "tikhub"];
/** Prix d'un appel TikHub quand le tarif de la route n'a pas été lu (`get_all_endpoints_info`) : 20/11/2026. */
export const TH_PRICE_USD = 0.001;
/** Dollars TikHub laissés en compte, que le Radar ne dépense jamais (à confirmer par le fondateur ; 0 au 20/11/2026). */
export const TH_RESERVE_USD = 0;
/**
 * LE PLAFOND TIKHUB DU JOUR (choix du fondateur, 21/11/2026) : 5 $ par jour (Paris), tous postes, appels à facturation
 * inconnue au prix plein — surchargé par la variable `RADAR_TIKHUB_USD_PER_DAY` (radarProviders.thDayCapUsd). TikHub n'a
 * pas de recharge automatique et le Radar ne connaît que son solde : sans plafond, un rattrapage du réseau ou une boucle
 * viderait le compte en une journée. Atteint, plus rien ne part chez TikHub jusqu'au lendemain : ce qui reste dû
 * attend, seule la porte de repli (radarProviders.FALLBACK_SC_PER_DAY) passe chez ScrapeCreators ; le palier TikHub,
 * qui dit combien de jours son solde tient, ne bouge pas. Une borne à quelques appels près : un passage juge chaque
 * appel sur la dépense déjà comptée (les relevés menés de front, radarNetworks.ACCOUNT_READ_POOL, partent avant de la
 * voir), et sur la dépense du jour écrite par les autres passages à son ouverture — quelques centimes au plus.
 */
export const TH_DAY_CAP_USD = 5;
/**
 * UNE UNITÉ DU BUDGET = un appel au prix de base de TikHub, un millième de dollar (un crédit ScrapeCreators vaut une
 * unité). Les quantités des postes restent des nombres d'appels : 5,4 $ de solde TikHub font 5 400 unités.
 */
export const thUnits = (usd: number): number => Math.floor(usd * 1000 + 1e-9);
/** Le prix d'une unité chez ce fournisseur. */
export const priceOf = (p: Provider): number => (p === "tikhub" ? TH_PRICE_USD : SC_PRICE_PER_CREDIT);

/** Un mois de budget compte 30 jours (les postes se règlent « par jour »). */
export const DAYS_PER_MONTH = 30;

/** Relevés de courbe, en heures après la publication. */
export const CURVE_CHECKPOINTS_H = [6, 24, 48] as const;

/** Une vidéo n'est gardée qu'au-dessus de ces deux seuils. */
export const KEEP_MIN_VIEWS = 10_000;
export const KEEP_MIN_RATIO = 10;

/** Admise dans la courbe : jeune, et nettement au-dessus de son compte. */
export const CURVE_MAX_AGE_H = 48;
export const CURVE_MIN_RATIO = 20;
export const CURVE_MIN_VIEWS_PER_HOUR = 1_000;

/** Les abonnés comptent au moins pour 100 : un compte neuf ne fait pas un ratio infini. */
export const RATIO_FLOOR_FANS = 100;

/** Deux relevés d'une même vidéo sont espacés d'au moins 2 h ; 12 au plus. */
export const SNAPSHOT_MIN_GAP_MS = 2 * 3_600_000;
export const SNAPSHOTS_MAX = 12;

/** La découverte tourne 4 fois par jour (cron toutes les 6 h). */
export const DISCOVERY_RUNS_PER_DAY = 4;

/** Durée de vie d'un signal en base (la période « Tout » de l'écran). */
export const RETENTION_DAYS = 180;

/** Signaux renvoyés au plus par l'écran (les plus récents d'abord). */
export const SIGNALS_LIST_CAP = 3_000;

const HOUR = 3_600_000;

// ─── Langues ─────────────────────────────────────────────────────────────────

export type LangBucket = "fr" | "pt" | "es-am" | "es-es" | "en" | "autre";
export const LANG_BUCKETS: readonly LangBucket[] = ["fr", "pt", "es-am", "es-es", "en", "autre"];

/**
 * Langue de la vidéo (`desc_language` de TikTok), repliée sur la langue de la
 * recherche quand TikTok n'en donne pas. L'espagnol se coupe en deux marchés :
 * Espagne (région ES) et Amérique (tout le reste).
 */
export function langBucket(lang: string | undefined, region: string | undefined, fallback?: string): LangBucket {
  const code = (lang && lang.length >= 2 && lang !== "un" ? lang : fallback ?? "").toLowerCase().slice(0, 2);
  if (code === "fr") return "fr";
  if (code === "pt") return "pt";
  if (code === "en") return "en";
  if (code === "es") return (region ?? "").toUpperCase() === "ES" ? "es-es" : "es-am";
  return "autre";
}

// ─── Recherches de découverte ────────────────────────────────────────────────

/** Une recherche de la rotation (liste : convex/radarDiscoveryQueries.ts, serveur seul). */
export type DiscoveryQuery = { query: string; region: string; lang: string };

/** Les recherches d'un passage : `count` à partir du curseur, en boucle. */
export function nextQueries(cursor: number, count: number, all: readonly DiscoveryQuery[]) {
  const n = all.length;
  if (n === 0 || count <= 0) return { queries: [] as DiscoveryQuery[], cursor };
  const start = ((cursor % n) + n) % n;
  const queries = Array.from({ length: Math.min(count, n) }, (_, i) => all[(start + i) % n]);
  return { queries, cursor: (start + queries.length) % n };
}

export const foundByLabel = (d: DiscoveryQuery) => `${d.query}·${d.region.toLowerCase()}`;

// ─── Lecture d'une vidéo ScrapeCreators ──────────────────────────────────────

export type SignalInput = {
  /** Absent = TikTok. Un Reel Instagram a un videoId « ig:<code> ». */
  platform?: "tiktok" | "instagram";
  videoId: string;
  url: string;
  authorId: string;
  authorHandle: string;
  authorFans: number;
  caption: string;
  lang: LangBucket;
  region?: string;
  publishedAt: number;
  durationSec?: number;
  coverUrl?: string;
  isAd: boolean;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  /** Texte incrusté à l'écran (le hook), absent des réponses `trim=true`. */
  hook?: string;
  /** Le son : id stable, titre, pseudo de qui l'a créé. */
  musicId?: string;
  musicTitle?: string;
  musicOwner?: string;
  /** Comptes mentionnés dans la légende (id TikTok, libellé tel qu'écrit). */
  mentions?: { id: string; label: string }[];
  /** Bio du compte, au moment du relevé. */
  authorBio?: string;
};

/**
 * Un texte sans moitié d'emoji. Couper « 😭 » au milieu (une coupe à n unités
 * UTF-16 tombe entre ses deux moitiés) laisse une valeur que Convex refuse
 * (« invalid json: unexpected end of hex escape ») : le passage entier tombe.
 * Vu en prod le 07/11/2026 sur la recherche des réseaux. Les moitiés seules
 * restantes deviennent « � ».
 */
export function cleanText(s: string, max?: number): string {
  let out = max !== undefined && s.length > max ? s.slice(0, max) : s;
  if (max !== undefined && /[\ud800-\udbff]$/.test(out)) out = out.slice(0, -1);
  return out.replace(/[\ud800-\udbff](?![\udc00-\udfff])|(?<![\ud800-\udbff])[\udc00-\udfff]/g, "\ufffd");
}

const obj = (x: unknown): Record<string, unknown> | null =>
  x !== null && typeof x === "object" && !Array.isArray(x) ? (x as Record<string, unknown>) : null;
const num = (x: unknown): number => (typeof x === "number" && Number.isFinite(x) ? x : 0);
const str = (x: unknown): string | undefined => (typeof x === "string" && x !== "" ? cleanText(x) : undefined);

/**
 * Une vidéo de la réponse (`search_item_list[i]`, `aweme_list[i]` ou
 * `aweme_detail`), ou `null` si l'essentiel manque. `aweme_info` est déballé :
 * la réponse non allégée l'emboîte, la réponse `trim=true` non.
 */
export function parseScVideo(raw: unknown, fallbackLang?: string): SignalInput | null {
  const top = obj(raw);
  const v = obj(top?.aweme_info) ?? top;
  if (!v) return null;
  const videoId = str(v.aweme_id);
  const author = obj(v.author);
  const handle = str(author?.unique_id);
  const createTime = num(v.create_time);
  if (!videoId || !handle || createTime <= 0) return null;
  const stats = obj(v.statistics) ?? {};
  const video = obj(v.video) ?? {};
  const durationMs = num(video.duration);
  const cover = obj(video.cover) ?? obj(video.origin_cover);
  const coverList = Array.isArray(cover?.url_list) ? cover?.url_list : [];
  const region = str(v.region);
  const caption = str(v.desc) ?? "";
  const extra = readExtras(v, caption, str(author?.uid));
  const bio = str(author?.signature);
  return {
    videoId,
    url: str(v.url) ?? `https://www.tiktok.com/@${handle}/video/${videoId}`,
    authorId: str(author?.uid) ?? handle,
    authorHandle: handle,
    authorFans: num(author?.follower_count),
    caption,
    lang: langBucket(str(v.desc_language), region, fallbackLang),
    ...(region ? { region } : {}),
    publishedAt: createTime * 1000,
    ...(durationMs > 0 ? { durationSec: Math.round(durationMs / 100) / 10 } : {}),
    ...(typeof coverList?.[0] === "string" ? { coverUrl: coverList[0] as string } : {}),
    isAd: v.is_ad === true,
    views: num(stats.play_count),
    likes: num(stats.digg_count),
    comments: num(stats.comment_count),
    shares: num(stats.share_count),
    saves: num(stats.collect_count),
    ...extra,
    ...(bio ? { authorBio: cleanText(bio, 300) } : {}),
  };
}

/**
 * Le libellé d'une mention, lu dans la légende aux positions que donne TikTok — le repli quand la vidéo n'a pas de
 * balisage (cf `markupMentions`). TikTok compte tantôt en CARACTÈRES, JavaScript en unités UTF-16 : un emoji vaut 1
 * pour l'un, 2 pour l'autre. Lue en UTF-16, « Nossa 🫪 @Voca AI » (positions 8 à 16) donnait « @Voca A » : l'app déjà
 * suivie n'était pas reconnue et le Radar la proposait comme une app nouvelle — « Voca A » et « What Brandon Think »
 * ont été suivies ainsi le 09/11/2026 ; avec deux emojis, la mention était perdue. On lit en caractères ; si ce n'est
 * pas une mention, en UTF-16.
 */
export function mentionLabel(caption: string, start: number, end: number): string | null {
  for (const cut of [Array.from(caption).slice(start, end).join(""), caption.slice(start, end)]) {
    const label = cleanText(cut).trim();
    if (label.startsWith("@")) return label;
  }
  return null;
}

/** Les entités du balisage de TikTok (`&amp;`, `&lt;`, `&gt;`, `&quot;`, `&#39;`, `&#x27;`…), décodées en une passe. */
const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };
function decodeEntities(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, name: string) => {
    if (name[0] !== "#") return ENTITIES[name.toLowerCase()] ?? whole;
    const code = name[1] === "x" || name[1] === "X" ? parseInt(name.slice(2), 16) : parseInt(name.slice(1), 10);
    return Number.isInteger(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : whole;
  });
}

/**
 * Le libellé de chaque mention tel que TikTok le balise dans la légende (`original_client_text.markup_text` :
 * « … sur <m id="9889">@auteur_01</m><br><br>… »), par identifiant de balise (`text_extra[].tag_id`). Corrigé le
 * 20/11/2026 : le libellé se lisait aux positions de `text_extra`, qui ne tombent juste sur aucune légende de façon
 * sûre — TikHub (comme la recherche TikTok chez ScrapeCreators) remplace chaque suite de retours à la ligne par une
 * espace, ScrapeCreators rend les relevés de profil intacts, et les positions comptent tantôt en caractères, tantôt en
 * unités UTF-16. Sur le banc du 20/11/2026, 6 libellés sur 113 mentions balisées étaient faux (le début d'un autre
 * mot, un libellé tronqué d'une lettre, un pseudo suivi de « #for », un autre compte que celui mentionné) ; une mention
 * placée après une ligne vide pouvait être perdue. Le balisage est identique chez les deux fournisseurs (172 vidéos communes sur 172) : la
 * bascule ne change plus les mentions. Une balise qui contient une autre balise n'est pas prise (repli aux positions).
 */
function markupMentions(v: Record<string, unknown>): Map<string, string> {
  const out = new Map<string, string>();
  const markup = obj(v.original_client_text)?.markup_text;
  if (typeof markup !== "string") return out;
  for (const m of markup.matchAll(/<m id="([^"]*)">([^<]*)<\/m>/g)) out.set(m[1], decodeEntities(m[2]));
  return out;
}

/** Le libellé balisé d'une mention, s'il en est un (il commence par « @ »). */
function markedLabel(marks: ReadonlyMap<string, string>, tagId: unknown): string | null {
  const key = typeof tagId === "string" ? tagId : typeof tagId === "number" ? String(tagId) : undefined;
  const raw = key !== undefined ? marks.get(key) : undefined;
  if (raw === undefined) return null;
  const label = cleanText(raw).trim();
  return label.startsWith("@") ? label : null;
}

/**
 * Hook, son et mentions d'une vidéo non allégée. Le hook = les textes incrustés
 * (autocollants de type 18) ; une mention = `text_extra` de type 0, son libellé
 * lu dans le balisage de la légende (`markupMentions`), sinon à ses positions (`@Voca AI`).
 */
function readExtras(v: Record<string, unknown>, caption: string, authorUid: string | undefined) {
  const texts = (Array.isArray(v.interaction_stickers) ? v.interaction_stickers : [])
    .map((x) => obj(x))
    .filter((x) => x?.type === 18)
    .map((x) => str(x?.text_info)?.replace(/\s+/g, " ").trim())
    .filter((x): x is string => !!x);
  const hook = cleanText(texts.join(" · "), 200);
  const music = obj(v.music);
  const musicId = str(music?.id_str) ?? (typeof music?.id === "string" ? music.id : undefined);
  const title = str(music?.title);
  const musicTitle = title ? cleanText(title, 120) : undefined;
  const musicOwner = str(music?.owner_handle);
  const mentions: { id: string; label: string }[] = [];
  const marks = markupMentions(v);
  for (const t of Array.isArray(v.text_extra) ? v.text_extra : []) {
    const e = obj(t);
    const id = str(e?.user_id);
    if (e?.type !== 0 || !id || id === authorUid || mentions.some((m) => m.id === id)) continue;
    const label = markedLabel(marks, e.tag_id) ?? mentionLabel(caption, num(e.start), num(e.end));
    if (label && label.length >= 3) mentions.push({ id, label: cleanText(label, 60) });
  }
  return {
    ...(hook ? { hook } : {}),
    ...(musicId ? { musicId } : {}),
    ...(musicTitle ? { musicTitle } : {}),
    ...(musicOwner ? { musicOwner } : {}),
    ...(mentions.length ? { mentions: mentions.slice(0, 10) } : {}),
  };
}

// ─── Tri à la découverte et courbe ───────────────────────────────────────────

/** Vues ÷ abonnés, les abonnés comptant au moins pour 100. */
export const ratioOf = (views: number, fans: number) => views / Math.max(fans, RATIO_FLOOR_FANS);

/** Vues par heure depuis la publication (au moins une heure). */
export const viewsPerHour = (views: number, publishedAt: number, now: number) =>
  views / Math.max(1, (now - publishedAt) / HOUR);

/** Gardée : pas une pub, assez de vues, assez au-dessus de son compte. */
export function keepSignal(s: Pick<SignalInput, "views" | "authorFans" | "isAd">): boolean {
  return !s.isAd && s.views >= KEEP_MIN_VIEWS && ratioOf(s.views, s.authorFans) >= KEEP_MIN_RATIO;
}

/** Admise dans la courbe : moins de 48 h, et 20× ses abonnés ou 1 000 vues/h. */
export function curveCandidate(s: Pick<SignalInput, "views" | "authorFans" | "publishedAt">, now: number): boolean {
  if (now - s.publishedAt > CURVE_MAX_AGE_H * HOUR) return false;
  return (
    ratioOf(s.views, s.authorFans) >= CURVE_MIN_RATIO ||
    viewsPerHour(s.views, s.publishedAt, now) >= CURVE_MIN_VIEWS_PER_HOUR
  );
}

/** Prochain relevé de courbe après `now` (au moins 30 min plus tard), ou undefined. */
export function nextCheckpointAt(publishedAt: number, now: number): number | undefined {
  for (const h of CURVE_CHECKPOINTS_H) {
    const at = publishedAt + h * HOUR;
    if (at > now + 30 * 60_000) return at;
  }
  return undefined;
}

/** Ajoute un relevé s'il est assez loin du précédent ; garde les 12 derniers. */
export function addSnapshot(
  snapshots: readonly { at: number; views: number }[],
  at: number,
  views: number,
  force = false,
): { at: number; views: number }[] {
  const last = snapshots[snapshots.length - 1];
  if (!force && last && at - last.at < SNAPSHOT_MIN_GAP_MS) {
    // Trop proche : on rafraîchit le dernier plutôt que d'en empiler un.
    return [...snapshots.slice(0, -1), { at: last.at, views: Math.max(last.views, views) }];
  }
  return [...snapshots, { at, views }].slice(-SNAPSHOTS_MAX);
}

// ─── Budget ──────────────────────────────────────────────────────────────────

export type PosteKey = "search" | "curve" | "tiktok" | "network" | "insta" | "transcript" | "ads" | "ai";

export type PosteDef = {
  key: PosteKey;
  /** Branché : la collecte le consomme. Les autres arrivent aux phases suivantes. */
  live: boolean;
  /** Dépense en dollars plutôt qu'en crédits (l'analyse IA). */
  dollars?: boolean;
  step: number;
  max: number;
  /** Crédits par mois pour une quantité réglée. */
  monthlyCredits: (qty: number) => number;
};

export const POSTES: readonly PosteDef[] = [
  { key: "search", live: true, step: 10, max: 300, monthlyCredits: (n) => n * DAYS_PER_MONTH },
  { key: "curve", live: true, step: 20, max: 400, monthlyCredits: (n) => n * CURVE_CHECKPOINTS_H.length * DAYS_PER_MONTH },
  // Relevés de comptes suivis par jour (1 crédit = les 9 dernières vidéos d'un compte).
  { key: "tiktok", live: true, step: 500, max: 20_000, monthlyCredits: (n) => n * DAYS_PER_MONTH },
  // Recherche du réseau des apps (mots-clés, hashtags), en crédits par mois.
  { key: "network", live: true, step: 2_000, max: 200_000, monthlyCredits: (n) => n },
  // Relevés Instagram par jour (1 crédit = les ~12 derniers Reels d'un compte).
  { key: "insta", live: true, step: 50, max: 3_000, monthlyCredits: (n) => n * DAYS_PER_MONTH },
  // Vidéos transcrites par jour (1 crédit, 0 s'il n'y a rien à transcrire).
  { key: "transcript", live: true, step: 10, max: 300, monthlyCredits: (n) => n * DAYS_PER_MONTH },
  // Bibliothèques de pubs TikTok et Meta, en crédits par mois.
  { key: "ads", live: true, step: 250, max: 10_000, monthlyCredits: (n) => n },
  // Claude Haiku (familles de hooks d'une langue à l'autre), en dollars par mois.
  { key: "ai", live: true, dollars: true, step: 1, max: 30, monthlyCredits: () => 0 },
];

/**
 * Version des réglages. En version 1 (phase 1), `tiktok` comptait des COMPTES et
 * était forcé éteint (pas encore branché), `network` n'existait pas. En version 3
 * (06/11/2026), le fondateur veut le plus de données possible : relevés, réseaux,
 * courbe et plafond passent au cran au-dessus. Des réglages plus anciens relus
 * prennent pour ces postes, et pour le plafond, les valeurs par défaut.
 */
export const BUDGET_VERSION = 10;
// v4 : Instagram, transcriptions et pubs branchés (éteints tant qu'ils ne l'étaient pas).
// v5 : l'analyse IA branchée (familles de hooks) ; le plafond et les autres postes d'une v4 sont gardés.
const RESETS: readonly { before: number; postes: readonly PosteKey[] }[] = [
  { before: 4, postes: ["tiktok", "network", "curve", "insta", "transcript", "ads"] },
  { before: 5, postes: ["ai"] },
  // v6 : découverte à 20 recherches/jour (les tournures de niche chaque jour, les autres en rotation).
  { before: 6, postes: ["search"] },
  // v7 : 100 recherches/jour, le thème « argent » passant chaque jour (12/11/2026).
  { before: 7, postes: ["search"] },
  // v8 : le Radar devient un produit vendu (13/11/2026) — 15 000 comptes suivis au plus, des centaines d'apps.
  { before: 8, postes: ["tiktok", "network"] },
  // v9 : 150 recherches/jour (14/11/2026, accord du fondateur) : les produits web (« ce site », pubs déclarées,
  // allemand, polonais, néerlandais, italien) passent chaque jour, comme le thème « argent ».
  { before: 9, postes: ["search"] },
  // v10 (15/11/2026, « Monter le budget », puis « recale-la » — fondateur) : autant d'apps que FarmSpot (~1 700).
  // Les relevés de routine passent par la voie gratuite (radarFreeMath : 96,5 % des comptes) ; les 9 000 relevés
  // PAYÉS par jour (premiers relevés, replis) suffisent. La recherche des réseaux passe à 100 000 crédits/mois
  // (~28 par app : premier tour de ~1 350 apps et revisites), le plafond à 900 $.
  { before: 10, postes: ["network"] },
];
/** Le plafond se garde à partir de cette version (4 jusqu'au 15/11/2026 : la v10 le remonte à 900 $). */
const CAP_KEPT_FROM = 10;
/** Plafond le plus haut qu'on peut régler. */
export const CAP_MAX_USD = 2_000;

export const POSTE_KEYS = POSTES.map((p) => p.key);

/**
 * Le poste peut-il puiser dans le crédit GRATUIT de TikHub ? La route des relevés de profil (`fetch_user_post_videos`,
 * le poste « tiktok ») le refuse (allow_free_credit = 0, lu le 20/11/2026) ; les autres routes du Radar l'acceptent.
 */
export const TH_FREE_OK: Readonly<Record<PosteKey, boolean>> = { search: true, curve: true, tiktok: false, network: true, insta: true, transcript: true, ads: true, ai: true };
export const isPosteKey = (k: string): k is PosteKey => (POSTE_KEYS as string[]).includes(k);
export const posteDef = (k: PosteKey) => POSTES.find((p) => p.key === k)!;

export const CAP_CHOICES = [300, 450, 650, 900, 1_300] as const;

export type BudgetSettings = {
  capUsd: number;
  postes: { key: PosteKey; qty: number; on: boolean }[];
  cutOrder: PosteKey[];
  alert80: boolean;
};

// 2 000 relevés/jour suivent 3 000 comptes au rythme adaptatif (actifs chaque
// jour, calmes tous les 3 jours, dormants chaque semaine) ; la courbe suit 100
// vidéos/jour. La recherche des réseaux (12 000 crédits/mois, ~400/jour) fait le
// premier tour des ~40 apps de départ dans la journée, puis revisite les
// concurrentes tous les 3 jours et les autres chaque semaine (~2 000 crédits/mois).
// Ce sont des PLAFONDS : sans comptes à relever ni apps à chercher, rien n'est
// dépensé. Instagram : 300 relevés/jour (les comptes dont la bio donne l'Instagram) ;
// 50 transcriptions/jour ; pubs 1 500 crédits/mois (concurrentes tous les 3 jours,
// les autres chaque semaine). Prévu au plus : ~178 $/mois sous un plafond de 300 $.
// Analyse IA : ~1 $ par mois prévu (Claude Haiku, quelques centaines de hooks), 2 $ au plus.
// Découverte : 20 recherches/jour du 09/11/2026 (60 avant) — 170 de ses 190 signaux étaient hors niche ;
// 100 depuis le 12/11/2026 : les 76 recherches du thème « argent » (side hustle) chaque jour, en plus (~4,50 $/mois) ;
// 150 depuis le 14/11/2026 : les ~40 recherches des produits web chaque jour (JobStep, Pimzi : jamais trouvés), +2,82 $/mois.
// Depuis le 13/11/2026 (le Radar devient un produit vendu) : 9 000 relevés/jour suivent 15 000 comptes au rythme
// mesuré ce jour-là (0,62 relevé par compte et par jour, 87 $/mois pour 2 162 comptes), et la recherche des
// réseaux passe à 40 000 crédits/mois (des centaines d'apps, chacune cherchée à fond). Prévu au plus :
// ~630 $/mois sous un plafond de 650 $ — environ 10 000 comptes au prix du pack de 25 000 crédits, le double
// avec celui de 500 000.
// Depuis le 15/11/2026 (« autant d'apps que FarmSpot », fondateur) : jusqu'à 40 000 comptes. Leurs relevés de
// routine sont gratuits (pages publiques, radarFreeMath) ; les 9 000 relevés payés par jour couvrent les premiers
// relevés et les replis (1 à 9 % des comptes par jour, mesuré les 14 et 15/11). La recherche des réseaux coûte
// ~28 crédits par app (mesuré du 13 au 15/11 : 108 apps pour 3 114 crédits) : 100 000 crédits/mois font le premier
// tour de ~1 350 apps de plus et les revisites. Prévu au plus : 745,54 $/mois sous un plafond de 900 $ ; attendu
// en régime : 170 à 300 $/mois. Ce sont des plafonds, dépensés seulement s'il y a des comptes et des apps.
const DEFAULT_QTY: Record<PosteKey, number> = { search: 150, curve: 100, tiktok: 9_000, network: 100_000, insta: 300, transcript: 50, ads: 1_500, ai: 2 };

export const DEFAULT_BUDGET: BudgetSettings = {
  capUsd: 900,
  postes: POSTES.map((p) => ({ key: p.key, qty: DEFAULT_QTY[p.key], on: p.live })),
  // L'analyse IA est coupée la première : la veille marche sans elle.
  cutOrder: ["ai", "search", "transcript", "curve", "ads", "insta", "network", "tiktok"],
  alert80: true,
};

/**
 * Réglages lus en base (ou saisis) ramenés à une forme sûre : un poste par clé,
 * quantité entière bornée, poste non branché toujours éteint, ordre de coupure
 * complet et sans doublon. Un réglage illisible retombe sur le défaut.
 */
export function normalizeBudget(
  raw: Partial<{ capUsd: number; postes: { key: string; qty: number; on: boolean }[]; cutOrder: string[]; alert80: boolean; budgetVersion: number }> | null | undefined,
): BudgetSettings {
  const cap = raw?.capUsd;
  // Écrit « 0 < cap » : la garde i18n lit « > 0 && cap < » comme du texte JSX.
  const version = raw?.budgetVersion ?? 0;
  const capUsd = version >= CAP_KEPT_FROM && typeof cap === "number" && 0 < cap && cap <= CAP_MAX_USD ? Math.round(cap * 100) / 100 : DEFAULT_BUDGET.capUsd;
  const postes = POSTES.map((def) => {
    const stale = RESETS.some((r) => version < r.before && r.postes.includes(def.key));
    const got = stale ? undefined : raw?.postes?.find((p) => p.key === def.key);
    const qty = typeof got?.qty === "number" && Number.isFinite(got.qty) ? Math.min(def.max, Math.max(0, Math.round(got.qty))) : DEFAULT_QTY[def.key];
    return { key: def.key, qty, on: def.live && (got ? got.on === true : true) };
  });
  const cutOrder: PosteKey[] = [];
  for (const k of [...(raw?.cutOrder ?? []), ...DEFAULT_BUDGET.cutOrder]) {
    if (isPosteKey(k) && !cutOrder.includes(k)) cutOrder.push(k);
  }
  return { capUsd, postes, cutOrder, alert80: raw?.alert80 ?? DEFAULT_BUDGET.alert80 };
}

const posteOf = (s: BudgetSettings, k: PosteKey) => s.postes.find((p) => p.key === k)!;

/** Enveloppe du mois d'un poste, en dollars (0 s'il est éteint), au prix de ScrapeCreators (ce que l'écran affiche). */
export function envelopeUsd(s: BudgetSettings, k: PosteKey): number {
  return envelopeUsdAt(s, k, "sc");
}

/**
 * Enveloppe du mois d'un poste au prix du fournisseur qui le sert (bascule TikHub du 20/11/2026). Les quantités
 * restent des NOMBRES D'APPELS (une unité, cf `thUnits`) : un poste servi par TikHub garde sa quantité, à 0,001 $
 * l'appel au lieu de 0,00188 $. Un poste mixte (le réseau : des passes chez l'un, des passes chez l'autre ; la
 * recherche : découverte chez TikHub, tournures chez ScrapeCreators) est approché au prix du fournisseur réglé.
 */
export function envelopeUsdAt(s: BudgetSettings, k: PosteKey, provider: Provider): number {
  const p = posteOf(s, k);
  if (!p.on) return 0;
  const def = posteDef(k);
  return def.dollars ? p.qty : def.monthlyCredits(p.qty) * priceOf(provider);
}

export const envelopeCredits = (s: BudgetSettings, k: PosteKey) => {
  const p = posteOf(s, k);
  return p.on ? posteDef(k).monthlyCredits(p.qty) : 0;
};

/** Total prévu du mois, en dollars. */
export const plannedUsd = (s: BudgetSettings) => POSTE_KEYS.reduce((sum, k) => sum + envelopeUsd(s, k), 0);

/**
 * `usd` : la dépense d'un poste en dollars (l'analyse IA), hors crédits. Depuis le 20/11/2026, la dépense TikHub d'un
 * poste : `thCalls` appels facturés, `thUsd` dollars facturés (le prix de chaque route), `thUnknown` appels coupés
 * par le délai dont la facturation est inconnue — comptés au prix plein (`TH_PRICE_USD`), la borne haute.
 * `credits` reste en crédits ScrapeCreators seuls.
 */
export type UsageRow = { poste: string; credits: number; day?: string; usd?: number; thCalls?: number; thUsd?: number; thUnknown?: number; thFallbacks?: number };

/** Les unités d'une ligne d'usage : crédits ScrapeCreators + appels TikHub (facturés ou inconnus). Cf `thUnits`. */
export const usageUnits = (u: Pick<UsageRow, "credits" | "thCalls" | "thUnknown">): number => u.credits + (u.thCalls ?? 0) + (u.thUnknown ?? 0);

/** Les dollars TikHub d'une ligne d'usage (les appels à facturation inconnue au prix plein). */
const thUsageUsd = (u: Pick<UsageRow, "thUsd" | "thUnknown">): number => (u.thUsd ?? 0) + (u.thUnknown ?? 0) * TH_PRICE_USD;
const hasTh = (u: Pick<UsageRow, "thCalls" | "thUsd" | "thUnknown">): boolean => u.thCalls !== undefined || u.thUsd !== undefined || u.thUnknown !== undefined;

/**
 * Les appels payants qu'une page publique de TikTok a rendus inutiles, comptés par brique dans `radarUsage.saved`
 * (au moins un appel payant chacun, chez le fournisseur qui l'aurait servi : un crédit ScrapeCreators ou un appel
 * TikHub, la même unité du budget) : hashtag (recherche de réseau évitée), trou (relevé « trou » évité : la vidéo est
 * supprimée), transcript (sous-titres natifs), curve (relevé de courbe), repli (profil ou vidéo relus au passage
 * suivant). Un banc mesuré du poste ne dit pas ce que TikTok sert aux serveurs : ce compteur, lui, le dit.
 */
export type SavedKey = "hashtag" | "trou" | "transcript" | "curve" | "repli";

/** Ajoute des compteurs par clé à d'autres (motifs de dépense, appels évités) ; les clés à zéro ou moins sont ignorées. */
export function addCounts(base: Readonly<Record<string, number>> | undefined, more: Readonly<Record<string, number>> | undefined): Record<string, number> {
  const out: Record<string, number> = { ...(base ?? {}) };
  for (const [k, c] of Object.entries(more ?? {})) if (c > 0) out[k] = (out[k] ?? 0) + c;
  return out;
}

export type BudgetState = {
  spentCredits: number;
  spentUsd: number;
  /** `credits` : crédits ScrapeCreators seuls ; `units` : crédits + appels TikHub (cf `usageUnits`) ; `usd` : les deux. */
  byPoste: Record<PosteKey, { credits: number; usd: number; envelopeUsd: number; units: number }>;
  /** Dépense déjà faite + reste des enveloppes des postes encore ouverts. */
  projectedUsd: number;
  /** Postes coupés pour tenir le plafond. */
  cut: PosteKey[];
  /** Plafond atteint : tout s'arrête jusqu'au 1er du mois suivant. */
  capReached: boolean;
  /** 80 % du plafond dépassés. */
  over80: boolean;
  /**
   * Crédits que le Radar peut encore dépenser sur le SOLDE réel du compte ScrapeCreators (solde − réserve), ou
   * `null` quand le solde n'a jamais été lu. Le plafond en dollars ne dit rien du solde : le 13/11/2026, il valait
   * 650 $ (≈ 345 000 crédits) pour 7 784 crédits en compte, et seul le refus de l'API (HTTP 402) arrêtait tout.
   */
  balanceLeft: number | null;
  /** Le solde est passé sous la réserve : les postes payants s'arrêtent (une sonde le relit, cf `needsBalanceProbe`). */
  reserveReached: boolean;
  /** Le dernier solde lu date de plus de `BALANCE_PROBE_MS` : une sonde peut le relire. */
  balanceStale: boolean;
  /** Le palier du solde (cf `creditTier`) et les jours de crédits qu'il reste avant la réserve (`null` : inconnu). */
  tier: CreditTier;
  daysLeft: number | null;
  /** Les coupures du plafond seules (80 % puis 100 %), sans celles des paliers de solde (`cut` les réunit). */
  capCut: PosteKey[];
  /** Le fournisseur qui sert chaque poste (ScrapeCreators sans bascule) : son palier et son solde jugent le poste. */
  providers: Record<PosteKey, Provider>;
  /**
   * Le solde TikHub, EN UNITÉS (cf `thUnits`) : `paidLeft` le payé seul (la route des relevés de profil refuse le
   * crédit gratuit), `allLeft` payé + gratuit ; tous deux moins ce qui a été dépensé depuis la dernière lecture (une
   * borne basse, recalée à chaque lecture gratuite). `null` : jamais lu. `tier` : son palier, calculé sur `paidLeft`.
   * `dayLeft` : ce que le plafond du jour laisse encore, en unités (cf TH_DAY_CAP_USD) ; `null` : pas de plafond posé.
   */
  th: { paidLeft: number | null; allLeft: number | null; tier: CreditTier; daysLeft: number | null; stale: boolean; dayLeft: number | null };
};

/**
 * LES PALIERS DU SOLDE (14/11/2026). La qualité d'abord : tant que le solde tient plus de 2 jours, rien ne change.
 * En dessous, le Radar REPORTE ce qui se rattrape sans perte une fois un pack acheté, au lieu de tout couper d'un
 * coup à la réserve. Les relevés des comptes déjà suivis ne sont jamais touchés.
 *  - economie (moins de 2 jours) : découverte et tournures (« search »), transcriptions, pubs ; les recherches
 *    COMPLÈTES des apps non concurrentes (leur recherche courte de routine continue). Découverte et transcriptions
 *    portent sur la semaine, les pubs se revoient tous les 3 à 7 jours : un report de 2 jours ne perd rien.
 *  - survie (moins d'un jour) : en plus, la routine des apps non concurrentes et le premier relevé des nouveaux
 *    comptes (ils restent dus et passent dès que le solde remonte).
 *  - reserve : tout s'arrête (cf CREDIT_RESERVE), sauf la sonde.
 */
export type CreditTier = "normal" | "economie" | "survie" | "reserve";
export const ECONOMY_DAYS = 2;
export const SURVIVAL_DAYS = 1;
export const TIER_CUT: Record<CreditTier, readonly PosteKey[]> = {
  normal: [],
  economie: ["search", "transcript", "ads"],
  survie: ["search", "transcript", "ads"],
  reserve: [],
};
/** Le palier reporte les recherches complètes (`deep`), la routine (`routine`) des apps non concurrentes, les premiers relevés. */
export const tierDefers = (tier: CreditTier): { deep: boolean; routine: boolean; firstReads: boolean } => ({
  deep: tier === "economie" || tier === "survie",
  routine: tier === "survie",
  firstReads: tier === "survie",
});

/** Le palier du solde : `perDay`, la dépense moyenne des derniers jours complets (cf `recentPerDay`). */
export function creditTier(balanceLeft: number | null, perDay: number | null | undefined): { tier: CreditTier; daysLeft: number | null } {
  if (balanceLeft === null) return { tier: "normal", daysLeft: null };
  if (balanceLeft === 0) return { tier: "reserve", daysLeft: 0 };
  const daysLeft = perDay && perDay > 0 ? balanceLeft / perDay : null;
  if (daysLeft === null) return { tier: "normal", daysLeft };
  return { tier: daysLeft < SURVIVAL_DAYS ? "survie" : daysLeft < ECONOMY_DAYS ? "economie" : "normal", daysLeft };
}

/**
 * Crédits laissés en compte, que le Radar ne dépense jamais. Les relevés de vues de la paie des créatrices peuvent
 * passer par la même clé (convex/scrapeCreatorsViews.releveScKey, quand la clé dédiée n'est pas posée) : un Radar
 * qui vide le compte arrêterait aussi ces relevés. 1 500 crédits ≈ une journée de Radar, plusieurs jours de paie.
 */
export const CREDIT_RESERVE = 1_500;
/**
 * Sous la réserve, aucun appel payant ne part, donc le solde n'est plus relu (il n'arrive qu'avec les réponses de
 * l'API) : sans sonde, un pack acheté ne relancerait jamais le Radar. La tâche des relevés (chaque heure) fait donc UN
 * appel d'un crédit quand le dernier solde lu a plus de 50 minutes — quels que soient les réglages des postes, et même
 * sans compte à relever en payant. 50 et pas 60 : la tâche passe toutes les heures, une sonde à « une heure pile »
 * en sauterait une sur deux.
 */
export const BALANCE_PROBE_MS = 50 * 60_000;

/** Faut-il relire le solde par un appel d'un crédit (solde sous la réserve, lu il y a plus de 50 minutes) ? */
export const needsBalanceProbe = (state: Pick<BudgetState, "reserveReached" | "balanceStale">): boolean => state.reserveReached && state.balanceStale;

/**
 * Le solde lu (radarSettings) : `remaining` crédits à la date `seenAt`, relu par la tâche à `now`. `perDay` : la
 * dépense moyenne des derniers jours complets (cf `recentPerDay`), qui dit combien de jours il tient (le palier).
 */
export type Balance = { remaining: number; seenAt: number; now: number; perDay?: number | null };

/**
 * Le solde TikHub lu (radarSettings, `get_user_info`, gratuit) : `paidUsd` le solde payé, `freeUsd` le crédit gratuit,
 * lus à `seenAt` ; `spentSinceUsd` ce que le Radar a dépensé chez TikHub depuis ; `perDay` la dépense moyenne des
 * derniers jours complets, en unités, des postes que TikHub sert (cf `thPerDay`).
 */
export type ThBalance = { paidUsd: number; freeUsd: number; seenAt: number; spentSinceUsd: number; now: number; perDay?: number | null };

/**
 * Les options d'un budget à deux fournisseurs : qui sert chaque poste, le solde TikHub, et son plafond du jour (`thDay` :
 * le jour de Paris et le plafond en dollars, cf TH_DAY_CAP_USD). Sans elles : ScrapeCreators seul.
 */
export type BudgetOpts = { providers?: Partial<Record<PosteKey, Provider>>; th?: ThBalance | null; thDay?: { today: string; capUsd: number } };

/** Le solde TikHub est relu (gratuitement) en tête de passage quand la dernière lecture a plus d'une minute. */
export const TH_BALANCE_STALE_MS = 60_000;

/**
 * LA DÉPENSE TIKHUB DEPUIS LE SOLDE LU (radarSettings.thSpentLots, 20/11/2026). Chaque lot de dépense écrit (recordRun)
 * est gardé avec l'heure de son écriture (`at`), tant qu'il peut contenir de la dépense faite APRÈS la lecture rangée :
 * un lot écrit avant une lecture ne contient que de la dépense faite avant elle, que le solde lu compte déjà. Quand un
 * passage range un solde plus frais (lu à `read.at`), on garde les lots écrits depuis (ceux des autres passages, en
 * entier : une borne haute de leur dépense après la lecture) et on y ajoute ce que CE passage a dépensé après sa lecture
 * (`read.afterUsd`, la part de son lot). Corrigé le 20/11/2026 : la dépense « depuis » repartait de la seule dépense du
 * passage qui écrivait le solde, et celle que les passages en parallèle avaient écrite après la lecture disparaissait —
 * le solde estimé (/admin, paliers, part de chaque passage) n'était plus la borne basse annoncée.
 */
export type SpentLot = { at: number; usd: number };
/** Au plus tant de lots gardés : au-delà, les deux plus anciens se fondent, à l'heure du plus récent (jamais oublié trop tôt). */
export const TH_SPENT_LOTS_MAX = 32;

/** Les lots après l'écriture d'un passage : `lot`, sa dépense TikHub en dollars ; `read`, le solde plus frais qu'il range. */
export function nextSpentLots(prev: readonly SpentLot[], writtenAt: number, lot: number, read?: { at: number; afterUsd: number }): SpentLot[] {
  const out = read ? prev.filter((l) => l.at >= read.at) : [...prev];
  const mine = read ? Math.max(0, Math.min(read.afterUsd, lot)) : lot;
  if (mine > 0) out.push({ at: writtenAt, usd: mine });
  while (out.length > TH_SPENT_LOTS_MAX) {
    const [a, b] = out.splice(0, 2);
    out.unshift({ at: Math.max(a.at, b.at), usd: a.usd + b.usd });
  }
  return out;
}

/** La dépense TikHub depuis le solde lu, en dollars : la somme des lots. */
export const spentOf = (lots: readonly SpentLot[]): number => lots.reduce((sum, l) => sum + l.usd, 0);

/**
 * L'état du budget du mois. Chaque poste a son enveloppe ; au plafond, tout
 * s'arrête. Entre 80 % et 100 %, si la projection du mois dépasse le plafond, on
 * coupe dans l'ORDRE DE COUPURE jusqu'à ce qu'elle repasse dessous. `balance` : le
 * solde réel du compte, qui borne tout (sous la réserve, rien ne part).
 *
 * Deux fournisseurs depuis le 20/11/2026 (`opts`) : chaque poste se juge sur le palier et le solde du fournisseur qui
 * le sert (`providers`), son enveloppe se compte à son prix ; le plafond en dollars reste commun. Sans `opts` ni ligne
 * d'usage TikHub, le résultat est celui d'avant, au bit près (tests/radar/radar-budget-golden.test.ts).
 */
export function budgetState(s: BudgetSettings, monthUsage: readonly UsageRow[], balance?: Balance | null, opts?: BudgetOpts): BudgetState {
  const providers = {} as Record<PosteKey, Provider>;
  for (const k of POSTE_KEYS) providers[k] = opts?.providers?.[k] ?? "sc";
  const byPoste = {} as BudgetState["byPoste"];
  for (const k of POSTE_KEYS) byPoste[k] = { credits: 0, usd: 0, envelopeUsd: envelopeUsdAt(s, k, providers[k]), units: 0 };
  let spentCredits = 0;
  let dollars = 0;
  for (const u of monthUsage) {
    spentCredits += u.credits;
    dollars += u.usd ?? 0;
    if (hasTh(u)) dollars += thUsageUsd(u);
    if (isPosteKey(u.poste)) {
      byPoste[u.poste].credits += u.credits;
      byPoste[u.poste].units += usageUnits(u);
      byPoste[u.poste].usd += u.usd ?? 0;
      if (hasTh(u)) byPoste[u.poste].usd += thUsageUsd(u);
    }
  }
  for (const k of POSTE_KEYS) byPoste[k].usd += byPoste[k].credits * SC_PRICE_PER_CREDIT;
  const spentUsd = spentCredits * SC_PRICE_PER_CREDIT + dollars;
  // Le reste du mois d'un poste : ses UNITÉS restantes (quantité du mois moins unités dépensées, chez l'un ou l'autre
  // fournisseur) au prix de celui qui le sert ; un poste en dollars (l'analyse IA) : son enveloppe moins sa dépense.
  // Corrigé le 20/11/2026 : c'était l'enveloppe moins la dépense en dollars, deux prix mêlés — un poste basculé chez
  // TikHub en cours de mois (enveloppe au prix TikHub, crédits ScrapeCreators déjà payés au leur) tombait à 0 alors
  // qu'il lui restait des milliers d'appels, et la projection passait sous le plafond à tort. Sans TikHub, c'est au bit
  // près l'ancien calcul (enveloppe − crédits × prix du crédit, cf tests/radar/radar-budget-golden.test.ts).
  const remainingOf = (k: PosteKey) =>
    posteDef(k).dollars ? Math.max(0, byPoste[k].envelopeUsd - byPoste[k].usd) : Math.max(0, byPoste[k].envelopeUsd - byPoste[k].units * priceOf(providers[k]));
  const capReached = spentUsd >= s.capUsd;
  const over80 = spentUsd >= s.capUsd * 0.8;
  const open = POSTES.filter((d) => d.live && posteOf(s, d.key).on).map((d) => d.key);
  let projectedUsd = spentUsd + open.reduce((sum, k) => sum + remainingOf(k), 0);
  const cut: PosteKey[] = [];
  if (capReached) {
    cut.push(...open);
    projectedUsd = spentUsd;
  } else if (over80 && projectedUsd > s.capUsd) {
    for (const k of s.cutOrder) {
      if (projectedUsd <= s.capUsd) break;
      if (!open.includes(k)) continue;
      cut.push(k);
      projectedUsd -= remainingOf(k);
    }
  }
  const capCut = [...cut];
  const balanceLeft = balance ? Math.max(0, Math.floor(balance.remaining - CREDIT_RESERVE)) : null;
  const { tier, daysLeft } = creditTier(balanceLeft, balance?.perDay);
  const th = thState(opts?.th, thDayLeft(monthUsage, opts?.thDay));
  // Chaque poste est coupé par le palier du fournisseur qui le sert (dans l'ordre des paliers, comme avant la bascule).
  const tierOfProvider: Record<Provider, CreditTier> = { sc: tier, tikhub: th.tier };
  for (const p of PROVIDERS) {
    for (const k of TIER_CUT[tierOfProvider[p]]) if (providers[k] === p && open.includes(k) && !cut.includes(k)) cut.push(k);
  }
  return {
    spentCredits,
    spentUsd,
    byPoste,
    projectedUsd,
    cut,
    capReached,
    over80,
    balanceLeft,
    reserveReached: balanceLeft === 0,
    balanceStale: !!balance && balance.now - balance.seenAt >= BALANCE_PROBE_MS,
    tier,
    daysLeft,
    capCut,
    providers,
    th,
  };
}

/** Ce que le plafond TikHub du jour laisse encore, en unités : le plafond moins la dépense TikHub écrite aujourd'hui, tous postes. */
function thDayLeft(monthUsage: readonly UsageRow[], day: BudgetOpts["thDay"]): number | null {
  if (!day) return null;
  const spent = monthUsage.reduce((sum, u) => (u.day === day.today && hasTh(u) ? sum + thUsageUsd(u) : sum), 0);
  return Math.max(0, thUnits(day.capUsd - spent));
}

/** Le solde TikHub en unités, son palier et le reste de son plafond du jour (cf `BudgetState.th`). */
function thState(th: ThBalance | null | undefined, dayLeft: number | null): BudgetState["th"] {
  if (!th) return { paidLeft: null, allLeft: null, tier: "normal", daysLeft: null, stale: false, dayLeft };
  const since = Math.max(0, th.spentSinceUsd);
  const paidLeft = Math.max(0, thUnits(th.paidUsd - since - TH_RESERVE_USD));
  const allLeft = Math.max(0, thUnits(th.paidUsd + th.freeUsd - since - TH_RESERVE_USD));
  const { tier, daysLeft } = creditTier(paidLeft, th.perDay);
  return { paidLeft, allLeft, tier, daysLeft, stale: th.now - th.seenAt >= TH_BALANCE_STALE_MS, dayLeft };
}

/** Le palier du fournisseur `p` (ScrapeCreators : celui du solde de toujours). */
export const tierOf = (state: Pick<BudgetState, "tier" | "th">, p: Provider): CreditTier => (p === "sc" ? state.tier : state.th.tier);

/**
 * Jours de crédits qu'il reste au rythme des derniers jours : `remaining` ÷ la dépense moyenne des jours COMPLETS les
 * plus récents (3 au plus, aujourd'hui exclu : il n'est pas fini). `null` sans aucun jour complet.
 */
export function daysOfCredits(remaining: number, usage: readonly UsageRow[], today: string, days = 3): number | null {
  const perDay = recentPerDay(usage, today, days);
  return perDay !== null && perDay > 0 ? remaining / perDay : null;
}

/**
 * La dépense moyenne par jour des jours COMPLETS les plus récents (3 au plus, aujourd'hui exclu) ; `null` sans aucun.
 * `pick` : ce qu'on compte d'une ligne — les crédits ScrapeCreators (le palier de son solde), ou les unités des postes
 * que TikHub sert (`thPerDay`, le palier du solde TikHub).
 */
export function recentPerDay(usage: readonly UsageRow[], today: string, days = 3, pick: (u: UsageRow) => number = (u) => u.credits): number | null {
  const byDay = new Map<string, number>();
  for (const u of usage) if (u.day && u.day < today) byDay.set(u.day, (byDay.get(u.day) ?? 0) + pick(u));
  const recent = [...byDay].sort((a, b) => b[0].localeCompare(a[0])).slice(0, days);
  if (recent.length === 0) return null;
  return recent.reduce((sum, [, c]) => sum + c, 0) / recent.length;
}

/**
 * Les postes que TikHub ne sert JAMAIS en entier, même réglés chez lui (radarProviders.posteProviders, passProvider) : le
 * réseau (ses passes par date ; sous `network`, aussi le hashtag FR et le mot-clé sans région) et la recherche (les
 * tournures, radarNaming, comptées au poste « search », restent chez ScrapeCreators).
 */
export const MIXED_POSTES: readonly PosteKey[] = ["network", "search"];
/** Une ligne d'usage écrite par un passage basculé : dépense ou replis TikHub. */
const servedByTh = (u: UsageRow): boolean => hasTh(u) || u.thFallbacks !== undefined;

/**
 * Le rythme du solde TikHub : la dépense moyenne par jour, EN UNITÉS, des postes que TikHub sert (`providers`), sur les
 * jours complets les plus récents (cf `recentPerDay`) — quel que soit le fournisseur qui les a servis ce jour-là : un
 * crédit ScrapeCreators et un appel TikHub lisent la même page (banc du 20/11/2026), et le budget compte déjà les deux
 * dans la même quantité du poste (`usageUnits`). Un poste mixte (MIXED_POSTES) ne compte en entier que les jours sans
 * champ TikHub (avant la bascule : une borne haute, qui fait baisser le palier un peu plus tôt, jamais plus tard) ; une
 * ligne qui porte des champs TikHub dit la part de TikHub ce jour-là : ses appels, et ses replis (des appels qui lui
 * étaient destinés), pas les crédits que ScrapeCreators sert de toute façon (passes par date, tournures). `null` quand
 * aucun poste n'est chez TikHub (rien à juger), ou sans aucun jour complet.
 * Corrigé le 20/11/2026 : on comptait les seuls appels TikHub de chaque jour. Un jour d'avant la bascule (aucun champ
 * TikHub) comptait pour 0 — un zéro fabriqué, « non mesuré » devenu « nul » — et le jour de la bascule pour ses seules
 * heures chez TikHub : le lendemain, 167 appels par jour au lieu de ~1 000, 9 jours de solde au lieu de 1,5, le palier
 * « normal » au lieu d'« economie » ; de même pendant 3 jours après chaque réactivation de RADAR_TIKHUB.
 * Corrigé le 21/11/2026 : le réseau comptait en entier les jours basculés, crédits ScrapeCreators de ses passes par
 * date compris.
 */
export function thPerDay(usage: readonly UsageRow[], today: string, providers: Partial<Record<PosteKey, Provider>>, days = 3): number | null {
  const served = (poste: string) => isPosteKey(poste) && providers[poste] === "tikhub";
  if (!POSTE_KEYS.some(served)) return null;
  const share = (u: UsageRow): number => {
    if (!served(u.poste)) return 0;
    if (MIXED_POSTES.includes(u.poste as PosteKey) && servedByTh(u)) return (u.thCalls ?? 0) + (u.thUnknown ?? 0) + (u.thFallbacks ?? 0);
    return usageUnits(u);
  };
  return recentPerDay(usage, today, days, share);
}

/**
 * Le rythme du solde ScrapeCreators, le pendant de `thPerDay` : la dépense moyenne par jour, EN UNITÉS, de ce que
 * ScrapeCreators sert sous le réglage en cours (`providers`), sur les jours complets les plus récents (cf `recentPerDay`).
 *  - Un poste qu'il sert en entier compte toutes ses unités, quel que soit le fournisseur qui les a servies ce jour-là
 *    (au retour en arrière, les appels TikHub d'hier sont ce qu'il servira).
 *  - Un poste mixte réglé chez TikHub (MIXED_POSTES : réseau, recherche) compte ses crédits : exactement la part de
 *    ScrapeCreators une ligne qui porte des champs TikHub, replis compris (ils sont servis par lui) ; une ligne d'avant
 *    la bascule, en entier (ses crédits sont toutes ses unités) — une borne haute.
 *  - Un poste que TikHub sert EN ENTIER (relevés, courbe : réglés chez lui, hors MIXED_POSTES) ne compte que ce que
 *    ScrapeCreators lui a réellement servi les jours où il passait chez TikHub (replis, sonde : les `credits` d'une
 *    ligne qui porte de la dépense ou des replis TikHub). Un jour d'avant la bascule ne mesure pas ce que
 *    ScrapeCreators lui servirait sous ce réglage : il n'y compte pas. Hypothèse assumée : sans échec de TikHub, aucun
 *    repli — et les replis sont bornés (100 par jour, tous postes) et n'ont lieu qu'au palier « normal ».
 * Sans réglage ni ligne TikHub : les crédits, exactement le rythme d'avant le 20/11/2026.
 * Corrigé le 20/11/2026 : on additionnait les crédits de chaque ligne. Basculer les relevés chez TikHub (81 % de la
 * dépense) laissait le rythme à ~1 150 par jour pendant 3 jours pour ~220 dépensés chez ScrapeCreators (palier
 * « survie » à tort : transcriptions, tournures, routine du réseau et porte de repli coupées) ; revenir en arrière
 * (RADAR_TIKHUB retiré) le laissait à ~205 pour ~1 150 (palier « normal » à tort : la réserve, que partagent les
 * relevés de la paie de Jarvia, n'était plus protégée par les paliers).
 * Corrigé le 21/11/2026 : un poste mixte comptait en entier, appels TikHub compris — un jour de rattrapage du réseau
 * chez TikHub (10 500 appels, ~300 crédits ScrapeCreators) faisait passer ScrapeCreators en « economie » : tournures,
 * transcriptions payantes et pubs coupées, porte de repli fermée, recherches complètes du réseau reportées.
 */
export function scPerDay(usage: readonly UsageRow[], today: string, providers: Partial<Record<PosteKey, Provider>>, days = 3): number | null {
  const share = (u: UsageRow): number => {
    if (!isPosteKey(u.poste) || providers[u.poste] !== "tikhub") return usageUnits(u);
    if (MIXED_POSTES.includes(u.poste)) return u.credits;
    return servedByTh(u) ? u.credits : 0;
  };
  return recentPerDay(usage, today, days, share);
}

/** Sous ce nombre de jours de crédits, Telegram prévient (une fois par jour). */
export const LOW_CREDIT_DAYS = 3;

/**
 * Quelle alerte de solde envoyer maintenant, au plus une par jour et par genre : « reserve » quand le Radar a
 * arrêté ses postes payants, « low » quand il reste moins de 3 jours AVANT cet arrêt (le solde au-dessus de la
 * réserve, au rythme des derniers jours). `alerted` : les jours (Paris) où chaque genre est déjà parti.
 */
export type CreditAlertKind = "reserve" | "survie" | "economie" | "low";

export function creditAlert(
  state: Pick<BudgetState, "balanceLeft" | "reserveReached">,
  usage: readonly UsageRow[],
  today: string,
  alerted: Partial<Record<CreditAlertKind, string>>,
): { kind: CreditAlertKind; days: number | null } | null {
  if (state.balanceLeft === null) return null;
  if (state.reserveReached) return alerted.reserve === today ? null : { kind: "reserve", days: null };
  const days = daysOfCredits(state.balanceLeft, usage, today);
  if (days === null) return null;
  // La plus grave qui n'est pas encore partie aujourd'hui : un palier franchi se dit même si « moins de 3 jours » est parti ce matin.
  const kind: CreditAlertKind | null = days < SURVIVAL_DAYS ? "survie" : days < ECONOMY_DAYS ? "economie" : days < LOW_CREDIT_DAYS ? "low" : null;
  return kind && alerted[kind] !== today ? { kind, days } : null;
}

/**
 * Ce qu'un poste a le droit de dépenser MAINTENANT, par morceaux (20/11/2026, deux fournisseurs) :
 *  - `units` : la part d'un passage (jour ÷ passages), bornée par le reste du jour et le reste de l'enveloppe du mois,
 *    EN UNITÉS (crédits ScrapeCreators et appels TikHub se partagent la même quantité du poste) ;
 *  - `capUsd` : le reste du plafond, en dollars (commun aux deux fournisseurs) ;
 *  - `open` : le poste peut-il partir chez ce fournisseur (branché, allumé, plafond non atteint, ni coupé par le
 *    plafond, ni par le palier du solde de CE fournisseur) ;
 *  - `balance` : ce que le solde de ce fournisseur permet encore, en unités (`Infinity` : jamais lu) ; chez TikHub,
 *    borné aussi par le reste de son plafond du jour (TH_DAY_CAP_USD).
 * `todayUnits` : les unités déjà dépensées aujourd'hui par le poste (cf radarSignals.todayCredits).
 */
export type AllowanceParts = { units: number; capUsd: number; open: Record<Provider, boolean>; balance: Record<Provider, number> };

export function allowanceParts(s: BudgetSettings, state: BudgetState, k: PosteKey, todayUnits: number, runsPerDay: number): AllowanceParts {
  const def = posteDef(k);
  const p = posteOf(s, k);
  const alive = def.live && p.on && !state.capReached && !state.capCut.includes(k);
  const perDay = def.monthlyCredits(p.qty) / DAYS_PER_MONTH;
  const leftToday = Math.max(0, Math.floor(perDay - todayUnits));
  const leftMonth = Math.max(0, Math.floor(def.monthlyCredits(p.qty) - state.byPoste[k].units));
  return {
    units: Math.min(Math.ceil(perDay / Math.max(1, runsPerDay)), leftToday, leftMonth),
    capUsd: s.capUsd - state.spentUsd,
    open: { sc: alive && !TIER_CUT[state.tier].includes(k), tikhub: alive && !TIER_CUT[state.th.tier].includes(k) },
    balance: { sc: state.balanceLeft ?? Infinity, tikhub: Math.min((TH_FREE_OK[k] ? state.th.allLeft : state.th.paidLeft) ?? Infinity, state.th.dayLeft ?? Infinity) },
  };
}

/** Ce que le reste du plafond paie chez ce fournisseur, en unités. */
export const capUnits = (capUsd: number, provider: Provider): number => Math.max(0, Math.floor(capUsd / priceOf(provider)));

/**
 * Crédits (unités) qu'un poste a le droit de dépenser MAINTENANT chez `provider` (ScrapeCreators par défaut) : la
 * part d'un passage (jour ÷ passages), bornée par le reste du jour, le reste de l'enveloppe du mois, le plafond et
 * le SOLDE réel de ce fournisseur moins sa réserve ; 0 si le poste est éteint, non branché, coupé, ou le plafond
 * atteint (sous la réserve, seule la sonde de la tâche des relevés part, cf `needsBalanceProbe`).
 */
export function allowance(
  s: BudgetSettings,
  state: BudgetState,
  k: PosteKey,
  todayCredits: number,
  runsPerDay: number,
  provider: Provider = "sc",
): number {
  const a = allowanceParts(s, state, k, todayCredits, runsPerDay);
  if (!a.open[provider]) return 0;
  return Math.min(a.units, capUnits(a.capUsd, provider), a.balance[provider]);
}

/** Ce qui reste de l'enveloppe du mois d'un poste, en unités (la part d'un rattrapage, cf `catchUpAllowance`). */
export function monthLeftUnits(s: BudgetSettings, state: BudgetState, k: PosteKey): number {
  const p = posteOf(s, k);
  return Math.max(0, Math.floor(posteDef(k).monthlyCredits(p.qty) - state.byPoste[k].units));
}

/**
 * La part d'un RATTRAPAGE (15/11/2026) : une app jamais cherchée puise dans ce qui reste du mois, pas dans la part du
 * jour — 171 apps attendaient (~25 crédits l'app), 3 à 4 jours au rythme du jour. L'enveloppe du mois, le plafond et le
 * solde bornent toujours : la dépense totale ne change pas, elle est avancée.
 */
export function catchUpAllowance(s: BudgetSettings, state: BudgetState, k: PosteKey, provider: Provider = "sc"): number {
  const def = posteDef(k);
  const p = posteOf(s, k);
  const a = allowanceParts(s, state, k, 0, 1);
  if (!def.live || !p.on || !a.open[provider]) return 0;
  return Math.min(monthLeftUnits(s, state, k), capUnits(a.capUsd, provider), a.balance[provider]);
}

/**
 * Dollars qu'un poste payé en dollars (l'analyse IA) peut encore dépenser ce
 * mois : le reste de son enveloppe, borné par le reste du plafond ; 0 s'il est
 * éteint, coupé, ou le plafond atteint.
 */
export function allowanceUsd(s: BudgetSettings, state: BudgetState, k: PosteKey): number {
  const def = posteDef(k);
  const p = posteOf(s, k);
  if (!def.live || !def.dollars || !p.on || state.capReached || state.cut.includes(k)) return 0;
  return Math.max(0, Math.min(p.qty - state.byPoste[k].usd, s.capUsd - state.spentUsd));
}

// ─── La courbe dans la voie gratuite (20/11/2026) ────────────────────────────

/** Ce que la courbe range d'un relevé (radarSignals.applyCurve n'en lit pas plus) : la vidéo et les abonnés de son compte. */
export type CurveCounts = { authorFans: number; views: number; likes: number; comments: number; shares: number; saves: number };
export const CURVE_COUNTS: readonly (keyof CurveCounts)[] = ["authorFans", "views", "likes", "comments", "shares", "saves"];
/** Un relevé payant (la vidéo entière) ramené à ce que la courbe range. */
export const curveCountsOf = (s: CurveCounts): CurveCounts => ({
  authorFans: s.authorFans,
  views: s.views,
  likes: s.likes,
  comments: s.comments,
  shares: s.shares,
  saves: s.saves,
});

/**
 * LES PAGES DE LA COURBE COMPTENT DANS LA VOIE GRATUITE. Lire la courbe sur la page publique d'une vidéo coûte une page
 * TikTok par relevé, 3 par vidéo admise (H+6, H+24, H+48). Ces pages partent des mêmes serveurs que la voie gratuite des
 * relevés de comptes (radarFreeMath.FREE_LANE_MAX_MS : une page à la fois, 0,3 à 0,7 s avant chacune — le rythme que
 * TikTok leur sert sans refus, 13/11/2026) : une seconde file à côté en doublerait le rythme. Elles passent donc DANS la
 * voie, en tête de chaque passage, dans sa file et dans son temps (radarSignals.curveInLane).
 * Or la voie est pleine : le 20/11/2026 vers 18 h, son dernier passage a relevé 99 comptes en 7 minutes (2 à 4 pages
 * chacun, ~200 à 400 pages — estimé, le nombre de pages n'est pas rangé) et en a laissé 42 au suivant. Chaque page de
 * courbe y prend la place d'une page de compte, d'où un plafond : 6 pages par passage (1,5 à 3 % d'un passage, 2 comptes
 * au plus repoussés de 10 minutes), 6 × 144 passages = 864 pages par jour, et des admissions bornées en PAGES :
 * 864 ÷ 3 = 288 vidéos par jour au plus (le poste en règle 100 : 300 pages par jour, 2 par passage en moyenne ; une
 * seule admission depuis le 15/11). Le relevé payant de l'heure en prenait 13 par heure (allowance : 300 crédits ÷ 24) ;
 * la voie, 36 : elle ne ralentit pas la courbe. Une vidéo due que la voie n'a pas prise en CURVE_LANE_WAIT_MS (passage
 * tombé, plafond atteint) part au relevé payant de l'heure (radarSignals.runCurve), comme avant.
 */
export const CURVE_PAGES_PER_VIDEO = CURVE_CHECKPOINTS_H.length;
export const CURVE_PAGES_PER_PASS = 6;
/** Passages de la voie par jour : la tâche des relevés de comptes part toutes les 10 minutes (convex/crons.ts). */
export const LANE_PASSES_PER_DAY = 144;
export const CURVE_PAGES_PER_DAY = CURVE_PAGES_PER_PASS * LANE_PASSES_PER_DAY;
export const CURVE_ADMISSIONS_MAX = Math.floor(CURVE_PAGES_PER_DAY / CURVE_PAGES_PER_VIDEO);
/** Trois passages de la voie : au-delà, une vidéo due part au relevé payant de l'heure. */
export const CURVE_LANE_WAIT_MS = 30 * 60_000;
/** Durée du verrou d'un passage de relevé de comptes (radarNetworks.runAccountReads) : une tâche est coupée à 10 minutes, le verrou tombe peu après. */
export const ACCOUNT_LEASE_MS = 10 * 60_000 + 30_000;
/** Deux passages de la voie (toutes les 10 minutes) sans fin de passage notée (radarSettings.lastFreeAt) : elle ne tourne plus. */
export const LANE_STALE_MS = 20 * 60_000;

/**
 * Jusqu'où le relevé payant de l'heure (radarSignals.runCurve, le filet) prend les relevés de courbe dus, sans jamais
 * prendre ce qu'un passage de la voie tient ni attendre une voie arrêtée (revue du 20/11/2026) :
 *  - un passage tourne (son verrou court jusqu'à `leaseUntil`, il est parti à `leaseUntil − ACCOUNT_LEASE_MS`) : il a pu
 *    prendre tout ce qui était dû depuis moins de CURVE_LANE_WAIT_MS à son départ, et ne l'a rangé qu'après ses pages et
 *    ses relevés payants (jusqu'à 6 minutes, le fournisseur lent) — le filet s'arrête avant, jamais deux relevés payés ;
 *  - la voie ne tourne plus (aucune fin de passage depuis LANE_STALE_MS, ou jamais) : tout ce qui est dû, comme avant la
 *    voie — un H+6 dû à 10:11 part à 10:40, pas à 11:40 ;
 *  - sinon, ce que la voie n'a pas pris en CURVE_LANE_WAIT_MS.
 * Reste un cas : la voie reprend après LANE_STALE_MS d'arrêt dans les secondes où le filet paie — au pire un relevé en
 * double, une fois.
 */
export function curveNetCutoff(now: number, lane: { leaseUntil?: number; lastFreeAt?: number }): number {
  if (lane.leaseUntil !== undefined && lane.leaseUntil > now) return Math.min(now, lane.leaseUntil - ACCOUNT_LEASE_MS) - CURVE_LANE_WAIT_MS;
  if (lane.lastFreeAt === undefined || now - lane.lastFreeAt > LANE_STALE_MS) return now;
  return now - CURVE_LANE_WAIT_MS;
}

/**
 * Vidéos de la courbe que la voie prend à ce passage : CURVE_PAGES_PER_PASS au plus ; tant que le relevé payant part
 * quand même (`free` faux, radarFreeMath.CURVE_FREE), pas plus que la part payante du passage (`paidLeft`) ; aucune si
 * le poste est éteint, comme avant.
 */
export function curveLaneTake(s: BudgetSettings, free: boolean, paidLeft: number): number {
  if (!posteOf(s, "curve").on) return 0;
  return free ? CURVE_PAGES_PER_PASS : Math.max(0, Math.min(CURVE_PAGES_PER_PASS, paidLeft));
}

/**
 * Admissions dans la courbe encore possibles aujourd'hui : le poste se règle en vidéos/jour. Relevée sur la page
 * (`free`, radarFreeMath.CURVE_FREE), la courbe est bornée par les pages que la voie gratuite peut lui donner
 * (CURVE_ADMISSIONS_MAX : 3 pages par vidéo). En mesure, chaque relevé part au payant et le filet paie ce que la voie
 * n'a pas pris : le plafond de pages ne ferait que retirer des vidéos réglées et payées (le curseur va jusqu'à 400).
 */
export function curveAdmissionsLeft(s: BudgetSettings, admittedToday: number, free: boolean): number {
  const p = posteOf(s, "curve");
  return p.on ? Math.max(0, (free ? Math.min(p.qty, CURVE_ADMISSIONS_MAX) : p.qty) - admittedToday) : 0;
}
