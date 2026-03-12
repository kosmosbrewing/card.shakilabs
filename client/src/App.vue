<script setup lang="ts">
import { onErrorCaptured, ref, watch } from "vue";
import { useRoute } from "vue-router";
import AppLayout from "@/components/layout/AppLayout.vue";
import AlertHost from "@/components/ui/alert/AlertHost.vue";
import LoadingSpinner from "@/components/ui/loading/LoadingSpinner.vue";

const route = useRoute();
const routeError = ref("");

watch(
  () => route.fullPath,
  () => {
    routeError.value = "";
  }
);

onErrorCaptured((error, _instance, info) => {
  const message = error instanceof Error ? error.message : String(error);
  routeError.value = `${message}${info ? ` (${info})` : ""}`;
  return false;
});
</script>

<template>
  <AppLayout>
    <RouterView v-slot="{ Component, route }">
      <div :key="route.path">
        <div v-if="routeError" class="container py-10">
          <div class="retro-panel overflow-hidden border-status-danger/30">
            <div class="retro-titlebar rounded-t-2xl">
              <h2 class="retro-title text-status-danger">화면을 불러오지 못했습니다</h2>
            </div>
            <div class="retro-panel-content space-y-2">
              <p class="text-body text-foreground">라우트 전환 중 런타임 오류가 발생했습니다.</p>
              <p class="text-caption text-muted-foreground break-all">{{ routeError }}</p>
            </div>
          </div>
        </div>
        <Suspense
          v-else-if="Component"
          timeout="0"
        >
          <component :is="Component" />
          <template #fallback>
            <div class="container py-10">
              <LoadingSpinner
                variant="spinner"
                message="화면을 불러오는 중입니다."
              />
            </div>
          </template>
        </Suspense>
      </div>
    </RouterView>
    <AlertHost />
  </AppLayout>
</template>
