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

import { COVER_ID, TIKTOK_ID } from "./coverSign";
/** Ids de vidéo servis par /cover (lus par les bancs, qui empaquettent ce module). */
export { COVER_ID };

// ─── Lignes de l'export ──────────────────────────────────────────────────────

export type Snapshot = { at: number; views: number };
export type RApp = { id: string; slug: string; name: string; status: string; trackedCount: number | null; mergedInto: string | null; createdAt: number;
  store?: { storeId?: string | number | null; url?: string | null; released?: string | null } | null;
  // La fiche que le Radar tient de l'app (Jarvia #505) : sa niche, et ce qu'elle est quand elle vient d'une campagne.
  niche?: string | null; market?: { productKind?: string | null } | null;
  /** Ce qu'est l'app pour le Radar (Jarvia lot 4 B) : app, saas, jeu_mobile… ; null tant qu'elle n'est pas jugée. */
  kind?: string | null };
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
  /** Placement payé (Jarvia lot 4 B) : payé une ou deux fois pour l'app, ce n'est pas un de ses créateurs. */
  placement?: boolean;
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
 * Marché = un PAYS (code ISO, un drapeau), jamais un groupe de pays. Décision du 14/11 : les États-Unis et le
 * Royaume-Uni ne sont pas le même marché, le Brésil et le Portugal non plus, et « Amérique latine » ne dit pas si
 * c'est le Mexique ou le Chili. Jusque-là la langue passait avant le pays : 1 271 comptes sur 2 724 étaient rangés
 * hors de leur propre pays (des Britanniques, des comptes en Allemagne ou aux Philippines « anglophones »…).
 * La langue ne donne plus jamais un pays (l'anglais se parle partout).
 */
export const countryCode = (c: string | null | undefined) => {
  const k = (c ?? "").trim().toUpperCase();
  return /^[A-Z]{2}$/.test(k) && k !== "XX" ? k : null;
};
const regionNames = new Intl.DisplayNames(["fr"], { type: "region" });
export const marketLabel = (code: string) => (code === "XX" ? "Pays inconnu" : (() => { try { return regionNames.of(code) ?? code; } catch { return code; } })());

/** Marché d'une vidéo ou d'un signal sans compte suivi : le pays où la vidéo a été créée. */
export const marketOf = (_lang: string | null | undefined, region?: string | null) => countryCode(region);


/**
 * Les langues de chaque pays : une langue qui n'en est pas une s'affiche à côté du pays (« France · en espagnol »).
 * Un pays absent de la table n'affiche jamais de langue (on ne sait pas). Les États-Unis sont « en » seul : un compte
 * américain en espagnol vise l'Amérique latine, c'est utile à voir.
 */
export const COUNTRY_LANGS: Record<string, string[]> = {
  US: ["en"], GB: ["en"], CA: ["en", "fr"], AU: ["en"], NZ: ["en"], IE: ["en"], NG: ["en"], KE: ["en"], ZA: ["en"], GH: ["en"], UG: ["en"],
  JM: ["en"], IN: ["en"], PK: ["en"], PH: ["en", "tl"], SG: ["en"], MY: ["en", "id"], LK: ["en"], NA: ["en"], ET: ["en"], NP: ["en"], BD: ["en"],
  FR: ["fr"], BE: ["fr", "nl", "de"], CH: ["de", "fr", "it"], LU: ["fr", "de"], MC: ["fr"], RE: ["fr"], PF: ["fr"], CI: ["fr"], SN: ["fr"],
  CM: ["fr", "en"], CD: ["fr"], CG: ["fr"], BF: ["fr"], TG: ["fr"], BJ: ["fr"], NE: ["fr"], MG: ["fr"], HT: ["fr"], BI: ["fr"],
  MA: ["ar", "fr"], DZ: ["ar", "fr"], TN: ["ar", "fr"], LB: ["ar", "fr"],
  ES: ["es"], MX: ["es"], AR: ["es"], CL: ["es"], CO: ["es"], PE: ["es"], VE: ["es"], EC: ["es"], NI: ["es"], HN: ["es"], UY: ["es"], DO: ["es"],
  PY: ["es"], CR: ["es"], BO: ["es"], PA: ["es"], GT: ["es"], SV: ["es"], CU: ["es"], PR: ["es", "en"],
  BR: ["pt"], PT: ["pt"], AO: ["pt"], MZ: ["pt"],
  DE: ["de"], AT: ["de"], IT: ["it"], NL: ["nl"], PL: ["pl"], RO: ["ro"], MD: ["ro", "ru"], HU: ["hu"], CZ: ["cs"], SK: ["cs"], SE: ["sv"],
  DK: ["da"], FI: ["fi", "sv"], GR: ["el"], CY: ["el", "tr"], TR: ["tr"], UA: ["uk", "ru"], RU: ["ru"], BY: ["ru"], KZ: ["ru"], IL: ["he", "ar"],
  EG: ["ar"], SA: ["ar"], AE: ["ar", "en"], KW: ["ar"], OM: ["ar"], QA: ["ar"], JO: ["ar"], IQ: ["ar"],
  JP: ["ja"], KR: ["ko"], VN: ["vi"], TH: ["th"], ID: ["id"],
};

/**
 * Parts entières qui font 100 pile (méthode du plus fort reste) : chaque part est arrondie à l'inférieur, puis les
 * points manquants vont aux plus gros restes. Les parts tombées à 0 sont retirées ; le total affiché reste 100.
 */
export const percents = (rows: [string, number][]): [string, number][] => {
  const total = rows.reduce((n, r) => n + r[1], 0);
  if (!total) return [];
  const exact = rows.map(([k, v]) => ({ k, e: (v / total) * 100 }));
  const out = exact.map((r) => ({ ...r, p: Math.floor(r.e) }));
  let left = 100 - out.reduce((n, r) => n + r.p, 0);
  for (const r of [...out].sort((p, q) => (q.e - q.p) - (p.e - p.p))) { if (left <= 0) break; r.p++; left--; }
  return out.filter((r) => r.p > 0).map((r) => [r.k, r.p] as [string, number]).sort((p, q) => q[1] - p[1]);
};

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
export const kindOf = (a: RApp, store: string | null): "app" | "saas" | "jeu_mobile" | null =>
  a.kind === "app" || a.kind === "saas" || a.kind === "jeu_mobile" ? a.kind
    : store || a.store?.storeId || a.market?.productKind === "app" ? "app" : a.market?.productKind === "software" || siteOf(a.slug) ? "saas" : null;

/** Apps ouvertes sans abonnement (convex/boards.ts, l'aperçu) : les premières du classement, document « apps:top ». */
export const PREVIEW_TOP = 3;
/** Une app n'est listée qu'avec au moins 2 comptes qui la poussent, prouvés (un compte n'entre que prouvé, cf Jarvia #506). */
export const MIN_APP_ACCOUNTS = 2;
/** Un créateur sans publication depuis plus de QUIET_DAYS jours (rien à montrer en 30 j) passe après les autres. */
export const QUIET_DAYS = 30;
/** Formats qui ont leur fiche (`format:<id>`, avec la page de leurs 30 premières reprises) : les premiers de la liste. */
export const FORMAT_PAGES = 150;
/**
 * Créateurs montrés par la fiche d'une app (FicheA, MFiche : les 6 premiers). Audit S29 (19/11) : la fiche en portait 10
 * (pseudo, abonnés, médiane, pays), dont 4 qu'aucun écran ne montre, y compris aux comptes gratuits pour le top 3.
 */
export const APP_CREATORS = 6;
/** Créateurs par document de liste (~1 Ko chacun ; un document Convex : 1 Mio au plus). */
export const CREATOR_PAGE = 500;
/** Créateurs par document de l'index de recherche (« search », « search:creators:2 »…). */
export const SEARCH_CREATORS = 4_000;
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

/**
 * La bio sans ce qui permet de contacter le compte ou de le retrouver ailleurs : Swarm montre ce que fait un compte, pas
 * comment le contacter. Retirés : e-mails (aussi écrits « (at) gmail (dot) com »), téléphones, pseudos d'autres réseaux
 * (« snap: … », « insta @… », « 👻 … »), liens vers d'autres comptes ou messageries (linktr.ee, wa.me, instagram.com…),
 * lieu (« 📍 … ») et âge (« 19 y/o », « 22 ans »). Audit S31 (19/11) : seuls les e-mails en clair et les téléphones
 * partaient ; « snap: … | insta @… », « linktr.ee/… », « (at) gmail (dot) com », l'âge et la ville restaient.
 * Les mentions TikTok (« @compte ») restent : c'est souvent l'app elle-même (« Ambassadrice @fitai »).
 */
const LINK_HOSTS = [
  "linktr\\.ee", "linktree\\.com", "beacons\\.(?:ai|page)", "lnk\\.bio", "linkin\\.bio", "linkr\\.bio", "bio\\.link", "tap\\.bio", "campsite\\.bio",
  "solo\\.to", "allmylinks\\.com", "(?:[\\w-]+\\.)?carrd\\.co", "hoo\\.be", "msha\\.ke", "komi\\.io", "snipfeed\\.co", "stan\\.store", "linkfly\\.to",
  "bit\\.ly", "tinyurl\\.com", "wa\\.me", "(?:api|chat)\\.whatsapp\\.com", "t\\.me", "telegram\\.me", "m\\.me", "discord\\.gg", "discord\\.com\\/invite",
  "snapchat\\.com", "instagram\\.com", "instagr\\.am", "facebook\\.com", "fb\\.com", "x\\.com", "twitter\\.com", "threads\\.net", "youtube\\.com",
  "youtu\\.be", "twitch\\.tv", "onlyfans\\.com", "fansly\\.com", "calendly\\.com", "paypal\\.me", "cash\\.app",
].join("|");
const NETWORKS = "snap(?:chat)?|sc|insta(?:gram)?|ig|whats\\s?app|telegram|discord|kik|twitter|threads|youtube|yt|facebook|fb|twitch|bereal|onlyfans|fansly|paypal";
const DOT = "(?:\\s*\\.\\s*|\\s*[(\\[{<]\\s*dot\\s*[)\\]}>]\\s*|\\s+dot\\s+)";
const MAILBOX = "(?:gmail|googlemail|hotmail|outlook|live|yahoo|icloud|me|proton(?:mail)?|pm|gmx|orange|free|sfr|laposte|wanadoo|aol|mail|yandex|web)";
const BIO_CUTS: [RegExp, (m: string) => string][] = [
  // Liens vers une page de liens, une messagerie ou un autre réseau (avec ou sans https://, avec ou sans chemin).
  [new RegExp(`(?<![\\w.-])(?:https?:\\/\\/)?(?:www\\.)?(?:${LINK_HOSTS})\\.?(?:\\/[^\\s|·•,;]*)?`, "giu"), () => ""],
  // E-mails : en clair, « (at) … (dot) … », « at … dot … », « lea @ gmail.com ».
  [/[\w.+-]+@[\w-]+\.[\w.-]+/gu, () => ""],
  [new RegExp(`[\\w.+-]+\\s*[(\\[{<]\\s*at\\s*[)\\]}>]\\s*[\\w-]+(?:${DOT}[\\w-]+)+`, "giu"), () => ""],
  [/[\w.+-]+\s+at\s+[\w-]+(?:\s+dot\s+[\w-]+)+/giu, () => ""],
  [new RegExp(`[\\w.+-]+\\s*@\\s+[\\w-]+(?:${DOT}[\\w-]+)+`, "giu"), () => ""],
  [new RegExp(`[\\w.+-]+\\s+@${MAILBOX}${DOT}[a-z]{2,}`, "giu"), () => ""],
  // Pseudo sur un autre réseau : « snap: lea.b », « insta @lea », « ig - lea », « 👻 lea ».
  [new RegExp(`(?<![\\p{L}\\p{N}])(?:${NETWORKS})\\s*(?:[:：=>»→\\-–—]+\\s*@?|@)\\s*[\\w.\\-]{2,30}`, "giu"), () => ""],
  [/👻\s*[:：\-–—]?\s*@?[\w.\-]{2,30}/gu, () => ""],
  // Téléphone : 9 chiffres ou plus.
  [/\+?\(?\d[\d .()-]{7,}\d/g, (m) => (m.replace(/\D/g, "").length >= 9 ? "" : m)],
  // Lieu et âge.
  [/📍[ \t]*[^|·•;\n]{0,40}/gu, () => ""],
  [/(?<![\p{L}\p{N}])(?:1\d|[2-9]\d)\s*(?:y\/o|y\.o\.?|yo|yrs?\s*old|years?\s*old)(?![\p{L}\p{N}])/giu, () => ""],
  [/(?<!(?:depuis|de|pendant|il y a|avec|plus de|moins de|since|for)\s)(?<![\p{L}\p{N}])(?:1\d|[2-9]\d)\s*(?:ans|años|anos)(?![\p{L}\p{N}])(?!\s+d['’e])/giu, () => ""],
  // Les émojis de contact restés seuls, et les intitulés (« contact: », « business: ») restés sans rien derrière.
  [/[ \t]*[|·•,:;-]?[ \t]*(?:📧|✉️?|📩|📞|☎️?|📱)[ \t]*[|·•,:;-]?/gu, () => " "],
  [/(?<![\p{L}\p{N}])(?:contact|business|booking|bookings|inquiries|enquiries|collabs?|partenariats?|pro|e-?mail|mail)\s*[:：]\s*(?=$|[|·•\n\u0000])/gimu, () => ""],
];
export const cleanBio = (bio: string | null) => {
  if (!bio) return bio;
  // Chaque morceau retiré laisse une marque, retirée avec le séparateur qui le suit (« snap: x | Paris » → « Paris »).
  let out = bio.replace(/\u0000/g, "");
  for (const [re, by] of BIO_CUTS) out = out.replace(re, (m) => (by(m) === "" ? "\u0000" : by(m)));
  out = out
    .replace(/[ \t]*\u0000[ \t]*(?:[|·•,;:\-–—][ \t]*)?/g, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/(?:[ \t]*[|·•,:;-][ \t]*)+$/gm, "")
    .replace(/([|·•])(?:[ \t]*[|·•])+/g, "$1")
    .trim();
  return out || null;
};

/**
 * Le lien « voir sur la plateforme » venu du Radar, s'il mène bien à TikTok ou Instagram en https ; sinon null (la page
 * vidéo reconstruit alors le lien). Audit S34 (19/11) : l'adresse du signal était posée telle quelle dans href, si bien
 * qu'une valeur « javascript:… » aurait tourné au clic, sur l'origine de Kopycat.
 */
export const platformUrl = (u: string | null | undefined): string | null =>
  typeof u === "string" && /^https:\/\/(?:(?:www|m|vm|vt)\.)?(?:tiktok|instagram)\.com\/[^\s"'<>\\]*$/i.test(u) ? u : null;

/** Une vidéo, telle que la voient les écrans (vignette, lecteur). */
export type VideoCard = { id: string; platform: string; handle: string; app: string | null; views: number; x: number | null; publishedAt: number; cover: string | null; hook: string | null; paid?: boolean; otherLang?: string | null; carousel?: number; kind?: string };

// ─── Le calcul ───────────────────────────────────────────────────────────────

/**
 * Synchro par groupes d'apps (15/11 : à 24 000 comptes, une seule action ne tient ni les 512 Mo ni les 10 min).
 * Une étape « groupe » reçoit TOUS les comptes, formats et signaux, mais seulement les vidéos des apps de son groupe
 * (un compte et ses vidéos sont toujours rangés sous la même app) ; elle produit les fiches d'app, de créateur et les
 * pages vidéo de son groupe, et transmet à l'étape « globale » ce que les pages communes demandent. L'étape globale
 * n'a aucune vidéo suivie : listes d'apps, créateurs, formats, alertes, accueil, recherche, et les pages vidéo des
 * reprises ou signaux qu'aucun groupe ne suit. Sans `part` : tout d'un coup, comme avant (le banc compare les deux).
 */
export type AccountFacts = [market: string | null, otherLang: string | null, mainType: string | null];
export type GroupOut = {
  /** Ligne de chaque app du groupe (celle de la liste des apps), sa suite de lecture, ses pays aux vidéos récentes. */
  apps: { slug: string; row: Record<string, unknown>; playlist: string[]; recent: string[] }[];
  /** Lignes des apps du groupe dans chaque liste `apps:<pays>@<plateforme>`, tous pays vus. */
  lists: Record<string, Record<string, unknown>[]>;
  /** Créateurs du groupe (ligne de la liste), avec leur rang parmi tous les comptes. */
  creators: { i: number; row: Record<string, unknown> }[];
  /** Pays, langue montrée et type de chaque compte du groupe. */
  accounts: Record<string, AccountFacts>;
  /** Vidéos du groupe qui sont des reprises de formats ou des signaux : leur page est écrite par le groupe. */
  tracked: string[];
};
export type Part = { kind: "group"; apps: Set<string> } | { kind: "global"; outs: GroupOut[] };

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
    /** Pays lu par Swarm sur la page publique d'une vidéo du compte (comptes sans pays relevé). */
    regionOf?: (handle: string) => string | null;
    /** Langue d'un compte, calculée hors synchro (convex/radarLang.ts) : null si inconnue, undefined si pas calculée. */
    langOf?: (accountId: string) => string | null | undefined;
    /** Carrousel lu par Swarm (convex/radarSlides.ts) : nombre de photos, 0 si ce n'en est pas un, undefined si pas encore lu. */
    slidesOf?: (videoId: string) => number | undefined;
    /** Lecture IA de la miniature (convex/radarAi.ts) : type de contenu et texte à l'écran ; undefined si pas encore lue. */
    aiOf?: (videoId: string) => { type: string; text: string } | undefined;
    /** Genre apparent lu par l'IA pour un compte « ambassadeur » ; undefined si pas encore lu. */
    genderOf?: (handle: string) => string | undefined;
    /** Étape de la synchro par groupes (voir `Part`) ; sans : tout d'un coup. */
    part?: Part;
  } = {},
): {
  boards: Boards; lazy: Map<string, () => unknown>; need: MediaNeed; used: Set<string>; regionTodo: { handle: string; ids: string[] }[];
  laterTodos: () => { slideTodo: string[]; videoAiTodo: string[] }; genderTodo: { handle: string; ids: string[] }[]; langTodo: { accountId: string; texts: string[] }[];
  /** Étape « groupe » : ce qu'elle transmet à l'étape globale. */
  out: GroupOut | null;
  /** Les pays retenus (une étape « groupe » ne les connaît qu'à peu près : l'étape globale compare). */
  markets: string[];
} {
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
  /**
   * Une app citée par une vidéo, un créateur ou un format. Seules les apps actives ont une fiche : une app en pause (ou
   * dont la fusion ne mène nulle part) reste nommée, marquée page:false, et l'écran ne pose pas de lien. Audit Q23
   * (19/11) : 7 apps en pause, citées par 771 pages vidéo, 114 fiches créateur et 185 lignes de listes, menaient à
   * « Cette fiche n'est plus dans le Radar ».
   */
  const appRef = (a: RApp, withNiche = false) => ({ slug: a.slug, name: a.name, icon: icon(a), ...(withNiche ? { niche: nicheOf(a) } : {}),
    ...(a.status === "active" && !a.mergedInto ? {} : { page: false as const }) });
  const G = opts.part?.kind === "group" ? opts.part : null;
  const GL = opts.part?.kind === "global" ? opts.part : null;
  /** Étape « groupe » : l'app (canonique) ou le compte est-il du groupe ? Sans groupe : tout l'est. */
  const ownsApp = (id: string | null | undefined) => !G || G.apps.has(id ?? "");
  const ownsAccount = (t: RTracked) => !G || G.apps.has(canonical(t.appId)?.id ?? "");
  const facts = new Map<string, AccountFacts>();
  if (GL) for (const o of GL.outs) for (const [id, f] of Object.entries(o.accounts)) facts.set(id, f);
  /** Étape globale : les vidéos qu'un groupe suit (sa page est la sienne). */
  const trackedElsewhere = new Set(GL ? GL.outs.flatMap((o) => o.tracked) : []);

  // Les comptes suivis ET prouvés : ce sont eux qui « poussent » une app (cf isProven).
  const accounts = raw.tracked.filter((t) => t.status === "active" && isProven(t));
  // Placement payé (décision du 14/11) : un compte payé une ou deux fois pour une app n'est pas un de ses créateurs.
  // Il sort des listes de créateurs, des pages créateur et des comptes ; ses vidéos qui citent l'app restent dans les
  // vues de l'app, étiquetées « Placement payé » partout où elles s'affichent.
  const paidAccounts = new Set(raw.tracked.filter((t) => t.placement).map((t) => t.id));
  const isPaid = (accountId?: string | null) => !!accountId && paidAccounts.has(accountId);
  const creatorAccounts = accounts.filter((t) => !t.placement);
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
      ...(isPaid(v.accountId) ? { paid: true } : {}),
      ...(otherLangOf(v.accountId) ? { otherLang: otherLangOf(v.accountId) } : {}),
      ...(slidesOf(v.videoId) ? { carousel: slidesOf(v.videoId) } : {}),
      ...((typeOf(v) ?? mainType.get(v.accountId)) ? { kind: typeOf(v) ?? mainType.get(v.accountId) } : {}),
      x: xOf(v, s),
      publishedAt: v.publishedAt,
      cover: cover(v.videoId, v.coverUrl ?? s?.coverUrl, acc?.handle ?? s?.authorHandle),
      // Court dans les cartes (elles en montrent deux lignes) : le texte complet alourdissait chaque page (14/11).
      hook: clip(screenText(v, v.hook ?? s?.hook, v.videoId), 160),
    };
  };

  // Sous une app, seulement les vidéos qui la citent : le 14/11, 27 % des vidéos des comptes suivis ne citaient pas
  // la leur (vidéos perso d'un vrai créateur, vidéos d'une autre app) et gonflaient vues, top et « meilleure ».
  // Et seulement celles des comptes qui la poussent (actifs et prouvés, `accounts` plus bas) : audit Q65 (19/11), les
  // vues d'une app comptaient les vidéos de comptes en pause (2 apps listées n'avaient que des vues de comptes en
  // pause), alors que son nombre de comptes ne les comptait pas. Un compte mis en pause dans le Radar (retrait) ne
  // sort plus non plus dans le top de ses vidéos.
  const pushes = (accountId: string) => { const t = accountById.get(accountId); return !!t && t.status === "active" && isProven(t); };
  const videosByApp = groupBy(raw.trackedVideos.filter((v) => citesItsApp(v) && pushes(v.accountId)), (v) => canonical(v.appId)?.id ?? "");
  const videosByAccount = groupBy(raw.trackedVideos, (v) => v.accountId);
  const marketByAccount = new Map<string, string | null>();
  // Son pays : celui que le Radar relève (le plus fréquent de ses vidéos), sinon celui de création de ses vidéos de
  // l'export, sinon celui que Swarm a lu sur la page publique d'une de ses vidéos (convex/radarRegions.ts).
  const regionOf = opts.regionOf ?? (() => null);
  for (const t of raw.tracked) {
    let m = countryCode(t.country);
    if (!m) {
      const n = new Map<string, number>();
      for (const v of videosByAccount.get(t.id) ?? []) { const r = countryCode(v.region); if (r) n.set(r, (n.get(r) ?? 0) + 1); }
      m = [...n.entries()].sort((p, q) => q[1] - p[1])[0]?.[0] ?? null;
    }
    if (!m) m = countryCode(regionOf(t.handle));
    marketByAccount.set(t.id, m);
  }
  // Dernier recours : le pays de son app, quand ses autres comptes y sont presque tous (80 % au moins, 3 au moins).
  for (const ts of groupBy(raw.tracked, (t) => canonical(t.appId)?.id ?? "").values()) {
    const known = ts.map((t) => marketByAccount.get(t.id)).filter((m): m is string => !!m);
    const top = [...known.reduce((n, m) => n.set(m, (n.get(m) ?? 0) + 1), new Map<string, number>())].sort((p, q) => q[1] - p[1])[0];
    if (!top || top[1] < 3 || top[1] < 0.8 * known.length) continue;
    for (const t of ts) if (!marketByAccount.get(t.id)) marketByAccount.set(t.id, top[0]);
  }
  if (GL) for (const [id, f] of facts) marketByAccount.set(id, f[0]);
  const mkOf = (accountId: string | null | undefined) => (accountId ? marketByAccount.get(accountId) ?? null : null);
  // Sa langue : celle de la plupart de ses vidéos (légende + texte à l'écran), si au moins 2 sont sûres, 60 % d'accord,
  // et qu'au moins un quart de ses vidéos se lisent (14/11 : @dailytyrel, légendes allemandes trop courtes pour être
  // lues et 2 anglaises sur une douzaine, sortait « en anglais »).
  const langOf = opts.langOf ?? (() => undefined);
  const slidesOf = opts.slidesOf ?? (() => undefined);
  const aiOf = opts.aiOf ?? (() => undefined);
  const genderOf = opts.genderOf ?? (() => undefined);
  // Type de contenu d'une vidéo : carrousel (dit par TikTok) avant tout, sinon celui lu par l'IA sur sa miniature.
  const typeOf = (v: RVideo): string | null => (slidesOf(v.videoId) ? "carrousel" : aiOf(v.videoId)?.type || null);
  // Le type d'un compte : celui de la plupart de ses vidéos lues (« autre » ne compte pas).
  const mainType = new Map<string, string>();
  for (const [accId, vs] of videosByAccount) {
    const n = new Map<string, number>();
    for (const v of vs) { const t = typeOf(v); if (t && t !== "autre") n.set(t, (n.get(t) ?? 0) + 1); }
    const top = [...n.entries()].sort((p, q) => q[1] - p[1])[0];
    if (top) mainType.set(accId, top[0]);
  }
  if (GL) for (const [id, f] of facts) if (f[2]) mainType.set(id, f[2]);
  // Son genre : lu par l'IA pour chaque compte (photo de profil + 3 miniatures), qui dit aussi « sans visage ». Le
  // déduire du type se trompait : @matbbt67 (15/11) publie des carrousels de ses selfies, et passait « sans visage ».
  const genderFor = (t: RTracked): string | null => {
    if (!mainType.get(t.id)) return null;
    const g = genderOf(t.handle);
    return g && g !== "incertain" ? g : null;
  };
  // Coupé par caractère entier : couper un émoji en deux laisse un demi-caractère que Convex refuse (14/11).
  const clip = (t: string | null, n: number) => { if (!t) return t; const c = Array.from(t); return c.length > n ? c.slice(0, n - 1).join("").trimEnd() + "…" : t; };
  // Texte à l'écran : celui du Radar, ou celui lu par l'IA quand le Radar n'en a pas ou l'a coupé (plus long, même début).
  const screenText = (v: RVideo | null, radar: string | null | undefined, id: string): string | null => {
    const ai = (v ? aiOf(v.videoId)?.text : aiOf(id)?.text) || "";
    if (!radar) return ai || null;
    const norm = (x: string) => x.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");
    return ai.length > radar.length + 10 && norm(ai).startsWith(norm(radar).slice(0, 16)) ? ai : radar;
  };
  // Sa langue : calculée hors de la synchro (convex/radarLang.ts) sur les textes de ses vidéos ; les comptes jamais
  // calculés partent dans `langTodo`.
  const langByAccount = new Map<string, string>();
  const langTodo: { accountId: string; texts: string[] }[] = [];
  for (const [accId, all] of videosByAccount) {
    const l = langOf(accId);
    if (l) langByAccount.set(accId, l);
    else if (l === undefined) langTodo.push({ accountId: accId, texts: all.slice(0, 20).map((v) => Array.from(`${v.caption ?? ""} ${v.hook ?? ""}`).slice(0, 300).join("")) });
  }
  // Sa langue seulement quand ce n'en est pas une de son pays (« France · en espagnol ») : le pays dit d'où il publie,
  // pas où sont ceux qui regardent (14/11, @historiaas.en.chat publie depuis la France en espagnol).
  const otherLangOf = (accountId: string | null | undefined) => {
    if (GL) return accountId ? facts.get(accountId)?.[1] ?? null : null;
    const m = mkOf(accountId), l = accountId ? langByAccount.get(accountId) : undefined;
    return m && l && COUNTRY_LANGS[m] && !COUNTRY_LANGS[m].includes(l) ? l : null;
  };
  // Les marchés présents, du plus fourni au moins fourni (comptes actifs).
  const marketCount = new Map<string, number>();
  for (const t of creatorAccounts) { const m = mkOf(t.id); if (m) marketCount.set(m, (marketCount.get(m) ?? 0) + 1); }
  // Tous les pays où il y a au moins un créateur : le choix se fait dans une liste avec recherche (plus d'onglets, donc
  // plus de seuil ; audit Q54 : un seuil « à partir de 10 créateurs » réglé à 1 ne retirait rien).
  const MARKETS = [...marketCount.entries()]
    .sort((p, q) => q[1] - p[1])
    .map(([c, n]) => [c, marketLabel(c), n] as [string, string, number]);
  const accountsByApp = groupBy(creatorAccounts, (t) => canonical(t.appId)?.id ?? "");
  const usedVideos = new Map<string, RVideo>();
  // Pages produites à l'écriture, une à une (15/11 : la synchro de prod mourait à 512 Mo en les gardant toutes) :
  // pages vidéo, fiches créateur, listes d'apps par pays et plateforme. Une fiche produite à l'écriture qui cite une
  // vidéo lui ajoute sa page (la boucle d'écriture la reprend : une Map parcourue voit ce qu'on y ajoute).
  const lazy = new Map<string, () => unknown>();
  const videoPageKeys = new Set<string>();
  let videoPagesOpen = false;
  const addVideoPage = (v: RVideo) => {
    const k = `video:${v.videoId}`;
    if (videoPageKeys.has(k)) return;
    videoPageKeys.add(k);
    used.add(coverKey(v.videoId));
    lazy.set(k, () => videoPage(v, signalByVideo.get(v.videoId) ?? null));
  };
  const use = (vs: RVideo[]) => vs.forEach((v) => { usedVideos.set(v.videoId, v); if (videoPagesOpen) addVideoPage(v); });

  // ── Apps : le classement, et la fiche de chaque app ──
  // Les chiffres d'une app sur un ensemble de ses vidéos : toutes (la liste), celles d'un pays, d'une plateforme.
  const dayEnd = parisDay(now);
  const statsOf = (vids: RVideo[], nAccounts: number) => {
    const recent = vids.filter((v) => now - v.publishedAt <= 30 * DAY);
    const week = vids.filter((v) => now - v.publishedAt <= 7 * DAY);
    const weeks = Array.from({ length: 6 }, (_, i) => {
      const end = now - (5 - i) * WEEK;
      return vids.filter((v) => v.publishedAt > end - WEEK && v.publishedAt <= end).reduce((n, v) => n + v.views, 0);
    });
    // Vues par jour de publication sur les DAYS derniers jours (le dernier = aujourd'hui à Paris).
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
    const byAccount = [...groupBy(recent, (v) => v.accountId).values()].map((vs) => vs.reduce((n, v) => n + v.views, 0)).sort((p, q) => q - p);
    const top = withImage([...recent].sort((p, q) => q.views - p.views), 12, trackedHasImage);
    use(top.slice(0, 3));
    return {
      accounts: nAccounts, videosPerWeek: week.length, dayEnd, days, daysIg,
      views30, views30Ig, views7, views7Ig, weeks,
      weekDelta: weeks[4] > 0 ? round((weeks[5] - weeks[4]) / weeks[4], 3) : null,
      bestX: best.length ? Math.max(...best) : null,
      top10Share: views30 ? round(byAccount.slice(0, 10).reduce((n, v) => n + v, 0) / views30, 3) : null,
      videoCount: recent.length,
      // Comptes en placement payé dont des vidéos comptent ici (ils ne sont pas dans « accounts »).
      placements: new Set(recent.filter((v) => isPaid(v.accountId)).map((v) => v.accountId)).size,
      top: top.slice(0, 3).map(card),
      _top: top,
    };
  };
  const fromGroups = new Map(GL ? GL.outs.flatMap((o) => o.apps.map((x) => [x.slug, x] as const)) : []);
  const appRowOf = (a: RApp) => {
    const vids = videosByApp.get(a.id) ?? [];
    const accs = accountsByApp.get(a.id) ?? [];
    const { _top, ...st } = statsOf(vids, accs.length);
    use(_top);
    const recent = vids.filter((v) => now - v.publishedAt <= 30 * DAY);
    // Part de ses vues 30 j par pays de ses comptes. Le total fait 100 pile : toutes ses vues comptent (un compte sans
    // pays → « Pays inconnu », XX, en dernier) et l'arrondi au plus fort reste (le 14/11, 44 apps sur 171 faisaient
    // 98 à 101 % en arrondissant chaque pays de son côté).
    const markets = percents([...groupBy(recent, (v) => mkOf(v.accountId) ?? "XX").entries()]
      .map(([m, vs]) => [m, vs.reduce((n, v) => n + v.views, 0)] as [string, number]))
      .sort((p, q) => (p[0] === "XX" ? 1 : 0) - (q[0] === "XX" ? 1 : 0) || q[1] - p[1]);
    const store = storeOf(a.slug);
    const released = a.store?.released ? Date.parse(a.store.released) : NaN;
    const firstVideo = vids.length ? Math.min(...vids.map((v) => v.publishedAt)) : null;
    return {
      slug: a.slug, name: a.name, niche: nicheOf(a), icon: icon(a), kind: kindOf(a, store),
      ...st,
      markets,
      trackedSince: a.createdAt,
      // Nouvelle : sortie récemment, ou réseau qui vient de démarrer (et non « arrivée récemment dans le Radar » : le
      // 14/11, toutes les apps l'étaient).
      isNew: Number.isFinite(released) ? now - released <= NEW_RELEASE_DAYS * DAY : firstVideo !== null && now - firstVideo <= NEW_NETWORK_DAYS * DAY,
      store,
      _top12: _top.slice(0, 12),
      _accs: accs,
    };
  };
  // Étape globale : la ligne de chaque app vient de son groupe (ses vidéos n'y sont pas).
  const appRows = apps.map((a) => {
    const g = fromGroups.get(a.slug);
    return g ? { ...(g.row as Omit<ReturnType<typeof appRowOf>, "_top12" | "_accs">), _top12: [] as RVideo[], _accs: accountsByApp.get(a.id) ?? [] } : appRowOf(a);
  });
  // Une app sans réseau prouvé (2 comptes au moins) n'est pas listée : sa fiche existe, elle se montre dès qu'elle l'a.
  const appsBoard = appRows.filter((r) => r.accounts >= MIN_APP_ACCOUNTS).map(({ _top12, _accs, ...r }) => r).sort((p, q) => q.views30 - p.views30);
  boards.set("apps", { updatedAt: now, markets: MARKETS, niches: [...new Set(appsBoard.map((a) => a.niche))].sort(), apps: appsBoard,
    marketApps: [] as [string, number][] });

  // La liste des apps pour un pays et/ou une plateforme (décision du 14/11 : « marché France » = les vues, la courbe,
  // les vidéos qui cartonnent et la meilleure vidéo EN FRANCE ; pareil pour TikTok seul ou Instagram seul). Un
  // document par choix : « apps:FR », « apps@instagram », « apps:FR@instagram ». share : part du pays dans les vues
  // de l'app (30 j, comptes situés).
  const listed = new Map(appsBoard.map((r) => [r.slug, r]));
  const appBySlug = new Map(apps.map((a) => [a.slug, a]));
  const marketApps = new Map<string, number>();
  // Vidéos et comptes de chaque app rangés par pays une fois (110 pays × 3 plateformes : pas de filtre répété).
  const vidsByAppMarket = new Map<string, Map<string, RVideo[]>>(), accsByAppMarket = new Map<string, Map<string, RTracked[]>>();
  for (const r of listed.values()) {
    const a = appBySlug.get(r.slug)!;
    vidsByAppMarket.set(a.id, groupBy(videosByApp.get(a.id) ?? [], (v) => mkOf(v.accountId) ?? ""));
    accsByAppMarket.set(a.id, groupBy(accountsByApp.get(a.id) ?? [], (t) => mkOf(t.id) ?? ""));
  }
  const recentDays = Math.max(30, DAYS) * DAY;
  const listKey = (code: string | null, plat: string | null) => `apps${code ? ":" + code : ""}${plat ? "@" + plat : ""}`;
  // Les lignes des apps d'une liste, dans l'ordre de la liste des apps (avant le tri de la liste elle-même).
  const listRows = (code: string | null, plat: "tiktok" | "instagram" | null) => {
    const rows = [];
    for (const r of listed.values()) {
      const a = appBySlug.get(r.slug)!;
      let vids = code ? vidsByAppMarket.get(a.id)?.get(code) ?? [] : videosByApp.get(a.id) ?? [];
      const accs = code ? accsByAppMarket.get(a.id)?.get(code) ?? [] : accountsByApp.get(a.id) ?? [];
      if (plat) vids = vids.filter((v) => v.platform === plat);
      if (!vids.length) continue;
      const { _top, ...st } = statsOf(vids, code ? accs.length : r.accounts);
      if (!st.views30 && !st.days.some((d) => d > 0)) continue;
      rows.push({ ...r, ...st, share: code ? (r.markets.find((m) => m[0] === code)?.[1] ?? 0) : null });
    }
    return rows;
  };
  const listPage = (code: string | null, plat: string | null, rows: { views30: number; niche: string }[]) => {
    rows.sort((p, q) => q.views30 - p.views30);
    return { updatedAt: now, market: code ?? "ALL", platform: plat ?? "ALL", niches: [...new Set(rows.map((x) => x.niche))].sort(), apps: rows };
  };
  const PLATS = [null, "tiktok", "instagram"] as const;
  const groupOut: GroupOut | null = G ? { apps: [], lists: {}, creators: [], accounts: {}, tracked: [] } : null;
  if (groupOut) {
    // Étape « groupe » : les lignes de ses apps dans chaque liste, pour TOUS les pays de ses vidéos (ses comptes sont à
    // lui : leur pays est exact) ; l'étape globale ne garde que les pays retenus. Pas les pays retenus vus d'ici : un
    // groupe ne connaît le pays des comptes des autres qu'à peu près (le 16/11, 4 groupes sur 5 en voyaient d'autres, et
    // une liste par pays aurait pu manquer leurs lignes). Calculées ici : elles notent les vidéos montrées.
    // Conséquence connue (audit Q63, banc sur les données du dev du 15/11 : 1 page sur 85 816) : un pays où l'app n'a que
    // des comptes en placement payé, et où aucun créateur n'est situé, a sa liste ici mais pas à l'étape globale ; la page
    // vidéo de son top est écrite sans que rien n'y mène. Sans effet à l'écran.
    const codes = new Set<string>();
    for (const r of listed.values()) for (const c of vidsByAppMarket.get(appBySlug.get(r.slug)!.id)?.keys() ?? []) if (c) codes.add(c);
    for (const plat of PLATS) for (const code of [null, ...codes]) {
      if (!plat && !code) continue;
      const rows = listRows(code, plat);
      if (rows.length) groupOut.lists[listKey(code, plat)] = rows;
    }
  } else if (GL) {
    // Étape globale : les lignes de tous les groupes, remises dans l'ordre de la liste des apps, puis triées.
    const rank = new Map([...listed.keys()].map((slug, i) => [slug, i]));
    for (const [code] of MARKETS) marketApps.set(code, [...listed.keys()].filter((slug) => fromGroups.get(slug)?.recent.includes(code)).length);
    for (const plat of PLATS) for (const code of [null, ...MARKETS.map((m) => m[0])]) {
      if (!plat && !code) continue;
      const k = listKey(code, plat);
      const rows = GL.outs.flatMap((o) => (o.lists[k] ?? []) as (Record<string, unknown> & { slug: string; views30: number; niche: string })[])
        .filter((r) => rank.has(r.slug)).sort((p, q) => rank.get(p.slug)! - rank.get(q.slug)!);
      lazy.set(k, () => listPage(code, plat, rows));
    }
  } else {
    for (const [code] of MARKETS) {
      let n = 0;
      for (const r of listed.values()) {
        const vids = vidsByAppMarket.get(appBySlug.get(r.slug)!.id)?.get(code) ?? [];
        if (vids.some((v) => v.views > 0 && now - v.publishedAt <= recentDays)) n++;
      }
      marketApps.set(code, n);
    }
    for (const plat of PLATS) for (const code of [null, ...MARKETS.map((m) => m[0])]) {
      if (!plat && !code) continue;
      lazy.set(listKey(code, plat), () => listPage(code, plat, listRows(code, plat)));
    }
  }
  (boards.get("apps") as { marketApps: [string, number][] }).marketApps = MARKETS.map((m) => [m[0], marketApps.get(m[0]) ?? 0]);
  // L'aperçu sans abonnement (convex/boards.ts) : le top PREVIEW_TOP et ce que son écran montre, dans un petit document.
  // Audit F1 (19/11) : l'aperçu relisait les 848 Ko de « apps » à chaque appel, pour en rendre 10 Ko. Audit S29 : ni les
  // marchés, ni les apps par pays, ni les niches de la base payante, qu'aucun écran de l'aperçu ne lit.
  // Son rang réel (audit Q15) : la fiche d'app le calculait sur get('apps'), réduit au top 3 dans l'aperçu (« N°2 sur 3
  // apps du Radar, 24 % » pour une app N°1 de sa niche de 13 avec 42 %). Même règle que la fiche (FicheA, MFiche) : dans
  // sa niche s'il y en a une (hors « Autres ») et qu'elle compte au moins 2 apps listées, sinon parmi toutes.
  const standingOf = (r: (typeof appsBoard)[number]) => {
    const niche = r.niche && r.niche !== "Autres" ? appsBoard.filter((x) => x.niche === r.niche) : [];
    const pool = niche.length >= 2 ? niche : appsBoard; // appsBoard est déjà trié par vues sur 30 jours
    const sum = pool.reduce((n, x) => n + (x.views30 || 0), 0);
    return { rank: pool.indexOf(r) + 1, of: pool.length, share: sum ? round((r.views30 || 0) / sum, 4) : 0, niche: pool === niche ? r.niche : "" };
  };
  // Les apps fusionnées : ancien slug → slug de l'app qui les a reprises (active, avec sa fiche). Audit Q25 (19/11) : une
  // app suivie ou gardée dans un dossier disparaissait à sa fusion (Accueil « 3 apps suivies » pour 4, lien du dossier
  // vers « fiche absente »). Lu par boards.get (app:<ancien> → la fiche de la nouvelle) et saved.get (suivis, dossiers).
  // Paires [ancien, nouveau] : une valeur Convex a au plus 1 024 champs, mais 8 192 éléments.
  const merged: [string, string][] = [];
  for (const a of raw.apps) {
    const to = a.mergedInto ? canonical(a.id) : null;
    if (to && to.slug !== a.slug && !to.mergedInto && to.status === "active") merged.push([a.slug, to.slug]);
  }
  boards.set("apps:merged", { updatedAt: now, merged: merged.sort((p, q) => (p[0] < q[0] ? -1 : 1)) });
  boards.set("apps:top", { updatedAt: now, apps: appsBoard.slice(0, PREVIEW_TOP).map((r) => ({ ...r, standing: standingOf(r) })), total: appsBoard.length });

  // ── Formats ──
  const accountX = (m: RFormatMember) => {
    if (typeof m.multiplier === "number") return round(m.multiplier, 1);
    const med = accountById.get(m.accountId)?.medianViews;
    return med && med > 0 ? round(m.views / med, 1) : null;
  };
  const appMini = (id: string) => {
    const a = canonical(id);
    return a ? appRef(a) : null;
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
        niche: firstApp ? nicheOf(firstApp) : "Autres", market: majority(f.members.map((m) => mkOf(m.accountId))),
        maxViews: f.maxViews, medX: roundOrNull(median(xs), 1), wins: xs.filter((x) => x > 1).length, n: f.members.length,
        lastPostAt: f.lastPostAt, firstSeenAt: f.firstSeenAt, members,
      };
    })
    .filter((f) => f.members.length > 0) // un format sans aucune reprise montrable n'apparaît pas
    .sort((p, q) => q.accounts - p.accounts || (q.medX ?? 0) - (p.medX ?? 0));
  // Chaque reprise montrée mène à sa vidéo : elle a sa page dans le lecteur.
  const shown = formatRows.slice(0, FORMAT_PAGES);
  // Les formats qui ont leur fiche. Une fiche d'app ou de créateur cite aussi les autres, marqués page:false : l'écran
  // les montre sans lien. Audit Q22 (19/11) : 45 % des formats des fiches app et 70 % de ceux des fiches créateur
  // menaient à « Cette fiche n'est plus dans le Radar ».
  const hasPage = new Set(shown.map((f) => f.id));
  const pageFlag = (id: string) => (hasPage.has(id) ? {} : { page: false as const });
  for (const f of shown) for (const m of f.members.slice(0, 30)) {
    if (usedVideos.has(m.videoId)) continue;
    // Une reprise suivie a sa page dans le groupe qui la suit ; une reprise que personne ne suit, à l'étape globale.
    if (G && !trackedByVideo.has(m.videoId)) continue;
    if (GL && trackedElsewhere.has(m.videoId)) continue;
    usedVideos.set(m.videoId, m._video);
  }
  const plain = (ms: (typeof formatRows)[number]["members"]) => ms.map(({ _video, ...m }) => m);
  // Un format tel que l'écrivent les documents : ses n premières reprises, sans firstSeenAt (il ne sert qu'au choix des
  // nouveaux formats des alertes ; aucun écran ne le lit, audit Q66).
  const formatDoc = ({ firstSeenAt: _first, ...f }: (typeof formatRows)[number], n: number) => ({ ...f, members: plain(f.members.slice(0, n)) });
  if (!G) {
    boards.set("formats", { updatedAt: now, markets: MARKETS, formats: shown.map((f) => formatDoc(f, 4)) });
    for (const f of shown) boards.set(`format:${f.id}`, { updatedAt: now, ...formatDoc(f, 30) });
  }
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
    // Son rythme jour par jour (maquette E1, 20/11) : ses vidéos des 7 derniers jours de Paris, le plus ancien d'abord,
    // aujourd'hui en dernier. La rangée de cases de la liste Créateurs et du profil le dessine.
    const today = parisDay(now);
    const days7 = [0, 0, 0, 0, 0, 0, 0];
    for (const v of vids) { const k = today - parisDay(v.publishedAt); if (k >= 0 && k < 7) days7[6 - k]++; }
    return {
      handle: t.handle, bio: cleanBio(t.bio), fans: t.fans, median: t.medianViews, posts7d: t.posts7d ?? 0, days7, lastPostAt: t.lastPostAt,
      market: mkOf(t.id), otherLang: otherLangOf(t.id), kind: mainType.get(t.id) ?? null, gender: genderFor(t), app: a ? appRef(a, true) : null,
      // Ce qui le relie à son app (RProof) reste interne au Radar : jamais dans les documents de Swarm (décision du 14/11).
      // Son compte Instagram non plus (audit S31, 19/11) : aucun écran ne l'affiche, il reliait deux identités.
      best: best.map(card), _vids: vids,
    };
  };
  // Leur rang parmi les comptes : le tri par médiane le garde à égalité (l'étape globale remet les groupes dans cet ordre).
  const creatorRank = new Map(creatorAccounts.map((t, i) => [t.handle, i]));
  // Un compte a sa fiche créateur s'il a une médiane de vues (aussi le tri de la file du genre, qui ne sert qu'aux fiches).
  const shownCreator = (t: RTracked) => (t.medianViews ?? 0) > 0;
  type CreatorRow = ReturnType<typeof creatorRow>;
  const creators: CreatorRow[] = GL
    ? GL.outs.flatMap((o) => o.creators).sort((p, q) => p.i - q.i).map((c) => c.row as CreatorRow)
    : creatorAccounts.filter(shownCreator).map(creatorRow);
  // Les comptes muets depuis plus de QUIET_DAYS jours passent après les autres (audit Q24, 19/11 : en France, le 1er
  // n'avait rien publié depuis 581 jours, et 24 des 50 premiers n'avaient aucune vidéo de 30 jours à montrer). Tous
  // restent listés ; dans chaque groupe, l'ordre reste celui de la médiane.
  const quiet = (c: { lastPostAt: number | null }) => (c.lastPostAt === null || now - c.lastPostAt > QUIET_DAYS * DAY ? 1 : 0);
  creators.sort((p, q) => quiet(p) - quiet(q) || (q.median ?? 0) - (p.median ?? 0));
  for (const c of creators) wantAvatar(c.handle);
  // Tous les créateurs de chaque marché (plus de plafond à 200, décision du 14/11), par pages de CREATOR_PAGE :
  // « creators:<marché> » porte la 1re page et leur nombre, « creators:<marché>:2 », « :3 »… la suite.
  const plainOf = new Map(creators.map(({ _vids, ...c }) => [c.handle, c]));
  const pagesOf = (code: string, list: typeof creators) => {
    const plain = list.map((c) => plainOf.get(c.handle)!);
    const pages = Math.max(1, Math.ceil(plain.length / CREATOR_PAGE));
    // active7 : ceux qui ont publié sur 7 jours (posts7d) — la liste les montre d'abord et compte les autres sans tout lire.
    boards.set(`creators:${code}`, { updatedAt: now, market: code, markets: MARKETS, total: plain.length, active7: plain.filter((c) => (c.posts7d ?? 0) > 0).length, pages, creators: plain.slice(0, CREATOR_PAGE) });
    for (let i = 2; i <= pages; i++) boards.set(`creators:${code}:${i}`, { updatedAt: now, market: code, page: i, creators: plain.slice((i - 1) * CREATOR_PAGE, i * CREATOR_PAGE) });
  };
  if (!G) {
    for (const [code] of MARKETS) pagesOf(code, creators.filter((c) => c.market === code));
    pagesOf("ALL", creators);
  }
  const creatorPages = new Set(creators.map((c) => c.handle));
  for (const c of creators) {
    if (!creatorPages.has(c.handle) || GL) continue;
    if (G && !ownsAccount(trackedByHandle.get(c.handle)!)) continue;
    if (groupOut) groupOut.creators.push({ i: creatorRank.get(c.handle)!, row: plainOf.get(c.handle)! });
    lazy.set(`creator:${c.handle}`, () => {
      const t = trackedByHandle.get(c.handle)!;
      const vids = withImage(c._vids, 15, trackedHasImage);
      use(vids);
      const fmts = (formatsByAccount.get(t.id) ?? []).map((x) => x.f).filter((f, i, arr) => arr.indexOf(f) === i && f.accountCount >= 3);
      return {
        updatedAt: now, ...plainOf.get(c.handle)!,
        videos: vids.map(card),
        formats: fmts.slice(0, 10).map((f) => ({ id: f.id, kind: f.kind, label: f.label, accounts: f.accountCount, ...pageFlag(f.id) })),
      };
    });
  }

  // ── Fiche de chaque app (après les formats et créateurs, qu'elle cite) ──
  for (const r of appRows) {
    if (GL) break;
    const a = apps.find((x) => x.slug === r.slug)!;
    if (!ownsApp(a.id)) continue;
    const appCreators = r._accs
      .filter((t) => (t.medianViews ?? 0) > 0)
      .sort((p, q) => (q.medianViews ?? 0) - (p.medianViews ?? 0))
      .slice(0, APP_CREATORS)
      .map((t) => ({ handle: t.handle, fans: t.fans, median: t.medianViews, posts7d: t.posts7d ?? 0, market: mkOf(t.id), page: creatorPages.has(t.handle) }));
    const appFormats = formatRows.filter((f) => f.apps.some((x) => x?.slug === a.slug)).slice(0, 8).map((f) => ({ id: f.id, kind: f.kind, label: f.label, accounts: f.accounts, medX: f.medX, maxViews: f.maxViews, ...pageFlag(f.id) }));
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
      id: s.videoId, platform: s.platform, handle: s.authorHandle, app: a ? appRef(a) : null,
      views: s.views, x: round(s.multiplier ?? 0, 1), publishedAt: s.publishedAt, cover: cover(s.videoId, s.coverUrl, s.authorHandle), hook: s.hook,
      market: s.trackedAccountId && mkOf(s.trackedAccountId) ? mkOf(s.trackedAccountId) : marketOf(s.lang, s.region), region: s.region,
      ...(isPaid(s.trackedAccountId) ? { paid: true } : {}),
    };
  });
  const newFormats = formatRows.filter((f) => f.accounts >= 3 && now - f.firstSeenAt <= 7 * DAY).slice(0, 20);
  if (!G) boards.set("alerts", { updatedAt: now, videos: hotCards, formats: newFormats.map((f) => formatDoc(f, 3)) });
  const nicheViews = [...groupBy(appsBoard, (a) => a.niche).entries()].map(([n, as]) => [n, as.reduce((s, a) => s + a.views7, 0)] as [string, number]).sort((p, q) => q[1] - p[1]);
  if (!G) boards.set("home", {
    updatedAt: now,
    niches: nicheViews.filter(([n]) => n !== "Autres").slice(0, 6).map(([n]) => n),
    apps: appsBoard.slice(0, 4).map((a) => ({ slug: a.slug, name: a.name, icon: a.icon, views7: a.views7, weekDelta: a.weekDelta, bestX: a.bestX })),
    // Pas de formats : l'Accueil lit le document « formats » (audit Q66 : home.formats n'était lu nulle part).
    videos: hotCards.slice(0, 4),
  });

  // ── Ce que le Radar suit, pour la page d'accueil publique et la date du relevé (« Relevé du … ») ──
  // `at` change à chaque passage : ce document est réécrit chaque nuit (les autres seulement s'ils changent).
  if (!G) boards.set("stats", { updatedAt: now, at: now, apps: appsBoard.length, accounts: creatorAccounts.length, markets: MARKETS.length });

  // ── Recherche (palette) : un index léger ──
  // Les créateurs par documents de SEARCH_CREATORS : « search » porte les premiers et leur nombre de documents,
  // « search:creators:2 », « :3 »… la suite (16/11 : à 8 316 créateurs, Convex a refusé la liste, plus de 8 192 éléments,
  // et toutes les synchros de la nuit ont échoué ; un document est aussi borné à 1 Mio).
  if (!G) {
    const index = creators.filter((c) => creatorPages.has(c.handle)).map((c) => ({ handle: c.handle, app: c.app?.name ?? null, fans: c.fans, median: c.median }));
    const parts = Math.max(1, Math.ceil(index.length / SEARCH_CREATORS));
    boards.set("search", {
      updatedAt: now,
      apps: appsBoard.map((a) => ({ slug: a.slug, name: a.name, icon: a.icon, niche: a.niche, views30: a.views30 })),
      creators: index.slice(0, SEARCH_CREATORS), creatorPages: parts,
      formats: formatRows.slice(0, FORMAT_PAGES).map((f) => ({ id: f.id, kind: f.kind, label: f.label, accounts: f.accounts })),
    });
    for (let i = 2; i <= parts; i++) boards.set(`search:creators:${i}`, { updatedAt: now, creators: index.slice((i - 1) * SEARCH_CREATORS, i * SEARCH_CREATORS) });
  }

  // ── Lecteur : une page par vidéo citée ailleurs ──
  for (const s of hot.slice(0, 40)) {
    const tv = trackedByVideo.get(s.videoId);
    if (tv) usedVideos.set(tv.videoId, tv);
  }
  // Les pages vidéo (≈ 45 000) sont produites à l'écriture, une à une (`lazy`), pas gardées toutes en mémoire (15/11).
  // Leurs miniatures sont déjà comptées (cartes) ; on les note quand même, pour que la copie rangée ne soit pas effacée.
  for (const v of usedVideos.values()) addVideoPage(v);
  for (const s of hot.slice(0, 40)) {
    if (G || usedVideos.has(s.videoId) || trackedElsewhere.has(s.videoId)) continue;
    used.add(coverKey(s.videoId));
    lazy.set(`video:${s.videoId}`, () => videoPage(null, s));
  }
  videoPagesOpen = true;
  // La suite de lecture de chaque app (identifiants seulement), relevée maintenant : à l'écriture, la fiche de l'app a
  // déjà quitté `boards` quand ses pages vidéo sont produites (15/11, banc : 39 000 pages vidéo sans suite).
  const playlists = new Map<string, string[]>();
  for (const [k, b] of boards) if (k.startsWith("app:")) playlists.set(k.slice(4), ((b as { videos?: VideoCard[] }).videos ?? []).map((c) => c.id));
  for (const [slug, g] of fromGroups) playlists.set(slug, g.playlist);

  function videoPage(v: RVideo | null, s: RSignal | null) {
    const acc = v ? accountById.get(v.accountId) : s?.trackedAccountId ? accountById.get(s.trackedAccountId) : undefined;
    // Une vidéo qui ne cite pas son app n'est rattachée à aucune.
    const a = (v && !citesItsApp(v)) || (s && !citesItsApp(s)) ? null : canonical(v?.appId ?? s?.appId ?? null);
    const id = (v?.videoId ?? s?.videoId)!;
    const views = Math.max(v?.views ?? 0, s?.views ?? 0);
    const handle = acc?.handle ?? s?.authorHandle ?? "";
    const platform = v?.platform ?? s?.platform ?? "tiktok";
    const playlist = a ? playlists.get(a.slug) ?? [] : [];
    return {
      updatedAt: now, id, platform,
      url: platformUrl(s?.url) ?? (platform === "instagram" ? `https://www.instagram.com/reel/${id.replace(/^ig:/, "")}/` : `https://www.tiktok.com/@${handle}/video/${id}`),
      handle, fans: acc?.fans ?? s?.authorFans ?? null, normal: acc?.medianViews ?? null, paid: isPaid(acc?.id),
      app: a ? appRef(a, true) : null,
      market: acc ? mkOf(acc.id) ?? marketOf(s?.lang, s?.region ?? v?.region) : marketOf(s?.lang, s?.region ?? v?.region), region: s?.region ?? null,
      otherLang: acc ? otherLangOf(acc.id) : null,
      carousel: slidesOf(id) || null,
      kind: slidesOf(id) ? "carrousel" : aiOf(id)?.type || (acc ? mainType.get(acc.id) ?? null : null),
      publishedAt: v?.publishedAt ?? s?.publishedAt ?? null, durationSec: s?.durationSec ?? null,
      views, x: v ? xOf(v, s) : s?.multiplier ? round(s.multiplier, 1) : null,
      likes: s?.likes ?? null, comments: s?.comments ?? null, shares: s?.shares ?? null, saves: s?.saves ?? null,
      snapshots: (s?.snapshots?.length ? s.snapshots : v?.snapshots ?? []).slice(-12),
      hook: screenText(v, v?.hook ?? s?.hook, id), caption: v?.caption ?? s?.caption ?? null, transcript: s?.transcript ?? null,
      music: v?.musicTitle ?? s?.musicTitle ?? null,
      cover: cover(id, v?.coverUrl ?? s?.coverUrl, handle),
      playlist,
    };
  }

  // Icônes des apps : à chercher si on ne les a pas encore.
  // Icônes des apps : la fiche App Store retenue (identifiant), sinon le site d'une app web, sinon la recherche par nom.
  for (const a of apps) {
    // Déjà rangée, ou en échec récent (audit S33 : une icône toxique ne repasse pas en tête à chaque passage).
    if (mediaUrl(iconKey(a.slug)) || missing(iconKey(a.slug))) continue;
    const art = opts.artOf?.(a.slug) ?? null;
    const id = (storeOf(a.slug) ?? "").match(/\/id(\d+)/)?.[1] ?? null;
    const site = siteOf(a.slug);
    const src = site ? (site.startsWith("https://") ? site : `site:${site}`) : art ?? (id ? `itunesid:${id}` : null);
    if (src) need.set(iconKey(a.slug), src);
  }

  // Comptes sans pays : 3 de leurs vidéos les plus récentes, pour que Swarm lise leur pays de création.
  const regionTodo = accounts.filter((t) => !mkOf(t.id)).map((t) => ({ handle: t.handle,
    ids: (videosByAccount.get(t.id) ?? []).filter((v) => TIKTOK_ID.test(v.videoId)).sort((p, q) => q.publishedAt - p.publishedAt).slice(0, 3).map((v) => v.videoId) }))
    .filter((x) => x.ids.length);
  // Les vidéos TikTok montrées dont on ne sait pas encore si ce sont des carrousels, les plus vues d'abord.
  const laterTodos = () => ({ slideTodo: [...usedVideos.values()].filter((v) => v.platform !== "instagram" && TIKTOK_ID.test(v.videoId) && slidesOf(v.videoId) === undefined)
    .sort((p, q) => q.views - p.views).map((v) => v.videoId),
  // Lecture IA : les vidéos montrées pas encore lues (les plus vues d'abord), et les comptes « ambassadeur » sans genre
  // (ses vidéos « ambassadeur » les plus vues, 3 au plus, montrées à l'IA avec sa photo de profil).
  videoAiTodo: [...usedVideos.values()].filter((v) => aiOf(v.videoId) === undefined && trackedHasImage(v))
    .sort((p, q) => q.views - p.views).map((v) => v.videoId) });
  // Genre : tous les créateurs à fiche dont on connaît le type ; la synchro ne garde que ceux qui n'ont pas encore de
  // lecture par le contenu (genderKnown). Ses 5 vidéos les plus vues, tous types confondus (18/11 : 3 vidéos de son
  // seul type principal laissaient la photo de profil trancher).
  const genderTodo = creatorAccounts.filter((t) => shownCreator(t) && mainType.get(t.id)).map((t) => ({
    handle: t.handle,
    ids: (videosByAccount.get(t.id) ?? []).filter((v) => trackedHasImage(v)).sort((p, q) => q.views - p.views).slice(0, 5).map((v) => v.videoId),
  })).filter((x) => x.ids.length);
  if (groupOut) {
    // Étape « groupe » : seules ses fiches d'app restent dans `boards` (le reste est aux pages communes).
    for (const k of [...boards.keys()]) if (!k.startsWith("app:")) boards.delete(k);
    const listedSlugs = new Set(listed.keys());
    for (const r of appRows) {
      const a = appBySlug.get(r.slug);
      if (!a || !ownsApp(a.id)) continue;
      const { _top12, _accs, ...row } = r;
      const byMarket = vidsByAppMarket.get(a.id);
      const recent = listedSlugs.has(r.slug) && byMarket
        ? [...byMarket.entries()].filter(([code, vs]) => code && vs.some((v) => v.views > 0 && now - v.publishedAt <= recentDays)).map(([code]) => code) : [];
      groupOut.apps.push({ slug: r.slug, row, playlist: playlists.get(r.slug) ?? [], recent });
    }
    for (const t of raw.tracked) if (ownsAccount(t)) groupOut.accounts[t.id] = [mkOf(t.id), otherLangOf(t.id), mainType.get(t.id) ?? null];
    const memberIds = new Set(raw.formats.flatMap((f) => f.members.map((m) => m.videoId)));
    groupOut.tracked = raw.trackedVideos.filter((v) => signalByVideo.has(v.videoId) || memberIds.has(v.videoId)).map((v) => v.videoId);
  }
  return { boards, lazy, need, used, regionTodo, laterTodos, genderTodo, langTodo, out: groupOut, markets: MARKETS.map((m) => m[0]) };
}
