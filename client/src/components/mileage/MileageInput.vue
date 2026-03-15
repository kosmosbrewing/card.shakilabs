<script setup lang="ts">
import { Plane } from "lucide-vue-next";
import {
  AIRLINES,
  SEAT_CLASS_LABELS,
  type AirlineId,
  type SeatClass,
} from "@/data/mileageData";
import type { MileageFilterClass } from "@/composables/useMileageCalc";

defineProps<{
  airlineId: AirlineId;
  mileageBalance: number;
  selectedClass: MileageFilterClass;
}>();

const emit = defineEmits<{
  "update:airlineId": [value: AirlineId];
  "update:mileageBalance": [value: number];
  "update:selectedClass": [value: MileageFilterClass];
}>();

const STEP = 5_000;
const MIN = 1_000;
const MAX = 200_000;

function handleMileageInput(event: Event) {
  const value = Number((event.target as HTMLInputElement).value.replace(/[^0-9]/g, ""));
  emit("update:mileageBalance", Number.isFinite(value) ? value : 0);
}

const classOptions: MileageFilterClass[] = ["all", "economy", "business", "first"];
</script>

<template>
  <div class="retro-panel overflow-hidden">
    <div class="retro-titlebar rounded-t-2xl">
      <h1 class="retro-title flex items-center gap-2">
        <Plane class="h-5 w-5 text-primary" />
        마일리지 가치 계산기
      </h1>
    </div>

    <div class="retro-panel-content space-y-4">
      <!-- 항공사 + 보유 마일리지 (2컬럼) -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div class="space-y-1.5">
          <label class="text-caption font-semibold text-muted-foreground">항공사</label>
          <div class="grid grid-cols-2 gap-1.5">
            <button
              v-for="airline in AIRLINES"
              :key="airline.id"
              type="button"
              :class="[
                'retro-choice-button',
                airlineId === airline.id
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border/70 text-muted-foreground hover:border-primary/50 hover:text-primary',
              ]"
              @click="emit('update:airlineId', airline.id)"
            >
              {{ airline.name }}
            </button>
          </div>
        </div>

        <div class="space-y-1.5">
          <label class="text-caption font-semibold text-muted-foreground">보유 마일리지</label>
          <div class="retro-stepper">
            <button
              type="button"
              class="retro-stepper-button"
              aria-label="5,000마일 감소"
              @click="emit('update:mileageBalance', Math.max(MIN, mileageBalance - STEP))"
            >−</button>
            <div class="retro-stepper-field">
              <input
                type="text"
                inputmode="numeric"
                class="retro-stepper-input retro-stepper-input-right"
                :value="mileageBalance.toLocaleString()"
                @input="handleMileageInput"
              />
              <span class="retro-input-affix retro-input-affix-right retro-input-affix-wide">마일</span>
            </div>
            <button
              type="button"
              class="retro-stepper-button"
              aria-label="5,000마일 증가"
              @click="emit('update:mileageBalance', Math.min(MAX, mileageBalance + STEP))"
            >+</button>
          </div>
        </div>
      </div>

      <!-- 마일리지 슬라이더 (full width) -->
      <input
        type="range"
        :min="MIN"
        :max="MAX"
        step="1000"
        class="retro-range"
        :value="Math.min(Math.max(mileageBalance, MIN), MAX)"
        @input="emit('update:mileageBalance', Number(($event.target as HTMLInputElement).value))"
      />

      <!-- 좌석 등급 필터 -->
      <div class="space-y-1.5">
        <label class="text-caption font-semibold text-muted-foreground">좌석 등급</label>
        <div class="grid grid-cols-2 gap-1.5">
          <button
            v-for="seatClass in classOptions"
            :key="seatClass"
            type="button"
            :class="[
              'retro-choice-button',
              selectedClass === seatClass
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border/70 text-muted-foreground hover:border-primary/50 hover:text-primary',
            ]"
            @click="emit('update:selectedClass', seatClass)"
          >
            {{ seatClass === "all" ? "전체" : SEAT_CLASS_LABELS[seatClass as SeatClass] }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
