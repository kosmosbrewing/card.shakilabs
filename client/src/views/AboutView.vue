<script setup lang="ts">
import SEOHead from "@/components/common/SEOHead.vue";
import CompareSourceFooter from "@/components/common/CompareSourceFooter.vue";
import { ABOUT_PAGE_SOURCES, SOURCE_VERIFIED_AT } from "@/data/sourceReferences";
</script>

<!--
  소개 본문은 AppLayout이 렌더하는 SeoRichContent가 담당한다(출처: scripts/prerender-content.mjs).
  이 뷰에는 프리렌더에 없는 것만 남긴다 — 확인일이 붙은 출처 카드.
  예전에는 운영자 정보·데이터 출처를 이 뷰와 프리렌더가 각각 따로 적어서,
  JS를 켜면 프리렌더 쪽 3,014자가 사라지고 화면에는 1,045자만 남았다.
-->
<template>
  <SEOHead
    title="서비스 안내 | 카드 계산기"
    description="shakilabs.com/card는 주유 할인·해외결제·연회비 등 카드 비교 계산기를 제공하는 무료 서비스입니다."
  />

  <div class="container space-y-5 pb-5">
    <CompareSourceFooter
      :sources="ABOUT_PAGE_SOURCES"
      :updated-at="SOURCE_VERIFIED_AT"
      note="※ 페이지별 계산 로직에 쓰는 상세 출처는 각 계산기 하단 카드에서 확인할 수 있습니다."
    />
  </div>
</template>
