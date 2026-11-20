/**
 * Codes d'erreur de l'authentification, partagés entre le backend (qui les
 * lève dans une ConvexError) et le site (qui les traduit en phrase).
 */
export const AUTH_ERRORS = {
  EMAIL_INVALIDE: "EMAIL_INVALIDE",
  MOT_DE_PASSE_TROP_COURT: "MOT_DE_PASSE_TROP_COURT",
  // Audit S28 (19/11) : plus de 128 caractères avait le message « trop court » ; un mot de passe courant passait.
  MOT_DE_PASSE_TROP_LONG: "MOT_DE_PASSE_TROP_LONG",
  MOT_DE_PASSE_TROP_COURANT: "MOT_DE_PASSE_TROP_COURANT",
  IDENTIFIANTS_INCORRECTS: "IDENTIFIANTS_INCORRECTS",
  COMPTE_EXISTANT: "COMPTE_EXISTANT",
  TROP_DE_TENTATIVES: "TROP_DE_TENTATIVES",
} as const;

export type AuthErrorCode = (typeof AUTH_ERRORS)[keyof typeof AUTH_ERRORS];
