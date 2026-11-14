/**
 * Les données de chaque écran de l'app, calculées une fois par synchronisation à
 * partir de l'export du Radar (Jarvia, convex/swarmExport.ts). Fonctions pures :
 * aucun accès base ni réseau ici (cf convex/radarSync.ts).
 *
 * Chaque écran lit UN document (`boards`), déjà prêt : pas de calcul à l'affichage.
 * Les nombres restent bruts (vues, multiplicateurs, dates en ms) : la mise en forme
 * appartient aux écrans. Le contrat de chaque document est décrit dans
 * docs/donnees-app.md.
 */

// ─── Lignes de l'export ──────────────────────────────────────────────────────

export type Snapshot = { at: number; views: number };
export type RApp = { id: string; slug: string; name: string; status: string; trackedCount: number | null; mergedInto: string | null; createdAt: number;
  store?: { storeId?: string | number | null; url?: string | null; released?: string | null } | null;
  // La fiche que le Radar tient de l'app (Jarvia #505) : sa niche, et ce qu'elle est quand elle vient d'une campagne.
  niche?: string | null; market?: { productKind?: string | null } | null };
/**
 * Ce qui relie un compte à son app (Jarvia #507), sur ses 30 dernières vidéos : son pseudo, sa bio, ses vidéos qui la
 * citent (`cites` sur `of`) ; « seed » / « manual » : choisi à la main, sans preuve dans ses vidéos ; null : plus rien
 * ne le prouve.
 */
export type RProof = { by: "handle" | "bio" | "videos" | "seed" | "manual" | null; cites: number; of: number };
export type RTracked = {
  id: string; handle: string; appId: string; status: string; fans: number; bio: string | null; lang: string | null; country?: string | null;
  medianViews: number | null; videosSeen: number; lastPostAt: number | null; posts7d: number | null;
  igHandle: string | null; igFans: number | null; igMedianViews: number | null; addedAt: number;
  matchedBy?: string; proof?: RProof | null;
};
export type RVideo = {
  id: string; accountId: string; appId: string; platform: "tiktok" | "instagram"; videoId: string; publishedAt: number;
  views: number; snapshots: Snapshot[]; caption: string | null; hook: string | null; hookKey: string | null;
  musicTitle: string | null; coverUrl: string | null; region?: string | null;
  /** La vidéo cite-t-elle l'app sous laquelle elle est rangée (légende, texte à l'écran, pseudo) ? null : on ne sait pas. */
  cites?: boolean | null;
};
export type RFormatMember = { accountId: string; handle: string; appId: string; videoId: string; publishedAt: number; views: number; multiplier?: number; hook?: string; platform?: string };
export type RFormat = {
  id: string; kind: "hook" | "sound"; key: string; label: string; members: RFormatMember[]; accountCount: number;
  appIds: string[]; maxViews: number; lastPostAt: number; firstSeenAt: number; lang: string | null;
};
export type RSignal = {
  id: string; platform: "tiktok" | "instagram"; videoId: string; url: string; authorHandle: string; authorFans: number;
  caption: string; lang: string; region: string | null; publishedAt: number; durationSec: number | null; coverUrl: string | null;
  views: number; likes: number; comments: number; shares: number; saves: number; ratio: number; snapshots: Snapshot[];
  appId: string | null; appName: string | null; trackedAccountId: string | null; multiplier: number | null; hook: string | null;
  musicTitle: string | null; transcript: string | null; unavailable: string | null;
  cites?: boolean | null;
};
export type Raw = { apps: RApp[]; tracked: RTracked[]; trackedVideos: RVideo[]; formats: RFormat[]; signals: RSignal[] };

// ─── Référentiels ────────────────────────────────────────────────────────────

const DAY = 86_400_000;
const WEEK = 7 * DAY;
/** Historique jour par jour d'une app (vues des vidéos publiées ce jour-là, heure de Paris). */
export const DAYS = 42;
/** Décalage de Paris sur UTC à l'instant t : +2 h du dernier dimanche de mars au dernier dimanche d'octobre (1 h UTC), +1 h sinon. */
const parisOffset = (t: number) => {
  const y = new Date(t).getUTCFullYear();
  const lastSunday = (m: number) => { const d = new Date(Date.UTC(y, m + 1, 0)); return Date.UTC(y, m, d.getUTCDate() - d.getUTCDay(), 1); };
  return t >= lastSunday(2) && t < lastSunday(9) ? 2 * 3600_000 : 3600_000;
};
/** Numéro du jour (jours depuis le 1er janvier 1970) à Paris. */
export const parisDay = (t: number) => Math.floor((t + parisOffset(t)) / DAY);

/**
 * Marché d'un compte : la langue de ses vidéos quand le Radar la relève (fr, en, es-am, es-es, pt),
 * sinon son pays, sinon le pays d'où il publie le plus. Code = pays ISO (un drapeau par marché) ;
 * les pays d'une même langue se regroupent (anglophones, Amérique latine, germanophones, monde arabe…).
 * Jamais de fourre-tout « autres langues » : un compte sans aucun indice n'a pas de marché (null).
 */
const LANG_MARKET: Record<string, string> = { fr: "FR", en: "US", "es-am": "MX", "es-es": "ES", pt: "BR" };
const COUNTRY_GROUP: Record<string, string> = Object.fromEntries([
  ["US", "US GB CA AU NZ IE ZA NG GH KE JM TT UG ZW ZM"],
  ["MX", "MX AR CO CL PE VE EC BO PY UY GT HN SV NI CR PA DO CU PR"],
  ["BR", "BR PT AO MZ"],
  ["FR", "FR MC LU"],
  ["DE", "DE AT CH LI"],
  ["SA", "SA AE IQ KW QA BH OM JO LB SY YE EG LY SD DZ MA TN PS"],
  ["RU", "RU BY KZ KG TJ UZ"],
].flatMap(([m, cs]) => cs.split(" ").map((c) => [c, m])));
const MARKET_LABEL: Record<string, string> = {
  FR: "France", US: "États-Unis et anglophones", MX: "Amérique latine", ES: "Espagne", BR: "Brésil et Portugal",
  DE: "Allemagne et germanophones", SA: "Monde arabe", RU: "Russie et russophones",
};
const regionNames = new Intl.DisplayNames(["fr"], { type: "region" });
export const marketLabel = (code: string) => MARKET_LABEL[code] ?? (() => { try { return regionNames.of(code) ?? code; } catch { return code; } })();
const countryMarket = (c: string | null | undefined) => {
  const k = (c ?? "").trim().toUpperCase();
  return /^[A-Z]{2}$/.test(k) ? COUNTRY_GROUP[k] ?? k : null;
};
/** Marché d'une vidéo ou d'un signal sans compte suivi : sa langue, sinon sa région. */
export const marketOf = (lang: string | null | undefined, region?: string | null) => (lang && LANG_MARKET[lang]) || countryMarket(region);

/**
 * Niche de chaque app : celle de la fiche du Radar (Jarvia #505, 16 niches), sinon ce classement éditorial de Swarm
 * (les 49 apps du 13/11, que le Radar a repris tel quel). Jusqu'au 15/11, seul ce tableau comptait : 102 apps sur 147
 * tombaient en « Autres ».
 */
export const NICHES: Record<string, string> = {
  "Rizz App": "Séduction IA", "Astra AI": "Études", Knowunity: "Études", Love8: "Couple", WRizz: "Séduction IA", "Wing AI": "Séduction IA",
  "Cal AI": "Santé et physique", Praktika: "Langues", RecentFollow: "Jalousie et ex", "The Cringe": "Jalousie et ex", "Plug AI": "Séduction IA",
  Umax: "Santé et physique", "The Ick": "Jalousie et ex", FollowOtter: "Jalousie et ex", Shortfy: "Side hustle", Airbuds: "Social et loisirs",
  Sweatcoin: "Side hustle", "Voca AI": "Langues", Snitchy: "Jalousie et ex", Snitch: "Jalousie et ex", Fluencify: "Side hustle",
  "What Brandon Thinks": "Jalousie et ex", Flo: "Santé et physique", "Bible Chat": "Foi", Quittr: "Santé et physique", Creed: "Foi",
  Airlearn: "Langues", FollowSpy: "Jalousie et ex", "Retain Cards": "Études", "Glam AI": "Beauté IA", Shady: "Jalousie et ex",
  "Fit AI": "Santé et physique", Finch: "Santé et physique", Serializd: "Social et loisirs", "Rizz Master": "Séduction IA",
  CheatLove: "Jalousie et ex", Loverzz: "Couple", "Flert Now": "Séduction IA", Sunsay: "Autres", Stalkie: "Jalousie et ex", SafeNow: "Autres",
  Katch: "Jalousie et ex", Palima: "Autres", Lurk: "Jalousie et ex", TrendSaaS: "Side hustle", Susly: "Jalousie et ex",
  "Kairo Alarme": "Autres", "Leaked DMs": "Jalousie et ex", "Crush Tracker": "Jalousie et ex",
};
export const nicheOf = (a: { name: string; niche?: string | null }) => (a.niche && a.niche !== "Autres" ? a.niche : null) ?? NICHES[a.name] ?? "Autres";

/** Ce qu'est une app : une app (fiche App Store, ou campagne d'app), un logiciel ou un site web, ou on ne sait pas. */
export const kindOf = (a: RApp, store: string | null): "app" | "saas" | null =>
  store || a.store?.storeId || a.market?.productKind === "app" ? "app" : a.market?.productKind === "software" || siteOf(a.slug) ? "saas" : null;

/** Une app n'est listée qu'avec au moins 2 comptes qui la poussent, prouvés (un compte n'entre que prouvé, cf Jarvia #506). */
export const MIN_APP_ACCOUNTS = 2;
/** Un marché a son onglet à partir de 10 créateurs ; les autres restent sur chaque créateur (son drapeau) et dans « Tous ». */
export const MIN_MARKET_CREATORS = 10;
/** « Nouvelle » : sortie sur l'App Store il y a 60 jours au plus ; sans date de sortie, réseau dont la 1re vidéo a 30 jours au plus. */
const NEW_RELEASE_DAYS = 60;
const NEW_NETWORK_DAYS = 30;

/** Un compte que plus rien ne relie à son app (Jarvia #507 : `proof.by` null) n'est montré nulle part. */
export const isProven = (t: RTracked) => !(t.proof && t.proof.by === null);
/** Une vidéo qui ne cite pas son app ne compte pas pour elle (vues, classements, alertes) ; elle reste sur la fiche de son créateur. */
export const citesItsApp = (v: { cites?: boolean | null }) => v.cites !== false;

// ─── Outils ──────────────────────────────────────────────────────────────────

const median = (xs: number[]) => {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const round = (x: number, d = 2) => Math.round(x * 10 ** d) / 10 ** d;
/** Valeur la plus fréquente (null ignorés). */
const majority = (xs: (string | null)[]) => { const n = new Map<string, number>(); for (const x of xs) if (x) n.set(x, (n.get(x) ?? 0) + 1); return [...n.entries()].sort((p, q) => q[1] - p[1])[0]?.[0] ?? null; };
const roundOrNull = (x: number | null, d = 2) => (x === null ? null : round(x, d));
const groupBy = <T, K>(xs: T[], key: (x: T) => K) => {
  const m = new Map<K, T[]>();
  for (const x of xs) {
    const k = key(x);
    const l = m.get(k);
    if (l) l.push(x);
    else m.set(k, [x]);
  }
  return m;
};

/** Clé d'une miniature dans `media` : une par vidéo, une icône par app. */
export const coverKey = (videoId: string) => `v:${videoId}`;
export const iconKey = (slug: string) => `icon:${slug}`;
/**
 * Apps web (pas d'App Store) : leur site, d'où vient leur icône — ou l'adresse de l'icône elle-même (https://…)
 * quand la page d'accueil ne la donne pas au serveur. Vérifiés à la main le 13/11 (titre du site = l'app, comptes qui le citent).
 */
export const APP_SITE: Record<string, string> = {
  whatbrandonthinks: "www.whatbrandonthinks.com", theick: "theick.io", shortfy: "shortfy.io", followotter: "followotter.com",
  cheatlove: "https://cheatlove.io/apple-icon-180.png", katch: "www.katch.io", trendsaas: "trendsaas.ai", pumpgtm: "pumpgtm.com", unrealphotos: "www.unrealphotos.io",
  facelessclone: "facelessclone.com", "systeme.io": "systeme.io", wayinvideo: "wayin.ai",
  quittr: "quittrapp.com", glamai: "glam.ai", // retirées de l'App Store : leur identifiant ne répond plus
  "stealthy.lol": "stealthy.lol", "clipper.works": "clipper.works",
  // 14/11 : apps ajoutées au Radar le jour même (titre du site = l'app ; lien dans la bio des comptes quand il y en a)
  beehiiv: "www.beehiiv.com", metaklage: "www.meta-klage.de", ppcleaner: "ppcleaner.com", higgsfield: "https://higgsfield.ai/icon.png", // accueil de 770 Ko : son icône est hors des 200 000 premiers caractères lus
  vestmarkets: "www.vestmarkets.com", testmuai: "www.testmuai.com", recademics: "recademics.com",
  sundreamstudio: "sundream.studio", cheatgpt: "www.cheatgpt.app",
};

/**
 * Fiche App Store vérifiée à la main le 13/11, prioritaire sur la recherche par nom : nom partagé par
 * plusieurs apps (Fit AI, Parrot, Juno…) ou fiche que la recherche ne trouve pas.
 * Preuve : la bio ou le site des comptes qui poussent l'app (« Ambassadrice FitAI », « Juno Ambassador »…).
 */
export const APP_STORE_ID: Record<string, string> = {
  airbuds: "1638906106", tapcook: "6769601354", shady: "6677005589",
  exposr: "6752903766", fitai: "6760222328", bear: "6759631411", scrollthebible: "6756558351", artie: "6746756746",
  sauceai: "6754392050", juno: "6749455368", drawly: "6746277626", babyplate: "6744701507", nursemind: "6767489231",
  nextrainers: "6754344542", budgetbestie: "6460258044", kairo: "6761457623", parrot: "6736955121", mealplanner: "6776097857",
  sacredshorts: "6759298323", collect: "6752740187", settlemate: "6737785495", jetback: "6744909694", snitch: "6755113649",
  meagain: "6744178534", kiwipop: "6484501975", claimhunt: "6755202426", recipevault: "6758783243", motonovel: "6744429534",
  aisance: "6739868546", hairlyai: "6754688430", medidojo: "6503365052", rivetlive: "6756558210", liftly: "6762517196",
};

/** Un nom d'app qui est un domaine (pen.dev, flip.gg, relay.fast) : l'app est ce site. */
const DOMAIN_NAME = /^[a-z0-9][a-z0-9-]*(\.[a-z0-9-]+)*\.[a-z]{2,}$/;
/** Le site d'où vient l'icône d'une app web : déclaré à la main, sinon son nom quand c'est un domaine (et pas de fiche épinglée). */
export const siteOf = (slug: string): string | null => APP_SITE[slug] ?? (!APP_STORE_ID[slug] && DOMAIN_NAME.test(slug) ? slug : null);

/** La bio sans les e-mails ni numéros de téléphone : Swarm montre ce que fait un compte, pas comment le contacter. */
export const cleanBio = (bio: string | null) => {
  if (!bio) return bio;
  const out = bio
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, "")
    .replace(/\+?\(?\d[\d .()-]{7,}\d/g, (m) => (m.replace(/\D/g, "").length >= 9 ? "" : m)) // téléphone : 9 chiffres ou plus
    .replace(/[ \t]*[|·•,:;-]?[ \t]*(?:📧|✉️?|📩|📞|☎️?|📱)[ \t]*[|·•,:;-]?/gu, " ")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/[ \t]*[|·•,:;-][ \t]*$/gm, "")
    .trim();
  return out || null;
};

/** Une vidéo, telle que la voient les écrans (vignette, lecteur). */
export type VideoCard = { id: string; platform: string; handle: string; app: string | null; views: number; x: number | null; publishedAt: number; cover: string | null; hook: string | null };

// ─── Le calcul ───────────────────────────────────────────────────────────────

export type Boards = Map<string, unknown>;
export type MediaNeed = Map<string, string>; // clé media -> URL source (TikTok, signée)

export function buildBoards(
  raw: Raw,
  now: number,
  mediaUrl: (key: string) => string | null,
  storeOf: (slug: string) => string | null = () => null,
  opts: {
    /** Miniature introuvable récemment (vidéo supprimée, compte privé) : la vidéo n'apparaît pas. */
    missing?: (key: string) => boolean;
    /** Adresse qui sert une miniature pas encore copiée (/cover/<id>, copie à la première vue). */
    coverUrl?: (videoId: string) => string | null;
    /** Icône de la fiche App Store retenue (adresse mzstatic), copiée sans rappeler l'App Store. */
    artOf?: (slug: string) => string | null;
  } = {},
): { boards: Boards; need: MediaNeed; used: Set<string> } {
  const missing = opts.missing ?? (() => false);
  const coverUrl = opts.coverUrl ?? (() => null);
  const boards: Boards = new Map();
  const need: MediaNeed = new Map();
  const used = new Set<string>(); // clés media citées par un document : le reste peut être effacé

  // Apps : on suit les fusions, on écarte les apps en pause.
  const appById = new Map(raw.apps.map((a) => [a.id, a]));
  const canonical = (id: string | null | undefined): RApp | null => {
    let a = id ? appById.get(id) ?? null : null;
    for (let i = 0; a && a.mergedInto && i < 5; i++) a = appById.get(a.mergedInto) ?? a;
    return a;
  };
  const apps = raw.apps.filter((a) => !a.mergedInto && a.status === "active");
  const icon = (a: RApp) => (used.add(iconKey(a.slug)), mediaUrl(iconKey(a.slug)));

  // Les comptes suivis ET prouvés : ce sont eux qui « poussent » une app (cf isProven).
  const accounts = raw.tracked.filter((t) => t.status === "active" && isProven(t));
  const accountById = new Map(raw.tracked.map((t) => [t.id, t]));
  const signalByVideo = new Map(raw.signals.filter((s) => !s.unavailable).map((s) => [s.videoId, s]));
  const trackedByVideo = new Map(raw.trackedVideos.map((v) => [v.videoId, v]));
  const trackedByHandle = new Map(raw.tracked.map((t) => [t.handle, t]));
  /** Une reprise d'un format que le Radar n'a pas dans ses vidéos suivies : sa page part de ce que le format en sait. */
  const memberVideo = (m: RFormatMember): RVideo => ({
    id: "", accountId: m.accountId, appId: m.appId, platform: m.platform === "instagram" ? "instagram" : "tiktok", videoId: m.videoId,
    publishedAt: m.publishedAt, views: m.views, snapshots: [], caption: null, hook: m.hook ?? null, hookKey: null, musicTitle: null, coverUrl: null,
  });

  // Une vidéo = le relevé du compte suivi, complété par le signal s'il y en a un.
  const xOf = (v: { views: number; accountId?: string | null }, s?: RSignal | null) => {
    if (s?.multiplier) return round(s.multiplier, 1);
    const acc = v.accountId ? accountById.get(v.accountId) : null;
    const med = acc?.medianViews;
    return med && med > 0 ? round(v.views / med, 1) : null;
  };
  /**
   * Miniature : la copie rangée chez Swarm ; sinon, si la vidéo existe toujours, l'adresse qui la
   * copie à la première vue (et la copie est demandée pour ce passage) ; null si elle est introuvable.
   * RÈGLE (13/11) : une vidéo sans image (supprimée, compte privé) n'apparaît nulle part : les listes
   * ne gardent que les vidéos dont la miniature n'est pas null.
   */
  const cover = (videoId: string, source: string | null | undefined, handle: string | null | undefined) => {
    const key = coverKey(videoId);
    used.add(key);
    const stored = mediaUrl(key);
    if (stored) return stored;
    if (missing(key)) return null;
    if (source) need.set(key, source); // un HEIC est converti à la copie (convex/imageCopy.ts)
    else if (/^\d+$/.test(videoId)) need.set(key, `ttpage:${handle ?? ""}/${videoId}`);
    else if (videoId.startsWith("ig:")) need.set(key, `igpage:${videoId.slice(3)}`);
    return coverUrl(videoId);
  };
  /** Les n premières vidéos (dans l'ordre donné) qui ont une image ; la copie des suivantes est demandée. */
  /** Photo de profil d'un compte TikTok : copiée d'avance par la synchro (servie par /avatar/<handle>). */
  const wantAvatar = (handle: string | null | undefined) => {
    if (!handle) return;
    const key = `a:${handle}`;
    used.add(key);
    if (!mediaUrl(key) && !missing(key)) need.set(key, `ttavatar:${handle}`);
  };
  const withImage = <T,>(vs: T[], n: number, has: (v: T) => boolean): T[] => {
    const out: T[] = [];
    for (const v of vs.slice(0, Math.max(n * 3, n + 10))) if (has(v) && out.length < n) out.push(v);
    return out;
  };
  const trackedHasImage = (v: RVideo) => {
    const s = signalByVideo.get(v.videoId);
    return cover(v.videoId, v.coverUrl ?? s?.coverUrl, accountById.get(v.accountId)?.handle ?? s?.authorHandle) !== null;
  };
  const card = (v: RVideo): VideoCard => {
    const s = signalByVideo.get(v.videoId);
    const acc = accountById.get(v.accountId);
    return {
      id: v.videoId,
      platform: v.platform,
      handle: acc?.handle ?? s?.authorHandle ?? "",
      // Une vidéo qui ne cite pas son app n'est pas une vidéo de l'app (sur la fiche de son créateur, sans app).
      app: citesItsApp(v) ? canonical(v.appId)?.slug ?? null : null,
      views: Math.max(v.views, s?.views ?? 0),
      x: xOf(v, s),
      publishedAt: v.publishedAt,
      cover: cover(v.videoId, v.coverUrl ?? s?.coverUrl, acc?.handle ?? s?.authorHandle),
      hook: v.hook ?? s?.hook ?? null,
    };
  };

  // Sous une app, seulement les vidéos qui la citent : le 14/11, 27 % des vidéos des comptes suivis ne citaient pas
  // la leur (vidéos perso d'un vrai créateur, vidéos d'une autre app) et gonflaient vues, top et « meilleure ».
  const videosByApp = groupBy(raw.trackedVideos.filter(citesItsApp), (v) => canonical(v.appId)?.id ?? "");
  const videosByAccount = groupBy(raw.trackedVideos, (v) => v.accountId);
  const marketByAccount = new Map<string, string | null>();
  for (const t of raw.tracked) {
    let m = (t.lang && LANG_MARKET[t.lang]) || countryMarket(t.country);
    if (!m) {
      const n = new Map<string, number>();
      for (const v of videosByAccount.get(t.id) ?? []) { const r = countryMarket(v.region); if (r) n.set(r, (n.get(r) ?? 0) + 1); }
      m = [...n.entries()].sort((p, q) => q[1] - p[1])[0]?.[0] ?? null;
    }
    marketByAccount.set(t.id, m);
  }
  const mkOf = (accountId: string | null | undefined) => (accountId ? marketByAccount.get(accountId) ?? null : null);
  // Les marchés présents, du plus fourni au moins fourni (comptes actifs).
  const marketCount = new Map<string, number>();
  for (const t of accounts) { const m = mkOf(t.id); if (m) marketCount.set(m, (marketCount.get(m) ?? 0) + 1); }
  // Un onglet par marché fourni (10 créateurs au moins) : le 13/11, 22 onglets sur 30 avaient 5 créateurs ou moins.
  const MARKETS = [...marketCount.entries()]
    .filter(([, n]) => n >= MIN_MARKET_CREATORS)
    .sort((p, q) => q[1] - p[1])
    .map(([c, n]) => [c, marketLabel(c), n] as [string, string, number]);
  const accountsByApp = groupBy(accounts, (t) => canonical(t.appId)?.id ?? "");
  const usedVideos = new Map<string, RVideo>();
  const use = (vs: RVideo[]) => vs.forEach((v) => usedVideos.set(v.videoId, v));

  // ── Apps : le classement, et la fiche de chaque app ──
  const appRows = apps.map((a) => {
    const vids = videosByApp.get(a.id) ?? [];
    const recent = vids.filter((v) => now - v.publishedAt <= 30 * DAY);
    const week = vids.filter((v) => now - v.publishedAt <= 7 * DAY);
    const weeks = Array.from({ length: 6 }, (_, i) => {
      const end = now - (5 - i) * WEEK;
      return vids.filter((v) => v.publishedAt > end - WEEK && v.publishedAt <= end).reduce((n, v) => n + v.views, 0);
    });
    // Vues par jour de publication sur les DAYS derniers jours (le dernier = aujourd'hui à Paris).
    const dayEnd = parisDay(now);
    const days = new Array(DAYS).fill(0), daysIg = new Array(DAYS).fill(0);
    for (const v of vids) {
      const i = parisDay(v.publishedAt) - dayEnd + DAYS - 1;
      if (i < 0 || i >= DAYS) continue;
      days[i] += v.views;
      if (v.platform === "instagram") daysIg[i] += v.views;
    }
    const views30 = recent.reduce((n, v) => n + v.views, 0);
    const views30Ig = recent.filter((v) => v.platform === "instagram").reduce((n, v) => n + v.views, 0);
    const views7 = week.reduce((n, v) => n + v.views, 0);
    const views7Ig = week.filter((v) => v.platform === "instagram").reduce((n, v) => n + v.views, 0);
    const best = week.map((v) => xOf(v, signalByVideo.get(v.videoId))).filter((x): x is number => x !== null);
    const accs = accountsByApp.get(a.id) ?? [];
    const byAccount = [...groupBy(recent, (v) => v.accountId).values()].map((vs) => vs.reduce((n, v) => n + v.views, 0)).sort((p, q) => q - p);
    const known = recent.filter((v) => mkOf(v.accountId));
    const knownViews = known.reduce((n, v) => n + v.views, 0);
    const markets = [...groupBy(known, (v) => mkOf(v.accountId) as string).entries()]
      .map(([m, vs]) => [m, knownViews ? Math.round((vs.reduce((n, v) => n + v.views, 0) / knownViews) * 100) : 0] as [string, number])
      .filter(([, p]) => p > 0)
      .sort((p, q) => q[1] - p[1]);
    const top = withImage([...recent].sort((p, q) => q.views - p.views), 12, trackedHasImage);
    use(top);
    const store = storeOf(a.slug);
    const released = a.store?.released ? Date.parse(a.store.released) : NaN;
    const firstVideo = vids.length ? Math.min(...vids.map((v) => v.publishedAt)) : null;
    return {
      slug: a.slug, name: a.name, niche: nicheOf(a), icon: icon(a), kind: kindOf(a, store),
      accounts: accs.length, videosPerWeek: week.length, dayEnd, days, daysIg,
      views30, views30Ig, views7, views7Ig, weeks,
      weekDelta: weeks[4] > 0 ? round((weeks[5] - weeks[4]) / weeks[4], 3) : null,
      bestX: best.length ? Math.max(...best) : null,
      top10Share: views30 ? round(byAccount.slice(0, 10).reduce((n, v) => n + v, 0) / views30, 3) : null,
      markets,
      trackedSince: a.createdAt,
      // Nouvelle : sortie récemment, ou réseau qui vient de démarrer (et non « arrivée récemment dans le Radar » : le
      // 14/11, toutes les apps l'étaient).
      isNew: Number.isFinite(released) ? now - released <= NEW_RELEASE_DAYS * DAY : firstVideo !== null && now - firstVideo <= NEW_NETWORK_DAYS * DAY,
      released: Number.isFinite(released) ? released : null,
      videoCount: recent.length,
      store,
      top: top.slice(0, 3).map(card),
      _top12: top.slice(0, 12),
      _accs: accs,
    };
  });
  // Une app sans réseau prouvé (2 comptes au moins) n'est pas listée : sa fiche existe, elle se montre dès qu'elle l'a.
  const appsBoard = appRows.filter((r) => r.accounts >= MIN_APP_ACCOUNTS).map(({ _top12, _accs, ...r }) => r).sort((p, q) => q.views30 - p.views30);
  boards.set("apps", { updatedAt: now, markets: MARKETS, niches: [...new Set(appsBoard.map((a) => a.niche))].sort(), apps: appsBoard });

  // ── Formats ──
  const accountX = (m: RFormatMember) => {
    if (typeof m.multiplier === "number") return round(m.multiplier, 1);
    const med = accountById.get(m.accountId)?.medianViews;
    return med && med > 0 ? round(m.views / med, 1) : null;
  };
  const appMini = (id: string) => {
    const a = canonical(id);
    return a ? { slug: a.slug, name: a.name, icon: icon(a) } : null;
  };
  const formatRows = raw.formats
    // Un format = repris par au moins 3 comptes : à 2, ce sont surtout des sons au hasard.
    .filter((f) => f.accountCount >= 3 && now - f.lastPostAt <= 21 * DAY)
    .map((f) => {
      const xs = f.members.map(accountX).filter((x): x is number => x !== null);
      const sorted = [...f.members].sort((p, q) => q.views - p.views);
      const coverOf = (m: RFormatMember) => cover(m.videoId, trackedByVideo.get(m.videoId)?.coverUrl ?? signalByVideo.get(m.videoId)?.coverUrl, m.handle);
      // Les reprises montrées : seulement celles qui ont une image (les chiffres portent sur toutes).
      const members = withImage(sorted, sorted.length, (m) => coverOf(m) !== null).map((m) => {
        const tv = trackedByVideo.get(m.videoId);
        return { _video: tv ?? memberVideo(m), handle: m.handle, videoId: m.videoId, views: m.views, x: accountX(m), publishedAt: m.publishedAt, cover: coverOf(m) };
      });
      const appIdsOf = [...new Set(f.appIds.map((id) => canonical(id)?.id).filter(Boolean) as string[])];
      const appsOf = appIdsOf.map(appMini).filter(Boolean);
      const firstApp = appIdsOf.length ? appById.get(appIdsOf[0]) : undefined;
      return {
        id: f.id, kind: f.kind, label: f.label, accounts: f.accountCount, apps: appsOf,
        niche: firstApp ? nicheOf(firstApp) : "Autres", market: (f.lang && LANG_MARKET[f.lang]) || majority(f.members.map((m) => mkOf(m.accountId))),
        maxViews: f.maxViews, medX: roundOrNull(median(xs), 1), wins: xs.filter((x) => x > 1).length, n: f.members.length,
        lastPostAt: f.lastPostAt, firstSeenAt: f.firstSeenAt, members,
      };
    })
    .filter((f) => f.members.length > 0) // un format sans aucune reprise montrable n'apparaît pas
    .sort((p, q) => q.accounts - p.accounts || (q.medX ?? 0) - (p.medX ?? 0));
  // Chaque reprise montrée mène à sa vidéo : elle a sa page dans le lecteur.
  const shown = formatRows.slice(0, 150);
  for (const f of shown) for (const m of f.members.slice(0, 30)) if (!usedVideos.has(m.videoId)) usedVideos.set(m.videoId, m._video);
  const plain = (ms: (typeof formatRows)[number]["members"]) => ms.map(({ _video, ...m }) => m);
  boards.set("formats", { updatedAt: now, markets: MARKETS, formats: shown.map((f) => ({ ...f, members: plain(f.members.slice(0, 4)) })) });
  for (const f of shown) boards.set(`format:${f.id}`, { updatedAt: now, ...f, members: plain(f.members.slice(0, 30)) });
  const formatsByAccount = groupBy(
    raw.formats.flatMap((f) => f.members.map((m) => ({ accountId: m.accountId, f }))),
    (x) => x.accountId,
  );

  // ── Créateurs, par marché, et la fiche de chaque créateur ──
  const creatorRow = (t: RTracked) => {
    const vids = (videosByAccount.get(t.id) ?? []).sort((p, q) => q.publishedAt - p.publishedAt);
    const best = withImage([...vids].filter((v) => now - v.publishedAt <= 30 * DAY).sort((p, q) => q.views - p.views), 3, trackedHasImage);
    use(best);
    const a = canonical(t.appId);
    return {
      handle: t.handle, bio: cleanBio(t.bio), fans: t.fans, median: t.medianViews, posts7d: t.posts7d ?? 0, lastPostAt: t.lastPostAt,
      market: mkOf(t.id), app: a ? { slug: a.slug, name: a.name, icon: icon(a), niche: nicheOf(a) } : null,
      // Ce qui le relie à son app (cf RProof), montré sur sa fiche et dans les listes.
      proof: t.proof ?? null,
      igHandle: t.igHandle, best: best.map(card), _vids: vids,
    };
  };
  const creators = accounts.filter((t) => (t.medianViews ?? 0) > 0).map(creatorRow).sort((p, q) => (q.median ?? 0) - (p.median ?? 0));
  for (const c of creators) wantAvatar(c.handle);
  for (const [code] of MARKETS) {
    const list = creators.filter((c) => c.market === code).slice(0, 200).map(({ _vids, ...c }) => c);
    boards.set(`creators:${code}`, { updatedAt: now, market: code, markets: MARKETS, total: creators.filter((c) => c.market === code).length, creators: list });
  }
  boards.set("creators:ALL", { updatedAt: now, market: "ALL", markets: MARKETS, total: creators.length, creators: creators.slice(0, 200).map(({ _vids, ...c }) => c) });
  const creatorPages = new Set(MARKETS.flatMap(([code]) => creators.filter((c) => c.market === code).slice(0, 200).map((c) => c.handle)));
  for (const c of creators) {
    if (!creatorPages.has(c.handle)) continue;
    const t = trackedByHandle.get(c.handle)!;
    const vids = withImage(c._vids, 15, trackedHasImage);
    use(vids);
    const fmts = (formatsByAccount.get(t.id) ?? []).map((x) => x.f).filter((f, i, arr) => arr.indexOf(f) === i && f.accountCount >= 3);
    const { _vids, ...row } = c;
    boards.set(`creator:${c.handle}`, {
      updatedAt: now, ...row,
      videos: vids.map(card),
      formats: fmts.slice(0, 10).map((f) => ({ id: f.id, kind: f.kind, label: f.label, accounts: f.accountCount })),
    });
  }

  // ── Fiche de chaque app (après les formats et créateurs, qu'elle cite) ──
  for (const r of appRows) {
    const a = apps.find((x) => x.slug === r.slug)!;
    const appCreators = r._accs
      .filter((t) => (t.medianViews ?? 0) > 0)
      .sort((p, q) => (q.medianViews ?? 0) - (p.medianViews ?? 0))
      .slice(0, 10)
      .map((t) => ({ handle: t.handle, fans: t.fans, median: t.medianViews, posts7d: t.posts7d ?? 0, market: mkOf(t.id), page: creatorPages.has(t.handle), proof: t.proof ?? null }));
    const appFormats = formatRows.filter((f) => f.apps.some((x) => x?.slug === a.slug)).slice(0, 8).map((f) => ({ id: f.id, kind: f.kind, label: f.label, accounts: f.accounts, medX: f.medX, maxViews: f.maxViews }));
    const { _top12, _accs, ...row } = r;
    boards.set(`app:${a.slug}`, { updatedAt: now, ...row, videos: _top12.map(card), formats: appFormats, creators: appCreators });
  }

  // ── Vidéos qui décollent : alertes et accueil ──
  const hot = withImage(
    raw.signals.filter((s) => !s.unavailable && citesItsApp(s) && s.multiplier && now - s.publishedAt <= 7 * DAY).sort((p, q) => (q.multiplier ?? 0) - (p.multiplier ?? 0)),
    40,
    (s) => cover(s.videoId, s.coverUrl, s.authorHandle) !== null,
  );
  const hotCards = hot.slice(0, 40).map((s) => {
    const a = canonical(s.appId);
    return {
      id: s.videoId, platform: s.platform, handle: s.authorHandle, app: a ? { slug: a.slug, name: a.name, icon: icon(a) } : null,
      views: s.views, x: round(s.multiplier ?? 0, 1), publishedAt: s.publishedAt, cover: cover(s.videoId, s.coverUrl, s.authorHandle), hook: s.hook,
      market: s.trackedAccountId && mkOf(s.trackedAccountId) ? mkOf(s.trackedAccountId) : marketOf(s.lang, s.region), region: s.region,
    };
  });
  const newFormats = formatRows.filter((f) => f.accounts >= 3 && now - f.firstSeenAt <= 7 * DAY).slice(0, 20);
  boards.set("alerts", { updatedAt: now, videos: hotCards, formats: newFormats.map((f) => ({ ...f, members: plain(f.members.slice(0, 3)) })) });
  const nicheViews = [...groupBy(appsBoard, (a) => a.niche).entries()].map(([n, as]) => [n, as.reduce((s, a) => s + a.views7, 0)] as [string, number]).sort((p, q) => q[1] - p[1]);
  boards.set("home", {
    updatedAt: now,
    niches: nicheViews.filter(([n]) => n !== "Autres").slice(0, 6).map(([n]) => n),
    apps: appsBoard.slice(0, 4).map((a) => ({ slug: a.slug, name: a.name, icon: a.icon, views7: a.views7, weekDelta: a.weekDelta, bestX: a.bestX })),
    videos: hotCards.slice(0, 4),
    formats: formatRows.slice(0, 3).map((f) => ({ id: f.id, kind: f.kind, label: f.label, accounts: f.accounts, medX: f.medX })),
  });

  // ── Ce que le Radar suit, pour la page d'accueil publique et la date du relevé (« Relevé du … ») ──
  // `at` change à chaque passage : ce document est réécrit chaque nuit (les autres seulement s'ils changent).
  boards.set("stats", { updatedAt: now, at: now, apps: appsBoard.length, accounts: accounts.length, markets: MARKETS.length });

  // ── Recherche (palette) : un index léger ──
  boards.set("search", {
    updatedAt: now,
    apps: appsBoard.map((a) => ({ slug: a.slug, name: a.name, icon: a.icon, niche: a.niche, views30: a.views30 })),
    creators: creators.filter((c) => creatorPages.has(c.handle)).map((c) => ({ handle: c.handle, app: c.app?.name ?? null, fans: c.fans, median: c.median })),
    formats: formatRows.slice(0, 150).map((f) => ({ id: f.id, kind: f.kind, label: f.label, accounts: f.accounts })),
  });

  // ── Lecteur : une page par vidéo citée ailleurs ──
  for (const s of hot.slice(0, 40)) {
    const tv = trackedByVideo.get(s.videoId);
    if (tv) usedVideos.set(tv.videoId, tv);
  }
  for (const v of usedVideos.values()) boards.set(`video:${v.videoId}`, videoPage(v, signalByVideo.get(v.videoId) ?? null));
  for (const s of hot.slice(0, 40)) if (!usedVideos.has(s.videoId)) boards.set(`video:${s.videoId}`, videoPage(null, s));

  function videoPage(v: RVideo | null, s: RSignal | null) {
    const acc = v ? accountById.get(v.accountId) : s?.trackedAccountId ? accountById.get(s.trackedAccountId) : undefined;
    // Une vidéo qui ne cite pas son app n'est rattachée à aucune.
    const a = (v && !citesItsApp(v)) || (s && !citesItsApp(s)) ? null : canonical(v?.appId ?? s?.appId ?? null);
    const id = (v?.videoId ?? s?.videoId)!;
    const views = Math.max(v?.views ?? 0, s?.views ?? 0);
    const handle = acc?.handle ?? s?.authorHandle ?? "";
    const platform = v?.platform ?? s?.platform ?? "tiktok";
    const playlist = a ? ((boards.get(`app:${a.slug}`) as { videos?: VideoCard[] } | undefined)?.videos ?? []).map((c) => c.id) : [];
    return {
      updatedAt: now, id, platform,
      url: s?.url ?? (platform === "instagram" ? `https://www.instagram.com/reel/${id.replace(/^ig:/, "")}/` : `https://www.tiktok.com/@${handle}/video/${id}`),
      handle, fans: acc?.fans ?? s?.authorFans ?? null, normal: acc?.medianViews ?? null,
      app: a ? { slug: a.slug, name: a.name, icon: icon(a), niche: nicheOf(a) } : null,
      market: acc ? mkOf(acc.id) ?? marketOf(s?.lang, s?.region ?? v?.region) : marketOf(s?.lang, s?.region ?? v?.region), region: s?.region ?? null,
      publishedAt: v?.publishedAt ?? s?.publishedAt ?? null, durationSec: s?.durationSec ?? null,
      views, x: v ? xOf(v, s) : s?.multiplier ? round(s.multiplier, 1) : null,
      likes: s?.likes ?? null, comments: s?.comments ?? null, shares: s?.shares ?? null, saves: s?.saves ?? null,
      snapshots: (s?.snapshots?.length ? s.snapshots : v?.snapshots ?? []).slice(-12),
      hook: v?.hook ?? s?.hook ?? null, caption: v?.caption ?? s?.caption ?? null, transcript: s?.transcript ?? null,
      music: v?.musicTitle ?? s?.musicTitle ?? null,
      cover: cover(id, v?.coverUrl ?? s?.coverUrl, handle),
      playlist,
    };
  }

  // Icônes des apps : à chercher si on ne les a pas encore.
  // Icônes des apps : la fiche App Store retenue (identifiant), sinon le site d'une app web, sinon la recherche par nom.
  for (const a of apps) {
    if (mediaUrl(iconKey(a.slug))) continue;
    const art = opts.artOf?.(a.slug) ?? null;
    const id = (storeOf(a.slug) ?? "").match(/\/id(\d+)/)?.[1] ?? null;
    const site = siteOf(a.slug);
    const src = site ? (site.startsWith("https://") ? site : `site:${site}`) : art ?? (id ? `itunesid:${id}` : null);
    if (src) need.set(iconKey(a.slug), src);
  }

  return { boards, need, used };
}
