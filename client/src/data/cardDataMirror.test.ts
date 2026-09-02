import { describe, expect, it } from "vitest";
// Hand-copied mirror used by the prerender insight engine (scripts/ is .mjs and
// cannot import the typed arrays). Every projection below has to match exactly,
// or the prose starts quoting numbers the calculator no longer uses.
import * as mirror from "../../scripts/card-data-mirror.mjs";
import {
  ANNUAL_FEE_CARDS,
  BENEFIT_CATEGORIES,
  createDefaultSpendingPattern,
} from "./annualFeeCards";
import { BILLING_DAY_OPTIONS, CARD_CUSTOMS_CATEGORIES, POINT_PROGRAMS } from "./cardTabData";
import { DUTY_FREE_CATEGORIES, DUTY_FREE_CONSTANTS } from "./dutyFreeRates";
import { DCC_MARKUP, EXCHANGE_RATES } from "./exchangeRates";
import { FUEL_CARDS } from "./fuelCards";
import { FUEL_PRICES, FUEL_TYPE_LABELS } from "./fuelPrices";
import { AIRLINES, MILEAGE_ASSUMPTIONS, MILEAGE_DATA } from "./mileageData";
import { OVERSEAS_CARDS } from "./overseasCards";
import { SPENDING_CATEGORIES } from "./spendingCategories";
import { calculateBillingCycle, calculateCustoms } from "@/utils/cardTabCalculator";

describe("card data mirror for the prerender insight engine", () => {
  it("mirrors the annual fee cards and the default spending pattern", () => {
    expect(mirror.ANNUAL_FEE_CARDS).toEqual(
      ANNUAL_FEE_CARDS.map((card) => ({
        id: card.id,
        issuer: card.issuer,
        name: card.name,
        annualFee: card.annualFee,
        minSpend: card.minSpend,
        totalMonthlyCap: card.totalMonthlyCap ?? null,
        benefitRates: card.benefitRates.map((rate) => ({
          categoryId: rate.categoryId,
          rate: rate.rate,
          monthlyCap: rate.monthlyCap,
        })),
      })),
    );
    expect(mirror.DEFAULT_SPENDING_PATTERN).toEqual(createDefaultSpendingPattern());
    expect(mirror.BENEFIT_CATEGORY_LABELS).toEqual(
      Object.fromEntries(BENEFIT_CATEGORIES.map((category) => [category.id, category.label])),
    );
  });

  it("mirrors the overseas cards, exchange rates and DCC range", () => {
    expect(mirror.OVERSEAS_CARDS).toEqual(
      OVERSEAS_CARDS.map((card) => ({
        id: card.id,
        issuer: card.issuer,
        name: card.name,
        category: card.category,
        annualFee: card.annualFee,
        exchangeFeeRate: card.fee.exchangeFeeRate,
        networkFeeRate: card.fee.networkFeeRate,
        hasFeeCondition: Boolean(card.feeCondition),
        benefits: card.benefits.map((benefit) => ({
          rate: benefit.rate,
          fixedAmount: benefit.fixedAmount,
          monthlyCap: benefit.monthlyCap,
          minSpend: benefit.minSpend,
        })),
      })),
    );
    // The overseas engine adds the two fee parts; the mirror must not carry a
    // third value that could disagree with that sum.
    for (const card of OVERSEAS_CARDS) {
      expect(card.fee.totalFeeRate).toBeCloseTo(card.fee.exchangeFeeRate + card.fee.networkFeeRate, 10);
    }
    expect(mirror.EXCHANGE_RATES_UPDATED_AT).toBe(EXCHANGE_RATES.lastUpdated);
    expect(mirror.EXCHANGE_RATES).toEqual(
      EXCHANGE_RATES.rates.map((entry) => ({
        currency: entry.currency,
        label: entry.label,
        rate: entry.rate,
        unit: entry.unit,
      })),
    );
    expect(mirror.DCC_MARKUP).toEqual({
      typicalMinRate: DCC_MARKUP.typicalMinRate,
      typicalMaxRate: DCC_MARKUP.typicalMaxRate,
      defaultRate: DCC_MARKUP.defaultRate,
    });
  });

  it("mirrors the fuel cards, fuel prices and the min-spend household defaults", () => {
    expect(mirror.FUEL_CARDS).toEqual(
      FUEL_CARDS.map((card) => ({
        id: card.id,
        issuer: card.issuer,
        name: card.name,
        annualFee: card.annualFee,
        discount: {
          type: card.discount.type,
          amount: card.discount.amount,
          monthlyCap: card.discount.monthlyCap,
          minSpend: card.discount.minSpend,
          spendTiers: card.discount.spendTiers
            ? card.discount.spendTiers.map((tier) => ({ minSpend: tier.minSpend, monthlyCap: tier.monthlyCap }))
            : null,
          brandRestriction: card.discount.brandRestriction,
        },
      })),
    );
    expect(mirror.FUEL_PRICES).toEqual({
      lastUpdated: FUEL_PRICES.lastUpdated,
      gasoline: FUEL_PRICES.gasoline,
      diesel: FUEL_PRICES.diesel,
      lpg: FUEL_PRICES.lpg,
    });
    expect(mirror.FUEL_TYPE_LABELS).toEqual(FUEL_TYPE_LABELS);
    expect(mirror.MIN_SPEND_DEFAULTS).toEqual(
      Object.fromEntries(SPENDING_CATEGORIES.map((category) => [category.id, category.defaultAmount])),
    );
  });

  it("mirrors the mileage redemption table and airline names", () => {
    expect(mirror.MILEAGE_VERIFIED_AT).toBe(MILEAGE_ASSUMPTIONS.verifiedAt);
    expect(mirror.AIRLINE_NAMES).toEqual(
      Object.fromEntries(AIRLINES.map((airline) => [airline.id, airline.name])),
    );
    const routes = MILEAGE_DATA[0].routes;
    expect(mirror.MILEAGE_ROUTES).toEqual(
      routes.map((route) => ({
        id: route.id,
        label: route.label,
        economy: route.cashPrice.economy,
        business: route.cashPrice.business,
        first: route.cashPrice.first,
      })),
    );
    // Both airlines share one route list in the source; the mirror assumes so.
    for (const airline of MILEAGE_DATA) expect(airline.routes).toEqual(routes);
    expect(mirror.MILEAGE_REDEMPTIONS).toEqual(
      Object.fromEntries(
        MILEAGE_DATA.map((airline) => [
          airline.airlineId,
          Object.fromEntries(
            routes.map((route) => [
              route.id,
              Object.fromEntries(
                airline.redemptions
                  .filter((item) => item.routeId === route.id)
                  .map((item) => [item.seatClass, item.milesRequired]),
              ),
            ]),
          ),
        ]),
      ),
    );
  });

  it("mirrors the duty-free rates and the traveller exemption constants", () => {
    expect(mirror.DUTY_FREE_CONSTANTS).toEqual({
      exemptionLimitUsd: DUTY_FREE_CONSTANTS.exemptionLimitUsd,
      vatRate: DUTY_FREE_CONSTANTS.vatRate,
      exchangeRate: DUTY_FREE_CONSTANTS.exchangeRate,
    });
    expect(DUTY_FREE_CONSTANTS.lastUpdated.startsWith(mirror.DUTY_FREE_VERIFIED_AT)).toBe(true);
    expect(mirror.DUTY_FREE_CATEGORIES).toEqual(
      DUTY_FREE_CATEGORIES.map((category) => ({
        id: category.id,
        label: category.label,
        tariffRate: category.tariffRate,
        simplifiedRate: category.simplifiedRate,
        simplifiedMaxUsd: category.simplifiedMaxUsd,
      })),
    );
  });

  it("mirrors the tab calculators' tables and their hard-coded model constants", () => {
    expect(mirror.POINT_PROGRAMS).toEqual(
      POINT_PROGRAMS.map((program) => ({
        key: program.key,
        label: program.label,
        pointsPerUnit: program.pointsPerUnit,
        unitValueWon: program.unitValueWon,
      })),
    );
    expect(mirror.BILLING_DAY_OPTIONS).toEqual([...BILLING_DAY_OPTIONS]);
    expect(mirror.CARD_CUSTOMS_CATEGORIES).toEqual(
      CARD_CUSTOMS_CATEGORIES.map((category) => ({
        key: category.key,
        label: category.label,
        tariffRate: category.tariffRate,
        thresholdUsd: category.thresholdUsd,
      })),
    );

    // The billing and customs engines keep their assumptions inline, so the
    // mirror is checked against observable engine output instead of a constant.
    const billing = calculateBillingCycle({ purchaseDay: 1, billingDay: 1 });
    expect(billing.success).toBe(true);
    if (billing.success) {
      expect(billing.data.graceDays).toBe(mirror.BILLING_MODEL.graceDays);
      expect(billing.data.bestUsableDays).toBe(mirror.BILLING_MODEL.monthDays + mirror.BILLING_MODEL.graceDays);
    }
    const customs = calculateCustoms({ productUsd: 200, shippingUsd: 0, categoryKey: "electronics" });
    expect(customs.success).toBe(true);
    if (customs.success) {
      expect(customs.data.exchangeRate).toBe(mirror.CUSTOMS_MODEL.exchangeRate);
      // VAT is 10% of (base + tariff): recover the rate from the emitted numbers.
      expect(customs.data.vat).toBe(
        Math.round((customs.data.taxableBaseKrw + customs.data.tariff) * mirror.CUSTOMS_MODEL.vatRate),
      );
    }
  });
});
