import { describe, expect, it } from "vitest";
import {
  TAG_ROUTINE_SKIP,
  TAG_VIDEO_PAGES,
  checkHashtag,
  hashtagGate,
  networkPasses,
  noteTagCounts,
  paidTags,
  passSkip,
  type AppRule,
  type TagCheck,
  type TagRun,
} from "../../convex/radar/radarNetworkMath";
import { parseTagList, tagEmbedUrl, type PageFetch, type TagList } from "../../convex/radar/radarStoreMath";
import { freeVideoUrl } from "../../convex/radar/radarFreeMath";

/**
 * Radar — le tri des hashtags avant la recherche payante (brique 3 des pages gratuites, 20/11/2026). La page publique
 * d'un hashtag (`/embed/tag/<tag>`, relevée ce jour-là sur #wallbit : HTTP 200, « videoCount » en texte, 10 vidéos au
 * plus) dit s'il existe et s'il est complet ; sinon on paie, comme avant.
 */
const WALLBIT: AppRule = { strong: ["wallbit"] };
const ID = (n: number) => String(7_607_200_411_870_711_000n + BigInt(n));
const tagPage = (videoCount: string | number | null, items: Record<string, unknown>[]) =>
  `<html><script id="__FRONTITY_CONNECT_STATE__">{"source":{"data":{"/embed/tag/wallbit":{"videoList":${JSON.stringify(items)},"embedInfo":{"viewCount":"19966314",${videoCount === null ? "" : `"videoCount":${JSON.stringify(videoCount)},`}"statusCode":0,"code":200}}}}}</script></html>`;
const item = (n: number, author: string, desc: string, extra: Record<string, unknown> = {}) => ({ id: ID(n), desc, authorUniqueId: author, playCount: 1_000 * n, ...extra });
const list = (videos: number, items: ReturnType<typeof item>[]): TagList => parseTagList(tagPage(String(videos), items))!;
const videoPage = (id: string, author: string, desc: string) =>
  `<html><script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application/json">${JSON.stringify({
    __DEFAULT_SCOPE__: {
      "webapp.video-detail": {
        statusCode: 0,
        itemInfo: {
          itemStruct: {
            id,
            desc,
            createTime: "1795000000",
            author: { id: `uid-${author}`, uniqueId: author, signature: "" },
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
function tiktok(pages: Record<string, PageFetch>) {
  const asked: string[] = [];
  return { asked, page: async (url: string): Promise<PageFetch> => (asked.push(url), pages[url] ?? { kind: "suspect", reason: "HTTP 429" }) };
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
    expect(hashtagGate(p!, WALLBIT, { deep: false }).pay).toBe(true);
  });
});

describe("Radar — tri des hashtags : la décision", () => {
  const big = list(1_755, [item(1, "ana", "mi sueldo en #wallbit"), item(2, "luz", "#fyp")]);

  it("absent (HTTP 400/404) : le hashtag n'existe pas, la recherche payante ne rendrait rien", () => {
    expect(hashtagGate("absent", WALLBIT, { deep: false })).toEqual({ pay: false, why: "absent", read: [], same: false });
  });

  it("complet : toutes ses vidéos sont dans la page ; on lira celles qui citent l'app, pas les autres", () => {
    const g = hashtagGate(list(3, [item(1, "ana", "mi sueldo en #wallbit"), item(2, "luz", "#fyp #finanzas"), item(3, "wallbit.oficial", "hola")]), WALLBIT, { deep: false });
    expect(g.pay).toBe(false);
    expect(g.why).toBe("complete");
    // Le premier tri de `attachFromSearch` : la légende ou le pseudo cite l'app.
    expect(g.read.map((i) => i.author)).toEqual(["ana", "wallbit.oficial"]);
    // Un hashtag qui existe sans vidéo : rien à chercher.
    expect(hashtagGate(list(0, []), WALLBIT, { deep: false })).toEqual({ pay: false, why: "complete", read: [], same: false });
  });

  it("un compteur en dessous de ce que la page liste (caché ou en retard) ne prouve rien : on paie", () => {
    expect(hashtagGate(list(0, [item(1, "ana", "#wallbit"), item(2, "luz", "#fyp")]), WALLBIT, { deep: false }).pay).toBe(true);
    expect(hashtagGate(list(1, [item(1, "ana", "#wallbit"), item(2, "luz", "#wallbit")]), WALLBIT, { deep: false }).pay).toBe(true);
  });

  it("compteur inchangé depuis la dernière recherche payée, en routine : MESURE — décidé, compté, et payé", () => {
    expect(TAG_ROUTINE_SKIP).toBe(false);
    expect(hashtagGate(big, WALLBIT, { deep: false, last: 1_755 })).toEqual({ pay: true, why: "same", read: [], same: true });
  });

  it("compteur inchangé, règle active (sur preuve) : on ne paie pas", () => {
    expect(hashtagGate(big, WALLBIT, { deep: false, last: 1_755 }, true)).toEqual({ pay: false, why: "same", read: [], same: true });
  });

  it("compteur changé, ou jamais payé : on paie", () => {
    expect(hashtagGate(big, WALLBIT, { deep: false, last: 1_754 }, true)).toEqual({ pay: true, why: "large", read: [], same: false });
    expect(hashtagGate(big, WALLBIT, { deep: false }, true)).toEqual({ pay: true, why: "large", read: [], same: false });
  });

  it("page refusée ou servie sans ses données : on paie, comme avant", () => {
    expect(hashtagGate("suspect", WALLBIT, { deep: false, last: 3 }, true)).toEqual({ pay: true, why: "suspect", read: [], same: false });
  });

  it("recherche complète : la règle du compteur ne s'applique pas ; absent et complet, si", () => {
    expect(hashtagGate(big, WALLBIT, { deep: true, last: 1_755 }, true)).toEqual({ pay: true, why: "large", read: [], same: false });
    expect(hashtagGate("absent", WALLBIT, { deep: true }).pay).toBe(false);
    expect(hashtagGate(list(1, [item(1, "ana", "#wallbit")]), WALLBIT, { deep: true }).pay).toBe(false);
  });

  it("plus de vidéos qui citent l'app qu'on ne lit de pages : on paie", () => {
    const many = Array.from({ length: TAG_VIDEO_PAGES + 1 }, (_, n) => item(n + 1, `c${n}`, "#wallbit"));
    expect(hashtagGate(list(many.length, many), WALLBIT, { deep: false }).pay).toBe(true);
  });
});

describe("Radar — tri des hashtags : de la page aux vidéos", () => {
  const TAG = tagEmbedUrl("wallbit");
  const three = tagPage("3", [item(1, "ana", "mi sueldo en #wallbit"), item(2, "luz", "#fyp"), item(3, "sol", "#wallbit app")]);

  it("absent : une page lue, rien à ranger, aucun crédit", async () => {
    const t = tiktok({ [TAG]: { kind: "absent" } });
    const c = await checkHashtag("wallbit", WALLBIT, { deep: false }, t.page);
    expect(c).toMatchObject({ pay: false, why: "absent", videos: [], pages: 1, refused: false });
    expect(c.count).toBeUndefined();
  });

  it("complet : la page de chaque vidéo qui cite l'app, rendue dans la forme de la recherche payante", async () => {
    const t = tiktok({
      [TAG]: ok(three),
      [freeVideoUrl("ana", ID(1))]: ok(videoPage(ID(1), "ana", "mi sueldo en #wallbit")),
      [freeVideoUrl("sol", ID(3))]: ok(videoPage(ID(3), "sol", "#wallbit app")),
    });
    const c = await checkHashtag("wallbit", WALLBIT, { deep: false }, t.page);
    expect(t.asked).toEqual([TAG, freeVideoUrl("ana", ID(1)), freeVideoUrl("sol", ID(3))]);
    expect(c).toMatchObject({ pay: false, why: "complete", count: 3, pages: 3, refused: false });
    expect(c.videos.map((v) => [v.videoId, v.authorHandle, v.authorFans, v.views, v.likes, v.lang])).toEqual([
      [ID(1), "ana", 420, 5_100, 80, "es-am"],
      [ID(3), "sol", 420, 5_100, 80, "es-am"],
    ]);
  });

  it("complet, mais la page d'une vidéo qui cite l'app manque (refus, retirée, illisible) : on paie", async () => {
    for (const miss of [{ kind: "suspect", reason: "HTTP 429" }, { kind: "absent" }, ok(gone), ok("<html>captcha</html>")] as PageFetch[]) {
      const t = tiktok({ [TAG]: ok(three), [freeVideoUrl("ana", ID(1))]: ok(videoPage(ID(1), "ana", "#wallbit")), [freeVideoUrl("sol", ID(3))]: miss });
      const c = await checkHashtag("wallbit", WALLBIT, { deep: false }, t.page);
      expect(c).toMatchObject({ pay: true, why: "video", videos: [], count: 3, pages: 3 });
    }
  });

  it("page du hashtag refusée, ou servie sans ses données : on paie, et le coupe-circuit le compte", async () => {
    for (const p of [{ kind: "suspect", reason: "HTTP 429" }, ok("<html>Please wait...</html>")] as PageFetch[]) {
      const c = await checkHashtag("wallbit", WALLBIT, { deep: false, last: 3 }, tiktok({ [TAG]: p }).page, true);
      expect(c).toMatchObject({ pay: true, why: "suspect", refused: true, pages: 1, videos: [] });
    }
  });

  it("trop grand : une page, le compteur lu (à retenir si la recherche payée réussit)", async () => {
    const c = await checkHashtag("wallbit", WALLBIT, { deep: false, last: 1_755 }, tiktok({ [TAG]: ok(tagPage("1755", [item(1, "ana", "#wallbit")])) }).page);
    expect(c).toMatchObject({ pay: true, why: "same", same: true, count: 1_755, pages: 1 });
  });
});

describe("Radar — tri des hashtags : les passes de la recherche", () => {
  const run = (check: Partial<TagCheck> | null, passes = 2, paid = 0, found = false): TagRun => ({
    check: check ? { pay: true, why: "large", read: [], same: false, videos: [], pages: 1, refused: false, ...check } : null,
    passes,
    paid,
    found,
  });

  it("les deux passes d'un hashtag sauté ne paient pas ; un mot-clé écrit pareil, si", () => {
    const [kwNone, , tagNone, tagFr] = networkPasses(["wallbit", "#wallbit"]);
    const runs = new Map([["wallbit", run({ pay: false, why: "absent" })]]);
    expect(passSkip(tagNone, runs)).toEqual([]);
    expect(passSkip(tagFr, runs)).toEqual([]);
    expect(passSkip(kwNone, runs)).toBeNull();
  });

  it("un hashtag payé, ou que le passage n'a pas pu lire (coupe-circuit, temps écoulé) : la passe paie", () => {
    const [, , tagNone] = networkPasses(["wallbit", "#wallbit"]);
    expect(passSkip(tagNone, new Map([["wallbit", run({ pay: true })]]))).toBeNull();
    expect(passSkip(tagNone, new Map([["wallbit", run(null)]]))).toBeNull();
    expect(passSkip(tagNone, new Map())).toBeNull();
  });

  it("le compteur n'est retenu qu'après une recherche payée réussie (toutes ses passes) et lue", () => {
    const runs = new Map([
      ["ok", run({ pay: true, count: 40, same: true }, 2, 2, true)],
      ["moitie", run({ pay: true, count: 40 }, 2, 1)],
      ["illisible", run({ pay: true }, 2, 2)],
      ["saute", run({ pay: false, why: "absent" }, 2, 0)],
    ]);
    expect(paidTags(runs)).toEqual([{ tag: "ok", videos: 40, same: true, found: true }]);
  });

  it("la mesure s'additionne d'une recherche à l'autre ; un hashtag qui n'est plus cherché est oublié", () => {
    const prev = [
      { tag: "wallbit", videos: 1_700, at: 1, same: 2, sameFound: 1 },
      { tag: "ancien", videos: 3, at: 1 },
    ];
    expect(noteTagCounts(prev, [{ tag: "wallbit", videos: 1_755, same: true, found: false }, { tag: "wallbitapp", videos: 12, same: false, found: true }], ["wallbit", "#wallbit", "#wallbitapp"], 9)).toEqual([
      { tag: "wallbit", videos: 1_755, at: 9, same: 3, sameFound: 1 },
      { tag: "wallbitapp", videos: 12, at: 9 },
    ]);
  });
});
