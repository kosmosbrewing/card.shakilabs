<script setup lang="ts">
import { ref } from "vue";
import { ChevronDown } from "lucide-vue-next";

interface FAQ {
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    question: "연회비 회수 기간이란 무엇인가요?",
    answer: "매달 받는 혜택이 누적되어 연회비를 넘어서는 데 걸리는 월 수입니다. 보통 3개월 이내면 회수 효율이 좋은 편입니다.",
  },
  {
    question: "ROI가 1배 미만이면 어떤 의미인가요?",
    answer: "연간 혜택이 연회비보다 작다는 뜻입니다. 카드 혜택보다 비용이 커서 다른 카드를 검토하는 편이 좋습니다.",
  },
  {
    question: "전월 실적을 못 채우면 어떻게 계산되나요?",
    answer: "해당 월 혜택은 0원으로 처리합니다. 실적 조건이 낮은 카드가 실제 회수 속도에서는 더 유리할 수 있습니다.",
  },
  {
    question: "카테고리 할인 한도는 왜 중요한가요?",
    answer: "혜택률이 높아도 카드사가 정한 월 최대 할인액을 넘기면 추가 할인은 적용되지 않기 때문입니다.",
  },
  {
    question: "체크카드도 연회비 회수 개념이 필요한가요?",
    answer: "대부분 연회비가 없거나 매우 낮아 회수 개념이 덜 중요하지만, 그만큼 혜택도 제한적인 경우가 많습니다.",
  },
];

const openIndex = ref<number | null>(null);

function toggle(idx: number) {
  openIndex.value = openIndex.value === idx ? null : idx;
}
</script>

<template>
  <div class="retro-panel overflow-hidden">
    <div class="retro-titlebar rounded-t-2xl">
      <h2 class="retro-title">자주 묻는 질문</h2>
    </div>

    <div class="divide-y divide-border/60">
      <div
        v-for="(faq, idx) in faqs"
        :key="idx"
      >
        <button
          type="button"
          class="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-body font-semibold text-foreground transition-colors hover:bg-muted/30"
          @click="toggle(idx)"
        >
          <span>{{ faq.question }}</span>
          <ChevronDown
            :class="[
              'h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200',
              openIndex === idx && 'rotate-180',
            ]"
          />
        </button>
        <div
          v-if="openIndex === idx"
          class="border-t border-border/40 bg-muted/10 px-4 py-3 text-caption leading-relaxed text-muted-foreground"
        >
          {{ faq.answer }}
        </div>
      </div>
    </div>
  </div>
</template>
