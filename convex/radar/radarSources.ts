/**
 * NOUVEAU RADAR — trois sources de plus (06/11/2026), tenues par le budget du
 * mois comme les autres (convex/radarSignalsMath) ; lecture pure :
 * convex/radarSourcesMath.
 *
 *  - PUBS (toutes les 6 h) : les bibliothèques de pubs TikTok et Meta, pour
 *    chaque app suivie (concurrentes tous les 3 jours, les autres chaque
 *    semaine). Une pub qui tourne longtemps est un format que l'app PAIE pour
 *    pousser : le signal le plus sûr qu'il marche.
 *  - INSTAGRAM (toutes les heures) : le compte Instagram que donne la bio TikTok
 *    d'un compte suivi (radarTracked.igHandle) ; ses Reels ont leur propre
 *    médiane, ceux qui sortent du lot entrent dans Signaux (plateforme
 *    « instagram »), leurs hooks nourrissent les formats qui circulent.
 *  - TRANSCRIPTIONS (toutes les 2 h) : ce qui est dit dans les signaux TikTok les
 *    plus vus de la semaine (2 minutes au plus) — par leurs sous-titres natifs
 *    d'abord (page publique, sans crédit, 20/11/2026), le payant pour le reste.
 *
 * Données GLOBALES (pas de projet), comme les réseaux.
 */
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalAction, internalMutation, internalQuery } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";
import { e2eMutation, permissionQuery, type ProjectQueryCtx } from "./functions";
import { MAX_READ_ERRORS, MEDIAN_WINDOW, hookTemplate, medianViews, multiplierOf, nextReadAt, shouldPromote } from "./radarNetworkMath";
import { RETENTION_DAYS, addSnapshot, allowance, budgetState, ratioOf, type SignalInput } from "./radarSignalsMath";
import {
  TRANSCRIPT_FREE_MAX_MS,
  TRANSCRIPT_FREE_PAGES,
  adCitesApp,
  adRunDays,
  rankTranscripts,
  transcriptPass,
  transcriptQueue,
  type AdInput,
} from "./radarSourcesMath";
import { FREE_RETRY_MS, paced, retrying, type FreePage } from "./radarFreeMath";
import { fetchEmbedPage, storePauseMs } from "./radarStoreMath";
import { appRef, todayCredits, writeSignal, type JobState, type RunResult } from "./radarSignals";
import { shareFormat } from "./radarNetworks";
import { scIgFollowers, scIgReels, scKeyPresent, scTranscript } from "./scrapeCreatorsApi";

const DAY = 86_400_000;
const INSTA_RUNS_PER_DAY = 24;
const TRANSCRIPT_RUNS_PER_DAY = 12;

const igReelInput = v.object({
  code: v.string(),
  url: v.string(),
  publishedAt: v.number(),
  views: v.number(),
  likes: v.number(),
  comments: v.number(),
  durationSec: v.optional(v.number()),
  coverUrl: v.optional(v.string()),
  hook: v.optional(v.string()),
});

// ─── Pubs ────────────────────────────────────────────────────────────────────

type DueAdApp = { id: Id<"radarApps">; name: string; slug: string; rival: boolean; strong: string[]; weak: string[]; context: string[] };

// ─── Instagram ───────────────────────────────────────────────────────────────

type DueIg = { id: Id<"radarTracked">; igHandle: string; needFans: boolean };

export const dueIgAccounts = internalQuery({
  args: { now: v.number(), limit: v.number() },
  handler: async (ctx, { now, limit }): Promise<DueIg[]> => {
    if (limit <= 0) return [];
    const rows = await ctx.db
      .query("radarTracked")
      // gte(0) : un compte sans Instagram (igNextReadAt absent) n'est jamais dû.
      .withIndex("by_ig_due", (q) => q.eq("status", "active").gte("igNextReadAt", 0).lte("igNextReadAt", now))
      .take(limit);
    return rows.filter((r) => r.igHandle).map((r) => ({ id: r._id, igHandle: r.igHandle!, needFans: r.igFans === undefined }));
  },
});

/**
 * Le relevé Instagram d'un compte suivi : ses Reels rangés (videoId « ig:<code> »),
 * sa médiane Instagram, ses hooks dans les formats, et ses Reels qui sortent du
 * lot promus dans Signaux.
 */
export const applyIgRead = internalMutation({
  args: { accountId: v.id("radarTracked"), reels: v.array(igReelInput), fans: v.optional(v.number()), now: v.number() },
  handler: async (ctx, { accountId, reels, fans, now }): Promise<{ promoted: number }> => {
    const acc = await ctx.db.get(accountId);
    if (!acc?.igHandle) return { promoted: 0 };
    const app = await ctx.db.get(acc.appId);
    const handle = acc.igHandle;
    for (const r of reels) {
      const videoId = `ig:${r.code}`;
      const hk = hookTemplate(r.hook);
      const known = await ctx.db.query("radarTrackedVideos").withIndex("by_video", (q) => q.eq("videoId", videoId)).first();
      if (known) {
        await ctx.db.patch(known._id, {
          views: Math.max(known.views, r.views),
          snapshots: addSnapshot(known.snapshots, now, r.views),
          lastSeenAt: now,
          ...(r.coverUrl ? { coverUrl: r.coverUrl } : {}),
        });
      } else {
        await ctx.db.insert("radarTrackedVideos", {
          accountId,
          appId: acc.appId,
          platform: "instagram",
          videoId,
          publishedAt: r.publishedAt,
          views: r.views,
          snapshots: [{ at: now, views: r.views }],
          ...(r.coverUrl ? { coverUrl: r.coverUrl } : {}),
          lastSeenAt: now,
          ...(r.hook ? { hook: r.hook } : {}),
          ...(hk ? { hookKey: hk } : {}),
        });
      }
    }
    const recent = (await ctx.db.query("radarTrackedVideos").withIndex("by_account_published", (q) => q.eq("accountId", accountId)).order("desc").take(MEDIAN_WINDOW * 3))
      .filter((r) => r.platform === "instagram")
      .slice(0, MEDIAN_WINDOW);
    const median = medianViews(recent.map((r) => r.views));
    const igFans = fans ?? acc.igFans;
    const lastIg = recent[0]?.publishedAt;
    const week = recent.filter((r) => now - r.publishedAt <= 7 * DAY);
    let best: Doc<"radarTracked">["igBest7d"];
    for (const r of week) {
      const m = multiplierOf(r.views, median) ?? ratioOf(r.views, igFans ?? 0);
      const code = r.videoId.replace(/^ig:/, "");
      if (!best || m > best.multiplier) best = { code, url: `https://www.instagram.com/reel/${code}/`, views: r.views, multiplier: m, publishedAt: r.publishedAt };
    }
    await ctx.db.patch(accountId, {
      ...(igFans !== undefined ? { igFans } : {}),
      igMedianViews: median,
      igReadAt: now,
      igNextReadAt: nextReadAt(lastIg, now),
      igReadErrors: 0,
      igPosts7d: week.length,
      igBest7d: best,
    });

    let promoted = 0;
    for (const r of reels) {
      const multiplier = multiplierOf(r.views, median);
      if (r.hook && now - r.publishedAt <= 14 * DAY) {
        const hk = hookTemplate(r.hook);
        if (hk) {
          await shareFormat(ctx, "hook", hk, r.hook, {
            accountId,
            handle,
            appId: acc.appId,
            videoId: `ig:${r.code}`,
            publishedAt: r.publishedAt,
            views: r.views,
            ...(multiplier !== undefined ? { multiplier } : {}),
            hook: r.hook,
            platform: "instagram",
          }, now);
        }
      }
      const s: Omit<SignalInput, "lang"> & { lang: string } = {
        platform: "instagram",
        videoId: `ig:${r.code}`,
        url: r.url,
        authorId: handle,
        authorHandle: handle,
        authorFans: igFans ?? 0,
        caption: "",
        lang: acc.lang ?? "autre",
        publishedAt: r.publishedAt,
        ...(r.durationSec !== undefined ? { durationSec: r.durationSec } : {}),
        ...(r.coverUrl ? { coverUrl: r.coverUrl } : {}),
        isAd: false,
        views: r.views,
        likes: r.likes,
        comments: r.comments,
        shares: 0,
        saves: 0,
        ...(r.hook ? { hook: r.hook } : {}),
      };
      // Sans médiane (moins de 5 Reels), pas de promotion : les abonnés Instagram
      // seuls ne disent pas assez.
      const promote = multiplier !== undefined && shouldPromote(r.views, multiplier, 0) && r.publishedAt >= now - RETENTION_DAYS * DAY;
      const w = await writeSignal(ctx, s, now, {
        insert: promote,
        foundBy: "compte suivi · Instagram",
        ...(app ? { app: appRef(app) } : {}),
        trackedAccountId: accountId,
        ...(multiplier !== undefined ? { multiplier } : {}),
      });
      if (w === "inserted") promoted++;
    }
    return { promoted };
  },
});

/** Relevé Instagram en échec : 3 de suite (compte privé, introuvable) et on ne le relève plus. */
export const markIgError = internalMutation({
  args: { accountId: v.id("radarTracked"), now: v.number() },
  handler: async (ctx, { accountId, now }): Promise<void> => {
    const acc = await ctx.db.get(accountId);
    if (!acc) return;
    const errors = (acc.igReadErrors ?? 0) + 1;
    await ctx.db.patch(accountId, { igReadErrors: errors, igNextReadAt: errors >= MAX_READ_ERRORS ? undefined : now + DAY });
  },
});

export const runInstaReads = internalAction({
  args: {},
  handler: async (ctx): Promise<RunResult> => {
    const now = Date.now();
    if (!scKeyPresent()) return { skipped: "no-key" };
    const st: JobState = await ctx.runQuery(internal.radar.radarSignals.jobState, { now });
    const left = allowance(st.budget, budgetState(st.budget, st.usage, st.balance), "insta", todayCredits(st, "insta"), INSTA_RUNS_PER_DAY);
    const due: DueIg[] = await ctx.runQuery(internal.radar.radarSources.dueIgAccounts, { now, limit: left });
    let credits = 0;
    let calls = 0;
    let errors = 0;
    let creditsRemaining: number | undefined;
    let lastError: string | undefined;
    for (const acc of due) {
      if (credits >= left) break;
      let fans: number | undefined;
      if (acc.needFans) {
        const f = await scIgFollowers(acc.igHandle);
        calls++;
        credits += f.credits;
        if (f.ok) fans = f.value;
      }
      const r = await scIgReels(acc.igHandle);
      calls++;
      credits += r.credits;
      if (!r.ok) {
        errors++;
        lastError = r.error;
        if (r.noCredits) break;
        await ctx.runMutation(internal.radar.radarSources.markIgError, { accountId: acc.id, now });
        continue;
      }
      if (r.creditsRemaining !== undefined) creditsRemaining = r.creditsRemaining;
      await ctx.runMutation(internal.radar.radarSources.applyIgRead, { accountId: acc.id, reels: r.value, ...(fans !== undefined ? { fans } : {}), now });
    }
    await ctx.runMutation(internal.radar.radarSignals.recordRun, {
      poste: "insta",
      credits,
      calls,
      errors,
      now,
      ...(creditsRemaining !== undefined ? { creditsRemaining } : {}),
      ...(lastError ? { lastError } : {}),
    });
    return { calls, credits, errors };
  },
});

// ─── Transcriptions ──────────────────────────────────────────────────────────

type DueTranscript = { id: Id<"radarSignals">; url: string; checked: boolean };

/**
 * Les signaux TikTok de la semaine pas encore transcrits, rangés (radarSourcesMath.rankTranscripts) : les
 * `freeLimit` premiers jamais lus sur leur page (la voie gratuite) et les `limit` premiers déjà lus sans
 * sous-titres natifs (le payant), dans l'ordre de la file.
 */
export const dueTranscripts = internalQuery({
  args: { now: v.number(), limit: v.number(), freeLimit: v.optional(v.number()) },
  handler: async (ctx, { now, limit, freeLimit = 0 }): Promise<DueTranscript[]> => {
    if (limit <= 0 && freeLimit <= 0) return [];
    const rows = await ctx.db.query("radarSignals").withIndex("by_published", (q) => q.gte("publishedAt", now - 7 * DAY)).order("desc").take(800);
    const apps = await ctx.db.query("radarApps").collect();
    // Voie fermée, le payant reprend la tête de la file comme avant : elle doit tenir dans ce que la requête rend.
    return transcriptQueue(rankTranscripts(rows, apps), Math.max(freeLimit, limit), limit).map(({ row, checked }) => ({ id: row._id, url: row.url, checked }));
  },
});

export const setTranscript = internalMutation({
  args: { signalId: v.id("radarSignals"), text: v.union(v.string(), v.null()), now: v.number() },
  handler: async (ctx, { signalId, text, now }): Promise<void> => {
    if (!(await ctx.db.get(signalId))) return;
    await ctx.db.patch(signalId, { ...(text ? { transcript: text } : {}), transcribedAt: now });
  },
});

/** Page publique lue sans sous-titres natifs à prendre : la voie gratuite ne la relit plus, le payant la prendra. */
export const markSubtitlesChecked = internalMutation({
  args: { signalId: v.id("radarSignals"), now: v.number() },
  handler: async (ctx, { signalId, now }): Promise<void> => {
    if (!(await ctx.db.get(signalId))) return;
    await ctx.db.patch(signalId, { subtitlesCheckedAt: now });
  },
});

/**
 * Un passage de transcriptions (radarSourcesMath.transcriptPass) : les sous-titres natifs d'abord, sur les pages
 * publiques de TikTok — même quand le poste payant est éteint ou coupé (palier, réserve), ou sans clé : elles ne
 * coûtent rien —, puis le payant dans la limite du budget. Une page à la fois, une pause avant chacune, une page
 * refusée redemandée une fois (le rythme des relevés gratuits, radarNetworks).
 */
export const runTranscripts = internalAction({
  args: {},
  handler: async (ctx): Promise<RunResult> => {
    const now = Date.now();
    // Sans clé ScrapeCreators, le payant ne peut rien (n = 0) ; la voie gratuite, elle, n'en a pas besoin.
    let n = 0;
    if (scKeyPresent()) {
      const st: JobState = await ctx.runQuery(internal.radar.radarSignals.jobState, { now });
      n = allowance(st.budget, budgetState(st.budget, st.usage, st.balance), "transcript", todayCredits(st, "transcript"), TRANSCRIPT_RUNS_PER_DAY);
    }
    const due: DueTranscript[] = await ctx.runQuery(internal.radar.radarSources.dueTranscripts, { now, limit: n, freeLimit: TRANSCRIPT_FREE_PAGES });
    const sleep = (ms: number) => new Promise<void>((done) => setTimeout(done, ms));
    const page = retrying(
      paced(
        async (url: string): Promise<FreePage> => {
          const r = await fetchEmbedPage(url);
          return r.kind === "ok" ? { ok: true, text: r.text } : r.kind === "suspect" ? { ok: false, kind: "suspect", reason: r.reason } : { ok: false, kind: "absent" };
        },
        () => sleep(storePauseMs(Math.random())),
      ),
      () => sleep(FREE_RETRY_MS),
    );
    const started = Date.now();
    const pass = await transcriptPass(
      due,
      {
        page,
        paid: (s) => scTranscript(s.url),
        apply: async (s, r) => {
          if (r === "checked") await ctx.runMutation(internal.radar.radarSources.markSubtitlesChecked, { signalId: s.id, now });
          else await ctx.runMutation(internal.radar.radarSources.setTranscript, { signalId: s.id, text: r.text, now });
        },
        alive: () => Date.now() - started < TRANSCRIPT_FREE_MAX_MS,
      },
      { pages: TRANSCRIPT_FREE_PAGES, paid: n },
    );
    if (pass.free.stopped) console.warn(`[radar] transcriptions : voie gratuite fermée, ${pass.free.stopped}`);
    // Ce que TikTok sert aux serveurs : tous les textes gratuits (saved ne compte que ceux qui remplacent un appel payant).
    const f = pass.free;
    if (f.pages > 0) console.log(`[radar] transcriptions : ${f.pages} pages, ${f.texts} textes par les sous-titres natifs (${pass.saved} à la place du payant), ${f.checked} sans piste, ${f.gone} supprimées, ${f.missed} manquées`);
    const { calls, credits, errors, creditsRemaining, lastError } = pass.paid;
    await ctx.runMutation(internal.radar.radarSignals.recordRun, {
      poste: "transcript",
      credits,
      calls,
      errors,
      now,
      ...(creditsRemaining !== undefined ? { creditsRemaining } : {}),
      ...(lastError ? { lastError } : {}),
      ...(pass.saved > 0 ? { saved: { transcript: pass.saved } } : {}),
    });
    return { calls, credits, errors };
  },
});

// ─── Purge, E2E ──────────────────────────────────────────────────────────────
