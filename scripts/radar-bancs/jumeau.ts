/**
 * JUMEAU — le passage de relevé des comptes (radarNetworks.accountReadsPass), rejoué HORS LIGNE sur l'instantané de prod.
 * Sert aux bancs des briques 7 (repli.ts) et 8 (reserve.ts). AUCUNE requête : ni TikTok, ni fournisseur (fetch lève).
 *
 * Ce qui est le code livré (importé, pas copié) : freeRead, runFreeLane, laneQueue, splitMisses, missPlan (holdMisses,
 * reserveMisses, heldFirstNotReached, firstReadMisses), firstReadMisses, overflowToPay, missReason, freeReadSaved,
 * paidRead, gapMeasure, retrying, paced (radarFreeMath) ; nextReadAtFor (radarNetworkMath) ; normalizeBudget,
 * budgetState, allowance, tierDefers, needsBalanceProbe, recentPerDay (radarSignalsMath) ; storePauseMs (radarStoreMath).
 * Ce qui est recopié de radarNetworks.accountReadsPass (une action Convex, pas importable) : l'enchaînement — la part `n`,
 * dueAccounts (index by_due, `limit + DUE_SLACK`, apps en pause repoussées d'un jour), la voie, les ratés, le payant
 * borné par `limit` et par PASS_MAX_MS, le débordement, la sonde —, et ce que les mutations écrivent (applyAccountRead :
 * readAt, nextReadAt, freeMissAt effacé ; readError ; holdFreeMisses ; deferAccounts ; markGapChecked).
 * `avant7` rejoue l'enchaînement d'avant la brique 7 (25fbb0b^ : premiers relevés par firstReadMisses, tout raté au
 * payant dans le passage), la gestion du trou restant celle d'aujourd'hui (mesure, gapPage) : seule la brique 7 change.
 * `brique7` : missPlan sans la brique 8 (reserveReached forcé à faux). `livre` : missPlan tel qu'il part.
 * `retenue-voie-libre` : une PROPOSITION, pas le code livré — la brique 7 seulement quand la voie a atteint tous les
 * comptes suivis dus du passage (aucun débordement), sinon l'enchaînement d'avant (cf repli.ts, file saturée).
 *
 * Le monde (tout vient de l'instantané Jarvia du 20/11/2026 17:14 UTC ; aucun passage après celui de 14:09:55) :
 *  - comptes actifs de radarTracked (nextReadAt, readAt, lastPostAt, pays, gapChecked) ; vidéos de radarTrackedVideos
 *    (40 plus récentes par compte : la base « connue » ; en ligne sauf la vidéo gapChecked) ;
 *  - publications : celles du même compte 7 jours plus tôt, rejouées (même heure, vidéo neuve) ;
 *  - suppressions : entre deux relevés réussis, un compte a supprimé sa vidéo la plus récente connue avec la
 *    probabilité `gapRate` (tirée sur le compte et son dernier relevé, donc la même avec ou sans la brique tant que ce
 *    relevé est le même ; un report n'en tire pas une autre) : son relevé gratuit tombe sur un trou (listGap). Calée sur
 *    la prod (cf repli.ts) ;
 *  - page d'intégration : les 12 dernières vidéos en ligne (10 à 13 mesurées) ; page vidéo : servie (pays de la vidéo,
 *    sinon US), 10204 « n'existe pas » si supprimée ; payant : 9 vidéos par page, toujours servi (1 crédit la page) ;
 *  - temps : pause storePauseMs avant chaque page + `latencyMs` (1 330 ms : le passage de 14:09:55 a lu 99 comptes, soit
 *    229 pages, en 7 minutes) ; second essai FREE_RETRY_MS plus tard ; un appel payant PAID_CALL_MS (8 de front).
 * Les échecs injectés (tirages déterministes par compte et par passage : avec ou sans la brique, le même compte au même
 * passage tire le même sort) : profil refusé au premier essai (`r1`, 13/11 : 80 sur 2 210) puis au second (`q / r1` :
 * `q` est le taux APRÈS retrying, 13/11 : 2 sur 2 210) ; page illisible d'une vidéo (`qDetail` par page) ; un compte qui a
 * échoué il y a FREE_MISS_KEEP_MS au plus rate de nouveau avec la probabilité 1 − `p2` (même raison, même vidéo) ;
 * fenêtres de rafale (`rafale`) où TikTok refuse toutes les pages.
 * Ce que le jumeau ne rend pas : les profils absents, privés ou vides (NOTHING_TO_READ, hors des briques) ; les refus du
 * fournisseur (le payant réussit toujours) ; les autres postes (la dépense simulée n'est que celle du poste tiktok) ; ce
 * que TikTok sert aux serveurs Convex (une mesure du poste ne le dit pas, un jumeau encore moins).
 */
import { createReadStream, readFileSync } from "node:fs";
import { join } from "node:path";
import { createInterface } from "node:readline";
import { dayKeyParis, monthKeyParis } from "../../convex/radar/dateFr";
import {
  FREE_LANE_MAX_MS,
  FREE_MISS_KEEP_MS,
  FREE_READS_PER_RUN,
  FREE_RETRY_MS,
  PASS_EVERY_MS,
  PASS_MAX_MS,
  RESERVE_MISS_WAIT_MS,
  firstReadMisses,
  freeRead,
  freeReadSaved,
  gapMeasure,
  laneQueue,
  missPlan,
  missReason,
  overflowToPay,
  paced,
  paidRead,
  retrying,
  runFreeLane,
  splitMisses,
  type FreePage,
  type FreeWhy,
  type GapSeen,
  type KnownVideo,
  type LaneMiss,
  type NewestKnown,
  type PaidPage,
  type PaidReason,
} from "../../convex/radar/radarFreeMath";
import { FRESH_VIDEO_MS, MAX_READ_ERRORS, MEDIAN_WINDOW, SECOND_LOOK_MS, nextReadAtFor } from "../../convex/radar/radarNetworkMath";
import { allowance, budgetState, needsBalanceProbe, normalizeBudget, recentPerDay, tierDefers, type SignalInput, type UsageRow } from "../../convex/radar/radarSignalsMath";
import { storePauseMs } from "../../convex/radar/radarStoreMath";

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
/** radarNetworks, non exportés : passages comptés dans la part du jour, comptes lus en plus, attentes. */
const ACCOUNT_RUNS_PER_DAY = 24;
const DUE_SLACK = 200;
const FIRST_READ_WAIT_MS = 60 * MIN;
const PARKED_RECHECK_MS = DAY;
/** La liste d'intégration d'un profil (10 à 13 vidéos mesurées le 13/11) ; une page du relevé payant (9 vidéos). */
const EMBED_LIST = 12;
const PAID_PAGE = 9;
/** Un appel payant vu de la file : ~4 s, 8 de front (ACCOUNT_READ_POOL). */
const PAID_CALL_MS = 500;

// Aucune requête, jamais : le jumeau ne lit que l'instantané.
globalThis.fetch = (() => {
  throw new Error("jumeau sans réseau : aucune requête");
}) as typeof fetch;

// ─── Tirages déterministes ─────────────────────────────────────────────────────

/** Un nombre de [0, 1) tiré de ses clés (FNV-1a puis mélange) : le même compte au même passage tire le même sort. */
export function draw(...keys: (string | number)[]): number {
  let h = 2166136261;
  for (const c of keys.join("|")) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0;
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b) >>> 0;
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35) >>> 0;
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

// ─── L'instantané ──────────────────────────────────────────────────────────────

type V = { id: string; at: number; region?: string };
type BaseAcc = {
  id: string;
  handle: string;
  appActive: boolean;
  nextReadAt: number;
  readAt?: number;
  lastPostAt?: number;
  located: boolean;
  gapChecked?: string;
  readErrors: number;
  /** Les vidéos rangées (radarTrackedVideos, hors Instagram), les plus récentes d'abord, 40 au plus. */
  vids: V[];
  /** Les heures de publication rejouées (celles d'il y a 7 jours, + 7 jours), dans l'ordre. */
  replay: number[];
};
export type Base = {
  T0: number;
  accounts: BaseAcc[];
  settings: Record<string, unknown>;
  usage: (UsageRow & { month?: string })[];
  balance: { remaining: number; seenAt: number };
  lastPass: { at: number; ok: number; fallback: number; waiting: number };
};

const jsonl = <T>(file: string): T[] =>
  readFileSync(file, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((l) => JSON.parse(l) as T);

/** Lit l'instantané (quelques dizaines de secondes : radarTrackedVideos fait 187 Mo). `replayHours` : la fenêtre à rejouer. */
export async function loadBase(dir: string, replayHours: number): Promise<Base> {
  const [settings] = jsonl<Record<string, unknown>>(join(dir, "radarSettings.jsonl"));
  const lastAccountsAt = Number(settings.lastAccountsAt);
  // Le passage suivant celui de 14:09:55 : rien n'a été relevé ensuite (radar arrêté chez Jarvia), l'état est le sien.
  const T0 = lastAccountsAt + PASS_EVERY_MS;
  const apps = new Map(jsonl<{ _id: string; status: string }>(join(dir, "radarApps.jsonl")).map((a) => [a._id, a.status]));
  type Row = { _id: string; handle: string; appId: string; status: string; nextReadAt: number; readAt?: number; lastPostAt?: number; country?: string; gapChecked?: string; readErrors: number };
  const rows = jsonl<Row>(join(dir, "radarTracked.jsonl")).filter((r) => r.status === "active");
  const byId = new Map<string, BaseAcc>();
  for (const r of rows) {
    byId.set(r._id, {
      id: r._id,
      handle: r.handle,
      appActive: apps.get(r.appId) === "active",
      nextReadAt: r.nextReadAt,
      ...(r.readAt !== undefined ? { readAt: r.readAt } : {}),
      ...(r.lastPostAt !== undefined ? { lastPostAt: r.lastPostAt } : {}),
      located: r.country !== undefined,
      ...(r.gapChecked ? { gapChecked: r.gapChecked } : {}),
      readErrors: r.readErrors,
      vids: [],
      replay: [],
    });
  }
  const from = T0 - 7 * DAY;
  const to = from + replayHours * HOUR;
  const rl = createInterface({ input: createReadStream(join(dir, "radarTrackedVideos.jsonl")) });
  for await (const line of rl) {
    if (!line) continue;
    const v = JSON.parse(line) as { accountId: string; videoId: string; publishedAt: number; region?: string; platform?: string };
    const a = byId.get(v.accountId);
    if (!a || v.platform) continue;
    a.vids.push({ id: v.videoId, at: v.publishedAt, ...(v.region ? { region: v.region } : {}) });
    if (v.publishedAt >= from && v.publishedAt < to) a.replay.push(v.publishedAt + 7 * DAY);
  }
  for (const a of byId.values()) {
    a.vids.sort((x, y) => y.at - x.at);
    a.vids = a.vids.slice(0, 40);
    a.replay.sort((x, y) => x - y);
  }
  return {
    T0,
    accounts: [...byId.values()],
    settings,
    usage: jsonl<UsageRow & { month?: string }>(join(dir, "radarUsage.jsonl")).map((u) => ({ poste: u.poste, credits: u.credits, day: u.day, month: u.month })),
    balance: { remaining: Number(settings.creditsRemaining), seenAt: Number(settings.creditsSeenAt) },
    lastPass: { at: Number(settings.lastFreeAt), ok: Number(settings.lastFreeOk), fallback: Number(settings.lastFreeFallback), waiting: Number(settings.lastFreeWaiting) },
  };
}

// ─── Le monde d'un rejeu ───────────────────────────────────────────────────────

export type Variant = "avant7" | "brique7" | "livre" | "retenue-voie-libre";
export type Params = {
  variant: Variant;
  hours: number;
  /** Profil refusé APRÈS le second essai de retrying (par relevé) ; `r1` : refusé au premier essai. */
  q: number;
  r1: number;
  /** Page de vidéo illisible (par page). */
  qDetail: number;
  /** Relu au passage suivant : la part des ratés que TikTok sert de nouveau (78/80 au second essai le 13/11). */
  p2: number;
  /** Part des relevés où la vidéo la plus récente connue du compte a été supprimée depuis le relevé d'avant. */
  gapRate: number;
  latencyMs: number;
  /** Premiers relevés injectés (comptes neufs, vidéos d'un compte réel tiré au sort, rien de connu). */
  firstBurst?: { at: number; count: number };
  /** Fenêtres où TikTok refuse toutes les pages (heures relatives à T0, en ms). */
  rafale?: { from: number; to: number }[];
  /** Le solde lu au départ (crédits, il y a `seenAgoMs`), et un pack acheté (`pack.at` relatif à T0). */
  balance: { remaining: number; seenAgoMs: number };
  pack?: { at: number; credits: number };
  seed: string;
};

type Acc = {
  b: BaseAcc;
  id: string;
  handle: string;
  appActive: boolean;
  status: "active" | "paused";
  nextReadAt: number;
  readAt?: number;
  lastPostAt?: number;
  located: boolean;
  gapChecked?: string;
  readErrors: number;
  freeMissAt?: number;
  first: boolean;
  known: Map<string, V>;
  online: V[];
  pending: V[];
  /** Le relevé (readAt) après lequel la suppression a déjà été tirée. */
  delCycle?: number;
  deleted: Set<string>;
  lastFail?: { at: number; kind: "suspect" | "detail"; video?: string };
  /** Second regard : le relevé est attendu avant cette heure (publication + 24 h). */
  deadline?: number;
  enteredAt?: number;
};
/** Ce que dueAccounts rend d'un compte dû (les champs lus à la requête), et le compte lui-même. */
type Due = { acc: Acc; id: string; handle: string; located: boolean; first: boolean; dueAt: number; lastPostAt?: number; freeMissAt?: number };

/** Un raté gratuit (profil refusé, page illisible) et ce qu'il est devenu. */
export type MissEvent = { key: string; account: string; at: number; why: FreeWhy; first: boolean; resolvedAt?: number; how?: string; held: boolean };

export type Report = {
  variant: Variant;
  passes: number;
  budget: { n0: number; tier0: string; reserve0: boolean; nByPass: number[] };
  freeOk: number;
  freeFails: Partial<Record<FreeWhy, number>>;
  pages: number;
  pagesFailed: number;
  pagesByWhy: Partial<Record<FreeWhy, number>>;
  credits: Partial<Record<PaidReason, number>>;
  paidCalls: number;
  saved: Record<string, number>;
  measured: Record<string, number>;
  held: number;
  heldFirst: number;
  heldTwice: number;
  reserveDefer: number;
  firstDefer: number;
  probes: { at: number; handle: string; gap: boolean }[];
  probeDue: number;
  breakerPasses: number;
  notReached: number;
  waits: number[];
  /** L'attente des comptes déjà suivis seulement (hors premiers relevés). */
  waitsTracked: number[];
  waitingAtEnd: { count: number; maxMs: number; over1h: number; over3h: number };
  secondLook: { due: number; onTime: number; late: number; lateMs: number[]; stillWaiting: number };
  first: { injected: number; readFree: number; readPaid: number; waitMs: number[]; unread: number };
  events: MissEvent[];
  readsByPass: number[];
  /** Par passage : comptes dus, pages lues, pages des relevés ratés (rien de rangé), comptes repoussés (brique 8). */
  dueByPass: number[];
  pagesByPass: number[];
  pagesFailedByPass: number[];
  reserveDeferByPass: number[];
  gapReads: number;
  /** Comptes relus gratuitement pour rien : trou sous la réserve, raté qui ne pouvait être payé (n = 0). */
  gapAccountsDueByPass: number[];
};

const pct = (xs: readonly number[], p: number): number => {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor((p / 100) * s.length))];
};
export const stats = (xs: readonly number[]) => ({ n: xs.length, p50: pct(xs, 50), p90: pct(xs, 90), p99: pct(xs, 99), max: xs.length ? Math.max(...xs) : 0 });

const vidId = (at: number, salt: string): string => ((BigInt(Math.floor(at / 1000)) << 32n) + BigInt(Math.floor(draw("id", salt) * 4_000_000_000))).toString();

function profileHtml(list: readonly V[]): string {
  const userInfo = { followerCount: 1000, signature: "", privateAccount: false };
  const videoList = list.map((v) => ({ id: v.id, desc: "", playCount: 1000 }));
  return `<html><script>window.__data=${JSON.stringify({ userInfo, videoList })}</script></html>`;
}
const UNREADABLE = "<html><body>page sans données</body></html>";
const GONE_PAGE = `<html><script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application/json">${JSON.stringify({ __DEFAULT_SCOPE__: { "webapp.video-detail": { statusCode: 10204, statusMsg: "item doesn't exist" } } })}</script></html>`;
function videoHtml(a: Acc, v: V): string {
  const item = {
    id: v.id,
    desc: "",
    createTime: String(Math.floor(v.at / 1000)),
    author: { id: `u${a.id}`, uniqueId: a.handle, signature: "" },
    authorStats: { followerCount: 1000 },
    stats: { playCount: 1000, diggCount: 10, commentCount: 1, shareCount: 1, collectCount: 1 },
    video: { duration: 15 },
    music: {},
    locationCreated: v.region ?? "US",
    textLanguage: "en",
  };
  return `<html><script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application/json">${JSON.stringify({ __DEFAULT_SCOPE__: { "webapp.video-detail": { statusCode: 0, itemInfo: { itemStruct: item } } } })}</script></html>`;
}

/** Rejoue `p.hours` heures de passages (un toutes les 10 minutes) à partir de T0 = le passage qui a suivi 14:09:55. */
export async function simulate(base: Base, p: Params): Promise<Report> {
  const T0 = base.T0;
  const end = T0 + p.hours * HOUR;
  // ── Le monde : chaque compte, ses vidéos en ligne, ses publications à venir.
  const accs: Acc[] = [];
  for (const b of base.accounts) {
    // Un compte dont on n'a rangé aucune vidéo : une vidéo ancienne, pour que son profil se lise (les profils vides
    // sont hors des briques).
    const vids = b.vids.length ? b.vids : [{ id: vidId(T0 - 60 * DAY, b.id), at: T0 - 60 * DAY }];
    const a: Acc = {
      b,
      id: b.id,
      handle: b.handle,
      appActive: b.appActive,
      status: "active",
      nextReadAt: b.nextReadAt,
      ...(b.readAt !== undefined ? { readAt: b.readAt } : {}),
      ...(b.lastPostAt !== undefined ? { lastPostAt: b.lastPostAt } : {}),
      located: b.located,
      ...(b.gapChecked ? { gapChecked: b.gapChecked } : {}),
      readErrors: b.readErrors,
      first: b.readAt === undefined,
      known: new Map(b.vids.map((v) => [v.id, v])),
      // La vidéo gapChecked n'est plus en ligne (le relevé payant d'un trou ne l'a pas retrouvée).
      online: vids.filter((v) => v.id !== b.gapChecked),
      pending: b.replay.map((at, i) => ({ id: vidId(at, `${b.id}:${i}`), at })),
      deleted: new Set(b.gapChecked ? [b.gapChecked] : []),
    };
    accs.push(a);
  }
  // L'heure de second regard d'un compte : son prochain relevé est calé sur une publication + 18 h (nextReadAtFor).
  const secondLook = (a: Acc): number | undefined => {
    const post = a.nextReadAt - SECOND_LOOK_MS;
    for (const v of a.known.values()) if (v.at === post) return post + DAY;
    return undefined;
  };
  for (const a of accs) {
    const d = secondLook(a);
    if (d !== undefined) a.deadline = d;
  }
  /** Les publications rejouées jusqu'à `at`, puis la suppression tirée depuis le dernier relevé réussi (une fois). */
  const advance = (a: Acc, at: number) => {
    while (a.pending.length && a.pending[0].at <= at) a.online.unshift(a.pending.shift()!);
    const cycle = a.readAt ?? -1;
    if (a.delCycle === cycle) return;
    a.delCycle = cycle;
    if (draw(p.seed, "del", a.id, cycle) >= p.gapRate) return;
    const top = [...a.known.values()].sort((x, y) => y.at - x.at)[0];
    const i = top ? a.online.findIndex((v) => v.id === top.id) : -1;
    if (i < 0 || a.online.length < 2) return;
    a.deleted.add(top!.id);
    a.online.splice(i, 1);
  };

  // ── Le budget : le vrai document de réglages, la vraie dépense du mois, plus ce que le rejeu dépense (poste tiktok).
  const budget = normalizeBudget(base.settings as Parameters<typeof normalizeBudget>[0]);
  const simUsage = new Map<string, number>();
  const usageRows = (): UsageRow[] => [...base.usage.map((u) => ({ poste: u.poste, credits: u.credits, day: u.day })), ...[...simUsage].map(([day, credits]) => ({ poste: "tiktok", credits, day }))];
  let trueRemaining = p.balance.remaining;
  let seen = { remaining: p.balance.remaining, seenAt: T0 - p.balance.seenAgoMs };
  let packDone = false;
  const spend = (at: number) => {
    const day = dayKeyParis(at);
    simUsage.set(day, (simUsage.get(day) ?? 0) + 1);
    trueRemaining -= 1;
    seen = { remaining: trueRemaining, seenAt: at };
  };

  // ── Ce que le rejeu compte.
  const r: Report = {
    variant: p.variant,
    passes: 0,
    budget: { n0: 0, tier0: "", reserve0: false, nByPass: [] },
    freeOk: 0,
    freeFails: {},
    pages: 0,
    pagesFailed: 0,
    pagesByWhy: {},
    credits: {},
    paidCalls: 0,
    saved: {},
    measured: {},
    held: 0,
    heldFirst: 0,
    heldTwice: 0,
    reserveDefer: 0,
    firstDefer: 0,
    probes: [],
    probeDue: 0,
    breakerPasses: 0,
    notReached: 0,
    waits: [],
    waitsTracked: [],
    waitingAtEnd: { count: 0, maxMs: 0, over1h: 0, over3h: 0 },
    secondLook: { due: 0, onTime: 0, late: 0, lateMs: [], stillWaiting: 0 },
    first: { injected: 0, readFree: 0, readPaid: 0, waitMs: [], unread: 0 },
    events: [],
    readsByPass: [],
    dueByPass: [],
    pagesByPass: [],
    pagesFailedByPass: [],
    reserveDeferByPass: [],
    gapReads: 0,
    gapAccountsDueByPass: [],
  };
  const open = new Map<string, MissEvent[]>();

  /** Ce qu'applyAccountRead écrit d'un relevé réussi (gratuit ou payant) : vidéos rangées, readAt, nextReadAt, freeMissAt effacé. */
  const applyRead = (a: Acc, videos: readonly { videoId: string; publishedAt: number; region?: string }[], now: number, at: number, how: string, dueAt: number | null) => {
    for (const v of videos) {
      const k = a.known.get(v.videoId);
      if (k) {
        if (v.region && !k.region) a.known.set(v.videoId, { ...k, region: v.region });
      } else a.known.set(v.videoId, { id: v.videoId, at: v.publishedAt, ...(v.region ? { region: v.region } : {}) });
    }
    if (videos.some((v) => v.region)) a.located = true;
    const recent = [...a.known.values()].sort((x, y) => y.at - x.at).slice(0, MEDIAN_WINDOW);
    const lastPostAt = Math.max(a.lastPostAt ?? 0, recent[0]?.at ?? 0) || undefined;
    if (dueAt !== null) r.waits.push(at - dueAt);
    if (dueAt !== null && !a.first) r.waitsTracked.push(at - dueAt);
    if (a.deadline !== undefined && dueAt !== null) {
      r.secondLook.due++;
      if (at <= a.deadline) r.secondLook.onTime++;
      else {
        r.secondLook.late++;
        r.secondLook.lateMs.push(at - a.deadline);
      }
    }
    if (a.enteredAt !== undefined && a.first) {
      r.first.waitMs.push(at - a.enteredAt);
      if (how === "gratuit") r.first.readFree++;
      else r.first.readPaid++;
    }
    a.lastPostAt = lastPostAt;
    a.readAt = now;
    a.first = false;
    a.freeMissAt = undefined;
    a.readErrors = 0;
    a.lastFail = undefined;
    a.nextReadAt = nextReadAtFor(lastPostAt, now, recent.filter((v) => now - v.at < FRESH_VIDEO_MS).at(-1)?.at);
    a.deadline = secondLook(a);
    for (const e of open.get(a.id) ?? []) {
      e.resolvedAt = at;
      e.how = how;
    }
    open.delete(a.id);
  };
  const readError = (a: Acc, now: number) => {
    a.readErrors++;
    a.nextReadAt = now + DAY;
    a.freeMissAt = undefined;
    if (a.readErrors >= MAX_READ_ERRORS) a.status = "paused";
  };

  for (let t = T0; t < end; t += PASS_EVERY_MS) {
    r.passes++;
    let clock = t;
    if (p.pack && !packDone && T0 + p.pack.at <= t) {
      trueRemaining += p.pack.credits;
      packDone = true;
    }
    if (p.firstBurst && t <= T0 + p.firstBurst.at && T0 + p.firstBurst.at < t + PASS_EVERY_MS) {
      const at = T0 + p.firstBurst.at;
      const pool = accs.filter((a) => a.b.vids.length >= 3 && !a.enteredAt);
      for (let i = 0; i < p.firstBurst.count; i++) {
        const src = pool[Math.floor(draw(p.seed, "first", i) * pool.length)];
        const b: BaseAcc = { ...src.b, id: `neuf${i}`, handle: `neuf.${i}`, located: false, readErrors: 0, vids: [], replay: [] };
        delete b.readAt;
        delete b.lastPostAt;
        delete b.gapChecked;
        const a: Acc = { b, id: b.id, handle: b.handle, appActive: true, status: "active", nextReadAt: at, located: false, readErrors: 0, first: true, known: new Map(), online: src.online.map((v) => ({ ...v })), pending: [], deleted: new Set(), enteredAt: at };
        accs.push(a);
        r.first.injected++;
      }
    }
    // La part payante du passage, comme accountReadsPass : budgetState puis allowance (24 passages comptés par jour).
    const today = dayKeyParis(t);
    const month = monthKeyParis(t);
    const rows = usageRows();
    const since = dayKeyParis(t - 4 * DAY);
    const monthRows = [...base.usage.filter((u) => u.month === month).map((u) => ({ poste: u.poste, credits: u.credits, day: u.day })), ...[...simUsage].filter(([d]) => d.startsWith(month)).map(([day, credits]) => ({ poste: "tiktok", credits, day }))];
    const b = budgetState(budget, monthRows, { remaining: seen.remaining, seenAt: seen.seenAt, now: t, perDay: recentPerDay(rows.filter((u) => (u.day ?? "") >= since), today) });
    const todayCredits = monthRows.filter((u) => u.day === today && u.poste === "tiktok").reduce((s, u) => s + u.credits, 0);
    const n = allowance(budget, b, "tiktok", todayCredits, ACCOUNT_RUNS_PER_DAY);
    if (r.passes === 1) r.budget = { n0: n, tier0: b.tier, reserve0: b.reserveReached, nByPass: [] };
    r.budget.nByPass.push(n);
    // dueAccounts : l'index by_due (actifs, nextReadAt ≤ now, dans l'ordre), limit + DUE_SLACK lus, apps en pause à part.
    const limitDue = Math.max(n, FREE_READS_PER_RUN);
    const rowsDue = accs
      .filter((a) => a.status === "active" && a.nextReadAt <= t)
      .sort((x, y) => x.nextReadAt - y.nextReadAt)
      .slice(0, limitDue + DUE_SLACK);
    for (const a of rowsDue.filter((a) => !a.appActive)) a.nextReadAt = t + PARKED_RECHECK_MS;
    const due: Due[] = rowsDue
      .filter((a) => a.appActive)
      .slice(0, limitDue)
      .map((a) => ({ acc: a, id: a.id, handle: a.handle, located: a.located, first: a.first, dueAt: a.nextReadAt, ...(a.lastPostAt !== undefined ? { lastPostAt: a.lastPostAt } : {}), ...(a.freeMissAt !== undefined ? { freeMissAt: a.freeMissAt } : {}) }));
    r.gapAccountsDueByPass.push(
      due.filter((d) => {
        const top = [...d.acc.known.values()].sort((x, y) => y.at - x.at)[0];
        return !!top && top.id !== d.acc.gapChecked && d.acc.deleted.has(top.id);
      }).length,
    );
    // ── La voie gratuite : une page à la fois, pause avant chacune, second essai d'une page refusée.
    let cur: { a: Acc; tries: number; failVideo?: string } | null = null;
    const inRafale = (at: number) => (p.rafale ?? []).some((w) => T0 + w.from <= at && at < T0 + w.to);
    const raw = async (url: string): Promise<FreePage> => {
      clock += p.latencyMs;
      r.pages++;
      const a = cur!.a;
      if (inRafale(clock)) return { ok: false, kind: "suspect", reason: "HTTP 429 (rafale)" };
      if (url.includes("/embed/@")) {
        const tries = ++cur!.tries;
        const persist = a.lastFail?.kind === "suspect" && t - a.lastFail.at <= FREE_MISS_KEEP_MS && draw(p.seed, "p2", a.id, t) >= p.p2;
        const refused = persist || (tries === 1 ? draw(p.seed, "r1", a.id, t) < p.r1 : draw(p.seed, "r1", a.id, t) < p.r1 && draw(p.seed, "r2", a.id, t) < p.q / p.r1);
        if (refused) return { ok: false, kind: "suspect", reason: "HTTP 429" };
        return { ok: true, text: profileHtml(a.online.slice(0, EMBED_LIST)) };
      }
      const id = url.split("/").at(-1)!;
      const v = a.online.find((x) => x.id === id);
      if (!v) return { ok: true, text: GONE_PAGE };
      const persist = a.lastFail?.kind === "detail" && a.lastFail.video === id && t - a.lastFail.at <= FREE_MISS_KEEP_MS && draw(p.seed, "p2d", a.id, t) >= p.p2;
      if (persist || draw(p.seed, "qd", a.id, id, t) < p.qDetail) {
        if (!a.known.has(id)) cur!.failVideo ??= id;
        return { ok: true, text: UNREADABLE };
      }
      return { ok: true, text: videoHtml(a, v) };
    };
    const freePage = retrying(
      paced(raw, async () => {
        clock += storePauseMs(draw(p.seed, "pause", clock));
      }),
      async () => {
        clock += FREE_RETRY_MS;
      },
    );
    let paidCalls = 0;
    let limit = n;
    let gapPages = n;
    const readsBefore = r.freeOk;
    const pagesBefore = r.pages;
    const failedBefore = r.pagesFailed;
    const lane = await runFreeLane(
      laneQueue(due, t),
      async (d) => {
        const a = d.acc;
        advance(a, clock);
        cur = { a, tries: 0 };
        const before = r.pages;
        const known = async (ids: string[]): Promise<KnownVideo[]> =>
          ids
            .slice(0, 40)
            .map((id) => a.known.get(id))
            .filter((k): k is V => !!k)
            .map((k) => ({ videoId: k.id, publishedAt: k.at, ...(k.region ? { region: k.region } : {}) }));
        const newest = async (): Promise<NewestKnown | null> => {
          const top = [...a.known.values()].sort((x, y) => y.at - x.at)[0];
          return !top || top.id === a.gapChecked ? null : { videoId: top.id, publishedAt: top.at };
        };
        const f = await freeRead(a.handle, { page: freePage, known, newest, gapPage: () => gapPages-- > 0 }, t, undefined, !a.located);
        const used = r.pages - before;
        if (!f.ok) {
          r.freeFails[f.why] = (r.freeFails[f.why] ?? 0) + 1;
          r.pagesFailed += used;
          r.pagesByWhy[f.why] = (r.pagesByWhy[f.why] ?? 0) + used;
          if (f.why === "gap") r.gapReads++;
          if (f.why === "suspect" || f.why === "detail") a.lastFail = { at: t, kind: f.why, ...(cur.failVideo ? { video: cur.failVideo } : {}) };
          if (f.why === "suspect" || f.why === "detail" || f.why === "gap") {
            const e: MissEvent = { key: `${a.id}@${t}`, account: a.id, at: clock, why: f.why, first: d.first, held: false };
            r.events.push(e);
            open.set(a.id, [...(open.get(a.id) ?? []), e]);
          }
          return f;
        }
        r.freeOk++;
        applyRead(a, f.videos, t, clock, "gratuit", d.dueAt);
        for (const [k, c] of Object.entries(freeReadSaved(f, d))) r.saved[k] = (r.saved[k] ?? 0) + (c ?? 0);
        return { ok: true as const };
      },
      () => clock - t < FREE_LANE_MAX_MS,
    );
    r.readsByPass.push(r.freeOk - readsBefore);
    r.dueByPass.push(due.length);
    r.pagesByPass.push(r.pages - pagesBefore);
    r.pagesFailedByPass.push(r.pagesFailed - failedBefore);
    if (!lane.state.on) r.breakerPasses++;
    r.notReached += lane.notReached.length;
    // ── Le relevé payant (readPaid) : `limit` borne les appels du passage, PASS_MAX_MS le temps.
    const readPaid = async (d: Due, lim: number, reason: PaidReason, gap?: NewestKnown, gapSeen?: GapSeen): Promise<void> => {
      if (paidCalls >= lim || clock - t >= PASS_MAX_MS) return;
      const a = d.acc;
      advance(a, clock);
      const read = await paidRead(
        async (cursor): Promise<PaidPage> => {
          paidCalls++;
          r.paidCalls++;
          r.credits[reason] = (r.credits[reason] ?? 0) + 1;
          spend(clock);
          clock += PAID_CALL_MS;
          const i = cursor ? Number(cursor) : 0;
          const slice = a.online.slice(i * PAID_PAGE, (i + 1) * PAID_PAGE);
          const videos = slice.map((v) => ({ videoId: v.id, publishedAt: v.at, ...(v.region ? { region: v.region } : {}) }) as unknown as SignalInput);
          return { ok: true, videos, next: a.online.length > (i + 1) * PAID_PAGE ? String(i + 1) : null };
        },
        () => paidCalls < lim,
        gap,
      );
      if (gap && gapSeen) r.measured[gapMeasure(gapSeen, read, gap)] = (r.measured[gapMeasure(gapSeen, read, gap)] ?? 0) + 1;
      if (read.outcome === "error") readError(a, t);
      if (read.videos.length) applyRead(a, read.videos, t, clock, `payant:${reason}`, d.dueAt <= t ? d.dueAt : null);
      if (gap && read.reached.done && !read.reached.found) a.gapChecked = gap.videoId;
    };
    const paidList = async (list: readonly Due[], reason: PaidReason) => {
      for (const d of list) await readPaid(d, limit, reason);
    };
    const misses = splitMisses(lane.failed);
    for (const d of misses.unreadable) readError(d.acc, t);
    const waitFirst = tierDefers(b.tier).firstReads;
    let missPay: LaneMiss<Due>[];
    const saturated = lane.notReached.some((d) => !d.first);
    if (p.variant === "avant7" || (p.variant === "retenue-voie-libre" && saturated)) {
      const fm = firstReadMisses(
        misses.paid.filter((m) => m.account.first).map((m) => m.account),
        lane.notReached.filter((a) => a.first),
        lane.state.on,
        waitFirst,
      );
      for (const d of fm.defer) d.acc.nextReadAt = t + FIRST_READ_WAIT_MS;
      r.firstDefer += fm.defer.length;
      await paidList(fm.pay, "premier");
      missPay = misses.paid.filter((m) => !m.account.first);
    } else {
      const plan = missPlan(misses.paid, lane.notReached, { laneOpen: lane.state.on, n, waitFirst, reserveReached: p.variant === "livre" ? b.reserveReached : false }, t);
      for (const d of plan.hold) {
        // Un second échec d'affilée retenu encore : ce que la brique 7 promet de ne jamais faire.
        if (d.freeMissAt !== undefined && t - d.freeMissAt <= FREE_MISS_KEEP_MS) r.heldTwice++;
        d.acc.freeMissAt = t;
        r.held++;
        if (d.first) r.heldFirst++;
        for (const e of open.get(d.id) ?? []) if (e.key === `${d.id}@${t}`) e.held = true;
      }
      limit = plan.limit;
      for (const d of plan.reserveDefer) d.acc.nextReadAt = t + RESERVE_MISS_WAIT_MS;
      r.reserveDefer += plan.reserveDefer.length;
      r.reserveDeferByPass.push(plan.reserveDefer.length);
      for (const d of plan.firstDefer) d.acc.nextReadAt = t + FIRST_READ_WAIT_MS;
      r.firstDefer += plan.firstDefer.length;
      await paidList(plan.firstPay, "premier");
      missPay = plan.missPay;
    }
    for (const m of missPay) await readPaid(m.account, limit, missReason(m), m.newest, m.seen);
    const over = overflowToPay(
      lane.notReached.filter((a) => !a.first),
      lane.state.on,
      clock,
    );
    await paidList(over.pay, over.reason);
    // La sonde du solde sous la réserve : due[0], ou le compte actif relevé il y a le plus longtemps.
    if (needsBalanceProbe(b) && paidCalls === 0) {
      r.probeDue++;
      const probe: Due | undefined =
        due[0] ??
        accs
          .filter((a) => a.status === "active")
          .sort((x, y) => x.nextReadAt - y.nextReadAt)
          .slice(0, 1)
          .map((a) => ({ acc: a, id: a.id, handle: a.handle, located: a.located, first: a.first, dueAt: a.nextReadAt }))[0];
      if (probe) {
        const top = [...probe.acc.known.values()].sort((x, y) => y.at - x.at)[0];
        r.probes.push({ at: t, handle: probe.handle, gap: !!top && top.id !== probe.acc.gapChecked && probe.acc.deleted.has(top.id) });
        await readPaid(probe, 1, "sonde");
      }
    }
  }
  for (const a of accs) {
    if (a.status !== "active" || !a.appActive || a.nextReadAt > end) continue;
    r.waitingAtEnd.count++;
    r.waitingAtEnd.maxMs = Math.max(r.waitingAtEnd.maxMs, end - a.nextReadAt);
    if (end - a.nextReadAt > HOUR) r.waitingAtEnd.over1h++;
    if (end - a.nextReadAt > 3 * HOUR) r.waitingAtEnd.over3h++;
    if (a.deadline !== undefined && a.deadline < end) r.secondLook.stillWaiting++;
    if (a.first && a.enteredAt !== undefined) r.first.unread++;
  }
  return r;
}
