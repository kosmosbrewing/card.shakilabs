<script setup lang="ts">
import { computed, ref } from "vue";
import FreshBadge from "@/components/common/FreshBadge.vue";
import SEOHead from "@/components/common/SEOHead.vue";
import { CARD_CUSTOMS_CATEGORIES, CARD_TOOL_UPDATED_AT } from "@/data/cardTabData";
import { formatWon } from "@/lib/utils";
import { calculateCustoms } from "@/utils/cardTabCalculator";

const seoTitle = "해외직구 관세 계산기 | 상품가+배송비 기준 예상 세금";
const seoDescription = "해외직구 상품가와 배송비를 입력하면 품목별 예상 관부가세를 계산합니다.";

const productUsd = ref(280);
const shippingUsd = ref(20);
const categoryKey = ref("fashion");

const result = computed(() => calculateCustoms({
  productUsd: productUsd.value,
  shippingUsd: shippingUsd.value,
  categoryKey: categoryKey.value,
}));
</script>

<template>
  <SEOHead :title="seoTitle" :description="seoDescription" />

  <div class="container space-y-5 py-5">
    <div class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h1 class="retro-title">해외직구 관세 계산기</h1>
        <FreshBadge :message="`${CARD_TOOL_UPDATED_AT} 기준`" />
      </div>
      <div class="retro-panel-content grid gap-3 md:grid-cols-3">
        <label class="space-y-1 text-caption font-semibold text-foreground">
          상품가(USD)
          <input v-model.number="productUsd" type="number" min="1" class="retro-input w-full" />
        </label>
        <label class="space-y-1 text-caption font-semibold text-foreground">
          배송비(USD)
          <input v-model.number="shippingUsd" type="number" min="0" class="retro-input w-full" />
        </label>
        <label class="space-y-1 text-caption font-semibold text-foreground">
          품목
          <select v-model="categoryKey" class="retro-input w-full">
            <option v-for="item in CARD_CUSTOMS_CATEGORIES" :key="item.key" :value="item.key">{{ item.label }}</option>
          </select>
        </label>
      </div>
    </div>

    <div class="grid gap-3 md:grid-cols-3">
      <div class="retro-panel-muted px-4 py-4">
        <p class="text-tiny text-muted-foreground">총 결제 금액</p>
        <p class="mt-2 text-h2 font-bold text-foreground">{{ result.totalUsd.toLocaleString() }}달러</p>
      </div>
      <div class="retro-panel-muted px-4 py-4">
        <p class="text-tiny text-muted-foreground">예상 관부가세</p>
        <p class="mt-2 text-h2 font-bold text-primary">{{ formatWon(result.totalTax) }}</p>
      </div>
      <div class="retro-panel-muted px-4 py-4">
        <p class="text-tiny text-muted-foreground">원화 착지가</p>
        <p class="mt-2 text-h2 font-bold text-foreground">{{ formatWon(result.landedCost) }}</p>
      </div>
    </div>

    <div class="retro-panel px-4 py-4 text-caption leading-relaxed text-foreground">
      {{ result.category.label }} 기준, 총 금액이 {{ result.category.thresholdUsd }}달러를 넘으면 과세 대상으로 보고 예상 관세 {{ formatWon(result.tariff) }}, 부가세 {{ formatWon(result.vat) }}를 계산합니다.
    </div>
  </div>
</template>
