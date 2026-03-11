<script setup lang="ts">
import { computed } from "vue";
import type { DutyFreeCategory } from "@/data/dutyFreeRates";
import { calculateDutyFree } from "@/utils/dutyFreeCalculator";

const props = defineProps<{
  purchaseAmountUsd: number;
  category: DutyFreeCategory;
}>();

const sampleAmounts = computed(() => {
  const values = new Set([400, 800, 1200, 1600, Math.round(props.purchaseAmountUsd)]);
  return [...values].sort((a, b) => a - b);
});

const results = computed(() =>
  sampleAmounts.value.map((amount) =>
    calculateDutyFree({ purchaseAmountUsd: amount, category: props.category })
  )
);

const maxTax = computed(() =>
  Math.max(...results.value.map((result) => result.finalTax), 1)
);
</script>

<template>
  <div class="retro-panel overflow-hidden">
    <div class="retro-titlebar rounded-t-2xl">
      <h2 class="retro-title">구매 금액별 예상 세금</h2>
    </div>

    <div class="retro-panel-content space-y-2.5">
      <div
        v-for="result in results"
        :key="result.purchaseAmountUsd"
        class="flex items-center gap-3"
      >
        <div class="w-20 shrink-0 text-caption font-medium tabular-nums text-foreground">
          ${{ result.purchaseAmountUsd }}
        </div>
        <div class="h-6 flex-1 overflow-hidden rounded-md bg-muted/50">
          <div
            class="h-full rounded-md transition-all duration-500 ease-out"
            :class="result.finalTax > 0 ? 'bg-loss/80' : 'bg-savings/80'"
            :style="{ width: `${Math.max((result.finalTax / maxTax) * 100, 4)}%` }"
          />
        </div>
        <div
          class="w-24 shrink-0 text-right text-caption font-bold tabular-nums"
          :class="result.finalTax > 0 ? 'text-loss' : 'text-savings'"
        >
          {{ result.finalTax.toLocaleString() }}원
        </div>
      </div>
    </div>
  </div>
</template>
