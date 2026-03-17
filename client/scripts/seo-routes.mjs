// 프리렌더 대상 라우트
export const CARD_ISSUERS = ["hyundai", "shinhan", "kb", "samsung", "lotte", "hana"];
export const FUEL_TYPES = ["gasoline", "diesel", "lpg"];
export const MONTHLY_AMOUNTS = [200000, 300000, 500000];
export const OVERSEAS_CURRENCIES = ["usd", "eur", "jpy", "gbp", "cny", "thb", "vnd"];

export const SEO_ROUTES = [
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
  "/privacy",
];
