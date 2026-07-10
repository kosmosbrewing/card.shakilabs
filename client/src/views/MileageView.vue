<script setup lang="ts">
import { RouterLink } from "vue-router";
import CalculatorInteractionTracker from "@/components/analytics/CalculatorInteractionTracker.vue";
import AdSlot from "@/components/common/AdSlot.vue";
import SEOHead from "@/components/common/SEOHead.vue";
import CompareSourceFooter from "@/components/common/CompareSourceFooter.vue";
import MileageDetailSection from "@/components/mileage/MileageDetailSection.vue";
import MileageFAQ from "@/components/mileage/MileageFAQ.vue";
import MileageInput from "@/components/mileage/MileageInput.vue";
import MileageRouteTable from "@/components/mileage/MileageRouteTable.vue";
import MileageSummaryCard from "@/components/mileage/MileageSummaryCard.vue";
import MileageValueChart from "@/components/mileage/MileageValueChart.vue";
import { useMileageCalc } from "@/composables/useMileageCalc";
import { MILEAGE_SOURCES, SOURCE_VERIFIED_AT } from "@/data/sourceReferences";
import { MILEAGE_ASSUMPTIONS } from "@/data/mileageData";

const {
  airlineId,
  mileageBalance,
  sortKey,
  selectedClass,
  result,
  sortedValues,
} = useMileageCalc();

const seoTitle = "마일리지 가치 계산기 | 1마일 원화 가치 · 좌석등급별 가성비 비교 2026";
const seoDescription =
  "항공사와 보유 마일리지를 입력하면 노선별 1마일 가치와 최적 사용처를 원화 기준으로 비교합니다.";

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "1마일 가치는 어느 정도인가요?",
      acceptedAnswer: { "@type": "Answer", text: "사용처와 좌석 등급에 따라 큰 차이가 나며 보통 프리미엄 좌석에서 높아집니다." },
    },
    {
      "@type": "Question",
      name: "비즈니스석이 항상 유리한가요?",
      acceptedAnswer: { "@type": "Answer", text: "원/마일은 높지만 필요한 마일이 커서 개인의 사용 빈도에 따라 달라집니다." },
    },
  ],
};
</script>

<template>
  <SEOHead :title="seoTitle" :description="seoDescription" :json-ld="faqJsonLd" />

  <div class="container space-y-5 py-5">
    <CalculatorInteractionTracker calculator-id="mileage_value" page-path="/card/mileage">
      <MileageInput
        :airline-id="airlineId"
        :mileage-balance="mileageBalance"
        :selected-class="selectedClass"
        @update:airline-id="airlineId = $event"
        @update:mileage-balance="mileageBalance = $event"
        @update:selected-class="selectedClass = $event"
      />
    </CalculatorInteractionTracker>

    <div class="rounded-xl border border-primary/25 bg-primary/5 p-4 text-caption leading-relaxed text-foreground">
      <p class="font-semibold">공식 공제 기준: {{ MILEAGE_ASSUMPTIONS.journey }}</p>
      <p class="mt-1 text-muted-foreground">
        원/마일은 {{ MILEAGE_ASSUMPTIONS.cashFare }}로 계산하며,
        {{ MILEAGE_ASSUMPTIONS.exclusions }}입니다. “마일 충족”은 좌석 예약 가능을 뜻하지 않습니다.
      </p>
    </div>

    <MileageSummaryCard :result="result" />

    <AdSlot slot="mileage-top" label="마일리지 상단" />

    <MileageValueChart :values="sortedValues" />

    <MileageRouteTable
      :values="sortedValues"
      :sort-key="sortKey"
      @update:sort-key="sortKey = $event"
    />

    <AdSlot slot="mileage-middle" label="마일리지 비교표 하단" />

    <MileageDetailSection :values="result.allValues" />

    <MileageFAQ />

    <AdSlot slot="mileage-bottom" label="마일리지 FAQ 하단" />

    <CompareSourceFooter
      :sources="MILEAGE_SOURCES"
      :updated-at="SOURCE_VERIFIED_AT"
      note="※ 공식 평수기 성인 왕복 공제표 기준입니다. 현금가는 내부 예시이며 성수기, 제세공과금, 보너스 좌석 재고는 별도 확인해야 합니다."
    />

    <div class="space-y-3">
      <div class="section-heading-block">
        <h2 class="section-title">다른 계산기도 함께 보기</h2>
      </div>
      <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <RouterLink
          to="/overseas-payment"
          class="retro-panel-muted flex min-h-[44px] items-center px-3 py-2.5 text-caption font-medium text-foreground transition-colors hover:text-primary"
        >
          해외결제 카드 비교
        </RouterLink>
        <RouterLink
          to="/annual-fee"
          class="retro-panel-muted flex min-h-[44px] items-center px-3 py-2.5 text-caption font-medium text-foreground transition-colors hover:text-primary"
        >
          연회비 회수 계산기
        </RouterLink>
        <RouterLink
          to="/duty-free"
          class="retro-panel-muted flex min-h-[44px] items-center px-3 py-2.5 text-caption font-medium text-foreground transition-colors hover:text-primary"
        >
          관세 계산기
        </RouterLink>
      </div>
    </div>
  </div>
</template>
