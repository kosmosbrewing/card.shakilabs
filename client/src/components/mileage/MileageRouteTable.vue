<script setup lang="ts">
import type { MileageSortKey } from "@/composables/useMileageCalc";
import type { MileageValuePerMile } from "@/utils/mileageCalculator";
import { formatValuePerMile } from "@/utils/mileageCalculator";

defineProps<{
  values: MileageValuePerMile[];
  sortKey: MileageSortKey;
}>();

const emit = defineEmits<{
  "update:sortKey": [value: MileageSortKey];
}>();

const sortOptions: { key: MileageSortKey; label: string }[] = [
  { key: "valuePerMile", label: "가치 높은순" },
  { key: "milesRequired", label: "필요 마일 적은순" },
  { key: "route", label: "노선순" },
];
</script>

<template>
  <div class="retro-panel overflow-hidden">
    <div class="retro-titlebar rounded-t-2xl">
      <h2 class="retro-title">노선 / 좌석 비교표</h2>
      <div class="flex gap-1">
        <button
          v-for="option in sortOptions"
          :key="option.key"
          type="button"
          :class="[
            'rounded-lg border px-2 py-1 text-tiny font-medium transition-colors',
            sortKey === option.key
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-border/70 text-muted-foreground hover:text-primary',
          ]"
          @click="emit('update:sortKey', option.key)"
        >
          {{ option.label }}
        </button>
      </div>
    </div>

    <div class="retro-panel-content">
      <div class="overflow-x-auto -mx-4 sm:-mx-5">
        <table class="w-full text-caption">
          <thead>
            <tr class="border-b border-border bg-muted/30">
              <th class="px-3 py-2 text-left font-semibold">노선</th>
              <th class="px-3 py-2 text-left font-semibold">등급</th>
              <th class="px-3 py-2 text-right font-semibold">필요 마일</th>
              <th class="px-3 py-2 text-right font-semibold">예시 현금가</th>
              <th class="px-3 py-2 text-right font-semibold">1마일 가치</th>
              <th class="px-3 py-2 text-right font-semibold">상태</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in values"
              :key="`${item.routeId}-${item.seatClass}`"
              class="border-b border-border/50 transition-colors hover:bg-accent/20"
            >
              <td class="px-3 py-2">
                <div class="font-medium text-foreground">{{ item.routeLabel }}</div>
                <div class="text-tiny text-muted-foreground">{{ item.example }}</div>
              </td>
              <td class="px-3 py-2">{{ item.seatClassLabel }}</td>
              <td class="px-3 py-2 text-right tabular-nums">{{ item.milesRequired.toLocaleString() }}</td>
              <td class="px-3 py-2 text-right tabular-nums">{{ item.cashPrice.toLocaleString() }}원</td>
              <td class="px-3 py-2 text-right font-semibold tabular-nums text-savings">
                {{ formatValuePerMile(item.valuePerMile) }}
              </td>
              <td
                class="px-3 py-2 text-right font-semibold tabular-nums"
                :class="item.canRedeem ? 'text-savings' : 'text-status-warning'"
              >
                {{ item.canRedeem ? "발권 가능" : `${item.milesShortage.toLocaleString()} 부족` }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
