<script setup lang="ts">
import { Globe2, Share2 } from "lucide-vue-next";
import { computed, ref } from "vue";
import FreshBadge from "@/components/common/FreshBadge.vue";
import {
  DCC_MARKUP,
  EXCHANGE_RATES,
  EXTRA_CURRENCIES,
  POPULAR_CURRENCIES,
  getExchangeRate,
  type Currency,
} from "@/data/exchangeRates";

const props = defineProps<{
  currency: Currency;
  foreignAmount: number;
  dccMarkupRate: number;
}>();

const emit = defineEmits<{
  "update:currency": [value: Currency];
  "update:foreignAmount": [value: number];
  "update:dccMarkupRate": [value: number];
  shareRequest: [];
}>();

const showAdvanced = ref(false);
const showExtraCurrencies = ref(false);
const STEP = 50;
const MIN = 10;
const MAX = 2000;
const selectedExtraCurrency = computed(() =>
  EXTRA_CURRENCIES.some((item) => item === props.currency) ? props.currency : ""
);

function handleAmountInput(event: Event) {
  const value = Number((event.target as HTMLInputElement).value.replace(/[^0-9.]/g, ""));
  if (Number.isFinite(value) && value >= 0) {
    emit("update:foreignAmount", value);
  }
}

function handleDccSlider(event: Event) {
  const value = Number((event.target as HTMLInputElement).value);
  if (Number.isFinite(value)) {
    emit("update:dccMarkupRate", value / 100);
  }
}

function handleDccInput(event: Event) {
  const value = Number((event.target as HTMLInputElement).value.replace(/[^0-9.]/g, ""));
  if (Number.isFinite(value) && value >= 0) {
    emit("update:dccMarkupRate", value / 100);
  }
}
</script>

<template>
  <div class="retro-panel overflow-hidden">
    <div class="retro-titlebar rounded-t-2xl">
      <h1 class="retro-title flex items-center gap-2">
        <Globe2 class="h-5 w-5 text-primary" />
        해외결제 카드 + DCC 비교
      </h1>
      <button
        type="button"
        class="inline-flex items-center gap-1.5 rounded border border-border/70 bg-background/70 px-2.5 py-1 text-caption font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
        @click="emit('shareRequest')"
      >
        <Share2 class="h-3.5 w-3.5" />
        <span>공유</span>
      </button>
    </div>

    <div class="retro-panel-content space-y-3">
      <!-- 통화 선택 -->
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="item in POPULAR_CURRENCIES"
          :key="item"
          type="button"
          :class="[
            'rounded-lg border px-3 py-1.5 text-caption font-semibold transition-colors',
            currency === item
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-border/70 text-muted-foreground hover:border-primary/50 hover:text-primary',
          ]"
          @click="emit('update:currency', item)"
        >
          {{ item }}
        </button>
        <button
          type="button"
          class="rounded-lg border border-border/70 px-3 py-1.5 text-caption font-semibold text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
          @click="showExtraCurrencies = !showExtraCurrencies"
        >
          통화+
        </button>
      </div>

      <!-- 금액 입력: [−] input [+] -->
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border text-lg font-bold text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          aria-label="50 감소"
          @click="emit('update:foreignAmount', Math.max(MIN, foreignAmount - STEP))"
        >−</button>
        <div class="relative flex-1">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-body font-semibold text-muted-foreground">
            {{ getExchangeRate(currency).symbol }}
          </span>
          <input
            type="text"
            inputmode="decimal"
            class="retro-input !pl-10 text-right tabular-nums"
            :value="foreignAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })"
            @input="handleAmountInput"
          />
        </div>
        <button
          type="button"
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border text-lg font-bold text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          aria-label="50 증가"
          @click="emit('update:foreignAmount', Math.min(MAX, foreignAmount + STEP))"
        >+</button>
      </div>

      <!-- 금액 슬라이더 -->
      <input
        type="range"
        :min="MIN"
        :max="MAX"
        step="10"
        class="retro-range"
        :value="Math.min(Math.max(foreignAmount, MIN), MAX)"
        @input="emit('update:foreignAmount', Number(($event.target as HTMLInputElement).value))"
      />

      <!-- 기타 통화 (접기) -->
      <div v-if="showExtraCurrencies" class="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        <button
          v-for="item in EXTRA_CURRENCIES"
          :key="item"
          type="button"
          :class="[
            'rounded-lg border px-2 py-1.5 text-caption font-medium transition-colors',
            selectedExtraCurrency === item
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-border/70 text-muted-foreground hover:border-primary/50 hover:text-primary',
          ]"
          @click="emit('update:currency', item)"
        >
          <span class="block">{{ item }}</span>
          <span class="block text-tiny text-muted-foreground/80">
            {{ getExchangeRate(item).label }}
          </span>
        </button>
      </div>

      <!-- DCC 설정 + 환율 기준 통합 -->
      <div class="flex flex-wrap items-center justify-between gap-2">
        <details class="retro-details flex-1" :open="showAdvanced || undefined">
          <summary class="retro-details-summary !min-h-0 !py-1.5" @click.prevent="showAdvanced = !showAdvanced">
            <span>DCC 고급 설정</span>
            <span class="retro-details-chevron" :class="showAdvanced && 'rotate-180'">▼</span>
          </summary>
          <div v-if="showAdvanced" class="space-y-3 px-3 py-3">
            <div class="space-y-2">
              <div class="flex items-center justify-between gap-3">
                <label class="text-caption font-semibold text-muted-foreground">DCC 마크업</label>
                <span class="text-caption font-semibold tabular-nums text-foreground">
                  {{ (dccMarkupRate * 100).toFixed(1) }}%
                </span>
              </div>
              <input
                type="range"
                min="3"
                max="8"
                step="0.5"
                class="retro-range"
                :value="dccMarkupRate * 100"
                @input="handleDccSlider"
              />
            </div>
            <div class="space-y-1.5">
              <label class="text-tiny font-semibold text-muted-foreground">직접 입력</label>
              <div class="relative">
                <input
                  type="text"
                  inputmode="decimal"
                  class="retro-input !pr-10 text-right tabular-nums"
                  :value="(dccMarkupRate * 100).toFixed(1)"
                  @input="handleDccInput"
                />
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-caption text-muted-foreground">%</span>
              </div>
              <p class="text-tiny text-muted-foreground">
                일반적으로 {{ (DCC_MARKUP.typicalMinRate * 100).toFixed(0) }}~{{ (DCC_MARKUP.typicalMaxRate * 100).toFixed(0) }}% 범위에서 제시됩니다.
              </p>
            </div>
          </div>
        </details>
        <FreshBadge :message="`${EXCHANGE_RATES.lastUpdated} ${getExchangeRate(currency).unit}${currency}=${getExchangeRate(currency).rate.toLocaleString()}원`" />
      </div>
    </div>
  </div>
</template>
