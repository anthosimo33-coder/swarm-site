/**
 * Le test A/B de l'onboarding avant le paywall (26/11/2026) : le bras écrit sur le compte, et la mesure envoyée à PostHog.
 *
 * - `enroll` : à l'inscription, la page envoie le bras tiré dans le navigateur (src/ab.js) ; il est écrit sur le compte
 *   s'il vient d'être créé (moins de 30 min), une seule fois, et l'événement `inscription` part avec l'identifiant anonyme
 *   du navigateur rattaché au compte. Un compte d'avant, ou de test, reste hors du test.
 * - `events` (POST /e sur convex.site) : les événements des pages (onboarding_vu, paywall_vu…), relayés à PostHog. Aucun
 *   script PostHog ni cookie dans les pages ; la clé reste ici.
 * - `capture` : l'envoi à PostHog. Sans POSTHOG_KEY dans l'environnement du déploiement, rien ne part.
 * Le paiement (`paiement`) part de convex/whop.ts, à la réception du paiement.
 */
import { v } from "convex/values";
import { httpAction, internalAction, mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { liveUserId } from "./session";
import { ENROLL_WINDOW_MS, VISITOR_RE, batchBody, isTestEmail, parsePageEvent, testProps } from "./abMath";

const HOST = () => (process.env.POSTHOG_HOST || "https://eu.i.posthog.com").replace(/\/+$/, "");

export const capture = internalAction({
  args: {
    events: v.array(v.object({ event: v.string(), distinctId: v.string(), properties: v.any(), alias: v.optional(v.string()) })),
  },
  handler: async (_ctx, { events }) => {
    const key = process.env.POSTHOG_KEY;
    if (!key || !events.length) return "PostHog : pas de clé, rien d'envoyé";
    const res = await fetch(`${HOST()}/batch/`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(batchBody(key, events)) });
    if (!res.ok) throw new Error(`PostHog ${res.status} : ${(await res.text()).slice(0, 200)}`);
    return `PostHog : ${events.length} événement(s)`;
  },
});

export const enroll = mutation({
  args: { bras: v.union(v.literal("A"), v.literal("B")), visiteur: v.string(), force: v.optional(v.boolean()) },
  handler: async (ctx, { bras, visiteur, force }) => {
    const userId = await liveUserId(ctx);
    if (userId === null) return null;
    const user = await ctx.db.get(userId);
    if (user === null) return null;
    if (user.abOnboarding) return user.abOnboarding;
    if (Date.now() - user._creationTime > ENROLL_WINDOW_MS || isTestEmail(user.email) || !VISITOR_RE.test(visiteur)) return null;
    await ctx.db.patch(userId, { abOnboarding: bras, abVisiteur: visiteur, ...(force ? { abForce: true } : {}) });
    await ctx.scheduler.runAfter(0, internal.ab.capture, {
      events: [{ event: "inscription", distinctId: userId, properties: testProps(bras, !!force), alias: visiteur }],
    });
    return bras;
  },
});

const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" };

export const events = httpAction(async (ctx, request) => {
  const e = parsePageEvent(await request.text());
  if (e) {
    await ctx.scheduler.runAfter(0, internal.ab.capture, {
      events: [{ event: e.event, distinctId: e.user ?? e.visitor, properties: { ...e.props, ...testProps(e.bras, e.forced) } }],
    });
  }
  // Même réponse que l'événement soit gardé ou non : la page n'en fait rien.
  return new Response(null, { status: 204, headers: CORS });
});

export const eventsPreflight = httpAction(async () => new Response(null, { status: 204, headers: CORS }));
