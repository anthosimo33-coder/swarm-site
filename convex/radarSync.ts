"use node";

import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { internalAction } from "./_generated/server";
import type { ActionCtx } from "./_generated/server";
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
const MEDIA_BUDGET_MS = 6 * 60_000;
const PARALLEL = 16;
const MAX_IMAGE_BYTES = 4_000_000;
/** Taille servie : une vignette fait au plus 360 px de large à l'écran (720 en Retina), une icône 256 px. */
const COVER_WIDTH = 480;
const ICON_SIZE = 256;
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

type StoreHit = { artworkUrl512?: string; artworkUrl100?: string; trackViewUrl?: string; trackName?: string };
/** La fiche App Store d'une app, cherchée par son nom (premier résultat). */
async function appStoreHit(name: string): Promise<StoreHit | null> {
  try {
    const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(name)}&entity=software&limit=1&country=fr`);
    if (!res.ok) return null;
    const body = (await res.json()) as { results?: StoreHit[] };
    return body.results?.[0] ?? null;
  } catch {
    return null;
  }
}

/** L'URL d'une image : l'icône d'une app via l'App Store, sinon l'URL source telle quelle. */
async function imageUrl(source: string): Promise<string | null> {
  if (!source.startsWith("itunes:")) return source;
  const hit = await appStoreHit(source.slice("itunes:".length));
  return hit?.artworkUrl512 ?? hit?.artworkUrl100 ?? null;
}

/** L'image réduite à sa taille d'affichage, en WebP (5 à 10 fois plus légère) ; l'originale si la réduction échoue. */
async function shrink(buf: ArrayBuffer, type: string, key: string): Promise<{ data: ArrayBuffer; type: string }> {
  try {
    const sharp = (await import("sharp")).default;
    const img = sharp(Buffer.from(buf)).rotate();
    const out = key.startsWith("icon:")
      ? await img.resize({ width: ICON_SIZE, height: ICON_SIZE, fit: "cover" }).webp({ quality: 85 }).toBuffer()
      : await img.resize({ width: COVER_WIDTH, withoutEnlargement: true }).webp({ quality: 72 }).toBuffer();
    if (out.byteLength >= buf.byteLength) return { data: buf, type };
    return { data: out.buffer.slice(out.byteOffset, out.byteOffset + out.byteLength) as ArrayBuffer, type: "image/webp" };
  } catch {
    return { data: buf, type };
  }
}

async function copyImage(ctx: ActionCtx, key: string, source: string) {
  try {
    const url = await imageUrl(source);
    if (!url) return null;
    const res = await fetch(url);
    const type = res.headers.get("content-type") ?? "";
    if (!res.ok || !type.startsWith("image/")) return null;
    const buf = await res.arrayBuffer();
    if (buf.byteLength === 0 || buf.byteLength > MAX_IMAGE_BYTES) return null;
    const small = await shrink(buf, type, key);
    const storageId = (await ctx.storage.store(new Blob([small.data], { type: small.type }))) as Id<"_storage">;
    const served = await ctx.storage.getUrl(storageId);
    return served ? { key, storageId, url: served } : null;
  } catch {
    return null; // une miniature expirée ou refusée : l'écran montre son repli
  }
}

export const run = internalAction({
  args: {},
  handler: async (ctx): Promise<Record<string, number>> => {
    const runId = await ctx.runMutation(internal.radarStore.startRun, {});
    try {
      const base = process.env.JARVIA_EXPORT_URL ?? DEFAULT_EXPORT_URL;
      const secret = process.env.JARVIA_EXPORT_SECRET;
      if (!secret) throw new Error("JARVIA_EXPORT_SECRET absente");

      const raw = {} as Raw;
      for (const t of TABLES) (raw as Record<string, unknown>)[t] = await fetchTable(base, secret, t);

      const now = Date.now();
      const media: Record<string, string> = await ctx.runQuery(internal.radarStore.mediaMap, {});
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
      let { boards, need, used } = buildBoards(raw, now, (k) => media[k] ?? null, storeOf);

      // Miniatures et icônes manquantes, par lots parallèles, dans le temps imparti.
      const todo = [...need.entries()].slice(0, MEDIA_PER_RUN);
      const mediaStart = Date.now();
      let copied = 0;
      for (let i = 0; i < todo.length && Date.now() - mediaStart < MEDIA_BUDGET_MS; i += PARALLEL) {
        const got = (await Promise.all(todo.slice(i, i + PARALLEL).map(([k, src]) => copyImage(ctx, k, src)))).filter(
          (x): x is { key: string; storageId: Id<"_storage">; url: string } => x !== null,
        );
        if (got.length) {
          await ctx.runMutation(internal.radarStore.saveMedia, { items: got });
          for (const g of got) media[g.key] = g.url;
          copied += got.length;
        }
      }
      if (copied) ({ boards, need, used } = buildBoards(raw, now, (k) => media[k] ?? null, storeOf));

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
