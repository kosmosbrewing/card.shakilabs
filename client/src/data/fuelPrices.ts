// 유가 데이터 (수동 업데이트, Opinet 전국 평균)
// 주 1회 업데이트 권장. FreshBadge에 기준일 반드시 표시

export type FuelType = "gasoline" | "diesel" | "lpg";

export interface FuelPriceData {
  lastUpdated: string;
  gasoline: number;
  diesel: number;
  lpg: number;
  source: string;
}

export const FUEL_PRICES: FuelPriceData = {
  lastUpdated: "2026.03.06",
  gasoline: 1648,
  diesel: 1498,
  lpg: 998,
  source: "Opinet 전국 평균",
};

export const FUEL_TYPE_LABELS: Record<FuelType, string> = {
  gasoline: "휘발유",
  diesel: "경유",
  lpg: "LPG",
};

export function getFuelPrice(type: FuelType): number {
  return FUEL_PRICES[type];
}
