<script setup lang="ts">
import { computed, useId } from "vue";
import { normalizeSegments } from "@/utils/chartMath";

type Segment = { key: string; label: string; value: number; tone: "primary" | "warning" };
const props = defineProps<{
  title: string;
  segments: readonly Segment[];
  formatValue: (value: number) => string;
}>();

const titleId = `breakdown-bar-${useId()}`;
const ratios = computed(() => normalizeSegments(props.segments.map((segment) => segment.value)));
const offsets = computed(() => ratios.value.map((_, index) =>
  ratios.value.slice(0, index).reduce((sum, ratio) => sum + ratio, 0),
));
</script>

<template>
  <section class="retro-panel overflow-hidden" :aria-labelledby="titleId">
    <div class="retro-titlebar rounded-t-2xl">
      <h2 :id="titleId" class="retro-title">{{ title }}</h2>
    </div>
    <div class="retro-panel-content space-y-4">
      <svg v-if="ratios.some((ratio) => ratio > 0)" viewBox="0 0 100 18" preserveAspectRatio="none" class="h-5 w-full overflow-hidden rounded-lg" role="img" :aria-label="title">
        <rect
          v-for="(segment, index) in segments"
          :key="segment.key"
          :x="offsets[index] * 100"
          :width="ratios[index] * 100"
          height="18"
          :class="segment.tone === 'warning' ? 'fill-status-warning' : 'fill-primary'"
        />
      </svg>
      <p v-else class="text-caption text-muted-foreground">과세 기준 이하라 관부가세가 없습니다.</p>
      <dl class="grid gap-2 sm:grid-cols-2">
        <div v-for="segment in segments" :key="`${segment.key}-legend`" class="flex items-center justify-between gap-3 rounded-lg bg-muted/35 px-3 py-2">
          <dt class="text-caption text-muted-foreground">{{ segment.label }}</dt>
          <dd class="text-caption font-semibold tabular-nums">{{ formatValue(segment.value) }}</dd>
        </div>
      </dl>
    </div>
  </section>
</template>
