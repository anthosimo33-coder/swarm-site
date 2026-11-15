// Banc de radarSync.run (15/11) : la vraie synchro dans un processus Node NEUF (comme une action de prod), Convex simulé.
//   node --expose-gc scripts/sync-bench/run.mjs <×N> [paquet.mjs] [étiquette]
// Export du Radar servi depuis .bench-data/export (une page à la fois, lignes dupliquées ×N avec ids suffixés), tables
// Swarm depuis .bench-data/store, écritures comptées et non faites. Empreintes des pages gardées dans
// .bench-data/hashes-<étiquette>-xN.json : un 2e passage part de là (« à l'équilibre ») ; deux versions se comparent page
// pour page en comparant leurs fichiers. BENCH_DUMP=clé1,clé2 garde le contenu de ces pages (dump-<étiquette>.json).
// Horloge figée (BENCH_T0) pour que deux versions calculent au même instant. Données : dump-export.mjs, dump-store.mjs.
import fs from "node:fs";
import path from "node:path";
const S = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../../.bench-data") + "/";
// Horloge figée (même instant de départ pour les deux versions) : sinon les fenêtres de temps font du bruit.
const BENCH_T0 = Number(process.env.BENCH_T0 || 1794780000000), p0 = performance.now(); Date.now = () => BENCH_T0 + Math.round(performance.now() - p0);
const N = Number(process.argv[2] || 1);
const BUNDLE = path.resolve(process.argv[3] ?? `${S}sync.bundle.mjs`), TAG = process.argv[4] ?? "neuf";
const HASHES = `${S}hashes-${TAG}-x${N}.json`;
let peak = { rss: 0, heap: 0, total: 0 };
const sample = () => { const m = process.memoryUsage(); peak.rss = Math.max(peak.rss, m.rss); peak.heap = Math.max(peak.heap, m.heapUsed); peak.total = Math.max(peak.total, m.heapTotal); };
setInterval(sample, 50).unref();
// L'écriture cadencée (3 Mo/s) et les attentes : immédiates au banc.
const origST = globalThis.setTimeout; globalThis.setTimeout = (f, ms, ...a) => origST(f, ms > 20 ? 0 : ms, ...a);
// Export : index des lignes, lu à la demande.
const idx = {};
for (const t of ["apps", "tracked", "trackedVideos", "formats", "signals"]) {
  const buf = fs.readFileSync(`${S}export/${t}.jsonl`); const offs = [0];
  for (let i = 0; i < buf.length; i++) if (buf[i] === 10) offs.push(i + 1);
  idx[t] = offs.slice(0, -1).map((o, i) => [o, offs[i + 1] - 1]);
}
const fd = {}; for (const t in idx) fd[t] = fs.openSync(`${S}export/${t}.jsonl`, "r");
const lineOf = (t, i) => { const [a, b] = idx[t][i]; const B = Buffer.alloc(b - a); fs.readSync(fd[t], B, 0, b - a, a); return B.toString(); };
const sfx = (c) => (x) => (typeof x === "string" && c ? `${x}~${c}` : x);
function grow(t, row, c) {
  if (!c) return row;
  const s = sfx(c), r = structuredClone(row);
  if (t === "apps") { r.id = s(r.id); r.slug = `${r.slug}-${c}`; r.name = `${r.name} ${c}`; if (r.mergedInto) r.mergedInto = s(r.mergedInto); }
  if (t === "tracked") { r.id = s(r.id); r.appId = s(r.appId); r.handle = `${r.handle}_${c}`; if (r.igHandle) r.igHandle = `${r.igHandle}_${c}`; }
  if (t === "trackedVideos") { r.id = s(r.id); r.accountId = s(r.accountId); r.appId = s(r.appId); r.videoId = /^\d+$/.test(r.videoId) ? r.videoId + c : s(r.videoId); }
  if (t === "formats") { r.id = s(r.id); r.key = s(r.key); r.appIds = r.appIds.map(s); r.members = r.members.map((m) => ({ ...m, accountId: s(m.accountId), appId: s(m.appId), handle: `${m.handle}_${c}`, videoId: /^\d+$/.test(m.videoId) ? m.videoId + c : s(m.videoId) })); }
  if (t === "signals") { r.id = s(r.id); r.videoId = /^\d+$/.test(r.videoId) ? r.videoId + c : s(r.videoId); r.authorHandle = `${r.authorHandle}_${c}`; if (r.appId) r.appId = s(r.appId); if (r.trackedAccountId) r.trackedAccountId = s(r.trackedAccountId); }
  return r;
}
globalThis.fetch = async (url) => {
  const u = new URL(url); const t = u.searchParams.get("table"); const i = Number(u.searchParams.get("cursor") || 0);
  const body = JSON.parse(lineOf(t, i)); const rows = [];
  for (let c = 0; c < N; c++) for (const r of body.rows) rows.push(grow(t, r, c));
  // Le curseur du banc : le numéro de la page suivante.
  return new Response(JSON.stringify({ rows, cursor: String(i + 1), done: i + 1 >= idx[t].length }), { status: 200 });
};
// Tables Swarm.
const pagesOf = (fn) => fs.readFileSync(`${S}store/${fn}.jsonl`, "utf8").trim().split("\n");
const storePages = {}; for (const fn of ["mediaPage", "regionPage", "slidePage", "videoAiPage", "genderPage", "missPage", "langPage"]) storePages[fn] = pagesOf(fn);
const appStoreMap = JSON.parse(fs.readFileSync(`${S}store/appStoreMap.json`, "utf8"));
const prev = fs.existsSync(HASHES) ? Object.entries(JSON.parse(fs.readFileSync(HASHES, "utf8"))) : [];
const saved = new Map(prev);
const nameOf = (r) => r.__path.split(":").slice(-2).join(":");
const DUMP = new Set((process.env.BENCH_DUMP || "").split(",")), dumped = {};
let mutBytes = 0, mutCalls = 0;
const ctx = {
  runQuery: async (r, a) => {
    const fn = nameOf(r).split(":")[1];
    if (fn === "appStoreMap") return structuredClone(appStoreMap);
    if (fn === "boardKeys") { const i = Number(a.cursor || 0), sl = prev.slice(i, i + 500); return { keys: sl.map((x) => x[0]), hashes: sl.map((x) => x[1]), cursor: String(i + 500), done: i + 500 >= prev.length }; }
    if (storePages[fn]) { const i = Number(a.cursor || 0); const p = JSON.parse(storePages[fn][i]); return { ...p, cursor: String(i + 1), done: i + 1 >= storePages[fn].length }; }
    throw new Error("requête inconnue " + fn);
  },
  runMutation: async (r, a) => {
    const fn = nameOf(r).split(":")[1];
    const s = JSON.stringify(a); mutBytes += s.length; mutCalls++; // comme Convex : les arguments sont mis en texte
    if (fn === "startRun") return "run1";
    if (fn === "saveBoards") { for (const it of a.items) { saved.set(it.key, it.hash); if (DUMP.has(it.key)) dumped[it.key] = it.data; } return a.items.length; }
    if (fn === "dropBoards") { for (const k of a.keys) saved.delete(k); return null; }
    if (fn === "endRun") { console.log("[banc] endRun", JSON.stringify(a.counts)); return null; }
    return null;
  },
  scheduler: { runAfter: async () => null },
};
process.env.JARVIA_EXPORT_SECRET = "banc";
process.env.CONVEX_SITE_URL = "https://blessed-hedgehog-69.convex.site";
process.env.SWARM_MEM_STOP_MB = process.env.SWARM_MEM_STOP_MB || "100000";
const { run } = await import(BUNDLE);
const t0 = Date.now();
try { const res = await run.handler(ctx, {}); console.log("[banc] résultat", JSON.stringify(res)); }
catch (e) { console.log("[banc] erreur", String(e).slice(0, 300)); }
sample();
if (process.env.BENCH_DUMP) fs.writeFileSync(`${S}dump-${TAG}.json`, JSON.stringify(dumped, null, 1));
fs.writeFileSync(HASHES, JSON.stringify(Object.fromEntries(saved)));
console.log(`[banc] ×${N} pic rss=${Math.round(peak.rss / 1e6)} tas=${Math.round(peak.heap / 1e6)} tasTotal=${Math.round(peak.total / 1e6)} Mo | ${Math.round((Date.now() - t0) / 1000)} s | mutations ${mutCalls} (${Math.round(mutBytes / 1e6)} Mo) | pages gardées ${saved.size}`);
process.exit(0);
