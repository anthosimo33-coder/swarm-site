import { detectAll } from "tinyld";

/**
 * Langue d'un texte de vidéo (légende + texte à l'écran), lue par Swarm.
 *
 * Le Radar ne range ses comptes que dans 5 langues (en, fr, es-am, es-es, pt) et met « en » à ce qui n'en est aucune :
 * le 14/11, des comptes allemands (@dailytyrel) et italiens (@consiglibyalice1) y étaient « en ». Swarm lit donc la
 * langue lui-même. Calibré le 14/11 sur 8 000 légendes du Radar : 95 % d'accord sur ses comptes fr/es/pt.
 *
 * On ne garde que des langues que le détecteur ne confond pas sur des textes courts (le hindi, le berbère ou le serbe
 * sortaient sur de l'allemand ou du français). Rien plutôt qu'une langue douteuse.
 */
const KEEP = new Set(["en", "fr", "es", "pt", "de", "it", "nl", "pl", "ro", "tr", "id", "ar", "ru", "uk", "ja", "ko", "vi", "th", "hu", "cs", "sv", "da", "fi", "el", "he", "tl"]);
const MIN_CHARS = 20;

/**
 * Le texte sans ce qui ne dit rien de la langue : liens, #mots-clés (souvent anglais : #fyp), @comptes, émojis, chiffres,
 * ponctuation. Le Radar assemble le texte lu à l'écran avec « · », que le détecteur prend pour la ponctuation grecque :
 * le 14/11, 35 comptes américains sortaient « en grec ».
 */
const clean = (t: string) =>
  t.replace(/https?:\/\/\S+/g, " ").replace(/[#@][\p{L}\p{N}_.]+/gu, " ").replace(/[^\p{L}\p{M}\s'’-]/gu, " ").replace(/\s+/g, " ").trim();

/** Une langue à alphabet propre n'est retenue que si le texte en contient. */
const SCRIPT: Record<string, RegExp> = {
  el: /\p{Script=Greek}/u, ru: /\p{Script=Cyrillic}/u, uk: /\p{Script=Cyrillic}/u, ar: /\p{Script=Arabic}/u, he: /\p{Script=Hebrew}/u,
  ja: /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u, ko: /\p{Script=Hangul}/u, th: /\p{Script=Thai}/u,
};

export function textLang(text: string | null | undefined): string | null {
  const t = clean(text ?? "");
  if (t.length < MIN_CHARS) return null;
  const [a, b] = detectAll(t);
  // Une langue nettement devant la suivante, sinon rien.
  if (!a || a.accuracy < 0.1 || (b && a.accuracy < 2 * b.accuracy)) return null;
  return KEEP.has(a.lang) && (!SCRIPT[a.lang] || SCRIPT[a.lang].test(t)) ? a.lang : null;
}
