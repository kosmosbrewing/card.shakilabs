import { describe, expect, it } from "vitest";
import {
  calculateBillingCycle,
  calculateCustoms,
  calculatePointConversions,
  compareCreditVsDebit,
} from "@/utils/cardTabCalculator";

describe("cardTabCalculator", () => {
  it("신용카드 추가 혜택이 연회비를 넘으면 신용카드를 추천한다", () => {
    const result = compareCreditVsDebit({
      monthlySpend: 1_500_000,
      annualFee: 20_000,
      creditRate: 0.018,
      debitRate: 0.007,
    });

    expect(result.winner).toBe("credit");
    expect(result.breakEvenSpend).toBe(151_515);
  });

  it("포인트 전환은 예상 가치 기준으로 정렬된다", () => {
    const result = calculatePointConversions({ pointAmount: 50_000 });
    expect(result.bestOption.label).toBe("대한항공 마일");
    expect(result.items[0].estimatedValue).toBeGreaterThan(result.items[1].estimatedValue);
  });

  it("결제일 다음 날 결제하면 이용 가능 기간이 가장 길다", () => {
    const result = calculateBillingCycle({ purchaseDay: 15, billingDay: 14 });
    expect(result.usableDays).toBe(45);
    expect(result.bestPurchaseDay).toBe(15);
  });

  it("직구 과세 기준 초과 시 관부가세를 계산한다", () => {
    const result = calculateCustoms({ productUsd: 300, shippingUsd: 20, categoryKey: "fashion" });
    expect(result.taxable).toBe(true);
    expect(result.totalTax).toBe(104_198);
  });
});
