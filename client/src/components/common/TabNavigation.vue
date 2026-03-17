<script setup lang="ts">
import { computed } from "vue";
import { useRoute, RouterLink } from "vue-router";

const route = useRoute();

const tabs = [
  { key: "fuel-card", label: "주유 할인카드", to: "/fuel-card" },
  { key: "overseas-payment", label: "해외결제 비교", to: "/overseas-payment" },
  { key: "min-spend", label: "실적 채우기", to: "/min-spend" },
  { key: "annual-fee", label: "연회비 회수", to: "/annual-fee" },
  { key: "duty-free", label: "관세 계산", to: "/duty-free" },
  { key: "mileage", label: "마일리지 가치", to: "/mileage" },
  { key: "credit-vs-debit", label: "신용 vs 체크", to: "/credit-vs-debit" },
  { key: "point-convert", label: "포인트 전환", to: "/point-convert" },
  { key: "billing-cycle", label: "결제일 이용기간", to: "/billing-cycle" },
  { key: "customs", label: "직구 관세", to: "/customs" },
] as const;

const activePath = computed(() => route.path);

function isActiveTab(key: (typeof tabs)[number]["key"]): boolean {
  return activePath.value.startsWith(`/${key}`);
}
</script>

<template>
  <nav class="sticky top-0 z-50 border-b border-primary/20 bg-primary shadow-sm" aria-label="주요 메뉴">
    <div class="container">
      <div class="flex h-12 items-center gap-2 overflow-x-auto" style="scrollbar-width: none">
        <RouterLink
          v-for="tab in tabs"
          :key="tab.key"
          :to="tab.to"
          :class="[
            'touch-target relative inline-flex h-12 shrink-0 items-center px-3 text-body font-semibold transition-all duration-200',
            isActiveTab(tab.key)
              ? 'text-primary-foreground'
              : 'text-primary-foreground/70 hover:text-primary-foreground/90',
          ]"
        >
          {{ tab.label }}
          <span
            v-if="isActiveTab(tab.key)"
            class="absolute inset-x-1 bottom-0 h-[3px] rounded-full bg-white"
          />
        </RouterLink>
      </div>
    </div>
  </nav>
</template>
