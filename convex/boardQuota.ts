import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { hmacOf } from "./coverSign";

/**
 * Quota de pages des abonnés (audit S22, 19/11 ; niveaux décidés le 20/11). Un compte Pro pouvait lire toute la base
 * (141 366 pages en prod le 20/11) en demandant les clés une par une à boards.get. Une page ne se lit plus qu'avec un
 * laissez-passer : boards.passes (mutation) compte les pages et en délivre au plus 300 par heure et 1 500 par 24 h ;
 * au-delà, refus jusqu'à la fin de la fenêtre, que l'app affiche (« les nouvelles pages rouvrent à 15 h 37 »).
 *
 * Pourquoi un laissez-passer : boards.get est une requête réactive, qui ne peut rien écrire ; et si elle lisait un
 * compteur, chaque page ouverte relancerait (et relirait en entier) toutes celles que la personne a déjà ouvertes.
 * Le laissez-passer est signé (HMAC de la personne, de la clé et de l'échéance) : boards.get le vérifie sans rien lire.
 * Il vaut 2 h : une page relue dans ce délai ne compte pas, et l'app le garde en mémoire.
 *
 * Le compteur : une ligne par compte (`pageQuota`), deux fenêtres fixes comme convex/authLimits.ts (la fenêtre part de
 * la première page comptée après la précédente), une écriture par lot de pages demandées ensemble, aucune pour un refus
 * (sauf la première de la fenêtre, tracée dans les journaux Convex).
 */
export const PAGE_QUOTA = { hour: 300, day: 1500 } as const;
const HOUR = 3_600_000, DAY = 24 * HOUR;
/** Durée d'un laissez-passer. */
export const PASS_MS = 2 * HOUR;
/** Clés comptées au plus par appel de boards.passes (l'app découpe ses demandes en lots de cette taille). */
export const PASS_BATCH = 60;
/** Longueur au-delà de laquelle une clé n'en est pas une (ni comptée, ni servie). */
export const KEY_MAX = 200;
/** Lisibles sans laissez-passer : les chiffres publics (déjà servis sans compte par stats.get). */
export const FREE_KEYS: ReadonlySet<string> = new Set(["stats"]);
/** Code de l'erreur de boards.get sans laissez-passer valable : l'app en demande un et reprend l'abonnement. */
export const PASS_ERROR = "LAISSEZ_PASSER";

// ─── La signature ────────────────────────────────────────────────────────────────────────────────────────────────
// Même source que convex/coverSign.ts (COVER_SECRET, sinon JWT_PRIVATE_KEY), mais une clé dérivée avec son propre
// libellé : un laissez-passer ne vaut jamais signature d'image, ni l'inverse.
let signer: { id: string; sign: (m: Uint8Array) => Uint8Array } | null = null;
const utf8 = (s: string) => new TextEncoder().encode(s);
function sign(message: string): string | null {
  const own = process.env.COVER_SECRET, auth = process.env.JWT_PRIVATE_KEY;
  const id = own ? `own:${own}` : auth ? `auth:${auth}` : "";
  if (!id) return null;
  if (signer?.id !== id) signer = { id, sign: hmacOf(hmacOf(utf8(own ?? auth!))(utf8("kopycat:laissez-passer-pages:1"))) };
  const mac = signer.sign(utf8(message));
  let hex = "";
  for (let i = 0; i < 12; i++) hex += mac[i].toString(16).padStart(2, "0");
  return hex;
}

/** Le laissez-passer d'une page pour un compte, jusqu'à `exp` (ms) ; null sans secret de signature. */
export function passFor(userId: string, key: string, exp: number): string | null {
  const s = sign(`page:${userId}:${exp}:${key}`);
  return s ? `${exp.toString(36)}.${s}` : null;
}

/** Le laissez-passer est-il celui de cette page, de ce compte, et encore valable ? (sans rien lire) */
export function passOk(userId: string, key: string, pass: string | undefined, now: number): boolean {
  if (typeof pass !== "string" || pass.length > 40) return false;
  const dot = pass.indexOf(".");
  if (dot < 1) return false;
  const exp = parseInt(pass.slice(0, dot), 36);
  // Une échéance passée, ou plus lointaine que ce que boards.passes délivre (retouchée), ne vaut rien.
  if (!Number.isFinite(exp) || exp <= now || exp > now + PASS_MS) return false;
  const want = passFor(userId, key, exp);
  if (want === null || want.length !== pass.length) return false;
  let d = 0;
  for (let i = 0; i < want.length; i++) d |= want.charCodeAt(i) ^ pass.charCodeAt(i);
  return d === 0;
}

/**
 * Compte `n` pages de plus pour ce compte : rend combien sont accordées (dans l'ordre demandé) et, si toutes ne le sont
 * pas, l'heure (ms) à laquelle de nouvelles pages rouvrent. Une écriture au plus.
 */
export async function takePages(ctx: MutationCtx, userId: Id<"users">, n: number, now: number): Promise<{ granted: number; until: number | null }> {
  if (n <= 0) return { granted: 0, until: null };
  const row = await ctx.db.query("pageQuota").withIndex("by_user", (q) => q.eq("userId", userId)).first();
  let hour = row?.hour ?? now, hourN = row?.hourN ?? 0, day = row?.day ?? now, dayN = row?.dayN ?? 0;
  if (now - hour >= HOUR) { hour = now; hourN = 0; }
  if (now - day >= DAY) { day = now; dayN = 0; }
  const granted = Math.max(0, Math.min(n, PAGE_QUOTA.hour - hourN, PAGE_QUOTA.day - dayN));
  hourN += granted;
  dayN += granted;
  const hourFull = hourN >= PAGE_QUOTA.hour, dayFull = dayN >= PAGE_QUOTA.day;
  const until = granted === n ? null : dayFull && hourFull ? Math.max(hour + HOUR, day + DAY) : dayFull ? day + DAY : hour + HOUR;
  // Le premier refus d'une fenêtre est tracé (journaux Convex), une fois : les suivants n'écrivent rien.
  const warn = until !== null && row?.warned !== until;
  if (warn) {
    console.warn(`[quota S22] compte ${userId} : quota de pages atteint (${hourN}/${PAGE_QUOTA.hour} sur l'heure, ${dayN}/${PAGE_QUOTA.day} sur 24 h), nouvelles pages refusées jusqu'au ${new Date(until).toISOString()}`);
  }
  if (granted === 0 && !warn) return { granted, until };
  const fields = { hour, hourN, day, dayN, ...(warn ? { warned: until } : {}) };
  if (row) await ctx.db.patch(row._id, fields);
  else await ctx.db.insert("pageQuota", { userId, ...fields });
  return { granted, until };
}
