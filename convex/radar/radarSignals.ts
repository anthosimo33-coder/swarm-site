/**
 * NOUVEAU RADAR — signaux : les vidéos qui sortent du lot en ce moment, dans
 * toutes les apps, à adapter pour Snytch et BLUSH.
 *
 * Deux tâches ici, payées au crédit ScrapeCreators et tenues par le budget du
 * mois (les réseaux d'apps et le relevé de leurs comptes : convex/radarNetworks) :
 *  - DÉCOUVERTE (toutes les 6 h) : une part de la rotation de recherches
 *    (convex/radarDiscoveryQueries) ; on garde les vidéos assez vues et assez
 *    au-dessus de leur compte, les jeunes et rapides entrent dans la courbe. Une
 *    vidéo qui cite une app suivie y est rattachée, et son auteur rejoint le
 *    réseau de l'app (convex/radarNetworkMath) ;
 *  - COURBE (toutes les heures) : relevé des vidéos admises à H+6, H+24, H+48.
 *
 * Données GLOBALES (la veille est la même pour tous les projets) ; le statut posé
 * par une équipe, et « concurrent » (une app est concurrente d'un projet donné),
 * se lisent par projet. Règles : convex/radarSignalsMath.
 */
import { v, type Infer } from "convex/values";
import { internal } from "../_generated/api";
import {
  internalAction,
  internalMutation,
  internalQuery,
  type ActionCtx,
  type MutationCtx,
  type QueryCtx,
} from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";
import { e2eMutation, permissionMutation, permissionQuery, type ProjectQueryCtx } from "./functions";
import { dayKeyParis, monthKeyParis } from "./dateFr";
import { DISCOVERY_ROTATION, isRelationFind, isWebFind, signalThemes } from "./radarDiscoveryQueries";
import { SEED_APPS, appNet, candidatesOf, hashtagCandidates, canAttach, effectiveRivalOf, findApp, handPause, needsDeclaredLang, rivalElsewhere, sameAppNet, seedRemoval, seedRulesChanged, seedSync, videoApp, videoCitesApp, type AppRule, type SeedApp, type SeedSync } from "./radarNetworkMath";
import { REJECTED_KEEP_MS } from "./radarVetMath";
import { isTextOnShot } from "./radarDisplay";
import { LANG_BY_HAND, OFF_TOPIC_BY_HAND, SEED_ACCOUNTS, SEED_REMOVED } from "./radarSeedAccounts";
import {
  BUDGET_VERSION,
  DISCOVERY_RUNS_PER_DAY,
  POSTE_KEYS,
  TH_RESERVE_USD,
  envelopeUsdAt,
  RETENTION_DAYS,
  SIGNALS_LIST_CAP,
  SC_CURRENCY,
  SC_PRICE_PER_CREDIT,
  addCounts,
  addSnapshot,
  allowanceParts,
  cleanText,
  budgetState,
  curveAdmissionsLeft,
  curveCandidate,
  foundByLabel,
  keepSignal,
  nextCheckpointAt,
  nextQueries,
  normalizeBudget,
  ratioOf,
  creditAlert,
  CREDIT_RESERVE,
  TH_PRICE_USD,
  scPerDay,
  nextSpentLots,
  spentOf,
  thPerDay,
  usageUnits,
  CURVE_LANE_WAIT_MS,
  curveCountsOf,
  curveLaneTake,
  curveNetCutoff,
  type Balance,
  type BudgetState,
  type CreditAlertKind,
  type BudgetSettings,
  type PosteKey,
  type Provider,
  type SignalInput,
} from "./radarSignalsMath";
import { CURVE_FREE, curveSaved, curveTally, noFansMatch, readCurvePages, scRefused, settleCurve, type CurveMatch, type CurveReason, type FreePage } from "./radarFreeMath";
import { keptFirst } from "./radarCreatorsMath";
import { scKeyPresent, scSearchKeyword, scVideoInfo } from "./scrapeCreatorsApi";
import { TH_ROUTES, thKeyPresent, thSearchKeyword, thVideoInfo, type ThPrices } from "./tikhubApi";
import { FALLBACK_SC_PER_DAY, PassBook, canCall, fallbackClaimer, makeRouter, passGate, passLimit, posteProvider, posteProviders, spendUnits, tikhubJobs, type ThJob } from "./radarProviders";

const DAY = 86_400_000;

export const signalInput = v.object({
  platform: v.optional(v.union(v.literal("tiktok"), v.literal("instagram"))),
  videoId: v.string(),
  url: v.string(),
  authorId: v.string(),
  authorHandle: v.string(),
  authorFans: v.number(),
  caption: v.string(),
  lang: v.string(),
  region: v.optional(v.string()),
  publishedAt: v.number(),
  durationSec: v.optional(v.number()),
  coverUrl: v.optional(v.string()),
  isAd: v.boolean(),
  views: v.number(),
  likes: v.number(),
  comments: v.number(),
  shares: v.number(),
  saves: v.number(),
  hook: v.optional(v.string()),
  musicId: v.optional(v.string()),
  musicTitle: v.optional(v.string()),
  musicOwner: v.optional(v.string()),
  mentions: v.optional(v.array(v.object({ id: v.string(), label: v.string() }))),
  authorBio: v.optional(v.string()),
});

const statusArg = v.union(v.literal("nouveau"), v.literal("enregistre"), v.literal("adapte"), v.literal("ignore"));

export async function readSettings(ctx: QueryCtx): Promise<Doc<"radarSettings"> | null> {
  return ctx.db.query("radarSettings").withIndex("by_key", (q) => q.eq("key", "global")).first();
}

/** Le document de réglages, créé avec le budget par défaut au premier besoin. */
export async function ensureSettings(ctx: MutationCtx): Promise<Doc<"radarSettings">> {
  const got = await readSettings(ctx);
  if (got) return got;
  const d = normalizeBudget(null);
  const id = await ctx.db.insert("radarSettings", {
    key: "global",
    capUsd: d.capUsd,
    postes: d.postes,
    cutOrder: d.cutOrder,
    alert80: d.alert80,
    budgetVersion: BUDGET_VERSION,
    discoveryCursor: 0,
    curveAdmitted: 0,
    updatedAt: Date.now(),
  });
  return (await ctx.db.get(id))!;
}

async function monthUsage(ctx: QueryCtx, month: string) {
  return ctx.db.query("radarUsage").withIndex("by_month", (q) => q.eq("month", month)).collect();
}

// ─── Apps et réseaux : ce que partagent découverte et relevés de comptes ────

/** Une app suivie, telle que le rattachement et l'écriture d'un signal la lisent. */
export type AppRef = { id: Id<"radarApps">; name: string; rivalOf: string[] };

/** Les apps actives, dans l'ordre de création (la première citée l'emporte). */
export async function activeApps(ctx: QueryCtx) {
  return ctx.db.query("radarApps").withIndex("by_status", (q) => q.eq("status", "active")).collect();
}

export const appRef = (a: Pick<Doc<"radarApps">, "_id" | "name" | "rivalOf">): AppRef => ({ id: a._id, name: a.name, rivalOf: a.rivalOf });

/**
 * Ce qu'une écriture lit d'une app quand on lui passe les motifs au lieu de relire la table (`appRules`) : ses motifs
 * (radarNetworkMath.AppRule), son nom, ses projets concurrents, son statut. Les motifs de 2 187 apps pèsent 0,38 Mo
 * (20/11/2026), et un argument ne se lit pas en base.
 */
export const appLiteValidator = v.object({
  _id: v.id("radarApps"),
  status: v.union(v.literal("active"), v.literal("paused")),
  name: v.string(),
  rivalOf: v.array(v.string()),
  strong: v.array(v.string()),
  weak: v.array(v.string()),
  context: v.array(v.string()),
  not: v.optional(v.array(v.string())),
});
export type AppLite = Infer<typeof appLiteValidator>;
export const appLite = (a: Doc<"radarApps">): AppLite => ({
  _id: a._id,
  status: a.status,
  name: a.name,
  rivalOf: a.rivalOf,
  strong: a.strong,
  weak: a.weak,
  context: a.context,
  ...(a.not ? { not: a.not } : {}),
});
/** Au-delà, la liste ne tient plus dans un argument Convex (8 192 éléments par tableau) : chaque écriture relit la table. */
export const APP_RULES_MAX = 8_000;

/**
 * Les apps de départ et leurs comptes de départ (idempotent). Une app de départ
 * suit le code : ses motifs, recherches et concurrences y sont recopiés. Une app
 * ajoutée à la main n'est jamais touchée — sauf quand elle entre dans la liste
 * des apps de départ : elle est alors adoptée (radarNetworkMath.seedSync).
 */
export async function ensureSeedApps(ctx: MutationCtx): Promise<number> {
  let created = 0;
  const now = Date.now();
  const counter: TrackedCounter = {};
  for (const s of SEED_APPS) {
    const r = await syncSeedApp(ctx, s, now);
    if (r.sync === "create") created++;
    if (!r.app) continue;
    let seeded = 0;
    for (const handle of SEED_ACCOUNTS[s.slug] ?? []) {
      if ((await attachAccount(ctx, r.app, handle, 0, "seed", now, counter)) === "added") seeded++;
    }
    if (seeded) await refreshAppNet(ctx, r.app._id, now);
  }
  // Un compte retiré de la liste de départ n'est plus relevé, s'il y était entré par elle (radarNetworkMath.seedRemoval).
  for (const handle of SEED_REMOVED) {
    const t = await ctx.db.query("radarTracked").withIndex("by_handle", (q) => q.eq("platform", "tiktok").eq("handle", handle)).first();
    if (seedRemoval(t)) await ctx.db.patch(t!._id, { status: "paused" });
  }
  // Les comptes mis en pause à la main (gros généralistes, homonymes) : une fois, sans défaire une réactivation.
  for (const handle of OFF_TOPIC_BY_HAND) {
    const t = await ctx.db.query("radarTracked").withIndex("by_handle", (q) => q.eq("platform", "tiktok").eq("handle", handle)).first();
    if (handPause(t)) await ctx.db.patch(t!._id, { status: "paused", pausedReason: "offTopic" });
  }
  await syncDeclaredLangs(ctx);
  return created;
}

/**
 * Pose la langue déclarée à la main des comptes suivis qui ne l'ont pas (radarNetworkMath.needsDeclaredLang) :
 * sans elle, un compte dont TikTok ne reconnaît pas la langue n'est dans aucune langue de l'onglet Créateurs.
 * Idempotent ; rend le nombre de comptes écrits.
 */
export async function syncDeclaredLangs(ctx: MutationCtx, byHand: Readonly<Record<string, readonly string[]>> = LANG_BY_HAND): Promise<number> {
  let set = 0;
  for (const [lang, handles] of Object.entries(byHand)) {
    for (const handle of handles) {
      const t = await ctx.db.query("radarTracked").withIndex("by_handle", (q) => q.eq("platform", "tiktok").eq("handle", handle)).first();
      if (!needsDeclaredLang(t, lang)) continue;
      await ctx.db.patch(t!._id, { lang });
      set++;
    }
  }
  return set;
}

/** e2e : pose une langue déclarée à des comptes donnés ici (la vraie liste n'est pas semée en e2e). */
export const e2eSyncDeclaredLangs = e2eMutation({
  args: { lang: v.string(), handles: v.array(v.string()) },
  handler: (ctx, { lang, handles }) => syncDeclaredLangs(ctx, { [lang]: handles }),
});

/** Comptes d'un doublon déplacés par passage (la suite au passage suivant, toutes les heures). */
const MERGE_BATCH = 25;

/** Comptes lus au plus pour le résumé d'un réseau (une app non concurrente en a 300 au plus). */
const APP_NET_MAX = 4_000;

/**
 * Refait le résumé du réseau d'une app (radarNetworkMath.appNet) à partir de ses comptes, et ne l'écrit que
 * s'il change. Appelé quand ses comptes changent (ajout, pause, changement de réseau), puis chaque heure pour
 * les publications de la semaine et la meilleure vidéo (radarNetworks.refreshAppNets).
 */
export async function refreshAppNet(ctx: MutationCtx, appId: Id<"radarApps">, now: number): Promise<void> {
  const app = await ctx.db.get(appId);
  if (!app) return;
  const accounts = await ctx.db.query("radarTracked").withIndex("by_app", (q) => q.eq("appId", appId)).take(APP_NET_MAX);
  const net = appNet(accounts);
  if (!sameAppNet(app.net, net)) await ctx.db.patch(appId, { net: { ...net, at: now } });
}

/**
 * Change un compte de réseau (radarNetworkMath.accountVerdict, ou la fusion d'un
 * doublon) : lui, ses vidéos lues récentes (les formats et la vue d'ensemble les
 * rangent par app) et le compteur de comptes des deux apps.
 */
export async function moveAccount(
  ctx: MutationCtx,
  acc: Doc<"radarTracked">,
  // Les ids seuls : les deux apps sont relues ici (un relevé de compte n'a que leurs motifs, cf radarNetworks.appRules).
  from: Pick<Doc<"radarApps">, "_id">,
  to: Pick<Doc<"radarApps">, "_id">,
  recent: readonly Doc<"radarTrackedVideos">[],
): Promise<void> {
  await ctx.db.patch(acc._id, { appId: to._id });
  for (const vid of recent) if (vid.appId !== to._id) await ctx.db.patch(vid._id, { appId: to._id });
  // Relus : plusieurs comptes peuvent changer de réseau dans la même mutation.
  const f = await ctx.db.get(from._id);
  const t = await ctx.db.get(to._id);
  if (f?.trackedCount !== undefined) await ctx.db.patch(f._id, { trackedCount: Math.max(0, f.trackedCount - 1) });
  if (t?.trackedCount !== undefined) await ctx.db.patch(t._id, { trackedCount: t.trackedCount + 1 });
}

/**
 * Fond un doublon dans la vraie app : ses comptes la rejoignent, relevés dans
 * l'heure — donc jugés sur ses vrais motifs (un compte qui ne la cite jamais est
 * mis en pause, comme les autres). Vidé, le doublon devient un RENVOI : en pause,
 * hors des listes (`mergedInto`), au nom et aux motifs de la vraie app pour que
 * les vidéos et les formats qui le désignent encore se lisent sous elle. Rien
 * n'est supprimé.
 */
export async function mergeApp(ctx: MutationCtx, old: Doc<"radarApps">, into: Doc<"radarApps">, rules: Partial<Doc<"radarApps">>, now: number): Promise<void> {
  const accounts = await ctx.db.query("radarTracked").withIndex("by_app", (q) => q.eq("appId", old._id)).take(MERGE_BATCH + 1);
  for (const acc of accounts.slice(0, MERGE_BATCH)) {
    const recent = await ctx.db.query("radarTrackedVideos").withIndex("by_account_published", (q) => q.eq("accountId", acc._id)).order("desc").take(100);
    await moveAccount(ctx, acc, old, into, recent);
    if (acc.status === "active") await ctx.db.patch(acc._id, { nextReadAt: now });
  }
  if (accounts.length) {
    await refreshAppNet(ctx, old._id, now);
    await refreshAppNet(ctx, into._id, now);
  }
  if (accounts.length > MERGE_BATCH) return;
  await ctx.db.patch(old._id, { ...rules, searches: [], status: "paused", mergedInto: into._id });
}

/** Aligne UNE app de départ sur le code : créée, adoptée (ajoutée à la main avant), réalignée ou laissée. */
async function syncSeedApp(ctx: MutationCtx, s: SeedApp, now: number): Promise<{ app: Doc<"radarApps"> | null; sync: SeedSync }> {
  let app = await ctx.db.query("radarApps").withIndex("by_slug", (q) => q.eq("slug", s.slug)).first();
  // Les concurrences de la liste, corrigées par ce que les équipes ont décidé à la main.
  const fieldsOf = (a: Doc<"radarApps"> | null) => ({
    name: s.name,
    rivalOf: effectiveRivalOf(s.rivalOf, a?.rivalByHand ?? []),
    strong: [...s.strong],
    weak: [...(s.weak ?? [])],
    context: [...(s.context ?? [])],
    searches: [...s.searches],
    ...(s.not ? { not: [...s.not] } : {}),
  });
  // Ajoutée à la main sous un autre nom : elle prend le bon slug (et sera adoptée
  // plus bas), ou, si l'app existe déjà, c'est un doublon qu'on fond dedans.
  for (const former of s.formerSlugs ?? []) {
    const old = await ctx.db.query("radarApps").withIndex("by_slug", (q) => q.eq("slug", former)).first();
    if (!old) continue;
    // Les règles de la vraie app, sans ses recherches : un renvoi n'est jamais recherché.
    const f = fieldsOf(app);
    const rules = { name: f.name, rivalOf: f.rivalOf, strong: f.strong, weak: f.weak, context: f.context, ...(f.not ? { not: f.not } : {}) };
    if (!app) {
      await ctx.db.patch(old._id, { slug: s.slug });
      app = { ...old, slug: s.slug };
    } else if (old.mergedInto === undefined) {
      await mergeApp(ctx, old, app, rules, now);
    } else if (JSON.stringify(Object.keys(rules).map((k) => old[k as keyof typeof rules])) !== JSON.stringify(Object.values(rules))) {
      // Déjà un renvoi : il suit les motifs de la vraie app.
      await ctx.db.patch(old._id, rules);
    }
  }
  const fields = fieldsOf(app);
  const same = app !== null && JSON.stringify(Object.keys(fields).map((k) => app[k as keyof typeof fields])) === JSON.stringify(Object.values(fields));
  const sync = seedSync(app, same);
  if (sync === "create") {
    const id = await ctx.db.insert("radarApps", { slug: s.slug, ...fields, status: "active", source: "seed", createdAt: now });
    return { app: await ctx.db.get(id), sync };
  }
  if (!app || sync === "keep") return { app, sync };
  // « adopt » : l'app ajoutée à la main devient une app de départ ; ses comptes et ses vidéos restent.
  // Motifs ou recherches changés : son réseau se recherche de nouveau, à fond (cf seedRulesChanged).
  const research = seedRulesChanged(app, fields) ? { networkSearchedAt: undefined, deepSearchedAt: undefined } : {};
  const patch = { ...fields, ...(sync === "adopt" ? { source: "seed" as const } : {}), ...research };
  await ctx.db.patch(app._id, patch);
  return { app: { ...app, ...patch }, sync };
}

/** e2e : aligne une app sur une entrée de la liste de départ donnée ici (la vraie liste n'est pas semée en e2e). */
export const e2eSyncSeedApp = e2eMutation({
  args: {
    seed: v.object({
      slug: v.string(),
      name: v.string(),
      rivalOf: v.array(v.string()),
      strong: v.array(v.string()),
      searches: v.array(v.string()),
      formerSlugs: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, { seed }) => {
    const { sync } = await syncSeedApp(ctx, seed, Date.now());
    // Relue en base : c'est ce qui est écrit qu'on vérifie, pas ce que la fonction renvoie.
    const app = await ctx.db.query("radarApps").withIndex("by_slug", (q) => q.eq("slug", seed.slug)).first();
    // Ce que sont devenus ses anciens slugs : un doublon fondu reste, en pause et sans compte.
    const former: { slug: string; name: string; status: "active" | "paused"; merged: boolean; accounts: number }[] = [];
    for (const slug of seed.formerSlugs ?? []) {
      const old = await ctx.db.query("radarApps").withIndex("by_slug", (q) => q.eq("slug", slug)).first();
      if (!old) continue;
      const accounts = await ctx.db.query("radarTracked").withIndex("by_app", (q) => q.eq("appId", old._id)).collect();
      former.push({ slug, name: old.name, status: old.status, merged: old.mergedInto === app?._id, accounts: accounts.length });
    }
    return { sync, source: app?.source ?? null, name: app?.name ?? null, rivalOf: app?.rivalOf ?? [], strong: app?.strong ?? [], searched: app?.networkSearchedAt !== undefined, former };
  },
});

/**
 * Comptes suivis par app, lus UNE fois par mutation dans le compteur de chaque app
 * (`radarApps.trackedCount`) : relire 3 000 comptes à chaque ajout coûterait ~1 Go
 * de lectures par jour. Une app sans compteur (créée avant lui) est comptée une
 * fois par son index, puis le garde.
 */
export type TrackedCounter = { counts?: { total: number; byApp: Map<string, number>; rows: Map<string, number>; others: number } };

/**
 * `byApp`, `total`, `others` : la place prise (lignes moins comptes en pause « hors sujet »), que le plafond lit ;
 * `rows` : les lignes de chaque app, le compteur `radarApps.trackedCount` tel qu'il est rangé.
 *
 * Seules les apps qui ont des comptes, ou pas encore de compteur, sont lues (index `by_tracked_count`) : une app à 0
 * compte ne prend aucune place (max(0, 0 − hors sujet) = 0) et n'entre dans aucune somme ; absente des tables, elle y
 * vaut 0, comme chez ses lecteurs (`?? 0`). Corrigé le 20/11/2026 : toute la table était relue (2 187 apps, 1,84 Mo),
 * à chaque page de la recherche du réseau qui ramenait un auteur pas encore suivi ; 801 apps (0,92 Mo) ont des comptes.
 * Même résultat, dans la même transaction (tests/radar/radar-lectures-recherches.test.ts, L5).
 */
export async function trackedCounts(ctx: MutationCtx) {
  const byApp = new Map<string, number>();
  const rowsByApp = new Map<string, number>();
  let total = 0;
  let others = 0;
  const apps = [
    ...(await ctx.db.query("radarApps").withIndex("by_tracked_count", (q) => q.eq("trackedCount", undefined)).collect()),
    ...(await ctx.db.query("radarApps").withIndex("by_tracked_count", (q) => q.gt("trackedCount", 0)).collect()),
  ];
  for (const a of apps) {
    let rows = a.trackedCount;
    if (rows === undefined) {
      rows = (await ctx.db.query("radarTracked").withIndex("by_app", (q) => q.eq("appId", a._id)).collect()).length;
      await ctx.db.patch(a._id, { trackedCount: rows });
    }
    // Les comptes en pause « hors sujet » ne prennent pas de place : le 13/11/2026, Hush comptait 324 lignes pour
    // 7 comptes actifs (ses déchets d'un motif trop large) et ne pouvait plus recevoir un seul vrai créateur.
    const n = Math.max(0, rows - (a.net?.offTopic ?? 0));
    rowsByApp.set(a._id, rows);
    byApp.set(a._id, n);
    total += n;
    if (a.rivalOf.length === 0) others += n;
  }
  return { total, byApp, rows: rowsByApp, others };
}

/**
 * Ajoute un compte au réseau d'une app, s'il n'y est pas déjà et qu'il reste de
 * la place (cf radarNetworkMath.canTrack). Son premier relevé est immédiat.
 */
export async function attachAccount(
  ctx: MutationCtx,
  // Son id et ses projets concurrents suffisent (la découverte passe les motifs, cf `appLiteValidator`).
  app: Pick<Doc<"radarApps">, "_id" | "rivalOf">,
  handle: string,
  fans: number,
  matchedBy: "caption" | "manual" | "seed",
  now: number,
  counter: TrackedCounter,
  // La langue de la vidéo qui l'a fait trouver : un francophone passe outre le plafond de son app (canAttach).
  lang?: string,
  // Trouvé par une recherche : il attend le filtre d'entrée (convex/radarVet) avant d'être relevé et montré.
  vet = false,
): Promise<"added" | "known" | "full"> {
  const known = await ctx.db.query("radarTracked").withIndex("by_handle", (q) => q.eq("platform", "tiktok").eq("handle", handle)).first();
  if (known) return "known";
  if (vet) {
    // Déjà écarté pour cette app il y a moins de 30 jours : pas revérifié.
    const rejected = await ctx.db.query("radarRejected").withIndex("by_handle_app", (q) => q.eq("handle", handle).eq("appId", app._id)).first();
    if (rejected && now - rejected.at < REJECTED_KEEP_MS) return "known";
  }
  counter.counts ??= await trackedCounts(ctx);
  const c = counter.counts;
  const rival = app.rivalOf.length > 0;
  if (!canAttach({ total: c.total, ofApp: c.byApp.get(app._id) ?? 0, others: c.others }, rival, matchedBy, lang)) return "full";
  c.total++;
  c.byApp.set(app._id, (c.byApp.get(app._id) ?? 0) + 1);
  const rows = (c.rows.get(app._id) ?? 0) + 1;
  c.rows.set(app._id, rows);
  if (!rival) c.others++;
  await ctx.db.patch(app._id, { trackedCount: rows });
  await ctx.db.insert("radarTracked", {
    platform: "tiktok",
    handle,
    appId: app._id,
    ...(vet ? { status: "paused" as const, pausedReason: "vetting" as const, vetAt: now } : { status: "active" as const, proofAt: now }),
    matchedBy,
    fans,
    videosSeen: 0,
    nextReadAt: now,
    readErrors: 0,
    addedAt: now,
  });
  return "added";
}

/**
 * Ce qu'une vidéo cite et qui pourrait être une app (compte mentionné, domaine) :
 * rangé dans radarAppCandidates, un auteur compté une fois. Ce qui cite déjà une
 * app suivie n'y entre pas.
 */
export async function noteCandidates(
  ctx: MutationCtx,
  s: Pick<SignalInput, "caption" | "authorId" | "authorHandle" | "url" | "mentions" | "authorBio">,
  now: number,
  // Leurs motifs suffisent (un relevé de compte ne passe que ceux-là, cf radarNetworks.appRules).
  apps: readonly AppRule[],
  fromApp?: Id<"radarApps">,
  // Une vidéo trouvée par une recherche de produit web (radarDiscoveryQueries.isWebFind) : ses hashtags aussi.
  withHashtags = false,
): Promise<void> {
  for (const c of [...candidatesOf(s), ...(withHashtags ? hashtagCandidates(s.caption) : [])]) {
    if (findApp(c.label, "", apps)) continue;
    const got = await ctx.db.query("radarAppCandidates").withIndex("by_key", (q) => q.eq("key", c.key)).first();
    const example = { handle: s.authorHandle, url: s.url };
    if (!got) {
      await ctx.db.insert("radarAppCandidates", {
        key: c.key,
        kind: c.kind,
        label: c.label,
        authors: [s.authorHandle],
        authorCount: 1,
        fromApps: fromApp ? [fromApp] : [],
        examples: [example],
        status: "new",
        firstSeenAt: now,
        lastSeenAt: now,
      });
    } else if (!got.authors.includes(s.authorHandle)) {
      await ctx.db.patch(got._id, {
        authors: [...got.authors, s.authorHandle].slice(-50),
        authorCount: got.authorCount + 1,
        ...(fromApp && !got.fromApps.includes(fromApp) ? { fromApps: [...got.fromApps, fromApp] } : {}),
        ...(got.examples.length < 5 ? { examples: [...got.examples, example] } : {}),
        lastSeenAt: now,
      });
    }
  }
}

/**
 * Écrit un signal : met à jour une vidéo connue (vues, abonnés, relevé), ou en
 * insère une neuve — à l'appelant de dire si elle mérite d'entrer (`insert`).
 */
export async function writeSignal(
  ctx: MutationCtx,
  // La langue arrive des arguments Convex en texte (déjà rangée par langBucket).
  s: Omit<SignalInput, "lang"> & { lang: string },
  now: number,
  opts: {
    insert: boolean;
    foundBy?: string;
    app?: AppRef;
    trackedAccountId?: Id<"radarTracked">;
    multiplier?: number;
    curve?: { nextCheckAt?: number; curveStartedAt?: number };
    forceSnapshot?: boolean;
    /**
     * Les abonnés de l'auteur ne sont pas mesurés (0 d'une recherche TikHub, 20/11/2026) : une vidéo connue garde ses
     * abonnés et son ratio se calcule dessus ; une vidéo neuve n'entre pas (son ratio serait inventé).
     */
    fansUnknown?: boolean;
    /** Lue sur sa page publique : une vidéo déjà rangée garde son texte à l'écran et son son (leur ordre diffère du payant, radarFreeMath). */
    keepText?: boolean;
  },
): Promise<"inserted" | "updated" | "skipped"> {
  const platform = s.platform ?? "tiktok";
  const existing = await ctx.db
    .query("radarSignals")
    .withIndex("by_video", (q) => q.eq("platform", platform).eq("videoId", s.videoId))
    .first();
  if (opts.fansUnknown) {
    if (!existing) return "skipped";
    s = { ...s, authorFans: existing.authorFans };
  }
  const app = opts.app ? { appId: opts.app.id, appName: opts.app.name, appRivalOf: opts.app.rivalOf } : {};
  const tracked = opts.trackedAccountId ? { trackedAccountId: opts.trackedAccountId } : {};
  const mult = opts.multiplier !== undefined ? { multiplier: opts.multiplier } : {};
  if (existing) {
    const views = Math.max(existing.views, s.views);
    await ctx.db.patch(existing._id, {
      authorFans: s.authorFans,
      caption: s.caption,
      views,
      likes: s.likes,
      comments: s.comments,
      shares: s.shares,
      saves: s.saves,
      ratio: ratioOf(views, s.authorFans),
      snapshots: addSnapshot(existing.snapshots, now, s.views, opts.forceSnapshot),
      ...(s.coverUrl ? { coverUrl: s.coverUrl } : {}),
      ...(s.hook && !opts.keepText ? { hook: s.hook } : {}),
      ...(s.musicTitle && !opts.keepText ? { musicTitle: s.musicTitle } : {}),
      ...(opts.foundBy && !existing.foundBy.includes(opts.foundBy) ? { foundBy: [...existing.foundBy, opts.foundBy].slice(-10) } : {}),
      ...app,
      ...tracked,
      ...mult,
      lastSeenAt: now,
      ...(opts.curve ?? {}),
    });
    return "updated";
  }
  if (!opts.insert) return "skipped";
  await ctx.db.insert("radarSignals", {
    platform,
    videoId: s.videoId,
    url: s.url,
    authorId: s.authorId,
    authorHandle: s.authorHandle,
    authorFans: s.authorFans,
    caption: s.caption,
    lang: s.lang,
    ...(s.region ? { region: s.region } : {}),
    publishedAt: s.publishedAt,
    ...(s.durationSec !== undefined ? { durationSec: s.durationSec } : {}),
    ...(s.coverUrl ? { coverUrl: s.coverUrl } : {}),
    ...(s.hook ? { hook: s.hook } : {}),
    ...(s.musicTitle ? { musicTitle: s.musicTitle } : {}),
    views: s.views,
    likes: s.likes,
    comments: s.comments,
    shares: s.shares,
    saves: s.saves,
    ratio: ratioOf(s.views, s.authorFans),
    snapshots: [{ at: now, views: s.views }],
    ...app,
    ...tracked,
    ...mult,
    foundBy: opts.foundBy ? [opts.foundBy] : [],
    firstSeenAt: now,
    lastSeenAt: now,
    ...(opts.curve ?? {}),
  });
  return "inserted";
}

// ─── Lecture pour les tâches ─────────────────────────────────────────────────
// Types de retour DÉCLARÉS : les actions appellent ces fonctions par
// `internal.radar.radarSignals.*` ; inférés, ils bouclent et font tomber toute l'API
// générée en `any` (erreurs dans des fichiers sans rapport).

/** Une ligne d'usage telle que les tâches la lisent (les champs TikHub seulement quand il y en a). */
export type JobUsage = { poste: string; credits: number; day: string; usd?: number; thCalls?: number; thUsd?: number; thUnknown?: number; thFallbacks?: number };

/** Le solde TikHub rangé (radarSettings), tel que le budget le lit (radarSignalsMath.ThBalance, sans `now`). */
export type ThStored = { paidUsd: number; freeUsd: number; seenAt: number; spentSinceUsd: number; perDay: number | null };

export type JobState = {
  budget: BudgetSettings;
  cursor: number;
  usage: JobUsage[];
  day: string;
  month: string;
  /** Le solde ScrapeCreators lu au dernier appel payant (`null` : jamais lu). Il borne chaque poste (budgetState). */
  balance: Balance | null;
  /** Jours (Paris) où l'alerte de solde de chaque genre est déjà partie. */
  creditAlerted: Partial<Record<CreditAlertKind, string>>;
  /** La dépense des 4 derniers jours, mois précédent compris : le rythme qui dit combien de jours le solde tient. */
  recentUsage: JobUsage[];
  /** Le solde TikHub rangé (`null` : jamais lu), ses tarifs lus (`null` : jamais lus) et l'heure de leur lecture. */
  th: ThStored | null;
  thPrices: ThPrices | null;
  thPricesAt: number | null;
  /** Appels repassés par ScrapeCreators faute de TikHub aujourd'hui, tous postes (radarProviders.FALLBACK_SC_PER_DAY). */
  fallbacksToday: number;
};

/** Une ligne d'usage pour les tâches : les champs TikHub n'y sont que s'ils sont rangés. */
const jobUsage = (u: Doc<"radarUsage">): JobUsage => ({
  poste: u.poste,
  credits: u.credits,
  day: u.day,
  ...(u.usd !== undefined ? { usd: u.usd } : {}),
  ...(u.thCalls !== undefined ? { thCalls: u.thCalls } : {}),
  ...(u.thUsd !== undefined ? { thUsd: u.thUsd } : {}),
  ...(u.thUnknown !== undefined ? { thUnknown: u.thUnknown } : {}),
  ...(u.thFallbacks !== undefined ? { thFallbacks: u.thFallbacks } : {}),
});

/**
 * Le solde TikHub rangé, pour le budget (radarSignalsMath.ThBalance), avec son rythme : celui des postes que TikHub sert
 * sous le réglage en cours (radarSignalsMath.thPerDay).
 */
function thStored(settings: Doc<"radarSettings"> | null, recent: readonly JobUsage[], day: string, providers: Partial<Record<PosteKey, Provider>>): ThStored | null {
  if (settings?.thBalanceUsd === undefined || settings.thSeenAt === undefined) return null;
  return {
    paidUsd: settings.thBalanceUsd,
    freeUsd: settings.thFreeUsd ?? 0,
    seenAt: settings.thSeenAt,
    spentSinceUsd: settings.thSpentSinceUsd ?? 0,
    perDay: thPerDay(recent, day, providers),
  };
}

/** Les replis écrits dans radarUsage ce jour-là (Paris), tous postes. */
const fallbacksOn = (rows: readonly { day: string; thFallbacks?: number }[], day: string): number =>
  rows.filter((u) => u.day === day).reduce((n, u) => n + (u.thFallbacks ?? 0), 0);

/**
 * Les appels repassés par ScrapeCreators faute de TikHub ce jour-là (Paris), tous postes : ce que borne la porte de
 * repli (radarProviders.FALLBACK_SC_PER_DAY). Les replis PRIS (claimFallback, avant l'appel, tous passages) et, s'ils
 * sont plus nombreux, ceux écrits dans radarUsage (pris avant ce compte). Un seul calcul pour les tâches (jobState),
 * pour la mutation qui prend le quota et pour /admin (20/11/2026).
 */
const fallbacksUsed = (settings: Doc<"radarSettings"> | null, rows: readonly { day: string; thFallbacks?: number }[], day: string): number =>
  Math.max(settings?.thFallbackDay === day ? (settings.thFallbackClaims ?? 0) : 0, fallbacksOn(rows, day));

/**
 * Prend une place de la porte de repli pour un appel chez ScrapeCreators, AVANT l'appel : `false` si le quota du jour
 * (Paris) est atteint, tous passages confondus. Corrigé le 20/11/2026 : chaque passage comptait ses replis contre le
 * quota lu à son ouverture (jobState), sans voir ceux des passages qui tournaient en même temps (relevés toutes les
 * 10 minutes, réseau à l'heure pile, recherches lancées par le suivi d'office, courbe) — 200 à 400 replis par jour au
 * lieu de 100, sur la clé ScrapeCreators que partagent les relevés de la paie de Jarvia. Une mutation : deux passages
 * qui la prennent en même temps sont mis en série par la base, aucun ne dépasse le quota. Une place prise pour un appel
 * qui n'aboutit pas reste prise (le quota est une borne haute).
 */
export const claimFallback = internalMutation({
  args: { now: v.number() },
  handler: async (ctx, { now }): Promise<boolean> => {
    const settings = await ensureSettings(ctx);
    const day = dayKeyParis(now);
    const rows = await ctx.db.query("radarUsage").withIndex("by_day_poste", (q) => q.eq("day", day)).collect();
    const used = fallbacksUsed(settings, rows, day);
    if (used >= FALLBACK_SC_PER_DAY) return false;
    await ctx.db.patch(settings._id, { thFallbackDay: day, thFallbackClaims: used + 1 });
    return true;
  },
});

const pricesOf = (settings: Doc<"radarSettings"> | null): ThPrices | null =>
  settings?.thPrices ? Object.fromEntries(settings.thPrices.map((p) => [p.route, { usd: p.usd, free: p.free }])) : null;
type DueCheck = { id: Id<"radarSignals">; url: string; videoId: string; handle: string };
export type RunResult = { skipped: "no-key" | "busy" } | { calls: number; credits: number; errors: number };

export const jobState = internalQuery({
  args: { now: v.number() },
  handler: async (ctx, { now }): Promise<JobState> => {
    const settings = await readSettings(ctx);
    const month = monthKeyParis(now);
    const day = dayKeyParis(now);
    const usage = await monthUsage(ctx, month);
    const remaining = settings?.creditsRemaining;
    const since = dayKeyParis(now - 4 * DAY);
    const recent = await ctx.db.query("radarUsage").withIndex("by_day_poste", (q) => q.gte("day", since)).collect();
    const recentUsage = recent.map(jobUsage);
    const jobs = tikhubJobs();
    return {
      budget: normalizeBudget(settings),
      cursor: settings?.discoveryCursor ?? 0,
      usage: usage.map(jobUsage),
      day,
      month,
      // Le rythme de ScrapeCreators : ce qu'il sert sous le réglage en cours (radarSignalsMath.scPerDay, 20/11/2026).
      balance: remaining !== undefined ? { remaining, seenAt: settings?.creditsSeenAt ?? 0, now, perDay: scPerDay(recentUsage, day, posteProviders(jobs)) } : null,
      creditAlerted: {
        ...(settings?.lowCreditsAlertDay ? { low: settings.lowCreditsAlertDay } : {}),
        ...(settings?.economieAlertDay ? { economie: settings.economieAlertDay } : {}),
        ...(settings?.survieAlertDay ? { survie: settings.survieAlertDay } : {}),
        ...(settings?.reserveAlertDay ? { reserve: settings.reserveAlertDay } : {}),
      },
      recentUsage,
      th: thStored(settings, recentUsage, day, posteProviders(jobs)),
      thPrices: pricesOf(settings),
      thPricesAt: settings?.thPricesAt ?? null,
      fallbacksToday: fallbacksUsed(settings, recentUsage, day),
    };
  },
});

/**
 * Unités déjà dépensées aujourd'hui par un poste : crédits ScrapeCreators et appels TikHub (radarSignalsMath.usageUnits).
 * Sans TikHub, ce sont les crédits, comme avant le 20/11/2026.
 */
export const todayCredits = (st: JobState, poste: string) =>
  st.usage.filter((u) => u.day === st.day && u.poste === poste).reduce((s, u) => s + usageUnits(u), 0);

/**
 * Les relevés de courbe dus à `now`. `since` : dus depuis cet instant seulement (la voie gratuite, cf curveInLane :
 * ]now − CURVE_LANE_WAIT_MS, now]). `net` : le filet (runCurve) — jusqu'à radarSignalsMath.curveNetCutoff, qui lit le
 * verrou et la dernière fin de passage de la voie dans les réglages : jamais ce qu'un passage tient, tout si elle est
 * arrêtée.
 */
export const dueCurve = internalQuery({
  args: { now: v.number(), limit: v.number(), since: v.optional(v.number()), net: v.optional(v.boolean()) },
  handler: async (ctx, { now, limit, since, net }): Promise<DueCheck[]> => {
    if (limit <= 0) return [];
    let upTo = now;
    if (net) {
      const s = await readSettings(ctx);
      upTo = curveNetCutoff(now, { ...(s?.accountsLeaseUntil !== undefined ? { leaseUntil: s.accountsLeaseUntil } : {}), ...(s?.lastFreeAt !== undefined ? { lastFreeAt: s.lastFreeAt } : {}) });
    }
    const rows = await ctx.db
      .query("radarSignals")
      .withIndex("by_next_check", (q) => q.gt("nextCheckAt", Math.max(0, since ?? 0)).lte("nextCheckAt", upTo))
      .take(limit);
    return rows.map((r) => ({ id: r._id, url: r.url, videoId: r.videoId, handle: r.authorHandle }));
  },
});

// ─── Écritures des tâches ────────────────────────────────────────────────────

/**
 * Range le résultat d'une recherche. Une vidéo déjà connue est mise à jour même
 * si elle a baissé sous les seuils ; une vidéo neuve n'entre que si elle les
 * passe. Les jeunes et rapides entrent dans la courbe (limite d'admissions du
 * jour). Une vidéo qui cite une app suivie y est rattachée, et son auteur entre
 * dans le réseau de l'app.
 */
export const upsertDiscovered = internalMutation({
  // `fansUnknown` : les vidéos (identifiants) dont les abonnés de l'auteur ne sont pas mesurés (recherche TikHub).
  // `apps` : les motifs des apps actives, lus une fois par le passage (radarNetworks.appRules) ; absents, relus ici.
  args: { videos: v.array(signalInput), foundBy: v.string(), now: v.number(), fansUnknown: v.optional(v.array(v.string())), apps: v.optional(v.array(appLiteValidator)) },
  handler: (ctx, args): Promise<{ inserted: number; updated: number; admitted: number; attached: number }> => upsertDiscoveredCore(ctx, args),
});

/** e2e : range des vidéos comme les rangerait une recherche de découverte (`foundBy` : « ce site·fr »…). */
export const e2eUpsertDiscovered = e2eMutation({
  args: { videos: v.array(signalInput), foundBy: v.string() },
  handler: (ctx, { videos, foundBy }) => upsertDiscoveredCore(ctx, { videos, foundBy, now: Date.now() }),
});

/** e2e : les apps repérées dont la clé contient ce marqueur (genre, auteurs). */
export const e2eCandidates = e2eMutation({
  args: { marker: v.string() },
  handler: async (ctx, { marker }) =>
    (await ctx.db.query("radarAppCandidates").collect()).filter((c) => c.key.includes(marker)).map((c) => ({ key: c.key, kind: c.kind, authorCount: c.authorCount })),
});

async function upsertDiscoveredCore(
  ctx: MutationCtx,
  { videos, foundBy, now, fansUnknown, apps: passed }: { videos: Infer<typeof signalInput>[]; foundBy: string; now: number; fansUnknown?: string[]; apps?: AppLite[] },
): Promise<{ inserted: number; updated: number; admitted: number; attached: number }> {
  {
    const settings = await ensureSettings(ctx);
    const budget = normalizeBudget(settings);
    // Les motifs des apps actives, lus une fois par le passage de découverte et passés à chaque recherche (comme pour
    // les relevés de comptes, cf radarNetworks.appRules). Corrigé le 20/11/2026 : chaque recherche relisait toutes les
    // apps actives (2 142 apps, 1,80 Mo) ; une app mise en pause ou créée pendant le passage est vue au suivant.
    const apps: readonly AppLite[] = passed?.filter((a) => a.status === "active") ?? (await activeApps(ctx)).map(appLite);
    const day = dayKeyParis(now);
    let admittedToday = settings.curveDay === day ? settings.curveAdmitted : 0;
    let inserted = 0;
    let updated = 0;
    let admitted = 0;
    let attached = 0;
    const counter: TrackedCounter = {};
    const grown = new Set<Id<"radarApps">>();
    const unknown = new Set(fansUnknown ?? []);
    for (const raw of videos) {
      let s = raw;
      const app = findApp(s.caption, s.authorHandle, apps);
      if (app && (await attachAccount(ctx, app, s.authorHandle, s.authorFans, "caption", now, counter, undefined, true)) === "added") {
        attached++;
        grown.add(app._id);
      }
      await noteCandidates(ctx, s, now, apps, app?._id, isWebFind(foundBy));
      const existing = await ctx.db
        .query("radarSignals")
        .withIndex("by_video", (q) => q.eq("platform", "tiktok").eq("videoId", s.videoId))
        .first();
      // Abonnés non mesurés (recherche TikHub) : une vidéo connue est jugée sur ses abonnés connus ; une neuve n'entre
      // ni dans les signaux, ni dans la courbe (writeSignal la saute).
      const fu = unknown.has(s.videoId);
      if (fu && existing) s = { ...s, authorFans: existing.authorFans };
      // La courbe ne suit que ce qui cite une app suivie, hors « texte sur plan » :
      // du 06 au 09/11/2026, 58 des 62 vidéos suivies étaient hors niche, et
      // aucune décision ne lisait leur courbe.
      const admit =
        (!existing || existing.curveStartedAt === undefined) &&
        (!fu || existing !== null) &&
        app !== undefined &&
        !isTextOnShot(s) &&
        curveCandidate(s, now) &&
        curveAdmissionsLeft(budget, admittedToday, CURVE_FREE) > 0;
      const next = admit ? nextCheckpointAt(s.publishedAt, now) : undefined;
      const curve: { nextCheckAt?: number; curveStartedAt?: number } =
        admit && next !== undefined ? { nextCheckAt: next, curveStartedAt: now } : {};
      const r = await writeSignal(ctx, s, now, {
        insert: keepSignal(s) && s.publishedAt >= now - RETENTION_DAYS * DAY,
        foundBy,
        ...(app ? { app: appRef(app) } : {}),
        curve,
        ...(fu ? { fansUnknown: true } : {}),
      });
      if (r === "skipped") continue;
      if (r === "inserted") inserted++;
      else updated++;
      if (curve.curveStartedAt) {
        admittedToday++;
        admitted++;
      }
    }
    if (admitted > 0 || settings.curveDay !== day) {
      await ctx.db.patch(settings._id, { curveDay: day, curveAdmitted: admittedToday });
    }
    // Le résumé du réseau des apps qui ont gagné un compte suit tout de suite (sinon à la tâche de l'heure).
    for (const id of grown) await refreshAppNet(ctx, id, now);
    return { inserted, updated, admitted, attached };
  }
}

/** Ce qu'un relevé de courbe range (radarSignalsMath.CurveCounts) : payant ou page publique, la même forme. */
const curveCounts = v.object({
  authorFans: v.number(),
  views: v.number(),
  likes: v.number(),
  comments: v.number(),
  shares: v.number(),
  saves: v.number(),
});

/** Range un relevé de courbe ; `video: null` = vidéo disparue (privée, supprimée) → courbe finie. */
export const applyCurve = internalMutation({
  // `fansUnknown` : le relevé ne mesure pas les abonnés (détail d'une vidéo chez TikHub : toujours 0, 20/11/2026) ; les
  // abonnés connus restent, et le ratio se calcule dessus.
  args: { id: v.id("radarSignals"), video: v.union(curveCounts, v.null()), now: v.number(), fansUnknown: v.optional(v.boolean()) },
  handler: async (ctx, { id, video, now, fansUnknown }): Promise<void> => {
    const s = await ctx.db.get(id);
    if (!s) return;
    if (video === null) {
      await ctx.db.patch(id, { nextCheckAt: undefined });
      return;
    }
    const views = Math.max(s.views, video.views);
    const fans = fansUnknown ? s.authorFans : video.authorFans;
    await ctx.db.patch(id, {
      authorFans: fans,
      views,
      likes: video.likes,
      comments: video.comments,
      shares: video.shares,
      saves: video.saves,
      ratio: ratioOf(views, fans),
      snapshots: addSnapshot(s.snapshots, now, video.views, true),
      nextCheckAt: nextCheckpointAt(s.publishedAt, now),
      lastSeenAt: now,
    });
  },
});

const LAST_RUN_FIELD: Record<string, "lastDiscoveryAt" | "lastCurveAt" | "lastAccountsAt" | "lastNetworkAt" | "lastInstaAt" | "lastTranscriptAt" | "lastAdsAt"> = {
  search: "lastDiscoveryAt",
  curve: "lastCurveAt",
  tiktok: "lastAccountsAt",
  network: "lastNetworkAt",
  insta: "lastInstaAt",
  transcript: "lastTranscriptAt",
  ads: "lastAdsAt",
};

/** Ajoute la consommation d'un passage à la ligne (jour, poste) et l'état des tâches. */
export const recordRun = internalMutation({
  args: {
    poste: v.string(),
    credits: v.number(),
    calls: v.number(),
    errors: v.number(),
    now: v.number(),
    creditsRemaining: v.optional(v.number()),
    // Quand ce solde a été lu (la réponse de l'API) ; sinon `now`. Un passage plus ancien n'écrase pas un solde plus frais.
    creditsSeenAt: v.optional(v.number()),
    lastError: v.optional(v.string()),
    cursor: v.optional(v.number()),
    // Dépense en dollars (l'analyse IA), en plus des crédits.
    usd: v.optional(v.number()),
    // Unités de ce passage par motif (déjà comptées dans `credits` ou `thCalls`).
    reasons: v.optional(v.record(v.string(), v.number())),
    // La dépense TikHub de ce passage (cf radarUsage) : absente sans appel TikHub.
    thCalls: v.optional(v.number()),
    thUsd: v.optional(v.number()),
    thUnknown: v.optional(v.number()),
    thFallbacks: v.optional(v.number()),
    // Le solde TikHub lu pendant le passage (gratuit), l'heure de sa lecture, et ce que le passage a dépensé chez
    // TikHub APRÈS cette lecture (la part de ce lot que le solde lu ne compte pas encore).
    thBalanceUsd: v.optional(v.number()),
    thFreeUsd: v.optional(v.number()),
    thSeenAt: v.optional(v.number()),
    thSpentAfterUsd: v.optional(v.number()),
    // Un refus « solde insuffisant » (HTTP 402) : sa route. La dernière erreur TikHub du passage.
    thDryRoute: v.optional(v.string()),
    thLastError: v.optional(v.string()),
    // Les tarifs des routes, relus.
    thPrices: v.optional(v.array(v.object({ route: v.string(), usd: v.number(), free: v.boolean() }))),
    // Appels payants évités par une page publique, par brique (radarSignalsMath.SavedKey) : pas comptés dans `credits`
    // ni dans `thCalls`. Un appel évité l'est chez le fournisseur qui l'aurait servi, quel qu'il soit.
    saved: v.optional(v.record(v.string(), v.number())),
    // Une mesure côte à côte (page publique contre payant), par verdict : courbe en VIDÉOS (radarFreeMath.CurveMeasure),
    // trou en comptes (radarFreeMath.GapMeasure).
    measured: v.optional(v.record(v.string(), v.number())),
  },
  handler: async (ctx, a): Promise<void> => {
    const settings = await ensureSettings(ctx);
    const day = dayKeyParis(a.now);
    const thCalls = a.thCalls ?? 0;
    const thUnknown = a.thUnknown ?? 0;
    const spared = Object.values({ ...a.saved, ...a.measured }).some((c) => c > 0);
    if (a.calls > 0 || a.credits > 0 || thCalls > 0 || thUnknown > 0 || spared) {
      const row = await ctx.db
        .query("radarUsage")
        .withIndex("by_day_poste", (q) => q.eq("day", day).eq("poste", a.poste))
        .first();
      const usd = a.usd !== undefined ? { usd: (row?.usd ?? 0) + a.usd } : {};
      const reasons = addCounts(row?.reasons, a.reasons);
      const why = Object.keys(reasons).length ? { reasons } : {};
      // Les champs TikHub ne s'écrivent que s'il y en a : sans TikHub, la ligne reste celle d'avant le 20/11/2026.
      const th = {
        ...(a.thCalls !== undefined ? { thCalls: (row?.thCalls ?? 0) + a.thCalls } : {}),
        ...(a.thUsd !== undefined ? { thUsd: (row?.thUsd ?? 0) + a.thUsd } : {}),
        ...(a.thUnknown !== undefined ? { thUnknown: (row?.thUnknown ?? 0) + a.thUnknown } : {}),
        ...(a.thFallbacks !== undefined ? { thFallbacks: (row?.thFallbacks ?? 0) + a.thFallbacks } : {}),
      };
      const saved = addCounts(row?.saved, a.saved);
      const avoided = Object.keys(saved).length ? { saved } : {};
      const measured = addCounts(row?.measured, a.measured);
      const side = Object.keys(measured).length ? { measured } : {};
      if (row) {
        await ctx.db.patch(row._id, { credits: row.credits + a.credits, calls: row.calls + a.calls, errors: row.errors + a.errors, ...usd, ...why, ...th, ...avoided, ...side });
      } else {
        await ctx.db.insert("radarUsage", { day, month: monthKeyParis(a.now), poste: a.poste, credits: a.credits, calls: a.calls, errors: a.errors, ...usd, ...why, ...th, ...avoided, ...side });
      }
    }
    const field = LAST_RUN_FIELD[a.poste];
    const seenAt = a.creditsSeenAt ?? a.now;
    const fresher = a.creditsRemaining !== undefined && seenAt >= (settings.creditsSeenAt ?? 0);
    await ctx.db.patch(settings._id, {
      ...(field ? { [field]: a.now } : {}),
      ...(fresher ? { creditsRemaining: a.creditsRemaining, creditsSeenAt: seenAt } : {}),
      ...(a.cursor !== undefined ? { discoveryCursor: a.cursor } : {}),
      // Une erreur du passage s'affiche ; un passage propre l'efface.
      ...(a.lastError !== undefined || a.calls > 0 ? { lastError: a.lastError } : {}),
      ...thSettingsPatch(settings, a, Date.now()),
    });
  },
});

/**
 * Ce que le passage change au solde TikHub rangé. La dépense du lot s'ajoute à ce qui a été dépensé depuis la dernière
 * lecture ; un solde lu plus frais que le rangé le remplace, et la dépense « depuis » garde ce qui a été écrit après
 * cette lecture, plus ce que le passage a dépensé après l'avoir lue (radarSignalsMath.nextSpentLots). `writtenAt` :
 * l'heure de cette écriture. Rien sans champ TikHub.
 */
function thSettingsPatch(
  settings: Doc<"radarSettings">,
  a: { now: number; thUsd?: number; thUnknown?: number; thBalanceUsd?: number; thFreeUsd?: number; thSeenAt?: number; thSpentAfterUsd?: number; thDryRoute?: string; thLastError?: string; thCalls?: number; thPrices?: { route: string; usd: number; free: boolean }[] },
  writtenAt: number,
): Partial<Doc<"radarSettings">> {
  const out: Partial<Doc<"radarSettings">> = {};
  const lot = (a.thUsd ?? 0) + (a.thUnknown ?? 0) * TH_PRICE_USD;
  const fresher = a.thBalanceUsd !== undefined && a.thSeenAt !== undefined && a.thSeenAt >= (settings.thSeenAt ?? 0);
  if (lot > 0 || fresher) {
    // Écrit avant ce suivi (sans lots) : la dépense rangée compte comme un lot écrit maintenant — gardée une fois de
    // trop plutôt qu'oubliée.
    const prev = settings.thSpentLots ?? (settings.thSpentSinceUsd ? [{ at: writtenAt, usd: settings.thSpentSinceUsd }] : []);
    const lots = nextSpentLots(prev, writtenAt, lot, fresher ? { at: a.thSeenAt as number, afterUsd: a.thSpentAfterUsd ?? 0 } : undefined);
    out.thSpentLots = lots;
    out.thSpentSinceUsd = spentOf(lots);
  }
  if (fresher) {
    out.thBalanceUsd = a.thBalanceUsd;
    out.thFreeUsd = a.thFreeUsd ?? 0;
    out.thSeenAt = a.thSeenAt;
  }
  if (a.thDryRoute !== undefined) {
    out.thDryAt = a.now;
    out.thDryRoute = a.thDryRoute;
  }
  if (a.thLastError !== undefined) out.thLastError = a.thLastError;
  if (a.thPrices !== undefined) {
    out.thPrices = a.thPrices;
    out.thPricesAt = a.now;
  }
  return out;
}

/** Efface les signaux plus vieux que la rétention, et leurs statuts (par lots). */
export const purgeOldSignals = internalMutation({
  args: {},
  handler: async (ctx) => {
    const before = Date.now() - RETENTION_DAYS * DAY;
    const old = await ctx.db.query("radarSignals").withIndex("by_published", (q) => q.lt("publishedAt", before)).take(200);
    for (const s of old) {
      await ctx.db.delete(s._id);
    }
    if (old.length === 200) await ctx.scheduler.runAfter(0, internal.radar.radarSignals.purgeOldSignals, {});
    return old.length;
  },
});

// ─── Tâches ──────────────────────────────────────────────────────────────────

/**
 * Découverte : la part du passage de la rotation, dans la limite du budget. Chez TikHub si `RADAR_TIKHUB` le dit
 * (`search`, hors de `all` : non prouvé hors FR au 20/11/2026) ; une vidéo dont TikHub ne mesure pas les abonnés (0)
 * n'entre pas sur un ratio inventé (`fansUnknown`).
 */
export const runDiscovery = internalAction({
  args: {},
  handler: async (ctx): Promise<RunResult> => {
    const now = Date.now();
    if (!scKeyPresent()) {
      console.warn("[radar] découverte sautée : SCRAPECREATORS_API_KEY absente");
      return { skipped: "no-key" };
    }
    const st: JobState = await ctx.runQuery(internal.radar.radarSignals.jobState, { now });
    const jobs = tikhubJobs();
    const book = new PassBook();
    const router = makeRouter({ poste: "search", jobs, st, book, start: now, claimFallback: fallbackClaimer(ctx) });
    const b = await router.open();
    const provider = posteProvider(jobs, "search");
    const gate = passGate(allowanceParts(st.budget, b, "search", todayCredits(st, "search"), DISCOVERY_RUNS_PER_DAY));
    const n = passLimit(gate, provider, router);
    const { queries } = nextQueries(st.cursor, n, DISCOVERY_ROTATION);
    let calls = 0;
    let errors = 0;
    let creditsRemaining: number | undefined;
    let lastError: string | undefined;
    let done = 0;
    // Les motifs des apps actives (`undefined` : pas encore lus ; `null` : relus par chaque recherche).
    let rules: AppLite[] | null | undefined;
    for (const dq of queries) {
      if (router.expired() || (router.on && !canCall(gate, provider, router))) break;
      const r = await router.route(
        provider,
        (o) => thSearchKeyword(dq.query, dq.region, dq.lang, o),
        async () => {
          const x = await scSearchKeyword(dq.query, dq.region, dq.lang);
          return x.ok ? { ...x, value: { videos: x.value, fansUnknown: [] as string[] } } : x;
        },
        { route: TH_ROUTES.search, firstPage: true, thBudget: () => gate.take("tikhub"), scBudget: () => gate.take("sc") },
      );
      gate.spend(r.spend);
      book.add(r.spend);
      calls++;
      if (!r.ok) {
        errors++;
        lastError = r.error;
        console.error(`[radar] recherche « ${dq.query} » (${dq.region}) : ${r.error}`);
        // TikHub n'a pas été appelé (budget, échéance, en panne pour le passage) et le repli est refusé : la recherche
        // n'est pas faite, la suite non plus, le curseur reste avant elle. Une recherche que TikHub a lui-même refusée
        // (`thFailed`) ou que TikTok a refusée (facturée) est passée, comme un échec ScrapeCreators avant la bascule —
        // y compris celle qui fait tomber TikHub en panne. Corrigé le 20/11/2026 : tout échec passager arrêtait le
        // passage sans avancer le curseur ; puis une panne déclarée ramenait le curseur avant la suite d'échecs qui
        // l'avait déclarée — trois recherches que TikHub refuse toujours repassaient en tête à chaque passage, la
        // découverte bloquée dessus.
        if (r.transient && !r.thFailed) break;
        done++;
        // Le refus qui fait tomber TikHub en panne, repli fermé : la recherche est passée, le passage s'arrête après elle.
        if (r.noCredits || (r.transient && router.down())) break;
        continue;
      }
      done++;
      if (r.creditsRemaining !== undefined) creditsRemaining = r.creditsRemaining;
      const unknown = r.value.fansUnknown;
      // Les motifs des apps actives : lus à la première recherche servie, puis passés à chacune (cf upsertDiscovered).
      // Une lecture refusée, ou trop d'apps pour un argument : chaque recherche les relit, comme avant le 20/11/2026.
      if (rules === undefined) {
        const got: AppLite[] | null = await ctx.runQuery(internal.radar.radarNetworks.appRules, { active: true }).catch(() => null);
        rules = got && got.length <= APP_RULES_MAX ? got : null;
      }
      await ctx.runMutation(internal.radar.radarSignals.upsertDiscovered, {
        videos: r.value.videos,
        foundBy: foundByLabel(dq),
        now,
        ...(unknown.length ? { fansUnknown: unknown } : {}),
        ...(rules ? { apps: rules } : {}),
      });
    }
    await router.close();
    await ctx.runMutation(internal.radar.radarSignals.recordRun, {
      poste: "search",
      credits: book.credits,
      calls,
      errors,
      now,
      ...(creditsRemaining !== undefined ? { creditsRemaining } : {}),
      ...(lastError ? { lastError } : {}),
      // Le curseur n'avance que des recherches réellement passées.
      cursor: nextQueries(st.cursor, done, DISCOVERY_ROTATION).cursor,
      ...book.thArgs(),
    });
    return { calls: done, credits: book.units(), errors };
  },
});

/** La part payante d'un passage de courbe : celle du relevé de l'heure (le jour ÷ 24), dans la voie comme ici. */
const CURVE_RUNS_PER_DAY = 24;

/**
 * Courbe : les relevés dus (H+6, H+24, H+48), dans la limite du budget. Depuis le 20/11/2026, la voie gratuite les
 * prend à chaque passage (curveInLane) ; ici partent au payant, comme avant, ceux qu'elle n'a pas pris en
 * CURVE_LANE_WAIT_MS (passage tombé, plafond de pages, part payante du passage épuisée), et tout ce qui est dû quand
 * elle ne tourne plus (radarSignalsMath.curveNetCutoff) — motif « retard ». Chez TikHub si `RADAR_TIKHUB` le dit
 * (`curve`) : même adresse, mêmes vues ; ses abonnés (toujours 0) ne remplacent jamais les abonnés connus.
 */
export const runCurve = internalAction({
  args: {},
  handler: async (ctx): Promise<RunResult> => {
    const now = Date.now();
    if (!scKeyPresent()) return { skipped: "no-key" };
    const st: JobState = await ctx.runQuery(internal.radar.radarSignals.jobState, { now });
    const jobs = tikhubJobs();
    const book = new PassBook();
    const router = makeRouter({ poste: "curve", jobs, st, book, start: now, claimFallback: fallbackClaimer(ctx) });
    const b = await router.open();
    const provider = posteProvider(jobs, "curve");
    const gate = passGate(allowanceParts(st.budget, b, "curve", todayCredits(st, "curve"), CURVE_RUNS_PER_DAY));
    const n = passLimit(gate, provider, router);
    const due: DueCheck[] = await ctx.runQuery(internal.radar.radarSignals.dueCurve, { now, limit: n, net: true });
    let errors = 0;
    let creditsRemaining: number | undefined;
    let lastError: string | undefined;
    // Les vidéos que TikHub n'a pas pu relever (il a répondu en échec : 5xx, 4xx, délai), sans repli : conclues en fin
    // de passage.
    const transient: DueCheck[] = [];
    for (const d of due) {
      if (router.expired() || (router.on && !canCall(gate, provider, router))) break;
      const r = await router.route(provider, (o) => thVideoInfo(d.url, o), () => scVideoInfo(d.url), {
        route: TH_ROUTES.video,
        firstPage: true,
        thBudget: () => gate.take("tikhub"),
        scBudget: () => gate.take("sc"),
      });
      gate.spend(r.spend);
      book.add(r.spend);
      if (!r.ok) {
        errors++;
        lastError = r.error;
        if (r.noCredits) break;
        if (r.transient) {
          // TikHub n'a pas été appelé (en panne pour le passage, part épuisée, échéance) et le repli a été refusé (quota
          // du jour pris par un autre passage, moins de 90 s avant l'échéance…) : rien n'est conclu sur la vidéo, qui
          // reste due, et la suite non plus (le repli serait refusé de même). Corrigé le 20/11/2026 : elle sortait de
          // la courbe en fin de passage, comme un échec isolé.
          if (!r.thFailed) break;
          transient.push(d);
          continue;
        }
        // Une vidéo introuvable sort de la courbe ; une panne réseau aussi : au
        // pire un relevé manqué, jamais une boucle qui repaie la même vidéo.
        await ctx.runMutation(internal.radar.radarSignals.applyCurve, { id: d.id, video: null, now });
        continue;
      }
      if (r.creditsRemaining !== undefined) creditsRemaining = r.creditsRemaining;
      await ctx.runMutation(internal.radar.radarSignals.applyCurve, { id: d.id, video: r.value ? curveCountsOf(r.value) : null, now, ...(r.served === "tikhub" && r.value ? { fansUnknown: true } : {}) });
    }
    // Échecs passagers : comme un échec ScrapeCreators, la vidéo sort de la courbe — y compris quand ces échecs ont fait
    // tomber TikHub en panne. LE COUPE-CIRCUIT NE GARDE DUES QUE LES VIDÉOS QU'IL A EMPÊCHÉ DE PARTIR (corrigé le
    // 20/11/2026) : celles qui le faisaient sauter restaient dues, leur nextCheckAt inchangé, et revenaient en tête de la
    // file (dueCurve, par nextCheckAt) à chaque passage — trois vidéos que TikHub refuse toujours, et la courbe ne passait
    // plus jamais chez TikHub, le quota de replis du jour pris par elle. Une panne réelle coûte au plus BREAKER_FAILS
    // vidéos par passage (main : chaque vidéo en échec chez ScrapeCreators sortait de la courbe).
    for (const d of transient) await ctx.runMutation(internal.radar.radarSignals.applyCurve, { id: d.id, video: null, now });
    await router.close();
    await ctx.runMutation(internal.radar.radarSignals.recordRun, {
      poste: "curve",
      credits: book.credits,
      calls: due.length,
      errors,
      now,
      // Tout ce que le filet paie est en retard sur la voie (en unités : crédits ScrapeCreators et appels TikHub).
      ...(book.units() > 0 ? { reasons: { retard: book.units() } satisfies Partial<Record<CurveReason, number>> } : {}),
      ...(creditsRemaining !== undefined ? { creditsRemaining } : {}),
      ...(lastError ? { lastError } : {}),
      ...book.thArgs(),
    });
    return { calls: due.length, credits: book.units(), errors };
  },
});

/**
 * LA COURBE DANS LA VOIE GRATUITE (20/11/2026). Le passage des relevés de comptes (radarNetworks.accountReadsPass)
 * l'appelle AVANT ses comptes, avec SA page (une à la fois, pause storePauseMs, second essai d'une page refusée) et
 * dans SON temps : les pages de la courbe ne forment jamais une seconde file à côté de la voie (la règle et ses
 * chiffres : radarSignalsMath.CURVE_PAGES_PER_PASS). Lit la page des vidéos dues depuis moins de CURVE_LANE_WAIT_MS,
 * puis rend la suite (`rest`) — relevés payants, écritures, dépense — que le passage mène PENDANT la voie et attend à
 * sa fin : le fournisseur ne passe pas par TikTok, il ne retarde ni la file ni les relevés payants des comptes. Rend
 * aussi la série de pages refusées à la fin (`streak`, `stopped`) : la voie la reprend (radarFreeMath.laneAfterCurve).
 * En mesure tant que radarFreeMath.CURVE_FREE est faux (pourquoi : là) : la page est lue, le payant part quand même et
 * l'accord des deux est compté, en vidéos (radarUsage.measured). `free` : pour les tests de la bascule.
 * LE PAYANT CHEZ LE FOURNISSEUR RÉGLÉ (fusion avec la bascule TikHub, 20/11/2026) : la page gratuite d'abord, puis
 * l'aiguilleur du poste « curve » (radarProviders.makeRouter), comme le filet (runCurve). Sans RADAR_TIKHUB=curve (ou
 * sans clé), ScrapeCreators à l'identique de main. Avec : la part du passage chez TikHub (son solde et son palier, pas la
 * réserve de ScrapeCreators), la porte de repli, le coupe-circuit ; ses abonnés à 0 ne remplacent pas les connus et ne
 * comptent pas dans la mesure (radarFreeMath.curveMatch) ; une vidéo que TikHub a refusée sort de la courbe en fin de
 * passage, que ses refus l'aient fait tomber en panne ou non (comme runCurve) ; TikHub non appelé, repli refusé : rien
 * n'est conclu, la vidéo et les suivantes restent dues. La dépense et les motifs sont en unités ;
 * `credits` reste en crédits ScrapeCreators, la dépense TikHub dans ses champs (radarProviders.PassBook.thArgs).
 */
export async function curveInLane(
  ctx: ActionCtx,
  page: (url: string) => Promise<FreePage>,
  st: JobState,
  b: BudgetState,
  now: number,
  alive: () => boolean,
  free: boolean = CURVE_FREE,
  jobs: ReadonlySet<ThJob> = tikhubJobs(),
): Promise<{ rest: () => Promise<void>; streak: number; stopped: string | null }> {
  const nothing = { rest: async (): Promise<void> => undefined, streak: 0, stopped: null };
  // Le budget du passage (`b`, lu par les relevés avec le solde TikHub du passage) : pas de lecture de plus ici.
  const book = new PassBook();
  const router = makeRouter({ poste: "curve", jobs, st, book, start: now, claimFallback: fallbackClaimer(ctx) });
  const provider = posteProvider(jobs, "curve");
  const gate = passGate(allowanceParts(st.budget, b, "curve", todayCredits(st, "curve"), CURVE_RUNS_PER_DAY));
  // La part payante du passage, en unités, chez le fournisseur qui sert la courbe (sans bascule : allowance, au bit près).
  const paidLeft = passLimit(gate, provider, router);
  const take = curveLaneTake(st.budget, free, paidLeft);
  if (take <= 0) return nothing;
  const due: DueCheck[] = await ctx.runQuery(internal.radar.radarSignals.dueCurve, { now, since: now - CURVE_LANE_WAIT_MS, limit: take });
  if (due.length === 0) return nothing;
  const read = await readCurvePages(due, page, alive, take);
  if (read.stopped) console.warn(`[radar] courbe dans la voie : ${read.stopped}`);
  const rest = async (): Promise<void> => {
    const tally = curveTally<DueCheck>();
    let creditsRemaining: number | undefined;
    let lastError: string | undefined;
    // Les vidéos dont TikHub a rendu un échec isolé (5xx, 4xx, délai), sans repli : jugées en fin de passage.
    const isolated = new Set<DueCheck>();
    const later: DueCheck[] = [];
    try {
      await settleCurve(
        read.reads,
        {
          paid: async (d) => {
            const r = await router.route(provider, (o) => thVideoInfo(d.url, o), () => scVideoInfo(d.url), {
              route: TH_ROUTES.video,
              firstPage: true,
              thBudget: () => gate.take("tikhub"),
              scBudget: () => gate.take("sc"),
            });
            gate.spend(r.spend);
            book.add(r.spend);
            const units = spendUnits(r.spend);
            if (r.creditsRemaining !== undefined) creditsRemaining = r.creditsRemaining;
            if (!r.ok) {
              lastError = r.error;
              // TikHub non appelé (en panne pour le passage, part épuisée, échéance), repli refusé : rien n'est conclu,
              // la vidéo et les suivantes restent dues — comme des crédits épuisés.
              if (r.transient && !r.thFailed) return { ok: false, credits: units, noCredits: true, refused: false };
              if (r.transient) isolated.add(d);
              // Refusée par le fournisseur : la vidéo est partie pour lui aussi (ScrapeCreators, cf scRefused). Chez
              // TikHub, un refus de TikTok (`upstream`) n'est pas prouvé « partie » au banc : une panne pour la mesure.
              return { ok: false, credits: units, noCredits: r.noCredits, refused: r.served === "sc" && scRefused(r.error) };
            }
            const counts = r.value ? curveCountsOf(r.value) : null;
            return { ok: true, credits: units, counts, ...(r.served === "tikhub" && counts ? { fansUnknown: true as const } : {}) };
          },
          apply: async (d, counts, fansUnknown) => {
            // Un échec isolé de TikHub n'est conclu qu'en fin de passage (cf `later`).
            if (counts === null && isolated.has(d)) {
              later.push(d);
              return;
            }
            await ctx.runMutation(internal.radar.radarSignals.applyCurve, { id: d.id, video: counts, now: Date.now(), ...(fansUnknown ? { fansUnknown } : {}) });
          },
        },
        { free, paidLeft, ...(router.on ? { more: () => !router.expired() && canCall(gate, provider, router) } : {}) },
        tally,
      );
      // Échecs de TikHub : la vidéo sort de la courbe, comme un échec ScrapeCreators — y compris quand ils ont fait tomber
      // TikHub en panne (cf runCurve : le coupe-circuit ne garde dues que les vidéos qu'il a empêché de partir).
      for (const d of later) await ctx.runMutation(internal.radar.radarSignals.applyCurve, { id: d.id, video: null, now: Date.now() });
    } catch (e) {
      lastError = e instanceof Error ? e.message : String(e);
      console.error(`[radar] courbe dans la voie : ${lastError}`);
    } finally {
      const m = tally.measured;
      if (m.egal || m.proche || m.ecart) console.log(`[radar] courbe, mesure de la page : ${m.egal ?? 0} égales, ${m.proche ?? 0} proches, ${m.ecart ?? 0} écarts`);
      const nf = (k: CurveMatch) => m[noFansMatch(k)] ?? 0;
      if (nf("egal") || nf("proche") || nf("ecart"))
        console.log(`[radar] courbe, mesure de la page sans les abonnés (payant TikHub) : ${nf("egal")} égales, ${nf("proche")} proches, ${nf("ecart")} écarts`);
      for (const g of tally.gaps) console.warn(`[radar] courbe, écart page/payant sur ${g.due.videoId} : ${JSON.stringify({ page: g.page, payant: g.paid })}`);
      // Les appels évités : les relevés gratuits qui tiennent dans la part payante du passage (radarFreeMath.curveSaved).
      const spared = curveSaved(tally, paidLeft);
      const calls = tally.free + tally.paid;
      // Même si une écriture tombe, ce qui est payé est compté ; un passage qui n'a rien relevé n'écrit rien.
      if (calls > 0 || lastError) {
        await ctx
          .runMutation(internal.radar.radarSignals.recordRun, {
            poste: "curve",
            credits: book.credits,
            calls,
            errors: tally.errors,
            now,
            ...(Object.keys(tally.reasons).length ? { reasons: tally.reasons } : {}),
            ...(spared > 0 ? { saved: { curve: spared } } : {}),
            ...(Object.keys(m).length ? { measured: m } : {}),
            ...(creditsRemaining !== undefined ? { creditsRemaining } : {}),
            ...(lastError ? { lastError } : {}),
            ...book.thArgs(),
          })
          .catch((e: unknown) => console.error(`[radar] courbe dans la voie, dépense : ${e instanceof Error ? e.message : String(e)}`));
      }
    }
  };
  return { rest, streak: read.streak, stopped: read.stopped };
}

// ─── Écran et outil MCP ──────────────────────────────────────────────────────

/** Le budget du mois : réglages, dépense par poste, projection, état des tâches. */
export async function getRadarBudgetCore(ctx: ProjectQueryCtx) {
  const now = Date.now();
  const settings = await readSettings(ctx);
  const budget: BudgetSettings = normalizeBudget(settings);
  const month = monthKeyParis(now);
  const usage = await monthUsage(ctx, month);
  const remaining = settings?.creditsRemaining;
  // Le rythme des derniers jours complets, mois précédent compris (comme jobState) : il dit le palier du solde.
  const recent = await ctx.db.query("radarUsage").withIndex("by_day_poste", (q) => q.gte("day", dayKeyParis(now - 4 * DAY))).collect();
  // Les deux fournisseurs ne jugent le budget que quand la bascule TikHub est posée (radarProviders.tikhubJobs).
  const jobs = tikhubJobs();
  const today = dayKeyParis(now);
  const perDay = scPerDay(recent.map(jobUsage), today, posteProviders(jobs));
  const providers = posteProviders(jobs);
  const th = jobs.size ? thStored(settings, recent.map(jobUsage), today, providers) : null;
  const scBalance = remaining !== undefined ? { remaining, seenAt: settings?.creditsSeenAt ?? 0, now, perDay } : null;
  const state = jobs.size ? budgetState(budget, usage, scBalance, { providers, th: th ? { ...th, now } : null }) : budgetState(budget, usage, scBalance);
  const thDays = new Map<string, { thCalls: number; thUsd: number; thUnknown: number }>();
  for (const u of usage) {
    if (u.thCalls === undefined && u.thUsd === undefined && u.thUnknown === undefined) continue;
    const d = thDays.get(u.day) ?? { thCalls: 0, thUsd: 0, thUnknown: 0 };
    d.thCalls += u.thCalls ?? 0;
    d.thUsd += u.thUsd ?? 0;
    d.thUnknown += u.thUnknown ?? 0;
    thDays.set(u.day, d);
  }
  return {
    month,
    budget,
    // Ce que /admin affiche (src/admin/Radar.js) : « Dépense de <mois> » = Σ days[].credits × pricePerCredit, « prévu » =
    // plannedUsd. Corrigé le 20/11/2026 (sans toucher à l'écran) : `days[].credits` comptait les crédits ScrapeCreators
    // seuls et `plannedUsd` était au prix ScrapeCreators ; sous RADAR_TIKHUB=tiktok, la dépense affichée ne comptait plus
    // les relevés payés chez TikHub (~81 % de celle du Radar) et le prévu restait ~1,88 fois trop haut pour les postes
    // basculés. Désormais :
    //  - `days[].credits` : la dépense du jour chez les deux fournisseurs, EN CRÉDITS SCRAPECREATORS ÉQUIVALENTS (les
    //    dollars TikHub, appels à facturation inconnue au prix plein, divisés par le prix du crédit) — ce que l'écran
    //    multiplie par `pricePerCredit`. Les crédits ScrapeCreators seuls sont dans `days[].scCredits`. L'analyse IA (en
    //    dollars) n'y est pas, comme avant : elle est dans `spentUsdAll` ;
    //  - `plannedUsd` : chaque poste au prix du fournisseur qui le sert (sans bascule : le prévu d'avant, au bit près).
    plannedUsd: POSTE_KEYS.reduce((sum, k) => sum + envelopeUsdAt(budget, k, providers[k] ?? "sc"), 0),
    pricePerCredit: SC_PRICE_PER_CREDIT,
    currency: SC_CURRENCY,
    state,
    // Pas encore affichés (pas d'écran sans maquette) : le fournisseur de chaque poste, le prix d'un appel chez chacun,
    // la dépense du mois en dollars, analyse IA comprise. `jobs.creditsRemaining` reste le solde ScrapeCreators.
    providers: Object.fromEntries(POSTE_KEYS.map((k) => [k, providers[k] ?? "sc"])),
    pricePerCall: { sc: SC_PRICE_PER_CREDIT, tikhub: TH_PRICE_USD },
    spentUsdAll: state.spentUsd,
    days: usage
      .reduce<{ day: string; scCredits: number }[]>((acc, u) => {
        const d = acc.find((x) => x.day === u.day);
        if (d) d.scCredits += u.credits;
        else acc.push({ day: u.day, scCredits: u.credits });
        return acc;
      }, [])
      .sort((a, b) => a.day.localeCompare(b.day))
      .map((d) => {
        const th = thDays.get(d.day);
        const thSpent = th ? th.thUsd + th.thUnknown * TH_PRICE_USD : 0;
        return { day: d.day, credits: d.scCredits + thSpent / SC_PRICE_PER_CREDIT, scCredits: d.scCredits, ...(th ?? {}) };
      }),
    jobs: {
      keyPresent: scKeyPresent(),
      lastDiscoveryAt: settings?.lastDiscoveryAt ?? null,
      lastCurveAt: settings?.lastCurveAt ?? null,
      lastAccountsAt: settings?.lastAccountsAt ?? null,
      lastNetworkAt: settings?.lastNetworkAt ?? null,
      lastError: settings?.lastError ?? null,
      creditsRemaining: settings?.creditsRemaining ?? null,
      creditsSeenAt: settings?.creditsSeenAt ?? null,
      // Sous ce solde, les postes payants s'arrêtent (radarSignalsMath.CREDIT_RESERVE).
      creditReserve: CREDIT_RESERVE,
      // Comptes que la voie gratuite n'a pas eu le temps de prendre au dernier passage, et qui l'attendent.
      freeWaiting: settings?.lastFreeWaiting ?? null,
      // TikHub (bascule du 20/11/2026) : clé, postes réglés, solde lu et estimé (moins ce qui a été dépensé depuis la
      // lecture), dernier refus « solde insuffisant », dernière erreur, appels repassés par ScrapeCreators aujourd'hui.
      tikhub: {
        keyPresent: thKeyPresent(),
        jobs: [...jobs],
        balanceUsd: settings?.thBalanceUsd ?? null,
        freeUsd: settings?.thFreeUsd ?? null,
        seenAt: settings?.thSeenAt ?? null,
        estimatedUsd: settings?.thBalanceUsd !== undefined ? settings.thBalanceUsd - (settings.thSpentSinceUsd ?? 0) : null,
        dryAt: settings?.thDryAt ?? null,
        dryRoute: settings?.thDryRoute ?? null,
        lastError: settings?.thLastError ?? null,
        fallbacksToday: fallbacksUsed(settings, recent, today),
        reserveUsd: TH_RESERVE_USD,
      },
    },
    // Les relevés de comptes payés aujourd'hui, par motif (radarFreeMath.PaidReason).
    readsToday: recent.find((u) => u.day === dayKeyParis(now) && u.poste === "tiktok")?.reasons ?? null,
  };
}

export const getRadarBudget = permissionQuery("radar.use")({
  args: {},
  handler: (ctx) => getRadarBudgetCore(ctx),
});

/**
 * Enregistre le budget. Gardé par les réglages du projet (dépenser de l'argent
 * n'est pas « utiliser le Radar ») ; le canal de l'alerte devient ce projet.
 */
export const saveRadarBudget = permissionMutation("project.settings")({
  args: {
    capUsd: v.number(),
    postes: v.array(v.object({ key: v.string(), qty: v.number(), on: v.boolean() })),
    cutOrder: v.array(v.string()),
    alert80: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Ce que l'écran envoie est déjà au format courant.
    const b = normalizeBudget({ ...args, budgetVersion: BUDGET_VERSION });
    const s = await ensureSettings(ctx);
    await ctx.db.patch(s._id, {
      capUsd: b.capUsd,
      postes: b.postes,
      cutOrder: b.cutOrder,
      alert80: b.alert80,
      budgetVersion: BUDGET_VERSION,
      updatedAt: Date.now(),
    });
    return b;
  },
});

// ─── E2E ─────────────────────────────────────────────────────────────────────

/**
 * E2E — sème des signaux (cache global : effacés par `e2eClearSignals`). Une
 * légende qui cite une app de départ y est rattachée ; `rivalProject` ajoute un
 * projet (celui de la spec) aux concurrents de cette app.
 */
export const e2eSeedSignals = e2eMutation({
  args: {
    rivalProject: v.optional(v.string()),
    signals: v.array(
      v.object({
        videoId: v.string(),
        handle: v.string(),
        fans: v.number(),
        caption: v.string(),
        lang: v.string(),
        publishedAt: v.number(),
        views: v.number(),
        snapshots: v.optional(v.array(v.object({ at: v.number(), views: v.number() }))),
        multiplier: v.optional(v.number()),
        hook: v.optional(v.string()),
        transcript: v.optional(v.string()),
        platform: v.optional(v.literal("instagram")),
        // L'app poussée, nommée directement (une app semée par e2eSeedNetwork) ;
        // sinon reconnue dans la légende parmi les apps de départ.
        app: v.optional(v.string()),
        // Partages (« se partage » au-delà de 2 % des vues) ; sinon vues ÷ 300.
        shares: v.optional(v.number()),
        // Durée : 12 secondes ou moins = « texte sur plan », hors d'Aujourd'hui.
        durationSec: v.optional(v.number()),
        // Les recherches qui l'ont trouvée (« app for couples·us ») ; sinon « e2e ».
        foundBy: v.optional(v.array(v.string())),
        // Devenue invisible sur TikTok, avec son motif (convex/radarAvailability).
        unavailable: v.optional(v.union(v.literal("private"), v.literal("region"), v.literal("removed"), v.literal("review"), v.literal("restricted"), v.literal("other"))),
        // Relevée chez un compte suivi (semé par e2eSeedNetwork, même pseudo) : le signal lui est lié, comme en vrai.
        tracked: v.optional(v.boolean()),
        // Sa miniature (en vrai : une adresse TikTok signée, qui expire).
        coverUrl: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, { signals, rivalProject }) => {
    const now = Date.now();
    const ids: Id<"radarSignals">[] = [];
    // Une app semée nommée par `app` : la vidéo lui est rattachée comme en vrai (appId),
    // donc soumise à la même vérification « la vidéo cite-t-elle l'app ? ».
    const semees = await ctx.db.query("radarApps").collect();
    for (const s of signals) {
      const seed = findApp(s.caption, s.handle, SEED_APPS);
      const semee = s.app ? semees.find((a) => a.name === s.app) : undefined;
      const app = s.app
        ? { ...(semee ? { appId: semee._id } : {}), appName: s.app, appRivalOf: semee ? semee.rivalOf : rivalProject ? [rivalProject] : [] }
        : seed
          ? { appName: seed.name, appRivalOf: [...seed.rivalOf, ...(rivalProject ? [rivalProject] : [])] }
          : {};
      const account = s.tracked
        ? await ctx.db.query("radarTracked").withIndex("by_handle", (q) => q.eq("platform", "tiktok").eq("handle", s.handle)).first()
        : null;
      ids.push(
        await ctx.db.insert("radarSignals", {
          platform: s.platform ?? "tiktok",
          videoId: s.videoId,
          url: s.platform === "instagram" ? `https://www.instagram.com/reel/${s.videoId}/` : `https://www.tiktok.com/@${s.handle}/video/${s.videoId}`,
          authorId: s.handle,
          authorHandle: s.handle,
          authorFans: s.fans,
          caption: s.caption,
          lang: s.lang,
          publishedAt: s.publishedAt,
          views: s.views,
          likes: Math.round(s.views / 20),
          comments: Math.round(s.views / 500),
          shares: s.shares ?? Math.round(s.views / 300),
          saves: Math.round(s.views / 200),
          ratio: ratioOf(s.views, s.fans),
          snapshots: s.snapshots ?? [{ at: now, views: s.views }],
          ...app,
          ...(s.multiplier !== undefined ? { multiplier: s.multiplier } : {}),
          ...(s.durationSec !== undefined ? { durationSec: s.durationSec } : {}),
          ...(s.hook ? { hook: s.hook } : {}),
          ...(s.transcript ? { transcript: s.transcript, transcribedAt: now } : {}),
          foundBy: s.foundBy ?? ["e2e"],
          firstSeenAt: now,
          lastSeenAt: now,
          ...(s.unavailable ? { unavailable: { reason: s.unavailable, at: now }, checkedAt: now } : {}),
          ...(account ? { trackedAccountId: account._id } : {}),
          ...(s.coverUrl ? { coverUrl: s.coverUrl } : {}),
        }),
      );
    }
    return { ids };
  },
});

/** E2E — efface les signaux dont l'id vidéo commence par `prefix`, et leurs statuts. */
export const e2eClearSignals = e2eMutation({
  args: { prefix: v.string() },
  handler: async (ctx, { prefix }) => {
    let n = 0;
    for (const s of await ctx.db.query("radarSignals").collect()) {
      if (!s.videoId.startsWith(prefix)) continue;
      await ctx.db.delete(s._id);
      n++;
    }
    return { deleted: n };
  },
});

/** E2E — remet le budget à zéro (réglages et consommation), éventuellement avec une dépense du mois. */
export const e2eResetRadarBudget = e2eMutation({
  args: { searchCredits: v.optional(v.number()), v1Settings: v.optional(v.boolean()) },
  handler: async (ctx, { searchCredits, v1Settings }) => {
    for (const s of await ctx.db.query("radarSettings").collect()) await ctx.db.delete(s._id);
    for (const u of await ctx.db.query("radarUsage").collect()) await ctx.db.delete(u._id);
    const now = Date.now();
    if (searchCredits) {
      await ctx.db.insert("radarUsage", { day: dayKeyParis(now), month: monthKeyParis(now), poste: "search", credits: searchCredits, calls: searchCredits, errors: 0 });
    }
    if (v1Settings) {
      // Des réglages tels que la phase 1 les écrivait : `tiktok` en comptes et éteint.
      await ctx.db.insert("radarSettings", {
        key: "global",
        capUsd: 60,
        postes: [
          { key: "search", qty: 60, on: true },
          { key: "curve", qty: 100, on: true },
          { key: "tiktok", qty: 200, on: false },
          { key: "demand", qty: 1_500, on: false },
        ],
        cutOrder: ["search", "transcript", "curve", "insta", "ai", "tiktok"],
        alert80: true,
        discoveryCursor: 0,
        curveAdmitted: 0,
        updatedAt: now,
      });
    }
    return null;
  },
});
