import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  type DutyFreeCategory,
  DUTY_FREE_CATEGORIES,
} from "@/data/dutyFreeRates";
import { buildQuery, isSameQuery, parseQueryFloat, queryFirst } from "@/lib/routeState";
import { dutyFreeCategorySchema, sanitizeDutyFreeAmount } from "@/lib/validators";
import { calculateDutyFree, type DutyFreeCalcResult } from "@/utils/dutyFreeCalculator";

function parseDutyFreeCategory(value: unknown): DutyFreeCategory {
  const parsed = dutyFreeCategorySchema.safeParse(queryFirst(value));
  return parsed.success ? parsed.data : DUTY_FREE_CATEGORIES[0].id;
}

export function useDutyFreeCalc() {
  const route = useRoute();
  const router = useRouter();

  const purchaseAmountUsd = ref(sanitizeDutyFreeAmount(parseQueryFloat(route.query.amount), 1200));
  const category = ref<DutyFreeCategory>(parseDutyFreeCategory(route.query.category));

  const result = computed<DutyFreeCalcResult>(() =>
    calculateDutyFree({
      purchaseAmountUsd: purchaseAmountUsd.value,
      category: category.value,
    })
  );

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  watch([purchaseAmountUsd, category], () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const nextQuery = buildQuery({
        amount: purchaseAmountUsd.value !== 1200 ? purchaseAmountUsd.value : undefined,
        category: category.value !== DUTY_FREE_CATEGORIES[0].id ? category.value : undefined,
      });

      if (!isSameQuery(route.query, nextQuery)) {
        router.replace({ query: nextQuery });
      }
    }, 300);
  }, { flush: "post" });

  watch(
    () => route.query,
    (query) => {
      purchaseAmountUsd.value = sanitizeDutyFreeAmount(parseQueryFloat(query.amount), 1200);
      category.value = parseDutyFreeCategory(query.category);
    }
  );

  return {
    purchaseAmountUsd,
    category,
    result,
  };
}
