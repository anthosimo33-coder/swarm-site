/**
 * RADAR — IDÉES D'ACCROCHES, à l'intérieur d'une app. Le gabarit d'une accroche (radarNetworkMath.hookTemplate : ses 4
 * premiers mots) sépare une même idée reprise sous des tournures différentes. 24/11/2026, Diane AI : « pov : t'as
 * terminé de réviser avec 3h d'avance parce que t'as écouté cette fille avec 17 de moyenne… », « POV: tu as fini de
 * réviser 5h plus tôt parce que t'as suivi les conseils d'un mec qui avait 17… », « POV : t'as réussi à rattraper tout
 * ton semestre en 1 semaine… » : une seule idée, que ses comptes reprennent depuis des semaines, en une dizaine de
 * gabarits (« t as termine de », « tu as fini d », « tu as fini de », « t as fini de », « t as reussi a »…), dont
 * aucun n'était sur la fiche de l'app. Claude Haiku range chaque accroche d'une app dans une idée déjà connue de cette
 * app ou en ouvre une ; une idée reprise par au moins deux comptes devient un format (radarFormats, clé `idee:<id>`).
 *
 * Le texte lu : celui que TikTok donne (texte posé dans l'appli), sinon celui que l'IA lit sur la miniature
 * (videoAi : 30 % des vidéos des 21 derniers jours ont un texte TikTok, 40 % de plus seulement un texte lu par l'IA,
 * mesuré sur la prod le 24/11/2026). Une idée regarde 45 jours en arrière : la vidéo qui l'a lancée en fait partie
 * (chez Diane AI, 1,3 M de vues le 23/10, quand ses reprises s'étalaient jusqu'au 24/11 ; les reprises d'un format de
 * gabarit ne remontent qu'à 14 jours, FORMAT_WINDOW_MS, et ce lancement n'y était pas).
 *
 * Module pur : textes, consigne, schéma et validation de la réponse, tenue d'une idée et du format qu'elle devient.
 * Les appels et l'écriture vivent dans convex/radar/radarIdeas.
 */
import { FAMILY_MODEL } from "./radarFamiliesMath";
import { hookKey, hookTemplate } from "./radarNetworkMath";

const DAY = 86_400_000;

export const IDEA_MODEL = FAMILY_MODEL;
/** Accroches rangées : publiées dans les 45 derniers jours (la vidéo qui a lancé l'idée en fait partie). */
export const IDEA_WINDOW_MS = 45 * DAY;
/** Accroches différentes par appel, et idées connues de l'app montrées au modèle. */
export const IDEA_BATCH = 100;
export const IDEA_KNOWN_MAX = 150;
/** Une idée reste proposée 60 jours après sa dernière reprise rangée. */
export const IDEA_KNOWN_WINDOW_MS = 60 * DAY;
/** Variantes d'une idée montrées au modèle (les plus vues). */
export const IDEA_EXAMPLES = 2;
/** Reprises gardées par idée (celles du format) : la meilleure de chaque compte d'abord, comme FORMAT_MAX_MEMBERS. */
export const IDEA_MEMBERS = 40;
/** Vidéos et comptes retenus par idée pour la compter et dire quelles accroches elle couvre (radarModels). */
export const IDEA_VIDEOS_MAX = 400;
/** Une vidéo sans texte TikTok attend la lecture de sa miniature par l'IA (après la synchro) : un jour, quatre fois. */
export const IDEA_AI_WAIT_MS = DAY;
/**
 * Les vidéos neuves d'une app attendent 20 h en file, puis partent ensemble, en un appel : ~5 500 accroches par jour sur
 * ~340 apps (prod, semaine du 17/11/2026), un appel par app et par jour au lieu d'un à chaque passage de 15 min. Kopycat
 * ne se synchronise qu'une nuit sur deux : l'attente ne se voit pas.
 */
export const IDEA_GATHER_MS = 20 * 3_600_000;
export const IDEA_MAX_TRIES = 4;
/** Une idée devient un format à partir de deux comptes (comme radarNetworks.shareFormat). */
export const IDEA_FORMAT_ACCOUNTS = 2;
/**
 * …et seulement si deux comptes au moins en reprennent la même tournure (le même gabarit, hookTemplate) : le noyau
 * copié mot pour mot, auquel l'IA rattache les reformulations. Rejeu du 24/11/2026 (14 apps, 40 formats d'idée relus) :
 * 13 faux sans cette règle (des thèmes, « phrases inspirantes », « conseils pour percer », des listes de mots-clés),
 * 2 avec ; elle écarte aussi 7 idées justes sur 27, surtout reprises d'une langue à l'autre par un compte chacune.
 */
export const IDEA_ANCHOR_ACCOUNTS = 2;
const LABEL_MAX = 80;
const TEXT_MAX = 200;
const PROMPT_TEXT_MAX = 160;

/** La clé du format d'une idée dans radarFormats ; un format d'idée se reconnaît à elle. */
export const ideaFormatKey = (ideaId: string) => `idee:${ideaId}`;
export const isIdeaKey = (key: string) => key.startsWith("idee:");

const clip = (s: string, n: number) => {
  const t = Array.from(s.replace(/\s+/g, " ").trim());
  return t.length > n ? `${t.slice(0, n - 1).join("").trimEnd()}…` : t.join("");
};

/**
 * Le texte à l'écran d'une vidéo pour le rangement : celui de TikTok s'il dit quelque chose (3 mots au moins, cf
 * hookKey), sinon celui que l'IA a lu sur la miniature ; `null` sans texte qui dise une idée. Pas celui d'une
 * capture d'écran de l'app (type `demo_ecran`, convex/radarAi) : l'IA y recopie l'interface (rejeu du 24/11/2026 :
 * « Enhance quality Export Add Opacity Erase Cutout… » chez 40 comptes d'Hypic, les titres et BPM de djay chez 40).
 */
export function ideaText(hook: string | null | undefined, ai: { text?: string | null; type?: string | null } | null | undefined): string | null {
  for (const t of [hook, ai?.type === "demo_ecran" ? null : ai?.text]) if (t && hookKey(t)) return clip(t, TEXT_MAX);
  return null;
}

/** Une vidéo à ranger, avec ce que le format montrera d'elle. */
export type IdeaMember = {
  accountId: string;
  handle: string;
  appId: string;
  videoId: string;
  publishedAt: number;
  views: number;
  multiplier?: number;
  hook?: string;
  platform?: "instagram";
};
/** Une accroche différente de l'appel (le même texte posté plusieurs fois n'est montré qu'une fois). */
export type IdeaCandidate = { text: string; videos: IdeaMember[] };
export type KnownIdea = { id: string; label: string; examples: string[] };

/** Les vidéos regroupées par texte (au mot près, sans casse ni ponctuation), dans l'ordre de leur première vidéo. */
export function ideaCandidates(videos: readonly IdeaMember[]): IdeaCandidate[] {
  const byKey = new Map<string, IdeaCandidate>();
  for (const v of videos) {
    const k = hookKey(v.hook);
    if (!k || !v.hook) continue;
    const c = byKey.get(k);
    if (c) c.videos.push(v);
    else byKey.set(k, { text: v.hook, videos: [v] });
  }
  return [...byKey.values()];
}

// Rejeu du 24/11/2026 sur 136 apps : sans la phrase « réécrire l'une en l'autre » ni la liste de ce qui ne suffit pas,
// 13 formats d'idée sur 45 relus étaient des thèmes (« gagner de l'argent avec l'UGC », « présentation d'une voiture »,
// des titres d'épisodes), dont les deux plus gros de leur app (36 et 40 comptes).
export const IDEA_SYSTEM = [
  "You group the on-screen hooks of short videos (TikTok, Instagram) that promote ONE app into ideas.",
  "An idea is a reusable hook that creators copy from each other: the same situation told with the same structure and the same payoff, so that one hook could be rewritten into the other by changing its details.",
  "Details that may change inside one idea: the wording, the opening words (POV:, when, me when…), the numbers, names, the person (a girl, a guy, a friend), the place, the time, the amount, the language.",
  "Example of ONE idea for a dating-safety app: «POV: you find out he still likes his ex's photos» / «when you realise your boyfriend secretly follows his ex again».",
  "Hooks are DIFFERENT ideas when they only share a topic or theme (making money, studying, cars, a relationship, a weekend), the app, an emotion, the opening words, or a type of video (a list, a review, a product or car name, a show or episode title, an announcement).",
  "Example of TWO ideas for a creator-jobs app: «I earned $500 this week making videos for brands» / «my family still thinks UGC isn't a real job».",
  "When in doubt, open a new idea. A hook that matches no other hook and no known idea opens its own new idea.",
  "Labels are written in French: the idea in 8 words or fewer, neutral, without quotation marks.",
].join(" ");

/** La demande : idées connues de l'app (I1…), nouvelles accroches (H1…). Les ids réels ne quittent pas le serveur. */
export function ideaPrompt(appName: string, candidates: readonly IdeaCandidate[], known: readonly KnownIdea[]): string {
  const lines: string[] = [`App: ${clip(appName, 60)}`, "", "Known ideas of this app:"];
  if (known.length === 0) lines.push("(none yet)");
  known.forEach((f, i) => lines.push(`I${i + 1}: ${clip(f.label, LABEL_MAX)} — examples: ${f.examples.map((e) => `«${clip(e, PROMPT_TEXT_MAX)}»`).join(" / ")}`));
  lines.push("", "New hooks to place:");
  candidates.forEach((c, i) => lines.push(`H${i + 1}: «${clip(c.text, PROMPT_TEXT_MAX)}»`));
  lines.push(
    "",
    "For EVERY new hook, give the idea it belongs to: a known idea (I…), or a new idea (N1, N2… — new hooks with the same idea share the same N).",
    "In placements, \"hook\" is the hook's number only (H1, H2…), never its text.",
    "List each new idea once with its French label.",
  );
  return lines.join("\n");
}

/** Un texte comparé à un autre : minuscules, sans accents ni ponctuation, sans la coupe « … ». */
const flat = (s: string) => (hookKey(s.replace(/…$/, "")) ?? "").replace(/\s+/g, "");

/** Le schéma de la réponse (sortie structurée) : un rangement par accroche, les nouvelles idées. */
export const IDEA_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["placements", "newIdeas"],
  properties: {
    placements: {
      type: "array",
      items: { type: "object", additionalProperties: false, required: ["hook", "idea"], properties: { hook: { type: "string" }, idea: { type: "string" } } },
    },
    newIdeas: {
      type: "array",
      items: { type: "object", additionalProperties: false, required: ["id", "label"], properties: { id: { type: "string" }, label: { type: "string" } } },
    },
  },
} as const;

export type IdeaPlacement = { candidate: number; idea: { known: string } | { ref: string } };
export type IdeasPlaced = { placements: IdeaPlacement[]; newIdeas: { ref: string; label: string }[] };

/**
 * La réponse du modèle ramenée à une forme sûre (comme radarFamiliesMath.placeAnswer). Une accroche absente, une idée
 * inconnue ou une nouvelle idée sans étiquette : l'accroche ouvre SON idée, étiquetée de son texte — on ne perd aucune
 * vidéo et on ne range rien au hasard.
 */
export function placeIdeas(answer: unknown, candidates: readonly IdeaCandidate[], known: readonly KnownIdea[]): IdeasPlaced {
  const a = (answer ?? {}) as { placements?: unknown; newIdeas?: unknown };
  const labels = new Map<string, string>();
  for (const f of Array.isArray(a.newIdeas) ? a.newIdeas : []) {
    const id = typeof f?.id === "string" ? f.id.trim().toUpperCase() : "";
    const label = typeof f?.label === "string" ? clip(f.label, LABEL_MAX) : "";
    if (/^N\d+$/.test(id) && label && !labels.has(id)) labels.set(id, label);
  }
  // Le modèle recopie parfois l'accroche elle-même au lieu de son numéro (24/11/2026, rejeu sur la prod : un appel sur
  // quatre, et ses 100 accroches ouvraient chacune leur idée) : on la retrouve par son texte, tel que la demande le montrait.
  const byText = new Map<string, number>();
  candidates.forEach((c, i) => {
    for (const t of [c.text, clip(c.text, PROMPT_TEXT_MAX)]) if (flat(t) && !byText.has(flat(t))) byText.set(flat(t), i + 1);
  });
  const byHook = new Map<number, string>();
  for (const p of Array.isArray(a.placements) ? a.placements : []) {
    const raw = typeof p?.hook === "string" ? p.hook.trim() : "";
    const h = /^H(\d+)$/i.exec(raw);
    const n = h ? Number(h[1]) : byText.get(flat(raw));
    const idea = typeof p?.idea === "string" ? p.idea.trim().toUpperCase() : "";
    if (n && !byHook.has(n)) byHook.set(n, idea);
  }
  const placements: IdeaPlacement[] = [];
  const used = new Map<string, string>();
  candidates.forEach((c, i) => {
    const idea = byHook.get(i + 1) ?? "";
    const e = /^I(\d+)$/.exec(idea);
    if (e && known[Number(e[1]) - 1]) {
      placements.push({ candidate: i, idea: { known: known[Number(e[1]) - 1].id } });
      return;
    }
    if (labels.has(idea)) {
      used.set(idea, labels.get(idea)!);
      placements.push({ candidate: i, idea: { ref: idea } });
      return;
    }
    const own = `self:${i}`;
    used.set(own, clip(c.text, LABEL_MAX));
    placements.push({ candidate: i, idea: { ref: own } });
  });
  return { placements, newIdeas: [...used].map(([ref, label]) => ({ ref, label })) };
}

/** Les idées connues montrées au modèle : les plus reprises (comptes), puis les plus récentes. */
export function knownForPrompt<T extends { accountCount: number; lastSeenAt: number }>(ideas: readonly T[], max = IDEA_KNOWN_MAX): T[] {
  return [...ideas].sort((p, q) => q.accountCount - p.accountCount || q.lastSeenAt - p.lastSeenAt).slice(0, max);
}

/** Ce qu'une idée tient de ses vidéos. */
export type IdeaState = {
  members: IdeaMember[];
  videoIds: string[];
  accountIds: string[];
  accountCount: number;
  lastPostAt: number;
  examples: string[];
};
export const emptyIdea = (): IdeaState => ({ members: [], videoIds: [], accountIds: [], accountCount: 0, lastPostAt: 0, examples: [] });

/**
 * Les reprises montrées d'une idée : la meilleure vidéo de chaque compte d'abord (le nombre de comptes d'un format se
 * lit sur elles : 40 vidéos d'un même compte ne doivent pas cacher les autres), puis les autres, par vues.
 */
export function pickMembers(all: readonly IdeaMember[], max = IDEA_MEMBERS): IdeaMember[] {
  const sorted = [...all].sort((p, q) => q.views - p.views || (p.videoId < q.videoId ? -1 : 1));
  const seen = new Set<string>();
  const first: IdeaMember[] = [];
  const rest: IdeaMember[] = [];
  for (const m of sorted) (seen.has(m.accountId) ? rest : (seen.add(m.accountId), first)).push(m);
  return [...first.slice(0, max), ...rest].slice(0, max).sort((p, q) => q.views - p.views || (p.videoId < q.videoId ? -1 : 1));
}

/** L'idée avec ces vidéos en plus (ou relues : même vidéo, nouvelles vues). */
export function addToIdea(idea: IdeaState, videos: readonly IdeaMember[]): IdeaState {
  const ids = new Set(videos.map((v) => v.videoId));
  const members = pickMembers([...idea.members.filter((m) => !ids.has(m.videoId)), ...videos]);
  const videoIds = [...new Set([...idea.videoIds, ...videos.map((v) => v.videoId)])].slice(-IDEA_VIDEOS_MAX);
  const accountIds = [...new Set([...idea.accountIds, ...videos.map((v) => v.accountId)])].slice(-IDEA_VIDEOS_MAX);
  const examples = [...new Set(members.map((m) => m.hook).filter((h): h is string => !!h))].slice(0, IDEA_EXAMPLES).map((h) => clip(h, PROMPT_TEXT_MAX));
  return {
    members,
    videoIds,
    accountIds,
    accountCount: accountIds.length,
    lastPostAt: Math.max(idea.lastPostAt, ...videos.map((v) => v.publishedAt)),
    examples: examples.length ? examples : idea.examples,
  };
}

/**
 * Le moment où l'idée est devenue partagée : la première vidéo du deuxième compte à la reprendre. C'est la date de
 * naissance de son format (`firstSeenAt`) — une idée rangée après coup (au premier passage) n'est pas « nouvelle ».
 */
export function sharedSince(members: readonly { accountId: string; publishedAt: number }[], fallback: number): number {
  const seen = new Set<string>();
  for (const m of [...members].sort((p, q) => p.publishedAt - q.publishedAt)) {
    seen.add(m.accountId);
    if (seen.size >= IDEA_FORMAT_ACCOUNTS) return m.publishedAt;
  }
  return fallback;
}

/**
 * Le nom d'une idée à l'écran : une de ses accroches, telle qu'écrite (l'écran la montre entre guillemets, comme un
 * format de gabarit) — la plus vue de sa tournure la plus reprise (son gabarit chez le plus de comptes). La plus vue tout
 * court nommait mal (rejeu du 24/11/2026, Diane AI : « Je note ma p1 🦷🎓🩺 » pour la liste « - Moyenne à 17/20 - Dors
 * avant 22h - … » reprise par 22 comptes).
 */
/** Les comptes de chaque tournure (gabarit) d'une idée. */
function byTemplate(members: readonly IdeaMember[]): Map<string, Set<string>> {
  const accounts = new Map<string, Set<string>>();
  for (const m of members) {
    const t = hookTemplate(m.hook);
    if (!t) continue;
    if (!accounts.has(t)) accounts.set(t, new Set());
    accounts.get(t)!.add(m.accountId);
  }
  return accounts;
}

/** Le noyau d'une idée : le nombre de comptes de sa tournure la plus reprise. */
export const ideaAnchor = (members: readonly IdeaMember[]): number => Math.max(0, ...[...byTemplate(members).values()].map((a) => a.size));

export function ideaName(members: readonly IdeaMember[]): string | null {
  const accounts = byTemplate(members);
  const best = Math.max(0, ...[...accounts.values()].map((a) => a.size));
  const sorted = [...members].sort((p, q) => q.views - p.views);
  return sorted.find((m) => { const t = hookTemplate(m.hook); return t && accounts.get(t)!.size === best; })?.hook ?? sorted.find((m) => m.hook)?.hook ?? null;
}

/**
 * Le format d'une idée (une ligne de radarFormats), ou `null` tant que moins de deux comptes la reprennent, ou que
 * deux d'entre eux n'en partagent pas une tournure (IDEA_ANCHOR_ACCOUNTS). Son nom : `ideaName` ; `videos` : les
 * vidéos qu'elle couvre (radarModels écarte les formats de gabarit qu'une idée montrée couvre déjà).
 */
export function ideaFormat(idea: IdeaState & { id: string; label: string }, firstSeenAt: number) {
  if (idea.accountCount < IDEA_FORMAT_ACCOUNTS || idea.members.length === 0 || ideaAnchor(idea.members) < IDEA_ANCHOR_ACCOUNTS) return null;
  const label = ideaName(idea.members) ?? idea.label;
  return {
    kind: "hook" as const,
    key: ideaFormatKey(idea.id),
    label,
    members: idea.members,
    accountCount: new Set(idea.members.map((m) => m.accountId)).size,
    appIds: [...new Set(idea.members.map((m) => m.appId))],
    maxViews: Math.max(0, ...idea.members.map((m) => m.views)),
    lastPostAt: idea.lastPostAt,
    firstSeenAt,
    videos: idea.videoIds,
  };
}
