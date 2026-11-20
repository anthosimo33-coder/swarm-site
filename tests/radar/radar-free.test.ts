import { describe, expect, it } from "vitest";
import {
  FREE_BREAKER,
  FREE_FRESH_MS,
  FREE_LANE_MAX_MS,
  FREE_REGION_PAGES,
  GAP_FREE_CHECK,
  GAP_PAGES,
  LANE_FRESH_POST_MS,
  LANE_WAIT_FRESH_MS,
  LANE_WAIT_MS,
  PASS_MAX_MS,
  freeNote,
  freePlan,
  freeProfileUrl,
  freeRead,
  freeStart,
  freeVideoUrl,
  gapGone,
  gapMeasure,
  gapPageKind,
  gapReached,
  FIRST_FREE_PER_PASS,
  FREE_MISS_KEEP_MS,
  MISS_HOLD,
  PASS_EVERY_MS,
  firstReadMisses,
  freeReadSaved,
  heldFirstNotReached,
  heldSpared,
  holdMisses,
  missCost,
  missPlan,
  missReason,
  laneOrder,
  laneQueue,
  listGap,
  listReaches,
  missCounts,
  overflowToPay,
  paced,
  paidRead,
  runFreeLane,
  splitMisses,
  parseFreeProfile,
  parseFreeVideo,
  retrying,
  videoIdTime,
  TRIAL_DETAIL_MAX,
  TRIAL_EVERY,
  TRIAL_PER_DAY,
  TRIAL_TOTAL,
  trialPick,
  trialPlan,
  RESERVE_MISS_WAIT_MS,
  reserveMisses,
  type FreePage,
  type FreeWhy,
  type GapPage,
  type GapSeen,
  type KnownVideo,
  type LaneMiss,
  type PaidPage,
} from "../../convex/radar/radarFreeMath";
import {
  BALANCE_PROBE_MS,
  CREDIT_RESERVE,
  allowance,
  budgetState,
  needsBalanceProbe,
  normalizeBudget,
  tierDefers,
  type BudgetSettings,
  type BudgetState,
  type SignalInput,
} from "../../convex/radar/radarSignalsMath";
import { profileNextCursor } from "../../convex/radar/scrapeCreatorsApi";

/**
 * Radar — le relevé gratuit d'un compte sur les pages publiques de TikTok (13/11/2026). Les pages d'essai ont la
 * forme relevée ce jour-là : la page d'intégration du profil porte « userInfo » et « videoList », la page d'une
 * vidéo un bloc JSON « __UNIVERSAL_DATA_FOR_REHYDRATION__ ».
 */
const NOW = Date.UTC(2026, 10, 13, 12, 0);
const HOUR = 3_600_000;
/** L'identifiant d'une vidéo publiée à cette heure (ses 32 bits de poids fort sont des secondes). */
const idAt = (ms: number, n = 1) => String((BigInt(Math.floor(ms / 1000)) << BigInt(32)) + BigInt(n));
const V_NEUVE = idAt(NOW - 5 * HOUR, 1);
const V_HIER = idAt(NOW - 30 * HOUR, 2);
const V_SEMAINE = idAt(NOW - 6 * 24 * HOUR, 3);
const V_VIEILLE = idAt(NOW - 20 * 24 * HOUR, 4);

type Listed = { id: string; desc?: string; playCount?: number | string; coverUrl?: string };
const profil = (videos: Listed[], user: Record<string, unknown> = {}) =>
  `<html><script>window.__data={"userInfo":${JSON.stringify({ uniqueId: "lea.revise", followerCount: 1_840, signature: "J'utilise : shortfy.io", privateAccount: false, ...user })},"videoList":${JSON.stringify(videos.map((v) => ({ desc: "", playCount: 0, ...v })))}}</script></html>`;

const video = (id: string, o: Record<string, unknown> = {}, stats: Record<string, unknown> = {}) => {
  const item = {
    id,
    desc: "pq j’apprends ça que mtn 😭 @Koro AI #argent",
    createTime: String(Math.floor(videoIdTime(id) / 1000)),
    author: { id: "7276822206176609312", uniqueId: "lea.revise", signature: "Bio lue sur la page vidéo" },
    authorStats: { followerCount: 1_700 },
    stats: { diggCount: 91, shareCount: 12, commentCount: 3, playCount: 8_410, collectCount: "9", ...stats },
    music: { id: "7706838535877200673", title: "son original", authorName: "lea.revise" },
    stickersOnItem: [{ stickerText: ["Le nom du site\nc'est koro.ai"], stickerType: 4 }, { stickerText: ["  "] }, { stickerText: ["Enregistre"] }],
    textExtra: [
      // Positions en CARACTÈRES, comme TikTok les donne (l'emoji compte pour un).
      { start: 27, end: 35, userId: "9001", userUniqueId: "koroai", type: 0 },
      { start: 36, end: 43, hashtagName: "argent", type: 1 },
      { start: 27, end: 35, userId: "7276822206176609312", type: 0 },
    ],
    video: { duration: "65", cover: "https://p16.tiktokcdn.com/cover.jpeg?x-expires=1" },
    textLanguage: "fr",
    locationCreated: "FR",
    isAd: false,
    ...o,
  };
  return `<html><script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application/json">${JSON.stringify({ __DEFAULT_SCOPE__: { "webapp.video-detail": { statusCode: 0, itemInfo: { itemStruct: item } } } })}</script></html>`;
};
const supprimee = `<html><script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application/json">${JSON.stringify({ __DEFAULT_SCOPE__: { "webapp.video-detail": { statusCode: 10204, statusMsg: "item doesn't exist" } } })}</script></html>`;

describe("Radar — relevé gratuit : le profil", () => {
  it("abonnés, bio, et ses vidéos les plus récentes d'abord, chacune avec ses vues et sa date", () => {
    const p = parseFreeProfile(profil([{ id: V_SEMAINE, desc: "épinglée", playCount: 90_000 }, { id: V_NEUVE, desc: "la dernière", playCount: "320", coverUrl: "https://c/1.jpg" }, { id: V_HIER, playCount: 1_200 }]));
    expect(p).toEqual({
      fans: 1_840,
      bio: "J'utilise : shortfy.io",
      private: false,
      videos: [
        { videoId: V_NEUVE, caption: "la dernière", views: 320, publishedAt: NOW - 5 * HOUR, coverUrl: "https://c/1.jpg" },
        { videoId: V_HIER, caption: "", views: 1_200, publishedAt: NOW - 30 * HOUR },
        { videoId: V_SEMAINE, caption: "épinglée", views: 90_000, publishedAt: NOW - 6 * 24 * HOUR },
      ],
    });
  });

  it("la date d'une vidéo se lit dans son identifiant", () => {
    // Une vraie vidéo relevée le 12/11/2026 : publiée à 1 794 483 773 s d'après TikTok, 15 s après la date de son identifiant.
    expect(videoIdTime("7707249055482547470")).toBe(1_794_483_758_000);
    expect(Math.abs(videoIdTime("7707249055482547470") - 1_794_483_773_000)).toBeLessThan(60_000);
    expect(videoIdTime("pas un identifiant")).toBe(0);
  });

  it("un compte privé, une vidéo en double ou sans identifiant, une page sans liste", () => {
    expect(parseFreeProfile(profil([], { privateAccount: true }))?.private).toBe(true);
    expect(parseFreeProfile(profil([{ id: V_NEUVE }, { id: V_NEUVE }, { id: "abc" }, { id: "" }]))?.videos.map((v) => v.videoId)).toEqual([V_NEUVE]);
    expect(parseFreeProfile("<html>ratelimit triggered</html>")).toBeNull();
    expect(parseFreeProfile('<html>"videoList":[]</html>')).toBeNull();
  });
});

describe("Radar — relevé gratuit : la page d'une vidéo", () => {
  it("rend tout ce que le relevé payant donnait, dans la même forme", () => {
    expect(parseFreeVideo(video(V_NEUVE), "lea.revise")).toEqual({
      videoId: V_NEUVE,
      url: `https://www.tiktok.com/@lea.revise/video/${V_NEUVE}`,
      authorId: "7276822206176609312",
      authorHandle: "lea.revise",
      authorFans: 1_700,
      caption: "pq j’apprends ça que mtn 😭 @Koro AI #argent",
      lang: "fr",
      region: "FR",
      publishedAt: NOW - 5 * HOUR,
      durationSec: 65,
      coverUrl: "https://p16.tiktokcdn.com/cover.jpeg?x-expires=1",
      isAd: false,
      views: 8_410,
      likes: 91,
      comments: 3,
      shares: 12,
      // « collectCount » arrive en texte.
      saves: 9,
      // Chaque bloc de texte sur une ligne, les blocs vides écartés.
      hook: "Le nom du site c'est koro.ai · Enregistre",
      musicId: "7706838535877200673",
      musicTitle: "son original",
      musicOwner: "lea.revise",
      // Le compte mentionné (pas un hashtag, pas l'auteur lui-même), son libellé lu dans la légende.
      mentions: [{ id: "9001", label: "@Koro AI" }],
      authorBio: "Bio lue sur la page vidéo",
    });
  });

  it("l'espagnol se range par pays, une langue inconnue en « autre », sans texte à l'écran pas de hook", () => {
    expect(parseFreeVideo(video(V_NEUVE, { textLanguage: "es", locationCreated: "MX" }), "x")).toMatchObject({ lang: "es-am", region: "MX" });
    expect(parseFreeVideo(video(V_NEUVE, { textLanguage: "es", locationCreated: "ES" }), "x")).toMatchObject({ lang: "es-es" });
    const nue = parseFreeVideo(video(V_NEUVE, { textLanguage: "un", stickersOnItem: [], textExtra: [], music: {} }), "x");
    expect(nue).toMatchObject({ lang: "autre" });
    expect(nue).not.toHaveProperty("hook");
    expect(nue).not.toHaveProperty("musicId");
    expect(nue).not.toHaveProperty("mentions");
  });

  it("une vidéo supprimée est « gone » ; une page refusée ou vide ne se lit pas", () => {
    expect(parseFreeVideo(supprimee, "x")).toBe("gone");
    expect(parseFreeVideo("<html>ratelimit triggered</html>", "x")).toBeNull();
    expect(parseFreeVideo('<html><script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application/json">{pas du json</script></html>', "x")).toBeNull();
    expect(parseFreeVideo(video(V_NEUVE, { createTime: "0" }), "x")).toBeNull();
  });
});

describe("Radar — relevé gratuit : ce qu'on lit en entier", () => {
  const liste = [V_NEUVE, V_HIER, V_SEMAINE, V_VIEILLE].map((videoId, i) => ({ videoId, caption: "", views: 100 * (i + 1), publishedAt: videoIdTime(videoId), ...(i === 2 ? { coverUrl: "https://c/3.jpg" } : {}) }));

  it("une vidéo inconnue, ou de moins de 48 heures, est lue sur sa page ; les autres ne reçoivent que leurs vues", () => {
    expect(FREE_FRESH_MS).toBe(48 * HOUR);
    const known: KnownVideo[] = [{ videoId: V_HIER }, { videoId: V_SEMAINE }];
    const plan = freePlan(liste, known, NOW);
    // La neuve et la vieille sont inconnues ; celle d'hier est connue mais fraîche.
    expect(plan.detail.map((v) => v.videoId)).toEqual([V_NEUVE, V_HIER, V_VIEILLE]);
    expect(plan.light).toEqual([{ videoId: V_SEMAINE, views: 300, coverUrl: "https://c/3.jpg" }]);
    // Tout est connu et ancien : aucune page vidéo à lire.
    expect(freePlan(liste.slice(2), [{ videoId: V_SEMAINE }, { videoId: V_VIEILLE }], NOW).detail).toEqual([]);
  });

  it("un compte sans pays : deux de ses vidéos rangées dont on ignore le pays sont relues, pas plus", () => {
    expect(FREE_REGION_PAGES).toBe(2);
    const V_MOIS = idAt(NOW - 30 * 24 * HOUR, 5);
    const cinq = [...liste, { videoId: V_MOIS, caption: "", views: 500, publishedAt: videoIdTime(V_MOIS) }];
    const known: KnownVideo[] = [{ videoId: V_HIER }, { videoId: V_SEMAINE }, { videoId: V_VIEILLE }, { videoId: V_MOIS }];
    // Les deux rangées les plus récentes (hors celle d'hier, fraîche, relue de toute façon) ; la troisième garde ses vues.
    const plan = freePlan(cinq, known, NOW, true);
    expect(plan.detail.map((v) => v.videoId)).toEqual([V_NEUVE, V_HIER, V_SEMAINE, V_VIEILLE]);
    expect(plan.light.map((v) => v.videoId)).toEqual([V_MOIS]);
    // Une vidéo dont le pays est déjà rangé n'est pas relue pour ça : la suivante l'est.
    const situee = freePlan(cinq, [{ videoId: V_HIER }, { videoId: V_SEMAINE, region: "FR" }, { videoId: V_VIEILLE }, { videoId: V_MOIS }], NOW, true);
    expect(situee.detail.map((v) => v.videoId)).toEqual([V_NEUVE, V_HIER, V_VIEILLE, V_MOIS]);
    expect(situee.light.map((v) => v.videoId)).toEqual([V_SEMAINE]);
    // Le compte a déjà un pays : rien de plus n'est lu.
    expect(freePlan(cinq, known, NOW).detail.map((v) => v.videoId)).toEqual([V_NEUVE, V_HIER]);
  });

  it("une vidéo PROGRAMMÉE : son identifiant date son téléversement, la fraîcheur se juge sur sa publication rangée (14/11)", () => {
    // Téléversée il y a 6 jours (identifiant), publiée il y a 5 heures (relevé payant, page de la vidéo) : fraîche.
    const programmee: KnownVideo = { videoId: V_SEMAINE, publishedAt: NOW - 5 * HOUR };
    expect(freePlan(liste, [{ videoId: V_HIER }, programmee, { videoId: V_VIEILLE }], NOW).detail.map((v) => v.videoId)).toEqual([V_NEUVE, V_HIER, V_SEMAINE]);
    // Sans date rangée, l'identifiant décide encore (ancienne : seules ses vues).
    expect(freePlan(liste, [{ videoId: V_HIER }, { videoId: V_SEMAINE }, { videoId: V_VIEILLE }], NOW).detail.map((v) => v.videoId)).toEqual([V_NEUVE, V_HIER]);
    // Et l'inverse : rangée publiée il y a 3 jours, même si l'identifiant la dit d'il y a 5 heures.
    expect(freePlan(liste, [{ videoId: V_NEUVE, publishedAt: NOW - 72 * HOUR }, { videoId: V_HIER }, { videoId: V_SEMAINE }, { videoId: V_VIEILLE }], NOW).detail.map((v) => v.videoId)).toEqual([V_HIER]);
  });
});

describe("Radar — relevé gratuit : la liste trouée (14/11/2026)", () => {
  const liste = [V_NEUVE, V_HIER, V_SEMAINE].map((videoId) => ({ videoId, caption: "", views: 1, publishedAt: videoIdTime(videoId) }));

  it("la dernière vidéo qu'on avait du compte n'est plus dans sa liste : trou", () => {
    expect(listGap(liste, { videoId: V_SEMAINE, publishedAt: videoIdTime(V_SEMAINE) })).toBe(false);
    expect(listGap(liste, { videoId: V_VIEILLE, publishedAt: videoIdTime(V_VIEILLE) })).toBe(true);
    // Rien de connu (compte jamais relevé, ou vidéo déjà vérifiée supprimée) : pas de contrôle.
    expect(listGap(liste, null)).toBe(false);
    expect(listGap([], { videoId: V_VIEILLE, publishedAt: 0 })).toBe(false);
  });

  it("le relevé payant d'un trou s'arrête à la vidéo retrouvée, ou passé sa date sans la voir ; 3 pages au plus", () => {
    expect(GAP_PAGES).toBe(3);
    const cible = { videoId: V_SEMAINE, publishedAt: videoIdTime(V_SEMAINE) };
    expect(gapReached(liste.slice(0, 2), cible)).toEqual({ done: false, found: false });
    expect(gapReached(liste, cible)).toEqual({ done: true, found: true });
    // Une vidéo plus ancienne que la cible est arrivée, sans la cible : elle n'est plus en ligne.
    expect(gapReached([liste[0], { videoId: V_VIEILLE, publishedAt: videoIdTime(V_VIEILLE) }], cible)).toEqual({ done: true, found: false });
  });
});

describe("Radar — relevé gratuit : le trou vérifié sur la page de la vidéo (20/11/2026)", () => {
  // La dernière vidéo qu'on a du compte, publiée il y a 3 jours, absente de sa liste.
  const V_PARTIE = idAt(NOW - 3 * 24 * HOUR, 5);
  const newest = { videoId: V_PARTIE, publishedAt: videoIdTime(V_PARTIE) };
  const refus = (statusCode: number, statusMsg: string) =>
    `<html><script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application/json">${JSON.stringify({ __DEFAULT_SCOPE__: { "webapp.video-detail": { statusCode, statusMsg } } })}</script></html>`;
  const listed = (ids: string[]) => ids.map((videoId) => ({ videoId, caption: "", views: 1, publishedAt: videoIdTime(videoId) }));
  const rangee = (videoId: string, publishedAt = videoIdTime(videoId)): KnownVideo => ({ videoId, publishedAt });

  it("sa page dit qu'elle n'est plus publique : supprimée, n'existe pas, visible par son autrice seule (10204)", () => {
    expect(gapGone(supprimee, V_PARTIE)).toBe(true);
    expect(gapGone(refus(10204, "video has been deleted"), V_PARTIE)).toBe(true);
    expect(gapGone(refus(10204, "item_privacy_authorization&status_self_see"), V_PARTIE)).toBe(true);
    expect(gapGone(refus(10204, ""), V_PARTIE)).toBe(true);
    // Bloquée hors de sa région : elle existe ailleurs (le relevé payant peut la voir).
    expect(gapGone(refus(10231, "cross_border_violation"), V_PARTIE)).toBe(false);
    expect(gapGone(refus(10204, "author_secret,cross_border_violation"), V_PARTIE)).toBe(false);
    // Un code inconnu, une vidéo servie (en ligne, une vidéo « photo » comprise), une page illisible : rien ne conclut.
    expect(gapGone(refus(10101, "item doesn't exist"), V_PARTIE)).toBe(false);
    expect(gapGone(video(V_PARTIE), V_PARTIE)).toBe(false);
    expect(gapGone("<html>ratelimit triggered</html>", V_PARTIE)).toBe(false);
  });

  it("ce que sa page a rendu, en un mot (la mesure) : partie, servie, hors région, autre code, illisible, refusée, absente", () => {
    // Revue du 20/11 : la mesure ne gardait qu'un booléen ; un 404 servi aux serveurs pour une vidéo partie n'aurait
    // laissé que des « trou-manque », sans dire pourquoi.
    const ok = (text: string): FreePage => ({ ok: true, text });
    const kinds: [FreePage, GapPage][] = [
      [ok(supprimee), "partie"],
      [ok(refus(10204, "item_privacy_authorization&status_self_see")), "partie"],
      [ok(refus(10204, "")), "partie"],
      [ok(video(V_PARTIE)), "servie"],
      [ok(refus(10231, "cross_border_violation")), "hors-region"],
      [ok(refus(10204, "author_secret,cross_border_violation")), "hors-region"],
      [ok(refus(10101, "item doesn't exist")), "autre-code"],
      [ok("<html>ratelimit triggered</html>"), "illisible"],
      [{ ok: false, kind: "suspect", reason: "HTTP 429" }, "refusee"],
      [{ ok: false, kind: "absent" }, "absente"],
    ];
    for (const [page, kind] of kinds) expect(gapPageKind(page, V_PARTIE)).toBe(kind);
    // « partie » si, et seulement si, gapGone : la décision et la mesure lisent la même règle.
    for (const [page, kind] of kinds) expect(kind === "partie").toBe(page.ok && gapGone(page.text, V_PARTIE));
  });

  it("la liste remonte au-delà d'elle : une vidéo DÉJÀ RANGÉE, publiée avant elle (sa vraie date), y est", () => {
    const liste = listed([V_NEUVE, V_HIER, V_SEMAINE]);
    expect(listReaches(liste, [rangee(V_SEMAINE)], newest)).toBe(true);
    // Que des vidéos sorties depuis : le compte a pu publier plus que la liste, vrai trou possible.
    expect(listReaches(listed([V_NEUVE, V_HIER]), [rangee(V_HIER)], newest)).toBe(false);
    // Une vidéo qu'on n'a pas : sa date est celle de son téléversement, elle ne prouve rien.
    expect(listReaches(liste, [], newest)).toBe(false);
    // Téléversée avant elle mais programmée, publiée après : la vraie date fait foi.
    expect(listReaches(liste, [rangee(V_SEMAINE, NOW - 2 * HOUR)], newest)).toBe(false);
    // Rangée mais plus dans la liste : elle ne dit rien de la liste.
    expect(listReaches(listed([V_NEUVE, V_HIER]), [rangee(V_SEMAINE)], newest)).toBe(false);
  });

  const P = freeProfileUrl("lea.revise");
  const U = (id: string) => freeVideoUrl("lea.revise", id);
  /** `o.bascule` : GAP_FREE_CHECK vrai (la règle en vrai) ; `o.payant` : un relevé payant peut partir au passage. */
  const read = async (
    ids: string[],
    partie: FreePage | string | undefined,
    known: KnownVideo[],
    o: { bascule?: boolean; payant?: boolean; neuve?: FreePage | string } = {},
  ) => {
    const asked: string[] = [];
    const pages: Record<string, FreePage | string | undefined> = { [P]: profil(ids.map((id) => ({ id, playCount: 500 }))), [U(V_PARTIE)]: partie, [U(V_NEUVE)]: o.neuve ?? video(V_NEUVE), [U(V_HIER)]: video(V_HIER) };
    const r = await freeRead(
      "lea.revise",
      {
        page: async (url: string): Promise<FreePage> => {
          asked.push(url);
          const p = pages[url];
          return p === undefined ? { ok: false, kind: "absent" } : typeof p === "string" ? { ok: true, text: p } : p;
        },
        known: async (ids2: string[]) => known.filter((k) => ids2.includes(k.videoId)),
        newest: async () => newest,
        ...(o.payant === undefined ? {} : { gapPage: () => o.payant! }),
      },
      NOW,
      undefined,
      false,
      o.bascule ?? GAP_FREE_CHECK,
    );
    return { r, asked };
  };
  const seen = (ids: string[], page: GapPage): GapSeen => ({ page, listed: ids, at: NOW });

  it("en mesure (GAP_FREE_CHECK faux, revue du 20/11) : la règle n'a jamais été mesurée de nos serveurs", () => {
    expect(GAP_FREE_CHECK).toBe(false);
  });

  it("en mesure : supprimée et la liste remonte — sa page est lue, la décision part avec le trou, payant comme avant", async () => {
    const ids = [V_NEUVE, V_HIER, V_SEMAINE];
    const { r, asked } = await read(ids, supprimee, [rangee(V_SEMAINE)]);
    expect(asked).toEqual([P, U(V_PARTIE)]);
    expect(r).toEqual({ ok: false, why: "gap", pages: 2, newest, seen: seen(ids, "partie") });
  });

  it("bascule : supprimée et la liste remonte — le relevé gratuit continue, la vidéo est vérifiée, sa page comptée", async () => {
    const { r, asked } = await read([V_NEUVE, V_HIER, V_SEMAINE], supprimee, [rangee(V_SEMAINE)], { bascule: true });
    expect(asked).toEqual([P, U(V_PARTIE), U(V_NEUVE), U(V_HIER)]);
    expect(r).toMatchObject({ ok: true, gapChecked: V_PARTIE, pages: 4 });
    if (!r.ok) throw new Error("relevé gratuit attendu");
    expect(r.videos.map((v) => v.videoId)).toEqual([V_NEUVE, V_HIER]);
    expect(r.light.map((v) => v.videoId)).toEqual([V_SEMAINE]);
  });

  it("bascule : trou vérifié puis page d'une vidéo inconnue illisible — le payant reprend le trou (newest), page après page", async () => {
    // Revue du 20/11 : sans `newest`, le repli ne lisait qu'UNE page (10 vidéos), plus faible que le « trou » d'avant.
    for (const neuve of ["<html>ratelimit triggered</html>", { ok: false, kind: "suspect", reason: "HTTP 429" } as FreePage]) {
      const { r, asked } = await read([V_NEUVE, V_HIER, V_SEMAINE], supprimee, [rangee(V_SEMAINE)], { bascule: true, neuve });
      expect(r).toEqual({ ok: false, why: "detail", pages: 3, newest });
      expect(asked).toEqual([P, U(V_PARTIE), U(V_NEUVE)]);
    }
    // En mesure, la même liste s'arrête au trou, avant toute page de vidéo.
    expect((await read([V_NEUVE, V_HIER, V_SEMAINE], supprimee, [rangee(V_SEMAINE)], { neuve: "<html>x</html>" })).r).toMatchObject({ ok: false, why: "gap", pages: 2, newest });
    // Sans trou, une page illisible ne porte pas de vidéo à retrouver (le payant d'une page, comme avant).
    expect((await read([V_NEUVE, V_PARTIE, V_SEMAINE], supprimee, [rangee(V_PARTIE)], { bascule: true, neuve: "<html>x</html>" })).r).toEqual({ ok: false, why: "detail", pages: 2 });
  });

  it("aucun relevé payant possible au passage (part nulle : réserve, poste coupé, jour épuisé) : trou sans lire sa page", async () => {
    // Revue du 20/11 : le compte reste dû, et sa page serait relue à chaque passage pour rien.
    for (const bascule of [false, true]) {
      const { r, asked } = await read([V_NEUVE, V_HIER, V_SEMAINE], supprimee, [rangee(V_SEMAINE)], { bascule, payant: false });
      expect(r).toEqual({ ok: false, why: "gap", pages: 1, newest });
      expect(asked).toEqual([P]);
    }
    expect((await read([V_NEUVE, V_HIER, V_SEMAINE], supprimee, [rangee(V_SEMAINE)], { payant: true })).asked).toEqual([P, U(V_PARTIE)]);
  });

  it("supprimée mais la liste ne remonte pas : trou, sans lire sa page", async () => {
    const { r, asked } = await read([V_NEUVE, V_HIER], supprimee, [rangee(V_HIER)]);
    expect(r).toEqual({ ok: false, why: "gap", pages: 1, newest });
    expect(asked).toEqual([P]);
    // Une vieille vidéo qu'on n'a pas (date de téléversement seule) ne suffit pas.
    expect((await read([V_NEUVE, V_HIER, V_VIEILLE], supprimee, [])).r).toEqual({ ok: false, why: "gap", pages: 1, newest });
  });

  it("en ligne, bloquée hors de sa région, code inconnu, page illisible, refusée ou absente : trou, payant comme avant", async () => {
    const liste = [V_NEUVE, V_HIER, V_SEMAINE];
    const cases: [FreePage | string | undefined, GapPage][] = [
      [video(V_PARTIE), "servie"],
      [refus(10231, "cross_border_violation"), "hors-region"],
      [refus(10101, "item doesn't exist"), "autre-code"],
      ["<html>ratelimit triggered</html>", "illisible"],
      [{ ok: false, kind: "suspect", reason: "HTTP 429" }, "refusee"],
      [undefined, "absente"],
    ];
    for (const [partie, kind] of cases) {
      for (const bascule of [false, true]) {
        const { r, asked } = await read(liste, partie, [rangee(V_SEMAINE)], { bascule });
        // La décision part avec le genre de page : la mesure le ventile (trou-manque:servie, trou-manque:absente…).
        expect(r).toEqual({ ok: false, why: "gap", pages: 2, newest, seen: seen(liste, kind) });
        expect(asked).toEqual([P, U(V_PARTIE)]);
      }
    }
  });

  it("pas de trou : sa page n'est pas lue, rien n'est marqué", async () => {
    const { r, asked } = await read([V_NEUVE, V_PARTIE, V_SEMAINE], supprimee, [rangee(V_PARTIE), rangee(V_SEMAINE)]);
    expect(asked).toEqual([P, U(V_NEUVE)]);
    expect(r).toMatchObject({ ok: true, pages: 2 });
    expect(r).not.toHaveProperty("gapChecked");
  });
});

describe("Radar — le trou en mesure : la page contre le payant, côte à côte (gapMeasure, revue du 20/11/2026)", () => {
  const V_PARTIE = idAt(NOW - 3 * 24 * HOUR, 5);
  const newest = { videoId: V_PARTIE, publishedAt: videoIdTime(V_PARTIE) };
  const v = (videoId: string, publishedAt = videoIdTime(videoId)) => ({ videoId, publishedAt });
  const V_PHOTO = idAt(NOW - 2 * 24 * HOUR, 6);
  // La liste du profil lue par la voie : deux vidéos sorties depuis, une plus ancienne qu'elle (la liste remonte).
  const listed = [V_NEUVE, V_HIER, V_SEMAINE];
  const page = (kind: boolean | GapPage): GapSeen => ({ page: kind === true ? "partie" : kind === false ? "servie" : kind, listed, at: NOW });
  const lu = (videos: { videoId: string; publishedAt: number }[], reached = { done: true, found: false }) => ({ outcome: "read" as const, videos, reached });

  it("accord : la page la dit partie, le payant passe sa date sans la voir ni rien rapporter que la liste n'avait — la page aurait suffi", () => {
    expect(gapMeasure(page(true), lu([v(V_NEUVE), v(V_HIER), v(V_SEMAINE)]), newest)).toBe("trou-egal");
    // Une épinglée plus ancienne rapportée par le payant ne compte pas : elle n'est pas « plus récente qu'elle ».
    expect(gapMeasure(page(true), lu([v(V_NEUVE), v(V_VIEILLE)]), newest)).toBe("trou-egal");
  });

  it("désaccord : la page la dit partie, mais le payant la retrouve, ou rapporte une publication que la liste n'a pas (photo)", () => {
    expect(gapMeasure(page(true), lu([v(V_NEUVE), v(V_PARTIE)], { done: true, found: true }), newest)).toBe("trou-ecart");
    expect(gapMeasure(page(true), lu([v(V_NEUVE), v(V_PHOTO), v(V_SEMAINE)]), newest)).toBe("trou-ecart");
  });

  it("une publication sortie après le début du passage ne compte pas : la liste ne pouvait pas l'avoir", () => {
    const apres = v(idAt(NOW + 2 * 60_000, 7));
    expect(gapMeasure(page(true), lu([apres, v(V_NEUVE), v(V_SEMAINE)]), newest)).toBe("trou-egal");
  });

  it("la page ne concluait pas : économie manquée si le payant n'a rien de plus, payant utile sinon — par genre de page", () => {
    expect(gapMeasure(page(false), lu([v(V_NEUVE), v(V_SEMAINE)]), newest)).toBe("trou-manque:servie");
    expect(gapMeasure(page(false), lu([v(V_NEUVE), v(V_PARTIE)], { done: true, found: true }), newest)).toBe("trou-paye:servie");
    expect(gapMeasure(page(false), lu([v(V_PHOTO), v(V_SEMAINE)]), newest)).toBe("trou-paye:servie");
    // Revue du 20/11 : ce que les serveurs reçoivent pour une vidéo partie n'a jamais été vu ; un 404 (absente), une
    // page sans données (illisible) ou un autre code se lisent dans radarUsage.measured, compteur par compteur.
    for (const k of ["hors-region", "autre-code", "illisible", "refusee", "absente"] as const) {
      expect(gapMeasure(page(k), lu([v(V_NEUVE), v(V_SEMAINE)]), newest)).toBe(`trou-manque:${k}`);
      expect(gapMeasure(page(k), lu([v(V_NEUVE), v(V_PARTIE)], { done: true, found: true }), newest)).toBe(`trou-paye:${k}`);
    }
  });

  it("le payant n'a pas conclu (première page refusée, plus de crédits, trois pages sans passer sa date) : panne, rien de décidé", () => {
    expect(gapMeasure(page(true), { outcome: "error", videos: [], reached: { done: false, found: false } }, newest)).toBe("trou-panne");
    expect(gapMeasure(page(true), { outcome: "stop", videos: [v(V_NEUVE)], reached: { done: false, found: false } }, newest)).toBe("trou-panne");
    expect(gapMeasure(page(false), lu([v(V_NEUVE), v(V_HIER)], { done: false, found: false }), newest)).toBe("trou-panne");
  });

  it("appels évités d'un relevé gratuit réussi : l'échec retenu (« repli »), sinon le trou vérifié (« trou »), un seul pour les deux", () => {
    expect(freeReadSaved({}, {})).toEqual({});
    expect(freeReadSaved({ gapChecked: V_PARTIE }, {})).toEqual({ trou: 1 });
    expect(freeReadSaved({}, { freeMissAt: NOW - 10 * 60_000 })).toEqual({ repli: 1 });
    expect(freeReadSaved({ gapChecked: V_PARTIE }, { freeMissAt: NOW - 10 * 60_000 })).toEqual({ repli: 1 });
  });
});

describe("Radar — relevé gratuit : ce qui attend la voie, ce qui part au payant (14/11/2026)", () => {
  const MIN = 60_000;
  const acc = (name: string, dueMinAgo: number, postHoursAgo?: number) => ({
    name,
    dueAt: NOW - dueMinAgo * MIN,
    ...(postHoursAgo !== undefined ? { lastPostAt: NOW - postHoursAgo * HOUR } : {}),
  });

  it("d'abord les comptes qui ont publié ces dernières 24 heures, puis les plus en retard", () => {
    expect(LANE_FRESH_POST_MS).toBe(24 * HOUR);
    const order = laneOrder([acc("calme", 300, 72), acc("frais-recent", 5, 18), acc("vieux", 500), acc("frais-ancien", 30, 20)], NOW).map((a) => a.name);
    expect(order).toEqual(["frais-ancien", "frais-recent", "vieux", "calme"]);
  });

  it("voie ouverte : un compte frais attend 20 min, un autre 1 h ; au-delà, payant « retard »", () => {
    expect([LANE_WAIT_FRESH_MS, LANE_WAIT_MS]).toEqual([20 * MIN, 60 * MIN]);
    const r = overflowToPay([acc("frais-19", 19, 18), acc("frais-20", 20, 18), acc("calme-59", 59, 72), acc("calme-60", 60, 72), acc("jamais-publie", 61)], true, NOW);
    expect(r.reason).toBe("retard");
    expect(r.pay.map((a) => a.name)).toEqual(["frais-20", "calme-60", "jamais-publie"]);
  });

  it("voie fermée (coupe-circuit) : tout ce qui n'a pas été pris part au payant, comme avant", () => {
    const r = overflowToPay([acc("a", 0, 1), acc("b", 1)], false, NOW);
    expect(r).toEqual({ pay: [acc("a", 0, 1), acc("b", 1)], reason: "coupure" });
  });

  it("le premier relevé passe aussi par la voie gratuite, APRÈS les comptes déjà suivis, 300 au plus par passage (16/11/2026)", () => {
    const neuf = (name: string) => ({ ...acc(name, 1), first: true });
    const suivi = (name: string, dueMinAgo: number, postHoursAgo?: number) => ({ ...acc(name, dueMinAgo, postHoursAgo), first: false });
    // Les comptes suivis d'abord (sinon, pas lus à temps, ils partent au payant « retard ») ; les nouveaux ensuite.
    const q = laneQueue([suivi("calme", 300, 72), neuf("neuf-1"), suivi("frais", 5, 18), neuf("neuf-2")], NOW).map((a) => a.name);
    expect(q).toEqual(["frais", "calme", "neuf-1", "neuf-2"]);
    expect(FIRST_FREE_PER_PASS).toBe(300);
    const beaucoup = Array.from({ length: 350 }, (_, i) => neuf(`n${i}`));
    const q2 = laneQueue([...beaucoup, suivi("calme", 300, 72)], NOW);
    expect(q2).toHaveLength(301);
    expect(q2[0].name).toBe("calme");
  });

  it("un premier relevé raté : payant, ou il attend au palier survie ; pas atteint : il attend, sauf voie fermée", () => {
    expect(firstReadMisses(["a"], ["b"], true, false)).toEqual({ pay: ["a"], defer: [] });
    expect(firstReadMisses(["a"], ["b"], false, false)).toEqual({ pay: ["a", "b"], defer: [] });
    expect(firstReadMisses(["a"], ["b"], true, true)).toEqual({ pay: [], defer: ["a"] });
    expect(firstReadMisses(["a"], ["b"], false, true)).toEqual({ pay: [], defer: ["a"] });
  });
});

describe("Radar — relevé gratuit : le relevé d'un compte, de bout en bout", () => {
  const io = (pages: Record<string, FreePage | string>, known: KnownVideo[] = []) => {
    const asked: string[] = [];
    return {
      asked,
      page: async (url: string): Promise<FreePage> => {
        asked.push(url);
        const p = pages[url];
        return p === undefined ? { ok: false, kind: "absent" } : typeof p === "string" ? { ok: true, text: p } : p;
      },
      known: async (ids: string[]) => known.filter((k) => ids.includes(k.videoId)),
    };
  };
  const P = freeProfileUrl("lea.revise");
  const U = (id: string) => freeVideoUrl("lea.revise", id);
  const liste = profil([{ id: V_NEUVE, playCount: 9_000 }, { id: V_HIER, playCount: 1_200 }, { id: V_SEMAINE, playCount: 300, coverUrl: "https://c/3.jpg" }]);

  it("lit la vidéo inconnue et la vidéo fraîche sur leur page, donne ses vues à l'ancienne, et le profil fait foi", async () => {
    const t = io({ [P]: liste, [U(V_NEUVE)]: video(V_NEUVE), [U(V_HIER)]: video(V_HIER, {}, { playCount: 1_100 }) }, [
      { videoId: V_HIER, hook: "Texte rangé à son premier relevé", musicId: "111", musicTitle: "Son rangé" },
      { videoId: V_SEMAINE },
    ]);
    const r = await freeRead("lea.revise", t, NOW);
    expect(t.asked).toEqual([P, U(V_NEUVE), U(V_HIER)]);
    expect(r).toMatchObject({ ok: true, pages: 3, profile: { fans: 1_840, bio: "J'utilise : shortfy.io" }, light: [{ videoId: V_SEMAINE, views: 300, coverUrl: "https://c/3.jpg" }] });
    if (!r.ok) throw new Error("attendu : relevé gratuit");
    // Les abonnés et la bio du PROFIL, et les vues les plus hautes des deux pages.
    expect(r.videos.map((v) => [v.videoId, v.authorFans, v.authorBio, v.views])).toEqual([
      [V_NEUVE, 1_840, "J'utilise : shortfy.io", 9_000],
      [V_HIER, 1_840, "J'utilise : shortfy.io", 1_200],
    ]);
    // La vidéo inconnue prend le texte à l'écran et le son de sa page ; la vidéo déjà rangée garde les siens.
    expect([r.videos[0].hook, r.videos[0].musicId]).toEqual(["Le nom du site c'est koro.ai · Enregistre", "7706838535877200673"]);
    expect([r.videos[1].hook, r.videos[1].musicId, r.videos[1].musicTitle]).toEqual(["Texte rangé à son premier relevé", "111", "Son rangé"]);
  });

  it("le profil ne se lit pas, est privé ou vide : le compte passe au relevé payant, sans page de plus", async () => {
    for (const [page, why] of [
      [{ ok: false, kind: "suspect" }, "suspect"],
      [{ ok: false, kind: "absent" }, "absent"],
      ["<html>ratelimit triggered</html>", "suspect"],
      [profil([{ id: V_NEUVE }], { privateAccount: true }), "private"],
      [profil([]), "empty"],
    ] as const) {
      const t = io({ [P]: page as FreePage | string });
      expect(await freeRead("lea.revise", t, NOW)).toMatchObject({ ok: false, why, pages: 1 });
      expect(t.asked).toEqual([P]);
    }
  });

  it("une vidéo INCONNUE dont la page ne se lit pas : relevé payant ; une vidéo connue garde ses vues ; une vidéo supprimée sort", async () => {
    // La neuve est inconnue et sa page est refusée.
    expect(await freeRead("lea.revise", io({ [P]: liste, [U(V_NEUVE)]: { ok: false, kind: "suspect" }, [U(V_HIER)]: video(V_HIER) }, [{ videoId: V_HIER }, { videoId: V_SEMAINE }]), NOW)).toEqual({ ok: false, why: "detail", pages: 2 });
    // Celle d'hier est connue, sa page est refusée : ses vues suffisent. La neuve a été supprimée entre-temps.
    const r = await freeRead("lea.revise", io({ [P]: liste, [U(V_NEUVE)]: supprimee, [U(V_HIER)]: { ok: false, kind: "suspect" } }, [{ videoId: V_HIER }, { videoId: V_SEMAINE }]), NOW);
    expect(r).toMatchObject({ ok: true, videos: [], pages: 3 });
    if (r.ok) expect(r.light.map((l) => [l.videoId, l.views])).toEqual([[V_SEMAINE, 300], [V_HIER, 1_200]]);
  });

  it("un compte sans pays : sa vidéo rangée est relue pour le situer, garde son texte ; si sa page manque, ses vues suffisent", async () => {
    const known: KnownVideo[] = [{ videoId: V_HIER, region: "GB" }, { videoId: V_SEMAINE, hook: "Texte rangé" }];
    const pages = { [P]: liste, [U(V_NEUVE)]: video(V_NEUVE), [U(V_HIER)]: video(V_HIER), [U(V_SEMAINE)]: video(V_SEMAINE, { locationCreated: "BE" }, { playCount: 250 }) };
    const t = io(pages, known);
    const r = await freeRead("lea.revise", t, NOW, undefined, true);
    expect(t.asked).toEqual([P, U(V_NEUVE), U(V_HIER), U(V_SEMAINE)]);
    if (!r.ok) throw new Error("attendu : relevé gratuit");
    // Le pays de la vidéo rangée est lu sur sa page ; son texte reste celui déjà rangé, ses vues les plus hautes des deux pages.
    expect(r.videos.map((v) => [v.videoId, v.region, v.hook, v.views])).toEqual([
      [V_NEUVE, "FR", "Le nom du site c'est koro.ai · Enregistre", 9_000],
      [V_HIER, "FR", undefined, 8_410],
      [V_SEMAINE, "BE", "Texte rangé", 300],
    ]);
    expect(r.light).toEqual([]);
    // Sa page est absente, supprimée ou refusée : la vidéo reçoit ses vues comme à tout autre relevé, rien n'est perdu.
    for (const manque of [undefined, supprimee, { ok: false, kind: "suspect" } as FreePage]) {
      const sans = await freeRead("lea.revise", io({ ...pages, [U(V_SEMAINE)]: manque as FreePage | string }, known), NOW, undefined, true);
      expect(sans).toMatchObject({ ok: true, pages: 4, light: [{ videoId: V_SEMAINE, views: 300, coverUrl: "https://c/3.jpg" }] });
      if (sans.ok) expect(sans.videos.map((v) => v.videoId)).toEqual([V_NEUVE, V_HIER]);
    }
    // Le compte a déjà un pays : la vidéo rangée n'est pas relue.
    const deja = io(pages, known);
    await freeRead("lea.revise", deja, NOW);
    expect(deja.asked).toEqual([P, U(V_NEUVE), U(V_HIER)]);
  });
});

describe("Radar — relevé gratuit : second essai et coupe-circuit", () => {
  it("une page refusée est redemandée une fois, après une pause ; une page absente ou lue ne l'est pas", async () => {
    const serie = (answers: FreePage[]) => {
      let i = 0;
      let pauses = 0;
      const page = retrying(async () => answers[Math.min(i++, answers.length - 1)], async () => void pauses++);
      return { page, calls: () => i, pauses: () => pauses };
    };
    const refus: FreePage = { ok: false, kind: "suspect" };
    const lue: FreePage = { ok: true, text: "x" };
    const a = serie([refus, lue]);
    expect(await a.page("u")).toEqual(lue);
    expect([a.calls(), a.pauses()]).toEqual([2, 1]);
    const b = serie([refus, refus, lue]);
    expect(await b.page("u")).toEqual(refus);
    expect(b.calls()).toBe(2);
    const c = serie([{ ok: false, kind: "absent" }, lue]);
    expect(await c.page("u")).toEqual({ ok: false, kind: "absent" });
    expect([c.calls(), c.pauses()]).toEqual([1, 0]);
    const d = serie([lue]);
    await d.page("u");
    expect([d.calls(), d.pauses()]).toEqual([1, 0]);
  });

  it("six profils refusés d'affilée éteignent le relevé gratuit pour le passage ; un profil absent ou privé non", () => {
    expect(FREE_BREAKER).toBe(6);
    let s = freeStart();
    for (let i = 0; i < 5; i++) s = freeNote(s, "suspect");
    expect([s.on, s.fallback, s.streak, s.stopped]).toEqual([true, 5, 5, null]);
    // Un relevé réussi remet le compteur à zéro.
    expect(freeNote(s, "ok")).toMatchObject({ on: true, ok: 1, streak: 0 });
    // Un profil absent, privé, vide, ou une vidéo illisible : un repli, pas un refus de TikTok.
    for (const autre of ["absent", "private", "empty", "detail"] as const) expect(freeNote(s, autre)).toMatchObject({ on: true, fallback: 6, streak: 0 });
    s = freeNote(s, "suspect");
    expect(s).toEqual({ on: false, ok: 0, fallback: 6, streak: 6, stopped: "6 profils refusés d'affilée" });
  });
});

describe("Radar — relevé gratuit : la voie gratuite d'un passage (13/11/2026)", () => {
  it("un profil que TikTok ne sert pas dit pourquoi, et l'arrêt du passage le répète", async () => {
    const P = freeProfileUrl("lea.revise");
    const io = (page: FreePage | string) => ({ page: async (): Promise<FreePage> => (typeof page === "string" ? { ok: true, text: page } : page), known: async () => [] });
    expect(await freeRead("lea.revise", io({ ok: false, kind: "suspect", reason: "HTTP 429" }), NOW)).toEqual({ ok: false, why: "suspect", pages: 1, reason: "HTTP 429" });
    expect(await freeRead("lea.revise", io("<html>ratelimit triggered</html>"), NOW)).toEqual({ ok: false, why: "suspect", pages: 1, reason: "page sans profil" });
    expect(await freeRead("lea.revise", io({ ok: false, kind: "absent" }), NOW)).toEqual({ ok: false, why: "absent", pages: 1 });
    expect(P).toContain("/embed/@lea.revise");
    let s = freeStart();
    for (let i = 0; i < FREE_BREAKER; i++) s = freeNote(s, "suspect", "HTTP 429");
    expect(s.stopped).toBe("6 profils refusés d'affilée (HTTP 429)");
  });

  it("une pause AVANT chaque page", async () => {
    const order: string[] = [];
    const page = paced(
      async (url) => {
        order.push(`page ${url}`);
        return { ok: true, text: "" };
      },
      async () => void order.push("pause"),
    );
    await page("a");
    await page("b");
    expect(order).toEqual(["pause", "page a", "pause", "page b"]);
  });

  type Out = { ok: true } | { ok: false; why: "absent" | "suspect" | "private" | "empty" | "detail" | "gap"; reason?: string };
  const lane = (issues: Record<string, Out>, alive: () => boolean = () => true) => {
    const read: string[] = [];
    return {
      read,
      run: runFreeLane(Object.keys(issues), async (h) => (read.push(h), issues[h]), alive),
    };
  };
  const ok: Out = { ok: true };
  const refus: Out = { ok: false, why: "suspect", reason: "HTTP 403" };

  it("7 minutes de voie (16/11/2026), une minute au moins pour le payant de ce qu'elle rate, avant le passage suivant", () => {
    expect(FREE_LANE_MAX_MS).toBe(7 * 60_000);
    expect(PASS_MAX_MS - FREE_LANE_MAX_MS).toBeGreaterThanOrEqual(60_000);
    expect(PASS_MAX_MS).toBeLessThan(10 * 60_000);
  });

  it("un compte après l'autre ; ce que le gratuit ne relève pas part au payant, avec son motif", async () => {
    const t = lane({ a: ok, b: { ok: false, why: "private" }, c: ok, d: { ok: false, why: "detail" }, e: refus, f: ok });
    const r = await t.run;
    expect(t.read).toEqual(["a", "b", "c", "d", "e", "f"]);
    expect(r.failed.map((m) => [m.account, m.why])).toEqual([["b", "private"], ["d", "detail"], ["e", "suspect"]]);
    expect(r.notReached).toEqual([]);
    expect(r.state).toMatchObject({ on: true, ok: 3, fallback: 3, stopped: null });
  });

  it("six profils refusés d'affilée : la voie se ferme, le reste du passage part au payant SANS être demandé", async () => {
    const issues: Record<string, Out> = { a: ok };
    for (let i = 1; i <= 6; i++) issues[`r${i}`] = refus;
    issues.x = ok;
    issues.y = ok;
    const t = lane(issues);
    const r = await t.run;
    expect(t.read).toEqual(["a", "r1", "r2", "r3", "r4", "r5", "r6"]);
    expect(r.failed.map((m) => m.account)).toEqual(["r1", "r2", "r3", "r4", "r5", "r6"]);
    // Pas demandés : la voie fermée les rend à `overflowToPay`, qui les paie tous (« coupure »).
    expect(r.notReached).toEqual(["x", "y"]);
    expect(r.state).toMatchObject({ on: false, ok: 1, fallback: 6, stopped: "6 profils refusés d'affilée (HTTP 403)" });
  });

  it("le temps imparti écoulé : les comptes restants ne sont pas pris, la voie n'est pas « arrêtée » (ils attendent le passage suivant)", async () => {
    let left = 2;
    const t = lane({ a: ok, b: ok, c: ok, d: ok }, () => left-- > 0);
    const r = await t.run;
    expect(t.read).toEqual(["a", "b"]);
    expect(r.failed).toEqual([]);
    expect(r.notReached).toEqual(["c", "d"]);
    expect(r.state).toMatchObject({ on: true, ok: 2, fallback: 0, stopped: null });
  });

  it("une liste trouée part au payant avec la vidéo à retrouver, AVANT toute page de vidéo", async () => {
    const P = freeProfileUrl("lea.revise");
    const asked: string[] = [];
    const page = async (url: string): Promise<FreePage> => {
      asked.push(url);
      return url === P ? { ok: true, text: profil([{ id: V_NEUVE }, { id: V_HIER }]) } : { ok: false, kind: "absent" };
    };
    const newest = { videoId: V_SEMAINE, publishedAt: videoIdTime(V_SEMAINE) };
    expect(await freeRead("lea.revise", { page, known: async () => [], newest: async () => newest }, NOW)).toEqual({ ok: false, why: "gap", pages: 1, newest });
    expect(asked).toEqual([P]);
    // La dernière vidéo connue est dans la liste : relevé gratuit normal.
    expect(await freeRead("lea.revise", { page, known: async () => [], newest: async () => ({ videoId: V_HIER, publishedAt: videoIdTime(V_HIER) }) }, NOW)).toMatchObject({ ok: true, pages: 3 });
    // Une liste trouée n'est pas un refus de TikTok : le coupe-circuit ne compte pas.
    expect(freeNote(freeStart(), "gap")).toMatchObject({ on: true, fallback: 1, streak: 0 });
  });
});

describe("Radar — relevé gratuit : le repli reporté d'un passage (brique 7, 20/11/2026)", () => {
  // Le 13/11, 80 profils refusés par rafales de 5 à 20 secondes, 78 relus ensuite : un compte raté attend le passage
  // suivant (10 minutes) au lieu du relevé payant, qui ne part qu'au second échec d'affilée.
  const MIN = 60_000;
  type Acc = { name: string; dueAt: number; lastPostAt?: number; first: boolean; freeMissAt?: number };
  // Un compte suivi qui a publié il y a 18 heures (son second regard), dû depuis 3 minutes : la voie l'a pris aussitôt.
  const acc = (name: string, o: Partial<Acc> = {}): Acc => ({ name, dueAt: NOW - 3 * MIN, lastPostAt: NOW - 18 * HOUR, first: false, ...o });
  const miss = (account: Acc, why: FreeWhy = "suspect") => ({ account, why });
  const open = { laneOpen: true, capacity: Infinity, waitFirst: false };
  const names = (r: { hold: Acc[] }) => r.hold.map((a) => a.name);
  const paid = (r: { pay: { account: Acc; why: FreeWhy }[] }) => r.pay.map((m) => [m.account.name, missReason(m)]);

  it("un passage toutes les 10 minutes ; un échec retenu compte deux passages et demi ; seuls un refus et une page de vidéo illisible attendent", () => {
    expect([PASS_EVERY_MS, FREE_MISS_KEEP_MS]).toEqual([10 * MIN, 25 * MIN]);
    expect(MISS_HOLD).toEqual(["suspect", "detail"]);
  });

  it("premier échec (profil refusé, page de vidéo illisible) : pas payé, retenu ; la liste trouée part au payant comme avant", () => {
    const troue = { ...miss(acc("troue"), "gap"), newest: { videoId: V_HIER, publishedAt: videoIdTime(V_HIER) } };
    const r = holdMisses([miss(acc("refuse")), miss(acc("illisible"), "detail"), troue], open, NOW);
    expect(names(r)).toEqual(["refuse", "illisible"]);
    expect(paid(r)).toEqual([["troue", "trou"]]);
    expect(r.pay[0]).toBe(troue);
  });

  it("second échec d'affilée — retenu au passage d'avant, ou à celui d'avant encore (l'heure glisse de quelques secondes) : payé « repli »", () => {
    const r = holdMisses(
      [
        miss(acc("p-1", { dueAt: NOW - 13 * MIN, freeMissAt: NOW - 10 * MIN })),
        miss(acc("p-2", { dueAt: NOW - 45 * MIN, lastPostAt: NOW - 72 * HOUR, freeMissAt: NOW - 20 * MIN - 4_000 }), "detail"),
        miss(acc("bord", { dueAt: NOW - 30 * MIN, lastPostAt: undefined, freeMissAt: NOW - FREE_MISS_KEEP_MS })),
      ],
      open,
      NOW,
    );
    expect(r.hold).toEqual([]);
    expect(paid(r)).toEqual([["p-1", "repli"], ["p-2", "repli"], ["bord", "repli"]]);
  });

  it("échec retenu périmé (trois passages, ou hier avant une mise en pause) : le nouvel échec compte comme premier, retenu à son tour", () => {
    const r = holdMisses(
      [miss(acc("p-3", { dueAt: NOW - 35 * MIN, lastPostAt: NOW - 72 * HOUR, freeMissAt: NOW - 30 * MIN })), miss(acc("hier", { freeMissAt: NOW - 24 * HOUR }), "detail")],
      open,
      NOW,
    );
    expect(names(r)).toEqual(["p-3", "hier"]);
    expect(r.pay).toEqual([]);
  });

  it("deux passages de bout en bout : retenu, puis payé « repli » au second refus — ou compté évité s'il se lit", () => {
    const a = acc("refuse");
    expect(names(holdMisses([miss(a)], open, NOW))).toEqual(["refuse"]);
    // holdFreeMisses pose l'heure du passage ; 10 minutes plus tard, le compte est encore dû, en tête de la voie.
    const next = { ...a, freeMissAt: NOW };
    expect(paid(holdMisses([miss(next)], open, NOW + PASS_EVERY_MS))).toEqual([["refuse", "repli"]]);
    expect([heldSpared(next), heldSpared(a)]).toEqual([1, 0]);
  });

  it("jamais hors de la fenêtre de overflowToPay : ce qui attend reste dans la sienne au passage suivant, le reste est payé tout de suite", () => {
    const comptes = [
      acc("frais-9", { dueAt: NOW - 9 * MIN }),
      acc("frais-10", { dueAt: NOW - 10 * MIN }),
      acc("frais-45", { dueAt: NOW - 45 * MIN }),
      acc("calme-49", { dueAt: NOW - 49 * MIN, lastPostAt: NOW - 72 * HOUR }),
      acc("calme-50", { dueAt: NOW - 50 * MIN, lastPostAt: NOW - 72 * HOUR }),
      acc("jamais-publie-49", { dueAt: NOW - 49 * MIN, lastPostAt: undefined }),
      acc("en-retard-3h", { dueAt: NOW - 3 * HOUR, lastPostAt: NOW - 72 * HOUR }),
    ];
    const r = holdMisses(comptes.map((a) => miss(a)), open, NOW);
    expect(names(r)).toEqual(["frais-9", "calme-49", "jamais-publie-49"]);
    expect(paid(r).map(([n]) => n)).toEqual(["frais-10", "frais-45", "calme-50", "en-retard-3h"]);
    // Au début du passage suivant, tous sont encore dans leur fenêtre : la voie les prend parmi les premiers (le frais en
    // tête, les calmes avant tout compte dû depuis moins longtemps).
    expect(overflowToPay(r.hold, true, NOW + PASS_EVERY_MS).pay).toEqual([]);
    const neuf = acc("du-depuis-1-min", { dueAt: NOW + PASS_EVERY_MS - MIN, lastPostAt: NOW - 72 * HOUR });
    expect(laneOrder([neuf, ...r.hold], NOW + PASS_EVERY_MS).map((a) => a.name)).toEqual(["frais-9", "calme-49", "jamais-publie-49", "du-depuis-1-min"]);
    // Pas atteints (voie coupée par le temps, revue du 20/11 : overflowToPay juge à la fin de la voie, ~7 min plus
    // tard) : sortis de leur fenêtre, ils sont payés « retard » à la fin de ce passage — le repli d'avant, un passage plus
    // tard. Jamais au-delà : FREE_MISS_KEEP_MS couvre ce passage et le suivant.
    expect(overflowToPay(r.hold, true, NOW + PASS_EVERY_MS + FREE_LANE_MAX_MS)).toEqual({ pay: r.hold, reason: "retard" });
    // Le second regard d'un compte qui a publié il y a 18 heures (dû à H+18) : relu avant H+18 h 20, ou payé vers
    // H+18 h 28 au plus tard, loin de H+24.
    expect(r.hold[0].dueAt + PASS_EVERY_MS + FREE_LANE_MAX_MS - (r.hold[0].lastPostAt ?? 0)).toBeLessThan(LANE_FRESH_POST_MS);
  });

  it("coupe-circuit (voie fermée) : tout part au payant tout de suite, comme ce qu'elle n'a pas pris (« coupure »)", () => {
    const r = holdMisses([miss(acc("a")), miss(acc("b"), "detail")], { ...open, laneOpen: false }, NOW);
    expect(r.hold).toEqual([]);
    expect(paid(r)).toEqual([["a", "repli"], ["b", "repli"]]);
  });

  it("pas de budget payant au passage : rien n'est retenu (rien ne serait parti : pas d'appel évité à compter)", () => {
    const r = holdMisses([miss(acc("a"))], { ...open, capacity: 0 }, NOW);
    expect([r.hold, r.pay.length]).toEqual([[], 1]);
  });

  it("part payante saturée : seuls les ratés que le passage aurait payés sont retenus, leur part gardée (aucun payé ne la perd)", () => {
    // Revue du 20/11 : 2 crédits pour 5 refus — sans la brique, 2 payés, 3 restés dus et relus gratuitement sans rien
    // éviter. Avec elle, 2 retenus (2 appels évités), les 3 autres comme avant.
    const cinq = ["a", "b", "c", "d", "e"].map((x) => miss(acc(x)));
    const r = holdMisses(cinq, { ...open, capacity: 2 }, NOW);
    expect([names(r), paid(r).map(([x]) => x)]).toEqual([["a", "b"], ["c", "d", "e"]]);
    // La part se prend dans l'ordre où le passage paie : premiers relevés, puis comptes suivis, au coût le plus haut de
    // chacun (un trou : GAP_PAGES pages).
    expect([missCost({}), missCost({ newest: { videoId: V_HIER, publishedAt: 0 } })]).toEqual([1, GAP_PAGES]);
    const troue = { ...miss(acc("troue"), "gap"), newest: { videoId: V_HIER, publishedAt: videoIdTime(V_HIER) } };
    const neuf = miss(acc("neuf", { first: true, lastPostAt: undefined }));
    expect(names(holdMisses([troue, miss(acc("x")), neuf], { ...open, capacity: 4 }, NOW))).toEqual(["neuf"]);
    expect(names(holdMisses([troue, miss(acc("x")), neuf], { ...open, capacity: 5 }, NOW))).toEqual(["x", "neuf"]);
    // Au palier survie, un premier relevé ne paie rien (il attend) : il ne prend pas de part.
    expect(names(holdMisses([neuf, miss(acc("x"))], { ...open, capacity: 1, waitFirst: true }, NOW))).toEqual(["x"]);
  });

  it("premier relevé : même règle, sa fenêtre court depuis son entrée ; au palier survie, il attend l'heure habituelle sans rien payer", () => {
    const neuf = (name: string, o: Partial<Acc> = {}) => acc(name, { first: true, lastPostAt: undefined, dueAt: NOW - 5 * MIN, ...o });
    const r = holdMisses([miss(neuf("entre")), miss(neuf("deja-rate", { freeMissAt: NOW - 10 * MIN })), miss(neuf("file-2h", { dueAt: NOW - 2 * HOUR }), "detail")], open, NOW);
    expect(names(r)).toEqual(["entre"]);
    // Second échec, ou entré il y a deux heures (en dehors de sa fenêtre) : relevé payant « premier », comme avant.
    expect(firstReadMisses(r.pay.map((m) => m.account.name), [], true, false)).toEqual({ pay: ["deja-rate", "file-2h"], defer: [] });
    // Palier survie : rien n'est retenu, il attend une heure sans rien payer (firstReadMisses) — un compte suivi, lui, attend.
    const s = holdMisses([miss(neuf("entre")), miss(acc("suivi"))], { ...open, waitFirst: true }, NOW);
    expect(names(s)).toEqual(["suivi"]);
    expect(firstReadMisses(s.pay.map((m) => m.account.name), [], true, true)).toEqual({ pay: [], defer: ["entre"] });
  });
});

describe("Radar — le passage et ses ratés, dans l'ordre où il paie (missPlan, revue du 20/11/2026)", () => {
  const MIN = 60_000;
  type Acc = { name: string; dueAt: number; lastPostAt?: number; first: boolean; freeMissAt?: number };
  const acc = (name: string, o: Partial<Acc> = {}): Acc => ({ name, dueAt: NOW - 3 * MIN, lastPostAt: NOW - 18 * HOUR, first: false, ...o });
  const neuf = (name: string, o: Partial<Acc> = {}) => acc(name, { first: true, lastPostAt: undefined, dueAt: NOW - 5 * MIN, ...o });
  const miss = (account: Acc, why: FreeWhy = "suspect"): LaneMiss<Acc> => ({ account, why });
  const pass = (o: Partial<{ laneOpen: boolean; n: number; waitFirst: boolean; reserveReached: boolean }> = {}) => ({ laneOpen: true, n: 20, waitFirst: false, reserveReached: false, ...o });
  const names = (l: readonly (Acc | LaneMiss<Acc>)[]) => l.map((x) => ("account" in x ? x.account.name : x.name));

  it("un premier relevé retenu puis pas atteint au passage suivant y est payé « premier », en tête — plus d'attente sans borne", () => {
    // Revue du 20/11 : retenu à P0, la voie de P1 passe ses 7 minutes sur des comptes suivis ; firstReadMisses (voie
    // ouverte) ne le payait jamais, il attendait que la voie revienne aux nouveaux comptes (jusqu'à 12 h le 16/11).
    const x = neuf("x");
    const p0 = missPlan([miss(x)], [], pass(), NOW);
    expect([names(p0.hold), p0.firstPay]).toEqual([["x"], []]);
    const p1 = missPlan([], [{ ...x, freeMissAt: NOW }, neuf("pas-retenu"), neuf("retenu-il-y-a-30-min", { freeMissAt: NOW - 20 * MIN })], pass(), NOW + PASS_EVERY_MS);
    expect(names(p1.firstPay)).toEqual(["x"]);
    expect([p1.firstDefer, p1.hold, p1.missPay]).toEqual([[], [], []]);
    expect(heldFirstNotReached([{ ...x, freeMissAt: NOW }, acc("suivi", { freeMissAt: NOW })], NOW + PASS_EVERY_MS).map((a) => a.name)).toEqual(["x"]);
    // Il passe avant les premiers relevés ratés de ce passage.
    expect(names(missPlan([miss(neuf("rate-2", { freeMissAt: NOW }))], [{ ...x, freeMissAt: NOW }], pass(), NOW + PASS_EVERY_MS).firstPay)).toEqual(["x", "rate-2"]);
    // Au palier survie, il attend l'heure habituelle ; voie fermée, il est payé comme tout ce qu'elle n'a pas pris.
    expect(names(missPlan([], [{ ...x, freeMissAt: NOW }], pass({ waitFirst: true }), NOW + PASS_EVERY_MS).firstDefer)).toEqual(["x"]);
    expect(names(missPlan([], [{ ...x, freeMissAt: NOW }, neuf("y")], pass({ laneOpen: false }), NOW + PASS_EVERY_MS).firstPay)).toEqual(["x", "y"]);
  });

  it("part saturée : 2 crédits, 5 refus — 2 retenus, leur part gardée (rien de plus pour le « retard »), 3 dus comme avant", () => {
    const p = missPlan(["a", "b", "c", "d", "e"].map((x) => miss(acc(x))), [], pass({ n: 2 }), NOW);
    expect([names(p.hold), names(p.missPay), p.limit]).toEqual([["a", "b"], ["c", "d", "e"], 0]);
    // Part large : tout refus frais est retenu, la part du reste est entière moins les retenus.
    const q = missPlan(["a", "b"].map((x) => miss(acc(x))), [], pass({ n: 20 }), NOW);
    expect([names(q.hold), q.missPay, q.limit]).toEqual([["a", "b"], [], 18]);
  });

  it("voie saturée (un compte dû pas pris, suivi ou premier relevé) : rien n'est retenu, tout part au payant comme avant", () => {
    // Revue du 20/11 au soir (banc repli.ts, file saturée) : un retenu repris en tête de la voie suivante y prenait la
    // place d'un autre compte, payé « retard » (x40 : jusqu'à +85 crédits par jour), et saved.repli n'était plus un
    // plancher. Voie libre seulement.
    const ratés = () => [miss(acc("t")), miss(acc("u"), "detail")];
    const libre = missPlan(ratés(), [], pass(), NOW);
    expect([names(libre.hold), libre.missPay, libre.limit]).toEqual([["t", "u"], [], 18]);
    for (const left of [[acc("suivi-pas-pris", { dueAt: NOW - 2 * MIN })], [neuf("neuf-pas-pris")]]) {
      const p = missPlan(ratés(), left, pass(), NOW);
      expect([p.hold, names(p.missPay), p.limit]).toEqual([[], ["t", "u"], 20]);
    }
    // Un premier relevé retenu au passage d'avant et pas atteint : payé en tête ; aucune retenue ne prend sa part.
    const late = neuf("late", { freeMissAt: NOW - PASS_EVERY_MS });
    const p = missPlan([miss(acc("t"))], [late], pass({ n: 1 }), NOW);
    expect([names(p.firstPay), p.hold, names(p.missPay), p.limit]).toEqual([["late"], [], ["t"], 1]);
    // Palier survie : il attend sans rien payer ; la voie reste saturée, rien n'est retenu non plus.
    const r = missPlan([miss(acc("t"))], [late], pass({ n: 1, waitFirst: true }), NOW);
    expect([names(r.firstDefer), r.hold, names(r.missPay), r.limit]).toEqual([["late"], [], ["t"], 1]);
  });

  it("sous la réserve (part nulle) : rien de retenu, la brique 8 repousse ; un premier relevé dû reste dû (rien ne part)", () => {
    const troue: LaneMiss<Acc> = { ...miss(acc("troue"), "gap"), newest: { videoId: V_HIER, publishedAt: videoIdTime(V_HIER) } };
    const p = missPlan([troue, miss(acc("frais"))], [neuf("late", { freeMissAt: NOW - PASS_EVERY_MS })], pass({ n: 0, reserveReached: true }), NOW);
    expect([p.hold, names(p.reserveDefer), names(p.missPay), names(p.firstPay), p.limit]).toEqual([[], ["troue"], ["frais"], ["late"], 0]);
  });

  it("un trou (et, en bascule, un trou vérifié puis une page de vidéo illisible) part avec sa vidéo à retrouver et ce que sa page a dit", () => {
    const newest = { videoId: V_HIER, publishedAt: videoIdTime(V_HIER) };
    const seen: GapSeen = { page: "partie", listed: [V_NEUVE], at: NOW };
    const troue: LaneMiss<Acc> = { account: acc("troue"), why: "gap", newest, seen };
    // Second échec d'une page illisible après un trou vérifié : payé « repli », page après page jusqu'à `newest`.
    const detail: LaneMiss<Acc> = { account: acc("detail", { freeMissAt: NOW - PASS_EVERY_MS }), why: "detail", newest };
    const p = missPlan([troue, detail], [], pass(), NOW);
    expect(p.missPay).toEqual([troue, detail]);
    expect(p.missPay.map((m) => [missReason(m), m.newest, m.seen])).toEqual([["trou", newest, seen], ["repli", newest, undefined]]);
  });
});

describe("Radar — relevé gratuit : sous la réserve, le raté attend la sonde (brique 8, 20/11/2026)", () => {
  // Sous la réserve, la part payante du passage est nulle : un compte raté que le payant devait relever restait dû,
  // relu gratuitement en tête de file toutes les 10 minutes, pour rien. Il attend la sonde du solde (50 minutes).
  const MIN = 60_000;
  type Acc = { name: string; dueAt: number; lastPostAt?: number; first: boolean; freeMissAt?: number };
  // Un compte suivi qui a publié il y a 18 heures (son second regard), dû depuis 3 minutes.
  const acc = (name: string, o: Partial<Acc> = {}): Acc => ({ name, dueAt: NOW - 3 * MIN, lastPostAt: NOW - 18 * HOUR, first: false, ...o });
  const miss = (account: Acc, why: FreeWhy = "suspect"): LaneMiss<Acc> => ({ account, why });
  const d = normalizeBudget(null);
  /** Le solde lu il y a `age` (50 minutes par défaut : la sonde partirait). */
  const solde = (remaining: number, age = BALANCE_PROBE_MS, s: BudgetSettings = d) => budgetState(s, [], { remaining, seenAt: NOW - age, now: NOW });
  /** Le passage tel que radarNetworks.accountReadsPass l'enchaîne : part payante, brique 7 (holdMisses), brique 8. */
  const passage = (b: BudgetState, misses: readonly LaneMiss<Acc>[], o: { laneOpen?: boolean; now?: number; s?: BudgetSettings } = {}) => {
    const { laneOpen = true, now = NOW, s = d } = o;
    const n = allowance(s, b, "tiktok", 0, 24);
    const held = holdMisses(misses, { laneOpen, capacity: n, waitFirst: tierDefers(b.tier).firstReads }, now);
    return { n, held, ...reserveMisses(held.pay, { reserveReached: b.reserveReached, laneOpen }, now) };
  };
  const names = (l: readonly (Acc | LaneMiss<Acc>)[]) => l.map((x) => ("account" in x ? x.account.name : x.name));
  const troue = (): LaneMiss<Acc> => ({ ...miss(acc("troue"), "gap"), newest: { videoId: V_HIER, publishedAt: videoIdTime(V_HIER) } });
  const ratés = () => [
    troue(),
    // Second échec d'affilée : retenu au passage d'avant (brique 7), raté de nouveau.
    miss(acc("second", { dueAt: NOW - 13 * MIN, freeMissAt: NOW - 10 * MIN })),
    miss(acc("en-retard-3h", { dueAt: NOW - 3 * HOUR, lastPostAt: NOW - 72 * HOUR }), "detail"),
    miss(acc("premier-2h", { first: true, lastPostAt: undefined, dueAt: NOW - 2 * HOUR })),
    // Premier échec, dans sa fenêtre : ce que la brique 7 retiendrait si le payant pouvait partir.
    miss(acc("refus-frais")),
  ];

  it("l'attente est celle de la sonde du solde : plus qu'un passage, une heure au plus (un pack acheté les fait repartir dans l'heure)", () => {
    expect(RESERVE_MISS_WAIT_MS).toBe(BALANCE_PROBE_MS);
    expect(RESERVE_MISS_WAIT_MS).toBe(50 * MIN);
    expect(RESERVE_MISS_WAIT_MS).toBeGreaterThan(PASS_EVERY_MS);
    expect(RESERVE_MISS_WAIT_MS).toBeLessThanOrEqual(60 * MIN);
  });

  it("sous la réserve : liste trouée, second échec, hors de sa fenêtre et premier relevé raté sont repoussés — rien ne part au payant", () => {
    const b = solde(CREDIT_RESERVE - 1);
    const r = passage(b, ratés());
    // Part payante nulle, palier « reserve » : la brique 7 ne retient rien (rien ne serait parti), un premier relevé non plus.
    expect([b.reserveReached, b.tier, r.n, r.held.hold, tierDefers(b.tier).firstReads]).toEqual([true, "reserve", 0, [], false]);
    expect(names(r.defer)).toEqual(["troue", "second", "en-retard-3h", "premier-2h"]);
    // Le refus tout frais garde son essai du passage suivant : il reste dû, sans échec retenu (aucun appel évité à compter).
    expect(names(r.pay)).toEqual(["refus-frais"]);
    expect(heldSpared(r.pay[0].account)).toBe(0);
  });

  it("repoussés, ils ne sont pas relus au passage suivant ni aux trois d'après : ils reviennent avec la sonde", () => {
    const misses = ratés();
    const r = passage(solde(CREDIT_RESERVE - 1), misses);
    // radarNetworks.deferAccounts : nextReadAt = now + RESERVE_MISS_WAIT_MS ; dueAccounts ne rend que nextReadAt ≤ now.
    const after = misses.map((m) => (r.defer.includes(m.account) ? { ...m.account, dueAt: NOW + RESERVE_MISS_WAIT_MS } : m.account));
    const dueAt = (t: number) => names(laneQueue(after.filter((a) => a.dueAt <= t), t)).sort();
    for (const k of [1, 2, 3, 4]) expect(dueAt(NOW + k * PASS_EVERY_MS)).toEqual(["refus-frais"]);
    expect(dueAt(NOW + RESERVE_MISS_WAIT_MS)).toEqual(["en-retard-3h", "premier-2h", "refus-frais", "second", "troue"]);
  });

  it("le refus tout frais : relu au passage suivant, et tant qu'il reste dans sa fenêtre ; raté encore au-delà, il attend la sonde", () => {
    const b = solde(CREDIT_RESERVE - 1);
    // Second regard (publié il y a 18 h, fenêtre de 20 min) : relu à +10 min ; raté, hors de sa fenêtre, repoussé.
    const frais = acc("refus-frais");
    expect(names(passage(b, [miss(frais)]).pay)).toEqual(["refus-frais"]);
    expect(names(passage(b, [miss(frais)], { now: NOW + PASS_EVERY_MS }).defer)).toEqual(["refus-frais"]);
    // Compte calme (fenêtre d'une heure), dû depuis 5 min : relu cinq passages de suite au plus, repoussé au sixième.
    const calme = acc("calme", { dueAt: NOW - 5 * MIN, lastPostAt: NOW - 72 * HOUR });
    const relus = [0, 1, 2, 3, 4, 5].map((k) => passage(b, [miss(calme)], { now: NOW + k * PASS_EVERY_MS }).defer.length);
    expect(relus).toEqual([0, 0, 0, 0, 0, 1]);
  });

  it("voie fermée sous la réserve (TikTok ne sert plus les profils) : tout raté attend la sonde, même tout frais", () => {
    const r = passage(solde(CREDIT_RESERVE - 1), [miss(acc("a")), miss(acc("b"), "detail")], { laneOpen: false });
    expect([names(r.defer), r.pay]).toEqual([["a", "b"], []]);
  });

  it("hors de la réserve : comportement d'avant — rien n'est repoussé, le payant reçoit la même liste, dans le même ordre", () => {
    const misses = ratés();
    // Solde confortable, juste au-dessus de la réserve, jamais lu (dev, e2e), ou part payante nulle pour une autre raison
    // (poste des relevés éteint) : seule la réserve repousse.
    const off = { ...d, postes: d.postes.map((p) => (p.key === "tiktok" ? { ...p, on: false } : p)) };
    const cas = [
      { b: solde(CREDIT_RESERVE + 5_000) },
      { b: solde(CREDIT_RESERVE + 1) },
      { b: budgetState(d, [], null) },
      { b: solde(CREDIT_RESERVE + 5_000, 0, off), s: off },
    ];
    for (const { b, s } of cas) {
      const r = passage(b, misses, { s });
      expect(b.reserveReached).toBe(false);
      expect(r.defer).toEqual([]);
      expect(r.pay).toHaveLength(r.held.pay.length);
      r.pay.forEach((m, i) => expect(m).toBe(r.held.pay[i]));
    }
    // Avec budget, la brique 7 retient le refus tout frais et paie le reste, comme avant.
    const plein = passage(solde(CREDIT_RESERVE + 5_000), misses);
    expect([names(plein.held.hold), names(plein.pay)]).toEqual([["refus-frais"], ["troue", "second", "en-retard-3h", "premier-2h"]]);
  });

  it("la sonde part toujours : le report ne dépend pas d'elle et ne la change pas", () => {
    // Solde lu il y a 50 minutes : la sonde part (radarNetworks, en fin de passage), les ratés sont repoussés.
    const vieux = solde(CREDIT_RESERVE - 1);
    expect([needsBalanceProbe(vieux), names(passage(vieux, [troue()]).defer)]).toEqual([true, ["troue"]]);
    // Lu il y a moins de 50 minutes : pas de sonde, les ratés attendent quand même.
    const recent = solde(CREDIT_RESERVE - 1, BALANCE_PROBE_MS - 1);
    expect([needsBalanceProbe(recent), names(passage(recent, [troue()]).defer)]).toEqual([false, ["troue"]]);
  });
});

describe("Radar — un compte qui n'a rien à lire n'est plus repayé à chaque passage (16/11/2026)", () => {
  // Le 16/11, 25 comptes suivis restaient dus depuis 3 à 42 heures : 22 profils refusés (supprimés, bannis ou passés
  // en privé), 3 vidés. Chaque passage les payait (« repli »), ScrapeCreators n'y lisait rien, et rien ne les repoussait.
  type Miss = { account: string; why: "absent" | "suspect" | "private" | "empty" | "detail" | "gap" };
  const misses: Miss[] = [
    { account: "supprime", why: "absent" },
    { account: "refuse", why: "suspect" },
    { account: "prive", why: "private" },
    { account: "vide", why: "empty" },
    { account: "illisible", why: "detail" },
    { account: "troue", why: "gap" },
    { account: "banni", why: "absent" },
  ];

  it("un profil absent, privé ou vide : une erreur de relevé, sans crédit ; le reste passe au payant", () => {
    const r = splitMisses(misses);
    expect(r.unreadable).toEqual(["supprime", "prive", "vide", "banni"]);
    expect(r.paid.map((m) => m.account)).toEqual(["refuse", "illisible", "troue"]);
    expect(missCounts(misses)).toEqual({ absent: 2, suspect: 1, private: 1, empty: 1, detail: 1, gap: 1 });
    expect(missCounts([])).toEqual({});
  });

  const sig = (videoId: string) => ({ videoId, publishedAt: videoIdTime(videoId) }) as SignalInput;
  const pages = (...served: PaidPage[]) => {
    const asked: (string | undefined)[] = [];
    return {
      asked,
      page: async (cursor?: string): Promise<PaidPage> => {
        asked.push(cursor);
        return served[asked.length - 1] ?? { ok: false, noCredits: false };
      },
    };
  };

  it("relevé payant servi SANS vidéo (profil supprimé, privé, vidé) : une erreur de relevé, pas un relevé sans suite", async () => {
    const t = pages({ ok: true, videos: [], next: null });
    expect(await paidRead(t.page, () => true)).toEqual({ outcome: "error", videos: [], reached: { done: false, found: false } });
    expect(t.asked).toEqual([undefined]);
    // Une liste trouée dont la première page revient vide : de même, sans page de plus.
    const g = pages({ ok: true, videos: [], next: "c1" });
    expect((await paidRead(g.page, () => true, { videoId: V_SEMAINE, publishedAt: videoIdTime(V_SEMAINE) })).outcome).toBe("error");
    expect(g.asked).toEqual([undefined]);
  });

  it("refus à la première page : erreur ; plus de crédits : arrêt ; des vidéos : rangées", async () => {
    expect((await paidRead(pages({ ok: false, noCredits: false }).page, () => true)).outcome).toBe("error");
    expect((await paidRead(pages({ ok: false, noCredits: true }).page, () => true)).outcome).toBe("stop");
    const t = pages({ ok: true, videos: [sig(V_NEUVE), sig(V_HIER), sig(V_NEUVE)], next: "c1" });
    const r = await paidRead(t.page, () => true);
    expect(r.outcome).toBe("read");
    expect(r.videos.map((v) => v.videoId)).toEqual([V_NEUVE, V_HIER]);
    // Sans trou, une seule page.
    expect(t.asked).toEqual([undefined]);
  });

  it("liste trouée : page après page jusqu'à la vidéo ; une page suivante refusée garde ce qui est lu ; `more` borne", async () => {
    const cible = { videoId: V_SEMAINE, publishedAt: videoIdTime(V_SEMAINE) };
    const t = pages({ ok: true, videos: [sig(V_NEUVE)], next: "c1" }, { ok: true, videos: [sig(V_HIER), sig(V_SEMAINE)], next: "c2" });
    expect(await paidRead(t.page, () => true, cible)).toMatchObject({ outcome: "read", reached: { done: true, found: true } });
    expect(t.asked).toEqual([undefined, "c1"]);
    const k = pages({ ok: true, videos: [sig(V_NEUVE)], next: "c1" }, { ok: false, noCredits: false });
    const kept = await paidRead(k.page, () => true, cible);
    expect([kept.outcome, kept.videos.map((v) => v.videoId)]).toEqual(["read", [V_NEUVE]]);
    const m = pages({ ok: true, videos: [sig(V_NEUVE)], next: "c1" }, { ok: true, videos: [sig(V_HIER)], next: "c2" });
    expect((await paidRead(m.page, () => false, cible)).videos).toHaveLength(1);
    expect(m.asked).toEqual([undefined]);
  });
});

describe("Radar — la mesure du premier relevé gratuit (14/11/2026)", () => {
  it("un compte sur 4, toujours le même ; au plus 100 par jour et 400 en tout", () => {
    expect([TRIAL_EVERY, TRIAL_PER_DAY, TRIAL_TOTAL, TRIAL_DETAIL_MAX]).toEqual([4, 100, 400, 9]);
    const handles = Array.from({ length: 4_000 }, (_, i) => `compte.${i}`);
    const picked = handles.filter(trialPick).length;
    // ~1 000 sur 4 000, à ±10 %.
    expect(picked).toBeGreaterThan(900);
    expect(picked).toBeLessThan(1_100);
    // Le pseudo décide, majuscules comprises.
    expect(trialPick("Lea.Revise")).toBe(trialPick("lea.revise"));
  });

  it("les vidéos lues sur leur page : celles de moins de 14 jours, 9 au plus, les plus récentes d'abord", () => {
    const list = Array.from({ length: 13 }, (_, i) => ({ videoId: idAt(NOW - i * 26 * HOUR, i + 10), caption: "", views: 1, publishedAt: NOW - i * 26 * HOUR }));
    expect(trialPlan(list, NOW).map((v) => v.videoId)).toEqual(list.slice(0, 9).map((v) => v.videoId));
    const vieilles = list.map((v) => ({ ...v, publishedAt: v.publishedAt - 30 * 24 * HOUR }));
    expect(trialPlan(vieilles, NOW)).toEqual([]);
  });
});

describe("Radar — relevé payant d'un compte : la page suivante (14/11/2026)", () => {
  it("max_cursor quand has_more le dit ; jamais le même curseur, ni 0, ni vide", () => {
    expect(profileNextCursor({ has_more: true, max_cursor: 1_731_000_000_000 })).toBe("1731000000000");
    expect(profileNextCursor({ has_more: 1, max_cursor: "1731" })).toBe("1731");
    expect(profileNextCursor({ has_more: false, max_cursor: "1731" })).toBeNull();
    expect(profileNextCursor({ has_more: true })).toBeNull();
    expect(profileNextCursor({ has_more: true, max_cursor: "1731" }, "1731")).toBeNull();
    expect(profileNextCursor({ has_more: true, max_cursor: 0 })).toBeNull();
    expect(profileNextCursor({ has_more: true, max_cursor: "" })).toBeNull();
  });
});
