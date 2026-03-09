<script setup lang="ts">
import { Fuel } from "lucide-vue-next";
import type { FuelType } from "@/data/fuelPrices";
import { FUEL_PRICES, FUEL_TYPE_LABELS, getFuelPrice } from "@/data/fuelPrices";
import { GAS_STATION_BRANDS } from "@/data/gasStationBrands";
import FreshBadge from "@/components/common/FreshBadge.vue";
import { ref } from "vue";

const props = defineProps<{
  fuelType: FuelType;
  monthlySpend: number;
  preferredBrand: string;
}>();

const emit = defineEmits<{
  "update:fuelType": [value: FuelType];
  "update:monthlySpend": [value: number];
  "update:preferredBrand": [value: string];
}>();

const showAdvanced = ref(false);

const fuelTypes: FuelType[] = ["gasoline", "diesel", "lpg"];
const quickAmounts = [100000, 200000, 300000, 500000];

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
    </div>
    <div class="retro-panel-content space-y-4">
      <!-- 유종 선택 -->
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

      <!-- 월 주유 금액 -->
      <div class="space-y-1.5">
        <label class="text-caption font-semibold text-muted-foreground">월 주유 금액</label>
        <div class="relative">
          <input
            type="text"
            inputmode="numeric"
            class="retro-input !pr-10 text-right tabular-nums"
            :value="monthlySpend.toLocaleString()"
            @input="handleAmountInput"
          />
          <span class="absolute right-3 top-1/2 -translate-y-1/2 text-caption text-muted-foreground">원</span>
        </div>
        <div class="flex gap-1.5">
          <button
            v-for="amt in quickAmounts"
            :key="amt"
            type="button"
            :class="[
              'flex-1 rounded-lg border px-2 py-1.5 text-caption font-medium transition-colors',
              monthlySpend === amt
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border/70 text-muted-foreground hover:border-primary/50 hover:text-primary',
            ]"
            @click="emit('update:monthlySpend', amt)"
          >
            {{ (amt / 10000).toFixed(0) }}만
          </button>
        </div>
      </div>

      <!-- 상세 설정 (접힘) -->
      <details class="retro-details" :open="showAdvanced || undefined">
        <summary class="retro-details-summary" @click.prevent="showAdvanced = !showAdvanced">
          <span>상세 설정</span>
          <span class="retro-details-chevron" :class="showAdvanced && 'rotate-180'">▼</span>
        </summary>
        <div v-if="showAdvanced" class="px-3 py-3 space-y-1.5">
          <label class="text-caption font-semibold text-muted-foreground">선호 주유소</label>
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

      <!-- 유가 기준 -->
      <div class="flex flex-wrap items-center gap-2 text-caption text-muted-foreground">
        <FreshBadge :message="`${FUEL_PRICES.lastUpdated} 전국 평균 유가 기준`" />
        <span class="tabular-nums">
          {{ FUEL_TYPE_LABELS[fuelType] }} {{ getFuelPrice(fuelType).toLocaleString() }}원/L
        </span>
      </div>
    </div>
  </div>
</template>
