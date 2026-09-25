<script setup lang="ts">
import type { FuelCardCalcResult } from "@/utils/calculator";
import CardResultCard from "./CardResultCard.vue";

withDefaults(
  defineProps<{
    cards: FuelCardCalcResult[];
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

    <!-- 1위: 풀 너비 -->
    <CardResultCard
      v-if="part !== 'rest' && cards[0]"
      :result="cards[0]"
      :rank="1"
    />

    <!-- 2~3위: 2컬럼 -->
    <div v-if="part !== 'top' && cards.length > 1" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <CardResultCard
        v-for="(card, idx) in cards.slice(1)"
        :key="card.cardId"
        :result="card"
        :rank="idx + 2"
      />
    </div>
  </div>
</template>
