<script setup lang="ts">
import { Share2 } from "lucide-vue-next";

withDefaults(
  defineProps<{
    label?: string;
  }>(),
  {
    label: "결과 공유",
  }
);

defineEmits<{
  click: [];
}>();
</script>

<template>
  <button
    type="button"
    class="retro-button-subtle touch-target gap-2 !px-3 text-caption font-semibold"
    @click="$emit('click')"
  >
    <Share2 class="h-4 w-4" />
    {{ label }}
  </button>
</template>
