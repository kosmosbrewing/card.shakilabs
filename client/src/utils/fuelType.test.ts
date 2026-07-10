import { describe, expect, it } from "vitest";
import { normalizeFuelType } from "./fuelType";

describe("normalizeFuelType", () => {
  it.each(["gasoline", "diesel", "lpg"] as const)("preserves %s", (fuelType) => {
    expect(normalizeFuelType(fuelType)).toBe(fuelType);
  });

  it("falls back to gasoline for an unsupported route value", () => {
    expect(normalizeFuelType("unknown")).toBe("gasoline");
  });
});
