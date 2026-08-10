<script setup lang="ts">
import SEOHead from "@/components/common/SEOHead.vue";
</script>

<!--
  약관 본문은 AppLayout이 렌더하는 SeoRichContent가 담당한다(출처: scripts/prerender-content.mjs).
  예전에는 같은 약관이 이 뷰와 프리렌더에 각각 따로 적혀 있었고, 그래서 정적 HTML과 화면의
  내용이 다르고 양쪽 다 1,500자를 밑돌았다. 문구는 단일 출처에서만 고친다.
-->
<template>
  <SEOHead
    title="이용약관 | 카드 계산기"
    description="shakilabs.com/card 이용약관 — 서비스 개요, 정보 제공의 한계, 면책, 광고 게재, 준거법 안내"
  />
</template>
