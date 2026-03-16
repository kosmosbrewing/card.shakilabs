<script setup lang="ts">
import { computed } from "vue";
import SEOHead from "@/components/common/SEOHead.vue";
import AffiliateDisclosure from "@/components/common/AffiliateDisclosure.vue";
import AffiliateLinkPanel from "@/components/common/AffiliateLinkPanel.vue";
import SummaryBanner from "@/components/common/SummaryBanner.vue";
import AdSlot from "@/components/common/AdSlot.vue";
import CompareSourceFooter from "@/components/common/CompareSourceFooter.vue";
import FuelCardInput from "@/components/fuel-card/FuelCardInput.vue";
import TopCardList from "@/components/fuel-card/TopCardList.vue";
import FuelCardInternalLinks from "@/components/fuel-card/FuelCardInternalLinks.vue";
import FeeCompareTable from "@/components/fuel-card/FeeCompareTable.vue";
import CardDetailSection from "@/components/fuel-card/CardDetailSection.vue";
import SavingsBarChart from "@/components/fuel-card/SavingsBarChart.vue";
import FuelCardFAQ from "@/components/fuel-card/FuelCardFAQ.vue";
import ShareModal from "@/components/share/ShareModal.vue";
import { useFuelCardCalc } from "@/composables/useFuelCardCalc";
import { useResultShare } from "@/composables/useResultShare";
import { fuelAffiliateItems } from "@/data/affiliateLinks";
import { FUEL_TYPE_LABELS } from "@/data/fuelPrices";
import { FUEL_COMPARE_SOURCES, SOURCE_VERIFIED_AT } from "@/data/sourceReferences";
import { buildAbsoluteUrl } from "@/lib/routeState";

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
} = useResultShare({
  page: "fuel-card",
  summaryText: () => {
    const best = bestCard.value;
    if (!best) return "";
    return `월 ${monthlySpend.value.toLocaleString()}원 ${FUEL_TYPE_LABELS[fuelType.value]} 주유 → ${best.card.issuer} ${best.card.name} 연 ${best.annualNet.toLocaleString()}원 절약`;
  },
  shareUrl: () => buildAbsoluteUrl("/fuel-card", {
    fuel: fuelType.value !== "gasoline" ? fuelType.value : null,
    monthly: monthlySpend.value !== 200000 ? monthlySpend.value : null,
  }),
  shareTitle: () => {
    const best = bestCard.value;
    if (!best) return "주유 할인카드 비교 계산기";
    return `월 ${monthlySpend.value.toLocaleString()}원 주유 → ${best.card.issuer} ${best.card.name}가 가장 유리!`;
  },
  shareDescription: () => "주유 할인카드 비교 계산기 — 내 주유 패턴에 맞는 최적 카드 찾기",
  buttonTitle: "카드 비교하기",
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

    <AffiliateLinkPanel
      title="주유 관련 상품도 함께 확인하세요"
      description="카드 비교 결과를 봤다면 실제 주유 혜택 상품과 주유권 가격도 같이 확인해 보세요."
      :items="fuelAffiliateItems"
    />

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

    <FuelCardInternalLinks />
    <AffiliateDisclosure v-if="fuelAffiliateItems.length > 0" />
  </div>
</template>
