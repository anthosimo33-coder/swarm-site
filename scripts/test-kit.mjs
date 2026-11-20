// Outils des bancs de convex/ : empaquetage d'un module par esbuild avec Convex remplacé par des doublures, base Convex
// en mémoire, et compte des résultats. Utilisé par scripts/*.test.mjs.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const { build } = await import(path.join(root, "node_modules/esbuild/lib/main.js"));

/** Fonctions Convex = leur définition ({ args, handler }) ; `internal.x.y` = { __path: "x.y" }. */
export const CONVEX_STUB = `
export const internalAction = (c) => c, internalQuery = (c) => c, internalMutation = (c) => c;
export const action = (c) => c, query = (c) => c, mutation = (c) => c, httpAction = (f) => f;
const ref = (p) => new Proxy({}, { get: (_t, k) => (k === "__path" ? p.join(".") : ref([...p, String(k)])) });
export const internal = ref([]), api = ref([]);
`;

/**
 * Empaquette `file` (chemin absolu) et l'importe. `stubs` : [motif d'import, contenu du module de remplacement] ;
 * _generated/server et _generated/api sont toujours remplacés.
 */
export async function load(file, stubs = []) {
  const all = [[/_generated\/(server|api)$/, CONVEX_STUB], ...stubs];
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "kopycat-test-"));
  const out = path.join(tmp, path.basename(file).replace(/\.\w+$/, "") + ".mjs");
  await build({
    entryPoints: [file], bundle: true, platform: "node", format: "esm", target: "node20", outfile: out, logLevel: "error",
    external: ["sharp", "heic-convert"], nodePaths: [path.join(root, "node_modules")],
    plugins: [{ name: "stubs", setup(b) {
      all.forEach(([re, contents], i) => {
        b.onResolve({ filter: re }, () => ({ path: String(i), namespace: "stub" }));
      });
      b.onLoad({ filter: /.*/, namespace: "stub" }, (a) => ({ contents: all[Number(a.path)][1], loader: "js", resolveDir: root }));
    } }],
  });
  const mod = await import(out);
  fs.rmSync(tmp, { recursive: true, force: true });
  return mod;
}

/** Une base Convex en mémoire (index lus comme des filtres), qui compte les octets lus par table. */
export function memDb() {
  const tables = {}, read = {};
  let next = 1;
  const rows = (t) => (tables[t] ??= []);
  const count = (t, d) => { read[t] = (read[t] ?? 0) + JSON.stringify(d).length; return d; };
  const find = (id) => { const t = String(id).split("|")[0]; return [t, rows(t).findIndex((d) => d._id === id)]; };
  const query = (t) => {
    const conds = [];
    let desc = false;
    const all = () => { const r = rows(t).filter((d) => conds.every((c) => c(d))); return desc ? r.slice().reverse() : r; };
    const api = {
      withIndex: (_i, f) => {
        const b = { eq: (k, x) => (conds.push((d) => d[k] === x), b), gt: (k, x) => (conds.push((d) => d[k] > x), b), gte: (k, x) => (conds.push((d) => d[k] >= x), b), lt: (k, x) => (conds.push((d) => d[k] < x), b), lte: (k, x) => (conds.push((d) => d[k] <= x), b) };
        if (f) f(b);
        return api;
      },
      filter: () => api,
      order: (o) => { desc = o === "desc"; return api; },
      first: async () => { const d = all()[0]; return d ? count(t, d) : null; },
      unique: async () => { const a = all(); if (a.length > 1) throw new Error(`unique : ${a.length} lignes dans ${t}`); return a[0] ? count(t, a[0]) : null; },
      take: async (n) => all().slice(0, n).map((d) => count(t, d)),
      collect: async () => all().map((d) => count(t, d)),
      paginate: async ({ cursor, numItems }) => { const a = all(), i = Number(cursor || 0); return { page: a.slice(i, i + numItems).map((d) => count(t, d)), continueCursor: String(i + numItems), isDone: i + numItems >= a.length }; },
      [Symbol.asyncIterator]: async function* () { for (const d of all()) yield count(t, d); },
    };
    return api;
  };
  const db = {
    query,
    get: async (id) => { const [t, i] = find(id); return i < 0 ? null : count(t, rows(t)[i]); },
    insert: async (t, d) => { const _id = `${t}|${next++}`; rows(t).push({ _id, _creationTime: Date.now(), ...d }); return _id; },
    patch: async (id, p) => { const [t, i] = find(id); if (i < 0) throw new Error(`patch : ${id} introuvable`); for (const [k, x] of Object.entries(p)) { if (x === undefined) delete rows(t)[i][k]; else rows(t)[i][k] = x; } },
    replace: async (id, d) => { const [t, i] = find(id); rows(t)[i] = { _id: id, _creationTime: rows(t)[i]._creationTime, ...d }; },
    delete: async (id) => { const [t, i] = find(id); if (i < 0) throw new Error(`delete : ${id} introuvable`); rows(t).splice(i, 1); },
    normalizeId: (t, id) => (String(id).startsWith(t + "|") ? id : null),
    system: { get: async () => null },
  };
  return { tables, read, db, rows };
}

/** Compte des résultats : ok(condition, message), puis end() pour sortir en échec s'il le faut. */
export function checker() {
  let fail = 0;
  return {
    ok: (cond, msg) => { console.log((cond ? "OK   " : "ÉCHEC") + " " + msg); if (!cond) fail++; },
    end: () => { console.log(fail ? `${fail} échec(s)` : "tout passe"); process.exit(fail ? 1 : 0); },
  };
}

/** Fait taire console.log et console.error le temps de `f`. */
export async function quiet(f) {
  const log = console.log, err = console.error;
  console.log = console.error = () => {};
  try { return await f(); } finally { console.log = log; console.error = err; }
}
