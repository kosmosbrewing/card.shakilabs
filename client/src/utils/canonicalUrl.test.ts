import { describe, expect, it } from "vitest";
import { buildCanonicalUrl, normalizeCanonicalUrl } from "./canonicalUrl";

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

describe("buildCanonicalUrl", () => {
  const origin = "https://shakilabs.com";
  const base = "/card/";

  it("resolves a consolidation target under the app base", () => {
    expect(buildCanonicalUrl("/fuel-card", origin, base)).toBe(
      "https://shakilabs.com/card/fuel-card",
    );
  });

  // 변종이 대표 URL로 접히는지가 이 함수의 존재 이유다.
  it("collapses a variant path onto its family base", () => {
    expect(buildCanonicalUrl("/overseas-payment", origin, base)).toBe(
      "https://shakilabs.com/card/overseas-payment",
    );
  });

  it("drops the trailing slash for the app home", () => {
    expect(buildCanonicalUrl("/", origin, base)).toBe(
      "https://shakilabs.com/card",
    );
  });

  it("tolerates a base without a trailing slash", () => {
    expect(buildCanonicalUrl("/mileage", origin, "/card")).toBe(
      "https://shakilabs.com/card/mileage",
    );
  });
});
