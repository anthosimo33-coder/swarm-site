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
  const t = actionCtx({});
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
    const f = actionCtx({});
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

fs.rmSync(tmp, { recursive: true, force: true });
console.log(fail ? `${fail} échec(s)` : "tout passe");
process.exit(fail ? 1 : 0);
