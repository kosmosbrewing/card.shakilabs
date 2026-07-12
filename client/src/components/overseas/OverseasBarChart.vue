<script setup lang="ts">
import { computed } from "vue";
import RankedBars from "@/components/result-visualization/RankedBars.vue";
import type { OverseasCalcResult } from "@/utils/overseasCalculator";

const props = defineProps<{ results: OverseasCalcResult[] }>();
const minimum = computed(() => Math.min(...props.results.map((result) => result.localCurrencyNet)));
const items = computed(() => props.results.map((result) => ({
  key: result.cardId,
  label: result.card.issuer,
  value: result.localCurrencyNet,
  highlight: result.localCurrencyNet === minimum.value,
  tone: result.localCurrencyNet === minimum.value ? "positive" as const : "primary" as const,
})));
const formatWon = (value: number | null) => `${(value ?? 0).toLocaleString()}원`;
</script>

<template>
  <RankedBars
    title="카드별 실부담 비교"
    note="막대 길이는 실제 원화 부담액에 직접 비례하며 짧을수록 유리합니다."
    :items="items"
    :format-value="formatWon"
  />
</template>
