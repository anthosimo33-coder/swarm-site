// Contre-épreuve du découpage par groupes (15/11) : buildBoards tout d'un coup, contre étapes « groupe » + étape
// globale, sur les mêmes données (.bench-data). Mêmes pages, mêmes empreintes, aucune page produite deux fois.
//   node scripts/sync-bench/parts.mjs [comptes par groupe]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const here = path.dirname(fileURLToPath(import.meta.url)), root = path.resolve(here, "../.."), D = path.join(root, ".bench-data");
const { build } = await import(path.join(root, "node_modules/esbuild/lib/main.js"));
const out = path.join(D, "models.bundle.mjs");
await build({ entryPoints: [path.join(root, "convex/radarModels.ts")], bundle: true, platform: "node", format: "esm", target: "node20", outfile: out, logLevel: "warning" });
const { buildBoards } = await import(out + "?" + Date.now());

const PER_GROUP = Number(process.argv[2] || 3000);
const now = 1794780000000;
const lines = (f) => fs.readFileSync(f, "utf8").trim().split("\n").map((l) => JSON.parse(l));
const rowsOf = (t) => lines(path.join(D, "export", `${t}.jsonl`)).flatMap((p) => p.rows);
const slimVideo = (r) => ({ accountId: r.accountId, appId: r.appId, platform: r.platform, videoId: r.videoId, publishedAt: r.publishedAt, views: r.views,
  snapshots: Array.isArray(r.snapshots) ? r.snapshots.slice(-12) : [], caption: r.caption, hook: r.hook, musicTitle: r.musicTitle, coverUrl: null, region: r.region, cites: r.cites });
const raw = { apps: rowsOf("apps"), tracked: rowsOf("tracked"), trackedVideos: rowsOf("trackedVideos").map(slimVideo), formats: rowsOf("formats"), signals: rowsOf("signals") };
const store = (fn) => lines(path.join(D, "store", `${fn}.jsonl`)).flatMap((p) => p.items);
const media = Object.fromEntries(store("mediaPage"));
const stores = JSON.parse(fs.readFileSync(path.join(D, "store", "appStoreMap.json"), "utf8"));
const regions = new Map(store("regionPage")), misses = new Map(store("missPage"));
const slides = new Map(store("slidePage").filter(([, n]) => n >= 0));
const ai = new Map(store("videoAiPage").filter((x) => x[3]).map(([id, type, text]) => [id, { type, text }]));
const genders = new Map(store("genderPage").filter((x) => x[2]).map(([h, g]) => [h, g]));
const langs = new Map(store("langPage").map(([id, l]) => [id, l || null]));
const site = "https://blessed-hedgehog-69.convex.site";
const opts = (part) => ({
  missing: (k) => (misses.get(k) ?? 0) > now - 3 * 86_400_000,
  coverUrl: (id) => (/^(\d{6,25}|ig:[A-Za-z0-9_-]{5,40})$/.test(id) ? `${site}/cover/${id}` : null),
  artOf: (slug) => stores[slug]?.art ?? null, regionOf: (h) => regions.get(h) ?? null, slidesOf: (id) => slides.get(id),
  aiOf: (id) => ai.get(id), genderOf: (h) => genders.get(h), langOf: (id) => (langs.has(id) ? langs.get(id) ?? null : undefined), part,
});
const fnv = (s) => { let h1 = 0x811c9dc5, h2 = 0x01000193; for (let i = 0; i < s.length; i++) { const c = s.charCodeAt(i); h1 = Math.imul(h1 ^ c, 16777619) >>> 0; h2 = Math.imul(h2 ^ c, 2246822519) >>> 0; } return h1.toString(16).padStart(8, "0") + h2.toString(16).padStart(8, "0"); };
const hashOf = (d) => { const { updatedAt, ...rest } = d ?? {}; return fnv(JSON.stringify(rest)); };
function pages(r, part) {
  const res = buildBoards(r, now, (k) => media[k] ?? null, (slug) => stores[slug]?.url ?? null, opts(part));
  const got = new Map();
  for (const [k, d] of res.boards) got.set(k, hashOf(d));
  for (const [k, f] of res.lazy) got.set(k, hashOf(f()));
  const later = res.laterTodos();
  return { got, res, todos: { region: res.regionTodo.length, gender: res.genderTodo.length, lang: res.langTodo.length, slides: later.slideTodo.length, ai: later.videoAiTodo.length }, need: [...res.need.keys()], used: [...res.used] };
}

const t0 = Date.now();
const mono = pages(raw, undefined);
console.log(`tout d'un coup : ${mono.got.size} pages (${Date.now() - t0} ms)`);

// Groupes : apps canoniques, réparties par nombre de comptes.
const byId = new Map(raw.apps.map((a) => [a.id, a]));
const canon = (id) => { let a = byId.get(id); for (let i = 0; a && a.mergedInto && i < 5; i++) a = byId.get(a.mergedInto) ?? a; return a?.id ?? ""; };
const weight = new Map(); for (const t of raw.tracked) weight.set(canon(t.appId), (weight.get(canon(t.appId)) ?? 0) + 1);
const groups = []; let cur = [], n = 0;
for (const id of [...new Set(raw.apps.map((a) => canon(a.id)))].sort((p, q) => (weight.get(q) ?? 0) - (weight.get(p) ?? 0))) {
  const w = weight.get(id) ?? 0;
  if (cur.length && n + w > PER_GROUP) { groups.push(cur); cur = []; n = 0; }
  cur.push(id); n += w;
}
if (cur.length) groups.push(cur);
const all = new Map(), from = new Map(), outs = [];
const need = new Set(), used = new Set(), todos = { region: 0, gender: 0, lang: 0, slides: 0, ai: 0 };
let dup = 0;
const take = (label, p) => {
  for (const [k, h] of p.got) { if (all.has(k)) { dup++; if (dup <= 5) console.log("  page en double :", k, "dans", from.get(k), "et", label); } all.set(k, h); from.set(k, label); }
  for (const k of p.need) need.add(k); for (const k of p.used) used.add(k);
  for (const x in todos) todos[x] += p.todos[x];
};
groups.forEach((ids, gi) => {
  const set = new Set(ids);
  const r = { ...raw, trackedVideos: raw.trackedVideos.filter((v) => set.has(canon(v.appId))) };
  const p = pages(r, { kind: "group", apps: set });
  outs.push(JSON.parse(JSON.stringify(p.res.out))); // comme en vrai : transmis en texte
  take(`groupe ${gi}`, p);
  console.log(`groupe ${gi} : ${ids.length} apps, ${r.trackedVideos.length} vidéos → ${p.got.size} pages, pays ${p.res.markets.length}`);
});
const glob = pages({ ...raw, trackedVideos: [] }, { kind: "global", outs });
take("global", glob);
console.log(`global : ${glob.got.size} pages, pays ${glob.res.markets.length} (tout d'un coup : ${mono.res.markets.length})`);

const diff = [], missingK = [], extra = [];
for (const [k, h] of mono.got) { if (!all.has(k)) missingK.push(k); else if (all.get(k) !== h) diff.push(k); }
for (const k of all.keys()) if (!mono.got.has(k)) extra.push(k);
const pre = (ks) => { const c = {}; for (const k of ks) { const p = k.split(":")[0].split("@")[0]; c[p] = (c[p] ?? 0) + 1; } return JSON.stringify(c); };
console.log(`\nDÉCOUPÉ : ${all.size} pages | différentes ${diff.length} ${pre(diff)} | manquantes ${missingK.length} ${pre(missingK)} | en trop ${extra.length} ${pre(extra)} | en double ${dup}`);
if (diff.length) console.log("  ex. différentes :", diff.slice(0, 6).join(" "));
if (missingK.length) console.log("  ex. manquantes :", missingK.slice(0, 6).join(" "));
if (extra.length) console.log("  ex. en trop :", extra.slice(0, 6).join(" "));
console.log("files :", JSON.stringify(todos), "| tout d'un coup :", JSON.stringify(mono.todos));
const monoNeed = new Set(mono.need), monoUsed = new Set(mono.used);
console.log(`images demandées : ${need.size} (tout d'un coup ${monoNeed.size}, absentes ${[...monoNeed].filter((k) => !need.has(k)).length}) | images citées : ${used.size} (tout d'un coup ${monoUsed.size}, absentes ${[...monoUsed].filter((k) => !used.has(k)).length}, en trop ${[...used].filter((k) => !monoUsed.has(k)).length})`);
if (process.env.DIFF_KEY) {
  // Contenu d'une page dans les deux calculs.
  const k = process.env.DIFF_KEY;
  const find = (p) => { const d = p.res.boards.get(k) ?? p.res.lazy.get(k)?.(); return d; };
  console.log(JSON.stringify(find(mono)).slice(0, 1500));
}
