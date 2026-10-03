import { describe, expect, it } from "vitest";
import { buildRichContent } from "../../scripts/prerender-content.mjs";
import { CARD_ISSUERS } from "../../scripts/seo-routes.mjs";
import { ISSUER_SIMULATION_AMOUNTS } from "../../scripts/seo-meta.mjs";
import {
  FUEL_CARDS,
  ISSUER_SLUG_MAP,
  getFuelCardSpendTiers,
  type FuelCard,
} from "@/data/fuelCards";
import { calculateCardSavings, formatDiscountType } from "@/utils/calculator";

// /fuel-card/<issuer> 본문의 주장 = fuelCards.ts 데이터·calculator.ts 엔진.
// 기대값은 프리렌더 쪽 미러(card-data-mirror.mjs)가 아니라 TS 원본에서 다시 계산한다 —
// 미러만 고치거나 원본만 고치면 이 시험이 깨진다(데이터 필드 하나를 바꿔 실패를 확인했다).
// 숫자 형식도 프리렌더의 formatWon이 아니라 toLocaleString으로 따로 만든다.
const won = (value: number) => `${value.toLocaleString("ko-KR")}원`;
const REMOVED_CLAIMS = ["taptap", "LOCA", "LIKIT", "1Q 카드", "SK에너지·GS칼텍스", "주유 5% 할인", "주유·대중교통 7%"];

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function rowCells(tableHtml: string, rowAttr: string): Map<string, string[]> {
  const rows = new Map<string, string[]>();
  const pattern = new RegExp(`<tr ${rowAttr}="([^"]+)">([\\s\\S]*?)</tr>`, "g");
  for (const [, key, inner] of tableHtml.matchAll(pattern)) {
    rows.set(key, [...inner.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map(([, cell]) => stripTags(cell)));
  }
  return rows;
}

function tableHtml(html: string, marker: string): string {
  const match = html.match(new RegExp(`<table ${marker}[^>]*>([\\s\\S]*?)</table>`));
  expect(match, marker).not.toBeNull();
  return match![1];
}

const gasoline = (card: FuelCard, monthlySpend: number) =>
  calculateCardSavings(card, { fuelType: "gasoline", monthlySpend, preferredBrand: "all" });

const issuerCards = (slug: string) => FUEL_CARDS.filter((card) => ISSUER_SLUG_MAP[slug].includes(card.id));

describe.each(CARD_ISSUERS)("/fuel-card/%s 본문 = 카드 데이터", (slug) => {
  const html = buildRichContent(`/fuel-card/${slug}`) ?? "";
  const article = html.match(/<article data-seo-prerender="fuel-card-issuer"[\s\S]*?<\/article>/)?.[0] ?? "";
  const text = stripTags(article);
  const cards = issuerCards(slug);

  it("조건표: 카드명·할인 방식·전월 실적·월 한도·연회비·주유소 제한이 데이터 값이다", () => {
    const rows = rowCells(tableHtml(article, "data-issuer-terms"), "data-card-id");
    expect([...rows.keys()]).toEqual(cards.map((card) => card.id));
    for (const card of cards) {
      const tiers = getFuelCardSpendTiers(card);
      const brands = card.discount.brandRestriction;
      expect(rows.get(card.id)).toEqual([
        card.name,
        formatDiscountType(card),
        tiers.map((tier) => `${won(tier.minSpend)} 이상`).join(" / "),
        tiers.map((tier) => won(tier.monthlyCap)).join(" / "),
        won(card.annualFee),
        ...(brands.length > 0 ? [`${brands.join("·")} 주유소만`] : []),
      ]);
    }
  });

  it("절약액 표: 화면과 같은 5개 구간을 계산기 엔진으로 다시 계산한 값이다", () => {
    for (const card of cards) {
      const rows = rowCells(tableHtml(article, `data-issuer-savings="${card.id}"`), "data-spend");
      expect([...rows.keys()].map(Number)).toEqual([...ISSUER_SIMULATION_AMOUNTS]);
      for (const amount of ISSUER_SIMULATION_AMOUNTS) {
        const result = gasoline(card, amount);
        expect(rows.get(String(amount))).toEqual([
          `${amount / 10000}만원`,
          `${won(result.monthlyDiscount)}${result.isCapExceeded ? " (한도)" : ""}`,
          `${Number(((result.monthlyDiscount / amount) * 100).toFixed(1))}%`,
          won(result.annualNet),
        ]);
      }
    }
  });

  it("본문 문장의 숫자도 데이터·엔진 값이다", () => {
    for (const card of cards) {
      const tiers = getFuelCardSpendTiers(card);
      expect(text).toContain(`${card.name} 의 할인 방식은 ${formatDiscountType(card)}이고 연회비는 ${won(card.annualFee)}입니다.`);
      if (tiers.length === 1) {
        expect(text).toContain(`전월 실적 ${won(tiers[0].minSpend)} 이상일 때 월 ${won(tiers[0].monthlyCap)}까지 할인됩니다.`);
      }
      const reference = gasoline(card, 200000);
      expect(text).toContain(`월 할인은 ${won(reference.monthlyDiscount)}입니다.`);
      expect(text).toContain(`1년 할인 ${won(reference.annualNet + card.annualFee)}에서 연회비 ${won(card.annualFee)}을 빼면 연 ${won(reference.annualNet)}이 남습니다.`);
    }
  });

  it("손익분기 주유비: 그 금액부터 연회비를 넘고, 1,000원 아래에서는 넘지 못한다", () => {
    const spend = Number(text.match(/월 주유비가 ([\d,]+)원 이상이면/)?.[1].replace(/,/g, ""));
    expect(spend).toBeGreaterThan(0);
    expect(gasoline(cards[0], spend).annualNet).toBeGreaterThanOrEqual(0);
    expect(gasoline(cards[0], spend - 1000).annualNet).toBeLessThan(0);
  });

  it("데이터에 없는 카드·혜택·주유소 제한을 말하지 않는다", () => {
    for (const claim of REMOVED_CLAIMS) expect(text).not.toContain(claim);
    for (const card of cards) {
      const brands = card.discount.brandRestriction;
      if (brands.length === 0) {
        expect(text).not.toContain("주유소에서만");
        expect(text).not.toContain("주유소만");
      } else {
        expect(text).toContain(`할인은 ${brands.join("·")} 주유소에서만 적용됩니다.`);
      }
    }
  });

  it("다른 카드사 목록의 카드명·할인 방식·연 절약액이 데이터 값이다", () => {
    for (const other of CARD_ISSUERS.filter((candidate) => candidate !== slug)) {
      for (const card of issuerCards(other)) {
        expect(text).toContain(
          `${card.name}, ${formatDiscountType(card)}, 월 20만원 주유 시 연 ${won(gasoline(card, 200000).annualNet)}`,
        );
      }
    }
  });

  it("체크리스트의 범위가 주유카드 전체 데이터의 최저·최고값이다", () => {
    const minSpends = FUEL_CARDS.map((card) => getFuelCardSpendTiers(card)[0].minSpend);
    const caps = FUEL_CARDS.flatMap((card) => getFuelCardSpendTiers(card).map((tier) => tier.monthlyCap));
    expect(text).toContain(
      `주유카드 ${FUEL_CARDS.length}장은 최저 구간 ${won(Math.min(...minSpends))}~${won(Math.max(...minSpends))}`,
    );
    expect(text).toContain(`${FUEL_CARDS.length}장 기준 ${won(Math.min(...caps))}~${won(Math.max(...caps))}`);
  });
});
