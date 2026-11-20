/**
 * BANC — la transcription par les sous-titres natifs de TikTok (brique 5, 20/11/2026). Il IMPORTE le code livré
 * (convex/radar/radarSourcesMath : freeTranscript, parseVideoSubtitles, asrTrack, webvttCues, webvttText,
 * rankTranscripts ; radarFreeMath et radarStoreMath pour les pages ; radarNetworkMath pour l'app reconnue) : il
 * éprouve ce qui part, pas une copie.
 *
 * Quatre mesures :
 *  - « cote » (côte à côte, avant la bascule) : N signaux (200 au plus) que le transcript payant (ScrapeCreators) a
 *    transcrits en production, tirés à graine fixe (SEED) parmi les POOL plus récents (publication) encore en ligne
 *    d'un instantané de radarSignals (sans `unavailable`). Pour chacun, ce que fait runTranscripts : sa page publique
 *    (1 page) → la piste que la brique choisit (asrTrack ; jamais une traduction MT) → son WebVTT (1 requête) → le
 *    texte (freeTranscript). Comparé au texte que le payant a rangé : identique au caractère ; identique après
 *    normalisation (casse, espaces, ponctuation) ; similarité mot à mot (1 − distance d'édition sur les mots ÷ le plus
 *    long des deux) ; et l'app que le Radar y reconnaît (videoCitesApp / videoApp, comme rankTranscripts) avec l'un
 *    et l'autre texte. Rend les comptes, les 10 pires écarts (courts), les crédits évités. Chaque réponse est gardée
 *    (dossier <sortie>/raw : pages et WebVTT gzip) pour « rejoue » et « mt ».
 *  - « rejoue » : la même comparaison sur les réponses gardées par « cote » (aucune requête), pour rejouer les cas
 *    après un correctif de la brique ; `ids` (séparés par des virgules) la limite à ces vidéos.
 *  - « mt » : après « cote », dans ce qui reste du MÊME budget, les vidéos refusées pour « traduction seule » qui
 *    portent une piste dans la langue parlée de Version « 8:… » (Source « MT » ou « LC ») — sous-titres d'origine
 *    repris par le créateur (claInfo.captionInfos : isOriginalCaption vrai, isAutoGen faux, subtitleType 8 ; la
 *    traduction automatique, elle, est en Version « 4 », dans une autre langue) : leur WebVTT (1 requête, l'adresse
 *    est sur la page déjà lue), comparé au texte payant. Ce que la brique laisse au payant et pourrait prendre :
 *    mesuré, PAS pris (asrTrack refuse toute piste non ASR).
 *  - « file » : la file des transcriptions (rankTranscripts) sur l'instantané, sans aucune page : combien de signaux
 *    attendent, combien y entrent par jour (ce qui règle TRANSCRIPT_FREE_PAGES), et les carrousels photo qu'elle
 *    écarte (ce que le payant en avait tiré).
 *
 * BUDGET DE PAGES (cote et mt ensemble) : BUDGET = 420 requêtes TikTok au plus, pages vidéo et WebVTT compris,
 * seconds essais compris (une page refusée est redemandée une fois, `retrying`) ; une vidéo n'est commencée que s'il
 * reste de quoi la finir. Une à la fois, une pause storePauseMs (0,3 à 0,7 s) avant chacune ; arrêt à STORE_BREAKER
 * (5) réponses refusées d'affilée. Aucun appel payant, aucun cookie.
 * Une mesure faite du poste ne dit pas ce que TikTok sert aux serveurs Convex (subtitleInfos et WebVTT lus depuis
 * Convex) : radarUsage.saved.transcript le dira après bascule.
 *
 * Relancer (instantané : un document JSON par ligne, radarSignals.jsonl et radarApps.jsonl) :
 *   npx esbuild scripts/radar-bancs/transcriptions.ts --bundle --platform=node --format=esm --outfile=<scratchpad>/transcriptions.mjs
 *   node <scratchpad>/transcriptions.mjs cote <dossier de l'instantané> <dossier de sortie> [N=200]
 *   node <scratchpad>/transcriptions.mjs rejoue <dossier de l'instantané> <dossier de sortie de cote> [ids]
 *   node <scratchpad>/transcriptions.mjs mt <dossier de l'instantané> <dossier de sortie de cote>
 *   node <scratchpad>/transcriptions.mjs file <dossier de l'instantané>
 */
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { gunzipSync, gzipSync } from "node:zlib";
import { FREE_RETRY_MS, paced, retrying, videoDetail, type FreePage } from "../../convex/radar/radarFreeMath";
import { STORE_BREAKER, fetchEmbedPage, storePauseMs } from "../../convex/radar/radarStoreMath";
import { videoApp, videoCitesApp } from "../../convex/radar/radarNetworkMath";
import {
  TRANSCRIPT_FREE_PAGES,
  asrTrack,
  freeTranscript,
  parseVideoSubtitles,
  rankTranscripts,
  webvttCues,
  webvttText,
  type FreeSubs,
  type TranscriptApp,
  type TranscriptRow,
} from "../../convex/radar/radarSourcesMath";

const DAY = 86_400_000;
/** Requêtes TikTok au plus, « cote » et « mt » ensemble (pages vidéo et WebVTT, seconds essais compris). */
const BUDGET = 420;
const MAX_N = 200;
/** Le tirage se fait parmi les POOL signaux transcrits les plus récents encore en ligne (les plus anciens disparaissent). */
const POOL = 260;
const SEED = 20_261_120;
/** Quasi identique : au moins 95 % des mots en place. */
const NEAR = 0.95;

type Row = TranscriptRow & { _id: string; videoId: string; publishedAt: number; firstSeenAt: number; transcript?: string; lang: string; unavailable?: { reason: string } };
type Answer = { url: string; ok: boolean; kind?: string; reason?: string; file?: string };
type Result = Record<string, unknown>;

const lines = <T>(file: string): T[] =>
  readFileSync(file, "utf8")
    .split("\n")
    .filter((l) => l.trim())
    .map((l) => JSON.parse(l) as T);

const sleep = (ms: number) => new Promise<void>((done) => setTimeout(done, ms));

/** Générateur pseudo-aléatoire à graine (mulberry32) : le même tirage à chaque relance. */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}

/** Les signaux du banc : transcrits en payant (avec texte), vidéo TikTok, encore en ligne ; tirés à graine fixe. */
function sample(snap: string, n: number): Row[] {
  const pool = lines<Row>(join(snap, "radarSignals.jsonl"))
    .filter((r) => r.platform === "tiktok" && !!r.transcript && !r.unavailable && /^https:\/\/www\.tiktok\.com\/@[^/]+\/video\/\d+$/.test(r.url))
    .sort((a, b) => b.publishedAt - a.publishedAt || (a.videoId < b.videoId ? -1 : 1))
    .slice(0, POOL);
  const rand = rng(SEED);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.min(n, MAX_N));
}

/** Casse, espaces et ponctuation retirés : ce qui reste, ce sont les mots dits. */
const normalize = (s: string): string =>
  s
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\p{P}\p{S}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
const words = (s: string): string[] => normalize(s).split(" ").filter(Boolean);

/** 1 − distance d'édition (insertions, suppressions, remplacements de mots) ÷ le nombre de mots du plus long. */
function wordSimilarity(a: readonly string[], b: readonly string[]): number {
  if (!a.length && !b.length) return 1;
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return 1 - prev[b.length] / Math.max(a.length, b.length);
}

/** Les mots autour du premier écart (4 avant, 8 après), pour montrer un écart en court. */
function firstGap(a: readonly string[], b: readonly string[]): { at: number; free: string; paid: string } {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  const from = Math.max(0, i - 4);
  return { at: i, free: a.slice(from, i + 8).join(" "), paid: b.slice(from, i + 8).join(" ") };
}

/** L'app que le Radar reconnaît dans une vidéo avec ce texte dit (la règle de rankTranscripts). */
function citedApp(r: Row, transcript: string, apps: readonly TranscriptApp[]): string | null {
  const own = r.appId ? apps.find((a) => a._id === r.appId) : undefined;
  const text = { caption: r.caption, hook: r.hook, transcript, handle: r.authorHandle };
  const cited = own && videoCitesApp(text, own) ? own : videoApp(text, apps.filter((a) => a.status === "active"));
  return cited?._id ?? null;
}

/** Le texte gratuit face au texte payant rangé : au caractère, normalisé, mot à mot, et l'app reconnue. */
function judge(r: Row, text: string, apps: readonly TranscriptApp[]): Result {
  const paid = r.transcript ?? "";
  const fw = words(text);
  const pw = words(paid);
  const appFree = citedApp(r, text, apps);
  const appPaid = citedApp(r, paid, apps);
  const res: Result = {
    exact: text === paid,
    same: normalize(text) === normalize(paid),
    sim: Math.round(wordSimilarity(fw, pw) * 10_000) / 10_000,
    words: { free: fw.length, paid: pw.length },
    app: { free: appFree, paid: appPaid, same: appFree === appPaid },
  };
  if (!res.same) Object.assign(res, { gap: firstGap(fw, pw), free: text, paid });
  return res;
}

class Stop extends Error {}

/**
 * Les requêtes TikTok du banc : une à la fois, une pause storePauseMs avant chacune, une page refusée redemandée une
 * fois (paced, retrying : ceux de runTranscripts) ; chaque réponse gardée dans `raw` (gzip). Stop au budget, ou à
 * STORE_BREAKER réponses refusées d'affilée.
 */
function network(raw: string, log: string, prefix: string, budget: number, served: Map<string, string>) {
  const answers = join(raw, log);
  writeFileSync(answers, "");
  let requests = 0;
  let streak = 0;
  const page = retrying(
    paced(
      async (url: string): Promise<FreePage> => {
        if (requests >= budget) throw new Stop(`budget de ${BUDGET} requêtes atteint`);
        requests++;
        const r = await fetchEmbedPage(url);
        const a: Answer = { url, ok: r.kind === "ok", ...(r.kind !== "ok" ? { kind: r.kind } : {}), ...(r.kind === "suspect" ? { reason: r.reason } : {}) };
        if (r.kind === "ok") {
          served.set(url, r.text);
          a.file = `${prefix}${String(requests).padStart(3, "0")}.gz`;
          writeFileSync(join(raw, a.file), gzipSync(r.text));
        }
        appendFileSync(answers, JSON.stringify(a) + "\n");
        streak = r.kind === "suspect" ? streak + 1 : 0;
        if (streak >= STORE_BREAKER) throw new Stop(`${STORE_BREAKER} réponses refusées d'affilée`);
        return r.kind === "ok" ? { ok: true, text: r.text } : r.kind === "suspect" ? { ok: false, kind: "suspect", reason: r.reason } : { ok: false, kind: "absent" };
      },
      () => sleep(storePauseMs(Math.random())),
    ),
    () => sleep(FREE_RETRY_MS),
  );
  return { page, requests: () => requests, left: () => budget - requests };
}

/** Les réponses gardées : à chaque adresse, la dernière (le second essai quand il y en a eu un). */
function kept(raw: string): Map<string, Answer> {
  const last = new Map<string, Answer>();
  for (const a of lines<Answer>(join(raw, "reponses.jsonl"))) last.set(a.url, a);
  return last;
}
const keptText = (raw: string, a: Answer | undefined): string | null =>
  a?.ok && a.file && existsSync(join(raw, a.file)) ? gunzipSync(readFileSync(join(raw, a.file))).toString("utf8") : null;

/**
 * La comparaison : `page` sert les pages (le réseau, ou les réponses gardées). La fonction de runTranscripts
 * (freeTranscript) ; le détail des pistes est relu sur la page déjà servie (aucune requête de plus).
 */
async function compare(rows: readonly Row[], apps: readonly TranscriptApp[], page: (url: string) => Promise<FreePage>, served: Map<string, string>, left: () => number) {
  const results: Result[] = [];
  let stopped: string | null = null;
  for (const r of rows) {
    if (left() < 2) {
      stopped = `budget de ${BUDGET} requêtes atteint`;
      break;
    }
    let free: FreeSubs;
    try {
      free = await freeTranscript(r.url, page);
    } catch (e) {
      if (!(e instanceof Stop)) throw e;
      stopped = e.message;
      break;
    }
    const html = served.get(r.url);
    const subs = html ? parseVideoSubtitles(html) : null;
    const res: Result = { videoId: r.videoId, url: r.url, lang: r.lang, kind: free.kind };
    if (subs?.kind === "subs") {
      res.online = true;
      res.tracks = subs.tracks.map((t) => `${t.source}:${t.lang}`);
      if (subs.spoken) res.spoken = subs.spoken;
      res.picked = asrTrack(subs)?.lang ?? null;
    }
    if (free.kind === "text") Object.assign(res, { asr: free.lang }, judge(r, free.text, apps));
    else if (free.kind === "checked") res.why = free.why;
    else if (free.kind === "miss") Object.assign(res, { reason: free.reason, refused: free.refused });
    results.push(res);
    console.log(JSON.stringify({ ...res, free: undefined, paid: undefined, gap: undefined }));
  }
  return { results, stopped };
}

const MAIN_WHY = ["aucune piste", "traduction seule", "piste ASR d'une autre langue"];

const worst = (texts: readonly Result[], n: number) =>
  texts
    .filter((x) => !x.same)
    .sort((a, b) => (a.sim as number) - (b.sim as number))
    .slice(0, n)
    .map((x) => ({ videoId: x.videoId, asr: x.asr, tracks: x.tracks, spoken: x.spoken, sim: x.sim, words: x.words, gap: x.gap, app: x.app }));

function summarize(results: readonly Result[], extra: Result): Result {
  const of = (kind: string) => results.filter((x) => x.kind === kind);
  const why = (w: string) => results.filter((x) => x.kind === "checked" && x.why === w).length;
  const texts = of("text");
  const otherWhy: Record<string, number> = {};
  for (const x of of("checked")) if (!MAIN_WHY.includes(String(x.why))) otherWhy[String(x.why)] = (otherWhy[String(x.why)] ?? 0) + 1;
  const same = texts.filter((x) => x.same).length;
  return {
    ...extra,
    mesures: results.length,
    enLigne: results.filter((x) => x.online).length,
    avecPisteASR: results.filter((x) => x.online && x.picked).length,
    texte: texts.length,
    exacts: texts.filter((x) => x.exact).length,
    identiques: same,
    quasiIdentiques: texts.filter((x) => !x.same && (x.sim as number) >= NEAR).length,
    differents: texts.filter((x) => (x.sim as number) < NEAR).length,
    appDifferente: texts.filter((x) => !(x.app as { same: boolean }).same).map((x) => ({ videoId: x.videoId, app: x.app })),
    mtSeule: why("traduction seule"),
    asrAutreLangue: why("piste ASR d'une autre langue"),
    sansPiste: why("aucune piste"),
    autresVerifiees: otherWhy,
    supprimees: of("gone").length,
    manquees: of("miss").map((x) => ({ videoId: x.videoId, reason: x.reason })),
    // Chaque vidéo du banc a coûté 1 crédit au payant (il a rendu un texte) : un texte gratuit l'aurait évité.
    creditsEvitesIdentiques: same,
    creditsEvitesTextes: texts.length,
    pires: worst(texts, 10),
  };
}

async function cote(snap: string, out: string, n: number): Promise<void> {
  const raw = join(out, "raw");
  mkdirSync(raw, { recursive: true });
  const rows = sample(snap, n);
  const apps = lines<TranscriptApp>(join(snap, "radarApps.jsonl"));
  writeFileSync(join(out, "tirage.json"), JSON.stringify({ seed: SEED, pool: POOL, n: rows.length, ids: rows.map((r) => r.videoId) }, null, 2) + "\n");
  const served = new Map<string, string>();
  const net = network(raw, "reponses.jsonl", "", BUDGET, served);
  const started = Date.now();
  const { results, stopped } = await compare(rows, apps, net.page, served, net.left);
  const videoPages = lines<Answer>(join(raw, "reponses.jsonl")).filter((a) => /\/video\/\d+$/.test(a.url)).length;
  const summary = summarize(results, {
    mode: "cote",
    requetes: net.requests(),
    pagesVideo: videoPages,
    webvtt: net.requests() - videoPages,
    budget: BUDGET,
    arret: stopped,
    minutes: Math.round((Date.now() - started) / 6_000) / 10,
  });
  writeFileSync(join(out, "cote.jsonl"), results.map((x) => JSON.stringify(x)).join("\n") + "\n");
  writeFileSync(join(out, "cote-resume.json"), JSON.stringify(summary, null, 2) + "\n");
  console.log(JSON.stringify(summary, null, 2));
}

async function rejoue(snap: string, out: string, ids?: string): Promise<void> {
  const raw = join(out, "raw");
  const last = kept(raw);
  const tirage = JSON.parse(readFileSync(join(out, "tirage.json"), "utf8")) as { ids: string[] };
  const keep = ids ? new Set(ids.split(",")) : null;
  const byId = new Map(lines<Row>(join(snap, "radarSignals.jsonl")).map((r) => [r.videoId, r]));
  const rows = tirage.ids.filter((id) => !keep || keep.has(id)).map((id) => byId.get(id)!);
  const apps = lines<TranscriptApp>(join(snap, "radarApps.jsonl"));
  const served = new Map<string, string>();
  const page = async (url: string): Promise<FreePage> => {
    const a = last.get(url);
    if (!a) throw new Stop(`réponse non gardée : ${url.slice(0, 60)}`);
    const text = keptText(raw, a);
    if (text === null) return a.kind === "absent" ? { ok: false, kind: "absent" } : { ok: false, kind: "suspect", reason: a.reason };
    served.set(url, text);
    return { ok: true, text };
  };
  const { results, stopped } = await compare(rows, apps, page, served, () => Infinity);
  const summary = summarize(results, { mode: "rejoue", requetes: 0, arret: stopped, ...(keep ? { ids: [...keep] } : {}) });
  const tag = keep ? "-cas" : "";
  writeFileSync(join(out, `rejoue${tag}.jsonl`), results.map((x) => JSON.stringify(x)).join("\n") + "\n");
  writeFileSync(join(out, `rejoue${tag}-resume.json`), JSON.stringify(summary, null, 2) + "\n");
  console.log(JSON.stringify(summary, null, 2));
}

async function mt(snap: string, out: string): Promise<void> {
  const raw = join(out, "raw");
  const used = (JSON.parse(readFileSync(join(out, "cote-resume.json"), "utf8")) as { requetes: number }).requetes;
  const last = kept(raw);
  const byId = new Map(lines<Row>(join(snap, "radarSignals.jsonl")).map((r) => [r.videoId, r]));
  const apps = lines<TranscriptApp>(join(snap, "radarApps.jsonl"));
  const cases = lines<Result>(join(out, "cote.jsonl")).filter((x) => x.kind === "checked" && x.why === "traduction seule");
  const net = network(raw, "reponses-mt.jsonl", "mt-", BUDGET - used, new Map());
  const results: Result[] = [];
  let stopped: string | null = null;
  for (const c of cases) {
    const r = byId.get(String(c.videoId))!;
    const d = videoDetail(keptText(raw, last.get(r.url)) ?? "");
    const video = d && d !== "other" ? ((d.item?.video ?? {}) as { subtitleInfos?: Record<string, unknown>[]; claInfo?: { originalLanguageInfo?: { language?: string } } }) : {};
    const spoken = video.claInfo?.originalLanguageInfo?.language;
    const infos = video.subtitleInfos ?? [];
    const origin = infos.find((t) => t.LanguageCodeName === spoken && t.Source !== "ASR" && String(t.Version ?? "").startsWith("8") && typeof t.Url === "string");
    const res: Result = { videoId: r.videoId, tracks: infos.map((t) => `${t.Source}:${t.LanguageCodeName}:${t.Version}`), spoken };
    if (!origin) {
      results.push({ ...res, kind: "sans piste d'origine" });
      continue;
    }
    if (net.left() < 1) {
      stopped = `budget de ${BUDGET} requêtes atteint`;
      break;
    }
    let v: FreePage;
    try {
      v = await net.page(String(origin.Url));
    } catch (e) {
      if (!(e instanceof Stop)) throw e;
      stopped = e.message;
      break;
    }
    const cues = v.ok ? webvttCues(v.text) : null;
    const text = cues ? webvttText(cues) : null;
    Object.assign(res, { origin: `${origin.Source}:${origin.LanguageCodeName}:${origin.Version}` });
    if (text) Object.assign(res, { kind: "text" }, judge(r, text, apps));
    else Object.assign(res, { kind: v.ok ? (cues ? "vide" : "illisible") : "miss" });
    results.push(res);
    console.log(JSON.stringify({ ...res, free: undefined, paid: undefined, gap: undefined }));
  }
  const texts = results.filter((x) => x.kind === "text");
  const summary = {
    mode: "mt",
    requetes: net.requests(),
    requetesBanc: used + net.requests(),
    budget: BUDGET,
    arret: stopped,
    traductionSeule: cases.length,
    avecPisteOrigine: results.filter((x) => x.origin).length,
    sansPisteOrigine: results.filter((x) => x.kind === "sans piste d'origine").map((x) => ({ videoId: x.videoId, tracks: x.tracks, spoken: x.spoken })),
    texte: texts.length,
    exacts: texts.filter((x) => x.exact).length,
    identiques: texts.filter((x) => x.same).length,
    quasiIdentiques: texts.filter((x) => !x.same && (x.sim as number) >= NEAR).length,
    differents: texts.filter((x) => (x.sim as number) < NEAR).length,
    autres: results.filter((x) => x.origin && x.kind !== "text").map((x) => ({ videoId: x.videoId, kind: x.kind })),
    pires: worst(texts, 10),
  };
  writeFileSync(join(out, "mt.jsonl"), results.map((x) => JSON.stringify(x)).join("\n") + "\n");
  writeFileSync(join(out, "mt-resume.json"), JSON.stringify(summary, null, 2) + "\n");
  console.log(JSON.stringify(summary, null, 2));
}

function file(snap: string): void {
  const signals = lines<Row>(join(snap, "radarSignals.jsonl"));
  const apps = lines<TranscriptApp>(join(snap, "radarApps.jsonl"));
  const now = Math.max(...signals.map((s) => s.firstSeenAt));
  const week = signals.filter((s) => s.publishedAt >= now - 7 * DAY).sort((a, b) => b.publishedAt - a.publishedAt);
  // Ce que la requête lit (les 800 plus récents), et toute la semaine pour le flux par jour.
  const due = rankTranscripts(week.slice(0, 800), apps);
  const all = rankTranscripts(week, apps);
  // Les carrousels photo que la file écarte : ce que le payant en avait tiré (instantané entier).
  const photos = signals.filter((s) => s.platform === "tiktok" && s.url.includes("/photo/"));
  const photosPaid = photos.filter((s) => s.transcribedAt !== undefined);
  const perDay: Record<string, number> = {};
  for (const { row } of all) {
    const day = new Date(row.firstSeenAt).toISOString().slice(0, 10);
    perDay[day] = (perDay[day] ?? 0) + 1;
  }
  // Les jours entiers de la fenêtre : ni le premier (coupé par les 7 jours), ni celui de l'instantané.
  const first = new Date(now - 6 * DAY).toISOString().slice(0, 10);
  const full = Object.entries(perDay)
    .filter(([d]) => d >= first && d < new Date(now).toISOString().slice(0, 10))
    .map(([, c]) => c);
  console.log(
    JSON.stringify(
      {
        instantane: new Date(now).toISOString(),
        signauxTikTokSemaine: week.filter((s) => s.platform === "tiktok").length,
        photosTikTok: photos.length,
        photosTranscritesParLePayant: { total: photosPaid.length, avecTexte: photosPaid.filter((s) => !!s.transcript).length },
        fileDuPassage: due.length,
        fileSemaineEntiere: all.length,
        entreesParJour: perDay,
        moyenneParJourComplet: full.length ? Math.round(full.reduce((a, b) => a + b, 0) / full.length) : null,
        pagesParJour: TRANSCRIPT_FREE_PAGES * 12,
      },
      null,
      2,
    ),
  );
}

const [mode, snap, out, arg] = process.argv.slice(2);
if (mode === "cote" && snap && out) await cote(snap, out, Number(arg ?? MAX_N));
else if (mode === "rejoue" && snap && out) await rejoue(snap, out, arg);
else if (mode === "mt" && snap && out) await mt(snap, out);
else if (mode === "file" && snap) file(snap);
else console.log("usage : cote <instantané> <sortie> [N] | rejoue <instantané> <sortie de cote> [ids] | mt <instantané> <sortie de cote> | file <instantané>");
