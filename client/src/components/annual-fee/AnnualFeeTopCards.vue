<script setup lang="ts">
import type { AnnualFeeCalcResult } from "@/utils/annualFeeCalculator";
import AnnualFeeResultCard from "./AnnualFeeResultCard.vue";

defineProps<{
  cards: AnnualFeeCalcResult[];
}>();
</script>

<template>
  <div class="space-y-3">
    <div class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h2 class="retro-title">TOP {{ cards.length }} 연회비 회수 후보</h2>
      </div>
    </div>

    <AnnualFeeResultCard
      v-if="cards[0]"
      :result="cards[0]"
      :rank="1"
    />

    <div v-if="cards.length > 1" class="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <AnnualFeeResultCard
        v-for="(card, index) in cards.slice(1)"
        :key="card.cardId"
        :result="card"
        :rank="index + 2"
      />
    </div>
  </div>
</template>
