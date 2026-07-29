<script setup lang="ts">
import { computed } from "vue";
import { ChevronDown } from "lucide-vue-next";
import type { MileageValuePerMile } from "@/utils/mileageCalculator";
import { formatValuePerMile } from "@/utils/mileageCalculator";

const props = defineProps<{
  values: MileageValuePerMile[];
}>();

const groupedRoutes = computed(() => {
  const groups = new Map<string, MileageValuePerMile[]>();

  for (const item of props.values) {
    const current = groups.get(item.routeLabel) ?? [];
    current.push(item);
    groups.set(item.routeLabel, current);
  }

  return [...groups.entries()];
});
</script>

<template>
  <!-- 바로 위 비교표와 같은 데이터(노선·등급·필요 마일·예시 운임·1마일 가치)를 카드로 보여주는 블록이라
       기본은 접어 두고, 노선별로 훑고 싶은 사용자만 펼치도록 한다 -->
  <details class="group retro-panel overflow-hidden">
    <summary class="retro-titlebar flex cursor-pointer list-none items-center justify-between gap-3 rounded-t-2xl">
      <h2 class="retro-title">노선별 상세 분석</h2>
      <ChevronDown
        aria-hidden="true"
        class="h-4 w-4 shrink-0 transition-transform group-open:rotate-180"
      />
    </summary>

    <div class="retro-panel-content space-y-2">
      <div
        v-for="[routeLabel, items] in groupedRoutes"
        :key="routeLabel"
        class="retro-panel-muted space-y-2 p-3.5"
      >
        <div class="text-body font-bold text-foreground">{{ routeLabel }}</div>
        <div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <div
            v-for="item in items"
            :key="item.seatClass"
            class="rounded-xl border border-border/60 bg-background/60 p-3"
          >
            <div class="text-caption font-semibold text-foreground">{{ item.seatClassLabel }}</div>
            <div class="mt-1 text-caption text-muted-foreground">{{ item.example }}</div>
            <div class="mt-1 text-body font-semibold tabular-nums text-savings">
              {{ formatValuePerMile(item.valuePerMile) }}
            </div>
            <div class="mt-1 text-tiny text-muted-foreground">
              {{ item.milesRequired.toLocaleString() }}마일 필요 · 예시 운임 {{ item.cashPrice.toLocaleString() }}원
            </div>
          </div>
        </div>
      </div>
    </div>
  </details>
</template>
