<script setup lang="ts">
import type { MinSpendSortKey } from "@/composables/useMinSpendCalc";
import type { MinSpendCalcResult } from "@/utils/minSpendCalculator";
import { formatQualificationStatus } from "@/utils/minSpendCalculator";

defineProps<{
  results: MinSpendCalcResult[];
  mismatchResults: MinSpendCalcResult[];
  sortKey: MinSpendSortKey;
}>();

const emit = defineEmits<{
  "update:sortKey": [value: MinSpendSortKey];
}>();

const sortOptions: { key: MinSpendSortKey; label: string }[] = [
  { key: "netBenefit", label: "순혜택 높은순" },
  { key: "gap", label: "부족액 적은순" },
  { key: "minSpend", label: "실적 조건 낮은순" },
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
              <th class="px-3 py-2 text-left font-semibold">순위</th>
              <th class="px-3 py-2 text-left font-semibold">카드</th>
              <th class="px-3 py-2 text-left font-semibold">실적 상태</th>
              <th class="px-3 py-2 text-right font-semibold">부족액</th>
              <th class="px-3 py-2 text-right font-semibold">월 할인</th>
              <th class="px-3 py-2 text-right font-semibold">순혜택</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(result, idx) in results"
              :key="result.cardId"
              class="border-b border-border/50 transition-colors hover:bg-accent/20"
            >
              <td class="px-3 py-2 font-bold tabular-nums">{{ idx === 0 ? "🏆" : idx + 1 }}</td>
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
              <td class="px-3 py-2">{{ formatQualificationStatus(result) }}</td>
              <td class="px-3 py-2 text-right tabular-nums">{{ result.gap.toLocaleString() }}원</td>
              <td class="px-3 py-2 text-right tabular-nums">{{ result.monthlyDiscount.toLocaleString() }}원</td>
              <td
                class="px-3 py-2 text-right font-semibold tabular-nums"
                :class="result.netBenefitIncludingGap >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'"
              >
                {{ result.netBenefitIncludingGap.toLocaleString() }}원
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="mismatchResults.length > 0" class="mt-3 space-y-2">
        <p class="text-caption text-muted-foreground">주유소 제한으로 미적용</p>
        <div class="overflow-x-auto -mx-4 sm:-mx-5 opacity-60">
          <table class="w-full text-caption">
            <tbody>
              <tr
                v-for="result in mismatchResults"
                :key="result.cardId"
                class="border-b border-border/30"
              >
                <td class="px-3 py-2">
                  <div class="flex items-center gap-1.5">
                    <span
                      class="inline-block h-2.5 w-2.5 rounded-sm"
                      :style="{ backgroundColor: result.card.issuerColor }"
                    />
                    <span>{{ result.card.issuer }} {{ result.card.name }}</span>
                  </div>
                </td>
                <td class="px-3 py-2 text-muted-foreground">
                  {{ result.card.discount.brandRestriction.join(", ") }} 전용
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
