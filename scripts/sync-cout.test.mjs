// Coût Convex de la synchro (audit du 19/11 : F5, F12, F19, et la synchro qui tournait aussi sur le dev). Les vraies
// fonctions de convex/ (empaquetées par esbuild, Convex remplacé par des doublures), sur une base en mémoire.
//   1. Les lectures de fond (IA, carrousels, pays) ne relancent jamais la synchro : seul le cron de nuit la lance.
//   2. SWARM_SYNC_OFF=1 (le dev) : les tâches planifiées ne font rien ; une synchro lancée à la main passe.
//   3. La copie des miniatures a son propre rythme : une action qui manque de temps relance la suite elle-même.
//   4. Les empreintes et les clés des pages se lisent dans boardMeta (≈ 100 o par page), jamais dans boards (≈ 1,6 Ko).
// Usage : npm run test:sync   (ou node scripts/sync-cout.test.mjs <dossier convex>, pour la contre-épreuve)
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dir = path.resolve(process.argv[2] ?? path.join(root, "convex"));
const { build } = await import(path.join(root, "node_modules/esbuild/lib/main.js"));
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "kopycat-sync-"));

// Doublures : fonctions Convex = leur définition ({ args, handler }) ; `internal.x.y` = { __path: "x.y" } ; copie d'image
// confiée au test (globalThis.__copyImage).
const STUB = `
export const internalAction = (c) => c, internalQuery = (c) => c, internalMutation = (c) => c;
export const action = (c) => c, query = (c) => c, mutation = (c) => c, httpAction = (f) => f;
const ref = (p) => new Proxy({}, { get: (_t, k) => (k === "__path" ? p.join(".") : ref([...p, String(k)])) });
export const internal = ref([]), api = ref([]);
export const appStoreHit = async () => null, appStoreLookup = async () => null, shrink = async () => null;
export const copyImage = (...a) => globalThis.__copyImage(...a);
`;
async function load(name) {
  const src = path.join(dir, `${name}.ts`);
  if (!fs.existsSync(src)) return null;
  const out = path.join(tmp, `${name}.mjs`);
  await build({
    entryPoints: [src], bundle: true, platform: "node", format: "esm", target: "node20", outfile: out, logLevel: "error",
    external: ["sharp", "heic-convert"], nodePaths: [path.join(root, "node_modules")],
    plugins: [{ name: "stubs", setup(b) {
      b.onResolve({ filter: /(_generated\/(server|api)|\/imageCopy)$/ }, () => ({ path: "stub", namespace: "stub" }));
      b.onLoad({ filter: /.*/, namespace: "stub" }, () => ({ contents: STUB, loader: "js" }));
    } }],
  });
  return import(out);
}

let fail = 0;
const ok = (cond, msg) => { console.log((cond ? "OK   " : "ÉCHEC") + " " + msg); if (!cond) fail++; };
const quiet = async (f) => { const log = console.log, err = console.error; console.log = console.error = () => {}; try { return await f(); } finally { console.log = log; console.error = err; } };

/** Un contexte d'action : réponses par nom de fonction, et trace de ce qui est appelé et planifié. */
function actionCtx(answers) {
  const calls = [], scheduled = [];
  const answer = (r, a) => { const fn = r.__path.split(".").pop(); calls.push(fn); const x = answers[fn]; return typeof x === "function" ? x(a) : x ?? null; };
  return { calls, scheduled, ctx: {
    runQuery: async (r, a) => answer(r, a), runMutation: async (r, a) => answer(r, a), runAction: async (r, a) => answer(r, a),
    scheduler: { runAfter: async (_ms, r, a) => { scheduled.push([r.__path, a]); return null; } },
    storage: { store: async () => "s1", get: async () => null, delete: async () => {}, getUrl: async () => "https://x" },
  } };
}

// Page publique TikTok d'une vidéo : un carrousel de 2 photos créé en France.
const tiktokPage = `<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application/json">${JSON.stringify({ __DEFAULT_SCOPE__: { "webapp.video-detail": { statusCode: 0, itemInfo: { itemStruct: { id: "7000000000000000001", locationCreated: "FR", imagePost: { images: [{}, {}] } } } } } })}</script>`;
globalThis.fetch = async () => new Response(tiktokPage, { status: 200, headers: { "content-type": "text/html" } });
process.env.ANTHROPIC_API_KEY = "test";
process.env.CONVEX_SITE_URL = "https://test.convex.site";
process.env.JARVIA_EXPORT_SECRET = "test";

const ai = await load("radarAi"), slides = await load("radarSlides"), regions = await load("radarRegions"), sync = await load("radarSync");
const store = await load("radarStore");
// Toutes les questions « faut-il une synchro ? » répondent oui : avant le 20/11, c'est ce qui relançait la synchro.
const yes = { aiNeedSync: true, slidesNeedSync: true, regionsNeedSync: true, takeLease: true };
const relaunched = (s) => s.some(([p]) => p === "radarSync.run");

// ─── 1. Aucune relance de la synchro par les lectures de fond ─────────────────────────────────────────────────────
{
  let t = actionCtx({ ...yes, claimVideoAi: [] });
  await quiet(() => ai.fillVideos.handler(t.ctx, {}));
  ok(!relaunched(t.scheduled), "lecture IA des vidéos, file vide : ne relance pas la synchro");
  t = actionCtx({ ...yes, claimVideoAi: ["7000000000000000001"], coverLookup: { url: null, handle: null }, aiLeft: false });
  await quiet(() => ai.fillVideos.handler(t.ctx, {}));
  ok(t.calls.includes("saveVideoAi") && !relaunched(t.scheduled), "lecture IA des vidéos, dernier lot : ne relance pas la synchro");
  t = actionCtx({ ...yes, claimGender: [] });
  await quiet(() => ai.fillGender.handler(t.ctx, {}));
  ok(!relaunched(t.scheduled), "lecture IA du genre, file vide : ne relance pas la synchro");
  t = actionCtx({ ...yes, claimGender: [{ handle: "x", ids: [] }], avatarLookup: { known: false, url: null }, aiLeft: false });
  await quiet(() => ai.fillGender.handler(t.ctx, {}));
  ok(t.calls.includes("saveGender") && !relaunched(t.scheduled), "lecture IA du genre, dernier lot : ne relance pas la synchro");
  t = actionCtx({ ...yes, claimSlides: [] });
  await quiet(() => slides.fill.handler(t.ctx, {}));
  ok(!relaunched(t.scheduled), "carrousels, file vide : ne relance pas la synchro");
  t = actionCtx({ ...yes, claimSlides: ["7000000000000000001"], slideLeft: false });
  await quiet(() => slides.fill.handler(t.ctx, {}));
  ok(t.calls.includes("saveSlides") && !relaunched(t.scheduled), "carrousels trouvés, plus rien à lire : ne relance pas la synchro");
  t = actionCtx({ ...yes, claimRegions: [] });
  await quiet(() => regions.fill.handler(t.ctx, {}));
  ok(!relaunched(t.scheduled), "pays, file vide : ne relance pas la synchro");
  t = actionCtx({ ...yes, claimRegions: [{ handle: "x", ids: ["7000000000000000001"], tries: 0 }], regionBatch: [] });
  await quiet(() => regions.fill.handler(t.ctx, {}));
  ok(t.calls.includes("saveRegions") && !relaunched(t.scheduled), "pays trouvés, plus rien à lire : ne relance pas la synchro");
  // Le code tout entier : seul le cron planifie radarSync.run.
  const refs = fs.readdirSync(dir).filter((f) => f.endsWith(".ts")).filter((f) => /internal\.radarSync\.run\b/.test(fs.readFileSync(path.join(dir, f), "utf8")));
  ok(refs.join() === "crons.ts", `seul crons.ts lance la synchro (trouvé dans : ${refs.join(", ")})`);
}

// ─── 2. Le dev ne fait plus tourner la synchro ni les lectures de fond ───────────────────────────────────────────
{
  process.env.SWARM_SYNC_OFF = "1";
  const cron = [["synchro", () => sync.run], ["lecture IA des vidéos", () => ai.fillVideos], ["lecture IA du genre", () => ai.fillGender], ["carrousels", () => slides.fill], ["pays", () => regions.fill]];
  for (const [label, fn] of cron) {
    const t = actionCtx({ ...yes, startRun: null, claimVideoAi: [], claimGender: [], claimSlides: [], claimRegions: [] });
    await quiet(() => fn().handler(t.ctx, {}));
    ok(t.calls.length === 0 && t.scheduled.length === 0, `SWARM_SYNC_OFF=1 : ${label} planifiée ne fait rien (${t.calls.join(", ") || "aucun appel"})`);
  }
  const t = actionCtx({ startRun: null });
  await quiet(() => sync.run.handler(t.ctx, { manual: true }));
  ok(t.calls.includes("startRun"), "SWARM_SYNC_OFF=1 : la synchro lancée à la main passe");
  delete process.env.SWARM_SYNC_OFF;
  const p = actionCtx({ startRun: null });
  await quiet(() => sync.run.handler(p.ctx, {}));
  ok(p.calls.includes("startRun"), "sans SWARM_SYNC_OFF (prod) : le cron lance la synchro");
}

// ─── 3. La copie des miniatures se relance elle-même jusqu'au bout ───────────────────────────────────────────────
{
  const realNow = Date.now;
  let clock = 1_800_000_000_000;
  Date.now = () => clock;
  globalThis.__copyImage = async (_ctx, key) => { clock += 1_000; return { key, storageId: "s", url: "https://x/" + key }; }; // 1 s par image
  const items = Array.from({ length: 1000 }, (_, i) => ({ key: `v:${7000000000000000000 + i}`, src: `ttpage:x/${i}` }));
  const t = actionCtx({ takeLease: true });
  const r = await quiet(() => sync.copyMedia.handler(t.ctx, { items }));
  Date.now = realNow;
  const next = t.scheduled.find(([p]) => p === "radarSync.copyMedia");
  const rest = next?.[1]?.items ?? [];
  ok(r.copied > 0 && r.copied < 1000, `une action copie ce que son temps permet (${r.copied} sur 1 000)`);
  ok(!!next && r.copied + rest.length === 1000 && rest[0]?.key === items[r.copied].key, `le reste (${rest.length}) part dans l'action suivante, sans attendre la synchro du lendemain`);
  // La liste de la synchro (~9 000 par jour, plus que les 8 192 éléments d'une liste Convex) arrive dans un fichier.
  const big = Array.from({ length: 9000 }, (_, i) => ({ key: `v:${7100000000000000000 + i}`, src: `ttpage:x/${i}` }));
  let deleted = null, step = 0, done = 0, from = 0;
  for (; step < 100; step++) {
    clock = 1_800_000_000_000;
    Date.now = () => clock;
    const f = actionCtx({ takeLease: true });
    f.ctx.storage.get = async (id) => (id === "liste" && !deleted ? new Blob([JSON.stringify(big)]) : null);
    f.ctx.storage.delete = async (id) => { deleted = id; };
    const res = await quiet(() => sync.copyMedia.handler(f.ctx, { file: "liste", from }));
    Date.now = realNow;
    done += res.copied;
    const n = f.scheduled.find(([p]) => p === "radarSync.copyMedia");
    if (!n) break;
    from = n[1].from;
    if (n[1].file !== "liste" || from !== done) break;
  }
  ok(done === 9000 && deleted === "liste", `liste de 9 000 en fichier : copiée en entier en ${step + 1} actions, fichier effacé à la fin (${done} copiées)`);
}

// ─── 4. Empreintes et clés des pages sans relire les pages ──────────────────────────────────────────────────────
/** Une base Convex en mémoire, qui compte les octets lus par table. */
function memDb() {
  const tables = {}, read = {};
  let next = 1;
  const rows = (t) => (tables[t] ??= []);
  const count = (t, d) => { read[t] = (read[t] ?? 0) + JSON.stringify(d).length; return d; };
  const find = (id) => { const t = id.split("|")[0]; return [t, rows(t).findIndex((d) => d._id === id)]; };
  const query = (t) => {
    let conds = [], desc = false;
    const all = () => { const r = rows(t).filter((d) => conds.every((c) => c(d))); return desc ? r.slice().reverse() : r; };
    const api = {
      withIndex: (_i, f) => { const b = { eq: (k, x) => (conds.push((d) => d[k] === x), b), gt: (k, x) => (conds.push((d) => d[k] > x), b), lt: (k, x) => (conds.push((d) => d[k] < x), b) }; if (f) f(b); return api; },
      order: (o) => { desc = o === "desc"; return api; },
      first: async () => { const d = all()[0]; return d ? count(t, d) : null; },
      take: async (n) => all().slice(0, n).map((d) => count(t, d)),
      collect: async () => all().map((d) => count(t, d)),
      paginate: async ({ cursor, numItems }) => { const a = all(), i = Number(cursor || 0); return { page: a.slice(i, i + numItems).map((d) => count(t, d)), continueCursor: String(i + numItems), isDone: i + numItems >= a.length }; },
    };
    return api;
  };
  const db = {
    query, get: async (id) => { const [t, i] = find(id); return i < 0 ? null : count(t, rows(t)[i]); },
    insert: async (t, d) => { const _id = `${t}|${next++}`; rows(t).push({ _id, ...d }); return _id; },
    patch: async (id, p) => { const [t, i] = find(id); Object.assign(rows(t)[i], p); },
    delete: async (id) => { const [t, i] = find(id); rows(t).splice(i, 1); },
  };
  return { tables, read, ctx: { db, storage: { delete: async () => {} } } };
}
{
  const big = (n) => ({ videos: Array.from({ length: 400 }, (_, i) => ({ id: String(i), caption: "x".repeat(100) + n })) }); // ≈ 50 Ko
  const m = memDb();
  const items = ["app:a", "app:b", "creator:c"].map((key, i) => ({ key, hash: "h" + i, data: big(i) }));
  await store.saveBoards.handler(m.ctx, { items, now: 1 });
  for (const k of Object.keys(m.read)) delete m.read[k];
  const hashes = await store.boardHashes.handler(m.ctx, { keys: ["app:a", "app:b", "creator:c", "app:zz"] });
  ok(hashes.join() === "h0,h1,h2,", "boardHashes rend l'empreinte rangée de chaque page (null si absente)");
  const keys = [];
  for (let cursor = null, done = false; !done; ) { const p = await store.boardKeys.handler(m.ctx, { cursor }); keys.push(...p.keys); cursor = p.cursor; done = p.done; }
  ok(keys.sort().join() === "app:a,app:b,creator:c", "boardKeys rend toutes les clés");
  ok(!m.read.boards, `boardHashes et boardKeys ne lisent pas les pages (${m.read.boards ?? 0} o lus dans boards, ${m.read.boardMeta ?? 0} dans boardMeta)`);
  // Une page changée : réécrite, empreinte suivie ; une page inchangée : rien n'est écrit.
  const n = await store.saveBoards.handler(m.ctx, { items: [{ key: "app:a", hash: "h9", data: big(9) }, { key: "app:b", hash: "h1", data: big(1) }], now: 2 });
  ok(n === 1 && (await store.boardHashes.handler(m.ctx, { keys: ["app:a"] }))[0] === "h9", "une page changée est réécrite et son empreinte suit ; une page inchangée ne l'est pas");
  // Une page effacée : plus de clé ni d'empreinte.
  await store.dropBoards.handler(m.ctx, { keys: ["app:b"] });
  const after = await store.boardKeys.handler(m.ctx, { cursor: null });
  ok(!after.keys.includes("app:b") && (await store.boardHashes.handler(m.ctx, { keys: ["app:b"] }))[0] === null && !(m.tables.boards ?? []).some((d) => d.key === "app:b"), "dropBoards efface la page, sa clé et son empreinte");
  // Pages rangées avant boardMeta : la migration recopie leurs empreintes, sans toucher aux pages.
  const old = memDb();
  for (const [i, key] of ["app:a", "app:b"].entries()) await old.ctx.db.insert("boards", { key, data: big(i), hash: "h" + i, updatedAt: 5 });
  ok(typeof store.backfillBoardMeta?.handler === "function", "migration backfillBoardMeta présente");
  if (store.backfillBoardMeta) {
    for (let cursor = null, done = false; !done; ) { const p = await store.backfillBoardMeta.handler(old.ctx, { cursor }); cursor = p.cursor; done = p.done; }
    ok((await store.boardHashes.handler(old.ctx, { keys: ["app:a", "app:b"] })).join() === "h0,h1", "après la migration, les empreintes des anciennes pages sont lues dans boardMeta");
  }
  // Page rangée avant boardMeta, migration pas encore passée : même empreinte → la page n'est pas réécrite, l'empreinte est rangée.
  const pre = memDb();
  await pre.ctx.db.insert("boards", { key: "app:a", data: big(0), hash: "h0", updatedAt: 5 });
  const w = await store.saveBoards.handler(pre.ctx, { items: [{ key: "app:a", hash: "h0", data: big(0) }], now: 6 });
  ok(w === 0 && pre.tables.boards[0].updatedAt === 5 && (await store.boardHashes.handler(pre.ctx, { keys: ["app:a"] }))[0] === "h0", "sans empreinte rangée, une page inchangée n'est pas réécrite et son empreinte est rangée");
}

// ─── Q7 (audit du 19/11) : une grosse page rangée en morceaux ne coupe jamais un émoji en deux ───
{
  const m = memDb();
  const text = "a".repeat(store.PART_CHARS - 1) + "😀" + "b".repeat(10) + "é".repeat(store.PART_CHARS) + "🎉";
  await store.saveBoards.handler(m.ctx, { items: [{ key: "apps", hash: "h", text }], now: 1 });
  const parts = (m.tables.boardParts ?? []).slice().sort((p, q) => p.i - q.i);
  const whole = parts.map((p) => p.text).join("");
  ok(parts.length >= 2 && parts.every((p) => p.text.isWellFormed()), `Q7 : chaque morceau est un texte valide, sans demi-émoji (${parts.map((p) => p.text.isWellFormed()).join(", ")})`);
  ok(whole === text && (m.tables.boards ?? [])[0]?.parts === parts.length, "Q7 : les morceaux recollés redonnent la page, et leur nombre est rangé");
}

// ─── F2 (audit du 19/11) : plus personne ne lit « hidden » (boards.get, F14) : plus personne ne l'écrit ───
{
  const m = memDb();
  await store.markMiss.handler(m.ctx, { key: "v:7000000000000000001" });
  await store.markMisses.handler(m.ctx, { keys: ["v:7000000000000000002", "a:compte"] });
  await store.saveMedia.handler({ ...m.ctx, storage: { delete: async () => {} } }, { items: [{ key: "v:7000000000000000001", storageId: "s1", url: "https://x" }] });
  ok(!(m.tables.hidden ?? []).length && !m.read.hidden, `F2 : copie et échecs de miniatures n'écrivent ni ne lisent plus le document unique hidden (${(m.tables.hidden ?? []).length} écrit, ${m.read.hidden ?? 0} o lus)`);
  ok((m.tables.mediaMiss ?? []).some((x) => x.key === "v:7000000000000000002") && !(m.tables.mediaMiss ?? []).some((x) => x.key === "v:7000000000000000001"), "F2 : les échecs restent notés dans mediaMiss (seule source de « introuvable »)");
  const readers = fs.readdirSync(dir).filter((f) => f.endsWith(".ts") && f !== "schema.ts" && /query\("hidden"\)/.test(fs.readFileSync(path.join(dir, f), "utf8")));
  ok(!readers.length, `F2 : aucun module ne lit ni n'écrit hidden (${readers.join(", ") || "aucun"})`);
}

// ─── Q16 (audit du 19/11) : « pas encore de miniature » chez TikTok n'est pas un échec : la vidéo n'est pas cachée ───
{
  const t = actionCtx({ takeLease: true });
  globalThis.__copyImage = async (_ctx, _key, _src, report) => { report.blank = true; return null; };
  await quiet(() => sync.copyMedia.handler(t.ctx, { items: [{ key: "v:7000000000000000009", src: "ttpage:x/7000000000000000009" }] }));
  ok(!t.calls.includes("markMisses"), `Q16 : une vidéo TikTok sans miniature encore n'est pas notée introuvable (${t.calls.join(", ") || "aucun appel"})`);
  globalThis.__copyImage = async (_ctx, _key, _src, report) => { report.gone = true; return null; };
  const g = actionCtx({ takeLease: true });
  await quiet(() => sync.copyMedia.handler(g.ctx, { items: [{ key: "v:7000000000000000010", src: "ttpage:x/7000000000000000010" }] }));
  ok(g.calls.includes("markMisses"), "Q16 : une vidéo que TikTok dit disparue l'est toujours");
}

// ─── F24 (audit du 19/11) : une seule chaîne de lecture de pages TikTok à la fois, la copie des miniatures d'abord ───
{
  const leases = (t) => t.answers.filter(([fn]) => fn === "takeLease").map(([, a]) => a);
  const ctxL = (answers) => { const t = actionCtx(answers); t.answers = []; const run = t.ctx.runMutation; t.ctx.runMutation = async (r, a) => { t.answers.push([r.__path.split(".").pop(), a]); return run(r, a); }; return t; };
  // Pays : un bail, et rien de lu s'il est refusé (synchro en cours, ou une autre chaîne de pages TikTok).
  let t = ctxL({ takeLease: false, claimRegions: [{ handle: "x", ids: ["7000000000000000001"], tries: 0 }], regionBatch: [] });
  await quiet(() => regions.fill.handler(t.ctx, {}));
  ok(leases(t).length === 1 && !t.calls.includes("claimRegions") && !t.calls.includes("saveRegions"), `pays : bail refusé, rien n'est lu (${t.calls.join(", ")})`);
  t = ctxL({ takeLease: true, claimRegions: [{ handle: "x", ids: ["7000000000000000001"], tries: 0 }], regionBatch: [] });
  await quiet(() => regions.fill.handler(t.ctx, {}));
  ok(t.calls.includes("saveRegions") && t.calls.includes("dropLease"), "pays : bail pris, puis rendu en fin de chaîne");
  const sl = ctxL({ takeLease: false, claimSlides: ["7000000000000000001"] });
  await quiet(() => slides.fill.handler(sl.ctx, {}));
  const names = new Set([...leases(t), ...leases(sl)].map((a) => a.name));
  ok(names.size === 1 && leases(t).length > 0 && !sl.calls.includes("claimSlides"), `pays et carrousels : le même bail (${[...names].join(", ")})`);
  // Copie : le même bail, pris en priorité ; refusé (synchro en cours), la liste reprend plus tard sans rien copier.
  globalThis.__copyImage = async (_c, key) => ({ key, storageId: "s", url: "https://x/" + key });
  const c = ctxL({ takeLease: false });
  const r = await quiet(() => sync.copyMedia.handler(c.ctx, { items: [{ key: "v:7000000000000000001", src: "ttpage:x/1" }] }));
  const again = c.scheduled.find(([p]) => p === "radarSync.copyMedia");
  ok(leases(c)[0]?.name === [...names][0] && leases(c)[0]?.steal === true, `copie des miniatures : même bail, pris en priorité (${JSON.stringify(leases(c)[0] ?? null)})`);
  ok(r.copied === 0 && again?.[1]?.items?.length === 1, "copie des miniatures : bail refusé, rien de copié, la liste reprend plus tard");
  // Départs après la synchro : la copie tout de suite, les autres lectures plus tard.
  const all = fs.readFileSync(path.join(dir, "radarSync.ts"), "utf8"), src = all.slice(all.indexOf("export const runGlobal"));
  const after = (fn) => Number((src.match(new RegExp(`runAfter\\(([^,]+), internal\\.${fn},`)) ?? [])[1]?.replace(/_/g, "").replace(/\s/g, "").split("*").reduce((a, b) => a * Number(b), 1) ?? NaN);
  ok(after("radarSync.copyMedia") === 0 && ["radarRegions.fill", "radarSlides.fill", "radarAi.fillVideos", "radarAi.fillGender"].every((f) => after(f) > 0),
    `fin de synchro : la copie part seule, pays, carrousels et lecture IA plus tard (${["radarRegions.fill", "radarSlides.fill", "radarAi.fillVideos"].map((f) => `${f} ${after(f)} ms`).join(", ")})`);
}

// ─── Images rangées : copies simultanées (Q61), fichiers non matriciels (S30), relevé et réparation (Q67), icône
// toxique (S33), lot refusé (Q62) ───
{
  const FILES = { ok1: { contentType: "image/webp", size: 2000 }, ok2: { contentType: "image/webp", size: 2100 }, svg: { contentType: "image/svg+xml", size: 300 },
    heic: { contentType: "image/heic", size: 9000 }, png: { contentType: "image/png", size: 500 } };
  const withFiles = (m) => { const deleted = []; m.ctx.db.system = { get: async (id) => FILES[id] ?? null }; m.ctx.storage = { delete: async (id) => { deleted.push(id); } }; return deleted; };
  // Q61 : la seconde copie d'une miniature déjà rangée est effacée, la première gardée, et son adresse rendue.
  const m = memDb(), deleted = withFiles(m);
  await store.saveMedia.handler(m.ctx, { items: [{ key: "v:7000000000000000001", storageId: "ok1", url: "https://u/1" }] });
  const r = await store.saveMedia.handler(m.ctx, { items: [{ key: "v:7000000000000000001", storageId: "ok2", url: "https://u/2" }] });
  const row = (m.tables.media ?? []).find((x) => x.key === "v:7000000000000000001");
  ok(row?.storageId === "ok1" && deleted.join() === "ok2" && r?.[0]?.url === "https://u/1", `Q61 : copie simultanée, la première gardée, la seconde effacée, l'adresse gardée rendue (rangée ${row?.storageId}, effacés ${deleted.join() || "aucun"}, rendue ${r?.[0]?.url})`);
  // Une copie rangée inutilisable (HEIC, SVG) est remplacée.
  await m.ctx.db.insert("media", { key: "icon:svg", storageId: "svg", url: "https://u/svg", at: 1 });
  await store.saveMedia.handler(m.ctx, { items: [{ key: "icon:svg", storageId: "png", url: "https://u/png" }] });
  ok((m.tables.media ?? []).find((x) => x.key === "icon:svg")?.storageId === "png" && deleted.includes("svg"), "Q61 : une copie rangée inutilisable (SVG) est remplacée, son fichier effacé");
  // S30 : un fichier rangé non matriciel ne se sert jamais (mediaGet, /cover, /avatar).
  const s30 = memDb(); withFiles(s30);
  for (const [key, storageId] of [["icon:x", "svg"], ["v:7000000000000000002", "svg"], ["a:compte", "svg"], ["v:7000000000000000003", "heic"]]) await s30.ctx.db.insert("media", { key, storageId, url: "https://u/" + storageId, at: 1 });
  const g1 = await store.mediaGet.handler(s30.ctx, { key: "icon:x" }), g2 = await store.coverLookup.handler(s30.ctx, { id: "7000000000000000002" });
  const g3 = await store.avatarLookup.handler(s30.ctx, { handle: "compte" }), g4 = await store.mediaGet.handler(s30.ctx, { key: "v:7000000000000000003" });
  ok(g1?.url === null && !g1?.heic && g2?.url === null && g3?.url === null, `S30 : un SVG rangé ne se sert ni par mediaGet, ni par /cover, ni par /avatar (${[g1?.url, g2?.url, g3?.url].join(", ")})`);
  // Q67 : plus de conversion sur place (0 HEIC en prod le 20/11) : un HEIC rangé ne se sert pas, il est recopié.
  ok(g4?.url === null && !("heic" in (g4 ?? {})), `Q67 : un HEIC rangé ne se sert pas et n'est plus converti sur place (${JSON.stringify(g4)})`);
  ok(!/known\.heic|"image\/heic"/.test(fs.readFileSync(path.join(dir, "covers.ts"), "utf8")) && !/media\.heic/.test(fs.readFileSync(path.join(dir, "coverHttp.ts"), "utf8")),
    "Q67 : covers.ensure et /cover n'ont plus de branche HEIC");
  // Q67 / S30 : relevé des images et réparation sur demande.
  const audit = memDb(); withFiles(audit);
  for (const [key, storageId] of [["v:1", "ok1"], ["v:2", "heic"], ["icon:y", "svg"], ["v:3", "perdu"]]) await audit.ctx.db.insert("media", { key, storageId, url: "u", at: 1 });
  ok(typeof store.mediaAudit?.handler === "function", "Q67 : relevé des images rangées présent (mediaAudit)");
  if (store.mediaAudit) {
    const a = await store.mediaAudit.handler(audit.ctx, { cursor: null });
    ok(a.rows === 4 && a.heic === 1 && a.bad === 2 && a.unusable.sort().join() === "icon:y,v:2,v:3", `Q67 : relevé : 4 images, 1 HEIC, 2 non matricielles ou absentes (${JSON.stringify({ rows: a.rows, heic: a.heic, bad: a.bad })})`);
    const t = actionCtx({ mediaAudit: a });
    const rep = await quiet(() => sync.repairMedia.handler(t.ctx, {}));
    ok(rep.dropped === 0 && !t.calls.includes("dropMedia"), "Q67 : repairMedia sans apply ne fait que compter");
    const t2 = actionCtx({ mediaAudit: a });
    const rep2 = await quiet(() => sync.repairMedia.handler(t2.ctx, { apply: true }));
    ok(rep2.dropped === 3 && t2.calls.includes("dropMedia"), "Q67 : repairMedia apply efface les HEIC, SVG et fichiers absents");
  }
  ok(!fs.readdirSync(dir).filter((f) => f.endsWith(".ts")).some((f) => /heicPage|repairHeic\b/.test(fs.readFileSync(path.join(dir, f), "utf8").replace(/\/\*[\s\S]*?\*\//g, ""))), "Q67 : repairHeic et heicPage (jamais appelées) retirées");
  // S33 : une icône de site tiers est notée « en échec » avant d'être lue ; une icône de l'App Store, non.
  const order = [];
  globalThis.__copyImage = async (_c, key) => { order.push("copie " + key); return null; };
  const c = actionCtx({ takeLease: true });
  const mm = c.ctx.runMutation;
  c.ctx.runMutation = async (r2, a2) => { if (r2.__path.endsWith("markMisses")) order.push("note " + a2.keys.join("+")); return mm(r2, a2); };
  await quiet(() => sync.copyMedia.handler(c.ctx, { items: [{ key: "icon:site", src: "site:exemple.com" }, { key: "icon:store", src: "itunesid:123" }, { key: "icon:art", src: "https://is1-ssl.mzstatic.com/a.png" }] }));
  ok(order[0] === "note icon:site" && order.indexOf("copie icon:site") > 0, `S33 : l'icône d'un site tiers est notée avant d'être lue, pas celles de l'App Store (${order.join(" ; ")})`);
  const models = await load("radarModels");
  const raw = { apps: [{ id: "a1", slug: "theick", name: "The Ick", status: "active", trackedCount: 0, mergedInto: null, createdAt: 0 }], tracked: [], trackedVideos: [], formats: [], signals: [] };
  const needWith = (missing) => [...models.buildBoards(raw, 1_800_000_000_000, () => null, () => null, { missing }).need.keys()];
  ok(needWith(() => false).includes("icon:theick") && !needWith((k) => k === "icon:theick").includes("icon:theick"), "S33 : une icône en échec récent n'est pas redemandée par la synchro");
  // Q62 : un lot que saveMedia refuse : fichiers effacés, rien compté « copié », l'échec noté.
  globalThis.__copyImage = async (_c, key) => ({ key, storageId: "f-" + key, url: "https://x/" + key });
  const q = actionCtx({ takeLease: true, saveMedia: () => { throw new Error("conflit"); } });
  const gone = [];
  q.ctx.storage.delete = async (id) => { gone.push(id); };
  const realErr = console.error; let logged = "";
  const res = await quiet(async () => { console.error = (x) => { logged += x; }; try { return await sync.copyMedia.handler(q.ctx, { items: [{ key: "v:7000000000000000005", src: "https://p16.tiktokcdn.com/x.jpg" }] }); } finally { console.error = realErr; } });
  ok(res.copied === 0 && gone.includes("f-v:7000000000000000005"), `Q62 : lot refusé par saveMedia : fichier effacé, rien compté copié (${res.copied} copiées, effacés : ${gone.join() || "aucun"})`);
}

// ─── Préparation : fichiers d'étape (Q55), échéance (Q68), mémoire (Q70) ─────────────────────────────────────────
{
  const realFetch = globalThis.fetch, realNow = Date.now, realMem = process.memoryUsage;
  const exportPage = async () => new Response(JSON.stringify({ rows: [], cursor: "", done: true }), { status: 200, headers: { "content-type": "application/json" } });
  /** La préparation (run) sur un export vide : ce qu'elle range, efface, note et termine. */
  const prep = async ({ storeFails = 0, minutesPerExport = 0, heapMo = 100 } = {}) => {
    let clock = 1_800_000_000_000, stored = 0;
    Date.now = () => clock;
    globalThis.fetch = async () => { clock += minutesPerExport * 60_000; return exportPage(); };
    process.memoryUsage = () => ({ rss: (heapMo + 80) * 1e6, heapUsed: heapMo * 1e6, external: 0, arrayBuffers: 0, heapTotal: 0 });
    const t = actionCtx({ startRun: "run1", staleStages: [], appStorePage: { items: [], cursor: "", done: true } });
    t.args = [];
    const mut = t.ctx.runMutation;
    t.ctx.runMutation = async (r, a) => { t.args.push([r.__path.split(".").pop(), a]); return mut(r, a); };
    const deleted = [];
    t.ctx.storage.store = async () => { stored++; if (storeFails && stored === storeFails) throw new Error("stockage indisponible"); return "f" + stored; };
    t.ctx.storage.delete = async (id) => { deleted.push(id); };
    try { await quiet(() => sync.run.handler(t.ctx, {})); } catch { /* l'erreur remonte, comme en vrai */ }
    Date.now = realNow; globalThis.fetch = realFetch; process.memoryUsage = realMem;
    const stages = t.args.filter(([fn]) => fn === "setStage").map(([, a]) => a.stage);
    const end = t.args.find(([fn]) => fn === "endRun")?.[1];
    return { t, deleted, stages, end, noted: t.args.filter(([fn]) => fn === "stageAdd").flatMap(([, a]) => a.files) };
  };
  const q55 = await prep({ storeFails: 3 });
  ok(q55.deleted.sort().join() === "f1,f2", `Q55 : préparation qui échoue au 3e fichier : les 2 déjà rangés sont effacés (${q55.deleted.join() || "aucun"})`);
  const ok55 = await prep();
  ok(ok55.noted.length >= 5 && ok55.stages.length >= 2 && ok55.stages[0].globals && ok55.stages.at(-1).groups, `Q55 : l'étape est enregistrée avant les fichiers, chacun noté dès qu'il est rangé (${ok55.noted.length} notés, ${ok55.stages.length} enregistrements)`);
  const q68 = await prep({ minutesPerExport: 3 });
  ok(q68.end?.ok === false && /temps/.test(q68.end?.error ?? "") && !q68.stages.some((x) => x.groups && Array.isArray(x.groups) && x.outs && x.globals?.apps?.length), `Q68 : une préparation trop lente échoue proprement avant la coupure (${q68.end ? `${q68.end.ok} ${q68.end.error}` : "pas de fin notée"})`);
  const first = await prep({ heapMo: 300 }), second = await prep({ heapMo: 50 });
  const heapOf = (r) => r.stages.at(-1)?.heapPrep;
  ok(heapOf(first) === 300 && heapOf(second) === 50 && second.stages.at(-1)?.rssPrep === 130, `Q70 : pic de tas remis à zéro à chaque étape, RSS noté (1er ${heapOf(first)}, 2e ${heapOf(second)} Mo, RSS ${second.stages.at(-1)?.rssPrep})`);
  const src = fs.readFileSync(path.join(dir, "radarSync.ts"), "utf8");
  ok(/memStopMo/.test(src) && /rssMaxMo/.test(src), "Q70 : le seuil d'arrêt et le pic de RSS sont notés dans syncRuns.counts");
  // Écriture des pages : arrêtée à 6 min, pour laisser 3 min au reste de l'étape avant la coupure de 10 min.
  ok(typeof sync.writePages === "function", "Q68 : writePages éprouvable");
  if (sync.writePages) {
    let clock = 1_800_000_000_000;
    Date.now = () => (clock += 2_000); // 2 s par page
    const boards = new Map(Array.from({ length: 1000 }, (_, i) => [`video:${i}`, { i }]));
    const w = actionCtx({ boardHashes: (a) => a.keys.map(() => null), saveBoards: (a) => a.items.length });
    const start = clock;
    const res = await quiet(() => sync.writePages(w.ctx, boards, new Map(), 1, start));
    const minutes = (clock - start) / 60_000;
    Date.now = realNow;
    ok(res.stopped === "temps écoulé" && minutes <= 6.2, `Q68 : l'écriture des pages s'arrête à 6 min (${minutes.toFixed(1)} min, ${res.written} écrites)`);
  }
}

// ─── Q60 : une langue « inconnue » se recalcule ; Q56 : tables de suivi élaguées ; F30 : stockage relevé ──────────
{
  const now = 1_800_000_000_000, DAY = 86_400_000;
  ok(typeof sync.langKnown === "function", "Q60 : règle de la langue connue éprouvable");
  if (sync.langKnown) {
    const cases = [[["a", "", now - 8 * DAY], false], [["a", "", now - DAY], true], [["a", "fr", now - 90 * DAY], true], [["a", ""], true]];
    const bad = cases.filter(([row, want]) => sync.langKnown(row, now) !== want).map(([row]) => JSON.stringify(row));
    ok(!bad.length, `Q60 : langue inconnue depuis plus de 7 jours → recalculée ; connue, ou inconnue récente → gardée${bad.length ? ` ; faux pour ${bad.join(", ")}` : ""}`);
  }
  ok(typeof store.purgePage?.handler === "function", "Q56 : ménage des tables de suivi présent (purgePage)");
  if (store.purgePage) {
    const m = memDb();
    await m.ctx.db.insert("boardMeta", { key: "video:1", hash: "h" });
    await m.ctx.db.insert("boardMeta", { key: "app:y", hash: "h" });
    for (const [videoId, at] of [["1", now - 30 * DAY], ["2", now - 30 * DAY], ["3", now - DAY], ["6", 0]]) await m.ctx.db.insert("videoAi", { videoId, done: true, tries: 1, at });
    for (const [key, at] of [["v:4", now - 40 * DAY], ["v:5", now - 10 * DAY], ["a:parti", now - 40 * DAY], ["icon:y", now - 40 * DAY]]) await m.ctx.db.insert("mediaMiss", { key, at });
    for (const [startedAt, finishedAt] of [[now - 40 * DAY, now - 40 * DAY], [now - DAY, now - DAY], [now - 40 * DAY, undefined]]) await m.ctx.db.insert("syncRuns", { startedAt, ...(finishedAt ? { finishedAt } : {}) });
    for (const table of ["videoAi", "mediaMiss", "syncRuns"]) await store.purgePage.handler(m.ctx, { table, cursor: null, now });
    const left = (t, f) => (m.tables[t] ?? []).map(f).sort().join();
    ok(left("videoAi", (x) => x.videoId) === "1,3", `Q56 : lectures IA : gardées si la vidéo a sa page ou a été lue il y a moins de 7 jours (reste ${left("videoAi", (x) => x.videoId)})`);
    ok(left("mediaMiss", (x) => x.key) === "icon:y,v:5", `Q56 : échecs de copie : effacés après 30 jours sans page (reste ${left("mediaMiss", (x) => x.key)})`);
    ok((m.tables.syncRuns ?? []).length === 2, `Q56 : passages finis de plus de 30 jours effacés (reste ${(m.tables.syncRuns ?? []).length})`);
    // F30 : relevé du stockage, noté dans le compte rendu du passage.
    const t = actionCtx({ purgePage: { n: 0, dropped: 2, cursor: "", done: true }, mediaFilesPage: { ids: ["m1"], cursor: "", done: true },
      storagePage: { files: [["m1", 2000, "image/webp", Date.now() - 9 * DAY], ["o1", 1000, "image/webp", Date.now() - 9 * DAY], ["o2", 500, "image/webp", Date.now()], ["j1", 300, "application/json", Date.now() - DAY]], cursor: "", done: true } });
    t.noted = null;
    const mut = t.ctx.runMutation;
    t.ctx.runMutation = async (r, a) => { if (r.__path.endsWith("noteCounts")) t.noted = a.extra; return mut(r, a); };
    await quiet(() => store.purgeTracking.handler(t.ctx, { runId: "run1" }));
    const st = t.noted?.storage;
    ok(st?.files === 4 && st.images === 3 && st.orphanImages === 1 && st.stageFiles === 1 && st.mediaRows === 1 && t.noted?.purged?.videoAi === 2,
      `F30 : stockage relevé dans syncRuns.counts : fichiers, images, images sans ligne media, fichiers d'étape (${JSON.stringify(st ?? null)})`);
  }
  const g = fs.readFileSync(path.join(dir, "radarSync.ts"), "utf8");
  ok(/runAfter\([^)]*internal\.radarStore\.purgeTracking/.test(g.slice(g.indexOf("export const runGlobal"))) && /dropLangs/.test(g), "Q56 : la fin de passage lance le ménage et efface les langues des comptes sortis de l'export");
}

// ─── Q69 : lecture IA, client borné, résultats rangés au fil de l'eau, erreurs passagères sans essai compté ─────────
{
  // Le SDK Anthropic remplacé : options du client relevées, réponses écrites par le test.
  const FAKE = `
class APIError extends Error { constructor(status, m) { super(m ?? "api " + status); this.status = status; } }
class RateLimitError extends APIError { constructor() { super(429, "trop d'appels"); } }
class APIConnectionError extends APIError { constructor() { super(undefined, "réseau"); } }
export default class Anthropic {
  constructor(o) { globalThis.__aiOpts = o; this.messages = { parse: (a) => globalThis.__aiParse(a) }; }
  static APIError = APIError; static RateLimitError = RateLimitError; static APIConnectionError = APIConnectionError;
}
globalThis.__sdk = { APIError, RateLimitError };
export const jsonSchemaOutputFormat = (x) => x;`;
  const out = path.join(tmp, "radarAi-q69.mjs");
  await build({
    entryPoints: [path.join(dir, "radarAi.ts")], bundle: true, platform: "node", format: "esm", target: "node20", outfile: out, logLevel: "error", nodePaths: [path.join(root, "node_modules")],
    plugins: [{ name: "stubs", setup(b) {
      b.onResolve({ filter: /^@anthropic-ai\/sdk/ }, () => ({ path: "sdk", namespace: "sdk" }));
      b.onLoad({ filter: /.*/, namespace: "sdk" }, () => ({ contents: FAKE, loader: "js" }));
      b.onResolve({ filter: /(_generated\/(server|api)|\/imageCopy)$/ }, () => ({ path: "stub", namespace: "stub" }));
      b.onLoad({ filter: /.*/, namespace: "stub" }, () => ({ contents: STUB, loader: "js" }));
    } }],
  });
  const ai2 = await import(out);
  const realFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(new Uint8Array(2000), { status: 200, headers: { "content-type": "image/jpeg" } });
  const ids = Array.from({ length: 30 }, (_, i) => String(7300000000000000000n + BigInt(i)));
  let calls = 0;
  globalThis.__aiParse = async () => {
    const i = calls++;
    if (i % 3 === 0) throw new globalThis.__sdk.RateLimitError();
    if (i % 3 === 1) throw new globalThis.__sdk.APIError(529);
    return { usage: { input_tokens: 1, output_tokens: 1 }, stop_reason: "end_turn", parsed_output: { type: "autre", text: "x" } };
  };
  const t = actionCtx({ takeLease: true, claimVideoAi: ids, coverLookup: { url: "https://img.example/c.jpg", handle: null }, aiLeft: false });
  t.saves = [];
  const mut = t.ctx.runMutation;
  t.ctx.runMutation = async (r, a) => { if (r.__path.endsWith("saveVideoAi")) t.saves.push(a.items); return mut(r, a); };
  await quiet(() => ai2.fillVideos.handler(t.ctx, {}));
  globalThis.fetch = realFetch;
  const items = t.saves.flat();
  const retried = items.filter((x) => x.retry).length, okN = items.filter((x) => x.ok).length;
  ok(globalThis.__aiOpts?.timeout === 60_000 && globalThis.__aiOpts?.maxRetries === 1, `Q69 : client Anthropic à 60 s et une reprise (${JSON.stringify(globalThis.__aiOpts ?? {})})`);
  ok(t.saves.length >= 2 && t.saves.every((b) => b.length <= 25), `Q69 : résultats rangés par paquets de 25 au plus, au fil de l'eau (${t.saves.map((b) => b.length).join(" + ")})`);
  ok(items.length === 30 && retried === 20 && okN === 10, `Q69 : 429 et 529 repris sans essai compté (${retried} reprises, ${okN} lues, ${items.length - retried - okN} essais comptés)`);
}

// ─── F28 : la synchro écrit les adresses signées des miniatures et des photos, et marque la page ──────────────────
{
  process.env.COVER_SECRET = "secret-de-banc";
  const saved = [];
  const w = actionCtx({ boardHashes: (a) => a.keys.map(() => null), saveBoards: (a) => { saved.push(...a.items); return a.items.length; } });
  const page = { id: "7000000000000000001", handle: "auteur", fans: 12, cover: "https://p16.tiktokcdn.com/signee.jpg", videos: [{ id: "7000000000000000002", cover: null }] };
  const stats = { apps: 3, accounts: 9 };
  if (sync.writePages) await quiet(() => sync.writePages(w.ctx, new Map([["video:7000000000000000001", page], ["stats", stats]]), new Map(), 1, Date.now()));
  const v = saved.find((x) => x.key === "video:7000000000000000001")?.data, st = saved.find((x) => x.key === "stats")?.data;
  ok(/^https:\/\/test\.convex\.site\/cover\/7000000000000000001\?v=\d+&s=[0-9a-f]{24}$/.test(v?.cover ?? "") && /\/avatar\/auteur\?v=\d+&s=/.test(v?.avatar ?? "")
    && /\/cover\/7000000000000000002\?/.test(v?.videos?.[0]?.cover ?? "") && typeof v?._signed === "string",
    `F28 : la synchro écrit les adresses signées et marque la page (${v?.cover} ; ${v?._signed})`);
  ok(st && !("_signed" in st) && st.apps === 3, "F28 : une page sans image n'est pas marquée");
  delete process.env.COVER_SECRET;
}

fs.rmSync(tmp, { recursive: true, force: true });
console.log(fail ? `${fail} échec(s)` : "tout passe");
process.exit(fail ? 1 : 0);
