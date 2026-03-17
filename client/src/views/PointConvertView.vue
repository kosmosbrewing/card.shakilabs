<script setup lang="ts">
import { computed, ref } from "vue";
import FreshBadge from "@/components/common/FreshBadge.vue";
import SEOHead from "@/components/common/SEOHead.vue";
import { CARD_TOOL_UPDATED_AT } from "@/data/cardTabData";
import { formatWon } from "@/lib/utils";
import { calculatePointConversions } from "@/utils/cardTabCalculator";

const seoTitle = "포인트 전환 비교 | 항공·호텔·현금성 포인트 가치 계산";
const seoDescription = "보유 포인트를 어디로 넘겨야 가치가 큰지 예상 환산가치 기준으로 비교합니다.";

const pointAmount = ref(120_000);
const result = computed(() => calculatePointConversions({ pointAmount: pointAmount.value }));
</script>

<template>
  <SEOHead :title="seoTitle" :description="seoDescription" />

  <div class="container space-y-5 py-5">
    <div class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h1 class="retro-title">포인트 전환 비교</h1>
        <FreshBadge :message="`${CARD_TOOL_UPDATED_AT} 기준`" />
      </div>
      <div class="retro-panel-content space-y-4">
        <label class="space-y-1 text-caption font-semibold text-foreground">
          보유 포인트
          <input v-model.number="pointAmount" type="number" min="1000" step="1000" class="retro-input w-full" />
        </label>
        <div class="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-caption text-foreground">
          가장 높은 예상 가치는 <strong>{{ result.bestOption.label }}</strong> 전환이며 약 {{ formatWon(result.bestOption.estimatedValue) }}입니다.
        </div>
      </div>
    </div>

    <div class="grid gap-3">
      <div v-for="item in result.items" :key="item.key" class="retro-panel-muted px-4 py-4">
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="text-body font-semibold text-foreground">{{ item.label }}</p>
            <p class="text-tiny text-muted-foreground">{{ item.note }}</p>
          </div>
          <div class="text-right">
            <p class="text-body font-bold text-foreground">{{ formatWon(item.estimatedValue) }}</p>
            <p class="text-tiny text-muted-foreground">{{ item.units.toLocaleString() }} {{ item.unitLabel }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
