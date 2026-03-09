<script setup lang="ts">
import { computed, ref } from "vue";
import { RouterLink } from "vue-router";
import SEOHead from "@/components/common/SEOHead.vue";
import FreshBadge from "@/components/common/FreshBadge.vue";
import SummaryBanner from "@/components/common/SummaryBanner.vue";
import AdSlot from "@/components/common/AdSlot.vue";
import TopCardList from "@/components/fuel-card/TopCardList.vue";
import FeeCompareTable from "@/components/fuel-card/FeeCompareTable.vue";
import FuelCardFAQ from "@/components/fuel-card/FuelCardFAQ.vue";
import { FUEL_CARDS } from "@/data/fuelCards";
import { FUEL_PRICES } from "@/data/fuelPrices";
import { calculateAllCards } from "@/utils/calculator";
import type { SortKey } from "@/composables/useFuelCardCalc";

const props = defineProps<{
  amount: number;
}>();

const sortKey = ref<SortKey>("savings");

const results = computed(() => {
  const all = calculateAllCards(FUEL_CARDS, {
    fuelType: "gasoline",
    monthlySpend: props.amount,
    preferredBrand: "all",
  });
  return all.sort((a, b) => b.monthlyNet - a.monthlyNet);
});

const topCards = computed(() => results.value.slice(0, 3));
const bestCard = computed(() => results.value[0] ?? null);

const amountMan = computed(() => (props.amount / 10000).toFixed(0));

const seoTitle = computed(
  () => `월 ${amountMan.value}만원 주유할 때 최적 카드 비교 | 2026년 유가 기준`
);
const seoDescription = computed(
  () => `월 ${amountMan.value}만원 주유 시 카드별 절약액을 비교합니다. 연 최대 ${bestCard.value ? bestCard.value.annualNet.toLocaleString() : ''}원 절약.`
);

const summaryMessage = computed(() => {
  if (!bestCard.value) return "";
  return `${bestCard.value.card.issuer} ${bestCard.value.card.name}가 가장 유리해요 — 월 ${props.amount.toLocaleString()}원 주유 시 연 ${bestCard.value.annualNet.toLocaleString()}원 절약 ⛽`;
});
</script>

<template>
  <SEOHead :title="seoTitle" :description="seoDescription" />

  <div class="container space-y-5 py-5">
    <div class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h1 class="retro-title">월 {{ amountMan }}만원 주유 시 최적 카드</h1>
        <FreshBadge :message="`${FUEL_PRICES.lastUpdated} 기준`" />
      </div>
      <div class="retro-panel-content">
        <p class="text-caption text-muted-foreground">
          휘발유 {{ FUEL_PRICES.gasoline.toLocaleString() }}원/L 기준
        </p>
      </div>
    </div>

    <TopCardList v-if="topCards.length > 0" :cards="topCards" />

    <SummaryBanner v-if="bestCard" :message="summaryMessage" />

    <AdSlot slot="monthly-top" label="월금액 상단" />

    <FeeCompareTable
      :results="results"
      :mismatch-results="[]"
      :sort-key="sortKey"
      @update:sort-key="sortKey = $event"
    />

    <FuelCardFAQ />

    <AdSlot slot="monthly-bottom" label="월금액 하단" />

    <div class="retro-panel-muted p-4">
      <p class="text-caption font-semibold text-foreground mb-2">내 금액으로 직접 계산하기</p>
      <RouterLink
        :to="{ path: '/fuel-card', query: { monthly: String(amount) } }"
        class="retro-link text-caption"
      >
        주유 할인카드 비교 계산기로 이동 →
      </RouterLink>
    </div>
  </div>
</template>
