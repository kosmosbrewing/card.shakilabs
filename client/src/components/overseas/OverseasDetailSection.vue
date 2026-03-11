<script setup lang="ts">
import { formatFeeRate, formatPaymentBreakdown, formatPrimaryBenefit, type OverseasCalcResult } from "@/utils/overseasCalculator";

defineProps<{
  results: OverseasCalcResult[];
}>();
</script>

<template>
  <div class="retro-panel overflow-hidden">
    <div class="retro-titlebar rounded-t-2xl">
      <h2 class="retro-title">카드별 수수료 구조</h2>
    </div>

    <div class="retro-panel-content space-y-2">
      <div
        v-for="result in results"
        :key="result.cardId"
        class="retro-panel-muted space-y-2 p-3.5"
      >
        <div class="flex items-center gap-2">
          <span
            class="inline-block h-3 w-3 rounded-sm"
            :style="{ backgroundColor: result.card.issuerColor }"
          />
          <span class="text-body font-bold">{{ result.card.issuer }}</span>
          <span class="text-body text-muted-foreground">{{ result.card.name }}</span>
        </div>

        <p class="text-caption leading-relaxed text-foreground">
          {{ formatPaymentBreakdown(result) }}
        </p>

        <div class="flex flex-wrap gap-1.5">
          <span class="rounded-full border border-border/60 bg-background/60 px-2 py-0.5 text-tiny text-muted-foreground">
            {{ formatFeeRate(result.card) }}
          </span>
          <span class="rounded-full border border-border/60 bg-background/60 px-2 py-0.5 text-tiny text-muted-foreground">
            {{ formatPrimaryBenefit(result.card) }}
          </span>
          <span
            v-for="extra in result.card.extras"
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
