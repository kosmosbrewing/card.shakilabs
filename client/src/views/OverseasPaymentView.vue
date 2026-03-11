<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router";
import SEOHead from "@/components/common/SEOHead.vue";
import SummaryBanner from "@/components/common/SummaryBanner.vue";
import AdSlot from "@/components/common/AdSlot.vue";
import DCCCompareSection from "@/components/overseas/DCCCompareSection.vue";
import OverseasBarChart from "@/components/overseas/OverseasBarChart.vue";
import OverseasCompareTable from "@/components/overseas/OverseasCompareTable.vue";
import OverseasDetailSection from "@/components/overseas/OverseasDetailSection.vue";
import OverseasFAQ from "@/components/overseas/OverseasFAQ.vue";
import OverseasInput from "@/components/overseas/OverseasInput.vue";
import OverseasTopCardList from "@/components/overseas/OverseasTopCardList.vue";
import { useOverseasCalc } from "@/composables/useOverseasCalc";
import { SEO_CURRENCIES, getCurrencyQueryValue } from "@/data/exchangeRates";

const {
  currency,
  foreignAmount,
  dccMarkupRate,
  sortKey,
  rateEntry,
  sortedResults,
  topCards,
  bestCard,
  avgDccExtra,
} = useOverseasCalc();

const seoTitle = "해외결제 카드 비교 + DCC 수수료 계산기 | Car Tools 2026";
const seoDescription =
  "해외에서 현지통화 결제와 DCC 원화결제를 비교하고, 카드별 해외수수료와 캐시백까지 한 번에 계산합니다.";

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "DCC는 왜 피하는 게 좋나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "대부분의 경우 현지통화 결제보다 높은 마크업이 붙기 때문입니다.",
      },
    },
    {
      "@type": "Question",
      name: "해외결제 카드 비교 시 무엇을 봐야 하나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "총 해외수수료, 적립/캐시백, 실적 조건, 체크/선불 여부를 함께 비교해야 합니다.",
      },
    },
  ],
};

const summaryMessage = computed(() => {
  if (!bestCard.value) return "";
  return `${bestCard.value.card.issuer} ${bestCard.value.card.name} 기준 ${rateEntry.value.symbol}${foreignAmount.value.toLocaleString()} 결제 시 현지통화가 DCC보다 ${bestCard.value.dccDifference.toLocaleString()}원 저렴해요. 평균 추가 비용은 ${avgDccExtra.value.toLocaleString()}원 수준입니다.`;
});

const currencyLinks = SEO_CURRENCIES.map((item) => {
  const entry = item === currency.value ? rateEntry.value : null;
  return {
    code: item,
    label: entry?.label ?? item,
    to: `/overseas-payment/${getCurrencyQueryValue(item)}`,
  };
});
</script>

<template>
  <SEOHead :title="seoTitle" :description="seoDescription" :json-ld="faqJsonLd" />

  <div class="container space-y-5 py-5">
    <OverseasInput
      :currency="currency"
      :foreign-amount="foreignAmount"
      :dcc-markup-rate="dccMarkupRate"
      @update:currency="currency = $event"
      @update:foreign-amount="foreignAmount = $event"
      @update:dcc-markup-rate="dccMarkupRate = $event"
    />

    <OverseasTopCardList v-if="topCards.length > 0" :cards="topCards" />

    <SummaryBanner v-if="bestCard" :message="summaryMessage" />

    <AdSlot slot="overseas-top" label="해외결제 결과 상단" />

    <DCCCompareSection
      v-if="bestCard"
      :result="bestCard"
      :currency-code="currency"
      :currency-symbol="rateEntry.symbol"
    />

    <OverseasBarChart v-if="sortedResults.length > 0" :results="sortedResults" />

    <OverseasCompareTable
      v-if="sortedResults.length > 0"
      :results="sortedResults"
      :sort-key="sortKey"
      @update:sort-key="sortKey = $event"
    />

    <AdSlot slot="overseas-middle" label="해외결제 비교표 하단" />

    <OverseasDetailSection v-if="sortedResults.length > 0" :results="sortedResults" />

    <OverseasFAQ />

    <AdSlot slot="overseas-bottom" label="해외결제 FAQ 하단" />

    <div class="space-y-3">
      <div class="section-heading-block">
        <h2 class="section-title">통화별 바로가기</h2>
      </div>
      <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <RouterLink
          v-for="link in currencyLinks"
          :key="link.code"
          :to="link.to"
          class="retro-panel-muted px-3 py-2.5 text-caption font-medium text-foreground transition-colors hover:text-primary"
        >
          {{ link.code }} 카드 비교
        </RouterLink>
      </div>
    </div>
  </div>
</template>
