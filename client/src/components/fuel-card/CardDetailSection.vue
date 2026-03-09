<script setup lang="ts">
import type { FuelCardCalcResult } from "@/utils/calculator";
import { formatDiscountDetail, formatDiscountType } from "@/utils/calculator";

defineProps<{
  results: FuelCardCalcResult[];
}>();
</script>

<template>
  <div class="retro-panel overflow-hidden">
    <div class="retro-titlebar rounded-t-2xl">
      <h2 class="retro-title">카드별 할인 구조</h2>
    </div>

    <div class="retro-panel-content space-y-2">
      <div
        v-for="r in results"
        :key="r.cardId"
        class="retro-panel-muted p-3.5 space-y-2"
      >
        <!-- 카드 헤더 -->
        <div class="flex items-center gap-2">
          <span
            class="inline-block h-3 w-3 rounded-sm"
            :style="{ backgroundColor: r.card.issuerColor }"
          />
          <span class="text-body font-bold">{{ r.card.issuer }}</span>
          <span class="text-body text-muted-foreground">{{ r.card.name }}</span>
        </div>

        <!-- 할인 구조 설명 -->
        <p class="text-caption text-foreground leading-relaxed">
          {{ formatDiscountDetail(r) }}
        </p>

        <!-- 추가 혜택 -->
        <div v-if="r.card.extras.length > 0" class="flex flex-wrap gap-1.5">
          <span
            v-for="extra in r.card.extras"
            :key="extra"
            class="rounded-full border border-border/60 bg-background/60 px-2 py-0.5 text-tiny text-muted-foreground"
          >
            {{ extra }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
