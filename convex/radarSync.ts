"use node";

import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { internalAction } from "./_generated/server";
import { appStoreHit, copyImage } from "./imageCopy";
import { buildBoards, type Raw } from "./radarModels";

/**
 * Synchronisation quotidienne du Radar (cron, convex/crons.ts) :
 *  1. lit l'export de Jarvia, table par table, page par page (clé JARVIA_EXPORT_SECRET) ;
 *  2. calcule les données de chaque écran (convex/radarModels.ts) ;
 *  3. recopie chez Swarm les miniatures et icônes qui manquent (les URL TikTok expirent) ;
 *  4. écrit les documents des écrans qui ont changé.
 * Lancer à la main : `npx convex run radarSync:run` (dev) — jamais de `convex deploy` pour ça.
 */

const DEFAULT_EXPORT_URL = "https://giddy-bass-969.eu-west-1.convex.site";
const TABLES = ["apps", "tracked", "trackedVideos", "formats", "signals"] as const;
/** Miniatures recopiées par passage, et temps qu'on leur donne : le reste attend le passage suivant
 * (l'URL source sert en attendant). Un passage tient sous les 10 min d'une action. */
const MEDIA_PER_RUN = 8000;
const MEDIA_BUDGET_MS = 5 * 60_000;
const PARALLEL = 20;
/** Une miniature introuvable depuis moins de 3 jours : la vidéo est retirée des listes (au-delà, on réessaie). */
const MISS_HIDE_MS = 3 * 86_400_000;
/** Taille d'un lot d'écriture : arguments bornés, et chaque document est relu (4 096 lectures au plus par mutation). */
const BATCH_BYTES = 3_000_000;
const BATCH_ITEMS = 400;

async function fetchTable(base: string, secret: string, table: (typeof TABLES)[number]) {
  const rows: unknown[] = [];
  let cursor: string | null = null;
  for (let page = 0; page < 500; page++) {
    const url = `${base}/swarm/export?table=${table}${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${secret}` } });
    if (!res.ok) throw new Error(`export ${table} : HTTP ${res.status}`);
    const body = (await res.json()) as { rows: unknown[]; cursor: string; done: boolean };
    rows.push(...body.rows);
    if (body.done) return rows;
    cursor = body.cursor;
  }
  throw new Error(`export ${table} : trop de pages`);
}

/** Empreinte rapide (FNV-1a sur 2×32 bits) du contenu, sans la date de calcul. */
function hashOf(data: unknown): string {
  const { updatedAt: _ignored, ...rest } = (data ?? {}) as Record<string, unknown>;
  const s = JSON.stringify(rest);
  let h1 = 0x811c9dc5, h2 = 0x01000193;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 16777619) >>> 0;
    h2 = Math.imul(h2 ^ c, 2246822519) >>> 0;
  }
  return h1.toString(16).padStart(8, "0") + h2.toString(16).padStart(8, "0");
}

/**
 * Réparation (13/11) : efface les images rangées en HEIC, recopiées ensuite en JPEG/WebP par
 * la synchro (`radarSync:run`) ou à la première vue (/cover/<id>). Rend le nombre effacé.
 */
export const repairHeic = internalAction({
  args: {},
  handler: async (ctx): Promise<number> => {
    const keys: string[] = [];
    for (let cursor: string | null = null, done = false; !done; ) {
      const page: { keys: string[]; cursor: string; done: boolean } = await ctx.runQuery(internal.radarStore.heicPage, { cursor });
      keys.push(...page.keys);
      cursor = page.cursor;
      done = page.done;
    }
    for (let i = 0; i < keys.length; i += 200) await ctx.runMutation(internal.radarStore.dropMedia, { keys: keys.slice(i, i + 200) });
    return keys.length;
  },
});

export const run = internalAction({
  args: {},
  handler: async (ctx): Promise<Record<string, number>> => {
    const runId = await ctx.runMutation(internal.radarStore.startRun, {});
    if (runId === null) return { skipped: 1 }; // un passage tourne déjà
    try {
      const base = process.env.JARVIA_EXPORT_URL ?? DEFAULT_EXPORT_URL;
      const secret = process.env.JARVIA_EXPORT_SECRET;
      if (!secret) throw new Error("JARVIA_EXPORT_SECRET absente");

      const raw = {} as Raw;
      for (const t of TABLES) (raw as Record<string, unknown>)[t] = await fetchTable(base, secret, t);

      const now = Date.now();
      const media: Record<string, string> = {};
      for (let cursor: string | null = null, done = false; !done; ) {
        const page: { items: [string, string][]; cursor: string; done: boolean } = await ctx.runQuery(internal.radarStore.mediaPage, { cursor });
        for (const [key, url] of page.items) media[key] = url;
        cursor = page.cursor;
        done = page.done;
      }
      // Fiche App Store des apps qu'on n'a pas encore cherchées (une recherche par app, une seule fois).
      const stores = await ctx.runQuery(internal.radarStore.appStoreMap, {});
      const found: { slug: string; url: string | null }[] = [];
      for (const a of raw.apps) {
        if (a.slug in stores || a.mergedInto) continue;
        const hit = await appStoreHit(a.name);
        stores[a.slug] = hit?.trackViewUrl ?? null;
        found.push({ slug: a.slug, url: stores[a.slug] });
      }
      if (found.length) await ctx.runMutation(internal.radarStore.saveAppStore, { items: found });
      const storeOf = (slug: string) => stores[slug] ?? null;
      // Miniatures introuvables récemment (vidéo supprimée, compte privé) : ces vidéos n'apparaissent pas.
      const misses = new Map<string, number>();
      for (let cursor: string | null = null, done = false; !done; ) {
        const page: { items: [string, number][]; cursor: string; done: boolean } = await ctx.runQuery(internal.radarStore.missPage, { cursor });
        for (const [key, at] of page.items) misses.set(key, at);
        cursor = page.cursor;
        done = page.done;
      }
      const site = process.env.CONVEX_SITE_URL ?? null;
      const opts = {
        missing: (k: string) => (misses.get(k) ?? 0) > now - MISS_HIDE_MS,
        coverUrl: (id: string) => (site && /^(\d{6,25}|ig:[A-Za-z0-9_-]{5,40})$/.test(id) ? `${site}/cover/${id}` : null),
      };
      let { boards, need, used } = buildBoards(raw, now, (k) => media[k] ?? null, storeOf, opts);

      // Miniatures et icônes manquantes : 20 copies en continu, dans le temps imparti.
      const todo = [...need.entries()].slice(0, MEDIA_PER_RUN);
      const mediaStart = Date.now();
      let copied = 0;
      const got: { key: string; storageId: Id<"_storage">; url: string }[] = [];
      const failed: string[] = [];
      const flushMedia = async () => {
        if (got.length) await ctx.runMutation(internal.radarStore.saveMedia, { items: got.splice(0) });
        if (failed.length) await ctx.runMutation(internal.radarStore.markMisses, { keys: failed.splice(0) });
      };
      let next = 0;
      const worker = async () => {
        while (next < todo.length && Date.now() - mediaStart < MEDIA_BUDGET_MS) {
          const [k, src] = todo[next++];
          const r = await copyImage(ctx, k, src);
          if (r) {
            got.push(r);
            media[r.key] = r.url;
            copied++;
          } else if (k.startsWith("v:")) {
            failed.push(k);
            misses.set(k, Date.now());
          }
          if (got.length + failed.length >= 100) await flushMedia();
        }
      };
      await Promise.all(Array.from({ length: PARALLEL }, worker));
      await flushMedia();
      ({ boards, need, used } = buildBoards(raw, now, (k) => media[k] ?? null, storeOf, opts));

      // Les images qu'aucun document ne cite plus (vidéo sortie des listes) : effacées.
      const stale = Object.keys(media).filter((k) => !used.has(k));
      for (let i = 0; i < stale.length; i += 200) await ctx.runMutation(internal.radarStore.dropMedia, { keys: stale.slice(i, i + 200) });

      // Écriture des documents, par lots bornés.
      let written = 0;
      let batch: { key: string; hash: string; data: unknown }[] = [];
      let size = 0;
      const flush = async () => {
        if (!batch.length) return;
        written += await ctx.runMutation(internal.radarStore.saveBoards, { items: batch, now });
        batch = [];
        size = 0;
      };
      for (const [key, data] of boards) {
        const bytes = JSON.stringify(data).length;
        if (size + bytes > BATCH_BYTES || batch.length >= BATCH_ITEMS) await flush();
        batch.push({ key, hash: hashOf(data), data });
        size += bytes;
      }
      await flush();

      // Les documents que ce passage n'a plus produits : effacés (leur fiche mène à « introuvable »).
      const existing: string[] = [];
      for (let cursor: string | null = null, done = false; !done; ) {
        const page: { keys: string[]; cursor: string; done: boolean } = await ctx.runQuery(internal.radarStore.boardKeys, { cursor });
        existing.push(...page.keys);
        cursor = page.cursor;
        done = page.done;
      }
      const gone = existing.filter((k) => !boards.has(k));
      for (let i = 0; i < gone.length; i += 200) await ctx.runMutation(internal.radarStore.dropBoards, { keys: gone.slice(i, i + 200) });

      const counts = {
        apps: raw.apps.length, tracked: raw.tracked.length, trackedVideos: raw.trackedVideos.length,
        formats: raw.formats.length, signals: raw.signals.length,
        boards: boards.size, written, mediaCopied: copied, mediaMissing: need.size, mediaDropped: stale.length, boardsDropped: gone.length,
      };
      await ctx.runMutation(internal.radarStore.endRun, { id: runId, ok: true, counts });
      return counts;
    } catch (e) {
      const error = e instanceof Error ? e.message : String(e);
      await ctx.runMutation(internal.radarStore.endRun, { id: runId, ok: false, error });
      throw e;
    }
  },
});
