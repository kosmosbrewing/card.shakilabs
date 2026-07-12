<script setup lang="ts">
import { computed } from "vue";
import ProgressBars from "@/components/result-visualization/ProgressBars.vue";
import type { MinSpendCalcResult } from "@/utils/minSpendCalculator";

const props = defineProps<{ results: MinSpendCalcResult[] }>();
const items = computed(() => props.results.map((result) => ({
  key: result.cardId,
  label: result.card.issuer,
  rate: result.qualificationRate,
})));
</script>

<template>
  <ProgressBars title="카드별 실적 달성률" :items="items" />
</template>
