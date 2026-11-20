import fs from "node:fs";
import path from "node:path";
import { getFunctionName } from "convex/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { internal } from "../../convex/_generated/api";
import { parseFreeVideo, type FreePage } from "../../convex/radar/radarFreeMath";
import { dueTranscripts, runTranscripts } from "../../convex/radar/radarSources";
import {
  TRANSCRIPT_FREE_PAGES,
  asrTrack,
  freeTranscript,
  parseVideoSubtitles,
  rankTranscripts,
  transcriptPass,
  transcriptQueue,
  transcriptText,
  webvttCues,
  webvttText,
  type PaidTranscript,
  type TranscriptIo,
} from "../../convex/radar/radarSourcesMath";
import { memoryDb, type MemoryDoc } from "./convex-memory-db";

/**
 * Radar — la transcription par les sous-titres natifs de TikTok (brique 5, 20/11/2026). Les pages d'essai ont la forme
 * relevée ce jour-là sur trois vraies pages vidéo (champs lus seulement) : `itemStruct.video.subtitleInfos` (une piste
 * par langue, « ASR » ou « MT ») et `claInfo.originalLanguageInfo` (la langue parlée). Le WebVTT a la forme servie.
 */

const DAY = 86_400_000;
const NOW = Date.parse("2026-11-20T12:00:00Z");

type Track = { LanguageCodeName: string; Source: string; Url?: string; Format?: string };
const track = (lang: string, source: string, o: Partial<Track> = {}): Track => ({
  LanguageCodeName: lang,
  Source: source,
  Url: `https://v16-webapp.tiktokcdn-eu.com/${source.toLowerCase()}-${lang}/?a=1988`,
  Format: "webvtt",
  ...o,
});
const vttUrl = (lang: string, source = "ASR") => `https://v16-webapp.tiktokcdn-eu.com/${source.toLowerCase()}-${lang}/?a=1988`;

const page = (tracks: Track[], spoken?: string, video: Record<string, unknown> = {}) => {
  const item = {
    id: "7707635935218797837",
    createTime: "1794780000",
    textLanguage: "en",
    video: {
      duration: 30,
      subtitleInfos: tracks.map((t) => ({ UrlExpire: "1795368266", Size: "864", LanguageID: "2", Version: "4", ...t })),
      ...(spoken ? { claInfo: { hasOriginalAudio: true, enableAutoCaption: true, originalLanguageInfo: { language: spoken, languageCode: spoken.slice(0, 2) } } } : {}),
      ...video,
    },
  };
  return `<html><script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application/json">${JSON.stringify({ __DEFAULT_SCOPE__: { "webapp.video-detail": { statusCode: 0, itemInfo: { itemStruct: item } } } })}</script></html>`;
};
const refused = (statusCode: number, statusMsg: string) =>
  `<html><script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application/json">${JSON.stringify({ __DEFAULT_SCOPE__: { "webapp.video-detail": { statusCode, statusMsg } } })}</script></html>`;
/**
 * La page d'un carrousel photo telle que TikTok la sert (relevée le 20/11/2026 sur @charmcircuit4/photo/7709801657537694996
 * et une autre, scopes et quelques champs) : ses données, mais pas de `webapp.video-detail`.
 */
const NO_VIDEO = `<html><script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application/json">${JSON.stringify({
  __DEFAULT_SCOPE__: {
    "webapp.app-context": { language: "en", region: "FR", appId: 1988, botType: "others", host: "www.tiktok.com" },
    "webapp.biz-context": {},
    "webapp.i18n-translation": {},
    "seo.abtest": {},
    "webapp.a-b": {},
  },
})}</script></html>`;

/** Un WebVTT tel que TikTok le sert (relevé le 20/11/2026 : en-tête, deux lignes vides, une réplique par bloc). */
const VTT = "WEBVTT\n\n\n00:00:00.040 --> 00:00:01.120\naló\n\n00:00:02.520 --> 00:00:04.880\ncómo hacer este video genial\n\n00:00:05.040 --> 00:00:06.640\ncon solo una foto puedes hacerlo\n";
/** Le texte rangé par le payant pour la même vidéo. */
const PAID_TEXT = "aló cómo hacer este video genial con solo una foto puedes hacerlo";

describe("les pistes de sous-titres d'une page vidéo", () => {
  it("lit chaque piste WebVTT (langue, source, adresse) et la langue parlée ; prend l'ASR, pas la traduction", () => {
    const subs = parseVideoSubtitles(page([track("eng-US", "MT"), track("spa-ES", "ASR")], "spa-ES"));
    expect(subs).toEqual({
      kind: "subs",
      spoken: "spa-ES",
      tracks: [
        { lang: "eng-US", source: "MT", url: vttUrl("eng-US", "MT") },
        { lang: "spa-ES", source: "ASR", url: vttUrl("spa-ES") },
      ],
    });
    expect(asrTrack(subs as { tracks: []; spoken: string })?.lang).toBe("spa-ES");
  });

  it("une traduction automatique seule est refusée, même dans la langue parlée", () => {
    for (const tracks of [[track("eng-US", "MT")], [track("eng-US", "MT"), track("ita-IT", "MT")]]) {
      const subs = parseVideoSubtitles(page(tracks, "ita-IT"));
      expect(subs?.kind).toBe("subs");
      expect(asrTrack(subs as { tracks: []; spoken: string })).toBeNull();
    }
  });

  it("plusieurs langues : l'ASR de la langue parlée, sinon de la même langue de base ; jamais une autre", () => {
    const tracks = [track("eng-US", "ASR"), track("fra-FR", "MT"), track("spa-ES", "ASR")];
    expect(asrTrack({ tracks: parseOk(page(tracks, "spa-ES")).tracks, spoken: "spa-ES" })?.lang).toBe("spa-ES");
    expect(asrTrack({ tracks: parseOk(page(tracks)).tracks, spoken: "spa-MX" })?.lang).toBe("spa-ES");
    // La seule ASR est d'une autre langue que celle parlée : on ne la prend pas.
    expect(asrTrack(parseOk(page([track("eng-US", "ASR")], "deu-DE")))).toBeNull();
    // Langue parlée inconnue : l'ASR si elle est seule ; deux, on ne choisit pas.
    expect(asrTrack(parseOk(page([track("kor-KR", "ASR"), track("eng-US", "MT")])))?.lang).toBe("kor-KR");
    expect(asrTrack(parseOk(page(tracks)))).toBeNull();
  });

  it("ignore une piste qui n'est pas un WebVTT ou sans adresse ; pas de piste du tout", () => {
    expect(parseOk(page([track("eng-US", "ASR", { Format: "srt" }), track("fra-FR", "ASR", { Url: "" })], "eng-US")).tracks).toEqual([]);
    expect(parseOk(page([], "eng-US", { subtitleInfos: undefined })).tracks).toEqual([]);
  });

  it("une page servie avec ses données mais sans vidéo (carrousel photo) n'est pas une page illisible", () => {
    expect(parseVideoSubtitles(NO_VIDEO)).toEqual({ kind: "other" });
    // Le relevé gratuit, lui, n'y lit toujours rien.
    expect(parseFreeVideo(NO_VIDEO, "charmcircuit4")).toBeNull();
  });

  it("le refus de TikTok et son motif ; une page qui ne se lit pas", () => {
    expect(parseVideoSubtitles(refused(10204, "item doesn't exist"))).toEqual({ kind: "refused", reason: "removed" });
    expect(parseVideoSubtitles(refused(10222, "author_secret"))).toEqual({ kind: "refused", reason: "private" });
    expect(parseVideoSubtitles(refused(10231, "cross_border_violation"))).toEqual({ kind: "refused", reason: "region" });
    expect(parseVideoSubtitles("<html>ratelimit triggered</html>")).toBeNull();
  });
});

function parseOk(html: string) {
  const s = parseVideoSubtitles(html);
  if (s?.kind !== "subs") throw new Error("page sans pistes");
  return s;
}

describe("WebVTT → texte, mis en forme comme le transcript payant", () => {
  it("le même texte que transcriptText, par le WebVTT comme par les segments", () => {
    const cues = webvttCues(VTT)!;
    expect(cues).toEqual(["aló", "cómo hacer este video genial", "con solo una foto puedes hacerlo"]);
    expect(webvttText(cues)).toBe(PAID_TEXT);
    expect(webvttText(cues)).toBe(transcriptText({ transcript: VTT }));
    expect(webvttText(cues)).toBe(transcriptText({ transcript_with_timestamp: cues.map((text) => ({ text })) }));
  });

  it("identifiants de réplique, NOTE, CRLF, BOM, réplique sur deux lignes, balises et entités", () => {
    const vtt = "﻿WEBVTT - sous-titres\r\n\r\nNOTE relu à la main\r\n\r\n1\r\n00:00:00.000 --> 00:00:01.000 align:start\r\nHey, I <i>don't</i>\r\nknow you.\r\n\r\n2\r\n00:00:01.381 --> 00:00:03.301\r\nQ&amp;A &lt;3\r\n";
    expect(webvttCues(vtt)).toEqual(["Hey, I don't know you.", "Q&A <3"]);
  });

  it("une réplique faite d'un nombre reste du texte dit (le payant la rend dans ses segments)", () => {
    const vtt = "WEBVTT\n\n00:00:00.000 --> 00:00:01.000\nen\n\n00:00:01.000 --> 00:00:02.000\n2024\n";
    expect(webvttText(webvttCues(vtt)!)).toBe(transcriptText({ transcript_with_timestamp: [{ text: "en" }, { text: "2024" }] }));
    expect(webvttText(webvttCues(vtt)!)).toBe("en 2024");
  });

  it("pas un WebVTT → null ; un WebVTT sans réplique → rien à dire", () => {
    expect(webvttCues("<html>Access Denied</html>")).toBeNull();
    expect(webvttCues("")).toBeNull();
    expect(webvttCues("WEBVTT\n\n")).toEqual([]);
    expect(webvttText([])).toBeNull();
  });
});

/** Un TikTok d'essai : chaque adresse rend la page donnée (une adresse absente rend un refus), et compte les lectures. */
function tiktok(pages: Record<string, FreePage | string>) {
  const read: string[] = [];
  const page = async (url: string): Promise<FreePage> => {
    read.push(url);
    const p = pages[url];
    if (p === undefined) return { ok: false, kind: "suspect", reason: "HTTP 429" };
    return typeof p === "string" ? { ok: true, text: p } : p;
  };
  return { page, read };
}

describe("une vidéo par sa page publique", () => {
  it("la page, puis le WebVTT de sa piste ASR : le texte du payant", async () => {
    const tt = tiktok({ v1: page([track("eng-US", "MT"), track("spa-ES", "ASR")], "spa-ES"), [vttUrl("spa-ES")]: VTT });
    expect(await freeTranscript("v1", tt.page)).toEqual({ kind: "text", text: PAID_TEXT, lang: "spa-ES" });
    expect(tt.read).toEqual(["v1", vttUrl("spa-ES")]);
  });

  it("sans piste ASR, aucun WebVTT n'est lu ; une piste vide n'est pas un texte", async () => {
    const mt = tiktok({ v1: page([track("eng-US", "MT")], "msa-MY") });
    expect(await freeTranscript("v1", mt.page)).toEqual({ kind: "checked", why: "traduction seule" });
    expect(mt.read).toEqual(["v1"]);
    expect(await freeTranscript("v1", tiktok({ v1: page([], "eng-US") }).page)).toEqual({ kind: "checked", why: "aucune piste" });
    expect(await freeTranscript("v1", tiktok({ v1: page([track("eng-US", "ASR")], "eng-US"), [vttUrl("eng-US")]: "WEBVTT\n\n" }).page)).toEqual({ kind: "checked", why: "piste vide" });
  });

  it("supprimée ou privée : rien à transcrire ; bloquée hors de sa région ou page absente : le payant essaiera", async () => {
    expect(await freeTranscript("v1", tiktok({ v1: refused(10204, "item doesn't exist") }).page)).toEqual({ kind: "gone" });
    expect(await freeTranscript("v1", tiktok({ v1: refused(10222, "author_secret") }).page)).toEqual({ kind: "gone" });
    expect(await freeTranscript("v1", tiktok({ v1: refused(10204, "item_privacy_authorization&status_self_see") }).page)).toEqual({ kind: "gone" });
    expect(await freeTranscript("v1", tiktok({ v1: refused(10231, "cross_border_violation") }).page)).toEqual({ kind: "checked", why: "refus : region" });
    expect(await freeTranscript("v1", tiktok({ v1: { ok: false, kind: "absent" } }).page)).toEqual({ kind: "checked", why: "page absente" });
  });

  it("page servie sans vidéo : lue, rien à prendre (le payant la prendra), pas un refus", async () => {
    const tt = tiktok({ v1: NO_VIDEO });
    expect(await freeTranscript("v1", tt.page)).toEqual({ kind: "checked", why: "page sans vidéo" });
    expect(tt.read).toEqual(["v1"]);
  });

  it("page refusée ou servie sans ses données, WebVTT refusé, absent ou illisible : manqué", async () => {
    const asr = page([track("eng-US", "ASR")], "eng-US");
    expect(await freeTranscript("v1", tiktok({}).page)).toEqual({ kind: "miss", refused: true, reason: "HTTP 429" });
    expect(await freeTranscript("v1", tiktok({ v1: "<html>captcha</html>" }).page)).toEqual({ kind: "miss", refused: true, reason: "page sans données" });
    expect(await freeTranscript("v1", tiktok({ v1: asr }).page)).toEqual({ kind: "miss", refused: true, reason: "WebVTT HTTP 429" });
    expect(await freeTranscript("v1", tiktok({ v1: asr, [vttUrl("eng-US")]: { ok: false, kind: "absent" } }).page)).toEqual({ kind: "miss", refused: false, reason: "WebVTT absent" });
    expect(await freeTranscript("v1", tiktok({ v1: asr, [vttUrl("eng-US")]: "<html>Access Denied</html>" }).page)).toEqual({ kind: "miss", refused: true, reason: "WebVTT illisible" });
  });
});

type Sig = { id: string; url: string; checked: boolean };
const sig = (id: string, checked = false): Sig => ({ id, url: id, checked });

/** Un passage d'essai : TikTok, le payant (un texte « payé:<id> », 1 crédit) et ce qui est rangé. */
function passage(pages: Record<string, FreePage | string>, paidOver: Partial<Record<string, PaidTranscript>> = {}) {
  const tt = tiktok(pages);
  const paid: string[] = [];
  const applied: [string, string | null | "checked"][] = [];
  let alive = true;
  const io: TranscriptIo<Sig> = {
    page: tt.page,
    paid: async (s) => {
      paid.push(s.id);
      return paidOver[s.id] ?? { ok: true, value: `payé:${s.id}`, credits: 1, creditsRemaining: 1_000 - paid.length };
    },
    apply: async (s, r) => void applied.push([s.id, r === "checked" ? "checked" : r.text]),
    alive: () => alive,
  };
  return { io, read: tt.read, paid, applied, stop: () => void (alive = false) };
}

const ASR_PAGE = (lang = "eng-US") => page([track(lang, "ASR")], lang);
const vtt = (text: string) => `WEBVTT\n\n00:00:00.000 --> 00:00:01.000\n${text}\n`;

describe("un passage de transcriptions", () => {
  it("voie gratuite : chaque vidéo à piste ASR est transcrite sans crédit ; celles que le payant aurait prises, comptées évitées", async () => {
    const p = passage({ a: ASR_PAGE(), b: ASR_PAGE("fra-FR"), [vttUrl("eng-US")]: vtt("hello"), [vttUrl("fra-FR")]: vtt("bonjour") });
    const r = await transcriptPass([sig("a"), sig("b")], p.io, { pages: 40, paid: 5 });
    expect(p.applied).toEqual([["a", "hello"], ["b", "bonjour"]]);
    expect(p.paid).toEqual([]);
    expect(r).toEqual({ free: { pages: 2, texts: 2, gone: 0, checked: 0, missed: 0, stopped: null }, paid: { calls: 0, credits: 0, errors: 0 }, saved: 2 });
  });

  it("repli : sans piste ASR (marquée), page refusée ou WebVTT manquant → le payant, dans l'ordre de la file et sa limite", async () => {
    const p = passage({ a: page([track("eng-US", "MT")], "msa-MY"), c: ASR_PAGE(), d: ASR_PAGE("fra-FR"), [vttUrl("fra-FR")]: vtt("bonjour") });
    // b : page refusée (deux fois avec le second essai en prod) ; c : WebVTT refusé ; e : déjà lue sans sous-titres.
    const r = await transcriptPass([sig("a"), sig("b"), sig("c"), sig("d"), sig("e", true)], p.io, { pages: 40, paid: 3 });
    expect(p.applied).toEqual([["a", "checked"], ["d", "bonjour"], ["a", "payé:a"], ["b", "payé:b"], ["c", "payé:c"]]);
    expect(p.paid).toEqual(["a", "b", "c"]);
    expect(r.free).toEqual({ pages: 4, texts: 1, gone: 0, checked: 1, missed: 2, stopped: null });
    expect(r.paid).toEqual({ calls: 3, credits: 3, errors: 0, creditsRemaining: 997 });
    // d n'est pas parmi les 3 premières de la file : sans la voie gratuite, le payant ne l'aurait pas prise ce passage.
    expect(r.saved).toBe(0);
  });

  it("saved : un texte gratuit ne compte que s'il remplace un appel que le payant aurait fait à ce passage", async () => {
    const pages = { a: ASR_PAGE(), b: ASR_PAGE(), c: ASR_PAGE(), [vttUrl("eng-US")]: vtt("hi") };
    const due = () => [sig("a"), sig("b"), sig("c")];
    // Le payant aurait pris a seule (limite 1) : b et c sont de la couverture en plus, pas des crédits évités.
    const one = await transcriptPass(due(), passage(pages).io, { pages: 40, paid: 1 });
    expect(one.free.texts).toBe(3);
    expect(one.saved).toBe(1);
    // Poste coupé : le payant n'aurait rien payé.
    expect((await transcriptPass(due(), passage(pages).io, { pages: 40, paid: 0 })).saved).toBe(0);
    // Une vidéo supprimée en tête : le transcript payant n'y aurait rien rendu, donc rien coûté.
    expect((await transcriptPass([sig("x"), ...due()], passage({ ...pages, x: refused(10204, "item doesn't exist") }).io, { pages: 40, paid: 2 })).saved).toBe(1);
  });

  it("vidéo supprimée : rien à transcrire, sans payer", async () => {
    const p = passage({ a: refused(10204, "item doesn't exist") });
    const r = await transcriptPass([sig("a")], p.io, { pages: 40, paid: 5 });
    expect(p.applied).toEqual([["a", null]]);
    expect(p.paid).toEqual([]);
    // Le transcript payant ne coûte rien quand il ne rend pas de texte : aucun crédit évité.
    expect(r.saved).toBe(0);
  });

  it("plafond de pages : la voie s'arrête, celles qu'elle n'a pas prises attendent le passage suivant (pas le payant)", async () => {
    const p = passage({ a: ASR_PAGE(), b: ASR_PAGE(), c: ASR_PAGE(), [vttUrl("eng-US")]: vtt("hi") });
    const r = await transcriptPass([sig("a"), sig("b"), sig("c"), sig("d"), sig("x", true)], p.io, { pages: 2, paid: 5 });
    expect(p.read.filter((u) => !u.startsWith("https://"))).toEqual(["a", "b"]);
    // Le payant ne prend que la vidéo déjà lue sans sous-titres.
    expect(p.paid).toEqual(["x"]);
    expect(r.free.pages).toBe(2);
  });

  it("le passage livré : la voie gratuite sous son plafond, sans condition de budget, et ce qu'elle évite compté", () => {
    const src = fs.readFileSync(path.join(__dirname, "../../convex/radar/radarSources.ts"), "utf8");
    const start = src.indexOf("export const runTranscripts");
    const run = src.slice(start, src.indexOf("\n});\n", start));
    expect(run).toMatch(/dueTranscripts, \{ now, limit: n, freeLimit: TRANSCRIPT_FREE_PAGES \}/);
    expect(run).toMatch(/\{ pages: TRANSCRIPT_FREE_PAGES, paid: n \}/);
    // Aucun retour avant la voie gratuite quand le poste payant n'a rien (éteint, coupé, réserve) ni sans clé.
    const before = run.slice(0, run.indexOf("transcriptPass("));
    expect(before).not.toMatch(/if \([^)]*\bn\b[^)]*\) return/);
    expect(before).not.toMatch(/return \{ skipped/);
    expect(before).toMatch(/let n = 0;\s+if \(scKeyPresent\(\)\) \{\s+const st[^;]*;\s+n = allowance\(/);
    expect(run).toMatch(/saved: \{ transcript: pass\.saved \}/);
    expect(TRANSCRIPT_FREE_PAGES).toBeGreaterThan(0);
  });

  it("le temps imparti écoulé, la voie s'arrête de même", async () => {
    const p = passage({ a: ASR_PAGE(), [vttUrl("eng-US")]: vtt("hi") });
    p.stop();
    const r = await transcriptPass([sig("a")], p.io, { pages: 40, paid: 5 });
    expect(r.free.pages).toBe(0);
    expect(p.paid).toEqual([]);
  });

  it("poste payant coupé (palier, réserve, éteint) : la voie gratuite transcrit quand même ; le reste attend, sans payer", async () => {
    const p = passage({ a: ASR_PAGE(), b: page([], "eng-US"), [vttUrl("eng-US")]: vtt("hi") });
    const r = await transcriptPass([sig("a"), sig("b"), sig("c"), sig("x", true)], p.io, { pages: 40, paid: 0 });
    expect(p.applied).toEqual([["a", "hi"], ["b", "checked"]]);
    expect(p.paid).toEqual([]);
    // Rien n'aurait été payé : le texte est de la couverture, pas un crédit évité.
    expect(r).toEqual({ free: { pages: 3, texts: 1, gone: 0, checked: 1, missed: 1, stopped: null }, paid: { calls: 0, credits: 0, errors: 0 }, saved: 0 });
  });

  it("une page servie sans vidéo ne compte pas pour le coupe-circuit", async () => {
    // r1… r5 : refusées (HTTP 429, deux fois) ; n : servie sans vidéo, entre la 4e et la 5e.
    const p = passage({ n: NO_VIDEO });
    const r = await transcriptPass(["r1", "r2", "r3", "r4", "n", "r5"].map((id) => sig(id)), p.io, { pages: 40, paid: 0 });
    expect(r.free).toEqual({ pages: 6, texts: 0, gone: 0, checked: 1, missed: 5, stopped: null });
    expect(p.applied).toEqual([["n", "checked"]]);
  });

  it("poste coupé, plusieurs passages : des pages sans vidéo en tête sont lues une fois, et la voie reste ouverte", async () => {
    // La base : cinq pages sans vidéo en tête de file (le 20/11, 5 carrousels photo parmi les 40 premiers), puis deux vidéos.
    const ids = ["n1", "n2", "n3", "n4", "n5", "a", "b"];
    const base = new Map(ids.map((id) => [id, { checked: false, done: false }]));
    const pages: Record<string, FreePage | string> = { a: ASR_PAGE(), b: ASR_PAGE(), [vttUrl("eng-US")]: vtt("hi") };
    for (const id of ids.slice(0, 5)) pages[id] = NO_VIDEO;
    const pass = async () => {
      const ranked = ids.filter((id) => !base.get(id)!.done).map((id) => ({ row: id, checked: base.get(id)!.checked }));
      const due = transcriptQueue(ranked, TRANSCRIPT_FREE_PAGES, 0).map(({ row, checked }) => sig(row, checked));
      const p = passage(pages);
      const r = await transcriptPass(due, { ...p.io, apply: async (s, x) => void (x === "checked" ? (base.get(s.id)!.checked = true) : (base.get(s.id)!.done = true)) }, { pages: TRANSCRIPT_FREE_PAGES, paid: 0 });
      return { r, read: p.read.filter((u) => !u.startsWith("https://")) };
    };
    const first = await pass();
    expect(first.read).toEqual(ids);
    expect(first.r.free).toEqual({ pages: 7, texts: 2, gone: 0, checked: 5, missed: 0, stopped: null });
    // Au passage suivant, rien n'est relu : elles attendent le payant.
    const second = await pass();
    expect(second.read).toEqual([]);
    expect(second.r.free.stopped).toBeNull();
    expect([...base.values()].filter((x) => x.checked)).toHaveLength(5);
  });

  it("5 pages refusées d'affilée : la voie se ferme, le payant reprend la tête de la file comme avant", async () => {
    const p = passage({ a: ASR_PAGE(), [vttUrl("eng-US")]: vtt("hi") });
    const due = [sig("a"), ...["b", "c", "d", "e", "f", "g", "h"].map((id) => sig(id))];
    const r = await transcriptPass(due, p.io, { pages: 40, paid: 6 });
    expect(r.free.stopped).toBe("5 pages refusées d'affilée (HTTP 429)");
    expect(r.free.pages).toBe(6);
    expect(p.paid).toEqual(["b", "c", "d", "e", "f", "g"]);
  });

  it("plus de crédits : le payant s'arrête ; une vidéo que le payant ne lit pas n'est plus reprise", async () => {
    const p = passage({}, { b: { ok: false, credits: 1, noCredits: false, error: "HTTP 404" }, c: { ok: false, credits: 0, noCredits: true, error: "HTTP 402", creditsRemaining: 0 } });
    const r = await transcriptPass([sig("a", true), sig("b", true), sig("c", true), sig("d", true)], p.io, { pages: 40, paid: 10 });
    expect(p.paid).toEqual(["a", "b", "c"]);
    expect(p.applied).toEqual([["a", "payé:a"], ["b", null]]);
    expect(r.paid).toEqual({ calls: 3, credits: 2, errors: 2, creditsRemaining: 0, lastError: "HTTP 402" });
  });
});

describe("la file des transcriptions", () => {
  const apps = [
    { _id: "rival", status: "active", rivalOf: ["projet"], strong: ["lumio"] },
    { _id: "suivie", status: "active", rivalOf: [], strong: ["glowup"] },
  ];
  const row = (id: string, o: Record<string, unknown> = {}) => ({ _id: id, platform: "tiktok", caption: "", authorHandle: id, views: 100, url: `https://www.tiktok.com/@${id}/video/1`, durationSec: 40, ...o });

  it("concurrentes, apps suivies, découverte ; une vidéo déjà lue sans sous-titres est marquée ; jamais un carrousel photo", () => {
    const ranked = rankTranscripts(
      [
        row("decouverte", { views: 9_000 }),
        row("suivie", { caption: "glowup", appId: "suivie", subtitlesCheckedAt: NOW - DAY }),
        row("rival", { caption: "lumio", appId: "rival" }),
        row("transcrite", { caption: "lumio", appId: "rival", transcribedAt: NOW }),
        row("texte", { durationSec: 8 }),
        row("longue", { durationSec: 300 }),
        // Un carrousel photo : sans durée, très vu, et rien à transcrire.
        row("photo", { views: 90_000, durationSec: undefined, url: "https://www.tiktok.com/@photo/photo/7709801657537694996" }),
      ],
      apps,
    );
    expect(ranked.map((x) => [x.row._id, x.checked])).toEqual([
      ["rival", false],
      ["suivie", true],
      ["decouverte", false],
    ]);
  });

  it("un passage prend les premières jamais lues (voie gratuite) et les premières marquées (payant), dans l'ordre", () => {
    const r = (id: string, checked: boolean) => ({ row: id, checked });
    expect(transcriptQueue([r("u1", false), r("c1", true), r("u2", false), r("c2", true), r("u3", false)], 2, 1).map((x) => x.row)).toEqual(["u1", "c1", "u2"]);
    expect(transcriptQueue([r("u1", false), r("c1", true)], 0, 0)).toEqual([]);
  });

  it("la requête rend la file de la voie gratuite même quand le poste payant est coupé (limite payante à 0)", async () => {
    let seq = 0;
    const doc = (table: string, o: Record<string, unknown>): MemoryDoc => ({ _id: `${table}_${++seq}`, _creationTime: seq, ...o });
    const signal = (handle: string, o: Record<string, unknown> = {}) =>
      doc("radarSignals", { platform: "tiktok", videoId: String(seq), url: `https://www.tiktok.com/@${handle}/video/${seq}`, authorHandle: handle, caption: "", views: 100, publishedAt: NOW - DAY, durationSec: 40, ...o });
    const tables: Record<string, MemoryDoc[]> = {
      radarApps: [doc("radarApps", { status: "active", rivalOf: [], strong: ["glowup"], slug: "glowup", name: "glowup" })],
      radarSignals: [signal("a", { views: 300 }), signal("b", { views: 200, subtitlesCheckedAt: NOW - DAY }), signal("c", { views: 100 }), signal("vieille", { publishedAt: NOW - 9 * DAY }), signal("photo", { views: 900, durationSec: undefined, url: "https://www.tiktok.com/@photo/photo/7709801657537694996" })],
    };
    const run = (args: Record<string, unknown>) => (dueTranscripts as unknown as { _handler: (ctx: unknown, a: unknown) => Promise<{ url: string; checked: boolean }[]> })._handler({ db: memoryDb(tables).db }, { now: NOW, ...args });
    expect((await run({ limit: 0, freeLimit: 40 })).map((d) => [d.url.split("/")[3], d.checked])).toEqual([
      ["@a", false],
      ["@c", false],
    ]);
    expect((await run({ limit: 1, freeLimit: 1 })).map((d) => [d.url.split("/")[3], d.checked])).toEqual([
      ["@a", false],
      ["@b", true],
    ]);
    expect(await run({ limit: 0 })).toEqual([]);
  });
});

describe("le passage livré, sans clé ScrapeCreators", () => {
  const key = process.env.SCRAPECREATORS_API_KEY;
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    if (key === undefined) delete process.env.SCRAPECREATORS_API_KEY;
    else process.env.SCRAPECREATORS_API_KEY = key;
  });

  it("la voie gratuite transcrit quand même ; ni budget lu, ni appel payant", async () => {
    delete process.env.SCRAPECREATORS_API_KEY;
    vi.spyOn(Math, "random").mockReturnValue(0); // la pause la plus courte (0,3 s)
    vi.spyOn(console, "log").mockImplementation(() => {});
    const url = "https://www.tiktok.com/@a/video/7707635935218797837";
    const fetched: string[] = [];
    vi.stubGlobal("fetch", async (u: string) => {
      fetched.push(u);
      if (u === url) return new Response(page([track("eng-US", "MT"), track("spa-ES", "ASR")], "spa-ES"));
      if (u === vttUrl("spa-ES")) return new Response(VTT);
      return new Response("", { status: 500 });
    });
    const name = (ref: unknown) => getFunctionName(ref as never);
    const calls: [string, Record<string, unknown>][] = [];
    const ctx = {
      runQuery: async (ref: unknown, args: Record<string, unknown>) => {
        calls.push([name(ref), args]);
        if (name(ref) === name(internal.radar.radarSources.dueTranscripts)) return [{ id: "s1", url, checked: false }];
        throw new Error(`requête inattendue : ${name(ref)}`);
      },
      runMutation: async (ref: unknown, args: Record<string, unknown>) => void calls.push([name(ref), args]),
    };
    const res = await (runTranscripts as unknown as { _handler: (ctx: unknown, a: unknown) => Promise<unknown> })._handler(ctx, {});
    expect(res).toEqual({ calls: 0, credits: 0, errors: 0 });
    expect(fetched).toEqual([url, vttUrl("spa-ES")]);
    expect(calls.map(([n]) => n)).toEqual([
      name(internal.radar.radarSources.dueTranscripts),
      name(internal.radar.radarSources.setTranscript),
      name(internal.radar.radarSignals.recordRun),
    ]);
    expect(calls[0][1]).toMatchObject({ limit: 0, freeLimit: TRANSCRIPT_FREE_PAGES });
    expect(calls[1][1]).toMatchObject({ signalId: "s1", text: PAID_TEXT });
    // Rien n'aurait été payé sans clé : aucun crédit évité compté.
    expect(calls[2][1]).toMatchObject({ poste: "transcript", calls: 0, credits: 0, errors: 0 });
    expect(calls[2][1].saved).toBeUndefined();
  });
});
