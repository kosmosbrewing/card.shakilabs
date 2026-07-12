<script setup lang="ts">
import { useId } from "vue";
import { progressBarWidth } from "@/utils/chartMath";

type ProgressItem = { key: string; label: string; rate: number };

defineProps<{ title: string; items: readonly ProgressItem[] }>();
const titleId = `progress-bars-${useId()}`;
</script>

<template>
  <section class="retro-panel overflow-hidden" :aria-labelledby="titleId">
    <div class="retro-titlebar rounded-t-2xl">
      <h2 :id="titleId" class="retro-title">{{ title }}</h2>
    </div>
    <div class="retro-panel-content space-y-4">
      <p class="text-tiny text-muted-foreground">막대 끝이 실적 100% 기준이며 초과 달성률은 숫자로 표시합니다.</p>
      <ul class="space-y-3">
        <li v-for="item in items" :key="item.key" class="space-y-1.5">
          <div class="flex items-baseline justify-between gap-3">
            <span class="text-caption font-semibold text-foreground">{{ item.label }}</span>
            <strong class="text-caption tabular-nums" :class="item.rate >= 1 ? 'text-savings' : 'text-status-warning'">
              {{ (item.rate * 100).toFixed(0) }}%
            </strong>
          </div>
          <div
            class="h-3 overflow-hidden rounded-full bg-muted/50"
            role="progressbar"
            :aria-label="`${item.label} 실적 달성률`"
            :aria-valuenow="Math.min(100, Math.max(0, item.rate * 100))"
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <svg viewBox="0 0 100 12" preserveAspectRatio="none" class="block h-full w-full" aria-hidden="true">
              <rect
                :width="progressBarWidth(item.rate)"
                height="12"
                rx="4"
                :class="item.rate >= 1 ? 'fill-savings' : item.rate >= 0.8 ? 'fill-status-warning' : 'fill-loss'"
              />
            </svg>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>
