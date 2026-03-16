import { describe, expect, it } from "vitest";
import {
  calculateMileageValue,
  formatTotalValue,
  formatValuePerMile,
} from "@/utils/mileageCalculator";

describe("mileageCalculator", () => {
  it("finds the best redeemable option for a large enough balance", () => {
    const result = calculateMileageValue({
      airlineId: "korean-air",
      mileageBalance: 80000,
    });

    expect(result.bestOption?.routeId).toBe("usa");
    expect(result.bestOption?.seatClass).toBe("first");
    expect(result.bestValuePerMile).toBe(67.5);
    expect(result.totalValueKrw).toBe(5400000);
    expect(formatValuePerMile(result.bestValuePerMile)).toBe("68원/마일");
  });

  it("keeps showing a theoretical maximum value even when nothing is redeemable yet", () => {
    const result = calculateMileageValue({
      airlineId: "asiana",
      mileageBalance: 10000,
    });

    expect(result.redeemable).toHaveLength(0);
    expect(result.bestOption).toBeNull();
    expect(result.bestValuePerMile).toBeCloseTo(60.3529, 4);
    expect(formatTotalValue(result.totalValueKrw)).toBe("603,529원");
  });
});
