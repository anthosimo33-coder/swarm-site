// Empaquette convex/radarSync.ts (ou une autre version, 1er argument) pour le banc, avec Convex et la copie d'images
// remplacés par des doublures (stubs.mjs). Usage : node scripts/sync-bench/build.mjs [source.ts] [sortie.mjs]
import path from "node:path";
import { fileURLToPath } from "node:url";
const here = path.dirname(fileURLToPath(import.meta.url)), root = path.resolve(here, "../..");
const { build } = await import(path.join(root, "node_modules/esbuild/lib/main.js"));
const src = path.resolve(process.argv[2] ?? path.join(root, "convex/radarSync.ts"));
const out = path.resolve(process.argv[3] ?? path.join(root, ".bench-data/sync.bundle.mjs"));
await build({
  entryPoints: [src], bundle: true, platform: "node", format: "esm", target: "node20", outfile: out, logLevel: "warning",
  external: ["sharp"], nodePaths: [path.join(root, "node_modules")],
  plugins: [{ name: "stubs", setup(b) { b.onResolve({ filter: /(_generated\/(server|api)|\/imageCopy)$/ }, () => ({ path: path.join(here, "stubs.mjs") })); } }],
});
console.log("paquet :", out);
