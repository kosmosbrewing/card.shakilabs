<script setup lang="ts">
import { computed } from "vue";
import FAQSection from "@/components/common/FAQSection.vue";
import { FUEL_PRICES } from "@/data/fuelPrices";
import { CARD_BENEFIT_DATA_VERIFIED_AT } from "@/data/sourceReferences";

// The answer below used to promise a weekly fuel-price refresh. Nothing does that:
// there is no schedule workflow in this repo, the remote-constants loader is off in
// production, and the shipped snapshot has not moved since its own lastUpdated date.
// Both dates are interpolated so a refresh moves the copy instead of leaving it stale.
// FUEL_PRICES is reactive, so the answer must be computed - a plain array would
// freeze the date at setup time if the snapshot ever gets refreshed at runtime.
const faqs = computed(() => [
  {
    question: "주유 할인카드는 어떤 기준으로 선택해야 하나요?",
    answer: "월 주유 금액, 선호 주유소 브랜드, 전월 실적 충족 가능 여부를 고려하세요. 리터당 고정 할인 카드는 유가가 낮을 때 유리하고, % 할인 카드는 유가가 높을 때 유리합니다.",
  },
  {
    question: "전월 실적이란 무엇인가요?",
    answer: "카드 할인 혜택을 받으려면 전월(지난달)에 일정 금액 이상을 해당 카드로 결제해야 합니다. 주유비뿐 아니라 일반 생활비 결제도 포함됩니다.",
  },
  {
    question: "월 할인 한도를 초과하면 어떻게 되나요?",
    answer: "한도를 초과한 금액에 대해서는 할인이 적용되지 않습니다. 주유량이 많다면 한도가 높은 카드를 선택하는 것이 유리합니다.",
  },
  {
    question: "브랜드 제한 카드가 더 유리한 이유는?",
    answer: "특정 주유소(예: SK에너지, S-Oil)와 제휴한 카드는 할인율이 더 높은 경우가 많습니다. 자주 이용하는 주유소가 있다면 해당 브랜드 카드를 고려하세요.",
  },
  {
    question: "체감 유가란 무엇인가요?",
    answer: "카드 할인을 적용한 후 실제로 내가 체감하는 리터당 가격입니다. 연회비를 월 환산하여 차감한 순수 절약액 기준으로 계산합니다.",
  },
  {
    question: "카드 할인 데이터는 얼마나 자주 업데이트되나요?",
    answer:
      "정해진 갱신 주기는 없습니다. 유가와 카드 혜택 모두 자동으로 수집하는 장치가 없어 사람이 직접 확인해 반영합니다. " +
      `현재 화면에 쓰는 유가 기준일은 ${FUEL_PRICES.lastUpdated}, 카드 혜택 데이터 확인일은 ${CARD_BENEFIT_DATA_VERIFIED_AT}입니다. ` +
      "그 이후 바뀐 유가·혜택은 반영되어 있지 않을 수 있으니, 실제 할인 조건은 반드시 카드사 공식 사이트에서 확인하시기 바랍니다.",
  },
]);
</script>

<template>
  <FAQSection :faqs="faqs" />
</template>
