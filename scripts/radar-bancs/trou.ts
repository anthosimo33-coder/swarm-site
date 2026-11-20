/**
 * BANC — le trou vérifié sur la page de la vidéo (brique 4, revue du 20/11/2026). EN MESURE (GAP_FREE_CHECK = false).
 *
 * SANS RÉSEAU PAR DÉFAUT. Le robots.txt de TikTok interdit tout le site aux agents IA (anthropic-ai, ClaudeBot,
 * Claude-User ; règle de la session du 20/11, 19 h 35) : aucun agent n'envoie de requête à TikTok, ni par ce script.
 * Sans drapeau, ou avec `--sec`, le script tourne hors ligne ; `--rejouer` relit des pages gardées, hors ligne aussi.
 * Dans ces deux modes `fetch` est remplacé par une fonction qui lève. Seul `--direct`, écrit en toutes lettres, envoie
 * des requêtes : c'est le fondateur qui le lance, s'il le décide. Tout autre drapeau (`--seche`, `-sec`…) est refusé.
 *
 * LA MESURE EN DIRECT (`--direct`, le fondateur) : les 301 comptes `gapChecked` de l'instantané — le relevé PAYANT de
 * leur trou est passé avant la date de leur dernière vidéo connue sans la voir : « pas retrouvée » (supprimée, ou arrêt
 * du payant sur une vidéo épinglée plus ancienne). Pour chacun, DEUX pages, comme la voie gratuite les demande
 * (fetchEmbedPage, sans en-têtes de navigateur ; `retrying(paced(...))`) :
 *  - la page d'intégration du compte (`/embed/@pseudo`) : la condition « la liste remonte » (listReaches) ;
 *  - la page de la vidéo (`/@pseudo/video/<id>`) : ce que TikTok en dit (gapPageKind, gapGone).
 * Puis la décision de la brique, par le code livré : freeRead sur ces deux pages relues sans réseau (vidéo la plus
 * récente = la vidéo gapChecked, vidéos connues = radarTrackedVideos du compte), et le verdict que gapMeasure rangerait
 * dans radarUsage.measured face à la conclusion payante (« pas retrouvée ») : trou-egal, ou trou-manque:<genre>.
 * Avant les 301, les CONTRÔLES (une page chacun) : les 2 « photos » de C4 et 20 vidéos vivantes (`--vivantes N`, vues
 * dans une liste dans les 3 h avant le dernier relevé de l'instantané) — la page ne doit pas les dire parties : un faux
 * « partie » sur une vidéo en ligne est le seul risque de qualité, et le jeu des 301 ne peut pas le voir.
 * `--direct --controles` : les contrôles seuls.
 *
 * BUDGET : 650 REQUÊTES AU PLUS PAR DOSSIER DE SORTIE, contrôles compris, seconds essais compris, tous lancements
 * confondus (le compte est gardé dans <sortie>/requetes.json ; `--pages N` le baisse, jamais au-delà de 650). Sans
 * refus : 22 contrôles + 2 × 301 = 624, 26 de marge. Une page à la fois, pause storePauseMs (0,3 à 0,7 s) avant
 * chacune ; arrêt à STORE_BREAKER (5) réponses refusées d'affilée. Ces deux bornes sont tenues À LA REQUÊTE : la
 * fonction qui fetche refuse de partir au budget atteint ou après 5 refus d'affilée — le second essai de `retrying`
 * compris. Un compte n'est commencé que si ses deux pages et leurs seconds essais (4) tiennent dans le reste. Le plan
 * et le budget sont affichés avant la première requête. Chaque page lue est gardée (<sortie>/pages/) : `--rejouer` la
 * relit sans réseau, avec le code du moment.
 *
 * Limites, à dire avec le résultat : une mesure du poste ne dit pas ce que TikTok sert aux serveurs Convex (vécu le
 * 13/11 : 31 profils sur 32 du poste, 0 sur 6 des serveurs) ; la liste lue aujourd'hui n'est pas celle du jour du trou
 * (le compte a pu publier depuis : « ne remonte pas » est alors pessimiste) ; une vidéo supprimée depuis le payant ne
 * dit rien de plus ; le payant du contrôle n'a gardé aucune vidéo, d'où pas de « trou-ecart » possible ici. La preuve
 * qui décide la bascule reste celle des serveurs : radarUsage.measured (trou-egal, aucun trou-ecart), cf
 * radarFreeMath.gapMeasure.
 *
 * HORS LIGNE (`--sec`, ou sans drapeau : ce que les agents lancent) : sur l'instantané seul — le nombre de gapChecked,
 * leur rythme (jour où leur vidéo a été vue pour la dernière fois), les crédits « trou » du 14 au 20/11
 * (radarUsage.reasons), la part des crédits trou passée en contrôles « pas retrouvée » (plancher), « la liste remonte »
 * rejouée par le code livré (listGap, listReaches) sur la liste reconstituée à trois heures possibles du contrôle, et une
 * ESTIMATION du gain si la bascule se fait. Et le plan de la mesure en direct (cas, requêtes). 0 requête.
 *
 * Relancer (construction, puis un mode) :
 *   npx esbuild scripts/radar-bancs/trou.ts --bundle --platform=node --format=esm --outfile=<dossier>/trou.mjs
 *   node <dossier>/trou.mjs <instantané> <sortie>                               # sans réseau (= --sec)
 *   node <dossier>/trou.mjs --rejouer <pages> <instantané> <sortie>             # sans réseau : pages gardées
 *   node <dossier>/trou.mjs --direct <instantané> <sortie> [--pages 650] [--vivantes 20]   # EN DIRECT : le fondateur seul
 *   node <dossier>/trou.mjs --direct --controles <instantané> <sortie>          # EN DIRECT, contrôles seuls : le fondateur
 */
import { createReadStream, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createInterface } from "node:readline";
import {
  FREE_RETRY_MS,
  freeProfileUrl,
  freeRead,
  freeVideoUrl,
  gapGone,
  gapMeasure,
  gapPageKind,
  listGap,
  listReaches,
  paced,
  retrying,
  videoIdTime,
  type FreeListed,
  type FreePage,
  type KnownVideo,
} from "../../convex/radar/radarFreeMath";
import { STORE_BREAKER, fetchEmbedPage, storePauseMs } from "../../convex/radar/radarStoreMath";
import { SC_PRICE_PER_CREDIT } from "../../convex/radar/radarSignalsMath";
import { parseTikTokPublicPage, refusalLabel } from "../../convex/radar/tiktokPublicPage";

/** Le budget de la mesure en direct (requêtes, contrôles et seconds essais compris, par dossier de sortie). */
const MAX_REQUESTS = 650;
const HOUR = 3_600_000;
const DAY = 24 * HOUR;
/** La liste d'intégration d'un profil : 10 à 13 vidéos (13/11) ; 12 pour la reconstituer. Une page payante : 9. */
const EMBED_LIST = 12;
const PAID_PAGE = 9;

// ─── Les drapeaux : hors ligne sauf `--direct` écrit en toutes lettres ─────────

const RULE =
  "Règle du 20/11 (19 h 35) : le robots.txt de TikTok interdit le site aux agents IA ; aucun agent ne lance la mesure en direct. " +
  "Hors ligne : node trou.mjs <instantané> <sortie> (ou --sec), node trou.mjs --rejouer <pages> <instantané> <sortie>.";
const raw = process.argv.slice(2);
const KNOWN = new Set(["--sec", "--rejouer", "--direct", "--controles", "--pages", "--vivantes"]);
const unknown = raw.filter((a) => a.startsWith("-") && !KNOWN.has(a));
if (unknown.length) {
  console.error(`drapeau inconnu : ${unknown.join(" ")} — rien n'est lancé.\n${RULE}`);
  process.exit(1);
}
const flag = (name: string, dflt: number) => {
  const i = raw.indexOf(name);
  return i >= 0 ? Number(raw[i + 1]) : dflt;
};
const live = raw.includes("--direct");
if (!live && raw.includes("--controles")) {
  console.error(`--controles envoie des requêtes à TikTok : il faut --direct en toutes lettres — rien n'est lancé.\n${RULE}`);
  process.exit(1);
}
if (live && (raw.includes("--sec") || raw.includes("--rejouer"))) {
  console.error("--direct ne se combine ni avec --sec ni avec --rejouer — rien n'est lancé.");
  process.exit(1);
}
const mode = live ? (raw.includes("--controles") ? "controles" : "direct") : raw.includes("--rejouer") ? "rejeu" : "sec";
const args = raw.filter((a, i) => !a.startsWith("--") && !["--pages", "--vivantes"].includes(raw[i - 1] ?? ""));
const [pagesDir, snap, outDir] = mode === "rejeu" ? args : [undefined, args[0], args[1]];
if (!snap || !outDir || (mode === "rejeu" && !pagesDir)) {
  console.error("usage : node trou.mjs [--sec] <instantané> <sortie>  |  node trou.mjs --rejouer <pages> <instantané> <sortie>  |  (fondateur) node trou.mjs --direct [--controles] <instantané> <sortie> [--pages N] [--vivantes N]");
  process.exit(1);
}
// Sans réseau : toute requête lève (garde-fou en plus de ne rien demander).
if (!live) {
  globalThis.fetch = (() => {
    throw new Error("banc sans réseau : aucune requête");
  }) as typeof fetch;
}

const jsonl = <T>(file: string): T[] =>
  readFileSync(join(snap, file), "utf8")
    .split("\n")
    .filter(Boolean)
    .map((l) => JSON.parse(l) as T);
const day = (ms: number) => new Date(ms).toISOString().slice(0, 10);
const write = (name: string, rows: readonly unknown[], resume: unknown) => {
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, `${name}.jsonl`), rows.map((o) => JSON.stringify(o)).join("\n") + (rows.length ? "\n" : ""));
  writeFileSync(join(outDir, `${name}-resume.json`), JSON.stringify(resume, null, 2));
  console.log(JSON.stringify(resume, null, 2));
};

// ─── L'instantané : les 301 comptes gapChecked, leurs vidéos ; les contrôles ───

type Tracked = { _id: string; handle: string; status: string; readAt?: number; nextReadAt: number; gapChecked?: string };
type TV = { accountId: string; videoId: string; publishedAt: number; lastSeenAt: number; _creationTime: number; platform?: string };
const tracked = jsonl<Tracked>("radarTracked.jsonl");
const gapAccounts = tracked.filter((t) => t.gapChecked);
const gapIds = new Set(gapAccounts.map((t) => t._id));
const active = new Map(tracked.filter((t) => t.status === "active").map((t) => [t._id, t.handle]));
const vidsOf = new Map<string, TV[]>();
const newestByAccount = new Map<string, TV>();
let lastSeen = 0;
const rl = createInterface({ input: createReadStream(join(snap, "radarTrackedVideos.jsonl")) });
for await (const line of rl) {
  if (!line) continue;
  const v = JSON.parse(line) as TV;
  if (v.platform) continue;
  if (gapIds.has(v.accountId)) vidsOf.set(v.accountId, [...(vidsOf.get(v.accountId) ?? []), v]);
  if (active.has(v.accountId)) {
    lastSeen = Math.max(lastSeen, v.lastSeenAt);
    const cur = newestByAccount.get(v.accountId);
    if (!cur || v.publishedAt > cur.publishedAt) newestByAccount.set(v.accountId, v);
  }
}
type Case = { handle: string; accountId: string; gap: TV; vids: TV[]; status: string; readAt?: number };
const cases: Case[] = [];
for (const t of gapAccounts) {
  const vids = vidsOf.get(t._id) ?? [];
  const gap = vids.find((v) => v.videoId === t.gapChecked);
  if (gap) cases.push({ handle: t.handle, accountId: t._id, gap, vids: vids.filter((v) => v.videoId !== gap.videoId), status: t.status, ...(t.readAt !== undefined ? { readAt: t.readAt } : {}) });
}
// Les contrôles : les « photos » de C4 (dans le payant, absentes de la liste d'intégration) et des vidéos vivantes.
type Trial = { handle: string; free?: { list?: { videoId: string }[] }; paid?: { videoId: string }[] };
const photos: { set: string; handle: string; videoId: string }[] = [];
for (const t of jsonl<Trial>("radarFirstReadTrials.jsonl")) {
  const listed = new Set((t.free?.list ?? []).map((v) => v.videoId));
  if (!listed.size) continue;
  for (const v of t.paid ?? []) if (!listed.has(v.videoId)) photos.push({ set: "photo", handle: t.handle, videoId: v.videoId });
}
const fresh = [...newestByAccount.values()].filter((v) => v.lastSeenAt >= lastSeen - 3 * HOUR);
const wantAlive = Math.max(0, flag("--vivantes", 20));
const step = Math.max(1, Math.floor(fresh.length / Math.max(1, wantAlive)));
const vivantes = fresh
  .filter((_, i) => i % step === 0)
  .slice(0, wantAlive)
  .map((v) => ({ set: "vivante", handle: active.get(v.accountId)!, videoId: v.videoId }));
const controls = [...photos, ...vivantes];

/** Ce que la page de la vidéo dit, en clair (le genre, gapPageKind, est le code livré ; ceci n'est que le détail). */
function videoDetail(r: FreePage | null, videoId: string): string {
  if (!r) return "non lue (budget ou arrêt)";
  if (!r.ok) return r.kind === "absent" ? "absente (400/404)" : `refusée (${r.reason ?? "?"})`;
  const p = parseTikTokPublicPage(r.text, videoId);
  if (p.kind === "stats") return "vivante (servie)";
  if (p.kind === "refused") return `${p.statusCode} « ${refusalLabel(p.statusCode, p.statusMsg)} »`;
  return `illisible (${p.reason})`;
}

/** La décision de la brique (freeRead, le code livré) sur les deux pages déjà lues, sans réseau, et son verdict de mesure. */
async function decide(c: Case, profile: FreePage | null, video: FreePage | null, now: number) {
  if (!profile) return { liste: "non lue", décision: "non mesurée", verdict: "non mesuré" };
  const gapUrl = freeVideoUrl(c.handle, c.gap.videoId);
  const pages = new Map<string, FreePage>([[freeProfileUrl(c.handle), profile], [gapUrl, video ?? { ok: false, kind: "suspect", reason: "non lue" }]]);
  // Une page que la mesure n'a pas lue (une vidéo de la liste) : absente, sans réseau — après la décision du trou.
  const page = async (url: string): Promise<FreePage> => pages.get(url) ?? { ok: false, kind: "absent" };
  const known = async (ids: string[]): Promise<KnownVideo[]> => {
    const set = new Set(ids);
    return c.vids.filter((v) => set.has(v.videoId)).map((v) => ({ videoId: v.videoId, publishedAt: v.publishedAt }));
  };
  const newest = { videoId: c.gap.videoId, publishedAt: c.gap.publishedAt };
  const f = await freeRead(c.handle, { page, known, newest: async () => newest, gapPage: () => true }, now, undefined, false);
  if (f.ok) return { liste: "porte la vidéo (pas de trou)", décision: "pas de trou : relevé gratuit", verdict: "sans trou" };
  if (f.why !== "gap")
    return {
      liste: `profil : ${f.why}${f.reason ? ` (${f.reason})` : ""}`,
      décision: f.why === "suspect" ? "payant (profil refusé)" : "aucune (profil sans rien à lire : erreur de relevé)",
      verdict: f.why === "suspect" ? "hors mesure (profil refusé)" : "hors mesure (profil sans rien à lire)",
    };
  if (!f.seen) return { liste: "ne remonte pas", décision: "payant (la liste ne remonte pas : page pas lue en prod)", verdict: "hors mesure (page pas lue)" };
  if (!video) return { liste: "remonte", décision: "non mesurée (page de la vidéo non lue)", verdict: "non mesuré" };
  // Ce que gapMeasure rangerait face au payant du contrôle : passé avant sa date sans la voir (`gapChecked`). Ses
  // vidéos ne sont pas gardées : pas de « trou-ecart » possible ici (une photo plus récente, cf les contrôles).
  const verdict = gapMeasure(f.seen, { outcome: "read", videos: [], reached: { done: true, found: false } }, newest);
  return { liste: "remonte", décision: f.seen.page === "partie" ? "sans payer (page : partie)" : `payant (page : ${f.seen.page})`, verdict };
}

function tally(rows: readonly Record<string, unknown>[], key: string): Record<string, number> {
  const o: Record<string, number> = {};
  for (const r of rows) o[String(r[key])] = (o[String(r[key])] ?? 0) + 1;
  return o;
}

// ─── Hors ligne : nombre, rythme, crédits, contrôles « pas retrouvée », la liste rejouée, l'estimation ───

if (mode === "sec") {
  type Usage = { day: string; poste: string; credits: number; calls: number; reasons?: Record<string, number> };
  const usage = jsonl<Usage>("radarUsage.jsonl").filter((u) => u.poste === "tiktok" && u.day >= "2026-11-14");
  const trou: Record<string, number> = {};
  for (const u of usage.sort((a, b) => a.day.localeCompare(b.day))) trou[u.day] = u.reasons?.trou ?? 0;
  const trouTotal = Object.values(trou).reduce((s, c) => s + c, 0);
  // Le jour où la vidéo a été vue pour la dernière fois dans une liste : le contrôle payant est venu au relevé suivant.
  const bySeen = tally(cases.map((c) => ({ d: day(c.gap.lastSeenAt) })), "d");
  const since14 = cases.filter((c) => day(c.gap.lastSeenAt) >= "2026-11-14").length;
  const FULL = ["2026-11-16", "2026-11-17", "2026-11-18", "2026-11-19"];
  const days1619 = FULL.map((d) => bySeen[d] ?? 0);
  // La liste du profil au contrôle, reconstituée : les vidéos du compte publiées avant l'heure du contrôle (la vidéo
  // gapChecked ôtée), 12 au plus ; connues = rangées avant cette heure. L'heure exacte n'est pas gardée : trois bornes.
  const at = {
    "vue + 6 h (au plus tôt, MIN_READ_GAP_MS)": (c: Case) => c.gap.lastSeenAt + 6 * HOUR,
    "vue + 24 h (un compte actif est relu chaque jour)": (c: Case) => c.gap.lastSeenAt + DAY,
    "dernier relevé (readAt, au plus tard)": (c: Case) => c.readAt ?? c.gap.lastSeenAt + DAY,
  };
  const reach: Record<string, { trou: number; remonte: number; neRemontePas: number; listeVide: number }> = {};
  const perCase: Record<string, unknown>[] = [];
  for (const [name, fn] of Object.entries(at)) {
    const o = { trou: 0, remonte: 0, neRemontePas: 0, listeVide: 0 };
    for (const c of cases) {
      const T = fn(c);
      const listed: FreeListed[] = c.vids
        .filter((v) => v.publishedAt <= T)
        .sort((a, b) => b.publishedAt - a.publishedAt)
        .slice(0, EMBED_LIST)
        .map((v) => ({ videoId: v.videoId, caption: "", views: 0, publishedAt: videoIdTime(v.videoId) }));
      const known: KnownVideo[] = c.vids.filter((v) => v._creationTime <= T).map((v) => ({ videoId: v.videoId, publishedAt: v.publishedAt }));
      const newest = { videoId: c.gap.videoId, publishedAt: c.gap.publishedAt };
      if (!listed.length) {
        o.listeVide++;
        continue;
      }
      if (listGap(listed, newest)) o.trou++;
      const ok = listReaches(listed, known, newest);
      if (ok) o.remonte++;
      else o.neRemontePas++;
      // Ce que le payant du contrôle a lu : une page de 9 suffit s'il y a moins de 9 vidéos plus récentes qu'elle (une
      // plus ancienne est dans sa première page : il s'arrête dessus) ; sinon une deuxième page (la liste en porte 12).
      const newer = c.vids.filter((v) => v.publishedAt > c.gap.publishedAt && v.publishedAt <= T).length;
      if (name.startsWith("vue + 24 h"))
        perCase.push({ handle: c.handle, video: c.gap.videoId, publiée: day(c.gap.publishedAt), vueDernièreFois: day(c.gap.lastSeenAt), plusRécentesAvantContrôle: newer, listeRemonte: ok, créditsDuPayant: newer >= PAID_PAGE ? 2 : 1, payant: "pas retrouvée" });
    }
    reach[name] = o;
  }
  // L'estimation, sur les 4 jours pleins du 16 au 19/11 : les contrôles « pas retrouvée » dont la liste remonte (vue + 24 h).
  const full = perCase.filter((o) => FULL.includes(String(o.vueDernièreFois)));
  const reaches = full.filter((o) => o.listeRemonte);
  const low = reaches.length;
  const high = reaches.reduce((s, o) => s + Number(o.créditsDuPayant), 0);
  const perDay = (n: number) => Math.round((n / FULL.length) * 10) / 10;
  const usd = (n: number) => Math.round(perDay(n) * 30 * SC_PRICE_PER_CREDIT * 100) / 100;
  const ctl = photos.length + vivantes.length;
  const plan = { cas: cases.length, contrôles: ctl, requêtesSansRefus: ctl + 2 * cases.length, budget: MAX_REQUESTS, margePourSecondsEssais: MAX_REQUESTS - ctl - 2 * cases.length };
  write("trou-sec", perCase, {
    mode: "hors ligne (instantané du 20/11 17:14)",
    requêtesTikTok: 0,
    gapChecked: { comptes: gapAccounts.length, avecLeurVidéoRangée: cases.length, actifs: cases.filter((c) => c.status === "active").length },
    rythme: { vueDernièreFoisParJour: bySeen, du16au19: days1619, depuisLe14: since14 },
    créditsTrou14au20: { parJour: trou, total: trouTotal },
    contrôlesPasRetrouvée: {
      part: `${since14} contrôles payants « pas retrouvée » (suppression, ou arrêt du payant sur une épinglée plus ancienne) depuis le 14/11, ≥ 1 crédit chacun, sur ${trouTotal} crédits trou : ${Math.round((100 * since14) / trouTotal)} % au moins des crédits trou`,
      pasUnePartDeSuppressions: "le payant s'arrête aussi sur une vidéo ÉPINGLÉE plus ancienne de sa première page sans avoir vu la vidéo, poussée plus loin : « pas retrouvée » n'est pas « supprimée »",
      pourquoiPlancher: "gapChecked ne garde que le DERNIER contrôle d'un compte ; un trou comblé page après page (la vidéo retrouvée) coûte 2 à 3 crédits",
    },
    listeRemonte: reach,
    estimationDuGain: {
      règle: "un contrôle « pas retrouvée » dont la liste remonte ET dont la page dit la vidéo partie = 1 relevé payant évité, de 1 page (moins de 9 vidéos plus récentes qu'elle) ou 2 (9 à 12)",
      contrôlesParJour16au19: days1619,
      crédits: `${low} contrôles sur ${full.length} du 16 au 19/11 (vue + 24 h), dont ${reaches.filter((o) => Number(o.créditsDuPayant) === 2).length} à 2 pages : ${perDay(low)} à ${perDay(high)} crédits par jour, ${usd(low)} à ${usd(high)} $ par mois ; tous les crédits trou du 14 au 20/11 : ${trouTotal} (${Math.round((trouTotal / 7) * 30 * SC_PRICE_PER_CREDIT * 100) / 100} $ par mois au rythme de la semaine)`,
      pasUnPlafond: "le compte des contrôles est un plancher (gapChecked ne garde que le dernier d'un compte) ; l'estimation suppose que TOUTES les pages disent la vidéo partie aux serveurs (sinon moins) : ni plafond, ni plancher",
      pagesEnMesure: "la page de la vidéo d'un trou dont la liste remonte : ~1 page par contrôle, quand un payant peut partir (gapPage)",
    },
    planDeLaMesureEnDirect: plan,
  });
  process.exit(0);
}

// ─── Les pages : lues (direct) ou relues (rejeu) ───────────────────────────────

const keep = mode === "rejeu" ? pagesDir! : join(outDir, "pages");
mkdirSync(keep, { recursive: true });
const saved = (name: string): FreePage | null => (existsSync(join(keep, name)) ? { ok: true, text: readFileSync(join(keep, name), "utf8") } : null);

// Le compte des requêtes du dossier de sortie, tous lancements confondus : 650 au plus pour toute la mesure.
const ledger = join(outDir, "requetes.json");
const before = existsSync(ledger) ? Number((JSON.parse(readFileSync(ledger, "utf8")) as { total: number }).total) : 0;
// `--pages N` borne ce lancement-ci ; le dossier, lui, n'en reçoit jamais plus de MAX_REQUESTS en tout.
const budget = live ? Math.max(0, Math.min(MAX_REQUESTS - before, flag("--pages", MAX_REQUESTS))) : 0;
const sleep = (ms: number) => new Promise<void>((done) => setTimeout(done, ms));
let requests = 0;
let refusedStreak = 0;
let stopped: string | null = null;
/** La dernière réponse vraiment reçue (un refus suivi d'un second essai que la borne a retenu reste un refus). */
let lastReal: FreePage | null = null;
const lanePage = retrying(
  paced(
    async (url: string): Promise<FreePage> => {
      // Les deux bornes, avant CHAQUE requête (le second essai de retrying compris) : rien ne part au-delà.
      if (requests >= budget) stopped ??= `budget de ${budget} requêtes (${before + requests} dans ce dossier)`;
      if (refusedStreak >= STORE_BREAKER) stopped ??= `${STORE_BREAKER} réponses refusées d'affilée`;
      if (stopped) return { ok: false, kind: "suspect", reason: `arrêt : ${stopped}` };
      requests++;
      writeFileSync(ledger, JSON.stringify({ total: before + requests }));
      const r = await fetchEmbedPage(url);
      refusedStreak = r.kind === "suspect" ? refusedStreak + 1 : 0;
      lastReal = r.kind === "ok" ? { ok: true, text: r.text } : r.kind === "suspect" ? { ok: false, kind: "suspect", reason: r.reason } : { ok: false, kind: "absent" };
      return lastReal;
    },
    () => sleep(storePauseMs(Math.random())),
  ),
  () => sleep(FREE_RETRY_MS),
);
const fetchPage = async (url: string): Promise<FreePage | null> => {
  if (stopped) return null;
  lastReal = null;
  const r = await lanePage(url);
  return !r.ok && r.reason?.startsWith("arrêt : ") ? lastReal : r;
};

if (live) {
  const ctl = controls.length;
  console.log(
    JSON.stringify(
      {
        mesure: mode === "controles" ? "contrôles seuls, EN DIRECT" : "contrôles puis les 301 gapChecked, EN DIRECT",
        contrôles: ctl,
        comptes: mode === "controles" ? 0 : cases.length,
        requêtesSansRefus: ctl + (mode === "controles" ? 0 : 2 * cases.length),
        budgetDeCeLancement: budget,
        déjàDansCeDossier: before,
        plafondDuDossier: MAX_REQUESTS,
        rythme: "une page à la fois, pause 0,3 à 0,7 s avant chacune, second essai 2,5 s après un refus",
        arrêt: `${STORE_BREAKER} réponses refusées d'affilée, ou le budget, tenus avant chaque requête`,
      },
      null,
      2,
    ),
  );
}

// Les contrôles (direct) : la page de la vidéo, seule ; elle ne doit pas les dire parties.
const outControls: Record<string, unknown>[] = [];
if (live) {
  for (const c of controls) {
    if (requests + 2 > budget) {
      stopped ??= `budget de ${budget} requêtes`;
      break;
    }
    const r = await fetchPage(freeVideoUrl(c.handle, c.videoId));
    if (!r) break;
    if (r.ok) writeFileSync(join(keep, `controle-${c.videoId}.html`), r.text);
    outControls.push({ ...c, page: gapPageKind(r, c.videoId), détail: videoDetail(r, c.videoId), partie: r.ok && gapGone(r.text, c.videoId) });
  }
}
if (mode === "controles") {
  write("trou-controles", outControls, { mode: "contrôles en direct", requêtesTikTok: requests, dansCeDossier: before + requests, budget, stopped, parJeu: tally(outControls, "set"), pages: tally(outControls, "page"), fauxParties: outControls.filter((o) => o.partie) });
  process.exit(0);
}

// Les 301 (direct : deux pages par compte, dans l'ordre de l'instantané) ; rejeu : les pages gardées, sans réseau.
const now = Date.now();
const out: Record<string, unknown>[] = [];
for (const c of cases) {
  let profile: FreePage | null = null;
  let video: FreePage | null = null;
  if (mode === "rejeu") {
    profile = saved(`profil-${c.handle}.html`);
    video = saved(`video-${c.gap.videoId}.html`);
    if (!profile && !video) continue;
  } else {
    // Les deux pages du compte et leurs seconds essais doivent tenir dans le reste du budget.
    if (requests + 4 > budget) {
      stopped ??= `budget de ${budget} requêtes`;
      break;
    }
    profile = await fetchPage(freeProfileUrl(c.handle));
    if (profile?.ok) writeFileSync(join(keep, `profil-${c.handle}.html`), profile.text);
    video = await fetchPage(freeVideoUrl(c.handle, c.gap.videoId));
    if (video?.ok) writeFileSync(join(keep, `video-${c.gap.videoId}.html`), video.text);
    if (!profile && !video) break;
  }
  const d = await decide(c, profile, video, now);
  out.push({
    handle: c.handle,
    video: c.gap.videoId,
    publiée: day(c.gap.publishedAt),
    vueDernièreFois: day(c.gap.lastSeenAt),
    page: video ? gapPageKind(video, c.gap.videoId) : "non lue",
    détail: videoDetail(video, c.gap.videoId),
    ...d,
    payant: "pas retrouvée",
  });
  if (stopped) break;
}
write(mode === "rejeu" ? "trou-rejeu" : "trou-direct", out, {
  mode: mode === "rejeu" ? `rejeu sans réseau (${pagesDir})` : "direct (du poste : ne dit pas ce que TikTok sert aux serveurs)",
  requêtesTikTok: requests,
  dansCeDossier: before + requests,
  budget,
  stopped,
  contrôles: live ? { lus: outControls.length, pages: tally(outControls, "page"), fauxParties: outControls.filter((o) => o.partie) } : "pas en rejeu",
  cas: { prévus: cases.length, mesurés: out.length },
  pageDeLaVidéo: tally(out, "page"),
  liste: tally(out, "liste"),
  décision: tally(out, "décision"),
  // Le verdict que radarUsage.measured rangerait (gapMeasure, le code livré) : trou-egal = la page aurait suffi.
  côteÀCôte: tally(out, "verdict"),
  appelsPayantsÉvitables: out.filter((o) => o.verdict === "trou-egal").length,
});
