// Data-derived copy for the /fuel-card guide (STATIC_CATEGORIES in
// prerender-content.mjs). Every card name, rate, limit, fee, price and savings
// figure here is computed from the mirrored card rows and the engine mirror.
//
// Why: the hand-written version named cards the calculator does not have
// (taptap O, LOCA LIKIT 7%, 1Q 5%), gave KB a station restriction the data does
// not carry, quoted a 1,750 won/L price against the 1,707 the engine uses, and
// printed savings ranges no card in the table produces. /fuel-card is the page
// every fuel variant canonicalizes to, so it is the one crawlers rank.
// src/seo/fuelIssuerContent.test.ts recomputes these from src/data/*.ts.
//
// NOTE: comments here are intentionally ASCII-only. scripts/ is scanned by
// font-subset-config.mjs and every character becomes part of the shipped font
// subset. Korean strings are page copy and belong in the subset.
import { formatWon } from "./card-data-derived.mjs";
import { FUEL_CARDS, FUEL_PRICES } from "./card-data-mirror.mjs";
import {
  FUEL_TYPE,
  cardDisplayName,
  cardsForIssuer,
  discountLabel,
  fleetScope,
  manWon,
  rankedAt,
  spendTiers,
  won,
  wonRange,
} from "./fuel-issuer-facts.mjs";
import { FUEL_ISSUERS } from "./seo-meta.mjs";

// Spends quoted in the simulation paragraph; 300,000 is also the intro example.
export const HUB_SPENDS = [100000, 200000, 300000, 500000];
const INTRO_SPEND = 300000;
const MECHANISM_LABELS = { perLiter: "리터당 정액", percent: "정률", cashback: "캐시백" };

const netRangeAt = (spend) => wonRange(rankedAt(spend).map((row) => row.annualNet));
const price = () => `${won(FUEL_PRICES[FUEL_TYPE])}`;

// One sentence per card: name, mechanism, tiers, caps, fee, station limit if any.
export function cardTermsSentence(card) {
  const tiers = spendTiers(card);
  const brands = card.discount.brandRestriction;
  return (
    `${cardDisplayName(card)}: ${discountLabel(card)}, ` +
    `전월 실적 ${tiers.map((tier) => won(tier.minSpend)).join("/")} 이상 시 월 한도 ${tiers.map((tier) => won(tier.monthlyCap)).join("/")}, ` +
    `연회비 ${won(card.annualFee)}${brands.length > 0 ? `, ${brands.join("·")} 주유소만` : ""}.`
  );
}

export function fuelHubIntro() {
  const issuers = Object.values(FUEL_ISSUERS).map((issuer) => issuer.label.replace(/카드$/, ""));
  const mechanisms = [...new Set(FUEL_CARDS.map((card) => MECHANISM_LABELS[card.discount.type]))];
  return (
    `월 주유비만 입력하면 카드별 예상 절약액을 자동 계산합니다. ${issuers.join("·")} ${issuers.length}개 카드사의 주유 할인카드 ${FUEL_CARDS.length}장을 ` +
    `실적 조건·월 한도·할인 방식(${mechanisms.join("·")})을 기준으로 비교합니다. ` +
    `계산에 쓰는 휘발유 가격은 ${FUEL_PRICES.lastUpdated} Opinet 전국 평균 리터당 ${price()}이며, ` +
    `이 가격으로 월 ${manWon(INTRO_SPEND)}을 주유하면 카드 ${FUEL_CARDS.length}장의 연회비를 뺀 연간 절약액은 ${netRangeAt(INTRO_SPEND)}입니다.`
  );
}

export function fuelHubCriteria() {
  const { count, minSpends, caps } = fleetScope();
  const restricted = FUEL_CARDS.filter((card) => card.discount.brandRestriction.length > 0).length;
  const perLiter = FUEL_CARDS.filter((card) => card.discount.type === "perLiter").map((card) => card.discount.amount);
  const rates = FUEL_CARDS.filter((card) => card.discount.type !== "perLiter").map((card) => card.discount.amount * 100);
  return (
    `주유 할인카드 선택 시 3가지를 확인해야 합니다. ① 전월 실적 조건(이 서비스의 ${count}장 기준 최저 구간 ${wonRange(minSpends)}), ` +
    `② 월 할인 한도(${wonRange(caps)}), ③ 제휴 주유소 브랜드 제한(${count}장 중 ${restricted}장). ` +
    `할인 방식은 리터당 정액(${Math.min(...perLiter)}~${Math.max(...perLiter)}원/L)과 정률·캐시백(${Math.min(...rates)}~${Math.max(...rates)}%)으로 나뉘며, ` +
    "리터당 정액은 유가가 오르면 실효 할인율이 내려갑니다. 추가로 카드 연회비 대비 실익이 나는지도 반드시 확인해야 합니다. " +
    "연회비 2만원인 카드는 연간 최소 2만원 이상의 할인을 받아야 손익분기가 맞습니다."
  );
}

export function fuelHubIssuerParagraph() {
  return (
    `이 서비스가 비교하는 카드사별 주유카드는 다음과 같습니다. ${FUEL_CARDS.map(cardTermsSentence).join(" ")} ` +
    "카드사별 상세 페이지에서 월 주유비 구간별 절약액을 볼 수 있습니다."
  );
}

export function fuelHubSimulation() {
  const { count, fees } = fleetScope();
  const [low, ...rest] = HUB_SPENDS;
  const top = rankedAt(HUB_SPENDS[HUB_SPENDS.length - 1]);
  const gap = top[0].annualNet - top[top.length - 1].annualNet;
  return (
    `카드 ${count}장을 계산기 공식에 넣으면(휘발유 ${price()}/L, 전월 실적 충족 가정) 연회비를 뺀 연간 절약액은 ` +
    `월 ${manWon(low)} 주유 시 ${netRangeAt(low)}, ${rest.map((spend) => `월 ${manWon(spend)} ${netRangeAt(spend)}`).join(", ")}입니다. ` +
    `월 ${manWon(HUB_SPENDS[HUB_SPENDS.length - 1])}에서는 1위와 최하위가 ${won(gap)} 벌어집니다. ` +
    `연회비는 ${count}장 기준 ${wonRange(fees)}이고 위 금액은 이미 연회비를 뺀 값입니다. ` +
    "단, 이 계산은 전월 실적을 채웠다는 가정이므로, 주유 외 결제로 실적을 채우기 어렵다면 할인이 없는 달이 생깁니다."
  );
}

export function fuelHubFaqLowSpend() {
  const rows = rankedAt(HUB_SPENDS[0]);
  const yearly = rows.map((row) => row.annualNet + row.card.annualFee);
  return (
    `Q1. 월 주유비가 적으면 할인카드가 의미 없나요? A. 월 ${manWon(HUB_SPENDS[0])}을 주유하면 카드 ${rows.length}장의 연간 할인은 ${wonRange(yearly)}이고, ` +
    `연회비를 빼면 ${wonRange(rows.map((row) => row.annualNet))}이 남습니다(전월 실적 충족 가정). ` +
    "주유 외 결제로 실적을 채우기 어렵다면 연회비 0원 기본 카드가 유리할 수 있습니다."
  );
}

// Light-car fuel tax refund, read from the statute rather than from memory.
// The old copy said "local-government refund, KRW 200,000 a year"; both parts
// were wrong. Source (law.go.kr open API, fetched 2026-10-03):
//   - Restriction of Special Taxation Act art. 111-2 (MST 284389, in force
//     2026-09-18): national excise refund, KRW 250/L on gasoline and diesel,
//     the full excise on butane, purchases through 2026-12-31, paid only on
//     the refund card issued by ONE card company designated by the NTS (para 4-5).
//   - Enforcement Decree art. 112-2 (MST 288915, in force 2026-09-18):
//     para 1 under 1,000cc and 3.6 x 1.6 x 2.0 m; para 2 one passenger car per
//     household; para 3 annual cap KRW 300,000, counted Jan 1 - Dec 31.
// The sunset date is in the copy on purpose. Re-check both MSTs when the act
// is amended (it has been extended year by year) and update this object.
export const LIGHT_CAR_FUEL_REFUND = {
  perLiter: 250,
  annualCap: 300000,
  until: "2026년 12월 31일",
  maxDisplacementCc: 1000,
  checkedAt: "2026-10-03",
};

export function fuelHubOtherDiscounts() {
  const refund = LIGHT_CAR_FUEL_REFUND;
  return (
    `주유 할인카드 외에도 경차 유류세 환급, 주유소 포인트 적립(OK캐쉬백·L.포인트 등), 멤버십 앱 할인(SK엔크린·GS 포인트) 같은 제도가 있습니다. ` +
    `경차 유류세 환급은 조세특례제한법 제111조의2에 따라 배기량 ${formatWon(refund.maxDisplacementCc)}cc 미만 등 요건을 갖춘 경차가 가구(주민등록상 동거가족)의 유일한 승용차인 경우 ` +
    `${refund.until}까지 휘발유·경유 리터당 ${won(refund.perLiter)}을 연 ${won(refund.annualCap)} 한도로 돌려받는 제도입니다(같은 법 시행령 제112조의2, ${refund.checkedAt} 확인). ` +
    "환급은 국세청이 지정한 카드사 한 곳에서 발급받은 환급용 유류구매카드로 결제한 주유에만 적용되므로, 다른 카드사의 주유 할인카드로 결제한 주유에는 붙지 않습니다. " +
    "포인트 적립·멤버십 할인과 카드 할인을 함께 받을 수 있는지는 주유소와 카드사 약관에서 확인하세요."
  );
}

// "Related pages" links for /fuel-card: one per issuer, named from the data.
export function fuelIssuerLinks() {
  return Object.entries(FUEL_ISSUERS).map(([slug]) => ({
    path: `/card/fuel-card/${slug}`,
    label: cardsForIssuer(slug).map(cardDisplayName).join("·"),
  }));
}
