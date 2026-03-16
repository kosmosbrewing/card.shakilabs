import { describe, expect, it } from "vitest";
import { FUEL_CARDS } from "@/data/fuelCards";
import {
  createDefaultSpendingMap,
  type SpendingMap,
} from "@/data/spendingCategories";
import { calculateMinSpendCard, formatQualificationStatus } from "@/utils/minSpendCalculator";

function getCard(id: string) {
  const card = FUEL_CARDS.find((item) => item.id === id);
  if (!card) throw new Error(`Card not found: ${id}`);
  return card;
}

function createSpending(overrides: Partial<SpendingMap> = {}): SpendingMap {
  return {
    ...createDefaultSpendingMap(),
    groceries: 0,
    transport: 0,
    telecom: 0,
    utilities: 0,
    insurance: 0,
    shopping: 0,
    other: 0,
    ...overrides,
  };
}

describe("minSpendCalculator", () => {
  it("uses the higher spend tier cap when total spending reaches that threshold", () => {
    const result = calculateMinSpendCard(getCard("hyundai-o"), {
      fuelType: "gasoline",
      fuelSpend: 200000,
      spending: createSpending({ groceries: 700000 }),
      preferredBrand: "all",
    });

    expect(result.isQualified).toBe(true);
    expect(result.appliedTierLabel).toContain("80만원");
    expect(result.appliedMonthlyCap).toBe(20000);
    expect(result.monthlyDiscount).toBe(20000);
  });

  it("blocks discounts when the preferred brand does not match the card restriction", () => {
    const result = calculateMinSpendCard(getCard("samsung-soil"), {
      fuelType: "gasoline",
      fuelSpend: 200000,
      spending: createSpending({ groceries: 200000 }),
      preferredBrand: "SK",
    });

    expect(result.isBrandMismatch).toBe(true);
    expect(result.monthlyDiscount).toBe(0);
    expect(formatQualificationStatus(result)).toBe("브랜드 조건 미충족");
  });

  it("clamps net benefit including spend gap at zero", () => {
    const result = calculateMinSpendCard(getCard("hyundai-o"), {
      fuelType: "gasoline",
      fuelSpend: 100000,
      spending: createSpending({ groceries: 100000 }),
      preferredBrand: "all",
    });

    expect(result.isQualified).toBe(false);
    expect(result.gap).toBe(200000);
    expect(result.netBenefitIncludingGap).toBe(0);
  });
});
