<script setup lang="ts">
import { computed } from "vue";
import type { MinSpendCalcResult } from "@/utils/minSpendCalculator";

const props = defineProps<{
  results: MinSpendCalcResult[];
}>();

const maxMagnitude = computed(() => {
  const max = Math.max(...props.results.map((result) => Math.abs(result.netBenefitIncludingGap)));
  return max > 0 ? max : 1;
});
</script>

<template>
  <div class="retro-panel overflow-hidden">
    <div class="retro-titlebar rounded-t-2xl">
      <h2 class="retro-title">추가 지출 포함 순혜택</h2>
    </div>

    <div class="retro-panel-content space-y-2.5">
      <div
        v-for="result in results"
        :key="result.cardId"
        class="flex items-center gap-3"
      >
        <div class="flex w-24 shrink-0 items-center gap-1.5">
          <span
            class="inline-block h-2.5 w-2.5 rounded-sm"
            :style="{ backgroundColor: result.card.issuerColor }"
          />
          <span class="truncate text-tiny font-medium">{{ result.card.issuer }}</span>
        </div>

        <div class="h-6 flex-1 overflow-hidden rounded-md bg-muted/50">
          <div
            class="h-full rounded-md transition-all duration-500 ease-out"
            :class="result.netBenefitIncludingGap >= 0 ? 'bg-emerald-500/80' : 'bg-red-400/80'"
            :style="{ width: `${Math.max((Math.abs(result.netBenefitIncludingGap) / maxMagnitude) * 100, 2)}%` }"
          />
        </div>

        <div
          class="w-24 shrink-0 text-right text-caption font-bold tabular-nums"
          :class="result.netBenefitIncludingGap >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'"
        >
          {{ result.netBenefitIncludingGap.toLocaleString() }}원
        </div>
      </div>
    </div>
  </div>
</template>
