import { describe, expect, it } from "vitest";
import { applyAccountRead } from "../../convex/radar/radarNetworks";
import { exportPage } from "../../convex/radar/swarmExportPage";
import { applyIdeas, groupsOf, ideaBackfillPage, ideaWork, queueIdea, IDEA_BACKFILL_PAGE } from "../../convex/radar/radarIdeas";
import {
  addToIdea,
  emptyIdea,
  ideaCandidates,
  ideaFormat,
  ideaAnchor,
  ideaFormatKey,
  ideaName,
  ideaPrompt,
  ideaText,
  isIdeaKey,
  knownForPrompt,
  pickMembers,
  placeIdeas,
  sharedSince,
  IDEA_AI_WAIT_MS,
  IDEA_BATCH,
  IDEA_GATHER_MS,
  IDEA_MAX_TRIES,
  IDEA_MEMBERS,
  IDEA_WINDOW_MS,
  type IdeaCandidate,
  type IdeaMember,
  type KnownIdea,
} from "../../convex/radar/radarIdeasMath";
import { memoryDb, type MemoryDoc } from "./convex-memory-db";

/**
 * Les IDÉES d'accroches d'une app (24/11/2026). Le gabarit (4 premiers mots) séparait une même idée reprise sous des
 * tournures différentes : chez Diane AI, « t'as terminé de réviser avec 3h d'avance parce que… », « tu as fini de
 * réviser 5h plus tôt parce que… », « t'as réussi à rattraper ton semestre… » faisaient une dizaine de formats, dont
 * aucun sur la fiche de l'app. Les accroches ci-dessous sont inventées sur ce modèle ; les comptes aussi.
 */

const DAY = 86_400_000;
const NOW = Date.parse("2026-11-24T00:00:00Z");

const member = (accountId: string, videoId: string, views: number, hook: string, publishedAt = NOW - DAY): IdeaMember => ({
  accountId,
  handle: `compte.${accountId}`,
  appId: "appRevision",
  videoId,
  publishedAt,
  views,
  hook,
});

describe("idées d'accroches : règles pures (radarIdeasMath)", () => {
  it("le texte lu : celui de TikTok s'il dit quelque chose, sinon celui que l'IA a lu sur la miniature", () => {
    expect(ideaText("POV : t'as fini de réviser plus tôt", "autre texte lu par l'IA")).toBe("POV : t'as fini de réviser plus tôt");
    expect(ideaText(undefined, "Je ne dirai jamais\n« J'ai réussi »\nmais « on a réussi »")).toBe("Je ne dirai jamais « J'ai réussi » mais « on a réussi »");
    // Trop court pour dire une idée (moins de 3 mots), des deux côtés.
    expect(ideaText("Diane ai", "ok")).toBeNull();
    expect(ideaText("· Diane ai ·", undefined)).toBeNull();
    // Coupé par caractère entier (un émoji coupé en deux, Convex le refuse).
    const long = ideaText("révise 😭 ".repeat(80), null)!;
    expect(Array.from(long).length).toBe(200);
    expect(long.endsWith("…")).toBe(true);
    expect(/[\ud800-\udbff](?![\udc00-\udfff])/.test(long)).toBe(false);
  });

  it("le même texte posté plusieurs fois n'est montré qu'une fois au modèle, toutes ses vidéos derrière", () => {
    const c = ideaCandidates([
      member("a", "v1", 10, "POV : t'as fini de réviser 3h plus tôt"),
      member("b", "v2", 20, "pov: T'AS FINI de réviser 3h plus tôt !!"),
      member("a", "v3", 30, "Ma technique pour apprendre mes cours"),
      member("c", "v4", 40, "ok"),
    ]);
    expect(c.map((x) => [x.text, x.videos.map((v) => v.videoId)])).toEqual([
      ["POV : t'as fini de réviser 3h plus tôt", ["v1", "v2"]],
      ["Ma technique pour apprendre mes cours", ["v3"]],
    ]);
  });

  const known: KnownIdea[] = [{ id: "ideeAvance", label: "Finir de réviser en avance grâce à une méthode", examples: ["POV : t'as terminé de réviser avec 3h d'avance"] }];
  const candidates: IdeaCandidate[] = [
    { text: "POV: tu as fini de réviser 5h plus tôt parce qu'un mec à 17 de moyenne t'a conseillé", videos: [member("a", "v1", 100, "x")] },
    { text: "Comment je me sens quand certains révisent 4h pour un 9", videos: [member("b", "v2", 50, "y")] },
    { text: "Et dire que certains passent 4h à réviser pour un 8", videos: [member("c", "v3", 70, "z")] },
  ];

  it("la demande nomme l'app, numérote idées connues et accroches, et ne livre aucun id de la base", () => {
    const p = ideaPrompt("Révisio", candidates, known);
    expect(p).toContain("App: Révisio");
    expect(p).toContain("I1: Finir de réviser en avance grâce à une méthode — examples: «POV : t'as terminé de réviser avec 3h d'avance»");
    expect(p).toContain("H2: «Comment je me sens quand certains révisent 4h pour un 9»");
    expect(p).not.toContain("ideeAvance");
    expect(p).not.toContain("v1");
    expect(ideaPrompt("Révisio", candidates, [])).toContain("(none yet)");
  });

  it("range chaque accroche : idée connue, nouvelle idée partagée par deux tournures", () => {
    const r = placeIdeas(
      { placements: [{ hook: "H1", idea: "I1" }, { hook: "h2", idea: "n1" }, { hook: "H3", idea: "N1" }], newIdeas: [{ id: "N1", label: "  Les autres révisent longtemps, moi non  " }] },
      candidates,
      known,
    );
    expect(r.placements).toEqual([
      { candidate: 0, idea: { known: "ideeAvance" } },
      { candidate: 1, idea: { ref: "N1" } },
      { candidate: 2, idea: { ref: "N1" } },
    ]);
    expect(r.newIdeas).toEqual([{ ref: "N1", label: "Les autres révisent longtemps, moi non" }]);
  });

  it("une accroche recopiée au lieu de son numéro est retrouvée par son texte, même coupé comme dans la demande", () => {
    const long = { text: `POV : ${"t'as fini de réviser très tôt ".repeat(8)}grâce à la méthode`, videos: [member("d", "v4", 1, "w")] };
    const all = [...candidates, long];
    const shownInPrompt = /H4: «([^»]+)»/.exec(ideaPrompt("Révisio", all, known))![1];
    expect(shownInPrompt.endsWith("…")).toBe(true);
    const r = placeIdeas(
      { placements: [{ hook: candidates[1].text.toUpperCase(), idea: "N1" }, { hook: "H3", idea: "N1" }, { hook: shownInPrompt, idea: "I1" }, { hook: "une accroche qu'on n'a pas demandée", idea: "I1" }], newIdeas: [{ id: "N1", label: "Idée" }] },
      all,
      known,
    );
    expect(r.placements.map((p) => p.idea)).toEqual([{ ref: "self:0" }, { ref: "N1" }, { ref: "N1" }, { known: "ideeAvance" }]);
    expect(ideaPrompt("Révisio", all, known)).toContain("never its text");
  });

  it("une réponse incomplète ou fausse ne perd aucune vidéo et ne range rien au hasard : l'accroche ouvre son idée", () => {
    const r = placeIdeas({ placements: [{ hook: "H1", idea: "I9" }, { hook: "H2", idea: "N4" }], newIdeas: [{ id: "N4", label: "" }] }, candidates, known);
    expect(r.placements.map((p) => p.idea)).toEqual([{ ref: "self:0" }, { ref: "self:1" }, { ref: "self:2" }]);
    // Étiquetée de son texte (80 caractères au plus).
    expect(r.newIdeas.map((f) => f.label.replace(/…$/, ""))).toEqual(candidates.map((c) => Array.from(c.text).slice(0, 79).join("").trimEnd()));
    expect(placeIdeas(null, candidates, known).placements).toHaveLength(3);
    expect(placeIdeas("pas du JSON", candidates, known).placements).toHaveLength(3);
  });

  it("les idées montrées au modèle : les plus reprises d'abord, puis les plus récentes", () => {
    const ideas = [
      { id: "petite", accountCount: 1, lastSeenAt: NOW },
      { id: "grande", accountCount: 9, lastSeenAt: NOW - 30 * DAY },
      { id: "moyenne", accountCount: 3, lastSeenAt: NOW - DAY },
      { id: "moyenneRecente", accountCount: 3, lastSeenAt: NOW },
    ];
    expect(knownForPrompt(ideas, 3).map((i) => i.id)).toEqual(["grande", "moyenneRecente", "moyenne"]);
  });

  it("les reprises montrées : la meilleure vidéo de chaque compte d'abord, sinon un compte prolifique cache les autres", () => {
    const all = [...Array.from({ length: 50 }, (_, i) => member("prolifique", `p${i}`, 10_000 + i, "x")), member("discret", "d1", 5, "x")];
    const ms = pickMembers(all);
    expect(ms).toHaveLength(IDEA_MEMBERS);
    expect(new Set(ms.map((m) => m.accountId))).toEqual(new Set(["prolifique", "discret"]));
    expect(ms[0].videoId).toBe("p49"); // par vues
  });

  it("une idée compte ses comptes sur toutes ses vidéos, et sa dernière reprise même si elle n'est pas montrée", () => {
    let idea = addToIdea(emptyIdea(), [member("a", "v1", 900, "POV : t'as fini de réviser en avance", NOW - 40 * DAY)]);
    expect(idea.accountCount).toBe(1);
    idea = addToIdea(idea, [member("b", "v2", 5, "tu as fini de réviser 5h plus tôt", NOW - 2 * DAY)]);
    // La même vidéo relue : ses vues changent, elle ne compte pas deux fois.
    idea = addToIdea(idea, [member("a", "v1", 1_300_000, "POV : t'as fini de réviser en avance", NOW - 40 * DAY)]);
    expect(idea.accountCount).toBe(2);
    expect(idea.videoIds).toEqual(["v1", "v2"]);
    expect(idea.members.map((m) => [m.videoId, m.views])).toEqual([["v1", 1_300_000], ["v2", 5]]);
    expect(idea.lastPostAt).toBe(NOW - 2 * DAY);
    expect(idea.examples[0]).toBe("POV : t'as fini de réviser en avance");
    // 45 vidéos très vues d'un compte, puis une reprise toute récente et peu vue d'un troisième : elle n'est pas parmi
    // les 40 montrées, mais elle compte (comptes, dernière reprise, vidéos couvertes).
    idea = addToIdea(idea, Array.from({ length: 45 }, (_, i) => member("a", `a${i}`, 50_000 + i, "variante", NOW - 30 * DAY)));
    idea = addToIdea(idea, [member("b", "recente", 1, "variante récente", NOW - 3_600_000)]);
    expect(idea.members).toHaveLength(IDEA_MEMBERS);
    expect(idea.members.some((m) => m.videoId === "recente")).toBe(false);
    expect(idea.lastPostAt).toBe(NOW - 3_600_000);
    expect(idea.videoIds).toContain("recente");
    // 45 comptes : 40 reprises montrées, 45 comptes comptés.
    const many = addToIdea(emptyIdea(), Array.from({ length: 45 }, (_, i) => member(`c${i}`, `c${i}`, 1_000 - i, "variante")));
    expect(many.members).toHaveLength(IDEA_MEMBERS);
    expect(many.accountCount).toBe(45);
  });

  it("le format d'une idée : deux comptes dont deux partagent une tournure, clé idee:<id>, avec toutes ses vidéos", () => {
    const one = addToIdea(emptyIdea(), [member("a", "v1", 10, "POV : t'as fini de réviser tôt"), member("a", "v2", 20, "Tu as fini d'étudier 5h plus tôt")]);
    expect(ideaFormat({ ...one, id: "i1", label: "Idée" }, NOW)).toBeNull(); // un seul compte
    // Deux comptes, mais aucune tournure commune : un thème que l'IA a rapproché, pas encore un format.
    const loose = addToIdea(one, [member("b", "v3", 30, "Grâce à cette méthode je révise moins")]);
    expect(ideaAnchor(loose.members)).toBe(1);
    expect(ideaFormat({ ...loose, id: "i1", label: "Idée" }, NOW)).toBeNull();
    // Un deuxième compte reprend une tournure du premier : le noyau est là, l'idée devient un format avec toutes ses vidéos.
    const two = addToIdea(loose, [member("c", "v4", 40, "pov: t'as fini de réviser 2h plus tôt")]);
    expect(ideaAnchor(two.members)).toBe(2);
    const f = ideaFormat({ ...two, id: "i1", label: "Idée" }, NOW)!;
    expect(f).toMatchObject({ kind: "hook", key: "idee:i1", label: "pov: t'as fini de réviser 2h plus tôt", accountCount: 3, maxViews: 40, videos: ["v1", "v2", "v3", "v4"] });
    expect(isIdeaKey(f.key)).toBe(true);
    expect(isIdeaKey("t as fini de")).toBe(false);
    expect(ideaFormatKey("x")).toBe("idee:x");
  });

  it("le nom d'une idée : l'accroche la plus vue de sa tournure la plus reprise, pas la plus vue tout court", () => {
    const ms = [
      member("a", "v1", 30_000, "Je note ma première année 🦷"),
      member("b", "v2", 7_000, "- Moyenne à 17/20 - Dors avant 22h - Pas de ChatGPT"),
      member("c", "v3", 4_000, "- moyenne à 18/20 - dors avant 23h - plus de ChatGPT"),
      member("d", "v4", 9_000, "• 18/20 de moyenne • dort à 21h • ne sort plus"),
    ];
    expect(ideaName(ms)).toBe("- Moyenne à 17/20 - Dors avant 22h - Pas de ChatGPT");
    expect(ideaName([member("a", "v1", 1, "ok")])).toBe("ok"); // aucune tournure lisible : la plus vue
    expect(ideaName([])).toBeNull();
  });

  it("la naissance d'un format d'idée : la première vidéo du deuxième compte, pas le jour où le Radar l'a rangée", () => {
    const ms = [
      { accountId: "a", publishedAt: NOW - 30 * DAY },
      { accountId: "a", publishedAt: NOW - 20 * DAY },
      { accountId: "b", publishedAt: NOW - 10 * DAY },
      { accountId: "c", publishedAt: NOW - DAY },
    ];
    expect(sharedSince(ms, NOW)).toBe(NOW - 10 * DAY);
    expect(sharedSince(ms.slice(0, 2), NOW)).toBe(NOW);
  });
});

// ─── Le rangement dans la base (convex/radar/radarIdeas) ─────────────────────

type Handler = { _handler: (ctx: unknown, args: unknown) => Promise<unknown> };
const handler = (f: unknown) => (f as Handler)._handler;

let seq = 0;
const id = (table: string) => `${table}_${String(++seq).padStart(6, "0")}`;

function monde() {
  const revisio: MemoryDoc = { _id: id("radarApps"), _creationTime: ++seq, slug: "revisio", name: "Révisio", status: "active", strong: ["revisio"], weak: [], context: [], searches: [], rivalOf: [], source: "manual", createdAt: 0 };
  const enPause: MemoryDoc = { ...revisio, _id: id("radarApps"), _creationTime: ++seq, slug: "pausee", name: "Pausée", status: "paused" };
  const compte = (handle: string, appId: string, status = "active"): MemoryDoc => ({
    _id: id("radarTracked"), _creationTime: ++seq, platform: "tiktok", handle, appId, status, matchedBy: "caption", fans: 1_000, videosSeen: 10, medianViews: 1_000,
    nextReadAt: NOW, readErrors: 0, addedAt: 0,
  });
  const accs = [compte("eleve.un", revisio._id), compte("eleve.deux", revisio._id), compte("eleve.trois", revisio._id), compte("eleve.partie", revisio._id, "paused"), compte("autre.app", enPause._id)];
  const video = (acc: MemoryDoc, videoId: string, extra: Record<string, unknown>): MemoryDoc => ({
    _id: id("radarTrackedVideos"), _creationTime: ++seq, accountId: acc._id, appId: acc.appId, videoId, publishedAt: NOW - 2 * DAY, views: 1_000,
    snapshots: [], lastSeenAt: NOW, ...extra,
  });
  const videos = [
    video(accs[0], "v1", { hook: "POV : t'as fini de réviser 3h plus tôt grâce à la fille à 17", views: 90_000, publishedAt: NOW - 40 * DAY }),
    video(accs[1], "v2", { hook: "pov: t'as fini de réviser 3h plus tôt grâce à la fille à 17" }), // même texte, autre compte
    video(accs[2], "v3", {}), // pas de texte TikTok : celui lu par l'IA
    video(accs[2], "v4", {}), // aucun texte du tout
    video(accs[3], "v5", { hook: "Un compte qui n'est plus suivi du tout" }),
    video(accs[4], "v6", { hook: "Une app en pause dans le Radar" }),
    video(accs[0], "v7", { hook: "Trop vieux pour une idée de ces 45 jours", publishedAt: NOW - IDEA_WINDOW_MS - DAY }),
  ];
  const tables: Record<string, MemoryDoc[]> = {
    radarApps: [revisio, enPause],
    radarTracked: accs,
    radarTrackedVideos: videos,
    videoAi: [{ _id: id("videoAi"), _creationTime: ++seq, videoId: "v3", done: true, text: "Tu as fini d'étudier 5h plus tôt\nparce qu'un mec à 17 t'a conseillé", tries: 1, at: NOW }],
    radarIdeas: [],
    radarIdeaQueue: [],
    radarFormats: [],
    radarSettings: [],
    radarSignals: [],
    radarAppCandidates: [],
    radarAccountJudgments: [],
    radarStoreApps: [],
  };
  return { tables, revisio, enPause, accs, videos };
}

const ctxOf = (tables: Record<string, MemoryDoc[]>) => {
  const mem = memoryDb(tables, { limit: null });
  return { mem, ctx: { db: mem.db, scheduler: { runAfter: async () => undefined, runAt: async () => undefined } } };
};
const rows = (mem: ReturnType<typeof memoryDb>, t: string) => (mem.db.query(t) as { collect: () => Promise<MemoryDoc[]> }).collect();

type Work = NonNullable<Awaited<ReturnType<typeof ideaWork._handler>>>;

describe("idées d'accroches : la file, l'appel, le rangement (radarIdeas)", () => {
  it("une vidéo neuve entre en file : elle attend 20 h les autres vidéos de son app (un jour sans texte TikTok, lecture IA d'abord), jamais au-delà de 45 jours", async () => {
    const w = monde();
    const { mem, ctx } = ctxOf(w.tables);
    await queueIdea(ctx as never, { videoId: "n1", appId: w.revisio._id as never, publishedAt: NOW - DAY, hook: "Une accroche qui dit quelque chose" }, NOW);
    await queueIdea(ctx as never, { videoId: "n2", appId: w.revisio._id as never, publishedAt: NOW - DAY }, NOW);
    await queueIdea(ctx as never, { videoId: "n3", appId: w.revisio._id as never, publishedAt: NOW - IDEA_WINDOW_MS - DAY, hook: "Trop vieille pour être rangée" }, NOW);
    const q = await rows(mem, "radarIdeaQueue");
    expect(q.map((r) => [r.videoId, r.dueAt])).toEqual([["n1", NOW + IDEA_GATHER_MS], ["n2", NOW + IDEA_AI_WAIT_MS]]);
  });

  it("un appel prend toutes les vidéos en file de son app, même pas encore dues : un appel par app et par jour, pas un par passage", async () => {
    const w = monde();
    const { ctx } = ctxOf(w.tables);
    const later = (videoId: string, at: number) => queueIdea(ctx as never, { videoId, appId: w.revisio._id as never, publishedAt: at, hook: "POV : une accroche en file" }, at + DAY);
    await later("v1", NOW - 2 * DAY); // due
    await later("v2", NOW - DAY - 2 * 3_600_000); // pas encore due
    const work = (await handler(ideaWork)(ctx, { now: NOW, skip: [] })) as Work;
    expect(work.candidates.flatMap((c) => c.videos.map((v) => v.videoId)).sort()).toEqual(["v1", "v2"]);
    // Aucune ligne due : aucun appel, même si l'app a des vidéos en file.
    const { ctx: ctx2 } = ctxOf(monde().tables);
    await queueIdea(ctx2 as never, { videoId: "v1", appId: w.revisio._id as never, publishedAt: NOW - DAY, hook: "POV : une accroche en file" }, NOW);
    expect(await handler(ideaWork)(ctx2, { now: NOW, skip: [] })).toBeNull();
  });

  it("le rattrapage met en file les vidéos des 45 derniers jours pas encore rangées, une page à la fois, puis s'arrête", async () => {
    const w = monde();
    w.tables.radarTrackedVideos[1].ideaId = "radarIdeas_deja";
    const { mem, ctx } = ctxOf(w.tables);
    const r1 = (await handler(ideaBackfillPage)(ctx, { now: NOW })) as { done: boolean; queued: number };
    expect(r1).toEqual({ done: true, queued: 5 }); // v1, v3, v4, v5, v6 ; v2 déjà rangée, v7 trop vieille
    expect(await handler(ideaBackfillPage)(ctx, { now: NOW })).toEqual({ done: true, queued: 0 });
    expect((await rows(mem, "radarIdeaQueue")).map((r) => r.videoId).sort()).toEqual(["v1", "v3", "v4", "v5", "v6"]);
    expect(IDEA_BACKFILL_PAGE).toBeGreaterThan(0);
  });

  it("un appel : les vidéos dues de l'app avec leur texte (TikTok ou IA), le même texte regroupé ; sans texte reprise plus tard ; compte parti, retirée", async () => {
    const w = monde();
    const { ctx } = ctxOf(w.tables);
    await handler(ideaBackfillPage)(ctx, { now: NOW });
    const work = (await handler(ideaWork)(ctx, { now: NOW, skip: [] })) as Work;
    expect(work.appId).toBe(w.revisio._id);
    expect(work.appName).toBe("Révisio");
    // Les plus anciennes d'abord ; v1 et v2 (même texte, deux comptes) font une seule accroche ; v3 par son texte lu
    // par l'IA (lignes recollées).
    expect(work.candidates.map((c) => [c.text, c.videos.map((v) => v.videoId)])).toEqual([
      ["POV : t'as fini de réviser 3h plus tôt grâce à la fille à 17", ["v1", "v2"]],
      ["Tu as fini d'étudier 5h plus tôt parce qu'un mec à 17 t'a conseillé", ["v3"]],
    ]);
    expect(work.candidates[0].videos.map((v) => v.handle)).toEqual(["eleve.un", "eleve.deux"]);
    expect(work.candidates[0].videos[0].multiplier).toBe(90);
    expect(work.place).toHaveLength(3);
    expect(work.retry.map((r) => r.tries)).toEqual([1]); // v4, sans texte
    expect(work.drop).toHaveLength(1); // v5, compte en pause
    expect(work.known).toEqual([]);
    // L'app suivante : celle en pause, dont les vidéos attendent (elle peut revenir), sans appel.
    const next = (await handler(ideaWork)(ctx, { now: NOW, skip: [w.revisio._id] })) as Work;
    expect(next.appId).toBe(w.enPause._id);
    expect(next.candidates).toEqual([]);
    expect(next.retry).toHaveLength(1);
  });

  it("un appel réunit IDEA_BATCH accroches au plus, même quand la plupart des lignes de la file sont sans texte ; la suite reste en file", async () => {
    const w = monde();
    const acc = w.accs[0];
    // Deux vidéos sur trois sans texte : 400 lignes pour 134 accroches.
    for (let i = 0; i < 400; i++) {
      const muette = i % 3 !== 0;
      w.tables.radarTrackedVideos.push({ _id: id("radarTrackedVideos"), _creationTime: ++seq, accountId: acc._id, appId: acc.appId, videoId: `m${i}`, publishedAt: NOW - 3 * DAY + i,
        views: 10, snapshots: [], lastSeenAt: NOW, ...(muette ? {} : { hook: `Accroche numéro ${"abcdefghijklmnopqrstuvwxyz"[i % 26]}${Math.floor(i / 26)} pour réviser` }) });
    }
    const { mem, ctx } = ctxOf(w.tables);
    await handler(ideaBackfillPage)(ctx, { now: NOW });
    const work = (await handler(ideaWork)(ctx, { now: NOW, skip: [] })) as Work;
    expect(work.candidates).toHaveLength(IDEA_BATCH);
    const queued = (await rows(mem, "radarIdeaQueue")).length;
    await handler(applyIdeas)(ctx, { now: NOW, appId: work.appId, ...groupsOf(work, null), place: work.place, retry: work.retry, drop: work.drop });
    // Les lignes rangées et celles sans texte (reprises plus tard) ont avancé ; les accroches au-delà de 100 attendent.
    const left = await rows(mem, "radarIdeaQueue");
    expect(left.length).toBeLessThan(queued);
    expect(left.filter((r) => r.dueAt === NOW).length).toBeGreaterThan(0);
  });

  it("le rangement : idées créées, vidéos reliées, format dès deux comptes, file avancée ; rejoué, rien ne compte deux fois", async () => {
    const w = monde();
    const { mem, ctx } = ctxOf(w.tables);
    await queueIdea(ctx as never, { videoId: "v1", appId: w.revisio._id as never, publishedAt: NOW - 40 * DAY, hook: "POV : une accroche en file" }, NOW - IDEA_GATHER_MS);
    await queueIdea(ctx as never, { videoId: "v2", appId: w.revisio._id as never, publishedAt: NOW - 2 * DAY, hook: "POV : une accroche en file" }, NOW - IDEA_GATHER_MS);
    const work = (await handler(ideaWork)(ctx, { now: NOW, skip: [] })) as Work;
    // v1 et v2 ont le même texte : une accroche ; le modèle ouvre une idée.
    expect(work.candidates).toHaveLength(1);
    const answer = { placements: [{ hook: "H1", idea: "N1" }], newIdeas: [{ id: "N1", label: "Finir de réviser en avance" }] };
    const args = { now: NOW, appId: work.appId, ...groupsOf(work, answer), place: work.place, retry: work.retry, drop: work.drop };
    expect(await handler(applyIdeas)(ctx, args)).toEqual({ placed: 2, ideas: 1 });
    const [idea] = await rows(mem, "radarIdeas");
    expect(idea).toMatchObject({ label: "Finir de réviser en avance", accountCount: 2, videoIds: ["v1", "v2"], lastPostAt: NOW - 2 * DAY });
    const videos = await rows(mem, "radarTrackedVideos");
    expect(videos.filter((v) => v.ideaId === idea._id).map((v) => v.videoId)).toEqual(["v1", "v2"]);
    const [format] = await rows(mem, "radarFormats");
    expect(format).toMatchObject({ kind: "hook", key: `idee:${idea._id}`, accountCount: 2, maxViews: 90_000, videos: ["v1", "v2"], firstSeenAt: NOW - 2 * DAY });
    expect(idea.formatId).toBe(format._id);
    expect(await rows(mem, "radarIdeaQueue")).toEqual([]);
    // Le même appel rejoué (deux passages en même temps) : les vidéos déjà rangées ne le sont pas deux fois.
    expect(await handler(applyIdeas)(ctx, { ...args, newIdeas: [], groups: [{ known: idea._id, members: args.groups[0].members }], place: [] })).toEqual({ placed: 0, ideas: 0 });
    expect((await rows(mem, "radarIdeas"))[0].videoIds).toEqual(["v1", "v2"]);
    expect(await rows(mem, "radarFormats")).toHaveLength(1);
  });

  it("une idée d'un seul compte n'a pas de format ; un appel raté reprend ses vidéos un jour plus tard, puis les lâche", async () => {
    const w = monde();
    const { mem, ctx } = ctxOf(w.tables);
    await queueIdea(ctx as never, { videoId: "v1", appId: w.revisio._id as never, publishedAt: NOW - 40 * DAY, hook: "POV : une accroche en file" }, NOW - IDEA_GATHER_MS);
    const work = (await handler(ideaWork)(ctx, { now: NOW, skip: [] })) as Work;
    await handler(applyIdeas)(ctx, { now: NOW, appId: work.appId, ...groupsOf(work, null), place: work.place, retry: [], drop: [] });
    expect((await rows(mem, "radarIdeas"))[0]).toMatchObject({ accountCount: 1 });
    expect(await rows(mem, "radarFormats")).toEqual([]);

    await queueIdea(ctx as never, { videoId: "v2", appId: w.revisio._id as never, publishedAt: NOW - DAY, hook: "POV : une accroche en file" }, NOW - IDEA_GATHER_MS);
    for (let i = 1; i <= IDEA_MAX_TRIES; i++) {
      const due = (await rows(mem, "radarIdeaQueue")).map((r) => r._id);
      if (!due.length) break;
      await handler(applyIdeas)(ctx, { now: NOW, appId: w.revisio._id, groups: [], newIdeas: [], place: [], retry: [], drop: [], fail: due });
      const left = await rows(mem, "radarIdeaQueue");
      if (i < IDEA_MAX_TRIES) expect(left.map((r) => [r.tries, r.dueAt])).toEqual([[i, NOW + IDEA_AI_WAIT_MS]]);
      else expect(left).toEqual([]);
    }
  });

  it("le relevé d'un compte : sa vidéo neuve entre en file, celle déjà rangée tient sa reprise à jour dans l'idée et son format", async () => {
    const w = monde();
    const { mem, ctx } = ctxOf(w.tables);
    // v2 (eleve.deux) et v1 (eleve.un) rangées dans une idée à deux comptes.
    for (const [videoId, at] of [["v1", NOW - 40 * DAY], ["v2", NOW - 2 * DAY]] as const) await queueIdea(ctx as never, { videoId, appId: w.revisio._id as never, publishedAt: at, hook: "POV : une accroche en file" }, NOW - IDEA_GATHER_MS);
    const work = (await handler(ideaWork)(ctx, { now: NOW, skip: [] })) as Work;
    await handler(applyIdeas)(ctx, { now: NOW, appId: work.appId, ...groupsOf(work, { placements: [{ hook: "H1", idea: "N1" }], newIdeas: [{ id: "N1", label: "Idée" }] }), place: work.place, retry: [], drop: [] });
    const input = (videoId: string, views: number, extra: Record<string, unknown> = {}) => ({
      videoId, url: `https://www.tiktok.com/@eleve.deux/video/${videoId}`, authorId: "auteur2", authorHandle: "eleve.deux", authorFans: 1_000, caption: "révisio", lang: "fr",
      publishedAt: NOW - 2 * DAY, isAd: false, views, likes: 0, comments: 0, shares: 0, saves: 0, ...extra,
    });
    await handler(applyAccountRead)(ctx, {
      accountId: w.accs[1]._id,
      videos: [input("v2", 250_000), input("neuve", 10, { hook: "Une accroche toute neuve à ranger", publishedAt: NOW - 3_600_000 })],
      now: NOW + 1,
    });
    const idea = (await rows(mem, "radarIdeas"))[0];
    // Les vues relues ; le texte rangé reste celui de l'idée.
    expect((idea.members as IdeaMember[]).find((m) => m.videoId === "v2")).toMatchObject({ views: 250_000, hook: "pov: t'as fini de réviser 3h plus tôt grâce à la fille à 17" });
    const format = (await rows(mem, "radarFormats")).find((f) => f.key === `idee:${idea._id}`)!;
    expect(format.maxViews).toBe(250_000);
    expect((await rows(mem, "radarIdeaQueue")).map((r) => [r.videoId, r.dueAt])).toEqual([["neuve", NOW + 1 + IDEA_GATHER_MS]]);
  });

  it("l'export vers Kopycat : le format d'une idée part avec ses vidéos et sa dernière reprise, même hors de ses reprises montrées", async () => {
    const w = monde();
    const [a, b] = w.accs;
    const m = (acc: MemoryDoc, videoId: string, publishedAt: number) => ({ accountId: acc._id, handle: acc.handle, appId: acc.appId, videoId, publishedAt, views: 10 });
    w.tables.radarFormats.push(
      { _id: id("radarFormats"), _creationTime: ++seq, kind: "hook", key: "idee:i1", label: "Idée", members: [m(a, "v1", NOW - 9 * DAY), m(b, "v2", NOW - 8 * DAY)], accountCount: 2,
        appIds: [a.appId], maxViews: 10, lastPostAt: NOW - DAY, firstSeenAt: NOW - 8 * DAY, videos: ["v1", "v2", "v9"] },
      { _id: id("radarFormats"), _creationTime: ++seq, kind: "hook", key: "t as fini de", label: "Gabarit", members: [m(a, "v1", NOW - 9 * DAY), m(b, "v2", NOW - 8 * DAY)], accountCount: 2,
        appIds: [a.appId], maxViews: 10, lastPostAt: NOW - DAY, firstSeenAt: NOW - 8 * DAY },
    );
    const { ctx } = ctxOf(w.tables);
    const page = (await exportPage(ctx as never, "formats", null)) as { rows: Record<string, unknown>[] };
    const [idee, gabarit] = page.rows;
    expect(idee).toMatchObject({ key: "idee:i1", videos: ["v1", "v2", "v9"], lastPostAt: NOW - DAY });
    // Un format de gabarit : sa dernière reprise reste celle de ses reprises, rien d'autre ne part.
    expect(gabarit.lastPostAt).toBe(NOW - 8 * DAY);
    expect("videos" in gabarit).toBe(false);
  });
});
