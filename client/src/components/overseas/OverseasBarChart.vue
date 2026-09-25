<script setup lang="ts">
import { computed } from "vue";
import type { GapBarItem } from "@shakilabs/ui";
import GapBars from "@/components/result-visualization/GapBars.vue";
import type { OverseasCalcResult } from "@/utils/overseasCalculator";

const props = defineProps<{ results: OverseasCalcResult[] }>();

// 카드 간 실부담은 결제액이 같아 수천 원 차이로 모인다 — 0부터 그리면 막대가 전부 같은 길이였다.
// 1위(최저 부담) 대비 더 내는 금액을 막대로 그린다.
const items = computed<GapBarItem[]>(() => props.results.map((result) => ({
  key: result.cardId,
  // 발급사만 쓰면 같은 발급사의 카드가 같은 이름으로 두 번 나온다 — 결과 카드·비교표와 같은 "발급사 카드명"
  label: `${result.card.issuer} ${result.card.name}`,
  value: result.localCurrencyNet,
})));
const formatWon = (value: number) => `${value.toLocaleString()}원`;
</script>

<template>
  <GapBars
    title="카드별 실부담 비교"
    note="막대는 1위(최저 부담)보다 더 내는 원화 금액입니다. 오른쪽 숫자가 카드별 실제 부담액입니다."
    :items="items"
    :format-value="formatWon"
    better="lower"
  />
</template>
