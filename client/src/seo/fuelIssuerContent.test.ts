import { describe, expect, it } from "vitest";
import { buildRichContent } from "../../scripts/prerender-content.mjs";
import { CARD_ISSUERS, MONTHLY_AMOUNTS } from "../../scripts/seo-routes.mjs";
import { ISSUER_SIMULATION_AMOUNTS } from "../../scripts/seo-meta.mjs";
import { LIGHT_CAR_FUEL_REFUND } from "../../scripts/fuel-card-copy.mjs";
import {
  FUEL_CARDS,
  ISSUER_DISPLAY_NAME,
  ISSUER_SLUG_MAP,
  getFuelCardSpendTiers,
  type FuelCard,
} from "@/data/fuelCards";
import { FUEL_PRICES } from "@/data/fuelPrices";
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

// ---------------------------------------------------------------------------
// /fuel-card 가이드와 /fuel-card/monthly/* — 같은 데이터·같은 공식으로 다시 계산해 대조한다.
// ---------------------------------------------------------------------------
const issuerLabelOf = (card: FuelCard) =>
  ISSUER_DISPLAY_NAME[CARD_ISSUERS.find((slug) => ISSUER_SLUG_MAP[slug].includes(card.id))!];
const displayName = (card: FuelCard) =>
  card.name.includes(issuerLabelOf(card)) ? card.name : `${issuerLabelOf(card)} ${card.name}`;
const range = (values: number[]) => `${won(Math.min(...values))}~${won(Math.max(...values))}`;
const netsAt = (spend: number) => FUEL_CARDS.map((card) => gasoline(card, spend).annualNet);
const ranked = (spend: number) =>
  // 엔진 결과가 card를 함께 돌려준다. 동점이면 데이터 순서를 유지한다(안정 정렬).
  FUEL_CARDS.map((card) => gasoline(card, spend)).sort((a, b) => b.annualNet - a.annualNet);

describe("/fuel-card 가이드 = 카드 데이터", () => {
  const html = buildRichContent("/fuel-card") ?? "";
  const text = stripTags(html);

  it("유가는 계산기 데이터 값과 날짜다", () => {
    expect(text).toContain(`${FUEL_PRICES.lastUpdated} Opinet 전국 평균 리터당 ${won(FUEL_PRICES.gasoline)}`);
    expect(text).not.toContain("1,750원");
  });

  it("카드사별 대표 주유카드 문단이 카드마다 데이터 값을 말한다", () => {
    for (const card of FUEL_CARDS) {
      const tiers = getFuelCardSpendTiers(card);
      const brands = card.discount.brandRestriction;
      expect(text).toContain(
        `${displayName(card)}: ${formatDiscountType(card)}, ` +
          `전월 실적 ${tiers.map((tier) => won(tier.minSpend)).join("/")} 이상 시 월 한도 ${tiers.map((tier) => won(tier.monthlyCap)).join("/")}, ` +
          `연회비 ${won(card.annualFee)}${brands.length > 0 ? `, ${brands.join("·")} 주유소만` : ""}.`,
      );
    }
    for (const claim of REMOVED_CLAIMS) expect(text).not.toContain(claim);
  });

  it("카드사 링크 이름이 데이터의 카드명이다", () => {
    for (const slug of CARD_ISSUERS) {
      const label = issuerCards(slug).map(displayName).join("·");
      expect(html).toContain(`<a href="/card/fuel-card/${slug}">${label}</a>`);
    }
  });

  it("경차 유류세 환급 문장이 법령 값(조특법 제111조의2·시행령 제112조의2)이고, 데이터에 없는 조합 예시가 없다", () => {
    // 2026-10-03에 확인한 법령 값(MST 284389·288915). 법이 개정되면 이 값과 fuel-card-copy.mjs를 같이 고친다.
    expect(LIGHT_CAR_FUEL_REFUND).toEqual({
      perLiter: 250,
      annualCap: 300000,
      until: "2026년 12월 31일",
      maxDisplacementCc: 1000,
      checkedAt: "2026-10-03",
    });
    expect(text).toContain(
      `${LIGHT_CAR_FUEL_REFUND.until}까지 휘발유·경유 리터당 ${won(LIGHT_CAR_FUEL_REFUND.perLiter)}을 연 ${won(LIGHT_CAR_FUEL_REFUND.annualCap)} 한도로`,
    );
    expect(text).not.toContain("연 20만원 한도");
    expect(text).not.toContain("지자체 경차");
    expect(text).not.toContain("엔크린 할인을 중복");
    expect(text).not.toContain("현대카드 O + SK엔크린");
  });

  it("절약액 범위가 계산기 엔진 값이다", () => {
    expect(text).toContain(`월 30만원을 주유하면 카드 ${FUEL_CARDS.length}장의 연회비를 뺀 연간 절약액은 ${range(netsAt(300000))}입니다.`);
    expect(text).toContain(`월 10만원 주유 시 ${range(netsAt(100000))}, 월 20만원 ${range(netsAt(200000))}, 월 30만원 ${range(netsAt(300000))}, 월 50만원 ${range(netsAt(500000))}입니다.`);
    const yearly = FUEL_CARDS.map((card) => gasoline(card, 100000).annualNet + card.annualFee);
    expect(text).toContain(`연간 할인은 ${range(yearly)}이고, 연회비를 빼면 ${range(netsAt(100000))}이 남습니다`);
  });
});

describe.each(MONTHLY_AMOUNTS)("/fuel-card/monthly/%s = 카드 데이터", (amount) => {
  const html = buildRichContent(`/fuel-card/monthly/${amount}`) ?? "";
  const text = stripTags(html);
  const rows = ranked(amount);
  const label = amount.toLocaleString("ko-KR");

  it("카드사별 예상 절약액 표: 6장 전부를 계산기 엔진으로 계산해 절약액 순으로 싣는다", () => {
    const cells = rowCells(tableHtml(html, "data-monthly-savings"), "data-card-id");
    expect([...cells.keys()]).toEqual(rows.map((row) => row.card.id));
    for (const row of rows) {
      const brands = row.card.discount.brandRestriction;
      expect(cells.get(row.card.id)).toEqual([
        issuerLabelOf(row.card),
        row.card.name,
        `${formatDiscountType(row.card)}${brands.length > 0 ? ` · ${brands.join("·")} 주유소만` : ""}`,
        `${won(row.monthlyDiscount)}${row.isCapExceeded ? " (한도)" : ""}`,
        won(row.annualNet),
      ]);
    }
  });

  it("1위·최하위·순위 문장이 표와 같다", () => {
    const best = rows[0];
    const worst = rows[rows.length - 1];
    expect(text).toContain(`1위는 ${displayName(best.card)} (연 ${won(best.annualNet)} )이고`);
    expect(text).toContain(`최하위는 ${displayName(worst.card)}(연 ${won(worst.annualNet)})입니다.`);
    expect(text).toContain(
      `순위는 ${rows.slice(0, 3).map((row, index) => `${index + 1}위 ${displayName(row.card)}(연 ${won(row.annualNet)})`).join(", ")}입니다.`,
    );
  });

  it("실적 조건 답이 데이터의 최저 구간으로 센 값이다", () => {
    const minSpends = FUEL_CARDS.map((card) => getFuelCardSpendTiers(card)[0].minSpend);
    const met = minSpends.filter((minSpend) => amount >= minSpend).length;
    expect(text).toContain(`최저 구간 ${range(minSpends)}입니다.`);
    if (met < FUEL_CARDS.length) {
      expect(text).toContain(`주유비 ${label}원만으로 최저 조건을 채우는 카드는 ${FUEL_CARDS.length}장 중 ${met}장이므로`);
    }
  });

  it("가정한 평균 할인율이나 데이터에 없는 카드를 말하지 않는다", () => {
    expect(text).not.toContain("평균 정률 할인 5%");
    for (const claim of REMOVED_CLAIMS) expect(text).not.toContain(claim);
  });
});
