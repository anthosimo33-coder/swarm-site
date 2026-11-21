import { getFunctionName } from "convex/server";
import { memoryDb, type MemoryDoc } from "./convex-memory-db";

/**
 * Outils de test des tâches du Radar (bascule TikHub, 20/11/2026) :
 *  - `writableDb` : une base en mémoire qui accepte les écritures (insert, patch, replace, delete) et les relit, sur
 *    les index du schéma (tests/radar/convex-memory-db.ts) ;
 *  - `fakeActionCtx` : le contexte d'une action Convex. `runQuery` et `runMutation` répondent selon le nom de la
 *    fonction appelée (« radar/radarSignals:jobState ») et NOTENT chaque appel avec ses arguments ; le planificateur
 *    note sans rien lancer. Une fonction sans réponse prévue fait tomber le test (rien n'est appelé en douce).
 */

let seq = 0;

export function writableDb(tables: Record<string, MemoryDoc[]>) {
  const fresh = () => memoryDb(tables, { limit: null }).db as { get: (id: string) => Promise<MemoryDoc | null>; query: (t: string) => unknown };
  const find = (id: string): { table: string; i: number } | null => {
    for (const [table, docs] of Object.entries(tables)) {
      const i = docs.findIndex((d) => d._id === id);
      if (i >= 0) return { table, i };
    }
    return null;
  };
  const clean = (o: Record<string, unknown>) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined));
  const writes: { op: "insert" | "patch" | "replace" | "delete"; table: string; id: string; value?: Record<string, unknown> }[] = [];
  const db = {
    get: (id: string) => fresh().get(id),
    query: (t: string) => fresh().query(t),
    insert: async (table: string, value: Record<string, unknown>) => {
      const id = `${table}_${String(++seq).padStart(6, "0")}`;
      (tables[table] ??= []).push({ ...clean(value), _id: id, _creationTime: seq });
      writes.push({ op: "insert", table, id, value });
      return id;
    },
    patch: async (id: string, value: Record<string, unknown>) => {
      const at = find(id);
      if (!at) throw new Error(`patch : document absent ${id}`);
      const doc = { ...tables[at.table][at.i], ...value };
      tables[at.table][at.i] = clean(doc) as MemoryDoc;
      writes.push({ op: "patch", table: at.table, id, value });
    },
    replace: async (id: string, value: Record<string, unknown>) => {
      const at = find(id);
      if (!at) throw new Error(`replace : document absent ${id}`);
      const old = tables[at.table][at.i];
      tables[at.table][at.i] = { ...clean(value), _id: old._id, _creationTime: old._creationTime };
      writes.push({ op: "replace", table: at.table, id, value });
    },
    delete: async (id: string) => {
      const at = find(id);
      if (at) tables[at.table].splice(at.i, 1);
      writes.push({ op: "delete", table: at?.table ?? "?", id });
    },
  };
  return { db, tables, writes };
}

export type CtxCall = { kind: "query" | "mutation" | "schedule"; name: string; args: Record<string, unknown> };
type Answer = (args: Record<string, unknown>) => unknown;

/**
 * `answers` : par nom de fonction, ce qu'elle rend. `mutations` sans réponse prévue rendent `null` (et sont notées) ;
 * une query sans réponse fait tomber le test.
 */
export function fakeActionCtx(answers: Record<string, Answer>, opts: { defaultMutation?: boolean } = {}) {
  const calls: CtxCall[] = [];
  const run = (kind: "query" | "mutation") => async (ref: unknown, args: Record<string, unknown> = {}) => {
    const name = getFunctionName(ref as never);
    calls.push({ kind, name, args: structuredClone(args) });
    const a = answers[name];
    if (a) return a(args);
    if (kind === "mutation" && opts.defaultMutation !== false) return null;
    throw new Error(`appel inattendu : ${kind} ${name}`);
  };
  const ctx = {
    runQuery: run("query"),
    runMutation: run("mutation"),
    runAction: async (ref: unknown) => {
      throw new Error(`action inattendue : ${getFunctionName(ref as never)}`);
    },
    scheduler: {
      runAfter: async (delay: number, ref: unknown, args: Record<string, unknown> = {}) => {
        calls.push({ kind: "schedule", name: getFunctionName(ref as never), args: { delay, ...args } });
        return "planifie";
      },
      runAt: async (at: number, ref: unknown, args: Record<string, unknown> = {}) => {
        calls.push({ kind: "schedule", name: getFunctionName(ref as never), args: { at, ...args } });
        return "planifie";
      },
    },
  };
  return { ctx, calls, named: (name: string) => calls.filter((c) => c.name === name) };
}

type Handler = { _handler: (ctx: unknown, args: unknown) => Promise<unknown> };
/** Le corps d'une fonction Convex (query, mutation, action), à appeler avec un faux contexte. */
export const handlerOf = (f: unknown) => (f as Handler)._handler;

/** Avance l'horloge simulée (vi.useFakeTimers) jusqu'à ce que la tâche rende la main : ses pauses sont des minuteries. */
export async function drive<T>(p: Promise<T>): Promise<T> {
  const { vi } = await import("vitest");
  let done = false;
  void p.then(
    () => (done = true),
    () => (done = true),
  );
  for (let i = 0; i < 10_000 && !done; i++) await vi.advanceTimersToNextTimerAsync();
  return p;
}

type FetchAnswer = [number, unknown] | Error;
export type FetchCall = { url: string; key: string | null; auth: string | null };
/** Un faux `fetch` qui répond selon l'adresse et note chaque appel (adresse, clé ScrapeCreators, en-tête TikHub). */
export function fetchLog(answer: (url: string) => FetchAnswer) {
  const calls: FetchCall[] = [];
  const impl = async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input);
    const h = (init?.headers ?? {}) as Record<string, string>;
    calls.push({ url, key: h["x-api-key"] ?? null, auth: h.Authorization ?? null });
    const a = answer(url);
    if (a instanceof Error) throw a;
    return new Response(typeof a[1] === "string" ? a[1] : JSON.stringify(a[1]), { status: a[0] });
  };
  return { impl: impl as unknown as typeof fetch, calls, paths: () => calls.map((c) => new URL(c.url).pathname) };
}
