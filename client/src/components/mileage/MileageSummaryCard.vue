<script setup lang="ts">
import { computed } from "vue";
import { AIRLINES } from "@/data/mileageData";
import type { MileageCalcResult } from "@/utils/mileageCalculator";
import { formatTotalValue, formatValuePerMile } from "@/utils/mileageCalculator";

const props = defineProps<{
  result: MileageCalcResult;
}>();

const airline = computed(() =>
  AIRLINES.find((item) => item.id === props.result.airlineId) ?? AIRLINES[0]
);
</script>

<template>
  <div class="retro-panel overflow-hidden">
    <div class="retro-titlebar rounded-t-2xl">
      <h2 class="retro-title">보유 마일리지 가치 요약</h2>
    </div>

    <div class="retro-panel-content space-y-3">
      <div class="flex items-center gap-2">
        <span
          class="inline-block h-3 w-3 rounded-sm"
          :style="{ backgroundColor: airline.color }"
        />
        <span class="text-body font-bold text-foreground">{{ airline.name }}</span>
        <span class="text-body text-muted-foreground">{{ airline.mileageName }}</span>
      </div>

      <div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <div class="retro-panel-muted px-3 py-3">
          <div class="text-caption text-muted-foreground">총 환산 가치</div>
          <div class="mt-1 text-heading font-bold tabular-nums text-savings">
            {{ formatTotalValue(result.totalValueKrw) }}
          </div>
        </div>
        <div class="retro-panel-muted px-3 py-3">
          <div class="text-caption text-muted-foreground">최고 1마일 가치</div>
          <div class="mt-1 text-heading font-bold tabular-nums text-savings">
            {{ formatValuePerMile(result.bestValuePerMile) }}
          </div>
        </div>
        <div class="retro-panel-muted px-3 py-3">
          <div class="text-caption text-muted-foreground">즉시 발권 가능 옵션</div>
          <div class="mt-1 text-heading font-bold tabular-nums text-foreground">
            {{ result.redeemable.length }}개
          </div>
        </div>
      </div>

      <div class="rounded-xl border border-border/60 bg-background/60 px-3 py-3 text-caption leading-relaxed text-foreground">
        <template v-if="result.bestOption">
          최적 사용처는 {{ result.bestOption.routeLabel }} {{ result.bestOption.seatClassLabel }}이며,
          {{ result.bestOption.example }} 기준 {{ formatValuePerMile(result.bestOption.valuePerMile) }} 수준입니다.
        </template>
        <template v-else>
          현재 보유 마일로 즉시 발권 가능한 옵션은 없지만, 노선별 1마일 가치 비교는 계속 확인할 수 있습니다.
        </template>
      </div>

      <div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <div class="retro-panel-muted px-3 py-3">
          <div class="text-caption text-muted-foreground">이코노미 평균</div>
          <div class="mt-1 text-body font-semibold tabular-nums text-foreground">
            {{ formatValuePerMile(result.avgValueByClass.economy) }}
          </div>
        </div>
        <div class="retro-panel-muted px-3 py-3">
          <div class="text-caption text-muted-foreground">비즈니스 평균</div>
          <div class="mt-1 text-body font-semibold tabular-nums text-foreground">
            {{ formatValuePerMile(result.avgValueByClass.business) }}
          </div>
        </div>
        <div class="retro-panel-muted px-3 py-3">
          <div class="text-caption text-muted-foreground">퍼스트 평균</div>
          <div class="mt-1 text-body font-semibold tabular-nums text-foreground">
            {{ formatValuePerMile(result.avgValueByClass.first) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
