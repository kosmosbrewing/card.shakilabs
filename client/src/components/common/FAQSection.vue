<script setup lang="ts">
import { ref } from "vue";
import { ChevronDown } from "lucide-vue-next";

defineProps<{
  faqs: { question: string; answer: string }[];
}>();

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
