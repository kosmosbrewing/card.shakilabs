<script setup lang="ts">
import { computed } from "vue";
import DivergingBars from "@/components/result-visualization/DivergingBars.vue";
import type { MinSpendCalcResult } from "@/utils/minSpendCalculator";

const props = defineProps<{ results: MinSpendCalcResult[] }>();
const items = computed(() => props.results.map((result) => ({
  key: result.cardId,
  label: result.card.issuer,
  value: result.netBenefitIncludingGap,
})));
const formatWon = (value: number) => `${value >= 0 ? "+" : "-"}${Math.abs(value).toLocaleString()}원`;
</script>

<template>
  <DivergingBars title="추가 지출 포함 순혜택" :items="items" :format-value="formatWon" />
</template>
