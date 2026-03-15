import {
  ANNUAL_FEE_CARDS,
  BENEFIT_CATEGORIES,
  type AnnualFeeCard,
  type BenefitCategoryId,
  type SpendingPatternMap,
  sumSpendingPattern,
} from "@/data/annualFeeCards";
import { roundWon } from "@/lib/utils";

export interface AnnualFeeCalcInput {
  spending: SpendingPatternMap;
}

export interface CategoryBenefitDetail {
  categoryId: BenefitCategoryId;
  categoryLabel: string;
  monthlySpend: number;
  rate: number;
  rawBenefit: number;
  cappedBenefit: number;
  isCapExceeded: boolean;
  monthlyCap: number;
}

export interface AnnualFeeCalcResult {
  cardId: string;
  card: AnnualFeeCard;
  categoryBreakdown: CategoryBenefitDetail[];
  totalMonthlySpend: number;
  rawMonthlyBenefit: number;
  totalMonthlyBenefit: number;
  appliedTotalMonthlyCap: number | null;
  isTotalCapExceeded: boolean;
  annualBenefit: number;
  annualFee: number;
  annualNetBenefit: number;
  breakEvenMonths: number | null;
  roiRatio: number;
  monthlyAnnualFee: number;
  isMinSpendMet: boolean;
  minSpendGap: number;
}

export function calculateAnnualFeeCard(
  card: AnnualFeeCard,
  input: AnnualFeeCalcInput
): AnnualFeeCalcResult {
  const totalMonthlySpend = sumSpendingPattern(input.spending);
  const isMinSpendMet = totalMonthlySpend >= card.minSpend;
  const minSpendGap = Math.max(0, card.minSpend - totalMonthlySpend);

  const benefitRateMap = new Map(card.benefitRates.map((item) => [item.categoryId, item]));

  const categoryBreakdown = BENEFIT_CATEGORIES.map((category) => {
    const spend = input.spending[category.id] ?? 0;
    const benefitRate = benefitRateMap.get(category.id);
    const rate = benefitRate?.rate ?? 0;
    const monthlyCap = benefitRate?.monthlyCap ?? 0;
    const rawBenefit = spend * rate;
    const cappedBenefit = monthlyCap > 0 ? Math.min(rawBenefit, monthlyCap) : rawBenefit;

    return {
      categoryId: category.id,
      categoryLabel: category.label,
      monthlySpend: roundWon(spend),
      rate,
      rawBenefit: roundWon(rawBenefit),
      cappedBenefit: roundWon(cappedBenefit),
      isCapExceeded: monthlyCap > 0 && rawBenefit > monthlyCap,
      monthlyCap,
    };
  }).filter((detail) => detail.rate > 0 || detail.monthlySpend > 0);

  const rawMonthlyBenefit = categoryBreakdown.reduce((sum, item) => sum + item.cappedBenefit, 0);
  const appliedTotalMonthlyCap = card.totalMonthlyCap ?? null;
  const cappedMonthlyBenefit =
    appliedTotalMonthlyCap != null
      ? Math.min(rawMonthlyBenefit, appliedTotalMonthlyCap)
      : rawMonthlyBenefit;
  const totalMonthlyBenefit = isMinSpendMet ? cappedMonthlyBenefit : 0;
  const isTotalCapExceeded =
    appliedTotalMonthlyCap != null && rawMonthlyBenefit > appliedTotalMonthlyCap;
  const annualBenefit = totalMonthlyBenefit * 12;
  const annualFee = card.annualFee;
  const annualNetBenefit = annualBenefit - annualFee;
  const MAX_BREAK_EVEN_MONTHS = 120;
  const rawBreakEven = totalMonthlyBenefit > 0 ? Math.ceil(annualFee / totalMonthlyBenefit) : null;
  const breakEvenMonths = rawBreakEven !== null ? Math.min(rawBreakEven, MAX_BREAK_EVEN_MONTHS) : null;
  const roiRatio = annualFee > 0 ? annualBenefit / annualFee : Number.POSITIVE_INFINITY;
  const monthlyAnnualFee = annualFee / 12;

  return {
    cardId: card.id,
    card,
    categoryBreakdown,
    totalMonthlySpend: roundWon(totalMonthlySpend),
    rawMonthlyBenefit: roundWon(rawMonthlyBenefit),
    totalMonthlyBenefit: roundWon(totalMonthlyBenefit),
    appliedTotalMonthlyCap,
    isTotalCapExceeded,
    annualBenefit: roundWon(annualBenefit),
    annualFee,
    annualNetBenefit: roundWon(annualNetBenefit),
    breakEvenMonths,
    roiRatio,
    monthlyAnnualFee: roundWon(monthlyAnnualFee),
    isMinSpendMet,
    minSpendGap: roundWon(minSpendGap),
  };
}

export function calculateAllAnnualFee(
  cards: AnnualFeeCard[] = ANNUAL_FEE_CARDS,
  input: AnnualFeeCalcInput
): AnnualFeeCalcResult[] {
  return cards.map((card) => calculateAnnualFeeCard(card, input));
}

export function formatBreakEven(months: number | null): string {
  if (months == null) return "회수 불가";
  if (months <= 1) return "1개월 이내";
  return `${months}개월`;
}

export function formatRoiRatio(value: number): string {
  if (!Number.isFinite(value)) return "무한";
  return `${value.toFixed(1)}배`;
}

export function formatAnnualFeeAnalysis(result: AnnualFeeCalcResult): string {
  if (!result.isMinSpendMet) {
    return `월 지출이 ${result.minSpendGap.toLocaleString()}원 부족해 이번 달 혜택은 0원으로 계산됩니다. 실적만 채우면 월 ${result.rawMonthlyBenefit.toLocaleString()}원 수준의 혜택이 가능합니다.`;
  }

  const strongestCategory = [...result.categoryBreakdown]
    .sort((a, b) => b.cappedBenefit - a.cappedBenefit)[0];

  if (!strongestCategory) {
    return `입력한 지출 패턴과 겹치는 주요 혜택 업종이 적어 연회비 회수 속도가 느립니다.`;
  }

  const capText =
    result.appliedTotalMonthlyCap != null
      ? ` 월 통합한도 ${result.appliedTotalMonthlyCap.toLocaleString()}원 기준으로 계산했습니다.`
      : "";

  return `${strongestCategory.categoryLabel}에서 월 ${strongestCategory.cappedBenefit.toLocaleString()}원 혜택이 가장 크고, 현재 패턴 기준 연 순혜택은 ${result.annualNetBenefit.toLocaleString()}원입니다.${capText}`;
}
