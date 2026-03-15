export type BenefitCategoryId =
  | "dining"
  | "shopping"
  | "transport"
  | "convenience"
  | "telecom"
  | "housing"
  | "utilities"
  | "insurance"
  | "education"
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
  { id: "telecom", label: "통신비", placeholder: "핸드폰, 인터넷", order: 4 },
  { id: "housing", label: "아파트관리비", placeholder: "공동관리비", order: 5 },
  { id: "utilities", label: "공과금/도시가스", placeholder: "전기, 가스, 수도", order: 6 },
  { id: "insurance", label: "보험료", placeholder: "자동차, 실손 등", order: 7 },
  { id: "education", label: "학습지/교육", placeholder: "학습지, 교육비", order: 8 },
  { id: "convenience", label: "편의점/카페", placeholder: "CU, 스타벅스 등", order: 9 },
  { id: "travel", label: "여행/항공", placeholder: "항공권, 호텔 등", order: 10 },
  { id: "culture", label: "문화/레저", placeholder: "영화, OTT, 공연", order: 11 },
  { id: "general", label: "기타", placeholder: "그 외 카드 결제", order: 12 },
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
  totalMonthlyCap?: number;
  extras: string[];
  summary: string;
}

export function createDefaultSpendingPattern(): SpendingPatternMap {
  return {
    dining: 220000,
    shopping: 180000,
    transport: 120000,
    telecom: 70000,
    housing: 120000,
    utilities: 90000,
    insurance: 80000,
    education: 50000,
    convenience: 80000,
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
    name: "탄탄대로 올쇼핑 티타늄",
    annualFee: 30000,
    minSpend: 400000,
    benefitRates: [
      { categoryId: "shopping", rate: 0.1, monthlyCap: 12000 },
      { categoryId: "telecom", rate: 0.1, monthlyCap: 10000 },
      { categoryId: "housing", rate: 0.1, monthlyCap: 10000 },
      { categoryId: "utilities", rate: 0.1, monthlyCap: 10000 },
      { categoryId: "convenience", rate: 0.05, monthlyCap: 8000 },
    ],
    extras: ["마트·홈쇼핑·가전 10%", "통신·아파트관리비·도시가스 10%", "편의점·커피 5%"],
    summary: "쇼핑과 통신·관리비 비중이 큰 사용자에게 유리한 생활비 특화 카드",
  },
  {
    id: "samsung-taptap-o",
    issuer: "삼성카드",
    issuerColor: "#1d4ed8",
    name: "taptap O",
    annualFee: 10000,
    minSpend: 300000,
    benefitRates: [
      { categoryId: "shopping", rate: 0.07, monthlyCap: 10000 },
      { categoryId: "transport", rate: 0.1, monthlyCap: 7000 },
      { categoryId: "telecom", rate: 0.1, monthlyCap: 7000 },
    ],
    extras: ["스타벅스 50%", "쇼핑 7% 할인", "영화 5천원 할인"],
    summary: "쇼핑과 교통·통신 혜택을 직접 선택해 쓰는 옵션형 생활 카드",
  },
  {
    id: "lotte-loca-365",
    issuer: "롯데카드",
    issuerColor: "#ef4444",
    name: "LOCA 365",
    annualFee: 20000,
    minSpend: 500000,
    totalMonthlyCap: 35000,
    benefitRates: [
      { categoryId: "telecom", rate: 0.1, monthlyCap: 12000 },
      { categoryId: "transport", rate: 0.1, monthlyCap: 10000 },
      { categoryId: "housing", rate: 0.1, monthlyCap: 12000 },
      { categoryId: "utilities", rate: 0.1, monthlyCap: 10000 },
      { categoryId: "insurance", rate: 0.1, monthlyCap: 10000 },
      { categoryId: "education", rate: 0.1, monthlyCap: 10000 },
      { categoryId: "dining", rate: 0.1, monthlyCap: 8000 },
    ],
    extras: ["아파트관리비·공과금·이동통신 10%", "대중교통·보험료·학습지 10%", "배달앱은 외식/배달 입력값에 반영", "월 통합한도 35,000원"],
    summary: "고정지출과 생활비를 넓게 묶어 회수하는 데 유리한 생활비 카드",
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
