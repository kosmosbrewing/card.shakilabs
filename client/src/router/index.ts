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
    meta: { title: "카드사별 주유 할인카드 | Car Tools" },
  },
  // 유종별 SEO 페이지
  {
    path: "/fuel-card/:fuelType(gasoline|diesel)",
    name: "FuelType",
    component: () => import("@/views/FuelTypeView.vue"),
    props: true,
    meta: { title: "유종별 주유 할인카드 비교 | Car Tools" },
  },
  // 월 금액별 SEO 페이지
  {
    path: "/fuel-card/monthly/:amount(\\d+)",
    name: "MonthlyAmount",
    component: () => import("@/views/MonthlyAmountView.vue"),
    props: (route) => ({
      amount: Number.parseInt(String(route.params.amount), 10),
    }),
    meta: { title: "월 주유비별 추천 카드 | Car Tools" },
  },
  {
    path: "/about",
    name: "About",
    component: () => import("@/views/AboutView.vue"),
    meta: { title: "서비스 안내 | Car Tools" },
  },
  {
    path: "/privacy",
    name: "Privacy",
    component: () => import("@/views/PrivacyView.vue"),
    meta: { title: "개인정보 처리방침 | Car Tools" },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/views/NotFoundView.vue"),
    meta: { title: "페이지를 찾을 수 없습니다 | Car Tools" },
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
      : "주유 할인카드 비교 계산기 | Car Tools";
  document.title = title;
  return true;
});

router.afterEach((to, _from, failure) => {
  if (failure) return;
  const title = typeof to.meta.title === "string" ? to.meta.title : document.title;
  trackPageView(to.fullPath, title);
});

export default router;
