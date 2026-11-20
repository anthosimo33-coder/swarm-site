import { describe, expect, it } from "vitest";
import {
  TAG_COMPLETE_SKIP,
  TAG_LIST_MAX,
  TAG_NOTHING_BREAKER,
  TAG_PAGES_PER_RUN,
  TAG_ROUTINE_SKIP,
  checkHashtag,
  hashtagGate,
  networkPasses,
  notePaidPage,
  notePaidPass,
  noteTagCounts,
  paidTags,
  passSkip,
  tagGuardNote,
  tagGuardRead,
  tagGuardStart,
  tagRunStart,
  videoPageAuthor,
  type AppRule,
  type TagCheck,
  type TagCount,
  type TagGuard,
  type TagRun,
  type TagSkip,
} from "../../convex/radar/radarNetworkMath";
import { attachFromSearch } from "../../convex/radar/radarNetworks";
import { STORE_BREAKER, parseTagList, tagEmbedUrl, type PageFetch, type TagList } from "../../convex/radar/radarStoreMath";
import { freeVideoUrl } from "../../convex/radar/radarFreeMath";
import { memoryDb, type MemoryDoc } from "./convex-memory-db";

/**
 * Radar — le tri des hashtags avant la recherche payante (brique 3 des pages gratuites, 20/11/2026). La page publique
 * d'un hashtag (`/embed/tag/<tag>`, relevée ce jour-là sur #wallbit : HTTP 200, « videoCount » en texte, 10 vidéos au
 * plus) dit s'il existe et s'il est complet ; sinon on paie, comme avant. « complete » et « same » partent en mesure.
 */
const WALLBIT: AppRule = { strong: ["wallbit"] };
/** Les règles en mesure jugées actives (ce qu'elles feraient après la bascule). */
const ACTIVE: TagSkip = { routine: true, complete: true };
const ID = (n: number) => String(7_607_200_411_870_711_000n + BigInt(n));
const tagPage = (videoCount: string | number | null, items: Record<string, unknown>[]) =>
  `<html><script id="__FRONTITY_CONNECT_STATE__">{"source":{"data":{"/embed/tag/wallbit":{"videoList":${JSON.stringify(items)},"embedInfo":{"viewCount":"19966314",${videoCount === null ? "" : `"videoCount":${JSON.stringify(videoCount)},`}"statusCode":0,"code":200}}}}}</script></html>`;
const item = (n: number, author: string, desc: string, extra: Record<string, unknown> = {}) => ({ id: ID(n), desc, authorUniqueId: author, playCount: 1_000 * n, ...extra });
const list = (videos: number, items: ReturnType<typeof item>[]): TagList => parseTagList(tagPage(String(videos), items))!;
const videoPage = (id: string, author: string | null, desc: string) =>
  `<html><script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application/json">${JSON.stringify({
    __DEFAULT_SCOPE__: {
      "webapp.video-detail": {
        statusCode: 0,
        itemInfo: {
          itemStruct: {
            id,
            desc,
            createTime: "1795000000",
            author: { id: `uid-${author}`, ...(author ? { uniqueId: author } : {}), signature: "" },
            authorStats: { followerCount: 420 },
            stats: { playCount: 5_100, diggCount: 80, commentCount: 4, shareCount: 2, collectCount: 7 },
            textLanguage: "es",
            locationCreated: "AR",
          },
        },
      },
    },
  })}</script></html>`;
const gone = `<html><script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application/json">${JSON.stringify({ __DEFAULT_SCOPE__: { "webapp.video-detail": { statusCode: 10204 } } })}</script></html>`;

/** Un TikTok d'essai : chaque adresse a sa réponse ; la liste des adresses demandées, dans l'ordre. */
function tiktok(pages: Record<string, PageFetch>, late?: () => boolean) {
  const asked: string[] = [];
  return { asked, io: { page: async (url: string): Promise<PageFetch> => (asked.push(url), pages[url] ?? { kind: "suspect", reason: "HTTP 429" }), ...(late ? { late } : {}) } };
}
const ok = (text: string): PageFetch => ({ kind: "ok", text });

describe("Radar — tri des hashtags : la page d'un hashtag", () => {
  it("le compteur (en texte), et chaque vidéo listée avec sa légende ENTIÈRE, ses vues, son auteur", () => {
    const long = `ayuda que hago? ${"x".repeat(400)} #wallbit`;
    expect(parseTagList(tagPage("1755", [item(1, "ana", long, { privateItem: false }), item(2, "luz", "#fyp", { privateItem: true })]))).toEqual({
      videos: 1_755,
      items: [
        { id: ID(1), author: "ana", desc: long, views: 1_000, private: false },
        { id: ID(2), author: "luz", desc: "#fyp", views: 2_000, private: true },
      ],
    });
  });

  it("sans compteur ou sans liste, rien ne se conclut (`count` y lirait 0, un hashtag « vide » ne serait pas payé)", () => {
    expect(parseTagList(tagPage(null, [item(1, "ana", "#wallbit")]))).toBeNull();
    expect(parseTagList(tagPage("beaucoup", []))).toBeNull();
    expect(parseTagList("<html>Please wait...</html>")).toBeNull();
    expect(parseTagList(tagPage("0", []))).toEqual({ videos: 0, items: [] });
  });

  it("une vidéo listée sans identifiant ou sans auteur ne compte pas parmi les listées (ni un doublon)", () => {
    const p = parseTagList(tagPage("2", [item(1, "ana", "#wallbit"), { id: "", desc: "#wallbit", authorUniqueId: "luz" }, item(3, "", "#wallbit"), item(1, "ana", "#wallbit")]));
    expect(p?.items.map((i) => i.id)).toEqual([ID(1)]);
    // 2 vidéos pour 1 listée lisible : le hashtag n'est pas complet.
    expect(hashtagGate(p!, WALLBIT, { deep: false }, ACTIVE)).toMatchObject({ pay: true, why: "large" });
  });

  it("le pseudo de l'auteur sur la page d'une vidéo (TikTok la sert par son id, quel que soit le @ de l'adresse)", () => {
    expect(videoPageAuthor(videoPage(ID(1), "nouveau_pseudo", "#wallbit"))).toBe("nouveau_pseudo");
    expect(videoPageAuthor(videoPage(ID(1), null, "#wallbit"))).toBeNull();
    expect(videoPageAuthor(gone)).toBeNull();
    expect(videoPageAuthor("<html>captcha</html>")).toBeNull();
  });
});

describe("Radar — tri des hashtags : la décision", () => {
  const big = list(1_755, [item(1, "ana", "mi sueldo en #wallbit"), item(2, "luz", "#fyp")]);
  const three = list(3, [item(1, "ana", "mi sueldo en #wallbit"), item(2, "luz", "#fyp #finanzas"), item(3, "wallbit.oficial", "hola")]);

  it("absent (HTTP 400/404), et sa dernière recherche payée complète n'a rendu aucune vidéo : le vide dure, on ne paie pas", () => {
    expect(hashtagGate("absent", WALLBIT, { deep: false, paid: 0 })).toEqual({ pay: false, why: "absent", read: [], same: false });
    expect(hashtagGate("absent", WALLBIT, { deep: false, last: 0, paid: 0 })).toMatchObject({ pay: false, why: "absent" });
  });

  it("absent, jamais payé (ou payé avec des vidéos) : le payant n'a pas constaté le vide, on paie (13/11 : « absent » servi aux serveurs pour 67 profils qui existaient)", () => {
    expect(hashtagGate("absent", WALLBIT, { deep: false })).toEqual({ pay: true, why: "unconfirmed", read: [], same: false });
    // Sa page était absente à sa dernière recherche : pas de compteur, mais ce que la recherche a rendu.
    expect(hashtagGate("absent", WALLBIT, { deep: false, paid: 12 })).toEqual({ pay: true, why: "unconfirmed", read: [], same: false });
    expect(hashtagGate("absent", WALLBIT, { deep: false, last: 0 }, ACTIVE)).toMatchObject({ pay: true, why: "unconfirmed" });
  });

  it("absent, alors qu'il avait des vidéos à sa dernière recherche payée : la page contredit ce qu'on a payé, on paie", () => {
    expect(hashtagGate("absent", WALLBIT, { deep: false, last: 40 })).toEqual({ pay: true, why: "history", read: [], same: false });
    expect(hashtagGate("absent", WALLBIT, { deep: true, last: 40 }, ACTIVE).pay).toBe(true);
    // Même si la recherche payée d'alors n'avait rien rendu : la page avait un compteur, elle contredit ce qu'on a vu.
    expect(hashtagGate("absent", WALLBIT, { deep: false, last: 40, paid: 0 })).toMatchObject({ pay: true, why: "history" });
  });

  it("complet : MESURE — décidé, ses vidéos qui citent l'app notées (pour la mesure), et payé", () => {
    expect(TAG_COMPLETE_SKIP).toBe(false);
    const g = hashtagGate(three, WALLBIT, { deep: false });
    expect(g.pay).toBe(true);
    expect(g.why).toBe("complete");
    // Le premier tri de `attachFromSearch` : la légende ou le pseudo cite l'app.
    expect(g.read.map((i) => i.author)).toEqual(["ana", "wallbit.oficial"]);
  });

  it("complet, règle active (sur preuve) : on ne paie pas, on lira celles qui citent l'app", () => {
    const g = hashtagGate(three, WALLBIT, { deep: false }, ACTIVE);
    expect(g).toMatchObject({ pay: false, why: "complete" });
    expect(g.read.map((i) => i.author)).toEqual(["ana", "wallbit.oficial"]);
    // Un hashtag qui existe sans vidéo : rien à chercher.
    expect(hashtagGate(list(0, []), WALLBIT, { deep: false }, ACTIVE)).toEqual({ pay: false, why: "complete", read: [], same: false });
  });

  it("au plafond de la liste (10 listées pour un compteur à 10), « complet » ne se conclut pas : un compteur en retard y passerait", () => {
    const ten = Array.from({ length: TAG_LIST_MAX }, (_, n) => item(n + 1, `c${n}`, "#wallbit"));
    expect(hashtagGate(list(TAG_LIST_MAX, ten), WALLBIT, { deep: false }, ACTIVE)).toMatchObject({ pay: true, why: "large", read: [] });
    expect(hashtagGate(list(TAG_LIST_MAX - 1, ten.slice(1)), WALLBIT, { deep: false }, ACTIVE)).toMatchObject({ pay: false, why: "complete" });
  });

  it("complet, mais sous le compteur de sa dernière recherche payée (vide, ou moins de vidéos) : on paie", () => {
    expect(hashtagGate(list(0, []), WALLBIT, { deep: false, last: 40 }, ACTIVE)).toEqual({ pay: true, why: "history", read: [], same: false });
    expect(hashtagGate(three, WALLBIT, { deep: false, last: 4 }, ACTIVE)).toMatchObject({ pay: true, why: "history" });
    expect(hashtagGate(three, WALLBIT, { deep: false, last: 2 }, ACTIVE)).toMatchObject({ pay: false, why: "complete" });
  });

  it("un compteur en dessous de ce que la page liste (caché ou en retard) ne prouve rien : on paie", () => {
    expect(hashtagGate(list(0, [item(1, "ana", "#wallbit"), item(2, "luz", "#fyp")]), WALLBIT, { deep: false }, ACTIVE).pay).toBe(true);
    expect(hashtagGate(list(1, [item(1, "ana", "#wallbit"), item(2, "luz", "#wallbit")]), WALLBIT, { deep: false }, ACTIVE).pay).toBe(true);
  });

  it("compteur inchangé depuis la dernière recherche payée, en routine : MESURE — décidé, compté, et payé", () => {
    expect(TAG_ROUTINE_SKIP).toBe(false);
    expect(hashtagGate(big, WALLBIT, { deep: false, last: 1_755 })).toEqual({ pay: true, why: "same", read: [], same: true });
  });

  it("compteur inchangé, règle active (sur preuve) : on ne paie pas", () => {
    expect(hashtagGate(big, WALLBIT, { deep: false, last: 1_755 }, ACTIVE)).toEqual({ pay: false, why: "same", read: [], same: true });
  });

  it("compteur changé, ou jamais payé : on paie", () => {
    expect(hashtagGate(big, WALLBIT, { deep: false, last: 1_754 }, ACTIVE)).toEqual({ pay: true, why: "large", read: [], same: false });
    expect(hashtagGate(big, WALLBIT, { deep: false }, ACTIVE)).toEqual({ pay: true, why: "large", read: [], same: false });
  });

  it("page refusée ou servie sans ses données : on paie, comme avant", () => {
    expect(hashtagGate("suspect", WALLBIT, { deep: false, last: 3 }, ACTIVE)).toEqual({ pay: true, why: "suspect", read: [], same: false });
  });

  it("recherche complète : la règle du compteur ne s'applique pas ; absent, si (et complet, une fois actif)", () => {
    expect(hashtagGate(big, WALLBIT, { deep: true, last: 1_755 }, ACTIVE)).toEqual({ pay: true, why: "large", read: [], same: false });
    expect(hashtagGate("absent", WALLBIT, { deep: true, paid: 0 }).pay).toBe(false);
    expect(hashtagGate("absent", WALLBIT, { deep: true }).pay).toBe(true);
    expect(hashtagGate(list(1, [item(1, "ana", "#wallbit")]), WALLBIT, { deep: true }).pay).toBe(true);
    expect(hashtagGate(list(1, [item(1, "ana", "#wallbit")]), WALLBIT, { deep: true }, ACTIVE).pay).toBe(false);
  });
});

describe("Radar — tri des hashtags : de la page aux vidéos", () => {
  const TAG = tagEmbedUrl("wallbit");
  const three = tagPage("3", [item(1, "ana", "mi sueldo en #wallbit"), item(2, "luz", "#fyp"), item(3, "sol", "#wallbit app")]);
  const pagesOf3 = { [TAG]: ok(three), [freeVideoUrl("ana", ID(1))]: ok(videoPage(ID(1), "ana", "mi sueldo en #wallbit")), [freeVideoUrl("sol", ID(3))]: ok(videoPage(ID(3), "sol", "#wallbit app")) };

  it("absent, payé vide la dernière fois : une page lue, rien à ranger, aucun crédit — et c'est une réponse « rien »", async () => {
    const t = tiktok({ [TAG]: { kind: "absent" } });
    const c = await checkHashtag("wallbit", WALLBIT, { deep: false, paid: 0 }, t.io);
    expect(c).toMatchObject({ pay: false, why: "absent", videos: [], pages: 1, refused: false, nothing: true });
    expect(c.count).toBeUndefined();
  });

  it("absent, jamais payé : une page lue, et on paie — c'est quand même une réponse « rien » pour le coupe-circuit", async () => {
    const c = await checkHashtag("wallbit", WALLBIT, { deep: false }, tiktok({ [TAG]: { kind: "absent" } }).io);
    expect(c).toMatchObject({ pay: true, why: "unconfirmed", videos: [], pages: 1, refused: false, nothing: true });
  });

  it("complet en MESURE : la page du hashtag seule, aucune page vidéo (la recherche payée les rend)", async () => {
    const t = tiktok(pagesOf3);
    const c = await checkHashtag("wallbit", WALLBIT, { deep: false }, t.io);
    expect(t.asked).toEqual([TAG]);
    expect(c).toMatchObject({ pay: true, why: "complete", count: 3, pages: 1, videos: [], nothing: false });
    expect(c.read.map((i) => i.id)).toEqual([ID(1), ID(3)]);
  });

  it("complet, règle active : la page de chaque vidéo qui cite l'app, rendue dans la forme de la recherche payante", async () => {
    const t = tiktok(pagesOf3);
    const c = await checkHashtag("wallbit", WALLBIT, { deep: false }, t.io, ACTIVE);
    expect(t.asked).toEqual([TAG, freeVideoUrl("ana", ID(1)), freeVideoUrl("sol", ID(3))]);
    expect(c).toMatchObject({ pay: false, why: "complete", count: 3, pages: 3, refused: false });
    expect(c.videos.map((v) => [v.videoId, v.authorHandle, v.authorFans, v.views, v.likes, v.lang])).toEqual([
      [ID(1), "ana", 420, 5_100, 80, "es-am"],
      [ID(3), "sol", 420, 5_100, 80, "es-am"],
    ]);
  });

  it("complet, règle active : une vidéo est rangée sous le pseudo que porte SA page, pas sous celui de la liste", async () => {
    const t = tiktok({ [TAG]: ok(tagPage("1", [item(1, "ancien_pseudo", "#wallbit")])), [freeVideoUrl("ancien_pseudo", ID(1))]: ok(videoPage(ID(1), "nouveau_pseudo", "#wallbit")) });
    const c = await checkHashtag("wallbit", WALLBIT, { deep: false }, t.io, ACTIVE);
    expect(c).toMatchObject({ pay: false, why: "complete" });
    expect(c.videos.map((v) => [v.authorHandle, v.url])).toEqual([["nouveau_pseudo", freeVideoUrl("nouveau_pseudo", ID(1))]]);
  });

  it("complet, règle active, mais la page d'une vidéo qui cite l'app manque : on paie ; seuls un refus et une page illisible comptent au coupe-circuit", async () => {
    const cases: [PageFetch, boolean][] = [
      [{ kind: "suspect", reason: "HTTP 429" }, true],
      [{ kind: "absent" }, false],
      [ok(gone), false],
      [ok("<html>captcha</html>"), true],
      [ok(videoPage(ID(3), null, "#wallbit app")), false],
      [ok(videoPage(ID(9), "sol", "#wallbit app")), false],
    ];
    for (const [miss, refused] of cases) {
      const t = tiktok({ [TAG]: ok(three), [freeVideoUrl("ana", ID(1))]: ok(videoPage(ID(1), "ana", "#wallbit")), [freeVideoUrl("sol", ID(3))]: miss });
      const c = await checkHashtag("wallbit", WALLBIT, { deep: false }, t.io, ACTIVE);
      expect(c).toMatchObject({ pay: true, why: "video", videos: [], count: 3, pages: 3, refused });
    }
  });

  it("complet, règle active, le temps du passage écoulé : plus de page vidéo, on paie", async () => {
    const t = tiktok(pagesOf3, () => t.asked.length >= 2);
    const c = await checkHashtag("wallbit", WALLBIT, { deep: false }, t.io, ACTIVE);
    expect(t.asked).toEqual([TAG, freeVideoUrl("ana", ID(1))]);
    expect(c).toMatchObject({ pay: true, why: "late", videos: [], pages: 2, refused: false });
  });

  it("page du hashtag refusée, ou servie sans ses données : on paie, et le coupe-circuit le compte", async () => {
    for (const p of [{ kind: "suspect", reason: "HTTP 429" }, ok("<html>Please wait...</html>")] as PageFetch[]) {
      const c = await checkHashtag("wallbit", WALLBIT, { deep: false, last: 3 }, tiktok({ [TAG]: p }).io, ACTIVE);
      expect(c).toMatchObject({ pay: true, why: "suspect", refused: true, pages: 1, videos: [], nothing: false });
    }
  });

  it("trop grand : une page, le compteur lu (à retenir si la recherche payée réussit)", async () => {
    const c = await checkHashtag("wallbit", WALLBIT, { deep: false, last: 1_755 }, tiktok({ [TAG]: ok(tagPage("1755", [item(1, "ana", "#wallbit")])) }).io);
    expect(c).toMatchObject({ pay: true, why: "same", same: true, count: 1_755, pages: 1, nothing: false });
  });

  it("compteur à 0 : une réponse « rien », comme un absent", async () => {
    const c = await checkHashtag("wallbit", WALLBIT, { deep: false }, tiktok({ [TAG]: ok(tagPage("0", [])) }).io, ACTIVE);
    expect(c).toMatchObject({ pay: false, why: "complete", count: 0, nothing: true });
  });
});

describe("Radar — tri des hashtags : la garde du passage", () => {
  const check = (c: Partial<TagCheck>): TagCheck => ({ pay: true, why: "large", read: [], same: false, videos: [], pages: 1, refused: false, nothing: false, ...c });
  const absent = check({ pay: false, why: "absent", nothing: true });
  const refused = check({ why: "suspect", refused: true });
  const answered = check({ count: 40 });
  /** Un passage : la garde décide de lire, puis note ; sans lecture, le hashtag paie comme avant. */
  const run = (g: TagGuard, checks: TagCheck[]) => {
    const out: TagCheck[] = [];
    for (const c of checks) {
      if (!tagGuardRead(g, 0, 1)) {
        out.push(check({ why: "large", pages: 0 }));
        continue;
      }
      const n = tagGuardNote(g, c);
      g = n.guard;
      out.push(n.check);
    }
    return { guard: g, checks: out };
  };

  it("lit tant que rien ne l'arrête ; le temps du passage écoulé, ou le plafond de pages, et les hashtags suivants paient", () => {
    const g = tagGuardStart();
    expect(tagGuardRead(g, 1_000, 2_000)).toBe(true);
    expect(tagGuardRead(g, 2_001, 2_000)).toBe(false);
    expect(tagGuardRead({ ...g, pages: TAG_PAGES_PER_RUN - TAG_LIST_MAX }, 0, 1)).toBe(true);
    expect(tagGuardRead({ ...g, pages: TAG_PAGES_PER_RUN - TAG_LIST_MAX + 1 }, 0, 1)).toBe(false);
    expect(tagGuardRead({ ...g, stopped: "x" }, 0, 1)).toBe(false);
  });

  it("compte les pages et les hashtags du passage (une ligne au journal)", () => {
    const r = run(tagGuardStart(), [answered, check({ pages: 4, pay: false, why: "complete" }), absent]);
    expect(r.guard).toMatchObject({ pages: 6, tags: 3, stopped: null });
  });

  it(`${STORE_BREAKER} pages refusées d'affilée : le tri s'arrête, les hashtags suivants paient sans page lue`, () => {
    const r = run(tagGuardStart(), [...Array<TagCheck>(STORE_BREAKER).fill(refused), answered]);
    expect(r.guard.stopped).toMatch(/refusées/);
    expect(r.guard.tags).toBe(STORE_BREAKER);
    expect(r.checks.every((c) => c.pay)).toBe(true);
  });

  it("une réponse lue remet les refus à zéro ; un absent aussi, mais il compte parmi les « rien »", () => {
    const r = run(tagGuardStart(), [refused, refused, answered, refused, refused, absent, refused, refused]);
    expect(r.guard).toMatchObject({ refused: 2, nothing: 1, stopped: null });
  });

  it(`TikTok répond « absent » à tout (404 aux serveurs) : ${TAG_NOTHING_BREAKER - 1} hashtags sautés au plus, le ${TAG_NOTHING_BREAKER}e et les suivants paient`, () => {
    const r = run(tagGuardStart(), Array<TagCheck>(10).fill(absent));
    expect(r.checks.filter((c) => !c.pay)).toHaveLength(TAG_NOTHING_BREAKER - 1);
    expect(r.checks[TAG_NOTHING_BREAKER - 1]).toMatchObject({ pay: true, why: "breaker" });
    expect(r.guard.stopped).toMatch(/sans vidéo/);
    expect(r.guard.tags).toBe(TAG_NOTHING_BREAKER);
  });

  it("une coquille servie en 200 (compteur 0, liste vide) compte comme un absent", () => {
    const empty = check({ pay: false, why: "complete", count: 0, nothing: true });
    const r = run(tagGuardStart(), [empty, absent, empty, absent]);
    expect(r.checks.map((c) => c.pay)).toEqual([false, false, true, true]);
  });

  it("un refus entre deux « rien » ne remet pas le compte à zéro ; une vraie réponse, si", () => {
    expect(run(tagGuardStart(), [absent, refused, absent, refused, absent]).guard.stopped).toMatch(/sans vidéo/);
    expect(run(tagGuardStart(), [absent, absent, answered, absent, absent]).guard.stopped).toBeNull();
  });

  it("un hashtag payé avec des vidéos qui se dit vide arrête le tri tout de suite (il paie déjà)", () => {
    const history = check({ pay: true, why: "history", nothing: true });
    const r = run(tagGuardStart(), [history, absent]);
    expect(r.guard.stopped).toMatch(/se dit vide/);
    expect(r.checks.map((c) => [c.pay, c.why])).toEqual([
      [true, "history"],
      [true, "large"],
    ]);
  });

  it("de bout en bout : TikTok sert 404 à toutes les pages de hashtag, rien n'est sauté au-delà du coupe-circuit", async () => {
    // Des hashtags tous payés vides la dernière fois (le pire cas) ; jamais payés, aucun n'est sauté.
    for (const [paid, expected] of [
      [0, ["a1", "b2"]],
      [undefined, []],
    ] as const) {
      let g = tagGuardStart();
      const skipped: string[] = [];
      for (const tag of ["a1", "b2", "c3", "d4", "e5", "f6"]) {
        if (!tagGuardRead(g, 0, 1)) continue;
        const n = tagGuardNote(g, await checkHashtag(tag, WALLBIT, { deep: false, paid }, { page: async () => ({ kind: "absent" }) }, ACTIVE));
        g = n.guard;
        if (!n.check.pay) skipped.push(tag);
      }
      expect(skipped).toEqual(expected);
      expect(g.pages).toBe(TAG_NOTHING_BREAKER);
    }
  });
});

describe("Radar — tri des hashtags : les passes de la recherche", () => {
  const run = (check: Partial<TagCheck> | null, passes = 2, paid = 0, found = false): TagRun => ({
    ...tagRunStart(passes),
    check: check ? { pay: true, why: "large", read: [], same: false, videos: [], pages: 1, refused: false, nothing: false, ...check } : null,
    paid,
    found,
  });
  const paidVideo = (n: number, author: string, caption: string) => ({ videoId: ID(n), authorHandle: author, caption });

  it("les deux passes d'un hashtag sauté ne paient pas ; un mot-clé écrit pareil, si", () => {
    const [kwNone, , tagNone, tagFr] = networkPasses(["wallbit", "#wallbit"]);
    const runs = new Map([["wallbit", run({ pay: false, why: "absent" })]]);
    expect(passSkip(tagNone, runs)).toEqual([]);
    expect(passSkip(tagFr, runs)).toEqual([]);
    expect(passSkip(kwNone, runs)).toBeNull();
  });

  it("un hashtag payé (règles en mesure comprises), ou que le passage n'a pas pu lire (garde, temps écoulé) : la passe paie", () => {
    const [, , tagNone] = networkPasses(["wallbit", "#wallbit"]);
    expect(passSkip(tagNone, new Map([["wallbit", run({ pay: true })]]))).toBeNull();
    expect(passSkip(tagNone, new Map([["wallbit", run({ pay: true, why: "complete" })]]))).toBeNull();
    expect(passSkip(tagNone, new Map([["wallbit", run(null)]]))).toBeNull();
    expect(passSkip(tagNone, new Map())).toBeNull();
  });

  it("une passe payée ne compte que si elle est allée au bout : coupée (budget, temps, crédits) ou en échec, non", () => {
    const r = tagRunStart(2);
    notePaidPass(r, { stopped: false, failed: false });
    notePaidPass(r, { stopped: true, failed: false });
    notePaidPass(r, { stopped: false, failed: true });
    expect(r.paid).toBe(1);
    // Une passe coupée : le compteur n'est pas retenu, la mesure n'est pas faussée.
    expect(paidTags(new Map([["wallbit", { ...r, check: run({ pay: true, count: 40, same: true }).check }]]))).toEqual([]);
  });

  it("une page payée : comptes rattachés et signaux neufs (`found`), signaux connus mis à jour (`updated`), à part", () => {
    const r = run({ pay: true, why: "same", same: true });
    notePaidPage(r, { attached: 0, signals: 0, updated: 3 }, [], WALLBIT);
    expect(r).toMatchObject({ found: false, updated: true, out: false });
    notePaidPage(r, { attached: 1, signals: 0, updated: 0 }, [], WALLBIT);
    expect(r).toMatchObject({ found: true, updated: true });
  });

  it("hashtag complet payé (mesure) : `out` dès qu'une vidéo payée cite l'app hors de celles que la page aurait lues", () => {
    const listed = list(2, [item(1, "ana", "#wallbit"), item(2, "luz", "#fyp")]).items;
    const read = listed.filter((i) => i.author === "ana");
    const r = run({ pay: true, why: "complete", read, count: 2 });
    notePaidPage(r, { attached: 0, signals: 0, updated: 1 }, [paidVideo(1, "ana", "#wallbit"), paidVideo(5, "zoe", "#fyp")], WALLBIT);
    expect(r.out).toBe(false);
    // Listée, mais sa légende de page ne citait pas l'app : la page ne l'aurait pas lue.
    notePaidPage(r, { attached: 0, signals: 0, updated: 0 }, [paidVideo(2, "luz", "#fyp con wallbit")], WALLBIT);
    expect(r.out).toBe(true);
    // Le cas #facelessclone : en ligne, porte le hashtag, absente de la page.
    const r2 = run({ pay: true, why: "complete", read, count: 2 });
    notePaidPage(r2, { attached: 1, signals: 0, updated: 0 }, [paidVideo(6, "dre", "#wallbit #ad")], WALLBIT);
    expect(r2.out).toBe(true);
    // Hors « complete », rien à mesurer.
    const r3 = run({ pay: true, why: "large", count: 1_755 });
    notePaidPage(r3, { attached: 1, signals: 0, updated: 0 }, [paidVideo(6, "dre", "#wallbit")], WALLBIT);
    expect(r3.out).toBe(false);
  });

  it("une recherche payée réussie (toutes ses passes) est retenue — son compteur s'il a été lu, et les vidéos rendues, page absente comprise", () => {
    const runs = new Map([
      ["ok", { ...run({ pay: true, count: 40, same: true }, 2, 2, true), updated: true, returned: 57 }],
      ["complet", { ...run({ pay: true, why: "complete", count: 3 }, 2, 2), out: true, returned: 4 }],
      ["moitie", { ...run({ pay: true, count: 40 }, 2, 1), returned: 30 }],
      ["illisible", { ...run({ pay: true, why: "suspect", refused: true }, 2, 2), returned: 9 }],
      ["absent", run({ pay: true, why: "unconfirmed", nothing: true }, 2, 2)],
      ["vide", run({ pay: true, why: "complete", count: 0, nothing: true }, 2, 2)],
      ["pas-lu", { ...run(null, 2, 2), returned: 61 }],
      ["saute", run({ pay: false, why: "absent", nothing: true }, 2, 0)],
    ]);
    const no = { same: false, found: false, updated: false, complete: false, out: false };
    expect(paidTags(runs)).toEqual([
      { tag: "ok", videos: 40, paid: 57, absent: false, same: true, found: true, updated: true, complete: false, out: false },
      { tag: "complet", videos: 3, paid: 4, absent: false, ...no, complete: true, out: true },
      { tag: "illisible", paid: 9, absent: false, ...no },
      { tag: "absent", paid: 0, absent: true, ...no },
      // Un compteur à 0 servi en 200 est un compteur : pas une page absente.
      { tag: "vide", videos: 0, paid: 0, absent: false, ...no, complete: true },
      { tag: "pas-lu", paid: 61, absent: false, ...no },
    ]);
  });

  it("une page payée : toutes ses vidéos comptent dans ce que la recherche a rendu, qu'elles citent l'app ou non", () => {
    const r = run({ pay: true, why: "unconfirmed", nothing: true });
    notePaidPage(r, { attached: 0, signals: 0, updated: 0 }, [paidVideo(1, "ana", "#fyp"), paidVideo(2, "luz", "#wallbit")], WALLBIT);
    notePaidPage(r, { attached: 0, signals: 0, updated: 0 }, [], WALLBIT);
    expect(r.returned).toBe(2);
  });

  it("la mesure s'additionne d'une recherche à l'autre ; un hashtag qui n'est plus cherché est oublié", () => {
    const prev = [
      { tag: "wallbit", videos: 1_700, at: 1, same: 2, sameFound: 1 },
      { tag: "ancien", videos: 3, at: 1 },
      { tag: "petit", videos: 3, at: 1, complete: 4 },
    ];
    const p = (tag: string, videos: number, o: Partial<{ same: boolean; found: boolean; updated: boolean; complete: boolean; out: boolean }>) => ({
      tag,
      videos,
      paid: 30,
      absent: false,
      same: false,
      found: false,
      updated: false,
      complete: false,
      out: false,
      ...o,
    });
    const paid = [p("wallbit", 1_755, { same: true, updated: true }), p("wallbitapp", 12, { found: true }), p("petit", 3, { complete: true, same: true, out: true })];
    expect(noteTagCounts(prev, paid, ["wallbit", "#wallbit", "#wallbitapp", "#petit"], 9)).toEqual([
      { tag: "wallbit", videos: 1_755, paid: 30, at: 9, same: 3, sameFound: 1, sameUpdated: 1 },
      { tag: "petit", videos: 3, paid: 30, at: 9, same: 1, complete: 5, completeOut: 1 },
      { tag: "wallbitapp", videos: 12, paid: 30, at: 9 },
    ]);
  });

  it("page absente : son compteur d'avant est effacé, ce qu'a rendu la recherche retenu ; page illisible ou pas lue : le dernier compteur reste", () => {
    const prev = [
      { tag: "banni", videos: 40, paid: 80, at: 1 },
      { tag: "illisible", videos: 40, paid: 80, at: 1 },
      { tag: "faux404", paid: 0, at: 1, absent: 1 },
    ];
    const p = (tag: string, paid: number, absent: boolean) => ({ tag, paid, absent, same: false, found: false, updated: false, complete: false, out: false });
    expect(noteTagCounts(prev, [p("banni", 0, true), p("illisible", 50, false), p("faux404", 7, true)], ["#banni", "#illisible", "#faux404"], 9)).toEqual([
      { tag: "banni", paid: 0, at: 9, absent: 1 },
      { tag: "illisible", videos: 40, paid: 50, at: 9 },
      // Payé sur une page absente, et la recherche a rendu des vidéos : la preuve serveur que « absent » mentait.
      { tag: "faux404", paid: 7, at: 9, absent: 2, absentVideos: 1 },
    ]);
  });
});

describe("Radar — tri des hashtags : « absent » ne dispense de payer qu'après une recherche payée vide (revue du 20/11/2026)", () => {
  const TAG = tagEmbedUrl("wallbit");
  const SEARCHES = ["wallbit app", "#wallbit"];
  /**
   * Une recherche de l'app, comme runNetworkSearch : le tri lit la page du hashtag une fois ; chaque passe sautée est
   * une économie comptée (usage.spare("hashtag", 1)), chaque passe payée rend `returned` vidéos ; puis l'app retient ses
   * hashtags payés (finishNetworkSearch → noteTagCounts).
   */
  async function search(prev: TagCount[] | undefined, page: PageFetch, returned: number, at: number) {
    const past = prev?.find((t) => t.tag === "wallbit");
    const passes = networkPasses(SEARCHES);
    const tags = new Map<string, TagRun>();
    let guard = tagGuardStart();
    let spared = 0;
    let paidPasses = 0;
    for (const pass of passes) {
      if (pass.kind === "hashtag" && !tags.has(pass.value)) {
        const run = tagRunStart(passes.filter((p) => p.kind === "hashtag" && p.value === pass.value).length);
        const noted = tagGuardNote(guard, await checkHashtag(pass.value, WALLBIT, { deep: false, last: past?.videos, paid: past?.paid }, tiktok({ [TAG]: page }).io));
        guard = noted.guard;
        run.check = noted.check;
        tags.set(pass.value, run);
      }
      if (passSkip(pass, tags)) {
        spared++;
        continue;
      }
      paidPasses++;
      const tag = pass.kind === "hashtag" ? tags.get(pass.value) : undefined;
      if (!tag) continue;
      const videos = Array.from({ length: returned }, (_, n) => ({ videoId: ID(n), authorHandle: `c${n}`, caption: "#wallbit" }));
      notePaidPage(tag, { attached: 0, signals: 0, updated: 0 }, videos, WALLBIT);
      notePaidPass(tag, { stopped: false, failed: false });
    }
    const paid = paidTags(tags);
    return { spared, paidPasses, check: tags.get("wallbit")!.check!, counts: paid.length ? noteTagCounts(prev, paid, SEARCHES, at) : prev };
  }
  const absent: PageFetch = { kind: "absent" };

  it("absent jamais payé : on paie (ses deux passes), et l'app retient ce que la recherche a rendu — zéro vidéo, page absente", async () => {
    const s = await search(undefined, absent, 0, 1);
    expect(s.check).toMatchObject({ pay: true, why: "unconfirmed", nothing: true });
    expect(s).toMatchObject({ spared: 0, paidPasses: 4 });
    expect(s.counts).toEqual([{ tag: "wallbit", paid: 0, at: 1, absent: 1 }]);
  });

  it("absent après une recherche payée vide : ses deux passes sautées, deux économies comptées ; les mots-clés paient", async () => {
    const first = await search(undefined, absent, 0, 1);
    const s = await search(first.counts, absent, 0, 2);
    expect(s.check).toMatchObject({ pay: false, why: "absent" });
    expect(s).toMatchObject({ spared: 2, paidPasses: 2 });
    // Rien de payé pour lui : la dernière recherche payée reste celle qui a constaté le vide.
    expect(s.counts).toEqual(first.counts);
  });

  it("absent après une recherche payée qui a rendu des vidéos : on paie, à chaque fois, et la contradiction est comptée", async () => {
    const first = await search(undefined, absent, 5, 1);
    expect(first.counts).toEqual([{ tag: "wallbit", paid: 10, at: 1, absent: 1, absentVideos: 1 }]);
    const s = await search(first.counts, absent, 5, 2);
    expect(s.check).toMatchObject({ pay: true, why: "unconfirmed" });
    expect(s).toMatchObject({ spared: 0, paidPasses: 4 });
    expect(s.counts).toEqual([{ tag: "wallbit", paid: 10, at: 2, absent: 2, absentVideos: 2 }]);
  });

  it("page absente à la recherche payée (avant : rien de retenu) : payé vide, c'est retenu, et la suivante saute", async () => {
    // Il avait 40 vidéos : la page « absent » contredit ce qu'on a payé (history), on paie ; la recherche ne rend rien (banni).
    const s1 = await search([{ tag: "wallbit", videos: 40, paid: 80, at: 0 }], absent, 0, 1);
    expect(s1.check).toMatchObject({ pay: true, why: "history" });
    expect(s1.counts).toEqual([{ tag: "wallbit", paid: 0, at: 1, absent: 1 }]);
    const s2 = await search(s1.counts, absent, 0, 2);
    expect(s2).toMatchObject({ spared: 2, paidPasses: 2 });
    // Le vide ne dure plus (la page a un compteur) : on paie, comme avant.
    const s3 = await search(s2.counts, ok(tagPage("3", [item(0, "c0", "#wallbit"), item(1, "c1", "#wallbit"), item(2, "luz", "#fyp")])), 2, 3);
    expect(s3).toMatchObject({ spared: 0, paidPasses: 4 });
    expect(s3.counts).toEqual([{ tag: "wallbit", videos: 3, paid: 4, at: 3, absent: 1, complete: 1 }]);
  });
});

describe("Radar — tri des hashtags : ranger les vidéos lues sur leur page (attachFromSearch)", () => {
  const NOW = Date.parse("2026-11-20T12:00:00Z");
  type Handler = { _handler: (ctx: unknown, args: unknown) => Promise<unknown> };
  const attach = (attachFromSearch as unknown as Handler)._handler;
  function world() {
    const app: MemoryDoc = { _id: "radarApps_1", _creationTime: 1, slug: "wallbit", name: "Wallbit", rivalOf: [], strong: ["wallbit"], weak: [], context: [], searches: ["#wallbit"], status: "active", source: "manual", createdAt: 0 };
    const author: MemoryDoc = { _id: "radarTracked_1", _creationTime: 2, platform: "tiktok", handle: "ana", appId: app._id, status: "active", matchedBy: "caption", fans: 400, videosSeen: 3, nextReadAt: NOW, readErrors: 0, addedAt: 0 };
    const known = {
      videoId: ID(1),
      url: freeVideoUrl("ana", ID(1)),
      authorId: "uid-ana",
      authorHandle: "ana",
      authorFans: 400,
      caption: "mi sueldo en #wallbit",
      lang: "es-am",
      publishedAt: NOW - 86_400_000,
      views: 5_000,
      likes: 70,
      comments: 3,
      shares: 1,
      saves: 6,
      hook: "texto uno · texto dos",
      musicTitle: "son original",
    };
    const signal: MemoryDoc = {
      _id: "radarSignals_1",
      _creationTime: 3,
      platform: "tiktok",
      ...known,
      ratio: 12.5,
      snapshots: [{ at: NOW - 86_400_000, views: 5_000 }],
      foundBy: ["wallbit·fr"],
      firstSeenAt: NOW - 86_400_000,
      lastSeenAt: NOW - 86_400_000,
    };
    const mem = memoryDb({ radarApps: [app], radarTracked: [author], radarSignals: [signal], radarRejected: [] }, { limit: null });
    const patches: { id: string; value: Record<string, unknown> }[] = [];
    const db = mem.db as { get: (id: string) => Promise<MemoryDoc | null>; query: (t: string) => unknown };
    const ctx = { db: { get: db.get, query: db.query, patch: async (id: string, value: Record<string, unknown>) => void patches.push({ id, value }), insert: async () => "nouveau" } };
    // La même vidéo lue sur sa page : ses textes à l'écran dans un autre ordre (24 sur 148 le 13/11, radarFreeMath).
    const video = { ...known, views: 5_100, likes: 80, hook: "texto dos · texto uno", musicTitle: "otro son", isAd: false };
    return { app, ctx, patches, video };
  }

  it("lues sur leur page (`keepText`) : un signal déjà rangé garde son texte à l'écran et son son, ses chiffres suivent ; le compte rendu dit « mis à jour »", async () => {
    const w = world();
    const r = await attach(w.ctx, { appId: w.app._id, videos: [w.video], foundBy: "wallbit", now: NOW, keepText: true });
    expect(r).toEqual({ attached: 0, signals: 0, updated: 1 });
    const patch = w.patches.find((p) => p.id === "radarSignals_1")!.value;
    expect(patch).toMatchObject({ views: 5_100, likes: 80 });
    expect(patch).not.toHaveProperty("hook");
    expect(patch).not.toHaveProperty("musicTitle");
  });

  it("rendues par la recherche payante : le texte à l'écran et le son sont réécrits, comme avant", async () => {
    const w = world();
    await attach(w.ctx, { appId: w.app._id, videos: [w.video], foundBy: "wallbit", now: NOW });
    expect(w.patches.find((p) => p.id === "radarSignals_1")!.value).toMatchObject({ hook: "texto dos · texto uno", musicTitle: "otro son" });
  });
});
