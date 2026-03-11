<script setup lang="ts">
import { ref } from "vue";
import { ChevronDown } from "lucide-vue-next";

const faqs = [
  {
    question: "1마일 가치는 어느 정도인가요?",
    answer: "사용처와 좌석 등급에 따라 대략 10원에서 80원 이상까지 차이가 날 수 있습니다. 보통 비즈니스 이상에서 가치가 높아집니다.",
  },
  {
    question: "비즈니스석이 무조건 유리한가요?",
    answer: "원/마일 가치는 높지만 필요 마일도 커집니다. 자주 쓰려면 이코노미 여러 번이 더 실용적일 수 있습니다.",
  },
  {
    question: "카드 마일리지와 항공사 마일리지는 같은 가치인가요?",
    answer: "아닙니다. 전환 비율과 사용처 제약이 달라 실질 가치가 다를 수 있습니다.",
  },
  {
    question: "마일리지 유효기간은 어떻게 보나요?",
    answer: "대한항공과 아시아나는 보통 10년 기준이지만, 카드사 포인트는 정책이 제각각이라 별도 확인이 필요합니다.",
  },
  {
    question: "성수기에도 같은 가치로 쓸 수 있나요?",
    answer: "현금가는 성수기에 오르지만 보너스 좌석은 제한적이라 실제 예약 가능성은 달라질 수 있습니다.",
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
