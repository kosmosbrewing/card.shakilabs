// 주유 할인카드 데이터
// 공식 페이지에서 직접 확인한 핵심 혜택을 우선 반영하되,
// 구간형 한도/조건은 현재 계산 모델 한계상 대표 구간 기준으로 단순화한다.

export type DiscountType = "perLiter" | "percent" | "cashback";

export interface FuelCardSpendTier {
  minSpend: number;
  monthlyCap: number;
  label?: string;
}

export interface FuelCardDiscount {
  type: DiscountType;
  /** perLiter: 원/L, percent/cashback: 소수 (0.05 = 5%) */
  amount: number;
  /** 월 할인 한도 (원). 0이면 무제한 */
  monthlyCap: number;
  /** 전월 실적 조건 (원). 0이면 무조건 */
  minSpend: number;
  /** 전월 실적 구간별 한도. 없으면 monthlyCap/minSpend 단일값 사용 */
  spendTiers?: FuelCardSpendTier[];
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
    annualFee: 18000,
    discount: {
      type: "perLiter",
      amount: 60,
      monthlyCap: 3000,
      minSpend: 300000,
      spendTiers: [
        { minSpend: 300000, monthlyCap: 3000, label: "30만원 이상 50만원 미만" },
        { minSpend: 500000, monthlyCap: 7000, label: "50만원 이상 100만원 미만" },
        { minSpend: 1000000, monthlyCap: 10000, label: "100만원 이상" },
      ],
      brandRestriction: [],
    },
    extras: ["주말 4대 정유사 리터당 60원", "3대 마트 10% 할인", "전월실적 구간별 한도 3천/7천/1만원"],
  },
  {
    id: "kb-tantandaero",
    issuer: "KB국민",
    issuerColor: "#EAB308",
    name: "탄탄대로 올쇼핑 티타늄",
    annualFee: 30000,
    discount: {
      type: "perLiter",
      amount: 100,
      monthlyCap: 80000,
      minSpend: 400000,
      brandRestriction: [],
    },
    extras: ["공식 페이지에 주유 100원/L 문구 확인", "마트/홈쇼핑/가전 10%", "통신·아파트관리비·도시가스 10%"],
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
    name: "디지로카 Auto",
    annualFee: 30000,
    discount: {
      type: "perLiter",
      amount: 150,
      monthlyCap: 50000,
      minSpend: 500000,
      brandRestriction: [],
    },
    extras: ["리터당 최대 150원 캐시백", "월 최대 5만원", "당월 이용실적 50만원 이상"],
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

export function getFuelCardSpendTiers(card: FuelCard): FuelCardSpendTier[] {
  if (card.discount.spendTiers && card.discount.spendTiers.length > 0) {
    return [...card.discount.spendTiers].sort((a, b) => a.minSpend - b.minSpend);
  }

  return [
    {
      minSpend: card.discount.minSpend,
      monthlyCap: card.discount.monthlyCap,
    },
  ];
}

export function getFuelCardMinimumSpend(card: FuelCard): number {
  return getFuelCardSpendTiers(card)[0]?.minSpend ?? card.discount.minSpend;
}

export function getFuelCardTierForSpend(
  card: FuelCard,
  spending: number,
  fallbackToLowest = false
): FuelCardSpendTier | null {
  const tiers = getFuelCardSpendTiers(card);
  let matched: FuelCardSpendTier | null = null;

  for (const tier of tiers) {
    if (spending >= tier.minSpend) matched = tier;
  }

  if (matched) return matched;
  return fallbackToLowest ? tiers[0] ?? null : null;
}

export function formatFuelCardTierSummary(card: FuelCard): string {
  const tiers = getFuelCardSpendTiers(card);
  if (tiers.length <= 1) {
    return `전월 실적 ${tiers[0]?.minSpend.toLocaleString() ?? 0}원 · 월 한도 ${tiers[0]?.monthlyCap.toLocaleString() ?? 0}원`;
  }

  return tiers
    .map((tier) => `${tier.label ?? `${tier.minSpend.toLocaleString()}원 이상`} 월 ${tier.monthlyCap.toLocaleString()}원`)
    .join(" / ");
}
