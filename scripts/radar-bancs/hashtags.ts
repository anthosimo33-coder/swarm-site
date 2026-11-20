/**
 * BANC — le tri des hashtags avant la recherche payante (brique 3, 20/11/2026).
 *
 * Ce qu'il mesure, sur des hashtags réels des apps actives (instantané de prod), avec le VRAI code livré
 * (radarNetworkMath.checkHashtag, radarStoreMath.parseTagList, radarFreeMath.parseFreeVideo) :
 *  - la décision de chaque hashtag (absent, complet, trop grand, page refusée, page vidéo qui manque) ;
 *  - absent : aucune vidéo connue en prod ne porte le hashtag, et une relecture le redit absent ;
 *  - complet : toute vidéo connue en prod qui porte le hashtag est dans la page — sinon sa page vidéo est lue
 *    (retirée → normal ; en ligne → la page n'avait PAS toutes les vidéos, la recherche payante l'aurait rendue) ;
 *  - la citation de l'app jugée sur la légende de la page du hashtag = jugée sur la légende connue en prod ;
 *  - les vidéos lues sur leur page vs les signaux de prod (légende, langue, vues, abonnés) ;
 *  - la règle « compteur inchangé » : seulement une estimation (compteurs du contrôle des classements, jours avant).
 * Une mesure du poste ne dit pas ce que TikTok sert aux serveurs Convex (13/11) : radarUsage.saved le dira.
 *
 * Budget de pages (une à la fois, pause storePauseMs avant chacune, arrêt à STORE_BREAKER refus d'affilée) :
 *   --tags 500 pages de hashtag · --videos 300 pages vidéo · --reread 100 relectures des absents.
 *
 * Résultat du 20/11/2026 (586 pages, aucun refus) : 28 absents, 20 complets, 452 trop grands ; cf l'en-tête de
 * radarNetworkMath.TAG_ROUTINE_SKIP.
 *
 * Relancer :
 *   npx esbuild scripts/radar-bancs/hashtags.ts --bundle --platform=node --format=esm --outfile=<scratch>/hashtags.mjs
 *   node <scratch>/hashtags.mjs <dossier instantané prod> <dossier de sortie> [--tags 500] [--videos 300] [--reread 100]
 */
import { createReadStream, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline";
import { checkHashtag, citesApp, needsDeepSearch, normalize, searchKind, type AppRule, type TagCheck } from "../../convex/radar/radarNetworkMath";
import { freeVideoUrl, parseFreeVideo } from "../../convex/radar/radarFreeMath";
import { STORE_BREAKER, fetchEmbedPage, parseTagList, storePauseMs, tagEmbedUrl, type PageFetch, type TagList } from "../../convex/radar/radarStoreMath";

const [snap, out] = process.argv.slice(2);
if (!snap || !out) throw new Error("usage : hashtags.mjs <instantané> <sortie> [--tags N] [--videos N] [--reread N]");
const arg = (name: string, def: number) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 ? Number(process.argv[i + 1]) : def;
};
const BUDGET = { tag: arg("tags", 500), video: arg("videos", 300), reread: arg("reread", 100) };
mkdirSync(out, { recursive: true });

type Doc = Record<string, any>;
const jsonl = (f: string): Doc[] => readFileSync(`${snap}/${f}`, "utf8").trim().split("\n").map((l) => JSON.parse(l));
const sleep = (ms: number) => new Promise<void>((done) => setTimeout(done, ms));
const tagsOf = (caption: string): string[] => [...caption.matchAll(/#([\p{L}\p{N}_]+)/gu)].map((m) => m[1].toLowerCase());

// ─── L'échantillon : les hashtags des apps actives, d'abord celles déjà cherchées en payant ───────────────────────
const apps = jsonl("radarApps.jsonl").filter((a) => a.status === "active");
let seed = 20261120;
const rnd = () => ((seed = (Math.imul(seed, 1103515245) + 12345) >>> 0) / 2 ** 32);
const shuffled = (xs: Doc[]) => xs.map((x) => [rnd(), x] as const).sort((a, b) => a[0] - b[0]).map((p) => p[1]);
const ordered = [...shuffled(apps.filter((a) => a.networkSearchedAt !== undefined)), ...shuffled(apps.filter((a) => a.networkSearchedAt === undefined))];
type Case = { app: Doc; rule: AppRule; tag: string };
const cases: Case[] = [];
for (const app of ordered) {
  for (const s of app.searches as string[]) {
    const k = searchKind(s);
    if (k.kind !== "hashtag" || cases.some((c) => c.tag === k.value.toLowerCase())) continue;
    cases.push({ app, rule: { strong: app.strong, weak: app.weak, context: app.context, ...(app.not ? { not: app.not } : {}) }, tag: k.value.toLowerCase() });
  }
}
const sample = cases.slice(0, BUDGET.tag);
const sampleTags = new Set(sample.map((c) => c.tag));

// ─── Ce que la prod sait de ces hashtags : vidéos dont la légende les porte, signaux, comptes suivis ─────────────
type Known = { videoId: string; handle: string; caption: string; publishedAt: number; src: "signal" | "suivie" };
const byTag = new Map<string, Map<string, Known>>();
const note = (k: Known) => {
  for (const t of tagsOf(k.caption)) {
    if (!sampleTags.has(t)) continue;
    const m = byTag.get(t) ?? new Map<string, Known>();
    if (!m.has(k.videoId)) m.set(k.videoId, k);
    byTag.set(t, m);
  }
};
const signals = new Map<string, Doc>();
for (const s of jsonl("radarSignals.jsonl")) {
  if (s.platform !== "tiktok") continue;
  signals.set(s.videoId, s);
  note({ videoId: s.videoId, handle: s.authorHandle, caption: s.caption, publishedAt: s.publishedAt, src: "signal" });
}
const tracked = jsonl("radarTracked.jsonl").filter((t) => t.platform === "tiktok");
const trackedById = new Map(tracked.map((t) => [t._id, t]));
const trackedByHandle = new Map(tracked.map((t) => [String(t.handle).toLowerCase(), t]));
const trackedVideos = new Map<string, { caption: string; handle: string }>();
for await (const line of createInterface({ input: createReadStream(`${snap}/radarTrackedVideos.jsonl`) })) {
  if (!line.includes("#")) continue;
  const v = JSON.parse(line);
  const acc = trackedById.get(v.accountId);
  if (!acc || v.platform === "instagram" || typeof v.caption !== "string") continue;
  trackedVideos.set(v.videoId, { caption: v.caption, handle: acc.handle });
  note({ videoId: v.videoId, handle: acc.handle, caption: v.caption, publishedAt: v.publishedAt, src: "suivie" });
}
const storeCount = new Map<string, { videos: number; at: number }>();
for (const s of jsonl("radarStoreApps.jsonl")) if (s.tag && s.tagVideos !== undefined) storeCount.set(String(s.tag).toLowerCase(), { videos: s.tagVideos, at: s.checkedAt });
console.log(`échantillon : ${sample.length} hashtags (${sample.filter((c) => c.app.networkSearchedAt !== undefined).length} d'apps déjà cherchées en payant)`);

// ─── Les pages, bornées ───────────────────────────────────────────────────────────────────────────────────────────
const used = { tag: 0, video: 0, reread: 0 };
let streak = 0;
let stopped: string | null = null;
async function page(url: string, kind: keyof typeof used): Promise<PageFetch> {
  if (stopped || used[kind] >= BUDGET[kind]) return { kind: "suspect", reason: "budget" };
  await sleep(storePauseMs(Math.random()));
  used[kind]++;
  const r = await fetchEmbedPage(url);
  streak = r.kind === "suspect" ? streak + 1 : 0;
  if (r.kind === "suspect" && streak >= STORE_BREAKER) stopped = r.reason;
  return r;
}

type Row = {
  app: string;
  tag: string;
  deep: boolean;
  searched: boolean;
  status: PageFetch["kind"] | "budget";
  list?: { videos: number; items: { id: string; author: string; private: boolean; cites: boolean }[] };
  check: Omit<TagCheck, "videos" | "read"> & { videos: { videoId: string; handle: string; lang: string; views: number; fans: number; caption: string }[] };
  budgetHit: boolean;
  store?: { videos: number; at: number };
};
const rows: Row[] = [];
const citeChecks: { tag: string; id: string; embed: boolean; prod: boolean; same: boolean }[] = [];
for (const c of sample) {
  if (stopped) break;
  let list: TagList | null = null;
  let status: Row["status"] = "budget";
  let budgetHit = false;
  const check = await checkHashtag(c.tag, c.rule, { deep: needsDeepSearch(c.app) }, async (url) => {
    const isTag = url === tagEmbedUrl(c.tag);
    const r = await page(url, isTag ? "tag" : "video");
    if (r.kind === "suspect" && r.reason === "budget") budgetHit = true;
    if (isTag) {
      status = r.kind === "suspect" && r.reason === "budget" ? "budget" : r.kind;
      if (r.kind === "ok") list = parseTagList(r.text);
    }
    return r;
  });
  if (status === "budget") break;
  const l = list as TagList | null;
  rows.push({
    app: c.app.slug,
    tag: c.tag,
    deep: needsDeepSearch(c.app),
    searched: c.app.networkSearchedAt !== undefined,
    status,
    ...(l ? { list: { videos: l.videos, items: l.items.map((i) => ({ id: i.id, author: i.author, private: i.private, cites: citesApp(i.desc, i.author, c.rule) })) } } : {}),
    check: {
      pay: check.pay,
      why: check.why,
      same: check.same,
      pages: check.pages,
      refused: check.refused,
      ...(check.count !== undefined ? { count: check.count } : {}),
      videos: check.videos.map((v) => ({ videoId: v.videoId, handle: v.authorHandle, lang: v.lang, views: v.views, fans: v.authorFans, caption: v.caption })),
    },
    budgetHit,
    ...(storeCount.has(c.tag) ? { store: storeCount.get(c.tag) } : {}),
  });
  // La citation jugée sur la légende de la page du hashtag, et sur la légende connue en prod de la même vidéo.
  if (l) {
    for (const i of l.items) {
      const prodCaption = signals.get(i.id)?.caption ?? trackedVideos.get(i.id)?.caption;
      if (prodCaption === undefined) continue;
      citeChecks.push({ tag: c.tag, id: i.id, embed: citesApp(i.desc, i.author, c.rule), prod: citesApp(prodCaption, i.author, c.rule), same: normalize(i.desc).compact === normalize(prodCaption).compact });
    }
  }
  if (rows.length % 50 === 0) console.log(`… ${rows.length} hashtags, pages ${JSON.stringify(used)}`);
}

// ─── Complet : les vidéos connues en prod qui portent le hashtag sont-elles toutes dans la page ? ────────────────
const missing: { tag: string; app: string; videoId: string; handle: string; publishedAt: number; src: string; page: string }[] = [];
for (const r of rows.filter((x) => x.check.why === "complete" || (x.check.why === "video" && !x.budgetHit))) {
  const listed = new Set(r.list?.items.map((i) => i.id));
  for (const k of byTag.get(r.tag)?.values() ?? []) {
    if (listed.has(k.videoId)) continue;
    const p = await page(freeVideoUrl(k.handle, k.videoId), "video");
    const v = p.kind === "ok" ? parseFreeVideo(p.text, k.handle) : null;
    const state = p.kind === "suspect" ? `non lue (${p.reason})` : p.kind === "absent" || v === "gone" ? "retirée" : v ? (tagsOf(v.caption).includes(r.tag) ? "en ligne, porte le hashtag" : "en ligne, légende changée") : "illisible";
    missing.push({ tag: r.tag, app: r.app, videoId: k.videoId, handle: k.handle, publishedAt: k.publishedAt, src: k.src, page: state });
  }
}

// ─── Absent : aucune vidéo connue ne porte le hashtag ; relu, il reste absent ─────────────────────────────────────
const absentRows = rows.filter((r) => r.check.why === "absent");
const absentKnown = absentRows.flatMap((r) => [...(byTag.get(r.tag)?.values() ?? [])].map((k) => ({ tag: r.tag, ...k })));
const reread: Record<string, number> = {};
for (const r of absentRows) {
  const p = await page(tagEmbedUrl(r.tag), "reread");
  if (p.kind === "suspect" && p.reason === "budget") break;
  reread[p.kind] = (reread[p.kind] ?? 0) + 1;
}

// ─── Les vidéos lues sur leur page vs les signaux de prod ─────────────────────────────────────────────────────────
const vs = { read: 0, inProd: 0, captionSame: 0, langSame: 0, viewsNotBehind: 0, authorTracked: 0, authorNew: 0, signalNew: 0, diffs: [] as unknown[] };
for (const r of rows.filter((x) => x.check.why === "complete")) {
  for (const v of r.check.videos) {
    vs.read++;
    if (trackedByHandle.has(v.handle.toLowerCase())) vs.authorTracked++;
    else vs.authorNew++;
    const s = signals.get(v.videoId);
    if (!s) {
      vs.signalNew++;
      continue;
    }
    vs.inProd++;
    const capSame = normalize(s.caption).compact === normalize(v.caption).compact;
    if (capSame) vs.captionSame++;
    if (s.lang === v.lang) vs.langSame++;
    if (v.views >= s.views) vs.viewsNotBehind++;
    if (!capSame || s.lang !== v.lang || v.views < s.views) vs.diffs.push({ tag: r.tag, videoId: v.videoId, lang: [s.lang, v.lang], views: [s.views, v.views], caption: capSame ? "=" : [s.caption, v.caption] });
  }
}

// ─── Synthèse ─────────────────────────────────────────────────────────────────────────────────────────────────────
const count = <T>(xs: readonly T[], key: (x: T) => string) => xs.reduce<Record<string, number>>((m, x) => ((m[key(x)] = (m[key(x)] ?? 0) + 1), m), {});
const skipped = rows.filter((r) => !r.check.pay);
const fallbackVideo = rows.filter((r) => r.check.why === "video");
const sizes = count(rows.filter((r) => r.list), (r) => {
  const n = r.list!.videos;
  return n === 0 ? "0" : n <= 10 ? "1-10" : n <= 50 ? "11-50" : n <= 500 ? "51-500" : ">500";
});
const storeSame = rows.filter((r) => r.store && r.check.count !== undefined);
const summary = {
  pages: used,
  stopped,
  hashtags: rows.length,
  decisions: count(rows, (r) => r.check.why),
  decisionsSearched: count(rows.filter((r) => r.searched), (r) => r.check.why),
  sizes,
  skipped: skipped.length,
  creditsAvoidedPerSearch: skipped.length * 2,
  completeWithCiting: rows.filter((r) => r.check.why === "complete" && r.check.videos.length > 0).length,
  videoPagesForComplete: rows.filter((r) => r.check.why === "complete").reduce((s, r) => s + r.check.pages - 1, 0),
  fallbackVideo: fallbackVideo.map((r) => ({ tag: r.tag, budgetHit: r.budgetHit, refused: r.check.refused })),
  absent: { tags: absentRows.length, knownVideosCarryingTag: absentKnown.length, examples: absentKnown.slice(0, 10), reread },
  complete: { tags: rows.filter((r) => r.check.why === "complete").length, prodVideosNotListed: count(missing, (m) => m.page), missing },
  citation: { compared: citeChecks.length, differs: citeChecks.filter((x) => x.embed !== x.prod), captionSame: citeChecks.filter((x) => x.same).length },
  videos: vs,
  sameRuleEstimate: {
    tagsWithStoreCount: storeSame.length,
    unchanged: storeSame.filter((r) => r.check.count === r.store!.videos).length,
    medianDaysSince: storeSame.map((r) => (Date.now() - r.store!.at) / 86_400_000).sort((a, b) => a - b)[Math.floor(storeSame.length / 2)] ?? null,
  },
};
writeFileSync(`${out}/rows.json`, JSON.stringify(rows, null, 1));
writeFileSync(`${out}/summary.json`, JSON.stringify(summary, null, 1));
console.log(JSON.stringify({ ...summary, complete: { ...summary.complete, missing: summary.complete.missing.slice(0, 10) }, videos: { ...vs, diffs: vs.diffs.slice(0, 10) } }, null, 1));
