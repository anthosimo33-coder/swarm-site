import { describe, expect, it } from "vitest";
import {
  CURVE_BREAKER,
  CURVE_FREE,
  curveMatch,
  curveVerdict,
  freeVideoUrl,
  paced,
  pageStep,
  readCurvePages,
  settleCurve,
  type CurvePaid,
  type CurveVerdict,
  type FreePage,
} from "../../convex/radar/radarFreeMath";
import {
  CURVE_ADMISSIONS_MAX,
  CURVE_PAGES_PER_DAY,
  CURVE_PAGES_PER_PASS,
  CURVE_PAGES_PER_VIDEO,
  LANE_PASSES_PER_DAY,
  curveAdmissionsLeft,
  curveCountsOf,
  curveLaneTake,
  normalizeBudget,
  type BudgetSettings,
  type CurveCounts,
} from "../../convex/radar/radarSignalsMath";

/**
 * Radar — la courbe des vues sur la page publique d'une vidéo (20/11/2026). Les pages d'essai ont la forme servie ce
 * jour-là : un bloc « __UNIVERSAL_DATA_FOR_REHYDRATION__ », `collectCount` en texte, les compteurs de 10 000 et plus
 * arrondis (16 805 vues servies « 16 800 »).
 */
const ID = "7705093698693975317";
const ID2 = "7704455095064235271";
const page = (o: { id?: string; stats?: Record<string, unknown>; authorStats?: Record<string, unknown> } = {}): FreePage => ({
  ok: true,
  text: `<html><script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application/json">${JSON.stringify({
    __DEFAULT_SCOPE__: {
      "webapp.video-detail": {
        statusCode: 0,
        statusMsg: "",
        itemInfo: {
          itemStruct: {
            id: o.id ?? ID,
            desc: "la légende",
            author: { id: "6930", uniqueId: "lea.revise" },
            authorStats: o.authorStats ?? { followerCount: 78 },
            stats: { playCount: 16_800, diggCount: 652, commentCount: 4, shareCount: 5, collectCount: "32", ...(o.stats ?? {}) },
          },
        },
      },
    },
  })}</script></html>`,
});
const refusee = (statusCode: number, statusMsg: string): FreePage => ({
  ok: true,
  text: `<html><script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application/json">${JSON.stringify({ __DEFAULT_SCOPE__: { "webapp.video-detail": { statusCode, statusMsg } } })}</script></html>`,
});
const LUE: CurveCounts = { authorFans: 78, views: 16_800, likes: 652, comments: 4, shares: 5, saves: 32 };
/** Le relevé payant de la même vidéo, au même moment : le compteur exact. */
const PAYE: CurveCounts = { ...LUE, views: 16_805 };

const budget = (qty: number, on = true): BudgetSettings => {
  const d = normalizeBudget(null);
  return { ...d, postes: d.postes.map((p) => (p.key === "curve" ? { ...p, qty, on } : p)) };
};

type Due = { id: string; videoId: string; handle: string };
const due = (n: number): Due[] => Array.from({ length: n }, (_, i) => ({ id: `s${i}`, videoId: String(BigInt(ID) + BigInt(i)), handle: `auteur${i}` }));

/** Un passage de la voie à blanc : pages servies dans l'ordre, relevés payants et écritures notés. */
function rig(pages: FreePage[], paid: CurvePaid[] = []) {
  const urls: string[] = [];
  const paidFor: string[] = [];
  const applied: { id: string; counts: CurveCounts | null }[] = [];
  return {
    urls,
    paidFor,
    applied,
    page: async (url: string): Promise<FreePage> => {
      urls.push(url);
      return pages.shift() ?? { ok: false, kind: "suspect", reason: "HTTP 429" };
    },
    io: {
      paid: async (d: Due): Promise<CurvePaid> => {
        paidFor.push(d.id);
        return paid.shift() ?? { ok: true, credits: 1, counts: PAYE };
      },
      apply: async (d: Due, counts: CurveCounts | null) => void applied.push({ id: d.id, counts }),
    },
  };
}

describe("Radar — courbe : ce que dit la page d'une vidéo (20/11/2026)", () => {
  it("les six nombres que la courbe range, `collectCount` en texte, les abonnés du compte", () => {
    expect(curveVerdict(page(), ID)).toEqual({ kind: "read", counts: LUE });
  });

  it("l'id servi n'est pas l'id demandé : rien n'est lu (les compteurs d'une autre vidéo n'entrent pas dans la courbe)", () => {
    expect(curveVerdict(page({ id: ID2 }), ID)).toMatchObject({ kind: "paid", refused: true });
  });

  it("un compteur absent renvoie au payant, au lieu d'écrire 0", () => {
    const sans = curveVerdict(page({ stats: { commentCount: undefined } }), ID);
    expect(sans).toEqual({ kind: "paid", refused: false, why: "page sans comments" });
    expect(curveVerdict(page({ authorStats: {} }), ID)).toMatchObject({ kind: "paid", refused: false, why: "page sans authorFans" });
  });

  it("supprimée, compte privé, réservée à son autrice : la vidéo n'est plus là ; hors de sa région ou motif inconnu : payant", () => {
    expect(curveVerdict(refusee(10204, "item doesn't exist"), ID)).toEqual({ kind: "gone", why: "removed" });
    expect(curveVerdict(refusee(10222, "author_secret"), ID)).toEqual({ kind: "gone", why: "private" });
    expect(curveVerdict(refusee(10204, "item_privacy_authorization&status_self_see"), ID)).toEqual({ kind: "gone", why: "restricted" });
    expect(curveVerdict(refusee(10231, "cross_border_violation"), ID)).toMatchObject({ kind: "paid", refused: false });
    expect(curveVerdict(refusee(10999, ""), ID)).toMatchObject({ kind: "paid", refused: false });
  });

  it("page refusée ou sans données : payant, compte pour le coupe-circuit ; page absente : payant, ne compte pas", () => {
    expect(curveVerdict({ ok: false, kind: "suspect", reason: "HTTP 429" }, ID)).toEqual({ kind: "paid", refused: true, why: "HTTP 429" });
    expect(curveVerdict({ ok: true, text: "<html>ratelimit triggered</html>" }, ID)).toMatchObject({ kind: "paid", refused: true });
    expect(curveVerdict({ ok: false, kind: "absent" }, ID)).toEqual({ kind: "paid", refused: false, why: "page absente" });
  });
});

describe("Radar — courbe : les pages d'un passage, dans la voie", () => {
  it("une page après l'autre, à l'adresse de la voie, la pause AVANT chacune", async () => {
    const r = rig([page({ id: due(2)[0].videoId }), page({ id: due(2)[1].videoId })]);
    const events: string[] = [];
    let open = 0;
    let most = 0;
    const one = async (url: string) => {
      open++;
      most = Math.max(most, open);
      events.push("page");
      const p = await r.page(url);
      open--;
      return p;
    };
    const out = await readCurvePages(due(2), paced(one, async () => void events.push("pause")), () => true);
    expect(out.pages).toBe(2);
    expect(most).toBe(1);
    expect(events).toEqual(["pause", "page", "pause", "page"]);
    expect(r.urls).toEqual([freeVideoUrl("auteur0", due(2)[0].videoId), freeVideoUrl("auteur1", due(2)[1].videoId)]);
    expect(out.reads.map((x) => x.verdict.kind)).toEqual(["read", "read"]);
  });

  it(`coupe-circuit : ${CURVE_BREAKER} pages refusées d'affilée, plus aucune page — le reste part au payant, à l'heure`, async () => {
    const r = rig([]);
    const out = await readCurvePages(due(6), r.page, () => true);
    expect(r.urls).toHaveLength(CURVE_BREAKER);
    expect(out.stopped).toBe(`${CURVE_BREAKER} pages de la courbe refusées d'affilée (HTTP 429)`);
    expect(out.reads[CURVE_BREAKER].verdict).toEqual({ kind: "paid", refused: false, why: "coupe-circuit" });
    const settled = await settleCurve(out.reads, r.io, { free: true, paidLeft: 13 });
    expect(r.paidFor).toEqual(due(6).map((d) => d.id));
    expect(settled.reasons).toEqual({ repli: 6 });
  });

  it("une page servie remet le compte à zéro ; une page absente ou un refus motivé ne compte pas", async () => {
    const d = due(6);
    const bad: FreePage = { ok: false, kind: "suspect", reason: "HTTP 429" };
    const r = rig([bad, bad, bad, bad, page({ id: d[4].videoId }), bad]);
    expect((await readCurvePages(d, r.page, () => true)).stopped).toBeNull();
    const r2 = rig([bad, bad, { ok: false, kind: "absent" }, refusee(10231, "cross_border_violation"), bad, bad]);
    expect((await readCurvePages(d, r2.page, () => true)).stopped).toBeNull();
  });

  it(`plafond : ${CURVE_PAGES_PER_PASS} pages par passage ; le temps de la voie écoulé, les suivantes restent dues`, async () => {
    const r = rig(due(8).map((d) => page({ id: d.videoId })));
    const out = await readCurvePages(due(8), r.page, () => true);
    expect(out.pages).toBe(CURVE_PAGES_PER_PASS);
    expect(out.notReached.map((d) => d.id)).toEqual(["s6", "s7"]);
    let left = 1;
    const late = await readCurvePages(due(3), rig([page({ id: due(3)[0].videoId })]).page, () => left-- > 0);
    expect(late.pages).toBe(1);
    expect(late.notReached).toHaveLength(2);
  });

  it("un identifiant qui n'est pas celui d'une vidéo TikTok : pas de page, payant", async () => {
    const r = rig([]);
    const out = await readCurvePages([{ id: "s", videoId: "e2e-1", handle: "x" }], r.page, () => true);
    expect(r.urls).toEqual([]);
    expect(out.reads[0].verdict).toEqual({ kind: "paid", refused: false, why: "pas une vidéo TikTok" });
  });
});

describe("Radar — courbe : la bascule (CURVE_FREE vrai)", () => {
  const verdict = (v: CurveVerdict) => [{ due: due(1)[0], verdict: v }];

  it("relevé gratuit appliqué : la page est rangée, aucun crédit, un appel évité", async () => {
    const r = rig([]);
    const t = await settleCurve(verdict({ kind: "read", counts: LUE }), r.io, { free: true, paidLeft: 13 });
    expect(r.applied).toEqual([{ id: "s0", counts: LUE }]);
    expect(r.paidFor).toEqual([]);
    expect(t).toMatchObject({ free: 1, gone: 0, paid: 0, credits: 0, reasons: {} });
  });

  it("supprimée ou privée : la vidéo sort de la courbe, sans crédit, comme quand le payant échouait", async () => {
    const r = rig([]);
    const t = await settleCurve(verdict({ kind: "gone", why: "removed" }), r.io, { free: true, paidLeft: 13 });
    expect(r.applied).toEqual([{ id: "s0", counts: null }]);
    expect(r.paidFor).toEqual([]);
    expect(t.gone).toBe(1);
  });

  it("page illisible : repli payant, rangé comme avant ; le payant échoue, la vidéo sort ; plus de part, elle reste due", async () => {
    const illisible: CurveVerdict = { kind: "paid", refused: true, why: "balise de réhydratation absente" };
    const r = rig([]);
    const t = await settleCurve(verdict(illisible), r.io, { free: true, paidLeft: 13 });
    expect(r.applied).toEqual([{ id: "s0", counts: PAYE }]);
    expect(t).toMatchObject({ free: 0, paid: 1, credits: 1, reasons: { repli: 1 } });
    const panne = rig([], [{ ok: false, credits: 0, noCredits: false }]);
    expect((await settleCurve(verdict(illisible), panne.io, { free: true, paidLeft: 13 })).errors).toBe(1);
    expect(panne.applied).toEqual([{ id: "s0", counts: null }]);
    const sansPart = rig([]);
    const w = await settleCurve(verdict(illisible), sansPart.io, { free: true, paidLeft: 0 });
    expect(sansPart.applied).toEqual([]);
    expect(w.waiting.map((d) => d.id)).toEqual(["s0"]);
  });

  it("plus de crédits : la vidéo et les suivantes restent dues ; les pages lues sont rangées quand même", async () => {
    const d = due(3);
    const r = rig([], [{ ok: false, credits: 0, noCredits: true }]);
    const t = await settleCurve(
      [
        { due: d[0], verdict: { kind: "paid", refused: true, why: "HTTP 429" } },
        { due: d[1], verdict: { kind: "paid", refused: true, why: "HTTP 429" } },
        { due: d[2], verdict: { kind: "read", counts: LUE } },
      ],
      r.io,
      { free: true, paidLeft: 13 },
    );
    expect(r.paidFor).toEqual(["s0"]);
    expect(t.waiting.map((x) => x.id)).toEqual(["s0", "s1"]);
    expect(r.applied).toEqual([{ id: "s2", counts: LUE }]);
  });
});

describe("Radar — courbe : en mesure tant que la page arrondit (CURVE_FREE faux)", () => {
  it("livrée en mesure : la page est lue, le payant part quand même", () => {
    expect(CURVE_FREE).toBe(false);
  });

  it("chaque vidéo lue sur sa page part aussi au payant ; le PAYANT est rangé ; l'accord est compté, aucun appel évité", async () => {
    const d = due(4);
    const r = rig([], [
      { ok: true, credits: 1, counts: PAYE },
      { ok: true, credits: 1, counts: null },
      { ok: true, credits: 1, counts: { ...PAYE, likes: 900 } },
      { ok: true, credits: 1, counts: PAYE },
    ]);
    const t = await settleCurve(
      [
        { due: d[0], verdict: { kind: "read", counts: LUE } },
        { due: d[1], verdict: { kind: "gone", why: "removed" } },
        { due: d[2], verdict: { kind: "read", counts: LUE } },
        { due: d[3], verdict: { kind: "paid", refused: true, why: "HTTP 429" } },
      ],
      r.io,
      { free: false, paidLeft: 4 },
    );
    expect(r.paidFor).toEqual(["s0", "s1", "s2", "s3"]);
    expect(r.applied).toEqual([
      { id: "s0", counts: PAYE },
      { id: "s1", counts: null },
      { id: "s2", counts: { ...PAYE, likes: 900 } },
      { id: "s3", counts: PAYE },
    ]);
    expect(t).toMatchObject({ free: 0, gone: 0, paid: 4, credits: 4 });
    expect(t.reasons).toEqual({ proche: 1, egal: 1, ecart: 1, repli: 1 });
    expect(t.measured).toEqual({ proche: 1, egal: 1, ecart: 1 });
    expect(t.gaps.map((g) => g.due.id)).toEqual(["s2"]);
  });

  it("l'arrondi de la page : exacte sous 10 000, à la centaine, puis à la centaine de milliers au-delà du million", () => {
    expect([pageStep(9_999), pageStep(16_805), pageStep(999_999), pageStep(12_834_567)]).toEqual([1, 100, 100, 100_000]);
    const lue = (views: number): CurveVerdict => ({ kind: "read", counts: { ...LUE, views } });
    expect(curveMatch(lue(16_805), PAYE)).toBe("egal");
    expect(curveMatch(lue(16_800), PAYE)).toBe("proche");
    expect(curveMatch(lue(12_800_000), { ...PAYE, views: 12_834_567 })).toBe("proche");
    expect(curveMatch(lue(50_000), { ...PAYE, views: 51_000 })).toBe("ecart");
    expect(curveMatch(lue(16_800), null)).toBe("ecart");
    expect(curveMatch({ kind: "gone", why: "private" }, null)).toBe("egal");
    expect(curveMatch({ kind: "gone", why: "private" }, PAYE)).toBe("ecart");
  });
});

describe("Radar — courbe : ses pages comptent dans la voie gratuite", () => {
  it(`${CURVE_PAGES_PER_PASS} pages par passage × ${LANE_PASSES_PER_DAY} passages = ${CURVE_PAGES_PER_DAY} pages par jour, ${CURVE_PAGES_PER_VIDEO} par vidéo : 288 admissions au plus`, () => {
    expect(CURVE_PAGES_PER_DAY).toBe(864);
    expect(CURVE_ADMISSIONS_MAX).toBe(288);
    expect(curveAdmissionsLeft(budget(100), 0)).toBe(100);
    expect(curveAdmissionsLeft(budget(400), 0)).toBe(288);
    expect(curveAdmissionsLeft(budget(400), 280)).toBe(8);
    expect(curveAdmissionsLeft(budget(400, false), 0)).toBe(0);
  });

  it("ce que la voie prend à un passage : le plafond ; en mesure, pas plus que la part payante ; poste éteint, rien", () => {
    expect(curveLaneTake(budget(100), true, 0)).toBe(CURVE_PAGES_PER_PASS);
    expect(curveLaneTake(budget(100), false, 13)).toBe(CURVE_PAGES_PER_PASS);
    expect(curveLaneTake(budget(100), false, 2)).toBe(2);
    expect(curveLaneTake(budget(100), false, 0)).toBe(0);
    expect(curveLaneTake(budget(100, false), true, 13)).toBe(0);
  });

  it("un relevé payant se range sous la forme de la courbe", () => {
    expect(curveCountsOf({ ...PAYE, videoId: "1", caption: "x" } as CurveCounts)).toEqual(PAYE);
  });
});
