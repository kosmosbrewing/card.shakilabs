<script setup lang="ts">
import { Fuel, Share2 } from "lucide-vue-next";
import type { FuelType } from "@/data/fuelPrices";
import { FUEL_PRICES, FUEL_TYPE_LABELS, getFuelPrice } from "@/data/fuelPrices";
import { GAS_STATION_BRANDS } from "@/data/gasStationBrands";
import FreshBadge from "@/components/common/FreshBadge.vue";
import { ref } from "vue";

defineProps<{
  fuelType: FuelType;
  monthlySpend: number;
  preferredBrand: string;
}>();

const emit = defineEmits<{
  "update:fuelType": [value: FuelType];
  "update:monthlySpend": [value: number];
  "update:preferredBrand": [value: string];
  shareRequest: [];
}>();

const showAdvanced = ref(false);

const fuelTypes: FuelType[] = ["gasoline", "diesel", "lpg"];
const STEP = 50_000;
const MIN = 50_000;
const MAX = 600_000;

function handleAmountInput(e: Event) {
  const val = Number((e.target as HTMLInputElement).value.replace(/[^0-9]/g, ""));
  if (val >= 0) emit("update:monthlySpend", val);
}
</script>

<template>
  <div class="retro-panel overflow-hidden">
    <div class="retro-titlebar rounded-t-2xl">
      <h1 class="retro-title flex items-center gap-2">
        <Fuel class="h-5 w-5 text-primary" />
        내 주유 패턴에 맞는 최적 카드 찾기
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
      <!-- 유종 + 월 주유비 (2컬럼) -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div class="space-y-1.5">
          <label class="text-caption font-semibold text-muted-foreground">유종</label>
          <div class="grid grid-cols-3 gap-1.5">
            <button
              v-for="ft in fuelTypes"
              :key="ft"
              type="button"
              :class="[
                'retro-choice-button',
                fuelType === ft
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border/70 text-muted-foreground hover:border-primary/50 hover:text-primary',
              ]"
              @click="emit('update:fuelType', ft)"
            >
              {{ FUEL_TYPE_LABELS[ft] }}
            </button>
          </div>
        </div>

        <div class="space-y-1.5">
          <label class="text-caption font-semibold text-muted-foreground">월 주유비</label>
          <div class="retro-stepper">
            <button
              type="button"
              class="retro-stepper-button"
              aria-label="5만원 감소"
              @click="emit('update:monthlySpend', Math.max(MIN, monthlySpend - STEP))"
            >−</button>
            <div class="retro-stepper-field">
              <input
                type="text"
                inputmode="numeric"
                class="retro-stepper-input retro-stepper-input-right"
                :value="monthlySpend.toLocaleString()"
                @input="handleAmountInput"
              />
              <span class="retro-input-affix retro-input-affix-right retro-input-affix-wide">원</span>
            </div>
            <button
              type="button"
              class="retro-stepper-button"
              aria-label="5만원 증가"
              @click="emit('update:monthlySpend', Math.min(MAX, monthlySpend + STEP))"
            >+</button>
          </div>
        </div>
      </div>

      <!-- 금액 슬라이더 (full width) -->
      <input
        type="range"
        :min="MIN"
        :max="MAX"
        step="10000"
        class="retro-range"
        :value="Math.min(Math.max(monthlySpend, MIN), MAX)"
        @input="emit('update:monthlySpend', Number(($event.target as HTMLInputElement).value))"
      />

      <!-- 상세 설정 + 유가 기준 통합 -->
      <div class="flex flex-wrap items-center justify-between gap-2">
        <details class="retro-details flex-1" :open="showAdvanced || undefined">
          <summary class="retro-details-summary !min-h-0 !py-1.5" @click.prevent="showAdvanced = !showAdvanced">
            <span>상세 설정</span>
            <span class="retro-details-chevron" :class="showAdvanced && 'rotate-180'">▼</span>
          </summary>
          <div v-if="showAdvanced" class="space-y-1.5 px-3 py-3">
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="brand in GAS_STATION_BRANDS"
                :key="brand.id"
                type="button"
                :class="[
                  'retro-choice-button retro-choice-button-compact',
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
