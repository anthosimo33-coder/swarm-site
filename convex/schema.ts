import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Comptes (Convex Auth).
  ...authTables,
  // La table des comptes de Convex Auth, plus `pro` (19/11) : true = abonné, tout Kopycat. Absent = l'aperçu
  // (convex/boards.ts) : le top 3 des apps, leurs fiches et leurs vidéos. Mis à true par le paiement (Whop) ou à la main.
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    pro: v.optional(v.boolean()),
    // Plus écrit depuis le 19/11 (l'accord est porté par les CGV, sans écran avant Whop) ; gardé pour les comptes de test.
    consentAt: v.optional(v.number()),
  })
    .index("email", ["email"])
    .index("phone", ["phone"]),

  // Les données de chaque écran de l'app, calculées depuis le Radar à chaque
  // synchronisation (convex/radarSync.ts). Une clé par écran ou par fiche :
  // « apps », « app:<slug> », « video:<id> », « creators:<marché> »… (docs/donnees-app.md).
  // Ce que chaque personne garde dans l'app : apps et comptes suivis, dossiers,
  // règles d'alerte, ce qu'elle a déjà lu. Une ligne par personne et par clé
  // (convex/saved.ts, docs/donnees-app.md « Ce que la personne garde »).
  // Paiement Whop (19/11, convex/whop.ts). Un abonnement par adhésion Whop (mem_…), relié au compte par la donnée
  // `kopycat_user` posée sur le lien de paiement. `users.pro` se recalcule à chaque changement.
  subscriptions: defineTable({
    // null : achat fait hors de l'app, sans compte relié (audit Q29) ; rattaché à la main par whop:rattacher.
    userId: v.union(v.id("users"), v.null()),
    membershipId: v.string(),
    variantId: v.union(v.string(), v.null()),
    status: v.string(), // trialing, active, past_due, completed, canceled, expired, unresolved
    periodDays: v.union(v.number(), v.null()), // 30 = mensuel, 365 = annuel
    price: v.union(v.string(), v.null()), // prix de renouvellement, ex. « 179.88 »
    currency: v.union(v.string(), v.null()),
    periodEnd: v.union(v.number(), v.null()), // fin de la période payée (ms)
    cancelAtPeriodEnd: v.boolean(),
    manageUrl: v.union(v.string(), v.null()),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]).index("by_membership", ["membershipId"]),
  // Les paiements reçus (reçus des Réglages), remboursements compris.
  whopPayments: defineTable({
    paymentId: v.string(),
    userId: v.union(v.id("users"), v.null()),
    membershipId: v.union(v.string(), v.null()),
    total: v.union(v.string(), v.null()),
    currency: v.union(v.string(), v.null()),
    status: v.string(), // paid, failed, refunded, disputed…
    createdAt: v.number(),
  }).index("by_payment", ["paymentId"]).index("by_user", ["userId"]),
  // Événements déjà traités (Whop peut renvoyer le même) et leur résultat, pour le suivi.
  whopEvents: defineTable({ eventId: v.string(), type: v.string(), at: v.number(), note: v.optional(v.string()) }).index("by_event", ["eventId"]),
  // Liens de paiement Whop déjà créés (audit F6) : le même est resservi pendant 1 h, par compte, tarif et site de retour.
  checkoutLinks: defineTable({ userId: v.id("users"), key: v.string(), url: v.string(), at: v.number() }).index("by_user_key", ["userId", "key"]),
  // Limites de l'authentification (convex/authLimits.ts) : passages comptés par fenêtre fixe, une ligne par clé.
  authLimits: defineTable({ key: v.string(), n: v.number(), since: v.number() }).index("by_key", ["key"]),
  // Visites du site public (admin › Mesure) : un compteur par heure, sans cookie, sans identifiant, sans adresse IP.
  visits: defineTable({ hour: v.number(), n: v.number() }).index("by_hour", ["hour"]),

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
  // L'empreinte de chaque page de boards, à part (≈ 100 o la ligne) : la synchro compare et liste les pages sans les relire
  // entières (20/11 : 11 Go/jour lus en prod rien que pour les empreintes et les clés). Écrite par saveBoards, effacée
  // par dropBoards ; remplie une fois par radarStore:backfillBoardMetaAll.
  boardMeta: defineTable({ key: v.string(), hash: v.string() }).index("by_key", ["key"]),

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
    quiet: v.optional(v.number()), // silences de TikTok d'affilée (page sans réponse)
    at: v.number(), // dernier essai (0 : jamais)
    foundAt: v.optional(v.number()), // pays trouvé à cette date
  }).index("by_handle", ["handle"]).index("by_country_at", ["country", "at"]).index("by_country_tries_at", ["country", "tries", "at"]),

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
    quiet: v.optional(v.number()), // silences de TikTok d'affilée (miniature introuvable faute de réponse)
    at: v.number(),
  }).index("by_video", ["videoId"]).index("by_done_at", ["done", "at"]).index("by_done_tries_at", ["done", "tries", "at"]),

  // Genre apparent de la personne qui se filme, pour les comptes dont les vidéos sont surtout « ambassadeur »
  // (les autres sont « sans visage » sans appel). ids = ses vidéos montrées à l'IA.
  accountAi: defineTable({
    handle: v.string(),
    done: v.boolean(),
    gender: v.optional(v.string()),
    ids: v.array(v.string()),
    tries: v.number(),
    quiet: v.optional(v.number()), // silences de TikTok d'affilée
    at: v.number(),
    // Lecture par le contenu (v = 2, 18/11) : sur combien de miniatures lues (covers) la personne qui tient le compte se
    // montre elle-même (self). La photo de profil seule ne fait plus le genre. Sans v : ancienne lecture, à relire.
    v: v.optional(v.number()),
    self: v.optional(v.number()),
    covers: v.optional(v.number()),
  }).index("by_handle", ["handle"]).index("by_done_at", ["done", "at"]).index("by_done_tries_at", ["done", "tries", "at"]),

  // Bail d'une tâche de fond (une seule chaîne de lecture à la fois) : jeton du détenteur, valable jusqu'à `until`.
  leases: defineTable({ name: v.string(), token: v.string(), until: v.number() }).index("by_name", ["name"]),

  // Langue des comptes (convex/radarLang.ts), calculée hors de la synchro ; null = on ne sait pas.
  accountLangs: defineTable({ accountId: v.string(), lang: v.union(v.string(), v.null()), at: v.number() }).index("by_account", ["accountId"]),

  videoSlides: defineTable({
    videoId: v.string(),
    slideshow: v.union(v.boolean(), v.null()),
    images: v.optional(v.number()),
    tries: v.number(),
    quiet: v.optional(v.number()), // silences de TikTok d'affilée (page sans réponse)
    at: v.number(), // dernier essai (0 : jamais)
  }).index("by_video", ["videoId"]).index("by_slideshow_at", ["slideshow", "at"]).index("by_slideshow_tries_at", ["slideshow", "tries", "at"]),

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
