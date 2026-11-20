import { defineConfig } from "vitest/config";

// Les tests du moteur du Radar, déménagés de Jarvia (lib/radar-*.test.ts) avec lui le 20/11/2026 : fonctions pures et
// requêtes réelles sur une base en mémoire qui compte les documents lus (tests/radar/convex-memory-db.ts).
export default defineConfig({ test: { include: ["tests/radar/**/*.test.ts"] } });
