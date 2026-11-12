import { authTables } from "@convex-dev/auth/server";
import { defineSchema } from "convex/server";

// Pour l'instant, Swarm ne stocke que les comptes (tables de Convex Auth).
export default defineSchema({
  ...authTables,
});
