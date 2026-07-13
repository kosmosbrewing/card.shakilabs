<script setup lang="ts">
import { computed } from "vue";
import { RouterLink, useRoute } from "vue-router";
import {
  ShPrimaryNavigation,
  type PrimaryNavigationItem,
} from "@shakilabs/ui";

const route = useRoute();
const tabs: readonly PrimaryNavigationItem[] = [
  { key: "all", label: "카드 도구", to: "/all" },
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
];

const mobileDefaultKeys = [
  "all",
  "fuel-card",
  "overseas-payment",
  "min-spend",
  "annual-fee",
  "customs",
] as const;

const activeItem = computed(() =>
  tabs.find((item) => route.path.startsWith(`/${item.key}`)),
);

const mobileItems = computed(() => {
  const keys: string[] = [...mobileDefaultKeys];

  if (activeItem.value && !keys.includes(activeItem.value.key)) {
    keys[4] = activeItem.value.key;
  }

  return keys
    .map((key) => tabs.find((item) => item.key === key))
    .filter((item): item is PrimaryNavigationItem => Boolean(item));
});
</script>

<template>
  <ShPrimaryNavigation
    :items="tabs"
    :mobile-items="mobileItems"
    :active-key="activeItem?.key"
    :link-component="RouterLink"
  />
</template>
