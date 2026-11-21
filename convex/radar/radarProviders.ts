/**
 * RADAR — LES DEUX FOURNISSEURS (20/11/2026) : quels postes TikTok passent chez TikHub (convex/radar/tikhubApi),
 * lesquels restent chez ScrapeCreators, et comment un appel est aiguillé, compté et rattrapé.
 *
 * LE RÉGLAGE. Variable d'environnement `RADAR_TIKHUB` (liste de jetons séparés par des virgules, ou `all`) ET clé
 * `TIKHUB_API_KEY`. Sans les deux, AUCUN appel TikHub ne part (solde compris) et chaque tâche fait exactement les mêmes
 * appels ScrapeCreators qu'avant la bascule. Retour en arrière : retirer la variable, sans redéployer.
 *  - `tiktok`  : les relevés payants de profil (banc du 20/11 : 20 comptes sur 20 identiques) ;
 *  - `curve`   : le détail d'une vidéo, à la même adresse (vues identiques ; abonnés à 0 gardés, cf applyCurve) ;
 *  - `network` : les passes du réseau d'une app mesurées identiques — hashtag sans région (52 comptes contre 52),
 *                mot-clé FR par pertinence (90 contre 91) ;
 *  - `network-all` : en plus, le mot-clé sans région (envoyé en US) et le hashtag FR — NON prouvés (ensembles de
 *                vidéos différents, hashtag FR jamais mesuré) : choix du fondateur, après un banc ;
 *  - `search`  : toute la découverte — NON prouvée hors FR (écarts mesurés en BR, MX, ES), hors de `all`.
 * `all` = `tiktok,curve,network`. Les passes triées par date et les tournures (`naming`, radarNaming) restent chez
 * ScrapeCreators : au banc, le tri « plus récentes » de TikHub rendait 1 vidéo contre 30 en FR (20/11/2026).
 */
import { internal } from "../_generated/api";
import type { ActionCtx } from "../_generated/server";
import type { NetworkPass } from "./radarNetworkMath";
import type { JobState } from "./radarSignals";
import {
  TH_BALANCE_STALE_MS,
  TH_DAY_CAP_USD,
  TH_PRICE_USD,
  budgetState,
  capUnits,
  priceOf,
  type AllowanceParts,
  thPerDay,
  type BudgetState,
  type PosteKey,
  type Provider,
  type SavedKey,
  type ThBalance,
} from "./radarSignalsMath";
import { scKeyPresent, type ScCall } from "./scrapeCreatorsApi";
import { thBalance, thKeyPresent, thPrices, type ThKind, type ThOpts, type ThPrices, type ThResult } from "./tikhubApi";

export type ThJob = "tiktok" | "curve" | "network" | "network-all" | "search";
const JOBS: readonly ThJob[] = ["tiktok", "curve", "network", "network-all", "search"];
const ALL: readonly ThJob[] = ["tiktok", "curve", "network"];

/**
 * Les postes réglés chez TikHub. Insensible à la casse et aux espaces ; un jeton inconnu est ignoré, `naming` aussi
 * (les tournures restent chez ScrapeCreators, cf en-tête). Vide sans `TIKHUB_API_KEY`.
 */
export function tikhubJobs(env: Readonly<Record<string, string | undefined>> = process.env): ReadonlySet<ThJob> {
  const raw = env.RADAR_TIKHUB;
  if (!env.TIKHUB_API_KEY || !raw) return new Set();
  const out = new Set<ThJob>();
  for (const t of raw.split(",").map((x) => x.trim().toLowerCase())) {
    if (t === "all") for (const j of ALL) out.add(j);
    else if ((JOBS as readonly string[]).includes(t)) out.add(t as ThJob);
  }
  return out;
}

/**
 * Le plafond TikHub du jour, en dollars (radarSignalsMath.TH_DAY_CAP_USD) : `RADAR_TIKHUB_USD_PER_DAY` s'il est un
 * nombre fini positif ou nul (virgule ou point décimal ; 0 arrête TikHub), sinon 5 $ — une valeur illisible ne lève
 * jamais le plafond. Lu à chaque passage : se change sans redéployer.
 */
export function thDayCapUsd(env: Readonly<Record<string, string | undefined>> = process.env): number {
  const raw = env.RADAR_TIKHUB_USD_PER_DAY?.trim();
  if (!raw) return TH_DAY_CAP_USD;
  const usd = Number(raw.replace(",", "."));
  return Number.isFinite(usd) && usd >= 0 ? usd : TH_DAY_CAP_USD;
}

/** Le fournisseur réglé de chaque poste TikTok (le réseau est mixte : cf `passProvider`). */
export function posteProviders(jobs: ReadonlySet<ThJob>): Partial<Record<PosteKey, Provider>> {
  const out: Partial<Record<PosteKey, Provider>> = {};
  if (jobs.has("tiktok")) out.tiktok = "tikhub";
  if (jobs.has("curve")) out.curve = "tikhub";
  if (jobs.has("search")) out.search = "tikhub";
  if (jobs.has("network") || jobs.has("network-all")) out.network = "tikhub";
  return out;
}

/** Le fournisseur d'un poste (ScrapeCreators sans réglage). */
export const posteProvider = (jobs: ReadonlySet<ThJob>, k: PosteKey): Provider => posteProviders(jobs)[k] ?? "sc";

/**
 * Le fournisseur d'une passe de recherche de réseau, et la région à envoyer à TikHub. Les passes triées par date
 * restent chez ScrapeCreators (tri non mesuré sur 3 mois). Sous `network` : le hashtag sans région (sans paramètre,
 * la configuration mesurée) et le mot-clé FR par pertinence. Sous `network-all`, en plus : le mot-clé sans région
 * (TikHub exige une région : US, la sienne par défaut) et le hashtag FR.
 */
export function passProvider(pass: Pick<NetworkPass, "kind" | "region" | "sort">, jobs: ReadonlySet<ThJob>): { provider: Provider; region?: string } {
  const sc = { provider: "sc" as const };
  if (pass.sort === "date") return sc;
  const network = jobs.has("network") || jobs.has("network-all");
  const all = jobs.has("network-all");
  if (pass.kind === "hashtag") {
    if (pass.region === null) return network ? { provider: "tikhub" } : sc;
    if (pass.region === "FR") return all ? { provider: "tikhub", region: "FR" } : sc;
    return sc;
  }
  if (pass.region === "FR") return network ? { provider: "tikhub", region: "FR" } : sc;
  if (pass.region === null) return all ? { provider: "tikhub", region: "US" } : sc;
  return sc;
}

// ─── Le passage d'une tâche : budget, aiguillage, repli, coupe-circuit, échéance ─────────────────────────────────

/** Un passage basculé (au moins un appel chez TikHub) s'arrête à 8 minutes : une tâche Convex est coupée à 10. */
export const PASS_DEADLINE_MS = 8 * 60_000;
/**
 * Délai d'un appel TikHub : 30 s, ENTIERS, et l'appel doit finir 30 s avant l'échéance — rien ne part s'il ne reste pas
 * ce temps (le dernier appel d'un passage part donc à 7 minutes). Corrigé le 20/11/2026 : le délai était rogné au temps
 * qui restait (500 ms à 7 min 29,5 s, quand TikHub répond en 1,8 s au banc) ; l'appel abandonné par NOTRE échéance
 * revenait comme un échec de TikHub, payé au prix plein (facturation inconnue) : la vidéo sortait de la courbe, le
 * compte prenait une erreur de relevé, la recherche était passée, et trois de suite déclaraient TikHub en panne.
 */
export const TH_CALL_MAX_MS = 30_000;
export const TH_CALL_MARGIN_MS = 30_000;
/** Pas de repli chez ScrapeCreators à moins de 90 s de l'échéance (son délai est de 60 s, plus la marge). */
export const FALLBACK_MIN_LEFT_MS = 90_000;
/**
 * Appels repassés par ScrapeCreators faute de TikHub, par jour et tous postes (à confirmer par le fondateur, 20/11/2026) :
 * un TikHub à sec ou en panne n'est jamais reporté EN BLOC sur la clé ScrapeCreators, que partagent les relevés de la
 * paie de Jarvia. Au-delà, l'appel attend le passage suivant : une baisse de qualité visible (jobs.tikhub, /admin).
 */
export const FALLBACK_SC_PER_DAY = 100;
/** Trois échecs d'affilée chez TikHub (panne, trop d'appels, délai, réseau, refus de TikTok) : en panne pour le passage. */
export const BREAKER_FAILS = 3;
/** Un 429 ou un 5xx est redemandé une fois, après cette pause. */
export const RETRY_PAUSE_MS = 2_000;
/** Le solde TikHub (une lecture par seconde au plus) n'est relu qu'à plus de 1,1 s de la lecture d'avant. */
export const TH_BALANCE_SPACING_MS = 1_100;
/** Les tarifs des routes TikHub se relisent au plus une fois par jour. */
export const TH_PRICES_EVERY_MS = 86_400_000;
/** Délai des lectures gratuites (solde, tarifs). */
const TH_FREE_CALL_MS = 10_000;

/** La dépense d'un appel aiguillé : crédits ScrapeCreators, appels et dollars TikHub, appels inconnus, replis. */
export type Spend = { sc: number; th: number; usd: number; unknown: number; fallback: number };
export const NO_SPEND: Spend = { sc: 0, th: 0, usd: 0, unknown: 0, fallback: 0 };
/** Les unités d'une dépense (cf radarSignalsMath.thUnits) : un crédit ScrapeCreators, un appel TikHub. */
export const spendUnits = (s: Spend): number => s.sc + s.th + s.unknown;

/**
 * Le résultat d'un appel aiguillé, servi par `served`. Pas de champ `credits` : la dépense est dans `spend`.
 *  - `noCredits` : ScrapeCreators à sec (HTTP 402), comme avant la bascule ;
 *  - `transient` : TikHub n'a pas pu servir (panne, à sec, délai, refus 4xx) et le repli n'était pas permis — RIEN n'est à
 *    conclure sur le compte, la vidéo ou la recherche, qui restent dus ;
 *  - `thFailed` : TikHub a rendu un échec pour cet appel (5xx redemandé, 429 redemandé, 4xx, délai, réseau). Faux
 *    quand il n'a pas été appelé (en panne pour le passage, budget du passage épuisé), quand l'échéance n'a pas laissé
 *    partir l'appel ou sa nouvelle demande avec son délai entier (cf TH_CALL_MAX_MS : un appel n'est jamais coupé par
 *    notre échéance), quand il a refusé la clé ou n'a plus de solde (401, 402 : rien n'est dit de l'appel lui-même), et
 *    pour un appel ScrapeCreators. Un échec passager avec `thFailed` se conclut comme un échec ScrapeCreators d'avant
 *    la bascule (la vidéo sort de la courbe, le compte prend une erreur de relevé, la recherche est passée), que ce
 *    refus fasse sauter le coupe-circuit ou non : le coupe-circuit ne garde dus que les appels qu'il a empêché de partir
 *    (20/11/2026). Une recherche de réseau le traite comme une page refusée chez ScrapeCreators (radarNetworks).
 */
export type Routed<T> =
  | { ok: true; value: T; spend: Spend; served: Provider; creditsRemaining?: number }
  | { ok: false; error: string; spend: Spend; served: Provider; noCredits: boolean; transient: boolean; thFailed: boolean; creditsRemaining?: number };

/** L'erreur d'un appel que l'échéance du passage a empêché de partir chez TikHub (ou d'y être redemandé). */
const TIME_UP = "TikHub : plus le temps avant l'échéance du passage";

type ThWritten = { thCalls: number; thUsd: number; thUnknown: number; thFallbacks: number };
const NOTHING_WRITTEN: ThWritten = { thCalls: 0, thUsd: 0, thUnknown: 0, thFallbacks: 0 };

/**
 * LE CARNET D'UN PASSAGE : ce qu'il a dépensé chez chaque fournisseur, ses erreurs, et ce qu'il a appris de TikHub
 * (solde lu, refus « solde insuffisant », dernière erreur, tarifs). Écrit par recordRun : en une fois en fin de passage
 * (découverte, courbe, tournures), ou au fil de l'eau (`usageWriter`, réseau et relevés).
 * Avec, depuis la fusion des briques gratuites (#19, #24, #25, #26, 20/11/2026) : les appels payants ÉVITÉS par une page
 * publique (`saved`, radarUsage.saved) et la mesure côte à côte des briques en mesure (`measured`, radarUsage.measured).
 * Une brique décide AVANT le choix du fournisseur : un appel évité l'est chez l'un comme chez l'autre (un crédit
 * ScrapeCreators ou un appel TikHub), et les deux compteurs gardent le même sens quel que soit le fournisseur.
 */
export class PassBook {
  credits = 0;
  calls = 0;
  errors = 0;
  thCalls = 0;
  thUsd = 0;
  thUnknown = 0;
  thFallbacks = 0;
  readonly reasons: Record<string, number> = {};
  /** Appels payants évités par une page publique, par brique (radarSignalsMath.SavedKey) : pas comptés dans la dépense. */
  readonly saved: Record<string, number> = {};
  /** La mesure côte à côte d'une brique en mesure, par verdict (radarFreeMath.CurveMeasure, GapMeasure). */
  readonly measured: Record<string, number> = {};
  /** Le dernier solde TikHub lu : `usdAtRead`, ce que le passage avait dépensé chez TikHub à ce moment. */
  thBalance: { paidUsd: number; freeUsd: number; at: number; usdAtRead: number } | undefined;
  thDryRoute: string | undefined;
  thError: string | undefined;
  thPrices: { route: string; usd: number; free: boolean }[] | undefined;

  add(s: Spend): void {
    this.credits += s.sc;
    this.thCalls += s.th;
    this.thUsd += s.usd;
    this.thUnknown += s.unknown;
    this.thFallbacks += s.fallback;
  }
  units(): number {
    return this.credits + this.thCalls + this.thUnknown;
  }
  thSpentUsd(): number {
    return this.thUsd + this.thUnknown * TH_PRICE_USD;
  }
  /** Des unités dépensées pour ce motif (déjà comptées par `add`). */
  because(reason: string, units: number): void {
    if (units > 0) this.reasons[reason] = (this.reasons[reason] ?? 0) + units;
  }
  /** Des appels payants évités par une page publique (au moins un appel chacun, chez l'un ou l'autre fournisseur). */
  spare(key: SavedKey, calls: number): void {
    if (calls > 0) this.saved[key] = (this.saved[key] ?? 0) + calls;
  }
  /** Un verdict de la mesure côte à côte (page publique contre payant) d'une brique en mesure. */
  measure(key: string, n = 1): void {
    if (n > 0) this.measured[key] = (this.measured[key] ?? 0) + n;
  }
  /** Un solde lu à `at`, quand le passage avait dépensé `usdAtRead` chez TikHub (cf makeRouter.readBalance). */
  seenTh(paidUsd: number, freeUsd: number, at: number, usdAtRead = this.thSpentUsd()): void {
    this.thBalance = { paidUsd, freeUsd, at, usdAtRead };
  }
  /**
   * Les champs TikHub de recordRun pour ce qui n'est pas encore écrit (`written`). VIDE sans TikHub : les arguments
   * de recordRun restent ceux d'avant la bascule. `balance` : joindre le solde lu (pas encore écrit).
   */
  thArgs(written: ThWritten = NOTHING_WRITTEN, balance = true) {
    const d = { thCalls: this.thCalls - written.thCalls, thUsd: this.thUsd - written.thUsd, thUnknown: this.thUnknown - written.thUnknown, thFallbacks: this.thFallbacks - written.thFallbacks };
    const writtenUsd = written.thUsd + written.thUnknown * TH_PRICE_USD;
    const b = balance ? this.thBalance : undefined;
    return {
      ...(d.thCalls > 0 ? { thCalls: d.thCalls } : {}),
      ...(d.thUsd > 0 ? { thUsd: d.thUsd } : {}),
      ...(d.thUnknown > 0 ? { thUnknown: d.thUnknown } : {}),
      ...(d.thFallbacks > 0 ? { thFallbacks: d.thFallbacks } : {}),
      ...(b ? { thBalanceUsd: b.paidUsd, thFreeUsd: b.freeUsd, thSeenAt: b.at, thSpentAfterUsd: Math.max(0, this.thSpentUsd() - Math.max(b.usdAtRead, writtenUsd)) } : {}),
      ...(this.thDryRoute ? { thDryRoute: this.thDryRoute } : {}),
      ...(this.thError ? { thLastError: this.thError } : {}),
      ...(this.thPrices ? { thPrices: this.thPrices } : {}),
    };
  }
}

/** La tâche de ce poste fait-elle servir des appels par TikHub (le réseau : au moins une de ses passes) ? */
export function taskOnTikHub(jobs: ReadonlySet<ThJob>, poste: PosteKey): boolean {
  if (poste === "network") return jobs.has("network") || jobs.has("network-all");
  return (poste === "tiktok" || poste === "curve" || poste === "search") && jobs.has(poste);
}

/**
 * Le solde TikHub d'un passage pour le budget (radarSignalsMath.ThBalance) : celui lu par le passage, sinon le rangé ;
 * son rythme, celui des postes que TikHub sert sous ce réglage (radarSignalsMath.thPerDay).
 */
function thBalanceFor(st: JobState, jobs: ReadonlySet<ThJob>, book: PassBook | undefined, now: number): ThBalance | null {
  const perDay = thPerDay(st.recentUsage, st.day, posteProviders(jobs));
  if (book?.thBalance) {
    const b = book.thBalance;
    return { paidUsd: b.paidUsd, freeUsd: b.freeUsd, seenAt: b.at, spentSinceUsd: book.thSpentUsd() - b.usdAtRead, now, perDay };
  }
  return st.th ? { paidUsd: st.th.paidUsd, freeUsd: st.th.freeUsd, seenAt: st.th.seenAt, spentSinceUsd: st.th.spentSinceUsd, now, perDay } : null;
}

/**
 * LE BUDGET DU MOIS, LE MÊME POUR TOUTES LES TÂCHES. Sans aucun poste réglé chez TikHub : le budget de ScrapeCreators
 * seul, exactement celui d'avant le 20/11/2026. Avec : chaque poste chez son fournisseur réglé et le solde TikHub (celui
 * que le passage a lu, `book`, sinon le rangé) — QUELLE QUE SOIT la tâche qui le lit, basculée ou non, avec ou sans
 * aiguilleur, comme /admin (radarSignals.getRadarBudgetCore). Corrigé le 20/11/2026 : une tâche non basculée (la courbe
 * sous RADAR_TIKHUB=tiktok, les tournures, Instagram, les transcriptions, l'analyse IA) jugeait la projection du mois
 * au prix ScrapeCreators partout, et coupait entre 80 et 100 % du plafond un poste que les relevés et /admin voyaient
 * ouvert.
 */
export function jobBudget(st: JobState, jobs: ReadonlySet<ThJob> = tikhubJobs(), book?: PassBook, now = st.balance?.now ?? Date.now()): BudgetState {
  if (jobs.size === 0) return budgetState(st.budget, st.usage, st.balance);
  return budgetState(st.budget, st.usage, st.balance, {
    providers: posteProviders(jobs),
    th: thBalanceFor(st, jobs, book, now),
    thDay: { today: st.day, capUsd: thDayCapUsd() },
  });
}

export type RouterOpts = {
  poste: PosteKey;
  jobs: ReadonlySet<ThJob>;
  st: JobState;
  book: PassBook;
  /**
   * Prend une place du quota de replis du jour, tous passages confondus (`fallbackClaimer` : radarSignals.claimFallback),
   * avant chaque repli : `false`, le quota est atteint.
   */
  claimFallback: () => Promise<boolean>;
  /** Début du passage : l'échéance en part. */
  start: number;
  clock?: () => number;
  sleep?: (ms: number) => Promise<void>;
  fetchImpl?: typeof fetch;
};

/**
 * L'AIGUILLEUR d'un passage. Sans bascule pour la tâche (ou sans clé), il appelle ScrapeCreators à l'identique et ne
 * touche jamais TikHub. Avec : il lit le solde et les tarifs TikHub en tête de passage (gratuits), aiguille chaque
 * appel avec un délai borné par l'échéance, le redemande une fois sur 429 ou 5xx, compte les échecs d'affilée
 * (coupe-circuit), et repasse par ScrapeCreators quand TikHub ne sert pas — sous la porte de repli.
 */
export function makeRouter(o: RouterOpts) {
  const clock = o.clock ?? Date.now;
  const sleep = o.sleep ?? ((ms: number) => new Promise<void>((done) => setTimeout(done, ms)));
  const on = taskOnTikHub(o.jobs, o.poste) && thKeyPresent();
  const deadline = on ? o.start + PASS_DEADLINE_MS : undefined;
  let prices: ThPrices | null = o.st.thPrices;
  let lastRead = -Infinity;
  let streak = 0;
  let down: string | null = null;
  let fallbacks = 0;
  // Le quota du jour s'est révélé atteint (place refusée par la base) : plus aucun repli dans ce passage.
  let quotaFull = false;
  let budget: BudgetState | null = null;
  const state = (): BudgetState => (budget ??= jobBudget(o.st, o.jobs, o.book, clock()));

  /** Un appel TikHub qui partirait dans `after` ms aurait-il son délai entier, fini 30 s avant l'échéance ? */
  const fits = (after = 0): boolean => deadline === undefined || deadline - TH_CALL_MARGIN_MS - (clock() + after) >= TH_CALL_MAX_MS;
  /** Les options d'un appel TikHub, toujours avec son délai entier (cf TH_CALL_MAX_MS) ; `null` : il ne part pas. */
  const thOpts = (): ThOpts | null => {
    if (!fits()) return null;
    return { ...(deadline !== undefined ? { timeoutMs: TH_CALL_MAX_MS } : {}), prices, ...(o.fetchImpl ? { fetchImpl: o.fetchImpl } : {}) };
  };

  /**
   * Lit le solde TikHub (gratuit). Un échec, un 429 : la valeur connue reste. Le solde est daté de l'ENVOI de la
   * demande, et la dépense du passage « avant lecture » prise à ce moment : un appel qui finit pendant la lecture
   * (relevés en parallèle) compte comme dépensé après elle, et un lot écrit par un autre passage pendant ce temps reste
   * compté (radarSignalsMath.nextSpentLots) — le solde estimé reste une borne basse (20/11/2026).
   */
  const readBalance = async (): Promise<void> => {
    if (!on || clock() - lastRead < TH_BALANCE_SPACING_MS) return;
    const sent = clock();
    const usdAtSend = o.book.thSpentUsd();
    lastRead = sent;
    const r = await thBalance({ timeoutMs: TH_FREE_CALL_MS, ...(o.fetchImpl ? { fetchImpl: o.fetchImpl } : {}) });
    if (r.ok) o.book.seenTh(r.value.paidUsd, r.value.freeUsd, sent, usdAtSend);
  };

  /**
   * Un échec TikHub : le coupe-circuit (clé refusée, solde à sec : tout de suite ; sinon au 3e d'affilée). Un refus 4xx
   * (`bad`) compte comme les autres (corrigé le 20/11/2026) : chez TikHub, il dit que la requête ou la route est refusée,
   * jamais que le compte ou la vidéo pose problème — un compte inexistant y répond 200 « No more videos »
   * (bench/raw/th-compte-inexistant-200.json). Ne pas le compter laissait une route retirée par TikHub (404 sur chaque
   * appel) mettre en pause tous les comptes relevés et sortir de la courbe toutes les vidéos dues.
   */
  const failed = (kind: ThKind, error: string): void => {
    o.book.thError = error;
    if (kind === "key" || kind === "dry") {
      down = error;
      return;
    }
    streak++;
    if (streak >= BREAKER_FAILS) down = `${BREAKER_FAILS} échecs TikHub d'affilée : ${error}`;
  };

  /**
   * LA PORTE DE REPLI (cf `route`). Le quota du jour se juge d'abord sur ce que le passage sait (les replis du jour à
   * son ouverture, plus les siens), puis se PREND dans la base (`claimFallback`) : les passages qui tournent en même
   * temps se le partagent. Une place refusée, ou une prise qui échoue, ferme la porte pour le reste du passage.
   */
  const fallbackOk = async (firstPage: boolean, scBudget: () => boolean): Promise<boolean> => {
    const bs = state();
    const open =
      scKeyPresent() &&
      bs.balanceLeft !== null &&
      bs.tier === "normal" &&
      !quotaFull &&
      o.st.fallbacksToday + fallbacks < FALLBACK_SC_PER_DAY &&
      firstPage &&
      (deadline === undefined || deadline - clock() >= FALLBACK_MIN_LEFT_MS) &&
      scBudget();
    if (!open) return false;
    const claimed = await o.claimFallback().catch(() => false);
    if (!claimed) quotaFull = true;
    return claimed;
  };

  /**
   * Un appel TikHub, redemandé une fois sur 429 ou 5xx. `r: null` : l'échéance n'a pas laissé partir l'appel, ou sa
   * nouvelle demande, avec son délai entier — rien n'est conclu (ni échec compté au coupe-circuit, ni `thFailed`) : un
   * 429 ou un 5xx ne dit quelque chose qu'après sa nouvelle demande (20/11/2026).
   */
  const callTh = async <T>(call: (opts: ThOpts) => Promise<ThResult<T>>, route: string): Promise<{ r: ThResult<T> | null; spend: Spend }> => {
    const spend = { ...NO_SPEND };
    for (let attempt = 0; attempt < 2; attempt++) {
      const opts = thOpts();
      if (!opts) return { r: null, spend };
      const r = await call(opts);
      spend.th += r.spend.th;
      spend.usd += r.spend.usd;
      spend.unknown += r.spend.unknown;
      if (r.ok) {
        streak = 0;
        return { r, spend };
      }
      if (attempt === 0 && (r.kind === "rate" || r.kind === "down")) {
        if (!fits(RETRY_PAUSE_MS)) return { r: null, spend };
        await sleep(RETRY_PAUSE_MS);
        continue;
      }
      failed(r.kind, r.error);
      if (r.kind === "dry") {
        // Un 402 ne dit pas le solde (il peut rester du crédit gratuit, refusé par cette route) : on le relit.
        o.book.thDryRoute = route;
        await readBalance();
      }
      return { r, spend };
    }
    return { r: null, spend };
  };

  const fromSc = async <T>(sc: () => Promise<ScCall<T>>, spend: Spend, fallback: boolean): Promise<Routed<T>> => {
    const r = await sc();
    const s: Spend = { ...spend, sc: spend.sc + r.credits, fallback: fallback ? 1 : 0 };
    const left = r.creditsRemaining !== undefined ? { creditsRemaining: r.creditsRemaining } : {};
    return r.ok
      ? { ok: true, value: r.value, spend: s, served: "sc", ...left }
      : { ok: false, error: r.error, spend: s, served: "sc", noCredits: r.noCredits, transient: false, thFailed: false, ...left };
  };

  /**
   * Ce que devient un appel que TikHub n'a pas servi (`kind` : pourquoi ; `null` : TikHub n'a rien rendu — pas appelé,
   * ou coupé par l'échéance) : LA PORTE DE REPLI (cf `route`), la dépense TikHub comprise ; sinon un échec passager —
   * sauf un refus de TikTok (`upstream`, facturé), qui reste un échec : sinon ce qui a été refusé serait repayé à chaque
   * passage. Un refus 4xx (`bad`) suit le sort des autres échecs de TikHub (cf `failed`).
   */
  const settle = async <T>(spend: Spend, error: string, kind: ThKind | null, sc: () => Promise<ScCall<T>>, opts: { firstPage: boolean; scBudget: () => boolean }): Promise<Routed<T>> => {
    if (await fallbackOk(opts.firstPage, opts.scBudget)) {
      fallbacks++;
      return fromSc(sc, spend, true);
    }
    return { ok: false, error, spend, served: "tikhub", noCredits: false, transient: kind !== "upstream", thFailed: kind !== null && kind !== "key" && kind !== "dry" };
  };

  return {
    /** TikHub sert-il des appels de cette tâche ? */
    on,
    /** Un appel ScrapeCreators, à l'identique d'avant la bascule, rendu dans la forme aiguillée. */
    sc: <T>(sc: () => Promise<ScCall<T>>): Promise<Routed<T>> => fromSc(sc, NO_SPEND, false),
    /** Le budget du passage (après `open`, avec le solde TikHub lu). */
    budget: state,
    /**
     * En tête de passage, AVANT le budget : les tarifs s'ils ont plus d'un jour, le solde TikHub s'il a plus d'une
     * minute (gratuits). Sans bascule pour la tâche : rien n'est lu, le budget est le budget commun (`jobBudget`).
     */
    open: async (): Promise<BudgetState> => {
      if (on) {
        const now = clock();
        if (o.st.thPricesAt === null || now - o.st.thPricesAt >= TH_PRICES_EVERY_MS) {
          const p = await thPrices({ timeoutMs: TH_FREE_CALL_MS, ...(o.fetchImpl ? { fetchImpl: o.fetchImpl } : {}) });
          if (p.ok && Object.keys(p.value).length) {
            prices = p.value;
            o.book.thPrices = Object.entries(p.value).map(([route, x]) => ({ route, usd: x.usd, free: x.free }));
          }
        }
        if (!o.st.th || now - o.st.th.seenAt >= TH_BALANCE_STALE_MS) await readBalance();
      }
      budget = jobBudget(o.st, o.jobs, o.book, clock());
      return budget;
    },
    /** En fin de passage : le solde relu s'il est parti au moins un appel TikHub. */
    close: async (): Promise<void> => {
      if (on && o.book.thCalls + o.book.thUnknown > 0) await readBalance();
    },
    /**
     * L'échéance est (presque) passée : plus aucun appel TikHub ne peut partir (il lui faudrait son délai entier, fini
     * 30 s avant elle : cf TH_CALL_MAX_MS). Jamais sans bascule.
     */
    expired: (): boolean => !fits(),
    /** TikHub en panne pour ce passage : pourquoi (`null` : il sert). */
    down: (): string | null => down,
    /**
     * Combien d'appels pourraient encore repasser par ScrapeCreators (porte de repli, hors page et budget du poste) :
     * de quoi borner un passage dont TikHub est à sec dès le départ, sans le reporter en bloc sur ScrapeCreators.
     */
    fallbackRoom: (): number => {
      const bs = state();
      return on && !quotaFull && scKeyPresent() && bs.balanceLeft !== null && bs.tier === "normal" ? Math.max(0, FALLBACK_SC_PER_DAY - o.st.fallbacksToday - fallbacks) : 0;
    },
    /**
     * Un appel aiguillé. `provider` : le fournisseur réglé (« sc » : ScrapeCreators, à l'identique d'avant). Chez TikHub,
     * un échec repasse par ScrapeCreators si LA PORTE DE REPLI le permet : clé ScrapeCreators, son solde connu et son
     * palier « normal » (aucun repli en économie, survie ou réserve), le quota du jour (`FALLBACK_SC_PER_DAY`), une PREMIÈRE page (une pagination ne se poursuit pas
     * chez l'autre), 90 s avant l'échéance, et le budget du poste chez ScrapeCreators (`scBudget`, vu par l'appelant).
     * Sinon, un échec passager — sauf un refus de TikTok (`upstream`), qui reste un échec du compte : sinon un compte
     * refusé serait repayé à chaque passage.
     */
    route: async <T>(
      provider: Provider,
      th: (opts: ThOpts) => Promise<ThResult<T>>,
      sc: () => Promise<ScCall<T>>,
      opts: { route: string; firstPage: boolean; scBudget: () => boolean; thBudget?: () => boolean },
    ): Promise<Routed<T>> => {
      if (provider === "sc" || !on) return fromSc(sc, NO_SPEND, false);
      const budgetLeft = opts.thBudget ? opts.thBudget() : true;
      if (down || !budgetLeft) return settle({ ...NO_SPEND }, down ?? "TikHub : budget du passage épuisé", null, sc, opts);
      const t = await callTh(th, opts.route);
      if (t.r?.ok) return { ok: true, value: t.r.value, spend: t.spend, served: "tikhub" };
      return settle(t.spend, t.r ? t.r.error : TIME_UP, t.r ? t.r.kind : null, sc, opts);
    },
    /**
     * Un appel destiné à TikHub qu'il ne peut pas servir (un hashtag sans identifiant chez lui) : chez ScrapeCreators
     * si la porte de repli le permet, compté comme un repli ; sinon `null`, rien n'est parti.
     */
    fallback: async <T>(sc: () => Promise<ScCall<T>>, opts: { firstPage: boolean; scBudget: () => boolean }): Promise<Routed<T> | null> => {
      if (!on || !(await fallbackOk(opts.firstPage, opts.scBudget))) return null;
      fallbacks++;
      return fromSc(sc, NO_SPEND, true);
    },
    /** Une lecture TikHub sans équivalent chez ScrapeCreators (l'identifiant d'un hashtag) : même délai, même coupe-circuit. */
    thOnly: async <T>(th: (opts: ThOpts) => Promise<ThResult<T>>, route: string): Promise<{ r: ThResult<T> | null; spend: Spend }> =>
      down ? { r: null, spend: { ...NO_SPEND } } : callTh(th, route),
    /**
     * Une lecture `thOnly` qui n'a pas abouti (l'identifiant d'un hashtag, lu avant la première page de sa passe) : cette
     * page suit le sort d'un appel `route` que TikHub n'a pas servi — chez ScrapeCreators si la porte de repli le
     * permet, la dépense de la lecture comprise ; sinon le même échec, passager ou non (un refus de TikTok ne l'est pas).
     * Corrigé le 20/11/2026 : ce chemin comptait un refus de TikTok comme une panne passagère (l'app restait due, repayée
     * à chaque passage) et ne tentait jamais le repli.
     */
    rescue: <T>(t: { r: ThResult<unknown> | null; spend: Spend }, sc: () => Promise<ScCall<T>>, opts: { firstPage: boolean; scBudget: () => boolean }): Promise<Routed<T>> => {
      const failed = t.r && !t.r.ok ? t.r : null;
      return settle(t.spend, failed?.error ?? down ?? TIME_UP, failed?.kind ?? null, sc, opts);
    },
  };
}
export type Router = ReturnType<typeof makeRouter>;

/** La prise du quota de replis d'un passage (RouterOpts.claimFallback) : dans la base, à l'heure de la prise. */
export const fallbackClaimer =
  (ctx: Pick<ActionCtx, "runMutation">) =>
  async (): Promise<boolean> =>
    (await ctx.runMutation(internal.radar.radarSignals.claimFallback, { now: Date.now() })) === true;

/** Le passage écrit sa dépense par tranches de ce nombre d'unités. */
export const USAGE_FLUSH_UNITS = 50;

/**
 * La dépense d'un passage, écrite au fil de l'eau dans radarUsage (et les soldes lus avec elle). Une tranche n'est
 * comptée écrite qu'une fois l'écriture faite : une écriture refusée repart avec la suivante. Les écritures se suivent
 * (jamais deux en même temps). Le 13/11/2026, des passages qui ont levé en route ont fait disparaître ~2 100 à 2 900
 * crédits de radarUsage : le solde baissait, les comptes ne le voyaient pas. Déplacé de radarNetworks le 20/11/2026
 * pour compter aussi TikHub : `pending` en unités.
 */
export function usageWriter(ctx: ActionCtx, poste: string, now: number, book: PassBook = new PassBook()) {
  const written = { credits: 0, calls: 0, errors: 0, ...NOTHING_WRITTEN };
  const reasonsWritten: Record<string, number> = {};
  const savedWritten: Record<string, number> = {};
  const measuredWritten: Record<string, number> = {};
  const unwritten = (all: Record<string, number>, done: Record<string, number>): Record<string, number> => {
    const out: Record<string, number> = {};
    for (const [k, c] of Object.entries(all)) if (c - (done[k] ?? 0) > 0) out[k] = c - (done[k] ?? 0);
    return out;
  };
  let balance: { remaining: number; at: number } | undefined;
  let thBalanceWritten: PassBook["thBalance"];
  let thNoteWritten = { dry: undefined as string | undefined, error: undefined as string | undefined, prices: undefined as unknown };
  let chain: Promise<void> = Promise.resolve();
  const write = async (error?: string) => {
    const d = { credits: book.credits - written.credits, calls: book.calls - written.calls, errors: book.errors - written.errors };
    const r = unwritten(book.reasons, reasonsWritten);
    const sv = unwritten(book.saved, savedWritten);
    const ms = unwritten(book.measured, measuredWritten);
    const newBalance = book.thBalance !== thBalanceWritten;
    const thAll = book.thArgs(written, newBalance);
    // Ce qui est déjà écrit ne repart pas : le refus 402, la dernière erreur et les tarifs, seulement s'ils ont changé.
    const th: Record<string, unknown> = { ...thAll };
    if (thAll.thDryRoute === thNoteWritten.dry) delete th.thDryRoute;
    if (thAll.thLastError === thNoteWritten.error) delete th.thLastError;
    if (thAll.thPrices === thNoteWritten.prices) delete th.thPrices;
    if (d.credits <= 0 && d.calls <= 0 && d.errors <= 0 && !error && !balance && Object.keys(th).length === 0 && !Object.keys(sv).length && !Object.keys(ms).length) return;
    const b = balance;
    await ctx.runMutation(internal.radar.radarSignals.recordRun, {
      poste,
      ...d,
      now,
      ...(Object.keys(r).length ? { reasons: r } : {}),
      ...(Object.keys(sv).length ? { saved: sv } : {}),
      ...(Object.keys(ms).length ? { measured: ms } : {}),
      ...(b ? { creditsRemaining: b.remaining, creditsSeenAt: b.at } : {}),
      ...(error ? { lastError: error } : {}),
      ...th,
    });
    written.credits += d.credits;
    written.calls += d.calls;
    written.errors += d.errors;
    written.thCalls += (thAll.thCalls as number | undefined) ?? 0;
    written.thUsd += (thAll.thUsd as number | undefined) ?? 0;
    written.thUnknown += (thAll.thUnknown as number | undefined) ?? 0;
    written.thFallbacks += (thAll.thFallbacks as number | undefined) ?? 0;
    for (const [k, c] of Object.entries(r)) reasonsWritten[k] = (reasonsWritten[k] ?? 0) + c;
    for (const [k, c] of Object.entries(sv)) savedWritten[k] = (savedWritten[k] ?? 0) + c;
    for (const [k, c] of Object.entries(ms)) measuredWritten[k] = (measuredWritten[k] ?? 0) + c;
    if (balance === b) balance = undefined;
    if (newBalance) thBalanceWritten = book.thBalance;
    thNoteWritten = { dry: thAll.thDryRoute, error: thAll.thLastError, prices: thAll.thPrices };
  };
  return {
    book,
    /** Le solde ScrapeCreators que l'API vient de donner (plus récent que les précédents). */
    seen: (remaining: number | undefined) => {
      if (remaining !== undefined) balance = { remaining, at: Date.now() };
    },
    /** Écrit ce qui ne l'est pas encore (à la suite des écritures en cours). */
    flush: (error?: string): Promise<void> => {
      const next = chain.then(() => write(error));
      // Une écriture refusée ne bloque pas les suivantes : elles la reprennent (rien n'est compté écrit).
      chain = next.catch(() => undefined);
      return next;
    },
    /** Unités dépensées et pas encore écrites. */
    pending: () => book.units() - (written.credits + written.thCalls + written.thUnknown),
  };
}

/**
 * LA PORTE DE BUDGET D'UN PASSAGE (radarSignalsMath.allowanceParts) : les unités du poste se partagent entre les deux
 * fournisseurs ; un appel chez `p` ne part que si le poste est ouvert chez `p`, que son solde chez `p` le permet, et
 * que le reste du plafond paie au prix de `p` (ce qui a été dépensé chez l'autre fournisseur compris). Pour un passage
 * servi par ScrapeCreators seul, `take("sc")` équivaut exactement à « dépensé < allowance(…) » d'avant la bascule.
 */
export function passGate(parts: AllowanceParts) {
  const spent = { units: 0, sc: 0, th: 0, usd: { sc: 0, tikhub: 0 } as Record<Provider, number> };
  const usedAt = (p: Provider) => (p === "sc" ? spent.sc : spent.th);
  const other = (p: Provider): Provider => (p === "sc" ? "tikhub" : "sc");
  const capAt = (p: Provider) => capUnits(parts.capUsd - spent.usd[other(p)], p);
  return {
    parts,
    /** Ce que le passage peut dépenser chez `p` au plus (0 si le poste y est fermé), en unités. */
    limit: (p: Provider): number => (parts.open[p] ? Math.min(parts.units, capUnits(parts.capUsd, p), parts.balance[p]) : 0),
    /** Un appel de plus chez `p` tient-il dans le budget du passage ? */
    take: (p: Provider): boolean => spent.units < parts.units && parts.open[p] && usedAt(p) < parts.balance[p] && usedAt(p) < capAt(p),
    /** Compte une dépense (les deux fournisseurs). */
    spend: (s: Spend): void => {
      spent.units += spendUnits(s);
      spent.sc += s.sc;
      spent.th += s.th + s.unknown;
      spent.usd.sc += s.sc * priceOf("sc");
      spent.usd.tikhub += s.usd + s.unknown * TH_PRICE_USD;
    },
    /** Unités dépensées par ce passage. */
    units: (): number => spent.units,
  };
}
export type PassGate = ReturnType<typeof passGate>;

/**
 * Un appel de plus peut-il partir dans un passage basculé : chez TikHub s'il reste de son budget, sinon par la porte
 * de repli (une première page, le quota du jour, le budget ScrapeCreators). Un budget épuisé n'est pas une panne :
 * l'appelant s'arrête là, sans compter d'erreur ni rien conclure sur ce qui reste dû.
 */
export function canCall(gate: PassGate, provider: Provider, router: Router, firstPage = true): boolean {
  if (provider === "sc" || !router.on) return gate.take("sc");
  return gate.take("tikhub") || (firstPage && router.fallbackRoom() > 0 && gate.take("sc"));
}

/**
 * Combien d'appels un passage peut faire au plus : chez ScrapeCreators, sa part d'avant la bascule ; chez TikHub, sa
 * part chez TikHub — et, s'il est à sec ou fermé, de quoi passer par la porte de repli (bornée par le quota du jour).
 */
export function passLimit(gate: PassGate, provider: Provider, router: Router): number {
  if (provider === "sc" || !router.on) return gate.limit("sc");
  return Math.max(gate.limit("tikhub"), Math.min(gate.limit("sc"), router.fallbackRoom()));
}

/**
 * LA RÉSERVE D'UN POSTE, CHEZ LE FOURNISSEUR QUI LE SERT (fusion des briques 7 et 8 des relevés, radarFreeMath.missPlan,
 * 20/11/2026). La brique 8 fait attendre la sonde aux ratés quand aucun relevé payant ne peut partir faute de solde :
 *  - ScrapeCreators (sans bascule, ou poste réglé chez lui) : son solde sous CREDIT_RESERVE (`reserveReached`), comme
 *    avant — au bit près ;
 *  - TikHub : son solde payé à sec (palier « reserve », radarSignalsMath.BudgetState.th) ET aucun relevé ne peut passer
 *    par la porte de repli (quota du jour, palier ou réserve de ScrapeCreators, budget du poste chez lui).
 * La réserve de ScrapeCreators ne retient JAMAIS un poste que TikHub sert : ses relevés partent chez TikHub, et un raté
 * relu au passage suivant y sera payé — l'attente de la sonde n'éviterait rien, elle retarderait. Sous la réserve de
 * TikHub, l'attente reste RESERVE_MISS_WAIT_MS (50 min) : son solde est relu gratuitement en tête de chaque passage
 * basculé, un pack se voit dans les 10 minutes, et le raté repoussé revient au plus 50 minutes après — la borne de
 * ScrapeCreators (radarFreeMath.reserveMisses). La brique 7 lit de même la part du passage chez ce fournisseur
 * (`n` = passLimit, radarNetworks.accountReadsPass) et son palier (`waitFirst`).
 */
export function reserveFor(
  b: Pick<BudgetState, "reserveReached" | "th">,
  provider: Provider,
  router: Pick<Router, "on" | "fallbackRoom">,
  gate: Pick<PassGate, "limit">,
): boolean {
  if (provider === "sc" || !router.on) return b.reserveReached;
  return b.th.tier === "reserve" && Math.min(gate.limit("sc"), router.fallbackRoom()) === 0;
}
