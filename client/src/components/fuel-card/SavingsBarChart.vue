<script setup lang="ts">
import { computed } from "vue";
import DivergingBars from "@/components/result-visualization/DivergingBars.vue";
import type { FuelCardCalcResult } from "@/utils/calculator";

const props = defineProps<{ results: FuelCardCalcResult[] }>();
const items = computed(() => props.results.map((result) => ({
  key: result.cardId,
  label: result.card.issuer,
  value: result.annualNet,
})));
const formatWon = (value: number) => `${value >= 0 ? "+" : "-"}${Math.abs(value).toLocaleString()}원`;
</script>

<template>
  <DivergingBars title="연간 절약액 비교" :items="items" :format-value="formatWon" />
</template>
