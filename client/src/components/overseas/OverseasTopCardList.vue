<script setup lang="ts">
import type { OverseasCalcResult } from "@/utils/overseasCalculator";
import OverseasCardResultCard from "./OverseasCardResultCard.vue";

defineProps<{
  cards: OverseasCalcResult[];
}>();
</script>

<template>
  <div class="space-y-3">
    <div class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h2 class="retro-title">TOP {{ cards.length }} 추천 카드</h2>
      </div>
    </div>

    <OverseasCardResultCard
      v-if="cards[0]"
      :result="cards[0]"
      :rank="1"
    />

    <div v-if="cards.length > 1" class="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <OverseasCardResultCard
        v-for="(card, idx) in cards.slice(1)"
        :key="card.cardId"
        :result="card"
        :rank="idx + 2"
      />
    </div>
  </div>
</template>
