<script setup lang="ts">
import { Trophy } from "lucide-vue-next";

defineProps<{
  message: string;
}>();
</script>

<template>
  <div class="relative overflow-hidden rounded-2xl border border-primary/20 bg-primary/10 px-4 py-4 sm:px-5 sm:py-5">
    <div class="flex items-start gap-3">
      <span class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
        <Trophy class="h-4 w-4" />
      </span>
      <p class="text-body font-semibold text-foreground leading-relaxed">
        {{ message }}
      </p>
    </div>
  </div>
</template>
