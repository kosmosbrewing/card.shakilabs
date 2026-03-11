export const SUPPORTED_CURRENCIES = [
  "USD",
  "EUR",
  "JPY",
  "GBP",
  "CNY",
  "THB",
  "VND",
  "TWD",
  "SGD",
  "AUD",
] as const;

export const POPULAR_CURRENCIES = [
  "USD",
  "EUR",
  "JPY",
  "THB",
  "VND",
  "CNY",
] as const;

export const EXTRA_CURRENCIES = ["GBP", "TWD", "SGD", "AUD"] as const;
export const SEO_CURRENCIES = ["USD", "EUR", "JPY", "GBP", "CNY", "THB", "VND"] as const;

export type Currency = (typeof SUPPORTED_CURRENCIES)[number];

export interface ExchangeRateEntry {
  currency: Currency;
  label: string;
  symbol: string;
  /** KRW per unit. JPY/VND는 100단위 */
  rate: number;
  unit: number;
}

export interface ExchangeRateData {
  lastUpdated: string;
  source: string;
  rates: ExchangeRateEntry[];
}

export interface DCCMarkupData {
  typicalMinRate: number;
  typicalMaxRate: number;
  defaultRate: number;
  source: string;
}

export const EXCHANGE_RATES: ExchangeRateData = {
  lastUpdated: "2026-03-09",
  source: "서울외국환중개 매매기준율 참고, 서비스 내 수동 업데이트",
  rates: [
    { currency: "USD", label: "미국 달러", symbol: "$", rate: 1380, unit: 1 },
    { currency: "EUR", label: "유로", symbol: "€", rate: 1498, unit: 1 },
    { currency: "JPY", label: "일본 엔", symbol: "¥", rate: 918, unit: 100 },
    { currency: "GBP", label: "영국 파운드", symbol: "£", rate: 1748, unit: 1 },
    { currency: "CNY", label: "중국 위안", symbol: "¥", rate: 191, unit: 1 },
    { currency: "THB", label: "태국 바트", symbol: "฿", rate: 39.4, unit: 1 },
    { currency: "VND", label: "베트남 동", symbol: "₫", rate: 5.42, unit: 100 },
    { currency: "TWD", label: "대만 달러", symbol: "NT$", rate: 42.1, unit: 1 },
    { currency: "SGD", label: "싱가포르 달러", symbol: "S$", rate: 1025, unit: 1 },
    { currency: "AUD", label: "호주 달러", symbol: "A$", rate: 904, unit: 1 },
  ],
};

export const DCC_MARKUP: DCCMarkupData = {
  typicalMinRate: 0.03,
  typicalMaxRate: 0.08,
  defaultRate: 0.05,
  source: "국제브랜드/카드사 해외결제 안내 기반 일반적인 DCC 마크업 범위",
};

export function getExchangeRate(currency: Currency): ExchangeRateEntry {
  return (
    EXCHANGE_RATES.rates.find((entry) => entry.currency === currency) ??
    EXCHANGE_RATES.rates[0]
  );
}

export function getCurrencyQueryValue(currency: Currency): Lowercase<Currency> {
  return currency.toLowerCase() as Lowercase<Currency>;
}

export function parseCurrencyQueryValue(value: string | null | undefined): Currency | null {
  if (!value) return null;
  const normalized = value.trim().toUpperCase();
  return SUPPORTED_CURRENCIES.find((currency) => currency === normalized) ?? null;
}
