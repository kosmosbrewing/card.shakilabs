export interface SpendingCategory {
  id: string;
  label: string;
  placeholder: string;
  defaultAmount: number;
  order: number;
}

export const SPENDING_CATEGORIES: SpendingCategory[] = [
  { id: "groceries", label: "식비/생활비", placeholder: "마트, 배달, 외식 등", defaultAmount: 0, order: 1 },
  { id: "transport", label: "교통비", placeholder: "대중교통, 택시 등", defaultAmount: 0, order: 2 },
  { id: "telecom", label: "통신비", placeholder: "핸드폰, 인터넷", defaultAmount: 0, order: 3 },
  { id: "utilities", label: "공과금", placeholder: "전기, 가스, 수도", defaultAmount: 0, order: 4 },
  { id: "insurance", label: "보험료", placeholder: "자동차, 실손 보험 등", defaultAmount: 0, order: 5 },
  { id: "shopping", label: "쇼핑/온라인", placeholder: "쿠팡, 의류 등", defaultAmount: 0, order: 6 },
  { id: "other", label: "기타", placeholder: "기타 카드 결제", defaultAmount: 0, order: 7 },
];

export type SpendingCategoryId = (typeof SPENDING_CATEGORIES)[number]["id"];
export type SpendingMap = Record<SpendingCategoryId, number>;

export function createDefaultSpendingMap(): SpendingMap {
  const map = {} as SpendingMap;

  for (const category of SPENDING_CATEGORIES) {
    map[category.id] = category.defaultAmount;
  }

  return map;
}

export function sumSpendingMap(spending: SpendingMap): number {
  return Object.values(spending).reduce((sum, amount) => sum + amount, 0);
}
