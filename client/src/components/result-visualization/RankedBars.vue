<script setup lang="ts">
// 차트 본체는 @shakilabs/ui ShRankedBars — 이 파일은 card retro 크롬과 톤 변환만 담당한다.
// 호출부 5곳의 props(문자열 톤·value null 허용)는 그대로 유지한다.
import { computed } from "vue";
import { ShRankedBars } from "@shakilabs/ui";
import type { ChartTone, RankedBarItem } from "@shakilabs/ui";

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

// 승격 전 fillClass와 같은 우선순위를 유지한다: 의미 톤(positive·negative·warning)은 그대로 넘기고,
// primary·미지정은 톤을 비워 highlight가 색을 정하게 둔다(승격 전에도 highlight가 primary보다 우선했다).
function toChartTone(tone: BarTone | undefined): ChartTone | undefined {
  if (tone === "positive") return "success";
  if (tone === "negative") return "danger";
  if (tone === "warning") return "warning";
  return undefined;
}

const barItems = computed<RankedBarItem[]>(() => props.items.map((item) => ({
  key: item.key,
  label: item.label,
  value: item.value,
  detail: item.detail,
  highlight: item.highlight,
  tone: toChartTone(item.tone),
})));
</script>

<template>
  <section class="retro-panel overflow-hidden">
    <ShRankedBars
      class="px-4 pb-3 sm:px-5 sm:pb-4"
      :items="barItems"
      :note="note"
      :format-value="formatValue"
      highlight-tone="success"
    >
      <template #header="{ titleId }">
        <!-- 타이틀바는 패널 폭 전체를 채워야 해서 본문 좌우 여백을 음수 마진으로 되돌린다. -->
        <div class="retro-titlebar -mx-4 mb-3 rounded-t-2xl sm:-mx-5 sm:mb-4">
          <h2 :id="titleId" class="retro-title">{{ title }}</h2>
        </div>
      </template>
    </ShRankedBars>
  </section>
</template>
