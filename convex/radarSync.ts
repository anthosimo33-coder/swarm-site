"use node";

import v8 from "node:v8";
import vm from "node:vm";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import type { FunctionReference } from "convex/server";
import { internalAction, type ActionCtx } from "./_generated/server";
import { appStoreHit, appStoreLookup, copyImage } from "./imageCopy";
import { COVER_ID } from "./coverSign";
import { backgroundOff, TIKTOK_LEASE } from "./background";
import { APP_STORE_ID, buildBoards, iconKey, siteOf, type GroupOut, type Part, type RApp, type Raw, type RFormat, type RSignal, type RTracked, type RVideo } from "./radarModels";

/** Version de la règle qui associe une app à sa fiche App Store (convex/imageCopy.ts, sameApp). */
const STORE_RULE = 6; // 6 : à plusieurs candidates, titre exact ou nette avance en avis ; 5 : fiche exacte par l'identifiant du Radar ; sinon recherche France puis États-Unis, refusée si le nom est ambigu ; icône gardée

/**
 * Synchronisation quotidienne du Radar (cron, convex/crons.ts, et lui seul : les lectures de fond ne la relancent plus
 * depuis le 20/11), en étapes (voir « Synchro par groupes d'apps » plus bas) :
 *  1. `run` lit l'export de Jarvia (clé JARVIA_EXPORT_SECRET) : apps, comptes, formats, signaux, et les fiches App Store ;
 *  2. `runGroup`, un par groupe d'apps : ses vidéos, puis ses fiches d'app, de créateur et ses pages vidéo ;
 *  3. `runGlobal` : les pages communes, puis le ménage (pages et images que plus rien ne cite) et les files de vérification.
 * Les images manquantes sont copiées ensuite (copyMedia, qui se relance jusqu'au bout de la liste). Lancer à la main :
 * `npx convex run radarSync:run '{"manual": true}'` (passe aussi sur le dev, où SWARM_SYNC_OFF coupe le cron) ;
 * suivre dans `syncRuns` (un passage n'a `finishedAt` qu'une fois l'étape globale finie) et `[mem]` des journaux.
 */

const DEFAULT_EXPORT_URL = "https://giddy-bass-969.eu-west-1.convex.site";
const TABLES = ["apps", "tracked", "trackedVideos", "formats", "signals"] as const;
/**
 * Images à copier par jour, au plus (F19, 20/11) : toute la liste de la synchro, ~9 000 nouvelles miniatures par jour.
 * Avant, 400 par passage seulement, et c'étaient les ~23 passages par jour qui suivaient l'afflux. La copie a désormais
 * son propre rythme : copyMedia copie ce que ses 4 min permettent (~400), puis se relance sur la suite.
 */
const MEDIA_PER_DAY = 30_000;
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
/**
 * Audit Q68 (19/11) : la limite de 9 min ne bornait que l'écriture des pages ; une écriture de près de 9 min laissait
 * l'étape globale finir son ménage (images, parcours de toutes les clés, pages effacées, fin du passage) au-delà de la
 * coupure de 10 min, sans rien noter. L'écriture s'arrête désormais à 6 min (WRITE_DEADLINE_MS : la reprise existante
 * prend le relais), le ménage ne commence pas après 7 min (il reprend dans une étape neuve), et la préparation échoue
 * proprement au-delà de 7 min.
 */
const WRITE_DEADLINE_MS = RUN_LIMIT_MS - WRITE_RESERVE_MS;
const STEP_DEADLINE_MS = 7 * 60_000;
/** Nouvelles vidéos (ou comptes) mises en file de vérification à chaque passage, au plus. */
const TODO_MAX = 15_000;
/**
 * Genre d'un compte (18/11, règle user : « tu dois check le contenu, pas que la pdp ») : la personne qui le tient doit se
 * montrer elle-même sur au moins 2 de ses miniatures lues (sur 1 seule s'il n'y en a qu'une ou deux).
 */
const selfMin = (covers: number) => (covers >= 3 ? 2 : 1);
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
/** Au-delà (caractères), une page est rangée en morceaux. Abaissé sur le dev (SWARM_PART_MIN=100000) : le chemin des
 * morceaux y tourne à chaque passage, au lieu de n'être éprouvé que le jour où une page de prod grossit. */
const PART_MIN = Number(process.env.SWARM_PART_MIN) || 600_000;

/** Mémoire de l'action à chaque étape (journal Convex) : la limite est de 512 Mo. */
/**
 * Ramasse-miettes forcé. Node se croit loin de sa limite (fixée d'après la mémoire de la machine), alors que l'action
 * meurt à 512 Mo : il laisse s'accumuler les textes jetables (52 000 pages mises en texte pour leur empreinte) — la
 * synchro de prod est morte ainsi le 14/11 à 22h30, 30 s après le calcul des pages.
 */
const gc: () => void = (() => {
  try { v8.setFlagsFromString("--expose-gc"); return vm.runInNewContext("gc") as () => void; } catch { return () => {}; }
})();

/**
 * Pics de tas et de mémoire totale (RSS, sur laquelle l'action meurt à 512 Mo et que MEM_STOP compare) de l'étape (Mo),
 * relevés à chaque MEMLOG et pendant l'écriture : notés dans syncRuns pour suivre la marge sans les journaux. Audit Q70
 * (19/11) : le pic n'était jamais remis à zéro (un processus réutilisé reprenait celui d'une action précédente), et le
 * RSS n'était jamais noté. Remis à zéro au début de chaque étape (resetPeaks).
 */
let heapPeak = 0, rssPeak = 0;
const notePeaks = () => { const m = process.memoryUsage(); heapPeak = Math.max(heapPeak, Math.round(m.heapUsed / 1e6)); rssPeak = Math.max(rssPeak, Math.round(m.rss / 1e6)); return m; };
const resetPeaks = () => { heapPeak = 0; rssPeak = 0; };
const MEMLOG = (label: string) => { const m = notePeaks(); console.log(`[mem] ${label} rss=${Math.round(m.rss / 1e6)} heap=${Math.round(m.heapUsed / 1e6)} ext=${Math.round(m.external / 1e6)} buf=${Math.round(m.arrayBuffers / 1e6)}`); };
/** Le seuil d'arrêt pour mémoire en Mo (SWARM_MEM_STOP_MB), null s'il n'est pas posé : noté pour vérifier la prod sans lire son environnement. */
const memStopMo = () => (Number.isFinite(MEM_STOP) ? Math.round(MEM_STOP / 1048576) : null);
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

async function fetchTable(base: string, secret: string, table: (typeof TABLES)[number], k: Slim, only?: { apps: string[]; keep: (r: Record<string, unknown>) => boolean }) {
  const rows: unknown[] = [];
  let cursor: string | null = null;
  const apps = only ? `&apps=${only.apps.map(encodeURIComponent).join(",")}` : "";
  for (let page = 0; page < 3000; page++) {
    const url = `${base}/swarm/export?table=${table}${apps}${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${secret}` }, signal: AbortSignal.timeout(90_000) });
    if (!res.ok) throw new Error(`export ${table} : HTTP ${res.status}`);
    const body = (await res.json()) as { rows: Record<string, unknown>[]; cursor: string; done: boolean };
    for (const r of body.rows) if (!only || only.keep(r)) rows.push(slimRow(table, r, k));
    if (body.done) return rows;
    cursor = body.cursor;
  }
  throw new Error(`export ${table} : trop de pages`);
}

/**
 * Les vidéos d'un groupe d'apps : par le filtre `apps` de l'export (Jarvia #532, 100 apps par demande, une page ne lit
 * qu'une app) ; un export qui ne connaît pas encore ce filtre rend toute la table, une seule fois, triée ici.
 */
async function fetchGroupVideos(base: string, secret: string, k: Slim, ids: string[], keep: (r: Record<string, unknown>) => boolean) {
  const rows: unknown[] = [];
  for (let i = 0; i < ids.length; i += 100) {
    const part = ids.slice(i, i + 100), want = new Set(part);
    let foreign = false;
    const got = await fetchTable(base, secret, "trackedVideos", k, { apps: part, keep: (r) => { if (!want.has(String(r.appId))) foreign = true; return keep(r); } });
    rows.push(...got);
    if (foreign) return rows; // filtre ignoré : la table entière est déjà lue (et triée)
  }
  return rows;
}

/** Empreinte et taille (une seule mise en texte : 52 000 pages à empreinter, 14/11 la mémoire manquait). */
function hashLen(data: unknown): { hash: string; bytes: number } {
  const { updatedAt: _ignored, ...rest } = (data ?? {}) as Record<string, unknown>;
  const s = JSON.stringify(rest);
  // En octets UTF-8, comme Convex compte (1 Mio par document) : une page en coréen ou en émojis pèse jusqu'à 3 fois ses caractères.
  return { hash: fnv(s), bytes: Buffer.byteLength(s, "utf8") + 40 };
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
 * Relevé, et réparation sur demande, des images rangées (audit S30, Q67) : `npx convex run radarSync:repairMedia` compte
 * les images, leur poids, les HEIC (avant le 13/11) et les fichiers non matriciels (icône SVG, audit S30) ou absents ;
 * `'{"apply": true}'` efface ces derniers (fichier et ligne), recopiés ensuite par la synchro ou à la première vue.
 * Remplace repairHeic (13/11), jamais appelée, qui ne traitait que les HEIC. Une fois les HEIC à 0 en prod, la conversion
 * à la volée (covers.ensure, champ heic de mediaGet) pourra partir (décision : audit Q67).
 */
export const repairMedia = internalAction({
  args: { apply: v.optional(v.boolean()) },
  handler: async (ctx, { apply }): Promise<{ rows: number; bytes: number; heic: number; bad: number; dropped: number }> => {
    const keys: string[] = [];
    let rows = 0, bytes = 0, heic = 0, bad = 0;
    for (let cursor: string | null = null, done = false; !done; ) {
      const page: { rows: number; bytes: number; heic: number; bad: number; unusable: string[]; cursor: string; done: boolean } = await ctx.runQuery(internal.radarStore.mediaAudit, { cursor });
      rows += page.rows; bytes += page.bytes; heic += page.heic; bad += page.bad;
      keys.push(...page.unusable);
      cursor = page.cursor;
      done = page.done;
    }
    if (apply) for (let i = 0; i < keys.length; i += 200) await ctx.runMutation(internal.radarStore.dropMedia, { keys: keys.slice(i, i + 200) });
    console.log(`[images] ${rows} rangées, ${Math.round(bytes / 1e6)} Mo, ${heic} HEIC, ${bad} non matricielles ou absentes${apply ? `, ${keys.length} effacées` : ""}`);
    return { rows, bytes, heic, bad, dropped: apply ? keys.length : 0 };
  },
});

/**
 * Copie des images demandées par la synchro (icônes d'abord, puis miniatures et photos de profil), dans sa propre action :
 * sharp garde sa mémoire, et la copie faite au milieu de la synchro la faisait dépasser 512 Mo (15/11). La liste arrive
 * dans un fichier (`file`, à partir de `from` : au-delà de 8 192 éléments, Convex refuse une liste en argument) ou en
 * clair (`items`). Une action copie ce que ses 4 min permettent, puis relance la suite dans une action neuve, jusqu'au
 * bout ; le fichier est effacé à la fin.
 */
type CopyItem = { key: string; src: string };
export const copyMedia = internalAction({
  args: { items: v.optional(v.array(v.object({ key: v.string(), src: v.string() }))), file: v.optional(v.id("_storage")), from: v.optional(v.number()), token: v.optional(v.string()) },
  handler: async (ctx, args): Promise<{ copied: number; failed: number }> => {
    const start = Date.now();
    // Le bail des lectures de pages TikTok (audit F24), pris en priorité : pays et carrousels attendent la fin de la copie.
    // Refusé seulement pendant une synchro : la même liste reprend dans 1 min.
    const token = args.token ?? Math.random().toString(36).slice(2);
    if (!(await ctx.runMutation(internal.radarStore.takeLease, { name: TIKTOK_LEASE, token, ms: MEDIA_BUDGET_MS + 2 * 60_000, now: start, steal: true }))) {
      await ctx.scheduler.runAfter(60_000, internal.radarSync.copyMedia, { ...args, token });
      return { copied: 0, failed: 0 };
    }
    let items: CopyItem[] = args.items ?? [];
    const from = args.from ?? 0;
    if (args.file) {
      const b = await ctx.storage.get(args.file);
      if (!b) { console.log("[copie] liste introuvable (déjà copiée ?)"); return { copied: 0, failed: 0 }; }
      items = (JSON.parse(await b.text()) as CopyItem[]).slice(from);
    }
    const got: { key: string; storageId: Id<"_storage">; url: string }[] = [];
    const failed: string[] = [];
    let copied = 0, nfail = 0, next = 0, skipped = 0;
    // Trois essais ; l'erreur du dernier est rendue (audit Q62 : elle était avalée).
    const retried = async (go: () => Promise<unknown>): Promise<unknown> => {
      let last: unknown = null;
      for (let i = 0; i < 3; i++) { try { await go(); return null; } catch (e) { last = e; await sleep(500 * (i + 1)); } }
      return last;
    };
    const flush = async () => {
      const its = got.splice(0), keys = failed.splice(0);
      // Audit Q62 (19/11) : un lot que saveMedia refuse 3 fois laissait ses fichiers rangés sans ligne media (jamais
      // effacés : dropMedia ne passe que par les lignes) et comptés « copiés ». Ils sont effacés, et l'échec noté.
      const e = its.length ? await retried(() => ctx.runMutation(internal.radarStore.saveMedia, { items: its })) : null;
      if (e) {
        for (const it of its) { try { await ctx.storage.delete(it.storageId); } catch { /* déjà effacé */ } }
        copied -= its.length;
        console.error(`[copie] ${its.length} images non rangées, fichiers effacés : ${String(e).slice(0, 300)}`);
      }
      const m = keys.length ? await retried(() => ctx.runMutation(internal.radarStore.markMisses, { keys })) : null;
      if (m) console.error(`[copie] ${keys.length} échecs non notés : ${String(m).slice(0, 300)}`);
    };
    // Audit S33 (19/11) : l'icône d'un site tiers qui fait tomber l'action (flux sans fin, réponse qui pend) n'était
    // jamais notée, et repassait en tête de file à chaque passage. Elle est notée « en échec » AVANT d'être lue ; une
    // copie réussie efface la note (saveMedia). Si l'action meurt, la note reste : la synchro ne la redemande pas avant
    // 3 jours (radarModels, missing). Les icônes de l'App Store, sûres, ne sont pas concernées.
    const thirdParty = items.filter((x) => x.key.startsWith("icon:") && (x.src.startsWith("site:") || (/^https:\/\//.test(x.src) && !/\.mzstatic\.com\//.test(x.src)))).map((x) => x.key);
    if (thirdParty.length) {
      const e = await retried(() => ctx.runMutation(internal.radarStore.markMisses, { keys: thirdParty }));
      if (e) console.error(`[copie] icônes de sites non notées avant lecture : ${String(e).slice(0, 200)}`);
    }
    const worker = async () => {
      while (next < items.length && Date.now() - start < MEDIA_BUDGET_MS) {
        const { key, src } = items[next++];
        const report: { gone: boolean; blank?: boolean } = { gone: false };
        const r = await copyImage(ctx, key, src, report);
        // Notée introuvable (cachée des listes 3 jours) seulement si la plateforme dit la vidéo disparue : un refus
        // passager de TikTok (16/11) ni une vidéo vivante pas encore dotée de miniature (`blank`, audit Q16 : cachée
        // pendant ses jours de décollage) ne l'effacent des listes ; réessayées au passage suivant. Instagram et liens
        // directs : comme avant.
        if (r) { got.push(r); copied++; } else if (key.startsWith("v:") && (report.gone || !src.startsWith("ttpage:"))) { failed.push(key); nfail++; } else if (key.startsWith("v:")) skipped++;
        if (got.length + failed.length >= 100) await flush();
      }
    };
    await Promise.all(Array.from({ length: PARALLEL }, worker));
    await flush();
    const left = items.length - next;
    if (left > 0) {
      // La suite tout de suite, dans une action neuve (sharp garde sa mémoire d'une image à l'autre), avec le bail.
      if (args.file) await ctx.scheduler.runAfter(5_000, internal.radarSync.copyMedia, { file: args.file, from: from + next, token });
      else await ctx.scheduler.runAfter(5_000, internal.radarSync.copyMedia, { items: items.slice(next), token });
    } else {
      if (args.file) await ctx.storage.delete(args.file);
      await ctx.runMutation(internal.radarStore.dropLease, { name: TIKTOK_LEASE, token });
    }
    console.log(`[copie] ${copied} images copiées, ${nfail} introuvables, ${skipped} sans réponse de TikTok (réessayées au prochain passage ou à la première vue), ${left ? `${left} pour l'action suivante` : "liste finie"}`);
    return { copied, failed: nfail };
  },
});

// ─── Synchro par groupes d'apps (15/11) ────────────────────────────────────────────────────────────────────────────
//
// Une action Convex est coupée à 512 Mo et à 10 min ; à 24 000 comptes et 220 000 vidéos (prévision du Radar, 15/11)
// aucune n'y tient (banc : 209 Mo de tas à ×1, 577 à ×3 ; l'export seul prend 3 min 15 à ×1). Le passage enchaîne :
//  1. `run` (préparation) : apps, comptes, formats, signaux et fiches App Store, rangés en fichiers (stockage Convex) ;
//     les apps canoniques réparties en groupes d'au plus GROUP_ACCOUNTS comptes ;
//  2. `runGroup` (un par groupe) : les vidéos du groupe seulement (filtre `apps` de l'export), ses fiches d'app, de
//     créateur et ses pages vidéo écrites, et ce que les pages communes demandent rangé dans un fichier ;
//  3. `runGlobal` : listes, créateurs, formats, alertes, accueil, recherche ; puis, seulement là, les pages et images
//     que plus rien ne cite sont effacées, et les files de vérification remplies.
// Le banc (scripts/sync-bench/parts.mjs) vérifie que ce découpage produit exactement les pages du calcul d'un coup.

/** Comptes par groupe : ≈ 27 000 vidéos à 9 vidéos par compte (banc du 15/11). */
const GROUP_ACCOUNTS = Number(process.env.SWARM_GROUP_ACCOUNTS) || 3_000;
/** Reprises d'une étape coupée (temps, mémoire) avant d'abandonner le passage. */
const STEP_RETRIES = 3;
/** Une valeur rangée sans son adresse : l'étape d'un groupe sait qu'une image existe, l'adresse ne sert qu'à son groupe. */
const ELSEWHERE = "·";

type StageIds = { apps: Id<"_storage">[]; tracked: Id<"_storage">[]; formats: Id<"_storage">[]; signals: Id<"_storage">[]; stores: Id<"_storage">[] };
type Stage = {
  now: number;
  globals: StageIds;
  /** Ids canoniques des apps de chaque groupe, et ids à demander à l'export (canoniques et fondues). */
  groups: string[][];
  fetch: string[][];
  outs: (Id<"_storage"> | null)[];
  /** Clés produites, images citées et à copier de chaque groupe : lues seulement pour le ménage final. */
  tails?: (Id<"_storage"> | null)[];
  writtenBy?: number[];
  retries?: Record<string, number>;
  heapPrep?: number;
  rssPrep?: number;
  /** Fichiers rangés et notés aussitôt (audit Q55) : préparation en cours, fichiers d'un groupe pas encore rendus. */
  extra?: Id<"_storage">[];
  sizes: Record<string, number>;
};
type Stores = Record<string, { url: string | null; v: number; art: string | null }>;
/** Ce qu'une étape de groupe range pour l'étape globale (en plus de `GroupOut`). */
type GroupFile = { out: GroupOut; markets: string[]; written: number; videos: number; refused?: string[]; heap?: number; rss?: number; biggest?: [number, string]; inParts?: number };
type GroupTail = { used: string[]; need: [string, string][]; keys: string[] };

/**
 * Des lignes rangées en fichiers JSON de `per` lignes (lus un à un : jamais tout le texte à la fois). `noted` reçoit
 * chaque fichier dès qu'il est rangé (audit Q55 : un fichier rangé avant une erreur ou une coupure n'était plus effacé).
 */
async function stageWrite(ctx: ActionCtx, rows: unknown[], per = 4000, noted?: (id: Id<"_storage">) => Promise<void>): Promise<Id<"_storage">[]> {
  const ids: Id<"_storage">[] = [];
  for (let i = 0; i === 0 || i < rows.length; i += per) {
    const id = await ctx.storage.store(new Blob([JSON.stringify(rows.slice(i, i + per))], { type: "application/json" }));
    ids.push(id);
    if (noted) await noted(id);
  }
  return ids;
}
async function stageRead<T>(ctx: ActionCtx, ids: Id<"_storage">[], keep?: (r: T) => boolean): Promise<T[]> {
  const out: T[] = [];
  for (const id of ids) {
    const b = await ctx.storage.get(id);
    if (!b) throw new Error("étape : fichier rangé introuvable");
    for (const r of JSON.parse(await b.text()) as T[]) if (!keep || keep(r)) out.push(r);
  }
  return out;
}
async function stageDrop(ctx: ActionCtx, ids: Id<"_storage">[]) {
  for (const id of ids) { try { await ctx.storage.delete(id); } catch { /* déjà effacé */ } }
}
const stageFiles = (st: Stage) => [...new Set([...Object.values(st.globals).flat(), ...[...st.outs, ...(st.tails ?? []), ...(st.extra ?? [])].filter((x): x is Id<"_storage"> => !!x)])];

/** Toutes les pages d'une requête paginée de radarStore. */
async function readPages<T>(ctx: ActionCtx, query: FunctionReference<"query", "internal", { cursor: string | null }, { items: T[]; cursor: string; done: boolean }>, each: (x: T) => void) {
  for (let cursor: string | null = null, done = false; !done; ) {
    const page: { items: T[]; cursor: string; done: boolean } = await ctx.runQuery(query, { cursor });
    for (const x of page.items) each(x);
    cursor = page.cursor;
    done = page.done;
  }
}

/**
 * La langue d'un compte est-elle connue ? Audit Q60 (19/11) : une langue « inconnue » (moins de 2 textes sûrs, souvent
 * un compte à 1 ou 2 vidéos à son arrivée) était figée pour toujours, même après 30 vidéos (18,6 % des comptes en prod).
 * Inconnue depuis plus de LANG_RETRY_MS : à recalculer (radarModels la remet dans langTodo).
 */
export const LANG_RETRY_MS = 7 * 86_400_000;
export const langKnown = ([, lang, at]: [string, string, number?], now: number) => !!lang || (at ?? now) > now - LANG_RETRY_MS;

/** Ce que Swarm sait déjà des vidéos et des comptes (tables Swarm), filtré à ce qui sert à l'étape. */
async function loadStore(ctx: ActionCtx, f: { video?: (id: string) => boolean; handle?: (h: string) => boolean; account?: (id: string) => boolean; media?: (k: string) => boolean }) {
  const all = () => true;
  const fv = f.video ?? all, fh = f.handle ?? all, fa = f.account ?? all, fm = f.media ?? all;
  const media: Record<string, string> = {};
  await readPages<[string, string]>(ctx, internal.radarStore.mediaPage, ([k, url]) => { media[k] = fm(k) ? url : ELSEWHERE; });
  const regions = new Map<string, string>();
  await readPages<[string, string]>(ctx, internal.radarStore.regionPage, ([h, c]) => regions.set(h, c));
  const slides = new Map<string, number>(), slideKnown = new Set<string>();
  await readPages<[string, number]>(ctx, internal.radarStore.slidePage, ([id, n]) => { if (!fv(id)) return; slideKnown.add(id); if (n >= 0) slides.set(id, n); });
  const ai = new Map<string, { type: string; text: string }>(), aiKnown = new Set<string>();
  await readPages<[string, string, string, number]>(ctx, internal.radarStore.videoAiPage, ([id, type, text, ok]) => { if (!fv(id)) return; aiKnown.add(id); if (ok) ai.set(id, { type, text }); });
  const genders = new Map<string, string>(), genderKnown = new Set<string>();
  // Genre (18/11) : lu sur le contenu (version 2), femme ou homme seulement si la personne qui tient le compte se montre
  // elle-même sur SELF_MIN de ses miniatures ; sinon sans visage. Une ancienne lecture (photo de profil comprise comme
  // preuve) n'est pas « connue » : la synchro la remet en file, et son genre reste affiché jusqu'à la relecture.
  await readPages<[string, string, number, number?, number?, number?]>(ctx, internal.radarStore.genderPage, ([h, g, ok, ver = 1, self = 0, covers = 0]) => {
    if (!fh(h)) return;
    if (ver >= 2) genderKnown.add(h);
    if (!g) return;
    if (ver >= 2 && ok) genders.set(h, g === "femme" || g === "homme" ? (self >= selfMin(covers) ? g : "sans_visage") : g);
    else genders.set(h, g);
  });
  const misses = new Map<string, number>();
  await readPages<[string, number]>(ctx, internal.radarStore.missPage, ([k, at]) => misses.set(k, at));
  const langs = new Map<string, string | null>();
  const now = Date.now();
  await readPages<[string, string, number?]>(ctx, internal.radarStore.langPage, (row) => { if (fa(row[0]) && langKnown(row, now)) langs.set(row[0], row[1] || null); });
  return { media, regions, slides, slideKnown, ai, aiKnown, genders, genderKnown, misses, langs };
}
type Store = Awaited<ReturnType<typeof loadStore>>;

function boardOpts(now: number, st: Store, stores: Stores, part?: Part) {
  const site = process.env.CONVEX_SITE_URL ?? null;
  return {
    missing: (k: string) => (st.misses.get(k) ?? 0) > now - MISS_HIDE_MS,
    // La forme d'un id de vidéo : celle de convex/coverSign.ts, la seule (audit Q50).
    coverUrl: (id: string) => (site && COVER_ID.test(id) ? `${site}/cover/${id}` : null),
    artOf: (slug: string) => stores[slug]?.art ?? null,
    regionOf: (h: string) => st.regions.get(h) ?? null,
    slidesOf: (id: string) => st.slides.get(id),
    aiOf: (id: string) => st.ai.get(id),
    genderOf: (h: string) => st.genders.get(h),
    langOf: (id: string) => (st.langs.has(id) ? st.langs.get(id) ?? null : undefined),
    part,
  };
}

const canonicalOf = (apps: RApp[]) => {
  const byId = new Map(apps.map((a) => [a.id, a]));
  return (id: string | null | undefined) => {
    let a = id ? byId.get(id) ?? null : null;
    for (let i = 0; a && a.mergedInto && i < 5; i++) a = byId.get(a.mergedInto) ?? a;
    return a?.id ?? "";
  };
};

/**
 * Écriture des pages, en flux : produites une à une, comparées par lots de 400 à l'empreinte rangée (une requête
 * par lot, plus de lecture de toutes les empreintes), seules celles qui changent partent, cadencées à WRITE_RATE.
 * S'arrête proprement à RUN_LIMIT_MS ou au-delà de MEM_STOP (l'étape reprend : ce qui est écrit n'est pas renvoyé).
 */
export async function writePages(ctx: ActionCtx, boards: Map<string, unknown>, lazy: Map<string, () => unknown>, now: number, runStart: number) {
  const keys: string[] = [];
  function* pages(): Generator<[string, unknown]> {
    for (const [k, d] of boards) { boards.delete(k); keys.push(k); yield [k, d]; }
    for (const [k, f] of lazy) { lazy.delete(k); keys.push(k); yield [k, f()]; }
  }
  let written = 0, sent = 0, seen = 0;
  let stopped: "" | "mémoire pleine" | "temps écoulé" = "";
  const writeStart = Date.now();
  // Une page que Convex refuse (liste de plus de 8 192 éléments, document de plus de 1 Mio…) est écartée et notée :
  // elle ne bloque plus tout le passage (16/11 : l'index de recherche refusé a fait échouer 8 synchros de suite).
  const refused: string[] = [];
  type Item = { key: string; hash: string; data?: unknown; text?: string };
  const save = async (items: Item[]): Promise<void> => {
    for (let attempt = 0; ; attempt++) {
      try { written += await ctx.runMutation(internal.radarStore.saveBoards, { items, now }); return; } catch (e) {
        const msg = String(e);
        if (/TooManyWrites/.test(msg) && attempt < 4) { await sleep(2_000 * (attempt + 1)); continue; }
        if (!/Invalid arguments|too large|too long|maximum/i.test(msg)) throw e;
        if (items.length === 1) { refused.push(items[0].key); console.log(`[page refusée] ${items[0].key} : ${msg.slice(0, 200)}`); return; }
        const half = Math.ceil(items.length / 2);
        await save(items.slice(0, half));
        await save(items.slice(half));
        return;
      }
    }
  };
  const send = async (items: Item[], bytes: number) => {
    sent += bytes;
    const wait = writeStart + ((sent - bytes) / WRITE_RATE) * 1000 - Date.now();
    if (wait > 0) await sleep(wait);
    await save(items);
  };
  let pending: { key: string; hash: string; data: unknown; bytes: number }[] = [];
  let pendingBytes = 0;
  // Une page trop grosse pour un document (1 Mio) ou qui porte une liste de plus de 8 000 éléments (Convex : 8 192, sur
  // tous les plans) part en texte, rangée en morceaux (radarStore.saveBoards). Une liste de 8 000 éléments demande au
  // moins 16 000 caractères : en deçà, rien à vérifier.
  let biggest: [number, string] = [0, ""], inParts = 0;
  // La plus longue liste et le plus grand objet d'une page : au-delà de 8 192 éléments ou 1 024 champs, Convex refuse la
  // valeur, à l'écriture comme au retour de boards.get. Une telle page est refusée et signalée (pagesRefused) : la ranger
  // en morceaux la ferait seulement échouer à l'écran. Les pages sont bornées par construction (banc à ×5).
  const shape = (x: unknown, acc = { list: 0, fields: 0 }) => {
    if (Array.isArray(x)) { acc.list = Math.max(acc.list, x.length); for (const e of x) shape(e, acc); }
    else if (x && typeof x === "object") { const ks = Object.keys(x); acc.fields = Math.max(acc.fields, ks.length); for (const k of ks) shape((x as Record<string, unknown>)[k], acc); }
    return acc;
  };
  const asItem = (x: { key: string; hash: string; data: unknown; bytes: number }): Item | null => {
    if (x.bytes > biggest[0]) biggest = [x.bytes, x.key];
    // Sous 4 000 octets, ni 1 000 champs ni 8 000 éléments ne tiennent : rien à mesurer.
    const sh = x.bytes < 4_000 ? { list: 0, fields: 0 } : shape(x.data);
    if (sh.list > 8_000 || sh.fields > 1_000 || x.bytes > 12_000_000) {
      refused.push(x.key);
      console.log(`[page refusée] ${x.key} : ${Math.round(x.bytes / 1024)} Kio, liste de ${sh.list}, objet de ${sh.fields} champs (Convex : 8 192 éléments, 1 024 champs ; boards.get rend 16 Mio au plus)`);
      return null;
    }
    if (x.bytes < PART_MIN) return { key: x.key, hash: x.hash, data: x.data };
    inParts++;
    return { key: x.key, hash: x.hash, text: JSON.stringify(x.data) };
  };
  const flush = async () => {
    if (!pending.length) return;
    const items = pending;
    pending = []; pendingBytes = 0;
    const old: (string | null)[] = await ctx.runQuery(internal.radarStore.boardHashes, { keys: items.map((x) => x.key) });
    let batch: Item[] = [], size = 0;
    for (let j = 0; j < items.length; j++) {
      const x = items[j];
      if (old[j] === x.hash) { if (x.bytes > biggest[0]) biggest = [x.bytes, x.key]; continue; }
      const item = asItem(x);
      if (!item) continue;
      if (batch.length && (size + x.bytes > BATCH_BYTES || batch.length >= BATCH_ITEMS)) { await send(batch, size); batch = []; size = 0; }
      batch.push(item);
      size += x.bytes;
    }
    if (batch.length) await send(batch, size);
  };
  for (const [key, data] of pages()) {
    if (++seen % 1000 === 0) { gc(); notePeaks(); }
    if (Date.now() - runStart > WRITE_DEADLINE_MS) { stopped = "temps écoulé"; break; }
    if (process.memoryUsage().rss > MEM_STOP) { gc(); if (process.memoryUsage().rss > MEM_STOP) { stopped = "mémoire pleine"; break; } }
    const { hash, bytes } = hashLen(data);
    pending.push({ key, hash, data, bytes });
    pendingBytes += bytes;
    if (pending.length >= 400 || pendingBytes >= 3 * BATCH_BYTES) await flush();
  }
  if (!stopped) await flush();
  if (biggest[0] > 300_000) console.log(`[page] la plus grosse : ${biggest[1]}, ${Math.round(biggest[0] / 1024)} Kio${inParts ? ` ; ${inParts} rangées en morceaux` : ""}`);
  return { written, keys, stopped, refused, biggest, inParts, left: stopped ? pending.length + boards.size + lazy.size : 0 };
}

/** Échec d'une étape : le passage est noté raté et ses fichiers effacés (le suivant repart de zéro). */
async function failRun(ctx: ActionCtx, id: Id<"syncRuns">, e: unknown, st: Stage | null) {
  const error = e instanceof Error ? e.message : String(e);
  await ctx.runMutation(internal.radarStore.endRun, { id, ok: false, error });
  if (st) { await stageDrop(ctx, stageFiles(st)); await ctx.runMutation(internal.radarStore.stageCleaned, { id }); }
}

/** Étape coupée (temps, mémoire) : reprise dans 1 min, tant qu'elle avance ; sinon le passage est abandonné. */
async function retryStep(ctx: ActionCtx, id: Id<"syncRuns">, step: string, w: { written: number; stopped: string; left: number }, again: () => Promise<unknown>) {
  const n: number = await ctx.runMutation(internal.radarStore.stepRetry, { id, step });
  const msg = `${step} : ${w.stopped}, ${w.left} pages non écrites (${w.written} écrites)`;
  if (n > STEP_RETRIES || w.written === 0) throw new Error(`${msg}, abandon`);
  console.log(`[étape] ${msg}, reprise dans 1 min (${n}/${STEP_RETRIES})`);
  await again();
}

export const run = internalAction({
  args: { manual: v.optional(v.boolean()) },
  handler: async (ctx, { manual }): Promise<Record<string, number>> => {
    // Le dev (SWARM_SYNC_OFF=1) ne fait pas tourner la synchro planifiée : seulement celle lancée à la main.
    if (backgroundOff() && !manual) return { skipped: 1 };
    const runId = await ctx.runMutation(internal.radarStore.startRun, {});
    if (runId === null) return { skipped: 1 }; // un passage tourne déjà
    resetPeaks();
    const runStart = Date.now();
    let st: Stage | null = null;
    const written: Id<"_storage">[] = []; // fichiers rangés par cette préparation (audit Q55)
    // La préparation n'a pas de reprise : au-delà de STEP_DEADLINE_MS, elle échoue proprement au lieu d'être coupée (Q68).
    const deadline = (where: string) => { if (Date.now() - runStart > STEP_DEADLINE_MS) throw new Error(`préparation : temps écoulé (${where})`); };
    try {
      const base = process.env.JARVIA_EXPORT_URL ?? DEFAULT_EXPORT_URL;
      const secret = process.env.JARVIA_EXPORT_SECRET;
      if (!secret) throw new Error("JARVIA_EXPORT_SECRET absente");
      // Les fichiers des passages d'avant (finis, ratés, coupés) : effacés.
      for (const r of await ctx.runQuery(internal.radarStore.staleStages, { keep: runId })) {
        await stageDrop(ctx, r.ids as Id<"_storage">[]);
        await ctx.runMutation(internal.radarStore.stageCleaned, { id: r.id });
      }
      gc(); // un processus réutilisé garde les restes du passage d'avant (15/11 : 509 Mo au départ du passage de 17h15)
      MEMLOG('départ');
      const now = Date.now();
      const pool = new Map<string, string>();
      const slim: Slim = { intern: (x) => { const y = pool.get(x); if (y) return y; pool.set(x, x); return x; }, now };
      const raw = {} as Omit<Raw, "trackedVideos">;
      for (const t of ["apps", "tracked", "formats", "signals"] as const) { (raw as Record<string, unknown>)[t] = await fetchTable(base, secret, t, slim); gc(); MEMLOG('export ' + t); deadline("export " + t); }
      pool.clear();
      // Essai sur le dev seulement : des comptes marqués « placement payé » à la main (variable SWARM_TEST_PLACEMENT,
      // pseudos séparés par des virgules), tant que l'export du Radar n'envoie pas encore `placement`.
      const testPaid = (process.env.SWARM_TEST_PLACEMENT ?? "").split(",").map((h) => h.trim().replace(/^@/, "")).filter(Boolean);
      if (testPaid.length) for (const t of raw.tracked) if (testPaid.includes(t.handle)) t.placement = true;

      // Fiche App Store des apps pas encore cherchées avec la règle actuelle (titre qui commence par le
      // nom de l'app) ; une fiche qui change efface l'icône rangée, recopiée depuis la bonne fiche.
      // L'App Store limite à ~20 recherches par minute : une toutes les 3,2 s, 3 min au plus.
      const stores: Stores = {};
      await readPages<[string, string | null, number, string | null]>(ctx, internal.radarStore.appStorePage, ([slug, url, v, art]) => { stores[slug] = { url, v, art }; });
      const found: { slug: string; url: string | null; v: number; art: string | null }[] = [];
      let storeErrors = 0;
      const iconsToDrop: string[] = [];
      const storeStart = Date.now();
      // Fiche vérifiée à la main (site ou identifiant) que la fiche rangée ne suit pas encore : revue d'abord.
      const pinnedOff = (slug: string) => {
        const s = stores[slug];
        if (siteOf(slug)) return !s || s.url !== null;
        return !!APP_STORE_ID[slug] && !(s?.url ?? "").includes(`/id${APP_STORE_ID[slug]}`);
      };
      const storeQueue = [...raw.apps].sort((p, q) => Number(pinnedOff(q.slug)) - Number(pinnedOff(p.slug)));
      for (const a of storeQueue) {
        if (a.mergedInto || (stores[a.slug]?.v === STORE_RULE && !pinnedOff(a.slug))) continue;
        if (Date.now() - storeStart > 180_000) break; // 3 min : le reste de l'étape doit tenir dans les 10 min d'une action
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
      if (iconsToDrop.length) await ctx.runMutation(internal.radarStore.dropMedia, { keys: iconsToDrop });

      // Les groupes : apps canoniques, les plus fournies d'abord, GROUP_ACCOUNTS comptes au plus par groupe (une app
      // plus grosse fait son groupe à elle seule). Une app sans compte exporté n'a pas de vidéo : rien à lui demander.
      const canon = canonicalOf(raw.apps);
      const weight = new Map<string, number>();
      for (const t of raw.tracked) { const c = canon(t.appId); weight.set(c, (weight.get(c) ?? 0) + 1); }
      const groups: string[][] = [];
      let cur: string[] = [], n = 0;
      // Une app sans compte exporté et pas active (en pause, à l'essai : 1 083 le 16/11) n'a ni vidéo ni fiche : hors groupes.
      const active = new Set(raw.apps.filter((a) => !a.mergedInto && a.status === "active").map((a) => a.id));
      for (const c of [...new Set(raw.apps.map((a) => canon(a.id)))].filter((c) => active.has(c) || (weight.get(c) ?? 0) > 0).sort((p, q) => (weight.get(q) ?? 0) - (weight.get(p) ?? 0) || (p < q ? -1 : 1))) {
        const w = weight.get(c) ?? 0;
        if (cur.length && n + w > GROUP_ACCOUNTS) { groups.push(cur); cur = []; n = 0; }
        cur.push(c);
        n += w;
      }
      if (cur.length) groups.push(cur);
      const fetchIds = groups.map((g) => { const set = new Set(g); return raw.apps.filter((a) => set.has(canon(a.id)) && (weight.get(canon(a.id)) ?? 0) > 0).map((a) => a.id); });

      deadline("fiches App Store");
      const sizes = { apps: raw.apps.length, tracked: raw.tracked.length, formats: raw.formats.length, signals: raw.signals.length, groups: groups.length };
      // Audit Q55 (19/11) : les fichiers d'étape étaient rangés DANS l'objet `st`, enregistré seulement à la fin ; une erreur
      // ou une coupure entre les deux les laissait pour toujours (~45 Mo par préparation). L'étape est enregistrée d'abord,
      // vide, et chaque fichier y est noté dès qu'il est rangé : une erreur les efface, une coupure les laisse au ménage des
      // passages suivants (staleStages).
      await ctx.runMutation(internal.radarStore.setStage, { id: runId, stage: { now, groups: [], fetch: [], outs: [], sizes, extra: [], globals: { apps: [], tracked: [], formats: [], signals: [], stores: [] } } });
      const note = async (id: Id<"_storage">) => { written.push(id); await ctx.runMutation(internal.radarStore.stageAdd, { id: runId, files: [id] }); };
      const globals = {
        apps: await stageWrite(ctx, raw.apps, 4000, note), tracked: await stageWrite(ctx, raw.tracked, 4000, note), formats: await stageWrite(ctx, raw.formats, 1000, note),
        signals: await stageWrite(ctx, raw.signals, 2000, note), stores: await stageWrite(ctx, [stores], 4000, note),
      };
      st = { now, groups, fetch: fetchIds, outs: groups.map(() => null), sizes, globals };
      MEMLOG(`préparation : ${groups.length} groupes`);
      st.heapPrep = heapPeak;
      st.rssPrep = rssPeak;
      deadline("fichiers d'étape");
      await ctx.runMutation(internal.radarStore.setStage, { id: runId, stage: st });
      await ctx.scheduler.runAfter(0, internal.radarSync.runGroup, { id: runId, i: 0 });
      return sizes;
    } catch (e) {
      await failRun(ctx, runId, e, st);
      if (!st) await stageDrop(ctx, written); // rangés avant que l'étape soit complète (audit Q55)
      throw e;
    }
  },
});

/** Ce dont une étape a besoin des données rangées par la préparation. */
async function loadGlobals(ctx: ActionCtx, st: Stage, keepSignal?: (s: RSignal) => boolean, read?: { apps: RApp[]; formats: RFormat[] }) {
  const apps = read?.apps ?? (await stageRead<RApp>(ctx, st.globals.apps));
  const tracked = await stageRead<RTracked>(ctx, st.globals.tracked);
  const formats = read?.formats ?? (await stageRead<RFormat>(ctx, st.globals.formats));
  const signals = await stageRead<RSignal>(ctx, st.globals.signals, keepSignal);
  const [stores] = await stageRead<Stores>(ctx, st.globals.stores);
  return { apps, tracked, formats, signals, stores };
}

export const runGroup = internalAction({
  args: { id: v.id("syncRuns"), i: v.number() },
  handler: async (ctx, { id, i }): Promise<void> => {
    const runStart = Date.now();
    const st: Stage | null = await ctx.runQuery(internal.radarStore.getStage, { id });
    if (!st) return; // passage fini ou abandonné entre-temps
    await ctx.runMutation(internal.radarStore.beat, { id });
    resetPeaks();
    const mine: Id<"_storage">[] = []; // fichiers rangés par ce groupe, pas encore rendus (audit Q55)
    try {
      gc();
      MEMLOG(`groupe ${i + 1}/${st.groups.length} départ`);
      const base = process.env.JARVIA_EXPORT_URL ?? DEFAULT_EXPORT_URL;
      const secret = process.env.JARVIA_EXPORT_SECRET ?? "";
      const set = new Set(st.groups[i]);
      // Les formats d'abord : leurs reprises et les signaux récents servent à toutes les étapes (choix des formats montrés,
      // alertes) ; les autres signaux, seulement ceux des vidéos du groupe.
      const formats = await stageRead<RFormat>(ctx, st.globals.formats);
      const memberIds = new Set(formats.flatMap((f) => f.members.map((m) => m.videoId)));
      const apps = await stageRead<RApp>(ctx, st.globals.apps);
      const canon = canonicalOf(apps);
      const pool = new Map<string, string>();
      const slim: Slim = { intern: (x) => { const y = pool.get(x); if (y) return y; pool.set(x, x); return x; }, now: st.now };
      const trackedVideos = (await fetchGroupVideos(base, secret, slim, st.fetch[i], (r) => set.has(canon(r.appId as string)))) as RVideo[];
      pool.clear();
      MEMLOG(`groupe ${i + 1} : ${trackedVideos.length} vidéos`);
      const own = new Set(trackedVideos.map((v) => v.videoId));
      const g = await loadGlobals(ctx, st, (s) => own.has(s.videoId) || memberIds.has(s.videoId) || (!!s.multiplier && st.now - s.publishedAt <= 7 * 86_400_000), { apps, formats });
      const ownAcc = new Set(g.tracked.filter((t) => set.has(canon(t.appId))).map((t) => t.id));
      const ownHandles = new Set(g.tracked.filter((t) => ownAcc.has(t.id)).map((t) => t.handle));
      const store = await loadStore(ctx, {
        video: (vid) => own.has(vid), handle: (h) => ownHandles.has(h), account: (a) => ownAcc.has(a),
        media: (k) => k.startsWith("icon:") || (k.startsWith("v:") && own.has(k.slice(2))) || (k.startsWith("a:") && ownHandles.has(k.slice(2))),
      });
      const raw: Raw = { apps, tracked: g.tracked, trackedVideos, formats, signals: g.signals };
      gc();
      MEMLOG(`groupe ${i + 1} avant calcul`);
      const res = buildBoards(raw, st.now, (k) => store.media[k] ?? null, (slug) => g.stores[slug]?.url ?? null, boardOpts(st.now, store, g.stores, { kind: "group", apps: set }));
      // Comptes sans pays, comptes à genrer, langues : seulement ceux du groupe (leurs vidéos y sont).
      for (let j = 0; j < res.regionTodo.length; j += 300) await ctx.runMutation(internal.radarStore.saveRegionTodo, { items: res.regionTodo.slice(j, j + 300) });
      gc();
      MEMLOG(`groupe ${i + 1} après calcul`);
      const w = await writePages(ctx, res.boards as Map<string, unknown>, res.lazy, st.now, runStart);
      MEMLOG(`groupe ${i + 1} écriture ${w.written}`);
      if (w.stopped) {
        await retryStep(ctx, id, `groupe ${i + 1}`, w, () => ctx.scheduler.runAfter(60_000, internal.radarSync.runGroup, { id, i }));
        return;
      }
      // Vidéos à vérifier (carrousel, lecture IA) et comptes à genrer : les nouvelles seulement, une fois les pages écrites.
      const later = res.laterTodos();
      const newSlides = later.slideTodo.filter((x) => !store.slideKnown.has(x)).slice(0, TODO_MAX);
      const newAi = later.videoAiTodo.filter((x) => !store.aiKnown.has(x)).slice(0, TODO_MAX);
      const newGender = res.genderTodo.filter((x) => !store.genderKnown.has(x.handle)).slice(0, TODO_MAX);
      for (let j = 0; j < newSlides.length; j += 500) await ctx.runMutation(internal.radarStore.saveSlideTodo, { ids: newSlides.slice(j, j + 500) });
      for (let j = 0; j < newAi.length; j += 500) await ctx.runMutation(internal.radarStore.saveVideoAiTodo, { ids: newAi.slice(j, j + 500) });
      for (let j = 0; j < newGender.length; j += 300) await ctx.runMutation(internal.radarStore.saveGenderTodo, { items: newGender.slice(j, j + 300) });
      // Langue des comptes jamais calculés : par lots de 200, chacun dans sa propre action (le détecteur hors synchro).
      // Par lots de 100 : 20 textes de 300 caractères par compte, jusqu'à 2,4 Mo en écritures non latines, sous les 5 Mio
      // qu'accepte une action Node.
      for (let j = 0; j < Math.min(res.langTodo.length, TODO_MAX); j += 100) await ctx.scheduler.runAfter(60_000 + j * 100, internal.radarLang.detect, { items: res.langTodo.slice(j, j + 100) });
      const file: GroupFile = { out: res.out!, markets: res.markets, written: w.written, videos: trackedVideos.length, refused: w.refused, heap: heapPeak, rss: rssPeak, biggest: w.biggest, inParts: w.inParts };
      // Images : celles de ses vidéos et de ses comptes seulement (icônes, photos de profil, reprises et alertes sont
      // aussi vues par l'étape globale, qui les compte).
      const ownSlugs = new Set(apps.filter((a) => set.has(canon(a.id))).map((a) => a.slug));
      const ownKey = (k: string) => (k.startsWith("v:") && own.has(k.slice(2))) || (k.startsWith("a:") && ownHandles.has(k.slice(2))) || (k.startsWith("icon:") && ownSlugs.has(k.slice(5)));
      const tail: GroupTail = { used: [...res.used].filter(ownKey), need: [...res.need].filter(([k]) => ownKey(k) && !k.startsWith("icon:")), keys: w.keys };
      const outId = await ctx.storage.store(new Blob([JSON.stringify(file)], { type: "application/json" }));
      mine.push(outId);
      await ctx.runMutation(internal.radarStore.stageAdd, { id, files: [outId] });
      const tailId = await ctx.storage.store(new Blob([JSON.stringify(tail)], { type: "application/json" }));
      mine.push(tailId);
      await ctx.runMutation(internal.radarStore.stageAdd, { id, files: [tailId] });
      await ctx.runMutation(internal.radarStore.groupDone, { id, i, out: outId, tail: tailId, written: w.written });
      mine.length = 0;
      if (i + 1 < st.groups.length) await ctx.scheduler.runAfter(0, internal.radarSync.runGroup, { id, i: i + 1 });
      else await ctx.scheduler.runAfter(0, internal.radarSync.runGlobal, { id });
    } catch (e) {
      await failRun(ctx, id, e, st);
      await stageDrop(ctx, mine); // rangés avant groupDone (audit Q55)
      throw e;
    }
  },
});

export const runGlobal = internalAction({
  args: { id: v.id("syncRuns") },
  handler: async (ctx, { id }): Promise<void> => {
    const runStart = Date.now();
    const st: Stage | null = await ctx.runQuery(internal.radarStore.getStage, { id });
    if (!st) return;
    await ctx.runMutation(internal.radarStore.beat, { id });
    resetPeaks();
    try {
      gc();
      MEMLOG('global départ');
      // Signaux : ceux des alertes possibles et des reprises seulement (les autres n'ont de page que dans leur groupe).
      const formats = await stageRead<RFormat>(ctx, st.globals.formats);
      const memberIds = new Set(formats.flatMap((f) => f.members.map((m) => m.videoId)));
      const g = await loadGlobals(ctx, st, (s) => memberIds.has(s.videoId) || (!!s.multiplier && st.now - s.publishedAt <= 7 * 86_400_000), { apps: await stageRead<RApp>(ctx, st.globals.apps), formats });
      const files: GroupFile[] = [];
      for (const outId of st.outs) {
        const b = outId ? await ctx.storage.get(outId) : null;
        if (!b) throw new Error("étape globale : un groupe n'a pas rangé son fichier");
        files.push(JSON.parse(await b.text()) as GroupFile);
      }
      // Les seules vidéos de cette étape : reprises et signaux que personne ne suit (leur carrousel, leur lecture IA).
      const ids = new Set([...memberIds, ...g.signals.map((s) => s.videoId)]);
      const store = await loadStore(ctx, { video: (x) => ids.has(x), handle: () => false, account: () => false, media: (k) => k.startsWith("icon:") || (k.startsWith("v:") && ids.has(k.slice(2))) });
      const raw: Raw = { apps: g.apps, tracked: g.tracked, trackedVideos: [], formats: g.formats, signals: g.signals };
      gc();
      MEMLOG('global avant calcul');
      let res: ReturnType<typeof buildBoards> | null = buildBoards(raw, st.now, (k) => store.media[k] ?? null, (slug) => g.stores[slug]?.url ?? null, boardOpts(st.now, store, g.stores, { kind: "global", outs: files.map((f) => f.out) }));
      for (const f of files) f.out = null as never; // libéré : seul le calcul s'en servait
      gc();
      MEMLOG('global après calcul');
      const w = await writePages(ctx, res.boards as Map<string, unknown>, res.lazy, st.now, runStart);
      MEMLOG(`global écriture ${w.written}`);
      const later = res.laterTodos(), resUsed = res.used, resNeed = res.need;
      res = null; // le calcul n'est plus utile : libéré avant le ménage
      gc();
      if (w.stopped) {
        await retryStep(ctx, id, "global", w, () => ctx.scheduler.runAfter(60_000, internal.radarSync.runGlobal, { id }));
        return;
      }
      // Le ménage qui suit (images, toutes les clés, pages effacées, fin du passage) prend jusqu'à 2 ou 3 min : commencé
      // trop tard, il serait coupé à 10 min sans rien noter (audit Q68). L'étape reprend alors dans une action neuve, où
      // les pages, déjà écrites, ne sont pas renvoyées.
      if (Date.now() - runStart > STEP_DEADLINE_MS) {
        const n: number = await ctx.runMutation(internal.radarStore.stepRetry, { id, step: "global (ménage)" });
        if (n > STEP_RETRIES) throw new Error("global : le ménage n'a jamais eu le temps de commencer, abandon");
        console.log(`[étape] global : ${Math.round((Date.now() - runStart) / 1000)} s écoulées avant le ménage, reprise dans 1 min (${n}/${STEP_RETRIES})`);
        await ctx.scheduler.runAfter(60_000, internal.radarSync.runGlobal, { id });
        return;
      }

      // Les images qu'aucune page ne cite plus (vidéo sortie des listes) : effacées. Garde-fou : jamais plus d'un tiers
      // d'un coup (un calcul cassé ne vide pas les miniatures).
      // Ce que chaque groupe a produit, cité et demandé : lu fichier par fichier, une fois les pages écrites.
      // Images citées : seulement celles qui sont rangées (le reste n'a rien à effacer) ; à copier : celles de l'étape
      // globale, puis celles des groupes (leurs vidéos, leurs comptes : jamais deux groupes les mêmes).
      const produced = new Set(w.keys), usedStored = new Set([...resUsed].filter((k) => k in store.media));
      const globalNeed = new Set(resNeed.keys());
      let needCount = globalNeed.size;
      const icons: [string, string][] = [], others: [string, string][] = [];
      const wantCopy = (k: string, src: string) => { if (k.startsWith("icon:")) icons.push([k, src]); else if (others.length < MEDIA_PER_DAY) others.push([k, src]); };
      for (const [k, src] of resNeed) wantCopy(k, src);
      for (const tailId of st.tails ?? []) {
        const b = tailId ? await ctx.storage.get(tailId) : null;
        if (!b) throw new Error("étape globale : un groupe n'a pas rangé ses listes");
        const t = JSON.parse(await b.text()) as GroupTail;
        for (const k of t.keys) produced.add(k);
        for (const k of t.used) if (k in store.media) usedStored.add(k);
        for (const [k, src] of t.need) if (!globalNeed.has(k)) { needCount++; wantCopy(k, src); }
      }
      gc();
      MEMLOG(`global listes des groupes : ${produced.size} pages, ${usedStored.size} images citées, ${needCount} à copier`);
      const mediaKeys = Object.keys(store.media);
      const stale = mediaKeys.filter((k) => !usedStored.has(k));
      const staleOk = stale.length <= mediaKeys.length / 3;
      if (staleOk) for (let j = 0; j < stale.length; j += 200) await ctx.runMutation(internal.radarStore.dropMedia, { keys: stale.slice(j, j + 200) });
      // Les pages que ce passage n'a plus produites : effacées (leur fiche mène à « introuvable »). Même garde-fou (le
      // 15/11, une liste mal tenue a effacé 60 000 pages du dev).
      const existing: string[] = [];
      for (let cursor: string | null = null, done = false; !done; ) {
        const page: { keys: string[]; hashes: string[]; cursor: string; done: boolean } = await ctx.runQuery(internal.radarStore.boardKeys, { cursor });
        existing.push(...page.keys);
        cursor = page.cursor;
        done = page.done;
      }
      MEMLOG(`global pages rangées : ${existing.length}`);
      const gone = existing.filter((k) => !produced.has(k));
      const goneOk = gone.length <= existing.length / 3;
      // Par lots de 200, chaque lot relancé avec ce qu'il n'a pas pu effacer (8 Mo lus au plus par appel).
      if (goneOk) for (let j = 0; j < gone.length; j += 200) {
        for (let keys = gone.slice(j, j + 200); keys.length; ) keys = await ctx.runMutation(internal.radarStore.dropBoards, { keys });
      }
      // Les images à copier : icônes d'abord, toute la liste (MEDIA_PER_DAY au plus), copiée par une chaîne d'actions.
      const copyTodo = [...icons, ...others].slice(0, MEDIA_PER_DAY);
      const newSlides = later.slideTodo.filter((x) => !store.slideKnown.has(x)).slice(0, TODO_MAX);
      const newAi = later.videoAiTodo.filter((x) => !store.aiKnown.has(x)).slice(0, TODO_MAX);
      // Pages refusées par Convex (écartées, notées) : une page refusée garde sa version d'avant, jamais effacée.
      const refusedAll = [...w.refused, ...files.flatMap((f) => f.refused ?? [])];
      const counts = {
        ...st.sizes, trackedVideos: files.reduce((n, f) => n + f.videos, 0),
        boards: produced.size, written: w.written + files.reduce((n, f) => n + f.written, 0), writtenGlobal: w.written,
        mediaToCopy: copyTodo.length, mediaMissing: needCount, mediaDropped: staleOk ? stale.length : 0, boardsDropped: goneOk ? gone.length : 0,
        ...(staleOk ? {} : { mediaDropRefused: stale.length }), ...(goneOk ? {} : { boardsDropRefused: gone.length }),
        ...(refusedAll.length ? { pagesRefused: refusedAll.length, pagesRefusedKeys: refusedAll.slice(0, 20) } : {}),
        // La marge sur les limites de Convex, pour la voir fondre avant qu'une limite casse : pic de tas par étape (sur
        // 512 Mo d'action) et plus grosse page (rangée en morceaux au-delà de 600 000 caractères).
        heapMaxMo: Math.max(heapPeak, st.heapPrep ?? 0, ...files.map((f) => f.heap ?? 0)),
        // Audit Q70 : la mémoire totale (sur laquelle l'action meurt à 512 Mo), et le seuil d'arrêt réellement posé.
        rssMaxMo: Math.max(rssPeak, st.rssPrep ?? 0, ...files.map((f) => f.rss ?? 0)), memStopMo: memStopMo(),
        biggestPageKio: Math.round(Math.max(w.biggest[0], ...files.map((f) => f.biggest?.[0] ?? 0)) / 1024),
        biggestPage: ([w.biggest, ...files.map((f) => f.biggest ?? [0, ""])] as [number, string][]).sort((p, q) => q[0] - p[0])[0][1],
        pagesInParts: w.inParts + files.reduce((n, f) => n + (f.inParts ?? 0), 0),
        minutes: Math.round((Date.now() - (st.now)) / 6_000) / 10,
      };
      // Langues des comptes que l'export ne connaît plus (audit Q56) : effacées.
      const knownAccounts = new Set(g.tracked.map((t) => t.id)), oldLangs: string[] = [];
      await readPages<[string, string, number?]>(ctx, internal.radarStore.langPage, ([accountId]) => { if (!knownAccounts.has(accountId)) oldLangs.push(accountId); });
      if (oldLangs.length <= knownAccounts.size / 3) for (let j = 0; j < oldLangs.length; j += 500) await ctx.runMutation(internal.radarStore.dropLangs, { ids: oldLangs.slice(j, j + 500) });
      (counts as Record<string, unknown>).langsDropped = oldLangs.length <= knownAccounts.size / 3 ? oldLangs.length : 0;
      await ctx.runMutation(internal.radarStore.endRun, { id, ok: true, counts });
      await stageDrop(ctx, stageFiles(st));
      await ctx.runMutation(internal.radarStore.stageCleaned, { id });
      for (let j = 0; j < newSlides.length; j += 500) await ctx.runMutation(internal.radarStore.saveSlideTodo, { ids: newSlides.slice(j, j + 500) });
      for (let j = 0; j < newAi.length; j += 500) await ctx.runMutation(internal.radarStore.saveVideoAiTodo, { ids: newAi.slice(j, j + 500) });
      // Lectures de fond, départs étalés (audit F24) : la copie des miniatures d'abord, qui tient le bail des pages TikTok ;
      // pays et carrousels le prennent quand elle a fini (tâche du quart d'heure) ; la lecture IA (qui ne lit TikTok que
      // pour une miniature pas encore copiée) 10 min après.
      if (copyTodo.length) {
        const file = await ctx.storage.store(new Blob([JSON.stringify(copyTodo.map(([key, src]) => ({ key, src })))], { type: "application/json" }));
        await ctx.scheduler.runAfter(0, internal.radarSync.copyMedia, { file });
      }
      await ctx.scheduler.runAfter(5 * 60_000, internal.radarRegions.fill, {});
      await ctx.scheduler.runAfter(5 * 60_000, internal.radarSlides.fill, {});
      await ctx.scheduler.runAfter(10 * 60_000, internal.radarAi.fillVideos, {});
      await ctx.scheduler.runAfter(10 * 60_000, internal.radarAi.fillGender, {});
      // Ménage des tables de suivi et relevé du stockage (audit Q56, F30), une fois le passage fini.
      await ctx.scheduler.runAfter(15 * 60_000, internal.radarStore.purgeTracking, { runId: id });
    } catch (e) {
      await failRun(ctx, id, e, st);
      throw e;
    }
  },
});
