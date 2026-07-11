<script setup lang="ts">
import { RouterLink } from "vue-router";
import { ShText } from "@shakilabs/ui";
import { FUEL_PRICES } from "@/data/fuelPrices";

const year = new Date().getFullYear();
</script>

<template>
  <footer class="mt-8 border-t border-border/60 bg-muted/20">
    <div class="container py-5">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <ShText as="p" variant="label">shakilabs.com/card</ShText>
        <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.75rem]">
          <RouterLink to="/about" class="text-muted-foreground hover:text-foreground transition-colors">
            사이트 안내
          </RouterLink>
          <RouterLink to="/terms" class="text-muted-foreground hover:text-foreground transition-colors">
            이용약관
          </RouterLink>
          <RouterLink to="/privacy" class="text-muted-foreground hover:text-foreground transition-colors">
            개인정보 처리방침
          </RouterLink>
        </div>
      </div>
      <div class="mt-3 border-t border-border/40 pt-3 space-y-1">
        <ShText as="p" variant="label" tone="muted">
          유가 기준: {{ FUEL_PRICES.lastUpdated }} ({{ FUEL_PRICES.source }}) | 카드 혜택은 변경될 수 있으며, 실제 할인은 카드사 기준을 확인하세요.
        </ShText>
        <ShText as="p" variant="label" tone="muted">
          Copyright &copy; {{ year }} shakilabs.com
        </ShText>
      </div>
    </div>
  </footer>
</template>
