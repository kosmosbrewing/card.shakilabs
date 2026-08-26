<script setup lang="ts">
import { ArrowRight } from "lucide-vue-next";
import { RouterLink } from "vue-router";
import { ShSurface, ShText } from "@shakilabs/ui";
import SEOHead from "@/components/common/SEOHead.vue";
import { CARD_TOOL_GROUPS } from "@/data/cardNavigation";
// 프리렌더 허브(scripts/prerender-card-hub.mjs)가 렌더하는 것과 같은 표.
// 한쪽에만 있으면 JS 끔/켬 자수가 갈리고, 그게 이 앱이 이미 한 번 겪은 결함이다.
import { CARD_DATA_SCOPE } from "@/data/cardDataScope";
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
        혜택 회수, 해외 결제, 포인트 관리 중 지금 필요한 결정과 가까운 도구에서 시작하세요.
        각 도구에는 "언제 쓰는가"와 "무엇을 넣으면 무엇이 나오는가"를 함께 적어 두었습니다.
        계산기 이름이 아니라 지금 겪고 있는 상황과 맞는 쪽을 고르고, 필요한 입력값이 손에 있는지 열기 전에 확인하세요.
      </ShText>
      <ShText tone="muted" class="mt-3 max-w-3xl">
        카드 혜택은 할인율만 보면 실제 절약액을 크게 벗어납니다. 월 할인 한도, 전월 실적 조건, 연회비 세 가지가 함께 걸리기 때문입니다.
        아래 계산기는 모두 이 세 가지를 반영한 순혜택 기준으로 결과를 냅니다. 회원가입이나 카드번호 입력 없이 금액만 넣으면 됩니다.
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
            <ShText variant="caption" tone="muted" class="mt-2">{{ tool.description }}</ShText>
            <ShText variant="caption" tone="muted" class="mt-3">
              <strong class="text-foreground">언제 쓰나요?</strong> {{ tool.whenToUse }}
            </ShText>
            <ShText variant="caption" tone="muted" class="mt-2 flex-1">
              <strong class="text-foreground">무엇이 나오나요?</strong> {{ tool.inputsOutputs }}
            </ShText>
            <span class="mt-4 inline-flex items-center gap-1 text-caption font-semibold text-primary">
              계산 시작 <ArrowRight class="h-4 w-4" aria-hidden="true" />
            </span>
          </ShSurface>
        </RouterLink>
      </div>
    </section>

    <ShSurface padding="lg" aria-labelledby="card-data-scope-title">
      <ShText id="card-data-scope-title" as="h2" variant="heading">각 계산기가 비교하는 카드</ShText>
      <ShText tone="muted" class="mt-2 max-w-3xl">
        계산기를 열기 전에 무엇을 몇 장이나 비교하는지, 조건의 폭이 어느 정도인지 확인하세요.
        아래 숫자는 계산에 실제로 쓰이는 카드 데이터에서 그대로 뽑은 값이라, 카드가 추가되거나 조건이 바뀌면 이 표도 함께 바뀝니다.
      </ShText>
      <div class="mt-3 overflow-x-auto">
        <table class="w-full min-w-[560px] border-collapse text-caption">
          <thead>
            <tr>
              <th scope="col" class="border border-border bg-muted px-3 py-2 text-left font-semibold">계산기</th>
              <th scope="col" class="whitespace-nowrap border border-border bg-muted px-3 py-2 text-left font-semibold">카드 수</th>
              <th scope="col" class="border border-border bg-muted px-3 py-2 text-left font-semibold">조건의 폭</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in CARD_DATA_SCOPE" :key="row.path">
              <th scope="row" class="whitespace-nowrap border border-border px-3 py-2 text-left font-semibold">
                <RouterLink :to="row.path" class="text-primary">{{ row.label }}</RouterLink>
              </th>
              <td class="whitespace-nowrap border border-border px-3 py-2 tabular-nums">{{ row.count }}장</td>
              <td class="border border-border px-3 py-2 text-muted-foreground">{{ row.detail }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <ShText variant="caption" tone="muted" class="mt-3">
        나머지 계산기는 카드 목록이 아니라 규칙을 계산합니다. 면세 한도와 해외직구 관세는 품목별 세율표를,
        마일리지와 포인트 전환은 전환처별 교환 비율을, 결제일 이용기간은 카드사별 사이클 규칙을 각각 입력값에 적용합니다.
      </ShText>
    </ShSurface>
  </div>
</template>
