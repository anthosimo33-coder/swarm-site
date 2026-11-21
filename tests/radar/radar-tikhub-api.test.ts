import fs from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  TH_ROUTES,
  hashtagKey,
  thBalance,
  thGet,
  thHashtagId,
  thHashtagPage,
  thKeywordPage,
  thPrices,
  thProfilePage,
  thSearchKeyword,
  thVideo,
  thVideoInfo,
} from "../../convex/radar/tikhubApi";
import { scProfileVideosPage, scVideoInfo } from "../../convex/radar/scrapeCreatorsApi";
import { parseScVideo } from "../../convex/radar/radarSignalsMath";

/**
 * Le client TikHub (20/11/2026) sur des réponses RÉELLES du banc, tronquées et anonymisées
 * (tests/radar/fixtures/tikhub, sc), et sur des réponses fabriquées pour les refus (synthetiques.json).
 */

const FIX = path.join(__dirname, "fixtures");
const fixture = (name: string) => JSON.parse(fs.readFileSync(path.join(FIX, name), "utf8")) as Record<string, unknown>;
const SYNTH = fixture("tikhub/synthetiques.json") as Record<string, unknown>;
const KEY = "cle-tikhub-de-test-0123456789";
const SC_KEY = "cle-sc-de-test-0123456789";

type Call = { url: string; headers: Record<string, string> };
function fakeFetch(answer: (url: string) => { status: number; body: unknown } | Error) {
  const calls: Call[] = [];
  const impl = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input);
    calls.push({ url, headers: { ...((init?.headers as Record<string, string>) ?? {}) } });
    const a = answer(url);
    if (a instanceof Error) throw a;
    return new Response(typeof a.body === "string" ? a.body : JSON.stringify(a.body), { status: a.status });
  });
  return { impl: impl as unknown as typeof fetch, calls };
}
const params = (url: string) => Object.fromEntries(new URL(url).searchParams.entries());

let saved: Record<string, string | undefined>;
beforeEach(() => {
  saved = { TIKHUB_API_KEY: process.env.TIKHUB_API_KEY, SCRAPECREATORS_API_KEY: process.env.SCRAPECREATORS_API_KEY };
  process.env.TIKHUB_API_KEY = KEY;
  process.env.SCRAPECREATORS_API_KEY = SC_KEY;
});
afterEach(() => {
  for (const [k, v] of Object.entries(saved)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
  vi.unstubAllGlobals();
});

describe("relevé de profil", () => {
  it("la paire réelle (même compte, même instant) se lit pareil chez TikHub et chez ScrapeCreators", async () => {
    const th = fakeFetch(() => ({ status: 200, body: fixture("tikhub/profil.json") }));
    const t = await thProfilePage("auteur_01", undefined, { fetchImpl: th.impl });
    const sc = fakeFetch(() => ({ status: 200, body: fixture("sc/profil.json") }));
    vi.stubGlobal("fetch", sc.impl);
    const s = await scProfileVideosPage("auteur_01");
    expect(t.ok && s.ok).toBe(true);
    if (!t.ok || !s.ok) return;
    expect(t.value.videos).toHaveLength(3);
    const same = (v: (typeof t.value.videos)[number]) => ({
      videoId: v.videoId,
      hook: v.hook,
      musicId: v.musicId,
      musicTitle: v.musicTitle,
      mentions: v.mentions,
      region: v.region,
      lang: v.lang,
      publishedAt: v.publishedAt,
      durationSec: v.durationSec,
      views: v.views,
      authorFans: v.authorFans,
      authorHandle: v.authorHandle,
      isAd: v.isAd,
      url: v.url,
      caption: v.caption.replace(/\s+/g, " ").trim(),
    });
    expect(t.value.videos.map(same)).toEqual(s.value.videos.map(same));
    expect(t.value.next).toBe(s.value.next);
    expect(t.value.next).not.toBeNull();
    expect(t.spend).toEqual({ th: 1, usd: 0.001, unknown: 0 });
  });

  it("paramètres : pseudo, 20, plus récentes d'abord (sort_type 0), curseur de la page d'avant", async () => {
    const f = fakeFetch(() => ({ status: 200, body: fixture("tikhub/profil.json") }));
    await thProfilePage("auteur_01", "1791001363473", { fetchImpl: f.impl });
    expect(f.calls[0].url.startsWith(`https://api.tikhub.io${TH_ROUTES.profile}?`)).toBe(true);
    expect(params(f.calls[0].url)).toEqual({ unique_id: "auteur_01", count: "20", sort_type: "0", max_cursor: "1791001363473" });
  });

  it("compte inexistant (« No more videos ») : liste vide, FACTURÉE ; ScrapeCreators, lui, répond 404 gratuit", async () => {
    const f = fakeFetch(() => ({ status: 200, body: fixture("tikhub/compte-inexistant.json") }));
    const r = await thProfilePage("auteur_inconnu", undefined, { fetchImpl: f.impl });
    expect(r).toEqual({ ok: true, value: { videos: [], next: null }, spend: { th: 1, usd: 0.001, unknown: 0 } });
    vi.stubGlobal("fetch", fakeFetch(() => ({ status: 404, body: fixture("sc/compte-inexistant.json") })).impl);
    const s = await scProfileVideosPage("auteur_inconnu");
    expect(s.ok).toBe(false);
    expect(s.credits).toBe(0);
  });
});

describe("recherches", () => {
  it("mot-clé du réseau : search_item_list est lu malgré aweme_list vide ; has_more 0 avec cursor 30 = pas de suite ; abonnés à 0 = non mesurés", async () => {
    const f = fakeFetch(() => ({ status: 200, body: fixture("tikhub/reseau-motcle.json") }));
    const r = await thKeywordPage("traceapp", 0, "FR", { fetchImpl: f.impl });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.rawCount).toBe(3);
    expect(r.value.videos).toHaveLength(3);
    expect(r.value.next).toBeUndefined();
    expect(r.value.fansUnknown).toEqual(["7707975289833260236"]);
  });

  it("mot-clé du réseau, page suivante : has_more 1 = page + 1 ; la pub sans is_ad est marquée", async () => {
    const f = fakeFetch(() => ({ status: 200, body: fixture("tikhub/reseau-page.json") }));
    const r = await thKeywordPage("getsaas", 2, "US", { fetchImpl: f.impl });
    expect(r.ok && r.value.next).toBe(3);
    if (!r.ok) return;
    expect(r.value.videos.find((v) => v.videoId === "7699113681379918966")?.isAd).toBe(true);
    expect(r.value.videos.filter((v) => v.isAd)).toHaveLength(1);
    expect(r.value.fansUnknown).toEqual(["7709909399505995044"]);
  });

  it("paramètres exacts : décalage 30 × page, pertinence, 3 mois, région explicite", async () => {
    const f = fakeFetch(() => ({ status: 200, body: fixture("tikhub/reseau-page.json") }));
    await thKeywordPage("getsaas", 2, "FR", { fetchImpl: f.impl });
    expect(params(f.calls[0].url)).toEqual({ keyword: "getsaas", count: "30", sort_type: "0", publish_time: "90", region: "FR", offset: "60" });
  });

  it("découverte : semaine, les plus aimées, région et langue ; la pub réelle (ad_source 1, sans is_ad) est marquée", async () => {
    const f = fakeFetch(() => ({ status: 200, body: fixture("tikhub/decouverte.json") }));
    const r = await thSearchKeyword("app para casal", "BR", "pt", { fetchImpl: f.impl });
    expect(params(f.calls[0].url)).toEqual({ keyword: "app para casal", count: "30", sort_type: "1", publish_time: "7", region: "BR" });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.videos.map((v) => [v.videoId, v.isAd])).toEqual([
      ["7709666557760111870", true],
      ["7708416305665148126", false],
      ["7708566393297306852", false],
    ]);
    expect(r.value.fansUnknown).toEqual([]);
  });

  it("thVideo : une vidéo réelle avec commerce_info.ad_source 1 et sans is_ad est une pub ; le parseur ScrapeCreators n'est pas touché", () => {
    const raw = ((fixture("tikhub/decouverte.json").data as Record<string, unknown>).search_item_list as unknown[])[0];
    expect(parseScVideo(raw)?.isAd).toBe(false);
    expect(thVideo(raw)?.isAd).toBe(true);
  });
});

/**
 * LES MENTIONS (corrigé le 20/11/2026). Le libellé d'une mention se lisait dans la légende aux positions de `text_extra`.
 * Or ces positions ne tombent juste sur aucune légende de façon sûre : TikHub (comme la recherche TikTok chez
 * ScrapeCreators) remplace chaque suite de retours à la ligne par une espace (une ligne vide raccourcit la légende d'un
 * caractère), ScrapeCreators rend les relevés de profil intacts, et les positions comptent tantôt en caractères, tantôt
 * en unités UTF-16. Sur le banc (113 mentions balisées), 6 libellés étaient faux, dont le début de la mention suivante
 * et le pseudo d'un autre compte que celui mentionné. Le libellé se lit désormais dans le balisage que TikTok joint à
 * chaque vidéo (`original_client_text.markup_text`, `<m id="…">@…</m>`, relié par `tag_id`), identique chez les deux
 * fournisseurs (172 vidéos communes sur 172).
 */
describe("mentions : le libellé balisé par TikTok, plus les positions", () => {
  const M = fixture("tikhub/mentions.json") as Record<string, any>;
  const labels = (v: { mentions?: { id: string; label: string }[] } | null) => (v?.mentions ?? []).map((m) => `${m.id} ${m.label}`);

  it("TikHub, une mention par ligne (légende aplatie) : chaque libellé est celui que TikTok balise — la 5e n'est plus lue « @Ju » (le début de la 6e)", () => {
    expect(labels(thVideo(M.thRecherche))).toEqual([
      "9200000000000000001 @Alpha",
      "9200000000000000002 @BravoCharlie",
      "9200000000000000003 @𝓞𝓪𝓴 🪁",
      "9200000000000000004 @Fox Golf Hotel",
      "9200000000000000005 @jet",
      "9200000000000000006 @Juliett",
    ]);
  });

  it("la même vidéo au même instant chez ScrapeCreators et chez TikHub : la même mention, sans le hashtag qui la suit", () => {
    expect(labels(parseScVideo(M.paire.sc))).toEqual(["9200000000000000007 @𝙺𝚒𝚕𝚘𝚜’"]);
    expect(labels(thVideo(M.paire.th))).toEqual(labels(parseScVideo(M.paire.sc)));
  });

  // La légende d'un relevé de profil, intacte chez ScrapeCreators ; chez TikHub, la même vidéo arrive aplatie (règle
  // mesurée sur les 223 légendes à plusieurs lignes du banc : chaque suite de retours à la ligne devient une espace ;
  // `text_extra` et le balisage identiques chez les deux sur 172 vidéos communes).
  it("légende intacte (ScrapeCreators) ou aplatie (TikHub) : les mêmes mentions, celle d'après la ligne vide comprise", () => {
    const sc = M.scProfil;
    const th = { ...sc, desc: sc.desc.replace(/\n+/g, " ") };
    const want = ["9200000000000000008 @TinvoluptAt. 🇵🇷", "9200000000000000009 @EStlaBorum"];
    expect(labels(parseScVideo(sc))).toEqual(want);
    expect(labels(thVideo(th))).toEqual(want);
  });

  // Le cas du constat du 20/11/2026 (« Mon app préférée », une mention après une ligne vide, aux positions de la légende
  // d'origine), avec le balisage que TikTok joint à toute vidéo : chez TikHub, la mention était perdue.
  it("une mention après une ligne vide, légende aplatie chez TikHub, positions d'origine : la mention n'est plus perdue", () => {
    const base = { aweme_id: "1", create_time: 1_795_000_000, author: { unique_id: "a", uid: "9" }, statistics: {}, video: {} };
    const extra = {
      text_extra: [{ type: 0, user_id: "77", start: 18, end: 26, tag_id: "1" }],
      original_client_text: { markup_text: 'Mon app préférée<br><br><m id="1">@Kilo AI</m>' },
    };
    expect(labels(parseScVideo({ ...base, ...extra, desc: "Mon app préférée\n\n@Kilo AI" }))).toEqual(["77 @Kilo AI"]);
    expect(labels(thVideo({ ...base, ...extra, desc: "Mon app préférée @Kilo AI" }))).toEqual(["77 @Kilo AI"]);
  });

  it("balisage : entités décodées ; sans balise de cette mention, ou une balise qui n'est pas une mention, les positions comme avant", () => {
    const base = { aweme_id: "1", create_time: 1_795_000_000, author: { unique_id: "a", uid: "9" }, statistics: {}, video: {}, desc: "Merci @Tango & Echo et @Lima !" };
    // Les positions de la 1re mention ne tombent pas sur elle (« Merci ») : seul le balisage la donne. Celles de la 2e
    // sont justes.
    const te = [
      { type: 0, user_id: "70", start: 0, end: 5, tag_id: "0#1" },
      { type: 0, user_id: "71", start: 23, end: 28, tag_id: "3" },
    ];
    // L'identifiant de balise réel peut porter un « # » (« 0#1 », réponse à un commentaire, th-decouverte-200.json).
    const markup = 'Merci <m id="0#1">@Tango &amp; Echo</m> et <m id="3">@Lima</m> !';
    expect(labels(thVideo({ ...base, text_extra: te, original_client_text: { markup_text: markup } }))).toEqual(["70 @Tango & Echo", "71 @Lima"]);
    // La balise de @Lima absente, puis remplacée par un texte sans « @ » : elle est lue aux positions.
    const sans = 'Merci <m id="0#1">@Tango &amp; Echo</m> et @Lima !';
    expect(labels(thVideo({ ...base, text_extra: te, original_client_text: { markup_text: sans } }))).toEqual(["70 @Tango & Echo", "71 @Lima"]);
    const faux = 'Merci <m id="0#1">@Tango &amp; Echo</m> et <m id="3">Lima</m> !';
    expect(labels(thVideo({ ...base, text_extra: te, original_client_text: { markup_text: faux } }))).toEqual(["70 @Tango & Echo", "71 @Lima"]);
    // Sans aucun balisage (réponse allégée, fixtures d'avant) : les positions, à l'identique — la 1re est perdue.
    expect(labels(thVideo({ ...base, text_extra: te }))).toEqual(["71 @Lima"]);
  });
});

describe("hashtags", () => {
  const challenges = () => (fixture("tikhub/hashtag-id.json").data as { challenge_list: unknown[] }).challenge_list;
  const withList = (l: unknown[]) => ({ ...fixture("tikhub/hashtag-id.json"), data: { status_code: 0, challenge_list: l } });

  it("l'identifiant est celui dont le nom est EXACTEMENT le hashtag, à la casse près, même s'il n'est pas le premier", async () => {
    const f = fakeFetch(() => ({ status: 200, body: withList([...challenges()].reverse()) }));
    const r = await thHashtagId("FocusTown", { fetchImpl: f.impl });
    expect(params(f.calls[0].url)).toEqual({ keyword: "FocusTown", count: "10" });
    expect(r.ok && r.value).toEqual({ cid: "6960094601675801580", name: "focustown" });
  });

  it("aucun nom exact : null (pas le premier voisin venu), facturé", async () => {
    const f = fakeFetch(() => ({ status: 200, body: withList(challenges().slice(1)) }));
    const r = await thHashtagId("focustown", { fetchImpl: f.impl });
    expect(r).toEqual({ ok: true, value: null, spend: { th: 1, usd: 0.001, unknown: 0 } });
  });

  it("forme normale Unicode : « é » composé ou décomposé, c'est le même nom", () => {
    expect(hashtagKey("Café")).toBe(hashtagKey("café"));
  });

  it("page de vidéos : identifiant, 20, curseur ; sans région, pas de paramètre ; suite quand has_more le dit", async () => {
    const f = fakeFetch(() => ({ status: 200, body: fixture("tikhub/hashtag-liste.json") }));
    const r = await thHashtagPage("6960094601675801580", undefined, undefined, { fetchImpl: f.impl });
    expect(params(f.calls[0].url)).toEqual({ ch_id: "6960094601675801580", count: "20", cursor: "0" });
    expect(r.ok && r.value.next).toBe(20);
    expect(r.ok && r.value.rawCount).toBe(3);
    await thHashtagPage("6960094601675801580", 20, "FR", { fetchImpl: f.impl });
    expect(params(f.calls[1].url)).toEqual({ ch_id: "6960094601675801580", count: "20", cursor: "20", region: "FR" });
  });
});

describe("détail d'une vidéo (courbe)", () => {
  it("même adresse que ScrapeCreators, mêmes vues ; les abonnés y valent 0 (non mesurés)", async () => {
    const url = "https://www.tiktok.com/@auteur_17/video/7709816632507368725";
    const f = fakeFetch(() => ({ status: 200, body: fixture("tikhub/video.json") }));
    const r = await thVideoInfo(url, { fetchImpl: f.impl });
    expect(params(f.calls[0].url)).toEqual({ share_url: url });
    expect(r.ok && r.value?.views).toBe((fixture("tikhub/video.json").data as { aweme_detail: { statistics: { play_count: number } } }).aweme_detail.statistics.play_count);
    expect(r.ok && r.value?.authorFans).toBe(0);
  });

  it("vidéo supprimée : 200 sans aweme_detail = null, facturé", async () => {
    const f = fakeFetch(() => ({ status: 200, body: SYNTH.videoSupprimee }));
    expect(await thVideoInfo("https://www.tiktok.com/@x/video/1", { fetchImpl: f.impl })).toEqual({ ok: true, value: null, spend: { th: 1, usd: 0.001, unknown: 0 } });
  });

  it("ScrapeCreators lit la même vidéo réelle avec ses abonnés (le lot de référence du banc)", async () => {
    vi.stubGlobal("fetch", fakeFetch(() => ({ status: 200, body: fixture("sc/video.json") })).impl);
    const s = await scVideoInfo("https://www.tiktok.com/@x/video/1");
    expect(s.ok && (s.value?.authorFans ?? 0) > 0).toBe(true);
  });
});

describe("statuts, clé, facturation", () => {
  const route = TH_ROUTES.profile;
  const status = async (code: number, body: unknown) => thGet(route, { unique_id: "x" }, { fetchImpl: fakeFetch(() => ({ status: code, body })).impl });

  it("402 : solde insuffisant, gratuit ; 401 et 403 : clé ; 429 : trop d'appels ; 5xx : panne ; autre 4xx : refus — tous gratuits", async () => {
    const none = { th: 0, usd: 0, unknown: 0 };
    const r402 = await status(402, SYNTH.refus402);
    expect(r402).toMatchObject({ ok: false, kind: "dry", status: 402, spend: none });
    expect(!r402.ok && r402.error).toBe(`HTTP 402 ${route} : Insufficient balance. Please recharge your account.`);
    expect(await status(401, SYNTH.refus401)).toMatchObject({ ok: false, kind: "key", spend: none });
    expect(await status(403, {})).toMatchObject({ ok: false, kind: "key", spend: none });
    expect(await status(429, SYNTH.refus429)).toMatchObject({ ok: false, kind: "rate", spend: none });
    expect(await status(500, SYNTH.refus500)).toMatchObject({ ok: false, kind: "down", spend: none });
    expect(await status(503, "<html>indisponible</html>")).toMatchObject({ ok: false, kind: "down", spend: none });
    expect(await status(400, { detail: { message: "bad param" } })).toMatchObject({ ok: false, kind: "bad", spend: none });
  });

  it("200 avec data.status_code ≠ 0 : échec FACTURÉ (TikTok a refusé)", async () => {
    const r = await status(200, SYNTH.upstream);
    expect(r).toMatchObject({ ok: false, kind: "upstream", spend: { th: 1, usd: 0.001, unknown: 0 } });
  });

  it("délai dépassé ou réseau : facturation inconnue, comptée à part", async () => {
    const timeout = Object.assign(new Error("The operation was aborted due to timeout"), { name: "TimeoutError" });
    const r = await thGet(route, { unique_id: "x" }, { fetchImpl: fakeFetch(() => timeout).impl });
    expect(r).toMatchObject({ ok: false, kind: "unknown", spend: { th: 0, usd: 0, unknown: 1 } });
  });

  it("corps non JSON en 200 : rendu tel quel (sans liste), facturé", async () => {
    const r = await thProfilePage("x", undefined, { fetchImpl: fakeFetch(() => ({ status: 200, body: "pas du json" })).impl });
    expect(r).toEqual({ ok: true, value: { videos: [], next: null }, spend: { th: 1, usd: 0.001, unknown: 0 } });
  });

  it("la clé part en en-tête Bearer, jamais dans l'adresse ni dans une erreur", async () => {
    const leak = new Error(`connect ECONNREFUSED https://api.tikhub.io/?k=${KEY}`);
    const f = fakeFetch((url) => (url.includes("unique_id=boom") ? leak : { status: 500, body: { detail: { message: `refus ${KEY}` } } }));
    const a = await thGet(route, { unique_id: "boom" }, { fetchImpl: f.impl });
    const b = await thGet(route, { unique_id: "x" }, { fetchImpl: f.impl });
    for (const c of f.calls) {
      expect(c.headers.Authorization).toBe(`Bearer ${KEY}`);
      expect(c.url).not.toContain(KEY);
    }
    expect(!a.ok && a.error).not.toContain(KEY);
    expect(!b.ok && b.error).not.toContain(KEY);
    expect(!b.ok && b.error).toContain("***");
  });

  it("clé absente : aucun appel", async () => {
    delete process.env.TIKHUB_API_KEY;
    const f = fakeFetch(() => ({ status: 200, body: {} }));
    const r = await thGet(route, { unique_id: "x" }, { fetchImpl: f.impl });
    expect(f.calls).toHaveLength(0);
    expect(r).toMatchObject({ ok: false, kind: "key", spend: { th: 0, usd: 0, unknown: 0 } });
  });

  it("le prix d'une route est son tarif lu, sinon le prix de base", async () => {
    const f = fakeFetch(() => ({ status: 200, body: fixture("tikhub/profil.json") }));
    const r = await thProfilePage("x", undefined, { fetchImpl: f.impl, prices: { [route]: { usd: 0.0009, free: false } } });
    expect(r.spend).toEqual({ th: 1, usd: 0.0009, unknown: 0 });
  });
});

describe("solde et tarifs (gratuits)", () => {
  it("le solde ne lit que balance et free_credit, et ne compte aucun appel", async () => {
    const f = fakeFetch(() => ({ status: 200, body: SYNTH.solde }));
    const r = await thBalance({ fetchImpl: f.impl });
    expect(r).toEqual({ ok: true, value: { paidUsd: 5.4, freeUsd: 0.021 }, spend: { th: 0, usd: 0, unknown: 0 } });
    expect(f.calls[0].url).toBe(`https://api.tikhub.io${TH_ROUTES.balance}?`);
  });

  it("les tarifs ne gardent que les 7 routes du Radar", async () => {
    const f = fakeFetch(() => ({ status: 200, body: fixture("tikhub/tarifs.json") }));
    const r = await thPrices({ fetchImpl: f.impl });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(Object.keys(r.value).sort()).toEqual(Object.values(TH_ROUTES).sort());
    expect(r.value[TH_ROUTES.profile]).toEqual({ usd: 0.001, free: false });
    expect(r.value[TH_ROUTES.search]).toEqual({ usd: 0.001, free: true });
    expect(r.value[TH_ROUTES.balance]).toEqual({ usd: 0, free: true });
    expect(r.spend).toEqual({ th: 0, usd: 0, unknown: 0 });
  });
});
