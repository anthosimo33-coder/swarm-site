import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";

/** La clé du compteur d'échecs de connexion d'un e-mail (haché : audit S12). */
export const signInKey = async (email: string) =>
  "signIn:" + Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(email.trim().toLowerCase()))))
    .map((b) => b.toString(16).padStart(2, "0")).join("");

/**
 * Limite à fenêtre fixe : au plus `max` passages par `windowMs` pour une clé (ex. « signUp », convex/auth.ts). Rend faux
 * au-delà ; un passage refusé n'est pas compté.
 */
export const hit = internalMutation({
  args: { key: v.string(), max: v.number(), windowMs: v.number() },
  handler: async (ctx, { key, max, windowMs }): Promise<boolean> => {
    const now = Date.now();
    const row = await ctx.db.query("authLimits").withIndex("by_key", (q) => q.eq("key", key)).first();
    if (!row) { await ctx.db.insert("authLimits", { key, n: 1, since: now }); return true; }
    if (now - row.since >= windowMs) { await ctx.db.patch(row._id, { n: 1, since: now }); return true; }
    if (row.n >= max) return false;
    await ctx.db.patch(row._id, { n: row.n + 1 });
    return true;
  },
});

/** La clé est-elle au plafond dans sa fenêtre ? (sans compter de passage) */
export const blocked = internalQuery({
  args: { key: v.string(), max: v.number(), windowMs: v.number() },
  handler: async (ctx, { key, max, windowMs }): Promise<boolean> => {
    const row = await ctx.db.query("authLimits").withIndex("by_key", (q) => q.eq("key", key)).first();
    return !!row && Date.now() - row.since < windowMs && row.n >= max;
  },
});

/** Remet une clé à zéro (connexion réussie). */
export const clear = internalMutation({
  args: { key: v.string() },
  handler: async (ctx, { key }) => {
    const row = await ctx.db.query("authLimits").withIndex("by_key", (q) => q.eq("key", key)).first();
    if (row) await ctx.db.delete(row._id);
  },
});
