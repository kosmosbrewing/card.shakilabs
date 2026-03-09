<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router";
import SEOHead from "@/components/common/SEOHead.vue";
import FreshBadge from "@/components/common/FreshBadge.vue";
import AdSlot from "@/components/common/AdSlot.vue";
import FeeCompareTable from "@/components/fuel-card/FeeCompareTable.vue";
import SavingsBarChart from "@/components/fuel-card/SavingsBarChart.vue";
import FuelCardFAQ from "@/components/fuel-card/FuelCardFAQ.vue";
import { FUEL_CARDS } from "@/data/fuelCards";
import { FUEL_PRICES, FUEL_TYPE_LABELS, type FuelType } from "@/data/fuelPrices";
import { calculateAllCards } from "@/utils/calculator";
import { ref } from "vue";
import type { SortKey } from "@/composables/useFuelCardCalc";

const props = defineProps<{
  fuelType: string;
}>();

const ft = computed<FuelType>(() =>
  props.fuelType === "diesel" ? "diesel" : "gasoline"
);

const sortKey = ref<SortKey>("savings");
const monthlySpend = 200000;

const results = computed(() => {
  const all = calculateAllCards(FUEL_CARDS, {
    fuelType: ft.value,
    monthlySpend,
    preferredBrand: "all",
  });
  return all.sort((a, b) => b.monthlyNet - a.monthlyNet);
});

const seoTitle = computed(
  () => `2026 ${FUEL_TYPE_LABELS[ft.value]} 주유 할인카드 비교 | 리터당 최대 100원 할인`
);
const seoDescription = computed(
  () => `${FUEL_TYPE_LABELS[ft.value]} 기준 주유 할인카드를 비교합니다. 카드별 절약액, 체감 유가, 전월 실적 조건 한눈에.`
);
</script>

<template>
  <SEOHead :title="seoTitle" :description="seoDescription" />

  <div class="container space-y-5 py-5">
    <div class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h1 class="retro-title">{{ FUEL_TYPE_LABELS[ft] }} 주유 할인카드 비교</h1>
        <FreshBadge :message="`${FUEL_PRICES.lastUpdated} 기준`" />
      </div>
      <div class="retro-panel-content">
        <p class="text-caption text-muted-foreground">
          {{ FUEL_TYPE_LABELS[ft] }} {{ FUEL_PRICES[ft].toLocaleString() }}원/L 기준, 월 {{ monthlySpend.toLocaleString() }}원 주유 시 카드별 절약액
        </p>
      </div>
    </div>

    <SavingsBarChart :results="results" />

    <FeeCompareTable
      :results="results"
      :mismatch-results="[]"
      :sort-key="sortKey"
      @update:sort-key="sortKey = $event"
    />

    <AdSlot slot="fuel-type-detail" label="유종별 비교" />

    <FuelCardFAQ />

    <div class="retro-panel-muted p-4">
      <p class="text-caption font-semibold text-foreground mb-2">내 금액으로 직접 계산하기</p>
      <RouterLink
        :to="{ path: '/fuel-card', query: { fuel: ft } }"
        class="retro-link text-caption"
      >
        주유 할인카드 비교 계산기로 이동 →
      </RouterLink>
    </div>
  </div>
</template>
