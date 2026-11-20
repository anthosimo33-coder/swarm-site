import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Le Radar relève ses comptes jusque tard le soir (heure de Paris) : Swarm se
// synchronise ensuite, à 1 h 30 UTC (2 h 30 ou 3 h 30 à Paris selon la saison).
crons.daily("synchronisation du Radar", { hourUTC: 1, minuteUTC: 30 }, internal.radarSync.run, {});

// Le pays des comptes que le Radar ne situe pas, lu sur la page publique de leurs vidéos (150 comptes par passage).
crons.interval("pays des comptes sans pays", { minutes: 15 }, internal.radarRegions.fill, {});
crons.interval("carrousels des videos montrees", { minutes: 15 }, internal.radarSlides.fill, {});
crons.interval("lecture IA des videos", { minutes: 15 }, internal.radarAi.fillVideos, {});
crons.interval("lecture IA du genre des comptes", { minutes: 15 }, internal.radarAi.fillGender, {});

// Paiement : chaque adhésion Whop avec accès relue chez Whop une fois par jour (audit S9).
crons.daily("reconciliation des abonnements Whop", { hourUTC: 4, minuteUTC: 0 }, internal.whop.reconcile, {});

// Le Radar lui-même (convex/radar/, déménagé de Jarvia le 20/11/2026) : chaque tâche passe par radar/gate.tick, qui ne
// lance rien tant que RADAR_ON n'est pas à 1 sur le déploiement (la prod, une fois les données copiées), ni jamais sur
// le dev. Mêmes cadences que chez Jarvia ; sans les pubs, l'ancien Radar, l'essai des premiers relevés ni les
// analyses par projet.
const radar = (fn: string) => [internal.radar.gate.tick, { fn: `radar/${fn}` }] as const;
// Signaux : découverte 4 fois par jour, courbe H+6/H+24/H+48 chaque heure (budget du mois, radarSignalsMath).
crons.interval("radar decouverte des signaux", { hours: 6 }, ...radar("radarSignals:runDiscovery"));
crons.hourly("radar courbe des signaux", { minuteUTC: 40 }, ...radar("radarSignals:runCurve"));
crons.daily("radar purge des signaux", { hourUTC: 3, minuteUTC: 50 }, ...radar("radarSignals:purgeOldSignals"));
// Réseaux : recherche du réseau des apps dues chaque heure, relevé des comptes suivis toutes les 10 minutes.
crons.interval("radar recherche des reseaux", { hours: 1 }, ...radar("radarNetworks:runNetworkSearch"));
crons.interval("radar releve des comptes", { minutes: 10 }, ...radar("radarNetworks:runAccountReads"));
crons.hourly("radar resume des reseaux", { minuteUTC: 35 }, ...radar("radarNetworks:refreshAppNets"));
crons.daily("radar purge des reseaux", { hourUTC: 3, minuteUTC: 55 }, ...radar("radarNetworks:purgeNetworks"));
crons.daily("radar purge des videos anciennes", { hourUTC: 4, minuteUTC: 10 }, ...radar("radarNetworks:purgeOldVideos"));
crons.interval("radar rejugement des comptes en pause", { hours: 6 }, ...radar("radarNetworks:rejudgePaused"));
// Reels Instagram des comptes suivis, transcriptions des signaux.
crons.hourly("radar instagram", { minuteUTC: 40 }, ...radar("radarSources:runInstaReads"));
crons.interval("radar transcriptions", { hours: 2 }, ...radar("radarSources:runTranscripts"));
// Familles de hooks d'une langue à l'autre (Claude Haiku).
crons.interval("radar familles de hooks", { hours: 6 }, ...radar("radarFamilies:runFamilies"));
// Vidéos devenues invisibles : pages publiques, aucun crédit.
crons.interval("radar visibilite des videos", { hours: 2 }, ...radar("radarAvailability:runChecks"));
// Classements App Store, contrôle de leurs hashtags sur TikTok, apps sœurs.
crons.interval("radar classements app store", { hours: 1 }, ...radar("radarStore:runStoreCharts"));
crons.interval("radar controles app store", { minutes: 5 }, ...radar("radarStore:runStoreChecks"));
crons.interval("radar apps soeurs", { hours: 1 }, ...radar("radarStore:runStoreSiblings"));
// Suivi d'office des apps trouvées, apps à l'essai, tri des mentions par l'IA.
crons.interval("radar suivi d office", { minutes: 10 }, ...radar("radarAuto:runAutoFollow"));
crons.interval("radar apps a l essai", { hours: 1 }, ...radar("radarAuto:settleTrials"));
crons.interval("radar tri des candidates", { minutes: 30 }, ...radar("radarAuto:runCandidateTriage"));
// Petits réseaux, place de marché des campagnes payées.
crons.interval("radar petits reseaux", { hours: 12 }, ...radar("radarNaming:runNaming"));
crons.interval("radar marche liste", { hours: 6 }, ...radar("radarMarket:runMarketList"));
crons.interval("radar marche campagnes", { minutes: 30 }, ...radar("radarMarket:runMarketReads"));
crons.interval("radar marche jugement", { hours: 1 }, ...radar("radarMarket:runMarketJudge"));
// Fiches des apps, jugements de l'IA (nature des apps, comptes à preuve faible) et leur application, filtre d'entrée.
crons.interval("radar fiches", { minutes: 30 }, ...radar("radarFiche:runFiches"));
crons.interval("radar jugement des apps", { minutes: 30 }, ...radar("radarJudge:runAppNatures"));
crons.interval("radar jugement des comptes", { minutes: 30 }, ...radar("radarJudge:runAccountJudgments"));
crons.interval("radar application des jugements", { minutes: 30 }, ...radar("radarJudge:applyJudgmentsNow"));
crons.interval("radar filtre d entree", { minutes: 5 }, ...radar("radarVet:runVetting"));

export default crons;
