import { describe, expect, it } from "vitest";
import { SEO_ROUTES } from "../../scripts/seo-routes.mjs";
import { guidePlacementFor, richContentFor } from "./routeRichContent";

// 화면이 이미 프리렌더만큼 렌더해서 가이드를 다시 넣지 않는 라우트.
// 근거 수치는 seo/guideRoutes.ts 주석의 실측표에 있다.
const SELF_SUFFICIENT_ROUTES = new Set([
  "/all",
  "/fuel-card",
  "/overseas-payment",
  "/min-spend",
  "/annual-fee",
  "/mileage",
  ...["usd", "eur", "jpy", "gbp", "cny", "thb", "vnd"].map((c) => `/overseas-payment/${c}`),
]);

describe("route rich content", () => {
  it("classifies every prerendered route as guided or self-sufficient", () => {
    // 새 라우트가 아무 판단 없이 끼어드는 것을 막는다. 프리렌더에만 본문이 있고
    // 화면에는 없는 라우트가 하나라도 생기면 그게 곧 은닉 텍스트다.
    const unclassified = SEO_ROUTES.filter(
      (route: string) =>
        guidePlacementFor(route) === "none" && !SELF_SUFFICIENT_ROUTES.has(route),
    );
    expect(unclassified).toEqual([]);
  });

  it("returns body copy for every guided route", () => {
    const guided = SEO_ROUTES.filter((route: string) => guidePlacementFor(route) !== "none");

    expect(guided.length).toBeGreaterThan(0);
    for (const route of guided) {
      expect(richContentFor(route).length, route).toBeGreaterThan(500);
    }
  });

  it("returns nothing for self-sufficient routes", () => {
    for (const route of SELF_SUFFICIENT_ROUTES) {
      expect(richContentFor(route), route).toBe("");
    }
  });

  it("keeps a single H1 on calculator routes and keeps it on policy pages", () => {
    // 계산기 화면에는 이미 h1(계산기 이름)이 있으므로 가이드 제목은 h2로 내린다.
    expect(richContentFor("/customs")).not.toMatch(/<h1[\s>]/i);
    expect(richContentFor("/customs")).toMatch(/<h2[^>]*>해외직구 관세/);
    // 정책 페이지는 가이드가 곧 페이지 본문이라 h1을 유지한다.
    expect(richContentFor("/terms")).toMatch(/<h1[^>]*>이용약관<\/h1>/);
  });
});
