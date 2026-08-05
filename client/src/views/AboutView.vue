<script setup lang="ts">
import SEOHead from "@/components/common/SEOHead.vue";
import CompareSourceFooter from "@/components/common/CompareSourceFooter.vue";
import { ABOUT_PAGE_SOURCES, SOURCE_VERIFIED_AT } from "@/data/sourceReferences";
</script>

<template>
  <SEOHead
    title="서비스 안내 | 카드 계산기"
    description="shakilabs.com/card는 주유 할인·해외결제·연회비 등 카드 비교 계산기를 제공하는 무료 서비스입니다."
  />

  <div class="container space-y-5 py-5">
    <div class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h1 class="retro-title">서비스 안내</h1>
      </div>
      <div class="retro-panel-content space-y-4 text-body text-foreground leading-relaxed">
        <p>
          <strong>shakilabs.com/card</strong>는 주유 할인카드·해외결제·연회비·마일리지 등
          카드 소비를 숫자로 비교할 수 있는 계산기를 제공하는 무료 서비스입니다.
        </p>
        <h2 class="text-heading font-bold">주유 할인카드 비교 계산기</h2>
        <p>
          월 주유 금액, 유종, 선호 주유소를 입력하면 카드별 실질 절약액을 즉시 비교합니다.
          리터당 할인, 퍼센트 할인, 캐시백 등 서로 다른 할인 구조를 동일 기준으로 비교하여
          내 주유 패턴에 가장 적합한 카드를 찾을 수 있습니다.
        </p>
        <h2 class="text-heading font-bold">데이터 기준과 검증 방법</h2>
        <ul class="list-disc pl-5 space-y-1 text-caption text-muted-foreground">
          <li>유가: Opinet(오피넷) 전국 평균 판매가를 기준으로 수동 반영합니다</li>
          <li>카드 혜택: 공식 상품 안내를 기준으로 비교 가능한 구조만 반영하고, 조건이 복잡한 혜택은 단순화하거나 제외합니다</li>
          <li>연회비/마일리지/관세 계산에는 예시 운임, 대표 환율, 인접 업종 매핑이 포함될 수 있습니다</li>
          <li>각 계산기 하단의 `출처 및 기준` 카드에서 공식 링크를 바로 확인할 수 있습니다</li>
          <li>계산 결과는 참고용이며, 실제 할인은 카드사 기준을 확인하세요</li>
        </ul>
        <p class="text-caption text-muted-foreground">
          모든 계산식과 상수는 배포 전에 관세청·Opinet 등 공공기관 고시와 카드사 공식 상품 안내에
          대조해 검증하며, 확인일과 출처 링크를 각 계산기 하단에 함께 표기합니다.
        </p>

        <h2 class="text-heading font-bold">운영자 정보</h2>
        <p>
          본 서비스는 개발 스튜디오 <strong>ShakiLabs</strong>가 직접 기획·개발·운영합니다.
          ShakiLabs는 shakilabs.com에서 금융·생활 분야의 무료 웹 계산기를 만들고 있습니다.
          <strong>운영: ShakiLabs · 문의: skdba1313@gmail.com</strong>
        </p>
        <div class="retro-board-list text-caption">
          <div class="retro-board-item">
            <span class="text-muted-foreground">운영</span>
            <span>ShakiLabs</span>
          </div>
          <div class="retro-board-item">
            <span class="text-muted-foreground">서비스 URL</span>
            <span>https://shakilabs.com/card</span>
          </div>
          <div class="retro-board-item">
            <span class="text-muted-foreground">이메일 문의</span>
            <a href="mailto:skdba1313@gmail.com" class="underline underline-offset-2">skdba1313@gmail.com</a>
          </div>
          <div class="retro-board-item">
            <span class="text-muted-foreground">응답 시간</span>
            <span>영업일 기준 24~48시간 이내</span>
          </div>
        </div>

        <h2 class="text-heading font-bold">문의</h2>
        <p class="text-caption text-muted-foreground">
          오류 제보 및 제안은 skdba1313@gmail.com으로 보내주세요.
        </p>

        <CompareSourceFooter
          :sources="ABOUT_PAGE_SOURCES"
          :updated-at="SOURCE_VERIFIED_AT"
          note="※ 페이지별 계산 로직에 쓰는 상세 출처는 각 계산기 하단 카드에서 확인할 수 있습니다."
        />
      </div>
    </div>
  </div>
</template>
