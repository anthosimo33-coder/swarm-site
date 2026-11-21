import fs from "node:fs";
import path from "node:path";
import { vi } from "vitest";
import { runAccountReads, runNetworkSearch } from "../../convex/radar/radarNetworks";
import * as radarSignals from "../../convex/radar/radarSignals";
import { runTranscripts } from "../../convex/radar/radarSources";
import { DEFAULT_BUDGET } from "../../convex/radar/radarSignalsMath";
import { drive, fakeActionCtx, handlerOf, writableDb, type CtxCall } from "./action-ctx";

/**
 * LE BANC DES BRIQUES GRATUITES (20/11/2026), écrit pour tourner TEL QUEL sur main et sur la bascule TikHub : il
 * n'importe rien que main n'ait pas (la prise du quota de replis, radarSignals.claimFallback, n'est lue qu'à l'appel ;
 * main ne l'appelle jamais). Cinq passages des tâches livrées (runAccountReads, runNetworkSearch, runTranscripts), sur
 * un faux contexte qui note chaque query, mutation et tâche planifiée, et un faux `fetch` qui note chaque appel :
 *  - les pages publiques de TikTok sont SERVIES (profils, vidéos, hashtags, sous-titres), pour que chaque brique agisse :
 *    #26 brique 7 (un raté retenu un passage, payé au second ; un compte retenu relu gratuitement), brique 8 (sous la
 *    réserve, les ratés attendent la sonde), brique 4 en mesure (le trou vérifié sur la page, payé quand même) ;
 *    #25 en mesure (la courbe lue sur la page, payée quand même) ; #24 (un hashtag payé vide que TikTok dit absent ne
 *    se repaie pas ; un hashtag jamais payé paie) ; #19 (sous-titres natifs d'abord, le payant pour le reste) ;
 *  - ScrapeCreators et TikHub répondent par leurs réponses enregistrées (tests/radar/fixtures/sc, tikhub). La vidéo
 *    de la courbe a les mêmes compteurs chez les deux et sur sa page (les abonnés de son auteur : 5 000 sur la page et
 *    chez ScrapeCreators, 0 chez TikHub, qui ne les mesure pas) ;
 *  - aucun appel réseau réel.
 * La référence (tests/radar/fixtures/briques-2191a8b.json) est écrite par tests/radar/radar-briques-bascule.test.ts
 * (GOLDEN_WRITE=1) sur main (2191a8b depuis le 21/11/2026).
 */

export const NOW = Date.parse("2026-11-20T12:00:00Z");
const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
export const SC_KEY = "cle-sc-de-test-0123456789";
export const TH_KEY = "cle-th-de-test";

const FIX = path.join(__dirname, "fixtures");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fixture = (name: string) => JSON.parse(fs.readFileSync(path.join(FIX, name), "utf8")) as Record<string, any>;

/** Un identifiant de vidéo TikTok daté : ses 32 bits de tête sont la seconde du téléversement (radarFreeMath.videoIdTime). */
const idAt = (ms: number, n: number): string => ((BigInt(Math.floor(ms / 1000)) << 32n) + BigInt(n)).toString();

// ─── Les pages publiques de TikTok ───────────────────────────────────────────────────────────────────────────────

const profilePage = (handle: string, ids: string[], fans = 1_200) =>
  `<html><script>window.__data={"userInfo":${JSON.stringify({ uniqueId: handle, followerCount: fans, signature: "", privateAccount: false })},"videoList":${JSON.stringify(
    ids.map((id, i) => ({ id, desc: `vidéo ${i}`, playCount: 1_000 + i })),
  )}}</script></html>`;

const rehydration = (scope: Record<string, unknown>) =>
  `<html><script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application/json">${JSON.stringify({ __DEFAULT_SCOPE__: { "webapp.video-detail": scope } })}</script></html>`;

/** Les compteurs de la vidéo de la courbe : ceux de la réponse TikHub enregistrée (tikhub/video.json). */
const CURVE = (() => {
  const st = fixture("tikhub/video.json").data.aweme_detail.statistics;
  return { views: st.play_count as number, likes: st.digg_count as number, comments: st.comment_count as number, shares: st.share_count as number, saves: st.collect_count as number };
})();
const CURVE_FANS = 5_000;

const videoPage = (id: string, handle: string, extra: Record<string, unknown> = {}) =>
  rehydration({
    statusCode: 0,
    statusMsg: "",
    itemInfo: {
      itemStruct: {
        id,
        desc: "la légende",
        createTime: String(Math.floor((NOW - 3 * DAY) / 1000)),
        textLanguage: "fr",
        author: { id: `uid_${handle}`, uniqueId: handle, signature: "" },
        authorStats: { followerCount: CURVE_FANS },
        stats: { playCount: CURVE.views, diggCount: CURVE.likes, commentCount: CURVE.comments, shareCount: CURVE.shares, collectCount: String(CURVE.saves) },
        ...extra,
      },
    },
  });

const vttUrl = (lang: string) => `https://example.invalid/asr-${lang}/?a=1988`;
const subtitlesPage = (id: string, tracks: { lang: string; source: string }[]) =>
  videoPage(id, "auteur_t", {
    video: {
      duration: 30,
      subtitleInfos: tracks.map((t) => ({ LanguageCodeName: t.lang, Source: t.source, Url: vttUrl(t.lang), Format: "webvtt", UrlExpire: "1795368266", Size: "864", LanguageID: "2", Version: "4" })),
      claInfo: { hasOriginalAudio: true, enableAutoCaption: true, originalLanguageInfo: { language: "eng-US", languageCode: "en" } },
    },
  });

const tagPage = (tag: string, videoCount: number, items: { id: string; author: string; desc: string }[]) =>
  `<html><script id="__FRONTITY_CONNECT_STATE__">{"source":{"data":{"/embed/tag/${tag}":{"videoList":${JSON.stringify(
    items.map((x) => ({ id: x.id, desc: x.desc, authorUniqueId: x.author, playCount: 900 })),
  )},"embedInfo":{"viewCount":"19966314","videoCount":"${videoCount}","statusCode":0,"code":200}}}}}</script></html>`;

// ─── Les comptes des relevés (#26) ───────────────────────────────────────────────────────────────────────────────

/** Deux vidéos rangées, vieilles de 5 et 6 jours : leurs vues suffisent (radarFreeMath.freePlan), pas de page vidéo. */
const OLD = [idAt(NOW - 5 * DAY, 1), idAt(NOW - 6 * DAY, 2)];
/** La vidéo inconnue d'un nouveau compte, lue sur sa page. */
const FIRST_VIDEO = idAt(NOW - 3 * DAY, 11);
/**
 * Le trou : la liste publique ne porte plus la dernière vidéo connue (`NEWEST`), mais une vidéo connue plus vieille
 * qu'elle (`LISTED`) — elle « remonte » au-delà ; la page de `NEWEST` est absente (404). La dernière connue est datée
 * d'une seconde après la plus vieille de la première page payante (chez ScrapeCreators et chez TikHub, la même liste) :
 * le payant passe sa date sans la voir, et rapporte une vidéo publiée depuis — « trou-paye:absente ».
 */
const PAID_OLDEST_MS = Math.min(...(fixture("sc/profil.json").aweme_list as { create_time: number }[]).map((v) => v.create_time)) * 1_000;
const NEWEST = { videoId: idAt(PAID_OLDEST_MS + 1_000, 9), publishedAt: PAID_OLDEST_MS + 1_000 };
const LISTED = idAt(NOW - 3 * DAY, 7);

type Due = { id: string; handle: string; located: boolean; first: boolean; dueAt: number; freeMissAt?: number };
/** Dus depuis 10 minutes : dans leur fenêtre (radarFreeMath.laneWait), un raté peut attendre le passage suivant. */
const due = (handle: string, o: Partial<Due> = {}): Due => ({ id: `radarTracked_${handle}`, handle, located: true, first: false, dueAt: NOW - 10 * MIN, ...o });
/**
 * lu : relu gratuitement. relu : retenu au passage d'avant, relu gratuitement (un appel évité, saved.repli).
 * rate : profil refusé, premier échec — retenu (brique 7). rate_encore : retenu au passage d'avant, refusé de nouveau —
 * payé « repli ». nouveau : premier relevé, lu gratuitement. troue : le trou, mesuré (brique 4).
 */
const ACCOUNTS: Due[] = [
  due("lu"),
  due("relu", { freeMissAt: NOW - 5 * MIN }),
  due("rate"),
  due("rate_encore", { freeMissAt: NOW - 5 * MIN }),
  due("nouveau", { first: true, located: false }),
  due("troue"),
];
const ACCOUNT_PAGES: Record<string, [number, string]> = {
  "https://www.tiktok.com/embed/@lu": [200, profilePage("lu", OLD)],
  "https://www.tiktok.com/embed/@relu": [200, profilePage("relu", OLD)],
  "https://www.tiktok.com/embed/@nouveau": [200, profilePage("nouveau", [FIRST_VIDEO])],
  [`https://www.tiktok.com/@nouveau/video/${FIRST_VIDEO}`]: [200, videoPage(FIRST_VIDEO, "nouveau")],
  "https://www.tiktok.com/embed/@troue": [200, profilePage("troue", [LISTED])],
  [`https://www.tiktok.com/@troue/video/${NEWEST.videoId}`]: [404, ""],
};
const known = (accountId: string, ids: string[]) => {
  if (accountId === "radarTracked_nouveau") return [];
  return ids.map((videoId) => ({ videoId, publishedAt: Number(BigInt(videoId) >> 32n) * 1000, region: "FR" }));
};

/** La courbe (#25) : deux vidéos dues ; la page de la première est servie, celle de la seconde refusée. */
const CURVE_IDS = ["7709816632507368725", "7709774559007737110"];
const curveDue = (limit: number) =>
  CURVE_IDS.slice(0, limit).map((videoId, i) => ({ id: `radarSignals_c${i}`, url: `https://www.tiktok.com/@auteur_17/video/${videoId}`, videoId, handle: "auteur_17" }));
const CURVE_PAGES: Record<string, [number, string]> = {
  [`https://www.tiktok.com/@auteur_17/video/${CURVE_IDS[0]}`]: [200, videoPage(CURVE_IDS[0], "auteur_17")],
};

// ─── Les apps du réseau (#24) ────────────────────────────────────────────────────────────────────────────────────

const app = (slug: string, searches: string[], tagCounts: unknown[] = []) => ({
  id: `radarApps_${slug}`,
  name: slug.charAt(0).toUpperCase() + slug.slice(1),
  searches,
  rival: true,
  deep: false,
  never: false,
  rule: { strong: [slug], weak: [], context: [] },
  tagCounts,
});
/**
 * absentapp : payé vide il y a un jour, sa page dit le hashtag absent — ses deux passes ne paient pas (saved.hashtag).
 * focustown : jamais payé, absent sur sa page — il paie (« unconfirmed ») ; chez TikHub, son identifiant est dans la
 * réponse enregistrée (tikhub/hashtag-id.json). compteapp : payé 2 vidéos il y a un jour, sa page en compte toujours 2
 * (« compteur inchangé », en mesure) — il paie ; TikHub n'a pas son nom exact : lu chez ScrapeCreators. motcle : une
 * recherche par mot-clé.
 */
const APPS = [
  app("absentapp", ["#absentapp"], [{ tag: "absentapp", videos: 0, paid: 0, at: NOW - DAY }]),
  app("focustown", ["#focustown"]),
  app("compteapp", ["#compteapp"], [{ tag: "compteapp", videos: 2, paid: 2, at: NOW - DAY }]),
  app("motcle", ["motcle app"]),
];
const TAG_PAGES: Record<string, [number, string]> = {
  "https://www.tiktok.com/embed/tag/absentapp": [404, ""],
  "https://www.tiktok.com/embed/tag/focustown": [404, ""],
  "https://www.tiktok.com/embed/tag/compteapp": [
    200,
    tagPage("compteapp", 2, [
      { id: idAt(NOW - 4 * DAY, 21), author: "fan1", desc: "mon avis #compteapp" },
      { id: idAt(NOW - 4 * DAY, 22), author: "fan2", desc: "#compteapp encore" },
    ]),
  ],
};

// ─── Les transcriptions (#19) ────────────────────────────────────────────────────────────────────────────────────

const T = ["7709000000000000001", "7709000000000000002", "7709000000000000003", "7709000000000000004"].map((id) => `https://www.tiktok.com/@auteur_t/video/${id}`);
/** t1 : piste ASR anglaise, transcrite sans crédit. t2 : aucune piste (marquée), au payant. t3 : déjà lue sans sous-titres, au payant. t4 : page refusée, au payant. */
const TRANSCRIPTS = [
  { id: "radarSignals_t1", url: T[0], checked: false },
  { id: "radarSignals_t2", url: T[1], checked: false },
  { id: "radarSignals_t3", url: T[2], checked: true },
  { id: "radarSignals_t4", url: T[3], checked: false },
];
const TRANSCRIPT_PAGES: Record<string, [number, string]> = {
  [T[0]]: [200, subtitlesPage("7709000000000000001", [{ lang: "eng-US", source: "ASR" }])],
  [vttUrl("eng-US")]: [200, "WEBVTT\n\n00:00:00.000 --> 00:00:01.000\nhello from the page\n"],
  [T[1]]: [200, subtitlesPage("7709000000000000002", [])],
};

// ─── Le réseau simulé ────────────────────────────────────────────────────────────────────────────────────────────

export type FetchCall = { url: string; key: string | null; auth: string | null };

/** ScrapeCreators, TikHub (leurs réponses enregistrées), TikTok (les pages ci-dessus) ; toute autre adresse refuse (500). */
export function network(pages: Record<string, [number, string]>) {
  const calls: FetchCall[] = [];
  const profile = fixture("sc/profil.json");
  const scVideo = fixture("sc/video.json").aweme_detail;
  const th = (name: string) => fixture(`tikhub/${name}.json`);
  const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status });
  const impl = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input);
    const h = (init?.headers ?? {}) as Record<string, string>;
    calls.push({ url, key: h["x-api-key"] ?? null, auth: h.Authorization ?? null });
    const u = new URL(url);
    if (u.hostname === "api.scrapecreators.com") {
      const ok = (body: Record<string, unknown>) => json(200, { success: true, credits_charged: 1, credits_remaining: 30_000, ...body });
      const cursor = Number(u.searchParams.get("cursor") ?? 0);
      if (u.pathname === "/v1/tiktok/search/keyword") return ok({ search_item_list: fixture("sc/reseau-motcle.json").search_item_list, cursor: cursor + 30, has_more: 1 });
      if (u.pathname === "/v1/tiktok/search/hashtag") return ok({ aweme_list: profile.aweme_list, cursor: cursor + 20, has_more: 1 });
      if (u.pathname === "/v3/tiktok/profile/videos") return ok({ aweme_list: profile.aweme_list, max_cursor: profile.max_cursor, has_more: 1 });
      // La vidéo de la courbe : les compteurs de sa page, et les abonnés de son auteur.
      if (u.pathname === "/v2/tiktok/video") {
        const stats = { play_count: CURVE.views, digg_count: CURVE.likes, comment_count: CURVE.comments, share_count: CURVE.shares, collect_count: CURVE.saves };
        return ok({ aweme_detail: { ...scVideo, statistics: stats, author: { ...scVideo.author, follower_count: CURVE_FANS } } });
      }
      if (u.pathname === "/v1/tiktok/video/transcript") return ok({ transcript: "WEBVTT\n\n00:00:00.000 --> 00:00:01.000\npaid text\n" });
      return json(404, {});
    }
    if (u.hostname === "api.tikhub.io") {
      const route: Record<string, () => unknown> = {
        "/api/v1/tikhub/user/get_user_info": () => th("synthetiques").solde,
        "/api/v1/tikhub/user/get_all_endpoints_info": () => th("tarifs"),
        "/api/v1/tiktok/app/v3/fetch_user_post_videos": () => th("profil"),
        "/api/v1/tiktok/app/v3/fetch_video_search_result": () => th("reseau-motcle"),
        "/api/v1/tiktok/app/v3/fetch_hashtag_search_result": () => th("hashtag-id"),
        "/api/v1/tiktok/app/v3/fetch_hashtag_video_list": () => th("hashtag-liste"),
        "/api/v1/tiktok/app/v3/fetch_one_video_by_share_url": () => th("video"),
      };
      const r = route[u.pathname];
      return r ? json(200, r()) : json(404, {});
    }
    const p = pages[url];
    return p ? new Response(p[1], { status: p[0] }) : new Response("refus", { status: 500 });
  });
  return { impl, calls };
}

// ─── Les scénarios ───────────────────────────────────────────────────────────────────────────────────────────────

type Balance = { remaining: number; seenAt: number; now: number; perDay: number };
const LARGE: Balance = { remaining: 40_000, seenAt: NOW - MIN, now: NOW, perDay: 1_000 };
/** Sous la réserve de ScrapeCreators (1 000 crédits, CREDIT_RESERVE 1 500), lu il y a 2 heures : la sonde part. */
const RESERVE: Balance = { remaining: 1_000, seenAt: NOW - 2 * HOUR, now: NOW, perDay: 1_000 };

type Usage = { poste: string; credits: number; day: string };
const USUAL: Usage[] = [{ poste: "tiktok", credits: 1_000, day: "2026-11-19" }];

/**
 * Près du plafond du mois (comme radar-fusion-briques) : relevés 2 000 par jour, 49 400 crédits payés chez
 * ScrapeCreators (92,87 $ sur 110 $), transcriptions 10 par jour, le reste éteint. Au prix de ScrapeCreators partout,
 * la projection (113,36 $) coupe les transcriptions payantes ; aux prix des fournisseurs réglés, non. La voie gratuite,
 * elle, ne dépend pas du budget.
 */
const NEAR_CAP = {
  budget: {
    ...DEFAULT_BUDGET,
    capUsd: 110,
    postes: DEFAULT_BUDGET.postes.map((p) => (p.key === "tiktok" ? { ...p, qty: 2_000 } : p.key === "transcript" ? { ...p, qty: 10, on: true } : { ...p, on: false })),
  },
  usage: Array.from({ length: 19 }, (_, i): Usage => ({ poste: "tiktok", credits: 2_600, day: `2026-11-${String(i + 1).padStart(2, "0")}` })),
};

/** L'état que lit chaque tâche ; le solde TikHub est rangé et frais (main ne le lit pas). */
function jobState(balance: Balance, o: { budget?: typeof DEFAULT_BUDGET; usage?: Usage[] } = {}) {
  return {
    budget: o.budget ?? DEFAULT_BUDGET,
    cursor: 7,
    usage: o.usage ?? USUAL,
    day: "2026-11-20",
    month: "2026-11",
    balance,
    creditAlerted: {},
    recentUsage: (o.usage ?? USUAL).slice(-4),
    th: { paidUsd: 5.4, freeUsd: 0.021, seenAt: NOW - 1_000, spentSinceUsd: 0, perDay: null },
    thPrices: null,
    thPricesAt: NOW,
    fallbacksToday: 0,
  };
}

type Answer = (a: Record<string, unknown>) => unknown;
export type Scenario = { name: string; task: unknown; pages: Record<string, [number, string]>; answers: Record<string, Answer> };

function accountAnswers(balance: Balance): Record<string, Answer> {
  return {
    "radar/radarSignals:jobState": () => jobState(balance),
    "radar/radarNetworks:claimAccountsLease": () => true,
    "radar/radarNetworks:releaseAccountsLease": () => false,
    "radar/radarNetworks:appRules": () => [],
    "radar/radarNetworks:dueAccounts": () => ({ due: ACCOUNTS.map((a) => ({ ...a })), parked: [] }),
    "radar/radarNetworks:probeAccount": () => due("sonde"),
    "radar/radarNetworks:freeKnown": (a) => known(String(a.accountId), (a.videoIds as string[]) ?? []),
    "radar/radarNetworks:freeNewest": (a) => (a.accountId === "radarTracked_troue" ? NEWEST : null),
    "radar/radarSignals:dueCurve": (a) => curveDue(Number(a.limit)),
  };
}

export const SCENARIOS: Scenario[] = [
  { name: "releves:solde-large", task: runAccountReads, pages: { ...ACCOUNT_PAGES, ...CURVE_PAGES }, answers: accountAnswers(LARGE) },
  { name: "releves:sous-la-reserve", task: runAccountReads, pages: { ...ACCOUNT_PAGES, ...CURVE_PAGES }, answers: accountAnswers(RESERVE) },
  {
    name: "reseau:hashtags",
    task: runNetworkSearch,
    pages: TAG_PAGES,
    answers: (() => {
      let attachCalls = 0;
      return {
        "radar/radarSignals:jobState": () => jobState(LARGE),
        "radar/radarNetworks:dueApps": () => APPS.map((a) => structuredClone(a)),
        "radar/radarNetworks:attachFromSearch": (a: Record<string, unknown>) => ({ attached: a.step !== undefined && attachCalls++ % 3 === 0 ? 1 : 0, signals: 0, updated: 0 }),
        "radar/radarNetworks:hashtagIdOf": () => null,
      } as Record<string, Answer>;
    })(),
  },
  {
    name: "transcriptions",
    task: runTranscripts,
    pages: TRANSCRIPT_PAGES,
    answers: {
      "radar/radarSignals:jobState": () => jobState(LARGE),
      "radar/radarSources:dueTranscripts": () => TRANSCRIPTS.map((t) => ({ ...t })),
    },
  },
  {
    // Le payant coupé par la projection du mois : la voie gratuite transcrit quand même (#19), rien n'est payé.
    name: "transcriptions:plafond-proche",
    task: runTranscripts,
    pages: TRANSCRIPT_PAGES,
    answers: {
      "radar/radarSignals:jobState": () => jobState(LARGE, NEAR_CAP),
      "radar/radarSources:dueTranscripts": (a) => TRANSCRIPTS.filter((t) => !t.checked || Number(a.limit) > 0).map((t) => ({ ...t })),
    },
  },
];

export type Run = { name: string; result: unknown; fetches: FetchCall[]; ctx: CtxCall[] };

/**
 * Un passage : le faux contexte (la prise du quota de replis jouée pour de vrai sur une base en mémoire, comme
 * radar-tikhub-jobs ; main ne l'appelle pas), le faux réseau, l'horloge simulée jusqu'à la fin de la tâche.
 */
export async function runScenario(s: Scenario): Promise<Run> {
  vi.setSystemTime(NOW);
  const net = network(s.pages);
  vi.stubGlobal("fetch", net.impl);
  const w = writableDb({ radarSettings: [], radarUsage: [] });
  let serial: Promise<unknown> = Promise.resolve();
  const claim = (radarSignals as Record<string, unknown>).claimFallback;
  const f = fakeActionCtx({
    "radar/radarSignals:claimFallback": (a) => {
      const p = serial.then(() => handlerOf(claim)({ db: w.db }, a));
      serial = p.catch(() => undefined);
      return p;
    },
    ...s.answers,
  });
  const result = await drive(handlerOf(s.task)(f.ctx, {}) as Promise<unknown>);
  return { name: s.name, result, fetches: net.calls, ctx: f.calls };
}

/** Un objet écrit clés triées : l'ordre des champs d'un argument ne dit rien. */
export const canon = (x: unknown): string =>
  JSON.stringify(x, (_k, v: unknown) => (v && typeof v === "object" && !Array.isArray(v) ? Object.fromEntries(Object.entries(v as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b))) : v));

/** La forme comparée : appels triés (les relevés payants partent 8 de front : leur ordre dépend des réponses, pas du code). */
export const comparable = (r: Run) => ({ name: r.name, result: r.result, fetches: r.fetches.map(canon).sort(), ctx: r.ctx.map(canon).sort() });
