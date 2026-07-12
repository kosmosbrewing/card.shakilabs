<script setup lang="ts">
import { computed } from "vue";
import RankedBars from "@/components/result-visualization/RankedBars.vue";
import type { AnnualFeeCalcResult } from "@/utils/annualFeeCalculator";
import { formatBreakEven } from "@/utils/annualFeeCalculator";

const props = defineProps<{ results: AnnualFeeCalcResult[] }>();
const fastestMonths = computed(() => Math.min(
  ...props.results.map((result) => result.breakEvenMonths ?? Number.POSITIVE_INFINITY),
));
const items = computed(() => props.results.map((result) => ({
  key: result.cardId,
  label: result.card.issuer,
  value: result.breakEvenMonths,
  highlight: result.breakEvenMonths === fastestMonths.value,
  tone: result.breakEvenMonths === null ? "negative" as const : "primary" as const,
})));
</script>

<template>
  <RankedBars
    title="카드별 연회비 회수 기간"
    note="막대 길이는 회수 개월 수에 직접 비례하며 짧을수록 빠릅니다. 회수 불가는 막대를 표시하지 않습니다."
    :items="items"
    :format-value="formatBreakEven"
  />
</template>
