// 프리렌더 대상 라우트
// NOTE: comments added here are intentionally ASCII-only. scripts/ is scanned by
// font-subset-config.mjs, so a non-ASCII character would change the shipped font
// subset and force a fonts:subset regeneration.
export const CARD_ISSUERS = ["hyundai", "shinhan", "kb", "samsung", "lotte", "hana"];
export const FUEL_TYPES = ["gasoline", "diesel", "lpg"];
export const MONTHLY_AMOUNTS = [200000, 300000, 500000];
export const OVERSEAS_CURRENCIES = ["usd", "eur", "jpy", "gbp", "cny", "thb", "vnd"];

// Doorway-variant consolidation (AdSense "low value content" remediation).
//
// The variants are NOT one flat cluster, and the subgroup structure is the whole
// reason this is a table rather than a regex. Measured difflib similarity on the
// live prerendered bodies (2026-08, https://shakilabs.com/card):
//
//   within a subgroup   0.92 - 0.97  -> near-duplicate, consolidate
//   between subgroups   0.58 - 0.60  -> genuinely different arguments
//
// So "/fuel-card/hyundai" and "/fuel-card/shinhan" are the same document with a
// brand swapped, but "/fuel-card/hyundai" and "/fuel-card/monthly/200000" are
// not. Each subgroup is listed separately below so that judgement stays visible
// and so a single subgroup can be released from consolidation on its own.
//
// All three fuel-card subgroups still canonicalize to "/fuel-card": it is the
// superset page that already answers every one of those queries (3,074 chars of
// prerendered body, above the 1,500 floor), and it is the only fuel-card URL a
// crawler should be asked to rank.
//
// Reversible on purpose: if a subgroup ever gains a conclusion its base page
// does not make, delete that one entry below and every route in it returns to
// the sitemap as a self-canonical URL with no other code change.
const VARIANT_FAMILIES = [
  {
    base: "/fuel-card",
    subgroups: [
      // Card brand: 6 routes, one segment deep.
      { id: "issuer", routes: CARD_ISSUERS.map((issuer) => `/fuel-card/${issuer}`) },
      // Fuel type: 3 routes, one segment deep, same shape as issuer above --
      // "/fuel-card/lpg" and "/fuel-card/hana" are indistinguishable as paths,
      // which is exactly why membership is enumerated instead of pattern-matched.
      { id: "fuel-type", routes: FUEL_TYPES.map((type) => `/fuel-card/${type}`) },
      // Monthly spend: 3 routes, TWO segments deep. Any "strip the last segment"
      // heuristic would send these to "/fuel-card/monthly", which is not a route
      // and never gets prerendered -- a canonical pointing at a soft-404.
      {
        id: "monthly-spend",
        routes: MONTHLY_AMOUNTS.map((amount) => `/fuel-card/monthly/${amount}`),
      },
    ],
  },
  {
    base: "/overseas-payment",
    subgroups: [
      // Currency code: 7 routes, one segment deep.
      {
        id: "currency",
        routes: OVERSEAS_CURRENCIES.map((currency) => `/overseas-payment/${currency}`),
      },
    ],
  },
];

// Route -> canonical target, built by enumeration rather than by trimming path
// segments. See the monthly-spend note above for why a heuristic is unsafe here.
const CANONICAL_OVERRIDES = new Map(
  VARIANT_FAMILIES.flatMap(({ base, subgroups }) =>
    subgroups.flatMap(({ routes }) => routes.map((route) => [route, base])),
  ),
);

// Exported for the static validator so it can assert per-subgroup coverage
// instead of only counting variants in aggregate.
export const VARIANT_SUBGROUPS = VARIANT_FAMILIES.flatMap(({ base, subgroups }) =>
  subgroups.map(({ id, routes }) => ({ id, base, routes })),
);

export const PARAM_ROUTES = [...CANONICAL_OVERRIDES.keys()];

export const SEO_ROUTES = [
  "/",
  "/all",
  "/fuel-card",
  ...CARD_ISSUERS.map((issuer) => `/fuel-card/${issuer}`),
  ...FUEL_TYPES.map((type) => `/fuel-card/${type}`),
  ...MONTHLY_AMOUNTS.map((amount) => `/fuel-card/monthly/${amount}`),
  "/overseas-payment",
  "/min-spend",
  "/annual-fee",
  "/duty-free",
  "/mileage",
  "/credit-vs-debit",
  "/point-convert",
  "/billing-cycle",
  "/customs",
  ...OVERSEAS_CURRENCIES.map((currency) => `/overseas-payment/${currency}`),
  "/about",
  "/terms",
  "/privacy",
];

// The sitemap advertises only self-canonical pages. Listing a URL that
// canonicalizes elsewhere sends crawlers to a page that immediately points away.
export const SITEMAP_ROUTES = SEO_ROUTES.filter(
  (route) => !CANONICAL_OVERRIDES.has(route),
);

// Canonical path for a prerendered route: variants point at their family base,
// everything else is self-canonical.
export function canonicalPathFor(route) {
  return CANONICAL_OVERRIDES.get(route) ?? route;
}

// PARAM_ROUTES stay in SEO_ROUTES (and therefore stay prerendered) on purpose.
// Without a static HTML file the Vercel rewrite serves the empty SPA shell for
// these URLs, which is a soft-404 for crawlers. Never drop them from SEO_ROUTES
// just because they left the sitemap.
