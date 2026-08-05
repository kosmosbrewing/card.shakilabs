<script setup lang="ts">
import SEOHead from "@/components/common/SEOHead.vue";
</script>

<template>
  <SEOHead
    title="개인정보 처리방침 | 카드 계산기"
    description="shakilabs.com/card 개인정보 처리방침"
  />

  <div class="container space-y-5 py-5">
    <div class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h1 class="retro-title">개인정보 처리방침</h1>
      </div>
      <div class="retro-panel-content space-y-4 text-body text-foreground leading-relaxed">
        <p>
          <strong>shakilabs.com/card</strong>(이하 "서비스")은 이용자의 개인정보를 중요시하며,
          개인정보 보호법을 준수합니다. 본 방침은 서비스 이용 과정에서 수집·이용되는 정보를 안내합니다.
        </p>

        <h2 class="text-heading font-bold">1. 수집하는 개인정보</h2>
        <p>
          본 서비스는 회원가입 없이 이용 가능하며, 이름·연락처 등 직접적인 개인정보를 수집하지 않습니다.
          다만 서비스 운영 과정에서 접속 IP, 브라우저 종류, 방문 페이지 등 비식별 정보가 자동 수집될 수 있습니다.
        </p>
        <p>
          계산기에 입력하는 월 주유비·카드 소비 금액·결제 통화·연회비 등 모든 입력값은
          서버로 전송되거나 저장되지 않으며, 이용자의 브라우저 안에서만 계산됩니다.
        </p>

        <h2 class="text-heading font-bold">2. 쿠키 및 분석 도구</h2>
        <p>
          서비스 개선을 위해 Google Analytics를 사용합니다.
          수집되는 정보는 페이지 방문 기록, 체류 시간 등 비식별 통계 데이터입니다.
          수집을 원하지 않으면
          <a
            href="https://tools.google.com/dlpage/gaoptout"
            target="_blank"
            rel="noopener noreferrer"
            class="underline underline-offset-2"
          >Google Analytics 수집 거부 애드온</a>을 이용할 수 있습니다.
        </p>

        <h2 class="text-heading font-bold">3. Google AdSense 광고와 쿠키</h2>
        <p>
          본 서비스는 Google AdSense를 통해 광고를 게재하고, 광고 수익으로 무료 서비스를 운영합니다.
          광고 게재와 관련해 다음 사항을 안내합니다.
        </p>
        <ul class="list-disc pl-5 space-y-1">
          <li>
            Google을 포함한 제3자 광고 사업자는 쿠키를 사용해 이용자의 본 서비스 및
            다른 웹사이트 방문 기록을 기반으로 광고를 게재합니다.
          </li>
          <li>
            Google은 광고 쿠키를 통해 이용자의 이전 방문 기록에 따라 관심사 기반
            맞춤 광고를 표시할 수 있습니다.
          </li>
          <li>
            이용자는
            <a
              href="https://adssettings.google.com"
              target="_blank"
              rel="noopener noreferrer"
              class="underline underline-offset-2"
            >Google 광고 설정</a>에서 맞춤 광고를 언제든지 해제할 수 있습니다.
          </li>
          <li>
            Google 외 제3자 광고 사업자의 맞춤 광고 쿠키는
            <a
              href="https://www.aboutads.info/choices"
              target="_blank"
              rel="noopener noreferrer"
              class="underline underline-offset-2"
            >www.aboutads.info/choices</a>에서 일괄 거부할 수 있습니다.
          </li>
        </ul>
        <p>
          맞춤 광고를 해제해도 광고 자체는 계속 표시될 수 있으며, 이 경우 이용자의 관심사와
          무관한 일반 광고가 노출됩니다.
        </p>

        <h2 class="text-heading font-bold">4. 쿠키 관리</h2>
        <p>
          브라우저 설정에서 쿠키 저장을 거부하거나 저장된 쿠키를 삭제할 수 있습니다.
          다만 쿠키를 차단하면 일부 기능이 제한될 수 있습니다.
        </p>

        <h2 class="text-heading font-bold">5. 보관 및 파기</h2>
        <p>
          방문 로그는 Google Analytics 정책에 따라 기본 26개월 보관되며, 이후 자동 파기됩니다.
          본 서비스가 자체적으로 보관하는 개인정보는 없습니다.
        </p>

        <h2 class="text-heading font-bold">6. 문의</h2>
        <p>
          운영: ShakiLabs · 문의:
          <a href="mailto:skdba1313@gmail.com" class="underline underline-offset-2">skdba1313@gmail.com</a>
        </p>

        <p class="text-caption text-muted-foreground">시행일: 2026년 3월 7일 · 최종 개정일: 2026년 8월 5일</p>
      </div>
    </div>
  </div>
</template>
