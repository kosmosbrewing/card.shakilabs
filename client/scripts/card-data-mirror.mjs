// Raw calculator inputs mirrored from src/data/*.ts for the prerender step.
//
// This file is a HAND-COPIED MIRROR, not the source. scripts/ is plain .mjs and
// cannot import the typed arrays, so card-insights.mjs reads the copy below.
// src/data/cardDataMirror.test.ts projects the real TypeScript arrays onto the
// same shape and asserts deep equality, so editing a card in src/data without
// updating this file turns the suite red instead of quietly shipping prose that
// contradicts the calculator.
//
// Only the fields the insight engine reads are mirrored. Display-only fields
// (colours, taglines, extras) are left out on purpose so the parity test stays
// about numbers.
//
// NOTE: comments here are intentionally ASCII-only. scripts/ is scanned by
// font-subset-config.mjs and every character becomes part of the shipped font
// subset. Korean strings below are page copy and belong in the subset.

// src/data/annualFeeCards.ts
export const BENEFIT_CATEGORY_LABELS = {
  dining: "외식/배달",
  shopping: "쇼핑/온라인",
  transport: "교통/주유",
  telecom: "통신비",
  housing: "아파트관리비",
  utilities: "공과금/도시가스",
  insurance: "보험료",
  education: "학습지/교육",
  convenience: "편의점/카페",
  travel: "여행/항공",
  culture: "문화/레저",
  general: "기타",
};

export const DEFAULT_SPENDING_PATTERN = {
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

export const ANNUAL_FEE_CARDS = [
  {
    id: "hyundai-m-edition3",
    issuer: "현대카드",
    name: "M Edition3",
    annualFee: 30000,
    minSpend: 500000,
    totalMonthlyCap: null,
    benefitRates: [
      { categoryId: "shopping", rate: 0.015, monthlyCap: 15000 },
      { categoryId: "transport", rate: 0.015, monthlyCap: 12000 },
      { categoryId: "general", rate: 0.01, monthlyCap: 15000 },
    ],
  },
  {
    id: "shinhan-mr-life",
    issuer: "신한카드",
    name: "Mr.Life",
    annualFee: 18000,
    minSpend: 300000,
    totalMonthlyCap: null,
    benefitRates: [
      { categoryId: "convenience", rate: 0.1, monthlyCap: 10000 },
      { categoryId: "telecom", rate: 0.1, monthlyCap: 10000 },
      { categoryId: "dining", rate: 0.05, monthlyCap: 10000 },
      { categoryId: "general", rate: 0.005, monthlyCap: 5000 },
    ],
  },
  {
    id: "kb-tantan-daero",
    issuer: "KB국민카드",
    name: "탄탄대로 올쇼핑 티타늄",
    annualFee: 30000,
    minSpend: 400000,
    totalMonthlyCap: null,
    benefitRates: [
      { categoryId: "shopping", rate: 0.1, monthlyCap: 12000 },
      { categoryId: "telecom", rate: 0.1, monthlyCap: 10000 },
      { categoryId: "housing", rate: 0.1, monthlyCap: 10000 },
      { categoryId: "utilities", rate: 0.1, monthlyCap: 10000 },
      { categoryId: "convenience", rate: 0.05, monthlyCap: 8000 },
    ],
  },
  {
    id: "samsung-taptap-o",
    issuer: "삼성카드",
    name: "taptap O",
    annualFee: 10000,
    minSpend: 300000,
    totalMonthlyCap: null,
    benefitRates: [
      { categoryId: "shopping", rate: 0.07, monthlyCap: 10000 },
      { categoryId: "transport", rate: 0.1, monthlyCap: 7000 },
      { categoryId: "telecom", rate: 0.1, monthlyCap: 7000 },
    ],
  },
  {
    id: "lotte-loca-365",
    issuer: "롯데카드",
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
  },
  {
    id: "hana-1q-daily",
    issuer: "하나카드",
    name: "1Q Daily+",
    annualFee: 12000,
    minSpend: 300000,
    totalMonthlyCap: null,
    benefitRates: [
      { categoryId: "dining", rate: 0.04, monthlyCap: 8000 },
      { categoryId: "convenience", rate: 0.04, monthlyCap: 7000 },
      { categoryId: "shopping", rate: 0.02, monthlyCap: 7000 },
      { categoryId: "general", rate: 0.005, monthlyCap: 4000 },
    ],
  },
  {
    id: "woori-card-ui",
    issuer: "우리카드",
    name: "카드의정석 EVERY MILE",
    annualFee: 39000,
    minSpend: 700000,
    totalMonthlyCap: null,
    benefitRates: [
      { categoryId: "travel", rate: 0.03, monthlyCap: 20000 },
      { categoryId: "general", rate: 0.012, monthlyCap: 18000 },
      { categoryId: "shopping", rate: 0.015, monthlyCap: 12000 },
    ],
  },
  {
    id: "nh-allone",
    issuer: "NH농협카드",
    name: "올원 파이카드",
    annualFee: 15000,
    minSpend: 300000,
    totalMonthlyCap: null,
    benefitRates: [
      { categoryId: "shopping", rate: 0.04, monthlyCap: 9000 },
      { categoryId: "transport", rate: 0.03, monthlyCap: 7000 },
      { categoryId: "culture", rate: 0.03, monthlyCap: 5000 },
      { categoryId: "general", rate: 0.005, monthlyCap: 4000 },
    ],
  },
];

// src/data/overseasCards.ts - fee = exchangeFeeRate + networkFeeRate
export const OVERSEAS_CARDS = [
  {
    id: "hyundai-zero-edition3",
    issuer: "현대카드",
    name: "ZERO Edition3",
    category: "credit",
    annualFee: 15000,
    exchangeFeeRate: 0.002,
    networkFeeRate: 0.008,
    hasFeeCondition: false,
    benefits: [{ rate: 0.008, fixedAmount: null, monthlyCap: 0, minSpend: 0 }],
  },
  {
    id: "shinhan-deep-dream",
    issuer: "신한카드",
    name: "Deep Dream",
    category: "credit",
    annualFee: 10000,
    exchangeFeeRate: 0.002,
    networkFeeRate: 0.008,
    hasFeeCondition: false,
    benefits: [{ rate: 0.007, fixedAmount: null, monthlyCap: 0, minSpend: 0 }],
  },
  {
    id: "kb-wishtone",
    issuer: "KB국민",
    name: "위시톤카드",
    category: "credit",
    annualFee: 15000,
    exchangeFeeRate: 0.002,
    networkFeeRate: 0.008,
    hasFeeCondition: false,
    benefits: [{ rate: 0.007, fixedAmount: null, monthlyCap: 20000, minSpend: 400000 }],
  },
  {
    id: "samsung-taptap-o",
    issuer: "삼성카드",
    name: "taptap O",
    category: "credit",
    annualFee: 10000,
    exchangeFeeRate: 0.002,
    networkFeeRate: 0.008,
    hasFeeCondition: false,
    benefits: [{ rate: 0.005, fixedAmount: null, monthlyCap: 15000, minSpend: 300000 }],
  },
  {
    id: "lotte-loca-zero-point",
    issuer: "롯데카드",
    name: "LOCA ZERO POINT",
    category: "credit",
    annualFee: 10000,
    exchangeFeeRate: 0.002,
    networkFeeRate: 0.008,
    hasFeeCondition: false,
    benefits: [{ rate: 0.007, fixedAmount: null, monthlyCap: 15000, minSpend: 300000 }],
  },
  {
    id: "hana-travelog-credit",
    issuer: "하나카드",
    name: "트래블로그 신용",
    category: "credit",
    annualFee: 20000,
    exchangeFeeRate: 0.002,
    networkFeeRate: 0.008,
    hasFeeCondition: true,
    benefits: [{ rate: 0.03, fixedAmount: null, monthlyCap: 30000, minSpend: 400000 }],
  },
  {
    id: "hana-travelog-debit",
    issuer: "하나카드",
    name: "트래블로그 체크카드",
    category: "debit",
    annualFee: 0,
    exchangeFeeRate: 0,
    networkFeeRate: 0,
    hasFeeCondition: false,
    benefits: [],
  },
  {
    id: "travel-wallet",
    issuer: "트래블월렛",
    name: "Travel Wallet",
    category: "prepaid",
    annualFee: 0,
    exchangeFeeRate: 0.001,
    networkFeeRate: 0.004,
    hasFeeCondition: false,
    benefits: [],
  },
  {
    id: "toss-go",
    issuer: "토스",
    name: "GO 카드",
    category: "debit",
    annualFee: 0,
    exchangeFeeRate: 0,
    networkFeeRate: 0,
    hasFeeCondition: false,
    benefits: [{ rate: 0.01, fixedAmount: null, monthlyCap: 10000, minSpend: 0 }],
  },
  {
    id: "woori-won-check",
    issuer: "우리카드",
    name: "우리WON 체크카드",
    category: "debit",
    annualFee: 0,
    exchangeFeeRate: 0,
    networkFeeRate: 0,
    hasFeeCondition: false,
    benefits: [],
  },
  {
    id: "kakaobank-check",
    issuer: "카카오뱅크",
    name: "프렌즈 체크카드",
    category: "debit",
    annualFee: 0,
    exchangeFeeRate: 0,
    networkFeeRate: 0,
    hasFeeCondition: false,
    benefits: [],
  },
];

// src/data/exchangeRates.ts fallback (KRW per unit) and DCC markup
export const EXCHANGE_RATES_UPDATED_AT = "2026-03-09";
export const EXCHANGE_RATES = [
  { currency: "USD", label: "미국 달러", rate: 1380, unit: 1 },
  { currency: "EUR", label: "유로", rate: 1498, unit: 1 },
  { currency: "JPY", label: "일본 엔", rate: 918, unit: 100 },
  { currency: "GBP", label: "영국 파운드", rate: 1748, unit: 1 },
  { currency: "CNY", label: "중국 위안", rate: 191, unit: 1 },
  { currency: "THB", label: "태국 바트", rate: 39.4, unit: 1 },
  { currency: "VND", label: "베트남 동", rate: 5.42, unit: 100 },
  { currency: "TWD", label: "대만 달러", rate: 42.1, unit: 1 },
  { currency: "SGD", label: "싱가포르 달러", rate: 1025, unit: 1 },
  { currency: "AUD", label: "호주 달러", rate: 904, unit: 1 },
];
export const DCC_MARKUP = { typicalMinRate: 0.03, typicalMaxRate: 0.08, defaultRate: 0.05 };

// src/data/fuelCards.ts
export const FUEL_CARDS = [
  {
    id: "hyundai-o",
    issuer: "현대카드",
    name: "현대카드 O",
    annualFee: 20000,
    discount: {
      type: "percent",
      amount: 0.1,
      monthlyCap: 10000,
      minSpend: 400000,
      spendTiers: [
        { minSpend: 400000, monthlyCap: 10000 },
        { minSpend: 800000, monthlyCap: 20000 },
        { minSpend: 1200000, monthlyCap: 35000 },
      ],
      brandRestriction: [],
    },
  },
  {
    id: "shinhan-mycar",
    issuer: "신한카드",
    name: "MY CAR",
    annualFee: 15000,
    discount: { type: "perLiter", amount: 80, monthlyCap: 10000, minSpend: 400000, spendTiers: null, brandRestriction: [] },
  },
  {
    id: "kb-tantandaero",
    issuer: "KB국민",
    name: "탄탄대로 올쇼핑 티타늄",
    annualFee: 30000,
    discount: { type: "perLiter", amount: 100, monthlyCap: 80000, minSpend: 400000, spendTiers: null, brandRestriction: [] },
  },
  {
    id: "samsung-soil",
    issuer: "삼성카드",
    name: "S-Oil 삼성카드",
    annualFee: 12000,
    discount: { type: "perLiter", amount: 80, monthlyCap: 80000, minSpend: 300000, spendTiers: null, brandRestriction: ["S-Oil"] },
  },
  {
    id: "lotte-auto",
    issuer: "롯데카드",
    name: "디지로카 Auto",
    annualFee: 30000,
    discount: { type: "perLiter", amount: 150, monthlyCap: 50000, minSpend: 500000, spendTiers: null, brandRestriction: [] },
  },
  {
    id: "hana-1q",
    issuer: "하나카드",
    name: "1Q카드",
    annualFee: 10000,
    discount: { type: "cashback", amount: 0.03, monthlyCap: 50000, minSpend: 200000, spendTiers: null, brandRestriction: [] },
  },
];

// src/data/fuelPrices.ts fallback (Opinet national average)
export const FUEL_PRICES = { lastUpdated: "2026-03-02", gasoline: 1707, diesel: 1612, lpg: 1012 };
export const FUEL_TYPE_LABELS = { gasoline: "휘발유", diesel: "경유", lpg: "LPG" };

// src/data/spendingCategories.ts defaults (the /min-spend household budget)
export const MIN_SPEND_DEFAULTS = {
  groceries: 300000,
  transport: 100000,
  telecom: 70000,
  utilities: 80000,
  insurance: 70000,
  shopping: 150000,
  other: 100000,
};

// src/data/mileageData.ts
export const MILEAGE_VERIFIED_AT = "2026-07-10";
export const MILEAGE_ROUTES = [
  { id: "japan", label: "한일", economy: 180000, business: 520000, first: 900000 },
  { id: "china", label: "한중", economy: 220000, business: 640000, first: 1050000 },
  { id: "southeast-asia", label: "동남아", economy: 380000, business: 1400000, first: 2200000 },
  { id: "hawaii", label: "하와이", economy: 720000, business: 2600000, first: 3900000 },
  { id: "usa", label: "미주", economy: 950000, business: 3800000, first: 5400000 },
  { id: "europe", label: "유럽", economy: 1150000, business: 4200000, first: 6200000 },
];
export const MILEAGE_REDEMPTIONS = {
  "korean-air": {
    japan: { economy: 30000, business: 45000, first: 65000 },
    china: { economy: 30000, business: 45000, first: 65000 },
    "southeast-asia": { economy: 40000, business: 70000, first: 90000 },
    hawaii: { economy: 70000, business: 125000, first: 160000 },
    usa: { economy: 70000, business: 125000, first: 160000 },
    europe: { economy: 70000, business: 125000, first: 160000 },
  },
  asiana: {
    japan: { economy: 30000, business: 45000, first: 50000 },
    china: { economy: 30000, business: 45000, first: 50000 },
    "southeast-asia": { economy: 40000, business: 60000, first: 70000 },
    hawaii: { economy: 70000, business: 105000, first: 125000 },
    usa: { economy: 70000, business: 105000, first: 125000 },
    europe: { economy: 70000, business: 105000, first: 125000 },
  },
};
export const AIRLINE_NAMES = { "korean-air": "대한항공", asiana: "아시아나항공" };

// src/data/dutyFreeRates.ts
export const DUTY_FREE_CONSTANTS = { exemptionLimitUsd: 800, vatRate: 0.1, exchangeRate: 1380 };
// Date prefix of DUTY_FREE_CONSTANTS.lastUpdated ("2026-07-10 검증")
export const DUTY_FREE_VERIFIED_AT = "2026-07-10";
export const DUTY_FREE_CATEGORIES = [
  { id: "cosmetics", label: "화장품", tariffRate: 0.08, simplifiedRate: 0.2, simplifiedMaxUsd: 2000 },
  { id: "clothing", label: "의류", tariffRate: 0.13, simplifiedRate: 0.25, simplifiedMaxUsd: 2000 },
  { id: "electronics", label: "전자기기", tariffRate: 0.08, simplifiedRate: null, simplifiedMaxUsd: 0 },
  { id: "bag", label: "가방", tariffRate: 0.08, simplifiedRate: 0.2, simplifiedMaxUsd: 2000 },
  { id: "watch", label: "시계", tariffRate: 0.08, simplifiedRate: null, simplifiedMaxUsd: 0 },
  { id: "alcohol", label: "주류", tariffRate: 0.3, simplifiedRate: null, simplifiedMaxUsd: 0 },
  { id: "tobacco", label: "담배", tariffRate: 0.4, simplifiedRate: null, simplifiedMaxUsd: 0 },
  { id: "perfume", label: "향수", tariffRate: 0.08, simplifiedRate: 0.2, simplifiedMaxUsd: 2000 },
  { id: "food", label: "식품", tariffRate: 0.08, simplifiedRate: 0.2, simplifiedMaxUsd: 2000 },
  { id: "other", label: "기타", tariffRate: 0.08, simplifiedRate: 0.2, simplifiedMaxUsd: 2000 },
];

// src/data/cardTabData.ts
export const POINT_PROGRAMS = [
  { key: "korean-air", label: "대한항공 마일", pointsPerUnit: 1, unitValueWon: 18 },
  { key: "asiana", label: "아시아나 마일", pointsPerUnit: 1, unitValueWon: 16 },
  { key: "hotel", label: "호텔 포인트", pointsPerUnit: 1.5, unitValueWon: 14 },
  { key: "cash", label: "현금성 포인트", pointsPerUnit: 1, unitValueWon: 1 },
];
export const BILLING_DAY_OPTIONS = [1, 5, 10, 12, 14, 20, 25, 27];
export const CARD_CUSTOMS_CATEGORIES = [
  { key: "electronics", label: "전자기기", tariffRate: 0.08, thresholdUsd: 150 },
  { key: "fashion", label: "의류·신발", tariffRate: 0.13, thresholdUsd: 150 },
  { key: "golf", label: "골프용품", tariffRate: 0.2, thresholdUsd: 150 },
];

// Engine constants that live inside src/utils/*.ts rather than in a data file.
// cardTabCalculator.ts: calculateBillingCycle assumes a 31-day month and a
// 14-day grace period; calculateCustoms hard-codes 1,340 KRW/USD and 10% VAT.
export const BILLING_MODEL = { monthDays: 31, graceDays: 14 };
export const CUSTOMS_MODEL = { exchangeRate: 1340, vatRate: 0.1 };
// annualFeeCalculator.ts caps the displayed break-even at 120 months.
export const ANNUAL_FEE_MAX_BREAK_EVEN_MONTHS = 120;
