import { ConvexError, v } from "convex/values";
import { internalQuery } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { EXPORT_MAX_APPS, TABLES, exportPage } from "./swarmExportPage";

/**
 * L'export du Radar, lu sur place (déménagé de Jarvia le 20/11/2026). Jusque-là, la synchro de Kopycat (radarSync) le
 * lisait chez Jarvia, page par page, sur HTTP (/swarm/export) ; avec RADAR_LOCAL=1, elle lit ici les mêmes pages, aux
 * mêmes lignes : les tables du Radar sont désormais dans ce déploiement.
 */
export const page = internalQuery({
  args: { table: v.union(...TABLES.map((t) => v.literal(t))), cursor: v.union(v.string(), v.null()), apps: v.optional(v.array(v.string())) },
  handler: (ctx, { table, cursor, apps }) => {
    if (apps && apps.length > EXPORT_MAX_APPS) throw new ConvexError({ code: "EXPORT_TOO_MANY_APPS", message: `${EXPORT_MAX_APPS} apps au plus par page.` });
    const ids = apps?.map((a): Id<"radarApps"> => {
      const id = ctx.db.normalizeId("radarApps", a);
      if (!id) throw new ConvexError({ code: "EXPORT_BAD_APP", message: `« ${a.slice(0, 40)} » n'est pas l'id d'une app du Radar.` });
      return id;
    });
    return exportPage(ctx, table, cursor, ids);
  },
});
