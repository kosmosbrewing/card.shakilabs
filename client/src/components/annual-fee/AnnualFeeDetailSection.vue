<script setup lang="ts">
import type { AnnualFeeCalcResult } from "@/utils/annualFeeCalculator";
import { formatAnnualFeeAnalysis } from "@/utils/annualFeeCalculator";

defineProps<{
  results: AnnualFeeCalcResult[];
}>();
</script>

<template>
  <div class="retro-panel overflow-hidden">
    <div class="retro-titlebar rounded-t-2xl">
      <h2 class="retro-title">카드별 혜택 구조 상세</h2>
    </div>

    <div class="retro-panel-content space-y-2">
      <div
        v-for="result in results"
        :key="result.cardId"
        class="retro-panel-muted space-y-2 p-3.5"
      >
        <div class="flex items-center gap-2">
          <span
            class="inline-block h-3 w-3 rounded-sm"
            :style="{ backgroundColor: result.card.issuerColor }"
          />
          <span class="text-body font-bold">{{ result.card.issuer }}</span>
          <span class="text-body text-muted-foreground">{{ result.card.name }}</span>
        </div>

        <p class="text-caption leading-relaxed text-foreground">
          {{ formatAnnualFeeAnalysis(result) }}
        </p>

        <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div
            v-for="detail in result.categoryBreakdown"
            :key="detail.categoryId"
            class="rounded-xl border border-border/60 bg-background/60 p-3"
          >
            <div class="flex items-center justify-between gap-2">
              <span class="text-caption font-semibold text-foreground">{{ detail.categoryLabel }}</span>
              <span class="text-tiny text-muted-foreground">{{ (detail.rate * 100).toFixed(1) }}%</span>
            </div>
            <div class="mt-1 text-caption text-muted-foreground">
              월 {{ detail.monthlySpend.toLocaleString() }}원 사용
            </div>
            <div class="mt-1 text-body font-semibold tabular-nums text-savings">
              {{ detail.cappedBenefit.toLocaleString() }}원 혜택
            </div>
            <div v-if="detail.monthlyCap > 0" class="mt-1 text-tiny text-muted-foreground">
              한도 {{ detail.monthlyCap.toLocaleString() }}원
              <span v-if="detail.isCapExceeded" class="text-status-warning"> · 한도 초과</span>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap gap-1.5">
          <span class="rounded-full border border-border/60 bg-background/60 px-2 py-0.5 text-tiny text-muted-foreground">
            실적 {{ result.card.minSpend.toLocaleString() }}원
          </span>
          <span
            v-if="result.appliedTotalMonthlyCap !== null"
            class="rounded-full border border-border/60 bg-background/60 px-2 py-0.5 text-tiny text-muted-foreground"
          >
            월 통합한도 {{ result.appliedTotalMonthlyCap.toLocaleString() }}원
          </span>
          <span
            v-for="extra in result.card.extras"
            :key="extra"
            class="rounded-full border border-border/60 bg-background/60 px-2 py-0.5 text-tiny text-muted-foreground"
          >
            {{ extra }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
