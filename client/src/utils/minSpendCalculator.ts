import {
  getFuelCardMinimumSpend,
  getFuelCardTierForSpend,
  type FuelCard,
} from "@/data/fuelCards";
import { getFuelPrice, type FuelType } from "@/data/fuelPrices";
import type { SpendingMap } from "@/data/spendingCategories";
import { sumSpendingMap } from "@/data/spendingCategories";

export interface MinSpendCalcInput {
  fuelType: FuelType;
  fuelSpend: number;
  spending: SpendingMap;
  preferredBrand: string;
}

export interface MinSpendCalcResult {
  cardId: string;
  card: FuelCard;
  totalSpending: number;
  minSpendRequired: number;
  appliedMonthlyCap: number;
  appliedTierLabel: string | null;
  isQualified: boolean;
  qualificationRate: number;
  gap: number;
  monthlyDiscount: number;
  isCapExceeded: boolean;
  monthlyAnnualFee: number;
  monthlyNetBenefit: number;
  annualNetBenefit: number;
  gapEfficiency: number | null;
  netBenefitIncludingGap: number;
  isBrandMismatch: boolean;
  monthlyLiters: number;
}

function roundWon(value: number): number {
  return Math.round(value);
}

export function calculateMinSpendCard(
  card: FuelCard,
  input: MinSpendCalcInput
): MinSpendCalcResult {
  const fuelPrice = getFuelPrice(input.fuelType);
  const monthlyLiters = fuelPrice > 0 ? input.fuelSpend / fuelPrice : 0;
  const totalSpending = sumSpendingMap(input.spending) + input.fuelSpend;
  const appliedTier = getFuelCardTierForSpend(card, totalSpending, true);

  const isBrandMismatch =
    card.discount.brandRestriction.length > 0 &&
    input.preferredBrand !== "all" &&
    !card.discount.brandRestriction.includes(input.preferredBrand);

  const minSpendRequired = appliedTier?.minSpend ?? getFuelCardMinimumSpend(card);
  const appliedMonthlyCap = appliedTier?.monthlyCap ?? card.discount.monthlyCap;
  const isQualified = totalSpending >= minSpendRequired;
  const gap = Math.max(0, minSpendRequired - totalSpending);
  const qualificationRate =
    minSpendRequired > 0 ? Math.min(totalSpending / minSpendRequired, 1) : 1;

  let rawDiscount = 0;
  switch (card.discount.type) {
    case "perLiter":
      rawDiscount = monthlyLiters * card.discount.amount;
      break;
    case "percent":
    case "cashback":
      rawDiscount = input.fuelSpend * card.discount.amount;
      break;
  }

  const isCapExceeded =
    appliedMonthlyCap > 0 && rawDiscount > appliedMonthlyCap;
  const cappedDiscount =
    appliedMonthlyCap > 0
      ? Math.min(rawDiscount, appliedMonthlyCap)
      : rawDiscount;

  const monthlyDiscount = isQualified && !isBrandMismatch ? cappedDiscount : 0;
  const monthlyAnnualFee = card.annualFee / 12;
  const monthlyNetBenefit = monthlyDiscount - monthlyAnnualFee;
  const annualNetBenefit = monthlyNetBenefit * 12;
  const gapEfficiency = gap > 0 ? cappedDiscount / gap : null;
  const netBenefitIncludingGap =
    gap > 0
      ? cappedDiscount - monthlyAnnualFee - gap
      : monthlyNetBenefit;

  return {
    cardId: card.id,
    card,
    totalSpending: roundWon(totalSpending),
    minSpendRequired,
    appliedMonthlyCap,
    appliedTierLabel: appliedTier?.label ?? null,
    isQualified,
    qualificationRate,
    gap: roundWon(gap),
    monthlyDiscount: roundWon(monthlyDiscount),
    isCapExceeded,
    monthlyAnnualFee: roundWon(monthlyAnnualFee),
    monthlyNetBenefit: roundWon(monthlyNetBenefit),
    annualNetBenefit: roundWon(annualNetBenefit),
    gapEfficiency,
    netBenefitIncludingGap: roundWon(netBenefitIncludingGap),
    isBrandMismatch,
    monthlyLiters: Math.round(monthlyLiters * 10) / 10,
  };
}

export function calculateAllMinSpend(
  cards: FuelCard[],
  input: MinSpendCalcInput
): MinSpendCalcResult[] {
  return cards.map((card) => calculateMinSpendCard(card, input));
}

export function formatQualificationStatus(result: MinSpendCalcResult): string {
  if (result.isBrandMismatch) return "브랜드 조건 미충족";
  if (result.isQualified) return "실적 충족";
  return `${result.gap.toLocaleString()}원 부족`;
}

export function formatGapAnalysis(result: MinSpendCalcResult): string {
  if (result.isBrandMismatch) {
    return `선호 주유소 조건과 맞지 않아 할인 계산에서 제외됩니다.`;
  }

  if (result.isQualified) {
    const tierText = result.appliedTierLabel
      ? `${result.appliedTierLabel} 구간`
      : `실적 ${result.minSpendRequired.toLocaleString()}원`;
    return `월 지출 ${result.totalSpending.toLocaleString()}원으로 ${tierText}을 충족했고, 현재 한도 ${result.appliedMonthlyCap.toLocaleString()}원 기준 순혜택은 ${result.monthlyNetBenefit.toLocaleString()}원입니다.`;
  }

  const discountText = result.monthlyDiscount > 0
    ? `${result.monthlyDiscount.toLocaleString()}원`
    : `${Math.round(result.monthlyNetBenefit + result.monthlyAnnualFee).toLocaleString()}원`;

  return `실적까지 ${result.gap.toLocaleString()}원 부족합니다. 충족 시 현재 구간 한도 ${result.appliedMonthlyCap.toLocaleString()}원 기준 월 할인 ${discountText}, 추가 지출까지 감안한 순혜택은 ${result.netBenefitIncludingGap.toLocaleString()}원입니다.`;
}
