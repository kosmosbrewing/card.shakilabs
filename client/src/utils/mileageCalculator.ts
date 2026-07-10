import {
  getAirlineInfo,
  getAirlineMileageData,
  getSeatClassLabel,
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
  hasEnoughMiles: boolean;
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
  balanceEligible: MileageValuePerMile[];
  avgValueByClass: Record<SeatClass, number>;
  bestBalanceEligibleOption: MileageValuePerMile | null;
}

export function calculateMileageValue(input: MileageCalcInput): MileageCalcResult {
  const airline = getAirlineInfo(input.airlineId);
  const data = getAirlineMileageData(input.airlineId);

  const routeMap = new Map(data.routes.map((item) => [item.id, item]));

  const allValues = data.redemptions.map((redemption) => {
    const route = routeMap.get(redemption.routeId);
    const cashPrice = route?.cashPrice[redemption.seatClass] ?? 0;
    const valuePerMile = redemption.milesRequired > 0 ? cashPrice / redemption.milesRequired : 0;
    const hasEnoughMiles = input.mileageBalance >= redemption.milesRequired;
    const milesShortage = Math.max(0, redemption.milesRequired - input.mileageBalance);

    return {
      routeId: redemption.routeId,
      routeLabel: route?.label ?? redemption.routeId,
      seatClass: redemption.seatClass,
      seatClassLabel: getSeatClassLabel(input.airlineId, redemption.seatClass),
      milesRequired: redemption.milesRequired,
      cashPrice,
      valuePerMile,
      hasEnoughMiles,
      milesShortage,
      example: route?.example ?? "",
    };
  });

  const balanceEligible = allValues.filter((item) => item.hasEnoughMiles);
  const bestBalanceEligibleOption =
    [...balanceEligible].sort((a, b) => b.valuePerMile - a.valuePerMile)[0] ??
    null;
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
    balanceEligible,
    avgValueByClass,
    bestBalanceEligibleOption,
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
