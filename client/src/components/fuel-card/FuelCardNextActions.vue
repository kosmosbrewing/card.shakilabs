<script setup lang="ts">
import { onMounted } from 'vue'
import { ArrowRight } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import { ShSurface, ShText } from '@shakilabs/ui'
import { trackEvent } from '@/lib/analytics'

const actions = [
  { key: 'annual_fee', title: '절약액으로 연회비 회수 계산', description: '추천 카드의 연간 혜택이 연회비를 언제 넘는지 확인합니다.', href: '/card/annual-fee' },
  { key: 'min_spend', title: '전월 실적 최소 비용 계산', description: '혜택을 받기 위해 필요한 실적과 부족 금액을 점검합니다.', href: '/card/min-spend' },
  { key: 'overseas_payment', title: '해외결제 수수료까지 비교', description: '여행·직구 결제 전 DCC와 카드사 수수료를 비교합니다.', href: '/card/overseas-payment' },
] as const

onMounted(() => {
  actions.forEach((item) => trackEvent('related_tool_impression', {
    app_id: 'card', from_tool: 'fuel_card', to_tool: item.key, placement: 'after_result',
  }))
})

function trackRelatedClick(toTool: string): void {
  trackEvent('related_tool_click', {
    app_id: 'card', from_tool: 'fuel_card', to_tool: toTool, placement: 'after_result',
  })
}
</script>

<template>
  <section aria-labelledby="fuel-card-next-actions-title">
    <ShText id="fuel-card-next-actions-title" as="h2" variant="heading" class="mb-3">
      추천 카드의 조건까지 이어서 확인하세요
    </ShText>
    <div class="grid gap-3 md:grid-cols-3">
      <ShSurface
        v-for="item in actions"
        :key="item.key"
        as="a"
        variant="outlined"
        padding="md"
        :href="item.href"
        class="group flex flex-col no-underline transition-colors hover:border-primary"
        @click="trackRelatedClick(item.key)"
      >
        <ShText as="h3" variant="heading">{{ item.title }}</ShText>
        <ShText variant="caption" tone="muted" class="mt-2 flex-1">{{ item.description }}</ShText>
        <span class="mt-4 inline-flex items-center gap-1 text-caption font-semibold text-primary">
          {{ item.title }} <ArrowRight class="h-4 w-4" aria-hidden="true" />
        </span>
      </ShSurface>
    </div>
    <RouterLink to="/all" class="retro-link mt-3 inline-flex text-caption font-semibold">
      카드 계산기 전체 보기
    </RouterLink>
  </section>
</template>
