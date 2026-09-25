<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router";
import { ShCalculatorSplit, ShPairRow } from "@shakilabs/ui";
import AdSlot from "@/components/common/AdSlot.vue";
import SEOHead from "@/components/common/SEOHead.vue";
import CalculatorPageHeader from "@/components/calculator/CalculatorPageHeader.vue";
import CompareSourceFooter from "@/components/common/CompareSourceFooter.vue";

import ShareModal from "@/components/share/ShareModal.vue";
import SummaryBanner from "@/components/common/SummaryBanner.vue";
import MinSpendCompareTable from "@/components/min-spend/MinSpendCompareTable.vue";
import MinSpendDetailSection from "@/components/min-spend/MinSpendDetailSection.vue";
import MinSpendInput from "@/components/min-spend/MinSpendInput.vue";
import MinSpendNetBenefitChart from "@/components/min-spend/MinSpendNetBenefitChart.vue";
import MinSpendTopCards from "@/components/min-spend/MinSpendTopCards.vue";
import QualificationChart from "@/components/min-spend/QualificationChart.vue";
import { SPENDING_CATEGORIES } from "@/data/spendingCategories";
import { useMinSpendCalc } from "@/composables/useMinSpendCalc";
import { useCardFuelPrices } from "@/composables/usePublicData";
import { useResultShare } from "@/composables/useResultShare";
import { buildAbsoluteUrl, buildQuery } from "@/lib/routeState";
import { MIN_SPEND_SOURCES, SOURCE_VERIFIED_AT } from "@/data/sourceReferences";

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

useCardFuelPrices();

const seoTitle = "전월 실적 채우기 최소 비용 계산기 | 카드 실적 vs 할인 효율 분석 2026";
const seoDescription =
  "내 월 지출 패턴을 입력하면 카드별 전월 실적 충족 여부와 순 혜택을 자동 계산합니다.";

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
  <SEOHead :title="seoTitle" :description="seoDescription" />

  <div class="sh-container sh-container--tool space-y-5 py-5">
    <CalculatorPageHeader title="전월 실적 계산기" />

    <ShCalculatorSplit>
      <template #input>
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
      </template>

      <template #result>
        <SummaryBanner v-if="bestCard" :message="summaryMessage" />
        <!-- 추천 1위가 이 계산기의 핵심 결과다 — 요약 배너만 두면 오른쪽 칸이 비고, 목록 전체(약 1,050px)를
             두면 왼쪽이 빈다(1440px 실측). 제목 + 1위만 결과 칸에, 2~3위는 1×2 아래 전폭(2열)으로. -->
        <MinSpendTopCards v-if="topCards.length > 0" :cards="topCards" part="top" />
      </template>
    </ShCalculatorSplit>

    <!-- 계산기 아래 데이터 블록 2열(ShPairRow, 사용자 결정 2026-09-25). 순서는 유지하고 짧은 블록은 한 칸에 쌓는다.
         광고는 묶음 사이로 옮겼다 — 블록 사이에 있으면 짝을 지을 수 없고, 두 광고가 붙지 않게 본문을 사이에 둔다. -->
    <ShPairRow>
      <template #start>
        <MinSpendTopCards v-if="topCards.length > 1" :cards="topCards" part="rest" stack />
      </template>
      <template #end>
        <QualificationChart v-if="sortedResults.length > 0" :results="sortedResults" />
      </template>
    </ShPairRow>

    <AdSlot slot="min-spend-top" label="실적 분석 상단" />

    <ShPairRow>
      <template #start>
        <MinSpendNetBenefitChart v-if="sortedResults.length > 0" :results="sortedResults" />
      </template>
      <template #end>
        <MinSpendCompareTable
          v-if="sortedResults.length > 0"
          :results="sortedResults"
          :mismatch-results="mismatchResults"
          :sort-key="sortKey"
          @update:sort-key="sortKey = $event"
        />
      </template>
    </ShPairRow>

    <AdSlot slot="min-spend-middle" label="실적 비교표 하단" />

    <!-- 카드별 실적 분석은 반폭에서 1,110px까지 늘어나 rounded-2xl+링크 그리드(445px)와 짝지으면
         비율 0.40으로 pair-audit 불균형 기준(0.5) 미달 — 짝을 풀고 원래 순서(전폭)로 둔다. -->
    <MinSpendDetailSection v-if="sortedResults.length > 0" :results="sortedResults" />

    <AdSlot slot="min-spend-bottom" label="실적 FAQ 하단" />

    <CompareSourceFooter
      :sources="MIN_SPEND_SOURCES"
      :updated-at="SOURCE_VERIFIED_AT"
      note="※ 실적 인정 제외 업종과 할인 적용 조건은 카드사별로 다르므로 실제 카드사 기준을 반드시 함께 확인하세요."
    />

    <div class="space-y-3">
      <div class="section-heading-block">
        <h2 class="section-title">다른 계산기도 함께 보기</h2>
      </div>
      <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <RouterLink
          to="/fuel-card"
          class="retro-panel-muted px-3 py-2.5 text-caption font-medium text-foreground transition-colors hover:bg-background"
        >
          주유 할인카드 비교
        </RouterLink>
        <RouterLink
          :to="{ path: '/fuel-card', query: { fuel: fuelType, monthly: String(fuelSpend) } }"
          class="retro-panel-muted px-3 py-2.5 text-caption font-medium text-foreground transition-colors hover:bg-background"
        >
          현재 주유비로 카드 비교
        </RouterLink>
        <RouterLink
          to="/overseas-payment"
          class="retro-panel-muted px-3 py-2.5 text-caption font-medium text-foreground transition-colors hover:bg-background"
        >
          해외결제 카드 비교
        </RouterLink>
        <RouterLink
          to="/annual-fee"
          class="retro-panel-muted px-3 py-2.5 text-caption font-medium text-foreground transition-colors hover:bg-background"
        >
          연회비 회수 계산기
        </RouterLink>
        <RouterLink
          to="/duty-free"
          class="retro-panel-muted px-3 py-2.5 text-caption font-medium text-foreground transition-colors hover:bg-background"
        >
          관세 계산기
        </RouterLink>
        <RouterLink
          to="/mileage"
          class="retro-panel-muted px-3 py-2.5 text-caption font-medium text-foreground transition-colors hover:bg-background"
        >
          마일리지 가치 계산기
        </RouterLink>
      </div>
    </div>

    <ShareModal
      :show="showShareModal"
      :kakao-busy="kakaoBusy"
      :summary-text="shareSummary"
      @close="closeShare"
      @share-kakao="shareKakao"
      @copy-link="copyLink"
    />
  </div>
</template>
