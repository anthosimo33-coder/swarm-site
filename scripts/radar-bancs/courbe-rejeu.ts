/**
 * BANC HORS LIGNE — la courbe sur la page publique d'une vidéo (brique 6), REJOUÉE sur des données déjà relevées
 * (20/11/2026, 19 h 35).
 *
 * Aucune requête : le robots.txt de TikTok interdit le site aux agents IA (constat de la session parente, 20/11 19 h 35).
 * `fetch` est remplacé au démarrage par une erreur. Le banc relit l'instantané de prod (radarSignals,
 * radarFirstReadTrials, radarUsage) et les pages déjà lues par les bancs précédents (scripts/radar-bancs/courbe.ts,
 * 20/11 17:46 et 18:08 UTC ; leurs sorties courbe-banc.jsonl) ou gardées telles quelles (`--html`).
 *
 * Ce qu'il mesure, avec les fonctions livrées (pageStep, curveStep, curveVerdict, curveMatch : radarFreeMath ; curveOf,
 * lastGrowth, sharesWell : radarDisplay ; ratioOf, CURVE_CHECKPOINTS_H, CURVE_COUNTS : radarSignalsMath) :
 *  A. la règle d'arrondi de la page — plancher ou plus proche ? — sur radarFirstReadTrials (prod, serveurs, 15/11 :
 *     la même vidéo relevée au payant, puis 5 à 60 min plus tard sur la liste /embed/@x ou sur sa page) ;
 *  B. les pages lues par les bancs contre les six compteurs que la prod avait rangés, par tranche de vues ;
 *  C. radarFirstReadTrials : ce que portent les deux côtés, et leur accord, par tranche ;
 *  D. l'erreur que l'arrondi introduirait sur la courbe (relevés H+6/24/48) des 70 signaux de prod, et sur les
 *     compteurs et règles qui en dépendent (ratio, « se partage », la pente affichée) ;
 *  E. une règle hybride NON CODÉE (page sous HYBRID_MAX vues, payant au-dessus) : crédits évités, erreur max.
 * Ce qu'il ne mesure pas : la page et le payant AU MÊME INSTANT (aucune donnée ne les porte ; c'est la mesure en prod,
 * CURVE_FREE faux → radarUsage.measured du poste curve), ni ce que TikTok sert aux serveurs pour les j'aime,
 * commentaires, partages et abonnés (les essais du 15/11 ne portent que les vues).
 *
 * Budget de pages : 0.
 *
 * Relancer :
 *   npx esbuild scripts/radar-bancs/courbe-rejeu.ts --bundle --platform=node --format=esm \
 *     --outfile=<dossier>/courbe-rejeu.mjs && node <dossier>/courbe-rejeu.mjs <dossier de l'instantané> \
 *     <dossier de sortie> --bancs <dossier d'un banc courbe.ts>[,<autre>] [--html <page.html>:<videoId>[,…]]
 */
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { curveMatch, curveStep, curveVerdict, pageStep, type CurveVerdict } from "../../convex/radar/radarFreeMath";
import { CURVE_CHECKPOINTS_H, CURVE_COUNTS, CURVE_MIN_RATIO, KEEP_MIN_RATIO, ratioOf, type CurveCounts } from "../../convex/radar/radarSignalsMath";
import { curveOf, lastGrowth, sharesWell } from "../../convex/radar/radarDisplay";

// Hors ligne : une requête, même par erreur, casse le banc au lieu de partir.
globalThis.fetch = (() => {
  throw new Error("banc hors ligne : aucune requête");
}) as typeof fetch;

const HOUR = 3_600_000;
/** La règle hybride évaluée (non codée) : la page sous ce nombre de vues, le payant au-dessus. */
const HYBRID_MAX = 1_000_000;
/** Un relevé de courbe tombe à :40 l'heure qui suit son échéance (runCurve) : on le cherche dans les 2 h. */
const CHECKPOINT_WINDOW_MS = 2 * HOUR;

const args = process.argv.slice(2);
const flag = (name: string): string | undefined => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const positional = args.filter((a, i) => !a.startsWith("--") && !(i > 0 && args[i - 1].startsWith("--")));
const [snapDir, outDir] = positional;
if (!snapDir || !outDir) {
  console.error("usage : node courbe-rejeu.mjs <dossier de l'instantané> <dossier de sortie> --bancs <d1>[,<d2>] [--html <page.html>:<videoId>]");
  process.exit(1);
}
const benchDirs = (flag("--bancs") ?? "").split(",").filter(Boolean);
const htmlPages = (flag("--html") ?? "")
  .split(",")
  .filter(Boolean)
  .map((s) => {
    const i = s.lastIndexOf(":");
    return { file: s.slice(0, i), videoId: s.slice(i + 1) };
  });

const jsonl = <T>(path: string): T[] =>
  readFileSync(path, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((l) => JSON.parse(l) as T);

// ─── Outils ──────────────────────────────────────────────────────────────────

const TRANCHES = ["< 10 k", "10 k – 1 M", "> 1 M"] as const;
type Tranche = (typeof TRANCHES)[number];
const tranche = (views: number): Tranche => (views < 10_000 ? TRANCHES[0] : views < 1_000_000 ? TRANCHES[1] : TRANCHES[2]);

type Mode = "proche" | "plancher";
/** Ce que la page servirait d'une valeur exacte `n` : au pas de la page (curveStep), au plus proche (A) ou au plancher (borne). */
const pageValue = (k: keyof CurveCounts, n: number, mode: Mode): number => {
  const st = curveStep(k, n);
  return (mode === "proche" ? Math.round(n / st) : Math.floor(n / st)) * st;
};
/** Une valeur que la page aurait pu servir telle quelle (multiple de son pas). Une valeur exacte l'est 1 fois sur 100. */
const looksServed = (k: keyof CurveCounts, n: number): boolean => k !== "saves" && n >= 10_000 && n % curveStep(k, n) === 0;

const sorted = (xs: number[]) => [...xs].sort((a, b) => a - b);
const quantile = (xs: number[], q: number): number | null => {
  if (!xs.length) return null;
  const s = sorted(xs);
  return s[Math.min(s.length - 1, Math.floor(q * (s.length - 1) + 0.5))];
};
const max = (xs: number[]): number | null => (xs.length ? Math.max(...xs) : null);
const min = (xs: number[]): number | null => (xs.length ? Math.min(...xs) : null);
const pct = (x: number | null, digits = 3): string | null => (x === null ? null : `${(x * 100).toFixed(digits)} %`);
const count = <K extends string>(m: Partial<Record<K, number>>, k: K) => (m[k] = (m[k] ?? 0) + 1);

// ─── A et C : radarFirstReadTrials (prod, serveurs, 15/11) ───────────────────

type TrialVideo = { videoId: string; views: number; publishedAt: number; caption?: string; lang?: string; region?: string; musicId?: string; hook?: string };
type Trial = { handle: string; freeAt: number; paidAt: number; free: { list: TrialVideo[]; videos: TrialVideo[] }; paid: TrialVideo[] };
const trials = jsonl<Trial>(join(snapDir, "radarFirstReadTrials.jsonl"));

type Pair = { src: "liste" | "page"; free: TrialVideo; paid: TrialVideo; gapMin: number };
const pairs: Pair[] = [];
const coverage = { payantSeul: 0, gratuitSeul: 0, lesDeux: 0 };
const fields: Record<string, Partial<Record<string, number>>> = { liste: {}, page: {}, payant: {} };
for (const t of trials) {
  const paid = new Map(t.paid.map((v) => [v.videoId, v]));
  const freeIds = new Set([...t.free.list, ...t.free.videos].map((v) => v.videoId));
  for (const id of paid.keys()) if (freeIds.has(id)) coverage.lesDeux++;
  else coverage.payantSeul++;
  for (const id of freeIds) if (!paid.has(id)) coverage.gratuitSeul++;
  for (const v of t.paid) for (const k of Object.keys(v)) count(fields.payant, k);
  for (const [src, list] of [["liste", t.free.list], ["page", t.free.videos]] as const)
    for (const f of list) {
      for (const k of Object.keys(f)) count(fields[src], k);
      const p = paid.get(f.videoId);
      if (p) pairs.push({ src, free: f, paid: p, gapMin: (t.freeAt - t.paidAt) / 60_000 });
    }
}

/**
 * A. Le payant est lu AVANT la page (5 à 60 min) : la vraie valeur au moment de la page est ≥ le payant. Quand le reste
 * du payant au pas de la page est ≥ la moitié du pas, un arrondi au plancher servirait plancher(payant), sous le payant ;
 * un arrondi au plus proche, le pas du dessus. Ces cas départagent les deux règles.
 */
type RuleClass = "egal" | "pas du dessus (plus proche)" | "plancher" | "croissance au-delà" | "sous le plancher" | "arrondi (plancher = plus proche)";
const rule: Record<string, Partial<Record<RuleClass, number>>> = {};
for (const p of pairs) {
  const paid = p.paid.views;
  const free = p.free.views;
  if (paid < 10_000) continue;
  const st = pageStep(paid);
  const rest = paid % st;
  const lo = paid - rest;
  const near = Math.round(paid / st) * st;
  const key = `${p.src} · ${tranche(paid)} · reste ${rest === 0 ? "nul" : rest * 2 < st ? "< pas/2" : "≥ pas/2"}`;
  rule[key] ??= {};
  let c: RuleClass;
  if (rest === 0) c = free === paid ? "egal" : free > paid ? "croissance au-delà" : "sous le plancher";
  else if (rest * 2 < st) c = free === lo ? "arrondi (plancher = plus proche)" : free > lo ? "croissance au-delà" : "sous le plancher";
  else c = free === near ? "pas du dessus (plus proche)" : free === lo ? "plancher" : free > near ? "croissance au-delà" : "sous le plancher";
  count(rule[key], c);
}

/** C. L'accord des vues, par tranche (du payant) : égal, dans l'arrondi, au-dessus (la vidéo a gagné entre les deux), au-dessous au-delà de l'arrondi. */
type Agree = { n: number; egal: number; dansLArrondi: number; auDessus: number; sousAuDelaArrondi: number; ecartRel: number[]; arrondiRel: number[] };
const agree: Record<string, Agree> = {};
const pub: number[] = [];
const other = { lang: [0, 0], region: [0, 0], musicId: [0, 0], caption: [0, 0], hook: [0, 0] } as Record<string, [number, number]>;
for (const p of pairs) {
  const paid = p.paid.views;
  const free = p.free.views;
  const key = `${tranche(paid)} · ${p.src}`;
  const a = (agree[key] ??= { n: 0, egal: 0, dansLArrondi: 0, auDessus: 0, sousAuDelaArrondi: 0, ecartRel: [], arrondiRel: [] });
  const near = pageValue("views", paid, "proche");
  a.n++;
  if (free === paid) a.egal++;
  else if (free === near) a.dansLArrondi++;
  else if (free > paid) a.auDessus++;
  if (free < paid - pageStep(paid) / 2) a.sousAuDelaArrondi++;
  if (paid > 0) {
    a.ecartRel.push(Math.abs(free - paid) / paid);
    a.arrondiRel.push(Math.abs(near - paid) / paid);
  }
  pub.push(Math.abs(p.free.publishedAt - p.paid.publishedAt) / 1000);
  if (p.src === "page")
    for (const k of Object.keys(other)) {
      const f = (p.free as Record<string, unknown>)[k];
      const q = (p.paid as Record<string, unknown>)[k];
      if (f === undefined || q === undefined) continue;
      other[k][1]++;
      // Aux blancs près : la page met la légende sur une ligne, le payant garde ses retours à la ligne.
      if (String(f).replace(/\s+/g, " ").trim() === String(q).replace(/\s+/g, " ").trim()) other[k][0]++;
    }
}
const agreeOut = Object.fromEntries(
  Object.entries(agree)
    .sort()
    .map(([k, a]) => [
      k,
      {
        n: a.n,
        egal: a.egal,
        dansLArrondi: a.dansLArrondi,
        auDessus: a.auDessus,
        sousAuDelaArrondi: a.sousAuDelaArrondi,
        ecartRelMedian: pct(quantile(a.ecartRel, 0.5)),
        ecartRelMax: pct(max(a.ecartRel)),
        arrondiSeulRelMax: pct(max(a.arrondiRel)),
      },
    ]),
);
const gaps = trials.map((t) => (t.freeAt - t.paidAt) / 60_000);

// ─── Les signaux de prod ─────────────────────────────────────────────────────

type Snap = { at: number; views: number };
type Signal = CurveCounts & { videoId: string; authorHandle: string; platform?: string; publishedAt: number; curveStartedAt?: number; lastSeenAt: number; snapshots: Snap[] };
const bySignal = new Map<string, Signal>();
const curveSignals: Signal[] = [];
for (const s of jsonl<Signal>(join(snapDir, "radarSignals.jsonl"))) {
  if ((s.platform ?? "tiktok") !== "tiktok") continue;
  bySignal.set(s.videoId, s);
  if (s.curveStartedAt !== undefined) curveSignals.push(s);
}
const countsOf = (s: CurveCounts): CurveCounts => Object.fromEntries(CURVE_COUNTS.map((k) => [k, s[k]])) as CurveCounts;

// ─── B : les pages déjà lues par les bancs, contre ce que la prod avait rangé ─

type BenchRow = { videoId: string; handle: string; prod: CurveCounts; verdict: CurveVerdict; browserSame?: boolean | null };
type Read = BenchRow & { banc: string; quand: number };
const reads: Read[] = [];
for (const dir of benchDirs) {
  const resume = JSON.parse(readFileSync(join(dir, "courbe-banc-resume.json"), "utf8")) as { quand: string };
  for (const r of jsonl<BenchRow>(join(dir, "courbe-banc.jsonl"))) reads.push({ ...r, banc: dir.split("/").filter(Boolean).slice(-2).join("/"), quand: Date.parse(resume.quand) });
}
for (const h of htmlPages) {
  if (!existsSync(h.file)) continue;
  const s = bySignal.get(h.videoId);
  if (!s) continue;
  // La page gardée telle que TikTok l'a servie, lue par le code livré.
  const verdict = curveVerdict({ ok: true, text: readFileSync(h.file, "utf8") }, h.videoId);
  reads.push({ videoId: h.videoId, handle: s.authorHandle, prod: countsOf(s), verdict, banc: "page gardée", quand: statSync(h.file).mtimeMs });
}

type PerCounter = { lues: number; auDela10k: number; auPasDeLaPage: number; multiplesDe100: number; prodDejaArrondie: number; sousLaProdAuDelaArrondi: string[]; arrondiBorneRelMax: number[]; deltaRel: number[] };
const bench: Record<string, Record<string, PerCounter>> = {};
const verdicts: Record<string, Partial<Record<string, number>>> = {};
const ages: number[] = [];
for (const r of reads) {
  count((verdicts[r.banc] ??= {}), r.verdict.kind === "read" ? "lue" : r.verdict.kind === "gone" ? "partie" : `payant (${r.verdict.why})`);
  if (r.browserSame !== undefined) count(verdicts[r.banc], r.browserSame === true ? "navigateur : mêmes nombres" : "navigateur : autres nombres");
  if (r.verdict.kind !== "read") continue;
  const s = bySignal.get(r.videoId);
  if (s) ages.push((r.quand - s.lastSeenAt) / HOUR);
  const tr = tranche(r.prod.views);
  for (const k of CURVE_COUNTS) {
    const p = r.verdict.counts[k];
    const q = r.prod[k];
    const c = ((bench[tr] ??= {})[k] ??= { lues: 0, auDela10k: 0, auPasDeLaPage: 0, multiplesDe100: 0, prodDejaArrondie: 0, sousLaProdAuDelaArrondi: [], arrondiBorneRelMax: [], deltaRel: [] });
    c.lues++;
    if (p >= 10_000) {
      c.auDela10k++;
      if (p % curveStep(k, p) === 0) c.auPasDeLaPage++;
      // Les enregistrements, servis exacts (curveStep 1) : un sur cent tombe sur la centaine par hasard.
      if (p % 100 === 0) c.multiplesDe100++;
    }
    if (looksServed(k, q)) c.prodDejaArrondie++;
    if (p < q - curveStep(k, q) / 2) c.sousLaProdAuDelaArrondi.push(`${r.videoId} ${q} → ${p}`);
    // L'écart dû à l'arrondi, au plus : la moitié du pas (A), là où la page arrondit ; rien sous 10 000 ni sur les enregistrements.
    if (p > 0) c.arrondiBorneRelMax.push(curveStep(k, p) > 1 ? curveStep(k, p) / 2 / p : 0);
    if (q > 0) c.deltaRel.push((p - q) / q);
  }
}
const benchOut = Object.fromEntries(
  TRANCHES.filter((t) => bench[t]).map((t) => [
    t,
    Object.fromEntries(
      CURVE_COUNTS.map((k) => {
        const c = bench[t][k];
        return [
          k,
          {
            lues: c.lues,
            auDela10k: c.auDela10k,
            auPasDeLaPage: k === "saves" ? null : c.auPasDeLaPage,
            multiplesDe100: c.multiplesDe100,
            prodDejaArrondie: c.prodDejaArrondie,
            sousLaProdAuDelaArrondi: c.sousLaProdAuDelaArrondi,
            arrondiBorneRelMax: pct(max(c.arrondiBorneRelMax)),
            pageMoinsProdRelMedian: pct(quantile(c.deltaRel, 0.5), 1),
          },
        ];
      }),
    ),
  ]),
);

// ─── D : l'arrondi sur la courbe des 70 signaux de prod ─────────────────────

/** Un relevé de courbe (H+6/24/48) retrouvé dans les relevés d'un signal : le premier dans les 2 h de son échéance, hors admission. */
type Point = { s: Signal; i: number; h: (typeof CURVE_CHECKPOINTS_H)[number]; v: number; known: number; exact: boolean };
const points: Point[] = [];
const snapsOf = (s: Signal) => [...s.snapshots].sort((a, b) => a.at - b.at);
for (const s of curveSignals) {
  const snaps = snapsOf(s);
  for (const h of CURVE_CHECKPOINTS_H) {
    const due = s.publishedAt + h * HOUR;
    const i = snaps.findIndex((p) => p.at >= due && p.at < due + CHECKPOINT_WINDOW_MS && p.at !== s.curveStartedAt);
    if (i < 0) continue;
    // Ce que le Radar savait de la vidéo avant ce relevé : le relevé d'avant (la règle hybride décide là-dessus).
    points.push({ s, i, h, v: snaps[i].views, known: i > 0 ? snaps[i - 1].views : snaps[i].views, exact: !looksServed("views", snaps[i].views) });
  }
}

/** Les vues comme la page de la vidéo (src/app/pages/Video.js:111) les affiche — RECOPIÉ (composant, pas importable). */
const nfVideo = (n: number): string =>
  n >= 1e6 ? (n / 1e6).toFixed(2).replace(/0$/, "").replace(".", ",") + " M" : n >= 1e3 ? (n / 1e3).toFixed(1).replace(".", ",").replace(/,0$/, "") + " k" : String(Math.round(n));
/** Le message sous la courbe (src/app/pages/Video.js:145-150) — RECOPIÉ : « elle continue de monter » ou « l'essentiel est fait ». */
const growthMessage = (pts: { h: number; views: number }[]): string | null => {
  if (pts.length < 2) return null;
  const last = pts[pts.length - 1];
  const ref = pts.slice(0, -1).reverse().find((p) => last.h - p.h >= 20) ?? pts[0];
  return last.views - ref.views > Math.max(50, last.views * 0.01) ? "monte" : "fait";
};

/** Les gains d'au moins ce nombre de vues entre deux relevés : en deçà, l'erreur relative sur un gain de 2 vues ne dit rien. */
const MATERIAL_GAIN = 1_000;

type SegStats = { n: number; absMax: number | null; relMedian: string | null; p90: string | null; relMaxGainsDe1000: string | null; nGainsDe1000: number };
type Scenario = {
  releves: number;
  arrondis: number;
  dejaArrondisEnProd: number;
  point: Record<string, { n: number; relMax: string | null; relMedian: string | null; absMax: number | null; borne: string | null }>;
  segments: Record<string, SegStats>;
  pireSegmentDe1000: string | null;
  segmentsQuiBaissent: string[];
  segmentsAplatis: string[];
  pente: { courbes: number; changees: string[]; ecartMaxPoints: number | null };
  affichage: { pointsAutrementAffiches: number; messagesChanges: string[] };
};
function scenario(take: (p: Point) => boolean, mode: Mode): Scenario {
  const taken = points.filter((p) => take(p));
  const sub = taken.filter((p) => p.exact);
  const pointErr: Record<string, { rel: number[]; abs: number[]; v: number[] }> = {};
  const segErr: Record<string, { rel: number[]; abs: number[]; material: number[] }> = {};
  let worst: { rel: number; what: string } | null = null;
  const down: string[] = [];
  const flat: string[] = [];
  let curves = 0;
  const changed: string[] = [];
  const slopeDiff: number[] = [];
  let shown = 0;
  const messages: string[] = [];
  for (const s of curveSignals) {
    const mine = sub.filter((p) => p.s === s);
    if (!mine.length) continue;
    const exact = snapsOf(s);
    const page = exact.map((p) => ({ ...p }));
    const hOf = (at: number) => Math.round((at - s.publishedAt) / HOUR);
    for (const p of mine) {
      page[p.i].views = pageValue("views", p.v, mode);
      const e = (pointErr[tranche(p.v)] ??= { rel: [], abs: [], v: [] });
      e.abs.push(Math.abs(page[p.i].views - p.v));
      e.rel.push(Math.abs(page[p.i].views - p.v) / p.v);
      e.v.push(p.v);
      if (nfVideo(page[p.i].views) !== nfVideo(p.v)) shown++;
    }
    const changedIdx = new Set(mine.map((p) => p.i));
    for (let i = 1; i < exact.length; i++) {
      if (!changedIdx.has(i) && !changedIdx.has(i - 1)) continue;
      const g = exact[i].views - exact[i - 1].views;
      const g2 = page[i].views - page[i - 1].views;
      const what = `${s.videoId} H+${hOf(exact[i - 1].at)}→H+${hOf(exact[i].at)} : ${exact[i - 1].views} → ${exact[i].views} (+${g}), page ${page[i - 1].views} → ${page[i].views} (${g2 >= 0 ? "+" : ""}${g2})`;
      if (g >= 0 && g2 < 0) down.push(what);
      if (g > 0 && g2 === 0) flat.push(what);
      if (g <= 0) continue;
      const rel = Math.abs(g2 - g) / g;
      const e = (segErr[tranche(exact[i].views)] ??= { rel: [], abs: [], material: [] });
      e.rel.push(rel);
      e.abs.push(Math.abs(g2 - g));
      if (g >= MATERIAL_GAIN) {
        e.material.push(rel);
        if (!worst || rel > worst.rel) worst = { rel, what };
      }
    }
    curves++;
    const a = lastGrowth(curveOf(exact, s.publishedAt));
    const b = lastGrowth(curveOf(page, s.publishedAt));
    if (a && b) {
      if (a.pct !== b.pct) changed.push(`${s.videoId} H+${a.fromH}→H+${a.toH} : ${a.pct} % exact, ${b.pct} % page`);
      slopeDiff.push(Math.abs(a.pct - b.pct));
    }
    const m1 = growthMessage(curveOf(exact, s.publishedAt));
    const m2 = growthMessage(curveOf(page, s.publishedAt));
    if (m1 !== m2) messages.push(`${s.videoId} : « ${m1} » exact, « ${m2} » page (dernier relevé ${exact[exact.length - 1].views})`);
  }
  return {
    releves: taken.length,
    arrondis: sub.length,
    dejaArrondisEnProd: taken.length - sub.length,
    point: Object.fromEntries(
      TRANCHES.filter((t) => pointErr[t]).map((t) => {
        const e = pointErr[t];
        // Au pire : le pas entier (plancher) ou sa moitié (plus proche), sur le plus petit relevé de la tranche.
        const lowest = Math.min(...e.v);
        const bound = (mode === "proche" ? pageStep(lowest) / 2 : pageStep(lowest) - 1) / lowest;
        return [t, { n: e.rel.length, relMax: pct(max(e.rel)), relMedian: pct(quantile(e.rel, 0.5)), absMax: max(e.abs), borne: pct(bound) }];
      }),
    ),
    segments: Object.fromEntries(
      TRANCHES.filter((t) => segErr[t]).map((t) => {
        const e = segErr[t];
        return [t, { n: e.rel.length, absMax: max(e.abs), relMedian: pct(quantile(e.rel, 0.5), 2), p90: pct(quantile(e.rel, 0.9), 2), relMaxGainsDe1000: pct(max(e.material), 2), nGainsDe1000: e.material.length }];
      }),
    ),
    pireSegmentDe1000: worst ? `${pct(worst.rel, 2)} — ${worst.what}` : null,
    segmentsQuiBaissent: down,
    segmentsAplatis: flat,
    pente: { courbes: curves, changees: changed, ecartMaxPoints: max(slopeDiff) },
    affichage: { pointsAutrementAffiches: shown, messagesChanges: messages },
  };
}

/** Les compteurs rangés (les derniers, un jeu par signal) servis par la page : erreur par compteur, ratio, seuils. */
function countersScenario(take: (s: Signal) => boolean, mode: Mode) {
  const err: Record<string, Record<string, number[]>> = {};
  const skipped: Partial<Record<string, number>> = {};
  const ratio: number[] = [];
  const flips = { gardee: 0, courbe: 0, seVoitPartager: 0 };
  const match: Partial<Record<string, number>> = {};
  let n = 0;
  for (const s of curveSignals.filter(take)) {
    n++;
    const exact = countsOf(s);
    const page = { ...exact };
    for (const k of CURVE_COUNTS) {
      if (looksServed(k, exact[k])) {
        count(skipped, k);
        continue;
      }
      page[k] = pageValue(k, exact[k], mode);
      if (exact[k] > 0) ((err[k] ??= {})[tranche(s.views)] ??= []).push(Math.abs(page[k] - exact[k]) / exact[k]);
    }
    const r1 = ratioOf(exact.views, exact.authorFans);
    const r2 = ratioOf(page.views, page.authorFans);
    ratio.push(Math.abs(r2 - r1) / r1);
    if (r1 >= KEEP_MIN_RATIO !== r2 >= KEEP_MIN_RATIO) flips.gardee++;
    if (r1 >= CURVE_MIN_RATIO !== r2 >= CURVE_MIN_RATIO) flips.courbe++;
    if (sharesWell(exact) !== sharesWell(page)) flips.seVoitPartager++;
    // La mesure livrée (curveMatch) devant un pur arrondi, le payant lu dans la foulée : jamais « ecart ».
    count(match, curveMatch({ kind: "read", counts: page }, exact));
  }
  return {
    signaux: n,
    dejaArrondisEnProd: skipped,
    relMax: Object.fromEntries(Object.entries(err).map(([k, byT]) => [k, Object.fromEntries(TRANCHES.filter((t) => byT[t]).map((t) => [t, `${pct(max(byT[t]))} (n=${byT[t].length})`]))])),
    ratioRelMax: pct(max(ratio)),
    seuilsFranchis: flips,
    curveMatch: match,
  };
}

const all = (_: Point) => true;
const hybrid = (p: Point) => p.known < HYBRID_MAX && p.v < HYBRID_MAX;
const allSnaps = curveSignals.flatMap((s) => s.snapshots);
const courbe = {
  signaux: curveSignals.length,
  // La voie gratuite des comptes (depuis le 13/11) range déjà des vues servies par la page dans ces courbes.
  relevesDejaServisParLaPage: `${allSnaps.filter((p) => looksServed("views", p.views)).length}/${allSnaps.length}`,
  relevesRetrouves: points.length,
  parEcheance: Object.fromEntries(CURVE_CHECKPOINTS_H.map((h) => [`H+${h}`, points.filter((p) => p.h === h).length])),
  parTranche: Object.fromEntries(TRANCHES.map((t) => [t, points.filter((p) => tranche(p.v) === t).length])),
  vuesMinMax: [Math.min(...points.map((p) => p.v)), Math.max(...points.map((p) => p.v))],
  page: { proche: scenario(all, "proche"), plancher: scenario(all, "plancher") },
  hybride: { proche: scenario(hybrid, "proche"), plancher: scenario(hybrid, "plancher") },
  compteurs: {
    page: { proche: countersScenario(() => true, "proche"), plancher: countersScenario(() => true, "plancher") },
    hybride: { proche: countersScenario((s) => s.views < HYBRID_MAX, "proche"), plancher: countersScenario((s) => s.views < HYBRID_MAX, "plancher") },
  },
};

// ─── E : la règle hybride, en crédits ────────────────────────────────────────

type Usage = { poste: string; day: string; credits: number; calls: number; errors: number; measured?: Record<string, number>; saved?: Record<string, number> };
const usage = jsonl<Usage>(join(snapDir, "radarUsage.jsonl"))
  .filter((u) => u.poste === "curve")
  .sort((a, b) => a.day.localeCompare(b.day));
const credits = usage.reduce((t, u) => t + u.credits, 0);
// La mesure côte à côte livrée (CURVE_FREE faux) : vide tant que la branche n'a pas tourné sur un déploiement. Relancer
// ce rejeu sur un instantané frais après la bascule en mesure la lit ici.
const measured: Record<string, number> = {};
for (const u of usage) for (const [k, n] of Object.entries(u.measured ?? {})) measured[k] = (measured[k] ?? 0) + n;
const savedCurve = usage.reduce((t, u) => t + (u.saved?.curve ?? 0), 0);
const firstDay = usage[0]?.day;
const lastDay = "2026-11-20";
const daysSpan = firstDay ? Math.round((Date.parse(lastDay) - Date.parse(firstDay)) / 86_400_000) + 1 : 0;
const last7 = usage.filter((u) => u.day >= "2026-11-14").reduce((t, u) => t + u.credits, 0);
const activeDays = usage.filter((u) => u.credits >= 5);
const activeCredits = activeDays.reduce((t, u) => t + u.credits, 0);
// Repli : une page lue par la voie qui ne donne pas ses six nombres part au payant (bancs du 20/11 : « hors région »).
const benchReads = reads.filter((r) => r.banc !== "page gardée");
const repli = benchReads.length ? benchReads.filter((r) => r.verdict.kind !== "read").length / benchReads.length : 0;
const pageReads = points.filter((p) => p.known < HYBRID_MAX).length;
const crossing = points.filter((p) => p.known < HYBRID_MAX && p.v >= HYBRID_MAX).length;
const hybridAvoided = Math.floor((pageReads - crossing) * (1 - repli));
const fullAvoided = Math.floor(points.length * (1 - repli));
const credit = {
  mesureEnProd: Object.keys(measured).length ? measured : "aucune (la branche n'a pas tourné sur un déploiement)",
  savedCurveEnProd: savedCurve,
  posteCurve: usage.map((u) => `${u.day} : ${u.credits} crédits, ${u.calls} appels, ${u.errors} erreurs`),
  creditsDepuis: { premierJour: firstDay, jours: daysSpan, credits, parJour: +(credits / Math.max(1, daysSpan)).toFixed(2) },
  joursActifs: { jours: activeDays.map((u) => u.day), credits: activeCredits, parJour: +(activeCredits / Math.max(1, activeDays.length)).toFixed(1) },
  septDerniersJours: last7,
  repliDesBancs: `${benchReads.filter((r) => r.verdict.kind !== "read").length}/${benchReads.length}`,
  releves: points.length,
  hybride: {
    seuil: HYBRID_MAX,
    pageLue: pageReads,
    franchissent: crossing,
    payant: points.length - pageReads,
    evitesPlancher: hybridAvoided,
    partEvitee: +(hybridAvoided / Math.max(1, points.length)).toFixed(3),
  },
  toutPage: { evitesPlancher: fullAvoided, partEvitee: +(fullAvoided / Math.max(1, points.length)).toFixed(3) },
};

const out = {
  quand: new Date().toISOString(),
  requetesTikTok: 0,
  A_regle: { paires: pairs.length, au_dela_10k: pairs.filter((p) => p.paid.views >= 10_000).length, classes: Object.fromEntries(Object.entries(rule).sort()) },
  B_bancs: { lectures: reads.length, videos: new Set(reads.map((r) => r.videoId)).size, verdicts, ageDeLaProdHeures: { min: min(ages), median: quantile(ages, 0.5), max: max(ages) }, parTranche: benchOut },
  C_essais: {
    essais: trials.length,
    gratuitMoinsPayantMinutes: { min: min(gaps), median: quantile(gaps, 0.5), max: max(gaps) },
    champs: fields,
    couverture: coverage,
    vues: agreeOut,
    publicationEcartSecondes: { median: quantile(pub, 0.5), auPlus60s: pub.filter((x) => x <= 60).length, auDelaDUneHeure: pub.filter((x) => x > 3600).length, n: pub.length },
    autresChamps: Object.fromEntries(Object.entries(other).map(([k, [same, n]]) => [k, `${same}/${n} identiques`])),
  },
  D_courbe: courbe,
  E_credits: credit,
};
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "courbe-rejeu.json"), JSON.stringify(out, null, 2) + "\n");
console.log(JSON.stringify(out, null, 2));
