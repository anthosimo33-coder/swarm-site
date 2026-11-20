/**
 * BANC — la courbe des vues sur la page publique d'une vidéo (brique 6, 20/11/2026).
 *
 * Ce qu'il mesure : pour des vidéos RÉELLES de la courbe (l'instantané de prod `radarSignals.jsonl`, celles qui ont un
 * `curveStartedAt`), ce que le code livré tire de leur page — la page demandée comme la voie la demande (fetchEmbedPage,
 * pause storePauseMs avant chaque page, second essai d'une page refusée : `retrying(paced(...))`), lue par
 * `curveVerdict` (radarFreeMath). Il compte les verdicts (lue, partie, payant), et pour chaque compteur lu : s'il porte
 * l'arrondi de la page (multiple de `pageStep` au-delà de 10 000) et s'il est sous la valeur que le relevé PAYANT avait
 * rangée en prod, plus tôt (un compteur ne baisse pas ; sous elle, c'est l'arrondi ou une page en retard). Avec
 * `--navigateur k`, les k premières vidéos sont relues avec les en-têtes d'un navigateur (fetchTikTokPublicStats) : les
 * nombres changent-ils ?
 * Ce qu'il ne mesure pas : le payant du même instant (pas de clé du fournisseur sur le poste) — c'est le rôle de la
 * mesure en prod (CURVE_FREE faux). Et une mesure du poste ne dit pas ce que TikTok sert aux serveurs Convex.
 *
 * Budget de pages : `--pages N` (12 par défaut, 40 au plus), seconds essais et relectures « navigateur » compris ; une
 * page à la fois ; arrêt à 5 pages refusées d'affilée.
 *
 * Relancer :
 *   npx esbuild scripts/radar-bancs/courbe.ts --bundle --platform=node --format=esm --outfile=<dossier>/courbe.mjs \
 *     && node <dossier>/courbe.mjs <radarSignals.jsonl> <dossier de sortie> [--pages 20] [--navigateur 4]
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { FREE_RETRY_MS, curveVerdict, freeVideoUrl, paced, pageStep, retrying, type CurveVerdict, type FreePage } from "../../convex/radar/radarFreeMath";
import { fetchEmbedPage, storePauseMs } from "../../convex/radar/radarStoreMath";
import { CURVE_COUNTS, type CurveCounts } from "../../convex/radar/radarSignalsMath";
import { fetchTikTokPublicStats } from "../../convex/radar/tiktokPublicPage";

const MAX_PAGES = 40;
const BREAKER = 5;

const args = process.argv.slice(2);
const flag = (name: string, dflt: number) => {
  const i = args.indexOf(name);
  return i >= 0 ? Number(args[i + 1]) : dflt;
};
const [signalsPath, outDir] = args;
if (!signalsPath || !outDir) {
  console.error("usage : node courbe.mjs <radarSignals.jsonl> <dossier de sortie> [--pages N] [--navigateur k]");
  process.exit(1);
}
const budget = Math.min(MAX_PAGES, flag("--pages", 12));
const browserFirst = flag("--navigateur", 0);

type Row = { videoId: string; authorHandle: string; platform?: string; curveStartedAt?: number } & CurveCounts;
const rows: Row[] = readFileSync(signalsPath, "utf8")
  .split("\n")
  .filter(Boolean)
  .map((l) => JSON.parse(l) as Row)
  .filter((r) => r.curveStartedAt !== undefined && (r.platform ?? "tiktok") === "tiktok")
  .sort((a, b) => b.views - a.views);

const sleep = (ms: number) => new Promise<void>((done) => setTimeout(done, ms));
let pages = 0;
let streak = 0;
const lanePage = retrying(
  paced(
    async (url: string): Promise<FreePage> => {
      pages++;
      const r = await fetchEmbedPage(url);
      return r.kind === "ok" ? { ok: true, text: r.text } : r.kind === "suspect" ? { ok: false, kind: "suspect", reason: r.reason } : { ok: false, kind: "absent" };
    },
    () => sleep(storePauseMs(Math.random())),
  ),
  () => sleep(FREE_RETRY_MS),
);

// Des vidéos de tout le spectre des vues (de la plus vue à la moins vue), une page chacune.
const wanted = Math.max(1, budget - Math.min(browserFirst, budget));
const step = Math.max(1, Math.floor(rows.length / wanted));
const picked = rows.filter((_, i) => i % step === 0).slice(0, wanted);

type Out = { videoId: string; handle: string; prod: CurveCounts; verdict: CurveVerdict; browserSame?: boolean | null };
const out: Out[] = [];
let stopped: string | null = null;
for (const r of picked) {
  // Une page de plus, et son second essai éventuel, doivent tenir dans le budget.
  if (pages + 2 > budget) break;
  const verdict = curveVerdict(await lanePage(freeVideoUrl(r.authorHandle, r.videoId)), r.videoId);
  streak = verdict.kind === "paid" && verdict.refused ? streak + 1 : 0;
  const prod: CurveCounts = { authorFans: r.authorFans, views: r.views, likes: r.likes, comments: r.comments, shares: r.shares, saves: r.saves };
  out.push({ videoId: r.videoId, handle: r.authorHandle, prod, verdict });
  if (streak >= BREAKER) {
    stopped = `${BREAKER} pages refusées d'affilée`;
    break;
  }
}
// Les mêmes pages, avec les en-têtes d'un navigateur : les nombres changent-ils ?
for (const o of out.slice(0, browserFirst)) {
  if (stopped || pages + 1 > budget || o.verdict.kind !== "read") continue;
  await sleep(storePauseMs(Math.random()));
  pages++;
  const b = await fetchTikTokPublicStats(freeVideoUrl(o.handle, o.videoId), o.videoId);
  const c = o.verdict.counts;
  o.browserSame = b.kind === "stats" ? b.stats.views === c.views && b.stats.likes === c.likes && b.stats.comments === c.comments && b.stats.shares === c.shares && b.stats.saves === c.saves && (b.stats.author?.followers ?? null) === c.authorFans : null;
}

const read = out.filter((o) => o.verdict.kind === "read");
const per = Object.fromEntries(
  CURVE_COUNTS.map((k) => {
    const big = read.filter((o) => o.verdict.kind === "read" && o.verdict.counts[k] >= 10_000);
    const rounded = big.filter((o) => o.verdict.kind === "read" && o.verdict.counts[k] % pageStep(o.verdict.counts[k]) === 0);
    const under = read.filter((o) => o.verdict.kind === "read" && o.verdict.counts[k] < o.prod[k]);
    const underByRounding = under.filter((o) => o.verdict.kind === "read" && o.prod[k] - o.verdict.counts[k] <= pageStep(o.prod[k]));
    return [k, { auDela10k: big.length, arrondis: rounded.length, sousLePayant: under.length, dontArrondi: underByRounding.length }];
  }),
);
const summary = {
  quand: new Date().toISOString(),
  budget,
  pages,
  stopped,
  videos: out.length,
  verdicts: {
    lue: read.length,
    partie: out.filter((o) => o.verdict.kind === "gone").length,
    payant: out.filter((o) => o.verdict.kind === "paid").length,
  },
  payantPourquoi: out.flatMap((o) => (o.verdict.kind === "paid" ? [o.verdict.why] : [])),
  compteurs: per,
  navigateur: { relues: out.filter((o) => o.browserSame !== undefined).length, memesNombres: out.filter((o) => o.browserSame === true).length },
};
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "courbe-banc.jsonl"), out.map((o) => JSON.stringify(o)).join("\n") + "\n");
writeFileSync(join(outDir, "courbe-banc-resume.json"), JSON.stringify(summary, null, 2) + "\n");
console.log(JSON.stringify(summary, null, 2));
