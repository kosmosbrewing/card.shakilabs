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
