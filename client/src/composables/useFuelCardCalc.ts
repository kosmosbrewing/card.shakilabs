// 주유 할인카드 비교 계산 composable

import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { FUEL_CARDS, getFuelCardMinimumSpend } from "@/data/fuelCards";
import type { FuelType } from "@/data/fuelPrices";
import {
  calculateAllCards,
  type FuelCardCalcInput,
  type FuelCardCalcResult,
} from "@/utils/calculator";
import { parseQueryInt } from "@/lib/routeState";

// URL 쿼리 → 상태 파싱
function parseQueryFuelType(val: unknown): FuelType {
  if (val === "diesel" || val === "lpg") return val;
  return "gasoline";
}

export type SortKey = "savings" | "annualFee" | "minSpend";

export function useFuelCardCalc() {
  const route = useRoute();
  const router = useRouter();

  // 입력 상태
  const fuelType = ref<FuelType>(parseQueryFuelType(route.query.fuel));
  const monthlySpend = ref((parseQueryInt(route.query.monthly) ?? 200000));
  const preferredBrand = ref<string>(
    typeof route.query.brand === "string" ? route.query.brand : "all"
  );
  const sortKey = ref<SortKey>("savings");

  // 계산 입력
  const calcInput = computed<FuelCardCalcInput>(() => ({
    fuelType: fuelType.value,
    monthlySpend: monthlySpend.value,
    preferredBrand: preferredBrand.value,
  }));

  // 전체 카드 계산 결과
  const allResults = computed(() => calculateAllCards(FUEL_CARDS, calcInput.value));

  // 적용 가능한 카드 (브랜드 매치)
  const applicableResults = computed(() =>
    allResults.value.filter((r) => !r.isBrandMismatch)
  );

  // 브랜드 미적용 카드
  const mismatchResults = computed(() =>
    allResults.value.filter((r) => r.isBrandMismatch)
  );

  // 정렬된 결과
  const sortedResults = computed(() => {
    const sorted = [...applicableResults.value];
    switch (sortKey.value) {
      case "savings":
        sorted.sort((a, b) => b.monthlyNet - a.monthlyNet);
        break;
      case "annualFee":
        sorted.sort((a, b) => a.card.annualFee - b.card.annualFee);
        break;
      case "minSpend":
        sorted.sort(
          (a, b) =>
            getFuelCardMinimumSpend(a.card) - getFuelCardMinimumSpend(b.card)
        );
        break;
    }
    return sorted;
  });

  // TOP 3
  const topCards = computed(() => sortedResults.value.slice(0, 3));

  // 1위 카드
  const bestCard = computed<FuelCardCalcResult | null>(
    () => sortedResults.value[0] ?? null
  );

  // URL 쿼리 동기화 (디바운스 300ms)
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  watch(
    [fuelType, monthlySpend, preferredBrand],
    () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const query: Record<string, string> = {};
        if (fuelType.value !== "gasoline") query.fuel = fuelType.value;
        if (monthlySpend.value !== 200000) query.monthly = String(monthlySpend.value);
        if (preferredBrand.value !== "all") query.brand = preferredBrand.value;

        router.replace({ query });
      }, 300);
    },
    { flush: "post" }
  );

  // URL 변경 시 상태 업데이트 (뒤로가기 등)
  watch(
    () => route.query,
    (q) => {
      fuelType.value = parseQueryFuelType(q.fuel);
      monthlySpend.value = (parseQueryInt(q.monthly) ?? 200000);
      preferredBrand.value = typeof q.brand === "string" ? q.brand : "all";
    }
  );

  return {
    // 입력 상태
    fuelType,
    monthlySpend,
    preferredBrand,
    sortKey,
    // 계산 결과
    allResults,
    applicableResults,
    mismatchResults,
    sortedResults,
    topCards,
    bestCard,
  };
}
