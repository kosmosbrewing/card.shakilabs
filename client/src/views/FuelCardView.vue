<script setup lang="ts">
import { computed } from "vue";
import SEOHead from "@/components/common/SEOHead.vue";
import SummaryBanner from "@/components/common/SummaryBanner.vue";
import AdSlot from "@/components/common/AdSlot.vue";
import CompareSourceFooter from "@/components/common/CompareSourceFooter.vue";
import FuelCardInput from "@/components/fuel-card/FuelCardInput.vue";
import TopCardList from "@/components/fuel-card/TopCardList.vue";
import FeeCompareTable from "@/components/fuel-card/FeeCompareTable.vue";
import CardDetailSection from "@/components/fuel-card/CardDetailSection.vue";
import SavingsBarChart from "@/components/fuel-card/SavingsBarChart.vue";
import FuelCardFAQ from "@/components/fuel-card/FuelCardFAQ.vue";
import ShareModal from "@/components/share/ShareModal.vue";
import { useFuelCardCalc } from "@/composables/useFuelCardCalc";
import { useShare } from "@/composables/useShare";
import { FUEL_TYPE_LABELS } from "@/data/fuelPrices";
import { RouterLink } from "vue-router";
import { ISSUER_DISPLAY_NAME } from "@/data/fuelCards";
import { FUEL_COMPARE_SOURCES, SOURCE_VERIFIED_AT } from "@/data/sourceReferences";

const {
  fuelType,
  monthlySpend,
  preferredBrand,
  sortKey,
  sortedResults,
  topCards,
  bestCard,
  mismatchResults,
} = useFuelCardCalc();

const {
  showShareModal,
  kakaoBusy,
  shareSummary,
  openShare,
  closeShare,
  shareKakao,
  copyLink,
} = useShare({
  fuelType,
  monthlySpend,
  bestCard,
});

const seoTitle = "주유 할인카드 비교 계산기 | 내 주유량에 맞는 최적 카드 찾기 2026";
const seoDescription =
  "월 주유 금액만 입력하면 카드별 절약액을 즉시 비교합니다. 현대카드, 신한카드, KB국민, 삼성카드 주유 할인 한눈에.";

// FAQ JSON-LD
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "주유 할인카드는 어떤 기준으로 선택해야 하나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "월 주유 금액, 선호 주유소 브랜드, 전월 실적 충족 가능 여부를 고려하세요.",
      },
    },
    {
      "@type": "Question",
      name: "체감 유가란 무엇인가요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "카드 할인을 적용한 후 실제로 내가 체감하는 리터당 가격입니다.",
      },
    },
  ],
};

// SummaryBanner 메시지
const summaryMessage = computed(() => {
  if (!bestCard.value) return "";
  const card = bestCard.value;
  const monthly = monthlySpend.value.toLocaleString();
  const annual = card.annualNet.toLocaleString();
  return `${card.card.issuer} ${card.card.name}가 가장 유리해요 — 월 ${monthly}원 주유 시 연 ${annual}원 절약 ⛽`;
});

// 내부 링크 데이터
const issuerLinks = Object.entries(ISSUER_DISPLAY_NAME).map(([slug, name]) => ({
  slug,
  name,
  to: `/fuel-card/${slug}`,
}));

const monthlyLinks = [
  { amount: 200000, label: "월 20만원 주유" },
  { amount: 300000, label: "월 30만원 주유" },
  { amount: 500000, label: "월 50만원 주유" },
];
</script>

<template>
  <SEOHead :title="seoTitle" :description="seoDescription" :json-ld="faqJsonLd" />

  <div class="container space-y-5 py-5">
    <!-- 입력 -->
    <FuelCardInput
      :fuel-type="fuelType"
      :monthly-spend="monthlySpend"
      :preferred-brand="preferredBrand"
      @update:fuel-type="fuelType = $event"
      @update:monthly-spend="monthlySpend = $event"
      @update:preferred-brand="preferredBrand = $event"
      @share-request="openShare"
    />

    <!-- TOP 3 카드 결과 -->
    <TopCardList v-if="topCards.length > 0" :cards="topCards" />

    <!-- SummaryBanner -->
    <SummaryBanner v-if="bestCard" :message="summaryMessage" />

    <!-- 광고 상단 -->
    <AdSlot slot="fuel-card-top" label="비교 결과 하단" />

    <!-- 연간 절약액 차트 -->
    <SavingsBarChart v-if="sortedResults.length > 0" :results="sortedResults" />

    <!-- 전체 카드 비교표 -->
    <FeeCompareTable
      v-if="sortedResults.length > 0"
      :results="sortedResults"
      :mismatch-results="mismatchResults"
      :sort-key="sortKey"
      @update:sort-key="sortKey = $event"
    />

    <!-- 광고 중간 -->
    <AdSlot slot="fuel-card-middle" label="비교표 하단" />

    <!-- 카드별 상세 조건 -->
    <CardDetailSection v-if="sortedResults.length > 0" :results="sortedResults" />

    <!-- FAQ -->
    <FuelCardFAQ />

    <!-- 광고 하단 -->
    <AdSlot slot="fuel-card-bottom" label="FAQ 하단" />

    <CompareSourceFooter
      :sources="FUEL_COMPARE_SOURCES"
      :updated-at="SOURCE_VERIFIED_AT"
      note="※ 유가와 카드 혜택은 수시로 바뀌므로 실제 할인 조건과 연회비는 각 카드사 공식 페이지를 다시 확인하세요."
    />

    <ShareModal
      :show="showShareModal"
      :kakao-busy="kakaoBusy"
      :summary-text="shareSummary"
      @close="closeShare"
      @share-kakao="shareKakao"
      @copy-link="copyLink"
    />

    <!-- 내부 링크 -->
    <div class="space-y-3">
      <div class="section-heading-block">
        <h2 class="section-title">더 알아보기</h2>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <RouterLink
          v-for="link in issuerLinks"
          :key="link.slug"
          :to="link.to"
          class="retro-panel-muted px-3 py-2.5 text-caption font-medium text-foreground hover:text-primary transition-colors"
        >
          {{ link.name }} 주유 할인
        </RouterLink>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <RouterLink
          v-for="link in monthlyLinks"
          :key="link.amount"
          :to="`/fuel-card/monthly/${link.amount}`"
          class="retro-panel-muted px-3 py-2.5 text-caption font-medium text-foreground hover:text-primary transition-colors"
        >
          {{ link.label }} 최적 카드
        </RouterLink>
        <RouterLink
          to="/fuel-card/gasoline"
          class="retro-panel-muted px-3 py-2.5 text-caption font-medium text-foreground hover:text-primary transition-colors"
        >
          휘발유 할인카드 비교
        </RouterLink>
        <RouterLink
          to="/fuel-card/diesel"
          class="retro-panel-muted px-3 py-2.5 text-caption font-medium text-foreground hover:text-primary transition-colors"
        >
          경유 할인카드 비교
        </RouterLink>
        <RouterLink
          to="/annual-fee"
          class="retro-panel-muted px-3 py-2.5 text-caption font-medium text-foreground hover:text-primary transition-colors"
        >
          연회비 회수 계산기
        </RouterLink>
        <RouterLink
          to="/duty-free"
          class="retro-panel-muted px-3 py-2.5 text-caption font-medium text-foreground hover:text-primary transition-colors"
        >
          관세 계산기
        </RouterLink>
        <RouterLink
          to="/mileage"
          class="retro-panel-muted px-3 py-2.5 text-caption font-medium text-foreground hover:text-primary transition-colors"
        >
          마일리지 가치 계산기
        </RouterLink>
        <RouterLink
          to="/overseas-payment"
          class="retro-panel-muted px-3 py-2.5 text-caption font-medium text-foreground hover:text-primary transition-colors"
        >
          해외결제 카드 비교
        </RouterLink>
        <RouterLink
          to="/min-spend"
          class="retro-panel-muted px-3 py-2.5 text-caption font-medium text-foreground hover:text-primary transition-colors"
        >
          전월 실적 계산기
        </RouterLink>
      </div>
    </div>
  </div>
</template>
