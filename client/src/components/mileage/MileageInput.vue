<script setup lang="ts">
import { Plane } from "lucide-vue-next";
import { computed } from "vue";
import { ShPresetGroup, ShSlider } from "@shakilabs/ui";
import {
  AIRLINES,
  getSeatClassLabel,
  type AirlineId,
  type SeatClass,
} from "@/data/mileageData";
import type { MileageFilterClass } from "@/composables/useMileageCalc";

const props = defineProps<{
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
const mileageInputId = "mileage-balance";

function handleMileageInput(event: Event) {
  const value = Number((event.target as HTMLInputElement).value.replace(/[^0-9]/g, ""));
  emit("update:mileageBalance", Number.isFinite(value) ? value : 0);
}

const classOptions: MileageFilterClass[] = ["all", "economy", "business", "first"];
const airlineOptions = AIRLINES.map((airline) => ({ label: airline.name, value: airline.id }));
const classPresetOptions = computed(() => classOptions.map((value) => ({
  label: value === "all" ? "전체" : getSeatClassLabel(props.airlineId, value as SeatClass),
  value,
})));
</script>

<template>
  <div class="retro-panel overflow-hidden">
    <div class="retro-titlebar rounded-t-2xl">
      <h2 class="retro-title flex items-center gap-2">
        <Plane class="h-5 w-5 text-primary" />
        마일리지 조건 입력
      </h2>
    </div>

    <div class="retro-panel-content space-y-4">
      <!-- 항공사 + 보유 마일리지 (2컬럼) -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div class="space-y-1.5">
          <p class="text-caption font-semibold text-muted-foreground">항공사</p>
          <ShPresetGroup
            :model-value="airlineId"
            :options="airlineOptions"
            label="항공사 선택"
            @update:model-value="emit('update:airlineId', $event)"
          />
        </div>

        <div class="space-y-1.5">
          <label :for="mileageInputId" class="text-caption font-semibold text-muted-foreground">
            보유 마일리지
          </label>
          <div class="retro-stepper">
            <button
              type="button"
              class="retro-stepper-button"
              aria-label="5,000마일 감소"
              @click="emit('update:mileageBalance', Math.max(MIN, mileageBalance - STEP))"
            >−</button>
            <div class="retro-stepper-field">
              <input
                :id="mileageInputId"
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
      <ShSlider
        :model-value="Math.min(Math.max(mileageBalance, MIN), MAX)"
        aria-label="보유 마일리지 슬라이더"
        :min="MIN"
        :max="MAX"
        :step="1000"
        :value-text="`보유 마일리지 ${mileageBalance.toLocaleString('ko-KR')}마일`"
        @update:model-value="emit('update:mileageBalance', $event)"
      />

      <!-- 좌석 등급 필터 -->
      <div class="space-y-1.5">
        <p class="text-caption font-semibold text-muted-foreground">좌석 등급</p>
        <ShPresetGroup
          :model-value="selectedClass"
          :options="classPresetOptions"
          label="좌석 등급 선택"
          @update:model-value="emit('update:selectedClass', $event)"
        />
      </div>
    </div>
  </div>
</template>
