/**
 * Le test A/B de l'onboarding avant le paywall (26/11/2026), sans base ni réseau : ce que le serveur accepte d'une page et
 * ce qu'il envoie à PostHog. Testé par scripts/ab.test.mjs.
 *
 * Bras A : le parcours d'avant (inscription, aperçu, formules). Bras B : l'onboarding /plan (maquette B1 retenue), puis
 * l'inscription au milieu, puis le paywall. Le bras est tiré dans le navigateur à l'arrivée sur le parcours (src/ab.js),
 * gardé, puis écrit sur le compte à l'inscription (ab.enroll).
 */

export const TEST = "onboarding-avant-paywall";
export type Bras = "A" | "B";

/** Les événements qu'une page peut envoyer. Les autres (inscription, paiement) ne partent que du serveur. */
export const PAGE_EVENTS = new Set(["ab_exposition", "onboarding_vu", "onboarding_reponse", "paywall_vu", "paiement_commence"]);

/** L'identifiant anonyme d'un navigateur : un UUID tiré par la page (crypto.randomUUID). */
export const VISITOR_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/** Les comptes de test (domaines réservés aux exemples, cf. convex/mail.ts) n'entrent pas dans le test. */
const TEST_DOMAINS = new Set(["exemple.fr", "ex.fr", "exemple.com", "example.com", "example.org", "example.net"]);
export const isTestEmail = (email: string | null | undefined) => !!email && TEST_DOMAINS.has(email.split("@").pop()!.toLowerCase());

/** Un compte n'entre dans le test qu'à sa création : passé ce délai, c'est un compte d'avant (hors test). */
export const ENROLL_WINDOW_MS = 30 * 60 * 1000;

export type PageEvent = { event: string; visitor: string; user: string | null; bras: Bras; props: Record<string, string | number | boolean>; forced: boolean };

/**
 * Lit ce qu'une page envoie à /e (texte JSON : { e, v, b, u?, f?, p? } ; u : l'id du compte connecté, s'il l'est). Rend null pour tout ce qui ne colle pas : événement
 * inconnu, identifiant qui n'est pas un UUID, bras inconnu, propriétés autres que des valeurs simples et courtes.
 */
export function parsePageEvent(body: string): PageEvent | null {
  if (typeof body !== "string" || body.length > 2000) return null;
  let j: unknown;
  try { j = JSON.parse(body); } catch { return null; }
  if (!j || typeof j !== "object" || Array.isArray(j)) return null;
  const o = j as Record<string, unknown>;
  if (typeof o.e !== "string" || !PAGE_EVENTS.has(o.e)) return null;
  if (typeof o.v !== "string" || !VISITOR_RE.test(o.v)) return null;
  if (o.b !== "A" && o.b !== "B") return null;
  const props: Record<string, string | number | boolean> = {};
  if (o.p !== undefined) {
    if (!o.p || typeof o.p !== "object" || Array.isArray(o.p)) return null;
    const entries = Object.entries(o.p as Record<string, unknown>);
    if (entries.length > 8) return null;
    for (const [k, val] of entries) {
      if (!/^[a-z_]{1,24}$/.test(k)) return null;
      if (typeof val === "string") { if (val.length > 80) return null; props[k] = val; }
      else if (typeof val === "number" && Number.isFinite(val)) props[k] = val;
      else if (typeof val === "boolean") props[k] = val;
      else return null;
    }
  }
  const user = typeof o.u === "string" && /^[a-z0-9]{20,40}$/.test(o.u) ? o.u : null;
  return { event: o.e, visitor: o.v, user, bras: o.b, props, forced: o.f === true };
}

/** Les propriétés communes de tout événement du test. `force` : le bras a été imposé par ?bras= (à exclure de l'analyse). */
export const testProps = (bras: Bras, forced: boolean) => ({ test: TEST, bras, $set: { bras_onboarding: bras }, ...(forced ? { force: true } : {}) });

/** Le corps d'un envoi groupé à PostHog (POST {hôte}/batch/). `alias` : l'identifiant anonyme à rattacher au compte. */
export function batchBody(apiKey: string, events: { event: string; distinctId: string; properties: Record<string, unknown>; alias?: string }[], now = new Date()) {
  const batch: Record<string, unknown>[] = [];
  for (const e of events) {
    if (e.alias) batch.push({ event: "$identify", distinct_id: e.distinctId, properties: { $anon_distinct_id: e.alias }, timestamp: now.toISOString() });
    batch.push({ event: e.event, distinct_id: e.distinctId, properties: e.properties, timestamp: now.toISOString() });
  }
  return { api_key: apiKey, batch };
}
