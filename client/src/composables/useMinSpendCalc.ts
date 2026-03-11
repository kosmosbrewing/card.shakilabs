import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { FUEL_CARDS } from "@/data/fuelCards";
import {
  SPENDING_CATEGORIES,
  createDefaultSpendingMap,
  type SpendingMap,
} from "@/data/spendingCategories";
import { buildQuery, isSameQuery, parseQueryInt, queryFirst } from "@/lib/routeState";
import {
  sanitizeFuelType,
  sanitizeMonthlySpend,
  sanitizeSpendingAmount,
} from "@/lib/validators";
import {
  calculateAllMinSpend,
  type MinSpendCalcInput,
  type MinSpendCalcResult,
} from "@/utils/minSpendCalculator";

export type MinSpendSortKey = "netBenefit" | "gap" | "minSpend";

function parseQueryFuelType(value: unknown) {
  return sanitizeFuelType(queryFirst(value));
}

function parseQuerySpend(value: unknown, fallback = 0) {
  return sanitizeSpendingAmount(parseQueryInt(value), fallback);
}

function buildSpendingFromQuery(query: Record<string, unknown>): SpendingMap {
  const spending = createDefaultSpendingMap();

  for (const category of SPENDING_CATEGORIES) {
    spending[category.id] = parseQuerySpend(query[category.id], category.defaultAmount);
  }

  return spending;
}

export function useMinSpendCalc() {
  const route = useRoute();
  const router = useRouter();

  const fuelType = ref(parseQueryFuelType(route.query.fuel));
  const fuelSpend = ref(sanitizeMonthlySpend(parseQueryInt(route.query.fuelSpend), 200000));
  const preferredBrand = ref<string>(
    typeof route.query.brand === "string" ? route.query.brand : "all"
  );
  const spending = ref<SpendingMap>(buildSpendingFromQuery(route.query));
  const sortKey = ref<MinSpendSortKey>("netBenefit");

  const calcInput = computed<MinSpendCalcInput>(() => ({
    fuelType: fuelType.value,
    fuelSpend: fuelSpend.value,
    spending: spending.value,
    preferredBrand: preferredBrand.value,
  }));

  const allResults = computed(() => calculateAllMinSpend(FUEL_CARDS, calcInput.value));
  const applicableResults = computed(() =>
    allResults.value.filter((result) => !result.isBrandMismatch)
  );
  const mismatchResults = computed(() =>
    allResults.value.filter((result) => result.isBrandMismatch)
  );
  const qualifiedCards = computed(() =>
    applicableResults.value.filter((result) => result.isQualified)
  );
  const unqualifiedCards = computed(() =>
    applicableResults.value.filter((result) => !result.isQualified)
  );

  const sortedResults = computed(() => {
    const sorted = [...applicableResults.value];

    switch (sortKey.value) {
      case "gap":
        sorted.sort((a, b) => a.gap - b.gap || b.netBenefitIncludingGap - a.netBenefitIncludingGap);
        break;
      case "minSpend":
        sorted.sort((a, b) => a.minSpendRequired - b.minSpendRequired || b.netBenefitIncludingGap - a.netBenefitIncludingGap);
        break;
      case "netBenefit":
      default:
        sorted.sort((a, b) => b.netBenefitIncludingGap - a.netBenefitIncludingGap);
        break;
    }

    return sorted;
  });

  const topCards = computed(() => sortedResults.value.slice(0, 3));
  const bestCard = computed<MinSpendCalcResult | null>(() => sortedResults.value[0] ?? null);
  const totalSpending = computed(
    () =>
      fuelSpend.value +
      Object.values(spending.value).reduce((sum, amount) => sum + amount, 0)
  );

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  watch(
    [fuelType, fuelSpend, preferredBrand, spending],
    () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const spendingQuery = Object.fromEntries(
          SPENDING_CATEGORIES.map((category) => [
            category.id,
            spending.value[category.id] > 0 ? spending.value[category.id] : undefined,
          ])
        );

        const nextQuery = buildQuery({
          fuel: fuelType.value !== "gasoline" ? fuelType.value : undefined,
          fuelSpend: fuelSpend.value !== 200000 ? fuelSpend.value : undefined,
          brand: preferredBrand.value !== "all" ? preferredBrand.value : undefined,
          ...spendingQuery,
        });

        if (!isSameQuery(route.query, nextQuery)) {
          router.replace({ query: nextQuery });
        }
      }, 300);
    },
    { deep: true, flush: "post" }
  );

  watch(
    () => route.query,
    (query) => {
      fuelType.value = parseQueryFuelType(query.fuel);
      fuelSpend.value = sanitizeMonthlySpend(parseQueryInt(query.fuelSpend), 200000);
      preferredBrand.value = typeof query.brand === "string" ? query.brand : "all";
      spending.value = buildSpendingFromQuery(query);
    }
  );

  function updateSpending(categoryId: keyof SpendingMap, amount: number) {
    spending.value = {
      ...spending.value,
      [categoryId]: sanitizeSpendingAmount(amount, 0),
    };
  }

  return {
    fuelType,
    fuelSpend,
    preferredBrand,
    spending,
    sortKey,
    totalSpending,
    allResults,
    applicableResults,
    mismatchResults,
    qualifiedCards,
    unqualifiedCards,
    sortedResults,
    topCards,
    bestCard,
    updateSpending,
  };
}
