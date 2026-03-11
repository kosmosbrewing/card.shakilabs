// 주유 할인카드 입력 검증 (Zod)

import { z } from "zod";
import type { Currency } from "@/data/exchangeRates";
import type { FuelType } from "@/data/fuelPrices";

export const MONTHLY_SPEND_MIN = 10000;
export const MONTHLY_SPEND_MAX = 10_000_000;
export const FOREIGN_AMOUNT_MAX = 1_000_000;

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

export const fuelTypeSchema = z.enum(FUEL_TYPE_VALUES);
export const monthlySpendSchema = z.number().int().min(MONTHLY_SPEND_MIN).max(MONTHLY_SPEND_MAX);
export const currencySchema = z.enum(CURRENCY_VALUES);
export const foreignAmountSchema = z.number().positive().max(FOREIGN_AMOUNT_MAX);
export const dccMarkupSchema = z.number().min(0).max(0.2);
export const spendingAmountSchema = z.number().int().min(0).max(MONTHLY_SPEND_MAX);

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
