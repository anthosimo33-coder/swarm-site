import { afterEach, describe, expect, it, vi } from "vitest";
import type { Id } from "../../convex/_generated/dataModel";
import { DAYS } from "../../convex/radarModels";
import { accountProof, PROOF_FRESH_MS, staleLink, staleVideoProof, vetOutcome, type DatedText } from "../../convex/radar/radarVetMath";
import { applyAccountRead, rejudgePaused } from "../../convex/radar/radarNetworks";
import { exportPage } from "../../convex/radar/swarmExportPage";
import { memoryDb, type MemoryDoc } from "./convex-memory-db";

/**
 * Radar — l'âge d'une preuve par vidéos (24/11/2026). Le fondateur, devant une créatrice de recettes que
 * Kopycat montrait sous Solaia : « ses vidéos ne poussent pas Solaia ». Elles l'ont poussée, six fois du 20/09 au 09/10 ;
 * depuis, cinq vidéos de cuisine jusqu'au 18/11, sans la nommer. Le compte ci-dessous a sa forme : quinze vidéos rangées,
 * dans le même ordre et aux mêmes semaines, six qui citent l'app sur trois semaines puis cinq qui n'en parlent plus —
 * pseudo, légendes et heures inventés (le dépôt est public, cf scripts/fixtures-publiques.mjs).
 */
const DAY = 86_400_000;
const T = (iso: string) => Date.parse(iso);
const SOLAIA = { strong: ["solaia"] };
/** Le 24/11/2026 : la prod que le fondateur regardait. */
const NOW = T("2026-11-24T00:00:00Z");
/** Le 13/11/2026, quand le compte est entré sous Solaia. */
const ENTRY = T("2026-11-13T19:00:00Z");

const CAMPAGNE_FINIE: DatedText[] = [
  { at: T("2026-11-18T18:00:00Z"), text: "Ma recette du soir au Cookéo, prête en 20 min #cookeo #recette #recetterapide" },
  { at: T("2026-11-17T13:00:00Z"), text: "Ce que je mange en une journée ✨ code promo -20% sur tout le site" },
  { at: T("2026-11-12T09:00:00Z"), text: "Recette airfryer du goûter #recettesimple #airfryer POV : ton goûter en 15 min" },
  { at: T("2026-10-31T13:00:00Z"), text: "Recette rapide et facile au Cookéo, un plat mijoté en moins de 15 min" },
  { at: T("2026-10-09T07:00:00Z"), text: "Dites moi si vous voulez la recette 🍂 #automne" },
  { at: T("2026-10-09T06:00:00Z"), text: "Mon astuce pour manger plus de légumes. J'utilise l'app Solaia pour scanner mes repas 📱 #recettesimple" },
  { at: T("2026-10-07T12:00:00Z"), text: "Une salade prête en 10 min, scannée avec l'app Solaia ✨" },
  { at: T("2026-10-06T06:00:00Z"), text: "Lasagnes à l'airfryer ✨ l'appli que j'utilise c'est Solaia 📱" },
  { at: T("2026-10-01T20:00:00Z"), text: "Une journée dans mon assiette ✨ -20% avec mon code #whatieatinaday" },
  { at: T("2026-09-30T08:00:00Z"), text: "Mon snack préféré, scanné sur Solaia ✨ #snack" },
  { at: T("2026-09-25T09:00:00Z"), text: "Ce que j'achète et ce que je n'achète plus, épisode 1. Je me sers de Solaia ✨" },
  { at: T("2026-09-20T16:00:00Z"), text: "Le gâteau aux pommes de dimanche ⬇️ L'application où je scanne mes recettes : Solaia ✨" },
  { at: T("2026-09-06T14:00:00Z"), text: "Courge rôtie au four, 25 min à 200 degrés" },
  { at: T("2026-01-15T16:00:00Z"), text: "5/7 recettes à l'airfryer : des biscuits" },
  { at: T("2025-11-12T16:00:00Z"), text: "Un an déjà 🥹 merci d'être là" },
];
/** Sa dernière vidéo qui cite Solaia. */
const LAST_CITE = T("2026-10-09T06:00:00Z");
/** Sa bio : ni l'app, ni rien qui la nomme. */
const BIO = "Des recettes au Cookéo et à l'airfryer, prêtes en moins de 30 min ✨";

describe("Radar — une preuve par vidéos a un âge", () => {
  it("42 jours : la fenêtre la plus longue que Kopycat montre d'une app (radarModels.DAYS)", () => {
    expect(PROOF_FRESH_MS).toBe(42 * DAY);
    expect(PROOF_FRESH_MS).toBe(DAYS * DAY);
  });

  it("un compte de recettes : prouvé par ses vidéos, mais plus le 24/11 — il a publié cinq fois depuis sans nommer Solaia", () => {
    const texts = CAMPAGNE_FINIE.map((v) => v.text);
    // La règle des deux vidéos la prouve sur ses douze dernières comme sur ses trente : six citent Solaia.
    expect(accountProof("compte_cuisine", BIO, texts.slice(0, 12), SOLAIA)).toBe("videos");
    expect(staleVideoProof(CAMPAGNE_FINIE, SOLAIA, "Solaia", NOW)).toBe(true);
    // Le 13/11, quand il est entré, sa dernière vidéo Solaia avait 35 jours : la preuve tenait.
    expect(staleVideoProof(CAMPAGNE_FINIE, SOLAIA, "Solaia", ENTRY)).toBe(false);
  });

  it("la limite est à 42 jours pile après la dernière vidéo qui cite l'app", () => {
    expect(staleVideoProof(CAMPAGNE_FINIE, SOLAIA, "Solaia", LAST_CITE + PROOF_FRESH_MS)).toBe(false);
    expect(staleVideoProof(CAMPAGNE_FINIE, SOLAIA, "Solaia", LAST_CITE + PROOF_FRESH_MS + 1)).toBe(true);
  });

  it("un compte qui ne publie plus garde sa preuve : sa dernière vidéo est celle qui cite l'app", () => {
    const dormant = CAMPAGNE_FINIE.slice(5);
    expect(dormant[0].at).toBe(LAST_CITE);
    expect(staleVideoProof(dormant, SOLAIA, "Solaia", NOW)).toBe(false);
  });

  it("un compte qui nomme encore l'app la pousse encore, même quand ses motifs ne reconnaissent pas la tournure", () => {
    // faithmode (motif « faithmode.app ») : une créatrice écrit aussi « Search "Faith Mode" on the App Store ».
    const FAITH = { strong: ["faithmode.app"] };
    const cite = { at: T("2026-08-01T05:35:00Z"), text: 'Download Faith Mode free — App Store or Google "faithmode.app" #faithmode' };
    const encore = { at: T("2026-11-20T05:40:00Z"), text: 'Search "Faith Mode" on the App Store. Takes 10 seconds #faithtok #christiangirl' };
    const autre = { at: T("2026-11-19T05:40:00Z"), text: "Morning routine with Jesus 🕊️ #faithtok #christiangirl" };
    const autre2 = { at: T("2026-11-18T05:40:00Z"), text: "Psalm 23 before coffee ☕️ #christiantiktok #godisreal" };
    expect(staleVideoProof([encore, autre, cite], FAITH, "faithmode", NOW)).toBe(false);
    expect(staleVideoProof([autre, autre2, cite], FAITH, "faithmode", NOW)).toBe(true);
  });

  it("un nom de moins de 4 lettres ne garde personne : « aro » est dans trop de mots", () => {
    const ARO = { strong: ["aroapp"] };
    const cite = { at: T("2026-08-01T12:00:00Z"), text: "Predict height with the ARO app #aroapp" };
    const apres = { at: T("2026-11-20T12:00:00Z"), text: "Pedir comida gostosa e ainda economizar? Eu amo! #cupom #aroma" };
    const apres2 = { at: T("2026-11-19T12:00:00Z"), text: "POV: 179cm in 🇳🇱 #height #taller" };
    expect(staleVideoProof([apres, apres2, cite], ARO, "Aro", NOW)).toBe(true);
  });

  it("une seule vidéo depuis ne suffit pas à dire qu'il ne la pousse plus ; une vidéo sans texte ne dit rien", () => {
    // Un compte ColdTrace (jeu d'enquête) : sa vidéo d'après décrit encore le jeu, sans le nommer.
    const COLD = { strong: ["coldtrace"] };
    const cite = { at: T("2026-10-11T14:27:00Z"), text: "I need chapter 8 immediately #detective #mysterygame @coldtrace_app #games" };
    const encore = { at: T("2026-10-12T10:57:00Z"), text: "plot twist sending this to the group chat 😭 #detective #mysterygame My new obsession: having to stalk a missing girl" };
    const vide = { at: T("2026-11-02T12:28:00Z"), text: " " };
    const ailleurs = { at: T("2026-11-03T12:28:00Z"), text: "Sunday reset vlog 🧺 #sundayreset" };
    expect(staleVideoProof([encore, cite], COLD, "ColdTrace", NOW)).toBe(false);
    expect(staleVideoProof([vide, encore, cite], COLD, "ColdTrace", NOW)).toBe(false);
    // Deux vidéos avec du texte, aucune ne nomme le jeu : périmée.
    expect(staleVideoProof([ailleurs, vide, encore, cite], COLD, "ColdTrace", NOW)).toBe(true);
  });

  it("aucune vidéo qui cite l'app : rien à périmer, la preuve manque (elle se juge ailleurs)", () => {
    expect(staleVideoProof(CAMPAGNE_FINIE.slice(0, 5), SOLAIA, "Solaia", NOW)).toBe(false);
    expect(staleVideoProof([], SOLAIA, "Solaia", NOW)).toBe(false);
  });
});

describe("Radar — filtre d'entrée : une preuve périmée n'entre pas", () => {
  /** Sa page publique : ses dernières vidéos, avec l'identifiant TikTok qui porte leur date. */
  const page = (videos: DatedText[], bio = "") => ({
    ok: true as const,
    text: `<html><script>window.__d={"userInfo":${JSON.stringify({ uniqueId: "x", followerCount: 90_000, signature: bio, privateAccount: false })},"videoList":${JSON.stringify(
      videos.map((v, i) => ({ id: String((BigInt(Math.floor(v.at / 1000)) << BigInt(32)) + BigInt(i + 1)), desc: v.text, playCount: 9_000 })),
    )}}</script></html>`,
  });
  const douze = CAMPAGNE_FINIE.slice(0, 12);

  it("le 24/11, ses douze dernières vidéos ne le font plus entrer ; le 13/11, elles le faisaient entrer", () => {
    expect(vetOutcome(page(douze), "compte_cuisine", SOLAIA, { name: "Solaia", now: NOW })).toEqual({ kind: "unproven", why: "stale" });
    expect(vetOutcome(page(douze), "compte_cuisine", SOLAIA, { name: "Solaia", now: ENTRY })).toMatchObject({ kind: "proven", proof: "videos" });
  });

  it("une bio qui nomme l'app prouve toujours : elle dit ce qu'il fait aujourd'hui", () => {
    expect(vetOutcome(page(douze, "J'utilise Solaia pour mes courses 🛒"), "compte_cuisine", SOLAIA, { name: "Solaia", now: NOW })).toMatchObject({ kind: "proven", proof: "bio" });
  });
});

// ─── L'export vers Kopycat ───────────────────────────────────────────────────

let seq = 0;
const nid = (table: string) => `${table}_${String(++seq).padStart(6, "0")}`;

function monde() {
  const solaia: MemoryDoc = {
    _id: nid("radarApps"), _creationTime: ++seq, slug: "solaia", name: "Solaia", rivalOf: [], strong: ["solaia"], weak: [], context: [],
    searches: ["solaia", "#solaia"], status: "active", source: "manual", createdAt: T("2026-11-13T13:00:00Z"), trackedCount: 3,
  };
  const suivi = (handle: string, extra: Record<string, unknown> = {}): MemoryDoc => ({
    _id: nid("radarTracked"), _creationTime: ++seq, platform: "tiktok", handle, appId: solaia._id, status: "active", matchedBy: "caption",
    fans: 90_000, videosSeen: 15, nextReadAt: NOW + DAY, readErrors: 0, addedAt: T("2026-11-13T13:00:00Z"), proofAt: ENTRY, readAt: T("2026-11-22T12:00:00Z"),
    bio: BIO, ...extra,
  });
  // Le compte du fondateur, sous sa forme : relu « pousse » le 15/11, preuve par vidéos périmée le 24/11.
  const fini = suivi("compte_fini");
  // Mêmes vidéos, mais sa bio nomme l'app : la preuve par la bio ne s'use pas.
  const bio = suivi("compte_bio", { bio: "J'utilise @SOLAIA ⭐️" });
  // Relu « pousse » sans qu'aucune de ses vidéos rangées ne nomme Solaia (il en parle à l'oral) : rien à périmer.
  const oral = suivi("compte_oral");
  const videos: MemoryDoc[] = [];
  const ranger = (acc: MemoryDoc, list: DatedText[]) =>
    list.forEach((v, i) =>
      videos.push({
        _id: nid("radarTrackedVideos"), _creationTime: ++seq, accountId: acc._id, appId: solaia._id, videoId: `${acc.handle}-${i}`, publishedAt: v.at,
        views: 9_000, snapshots: [{ at: T("2026-11-22T12:00:00Z"), views: 9_000 }], lastSeenAt: T("2026-11-22T12:00:00Z"), caption: v.text,
      }),
    );
  ranger(fini, CAMPAGNE_FINIE);
  ranger(bio, CAMPAGNE_FINIE);
  ranger(oral, CAMPAGNE_FINIE.slice(0, 5));
  // Un verdict relu « pousse » (radarJudgeReview), tel qu'appliqué en prod le 15/11 : il pousse aussi une autre marque.
  const relu = (acc: MemoryDoc, cites: number, of: number): MemoryDoc => ({
    _id: nid("radarAccountJudgments"), _creationTime: ++seq, accountId: acc._id, appId: solaia._id, handle: acc.handle, weak: "videos_minoritaires",
    proof: { by: "videos", cites, of }, verdict: "pousse", other: "Autre marque", why: "Six vidéos citent Solaia comme application utilisée pour scanner les repas.",
    at: T("2026-11-15T10:00:00Z"), v: 3, applied: "note", appliedAt: T("2026-11-15T15:00:00Z"), reviewed: "pousse", reviewedOther: "Autre marque",
  });
  const tables: Record<string, MemoryDoc[]> = {
    radarApps: [solaia],
    radarTracked: [fini, bio, oral],
    radarTrackedVideos: videos,
    radarAccountJudgments: [relu(fini, 6, 13), relu(oral, 0, 5)],
    radarSignals: [],
    radarFormats: [],
  };
  return { tables, solaia };
}

async function statuts(now: number) {
  const w = monde();
  const mem = memoryDb(w.tables, { limit: null });
  const r = await exportPage({ db: mem.db } as never, "tracked", null, [w.solaia._id as Id<"radarApps">], now);
  return Object.fromEntries((r.rows as { handle: string; status: string }[]).map((x) => [x.handle, x.status]));
}

describe("Export vers Kopycat : un compte dont la preuve par vidéos est périmée ne pousse plus l'app", () => {
  it("le 24/11, le compte de la campagne finie part en pause, même relu « pousse » ; la bio et le « pousse » sans vidéo restent", async () => {
    expect(await statuts(NOW)).toEqual({ compte_fini: "paused", compte_bio: "active", compte_oral: "active" });
  });

  it("le 13/11, les mêmes données le montraient sous Solaia", async () => {
    expect(await statuts(ENTRY)).toEqual({ compte_fini: "active", compte_bio: "active", compte_oral: "active" });
  });
});

// ─── Le Radar : plus relevé (« arrêt complet », 24/11/2026) ──────────────────

type Handler = { _handler: (ctx: unknown, args: unknown) => Promise<unknown> };
const run = (f: unknown, ctx: unknown, args: unknown) => (f as Handler)._handler(ctx, args);
const ctxOf = (tables: Record<string, MemoryDoc[]>) => {
  const mem = memoryDb({ radarSettings: [], radarIdeaQueue: [], radarRejected: [], ...tables }, { limit: null });
  return { mem, ctx: { db: mem.db, scheduler: { runAfter: async () => undefined, runAt: async () => undefined } } };
};
const compte = async (mem: ReturnType<typeof memoryDb>, handle: string) =>
  ((await (mem.db.query("radarTracked") as { collect: () => Promise<MemoryDoc[]> }).collect()).find((t) => t.handle === handle))!;
/** Son relevé gratuit du jour : seules les vues de ses vidéos déjà rangées sont relues. */
const releve = async (ctx: unknown, acc: MemoryDoc, now: number) =>
  run(applyAccountRead, ctx, { accountId: acc._id, videos: [], light: [{ videoId: `${acc.handle}-0`, views: 9_500 }], now });

describe("Radar : un compte dont la preuve par vidéos est périmée n'est plus relevé", () => {
  afterEach(() => vi.useRealTimers());

  it("staleLink : périmée le 24/11, pas le 13/11 ; la bio, l'ajout à la main, la liste de départ et le placement payé ne s'usent pas", () => {
    const recent = CAMPAGNE_FINIE.map((v) => ({ caption: v.text, publishedAt: v.at }));
    const app = { ...SOLAIA, name: "Solaia" };
    const acc = { handle: "compte_fini", bio: BIO, matchedBy: "caption" as const };
    expect(staleLink(acc, app, recent, NOW)).toBe(true);
    expect(staleLink(acc, app, recent, ENTRY)).toBe(false);
    expect(staleLink({ ...acc, bio: "J'utilise @SOLAIA ⭐️" }, app, recent, NOW)).toBe(false);
    expect(staleLink({ ...acc, matchedBy: "manual" }, app, recent, NOW)).toBe(false);
    expect(staleLink({ ...acc, matchedBy: "seed" }, app, recent, NOW)).toBe(false);
    expect(staleLink({ ...acc, placement: true }, app, recent, NOW)).toBe(false);
    // Ses Reels Instagram ne comptent pas : la preuve se lit sur TikTok, comme dans l'export.
    expect(staleLink(acc, app, recent.map((r) => ({ ...r, platform: "instagram" })), NOW)).toBe(false);
  });

  it("à son relevé du 24/11, le compte de la campagne finie passe en pause « hors sujet » : plus aucun relevé ; celui dont la bio nomme l'app reste", async () => {
    const w = monde();
    const { mem, ctx } = ctxOf(w.tables);
    await releve(ctx, await compte(mem, "compte_fini"), NOW);
    await releve(ctx, await compte(mem, "compte_bio"), NOW);
    expect(await compte(mem, "compte_fini")).toMatchObject({ status: "paused", pausedReason: "offTopic" });
    expect(await compte(mem, "compte_bio")).toMatchObject({ status: "active" });
  });

  it("le 13/11, le même relevé le gardait actif ; remis à la main (keptByHand) ou en placement payé, il n'est jamais mis en pause pour ça", async () => {
    const w = monde();
    const { mem, ctx } = ctxOf(w.tables);
    await releve(ctx, await compte(mem, "compte_fini"), ENTRY);
    expect(await compte(mem, "compte_fini")).toMatchObject({ status: "active" });
    for (const extra of [{ keptByHand: true }, { placement: true }]) {
      const v = monde();
      Object.assign(v.tables.radarTracked.find((t) => t.handle === "compte_fini")!, extra);
      const x = ctxOf(v.tables);
      await releve(x.ctx, await compte(x.mem, "compte_fini"), NOW);
      expect(await compte(x.mem, "compte_fini")).toMatchObject({ status: "active" });
    }
  });

  // 30 s : le rejugement aligne d'abord les apps et les comptes de départ (radarSignals.ensureSeedApps, des centaines de
  // lignes) ; 2,9 s en local pour ses deux passages, plus de 5 s sur la machine de la CI (24/11/2026).
  it("en pause, le rejugement ne le relance pas le 24/11 : ses vieilles vidéos Solaia sont toujours rangées (le 13/11, il l'aurait relancé)", async () => {
    for (const [at, want] of [[NOW, "paused"], [ENTRY, "active"]] as const) {
      const w = monde();
      Object.assign(w.tables.radarTracked.find((t) => t.handle === "compte_fini")!, { status: "paused", pausedReason: "offTopic" });
      const { mem, ctx } = ctxOf(w.tables);
      vi.useFakeTimers({ toFake: ["Date"] }); // seule l'heure : le rejugement la lit par Date.now()
      vi.setSystemTime(at);
      await run(rejudgePaused, ctx, {});
      vi.useRealTimers();
      expect((await compte(mem, "compte_fini")).status).toBe(want);
    }
  }, 30_000);
});
