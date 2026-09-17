<script setup lang="ts">
import { AlertTriangle, Trophy } from "lucide-vue-next";
import type { AnnualFeeCalcResult } from "@/utils/annualFeeCalculator";
import { formatBreakEven, formatRoiRatio } from "@/utils/annualFeeCalculator";
import ResultHero from "@/components/common/ResultHero.vue";

defineProps<{
  result: AnnualFeeCalcResult;
  rank: number;
}>();
</script>

<template>
  <div
    :class="[
      'retro-panel overflow-hidden transition-all',
      rank === 1 && 'ring-2 ring-primary/40',
    ]"
  >
    <div class="retro-titlebar rounded-t-2xl">
      <h3 class="retro-title flex items-center gap-2">
        <Trophy v-if="rank === 1" class="h-4 w-4 text-primary" />
        <span>{{ rank === 1 ? "🏆 1위" : `${rank}위` }}</span>
      </h3>
    </div>

    <div class="retro-panel-content space-y-3">
      <div class="flex items-center gap-2">
        <span
          class="inline-block h-3 w-3 rounded-sm"
          :style="{ backgroundColor: result.card.issuerColor }"
        />
        <span class="text-body font-bold text-foreground">{{ result.card.issuer }}</span>
        <span class="text-body text-muted-foreground">{{ result.card.name }}</span>
      </div>

      <!-- 대표 수치: 1위 카드만 히어로로 올린다(BL-020) -->
      <ResultHero
        v-if="rank === 1"
        label="연 순혜택"
        :value="`${result.annualNetBenefit.toLocaleString()}원`"
        :value-class="result.annualNetBenefit >= 0 ? 'text-status-success' : 'text-status-danger'"
      />

      <div class="result-metric-grid grid gap-2" :class="rank === 1 ? 'grid-cols-2' : 'grid-cols-3'">
        <div class="text-center">
          <div class="text-tiny text-muted-foreground">회수 기간</div>
          <div
            class="text-heading font-bold tabular-nums"
            :class="result.breakEvenMonths && result.breakEvenMonths <= 3 ? 'text-status-success' : result.breakEvenMonths ? 'text-status-warning' : 'text-status-danger'"
          >
            {{ formatBreakEven(result.breakEvenMonths) }}
          </div>
        </div>
        <div class="text-center">
          <div class="text-tiny text-muted-foreground">ROI</div>
          <div class="text-heading font-bold tabular-nums text-status-success">
            {{ formatRoiRatio(result.roiRatio) }}
          </div>
        </div>
        <div v-if="rank !== 1" class="text-center">
          <div class="text-tiny text-muted-foreground">연 순혜택</div>
          <div
            class="text-heading font-bold tabular-nums"
            :class="result.annualNetBenefit >= 0 ? 'text-status-success' : 'text-status-danger'"
          >
            {{ result.annualNetBenefit.toLocaleString() }}원
          </div>
        </div>
      </div>

      <div class="space-y-1 text-caption">
        <div class="text-muted-foreground">
          월 혜택 {{ result.totalMonthlyBenefit.toLocaleString() }}원 · 연회비 {{ result.annualFee.toLocaleString() }}원
        </div>
        <div
          v-if="result.appliedTotalMonthlyCap !== null"
          class="text-muted-foreground"
        >
          월 통합한도 {{ result.appliedTotalMonthlyCap.toLocaleString() }}원
          <span v-if="result.isTotalCapExceeded" class="text-status-warning"> · 한도 적용</span>
        </div>
        <div class="text-muted-foreground">
          월 카드 사용 {{ result.totalMonthlySpend.toLocaleString() }}원 · 월 환산 연회비 {{ result.monthlyAnnualFee.toLocaleString() }}원
        </div>
        <div
          v-if="!result.isMinSpendMet"
          class="flex items-center gap-1 text-status-warning"
        >
          <AlertTriangle class="h-3.5 w-3.5" />
          실적까지 {{ result.minSpendGap.toLocaleString() }}원 부족
        </div>
        <div class="text-muted-foreground">
          {{ result.card.summary }}
        </div>
      </div>
    </div>
  </div>
</template>
