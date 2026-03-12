<script setup lang="ts">
import FAQSection from "@/components/common/FAQSection.vue";

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
    answer: "주류 2병(합계 2L 이하, 400달러 이하), 담배 200개비, 향수 100mL는 별도 면세 기준이 있어 일반 물품과 구분해서 봐야 합니다.",
  },
  {
    question: "관세청 고시환율은 무엇인가요?",
    answer: "세관 신고 시 적용하는 기준 환율로, 실제 카드 결제 환율과 다를 수 있으며 주기적으로 변경됩니다.",
  },
  {
    question: "자진 신고 시 감면이 있나요?",
    answer: "일반적으로 자진 신고 시 산출세액의 30% 범위에서 최대 20만원까지 감면될 수 있지만, 세부 기준은 최신 규정을 확인해야 합니다.",
  },
];
</script>

<template>
  <FAQSection :faqs="faqs" />
</template>
