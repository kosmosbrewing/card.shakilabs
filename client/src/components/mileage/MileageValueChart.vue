<script setup lang="ts">
import { computed } from "vue";
import type { MileageValuePerMile } from "@/utils/mileageCalculator";
import { formatValuePerMile } from "@/utils/mileageCalculator";

const props = defineProps<{
  values: MileageValuePerMile[];
}>();

const topValues = computed(() => props.values.slice(0, 8));
const maxValue = computed(() =>
  Math.max(...topValues.value.map((item) => item.valuePerMile), 1)
);
</script>

<template>
  <div class="retro-panel overflow-hidden">
    <div class="retro-titlebar rounded-t-2xl">
      <h2 class="retro-title">노선별 1마일 가치 비교</h2>
    </div>

    <div class="retro-panel-content space-y-2.5">
      <div
        v-for="item in topValues"
        :key="`${item.routeId}-${item.seatClass}`"
        class="flex items-center gap-3"
      >
        <div class="w-28 shrink-0 text-caption font-medium text-foreground">
          {{ item.routeLabel }} {{ item.seatClassLabel }}
        </div>
        <div class="h-6 flex-1 overflow-hidden rounded-md bg-muted/50">
          <div
            class="h-full rounded-md transition-all duration-500 ease-out"
            :class="item.canRedeem ? 'bg-savings/80' : 'bg-status-warning/80'"
            :style="{ width: `${Math.max((item.valuePerMile / maxValue) * 100, 8)}%` }"
          />
        </div>
        <div
          class="w-24 shrink-0 text-right text-caption font-bold tabular-nums"
          :class="item.canRedeem ? 'text-savings' : 'text-status-warning'"
        >
          {{ formatValuePerMile(item.valuePerMile) }}
        </div>
      </div>
    </div>
  </div>
</template>
