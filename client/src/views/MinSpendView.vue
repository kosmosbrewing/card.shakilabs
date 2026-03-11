<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router";
import AdSlot from "@/components/common/AdSlot.vue";
import SEOHead from "@/components/common/SEOHead.vue";

import ShareModal from "@/components/share/ShareModal.vue";
import SummaryBanner from "@/components/common/SummaryBanner.vue";
import MinSpendCompareTable from "@/components/min-spend/MinSpendCompareTable.vue";
import MinSpendDetailSection from "@/components/min-spend/MinSpendDetailSection.vue";
import MinSpendFAQ from "@/components/min-spend/MinSpendFAQ.vue";
import MinSpendInput from "@/components/min-spend/MinSpendInput.vue";
import MinSpendNetBenefitChart from "@/components/min-spend/MinSpendNetBenefitChart.vue";
import MinSpendTopCards from "@/components/min-spend/MinSpendTopCards.vue";
import QualificationChart from "@/components/min-spend/QualificationChart.vue";
import { SPENDING_CATEGORIES } from "@/data/spendingCategories";
import { useMinSpendCalc } from "@/composables/useMinSpendCalc";
import { useResultShare } from "@/composables/useResultShare";
import { buildAbsoluteUrl, buildQuery } from "@/lib/routeState";

const {
  fuelType,
  fuelSpend,
  preferredBrand,
  spending,
  sortKey,
  totalSpending,
  sortedResults,
  topCards,
  bestCard,
  mismatchResults,
  updateSpending,
} = useMinSpendCalc();

const seoTitle = "전월 실적 채우기 최소 비용 계산기 | 카드 실적 vs 할인 효율 분석 2026";
const seoDescription =
  "내 월 지출 패턴을 입력하면 카드별 전월 실적 충족 여부와 순 혜택을 자동 계산합니다.";

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "실적을 채우기 위해 추가 지출할 가치가 있나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "추가 지출까지 차감한 순혜택이 양수인지 먼저 봐야 합니다.",
      },
    },
    {
      "@type": "Question",
      name: "생활비가 실적에 모두 포함되나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "대부분 포함되지만 카드사별 제외 항목이 있어 최종 확인이 필요합니다.",
      },
    },
  ],
};

const summaryMessage = computed(() => {
  if (!bestCard.value) return "";
  if (bestCard.value.isQualified) {
    return `${bestCard.value.card.issuer} ${bestCard.value.card.name}가 가장 효율적입니다. 현재 지출 패턴이면 실적을 이미 충족했고 월 순혜택은 ${bestCard.value.monthlyNetBenefit.toLocaleString()}원입니다.`;
  }

  return `${bestCard.value.card.issuer} ${bestCard.value.card.name}가 그나마 가장 낫습니다. 실적까지 ${bestCard.value.gap.toLocaleString()}원 부족하고, 추가 지출까지 포함한 순혜택은 ${bestCard.value.netBenefitIncludingGap.toLocaleString()}원입니다.`;
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
  page: "min-spend",
  summaryText: () => summaryMessage.value,
  shareUrl: () => {
    const spendingQuery = Object.fromEntries(
      SPENDING_CATEGORIES.map((category) => [
        category.id,
        spending.value[category.id] !== category.defaultAmount
          ? spending.value[category.id]
          : undefined,
      ])
    );

    return buildAbsoluteUrl("/min-spend", buildQuery({
      fuel: fuelType.value !== "gasoline" ? fuelType.value : undefined,
      fuelSpend: fuelSpend.value !== 200000 ? fuelSpend.value : undefined,
      brand: preferredBrand.value !== "all" ? preferredBrand.value : undefined,
      ...spendingQuery,
    }));
  },
  shareTitle: () => {
    if (!bestCard.value) return "전월 실적 계산기";
    return `${bestCard.value.card.issuer} ${bestCard.value.card.name} 실적 효율 확인`;
  },
  shareDescription: () => "전월 실적 충족 여부와 추가 지출까지 반영한 순혜택을 비교합니다.",
  buttonTitle: "실적 계산 보기",
});
</script>

<template>
  <SEOHead :title="seoTitle" :description="seoDescription" :json-ld="faqJsonLd" />

  <div class="container space-y-5 py-5">
    <MinSpendInput
      :fuel-type="fuelType"
      :fuel-spend="fuelSpend"
      :spending="spending"
      :preferred-brand="preferredBrand"
      :total-spending="totalSpending"
      @update:fuel-type="fuelType = $event"
      @update:fuel-spend="fuelSpend = $event"
      @update:preferred-brand="preferredBrand = $event"
      @update:spending="updateSpending($event.categoryId, $event.amount)"
      @share-request="openShare"
    />

    <MinSpendTopCards v-if="topCards.length > 0" :cards="topCards" />

    <SummaryBanner v-if="bestCard" :message="summaryMessage" />

    <AdSlot slot="min-spend-top" label="실적 분석 상단" />

    <QualificationChart v-if="sortedResults.length > 0" :results="sortedResults" />

    <MinSpendNetBenefitChart v-if="sortedResults.length > 0" :results="sortedResults" />

    <MinSpendCompareTable
      v-if="sortedResults.length > 0"
      :results="sortedResults"
      :mismatch-results="mismatchResults"
      :sort-key="sortKey"
      @update:sort-key="sortKey = $event"
    />

    <AdSlot slot="min-spend-middle" label="실적 비교표 하단" />

    <MinSpendDetailSection v-if="sortedResults.length > 0" :results="sortedResults" />

    <MinSpendFAQ />

    <AdSlot slot="min-spend-bottom" label="실적 FAQ 하단" />

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
          :to="{ path: '/fuel-card', query: { fuel: fuelType, monthly: String(fuelSpend) } }"
          class="retro-panel-muted px-3 py-2.5 text-caption font-medium text-foreground transition-colors hover:text-primary"
        >
          현재 주유비로 카드 비교
        </RouterLink>
        <RouterLink
          to="/overseas-payment"
          class="retro-panel-muted px-3 py-2.5 text-caption font-medium text-foreground transition-colors hover:text-primary"
        >
          해외결제 카드 비교
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
      </div>
    </div>
  </div>
</template>
