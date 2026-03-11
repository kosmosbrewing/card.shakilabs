<script setup lang="ts">
import { ref } from "vue";
import { ChevronDown } from "lucide-vue-next";

interface FAQ {
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    question: "DCC(동적통화전환)란 무엇인가요?",
    answer: "해외 가맹점이 현지통화 대신 원화 결제를 제안하는 방식입니다. 편해 보이지만 보통 3~8% 마크업이 붙어 현지통화 결제보다 비싸집니다.",
  },
  {
    question: "항상 현지통화로 결제해야 하나요?",
    answer: "대부분의 경우 그렇습니다. 카드 해외수수료가 0~1%대인 반면 DCC는 3~8% 수준이 흔해, 혜택을 감안해도 현지통화가 유리한 경우가 많습니다.",
  },
  {
    question: "해외결제 수수료는 어떻게 구성되나요?",
    answer: "일반적으로 카드사 환전수수료와 국제브랜드 수수료가 합산됩니다. 해외 특화 카드나 체크카드는 이 수수료를 면제하는 경우가 있습니다.",
  },
  {
    question: "선불카드나 체크카드가 더 유리한가요?",
    answer: "수수료만 보면 유리한 경우가 많습니다. 다만 충전 한도, 잔액 관리, 사용처 제약, 별도 적립 혜택 유무까지 함께 비교해야 합니다.",
  },
  {
    question: "환율 데이터는 실제 청구액과 왜 차이가 나나요?",
    answer: "서비스는 매매기준율을 기준으로 추정합니다. 실제 청구 시점에는 카드사 적용 환율, 브랜드 정산일, 해외 가맹점 처리 시점 차이로 금액이 조금 달라질 수 있습니다.",
  },
];

const openIndex = ref<number | null>(null);

function toggle(index: number) {
  openIndex.value = openIndex.value === index ? null : index;
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
