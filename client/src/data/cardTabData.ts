export interface PointProgram {
  key: string;
  label: string;
  pointsPerUnit: number;
  unitLabel: string;
  unitValueWon: number;
  note: string;
}

export interface CustomsCategory {
  key: string;
  label: string;
  tariffRate: number;
  thresholdUsd: number;
}

export const CARD_TOOL_UPDATED_AT = "2026-03-16";

export const POINT_PROGRAMS: PointProgram[] = [
  { key: "korean-air", label: "대한항공 마일", pointsPerUnit: 1, unitLabel: "마일", unitValueWon: 18, note: "장거리 이코노미 기준" },
  { key: "asiana", label: "아시아나 마일", pointsPerUnit: 1, unitLabel: "마일", unitValueWon: 16, note: "국제선 보너스 평균" },
  { key: "hotel", label: "호텔 포인트", pointsPerUnit: 1.5, unitLabel: "포인트", unitValueWon: 14, note: "중급 호텔 숙박 기준" },
  { key: "cash", label: "현금성 포인트", pointsPerUnit: 1, unitLabel: "원", unitValueWon: 1, note: "즉시 차감 기준" },
];

export const BILLING_DAY_OPTIONS = [1, 5, 10, 12, 14, 20, 25, 27] as const;

export const CARD_CUSTOMS_CATEGORIES: CustomsCategory[] = [
  { key: "electronics", label: "전자기기", tariffRate: 0.08, thresholdUsd: 150 },
  { key: "fashion", label: "의류·신발", tariffRate: 0.13, thresholdUsd: 150 },
  { key: "golf", label: "골프용품", tariffRate: 0.2, thresholdUsd: 150 },
];
