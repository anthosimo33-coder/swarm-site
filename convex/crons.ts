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

export default crons;
