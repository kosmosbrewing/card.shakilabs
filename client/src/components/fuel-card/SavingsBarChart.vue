<script setup lang="ts">
import { computed } from "vue";
import type { FuelCardCalcResult } from "@/utils/calculator";

const props = defineProps<{
  results: FuelCardCalcResult[];
}>();

// CSS 기반 바 차트 (Chart.js 없이 경량 구현)
const maxSavings = computed(() => {
  const max = Math.max(...props.results.map((r) => r.annualNet));
  return max > 0 ? max : 1;
});
</script>

<template>
  <div class="retro-panel overflow-hidden">
    <div class="retro-titlebar rounded-t-2xl">
      <h2 class="retro-title">연간 절약액 비교</h2>
    </div>

    <div class="retro-panel-content space-y-2.5">
      <div
        v-for="r in results"
        :key="r.cardId"
        class="flex items-center gap-3"
      >
        <!-- 카드명 -->
        <div class="w-24 shrink-0 flex items-center gap-1.5">
          <span
            class="inline-block h-2.5 w-2.5 rounded-sm shrink-0"
            :style="{ backgroundColor: r.card.issuerColor }"
          />
          <span class="text-tiny font-medium truncate">{{ r.card.issuer }}</span>
        </div>

        <!-- 바 -->
        <div class="flex-1 h-6 bg-muted/50 rounded-md overflow-hidden">
          <div
            class="h-full rounded-md transition-all duration-500 ease-out"
            :class="r.annualNet > 0 ? 'bg-emerald-500/80' : 'bg-red-400/80'"
            :style="{ width: `${Math.max((Math.abs(r.annualNet) / maxSavings) * 100, 2)}%` }"
          />
        </div>

        <!-- 금액 -->
        <div
          class="w-20 shrink-0 text-right text-caption font-bold tabular-nums"
          :class="r.annualNet > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'"
        >
          {{ r.annualNet > 0 ? '+' : '' }}{{ r.annualNet.toLocaleString() }}원
        </div>
      </div>
    </div>
  </div>
</template>
