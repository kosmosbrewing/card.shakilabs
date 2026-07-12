<script setup lang="ts">
import { computed, useId } from "vue";
import { divergingBarWidth } from "@/utils/chartMath";

type DivergingItem = { key: string; label: string; value: number };

const props = defineProps<{
  title: string;
  items: readonly DivergingItem[];
  formatValue: (value: number) => string;
}>();

const titleId = `diverging-bars-${useId()}`;
const maximumMagnitude = computed(() => Math.max(
  ...props.items.map((item) => Math.abs(item.value)).filter(Number.isFinite),
  0,
));

function barX(value: number): number {
  const width = divergingBarWidth(value, maximumMagnitude.value);
  return value < 0 ? 50 - width : 50;
}
</script>

<template>
  <section class="retro-panel overflow-hidden" :aria-labelledby="titleId">
    <div class="retro-titlebar rounded-t-2xl">
      <h2 :id="titleId" class="retro-title">{{ title }}</h2>
    </div>
    <div class="retro-panel-content space-y-4">
      <div class="flex justify-between text-tiny text-muted-foreground">
        <span>손실</span><span>0원</span><span>혜택</span>
      </div>
      <ul class="space-y-3">
        <li v-for="item in items" :key="item.key" class="space-y-1.5">
          <div class="flex items-baseline justify-between gap-3">
            <span class="text-caption font-semibold text-foreground">{{ item.label }}</span>
            <strong class="text-caption tabular-nums" :class="item.value < 0 ? 'text-loss' : 'text-savings'">
              {{ formatValue(item.value) }}
            </strong>
          </div>
          <div class="h-3 overflow-hidden rounded-full bg-muted/50">
            <svg viewBox="0 0 100 12" preserveAspectRatio="none" class="block h-full w-full" aria-hidden="true">
              <line x1="50" y1="0" x2="50" y2="12" class="stroke-foreground/40" />
              <rect
                v-if="item.value !== 0"
                :x="barX(item.value)"
                :width="divergingBarWidth(item.value, maximumMagnitude)"
                height="12"
                rx="3"
                :class="item.value < 0 ? 'fill-loss' : 'fill-savings'"
              />
            </svg>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>
