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

    <div class="retro-panel-content space-y-3">
      <!-- 항공사 선택 -->
      <div class="flex gap-1.5">
        <button
          v-for="airline in AIRLINES"
          :key="airline.id"
          type="button"
          :class="[
            'flex-1 rounded-lg border px-3 py-1.5 text-caption font-medium transition-colors',
            airlineId === airline.id
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-border/70 text-muted-foreground hover:border-primary/50 hover:text-primary',
          ]"
          @click="emit('update:airlineId', airline.id)"
        >
          {{ airline.name }}
        </button>
      </div>

      <!-- 마일리지 입력: 인라인 스테퍼 [−|input 마일|+] -->
      <div class="flex items-stretch overflow-hidden rounded-xl border border-input bg-card">
        <button
          type="button"
          class="shrink-0 px-2.5 text-base font-bold text-muted-foreground transition-colors hover:bg-muted/50 active:bg-muted"
          aria-label="5,000마일 감소"
          @click="emit('update:mileageBalance', Math.max(MIN, mileageBalance - STEP))"
        >−</button>
        <div class="relative min-w-0 flex-1">
          <input
            type="text"
            inputmode="numeric"
            class="w-full border-x border-input bg-transparent px-3 py-2.5 text-right text-body tabular-nums focus:outline-none"
            :value="mileageBalance.toLocaleString()"
            @input="handleMileageInput"
          />
          <span class="absolute right-3 top-1/2 -translate-y-1/2 text-caption text-muted-foreground">마일</span>
        </div>
        <button
          type="button"
          class="shrink-0 px-2.5 text-base font-bold text-muted-foreground transition-colors hover:bg-muted/50 active:bg-muted"
          aria-label="5,000마일 증가"
          @click="emit('update:mileageBalance', Math.min(MAX, mileageBalance + STEP))"
        >+</button>
      </div>

      <!-- 마일리지 슬라이더 -->
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
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="seatClass in classOptions"
          :key="seatClass"
          type="button"
          :class="[
            'rounded-lg border px-2.5 py-1.5 text-caption font-medium transition-colors',
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
</template>
