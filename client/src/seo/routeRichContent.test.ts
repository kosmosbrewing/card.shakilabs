import { describe, expect, it } from "vitest";
import { SEO_ROUTES } from "../../scripts/seo-routes.mjs";
import { guidePlacementFor, richContentFor } from "./routeRichContent";

describe("route rich content", () => {
  // 프리렌더 본문은 마운트 때 DOM에서 제거된다. 대체 렌더가 없는 라우트가 하나라도
  // 생기면 그 페이지는 크롤러에게만 본문을 보여준 것이 된다.
  // 예전에는 "화면이 이미 커버한다"는 면제 목록이 있었고, 그 목록이 곧 결함이었다
  // (근거는 seo/guideRoutes.ts 주석). 면제는 더 이상 없다.
  it("renders a guide in the app for every prerendered route", () => {
    const unguided = SEO_ROUTES.filter(
      (route: string) => guidePlacementFor(route) === "none",
    );
    expect(unguided).toEqual([]);
  });

  it("returns body copy for every prerendered route", () => {
    expect(SEO_ROUTES.length).toBeGreaterThan(0);
    for (const route of SEO_ROUTES) {
      expect(richContentFor(route).length, route).toBeGreaterThan(500);
    }
  });

  // 홈과 허브만 부분 렌더다 — 뷰가 히어로·표를 이미 그리므로 나머지 블록만 넘긴다.
  // 나머지 라우트는 프리렌더 본문 전체를 그대로 되돌려준다.
  it("hands the home and the hub only the blocks their views do not draw", () => {
    expect(richContentFor("/")).not.toMatch(/카드 혜택, 발급 전에 숫자로 확인하세요/);
    expect(richContentFor("/all")).toMatch(/어떤 계산기부터 열어야 하나요/);
    expect(richContentFor("/all")).not.toMatch(/각 계산기가 비교하는 카드/);
  });

  it("keeps a single H1 on calculator routes and keeps it on policy pages", () => {
    // 계산기 화면에는 이미 h1(계산기 이름)이 있으므로 가이드 제목은 h2로 내린다.
    expect(richContentFor("/customs")).not.toMatch(/<h1[\s>]/i);
    expect(richContentFor("/customs")).toMatch(/<h2[^>]*>해외직구 관세/);
    expect(richContentFor("/fuel-card")).not.toMatch(/<h1[\s>]/i);
    // 정책 페이지는 가이드가 곧 페이지 본문이라 h1을 유지한다.
    expect(richContentFor("/terms")).toMatch(/<h1[^>]*>이용약관<\/h1>/);
  });
});
