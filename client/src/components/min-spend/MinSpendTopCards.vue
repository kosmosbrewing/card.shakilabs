<script setup lang="ts">
import type { MinSpendCalcResult } from "@/utils/minSpendCalculator";
import MinSpendResultCard from "./MinSpendResultCard.vue";

withDefaults(
  defineProps<{
    cards: MinSpendCalcResult[];
    /** 1×2 틀에서 나눠 그릴 때: "top" = 제목 + 1위(결과 칸), "rest" = 2~3위(틀 아래 전폭). 기본은 전부 */
    part?: "all" | "top" | "rest";
    /** 2~3위를 반폭 칸(아래 2열 묶음)에 둘 때 lg에서 한 줄씩 — 반폭에서 2열이면 카드당 약 260px라 수치 줄이 비좁다 */
    stack?: boolean;
  }>(),
  { part: "all", stack: false },
);
</script>

<template>
  <div class="space-y-3">
    <div v-if="part !== 'rest'" class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h2 class="retro-title">TOP {{ cards.length }} 추천 카드</h2>
      </div>
    </div>

    <MinSpendResultCard
      v-if="part !== 'rest' && cards[0]"
      :result="cards[0]"
      :rank="1"
    />

    <div v-if="part !== 'top' && cards.length > 1" class="grid grid-cols-1 gap-3 sm:grid-cols-2" :class="{ 'lg:grid-cols-1': stack }">
      <MinSpendResultCard
        v-for="(card, index) in cards.slice(1)"
        :key="card.cardId"
        :result="card"
        :rank="index + 2"
      />
    </div>
  </div>
</template>
