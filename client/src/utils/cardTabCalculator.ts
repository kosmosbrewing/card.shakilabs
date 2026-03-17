import { z } from "zod";
import {
  BILLING_DAY_OPTIONS,
  CARD_CUSTOMS_CATEGORIES,
  POINT_PROGRAMS,
} from "@/data/cardTabData";
import { roundWon } from "@/lib/utils";

const creditVsDebitSchema = z.object({
  monthlySpend: z.number().min(100_000).max(10_000_000),
  annualFee: z.number().min(0).max(300_000),
  creditRate: z.number().min(0).max(0.1),
  debitRate: z.number().min(0).max(0.1),
});

const pointConvertSchema = z.object({
  pointAmount: z.number().int().min(1_000).max(10_000_000),
});

const billingCycleSchema = z.object({
  purchaseDay: z.number().int().min(1).max(31),
  billingDay: z.number().refine((value) => BILLING_DAY_OPTIONS.includes(value as (typeof BILLING_DAY_OPTIONS)[number])),
});

const customsSchema = z.object({
  productUsd: z.number().min(1).max(20_000),
  shippingUsd: z.number().min(0).max(3_000),
  categoryKey: z.string(),
});

export function compareCreditVsDebit(input: z.input<typeof creditVsDebitSchema>) {
  const parsed = creditVsDebitSchema.parse(input);
  const annualCreditBenefit = roundWon(parsed.monthlySpend * parsed.creditRate * 12 - parsed.annualFee);
  const annualDebitBenefit = roundWon(parsed.monthlySpend * parsed.debitRate * 12);
  const monthlyGap = parsed.monthlySpend * Math.max(parsed.creditRate - parsed.debitRate, 0);
  const breakEvenSpend = monthlyGap > 0 ? roundWon(parsed.annualFee / ((parsed.creditRate - parsed.debitRate) * 12)) : null;

  return {
    annualCreditBenefit,
    annualDebitBenefit,
    winner: annualCreditBenefit >= annualDebitBenefit ? "credit" : "debit",
    gap: Math.abs(annualCreditBenefit - annualDebitBenefit),
    monthlyGap: roundWon(monthlyGap),
    breakEvenSpend,
  };
}

export function calculatePointConversions(input: z.input<typeof pointConvertSchema>) {
  const parsed = pointConvertSchema.parse(input);
  const items = POINT_PROGRAMS.map((program) => {
    const units = Math.floor(parsed.pointAmount / program.pointsPerUnit);
    const estimatedValue = roundWon(units * program.unitValueWon);

    return {
      ...program,
      units,
      estimatedValue,
      valuePerPoint: estimatedValue / parsed.pointAmount,
    };
  }).sort((a, b) => b.estimatedValue - a.estimatedValue);

  return {
    pointAmount: parsed.pointAmount,
    bestOption: items[0],
    items,
  };
}

export function calculateBillingCycle(input: z.input<typeof billingCycleSchema>) {
  const parsed = billingCycleSchema.parse(input);
  const monthDays = 31;
  const cycleDays = parsed.purchaseDay <= parsed.billingDay
    ? parsed.billingDay - parsed.purchaseDay + 1
    : monthDays - parsed.purchaseDay + parsed.billingDay + 1;
  const graceDays = 14;
  const bestPurchaseDay = parsed.billingDay === 31 ? 1 : parsed.billingDay + 1;

  return {
    cycleDays,
    graceDays,
    usableDays: cycleDays + graceDays,
    bestPurchaseDay,
    bestUsableDays: monthDays + graceDays,
    nextStatementLabel: parsed.purchaseDay <= parsed.billingDay ? "이번 달 청구" : "다음 달 청구",
  };
}

export function calculateCustoms(input: z.input<typeof customsSchema>) {
  const parsed = customsSchema.parse(input);
  const category = CARD_CUSTOMS_CATEGORIES.find((item) => item.key === parsed.categoryKey) ?? CARD_CUSTOMS_CATEGORIES[0];
  const exchangeRate = 1_340;
  const totalUsd = parsed.productUsd + parsed.shippingUsd;
  const taxable = totalUsd > category.thresholdUsd;
  const baseKrw = totalUsd * exchangeRate;
  const tariff = taxable ? baseKrw * category.tariffRate : 0;
  const vat = taxable ? (baseKrw + tariff) * 0.1 : 0;
  const totalTax = roundWon(tariff + vat);

  return {
    category,
    totalUsd,
    exchangeRate,
    taxable,
    taxableBaseKrw: taxable ? roundWon(baseKrw) : 0,
    tariff: roundWon(tariff),
    vat: roundWon(vat),
    totalTax,
    landedCost: taxable ? roundWon(baseKrw + totalTax) : roundWon(baseKrw),
  };
}
