<script setup lang="ts">
import { computed, ref } from "vue";
import { CreditCard, Share2 } from "lucide-vue-next";
import {
  BENEFIT_CATEGORIES,
  createDefaultSpendingPattern,
  type BenefitCategoryId,
  type SpendingPatternMap,
} from "@/data/annualFeeCards";

const props = defineProps<{
  spending: SpendingPatternMap;
  totalMonthlySpend: number;
}>();

const emit = defineEmits<{
  "update:spending": [{ categoryId: BenefitCategoryId; amount: number }];
  shareRequest: [];
}>();

const showAdvanced = ref(false);
const defaultSpendingPattern = createDefaultSpendingPattern();

const primaryCategories = computed(() =>
  BENEFIT_CATEGORIES.filter((category) => category.order <= 4)
);
const advancedCategories = computed(() =>
  BENEFIT_CATEGORIES.filter((category) => category.order > 4)
);
const quickPresets = [
  {
    label: "생활형",
    values: {
      dining: 220000,
      shopping: 120000,
      transport: 140000,
      convenience: 90000,
      telecom: 70000,
      travel: 0,
      culture: 40000,
      general: 100000,
    } satisfies SpendingPatternMap,
  },
  {
    label: "쇼핑형",
    values: {
      dining: 150000,
      shopping: 320000,
      transport: 90000,
      convenience: 70000,
      telecom: 60000,
      travel: 20000,
      culture: 30000,
      general: 120000,
    } satisfies SpendingPatternMap,
  },
  {
    label: "여행형",
    values: {
      dining: 180000,
      shopping: 140000,
      transport: 100000,
      convenience: 70000,
      telecom: 60000,
      travel: 280000,
      culture: 50000,
      general: 150000,
    } satisfies SpendingPatternMap,
  },
  {
    label: "절약형",
    values: {
      dining: 120000,
      shopping: 80000,
      transport: 70000,
      convenience: 50000,
      telecom: 60000,
      travel: 0,
      culture: 20000,
      general: 80000,
    } satisfies SpendingPatternMap,
  },
];

function handleInput(categoryId: BenefitCategoryId, event: Event) {
  const value = Number((event.target as HTMLInputElement).value.replace(/[^0-9]/g, ""));
  emit("update:spending", { categoryId, amount: value >= 0 ? value : 0 });
}

function applyPreset(values: SpendingPatternMap) {
  for (const [categoryId, amount] of Object.entries(values) as [BenefitCategoryId, number][]) {
    emit("update:spending", { categoryId, amount });
  }
}

function getCategorySliderMax(categoryId: BenefitCategoryId) {
  const reference = Math.max(
    props.spending[categoryId],
    defaultSpendingPattern[categoryId],
    100000
  );
  return Math.ceil((reference * 2) / 100000) * 100000;
}
</script>

<template>
  <div class="retro-panel overflow-hidden">
    <div class="retro-titlebar rounded-t-2xl">
      <h1 class="retro-title flex items-center gap-2">
        <CreditCard class="h-5 w-5 text-primary" />
        연회비 회수 계산기
      </h1>
      <button
        type="button"
        class="inline-flex items-center gap-1.5 rounded border border-border/70 bg-background/70 px-2.5 py-1 text-caption font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
        @click="emit('shareRequest')"
      >
        <Share2 class="h-3.5 w-3.5" />
        <span>공유</span>
      </button>
    </div>

    <div class="retro-panel-content space-y-4">
      <div class="space-y-2">
        <div class="flex items-center justify-between gap-3">
          <h2 class="text-caption font-semibold text-muted-foreground">월 소비 패턴</h2>
          <span class="text-caption text-muted-foreground">카테고리별 카드 결제 기준</span>
        </div>

        <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <label
            v-for="category in primaryCategories"
            :key="category.id"
            class="space-y-1.5"
          >
            <span class="text-caption font-semibold text-foreground">{{ category.label }}</span>
            <div class="relative">
              <input
                type="text"
                inputmode="numeric"
                class="retro-input !pr-10 text-right tabular-nums"
                :placeholder="category.placeholder"
                :value="props.spending[category.id].toLocaleString()"
                @input="handleInput(category.id, $event)"
              />
              <span class="absolute right-3 top-1/2 -translate-y-1/2 text-caption text-muted-foreground">원</span>
            </div>
            <input
              type="range"
              min="0"
              :max="getCategorySliderMax(category.id)"
              step="10000"
              class="retro-range"
              :value="props.spending[category.id]"
              @input="emit('update:spending', { categoryId: category.id, amount: Number(($event.target as HTMLInputElement).value) })"
            />
          </label>
        </div>
      </div>

      <details class="retro-details" :open="showAdvanced || undefined">
        <summary class="retro-details-summary" @click.prevent="showAdvanced = !showAdvanced">
          <span>고급 설정</span>
          <span class="retro-details-chevron" :class="showAdvanced && 'rotate-180'">▼</span>
        </summary>
        <div v-if="showAdvanced" class="space-y-3 px-3 py-3">
          <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <label
              v-for="category in advancedCategories"
              :key="category.id"
              class="space-y-1.5"
            >
              <span class="text-caption font-semibold text-foreground">{{ category.label }}</span>
              <div class="relative">
                <input
                  type="text"
                  inputmode="numeric"
                  class="retro-input !pr-10 text-right tabular-nums"
                  :placeholder="category.placeholder"
                  :value="props.spending[category.id].toLocaleString()"
                  @input="handleInput(category.id, $event)"
                />
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-caption text-muted-foreground">원</span>
              </div>
              <input
                type="range"
                min="0"
                :max="getCategorySliderMax(category.id)"
                step="10000"
                class="retro-range"
                :value="props.spending[category.id]"
                @input="emit('update:spending', { categoryId: category.id, amount: Number(($event.target as HTMLInputElement).value) })"
              />
            </label>
          </div>
        </div>
      </details>

      <div class="space-y-2">
        <p class="text-caption font-semibold text-muted-foreground">빠른 소비 패턴 적용</p>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="preset in quickPresets"
            :key="preset.label"
            type="button"
            class="rounded-lg border border-border/70 px-2.5 py-1.5 text-caption font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
            @click="applyPreset(preset.values)"
          >
            {{ preset.label }}
          </button>
        </div>
      </div>

      <div class="retro-panel-muted flex items-center justify-between gap-3 px-4 py-3">
        <span class="text-caption font-semibold text-muted-foreground">총 월 카드 지출</span>
        <span class="text-body font-bold tabular-nums text-foreground">
          {{ totalMonthlySpend.toLocaleString() }}원
        </span>
      </div>
    </div>
  </div>
</template>
