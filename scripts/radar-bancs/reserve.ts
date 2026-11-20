/**
 * BANC — sous la réserve, le raté attend la sonde (brique 8), HORS LIGNE. 0 page TikTok, 0 appel au fournisseur.
 *
 * Ce qu'il mesure : sur le jumeau du passage de relevé (jumeau.ts : l'instantané de prod du 20/11/2026, les vraies
 * fonctions de radarFreeMath et du budget), des passages de 10 minutes SOUS LA RÉSERVE (solde lu 1 480 crédits, sous les
 * 1 500 de CREDIT_RESERVE : budgetState.reserveReached, allowance = 0), AVEC la brique (`livre` : reserveMisses dans
 * missPlan) et SANS (`brique7` : la même chose, reserveReached forcé à faux dans missPlan), mêmes tirages. Par scénario :
 *  - les pages TikTok lues (toutes, et celles des relevés ratés : rien de rangé, « pour rien »), par passage ;
 *  - les comptes repoussés de RESERVE_MISS_WAIT_MS (50 min) ; les trous relus ;
 *  - la sonde : partie à chaque passage où needsBalanceProbe le demande (le même nombre des deux côtés), sur quel compte
 *    (un compte troué relu par la sonde perd son trou : constat préexistant de la revue) ;
 *  - les retards : pour chaque compte raté sous la réserve, l'heure de son relevé réussi suivant, avec moins sans ;
 *  - avec un pack acheté (scénarios `pack`) : quand les comptes repoussés repartent, et les crédits payés ensuite.
 * Scénarios : 12 passages (2 h) au taux de la prod (trous 1,5 % des relevés, refus x1, relu au passage suivant 90 %),
 * trous doublés, refus x10 ; un pack de 25 000 crédits acheté à T0 + 65 min ; 48 passages (8 h, la pile qui monte) ; 48
 * passages avec un pack à T0 + 6 h ; 144 passages (une journée sous la réserve) ; 144 passages HORS de la réserve, poste
 * tiktok coupé (part nulle aussi : la brique ne s'y applique pas, la pile y monte de même).
 * Ce qu'il ne dit pas : ce que TikTok sert aux serveurs ; la réserve n'a jamais été atteinte en prod (aucune « sonde »
 * dans radarUsage.reasons au 20/11) : le jumeau la pose, rien ne l'a vue.
 *
 * Relancer :
 *   npx esbuild scripts/radar-bancs/reserve.ts --bundle --platform=node --format=esm --outfile=<dossier>/reserve.mjs
 *   node <dossier>/reserve.mjs <dossier de l'instantané> <dossier de sortie>
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { loadBase, simulate, stats, type Base, type Params, type Report } from "./jumeau";

const MIN = 60_000;
const HOUR = 60 * MIN;
const [snap, outDir] = process.argv.slice(2);
if (!snap || !outDir) {
  console.error("usage : node reserve.mjs <instantané> <sortie>");
  process.exit(1);
}
mkdirSync(outDir, { recursive: true });

const R1 = 80 / 2210;
const Q = 2 / 2210;
const Q_DETAIL = 1 / 5000;
const base: Base = await loadBase(snap, 24);
const common = (o: { passes: number; m?: number; gapRate?: number; pack?: number }): Omit<Params, "variant"> => ({
  hours: o.passes / 6,
  q: Math.min(R1, Q * (o.m ?? 1)),
  r1: R1,
  qDetail: Q_DETAIL * (o.m ?? 1),
  p2: 0.9,
  gapRate: o.gapRate ?? 0.015,
  latencyMs: 1330,
  // Sous la réserve depuis peu : solde lu il y a 45 min (la sonde part au deuxième passage).
  balance: { remaining: 1_480, seenAgoMs: 45 * MIN },
  ...(o.pack !== undefined ? { pack: { at: o.pack, credits: 25_000 } } : {}),
  seed: "reserve-2026-11-20",
});
// Le poste tiktok coupé (ou le jour, le mois, le plafond épuisés) : la part est nulle aussi, HORS de la réserve. Le
// document de réglages de l'instantané n'a pas de budgetVersion (normalizeBudget le ramène au défaut, 9 000/jour) : on le
// date de la version courante, poste tiktok éteint, plafond au défaut ; solde ample. En mémoire seulement.
const offBase: Base = {
  ...base,
  settings: {
    ...base.settings,
    budgetVersion: 10,
    capUsd: 900,
    postes: (base.settings.postes as { key: string; qty: number; on: boolean }[]).map((p) => (p.key === "tiktok" ? { ...p, on: false } : p)),
  },
};
const scenarios: { name: string; params: Omit<Params, "variant">; base?: Base }[] = [
  { name: "12-x1", params: common({ passes: 12 }) },
  { name: "12-x1-trous3", params: common({ passes: 12, gapRate: 0.03 }) },
  { name: "12-x10", params: common({ passes: 12, m: 10 }) },
  { name: "12-x1-pack65", params: common({ passes: 12, pack: 65 * MIN }) },
  { name: "48-x1", params: common({ passes: 48 }) },
  { name: "48-x1-trous3", params: common({ passes: 48, gapRate: 0.03 }) },
  { name: "48-x1-pack6h", params: common({ passes: 48, pack: 6 * HOUR }) },
  // Une journée sous la réserve : la pile des trous mange la voie (comptes pas atteints, attente des autres).
  { name: "144-x1", params: common({ passes: 144 }) },
  { name: "144-x1-poste-coupe", params: { ...common({ passes: 144 }), balance: { remaining: 26_646, seenAgoMs: 5 * MIN } }, base: offBase },
];

const sum = (xs: readonly number[]) => xs.reduce((s, x) => s + x, 0);
const min = (ms: number) => Math.round((ms / MIN) * 10) / 10;
const statsMin = (xs: readonly number[]) => {
  const s = stats(xs);
  return { n: s.n, p50: min(s.p50), p90: min(s.p90), max: min(s.max) };
};
/** Par compte raté : le premier raté, et quand il a été relevé ensuite (absent : jamais pendant le rejeu). */
function firstMiss(r: Report): Map<string, { at: number; why: string; resolvedAt?: number; how?: string }> {
  const out = new Map<string, { at: number; why: string; resolvedAt?: number; how?: string }>();
  for (const e of r.events) {
    const cur = out.get(e.account);
    if (!cur) out.set(e.account, { at: e.at, why: e.why, ...(e.resolvedAt !== undefined ? { resolvedAt: e.resolvedAt, how: e.how } : {}) });
    else if (cur.resolvedAt === undefined && e.resolvedAt !== undefined) Object.assign(cur, { resolvedAt: e.resolvedAt, how: e.how });
  }
  return out;
}
const brief = (r: Report) => ({
  passes: r.passes,
  part: r.budget.nByPass,
  palier: r.budget.tier0,
  réserve: r.budget.reserve0,
  relevésGratuits: r.freeOk,
  ratés: r.freeFails,
  pages: r.pages,
  pagesRatées: r.pagesFailed,
  pagesRatéesParRaison: r.pagesByWhy,
  parPassage: { dus: r.dueByPass, pages: r.pagesByPass, pagesRatées: r.pagesFailedByPass, comptesTroués: r.gapAccountsDueByPass, repoussés: r.reserveDeferByPass, gratuits: r.readsByPass },
  repoussés: r.reserveDefer,
  crédits: r.credits,
  mesure: r.measured,
  sonde: { demandée: r.probeDue, partie: r.probes.length, surUnCompteTroué: r.probes.filter((p) => p.gap).length, heures: r.probes.map((p) => min(p.at - base.T0)) },
  attenteSuivisMin: statsMin(r.waitsTracked),
  pasAtteints: r.notReached,
  dusÀLaFin: { ...r.waitingAtEnd, maxMin: min(r.waitingAtEnd.maxMs) },
});

const table: Record<string, unknown>[] = [];
for (const s of scenarios) {
  const sans = await simulate(s.base ?? base, { ...s.params, variant: "brique7" });
  const avec = await simulate(s.base ?? base, { ...s.params, variant: "livre" });
  const fs = firstMiss(sans);
  const fa = firstMiss(avec);
  // Le même compte raté des deux côtés : son relevé réussi suivant, avec moins sans (les deux relevés pendant le rejeu).
  // À part : ceux que la sonde a relus sans la brique (due[0], le plus en retard : un compte troué, relu sans son trou).
  const added: number[] = [];
  const addedProbe: number[] = [];
  let resolvedSans = 0;
  let resolvedAvec = 0;
  for (const [id, a] of fa) {
    if (a.resolvedAt !== undefined) resolvedAvec++;
    const b = fs.get(id);
    if (b?.resolvedAt !== undefined && a.resolvedAt !== undefined) (b.how === "payant:sonde" ? addedProbe : added).push(a.resolvedAt - b.resolvedAt);
  }
  for (const b of fs.values()) if (b.resolvedAt !== undefined) resolvedSans++;
  const how = (m: Map<string, { how?: string }>) => {
    const o: Record<string, number> = {};
    for (const x of m.values()) o[x.how ?? "pas relevé"] = (o[x.how ?? "pas relevé"] ?? 0) + 1;
    return o;
  };
  const out = {
    scénario: s.name,
    sans: brief(sans),
    avec: brief(avec),
    comptesRatés: { sans: fs.size, avec: fa.size, relevésEnsuiteSans: resolvedSans, relevésEnsuiteAvec: resolvedAvec, commentSans: how(fs), commentAvec: how(fa) },
    retardAjoutéMin: statsMin(added),
    retardAjoutéRelusParLaSondeSansLaBriqueMin: statsMin(addedProbe),
    pagesTikTok: 0,
  };
  writeFileSync(join(outDir, `reserve-${s.name}.json`), JSON.stringify(out, null, 2));
  const first = (xs: number[], k: number) => sum(xs.slice(0, k));
  table.push({
    scénario: s.name,
    passages: sans.passes,
    pagesSans: sans.pages,
    pagesAvec: avec.pages,
    pagesPourRienSans: sans.pagesFailed,
    pagesPourRienAvec: avec.pagesFailed,
    pagesPourRien6Sans: first(sans.pagesFailedByPass, 6),
    pagesPourRien6Avec: first(avec.pagesFailedByPass, 6),
    relevésGratuitsSans: sans.freeOk,
    relevésGratuitsAvec: avec.freeOk,
    trousRelusSans: sans.freeFails.gap ?? 0,
    trousRelusAvec: avec.freeFails.gap ?? 0,
    repoussés: avec.reserveDefer,
    sondesSans: sans.probes.length,
    sondesAvec: avec.probes.length,
    sondesDemandéesSans: sans.probeDue,
    sondesDemandéesAvec: avec.probeDue,
    sondeSurTrouéSans: sans.probes.filter((p) => p.gap).length,
    sondeSurTrouéAvec: avec.probes.filter((p) => p.gap).length,
    créditsSans: sum(Object.values(sans.credits).map((c) => c ?? 0)),
    créditsAvec: sum(Object.values(avec.credits).map((c) => c ?? 0)),
    retardAjoutéP50: out.retardAjoutéMin.p50,
    retardAjoutéMax: out.retardAjoutéMin.max,
    retardSondeN: addedProbe.length,
    retardSondeMax: out.retardAjoutéRelusParLaSondeSansLaBriqueMin.max,
    pasAtteintsSans: sans.notReached,
    pasAtteintsAvec: avec.notReached,
    dusFinSans: sans.waitingAtEnd.count,
    dusFinAvec: avec.waitingAtEnd.count,
    dusFinPlus1hSans: sans.waitingAtEnd.over1h,
    dusFinPlus1hAvec: avec.waitingAtEnd.over1h,
    comptesRatésSans: fs.size,
    comptesRatésAvec: fa.size,
    relevésEnsuiteSans: resolvedSans,
    relevésEnsuiteAvec: resolvedAvec,
    attenteSuivisMaxSans: out.sans.attenteSuivisMin.max,
    attenteSuivisMaxAvec: out.avec.attenteSuivisMin.max,
  });
  console.log(JSON.stringify(table.at(-1)));
}
writeFileSync(join(outDir, "reserve-resume.json"), JSON.stringify({ T0: new Date(base.T0).toISOString(), pagesTikTok: 0, scénarios: table }, null, 2));
