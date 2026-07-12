<script setup lang="ts">
import { computed, useId } from "vue";
import { positiveBarWidth } from "@/utils/chartMath";

type BarTone = "primary" | "positive" | "negative" | "warning";
type BarItem = {
  key: string;
  label: string;
  value: number | null;
  detail?: string;
  highlight?: boolean;
  tone?: BarTone;
};

const props = defineProps<{
  title: string;
  note: string;
  items: readonly BarItem[];
  formatValue: (value: number | null) => string;
}>();

const titleId = `ranked-bars-${useId()}`;
const maximum = computed(() => Math.max(
  ...props.items.map((item) => item.value ?? 0).filter(Number.isFinite),
  0,
));

function fillClass(item: BarItem): string {
  if (item.tone === "positive") return "fill-savings";
  if (item.tone === "negative") return "fill-loss";
  if (item.tone === "warning") return "fill-status-warning";
  return item.highlight ? "fill-savings" : "fill-primary/65";
}
</script>

<template>
  <section class="retro-panel overflow-hidden" :aria-labelledby="titleId">
    <div class="retro-titlebar rounded-t-2xl">
      <h2 :id="titleId" class="retro-title">{{ title }}</h2>
    </div>
    <div class="retro-panel-content space-y-4">
      <p class="text-tiny leading-relaxed text-muted-foreground">{{ note }}</p>
      <ol class="space-y-3">
        <li v-for="item in items" :key="item.key" class="space-y-1.5">
          <div class="flex min-w-0 items-baseline justify-between gap-3">
            <span class="min-w-0 text-caption font-semibold text-foreground">{{ item.label }}</span>
            <strong class="shrink-0 text-caption tabular-nums" :class="item.highlight ? 'text-savings' : 'text-foreground'">
              {{ formatValue(item.value) }}
            </strong>
          </div>
          <div class="h-3 overflow-hidden rounded-full bg-muted/50">
            <svg viewBox="0 0 100 12" preserveAspectRatio="none" class="block h-full w-full" aria-hidden="true">
              <rect
                :width="positiveBarWidth(item.value, maximum)"
                height="12"
                rx="4"
                :class="fillClass(item)"
              />
            </svg>
          </div>
          <p v-if="item.detail" class="text-tiny text-muted-foreground">{{ item.detail }}</p>
        </li>
      </ol>
    </div>
  </section>
</template>
