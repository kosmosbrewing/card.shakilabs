<script setup lang="ts">
import { computed, ref } from "vue";
import { Fuel } from "lucide-vue-next";
import FreshBadge from "@/components/common/FreshBadge.vue";
import { GAS_STATION_BRANDS } from "@/data/gasStationBrands";
import {
  SPENDING_CATEGORIES,
  type SpendingCategoryId,
  type SpendingMap,
} from "@/data/spendingCategories";
import { FUEL_PRICES, FUEL_TYPE_LABELS, getFuelPrice, type FuelType } from "@/data/fuelPrices";

const props = defineProps<{
  fuelType: FuelType;
  fuelSpend: number;
  spending: SpendingMap;
  preferredBrand: string;
  totalSpending: number;
}>();

const emit = defineEmits<{
  "update:fuelType": [value: FuelType];
  "update:fuelSpend": [value: number];
  "update:preferredBrand": [value: string];
  "update:spending": [{ categoryId: SpendingCategoryId; amount: number }];
}>();

const showAdvanced = ref(false);
const fuelTypes: FuelType[] = ["gasoline", "diesel", "lpg"];
const quickAmounts = [100000, 200000, 300000, 500000];

const orderedCategories = computed(() =>
  [...SPENDING_CATEGORIES].sort((a, b) => a.order - b.order)
);

function handleFuelSpendInput(event: Event) {
  const value = Number((event.target as HTMLInputElement).value.replace(/[^0-9]/g, ""));
  if (value >= 0) emit("update:fuelSpend", value);
}

function handleSpendingInput(categoryId: SpendingCategoryId, event: Event) {
  const value = Number((event.target as HTMLInputElement).value.replace(/[^0-9]/g, ""));
  if (value >= 0) emit("update:spending", { categoryId, amount: value });
}
</script>

<template>
  <div class="retro-panel overflow-hidden">
    <div class="retro-titlebar rounded-t-2xl">
      <h1 class="retro-title flex items-center gap-2">
        <Fuel class="h-5 w-5 text-primary" />
        내 월 지출 패턴으로 최적 카드 찾기
      </h1>
    </div>

    <div class="retro-panel-content space-y-4">
      <div class="space-y-1.5">
        <label class="text-caption font-semibold text-muted-foreground">유종</label>
        <div class="flex gap-2">
          <button
            v-for="ft in fuelTypes"
            :key="ft"
            type="button"
            :class="[
              'retro-button-subtle flex-1 !px-2',
              fuelType === ft && '!border-primary !bg-primary/10 !text-primary',
            ]"
            @click="emit('update:fuelType', ft)"
          >
            {{ FUEL_TYPE_LABELS[ft] }}
          </button>
        </div>
      </div>

      <div class="space-y-1.5">
        <label class="text-caption font-semibold text-muted-foreground">월 주유비</label>
        <div class="relative">
          <input
            type="text"
            inputmode="numeric"
            class="retro-input !pr-10 text-right tabular-nums"
            :value="fuelSpend.toLocaleString()"
            @input="handleFuelSpendInput"
          />
          <span class="absolute right-3 top-1/2 -translate-y-1/2 text-caption text-muted-foreground">원</span>
        </div>
        <div class="flex gap-1.5">
          <button
            v-for="amount in quickAmounts"
            :key="amount"
            type="button"
            :class="[
              'flex-1 rounded-lg border px-2 py-1.5 text-caption font-medium transition-colors',
              fuelSpend === amount
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border/70 text-muted-foreground hover:border-primary/50 hover:text-primary',
            ]"
            @click="emit('update:fuelSpend', amount)"
          >
            {{ (amount / 10000).toFixed(0) }}만
          </button>
        </div>
      </div>

      <div class="space-y-2">
        <div class="flex items-center justify-between gap-3">
          <h2 class="text-caption font-semibold text-muted-foreground">월 생활비</h2>
          <span class="text-caption text-muted-foreground">카드 결제 기준</span>
        </div>

        <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <label
            v-for="category in orderedCategories"
            :key="category.id"
            class="space-y-1.5"
          >
            <span class="text-caption font-semibold text-foreground">{{ category.label }}</span>
            <div class="relative">
              <input
                type="text"
                inputmode="numeric"
                class="retro-input !pr-10 text-right tabular-nums"
                :placeholder="category.placeholder"
                :value="spending[category.id].toLocaleString()"
                @input="handleSpendingInput(category.id, $event)"
              />
              <span class="absolute right-3 top-1/2 -translate-y-1/2 text-caption text-muted-foreground">원</span>
            </div>
          </label>
        </div>
      </div>

      <div class="retro-panel-muted flex items-center justify-between gap-3 px-4 py-3">
        <span class="text-caption font-semibold text-muted-foreground">총 월 지출</span>
        <span class="text-body font-bold tabular-nums text-foreground">
          {{ totalSpending.toLocaleString() }}원
        </span>
      </div>

      <details class="retro-details" :open="showAdvanced || undefined">
        <summary class="retro-details-summary" @click.prevent="showAdvanced = !showAdvanced">
          <span>선호 주유소 선택</span>
          <span class="retro-details-chevron" :class="showAdvanced && 'rotate-180'">▼</span>
        </summary>
        <div v-if="showAdvanced" class="space-y-1.5 px-3 py-3">
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="brand in GAS_STATION_BRANDS"
              :key="brand.id"
              type="button"
              :class="[
                'rounded-lg border px-2.5 py-1.5 text-caption font-medium transition-colors',
                preferredBrand === brand.id
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border/70 text-muted-foreground hover:border-primary/50 hover:text-primary',
              ]"
              @click="emit('update:preferredBrand', brand.id)"
            >
              {{ brand.name }}
            </button>
          </div>
        </div>
      </details>

      <div class="flex flex-wrap items-center gap-2 text-caption text-muted-foreground">
        <FreshBadge :message="`${FUEL_PRICES.lastUpdated} 전국 평균 유가 기준`" />
        <span class="tabular-nums">
          {{ FUEL_TYPE_LABELS[fuelType] }} {{ getFuelPrice(fuelType).toLocaleString() }}원/L
        </span>
      </div>
    </div>
  </div>
</template>
