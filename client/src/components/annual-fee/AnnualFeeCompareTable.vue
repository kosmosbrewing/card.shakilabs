<script setup lang="ts">
import { ShToggleGroup } from "@shakilabs/ui";
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

const sortToggleOptions: { value: AnnualFeeSortKey; label: string }[] = [
  { value: "netBenefit", label: "순혜택 높은순" },
  { value: "breakEven", label: "회수 빠른순" },
  { value: "annualFee", label: "연회비 낮은순" },
];
</script>

<template>
  <div class="retro-panel overflow-hidden">
    <div class="retro-titlebar rounded-t-2xl">
      <h2 class="retro-title">전체 카드 비교</h2>
      <!-- 정렬은 패키지 토글 그룹(세그먼트) — 앱 자체 칩 버튼을 ShPresetGroup·ShToggleGroup과 같은 문법으로(2026-11 UI 감사). -->
      <ShToggleGroup
        class="result-sort-options"
        :model-value="sortKey"
        :options="sortToggleOptions"
        label="정렬"
        @update:model-value="emit('update:sortKey', $event)"
      />
    </div>

    <div class="retro-panel-content">
      <div class="space-y-2 md:hidden">
        <div
          v-for="(result, idx) in results"
          :key="`${result.cardId}-mobile`"
          :class="[
            'rounded-xl border p-3',
            idx === 0 ? 'border-status-success/30 bg-status-success/10' : 'border-border/60 bg-background/60',
          ]"
        >
          <div class="flex items-center justify-between gap-3">
            <span class="text-caption font-semibold text-foreground">{{ idx === 0 ? "🏆 1위" : `${idx + 1}위` }}</span>
            <span class="text-tiny text-muted-foreground">{{ result.card.issuer }} {{ result.card.name }}</span>
          </div>
          <div class="result-metric-grid mt-2 grid grid-cols-3 gap-2">
            <div>
              <div class="text-tiny text-muted-foreground">월 혜택</div>
              <div class="text-caption font-semibold tabular-nums text-status-success">▲ {{ result.totalMonthlyBenefit.toLocaleString() }}원</div>
            </div>
            <div>
              <div class="text-tiny text-muted-foreground">회수 기간</div>
              <div class="text-caption font-semibold tabular-nums text-foreground">{{ formatBreakEven(result.breakEvenMonths) }}</div>
            </div>
            <div>
              <div class="text-tiny text-muted-foreground">연 순혜택</div>
              <div class="text-caption font-semibold tabular-nums" :class="result.annualNetBenefit >= 0 ? 'text-status-success' : 'text-status-danger'">
                {{ result.annualNetBenefit >= 0 ? '▲' : '▼' }} {{ Math.abs(result.annualNetBenefit).toLocaleString() }}원
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="hidden overflow-x-auto -mx-4 sm:-mx-5 md:block">
        <table aria-label="연회비 카드 비교" class="w-full table-fixed text-caption">
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
              <th scope="col" class="px-3 py-2 text-left font-semibold">카드</th>
              <th scope="col" class="px-3 py-2 text-right font-semibold">월 혜택</th>
              <th scope="col" class="px-3 py-2 text-right font-semibold">연회비</th>
              <th scope="col" class="px-3 py-2 text-right font-semibold">회수 기간</th>
              <th scope="col" class="px-3 py-2 text-right font-semibold">ROI</th>
              <th scope="col" class="px-3 py-2 text-right font-semibold">연 순혜택</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(result, idx) in results"
              :key="result.cardId"
              :class="[
                'border-b border-border/50 transition-colors',
                idx === 0 ? 'bg-status-success/10 hover:bg-status-success/15' : 'hover:bg-accent/20',
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
              <td class="px-3 py-2 text-right font-semibold tabular-nums text-status-success">
                {{ formatRoiRatio(result.roiRatio) }}
              </td>
              <td
                class="px-3 py-2 text-right font-semibold tabular-nums"
                :class="result.annualNetBenefit >= 0 ? 'text-status-success' : 'text-status-danger'"
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
