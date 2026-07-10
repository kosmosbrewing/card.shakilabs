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
          <div class="text-caption text-muted-foreground">예시 환산 상한</div>
          <div class="mt-1 text-heading font-bold tabular-nums text-savings">
            {{ formatTotalValue(result.totalValueKrw) }}
          </div>
        </div>
        <div class="retro-panel-muted px-3 py-3">
          <div class="text-caption text-muted-foreground">예시 최고 1마일 가치</div>
          <div class="mt-1 text-heading font-bold tabular-nums text-savings">
            {{ formatValuePerMile(result.bestValuePerMile) }}
          </div>
        </div>
        <div class="retro-panel-muted px-3 py-3">
          <div class="text-caption text-muted-foreground">필요 마일 충족 옵션</div>
          <div class="mt-1 text-heading font-bold tabular-nums text-foreground">
            {{ result.balanceEligible.length }}개
          </div>
        </div>
      </div>

      <div class="rounded-xl border border-border/60 bg-background/60 px-3 py-3 text-caption leading-relaxed text-foreground">
        <template v-if="result.bestBalanceEligibleOption">
          보유 마일을 충족하는 예시 중 환산값이 가장 큰 항목은
          {{ result.bestBalanceEligibleOption.routeLabel }} {{ result.bestBalanceEligibleOption.seatClassLabel }}이며,
          {{ result.bestBalanceEligibleOption.example }} 예시 운임 기준 {{ formatValuePerMile(result.bestBalanceEligibleOption.valuePerMile) }} 수준입니다.
        </template>
        <template v-else>
          현재 보유 마일이 공식 왕복 공제 기준을 충족하는 옵션은 없습니다.
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
          <div class="text-caption text-muted-foreground">{{ airline.premiumClassLabel }} 평균</div>
          <div class="mt-1 text-body font-semibold tabular-nums text-foreground">
            {{ formatValuePerMile(result.avgValueByClass.first) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
