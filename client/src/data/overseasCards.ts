// 해외결제 카드 데이터 (2026년 기준, 배포 전 카드사 공식 안내 재확인 권장)

export type CardNetwork = "visa" | "mastercard" | "unionpay" | "jcb";
export type OverseasCardCategory = "credit" | "debit" | "prepaid";

export interface OverseasFee {
  /** 카드사/은행 환전수수료. 0.01 = 1% */
  exchangeFeeRate: number;
  /** 국제브랜드 수수료. 0.01 = 1% */
  networkFeeRate: number;
  totalFeeRate: number;
  networks: CardNetwork[];
}

export interface OverseasBenefit {
  type: "cashback" | "point" | "mileage" | "discount";
  description: string;
  rate: number | null;
  fixedAmount: number | null;
  monthlyCap: number;
  minSpend: number;
}

export interface OverseasCard {
  id: string;
  issuer: string;
  issuerColor: string;
  name: string;
  category: OverseasCardCategory;
  annualFee: number;
  fee: OverseasFee;
  feeCondition?: string;
  benefits: OverseasBenefit[];
  extras: string[];
  summary: string;
}

function buildFee(
  exchangeFeeRate: number,
  networkFeeRate: number,
  networks: CardNetwork[]
): OverseasFee {
  return {
    exchangeFeeRate,
    networkFeeRate,
    totalFeeRate: exchangeFeeRate + networkFeeRate,
    networks,
  };
}

export const OVERSEAS_CARDS: OverseasCard[] = [
  {
    id: "hyundai-zero-edition3",
    issuer: "현대카드",
    issuerColor: "#6B21A8",
    name: "ZERO Edition3",
    category: "credit",
    annualFee: 15000,
    fee: buildFee(0.002, 0.008, ["visa", "mastercard"]),
    benefits: [
      {
        type: "cashback",
        description: "국내외 가맹점 0.8% 청구 할인",
        rate: 0.008,
        fixedAmount: null,
        monthlyCap: 0,
        minSpend: 0,
      },
    ],
    extras: ["전월 이용금액 조건 없음", "할인형/적립형 중 할인형 기준 반영"],
    summary: "전월 실적 없이 해외 결제에도 동일 할인 구조가 적용되는 무실적형 카드",
  },
  {
    id: "shinhan-deep-dream",
    issuer: "신한카드",
    issuerColor: "#1D4ED8",
    name: "Deep Dream",
    category: "credit",
    annualFee: 10000,
    fee: buildFee(0.002, 0.008, ["visa", "mastercard"]),
    benefits: [
      {
        type: "point",
        description: "해외 이용 0.7% 기본 포인트 적립",
        rate: 0.007,
        fixedAmount: null,
        monthlyCap: 0,
        minSpend: 0,
      },
    ],
    extras: ["전월 이용금액 조건 없음", "신한은행 결제계좌 지정 시 0.1% 추가 적립 가능"],
    summary: "기본 적립률은 낮지만 무실적 구조라 해외 결제 기본 카드로 쓰기 쉬운 포인트형 카드",
  },
  {
    id: "kb-wishtone",
    issuer: "KB국민",
    issuerColor: "#EAB308",
    name: "위시톤카드",
    category: "credit",
    annualFee: 15000,
    fee: buildFee(0.002, 0.008, ["visa"]),
    benefits: [
      {
        type: "point",
        description: "해외 이용 0.7% 포인트 적립",
        rate: 0.007,
        fixedAmount: null,
        monthlyCap: 20000,
        minSpend: 400000,
      },
    ],
    extras: ["KB Pay 연동 혜택", "전월 실적 구간 확인 필요"],
    summary: "기본 해외 적립을 제공하지만 실적 조건은 다소 높은 편",
  },
  {
    id: "samsung-taptap-o",
    issuer: "삼성카드",
    issuerColor: "#0369A1",
    name: "taptap O",
    category: "credit",
    annualFee: 10000,
    fee: buildFee(0.002, 0.008, ["mastercard"]),
    benefits: [
      {
        type: "cashback",
        description: "해외 결제 0.5% 캐시백",
        rate: 0.005,
        fixedAmount: null,
        monthlyCap: 15000,
        minSpend: 300000,
      },
    ],
    extras: ["국내 생활 할인과 병행 가능"],
    summary: "해외 특화보다는 범용 생활카드 성격이 강한 편",
  },
  {
    id: "lotte-loca-zero-point",
    issuer: "롯데카드",
    issuerColor: "#DC2626",
    name: "LOCA ZERO POINT",
    category: "credit",
    annualFee: 10000,
    fee: buildFee(0.002, 0.008, ["mastercard"]),
    benefits: [
      {
        type: "point",
        description: "해외 이용 0.7% 포인트 적립",
        rate: 0.007,
        fixedAmount: null,
        monthlyCap: 15000,
        minSpend: 300000,
      },
    ],
    extras: ["실적 조건 단순", "국내 무실적형 카드와 조합 용이"],
    summary: "무난한 수수료와 소폭 적립을 제공하는 기본형 카드",
  },
  {
    id: "hana-travelog-credit",
    issuer: "하나카드",
    issuerColor: "#059669",
    name: "트래블로그 신용",
    category: "credit",
    annualFee: 20000,
    fee: buildFee(0.002, 0.008, ["visa", "mastercard"]),
    feeCondition: "외화 하나머니 결제를 선택하면 해외이용 수수료 면제 가능",
    benefits: [
      {
        type: "point",
        description: "해외 가맹점 3% 적립",
        rate: 0.03,
        fixedAmount: null,
        monthlyCap: 30000,
        minSpend: 400000,
      },
    ],
    extras: ["신용결제 적립과 외화결제 수수료 면제는 설정에 따라 달라짐", "환전/인출 우대", "여행 특화 부가혜택"],
    summary: "설정 방식에 따라 적립형 또는 수수료 절감형으로 쓰는 여행 특화 카드",
  },
  {
    id: "hana-travelog-debit",
    issuer: "하나카드",
    issuerColor: "#0F766E",
    name: "트래블로그 체크카드",
    category: "debit",
    annualFee: 0,
    fee: buildFee(0, 0, ["visa"]),
    benefits: [],
    extras: ["해외 ATM 인출 우대", "여행 자금 분리 관리에 적합"],
    summary: "수수료를 거의 없애는 데 초점을 둔 대표적인 여행 체크카드",
  },
  {
    id: "travel-wallet",
    issuer: "트래블월렛",
    issuerColor: "#7C3AED",
    name: "Travel Wallet",
    category: "prepaid",
    annualFee: 0,
    fee: buildFee(0.001, 0.004, ["mastercard"]),
    benefits: [],
    extras: ["선불 충전형", "환전 스프레드가 낮은 편"],
    summary: "선충전 방식으로 환율 리스크를 관리하기 쉬운 선불카드",
  },
  {
    id: "toss-go",
    issuer: "토스",
    issuerColor: "#2563EB",
    name: "GO 카드",
    category: "debit",
    annualFee: 0,
    fee: buildFee(0, 0, ["mastercard"]),
    benefits: [
      {
        type: "cashback",
        description: "해외 결제 1% 캐시백",
        rate: 0.01,
        fixedAmount: null,
        monthlyCap: 10000,
        minSpend: 0,
      },
    ],
    extras: ["실시간 알림", "앱 기반 잔액 관리"],
    summary: "연회비 없이 수수료 면제와 소액 캐시백을 동시에 노릴 수 있는 카드",
  },
  {
    id: "woori-won-check",
    issuer: "우리카드",
    issuerColor: "#1E40AF",
    name: "우리WON 체크카드",
    category: "debit",
    annualFee: 0,
    fee: buildFee(0, 0, ["visa"]),
    benefits: [],
    extras: ["우리은행 연계 사용 편의"],
    summary: "복잡한 조건 없이 해외 수수료 절감에 집중한 체크카드",
  },
  {
    id: "kakaobank-check",
    issuer: "카카오뱅크",
    issuerColor: "#FACC15",
    name: "프렌즈 체크카드",
    category: "debit",
    annualFee: 0,
    fee: buildFee(0, 0, ["mastercard"]),
    benefits: [],
    extras: ["모바일 뱅킹 연동", "해외이용 알림 편의"],
    summary: "간편한 관리와 수수료 절감이 강점인 모바일 뱅킹 기반 체크카드",
  },
];
