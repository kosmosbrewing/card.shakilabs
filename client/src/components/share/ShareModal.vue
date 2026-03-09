<script setup lang="ts">
import { onBeforeUnmount, watch } from "vue";
import { Link, X } from "lucide-vue-next";

const props = defineProps<{
  show: boolean;
  kakaoBusy: boolean;
  summaryText: string;
}>();

const emit = defineEmits<{
  close: [];
  shareKakao: [];
  copyLink: [];
}>();

function handleEscapeKey(event: KeyboardEvent): void {
  if (event.key === "Escape" && props.show) {
    emit("close");
  }
}

watch(
  () => props.show,
  (show) => {
    if (show) {
      window.addEventListener("keydown", handleEscapeKey);
      return;
    }

    window.removeEventListener("keydown", handleEscapeKey);
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleEscapeKey);
});

function handleAction(action: "kakao" | "link"): void {
  if (action === "kakao") emit("shareKakao");
  else emit("copyLink");
  emit("close");
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="props.show"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-modal-title"
      >
        <div class="absolute inset-0 bg-black/60" @click="emit('close')" />
        <div class="relative z-10 w-full max-w-sm mx-4 retro-panel border border-border">
          <div class="retro-titlebar flex items-center justify-between">
            <h3 id="share-modal-title" class="retro-title text-[1rem]!">공유하기</h3>
            <button
              class="inline-flex items-center justify-center rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
              aria-label="공유 모달 닫기"
              @click="emit('close')"
            >
              <X class="h-4 w-4" />
            </button>
          </div>

          <div class="p-4 space-y-3">
            <div class="retro-panel-muted border border-border/40 px-3 py-2">
              <p class="text-caption text-muted-foreground">현재 계산 조건</p>
              <p class="text-caption font-semibold mt-1 break-words">{{ props.summaryText }}</p>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <!-- 카카오톡 공유 -->
              <button
                class="flex flex-col items-center gap-2 retro-panel-muted border border-border/40 p-3 hover:border-yellow-400/60 transition-colors disabled:opacity-50"
                :disabled="props.kakaoBusy"
                aria-label="카카오톡 공유"
                @click="handleAction('kakao')"
              >
                <img
                  src="/images/icons/kakaotalk-sharing-medium.png?v=1"
                  alt=""
                  aria-hidden="true"
                  class="h-6 w-6 object-contain"
                />
                <span class="text-[0.72rem] font-bold text-center leading-tight whitespace-nowrap">카카오톡 공유</span>
              </button>

              <!-- 링크 복사 -->
              <button
                class="flex flex-col items-center gap-2 retro-panel-muted border border-border/40 p-3 hover:border-border/80 transition-colors"
                aria-label="공유 링크 복사"
                @click="handleAction('link')"
              >
                <Link class="h-6 w-6 text-muted-foreground" />
                <span class="text-[0.72rem] font-bold text-center leading-tight whitespace-nowrap">링크 복사</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.retro-title {
  font-size: 1rem !important;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
