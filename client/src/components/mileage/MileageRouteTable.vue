<script setup lang="ts">
import {
  ShBadge,
  ShTable,
  ShTableBody,
  ShTableCell,
  ShTableHead,
  ShTableHeader,
  ShTableRow,
  ShToggleGroup,
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

const sortToggleOptions: { value: MileageSortKey; label: string }[] = [
  { value: "valuePerMile", label: "가치 높은순" },
  { value: "milesRequired", label: "필요 마일 적은순" },
  { value: "route", label: "노선순" },
];
</script>

<template>
  <div class="retro-panel overflow-hidden">
    <div class="retro-titlebar rounded-t-2xl">
      <h2 class="retro-title">노선 / 좌석 비교표</h2>
      <!-- 정렬은 패키지 토글 그룹(세그먼트) — ShButton 3개가 390px에서 전폭 3행으로 쌓였다(2026-11 UI 감사 스크린샷). -->
      <ShToggleGroup
        class="result-sort-options"
        :model-value="sortKey"
        :options="sortToggleOptions"
        label="정렬"
        @update:model-value="emit('update:sortKey', $event)"
      />
    </div>

    <div class="retro-panel-content">
      <ShTable
        aria-label="노선과 좌석 등급별 마일리지 가치 비교"
        density="compact"
        min-width="0"
        scroll-hint="표를 좌우로 스크롤해 전체 노선을 확인하세요."
      >
          <ShTableHeader>
            <ShTableRow>
              <ShTableHead>노선</ShTableHead>
              <ShTableHead>등급</ShTableHead>
              <ShTableHead numeric>필요 마일</ShTableHead>
              <!-- 48rem 미만에서는 예시 현금가·상태 열을 접는다(.sh-col-secondary, ui 0.3.44) — 반폭 카드 안 6열이 390px에서 +364px 가로 스크롤이었다.
                   1마일 가치는 현금가÷필요 마일이라 핵심 3열(노선·필요 마일·1마일 가치)로 읽힌다. -->
              <ShTableHead numeric class="sh-col-secondary">예시 현금가</ShTableHead>
              <ShTableHead numeric>1마일 가치</ShTableHead>
              <ShTableHead numeric class="sh-col-secondary">상태</ShTableHead>
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
              <ShTableCell numeric class="sh-col-secondary">{{ item.cashPrice.toLocaleString() }}원</ShTableCell>
              <ShTableCell numeric emphasis class="text-status-success">
                {{ formatValuePerMile(item.valuePerMile) }}
              </ShTableCell>
              <ShTableCell numeric class="sh-col-secondary">
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
