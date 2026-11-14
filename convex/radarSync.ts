"use node";

import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { internalAction } from "./_generated/server";
import { appStoreHit, appStoreLookup, copyImage } from "./imageCopy";
import { APP_SITE, APP_STORE_ID, buildBoards, iconKey, type Raw } from "./radarModels";

/** Version de la règle qui associe une app à sa fiche App Store (convex/imageCopy.ts, sameApp). */
const STORE_RULE = 6; // 6 : à plusieurs candidates, titre exact ou nette avance en avis ; 5 : fiche exacte par l'identifiant du Radar ; sinon recherche France puis États-Unis, refusée si le nom est ambigu ; icône gardée

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
const PARALLEL = 10; // 20 : pics à 740 Mo de tas (pages TikTok lues à la fois), passage coupé faute de mémoire le 14/11
/** Une miniature introuvable depuis moins de 3 jours : la vidéo est retirée des listes (au-delà, on réessaie). */
const MISS_HIDE_MS = 3 * 86_400_000;
/** Taille d'un lot d'écriture : arguments bornés, et chaque document est relu (4 096 lectures au plus par mutation). */
const BATCH_BYTES = 3_000_000;
const BATCH_ITEMS = 400;

/** Mémoire de l'action à chaque étape (journal Convex) : la limite est de 512 Mo. */
const MEMLOG = (label: string) => { const m = process.memoryUsage(); console.log(`[mem] ${label} rss=${Math.round(m.rss / 1e6)} heap=${Math.round(m.heapUsed / 1e6)} ext=${Math.round(m.external / 1e6)} buf=${Math.round(m.arrayBuffers / 1e6)}`); };
async function fetchTable(base: string, secret: string, table: (typeof TABLES)[number]) {
  const rows: unknown[] = [];
  let cursor: string | null = null;
  for (let page = 0; page < 500; page++) {
    const url = `${base}/swarm/export?table=${table}${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${secret}` }, signal: AbortSignal.timeout(90_000) });
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
      for (const t of TABLES) { (raw as Record<string, unknown>)[t] = await fetchTable(base, secret, t); MEMLOG('export ' + t); }

      const now = Date.now();
      const media: Record<string, string> = {};
      for (let cursor: string | null = null, done = false; !done; ) {
        const page: { items: [string, string][]; cursor: string; done: boolean } = await ctx.runQuery(internal.radarStore.mediaPage, { cursor });
        for (const [key, url] of page.items) media[key] = url;
        cursor = page.cursor;
        done = page.done;
      }
      // Fiche App Store des apps pas encore cherchées avec la règle actuelle (titre qui commence par le
      // nom de l'app) ; une fiche qui change efface l'icône rangée, recopiée depuis la bonne fiche.
      // L'App Store limite à ~20 recherches par minute : une toutes les 3,2 s, 3 min au plus.
      const stores: Record<string, { url: string | null; v: number; art: string | null }> = await ctx.runQuery(internal.radarStore.appStoreMap, {});
      const found: { slug: string; url: string | null; v: number; art: string | null }[] = [];
      let storeErrors = 0;
      const iconsToDrop: string[] = [];
      const storeStart = Date.now();
      // Fiche vérifiée à la main (site ou identifiant) que la fiche rangée ne suit pas encore : revue d'abord.
      const pinnedOff = (slug: string) => {
        const st = stores[slug];
        if (APP_SITE[slug]) return !st || st.url !== null;
        return !!APP_STORE_ID[slug] && !(st?.url ?? "").includes(`/id${APP_STORE_ID[slug]}`);
      };
      const storeQueue = [...raw.apps].sort((p, q) => Number(pinnedOff(q.slug)) - Number(pinnedOff(p.slug)));
      for (const a of storeQueue) {
        if (a.mergedInto || (stores[a.slug]?.v === STORE_RULE && !pinnedOff(a.slug))) continue;
        if (Date.now() - storeStart > 180_000) break; // 3 min : le reste du passage doit tenir dans les 10 min d'une action
        const id = APP_STORE_ID[a.slug] ?? (a.store?.storeId ? String(a.store.storeId) : null);
        if (APP_SITE[a.slug]) { // app web : pas de fiche App Store, son icône vient de son site
          if (stores[a.slug]?.url) iconsToDrop.push(iconKey(a.slug));
          stores[a.slug] = { url: null, v: STORE_RULE, art: null };
          found.push({ slug: a.slug, url: null, v: STORE_RULE, art: null });
          continue;
        }
        let hit: Awaited<ReturnType<typeof appStoreHit>>;
        try {
          // Fiche épinglée : son identifiant seul (jamais la recherche par nom, qui trouverait une homonyme).
          hit = APP_STORE_ID[a.slug] ? await appStoreLookup(APP_STORE_ID[a.slug]) : (id ? await appStoreLookup(id) : null) ?? (await appStoreHit(a.name));
        } catch {
          // L'App Store refuse ou ne répond pas : on garde la fiche d'avant, l'app sera revue au prochain passage.
          if (++storeErrors >= 5) break;
          continue;
        }
        const url = hit?.trackViewUrl ?? null;
        const art = hit?.artworkUrl512 ?? hit?.artworkUrl100 ?? null;
        if (stores[a.slug] && stores[a.slug].url !== url) iconsToDrop.push(iconKey(a.slug));
        stores[a.slug] = { url, v: STORE_RULE, art };
        found.push({ slug: a.slug, url, v: STORE_RULE, art });
      }
      if (found.length) await ctx.runMutation(internal.radarStore.saveAppStore, { items: found });
      for (const k of iconsToDrop) if (k in media) { delete media[k]; }
      if (iconsToDrop.length) await ctx.runMutation(internal.radarStore.dropMedia, { keys: iconsToDrop });
      const storeOf = (slug: string) => stores[slug]?.url ?? null;
      const artOf = (slug: string) => stores[slug]?.art ?? null;
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
        artOf,
      };
      MEMLOG('avant calcul 1');
      let { boards, need, used } = buildBoards(raw, now, (k) => media[k] ?? null, storeOf, opts);
      MEMLOG('après calcul 1');

      // Miniatures et icônes manquantes : 20 copies en continu, dans le temps imparti.
      // Les icônes d'abord (peu nombreuses, visibles partout), puis les miniatures.
      const todo = [...need.entries()].sort((p, q) => Number(q[0].startsWith("icon:")) - Number(p[0].startsWith("icon:"))).slice(0, MEDIA_PER_RUN);
      const mediaStart = Date.now();
      // Le temps pris par les fiches App Store est retiré de celui des miniatures (une action : 10 min au plus).
      const mediaBudget = Math.max(60_000, MEDIA_BUDGET_MS - (mediaStart - storeStart));
      let copied = 0;
      const got: { key: string; storageId: Id<"_storage">; url: string }[] = [];
      const failed: string[] = [];
      // Un lot refusé (le site range des images au même moment) est retenté, puis laissé : ces images
      // seront recopiées au passage suivant, le passage lui-même continue.
      const retried = async (run: () => Promise<unknown>) => {
        for (let i = 0; i < 3; i++) {
          try { await run(); return; } catch { await new Promise((r) => setTimeout(r, 500 * (i + 1))); }
        }
      };
      const flushMedia = async () => {
        const items = got.splice(0), keys = failed.splice(0);
        if (copied % 1000 < 100) MEMLOG('copie ' + copied);
        if (items.length) await retried(() => ctx.runMutation(internal.radarStore.saveMedia, { items }));
        if (keys.length) await retried(() => ctx.runMutation(internal.radarStore.markMisses, { keys }));
      };
      let next = 0;
      const worker = async () => {
        while (next < todo.length && Date.now() - mediaStart < mediaBudget) {
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
      MEMLOG('fin copie');
      ({ boards, need, used } = buildBoards(raw, now, (k) => media[k] ?? null, storeOf, opts));
      MEMLOG('après calcul 2');

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
