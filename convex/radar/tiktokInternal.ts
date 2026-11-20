// Le coupe-circuit et le rythme des pages publiques TikTok, repris de Jarvia (convex/tiktokInternal.ts) le 20/11/2026.

export const BREAKER_THRESHOLD = 5;

/** Pause entre deux pages : 1,5 à 3 s, tirée au hasard. */
export const PAGE_DELAY_MIN_MS = 1_500;
export const PAGE_DELAY_MAX_MS = 3_000;

export function pageDelayMs(random: number): number {
  const borne = Math.min(Math.max(random, 0), 0.999_999_999);
  return (
    PAGE_DELAY_MIN_MS +
    Math.floor(borne * (PAGE_DELAY_MAX_MS - PAGE_DELAY_MIN_MS + 1))
  );
}

/**
 * État du coupe-circuit, porté d'un lot à l'autre dans les arguments de la
 * chaîne nocturne (même mécanisme que le budget de repli d'avant).
 */
export type BreakerState = {
  /** Pages illisibles d'affilée. Remis à zéro par toute page servie. */
  suspects: number;
  /** Motif de la coupure, `null` tant que le relevé maison est ouvert. */
  trippedReason: string | null;
};

export const BREAKER_CLOSED: BreakerState = { suspects: 0, trippedReason: null };

/**
 * Transition du coupe-circuit après UNE page. Pure, testée.
 *
 * Seule une page ILLISIBLE compte : une page servie — compteurs ou refus
 * motivé — prouve que la plateforme répond normalement à cette IP. Partagé
 * avec le relevé Snapchat (`convex/snapchatInternal.ts`), d'où le type
 * structurel plutôt que `TikTokPublicResult`.
 */
export function nextBreaker(
  state: BreakerState,
  result: { kind: string; reason?: string },
): BreakerState {
  if (state.trippedReason !== null) return state;
  if (result.kind !== "unreadable") return BREAKER_CLOSED;
  const suspects = state.suspects + 1;
  return suspects >= BREAKER_THRESHOLD
    ? {
        suspects,
        trippedReason: `${suspects} pages illisibles d'affilée (dernière : ${result.reason ?? "motif inconnu"})`,
      }
    : { suspects, trippedReason: null };
}
