<script setup lang="ts">
import { Globe2 } from "lucide-vue-next";
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
}>();

const showAdvanced = ref(false);
const quickAmounts = [50, 100, 200, 500];
const selectedExtraCurrency = computed(() =>
  EXTRA_CURRENCIES.some((item) => item === props.currency) ? props.currency : ""
);

function handleAmountInput(event: Event) {
  const value = Number((event.target as HTMLInputElement).value);
  if (Number.isFinite(value) && value > 0) {
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
  const value = Number((event.target as HTMLInputElement).value);
  if (Number.isFinite(value) && value >= 0) {
    emit("update:dccMarkupRate", value / 100);
  }
}

function handleExtraCurrencyChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value as Currency | "";
  if (value) {
    emit("update:currency", value);
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
    </div>

    <div class="retro-panel-content space-y-4">
      <div class="space-y-1.5">
        <label class="text-caption font-semibold text-muted-foreground">결제 통화</label>
        <div class="grid grid-cols-3 gap-2 sm:grid-cols-6">
          <button
            v-for="item in POPULAR_CURRENCIES"
            :key="item"
            type="button"
            :class="[
              'retro-button-subtle !px-2',
              currency === item && '!border-primary !bg-primary/10 !text-primary',
            ]"
            @click="emit('update:currency', item)"
          >
            {{ item }}
          </button>
        </div>
        <div class="space-y-1.5">
          <label class="text-tiny font-semibold text-muted-foreground">기타 통화</label>
          <select
            class="retro-input"
            :value="selectedExtraCurrency"
            @change="handleExtraCurrencyChange"
          >
            <option value="">기타 통화 선택</option>
            <option
              v-for="item in EXTRA_CURRENCIES"
              :key="item"
              :value="item"
            >
              {{ item }} · {{ getExchangeRate(item).label }}
            </option>
          </select>
        </div>
      </div>

      <div class="space-y-1.5">
        <label class="text-caption font-semibold text-muted-foreground">결제 금액</label>
        <div class="relative">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-body font-semibold text-muted-foreground">
            {{ getExchangeRate(currency).symbol }}
          </span>
          <input
            type="number"
            min="0"
            step="any"
            class="retro-input !pl-10 text-right tabular-nums"
            :value="foreignAmount"
            @input="handleAmountInput"
          />
        </div>
        <div class="grid grid-cols-4 gap-1.5">
          <button
            v-for="amount in quickAmounts"
            :key="amount"
            type="button"
            :class="[
              'rounded-lg border px-2 py-1.5 text-caption font-medium transition-colors',
              foreignAmount === amount
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border/70 text-muted-foreground hover:border-primary/50 hover:text-primary',
            ]"
            @click="emit('update:foreignAmount', amount)"
          >
            {{ amount }}
          </button>
        </div>
      </div>

      <details class="retro-details" :open="showAdvanced || undefined">
        <summary class="retro-details-summary" @click.prevent="showAdvanced = !showAdvanced">
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
              class="w-full accent-primary"
              :value="dccMarkupRate * 100"
              @input="handleDccSlider"
            />
          </div>
          <div class="space-y-1.5">
            <label class="text-tiny font-semibold text-muted-foreground">직접 입력</label>
            <div class="relative">
              <input
                type="number"
                min="0"
                max="20"
                step="0.1"
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

      <div class="flex flex-wrap items-center gap-2 text-caption text-muted-foreground">
        <FreshBadge :message="`${EXCHANGE_RATES.lastUpdated} 환율 기준`" />
        <span class="tabular-nums">
          {{ getExchangeRate(currency).unit }}{{ currency }} = {{ getExchangeRate(currency).rate.toLocaleString() }}원
        </span>
        <span>{{ getExchangeRate(currency).label }}</span>
      </div>
    </div>
  </div>
</template>
