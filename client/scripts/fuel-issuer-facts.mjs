// Data side of the /fuel-card/<issuer> pages: which cards an issuer has, how
// their terms are worded, and what the calculator engine returns for them.
// prerender-fuel-issuer.mjs turns these into HTML; src/seo/fuelIssuerContent.test.ts
// checks the rendered cells against src/data/fuelCards.ts and src/utils/calculator.ts.
//
// NOTE: comments here are intentionally ASCII-only. scripts/ is scanned by
// font-subset-config.mjs and every character becomes part of the shipped font
// subset. Korean strings are page copy and belong in the subset.
import { FUEL_CARDS, FUEL_PRICES } from "./card-data-mirror.mjs";
import { fuelResult } from "./card-insights.mjs";
import { FUEL_ISSUERS } from "./seo-meta.mjs";

// The /fuel-card engine's default fuel; the Vue issuer table uses it too.
export const FUEL_TYPE = "gasoline";
// Spend used for the one-line cross-issuer comparison and FAQ Q2.
export const REFERENCE_SPEND = 200000;

// Same wording as formatDiscountType() in src/utils/calculator.ts, which the
// Vue issuer view prints next to the card name.
export function discountLabel(card) {
  const rate = (card.discount.amount * 100).toFixed(0);
  if (card.discount.type === "perLiter") return `리터당 ${card.discount.amount}원`;
  if (card.discount.type === "percent") return `${rate}% 할인`;
  return `${rate}% 캐시백`;
}

// Same ordering as getFuelCardSpendTiers() in src/data/fuelCards.ts.
export function spendTiers(card) {
  const tiers = card.discount.spendTiers;
  if (tiers && tiers.length > 0) return [...tiers].sort((a, b) => a.minSpend - b.minSpend);
  return [{ minSpend: card.discount.minSpend, monthlyCap: card.discount.monthlyCap }];
}

export function cardsForIssuer(slug) {
  const issuer = FUEL_ISSUERS[slug];
  return issuer ? FUEL_CARDS.filter((card) => issuer.cardIds.includes(card.id)) : [];
}

export function savingsAt(card, monthlySpend) {
  return fuelResult(card, { fuelType: FUEL_TYPE, monthlySpend, preferredBrand: "all" });
}

// Lowest monthly fuel spend (rounded up to 1,000 won) at which the discount
// covers the annual fee spread over twelve months. null when the lowest-tier
// cap is below that monthly fee, i.e. fuel alone can never pay the fee back.
export function breakEvenSpend(card) {
  const monthlyFee = card.annualFee / 12;
  const cap = spendTiers(card)[0].monthlyCap;
  if (cap > 0 && cap < monthlyFee) return null;
  const perWon =
    card.discount.type === "perLiter" ? card.discount.amount / FUEL_PRICES[FUEL_TYPE] : card.discount.amount;
  return Math.ceil(monthlyFee / perWon / 1000) * 1000;
}
