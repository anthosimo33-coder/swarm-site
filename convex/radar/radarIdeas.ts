/**
 * RADAR — IDÉES D'ACCROCHES d'une app (règles et validation : convex/radar/radarIdeasMath). Toutes les 15 min, les
 * vidéos en file (entrées au relevé de leur compte, ou rattrapées sur les 45 derniers jours au premier passage) partent
 * chez Claude Haiku, une app par appel, avec les idées déjà connues de cette app ; chacune rejoint une idée ou en ouvre
 * une. Une idée reprise par deux comptes au moins tient son format dans radarFormats (clé `idee:<id>`) : il part vers
 * Kopycat comme les autres formats (export, synchro), qui écarte les formats de gabarit qu'elle couvre.
 * Payé sur le poste « Analyse IA » du budget du Radar, coupé le premier ; sans ANTHROPIC_API_KEY, rien ne part.
 */
import Anthropic from "@anthropic-ai/sdk";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalAction, internalMutation, internalQuery, type MutationCtx, type QueryCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";
import { allowanceUsd } from "./radarSignalsMath";
import { jobBudget } from "./radarProviders";
import { ensureSettings } from "./radarSignals";
import { haikuCostUsd } from "./radarFamiliesMath";
import { fromStoredCursor } from "./radarCursorMath";
import { hookKey, multiplierOf } from "./radarNetworkMath";
import {
  addToIdea,
  ideaCandidates,
  ideaFormat,
  ideaPrompt,
  ideaText,
  knownForPrompt,
  placeIdeas,
  sharedSince,
  IDEA_AI_WAIT_MS,
  IDEA_BATCH,
  IDEA_GATHER_MS,
  IDEA_KNOWN_WINDOW_MS,
  IDEA_MAX_TRIES,
  IDEA_MODEL,
  IDEA_SCHEMA,
  IDEA_SYSTEM,
  IDEA_WINDOW_MS,
  type IdeaCandidate,
  type IdeaMember,
  type IdeaState,
  type KnownIdea,
} from "./radarIdeasMath";

/** Sous ce reste d'enveloppe, on n'appelle pas (un appel coûte moins d'un cent). */
const MIN_ALLOWANCE_USD = 0.01;
/** Appels au modèle par passage, une app chacun (IDEA_BATCH accroches au plus), dans BUDGET_MS. */
export const IDEA_CALLS_PER_RUN = 12;
const BUDGET_MS = 4 * 60_000;
export const IDEA_MAX_TOKENS = 16_000;
/** Rattrapage : vidéos lues par page de l'index by_published, pages par passage. */
export const IDEA_BACKFILL_PAGE = 400;
export const IDEA_BACKFILL_PAGES = 10;
/** Lignes dues regardées pour choisir l'app de l'appel suivant. */
const QUEUE_PEEK = 200;
/**
 * Lignes de la file lues pour un appel : assez pour réunir IDEA_BATCH accroches. Rejeu du 24/11/2026 : à 200, une app
 * dont la plupart des vidéos sont sans texte ou de comptes en pause partait en appels de 2 à 9 accroches.
 */
const QUEUE_ROWS = 800;
/** Idées connues lues pour en montrer IDEA_KNOWN_MAX au modèle (les plus reprises). */
const KNOWN_READ = 400;

const memberValidator = v.object({
  accountId: v.id("radarTracked"),
  handle: v.string(),
  appId: v.id("radarApps"),
  videoId: v.string(),
  publishedAt: v.number(),
  views: v.number(),
  multiplier: v.optional(v.number()),
  hook: v.optional(v.string()),
  platform: v.optional(v.literal("instagram")),
});
type Member = Doc<"radarIdeas">["members"][number];

/**
 * Met une vidéo neuve en file (relevé TikTok ou Instagram) : elle part avec les autres vidéos de son app, IDEA_GATHER_MS
 * plus tard (sans texte TikTok, sa miniature aura en général été lue par l'IA d'ici là, videoAi).
 */
export async function queueIdea(ctx: MutationCtx, x: { videoId: string; appId: Id<"radarApps">; publishedAt: number; hook?: string }, now: number) {
  if (now - x.publishedAt > IDEA_WINDOW_MS) return;
  await ctx.db.insert("radarIdeaQueue", { videoId: x.videoId, appId: x.appId, dueAt: now + (hookKey(x.hook) ? IDEA_GATHER_MS : Math.max(IDEA_GATHER_MS, IDEA_AI_WAIT_MS)), tries: 0 });
}

const stateOf = (i: Doc<"radarIdeas">): IdeaState => ({
  members: i.members as IdeaMember[],
  videoIds: i.videoIds,
  accountIds: i.accountIds,
  accountCount: i.accountCount,
  lastPostAt: i.lastPostAt,
  examples: i.examples,
});

/** Le format de l'idée, créé dès deux comptes, tenu à jour ensuite (sa date de naissance ne bouge plus). */
async function syncIdeaFormat(ctx: MutationCtx, idea: Doc<"radarIdeas">, now: number) {
  const fields = ideaFormat({ ...stateOf(idea), id: idea._id, label: idea.label }, sharedSince(idea.members, now));
  if (!fields) return;
  const members = fields.members as Member[];
  const existing = idea.formatId ? await ctx.db.get(idea.formatId) : null;
  if (existing) {
    await ctx.db.patch(existing._id, { ...fields, members, appIds: fields.appIds as Id<"radarApps">[], firstSeenAt: existing.firstSeenAt });
    return;
  }
  const formatId = await ctx.db.insert("radarFormats", { ...fields, members, appIds: fields.appIds as Id<"radarApps">[] });
  await ctx.db.patch(idea._id, { formatId });
}

/**
 * Le relevé d'une vidéo déjà rangée dans une idée : sa reprise y est tenue à jour (vues, multiplicateur), comme celle
 * de son gabarit (radarNetworks.shareFormat). Rien n'est écrit si rien ne change.
 */
export async function refreshIdeaMember(ctx: MutationCtx, ideaId: Id<"radarIdeas">, member: IdeaMember, now: number) {
  const idea = await ctx.db.get(ideaId);
  if (!idea) return;
  const before = idea.members.find((m) => m.videoId === member.videoId);
  if (before && before.views === member.views && before.multiplier === member.multiplier) return;
  // Le texte rangé reste celui de l'idée (celui de TikTok, ou lu par l'IA) : seuls les chiffres du relevé changent.
  const m: IdeaMember = before
    ? { ...(before as IdeaMember), views: member.views, ...(member.multiplier !== undefined ? { multiplier: member.multiplier } : {}) }
    : member;
  const next = addToIdea(stateOf(idea), [m]);
  if (JSON.stringify(next.members) === JSON.stringify(idea.members)) return;
  await ctx.db.patch(idea._id, { members: next.members as Member[], examples: next.examples });
  await syncIdeaFormat(ctx, { ...idea, members: next.members as Member[], examples: next.examples }, now);
}

/**
 * Rattrapage, une page : les vidéos publiées depuis `from` (45 jours avant la mise en route) et pas encore rangées
 * passent en file. Une fois au bout, plus rien : les vidéos neuves entrent par leur relevé (queueIdea).
 */
export const ideaBackfillPage = internalMutation({
  args: { now: v.number() },
  handler: async (ctx, { now }): Promise<{ done: boolean; queued: number }> => {
    const s = await ensureSettings(ctx);
    const b = s.ideaBackfill ?? { from: now - IDEA_WINDOW_MS, cursor: null, done: false };
    if (b.done) return { done: true, queued: 0 };
    // Un curseur illisible (recopié d'un autre déploiement) : le rattrapage repart du début (cf radarCursorMath).
    const { result: r } = await fromStoredCursor(b.cursor, (cursor) =>
      ctx.db.query("radarTrackedVideos").withIndex("by_published", (q) => q.gte("publishedAt", b.from)).paginate({ cursor, numItems: IDEA_BACKFILL_PAGE }),
    );
    let queued = 0;
    for (const x of r.page) {
      if (x.ideaId) continue;
      await ctx.db.insert("radarIdeaQueue", { videoId: x.videoId, appId: x.appId, dueAt: now, tries: 0 });
      queued++;
    }
    await ctx.db.patch(s._id, { ideaBackfill: { from: b.from, cursor: r.isDone ? null : r.continueCursor, done: r.isDone } });
    return { done: r.isDone, queued };
  },
});

/** L'app réelle d'une app fondue (5 sauts au plus). */
async function canonicalApp(ctx: QueryCtx, id: Id<"radarApps">): Promise<Doc<"radarApps"> | null> {
  let a = await ctx.db.get(id);
  for (let i = 0; a?.mergedInto && i < 5; i++) a = (await ctx.db.get(a.mergedInto)) ?? a;
  return a;
}

type IdeaWork = {
  appId: Id<"radarApps">;
  appName: string;
  candidates: IdeaCandidate[];
  known: KnownIdea[];
  /** Lignes de la file : rangées par cet appel, à reprendre plus tard (sans texte, app pas montrée), à retirer. */
  place: Id<"radarIdeaQueue">[];
  retry: { id: Id<"radarIdeaQueue">; tries: number }[];
  drop: Id<"radarIdeaQueue">[];
};

/**
 * Le travail d'un appel : l'app de la plus ancienne ligne due (hors `skip`, déjà servies par ce passage), ses vidéos
 * dues avec leur texte (TikTok, sinon lu par l'IA), regroupées par texte (IDEA_BATCH au plus), et ses idées connues.
 * Une vidéo disparue, déjà rangée, ou d'un compte qui n'est plus suivi sort de la file ; une vidéo sans texte, ou
 * d'une app pas montrée dans Kopycat (en pause, à l'essai), est reprise un jour plus tard, IDEA_MAX_TRIES fois.
 */
export const ideaWork = internalQuery({
  args: { now: v.number(), skip: v.array(v.id("radarApps")) },
  handler: async (ctx, { now, skip }): Promise<IdeaWork | null> => {
    const peek = await ctx.db.query("radarIdeaQueue").withIndex("by_due", (q) => q.lte("dueAt", now)).take(QUEUE_PEEK);
    const first = peek.find((r) => !skip.includes(r.appId));
    if (!first) return null;
    // Toutes les vidéos en file de cette app, même celles qui ne sont pas encore dues : un seul appel par app et par jour.
    const rows = await ctx.db.query("radarIdeaQueue").withIndex("by_app_due", (q) => q.eq("appId", first.appId).lte("dueAt", now + IDEA_GATHER_MS)).take(QUEUE_ROWS);
    const app = await canonicalApp(ctx, first.appId);
    const work: IdeaWork = { appId: app?._id ?? first.appId, appName: app?.name ?? "", candidates: [], known: [], place: [], retry: [], drop: [] };
    const later = (r: Doc<"radarIdeaQueue">) => (r.tries + 1 >= IDEA_MAX_TRIES ? work.drop.push(r._id) : work.retry.push({ id: r._id, tries: r.tries + 1 }));
    if (!app || app.status !== "active" || app.trialSince !== undefined) {
      for (const r of rows) later(r);
      return work;
    }
    const accounts = new Map<Id<"radarTracked">, Doc<"radarTracked"> | null>();
    const members: IdeaMember[] = [];
    const rowOf = new Map<string, Id<"radarIdeaQueue">[]>();
    // Les textes différents de l'appel : à IDEA_BATCH, les lignes suivantes restent en file, intactes.
    const texts = new Set<string>();
    for (const r of rows) {
      const x = await ctx.db.query("radarTrackedVideos").withIndex("by_video", (q) => q.eq("videoId", r.videoId)).first();
      if (!x || x.ideaId) {
        work.drop.push(r._id);
        continue;
      }
      if (!accounts.has(x.accountId)) accounts.set(x.accountId, await ctx.db.get(x.accountId));
      const acc = accounts.get(x.accountId);
      if (!acc || acc.status !== "active") {
        work.drop.push(r._id);
        continue;
      }
      const ai = x.hook && hookKey(x.hook) ? null : await ctx.db.query("videoAi").withIndex("by_video", (q) => q.eq("videoId", x.videoId)).first();
      const text = ideaText(x.hook, ai?.text);
      if (!text) {
        later(r);
        continue;
      }
      if (rowOf.has(x.videoId)) {
        rowOf.get(x.videoId)!.push(r._id); // la même vidéo deux fois en file (relevé et rattrapage)
        continue;
      }
      const key = hookKey(text)!;
      if (!texts.has(key) && texts.size >= IDEA_BATCH) break;
      texts.add(key);
      rowOf.set(x.videoId, [r._id]);
      const ig = x.platform === "instagram";
      const multiplier = multiplierOf(x.views, ig ? acc.igMedianViews : acc.medianViews);
      members.push({
        accountId: x.accountId,
        handle: ig ? (acc.igHandle ?? acc.handle) : acc.handle,
        appId: x.appId,
        videoId: x.videoId,
        publishedAt: x.publishedAt,
        views: x.views,
        ...(multiplier !== undefined ? { multiplier } : {}),
        hook: text,
        ...(ig ? { platform: "instagram" as const } : {}),
      });
    }
    // Les plus anciennes d'abord : une idée naît de la vidéo qui l'a lancée.
    members.sort((p, q) => p.publishedAt - q.publishedAt);
    work.candidates = ideaCandidates(members);
    for (const c of work.candidates) for (const m of c.videos) work.place.push(...rowOf.get(m.videoId)!);
    const known = await ctx.db
      .query("radarIdeas")
      .withIndex("by_app_last", (q) => q.eq("appId", work.appId).gte("lastSeenAt", now - IDEA_KNOWN_WINDOW_MS))
      .order("desc")
      .take(KNOWN_READ);
    work.known = knownForPrompt(known).map((k) => ({ id: k._id, label: k.label, examples: k.examples }));
    return work;
  },
});

/**
 * Range les vidéos d'un appel : idées nouvelles créées, chaque vidéo reliée à son idée (une vidéo déjà rangée entre-temps
 * ne l'est pas deux fois), chaque idée et son format tenus, la file avancée.
 */
export const applyIdeas = internalMutation({
  args: {
    now: v.number(),
    appId: v.id("radarApps"),
    groups: v.array(v.object({ known: v.optional(v.id("radarIdeas")), ref: v.optional(v.string()), members: v.array(memberValidator) })),
    newIdeas: v.array(v.object({ ref: v.string(), label: v.string() })),
    place: v.array(v.id("radarIdeaQueue")),
    retry: v.array(v.object({ id: v.id("radarIdeaQueue"), tries: v.number() })),
    drop: v.array(v.id("radarIdeaQueue")),
    // Lignes d'un appel raté : reprises un jour plus tard, retirées au bout de IDEA_MAX_TRIES essais.
    fail: v.optional(v.array(v.id("radarIdeaQueue"))),
  },
  handler: async (ctx, { now, appId, groups, newIdeas, place, retry, drop, fail }) => {
    const created = new Map<string, Id<"radarIdeas">>();
    for (const f of newIdeas) {
      if (!groups.some((g) => g.ref === f.ref)) continue;
      created.set(
        f.ref,
        await ctx.db.insert("radarIdeas", { appId, label: f.label, examples: [], members: [], videoIds: [], accountIds: [], accountCount: 0, lastPostAt: 0, createdAt: now, lastSeenAt: now }),
      );
    }
    // Les vidéos d'une même idée ensemble (plusieurs accroches de l'appel peuvent la rejoindre).
    const byIdea = new Map<Id<"radarIdeas">, Member[]>();
    for (const g of groups) {
      const id = g.known ?? (g.ref !== undefined ? created.get(g.ref) : undefined);
      if (id) byIdea.set(id, [...(byIdea.get(id) ?? []), ...g.members]);
    }
    let placed = 0;
    for (const [id, ms] of byIdea) {
      const idea = await ctx.db.get(id);
      if (!idea || idea.appId !== appId) continue;
      const fresh: Member[] = [];
      for (const m of ms) {
        const x = await ctx.db.query("radarTrackedVideos").withIndex("by_video", (q) => q.eq("videoId", m.videoId)).first();
        if (!x || x.ideaId) continue;
        await ctx.db.patch(x._id, { ideaId: id });
        fresh.push(m);
      }
      if (!fresh.length) continue;
      placed += fresh.length;
      const next = addToIdea(stateOf(idea), fresh as IdeaMember[]);
      const doc = { ...idea, ...next, members: next.members as Member[], lastSeenAt: now };
      await ctx.db.patch(id, { members: doc.members, videoIds: next.videoIds, accountIds: next.accountIds, accountCount: next.accountCount, lastPostAt: next.lastPostAt, examples: next.examples, lastSeenAt: now });
      await syncIdeaFormat(ctx, doc, now);
    }
    for (const id of [...place, ...drop]) if (await ctx.db.get(id)) await ctx.db.delete(id);
    for (const r of retry) if (await ctx.db.get(r.id)) await ctx.db.patch(r.id, { tries: r.tries, dueAt: now + IDEA_AI_WAIT_MS });
    for (const id of fail ?? []) {
      const r = await ctx.db.get(id);
      if (!r) continue;
      if (r.tries + 1 >= IDEA_MAX_TRIES) await ctx.db.delete(id);
      else await ctx.db.patch(id, { tries: r.tries + 1, dueAt: now + IDEA_AI_WAIT_MS });
    }
    return { placed, ideas: created.size };
  },
});

/** La réponse du modèle mise dans la forme de applyIdeas : les vidéos de chaque accroche, vers leur idée. */
export function groupsOf(work: Pick<IdeaWork, "candidates" | "known">, answer: unknown) {
  const placed = placeIdeas(answer, work.candidates, work.known);
  return {
    newIdeas: placed.newIdeas,
    groups: placed.placements.map((p) => ({
      ...("known" in p.idea ? { known: p.idea.known as Id<"radarIdeas"> } : { ref: p.idea.ref }),
      members: work.candidates[p.candidate].videos as Member[],
    })),
  };
}

export const runIdeas = internalAction({
  args: {},
  handler: async (ctx): Promise<{ skipped: "no-key" | "budget" } | { placed: number; calls: number; usd: number }> => {
    if (!process.env.ANTHROPIC_API_KEY) return { skipped: "no-key" };
    const start = Date.now();
    for (let i = 0; i < IDEA_BACKFILL_PAGES; i++) {
      const r: { done: boolean } = await ctx.runMutation(internal.radar.radarIdeas.ideaBackfillPage, { now: start });
      if (r.done) break;
    }
    const st = await ctx.runQuery(internal.radar.radarSignals.jobState, { now: start });
    if (allowanceUsd(st.budget, jobBudget(st), "ai") < MIN_ALLOWANCE_USD) return { skipped: "budget" };

    const client = new Anthropic({ timeout: 60_000, maxRetries: 1 });
    let usd = 0;
    let placed = 0;
    let calls = 0;
    let errors = 0;
    let lastError: string | undefined;
    const skip: Id<"radarApps">[] = [];
    for (let i = 0; i < IDEA_CALLS_PER_RUN && Date.now() - start < BUDGET_MS; i++) {
      const now = Date.now();
      const work: IdeaWork | null = await ctx.runQuery(internal.radar.radarIdeas.ideaWork, { now, skip });
      if (!work) break;
      skip.push(work.appId);
      const queueOnly = { place: [], retry: work.retry, drop: work.drop };
      if (work.candidates.length === 0) {
        await ctx.runMutation(internal.radar.radarIdeas.applyIdeas, { now, appId: work.appId, groups: [], newIdeas: [], ...queueOnly });
        continue;
      }
      // Un appel raté : ses vidéos sont reprises un jour plus tard (IDEA_MAX_TRIES fois), jamais en boucle à chaque passage.
      const failed = async (why: string) => {
        errors++;
        lastError = why;
        await ctx.runMutation(internal.radar.radarIdeas.applyIdeas, { now, appId: work.appId, groups: [], newIdeas: [], place: [], retry: work.retry, drop: work.drop, fail: work.place });
      };
      try {
        const response = await client.messages.create({
          model: IDEA_MODEL,
          // 100 accroches : ~2 700 jetons de réponse, plus la réflexion du modèle (~5 000 à l'effort bas, mesuré le
          // 24/11/2026 ; à 8 000, 3 appels sur 7 étaient coupés).
          max_tokens: IDEA_MAX_TOKENS,
          system: IDEA_SYSTEM,
          // Ranger, pas raisonner longuement : effort bas.
          output_config: { effort: "low", format: { type: "json_schema", schema: IDEA_SCHEMA } },
          messages: [{ role: "user", content: ideaPrompt(work.appName, work.candidates, work.known) }],
        });
        calls++;
        usd += haikuCostUsd(response.usage);
        if (response.stop_reason === "refusal" || response.stop_reason === "max_tokens") {
          await failed(`Idées d'accroches : réponse interrompue (${response.stop_reason})`);
          continue;
        }
        const text = response.content.find((b) => b.type === "text")?.text ?? "";
        const { groups, newIdeas } = groupsOf(work, JSON.parse(text));
        const r: { placed: number } = await ctx.runMutation(internal.radar.radarIdeas.applyIdeas, { now, appId: work.appId, groups, newIdeas, place: work.place, retry: work.retry, drop: work.drop });
        placed += r.placed;
      } catch (e) {
        await failed(
          e instanceof Anthropic.RateLimitError
            ? "Idées d'accroches : trop de demandes, nouvel essai au prochain passage"
            : e instanceof Anthropic.AuthenticationError
              ? "Idées d'accroches : clé ANTHROPIC_API_KEY refusée"
              : e instanceof Anthropic.APIError
                ? `Idées d'accroches : erreur ${e.status ?? "réseau"}`
                : "Idées d'accroches : réponse illisible",
        );
      }
    }
    if (calls || errors) {
      await ctx.runMutation(internal.radar.radarSignals.recordRun, { poste: "ai", credits: 0, calls, errors, now: start, usd, ...(lastError ? { lastError } : {}) });
    }
    return { placed, calls, usd };
  },
});

/** Purge : les idées sans vidéo rangée depuis 90 jours (leur format, sans reprise depuis 30 jours, est déjà purgé). */
export const IDEA_KEEP_MS = 90 * 86_400_000;
export const purgeIdeas = internalMutation({
  args: {},
  handler: async (ctx): Promise<number> => {
    const old = await ctx.db.query("radarIdeas").withIndex("by_last", (q) => q.lt("lastSeenAt", Date.now() - IDEA_KEEP_MS)).take(200);
    for (const i of old) await ctx.db.delete(i._id);
    if (old.length === 200) await ctx.scheduler.runAfter(0, internal.radar.radarIdeas.purgeIdeas, {});
    return old.length;
  },
});
