<script setup lang="ts">
import { AlertTriangle, ArrowRightLeft, Trophy } from "lucide-vue-next";
import { formatFeeRate, formatPrimaryBenefit, type OverseasCalcResult } from "@/utils/overseasCalculator";
import ResultHero from "@/components/common/ResultHero.vue";

defineProps<{
  result: OverseasCalcResult;
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

      <!-- 대표 수치: 1위 카드만 히어로로 올린다(BL-020) -->
      <ResultHero
        v-if="rank === 1"
        label="현지통화 실부담"
        :value="`${result.localCurrencyNet.toLocaleString()}원`"
        value-class="text-savings"
      />

      <div class="result-metric-grid grid gap-2" :class="rank === 1 ? 'grid-cols-2' : 'grid-cols-3'">
        <div v-if="rank !== 1" class="text-center">
          <div class="text-tiny text-muted-foreground">현지통화 실부담</div>
          <div class="text-heading font-bold tabular-nums text-savings">
            {{ result.localCurrencyNet.toLocaleString() }}원
          </div>
        </div>
        <div class="text-center">
          <div class="text-tiny text-muted-foreground">DCC 결제</div>
          <div class="text-heading font-bold tabular-nums">
            {{ result.dccTotal.toLocaleString() }}원
          </div>
        </div>
        <div class="text-center">
          <div class="text-tiny text-muted-foreground">DCC 손해</div>
          <div class="text-heading font-bold tabular-nums text-loss">
            ▼ {{ result.dccDifference.toLocaleString() }}원
          </div>
        </div>
      </div>

      <div class="space-y-1 text-caption">
        <div class="text-muted-foreground">{{ formatFeeRate(result.card) }}</div>
        <div class="text-muted-foreground">{{ formatPrimaryBenefit(result.card) }}</div>
        <div class="flex items-center gap-1 text-loss">
          <ArrowRightLeft class="h-3.5 w-3.5" />
          DCC 선택 시 {{ (result.dccDifferenceRate * 100).toFixed(1) }}% 더 비쌉니다
        </div>
        <div
          v-if="result.isMinSpendWarning"
          class="flex items-center gap-1 text-status-warning"
        >
          <AlertTriangle class="h-3.5 w-3.5" />
          실적 조건 충족 여부는 별도 확인이 필요합니다
        </div>
        <div class="text-muted-foreground">
          연회비: {{ result.card.annualFee.toLocaleString() }}원
        </div>
      </div>
    </div>
  </div>
</template>
