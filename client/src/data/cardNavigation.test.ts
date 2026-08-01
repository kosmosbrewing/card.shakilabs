import { describe, expect, it } from "vitest";
import { CARD_HOME_ENTRIES, CARD_TOOL_GROUPS } from "./cardNavigation";

describe("card navigation", () => {
  it("groups every primary card tool exactly once", () => {
    const paths = CARD_TOOL_GROUPS.flatMap((group) => group.tools.map((tool) => tool.path));

    expect(paths).toHaveLength(10);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("points every home entry at a real tool route", () => {
    const paths = new Set(
      CARD_TOOL_GROUPS.flatMap((group) => group.tools.map((tool) => tool.path)),
    );
    const entryPaths = CARD_HOME_ENTRIES.map((entry) => entry.path);

    expect(entryPaths.length).toBeGreaterThan(0);
    expect(new Set(entryPaths).size).toBe(entryPaths.length);
    for (const path of entryPaths) {
      expect(paths.has(path)).toBe(true);
    }
  });
});
