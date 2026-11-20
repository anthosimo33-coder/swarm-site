/**
 * MESURE EN DIRECT — À LANCER PAR LE FONDATEUR SEULEMENT. Le robots.txt de TikTok interdit le site aux agents d'IA
 * (20/11/2026, 19 h 35) : aucun agent ne lance ce script, ni ne le fait lancer.
 *
 * Ce qu'elle mesure : la seule part du risque de « absent » (brique 3, actif sous la garde du payé-vide) qui se mesure
 * du poste. La règle livrée ne saute les passes d'un hashtag que si sa dernière recherche payée complète n'a rien rendu,
 * il y a moins de 21 jours (TAG_ABSENT_TRUST_MS), ET que sa page ne dit encore rien (400/404, ou vide en 200). Elle
 * perdrait une vidéo seulement si le hashtag naît dans ces 21 jours ET que TikTok sert alors « absent » aux serveurs à
 * tort (le 13/11 : 67 profils sur 2 210) — au plus 21 jours de passes sautées, puis la recherche payée repasse
 * (`recheck`). Le second facteur ne se mesure que sur les serveurs (radarApps.tagCounts : recheck, recheckVideos ;
 * radarUsage.saved.hashtag) ; le premier, ici : les hashtags dont la page ne disait rien le 20/11 (bancs hashtags.ts à
 * 18 h 44 et hashtags-cote-a-cote en ligne à 19 h 34 : 36 absents, tous relus absents quelques minutes plus tard, et 5
 * pages vides en 200) le disent-ils encore une semaine après ? Un hashtag apparu entre-temps (une vidéo listée, ou un
 * compteur) est un cas où la règle aurait dû payer à nouveau : le taux d'apparition par semaine.
 *
 * Budget : PAGES_MAX = 45 pages d'intégration publiques (`/embed/tag/<tag>`) au plus, une page par hashtag, une à la
 * fois, pause storePauseMs (0,3 à 0,7 s) avant chacune, arrêt à STORE_BREAKER (5) pages refusées d'affilée. Aucune page
 * vidéo, aucun appel payant. `--liste` : écrit ce qui serait lu, sans aucune requête.
 *
 * Lancer (pas avant le 27/11/2026 : une semaine, la cadence de routine d'une app non concurrente) :
 *   npx esbuild scripts/radar-bancs/hashtags-absents-relus.ts --bundle --platform=node --format=esm --outfile=<scratch>/relus.mjs
 *   node <scratch>/relus.mjs <dossier de sortie> <rows.json 18:44> <rows.json 19:34> [--liste]
 */
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { STORE_BREAKER, fetchEmbedPage, parseTagList, storePauseMs, tagEmbedUrl } from "../../convex/radar/radarStoreMath";

const argv = process.argv.slice(2);
const [out, ...rest] = argv;
const rowFiles = rest.filter((a) => !a.startsWith("--"));
const LIST_ONLY = argv.includes("--liste");
if (!out || rowFiles.length === 0) throw new Error("usage : relus.mjs <sortie> <rows.json> [<rows.json> …] [--liste]");
const PAGES_MAX = 45;
mkdirSync(out, { recursive: true });

type Row = { app: string; tag: string; status: string; list?: { videos: number; items: unknown[] } };
/** Une page qui ne dit rien : absente, ou vide en 200 (compteur 0, liste vide) — la règle « absent » (hashtagGate). */
const nothing = (r: Row) => r.status === "absent" || (r.status === "ok" && r.list?.videos === 0 && r.list.items.length === 0);
/** Les hashtags dont la page ne disait rien le 20/11 (dans au moins un relevé), une fois chacun, dans l'ordre des relevés. */
const absent = new Map<string, Row>();
for (const f of rowFiles) for (const r of JSON.parse(readFileSync(f, "utf8")) as Row[]) if (nothing(r) && !absent.has(r.tag)) absent.set(r.tag, r);
const todo = [...absent.values()].slice(0, PAGES_MAX);
console.log(`${absent.size} hashtags sans rien le 20/11 ; ${todo.length} pages au plus (budget ${PAGES_MAX})`);
if (LIST_ONLY) {
  for (const r of todo) console.log(`#${r.tag} (${r.app}) → ${tagEmbedUrl(r.tag)}`);
  process.exit(0);
}

const sleep = (ms: number) => new Promise<void>((done) => setTimeout(done, ms));
const rows: { tag: string; app: string; was: string; now: string; videos?: number; listed?: number }[] = [];
let pages = 0;
let streak = 0;
let stopped: string | null = null;
writeFileSync(`${out}/pages.log`, "");
for (const r of todo) {
  if (pages >= PAGES_MAX) break;
  await sleep(storePauseMs(Math.random()));
  pages++;
  const p = await fetchEmbedPage(tagEmbedUrl(r.tag));
  streak = p.kind === "suspect" ? streak + 1 : 0;
  appendFileSync(`${out}/pages.log`, `${new Date().toISOString()} ${p.kind}${p.kind === "suspect" ? ` ${p.reason}` : ""} #${r.tag}\n`);
  const list = p.kind === "ok" ? parseTagList(p.text) : null;
  rows.push({
    tag: r.tag,
    app: r.app,
    was: r.status === "absent" ? "absent" : "vide",
    now: p.kind === "absent" ? "absent" : p.kind === "suspect" ? `refusée (${p.reason})` : list ? (list.videos > 0 || list.items.length > 0 ? "APPARU" : "vide") : "illisible",
    ...(list ? { videos: list.videos, listed: list.items.length } : {}),
  });
  if (streak >= STORE_BREAKER) {
    stopped = `${streak} pages refusées d'affilée`;
    break;
  }
}
const tally = rows.reduce<Record<string, number>>((m, x) => ((m[x.now.split(" ")[0]] = (m[x.now.split(" ")[0]] ?? 0) + 1), m), {});
const summary = { ranAt: new Date().toISOString(), pages, stopped, absent20_11: absent.size, read: rows.length, now: tally, appeared: rows.filter((x) => x.now === "APPARU") };
writeFileSync(`${out}/relus.json`, JSON.stringify(rows, null, 1));
writeFileSync(`${out}/summary.json`, JSON.stringify(summary, null, 1));
console.log(JSON.stringify(summary, null, 1));
