<script setup lang="ts">
import { RouterLink } from "vue-router";
import AdSlot from "@/components/common/AdSlot.vue";
import SEOHead from "@/components/common/SEOHead.vue";
import CompareSourceFooter from "@/components/common/CompareSourceFooter.vue";
import DutyFreeBarChart from "@/components/duty-free/DutyFreeBarChart.vue";
import DutyFreeFAQ from "@/components/duty-free/DutyFreeFAQ.vue";
import DutyFreeInput from "@/components/duty-free/DutyFreeInput.vue";
import DutyFreeResult from "@/components/duty-free/DutyFreeResult.vue";
import TaxBreakdownSection from "@/components/duty-free/TaxBreakdownSection.vue";
import { useDutyFreeCalc } from "@/composables/useDutyFreeCalc";
import { formatTaxBreakdown } from "@/utils/dutyFreeCalculator";
import { DUTY_FREE_SOURCES, SOURCE_VERIFIED_AT } from "@/data/sourceReferences";

const { purchaseAmountUsd, category, result } = useDutyFreeCalc();

const seoTitle = "면세 한도 초과 관세 계산기 | 해외쇼핑 관세·부가세 자동 계산 2026";
const seoDescription =
  "해외 면세점과 직구 구매 금액이 800달러를 넘을 때 예상 관세와 부가세를 자동 계산합니다.";

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "면세 한도가 $800인가요?",
      acceptedAnswer: { "@type": "Answer", text: "일반 여행자 휴대품 면세 한도는 800달러 기준입니다." },
    },
    {
      "@type": "Question",
      name: "간이세율은 언제 적용되나요?",
      acceptedAnswer: { "@type": "Answer", text: "일부 일반 물품에 한해 금액과 품목 조건을 만족할 때 적용됩니다." },
    },
  ],
};
</script>

<template>
  <SEOHead :title="seoTitle" :description="seoDescription" :json-ld="faqJsonLd" />

  <div class="container space-y-5 py-5">
    <DutyFreeInput
      :purchase-amount-usd="purchaseAmountUsd"
      :category="category"
      @update:purchase-amount-usd="purchaseAmountUsd = $event"
      @update:category="category = $event"
    />

    <DutyFreeResult :result="result" />

    <AdSlot slot="duty-free-top" label="관세 계산 상단" />

    <TaxBreakdownSection :result="result" />

    <DutyFreeBarChart :purchase-amount-usd="purchaseAmountUsd" :category="category" />

    <AdSlot slot="duty-free-middle" label="관세 계산 중단" />

    <div class="retro-panel-muted px-4 py-4 text-caption font-semibold leading-relaxed text-foreground">
      {{ formatTaxBreakdown(result) }}
    </div>

    <DutyFreeFAQ />

    <AdSlot slot="duty-free-bottom" label="관세 FAQ 하단" />

    <CompareSourceFooter
      :sources="DUTY_FREE_SOURCES"
      :updated-at="SOURCE_VERIFIED_AT"
      note="※ 실제 세액은 통관 시점 환율, 세율, 품목 세번 분류, 자진신고 여부에 따라 달라질 수 있습니다."
    />

    <div class="space-y-3">
      <div class="section-heading-block">
        <h2 class="section-title">다른 계산기도 함께 보기</h2>
      </div>
      <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
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
          to="/fuel-card"
          class="retro-panel-muted px-3 py-2.5 text-caption font-medium text-foreground transition-colors hover:text-primary"
        >
          주유 할인카드 비교
        </RouterLink>
      </div>
    </div>
  </div>
</template>
