<script setup lang="ts">
import type { Component } from "vue";
import { ArrowRight, Calculator, CarFront, Plane } from "lucide-vue-next";

type RelatedServiceItem = {
  title: string;
  description: string;
  href: string;
  icon: Component;
};

const items: RelatedServiceItem[] = [
  {
    title: "연봉 실수령액 계산",
    description: "카드값을 줄이기 전에 월 실수령과 고정지출 여력을 먼저 점검합니다.",
    href: "/finance/salary",
    icon: Calculator,
  },
  {
    title: "자동차 취등록세 계산",
    description: "차량 구매 직후 드는 세금과 초기비용까지 한 번에 계산합니다.",
    href: "/car/tax",
    icon: CarFront,
  },
  {
    title: "여행 환전 계산",
    description: "해외결제 카드와 함께 환전 비용까지 비교해 여행 지출을 줄입니다.",
    href: "/travel/exchange",
    icon: Plane,
  },
];
</script>

<template>
  <section class="retro-panel overflow-hidden">
    <div class="retro-titlebar rounded-t-2xl">
      <h2 class="retro-title">관련 서비스</h2>
    </div>
    <div class="retro-panel-content space-y-4">
      <p class="text-caption leading-relaxed text-muted-foreground">
        주유비를 줄였다면 월 실수령, 차량 초기비용, 여행 환전 비용도 이어서 확인해 보세요.
      </p>
      <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <a
          v-for="item in items"
          :key="item.href"
          :href="item.href"
          class="group flex flex-col rounded-[1.6rem] border border-border/70 bg-card p-4 text-left transition-[background-color,border-color,transform,box-shadow] duration-200 hover:-translate-y-[1px] hover:border-primary/25 hover:bg-muted/15"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-body font-bold text-foreground">{{ item.title }}</p>
              <p class="mt-1.5 text-caption text-muted-foreground">{{ item.description }}</p>
            </div>
            <span class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary">
              <component :is="item.icon" class="h-5 w-5" />
            </span>
          </div>
          <p class="mt-3 inline-flex items-center gap-1 text-caption font-semibold text-primary">
            바로 가기
            <ArrowRight class="h-3.5 w-3.5" />
          </p>
        </a>
      </div>
    </div>
  </section>
</template>
