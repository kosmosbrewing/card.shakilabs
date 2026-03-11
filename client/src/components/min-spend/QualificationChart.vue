<script setup lang="ts">
import type { MinSpendCalcResult } from "@/utils/minSpendCalculator";

defineProps<{
  results: MinSpendCalcResult[];
}>();

function progressClass(rate: number) {
  if (rate >= 1) return "bg-savings/80";
  if (rate >= 0.8) return "bg-status-warning/80";
  return "bg-loss/80";
}
</script>

<template>
  <div class="retro-panel overflow-hidden">
    <div class="retro-titlebar rounded-t-2xl">
      <h2 class="retro-title">카드별 실적 달성률</h2>
    </div>

    <div class="retro-panel-content space-y-2.5">
      <div
        v-for="result in results"
        :key="result.cardId"
        class="flex items-center gap-3"
      >
        <div class="flex w-24 shrink-0 items-center gap-1.5">
          <span
            class="inline-block h-2.5 w-2.5 shrink-0 rounded-sm"
            :style="{ backgroundColor: result.card.issuerColor }"
          />
          <span class="truncate text-tiny font-medium">{{ result.card.issuer }}</span>
        </div>

        <div class="h-6 flex-1 overflow-hidden rounded-md bg-muted/50">
          <div
            class="h-full rounded-md transition-all duration-500 ease-out"
            :class="progressClass(result.qualificationRate)"
            :style="{ width: `${Math.max(result.qualificationRate * 100, 2)}%` }"
          />
        </div>

        <div
          class="w-28 shrink-0 text-right text-caption tabular-nums"
          :class="result.qualificationRate >= 1 ? 'text-savings' : result.qualificationRate >= 0.8 ? 'text-status-warning' : 'text-loss'"
        >
          {{ result.qualificationRate >= 1 ? '▲' : '▼' }} {{ (result.qualificationRate * 100).toFixed(0) }}%
        </div>
      </div>
    </div>
  </div>
</template>
