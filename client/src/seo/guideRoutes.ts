// 어떤 라우트에서 프리렌더 가이드 본문을 앱 화면에도 렌더할지 결정한다.
//
// 왜 전 라우트가 아닌가
// -------------------------------------------------------------------------
// 프리렌더 본문은 원래 Vue 화면의 사본이었다. 그런데 일부 라우트에만 프리렌더 전용
// 콘텐츠가 추가되면서, 화면이 얇은 라우트에서는 JS를 켜는 순간 본문이 사라졌다.
// 반대로 이미 화면이 프리렌더만큼(혹은 그 이상) 렌더하는 라우트에 같은 글을 또 넣으면
// 사용자는 같은 주장을 두 번 읽는다.
//
// 그래서 기준은 "화면이 정적 HTML을 이미 커버하는가"이고, 판단은 감이 아니라 실측이다.
// 아래 수치는 2026-08-09 라이브(https://shakilabs.com/card)에서 playwright로
// JS 끔/켬 본문 자수를 재서 얻은 커버율(켬/끔)이다. nav·header·footer 제외.
//
//   가이드를 화면에 넣어야 하는 라우트 (화면이 정적 HTML보다 얇다)
//     /                     37.7%   HomeView가 히어로·상황·3단계만 렌더 → 나머지 블록만 보강
//     /about                34.7%
//     /terms               113.8%*  * 자수는 넘지만 양쪽 다 1,500자 미만이라 본문을 통합·보강
//     /privacy              98.8%*
//     /duty-free            31.6%
//     /credit-vs-debit       8.6%
//     /point-convert        12.7%
//     /billing-cycle         6.4%
//     /customs               8.2%
//     /fuel-card/{6개 카드사}  ~21%
//     /fuel-card/{3개 유종}    ~55%
//     /fuel-card/monthly/*    ~74%
//
//   화면이 이미 커버하는 라우트 (가이드를 또 넣으면 중복 노출)
//     /annual-fee          207.9%   /overseas-payment 146.5%   /fuel-card 103.6%
//     /min-spend           102.6%   /mileage           95.3%   /all       92.3%
//     /overseas-payment/*  83.8~97.9% (통화별 상세를 화면이 직접 렌더)
//
// 새 라우트를 추가하면 seo/routeRichContent.test.ts가 "분류되지 않은 라우트"로 실패한다.
// 실측 후 아래 둘 중 하나에 반드시 넣어라.

/** 가이드 본문을 화면 어디에 붙일지. 정책·소개 페이지는 본문이 곧 페이지라 위로 올린다. */
export type GuidePlacement = "before" | "after" | "none";

/** 화면 콘텐츠가 곧 가이드 본문인 라우트 — 뷰보다 위에 렌더한다. */
const GUIDE_FIRST_ROUTES = new Set(["/about", "/terms", "/privacy"]);

/** 계산기 아래에 가이드를 덧붙이는 라우트. */
const GUIDE_AFTER_ROUTES = new Set([
  "/",
  "/duty-free",
  "/credit-vs-debit",
  "/point-convert",
  "/billing-cycle",
  "/customs",
]);

/** 통합된 변종 중 화면이 얇은 세 계열(카드사·유종·월 주유비). 통화별은 제외 — 화면이 이미 렌더한다. */
const GUIDE_AFTER_PATTERNS = [
  /^\/fuel-card\/(hyundai|shinhan|kb|samsung|lotte|hana)$/,
  /^\/fuel-card\/(gasoline|diesel|lpg)$/,
  /^\/fuel-card\/monthly\/\d+$/,
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
