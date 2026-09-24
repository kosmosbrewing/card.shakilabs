import { describe, expect, it } from "vitest";
import { SEO_ROUTES } from "../../scripts/seo-routes.mjs";
import { PROSE_SHELL_ROUTES } from "../../scripts/prose-routes.mjs";
import { guidePlacementFor } from "./guideRoutes";

// 첫 페인트(원시 HTML)와 수화 후 화면이 같은 폭 래퍼를 써야 레이아웃 시프트가 없다.
// 프리렌더는 PROSE_SHELL_ROUTES로, 화면은 guidePlacementFor === "before"로 판단하므로
// 두 목록이 어긋나는 순간 그 라우트만 첫 페인트 920 → 수화 후 672로 좁아진다.
// 프리렌더되는 라우트 전수를 분모로 써서 양방향으로 비교한다.
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
