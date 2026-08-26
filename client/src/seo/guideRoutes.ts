// Decides where the prerendered guide body is re-rendered inside the Vue app.
//
// The rule is: every prerendered route renders its own body in-app. There is no
// "the screen already covers it" exemption any more, because the metric that
// produced that exemption did not measure coverage.
//
// PR #47 classified routes by character-count ratio (JS-on chars / JS-off chars)
// and exempted everything at or above ~92%:
//
//   /annual-fee 207.9%   /overseas-payment 146.5%   /fuel-card 103.6%
//   /min-spend  102.6%   /mileage           95.3%   /all         92.3%
//   /overseas-payment/{currency} 83.8-97.9%
//
// Measured again on 2026-08-26 against the same live pages, this time counting
// how many of the prerendered sentences (>=30 characters) are still in the DOM
// after hydration:
//
//   /fuel-card 0.0%   /overseas-payment 0.0%   /min-spend 0.0%
//   /annual-fee 0.0%  /mileage          0.0%   /overseas-payment/usd 0.0%
//   /all 81.1%        /duty-free 100.0% (guided, control)
//
// Same pages, same day, opposite verdicts. A calculator screen writes a similar
// VOLUME of prose to the guide, so the ratio reads "covered" while not a single
// sentence is shared: the crawler and the reader were served different bodies,
// and removePrerenderContent() deleted the crawler's copy on mount.
//
// scripts/verify-hydration-survival.mjs now measures the surviving-sentence rate
// in a real browser and fails below 90%, so this table cannot quietly drift back
// into a judgement call.

/** Where the guide body is attached. Policy/about pages ARE their body, so they lead. */
export type GuidePlacement = "before" | "after" | "none";

/** Routes whose page content is the guide itself - rendered above the view. */
const GUIDE_FIRST_ROUTES = new Set(["/about", "/terms", "/privacy"]);

/** Routes that append the guide under the calculator (or under the directory). */
const GUIDE_AFTER_ROUTES = new Set([
  "/",
  "/all",
  "/fuel-card",
  "/overseas-payment",
  "/min-spend",
  "/annual-fee",
  "/duty-free",
  "/mileage",
  "/credit-vs-debit",
  "/point-convert",
  "/billing-cycle",
  "/customs",
]);

/**
 * Consolidated variants. Enumerated rather than pattern-matched on one segment,
 * for the reason spelled out in scripts/seo-routes.mjs: "/fuel-card/lpg" and
 * "/fuel-card/hana" are indistinguishable as paths.
 */
const GUIDE_AFTER_PATTERNS = [
  /^\/fuel-card\/(hyundai|shinhan|kb|samsung|lotte|hana)$/,
  /^\/fuel-card\/(gasoline|diesel|lpg)$/,
  /^\/fuel-card\/monthly\/\d+$/,
  /^\/overseas-payment\/(usd|eur|jpy|gbp|cny|thb|vnd)$/,
];

export function guidePlacementFor(path: string): GuidePlacement {
  if (GUIDE_FIRST_ROUTES.has(path)) return "before";
  if (GUIDE_AFTER_ROUTES.has(path)) return "after";
  if (GUIDE_AFTER_PATTERNS.some((pattern) => pattern.test(path))) return "after";
  return "none";
}

export function hasInAppGuide(path: string): boolean {
  return guidePlacementFor(path) !== "none";
}
