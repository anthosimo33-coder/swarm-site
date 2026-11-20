/**
 * BANC — le repli reporté d'un passage (brique 7, « repli »), HORS LIGNE. 0 page TikTok, 0 appel au fournisseur.
 *
 * Ce qu'il mesure : sur le jumeau du passage de relevé (jumeau.ts : l'instantané de prod du 20/11/2026, les vraies
 * fonctions de radarFreeMath), 24 heures de passages de 10 minutes rejouées AVEC la brique (`livre` : missPlan tel qu'il
 * part) et SANS (`avant7` : tout raté au payant dans le passage, comme avant 25fbb0b), les mêmes échecs tirés au même
 * compte au même passage. Il rend, par scénario :
 *  - les crédits payés par motif (repli, premier, retard, coupure, trou) et les appels évités comptés (saved.repli) ;
 *  - le retard ajouté à un raté (son relevé réussi suivant, avec la brique moins sans : médiane, p90, max) ;
 *  - l'attente de tous les relevés (heure du relevé − nextReadAt), les comptes encore dus à la fin (affamés : > 3 h) ;
 *  - le second regard (relevé calé sur publication + 18 h) : relevé avant H+24 ou non ;
 *  - les premiers relevés (60 comptes neufs injectés à T0 + 30 min) : attente jusqu'à leur premier relevé ;
 *  - les seconds échecs retenus encore (doit valoir 0) ;
 *  - une PROPOSITION chiffrée à côté (`retenue-voie-libre`, pas le code livré) : ne retenir que si la voie a atteint
 *    tous les comptes suivis dus du passage — en file saturée, la place qu'un retenu reprend pousse un autre au « retard ».
 * Taux injectés (cf jumeau.ts) : profil refusé au premier essai 80/2 210 (13/11), après retrying 2/2 210 (13/11), page de
 * vidéo illisible 1 sur 5 000 (0 sur 4 095 le 13/11, 0 sur ~900 en C4), soit ~0,1 % des relevés ratés : la prod en a payé
 * 23 en « repli » pour 22 671 relevés gratuits du 17 au 20/11 (radarUsage : calls − credits). Multipliés par 1, 10, 40
 * (40 : tout refus du premier essai le reste au second, le pire du 13/11). Relu au passage suivant : `p2` de 50 à 98 %
 * (78/80 au second essai de 2,5 s le 13/11 ; rien n'a mesuré le passage suivant, d'où la plage). Deux rafales (tout
 * refusé pendant 60 s, à T0 + 3 h et + 12 h) dans un scénario à part : le coupe-circuit ferme la voie.
 * Budget : solde ample (26 646 crédits, un pack de 25 000 sur le solde du 20/11) : le palier normal, n = 375 par passage ;
 * un scénario au solde du 20/11 (1 646, palier « survie » : la part bornée par le solde, les premiers relevés ratés
 * attendent une heure).
 *
 * Relancer :
 *   npx esbuild scripts/radar-bancs/repli.ts --bundle --platform=node --format=esm --outfile=<dossier>/repli.mjs
 *   node <dossier>/repli.mjs <dossier de l'instantané> <dossier de sortie> [--heures 24] [--trous 0.015]
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { loadBase, simulate, stats, type Base, type Params, type Report } from "./jumeau";

const MIN = 60_000;
const HOUR = 60 * MIN;
const raw = process.argv.slice(2);
const flag = (name: string, dflt: number) => {
  const i = raw.indexOf(name);
  return i >= 0 ? Number(raw[i + 1]) : dflt;
};
const [snap, outDir] = raw.filter((a, i) => !a.startsWith("--") && !["--heures", "--trous"].includes(raw[i - 1] ?? ""));
if (!snap || !outDir) {
  console.error("usage : node repli.mjs <instantané> <sortie> [--heures 24] [--trous 0.015]");
  process.exit(1);
}
const hours = flag("--heures", 24);
mkdirSync(outDir, { recursive: true });

const R1 = 80 / 2210;
const Q = 2 / 2210;
const Q_DETAIL = 1 / 5000;
// Un relevé sur 67 tombe sur une vidéo supprimée : 78 trous par jour dans le jumeau (5 750 relevés gratuits), pour
// 53 à 72 vidéos gapChecked par jour en prod du 16 au 19/11 (plancher des suppressions) et 101 à 178 crédits « trou ».
const GAP_RATE = flag("--trous", 0.015);
const base: Base = await loadBase(snap, hours);
const common = (m: number, p2: number): Omit<Params, "variant"> => ({
  hours,
  q: Math.min(R1, Q * m),
  r1: R1,
  qDetail: Q_DETAIL * m,
  p2,
  gapRate: GAP_RATE,
  latencyMs: 1330,
  firstBurst: { at: 30 * MIN, count: 60 },
  balance: { remaining: 26_646, seenAgoMs: 5 * MIN },
  seed: "repli-2026-11-20",
});
type Scenario = { name: string; params: Omit<Params, "variant"> };
const scenarios: Scenario[] = [];
for (const m of [1, 10, 40]) for (const p2 of [0.5, 0.7, 0.9, 0.98]) scenarios.push({ name: `x${m}-p${Math.round(p2 * 100)}`, params: common(m, p2) });
scenarios.push({ name: "rafales-x1-p90", params: { ...common(1, 0.9), rafale: [{ from: 3 * HOUR, to: 3 * HOUR + MIN }, { from: 12 * HOUR, to: 12 * HOUR + MIN }] } });
// File saturée : pages deux fois plus lentes (2 660 ms), la voie ne suit plus (débordement « retard ») ; la place
// qu'un retenu reprend au passage suivant peut pousser un autre compte au payant.
// Trois tirages chacun (graines a, b, c) : l'écart avec/sans y vient en partie de relevés faits à d'autres passages.
for (const [m, p2] of [[1, 0.9], [10, 0.9], [40, 0.5], [40, 0.9]] as const)
  for (const g of ["a", "b", "c"]) scenarios.push({ name: `saturee-x${m}-p${Math.round(p2 * 100)}-${g}`, params: { ...common(m, p2), latencyMs: 2660, seed: `repli-2026-11-20-${g}` } });
// Le solde du 20/11 (1 646 crédits lus à 14:07:04, 146 au-dessus de la réserve) : palier « survie », part bornée par le solde.
scenarios.push({ name: "solde-20-11-x1-p90", params: { ...common(1, 0.9), balance: { remaining: base.balance.remaining, seenAgoMs: base.T0 - base.balance.seenAt } } });

const sum = (o: Record<string, number | undefined>) => Object.values(o).reduce<number>((s, c) => s + (c ?? 0), 0);
const min = (ms: number) => Math.round((ms / MIN) * 10) / 10;
const statsMin = (xs: readonly number[]) => {
  const s = stats(xs);
  return { n: s.n, p50: min(s.p50), p90: min(s.p90), p99: min(s.p99), max: min(s.max) };
};
const brief = (r: Report) => ({
  passes: r.passes,
  n0: r.budget.n0,
  palier: r.budget.tier0,
  relevésGratuits: r.freeOk,
  ratés: r.freeFails,
  pages: r.pages,
  crédits: { ...r.credits, total: sum(r.credits) },
  appelsPayants: r.paidCalls,
  évités: r.saved,
  mesure: r.measured,
  retenus: r.held,
  retenusPremiers: r.heldFirst,
  secondsÉchecsRetenus: r.heldTwice,
  passagesCoupeCircuit: r.breakerPasses,
  attenteRelevésMin: statsMin(r.waits),
  attenteSuivisMin: statsMin(r.waitsTracked),
  dusÀLaFin: { ...r.waitingAtEnd, maxMin: min(r.waitingAtEnd.maxMs) },
  secondRegard: { relevés: r.secondLook.due, avantH24: r.secondLook.onTime, après: r.secondLook.late, retardMin: statsMin(r.secondLook.lateMs), toujoursDus: r.secondLook.stillWaiting },
  premiers: { injectés: r.first.injected, gratuits: r.first.readFree, payants: r.first.readPaid, attenteMin: statsMin(r.first.waitMs), jamaisLus: r.first.unread },
});

const table: Record<string, unknown>[] = [];
for (const s of scenarios) {
  const sans = await simulate(base, { ...s.params, variant: "avant7" });
  const avec = await simulate(base, { ...s.params, variant: "livre" });
  // La proposition (pas le code livré) : retenir seulement quand la voie n'a laissé aucun compte suivi au débordement.
  const libre = await simulate(base, { ...s.params, variant: "retenue-voie-libre" });
  // Le même raté (compte, passage) des deux côtés : quand il a été relevé ensuite.
  const before = new Map(sans.events.map((e) => [e.key, e]));
  const added: number[] = [];
  const heldDelay: number[] = [];
  let onlyAvec = 0;
  let unresolved = 0;
  // Les ratés que la brique retient (profil refusé, page illisible) ; un trou part au payant des deux côtés.
  const held7 = (e: { why: string }) => e.why === "suspect" || e.why === "detail";
  for (const e of avec.events.filter(held7)) {
    if (e.held) heldDelay.push((e.resolvedAt ?? Infinity) - e.at);
    if (e.resolvedAt === undefined) unresolved++;
    const b = before.get(e.key);
    if (!b) {
      onlyAvec++;
      continue;
    }
    if (e.resolvedAt !== undefined && b.resolvedAt !== undefined) added.push(e.resolvedAt - b.resolvedAt);
  }
  const how: Record<string, number> = {};
  for (const e of avec.events.filter((x) => x.held)) how[e.how ?? "pas relevé"] = (how[e.how ?? "pas relevé"] ?? 0) + 1;
  const out = {
    scénario: s.name,
    taux: { q: s.params.q, r1: s.params.r1, qDetail: s.params.qDetail, p2: s.params.p2, rafales: s.params.rafale ?? [] },
    sans: brief(sans),
    avec: brief(avec),
    propositionRetenueVoieLibre: { crédits: { ...libre.credits, total: sum(libre.credits) }, évités: libre.saved, retenus: libre.held, premiersAttenteMaxMin: min(Math.max(0, ...libre.first.waitMs)) },
    ratés: { sans: sans.events.filter(held7).length, avec: avec.events.filter(held7).length, seulementAvec: onlyAvec, avecNonRelevés: unresolved },
    retenus: {
      n: heldDelay.length,
      relevéEnsuite: how,
      délaiMin: statsMin(heldDelay.filter(Number.isFinite)),
      premiersRelevésDélaiMin: statsMin(avec.events.filter((e) => e.held && e.first).map((e) => (e.resolvedAt ?? Infinity) - e.at).filter(Number.isFinite)),
    },
    retardAjoutéMin: statsMin(added),
    créditsÉvités: { repliPremier: (sans.credits.repli ?? 0) + (sans.credits.premier ?? 0) - (avec.credits.repli ?? 0) - (avec.credits.premier ?? 0), total: sum(sans.credits) - sum(avec.credits), comptésSaved: avec.saved.repli ?? 0 },
    pagesTikTok: 0,
  };
  writeFileSync(join(outDir, `repli-${s.name}.json`), JSON.stringify(out, null, 2));
  table.push({
    scénario: s.name,
    repliSans: sans.credits.repli ?? 0,
    repliAvec: avec.credits.repli ?? 0,
    premierSans: sans.credits.premier ?? 0,
    premierAvec: avec.credits.premier ?? 0,
    retardSans: sans.credits.retard ?? 0,
    retardAvec: avec.credits.retard ?? 0,
    coupureSans: sans.credits.coupure ?? 0,
    coupureAvec: avec.credits.coupure ?? 0,
    totalSans: sum(sans.credits),
    totalAvec: sum(avec.credits),
    savedRepli: avec.saved.repli ?? 0,
    totalVoieLibre: sum(libre.credits),
    savedVoieLibre: libre.saved.repli ?? 0,
    retenus: avec.held,
    secondsRetenus: avec.heldTwice,
    retardAjoutéP50: out.retardAjoutéMin.p50,
    retardAjoutéMax: out.retardAjoutéMin.max,
    attenteSuivisP99Sans: out.sans.attenteSuivisMin.p99,
    attenteSuivisP99Avec: out.avec.attenteSuivisMin.p99,
    attenteSuivisMaxSans: out.sans.attenteSuivisMin.max,
    attenteSuivisMaxAvec: out.avec.attenteSuivisMin.max,
    affamésSans: sans.waitingAtEnd.over3h,
    affamésAvec: avec.waitingAtEnd.over3h,
    h24Sans: sans.secondLook.late + sans.secondLook.stillWaiting,
    h24Avec: avec.secondLook.late + avec.secondLook.stillWaiting,
    premierMaxSans: out.sans.premiers.attenteMin.max,
    premierMaxAvec: out.avec.premiers.attenteMin.max,
    secondsRegards: avec.secondLook.due,
    premiersRetenus: avec.heldFirst,
    premiersRetenusDélaiMax: out.retenus.premiersRelevésDélaiMin.max,
    premiersJamaisLusSans: sans.first.unread,
    premiersJamaisLusAvec: avec.first.unread,
  });
  console.log(JSON.stringify(table.at(-1)));
}
writeFileSync(join(outDir, "repli-resume.json"), JSON.stringify({ heures: hours, T0: new Date(base.T0).toISOString(), pagesTikTok: 0, scénarios: table }, null, 2));
