<script setup lang="ts">
// v3 3.2 - GlobalHeader 내용은 로고 + 사이트 링크 + 테마 버튼뿐이었으나, 0.3.24부터
// 티커(안내 문구)가 헤더 가운데 #tip 슬롯으로 들어간다. 패키지가 흐름 밖 절대 배치 +
// 한 줄 말줄임으로 렌더하므로 문구 길이와 무관하게 헤더 56px가 고정된다.
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
    <!-- 헤더 가운데 회전 안내. 패키지가 흐름 밖에 절대 배치하므로 문구 길이가
         56px 헤더 높이를 바꾸지 못한다. -->
    <template #tip>
      <TickerBar :key="route.path" :messages="tickerMessages" />
    </template>

    <template #utility>
      <ThemeToggle />
    </template>
  </ShGlobalHeader>
</template>
