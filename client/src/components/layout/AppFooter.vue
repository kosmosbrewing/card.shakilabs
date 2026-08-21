<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router";
import { ShSiteFooter } from "@shakilabs/ui";
import { FOOTER_ALL_LINK, FOOTER_SECTIONS } from "@/data/footerNav";
import { useConstantsStore } from "@/stores/constants";
import { FUEL_PRICES } from "@/data/fuelPrices";

const constantsStore = useConstantsStore();
const year = new Date().getFullYear();
const SUPPORT_EMAIL = constantsStore.supportEmail;

const policyLinks = [
  { to: "/about", label: "사이트 안내" },
  { to: "/terms", label: "이용약관" },
  { to: "/privacy", label: "개인정보 처리방침" },
  // 블로그는 root 앱(shakilabs.com/blog) 소유라 이 앱 외부로 나가는 링크다. href를 주면
  // ShSiteFooter가 RouterLink 대신 <a href>로 렌더한다(RouterLink면 /card/blog가 된다).
  { to: "", href: "/blog", label: "블로그" },
  { to: "", href: `mailto:${SUPPORT_EMAIL}`, label: "문의" },
];

const note = computed(() => `유가 기준: ${FUEL_PRICES.lastUpdated} (${FUEL_PRICES.source}) | 카드 혜택은 변경될 수 있으며, 실제 할인은 카드사 기준을 확인하세요.`);
</script>

<template>
  <ShSiteFooter
    app="card"
    :sections="FOOTER_SECTIONS"
    :all-link="FOOTER_ALL_LINK"
    :policy-links="policyLinks"
    :note="note"
    site-label="shakilabs.com/card"
    :copyright="`Copyright © ${year} shakilabs.com`"
    :link-component="RouterLink"
  />
</template>
