// Le test A/B de l'onboarding avant le paywall (26/11/2026, convex/ab.ts).
//
// A : le parcours d'avant (/inscription, puis l'aperçu et les formules). B : l'onboarding /plan (maquette B1), qui demande
// le compte au milieu, puis son paywall. Le bras est tiré à l'arrivée sur le parcours (la première visite de /inscription ou
// de /plan), une fois pour toutes dans ce navigateur, puis écrit sur le compte à l'inscription (ab.enroll) : la même
// personne garde le même bras, et l'app le relit sur son compte depuis n'importe quel appareil.
//
// ?bras=A ou ?bras=B impose le bras (essais) ; ses événements portent « force » et sortent de l'analyse. Un navigateur
// piloté (tests) reste en A sans rien envoyer, sauf bras imposé.
//
// L'interrupteur : le tirage ne tourne qu'avec VITE_AB_ONBOARDING=1 au build (Vercel). Sans lui, tout le monde reste en A
// (le parcours d'avant) et seul ?bras= ouvre /plan : le site peut partir avant le backend et la clé PostHog.
//
// La mesure : chaque événement part à convex.site/e (déjà permis par la CSP), qui le relaie à PostHog. Aucun cookie, aucun
// script PostHog dans la page ; deux clés du stockage local : le bras et un identifiant anonyme tiré au hasard.

const ARM = 'kc.ab.onboarding';
const FORCED = 'kc.ab.force';
const VISITOR = 'kc.visiteur';

const read = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const write = (k, v) => { try { localStorage.setItem(k, v); } catch { /* stockage refusé : le bras se retire à chaque visite */ } };
const robot = () => typeof navigator !== 'undefined' && navigator.webdriver === true;

/**
 * Le bras, sans effet de bord (testé par scripts/ab.test.mjs). `stored` : le bras gardé ; `forced` : ?bras= ;
 * `random` : un tirage dans [0, 1[. Rend { arm, fresh (à garder et à annoncer), forced }.
 */
export function decideArm({ stored, forced, random, robot: isRobot = false }) {
  const f = typeof forced === 'string' ? forced.toUpperCase() : null;
  if (f === 'A' || f === 'B') return { arm: f, fresh: stored !== f, forced: true };
  if (stored === 'A' || stored === 'B') return { arm: stored, fresh: false, forced: false };
  if (isRobot) return { arm: 'A', fresh: false, forced: false };
  return { arm: random() < 0.5 ? 'A' : 'B', fresh: true, forced: false };
}

const uuid = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40; b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
};

/** L'identifiant anonyme de ce navigateur (tiré au premier besoin). */
export function visitorId() {
  let id = read(VISITOR);
  if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id)) { id = uuid(); write(VISITOR, id); }
  return id;
}

export const currentArm = () => { const a = read(ARM); return a === 'A' || a === 'B' ? a : null; };
export const isForced = () => read(FORCED) === '1';

/** Une session Convex Auth est gardée dans ce navigateur : la personne a déjà un compte, elle reste hors du tirage. */
export function signedIn() {
  try { return Object.keys(localStorage).some((k) => k.startsWith('__convexAuthJWT')); } catch { return false; }
}

const ENV = import.meta.env || {}; // hors de Vite (tests) : vide
const ON = ENV.VITE_AB_ONBOARDING === '1';
const SITE = (ENV.VITE_CONVEX_SITE_URL || (ENV.VITE_CONVEX_URL || '').replace(/\.convex\.cloud\/?$/, '.convex.site')).replace(/\/+$/, '');

/**
 * Envoie un événement du test. `arm` et `user` (id du compte) : ceux du compte connecté, quand la page les connaît (l'app) ;
 * sinon le bras de ce navigateur. Hors du test (aucun bras) : rien ne part.
 */
export function track(event, props = {}, { arm = currentArm(), user = null, forced = isForced() } = {}) {
  if ((arm !== 'A' && arm !== 'B') || !SITE.includes('.convex.site') || (robot() && !forced)) return;
  const body = JSON.stringify({ e: event, v: visitorId(), b: arm, ...(user ? { u: user } : {}), ...(forced ? { f: true } : {}), p: props });
  try {
    if (navigator.sendBeacon && navigator.sendBeacon(`${SITE}/e`, new Blob([body], { type: 'text/plain' }))) return;
  } catch { /* repli ci-dessous */ }
  fetch(`${SITE}/e`, { method: 'POST', body, headers: { 'Content-Type': 'text/plain' }, keepalive: true }).catch(() => {});
}

/** Le bras de ce navigateur, tiré et annoncé (ab_exposition) à la première arrivée sur le parcours. */
export function armFor(search = typeof location !== 'undefined' ? location.search : '') {
  // Interrupteur éteint ou navigateur piloté : pas de nouveau tirage (A), sauf bras imposé, gardé d'une page à l'autre
  // (le retour de Google n'a plus ?bras= dans l'adresse).
  const r = decideArm({ stored: ON || isForced() ? currentArm() : null, forced: new URLSearchParams(search).get('bras'), random: Math.random, robot: robot() || !ON });
  if (r.fresh) {
    write(ARM, r.arm);
    if (r.forced) write(FORCED, '1');
    track('ab_exposition', {}, { arm: r.arm, forced: r.forced });
  }
  return r.arm;
}

// La progression de l'onboarding B, gardée dans ce navigateur : un rechargement ou le retour de Google reprend au même écran.
const PLAN = 'kc.plan';
export const readPlan = () => { try { const v = JSON.parse(read(PLAN) || 'null'); return v && typeof v === 'object' ? v : null; } catch { return null; } };
export const savePlan = (state) => write(PLAN, JSON.stringify(state));
