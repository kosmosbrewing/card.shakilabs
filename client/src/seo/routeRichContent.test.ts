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

  // v8 결함: /about의 h1이 28px/400 Pretendard(다른 정적 섹션과 같은 상수)였다.
  // 다른 카드 도구 페이지 h1(CalculatorPageHeader.vue)과 같은 20px/700 GmarketSans
  // 클래스를 reuse했는지 확인한다. 역방향: 클래스를 되돌리면 이 테스트가 실패한다.
  it("renders the /about H1 with the fleet heading style, not the plain prose H1", () => {
    const html = richContentFor("/about");
    expect(html).toMatch(/<h1[^>]*class="[^"]*\btext-h1\b[^"]*\bfont-brand\b[^"]*"[^>]*>서비스 소개/);
  });

  // v8 결함: "데이터 출처와 신뢰성" 섹션이 528자 문단 하나라 /about 첫 화면을 다 채웠다.
  // 역방향: 3소제목(출처/갱신일/한계)을 되돌려 원래의 긴 단일 문단으로 합치면
  // 아래 어느 <p>든 250자를 넘어 이 테스트가 실패한다.
  it("keeps every rendered paragraph on /about within the 250-char readability cap", () => {
    const html = richContentFor("/about");
    const paragraphs = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map(([, inner]) =>
      inner.replace(/<[^>]+>/g, "").replace(/&[a-z]+;/gi, " "),
    );
    expect(paragraphs.length).toBeGreaterThan(0);
    for (const paragraph of paragraphs) {
      expect(paragraph.length, paragraph.slice(0, 40)).toBeLessThanOrEqual(250);
    }
  });
});
