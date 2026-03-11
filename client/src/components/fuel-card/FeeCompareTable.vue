<script setup lang="ts">
import type { FuelCardCalcResult } from "@/utils/calculator";
import { formatDiscountType } from "@/utils/calculator";
import type { SortKey } from "@/composables/useFuelCardCalc";

defineProps<{
  results: FuelCardCalcResult[];
  mismatchResults: FuelCardCalcResult[];
  sortKey: SortKey;
}>();

const emit = defineEmits<{
  "update:sortKey": [value: SortKey];
}>();

const sortOptions: { key: SortKey; label: string }[] = [
  { key: "savings", label: "절약액 높은순" },
  { key: "annualFee", label: "연회비 낮은순" },
  { key: "minSpend", label: "전월실적 낮은순" },
];
</script>

<template>
  <div class="retro-panel overflow-hidden">
    <div class="retro-titlebar rounded-t-2xl">
      <h2 class="retro-title">전체 카드 비교</h2>
      <div class="flex gap-1">
        <button
          v-for="opt in sortOptions"
          :key="opt.key"
          type="button"
          :class="[
            'touch-target rounded-lg border px-2 py-1 text-tiny font-medium transition-colors',
            sortKey === opt.key
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-border/70 text-muted-foreground hover:text-primary',
          ]"
          @click="emit('update:sortKey', opt.key)"
        >
          {{ opt.label }}
        </button>
      </div>
    </div>

    <div class="retro-panel-content">
      <div class="space-y-2 md:hidden">
        <div
          v-for="(r, idx) in results"
          :key="`${r.cardId}-mobile`"
          :class="[
            'rounded-xl border p-3',
            idx === 0 ? 'border-savings/30 bg-savings/10' : 'border-border/60 bg-background/60',
          ]"
        >
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-1.5">
              <span class="inline-block h-2.5 w-2.5 rounded-sm" :style="{ backgroundColor: r.card.issuerColor }" />
              <span class="text-caption font-semibold text-foreground">{{ idx === 0 ? "🏆 1위" : `${idx + 1}위` }}</span>
            </div>
            <span class="text-tiny text-muted-foreground">{{ r.card.issuer }} {{ r.card.name }}</span>
          </div>
          <div class="mt-2 grid grid-cols-3 gap-2">
            <div>
              <div class="text-tiny text-muted-foreground">월 절약</div>
              <div class="text-caption font-semibold tabular-nums text-savings">▲ {{ r.monthlyNet.toLocaleString() }}원</div>
            </div>
            <div>
              <div class="text-tiny text-muted-foreground">연 절약</div>
              <div class="text-caption font-semibold tabular-nums text-savings">▲ {{ r.annualNet.toLocaleString() }}원</div>
            </div>
            <div>
              <div class="text-tiny text-muted-foreground">실적</div>
              <div class="text-caption font-semibold tabular-nums text-foreground">{{ r.card.discount.minSpend.toLocaleString() }}원</div>
            </div>
          </div>
        </div>
      </div>

      <div class="hidden overflow-x-auto -mx-4 sm:-mx-5 md:block">
        <table class="w-full table-fixed text-caption">
          <colgroup>
            <col class="w-[8%]" />
            <col class="w-[21%]" />
            <col class="w-[17%]" />
            <col class="w-[12%]" />
            <col class="w-[12%]" />
            <col class="w-[10%]" />
            <col class="w-[10%]" />
            <col class="w-[10%]" />
          </colgroup>
          <thead>
            <tr class="border-b border-border bg-muted/30">
              <th class="px-3 py-2 text-left font-semibold">순위</th>
              <th class="px-3 py-2 text-left font-semibold">카드</th>
              <th class="px-3 py-2 text-left font-semibold">할인 방식</th>
              <th class="px-3 py-2 text-right font-semibold">월 절약</th>
              <th class="px-3 py-2 text-right font-semibold">연 절약</th>
              <th class="px-3 py-2 text-right font-semibold">체감유가</th>
              <th class="px-3 py-2 text-right font-semibold">전월실적</th>
              <th class="px-3 py-2 text-left font-semibold">주유소</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(r, idx) in results"
              :key="r.cardId"
              :class="[
                'border-b border-border/50 transition-colors',
                idx === 0 ? 'bg-savings/10 hover:bg-savings/15' : 'hover:bg-accent/20',
              ]"
            >
              <td class="px-3 py-2 font-bold tabular-nums">
                {{ idx === 0 ? '🏆' : idx + 1 }}
              </td>
              <td class="px-3 py-2">
                <div class="flex items-center gap-1.5">
                  <span
                    class="inline-block h-2.5 w-2.5 rounded-sm"
                    :style="{ backgroundColor: r.card.issuerColor }"
                  />
                  <span class="font-medium whitespace-nowrap">{{ r.card.issuer }}</span>
                  <span class="text-muted-foreground whitespace-nowrap">{{ r.card.name }}</span>
                </div>
              </td>
              <td class="px-3 py-2 whitespace-nowrap">{{ formatDiscountType(r.card) }}</td>
              <td class="px-3 py-2 text-right tabular-nums font-semibold text-savings">
                ▲ {{ r.monthlyNet.toLocaleString() }}원
              </td>
              <td class="px-3 py-2 text-right tabular-nums font-semibold text-savings">
                ▲ {{ r.annualNet.toLocaleString() }}원
              </td>
              <td class="px-3 py-2 text-right tabular-nums">
                {{ r.effectivePrice.toLocaleString() }}원
              </td>
              <td class="px-3 py-2 text-right tabular-nums">
                {{ r.card.discount.minSpend.toLocaleString() }}원
              </td>
              <td class="px-3 py-2 whitespace-nowrap">
                <template v-if="r.card.discount.brandRestriction.length > 0">
                  <span class="text-status-warning">
                    {{ r.card.discount.brandRestriction.join(', ') }}
                  </span>
                </template>
                <template v-else>
                  <span class="text-savings">전체</span>
                </template>
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
                v-for="r in mismatchResults"
                :key="r.cardId"
                class="border-b border-border/30"
              >
                <td class="px-3 py-2">
                  <div class="flex items-center gap-1.5">
                    <span class="inline-block h-2.5 w-2.5 rounded-sm" :style="{ backgroundColor: r.card.issuerColor }" />
                    <span>{{ r.card.issuer }} {{ r.card.name }}</span>
                  </div>
                </td>
                <td class="px-3 py-2 text-muted-foreground">
                  {{ r.card.discount.brandRestriction.join(', ') }} 전용
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
