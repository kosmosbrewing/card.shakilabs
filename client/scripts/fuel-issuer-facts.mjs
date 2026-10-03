// Data side of the /fuel-card/<issuer> pages: which cards an issuer has, how
// their terms are worded, and what the calculator engine returns for them.
// prerender-fuel-issuer.mjs turns these into HTML; src/seo/fuelIssuerContent.test.ts
// checks the rendered cells against src/data/fuelCards.ts and src/utils/calculator.ts.
//
// NOTE: comments here are intentionally ASCII-only. scripts/ is scanned by
// font-subset-config.mjs and every character becomes part of the shipped font
// subset. Korean strings are page copy and belong in the subset.
import { formatWon } from "./card-data-derived.mjs";
import { FUEL_CARDS, FUEL_PRICES } from "./card-data-mirror.mjs";
import { fuelResult } from "./card-insights.mjs";
import { FUEL_ISSUERS } from "./seo-meta.mjs";

export const won = (value) => `${formatWon(Math.round(value))}원`;
export const manWon = (value) => `${value / 10000}만원`;

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

// KNOWN SIMPLIFICATION (kept on purpose, same as src/utils/calculator.ts):
// the spend tier is picked from the monthly FUEL spend alone, as if fuel were
// the whole previous-month card spend. A tiered card (Hyundai O: 400k/800k/1.2M
// -> cap 10k/20k/35k) therefore stays on its lowest cap at every fuel amount
// shown here, even for a reader whose total card spend reaches a higher tier.
// The pages say "previous-month spend assumed met" and quote every tier in the
// terms table; changing this means changing the calculator, not the copy.
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

// Issuer label for a card row ("KB국민카드"), via the slug -> card id map.
export function issuerLabelOf(card) {
  const entry = Object.values(FUEL_ISSUERS).find((issuer) => issuer.cardIds.includes(card.id));
  return entry ? entry.label : card.issuer;
}

// "현대카드 O" already names its issuer; "MY CAR" does not.
export function cardDisplayName(card) {
  const label = issuerLabelOf(card);
  return card.name.includes(label) ? card.name : `${label} ${card.name}`;
}

// Every fuel card run through the engine at one monthly spend, best first.
// Ties keep the data order (Array.prototype.sort is stable).
export function rankedAt(monthlySpend) {
  return FUEL_CARDS.map((card) => ({ card, ...savingsAt(card, monthlySpend) })).sort(
    (a, b) => b.annualNet - a.annualNet,
  );
}

export function wonRange(values) {
  return `${won(Math.min(...values))}~${won(Math.max(...values))}`;
}

// Lowest-tier spend thresholds and every tier cap across the whole fuel table.
export function fleetScope() {
  return {
    count: FUEL_CARDS.length,
    minSpends: FUEL_CARDS.map((card) => spendTiers(card)[0].minSpend),
    caps: FUEL_CARDS.flatMap((card) => spendTiers(card).map((tier) => tier.monthlyCap)),
    fees: FUEL_CARDS.map((card) => card.annualFee),
  };
}
