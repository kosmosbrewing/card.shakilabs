<script setup lang="ts">
import { ArrowRight } from "lucide-vue-next";
import { RouterLink } from "vue-router";
import { ShSurface, ShText } from "@shakilabs/ui";
import SEOHead from "@/components/common/SEOHead.vue";
import { CARD_TOOL_GROUPS } from "@/data/cardNavigation";
</script>

<template>
  <SEOHead
    title="카드 계산기 전체 보기 | 목적별 10개 비교 도구"
    description="혜택·고정지출, 해외·여행 결제, 포인트·결제 관리 목적별로 필요한 카드 계산기를 찾으세요."
  />
  <div class="container space-y-5 py-5">
    <ShSurface padding="lg">
      <ShText as="p" variant="caption" tone="muted">CARD TOOL DIRECTORY</ShText>
      <ShText as="h1" variant="display" class="mt-2">카드를 고르기 전에 목적부터 정리하세요</ShText>
      <ShText tone="muted" class="mt-3 max-w-3xl">
        혜택 회수, 해외 결제, 포인트 관리 중 지금 필요한 결정과 가까운 묶음에서 시작하세요.
      </ShText>
    </ShSurface>

    <section v-for="group in CARD_TOOL_GROUPS" :key="group.key" :aria-labelledby="`${group.key}-title`">
      <div class="mb-3">
        <ShText :id="`${group.key}-title`" as="h2" variant="heading">{{ group.title }}</ShText>
        <ShText variant="caption" tone="muted" class="mt-1">{{ group.description }}</ShText>
      </div>
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <RouterLink v-for="tool in group.tools" :key="tool.path" :to="tool.path" class="block no-underline">
          <ShSurface variant="outlined" padding="md" class="group flex h-full flex-col hover:border-primary">
            <ShText as="h3" variant="heading">{{ tool.title }}</ShText>
            <ShText variant="caption" tone="muted" class="mt-2 flex-1">{{ tool.description }}</ShText>
            <span class="mt-4 inline-flex items-center gap-1 text-caption font-semibold text-primary">
              계산 시작 <ArrowRight class="h-4 w-4" aria-hidden="true" />
            </span>
          </ShSurface>
        </RouterLink>
      </div>
    </section>
  </div>
</template>
