<script setup lang="ts">
// v3 §3.2 — GlobalHeader는 로고 / 앱 이름 + 사이트 링크 + 테마 버튼 + ☰만 싣는다.
// 0.3.38 "순수 내비게이션"(2026-09-25): 가운데 티커(안내 문구)는 정보라 뺐다.
import { computed } from "vue";
import { useRoute } from "vue-router";
import { ShGlobalHeader, type GlobalHeaderLink } from "@shakilabs/ui";
import { RouterLink } from "vue-router";
import ThemeToggle from "@/components/layout/ThemeToggle.vue";
import {
  PRIMARY_NAV_ITEMS,
  findActiveNavItem,
} from "../../../scripts/primary-nav-items.mjs";

// 사이트 링크 — 블로그는 포털 소유라 href, 소개는 이 앱 라우트라 RouterLink(to). 모바일에서는 ☰ 안으로 들어간다.
const links: GlobalHeaderLink[] = [
  { href: "/blog", label: "블로그" },
  { to: "/about", label: "소개" },
];

// 모바일 전체 메뉴(☰). 목록은 2차 내비와 같은 모듈에서 온다(복제 금지).
// 비우면 패키지가 드로어 자체를 렌더하지 않으므로, 여기서 넘기는 것이 유일한 배선이다.
const route = useRoute();
const navActiveKey = computed(() => findActiveNavItem(route.path)?.key ?? "");
</script>

<template>
  <ShGlobalHeader
    app="card"
    home-href="/"
    brand="ShakiLabs"
    :links="links"
    :nav-items="PRIMARY_NAV_ITEMS"
    :nav-active-key="navActiveKey"
    :link-component="RouterLink"
  >
    <template #utility>
      <ThemeToggle />
    </template>
  </ShGlobalHeader>
</template>
