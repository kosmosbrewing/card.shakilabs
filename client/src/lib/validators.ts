// 주유 할인카드 입력 검증 (Zod)

import { z } from "zod";
import type { Currency } from "@/data/exchangeRates";
import type { FuelType } from "@/data/fuelPrices";

export const MONTHLY_SPEND_MIN = 10000;
export const MONTHLY_SPEND_MAX = 10_000_000;
export const FOREIGN_AMOUNT_MAX = 1_000_000;
export const BENEFIT_SPENDING_MAX = 5_000_000;
export const DUTY_FREE_AMOUNT_MAX = 100_000;
export const MILEAGE_BALANCE_MAX = 10_000_000;

const FUEL_TYPE_VALUES = ["gasoline", "diesel", "lpg"] as const;
const CURRENCY_VALUES = [
  "USD",
  "EUR",
  "JPY",
  "GBP",
  "CNY",
  "THB",
  "VND",
  "TWD",
  "SGD",
  "AUD",
] as const;
const DUTY_FREE_CATEGORY_VALUES = [
  "cosmetics",
  "clothing",
  "electronics",
  "bag",
  "watch",
  "alcohol",
  "tobacco",
  "perfume",
  "food",
  "other",
] as const;
const AIRLINE_ID_VALUES = ["korean-air", "asiana"] as const;

export const fuelTypeSchema = z.enum(FUEL_TYPE_VALUES);
export const monthlySpendSchema = z.number().int().min(MONTHLY_SPEND_MIN).max(MONTHLY_SPEND_MAX);
export const currencySchema = z.enum(CURRENCY_VALUES);
export const foreignAmountSchema = z.number().positive().max(FOREIGN_AMOUNT_MAX);
export const dccMarkupSchema = z.number().min(0).max(0.2);
export const spendingAmountSchema = z.number().int().min(0).max(MONTHLY_SPEND_MAX);
export const benefitSpendingSchema = z.number().int().min(0).max(BENEFIT_SPENDING_MAX);
export const dutyFreeAmountSchema = z.number().min(0).max(DUTY_FREE_AMOUNT_MAX);
export const dutyFreeCategorySchema = z.enum(DUTY_FREE_CATEGORY_VALUES);
export const mileageBalanceSchema = z.number().int().min(0).max(MILEAGE_BALANCE_MAX);
export const airlineIdSchema = z.enum(AIRLINE_ID_VALUES);

export function parseFuelType(value: unknown): FuelType | null {
  const parsed = fuelTypeSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

export function parseMonthlySpend(value: unknown): number | null {
  const parsed = monthlySpendSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

export function parseCurrency(value: unknown): Currency | null {
  const normalized =
    typeof value === "string"
      ? value.trim().toUpperCase()
      : value;
  const parsed = currencySchema.safeParse(normalized);
  return parsed.success ? parsed.data : null;
}

export function parseForeignAmount(value: unknown): number | null {
  const normalized =
    typeof value === "string"
      ? Number.parseFloat(value)
      : value;
  const parsed = foreignAmountSchema.safeParse(normalized);
  return parsed.success ? parsed.data : null;
}

export function parseDccMarkup(value: unknown): number | null {
  const normalized =
    typeof value === "string"
      ? Number.parseFloat(value)
      : value;
  const parsed = dccMarkupSchema.safeParse(normalized);
  return parsed.success ? parsed.data : null;
}

export function parseSpendingAmount(value: unknown): number | null {
  const normalized =
    typeof value === "string"
      ? Number.parseInt(value, 10)
      : value;
  const parsed = spendingAmountSchema.safeParse(normalized);
  return parsed.success ? parsed.data : null;
}

export function parseBenefitSpending(value: unknown): number | null {
  const normalized =
    typeof value === "string"
      ? Number.parseInt(value, 10)
      : value;
  const parsed = benefitSpendingSchema.safeParse(normalized);
  return parsed.success ? parsed.data : null;
}

export function parseDutyFreeAmount(value: unknown): number | null {
  const normalized =
    typeof value === "string"
      ? Number.parseFloat(value)
      : value;
  const parsed = dutyFreeAmountSchema.safeParse(normalized);
  return parsed.success ? parsed.data : null;
}

export function parseMileageBalance(value: unknown): number | null {
  const normalized =
    typeof value === "string"
      ? Number.parseInt(value, 10)
      : value;
  const parsed = mileageBalanceSchema.safeParse(normalized);
  return parsed.success ? parsed.data : null;
}

export function sanitizeFuelType(value: unknown, fallback: FuelType = "gasoline"): FuelType {
  return parseFuelType(value) ?? fallback;
}

export function sanitizeMonthlySpend(value: unknown, fallback = 200000): number {
  return parseMonthlySpend(value) ?? fallback;
}

export function sanitizeCurrency(value: unknown, fallback: Currency = "USD"): Currency {
  return parseCurrency(value) ?? fallback;
}

export function sanitizeForeignAmount(value: unknown, fallback = 100): number {
  return parseForeignAmount(value) ?? fallback;
}

export function sanitizeDccMarkup(value: unknown, fallback = 0.05): number {
  return parseDccMarkup(value) ?? fallback;
}

export function sanitizeSpendingAmount(value: unknown, fallback = 0): number {
  return parseSpendingAmount(value) ?? fallback;
}

export function sanitizeBenefitSpending(value: unknown, fallback = 0): number {
  return parseBenefitSpending(value) ?? fallback;
}

export function sanitizeDutyFreeAmount(value: unknown, fallback = 0): number {
  return parseDutyFreeAmount(value) ?? fallback;
}

export function sanitizeMileageBalance(value: unknown, fallback = 0): number {
  return parseMileageBalance(value) ?? fallback;
}
