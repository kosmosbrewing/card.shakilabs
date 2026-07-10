import { describe, expect, it } from "vitest";
import {
  buildPublicPagePath,
  getPageGroup,
  shouldTrackPageView,
} from "@/utils/pageTracking";

describe("pageTracking", () => {
  it("base path를 붙이고 쿼리와 입력값을 제거한다", () => {
    expect(buildPublicPagePath("/card", "/mileage?miles=80000")).toBe(
      "/card/mileage",
    );
    expect(buildPublicPagePath("/card", "/fuel-card/monthly/300000")).toBe(
      "/card/fuel-card/monthly",
    );
  });

  it("첫 진입과 계산기 변경만 페이지뷰로 집계한다", () => {
    expect(getPageGroup("/mileage?miles=80000")).toBe("mileage");
    expect(shouldTrackPageView("/mileage", "/", false)).toBe(true);
    expect(shouldTrackPageView("/mileage?miles=80000", "/mileage", true)).toBe(false);
    expect(shouldTrackPageView("/annual-fee", "/mileage", true)).toBe(true);
  });
});
