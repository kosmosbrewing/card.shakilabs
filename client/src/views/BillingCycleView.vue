<script setup lang="ts">
import { computed, ref } from "vue";
import FreshBadge from "@/components/common/FreshBadge.vue";
import SEOHead from "@/components/common/SEOHead.vue";
import { BILLING_DAY_OPTIONS, CARD_TOOL_UPDATED_AT } from "@/data/cardTabData";
import { calculateBillingCycle } from "@/utils/cardTabCalculator";

const seoTitle = "결제일별 이용기간 계산기 | 카드 결제일에 따른 최대 유예일";
const seoDescription = "카드 결제일과 사용일을 기준으로 실제 결제까지 남는 이용 가능 기간을 계산합니다.";

const purchaseDay = ref(15);
const billingDay = ref<(typeof BILLING_DAY_OPTIONS)[number]>(14);
const result = computed(() => calculateBillingCycle({ purchaseDay: purchaseDay.value, billingDay: billingDay.value }));
</script>

<template>
  <SEOHead :title="seoTitle" :description="seoDescription" />

  <div class="container space-y-5 py-5">
    <div class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h1 class="retro-title">결제일별 이용기간 계산기</h1>
        <FreshBadge :message="`${CARD_TOOL_UPDATED_AT} 기준`" />
      </div>
      <div class="retro-panel-content grid gap-3 md:grid-cols-2">
        <label class="space-y-1 text-caption font-semibold text-foreground">
          카드 사용일
          <input v-model.number="purchaseDay" type="number" min="1" max="31" class="retro-input w-full" />
        </label>
        <label class="space-y-1 text-caption font-semibold text-foreground">
          결제일
          <select v-model.number="billingDay" class="retro-input w-full">
            <option v-for="day in BILLING_DAY_OPTIONS" :key="day" :value="day">{{ day }}일</option>
          </select>
        </label>
      </div>
    </div>

    <div class="grid gap-3 md:grid-cols-3">
      <div class="retro-panel-muted px-4 py-4">
        <p class="text-tiny text-muted-foreground">청구 사이클</p>
        <p class="mt-2 text-h2 font-bold text-foreground">{{ result.cycleDays }}일</p>
      </div>
      <div class="retro-panel-muted px-4 py-4">
        <p class="text-tiny text-muted-foreground">총 이용 가능 기간</p>
        <p class="mt-2 text-h2 font-bold text-primary">{{ result.usableDays }}일</p>
      </div>
      <div class="retro-panel-muted px-4 py-4">
        <p class="text-tiny text-muted-foreground">최적 결제일 직후 사용</p>
        <p class="mt-2 text-h2 font-bold text-foreground">{{ result.bestUsableDays }}일</p>
      </div>
    </div>

    <div class="retro-panel px-4 py-4 text-caption leading-relaxed text-foreground">
      현재 입력은 {{ result.nextStatementLabel }} 기준이며, 결제일 다음 날인 {{ result.bestPurchaseDay }}일에 결제하면 가장 긴 이용기간을 확보할 수 있습니다.
    </div>
  </div>
</template>
