<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { richContentFor } from "@/seo/routeRichContent";
import { removePrerenderContent } from "@/utils/prerenderFallback";

const props = defineProps<{ placement: "before" | "after" }>();

const route = useRoute();
const router = useRouter();

// v-html 근거: 값은 빌드 타임 상수 모듈(scripts/prerender-*.mjs)에서만 나오고,
// 라우트는 고정 목록·고정 정규식으로만 매칭한다. 사용자 입력이 섞이는 경로가 없다.
const html = computed(() => richContentFor(route.path));

onMounted(() => {
  // 대체 렌더가 DOM에 올라온 뒤에야 프리렌더 사본을 지운다. 순서가 뒤집히면
  // 사람에게만 본문이 사라지는(=크롤러만 보는) 상태가 다시 생긴다.
  removePrerenderContent();
});

// 가이드 본문의 내부 링크는 정적 HTML용 절대 경로(/card/...)라 기본 동작이 전체 새로고침이다.
// 앱 안에서는 라우터로 넘겨 SPA 이동으로 만든다.
function handleClick(event: MouseEvent): void {
  if (event.defaultPrevented || event.button !== 0) return;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

  const anchor = (event.target as Element | null)?.closest?.("a");
  const href = anchor?.getAttribute("href");
  if (!href || !href.startsWith("/card/")) return;
  if (anchor?.getAttribute("target")) return;

  event.preventDefault();
  void router.push(href.slice("/card".length));
}
</script>

<template>
  <section
    v-if="html"
    :data-seo-guide="props.placement"
    class="seo-rich-content"
    @click="handleClick"
    v-html="html"
  />
</template>
