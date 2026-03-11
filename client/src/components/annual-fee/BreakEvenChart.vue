<script setup lang="ts">
import { computed } from "vue";
import type { AnnualFeeCalcResult } from "@/utils/annualFeeCalculator";
import { formatBreakEven } from "@/utils/annualFeeCalculator";

const props = defineProps<{
  results: AnnualFeeCalcResult[];
}>();

const maxMonths = computed(() => {
  const finiteMonths = props.results
    .map((result) => result.breakEvenMonths)
    .filter((value): value is number => value != null);
  return finiteMonths.length > 0 ? Math.max(...finiteMonths, 1) : 1;
});

function resolveWidth(result: AnnualFeeCalcResult): number {
  if (result.breakEvenMonths == null) return 12;
  const ratio = (maxMonths.value - result.breakEvenMonths) / maxMonths.value;
  return 28 + ratio * 72;
}
</script>

<template>
  <div class="retro-panel overflow-hidden">
    <div class="retro-titlebar rounded-t-2xl">
      <h2 class="retro-title">카드별 연회비 회수 기간</h2>
    </div>

    <div class="retro-panel-content space-y-2.5">
      <div
        v-for="result in results"
        :key="result.cardId"
        class="flex items-center gap-3"
      >
        <div class="flex w-28 shrink-0 items-center gap-1.5">
          <span
            class="inline-block h-2.5 w-2.5 rounded-sm"
            :style="{ backgroundColor: result.card.issuerColor }"
          />
          <span class="truncate text-tiny font-medium">{{ result.card.issuer }}</span>
        </div>

        <div class="h-6 flex-1 overflow-hidden rounded-md bg-muted/50">
          <div
            class="h-full rounded-md transition-all duration-500 ease-out"
            :class="result.breakEvenMonths == null ? 'bg-loss/70' : result.breakEvenMonths <= 3 ? 'bg-savings/80' : 'bg-status-warning/80'"
            :style="{ width: `${resolveWidth(result)}%` }"
          />
        </div>

        <div
          class="w-24 shrink-0 text-right text-caption font-bold tabular-nums"
          :class="result.breakEvenMonths == null ? 'text-loss' : result.breakEvenMonths <= 3 ? 'text-savings' : 'text-status-warning'"
        >
          {{ formatBreakEven(result.breakEvenMonths) }}
        </div>
      </div>
    </div>
  </div>
</template>
