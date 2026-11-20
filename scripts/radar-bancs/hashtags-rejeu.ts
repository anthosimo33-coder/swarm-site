/**
 * BANC DE REJEU — « absent » sous la garde du payé-vide (tri des hashtags, brique 3, revue du 20/11/2026).
 *
 * AUCUNE page TikTok : le robots.txt de TikTok interdit le site aux agents d'IA (20/11, 19 h 35). Le banc REJOUE les
 * pages déjà relevées par les bancs du 20/11 (scripts/radar-bancs/hashtags.ts à 18 h 44, 500 hashtags ; le banc côte à
 * côte de 19 h 34, 120 hashtags : leurs `rows.json`) contre l'instantané de prod du 20/11 17:14 UTC, avec le VRAI code
 * livré (radarNetworkMath : checkHashtag, tagGuardNote, passSkip, notePaidPage, notePaidPass, paidTags, noteTagCounts).
 *
 * Deux recherches de suite de chaque hashtag, la page relevée servie aux deux (un passage = PASSAGE hashtags, une garde
 * neuve par passage, dans l'ordre du relevé) :
 *  - A, la première (l'état de la prod : aucun radarApps.tagCounts) ; B, la suivante, une semaine après (la routine
 *    d'une app, sous TAG_ABSENT_TRUST_MS), avec ce que A a retenu ;
 *  - la règle d'avant (« absent » saute dès le premier 400) est la règle livrée à qui l'on dit « payé vide » à l'instant
 *    pour tout hashtag sans compteur : checkHashtag(…, { paid: 0, paidAt: now, now }) ;
 *  - depuis la 2e revue du 20/11, une page vide servie en 200 (compteur 0, liste vide) suit la règle « absent » ;
 *  - ce que rend la recherche payée de A : les vidéos connues en prod qui portent le hashtag et que la recherche du
 *    réseau de l'app a rangées (radarSignals.foundBy « réseau <App> » ou « ·fr ») ; aucune → on suppose 0 (l'hypothèse
 *    OPTIMISTE du gain : si ScrapeCreators rend des vidéos quelconques pour un hashtag inexistant, rien n'est jamais
 *    sauté ; c'est ce que la recherche payée dira sur les serveurs : tagCounts.absent, absentVideos, recheck) ;
 *  - le scénario du 13/11 : TikTok sert « absent » aux serveurs, durablement, pour 3 % de ce qui existe (67 profils sur
 *    2 210, en-tête de radarFreeMath) — tirés au hasard (SEED) parmi les hashtags relevés avec des vidéos, dont la
 *    recherche payée rend alors au moins une vidéo (ils en ont) : ce que chaque règle saute à A et à B.
 * Chiffres : hashtags, pages absentes, passes sautées (1 crédit au moins chacune), hashtags sautés sans que le payant
 * ait constaté le vide, et leur app (comptes trouvés en payant, vidéos connues qui portent le hashtag).
 *
 * Budget : 0 page TikTok, 0 appel payant (lecture de fichiers seulement).
 *
 * Relancer :
 *   npx esbuild scripts/radar-bancs/hashtags-rejeu.ts --bundle --platform=node --format=esm --outfile=<scratch>/rejeu.mjs
 *   node <scratch>/rejeu.mjs <dossier instantané prod> <dossier de sortie> <rows.json> [<rows.json> …]
 */
import { createReadStream, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline";
import {
  checkHashtag,
  networkFoundBy,
  networkPasses,
  notePaidPage,
  notePaidPass,
  noteTagCounts,
  paidTags,
  passSkip,
  tagGuardNote,
  tagGuardRead,
  tagGuardStart,
  tagRunStart,
  type AppRule,
  type TagCount,
  type TagGuard,
  type TagPast,
  type TagRun,
} from "../../convex/radar/radarNetworkMath";
import { tagEmbedUrl, type PageFetch } from "../../convex/radar/radarStoreMath";

const [snap, out, ...rowFiles] = process.argv.slice(2);
if (!snap || !out || rowFiles.length === 0) throw new Error("usage : rejeu.mjs <instantané> <sortie> <rows.json> [<rows.json> …]");
mkdirSync(out, { recursive: true });

/** Hashtags par passage (un passage de routine en cherche quelques dizaines, en-tête de TAG_PAGES_PER_RUN). */
const PASSAGE = 40;
/** Le scénario du 13/11 : part de ce qui existe servi « absent » aux serveurs (67 profils sur 2 210), et sa graine. */
const FALSE_ABSENT = 67 / 2_210;
const SEED = 20_261_113;
/** B, une semaine après A : la routine d'une app non concurrente. */
const WEEK = 7 * 86_400_000;

type Doc = Record<string, any>;
type Row = { app: string; tag: string; deep: boolean; searched: boolean; status: string; list?: { videos: number; items: { id: string; author: string }[] } };
const jsonl = (f: string): Doc[] => readFileSync(`${snap}/${f}`, "utf8").trim().split("\n").map((l) => JSON.parse(l));
const tagsOf = (caption: string): string[] => [...String(caption ?? "").matchAll(/#([\p{L}\p{N}_]+)/gu)].map((m) => m[1].toLowerCase());

// ─── La prod : les apps ; les vidéos connues (signaux, vidéos des comptes suivis) qui portent un hashtag ; et celles
// que la recherche du réseau de chaque app a rangées ──────────────────────────────────────────────────────────────
const appsBySlug = new Map(jsonl("radarApps.jsonl").map((a) => [a.slug as string, a]));
const ruleOf = (a: Doc): AppRule => ({ strong: a.strong, weak: a.weak, context: a.context, ...(a.not ? { not: a.not } : {}) });
const knownByAppTag = new Map<string, number>();
const knownAnyByTag = new Map<string, number>();
const appByFoundBy = new Map<string, string>();
for (const a of appsBySlug.values()) {
  appByFoundBy.set(networkFoundBy(a.name, null), a.slug);
  appByFoundBy.set(networkFoundBy(a.name, "FR"), a.slug);
}
for (const s of jsonl("radarSignals.jsonl")) {
  const tags = new Set(tagsOf(s.caption));
  for (const t of tags) knownAnyByTag.set(t, (knownAnyByTag.get(t) ?? 0) + 1);
  for (const f of new Set((s.foundBy ?? []) as string[])) {
    const slug = appByFoundBy.get(f);
    if (!slug) continue;
    for (const t of tags) knownByAppTag.set(`${slug} ${t}`, (knownByAppTag.get(`${slug} ${t}`) ?? 0) + 1);
  }
}
for await (const line of createInterface({ input: createReadStream(`${snap}/radarTrackedVideos.jsonl`) })) {
  if (!line.includes("#")) continue;
  for (const t of new Set(tagsOf(JSON.parse(line).caption))) knownAnyByTag.set(t, (knownAnyByTag.get(t) ?? 0) + 1);
}

// ─── Les pages relevées, servies telles quelles ───────────────────────────────────────────────────────────────────
/** La page d'intégration d'un hashtag, refaite de son relevé (compteur, vidéos listées ; les légendes n'y sont pas). */
const embedPage = (tag: string, l: NonNullable<Row["list"]>) =>
  `<script id="__FRONTITY_CONNECT_STATE__">${JSON.stringify({
    source: { data: { [`/embed/tag/${tag}`]: { videoList: l.items.map((i) => ({ id: i.id, desc: "", authorUniqueId: i.author, playCount: 0 })), embedInfo: { videoCount: String(l.videos), statusCode: 0, code: 200 } } } },
  })}</script>`;
const pageOf = (r: Row): PageFetch =>
  r.status === "absent" ? { kind: "absent" } : r.status === "ok" && r.list ? { kind: "ok", text: embedPage(r.tag, r.list) } : { kind: "suspect", reason: r.status };

let seed = SEED;
const rnd = () => (seed = (Math.imul(seed, 1103515245) + 12345) >>> 0) / 2 ** 32;

type Rule = "avant" | "livrée";
type Search = { rule: Rule; tag: string; why: string; pay: boolean; spared: number; counts?: TagCount[] };

/**
 * Une recherche de chacun des hashtags d'un passage, comme runNetworkSearch : la garde, la page, ses passes sautées ou
 * payées (`returned` vidéos rendues par passe payée), puis ce que l'app retient (finishNetworkSearch → noteTagCounts).
 */
async function passage(rule: Rule, rows: Row[], page: (r: Row) => PageFetch, past: Map<string, TagCount[] | undefined>, returned: (r: Row) => number, now: number): Promise<Search[]> {
  let guard: TagGuard = tagGuardStart();
  const res: Search[] = [];
  for (const r of rows) {
    const app = appsBySlug.get(r.app);
    // Ses passes telles que l'app les cherche (la casse de sa recherche), sinon celles d'un « #tag » seul.
    const own = app ? networkPasses(app.searches, r.deep).filter((p) => p.kind === "hashtag" && p.value.toLowerCase() === r.tag) : [];
    const searches: string[] = own.length ? app!.searches : [`#${r.tag}`];
    const passes = own.length ? own : networkPasses(searches, r.deep);
    const key = passes[0].value;
    const prev = past.get(r.tag);
    const rec = prev?.find((t) => t.tag === key);
    // La règle d'avant : tout hashtag sans compteur était tenu pour payé vide.
    const o: TagPast = { deep: r.deep, last: rec?.videos, paid: rule === "avant" ? 0 : rec?.paid, paidAt: rule === "avant" ? now : rec?.at, now };
    const run: TagRun = tagRunStart(passes.length);
    if (tagGuardRead(guard, 0, 1)) {
      const io = { page: async (url: string): Promise<PageFetch> => (url === tagEmbedUrl(key) ? page(r) : { kind: "suspect", reason: "pas relevée" }) };
      const noted = tagGuardNote(guard, await checkHashtag(key, app ? ruleOf(app) : { strong: [r.tag] }, o, io));
      guard = noted.guard;
      run.check = noted.check;
    }
    const runs = new Map([[key, run]]);
    let spared = 0;
    for (const p of passes) {
      if (passSkip(p, runs)) {
        spared++;
        continue;
      }
      const n = returned(r);
      notePaidPage(run, { attached: 0, signals: 0, updated: 0 }, Array.from({ length: n }, (_, k) => ({ videoId: `${k}`, authorHandle: "", caption: "" })), { strong: [] });
      notePaidPass(run, { stopped: false, failed: false });
    }
    const paid = paidTags(runs);
    res.push({ rule, tag: r.tag, why: run.check?.why ?? "garde", pay: run.check?.pay ?? true, spared, counts: paid.length ? noteTagCounts(prev, paid, searches, now) : prev });
  }
  return res;
}

async function twoSearches(rule: Rule, rows: Row[], page: (r: Row) => PageFetch, returned: (r: Row) => number) {
  const chunks = Array.from({ length: Math.ceil(rows.length / PASSAGE) }, (_, i) => rows.slice(i * PASSAGE, (i + 1) * PASSAGE));
  const a: Search[] = [];
  for (const c of chunks) a.push(...(await passage(rule, c, page, new Map(), returned, 0)));
  const past = new Map(a.map((s) => [s.tag, s.counts]));
  const b: Search[] = [];
  for (const c of chunks) b.push(...(await passage(rule, c, page, past, returned, WEEK)));
  return { a, b };
}

const count = <T>(xs: readonly T[], key: (x: T) => string) => xs.reduce<Record<string, number>>((m, x) => ((m[key(x)] = (m[key(x)] ?? 0) + 1), m), {});
const spared = (xs: Search[]) => xs.reduce((n, s) => n + s.spared, 0);
const report: Record<string, unknown> = { pagesTikTok: 0, passage: PASSAGE };
for (const file of rowFiles) {
  const rows: Row[] = JSON.parse(readFileSync(file, "utf8"));
  // Ce que la recherche payée rend : le plancher connu en prod (vidéos qui portent le hashtag rangées par le réseau de l'app).
  const paidFloor = (r: Row) => knownByAppTag.get(`${r.app} ${r.tag}`) ?? 0;
  const absent = rows.filter((r) => r.status === "absent");
  const sides: Record<string, unknown> = {};
  for (const rule of ["avant", "livrée"] as const) {
    const { a, b } = await twoSearches(rule, rows, pageOf, paidFloor);
    const nothing = (r: Row | undefined) => r !== undefined && (r.status === "absent" || (r.status === "ok" && r.list?.videos === 0 && r.list.items.length === 0));
    const unconfirmedSkips = a.filter((s) => !s.pay && nothing(rows.find((r) => r.tag === s.tag)));
    sides[rule] = {
      A: { decisions: count(a, (s) => s.why), skipped: a.filter((s) => !s.pay).length, passesSpared: spared(a) },
      B: { decisions: count(b, (s) => s.why), skipped: b.filter((s) => !s.pay).length, passesSpared: spared(b) },
      // Sautés sans que le payant ait jamais constaté le vide (A : aucune recherche payée n'est retenue en prod).
      skippedUnpaid: unconfirmedSkips.map((s) => {
        const r = rows.find((x) => x.tag === s.tag)!;
        const app = appsBySlug.get(r.app);
        return { tag: s.tag, app: r.app, searched: r.searched, trackedCount: app?.trackedCount ?? 0, searches: app?.searches, carryingKnown: knownAnyByTag.get(s.tag) ?? 0 };
      }),
    };
  }
  // Le scénario du 13/11 : des hashtags qui ont des vidéos, servis « absent » durablement aux serveurs.
  seed = SEED;
  const existing = rows.filter((r) => r.status === "ok" && (r.list?.videos ?? 0) > 0);
  const lying = new Set(existing.filter(() => rnd() < FALSE_ABSENT).map((r) => r.tag));
  const lie = (r: Row): PageFetch => (lying.has(r.tag) ? { kind: "absent" } : pageOf(r));
  const has = (r: Row) => (lying.has(r.tag) ? Math.max(1, paidFloor(r)) : paidFloor(r));
  const scenario: Record<string, unknown> = { falseAbsent: [...lying] };
  for (const rule of ["avant", "livrée"] as const) {
    const { a, b } = await twoSearches(rule, rows, lie, has);
    scenario[rule] = { lostA: a.filter((s) => lying.has(s.tag) && !s.pay).map((s) => s.tag), lostB: b.filter((s) => lying.has(s.tag) && !s.pay).map((s) => s.tag), whyB: count(b.filter((s) => lying.has(s.tag)), (s) => s.why) };
  }
  report[file.split("/").slice(-2, -1)[0] ?? file] = {
    hashtags: rows.length,
    absentPages: absent.length,
    emptyPages200: rows.filter((r) => r.status === "ok" && r.list?.videos === 0 && r.list.items.length === 0).length,
    absentSearched: absent.filter((r) => r.searched).length,
    absentCarryingKnown: absent.reduce((n, r) => n + (knownAnyByTag.get(r.tag) ?? 0), 0),
    absentPaidFloor: absent.reduce((n, r) => n + paidFloor(r), 0),
    ...sides,
    scenario1311: scenario,
  };
}
writeFileSync(`${out}/rejeu.json`, JSON.stringify(report, null, 1));
console.log(JSON.stringify(report, null, 1));
