import fs from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RESERVE_MISS_WAIT_MS, noFansMatch, type CurveMatch } from "../../convex/radar/radarFreeMath";
import type { CtxCall } from "./action-ctx";
import { NOW, SC_KEY, SCENARIOS, TH_KEY, comparable, runScenario, type FetchCall } from "./briques-banc";

/**
 * LES BRIQUES GRATUITES DE MAIN, BASCULE TIKHUB ABSENTE ET POSÉE (20/11/2026). Le banc (tests/radar/briques-banc.ts)
 * rejoue cinq passages où chaque brique agit : relevés de comptes au solde large et sous la réserve de
 * ScrapeCreators (#26 briques 7 et 8, brique 4 en mesure, #25 en mesure), recherche du réseau (#24), transcriptions
 * (#19), au solde large et près du plafond du mois. La référence `fixtures/briques-2191a8b.json` a été écrite par
 * ce test (GOLDEN_WRITE=1) sur main, avec ce banc ; jamais sur le code de la bascule : d'abord sur b4814df, puis le
 * 21/11/2026 sur 2191a8b (qui rejouait l'enregistrement b4814df à l'identique), les réponses servies ré-anonymisées.
 *  - BASCULE ABSENTE (sans réglage, réglage sans clé, clé sans réglage) : les mêmes appels, les mêmes écritures, les
 *    mêmes saved et measured, à l'identique ;
 *  - BASCULE POSÉE : la porte gratuite d'abord, puis le fournisseur — les mêmes pages publiques lues, les mêmes ratés
 *    retenus, les mêmes appels évités (saved) et la même mesure (measured) que main — celle de la courbe rangée sans
 *    les abonnés quand TikHub sert le payant (radarFreeMath.CurveMatchNoFans) ; ce que la brique laisse au payant
 *    part chez TikHub ; ce qu'elle décide de ne pas payer n'est payé nulle part ; la réserve de ScrapeCreators ne bloque
 *    pas un poste que TikHub sert (le passage sous la réserve est celui d'un solde large, plus la sonde) ; les
 *    transcriptions, qui restent chez ScrapeCreators, sont celles de main à l'identique.
 */

const FILE = path.join(__dirname, "fixtures/briques-2191a8b.json");
const ENV_KEYS = ["TIKHUB_API_KEY", "RADAR_TIKHUB", "SCRAPECREATORS_API_KEY"] as const;

let savedEnv: Record<string, string | undefined>;
beforeEach(() => {
  savedEnv = Object.fromEntries(ENV_KEYS.map((k) => [k, process.env[k]]));
  for (const k of ENV_KEYS) delete process.env[k];
  process.env.SCRAPECREATORS_API_KEY = SC_KEY;
  vi.useFakeTimers({ toFake: ["Date", "setTimeout", "clearTimeout"] });
  vi.spyOn(Math, "random").mockReturnValue(0.5);
  vi.spyOn(console, "error").mockImplementation(() => undefined);
  vi.spyOn(console, "warn").mockImplementation(() => undefined);
  vi.spyOn(console, "log").mockImplementation(() => undefined);
});
afterEach(() => {
  for (const k of ENV_KEYS) {
    if (savedEnv[k] === undefined) delete process.env[k];
    else process.env[k] = savedEnv[k];
  }
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

type Comparable = ReturnType<typeof comparable>;
const runAll = async (): Promise<Comparable[]> => {
  const out: Comparable[] = [];
  for (const s of SCENARIOS) out.push(comparable(await runScenario(s)));
  return out;
};
const run = async (name: string): Promise<Comparable> => comparable(await runScenario(SCENARIOS.find((s) => s.name === name)!));
let reference: Comparable[] | null = null;
const ref = (name: string): Comparable => (reference ??= JSON.parse(fs.readFileSync(FILE, "utf8")) as Comparable[]).find((r) => r.name === name)!;

// ─── Lire un passage ─────────────────────────────────────────────────────────────────────────────────────────────

const fetchesOf = (r: Comparable): FetchCall[] => r.fetches.map((x) => JSON.parse(x) as FetchCall);
const callsOf = (r: Comparable): CtxCall[] => r.ctx.map((x) => JSON.parse(x) as CtxCall);
const host = (url: string) => new URL(url).hostname;
/** Les pages publiques de TikTok (profils, vidéos, hashtags, sous-titres) : gratuites. */
const isFree = (url: string) => host(url) === "www.tiktok.com" || url.startsWith("https://example.invalid/asr-");
const isSc = (url: string) => host(url) === "api.scrapecreators.com";
/** Un appel facturé chez TikHub (le solde et les tarifs ne le sont pas). */
const isThPaid = (url: string) => host(url) === "api.tikhub.io" && !new URL(url).pathname.startsWith("/api/v1/tikhub/user/");
const urls = (r: Comparable, keep: (url: string) => boolean) => fetchesOf(r).map((f) => f.url).filter(keep).sort();
const args = (r: Comparable, name: string) => callsOf(r).filter((c) => c.name === `radar/${name}`).map((c) => c.args);
/** La somme d'un compteur de radarUsage (saved, measured, reasons) sur les lignes écrites d'un poste. */
function tally(r: Comparable, field: "saved" | "measured" | "reasons", poste: string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const a of args(r, "radarSignals:recordRun")) {
    if (a.poste !== poste) continue;
    for (const [k, n] of Object.entries((a[field] as Record<string, number> | undefined) ?? {})) out[k] = (out[k] ?? 0) + n;
  }
  return out;
}
/**
 * La mesure de la courbe telle qu'elle doit se lire quand TikHub sert le payant (radarFreeMath.CurveMatchNoFans) : les
 * mêmes verdicts que main sur une page lue, rangés à part — cinq compteurs comparés, les abonnés non mesurés. Vrai ici
 * parce que les six compteurs du banc sont égaux : cinq le sont aussi.
 */
const noFans = (t: Record<string, number>): Record<string, number> =>
  Object.fromEntries(Object.entries(t).map(([k, n]) => [["egal", "proche", "ecart"].includes(k) ? noFansMatch(k as CurveMatch) : k, n]));
/** Les comptes relevés en payant (handle chez ScrapeCreators, unique_id chez TikHub), triés. */
const paidHandles = (r: Comparable, keep: (url: string) => boolean) =>
  fetchesOf(r)
    .filter((f) => keep(f.url) && /profile\/videos|fetch_user_post_videos/.test(f.url))
    .map((f) => new URL(f.url).searchParams.get("handle") ?? new URL(f.url).searchParams.get("unique_id"))
    .sort();
/** Les vidéos de la courbe relevées en payant (url chez ScrapeCreators, share_url chez TikHub), triées. */
const paidVideos = (r: Comparable, keep: (url: string) => boolean) =>
  fetchesOf(r)
    .filter((f) => keep(f.url) && /\/v2\/tiktok\/video|fetch_one_video_by_share_url/.test(f.url))
    .map((f) => new URL(f.url).searchParams.get("url") ?? new URL(f.url).searchParams.get("share_url"))
    .sort();
const finishOf = (r: Comparable, app: string) => {
  const found = args(r, "radarNetworks:finishNetworkSearch").filter((a) => a.appId === `radarApps_${app}`);
  return found.map(({ now: _now, ...rest }) => rest);
};

const on = (jobs: string) => {
  process.env.TIKHUB_API_KEY = TH_KEY;
  process.env.RADAR_TIKHUB = jobs;
};

// ─── Bascule absente : main à l'identique ────────────────────────────────────────────────────────────────────────

describe("bascule absente : les briques gratuites font ce que fait main (2191a8b)", () => {
  it("sans réglage TikHub : appels, écritures, saved et measured identiques", async () => {
    const runs = await runAll();
    if (process.env.GOLDEN_WRITE === "1") {
      fs.writeFileSync(FILE, `${JSON.stringify(runs, null, 1)}\n`);
      return;
    }
    expect(runs).toEqual(JSON.parse(fs.readFileSync(FILE, "utf8")));
  });

  // Sans quoi l'égalité ne prouverait rien sur elles : chaque brique agit dans la référence de main.
  it("la référence couvre chaque brique", () => {
    const large = ref("releves:solde-large");
    const reserve = ref("releves:sous-la-reserve");
    // #26 brique 7 : le raté frais retenu, le raté retenu au passage d'avant payé, le retenu relu gratuitement.
    expect(args(large, "radarNetworks:holdFreeMisses")).toEqual([{ ids: ["radarTracked_rate"], at: NOW }]);
    expect(paidHandles(large, isSc)).toEqual(["rate_encore", "troue"]);
    expect(tally(large, "saved", "tiktok")).toEqual({ repli: 1 });
    // Brique 4 et #25, en mesure : la page lue, le payant parti quand même, l'accord des deux compté.
    expect(tally(large, "measured", "tiktok")).toEqual({ "trou-paye:absente": 1 });
    expect(tally(large, "measured", "curve")).toEqual({ egal: 1, repli: 1 });
    expect(paidVideos(large, isSc)).toHaveLength(2);
    expect(urls(large, (u) => u.includes("/@troue/video/"))).toHaveLength(1);
    // #26 brique 8 : sous la réserve, les ratés qui partiraient au payant attendent la sonde ; le raté frais est relu au
    // passage suivant ; la courbe et la page du trou ne sont pas lues ; seule la sonde paie (le premier compte dû).
    expect(args(reserve, "radarNetworks:deferAccounts")).toEqual([{ ids: ["radarTracked_rate_encore", "radarTracked_troue"], until: NOW + RESERVE_MISS_WAIT_MS }]);
    expect(args(reserve, "radarNetworks:holdFreeMisses")).toEqual([]);
    expect(args(reserve, "radarSignals:dueCurve")).toEqual([]);
    expect(urls(reserve, (u) => u.includes("/@troue/video/"))).toEqual([]);
    expect(paidHandles(reserve, isSc)).toEqual(["lu"]);
    expect(tally(reserve, "reasons", "tiktok")).toEqual({ sonde: 1 });
    // #24 : le hashtag payé vide et absent sur sa page ne paie pas ses deux passes ; celui jamais payé paie.
    const net = ref("reseau:hashtags");
    expect(tally(net, "saved", "network")).toEqual({ hashtag: 2 });
    expect(urls(net, (u) => isSc(u) && u.includes("absentapp"))).toEqual([]);
    expect(urls(net, (u) => isSc(u) && u.includes("hashtag=focustown")).length).toBeGreaterThan(0);
    // #19 : la vidéo à piste ASR transcrite sans crédit, les trois autres au payant ; près du plafond, le payant coupé,
    // la voie gratuite transcrit quand même.
    const tr = ref("transcriptions");
    expect(tally(tr, "saved", "transcript")).toEqual({ transcript: 1 });
    expect(urls(tr, isSc)).toHaveLength(3);
    const cut = ref("transcriptions:plafond-proche");
    expect(args(cut, "radarSources:dueTranscripts").map((a) => a.limit)).toEqual([0]);
    expect(urls(cut, isSc)).toEqual([]);
    expect(args(cut, "radarSources:setTranscript").map((a) => a.signalId)).toEqual(["radarSignals_t1"]);
  });

  it("RADAR_TIKHUB posé, clé TikHub absente : identique", async () => {
    process.env.RADAR_TIKHUB = "all,search,network-all";
    expect(await runAll()).toEqual(JSON.parse(fs.readFileSync(FILE, "utf8")));
  });

  it("clé TikHub posée, RADAR_TIKHUB absent : identique, aucun appel à TikHub (solde compris), aucun champ TikHub écrit", async () => {
    process.env.TIKHUB_API_KEY = TH_KEY;
    const runs = await runAll();
    expect(runs).toEqual(JSON.parse(fs.readFileSync(FILE, "utf8")));
    for (const r of runs) {
      for (const f of fetchesOf(r)) expect(host(f.url)).not.toBe("api.tikhub.io");
      for (const a of args(r, "radarSignals:recordRun")) expect(Object.keys(a).filter((k) => k.startsWith("th"))).toEqual([]);
    }
  });
});

// ─── Bascule posée : la porte gratuite d'abord, puis le fournisseur ──────────────────────────────────────────────

describe("bascule posée : une brique évite toujours le payant ; la réserve de ScrapeCreators ne bloque pas un poste servi par TikHub", () => {
  it("relevés, solde large, RADAR_TIKHUB=all : mêmes pages publiques, mêmes ratés retenus et relus, même mesure que main ; le payant chez TikHub, rien chez ScrapeCreators", async () => {
    on("all");
    const got = await run("releves:solde-large");
    const main = ref("releves:solde-large");
    expect(urls(got, isFree)).toEqual(urls(main, isFree));
    for (const name of ["radarNetworks:holdFreeMisses", "radarNetworks:markGapChecked", "radarNetworks:deferAccounts", "radarNetworks:noteFreeRun"]) expect(args(got, name)).toEqual(args(main, name));
    for (const field of ["saved", "measured", "reasons"] as const) expect(tally(got, field, "tiktok"), `tiktok ${field}`).toEqual(tally(main, field, "tiktok"));
    // La courbe : les mêmes relevés évités et la même mesure, celle-ci rangée sans les abonnés (TikHub ne les mesure pas).
    expect(tally(got, "saved", "curve")).toEqual(tally(main, "saved", "curve"));
    expect(tally(main, "measured", "curve")).toEqual({ egal: 1, repli: 1 });
    for (const field of ["measured", "reasons"] as const) expect(tally(got, field, "curve"), `curve ${field}`).toEqual(noFans(tally(main, field, "curve")));
    // Ce que les briques laissent au payant : les mêmes comptes et les mêmes vidéos que main, chez TikHub.
    expect(urls(got, isSc)).toEqual([]);
    expect(paidHandles(got, isThPaid)).toEqual(paidHandles(main, isSc));
    expect(paidVideos(got, isThPaid)).toEqual(paidVideos(main, isSc));
    // Le raté retenu (brique 7) n'est payé nulle part.
    expect(paidHandles(got, (u) => isSc(u) || isThPaid(u))).not.toContain("rate");
  });

  it("relevés sous la réserve de ScrapeCreators, RADAR_TIKHUB=all : rien n'attend la sonde — le passage est celui du solde large (brique 7 comprise), plus la sonde, seul appel ScrapeCreators", async () => {
    on("all");
    const got = await run("releves:sous-la-reserve");
    const main = ref("releves:sous-la-reserve");
    const large = ref("releves:solde-large");
    expect(args(got, "radarNetworks:deferAccounts")).toEqual([]);
    expect(urls(got, isFree)).toEqual(urls(large, isFree));
    expect(args(got, "radarNetworks:holdFreeMisses")).toEqual(args(large, "radarNetworks:holdFreeMisses"));
    expect(args(got, "radarNetworks:markGapChecked")).toEqual(args(large, "radarNetworks:markGapChecked"));
    expect(Number(args(got, "radarSignals:dueCurve")[0]?.limit)).toBeGreaterThan(0);
    for (const field of ["saved", "measured"] as const) expect(tally(got, field, "tiktok"), `tiktok ${field}`).toEqual(tally(large, field, "tiktok"));
    expect(tally(got, "saved", "curve")).toEqual(tally(large, "saved", "curve"));
    for (const field of ["measured", "reasons"] as const) expect(tally(got, field, "curve"), `curve ${field}`).toEqual(noFans(tally(large, field, "curve")));
    expect(tally(got, "reasons", "tiktok")).toEqual({ ...tally(large, "reasons", "tiktok"), sonde: 1 });
    expect(paidHandles(got, isThPaid)).toEqual(paidHandles(large, isSc));
    expect(paidVideos(got, isThPaid)).toEqual(paidVideos(large, isSc));
    // ScrapeCreators, lui, reste sous sa réserve : sa sonde, comme sur main, et rien d'autre.
    expect(urls(got, isSc)).toEqual(urls(main, isSc));
    expect(urls(main, isSc)).toHaveLength(1);
  });

  it("réseau, RADAR_TIKHUB=network : mêmes pages de hashtag que main ; le hashtag payé vide et absent ne paie nulle part ; celui jamais payé passe par TikHub", async () => {
    on("network");
    const got = await run("reseau:hashtags");
    const main = ref("reseau:hashtags");
    expect(urls(got, isFree)).toEqual(urls(main, isFree));
    for (const field of ["saved", "measured"] as const) expect(tally(got, field, "network")).toEqual(tally(main, field, "network"));
    // absentapp : ni son identifiant, ni sa liste chez TikHub, ni ScrapeCreators ; la même issue que sur main.
    expect(urls(got, (u) => (isSc(u) || isThPaid(u)) && u.includes("absentapp"))).toEqual([]);
    expect(finishOf(got, "absentapp")).toEqual(finishOf(main, "absentapp"));
    // focustown : ce que la porte laisse au payant part par l'aiguilleur (son identifiant, puis sa liste, chez TikHub).
    expect(urls(got, (u) => isThPaid(u) && u.includes("fetch_hashtag_video_list")).length).toBeGreaterThan(0);
    // Ce que le tri a vu de chaque hashtag (absent, complet, compteur inchangé) est celui de main.
    const seen = (r: Comparable, app: string) => (finishOf(r, app)[0]?.tags as Record<string, unknown>[] | undefined)?.map((t) => [t.tag, t.absent, t.same, t.complete, t.recheck]);
    for (const app of ["focustown", "compteapp"]) expect(seen(got, app), app).toEqual(seen(main, app));
  });

  it("transcriptions, RADAR_TIKHUB=all : restées chez ScrapeCreators, identiques à main (voie gratuite, payant, saved)", async () => {
    on("all");
    expect(await run("transcriptions")).toEqual(ref("transcriptions"));
  });

  it("transcriptions près du plafond, RADAR_TIKHUB=all : la voie gratuite est celle de main ; la part payante, jugée aux prix des fournisseurs réglés, n'est plus coupée et part chez ScrapeCreators", async () => {
    on("all");
    const got = await run("transcriptions:plafond-proche");
    const main = ref("transcriptions:plafond-proche");
    expect(urls(got, isFree)).toEqual(urls(main, isFree));
    expect(args(got, "radarSources:markSubtitlesChecked")).toEqual(args(main, "radarSources:markSubtitlesChecked"));
    const freeText = (r: Comparable) => args(r, "radarSources:setTranscript").filter((a) => a.text === "hello from the page");
    expect(freeText(got)).toEqual(freeText(main));
    // main coupe la part payante (projection au prix de ScrapeCreators partout) ; ici, un appel, chez ScrapeCreators.
    expect(args(got, "radarSources:dueTranscripts").map((a) => a.limit)).toEqual([1]);
    expect(urls(got, (u) => host(u) === "api.tikhub.io")).toEqual([]);
    expect(urls(got, isSc).map((u) => new URL(u).pathname)).toEqual(["/v1/tiktok/video/transcript"]);
    // Le texte gratuit de t1 remplace l'appel que cette part aurait fait (la tête de la file) : un appel évité.
    expect(tally(got, "saved", "transcript")).toEqual({ transcript: 1 });
  });
});
