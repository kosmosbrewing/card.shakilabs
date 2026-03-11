<script setup lang="ts">
import { AlertTriangle, CheckCircle2, Trophy } from "lucide-vue-next";
import { computed } from "vue";
import type { MinSpendCalcResult } from "@/utils/minSpendCalculator";
import { formatQualificationStatus } from "@/utils/minSpendCalculator";

const props = defineProps<{
  result: MinSpendCalcResult;
  rank: number;
}>();

const progressWidth = computed(() => `${Math.max(props.result.qualificationRate * 100, 4)}%`);
const progressTone = computed(() => {
  if (props.result.qualificationRate >= 1) return "bg-savings/80";
  if (props.result.qualificationRate >= 0.8) return "bg-status-warning/80";
  return "bg-loss/80";
});
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
        <span>{{ rank === 1 ? '🏆 1위' : `${rank}위` }}</span>
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

      <div class="space-y-2">
        <div class="h-3 overflow-hidden rounded-full bg-muted/60">
          <div
            class="h-full rounded-full transition-all duration-500 ease-out"
            :class="progressTone"
            :style="{ width: progressWidth }"
          />
        </div>
        <div class="flex items-center justify-between gap-2 text-caption">
          <span class="tabular-nums text-muted-foreground">
            {{ result.totalSpending.toLocaleString() }}원 / {{ result.minSpendRequired.toLocaleString() }}원
          </span>
          <span class="font-semibold tabular-nums text-foreground">
            {{ (result.qualificationRate * 100).toFixed(0) }}%
          </span>
        </div>
        <div
          class="flex items-center gap-1 text-caption"
          :class="result.isQualified ? 'text-savings' : 'text-status-warning'"
        >
          <CheckCircle2 v-if="result.isQualified" class="h-3.5 w-3.5" />
          <AlertTriangle v-else class="h-3.5 w-3.5" />
          {{ formatQualificationStatus(result) }}
        </div>
      </div>

      <div class="grid grid-cols-3 gap-2">
        <div class="text-center">
          <div class="text-tiny text-muted-foreground">월 할인</div>
          <div class="text-heading font-bold tabular-nums text-savings">
            {{ result.monthlyDiscount.toLocaleString() }}원
          </div>
        </div>
        <div class="text-center">
          <div class="text-tiny text-muted-foreground">연회비/월</div>
          <div class="text-heading font-bold tabular-nums">
            {{ result.monthlyAnnualFee.toLocaleString() }}원
          </div>
        </div>
        <div class="text-center">
          <div class="text-tiny text-muted-foreground">순 혜택</div>
          <div
            class="text-heading font-bold tabular-nums"
            :class="result.netBenefitIncludingGap >= 0 ? 'text-savings' : 'text-loss'"
          >
            {{ result.netBenefitIncludingGap >= 0 ? '▲' : '▼' }} {{ Math.abs(result.netBenefitIncludingGap).toLocaleString() }}원
          </div>
        </div>
      </div>

      <div class="space-y-1 text-caption">
        <div class="text-muted-foreground">
          {{ result.card.discount.type === 'perLiter' ? `리터당 ${result.card.discount.amount}원 할인` : `${(result.card.discount.amount * 100).toFixed(0)}% 할인` }}
          · 전월 실적 {{ result.minSpendRequired.toLocaleString() }}원
          <template v-if="result.appliedTierLabel">
            · {{ result.appliedTierLabel }}
          </template>
        </div>
        <div v-if="!result.isQualified" class="text-muted-foreground">
          실적 충족 시 현재 한도 {{ result.appliedMonthlyCap.toLocaleString() }}원 기준 월 {{ Math.round(result.monthlyNetBenefit + result.monthlyAnnualFee).toLocaleString() }}원 할인 가능
        </div>
        <div
          v-if="!result.isQualified"
          :class="result.netBenefitIncludingGap >= 0 ? 'text-savings' : 'text-loss'"
        >
          추가 {{ result.gap.toLocaleString() }}원 지출 감안 → 순혜택 {{ result.netBenefitIncludingGap >= 0 ? '▲' : '▼' }} {{ Math.abs(result.netBenefitIncludingGap).toLocaleString() }}원
        </div>
      </div>
    </div>
  </div>
</template>
