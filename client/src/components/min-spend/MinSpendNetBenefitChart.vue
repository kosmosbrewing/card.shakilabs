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
// 0은 부호를 붙이지 않는다 — 축 눈금(0원 기준선)에 "+0원"이 찍히는 것을 막는다.
const formatWon = (value: number) =>
  `${value > 0 ? "+" : value < 0 ? "-" : ""}${Math.abs(value).toLocaleString()}원`;
</script>

<template>
  <DivergingBars
    title="추가 지출 포함 순혜택"
    metric-label="월 순혜택"
    :items="items"
    :format-value="formatWon"
  />
</template>
