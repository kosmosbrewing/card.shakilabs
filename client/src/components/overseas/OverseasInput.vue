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
import { DCC_MARKUP_MAX_PERCENT, DCC_MARKUP_MIN_PERCENT } from "@/lib/validators";

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
const foreignAmountInputId = "overseas-amount";
const dccInputId = "overseas-dcc";
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
        class="retro-titlebar-button"
        @click="emit('shareRequest')"
      >
        <Share2 class="h-3.5 w-3.5" />
        <span>공유</span>
      </button>
    </div>

    <div class="retro-panel-content space-y-4">
      <!-- 통화 + 금액 입력 (2컬럼) -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div class="space-y-1.5">
          <p class="text-caption font-semibold text-muted-foreground">통화</p>
          <div class="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
            <button
              v-for="item in POPULAR_CURRENCIES"
              :key="item"
              type="button"
              :class="[
                'retro-choice-button',
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
              class="retro-choice-button border-border/70 text-muted-foreground hover:border-primary/50 hover:text-primary"
              @click="showExtraCurrencies = !showExtraCurrencies"
            >
              통화+
            </button>
          </div>
        </div>

        <div class="space-y-1.5">
          <label :for="foreignAmountInputId" class="text-caption font-semibold text-muted-foreground">
            결제 금액
          </label>
          <div class="retro-stepper">
            <button
              type="button"
              class="retro-stepper-button"
              aria-label="50 감소"
              @click="emit('update:foreignAmount', Math.max(MIN, foreignAmount - STEP))"
            >−</button>
            <div class="retro-stepper-field">
              <span class="retro-input-affix retro-input-affix-left retro-input-affix-currency text-body font-semibold">
                {{ getExchangeRate(currency).symbol }}
              </span>
              <input
                :id="foreignAmountInputId"
                type="text"
                inputmode="decimal"
                class="retro-stepper-input retro-stepper-input-left"
                :value="foreignAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })"
                @input="handleAmountInput"
              />
            </div>
            <button
              type="button"
              class="retro-stepper-button"
              aria-label="50 증가"
              @click="emit('update:foreignAmount', Math.min(MAX, foreignAmount + STEP))"
            >+</button>
          </div>
        </div>
      </div>

      <!-- 금액 슬라이더 (full width) -->
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
            'retro-choice-button retro-choice-button-compact',
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
                <p class="text-caption font-semibold text-muted-foreground">DCC 마크업</p>
                <span class="text-caption font-semibold tabular-nums text-foreground">
                  {{ (dccMarkupRate * 100).toFixed(1) }}%
                </span>
              </div>
              <input
                type="range"
                :min="DCC_MARKUP_MIN_PERCENT"
                :max="DCC_MARKUP_MAX_PERCENT"
                step="0.5"
                class="retro-range"
                :value="dccMarkupRate * 100"
                @input="handleDccSlider"
              />
            </div>
            <div class="space-y-1.5">
              <label :for="dccInputId" class="text-tiny font-semibold text-muted-foreground">
                직접 입력
              </label>
              <div class="relative">
                <input
                  :id="dccInputId"
                  type="text"
                  inputmode="decimal"
                  class="retro-input retro-input-with-right-affix text-right tabular-nums"
                  :value="(dccMarkupRate * 100).toFixed(1)"
                  @input="handleDccInput"
                />
                <span class="retro-input-affix retro-input-affix-right retro-input-affix-wide">%</span>
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
