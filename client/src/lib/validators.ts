// 주유 할인카드 입력 검증 (Zod)

import { z } from "zod";
import type { FuelType } from "@/data/fuelPrices";

export const MONTHLY_SPEND_MIN = 10000;
export const MONTHLY_SPEND_MAX = 10_000_000;

const FUEL_TYPE_VALUES = ["gasoline", "diesel", "lpg"] as const;

export const fuelTypeSchema = z.enum(FUEL_TYPE_VALUES);
export const monthlySpendSchema = z.number().int().min(MONTHLY_SPEND_MIN).max(MONTHLY_SPEND_MAX);

export function parseFuelType(value: unknown): FuelType | null {
  const parsed = fuelTypeSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

export function parseMonthlySpend(value: unknown): number | null {
  const parsed = monthlySpendSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

export function sanitizeFuelType(value: unknown, fallback: FuelType = "gasoline"): FuelType {
  return parseFuelType(value) ?? fallback;
}

export function sanitizeMonthlySpend(value: unknown, fallback = 200000): number {
  return parseMonthlySpend(value) ?? fallback;
}
