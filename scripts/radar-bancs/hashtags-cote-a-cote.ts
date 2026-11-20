/**
 * BANC CÔTE À CÔTE, HORS LIGNE — le tri des hashtags CORRIGÉ (brique 3 : « absent » ne dispense de payer qu'après une
 * recherche payée vide) contre ce que la recherche PAYÉE a réellement rendu en prod (20/11/2026).
 *
 * AUCUNE requête TikTok (le robots.txt de TikTok interdit le site aux agents d'IA, 20/11 19 h 35) ni ScrapeCreators :
 * ce script n'importe aucune fonction qui lit le réseau. Il REJOUE les pages de hashtag déjà relevées le 20/11 — le banc
 * hashtags.ts de 18 h 44 (500 hashtags) et la version en ligne de ce banc à 19 h 34 (120 hashtags, 146 pages ; elle
 * jugeait avec la règle d'avant et n'est pas commitée) : leurs `rows.json`, et les relectures de vidéos de leurs
 * `summary.json` (`--relus`) — contre l'instantané de prod du 20/11 17:14 UTC, avec le VRAI code livré
 * (radarNetworkMath : checkHashtag, hashtagGate, tagGuardRead/Note, passSkip, notePaidPage/Pass, paidTags, noteTagCounts,
 * networkPasses, networkRefreshMs, networkQueueOrder ; radarSignalsMath : normalizeBudget, budgetState, allowance,
 * catchUpAllowance, recentPerDay, tierDefers).
 *
 * Ce qu'il met côte à côte :
 *  1. ABSENT (actif sous la garde du payé-vide) : pour chaque hashtag lu absent, ce que le payant a rendu avec ce hashtag
 *     EXACT — signaux radarSignals dont foundBy porte « réseau <App> » ou « réseau <App>·fr » et dont la légende porte
 *     #tag (un #tagapp ou un #tagai n'est pas #tag : les hashtags voisins sont listés à part), comptes radarTracked de
 *     l'app rattachés sur une légende (matchedBy caption) dont une vidéo connue publiée avant leur entrée porte #tag —
 *     et ce que le réseau payé de l'app a trouvé par ses MOTS-CLÉS (un mot-clé homonyme, « dawcade » à côté de
 *     « #dawcade », n'est jamais sauté : passSkip) ; puis la décision rejouée sur deux recherches de suite (la
 *     première : l'état de la prod, aucun radarApps.tagCounts ; la suivante : ce que la première a retenu) ;
 *  2. COMPLET (en mesure, TAG_COMPLETE_SKIP) : ce que la règle active aurait rangé (les vidéos de la liste qui citent
 *     l'app) contre ce que le payant a rendu avec #tag hors de la liste — compte perdu, signal perdu (auteur gardé par
 *     une autre vidéo de la liste), ou trouvable par un mot-clé de l'app ;
 *  3. SAME (en mesure, TAG_ROUTINE_SKIP) : ce que les recherches de routine de la prod ont trouvé de NEUF avec #tag, et
 *     si c'était déjà en ligne à la recherche payée d'avant (le compteur a pu ne pas bouger : la règle l'aurait perdu) ;
 *     la stabilité des compteurs (contrôle des classements, radarStoreApps ; deux relevés à 50 minutes) ;
 *  4. LE GAIN, sur la cadence réelle : 30 jours de passages horaires rejoués depuis l'instantané (refresh de 3 jours pour
 *     une concurrente, 7 sinon, file networkQueueOrder, garde du passage, tagCounts d'une recherche à l'autre), dans les
 *     trois paliers du solde (survie : le 20/11 ; économie : du 15 au 19/11 ; normal : après l'achat d'un pack) ; une
 *     passe sautée vaut 1 crédit au moins (une recherche payée vide = 1 page) ; face aux crédits « network » de
 *     radarUsage et à ce qui borne ce poste (sa part du jour, le rattrapage, le solde moins la réserve).
 * Hypothèses écrites : la page d'un hashtag reste celle relevée le 20/11 pendant les 30 jours rejoués (aux deux relevés
 * à 50 minutes d'écart, aucun absent n'a changé) ; une recherche payée rend au moins les vidéos connues en prod qui
 * portent #tag et ont été rangées par le réseau de l'app (un plancher), au moins 1 si la page compte des vidéos, 0 sinon.
 * Une mesure du poste ne dit pas ce que TikTok sert aux serveurs Convex (13/11) : radarApps.tagCounts (absent,
 * absentVideos, completeOut, sameFound) et radarUsage.saved.hashtag le diront après bascule.
 *
 * Budget : 0 page TikTok, 0 appel payant (lecture de fichiers seulement).
 *
 * Relancer :
 *   npx esbuild scripts/radar-bancs/hashtags-cote-a-cote.ts --bundle --platform=node --format=esm --outfile=<scratch>/cac-hors-ligne.mjs
 *   node <scratch>/cac-hors-ligne.mjs <dossier instantané prod> <dossier de sortie> <rows.json 18:44> <rows.json 19:34> \
 *     [--relus <summary.json 18:44>] [--relus <summary.json 19:34>]
 */
import { createReadStream, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline";
import { dayKeyParis, monthKeyParis } from "../../convex/radar/dateFr";
import {
  TAG_COMPLETE_SKIP,
  TAG_ROUTINE_SKIP,
  checkHashtag,
  citesApp,
  hashtagGate,
  needsDeepSearch,
  networkFoundBy,
  networkPages,
  networkPasses,
  networkQueueOrder,
  networkRefreshMs,
  normalize,
  notePaidPage,
  notePaidPass,
  noteTagCounts,
  paidTags,
  passSkip,
  searchKind,
  tagGuardNote,
  tagGuardRead,
  tagGuardStart,
  tagRunStart,
  type AppRule,
  type TagCount,
  type TagGuard,
  type TagIo,
  type TagPast,
  type TagRun,
} from "../../convex/radar/radarNetworkMath";
import { CREDIT_RESERVE, SC_PRICE_PER_CREDIT, allowance, budgetState, catchUpAllowance, envelopeCredits, normalizeBudget, recentPerDay, tierDefers, type CreditTier } from "../../convex/radar/radarSignalsMath";
import { parseTagList, tagEmbedUrl, type PageFetch } from "../../convex/radar/radarStoreMath";

const argv = process.argv.slice(2);
const [snap, out] = argv;
const relusFiles = argv.flatMap((a, i) => (a === "--relus" && argv[i + 1] ? [argv[i + 1]] : []));
const rowFiles = argv.slice(2).filter((a, i, xs) => !a.startsWith("--") && xs[i - 1] !== "--relus");
if (!snap || !out || rowFiles.length === 0) throw new Error("usage : cac-hors-ligne.mjs <instantané> <sortie> <rows.json> [<rows.json> …] [--relus <summary.json>]");
mkdirSync(out, { recursive: true });

/** L'instantané de prod : l'export du 20/11/2026 17:14 UTC. */
const SNAP_AT = Date.UTC(2026, 10, 20, 17, 14);
/** Jours rejoués ; recherches complètes par heure au palier normal (275 le 15/11, rattrapage enchaîné : ~12 par heure). */
const SIM_DAYS = 30;
const DEEP_PER_HOUR = Math.ceil(275 / 24);
/** Le pack que le palier « normal » suppose acheté (celui des en-têtes de radarSignalsMath). */
const PACK = 25_000;
const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

type Doc = Record<string, any>;
const jsonl = (f: string): Doc[] => readFileSync(`${snap}/${f}`, "utf8").trim().split("\n").map((l) => JSON.parse(l));
const tagsOf = (caption: unknown): string[] => [...String(caption ?? "").matchAll(/#([\p{L}\p{N}_]+)/gu)].map((m) => m[1].toLowerCase());
const iso = (t: number | undefined) => (t ? new Date(t).toISOString().slice(0, 16) : null);
const ruleOf = (a: Doc): AppRule => ({ strong: a.strong, weak: a.weak, context: a.context, ...(a.not ? { not: a.not } : {}) });
const count = <T>(xs: readonly T[], key: (x: T) => string) => xs.reduce<Record<string, number>>((m, x) => ((m[key(x)] = (m[key(x)] ?? 0) + 1), m), {});
const isRival = (a: Doc) => (a.rivalOf ?? []).length > 0;
const keywordsOf = (a: Doc): string[] => (a.searches as string[]).filter((s) => searchKind(s).kind === "keyword");
/** Un mot-clé de l'app dont la forme compacte contient le hashtag, ou l'inverse (« dawcade » / « #dawcade »). */
const homonyms = (a: Doc, tag: string) => keywordsOf(a).filter((k) => normalize(k).compact.includes(tag) || tag.includes(normalize(k).compact));
/** La légende porte-t-elle un mot-clé de l'app (sa recherche par mot-clé a pu la rendre) ? */
const keywordHit = (a: Doc, caption: string) => keywordsOf(a).some((k) => normalize(caption).compact.includes(normalize(k).compact));

// ─── La prod ──────────────────────────────────────────────────────────────────────────────────────────────────────
const apps = jsonl("radarApps.jsonl");
const appBySlug = new Map(apps.map((a) => [a.slug as string, a]));
const active = apps.filter((a) => a.status === "active");
/** Les hashtags des apps actives, une fois chacun (l'univers dont les bancs ont tiré leurs pages). */
type Case = { app: Doc; tag: string; searched: boolean };
const cases = new Map<string, Case>();
for (const app of active)
  for (const s of app.searches as string[]) {
    const k = searchKind(s);
    if (k.kind === "hashtag" && !cases.has(k.value.toLowerCase())) cases.set(k.value.toLowerCase(), { app, tag: k.value.toLowerCase(), searched: app.networkSearchedAt !== undefined });
  }

// ─── Les pages relevées ───────────────────────────────────────────────────────────────────────────────────────────
type Item = { id: string; author: string; cites?: boolean };
type Row = { app: string; tag: string; deep: boolean; searched: boolean; status: string; list?: { videos: number; items: Item[] }; check?: Doc };
const readings = new Map<string, { row: Row; file: string }[]>();
for (const f of rowFiles) for (const row of JSON.parse(readFileSync(f, "utf8")) as Row[]) readings.set(row.tag, [...(readings.get(row.tag) ?? []), { row, file: f }]);
/** La lecture la plus récente d'un hashtag (les fichiers sont donnés dans l'ordre des relevés). */
const pageRow = (tag: string): Row | undefined => readings.get(tag)?.at(-1)?.row;
/** Les relectures de vidéos déjà faites par les bancs (en ligne et portant le hashtag, retirée…), par vidéo. */
const relus = new Map<string, string>();
for (const f of relusFiles) {
  const s = JSON.parse(readFileSync(f, "utf8"));
  for (const m of s.complete?.missing ?? []) relus.set(m.videoId, m.page);
  for (const side of s.sides ?? []) for (const m of [...(side.missing ?? []), ...(side.otherKnown ?? [])]) relus.set(m.videoId, m.state);
}

/**
 * La page d'intégration refaite de son relevé (compteur, vidéos listées). Les légendes n'y sont pas : une vidéo dont le
 * banc a jugé qu'elle cite l'app reçoit un mot de la règle de l'app (contrôlé plus bas : même tri que le banc).
 */
const embedPage = (tag: string, l: NonNullable<Row["list"]>, cite: string) =>
  `<script id="__FRONTITY_CONNECT_STATE__">${JSON.stringify({
    source: {
      data: {
        [`/embed/tag/${tag}`]: {
          videoList: l.items.map((i) => ({ id: i.id, desc: i.cites ? cite : "", authorUniqueId: i.author, playCount: 0 })),
          embedInfo: { videoCount: String(l.videos), statusCode: 0, code: 200 },
        },
      },
    },
  })}</script>`;
const pageOf = (r: Row, app: Doc | undefined): PageFetch =>
  r.status === "absent" ? { kind: "absent" } : r.status === "ok" && r.list ? { kind: "ok", text: embedPage(r.tag, r.list, app?.strong?.[0] ?? r.tag) } : { kind: "suspect", reason: r.status };
const ioOf = (tag: string, page: PageFetch): TagIo => ({ page: async (url) => (url === tagEmbedUrl(tag) ? page : { kind: "suspect", reason: "pas relevée" }) });

// Contrôle : la citation refaite donne le même tri que le banc (sinon le rejeu de « complete » serait faux).
let citeMismatch = 0;
for (const rs of readings.values()) {
  const r = rs.at(-1)!.row;
  const app = appBySlug.get(r.app);
  if (!app || !r.list) continue;
  const p = pageOf(r, app);
  const l = p.kind === "ok" ? parseTagList(p.text) : null;
  const again = l ? l.items.filter((i) => citesApp(i.desc, i.author, ruleOf(app))).length : -1;
  if (again !== r.list.items.filter((i) => i.cites).length) citeMismatch++;
}

// ─── Ce que la prod sait des vidéos qui portent ces hashtags ──────────────────────────────────────────────────────
const interest = new Set<string>([...readings.keys(), ...cases.keys()]);
const signals = jsonl("radarSignals.jsonl").filter((s) => (s.platform ?? "tiktok") === "tiktok");
const tracked = jsonl("radarTracked.jsonl").filter((t) => (t.platform ?? "tiktok") === "tiktok");
const trackedById = new Map(tracked.map((t) => [t._id as string, t]));
const trackedByHandle = new Map(tracked.map((t) => [String(t.handle).toLowerCase(), t]));
type Known = { videoId: string; handle: string; caption: string; publishedAt: number; src: "signal" | "suivie" };
const knownByTag = new Map<string, Known[]>();
/** Tous les hashtags vus dans une légende connue, et combien de fois : les voisins d'un hashtag (#numolabsai pour #numolabs). */
const allTags = new Map<string, number>();
const note = (t: string, k: Known) => {
  allTags.set(t, (allTags.get(t) ?? 0) + 1);
  if (interest.has(t)) knownByTag.set(t, [...(knownByTag.get(t) ?? []), k]);
};
const sigByTag = new Map<string, Doc[]>();
for (const s of signals)
  for (const t of new Set(tagsOf(s.caption))) {
    note(t, { videoId: s.videoId, handle: s.authorHandle, caption: s.caption, publishedAt: s.publishedAt, src: "signal" });
    if (interest.has(t)) sigByTag.set(t, [...(sigByTag.get(t) ?? []), s]);
  }
const trackedByApp = new Map<string, Doc[]>();
for (const t of tracked) if (t.matchedBy === "caption") trackedByApp.set(t.appId, [...(trackedByApp.get(t.appId) ?? []), t]);
for await (const line of createInterface({ input: createReadStream(`${snap}/radarTrackedVideos.jsonl`) })) {
  if (!line.includes("#")) continue;
  const v = JSON.parse(line);
  const acc = trackedById.get(v.accountId);
  if (v.platform === "instagram" || !acc || typeof v.caption !== "string") continue;
  for (const t of new Set(tagsOf(v.caption))) note(t, { videoId: v.videoId, handle: acc.handle, caption: v.caption, publishedAt: v.publishedAt, src: "suivie" });
}
const knownOf = (tag: string): Known[] => {
  const seen = new Set<string>();
  return (knownByTag.get(tag) ?? []).filter((k) => !seen.has(k.videoId) && (seen.add(k.videoId), true));
};
/** Les hashtags voisins vus en prod (préfixe commun d'au moins 5 lettres) : ils ne sont pas #tag. */
const nearTags = (tag: string) =>
  [...allTags]
    .filter(([t]) => t !== tag && ((t.startsWith(tag) && tag.length >= 5) || (tag.startsWith(t) && t.length >= 5)))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([t, n]) => `#${t} (${n})`);

const foundByOf = (a: Doc) => new Set([networkFoundBy(a.name, null), networkFoundBy(a.name, "FR")]);
const netSignalsOf = (a: Doc) => {
  const fb = foundByOf(a);
  return signals.filter((s) => (s.foundBy as string[]).some((f) => fb.has(f)));
};

type PaidVideo = { videoId: string; handle: string; publishedAt: string | null; via: "signal réseau" | "compte rattaché"; cites: boolean; keyword: boolean; knownBefore: boolean };
type Paid = { videos: PaidVideo[]; accounts: { handle: string; addedAt: string | null; videos: string[] }[]; anyKnown: number };
/**
 * Ce que la recherche payée a rendu avec le hashtag EXACT : les signaux « réseau <App>[·fr] » qui le portent, et les
 * vidéos qui le portent des comptes rattachés à l'app sur une légende (publiées avant leur entrée). `keyword` : la
 * légende porte aussi un mot-clé de l'app (sa passe de mot-clé a pu la rendre : la sauter ne l'aurait pas perdue).
 * `knownBefore` : l'auteur était suivi avant (une autre voie l'avait déjà).
 */
function paidWithTag(a: Doc, tag: string): Paid {
  const fb = foundByOf(a);
  const rule = ruleOf(a);
  const videos: PaidVideo[] = [];
  const known = knownOf(tag);
  for (const s of sigByTag.get(tag) ?? []) {
    if (!(s.foundBy as string[]).some((f) => fb.has(f))) continue;
    const acc = trackedByHandle.get(String(s.authorHandle).toLowerCase());
    videos.push({
      videoId: s.videoId,
      handle: s.authorHandle,
      publishedAt: iso(s.publishedAt),
      via: "signal réseau",
      cites: citesApp(s.caption, s.authorHandle, rule),
      keyword: keywordHit(a, s.caption),
      knownBefore: !fb.has(s.foundBy[0]) || (acc !== undefined && acc.addedAt < s._creationTime - MIN),
    });
  }
  const accounts: Paid["accounts"] = [];
  for (const t of trackedByApp.get(a._id) ?? []) {
    const mine = known.filter((v) => String(v.handle).toLowerCase() === String(t.handle).toLowerCase() && v.publishedAt <= t.addedAt + HOUR);
    if (!mine.length) continue;
    accounts.push({ handle: t.handle, addedAt: iso(t.addedAt), videos: mine.map((v) => v.videoId) });
    for (const v of mine)
      if (!videos.some((p) => p.videoId === v.videoId))
        videos.push({ videoId: v.videoId, handle: t.handle, publishedAt: iso(v.publishedAt), via: "compte rattaché", cites: citesApp(v.caption, t.handle, rule), keyword: keywordHit(a, v.caption), knownBefore: false });
  }
  return { videos, accounts, anyKnown: known.length };
}
/** Le plancher de ce que rend la recherche payée d'un hashtag (rejeu) : le connu en prod, au moins 1 si la page compte des vidéos. */
const paidFloor = (a: Doc, tag: string): number => {
  const n = paidWithTag(a, tag).videos.length;
  const r = pageRow(tag);
  return r?.status === "ok" && (r.list?.videos ?? 0) > 0 ? Math.max(1, n) : n;
};
const paidFloorCache = new Map<string, number>();
const paidReturn = (a: Doc, tag: string) => {
  const k = `${a.slug} ${tag}`;
  if (!paidFloorCache.has(k)) paidFloorCache.set(k, paidFloor(a, tag));
  return paidFloorCache.get(k)!;
};

// ─── Une recherche de réseau d'une app, rejouée : le tri de ses hashtags, ses passes sautées ou payées ───────────
type Rule = "livrée" | "avant";
type SearchOut = { spared: number; sparedLost: number; hashtagPasses: number; read: number; why: Record<string, number>; unconfirmedPasses: number; counts: TagCount[] | undefined; guard: TagGuard };
/**
 * Comme runNetworkSearch : un hashtag lu une fois pour ses passes (sous la garde du passage), une passe sautée si son tri
 * le dit (passSkip), payée sinon (elle rend `paidReturn` vidéos), puis ce que l'app retient (paidTags → noteTagCounts).
 * « avant » : la règle d'avant la revue, à qui l'on dit « payé vide » pour tout hashtag (checkHashtag paid: 0).
 * `lying` : hashtags que TikTok sert « absent » aux serveurs alors qu'ils ont des vidéos (le scénario du 13/11).
 * `sparedLost` : passes sautées alors que la recherche payée aurait rendu des vidéos — l'écart de qualité.
 */
async function searchApp(
  a: Doc,
  deep: boolean,
  prev: TagCount[] | undefined,
  guard: TagGuard,
  rule: Rule,
  now: number,
  only?: (tag: string) => boolean,
  lying?: ReadonlySet<string>,
): Promise<SearchOut> {
  const passes = networkPasses(a.searches, deep);
  const runs = new Map<string, TagRun>();
  const res: SearchOut = { spared: 0, sparedLost: 0, hashtagPasses: 0, read: 0, why: {}, unconfirmedPasses: 0, counts: prev, guard };
  for (const p of passes) {
    if (p.kind !== "hashtag") continue;
    const tag = p.value.toLowerCase();
    if (only && !only(tag)) continue;
    if (!runs.has(p.value)) {
      const run = tagRunStart(passes.filter((q) => q.kind === "hashtag" && q.value === p.value).length);
      const r = pageRow(tag);
      if (r && tagGuardRead(res.guard, 0, 1)) {
        const past = prev?.find((t) => t.tag === p.value);
        const o: TagPast = { deep, last: past?.videos, paid: rule === "avant" ? 0 : past?.paid };
        const page: PageFetch = lying?.has(tag) ? { kind: "absent" } : pageOf(r, a);
        const noted = tagGuardNote(res.guard, await checkHashtag(p.value, ruleOf(a), o, ioOf(p.value, page)));
        res.guard = noted.guard;
        run.check = noted.check;
        res.read++;
        res.why[noted.check.why] = (res.why[noted.check.why] ?? 0) + 1;
      }
      runs.set(p.value, run);
    }
    const run = runs.get(p.value)!;
    res.hashtagPasses++;
    if (passSkip(p, runs)) {
      res.spared++;
      if (paidReturn(a, tag) > 0) res.sparedLost++;
      continue;
    }
    if (run.check?.why === "unconfirmed") res.unconfirmedPasses++;
    const n = paidReturn(a, tag);
    notePaidPage(run, { attached: 0, signals: 0, updated: 0 }, Array.from({ length: n }, (_, k) => ({ videoId: `${tag}-${k}`, authorHandle: "", caption: "" })), ruleOf(a));
    notePaidPass(run, { stopped: false, failed: false });
  }
  const paid = paidTags(runs);
  if (paid.length) res.counts = noteTagCounts(prev, paid, a.searches, now);
  return res;
}

// ─── 1. ABSENT : côte à côte avec le payant, et la décision rejouée sur deux recherches de suite ─────────────────
const absentTags = [...readings.keys()].filter((t) => pageRow(t)!.status === "absent");
const absentRows = [];
for (const tag of absentTags) {
  const r = pageRow(tag)!;
  const a = appBySlug.get(r.app);
  if (!a) continue;
  const paid = paidWithTag(a, tag);
  const net = netSignalsOf(a);
  const netAccounts = trackedByApp.get(a._id) ?? [];
  const decisions: Record<Rule, { first: string; firstSpared: number; second: string; secondSpared: number }> = {} as never;
  for (const rule of ["livrée", "avant"] as const) {
    const deep = needsDeepSearch(a);
    const s1 = await searchApp(a, deep, undefined, tagGuardStart(), rule, SNAP_AT, (t) => t === tag);
    const s2 = await searchApp(a, false, s1.counts, tagGuardStart(), rule, SNAP_AT + networkRefreshMs(isRival(a)), (t) => t === tag);
    decisions[rule] = { first: Object.keys(s1.why)[0] ?? "pas lu", firstSpared: s1.spared, second: Object.keys(s2.why)[0] ?? "pas lu", secondSpared: s2.spared };
  }
  const searched = a.networkSearchedAt !== undefined;
  const verdict =
    paid.videos.length || paid.accounts.length
      ? `ÉCART : la recherche payée a rendu ${paid.videos.length} vidéo(s) portant #${tag}`
      : paid.anyKnown
        ? `ÉCART de page : ${paid.anyKnown} vidéo(s) connue(s) portent #${tag}`
        : searched
          ? "neutre : la recherche payée (complète, deux régions) n'a rien rendu qui porte ce hashtag"
          : "pas de recherche payée à opposer (app jamais cherchée) ; aucune vidéo connue ne porte ce hashtag";
  absentRows.push({
    tag,
    app: a.slug,
    searched,
    rival: isRival(a),
    deepSearchedAt: iso(a.deepSearchedAt),
    networkSearchedAt: iso(a.networkSearchedAt),
    searches: a.searches,
    readings: (readings.get(tag) ?? []).map((x) => x.row.status),
    paidWithTag: { videos: paid.videos.length, accounts: paid.accounts.length },
    anyKnownWithTag: paid.anyKnown,
    nearTags: nearTags(tag),
    homonymKeywords: homonyms(a, tag),
    network: {
      signals: net.length,
      signalsWithKeyword: net.filter((s) => keywordHit(a, s.caption)).length,
      signalsWithTag: net.filter((s) => tagsOf(s.caption).includes(tag)).length,
      accountsByCaption: netAccounts.length,
      trackedCount: a.trackedCount ?? 0,
      lastSearch: a.networkSearch ? { outcome: a.networkSearch.outcome, attached: a.networkSearch.attached, signals: a.networkSearch.signals, steps: a.networkSearch.steps } : null,
    },
    decisions,
    verdict,
  });
}

// ─── 2. COMPLET (en mesure) : ce que la règle active aurait rangé, contre ce que le payant a rendu ───────────────
const completeRows = [];
for (const [tag] of readings) {
  const r = pageRow(tag)!;
  const a = appBySlug.get(r.app);
  if (!a || r.status !== "ok" || !r.list) continue;
  const page = pageOf(r, a);
  const list = page.kind === "ok" ? parseTagList(page.text) : null;
  if (!list) continue;
  const deep = needsDeepSearch(a);
  const live = await checkHashtag(tag, ruleOf(a), { deep }, ioOf(tag, page));
  if (live.why !== "complete") continue;
  const act = hashtagGate(list, ruleOf(a), { deep }, { routine: false, complete: true });
  const readIds = new Set(act.read.map((i) => i.id));
  const readAuthors = new Set(act.read.map((i) => i.author.toLowerCase()));
  const listIds = new Set(list.items.map((i) => i.id));
  const paid = paidWithTag(a, tag);
  const out = paid.videos
    .filter((v) => !readIds.has(v.videoId))
    .map((v) => {
      const state = relus.get(v.videoId) ?? (listIds.has(v.videoId) ? "listée, ne cite pas l'app" : "non relue");
      const authorKept = readAuthors.has(v.handle.toLowerCase()) || v.knownBefore;
      const lost = !v.cites || state === "retirée" ? "rien (ne cite pas l'app, ou retirée)" : v.keyword ? "trouvable par un mot-clé de l'app" : authorKept ? "le signal (auteur gardé par une autre vidéo de la liste, ou suivi avant)" : "LE COMPTE";
      return { ...v, state, inList: listIds.has(v.videoId), authorKept, lost };
    });
  const otherKnown = knownOf(tag)
    .filter((k) => !listIds.has(k.videoId) && !paid.videos.some((v) => v.videoId === k.videoId))
    .map((k) => ({ videoId: k.videoId, handle: k.handle, src: k.src, state: relus.get(k.videoId) ?? "non relue" }));
  completeRows.push({
    tag,
    app: a.slug,
    searched: a.networkSearchedAt !== undefined,
    count: list.videos,
    listed: list.items.length,
    citing: act.read.length,
    measured: { pay: live.pay, why: live.why, completeSkip: TAG_COMPLETE_SKIP },
    paid: { videos: paid.videos.length, accounts: paid.accounts },
    outOfRead: out,
    otherKnown,
    lost: count(out, (o) => o.lost),
  });
}

// ─── 3. SAME (en mesure) : les recherches de routine de la prod, et la stabilité des compteurs ────────────────────
const routineApps = active.filter(
  (a) => a.deepSearchedAt && a.networkSearchedAt > a.deepSearchedAt + HOUR && a.networkSearch?.outcome === "done" && a.networkSearch.requestedAt > a.deepSearchedAt,
);
const sameRows = routineApps.map((a) => {
  const ns = a.networkSearch;
  const [x, y] = [ns.requestedAt - MIN, ns.finishedAt + MIN];
  const fb = foundByOf(a);
  const newSignals = signals.filter((s) => (s.foundBy as string[]).some((f) => fb.has(f)) && s._creationTime >= x && s._creationTime <= y);
  const newAccounts = tracked.filter((t) => t.appId === a._id && t.matchedBy === "caption" && t.addedAt >= x && t.addedAt <= y);
  const tags = (a.searches as string[]).filter((s) => searchKind(s).kind === "hashtag").map((s) => s.slice(1).toLowerCase());
  return {
    app: a.slug,
    rival: isRival(a),
    previous: iso(a.deepSearchedAt),
    routine: iso(ns.requestedAt),
    found: { signals: newSignals.length, accounts: newAccounts.length },
    tags: tags.map((tag) => {
      const known = knownOf(tag);
      const finds = [
        ...newSignals.filter((s) => tagsOf(s.caption).includes(tag)).map((s) => ({ kind: "signal", handle: s.authorHandle, publishedAt: s.publishedAt as number, caption: s.caption as string })),
        ...newAccounts.flatMap((t) => {
          const v = known.filter((k) => String(k.handle).toLowerCase() === String(t.handle).toLowerCase() && k.publishedAt <= t.addedAt + HOUR);
          return v.length ? [{ kind: "compte", handle: t.handle as string, publishedAt: Math.min(...v.map((k) => k.publishedAt)), caption: v[0].caption }] : [];
        }),
      ];
      // Une vidéo connue qui porte #tag, publiée entre les deux recherches : son compteur a bougé, « same » ne jouait pas.
      const moved = known.filter((k) => k.publishedAt > a.deepSearchedAt && k.publishedAt < ns.requestedAt).length;
      const r = pageRow(tag);
      return {
        tag,
        count: r?.list?.videos ?? null,
        movedBetween: moved,
        finds: finds.length,
        findsBeforePrevious: finds.filter((f) => f.publishedAt < a.deepSearchedAt).length,
        findsBeforePreviousOnlyTag: finds.filter((f) => f.publishedAt < a.deepSearchedAt && !keywordHit(a, f.caption)).length,
      };
    }),
  };
});
// Le compteur d'un hashtag bouge-t-il ? Le contrôle des classements (radarStoreApps.tagVideos, lu des jours avant) contre
// le relevé du 20/11, par taille ; et les deux relevés du 20/11 à 50 minutes d'écart.
const sizeOf = (n: number) => (n < 10 ? "0-9" : n < 100 ? "10-99" : n < 1000 ? "100-999" : "1000+");
const storeCounts = new Map<string, Doc>();
for (const d of jsonl("radarStoreApps.jsonl")) if (d.tag && typeof d.tagVideos === "number") storeCounts.set(String(d.tag).toLowerCase(), d);
const stability: Record<string, { pairs: number; unchanged: number; medianDays: number | null }> = {};
const daysBy: Record<string, number[]> = {};
for (const [tag] of readings) {
  const r = pageRow(tag)!;
  const d = storeCounts.get(tag);
  if (!d || r.status !== "ok" || !r.list || !d.checkedAt) continue;
  const k = sizeOf(r.list.videos);
  stability[k] ??= { pairs: 0, unchanged: 0, medianDays: null };
  stability[k].pairs++;
  if (d.tagVideos === r.list.videos) stability[k].unchanged++;
  (daysBy[k] ??= []).push((SNAP_AT - d.checkedAt) / DAY);
}
for (const [k, ds] of Object.entries(daysBy)) stability[k].medianDays = [...ds].sort((p, q) => p - q)[Math.floor(ds.length / 2)];
const twoReadings: Record<string, { pairs: number; unchanged: number }> = {};
for (const [, rs] of readings) {
  if (rs.length < 2) continue;
  const [p, q] = [rs[0].row, rs.at(-1)!.row];
  const k = p.status === "absent" || q.status === "absent" ? "absent" : sizeOf(p.list?.videos ?? 0);
  twoReadings[k] ??= { pairs: 0, unchanged: 0 };
  twoReadings[k].pairs++;
  if (p.status === q.status && (p.list?.videos ?? -1) === (q.list?.videos ?? -1)) twoReadings[k].unchanged++;
}

// ─── 4. LE GAIN sur la cadence réelle : 30 jours de passages horaires, trois paliers du solde ─────────────────────
type Regime = "survie" | "economie" | "normal";
/** Le palier tel que runNetworkSearch l'applique (tierDefers) : quelles apps passent. */
const tierOf: Record<Regime, CreditTier> = { survie: "survie", economie: "economie", normal: "normal" };
/** Une app dont tous les hashtags ont une page relevée : son tri est rejoué. Les autres passent dans la file sans tri. */
const fullyRead = (a: Doc) => (a.searches as string[]).every((s) => searchKind(s).kind !== "hashtag" || pageRow(s.slice(1).toLowerCase()) !== undefined);
async function simulate(regime: Regime, rule: Rule, lying?: ReadonlySet<string>) {
  const defers = tierDefers(tierOf[regime]);
  const st = active.map((a) => ({ a, rival: isRival(a), searchedAt: a.networkSearchedAt as number | undefined, deepAt: a.deepSearchedAt as number | undefined, counts: undefined as TagCount[] | undefined, full: fullyRead(a), stratum: a.networkSearchedAt !== undefined ? "searched" : "never" }));
  const res = {
    searches: { deep: 0, routine: 0 },
    replayed: { searched: 0, never: 0 },
    hashtagPasses: { searched: 0, never: 0 },
    spared: { searched: 0, never: 0 },
    sparedLost: 0,
    routinePasses: { rival: 0, other: 0 },
    unconfirmedPasses: 0,
    why: {} as Record<string, number>,
    breakerTrips: 0,
    firstSparedAt: null as string | null,
    sparedByDay: Array.from({ length: SIM_DAYS }, () => 0),
    passesAll: 0,
  };
  for (let h = 0; h < SIM_DAYS * 24; h++) {
    const t = SNAP_AT + h * HOUR;
    const due = st
      .filter((s) => s.searchedAt === undefined || t - s.searchedAt >= networkRefreshMs(s.rival))
      .filter((s) => s.rival || !(defers.routine || (defers.deep && needsDeepSearch({ deepSearchedAt: s.deepAt }))))
      .sort((x, y) => networkQueueOrder({ rival: x.rival, source: x.a.source, networkSearchedAt: x.searchedAt }, { rival: y.rival, source: y.a.source, networkSearchedAt: y.searchedAt }));
    let guard = tagGuardStart();
    let deepLeft = DEEP_PER_HOUR;
    for (const s of due) {
      const deep = needsDeepSearch({ deepSearchedAt: s.deepAt });
      if (deep) {
        if (deepLeft <= 0) continue;
        deepLeft--;
      }
      res.searches[deep ? "deep" : "routine"]++;
      res.passesAll += networkPasses(s.a.searches, deep).length;
      if (!deep) res.routinePasses[s.rival ? "rival" : "other"] += networkPasses(s.a.searches).length;
      if (s.full) {
        const o = await searchApp(s.a, deep, s.counts, guard, rule, t, undefined, lying);
        if (o.guard.stopped && !guard.stopped) res.breakerTrips++;
        guard = o.guard;
        s.counts = o.counts;
        const k = s.stratum as "searched" | "never";
        res.replayed[k]++;
        res.hashtagPasses[k] += o.hashtagPasses;
        res.spared[k] += o.spared;
        res.sparedLost += o.sparedLost;
        res.unconfirmedPasses += o.unconfirmedPasses;
        for (const [w, n] of Object.entries(o.why)) res.why[w] = (res.why[w] ?? 0) + n;
        res.sparedByDay[Math.floor(h / 24)] += o.spared;
        if (o.spared && !res.firstSparedAt) res.firstSparedAt = iso(t);
      }
      s.searchedAt = t;
      if (deep) s.deepAt = t;
    }
  }
  return res;
}
// Les hashtags des apps jamais cherchées ne sont relevés qu'en partie : leur gain est extrapolé à tout le vivier.
const pool = { searched: [...cases.values()].filter((c) => c.searched).length, never: [...cases.values()].filter((c) => !c.searched).length };
const poolRead = {
  searched: [...cases.values()].filter((c) => c.searched && fullyRead(c.app) && pageRow(c.tag)).length,
  never: [...cases.values()].filter((c) => !c.searched && fullyRead(c.app) && pageRow(c.tag)).length,
};
// Le scénario du 13/11 : TikTok sert « absent » aux serveurs, durablement, pour 3 % de ce qui existe (67 profils sur 2 210,
// en-tête de radarFreeMath) — tirés au hasard (graine écrite) parmi les hashtags relevés qui ont des vidéos.
let seed = 20_261_113;
const rnd = () => (seed = (Math.imul(seed, 1103515245) + 12345) >>> 0) / 2 ** 32;
const lying = new Set([...readings.keys()].filter((t) => pageRow(t)!.status === "ok" && (pageRow(t)!.list?.videos ?? 0) > 0 && rnd() < 67 / 2_210));
const runs: [Regime, Rule, ReadonlySet<string> | undefined, string][] = [
  ["survie", "livrée", undefined, ""],
  ["survie", "avant", undefined, ""],
  ["economie", "livrée", undefined, ""],
  ["economie", "avant", undefined, ""],
  ["normal", "livrée", undefined, ""],
  ["normal", "avant", undefined, ""],
  ["normal", "livrée", lying, " · 13/11"],
  ["normal", "avant", lying, " · 13/11"],
];
const simRaw: Record<string, Awaited<ReturnType<typeof simulate>>> = {};
for (const [regime, rule, lie, tag] of runs) simRaw[`${regime} · ${rule}${tag}`] = await simulate(regime, rule, lie);

// ─── Les crédits « network » et ce qui borne ce poste ─────────────────────────────────────────────────────────────
const usageRows = jsonl("radarUsage.jsonl");
const network = Object.fromEntries(usageRows.filter((u) => u.poste === "network").map((u) => [u.day as string, u.credits as number]).sort());
const allByDay: Record<string, number> = {};
for (const u of usageRows) allByDay[u.day] = (allByDay[u.day] ?? 0) + u.credits;
const settings = jsonl("radarSettings.jsonl")[0];
const budget = normalizeBudget(settings);
const month = monthKeyParis(SNAP_AT);
const today = dayKeyParis(SNAP_AT);
const monthUsage = usageRows.filter((u) => u.month === month).map((u) => ({ poste: u.poste as string, credits: u.credits as number, day: u.day as string, ...(u.usd !== undefined ? { usd: u.usd as number } : {}) }));
const recent = usageRows.filter((u) => u.day >= dayKeyParis(SNAP_AT - 4 * DAY)).map((u) => ({ poste: u.poste as string, credits: u.credits as number, day: u.day as string }));
const todayNetwork = monthUsage.filter((u) => u.day === today && u.poste === "network").reduce((n, u) => n + u.credits, 0);
const budgetAt = (remaining: number) => {
  const b = budgetState(budget, monthUsage, { remaining, seenAt: SNAP_AT, now: SNAP_AT, perDay: recentPerDay(recent, today) });
  return {
    remaining,
    balanceLeft: b.balanceLeft,
    tier: b.tier,
    daysLeft: b.daysLeft === null ? null : +b.daysLeft.toFixed(2),
    cut: b.cut,
    networkSpentThisMonth: b.byPoste.network.credits,
    networkAllowancePerRun: allowance(budget, b, "network", todayNetwork, 1),
    networkCatchUp: catchUpAllowance(budget, b, "network"),
  };
};
// Ce que coûte une recherche : complète ~ crédits du 13 au 15/11 ÷ recherches complètes de ces jours ; de routine ~ crédits
// des 18-19/11 ÷ passes des apps cherchées ces jours-là (que des concurrentes).
const deepDays = ["2026-11-13", "2026-11-14", "2026-11-15"];
const deepCount = apps.filter((a) => a.deepSearchedAt && deepDays.includes(dayKeyParis(a.deepSearchedAt))).length;
const creditsPerDeep = deepDays.reduce((n, d) => n + (network[d] ?? 0), 0) / Math.max(1, deepCount);
const routineDays = ["2026-11-18", "2026-11-19"];
const routinePasses = active.filter((a) => a.networkSearchedAt && routineDays.includes(dayKeyParis(a.networkSearchedAt)) && a.networkSearchedAt !== a.deepSearchedAt).reduce((n, a) => n + networkPasses(a.searches).length, 0);
const creditsPerRoutinePass = routineDays.reduce((n, d) => n + (network[d] ?? 0), 0) / Math.max(1, routinePasses);
// Mesuré sur des concurrentes (3 pages au plus) ; une autre app lit 2 pages au plus : estimé au prorata.
const perPass = (rival: boolean) => creditsPerRoutinePass * (rival ? 1 : networkPages(false) / networkPages(true));
const dueAtSnap = active.filter((a) => a.networkSearchedAt === undefined || SNAP_AT - a.networkSearchedAt >= networkRefreshMs(isRival(a)));
const queueNeed = Math.round(
  dueAtSnap.reduce((n, a) => n + (needsDeepSearch(a) ? creditsPerDeep : networkPasses(a.searches).length * perPass(isRival(a))), 0),
);
// En régime (toutes les apps actives en routine) : les crédits « network » d'un jour moyen.
const steadyPerDay = Math.round(active.reduce((n, a) => n + (networkPasses(a.searches).length * perPass(isRival(a))) / (networkRefreshMs(isRival(a)) / DAY), 0));
const simulations: Record<string, unknown> = {};
const factor = { searched: poolRead.searched ? pool.searched / poolRead.searched : 0, never: poolRead.never ? pool.never / poolRead.never : 0 };
for (const [k, s] of Object.entries(simRaw)) {
  const floor30 = s.spared.searched * factor.searched + s.spared.never * factor.never;
  // Ce que le poste « network » dépenserait sur ces 30 jours sans la brique (recherches complètes + passes de routine).
  const spend30 = s.searches.deep * creditsPerDeep + s.routinePasses.rival * perPass(true) + s.routinePasses.other * perPass(false);
  simulations[k] = {
    ...s,
    extrapolation: factor,
    creditsFloor30d: Math.round(floor30),
    creditsFloorPerDay: +(floor30 / SIM_DAYS).toFixed(1),
    networkSpend30dEstimate: Math.round(spend30),
    floorShareOfSpend: spend30 ? +((100 * floor30) / spend30).toFixed(2) : null,
    deepSearchesEquivalent: +(floor30 / creditsPerDeep).toFixed(1),
    usd30d: +(floor30 * SC_PRICE_PER_CREDIT).toFixed(2),
  };
}
const credits = {
  networkByDay: network,
  allPostesByDay: allByDay,
  routineMean_16_19: Math.round((["2026-11-16", "2026-11-17", "2026-11-18", "2026-11-19"].reduce((n, d) => n + (network[d] ?? 0), 0) / 4) * 10) / 10,
  networkEnvelopeMonth: envelopeCredits(budget, "network"),
  networkSharePerDay: Math.round(envelopeCredits(budget, "network") / 30),
  creditsPerDeep: +creditsPerDeep.toFixed(1),
  creditsPerRoutinePass: +creditsPerRoutinePass.toFixed(2),
  creditsPerRoutinePassOther: +perPass(false).toFixed(2),
  dueAtSnap: { apps: dueAtSnap.length, never: dueAtSnap.filter((a) => a.networkSearchedAt === undefined).length, deep: dueAtSnap.filter((a) => needsDeepSearch(a)).length, creditsNeeded: queueNeed },
  steadyRoutinePerDay: steadyPerDay,
  atSnapshot: budgetAt(settings.creditsRemaining),
  withPack: budgetAt(PACK + CREDIT_RESERVE),
  usdPerCredit: SC_PRICE_PER_CREDIT,
};

// ─── Synthèse ─────────────────────────────────────────────────────────────────────────────────────────────────────
const summary = {
  pagesTikTok: 0,
  paidCalls: 0,
  rules: { TAG_COMPLETE_SKIP, TAG_ROUTINE_SKIP },
  readings: { files: rowFiles, hashtags: readings.size, readTwice: [...readings.values()].filter((r) => r.length > 1).length, citeMismatch },
  coverage: { pool, poolRead },
  absent: {
    hashtags: absentRows.length,
    searched: absentRows.filter((r) => r.searched).length,
    verdicts: count(absentRows, (r) => r.verdict),
    decisions: {
      livrée: { first: count(absentRows, (r) => r.decisions.livrée.first), second: count(absentRows, (r) => r.decisions.livrée.second), secondSpared: absentRows.reduce((n, r) => n + r.decisions.livrée.secondSpared, 0), firstSpared: absentRows.reduce((n, r) => n + r.decisions.livrée.firstSpared, 0) },
      avant: { first: count(absentRows, (r) => r.decisions.avant.first), firstSpared: absentRows.reduce((n, r) => n + r.decisions.avant.firstSpared, 0) },
    },
    withHomonymKeyword: absentRows.filter((r) => r.homonymKeywords.length).length,
    withNearTags: absentRows.filter((r) => r.nearTags.length).length,
  },
  complete: {
    hashtags: completeRows.length,
    searched: completeRows.filter((r) => r.searched).length,
    withPaidVideos: completeRows.filter((r) => r.paid.videos > 0).length,
    lost: completeRows.reduce<Record<string, number>>((m, r) => {
      for (const [k, n] of Object.entries(r.lost)) m[k] = (m[k] ?? 0) + n;
      return m;
    }, {}),
    otherKnownOutOfList: completeRows.reduce((n, r) => n + r.otherKnown.length, 0),
  },
  same: {
    routineSearches: sameRows.length,
    rivals: sameRows.filter((r) => r.rival).length,
    hashtags: sameRows.reduce((n, r) => n + r.tags.length, 0),
    hashtagsWithFinds: sameRows.reduce((n, r) => n + r.tags.filter((t) => t.finds > 0).length, 0),
    finds: sameRows.reduce((n, r) => n + r.tags.reduce((m, t) => m + t.finds, 0), 0),
    findsBeforePrevious: sameRows.reduce((n, r) => n + r.tags.reduce((m, t) => m + t.findsBeforePrevious, 0), 0),
    findsBeforePreviousOnlyTag: sameRows.reduce((n, r) => n + r.tags.reduce((m, t) => m + t.findsBeforePreviousOnlyTag, 0), 0),
    hashtagsMovedBetween: sameRows.reduce((n, r) => n + r.tags.filter((t) => t.movedBetween > 0).length, 0),
    storeCounterStability: stability,
    twoReadings20_11: twoReadings,
  },
  falseAbsent1311: [...lying],
  simulations,
  credits,
};
writeFileSync(`${out}/absent.json`, JSON.stringify(absentRows, null, 1));
writeFileSync(`${out}/complete.json`, JSON.stringify(completeRows, null, 1));
writeFileSync(`${out}/same.json`, JSON.stringify(sameRows, null, 1));
writeFileSync(`${out}/summary.json`, JSON.stringify(summary, null, 1));
console.log(JSON.stringify(summary, null, 1));
