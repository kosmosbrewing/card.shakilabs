// 주유 할인카드 데이터 (2026년 기준, 배포 전 카드사 공식 사이트에서 재검증 필수)

export type DiscountType = "perLiter" | "percent" | "cashback";

export interface FuelCardDiscount {
  type: DiscountType;
  /** perLiter: 원/L, percent/cashback: 소수 (0.05 = 5%) */
  amount: number;
  /** 월 할인 한도 (원). 0이면 무제한 */
  monthlyCap: number;
  /** 전월 실적 조건 (원). 0이면 무조건 */
  minSpend: number;
  /** 특정 주유소만 해당. 빈 배열이면 전체 */
  brandRestriction: string[];
}

export interface FuelCard {
  id: string;
  issuer: string;
  issuerColor: string;
  name: string;
  /** 연회비 (원) */
  annualFee: number;
  discount: FuelCardDiscount;
  /** 추가 혜택 (참고용 텍스트) */
  extras: string[];
}

export const FUEL_CARDS: FuelCard[] = [
  {
    id: "hyundai-m-edition3",
    issuer: "현대카드",
    issuerColor: "#6B21A8",
    name: "M Edition3",
    annualFee: 15000,
    discount: {
      type: "perLiter",
      amount: 80,
      monthlyCap: 100000,
      minSpend: 300000,
      brandRestriction: [],
    },
    extras: ["대중교통 10%", "통신비 할인"],
  },
  {
    id: "shinhan-mrlife",
    issuer: "신한카드",
    issuerColor: "#1D4ED8",
    name: "Mr.Life",
    annualFee: 15000,
    discount: {
      type: "perLiter",
      amount: 60,
      monthlyCap: 60000,
      minSpend: 300000,
      brandRestriction: [],
    },
    extras: ["편의점 할인", "카페 할인"],
  },
  {
    id: "kb-tantandaero",
    issuer: "KB국민",
    issuerColor: "#EAB308",
    name: "탄탄대로 티타늄",
    annualFee: 10000,
    discount: {
      type: "perLiter",
      amount: 100,
      monthlyCap: 80000,
      minSpend: 400000,
      brandRestriction: ["SK에너지"],
    },
    extras: ["생활 할인"],
  },
  {
    id: "samsung-soil",
    issuer: "삼성카드",
    issuerColor: "#0369A1",
    name: "S-Oil 삼성카드",
    annualFee: 12000,
    discount: {
      type: "perLiter",
      amount: 80,
      monthlyCap: 80000,
      minSpend: 300000,
      brandRestriction: ["S-Oil"],
    },
    extras: ["S-Oil 보너스 포인트"],
  },
  {
    id: "lotte-auto",
    issuer: "롯데카드",
    issuerColor: "#DC2626",
    name: "오토카드",
    annualFee: 10000,
    discount: {
      type: "percent",
      amount: 0.05,
      monthlyCap: 50000,
      minSpend: 300000,
      brandRestriction: [],
    },
    extras: ["자동차 정비 할인", "주차장 할인"],
  },
  {
    id: "hana-1q",
    issuer: "하나카드",
    issuerColor: "#059669",
    name: "1Q카드",
    annualFee: 10000,
    discount: {
      type: "cashback",
      amount: 0.03,
      monthlyCap: 50000,
      minSpend: 200000,
      brandRestriction: [],
    },
    extras: ["온라인쇼핑 캐시백"],
  },
];

/** 카드사 slug → 카드 ID 매핑 (SEO 페이지용) */
export const ISSUER_SLUG_MAP: Record<string, string[]> = {
  hyundai: ["hyundai-m-edition3"],
  shinhan: ["shinhan-mrlife"],
  kb: ["kb-tantandaero"],
  samsung: ["samsung-soil"],
  lotte: ["lotte-auto"],
  hana: ["hana-1q"],
};

/** slug → 카드사 표시명 */
export const ISSUER_DISPLAY_NAME: Record<string, string> = {
  hyundai: "현대카드",
  shinhan: "신한카드",
  kb: "KB국민카드",
  samsung: "삼성카드",
  lotte: "롯데카드",
  hana: "하나카드",
};
