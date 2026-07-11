import { describe, expect, it } from "vitest";
import {
  calculateBillingCycle,
  calculateCustoms,
  calculatePointConversions,
  compareCreditVsDebit,
} from "@/utils/cardTabCalculator";
import type { CalculationState } from "@/utils/calculationState";

function expectSuccess<T>(state: CalculationState<T>): T {
  expect(state.success).toBe(true);
  if (!state.success) throw new Error(state.message);
  return state.data;
}

describe("cardTabCalculator", () => {
  it("신용카드 추가 혜택이 연회비를 넘으면 신용카드를 추천한다", () => {
    const result = expectSuccess(compareCreditVsDebit({
      monthlySpend: 1_500_000,
      annualFee: 20_000,
      creditRate: 0.018,
      debitRate: 0.007,
    }));

    expect(result.winner).toBe("credit");
    expect(result.breakEvenSpend).toBe(151_515);
  });

  it("포인트 전환은 예상 가치 기준으로 정렬된다", () => {
    const result = expectSuccess(calculatePointConversions({ pointAmount: 50_000 }));
    expect(result.bestOption.label).toBe("대한항공 마일");
    expect(result.items[0].estimatedValue).toBeGreaterThan(result.items[1].estimatedValue);
  });

  it("결제일 다음 날 결제하면 이용 가능 기간이 가장 길다", () => {
    const result = expectSuccess(calculateBillingCycle({ purchaseDay: 15, billingDay: 14 }));
    expect(result.usableDays).toBe(45);
    expect(result.bestPurchaseDay).toBe(15);
  });

  it("직구 과세 기준 초과 시 관부가세를 계산한다", () => {
    const result = expectSuccess(calculateCustoms({ productUsd: 300, shippingUsd: 20, categoryKey: "fashion" }));
    expect(result.taxable).toBe(true);
    expect(result.totalTax).toBe(104_198);
  });

  it("범위를 벗어난 사용자 입력은 예외 대신 복구 상태를 반환한다", () => {
    const states = [
      compareCreditVsDebit({ monthlySpend: 0, annualFee: 0, creditRate: 0, debitRate: 0 }),
      calculatePointConversions({ pointAmount: 0 }),
      calculateBillingCycle({ purchaseDay: 32, billingDay: 14 }),
      calculateCustoms({ productUsd: -1, shippingUsd: 0, categoryKey: "fashion" }),
    ];

    expect(states.every((state) => !state.success)).toBe(true);
    expect(states.every((state) => !state.success && state.errorCode.startsWith("invalid_"))).toBe(true);
  });
});
