import {
  getAirlineInfo,
  getAirlineMileageData,
  SEAT_CLASS_LABELS,
  type AirlineId,
  type SeatClass,
} from "@/data/mileageData";

export interface MileageCalcInput {
  airlineId: AirlineId;
  mileageBalance: number;
}

export interface MileageValuePerMile {
  routeId: string;
  routeLabel: string;
  seatClass: SeatClass;
  seatClassLabel: string;
  milesRequired: number;
  cashPrice: number;
  valuePerMile: number;
  canRedeem: boolean;
  milesShortage: number;
  example: string;
}

export interface MileageCalcResult {
  airlineId: AirlineId;
  airlineName: string;
  mileageBalance: number;
  bestValuePerMile: number;
  totalValueKrw: number;
  allValues: MileageValuePerMile[];
  redeemable: MileageValuePerMile[];
  avgValueByClass: Record<SeatClass, number>;
  bestOption: MileageValuePerMile | null;
}

export function calculateMileageValue(input: MileageCalcInput): MileageCalcResult {
  const airline = getAirlineInfo(input.airlineId);
  const data = getAirlineMileageData(input.airlineId);

  const allValues = data.redemptions.map((redemption) => {
    const route = data.routes.find((item) => item.id === redemption.routeId);
    const cashPrice = route?.cashPrice[redemption.seatClass] ?? 0;
    const valuePerMile = redemption.milesRequired > 0 ? cashPrice / redemption.milesRequired : 0;
    const canRedeem = input.mileageBalance >= redemption.milesRequired;
    const milesShortage = Math.max(0, redemption.milesRequired - input.mileageBalance);

    return {
      routeId: redemption.routeId,
      routeLabel: route?.label ?? redemption.routeId,
      seatClass: redemption.seatClass,
      seatClassLabel: SEAT_CLASS_LABELS[redemption.seatClass],
      milesRequired: redemption.milesRequired,
      cashPrice,
      valuePerMile,
      canRedeem,
      milesShortage,
      example: route?.example ?? "",
    };
  });

  const redeemable = allValues.filter((item) => item.canRedeem);
  const bestOption = [...redeemable].sort((a, b) => b.valuePerMile - a.valuePerMile)[0] ?? null;
  const bestValuePerMile = allValues.length > 0
    ? Math.max(...allValues.map((item) => item.valuePerMile))
    : 0;

  const avgValueByClass = {
    economy: averageValue(allValues.filter((item) => item.seatClass === "economy")),
    business: averageValue(allValues.filter((item) => item.seatClass === "business")),
    first: averageValue(allValues.filter((item) => item.seatClass === "first")),
  };

  return {
    airlineId: input.airlineId,
    airlineName: airline.name,
    mileageBalance: input.mileageBalance,
    bestValuePerMile,
    totalValueKrw: Math.round(input.mileageBalance * bestValuePerMile),
    allValues,
    redeemable,
    avgValueByClass,
    bestOption,
  };
}

function averageValue(values: MileageValuePerMile[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, item) => sum + item.valuePerMile, 0) / values.length;
}

export function formatValuePerMile(value: number): string {
  return `${Math.round(value).toLocaleString()}원/마일`;
}

export function formatTotalValue(value: number): string {
  return `${value.toLocaleString()}원`;
}
