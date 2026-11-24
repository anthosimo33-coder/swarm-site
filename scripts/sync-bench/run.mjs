// Banc de la synchro du Radar (15/11) : la vraie synchro, chaque étape dans un processus Node NEUF (comme une action de
// prod, 512 Mo), Convex simulé (stockage, passages et empreintes des pages sur disque, file du planificateur rejouée).
//   node scripts/sync-bench/run.mjs <×N> [paquet.mjs] [étiquette]
// Export du Radar servi depuis .bench-data/export (lignes dupliquées ×N avec ids suffixés) ; filtre `apps` simulé comme
// Jarvia #532 (BENCH_FILTER=0 : export d'avant, qui l'ignore). Tables Swarm depuis .bench-data/store. Empreintes des pages
// dans .bench-data/hashes-<étiquette>-xN.json : un 2e passage part de là (« à l'équilibre ») ; deux versions se comparent
// page pour page en comparant leurs fichiers. BENCH_DUMP=clé1,clé2 garde le contenu de ces pages (dump-<étiquette>.json).
// Horloge figée (BENCH_T0) pour que deux versions calculent au même instant. Données : dump-export.mjs, dump-store.mjs.
// « [banc] lectures » : les lignes des tables d'état rendues à chaque étape, par requête (pages entières ou lectures ciblées).
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const S = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../.bench-data") + "/";

// ─── Orchestrateur : rejoue la file du planificateur, une étape par processus ────────────────────────────────────
if (process.argv[2] !== "--step") {
  const N = Number(process.argv[2] || 1);
  const BUNDLE = path.resolve(process.argv[3] ?? `${S}sync.bundle.mjs`), TAG = process.argv[4] ?? "neuf";
  const STATE = `${S}state-${TAG}-x${N}/`;
  fs.rmSync(STATE, { recursive: true, force: true });
  fs.mkdirSync(`${STATE}storage`, { recursive: true });
  fs.writeFileSync(`${STATE}queue.json`, JSON.stringify([["run", {}]]));
  const peaks = [];
  for (let step = 0; step < 200; step++) {
    const queue = JSON.parse(fs.readFileSync(`${STATE}queue.json`, "utf8"));
    if (!queue.length) break;
    const [fn, args] = queue.shift();
    fs.writeFileSync(`${STATE}queue.json`, JSON.stringify(queue));
    const r = spawnSync(process.execPath, ["--expose-gc", fileURLToPath(import.meta.url), "--step", fn, JSON.stringify(args), String(N), BUNDLE, TAG], { encoding: "utf8", maxBuffer: 1 << 28, env: process.env });
    const lines = (r.stdout + r.stderr).split("\n").filter((l) => /\[mem\]|\[banc\]|\[étape\]|rror/.test(l));
    for (const l of lines) console.log(`  ${fn}${args.i !== undefined ? " " + (args.i + 1) : ""} ${l.slice(0, 220)}`);
    const heaps = lines.flatMap((l) => [...l.matchAll(/(?:heap|tas)=(\d+)/g)].map((m) => Number(m[1])));
    peaks.push(`${fn}${args.i !== undefined ? args.i + 1 : ""}:${Math.max(0, ...heaps)}`);
  }
  const hashes = JSON.parse(fs.readFileSync(`${STATE}hashes.json`, "utf8"));
  fs.writeFileSync(`${S}hashes-${TAG}-x${N}.json`, JSON.stringify(hashes));
  if (fs.existsSync(`${STATE}limits.json`)) {
    const L = JSON.parse(fs.readFileSync(`${STATE}limits.json`, "utf8"));
    const pct = (v, max) => Math.round((100 * v) / max);
    console.log("[limites] type : pages | plus gros document (% de 1 Mio) | plus longue liste (% de 8 192) | imbrication (sur 16)");
    for (const [p, x] of Object.entries(L).sort((a, b) => b[1].bytes[0] - a[1].bytes[0]))
      console.log(`[limites] ${p} : ${x.n} | ${Math.round(x.bytes[0] / 1024)} Kio ${pct(x.bytes[0], 1048576)} % (${x.bytes[1]}) | ${x.arr[0]} ${pct(x.arr[0], 8192)} % (${x.arr[1]}) | ${x.depth[0]}`);
  }
  const left = fs.readdirSync(`${STATE}storage`).length;
  console.log(`[banc] ×${N} : ${Object.keys(hashes).length} pages | pic de tas par étape (Mo) ${peaks.join(" ")} | fichiers d'étape restants ${left}`);
  process.exit(0);
}

// ─── Une étape ───────────────────────────────────────────────────────────────────────────────────────────────────
const [, , , FN, ARGS, NS, BUNDLE, TAG] = process.argv;
const N = Number(NS), STATE = `${S}state-${TAG}-x${N}/`;
const BENCH_T0 = Number(process.env.BENCH_T0 || 1794780000000), p0 = performance.now(); Date.now = () => BENCH_T0 + Math.round(performance.now() - p0);
let peak = { rss: 0, heap: 0 };
const sample = () => { const m = process.memoryUsage(); peak.rss = Math.max(peak.rss, m.rss); peak.heap = Math.max(peak.heap, m.heapUsed); };
// L'écriture cadencée (3 Mo/s) et les attentes : immédiates au banc.
const origST = globalThis.setTimeout; globalThis.setTimeout = (f, ms, ...a) => origST(f, ms > 20 ? 0 : ms, ...a);
// Export : index des lignes, lu à la demande ; par app pour le filtre `apps` (fichier byApp.json : app → [table, page, ligne]).
const idx = {};
for (const t of ["apps", "tracked", "trackedVideos", "formats", "signals"]) {
  const buf = fs.readFileSync(`${S}export/${t}.jsonl`); const offs = [0];
  for (let i = 0; i < buf.length; i++) if (buf[i] === 10) offs.push(i + 1);
  idx[t] = offs.slice(0, -1).map((o, i) => [o, offs[i + 1] - 1]);
}
const fd = {}; for (const t in idx) fd[t] = fs.openSync(`${S}export/${t}.jsonl`, "r");
const lineOf = (t, i) => { const [a, b] = idx[t][i]; const B = Buffer.alloc(b - a); fs.readSync(fd[t], B, 0, b - a, a); return B.toString(); };
const BYAPP = `${S}export/byApp/`;
if (!fs.existsSync(BYAPP)) { // une fois : les vidéos de chaque app dans son fichier (comme l'index by_app du Radar)
  const m = {};
  for (let i = 0; i < idx.trackedVideos.length; i++) for (const r of JSON.parse(lineOf("trackedVideos", i)).rows) (m[r.appId] ??= []).push(r);
  fs.mkdirSync(BYAPP, { recursive: true });
  for (const [id, rows] of Object.entries(m)) fs.writeFileSync(`${BYAPP}${id}.json`, JSON.stringify(rows));
}
const sfx = (c) => (x) => (typeof x === "string" && c ? `${x}~${c}` : x);
function grow(t, row, c) {
  if (!c) return row;
  const s = sfx(c), r = structuredClone(row);
  if (t === "apps") { r.id = s(r.id); r.slug = `${r.slug}-${c}`; r.name = `${r.name} ${c}`; if (r.mergedInto) r.mergedInto = s(r.mergedInto); }
  if (t === "tracked") { r.id = s(r.id); r.appId = s(r.appId); r.handle = `${r.handle}_${c}`; if (r.igHandle) r.igHandle = `${r.igHandle}_${c}`; }
  if (t === "trackedVideos") { r.id = s(r.id); r.accountId = s(r.accountId); r.appId = s(r.appId); r.videoId = /^\d+$/.test(r.videoId) ? r.videoId + c : s(r.videoId); }
  if (t === "formats") { r.id = s(r.id); r.key = s(r.key); r.appIds = r.appIds.map(s); r.members = r.members.map((m) => ({ ...m, accountId: s(m.accountId), appId: s(m.appId), handle: `${m.handle}_${c}`, videoId: /^\d+$/.test(m.videoId) ? m.videoId + c : s(m.videoId) })); if (r.videos) r.videos = r.videos.map((v) => (/^\d+$/.test(v) ? v + c : s(v))); }
  if (t === "signals") { r.id = s(r.id); r.videoId = /^\d+$/.test(r.videoId) ? r.videoId + c : s(r.videoId); r.authorHandle = `${r.authorHandle}_${c}`; if (r.appId) r.appId = s(r.appId); if (r.trackedAccountId) r.trackedAccountId = s(r.trackedAccountId); }
  return r;
}
const FILTER = process.env.BENCH_FILTER !== "0";
let fetches = 0;
globalThis.fetch = async (url) => {
  fetches++;
  const u = new URL(url); const t = u.searchParams.get("table"); const apps = u.searchParams.get("apps");
  if (apps && FILTER && t === "trackedVideos") {
    // Comme Jarvia #532 : une page = une app (700 lignes au plus), curseur « app:ligne ».
    const list = apps.split(","); const [ai, off] = (u.searchParams.get("cursor") || "0:0").split(":").map(Number);
    const id = list[ai], m = id.match(/^(.*)~(\d+)$/), baseId = m ? m[1] : id, c = m ? Number(m[2]) : 0;
    const f = `${BYAPP}${baseId}.json`, all = fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : [];
    const rows = all.slice(off, off + 700).map((r) => grow(t, r, c));
    const more = off + 700 < all.length;
    const next = more ? `${ai}:${off + 700}` : `${ai + 1}:0`;
    return new Response(JSON.stringify({ rows, cursor: next, done: !more && ai + 1 >= list.length }), { status: 200 });
  }
  const i = Number(u.searchParams.get("cursor") || 0);
  const body = JSON.parse(lineOf(t, i)); const rows = [];
  for (let c = 0; c < N; c++) for (const r of body.rows) rows.push(grow(t, r, c));
  return new Response(JSON.stringify({ rows, cursor: String(i + 1), done: i + 1 >= idx[t].length }), { status: 200 });
};
// Tables Swarm, passages, empreintes, stockage.
const pagesOf = (fn) => fs.readFileSync(`${S}store/${fn}.jsonl`, "utf8").trim().split("\n");
const storePages = {}; for (const fn of ["mediaPage", "regionPage", "slidePage", "videoAiPage", "genderPage", "missPage", "langPage"]) storePages[fn] = pagesOf(fn);
const appStoreMap = JSON.parse(fs.readFileSync(`${S}store/appStoreMap.json`, "utf8"));
// Lignes des tables d'état lues par l'étape, par requête : [nombre, octets des éléments rendus] (« [banc] lectures »).
const FOR = { mediaFor: ["mediaPage", 2000], slidesFor: ["slidePage", 2000], videoAiFor: ["videoAiPage", 1000], gendersFor: ["genderPage", 2000], langsFor: ["langPage", 2000] };
const reads = {};
const lu = (fn, items) => { const r = (reads[fn] ??= [0, 0]); r[0] += items.length; r[1] += JSON.stringify(items).length; };
const HASHES = `${STATE}hashes.json`, RUNS = `${STATE}runs.json`;
const prevFile = `${S}hashes-${TAG}-x${N}.json`;
const saved = new Map(Object.entries(fs.existsSync(HASHES) ? JSON.parse(fs.readFileSync(HASHES, "utf8")) : fs.existsSync(prevFile) && FN === "run" ? JSON.parse(fs.readFileSync(prevFile, "utf8")) : {}));
const runs = fs.existsSync(RUNS) ? JSON.parse(fs.readFileSync(RUNS, "utf8")) : {};
const queue = JSON.parse(fs.readFileSync(`${STATE}queue.json`, "utf8"));
const nameOf = (r) => r.__path.split(":").slice(-2).join(":");
const DUMP = new Set((process.env.BENCH_DUMP || "").split(",")), dumped = fs.existsSync(`${S}dump-${TAG}.json`) && FN !== "run" ? JSON.parse(fs.readFileSync(`${S}dump-${TAG}.json`, "utf8")) : {};
let mutBytes = 0, nextId = fs.existsSync(`${STATE}next`) ? Number(fs.readFileSync(`${STATE}next`, "utf8")) : 1;
const LIMITS = process.env.BENCH_LIMITS ? (fs.existsSync(`${STATE}limits.json`) ? JSON.parse(fs.readFileSync(`${STATE}limits.json`, "utf8")) : {}) : null;
let keysCache = null, parts = 0;
// Comme Convex, pour toute valeur qui passe une frontière (retour de requête, arguments de mutation ou d'action planifiée) :
// 8 192 éléments par liste, 1 024 champs par objet, 64 niveaux, 16 Mio (5 Mio pour une action Node). Mêmes limites sur
// tous les plans : le 16/11, deux synchros de prod sont tombées sur la liste, puis sur les champs.
const checkValue = (x, where, maxBytes = 16 * 1048576) => {
  const walk = (v, d) => {
    if (d > 64) throw new Error(`${where} : imbrication de plus de 64 niveaux`);
    if (Array.isArray(v)) { if (v.length > 8192) throw new Error(`${where} : Array length is too long (${v.length} > maximum length 8192)`); for (const e of v) walk(e, d + 1); }
    else if (v && typeof v === "object") { const ks = Object.keys(v); if (ks.length > 1024) throw new Error(`${where} : Object has too many fields (${ks.length} > maximum number 1024)`); for (const k of ks) walk(v[k], d + 1); }
  };
  walk(x, 0);
  const size = JSON.stringify(x ?? null).length;
  if (size > maxBytes) throw new Error(`${where} : ${size} octets > ${maxBytes}`);
  return x;
}; // comme la vraie requête : une page à la fois, sans recopier toute la table à chaque appel
async function query(r, a) {
    sample();
    const fn = nameOf(r).split(":")[1];
    // Fiches App Store : autant que d'apps (×N, slugs suffixés comme l'export) ; l'ancienne forme (un objet) pour comparer.
    const storesN = () => Object.fromEntries(Array.from({ length: N }, (_, c) => Object.entries(appStoreMap).map(([slug, x]) => [c ? `${slug}-${c}` : slug, x])).flat());
    if (fn === "appStoreMap") return structuredClone(storesN());
    if (fn === "appStorePage") { const all = Object.entries(storesN()), i = Number(a.cursor || 0); return { items: all.slice(i, i + 2000).map(([slug, x]) => [slug, x.url, x.v ?? 1, x.art ?? null]), cursor: String(i + 2000), done: i + 2000 >= all.length }; }
    if (fn === "boardKeys") { const all = (keysCache ??= [...saved]), i = Number(a.cursor || 0), sl = all.slice(i, i + 500); return { keys: sl.map((x) => x[0]), hashes: sl.map((x) => x[1]), cursor: String(i + 500), done: i + 500 >= all.length }; }
    if (fn === "boardHashes") return a.keys.map((k) => saved.get(k) ?? null);
    if (fn === "getStage") return runs[a.id] && !runs[a.id].finishedAt ? runs[a.id].stage ?? null : null;
    if (fn === "staleStages") return [];
    if (fn === "lastOkStart") return null; // aucun passage réussi : la nuit est une nuit de synchro (convex/syncCadence.ts, #31)
    if (storePages[fn]) { const i = Number(a.cursor || 0); const p = JSON.parse(storePages[fn][i]); lu(fn, p.items); return { ...p, cursor: String(i + 1), done: i + 1 >= storePages[fn].length }; }
    // Lectures ciblées (21/11) : les éléments des mêmes pages, pour ces identifiants seulement, dans l'ordre des pages.
    if (FOR[fn]) {
      const [page, max] = FOR[fn];
      if (a.ids.length > max) throw new Error(`${fn} : ${a.ids.length} identifiants pour ${max} au plus`);
      // Sans index gardé en mémoire (il gonflerait le pic de l'étape mesuré par le banc) : les pages relues à chaque appel.
      const want = new Set(a.ids), got = new Map();
      for (const l of storePages[page]) for (const x of JSON.parse(l).items) if (want.has(x[0])) { if (!got.has(x[0])) got.set(x[0], []); got.get(x[0]).push(x); }
      const items = a.ids.flatMap((id) => got.get(id) ?? []);
      lu(fn, items);
      return items;
    }
    throw new Error("requête inconnue " + fn);
}
async function mutation(r, a) {
    sample();
    const fn = nameOf(r).split(":")[1];
    mutBytes += JSON.stringify(a).length; // comme Convex : les arguments sont mis en texte
    if (fn === "startRun") { const id = `run${Object.keys(runs).length + 1}`; runs[id] = { startedAt: Date.now() }; return id; }
    if (fn === "setStage") { runs[a.id].stage = a.stage; return null; }
    if (fn === "groupDone") { const st = runs[a.id].stage; st.outs[a.i] = a.out; st.tails ??= st.outs.map(() => null); st.tails[a.i] = a.tail; return null; }
    if (fn === "stepRetry") { const st = runs[a.id].stage; st.retries ??= {}; st.retries[a.step] = (st.retries[a.step] ?? 0) + 1; return st.retries[a.step]; }
    if (fn === "endRun") { Object.assign(runs[a.id], { finishedAt: Date.now(), ok: a.ok, counts: a.counts, error: a.error }); console.log(`[banc] fin ok=${a.ok} ${a.error ?? ""} ${JSON.stringify(a.counts ?? {})}`); return null; }
    if (fn === "saveBoards" || fn === "dropBoards") keysCache = null;
    if (fn === "saveBoards") {
      // Comme Convex : une liste de plus de 8 192 éléments est refusée (BENCH_ARRAY_MAX pour forcer un refus au banc).
      const max = Number(process.env.BENCH_ARRAY_MAX || 8192);
      const longest = (x) => (Array.isArray(x) ? Math.max(x.length, ...x.map(longest)) : x && typeof x === "object" ? Math.max(0, ...Object.values(x).map(longest)) : 0);
      for (const it of a.items) {
        if (it.text !== undefined) { parts += Math.ceil(it.text.length / 250_000); continue; } // rangée en morceaux
        const n = longest(it.data); if (n > max) throw new Error(`Invalid arguments for radarStore.js:saveBoards: Array length is too long (${n} > maximum length ${max})`);
        const size = JSON.stringify(it.data).length; if (size > 1_048_576) throw new Error(`Value is too large (${size} bytes > maximum size 1 MiB)`);
      }
      if (LIMITS) for (const it of a.items) {
        // Chaque page contre les limites de Convex (identiques sur tous les plans) : 1 Mio par document, 8 192 éléments par
        // liste, 16 niveaux d'imbrication.
        const p = it.key.split(":")[0].split("@")[0], bytes = it.text !== undefined ? 0 : JSON.stringify(it.data).length; // en morceaux : plus de limite
        const depth = (x) => (x && typeof x === "object" ? 1 + Math.max(0, ...Object.values(x).map(depth)) : 0);
        const longest2 = (x) => (Array.isArray(x) ? Math.max(x.length, ...x.map(longest2)) : x && typeof x === "object" ? Math.max(0, ...Object.values(x).map(longest2)) : 0);
        const L = (LIMITS[p] ??= { n: 0, bytes: [0, ""], arr: [0, ""], depth: [0, ""] });
        L.n++;
        if (bytes > L.bytes[0]) L.bytes = [bytes, it.key];
        const n = it.text !== undefined ? 0 : longest2(it.data); if (n > L.arr[0]) L.arr = [n, it.key];
        const d = depth(it.data) + 1; if (d > L.depth[0]) L.depth = [d, it.key];
      }
      for (const it of a.items) { saved.set(it.key, it.hash); if (DUMP.has(it.key)) dumped[it.key] = it.data; } return a.items.length; }
    if (fn === "dropBoards") { for (const k of a.keys) saved.delete(k); return []; } // comme la vraie : les clés restantes
    return null;
}
const ctx = {
  runQuery: async (r, a) => checkValue(await query(r, a), `${nameOf(r)} (retour)`),
  runMutation: async (r, a) => { checkValue(a, `${nameOf(r)} (arguments)`); return mutation(r, a); },
  storage: {
    store: async (blob) => { const id = `f${nextId++}`; fs.writeFileSync(`${STATE}storage/${id}`, Buffer.from(await blob.arrayBuffer())); return id; },
    get: async (id) => (fs.existsSync(`${STATE}storage/${id}`) ? new Blob([fs.readFileSync(`${STATE}storage/${id}`)]) : null),
    delete: async (id) => fs.rmSync(`${STATE}storage/${id}`, { force: true }),
  },
  scheduler: { runAfter: async (_ms, ref, args) => { checkValue(args, `${nameOf(ref)} (arguments d'action)`, 5 * 1048576); const fn = nameOf(ref); if (fn.startsWith("radarSync:") && fn !== "radarSync:copyMedia") queue.push([fn.split(":")[1], args]); return null; } },
};
process.env.JARVIA_EXPORT_SECRET = "banc";
process.env.CONVEX_SITE_URL = "https://blessed-hedgehog-69.convex.site";
// Seuil d'arrêt pour mémoire : celui de l'environnement, sans valeur forcée (audit Q70 : forcé à 100 000, l'arrêt et la
// reprise n'étaient jamais éprouvés). Pour les éprouver : SWARM_MEM_STOP_MB=250 node scripts/sync-bench/run.mjs …
const mod = await import(BUNDLE);
const t0 = Date.now();
try { const res = await mod[FN].handler(ctx, JSON.parse(ARGS)); if (res) console.log("[banc] résultat", JSON.stringify(res)); }
catch (e) { console.log("[banc] erreur", String(e).slice(0, 300)); }
sample();
fs.writeFileSync(HASHES, JSON.stringify(Object.fromEntries(saved)));
fs.writeFileSync(RUNS, JSON.stringify(runs));
fs.writeFileSync(`${STATE}next`, String(nextId));
if (LIMITS) fs.writeFileSync(`${STATE}limits.json`, JSON.stringify(LIMITS));
fs.writeFileSync(`${STATE}queue.json`, JSON.stringify(queue));
if (process.env.BENCH_DUMP) fs.writeFileSync(`${S}dump-${TAG}.json`, JSON.stringify(dumped, null, 1));
if (parts) console.log(`[banc] morceaux rangés : ${parts}`);
if (Object.keys(reads).length) console.log(`[banc] lectures ${JSON.stringify(reads)}`);
console.log(`[banc] pic rss=${Math.round(peak.rss / 1e6)} tas=${Math.round(peak.heap / 1e6)} Mo | ${Math.round((Date.now() - t0) / 1000)} s | export ${fetches} demandes | mutations ${Math.round(mutBytes / 1e6)} Mo`);
process.exit(0);
