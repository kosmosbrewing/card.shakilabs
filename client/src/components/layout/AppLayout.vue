<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";
import { useRoute } from "vue-router";
import { ShSurface } from "@shakilabs/ui";
import AppHeader from "@/components/layout/AppHeader.vue";
import AppFooter from "@/components/layout/AppFooter.vue";
import TabNavigation from "@/components/common/TabNavigation.vue";
import { guidePlacementFor } from "@/seo/guideRoutes";

// 가이드 본문(수만 자)은 초기 번들에 넣지 않고 별도 청크로 뺀다.
const SeoRichContent = defineAsyncComponent(
  () => import("@/components/common/SeoRichContent.vue"),
);

const route = useRoute();

// 정책·소개 라우트는 가이드가 곧 페이지 본문이라 뷰보다 위에 온다.
// 그 외에는 계산기 아래. 어느 쪽이든 인스턴스는 항상 정확히 하나가 마운트되어야 한다
// — 프리렌더 본문 사본을 지우는 책임이 이 컴포넌트에 있기 때문이다.
const guideFirst = computed(() => guidePlacementFor(route.path) === "before");
</script>

<template>
  <!-- CSS 변수 기반 토큰을 쓰는 장식용 배경이라도 임의 gradient 값을 허용하지 않는다. -->
  <ShSurface
    as="div"
    variant="plain"
    padding="none"
    class="design-system-shell min-h-screen flex flex-col bg-background"
  >
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-[100] focus:rounded focus:bg-background focus:px-3 focus:py-2 focus:text-caption focus:font-semibold"
    >
      본문 바로가기
    </a>
    <AppHeader />
    <TabNavigation />
    <main id="main-content" tabindex="-1" class="flex-1 relative">
      <SeoRichContent v-if="guideFirst" placement="before" />
      <slot />
      <SeoRichContent v-if="!guideFirst" placement="after" />
    </main>
    <AppFooter />
  </ShSurface>
</template>
