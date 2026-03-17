<script setup lang="ts">
import { computed, ref } from "vue";
import FreshBadge from "@/components/common/FreshBadge.vue";
import SEOHead from "@/components/common/SEOHead.vue";
import { CARD_TOOL_UPDATED_AT } from "@/data/cardTabData";
import { formatPercent, formatWon } from "@/lib/utils";
import { compareCreditVsDebit } from "@/utils/cardTabCalculator";

const seoTitle = "신용카드 vs 체크카드 비교 | 연회비까지 반영한 실속 계산";
const seoDescription = "월 카드 사용액과 연회비를 기준으로 신용카드와 체크카드 중 어떤 쪽이 더 실속인지 계산합니다.";

const monthlySpend = ref(1_200_000);
const annualFee = ref(20_000);
const creditRate = ref(0.018);
const debitRate = ref(0.007);

const result = computed(() => compareCreditVsDebit({
  monthlySpend: monthlySpend.value,
  annualFee: annualFee.value,
  creditRate: creditRate.value,
  debitRate: debitRate.value,
}));
</script>

<template>
  <SEOHead :title="seoTitle" :description="seoDescription" />

  <div class="container space-y-5 py-5">
    <div class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h1 class="retro-title">신용카드 vs 체크카드 비교</h1>
        <FreshBadge :message="`${CARD_TOOL_UPDATED_AT} 기준`" />
      </div>
      <div class="retro-panel-content space-y-4">
        <div class="grid gap-3 md:grid-cols-2">
          <label class="space-y-1 text-caption font-semibold text-foreground">
            월 카드 사용액
            <input v-model.number="monthlySpend" type="number" min="100000" step="10000" class="retro-input w-full" />
          </label>
          <label class="space-y-1 text-caption font-semibold text-foreground">
            신용카드 연회비
            <input v-model.number="annualFee" type="number" min="0" step="1000" class="retro-input w-full" />
          </label>
          <label class="space-y-1 text-caption font-semibold text-foreground">
            신용카드 혜택률
            <input v-model.number="creditRate" type="number" min="0" max="0.1" step="0.001" class="retro-input w-full" />
          </label>
          <label class="space-y-1 text-caption font-semibold text-foreground">
            체크카드 혜택률
            <input v-model.number="debitRate" type="number" min="0" max="0.1" step="0.001" class="retro-input w-full" />
          </label>
        </div>
        <p class="text-caption text-muted-foreground">
          현재 설정은 신용카드 {{ formatPercent(creditRate, 1) }}, 체크카드 {{ formatPercent(debitRate, 1) }}를 가정합니다.
        </p>
      </div>
    </div>

    <div class="grid gap-3 md:grid-cols-3">
      <div class="retro-panel-muted px-4 py-4">
        <p class="text-tiny text-muted-foreground">신용카드 순혜택</p>
        <p class="mt-2 text-h2 font-bold text-foreground">{{ formatWon(result.annualCreditBenefit) }}</p>
      </div>
      <div class="retro-panel-muted px-4 py-4">
        <p class="text-tiny text-muted-foreground">체크카드 순혜택</p>
        <p class="mt-2 text-h2 font-bold text-foreground">{{ formatWon(result.annualDebitBenefit) }}</p>
      </div>
      <div class="retro-panel-muted px-4 py-4">
        <p class="text-tiny text-muted-foreground">추천</p>
        <p class="mt-2 text-h2 font-bold text-primary">{{ result.winner === "credit" ? "신용카드" : "체크카드" }}</p>
      </div>
    </div>

    <div class="retro-panel px-4 py-4 text-caption leading-relaxed text-foreground">
      연간 차이는 {{ formatWon(result.gap) }}입니다.
      <span v-if="result.breakEvenSpend != null"> 신용카드가 유리해지려면 월 {{ formatWon(result.breakEvenSpend) }} 이상 써야 합니다.</span>
    </div>
  </div>
</template>
