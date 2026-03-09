// 주유소 브랜드 목록 (카드 브랜드 제한 필터링용)

export interface GasStationBrand {
  id: string;
  name: string;
}

export const GAS_STATION_BRANDS: GasStationBrand[] = [
  { id: "all", name: "전체" },
  { id: "SK에너지", name: "SK에너지" },
  { id: "GS칼텍스", name: "GS칼텍스" },
  { id: "S-Oil", name: "S-Oil" },
  { id: "현대오일뱅크", name: "현대오일뱅크" },
];
