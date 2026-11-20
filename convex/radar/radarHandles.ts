// Repris de Jarvia (convex/radarApi.ts, ancien Radar) le 20/11/2026 : seul le pseudo TikTok normalisé sert encore.

function parseUrl(input: string): URL | null {
  const raw = input.trim();
  try {
    return new URL(raw);
  } catch {
    try {
      return new URL(`https://${raw}`);
    } catch {
      return null;
    }
  }
}

const HANDLE_RE = /^[a-z0-9._]{1,24}$/;
const URL_HANDLE_RE = /@([a-zA-Z0-9._]{1,24})/;

/** Réplique de lib/radarParsing.normalizeTikTokHandle — cf tests Vitest là-bas. */
export function normalizeTikTokHandle(
  input: string | null | undefined,
): string | null {
  if (typeof input !== "string") return null;
  const trimmed = input.trim();
  if (trimmed === "") return null;

  const looksLikeUrl =
    /tiktok\.com/i.test(trimmed) || /^https?:\/\//i.test(trimmed);
  if (looksLikeUrl) {
    const url = parseUrl(trimmed);
    if (!url) return null;
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    if (host !== "tiktok.com" && !host.endsWith(".tiktok.com")) return null;
    const m = URL_HANDLE_RE.exec(url.pathname);
    if (!m) return null;
    const handle = m[1].toLowerCase();
    return HANDLE_RE.test(handle) ? handle : null;
  }

  const handle = (
    trimmed.startsWith("@") ? trimmed.slice(1) : trimmed
  ).toLowerCase();
  return HANDLE_RE.test(handle) ? handle : null;
}
