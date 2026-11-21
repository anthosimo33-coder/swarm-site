import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  CREDIT_RESERVE,
  DEFAULT_BUDGET,
  SC_PRICE_PER_CREDIT,
  TH_PRICE_USD,
  allowance,
  allowanceParts,
  budgetState,
  catchUpAllowance,
  envelopeUsd,
  monthLeftUnits,
  nextSpentLots,
  recentPerDay,
  scPerDay,
  spentOf,
  TH_SPENT_LOTS_MAX,
  thPerDay,
  thUnits,
  tierOf,
  type Balance,
  type BudgetSettings,
  type ThBalance,
  type UsageRow,
} from "../../convex/radar/radarSignalsMath";

/**
 * Le budget à deux fournisseurs (bascule TikHub, 20/11/2026) : chaque poste se juge sur le solde, le palier et le prix
 * du fournisseur qui le sert ; les quantités restent des nombres d'appels (une unité = un crédit ScrapeCreators = un
 * appel TikHub à 0,001 $) ; le plafond en dollars reste commun.
 */

const NOW = Date.parse("2026-11-20T12:00:00Z");
const d = DEFAULT_BUDGET;
const sc = (remaining: number, perDay: number | null = null): Balance => ({ remaining, seenAt: NOW - 60_000, now: NOW, perDay });
const th = (paidUsd: number, freeUsd = 0, spentSinceUsd = 0, perDay: number | null = null): ThBalance => ({ paidUsd, freeUsd, seenAt: NOW - 30_000, spentSinceUsd, now: NOW, perDay });
const tiktokChezTikHub = { providers: { tiktok: "tikhub" as const, curve: "tikhub" as const, network: "tikhub" as const, search: "tikhub" as const } };

describe("unités", () => {
  it("5,4 $ font 5 400 unités ; un millième de dollar en dessous n'en fait pas une de plus", () => {
    expect(thUnits(5.4)).toBe(5_400);
    expect(thUnits(5.076)).toBe(5_076);
    expect(thUnits(0.0009)).toBe(0);
    expect(thUnits(0.001)).toBe(1);
  });
});

describe("poste servi par TikHub", () => {
  it("son enveloppe est au prix TikHub ; l'écran garde le prix ScrapeCreators", () => {
    const st = budgetState(d, [], null, tiktokChezTikHub);
    expect(st.byPoste.tiktok.envelopeUsd).toBeCloseTo(9_000 * 30 * TH_PRICE_USD, 9);
    expect(envelopeUsd(d, "tiktok")).toBeCloseTo(9_000 * 30 * SC_PRICE_PER_CREDIT, 9);
    expect(st.byPoste.insta.envelopeUsd).toBeCloseTo(300 * 30 * SC_PRICE_PER_CREDIT, 9);
  });

  it("la dépense compte les dollars TikHub et les appels à facturation inconnue au prix plein", () => {
    const usage: UsageRow[] = [
      { poste: "tiktok", credits: 10, day: "2026-11-19" },
      { poste: "tiktok", credits: 0, thCalls: 300, thUsd: 0.27, thUnknown: 4, day: "2026-11-20" },
    ];
    const st = budgetState(d, usage, null, tiktokChezTikHub);
    expect(st.spentUsd).toBeCloseTo(10 * SC_PRICE_PER_CREDIT + 0.27 + 4 * TH_PRICE_USD, 12);
    expect(st.byPoste.tiktok.usd).toBeCloseTo(10 * SC_PRICE_PER_CREDIT + 0.27 + 0.004, 12);
    expect(st.byPoste.tiktok.credits).toBe(10);
    expect(st.byPoste.tiktok.units).toBe(314);
    expect(st.spentCredits).toBe(10);
  });

  it("le reste du jour et du mois comptent les appels TikHub (facturés et inconnus)", () => {
    // 300 par jour : 9 000 × 30 ÷ 30. La part d'un passage (24 par jour) : 375.
    const usage: UsageRow[] = [{ poste: "tiktok", credits: 5, thCalls: 8_000, thUnknown: 990, day: "2026-11-20" }];
    const st = budgetState(d, usage, null, tiktokChezTikHub);
    expect(allowanceParts(d, st, "tiktok", 8_995, 24).units).toBe(5);
    // Le mois : 270 000 − 8 995.
    const mois = budgetState(d, [{ poste: "network", credits: 1_000, thCalls: 98_000, thUnknown: 500, day: "2026-11-02" }], null, tiktokChezTikHub);
    expect(catchUpAllowance(d, mois, "network", "tikhub")).toBe(100_000 - 99_500);
  });

  it("le solde TikHub borne en unités : payé seul pour les relevés de profil, payé + gratuit ailleurs, moins la dépense depuis la lecture", () => {
    const st = budgetState(d, [], null, { ...tiktokChezTikHub, th: th(0.2, 0.05, 0.03) });
    expect(st.th.paidLeft).toBe(170);
    expect(st.th.allLeft).toBe(220);
    expect(allowance(d, st, "tiktok", 0, 1, "tikhub")).toBe(170);
    expect(allowance(d, st, "search", 0, 1, "tikhub")).toBe(150);
    expect(allowance(d, st, "network", 0, 1, "tikhub")).toBe(220);
    // Le solde ScrapeCreators ne borne pas TikHub, ni l'inverse.
    const deux = budgetState(d, [], sc(CREDIT_RESERVE + 50), { ...tiktokChezTikHub, th: th(5.4) });
    expect(allowance(d, deux, "network", 0, 1, "sc")).toBe(50);
    expect(allowance(d, deux, "network", 0, 1, "tikhub")).toBe(3_333);
    expect(allowanceParts(d, deux, "network", 0, 1).balance).toEqual({ sc: 50, tikhub: 5_400 });
  });

  it("le plafond restant se paie au prix du fournisseur", () => {
    const serre = { ...d, capUsd: 1 };
    const st = budgetState(serre, [{ poste: "tiktok", credits: 0, thCalls: 1, thUsd: 0.5, day: "2026-11-20" }], null, tiktokChezTikHub);
    expect(allowance(serre, st, "tiktok", 1, 1, "tikhub")).toBe(500);
    expect(allowance(serre, st, "tiktok", 1, 1, "sc")).toBe(Math.floor(0.5 / SC_PRICE_PER_CREDIT));
  });

  it("recentPerDay compte les crédits (le rythme d'avant la bascule) ; celui de TikHub, les unités des postes qu'il sert, quel que soit le fournisseur du jour", () => {
    const usage: UsageRow[] = [
      { poste: "tiktok", credits: 30, thCalls: 900, thUnknown: 3, day: "2026-11-19" },
      { poste: "insta", credits: 120, day: "2026-11-19" },
      // Avant la bascule : les relevés chez ScrapeCreators, sans champ TikHub. Ce n'est pas un jour à 0 appel TikHub.
      { poste: "tiktok", credits: 1_000, day: "2026-11-18" },
      // Ce jour-là, les postes de TikHub n'ont rien dépensé (le Radar tournait : Instagram a dépensé) — un zéro mesuré.
      { poste: "insta", credits: 80, day: "2026-11-17" },
    ];
    expect(recentPerDay(usage, "2026-11-20")).toBe((150 + 1_000 + 80) / 3);
    expect(thPerDay(usage, "2026-11-20", { tiktok: "tikhub" })).toBe((933 + 1_000 + 0) / 3);
    // Aucun poste chez TikHub : rien à juger, pas un rythme nul.
    expect(thPerDay(usage, "2026-11-20", {})).toBeNull();
    expect(thPerDay(usage, "2026-11-20", { tiktok: "sc" })).toBeNull();
    // Aucun jour complet.
    expect(thPerDay(usage.filter((u) => u.day === "2026-11-19"), "2026-11-19", { tiktok: "tikhub" })).toBeNull();
  });

  it("le rythme de ScrapeCreators : les unités de ce qu'il sert sous le réglage en cours ; d'un poste que TikHub sert en entier, ce qu'il lui a servi les jours chez TikHub (replis), rien d'avant la bascule", () => {
    const usage: UsageRow[] = [
      // Le 19 : relevés chez TikHub, 30 replis chez ScrapeCreators ; réseau mixte (20 crédits, 25 appels TikHub).
      { poste: "tiktok", credits: 30, thCalls: 900, thUnknown: 3, thFallbacks: 30, day: "2026-11-19" },
      { poste: "network", credits: 20, thCalls: 25, day: "2026-11-19" },
      { poste: "insta", credits: 120, day: "2026-11-19" },
      // Le 18 : TikHub à sec toute la journée — la courbe n'a été servie qu'en repli (7), sans aucun appel TikHub.
      { poste: "curve", credits: 7, thFallbacks: 7, day: "2026-11-18" },
      // Le 17 : avant la bascule, tout chez ScrapeCreators.
      { poste: "tiktok", credits: 1_000, day: "2026-11-17" },
      { poste: "insta", credits: 80, day: "2026-11-17" },
    ];
    const today = "2026-11-20";
    // Sans réglage (ou retour en arrière) : toutes les unités, appels TikHub compris — ScrapeCreators sert tout.
    expect(scPerDay(usage, today, [])).toBe((933 + 45 + 120 + 7 + 1_080) / 3);
    // Relevés et courbe chez TikHub : leurs replis mesurés (30 le 19, 7 le 18), rien des relevés du 17 ; le réseau,
    // mixte, en entier (borne haute).
    expect(scPerDay(usage, today, ["tiktok", "curve"])).toBe((30 + 45 + 120 + 7 + 80) / 3);
    // Sans aucune ligne TikHub ni réglage : les crédits, exactement le rythme d'avant le 20/11/2026.
    const before = usage.filter((u) => u.day === "2026-11-17");
    expect(scPerDay(before, today, [])).toBe(recentPerDay(before, today));
    expect(scPerDay([], today, ["tiktok"])).toBeNull();
  });
});

describe("la projection du mois, à deux fournisseurs", () => {
  // Le cas du 20/11/2026 : 1 150 relevés par jour (34 500 au mois), payés chez ScrapeCreators du 1er au 19, puis la
  // bascule chez TikHub. Seul ce poste est allumé.
  const seul = (capUsd: number): BudgetSettings => ({ ...d, capUsd, postes: d.postes.map((p) => (p.key === "tiktok" ? { ...p, qty: 1_150 } : { ...p, on: false })) });
  const avant: UsageRow[] = Array.from({ length: 19 }, (_, i) => ({ poste: "tiktok", credits: 1_150, day: `2026-11-${String(i + 1).padStart(2, "0")}` }));
  const paye = 19 * 1_150 * SC_PRICE_PER_CREDIT;
  const reste = 34_500 - 19 * 1_150;

  it("un poste basculé en cours de mois : son reste = ses unités restantes au prix de TikHub, pas son enveloppe TikHub moins les crédits ScrapeCreators déjà payés", () => {
    const st = budgetState(seul(60), avant, null, tiktokChezTikHub);
    expect(st.byPoste.tiktok.envelopeUsd).toBeCloseTo(34.5, 9);
    expect(st.byPoste.tiktok.usd).toBeCloseTo(paye, 9);
    // 12 650 appels restent au mois, à 0,001 $ : ~12,65 $ (et non 0 : l'enveloppe TikHub est sous la dépense ScrapeCreators).
    expect(st.projectedUsd).toBeCloseTo(paye + reste * TH_PRICE_USD, 9);
    expect(monthLeftUnits(seul(60), st, "tiktok")).toBe(reste);
  });

  it("au-delà de 80 % du plafond, ces unités restantes comptent : la projection dépasse le plafond, le poste est coupé avant d'y arriver", () => {
    // 41,08 $ dépensés pour un plafond de 50 $ (82 %) ; projection 53,73 $.
    const st = budgetState(seul(50), avant, null, tiktokChezTikHub);
    expect(st.over80).toBe(true);
    expect(st.capCut).toEqual(["tiktok"]);
    expect(st.projectedUsd).toBeCloseTo(paye, 9);
  });

  it("retour chez ScrapeCreators en cours de mois : les appels TikHub déjà faits comptent comme des unités dépensées", () => {
    const mixte: UsageRow[] = [...avant, { poste: "tiktok", credits: 0, thCalls: 1_000, thUsd: 1, thUnknown: 150, day: "2026-11-20" }];
    const st = budgetState(seul(900), mixte, null);
    expect(st.projectedUsd).toBeCloseTo(paye + 1 + 150 * TH_PRICE_USD + (reste - 1_150) * SC_PRICE_PER_CREDIT, 9);
  });
});

describe("un palier par fournisseur", () => {
  it("ScrapeCreators en survie, TikHub normal : les paliers diffèrent, chaque poste suit le sien", () => {
    // ScrapeCreators : 1 000 crédits au-dessus de la réserve pour 2 000 par jour (survie). TikHub : 5 400 unités, 900 par jour.
    const st = budgetState(d, [], sc(CREDIT_RESERVE + 1_000, 2_000), { ...tiktokChezTikHub, th: th(5.4, 0, 0, 900) });
    expect(tierOf(st, "sc")).toBe("survie");
    expect(tierOf(st, "tikhub")).toBe("normal");
    // La recherche est réglée chez TikHub : elle n'est pas coupée ; les transcriptions (ScrapeCreators) le sont.
    expect(st.cut).not.toContain("search");
    expect(st.cut).toContain("transcript");
    expect(allowanceParts(d, st, "search", 0, 1).open).toEqual({ sc: false, tikhub: true });
  });

  it("les tournures (ScrapeCreators) sont coupées au palier économie de ScrapeCreators même quand la découverte est chez TikHub", () => {
    const st = budgetState(d, [], sc(CREDIT_RESERVE + 3_000, 2_000), { ...tiktokChezTikHub, th: th(5.4, 0, 0, 900) });
    expect(tierOf(st, "sc")).toBe("economie");
    expect(allowance(d, st, "search", 0, 1, "sc")).toBe(0);
    expect(allowance(d, st, "search", 0, 1, "tikhub")).toBeGreaterThan(0);
  });

  it("TikHub à sec : ses postes s'arrêtent, ScrapeCreators continue", () => {
    const st = budgetState(d, [], sc(50_000, 1_000), { ...tiktokChezTikHub, th: th(0, 0.02) });
    expect(tierOf(st, "tikhub")).toBe("reserve");
    expect(allowance(d, st, "tiktok", 0, 24, "tikhub")).toBe(0);
    expect(allowance(d, st, "tiktok", 0, 24, "sc")).toBe(375);
  });

  it("sans solde TikHub lu : pas de borne de solde, palier normal (comme ScrapeCreators jamais lu)", () => {
    const st = budgetState(d, [], null, tiktokChezTikHub);
    expect(st.th).toEqual({ paidLeft: null, allLeft: null, tier: "normal", daysLeft: null, stale: false });
    expect(allowance(d, st, "tiktok", 0, 24, "tikhub")).toBe(375);
  });

  it("une lecture de plus d'une minute est périmée", () => {
    expect(budgetState(d, [], null, { th: { ...th(1), seenAt: NOW - 60_000 } }).th.stale).toBe(true);
    expect(budgetState(d, [], null, { th: { ...th(1), seenAt: NOW - 59_999 } }).th.stale).toBe(false);
  });
});

describe("un seul budget pour toutes les tâches", () => {
  it("aucune tâche ne calcule son budget à part : budgetState n'est appelé que par radarProviders.jobBudget et par /admin", () => {
    const dir = path.join(__dirname, "../../convex/radar");
    // Les lignes de code seules (un commentaire peut citer l'appel).
    const code = (f: string) =>
      fs
        .readFileSync(path.join(dir, f), "utf8")
        .split("\n")
        .filter((l) => !/^\s*(\*|\/\/|\/\*)/.test(l))
        .join("\n");
    const calls = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".ts"))
      .flatMap((f) => (code(f).match(/\bbudgetState\(/g) ?? []).map(() => f));
    // radarSignalsMath : la définition ; radarProviders : jobBudget (les deux formes) ; radarSignals : getRadarBudgetCore (les deux formes).
    expect(calls.sort()).toEqual(["radarProviders.ts", "radarProviders.ts", "radarSignals.ts", "radarSignals.ts", "radarSignalsMath.ts"]);
  });
});

describe("la dépense TikHub depuis le solde lu (lots datés)", () => {
  it("au-delà du maximum, les plus anciens se fondent à l'heure du plus récent : rien n'est perdu, rien n'est oublié trop tôt", () => {
    let lots: ReturnType<typeof nextSpentLots> = [];
    for (let at = 1; at <= 40; at++) lots = nextSpentLots(lots, at, 0.001);
    expect(lots).toHaveLength(TH_SPENT_LOTS_MAX);
    expect(spentOf(lots)).toBeCloseTo(0.04, 9);
    // Les lots écrits de 1 à 9 ne font plus qu'un, daté de 9 : une lecture à 9 les garde tous (borne haute)…
    expect(lots[0]).toEqual({ at: 9, usd: expect.closeTo(0.009, 9) });
    expect(spentOf(nextSpentLots(lots, 41, 0, { at: 9, afterUsd: 0 }))).toBeCloseTo(0.04, 9);
    // … une lecture à 10 les sait tous écrits avant elle.
    expect(spentOf(nextSpentLots(lots, 41, 0, { at: 10, afterUsd: 0 }))).toBeCloseTo(0.031, 9);
  });

  it("le passage qui range le solde n'ajoute que sa dépense faite après sa lecture, jamais plus que son lot", () => {
    const prev = [{ at: 5, usd: 0.3 }];
    expect(spentOf(nextSpentLots(prev, 20, 0.05, { at: 10, afterUsd: 0.02 }))).toBeCloseTo(0.02, 9);
    expect(spentOf(nextSpentLots(prev, 20, 0.05, { at: 4, afterUsd: 0.02 }))).toBeCloseTo(0.32, 9);
    expect(spentOf(nextSpentLots([], 20, 0.05, { at: 4, afterUsd: 0.09 }))).toBeCloseTo(0.05, 9);
    expect(spentOf(nextSpentLots([], 20, 0.05, { at: 4, afterUsd: -1 }))).toBe(0);
  });
});
