import { describe, expect, it } from "vitest";
import {
  APP_NAME,
  FUEL_ISSUERS,
  ISSUER_SIMULATION_AMOUNTS,
  MILEAGE_DESCRIPTION,
  fuelIssuerDescription,
  normalizeTitle,
  pageTitleFor,
} from "../../scripts/seo-meta.mjs";
import { CARD_ISSUERS, SEO_ROUTES } from "../../scripts/seo-routes.mjs";
import { FUEL_CARDS, ISSUER_DISPLAY_NAME, ISSUER_SLUG_MAP } from "@/data/fuelCards";
import { AIRLINES, MILEAGE_DATA, SEAT_CLASS_LABELS } from "@/data/mileageData";

// 제목 레시피(2026-10 네이버 CTR): 네이버는 약 35자에서 제목을 자른다. 페이지 제목 40자 상한과
// 단일 " | ShakiLabs" 접미사는 그 절단 안에 핵심 구절과 브랜드를 남기기 위한 것이다.
const PAGE_TITLE_MAX = 40;
const BRAND_SUFFIX = " | ShakiLabs";
// 앱 이름을 남기는 사이트 공통 페이지 — 빼면 12개 앱이 같은 "이용약관 | ShakiLabs"를 갖는다.
const SITE_PAGES = ["/all", "/about", "/terms", "/privacy", "/404"];
// 페이지가 하지 않는 일을 제목이 약속하지 않게 한다.
const FALSE_PROMISES = ["최저가", "추천", "실시간", "효능"];

const ALL_ROUTES = [...SEO_ROUTES, "/404"];
const length = (value: string) => [...value].length;

describe("normalizeTitle", () => {
  it("붙이는 접미사는 브랜드 하나뿐이다", () => {
    expect(normalizeTitle("마일리지 가치 계산기")).toBe("마일리지 가치 계산기 | ShakiLabs");
  });

  it("옛 레시피의 앱 이름 접미사를 벗겨 새 레시피로 접는다", () => {
    expect(normalizeTitle("이용약관 | 카드 계산기 | ShakiLabs")).toBe("이용약관 | ShakiLabs");
    expect(normalizeTitle("연회비 회수 계산기 | 카드 계산기")).toBe("연회비 회수 계산기 | ShakiLabs");
    expect(normalizeTitle("페이지를 찾을 수 없습니다 | Car Tools")).toBe(
      "페이지를 찾을 수 없습니다 | ShakiLabs",
    );
  });

  it("페이지명 안의 pipe는 중점으로 바꿔 구분자를 하나만 남긴다", () => {
    expect(normalizeTitle("포인트 전환 비교 | 가치 계산")).toBe("포인트 전환 비교 · 가치 계산 | ShakiLabs");
  });

  it("빈 제목은 앱 이름으로 떨어진다", () => {
    expect(normalizeTitle("  ")).toBe(`${APP_NAME} | ShakiLabs`);
  });
});

describe("페이지 제목 레시피 (프리렌더·화면 공통 출처)", () => {
  it.each(ALL_ROUTES)("%s: 페이지 제목 40자 이하, 접미사는 ' | ShakiLabs' 하나", (route) => {
    const title = pageTitleFor(route);
    expect(title, route).toBeTruthy();
    expect(length(title!)).toBeLessThanOrEqual(PAGE_TITLE_MAX);

    const full = normalizeTitle(title!);
    expect(full.endsWith(BRAND_SUFFIX)).toBe(true);
    expect(full.split(" | ")).toHaveLength(2);
    for (const word of FALSE_PROMISES) expect(full).not.toContain(word);
  });

  it("홈은 앱 이름, 사이트 공통 페이지는 '· 앱 이름', 계산기는 앱 이름 없이", () => {
    expect(normalizeTitle(pageTitleFor("/")!)).toBe(`${APP_NAME} | ShakiLabs`);
    for (const route of ALL_ROUTES) {
      const title = pageTitleFor(route)!;
      if (route === "/") continue;
      if (SITE_PAGES.includes(route)) {
        expect(title.endsWith(` · ${APP_NAME}`), route).toBe(true);
      } else {
        expect(title, route).not.toContain(APP_NAME);
      }
    }
  });

  it("라우트마다 제목이 다르다", () => {
    const titles = ALL_ROUTES.map((route) => pageTitleFor(route));
    expect(new Set(titles).size).toBe(titles.length);
  });

  it("라우터가 허용하지 않는 경로에는 제목을 지어내지 않는다", () => {
    expect(pageTitleFor("/fuel-card/constructor")).toBeUndefined();
    expect(pageTitleFor("/overseas-payment/twd")).toBeUndefined();
  });
});

describe("재작성한 제목·설명의 주장 = 데이터", () => {
  it("카드사 변형 6개가 카드사 데이터(fuelCards.ts)와 같은 이름·카드를 말한다", () => {
    expect(Object.keys(FUEL_ISSUERS)).toEqual(CARD_ISSUERS);
    for (const slug of CARD_ISSUERS) {
      const cards = FUEL_CARDS.filter((card) => ISSUER_SLUG_MAP[slug].includes(card.id));
      expect(FUEL_ISSUERS[slug]).toEqual({
        label: ISSUER_DISPLAY_NAME[slug],
        cardIds: ISSUER_SLUG_MAP[slug],
        cards: cards.map((card) => card.name),
      });
      expect(pageTitleFor(`/fuel-card/${slug}`)).toBe(
        `${ISSUER_DISPLAY_NAME[slug]} 주유 할인카드 비교 · 월 주유비별 연간 절약액`,
      );
      // 검색 구절("<카드사> 주유 할인카드")이 앞 28자 안에 온다.
      expect(pageTitleFor(`/fuel-card/${slug}`)!.indexOf("주유 할인카드")).toBeLessThan(28);
    }
  });

  it("카드사 설명의 구간 수·범위가 화면 표 행(ISSUER_SIMULATION_AMOUNTS)과 같다", () => {
    const first = ISSUER_SIMULATION_AMOUNTS[0] / 10000;
    const last = ISSUER_SIMULATION_AMOUNTS[ISSUER_SIMULATION_AMOUNTS.length - 1] / 10000;
    for (const slug of CARD_ISSUERS) {
      expect(fuelIssuerDescription(slug)).toContain(
        `${first}만~${last}만원 ${ISSUER_SIMULATION_AMOUNTS.length}개 구간`,
      );
    }
  });

  it("/mileage 제목·설명의 항공사·좌석·노선 수가 mileageData.ts와 같다", () => {
    const airlines = AIRLINES.map((airline) => airline.name);
    expect(airlines).toEqual(["대한항공", "아시아나항공"]);
    const title = pageTitleFor("/mileage")!;
    expect(title).toContain("대한항공");
    expect(title).toContain("아시아나");
    expect(title.startsWith("마일리지 1마일 가치")).toBe(true);

    const seatClasses = Object.keys(SEAT_CLASS_LABELS).length;
    for (const data of MILEAGE_DATA) {
      expect(data.redemptions).toHaveLength(data.routes.length * seatClasses);
    }
    const routes = MILEAGE_DATA[0].routes.length;
    const cells = MILEAGE_DATA.reduce((total, data) => total + data.redemptions.length, 0);
    expect(MILEAGE_DESCRIPTION).toContain(
      `공제표 ${cells}칸(항공사 ${airlines.length}곳 × 노선 ${routes}개 × 좌석 ${seatClasses}등급)`,
    );
  });
});
