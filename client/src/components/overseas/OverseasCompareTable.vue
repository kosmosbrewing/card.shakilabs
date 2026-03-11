<script setup lang="ts">
import type { OverseasSortKey } from "@/composables/useOverseasCalc";
import type { OverseasCalcResult } from "@/utils/overseasCalculator";
import { formatFeeRate, formatPrimaryBenefit } from "@/utils/overseasCalculator";

defineProps<{
  results: OverseasCalcResult[];
  sortKey: OverseasSortKey;
}>();

const emit = defineEmits<{
  "update:sortKey": [value: OverseasSortKey];
}>();

const sortOptions: { key: OverseasSortKey; label: string }[] = [
  { key: "totalCost", label: "실부담 낮은순" },
  { key: "feeRate", label: "수수료 낮은순" },
  { key: "benefit", label: "혜택 큰순" },
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
              <div class="text-tiny text-muted-foreground">현지통화</div>
              <div class="text-caption font-semibold tabular-nums text-savings">▲ {{ result.localCurrencyNet.toLocaleString() }}원</div>
            </div>
            <div>
              <div class="text-tiny text-muted-foreground">DCC 손해</div>
              <div class="text-caption font-semibold tabular-nums text-loss">▼ {{ result.dccDifference.toLocaleString() }}원</div>
            </div>
            <div>
              <div class="text-tiny text-muted-foreground">수수료</div>
              <div class="text-caption font-semibold tabular-nums text-foreground">{{ formatFeeRate(result.card) }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="hidden overflow-x-auto -mx-4 sm:-mx-5 md:block">
        <table class="w-full table-fixed text-caption">
          <colgroup>
            <col class="w-[8%]" />
            <col class="w-[21%]" />
            <col class="w-[12%]" />
            <col class="w-[21%]" />
            <col class="w-[12%]" />
            <col class="w-[12%]" />
            <col class="w-[14%]" />
          </colgroup>
          <thead>
            <tr class="border-b border-border bg-muted/30">
              <th class="px-3 py-2 text-left font-semibold">순위</th>
              <th class="px-3 py-2 text-left font-semibold">카드</th>
              <th class="px-3 py-2 text-left font-semibold">총 수수료</th>
              <th class="px-3 py-2 text-left font-semibold">핵심 혜택</th>
              <th class="px-3 py-2 text-right font-semibold">현지통화</th>
              <th class="px-3 py-2 text-right font-semibold">DCC</th>
              <th class="px-3 py-2 text-right font-semibold">DCC 손해</th>
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
              <td class="px-3 py-2 font-bold tabular-nums">
                {{ idx === 0 ? "🏆" : idx + 1 }}
              </td>
              <td class="px-3 py-2">
                <div class="flex items-center gap-1.5">
                  <span
                    class="inline-block h-2.5 w-2.5 rounded-sm"
                    :style="{ backgroundColor: result.card.issuerColor }"
                  />
                  <span class="whitespace-nowrap font-medium">{{ result.card.issuer }}</span>
                  <span class="whitespace-nowrap text-muted-foreground">{{ result.card.name }}</span>
                </div>
              </td>
              <td class="px-3 py-2 whitespace-nowrap">{{ formatFeeRate(result.card) }}</td>
              <td class="px-3 py-2">{{ formatPrimaryBenefit(result.card) }}</td>
              <td class="px-3 py-2 text-right font-semibold tabular-nums text-savings">
                ▲ {{ result.localCurrencyNet.toLocaleString() }}원
              </td>
              <td class="px-3 py-2 text-right tabular-nums">
                {{ result.dccTotal.toLocaleString() }}원
              </td>
              <td class="px-3 py-2 text-right font-semibold tabular-nums text-loss">
                ▼ {{ result.dccDifference.toLocaleString() }}원
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
