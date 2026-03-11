<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router";
import SEOHead from "@/components/common/SEOHead.vue";
import CompareSourceFooter from "@/components/common/CompareSourceFooter.vue";
import ShareModal from "@/components/share/ShareModal.vue";
import SummaryBanner from "@/components/common/SummaryBanner.vue";
import AdSlot from "@/components/common/AdSlot.vue";
import DCCCompareSection from "@/components/overseas/DCCCompareSection.vue";
import OverseasBarChart from "@/components/overseas/OverseasBarChart.vue";
import OverseasCompareTable from "@/components/overseas/OverseasCompareTable.vue";
import OverseasDetailSection from "@/components/overseas/OverseasDetailSection.vue";
import OverseasFAQ from "@/components/overseas/OverseasFAQ.vue";
import OverseasInput from "@/components/overseas/OverseasInput.vue";
import OverseasTopCardList from "@/components/overseas/OverseasTopCardList.vue";
import { DCC_MARKUP, getCurrencyQueryValue } from "@/data/exchangeRates";
import { useOverseasCalc } from "@/composables/useOverseasCalc";
import { SEO_CURRENCIES } from "@/data/exchangeRates";
import { useResultShare } from "@/composables/useResultShare";
import { buildAbsoluteUrl, buildQuery } from "@/lib/routeState";
import { OVERSEAS_COMPARE_SOURCES, SOURCE_VERIFIED_AT } from "@/data/sourceReferences";

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

const {
  showShareModal,
  kakaoBusy,
  shareSummary,
  openShare,
  closeShare,
  shareKakao,
  copyLink,
} = useResultShare({
  page: "overseas-payment",
  summaryText: () => summaryMessage.value,
  shareUrl: () => buildAbsoluteUrl("/overseas-payment", buildQuery({
    currency: currency.value !== "USD" ? getCurrencyQueryValue(currency.value) : undefined,
    amount: foreignAmount.value !== 100 ? foreignAmount.value : undefined,
    dcc:
      Math.abs(dccMarkupRate.value - DCC_MARKUP.defaultRate) > 0.0001
        ? Math.round(dccMarkupRate.value * 1000) / 10
        : undefined,
  })),
  shareTitle: () => {
    if (!bestCard.value) return "해외결제 카드 비교 계산기";
    return `${bestCard.value.card.issuer} ${bestCard.value.card.name} 해외결제 비교`;
  },
  shareDescription: () => "현지통화 결제와 DCC 원화결제 차이를 카드별로 비교합니다.",
  buttonTitle: "해외결제 비교 보기",
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
      @share-request="openShare"
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

    <CompareSourceFooter
      :sources="OVERSEAS_COMPARE_SOURCES"
      :updated-at="SOURCE_VERIFIED_AT"
      note="※ 해외수수료 면제·적립 조건과 DCC 안내는 카드사 및 결제 설정에 따라 달라질 수 있으니 실제 결제 전 공식 안내를 확인하세요."
    />

    <ShareModal
      :show="showShareModal"
      :kakao-busy="kakaoBusy"
      :summary-text="shareSummary"
      @close="closeShare"
      @share-kakao="shareKakao"
      @copy-link="copyLink"
    />

    <div class="space-y-3">
      <div class="section-heading-block">
        <h2 class="section-title">통화별 바로가기 / 다른 계산기</h2>
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
        <RouterLink
          to="/annual-fee"
          class="retro-panel-muted px-3 py-2.5 text-caption font-medium text-foreground transition-colors hover:text-primary"
        >
          연회비 회수 계산기
        </RouterLink>
        <RouterLink
          to="/duty-free"
          class="retro-panel-muted px-3 py-2.5 text-caption font-medium text-foreground transition-colors hover:text-primary"
        >
          관세 계산기
        </RouterLink>
        <RouterLink
          to="/mileage"
          class="retro-panel-muted px-3 py-2.5 text-caption font-medium text-foreground transition-colors hover:text-primary"
        >
          마일리지 가치 계산기
        </RouterLink>
        <RouterLink
          to="/fuel-card"
          class="retro-panel-muted px-3 py-2.5 text-caption font-medium text-foreground transition-colors hover:text-primary"
        >
          주유 할인카드 비교
        </RouterLink>
        <RouterLink
          to="/min-spend"
          class="retro-panel-muted px-3 py-2.5 text-caption font-medium text-foreground transition-colors hover:text-primary"
        >
          전월 실적 계산기
        </RouterLink>
      </div>
    </div>
  </div>
</template>
