<script setup lang="ts">
import { computed, ref } from "vue";
import { Fuel, Share2 } from "lucide-vue-next";
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
  shareRequest: [];
}>();

const showAdvanced = ref(false);
const fuelTypes: FuelType[] = ["gasoline", "diesel", "lpg"];
const STEP = 50_000;
const MIN = 50_000;
const MAX = 600_000;

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
      <!-- 유종 + 주유비 입력 (1행 병합) -->
      <div class="flex items-center gap-2">
        <div class="flex shrink-0 gap-1">
          <button
            v-for="ft in fuelTypes"
            :key="ft"
            type="button"
            :class="[
              'rounded-lg border px-2.5 py-1.5 text-caption font-semibold transition-colors',
              fuelType === ft
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border/70 text-muted-foreground hover:border-primary/50 hover:text-primary',
            ]"
            @click="emit('update:fuelType', ft)"
          >
            {{ FUEL_TYPE_LABELS[ft] }}
          </button>
        </div>
        <div class="flex flex-1 items-stretch overflow-hidden rounded-xl border border-input bg-card">
          <button
            type="button"
            class="shrink-0 px-2.5 text-base font-bold text-muted-foreground transition-colors hover:bg-muted/50 active:bg-muted"
            aria-label="5만원 감소"
            @click="emit('update:fuelSpend', Math.max(MIN, fuelSpend - STEP))"
          >−</button>
          <div class="relative min-w-0 flex-1">
            <input
              type="text"
              inputmode="numeric"
              class="w-full border-x border-input bg-transparent px-3 py-2.5 text-right text-body tabular-nums focus:outline-none"
              :value="fuelSpend.toLocaleString()"
              @input="handleFuelSpendInput"
            />
            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-caption text-muted-foreground">원</span>
          </div>
          <button
            type="button"
            class="shrink-0 px-2.5 text-base font-bold text-muted-foreground transition-colors hover:bg-muted/50 active:bg-muted"
            aria-label="5만원 증가"
            @click="emit('update:fuelSpend', Math.min(MAX, fuelSpend + STEP))"
          >+</button>
        </div>
      </div>

      <!-- 금액 슬라이더 -->
      <input
        type="range"
        :min="MIN"
        :max="MAX"
        step="10000"
        class="retro-range"
        :value="Math.min(Math.max(fuelSpend, MIN), MAX)"
        @input="emit('update:fuelSpend', Number(($event.target as HTMLInputElement).value))"
      />

      <!-- 월 생활비 (카테고리별 — 슬라이더 제거) -->
      <div class="space-y-2">
        <div class="flex items-center justify-between gap-3">
          <h2 class="text-caption font-semibold text-muted-foreground">월 생활비</h2>
          <span class="text-caption text-muted-foreground">카드 결제 기준</span>
        </div>

        <div class="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          <label
            v-for="category in orderedCategories"
            :key="category.id"
            class="flex items-center gap-2"
          >
            <span class="w-16 shrink-0 text-caption font-semibold text-foreground">{{ category.label }}</span>
            <div class="relative flex-1">
              <input
                type="text"
                inputmode="numeric"
                class="retro-input !py-2 !pr-10 text-right tabular-nums"
                :placeholder="category.placeholder"
                :value="spending[category.id].toLocaleString()"
                @input="handleSpendingInput(category.id, $event)"
              />
              <span class="absolute right-3 top-1/2 -translate-y-1/2 text-caption text-muted-foreground">원</span>
            </div>
          </label>
        </div>
      </div>

      <!-- 총 월 지출 -->
      <div class="retro-panel-muted flex items-center justify-between gap-3 px-4 py-2.5">
        <span class="text-caption font-semibold text-muted-foreground">총 월 지출</span>
        <span class="text-body font-bold tabular-nums text-foreground">
          {{ totalSpending.toLocaleString() }}원
        </span>
      </div>

      <!-- 상세 설정 + 유가 기준 통합 -->
      <div class="flex flex-wrap items-center justify-between gap-2">
        <details class="retro-details flex-1" :open="showAdvanced || undefined">
          <summary class="retro-details-summary !min-h-0 !py-1.5" @click.prevent="showAdvanced = !showAdvanced">
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
        <FreshBadge :message="`${FUEL_PRICES.lastUpdated} ${FUEL_TYPE_LABELS[fuelType]} ${getFuelPrice(fuelType).toLocaleString()}원/L`" />
      </div>
    </div>
  </div>
</template>
