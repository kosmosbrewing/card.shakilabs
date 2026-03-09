// 주유 할인카드 절약액 계산 엔진

import type { FuelCard } from "@/data/fuelCards";
import type { FuelType } from "@/data/fuelPrices";
import { getFuelPrice } from "@/data/fuelPrices";

export interface FuelCardCalcInput {
  fuelType: FuelType;
  monthlySpend: number;
  preferredBrand: string; // "all" 이면 전체
}

export interface FuelCardCalcResult {
  cardId: string;
  card: FuelCard;
  /** 월 주유량 (L) */
  monthlyLiters: number;
  /** 월 할인 금액 (한도 적용 전) */
  rawMonthlyDiscount: number;
  /** 월 할인 금액 (한도 적용 후) */
  monthlyDiscount: number;
  /** 월 할인 한도 초과 여부 */
  isCapExceeded: boolean;
  /** 연회비 월 환산 */
  monthlyAnnualFee: number;
  /** 순 월 절약액 (할인 - 연회비) */
  monthlyNet: number;
  /** 순 연 절약액 */
  annualNet: number;
  /** 체감 리터당 가격 */
  effectivePrice: number;
  /** 브랜드 제한으로 미적용 여부 */
  isBrandMismatch: boolean;
  /** 전월 실적 미달 가능 경고 */
  isMinSpendWarning: boolean;
}

/**
 * 단일 카드의 절약액을 계산
 */
export function calculateCardSavings(
  card: FuelCard,
  input: FuelCardCalcInput
): FuelCardCalcResult {
  const fuelPrice = getFuelPrice(input.fuelType);
  const monthlyLiters = fuelPrice > 0 ? input.monthlySpend / fuelPrice : 0;

  // 브랜드 제한 확인
  const isBrandMismatch =
    card.discount.brandRestriction.length > 0 &&
    input.preferredBrand !== "all" &&
    !card.discount.brandRestriction.includes(input.preferredBrand);

  // 할인 유형별 월 할인 계산
  let rawMonthlyDiscount = 0;
  switch (card.discount.type) {
    case "perLiter":
      rawMonthlyDiscount = monthlyLiters * card.discount.amount;
      break;
    case "percent":
      rawMonthlyDiscount = input.monthlySpend * card.discount.amount;
      break;
    case "cashback":
      rawMonthlyDiscount = input.monthlySpend * card.discount.amount;
      break;
  }

  // 월 할인 한도 적용
  const isCapExceeded =
    card.discount.monthlyCap > 0 && rawMonthlyDiscount > card.discount.monthlyCap;
  const monthlyDiscount =
    card.discount.monthlyCap > 0
      ? Math.min(rawMonthlyDiscount, card.discount.monthlyCap)
      : rawMonthlyDiscount;

  // 연회비 월 환산
  const monthlyAnnualFee = card.annualFee / 12;

  // 순 절약액
  const monthlyNet = monthlyDiscount - monthlyAnnualFee;
  const annualNet = monthlyNet * 12;

  // 체감 리터당 가격
  const effectivePrice =
    monthlyLiters > 0
      ? fuelPrice - monthlyDiscount / monthlyLiters
      : fuelPrice;

  // 전월 실적 미달 경고
  const isMinSpendWarning =
    card.discount.minSpend > 0 && input.monthlySpend < card.discount.minSpend;

  return {
    cardId: card.id,
    card,
    monthlyLiters: Math.round(monthlyLiters * 10) / 10,
    rawMonthlyDiscount: Math.round(rawMonthlyDiscount),
    monthlyDiscount: Math.round(monthlyDiscount),
    isCapExceeded,
    monthlyAnnualFee: Math.round(monthlyAnnualFee),
    monthlyNet: Math.round(monthlyNet),
    annualNet: Math.round(annualNet),
    effectivePrice: Math.round(effectivePrice),
    isBrandMismatch,
    isMinSpendWarning,
  };
}

/**
 * 전체 카드 비교 계산
 */
export function calculateAllCards(
  cards: FuelCard[],
  input: FuelCardCalcInput
): FuelCardCalcResult[] {
  return cards.map((card) => calculateCardSavings(card, input));
}

/**
 * 할인 방식 한글 표시
 */
export function formatDiscountType(card: FuelCard): string {
  switch (card.discount.type) {
    case "perLiter":
      return `리터당 ${card.discount.amount}원`;
    case "percent":
      return `${(card.discount.amount * 100).toFixed(0)}% 할인`;
    case "cashback":
      return `${(card.discount.amount * 100).toFixed(0)}% 캐시백`;
  }
}

/**
 * 할인 구조 상세 설명 생성
 */
export function formatDiscountDetail(result: FuelCardCalcResult): string {
  const { card, monthlyLiters, monthlyDiscount, isCapExceeded } = result;
  const d = card.discount;

  let base = "";
  switch (d.type) {
    case "perLiter":
      base = `리터당 ${d.amount}원 × 월 ${monthlyLiters.toFixed(1)}L = ${monthlyDiscount.toLocaleString()}원 할인`;
      break;
    case "percent":
      base = `주유비의 ${(d.amount * 100).toFixed(0)}% = ${monthlyDiscount.toLocaleString()}원 할인`;
      break;
    case "cashback":
      base = `주유비의 ${(d.amount * 100).toFixed(0)}% 캐시백 = ${monthlyDiscount.toLocaleString()}원`;
      break;
  }

  const capNote =
    isCapExceeded && d.monthlyCap > 0
      ? `, 한도 초과 — 실제 할인은 월 ${d.monthlyCap.toLocaleString()}원까지`
      : d.monthlyCap > 0
        ? `, 한도 ${d.monthlyCap.toLocaleString()}원 이내 ✅`
        : "";

  const feeNote = `, 연회비 ${card.annualFee.toLocaleString()}원 차감`;
  const netNote = ` → 순 절약 ${result.monthlyNet.toLocaleString()}원/월`;

  return base + capNote + feeNote + netNote;
}
