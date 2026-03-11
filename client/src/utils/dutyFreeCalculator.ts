import {
  DUTY_FREE_CONSTANTS,
  getDutyFreeCategoryInfo,
  type DutyFreeCategory,
} from "@/data/dutyFreeRates";

export interface DutyFreeCalcInput {
  purchaseAmountUsd: number;
  category: DutyFreeCategory;
}

export interface DutyFreeCalcResult {
  purchaseAmountUsd: number;
  categoryLabel: string;
  exemptionUsd: number;
  taxableAmountUsd: number;
  taxableAmountKrw: number;
  exchangeRate: number;
  tariffRate: number;
  tariffAmount: number;
  vatBase: number;
  vatAmount: number;
  normalTotalTax: number;
  simplifiedRate: number | null;
  simplifiedTax: number | null;
  isSimplifiedApplicable: boolean;
  isSimplifiedBetter: boolean;
  finalTax: number;
  finalTaxMethod: "normal" | "simplified";
  effectiveTaxRate: number;
  totalCostKrw: number;
}

function roundWon(value: number): number {
  return Math.round(value);
}

export function calculateDutyFree(input: DutyFreeCalcInput): DutyFreeCalcResult {
  const category = getDutyFreeCategoryInfo(input.category);
  const exemptionUsd = DUTY_FREE_CONSTANTS.exemptionLimitUsd;
  const taxableAmountUsd = Math.max(0, input.purchaseAmountUsd - exemptionUsd);
  const taxableAmountKrw = taxableAmountUsd * DUTY_FREE_CONSTANTS.exchangeRate;
  const tariffAmount = taxableAmountKrw * category.tariffRate;
  const vatBase = taxableAmountKrw + tariffAmount;
  const vatAmount = vatBase * DUTY_FREE_CONSTANTS.vatRate;
  const normalTotalTax = tariffAmount + vatAmount;
  const isSimplifiedApplicable =
    category.simplifiedRate != null &&
    taxableAmountUsd > 0 &&
    input.purchaseAmountUsd <= category.simplifiedMaxUsd;
  const simplifiedTax = isSimplifiedApplicable && category.simplifiedRate != null
    ? taxableAmountKrw * category.simplifiedRate
    : null;
  const isSimplifiedBetter =
    simplifiedTax != null && simplifiedTax < normalTotalTax;
  const finalTaxMethod = isSimplifiedBetter ? "simplified" : "normal";
  const finalTax = finalTaxMethod === "simplified" && simplifiedTax != null
    ? simplifiedTax
    : normalTotalTax;
  const purchaseKrw = input.purchaseAmountUsd * DUTY_FREE_CONSTANTS.exchangeRate;
  const totalCostKrw = purchaseKrw + finalTax;
  const effectiveTaxRate = purchaseKrw > 0 ? finalTax / purchaseKrw : 0;

  return {
    purchaseAmountUsd: input.purchaseAmountUsd,
    categoryLabel: category.label,
    exemptionUsd,
    taxableAmountUsd: Number(taxableAmountUsd.toFixed(2)),
    taxableAmountKrw: roundWon(taxableAmountKrw),
    exchangeRate: DUTY_FREE_CONSTANTS.exchangeRate,
    tariffRate: category.tariffRate,
    tariffAmount: roundWon(tariffAmount),
    vatBase: roundWon(vatBase),
    vatAmount: roundWon(vatAmount),
    normalTotalTax: roundWon(normalTotalTax),
    simplifiedRate: category.simplifiedRate,
    simplifiedTax: simplifiedTax == null ? null : roundWon(simplifiedTax),
    isSimplifiedApplicable,
    isSimplifiedBetter,
    finalTax: roundWon(finalTax),
    finalTaxMethod,
    effectiveTaxRate,
    totalCostKrw: roundWon(totalCostKrw),
  };
}

export function isExempt(result: DutyFreeCalcResult): boolean {
  return result.taxableAmountUsd <= 0;
}

export function formatTaxBreakdown(result: DutyFreeCalcResult): string {
  if (isExempt(result)) {
    return `구매액이 면세 한도 ${result.exemptionUsd}달러 이하여서 예상 세금은 0원입니다.`;
  }

  return `${result.categoryLabel} 기준 과세 대상은 ${result.taxableAmountUsd.toLocaleString()}달러이고, 최종 세액은 ${result.finalTax.toLocaleString()}원입니다.`;
}
