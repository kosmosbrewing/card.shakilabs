// Data-derived insight sections for the ten calculator routes.
//
// Why this exists: every calculator page carried a generic guide (what a fee
// is, how to pick a card) that any site could publish. The one thing only this
// site can say is what happens when its OWN card tables are run through its OWN
// engines across the whole input range - where a cap starts binding, where a
// spend threshold flips a verdict, which two cards cross and at what amount.
// None of that appears on the calculator screen, which shows a single input at
// a time; it is only visible when the entire table is held in one hand.
//
// Every number below is produced by a mirror of the corresponding src/utils
// engine (same formulas, same rounding), fed from scripts/card-data-mirror.mjs.
// src/seo/cardInsights.test.ts re-runs the real TypeScript engines on the same
// inputs and asserts the facts agree, so this prose cannot drift away from what
// the calculator shows for the same input.
//
// Rules the copy follows (see src/seo/cardInsights.test.ts):
//   - at least eight findings per route, each a boundary, a gap or a
//     cross-card comparison - never a restated tariff;
//   - pairwise text similarity between routes stays below 0.5;
//   - no refresh-cadence promises; freshness is stated as dates, interpolated
//     from the same constants /about uses.
//
// NOTE: comments here are intentionally ASCII-only. scripts/ is scanned by
// font-subset-config.mjs and every character becomes part of the shipped font
// subset. Korean strings are page copy and belong in the subset.
import {
  AIRLINE_NAMES,
  ANNUAL_FEE_CARDS,
  ANNUAL_FEE_MAX_BREAK_EVEN_MONTHS,
  BENEFIT_CATEGORY_LABELS,
  BILLING_DAY_OPTIONS,
  BILLING_MODEL,
  CARD_CUSTOMS_CATEGORIES,
  CUSTOMS_MODEL,
  DCC_MARKUP,
  DEFAULT_SPENDING_PATTERN,
  DUTY_FREE_CATEGORIES,
  DUTY_FREE_CONSTANTS,
  DUTY_FREE_VERIFIED_AT,
  EXCHANGE_RATES,
  EXCHANGE_RATES_UPDATED_AT,
  FUEL_CARDS,
  FUEL_PRICES,
  FUEL_TYPE_LABELS,
  MILEAGE_REDEMPTIONS,
  MILEAGE_ROUTES,
  MILEAGE_VERIFIED_AT,
  MIN_SPEND_DEFAULTS,
  OVERSEAS_CARDS,
  POINT_PROGRAMS,
} from "./card-data-mirror.mjs";
import {
  CARD_BENEFIT_DATA_VERIFIED_AT,
  SOURCE_LINKS_VERIFIED_AT,
  formatWon,
} from "./card-data-derived.mjs";

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------
const won = (value) => `${formatWon(Math.round(value))}원`;
const wonDec = (value, digits = 2) => `${Number(value.toFixed(digits))}원`;
const pct = (rate, digits = 1) => `${Number((rate * 100).toFixed(digits))}%`;
const pctPoint = (rate, digits = 1) => `${Number((rate * 100).toFixed(digits))}%p`;
const usd = (value) => `${formatWon(value)}달러`;
const times = (value, digits = 1) => `${Number(value.toFixed(digits))}배`;
const sum = (values) => values.reduce((total, value) => total + value, 0);
const byAsc = (key) => (a, b) => a[key] - b[key];
const byDesc = (key) => (a, b) => b[key] - a[key];
const cardName = (card) => `${card.issuer} ${card.name}`;

// ---------------------------------------------------------------------------
// Engine mirrors (src/utils/*.ts, same formulas and rounding)
// ---------------------------------------------------------------------------

// annualFeeCalculator.ts
export function annualFeeResult(card, spending) {
  const totalMonthlySpend = sum(Object.values(spending));
  const isMinSpendMet = totalMonthlySpend >= card.minSpend;
  const breakdown = card.benefitRates.map((rate) => {
    const spend = spending[rate.categoryId] ?? 0;
    const raw = spend * rate.rate;
    const capped = rate.monthlyCap > 0 ? Math.min(raw, rate.monthlyCap) : raw;
    return {
      categoryId: rate.categoryId,
      rawBenefit: Math.round(raw),
      cappedBenefit: Math.round(capped),
      isCapExceeded: rate.monthlyCap > 0 && raw > rate.monthlyCap,
    };
  });
  const rawMonthlyBenefit = sum(breakdown.map((item) => item.cappedBenefit));
  const capped =
    card.totalMonthlyCap != null ? Math.min(rawMonthlyBenefit, card.totalMonthlyCap) : rawMonthlyBenefit;
  const totalMonthlyBenefit = isMinSpendMet ? capped : 0;
  const annualBenefit = totalMonthlyBenefit * 12;
  const rawBreakEven = totalMonthlyBenefit > 0 ? Math.ceil(card.annualFee / totalMonthlyBenefit) : null;
  return {
    cardId: card.id,
    totalMonthlySpend,
    isMinSpendMet,
    breakdown,
    rawMonthlyBenefit,
    uncappedMonthlyBenefit: sum(breakdown.map((item) => item.rawBenefit)),
    totalMonthlyBenefit,
    isTotalCapExceeded: card.totalMonthlyCap != null && rawMonthlyBenefit > card.totalMonthlyCap,
    annualBenefit,
    annualNetBenefit: annualBenefit - card.annualFee,
    breakEvenMonths:
      rawBreakEven === null ? null : Math.min(rawBreakEven, ANNUAL_FEE_MAX_BREAK_EVEN_MONTHS),
    roiRatio: card.annualFee > 0 ? annualBenefit / card.annualFee : Number.POSITIVE_INFINITY,
  };
}

// fuelCards.ts tier helpers
function fuelTiers(card) {
  const tiers = card.discount.spendTiers;
  if (tiers && tiers.length > 0) return [...tiers].sort(byAsc("minSpend"));
  return [{ minSpend: card.discount.minSpend, monthlyCap: card.discount.monthlyCap }];
}

function fuelTierFor(card, spending) {
  let matched = null;
  for (const tier of fuelTiers(card)) if (spending >= tier.minSpend) matched = tier;
  return matched ?? fuelTiers(card)[0];
}

// calculator.ts (the /fuel-card engine): spend is fuel spend only
export function fuelResult(card, { fuelType, monthlySpend, preferredBrand }) {
  const fuelPrice = FUEL_PRICES[fuelType];
  const liters = monthlySpend / fuelPrice;
  const tier = fuelTierFor(card, monthlySpend);
  const isBrandMismatch =
    card.discount.brandRestriction.length > 0 &&
    preferredBrand !== "all" &&
    !card.discount.brandRestriction.includes(preferredBrand);
  const raw =
    card.discount.type === "perLiter" ? liters * card.discount.amount : monthlySpend * card.discount.amount;
  const cap = tier.monthlyCap;
  const discount = cap > 0 ? Math.min(raw, cap) : raw;
  const monthlyAnnualFee = card.annualFee / 12;
  return {
    cardId: card.id,
    appliedMinSpend: tier.minSpend,
    appliedMonthlyCap: cap,
    monthlyLiters: Math.round(liters * 10) / 10,
    rawMonthlyDiscount: Math.round(raw),
    monthlyDiscount: Math.round(discount),
    isCapExceeded: cap > 0 && raw > cap,
    monthlyNet: Math.round(discount - monthlyAnnualFee),
    annualNet: Math.round((discount - monthlyAnnualFee) * 12),
    effectivePrice: Math.round(liters > 0 ? fuelPrice - discount / liters : fuelPrice),
    isBrandMismatch,
    isMinSpendWarning: tier.minSpend > 0 && monthlySpend < tier.minSpend,
  };
}

// minSpendCalculator.ts: spend is household + fuel
export function minSpendResult(card, { fuelType, fuelSpend, spending, preferredBrand }) {
  const fuelPrice = FUEL_PRICES[fuelType];
  const liters = fuelSpend / fuelPrice;
  const totalSpending = sum(Object.values(spending)) + fuelSpend;
  const tier = fuelTierFor(card, totalSpending);
  const isBrandMismatch =
    card.discount.brandRestriction.length > 0 &&
    preferredBrand !== "all" &&
    !card.discount.brandRestriction.includes(preferredBrand);
  const isQualified = totalSpending >= tier.minSpend;
  const gap = Math.max(0, tier.minSpend - totalSpending);
  const raw =
    card.discount.type === "perLiter" ? liters * card.discount.amount : fuelSpend * card.discount.amount;
  const capped = tier.monthlyCap > 0 ? Math.min(raw, tier.monthlyCap) : raw;
  const monthlyDiscount = isQualified && !isBrandMismatch ? capped : 0;
  const monthlyAnnualFee = card.annualFee / 12;
  return {
    cardId: card.id,
    totalSpending: Math.round(totalSpending),
    minSpendRequired: tier.minSpend,
    appliedMonthlyCap: tier.monthlyCap,
    isQualified,
    gap: Math.round(gap),
    monthlyDiscount: Math.round(monthlyDiscount),
    monthlyNetBenefit: Math.round(monthlyDiscount - monthlyAnnualFee),
    netBenefitIncludingGap: Math.round(
      gap > 0 ? Math.max(0, capped - monthlyAnnualFee - gap) : monthlyDiscount - monthlyAnnualFee,
    ),
    isBrandMismatch,
    monthlyLiters: Math.round(liters * 10) / 10,
  };
}

// overseasCalculator.ts
export function overseasResult(card, { currency, foreignAmount, dccMarkupRate }) {
  const entry = EXCHANGE_RATES.find((rate) => rate.currency === currency);
  const feeRate = card.exchangeFeeRate + card.networkFeeRate;
  const baseKrwAmount = Math.round((foreignAmount / entry.unit) * entry.rate);
  const cardFeeAmount = Math.round(baseKrwAmount * feeRate);
  const localCurrencyTotal = baseKrwAmount + cardFeeAmount;
  const benefitAmount = Math.round(
    sum(
      card.benefits.map((benefit) => {
        const raw = benefit.rate != null ? localCurrencyTotal * benefit.rate : benefit.fixedAmount ?? 0;
        return benefit.monthlyCap > 0 ? Math.min(raw, benefit.monthlyCap) : raw;
      }),
    ),
  );
  const localCurrencyNet = Math.max(localCurrencyTotal - benefitAmount, 0);
  const dccTotal = Math.round((foreignAmount / entry.unit) * entry.rate * (1 + dccMarkupRate));
  return {
    cardId: card.id,
    feeRate,
    baseKrwAmount,
    cardFeeAmount,
    localCurrencyTotal,
    benefitAmount,
    localCurrencyNet,
    dccTotal,
    dccDifference: dccTotal - localCurrencyNet,
    isMinSpendWarning: card.benefits.some(
      (benefit) => benefit.minSpend > 0 && localCurrencyTotal < benefit.minSpend,
    ),
  };
}

// mileageCalculator.ts: value per mile for every redemption of one airline
export function mileageValues(airlineId) {
  const table = MILEAGE_REDEMPTIONS[airlineId];
  const values = [];
  for (const route of MILEAGE_ROUTES) {
    for (const seatClass of ["economy", "business", "first"]) {
      const milesRequired = table[route.id][seatClass];
      const cashPrice = route[seatClass];
      values.push({
        airlineId,
        routeId: route.id,
        routeLabel: route.label,
        seatClass,
        milesRequired,
        cashPrice,
        valuePerMile: cashPrice / milesRequired,
      });
    }
  }
  return values;
}

// dutyFreeCalculator.ts
export function dutyFreeResult({ purchaseAmountUsd, category }) {
  const info = DUTY_FREE_CATEGORIES.find((item) => item.id === category);
  const taxableUsd = Math.max(0, purchaseAmountUsd - DUTY_FREE_CONSTANTS.exemptionLimitUsd);
  const taxableKrw = taxableUsd * DUTY_FREE_CONSTANTS.exchangeRate;
  const tariff = taxableKrw * info.tariffRate;
  const vat = (taxableKrw + tariff) * DUTY_FREE_CONSTANTS.vatRate;
  const normalTotalTax = tariff + vat;
  const simplifiedApplicable =
    info.simplifiedRate != null && taxableUsd > 0 && purchaseAmountUsd <= info.simplifiedMaxUsd;
  const simplifiedTax = simplifiedApplicable ? taxableKrw * info.simplifiedRate : null;
  const isSimplifiedBetter = simplifiedTax != null && simplifiedTax < normalTotalTax;
  const finalTax = isSimplifiedBetter ? simplifiedTax : normalTotalTax;
  const purchaseKrw = purchaseAmountUsd * DUTY_FREE_CONSTANTS.exchangeRate;
  return {
    taxableAmountUsd: Number(taxableUsd.toFixed(2)),
    taxableAmountKrw: Math.round(taxableKrw),
    normalTotalTax: Math.round(normalTotalTax),
    simplifiedTax: simplifiedTax == null ? null : Math.round(simplifiedTax),
    isSimplifiedBetter,
    finalTax: Math.round(finalTax),
    effectiveTaxRate: purchaseKrw > 0 ? finalTax / purchaseKrw : 0,
    totalCostKrw: Math.round(purchaseKrw + finalTax),
  };
}

// cardTabCalculator.ts
export function creditVsDebit({ monthlySpend, annualFee, creditRate, debitRate }) {
  const annualCreditBenefit = Math.round(monthlySpend * creditRate * 12 - annualFee);
  const annualDebitBenefit = Math.round(monthlySpend * debitRate * 12);
  const rateGap = Math.max(creditRate - debitRate, 0);
  return {
    annualCreditBenefit,
    annualDebitBenefit,
    winner: annualCreditBenefit >= annualDebitBenefit ? "credit" : "debit",
    gap: Math.abs(annualCreditBenefit - annualDebitBenefit),
    breakEvenSpend: rateGap > 0 ? Math.round(annualFee / (rateGap * 12)) : null,
  };
}

export function pointConversions(pointAmount) {
  return POINT_PROGRAMS.map((program) => {
    const units = Math.floor(pointAmount / program.pointsPerUnit);
    const estimatedValue = Math.round(units * program.unitValueWon);
    return { key: program.key, label: program.label, units, estimatedValue, valuePerPoint: estimatedValue / pointAmount };
  }).sort(byDesc("estimatedValue"));
}

export function billingCycle(purchaseDay, billingDay) {
  const { monthDays, graceDays } = BILLING_MODEL;
  const cycleDays =
    purchaseDay <= billingDay ? billingDay - purchaseDay + 1 : monthDays - purchaseDay + billingDay + 1;
  return {
    cycleDays,
    usableDays: cycleDays + graceDays,
    bestPurchaseDay: billingDay === monthDays ? 1 : billingDay + 1,
    bestUsableDays: monthDays + graceDays,
    billedThisMonth: purchaseDay <= billingDay,
  };
}

export function customs({ productUsd, shippingUsd, categoryKey }) {
  const category = CARD_CUSTOMS_CATEGORIES.find((item) => item.key === categoryKey);
  const totalUsd = productUsd + shippingUsd;
  const taxable = totalUsd > category.thresholdUsd;
  const baseKrw = totalUsd * CUSTOMS_MODEL.exchangeRate;
  const tariff = taxable ? baseKrw * category.tariffRate : 0;
  const vat = taxable ? (baseKrw + tariff) * CUSTOMS_MODEL.vatRate : 0;
  const totalTax = Math.round(tariff + vat);
  return {
    totalUsd,
    taxable,
    tariff: Math.round(tariff),
    vat: Math.round(vat),
    totalTax,
    landedCost: taxable ? Math.round(baseKrw + totalTax) : Math.round(baseKrw),
  };
}

// Effective tax on the taxable base when VAT is charged on (base + tariff).
const stackedRate = (tariffRate, vatRate) => tariffRate + (1 + tariffRate) * vatRate;

// ---------------------------------------------------------------------------
// Per-route insight builders. Each returns { heading, intro, findings, table?,
// basis, facts } - facts carry the raw numbers the parity test checks.
// ---------------------------------------------------------------------------

function annualFeeInsights() {
  const spending = DEFAULT_SPENDING_PATTERN;
  const results = ANNUAL_FEE_CARDS.map((card) => ({ card, ...annualFeeResult(card, spending) }));
  const ranked = [...results].sort(byDesc("annualNetBenefit"));
  const best = ranked[0];
  const worst = ranked[ranked.length - 1];
  const negative = results.filter((result) => result.annualNetBenefit < 0);
  const byBreakEven = [...results].sort(byAsc("breakEvenMonths"));
  const fastest = byBreakEven[0];
  const slowest = byBreakEven[byBreakEven.length - 1];
  const cappedCategories = sum(results.map((result) => result.breakdown.filter((item) => item.isCapExceeded).length));
  const ratedCategories = sum(results.map((result) => result.breakdown.length));
  const uncappedTotal = sum(results.map((result) => result.uncappedMonthlyBenefit));
  const cappedTotal = sum(results.map((result) => result.rawMonthlyBenefit));
  const loca = results.find((result) => result.cardId === "lotte-loca-365");
  const locaCategoryCapSum = sum(loca.card.benefitRates.map((rate) => rate.monthlyCap));
  const cliff = [...results].sort(byDesc("totalMonthlyBenefit"))[0];
  const highestMinSpend = [...ANNUAL_FEE_CARDS].sort(byDesc("minSpend"))[0];
  const highestMinSpendResult = results.find((result) => result.cardId === highestMinSpend.id);
  const roiBest = [...results].sort(byDesc("roiRatio"))[0];
  const roiWorst = [...results].sort(byAsc("roiRatio"))[0];
  const total = sum(Object.values(spending));

  // Scale the default pattern to 50% and 150% to see which verdicts flip.
  const scaled = (factor) =>
    Object.fromEntries(Object.entries(spending).map(([key, value]) => [key, Math.round(value * factor)]));
  const half = ANNUAL_FEE_CARDS.map((card) => ({ card, ...annualFeeResult(card, scaled(0.5)) }));
  const halfUnmet = half.filter((result) => !result.isMinSpendMet);
  const halfBest = [...half].sort(byDesc("annualNetBenefit"))[0];
  const oneAndHalf = ANNUAL_FEE_CARDS.map((card) => ({ card, ...annualFeeResult(card, scaled(1.5)) }));
  const oneAndHalfBest = [...oneAndHalf].sort(byDesc("annualNetBenefit"))[0];

  // Telecom: how many cards pay the same headline rate on the same 70,000 won.
  const telecomCards = ANNUAL_FEE_CARDS.filter((card) =>
    card.benefitRates.some((rate) => rate.categoryId === "telecom" && rate.rate === 0.1),
  );
  const telecomBenefit = Math.min(
    ...telecomCards.map((card) => {
      const rate = card.benefitRates.find((item) => item.categoryId === "telecom");
      return Math.min(spending.telecom * rate.rate, rate.monthlyCap);
    }),
  );

  const findings = [
    `기본 지출 패턴(12개 카테고리 합계 월 ${won(total)})으로 8장을 한 번에 돌리면 연 순혜택이 ${cardName(best.card)} ${won(best.annualNetBenefit)}에서 ${cardName(worst.card)} ${won(worst.annualNetBenefit)}까지 벌어집니다. 같은 지출인데 카드 선택만으로 연 ${won(best.annualNetBenefit - worst.annualNetBenefit)} 차이가 납니다.`,
    `연회비 회수가 가장 빠른 카드는 ${cardName(fastest.card)}(${fastest.breakEvenMonths}개월), 가장 느린 카드는 ${cardName(slowest.card)}(${slowest.breakEvenMonths}개월)입니다. 8장 중 연 순혜택이 음수로 떨어지는 카드는 ${negative.length}장입니다.`,
    `혜택률이 붙은 카테고리 ${ratedCategories}개 중 ${cappedCategories}개가 기본 패턴에서 이미 월 한도에 걸립니다. 한도가 없었다면 8장 합계 월 ${won(uncappedTotal)}이 나왔을 혜택이 한도를 거치며 ${won(cappedTotal)}으로 줄어듭니다.`,
    `${cardName(loca.card)}는 카테고리별 한도를 다 더하면 월 ${won(locaCategoryCapSum)}인데 그 위에 통합한도 ${won(loca.card.totalMonthlyCap)}이 한 번 더 걸립니다. 기본 패턴에서는 카테고리 합계가 ${won(loca.rawMonthlyBenefit)}이라 통합한도에 ${loca.isTotalCapExceeded ? "걸리고" : "아직 닿지 않고"}, 7개 카테고리를 모두 채워도 받을 수 있는 최대치는 ${won(loca.card.totalMonthlyCap)}입니다.`,
    `전월 실적은 1원 차이로 혜택 전체를 지웁니다. ${cardName(cliff.card)}의 경우 실적 ${won(cliff.card.minSpend)}을 채우면 월 ${won(cliff.totalMonthlyBenefit)}, 1원 모자라면 0원이라 8장 가운데 낙차가 가장 큽니다. 실적 기준이 가장 높은 ${cardName(highestMinSpend)}(${won(highestMinSpend.minSpend)})의 경우 기본 패턴에서 ${highestMinSpendResult.isMinSpendMet ? "충족" : "미달"}입니다.`,
    `연회비 대비 연 혜택 배율은 ${cardName(roiBest.card)} ${times(roiBest.roiRatio)}에서 ${cardName(roiWorst.card)} ${times(roiWorst.roiRatio)}까지 갈립니다. 연회비가 가장 비싼 카드가 배율도 가장 낮다는 뜻이라, 연회비 액수만 보고 프리미엄을 고르면 회수가 가장 느립니다.`,
    `지출을 절반(월 ${won(total * 0.5)})으로 줄이면 ${halfUnmet.length}장이 실적 미달로 혜택 0원이 되고 1위는 ${cardName(halfBest.card)}로 바뀝니다. 1.5배(월 ${won(total * 1.5)})로 늘리면 1위는 ${cardName(oneAndHalfBest.card)}입니다. 순위가 지출 규모에 따라 ${halfBest.cardId === oneAndHalfBest.cardId ? "바뀌지 않는" : "뒤집히는"} 이유는 실적 문턱과 월 한도가 서로 다른 지점에서 작동하기 때문입니다.`,
    `통신비 ${won(spending.telecom)}에 10%를 붙이는 카드가 ${telecomCards.length}장이고 모두 월 ${won(telecomBenefit)}으로 같습니다. 통신비 하나만 보고 카드를 고르면 어느 쪽을 골라도 결과가 같으니, 차이는 나머지 카테고리에서 납니다.`,
  ];

  return {
    heading: "8장을 한 번에 돌려 보면 보이는 것",
    intro: `이 계산기의 카드 8장을 화면 기본값과 같은 지출 패턴에 동시에 넣고, 지출을 절반과 1.5배로 흔들어 어디서 순위와 판정이 뒤집히는지 확인했습니다. 화면은 한 번에 한 패턴만 보여주지만, 아래는 표 전체를 훑어야 드러나는 경계입니다.`,
    findings,
    table: {
      head: ["카드", "월 혜택", "연 순혜택", "회수 기간"],
      rows: ranked.map((result) => [
        cardName(result.card),
        won(result.totalMonthlyBenefit),
        won(result.annualNetBenefit),
        `${result.breakEvenMonths}개월`,
      ]),
    },
    basis: `카드 혜택 데이터 확인일 ${CARD_BENEFIT_DATA_VERIFIED_AT}, 출처 링크 점검일 ${SOURCE_LINKS_VERIFIED_AT}. 계산 방식은 화면과 동일합니다.`,
    facts: {
      totalSpend: total,
      annualNetByCard: Object.fromEntries(results.map((result) => [result.cardId, result.annualNetBenefit])),
      breakEvenByCard: Object.fromEntries(results.map((result) => [result.cardId, result.breakEvenMonths])),
      monthlyBenefitByCard: Object.fromEntries(results.map((result) => [result.cardId, result.totalMonthlyBenefit])),
      cappedCategories,
      halfUnmet: halfUnmet.length,
      halfBest: halfBest.cardId,
      oneAndHalfBest: oneAndHalfBest.cardId,
    },
  };
}

function overseasInsights() {
  const input = { currency: "USD", foreignAmount: 1000, dccMarkupRate: DCC_MARKUP.defaultRate };
  const usdRate = EXCHANGE_RATES.find((rate) => rate.currency === "USD").rate;
  const results = OVERSEAS_CARDS.map((card) => ({ card, ...overseasResult(card, input) }));
  const feeGroups = new Map();
  for (const result of results) {
    feeGroups.set(result.feeRate, (feeGroups.get(result.feeRate) ?? 0) + 1);
  }
  const creditFee = results.filter((result) => result.card.category === "credit");
  const zeroFee = results.filter((result) => result.feeRate === 0);
  const ranked = [...results].sort(byAsc("localCurrencyNet"));
  const cheapest = ranked[0];
  const priciest = ranked[ranked.length - 1];
  const travelogCredit = results.find((result) => result.cardId === "hana-travelog-credit");
  const travelogDebit = results.find((result) => result.cardId === "hana-travelog-debit");
  const toss = results.find((result) => result.cardId === "toss-go");
  const tossCap = toss.card.benefits[0];
  const tossCapAtTotal = Math.round(tossCap.monthlyCap / tossCap.rate);
  const tossEffective = toss.benefitAmount / toss.localCurrencyTotal;
  const dccWorstFee = Math.max(...results.map((result) => result.cardFeeAmount));
  const dccDefault = Math.round(cheapest.baseKrwAmount * DCC_MARKUP.defaultRate);
  const dccMin = Math.round(cheapest.baseKrwAmount * DCC_MARKUP.typicalMinRate);
  const dccMax = Math.round(cheapest.baseKrwAmount * DCC_MARKUP.typicalMaxRate);
  const beatsFee = results.filter(
    (result) => result.card.benefits.length > 0 && result.card.benefits[0].rate > result.feeRate,
  );
  const minSpendCards = OVERSEAS_CARDS.filter((card) => card.benefits.some((benefit) => benefit.minSpend > 0));
  const small = OVERSEAS_CARDS.map((card) => overseasResult(card, { ...input, foreignAmount: 200 }));
  const smallWarnings = small.filter((result) => result.isMinSpendWarning).length;
  const smallTotal = small[0].baseKrwAmount;
  // Smallest single USD purchase that clears the highest min-spend on a 1% card
  const highestMinSpend = Math.max(...minSpendCards.flatMap((card) => card.benefits.map((benefit) => benefit.minSpend)));
  const clearsAllUsd = Math.ceil(highestMinSpend / 1.01 / usdRate);
  // Travelog credit vs its own debit sibling: monthly window where credit nets more
  const tcBenefit = travelogCredit.card.benefits[0];
  const tcFeeShare = travelogCredit.card.annualFee / 12;
  const creditWindowLow = Math.ceil(tcFeeShare / (tcBenefit.rate - travelogCredit.feeRate));
  const creditWindowHigh = Math.floor((tcBenefit.monthlyCap - tcFeeShare) / travelogCredit.feeRate);
  const capSpends = results
    .filter((result) => result.card.benefits.length > 0 && result.card.benefits[0].monthlyCap > 0)
    .map((result) => ({
      name: cardName(result.card),
      capAt: Math.round(result.card.benefits[0].monthlyCap / result.card.benefits[0].rate),
      cap: result.card.benefits[0].monthlyCap,
      rate: result.card.benefits[0].rate,
    }))
    .sort(byAsc("capAt"));

  const sameCapPair = capSpends.find((row, index) =>
    capSpends.slice(index + 1).some((other) => other.cap === row.cap && other.rate !== row.rate),
  );
  const sameCapOther = sameCapPair
    ? capSpends.find((row) => row !== sameCapPair && row.cap === sameCapPair.cap)
    : null;
  const sameCapNote = sameCapPair
    ? ` 한도가 같은 ${won(sameCapPair.cap)}이라도 적립률이 ${pct(Math.min(sameCapPair.rate, sameCapOther.rate))}면 ${pct(Math.max(sameCapPair.rate, sameCapOther.rate))}보다 늦게 걸리므로, 한도 액수만으로 카드를 비교하면 순서가 틀립니다.`
    : "";
  const findings = [
    `수수료율은 ${feeGroups.size}단계뿐입니다. 신용카드 ${creditFee.length}장은 환전 ${pct(creditFee[0].card.exchangeFeeRate)}+브랜드 ${pct(creditFee[0].card.networkFeeRate)}로 전부 ${pct(creditFee[0].feeRate)}이고, 체크 ${zeroFee.length}장은 0%, 선불 1장은 ${pct(results.find((result) => result.cardId === "travel-wallet").feeRate)}입니다. ${usd(1000)}(${won(cheapest.baseKrwAmount)}) 결제에서 신용카드끼리는 수수료 ${won(creditFee[0].cardFeeAmount)}으로 한 푼도 다르지 않습니다.`,
    `수수료에서 혜택을 뺀 실부담으로 11장을 세우면 ${usd(1000)} 결제에서 ${cardName(cheapest.card)} ${won(cheapest.localCurrencyNet)}이 가장 적고 ${cardName(priciest.card)} ${won(priciest.localCurrencyNet)}이 가장 많습니다. 폭은 ${won(priciest.localCurrencyNet - cheapest.localCurrencyNet)}, 결제액의 ${pct((priciest.localCurrencyNet - cheapest.localCurrencyNet) / cheapest.baseKrwAmount, 2)}입니다.`,
    `혜택률이 자기 수수료율보다 높은 카드는 11장 중 ${beatsFee.length}장(${beatsFee.map((result) => cardName(result.card)).join("·")})뿐입니다. 나머지 신용카드는 0.5~0.8% 적립을 받아도 1% 수수료를 넘지 못해, 수수료 0원 체크카드보다 실부담이 항상 큽니다.`,
    `${cardName(travelogCredit.card)}은 1% 수수료를 내고도 3% 적립 덕에 ${usd(1000)}에서 실부담 ${won(travelogCredit.localCurrencyNet)}으로 수수료 0원인 ${cardName(travelogDebit.card)}(${won(travelogDebit.localCurrencyNet)})보다 ${won(travelogDebit.localCurrencyNet - travelogCredit.localCurrencyNet)} 적습니다. 다만 전월 실적 ${won(tcBenefit.minSpend)}과 연회비 ${won(travelogCredit.card.annualFee)}이 조건이라, 연회비를 월로 나눈 뒤에도 신용이 앞서는 월 결제 구간은 ${won(creditWindowLow)}~${won(creditWindowHigh)}입니다.`,
    `${cardName(toss.card)}의 1% 캐시백은 월 ${won(tossCap.monthlyCap)} 한도라 총액 ${won(tossCapAtTotal)}에서 멈춥니다. ${usd(1000)} 결제면 이미 한도를 넘어 실제 환급률은 ${pct(tossEffective, 2)}로 내려갑니다.`,
    `적립 한도가 걸리는 월 결제액은 ${capSpends.map((row) => `${row.name} ${won(row.capAt)}`).join(", ")}입니다.${sameCapNote}`,
    `원화 결제(DCC)를 고르면 카드 수수료와 상관없이 환율에 ${pct(DCC_MARKUP.defaultRate, 0)}가 덧붙습니다. ${usd(1000)}에서 ${won(dccDefault)}으로, 가장 비싼 카드 수수료(${won(dccWorstFee)})의 ${times(dccDefault / dccWorstFee)}입니다. 마크업 범위 ${pct(DCC_MARKUP.typicalMinRate, 0)}~${pct(DCC_MARKUP.typicalMaxRate, 0)}를 대입하면 ${won(dccMin)}~${won(dccMax)}입니다.`,
    `전월 실적이 붙은 카드는 ${minSpendCards.length}장입니다. ${usd(200)}(${won(smallTotal)})짜리 결제 한 건만 보면 ${smallWarnings}장 모두 실적 경고가 뜨고, 가장 높은 실적 ${won(highestMinSpend)}을 한 건으로 넘기려면 ${usd(clearsAllUsd)} 이상을 결제해야 합니다.`,
  ];

  return {
    heading: "11장의 수수료·적립을 한 결제에 대입하면",
    intro: `화면이 카드 한 장씩 보여주는 수수료와 적립을 ${usd(1000)} 결제 한 건에 동시에 대입하고, 적립 한도와 전월 실적이 어느 결제액에서 켜지고 꺼지는지 짚었습니다. 환율은 계산기 기본값(${EXCHANGE_RATES_UPDATED_AT} 기준 1달러 ${won(usdRate)})입니다.`,
    findings,
    table: {
      head: ["카드", "수수료율", "수수료", "혜택", "실부담"],
      rows: ranked.map((result) => [
        cardName(result.card),
        pct(result.feeRate),
        won(result.cardFeeAmount),
        won(result.benefitAmount),
        won(result.localCurrencyNet),
      ]),
    },
    basis: `카드 수수료·적립 데이터 확인일 ${CARD_BENEFIT_DATA_VERIFIED_AT}, 출처 링크 점검일 ${SOURCE_LINKS_VERIFIED_AT}. 환율 기준일 ${EXCHANGE_RATES_UPDATED_AT}.`,
    facts: {
      usdRate,
      netByCard: Object.fromEntries(results.map((result) => [result.cardId, result.localCurrencyNet])),
      feeByCard: Object.fromEntries(results.map((result) => [result.cardId, result.cardFeeAmount])),
      benefitByCard: Object.fromEntries(results.map((result) => [result.cardId, result.benefitAmount])),
      smallWarnings,
      dccDefault,
    },
  };
}

function fuelCardInsights() {
  const price = FUEL_PRICES.gasoline;
  const base = { fuelType: "gasoline", monthlySpend: 200000, preferredBrand: "all" };
  const at = (monthlySpend, fuelType = "gasoline") =>
    FUEL_CARDS.map((card) => ({ card, ...fuelResult(card, { ...base, fuelType, monthlySpend }) }));
  const r200 = at(200000);
  const r300 = at(300000);
  const r500 = at(500000);
  const rank = (results) => [...results].sort(byDesc("monthlyNet"));
  const best200 = rank(r200)[0];
  const best300 = rank(r300)[0];
  const best500 = rank(r500)[0];
  const perLiter = FUEL_CARDS.filter((card) => card.discount.type === "perLiter").sort(byAsc("id"));
  const equivalents = [...new Set(perLiter.map((card) => card.discount.amount))]
    .sort((a, b) => a - b)
    .map((amount) => ({ amount, gasoline: amount / price, lpg: amount / FUEL_PRICES.lpg }));
  const capAt = FUEL_CARDS.map((card) => {
    const tier = fuelTiers(card)[0];
    const spend =
      card.discount.type === "perLiter"
        ? (tier.monthlyCap / card.discount.amount) * price
        : tier.monthlyCap / card.discount.amount;
    return { name: card.name, capAt: Math.round(spend), cap: tier.monthlyCap };
  }).sort(byAsc("capAt"));
  const warnings200 = r200.filter((result) => result.isMinSpendWarning);
  const clears200 = r200.filter((result) => !result.isMinSpendWarning);
  const feeBreakEven = FUEL_CARDS.map((card) => {
    const monthlyFee = card.annualFee / 12;
    const spend =
      card.discount.type === "perLiter"
        ? (monthlyFee / card.discount.amount) * price
        : monthlyFee / card.discount.amount;
    return { name: card.name, spend: Math.round(spend) };
  }).sort(byAsc("spend"));
  const hyundai = FUEL_CARDS.find((card) => card.id === "hyundai-o");
  const lotte = FUEL_CARDS.find((card) => card.id === "lotte-auto");
  const hyundai300 = r300.find((result) => result.cardId === "hyundai-o");
  const lotte300 = r300.find((result) => result.cardId === "lotte-auto");
  const hyundaiCapAt = capAt.find((row) => row.name === hyundai.name).capAt;
  const lotteCapAt = capAt.find((row) => row.name === lotte.name).capAt;
  const lotteLpg200 = fuelResult(lotte, { ...base, fuelType: "lpg" });
  const lotteGas200 = r200.find((result) => result.cardId === "lotte-auto");
  const litersByFuel = Object.keys(FUEL_TYPE_LABELS).map((type) => ({
    label: FUEL_TYPE_LABELS[type],
    liters: Math.round((200000 / FUEL_PRICES[type]) * 10) / 10,
  }));
  const soil = r300.find((result) => result.cardId === "samsung-soil");
  const soilRank300 = rank(r300).findIndex((result) => result.cardId === "samsung-soil") + 1;

  const runnerGap = (results) => {
    const [first, second] = rank(results);
    return { first, second, gap: first.monthlyNet - second.monthlyNet };
  };
  const g200 = runnerGap(r200);
  const g500 = runnerGap(r500);
  const winners = new Set([best200.cardId, best300.cardId, best500.cardId]).size;
  const winnerSentence =
    winners === 1
      ? `세 구간 모두 ${best200.card.name}가 1위지만 2위와의 격차는 ${won(200000)}에서 ${won(g200.gap)}(2위 ${g200.second.card.name}), ${won(500000)}에서 ${won(g500.gap)}(2위 ${g500.second.card.name})으로 벌어집니다. 격차가 커지는 이유는 2위 카드들이 먼저 한도에 걸리기 때문입니다.`
      : `1위가 ${winners}번 바뀌는 이유는 한도가 카드마다 다른 주유액에서 걸리기 때문입니다.`;
  // Hyundai O (10%, capped at 10,000 on the first tier) vs Lotte Auto (150 won/L):
  // Hyundai leads until its cap binds, Lotte overtakes once its per-liter discount
  // net of fee exceeds Hyundai's capped net.
  const hyundaiCappedNet = fuelTiers(hyundai)[0].monthlyCap - hyundai.annualFee / 12;
  const crossover = Math.round((hyundaiCappedNet + lotte.annualFee / 12) / (lotte.discount.amount / price));
  const findings = [
    `리터당 할인은 유가에 따라 할인율이 달라집니다. ${FUEL_PRICES.lastUpdated} 휘발유 ${won(price)}/L 기준으로 ${equivalents.map((row) => `${row.amount}원/L는 ${pct(row.gasoline, 2)}`).join(", ")}에 해당합니다. LPG(${won(FUEL_PRICES.lpg)}/L)에서는 같은 ${equivalents[0].amount}원/L가 ${pct(equivalents[0].lpg, 2)}, ${equivalents[equivalents.length - 1].amount}원/L가 ${pct(equivalents[equivalents.length - 1].lpg, 2)}로 뛰어 정률 카드와의 우열이 유종에 따라 바뀝니다.`,
    `월 주유 ${won(200000)}(화면 기본값)에서는 ${best200.card.name}가 순절약 월 ${won(best200.monthlyNet)}으로 1위, ${won(300000)}에서는 ${best300.card.name}(${won(best300.monthlyNet)}), ${won(500000)}에서는 ${best500.card.name}(${won(best500.monthlyNet)})입니다. ${winnerSentence}`,
    `월 할인 한도가 처음 걸리는 주유액은 ${capAt.map((row) => `${row.name} ${won(row.capAt)}`).join(", ")}입니다. 한도 ${won(capAt[0].cap)}인 카드는 이 금액을 넘는 주유에 대해 할인이 0원입니다.`,
    `주유비만으로 전월 실적을 채우는 카드는 ${won(200000)} 기준 ${clears200.length}장(${clears200.map((result) => result.card.name).join("·")})뿐이고, ${warnings200.length}장은 실적 경고가 뜹니다. 이 계산기는 주유액만 받으므로 다른 지출로 실적을 채우는 경우는 실적 조건 계산기에서 확인해야 합니다.`,
    `연회비를 월로 나눈 금액을 할인으로 상쇄하는 최소 주유액은 ${feeBreakEven.map((row) => `${row.name} ${won(row.spend)}`).join(", ")}입니다. 이 금액 아래에서는 실적을 채워도 카드가 연회비만큼 손해입니다.`,
    `${hyundai.name}(10%)와 ${lotte.name}(${lotte.discount.amount}원/L)의 우열은 월 주유 ${won(crossover)}에서 한 번 뒤집힙니다. 그 아래에서는 10%가 앞서지만 ${hyundai.name}는 ${won(hyundaiCapAt)}부터 첫 구간 한도 ${won(fuelTiers(hyundai)[0].monthlyCap)}에 묶이고, ${lotte.name}는 ${won(lotteCapAt)}까지 할인이 계속 늘어 ${won(300000)}에서 ${won(lotte300.monthlyNet)} 대 ${won(hyundai300.monthlyNet)}으로 벌어집니다.`,
    `같은 ${won(200000)}으로 ${litersByFuel.map((row) => `${row.label} ${row.liters}L`).join(", ")}를 넣습니다. 리터당 카드는 리터 수에 비례하므로 ${lotte.name}의 할인이 휘발유 ${won(lotteGas200.monthlyDiscount)}에서 LPG ${won(lotteLpg200.monthlyDiscount)}으로 ${pct(lotteLpg200.monthlyDiscount / lotteGas200.monthlyDiscount - 1, 0)} 늘어납니다.`,
    `${soil.card.name}는 S-Oil 전용이라 선호 주유소를 다른 브랜드로 고르면 비교에서 빠집니다. 브랜드 제한이 없을 때 ${won(300000)} 기준 순절약 ${won(soil.monthlyNet)}으로 6장 중 ${soilRank300}위이니, 주유소를 가리지 않는 운전자에게만 의미가 있는 순위입니다.`,
  ];

  return {
    heading: "6장을 유가와 주유액 전 구간에 놓으면",
    intro: `카드 6장을 월 주유 ${won(200000)}·${won(300000)}·${won(500000)}과 유종 3가지에 동시에 넣어, 할인 한도가 걸리는 지점과 1위가 바뀌는 지점을 찾았습니다. 유가는 계산기가 쓰는 ${FUEL_PRICES.lastUpdated} Opinet 전국 평균입니다.`,
    findings,
    table: {
      head: ["카드", "20만원", "30만원", "50만원"],
      rows: FUEL_CARDS.map((card) => [
        card.name,
        won(r200.find((result) => result.cardId === card.id).monthlyNet),
        won(r300.find((result) => result.cardId === card.id).monthlyNet),
        won(r500.find((result) => result.cardId === card.id).monthlyNet),
      ]),
    },
    basis: `카드 혜택 데이터 확인일 ${CARD_BENEFIT_DATA_VERIFIED_AT}, 출처 링크 점검일 ${SOURCE_LINKS_VERIFIED_AT}. 유가 기준일 ${FUEL_PRICES.lastUpdated}. 표의 숫자는 월 순절약(할인 - 연회비/12)입니다.`,
    facts: {
      price,
      net200: Object.fromEntries(r200.map((result) => [result.cardId, result.monthlyNet])),
      net300: Object.fromEntries(r300.map((result) => [result.cardId, result.monthlyNet])),
      net500: Object.fromEntries(r500.map((result) => [result.cardId, result.monthlyNet])),
      warnings200: warnings200.length,
      lotteLpg200: lotteLpg200.monthlyDiscount,
      crossover,
    },
  };
}

function minSpendInsights() {
  const household = MIN_SPEND_DEFAULTS;
  const householdTotal = sum(Object.values(household));
  const base = { fuelType: "gasoline", fuelSpend: 200000, spending: household, preferredBrand: "all" };
  const results = FUEL_CARDS.map((card) => ({ card, ...minSpendResult(card, base) }));
  const total = results[0].totalSpending;
  const ranked = [...results].sort(byDesc("monthlyNetBenefit"));
  const hyundai = FUEL_CARDS.find((card) => card.id === "hyundai-o");
  const hyundaiTiers = fuelTiers(hyundai);
  const hyundaiNow = results.find((result) => result.cardId === "hyundai-o");
  const nextTier = hyundaiTiers.find((tier) => tier.minSpend > total);
  const fuelOnly = FUEL_CARDS.map((card) => ({
    card,
    ...minSpendResult(card, { ...base, spending: Object.fromEntries(Object.keys(household).map((key) => [key, 0])) }),
  }));
  const fuelOnlyUnmet = fuelOnly.filter((result) => !result.isQualified);
  const halfHousehold = Object.fromEntries(Object.entries(household).map(([key, value]) => [key, value / 2]));
  const halved = FUEL_CARDS.map((card) => ({ card, ...minSpendResult(card, { ...base, spending: halfHousehold }) }));
  const halvedTotal = halved[0].totalSpending;
  const halvedUnmet = halved.filter((result) => !result.isQualified);
  const halvedHyundai = halved.find((result) => result.cardId === "hyundai-o");
  const lotte = FUEL_CARDS.find((card) => card.id === "lotte-auto");
  const lotteRawDiscount = Math.round(
    Math.min((200000 / FUEL_PRICES.gasoline) * lotte.discount.amount, lotte.discount.monthlyCap),
  );
  const lotteGapCeiling = Math.round(lotteRawDiscount - lotte.annualFee / 12);
  const minSpends = FUEL_CARDS.map((card) => fuelTiers(card)[0].minSpend);
  const cheapestEntry = FUEL_CARDS.filter((card) => fuelTiers(card)[0].minSpend === Math.min(...minSpends));
  const steepestEntry = FUEL_CARDS.filter((card) => fuelTiers(card)[0].minSpend === Math.max(...minSpends));
  const tier2Step = hyundaiTiers[1].monthlyCap - hyundaiTiers[0].monthlyCap;
  const tier3Step = hyundaiTiers[2].monthlyCap - hyundaiTiers[1].monthlyCap;
  const tier3Marginal = tier3Step / (hyundaiTiers[2].minSpend - hyundaiTiers[1].minSpend);
  const branded = FUEL_CARDS.filter((card) => card.discount.brandRestriction.length > 0);

  const findings = [
    `화면 기본값은 생활비 7개 항목 ${won(householdTotal)}에 주유 ${won(200000)}을 더한 월 ${won(total)}입니다. 이 금액은 6장 전부의 실적 문턱(${won(Math.min(...minSpends))}~${won(Math.max(...minSpends))})을 넘기므로 기본 화면에서는 어떤 카드도 실적 경고가 뜨지 않습니다.`,
    `같은 주유 ${won(200000)}을 생활비 없이 넣으면 ${fuelOnlyUnmet.length}장이 실적 미달로 할인 0원이 됩니다. 생활비를 함께 입력하는 순간 6장 모두 충족으로 바뀌는데, 이 계산기가 주유비 외 7개 항목을 묻는 이유가 여기 있습니다.`,
    `${hyundai.name}의 실적 구간은 ${hyundaiTiers.map((tier) => `${won(tier.minSpend)}→한도 ${won(tier.monthlyCap)}`).join(", ")} 세 단계입니다. 기본값 ${won(total)}은 ${won(hyundaiNow.minSpendRequired)} 구간에 있어 한도 ${won(hyundaiNow.appliedMonthlyCap)}이 적용되고, ${won(nextTier.minSpend - total)}을 더 쓰면 한도가 ${won(nextTier.monthlyCap)}으로 올라갑니다.`,
    `${hyundai.name}의 두 번째 구간은 한도를 ${won(tier2Step)} 올려 주지만 세 번째 구간은 지출 ${won(hyundaiTiers[2].minSpend - hyundaiTiers[1].minSpend)}을 더 요구하며 한도를 ${won(tier3Step)} 올립니다. 추가 지출 대비 늘어나는 한도는 ${pct(tier3Marginal, 2)}라, 세 번째 구간을 노리고 지출을 늘리는 것은 주유가 그만큼 많을 때만 의미가 있습니다.`,
    `생활비를 절반(${won(halvedTotal - 200000)})으로 줄이면 총지출 ${won(halvedTotal)}에서 ${halvedUnmet.length === 0 ? "미달로 바뀌는 카드는 없지만" : `${halvedUnmet.length}장이 미달로 바뀌고`} ${hyundai.name}의 한도는 ${won(hyundaiNow.appliedMonthlyCap)}에서 ${won(halvedHyundai.appliedMonthlyCap)} 구간으로 내려갑니다. 실적은 채웠는데 할인이 줄어드는 경우가 있다는 뜻입니다.`,
    `실적을 채우려고 지출을 늘리면 그 금액도 비용입니다. ${lotte.name}는 주유 ${won(200000)}에서 할인 ${won(lotteRawDiscount)}에 연회비 월 ${won(lotte.annualFee / 12)}을 빼면 ${won(lotteGapCeiling)}이 남으므로, 부족한 실적이 ${won(lotteGapCeiling)}을 넘으면 억지로 채우는 편이 손해입니다. 화면의 '추가 지출까지 감안한 순혜택'이 이 계산입니다.`,
    `실적 문턱이 가장 낮은 카드(${cheapestEntry.map((card) => card.name).join("·")}, ${won(Math.min(...minSpends))})는 연회비도 ${won(Math.min(...cheapestEntry.map((card) => card.annualFee)))}으로 가장 싸고, 가장 높은 카드(${steepestEntry.map((card) => card.name).join("·")}, ${won(Math.max(...minSpends))})는 연회비 ${won(Math.max(...steepestEntry.map((card) => card.annualFee)))}으로 가장 비쌉니다. 문턱과 연회비가 같은 방향으로 움직이는 표라, 진입이 쉬운 카드가 유지 비용도 낮습니다.`,
    `기본값에서 월 순혜택은 ${ranked[0].card.name} ${won(ranked[0].monthlyNetBenefit)}이 1위, ${ranked[ranked.length - 1].card.name} ${won(ranked[ranked.length - 1].monthlyNetBenefit)}이 마지막입니다. 주유소 브랜드 제한이 있는 ${branded.map((card) => card.name).join("·")}는 선호 주유소를 지정하는 순간 이 순위에서 빠질 수 있습니다.`,
  ];

  return {
    heading: "실적 문턱을 총지출 전 구간에서 밀어 보면",
    intro: `카드 6장의 실적 조건을 화면 기본 지출(${won(total)})에서 출발해 생활비를 0과 절반으로 줄이며 어느 카드가 언제 미달로 떨어지는지, 구간형 카드의 한도가 어디서 바뀌는지 확인했습니다.`,
    findings,
    basis: `카드 혜택 데이터 확인일 ${CARD_BENEFIT_DATA_VERIFIED_AT}, 출처 링크 점검일 ${SOURCE_LINKS_VERIFIED_AT}. 유가 기준일 ${FUEL_PRICES.lastUpdated}.`,
    facts: {
      total,
      netByCard: Object.fromEntries(results.map((result) => [result.cardId, result.monthlyNetBenefit])),
      fuelOnlyUnmet: fuelOnlyUnmet.length,
      halvedUnmet: halvedUnmet.length,
      halvedHyundaiCap: halvedHyundai.appliedMonthlyCap,
      hyundaiCap: hyundaiNow.appliedMonthlyCap,
    },
  };
}

function mileageInsights() {
  const ke = mileageValues("korean-air");
  const oz = mileageValues("asiana");
  const all = [...ke, ...oz];
  const sorted = [...all].sort(byAsc("valuePerMile"));
  const lowest = sorted[0];
  const highest = sorted[sorted.length - 1];
  const avg = (values) => sum(values.map((item) => item.valuePerMile)) / values.length;
  const classAvg = (airline, seatClass) => avg(airline.filter((item) => item.seatClass === seatClass));
  const longHaul = ["hawaii", "usa", "europe"];
  const keBiz = ke.find((item) => item.routeId === "europe" && item.seatClass === "business");
  const ozBiz = oz.find((item) => item.routeId === "europe" && item.seatClass === "business");
  const sameEconomy = MILEAGE_ROUTES.every(
    (route) => MILEAGE_REDEMPTIONS["korean-air"][route.id].economy === MILEAGE_REDEMPTIONS.asiana[route.id].economy,
  );
  const seventy = ke.filter((item) => item.seatClass === "economy" && item.milesRequired === 70000).sort(byAsc("valuePerMile"));
  const keEuropeEco = ke.find((item) => item.routeId === "europe" && item.seatClass === "economy");
  const keJapanEco = ke.find((item) => item.routeId === "japan" && item.seatClass === "economy");
  const eligibleAt = (balance) => all.filter((item) => item.milesRequired <= balance).length;
  const pointValueKe = POINT_PROGRAMS.find((program) => program.key === "korean-air").unitValueWon;
  const pointValueOz = POINT_PROGRAMS.find((program) => program.key === "asiana").unitValueWon;
  const aboveKe = ke.filter((item) => item.valuePerMile >= pointValueKe).length;
  const aboveOz = oz.filter((item) => item.valuePerMile >= pointValueOz).length;
  const shortEco = all.filter((item) => item.seatClass === "economy" && ["japan", "china"].includes(item.routeId));
  const shortEcoMax = Math.max(...shortEco.map((item) => item.valuePerMile));
  const ozFirstEurope = oz.find((item) => item.routeId === "europe" && item.seatClass === "first");
  const keFirstEurope = ke.find((item) => item.routeId === "europe" && item.seatClass === "first");

  const findings = [
    `노선 6개 × 좌석 3등급 × 항공사 2곳, 총 ${all.length}개 공제표를 운임으로 나누면 1마일 가치는 ${AIRLINE_NAMES[lowest.airlineId]} ${lowest.routeLabel} ${lowest.seatClass === "economy" ? "이코노미" : lowest.seatClass === "business" ? "비즈니스" : "상위석"} ${won(lowest.valuePerMile)}에서 ${AIRLINE_NAMES[highest.airlineId]} ${highest.routeLabel} ${highest.seatClass === "first" ? "상위석" : "비즈니스"} ${won(highest.valuePerMile)}까지 ${times(highest.valuePerMile / lowest.valuePerMile)} 벌어집니다.`,
    `좌석 등급별 평균은 대한항공 이코노미 ${won(classAvg(ke, "economy"))}·비즈니스 ${won(classAvg(ke, "business"))}·일등석 ${won(classAvg(ke, "first"))}, 아시아나 이코노미 ${won(classAvg(oz, "economy"))}·비즈니스 ${won(classAvg(oz, "business"))}·상위석 ${won(classAvg(oz, "first"))}입니다. 이코노미에서 비즈니스로 올리면 두 항공사 모두 마일 가치가 ${times(classAvg(ke, "business") / classAvg(ke, "economy"))} 안팎으로 뛰고, 상위석은 비즈니스보다 대한항공 ${pct(classAvg(ke, "first") / classAvg(ke, "business") - 1, 0)}, 아시아나 ${pct(classAvg(oz, "first") / classAvg(oz, "business") - 1, 0)} 더 높습니다.`,
    `이코노미 공제 마일은 6개 노선 전부 두 항공사가 ${sameEconomy ? "같습니다" : "다릅니다"}. 차이는 장거리 비즈니스에서 나는데, 유럽 비즈니스가 대한항공 ${formatWon(keBiz.milesRequired)}마일 대 아시아나 ${formatWon(ozBiz.milesRequired)}마일로 아시아나가 ${pct(1 - ozBiz.milesRequired / keBiz.milesRequired, 0)} 적어, 같은 운임 기준 1마일 가치가 ${won(keBiz.valuePerMile)} 대 ${won(ozBiz.valuePerMile)}입니다.`,
    `같은 70,000마일로 ${seventy.map((item) => `${item.routeLabel} ${won(item.cashPrice)}`).join(", ")} 이코노미를 탈 수 있습니다. 공제 마일이 같으니 1마일 가치는 ${won(seventy[0].valuePerMile)}에서 ${won(seventy[seventy.length - 1].valuePerMile)}으로 ${pct(seventy[seventy.length - 1].valuePerMile / seventy[0].valuePerMile - 1, 0)} 차이가 납니다. 장거리 세 노선 중 어디를 고르느냐가 마일 가치를 정합니다.`,
    `대한항공 유럽은 비즈니스가 이코노미보다 마일을 ${times(keBiz.milesRequired / keEuropeEco.milesRequired, 2)} 요구하지만 운임은 ${times(keBiz.cashPrice / keEuropeEco.cashPrice, 2)}입니다. 상위 좌석이 유리한 이유가 이 두 배율의 차이입니다. 일등석은 ${formatWon(keFirstEurope.milesRequired)}마일에 ${won(keFirstEurope.cashPrice)}으로 ${won(keFirstEurope.valuePerMile)}, 아시아나는 ${formatWon(ozFirstEurope.milesRequired)}마일이라 ${won(ozFirstEurope.valuePerMile)}입니다.`,
    `보유 마일에 따라 열리는 공제 항목 수는 30,000마일에 ${eligibleAt(30000)}개, 45,000마일에 ${eligibleAt(45000)}개, 70,000마일에 ${eligibleAt(70000)}개, 125,000마일에 ${eligibleAt(125000)}개입니다. 70,000마일이 장거리 이코노미와 동남아 비즈니스가 동시에 열리는 첫 문턱입니다.`,
    `포인트 전환 계산기는 대한항공 1마일을 ${won(pointValueKe)}, 아시아나를 ${won(pointValueOz)}으로 잡습니다. 이 공제표 기준으로 그 가치 이상이 나오는 항목은 대한항공 18개 중 ${aboveKe}개, 아시아나 18개 중 ${aboveOz}개라, 그 가정은 이코노미 평균보다 높고 비즈니스 평균보다 낮은 지점입니다.`,
    `한일·한중 이코노미 4개 항목은 1마일이 최대 ${won(shortEcoMax)}에 그쳐 ${won(pointValueKe)} 가정의 ${pct(shortEcoMax / pointValueKe, 0)} 수준입니다. 단거리 이코노미에 마일을 쓰면 가정의 절반도 회수하지 못한다는 것이 표에서 바로 나오는 결론입니다.`,
  ];

  return {
    heading: "공제표 36칸을 운임으로 나눠 보면",
    intro: `화면은 보유 마일 하나를 넣어 결과를 보여주지만, 아래는 두 항공사 공제표 전체를 서비스 내 왕복 예시 운임으로 나눠 1마일 가치가 어디서 높고 낮은지 정리한 것입니다. 세금·유류할증료·좌석 재고는 계산에 들어가지 않습니다.`,
    findings,
    basis: `공제표 확인일 ${MILEAGE_VERIFIED_AT}(평수기 성인 1명 왕복). 운임은 서비스 내 예시 운임이며 실제 판매가와 다를 수 있습니다.`,
    facts: {
      count: all.length,
      lowest: { airlineId: lowest.airlineId, routeId: lowest.routeId, seatClass: lowest.seatClass, value: lowest.valuePerMile },
      highest: { airlineId: highest.airlineId, routeId: highest.routeId, seatClass: highest.seatClass, value: highest.valuePerMile },
      keAvg: { economy: classAvg(ke, "economy"), business: classAvg(ke, "business"), first: classAvg(ke, "first") },
      ozAvg: { economy: classAvg(oz, "economy"), business: classAvg(oz, "business"), first: classAvg(oz, "first") },
      eligibleAt70k: eligibleAt(70000),
    },
  };
}

function dutyFreeInsights() {
  const { exemptionLimitUsd, exchangeRate, vatRate } = DUTY_FREE_CONSTANTS;
  const withSimplified = DUTY_FREE_CATEGORIES.filter((category) => category.simplifiedRate != null);
  const simplifiedWins = withSimplified.filter((category) =>
    [900, 1200, 1500, 2000].some(
      (amount) => dutyFreeResult({ purchaseAmountUsd: amount, category: category.id }).isSimplifiedBetter,
    ),
  );
  const rateRows = [...new Set(DUTY_FREE_CATEGORIES.map((category) => category.tariffRate))]
    .sort((a, b) => a - b)
    .map((tariffRate) => ({
      tariffRate,
      stacked: stackedRate(tariffRate, vatRate),
      labels: DUTY_FREE_CATEGORIES.filter((category) => category.tariffRate === tariffRate).map((category) => category.label),
    }));
  const cosmetics1000 = dutyFreeResult({ purchaseAmountUsd: 1000, category: "cosmetics" });
  const alcohol1000 = dutyFreeResult({ purchaseAmountUsd: 1000, category: "alcohol" });
  const clothing1500 = dutyFreeResult({ purchaseAmountUsd: 1500, category: "clothing" });
  const justOver = dutyFreeResult({ purchaseAmountUsd: exemptionLimitUsd + 1, category: "cosmetics" });
  const tenPercentAt = (tariffRate) => Math.ceil((exemptionLimitUsd * stackedRate(tariffRate, vatRate)) / (stackedRate(tariffRate, vatRate) - 0.1));
  const perHundred = (tariffRate) => Math.round(100 * exchangeRate * stackedRate(tariffRate, vatRate));
  const customsGap = exchangeRate - CUSTOMS_MODEL.exchangeRate;
  const overageTaxAtCustomsRate = Math.round(200 * CUSTOMS_MODEL.exchangeRate * stackedRate(0.08, vatRate));
  const cosmeticsSimplified = withSimplified.find((category) => category.id === "cosmetics");
  const clothingSimplified = withSimplified.find((category) => category.id === "clothing");

  const findings = [
    `간이세율은 이 계산기에서 한 번도 선택되지 않습니다. 관세 8%에 부가세를 얹은 실효세율 ${pct(stackedRate(0.08, vatRate))}가 간이세율 ${pct(cosmeticsSimplified.simplifiedRate, 0)}보다 낮고, 13% 품목도 ${pct(stackedRate(0.13, vatRate))} 대 ${pct(clothingSimplified.simplifiedRate, 0)}로 정식 계산이 항상 낮습니다. 간이세율이 붙은 ${withSimplified.length}개 품목 중 간이세율이 이기는 경우는 ${simplifiedWins.length}건입니다.`,
    `과세 대상 금액에 실제로 붙는 세율은 관세율에 부가세가 곱해져 ${rateRows.map((row) => `${pct(row.tariffRate, 0)} 품목(${row.labels.join("·")}) ${pct(row.stacked)}`).join(", ")}입니다. 관세 40%가 세금 40%가 아니라 ${pct(rateRows[rateRows.length - 1].stacked)}가 되는 이유가 부가세 산식입니다.`,
    `면세 한도 ${usd(exemptionLimitUsd)}는 초과분에만 과세하는 구조라 절벽이 없습니다. ${usd(exemptionLimitUsd + 1)}를 사면 화장품 기준 세금은 ${won(justOver.finalTax)}입니다. 해외직구 관세 계산기의 ${usd(CARD_CUSTOMS_CATEGORIES[0].thresholdUsd)} 기준은 총액 전체에 과세하는 전부-아니면-전무 방식이라, 두 계산기의 한도는 성격이 다릅니다.`,
    `${usd(1000)}짜리 화장품은 과세 대상이 ${usd(cosmetics1000.taxableAmountUsd)}(${won(cosmetics1000.taxableAmountKrw)})이고 세금은 ${won(cosmetics1000.finalTax)}, 구매액 전체 대비 ${pct(cosmetics1000.effectiveTaxRate, 2)}입니다. 같은 금액의 주류는 ${won(alcohol1000.finalTax)}으로 화장품의 ${times(alcohol1000.finalTax / cosmetics1000.finalTax)}입니다.`,
    `구매액 전체 대비 세금이 10%를 넘는 지점은 8% 품목 ${usd(tenPercentAt(0.08))}, 13% 품목 ${usd(tenPercentAt(0.13))}, 주류 ${usd(tenPercentAt(0.3))}, 담배 ${usd(tenPercentAt(0.4))}부터입니다. 한도 아래 ${usd(exemptionLimitUsd)}가 분모에 그대로 남기 때문에 총액 기준 세율은 천천히 올라갑니다.`,
    `한도를 넘는 ${usd(100)}마다 붙는 세금은 8% 품목 ${won(perHundred(0.08))}, 13% 품목 ${won(perHundred(0.13))}, 주류 ${won(perHundred(0.3))}, 담배 ${won(perHundred(0.4))}입니다. 초과분이 같아도 품목에 따라 세금이 ${times(perHundred(0.4) / perHundred(0.08))} 차이 납니다.`,
    `${usd(1500)} 의류는 과세 대상 ${usd(clothing1500.taxableAmountUsd)}에 세금 ${won(clothing1500.finalTax)}, 총비용 ${won(clothing1500.totalCostKrw)}으로 구매액의 ${pct(clothing1500.effectiveTaxRate)}가 세금입니다. 간이세율 상한 ${usd(clothingSimplified.simplifiedMaxUsd)} 안쪽인데도 정식 계산이 선택됩니다.`,
    `이 계산기의 가정 환율은 1달러 ${won(exchangeRate)}이고 해외직구 관세 계산기는 ${won(CUSTOMS_MODEL.exchangeRate)}을 씁니다. ${won(customsGap)} 차이는 8% 품목의 ${usd(200)} 초과분에서 세금 ${won(cosmetics1000.finalTax)} 대 ${won(overageTaxAtCustomsRate)}, 즉 ${won(cosmetics1000.finalTax - overageTaxAtCustomsRate)} 차이로 나타납니다. 둘 다 관세청 고시환율이 아닌 비교용 가정입니다.`,
  ];

  return {
    heading: "품목 10개와 금액 구간을 한 표에 놓으면",
    intro: `화면은 금액과 품목 하나를 골라 세액을 보여주지만, 아래는 품목 ${DUTY_FREE_CATEGORIES.length}개의 관세율과 간이세율을 ${usd(exemptionLimitUsd)} 한도 위 여러 금액에 동시에 대입해 어떤 산식이 선택되고 세율이 어디서 꺾이는지 확인한 결과입니다.`,
    findings,
    basis: `세율·한도 확인일 ${DUTY_FREE_VERIFIED_AT}. 가정 환율 1달러 ${won(exchangeRate)}(관세청 고시환율 아님).`,
    facts: {
      simplifiedWins: simplifiedWins.length,
      cosmetics1000Tax: cosmetics1000.finalTax,
      alcohol1000Tax: alcohol1000.finalTax,
      clothing1500Tax: clothing1500.finalTax,
      justOverTax: justOver.finalTax,
    },
  };
}

function creditVsDebitInsights() {
  const defaults = { monthlySpend: 1200000, annualFee: 20000, creditRate: 0.018, debitRate: 0.007 };
  const base = creditVsDebit(defaults);
  const gap = defaults.creditRate - defaults.debitRate;
  const fees = [...new Set(ANNUAL_FEE_CARDS.map((card) => card.annualFee))].sort((a, b) => a - b);
  const feeRows = fees.map((annualFee) => ({ annualFee, breakEven: creditVsDebit({ ...defaults, annualFee }).breakEvenSpend }));
  const gapRows = [0.001, 0.003, 0.005, 0.011].map((rateGap) => ({
    rateGap,
    breakEven: creditVsDebit({ ...defaults, creditRate: defaults.debitRate + rateGap }).breakEvenSpend,
  }));
  const flipGap = defaults.annualFee / (defaults.monthlySpend * 12);
  const feeAsRate = (annualFee) => annualFee / (defaults.monthlySpend * 12);
  const minInput = creditVsDebit({ ...defaults, monthlySpend: 100000 });
  const zeroFee = creditVsDebit({ ...defaults, annualFee: 0 });
  const lowestMinSpend = Math.min(...ANNUAL_FEE_CARDS.map((card) => card.minSpend));
  const highestFee = Math.max(...fees);

  const findings = [
    `화면 기본값(월 ${won(defaults.monthlySpend)}, 연회비 ${won(defaults.annualFee)}, 신용 ${pct(defaults.creditRate)} 대 체크 ${pct(defaults.debitRate)})에서 연 혜택은 신용 ${won(base.annualCreditBenefit)} 대 체크 ${won(base.annualDebitBenefit)}으로 신용이 ${won(base.gap)} 앞섭니다. 손익분기 지출은 월 ${won(base.breakEvenSpend)}이라 기본값은 분기점의 ${times(defaults.monthlySpend / base.breakEvenSpend)} 지점에 있습니다.`,
    `연회비를 연회비 회수 계산기의 카드 8장 값으로 바꾸면 손익분기 지출은 ${feeRows.map((row) => `${won(row.annualFee)}→월 ${won(row.breakEven)}`).join(", ")}입니다. 연회비가 ${times(highestFee / fees[0])}가 되면 분기점도 정확히 ${times(highestFee / fees[0])}가 되는 선형 관계입니다.`,
    `분기점을 움직이는 다른 변수는 혜택률 차이입니다. 연회비 ${won(defaults.annualFee)}에서 차이가 ${gapRows.map((row) => `${pctPoint(row.rateGap)}면 월 ${won(row.breakEven)}`).join(", ")}입니다. 차이가 ${pctPoint(gapRows[0].rateGap)}로 좁아지면 분기점이 기본 지출 ${won(defaults.monthlySpend)}을 넘어 체크카드가 이깁니다.`,
    `기본 지출 ${won(defaults.monthlySpend)}을 고정하면 승자가 바뀌는 혜택률 차이는 ${pctPoint(flipGap, 2)}입니다. 신용카드 혜택률이 체크카드보다 이만큼도 높지 않다면 연회비 ${won(defaults.annualFee)}을 회수하지 못합니다.`,
    `연회비를 연간 결제액 대비 비율로 바꾸면 ${won(defaults.annualFee)}은 ${pct(feeAsRate(defaults.annualFee), 2)}, ${won(highestFee)}은 ${pct(feeAsRate(highestFee), 2)}입니다. 신용카드 혜택률에서 이 비율을 빼야 체크카드 혜택률과 같은 자리에서 비교됩니다.`,
    `입력 하한인 월 ${won(100000)}에서는 신용 ${won(minInput.annualCreditBenefit)} 대 체크 ${won(minInput.annualDebitBenefit)}으로 체크카드가 이깁니다. 같은 혜택률 차이라도 연회비가 고정비라 지출이 작을수록 신용카드가 불리해지는 구조이며, 그 경계가 월 ${won(base.breakEvenSpend)}입니다.`,
    `연회비를 0원으로 두면 신용 ${won(zeroFee.annualCreditBenefit)} 대 체크 ${won(zeroFee.annualDebitBenefit)}으로 지출 규모와 무관하게 혜택률이 높은 쪽이 이기고 손익분기 지출은 계산되지 않습니다. 연회비 면제 조건을 채우는 경우가 이 시나리오에 해당합니다.`,
    `연회비 회수 계산기의 카드 8장은 전월 실적이 최소 ${won(lowestMinSpend)}부터 시작합니다. 기본값의 손익분기 ${won(base.breakEvenSpend)}이 그보다 낮으므로 실제로 신용카드를 막는 것은 손익분기가 아니라 실적 문턱이며, 이 비교기는 실적과 소득공제율 차이를 반영하지 않습니다.`,
  ];

  return {
    heading: "손익분기 지출을 연회비·혜택률 전 구간에서 풀면",
    intro: `이 비교기는 월 지출·연회비·두 혜택률 네 값으로 승자를 정합니다. 아래는 화면 기본값을 출발점으로 연회비와 혜택률 차이를 각각 흔들어 손익분기 지출이 어떻게 움직이는지 계산한 결과입니다.`,
    findings,
    table: {
      head: ["연회비", "손익분기 월 지출"],
      rows: feeRows.map((row) => [won(row.annualFee), won(row.breakEven)]),
    },
    basis: `산식: 손익분기 지출 = 연회비 ÷ ((신용 혜택률 - 체크 혜택률) × 12). 연회비 값은 연회비 회수 계산기 데이터(확인일 ${CARD_BENEFIT_DATA_VERIFIED_AT})에서 가져왔습니다.`,
    facts: {
      base,
      feeRows,
      gapRows,
      minInput,
      zeroFee,
    },
  };
}

function pointConvertInsights() {
  const defaults = 120000;
  const rows = pointConversions(defaults);
  const top = rows[0];
  const bottom = rows[rows.length - 1];
  const hotel = POINT_PROGRAMS.find((program) => program.key === "hotel");
  const hotelRow = rows.find((row) => row.key === "hotel");
  const hotelEffective = hotel.unitValueWon / hotel.pointsPerUnit;
  const minRows = pointConversions(1000);
  const minHotel = minRows.find((row) => row.key === "hotel");
  const ke = POINT_PROGRAMS.find((program) => program.key === "korean-air");
  const oz = POINT_PROGRAMS.find((program) => program.key === "asiana");
  const keValues = mileageValues("korean-air");
  const ozValues = mileageValues("asiana");
  const avg = (values) => sum(values.map((item) => item.valuePerMile)) / values.length;
  const keEco = avg(keValues.filter((item) => item.seatClass === "economy"));
  const keBiz = avg(keValues.filter((item) => item.seatClass === "business"));
  const japanEco = keValues.find((item) => item.routeId === "japan" && item.seatClass === "economy");
  const europeBizOz = ozValues.find((item) => item.routeId === "europe" && item.seatClass === "business");
  const europeBizKe = keValues.find((item) => item.routeId === "europe" && item.seatClass === "business");
  const woori = ANNUAL_FEE_CARDS.find((card) => card.id === "woori-card-ui");
  const milesForFee = Math.ceil(woori.annualFee / ke.unitValueWon);
  const milesForFeeShort = Math.ceil(woori.annualFee / japanEco.valuePerMile);
  const oddLoss = 1001 - Math.floor(1001 / hotel.pointsPerUnit) * hotel.pointsPerUnit;

  const findings = [
    `기본값 ${formatWon(defaults)}포인트를 네 가지로 바꾸면 ${rows.map((row) => `${row.label} ${won(row.estimatedValue)}`).join(", ")}입니다. 가장 높은 ${top.label}과 가장 낮은 ${bottom.label}의 차이는 ${times(top.estimatedValue / bottom.estimatedValue, 0)}입니다.`,
    `${hotel.label}는 1단위에 ${won(hotel.unitValueWon)}이지만 ${hotel.pointsPerUnit}포인트가 1단위라 포인트당 실질 가치는 ${wonDec(hotelEffective)}입니다. 단위 가치만 보면 ${oz.label}(${won(oz.unitValueWon)})의 ${pct(hotel.unitValueWon / oz.unitValueWon, 0)}인데 포인트당으로는 ${pct(hotelEffective / oz.unitValueWon, 0)}로 내려갑니다.`,
    `단위 환산은 내림이라 ${hotel.pointsPerUnit}로 나눠지지 않는 포인트는 버려집니다. ${formatWon(1001)}포인트를 넣으면 ${oddLoss}포인트가 환산에서 빠지고, 기본값 ${formatWon(defaults)}포인트는 ${formatWon(hotelRow.units)}단위로 딱 나눠져 손실이 없습니다.`,
    `입력 하한 ${formatWon(1000)}포인트에서는 ${minRows.map((row) => `${row.label} ${won(row.estimatedValue)}`).join(", ")}입니다. ${hotel.label}만 ${won(minHotel.estimatedValue)}으로 ${formatWon(1000)}에 ${wonDec(hotelEffective)}을 곱한 값(${won(1000 * hotelEffective)})보다 작은데, 내림 때문입니다.`,
    `${ke.label} ${won(ke.unitValueWon)} 가정은 마일리지 가치 계산기의 공제표와 대보면 이코노미 평균 ${won(keEco)}과 비즈니스 평균 ${won(keBiz)} 사이에 있습니다. 어느 좌석에 쓸지 정해지지 않았다면 ${won(ke.unitValueWon)}은 낙관도 비관도 아닌 중간값입니다.`,
    `${ke.label}과 ${oz.label}의 가정 차이는 ${won(ke.unitValueWon - oz.unitValueWon)}(${pct(ke.unitValueWon / oz.unitValueWon - 1, 1)})이지만, 공제표에서는 유럽 비즈니스가 아시아나 ${won(europeBizOz.valuePerMile)} 대 대한항공 ${won(europeBizKe.valuePerMile)}으로 순서가 반대입니다. 장거리 비즈니스에 쓸 계획이면 이 페이지의 순위와 실제 회수 순위가 뒤집힙니다.`,
    `한일 이코노미처럼 1마일이 ${won(japanEco.valuePerMile)}에 그치는 사용처에 쓰면 ${formatWon(defaults)}마일의 실현 가치는 ${won(defaults * japanEco.valuePerMile)}으로 이 페이지 추정 ${won(top.estimatedValue)}의 ${pct(japanEco.valuePerMile / ke.unitValueWon, 0)}입니다. 추정치는 사용처가 정해질 때까지 상한에 가깝습니다.`,
    `연회비 회수 계산기의 여행 특화 카드 연회비 ${won(woori.annualFee)}을 마일로 갚으려면 ${won(ke.unitValueWon)} 가정에서 ${formatWon(milesForFee)}마일, 한일 이코노미 실현 가치로는 ${formatWon(milesForFeeShort)}마일이 필요합니다. 같은 연회비를 두고 필요한 마일이 ${times(milesForFeeShort / milesForFee)} 벌어지는 셈입니다.`,
  ];

  return {
    heading: "환산 가정 네 줄을 실제 공제표에 대보면",
    intro: `이 계산기는 프로그램 ${POINT_PROGRAMS.length}개의 포인트당 가치를 고정값으로 두고 환산합니다. 아래는 그 가정이 내림 규칙과 만나 어디서 값이 깎이는지, 그리고 마일리지 가치 계산기의 공제표와 대보면 어느 자리에 놓이는지 계산한 결과입니다.`,
    findings,
    basis: `환산 가정: ${POINT_PROGRAMS.map((program) => `${program.label} ${program.pointsPerUnit}포인트=${won(program.unitValueWon)}`).join(", ")}. 공제표 확인일 ${MILEAGE_VERIFIED_AT}.`,
    facts: {
      defaults: Object.fromEntries(rows.map((row) => [row.key, row.estimatedValue])),
      minimum: Object.fromEntries(minRows.map((row) => [row.key, row.estimatedValue])),
      keEco,
      keBiz,
    },
  };
}

function billingCycleInsights() {
  const { monthDays, graceDays } = BILLING_MODEL;
  const base = billingCycle(15, 14);
  const worst = billingCycle(14, 14);
  const firstDayRows = BILLING_DAY_OPTIONS.map((billingDay) => ({ billingDay, usable: billingCycle(1, billingDay).usableDays }));
  const paydayRows = BILLING_DAY_OPTIONS.map((billingDay) => ({ billingDay, usable: billingCycle(25, billingDay).usableDays }));
  const paydayBest = [...paydayRows].sort(byDesc("usable"))[0];
  const paydayWorst = [...paydayRows].sort(byAsc("usable"))[0];
  const average = (billingDay) =>
    sum(Array.from({ length: monthDays }, (_, index) => billingCycle(index + 1, billingDay).usableDays)) / monthDays;
  const averages = BILLING_DAY_OPTIONS.map(average);
  const sameAverage = averages.every((value) => Math.abs(value - averages[0]) < 1e-9);
  const thisMonthDays = (billingDay) => Array.from({ length: monthDays }, (_, index) => index + 1).filter((day) => billingCycle(day, billingDay).billedThisMonth).length;
  const pairFloor = Math.min(
    ...Array.from({ length: monthDays }, (_, index) =>
      Math.max(billingCycle(index + 1, 1).usableDays, billingCycle(index + 1, 14).usableDays),
    ),
  );
  const pairFloorSingle = Math.min(...Array.from({ length: monthDays }, (_, index) => billingCycle(index + 1, 14).usableDays));

  const findings = [
    `화면 기본값(구매 15일, 결제일 14일)은 우연이 아니라 최적 조합입니다. 결제일 다음 날 구매가 사용 주기 ${base.cycleDays}일에 유예 ${graceDays}일을 더해 ${base.usableDays}일로 가장 길고, 결제일 당일 구매는 주기 ${worst.cycleDays}일에 유예를 더한 ${worst.usableDays}일로 가장 짧습니다. 같은 카드, 같은 결제일에서 하루 차이로 ${base.usableDays - worst.usableDays}일이 갈립니다.`,
    `매달 1일에 구매하는 사람의 무이자 사용 일수는 결제일 ${firstDayRows.map((row) => `${row.billingDay}일→${row.usable}일`).join(", ")}입니다. 결제일이 늦을수록 길어지며, 1일과 27일의 차이가 ${firstDayRows[firstDayRows.length - 1].usable - firstDayRows[0].usable}일입니다.`,
    `25일 월급을 받은 직후 구매한다면 결제일 ${paydayBest.billingDay}일이 ${paydayBest.usable}일로 가장 길고 결제일 ${paydayWorst.billingDay}일이 ${paydayWorst.usable}일로 가장 짧습니다. 월급일과 결제일을 맞추는 흔한 조언은 잔고 관리에는 맞지만 무이자 기간으로는 최악의 선택입니다.`,
    `결제일을 어디에 두어도 31일 전체의 평균 사용 일수는 ${sameAverage ? `${averages[0]}일로 같습니다` : "다릅니다"}. 결제일 변경은 평균을 늘리는 것이 아니라 어떤 날짜의 구매가 유리해지는지 재배치하는 일입니다.`,
    `결제일 14일이면 1~14일 구매(${thisMonthDays(14)}일)는 이번 달 청구, 15~31일 구매(${monthDays - thisMonthDays(14)}일)는 다음 달 청구입니다. 결제일 1일이면 이번 달 청구는 ${thisMonthDays(1)}일치뿐이고 나머지 ${monthDays - thisMonthDays(1)}일은 전부 다음 달로 넘어갑니다.`,
    `이 계산기는 한 달을 ${monthDays}일, 청구 후 유예를 ${graceDays}일로 고정합니다. 30일 달에는 주기가 하루 짧아지고 유예 일수는 카드사마다 다르므로, 화면의 일수는 상한에 가까운 추정치입니다.`,
    `결제일 14일 카드 한 장만 쓰면 구매 날짜에 따라 사용 일수가 최소 ${pairFloorSingle}일까지 내려갑니다. 결제일 1일 카드를 더해 매 구매에 유리한 쪽을 고르면 최소값이 ${pairFloor}일로 올라갑니다. 두 장의 결제일을 반달 간격으로 벌리는 근거가 이 숫자입니다.`,
    `최장 ${base.bestUsableDays}일은 결제일 선택지 ${BILLING_DAY_OPTIONS.length}개 어디에서나 결제일 다음 날 구매로 얻습니다. 결제일 자체가 길이를 정하는 것이 아니라 구매 날짜와 결제일의 간격이 정한다는 것이 이 표의 결론입니다.`,
  ];

  return {
    heading: "결제일 8개와 구매일 31개를 전부 조합하면",
    intro: `화면은 구매일과 결제일 한 쌍의 사용 일수를 보여주지만, 아래는 결제일 선택지 ${BILLING_DAY_OPTIONS.length}개와 구매일 ${monthDays}개 조합 ${BILLING_DAY_OPTIONS.length * monthDays}개를 전부 계산해 어디가 길고 어디가 짧은지 정리한 것입니다.`,
    findings,
    table: {
      head: ["결제일", "1일 구매", "25일 구매"],
      rows: BILLING_DAY_OPTIONS.map((billingDay) => [
        `${billingDay}일`,
        `${billingCycle(1, billingDay).usableDays}일`,
        `${billingCycle(25, billingDay).usableDays}일`,
      ]),
    },
    basis: `계산 모델: 한 달 ${monthDays}일, 청구 후 유예 ${graceDays}일 고정. 실제 유예 기간은 카드사 약관에 따릅니다.`,
    facts: {
      base,
      worst,
      firstDayRows,
      paydayRows,
      average: averages[0],
      pairFloor,
    },
  };
}

function customsInsights() {
  const defaults = { productUsd: 280, shippingUsd: 20, categoryKey: "fashion" };
  const base = customs(defaults);
  const threshold = CARD_CUSTOMS_CATEGORIES[0].thresholdUsd;
  const { exchangeRate, vatRate } = CUSTOMS_MODEL;
  const cliffRows = CARD_CUSTOMS_CATEGORIES.map((category) => ({
    label: category.label,
    stacked: stackedRate(category.tariffRate, vatRate),
    cliff: customs({ productUsd: threshold + 0.01, shippingUsd: 0, categoryKey: category.key }).totalTax,
  }));
  const shippingPush = customs({ productUsd: 140, shippingUsd: 20, categoryKey: "electronics" });
  const shippingSafe = customs({ productUsd: 140, shippingUsd: 10, categoryKey: "electronics" });
  const golf300 = customs({ productUsd: 300, shippingUsd: 0, categoryKey: "golf" });
  const maxInput = customs({ productUsd: 20000, shippingUsd: 3000, categoryKey: "golf" });
  const thresholdKrw = threshold * exchangeRate;
  const travelerSame = dutyFreeResult({ purchaseAmountUsd: 300, category: "clothing" });
  const rateGap = DUTY_FREE_CONSTANTS.exchangeRate - exchangeRate;

  const findings = [
    `화면 기본값(의류·신발 ${usd(defaults.productUsd)} + 배송비 ${usd(defaults.shippingUsd)})은 총액 ${usd(base.totalUsd)}로 한도를 넘어 관세 ${won(base.tariff)}에 부가세 ${won(base.vat)}이 붙고 세금 합계 ${won(base.totalTax)}, 최종 비용 ${won(base.landedCost)}입니다. 세금은 총액의 ${pct(base.totalTax / (base.totalUsd * exchangeRate))}입니다.`,
    `${usd(threshold)} 한도는 초과분이 아니라 총액 전체에 과세하는 절벽입니다. 총액 ${usd(threshold)}면 세금 0원, 1센트만 넘으면 ${cliffRows.map((row) => `${row.label} ${won(row.cliff)}`).join(", ")}이 한 번에 붙습니다.`,
    `배송비도 총액에 들어갑니다. 전자기기 ${usd(140)}에 배송비 ${usd(20)}이면 총액 ${usd(shippingPush.totalUsd)}로 과세 대상이 되어 세금 ${won(shippingPush.totalTax)}이지만, 배송비가 ${usd(10)}이면 총액 ${usd(shippingSafe.totalUsd)}로 세금 ${won(shippingSafe.totalTax)}입니다. 배송비 ${usd(10)} 차이가 세금 ${won(shippingPush.totalTax - shippingSafe.totalTax)}으로 바뀝니다.`,
    `과세되는 순간 총액에 붙는 실효세율은 ${cliffRows.map((row) => `${row.label} ${pct(row.stacked)}`).join(", ")}입니다. 관세 20%인 골프용품이 32%가 되는 이유는 부가세 10%가 관세를 포함한 금액에 다시 붙기 때문입니다.`,
    `같은 ${usd(300)} 의류를 여행자가 들고 들어오면 면세 한도 계산기 기준 ${usd(DUTY_FREE_CONSTANTS.exemptionLimitUsd)} 아래라 세금 ${won(travelerSame.finalTax)}이고, 직구 소포로 받으면 이 계산기 기준 ${won(customs({ productUsd: 300, shippingUsd: 0, categoryKey: "fashion" }).totalTax)}입니다. 한도가 ${usd(DUTY_FREE_CONSTANTS.exemptionLimitUsd)} 대 ${usd(threshold)}, 방식이 초과분 과세 대 총액 과세로 두 번 갈립니다.`,
    `골프용품 ${usd(300)}는 세금 ${won(golf300.totalTax)}을 더해 최종 ${won(golf300.landedCost)}, 물품가의 ${times(golf300.landedCost / (300 * exchangeRate), 2)}입니다. 국내 판매가와 비교할 때는 물품가가 아니라 이 배율을 곱한 값을 놓아야 합니다.`,
    `이 계산기의 환율은 1달러 ${won(exchangeRate)}으로 고정이라 ${usd(threshold)} 한도는 원화로 ${won(thresholdKrw)}입니다. 면세 한도 계산기의 가정 환율 ${won(DUTY_FREE_CONSTANTS.exchangeRate)}과 ${won(rateGap)} 차이가 있으며, 둘 다 관세청 고시환율이 아닙니다.`,
    `입력 상한(물품 ${usd(20000)} + 배송 ${usd(3000)})을 골프용품으로 넣으면 세금 ${won(maxInput.totalTax)}, 최종 ${won(maxInput.landedCost)}입니다. 이 계산기는 세 품목 모두 ${usd(threshold)} 한도를 쓰고 미국발 ${usd(200)} 특례나 목록통관 여부는 반영하지 않으므로, 미국 직구는 실제 세금이 화면보다 적을 수 있습니다.`,
  ];

  return {
    heading: "150달러 절벽을 세 품목과 배송비에 걸쳐 재 보면",
    intro: `화면은 물품가·배송비·품목 한 세트의 세금을 보여주지만, 아래는 ${usd(threshold)} 한도 앞뒤와 품목 ${CARD_CUSTOMS_CATEGORIES.length}개, 입력 상한까지 넣어 세금이 어디서 0에서 수만 원으로 뛰는지 확인한 결과입니다.`,
    findings,
    basis: `계산 모델: 1달러 ${won(exchangeRate)} 고정, 부가세 ${pct(vatRate, 0)}, 세 품목 공통 한도 ${usd(threshold)}. 관세청 고시환율·미국발 특례는 반영하지 않습니다.`,
    facts: {
      base,
      cliffRows,
      shippingPush,
      shippingSafe,
      golf300,
      maxInput,
      travelerSameTax: travelerSame.finalTax,
    },
  };
}

// ---------------------------------------------------------------------------
// Registry + HTML
// ---------------------------------------------------------------------------
const BUILDERS = {
  "/annual-fee": annualFeeInsights,
  "/overseas-payment": overseasInsights,
  "/fuel-card": fuelCardInsights,
  "/min-spend": minSpendInsights,
  "/mileage": mileageInsights,
  "/duty-free": dutyFreeInsights,
  "/credit-vs-debit": creditVsDebitInsights,
  "/point-convert": pointConvertInsights,
  "/billing-cycle": billingCycleInsights,
  "/customs": customsInsights,
};

export const INSIGHT_ROUTES = Object.keys(BUILDERS);

export function insightsFor(route) {
  const builder = BUILDERS[route];
  return builder ? builder() : null;
}

const H2 = "font-size:20px;line-height:1.35;margin:28px 0 10px;padding-bottom:6px;border-bottom:2px solid hsl(var(--border));color:hsl(var(--foreground));";
const P = "margin:0 0 10px;";
const OL = "margin:0 0 12px 20px;padding:0;";
const LI = "margin-bottom:8px;";
const TABLE = "width:100%;border-collapse:collapse;margin:10px 0 16px;font-size:14px;";
const TH = "padding:8px 10px;background:hsl(var(--muted));text-align:left;border:1px solid hsl(var(--border));color:hsl(var(--foreground));font-weight:600;";
const TD = "padding:8px 10px;border:1px solid hsl(var(--border));";
const NOTE = "font-size:13px;color:hsl(var(--muted-foreground));margin:0 0 10px;";

function renderTable(table) {
  if (!table) return "";
  const head = table.head.map((cell) => `<th style="${TH}">${cell}</th>`).join("");
  const rows = table.rows
    .map((row) => `<tr>${row.map((cell) => `<td style="${TD}">${cell}</td>`).join("")}</tr>`)
    .join("");
  return `<table style="${TABLE}"><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table>`;
}

export function buildInsightsSection(route) {
  const insights = insightsFor(route);
  if (!insights) return "";
  const items = insights.findings.map((finding) => `<li style="${LI}">${finding}</li>`).join("");
  return (
    `<section data-card-insights="${route.slice(1)}">` +
    `<h2 style="${H2}">${insights.heading}</h2>` +
    `<p style="${P}">${insights.intro}</p>` +
    `<ol style="${OL}">${items}</ol>` +
    renderTable(insights.table) +
    `<p style="${NOTE}">${insights.basis}</p>` +
    `</section>`
  );
}

/** Visible text of one insight section, for similarity and length checks. */
export function insightsPlainText(route) {
  return buildInsightsSection(route)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
