import { getExchangeRate, type Currency, type ExchangeRateEntry } from "@/data/exchangeRates";
import type { OverseasBenefit, OverseasCard } from "@/data/overseasCards";
import { roundWon } from "@/lib/utils";

export interface OverseasCalcInput {
  currency: Currency;
  foreignAmount: number;
  dccMarkupRate: number;
}

export interface OverseasCalcResult {
  cardId: string;
  card: OverseasCard;
  foreignAmount: number;
  exchangeRate: number;
  exchangeUnit: number;
  baseKrwAmount: number;
  cardFeeAmount: number;
  cardFeeRate: number;
  localCurrencyTotal: number;
  benefitAmount: number;
  localCurrencyNet: number;
  dccMarkupRate: number;
  dccExchangeRate: number;
  dccTotal: number;
  dccDifference: number;
  dccDifferenceRate: number;
  isMinSpendWarning: boolean;
}

function calculateSingleBenefit(benefit: OverseasBenefit, amount: number): number {
  const raw =
    benefit.rate != null
      ? amount * benefit.rate
      : (benefit.fixedAmount ?? 0);

  if (benefit.monthlyCap > 0) {
    return Math.min(raw, benefit.monthlyCap);
  }
  return raw;
}

export function calculateBenefitAmount(card: OverseasCard, localCurrencyTotal: number): number {
  if (card.benefits.length === 0) return 0;
  return roundWon(
    card.benefits.reduce(
      (sum, benefit) => sum + calculateSingleBenefit(benefit, localCurrencyTotal),
      0
    )
  );
}

export function calculateOverseasPayment(
  card: OverseasCard,
  input: OverseasCalcInput,
  rateEntry = getExchangeRate(input.currency)
): OverseasCalcResult {
  const baseKrwAmount = roundWon((input.foreignAmount / rateEntry.unit) * rateEntry.rate);
  const cardFeeAmount = roundWon(baseKrwAmount * card.fee.totalFeeRate);
  const localCurrencyTotal = baseKrwAmount + cardFeeAmount;
  const benefitAmount = calculateBenefitAmount(card, localCurrencyTotal);
  const localCurrencyNet = Math.max(localCurrencyTotal - benefitAmount, 0);

  const dccExchangeRate = rateEntry.rate * (1 + input.dccMarkupRate);
  const dccTotal = roundWon((input.foreignAmount / rateEntry.unit) * dccExchangeRate);
  const dccDifference = dccTotal - localCurrencyNet;
  const dccDifferenceRate = localCurrencyNet > 0 ? dccDifference / localCurrencyNet : 0;
  const isMinSpendWarning = card.benefits.some(
    (benefit) => benefit.minSpend > 0 && localCurrencyTotal < benefit.minSpend
  );

  return {
    cardId: card.id,
    card,
    foreignAmount: input.foreignAmount,
    exchangeRate: rateEntry.rate,
    exchangeUnit: rateEntry.unit,
    baseKrwAmount,
    cardFeeAmount,
    cardFeeRate: card.fee.totalFeeRate,
    localCurrencyTotal,
    benefitAmount,
    localCurrencyNet,
    dccMarkupRate: input.dccMarkupRate,
    dccExchangeRate,
    dccTotal,
    dccDifference,
    dccDifferenceRate,
    isMinSpendWarning,
  };
}

export function calculateAllOverseasCards(
  cards: OverseasCard[],
  input: OverseasCalcInput,
  rateEntry?: ExchangeRateEntry
): OverseasCalcResult[] {
  const exchangeRate = rateEntry ?? getExchangeRate(input.currency);
  return cards.map((card) => calculateOverseasPayment(card, input, exchangeRate));
}

export function formatFeeRate(card: OverseasCard): string {
  if (card.fee.totalFeeRate <= 0) {
    return card.feeCondition ? "조건부 수수료 면제" : "수수료 면제";
  }
  return `${(card.fee.totalFeeRate * 100).toFixed(1)}%`;
}

export function formatBenefitValue(benefit: OverseasBenefit): string {
  if (benefit.rate != null) {
    return `${(benefit.rate * 100).toFixed(1)}%`;
  }
  if (benefit.fixedAmount != null) {
    return `${benefit.fixedAmount.toLocaleString()}원`;
  }
  return "혜택 없음";
}

export function formatPrimaryBenefit(card: OverseasCard): string {
  const primary = card.benefits[0];
  if (!primary) return "추가 혜택 없음";
  return `${primary.description}${primary.monthlyCap > 0 ? ` · 월 ${primary.monthlyCap.toLocaleString()}원 한도` : ""}`;
}

export function formatPaymentBreakdown(result: OverseasCalcResult): string {
  const feeText =
    result.cardFeeRate > 0
      ? `환율 환산 ${result.baseKrwAmount.toLocaleString()}원 + 수수료 ${result.cardFeeAmount.toLocaleString()}원(${(result.cardFeeRate * 100).toFixed(1)}%)`
      : `환율 환산 ${result.baseKrwAmount.toLocaleString()}원 + 해외수수료 면제`;
  const benefitText =
    result.benefitAmount > 0
      ? `혜택 ${result.benefitAmount.toLocaleString()}원 적용 후 실부담 ${result.localCurrencyNet.toLocaleString()}원`
      : `혜택 차감 없이 실부담 ${result.localCurrencyNet.toLocaleString()}원`;
  const dccText = `DCC 선택 시 ${result.dccTotal.toLocaleString()}원으로 ${result.dccDifference.toLocaleString()}원 차이`;
  const conditionText = result.card.feeCondition
    ? ` ${result.card.feeCondition}.`
    : "";

  return `${feeText}, ${benefitText}. ${dccText}.${conditionText}`;
}
