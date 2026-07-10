import { describe, expect, it } from "vitest";
import {
  calculateMileageValue,
  formatTotalValue,
  formatValuePerMile,
} from "@/utils/mileageCalculator";
import { getAirlineMileageData } from "@/data/mileageData";

describe("mileageCalculator", () => {
  it("finds the highest example value among balance-eligible options", () => {
    const result = calculateMileageValue({
      airlineId: "korean-air",
      mileageBalance: 80000,
    });

    expect(result.bestBalanceEligibleOption?.routeId).toBe("southeast-asia");
    expect(result.bestBalanceEligibleOption?.seatClass).toBe("business");
    expect(result.bestValuePerMile).toBe(38.75);
    expect(result.totalValueKrw).toBe(3100000);
    expect(formatValuePerMile(result.bestValuePerMile)).toBe("39원/마일");
  });

  it("keeps showing an example upper bound when no option meets the mileage balance", () => {
    const result = calculateMileageValue({
      airlineId: "asiana",
      mileageBalance: 10000,
    });

    expect(result.balanceEligible).toHaveLength(0);
    expect(result.bestBalanceEligibleOption).toBeNull();
    expect(result.bestValuePerMile).toBe(49.6);
    expect(formatTotalValue(result.totalValueKrw)).toBe("496,000원");
  });

  it("uses Korean Air official off-peak adult round-trip awards", () => {
    const data = getAirlineMileageData("korean-air");
    const japan = data.redemptions.filter((item) => item.routeId === "japan");
    expect(japan.map((item) => item.milesRequired)).toEqual([
      30_000,
      45_000,
      65_000,
    ]);
  });

  it("uses Asiana official off-peak adult round-trip awards", () => {
    const data = getAirlineMileageData("asiana");
    const usa = data.redemptions.filter((item) => item.routeId === "usa");
    expect(usa.map((item) => item.milesRequired)).toEqual([
      70_000,
      105_000,
      125_000,
    ]);
  });
});
