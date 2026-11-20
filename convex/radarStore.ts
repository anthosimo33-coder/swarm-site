import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import { internalAction, internalMutation, internalQuery, type MutationCtx, type QueryCtx } from "./_generated/server";

/**
 * Les images déjà recopiées, page par page : [clé, URL servie par Swarm].
 * (Une valeur Convex a au plus 1 024 champs et 8 192 éléments : jamais tout d'un coup.)
 */
export const mediaPage = internalQuery({
  args: { cursor: v.union(v.string(), v.null()) },
  handler: async (ctx, { cursor }) => {
    const r = await ctx.db.query("media").paginate({ cursor, numItems: 4000 });
    return { items: r.page.map((m) => [m.key, m.url] as [string, string]), cursor: r.continueCursor, done: r.isDone };
  },
});

// Audit F2 (20/11) : le document unique « hidden » n'est plus écrit. Plus personne ne le lit (boards.get s'en passe
// depuis F14 : une vidéo introuvable se lit sur sa ligne mediaMiss) ; chaque écriture ne faisait que provoquer des
// conflits avec la synchro et relancer toutes les requêtes boards.get, et la liste, jamais élaguée, plafonnait à 8 000.

/**
 * Formats qu'une image rangée peut avoir pour être servie : matriciels seulement. Audit S30 (19/11) : une icône SVG
 * (script compris) était rangée et servie depuis le stockage Convex ; convex/imageCopy.ts n'en range plus, et une
 * ancienne compte comme absente (recopiée, ou effacée par repairMedia).
 */
const RASTER = /^image\/(jpeg|png|gif|webp|avif|x-icon|vnd\.microsoft\.icon)$/i;
const HEIC = /hei[cf]/i;
/** L'état du fichier d'une image rangée : servable, HEIC (Chrome ne l'affiche pas : converti), ou inutilisable. */
async function fileState(ctx: QueryCtx, row: { storageId: Id<"_storage"> } | null): Promise<"ok" | "heic" | "bad" | null> {
  if (!row) return null;
  const file = await ctx.db.system.get(row.storageId);
  const type = (file?.contentType ?? "").split(";")[0].trim();
  return !file ? "bad" : RASTER.test(type) ? "ok" : HEIC.test(type) ? "heic" : "bad";
}
const usable = async (ctx: QueryCtx, row: { storageId: Id<"_storage"> } | null) => (await fileState(ctx, row)) === "ok";

/** Une image rangée (ou son dernier échec). */
export const mediaGet = internalQuery({
  args: { key: v.string() },
  handler: async (ctx, { key }) => {
    const row = await ctx.db.query("media").withIndex("by_key", (q) => q.eq("key", key)).first();
    const state = await fileState(ctx, row);
    if (row && state === "ok") return { url: row.url, missAt: null, heic: null };
    if (row && state === "heic") return { url: null, missAt: null, heic: row.storageId }; // HEIC rangé : converti sur place
    // Rien de servable rangé (absent, ou fichier non matriciel : recopié par-dessus, audit S30).
    const miss = await ctx.db.query("mediaMiss").withIndex("by_key", (q) => q.eq("key", key)).first();
    return { url: null, missAt: miss?.at ?? null, heic: null };
  },
});

/** Les miniatures introuvables, page par page : [clé, date du dernier essai]. */
export const missPage = internalQuery({
  args: { cursor: v.union(v.string(), v.null()) },
  handler: async (ctx, { cursor }) => {
    const r = await ctx.db.query("mediaMiss").paginate({ cursor, numItems: 4000 });
    return { items: r.page.map((m) => [m.key, m.at] as [string, number]), cursor: r.continueCursor, done: r.isDone };
  },
});

/** Note des miniatures introuvables (synchro). */
export const markMisses = internalMutation({
  args: { keys: v.array(v.string()) },
  handler: async (ctx, { keys }) => {
    const now = Date.now();
    for (const key of keys) {
      const miss = await ctx.db.query("mediaMiss").withIndex("by_key", (q) => q.eq("key", key)).first();
      if (miss) await ctx.db.patch(miss._id, { at: now });
      else await ctx.db.insert("mediaMiss", { key, at: now });
    }
  },
});

export const markMiss = internalMutation({
  args: { key: v.string() },
  handler: async (ctx, { key }) => {
    const miss = await ctx.db.query("mediaMiss").withIndex("by_key", (q) => q.eq("key", key)).first();
    if (miss) await ctx.db.patch(miss._id, { at: Date.now() });
    else await ctx.db.insert("mediaMiss", { key, at: Date.now() });
  },
});

/** Pour /avatar/<handle> : la photo déjà rangée, et si l'app connaît le compte (fiche, ou cité par une app). */
export const avatarLookup = internalQuery({
  args: { handle: v.string() },
  handler: async (ctx, { handle }) => {
    const row = await ctx.db.query("media").withIndex("by_key", (q) => q.eq("key", `a:${handle}`)).first();
    if (row && (await usable(ctx, row))) return { known: true, url: row.url };
    const page = await ctx.db.query("boards").withIndex("by_key", (q) => q.eq("key", `creator:${handle}`)).first();
    const miss = await ctx.db.query("mediaMiss").withIndex("by_key", (q) => q.eq("key", `a:${handle}`)).first();
    return { known: !!page || !!miss, url: null };
  },
});

/** Pour /cover/<id> : la miniature déjà rangée, sinon le compte de la vidéo (si l'app la connaît). */
export const coverLookup = internalQuery({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    const row = await ctx.db.query("media").withIndex("by_key", (q) => q.eq("key", `v:${id}`)).first();
    if (row && (await usable(ctx, row))) return { url: row.url, handle: null };
    const page = await ctx.db.query("boards").withIndex("by_key", (q) => q.eq("key", `video:${id}`)).first();
    const handle = (page?.data as { handle?: string } | undefined)?.handle;
    return { url: null, handle: handle || null };
  },
});

/**
 * Range des images copiées ; rend l'adresse retenue pour chacune. Audit Q61 (19/11) : deux copies simultanées d'une même
 * miniature (deux visiteurs, ou la lecture IA et /cover) : la seconde effaçait le fichier vers lequel la première venait
 * de rediriger (redirection gardée 24 h). Une copie déjà rangée et servable est gardée : la nouvelle est effacée, et
 * c'est l'adresse gardée qui est rendue. Une copie rangée mais inutilisable (HEIC, non matricielle) est remplacée.
 */
export const saveMedia = internalMutation({
  args: { items: v.array(v.object({ key: v.string(), storageId: v.id("_storage"), url: v.string() })) },
  handler: async (ctx, { items }): Promise<{ key: string; url: string }[]> => {
    const now = Date.now();
    const out: { key: string; url: string }[] = [];
    for (const it of items) {
      const old = await ctx.db.query("media").withIndex("by_key", (q) => q.eq("key", it.key)).first();
      if (old && old.storageId !== it.storageId && (await usable(ctx, old))) {
        await ctx.storage.delete(it.storageId);
        out.push({ key: it.key, url: old.url });
      } else if (old) {
        if (old.storageId !== it.storageId) await ctx.storage.delete(old.storageId);
        await ctx.db.patch(old._id, { storageId: it.storageId, url: it.url, at: now });
        out.push({ key: it.key, url: it.url });
      } else {
        await ctx.db.insert("media", { ...it, at: now });
        out.push({ key: it.key, url: it.url });
      }
      const miss = await ctx.db.query("mediaMiss").withIndex("by_key", (q) => q.eq("key", it.key)).first();
      if (miss) await ctx.db.delete(miss._id);
    }
    return out;
  },
});

/**
 * Relevé des images rangées, page par page (audit S30, Q67, F30) : combien, leur poids, et celles qui ne se servent pas
 * (fichier absent, HEIC, format non matriciel). Lecture seule.
 */
export const mediaAudit = internalQuery({
  args: { cursor: v.union(v.string(), v.null()) },
  handler: async (ctx, { cursor }) => {
    const r = await ctx.db.query("media").paginate({ cursor, numItems: 1000 });
    const out = { rows: r.page.length, bytes: 0, heic: 0, bad: 0, unusable: [] as string[] };
    for (const m of r.page) {
      const file = await ctx.db.system.get(m.storageId);
      const type = (file?.contentType ?? "").split(";")[0].trim();
      out.bytes += file?.size ?? 0;
      if (file && RASTER.test(type)) continue;
      if (file && HEIC.test(type)) out.heic++; else out.bad++;
      out.unusable.push(m.key);
    }
    return { ...out, cursor: r.continueCursor, done: r.isDone };
  },
});

/** Efface des images recopiées (fichier et ligne). */
export const dropMedia = internalMutation({
  args: { keys: v.array(v.string()) },
  handler: async (ctx, { keys }) => {
    for (const key of keys) {
      const row = await ctx.db.query("media").withIndex("by_key", (q) => q.eq("key", key)).first();
      if (!row) continue;
      await ctx.storage.delete(row.storageId);
      await ctx.db.delete(row._id);
    }
  },
});

/**
 * Les clés des documents, page par page, lues dans boardMeta (≈ 100 o par page) : avant le 20/11, la table boards elle-même,
 * documents entiers (1,6 Ko en moyenne, jusqu'à 600 Ko) pour n'en garder que la clé — 5,4 Go/jour lus en prod le 19/11.
 */
export const boardKeys = internalQuery({
  args: { cursor: v.union(v.string(), v.null()) },
  handler: async (ctx, { cursor }) => {
    const r = await ctx.db.query("boardMeta").paginate({ cursor, numItems: 4000 });
    return { keys: r.page.map((b) => b.key), hashes: r.page.map((b) => b.hash), cursor: r.continueCursor, done: r.isDone };
  },
});

/** L'empreinte rangée d'une page (boardMeta), créée ou mise à jour. */
async function setMeta(ctx: MutationCtx, key: string, hash: string, meta?: { _id: Id<"boardMeta">; hash: string } | null) {
  const row = meta === undefined ? await ctx.db.query("boardMeta").withIndex("by_key", (q) => q.eq("key", key)).first() : meta;
  if (!row) await ctx.db.insert("boardMeta", { key, hash });
  else if (row.hash !== hash) await ctx.db.patch(row._id, { hash });
}

/**
 * Migration du 20/11 : l'empreinte de chaque page déjà rangée recopiée dans boardMeta (une page de boards par appel).
 * Lancer une fois après le déploiement : `npx convex run radarStore:backfillBoardMetaAll`. Sans elle, rien ne casse : une
 * page sans empreinte rangée est vue comme changée, et saveBoards range son empreinte sans la réécrire si elle n'a pas bougé.
 */
export const backfillBoardMeta = internalMutation({
  args: { cursor: v.union(v.string(), v.null()) },
  handler: async (ctx, { cursor }) => {
    const r = await ctx.db.query("boards").paginate({ cursor, numItems: 500, maximumBytesRead: 8_000_000 });
    let added = 0;
    for (const b of r.page) {
      const meta = await ctx.db.query("boardMeta").withIndex("by_key", (q) => q.eq("key", b.key)).first();
      if (!meta) added++;
      await setMeta(ctx, b.key, b.hash, meta);
    }
    return { n: r.page.length, added, cursor: r.continueCursor, done: r.isDone };
  },
});
/** La migration entière, par tranches de 2 min : une tranche relance la suivante (le dev du 20/11 : 140 000 pages, une
 * seule action coupée au bout de 5 min). Suivre dans les journaux : « [boardMeta] ». */
export const backfillBoardMetaAll = internalAction({
  args: { cursor: v.optional(v.union(v.string(), v.null())), pages: v.optional(v.number()), added: v.optional(v.number()) },
  handler: async (ctx, args): Promise<{ pages: number; added: number; done: boolean }> => {
    const start = Date.now();
    let pages = args.pages ?? 0, added = args.added ?? 0, cursor: string | null = args.cursor ?? null;
    while (Date.now() - start < 120_000) {
      const r: { n: number; added: number; cursor: string; done: boolean } = await ctx.runMutation(internal.radarStore.backfillBoardMeta, { cursor });
      pages += r.n; added += r.added; cursor = r.cursor;
      if (r.done) { console.log(`[boardMeta] fini : ${pages} pages, ${added} empreintes ajoutées`); return { pages, added, done: true }; }
    }
    console.log(`[boardMeta] ${pages} pages lues, ${added} empreintes ajoutées, la suite dans une action neuve`);
    await ctx.scheduler.runAfter(0, internal.radarStore.backfillBoardMetaAll, { cursor, pages, added });
    return { pages, added, done: false };
  },
});

/**
 * Les lignes d'une file à (re)lire : moins de 3 essais, pas essayées depuis 6 h. Une plage d'index par nombre d'essais
 * (0, 1, 2) : les lignes abandonnées (3 essais) ne sont jamais lues. Avant (16/11), une seule plage filtrée par essais
 * les lisait toutes, en tête, à chaque réservation : à 32 000 lignes lues, Convex aurait refusé la requête.
 */
async function pendingRows<T>(take: number, range: (tries: number) => { take: (n: number) => Promise<T[]> }): Promise<T[]> {
  const out: T[] = [];
  for (const tries of [0, 1, 2]) {
    if (out.length >= take) break;
    out.push(...(await range(tries).take(take - out.length)));
  }
  return out;
}

/** Morceaux de texte d'une grosse page : 250 000 caractères, au plus 750 Ko en UTF-8 (un document : 1 Mio). */
export const PART_CHARS = 250_000;
const dropParts = async (ctx: MutationCtx, key: string) => {
  for (const p of await ctx.db.query("boardParts").withIndex("by_key_i", (q) => q.eq("key", key)).collect()) await ctx.db.delete(p._id);
};

/** Efface les documents qu'un passage n'a plus produits (fiche sortie du Radar). */
export const dropBoards = internalMutation({
  args: { keys: v.array(v.string()) },
  handler: async (ctx, { keys }): Promise<string[]> => {
    // Chaque page est lue avant d'être effacée : au-delà de 8 Mo lus, le reste est rendu (l'appelant le renvoie).
    let read = 0;
    for (let i = 0; i < keys.length; i++) {
      if (read > 8_000_000) return keys.slice(i);
      const meta = await ctx.db.query("boardMeta").withIndex("by_key", (q) => q.eq("key", keys[i])).first();
      if (meta) await ctx.db.delete(meta._id);
      const row = await ctx.db.query("boards").withIndex("by_key", (q) => q.eq("key", keys[i])).first();
      if (!row) continue;
      read += row.parts ? row.parts * PART_CHARS * 3 : JSON.stringify(row.data ?? null).length * 3;
      if (row.parts) await dropParts(ctx, keys[i]);
      await ctx.db.delete(row._id);
    }
    return [];
  },
});

/**
 * Écrit les documents des écrans ; un document inchangé (même empreinte) n'est pas réécrit. Une page envoyée en texte
 * (`text`, trop grosse pour un document ou une liste de Convex) est rangée en morceaux (boardParts), recollés par
 * boards.get ; une page redevenue petite reprend `data` et perd ses morceaux. L'empreinte suit dans boardMeta : la page
 * elle-même n'est lue que si elle change (ou si son empreinte n'est pas encore rangée : avant la migration du 20/11).
 */
export const saveBoards = internalMutation({
  args: { items: v.array(v.object({ key: v.string(), hash: v.string(), data: v.optional(v.any()), text: v.optional(v.string()) })), now: v.number() },
  handler: async (ctx, { items, now }) => {
    let written = 0;
    for (const it of items) {
      const meta = await ctx.db.query("boardMeta").withIndex("by_key", (q) => q.eq("key", it.key)).first();
      if (meta && meta.hash === it.hash) continue;
      const old = await ctx.db.query("boards").withIndex("by_key", (q) => q.eq("key", it.key)).first();
      if (old && old.hash === it.hash) { await setMeta(ctx, it.key, it.hash, meta); continue; }
      if (old?.parts) await dropParts(ctx, it.key);
      let row: { data: unknown; parts: number | undefined };
      if (it.text !== undefined) {
        // Coupe sur une frontière de caractère (audit Q7) : couper entre les deux moitiés d'un émoji donnait deux morceaux
        // invalides, refusés par Convex, et tout le passage échouait. boards.get recolle par simple concaténation.
        let n = 0;
        for (let start = 0; start < it.text.length || n === 0; n++) {
          let end = Math.min(start + PART_CHARS, it.text.length);
          const c = it.text.charCodeAt(end - 1);
          if (end < it.text.length && c >= 0xd800 && c <= 0xdbff) end--; // première moitié d'une paire : avec la suivante
          await ctx.db.insert("boardParts", { key: it.key, i: n, text: it.text.slice(start, end) });
          start = end;
        }
        row = { data: null, parts: n };
      } else row = { data: it.data ?? null, parts: undefined };
      if (old) await ctx.db.patch(old._id, { ...row, hash: it.hash, updatedAt: now });
      else await ctx.db.insert("boards", { key: it.key, ...row, hash: it.hash, updatedAt: now });
      await setMeta(ctx, it.key, it.hash, meta);
      written++;
    }
    return written;
  },
});

/**
 * Un passage tourne-t-il ? Pas fini, et une de ses étapes a donné signe de vie il y a moins de 12 min (une étape dure
 * 10 min au plus ; la synchro par groupes en enchaîne plusieurs).
 */
const runAlive = (r: { finishedAt?: number; startedAt: number; beatAt?: number } | null, now: number) =>
  !!r && !r.finishedAt && now - (r.beatAt ?? r.startedAt) < 12 * 60_000;

/** Démarre un passage ; null si un autre tourne déjà. Un passage resté sans fin (étape coupée) est noté comme tel. */
export const startRun = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const last = await ctx.db.query("syncRuns").withIndex("by_started").order("desc").first();
    if (runAlive(last, now)) return null;
    if (last && !last.finishedAt) await ctx.db.patch(last._id, { finishedAt: now, ok: false, error: last.error ?? "interrompu : une étape s'est arrêtée sans finir" });
    return ctx.db.insert("syncRuns", { startedAt: now, beatAt: now });
  },
});

/** Signe de vie d'une étape. */
export const beat = internalMutation({
  args: { id: v.id("syncRuns") },
  handler: async (ctx, { id }) => ctx.db.patch(id, { beatAt: Date.now() }),
});

export const setStage = internalMutation({
  args: { id: v.id("syncRuns"), stage: v.any() },
  handler: async (ctx, { id, stage }) => ctx.db.patch(id, { stage, beatAt: Date.now() }),
});

/** L'état des étapes d'un passage en cours ; null s'il est fini (ou abandonné). */
export const getStage = internalQuery({
  args: { id: v.id("syncRuns") },
  handler: async (ctx, { id }) => {
    const r = await ctx.db.get(id);
    return r && !r.finishedAt ? r.stage ?? null : null;
  },
});

/** Des fichiers d'étape rangés, notés aussitôt (audit Q55) : effacés avec l'étape même si elle est coupée avant de finir. */
export const stageAdd = internalMutation({
  args: { id: v.id("syncRuns"), files: v.array(v.id("_storage")) },
  handler: async (ctx, { id, files }) => {
    const r = await ctx.db.get(id);
    if (!r?.stage) return;
    await ctx.db.patch(id, { stage: { ...r.stage, extra: [...(r.stage.extra ?? []), ...files] }, beatAt: Date.now() });
  },
});

/** Une étape de groupe finie : le fichier de ce qu'elle transmet. */
export const groupDone = internalMutation({
  args: { id: v.id("syncRuns"), i: v.number(), out: v.id("_storage"), tail: v.id("_storage"), written: v.number() },
  handler: async (ctx, { id, i, out, tail, written }) => {
    const r = await ctx.db.get(id);
    if (!r?.stage) return;
    const outs = [...r.stage.outs]; outs[i] = out;
    const tails = [...(r.stage.tails ?? r.stage.outs.map(() => null))]; tails[i] = tail;
    const writtenBy = [...(r.stage.writtenBy ?? [])]; writtenBy[i] = written;
    await ctx.db.patch(id, { stage: { ...r.stage, outs, tails, writtenBy }, beatAt: Date.now() });
  },
});

/** Une étape coupée (temps, mémoire) : compte ses reprises, pour abandonner celle qui n'avance plus. */
export const stepRetry = internalMutation({
  args: { id: v.id("syncRuns"), step: v.string() },
  handler: async (ctx, { id, step }) => {
    const r = await ctx.db.get(id);
    if (!r?.stage) return 0;
    const retries = { ...(r.stage.retries ?? {}) };
    retries[step] = (retries[step] ?? 0) + 1;
    await ctx.db.patch(id, { stage: { ...r.stage, retries }, beatAt: Date.now() });
    return retries[step] as number;
  },
});

/** Fichiers d'étape des passages finis (ou abandonnés) pas encore effacés. */
export const staleStages = internalQuery({
  args: { keep: v.id("syncRuns") },
  handler: async (ctx, { keep }) => {
    const runs = await ctx.db.query("syncRuns").withIndex("by_started").order("desc").take(30);
    const now = Date.now();
    return runs.filter((r) => r._id !== keep && r.stage && !r.cleaned && !runAlive(r, now)).map((r) => {
      const st = r.stage as { globals?: Record<string, string[]>; outs?: (string | null)[]; tails?: (string | null)[]; extra?: string[] };
      return { id: r._id, ids: [...new Set([...Object.values(st.globals ?? {}).flat(), ...[...(st.outs ?? []), ...(st.tails ?? []), ...(st.extra ?? [])].filter((x): x is string => !!x)])] };
    });
  },
});

export const stageCleaned = internalMutation({
  args: { id: v.id("syncRuns") },
  handler: async (ctx, { id }) => {
    // Les listes d'apps par groupe ne servent plus : seul un résumé reste (les passages sont relus 20 par 20).
    const r = await ctx.db.get(id);
    const st = (r?.stage ?? {}) as { groups?: unknown[]; retries?: unknown; writtenBy?: unknown; heapPrep?: unknown; rssPrep?: unknown };
    await ctx.db.patch(id, { cleaned: true, stage: { groups: st.groups?.length ?? 0, retries: st.retries ?? null, writtenBy: st.writtenBy ?? null, heapPrep: st.heapPrep ?? null, rssPrep: st.rssPrep ?? null } });
  },
});

/**
 * Empreinte rangée de chaque page demandée (null : pas de page) : l'écriture n'envoie que les pages qui changent. Lue
 * dans boardMeta : avant le 20/11, chaque page était lue entière pour son empreinte (5,8 Go/jour en prod le 19/11).
 */
export const boardHashes = internalQuery({
  args: { keys: v.array(v.string()) },
  handler: async (ctx, { keys }) => {
    const out: (string | null)[] = [];
    for (const key of keys) out.push((await ctx.db.query("boardMeta").withIndex("by_key", (q) => q.eq("key", key)).first())?.hash ?? null);
    return out;
  },
});

export const endRun = internalMutation({
  args: { id: v.id("syncRuns"), ok: v.boolean(), counts: v.optional(v.any()), error: v.optional(v.string()) },
  handler: async (ctx, { id, ...rest }) => ctx.db.patch(id, { finishedAt: Date.now(), ...rest }),
});

/**
 * Fiches App Store déjà cherchées, page par page : [slug, URL (null si introuvable), version de la règle, icône].
 * Plus un objet à une clé par app : le 16/11, à 1 036 apps, Convex l'a refusé (1 024 champs au plus par objet).
 */
export const appStorePage = internalQuery({
  args: { cursor: v.union(v.string(), v.null()) },
  handler: async (ctx, { cursor }) => {
    const r = await ctx.db.query("appStore").paginate({ cursor, numItems: 2000 });
    return { items: r.page.map((x) => [x.slug, x.url, x.v ?? 1, x.art ?? null] as [string, string | null, number, string | null]), cursor: r.continueCursor, done: r.isDone };
  },
});

export const saveAppStore = internalMutation({
  args: { items: v.array(v.object({ slug: v.string(), url: v.union(v.string(), v.null()), v: v.number(), art: v.optional(v.union(v.string(), v.null())) })) },
  handler: async (ctx, { items }) => {
    for (const it of items) {
      const old = await ctx.db.query("appStore").withIndex("by_slug", (q) => q.eq("slug", it.slug)).first();
      if (old) await ctx.db.patch(old._id, { url: it.url, v: it.v, art: it.art ?? null, at: Date.now() });
      else await ctx.db.insert("appStore", { ...it, at: Date.now() });
    }
  },
});

/**
 * Efface les empreintes des pages (une page par appel de 500) : le passage suivant les réécrit
 * toutes. Sert à éprouver le cas lourd (nouvelles icônes partout) sur le dev avant la prod.
 */
export const resetHashes = internalMutation({
  args: { cursor: v.union(v.string(), v.null()) },
  handler: async (ctx, { cursor }) => {
    const r = await ctx.db.query("boardMeta").paginate({ cursor, numItems: 500 });
    for (const b of r.page) await ctx.db.patch(b._id, { hash: "" });
    for (const b of r.page) {
      const page = await ctx.db.query("boards").withIndex("by_key", (q) => q.eq("key", b.key)).first();
      if (page) await ctx.db.patch(page._id, { hash: "" });
    }
    return { n: r.page.length, cursor: r.continueCursor, done: r.isDone };
  },
});

// ─── Pays des comptes sans pays relevé (convex/radarRegions.ts) ────────────────────────────────

/** Les pays déjà lus, page par page : [pseudo, pays]. */
export const regionPage = internalQuery({
  args: { cursor: v.union(v.string(), v.null()) },
  handler: async (ctx, { cursor }) => {
    const r = await ctx.db.query("accountRegions").paginate({ cursor, numItems: 4000 });
    return { items: r.page.filter((x) => x.country).map((x) => [x.handle, x.country] as [string, string]), cursor: r.continueCursor, done: r.isDone };
  },
});

/** Les comptes à situer (synchro) : ajoutés, ou leurs vidéos mises à jour ; un compte déjà situé ne bouge pas. */
export const saveRegionTodo = internalMutation({
  args: { items: v.array(v.object({ handle: v.string(), ids: v.array(v.string()) })) },
  handler: async (ctx, { items }) => {
    for (const it of items) {
      const row = await ctx.db.query("accountRegions").withIndex("by_handle", (q) => q.eq("handle", it.handle)).first();
      if (!row) await ctx.db.insert("accountRegions", { handle: it.handle, country: null, ids: it.ids, tries: 0, at: 0 });
      else if (!row.country && row.ids.join() !== it.ids.join()) await ctx.db.patch(row._id, { ids: it.ids, tries: 0, at: 0 });
    }
  },
});

/**
 * Réserve les prochains comptes à lire (sans pays, moins de 3 essais, pas essayés depuis 6 h) : marqués « essayés
 * maintenant » tout de suite, pour que deux lectures en même temps (tâche du quart d'heure, lecture lancée par la
 * synchro) ne relisent pas les mêmes comptes — ce qui arrivait le 14/11.
 */
export const claimRegions = internalMutation({
  args: { limit: v.number(), now: v.number() },
  handler: async (ctx, { limit, now }) => {
    const rows = await pendingRows(limit, (tries) => ctx.db.query("accountRegions").withIndex("by_country_tries_at", (q) => q.eq("country", null).eq("tries", tries).lt("at", now - 6 * 3_600_000)));
    for (const r of rows) await ctx.db.patch(r._id, { at: now });
    return rows.map((r) => ({ handle: r.handle, ids: r.ids, tries: r.tries }));
  },
});

/** Les prochains comptes à lire : sans pays, moins de 3 essais, pas essayés depuis 6 h. */
export const regionBatch = internalQuery({
  args: { limit: v.number(), now: v.number() },
  handler: async (ctx, { limit, now }) => {
    const rows = await pendingRows(limit, (tries) => ctx.db.query("accountRegions").withIndex("by_country_tries_at", (q) => q.eq("country", null).eq("tries", tries).lt("at", now - 6 * 3_600_000)));
    return rows.map((r) => ({ handle: r.handle, ids: r.ids, tries: r.tries }));
  },
});

/**
 * Le résultat d'une lecture : le pays trouvé (ou null), un essai de plus. Sans réponse de TikTok : même vidéo reprise
 * dans 6 h sans compter d'essai, sauf au 6e silence.
 */
export const saveRegions = internalMutation({
  args: { items: v.array(v.object({ handle: v.string(), country: v.union(v.string(), v.null()), retry: v.optional(v.boolean()) })), now: v.number() },
  handler: async (ctx, { items, now }) => {
    for (const it of items) {
      const row = await ctx.db.query("accountRegions").withIndex("by_handle", (q) => q.eq("handle", it.handle)).first();
      if (!row) continue;
      if (it.retry && !it.country) {
        const quiet = (row.quiet ?? 0) + 1;
        await ctx.db.patch(row._id, quiet >= 6 ? { quiet: 0, tries: row.tries + 1, at: now } : { quiet, at: now });
      }
      else await ctx.db.patch(row._id, { country: it.country, tries: row.tries + 1, at: now, ...(it.country ? { foundAt: now } : {}) });
    }
  },
});

// ─── Carrousels (convex/radarSlides.ts) ────────────────────────────────────────────────────────

/**
 * Toutes les vidéos de la file, page par page : [id, nombre de photos] (0 : pas un carrousel, -1 : pas encore lue).
 * Les vidéos en attente comptent aussi : la synchro ne les ré-enregistre pas (le 14/11, ré-enregistrer 45 000 vidéos
 * avant d'écrire les pages a fait manquer le temps à la synchro de prod).
 */
export const slidePage = internalQuery({
  args: { cursor: v.union(v.string(), v.null()) },
  handler: async (ctx, { cursor }) => {
    const r = await ctx.db.query("videoSlides").paginate({ cursor, numItems: 4000 });
    return { items: r.page.map((x) => [x.videoId, x.slideshow === null ? -1 : x.slideshow ? x.images ?? 1 : 0] as [string, number]),
      cursor: r.continueCursor, done: r.isDone };
  },
});

/** Les vidéos à vérifier (synchro) : celles que les écrans montrent et qu'on n'a jamais lues. */
export const saveSlideTodo = internalMutation({
  args: { ids: v.array(v.string()) },
  handler: async (ctx, { ids }) => {
    for (const videoId of ids) {
      const row = await ctx.db.query("videoSlides").withIndex("by_video", (q) => q.eq("videoId", videoId)).first();
      if (!row) await ctx.db.insert("videoSlides", { videoId, slideshow: null, tries: 0, at: 0 });
    }
  },
});

const slideTodo = (ctx: QueryCtx, now: number, limit: number) =>
  pendingRows(limit, (tries) => ctx.db.query("videoSlides").withIndex("by_slideshow_tries_at", (q) => q.eq("slideshow", null).eq("tries", tries).lt("at", now - 6 * 3_600_000)));

/** Réserve les prochaines vidéos à lire (marquées « essayées maintenant » : deux lectures ne prennent pas les mêmes). */
export const claimSlides = internalMutation({
  args: { limit: v.number(), now: v.number() },
  handler: async (ctx, { limit, now }) => {
    const rows = await slideTodo(ctx, now, limit);
    for (const r of rows) await ctx.db.patch(r._id, { at: now });
    return rows.map((r) => r.videoId);
  },
});

export const slideLeft = internalQuery({
  args: { now: v.number() },
  handler: async (ctx, { now }) => (await slideTodo(ctx, now, 1)).length > 0,
});

/**
 * Le résultat d'une lecture : carrousel ou non. Échec (null) : sans réponse de TikTok, reprise dans 6 h sans compter
 * d'essai, sauf au 6e silence ; disparue, abandonnée (3 essais) ; page illisible, un essai de plus.
 */
export const saveSlides = internalMutation({
  args: {
    items: v.array(v.object({ videoId: v.string(), slideshow: v.union(v.boolean(), v.null()), images: v.number(), retry: v.optional(v.boolean()), gone: v.optional(v.boolean()) })),
    now: v.number(),
  },
  handler: async (ctx, { items, now }) => {
    for (const it of items) {
      const row = await ctx.db.query("videoSlides").withIndex("by_video", (q) => q.eq("videoId", it.videoId)).first();
      if (!row) continue;
      if (it.slideshow !== null) await ctx.db.patch(row._id, { slideshow: it.slideshow, ...(it.slideshow ? { images: it.images } : {}), tries: row.tries + 1, at: now });
      else if (it.retry) {
        const quiet = (row.quiet ?? 0) + 1;
        await ctx.db.patch(row._id, quiet >= 6 ? { quiet: 0, tries: row.tries + 1, at: now } : { quiet, at: now });
      }
      else if (it.gone) await ctx.db.patch(row._id, { tries: 3, at: now });
      else await ctx.db.patch(row._id, { tries: row.tries + 1, at: now });
    }
  },
});

// ─── Lecture IA des vidéos et des comptes (convex/radarAi.ts) ──────────────────────────────────

const RETRY_MS = 6 * 3_600_000;

/** Toutes les vidéos de la file : [id, type, texte à l'écran, lue ? 1 : 0] (en attente : connues, pas ré-enregistrées). */
export const videoAiPage = internalQuery({
  args: { cursor: v.union(v.string(), v.null()) },
  handler: async (ctx, { cursor }) => {
    const r = await ctx.db.query("videoAi").paginate({ cursor, numItems: 1000, maximumBytesRead: 6_000_000 });
    return { items: r.page.map((x) => [x.videoId, x.type ?? "", x.text ?? "", x.done ? 1 : 0] as [string, string, string, number]), cursor: r.continueCursor, done: r.isDone };
  },
});

/** Tous les comptes de la file : [pseudo, genre, lu ? 1 : 0]. */
export const genderPage = internalQuery({
  args: { cursor: v.union(v.string(), v.null()) },
  handler: async (ctx, { cursor }) => {
    const r = await ctx.db.query("accountAi").paginate({ cursor, numItems: 4000 });
    // [pseudo, genre, lu, version, miniatures où il se montre, miniatures lues] (version 2 : lecture par le contenu, 18/11).
    return { items: r.page.map((x) => [x.handle, x.gender ?? "", x.done ? 1 : 0, x.v ?? 1, x.self ?? 0, x.covers ?? 0] as [string, string, number, number, number, number]), cursor: r.continueCursor, done: r.isDone };
  },
});

export const saveVideoAiTodo = internalMutation({
  args: { ids: v.array(v.string()) },
  handler: async (ctx, { ids }) => {
    for (const videoId of ids) {
      if (!(await ctx.db.query("videoAi").withIndex("by_video", (q) => q.eq("videoId", videoId)).first())) {
        await ctx.db.insert("videoAi", { videoId, done: false, tries: 0, at: 0 });
      }
    }
  },
});

export const saveGenderTodo = internalMutation({
  args: { items: v.array(v.object({ handle: v.string(), ids: v.array(v.string()) })) },
  handler: async (ctx, { items }) => {
    for (const it of items) {
      const row = await ctx.db.query("accountAi").withIndex("by_handle", (q) => q.eq("handle", it.handle)).first();
      if (!row) await ctx.db.insert("accountAi", { handle: it.handle, done: false, ids: it.ids, tries: 0, at: 0, v: 2 });
      // Ancienne lecture (photo de profil comprise comme preuve) : relue sur le contenu ; son genre reste affiché d'ici là.
      else if ((row.v ?? 1) < 2) await ctx.db.patch(row._id, { ids: it.ids, done: false, tries: 0, quiet: 0, at: 0, v: 2 });
    }
  },
});

/** Réserve les prochaines vidéos à lire ; `max` : plafond de vidéos lues en tout (dev : SWARM_KINDS_LIMIT). */
export const claimVideoAi = internalMutation({
  args: { limit: v.number(), now: v.number(), max: v.union(v.number(), v.null()) },
  handler: async (ctx, { limit, now, max }) => {
    let take = limit;
    if (max !== null) take = Math.min(limit, Math.max(0, max - (await ctx.db.query("videoAi").withIndex("by_done_at", (q) => q.eq("done", true)).take(max)).length));
    if (!take) return [];
    const rows = await pendingRows(take, (tries) => ctx.db.query("videoAi").withIndex("by_done_tries_at", (q) => q.eq("done", false).eq("tries", tries).lt("at", now - RETRY_MS)));
    for (const r of rows) await ctx.db.patch(r._id, { at: now });
    return rows.map((r) => r.videoId);
  },
});

export const claimGender = internalMutation({
  args: { limit: v.number(), now: v.number(), max: v.union(v.number(), v.null()) },
  handler: async (ctx, { limit, now, max }) => {
    let take = limit;
    if (max !== null) take = Math.min(limit, Math.max(0, max - (await ctx.db.query("accountAi").withIndex("by_done_at", (q) => q.eq("done", true)).take(max)).length));
    if (!take) return [];
    const rows = await pendingRows(take, (tries) => ctx.db.query("accountAi").withIndex("by_done_tries_at", (q) => q.eq("done", false).eq("tries", tries).lt("at", now - RETRY_MS)));
    for (const r of rows) await ctx.db.patch(r._id, { at: now });
    return rows.map((r) => ({ handle: r.handle, ids: r.ids }));
  },
});

export const saveVideoAi = internalMutation({
  args: {
    items: v.array(v.object({ videoId: v.string(), ok: v.boolean(), type: v.optional(v.string()), text: v.optional(v.string()), retry: v.optional(v.boolean()), gone: v.optional(v.boolean()), unshown: v.optional(v.boolean()) })),
    now: v.number(),
  },
  handler: async (ctx, { items, now }) => {
    for (const it of items) {
      const row = await ctx.db.query("videoAi").withIndex("by_video", (q) => q.eq("videoId", it.videoId)).first();
      if (!row) continue;
      // Plus montrée (plus de page) : retirée de la file ; la synchro la remet si la vidéo revient dans un écran.
      if (it.unshown) await ctx.db.delete(row._id);
      else if (it.ok) await ctx.db.patch(row._id, { done: true, type: it.type, text: it.text, tries: row.tries + 1, at: now });
      // Sans réponse de TikTok : reprise dans 6 h, sans compter d'essai — sauf au 6e silence (36 h), qui en compte un ;
      // disparue : abandonnée (3 essais).
      else if (it.retry) {
        const quiet = (row.quiet ?? 0) + 1;
        await ctx.db.patch(row._id, quiet >= 6 ? { quiet: 0, tries: row.tries + 1, at: now } : { quiet, at: now });
      }
      else if (it.gone) await ctx.db.patch(row._id, { tries: 3, at: now });
      else await ctx.db.patch(row._id, { tries: row.tries + 1, at: now });
    }
  },
});

export const saveGender = internalMutation({
  args: {
    items: v.array(v.object({ handle: v.string(), ok: v.boolean(), gender: v.optional(v.string()), self: v.optional(v.number()), covers: v.optional(v.number()), retry: v.optional(v.boolean()), gone: v.optional(v.boolean()), unshown: v.optional(v.boolean()) })),
    now: v.number(),
  },
  handler: async (ctx, { items, now }) => {
    for (const it of items) {
      const row = await ctx.db.query("accountAi").withIndex("by_handle", (q) => q.eq("handle", it.handle)).first();
      if (!row) continue;
      if (it.unshown) await ctx.db.delete(row._id); // plus montré : retiré, comme les vidéos
      else if (it.ok) await ctx.db.patch(row._id, { done: true, gender: it.gender, self: it.self, covers: it.covers, v: 2, tries: row.tries + 1, at: now });
      // Comme les vidéos : sans réponse de TikTok, reprise sans essai (un au 6e silence) ; compte disparu, abandonné.
      else if (it.retry) {
        const quiet = (row.quiet ?? 0) + 1;
        await ctx.db.patch(row._id, quiet >= 6 ? { quiet: 0, tries: row.tries + 1, at: now } : { quiet, at: now });
      }
      else if (it.gone) await ctx.db.patch(row._id, { tries: 3, at: now });
      else await ctx.db.patch(row._id, { tries: row.tries + 1, at: now });
    }
  },
});

/** Reste-t-il à lire (vidéos ou comptes) ? */
export const aiLeft = internalQuery({
  args: { table: v.union(v.literal("videoAi"), v.literal("accountAi")), now: v.number() },
  handler: async (ctx, { table, now }) =>
    (await pendingRows(1, (tries) => ctx.db.query(table).withIndex("by_done_tries_at", (q) => q.eq("done", false).eq("tries", tries).lt("at", now - RETRY_MS)))).length > 0,
});

// ─── Bail des lectures de fond ────────────────────────────────────────────────────────────────


/**
 * Prend (ou renouvelle) le bail `name` pour `token` : faux si une autre chaîne le tient, ou si une synchro tourne.
 * 14/11 : chaque tâche du quart d'heure lançait une chaîne de plus (lecture IA, carrousels) ; elles s'empilaient et
 * appelaient /cover en même temps que la synchro, morte en route à 21h43.
 */
export const takeLease = internalMutation({
  args: { name: v.string(), token: v.string(), ms: v.number(), now: v.number(), steal: v.optional(v.boolean()) },
  handler: async (ctx, { name, token, ms, now, steal }) => {
    const run = await ctx.db.query("syncRuns").withIndex("by_started").order("desc").first();
    if (runAlive(run, now)) return false;
    const row = await ctx.db.query("leases").withIndex("by_name", (q) => q.eq("name", name)).first();
    // steal : la copie des miniatures prend le bail même tenu (la chaîne qui le tenait s'arrête à son prochain lot).
    if (row && row.until > now && row.token !== token && !steal) return false;
    if (row) await ctx.db.patch(row._id, { token, until: now + ms });
    else await ctx.db.insert("leases", { name, token, until: now + ms });
    return true;
  },
});

export const dropLease = internalMutation({
  args: { name: v.string(), token: v.string() },
  handler: async (ctx, { name, token }) => {
    const row = await ctx.db.query("leases").withIndex("by_name", (q) => q.eq("name", name)).first();
    if (row && row.token === token) await ctx.db.patch(row._id, { until: 0 });
  },
});

// ─── Langue des comptes (convex/radarLang.ts) ──────────────────────────────────────────────────

/** Les comptes calculés : [id, langue ("" : on ne sait pas), date du calcul]. */
export const langPage = internalQuery({
  args: { cursor: v.union(v.string(), v.null()) },
  handler: async (ctx, { cursor }) => {
    const r = await ctx.db.query("accountLangs").paginate({ cursor, numItems: 5000 });
    return { items: r.page.map((x) => [x.accountId, x.lang ?? "", x.at] as [string, string, number]), cursor: r.continueCursor, done: r.isDone };
  },
});

/** Efface les langues de comptes que l'export ne connaît plus (audit Q56). */
export const dropLangs = internalMutation({
  args: { ids: v.array(v.string()) },
  handler: async (ctx, { ids }) => {
    for (const accountId of ids) {
      const row = await ctx.db.query("accountLangs").withIndex("by_account", (q) => q.eq("accountId", accountId)).first();
      if (row) await ctx.db.delete(row._id);
    }
  },
});

// ─── Ménage des tables de suivi (audit Q56, F30) ─────────────────────────────────────────────────────────────────

/**
 * Audit Q56 (19/11) : videoSlides, videoAi et mediaMiss gardaient une ligne par vidéo jamais montrée (+430 lignes/h
 * chacune), syncRuns une ligne par passage, et la synchro relit ces tables en entier. Après chaque passage, une ligne dont
 * la page n'existe plus (video:<id>, creator:<pseudo>, app:<slug>, d'après boardMeta) est effacée, une fois passé
 * son délai : 7 jours après son dernier essai pour les lectures (une vidéo qui revient est relue), 30 jours pour un
 * échec de copie. Les passages de plus de 30 jours partent aussi.
 */
export const PURGE_TABLES = ["videoAi", "videoSlides", "mediaMiss", "syncRuns"] as const;
const READ_KEEP_MS = 7 * 86_400_000, MISS_KEEP_MS = 30 * 86_400_000, RUNS_KEEP_MS = 30 * 86_400_000;
const pageOf = (table: string, row: { videoId?: string; key?: string }) => {
  if (table !== "mediaMiss") return `video:${row.videoId}`;
  const k = row.key ?? "";
  return k.startsWith("v:") ? `video:${k.slice(2)}` : k.startsWith("a:") ? `creator:${k.slice(2)}` : k.startsWith("icon:") ? `app:${k.slice(5)}` : null;
};
export const purgePage = internalMutation({
  args: { table: v.union(v.literal("videoAi"), v.literal("videoSlides"), v.literal("mediaMiss"), v.literal("syncRuns")), cursor: v.union(v.string(), v.null()), now: v.number() },
  handler: async (ctx, { table, cursor, now }) => {
    const r = await ctx.db.query(table).paginate({ cursor, numItems: 500 });
    let dropped = 0;
    for (const row of r.page as ({ _id: Id<"videoAi"> | Id<"videoSlides"> | Id<"mediaMiss"> | Id<"syncRuns">; at?: number; startedAt?: number; finishedAt?: number; videoId?: string; key?: string })[]) {
      if (table === "syncRuns") {
        if (row.finishedAt && (row.startedAt ?? now) < now - RUNS_KEEP_MS) { await ctx.db.delete(row._id); dropped++; }
        continue;
      }
      if ((row.at ?? 0) >= now - (table === "mediaMiss" ? MISS_KEEP_MS : READ_KEEP_MS)) continue;
      const page = pageOf(table, row);
      if (page && (await ctx.db.query("boardMeta").withIndex("by_key", (q) => q.eq("key", page)).first())) continue;
      await ctx.db.delete(row._id);
      dropped++;
    }
    return { n: r.page.length, dropped, cursor: r.continueCursor, done: r.isDone };
  },
});

/**
 * Le stockage, page par page (audit F30) : fichiers et octets, images (et parmi elles celles qu'aucune ligne media ne
 * cite : rangées puis perdues), fichiers d'étape (JSON). Lecture seule.
 */
export const storagePage = internalQuery({
  args: { cursor: v.union(v.string(), v.null()) },
  handler: async (ctx, { cursor }) => {
    const r = await ctx.db.system.query("_storage").paginate({ cursor, numItems: 2000 });
    return { files: r.page.map((f) => [f._id, f.size, (f.contentType ?? "").split(";")[0].trim(), f._creationTime] as [string, number, string, number]), cursor: r.continueCursor, done: r.isDone };
  },
});
/** Les fichiers cités par une ligne media, page par page. */
export const mediaFilesPage = internalQuery({
  args: { cursor: v.union(v.string(), v.null()) },
  handler: async (ctx, { cursor }) => {
    const r = await ctx.db.query("media").paginate({ cursor, numItems: 4000 });
    return { ids: r.page.map((m) => m.storageId as string), cursor: r.continueCursor, done: r.isDone };
  },
});
/** Ajoute au compte rendu d'un passage (syncRuns.counts) une rubrique calculée après sa fin. */
export const noteCounts = internalMutation({
  args: { id: v.id("syncRuns"), extra: v.any() },
  handler: async (ctx, { id, extra }) => {
    const r = await ctx.db.get(id);
    if (r) await ctx.db.patch(id, { counts: { ...(r.counts ?? {}), ...extra } });
  },
});

/**
 * Le ménage de fin de passage (lancé par radarSync.runGlobal), table par table, par tranches de 2 min qui se relancent ;
 * puis le relevé du stockage, noté dans le compte rendu du passage (counts.purged, counts.storage).
 */
export const purgeTracking = internalAction({
  args: { runId: v.id("syncRuns"), t: v.optional(v.number()), cursor: v.optional(v.union(v.string(), v.null())), dropped: v.optional(v.any()) },
  handler: async (ctx, args): Promise<void> => {
    const start = Date.now();
    const dropped: Record<string, number> = { ...(args.dropped ?? {}) };
    let t = args.t ?? 0, cursor: string | null = args.cursor ?? null;
    while (t < PURGE_TABLES.length) {
      if (Date.now() - start > 120_000) { await ctx.scheduler.runAfter(0, internal.radarStore.purgeTracking, { runId: args.runId, t, cursor, dropped }); return; }
      const table = PURGE_TABLES[t];
      const r: { n: number; dropped: number; cursor: string; done: boolean } = await ctx.runMutation(internal.radarStore.purgePage, { table, cursor, now: start });
      dropped[table] = (dropped[table] ?? 0) + r.dropped;
      if (r.done) { t++; cursor = null; } else cursor = r.cursor;
    }
    // Relevé du stockage (audit F30 : la pente n'était suivie nulle part).
    const cited = new Set<string>();
    for (let c: string | null = null, done = false; !done; ) {
      const p: { ids: string[]; cursor: string; done: boolean } = await ctx.runQuery(internal.radarStore.mediaFilesPage, { cursor: c });
      for (const id of p.ids) cited.add(id);
      c = p.cursor; done = p.done;
    }
    const storage = { files: 0, mo: 0, images: 0, imagesMo: 0, orphanImages: 0, orphanImagesMo: 0, stageFiles: 0, stageMo: 0 };
    let bytes = 0, imageBytes = 0, orphanBytes = 0, stageBytes = 0;
    const dayAgo = start - 86_400_000;
    for (let c: string | null = null, done = false; !done; ) {
      const p: { files: [string, number, string, number][]; cursor: string; done: boolean } = await ctx.runQuery(internal.radarStore.storagePage, { cursor: c });
      for (const [id, size, type, created] of p.files) {
        storage.files++; bytes += size;
        if (type === "application/json") { storage.stageFiles++; stageBytes += size; continue; }
        storage.images++; imageBytes += size;
        // Image de plus d'un jour qu'aucune ligne media ne cite : rangée puis perdue (Q61, Q62), jamais effacée.
        if (!cited.has(id) && created < dayAgo) { storage.orphanImages++; orphanBytes += size; }
      }
      c = p.cursor; done = p.done;
    }
    Object.assign(storage, { mo: Math.round(bytes / 1e6), imagesMo: Math.round(imageBytes / 1e6), orphanImagesMo: Math.round(orphanBytes / 1e6), stageMo: Math.round(stageBytes / 1e6), mediaRows: cited.size });
    await ctx.runMutation(internal.radarStore.noteCounts, { id: args.runId, extra: { purged: dropped, storage } });
    console.log(`[ménage] effacées : ${JSON.stringify(dropped)} ; stockage : ${JSON.stringify(storage)}`);
  },
});

export const saveLangs = internalMutation({
  args: { items: v.array(v.object({ accountId: v.string(), lang: v.union(v.string(), v.null()) })), now: v.number() },
  handler: async (ctx, { items, now }) => {
    for (const it of items) {
      const row = await ctx.db.query("accountLangs").withIndex("by_account", (q) => q.eq("accountId", it.accountId)).first();
      if (row) await ctx.db.patch(row._id, { lang: it.lang, at: now });
      else await ctx.db.insert("accountLangs", { accountId: it.accountId, lang: it.lang, at: now });
    }
  },
});
