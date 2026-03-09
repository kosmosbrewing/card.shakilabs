<script setup lang="ts">
import SEOHead from "@/components/common/SEOHead.vue";
</script>

<template>
  <SEOHead
    title="서비스 안내 | Car Tools"
    description="car.shakilabs.com은 자동차 관련 비교 계산기를 제공하는 무료 서비스입니다."
  />

  <div class="container space-y-5 py-5">
    <div class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h1 class="retro-title">서비스 안내</h1>
      </div>
      <div class="retro-panel-content space-y-4 text-body text-foreground leading-relaxed">
        <p>
          <strong>car.shakilabs.com</strong>은 자동차 유지비를 스마트하게 관리할 수 있도록
          다양한 비교 계산기를 제공하는 무료 서비스입니다.
        </p>
        <h2 class="text-heading font-bold">주유 할인카드 비교 계산기</h2>
        <p>
          월 주유 금액, 유종, 선호 주유소를 입력하면 카드별 실질 절약액을 즉시 비교합니다.
          리터당 할인, 퍼센트 할인, 캐시백 등 서로 다른 할인 구조를 동일 기준으로 비교하여
          내 주유 패턴에 가장 적합한 카드를 찾을 수 있습니다.
        </p>
        <h2 class="text-heading font-bold">데이터 기준</h2>
        <ul class="list-disc pl-5 space-y-1 text-caption text-muted-foreground">
          <li>유가: Opinet(오피넷) 전국 평균가, 주 1회 수동 업데이트</li>
          <li>카드 혜택: 각 카드사 공식 사이트 기준, 변경 시 수동 업데이트</li>
          <li>계산 결과는 참고용이며, 실제 할인은 카드사 기준을 확인하세요</li>
        </ul>
        <h2 class="text-heading font-bold">문의</h2>
        <p class="text-caption text-muted-foreground">
          오류 제보 및 제안은 shakilabs@gmail.com으로 보내주세요.
        </p>
      </div>
    </div>
  </div>
</template>
