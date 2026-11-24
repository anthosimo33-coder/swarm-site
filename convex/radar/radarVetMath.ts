/**
 * RADAR — LE FILTRE D'ENTRÉE d'un compte. Règles pures (les écritures : convex/radarVet).
 *
 * Pourquoi : jusqu'au 13/11/2026, UNE vidéo qui cite une app suffisait à faire entrer son auteur dans le réseau de
 * l'app — il était relevé tout de suite (1 crédit), montré partout, et ne sortait qu'après 9 vidéos lues sans
 * aucune citation. Le fondateur, ce jour-là, devant le compte d'une émission de télé-réalité rangé sous « declic »
 * et un compte de médecine sous « Hyper » : « beaucoup, beaucoup de déchets ».
 *
 * Un compte qui POUSSE une app en parle plus d'une fois. Avant d'entrer, il est donc lu sur sa page publique
 * (gratuite : sa bio et ses 10 à 13 dernières vidéos avec leur légende) et n'entre que PROUVÉ :
 *  - son pseudo porte l'app, ou sa bio la nomme ;
 *  - ou au moins 2 de ses dernières vidéos la citent ; ou une seule, si elle fait au moins le tiers de ce qu'il
 *    a publié (un compte tout neuf).
 *
 * Mesuré le 13/11/2026 sur 570 comptes suivis, relus sur leur page publique :
 *  - comptes des réseaux anciens : 85 % prouvés (96 % citent au moins une fois) ; les autres sont des mentions
 *    isolées — une page d'extraits de télé-réalité sous Snitchy (1 vidéo sur 11), une thérapeute sous Finch ;
 *  - comptes des apps entrées ce jour-là sous leur bon motif : 66 % prouvés, 20 % ne citent plus du tout l'app ;
 *  - comptes rattachés par un motif trop large (« hush », « hyper », « guardian »…) : 4 % prouvés ;
 *  - apps dont le nom est un mot courant (« equals », « aisance », « arkose ») : 27 %.
 * Un compte non prouvé n'est pas rattaché, donc jamais relevé : c'est aussi la première économie de crédits.
 */
import { bioNamesApp, citesNormalized, normalize, type AppRule } from "./radarNetworkMath";
import { parseFreeProfile } from "./radarFreeMath";

const HOUR = 3_600_000;

/** Vidéos qui citent l'app, parmi les dernières, pour qu'un compte soit prouvé. */
export const VET_MIN_VIDEOS = 2;
/** Une seule suffit si elle fait au moins cette part de ce qu'il a publié (un compte de 1 à 3 vidéos). */
export const VET_MIN_SHARE = 1 / 3;

export type Proof = "handle" | "bio" | "videos";

/**
 * Ce qui prouve qu'un compte pousse l'app, ou `null`. `texts` : le texte de chacune de ses dernières vidéos (sa
 * légende sur la page publique ; légende et texte à l'écran après un relevé).
 */
export function accountProof(handle: string, bio: string | null | undefined, texts: readonly string[], rule: AppRule): Proof | null {
  if (citesNormalized(normalize(handle), rule)) return "handle";
  if (bioNamesApp(bio, rule)) return "bio";
  const cites = texts.filter((t) => citesNormalized(normalize(t), rule)).length;
  return cites >= VET_MIN_VIDEOS || (cites >= 1 && cites >= texts.length * VET_MIN_SHARE) ? "videos" : null;
}

/**
 * Ce qui relie un compte à son app, tel qu'on peut le montrer : la preuve (`by`), et combien de ses dernières vidéos
 * citent l'app (`cites` sur `of`). `by` vaut « seed » ou « manual » pour un compte choisi à la main que ses vidéos
 * rangées ne prouvent pas, `null` pour un compte entré par une légende qu'elles ne prouvent plus.
 */
export type ProofDetail = { by: Proof | "seed" | "manual" | null; cites: number; of: number };

export function proofDetail(
  handle: string,
  bio: string | null | undefined,
  texts: readonly string[],
  rule: AppRule,
  matchedBy: "caption" | "manual" | "seed",
): ProofDetail {
  const cites = texts.filter((t) => citesNormalized(normalize(t), rule)).length;
  const proof = accountProof(handle, bio, texts, rule);
  return { by: proof ?? (matchedBy === "caption" ? null : matchedBy), cites, of: texts.length };
}

// ─── L'âge d'une preuve par vidéos ───────────────────────────────────────────

const DAY = 24 * HOUR;

/**
 * Une preuve par vidéos a un âge (24/11/2026). Le fondateur, devant une créatrice de recettes rangée sous
 * Solaia : ses vidéos ne poussent pas Solaia. Elles l'ont poussée : six, du 20/09 au 09/10, qui la nomment comme l'app
 * qu'elle utilise ; puis cinq autres jusqu'au 18/11 sans la nommer. Six de ses douze dernières vidéos la citaient encore :
 * la règle des deux vidéos la prouvait, et l'aurait prouvée tant que ces six restaient parmi ses trente dernières.
 *
 * Sur la prod du 24/11 (11 942 créateurs montrés), ~600 comptes reliés par leurs seules vidéos ne nommaient plus leur
 * app depuis plus de 42 jours tout en ayant publié au moins deux vidéos depuis — des comptes UGC passés à une autre app
 * (PCOS Pal → Noise, DealSeek → TendWell, Margins → SlowRead), des créateurs dont la campagne est finie, et des
 * homonymes entrés avant le filtre (« #houseappliances » sous House AI, la classe « 7mo B » sous 7mob).
 *
 * 42 jours : la fenêtre la plus longue que Kopycat montre d'une app (son historique jour par jour, radarModels.DAYS).
 * Une vidéo plus ancienne ne compte déjà plus dans ses vues : retirer son auteur n'en enlève aucune.
 */
export const PROOF_FRESH_MS = 42 * DAY;
/**
 * Un nom d'app d'au moins 4 lettres, sans espaces, est cherché tel quel dans les vidéos publiées après la dernière
 * citation. Ses motifs sont parfois plus étroits que ce qu'écrivent ses créateurs (« faithmode.app » quand une vidéo
 * dit « Search "Faith Mode" ») : un compte qui nomme encore l'app la pousse encore. Le nom ne sert qu'à garder.
 */
export const NAME_MIN = 4;

/** Le texte d'une vidéo et sa date de publication. */
export type DatedText = { text: string; at: number };

/** Le texte nomme-t-il l'app, par un motif ou par son nom ? */
function namesApp(text: string, rule: AppRule, name: string): boolean {
  const n = normalize(text);
  if (citesNormalized(n, rule)) return true;
  const key = normalize(name).compact;
  return key.length >= NAME_MIN && citesNormalized(n, { strong: [key], ...(rule.not ? { not: rule.not } : {}) });
}

/**
 * Sa preuve par vidéos est-elle PÉRIMÉE ? `texts` : ses dernières vidéos, les plus récentes d'abord. Oui quand sa
 * dernière vidéo qui cite l'app a plus de 42 jours ET qu'il a publié depuis au moins deux vidéos avec du texte (autant
 * qu'il en faut pour le prouver, `VET_MIN_VIDEOS`), dont aucune ne nomme l'app. Non quand aucune ne la cite (ce
 * n'est pas une preuve périmée, c'est une preuve absente), ni quand il n'a rien publié depuis (un compte qui ne publie
 * plus : rien de ce qu'on montre de lui ne parle d'autre chose). Une vidéo sans légende ni texte à l'écran ne dit rien :
 * elle ne compte pas. Rejoué sur la prod du 24/11, une seule vidéo après la campagne retirait aussi des créateurs qui
 * la poussaient encore sans la nommer (« My new obsession: having to stalk a missing girl… » d'un compte ColdTrace).
 */
export function staleVideoProof(texts: readonly DatedText[], rule: AppRule, name: string, now: number): boolean {
  const last = texts.findIndex((t) => citesNormalized(normalize(t.text), rule));
  if (last < 0 || now - texts[last].at <= PROOF_FRESH_MS) return false;
  const since = texts.slice(0, last).filter((t) => t.text.trim().length > 0);
  return since.length >= VET_MIN_VIDEOS && !since.some((t) => namesApp(t.text, rule, name));
}

/**
 * Un compte relié à son app par ses SEULES vidéos, et dont cette preuve est périmée (staleVideoProof) : l'export Kopycat
 * le montre en pause (#37) ; le Radar le met en pause à son relevé et ne le relance pas au rejugement
 * (convex/radar/radarNetworks). Décision du fondateur, 24/11/2026 (« arrêt complet ») : plus aucun relevé, gratuit,
 * payant ni Instagram, pour ces ~600 comptes ; il ne revient qu'à la main (`keptByHand`). Pseudo, bio, liste de départ,
 * ajout à la main et placement payé ne s'usent pas. `recent` : ses vidéos rangées, les plus récentes d'abord.
 */
export function staleLink(
  acc: { handle: string; bio?: string | null; matchedBy: "caption" | "manual" | "seed"; placement?: boolean },
  app: AppRule & { name: string },
  recent: readonly { platform?: string; caption?: string | null; hook?: string | null; publishedAt: number }[],
  now: number,
): boolean {
  if (acc.placement) return false;
  if (proofDetail(acc.handle, acc.bio, [], app, acc.matchedBy).by !== null) return false;
  const texts = recent.filter((r) => !r.platform).map((r) => ({ text: `${r.caption ?? ""} ${r.hook ?? ""}`, at: r.publishedAt }));
  return staleVideoProof(texts, app, app.name, now);
}

// ─── Un passage du filtre ────────────────────────────────────────────────────

/** Comptes vérifiés au plus par passage (un passage toutes les 5 minutes, une page par compte). */
export const VET_PER_RUN = 120;
/** Durée d'un passage, au plus. */
export const VET_MAX_MS = 4 * 60_000;
/** Pages refusées d'affilée qui arrêtent le passage. */
export const VET_BREAKER = 5;
/** Verdicts écrits d'un coup. */
export const VET_APPLY_BATCH = 20;
/**
 * Un compte qui attend sa vérification depuis 6 heures (TikTok ne sert pas sa page) entre quand même : son premier
 * relevé, payant, le prouvera ou le mettra en pause (`needsProof`).
 */
export const VET_MAX_WAIT_MS = 6 * HOUR;
/** Un compte écarté n'est pas revérifié pour la même app avant 30 jours. */
export const REJECTED_KEEP_MS = 30 * 24 * HOUR;

export type VetPage = { ok: true; text: string } | { ok: false; kind: "absent" | "suspect" };

export type VetOutcome =
  /** Prouvé : il entre, avec ses abonnés et sa bio lus sur sa page. */
  | { kind: "proven"; proof: Proof; fans: number; bio: string }
  /** Pas un compte qui pousse l'app : il n'entre pas. « stale » : il l'a poussée, il ne la nomme plus (staleVideoProof). */
  | { kind: "unproven"; why: "private" | "cites" | "stale" }
  /** Sa page publique ne dit rien (TikTok ne la sert pas pour ce compte, ou elle ne liste aucune vidéo) : son premier relevé tranchera. */
  | { kind: "paid" }
  /** TikTok a refusé la page : à redemander au passage suivant. */
  | { kind: "retry" };

/**
 * Ce que la page publique d'un compte dit de lui, pour l'app où on l'a trouvé. `app` : le nom de l'app et l'heure du
 * passage, qui disent si sa preuve par vidéos est encore fraîche.
 */
export function vetOutcome(page: VetPage, handle: string, rule: AppRule, app: { name: string; now: number }): VetOutcome {
  if (!page.ok) return page.kind === "absent" ? { kind: "paid" } : { kind: "retry" };
  const profile = parseFreeProfile(page.text);
  if (!profile) return { kind: "retry" };
  // Un compte privé ne se relève pas : il n'a rien à montrer.
  if (profile.private) return { kind: "unproven", why: "private" };
  const proof = accountProof(
    handle,
    profile.bio,
    profile.videos.map((v) => v.caption),
    rule,
  );
  // Prouvé par des vidéos d'il y a plus de 42 jours, et il a publié depuis sans nommer l'app : il ne la pousse plus.
  if (proof === "videos" && staleVideoProof(profile.videos.map((v) => ({ text: v.caption, at: v.publishedAt })), rule, app.name, app.now)) {
    return { kind: "unproven", why: "stale" };
  }
  if (proof) return { kind: "proven", proof, fans: profile.fans, bio: profile.bio };
  return profile.videos.length === 0 ? { kind: "paid" } : { kind: "unproven", why: "cites" };
}

/** Attend-il depuis trop longtemps (la page n'est jamais servie) ? Il entre alors par le relevé payant. */
export const waitedTooLong = (queuedAt: number, now: number): boolean => now - queuedAt >= VET_MAX_WAIT_MS;
