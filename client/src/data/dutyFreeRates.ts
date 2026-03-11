export type DutyFreeCategory =
  | "cosmetics"
  | "clothing"
  | "electronics"
  | "bag"
  | "watch"
  | "alcohol"
  | "tobacco"
  | "perfume"
  | "food"
  | "other";

export interface DutyFreeCategoryInfo {
  id: DutyFreeCategory;
  label: string;
  tariffRate: number;
  simplifiedRate: number | null;
  simplifiedMaxUsd: number;
  order: number;
  examples: string;
}

export interface DutyFreeConstants {
  exemptionLimitUsd: number;
  vatRate: number;
  exchangeRate: number;
  lastUpdated: string;
}

export const DUTY_FREE_CONSTANTS: DutyFreeConstants = {
  exemptionLimitUsd: 800,
  vatRate: 0.1,
  exchangeRate: 1380,
  lastUpdated: "2026-03-11",
};

export const DUTY_FREE_CATEGORIES: DutyFreeCategoryInfo[] = [
  { id: "cosmetics", label: "화장품", tariffRate: 0.08, simplifiedRate: 0.2, simplifiedMaxUsd: 2000, order: 1, examples: "스킨케어, 메이크업" },
  { id: "clothing", label: "의류", tariffRate: 0.13, simplifiedRate: 0.25, simplifiedMaxUsd: 2000, order: 2, examples: "의류, 신발" },
  { id: "electronics", label: "전자기기", tariffRate: 0.08, simplifiedRate: null, simplifiedMaxUsd: 0, order: 3, examples: "태블릿, 카메라" },
  { id: "bag", label: "가방", tariffRate: 0.08, simplifiedRate: 0.2, simplifiedMaxUsd: 2000, order: 4, examples: "핸드백, 백팩" },
  { id: "watch", label: "시계", tariffRate: 0.08, simplifiedRate: null, simplifiedMaxUsd: 0, order: 5, examples: "시계, 액세서리" },
  { id: "alcohol", label: "주류", tariffRate: 0.3, simplifiedRate: null, simplifiedMaxUsd: 0, order: 6, examples: "와인, 위스키" },
  { id: "tobacco", label: "담배", tariffRate: 0.4, simplifiedRate: null, simplifiedMaxUsd: 0, order: 7, examples: "궐련, 전자담배 스틱" },
  { id: "perfume", label: "향수", tariffRate: 0.08, simplifiedRate: 0.2, simplifiedMaxUsd: 2000, order: 8, examples: "향수, 바디미스트" },
  { id: "food", label: "식품", tariffRate: 0.08, simplifiedRate: 0.2, simplifiedMaxUsd: 2000, order: 9, examples: "건강식품, 초콜릿" },
  { id: "other", label: "기타", tariffRate: 0.08, simplifiedRate: 0.2, simplifiedMaxUsd: 2000, order: 10, examples: "기타 일반 물품" },
];

export function getDutyFreeCategoryInfo(category: DutyFreeCategory): DutyFreeCategoryInfo {
  return DUTY_FREE_CATEGORIES.find((item) => item.id === category) ?? DUTY_FREE_CATEGORIES[0];
}
