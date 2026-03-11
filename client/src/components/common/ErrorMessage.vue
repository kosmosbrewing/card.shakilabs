<script setup lang="ts">
import WittyState from "@/components/common/WittyState.vue";

withDefaults(
  defineProps<{
    title?: string;
    description?: string;
  }>(),
  {
    title: "",
    description: "",
  }
);
</script>

<template>
  <WittyState
    type="error"
    :title="title"
    :description="description"
  />
</template>
