import { describe, expect, it } from "vitest";
import type { AnnualFeeCard, SpendingPatternMap } from "@/data/annualFeeCards";
import {
  calculateAnnualFeeCard,
  formatAnnualFeeAnalysis,
  formatBreakEven,
} from "@/utils/annualFeeCalculator";

function createSpending(overrides: Partial<SpendingPatternMap> = {}): SpendingPatternMap {
  return {
    dining: 0,
    shopping: 0,
    transport: 0,
    convenience: 0,
    telecom: 0,
    housing: 0,
    utilities: 0,
    insurance: 0,
    education: 0,
    travel: 0,
    culture: 0,
    general: 0,
    ...overrides,
  };
}

describe("annualFeeCalculator", () => {
  it("applies total monthly caps after category calculations", () => {
    const card: AnnualFeeCard = {
      id: "cap-test",
      issuer: "테스트카드",
      issuerColor: "#111827",
      name: "통합한도 테스트",
      annualFee: 20000,
      minSpend: 100000,
      totalMonthlyCap: 15000,
      benefitRates: [
        { categoryId: "shopping", rate: 0.1, monthlyCap: 40000 },
        { categoryId: "transport", rate: 0.1, monthlyCap: 40000 },
      ],
      extras: [],
      summary: "통합 한도 테스트 카드",
    };

    const result = calculateAnnualFeeCard(card, {
      spending: createSpending({ shopping: 200000, transport: 200000 }),
    });

    expect(result.rawMonthlyBenefit).toBe(40000);
    expect(result.totalMonthlyBenefit).toBe(15000);
    expect(result.isTotalCapExceeded).toBe(true);
  });

  it("caps break-even months at 120 when recovery would take too long", () => {
    const card: AnnualFeeCard = {
      id: "slow-recovery",
      issuer: "테스트카드",
      issuerColor: "#1d4ed8",
      name: "회수기간 테스트",
      annualFee: 240000,
      minSpend: 100000,
      benefitRates: [{ categoryId: "general", rate: 0.01, monthlyCap: 1000 }],
      extras: [],
      summary: "회수기간 테스트 카드",
    };

    const result = calculateAnnualFeeCard(card, {
      spending: createSpending({ general: 100000 }),
    });

    expect(result.totalMonthlyBenefit).toBe(1000);
    expect(result.breakEvenMonths).toBe(120);
    expect(formatBreakEven(result.breakEvenMonths)).toBe("120개월");
  });

  it("returns a min-spend guidance message when the card is not qualified", () => {
    const card: AnnualFeeCard = {
      id: "min-spend-test",
      issuer: "테스트카드",
      issuerColor: "#16a34a",
      name: "실적 테스트",
      annualFee: 10000,
      minSpend: 300000,
      benefitRates: [{ categoryId: "shopping", rate: 0.05, monthlyCap: 10000 }],
      extras: [],
      summary: "실적 테스트 카드",
    };

    const result = calculateAnnualFeeCard(card, {
      spending: createSpending({ shopping: 100000 }),
    });

    expect(result.isMinSpendMet).toBe(false);
    expect(result.totalMonthlyBenefit).toBe(0);
    expect(formatAnnualFeeAnalysis(result)).toContain("부족");
  });
});
