<script setup lang="ts">
import { ArrowRight } from "lucide-vue-next";
import { RouterLink } from "vue-router";
import { ShSurface, ShText } from "@shakilabs/ui";
import SEOHead from "@/components/common/SEOHead.vue";
import { CARD_HOME_ENTRIES } from "@/data/cardNavigation";
import { pageTitle } from "../../scripts/seo-meta.mjs";

const SITE_URL = "https://shakilabs.com/card";

// 프리렌더(scripts/prerender-home.mjs)와 같은 문구를 쓴다 — 정적 HTML과 하이드레이션 후 내용이 어긋나지 않도록.
// 제목은 seo-meta.mjs가 단일 출처다(홈 레시피: "<앱 이름> | ShakiLabs").
const TITLE = pageTitle("/");
const DESCRIPTION =
  "주유 할인부터 해외결제 수수료, 연회비 회수, 포인트 전환까지 카드 혜택 10가지를 목적별로 계산합니다. 내 소비 패턴에 맞는 카드를 직접 비교해 보세요.";

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
  <div class="sh-container sh-container--page space-y-5 py-5">
    <ShSurface padding="lg">
      <ShText as="h1" variant="display">카드 혜택, 발급 전에 숫자로 확인하세요</ShText>
      <!-- 허브 도입은 한 문장. 세 문장짜리 설명 문단은 390px 첫 화면을 다 채우고도 상황 카드를 못 보여줬다(GA4 28일 허브 조회 4). -->
      <ShText tone="muted" class="mt-3">
        주유·해외결제·연회비·포인트 등 카드 혜택 계산기 10개. 금액만 넣으면 회원가입 없이 바로 계산합니다.
      </ShText>
      <RouterLink to="/all" class="mt-4 inline-flex items-center gap-1 text-caption font-semibold text-foreground no-underline">
        계산기 전체 보기 <ArrowRight class="h-4 w-4" aria-hidden="true" />
      </RouterLink>
    </ShSurface>

    <section aria-labelledby="home-situations-title">
      <div class="mb-3">
        <ShText id="home-situations-title" as="h2" variant="heading">지금 상황부터 고르세요</ShText>
      </div>
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <RouterLink
          v-for="entry in CARD_HOME_ENTRIES"
          :key="entry.path"
          :to="entry.path"
          class="block no-underline"
        >
          <ShSurface variant="outlined" padding="md" class="flex h-full flex-col hover:border-foreground/40">
            <ShText as="h3" variant="heading">{{ entry.situation }}</ShText>
            <ShText variant="caption" tone="muted" class="mt-2 flex-1">{{ entry.checkpoint }}</ShText>
            <span class="mt-4 inline-flex items-center gap-1 text-caption font-semibold text-foreground">
              {{ entry.label }} <ArrowRight class="h-4 w-4" aria-hidden="true" />
            </span>
          </ShSurface>
        </RouterLink>
      </div>
    </section>
  </div>
</template>
