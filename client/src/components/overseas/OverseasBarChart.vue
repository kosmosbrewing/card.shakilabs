<script setup lang="ts">
import { computed } from "vue";
import type { OverseasCalcResult } from "@/utils/overseasCalculator";

const props = defineProps<{
  results: OverseasCalcResult[];
}>();

const minCost = computed(() =>
  Math.min(...props.results.map((result) => result.localCurrencyNet))
);
const maxCost = computed(() =>
  Math.max(...props.results.map((result) => result.localCurrencyNet))
);

function resolveWidth(value: number): number {
  if (maxCost.value === minCost.value) return 100;
  const ratio = (maxCost.value - value) / (maxCost.value - minCost.value);
  return 30 + ratio * 70;
}
</script>

<template>
  <div class="retro-panel overflow-hidden">
    <div class="retro-titlebar rounded-t-2xl">
      <h2 class="retro-title">카드별 실부담 비교</h2>
    </div>

    <div class="retro-panel-content space-y-2.5">
      <div
        v-for="result in results"
        :key="result.cardId"
        class="flex items-center gap-3"
      >
        <div class="flex w-28 shrink-0 items-center gap-1.5">
          <span
            class="inline-block h-2.5 w-2.5 shrink-0 rounded-sm"
            :style="{ backgroundColor: result.card.issuerColor }"
          />
          <span class="truncate text-tiny font-medium">{{ result.card.issuer }}</span>
        </div>

        <div class="h-6 flex-1 overflow-hidden rounded-md bg-muted/50">
          <div
            class="h-full rounded-md transition-all duration-500 ease-out"
            :class="result.localCurrencyNet === minCost ? 'bg-emerald-500/80' : 'bg-primary/60'"
            :style="{ width: `${resolveWidth(result.localCurrencyNet)}%` }"
          />
        </div>

        <div
          class="w-24 shrink-0 text-right text-caption font-bold tabular-nums"
          :class="result.localCurrencyNet === minCost ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'"
        >
          {{ result.localCurrencyNet.toLocaleString() }}원
        </div>
      </div>
    </div>
  </div>
</template>
