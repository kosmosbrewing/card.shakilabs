<script setup lang="ts">
import SEOHead from "@/components/common/SEOHead.vue";
import { RouterLink } from "vue-router";
</script>

<template>
  <SEOHead
    title="페이지를 찾을 수 없습니다 | Car Tools"
    description="요청하신 페이지를 찾을 수 없습니다."
    :noindex="true"
  />

  <div class="container py-20">
    <div class="text-center space-y-4">
      <p class="text-display font-bold text-muted-foreground">404</p>
      <p class="text-body text-muted-foreground">페이지를 찾을 수 없습니다</p>
      <RouterLink to="/fuel-card" class="retro-button inline-flex">
        주유 할인카드 비교 →
      </RouterLink>
    </div>
  </div>
</template>
