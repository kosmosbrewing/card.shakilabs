import { reactive } from "vue";
import { fetchFuelPriceSnapshot } from "@/lib/publicDataApi";

export type FuelType = "gasoline" | "diesel" | "lpg";

export interface FuelPriceData {
  lastUpdated: string;
  gasoline: number;
  diesel: number;
  lpg: number;
  source: string;
}

const fallbackFuelPrices: FuelPriceData = {
  lastUpdated: "2026-03-02",
  gasoline: 1707,
  diesel: 1612,
  lpg: 1012,
  source: "Opinet 전국 평균 판매가",
};

export const FUEL_PRICES = reactive<FuelPriceData>({ ...fallbackFuelPrices });

export const FUEL_TYPE_LABELS: Record<FuelType, string> = {
  gasoline: "휘발유",
  diesel: "경유",
  lpg: "LPG",
};

export function getFuelPrice(type: FuelType): number {
  return FUEL_PRICES[type];
}

let fuelPricesPromise: Promise<void> | null = null;

function applyFuelPriceSnapshot(snapshot: FuelPriceApiSnapshot): void {
  FUEL_PRICES.lastUpdated = snapshot.updatedAt;
  FUEL_PRICES.gasoline = snapshot.gasoline;
  FUEL_PRICES.diesel = snapshot.diesel;
  FUEL_PRICES.lpg = snapshot.lpg;
  FUEL_PRICES.source = snapshot.source;
}

type FuelPriceApiSnapshot = Awaited<ReturnType<typeof fetchFuelPriceSnapshot>>;

export async function loadFuelPrices(forceRefresh = false): Promise<void> {
  if (fuelPricesPromise && !forceRefresh) return fuelPricesPromise;

  fuelPricesPromise = (async () => {
    try {
      applyFuelPriceSnapshot(await fetchFuelPriceSnapshot());
    } catch {
      if (forceRefresh) {
        Object.assign(FUEL_PRICES, fallbackFuelPrices);
      }
    }
  })();

  await fuelPricesPromise;
}
