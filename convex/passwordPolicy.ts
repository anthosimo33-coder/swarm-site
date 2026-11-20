/**
 * Ce qu'un mot de passe doit être (audit S28, 19/11) : 8 à 128 caractères, et pas un de ceux qu'un essai de mots de
 * passe tente en premier. Avant, « 12345678 », « password » ou « azerty12 » passaient, et un mot de passe de plus de
 * 128 caractères (gestionnaire de mots de passe) était refusé avec « au moins 8 caractères ».
 * Appliqué à l'inscription (convex/auth.ts), au changement et à la remise par le support (convex/users.ts). Module pur.
 *
 * Refusés : les mots de passe courants de 8 caractères ou plus (listes publiques des fuites, anglais et français), un
 * même caractère répété, une suite de chiffres ou de lettres (montante ou descendante), une rangée de clavier, et
 * l'e-mail du compte ou sa partie avant @.
 */
export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 128;

const COMMON = new Set(`
12345678 123456789 1234567890 12345678910 0123456789 87654321 987654321 9876543210 11111111 00000000 22222222 88888888
12341234 11223344 12121212 11112222 12344321 13579246 147258369 159753456 123123123 123321123 1q2w3e4r 1q2w3e4r5t 1qaz2wsx
zaq12wsx qwertyui qwertyuiop qwerty123 qwerty12 qwerty1234 azertyui azertyuiop azerty12 azerty123 azerty1234 qwertz123
asdfghjk asdfghjkl zxcvbnm1 abcd1234 abcdefgh abc12345 a1b2c3d4 aa123456 password password1 password12 password123
password! passw0rd p@ssw0rd p@ssword passwort motdepasse motdepasse1 motdepasse123 mot2passe iloveyou iloveyou1
jetaime1 jetaime123 football football1 baseball basketball sunshine princess superman starwars whatever trustno1
letmein1 welcome1 welcome123 admin123 administrator changeme changeme1 monkey123 dragon123 shadow123 master123
michelle jennifer jordan23 charlie1 computer internet samsung1 iphone12 bonjour1 bonjour123 doudou123 chouchou
loulou123 soleil123 marseille marseille13 olympique parisien paris123 france123 nicolas1 thomas123 alexandre
camille1 chocolat chocolat1 vacances doudoune pokemon1 naruto123 minecraft fortnite roblox123 tiktok123 instagram
facebook1 google123 youtube1 snapchat azertyqsdf qsdfghjklm wxcvbn12 kopycat1 kopycat123 swarm123 tiktokapp
`.trim().split(/\s+/));

const ROWS = ["azertyuiop", "qsdfghjklm", "wxcvbn", "qwertyuiop", "asdfghjkl", "zxcvbnm", "qwertzuiop", "1234567890", "abcdefghijklmnopqrstuvwxyz"];

/** Une suite (montante ou descendante) d'une rangée de clavier, de l'alphabet ou des chiffres. */
const isRun = (s: string) => ROWS.some((r) => r.includes(s) || [...r].reverse().join("").includes(s));

export type PasswordVerdict = "ok" | "trop_court" | "trop_long" | "trop_courant";

export function passwordVerdict(secret: string, email?: string | null): PasswordVerdict {
  if (secret.length < PASSWORD_MIN) return "trop_court";
  if (secret.length > PASSWORD_MAX) return "trop_long";
  const s = secret.toLowerCase();
  const local = (email ?? "").toLowerCase().split("@")[0];
  if (COMMON.has(s) || /^(.)\1+$/.test(s) || isRun(s) || (/^(.{1,4})\1+$/.test(s))) return "trop_courant";
  if (email && (s === email.toLowerCase() || (local.length >= 4 && s.replace(/\d+$/, "") === local))) return "trop_courant";
  return "ok";
}
