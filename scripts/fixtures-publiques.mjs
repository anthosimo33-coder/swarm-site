// LES FIXTURES DU RADAR SONT PUBLIQUES (dépôt public, 20/11/2026) : une réponse réelle de ScrapeCreators ou de TikHub
// n'entre dans tests/radar/fixtures qu'anonymisée — ni adresse de CDN réelle, ni pseudo, nom affiché, bio, identifiant
// de compte, de vidéo ou de son réels, ni légende, texte incrusté, date à la seconde ou compteurs réels.
//
// Trois outils, aucun ne porte une valeur réelle ni rien qui en dérive :
//  - LE CONTRÔLE (CI, tests/radar/fixtures-publiques.test.ts) : STRUCTUREL. Il ne cherche pas des valeurs réelles (une
//    liste d'empreintes publiée serait un oracle : quiconque soupçonne un compte d'avoir été au banc le confirmerait par
//    son empreinte, corrigé le 20/11/2026) ; il exige que tout ce qui pourrait en être soit SYNTHÉTIQUE, par sa forme :
//      · toutes les fixtures (tests/radar/fixtures, enregistrements des bancs compris) : aucun hôte hors de
//        `FIXTURE_HOSTS`, aucun hôte de média (`isMediaHost`) ; et LE MONDE CLOS (21/11/2026) : chaque mot de chaque
//        chaîne (clés hors schéma comprises, adresses décodées) est un mot que le code, les tests et les scripts du
//        Radar écrivent eux-mêmes (`vocabulary`), un mot de remplissage ou protégé, de forme synthétique, ou un mot que
//        le code COMPOSE (`codeShapes` : un morceau de gabarit et un numéro, l'identifiant d'un document, des morceaux
//        que le code nomme comme identifiants) — jamais des morceaux du vocabulaire mis bout à bout ; chaque nombre de
//        15 chiffres ou plus est de forme synthétique (`synthNumber`). Les enregistrements des bancs (racine), en plus :
//        un texte est du remplissage ou un texte que le code écrit (`codeText`), un pseudo est synthétique ou écrit par
//        le code (`rootFindings`). Un enregistrement de banc ne porte que ce que ses entrées portent ; refait sur des
//        réponses réelles, ses pseudos, identifiants et textes y sont inconnus — à un reste mesuré près, sur l'export des
//        comptes suivis : 89 des 7 931 pseudos réels (un mot que le code écrit tel quel, un mot du remplissage, des
//        morceaux qu'il nomme), 84 des 13 932 légendes réelles distinctes (des mots courts, des chaînes du code mises
//        bout à bout). Corrigé le 21/11/2026 : pseudos, uid, identifiants, textes et dates n'étaient jugés que dans les
//        sous-dossiers — un enregistrement refait sur des réponses réelles débarrassées de leurs CDN passait la CI ; et
//        des morceaux du vocabulaire, commentaires compris, composaient 829 de ces pseudos et 657 de ces légendes ;
//      · réponses enregistrées (sous-dossiers : sc/, tikhub/), en plus : pseudos, noms, uid, sec_uid, identifiants de
//        vidéo, de son et de hashtag de forme synthétique (`SYNTH`), textes (`TEXT_KEYS`) faits des seuls mots de
//        remplissage (`FILLER`) ou protégés (`PROTECTED`) ;
//      · code et tests du Radar (`SCOPE`) : aucune adresse de média réelle (un chemin signé : `longMediaUrl`), aucun
//        sec_uid réel, aucun identifiant de vidéo, de son ou de compte de forme réelle (17 à 20 chiffres,
//        `synthNumber`, ni leur début complété par un gabarit), aucune valeur de requête d'adresse de partage en clair,
//        aucune mention balisée de TikHub (`<m id=…>@…</m>`) d'un pseudo non synthétique ; et dans le code du Radar et
//        ses bancs (`RADAR_CODE`), aucune MENTION (« @… », de toute forme) ni chaîne entière de la forme d'un pseudo
//        (`handleShaped`, sans chiffre exigé) que les comptes de départ et les verdicts relus ne déclarent pas
//        (`PUBLIC_HANDLE_SOURCES`), hors marques et motifs publics cités (`CITED_PUBLIC`), mots du code et sites.
//        Corrigé le 21/11/2026 : seuls les chemins signés et les sec_uid y étaient cherchés, puis seuls les pseudos à
//        chiffre et point ou souligné, sans fin en .app (10,8 % des pseudos réels). Les légendes du code, et les
//        pseudos des tests, ne se jugent pas sur leur forme : la contre-épreuve les compare.
//  - L'ANONYMISEUR (--anonymise) : réécrit des réponses enregistrées sous cette forme, avec un tirage neuf à chaque
//    passage (jamais gardé), PAR DÉFAUT (21/11/2026) : une valeur sous une clé qu'il ne connaît pas est réécrite comme
//    un texte (mots hors du vocabulaire du code remplacés, longs nombres inventés, dates déplacées) — une liste fermée
//    de clés laissait passer music.author, share_title, search_user_name, poi_name, logid… Les dates ne sont PLUS
//    décalées d'un même écart (une vidéo retrouvée le livrait, et avec lui la date à la seconde de toutes les autres) :
//    une table secrète, monotone, aux écarts entre dates tirés un à un ; durées et compteurs tirés plus loin des vrais ;
//    les mots des légendes changent de largeur (les positions de `text_extra` suivent), les emoji sont remplacés.
//  - LA CONTRE-ÉPREUVE (--contre, LOCALE) : compare aux réponses brutes et aux exports gardés HORS du dépôt les fixtures
//    et les lignes ajoutées depuis une révision (`--depuis`, origin/main par défaut ; `--diff a..b` pour un commit) —
//    pseudos, noms, uid, identifiants, bios, légendes (suites de mots), dates et compteurs. Aucune valeur trouvée n'est
//    affichée (les journaux de la CI d'un dépôt public sont publics) : le fichier et le chemin suffisent. Ce que le
//    hasard fait tomber juste n'y est pas compté (21/11/2026, rejoué sur les 75 réponses du banc réécrites) : une date
//    réécrite sur l'une des ~19 000 dates réelles (les dates se jugent par document), un morceau du remplissage, un mot
//    protégé ou un court nombre qui est aussi un pseudo réel, un nombre de moins de 9 chiffres égal à un identifiant
//    court ; ni un texte court que main publie déjà.
//
// Usage : node scripts/fixtures-publiques.mjs [dossier]                         contrôle
//         node scripts/fixtures-publiques.mjs --anonymise <fichier.json…>       anonymise sur place, en un passage
//         node scripts/fixtures-publiques.mjs --contre <brut…> [--depuis <rév>] [--diff <a..b>] [--sans-fixtures]
// Lancé par tests/radar/fixtures-publiques.test.ts (npm run test:moteur) ; la contre-épreuve y tourne quand
// FIXTURES_BRUTS nomme les bruts (chemins séparés par « : »).
import { execFileSync } from 'node:child_process';
import { createHmac, randomBytes } from 'node:crypto';
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const SELF = fileURLToPath(import.meta.url);
export const ROOT = fileURLToPath(new URL('../', import.meta.url));
export const FIXTURES = fileURLToPath(new URL('../tests/radar/fixtures/', import.meta.url));
/** Le code et les tests du Radar, contrôlés en plus des fixtures (adresses de média, sec_uid, identifiants, mentions). */
export const SCOPE = ['convex/radar', 'scripts', 'tests/radar'];
/**
 * Le code du Radar et ses bancs (les pseudos de forme réelle). Pas les tests : ils citent par construction des comptes
 * inventés de toutes les formes et, repris de Jarvia, des comptes déjà publics sur main — la contre-épreuve les compare.
 */
export const RADAR_CODE = ['convex/radar', 'scripts/radar-bancs'];
/**
 * Les comptes que le Radar suit par construction, publics : ses comptes de départ et les verdicts relus. Un pseudo de
 * forme réelle qu'ils nomment peut être cité par le code et les tests.
 */
export const PUBLIC_HANDLE_SOURCES = ['convex/radar/radarSeedAccounts.ts', 'convex/radar/radarJudgeReview.ts'];

// ─── Les formes synthétiques ─────────────────────────────────────────────────────────────────────────────────────

/** Les seuls hôtes qu'une fixture peut nommer. */
export const FIXTURE_HOSTS = ['example.invalid', 'www.tiktok.com', 'api.tikhub.io', 'api.scrapecreators.com'];

/**
 * Un hôte de média de TikTok ou d'Instagram (image, vidéo, son, sous-titre, effet). Corrigé le 20/11/2026 : les sons
 * (sf16-muse-va.ibytedtos.com), les vidéos signées (v16-webapp-prime.us.tiktok.com, video-tcs-sg.tiktok.com) et les
 * effets (lf16-effectcdn.byteeffecttos-g.com) des réponses brutes passaient.
 */
export function isMediaHost(host) {
  const h = host.toLowerCase();
  if (/tiktokcdn|muscdn|ibyteimg|byteimg|ttwstatic|byteoversea|bytedtos|byteeffecttos|bytegecko|fbcdn\.net$|cdninstagram\.com$/.test(h)) return true;
  if (/(^|\.)tiktokv\.(com|us|eu)$/.test(h)) return true;
  // Sous tiktok.com : les serveurs de vidéos (v16-…, v19-webapp-prime…, video-tcs-…), jamais www ni les pages.
  return /(^|\.)tiktok\.com$/.test(h) && /^(v\d+[a-z0-9-]*|video-[a-z0-9-]+|[a-z0-9-]*webapp-prime)\./.test(h);
}

/** Les adresses d'un texte, en clair ou encodées dans une autre (« https%3A%2F%2F… »). */
export function urlsIn(s) {
  const forms = [s];
  if (/%[0-9a-f]{2}/i.test(s)) try { forms.push(decodeURIComponent(s)); } catch { /* lue telle quelle */ }
  const out = [];
  // Chaque « http(s):// », y compris dans la suite d'une autre adresse (« ?img=https://… », une fois décodée).
  for (const f of forms) for (const m of f.matchAll(/https?:\/\/([A-Za-z0-9.-]+)/g)) out.push({ host: m[1], rest: f.slice(m.index + m[0].length).match(/^[^\s"'`<>\\)]*/)[0] });
  return out;
}

/**
 * Une adresse de média réelle : une suite d'au moins 20 lettres et chiffres mêlés, sans séparateur (le condensé d'un
 * chemin signé de CDN) ; les adresses de test (« /a.jpg », « ~tplv-tiktokx-cropcenter ») n'en ont pas.
 */
export const longMediaUrl = (u) => isMediaHost(u.host) && (u.rest.match(/[A-Za-z0-9]{20,}/g) ?? []).some((x) => /\d/.test(x) && /[A-Za-z]/.test(x));

/** Les clés d'identité d'une réponse enregistrée, et leur forme synthétique. */
export const SYNTH = {
  handle: /^(?:auteur|personne|membre|compte|mention)_?[a-z0-9]{0,6}$/,
  name: /^(?:Auteur|Membre|Personne)(?: \d{1,4})?$/,
  uid: /^9\d0{8,}\d{1,8}$/,
  sec: /^MS4wLjABAAAA-?(?:temoin|synthetique)[A-Za-z0-9_-]{0,12}$/,
  bio: /^bio de [a-z0-9_]+$/,
};
/**
 * Les clés connues des réponses. Le contrôle et l'anonymiseur n'en dépendent plus pour être sûrs (le monde clos, la
 * réécriture par défaut) : elles disent la forme attendue. Ajoutées le 21/11/2026, relevées dans les réponses du banc :
 * handle, nick_name, search_user_name, mixed_author, author (d'un son), share_title, share_desc, share_desc_info,
 * search_user_desc, poi_name, city_name, ins_id (un pseudo Instagram), mid, song_id, cid, impr_id, logid ; le
 * 21/11/2026 encore, relevées dans les réponses brutes : ig_username, userUniqueId (des pseudos), keyword, word,
 * search_cha_name (le terme cherché : un texte).
 */
export const HANDLE_KEYS = ['unique_id', 'owner_handle', 'uniqueId', 'username', 'authorUniqueId', 'author_unique_id', 'handle', 'ins_id', 'ig_username', 'userUniqueId'];
export const NAME_KEYS = ['nickname', 'full_name', 'author_name', 'authorName', 'owner_nickname', 'nick_name', 'search_user_name', 'mixed_author', 'author'];
export const UID_KEYS = ['uid', 'user_id', 'author_id', 'authorId', 'owner_id'];
export const SEC_KEYS = ['sec_uid', 'secUid', 'author_sec_uid'];
export const BIO_KEYS = ['signature', 'biography'];
/** Identifiants de vidéo, de son et de hashtag : 32 bits de poids fort pour la date, le reste inventé (au plus `SYNTH_LOW`). */
export const VIDEO_ID_KEYS = ['aweme_id', 'id_str', 'group_id', 'item_id', 'mid', 'song_id', 'cid', 'ch_id'];
/** Identifiants de requête (journaux du fournisseur) : la date de la demande à la seconde, puis du hasard. */
export const REQUEST_ID_KEYS = ['impr_id', 'logid', 'log_id', 'request_id'];
export const SYNTH_LOW = 100_000n;
const lowOf = (id) => BigInt(id) & 0xffffffffn;
export const synthId = (id) => /^\d{12,20}$/.test(id) && lowOf(id) < SYNTH_LOW;
/**
 * Un long nombre de forme synthétique : un identifiant inventé (`synthId`), un uid inventé (`SYNTH.uid`), ou écrit à
 * la main (une suite d'au moins six zéros : « 7709 » suivi de zéros et d'un numéro) — jamais le hasard des 32 bits de poids faible
 * d'un identifiant réel de TikTok.
 */
export const synthNumber = (id) => synthId(id) || SYNTH.uid.test(id) || /0{6}/.test(id);

/** Les champs de texte libre d'une réponse (légendes, texte incrusté, titres de sons, hashtags, partages, lieux). */
export const TEXT_KEYS = [
  'desc', 'content_desc', 'markup_text', 'text_info', 'title', 'hashtag_name', 'cha_name', 'caption', 'text',
  'share_title', 'share_desc', 'share_desc_info', 'search_user_desc', 'poi_name', 'city_name', 'keyword', 'word', 'search_cha_name',
];

/**
 * LE REMPLISSAGE. Un mot de 4 lettres ou plus d'un texte de réponse enregistrée est un morceau de ce texte (lettres
 * seules, minuscules), ou un mot protégé. Les lettres hors ASCII deviennent des lettres ASCII ; hors du plan de base
 * (lettres mathématiques, 2 unités UTF-16), des lettres de `ASTRAL` : la largeur de chaque caractère est gardée.
 */
export const FILLER = (
  'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna ' +
  'aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat ' +
  'duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur ' +
  'sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum'
).replace(/\s+/g, '').repeat(4);
const ASTRAL_A = 0x1d5ba; // 𝖺 (MATHEMATICAL SANS-SERIF SMALL A) … 𝗓
const astral = (c) => String.fromCodePoint(ASTRAL_A + c.charCodeAt(0) - 97);
const unastral = (c) => {
  const p = c.codePointAt(0);
  return p >= ASTRAL_A && p < ASTRAL_A + 26 ? String.fromCharCode(97 + p - ASTRAL_A) : null;
};

/**
 * Les mots gardés tels quels : les libellés inventés des mentions (alphabet de l'OTAN, lettres mathématiques), les
 * pseudos et noms synthétiques, le titre d'un son original, le hashtag de l'app Focus Town (un nom d'app, public) dont
 * les tests jugent la correspondance exacte (tikhub/hashtag-id.json).
 */
export const PROTECTED = new Set([
  'alpha', 'bravo', 'charlie', 'bravocharlie', 'delta', 'echo', 'foxtrot', 'fox', 'golf', 'hotel', 'india', 'juliett', 'kilo',
  'kilos', 'lima', 'mike', 'oscar', 'papa', 'romeo', 'sierra', 'tango', 'victor', 'zulu', 'jet', 'oak', '𝓞𝓪𝓴', '𝙺𝚒𝚕𝚘𝚜',
  'auteur', 'membre', 'personne', 'compte', 'mention', 'original', 'sound', 'son', 'focustown', 'focustowns', 'focus', 'town',
]);

/** Un mot : une lettre, puis lettres et signes combinants (un sélecteur de variante après un emoji n'en est pas un). */
const LETTERS = /\p{L}[\p{L}\p{M}]*/gu;
const isAsciiLower = (w) => /^[a-z]+$/.test(w);

/** Un mot de texte est-il du remplissage (ou protégé) ? */
export function fillerWord(w) {
  const lower = w.toLowerCase();
  if (PROTECTED.has(lower) || PROTECTED.has(w)) return true;
  const plain = [...lower].map((c) => (isAsciiLower(c) ? c : unastral(c))).join('');
  if (plain.length !== [...lower].length) return false;
  return plain.length < 4 || FILLER.includes(plain);
}

/** Le texte lisible d'une valeur de `TEXT_KEYS` : balisage retiré, tableau JSON ouvert. */
function textOf(key, s) {
  if (key === 'content_desc' && /^\s*\[/.test(s)) try { return JSON.parse(s).join(' '); } catch { /* lu tel quel */ }
  return key === 'markup_text' ? s.replace(/<[^>]*>/g, ' ') : s;
}

const files = (dir) => readdirSync(dir).flatMap((f) => {
  const p = join(dir, f);
  return statSync(p).isDirectory() ? files(p) : [p];
});
const TEXT_FILE = /\.(json|[cm]?[jt]s|tsx?|md|txt|html?)$/;
const isFixture = (f, fixtures = FIXTURES) => f.startsWith(fixtures) || f.includes(`${sep}fixtures${sep}`);

// ─── Le monde clos ───────────────────────────────────────────────────────────────────────────────────────────────

/** Une chaîne telle que le contrôle la lit : décodée (%XX, « + » d'une requête) quand elle se décode, sinon telle quelle. */
export function readable(s) {
  if (/%[0-9a-f]{2}/i.test(s)) try { return decodeURIComponent(s.replace(/\+/g, ' ')); } catch { /* lue telle quelle */ }
  return s;
}
/** Les mots d'une chaîne : NFKC, minuscules, lettres, chiffres, points et soulignés ; points et soulignés de bord retirés. */
export const wordsOf = (s) => (readable(String(s)).normalize('NFKC').toLowerCase().match(/[\p{L}\p{N}_.]+/gu) ?? []).map((t) => t.replace(/^[._]+|[._]+$/g, '')).filter(Boolean);

/**
 * LE VOCABULAIRE DU CODE : les mots que le code, les tests et les scripts du Radar écrivent eux-mêmes (`scope`, hors
 * fixtures) — eux-mêmes contrôlés (`scanCode`), et ce que les enregistrements des bancs peuvent reproduire. Il porte
 * aussi les FORMES que le code compose (`shapes`, cf `codeShapes`) : un mot composé n'est connu que par elles.
 */
export function vocabulary(root = ROOT, scope = SCOPE) {
  const out = new Set();
  for (const d of scope) {
    let all;
    try { all = files(join(root, d)); } catch { continue; }
    for (const f of all.filter((x) => TEXT_FILE.test(x) && !isFixture(x) && !x.includes(`${sep}node_modules${sep}`))) {
      for (const w of wordsOf(readFileSync(f, 'utf8'))) {
        out.add(w);
        // Ses morceaux aussi : « status_code » écrit « status » et « code », « radar.radarSignals » « radarsignals ».
        for (const p of w.split(/[._]/)) if (p) out.add(p);
        for (const p of w.match(/\p{L}[\p{L}\p{M}]*/gu) ?? []) out.add(p);
      }
    }
  }
  out.shapes = codeShapes(root, scope);
  return out;
}

const CODE_FILE = /\.(?:[cm]?[jt]s|tsx)$/;
/**
 * LES FORMES QUE LE CODE COMPOSE (21/11/2026), lues dans l'arbre syntaxique (TypeScript) du code, des tests et des
 * scripts du Radar :
 *  - `frags` : les morceaux de texte qu'un gabarit colle à une valeur (`jugee${i}`, `${slug}_fan${i}`, `site${i}.com`,
 *    `uid_${h}` : « jugee », « _fan », « site », « .com », « uid_ ») — au moins deux caractères, dont une lettre ou un
 *    chiffre : un séparateur seul (le « _ » de `${table}_${id}`) ne compose rien ;
 *  - `idents` : les identifiants du code (noms de variables, de fonctions, de champs), et leurs morceaux (« status_msg »,
 *    « fetchOneVideo » : status, msg, fetch, one, video) — jamais une chaîne ni un commentaire, qui citent des pseudos ;
 *  - `tables` : les tables de la base (`nom: defineTable(` : « radarapps », pour les identifiants de documents des bancs
 *    `radarApps_…`) ;
 *  - `texts` : les textes que le code écrit — chaque chaîne, chaque morceau de gabarit, en suite de mots (`wordsOf`).
 */
export function codeShapes(root = ROOT, scope = SCOPE) {
  const frags = new Set();
  const heads = new Set();
  const idents = new Set();
  const tables = new Set();
  const texts = new Set();
  let textMax = 1;
  const text = (t) => {
    const w = wordsOf(t);
    if (!w.length) return;
    texts.add(w.join(' '));
    textMax = Math.max(textMax, w.length);
  };
  const keep = (f, head) => {
    const x = f.normalize('NFKC').toLowerCase();
    if (x.length < 2 || !/[\p{L}\p{N}]/u.test(x)) return;
    frags.add(x);
    if (head) heads.add(x);
  };
  const visit = (node) => {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) text(node.text);
    if (ts.isTemplateExpression(node)) {
      const parts = [node.head.text, ...node.templateSpans.map((sp) => sp.literal.text)];
      parts.forEach(text);
      parts.forEach((p, k) => {
        // Devant un « ${ » ; en tête de mot (après une espace, ou au début du gabarit), c'est un préfixe (`id${slug}`).
        if (k < parts.length - 1) {
          const m = p.match(/[\p{L}\p{N}_.]*$/u)[0];
          keep(m, m.length === p.length ? k === 0 : !/[\p{L}\p{N}_.]/u.test(p[p.length - m.length - 1]));
        }
        if (k > 0) keep(p.match(/^[\p{L}\p{N}_.]*/u)[0], false);
      });
    } else if (ts.isIdentifier(node) || ts.isPrivateIdentifier(node)) {
      const t = node.text.replace(/^#/, '');
      idents.add(t.toLowerCase());
      for (const p of t.split(/_|(?<=[a-z0-9])(?=[A-Z])/)) if (p) idents.add(p.toLowerCase());
    }
    ts.forEachChild(node, visit);
  };
  for (const d of scope) {
    let all;
    try { all = files(join(root, d)); } catch { continue; }
    for (const f of all.filter((x) => CODE_FILE.test(x) && !isFixture(x) && !x.includes(`${sep}node_modules${sep}`))) {
      const kind = /\.tsx$/.test(f) ? ts.ScriptKind.TSX : /\.[cm]?ts$/.test(f) ? ts.ScriptKind.TS : ts.ScriptKind.JS;
      visit(ts.createSourceFile(f, readFileSync(f, 'utf8'), ts.ScriptTarget.Latest, false, kind));
    }
  }
  for (const f of ['convex/schema.ts', 'convex/radar/schemaTables.ts']) {
    let text;
    try { text = readFileSync(join(root, f), 'utf8'); } catch { continue; }
    for (const m of text.matchAll(/^\s*([A-Za-z]\w*):\s*defineTable\(/gm)) tables.add(m[1].toLowerCase());
  }
  return { frags, heads, idents, tables, texts, textMax };
}

/**
 * Un mot fait de morceaux de remplissage ou protégés, et de chiffres (moins de 15 d'un tenant). Mêlé de chiffres, chaque
 * morceau de lettres est un morceau du remplissage quelle que soit sa longueur (corrigé le 21/11/2026 : moins de 4
 * lettres suffisaient, un prénom court suivi d'une année passait).
 */
const fillerStrict = (p) => {
  const lower = p.toLowerCase();
  if (PROTECTED.has(lower) || PROTECTED.has(p)) return true;
  const plain = [...lower].map((c) => (isAsciiLower(c) ? c : unastral(c))).join('');
  return plain.length === [...lower].length && FILLER.includes(plain);
};
const fillerish = (w) => {
  const pieces = w.match(/\p{L}[\p{L}\p{M}]*|\d+/gu) ?? [];
  const mixed = pieces.some((p) => /^\d+$/.test(p)) && pieces.some((p) => !/^\d+$/.test(p));
  return pieces.every((p) => (/^\d+$/.test(p) ? p.length < 15 || synthNumber(p) : mixed ? fillerStrict(p) : fillerWord(p)));
};
/** Les identifiants de documents de la base en mémoire des tests (« radarApps_c49eb5fd », « radarTracked_w00001 »). */
const MEMORY_ID = /^(?:[0-9a-f]{8}|w\d{5})$/;
/** Un nom de fichier à numéro (« 800.jpeg », une couverture à sa taille) : un nombre et une extension de média ou de données. */
const NUMBERED_FILE = /^\d+\.(?:jpe?g|heic|png|webp|gif|mp4|mp3|webm|json|jsonl|txt)$/;

/**
 * Un mot qui n'est pas composé : court (moins de 4 caractères), écrit tel quel par le code, de remplissage ou
 * protégé, de forme synthétique, un nombre (15 chiffres ou plus : de forme synthétique) ou un nom de fichier à numéro.
 */
function atomWord(w, vocab) {
  if (w.length < 4 || vocab.has(w)) return true;
  if (/^\d+$/.test(w)) return w.length < 15 || synthNumber(w);
  if (/^\d+(?:\.\d+)?e?$/.test(w)) return true; // un nombre à virgule (un calcul), « 4.99e-05 » compris
  // Le préfixe public de tout sec_uid, et les marques des formes inventées (« synthetique », « temoin »).
  return SYNTH.handle.test(w) || fillerish(w) || w === 'ms4wljabaaaa' || /^(?:synthetique|temoin)[a-z0-9]*$/.test(w) || NUMBERED_FILE.test(w);
}

/**
 * Un mot que le code compose (cf `codeShapes`) : un morceau de gabarit collé à un numéro ou à un mot connu, devant,
 * derrière ou entre deux (« jugee6 », « site16.com », « jugee6_fan12 », « uid_nouveau1 ») ; l'identifiant d'un document
 * d'une table (« radarapps_b54cda26 », « radartracked_compte_mort ») ; ou des morceaux joints par des points ou des
 * soulignés que le code nomme tous comme identifiants (« status_msg », « fetch_one_video », « not_found »).
 * Corrigé le 21/11/2026 : un mot du vocabulaire suivi d'au plus 4 chiffres, ou fait de morceaux du vocabulaire joints
 * par des points ou des soulignés, était connu — 829 des 7 931 pseudos réels de l'export des comptes suivis, absents de
 * main, passaient (un prénom et un mot joints d'un point ou d'un souligné, un prénom suivi d'une année : formes
 * inventées au test, toutes admises). Le vocabulaire porte les mots des commentaires et des titres de tests : ses
 * morceaux composent presque tout pseudo ; les gabarits et les identifiants, eux, ne composent que ce que le code écrit.
 */
function composedWord(w, vocab, depth = 0) {
  const sh = vocab.shapes;
  if (!sh || depth > 4) return false;
  const piece = (x) => x === '' || /^\d{1,6}$/.test(x) || atomWord(x, vocab) || composedWord(x, vocab, depth + 1);
  const doc = w.match(/^([a-z][a-z0-9]*)_(.+)$/);
  if (doc && sh.tables.has(doc[1]) && (MEMORY_ID.test(doc[2]) || piece(doc[2]))) return true;
  const parts = w.split(/[._]/);
  if (parts.length > 1 && parts.every((p) => p !== '' && ((/^\d+$/.test(p) && p.length < 15) || sh.idents.has(p)))) return true;
  // Un morceau court (2 ou 3 caractères : « id », « app », « st ») ne compose qu'avec un numéro, ou, préfixe en tête de
  // mot (`id${slug}`), devant un mot que le code écrit tel quel : collé à n'importe quel mot, il en composerait trop
  // (193 des pseudos réels de l'export).
  const digitsOnly = (x) => /^\d{0,6}$/.test(x);
  for (const f of sh.frags) {
    if (f.length >= w.length) continue;
    for (let at = w.indexOf(f); at >= 0; at = w.indexOf(f, at + 1)) {
      const left = w.slice(0, at);
      const right = w.slice(at + f.length);
      const ok =
        f.length >= 4
          ? piece(left) && piece(right)
          : (digitsOnly(left) && digitsOnly(right)) || (at === 0 && sh.heads.has(f) && right.length >= 4 && vocab.has(right));
      if (ok) return true;
    }
  }
  return false;
}

/**
 * Un mot connu du monde clos : un mot qui n'est pas composé (`atomWord`), ou un mot que le code compose
 * (`composedWord`). Un nombre de 15 chiffres ou plus doit être de forme synthétique (`synthNumber`) ou écrit par le code.
 */
export function knownWord(w, vocab) {
  return atomWord(w, vocab) || composedWord(w, vocab);
}
/** Une chaîne qui est un document JSON : ses chaînes sont lues une à une (cf `strings`), pas son texte échappé. */
const isJsonDoc = (s) => {
  const t = s.trim();
  if (!/^[[{]/.test(t)) return false;
  try { return typeof JSON.parse(t) === 'object'; } catch { return false; }
};
/** Une clé de schéma (lettres, chiffres et soulignés, une lettre d'abord) : le nom d'un champ, jamais une valeur. */
const SCHEMA_KEY = /^[A-Za-z][A-Za-z0-9_]{0,63}$/;

/**
 * Un texte que le code écrit (cf `codeShapes`) : une suite de textes du code mis bout à bout (une chaîne entière, un
 * morceau de gabarit), et de mots seuls qu'un gabarit y colle — un nombre, un mot de remplissage ou protégé, un pseudo
 * synthétique, un mot que le code compose (« lien sur monsite.io » + « lumiq » + « vidéo » + « 12 »). Rejoué le
 * 21/11/2026 sur les 13 932 légendes réelles distinctes des exports : 84 passent (0,6 %), 27 avec deux mots de quatre
 * lettres ou plus ; les mots seuls du vocabulaire en laissaient passer 657.
 */
export function codeText(s, vocab) {
  const sh = vocab.shapes;
  const w = wordsOf(s);
  if (!sh) return false;
  const single = (x) => /^\d+$/.test(x) || fillerWord(x) || SYNTH.handle.test(x) || sh.texts.has(x) || composedWord(x, vocab);
  const ok = new Array(w.length + 1).fill(false);
  ok[0] = true;
  for (let i = 0; i < w.length; i++) {
    if (!ok[i]) continue;
    if (single(w[i])) ok[i + 1] = true;
    for (let j = i + 2; j <= Math.min(w.length, i + sh.textMax); j++) if (!ok[j] && sh.texts.has(w.slice(i, j).join(' '))) ok[j] = true;
  }
  return ok[w.length];
}

/** Les clés de texte et de pseudo d'un enregistrement de banc (les entrées des tâches : arguments, réponses servies). */
const ROOT_TEXT_KEYS = [...TEXT_KEYS, 'hook', 'musicTitle', 'bio', 'authorBio', ...BIO_KEYS, 'texts', 'transcript', 'transcription'];
const ROOT_HANDLE_KEYS = [...HANDLE_KEYS, 'authorHandle', 'accountHandle', 'handles', 'authors', 'musicOwner'];

/**
 * LES PSEUDOS ET LES TEXTES D'UN ENREGISTREMENT DE BANC (racine des fixtures, 21/11/2026) : un banc ne porte que ce que
 * ses entrées portent — les réponses enregistrées (remplissage, formes synthétiques) et ce que le code et les tests
 * écrivent. Un texte (légende, bio, texte incrusté…) est du remplissage, ou un texte que le code écrit (`codeText`) ; un
 * pseudo est synthétique, court, protégé, écrit tel quel par le code, ou composé par lui. Corrigé le 21/11/2026 : seul le
 * monde clos, mot à mot, les jugeait — un banc refait sur des comptes réels, avec leurs légendes, passait dès que chaque
 * mot figurait quelque part dans un commentaire ou un titre de test.
 */
function rootFindings(doc, rel, vocab, push) {
  for (const [at, s, key] of strings(doc)) {
    if (key === undefined || key === '{clé}' || key.startsWith('_') || !s) continue;
    if (ROOT_TEXT_KEYS.includes(key) && /\p{L}/u.test(s) && !isJsonDoc(s)) {
      const m = key === 'title' || key === 'musicTitle' ? s.match(SOUND) : null;
      const t = m ? m[2] : s;
      const filler = (t.match(LETTERS) ?? []).every((x) => fillerWord(x));
      if (!filler && !codeText(t, vocab) && !(m && SYNTH.handle.test(t))) push({ file: rel, at, kind: 'texte' });
    }
    if (ROOT_HANDLE_KEYS.includes(key) && /\p{L}/u.test(s)) {
      const h = s.normalize('NFKC').toLowerCase().replace(/^@/, '');
      if (!(h.length < 4 || SYNTH.handle.test(h) || PROTECTED.has(h) || vocab.shapes?.texts.has(h) || composedWord(h, vocab))) push({ file: rel, at, kind: 'pseudo' });
    }
  }
}

// ─── Le contrôle ─────────────────────────────────────────────────────────────────────────────────────────────────

/** Chaque chaîne d'un document JSON (clés comprises), avec son chemin et sa clé ; une chaîne qui est du JSON est ouverte. */
function* strings(x, at = '$', key = undefined) {
  if (typeof x === 'string') {
    yield [at, x, key];
    const t = x.trim();
    if (/^[[{]/.test(t)) {
      let inner;
      try { inner = JSON.parse(t); } catch { inner = undefined; }
      if (inner !== undefined && typeof inner === 'object') yield* strings(inner, `${at}⟨json⟩`, undefined);
    }
  } else if (typeof x === 'number' || typeof x === 'bigint') yield [at, String(x), key];
  else if (Array.isArray(x)) for (let i = 0; i < x.length; i++) yield* strings(x[i], `${at}[${i}]`, key);
  else if (x && typeof x === 'object') for (const [k, v] of Object.entries(x)) {
    yield [`${at}{clé}`, k, '{clé}'];
    yield* strings(v, `${at}.${k}`, k);
  }
}

/** Les manquements d'une réponse enregistrée (sous-dossier des fixtures) : identité et textes. */
function recordedFindings(doc, rel, push) {
  const isVideoId = (k, v) => VIDEO_ID_KEYS.includes(k) && /^\d{12,20}$/.test(v);
  for (const [at, s, key] of strings(doc)) {
    if (key === undefined || key === '{clé}' || key.startsWith('_')) continue;
    if (HANDLE_KEYS.includes(key) && s && !SYNTH.handle.test(s)) push({ file: rel, at, kind: 'pseudo' });
    if (NAME_KEYS.includes(key) && s && !SYNTH.name.test(s)) push({ file: rel, at, kind: 'nom' });
    // « 0 » : aucun compte (un son sans auteur) — ni un uid réel ni un synthétique.
    if (UID_KEYS.includes(key) && s && s !== '0' && !SYNTH.uid.test(s)) push({ file: rel, at, kind: 'uid' });
    if (SEC_KEYS.includes(key) && s && !SYNTH.sec.test(s)) push({ file: rel, at, kind: 'sec_uid' });
    if (BIO_KEYS.includes(key) && s && !SYNTH.bio.test(s)) push({ file: rel, at, kind: 'bio' });
    if (isVideoId(key, s) && !synthId(s)) push({ file: rel, at, kind: 'identifiant' });
    if (REQUEST_ID_KEYS.includes(key) && s && !synthNumber(s.replace(/\D/g, ''))) push({ file: rel, at, kind: 'identifiant' });
    for (const u of urlsIn(s)) {
      const m = u.rest.match(/^\/@([^/?#]+)(?:\/video\/(\d+))?/);
      if (u.host === 'www.tiktok.com' && m && (!SYNTH.handle.test(decodeURIComponent(m[1])) || (m[2] && !synthId(m[2])))) push({ file: rel, at, kind: 'adresse' });
    }
    if (TEXT_KEYS.includes(key)) for (const w of textOf(key, s).match(LETTERS) ?? []) if (!fillerWord(w)) { push({ file: rel, at, kind: 'texte' }); break; }
  }
}

/**
 * Les manquements du monde clos d'un document, toutes fixtures : « inconnu » (un mot ni du code, ni de remplissage,
 * ni de forme synthétique), « identifiant » (un nombre de 15 chiffres ou plus de forme réelle).
 */
function closedWorldFindings(doc, rel, vocab, push) {
  for (const [at, s, key] of strings(doc)) {
    if (key?.startsWith('_') || (key === '{clé}' && SCHEMA_KEY.test(s)) || isJsonDoc(s)) continue;
    // Le protocole et l'hôte d'une adresse sont jugés à part (`FIXTURE_HOSTS`) : restent son chemin et sa requête.
    // Les noms des paramètres d'une requête (« share_item_id= ») sont du schéma, comme les clés.
    // Les clés d'un JSON glissé dans une valeur (une requête encodée) aussi.
    for (const w of wordsOf(readable(s).replace(/https?:\/\/[A-Za-z0-9.-]+/g, ' ').replace(/([?&])[A-Za-z_][A-Za-z0-9_]*=/g, '$1 ').replace(/"[A-Za-z_][A-Za-z0-9_]*"\s*:/g, ' '))) {
      if (knownWord(w, vocab)) continue;
      push({ file: rel, at, kind: /^\d+$/.test(w) ? 'identifiant' : 'inconnu' });
      break;
    }
  }
}

/**
 * Les manquements des fixtures de `dir` : `{ file, at, kind }` — « cdn » (un hôte de média), « hôte » (hors de
 * FIXTURE_HOSTS), « inconnu » et « identifiant » (le monde clos, toutes fixtures), et pour les réponses enregistrées
 * (sous-dossiers) « pseudo », « nom », « uid », « sec_uid », « bio », « identifiant », « adresse » (un pseudo ou un
 * identifiant réels dans une adresse TikTok), « texte ». `vocab` : le vocabulaire du code (`vocabulary`).
 */
export function scanFixtures(dir = FIXTURES, { vocab = vocabulary() } = {}) {
  const out = [];
  const seen = new Set();
  const push = (f) => {
    const k = `${f.file} ${f.at} ${f.kind}`;
    if (!seen.has(k)) { seen.add(k); out.push(f); }
  };
  for (const file of files(dir).filter((f) => TEXT_FILE.test(f))) {
    const text = readFileSync(file, 'utf8');
    const rel = relative(dir, file);
    let doc;
    try { doc = file.endsWith('.json') ? JSON.parse(text) : text; } catch { doc = text; }
    for (const [at, s] of strings(doc)) for (const u of urlsIn(s)) {
      if (isMediaHost(u.host)) push({ file: rel, at, kind: 'cdn' });
      else if (!FIXTURE_HOSTS.includes(u.host.toLowerCase())) push({ file: rel, at, kind: 'hôte' });
    }
    closedWorldFindings(doc, rel, vocab, push);
    // Un nombre écrit tel quel (un identifiant de 19 chiffres) : JSON.parse l'arrondit, le texte le garde.
    // (Un « %22 » d'une adresse encodée n'est pas le début d'un nombre : remplacé, à la même place.)
    for (const m of text.replace(/%[0-9A-Fa-f]{2}/g, '%__').matchAll(/(?<![\d.])\d{15,}(?![\d.])/g)) if (!synthNumber(m[0]) && !vocab.has(m[0]) && !composedWord(m[0], vocab)) push({ file: rel, at: `caractère ${m.index}`, kind: 'identifiant' });
    if (rel.includes(sep) && typeof doc === 'object') recordedFindings(doc, rel, push);
    else if (typeof doc === 'object') rootFindings(doc, rel, vocab, push);
  }
  return out;
}

/** Un sec_uid réel : le préfixe des sec_uid de TikTok suivi d'une longue suite (64 caractères au banc). */
const REAL_SEC = /MS4wLjABAAAA[A-Za-z0-9_-]{20,}/;
/** Un long nombre écrit dans le code : 17 à 20 chiffres d'un tenant (ni la suite d'une décimale, ni le morceau d'un plus long). */
const LONG_NUMBER = /(?<![\d.])\d{17,20}(?!\d)/g;
/**
 * Le début d'un identifiant que le code complète (12 à 16 chiffres suivis d'un « ${ », un rang ou un suffixe) : il porte
 * la date et une partie des bits bas d'une vidéo. Synthétique seulement avec sa suite de zéros (`synthNumber`). Corrigé
 * le 21/11/2026 : un gabarit de 14 chiffres réels passait (LONG_NUMBER en veut 17 d'un tenant).
 */
const COMPOSED_ID = /(?<![\d.])(\d{12,16})\$\{/g;
/**
 * Une valeur de requête d'adresse de partage écrite en clair (u_code, _d, share_item_id…) : le code de partage d'un
 * compte, un jeton, un identifiant. Une forme synthétique porte « temoin », une suite de six zéros ou n'a pas de chiffre.
 */
const SHARE_QUERY = /[?&](?:u_code|_d|share_item_id|share_link_id|sec_user_id|user_id|item_id)=([A-Za-z0-9_-]{8,})/g;
const syntheticToken = (t) => !/\d/.test(t) || /temoin/i.test(t) || synthNumber(t.replace(/\D/g, '')) || /0{6}/.test(t);
/**
 * Un pseudo de forme réelle : minuscules et chiffres, au moins un point ou un souligné entre eux (« lina.rousseau_88 »,
 * « pervenche.soir », « zebrevide.app ») — ni synthétique, ni témoin (« temoin » dans le pseudo), ni un fichier (une
 * extension de code, de données ou de média), ni un site (un domaine de pays, .com, .io…, un raccourcisseur de lien).
 * Corrigé le 21/11/2026 : il fallait aussi un chiffre, et une fin en .app ou .co passait — 865 des 8 000 pseudos de
 * l'export des comptes suivis étaient reconnus (10,8 %).
 */
export const handleShaped = (h) =>
  /^[a-z][a-z0-9]*(?:[._][a-z0-9]+)+$/.test(h) && !SYNTH.handle.test(h) && !h.includes('temoin') && !/\.(?:json|jsonl|[cm]?[jt]sx?|md|txt|csv|png|jpe?g|heic|webp|gif|mp4|mp3)$/.test(h);
/** Un site plutôt qu'un pseudo (une chaîne entière) : un domaine de pays ou générique. Une MENTION (« @x.app ») reste un pseudo. */
const SITE = /\.(?:[a-z]{2}|com|net|org|io|app|bio|store|health|link|page|site|shop|online)$/;
/**
 * LES CHAÎNES DU CODE DU RADAR QUI CITENT UN COMPTE PUBLIC, hors des comptes de départ et des verdicts relus : des marques
 * et des apps (des entreprises, pas des personnes) citées « @… », un pseudo pris pour motif d'exclusion (NOT_FIXES) — et
 * des chaînes de la forme d'un pseudo qui n'en sont pas (motifs de texte, champs d'API, motifs de verdict). Toutes déjà
 * publiées sur main, à leur place dans le code : chacune y est encore écrite (tests/radar/fixtures-publiques.test.ts),
 * la liste ne nomme rien que le code ne publie déjà. Une citation nouvelle d'un compte n'y entre que par une décision.
 */
export const CITED_PUBLIC = new Set([
  'valorant', 'mises', 'lyricfluentapp', 'wingai', 'wingai_app', 'leaked', 'juliana_healthy',
  'benefits_app', 'know_the', 'friend_see', 'videos_minoritaires', 'total_impressions',
]);
/**
 * Les mots que le code du Radar écrit HORS de ses chaînes : ses commentaires et ses identifiants (TypeScript), et leurs
 * morceaux. Une chaîne de la forme d'un pseudo dont chaque morceau de 4 lettres ou plus en est un (« status_code »,
 * « mot_cle ») n'est pas un pseudo cité : un pseudo réel porte un prénom, un mot que le code n'écrit nulle part ailleurs.
 */
function proseWords(root, radarCode) {
  const out = new Set();
  for (const d of radarCode) {
    let all;
    try { all = files(join(root, d)); } catch { continue; }
    for (const f of all.filter((x) => CODE_FILE.test(x) && !isFixture(x) && !x.includes(`${sep}node_modules${sep}`))) {
      const sc = ts.createScanner(ts.ScriptTarget.Latest, false, ts.LanguageVariant.Standard, readFileSync(f, 'utf8'));
      for (let k = sc.scan(); k !== ts.SyntaxKind.EndOfFileToken; k = sc.scan()) {
        if (k !== ts.SyntaxKind.SingleLineCommentTrivia && k !== ts.SyntaxKind.MultiLineCommentTrivia && k !== ts.SyntaxKind.Identifier) continue;
        // Une mention dans un commentaire est une citation, pas de la prose : ses mots n'y entrent pas.
        for (const w of wordsOf(sc.getTokenText().replace(/@[\p{L}\p{N}_.]+/gu, ' '))) for (const p of [w, ...w.split(/[._]/)]) if (p) out.add(p);
      }
    }
  }
  return out;
}
/** Un libellé de mention que le contrôle accepte : synthétique, protégé (alphabet de l'OTAN, lettres mathématiques), témoin. */
const syntheticLabel = (l) => !/\p{L}/u.test(l) || SYNTH.handle.test(l) || PROTECTED.has(l) || PROTECTED.has(l.toLowerCase()) || l.includes('temoin');

/** Les pseudos que les comptes de départ et les verdicts relus déclarent (`PUBLIC_HANDLE_SOURCES`). */
function publicHandles(root) {
  const out = new Set();
  for (const f of PUBLIC_HANDLE_SOURCES) {
    let text;
    try { text = readFileSync(join(root, f), 'utf8'); } catch { continue; }
    for (const m of text.matchAll(/[a-z0-9._]+/g)) out.add(m[0].replace(/^[._]+|[._]+$/g, ''));
  }
  return out;
}

/**
 * Les manquements du code et des tests du Radar (`SCOPE`, hors fixtures) : « cdn » (adresse de média réelle),
 * « sec_uid », « identifiant » (17 à 20 chiffres de forme réelle : vidéo, son, compte), « pseudo » (une mention balisée
 * d'un pseudo non synthétique ; dans `RADAR_CODE`, un pseudo de forme réelle, cité « @… » ou chaîne entière, que
 * `PUBLIC_HANDLE_SOURCES` ne déclare pas).
 */
export function scanCode(root = ROOT, scope = SCOPE, radarCode = RADAR_CODE) {
  const out = [];
  const declared = publicHandles(root);
  const idents = codeShapes(root, scope).idents;
  const prose = proseWords(root, radarCode);
  /** Un pseudo cité que rien ne déclare : ni départ ni verdict relu, ni public cité, ni synthétique, ni un mot du code. */
  const undeclared = (h) => !declared.has(h) && !CITED_PUBLIC.has(h) && !syntheticLabel(h) && !idents.has(h);
  /**
   * Une MENTION (« @… », toute forme, casse comprise) : un compte. Corrigé le 21/11/2026 : seule une mention de forme
   * réelle (chiffre, point ou souligné) l'était, sans fin en .app — « @pervenche.soir », « @zebrevide.app » passaient.
   * Une chaîne qui n'est QUE la mention (« "@suno" », un motif d'app) est jugée comme une chaîne (ci-dessous).
   */
  const mentioned = (line) =>
    [...line.matchAll(/(?<![\w@/.-])@([A-Za-z0-9._]{2,30})(?![\w/-])/g)].some((m) => {
      if (/["'`]$/.test(line.slice(0, m.index)) && /^["'`]/.test(line.slice(m.index + m[0].length))) return false;
      const h = m[1].toLowerCase().replace(/[._]+$/, '');
      return h.length >= 3 && undeclared(h);
    });
  /** Une chaîne entière de la forme d'un pseudo (« @ » de tête permis), hors site, dont un morceau n'est ni un identifiant ni un mot du code. */
  const quoted = (line) =>
    [...line.matchAll(/(["'`])@?([A-Za-z0-9._]{4,30})\1/g)].some((m) => {
      const h = m[2].toLowerCase();
      if (!handleShaped(h) || SITE.test(h) || !undeclared(h)) return false;
      const parts = h.split(/[._]/);
      if (parts.every((p) => (/^\d+$/.test(p) && p.length < 15) || idents.has(p))) return false;
      return !parts.every((p) => p.length < 4 || /^\d+$/.test(p) || prose.has(p));
    });
  for (const d of scope) {
    let all;
    try { all = files(join(root, d)); } catch { continue; }
    for (const file of all.filter((f) => TEXT_FILE.test(f) && !isFixture(f) && !f.includes(`${sep}node_modules${sep}`))) {
      const rel = relative(root, file);
      const radar = radarCode.some((r) => rel === r || rel.startsWith(`${r}${sep}`) || rel.startsWith(`${r}/`)) && !PUBLIC_HANDLE_SOURCES.includes(rel.split(sep).join('/'));
      readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
        const at = `ligne ${i + 1}`;
        if (urlsIn(line).some(longMediaUrl)) out.push({ file: rel, at, kind: 'cdn' });
        if (REAL_SEC.test(line)) out.push({ file: rel, at, kind: 'sec_uid' });
        if ([...line.matchAll(LONG_NUMBER)].some((m) => !synthNumber(m[0])) || [...line.matchAll(COMPOSED_ID)].some((m) => !/0{6}/.test(m[1])) || [...line.matchAll(SHARE_QUERY)].some((m) => !syntheticToken(m[1])))
          out.push({ file: rel, at, kind: 'identifiant' });
        const marked = [...line.matchAll(/<m\b[^>]*>([^<]*)<\/m>/g)].some((m) => [...m[1].matchAll(/@([^\s@<&]+)/g)].some((h) => !syntheticLabel(h[1])));
        const cited = radar && (mentioned(line) || quoted(line));
        if (marked || cited) out.push({ file: rel, at, kind: 'pseudo' });
      });
    }
  }
  return out;
}

// ─── L'anonymiseur (--anonymise) ─────────────────────────────────────────────────────────────────────────────────

const SOUND = /^((?:original sound|son original|som original|sonido original|suono originale|originalton)\s*-\s*)(.*)$/i;
/** Une date en secondes (2014 à 2039) ; en millisecondes (un curseur), mille fois plus. */
const isDateS = (v) => Number.isInteger(v) && v > 1_400_000_000 && v < 2_200_000_000;
const isDateMs = (v) => Number.isInteger(v) && v > 1_400_000_000_000 && v < 2_200_000_000_000;
/** Les compteurs d'une vidéo : tirés autour des vrais, jamais pris pour des dates. */
const STATS_KEYS = ['statistics', 'stats'];
/** Les emoji de remplacement, par largeur UTF-16 (1 : plan de base, 2 : au-delà) : la largeur est gardée, pas l'emoji. */
const EMOJI = { 1: ['☀', '☁', '☂', '☕', '♻', '⚡', '⛄', '✨'], 2: ['🌵', '🍋', '🎈', '🐢', '🦊', '🧩', '🪁', '🫧'] };
/** Un morceau de texte réécrit : un mot, une suite de chiffres, un emoji. */
const PIECE = /(\p{L}[\p{L}\p{M}]*)|(\d+)|(\p{Extended_Pictographic})/gu;

/**
 * Un anonymiseur : un tirage par passage (clé des mots, table des dates, facteurs des compteurs), commun à toutes les
 * réponses qu'il réécrit — la même vidéo chez ScrapeCreators et chez TikHub reste la même — et jamais gardé.
 * `rewrite(…docs)` réécrit en un passage des réponses entières, sur place.
 *  - LES DATES (21/11/2026) : une table secrète et MONOTONE. La plus récente recule de 1 à 12 h, puis chaque écart entre
 *    deux dates connues du passage est tiré entre la moitié et une fois et demie l'écart réel : l'ordre est gardé,
 *    aucun écart n'est commun. Un identifiant daté (vidéo, son, hashtag) prend la date réécrite dans ses 32 bits de
 *    tête, un curseur en millisecondes aussi. Corrigé le 21/11/2026 : toutes les dates reculaient d'un même écart, tiré
 *    dans une fenêtre publique de 30 minutes — une vidéo retrouvée (durée, hashtag) livrait l'écart, et la date à la
 *    seconde de toutes les autres fixtures.
 *  - LES TEXTES : chaque mot devient un morceau du remplissage d'une largeur tirée (0,6 à 1,5 fois la sienne), casse et
 *    plan (ASCII, lettres mathématiques) gardés ; chaque emoji, un autre de même largeur UTF-16 ; les positions de
 *    `text_extra` (en unités UTF-16, comme TikTok) suivent la réécriture de `desc`. Corrigé le 21/11/2026 : la largeur
 *    de chaque caractère et les emoji étaient gardés, une empreinte de la légende.
 *  - LES COMPTEURS : durée à ×0,75–1,33, vues et j'aime à ×0,5–2 (un facteur par vidéo, et par compteur à ±10 %),
 *    abonnés à ×0,6–1,6 (corrigé le 21/11/2026 : ±3 % et ±25 %).
 *  - PAR DÉFAUT (21/11/2026) : une valeur sous une clé qu'il ne connaît pas est réécrite comme un texte — mots hors du
 *    vocabulaire du code du Radar (`vocab` : convex/radar, pas les tests, dont les témoins imitent des valeurs réelles)
 *    remplacés, un texte libre en entier, longs nombres inventés, dates de la table —, jamais gardée faute de figurer
 *    dans une liste.
 */
export function anonymizer({ seed = randomBytes(32), vocab = vocabulary(ROOT, ['convex/radar']) } = {}) {
  const mac = (s) => createHmac('sha256', seed).update(s).digest();
  const draw = (s) => mac(s).readUInt32BE(0) / 2 ** 32;
  const between = (s, lo, hi) => lo + (hi - lo) * draw(s);
  const handles = new Map();
  const uids = new Map();
  const ids = new Map();
  const cdn = new Map();
  let nextHandle = 100;
  let nextUid = 100n;
  let nextLow = 0n;
  const tagIds = new Map();
  const tagIdOf = (id) => {
    if (!tagIds.has(id)) tagIds.set(id, String(1_000 + tagIds.size));
    return tagIds.get(id);
  };

  // La table des dates (secondes réelles → réécrites), monotone ; complétée par interpolation pour une date tardive.
  const dates = new Map();
  const planDates = (secs) => {
    const fresh = [...new Set(secs)].filter((t) => !dates.has(t)).sort((a, b) => a - b);
    if (!fresh.length) return;
    if (!dates.size) {
      // Les écarts tirés un à un, de la plus récente à la plus ancienne…
      const base = new Array(fresh.length);
      base[fresh.length - 1] = fresh[fresh.length - 1] - Math.round(between('ancre', 3_600, 12 * 3_600));
      for (let i = fresh.length - 2; i >= 0; i--) base[i] = base[i + 1] - Math.max(1, Math.round((fresh[i + 1] - fresh[i]) * between(`ecart\0${fresh[i]}`, 0.5, 1.5)));
      // … puis chaque date bouge seule, d'au plus 30 minutes et d'au plus un tiers de l'écart à ses voisines : deux
      // vidéos proches n'ont pas le même décalage, et l'ordre est gardé.
      for (let i = 0; i < fresh.length; i++) {
        const room = Math.min(1_800, i > 0 ? (base[i] - base[i - 1]) / 3 : 1_800, i < fresh.length - 1 ? (base[i + 1] - base[i]) / 3 : 1_800);
        dates.set(fresh[i], base[i] + Math.round(room * between(`seule\0${fresh[i]}`, -1, 1)));
      }
      return;
    }
    for (const t of fresh) {
      const known = [...dates.keys()].sort((a, b) => a - b);
      const lo = known.filter((x) => x < t).pop();
      const hi = known.find((x) => x > t);
      const f = between(`ecart\0${t}`, 0.5, 1.5);
      if (lo !== undefined && hi !== undefined) dates.set(t, Math.round(dates.get(lo) + ((t - lo) / (hi - lo)) * (dates.get(hi) - dates.get(lo))));
      else if (lo !== undefined) dates.set(t, dates.get(lo) + Math.max(1, Math.round((t - lo) * f)));
      else dates.set(t, dates.get(hi) - Math.max(1, Math.round((hi - t) * f)));
    }
  };
  const dateOf = (t) => {
    if (!dates.has(t)) planDates([t]);
    return dates.get(t);
  };
  const msOf = (ms) => dateOf(Math.floor(ms / 1000)) * 1000 + (ms % 1000);
  const datedTop = (id) => {
    const top = Number(BigInt(id) >> 32n);
    return isDateS(top) ? top : null;
  };

  /** Une clé de compte : celles de `UID_KEYS`, et toute clé qui finit en uid ou user_id (« author_user_id », « owner_uid »). */
  const isUidKey = (k) => !SEC_KEYS.includes(k) && (UID_KEYS.includes(k) || /(?:^|_)(?:uid|user_id|user_ids|pk)$|(?:User|Owner|Author)Ids?$/.test(k));
  const handleOf = (h) => {
    if (SYNTH.handle.test(h)) return h;
    if (!handles.has(h)) handles.set(h, `auteur_${nextHandle++}`);
    return handles.get(h);
  };
  const uidOf = (u) => {
    if (!u || SYNTH.uid.test(u)) return u;
    if (!uids.has(u)) uids.set(u, (9_100_000_000_000_000_000n + nextUid++).toString());
    return uids.get(u);
  };
  /** Un identifiant daté (vidéo, son, hashtag) : la date de la table, le reste inventé ; un identifiant non daté : seul le reste. */
  const idOf = (id) => {
    if (!/^\d{12,20}$/.test(id) || SYNTH.uid.test(id)) return id;
    if (!ids.has(id)) {
      const R = BigInt(id);
      const top = datedTop(id);
      const low = synthId(id) ? lowOf(id) : 1_000n + 10n * nextLow++ + (R % 10n);
      ids.set(id, (((top !== null ? BigInt(dateOf(top)) : R >> 32n) << 32n) + low).toString());
    }
    return ids.get(id);
  };
  /** Un mot : un morceau du remplissage d'une largeur tirée, casse et plan (ASCII, lettres de `ASTRAL`) gardés. */
  const word = (w) => {
    if (PROTECTED.has(w.toLowerCase()) || PROTECTED.has(w)) return w;
    const chars = [...w];
    const n = chars.length;
    const lower = w.toLowerCase();
    const m = Math.max(1, Math.round(n * between(`largeur\0${lower}`, 0.6, 1.5)));
    const start = mac(`mot\0${lower}`).readUInt32BE(0) % (FILLER.length - m);
    const fill = FILLER.slice(start, start + m);
    const astralWord = chars[0].codePointAt(0) > 0xffff;
    return [...fill]
      .map((f, i) => {
        const src = chars[Math.min(n - 1, Math.floor((i * n) / m))];
        if (astralWord) return astral(f);
        return src !== src.toLowerCase() ? f.toUpperCase() : f;
      })
      .join('');
  };
  /** Une suite de chiffres : moins de 3 gardée ; sinon tirée, de même longueur ; 15 et plus, de forme synthétique. */
  const digits = (d) => {
    if (d.length < 3) return d;
    const x = [...d].map((_, i) => String(mac(`chiffres\0${d}`)[i % 32] % 10)).join('');
    return d.length < 15 ? x : `${x.slice(0, 4)}${'0'.repeat(d.length - 8)}${x.slice(-4)}`;
  };
  const emoji = (e) => {
    const set = EMOJI[e.length] ?? EMOJI[2];
    return set[mac(`emoji\0${e}`)[0] % set.length];
  };
  /**
   * Un texte réécrit morceau par morceau (mots, chiffres, emoji ; `keep` : les mots gardés tels quels), et la table de
   * ses positions UTF-16 (ancienne → nouvelle) : les positions de `text_extra` la suivent.
   */
  const mapped = (s, keep = () => false, shortDigits = false) => {
    const map = new Array(s.length + 1);
    let out = '';
    let at = 0;
    const copy = (to) => {
      for (; at < to; at++) {
        map[at] = out.length;
        out += s[at];
      }
    };
    for (const m of s.matchAll(PIECE)) {
      copy(m.index);
      const piece = m[0];
      const next = m[1] !== undefined ? (keep(piece) ? piece : word(piece)) : m[2] !== undefined ? (shortDigits && piece.length < 6 ? piece : digits(piece)) : emoji(piece);
      for (let j = 0; j < piece.length; j++) map[at + j] = out.length + Math.floor((j * next.length) / piece.length);
      out += next;
      at += piece.length;
    }
    copy(s.length);
    map[s.length] = out.length;
    return { out, map };
  };
  const plain = (s) => mapped(s).out;
  const textOutsideTags = (s, f) => s.replace(/(<[^>]*>)|([^<]+)/g, (_m, tag, txt) => tag ?? f(txt));
  const free = (key, s) => {
    if (key === 'title') {
      const m = s.match(SOUND);
      if (m) return `${m[1]}${SYNTH.handle.test(m[2]) ? m[2] : handleOf(m[2])}`;
    }
    if (key === 'content_desc' && /^\s*\[/.test(s)) try { return JSON.stringify(JSON.parse(s).map(plain)); } catch { /* lu tel quel */ }
    if (key === 'markup_text') return textOutsideTags(s, plain);
    return plain(s);
  };
  const mediaUrl = (u) => {
    if (!cdn.has(u)) {
      const url = new URL(u);
      const last = url.pathname.split('/').pop() ?? '';
      const tilde = last.indexOf('~');
      const n = String(cdn.size + 1).padStart(2, '0');
      // Le gabarit d'image (« ~tplv-tiktokx-cropcenter:300:400.heic ») est gardé, rien du chemin signé.
      const name = tilde >= 0 ? `couverture-${n}${tokenwise(last.slice(tilde))}` : `couverture-${n}${tokenwise(last.match(/\.[a-z0-9]+$/i)?.[0] ?? '')}`;
      cdn.set(u, `https://example.invalid/media/${name}`);
    }
    return cdn.get(u);
  };
  /** Les adresses d'une chaîne : médias remplacés, pseudos et identifiants des adresses TikTok remplacés. */
  const URL_RE = /https?:\/\/([A-Za-z0-9.-]+)([^\s"'`<>\\)]*)/g;
  const urls = (s) =>
    s.replace(URL_RE, (whole, host, rest) => {
      if (isMediaHost(host)) return mediaUrl(whole);
      if (host === 'www.tiktok.com') {
        const [path, query] = [rest.replace(/\?.*$/, ''), rest.match(/\?(.*)$/)?.[1]];
        // Le pseudo ; puis chaque segment du chemin : un identifiant (vidéo, photo, hashtag) inventé, un mot jugé par le monde clos.
        const p = path
          .replace(/^\/@([^/?#]+)/, (_m, h) => `/@${handleOf(decodeURIComponent(h))}`)
          .replace(/(?<=\/)[^/@][^/]*/g, (seg) => (/^\d{12,20}$/.test(seg) ? idOf(seg) : encodeURI(tokenwise(readable(seg)))));
        // La requête d'une adresse de partage (u_code, share_item_id, _d…) : chaque valeur réécrite comme une valeur inconnue.
        return `https://www.tiktok.com${p}${query === undefined ? '' : `?${query.replace(/([^=&]*)=([^&]*)/g, (_m, k, v) => `${k}=${encodeURIComponent(generic(readable(v)))}`)}`}`;
      }
      // Une couverture déjà réécrite (avant le 21/11/2026, le premier segment du chemin réel était gardé) : sous /media/.
      if (host === 'example.invalid') return `https://example.invalid${rest.replace(/^\/[^/]+\/(couverture-)/, '/media/$1')}`;
      if (FIXTURE_HOSTS.includes(host.toLowerCase())) return whole;
      // Tout autre hôte : rien de l'adresse n'est gardé (corrigé le 21/11/2026 : son chemin l'était, hors des longues suites).
      if (!other.has(whole)) other.set(whole, `https://example.invalid/adresse-${String(other.size + 1).padStart(2, '0')}`);
      return other.get(whole);
    });
  const other = new Map();
  /**
   * PAR DÉFAUT : une valeur sous une clé inconnue — adresses à part, mots hors du vocabulaire du code remplacés, longs
   * nombres inventés. Moins de 6 chiffres sont gardés : ce sont des codes et des renvois (le `tag_id` d'une mention, que
   * le balisage nomme aussi), pas des identités.
   */
  /**
   * Un texte hors adresses, mot à mot comme le contrôle le lit (`wordsOf`) : un mot que le monde clos connaît
   * (`knownWord` : vocabulaire du code, remplissage, forme synthétique) est gardé ; un autre, réécrit (lettres de
   * remplissage, chiffres tirés, moins de 6 chiffres gardés). L'anonymiseur et le contrôle jugent un mot de même.
   */
  const tokenwise = (s) => {
    // Un texte libre (des espaces) : aucun mot n'est gardé pour être du vocabulaire du code (« receta » ou « venez » le
    // sont peut-être) — seuls le remplissage et les mots protégés restent, comme dans une légende.
    const free = /\s/.test(s.trim());
    return s.replace(/[\p{L}\p{N}_.]+/gu, (t) => {
      // Une date (secondes, millisecondes) : la table ; un nombre de 6 chiffres ou plus : tiré (un identifiant).
      if (/^\d+$/.test(t)) {
        const n = Number(t);
        if (isDateS(n)) return String(dateOf(n));
        if (isDateMs(n)) return String(msOf(n));
        if (t.length >= 12 && t.length <= 20) return idOf(t);
        return t.length >= 6 ? digits(t) : t;
      }
      if (!free && keepable(t.normalize('NFKC').toLowerCase().replace(/^[._]+|[._]+$/g, ''))) return t;
      return mapped(t, () => false, true).out;
    });
  };
  /**
   * Un mot gardé sous une clé inconnue : court, du vocabulaire du code (ou fait de ses morceaux : « like_list »),
   * protégé, de forme synthétique. JAMAIS pour avoir l'air du remplissage : un identifiant tiré au hasard
   * (« v0f044gc0000d4… », l'adresse d'une vidéo chez TikTok) n'a que de courtes suites de lettres, que le contrôle ne
   * distingue pas du remplissage — il est réécrit.
   */
  const keepable = (w) =>
    w.length < 4 || vocab.has(w) || PROTECTED.has(w) || SYNTH.handle.test(w) || w === 'ms4wljabaaaa' || /^(?:synthetique|temoin)[a-z0-9]*$/.test(w) || NUMBERED_FILE.test(w) || composedWord(w, vocab);
  const generic = (s) => {
    if (/^\d{12,20}$/.test(s)) return idOf(s);
    // Une chaîne qui est un document JSON (« extra », « log_pb ») : réécrite comme un document, clés connues comprises.
    if (isJsonDoc(s)) return JSON.stringify(rewriteOne(JSON.parse(s.trim())));
    let out = '';
    let at = 0;
    for (const m of s.matchAll(URL_RE)) {
      out += tokenwise(s.slice(at, m.index)) + urls(m[0]);
      at = m.index + m[0].length;
    }
    return out + tokenwise(s.slice(at));
  };
  const factor = (key, lo, hi) => between(key, lo, hi);
  const scale = (v, f) => (typeof v === 'number' && v > 0 ? Math.max(1, Math.round(v * f)) : v);

  /**
   * Les dates qui fondent la table : celles des vidéos (`create_time`) et des 32 bits de tête de leurs identifiants.
   * Toute autre date (un curseur, un champ inconnu, un identifiant de hashtag) est placée ensuite dans la table, par
   * interpolation : une valeur aberrante ne la déplace pas.
   */
  const collect = (o, key, out) => {
    if (Array.isArray(o)) return o.forEach((x) => collect(x, key, out));
    if (typeof o === 'number') {
      if ((key === 'create_time' || key === 'createTime') && isDateS(o)) out.push(o);
      return;
    }
    if (typeof o === 'string') {
      if (VIDEO_ID_KEYS.includes(key) && /^\d{12,20}$/.test(o) && !SYNTH.uid.test(o) && datedTop(o) !== null) out.push(datedTop(o));
      return;
    }
    if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) if (!k.startsWith('_')) collect(v, k, out);
  };

  /** Réécrit une réponse (un objet JSON), sur place. */
  const rewriteOne = (doc) => {
    const visit = (o, parentKey, videoOf) => {
      if (Array.isArray(o)) return o.forEach((x, i) => (typeof x === 'string' ? (o[i] = generic(x)) : typeof x === 'number' ? (o[i] = num(parentKey, x, undefined, videoOf)) : visit(x, parentKey, videoOf)));
      if (!o || typeof o !== 'object') return;
      // La clé d'une vidéo (ses compteurs et sa durée sont tirés autour des vrais) : `aweme_id`, ou l'`id` d'une vidéo
      // de la page web (itemList : `id`, `stats`).
      const vid = typeof o.aweme_id === 'string' ? o.aweme_id : typeof o.id === 'string' && /^\d{12,20}$/.test(o.id) && (o.stats || o.statistics) ? o.id : undefined;
      const videoKey = vid !== undefined ? idOf(vid) : undefined;
      const orig = { ...o };
      // La légende d'abord : les positions de `text_extra` suivent sa réécriture.
      if (typeof o.desc === 'string' && Array.isArray(o.text_extra)) {
        const { out, map } = mapped(o.desc);
        const at = (p) => (typeof p === 'number' && p >= 0 ? map[Math.min(p, o.desc.length)] : p);
        for (const t of o.text_extra) if (t && typeof t === 'object') {
          if ('start' in t) t.start = at(t.start);
          if ('end' in t) t.end = at(t.end);
        }
        o.desc = out;
      }
      // Une clé hors schéma (un pseudo, un texte, un identifiant en clé d'objet) : réécrite comme une valeur.
      for (const k of Object.keys(orig)) if (!k.startsWith('_') && !SCHEMA_KEY.test(k)) {
        const nk = generic(k);
        if (nk !== k) {
          o[nk] = o[k];
          delete o[k];
          orig[nk] = orig[k];
          delete orig[k];
        }
      }
      for (const [k, v] of Object.entries(orig)) {
        if (k.startsWith('_') || (k === 'desc' && o.desc !== v)) continue;
        if (typeof v === 'string') {
          let s = v;
          if (HANDLE_KEYS.includes(k) && s) s = handleOf(s);
          else if (NAME_KEYS.includes(k) && s) s = SYNTH.name.test(s) ? s : 'Auteur';
          else if (isUidKey(k)) s = /^\d+$/.test(s) ? uidOf(s) : generic(s);
          else if (SEC_KEYS.includes(k)) s = s && !SYNTH.sec.test(s) ? `MS4wLjABAAAA-synthetique${String(handles.size).padStart(3, '0')}` : s;
          else if (BIO_KEYS.includes(k)) s = s && !SYNTH.bio.test(s) ? `bio de ${handleOf(o.unique_id ?? o.uniqueId ?? 'auteur')}` : s;
          else if (VIDEO_ID_KEYS.includes(k)) s = /^\d{12,20}$/.test(s) ? idOf(s) : /^\d{6,}$/.test(s) ? digits(s) : generic(s);
          else if (REQUEST_ID_KEYS.includes(k)) s = s.replace(/\d/g, '0').replace(LETTERS, word);
          else if (k === 'hashtag_id' && /^\d{6,}$/.test(s)) s = /^\d{12,20}$/.test(s) ? idOf(s) : tagIdOf(s);
          else if (TEXT_KEYS.includes(k)) s = free(k, s);
          else {
            o[k] = generic(s);
            continue;
          }
          o[k] = urls(s);
        } else if (typeof v === 'number') o[k] = num(k, v, { parentKey, orig }, videoOf);
        else if (v && typeof v === 'object') visit(v, STATS_KEYS.includes(parentKey) ? parentKey : k, videoKey ?? (Array.isArray(v) ? undefined : videoOf));
      }
    };
    /** Un nombre : date, curseur, identifiant, compteur — tout autre nombre est gardé. */
    const num = (k, v, ctx, videoOf) => {
      const parentKey = ctx?.parentKey;
      if (STATS_KEYS.includes(parentKey) && videoOf) return scale(v, factor(`stats\0${videoOf}`, 0.5, 2) * factor(`stats\0${videoOf}\0${k}`, 0.9, 1.1));
      if (k === 'id' && parentKey === 'music' && v > 1e15) return Number(idOf(typeof ctx.orig.id_str === 'string' ? ctx.orig.id_str : BigInt(Math.round(v)).toString()));
      if (isUidKey(k) && Number.isInteger(v) && v > 0) return Number(uidOf(BigInt(v).toString()));
      if (isDateS(v)) return dateOf(v);
      if (isDateMs(v)) return msOf(v);
      // Un identifiant (clé en id, ids ou pk) : daté, la table ; sinon tiré, de même longueur. Au-delà de 2^53, un nombre
      // JavaScript est arrondi : sa forme écrite garde au moins six zéros (synthétique, `synthNumber`).
      const big = (x) => (x > Number.MAX_SAFE_INTEGER ? Number(`${String(x).slice(0, 4)}${'0'.repeat(String(x).length - 4)}`) : x);
      if (Number.isInteger(v) && v >= 1e14) {
        const id = BigInt(v).toString();
        return datedTop(id) !== null ? Number(idOf(id)) : big(Number(digits(id)));
      }
      if (Number.isInteger(v) && v >= 100_000 && /(?:id|ids|pk)$/i.test(k)) return Number(digits(String(v)));
      if (k === 'follower_count' || k === 'following_count' || k === 'total_favorited' || k === 'aweme_count') return scale(v, factor(`fans\0${handleOf(String(ctx?.orig?.unique_id ?? ctx?.orig?.uniqueId ?? ctx?.orig?.uid ?? ''))}`, 0.6, 1.6));
      if (k === 'duration' && parentKey === 'video' && videoOf && v > 0) return Math.round(v * factor(`duree\0${videoOf}`, 0.75, 1.33));
      return v;
    };
    visit(doc, undefined, undefined);
    return doc;
  };
  /** Réécrit en un passage des réponses entières, sur place ; rend la première. */
  const rewrite = (...docs) => {
    const secs = [];
    for (const d of docs) collect(d, undefined, secs);
    planDates(secs);
    for (const d of docs) rewriteOne(d);
    return docs[0];
  };
  return { rewrite, handleOf, idOf, dateOf };
}

// ─── La contre-épreuve (--contre, locale) ───────────────────────────────────────────────────────────────────────

const tokens = (s) =>
  (s.normalize('NFKC').toLowerCase().match(/[\p{L}\p{N}_.]+/gu) ?? []).map((t) => t.replace(/^[._]+|[._]+$/g, '')).filter(Boolean);
/** La forme comparée : NFKC, minuscules, mots séparés d'une espace, points et soulignés de bord retirés. */
export const normalize = (s) => tokens(String(s)).join(' ');

const CAPTION_WORDS = 6;
/** Des compteurs ne désignent une vidéo qu'à partir de ce nombre de vues (5 vues et 0 j'aime : des milliers de vidéos). */
const STATS_MIN_VIEWS = 1_000;
const RAW_HANDLE_KEYS = [...HANDLE_KEYS, 'handle', 'authorHandle', 'accountHandle'];
const RAW_ID_KEYS = [...VIDEO_ID_KEYS, ...UID_KEYS, ...SEC_KEYS, 'videoId', 'musicId'];
const RAW_TEXT_KEYS = [...TEXT_KEYS, 'hook', 'musicTitle', 'bio', ...BIO_KEYS];
/** Des mots courants qui sont aussi, aux bancs, un pseudo ou un nom : une légende de remplissage peut les porter. */
export const COMMON = new Set(['chez', 'kept', 'trace', 'beta', 'gamma', 'delta', 'epsilon', 'zeta']);

/**
 * Ce que les réponses brutes et les exports réels permettent de reconnaître, rangé en mémoire seulement : pseudos et
 * noms (`names`), identifiants (`ids`), textes (bios, légendes entières et leurs suites de `CAPTION_WORDS` mots), dates
 * de publication (`times`), compteurs (vues et j'aime d'une même vidéo, `stats`).
 */
export function realValues(raws) {
  const names = new Set();
  const ids = new Set();
  const texts = new Set();
  const times = new Set();
  const stats = new Set();
  const name = (v) => {
    const n = normalize(v);
    // Les mots protégés (libellés inventés, noms d'app publics) sont admis dans les fixtures : jamais comptés pseudo réel.
    if (n.replace(/\s/g, '').length >= 4 && !COMMON.has(n) && !PROTECTED.has(n)) names.add(n);
  };
  const text = (v) => {
    const w = tokens(v);
    if (w.join('').length >= 12 && w.length >= 3) texts.add(w.join(' '));
    for (let i = 0; i + CAPTION_WORDS <= w.length; i++) {
      const g = w.slice(i, i + CAPTION_WORDS).join(' ');
      if (g.length >= 24) texts.add(g);
    }
    for (const m of String(v).matchAll(/@([\p{L}\p{N}_.]+)/gu)) name(m[1]);
  };
  const url = (v) => {
    for (const m of String(v).matchAll(/tiktok\.com\/@([^/?#"\s]+)(?:\/(?:video|photo)\/(\d+))?/g)) {
      name(decodeURIComponent(m[1]));
      if (m[2]) ids.add(m[2]);
    }
    // Les valeurs de requête d'une adresse de partage (u_code, _d, share_item_id…) : le code de partage d'un compte, un
    // jeton daté, un identifiant. Corrigé le 21/11/2026 : jamais relevées, un u_code réel passait.
    for (const u of urlsIn(String(v))) for (const m of u.rest.matchAll(/[?&][A-Za-z_][A-Za-z0-9_]*=([A-Za-z0-9_-]{8,})/g)) if (/\d/.test(m[1])) ids.add(m[1]);
  };
  const walk = (o) => {
    if (Array.isArray(o)) return o.forEach(walk);
    if (!o || typeof o !== 'object') return;
    const st = o.statistics ?? o.stats;
    if (st && typeof st === 'object') {
      const views = st.play_count ?? st.playCount;
      const likes = st.digg_count ?? st.diggCount;
      if (Number(views) > 0) stats.add(`${Number(views)}/${Number(likes ?? 0)}`);
    }
    if (typeof o.views === 'number' && o.views > 0 && typeof o.likes === 'number') stats.add(`${o.views}/${o.likes}`);
    for (const [k, v] of Object.entries(o)) {
      if (v && typeof v === 'object') {
        if (k === 'music' && (v.id_str ?? v.id) != null) ids.add(String(v.id_str ?? v.id));
        walk(v);
        continue;
      }
      if (typeof v !== 'string' && typeof v !== 'number') continue;
      const s = String(v);
      if (RAW_HANDLE_KEYS.includes(k) || NAME_KEYS.includes(k)) name(s);
      if (RAW_ID_KEYS.includes(k) && /^[\w-]{6,}$/.test(s) && (/\D/.test(s) || s.length >= 6)) ids.add(s);
      if (RAW_TEXT_KEYS.includes(k)) {
        const m = s.match(SOUND);
        if (k === 'title' && m) name(m[2]);
        else text(s);
      }
      if ((k === 'create_time' || k === 'createTime') && Number(v) > 1e9) times.add(Number(v));
      if (k === 'publishedAt' && Number(v) > 1e12) times.add(Math.floor(Number(v) / 1000));
      if (typeof v === 'string' && v.includes('tiktok.com/@')) url(v);
      // Les morceaux signés d'une adresse de média (une suite de 24 caractères ou plus, chiffres et deux casses mêlés).
      if (typeof v === 'string' && /^https?:\/\//.test(v)) for (const u of urlsIn(v)) if (isMediaHost(u.host)) for (const p of u.rest.match(/[A-Za-z0-9]{24,}/g) ?? []) if (/\d/.test(p) && /[a-z]/.test(p) && /[A-Z]/.test(p)) ids.add(p);
    }
  };
  for (const r of raws) walk(r);
  return { names, ids, texts, times, stats, prefixes: idPrefixes(ids) };
}

/**
 * LES MORCEAUX D'UNE VALEUR RÉELLE (21/11/2026) : les débuts d'un identifiant opaque, assez longs pour ne pas tomber
 * juste par hasard — 12 chiffres au moins d'un identifiant numérique (vidéo, son, compte : sa date à la seconde et une
 * partie de ses bits bas), 10 caractères au moins d'un code mêlé de lettres et de chiffres (u_code, jeton, sec_uid au-delà
 * de son préfixe public). Un témoin coupé en deux (`"…" + "…"`), un gabarit `${préfixe}${i}` les portent sans porter la
 * valeur entière.
 */
export const ID_PREFIX_DIGITS = 12;
export const ID_PREFIX_MIXED = 10;
const SEC_PREFIX = 'MS4wLjABAAAA';
function idPrefixes(ids) {
  const out = new Set();
  for (const id of ids) {
    const digits = /^\d+$/.test(id);
    if (!digits && !/\d/.test(id)) continue;
    const from = digits ? ID_PREFIX_DIGITS : id.startsWith(SEC_PREFIX) ? SEC_PREFIX.length + 8 : ID_PREFIX_MIXED;
    for (let n = from; n <= id.length; n++) out.add(digits ? id.slice(0, n) : id.slice(0, n).toLowerCase());
  }
  return out;
}
/**
 * Une chaîne qui commence comme un identifiant réel, sur `ID_PREFIX_DIGITS` chiffres ou `ID_PREFIX_MIXED` caractères au
 * moins (cf `idPrefixes`) : le morceau d'un témoin coupé, ou un identifiant composé de ce morceau et d'un rang. Jamais une
 * forme synthétique (une suite de six zéros).
 */
function realPiece(t, real) {
  if (!real.prefixes?.size || synthNumber(t)) return false;
  const digits = /^\d+$/.test(t);
  const v = digits ? t : t.toLowerCase();
  for (let n = Math.min(v.length, 64); n >= (digits ? ID_PREFIX_DIGITS : ID_PREFIX_MIXED); n--) if (real.prefixes.has(v.slice(0, n))) return true;
  return false;
}

/**
 * Ce qui est DÉJÀ public dans une révision du dépôt (`base`, origin/main par défaut) : ses mots et, dans le code, la doc
 * et les tests, ses suites de `CAPTION_WORDS` mots. Une valeur réelle qui y figure déjà (un mot courant qui est aussi un
 * pseudo, une app que main nomme) n'est pas ce que la branche publie : la contre-épreuve ne la compte pas.
 */
export function publicValues(base = 'origin/main', root = ROOT) {
  const words = new Set();
  const grams = new Set();
  const texts = [];
  const list = execFileSync('git', ['ls-tree', '-r', '-z', base], { cwd: root, encoding: 'utf8', maxBuffer: 1 << 28 }).split('\0').filter(Boolean);
  const blobs = list.map((l) => l.match(/^\d+ blob ([0-9a-f]+)\t(.*)$/)).filter(Boolean).map((m) => ({ sha: m[1], path: m[2] }));
  const out = execFileSync('git', ['cat-file', '--batch'], { cwd: root, input: blobs.map((b) => b.sha).join('\n') + '\n', maxBuffer: 1 << 30 });
  let at = 0;
  for (const b of blobs) {
    const nl = out.indexOf(10, at);
    const size = Number(out.toString('latin1', at, nl).split(' ')[2]);
    const body = out.subarray(nl + 1, nl + 1 + size);
    at = nl + 1 + size + 1;
    if (size > 4_000_000 || body.includes(0)) continue;
    const w = tokens(body.toString('utf8'));
    for (const t of w) {
      words.add(t);
      for (const part of t.split('.')) if (part) words.add(part);
    }
    if (/^(convex|tests|scripts|docs)\//.test(b.path)) {
      for (let i = 0; i + CAPTION_WORDS <= w.length; i++) grams.add(w.slice(i, i + CAPTION_WORDS).join(' '));
      texts.push(` ${w.join(' ')} `);
    }
  }
  // Un texte de moins de `CAPTION_WORDS` mots déjà publié (corrigé le 21/11/2026 : seules les suites de six mots
  // l'étaient — une ligne de main retouchée par la branche, son texte court inchangé, était comptée).
  const all = texts.join('\n');
  return { words, grams, has: (c) => grams.has(c) || all.includes(` ${c} `) };
}

/** Ce qu'une chaîne peut porter : chaque mot (et ses morceaux entre points), chaque suite de 2 à `CAPTION_WORDS` mots. */
function candidates(s) {
  const out = new Set();
  const forms = [s];
  if (/%[0-9a-f]{2}/i.test(s)) try { forms.push(decodeURIComponent(s)); } catch { /* lue telle quelle */ }
  for (const f of forms) {
    const w = tokens(f);
    if (w.length) out.add(w.join(' '));
    for (let i = 0; i < w.length; i++) {
      const parts = w[i].split('.').filter(Boolean);
      for (let a = 0; a < parts.length; a++) for (let b = a + 1; b <= parts.length; b++) out.add(parts.slice(a, b).join('.'));
      for (let n = 2; n <= CAPTION_WORDS && i + n <= w.length; n++) out.add(w.slice(i, i + n).join(' '));
    }
  }
  return out;
}

/**
 * Les correspondances d'une chaîne avec les valeurs réelles : la sorte de chaque valeur reconnue (jamais la valeur).
 * `pub` : ce qui est déjà public (cf `publicValues`), écarté.
 */
function matches(s, real, strict, pub) {
  const kinds = new Set();
  for (const c of candidates(s)) {
    if (real.texts.has(c) && !(pub.has ? pub.has(c) : pub.grams.has(c))) kinds.add('texte');
    // Un morceau du remplissage (« nima » d'« animid ») qui est aussi un pseudo réel : inventé par construction.
    if (real.names.has(c) && !/^[\d\s]+$/.test(c) && !c.split(' ').every((w) => pub.words.has(w) || (/^[a-z]+$/.test(w) && FILLER.includes(w))) && (strict || /[\d_.]/.test(c) || s.includes(`@${c}`) || normalize(s) === c)) kinds.add('pseudo');
  }
  // Un nombre de moins de 9 chiffres (un décalage d'octets, un compteur) qui égale l'un des identifiants courts des bruts
  // (des hashtags anciens, publics) : un hasard, pas une identité.
  for (const m of s.matchAll(/[A-Za-z0-9_-]{6,}/g)) if ((real.ids.has(m[0]) || realPiece(m[0], real)) && !/^\d{1,8}$/.test(m[0]) && !pub.words.has(m[0].toLowerCase())) kinds.add('identifiant');
  return kinds;
}

/** Les vidéos d'un document (objets à `aweme_id` ou `videoId`) : leur date et leurs compteurs, comparés aux réels. */
function numbersOf(doc, real, rel, push) {
  // LES DATES, PAR DOCUMENT (21/11/2026) : une réponse qui garde ses dates réelles les garde toutes ; depuis que chaque
  // date a son propre écart (`anonymizer`), une seule date réécrite qui tombe à la seconde sur l'une des ~20 000 dates
  // réelles des bruts est un hasard attendu (une centaine de dates par passage). Une date n'est comptée que si le
  // document en garde assez pour que ce ne soit pas le hasard (cf plus bas).
  const dated = [];
  const hits = [];
  const walk = (o, at) => {
    if (Array.isArray(o)) return o.forEach((x, i) => walk(x, `${at}[${i}]`));
    if (!o || typeof o !== 'object') return;
    const t = o.create_time ?? o.createTime;
    if (t !== undefined && Number(t) > 1e9) {
      dated.push(Number(t));
      if (real.times.has(Number(t))) hits.push([at, Number(t)]);
    }
    const st = o.statistics ?? o.stats;
    if (st && typeof st === 'object' && Number(st.play_count ?? st.playCount) >= STATS_MIN_VIEWS && real.stats.has(`${Number(st.play_count ?? st.playCount)}/${Number(st.digg_count ?? st.diggCount ?? 0)}`)) push({ file: rel, at, kind: 'compteurs' });
    for (const [k, v] of Object.entries(o)) walk(v, `${at}.${k}`);
  };
  walk(doc, '$');
  // Des dates DISTINCTES (le son d'une vidéo revient sous `music` et `added_sound_music_info`) : au moins deux, et au
  // moins la moitié de celles du document ; ou sa seule date. Rejoué sur les 75 réponses du banc réécrites : 25 des
  // 1 789 dates tombaient à la seconde sur une date réelle, aucune n'était restée la sienne.
  const n = new Set(dated).size;
  const h = new Set(hits.map(([, t]) => t)).size;
  if (n === 1 ? h === 1 : h >= 2 && h * 2 >= n) for (const [at] of hits) push({ file: rel, at, kind: 'date' });
}

/**
 * Les lignes ajoutées par `range` (« a..b » : un commit ou une suite ; une révision seule : depuis elle jusqu'à l'arbre
 * de travail, fichiers pas encore suivis compris).
 */
export function addedLines(range, root = ROOT) {
  const git = (...a) => execFileSync('git', a, { cwd: root, encoding: 'utf8', maxBuffer: 1 << 30 });
  const diff = git('diff', '--unified=0', '--no-color', '--no-ext-diff', range);
  const out = [];
  if (!range.includes('..')) for (const f of git('ls-files', '--others', '--exclude-standard', '-z').split('\0').filter((x) => x && TEXT_FILE.test(x))) {
    readFileSync(join(root, f), 'utf8').split('\n').forEach((text, i) => out.push({ file: f, line: i + 1, text }));
  }
  let file = null;
  let line = 0;
  for (const l of diff.split('\n')) {
    if (l.startsWith('+++ ')) file = l.startsWith('+++ b/') ? l.slice(6) : null;
    else if (l.startsWith('@@')) line = Number(l.match(/\+(\d+)/)?.[1] ?? 0);
    else if (file && l.startsWith('+')) out.push({ file, line: line++, text: l.slice(1) });
  }
  return out;
}

/**
 * LA CONTRE-ÉPREUVE : les fixtures de `dir` (sauf `fixtures: false`) et les lignes ajoutées `lines`, comparées aux
 * valeurs réelles `real` (cf `realValues`). Rend `{ file, at, kind }` — « pseudo », « identifiant », « texte », « date »,
 * « compteurs » —, jamais la valeur.
 */
export function crossCheck(real, { dir = FIXTURES, fixtures = true, lines = [], pub = { words: new Set(), grams: new Set() } } = {}) {
  const out = [];
  const seen = new Set();
  const push = (f) => {
    const k = `${f.file} ${f.at} ${f.kind}`;
    if (!seen.has(k)) { seen.add(k); out.push(f); }
  };
  if (fixtures) for (const file of files(dir).filter((f) => TEXT_FILE.test(f))) {
    const text = readFileSync(file, 'utf8');
    const rel = relative(dir, file);
    let doc;
    try { doc = file.endsWith('.json') ? JSON.parse(text) : text; } catch { doc = text; }
    for (const [at, s] of strings(doc)) for (const kind of matches(s, real, true, pub)) push({ file: rel, at, kind });
    if (typeof doc === 'object') numbersOf(doc, real, rel, push);
    // Un nombre écrit tel quel (un identifiant de 19 chiffres) : JSON.parse l'arrondit, le texte le garde.
    for (const m of text.matchAll(/(?<!\d)\d{9,}(?!\d)/g)) if ((real.ids.has(m[0]) || realPiece(m[0], real)) && !pub.words.has(m[0])) push({ file: rel, at: `caractère ${m.index}`, kind: 'identifiant' });
  }
  for (const l of lines) {
    // Une ligne d'une fixture est une donnée (comparée comme les fixtures) ; une ligne de code, ses chaînes entières.
    const data = l.file.startsWith('tests/radar/fixtures/');
    for (const kind of matches(l.text, real, data, pub)) push({ file: l.file, at: `ligne ${l.line}`, kind });
    if (!data) for (const m of l.text.matchAll(/(["'`])((?:(?!\1)[^\\]|\\.){4,80}?)\1/g)) if (real.names.has(normalize(m[2])) && !normalize(m[2]).split(' ').every((w) => pub.words.has(w))) push({ file: l.file, at: `ligne ${l.line}`, kind: 'pseudo' });
    // Les dates d'une fixture se jugent par document (cf `numbersOf`) ; une date écrite dans le code, une à une.
    if (!data) for (const m of l.text.matchAll(/(?<!\d)(1[5-9]\d{8})(?!\d)/g)) if (real.times.has(Number(m[1])) && !pub.words.has(m[1])) push({ file: l.file, at: `ligne ${l.line}`, kind: 'date' });
  }
  return out;
}

/** Les documents JSON d'une liste de fichiers ou de dossiers (un fichier JSON Lines : une ligne par document). */
export function readRaws(paths) {
  const docs = [];
  for (const p of paths.flatMap((x) => (statSync(x).isDirectory() ? files(x) : [x])).filter((x) => /\.(json|jsonl)$/.test(x))) {
    const t = readFileSync(p, 'utf8');
    try { docs.push(JSON.parse(t)); } catch { for (const l of t.split('\n')) if (l.trim()) try { docs.push(JSON.parse(l)); } catch { /* ligne illisible */ } }
  }
  return docs;
}

const describe = (f) => `${f.file} ${f.at} : ${f.kind}`;

if (process.argv[1] === SELF) {
  const args = process.argv.slice(2);
  if (args[0] === '--anonymise') {
    // Toutes les réponses en un passage : la même vidéo reste la même d'un fichier à l'autre, la table des dates est une.
    const a = anonymizer();
    const paths = args.slice(1);
    const docs = paths.map((p) => JSON.parse(readFileSync(p, 'utf8')));
    a.rewrite(...docs);
    docs.forEach((d, i) => writeFileSync(paths[i], `${JSON.stringify(d, null, 1)}
`));
    // Rien du tirage n'est dit ni gardé (la table des dates comprise).
    console.error(`${paths.length} réponse(s) anonymisée(s) en un passage.`);
  } else if (args[0] === '--contre') {
    const opt = (name) => {
      const i = args.indexOf(name);
      return i > 0 ? args[i + 1] : undefined;
    };
    const flags = new Set(['--depuis', '--diff']);
    const raws = args.slice(1).filter((x, i, all) => !x.startsWith('--') && !flags.has(all[i - 1]));
    const real = realValues(readRaws(raws));
    const base = opt('--depuis') ?? 'origin/main';
    // Depuis le point où la branche a quitté `base`, jusqu'à l'arbre de travail.
    const range = opt('--diff') ?? execFileSync('git', ['merge-base', base, 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim();
    const pub = publicValues(opt('--diff') ? opt('--diff').split('..')[0] : range);
    const found = crossCheck(real, { fixtures: !args.includes('--sans-fixtures'), lines: addedLines(range), pub });
    for (const f of found) console.log(describe(f));
    console.error(`${found.length} correspondance(s) avec ${raws.length} source(s) réelle(s) (${real.names.size} pseudos et noms, ${real.ids.size} identifiants, ${real.texts.size} textes) ; lignes : ${range}.`);
    process.exit(found.length ? 1 : 0);
  } else {
    const dir = args[0] ?? FIXTURES;
    const found = [...scanFixtures(dir), ...(args[0] ? [] : scanCode())];
    for (const f of found) console.log(describe(f));
    console.error(`${found.length} manquement(s) dans ${relative(process.cwd(), dir) || '.'}${args[0] ? '' : ` et ${SCOPE.join(', ')}`}.`);
    process.exit(found.length ? 1 : 0);
  }
}
