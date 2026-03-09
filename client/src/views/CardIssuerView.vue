<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router";
import SEOHead from "@/components/common/SEOHead.vue";
import FreshBadge from "@/components/common/FreshBadge.vue";
import AdSlot from "@/components/common/AdSlot.vue";
import CardDetailSection from "@/components/fuel-card/CardDetailSection.vue";
import {
  FUEL_CARDS,
  ISSUER_SLUG_MAP,
  ISSUER_DISPLAY_NAME,
} from "@/data/fuelCards";
import { FUEL_PRICES, type FuelType } from "@/data/fuelPrices";
import { calculateCardSavings, formatDiscountType } from "@/utils/calculator";

const props = defineProps<{
  issuer: string;
}>();

const issuerName = computed(
  () => ISSUER_DISPLAY_NAME[props.issuer] ?? props.issuer
);

const issuerCards = computed(() => {
  const ids = ISSUER_SLUG_MAP[props.issuer] ?? [];
  return FUEL_CARDS.filter((c) => ids.includes(c.id));
});

// 월별 시뮬레이션 (10만~50만)
const simAmounts = [100000, 200000, 300000, 400000, 500000];

const simResults = computed(() =>
  simAmounts.map((amount) => ({
    amount,
    results: issuerCards.value.map((card) =>
      calculateCardSavings(card, {
        fuelType: "gasoline" as FuelType,
        monthlySpend: amount,
        preferredBrand: "all",
      })
    ),
  }))
);

const seoTitle = computed(
  () => `${issuerName.value} 주유 할인 총정리 | ${issuerCards.value.map((c) => c.name).join(", ")} 실적 조건, 연회비`
);
const seoDescription = computed(
  () => `${issuerName.value}의 주유 할인 카드를 상세히 비교합니다. 할인 구조, 전월 실적, 연회비, 월별 절약 시뮬레이션.`
);
</script>

<template>
  <SEOHead :title="seoTitle" :description="seoDescription" />

  <div class="container space-y-5 py-5">
    <!-- 헤더 -->
    <div class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h1 class="retro-title">{{ issuerName }} 주유 할인 총정리</h1>
        <FreshBadge :message="`${FUEL_PRICES.lastUpdated} 기준`" />
      </div>
      <div class="retro-panel-content space-y-3">
        <div v-for="card in issuerCards" :key="card.id" class="space-y-2">
          <div class="flex items-center gap-2">
            <span class="inline-block h-3 w-3 rounded-sm" :style="{ backgroundColor: card.issuerColor }" />
            <span class="text-body font-bold">{{ card.name }}</span>
            <span class="text-caption text-muted-foreground">연회비 {{ card.annualFee.toLocaleString() }}원</span>
          </div>
          <p class="text-caption text-muted-foreground">
            {{ formatDiscountType(card) }}
            <template v-if="card.discount.monthlyCap > 0">
              · 월 한도 {{ card.discount.monthlyCap.toLocaleString() }}원
            </template>
            · 전월 실적 {{ card.discount.minSpend.toLocaleString() }}원
            <template v-if="card.discount.brandRestriction.length > 0">
              · {{ card.discount.brandRestriction.join(', ') }} 전용
            </template>
          </p>
        </div>
      </div>
    </div>

    <!-- 월별 시뮬레이션 -->
    <div class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h2 class="retro-title">월 주유 금액별 절약액</h2>
      </div>
      <div class="retro-panel-content">
      <div class="overflow-x-auto -mx-4 sm:-mx-5">
        <table class="w-full text-caption">
          <thead>
            <tr class="border-b border-border bg-muted/30">
              <th class="px-3 py-2 text-left font-semibold">월 주유</th>
              <th
                v-for="card in issuerCards"
                :key="card.id"
                class="px-3 py-2 text-right font-semibold"
              >
                {{ card.name }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="sim in simResults"
              :key="sim.amount"
              class="border-b border-border/50"
            >
              <td class="px-3 py-2 font-medium tabular-nums">{{ (sim.amount / 10000).toFixed(0) }}만원</td>
              <td
                v-for="r in sim.results"
                :key="r.cardId"
                class="px-3 py-2 text-right tabular-nums"
                :class="r.annualNet > 0 ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-red-500'"
              >
                연 {{ r.annualNet.toLocaleString() }}원
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      </div>
    </div>

    <AdSlot slot="issuer-detail" label="카드사 상세" />

    <!-- 다른 카드와 비교 링크 -->
    <div class="retro-panel-muted p-4">
      <p class="text-caption font-semibold text-foreground mb-2">다른 카드와 비교하기</p>
      <RouterLink
        to="/fuel-card"
        class="retro-link text-caption"
      >
        전체 카드 비교 계산기로 이동 →
      </RouterLink>
    </div>
  </div>
</template>
