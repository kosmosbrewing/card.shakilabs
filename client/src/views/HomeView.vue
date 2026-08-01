<script setup lang="ts">
import { ArrowRight } from "lucide-vue-next";
import { RouterLink } from "vue-router";
import { ShSurface, ShText } from "@shakilabs/ui";
import SEOHead from "@/components/common/SEOHead.vue";
import { CARD_HOME_ENTRIES } from "@/data/cardNavigation";

const SITE_URL = "https://shakilabs.com/card";

// 프리렌더(scripts/prerender-home.mjs)와 같은 문구를 쓴다 — 정적 HTML과 하이드레이션 후 내용이 어긋나지 않도록.
const TITLE = "카드 계산기 | 주유·해외결제·연회비 혜택 비교 2026";
const DESCRIPTION =
  "주유 할인부터 해외결제 수수료, 연회비 회수, 포인트 전환까지 카드 혜택 10가지를 목적별로 계산합니다. 내 소비 패턴에 맞는 카드를 직접 비교해 보세요.";

const STEPS = [
  {
    title: "소비를 먼저 적는다",
    body: "주유비, 해외결제, 구독료처럼 매달 반복되는 금액부터 적으세요. 혜택률보다 실제 지출 규모가 절약액을 결정합니다.",
  },
  {
    title: "한도와 실적을 확인한다",
    body: "할인율이 높아도 월 할인 한도가 낮으면 체감 절약은 작습니다. 전월 실적 조건도 함께 보세요.",
  },
  {
    title: "연회비를 빼고 비교한다",
    body: "연간 절약액에서 연회비를 뺀 순혜택이 실제 이득입니다. 순혜택이 음수면 연회비가 낮은 카드가 낫습니다.",
  },
];

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "ShakiLabs 카드 계산기",
    url: SITE_URL,
    description: DESCRIPTION,
    inLanguage: "ko",
  },
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "카드 계산기 목록",
    itemListElement: CARD_HOME_ENTRIES.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.label,
      url: `${SITE_URL}${entry.path}`,
    })),
  },
];
</script>

<template>
  <SEOHead :title="TITLE" :description="DESCRIPTION" :json-ld="jsonLd" />
  <div class="container space-y-5 py-5">
    <ShSurface padding="lg">
      <ShText as="p" variant="caption" tone="muted">CARD CALCULATORS</ShText>
      <ShText as="h1" variant="display" class="mt-2">카드 혜택, 발급 전에 숫자로 확인하세요</ShText>
      <ShText tone="muted" class="mt-3 max-w-3xl">
        카드 광고는 최대 할인율을 앞세우지만, 실제로 돌아오는 금액은 내 소비 규모와 월 할인 한도, 전월 실적, 연회비를 모두 반영해야 나옵니다.
        회원가입 없이 금액만 넣으면 결과를 바로 확인할 수 있습니다.
      </ShText>
      <RouterLink to="/all" class="mt-4 inline-flex items-center gap-1 text-caption font-semibold text-primary no-underline">
        계산기 전체 보기 <ArrowRight class="h-4 w-4" aria-hidden="true" />
      </RouterLink>
    </ShSurface>

    <section aria-labelledby="home-situations-title">
      <div class="mb-3">
        <ShText id="home-situations-title" as="h2" variant="heading">지금 상황부터 고르세요</ShText>
        <ShText variant="caption" tone="muted" class="mt-1">
          카드 이름이 아니라 지금 겪고 있는 상황에서 출발하면 필요한 계산기를 빠르게 찾을 수 있습니다.
        </ShText>
      </div>
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <RouterLink
          v-for="entry in CARD_HOME_ENTRIES"
          :key="entry.path"
          :to="entry.path"
          class="block no-underline"
        >
          <ShSurface variant="outlined" padding="md" class="flex h-full flex-col hover:border-primary">
            <ShText as="h3" variant="heading">{{ entry.situation }}</ShText>
            <ShText variant="caption" tone="muted" class="mt-2 flex-1">{{ entry.checkpoint }}</ShText>
            <span class="mt-4 inline-flex items-center gap-1 text-caption font-semibold text-primary">
              {{ entry.label }} <ArrowRight class="h-4 w-4" aria-hidden="true" />
            </span>
          </ShSurface>
        </RouterLink>
      </div>
    </section>

    <section aria-labelledby="home-steps-title">
      <div class="mb-3">
        <ShText id="home-steps-title" as="h2" variant="heading">카드 고르기 3단계</ShText>
      </div>
      <ol class="grid gap-3 sm:grid-cols-3">
        <li v-for="(step, index) in STEPS" :key="step.title">
          <ShSurface variant="outlined" padding="md" class="h-full">
            <ShText variant="caption" tone="muted">STEP {{ index + 1 }}</ShText>
            <ShText as="h3" variant="heading" class="mt-1">{{ step.title }}</ShText>
            <ShText variant="caption" tone="muted" class="mt-2">{{ step.body }}</ShText>
          </ShSurface>
        </li>
      </ol>
    </section>
  </div>
</template>
