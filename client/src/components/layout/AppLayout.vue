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
  <!-- CSS 변수 기반 토큰을 쓰는 장식용 배경이라도 임의 gradient 값을 허용하지 않는다.
       v3 AppShell: ShGlobalHeader가 자체 SkipLink를 렌더하므로 여기서 중복으로 만들지 않는다. -->
  <ShSurface
    as="div"
    variant="plain"
    padding="none"
    class="design-system-shell min-h-screen flex flex-col bg-background"
  >
    <AppHeader />
    <TabNavigation />
    <main id="main-content" tabindex="-1" class="flex-1 relative">
      <!-- 약관·처리방침·소개는 가이드 본문이 곧 페이지다 — 프레임은 같고 글줄만 42rem(0.3.35). -->
      <div v-if="guideFirst" class="sh-container sh-container--prose">
        <SeoRichContent placement="before" />
      </div>
      <slot />
      <!-- after 가이드도 읽는 글이다 — 프레임은 그대로(시작선 x=168), 글줄만 42rem으로 묶는다.
           프리렌더 첫 페인트(scripts/prerender.mjs wrapInProseShell)와 같은 클래스라 수화 전후 위치가 같다. -->
      <div v-if="!guideFirst" class="sh-container sh-container--prose">
        <SeoRichContent placement="after" />
      </div>
    </main>
    <AppFooter />
  </ShSurface>
</template>
