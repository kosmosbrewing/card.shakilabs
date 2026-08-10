<script setup lang="ts">
import SEOHead from "@/components/common/SEOHead.vue";
</script>

<!--
  처리방침 본문은 AppLayout이 렌더하는 SeoRichContent가 담당한다(출처: scripts/prerender-content.mjs).
  AdSense 필수 3요소(제3자 광고 쿠키 고지·맞춤 광고 안내·옵트아웃 2링크)도 그 단일 출처에 있고,
  validate-static-output.mjs가 두 옵트아웃 링크의 존재를 빌드 때 강제한다.
-->
<template>
  <SEOHead
    title="개인정보 처리방침 | 카드 계산기"
    description="shakilabs.com/card 개인정보 처리방침 — 수집 항목, 광고 쿠키와 맞춤 광고 해제, 보관·파기, 국외 이전 안내"
  />
</template>
