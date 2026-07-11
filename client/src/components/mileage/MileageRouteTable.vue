<script setup lang="ts">
import {
  ShBadge,
  ShButton,
  ShTable,
  ShTableBody,
  ShTableCell,
  ShTableHead,
  ShTableHeader,
  ShTableRow,
} from "@shakilabs/ui";
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
        <ShButton
          v-for="option in sortOptions"
          :key="option.key"
          type="button"
          :variant="sortKey === option.key ? 'primary' : 'secondary'"
          size="sm"
          @click="emit('update:sortKey', option.key)"
        >
          {{ option.label }}
        </ShButton>
      </div>
    </div>

    <div class="retro-panel-content">
      <ShTable
        aria-label="노선과 좌석 등급별 마일리지 가치 비교"
        density="compact"
        min-width="44rem"
        scroll-hint="표를 좌우로 스크롤해 전체 노선을 확인하세요."
      >
          <ShTableHeader>
            <ShTableRow>
              <ShTableHead>노선</ShTableHead>
              <ShTableHead>등급</ShTableHead>
              <ShTableHead numeric>필요 마일</ShTableHead>
              <ShTableHead numeric>예시 현금가</ShTableHead>
              <ShTableHead numeric>1마일 가치</ShTableHead>
              <ShTableHead numeric>상태</ShTableHead>
            </ShTableRow>
          </ShTableHeader>
          <ShTableBody>
            <ShTableRow
              v-for="item in values"
              :key="`${item.routeId}-${item.seatClass}`"
            >
              <ShTableCell>
                <div class="font-medium text-foreground">{{ item.routeLabel }}</div>
                <div class="text-tiny text-muted-foreground">{{ item.example }}</div>
              </ShTableCell>
              <ShTableCell>{{ item.seatClassLabel }}</ShTableCell>
              <ShTableCell numeric>{{ item.milesRequired.toLocaleString() }}</ShTableCell>
              <ShTableCell numeric>{{ item.cashPrice.toLocaleString() }}원</ShTableCell>
              <ShTableCell numeric emphasis class="text-savings">
                {{ formatValuePerMile(item.valuePerMile) }}
              </ShTableCell>
              <ShTableCell numeric>
                <ShBadge :tone="item.hasEnoughMiles ? 'success' : 'warning'">
                  {{ item.hasEnoughMiles ? "마일 충족" : `${item.milesShortage.toLocaleString()} 부족` }}
                </ShBadge>
              </ShTableCell>
            </ShTableRow>
          </ShTableBody>
      </ShTable>
    </div>
  </div>
</template>
