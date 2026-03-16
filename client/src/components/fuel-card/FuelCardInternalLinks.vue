<script setup lang="ts">
import { RouterLink } from "vue-router";
import { ISSUER_DISPLAY_NAME } from "@/data/fuelCards";

const issuerLinks = Object.entries(ISSUER_DISPLAY_NAME).map(([slug, name]) => ({
  slug,
  name,
  to: `/fuel-card/${slug}`,
}));

const monthlyLinks = [
  { amount: 200000, label: "월 20만원 주유" },
  { amount: 300000, label: "월 30만원 주유" },
  { amount: 500000, label: "월 50만원 주유" },
];
</script>

<template>
  <div class="space-y-3">
    <div class="section-heading-block">
      <h2 class="section-title">더 알아보기</h2>
    </div>

    <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
      <RouterLink
        v-for="link in issuerLinks"
        :key="link.slug"
        :to="link.to"
        class="retro-panel-muted px-3 py-2.5 text-caption font-medium text-foreground transition-colors hover:text-primary"
      >
        {{ link.name }} 주유 할인
      </RouterLink>
    </div>

    <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
      <RouterLink
        v-for="link in monthlyLinks"
        :key="link.amount"
        :to="`/fuel-card/monthly/${link.amount}`"
        class="retro-panel-muted px-3 py-2.5 text-caption font-medium text-foreground transition-colors hover:text-primary"
      >
        {{ link.label }} 최적 카드
      </RouterLink>
      <RouterLink
        to="/fuel-card/gasoline"
        class="retro-panel-muted px-3 py-2.5 text-caption font-medium text-foreground transition-colors hover:text-primary"
      >
        휘발유 할인카드 비교
      </RouterLink>
      <RouterLink
        to="/fuel-card/diesel"
        class="retro-panel-muted px-3 py-2.5 text-caption font-medium text-foreground transition-colors hover:text-primary"
      >
        경유 할인카드 비교
      </RouterLink>
      <RouterLink
        to="/annual-fee"
        class="retro-panel-muted px-3 py-2.5 text-caption font-medium text-foreground transition-colors hover:text-primary"
      >
        연회비 회수 계산기
      </RouterLink>
      <RouterLink
        to="/duty-free"
        class="retro-panel-muted px-3 py-2.5 text-caption font-medium text-foreground transition-colors hover:text-primary"
      >
        관세 계산기
      </RouterLink>
      <RouterLink
        to="/mileage"
        class="retro-panel-muted px-3 py-2.5 text-caption font-medium text-foreground transition-colors hover:text-primary"
      >
        마일리지 가치 계산기
      </RouterLink>
      <RouterLink
        to="/overseas-payment"
        class="retro-panel-muted px-3 py-2.5 text-caption font-medium text-foreground transition-colors hover:text-primary"
      >
        해외결제 카드 비교
      </RouterLink>
      <RouterLink
        to="/min-spend"
        class="retro-panel-muted px-3 py-2.5 text-caption font-medium text-foreground transition-colors hover:text-primary"
      >
        전월 실적 계산기
      </RouterLink>
    </div>
  </div>
</template>
