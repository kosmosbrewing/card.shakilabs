<script setup lang="ts">
import { computed, ref } from "vue";
import FreshBadge from "@/components/common/FreshBadge.vue";
import SEOHead from "@/components/common/SEOHead.vue";
import CalculatorPageHeader from "@/components/calculator/CalculatorPageHeader.vue";
import RankedBars from "@/components/result-visualization/RankedBars.vue";
import { CARD_TOOL_UPDATED_AT } from "@/data/cardTabData";
import { formatWon } from "@/lib/utils";
import { calculatePointConversions } from "@/utils/cardTabCalculator";
import { useSafeCalculation } from "@/composables/useSafeCalculation";

const seoTitle = "포인트 전환 비교 | 항공·호텔·현금성 포인트 가치 계산";
const seoDescription = "보유 포인트를 어디로 넘겨야 가치가 큰지 예상 환산가치 기준으로 비교합니다.";

const pointAmount = ref(120_000);
const { result, validationError } = useSafeCalculation(
  () => calculatePointConversions({ pointAmount: pointAmount.value }),
  calculatePointConversions({ pointAmount: 120_000 }),
);
const chartItems = computed(() => result.value.items.map((item, index) => ({
  key: item.key,
  label: item.label,
  value: item.estimatedValue,
  detail: `${item.units.toLocaleString()} ${item.unitLabel}`,
  highlight: index === 0,
})));
const formatChartValue = (value: number | null) => formatWon(value ?? 0);
</script>

<template>
  <SEOHead :title="seoTitle" :description="seoDescription" />

  <div class="container space-y-5 py-5">
    <CalculatorPageHeader title="포인트 전환 비교" />

    <div class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h2 class="retro-title">전환 조건</h2>
        <FreshBadge :message="`${CARD_TOOL_UPDATED_AT} 기준`" />
      </div>
      <div class="retro-panel-content space-y-4">
        <label class="space-y-1 text-caption font-semibold text-foreground" :aria-describedby="validationError ? 'point-convert-error' : undefined">
          보유 포인트
          <input v-model.number="pointAmount" type="number" min="1000" step="1000" class="retro-input w-full" />
        </label>
        <p v-if="validationError" id="point-convert-error" class="text-caption font-semibold text-destructive" role="alert">
          {{ validationError }}
        </p>
        <div class="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-caption text-foreground">
          가장 높은 예상 가치는 <strong>{{ result.bestOption.label }}</strong> 전환이며 약 {{ formatWon(result.bestOption.estimatedValue) }}입니다.
        </div>
      </div>
    </div>

    <RankedBars
      title="전환처별 예상 가치"
      note="동일한 보유 포인트를 전환했을 때의 예상 원화 가치이며 길수록 높습니다."
      :items="chartItems"
      :format-value="formatChartValue"
    />

    <div class="grid gap-3">
      <div v-for="item in result.items" :key="item.key" class="retro-panel-muted px-4 py-4">
        <div class="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <div>
            <p class="text-body font-semibold text-foreground">{{ item.label }}</p>
            <p class="text-tiny text-muted-foreground">{{ item.note }}</p>
          </div>
          <div class="sm:text-right">
            <p class="text-body font-bold text-foreground tabular-nums">{{ formatWon(item.estimatedValue) }}</p>
            <p class="text-tiny text-muted-foreground">{{ item.units.toLocaleString() }} {{ item.unitLabel }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
