<script setup lang="ts">
import type { Component } from "vue";
import { ArrowRight, Calculator, Plane, Tv } from "lucide-vue-next";

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
  // 2026-11-01: /car/tax는 10-16 색인 소거(noindex) 페이지라 크롤러를 색인 불가 페이지로 보내고 있었다.
  // 카드 이용자와 교차 의도가 가장 큰 이 사이트 최다 유입 페이지(/ott/youtube-premium, 네이버 30일 372클릭)로 바꾼다.
  {
    title: "유튜브 프리미엄 국가별 요금",
    description: "해외결제 카드로 구독하면 얼마나 아끼는지 44개국 요금을 원화로 비교합니다.",
    href: "/ott/youtube-premium",
    icon: Tv,
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
          class="group flex flex-col rounded-[1.6rem] border border-border/70 bg-card p-4 text-left transition-[background-color,border-color,transform,box-shadow] duration-200 hover:-translate-y-[1px] hover:border-foreground/20 hover:bg-muted/15"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-body font-bold text-foreground">{{ item.title }}</p>
              <p class="mt-1.5 text-caption text-muted-foreground">{{ item.description }}</p>
            </div>
            <span class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <component :is="item.icon" class="h-5 w-5" />
            </span>
          </div>
          <p class="mt-3 inline-flex items-center gap-1 text-caption font-semibold text-foreground">
            바로 가기
            <ArrowRight class="h-3.5 w-3.5" />
          </p>
        </a>
      </div>
    </div>
  </section>
</template>
