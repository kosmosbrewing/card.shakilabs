<script setup lang="ts">
import { AlertTriangle, CheckCircle2, Trophy } from "lucide-vue-next";
import { computed } from "vue";
import { progressBarWidth } from "@shakilabs/ui";
import type { MinSpendCalcResult } from "@/utils/minSpendCalculator";
import { formatQualificationStatus } from "@/utils/minSpendCalculator";

const props = defineProps<{
  result: MinSpendCalcResult;
  rank: number;
}>();

const progressTone = computed(() => {
  if (props.result.qualificationRate >= 1) return "fill-savings";
  if (props.result.qualificationRate >= 0.8) return "fill-status-warning";
  return "fill-loss";
});

// 표시 숫자와 aria-valuenow가 같은 값을 쓰도록 한 곳에서 반올림한다(전에는 aria만 소수점이 남았다).
const percent = computed(() => {
  const rate = props.result.qualificationRate;
  if (!Number.isFinite(rate)) return 0;
  return Math.round(Math.min(1, Math.max(0, rate)) * 100);
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
        <span class="inline-block h-3 w-3 rounded-sm bg-primary" />
        <span class="text-body font-bold text-foreground">{{ result.card.issuer }}</span>
        <span class="text-body text-muted-foreground">{{ result.card.name }}</span>
      </div>

      <div class="space-y-2">
        <div
          class="h-3 overflow-hidden rounded-full bg-muted/60"
          role="progressbar"
          :aria-label="`${result.card.issuer} 실적 달성률`"
          :aria-valuenow="percent"
          :aria-valuetext="`실적 기준 대비 ${percent}%${result.isQualified ? ', 실적 충족' : ''}`"
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <svg viewBox="0 0 100 12" preserveAspectRatio="none" class="block h-full w-full" aria-hidden="true">
            <!-- rx를 두면 preserveAspectRatio="none" 때문에 가로로 늘어나 폭마다 코너가 달라진다(같은 페이지에서 886px·416px 막대가 갈렸다).
                 ui 0.3.11이 패키지 막대에서 없앤 것과 같은 이유로 제거하고, 알약 모양은 컨테이너가 만든다. -->
            <rect :width="progressBarWidth(result.qualificationRate)" height="12" :class="progressTone" />
          </svg>
        </div>
        <div class="flex items-center justify-between gap-2 text-caption">
          <span class="tabular-nums text-muted-foreground">
            {{ result.totalSpending.toLocaleString() }}원 / {{ result.minSpendRequired.toLocaleString() }}원
          </span>
          <span class="font-semibold tabular-nums text-foreground">
            {{ percent }}%
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

      <div class="result-metric-grid grid grid-cols-3 gap-2">
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
