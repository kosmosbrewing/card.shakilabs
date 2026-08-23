import { describe, expect, it } from "vitest";
// 프리렌더용 손복사 사본. .mjs라 타입 소스를 import할 수 없어 숫자를 적어 둔 파일이다.
import {
  CAP_BINDS_UNDER_200K as MIRRORED_CAP_BINDS_UNDER_200K,
  CAP_THRESHOLDS as MIRRORED_CAP_THRESHOLDS,
  DATA_SCOPE_ROWS as MIRRORED_DATA_SCOPE_ROWS,
  formatWon,
} from "../../scripts/card-data-derived.mjs";
import { ANNUAL_FEE_CARDS } from "./annualFeeCards";
import {
  CAP_BINDS_UNDER_200K,
  CARD_CAP_THRESHOLDS,
  CARD_DATA_SCOPE,
} from "./cardDataScope";
import { FUEL_CARDS } from "./fuelCards";
import { OVERSEAS_CARDS } from "./overseasCards";

// 홈과 /all 본문은 "카드 데이터에서 뽑은 숫자"라고 말한다. 그 주장이 참이려면
// 원본 배열을 고친 순간 본문도 같이 바뀌어야 한다. 프리렌더는 .mjs라 타입 소스를
// import할 수 없으니 숫자를 복사할 수밖에 없고, 그 복사본이 원본과 어긋나는 순간
// 페이지는 계산기와 다른 값을 주장하게 된다 — 여기서 그걸 막는다.
describe("card data derived facts", () => {
  it("mirrors the computed scope table into the prerender copy", () => {
    expect(MIRRORED_DATA_SCOPE_ROWS).toEqual(CARD_DATA_SCOPE);
  });

  it("mirrors the computed cap thresholds into the prerender copy", () => {
    expect(MIRRORED_CAP_THRESHOLDS).toEqual(CARD_CAP_THRESHOLDS);
    expect(MIRRORED_CAP_BINDS_UNDER_200K).toBe(CAP_BINDS_UNDER_200K);
  });

  // 사본 대조만으로는 "둘 다 똑같이 틀린" 경우를 못 잡는다. 계산 자체가 카드 배열과
  // 맞는지 여기서 따로 확인한다.
  it("derives every cap threshold from the real card array", () => {
    expect(CARD_CAP_THRESHOLDS).toHaveLength(ANNUAL_FEE_CARDS.length);

    for (const row of CARD_CAP_THRESHOLDS) {
      const card = ANNUAL_FEE_CARDS.find(
        (item) => `${item.issuer} ${item.name}` === row.card,
      );
      expect(card, `unknown card in the derived table: ${row.card}`).toBeDefined();

      const topRate = Math.max(...card!.benefitRates.map((rate) => rate.rate));
      const top = card!.benefitRates.find((rate) => rate.rate === topRate)!;
      expect(Number(row.rate)).toBeCloseTo(topRate * 100, 6);
      expect(row.monthlyCap).toBe(top.monthlyCap);
      expect(row.capAtSpend).toBe(Math.round(top.monthlyCap / top.rate));
    }
  });

  it("sorts the cap thresholds by the spend at which the cap binds", () => {
    const spends = CARD_CAP_THRESHOLDS.map((row) => row.capAtSpend);
    expect([...spends].sort((a, b) => a - b)).toEqual(spends);
    expect(CAP_BINDS_UNDER_200K).toBe(spends.filter((spend) => spend <= 200000).length);
  });

  it("counts the cards each calculator actually compares", () => {
    const counts = Object.fromEntries(
      CARD_DATA_SCOPE.map((row) => [row.path, row.count]),
    );

    expect(counts["/fuel-card"]).toBe(FUEL_CARDS.length);
    expect(counts["/overseas-payment"]).toBe(OVERSEAS_CARDS.length);
    expect(counts["/annual-fee"]).toBe(ANNUAL_FEE_CARDS.length);
  });

  // 본문이 인용하는 금액은 실제 카드 조건의 최소·최대여야 한다. 문장에 그 값이
  // 글자로 박히므로, 범위가 바뀌면 문장에서도 사라진다.
  it("quotes the real min/max conditions in the scope sentences", () => {
    const fuel = CARD_DATA_SCOPE.find((row) => row.path === "/fuel-card")!;
    const fees = FUEL_CARDS.map((card) => card.annualFee);

    expect(fuel.detail).toContain(
      `연회비 ${formatWon(Math.min(...fees))}~${formatWon(Math.max(...fees))}원`,
    );

    const annual = CARD_DATA_SCOPE.find((row) => row.path === "/annual-fee")!;
    const minSpends = ANNUAL_FEE_CARDS.map((card) => card.minSpend);
    expect(annual.detail).toContain(
      `전월 실적 ${formatWon(Math.min(...minSpends))}~${formatWon(Math.max(...minSpends))}원`,
    );
  });

  it("formats thousands the same way on both sides", () => {
    expect(formatWon(1000000)).toBe("1,000,000");
    expect(formatWon(700)).toBe("700");
  });
});
