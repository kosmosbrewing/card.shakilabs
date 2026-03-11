import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  ANNUAL_FEE_CARDS,
  BENEFIT_CATEGORIES,
  createDefaultSpendingPattern,
  type BenefitCategoryId,
  type SpendingPatternMap,
} from "@/data/annualFeeCards";
import { buildQuery, isSameQuery, parseQueryInt, queryFirst } from "@/lib/routeState";
import { sanitizeBenefitSpending } from "@/lib/validators";
import {
  calculateAllAnnualFee,
  type AnnualFeeCalcInput,
  type AnnualFeeCalcResult,
} from "@/utils/annualFeeCalculator";

export type AnnualFeeSortKey = "netBenefit" | "breakEven" | "annualFee";

function parseSortKey(value: unknown): AnnualFeeSortKey {
  const raw = queryFirst(value);
  if (raw === "breakEven" || raw === "annualFee") return raw;
  return "netBenefit";
}

function buildSpendingFromQuery(query: Record<string, unknown>): SpendingPatternMap {
  const spending = createDefaultSpendingPattern();

  for (const category of BENEFIT_CATEGORIES) {
    spending[category.id] = sanitizeBenefitSpending(
      parseQueryInt(query[category.id]),
      spending[category.id]
    );
  }

  return spending;
}

export function useAnnualFeeCalc() {
  const route = useRoute();
  const router = useRouter();

  const spending = ref<SpendingPatternMap>(buildSpendingFromQuery(route.query));
  const sortKey = ref<AnnualFeeSortKey>(parseSortKey(route.query.sort));

  const calcInput = computed<AnnualFeeCalcInput>(() => ({
    spending: spending.value,
  }));

  const allResults = computed(() => calculateAllAnnualFee(ANNUAL_FEE_CARDS, calcInput.value));
  const sortedResults = computed(() => {
    const sorted = [...allResults.value];

    switch (sortKey.value) {
      case "annualFee":
        sorted.sort((a, b) => a.annualFee - b.annualFee || b.annualNetBenefit - a.annualNetBenefit);
        break;
      case "breakEven":
        sorted.sort((a, b) => {
          const left = a.breakEvenMonths ?? Number.POSITIVE_INFINITY;
          const right = b.breakEvenMonths ?? Number.POSITIVE_INFINITY;
          return left - right || b.annualNetBenefit - a.annualNetBenefit;
        });
        break;
      case "netBenefit":
      default:
        sorted.sort((a, b) => b.annualNetBenefit - a.annualNetBenefit || a.annualFee - b.annualFee);
        break;
    }

    return sorted;
  });

  const topCards = computed(() => sortedResults.value.slice(0, 3));
  const bestCard = computed<AnnualFeeCalcResult | null>(() => sortedResults.value[0] ?? null);
  const totalMonthlySpend = computed(() =>
    Object.values(spending.value).reduce((sum, amount) => sum + amount, 0)
  );

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  watch(
    [spending, sortKey],
    () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const spendingQuery = Object.fromEntries(
          BENEFIT_CATEGORIES.map((category) => [
            category.id,
            spending.value[category.id] !== createDefaultSpendingPattern()[category.id]
              ? spending.value[category.id]
              : undefined,
          ])
        );

        const nextQuery = buildQuery({
          ...spendingQuery,
          sort: sortKey.value !== "netBenefit" ? sortKey.value : undefined,
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
      spending.value = buildSpendingFromQuery(query);
      sortKey.value = parseSortKey(query.sort);
    }
  );

  function updateSpending(categoryId: BenefitCategoryId, amount: number) {
    spending.value = {
      ...spending.value,
      [categoryId]: sanitizeBenefitSpending(amount, 0),
    };
  }

  return {
    spending,
    sortKey,
    allResults,
    sortedResults,
    topCards,
    bestCard,
    totalMonthlySpend,
    updateSpending,
  };
}
