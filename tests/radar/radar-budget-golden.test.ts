import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  DEFAULT_BUDGET,
  POSTE_KEYS,
  allowance,
  budgetState,
  catchUpAllowance,
  creditTier,
  curveAdmissionsLeft,
  curveLaneTake,
  envelopeUsd,
  normalizeBudget,
  plannedUsd,
  recentPerDay,
  type Balance,
  type BudgetSettings,
  type UsageRow,
} from "../../convex/radar/radarSignalsMath";

/**
 * LA RÉFÉRENCE DU BUDGET SCRAPECREATORS (20/11/2026, bascule TikHub). Le budget apprend à compter deux fournisseurs ;
 * sans TikHub (aucun réglage, aucune ligne d'usage TikHub), il doit rendre au bit près ce que rend main. Le fichier de
 * référence a été écrit par ce test (GOLDEN_WRITE=1) dans un worktree détaché sur b4814df (main après les briques
 * gratuites #19, #24, #25, #26), jamais sur le code modifié : un écart d'un seul crédit ou d'un millionième de dollar
 * le fait tomber. Il remplace celui de 191b053, identique sur les fonctions que les deux avaient ; main y a ajouté la
 * part de la courbe dans la voie (curveLaneTake) et ses admissions (curveAdmissionsLeft, `free`), comparées ici aussi.
 */

const FILE = path.join(__dirname, "fixtures/budget-sc-b4814df.json");
const NOW = Date.parse("2026-11-20T12:00:00Z");
const TODAY = "2026-11-20";
const HOUR = 3_600_000;

/** Les champs d'un état de budget tels que main les rend (les champs ajoutés par la bascule ne comptent pas ici). */
const OLD_KEYS = ["spentCredits", "spentUsd", "projectedUsd", "cut", "capReached", "over80", "balanceLeft", "reserveReached", "balanceStale", "tier", "daysLeft"] as const;

function oldState(s: ReturnType<typeof budgetState>) {
  const out: Record<string, unknown> = {};
  for (const k of OLD_KEYS) out[k] = s[k];
  out.byPoste = Object.fromEntries(POSTE_KEYS.map((k) => [k, { credits: s.byPoste[k].credits, usd: s.byPoste[k].usd, envelopeUsd: s.byPoste[k].envelopeUsd }]));
  return out;
}

/**
 * Le défaut tel qu'il était sur b4814df : l'analyse IA à 2 $ par mois. Le 24/11/2026, son défaut passe à 15 $
 * (radarSignalsMath.DEFAULT_QTY) : un choix de réglage, pas un calcul. La référence reste celle de main, jamais
 * réécrite sur le code modifié ; le test la compare donc au défaut de son époque.
 */
const BASE: BudgetSettings = { ...DEFAULT_BUDGET, postes: DEFAULT_BUDGET.postes.map((p) => (p.key === "ai" ? { ...p, qty: 2 } : p)) };

const settings: Record<string, BudgetSettings> = {
  defaut: BASE,
  serre: normalizeBudget({ ...BASE, capUsd: 300, budgetVersion: 10 }),
  eteints: normalizeBudget({
    ...BASE,
    postes: BASE.postes.map((p) => (p.key === "search" || p.key === "insta" ? { ...p, on: false } : p.key === "tiktok" ? { ...p, qty: 4_000 } : p)),
    cutOrder: ["tiktok", "network", "search", "ai"],
    budgetVersion: 10,
  }),
};

const day = (d: number) => `2026-11-${String(d).padStart(2, "0")}`;
const usages: Record<string, UsageRow[]> = {
  vide: [],
  courant: [
    ...Array.from({ length: 19 }, (_, i) => ({ poste: "tiktok", credits: 900 + 37 * i, day: day(i + 1) })),
    ...Array.from({ length: 19 }, (_, i) => ({ poste: "network", credits: 50 + 11 * i, day: day(i + 1) })),
    { poste: "search", credits: 3_001, day: day(19) },
    { poste: "search", credits: 47, day: TODAY },
    { poste: "curve", credits: 913, day: day(18) },
    { poste: "insta", credits: 5_123, day: day(17) },
    { poste: "transcript", credits: 1_009, day: day(16) },
    { poste: "ai", credits: 0, usd: 1.234567, day: day(15) },
    { poste: "inconnu", credits: 17, day: day(14) },
  ],
  lourd: [
    { poste: "tiktok", credits: 120_000, day: day(10) },
    { poste: "network", credits: 9_000, day: day(11) },
    { poste: "ads", credits: 700, day: day(12) },
    { poste: "ai", credits: 0, usd: 0.75, day: day(13) },
  ],
  plafond: [{ poste: "tiktok", credits: 500_000, day: day(5) }],
};

const balances: Record<string, Balance | null> = {
  inconnu: null,
  large: { remaining: 50_000, seenAt: NOW - 60_000, now: NOW, perDay: 1_150 },
  economie: { remaining: 1_500 + 3_000, seenAt: NOW - 60_000, now: NOW, perDay: 2_000 },
  survie: { remaining: 1_500 + 1_000, seenAt: NOW - 60_000, now: NOW, perDay: 2_000 },
  reserve: { remaining: 1_000, seenAt: NOW - 2 * HOUR, now: NOW, perDay: 2_000 },
  sansRythme: { remaining: 9_000, seenAt: NOW, now: NOW, perDay: null },
};

function grid() {
  const out: Record<string, unknown> = {};
  for (const [sn, s] of Object.entries(settings)) {
    out[`plannedUsd:${sn}`] = plannedUsd(s);
    for (const k of POSTE_KEYS) out[`envelopeUsd:${sn}:${k}`] = envelopeUsd(s, k);
    for (const free of [false, true]) {
      for (const paidLeft of [0, 1, 4, 100]) out[`curveLaneTake:${sn}:${free}:${paidLeft}`] = curveLaneTake(s, free, paidLeft);
      for (const admitted of [0, 50, 99, 100, 300, 500]) out[`curveAdmissionsLeft:${sn}:${free}:${admitted}`] = curveAdmissionsLeft(s, admitted, free);
    }
    for (const [un, u] of Object.entries(usages)) {
      for (const [bn, b] of Object.entries(balances)) {
        const st = budgetState(s, u, b);
        const key = `${sn}:${un}:${bn}`;
        out[`state:${key}`] = oldState(st);
        for (const k of POSTE_KEYS) {
          for (const today of [0, 100, 5_000]) for (const runs of [1, 4, 24]) out[`allowance:${key}:${k}:${today}:${runs}`] = allowance(s, st, k, today, runs);
          out[`catchUp:${key}:${k}`] = catchUpAllowance(s, st, k);
        }
      }
    }
  }
  // La courbe éteinte : la voie n'en prend aucune, plus aucune admission.
  const curveOff = normalizeBudget({ ...BASE, postes: BASE.postes.map((p) => (p.key === "curve" ? { ...p, on: false } : p)), budgetVersion: 10 });
  for (const free of [false, true]) {
    for (const paidLeft of [0, 4]) out[`curveLaneTake:courbeEteinte:${free}:${paidLeft}`] = curveLaneTake(curveOff, free, paidLeft);
    out[`curveAdmissionsLeft:courbeEteinte:${free}:0`] = curveAdmissionsLeft(curveOff, 0, free);
  }
  for (const [un, u] of Object.entries(usages)) for (const days of [1, 3, 5]) out[`recentPerDay:${un}:${days}`] = recentPerDay(u, TODAY, days);
  out["recentPerDay:aujourdhui-exclu"] = recentPerDay([{ poste: "tiktok", credits: 10, day: TODAY }], TODAY);
  for (const left of [null, 0, 10, 2_000, 3_999, 4_000, 100_000]) for (const perDay of [null, undefined, 0, 2_000]) out[`creditTier:${left}:${perDay}`] = creditTier(left, perDay);
  return JSON.parse(JSON.stringify(out)) as Record<string, unknown>;
}

describe("budget ScrapeCreators seul : identique à main (b4814df)", () => {
  it("budgetState, allowance, catchUpAllowance, plannedUsd, envelopeUsd, recentPerDay, creditTier, curveLaneTake, curveAdmissionsLeft", () => {
    const got = grid();
    if (process.env.GOLDEN_WRITE === "1") {
      fs.mkdirSync(path.dirname(FILE), { recursive: true });
      fs.writeFileSync(FILE, `${JSON.stringify(got, null, 1)}\n`);
      return;
    }
    const want = JSON.parse(fs.readFileSync(FILE, "utf8")) as Record<string, unknown>;
    expect(Object.keys(got).length).toBeGreaterThan(5_000);
    expect(got).toEqual(want);
  });
});
