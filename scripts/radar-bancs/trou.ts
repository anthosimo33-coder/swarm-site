/**
 * BANC — le trou vérifié sur la page de la vidéo (brique 4, revue du 20/11/2026). EN MESURE (GAP_FREE_CHECK = false).
 *
 * PAS LANCÉ EN DIRECT PAR UN AGENT. Le robots.txt de TikTok interdit tout le site aux agents IA (anthropic-ai,
 * ClaudeBot, Claude-User ; règle de la session du 20/11, 19 h 35) : aucun agent n'envoie de requête à TikTok, ni par
 * ce script. La mesure en direct, c'est le fondateur qui la lance, s'il le décide. Les agents n'en ont lancé que les
 * deux modes sans réseau (`--rejouer`, `--sec`), où `fetch` est remplacé par une fonction qui lève.
 *
 * Ce qu'il mesure : ce que `gapGone` (radarFreeMath, le code livré) conclut de la page publique d'une vidéo, demandée
 * comme la voie gratuite la demande (fetchEmbedPage, sans en-têtes de navigateur ; pause storePauseMs avant chaque page ;
 * second essai d'une page refusée : `retrying(paced(...))`), sur trois jeux tirés de l'instantané de prod :
 *  - partie : les vidéos `gapChecked` de radarTracked — le relevé PAYANT d'un trou ne les a pas retrouvées (passé avant
 *    leur date sans les voir) : plus publiques. Attendu : gapGone vrai (sinon, une économie manquée, pas une perte) ;
 *  - vivante : la vidéo la plus récente de comptes actifs, vue dans une liste de profil dans les 3 heures avant le
 *    dernier relevé de l'instantané — en ligne à ce moment-là. Attendu : gapGone faux. Un « vrai » est un faux
 *    « partie » possible (ou une suppression depuis l'instantané : la page est gardée pour le dire) ;
 *  - photo : les publications « photo » (carrousels) que le relevé payant a rendues et que la liste d'intégration ne porte
 *    pas (radarFirstReadTrials, 14-15/11 : 2 sur 932), demandées en /video/<id> comme la voie le ferait. Attendu : faux.
 * Il compte, par jeu, ce que la page a dit (servie, refus par code et libellé — refusalLabel —, illisible, refusée,
 * absente en 400/404) et la décision gapGone. Chaque page lue est gardée (<sortie>/pages/<jeu>-<id>.html) : `--rejouer`
 * la relit ensuite sans réseau, avec le code du moment.
 * Ce qu'il ne mesure pas : `listReaches` (la liste du moment n'est plus celle du relevé payant : règle logique, prouvée
 * par les tests) ; le payant du même instant (pas de clé du fournisseur sur le poste) — c'est le rôle de la mesure en
 * prod (GAP_FREE_CHECK faux : radarUsage.measured du poste tiktok, « trou-* », cf radarFreeMath.gapMeasure). Et une
 * mesure du poste ne dit pas ce que TikTok sert aux serveurs Convex (vécu le 13/11).
 *
 * BUDGET DE PAGES (en direct) : `--pages N`, 380 par défaut, 400 au plus, seconds essais compris ; une page à la fois,
 * pause storePauseMs (0,3 à 0,7 s) avant chacune ; arrêt à STORE_BREAKER (5) pages refusées d'affilée. `--vivantes K`
 * (40 par défaut). Ordre : photos, vivantes (la question de la revue : un faux « partie »), puis parties.
 *
 * Relancer (construction, puis l'un des trois modes) :
 *   npx esbuild scripts/radar-bancs/trou.ts --bundle --platform=node --format=esm --outfile=<dossier>/trou.mjs
 *   node <dossier>/trou.mjs --rejouer <dossier de pages> <dossier de sortie>           # sans réseau
 *   node <dossier>/trou.mjs --sec <dossier de l'instantané> <dossier de sortie>        # sans réseau : les jeux, les pages prévues
 *   node <dossier>/trou.mjs <dossier de l'instantané> <dossier de sortie> [--pages 380] [--vivantes 40]   # EN DIRECT : le fondateur seul
 */
import { createReadStream, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createInterface } from "node:readline";
import { FREE_RETRY_MS, freeVideoUrl, gapGone, paced, retrying, type FreePage } from "../../convex/radar/radarFreeMath";
import { STORE_BREAKER, fetchEmbedPage, storePauseMs } from "../../convex/radar/radarStoreMath";
import { parseTikTokPublicPage, refusalLabel } from "../../convex/radar/tiktokPublicPage";

const MAX_PAGES = 400;
const HOUR = 3_600_000;

const raw = process.argv.slice(2);
const flag = (name: string, dflt: number) => {
  const i = raw.indexOf(name);
  return i >= 0 ? Number(raw[i + 1]) : dflt;
};
const replay = raw.includes("--rejouer");
const dry = raw.includes("--sec");
const args = raw.filter((a, i) => !a.startsWith("--") && !["--pages", "--vivantes"].includes(raw[i - 1] ?? ""));
const [source, outDir] = args;
if (!source || !outDir || (replay && dry)) {
  console.error("usage : node trou.mjs [--rejouer <pages> | --sec <instantané> | <instantané>] <sortie> [--pages N] [--vivantes K]");
  process.exit(1);
}
// Sans réseau : toute requête lève (garde-fou en plus de ne rien demander).
const offline: typeof fetch = () => {
  throw new Error("banc sans réseau : aucune requête");
};
if (replay || dry) globalThis.fetch = offline;

type Set_ = "partie" | "vivante" | "photo";
type Case = { set: Set_; handle: string; videoId: string };
type Out = Case & { page: string; gone: boolean };

/** Ce que la page dit, en clair, et la décision de la brique (le code livré). */
function judge(c: Case, r: FreePage): Out {
  if (!r.ok) return { ...c, page: r.kind === "absent" ? "absente (400/404)" : `refusée (${r.reason ?? "?"})`, gone: false };
  const p = parseTikTokPublicPage(r.text, c.videoId);
  const page =
    p.kind === "stats"
      ? "servie"
      : p.kind === "refused"
        ? `refus ${p.statusCode} « ${refusalLabel(p.statusCode, p.statusMsg)} » (${p.statusMsg || "sans message"})`
        : `illisible (${p.reason})`;
  return { ...c, page, gone: gapGone(r.text, c.videoId) };
}

function summary(out: readonly Out[], extra: Record<string, unknown>) {
  const tally: Record<string, { cas: number; gone: number; pages: Record<string, number> }> = {};
  for (const o of out) {
    const t = (tally[o.set] ??= { cas: 0, gone: 0, pages: {} });
    t.cas++;
    if (o.gone) t.gone++;
    t.pages[o.page] = (t.pages[o.page] ?? 0) + 1;
  }
  // Ce que la revue demande : aucun « partie » sur une vidéo en ligne.
  return { ...extra, tally, fauxParties: out.filter((o) => o.gone && o.set !== "partie") };
}

function write(out: readonly Out[], resume: unknown, name: string) {
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, `${name}.jsonl`), out.map((o) => JSON.stringify(o)).join("\n") + (out.length ? "\n" : ""));
  writeFileSync(join(outDir, `${name}-resume.json`), JSON.stringify(resume, null, 2));
  console.log(JSON.stringify(resume, null, 2));
}

if (replay) {
  // Les pages déjà relevées (<jeu>-<id>.html) : relues avec le code du moment, sans réseau.
  const out: Out[] = [];
  for (const f of readdirSync(source).filter((x) => x.endsWith(".html")).sort()) {
    const m = /^(partie|vivante|photo)-(\d{15,})\.html$/.exec(f);
    if (!m) continue;
    out.push(judge({ set: m[1] as Set_, handle: "", videoId: m[2] }, { ok: true, text: readFileSync(join(source, f), "utf8") }));
  }
  write(out, summary(out, { mode: "rejeu", pagesTikTok: 0, dossier: source }), "trou-rejeu");
  process.exit(0);
}

const budget = Math.min(MAX_PAGES, flag("--pages", 380));
const wantAlive = flag("--vivantes", 40);
const jsonl = <T>(file: string): T[] =>
  readFileSync(join(source, file), "utf8")
    .split("\n")
    .filter(Boolean)
    .map((l) => JSON.parse(l) as T);

type Tracked = { _id: string; handle: string; status: string; gapChecked?: string; platform?: string };
const tracked = jsonl<Tracked>("radarTracked.jsonl").filter((t) => (t.platform ?? "tiktok") === "tiktok");
const parties: Case[] = tracked.filter((t) => t.gapChecked).map((t) => ({ set: "partie", handle: t.handle, videoId: t.gapChecked! }));

// Les photos : rendues par le payant, absentes de la liste d'intégration (C4, radarFirstReadTrials).
type Trial = { handle: string; free?: { list?: { videoId: string }[] }; paid?: { videoId: string }[] };
const photos: Case[] = [];
for (const t of jsonl<Trial>("radarFirstReadTrials.jsonl")) {
  const listed = new Set((t.free?.list ?? []).map((v) => v.videoId));
  if (!listed.size) continue;
  for (const v of t.paid ?? []) if (!listed.has(v.videoId)) photos.push({ set: "photo", handle: t.handle, videoId: v.videoId });
}

// Les vivantes : la plus récente vidéo de comptes actifs, vue dans une liste dans les 3 h avant le dernier relevé.
const active = new Map(tracked.filter((t) => t.status === "active").map((t) => [t._id, t.handle]));
type Vid = { accountId: string; videoId: string; publishedAt: number; lastSeenAt: number; platform?: string };
const newestByAccount = new Map<string, Vid>();
let lastSeen = 0;
const rl = createInterface({ input: createReadStream(join(source, "radarTrackedVideos.jsonl")) });
for await (const line of rl) {
  if (!line) continue;
  const v = JSON.parse(line) as Vid;
  if (v.platform || !active.has(v.accountId)) continue;
  lastSeen = Math.max(lastSeen, v.lastSeenAt);
  const cur = newestByAccount.get(v.accountId);
  if (!cur || v.publishedAt > cur.publishedAt) newestByAccount.set(v.accountId, v);
}
const fresh = [...newestByAccount.values()].filter((v) => v.lastSeenAt >= lastSeen - 3 * HOUR);
const step = Math.max(1, Math.floor(fresh.length / Math.max(1, wantAlive)));
const vivantes: Case[] = fresh
  .filter((_, i) => i % step === 0)
  .slice(0, wantAlive)
  .map((v) => ({ set: "vivante", handle: active.get(v.accountId)!, videoId: v.videoId }));
const queue = [...photos, ...vivantes, ...parties];

if (dry) {
  // Ce que le banc lirait : pas une page de demandée.
  // Une page par cas, deux s'il est refusé une première fois (retrying) : entre budget/2 et budget cas lus.
  const cas = { auMoins: Math.min(queue.length, Math.floor(budget / 2)), auPlus: Math.min(queue.length, budget) };
  write([], { mode: "à sec", pagesTikTok: 0, budget, jeux: { partie: parties.length, vivante: vivantes.length, photo: photos.length }, casLus: cas }, "trou-sec");
  process.exit(0);
}

const sleep = (ms: number) => new Promise<void>((done) => setTimeout(done, ms));
let pages = 0;
let refusedStreak = 0;
let stopped: string | null = null;
const lanePage = retrying(
  paced(
    async (url: string): Promise<FreePage> => {
      pages++;
      const r = await fetchEmbedPage(url);
      refusedStreak = r.kind === "suspect" ? refusedStreak + 1 : 0;
      return r.kind === "ok" ? { ok: true, text: r.text } : r.kind === "suspect" ? { ok: false, kind: "suspect", reason: r.reason } : { ok: false, kind: "absent" };
    },
    () => sleep(storePauseMs(Math.random())),
  ),
  () => sleep(FREE_RETRY_MS),
);

const out: Out[] = [];
const keep = join(outDir, "pages");
mkdirSync(keep, { recursive: true });
for (const c of queue) {
  // Une page de plus, et son second essai éventuel, doivent tenir dans le budget.
  if (pages + 2 > budget) {
    stopped = `budget de ${budget} pages`;
    break;
  }
  if (refusedStreak >= STORE_BREAKER) {
    stopped = `${STORE_BREAKER} pages refusées d'affilée`;
    break;
  }
  const r = await lanePage(freeVideoUrl(c.handle, c.videoId));
  if (r.ok) writeFileSync(join(keep, `${c.set}-${c.videoId}.html`), r.text);
  out.push(judge(c, r));
}
write(out, summary(out, { mode: "direct", pagesTikTok: pages, stopped, jeux: { partie: parties.length, vivante: vivantes.length, photo: photos.length } }), "trou-banc");
