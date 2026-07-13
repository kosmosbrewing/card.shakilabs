import { describe, expect, it } from "vitest";
import { CARD_TOOL_GROUPS } from "./cardNavigation";

describe("card navigation", () => {
  it("groups every primary card tool exactly once", () => {
    const paths = CARD_TOOL_GROUPS.flatMap((group) => group.tools.map((tool) => tool.path));

    expect(paths).toHaveLength(10);
    expect(new Set(paths).size).toBe(paths.length);
  });
});
