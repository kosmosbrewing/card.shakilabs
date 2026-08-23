// 카드 데이터에서 파생한 사실만 모은 모듈.
//
// 왜 계산해서 쓰는가: 홈과 /all에 넣는 숫자를 손으로 적으면 카드 한 장을 고치는 순간
// 본문이 조용히 거짓말을 시작한다. 여기서 원본 배열을 직접 읽어 계산하므로
// fuelCards.ts / overseasCards.ts / annualFeeCards.ts를 고치면 문장도 같이 바뀐다.
//
// scripts/card-data-derived.mjs는 같은 값을 손으로 복사한 사본이다(프리렌더는 .mjs라
// 타입 소스를 import할 수 없다). 사본이 어긋나면 cardDataScope.test.ts가 실패한다.
import { ANNUAL_FEE_CARDS, BENEFIT_CATEGORIES } from "./annualFeeCards";
import { FUEL_CARDS } from "./fuelCards";
import { OVERSEAS_CARDS } from "./overseasCards";

/** 천단위 구분. Intl 대신 직접 포맷한다 — 빌드·테스트·브라우저에서 같은 문자열이 나와야 한다. */
function won(value: number): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/** 10 / 1.5처럼 소수점 뒤 0은 떼고 적는다. */
function pct(rate: number): string {
  return Number((rate * 100).toFixed(1)).toString();
}

const min = (values: number[]): number => Math.min(...values);
const max = (values: number[]): number => Math.max(...values);

export interface CardDataScopeRow {
  /** 계산기 라우트 (앱 내부 경로) */
  path: string;
  label: string;
  /** 비교 대상 카드 수 */
  count: number;
  detail: string;
}

const FUEL_DISCOUNT_LABELS: Record<string, string> = {
  perLiter: "리터당 정액",
  percent: "정률",
  cashback: "캐시백",
};

function buildFuelScope(): CardDataScopeRow {
  const fees = FUEL_CARDS.map((card) => card.annualFee);
  const minSpends = FUEL_CARDS.map((card) => card.discount.minSpend);
  const caps = FUEL_CARDS.map((card) => card.discount.monthlyCap);
  const types = [...new Set(FUEL_CARDS.map((card) => card.discount.type))];
  const tiered = FUEL_CARDS.filter((card) => card.discount.spendTiers).length;
  const branded = FUEL_CARDS.filter((card) => card.discount.brandRestriction.length > 0).length;

  return {
    path: "/fuel-card",
    label: "주유 할인카드",
    count: FUEL_CARDS.length,
    detail:
      `연회비 ${won(min(fees))}~${won(max(fees))}원, 전월 실적 ${won(min(minSpends))}~${won(max(minSpends))}원, ` +
      `월 할인 한도 ${won(min(caps))}~${won(max(caps))}원입니다. 할인 방식은 ` +
      `${types.map((type) => FUEL_DISCOUNT_LABELS[type]).join("·")} ${types.length}가지이며, ` +
      `전월 실적 구간마다 한도가 달라지는 카드가 ${tiered}장, 특정 주유소 브랜드에서만 할인되는 카드가 ${branded}장 있습니다.`,
  };
}

function buildOverseasScope(): CardDataScopeRow {
  const rates = OVERSEAS_CARDS.map((card) => card.fee.totalFeeRate);
  const counts = { credit: 0, debit: 0, prepaid: 0 };
  for (const card of OVERSEAS_CARDS) counts[card.category] += 1;
  const noAnnualFee = OVERSEAS_CARDS.filter((card) => card.annualFee === 0).length;
  // 수수료 폭을 100만원 결제에 대입한 금액. "0.x%p 차이"보다 체감이 쉽다.
  const gapOnMillion = Math.round((max(rates) - min(rates)) * 1000000);

  return {
    path: "/overseas-payment",
    label: "해외결제 카드",
    count: OVERSEAS_CARDS.length,
    detail:
      `신용 ${counts.credit}장·체크 ${counts.debit}장·선불 ${counts.prepaid}장이며, ` +
      `환전수수료와 국제브랜드 수수료를 더한 총수수료가 ${pct(min(rates))}%에서 ${pct(max(rates))}%까지 벌어집니다. ` +
      `해외에서 100만원을 결제하면 카드 선택만으로 수수료가 ${won(gapOnMillion)}원 갈린다는 뜻입니다. ` +
      `연회비가 없는 카드는 ${noAnnualFee}장입니다.`,
  };
}

function buildAnnualFeeScope(): CardDataScopeRow {
  const fees = ANNUAL_FEE_CARDS.map((card) => card.annualFee);
  const minSpends = ANNUAL_FEE_CARDS.map((card) => card.minSpend);
  const withTotalCap = ANNUAL_FEE_CARDS.filter((card) => card.totalMonthlyCap).length;

  return {
    path: "/annual-fee",
    label: "연회비 회수 카드",
    count: ANNUAL_FEE_CARDS.length,
    detail:
      `연회비 ${won(min(fees))}~${won(max(fees))}원, 전월 실적 ${won(min(minSpends))}~${won(max(minSpends))}원입니다. ` +
      `${BENEFIT_CATEGORIES.length}개 지출 카테고리마다 혜택률과 월 한도를 따로 적용하며, ` +
      `항목별 한도와 별개로 월 통합한도가 한 번 더 걸리는 카드가 ${withTotalCap}장 있습니다.`,
  };
}

/** /all 허브가 "이 계산기가 무엇을 비교하는가"를 말하기 위해 쓰는 데이터 규모 표. */
export const CARD_DATA_SCOPE: CardDataScopeRow[] = [
  buildFuelScope(),
  buildOverseasScope(),
  buildAnnualFeeScope(),
];

export interface CardCapThreshold {
  card: string;
  category: string;
  /** 퍼센트 표기용 문자열 (10, 4, 1.5) */
  rate: string;
  monthlyCap: number;
  /** 이 지출부터는 더 써도 할인이 늘지 않는 월 지출액 = 월 한도 / 할인율 */
  capAtSpend: number;
}

/**
 * 카드별로 "월 할인 한도가 먼저 걸리는 지출액".
 *
 * 대표 혜택은 할인율이 가장 높은 카테고리로 잡는다. 광고가 앞세우는 숫자가 그것이고,
 * 사용자가 카드를 고를 때 보는 것도 그 숫자이기 때문이다. 한도/할인율이 곧 그 할인율이
 * 무의미해지는 지출액이라, 두 숫자를 한 줄에 놓으면 "할인율이 높을수록 한도에 빨리
 * 걸린다"는 관계가 표 하나로 드러난다.
 */
export const CARD_CAP_THRESHOLDS: CardCapThreshold[] = ANNUAL_FEE_CARDS.map((card) => {
  const top = [...card.benefitRates].sort((a, b) => b.rate - a.rate)[0];
  const category = BENEFIT_CATEGORIES.find((item) => item.id === top.categoryId);
  if (!category) throw new Error(`Unknown benefit category: ${top.categoryId}`);

  return {
    card: `${card.issuer} ${card.name}`,
    category: category.label,
    rate: pct(top.rate),
    monthlyCap: top.monthlyCap,
    capAtSpend: Math.round(top.monthlyCap / top.rate),
  };
})
  // 동률(한도 도달 지출이 같은 카드)은 ANNUAL_FEE_CARDS의 선언 순서를 유지한다.
  .map((row, index) => ({ row, index }))
  .sort((a, b) => a.row.capAtSpend - b.row.capAtSpend || a.index - b.index)
  .map(({ row }) => row);

/** 월 20만원 이하에서 이미 한도에 닿는 카드 수 — 홈 본문이 인용하는 한 줄 요약. */
export const CAP_BINDS_UNDER_200K = CARD_CAP_THRESHOLDS.filter(
  (row) => row.capAtSpend <= 200000,
).length;
