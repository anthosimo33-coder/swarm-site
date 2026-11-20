import { defineTable } from "convex/server";
import { v } from "convex/values";
import { networkSearchValidator } from "./radarNetworkSearch";

/**
 * Les tables du Radar, déménagées de Jarvia (convex/schema.ts) le 20/11/2026, mêmes noms et mêmes index : la copie
 * des données (export de Jarvia, import ici) garde les identifiants et les liens entre tables. Non reprises : les
 * pubs (radarAds), les marques des signaux par projet, l'essai des premiers relevés, les analyses par projet et
 * l'ancien Radar (Apify).
 */
export const radarTables = {
  radarSignals: defineTable({
    // Les Reels Instagram viennent des comptes suivis dont la bio donne l'Instagram
    // (videoId « ig:<code> », pas de courbe).
    platform: v.union(v.literal("tiktok"), v.literal("instagram")),
    videoId: v.string(), // aweme_id
    url: v.string(),
    authorId: v.string(),
    authorHandle: v.string(),
    authorFans: v.number(), // abonnés du compte au dernier relevé
    caption: v.string(),
    lang: v.string(), // fr | pt | es-am | es-es | en | autre (cf langBucket)
    region: v.optional(v.string()), // région TikTok de la vidéo
    publishedAt: v.number(),
    durationSec: v.optional(v.number()),
    coverUrl: v.optional(v.string()), // signée, peut expirer → repli UI
    views: v.number(),
    likes: v.number(),
    comments: v.number(),
    shares: v.number(),
    saves: v.number(),
    ratio: v.number(), // vues ÷ max(abonnés, 100) au dernier relevé
    // Relevés successifs (découverte + courbe), bornés : la courbe de la vidéo.
    snapshots: v.array(v.object({ at: v.number(), views: v.number() })),
    // Prochain relevé de courbe ; absent = hors courbe (pas candidate, ou finie).
    nextCheckAt: v.optional(v.number()),
    // Admise dans la courbe à cette date : une vidéo n'y entre qu'UNE fois.
    curveStartedAt: v.optional(v.number()),
    competitor: v.optional(v.string()), // ANCIEN champ (phase 1) : concurrent reconnu au motif
    // App poussée (réseaux, convex/radarNetworks) et les projets dont elle est
    // concurrente : « Concurrent » se lit par projet, au moment de l'affichage.
    appId: v.optional(v.id("radarApps")),
    appName: v.optional(v.string()),
    appRivalOf: v.optional(v.array(v.string())),
    // Vidéo d'un compte suivi : son compte, et ses vues ÷ la médiane du compte.
    trackedAccountId: v.optional(v.id("radarTracked")),
    multiplier: v.optional(v.number()),
    hook: v.optional(v.string()), // texte à l'écran (réponses non allégées)
    musicTitle: v.optional(v.string()),
    transcript: v.optional(v.string()), // ce qui est dit (3 000 caractères au plus)
    transcribedAt: v.optional(v.number()), // posé même sans texte : on ne repaie pas
    // Projets déjà prévenus sur Telegram qu'elle part tôt (radarNetworkMath.isEarlyHit).
    earlyAlerted: v.optional(v.array(v.string())),
    foundBy: v.array(v.string()), // recherches qui l'ont remontée (« cette app·fr »)
    firstSeenAt: v.number(),
    lastSeenAt: v.number(),
    // Devenue invisible sur TikTok (convex/radarAvailability) : le motif, et la date du
    // premier constat. Absent : visible, ou jamais contrôlée.
    unavailable: v.optional(
      v.object({
        reason: v.union(v.literal("private"), v.literal("region"), v.literal("removed"), v.literal("review"), v.literal("restricted"), v.literal("other")),
        at: v.number(),
      }),
    ),
    // Dernier contrôle de visibilité, quel qu'en soit le résultat.
    checkedAt: v.optional(v.number()),
  })
    .index("by_video", ["platform", "videoId"])
    .index("by_published", ["publishedAt"])
    .index("by_next_check", ["nextCheckAt"])
    // Contrôle de visibilité : les vidéos d'un compte (le privé vaut pour toutes), et celles déjà invisibles.
    .index("by_author", ["authorHandle"])
    .index("by_unavailable", ["unavailable.reason"])
    // Les vidéos d'un compte suivi (fiche d'un créateur) : son pseudo peut avoir changé, pas ce lien.
    .index("by_tracked", ["trackedAccountId"]),
  radarSettings: defineTable({
    key: v.literal("global"),
    capUsd: v.number(),
    postes: v.array(v.object({ key: v.string(), qty: v.number(), on: v.boolean() })),
    cutOrder: v.array(v.string()),
    alert80: v.boolean(),
    budgetVersion: v.optional(v.number()), // cf radarSignalsMath.BUDGET_VERSION
    alertProjectId: v.optional(v.string()), // ancien canal Telegram de Jarvia (projet) : plus lu depuis le déménagement
    alertedMonth: v.optional(v.string()), // « 2026-11 » : alerte 80 % déjà partie
    discoveryCursor: v.number(), // prochaine recherche de la rotation
    storeCursor: v.optional(v.number()), // prochaine liste des classements App Store (convex/radarStore)
    lastStoreChartsAt: v.optional(v.number()),
    lastStoreChecksAt: v.optional(v.number()),
    lastStoreStop: v.optional(v.string()), // pourquoi le dernier contrôle s'est arrêté avant la fin (TikTok ne répondait plus)
    // Relevé gratuit des comptes (convex/radarFreeMath) : relevés faits sur les pages publiques depuis le début,
    // replis sur le relevé payant, et le dernier passage (un arrêt = TikTok ne servait plus les profils).
    freeReads: v.optional(v.number()),
    freeFallbacks: v.optional(v.number()),
    lastFreeAt: v.optional(v.number()),
    lastFreeOk: v.optional(v.number()),
    lastFreeFallback: v.optional(v.number()),
    // Les comptes ratés au dernier passage, par raison (radarFreeMath.FreeWhy) : profil absent, privé ou vide (erreur
    // de relevé sans crédit), refusé, page de vidéo illisible, liste trouée (au payant).
    lastFreeWhy: v.optional(v.record(v.string(), v.number())),
    lastFreeStop: v.optional(v.string()),
    // Comptes que la voie gratuite n'a pas eu le temps de prendre au dernier passage, et qui attendent le suivant
    // (au lieu d'être relevés en payant, cf radarFreeMath.overflowToPay).
    lastFreeWaiting: v.optional(v.number()),
    // Place de marché de campagnes (convex/radarMarket) : campagnes connues, lues, jugées ; dernier passage et son arrêt.
    marketSeen: v.optional(v.number()),
    marketRead: v.optional(v.number()),
    marketJudged: v.optional(v.number()),
    lastMarketAt: v.optional(v.number()),
    lastMarketStop: v.optional(v.string()),
    storeSeen: v.optional(v.number()), // apps vues dans les classements depuis le début
    storeChecked: v.optional(v.number()), // contrôles TikTok faits depuis le début
    curveDay: v.optional(v.string()), // jour (Paris) du compteur d'admissions
    curveAdmitted: v.number(), // vidéos admises dans la courbe ce jour-là
    creditsRemaining: v.optional(v.number()), // solde ScrapeCreators au dernier appel
    creditsSeenAt: v.optional(v.number()),
    lowCreditsAlertDay: v.optional(v.string()), // jour (Paris) de la dernière alerte « moins de 3 jours de crédits »
    reserveAlertDay: v.optional(v.string()), // jour (Paris) de la dernière alerte « réserve atteinte »
    economieAlertDay: v.optional(v.string()), // jour (Paris) de la dernière alerte « palier économie » (radarSignalsMath.creditTier)
    survieAlertDay: v.optional(v.string()), // jour (Paris) de la dernière alerte « palier survie »
    accountsLeaseUntil: v.optional(v.number()), // un passage de relevé de comptes tourne jusqu'à cette heure (verrou)
    accountsRerun: v.optional(v.boolean()), // un passage a été demandé pendant qu'un autre tournait : relancé à sa fin
    rejudgeCursor: v.optional(v.string()), // où reprend le rejugement des comptes en pause (convex/radarNetworks)
    judgeCursor: v.optional(v.string()), // où reprend le jugement IA des comptes à preuve faible (convex/radarJudge)
    judgeCursorV: v.optional(v.number()), // la version du parcours en cours ; une autre version repart du début
    judgeApplyOn: v.optional(v.boolean()), // ancien interrupteur (#519) : plus lu, seuls les verdicts relus agissent
    reviewV: v.optional(v.number()), // version de la liste relue parcourue (radarJudgeReview.REVIEW_VERSION)
    reviewAt: v.optional(v.number()), // où en est le parcours de la liste relue
    judgeChainAt: v.optional(v.number()), // dernier passage enchaîné du jugement (radarJudgeMath.chainNext) ; la tâche de 30 min lui cède
    // La reprise des marques à slogan dans la file des contrôles (radarStore.requeueRetagged) : où elle en est, et sa fin.
    storeRetagCursor: v.optional(v.string()),
    storeRetagDoneAt: v.optional(v.number()),
    // La reprise des apps des classements « preuve insuffisante » pour l'essai (radarAuto.requeueTrialCandidates).
    trialRequeueCursor: v.optional(v.string()),
    trialRequeueDoneAt: v.optional(v.number()),
    // La reprise des apps des classements qui sont une app déjà suivie (radarAuto.requeueStoreTwins, 20/11/2026).
    storeTwinCursor: v.optional(v.string()),
    storeTwinRequeueDoneAt: v.optional(v.number()),
    // Le rattrapage du 20/11/2026 (radarAuto.repair2011) : tournures écartées des motifs, doublons fondus.
    repair2011DoneAt: v.optional(v.number()),
    lastDiscoveryAt: v.optional(v.number()),
    lastCurveAt: v.optional(v.number()),
    lastAccountsAt: v.optional(v.number()),
    lastNetworkAt: v.optional(v.number()),
    lastInstaAt: v.optional(v.number()),
    lastTranscriptAt: v.optional(v.number()),
    lastAdsAt: v.optional(v.number()),
    lastError: v.optional(v.string()),
    updatedAt: v.number(),
  }).index("by_key", ["key"]),
  radarApps: defineTable({
    slug: v.string(),
    name: v.string(),
    rivalOf: v.array(v.string()), // slugs de projets
    // Ce que l'équipe d'un projet a décidé à la main (« concurrente » ou non) : `rivalOf` en
    // tient compte, et la liste de départ ne l'écrase pas (radarNetworkMath.effectiveRivalOf).
    rivalByHand: v.optional(v.array(v.object({ project: v.string(), rival: v.boolean() }))),
    strong: v.array(v.string()),
    weak: v.array(v.string()),
    context: v.array(v.string()),
    // Tournures courantes qui contiennent le nom sans le citer (radarNetworkMath.AppRule.not).
    not: v.optional(v.array(v.string())),
    searches: v.array(v.string()), // mots-clés, « #hashtag »
    status: v.union(v.literal("active"), v.literal("paused")),
    // Mise en pause d'office parce qu'elle n'est ni une app, ni un SaaS, ni un jeu mobile (radarJudgeMath.outOfScope,
    // définition du 14/11/2026). Remise en route à la main : `scopeByHand`, plus jamais remise en pause pour ce motif.
    // « essai » : suivie à l'essai (radarAutoMath.trialDecision), sa recherche n'a pas prouvé assez de comptes créateurs.
    pausedReason: v.optional(v.union(v.literal("perimetre"), v.literal("essai"))),
    scopeByHand: v.optional(v.boolean()),
    // Suivie À L'ESSAI depuis (15/11/2026) : une app des classements à deux comptes créateurs, que sa recherche de
    // réseau doit prouver avant qu'elle compte. Effacé quand elle est gardée ; Swarm ne la voit pas avant.
    trialSince: v.optional(v.number()),
    source: v.union(v.literal("seed"), v.literal("manual")),
    networkSearchedAt: v.optional(v.number()),
    // Sa recherche COMPLÈTE est faite (radarNetworkMath.needsDeepSearch) : les suivantes sont courtes.
    deepSearchedAt: v.optional(v.number()),
    // La recherche du réseau en cours, ou la dernière (cf radarNetworkMath.NetworkSearchState).
    networkSearch: v.optional(networkSearchValidator),
    adsSearchedAt: v.optional(v.number()), // bibliothèques de pubs TikTok et Meta
    trackedCount: v.optional(v.number()), // comptes de son réseau (cf radarSignals.attachAccount)
    // Le résumé de son réseau pour l'onglet Comptes suivis (radarNetworkMath.appNet), refait quand ses
    // comptes changent puis chaque heure : l'écran ne relit plus tous les comptes suivis.
    net: v.optional(
      v.object({
        accounts: v.number(),
        active: v.number(),
        // Comptes en pause « hors sujet » : ils ne comptent pas dans le plafond de comptes de l'app.
        offTopic: v.optional(v.number()),
        posts7d: v.number(),
        best: v.optional(v.object({ handle: v.string(), url: v.string(), views: v.number(), multiplier: v.number(), publishedAt: v.number() })),
        countries: v.optional(v.array(v.object({ code: v.string(), accounts: v.number() }))),
        at: v.number(),
      }),
    ),
    // ── La fiche de l'app (13/11/2026), pour Swarm ──────────────────────────────────────────────────────────────
    // Sa niche et ce qu'elle fait en une phrase : posées à la main (radarNicheMath.NICHE_BY_HAND) ou par l'IA.
    niche: v.optional(v.string()),
    pitch: v.optional(v.string()),
    nicheBy: v.optional(v.union(v.literal("hand"), v.literal("ai"))),
    nicheAt: v.optional(v.number()),
    // Ce qu'est le produit, jugé par l'IA (convex/radarJudge, phase A du lot 4 : rangé, RIEN ne le lit pour décider).
    nature: v.optional(
      v.object({
        digital: v.boolean(),
        kind: v.union(v.literal("app"), v.literal("saas"), v.literal("jeu_mobile"), v.literal("jeu"), v.literal("ecommerce"), v.literal("marque"), v.literal("media"), v.literal("autre")),
        aboutIt: v.union(v.literal("oui"), v.literal("non"), v.literal("incertain")),
        why: v.string(),
      }),
    ),
    natureAt: v.optional(v.number()),
    natureV: v.optional(v.number()), // version des définitions de son jugement (radarJudgeMath.NATURE_VERSION)
    // Dernière fois que ses apps sœurs (les autres apps de son éditeur) ont été demandées à l'App Store (radarStore).
    siblingsAt: v.optional(v.number()),
    // Sa fiche App Store, quand elle vient des classements.
    store: v.optional(v.object({ storeId: v.string(), artist: v.string(), genre: v.string(), released: v.string() })),
    // Ce qu'elle paie aux créateurs, quand elle vient d'une place de marché de campagnes.
    market: v.optional(
      v.object({
        source: v.string(),
        productKind: v.union(v.literal("app"), v.literal("software")),
        org: v.string(),
        campaignUrl: v.string(),
        campaigns: v.number(),
        creators: v.number(),
        views: v.number(),
        spentCents: v.number(),
        rateCents: v.optional(v.number()),
        about: v.optional(v.string()),
      }),
    ),
    // Doublon fondu dans une autre app (radarNetworkMath.SeedApp.formerSlugs) : ses comptes
    // l'ont rejointe, elle n'est plus listée ; elle reste pour ce qui la désigne encore.
    mergedInto: v.optional(v.id("radarApps")),
    // Réseau passé en privé (radarAvailabilityMath.darkStep) : comptes privés annoncés à la dernière alerte,
    // et comptés au passage précédent (on ne prévient que d'un nombre stable).
    darkAlerted: v.optional(v.number()),
    darkSeen: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_status", ["status"]),
  radarTracked: defineTable({
    platform: v.literal("tiktok"),
    handle: v.string(),
    appId: v.id("radarApps"),
    status: v.union(v.literal("active"), v.literal("paused")),
    // caption : une légende cite l'app ; manual : ajouté dans l'écran ; seed :
    // ambassadrice vérifiée du sourcing (convex/radarSeedAccounts).
    matchedBy: v.union(v.literal("caption"), v.literal("manual"), v.literal("seed")),
    // Mis en pause automatiquement. « offTopic » : ses vidéos lues ne citent pas (assez) l'app. « vetting » : trouvé
    // par une recherche, il attend le filtre d'entrée (convex/radarVet) — ni relevé, ni montré.
    pausedReason: v.optional(v.union(v.literal("offTopic"), v.literal("vetting"))),
    // Prouvé (filtre d'entrée, contrôle des classements, ajout à la main). Sans cette date, un compte jamais
    // relevé est jugé à son premier relevé : pas assez de vidéos qui citent l'app → en pause.
    proofAt: v.optional(v.number()),
    // Depuis quand il attend le filtre d'entrée. Son prochain relevé (`nextReadAt`) n'est pas touché par l'attente :
    // un compte revérifié reprend son rythme, il n'est pas relevé d'office à sa sortie.
    vetAt: v.optional(v.number()),
    // Réactivé à la main après une telle pause : plus jamais remis en pause pour ce motif.
    keptByHand: v.optional(v.boolean()),
    fans: v.number(),
    bio: v.optional(v.string()), // au dernier relevé
    // Le pays d'où il publie : le plus fréquent parmi ses vidéos relevées (radarNetworkMath.accountCountry).
    country: v.optional(v.string()),
    // Son Instagram, lu dans sa bio (cf radarNetworkMath.igHandleFromBio), relevé à part.
    igHandle: v.optional(v.string()),
    lang: v.optional(v.string()), // langue de ses vidéos TikTok, reprise pour ses Reels
    igFans: v.optional(v.number()),
    igMedianViews: v.optional(v.number()),
    igReadAt: v.optional(v.number()),
    igNextReadAt: v.optional(v.number()),
    igReadErrors: v.optional(v.number()),
    igPosts7d: v.optional(v.number()),
    igBest7d: v.optional(v.object({ code: v.string(), url: v.string(), views: v.number(), multiplier: v.number(), publishedAt: v.number() })),
    medianViews: v.optional(v.number()),
    videosSeen: v.number(),
    lastPostAt: v.optional(v.number()),
    readAt: v.optional(v.number()),
    nextReadAt: v.number(),
    readErrors: v.number(),
    // La vidéo la plus récente qu'on avait de lui, qu'un relevé payant « trou » n'a pas retrouvée (supprimée) : elle
    // ne déclenche plus de relevé payant (radarFreeMath.listGap).
    gapChecked: v.optional(v.string()),
    // Créateur généraliste payé une ou deux fois pour l'app (jugement de l'IA, radarJudgeMath.verdictAction) : pas un
    // créateur de l'app, mais sa vidéo compte dans ses vues, étiquetée « placement payé ». Il reste relevé.
    placement: v.optional(v.boolean()),
    // Agrégats tenus à chaque relevé : l'écran lit les comptes, jamais leurs vidéos.
    posts7d: v.optional(v.number()),
    best7d: v.optional(
      v.object({ videoId: v.string(), url: v.string(), views: v.number(), multiplier: v.number(), publishedAt: v.number(), hook: v.optional(v.string()) }),
    ),
    addedAt: v.number(),
  })
    .index("by_handle", ["platform", "handle"])
    .index("by_app", ["appId"])
    .index("by_due", ["status", "nextReadAt"])
    .index("by_ig_due", ["status", "igNextReadAt"])
    // L'onglet Créateurs lit les comptes d'une langue, jamais tous les comptes suivis.
    .index("by_lang", ["lang", "status"])
    // La file du filtre d'entrée : les comptes « vetting », les plus anciens d'abord.
    .index("by_paused", ["pausedReason", "nextReadAt"]),
  radarRejected: defineTable({
    handle: v.string(),
    appId: v.id("radarApps"),
    at: v.number(),
  })
    .index("by_handle_app", ["handle", "appId"])
    .index("by_at", ["at"]),
  radarAccountJudgments: defineTable({
    accountId: v.id("radarTracked"),
    appId: v.id("radarApps"),
    handle: v.string(),
    weak: v.string(), // pourquoi sa preuve est faible (radarJudgeMath.WeakWhy)
    proof: v.object({ by: v.union(v.string(), v.null()), cites: v.number(), of: v.number() }),
    verdict: v.union(v.literal("pousse"), v.literal("autre_app"), v.literal("sans_rapport"), v.literal("placement"), v.literal("incertain")),
    other: v.optional(v.string()), // l'autre produit qu'il pousse (« autre_app »)
    why: v.string(),
    at: v.number(),
    v: v.optional(v.number()), // version des définitions (radarJudgeMath.JUDGE_VERSION) ; absent = v1, qui ne compte plus
    // Le verdict de l'IA quand le Radar ne l'a pas gardé tel quel (radarJudgeMath.settledVerdict).
    aiVerdict: v.optional(v.union(v.literal("pousse"), v.literal("autre_app"), v.literal("sans_rapport"), v.literal("placement"), v.literal("incertain"))),
    // Appliqué (phase B) : ce qui a été fait (radarJudgeMath.VerdictAction.kind) et quand.
    appliedAt: v.optional(v.number()),
    applied: v.optional(v.string()),
    // Le verdict RELU appliqué (radarJudgeReview) ; absent = appliqué avant la relecture, ou jamais.
    reviewed: v.optional(v.union(v.literal("pousse"), v.literal("autre_app"), v.literal("sans_rapport"), v.literal("placement"), v.literal("incertain"))),
    reviewedOther: v.optional(v.string()),
  })
    .index("by_account", ["accountId"])
    .index("by_applied", ["appliedAt"]),
  radarTrackedVideos: defineTable({
    accountId: v.id("radarTracked"),
    appId: v.id("radarApps"),
    platform: v.optional(v.literal("instagram")), // absent = TikTok ; videoId « ig:<code> »
    videoId: v.string(),
    publishedAt: v.number(),
    views: v.number(),
    snapshots: v.array(v.object({ at: v.number(), views: v.number() })),
    lastSeenAt: v.number(),
    caption: v.optional(v.string()), // 300 caractères au plus
    hook: v.optional(v.string()), // texte à l'écran
    hookKey: v.optional(v.string()), // GABARIT du hook, cf radarNetworkMath.hookTemplate
    musicId: v.optional(v.string()),
    musicTitle: v.optional(v.string()),
    region: v.optional(v.string()), // pays de création de la vidéo d'après TikTok (« FR »)
    // Miniature au dernier relevé : URL signée par TikTok, qui expire. Swarm la
    // recopie chez lui pendant sa synchronisation (convex/swarmExport.ts).
    coverUrl: v.optional(v.string()),
  })
    .index("by_account_published", ["accountId", "publishedAt"])
    // L'export vers Swarm par groupes d'apps (`/swarm/export?…&apps=…`, 15/11/2026).
    .index("by_app", ["appId"])
    .index("by_video", ["videoId"])
    .index("by_hook", ["hookKey"])
    .index("by_music", ["musicId"])
    // La purge des vidéos de plus de 6 mois (radarNetworks.purgeOldVideos), ajouté dans Kopycat le 20/11/2026.
    .index("by_published", ["publishedAt"]),
  radarFormats: defineTable({
    kind: v.union(v.literal("hook"), v.literal("sound")),
    key: v.string(), // hookKey, ou id du son
    label: v.string(), // le hook tel qu'écrit, ou le titre du son
    members: v.array(
      v.object({
        accountId: v.id("radarTracked"),
        handle: v.string(),
        appId: v.id("radarApps"),
        videoId: v.string(),
        publishedAt: v.number(),
        views: v.number(),
        multiplier: v.optional(v.number()),
        hook: v.optional(v.string()), // sa variante du gabarit
        platform: v.optional(v.literal("instagram")),
      }),
    ),
    accountCount: v.number(), // comptes distincts
    appIds: v.array(v.id("radarApps")),
    maxViews: v.number(),
    lastPostAt: v.number(), // dernière publication d'un membre
    firstSeenAt: v.number(),
    alertedProjects: v.optional(v.array(v.string())), // slugs déjà prévenus sur Telegram
    // Sa famille d'une langue à l'autre (hooks seulement), rangée par Claude Haiku
    // (convex/radarFamilies) ; `familyCheckedAt` : déjà rangé, on ne repaie pas.
    familyId: v.optional(v.id("radarHookFamilies")),
    familyCheckedAt: v.optional(v.number()),
    lang: v.optional(v.string()), // langue de la majorité de ses comptes, au rangement
  })
    .index("by_key", ["kind", "key"])
    .index("by_shared", ["accountCount", "lastPostAt"])
    .index("by_last", ["lastPostAt"]),
  radarHookFamilies: defineTable({
    label: v.string(), // l'idée, en français, 8 mots au plus
    examples: v.array(v.object({ text: v.string(), lang: v.string() })),
    createdAt: v.number(),
    lastSeenAt: v.number(), // dernière variante rangée dedans
  }).index("by_last", ["lastSeenAt"]),
  radarAppCandidates: defineTable({
    key: v.string(), // « @<id TikTok> », le domaine, « store:<id App Store> » ou « market:<produit> »
    // « store » : une app des classements App Store dont le hashtag porte des comptes créateurs (convex/radarStore).
    // « market » : une app ou un logiciel qui paie des créateurs sur une place de marché de campagnes (convex/radarMarket).
    // « hashtag » : le hashtag d'une vidéo de produit web (« ce site », « diese Seite »…, radarDiscoveryQueries.WEB_QUERIES).
    // « ia » : une app que des comptes suivis poussent à la place de la leur, d'après le jugement de l'IA (radarJudge).
    kind: v.union(v.literal("mention"), v.literal("domain"), v.literal("store"), v.literal("market"), v.literal("hashtag"), v.literal("ia"), v.literal("liste")),
    label: v.string(),
    authors: v.array(v.string()), // pseudos qui la citent (50 au plus)
    authorCount: v.number(),
    fromApps: v.array(v.id("radarApps")), // apps des comptes suivis qui la citent
    examples: v.array(v.object({ handle: v.string(), url: v.string() })),
    status: v.union(v.literal("new"), v.literal("ignored"), v.literal("followed")),
    firstSeenAt: v.number(),
    lastSeenAt: v.number(),
    // Le suivi d'office l'a regardée (convex/radarAuto) : suivie, ou laissée proposée avec la raison.
    autoAt: v.optional(v.number()),
    autoNote: v.optional(v.string()),
    // App d'une liste importée (radarAuto.importListCandidates, 15/11/2026) : la liste d'où elle vient, sa catégorie.
    liste: v.optional(v.object({ source: v.string(), category: v.optional(v.string()) })),
    // Mention ou site trié par l'IA (radarAutoMath.triageAnswer, 15/11/2026) : ce que c'est, et le nom du produit.
    triage: v.optional(v.object({ at: v.number(), kind: v.union(v.literal("app"), v.literal("software"), v.literal("game"), v.literal("other")), name: v.string() })),
    // L'app suivie qu'elle est devenue : sa fiche (App Store, campagne) y est recopiée, et tenue à jour.
    appId: v.optional(v.id("radarApps")),
    ficheAt: v.optional(v.number()),
    // Une app des classements : sa fiche, le hashtag qui la prouve, et pourquoi chaque compte est un compte créateur.
    store: v.optional(
      v.object({
        storeId: v.string(),
        artist: v.string(),
        genre: v.string(),
        released: v.string(),
        tag: v.string(),
        tagVideos: v.number(),
        tagViews: v.number(),
        creators: v.array(v.object({ handle: v.string(), why: v.union(v.literal("handle"), v.literal("bio"), v.literal("half")) })),
      }),
    ),
    // Un produit payé à la vue : sa nature, ses campagnes additionnées, et la campagne où le lire.
    market: v.optional(
      v.object({
        source: v.string(),
        productKind: v.union(v.literal("app"), v.literal("software")),
        handle: v.string(), // son pseudo, quand une campagne le donne
        org: v.string(), // la marque ou l'agence qui paie
        campaignUrl: v.string(),
        campaigns: v.number(),
        creators: v.number(),
        views: v.number(),
        spentCents: v.number(),
        rateCents: v.optional(v.number()), // ce que rapportent 1 000 vues
        about: v.optional(v.string()), // la description de sa campagne la plus vue
      }),
    ),
  })
    .index("by_key", ["key"])
    .index("by_status_count", ["status", "authorCount"])
    .index("by_kind_status_count", ["kind", "status", "authorCount"])
    // Les apps repérées jamais regardées par le suivi d'office (`autoAt` absent), les plus prouvées d'abord.
    .index("by_kind_status_auto", ["kind", "status", "autoAt", "authorCount"])
    .index("by_last", ["lastSeenAt"]),
  radarNamingStats: defineTable({
    day: v.string(), // « 2026-11-13 », jour de Paris
    videos: v.number(), // vidéos lues
    small: v.number(), // dont celles de petits comptes
    known: v.array(v.object({ slug: v.string(), videos: v.number(), authors: v.array(v.string()) })),
  }).index("by_day", ["day"]),
  radarMarketCampaigns: defineTable({
    source: v.string(),
    campaignId: v.string(),
    url: v.string(),
    firstSeenAt: v.number(),
    nextReadAt: v.number(),
    // new : pas encore lue ; read : lue, pas encore jugée ; judged : son produit est dit.
    stage: v.union(v.literal("new"), v.literal("read"), v.literal("judged")),
    readAt: v.optional(v.number()),
    name: v.optional(v.string()),
    org: v.optional(v.string()),
    description: v.optional(v.string()),
    launchedAt: v.optional(v.number()),
    rateCents: v.optional(v.number()),
    creators: v.optional(v.number()),
    views: v.optional(v.number()),
    spentCents: v.optional(v.number()),
    handles: v.optional(v.array(v.string())), // comptes TikTok de ses meilleurs clips
    judgedAt: v.optional(v.number()),
    kind: v.optional(v.union(v.literal("app"), v.literal("software"), v.literal("game"), v.literal("other"))),
    product: v.optional(v.string()),
    productHandle: v.optional(v.string()),
    // La clé de l'app repérée qu'elle nourrit (radarMarketMath.marketCandidateKey), pour une app ou un logiciel.
    candidateKey: v.optional(v.string()),
  })
    .index("by_campaign", ["source", "campaignId"])
    .index("by_due", ["nextReadAt"])
    .index("by_stage", ["stage"])
    .index("by_candidate", ["candidateKey"]),
  radarStoreApps: defineTable({
    storeId: v.string(),
    name: v.string(),
    artist: v.string(),
    genre: v.string(),
    released: v.string(), // « 2025-08-14 », vide si le classement ne la donne pas
    countries: v.array(v.string()),
    firstSeenAt: v.number(),
    lastSeenAt: v.number(),
    nextCheckAt: v.number(),
    checkedAt: v.optional(v.number()),
    outcome: v.optional(v.union(v.literal("network"), v.literal("none"), v.literal("known"), v.literal("unreadable"))),
    tag: v.optional(v.string()),
    tagVideos: v.optional(v.number()),
    creators: v.optional(v.number()),
  })
    .index("by_store", ["storeId"])
    .index("by_due", ["nextCheckAt"]),
  radarUsage: defineTable({
    day: v.string(), // « 2026-11-06 »
    month: v.string(), // « 2026-11 »
    poste: v.string(),
    credits: v.number(),
    calls: v.number(),
    errors: v.number(),
    usd: v.optional(v.number()), // dépense en dollars (l'analyse IA), hors crédits
    // Crédits par motif (relevés de comptes : premier, repli, trou, retard, coupure, sonde ; cf radarFreeMath.PaidReason).
    reasons: v.optional(v.record(v.string(), v.number())),
    // Appels payants ÉVITÉS par une page publique de TikTok, par brique (radarSignalsMath.SavedKey) : au moins un
    // crédit chacun. C'est ce qui prouve, sur les serveurs, ce que le banc n'a mesuré que du poste.
    saved: v.optional(v.record(v.string(), v.number())),
  })
    .index("by_month", ["month"])
    .index("by_day_poste", ["day", "poste"]),

  // ─── Garde-fou ANTI-FLOOD des notifications ────────────────────────────────
  // Une fenêtre de groupage OUVERTE, par (projet, type d'événement). Table de
  // TRAVAIL, pas d'historique : un document naît au front montant et est
  // SUPPRIMÉ par son flush.
  //
  // C'est l'EXISTENCE du document qui fait foi, jamais une comparaison de temps :
  // le flush lit et supprime dans la MÊME transaction (notifications.claimWindow),
};
