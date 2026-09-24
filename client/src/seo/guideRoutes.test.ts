import { describe, expect, it } from "vitest";
import { SEO_ROUTES } from "../../scripts/seo-routes.mjs";
import { PROSE_SHELL_ROUTES } from "../../scripts/prose-routes.mjs";
import { guidePlacementFor } from "./guideRoutes";

// 가이드를 뷰보다 위에 두는 라우트 목록(PROSE_SHELL_ROUTES)과 화면의 배치 판단
// (guidePlacementFor === "before")이 같아야 한다. 폭은 0.3.35부터 전 라우트가 같은 셸이라
// 이 목록과 무관하다. 프리렌더되는 라우트 전수를 분모로 써서 양방향으로 비교한다.
describe("prose shell route parity", () => {
  const guideFirst = (SEO_ROUTES as string[]).filter(
    (route) => guidePlacementFor(route) === "before",
  );

  it("covers every guide-first route, and nothing else", () => {
    expect([...guideFirst].sort()).toEqual([...PROSE_SHELL_ROUTES].sort());
  });

  it("leaves tool guides alone", () => {
    expect(guidePlacementFor("/fuel-card")).toBe("after");
    expect(guidePlacementFor("/annual-fee")).toBe("after");
    expect(guidePlacementFor("/customs")).toBe("after");
    for (const route of PROSE_SHELL_ROUTES) {
      expect(guidePlacementFor(route)).not.toBe("after");
    }
  });
});
