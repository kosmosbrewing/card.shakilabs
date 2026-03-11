<script setup lang="ts">
import { computed, ref } from "vue";
import { RouterLink } from "vue-router";
import SEOHead from "@/components/common/SEOHead.vue";
import FreshBadge from "@/components/common/FreshBadge.vue";
import SummaryBanner from "@/components/common/SummaryBanner.vue";
import AdSlot from "@/components/common/AdSlot.vue";
import CompareSourceFooter from "@/components/common/CompareSourceFooter.vue";
import DCCCompareSection from "@/components/overseas/DCCCompareSection.vue";
import OverseasBarChart from "@/components/overseas/OverseasBarChart.vue";
import OverseasCompareTable from "@/components/overseas/OverseasCompareTable.vue";
import OverseasFAQ from "@/components/overseas/OverseasFAQ.vue";
import OverseasTopCardList from "@/components/overseas/OverseasTopCardList.vue";
import type { OverseasSortKey } from "@/composables/useOverseasCalc";
import {
  DCC_MARKUP,
  EXCHANGE_RATES,
  getCurrencyQueryValue,
  getExchangeRate,
  parseCurrencyQueryValue,
} from "@/data/exchangeRates";
import { OVERSEAS_CARDS } from "@/data/overseasCards";
import { OVERSEAS_COMPARE_SOURCES, SOURCE_VERIFIED_AT } from "@/data/sourceReferences";
import { calculateAllOverseasCards } from "@/utils/overseasCalculator";

const props = defineProps<{
  currency: string;
}>();

const selectedCurrency = computed(
  () => parseCurrencyQueryValue(props.currency) ?? "USD"
);
const rateEntry = computed(() => getExchangeRate(selectedCurrency.value));
const sortKey = ref<OverseasSortKey>("totalCost");
const foreignAmount = 100;

const sortedResults = computed(() => {
  const results = calculateAllOverseasCards(OVERSEAS_CARDS, {
    currency: selectedCurrency.value,
    foreignAmount,
    dccMarkupRate: DCC_MARKUP.defaultRate,
  });

  const sorted = [...results];
  switch (sortKey.value) {
    case "feeRate":
      sorted.sort((a, b) => a.cardFeeRate - b.cardFeeRate || a.localCurrencyNet - b.localCurrencyNet);
      break;
    case "benefit":
      sorted.sort((a, b) => b.benefitAmount - a.benefitAmount || a.localCurrencyNet - b.localCurrencyNet);
      break;
    case "totalCost":
    default:
      sorted.sort((a, b) => a.localCurrencyNet - b.localCurrencyNet);
      break;
  }
  return sorted;
});

const topCards = computed(() => sortedResults.value.slice(0, 3));
const bestCard = computed(() => sortedResults.value[0] ?? null);

const seoTitle = computed(
  () => `${rateEntry.value.label}(${selectedCurrency.value}) 해외결제 카드 비교 | DCC 수수료 계산기 2026`
);
const seoDescription = computed(
  () => `${rateEntry.value.label} 결제 시 카드별 해외수수료, 혜택, DCC 추가 비용을 한눈에 비교합니다.`
);
const summaryMessage = computed(() => {
  if (!bestCard.value) return "";
  return `${selectedCurrency.value} ${foreignAmount.toLocaleString()} 결제 기준 최적 카드는 ${bestCard.value.card.issuer} ${bestCard.value.card.name}입니다. DCC를 피하면 ${bestCard.value.dccDifference.toLocaleString()}원 절약할 수 있어요.`;
});
</script>

<template>
  <SEOHead :title="seoTitle" :description="seoDescription" />

  <div class="container space-y-5 py-5">
    <div class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h1 class="retro-title">{{ rateEntry.label }} 해외결제 카드 비교</h1>
        <FreshBadge :message="`${EXCHANGE_RATES.lastUpdated} 기준`" />
      </div>
      <div class="retro-panel-content">
        <p class="text-caption text-muted-foreground">
          {{ rateEntry.symbol }}{{ foreignAmount.toLocaleString() }} 결제, {{ rateEntry.unit }}{{ selectedCurrency }} = {{ rateEntry.rate.toLocaleString() }}원, DCC {{ (DCC_MARKUP.defaultRate * 100).toFixed(0) }}% 가정
        </p>
      </div>
    </div>

    <OverseasTopCardList v-if="topCards.length > 0" :cards="topCards" />

    <SummaryBanner v-if="bestCard" :message="summaryMessage" />

    <DCCCompareSection
      v-if="bestCard"
      :result="bestCard"
      :currency-code="selectedCurrency"
      :currency-symbol="rateEntry.symbol"
    />

    <OverseasBarChart :results="sortedResults" />

    <OverseasCompareTable
      :results="sortedResults"
      :sort-key="sortKey"
      @update:sort-key="sortKey = $event"
    />

    <AdSlot slot="overseas-currency-detail" label="통화별 비교" />

    <OverseasFAQ />

    <CompareSourceFooter
      :sources="OVERSEAS_COMPARE_SOURCES"
      :updated-at="SOURCE_VERIFIED_AT"
      note="※ 통화별 비교도 실제 환율 반영 시점, 해외결제 설정, 브랜드 수수료 정책에 따라 달라질 수 있습니다."
    />

    <div class="retro-panel-muted p-4">
      <p class="mb-2 text-caption font-semibold text-foreground">내 금액으로 직접 계산하기</p>
      <RouterLink
        :to="{ path: '/overseas-payment', query: { currency: getCurrencyQueryValue(selectedCurrency) } }"
        class="retro-link text-caption"
      >
        해외결제 비교 계산기로 이동 →
      </RouterLink>
    </div>
  </div>
</template>
