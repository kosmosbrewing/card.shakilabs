<script setup lang="ts">
import { computed } from "vue";
import RankedBars from "@/components/result-visualization/RankedBars.vue";
import type { MileageValuePerMile } from "@/utils/mileageCalculator";
import { formatValuePerMile } from "@/utils/mileageCalculator";

const props = defineProps<{ values: MileageValuePerMile[] }>();
const items = computed(() => props.values.slice(0, 8).map((item, index) => ({
  key: `${item.routeId}-${item.seatClass}`,
  label: `${item.routeLabel} ${item.seatClassLabel}`,
  value: item.valuePerMile,
  highlight: index === 0,
  tone: item.hasEnoughMiles ? "positive" as const : "warning" as const,
  detail: item.hasEnoughMiles ? "현재 마일리지로 발권 가능" : "마일리지 부족",
})));
const formatValue = (value: number | null) => formatValuePerMile(value ?? 0);
</script>

<template>
  <RankedBars
    title="노선별 1마일 가치 비교"
    note="막대 길이는 1마일당 예상 가치에 직접 비례하며 발권 가능 여부는 설명으로 함께 표시합니다."
    :items="items"
    :format-value="formatValue"
  />
</template>
