<script setup lang="ts">
import { useSEO } from "@/composables/useSEO";

const props = defineProps<{
  title: string;
  description: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  noindex?: boolean;
  /** 변종 라우트가 대표 URL로 접힐 때 쓰는 canonical 통합 경로 (useSEO 참고). */
  canonicalPath?: string;
}>();

useSEO({
  title: () => props.title,
  description: () => props.description,
  jsonLd: () => props.jsonLd,
  noindex: () => props.noindex,
  canonicalPath: () => props.canonicalPath,
});
</script>

<template>
  <!-- SEO 메타태그만 주입, DOM 렌더링 없음 -->
</template>
