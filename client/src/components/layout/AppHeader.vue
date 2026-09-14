<script setup lang="ts">
// v3 3.2 - GlobalHeader 내용은 로고 + 사이트 링크 + 테마 버튼뿐이다. 앱은 자체
// 헤더 마크업을 갖지 않는다. 티커(안내 문구)는 헤더 밖 얇은 배너로 내린다.
import { computed } from "vue";
import { useRoute } from "vue-router";
import { ShGlobalHeader } from "@shakilabs/ui";
import { RouterLink } from "vue-router";
import ThemeToggle from "@/components/layout/ThemeToggle.vue";
import TickerBar from "@/components/common/TickerBar.vue";
import { tickerMessages } from "@/data/tickerMessages";
import {
  PRIMARY_NAV_ITEMS,
  findActiveNavItem,
} from "../../../scripts/primary-nav-items.mjs";

// v3 §3.3-1 — 모바일 좌측 드로어. 목록은 2차 내비와 같은 모듈에서 온다(복제 금지).
// 비우면 패키지가 드로어 자체를 렌더하지 않으므로, 여기서 넘기는 것이 유일한 배선이다.
const route = useRoute();
const navActiveKey = computed(() => findActiveNavItem(route.path)?.key ?? "");
</script>

<template>
  <ShGlobalHeader
    home-href="/"
    brand="ShakiLabs"
    :nav-items="PRIMARY_NAV_ITEMS"
    :nav-active-key="navActiveKey"
    nav-title="카드 도구"
    :link-component="RouterLink"
  >
    <template #utility>
      <ThemeToggle />
    </template>
  </ShGlobalHeader>
  <div class="border-b border-border bg-background">
    <div class="container flex min-h-7 items-center justify-center px-3 py-1 text-center sm:px-4">
      <TickerBar :messages="tickerMessages" />
    </div>
  </div>
</template>
