/**
 * BANC — le trou vérifié sur la page de la vidéo (brique 4, revue du 20/11/2026). EN MESURE (GAP_FREE_CHECK = false).
 *
 * PAS LANCÉ EN DIRECT PAR UN AGENT. Le robots.txt de TikTok interdit tout le site aux agents IA (anthropic-ai,
 * ClaudeBot, Claude-User ; règle de la session du 20/11, 19 h 35) : aucun agent n'envoie de requête à TikTok, ni par
 * ce script. La mesure en direct, c'est le fondateur qui la lance, s'il le décide. Les agents n'en lancent que les modes
 * sans réseau (`--sec`, `--rejouer`), où `fetch` est remplacé par une fonction qui lève.
 *
 * LA MESURE EN DIRECT (le fondateur) : les 301 comptes `gapChecked` de l'instantané — le relevé PAYANT de leur trou est
 * passé avant la date de leur dernière vidéo connue sans la voir : « pas retrouvée ». Pour chacun, DEUX pages, comme la
 * voie gratuite les demande (fetchEmbedPage, sans en-têtes de navigateur ; `retrying(paced(...))`) :
 *  - la page d'intégration du compte (`/embed/@pseudo`) : la condition « la liste remonte » (listReaches) ;
 *  - la page de la vidéo (`/@pseudo/video/<id>`) : ce que TikTok en dit (gapGone).
 * Puis la décision de la brique, par le code livré : freeRead sur ces deux pages relues sans réseau (vidéo la plus
 * récente = la vidéo gapChecked, vidéos connues = radarTrackedVideos du compte), côte à côte avec la conclusion payante.
 * Il rend : vidéos que la page dit supprimées ou privées (10204), vivantes (servies), 10231 (hors région), autre code,
 * illisibles, refusées, absentes ; la liste (porte la vidéo, remonte, ne remonte pas) ; la décision (« sans payer » :
 * liste qui remonte ET page qui la dit partie ; sinon « payant ») ; l'accord avec le payant.
 * BUDGET : 650 REQUÊTES AU PLUS (`--pages N`, 650 par défaut et au plus), seconds essais compris (602 pour les 301
 * comptes sans refus) ; une page à la fois, pause storePauseMs (0,3 à 0,7 s) avant chacune ; arrêt à STORE_BREAKER (5)
 * réponses refusées d'affilée ; un compte n'est commencé que si ses deux pages et leurs seconds essais (4) tiennent dans
 * le reste. Chaque page lue est gardée (<sortie>/pages/) : `--rejouer` la relit sans réseau, avec le code du moment.
 * Contrôles, en option et à part (`--controles`, 100 requêtes au plus) : 40 vidéos vivantes (vues dans une liste dans les
 * 3 h avant le dernier relevé de l'instantané) et les 2 « photos » de C4 — la page ne doit pas les dire parties.
 *
 * Limites, à dire avec le résultat : une mesure du poste ne dit pas ce que TikTok sert aux serveurs Convex (vécu le
 * 13/11 : 31 profils sur 32 du poste, 0 sur 6 des serveurs) ; la liste lue aujourd'hui n'est pas celle du jour du trou
 * (le compte a pu publier depuis : « ne remonte pas » est alors pessimiste) ; une vidéo supprimée depuis le payant ne
 * dit rien de plus. La preuve qui décide la bascule reste celle des serveurs : radarUsage.measured (trou-egal, aucun
 * trou-ecart), cf radarFreeMath.gapMeasure.
 *
 * HORS LIGNE (`--sec`, ce que les agents lancent) : sur l'instantané seul — le nombre de gapChecked, leur rythme (jour
 * où leur vidéo a été vue pour la dernière fois), les crédits « trou » du 14 au 20/11 (radarUsage.reasons), la part des
 * trous dus à une suppression (plancher), « la liste remonte » rejouée par le code livré (listGap, listReaches) sur la
 * liste reconstituée à trois heures possibles du contrôle, et le plafond du gain si la bascule se fait. Et le plan de la
 * mesure en direct (cas, requêtes). 0 requête.
 *
 * Relancer (construction, puis un mode) :
 *   npx esbuild scripts/radar-bancs/trou.ts --bundle --platform=node --format=esm --outfile=<dossier>/trou.mjs
 *   node <dossier>/trou.mjs --sec <instantané> <sortie>                         # sans réseau
 *   node <dossier>/trou.mjs --rejouer <pages> <instantané> <sortie>             # sans réseau : pages gardées
 *   node <dossier>/trou.mjs <instantané> <sortie> [--pages 650]                 # EN DIRECT : le fondateur seul
 *   node <dossier>/trou.mjs --controles <instantané> <sortie> [--pages 100]     # EN DIRECT, option : le fondateur seul
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

/** Le budget de la mesure en direct (requêtes, seconds essais compris), et celui des contrôles. */
const MAX_REQUESTS = 650;
const MAX_CONTROL_REQUESTS = 100;
const HOUR = 3_600_000;
const DAY = 24 * HOUR;
/** La liste d'intégration d'un profil : 10 à 13 vidéos (13/11) ; 12 pour la reconstituer. */
const EMBED_LIST = 12;

const raw = process.argv.slice(2);
const flag = (name: string, dflt: number) => {
  const i = raw.indexOf(name);
  return i >= 0 ? Number(raw[i + 1]) : dflt;
};
const mode = raw.includes("--sec") ? "sec" : raw.includes("--rejouer") ? "rejeu" : raw.includes("--controles") ? "controles" : "direct";
const args = raw.filter((a, i) => !a.startsWith("--") && !["--pages", "--vivantes"].includes(raw[i - 1] ?? ""));
const [pagesDir, snap, outDir] = mode === "rejeu" ? args : [undefined, args[0], args[1]];
if (!snap || !outDir || (mode === "rejeu" && !pagesDir)) {
  console.error("usage : node trou.mjs [--sec | --controles] <instantané> <sortie> [--pages N]  |  node trou.mjs --rejouer <pages> <instantané> <sortie>");
  process.exit(1);
}
// Sans réseau : toute requête lève (garde-fou en plus de ne rien demander).
if (mode === "sec" || mode === "rejeu") {
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

// ─── L'instantané : les 301 comptes gapChecked, leurs vidéos ───────────────────

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
  if (mode === "controles" && active.has(v.accountId)) {
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

/** Ce que la page de la vidéo dit, en clair. */
function videoVerdict(r: FreePage | null, videoId: string): string {
  if (!r) return "non lue (budget ou arrêt)";
  if (!r.ok) return r.kind === "absent" ? "absente (400/404)" : `refusée (${r.reason ?? "?"})`;
  const p = parseTikTokPublicPage(r.text, videoId);
  if (p.kind === "stats") return "vivante (servie)";
  if (p.kind === "refused") {
    const label = refusalLabel(p.statusCode, p.statusMsg);
    if (p.statusCode === 10204) return label === "supprimé" ? "supprimée (10204)" : label === "visible par son autrice uniquement" ? "privée (10204, autrice seule)" : `10204 « ${label} »`;
    if (p.statusCode === 10231 || label === "bloqué hors de sa région par TikTok") return "hors région (10231)";
    return `autre code (${p.statusCode})`;
  }
  return `illisible (${p.reason})`;
}

/** La décision de la brique (freeRead, le code livré) sur les deux pages déjà lues, sans réseau. */
async function decide(c: Case, profile: FreePage | null, video: FreePage | null, now: number) {
  if (!profile) return { liste: "non lue", décision: "non mesurée" };
  const gapUrl = freeVideoUrl(c.handle, c.gap.videoId);
  const pages = new Map<string, FreePage>([[freeProfileUrl(c.handle), profile], [gapUrl, video ?? { ok: false, kind: "suspect", reason: "non lue" }]]);
  // Une page que la mesure n'a pas lue (une vidéo de la liste) : absente, sans réseau — après la décision du trou.
  const page = async (url: string): Promise<FreePage> => pages.get(url) ?? { ok: false, kind: "absent" };
  const known = async (ids: string[]): Promise<KnownVideo[]> => {
    const set = new Set(ids);
    return c.vids.filter((v) => set.has(v.videoId)).map((v) => ({ videoId: v.videoId, publishedAt: v.publishedAt }));
  };
  const f = await freeRead(c.handle, { page, known, newest: async () => ({ videoId: c.gap.videoId, publishedAt: c.gap.publishedAt }), gapPage: () => true }, now, undefined, false);
  if (f.ok) return { liste: "porte la vidéo (pas de trou)", décision: "pas de trou : relevé gratuit" };
  if (f.why !== "gap")
    return { liste: `profil : ${f.why}${f.reason ? ` (${f.reason})` : ""}`, décision: f.why === "suspect" ? "payant (profil refusé)" : "aucune (profil sans rien à lire : erreur de relevé)" };
  if (!f.seen) return { liste: "ne remonte pas", décision: "payant (la liste ne remonte pas)" };
  if (!video) return { liste: "remonte", décision: "non mesurée (page de la vidéo non lue)" };
  return { liste: "remonte", décision: f.seen.gone ? "sans payer (page : partie)" : "payant (page pas concluante)" };
}

function tally(rows: readonly Record<string, unknown>[], key: string): Record<string, number> {
  const o: Record<string, number> = {};
  for (const r of rows) o[String(r[key])] = (o[String(r[key])] ?? 0) + 1;
  return o;
}

// ─── Hors ligne : nombre, rythme, crédits, part des suppressions, la liste rejouée, le plafond ─────

if (mode === "sec") {
  type Usage = { day: string; poste: string; credits: number; calls: number; reasons?: Record<string, number> };
  const usage = jsonl<Usage>("radarUsage.jsonl").filter((u) => u.poste === "tiktok" && u.day >= "2026-11-14");
  const trou: Record<string, number> = {};
  for (const u of usage.sort((a, b) => a.day.localeCompare(b.day))) trou[u.day] = u.reasons?.trou ?? 0;
  const trouTotal = Object.values(trou).reduce((s, c) => s + c, 0);
  // Le jour où la vidéo a été vue pour la dernière fois dans une liste : le contrôle payant est venu au relevé suivant.
  const bySeen = tally(cases.map((c) => ({ d: day(c.gap.lastSeenAt) })), "d");
  const since14 = cases.filter((c) => day(c.gap.lastSeenAt) >= "2026-11-14").length;
  const days1619 = ["2026-11-16", "2026-11-17", "2026-11-18", "2026-11-19"].map((d) => bySeen[d] ?? 0);
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
      if (name.startsWith("vue + 24 h"))
        perCase.push({ handle: c.handle, video: c.gap.videoId, publiée: day(c.gap.publishedAt), vueDernièreFois: day(c.gap.lastSeenAt), plusRécentesAvantContrôle: c.vids.filter((v) => v.publishedAt > c.gap.publishedAt && v.publishedAt <= T).length, listeRemonte: ok, payant: "pas retrouvée" });
    }
    reach[name] = o;
  }
  // Le plafond, sur les 4 jours pleins du 16 au 19/11 : les contrôles « pas retrouvée » dont la liste remonte (vue + 24 h).
  const full = perCase.filter((o) => ["2026-11-16", "2026-11-17", "2026-11-18", "2026-11-19"].includes(String(o.vueDernièreFois)));
  const remonte24 = full.filter((o) => o.listeRemonte).length;
  const perDay = (n: number) => Math.round((n / 4) * 10) / 10;
  const plan = { cas: cases.length, requêtesSansRefus: 2 * cases.length, budget: MAX_REQUESTS, margePourSecondsEssais: MAX_REQUESTS - 2 * cases.length };
  write("trou-sec", perCase, {
    mode: "hors ligne (instantané du 20/11 17:14)",
    requêtesTikTok: 0,
    gapChecked: { comptes: gapAccounts.length, avecLeurVidéoRangée: cases.length, actifs: cases.filter((c) => c.status === "active").length },
    rythme: { vueDernièreFoisParJour: bySeen, du16au19: days1619, depuisLe14: since14 },
    créditsTrou14au20: { parJour: trou, total: trouTotal },
    partSuppressions: {
      plancher: `${since14} contrôles payants « pas retrouvée » depuis le 14/11 (au moins 1 crédit chacun) sur ${trouTotal} crédits trou : ${Math.round((100 * since14) / trouTotal)} % au moins`,
      pourquoiPlancher: "gapChecked ne garde que le DERNIER contrôle d'un compte ; un trou comblé page après page (la vidéo retrouvée) coûte 2 à 3 crédits",
    },
    listeRemonte: reach,
    plafondDuGain: {
      règle: "un contrôle « pas retrouvée » dont la liste remonte ET dont la page dit la vidéo partie = 1 relevé payant évité (sa première page, 9 vidéos, passe la date)",
      contrôlesParJour16au19: days1619,
      crédits: `${remonte24} contrôles sur ${full.length} du 16 au 19/11 (vue + 24 h) : ≤ ${perDay(remonte24)} crédits par jour, ${Math.round(perDay(remonte24) * 30 * SC_PRICE_PER_CREDIT * 100) / 100} $ par mois au plus ; tous les crédits trou du 14 au 20/11 : ${trouTotal} (${Math.round((trouTotal / 7) * 30 * SC_PRICE_PER_CREDIT * 100) / 100} $ par mois au rythme de la semaine)`,
      pagesEnMesure: "la page de la vidéo d'un trou dont la liste remonte : ~1 page par contrôle, quand un payant peut partir (gapPage)",
    },
    planDeLaMesureEnDirect: plan,
  });
  process.exit(0);
}

// ─── Les pages : lues (direct) ou relues (rejeu) ───────────────────────────────

const sleep = (ms: number) => new Promise<void>((done) => setTimeout(done, ms));
let requests = 0;
let refusedStreak = 0;
let stopped: string | null = null;
const lanePage = retrying(
  paced(
    async (url: string): Promise<FreePage> => {
      requests++;
      const r = await fetchEmbedPage(url);
      refusedStreak = r.kind === "suspect" ? refusedStreak + 1 : 0;
      return r.kind === "ok" ? { ok: true, text: r.text } : r.kind === "suspect" ? { ok: false, kind: "suspect", reason: r.reason } : { ok: false, kind: "absent" };
    },
    () => sleep(storePauseMs(Math.random())),
  ),
  () => sleep(FREE_RETRY_MS),
);
const keep = mode === "rejeu" ? pagesDir! : join(outDir, "pages");
mkdirSync(keep, { recursive: true });
const saved = (name: string): FreePage | null => (existsSync(join(keep, name)) ? { ok: true, text: readFileSync(join(keep, name), "utf8") } : null);

if (mode === "controles") {
  // Les vivantes (vues dans une liste dans les 3 h avant le dernier relevé de l'instantané) et les photos de C4 :
  // la page de la vidéo, seule ; gapGone doit être faux.
  type Trial = { handle: string; free?: { list?: { videoId: string }[] }; paid?: { videoId: string }[] };
  const photos: { set: string; handle: string; videoId: string }[] = [];
  for (const t of jsonl<Trial>("radarFirstReadTrials.jsonl")) {
    const listed = new Set((t.free?.list ?? []).map((v) => v.videoId));
    if (!listed.size) continue;
    for (const v of t.paid ?? []) if (!listed.has(v.videoId)) photos.push({ set: "photo", handle: t.handle, videoId: v.videoId });
  }
  const fresh = [...newestByAccount.values()].filter((v) => v.lastSeenAt >= lastSeen - 3 * HOUR);
  const want = flag("--vivantes", 40);
  const step = Math.max(1, Math.floor(fresh.length / Math.max(1, want)));
  const vivantes = fresh
    .filter((_, i) => i % step === 0)
    .slice(0, want)
    .map((v) => ({ set: "vivante", handle: active.get(v.accountId)!, videoId: v.videoId }));
  const budget = Math.min(MAX_CONTROL_REQUESTS, flag("--pages", MAX_CONTROL_REQUESTS));
  const out: Record<string, unknown>[] = [];
  for (const c of [...photos, ...vivantes]) {
    if (requests + 2 > budget) {
      stopped = `budget de ${budget} requêtes`;
      break;
    }
    if (refusedStreak >= STORE_BREAKER) {
      stopped = `${STORE_BREAKER} réponses refusées d'affilée`;
      break;
    }
    const r = await lanePage(freeVideoUrl(c.handle, c.videoId));
    if (r.ok) writeFileSync(join(keep, `controle-${c.videoId}.html`), r.text);
    out.push({ ...c, page: videoVerdict(r, c.videoId), partie: r.ok && gapGone(r.text, c.videoId) });
  }
  write("trou-controles", out, { mode: "contrôles en direct", requêtesTikTok: requests, budget, stopped, parJeu: tally(out, "set"), pages: tally(out, "page"), fauxParties: out.filter((o) => o.partie) });
  process.exit(0);
}

// Direct : deux pages par compte, dans l'ordre de l'instantané ; rejeu : les pages gardées, sans réseau.
const budget = Math.min(MAX_REQUESTS, flag("--pages", MAX_REQUESTS));
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
      stopped = `budget de ${budget} requêtes`;
      break;
    }
    if (refusedStreak >= STORE_BREAKER) {
      stopped = `${STORE_BREAKER} réponses refusées d'affilée`;
      break;
    }
    profile = await lanePage(freeProfileUrl(c.handle));
    if (profile.ok) writeFileSync(join(keep, `profil-${c.handle}.html`), profile.text);
    if (refusedStreak >= STORE_BREAKER) {
      stopped = `${STORE_BREAKER} réponses refusées d'affilée`;
      out.push({ handle: c.handle, video: c.gap.videoId, page: videoVerdict(null, c.gap.videoId), ...(await decide(c, profile, null, now)), payant: "pas retrouvée" });
      break;
    }
    video = await lanePage(freeVideoUrl(c.handle, c.gap.videoId));
    if (video.ok) writeFileSync(join(keep, `video-${c.gap.videoId}.html`), video.text);
  }
  const d = await decide(c, profile, video, now);
  out.push({
    handle: c.handle,
    video: c.gap.videoId,
    publiée: day(c.gap.publishedAt),
    vueDernièreFois: day(c.gap.lastSeenAt),
    page: videoVerdict(video, c.gap.videoId),
    partie: !!video?.ok && gapGone(video.text, c.gap.videoId),
    ...d,
    payant: "pas retrouvée",
  });
}
const accord = (o: Record<string, unknown>) =>
  String(o.décision).startsWith("sans payer") ? "accord : la page aurait suffi" : String(o.page).startsWith("vivante") ? "désaccord : page servie, payant pas retrouvée" : "payant d'abord : économie manquée";
write(mode === "rejeu" ? "trou-rejeu" : "trou-direct", out, {
  mode: mode === "rejeu" ? `rejeu sans réseau (${pagesDir})` : "direct (du poste : ne dit pas ce que TikTok sert aux serveurs)",
  requêtesTikTok: requests,
  budget: mode === "rejeu" ? 0 : budget,
  stopped,
  cas: { prévus: cases.length, mesurés: out.length },
  pageDeLaVidéo: tally(out, "page"),
  liste: tally(out, "liste"),
  décision: tally(out, "décision"),
  côteÀCôte: tally(out.map((o) => ({ a: accord(o) })), "a"),
  appelsPayantsÉvitables: out.filter((o) => String(o.décision).startsWith("sans payer")).length,
});
