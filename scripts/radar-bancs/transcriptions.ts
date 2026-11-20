/**
 * BANC — la transcription par les sous-titres natifs de TikTok (brique 5, 20/11/2026). Il IMPORTE le code livré
 * (convex/radar/radarSourcesMath : freeTranscript, parseVideoSubtitles, rankTranscripts ; radarFreeMath et
 * radarStoreMath pour les pages) : il éprouve ce qui part, pas une copie.
 *
 * Deux mesures :
 *  - « cote » (côte à côte) : des signaux que le transcript payant (ScrapeCreators) a transcrits en production (un
 *    instantané de radarSignals). Pour chacun, la voie gratuite lit sa page publique puis le WebVTT de sa piste ASR,
 *    et son texte est comparé à celui que le payant a rangé. Rend : cas mesurés, textes identiques, différents
 *    (lesquels, les deux textes), vidéos sans piste à prendre (et pourquoi), supprimées, pages manquées, pages lues,
 *    crédits évités (un par texte : le payant ne facture que quand il rend un texte ; une supprimée ne coûte rien).
 *  - « file » : la file des transcriptions (rankTranscripts) sur l'instantané, sans aucune page : combien de signaux
 *    attendent, combien y entrent par jour (ce qui règle TRANSCRIPT_FREE_PAGES), et les carrousels photo qu'elle
 *    écarte (ce que le payant en avait tiré).
 *
 * BUDGET DE PAGES (cote) : N pages vidéo (40 au plus) et au plus un WebVTT chacune, une page refusée redemandée une
 * fois (`retrying`) : 4 × N requêtes au plus, jamais plus de 160. Une à la fois, une pause storePauseMs (0,3 à 0,7 s)
 * avant chacune ; arrêt à STORE_BREAKER (5) refus d'affilée. Aucun appel payant, aucun cookie.
 * Une mesure faite du poste ne dit pas ce que TikTok sert aux serveurs Convex : radarUsage.saved.transcript le dira
 * après bascule.
 *
 * Relancer (instantané : un document JSON par ligne, radarSignals.jsonl et radarApps.jsonl) :
 *   npx esbuild scripts/radar-bancs/transcriptions.ts --bundle --platform=node --format=esm --outfile=<scratchpad>/transcriptions.mjs
 *   node <scratchpad>/transcriptions.mjs cote <dossier de l'instantané> <dossier de sortie> [N=40]
 *   node <scratchpad>/transcriptions.mjs file <dossier de l'instantané>
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { FREE_RETRY_MS, paced, retrying, type FreePage } from "../../convex/radar/radarFreeMath";
import { STORE_BREAKER, fetchEmbedPage, storePauseMs } from "../../convex/radar/radarStoreMath";
import {
  TRANSCRIPT_FREE_PAGES,
  asrTrack,
  freeTranscript,
  parseVideoSubtitles,
  rankTranscripts,
  type TranscriptApp,
  type TranscriptRow,
} from "../../convex/radar/radarSourcesMath";

const DAY = 86_400_000;
const MAX_N = 40;

type Row = TranscriptRow & { _id: string; videoId: string; publishedAt: number; firstSeenAt: number; transcript?: string; lang?: string };

const lines = <T>(file: string): T[] =>
  readFileSync(file, "utf8")
    .split("\n")
    .filter((l) => l.trim())
    .map((l) => JSON.parse(l) as T);

const sleep = (ms: number) => new Promise<void>((done) => setTimeout(done, ms));

async function cote(snap: string, out: string, n: number): Promise<void> {
  mkdirSync(out, { recursive: true });
  const rows = lines<Row>(join(snap, "radarSignals.jsonl"))
    // Vidéos et carrousels photo (ceux-ci n'ont jamais de texte payant : la file les écarte, cf mode « file »).
    .filter((r) => r.platform === "tiktok" && !!r.transcript && /^https:\/\/www\.tiktok\.com\/@[^/]+\/(?:video|photo)\/\d+$/.test(r.url))
    .sort((a, b) => (b.transcribedAt ?? 0) - (a.transcribedAt ?? 0) || (a.videoId < b.videoId ? -1 : 1))
    .slice(0, Math.min(n, MAX_N));
  let requests = 0;
  const served = new Map<string, string>();
  const page = retrying(
    paced(
      async (url: string): Promise<FreePage> => {
        requests++;
        if (requests > 4 * MAX_N) throw new Error("budget de pages dépassé");
        const r = await fetchEmbedPage(url);
        if (r.kind === "ok") served.set(url, r.text);
        return r.kind === "ok" ? { ok: true, text: r.text } : r.kind === "suspect" ? { ok: false, kind: "suspect", reason: r.reason } : { ok: false, kind: "absent" };
      },
      () => sleep(storePauseMs(Math.random())),
    ),
    () => sleep(FREE_RETRY_MS),
  );
  const results: Record<string, unknown>[] = [];
  let streak = 0;
  let stopped: string | null = null;
  for (const r of rows) {
    const free = await freeTranscript(r.url, page);
    // Le détail des pistes, relu sur la page déjà lue (aucune requête de plus).
    const html = served.get(r.url);
    const subs = html ? parseVideoSubtitles(html) : null;
    const tracks = subs?.kind === "subs" ? subs.tracks.map((t) => `${t.source}:${t.lang}`) : undefined;
    const spoken = subs?.kind === "subs" ? subs.spoken : undefined;
    const res: Record<string, unknown> = { videoId: r.videoId, url: r.url, lang: r.lang, kind: free.kind, ...(tracks ? { tracks } : {}), ...(spoken ? { spoken } : {}) };
    if (free.kind === "text") {
      res.same = free.text === r.transcript;
      res.asr = free.lang;
      if (!res.same) Object.assign(res, { free: free.text, paid: r.transcript });
    } else if (free.kind === "checked") {
      res.why = free.why;
      res.paid = r.transcript;
      if (subs?.kind === "subs") res.picked = asrTrack(subs)?.lang ?? null;
    } else if (free.kind === "miss") {
      res.reason = free.reason;
    }
    results.push(res);
    console.log(JSON.stringify({ ...res, paid: undefined, free: undefined }));
    streak = free.kind === "miss" && free.refused ? streak + 1 : 0;
    if (streak >= STORE_BREAKER) {
      stopped = `${STORE_BREAKER} refus d'affilée`;
      break;
    }
  }
  const count = (k: string) => results.filter((x) => x.kind === k).length;
  const texts = results.filter((x) => x.kind === "text");
  const why: Record<string, number> = {};
  for (const x of results) if (x.kind === "checked") why[String(x.why)] = (why[String(x.why)] ?? 0) + 1;
  const summary = {
    mesures: results.length,
    requetes: requests,
    arret: stopped,
    texte: texts.length,
    identiques: texts.filter((x) => x.same).length,
    differents: texts.filter((x) => !x.same).map((x) => x.videoId),
    sansPiste: count("checked"),
    pourquoi: why,
    supprimees: count("gone"),
    manquees: count("miss"),
    // Chaque vidéo mesurée a coûté 1 crédit au payant (il a rendu un texte) : un texte gratuit l'aurait évité.
    creditsEvites: texts.length,
  };
  writeFileSync(join(out, "cote.jsonl"), results.map((x) => JSON.stringify(x)).join("\n") + "\n");
  writeFileSync(join(out, "cote-resume.json"), JSON.stringify(summary, null, 2) + "\n");
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

const [mode, snap, out, n] = process.argv.slice(2);
if (mode === "cote" && snap && out) await cote(snap, out, Number(n ?? MAX_N));
else if (mode === "file" && snap) file(snap);
else console.log("usage : cote <instantané> <sortie> [N] | file <instantané>");
