<script setup lang="ts">
import AppHeader from "@/components/layout/AppHeader.vue";
import AppFooter from "@/components/layout/AppFooter.vue";
import TabNavigation from "@/components/common/TabNavigation.vue";
</script>

<template>
  <!-- CSS 변수 기반 토큰을 쓰는 장식용 배경이라 임의 gradient 값을 허용한다. -->
  <div class="min-h-screen flex flex-col bg-background bg-[radial-gradient(1200px_500px_at_50%_-120px,hsl(var(--primary)/0.12),transparent_70%)]">
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-[100] focus:rounded focus:bg-background focus:px-3 focus:py-2 focus:text-caption focus:font-semibold"
    >
      본문 바로가기
    </a>
    <AppHeader />
    <TabNavigation />
    <main id="main-content" tabindex="-1" class="flex-1 relative">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
