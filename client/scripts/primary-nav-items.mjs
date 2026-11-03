// 2차 내비(데스크톱 인라인) · 모바일 좌측 드로어 · 프리렌더 정적 드로어가 공유하는 단일 출처.
//
// 왜 scripts/에 두나: 프리렌더 레이아웃(prerender-layout.mjs)은 Node에서 돌기 때문에
// .ts를 읽지 못한다. 목록을 양쪽에 적어 두면 도구를 추가할 때 한쪽만 늘어나고,
// 그 어긋남은 드로어를 열어 보기 전까지 어느 게이트에도 걸리지 않는다.
// 이 저장소는 이미 같은 이유로 scripts/*.mjs를 src에서 직접 import한다
// (prerender-content.mjs, seo-routes.mjs 등).

/** @type {readonly {key: string, label: string, to: string}[]} */
export const PRIMARY_NAV_ITEMS = [
  // GA4 28d views (2026-11): mileage 825, duty-free 164, overseas 40, fuel-card 18, annual-fee 4,
  // customs 3; the other five tools had 1-2 each. Eleven tabs wrapped to three rows on 390px,
  // so the bar keeps the six that get used plus the directory. Every tool stays reachable
  // from /all, the footer and the home situation cards (2026-11 UI audit, section D).
  { key: "mileage", label: "마일리지 가치", to: "/mileage" },
  { key: "duty-free", label: "관세 계산", to: "/duty-free" },
  { key: "overseas-payment", label: "해외결제 비교", to: "/overseas-payment" },
  { key: "fuel-card", label: "주유 할인카드", to: "/fuel-card" },
  { key: "annual-fee", label: "연회비 회수", to: "/annual-fee" },
  { key: "customs", label: "직구 관세", to: "/customs" },
  { key: "all", label: "전체 도구", to: "/all" },
];

/** 현재 경로에 해당하는 탭. 인라인 내비와 드로어가 같은 규칙으로 판정해야 한다. */
export function findActiveNavItem(path) {
  return PRIMARY_NAV_ITEMS.find((item) => path.startsWith(`/${item.key}`));
}
