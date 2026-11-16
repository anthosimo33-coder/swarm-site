// Pages des tables Swarm lues par la synchro (dev), pour le banc mémoire. Une ligne = une page.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
const dir = process.argv[2];
const call = (fn, args) => JSON.parse(execFileSync("npx", ["convex", "run", `radarStore:${fn}`, JSON.stringify(args)], { cwd: "/Users/simonet/dev/swarm-site", maxBuffer: 1 << 30 }).toString());
{ // fiches App Store, page par page (appStorePage), rangées en objet slug → fiche
  const out = {}; let cursor = null;
  for (;;) { const p = call("appStorePage", { cursor }); for (const [slug, url, v, art] of p.items) out[slug] = { url, v, art }; if (p.done) break; cursor = p.cursor; }
  fs.writeFileSync(`${dir}/appStoreMap.json`, JSON.stringify(out));
}
for (const fn of ["mediaPage", "regionPage", "slidePage", "videoAiPage", "genderPage", "missPage", "langPage"]) {
  const out = fs.openSync(`${dir}/${fn}.jsonl`, "w"); let cursor = null, n = 0, items = 0;
  for (;;) { const p = call(fn, { cursor }); fs.writeSync(out, JSON.stringify(p) + "\n"); n++; items += p.items.length; if (p.done) break; cursor = p.cursor; }
  fs.closeSync(out); console.log(fn, "pages", n, "éléments", items);
}
