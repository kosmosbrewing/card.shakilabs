import { describe, expect, it } from "vitest";
import {
  INSIGHT_ROUTES,
  buildInsightsSection,
  insightsFor,
  insightsPlainText,
} from "../../scripts/card-insights.mjs";
import { buildRichContent } from "../../scripts/prerender-content.mjs";
import { SITEMAP_ROUTES } from "../../scripts/seo-routes.mjs";
import { ANNUAL_FEE_CARDS, createDefaultSpendingPattern } from "@/data/annualFeeCards";
import { DCC_MARKUP } from "@/data/exchangeRates";
import { FUEL_CARDS } from "@/data/fuelCards";
import { OVERSEAS_CARDS } from "@/data/overseasCards";
import { createDefaultSpendingMap } from "@/data/spendingCategories";
import { calculateAnnualFeeCard } from "@/utils/annualFeeCalculator";
import { calculateCardSavings } from "@/utils/calculator";
import {
  calculateBillingCycle,
  calculateCustoms,
  calculatePointConversions,
  compareCreditVsDebit,
} from "@/utils/cardTabCalculator";
import { calculateDutyFree } from "@/utils/dutyFreeCalculator";
import { calculateMileageValue } from "@/utils/mileageCalculator";
import { calculateMinSpendCard } from "@/utils/minSpendCalculator";
import { calculateOverseasPayment } from "@/utils/overseasCalculator";

// The insight builders return loosely typed objects from a .mjs module; the
// facts are addressed by key here.
type Facts = Record<string, any>;
const factsOf = (route: string): Facts => insightsFor(route)!.facts as Facts;

// Ratcliff/Obershelp similarity, the same measure difflib.SequenceMatcher.ratio()
// reports, so the gate value here is comparable to the audit numbers recorded in
// the repository (variant subgroups measured 0.92-0.97 before consolidation).
function longestCommonSubstring(a: string, b: string): [number, number, number] {
  let best: [number, number, number] = [0, 0, 0];
  let previous = new Array<number>(b.length + 1).fill(0);
  for (let i = 1; i <= a.length; i += 1) {
    const current = new Array<number>(b.length + 1).fill(0);
    for (let j = 1; j <= b.length; j += 1) {
      if (a[i - 1] === b[j - 1]) {
        current[j] = previous[j - 1] + 1;
        if (current[j] > best[2]) best = [i - current[j], j - current[j], current[j]];
      }
    }
    previous = current;
  }
  return best;
}

function matchingCharacters(a: string, b: string): number {
  if (a.length === 0 || b.length === 0) return 0;
  const [ai, bi, size] = longestCommonSubstring(a, b);
  if (size === 0) return 0;
  return (
    size +
    matchingCharacters(a.slice(0, ai), b.slice(0, bi)) +
    matchingCharacters(a.slice(ai + size), b.slice(bi + size))
  );
}

function similarity(a: string, b: string): number {
  const total = a.length + b.length;
  return total === 0 ? 1 : (2 * matchingCharacters(a, b)) / total;
}

// Sentences the site has already had to remove once: a promised refresh cadence
// the data does not keep (#54, #55). They must not come back through this door.
const CADENCE_PROMISE = /매월\s*\S*\s*(반영|갱신|업데이트)|주\s*1회|매주|정기적으로\s*(갱신|업데이트)/;

const MIN_FINDINGS = 8;
const PAIRWISE_CEILING = 0.5;
const EXISTING_BODY_CEILING = 0.85;

describe("card insight sections", () => {
  it("covers every calculator page in the sitemap and nothing else", () => {
    const calculatorRoutes = SITEMAP_ROUTES.filter(
      (route: string) => !["/", "/all", "/about", "/terms", "/privacy"].includes(route),
    );
    expect([...INSIGHT_ROUTES].sort()).toEqual([...calculatorRoutes].sort());
  });

  it("gives every route at least eight numeric findings and a dated basis line", () => {
    for (const route of INSIGHT_ROUTES) {
      const insights = insightsFor(route)!;
      expect(insights.findings.length, route).toBeGreaterThanOrEqual(MIN_FINDINGS);
      for (const finding of insights.findings) {
        // A finding without a number is a restated opinion, not a derived fact.
        expect(finding, `${route}: ${finding.slice(0, 60)}`).toMatch(/\d/);
        expect(finding.length, route).toBeGreaterThan(60);
      }
      expect(insights.basis, route).toMatch(/\d{4}-\d{2}-\d{2}|고정|산식/);
      expect(insights.intro.length, route).toBeGreaterThan(60);
    }
  });

  it("keeps the sections distinct from each other and from the existing guide", () => {
    const texts = INSIGHT_ROUTES.map((route) => [route, insightsPlainText(route)] as const);
    for (let i = 0; i < texts.length; i += 1) {
      for (let j = i + 1; j < texts.length; j += 1) {
        const score = similarity(texts[i][1], texts[j][1]);
        expect(score, `${texts[i][0]} vs ${texts[j][0]}`).toBeLessThan(PAIRWISE_CEILING);
      }
    }
    for (const [route, text] of texts) {
      const withoutInsights = buildRichContent(route)
        .replace(/<section data-card-insights=[\s\S]*?<\/section>/, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      expect(similarity(text, withoutInsights), route).toBeLessThan(EXISTING_BODY_CEILING);
    }
  });

  it("ships inside the prerendered body without FAQ markers, a second H1 or cadence promises", () => {
    for (const route of INSIGHT_ROUTES) {
      const html = buildRichContent(route);
      expect(html, route).toContain(`data-card-insights="${route.slice(1)}"`);
      const section = buildInsightsSection(route);
      expect(section).not.toMatch(/<h1[\s>]/i);
      // prerender.mjs turns "<h2>FAQ ...</h2>" into FAQPage entities; an insight
      // heading must never be mistaken for one.
      expect(section).not.toMatch(/<h2[^>]*>\s*FAQ/);
      expect(section).not.toMatch(/Q\d+\.\s/);
      expect(insightsPlainText(route)).not.toMatch(CADENCE_PROMISE);
    }
  });
});

describe("card insight facts agree with the TypeScript engines", () => {
  it("/annual-fee: default-pattern results per card", () => {
    const facts = factsOf("/annual-fee");
    const spending = createDefaultSpendingPattern();
    for (const card of ANNUAL_FEE_CARDS) {
      const result = calculateAnnualFeeCard(card, { spending });
      expect(facts.annualNetByCard[card.id], card.id).toBe(result.annualNetBenefit);
      expect(facts.breakEvenByCard[card.id], card.id).toBe(result.breakEvenMonths);
      expect(facts.monthlyBenefitByCard[card.id], card.id).toBe(result.totalMonthlyBenefit);
    }
    expect(facts.totalSpend).toBe(Object.values(spending).reduce((a, b) => a + b, 0));
    const halved = Object.fromEntries(
      Object.entries(spending).map(([key, value]) => [key, Math.round(value * 0.5)]),
    ) as typeof spending;
    const halvedResults = ANNUAL_FEE_CARDS.map((card) => calculateAnnualFeeCard(card, { spending: halved }));
    expect(facts.halfUnmet).toBe(halvedResults.filter((result) => !result.isMinSpendMet).length);
    expect(facts.halfBest).toBe([...halvedResults].sort((a, b) => b.annualNetBenefit - a.annualNetBenefit)[0].cardId);
  });

  it("/overseas-payment: 1,000 USD results per card", () => {
    const facts = factsOf("/overseas-payment");
    const input = { currency: "USD" as const, foreignAmount: 1000, dccMarkupRate: DCC_MARKUP.defaultRate };
    for (const card of OVERSEAS_CARDS) {
      const result = calculateOverseasPayment(card, input);
      expect(facts.netByCard[card.id], card.id).toBe(result.localCurrencyNet);
      expect(facts.feeByCard[card.id], card.id).toBe(result.cardFeeAmount);
      expect(facts.benefitByCard[card.id], card.id).toBe(result.benefitAmount);
    }
    const small = OVERSEAS_CARDS.map((card) => calculateOverseasPayment(card, { ...input, foreignAmount: 200 }));
    expect(facts.smallWarnings).toBe(small.filter((result) => result.isMinSpendWarning).length);
  });

  it("/fuel-card: monthly net at 200k/300k/500k and the LPG comparison", () => {
    const facts = factsOf("/fuel-card");
    for (const card of FUEL_CARDS) {
      for (const [key, monthlySpend] of [["net200", 200000], ["net300", 300000], ["net500", 500000]] as const) {
        const result = calculateCardSavings(card, { fuelType: "gasoline", monthlySpend, preferredBrand: "all" });
        expect(facts[key][card.id], `${card.id} ${key}`).toBe(result.monthlyNet);
      }
    }
    const lotte = FUEL_CARDS.find((card) => card.id === "lotte-auto")!;
    expect(facts.lotteLpg200).toBe(
      calculateCardSavings(lotte, { fuelType: "lpg", monthlySpend: 200000, preferredBrand: "all" }).monthlyDiscount,
    );
    const at200 = FUEL_CARDS.map((card) =>
      calculateCardSavings(card, { fuelType: "gasoline", monthlySpend: 200000, preferredBrand: "all" }),
    );
    expect(facts.warnings200).toBe(at200.filter((result) => result.isMinSpendWarning).length);
    // The Hyundai/Lotte crossover: Lotte's net must be below Hyundai's just under
    // the crossover and above it just over, in the real engine.
    const hyundai = FUEL_CARDS.find((card) => card.id === "hyundai-o")!;
    const netAt = (card: typeof hyundai, monthlySpend: number) =>
      calculateCardSavings(card, { fuelType: "gasoline", monthlySpend, preferredBrand: "all" }).monthlyNet;
    expect(netAt(lotte, facts.crossover - 100)).toBeLessThan(netAt(hyundai, facts.crossover - 100));
    expect(netAt(lotte, facts.crossover + 100)).toBeGreaterThan(netAt(hyundai, facts.crossover + 100));
  });

  it("/min-spend: default household + fuel results per card", () => {
    const facts = factsOf("/min-spend");
    const base = { fuelType: "gasoline" as const, fuelSpend: 200000, spending: createDefaultSpendingMap(), preferredBrand: "all" };
    for (const card of FUEL_CARDS) {
      const result = calculateMinSpendCard(card, base);
      expect(facts.netByCard[card.id], card.id).toBe(result.monthlyNetBenefit);
      expect(facts.total).toBe(result.totalSpending);
    }
    const hyundai = FUEL_CARDS.find((card) => card.id === "hyundai-o")!;
    expect(facts.hyundaiCap).toBe(calculateMinSpendCard(hyundai, base).appliedMonthlyCap);
    const empty = Object.fromEntries(Object.keys(base.spending).map((key) => [key, 0])) as typeof base.spending;
    expect(facts.fuelOnlyUnmet).toBe(
      FUEL_CARDS.filter((card) => !calculateMinSpendCard(card, { ...base, spending: empty }).isQualified).length,
    );
    const half = Object.fromEntries(
      Object.entries(base.spending).map(([key, value]) => [key, value / 2]),
    ) as typeof base.spending;
    expect(facts.halvedUnmet).toBe(
      FUEL_CARDS.filter((card) => !calculateMinSpendCard(card, { ...base, spending: half }).isQualified).length,
    );
    expect(facts.halvedHyundaiCap).toBe(calculateMinSpendCard(hyundai, { ...base, spending: half }).appliedMonthlyCap);
  });

  it("/mileage: value-per-mile extremes, class averages and the 70,000-mile threshold", () => {
    const facts = factsOf("/mileage");
    const ke = calculateMileageValue({ airlineId: "korean-air", mileageBalance: 70000 });
    const oz = calculateMileageValue({ airlineId: "asiana", mileageBalance: 70000 });
    const all = [...ke.allValues, ...oz.allValues];
    expect(facts.count).toBe(all.length);
    const sorted = [...all].sort((a, b) => a.valuePerMile - b.valuePerMile);
    expect(facts.lowest.value).toBeCloseTo(sorted[0].valuePerMile, 6);
    expect(facts.highest.value).toBeCloseTo(sorted[sorted.length - 1].valuePerMile, 6);
    for (const seatClass of ["economy", "business", "first"] as const) {
      expect(facts.keAvg[seatClass]).toBeCloseTo(ke.avgValueByClass[seatClass], 6);
      expect(facts.ozAvg[seatClass]).toBeCloseTo(oz.avgValueByClass[seatClass], 6);
    }
    expect(facts.eligibleAt70k).toBe(ke.balanceEligible.length + oz.balanceEligible.length);
  });

  it("/duty-free: taxes on the quoted purchases and the never-chosen simplified rate", () => {
    const facts = factsOf("/duty-free");
    expect(facts.cosmetics1000Tax).toBe(calculateDutyFree({ purchaseAmountUsd: 1000, category: "cosmetics" }).finalTax);
    expect(facts.alcohol1000Tax).toBe(calculateDutyFree({ purchaseAmountUsd: 1000, category: "alcohol" }).finalTax);
    expect(facts.clothing1500Tax).toBe(calculateDutyFree({ purchaseAmountUsd: 1500, category: "clothing" }).finalTax);
    expect(facts.justOverTax).toBe(calculateDutyFree({ purchaseAmountUsd: 801, category: "cosmetics" }).finalTax);
    const simplifiedWins = ["cosmetics", "clothing", "bag", "perfume", "food", "other"].filter((category) =>
      [900, 1200, 1500, 2000].some(
        (amount) => calculateDutyFree({ purchaseAmountUsd: amount, category: category as any }).isSimplifiedBetter,
      ),
    );
    expect(facts.simplifiedWins).toBe(simplifiedWins.length);
  });

  it("/credit-vs-debit: default comparison, fee table and rate-gap table", () => {
    const facts = factsOf("/credit-vs-debit");
    const defaults = { monthlySpend: 1_200_000, annualFee: 20_000, creditRate: 0.018, debitRate: 0.007 };
    const base = compareCreditVsDebit(defaults);
    expect(base.success).toBe(true);
    if (base.success) {
      expect(facts.base.annualCreditBenefit).toBe(base.data.annualCreditBenefit);
      expect(facts.base.annualDebitBenefit).toBe(base.data.annualDebitBenefit);
      expect(facts.base.breakEvenSpend).toBe(base.data.breakEvenSpend);
      expect(facts.base.gap).toBe(base.data.gap);
    }
    for (const row of facts.feeRows as Array<{ annualFee: number; breakEven: number }>) {
      const result = compareCreditVsDebit({ ...defaults, annualFee: row.annualFee });
      if (result.success) expect(row.breakEven, `fee ${row.annualFee}`).toBe(result.data.breakEvenSpend);
    }
    for (const row of facts.gapRows as Array<{ rateGap: number; breakEven: number }>) {
      const result = compareCreditVsDebit({ ...defaults, creditRate: defaults.debitRate + row.rateGap });
      if (result.success) expect(row.breakEven, `gap ${row.rateGap}`).toBe(result.data.breakEvenSpend);
    }
    const minimum = compareCreditVsDebit({ ...defaults, monthlySpend: 100_000 });
    if (minimum.success) {
      expect(facts.minInput.annualCreditBenefit).toBe(minimum.data.annualCreditBenefit);
      expect(facts.minInput.annualDebitBenefit).toBe(minimum.data.annualDebitBenefit);
    }
    const zero = compareCreditVsDebit({ ...defaults, annualFee: 0 });
    if (zero.success) {
      expect(facts.zeroFee.annualCreditBenefit).toBe(zero.data.annualCreditBenefit);
      expect(facts.zeroFee.breakEvenSpend).toBe(zero.data.breakEvenSpend);
    }
  });

  it("/point-convert: conversions at the default and the minimum input", () => {
    const facts = factsOf("/point-convert");
    for (const [key, pointAmount] of [["defaults", 120_000], ["minimum", 1_000]] as const) {
      const result = calculatePointConversions({ pointAmount });
      expect(result.success).toBe(true);
      if (result.success) {
        for (const item of result.data.items) {
          expect(facts[key][item.key], `${key} ${item.key}`).toBe(item.estimatedValue);
        }
      }
    }
    const ke = calculateMileageValue({ airlineId: "korean-air", mileageBalance: 0 });
    expect(facts.keEco).toBeCloseTo(ke.avgValueByClass.economy, 6);
    expect(facts.keBiz).toBeCloseTo(ke.avgValueByClass.business, 6);
  });

  it("/billing-cycle: every quoted day count", () => {
    const facts = factsOf("/billing-cycle");
    const check = (purchaseDay: number, billingDay: number) => {
      const result = calculateBillingCycle({ purchaseDay, billingDay });
      expect(result.success).toBe(true);
      return result.success ? result.data : null;
    };
    expect(facts.base.usableDays).toBe(check(15, 14)!.usableDays);
    expect(facts.base.cycleDays).toBe(check(15, 14)!.cycleDays);
    expect(facts.base.bestUsableDays).toBe(check(15, 14)!.bestUsableDays);
    expect(facts.worst.usableDays).toBe(check(14, 14)!.usableDays);
    for (const row of facts.firstDayRows as Array<{ billingDay: number; usable: number }>) {
      expect(row.usable, `1st -> ${row.billingDay}`).toBe(check(1, row.billingDay)!.usableDays);
    }
    for (const row of facts.paydayRows as Array<{ billingDay: number; usable: number }>) {
      expect(row.usable, `25th -> ${row.billingDay}`).toBe(check(25, row.billingDay)!.usableDays);
    }
    let total = 0;
    for (let day = 1; day <= 31; day += 1) total += check(day, 14)!.usableDays;
    expect(facts.average).toBeCloseTo(total / 31, 6);
  });

  it("/customs: default, cliff, shipping push and the input ceiling", () => {
    const facts = factsOf("/customs");
    const run = (productUsd: number, shippingUsd: number, categoryKey: string) => {
      const result = calculateCustoms({ productUsd, shippingUsd, categoryKey });
      expect(result.success).toBe(true);
      return result.success ? result.data : null;
    };
    const base = run(280, 20, "fashion")!;
    expect(facts.base.totalTax).toBe(base.totalTax);
    expect(facts.base.landedCost).toBe(base.landedCost);
    expect(facts.base.tariff).toBe(base.tariff);
    expect(facts.base.vat).toBe(base.vat);
    for (const row of facts.cliffRows as Array<{ label: string; cliff: number }>) {
      const key = { 전자기기: "electronics", "의류·신발": "fashion", 골프용품: "golf" }[row.label]!;
      expect(row.cliff, row.label).toBe(run(150.01, 0, key)!.totalTax);
    }
    expect(facts.shippingPush.totalTax).toBe(run(140, 20, "electronics")!.totalTax);
    expect(facts.shippingSafe.totalTax).toBe(run(140, 10, "electronics")!.totalTax);
    expect(facts.golf300.landedCost).toBe(run(300, 0, "golf")!.landedCost);
    expect(facts.maxInput.totalTax).toBe(run(20_000, 3_000, "golf")!.totalTax);
    expect(facts.travelerSameTax).toBe(calculateDutyFree({ purchaseAmountUsd: 300, category: "clothing" }).finalTax);
  });
});
