<script setup lang="ts">
import { AlertTriangle, BadgeCheck } from "lucide-vue-next";
import type { DutyFreeCalcResult } from "@/utils/dutyFreeCalculator";
import { isExempt } from "@/utils/dutyFreeCalculator";

defineProps<{
  result: DutyFreeCalcResult;
}>();
</script>

<template>
  <div class="retro-panel overflow-hidden">
    <div class="retro-titlebar rounded-t-2xl">
      <h2 class="retro-title">예상 세금 결과</h2>
    </div>

    <div class="retro-panel-content space-y-3">
      <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div class="text-center">
          <div class="text-tiny text-muted-foreground">구매액</div>
          <div class="text-heading font-bold tabular-nums text-foreground">
            ${{ result.purchaseAmountUsd.toLocaleString() }}
          </div>
        </div>
        <div class="text-center">
          <div class="text-tiny text-muted-foreground">면세 한도</div>
          <div class="text-heading font-bold tabular-nums text-foreground">
            ${{ result.exemptionUsd }}
          </div>
        </div>
        <div class="text-center">
          <div class="text-tiny text-muted-foreground">과세 대상</div>
          <div class="text-heading font-bold tabular-nums text-status-warning">
            ${{ result.taxableAmountUsd.toLocaleString() }}
          </div>
        </div>
        <div class="text-center">
          <div class="text-tiny text-muted-foreground">최종 세액</div>
          <div class="text-heading font-bold tabular-nums text-loss">
            {{ result.finalTax.toLocaleString() }}원
          </div>
        </div>
      </div>

      <div
        v-if="isExempt(result)"
        class="flex items-center gap-2 rounded-xl border border-savings/25 bg-savings/10 px-3 py-2 text-caption font-semibold text-savings"
      >
        <BadgeCheck class="h-4 w-4" />
        면세 한도 이하여서 세금은 0원으로 예상됩니다.
      </div>
      <div
        v-else
        class="flex items-center gap-2 rounded-xl border border-loss/25 bg-loss/10 px-3 py-2 text-caption font-semibold text-loss"
      >
        <AlertTriangle class="h-4 w-4" />
        {{ result.finalTaxMethod === "simplified" ? "간이세율" : "일반세율" }} 기준 참고 계산으로 {{ result.finalTax.toLocaleString() }}원 세금이 예상됩니다.
      </div>

      <div class="grid gap-2 sm:grid-cols-2">
        <div class="retro-panel-muted px-3 py-3">
          <div class="text-caption text-muted-foreground">실효 세율</div>
          <div class="mt-1 text-heading font-bold tabular-nums text-foreground">
            {{ (result.effectiveTaxRate * 100).toFixed(1) }}%
          </div>
        </div>
        <div class="retro-panel-muted px-3 py-3">
          <div class="text-caption text-muted-foreground">세금 포함 총 원화 비용</div>
          <div class="mt-1 text-heading font-bold tabular-nums text-foreground">
            {{ result.totalCostKrw.toLocaleString() }}원
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
