import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Comptes (Convex Auth).
  ...authTables,

  // Les données de chaque écran de l'app, calculées depuis le Radar à chaque
  // synchronisation (convex/radarSync.ts). Une clé par écran ou par fiche :
  // « apps », « app:<slug> », « video:<id> », « creators:<marché> »… (docs/donnees-app.md).
  // Ce que chaque personne garde dans l'app : apps et comptes suivis, dossiers,
  // règles d'alerte, ce qu'elle a déjà lu. Une ligne par personne et par clé
  // (convex/saved.ts, docs/donnees-app.md « Ce que la personne garde »).
  saved: defineTable({
    userId: v.id("users"),
    key: v.string(),
    value: v.any(),
    updatedAt: v.number(),
  }).index("by_user_key", ["userId", "key"]),

  boards: defineTable({
    key: v.string(),
    data: v.any(),
    hash: v.string(), // empreinte du contenu, hors date : on n'écrit que ce qui change
    updatedAt: v.number(),
    // Page rangée en morceaux de texte (boardParts) : `data` vaut alors null (16/11 : une page peut dépasser 1 Mio ou
    // une liste 8 192 éléments, limites de Convex identiques sur tous les plans ; boards.get la recolle).
    parts: v.optional(v.number()),
  }).index("by_key", ["key"]),
  boardParts: defineTable({ key: v.string(), i: v.number(), text: v.string() }).index("by_key_i", ["key", "i"]),

  // Miniatures des vidéos et icônes des apps, recopiées chez Swarm (les URL de
  // TikTok sont signées et expirent). Clé « v:<id vidéo> » ou « icon:<slug> ».
  media: defineTable({
    key: v.string(),
    storageId: v.id("_storage"),
    url: v.string(),
    at: v.number(),
  }).index("by_key", ["key"]),

  // Fiche App Store de chaque app (trouvée par son nom, une fois).
  appStore: defineTable({
    slug: v.string(),
    url: v.union(v.string(), v.null()), // null : cherchée, pas trouvée
    v: v.optional(v.number()), // version de la règle de correspondance
    art: v.optional(v.union(v.string(), v.null())), // icône de la fiche (mzstatic), copiée sans rappeler l'App Store
    at: v.number(),
  }).index("by_slug", ["slug"]),

  // Journal des synchronisations (la dernière sert à l'écran et au suivi).
  // Les vidéos à ne plus montrer (miniature introuvable : supprimée, compte privé), retirées à la
  // lecture des documents sans attendre la synchro (convex/boards.ts). Une seule ligne.
  hidden: defineTable({ ids: v.array(v.string()), at: v.number() }),

  // Miniatures introuvables (vidéo supprimée, page refusée) : pas de nouvel essai avant 6 h.
  mediaMiss: defineTable({ key: v.string(), at: v.number() }).index("by_key", ["key"]),

  // Pays des comptes que le Radar ne situe pas, lu par Swarm sur la page publique d'une de leurs vidéos
  // (« locationCreated », gratuit ; convex/radarRegions.ts). country null : pas encore lu, ou rien trouvé.
  accountRegions: defineTable({
    handle: v.string(),
    country: v.union(v.string(), v.null()),
    ids: v.array(v.string()), // ses vidéos les plus récentes, essayées tour à tour
    tries: v.number(),
    at: v.number(), // dernier essai (0 : jamais)
  }).index("by_handle", ["handle"]).index("by_country_at", ["country", "at"]),

  // Carrousels (diaporamas de photos) : TikTok le dit sur la page publique de la vidéo (`imagePost`), le Radar ne le
  // garde pas sur les vidéos qu'il suit. null = pas encore lu ; images = nombre de photos.
  // Lecture IA (Claude Haiku 5.5, convex/radarAi.ts) de la miniature de chaque vidéo montrée : son type de contenu et le
  // texte incrusté à l'écran (le Radar n'a pas celui des montages CapCut, et coupe les longs). done = lue.
  videoAi: defineTable({
    videoId: v.string(),
    done: v.boolean(),
    type: v.optional(v.string()),
    text: v.optional(v.string()),
    tries: v.number(),
    at: v.number(),
  }).index("by_video", ["videoId"]).index("by_done_at", ["done", "at"]),

  // Genre apparent de la personne qui se filme, pour les comptes dont les vidéos sont surtout « ambassadeur »
  // (les autres sont « sans visage » sans appel). ids = ses vidéos montrées à l'IA.
  accountAi: defineTable({
    handle: v.string(),
    done: v.boolean(),
    gender: v.optional(v.string()),
    ids: v.array(v.string()),
    tries: v.number(),
    at: v.number(),
  }).index("by_handle", ["handle"]).index("by_done_at", ["done", "at"]),

  // Bail d'une tâche de fond (une seule chaîne de lecture à la fois) : jeton du détenteur, valable jusqu'à `until`.
  leases: defineTable({ name: v.string(), token: v.string(), until: v.number() }).index("by_name", ["name"]),

  // Langue des comptes (convex/radarLang.ts), calculée hors de la synchro ; null = on ne sait pas.
  accountLangs: defineTable({ accountId: v.string(), lang: v.union(v.string(), v.null()), at: v.number() }).index("by_account", ["accountId"]),

  videoSlides: defineTable({
    videoId: v.string(),
    slideshow: v.union(v.boolean(), v.null()),
    images: v.optional(v.number()),
    tries: v.number(),
    at: v.number(), // dernier essai (0 : jamais)
  }).index("by_video", ["videoId"]).index("by_slideshow_at", ["slideshow", "at"]),

  syncRuns: defineTable({
    startedAt: v.number(),
    finishedAt: v.optional(v.number()),
    ok: v.optional(v.boolean()),
    counts: v.optional(v.any()),
    error: v.optional(v.string()),
    // Synchro par groupes (15/11) : dernier signe de vie d'une étape, état des étapes (fichiers rangés, groupes), et
    // fichiers d'étape effacés.
    beatAt: v.optional(v.number()),
    stage: v.optional(v.any()),
    cleaned: v.optional(v.boolean()),
  }).index("by_started", ["startedAt"]),
});
