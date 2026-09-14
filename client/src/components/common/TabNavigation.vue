<script setup lang="ts">
import { computed } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { ShPrimaryNavigation } from "@shakilabs/ui";
import {
  PRIMARY_NAV_ITEMS,
  findActiveNavItem,
} from "../../../scripts/primary-nav-items.mjs";

const route = useRoute();
const activeItem = computed(() => findActiveNavItem(route.path));
</script>

<template>
  <!-- v3 §3.3-1 — 모바일(<48rem)에서는 이 인라인 내비를 숨기고 헤더의 좌측 드로어가
       같은 목록을 대신 연다. 11개 탭을 2행 그리드로 깔면 모바일 chrome을 105px 더
       먹었고, 그래서 6개만 보여 주는 mobile-items 로직이 필요했다 — 드로어는 11개를
       전부 싣는다. 링크는 항상 DOM에 렌더되므로 크롤 경로는 끊기지 않는다. -->
  <ShPrimaryNavigation
    class="tab-navigation--desktop-only"
    :items="PRIMARY_NAV_ITEMS"
    :active-key="activeItem?.key"
    :link-component="RouterLink"
  />
</template>

<style scoped>
@media (max-width: 47.99rem) {
  .tab-navigation--desktop-only {
    display: none;
  }
}
</style>
