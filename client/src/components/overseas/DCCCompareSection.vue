<script setup lang="ts">
import type { OverseasCalcResult } from "@/utils/overseasCalculator";

defineProps<{
  result: OverseasCalcResult;
  currencyCode: string;
  currencySymbol: string;
}>();
</script>

<template>
  <div class="retro-panel overflow-hidden">
    <div class="retro-titlebar rounded-t-2xl">
      <h2 class="retro-title">DCC(원화결제) vs 현지통화 결제</h2>
    </div>

    <div class="grid gap-px bg-border/60 sm:grid-cols-2">
      <div class="bg-card p-4 sm:p-5">
        <p class="mb-3 text-caption font-semibold text-muted-foreground">현지통화 결제</p>
        <div class="space-y-1.5 text-body">
          <p class="tabular-nums">
            {{ currencySymbol }}{{ result.foreignAmount.toLocaleString() }} × {{ result.exchangeRate.toLocaleString() }}원
          </p>
          <p class="tabular-nums text-muted-foreground">
            기준 환산 {{ result.baseKrwAmount.toLocaleString() }}원
          </p>
          <p class="tabular-nums text-muted-foreground">
            + 해외수수료 {{ result.cardFeeAmount.toLocaleString() }}원
          </p>
          <p class="tabular-nums text-emerald-600 dark:text-emerald-400">
            - 혜택 {{ result.benefitAmount.toLocaleString() }}원
          </p>
          <p class="border-t border-border/60 pt-2 text-heading font-bold tabular-nums text-foreground">
            = {{ result.localCurrencyNet.toLocaleString() }}원
          </p>
        </div>
      </div>

      <div class="bg-muted/15 p-4 sm:p-5">
        <p class="mb-3 text-caption font-semibold text-muted-foreground">DCC 원화결제</p>
        <div class="space-y-1.5 text-body">
          <p class="tabular-nums">
            {{ currencySymbol }}{{ result.foreignAmount.toLocaleString() }} × {{ result.dccExchangeRate.toLocaleString(undefined, { maximumFractionDigits: 1 }) }}원
          </p>
          <p class="tabular-nums text-muted-foreground">
            DCC 마크업 {{ (result.dccMarkupRate * 100).toFixed(1) }}% 포함
          </p>
          <p class="tabular-nums text-muted-foreground">
            해외 카드 혜택 미반영 가정
          </p>
          <p class="border-t border-border/60 pt-2 text-heading font-bold tabular-nums text-foreground">
            = {{ result.dccTotal.toLocaleString() }}원
          </p>
        </div>
      </div>
    </div>

    <div class="border-t border-border/60 bg-rose-50/60 px-4 py-3 text-body font-semibold text-rose-700 dark:bg-rose-950/20 dark:text-rose-300 sm:px-5">
      {{ currencyCode }} 결제를 DCC로 바꾸면 {{ result.dccDifference.toLocaleString() }}원({{ (result.dccDifferenceRate * 100).toFixed(1) }}%) 더 비쌉니다.
    </div>
  </div>
</template>
