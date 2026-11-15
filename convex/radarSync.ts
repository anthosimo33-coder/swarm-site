"use node";

import v8 from "node:v8";
import vm from "node:vm";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { internalAction } from "./_generated/server";
import { appStoreHit, appStoreLookup, copyImage } from "./imageCopy";
import { APP_STORE_ID, buildBoards, iconKey, siteOf, type Raw } from "./radarModels";

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
const MEDIA_PER_RUN = 400;
// 14/11 : 1 min (au lieu de 5) — copier 546 miniatures en 4 min faisait passer la synchro de 387 à 502 Mo (mémoire de
// sharp non rendue), et elle mourait à l'écriture des pages (limite 512 Mo). Les miniatures non copiées le sont à la
// première demande de /cover (la lecture IA les demande toutes) ; les icônes passent d'abord.
const MEDIA_BUDGET_MS = 4 * 60_000; // copie dans sa propre action (copyMedia), après la synchro
/**
 * Une action Convex est coupée à 10 min, sans rien noter. Le passage s'arrête de lui-même à 9 min,
 * et la copie des images laisse 3 min aux écritures (quand les icônes changent, presque toutes les
 * pages sont réécrites : plus de 3 min à un lot à la fois, passage prod du 14/11 à 12 h 15).
 */
const RUN_LIMIT_MS = 9 * 60_000;
const WRITE_RESERVE_MS = 3 * 60_000;
/** Nouvelles vidéos (ou comptes) mises en file de vérification à chaque passage, au plus. */
const TODO_MAX = 15_000;
const WRITERS = 1; // 4 écrivains en parallèle : le 14/11 un lot ne revenait jamais (passage bloqué 3 min puis coupé) ; à 3 Mo/s, un seul suffit
/** Le déploiement Convex refuse plus de 4 Mio écrits par seconde (TooManyWrites, dev du 14/11) : écriture cadencée sous ce plafond. */
const WRITE_RATE = 3_000_000;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const PARALLEL = 4; // 20, 10, 6 : pics à 740, 568, 514 Mo de tas (pages TikTok lues à la fois) pour une limite de 512 Mo, passages coupés le 14/11
/** Une miniature introuvable depuis moins de 3 jours : la vidéo est retirée des listes (au-delà, on réessaie). */
const MISS_HIDE_MS = 3 * 86_400_000;
/** Taille d'un lot d'écriture : arguments bornés, et chaque document est relu (4 096 lectures au plus par mutation). */
const BATCH_BYTES = 1_500_000;
/**
 * Mémoire au-delà de laquelle on cesse d'écrire (limite des actions : 512 Mo). 14/11 : la synchro de prod est morte à
 * l'écriture des pages ; désormais elle s'arrête proprement et se relance pour écrire le reste.
 */
const MEM_STOP = (Number(process.env.SWARM_MEM_STOP_MB) || Infinity) * 1024 * 1024; // prod : 480 ; dev : sans (processus réutilisés, déjà gros au départ)
const BATCH_ITEMS = 400;

/** Mémoire de l'action à chaque étape (journal Convex) : la limite est de 512 Mo. */
/**
 * Ramasse-miettes forcé. Node se croit loin de sa limite (fixée d'après la mémoire de la machine), alors que l'action
 * meurt à 512 Mo : il laisse s'accumuler les textes jetables (52 000 pages mises en texte pour leur empreinte) — la
 * synchro de prod est morte ainsi le 14/11 à 22h30, 30 s après le calcul des pages.
 */
const gc: () => void = (() => {
  try { v8.setFlagsFromString("--expose-gc"); return vm.runInNewContext("gc") as () => void; } catch { return () => {}; }
})();

const MEMLOG = (label: string) => { const m = process.memoryUsage(); console.log(`[mem] ${label} rss=${Math.round(m.rss / 1e6)} heap=${Math.round(m.heapUsed / 1e6)} ext=${Math.round(m.external / 1e6)} buf=${Math.round(m.arrayBuffers / 1e6)}`); };
/**
 * Une ligne de l'export, réduite à ce que Swarm utilise (15/11 : 86 000 vidéos, 76 Mo de JSON, la synchro de prod mourait
 * à 512 Mo). Vidéos suivies : sans l'adresse signée de la miniature (23 % du poids ; la copie lit la page publique),
 * les 12 derniers relevés de vues (ceux de la page vidéo), identifiants de compte et d'app partagés au lieu d'être
 * dupliqués à chaque ligne. La ligne est RECONSTRUITE, champs toujours dans le même ordre : y retirer des champs
 * (`delete`) faisait passer chaque objet en mode dictionnaire, plus du double en mémoire (banc du 15/11).
 */
type Slim = { intern: (s: string) => string; now: number };
const internOf = (k: Slim, x: unknown) => (typeof x === "string" ? k.intern(x) : x);
function slimRow(table: string, row: Record<string, unknown>, k: Slim): unknown {
  if (table === "trackedVideos") {
    return {
      accountId: internOf(k, row.accountId), appId: internOf(k, row.appId), platform: row.platform, videoId: row.videoId,
      publishedAt: row.publishedAt, views: row.views, snapshots: Array.isArray(row.snapshots) ? row.snapshots.slice(-12) : [],
      caption: row.caption, hook: row.hook, musicTitle: row.musicTitle, coverUrl: null, region: row.region, cites: row.cites,
    };
  }
  return row;
}

async function fetchTable(base: string, secret: string, table: (typeof TABLES)[number], k: Slim) {
  const rows: unknown[] = [];
  let cursor: string | null = null;
  for (let page = 0; page < 500; page++) {
    const url = `${base}/swarm/export?table=${table}${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${secret}` }, signal: AbortSignal.timeout(90_000) });
    if (!res.ok) throw new Error(`export ${table} : HTTP ${res.status}`);
    const body = (await res.json()) as { rows: unknown[]; cursor: string; done: boolean };
    for (const r of body.rows) rows.push(slimRow(table, r as Record<string, unknown>, k));
    if (body.done) return rows;
    cursor = body.cursor;
  }
  throw new Error(`export ${table} : trop de pages`);
}

/** Empreinte et taille (une seule mise en texte : 52 000 pages à empreinter, 14/11 la mémoire manquait). */
function hashLen(data: unknown): { hash: string; bytes: number } {
  const { updatedAt: _ignored, ...rest } = (data ?? {}) as Record<string, unknown>;
  const s = JSON.stringify(rest);
  return { hash: fnv(s), bytes: s.length + 40 };
}

function fnv(s: string): string {
  let h1 = 0x811c9dc5, h2 = 0x01000193;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 16777619) >>> 0;
    h2 = Math.imul(h2 ^ c, 2246822519) >>> 0;
  }
  return h1.toString(16).padStart(8, "0") + h2.toString(16).padStart(8, "0"); // même format que hashOf (empreintes rangées)
}

/** Empreinte rapide (FNV-1a sur 2×32 bits) du contenu, sans la date de calcul. */
const hashOf = (data: unknown): string => hashLen(data).hash;

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

/**
 * Copie des images demandées par la synchro (icônes d'abord, puis miniatures et photos de profil), dans sa propre action :
 * sharp garde sa mémoire, et la copie faite au milieu de la synchro la faisait dépasser 512 Mo (15/11).
 */
export const copyMedia = internalAction({
  args: { items: v.array(v.object({ key: v.string(), src: v.string() })) },
  handler: async (ctx, { items }): Promise<{ copied: number; failed: number }> => {
    const start = Date.now();
    const got: { key: string; storageId: Id<"_storage">; url: string }[] = [];
    const failed: string[] = [];
    let copied = 0, nfail = 0, next = 0;
    const retried = async (go: () => Promise<unknown>) => { for (let i = 0; i < 3; i++) { try { await go(); return; } catch { await sleep(500 * (i + 1)); } } };
    const flush = async () => {
      const its = got.splice(0), keys = failed.splice(0);
      if (its.length) await retried(() => ctx.runMutation(internal.radarStore.saveMedia, { items: its }));
      if (keys.length) await retried(() => ctx.runMutation(internal.radarStore.markMisses, { keys }));
    };
    const worker = async () => {
      while (next < items.length && Date.now() - start < MEDIA_BUDGET_MS) {
        const { key, src } = items[next++];
        const r = await copyImage(ctx, key, src);
        if (r) { got.push(r); copied++; } else if (key.startsWith("v:")) { failed.push(key); nfail++; }
        if (got.length + failed.length >= 100) await flush();
      }
    };
    await Promise.all(Array.from({ length: PARALLEL }, worker));
    await flush();
    console.log(`[copie] ${copied} images copiées, ${nfail} introuvables, ${items.length - next} laissées pour le passage suivant`);
    return { copied, failed: nfail };
  },
});

export const run = internalAction({
  args: {},
  handler: async (ctx): Promise<Record<string, number>> => {
    const runStart = Date.now();
    const runId = await ctx.runMutation(internal.radarStore.startRun, {});
    if (runId === null) return { skipped: 1 }; // un passage tourne déjà
    try {
      const base = process.env.JARVIA_EXPORT_URL ?? DEFAULT_EXPORT_URL;
      const secret = process.env.JARVIA_EXPORT_SECRET;
      if (!secret) throw new Error("JARVIA_EXPORT_SECRET absente");

      gc(); // un processus réutilisé garde les restes du passage d'avant (15/11 : 509 Mo au départ du passage de 17h15)
      MEMLOG('départ');
      const raw = {} as Raw;
      const pool = new Map<string, string>();
      const slim: Slim = { intern: (x) => { const y = pool.get(x); if (y) return y; pool.set(x, x); return x; }, now: Date.now() };
      for (const t of TABLES) { (raw as Record<string, unknown>)[t] = await fetchTable(base, secret, t, slim); gc(); MEMLOG('export ' + t); }
      pool.clear();
      // Essai sur le dev seulement : des comptes marqués « placement payé » à la main (variable SWARM_TEST_PLACEMENT,
      // pseudos séparés par des virgules), tant que l'export du Radar n'envoie pas encore `placement`.
      const testPaid = (process.env.SWARM_TEST_PLACEMENT ?? "").split(",").map((h) => h.trim().replace(/^@/, "")).filter(Boolean);
      if (testPaid.length) for (const t of raw.tracked) if (testPaid.includes(t.handle)) t.placement = true;

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
        if (siteOf(slug)) return !st || st.url !== null;
        return !!APP_STORE_ID[slug] && !(st?.url ?? "").includes(`/id${APP_STORE_ID[slug]}`);
      };
      const storeQueue = [...raw.apps].sort((p, q) => Number(pinnedOff(q.slug)) - Number(pinnedOff(p.slug)));
      for (const a of storeQueue) {
        if (a.mergedInto || (stores[a.slug]?.v === STORE_RULE && !pinnedOff(a.slug))) continue;
        if (Date.now() - storeStart > 180_000) break; // 3 min : le reste du passage doit tenir dans les 10 min d'une action
        const id = APP_STORE_ID[a.slug] ?? (a.store?.storeId ? String(a.store.storeId) : null);
        if (siteOf(a.slug)) { // app web : pas de fiche App Store, son icône vient de son site
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
      // Pays lus par Swarm sur la page publique d'une vidéo, pour les comptes que le Radar ne situe pas.
      const regions = new Map<string, string>();
      for (let cursor: string | null = null, done = false; !done; ) {
        const page: { items: [string, string][]; cursor: string; done: boolean } = await ctx.runQuery(internal.radarStore.regionPage, { cursor });
        for (const [h, c] of page.items) regions.set(h, c);
        cursor = page.cursor;
        done = page.done;
      }
      // Carrousels lus par Swarm sur la page publique des vidéos (convex/radarSlides.ts) : id → nombre de photos (0 : non).
      const slides = new Map<string, number>();
      const slideKnown = new Set<string>(); // lues ou en attente : pas à ré-enregistrer
      for (let cursor: string | null = null, done = false; !done; ) {
        const page: { items: [string, number][]; cursor: string; done: boolean } = await ctx.runQuery(internal.radarStore.slidePage, { cursor });
        for (const [id, n] of page.items) { slideKnown.add(id); if (n >= 0) slides.set(id, n); }
        cursor = page.cursor;
        done = page.done;
      }
      // Lectures IA (convex/radarAi.ts) : type et texte à l'écran de chaque vidéo, genre des comptes « ambassadeur ».
      const ai = new Map<string, { type: string; text: string }>();
      const aiKnown = new Set<string>();
      for (let cursor: string | null = null, done = false; !done; ) {
        const page: { items: [string, string, string, number][]; cursor: string; done: boolean } = await ctx.runQuery(internal.radarStore.videoAiPage, { cursor });
        for (const [id, type, text, ok] of page.items) { aiKnown.add(id); if (ok) ai.set(id, { type, text }); }
        cursor = page.cursor;
        done = page.done;
      }
      const genders = new Map<string, string>();
      const genderKnown = new Set<string>();
      for (let cursor: string | null = null, done = false; !done; ) {
        const page: { items: [string, string, number][]; cursor: string; done: boolean } = await ctx.runQuery(internal.radarStore.genderPage, { cursor });
        for (const [h, g, ok] of page.items) { genderKnown.add(h); if (ok) genders.set(h, g); }
        cursor = page.cursor;
        done = page.done;
      }
      // Miniatures introuvables récemment (vidéo supprimée, compte privé) : ces vidéos n'apparaissent pas.
      const misses = new Map<string, number>();
      for (let cursor: string | null = null, done = false; !done; ) {
        const page: { items: [string, number][]; cursor: string; done: boolean } = await ctx.runQuery(internal.radarStore.missPage, { cursor });
        for (const [key, at] of page.items) misses.set(key, at);
        cursor = page.cursor;
        done = page.done;
      }
      const site = process.env.CONVEX_SITE_URL ?? null;
      // Langue des comptes, calculée hors de la synchro (convex/radarLang.ts).
      const langs = new Map<string, string | null>();
      for (let cursor: string | null = null, done = false; !done; ) {
        const page: { items: [string, string][]; cursor: string; done: boolean } = await ctx.runQuery(internal.radarStore.langPage, { cursor });
        for (const [id, l] of page.items) langs.set(id, l || null);
        cursor = page.cursor;
        done = page.done;
      }
      const opts = {
        missing: (k: string) => (misses.get(k) ?? 0) > now - MISS_HIDE_MS,
        coverUrl: (id: string) => (site && /^(\d{6,25}|ig:[A-Za-z0-9_-]{5,40})$/.test(id) ? `${site}/cover/${id}` : null),
        artOf,
        regionOf: (h: string) => regions.get(h) ?? null,
        slidesOf: (id: string) => slides.get(id),
        aiOf: (id: string) => ai.get(id),
        genderOf: (h: string) => genders.get(h),
        // Lue une fois par vidéo : le 2e calcul la reprend (52 000 vidéos, ~3 Mo).
        langOf: (id: string) => (langs.has(id) ? langs.get(id) ?? null : undefined),
      };
      gc();
      MEMLOG('avant calcul');
      // Un seul calcul (15/11 : le 1er, qui ne servait qu'à lister les images à copier, doublait le pic). Les pages
      // vidéo (≈ 45 000) ne sont pas construites ici : `lazy` les produit une à une à l'écriture, puis elles sont libérées.
      const { boards, lazy, need, used, regionTodo, laterTodos, genderTodo, langTodo } = buildBoards(raw, now, (k) => media[k] ?? null, storeOf, opts);
      // Les images à copier (icônes d'abord) : copiées APRÈS la synchro, dans leur propre action (copyMedia) ; les pages
      // montrent d'ici là la miniature servie par /cover (copiée à la 1re vue).
      const copyTodo = [...need.entries()].sort((p, q) => Number(q[0].startsWith("icon:")) - Number(p[0].startsWith("icon:"))).slice(0, MEDIA_PER_RUN);
      // Les comptes encore sans pays : notés pour que leur pays soit lu sur leurs vidéos (convex/radarRegions.ts).
      for (let i = 0; i < regionTodo.length; i += 300) await ctx.runMutation(internal.radarStore.saveRegionTodo, { items: regionTodo.slice(i, i + 300) });
      if (regionTodo.length) await ctx.scheduler.runAfter(0, internal.radarRegions.fill, {});
      // Les nouvelles vidéos à vérifier (carrousel, lecture IA) et les comptes à genrer : seulement celles qui ne sont
      // pas déjà en file, enregistrées APRÈS l'écriture des pages (elles ne doivent pas lui prendre son temps).
      const newGender = genderTodo.filter((x) => !genderKnown.has(x.handle)).slice(0, TODO_MAX);
      gc();
      MEMLOG('après calcul');

      // L'export du Radar (≈ 100 Mo avec l'historique de chaque vidéo) ne sert plus : libéré avant l'écriture des pages
      // (le 14/11, lire les empreintes par-dessus a dépassé les 512 Mo d'une action).
      const sizes = { apps: raw.apps.length, tracked: raw.tracked.length, trackedVideos: raw.trackedVideos.length, formats: raw.formats.length, signals: raw.signals.length };
      for (const t of TABLES) (raw as Record<string, unknown>)[t] = [];
      const missing = need.size;
      need.clear();

      // Écriture des documents, par lots bornés, WRITERS lots à la fois.
      let written = 0;
      // Les empreintes déjà rangées : seules les pages qui ont changé partent (le 14/11, renvoyer les 51 000 pages à
      // chaque passage, cadencées à 3 Mo/s, a fait dépasser les 10 min d'une action quand presque toutes changeaient).
      const existingHash = new Map<string, string>();
      for (let cursor: string | null = null, done = false; !done; ) {
        const page: { keys: string[]; hashes: string[]; cursor: string; done: boolean } = await ctx.runQuery(internal.radarStore.boardKeys, { cursor });
        page.keys.forEach((k, i) => existingHash.set(k, page.hashes[i]));
        cursor = page.cursor;
        done = page.done;
      }
      // Toutes les clés produites, notées au fil de l'écriture : les pages quittent la mémoire une fois écrites, et les
      // listes et fiches produites à la volée ajoutent les pages de leurs vidéos pendant l'écriture (le 15/11, une liste
      // figée avant l'écriture les a fait passer pour disparues : 60 000 pages effacées sur le dev).
      const allKeys = new Set<string>();
      // Écriture en flux (15/11) : les pages sont produites, mises en texte et comparées une à une ; un lot plein part
      // aussitôt (cadencé à WRITE_RATE), puis est oublié. Plus de liste de tous les lots en mémoire.
      function* pages(): Generator<[string, unknown]> {
        for (const [k, d] of boards) { boards.delete(k); allKeys.add(k); yield [k, d]; }
        for (const [k, f] of lazy) { lazy.delete(k); allKeys.add(k); yield [k, f()]; }
      }
      let batch: { key: string; hash: string; data: unknown }[] = [];
      let size = 0, sent = 0, seen = 0, left = 0;
      let stopped: "" | "mémoire pleine" | "temps écoulé" = "";
      const writeStart = Date.now();
      const flush = async () => {
        if (!batch.length) return;
        const items = batch, bytes = size;
        batch = []; size = 0;
        sent += bytes;
        const wait = writeStart + ((sent - bytes) / WRITE_RATE) * 1000 - Date.now();
        if (wait > 0) await sleep(wait);
        for (let attempt = 0; ; attempt++) {
          try { written += await ctx.runMutation(internal.radarStore.saveBoards, { items, now }); break; } catch (e) {
            if (attempt >= 4 || !/TooManyWrites/.test(String(e))) throw e;
            await sleep(2_000 * (attempt + 1));
          }
        }
      };
      for (const [key, data] of pages()) {
        if (++seen % 1000 === 0) gc();
        if (Date.now() - runStart > RUN_LIMIT_MS) { stopped = "temps écoulé"; left = 1; break; }
        if (process.memoryUsage().rss > MEM_STOP) { gc(); if (process.memoryUsage().rss > MEM_STOP) { stopped = "mémoire pleine"; left = 1; break; } }
        const { hash, bytes } = hashLen(data);
        if (existingHash.get(key) === hash) continue;
        if (batch.length && (size + bytes > BATCH_BYTES || batch.length >= BATCH_ITEMS)) await flush();
        batch.push({ key, hash, data });
        size += bytes;
      }
      if (!stopped) await flush(); else left += batch.length + boards.size + lazy.size; // ce qui n'a pas été produit
      MEMLOG('écriture ' + written);
      if (stopped) {
        // Ce qui est écrit reste (empreintes) ; un passage repart dans 1 min pour écrire le reste, tant que chacun avance.
        if (written > 0) await ctx.scheduler.runAfter(60_000, internal.radarSync.run, {});
        throw new Error(`${stopped} : ${left} pages non écrites (${written} écrites)${written > 0 ? ", suite dans 1 min" : ""}`);
      }

      // Les images qu'aucun document ne cite plus (vidéo sortie des listes) : effacées. Après l'écriture : les fiches
      // produites à la volée y notent les leurs.
      const stale = Object.keys(media).filter((k) => !used.has(k));
      for (let i = 0; i < stale.length; i += 200) await ctx.runMutation(internal.radarStore.dropMedia, { keys: stale.slice(i, i + 200) });
      used.clear();
      // Vidéos à vérifier (carrousel, lecture IA) : connues seulement une fois toutes les fiches produites.
      const later = laterTodos();
      const newSlides = later.slideTodo.filter((id) => !slideKnown.has(id)).slice(0, TODO_MAX);
      const newAi = later.videoAiTodo.filter((id) => !aiKnown.has(id)).slice(0, TODO_MAX);
      // Les documents que ce passage n'a plus produits : effacés (leur fiche mène à « introuvable »).
      const gone = [...existingHash.keys()].filter((k) => !allKeys.has(k));
      for (let i = 0; i < gone.length; i += 200) await ctx.runMutation(internal.radarStore.dropBoards, { keys: gone.slice(i, i + 200) });

      const counts = {
        unlocated: regionTodo.length,
        ...sizes,
        boards: allKeys.size, written, mediaToCopy: copyTodo.length, mediaMissing: missing, mediaDropped: stale.length, boardsDropped: gone.length,
      };
      await ctx.runMutation(internal.radarStore.endRun, { id: runId, ok: true, counts });
      // Les files de vérification (convex/radarSlides.ts, convex/radarAi.ts), une fois les pages écrites ; le reste au
      // passage suivant si le temps manque (seules les nouvelles y entrent).
      for (let i = 0; i < newSlides.length; i += 500) await ctx.runMutation(internal.radarStore.saveSlideTodo, { ids: newSlides.slice(i, i + 500) });
      for (let i = 0; i < newAi.length; i += 500) await ctx.runMutation(internal.radarStore.saveVideoAiTodo, { ids: newAi.slice(i, i + 500) });
      for (let i = 0; i < newGender.length; i += 300) await ctx.runMutation(internal.radarStore.saveGenderTodo, { items: newGender.slice(i, i + 300) });
      // Langue des comptes jamais calculés : par lots de 200, chacun dans sa propre action (le détecteur hors synchro).
      for (let i = 0; i < Math.min(langTodo.length, TODO_MAX); i += 200) await ctx.scheduler.runAfter(i * 50, internal.radarLang.detect, { items: langTodo.slice(i, i + 200) });
      if (copyTodo.length) await ctx.scheduler.runAfter(0, internal.radarSync.copyMedia, { items: copyTodo.map(([key, src]) => ({ key, src })) });
      await ctx.scheduler.runAfter(0, internal.radarSlides.fill, {});
      await ctx.scheduler.runAfter(0, internal.radarAi.fillVideos, {});
      await ctx.scheduler.runAfter(0, internal.radarAi.fillGender, {});
      return counts;
    } catch (e) {
      const error = e instanceof Error ? e.message : String(e);
      await ctx.runMutation(internal.radarStore.endRun, { id: runId, ok: false, error });
      throw e;
    }
  },
});
