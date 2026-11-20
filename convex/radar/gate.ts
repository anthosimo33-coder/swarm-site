import { makeFunctionReference } from "convex/server";
import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import { backgroundOff } from "../background";

/**
 * L'interrupteur du Radar dans Kopycat (déménagé de Jarvia le 20/11/2026). Ses tâches planifiées (convex/crons.ts)
 * passent toutes par `tick`, qui ne lance rien tant que la variable RADAR_ON du déploiement n'est pas « 1 » : on
 * l'allume sur la prod une fois les données copiées de Jarvia et ses tâches à lui arrêtées (deux Radars ne doivent
 * jamais relever les mêmes comptes). Jamais sur le dev, où SWARM_SYNC_OFF coupe tout le travail de fond.
 */
export const radarOn = (): boolean => process.env.RADAR_ON === "1" && !backgroundOff();

/** Lance la fonction `fn` (« radar/radarNetworks:runAccountReads ») si le Radar est allumé. */
export const tick = internalMutation({
  args: { fn: v.string() },
  handler: async (ctx, { fn }): Promise<boolean> => {
    if (!radarOn()) return false;
    await ctx.scheduler.runAfter(0, makeFunctionReference<"action">(fn), {});
    return true;
  },
});
