<script setup lang="ts">
import type { MinSpendCalcResult } from "@/utils/minSpendCalculator";
import MinSpendResultCard from "./MinSpendResultCard.vue";

withDefaults(
  defineProps<{
    cards: MinSpendCalcResult[];
    /** 1×2 틀에서 나눠 그릴 때: "top" = 제목 + 1위(결과 칸), "rest" = 2~3위(틀 아래 전폭). 기본은 전부 */
    part?: "all" | "top" | "rest";
  }>(),
  { part: "all" },
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

    <div v-if="part !== 'top' && cards.length > 1" class="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <MinSpendResultCard
        v-for="(card, index) in cards.slice(1)"
        :key="card.cardId"
        :result="card"
        :rank="index + 2"
      />
    </div>
  </div>
</template>
