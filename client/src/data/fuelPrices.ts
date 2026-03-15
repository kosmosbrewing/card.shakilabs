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
  lastUpdated: "2026-03-02",
  gasoline: 1707,
  diesel: 1612,
  lpg: 1012,
  source: "Opinet 전국 평균 판매가",
};

export const FUEL_TYPE_LABELS: Record<FuelType, string> = {
  gasoline: "휘발유",
  diesel: "경유",
  lpg: "LPG",
};

export function getFuelPrice(type: FuelType): number {
  return FUEL_PRICES[type];
}
