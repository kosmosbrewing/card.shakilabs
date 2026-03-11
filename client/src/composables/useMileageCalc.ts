import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { SEAT_CLASS_LABELS, type AirlineId, type SeatClass } from "@/data/mileageData";
import { buildQuery, isSameQuery, parseQueryInt, queryFirst } from "@/lib/routeState";
import { airlineIdSchema, sanitizeMileageBalance } from "@/lib/validators";
import {
  calculateMileageValue,
  type MileageCalcResult,
  type MileageValuePerMile,
} from "@/utils/mileageCalculator";

export type MileageSortKey = "valuePerMile" | "milesRequired" | "route";
export type MileageFilterClass = "all" | SeatClass;

function parseAirlineId(value: unknown): AirlineId {
  const parsed = airlineIdSchema.safeParse(queryFirst(value));
  return parsed.success ? parsed.data : "korean-air";
}

function parseSortKey(value: unknown): MileageSortKey {
  const raw = queryFirst(value);
  if (raw === "milesRequired" || raw === "route") return raw;
  return "valuePerMile";
}

function parseSelectedClass(value: unknown): MileageFilterClass {
  const raw = queryFirst(value);
  if (raw === "economy" || raw === "business" || raw === "first") return raw;
  return "all";
}

export function useMileageCalc() {
  const route = useRoute();
  const router = useRouter();

  const airlineId = ref<AirlineId>(parseAirlineId(route.query.airline));
  const mileageBalance = ref(sanitizeMileageBalance(parseQueryInt(route.query.miles), 30000));
  const sortKey = ref<MileageSortKey>(parseSortKey(route.query.sort));
  const selectedClass = ref<MileageFilterClass>(parseSelectedClass(route.query.class));

  const result = computed<MileageCalcResult>(() =>
    calculateMileageValue({
      airlineId: airlineId.value,
      mileageBalance: mileageBalance.value,
    })
  );

  const filteredValues = computed(() =>
    selectedClass.value === "all"
      ? result.value.allValues
      : result.value.allValues.filter((item) => item.seatClass === selectedClass.value)
  );

  const sortedValues = computed<MileageValuePerMile[]>(() => {
    const values = [...filteredValues.value];

    switch (sortKey.value) {
      case "milesRequired":
        values.sort((a, b) => a.milesRequired - b.milesRequired || b.valuePerMile - a.valuePerMile);
        break;
      case "route":
        values.sort((a, b) => a.routeLabel.localeCompare(b.routeLabel) || b.valuePerMile - a.valuePerMile);
        break;
      case "valuePerMile":
      default:
        values.sort((a, b) => b.valuePerMile - a.valuePerMile || a.milesRequired - b.milesRequired);
        break;
    }

    return values;
  });

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  watch([airlineId, mileageBalance, sortKey, selectedClass], () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const nextQuery = buildQuery({
        airline: airlineId.value !== "korean-air" ? airlineId.value : undefined,
        miles: mileageBalance.value !== 30000 ? mileageBalance.value : undefined,
        sort: sortKey.value !== "valuePerMile" ? sortKey.value : undefined,
        class: selectedClass.value !== "all" ? selectedClass.value : undefined,
      });

      if (!isSameQuery(route.query, nextQuery)) {
        router.replace({ query: nextQuery });
      }
    }, 300);
  }, { flush: "post" });

  watch(
    () => route.query,
    (query) => {
      airlineId.value = parseAirlineId(query.airline);
      mileageBalance.value = sanitizeMileageBalance(parseQueryInt(query.miles), 30000);
      sortKey.value = parseSortKey(query.sort);
      selectedClass.value = parseSelectedClass(query.class);
    }
  );

  return {
    airlineId,
    mileageBalance,
    sortKey,
    selectedClass,
    result,
    filteredValues,
    sortedValues,
    seatClassLabels: SEAT_CLASS_LABELS,
  };
}
