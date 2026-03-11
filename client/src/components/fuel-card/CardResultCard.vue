<script setup lang="ts">
import { Trophy, AlertTriangle, CheckCircle } from "lucide-vue-next";
import type { FuelCardCalcResult } from "@/utils/calculator";
import { formatDiscountType } from "@/utils/calculator";

const props = defineProps<{
  result: FuelCardCalcResult;
  rank: number;
}>();
</script>

<template>
  <div
    :class="[
      'retro-panel overflow-hidden transition-all',
      rank === 1 && 'ring-2 ring-primary/40',
    ]"
  >
    <!-- 순위 헤더 -->
    <div class="retro-titlebar rounded-t-2xl">
      <h3 class="retro-title flex items-center gap-2">
        <Trophy v-if="rank === 1" class="h-4 w-4 text-primary" />
        <span>{{ rank === 1 ? '🏆 1위' : `${rank}위` }}</span>
      </h3>
    </div>

    <div class="retro-panel-content space-y-3">
      <!-- 카드사 + 카드명 -->
      <div class="flex items-center gap-2">
        <span
          class="inline-block h-3 w-3 rounded-sm"
          :style="{ backgroundColor: result.card.issuerColor }"
        />
        <span class="text-body font-bold text-foreground">
          {{ result.card.issuer }}
        </span>
        <span class="text-body text-muted-foreground">
          {{ result.card.name }}
        </span>
      </div>

      <!-- 핵심 수치 -->
      <div class="grid grid-cols-3 gap-2">
        <div class="text-center">
          <div class="text-tiny text-muted-foreground">월 절약</div>
          <div class="text-heading font-bold tabular-nums text-savings">
            {{ result.monthlyNet.toLocaleString() }}원
          </div>
        </div>
        <div class="text-center">
          <div class="text-tiny text-muted-foreground">연 절약</div>
          <div class="text-heading font-bold tabular-nums text-savings">
            {{ result.annualNet.toLocaleString() }}원
          </div>
        </div>
        <div class="text-center">
          <div class="text-tiny text-muted-foreground">체감 유가</div>
          <div class="text-heading font-bold tabular-nums">
            {{ result.effectivePrice.toLocaleString() }}원/L
          </div>
        </div>
      </div>

      <!-- 할인 방식 + 경고 -->
      <div class="space-y-1 text-caption">
        <div class="text-muted-foreground">
          {{ formatDiscountType(result.card) }}
        </div>

        <!-- 브랜드 제한 표시 -->
        <div
          v-if="result.card.discount.brandRestriction.length > 0"
          class="flex items-center gap-1 text-status-warning"
        >
          <AlertTriangle class="h-3.5 w-3.5" />
          {{ result.card.discount.brandRestriction.join(', ') }} 전용
        </div>
        <div
          v-else
          class="flex items-center gap-1 text-savings"
        >
          <CheckCircle class="h-3.5 w-3.5" />
          전 주유소 가능
        </div>

        <!-- 전월 실적 -->
        <div class="text-muted-foreground">
          전월 실적: {{ result.card.discount.minSpend.toLocaleString() }}원
        </div>

        <!-- 실적 미달 경고 -->
        <div
          v-if="result.isMinSpendWarning"
          class="flex items-center gap-1 text-status-warning"
        >
          <AlertTriangle class="h-3.5 w-3.5" />
          전월 실적 미달 가능
        </div>

        <!-- 할인 한도 초과 -->
        <div
          v-if="result.isCapExceeded"
          class="text-status-warning"
        >
          한도 초과 — 실제 할인은 월 {{ result.card.discount.monthlyCap.toLocaleString() }}원까지
        </div>

        <!-- 연회비 -->
        <div class="text-muted-foreground">
          연회비: {{ result.card.annualFee.toLocaleString() }}원
        </div>
      </div>
    </div>
  </div>
</template>
