/**
 * Codes d'erreur de l'authentification, partagés entre le backend (qui les
 * lève dans une ConvexError) et le site (qui les traduit en phrase).
 */
export const AUTH_ERRORS = {
  EMAIL_INVALIDE: "EMAIL_INVALIDE",
  MOT_DE_PASSE_TROP_COURT: "MOT_DE_PASSE_TROP_COURT",
  IDENTIFIANTS_INCORRECTS: "IDENTIFIANTS_INCORRECTS",
  COMPTE_EXISTANT: "COMPTE_EXISTANT",
  TROP_DE_TENTATIVES: "TROP_DE_TENTATIVES",
} as const;

export type AuthErrorCode = (typeof AUTH_ERRORS)[keyof typeof AUTH_ERRORS];
