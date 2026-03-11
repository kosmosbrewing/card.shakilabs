<script setup lang="ts">
import type { DutyFreeCalcResult } from "@/utils/dutyFreeCalculator";

defineProps<{
  result: DutyFreeCalcResult;
}>();
</script>

<template>
  <div class="retro-panel overflow-hidden">
    <div class="retro-titlebar rounded-t-2xl">
      <h2 class="retro-title">일반세율 vs 간이세율</h2>
    </div>

    <div class="grid gap-px bg-border/60 sm:grid-cols-2">
      <div class="bg-card p-4 sm:p-5">
        <p class="mb-3 text-caption font-semibold text-muted-foreground">일반세율</p>
        <div class="space-y-1.5 text-body">
          <p class="tabular-nums text-muted-foreground">
            과세 대상 {{ result.taxableAmountKrw.toLocaleString() }}원
          </p>
          <p class="tabular-nums text-muted-foreground">
            관세 {{ result.tariffAmount.toLocaleString() }}원 ({{ (result.tariffRate * 100).toFixed(0) }}%)
          </p>
          <p class="tabular-nums text-muted-foreground">
            부가세 {{ result.vatAmount.toLocaleString() }}원
          </p>
          <p class="border-t border-border/60 pt-2 text-heading font-bold tabular-nums text-foreground">
            = {{ result.normalTotalTax.toLocaleString() }}원
          </p>
        </div>
      </div>

      <div class="bg-muted/15 p-4 sm:p-5">
        <p class="mb-3 text-caption font-semibold text-muted-foreground">간이세율</p>
        <div class="space-y-1.5 text-body">
          <template v-if="result.isSimplifiedApplicable && result.simplifiedTax != null && result.simplifiedRate != null">
            <p class="tabular-nums text-muted-foreground">
              과세 대상 {{ result.taxableAmountKrw.toLocaleString() }}원
            </p>
            <p class="tabular-nums text-muted-foreground">
              간이세율 {{ (result.simplifiedRate * 100).toFixed(0) }}%
            </p>
            <p class="border-t border-border/60 pt-2 text-heading font-bold tabular-nums text-foreground">
              = {{ result.simplifiedTax.toLocaleString() }}원
            </p>
            <p
              class="text-caption font-semibold"
              :class="result.isSimplifiedBetter ? 'text-savings' : 'text-muted-foreground'"
            >
              {{ result.isSimplifiedBetter ? "간이세율이 더 유리합니다." : "일반세율보다 불리하거나 동일합니다." }}
            </p>
          </template>
          <template v-else>
            <p class="text-caption leading-relaxed text-muted-foreground">
              이 카테고리는 간이세율 대상이 아니거나 적용 상한을 넘어 일반세율만 사용됩니다.
            </p>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
