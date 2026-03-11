export type AirlineId = "korean-air" | "asiana" | "card-mileage";
export type SeatClass = "economy" | "business" | "first";

export interface AirlineInfo {
  id: AirlineId;
  name: string;
  color: string;
  alliance: string;
  mileageName: string;
}

export interface RouteInfo {
  id: string;
  label: string;
  example: string;
  cashPrice: Record<SeatClass, number>;
}

export interface MileageRedemption {
  routeId: string;
  seatClass: SeatClass;
  milesRequired: number;
}

export interface AirlineMileageData {
  airlineId: AirlineId;
  routes: RouteInfo[];
  redemptions: MileageRedemption[];
}

export const AIRLINES: AirlineInfo[] = [
  { id: "korean-air", name: "대한항공", color: "#2563eb", alliance: "SkyTeam", mileageName: "스카이패스" },
  { id: "asiana", name: "아시아나항공", color: "#dc2626", alliance: "Star Alliance", mileageName: "아시아나클럽" },
  { id: "card-mileage", name: "전환형 포인트(예시)", color: "#0f766e", alliance: "Transfer", mileageName: "카드 포인트 환산 예시" },
];

export const SEAT_CLASS_LABELS: Record<SeatClass, string> = {
  economy: "이코노미",
  business: "비즈니스",
  first: "퍼스트",
};

function createRoutes(multiplier: number): RouteInfo[] {
  return [
    {
      id: "japan",
      label: "한일",
      example: "ICN-NRT",
      cashPrice: { economy: 180000 * multiplier, business: 520000 * multiplier, first: 900000 * multiplier },
    },
    {
      id: "china",
      label: "한중",
      example: "ICN-PVG",
      cashPrice: { economy: 220000 * multiplier, business: 640000 * multiplier, first: 1050000 * multiplier },
    },
    {
      id: "southeast-asia",
      label: "동남아",
      example: "ICN-BKK",
      cashPrice: { economy: 380000 * multiplier, business: 1400000 * multiplier, first: 2200000 * multiplier },
    },
    {
      id: "hawaii",
      label: "하와이",
      example: "ICN-HNL",
      cashPrice: { economy: 720000 * multiplier, business: 2600000 * multiplier, first: 3900000 * multiplier },
    },
    {
      id: "usa",
      label: "미주",
      example: "ICN-LAX",
      cashPrice: { economy: 950000 * multiplier, business: 3800000 * multiplier, first: 5400000 * multiplier },
    },
    {
      id: "europe",
      label: "유럽",
      example: "ICN-CDG",
      cashPrice: { economy: 1150000 * multiplier, business: 4200000 * multiplier, first: 6200000 * multiplier },
    },
  ];
}

export const MILEAGE_DATA: AirlineMileageData[] = [
  {
    airlineId: "korean-air",
    routes: createRoutes(1),
    redemptions: [
      { routeId: "japan", seatClass: "economy", milesRequired: 15000 },
      { routeId: "japan", seatClass: "business", milesRequired: 30000 },
      { routeId: "japan", seatClass: "first", milesRequired: 45000 },
      { routeId: "china", seatClass: "economy", milesRequired: 20000 },
      { routeId: "china", seatClass: "business", milesRequired: 35000 },
      { routeId: "china", seatClass: "first", milesRequired: 50000 },
      { routeId: "southeast-asia", seatClass: "economy", milesRequired: 25000 },
      { routeId: "southeast-asia", seatClass: "business", milesRequired: 45000 },
      { routeId: "southeast-asia", seatClass: "first", milesRequired: 65000 },
      { routeId: "hawaii", seatClass: "economy", milesRequired: 35000 },
      { routeId: "hawaii", seatClass: "business", milesRequired: 62500 },
      { routeId: "hawaii", seatClass: "first", milesRequired: 90000 },
      { routeId: "usa", seatClass: "economy", milesRequired: 35000 },
      { routeId: "usa", seatClass: "business", milesRequired: 62500 },
      { routeId: "usa", seatClass: "first", milesRequired: 80000 },
      { routeId: "europe", seatClass: "economy", milesRequired: 40000 },
      { routeId: "europe", seatClass: "business", milesRequired: 80000 },
      { routeId: "europe", seatClass: "first", milesRequired: 120000 },
    ],
  },
  {
    airlineId: "asiana",
    routes: createRoutes(0.95),
    redemptions: [
      { routeId: "japan", seatClass: "economy", milesRequired: 15000 },
      { routeId: "japan", seatClass: "business", milesRequired: 30000 },
      { routeId: "japan", seatClass: "first", milesRequired: 45000 },
      { routeId: "china", seatClass: "economy", milesRequired: 18000 },
      { routeId: "china", seatClass: "business", milesRequired: 32000 },
      { routeId: "china", seatClass: "first", milesRequired: 47000 },
      { routeId: "southeast-asia", seatClass: "economy", milesRequired: 25000 },
      { routeId: "southeast-asia", seatClass: "business", milesRequired: 45000 },
      { routeId: "southeast-asia", seatClass: "first", milesRequired: 65000 },
      { routeId: "hawaii", seatClass: "economy", milesRequired: 35000 },
      { routeId: "hawaii", seatClass: "business", milesRequired: 60000 },
      { routeId: "hawaii", seatClass: "first", milesRequired: 85000 },
      { routeId: "usa", seatClass: "economy", milesRequired: 35000 },
      { routeId: "usa", seatClass: "business", milesRequired: 62000 },
      { routeId: "usa", seatClass: "first", milesRequired: 85000 },
      { routeId: "europe", seatClass: "economy", milesRequired: 40000 },
      { routeId: "europe", seatClass: "business", milesRequired: 70000 },
      { routeId: "europe", seatClass: "first", milesRequired: 110000 },
    ],
  },
  {
    airlineId: "card-mileage",
    routes: createRoutes(0.9),
    redemptions: [
      { routeId: "japan", seatClass: "economy", milesRequired: 18000 },
      { routeId: "japan", seatClass: "business", milesRequired: 36000 },
      { routeId: "japan", seatClass: "first", milesRequired: 52000 },
      { routeId: "china", seatClass: "economy", milesRequired: 22000 },
      { routeId: "china", seatClass: "business", milesRequired: 38000 },
      { routeId: "china", seatClass: "first", milesRequired: 54000 },
      { routeId: "southeast-asia", seatClass: "economy", milesRequired: 30000 },
      { routeId: "southeast-asia", seatClass: "business", milesRequired: 52000 },
      { routeId: "southeast-asia", seatClass: "first", milesRequired: 76000 },
      { routeId: "hawaii", seatClass: "economy", milesRequired: 42000 },
      { routeId: "hawaii", seatClass: "business", milesRequired: 70000 },
      { routeId: "hawaii", seatClass: "first", milesRequired: 98000 },
      { routeId: "usa", seatClass: "economy", milesRequired: 45000 },
      { routeId: "usa", seatClass: "business", milesRequired: 78000 },
      { routeId: "usa", seatClass: "first", milesRequired: 110000 },
      { routeId: "europe", seatClass: "economy", milesRequired: 50000 },
      { routeId: "europe", seatClass: "business", milesRequired: 85000 },
      { routeId: "europe", seatClass: "first", milesRequired: 125000 },
    ],
  },
];

export function getAirlineInfo(airlineId: AirlineId): AirlineInfo {
  return AIRLINES.find((airline) => airline.id === airlineId) ?? AIRLINES[0];
}

export function getAirlineMileageData(airlineId: AirlineId): AirlineMileageData {
  return MILEAGE_DATA.find((data) => data.airlineId === airlineId) ?? MILEAGE_DATA[0];
}
