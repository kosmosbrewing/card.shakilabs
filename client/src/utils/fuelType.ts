import type { FuelType } from "@/data/fuelPrices";

export function normalizeFuelType(value: string): FuelType {
  return value === "diesel" || value === "lpg" ? value : "gasoline";
}
