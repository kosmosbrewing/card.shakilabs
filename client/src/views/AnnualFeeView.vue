<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router";
import AdSlot from "@/components/common/AdSlot.vue";
import SEOHead from "@/components/common/SEOHead.vue";
import CompareSourceFooter from "@/components/common/CompareSourceFooter.vue";

import ShareModal from "@/components/share/ShareModal.vue";
import SummaryBanner from "@/components/common/SummaryBanner.vue";
import AnnualFeeCompareTable from "@/components/annual-fee/AnnualFeeCompareTable.vue";
import AnnualFeeDetailSection from "@/components/annual-fee/AnnualFeeDetailSection.vue";
import AnnualFeeFAQ from "@/components/annual-fee/AnnualFeeFAQ.vue";
import AnnualFeeInput from "@/components/annual-fee/AnnualFeeInput.vue";
import AnnualFeeTopCards from "@/components/annual-fee/AnnualFeeTopCards.vue";
import BreakEvenChart from "@/components/annual-fee/BreakEvenChart.vue";
import { BENEFIT_CATEGORIES, createDefaultSpendingPattern } from "@/data/annualFeeCards";
import { useAnnualFeeCalc } from "@/composables/useAnnualFeeCalc";
import { useResultShare } from "@/composables/useResultShare";
import { buildAbsoluteUrl, buildQuery } from "@/lib/routeState";
import { formatBreakEven, formatRoiRatio } from "@/utils/annualFeeCalculator";
import { ANNUAL_FEE_SOURCES, SOURCE_VERIFIED_AT } from "@/data/sourceReferences";

const {
  spending,
  sortKey,
  sortedResults,
  topCards,
  bestCard,
  totalMonthlySpend,
  updateSpending,
} = useAnnualFeeCalc();

const seoTitle = "연회비 회수 계산기 | 카드 혜택 vs 연회비 손익분석 2026";
const seoDescription =
  "월 소비 패턴을 입력하면 카드별 연회비 회수 기간, 연 순혜택, ROI를 한 번에 비교합니다.";

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "연회비 회수 기간이란 무엇인가요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "월 혜택이 누적되어 연회비를 넘어서는 데 걸리는 월 수를 뜻합니다.",
      },
    },
    {
      "@type": "Question",
      name: "전월 실적을 못 채우면 어떻게 되나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "해당 월 혜택은 0원으로 계산되므로 실적 조건이 낮은 카드가 실제로 더 유리할 수 있습니다.",
      },
    },
  ],
};

const summaryMessage = computed(() => {
  if (!bestCard.value) return "";
  if (!bestCard.value.isMinSpendMet) {
    return `${bestCard.value.card.issuer} ${bestCard.value.card.name}가 현재 기준 최선이지만 실적까지 ${bestCard.value.minSpendGap.toLocaleString()}원 부족합니다. 실적 충족 시 회수 기간은 ${formatBreakEven(bestCard.value.breakEvenMonths)}이고 ROI는 ${formatRoiRatio(bestCard.value.roiRatio)}입니다.`;
  }

  return `${bestCard.value.card.issuer} ${bestCard.value.card.name}가 가장 유리합니다. 현재 소비 패턴이면 ${formatBreakEven(bestCard.value.breakEvenMonths)}에 연회비를 회수하고, 연 순혜택은 ${bestCard.value.annualNetBenefit.toLocaleString()}원입니다.`;
});

const defaultSpending = createDefaultSpendingPattern();

const {
  showShareModal,
  kakaoBusy,
  shareSummary,
  openShare,
  closeShare,
  shareKakao,
  copyLink,
} = useResultShare({
  page: "annual-fee",
  summaryText: () => summaryMessage.value,
  shareUrl: () => {
    const spendingQuery = Object.fromEntries(
      BENEFIT_CATEGORIES.map((category) => [
        category.id,
        spending.value[category.id] !== defaultSpending[category.id]
          ? spending.value[category.id]
          : undefined,
      ])
    );

    return buildAbsoluteUrl("/annual-fee", buildQuery({
      ...spendingQuery,
      sort: sortKey.value !== "netBenefit" ? sortKey.value : undefined,
    }));
  },
  shareTitle: () => {
    if (!bestCard.value) return "연회비 회수 계산기";
    return `${bestCard.value.card.issuer} ${bestCard.value.card.name} 연회비 회수 분석`;
  },
  shareDescription: () => "월 소비 패턴 기준 카드별 연회비 회수 기간과 순혜택을 비교합니다.",
  buttonTitle: "연회비 계산 보기",
});
</script>

<template>
  <SEOHead :title="seoTitle" :description="seoDescription" :json-ld="faqJsonLd" />

  <div class="container space-y-5 py-5">
    <AnnualFeeInput
      :spending="spending"
      :total-monthly-spend="totalMonthlySpend"
      @update:spending="updateSpending($event.categoryId, $event.amount)"
      @share-request="openShare"
    />

    <AnnualFeeTopCards v-if="topCards.length > 0" :cards="topCards" />

    <SummaryBanner v-if="bestCard" :message="summaryMessage" />

    <AdSlot slot="annual-fee-top" label="연회비 계산 상단" />

    <BreakEvenChart v-if="sortedResults.length > 0" :results="sortedResults" />

    <AnnualFeeCompareTable
      v-if="sortedResults.length > 0"
      :results="sortedResults"
      :sort-key="sortKey"
      @update:sort-key="sortKey = $event"
    />

    <AdSlot slot="annual-fee-middle" label="연회비 비교표 하단" />

    <AnnualFeeDetailSection v-if="sortedResults.length > 0" :results="sortedResults" />

    <AnnualFeeFAQ />

    <AdSlot slot="annual-fee-bottom" label="연회비 FAQ 하단" />

    <CompareSourceFooter
      :sources="ANNUAL_FEE_SOURCES"
      :updated-at="SOURCE_VERIFIED_AT"
      note="※ 연회비와 실적 구간, 업종별 할인 한도는 자주 바뀌므로 발급 전 각 카드사 공식 안내를 다시 확인하세요."
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
        <h2 class="section-title">다른 계산기도 함께 보기</h2>
      </div>
      <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <RouterLink
          to="/fuel-card"
          class="retro-panel-muted px-3 py-2.5 text-caption font-medium text-foreground transition-colors hover:text-primary"
        >
          주유 할인카드 비교
        </RouterLink>
        <RouterLink
          to="/overseas-payment"
          class="retro-panel-muted px-3 py-2.5 text-caption font-medium text-foreground transition-colors hover:text-primary"
        >
          해외결제 카드 비교
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
