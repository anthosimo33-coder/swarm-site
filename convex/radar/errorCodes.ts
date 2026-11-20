import { ConvexError } from "convex/values";

// Les codes d'erreur du Radar, repris de Jarvia (convex/errorCodes.ts) le 20/11/2026 : seuls ceux qu'il lève.
export const ERR = {
  RADAR_APP_INVALID: "RADAR_APP_INVALID",
  RADAR_APP_ALREADY_FOLLOWED: "RADAR_APP_ALREADY_FOLLOWED",
  RADAR_APP_PATTERN_TAKEN: "RADAR_APP_PATTERN_TAKEN",
  RADAR_APP_NOT_FOUND: "RADAR_APP_NOT_FOUND",
  RADAR_HANDLE_INVALID: "RADAR_HANDLE_INVALID",
  RADAR_TRACKED_FULL: "RADAR_TRACKED_FULL",
} as const;
export type ErrCode = (typeof ERR)[keyof typeof ERR];
type ErrParams = Record<string, string | number>;

export function err(code: ErrCode, message: string, params?: ErrParams): ConvexError<{ code: string; message: string; params?: ErrParams }> {
  return new ConvexError(params === undefined ? { code, message } : { code, message, params });
}
