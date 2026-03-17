import { apiRequest } from "@/lib/api";

export interface FuelPriceApiSnapshot {
  updatedAt: string;
  source: string;
  gasoline: number;
  diesel: number;
  lpg: number;
}

export interface ExchangeRateApiSnapshot {
  fetchedAt: string;
  source?: string;
  rates: Record<string, number>;
}

export async function fetchFuelPriceSnapshot(): Promise<FuelPriceApiSnapshot> {
  return apiRequest<FuelPriceApiSnapshot>("/api/common/fuel-prices/latest", {
    cachePolicy: "constants",
  });
}

export async function fetchExchangeRateSnapshot(): Promise<ExchangeRateApiSnapshot> {
  return apiRequest<ExchangeRateApiSnapshot>("/api/common/rates/latest", {
    cachePolicy: "constants",
  });
}
