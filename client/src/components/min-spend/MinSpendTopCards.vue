<script setup lang="ts">
import type { MinSpendCalcResult } from "@/utils/minSpendCalculator";
import MinSpendResultCard from "./MinSpendResultCard.vue";

defineProps<{
  cards: MinSpendCalcResult[];
}>();
</script>

<template>
  <div class="space-y-3">
    <div class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h2 class="retro-title">TOP {{ cards.length }} 추천 카드</h2>
      </div>
    </div>

    <MinSpendResultCard
      v-if="cards[0]"
      :result="cards[0]"
      :rank="1"
    />

    <div v-if="cards.length > 1" class="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <MinSpendResultCard
        v-for="(card, index) in cards.slice(1)"
        :key="card.cardId"
        :result="card"
        :rank="index + 2"
      />
    </div>
  </div>
</template>
