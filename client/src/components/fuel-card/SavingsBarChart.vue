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
// 0은 부호를 붙이지 않는다 — 축 눈금(0원 기준선)에 "+0원"이 찍히는 것을 막는다.
const formatWon = (value: number) =>
  `${value > 0 ? "+" : value < 0 ? "-" : ""}${Math.abs(value).toLocaleString()}원`;
</script>

<template>
  <DivergingBars
    title="연간 절약액 비교"
    metric-label="연간 절약액"
    :items="items"
    :format-value="formatWon"
  />
</template>
