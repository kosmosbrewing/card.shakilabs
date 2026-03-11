<script setup lang="ts">
import { ref } from "vue";
import { ChevronDown } from "lucide-vue-next";

const faqs = [
  {
    question: "면세 한도가 $800인가요?",
    answer: "여행자 휴대품 일반 면세 한도는 2025년부터 800달러 기준으로 운영되고 있습니다.",
  },
  {
    question: "간이세율이란 무엇인가요?",
    answer: "소액 물품에 대해 관세와 부가세를 합쳐 간편하게 계산하는 세율입니다.",
  },
  {
    question: "일반세율과 간이세율 중 무엇이 유리한가요?",
    answer: "품목과 금액에 따라 달라집니다. 이 계산기는 적용 가능할 때 더 유리한 방식을 자동으로 선택합니다.",
  },
  {
    question: "주류와 담배는 별도 면세가 있나요?",
    answer: "주류 2병(2L, 400달러 이하), 담배 200개비, 향수 60mL는 별도 기준이 있어 일반 물품과 다르게 볼 수 있습니다.",
  },
  {
    question: "관세청 고시환율은 무엇인가요?",
    answer: "세관 신고 시 적용하는 기준 환율로, 실제 카드 결제 환율과 다를 수 있으며 주기적으로 변경됩니다.",
  },
  {
    question: "자진 신고 시 감면이 있나요?",
    answer: "일반적으로 자진 신고 시 산출세액의 30% 범위 내 감면이 가능하지만 한도와 세부 기준은 최신 규정을 확인해야 합니다.",
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
