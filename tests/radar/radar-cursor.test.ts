import { describe, expect, it } from "vitest";
import { fromStoredCursor, isBadCursor } from "../../convex/radar/radarCursorMath";

describe("Radar — un curseur rangé illisible fait repartir le parcours du début (20/11/2026)", () => {
  it("reconnaît l'erreur de Convex sur un curseur d'un autre déploiement, et elle seule", () => {
    expect(isBadCursor(new Error("Failed to parse cursor"))).toBe(true);
    expect(isBadCursor(new Error("Uncaught Error: Failed to parse cursor"))).toBe(true);
    expect(isBadCursor(new Error("Too many documents read"))).toBe(false);
    expect(isBadCursor("Failed to parse cursor")).toBe(false);
  });

  it("curseur lisible : la page suit ; illisible : depuis le début ; autre erreur : elle remonte", async () => {
    const seen: (string | null)[] = [];
    const page = async (c: string | null) => {
      seen.push(c);
      if (c === "jarvia") throw new Error("Failed to parse cursor");
      if (c === "panne") throw new Error("Too many documents read");
      return `page@${c}`;
    };
    expect(await fromStoredCursor("bon", page)).toEqual({ result: "page@bon", restarted: false });
    expect(await fromStoredCursor(null, page)).toEqual({ result: "page@null", restarted: false });
    expect(await fromStoredCursor("jarvia", page)).toEqual({ result: "page@null", restarted: true });
    await expect(fromStoredCursor("panne", page)).rejects.toThrow("Too many documents read");
    expect(seen).toEqual(["bon", null, "jarvia", null, "panne"]);
  });
});
