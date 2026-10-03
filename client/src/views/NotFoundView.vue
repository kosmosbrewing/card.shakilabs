<script setup lang="ts">
import SEOHead from "@/components/common/SEOHead.vue";
import { RouterLink } from "vue-router";
import { pageTitle } from "../../scripts/seo-meta.mjs";

// 프리렌더 404.html과 같은 제목(사이트 공통 페이지 레시피: "… · 카드 계산기 | ShakiLabs").
const seoTitle = pageTitle("/404");
</script>

<template>
  <SEOHead
    :title="seoTitle"
    description="요청하신 페이지를 찾을 수 없습니다."
    :noindex="true"
  />

  <div class="sh-container sh-container--page py-20">
    <div class="text-center space-y-4">
      <p class="text-display font-bold text-muted-foreground">404</p>
      <h1 class="text-heading font-bold text-foreground">페이지를 찾을 수 없습니다</h1>
      <RouterLink to="/fuel-card" class="pill-link pill-link--solid inline-flex">
        주유 할인카드 비교 →
      </RouterLink>
    </div>
  </div>
</template>
