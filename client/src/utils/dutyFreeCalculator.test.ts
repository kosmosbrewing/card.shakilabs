import { describe, expect, it } from "vitest";
import {
  calculateDutyFree,
  formatTaxBreakdown,
  isExempt,
} from "@/utils/dutyFreeCalculator";

describe("dutyFreeCalculator", () => {
  it("returns zero tax when the purchase is within the exemption limit", () => {
    const result = calculateDutyFree({
      purchaseAmountUsd: 700,
      category: "cosmetics",
    });

    expect(isExempt(result)).toBe(true);
    expect(result.taxableAmountUsd).toBe(0);
    expect(result.finalTax).toBe(0);
    expect(formatTaxBreakdown(result)).toContain("0원");
  });

  it("keeps the normal method when simplified tax is applicable but more expensive", () => {
    const result = calculateDutyFree({
      purchaseAmountUsd: 1000,
      category: "cosmetics",
    });

    expect(result.isSimplifiedApplicable).toBe(true);
    expect(result.simplifiedTax).toBe(55200);
    expect(result.normalTotalTax).toBe(51888);
    expect(result.finalTaxMethod).toBe("normal");
    expect(result.finalTax).toBe(51888);
  });

  it("does not offer simplified tax for categories without that rule", () => {
    const result = calculateDutyFree({
      purchaseAmountUsd: 1000,
      category: "electronics",
    });

    expect(result.isSimplifiedApplicable).toBe(false);
    expect(result.simplifiedTax).toBeNull();
    expect(result.finalTaxMethod).toBe("normal");
  });
});
