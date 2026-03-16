import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
import { trackPageView } from "@/lib/analytics";

const routes: RouteRecordRaw[] = [
  // 루트 → /fuel-card로 리다이렉트
  {
    path: "/",
    redirect: "/fuel-card",
  },
  // 메인: 주유 할인카드 비교 계산기
  {
    path: "/fuel-card",
    name: "FuelCard",
    component: () => import("@/views/FuelCardView.vue"),
    meta: { title: "주유 할인카드 비교 계산기 | 내 주유량에 맞는 최적 카드 찾기 2026" },
  },
  // 카드사별 상세 (동적)
  {
    path: "/fuel-card/:issuer(hyundai|shinhan|kb|samsung|lotte|hana)",
    name: "CardIssuer",
    component: () => import("@/views/CardIssuerView.vue"),
    props: true,
    meta: { title: "카드사별 주유 할인카드 | 카드 계산기" },
  },
  // 유종별 SEO 페이지
  {
    path: "/fuel-card/:fuelType(gasoline|diesel|lpg)",
    name: "FuelType",
    component: () => import("@/views/FuelTypeView.vue"),
    props: true,
    meta: { title: "유종별 주유 할인카드 비교 | 카드 계산기" },
  },
  // 월 금액별 SEO 페이지
  {
    path: "/fuel-card/monthly/:amount(\\d+)",
    name: "MonthlyAmount",
    component: () => import("@/views/MonthlyAmountView.vue"),
    props: (route) => ({
      amount: Number.parseInt(String(route.params.amount), 10),
    }),
    meta: { title: "월 주유비별 추천 카드 | 카드 계산기" },
  },
  {
    path: "/overseas-payment",
    name: "OverseasPayment",
    component: () => import("@/views/OverseasPaymentView.vue"),
    meta: { title: "해외결제 카드 비교 + DCC 수수료 계산기 | 카드 계산기" },
  },
  {
    path: "/overseas-payment/:currency(usd|eur|jpy|gbp|cny|thb|vnd)",
    name: "OverseasCurrency",
    component: () => import("@/views/OverseasCurrencyView.vue"),
    props: true,
    meta: { title: "통화별 해외결제 카드 비교 | 카드 계산기" },
  },
  {
    path: "/min-spend",
    name: "MinSpend",
    component: () => import("@/views/MinSpendView.vue"),
    meta: { title: "전월 실적 채우기 최소 비용 계산기 | 카드 계산기" },
  },
  {
    path: "/annual-fee",
    name: "AnnualFee",
    component: () => import("@/views/AnnualFeeView.vue"),
    meta: { title: "연회비 회수 계산기 | 카드 계산기" },
  },
  {
    path: "/duty-free",
    name: "DutyFree",
    component: () => import("@/views/DutyFreeView.vue"),
    meta: { title: "면세 한도 초과 관세 계산기 | 카드 계산기" },
  },
  {
    path: "/mileage",
    name: "Mileage",
    component: () => import("@/views/MileageView.vue"),
    meta: { title: "마일리지 가치 계산기 | 카드 계산기" },
  },
  {
    path: "/about",
    name: "About",
    component: () => import("@/views/AboutView.vue"),
    meta: { title: "서비스 안내 | 카드 계산기" },
  },
  {
    path: "/privacy",
    name: "Privacy",
    component: () => import("@/views/PrivacyView.vue"),
    meta: { title: "개인정보 처리방침 | 카드 계산기" },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/views/NotFoundView.vue"),
    meta: { title: "페이지를 찾을 수 없습니다 | 카드 계산기" },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition;
    if (to.hash) return { el: to.hash, behavior: "smooth", top: 80 };
    return { top: 0 };
  },
});

router.beforeEach(async (to) => {
  const title =
    typeof to.meta.title === "string"
      ? to.meta.title
      : "카드 계산기";
  document.title = title;
  return true;
});

router.afterEach((to, _from, failure) => {
  if (failure) return;
  const title = typeof to.meta.title === "string" ? to.meta.title : document.title;
  trackPageView(to.fullPath, title);
});

export default router;
