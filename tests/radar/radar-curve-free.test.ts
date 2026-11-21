import fs from "node:fs";
import path from "node:path";
import { getFunctionName } from "convex/server";
import { describe, expect, it, vi } from "vitest";
import { internal } from "../../convex/_generated/api";
import {
  CURVE_BREAKER,
  CURVE_FREE,
  FREE_BREAKER,
  curveMatch,
  curveSaved,
  curveVerdict,
  freeVideoUrl,
  laneAfterCurve,
  paced,
  pageStep,
  readCurvePages,
  runFreeLane,
  scRefused,
  settleCurve,
  type CurvePaid,
  type CurveVerdict,
  type FreePage,
} from "../../convex/radar/radarFreeMath";
import {
  ACCOUNT_LEASE_MS,
  CURVE_ADMISSIONS_MAX,
  CURVE_LANE_WAIT_MS,
  CURVE_PAGES_PER_DAY,
  CURVE_PAGES_PER_PASS,
  CURVE_PAGES_PER_VIDEO,
  LANE_PASSES_PER_DAY,
  LANE_STALE_MS,
  budgetState,
  curveAdmissionsLeft,
  curveCountsOf,
  curveLaneTake,
  curveNetCutoff,
  normalizeBudget,
  type BudgetSettings,
  type CurveCounts,
} from "../../convex/radar/radarSignalsMath";
import { curveInLane, dueCurve, recordRun, type JobState } from "../../convex/radar/radarSignals";
import { memoryDb, type MemoryDoc } from "./convex-memory-db";

/** Le relevé payant d'une vidéo, tel que le fournisseur le rend (remplacé : pas d'appel réseau dans les tests). */
const sc = vi.hoisted(() => ({ next: [] as unknown[], urls: [] as string[] }));
vi.mock("../../convex/radar/scrapeCreatorsApi", async (orig) => ({
  ...(await orig<typeof import("../../convex/radar/scrapeCreatorsApi")>()),
  scVideoInfo: async (url: string) => {
    sc.urls.push(url);
    return sc.next.shift() ?? { ok: false, credits: 0, noCredits: false, error: "/v2/tiktok/video : rien de prévu" };
  },
}));

/**
 * Radar — la courbe des vues sur la page publique d'une vidéo (20/11/2026). Les pages d'essai ont la forme servie ce
 * jour-là : un bloc « __UNIVERSAL_DATA_FOR_REHYDRATION__ », `collectCount` en texte, les compteurs de 10 000 et plus
 * arrondis (16 805 vues servies « 16 800 »).
 */
const ID = "7705093697490134927";
const ID2 = "7704455091687794539";
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
    expect(t).toMatchObject({ free: 1, paid: 0, credits: 0, reasons: {} });
    expect(curveSaved(t, 13)).toBe(1);
  });

  it("supprimée ou privée : le payant confirme (0 crédit quand la vidéo est partie), elle sort de la courbe, aucun appel évité", async () => {
    const r = rig([], [{ ok: false, credits: 0, noCredits: false, refused: true }]);
    const t = await settleCurve(verdict({ kind: "gone", why: "removed" }), r.io, { free: true, paidLeft: 13 });
    expect(r.paidFor).toEqual(["s0"]);
    expect(r.applied).toEqual([{ id: "s0", counts: null }]);
    expect(t).toMatchObject({ free: 0, paid: 1, credits: 0, measured: { egal: 1 } });
    expect(curveSaved(t, 13)).toBe(0);
    // La page dit « partie », le fournisseur la lit : ses nombres sont rangés, la vidéo reste dans la courbe.
    const lue = rig([], [{ ok: true, credits: 1, counts: PAYE }]);
    const u = await settleCurve(verdict({ kind: "gone", why: "private" }), lue.io, { free: true, paidLeft: 13 });
    expect(lue.applied).toEqual([{ id: "s0", counts: PAYE }]);
    expect(u.measured).toEqual({ ecart: 1 });
    // Plus de part payante : elle reste due, comme avant.
    const sansPart = rig([]);
    expect((await settleCurve(verdict({ kind: "gone", why: "removed" }), sansPart.io, { free: true, paidLeft: 0 })).waiting).toHaveLength(1);
    expect(sansPart.applied).toEqual([]);
  });

  it("appels évités : seulement dans la part payante du passage — solde sous la réserve (part 0), aucun", async () => {
    const lue: CurveVerdict = { kind: "read", counts: LUE };
    const r = rig([]);
    const t = await settleCurve(verdict(lue), r.io, { free: true, paidLeft: 0 });
    expect(r.applied).toEqual([{ id: "s0", counts: LUE }]);
    expect(t.free).toBe(1);
    expect(curveSaved(t, 0)).toBe(0);
    // Part de 3 : 3 pages lues et 1 repli payant. Sans la page, 3 relevés payés au plus ; avec, 1 : 2 évités.
    const d = due(4);
    const r2 = rig([]);
    const illisible: CurveVerdict = { kind: "paid", refused: true, why: "HTTP 429" };
    const t2 = await settleCurve(
      [...d.slice(0, 3).map((x) => ({ due: x, verdict: lue })), { due: d[3], verdict: illisible }],
      r2.io,
      { free: true, paidLeft: 3 },
    );
    expect(t2).toMatchObject({ free: 3, paid: 1 });
    expect(curveSaved(t2, 3)).toBe(2);
    expect(curveSaved(t2, 13)).toBe(3);
  });

  it("page illisible : repli payant, rangé comme avant ; le payant échoue, la vidéo sort ; plus de part, elle reste due", async () => {
    const illisible: CurveVerdict = { kind: "paid", refused: true, why: "balise de réhydratation absente" };
    const r = rig([]);
    const t = await settleCurve(verdict(illisible), r.io, { free: true, paidLeft: 13 });
    expect(r.applied).toEqual([{ id: "s0", counts: PAYE }]);
    expect(t).toMatchObject({ free: 0, paid: 1, credits: 1, reasons: { repli: 1 } });
    const panne = rig([], [{ ok: false, credits: 0, noCredits: false, refused: false }]);
    expect((await settleCurve(verdict(illisible), panne.io, { free: true, paidLeft: 13 })).errors).toBe(1);
    expect(panne.applied).toEqual([{ id: "s0", counts: null }]);
    const sansPart = rig([]);
    const w = await settleCurve(verdict(illisible), sansPart.io, { free: true, paidLeft: 0 });
    expect(sansPart.applied).toEqual([]);
    expect(w.waiting.map((d) => d.id)).toEqual(["s0"]);
  });

  it("plus de crédits : la vidéo et les suivantes restent dues ; les pages lues sont rangées quand même", async () => {
    const d = due(3);
    const r = rig([], [{ ok: false, credits: 0, noCredits: true, refused: false }]);
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
    expect(t).toMatchObject({ free: 0, paid: 4, credits: 4 });
    expect(curveSaved(t, 4)).toBe(0);
    expect(t.reasons).toEqual({ proche: 1, egal: 1, ecart: 1, repli: 1 });
    expect(t.measured).toEqual({ proche: 1, egal: 1, ecart: 1, repli: 1 });
    expect(t.gaps.map((g) => g.due.id)).toEqual(["s2"]);
  });

  it("la mesure est comptée en vidéos, facturée ou non ; un payant en panne ne vaut pas un accord", async () => {
    const d = due(3);
    const r = rig([], [
      // Partie des deux côtés : le fournisseur refuse la vidéo, sans rien facturer.
      { ok: false, credits: 0, noCredits: false, refused: true },
      // La page lue, le payant en panne (délai) : pas de mesure, « panne ».
      { ok: false, credits: 0, noCredits: false, refused: false },
      // La page « partie », le payant en panne : pas un accord non plus.
      { ok: false, credits: 0, noCredits: false, refused: false },
    ]);
    const t = await settleCurve(
      [
        { due: d[0], verdict: { kind: "gone", why: "removed" } },
        { due: d[1], verdict: { kind: "read", counts: LUE } },
        { due: d[2], verdict: { kind: "gone", why: "private" } },
      ],
      r.io,
      { free: false, paidLeft: 3 },
    );
    expect(t.credits).toBe(0);
    expect(t.reasons).toEqual({});
    expect(t.measured).toEqual({ egal: 1, panne: 2 });
    expect(r.applied.map((a) => a.counts)).toEqual([null, null, null]);
  });

  it("le fournisseur refuse la vidéo (4xx) ou tombe en panne (délai, 5xx, 429)", () => {
    expect(scRefused("HTTP 404 /v2/tiktok/video : Video not found")).toBe(true);
    expect(scRefused("HTTP 400 /v2/tiktok/video : bad url")).toBe(true);
    expect(scRefused("HTTP 402 /v2/tiktok/video : no credits")).toBe(false);
    expect(scRefused("HTTP 429 /v2/tiktok/video : slow down")).toBe(false);
    expect(scRefused("HTTP 500 /v2/tiktok/video : oops")).toBe(false);
    expect(scRefused("/v2/tiktok/video : The operation was aborted due to timeout")).toBe(false);
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

  it("les enregistrements sont servis exacts : aucun arrondi toléré ; la page AU-DESSUS du payant, lu après elle, n'est pas de la croissance", () => {
    const lue = (c: Partial<CurveCounts>): CurveVerdict => ({ kind: "read", counts: { ...LUE, ...c } });
    // 50 000 enregistrements d'écart au-delà du million : l'arrondi des vues (100 000) ne vaut pas pour eux.
    expect(curveMatch(lue({ saves: 1_000_000 }), { ...PAYE, saves: 1_050_000 })).toBe("ecart");
    // Quelques enregistrements de plus au payant, lu après : la croissance entre les deux lectures.
    expect(curveMatch(lue({ saves: 30_395 }), { ...PAYE, saves: 30_485 })).toBe("proche");
    // La page en a PLUS que le payant lu après elle : ni l'arrondi (exacts), ni la croissance.
    expect(curveMatch(lue({ saves: 30_500 }), { ...PAYE, saves: 30_485 })).toBe("ecart");
    // Les vues : l'arrondi dans les deux sens, la croissance dans le sens du temps seulement.
    expect(curveMatch(lue({ views: 16_900 }), PAYE)).toBe("proche");
    expect(curveMatch(lue({ views: 17_000 }), PAYE)).toBe("ecart");
    expect(curveMatch(lue({ views: 16_700 }), PAYE)).toBe("proche");
  });
});

describe("Radar — courbe : ses pages comptent dans la voie gratuite", () => {
  it(`${CURVE_PAGES_PER_PASS} pages par passage × ${LANE_PASSES_PER_DAY} passages = ${CURVE_PAGES_PER_DAY} pages par jour, ${CURVE_PAGES_PER_VIDEO} par vidéo : 288 admissions au plus`, () => {
    expect(CURVE_PAGES_PER_DAY).toBe(864);
    expect(CURVE_ADMISSIONS_MAX).toBe(288);
    expect(curveAdmissionsLeft(budget(100), 0, true)).toBe(100);
    expect(curveAdmissionsLeft(budget(400), 0, true)).toBe(288);
    expect(curveAdmissionsLeft(budget(400), 280, true)).toBe(8);
    expect(curveAdmissionsLeft(budget(400, false), 0, true)).toBe(0);
  });

  it("en mesure, le plafond de pages ne retire aucune vidéo réglée : chaque relevé part au payant de toute façon", () => {
    expect(curveAdmissionsLeft(budget(400), 0, false)).toBe(400);
    expect(curveAdmissionsLeft(budget(400), 300, false)).toBe(100);
    expect(curveAdmissionsLeft(budget(400), 0, CURVE_FREE)).toBe(400);
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

describe("Radar — courbe : un seul coupe-circuit pour la file de la voie (revue du 20/11/2026)", () => {
  const refus: FreePage = { ok: false, kind: "suspect", reason: "HTTP 429" };
  const profilRefuse = async () => ({ ok: false as const, why: "suspect" as const, reason: "HTTP 429" });

  it(`${CURVE_BREAKER} pages de courbe refusées, puis la voie s'arrête au PREMIER profil refusé : ${FREE_BREAKER} refus d'affilée au plus`, async () => {
    const r = rig([]);
    const curve = await readCurvePages(due(CURVE_BREAKER), r.page, () => true);
    expect(curve.streak).toBe(CURVE_BREAKER);
    expect(curve.stopped).not.toBeNull();
    const tried: string[] = [];
    const lane = await runFreeLane(
      ["a", "b", "c"],
      async (a) => {
        tried.push(a);
        return profilRefuse();
      },
      () => true,
      laneAfterCurve(curve.streak),
    );
    expect(tried).toEqual(["a"]);
    expect(lane.state.on).toBe(false);
    expect(lane.notReached).toEqual(["b", "c"]);
    expect(r.urls.length + tried.length).toBe(FREE_BREAKER);
  });

  it("la série reprise est celle de la FIN des pages de courbe ; une page servie la remet à zéro, un profil servi aussi", async () => {
    const d = due(4);
    const r = rig([refus, refus, refus, page({ id: d[3].videoId })]);
    expect((await readCurvePages(d, r.page, () => true)).streak).toBe(0);
    const r2 = rig([page({ id: d[0].videoId }), refus, refus]);
    const two = await readCurvePages(d.slice(0, 3), r2.page, () => true);
    expect(two.streak).toBe(2);
    const outcomes = [profilRefuse(), profilRefuse(), Promise.resolve({ ok: true as const }), profilRefuse()];
    const lane = await runFreeLane(["a", "b", "c", "d"], () => outcomes.shift()!, () => true, laneAfterCurve(two.streak));
    expect(lane.state).toMatchObject({ on: true, streak: 1 });
    expect(laneAfterCurve(0)).toMatchObject({ on: true, streak: 0 });
    expect(laneAfterCurve(99).streak).toBe(FREE_BREAKER - 1);
  });

  it("dans le passage : la voie part de la série de la courbe, la suite de la courbe n'est pas dans le Promise.all, attendue à la fin", () => {
    const src = fs.readFileSync(path.join(__dirname, "../../convex/radar/radarNetworks.ts"), "utf8");
    const start = src.indexOf("async function accountReadsPass");
    const pass = src.slice(start, src.indexOf("\n}\n", start));
    const at = pass.indexOf("await Promise.all([");
    const all = pass.slice(at, pass.indexOf("]);", at));
    expect(all).toMatch(/laneAfterCurve\(curve\.streak\)/);
    expect(all).not.toMatch(/curve\.rest|curveDone/);
    expect(pass.indexOf("const curveDone = curve.rest()")).toBeGreaterThan(-1);
    expect(pass.indexOf("const curveDone = curve.rest()")).toBeLessThan(at);
    expect(pass).toMatch(/\} finally \{\s*await curveDone;/);
    expect(pass).toMatch(/stopped: free\.stopped \?\? curve\.stopped/);
  });
});

const NOW = Date.UTC(2026, 10, 20, 17, 0);
const MIN = 60_000;

describe("Radar — courbe : la voie et le filet (runCurve) se partagent les relevés dus, sans trou ni double paiement", () => {
  it("le filet : ce que la voie n'a pas pris en 30 min ; voie arrêtée, tout ; passage en cours, rien de ce qu'il tient", () => {
    expect(curveNetCutoff(NOW, { lastFreeAt: NOW - 5 * MIN })).toBe(NOW - CURVE_LANE_WAIT_MS);
    expect(curveNetCutoff(NOW, { lastFreeAt: NOW - LANE_STALE_MS - 1 })).toBe(NOW);
    expect(curveNetCutoff(NOW, {})).toBe(NOW);
    // Un passage parti à NOW − 2 min tient ce qui était dû dans ]NOW − 32 min, NOW − 2 min].
    const leaseUntil = NOW - 2 * MIN + ACCOUNT_LEASE_MS;
    expect(curveNetCutoff(NOW, { leaseUntil, lastFreeAt: NOW - 5 * MIN })).toBe(NOW - 2 * MIN - CURVE_LANE_WAIT_MS);
    expect(curveNetCutoff(NOW, { leaseUntil, lastFreeAt: NOW - 3 * 60 * MIN })).toBe(NOW - 2 * MIN - CURVE_LANE_WAIT_MS);
    // Un verrou échu (passage coupé) ne compte plus.
    expect(curveNetCutoff(NOW, { leaseUntil: NOW - 1, lastFreeAt: NOW - 5 * MIN })).toBe(NOW - CURVE_LANE_WAIT_MS);
  });

  type Handler = { _handler: (ctx: unknown, args: unknown) => Promise<unknown> };
  const handler = (f: unknown) => (f as Handler)._handler;
  const sig = (n: number, nextCheckAt: number): MemoryDoc => ({
    _id: `radarSignals|${n}`,
    _creationTime: n,
    platform: "tiktok",
    videoId: String(n),
    authorHandle: "lea.revise",
    url: `https://www.tiktok.com/@lea.revise/video/${n}`,
    nextCheckAt,
  });
  const world = (settings: Record<string, unknown> | null) => ({
    // 7 : due PILE à la limite des deux fenêtres (le filet la prend, pas la voie).
    radarSignals: [sig(1, NOW - 40 * MIN), sig(2, NOW - 31 * MIN), sig(7, NOW - CURVE_LANE_WAIT_MS), sig(3, NOW - 20 * MIN), sig(4, NOW), sig(5, NOW + MIN), sig(6, 0)],
    radarSettings: settings ? [{ _id: "radarSettings|g", _creationTime: 0, key: "global", ...settings }] : [],
  });
  const ids = async (tables: Record<string, MemoryDoc[]>, args: Record<string, unknown>) =>
    ((await handler(dueCurve)({ db: memoryDb(tables).db }, { limit: 50, ...args })) as { videoId: string }[]).map((d) => d.videoId);

  it("dueCurve : la voie prend ]now − 30 min, now], le filet le reste ; ensemble, tout ce qui est dû, une fois", async () => {
    const w = world({ lastFreeAt: NOW - 5 * MIN });
    const lane = await ids(w, { now: NOW, since: NOW - CURVE_LANE_WAIT_MS });
    const net = await ids(w, { now: NOW, net: true });
    expect(lane).toEqual(["3", "4"]);
    expect(net).toEqual(["1", "2", "7"]);
    expect([...net, ...lane].sort()).toEqual(["1", "2", "3", "4", "7"]);
  });

  it("dueCurve : voie arrêtée (aucune fin de passage depuis 20 min), le filet prend tout ce qui est dû, comme avant", async () => {
    expect(await ids(world({ lastFreeAt: NOW - 25 * MIN }), { now: NOW, net: true })).toEqual(["1", "2", "7", "3", "4"]);
    expect(await ids(world(null), { now: NOW, net: true })).toEqual(["1", "2", "7", "3", "4"]);
  });

  it("dueCurve : un passage parti il y a 2 min tient ses vidéos ; le filet s'arrête avant elles", async () => {
    const t0 = NOW - 2 * MIN;
    const w = world({ lastFreeAt: NOW - 25 * MIN, accountsLeaseUntil: t0 + ACCOUNT_LEASE_MS });
    const held = await ids(w, { now: t0, since: t0 - CURVE_LANE_WAIT_MS });
    const net = await ids(w, { now: NOW, net: true });
    expect(held).toEqual(["2", "7", "3"]);
    expect(net).toEqual(["1"]);
  });
});

describe("Radar — courbe : le passage de la voie écrit ce qu'il a relevé, évité et mesuré (curveInLane)", () => {
  const job = (o: Partial<JobState> = {}): JobState => ({
    budget: budget(100),
    cursor: 0,
    usage: [],
    day: "2026-11-20",
    month: "2026-11",
    balance: null,
    creditAlerted: {},
    recentUsage: [],
    ...o,
  });
  const RECORD = getFunctionName(internal.radar.radarSignals.recordRun);
  const APPLY = getFunctionName(internal.radar.radarSignals.applyCurve);
  const DUE = getFunctionName(internal.radar.radarSignals.dueCurve);
  function fake(rows: { id: string; url: string; videoId: string; handle: string }[]) {
    const calls: { fn: string; args: Record<string, unknown> }[] = [];
    const ctx = {
      runQuery: async (ref: unknown, args: Record<string, unknown>) => {
        calls.push({ fn: getFunctionName(ref as never), args });
        return rows;
      },
      runMutation: async (ref: unknown, args: Record<string, unknown>) => {
        calls.push({ fn: getFunctionName(ref as never), args });
        return null;
      },
    };
    return { calls, ctx: ctx as never };
  }
  const one = [{ id: "radarSignals|1", url: `https://www.tiktok.com/@lea.revise/video/${ID}`, videoId: ID, handle: "lea.revise" }];
  const run = async (st: JobState, pages: FreePage[], free: boolean) => {
    const f = fake(one);
    const served = [...pages];
    const st2 = st;
    const out = await curveInLane(f.ctx, async () => served.shift() ?? { ok: false, kind: "suspect", reason: "HTTP 429" }, st2, budgetState(st2.budget, st2.usage, st2.balance), NOW, () => true, free);
    await out.rest();
    return { ...f, out };
  };

  it("bascule : une page lue est rangée, 0 crédit, saved.curve = 1 — la voie prend les dues de la demi-heure", async () => {
    sc.urls.length = 0;
    const { calls } = await run(job(), [page()], true);
    expect(calls.find((c) => c.fn === DUE)?.args).toMatchObject({ now: NOW, since: NOW - CURVE_LANE_WAIT_MS, limit: CURVE_PAGES_PER_PASS });
    expect(calls.find((c) => c.fn === APPLY)?.args).toMatchObject({ id: "radarSignals|1", video: LUE });
    expect(calls.find((c) => c.fn === RECORD)?.args).toMatchObject({ poste: "curve", credits: 0, calls: 1, errors: 0, saved: { curve: 1 } });
    expect(sc.urls).toEqual([]);
  });

  it("bascule, solde sous la réserve (part payante 0) : la page est rangée quand même, mais aucun appel évité", async () => {
    const st = job({ balance: { remaining: 1_400, seenAt: NOW, now: NOW, perDay: null } });
    const { calls } = await run(st, [page()], true);
    expect(calls.find((c) => c.fn === APPLY)?.args).toMatchObject({ video: LUE });
    const rec = calls.find((c) => c.fn === RECORD)?.args;
    expect(rec).toMatchObject({ credits: 0, calls: 1 });
    expect(rec?.saved).toBeUndefined();
  });

  it("mesure : « partie » sur la page, le fournisseur refuse la vidéo sans rien facturer — l'accord est écrit (en vidéos), pas une économie", async () => {
    sc.next.push({ ok: false, credits: 0, noCredits: false, error: "HTTP 404 /v2/tiktok/video : Video not found" });
    const { calls } = await run(job(), [refusee(10204, "item doesn't exist")], false);
    expect(calls.find((c) => c.fn === APPLY)?.args).toMatchObject({ video: null });
    const rec = calls.find((c) => c.fn === RECORD)?.args;
    expect(rec).toMatchObject({ poste: "curve", credits: 0, calls: 1, errors: 1, measured: { egal: 1 } });
    expect(rec?.saved).toBeUndefined();
    expect(rec?.reasons).toBeUndefined();
  });

  it("mesure : la page lue, le payant rangé ; ses pages refusées rendent leur série à la voie", async () => {
    sc.next.push({ ok: true, credits: 1, value: { ...PAYE, videoId: ID } });
    const { calls } = await run(job(), [page()], false);
    expect(calls.find((c) => c.fn === APPLY)?.args).toMatchObject({ video: PAYE });
    expect(calls.find((c) => c.fn === RECORD)?.args).toMatchObject({ credits: 1, calls: 1, reasons: { proche: 1 }, measured: { proche: 1 } });
    const refused = await run(job(), [], false);
    expect(refused.out.streak).toBe(1);
  });
});

describe("Radar — courbe : la mesure côte à côte est rangée dans radarUsage (recordRun)", () => {
  type Handler = { _handler: (ctx: unknown, args: unknown) => Promise<unknown> };
  const handler = (f: unknown) => (f as Handler)._handler;
  function usageCtx(rows: MemoryDoc[]) {
    const settings: MemoryDoc = { _id: "radarSettings|g", _creationTime: 0, key: "global" };
    const mem = memoryDb({ radarSettings: [settings], radarUsage: rows }, { limit: null });
    const db = mem.db as { get: (id: string) => Promise<MemoryDoc | null>; query: (t: string) => unknown };
    const inserted: { table: string; value: Record<string, unknown> }[] = [];
    const patched: { id: string; value: Record<string, unknown> }[] = [];
    const ctx = {
      db: {
        get: db.get,
        query: db.query,
        insert: async (table: string, value: Record<string, unknown>) => (inserted.push({ table, value }), `${table}|new`),
        patch: async (id: string, value: Record<string, unknown>) => void patched.push({ id, value }),
      },
    };
    return { ctx, inserted, patched };
  }

  it("en vidéos, même à 0 crédit ; ajoutée à la ligne du jour", async () => {
    const first = usageCtx([]);
    await handler(recordRun)(first.ctx, { poste: "curve", credits: 0, calls: 1, errors: 1, now: NOW, measured: { egal: 1 } });
    expect(first.inserted.find((i) => i.table === "radarUsage")?.value).toMatchObject({ poste: "curve", credits: 0, calls: 1, measured: { egal: 1 } });
    const row: MemoryDoc = { _id: "radarUsage|1", _creationTime: 1, day: "2026-11-20", month: "2026-11", poste: "curve", credits: 3, calls: 3, errors: 0, measured: { egal: 1, proche: 2 } };
    const next = usageCtx([row]);
    await handler(recordRun)(next.ctx, { poste: "curve", credits: 1, calls: 2, errors: 0, now: NOW, measured: { proche: 1, panne: 1 } });
    expect(next.patched.find((p) => p.id === "radarUsage|1")?.value).toMatchObject({ credits: 4, calls: 5, measured: { egal: 1, proche: 3, panne: 1 } });
  });
});
