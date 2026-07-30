import type { SiteFooterLink, SiteFooterSection } from "@shakilabs/ui";

/** 푸터 계산기 목록 — 라우터의 실제 경로만 담는다(리다이렉트 별칭 제외) */
export const FOOTER_SECTIONS: readonly SiteFooterSection[] = [
  {
    title: "혜택·고정지출",
    links: [
    { to: "/fuel-card", label: "주유 카드 비교" },
    { to: "/min-spend", label: "전월 실적" },
    { to: "/annual-fee", label: "연회비 회수" },
    { to: "/credit-vs-debit", label: "신용 vs 체크" },
    ],
  },
  {
    title: "해외·여행 결제",
    links: [
    { to: "/overseas-payment", label: "해외결제 수수료" },
    { to: "/duty-free", label: "면세 한도" },
    { to: "/customs", label: "해외직구 관세" },
    { to: "/mileage", label: "마일리지 가치" },
    ],
  },
  {
    title: "포인트·결제 관리",
    links: [
    { to: "/point-convert", label: "포인트 전환" },
    { to: "/billing-cycle", label: "결제일 이용기간" },
    ],
  },
];

export const FOOTER_ALL_LINK: SiteFooterLink = {
  to: "/all",
  label: "전체 계산기 보기 →",
};
