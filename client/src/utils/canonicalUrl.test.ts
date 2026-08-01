import { describe, expect, it } from "vitest";
import { normalizeCanonicalUrl } from "./canonicalUrl";

describe("normalizeCanonicalUrl", () => {
  it("drops the trailing slash the router base adds to the app home", () => {
    expect(normalizeCanonicalUrl("https://shakilabs.com/card/")).toBe(
      "https://shakilabs.com/card",
    );
  });

  it("keeps slash-free paths untouched", () => {
    expect(normalizeCanonicalUrl("https://shakilabs.com/card/fuel-card")).toBe(
      "https://shakilabs.com/card/fuel-card",
    );
  });

  it("strips query and hash", () => {
    expect(
      normalizeCanonicalUrl("https://shakilabs.com/card/mileage?a=1#result"),
    ).toBe("https://shakilabs.com/card/mileage");
  });

  it("preserves the domain root slash", () => {
    expect(normalizeCanonicalUrl("https://shakilabs.com/")).toBe(
      "https://shakilabs.com/",
    );
  });
});
