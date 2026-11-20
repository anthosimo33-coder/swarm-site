/**
 * Adresses signées des miniatures (/cover/<id>) et des photos de profil (/avatar/<handle>), servies par
 * convex/coverHttp.ts. Audit S5 et S15 (19/11) : ces routes répondaient sans compte, lançaient une action Node et une
 * lecture TikTok pour tout id ou pseudo connu, et disaient à un inconnu quels comptes et quelles vidéos le Radar suit
 * (302 contre 404). Seules les adresses que boards.get a rendues (donc à une personne connectée, dans son périmètre)
 * portent la bonne signature ; toute autre requête reçoit le même 404, sans rien lire.
 *
 * Signature : HMAC-SHA256 de « cover:<id>:<version> » ou « avatar:<handle>:<version> », 12 premiers octets en hexa.
 * Clé : COVER_SECRET (variable Convex) si elle est posée, sinon une clé tirée de JWT_PRIVATE_KEY (posée par Convex Auth
 * sur chaque déploiement) par HMAC avec un libellé propre : jamais la clé d'authentification elle-même. Sans aucune des
 * deux, aucune adresse n'est produite et toutes sont refusées.
 * Module pur (ni base, ni réseau, ni Node) : lu par les requêtes, les actions HTTP et les actions Node.
 */

/** Id d'une vidéo TikTok (chiffres) ou Instagram (« ig: » + code du reel). */
export const COVER_ID = /^(\d{6,25}|ig:[A-Za-z0-9_-]{5,40})$/;
/** Pseudo d'un compte TikTok. */
export const HANDLE = /^[A-Za-z0-9._]{2,30}$/;
/** Changent quand les navigateurs doivent oublier leurs anciennes réponses (et toutes les signatures avec). */
export const COVER_VERSION = 3;
export const AVATAR_VERSION = 2;
/** Après un échec noté (mediaMiss : vidéo supprimée, compte sans photo), pas de nouvel essai avant 6 h. */
export const MEDIA_RETRY_MS = 6 * 3_600_000;

// ─── SHA-256 et HMAC (FIPS 180-4, RFC 2104), synchrones : une requête Convex en signe des milliers par page ───
const K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
  0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
  0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
  0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);
const H0 = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
const W = new Uint32Array(64);
function block(h: Uint32Array, b: Uint8Array, at: number) {
  for (let i = 0; i < 16; i++) W[i] = (b[at + 4 * i] << 24) | (b[at + 4 * i + 1] << 16) | (b[at + 4 * i + 2] << 8) | b[at + 4 * i + 3];
  for (let i = 16; i < 64; i++) {
    const x = W[i - 15], y = W[i - 2];
    const s0 = ((x >>> 7) | (x << 25)) ^ ((x >>> 18) | (x << 14)) ^ (x >>> 3);
    const s1 = ((y >>> 17) | (y << 15)) ^ ((y >>> 19) | (y << 13)) ^ (y >>> 10);
    W[i] = (W[i - 16] + s0 + W[i - 7] + s1) | 0;
  }
  let a = h[0], b2 = h[1], c = h[2], d = h[3], e = h[4], f = h[5], g = h[6], hh = h[7];
  for (let i = 0; i < 64; i++) {
    const S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
    const t1 = (hh + S1 + ((e & f) ^ (~e & g)) + K[i] + W[i]) | 0;
    const S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
    const t2 = (S0 + ((a & b2) ^ (a & c) ^ (b2 & c))) | 0;
    hh = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b2; b2 = a; a = (t1 + t2) | 0;
  }
  h[0] += a; h[1] += b2; h[2] += c; h[3] += d; h[4] += e; h[5] += f; h[6] += g; h[7] += hh;
}
/** SHA-256 de `data`, en partant de l'état `from` après `done` octets déjà hachés (multiple de 64). */
function sha256(data: Uint8Array, from: ArrayLike<number> = H0, done = 0): Uint8Array {
  const h = new Uint32Array(from);
  const total = done + data.length;
  const n = Math.ceil((data.length + 9) / 64) * 64;
  const buf = new Uint8Array(n);
  buf.set(data);
  buf[data.length] = 0x80;
  const bits = total * 8;
  buf[n - 4] = (bits >>> 24) & 255; buf[n - 3] = (bits >>> 16) & 255; buf[n - 2] = (bits >>> 8) & 255; buf[n - 1] = bits & 255;
  buf[n - 5] = Math.floor(bits / 2 ** 32) & 255;
  for (let at = 0; at < n; at += 64) block(h, buf, at);
  const out = new Uint8Array(32);
  for (let i = 0; i < 8; i++) { out[4 * i] = h[i] >>> 24; out[4 * i + 1] = (h[i] >>> 16) & 255; out[4 * i + 2] = (h[i] >>> 8) & 255; out[4 * i + 3] = h[i] & 255; }
  return out;
}
const utf8 = (s: string) => new TextEncoder().encode(s);
/** Un HMAC-SHA256 dont la clé est préparée une fois (états après les blocs ipad et opad). */
export function hmacOf(key: Uint8Array): (msg: Uint8Array) => Uint8Array {
  const k = new Uint8Array(64);
  k.set(key.length > 64 ? sha256(key) : key);
  const pad = (x: number) => { const p = new Uint8Array(64); for (let i = 0; i < 64; i++) p[i] = k[i] ^ x; const h = new Uint32Array(H0); block(h, p, 0); return h; };
  const inner = pad(0x36), outer = pad(0x5c);
  return (msg) => sha256(sha256(msg, inner, 64), outer, 64);
}

// ─── Les signatures ─────────────────────────────────────────────────────────────────────────────────────────────
let signer: { key: string; sign: (m: Uint8Array) => Uint8Array } | null = null;
const cache = new Map<string, string>();
/** Le signataire du déploiement (recalculé si la variable change), null sans secret. */
function current() {
  const own = process.env.COVER_SECRET, auth = process.env.JWT_PRIVATE_KEY;
  const id = own ? `own:${own}` : auth ? `auth:${auth}` : "";
  if (!id) return null;
  if (signer?.key !== id) {
    const key = own ? utf8(own) : hmacOf(utf8(auth!))(utf8("kopycat:adresses-images:1"));
    signer = { key: id, sign: hmacOf(key) };
    cache.clear();
  }
  return signer;
}
function sig(message: string): string | null {
  const s = current();
  if (!s) return null;
  const hit = cache.get(message);
  if (hit) return hit;
  const mac = s.sign(utf8(message));
  let hex = "";
  for (let i = 0; i < 12; i++) hex += mac[i].toString(16).padStart(2, "0");
  if (cache.size > 50_000) cache.clear();
  cache.set(message, hex);
  return hex;
}
/** Comparaison en temps constant (sur toute la longueur attendue). */
function same(a: string, b: string | null) {
  if (b === null || a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

/** L'adresse signée de la miniature d'une vidéo ; null si l'id n'en est pas un ou s'il n'y a pas de secret. */
export function coverUrl(site: string, id: string): string | null {
  const s = COVER_ID.test(id) ? sig(`cover:${id}:${COVER_VERSION}`) : null;
  return s ? `${site}/cover/${id}?v=${COVER_VERSION}&s=${s}` : null;
}
export function avatarUrl(site: string, handle: string): string | null {
  const s = HANDLE.test(handle) ? sig(`avatar:${handle}:${AVATAR_VERSION}`) : null;
  return s ? `${site}/avatar/${handle}?v=${AVATAR_VERSION}&s=${s}` : null;
}
/** L'adresse reçue porte-t-elle la signature de la version en cours ? */
export function coverSigned(id: string, v: string | null, s: string | null): boolean {
  const want = v === String(COVER_VERSION) && COVER_ID.test(id) ? sig(`cover:${id}:${COVER_VERSION}`) : null;
  return want !== null && same(want, s);
}
export function avatarSigned(handle: string, v: string | null, s: string | null): boolean {
  const want = v === String(AVATAR_VERSION) && HANDLE.test(handle) ? sig(`avatar:${handle}:${AVATAR_VERSION}`) : null;
  return want !== null && same(want, s);
}
