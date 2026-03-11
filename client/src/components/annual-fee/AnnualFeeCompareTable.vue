<script setup lang="ts">
import type { AnnualFeeSortKey } from "@/composables/useAnnualFeeCalc";
import type { AnnualFeeCalcResult } from "@/utils/annualFeeCalculator";
import { formatBreakEven, formatRoiRatio } from "@/utils/annualFeeCalculator";

defineProps<{
  results: AnnualFeeCalcResult[];
  sortKey: AnnualFeeSortKey;
}>();

const emit = defineEmits<{
  "update:sortKey": [value: AnnualFeeSortKey];
}>();

const sortOptions: { key: AnnualFeeSortKey; label: string }[] = [
  { key: "netBenefit", label: "순혜택 높은순" },
  { key: "breakEven", label: "회수 빠른순" },
  { key: "annualFee", label: "연회비 낮은순" },
];
</script>

<template>
  <div class="retro-panel overflow-hidden">
    <div class="retro-titlebar rounded-t-2xl">
      <h2 class="retro-title">전체 카드 비교</h2>
      <div class="flex gap-1">
        <button
          v-for="option in sortOptions"
          :key="option.key"
          type="button"
          :class="[
            'touch-target rounded-lg border px-2 py-1 text-tiny font-medium transition-colors',
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
      <div class="space-y-2 md:hidden">
        <div
          v-for="(result, idx) in results"
          :key="`${result.cardId}-mobile`"
          :class="[
            'rounded-xl border p-3',
            idx === 0 ? 'border-savings/30 bg-savings/10' : 'border-border/60 bg-background/60',
          ]"
        >
          <div class="flex items-center justify-between gap-3">
            <span class="text-caption font-semibold text-foreground">{{ idx === 0 ? "🏆 1위" : `${idx + 1}위` }}</span>
            <span class="text-tiny text-muted-foreground">{{ result.card.issuer }} {{ result.card.name }}</span>
          </div>
          <div class="mt-2 grid grid-cols-3 gap-2">
            <div>
              <div class="text-tiny text-muted-foreground">월 혜택</div>
              <div class="text-caption font-semibold tabular-nums text-savings">▲ {{ result.totalMonthlyBenefit.toLocaleString() }}원</div>
            </div>
            <div>
              <div class="text-tiny text-muted-foreground">회수 기간</div>
              <div class="text-caption font-semibold tabular-nums text-foreground">{{ formatBreakEven(result.breakEvenMonths) }}</div>
            </div>
            <div>
              <div class="text-tiny text-muted-foreground">연 순혜택</div>
              <div class="text-caption font-semibold tabular-nums" :class="result.annualNetBenefit >= 0 ? 'text-savings' : 'text-loss'">
                {{ result.annualNetBenefit >= 0 ? '▲' : '▼' }} {{ Math.abs(result.annualNetBenefit).toLocaleString() }}원
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="hidden overflow-x-auto -mx-4 sm:-mx-5 md:block">
        <table class="w-full table-fixed text-caption">
          <colgroup>
            <col class="w-[28%]" />
            <col class="w-[14%]" />
            <col class="w-[14%]" />
            <col class="w-[16%]" />
            <col class="w-[12%]" />
            <col class="w-[16%]" />
          </colgroup>
          <thead>
            <tr class="border-b border-border bg-muted/30">
              <th class="px-3 py-2 text-left font-semibold">카드</th>
              <th class="px-3 py-2 text-right font-semibold">월 혜택</th>
              <th class="px-3 py-2 text-right font-semibold">연회비</th>
              <th class="px-3 py-2 text-right font-semibold">회수 기간</th>
              <th class="px-3 py-2 text-right font-semibold">ROI</th>
              <th class="px-3 py-2 text-right font-semibold">연 순혜택</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(result, idx) in results"
              :key="result.cardId"
              :class="[
                'border-b border-border/50 transition-colors',
                idx === 0 ? 'bg-savings/10 hover:bg-savings/15' : 'hover:bg-accent/20',
              ]"
            >
              <td class="px-3 py-2">
                <div class="flex items-center gap-1.5">
                  <span
                    class="inline-block h-2.5 w-2.5 rounded-sm"
                    :style="{ backgroundColor: result.card.issuerColor }"
                  />
                  <span class="whitespace-nowrap font-medium">{{ result.card.issuer }}</span>
                  <span class="whitespace-nowrap text-muted-foreground">{{ result.card.name }}</span>
                </div>
                <div v-if="!result.isMinSpendMet" class="mt-0.5 text-tiny text-status-warning">
                  실적 {{ result.minSpendGap.toLocaleString() }}원 부족
                </div>
              </td>
              <td class="px-3 py-2 text-right tabular-nums">▲ {{ result.totalMonthlyBenefit.toLocaleString() }}원</td>
              <td class="px-3 py-2 text-right tabular-nums">{{ result.annualFee.toLocaleString() }}원</td>
              <td class="px-3 py-2 text-right font-semibold tabular-nums">
                {{ formatBreakEven(result.breakEvenMonths) }}
              </td>
              <td class="px-3 py-2 text-right font-semibold tabular-nums text-savings">
                {{ formatRoiRatio(result.roiRatio) }}
              </td>
              <td
                class="px-3 py-2 text-right font-semibold tabular-nums"
                :class="result.annualNetBenefit >= 0 ? 'text-savings' : 'text-loss'"
              >
                {{ result.annualNetBenefit >= 0 ? '▲' : '▼' }} {{ Math.abs(result.annualNetBenefit).toLocaleString() }}원
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
