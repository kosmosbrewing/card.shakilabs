<script setup lang="ts">
import { computed } from "vue";
import RankedBars from "@/components/result-visualization/RankedBars.vue";
import type { DutyFreeCategory } from "@/data/dutyFreeRates";
import { calculateDutyFree } from "@/utils/dutyFreeCalculator";

const props = defineProps<{ purchaseAmountUsd: number; category: DutyFreeCategory }>();
const sampleAmounts = computed(() => [...new Set([400, 800, 1200, 1600, Math.round(props.purchaseAmountUsd)])]
  .sort((left, right) => left - right));
const results = computed(() => sampleAmounts.value.map((amount) =>
  calculateDutyFree({ purchaseAmountUsd: amount, category: props.category })));
const items = computed(() => results.value.map((result) => ({
  key: String(result.purchaseAmountUsd),
  label: `$${result.purchaseAmountUsd.toLocaleString()}`,
  value: result.finalTax,
  tone: result.finalTax === 0 ? "positive" as const : "negative" as const,
  highlight: result.finalTax === 0,
})));
const formatTax = (value: number | null) => `${(value ?? 0).toLocaleString()}원`;
</script>

<template>
  <RankedBars
    title="구매 금액별 예상 세금"
    note="세액 0원은 막대 길이도 0으로 표시하며, 나머지는 가장 큰 예상 세액을 기준으로 비교합니다."
    :items="items"
    :format-value="formatTax"
  />
</template>
