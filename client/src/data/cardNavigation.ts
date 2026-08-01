export interface CardToolLink {
  path: string;
  title: string;
  description: string;
}

export interface CardToolGroup {
  key: string;
  title: string;
  description: string;
  tools: readonly CardToolLink[];
}

export const CARD_TOOL_GROUPS: readonly CardToolGroup[] = [
  {
    key: "benefit",
    title: "혜택·고정지출",
    description: "카드 혜택이 실제 지출보다 큰지 확인하세요.",
    tools: [
      { path: "/fuel-card", title: "주유 카드 비교", description: "월 주유비에 맞는 카드별 연간 순혜택을 비교합니다." },
      { path: "/min-spend", title: "전월 실적", description: "혜택을 받기 위해 필요한 최소 추가 지출을 계산합니다." },
      { path: "/annual-fee", title: "연회비 회수", description: "연간 혜택이 연회비를 회수하는 시점을 확인합니다." },
      { path: "/credit-vs-debit", title: "신용 vs 체크", description: "소비 패턴별 소득공제와 혜택 차이를 비교합니다." },
    ],
  },
  {
    key: "overseas",
    title: "해외·여행 결제",
    description: "출국과 직구 전에 수수료와 세금을 점검하세요.",
    tools: [
      { path: "/overseas-payment", title: "해외결제 수수료", description: "DCC와 카드사 수수료를 포함한 결제 비용을 비교합니다." },
      { path: "/duty-free", title: "면세 한도", description: "면세 한도 초과 시 예상 관세를 계산합니다." },
      { path: "/customs", title: "해외직구 관세", description: "직구 품목과 금액 기준 예상 세금을 확인합니다." },
      { path: "/mileage", title: "마일리지 가치", description: "노선별 항공 마일리지의 체감 가치를 비교합니다." },
    ],
  },
  {
    key: "payment",
    title: "포인트·결제 관리",
    description: "쌓인 포인트와 카드 이용기간을 놓치지 마세요.",
    tools: [
      { path: "/point-convert", title: "포인트 전환", description: "포인트 전환 비율과 실제 가치를 비교합니다." },
      { path: "/billing-cycle", title: "결제일 이용기간", description: "결제일별 카드 이용기간을 확인합니다." },
    ],
  },
] as const;

export interface CardHomeEntry {
  path: string;
  situation: string;
  checkpoint: string;
  label: string;
}

// 홈은 카테고리 나열(/all)과 겹치지 않도록 "상황 → 계산기" 진입점만 노출한다.
// 정적 프리렌더(scripts/prerender-home.mjs)와 같은 순서를 유지한다.
export const CARD_HOME_ENTRIES: readonly CardHomeEntry[] = [
  { path: "/fuel-card", situation: "매달 주유비가 부담된다", checkpoint: "카드별 리터당 할인과 월 할인 한도", label: "주유 할인카드 비교" },
  { path: "/overseas-payment", situation: "해외여행·직구를 앞두고 있다", checkpoint: "해외수수료와 DCC 원화결제 손해액", label: "해외결제 수수료 비교" },
  { path: "/annual-fee", situation: "연회비가 아까운지 모르겠다", checkpoint: "연간 혜택이 연회비를 넘는 시점", label: "연회비 회수 계산" },
  { path: "/min-spend", situation: "실적 채우려 억지 소비를 한다", checkpoint: "실적 충족에 드는 추가 지출", label: "전월 실적 계산" },
  { path: "/point-convert", situation: "쌓인 포인트·마일리지가 있다", checkpoint: "전환처별 1포인트 실질 가치", label: "포인트 전환 비교" },
  { path: "/duty-free", situation: "면세 한도를 넘길 것 같다", checkpoint: "초과분 예상 관세와 부가세", label: "면세 한도 계산" },
] as const;
