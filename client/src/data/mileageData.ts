export type AirlineId = "korean-air" | "asiana";
export type SeatClass = "economy" | "business" | "first";

export interface AirlineInfo {
  id: AirlineId;
  name: string;
  color: string;
  alliance: string;
  mileageName: string;
  premiumClassLabel: string;
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
  { id: "korean-air", name: "대한항공", color: "#2563eb", alliance: "SkyTeam", mileageName: "스카이패스", premiumClassLabel: "일등석" },
  { id: "asiana", name: "아시아나항공", color: "#dc2626", alliance: "Star Alliance", mileageName: "아시아나클럽", premiumClassLabel: "비즈니스 스마티움" },
];

export const SEAT_CLASS_LABELS: Record<SeatClass, string> = {
  economy: "이코노미",
  business: "비즈니스",
  first: "상위석",
};

export const MILEAGE_ASSUMPTIONS = {
  verifiedAt: "2026-07-10",
  journey: "평수기 성인 1명 왕복",
  cashFare: "서비스 내 왕복 예시 운임",
  exclusions: "세금·유류할증료·수수료와 좌석 재고 미반영",
} as const;

function createRoutes(): RouteInfo[] {
  return [
    {
      id: "japan",
      label: "한일",
      example: "ICN-NRT",
      cashPrice: { economy: 180000, business: 520000, first: 900000 },
    },
    {
      id: "china",
      label: "한중",
      example: "ICN-PVG",
      cashPrice: { economy: 220000, business: 640000, first: 1050000 },
    },
    {
      id: "southeast-asia",
      label: "동남아",
      example: "ICN-BKK",
      cashPrice: { economy: 380000, business: 1400000, first: 2200000 },
    },
    {
      id: "hawaii",
      label: "하와이",
      example: "ICN-HNL",
      cashPrice: { economy: 720000, business: 2600000, first: 3900000 },
    },
    {
      id: "usa",
      label: "미주",
      example: "ICN-LAX",
      cashPrice: { economy: 950000, business: 3800000, first: 5400000 },
    },
    {
      id: "europe",
      label: "유럽",
      example: "ICN-CDG",
      cashPrice: { economy: 1150000, business: 4200000, first: 6200000 },
    },
  ];
}

export const MILEAGE_DATA: AirlineMileageData[] = [
  {
    airlineId: "korean-air",
    routes: createRoutes(),
    redemptions: [
      { routeId: "japan", seatClass: "economy", milesRequired: 30000 },
      { routeId: "japan", seatClass: "business", milesRequired: 45000 },
      { routeId: "japan", seatClass: "first", milesRequired: 65000 },
      { routeId: "china", seatClass: "economy", milesRequired: 30000 },
      { routeId: "china", seatClass: "business", milesRequired: 45000 },
      { routeId: "china", seatClass: "first", milesRequired: 65000 },
      { routeId: "southeast-asia", seatClass: "economy", milesRequired: 40000 },
      { routeId: "southeast-asia", seatClass: "business", milesRequired: 70000 },
      { routeId: "southeast-asia", seatClass: "first", milesRequired: 90000 },
      { routeId: "hawaii", seatClass: "economy", milesRequired: 70000 },
      { routeId: "hawaii", seatClass: "business", milesRequired: 125000 },
      { routeId: "hawaii", seatClass: "first", milesRequired: 160000 },
      { routeId: "usa", seatClass: "economy", milesRequired: 70000 },
      { routeId: "usa", seatClass: "business", milesRequired: 125000 },
      { routeId: "usa", seatClass: "first", milesRequired: 160000 },
      { routeId: "europe", seatClass: "economy", milesRequired: 70000 },
      { routeId: "europe", seatClass: "business", milesRequired: 125000 },
      { routeId: "europe", seatClass: "first", milesRequired: 160000 },
    ],
  },
  {
    airlineId: "asiana",
    routes: createRoutes(),
    redemptions: [
      { routeId: "japan", seatClass: "economy", milesRequired: 30000 },
      { routeId: "japan", seatClass: "business", milesRequired: 45000 },
      { routeId: "japan", seatClass: "first", milesRequired: 50000 },
      { routeId: "china", seatClass: "economy", milesRequired: 30000 },
      { routeId: "china", seatClass: "business", milesRequired: 45000 },
      { routeId: "china", seatClass: "first", milesRequired: 50000 },
      { routeId: "southeast-asia", seatClass: "economy", milesRequired: 40000 },
      { routeId: "southeast-asia", seatClass: "business", milesRequired: 60000 },
      { routeId: "southeast-asia", seatClass: "first", milesRequired: 70000 },
      { routeId: "hawaii", seatClass: "economy", milesRequired: 70000 },
      { routeId: "hawaii", seatClass: "business", milesRequired: 105000 },
      { routeId: "hawaii", seatClass: "first", milesRequired: 125000 },
      { routeId: "usa", seatClass: "economy", milesRequired: 70000 },
      { routeId: "usa", seatClass: "business", milesRequired: 105000 },
      { routeId: "usa", seatClass: "first", milesRequired: 125000 },
      { routeId: "europe", seatClass: "economy", milesRequired: 70000 },
      { routeId: "europe", seatClass: "business", milesRequired: 105000 },
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

export function getSeatClassLabel(
  airlineId: AirlineId,
  seatClass: SeatClass
): string {
  if (seatClass !== "first") return SEAT_CLASS_LABELS[seatClass];
  return getAirlineInfo(airlineId).premiumClassLabel;
}
