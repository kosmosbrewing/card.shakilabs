<script setup lang="ts">
import { ReceiptText } from "lucide-vue-next";
import {
  DUTY_FREE_CATEGORIES,
  DUTY_FREE_CONSTANTS,
  type DutyFreeCategory,
} from "@/data/dutyFreeRates";

defineProps<{
  purchaseAmountUsd: number;
  category: DutyFreeCategory;
}>();

const emit = defineEmits<{
  "update:purchaseAmountUsd": [value: number];
  "update:category": [value: DutyFreeCategory];
}>();

const STEP = 100;
const MIN = 100;
const MAX = 5000;

function handleAmountInput(event: Event) {
  const value = Number((event.target as HTMLInputElement).value.replace(/[^0-9.]/g, ""));
  emit("update:purchaseAmountUsd", Number.isFinite(value) ? value : 0);
}
</script>

<template>
  <div class="retro-panel overflow-hidden">
    <div class="retro-titlebar rounded-t-2xl">
      <h1 class="retro-title flex items-center gap-2">
        <ReceiptText class="h-5 w-5 text-primary" />
        면세 한도 초과 관세 계산기
      </h1>
    </div>

    <div class="retro-panel-content space-y-3">
      <!-- 구매 금액: [−] input [+] -->
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border text-lg font-bold text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          aria-label="$100 감소"
          @click="emit('update:purchaseAmountUsd', Math.max(MIN, purchaseAmountUsd - STEP))"
        >−</button>
        <div class="relative flex-1">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-body font-semibold text-muted-foreground">$</span>
          <input
            type="text"
            inputmode="decimal"
            class="retro-input !pl-8 text-right tabular-nums"
            :value="purchaseAmountUsd.toLocaleString()"
            @input="handleAmountInput"
          />
        </div>
        <button
          type="button"
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border text-lg font-bold text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          aria-label="$100 증가"
          @click="emit('update:purchaseAmountUsd', Math.min(MAX, purchaseAmountUsd + STEP))"
        >+</button>
      </div>

      <!-- 금액 슬라이더 -->
      <input
        type="range"
        :min="MIN"
        :max="MAX"
        step="50"
        class="retro-range"
        :value="Math.min(Math.max(purchaseAmountUsd, MIN), MAX)"
        @input="emit('update:purchaseAmountUsd', Number(($event.target as HTMLInputElement).value))"
      />

      <div class="space-y-1.5">
        <label class="text-caption font-semibold text-muted-foreground">물품 카테고리</label>
        <div class="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
          <button
            v-for="item in DUTY_FREE_CATEGORIES"
            :key="item.id"
            type="button"
            :class="[
              'rounded-lg border px-2.5 py-2 text-caption font-medium transition-colors',
              category === item.id
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border/70 text-muted-foreground hover:border-primary/50 hover:text-primary',
            ]"
            @click="emit('update:category', item.id)"
          >
            {{ item.label }}
          </button>
        </div>
      </div>

      <div class="retro-panel-muted flex items-center justify-between gap-3 px-4 py-3">
        <span class="text-caption font-semibold text-muted-foreground">기준 환율 / 면세 한도</span>
        <span class="text-caption font-semibold tabular-nums text-foreground">
          ${{ DUTY_FREE_CONSTANTS.exemptionLimitUsd }} / {{ DUTY_FREE_CONSTANTS.exchangeRate.toLocaleString() }}원
        </span>
      </div>
    </div>
  </div>
</template>
