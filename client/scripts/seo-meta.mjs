// 페이지 제목(<title>·og:title·twitter:title·JSON-LD name)의 단일 출처.
//
// 왜 한 파일인가: 이 앱은 프리렌더(scripts/prerender.mjs)가 원시 HTML의 제목을 박고,
// 하이드레이션 뒤에는 useSEO(useHead)가 다시 쓴다. 예전엔 두 쪽이 제목 문자열을 따로 들고 있어
// 같은 URL이 크롤러에게는 "KB국민카드 주유 할인카드 비교", 화면에선 "KB국민카드 주유 할인 총정리 …"로
// 갈렸다. 양쪽이 이 모듈 하나를 import하면 문자열이 어긋날 수 없다.
//
// 레시피(2026-10-02 네이버 CTR 작업, 10-03 수정):
//   계산기·도구 페이지      `<페이지 제목> | ShakiLabs`
//   홈                    `<앱 이름> | ShakiLabs`
//   허브·소개·약관·방침·404  `<페이지 제목> · <앱 이름> | ShakiLabs`
// 가운데 앱 이름 접미사(" | 카드 계산기")를 뺀 이유: 네이버는 제목을 약 35자에서 자르는데
// 접미사가 20자 가까이를 먹어 핵심 구절이 잘렸다. 사이트 공통 페이지만 앱 이름을 남기는 이유는
// 빼면 "이용약관 | ShakiLabs"가 12개 앱에서 똑같아져 도메인 안 중복 제목이 되기 때문이다.
// 페이지 제목은 40자 이하, 검색 구절은 앞 28자 안 — src/seo/seoMeta.test.ts가 지킨다.

export const SITE_BRAND = "ShakiLabs";
export const APP_NAME = "카드 계산기";

const BRAND_SUFFIX = ` | ${SITE_BRAND}`;

// 옛 레시피 접미사. 라우터 meta.title은 GA page_title로도 나가서 이번에 바꾸지 않았고
// 아직 " | 카드 계산기"를 달고 있다 — 그 값이 들어와도 새 레시피로 접히게 벗겨 낸다.
const LEGACY_TITLE_SUFFIXES = [
  ` | ${APP_NAME}${BRAND_SUFFIX}`,
  " | Car Tools 2026",
  " | Car Tools",
  ` | ${APP_NAME}`,
  BRAND_SUFFIX,
];

export function normalizeTitle(rawTitle) {
  let baseTitle = String(rawTitle ?? "").trim();

  for (const suffix of LEGACY_TITLE_SUFFIXES) {
    if (baseTitle.endsWith(suffix)) {
      baseTitle = baseTitle.slice(0, -suffix.length).trimEnd();
      break;
    }
  }

  // 페이지명 안의 pipe는 중점으로 — pipe는 브랜드 앞 구분자 하나만 남겨야
  // 어디까지가 페이지명인지 읽힌다.
  baseTitle = baseTitle.replace(/\s*\|\s*/g, " · ");

  return `${baseTitle || APP_NAME}${BRAND_SUFFIX}`;
}

// 사이트 공통 페이지(허브·소개·정책·404)는 앱 이름을 페이지 제목 끝에 중점으로 붙인다.
function sitePageTitle(name) {
  return `${name} · ${APP_NAME}`;
}

// cardIds = src/data/fuelCards.ts ISSUER_SLUG_MAP, cards = 그 카드들의 name — seoMeta.test.ts가 대조한다.
// 카드사 페이지 본문(prerender-fuel-issuer.mjs)은 cardIds로 카드 데이터를 찾는다.
export const FUEL_ISSUERS = {
  hyundai: { label: "현대카드", cardIds: ["hyundai-o"], cards: ["현대카드 O"] },
  shinhan: { label: "신한카드", cardIds: ["shinhan-mycar"], cards: ["MY CAR"] },
  kb: { label: "KB국민카드", cardIds: ["kb-tantandaero"], cards: ["탄탄대로 올쇼핑 티타늄"] },
  samsung: { label: "삼성카드", cardIds: ["samsung-soil"], cards: ["S-Oil 삼성카드"] },
  lotte: { label: "롯데카드", cardIds: ["lotte-auto"], cards: ["디지로카 Auto"] },
  hana: { label: "하나카드", cardIds: ["hana-1q"], cards: ["1Q카드"] },
};

// 카드사 페이지의 "월 주유 금액별 절약액" 표 행(CardIssuerView.vue)과 description의 구간이
// 같은 배열을 읽는다 — 표 구간을 바꾸면 검색 결과 문구도 같이 바뀐다.
export const ISSUER_SIMULATION_AMOUNTS = [100000, 200000, 300000, 400000, 500000];

const FUEL_TYPE_LABELS = { gasoline: "휘발유", diesel: "경유", lpg: "LPG" };

export const OVERSEAS_LABELS = {
  usd: "미국 달러",
  eur: "유로",
  jpy: "일본 엔",
  gbp: "영국 파운드",
  cny: "중국 위안",
  thb: "태국 바트",
  vnd: "베트남 동",
};

const STATIC_PAGE_TITLES = {
  "/": APP_NAME,
  "/all": sitePageTitle("목적별 카드 비교 도구 전체 보기"),
  "/fuel-card": "주유 할인카드 비교 계산기 · 내 주유량에 맞는 최적 카드 찾기 2026",
  "/overseas-payment": "해외결제 카드 비교 + DCC 수수료 계산기",
  "/min-spend": "전월 실적 채우기 최소 비용 계산기",
  "/annual-fee": "연회비 회수 계산기 · 카드 혜택 vs 연회비 손익분석 2026",
  "/duty-free": "면세 한도 초과 관세 계산기 · 해외쇼핑 관세·부가세 자동 계산 2026",
  // 대한항공·아시아나 2곳, 좌석 3등급(mileageData.ts) — 시험이 데이터와 대조한다.
  "/mileage": "마일리지 1마일 가치 계산 · 대한항공·아시아나 좌석별 비교",
  "/credit-vs-debit": "신용카드 vs 체크카드 비교 · 연회비까지 반영한 실속 계산",
  "/point-convert": "포인트 전환 비교 · 항공·호텔·현금성 포인트 가치 계산",
  "/billing-cycle": "결제일별 이용기간 계산기 · 카드 결제일에 따른 최대 유예일",
  "/customs": "해외직구 관세 계산기 · 상품가+배송비 기준 예상 세금",
  "/about": sitePageTitle("서비스 안내"),
  "/terms": sitePageTitle("이용약관"),
  "/privacy": sitePageTitle("개인정보 처리방침"),
  "/404": sitePageTitle("페이지를 찾을 수 없습니다"),
};

// 라우트 경로(앱 base 제외) → 브랜드 접미사 없는 페이지 제목. 모르는 경로면 undefined.
// 변종 라우트는 경로에서 바로 만든다 — 라우터가 허용하는 임의 금액(/fuel-card/monthly/123456)도
// 프리렌더된 3개 금액과 같은 틀을 쓴다.
export function pageTitleFor(route) {
  const path = route.length > 1 ? route.replace(/\/+$/, "") : route;
  if (Object.hasOwn(STATIC_PAGE_TITLES, path)) return STATIC_PAGE_TITLES[path];

  const issuer = path.match(/^\/fuel-card\/([a-z]+)$/)?.[1];
  if (issuer && Object.hasOwn(FUEL_ISSUERS, issuer)) {
    return `${FUEL_ISSUERS[issuer].label} 주유 할인카드 비교 · 월 주유비별 연간 절약액`;
  }
  // "추천"을 쓰지 않는다 — 페이지는 계산 결과로 카드를 줄 세울 뿐 추천하지 않는다.
  if (issuer && Object.hasOwn(FUEL_TYPE_LABELS, issuer)) {
    return `${FUEL_TYPE_LABELS[issuer]} 주유 할인카드 비교`;
  }

  const amount = path.match(/^\/fuel-card\/monthly\/(\d+)$/)?.[1];
  if (amount) {
    return `월 ${Math.round(Number(amount) / 10000)}만원 주유 시 최적 카드 비교`;
  }

  const currency = path.match(/^\/overseas-payment\/([a-z]+)$/)?.[1];
  if (currency && Object.hasOwn(OVERSEAS_LABELS, currency)) {
    return `${OVERSEAS_LABELS[currency]} 해외결제 카드 비교 · DCC 수수료 계산기`;
  }

  return undefined;
}

// 화면(뷰)용: 라우터 정규식이 허용한 경로만 들어오므로 실제로는 늘 위에서 걸린다.
// 그래도 빈 제목 대신 앱 이름으로 떨어지게 둔다.
export function pageTitle(route) {
  return pageTitleFor(route) ?? APP_NAME;
}

// 카드사 변형 6개의 description. 화면이 실제로 보여 주는 것(카드 조건 요약 + 월 주유비 구간별
// 연회비 차감 연간 절약액 표, 휘발유 기준)과 범위(구간 수·금액)만 적는다.
export function fuelIssuerDescription(slug) {
  if (!Object.hasOwn(FUEL_ISSUERS, slug)) return undefined;
  const issuer = FUEL_ISSUERS[slug];
  const amounts = ISSUER_SIMULATION_AMOUNTS;
  return (
    `${issuer.label} 주유 할인카드(${issuer.cards.join("·")})의 할인 방식·전월 실적·월 할인 한도·연회비를 정리하고, ` +
    `월 주유비 ${amounts[0] / 10000}만~${amounts[amounts.length - 1] / 10000}만원 ${amounts.length}개 구간별로 ` +
    "연회비를 뺀 연간 절약액을 휘발유 기준으로 계산합니다."
  );
}

// 36칸 = 항공사 2곳 × 노선 6개 × 좌석 3등급(mileageData.ts) — 시험이 데이터와 대조한다.
// "마일 충족"은 좌석 재고를 뜻하지 않으므로 "갈 수 있는"이 아니라 "공제 기준을 채우는"으로 적는다.
export const MILEAGE_DESCRIPTION =
  "대한항공·아시아나항공 마일리지 공제표 36칸(항공사 2곳 × 노선 6개 × 좌석 3등급)을 예시 운임으로 나눠 " +
  "1마일 원화 가치를 비교합니다. 보유 마일이 공제 기준을 채우는 노선·좌석도 함께 보여 줍니다.";
