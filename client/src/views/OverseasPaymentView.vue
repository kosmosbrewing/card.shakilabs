<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router";
import { ShCalculatorSplit, ShPairRow } from "@shakilabs/ui";
import SEOHead from "@/components/common/SEOHead.vue";
import CalculatorPageHeader from "@/components/calculator/CalculatorPageHeader.vue";
import CompareSourceFooter from "@/components/common/CompareSourceFooter.vue";
import ShareModal from "@/components/share/ShareModal.vue";
import SummaryBanner from "@/components/common/SummaryBanner.vue";
import AdSlot from "@/components/common/AdSlot.vue";
import DCCCompareSection from "@/components/overseas/DCCCompareSection.vue";
import OverseasBarChart from "@/components/overseas/OverseasBarChart.vue";
import OverseasCompareTable from "@/components/overseas/OverseasCompareTable.vue";
import OverseasDetailSection from "@/components/overseas/OverseasDetailSection.vue";
import OverseasInput from "@/components/overseas/OverseasInput.vue";
import OverseasTopCardList from "@/components/overseas/OverseasTopCardList.vue";
import { useCardExchangeRates } from "@/composables/usePublicData";
import { DCC_MARKUP, getCurrencyQueryValue, getExchangeRate } from "@/data/exchangeRates";
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

useCardExchangeRates();

const seoTitle = "해외결제 카드 비교 + DCC 수수료 계산기 | Car Tools 2026";
const seoDescription =
  "해외에서 현지통화 결제와 DCC 원화결제를 비교하고, 카드별 해외수수료와 캐시백까지 한 번에 계산합니다.";

const summaryMessage = computed(() => {
  if (!bestCard.value) return "";
  return `${bestCard.value.card.issuer} ${bestCard.value.card.name} 기준 ${rateEntry.value.symbol}${foreignAmount.value.toLocaleString()} 결제 시 현지통화가 DCC보다 ${bestCard.value.dccDifference.toLocaleString()}원 저렴해요. 평균 추가 비용은 ${avgDccExtra.value.toLocaleString()}원 수준입니다.`;
});

const currencyLinks = computed(() =>
  SEO_CURRENCIES.map((item) => ({
    code: item,
    label: getExchangeRate(item).label,
    to: `/overseas-payment/${getCurrencyQueryValue(item)}`,
  }))
);

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
  <SEOHead :title="seoTitle" :description="seoDescription" />

  <div class="sh-container sh-container--tool space-y-5 py-5">
    <CalculatorPageHeader title="해외결제 카드 비교 계산기" />

    <ShCalculatorSplit>
      <template #input>
        <OverseasInput
          :currency="currency"
          :foreign-amount="foreignAmount"
          :dcc-markup-rate="dccMarkupRate"
          @update:currency="currency = $event"
          @update:foreign-amount="foreignAmount = $event"
          @update:dcc-markup-rate="dccMarkupRate = $event"
          @share-request="openShare"
        />
      </template>

      <template #result>
        <SummaryBanner v-if="bestCard" :message="summaryMessage" />
        <!-- 추천 1위가 이 계산기의 핵심 결과다 — 요약 배너만 두면 오른쪽 칸이 비고, 목록 전체(약 1,050px)를
             두면 왼쪽이 빈다(1440px 실측). 제목 + 1위만 결과 칸에, 2~3위는 1×2 아래 전폭(2열)으로. -->
        <OverseasTopCardList v-if="topCards.length > 0" :cards="topCards" part="top" />
      </template>
    </ShCalculatorSplit>

    <!-- 계산기 아래 데이터 블록 2열(ShPairRow, 사용자 결정 2026-09-25). 순서는 유지하고 짧은 블록은 한 칸에 쌓는다.
         광고는 묶음 사이로 옮겼다 — 블록 사이에 있으면 짝을 지을 수 없고, 두 광고가 붙지 않게 본문을 사이에 둔다. -->
    <ShPairRow>
      <template #start>
        <OverseasTopCardList v-if="topCards.length > 1" :cards="topCards" part="rest" stack />
      </template>
      <template #end>
        <DCCCompareSection
          v-if="bestCard"
          :result="bestCard"
          :currency-code="currency"
          :currency-symbol="rateEntry.symbol"
        />
      </template>
    </ShPairRow>

    <AdSlot slot="overseas-top" label="해외결제 결과 상단" />

    <OverseasBarChart v-if="sortedResults.length > 0" :results="sortedResults" />

    <!-- 전체 카드 비교표: 7열이라 반폭(1024px)에서 9px 가려짐(inner-scroll 실측).
         4열 이하 표만 min-w 하한을 풀 수 있어 이 표는 짝에서 빼고 전폭으로 둔다. -->
    <OverseasCompareTable
      v-if="sortedResults.length > 0"
      :results="sortedResults"
      :sort-key="sortKey"
      @update:sort-key="sortKey = $event"
    />

    <AdSlot slot="overseas-middle" label="해외결제 비교표 하단" />

    <OverseasDetailSection v-if="sortedResults.length > 0" :results="sortedResults" />

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
          class="retro-panel-muted px-3 py-2.5 text-caption font-medium text-foreground transition-colors hover:bg-background"
        >
          {{ link.code }} 카드 비교
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
        <RouterLink
          to="/fuel-card"
          class="retro-panel-muted px-3 py-2.5 text-caption font-medium text-foreground transition-colors hover:bg-background"
        >
          주유 할인카드 비교
        </RouterLink>
        <RouterLink
          to="/min-spend"
          class="retro-panel-muted px-3 py-2.5 text-caption font-medium text-foreground transition-colors hover:bg-background"
        >
          전월 실적 계산기
        </RouterLink>
      </div>
    </div>
  </div>
</template>
