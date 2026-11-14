"use node";

import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";
import { accountLang } from "./textLang";

/**
 * La langue des comptes, calculée HORS de la synchro : le détecteur (tinyld) pèse ~50 Mo, et la synchro de prod
 * mourait le 14/11 à la limite de 512 Mo. La synchro envoie les textes des comptes jamais calculés ; ici on les lit et
 * on range la langue (table accountLangs) ; la synchro suivante la reprend.
 */
export const detect = internalAction({
  args: { items: v.array(v.object({ accountId: v.string(), texts: v.array(v.string()) })) },
  handler: async (ctx, { items }) => {
    const out = items.map((it) => ({ accountId: it.accountId, lang: accountLang(it.texts) }));
    for (let i = 0; i < out.length; i += 400) await ctx.runMutation(internal.radarStore.saveLangs, { items: out.slice(i, i + 400), now: Date.now() });
    return { done: out.length, found: out.filter((x) => x.lang).length };
  },
});
