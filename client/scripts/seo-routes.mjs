// 프리렌더 대상 라우트
export const CARD_ISSUERS = ["hyundai", "shinhan", "kb", "samsung", "lotte", "hana"];
export const FUEL_TYPES = ["gasoline", "diesel"];
export const MONTHLY_AMOUNTS = [200000, 300000, 500000];

export const SEO_ROUTES = [
  "/fuel-card",
  ...CARD_ISSUERS.map((issuer) => `/fuel-card/${issuer}`),
  ...FUEL_TYPES.map((type) => `/fuel-card/${type}`),
  ...MONTHLY_AMOUNTS.map((amount) => `/fuel-card/monthly/${amount}`),
  "/about",
  "/privacy",
];
