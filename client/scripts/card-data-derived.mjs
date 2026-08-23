// Numbers derived from src/data/{fuelCards,overseasCards,annualFeeCards}.ts.
//
// This file is a HAND-COPIED MIRROR, not the source. scripts/ is plain .mjs and
// cannot import the typed card arrays, so the prerender templates read the copy
// below while src/data/cardDataScope.ts computes the same values from the real
// arrays. src/data/cardDataScope.test.ts asserts the two are deeply equal, so
// editing a card without updating this file turns the suite red instead of
// quietly shipping prose that contradicts the calculator.
//
// NOTE: comments here are intentionally ASCII-only. scripts/ is scanned by
// font-subset-config.mjs and every character becomes part of the shipped font
// subset. The Korean strings below are page copy and belong in the subset; a
// Korean comment would not.

// Spend at which a card's headline discount rate stops mattering:
// monthlyCap / rate. Sorted ascending, ties keep the ANNUAL_FEE_CARDS order.
export const CAP_THRESHOLDS = [
  { card: "삼성카드 taptap O", category: "교통/주유", rate: "10", monthlyCap: 7000, capAtSpend: 70000 },
  { card: "신한카드 Mr.Life", category: "편의점/카페", rate: "10", monthlyCap: 10000, capAtSpend: 100000 },
  { card: "KB국민카드 탄탄대로 올쇼핑 티타늄", category: "쇼핑/온라인", rate: "10", monthlyCap: 12000, capAtSpend: 120000 },
  { card: "롯데카드 LOCA 365", category: "통신비", rate: "10", monthlyCap: 12000, capAtSpend: 120000 },
  { card: "하나카드 1Q Daily+", category: "외식/배달", rate: "4", monthlyCap: 8000, capAtSpend: 200000 },
  { card: "NH농협카드 올원 파이카드", category: "쇼핑/온라인", rate: "4", monthlyCap: 9000, capAtSpend: 225000 },
  { card: "우리카드 카드의정석 EVERY MILE", category: "여행/항공", rate: "3", monthlyCap: 20000, capAtSpend: 666667 },
  { card: "현대카드 M Edition3", category: "쇼핑/온라인", rate: "1.5", monthlyCap: 15000, capAtSpend: 1000000 },
];

// How many of the cards above hit their cap at 200,000 KRW/month or less.
export const CAP_BINDS_UNDER_200K = 5;

// What each calculator actually compares, for the /all directory.
export const DATA_SCOPE_ROWS = [
  {
    path: "/fuel-card",
    label: "주유 할인카드",
    count: 6,
    detail:
      "연회비 10,000~30,000원, 전월 실적 200,000~500,000원, 월 할인 한도 10,000~80,000원입니다. " +
      "할인 방식은 정률·리터당 정액·캐시백 3가지이며, 전월 실적 구간마다 한도가 달라지는 카드가 1장, " +
      "특정 주유소 브랜드에서만 할인되는 카드가 1장 있습니다.",
  },
  {
    path: "/overseas-payment",
    label: "해외결제 카드",
    count: 11,
    detail:
      "신용 6장·체크 4장·선불 1장이며, 환전수수료와 국제브랜드 수수료를 더한 총수수료가 0%에서 1%까지 벌어집니다. " +
      "해외에서 100만원을 결제하면 카드 선택만으로 수수료가 10,000원 갈린다는 뜻입니다. " +
      "연회비가 없는 카드는 5장입니다.",
  },
  {
    path: "/annual-fee",
    label: "연회비 회수 카드",
    count: 8,
    detail:
      "연회비 10,000~39,000원, 전월 실적 300,000~700,000원입니다. " +
      "12개 지출 카테고리마다 혜택률과 월 한도를 따로 적용하며, " +
      "항목별 한도와 별개로 월 통합한도가 한 번 더 걸리는 카드가 1장 있습니다.",
  },
];

/** Thousands separator without Intl, so build/test/browser agree byte for byte. */
export function formatWon(value) {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
