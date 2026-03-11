export type BenefitCategoryId =
  | "dining"
  | "shopping"
  | "transport"
  | "convenience"
  | "telecom"
  | "travel"
  | "culture"
  | "general";

export interface BenefitCategory {
  id: BenefitCategoryId;
  label: string;
  placeholder: string;
  order: number;
}

export const BENEFIT_CATEGORIES: BenefitCategory[] = [
  { id: "dining", label: "외식/배달", placeholder: "배달앱, 레스토랑 등", order: 1 },
  { id: "shopping", label: "쇼핑/온라인", placeholder: "쿠팡, 의류 등", order: 2 },
  { id: "transport", label: "교통/주유", placeholder: "대중교통, 택시, 주유", order: 3 },
  { id: "convenience", label: "편의점/카페", placeholder: "CU, 스타벅스 등", order: 4 },
  { id: "telecom", label: "통신비", placeholder: "핸드폰, 인터넷", order: 5 },
  { id: "travel", label: "여행/항공", placeholder: "항공권, 호텔 등", order: 6 },
  { id: "culture", label: "문화/레저", placeholder: "영화, OTT, 공연", order: 7 },
  { id: "general", label: "기타", placeholder: "그 외 카드 결제", order: 8 },
];

export type SpendingPatternMap = Record<BenefitCategoryId, number>;

export interface CardBenefitRate {
  categoryId: BenefitCategoryId;
  rate: number;
  monthlyCap: number;
}

export interface AnnualFeeCard {
  id: string;
  issuer: string;
  issuerColor: string;
  name: string;
  annualFee: number;
  minSpend: number;
  benefitRates: CardBenefitRate[];
  extras: string[];
  summary: string;
}

export function createDefaultSpendingPattern(): SpendingPatternMap {
  return {
    dining: 220000,
    shopping: 180000,
    transport: 120000,
    convenience: 80000,
    telecom: 70000,
    travel: 40000,
    culture: 40000,
    general: 150000,
  };
}

export function sumSpendingPattern(spending: SpendingPatternMap): number {
  return Object.values(spending).reduce((sum, amount) => sum + amount, 0);
}

export const ANNUAL_FEE_CARDS: AnnualFeeCard[] = [
  {
    id: "hyundai-m-edition3",
    issuer: "현대카드",
    issuerColor: "#111827",
    name: "M Edition3",
    annualFee: 30000,
    minSpend: 500000,
    benefitRates: [
      { categoryId: "shopping", rate: 0.015, monthlyCap: 15000 },
      { categoryId: "transport", rate: 0.015, monthlyCap: 12000 },
      { categoryId: "general", rate: 0.01, monthlyCap: 15000 },
    ],
    extras: ["M포인트 적립형", "기본 생활 결제 커버"],
    summary: "온라인 쇼핑과 일반 결제를 넓게 묶어 연회비를 회수하기 쉬운 범용형 카드",
  },
  {
    id: "shinhan-mr-life",
    issuer: "신한카드",
    issuerColor: "#2563eb",
    name: "Mr.Life",
    annualFee: 18000,
    minSpend: 300000,
    benefitRates: [
      { categoryId: "convenience", rate: 0.1, monthlyCap: 10000 },
      { categoryId: "telecom", rate: 0.1, monthlyCap: 10000 },
      { categoryId: "dining", rate: 0.05, monthlyCap: 10000 },
      { categoryId: "general", rate: 0.005, monthlyCap: 5000 },
    ],
    extras: ["공과금/통신 강점", "생활밀착형"],
    summary: "통신비와 편의점, 식비가 꾸준한 사용자에게 회수 속도가 빠른 생활비 특화 카드",
  },
  {
    id: "kb-tantan-daero",
    issuer: "KB국민카드",
    issuerColor: "#f59e0b",
    name: "탄탄대로 올쇼핑",
    annualFee: 20000,
    minSpend: 400000,
    benefitRates: [
      { categoryId: "shopping", rate: 0.07, monthlyCap: 12000 },
      { categoryId: "convenience", rate: 0.05, monthlyCap: 8000 },
      { categoryId: "general", rate: 0.005, monthlyCap: 5000 },
    ],
    extras: ["쇼핑 집중형", "생활 업종 보조 할인"],
    summary: "온라인 쇼핑 비중이 높은 사용자에게 연회비 회수 효율이 높은 카드",
  },
  {
    id: "samsung-taptap-o",
    issuer: "삼성카드",
    issuerColor: "#1d4ed8",
    name: "taptap O",
    annualFee: 10000,
    minSpend: 300000,
    benefitRates: [
      { categoryId: "shopping", rate: 0.03, monthlyCap: 10000 },
      { categoryId: "transport", rate: 0.03, monthlyCap: 7000 },
      { categoryId: "dining", rate: 0.03, monthlyCap: 7000 },
      { categoryId: "culture", rate: 0.05, monthlyCap: 5000 },
    ],
    extras: ["낮은 연회비", "균형형 포인트"],
    summary: "연회비가 낮아 회수 기간이 짧고, 여러 생활 영역에 고르게 분산된 카드",
  },
  {
    id: "lotte-loca-365",
    issuer: "롯데카드",
    issuerColor: "#ef4444",
    name: "LOCA 365",
    annualFee: 20000,
    minSpend: 500000,
    benefitRates: [
      { categoryId: "telecom", rate: 0.1, monthlyCap: 12000 },
      { categoryId: "transport", rate: 0.05, monthlyCap: 10000 },
      { categoryId: "convenience", rate: 0.05, monthlyCap: 8000 },
      { categoryId: "general", rate: 0.005, monthlyCap: 4000 },
    ],
    extras: ["고정지출 최적화", "통신/교통 강점"],
    summary: "통신비와 교통비 같은 고정지출이 많은 경우 연회비 회수 예측이 쉬운 카드",
  },
  {
    id: "hana-1q-daily",
    issuer: "하나카드",
    issuerColor: "#16a34a",
    name: "1Q Daily+",
    annualFee: 12000,
    minSpend: 300000,
    benefitRates: [
      { categoryId: "dining", rate: 0.04, monthlyCap: 8000 },
      { categoryId: "convenience", rate: 0.04, monthlyCap: 7000 },
      { categoryId: "shopping", rate: 0.02, monthlyCap: 7000 },
      { categoryId: "general", rate: 0.005, monthlyCap: 4000 },
    ],
    extras: ["데일리 업종 분산", "낮은 진입 장벽"],
    summary: "외식과 카페, 온라인 소비가 적절히 섞여 있는 사용자에게 무난한 회수 효율을 제공",
  },
  {
    id: "woori-card-ui",
    issuer: "우리카드",
    issuerColor: "#0ea5e9",
    name: "카드의정석 EVERY MILE",
    annualFee: 39000,
    minSpend: 700000,
    benefitRates: [
      { categoryId: "travel", rate: 0.03, monthlyCap: 20000 },
      { categoryId: "general", rate: 0.012, monthlyCap: 18000 },
      { categoryId: "shopping", rate: 0.015, monthlyCap: 12000 },
    ],
    extras: ["여행/일반결제 밸런스", "고연회비 프리미엄"],
    summary: "여행 지출과 일반 결제가 큰 사용자가 프리미엄 연회비를 회수하기 위한 선택지",
  },
  {
    id: "nh-allone",
    issuer: "NH농협카드",
    issuerColor: "#22c55e",
    name: "올원 파이카드",
    annualFee: 15000,
    minSpend: 300000,
    benefitRates: [
      { categoryId: "shopping", rate: 0.04, monthlyCap: 9000 },
      { categoryId: "transport", rate: 0.03, monthlyCap: 7000 },
      { categoryId: "culture", rate: 0.03, monthlyCap: 5000 },
      { categoryId: "general", rate: 0.005, monthlyCap: 4000 },
    ],
    extras: ["쇼핑 + 교통 조합", "무난한 생활형"],
    summary: "쇼핑과 교통비를 동시에 쓰는 사용자에게 연회비 대비 안정적인 수익을 주는 카드",
  },
];
