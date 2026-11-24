import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { internalMutation, type MutationCtx } from "./_generated/server";
import { takeHit } from "./authLimits";

/**
 * Mot de passe oublié, parcours B du canevas (24/11) : un code à 6 chiffres part par e-mail, la personne le tape sur la
 * page restée ouverte, puis choisit un nouveau mot de passe et entre dans l'app. Les trois étapes passent par le
 * fournisseur « password » de convex/auth.ts (flows `reset`, `reset-check`, `reset-verification`) ; ce module garde
 * les codes.
 *
 * Ce qui ne doit rien dire de l'existence d'un compte : la réponse à la demande, la durée de la demande (l'envoi part en
 * tâche planifiée), et la vie du code (essais, expiration) — une adresse sans compte a sa ligne comme les autres, avec un
 * code tiré au hasard que personne ne reçoit.
 */

export const CODE_TTL_MS = 15 * 60_000;
/** Essais sur un même code ; le dernier raté efface le code. */
export const CODE_TRIES = 5;
/** Codes demandés pour un même e-mail : 3 par heure (soit 15 essais par heure au plus, pour 1 million de codes). */
export const SEND_PER_EMAIL = 3;
export const SEND_PER_EMAIL_WINDOW_MS = 60 * 60_000;
/** Tous e-mails confondus : borne l'envoi en masse (quota Resend), bien au-delà d'un usage réel. */
export const SEND_GLOBAL = 200;
export const SEND_GLOBAL_WINDOW_MS = 10 * 60_000;

const hex = (buf: ArrayBuffer) => Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
const sha256 = async (s: string) => hex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)));

/** L'empreinte d'un e-mail, clé de sa ligne et de son compteur d'envois. */
export const resetKey = async (email: string) => "reset:" + (await sha256(email.trim().toLowerCase()));
/** L'empreinte d'un code pour un e-mail (une même suite de chiffres n'a pas la même empreinte d'un e-mail à l'autre). */
export const codeHash = async (key: string, code: string) => sha256(`${key}:${code}`);

/** Un code à 6 chiffres, uniforme (tirage rejeté au-delà du dernier million complet). */
export function newCode(): string {
  const buf = new Uint32Array(1);
  const limit = Math.floor(0x1_0000_0000 / 1_000_000) * 1_000_000;
  do crypto.getRandomValues(buf); while (buf[0] >= limit);
  return String(buf[0] % 1_000_000).padStart(6, "0");
}

/** Une empreinte que rien ne reproduit : le code d'une adresse sans compte. */
export function blankHash(): string {
  const buf = new Uint8Array(32);
  crypto.getRandomValues(buf);
  return hex(buf.buffer);
}

async function dropExpired(ctx: MutationCtx, now: number) {
  for (const row of await ctx.db.query("passwordResets").withIndex("by_expires", (q) => q.lt("expiresAt", now)).take(20)) {
    await ctx.db.delete(row._id);
  }
}

/**
 * Une demande de code. Rend « limited » au-delà des plafonds (même réponse qu'il y ait un compte ou non), sinon « ok ».
 * Le code de la demande précédente, s'il y en a un, ne marche plus. L'e-mail part par une tâche planifiée
 * (convex/mail.ts) : seule une adresse qui a un compte « mot de passe » en reçoit un.
 */
export const request = internalMutation({
  args: { email: v.string(), key: v.string(), hash: v.string(), blank: v.string(), code: v.string() },
  handler: async (ctx, { email, key, hash, blank, code }): Promise<"ok" | "limited"> => {
    const now = Date.now();
    if (!(await takeHit(ctx, key, SEND_PER_EMAIL, SEND_PER_EMAIL_WINDOW_MS))) return "limited";
    if (!(await takeHit(ctx, "resetSend", SEND_GLOBAL, SEND_GLOBAL_WINDOW_MS))) return "limited";
    await dropExpired(ctx, now);
    for (const old of await ctx.db.query("passwordResets").withIndex("by_key", (q) => q.eq("key", key)).collect()) {
      await ctx.db.delete(old._id);
    }
    const account = await ctx.db.query("authAccounts")
      .withIndex("providerAndAccountId", (q) => q.eq("provider", "password").eq("providerAccountId", email)).first();
    await ctx.db.insert("passwordResets", {
      key, userId: account?.userId ?? null, login: account?.providerAccountId ?? null,
      codeHash: account ? hash : blank, expiresAt: now + CODE_TTL_MS, tries: 0,
    });
    if (account) await ctx.scheduler.runAfter(0, internal.mail.sendResetCode, { to: account.providerAccountId, code });
    return "ok";
  },
});

export type CheckResult =
  | { ok: true; userId: Id<"users">; login: string }
  | { ok: false; code: "CODE_INVALIDE"; left: number }
  | { ok: false; code: "CODE_EXPIRE" | "CODE_EPUISE" };

/**
 * Le code est-il le bon ? Un raté compte un essai ; le dernier raté efface le code. `consume` : le code juste est effacé
 * (il a servi). Rend son verdict au lieu de lever une erreur : une erreur annulerait l'essai compté.
 */
export const check = internalMutation({
  args: { key: v.string(), hash: v.string(), consume: v.boolean() },
  handler: async (ctx, { key, hash, consume }): Promise<CheckResult> => {
    const row = await ctx.db.query("passwordResets").withIndex("by_key", (q) => q.eq("key", key)).first();
    // Aucun code demandé pour cette adresse (ou déjà effacé) : le même refus qu'un mauvais code.
    if (!row) return { ok: false, code: "CODE_INVALIDE", left: CODE_TRIES };
    if (row.expiresAt <= Date.now()) {
      await ctx.db.delete(row._id);
      return { ok: false, code: "CODE_EXPIRE" };
    }
    if (row.codeHash !== hash || row.userId === null || row.login === null) {
      const tries = row.tries + 1;
      if (tries >= CODE_TRIES) {
        await ctx.db.delete(row._id);
        return { ok: false, code: "CODE_EPUISE" };
      }
      await ctx.db.patch(row._id, { tries });
      return { ok: false, code: "CODE_INVALIDE", left: CODE_TRIES - tries };
    }
    if (consume) await ctx.db.delete(row._id);
    return { ok: true, userId: row.userId, login: row.login };
  },
});
