<script setup lang="ts">
// 차트 본체는 @shakilabs/ui ShGapBars(1위 대비 차이 막대) — 이 파일은 card retro 크롬만 입힌다.
// 값이 비슷한 선택지를 0부터 그리면(RankedBars) 막대가 전부 같은 길이로 보여 차이가 사라질 때 쓴다.
import { ShGapBars } from "@shakilabs/ui";
import type { GapBarItem, GapDirection } from "@shakilabs/ui";

defineProps<{
  title: string;
  note: string;
  items: readonly GapBarItem[];
  formatValue: (value: number) => string;
  better: GapDirection;
}>();
</script>

<template>
  <section class="retro-panel overflow-hidden">
    <ShGapBars
      class="px-4 pb-3 sm:px-5 sm:pb-4"
      :items="items"
      :note="note"
      :format-value="formatValue"
      :better="better"
      highlight-tone="success"
    >
      <template #header="{ titleId }">
        <!-- 타이틀바는 패널 폭 전체를 채워야 해서 본문 좌우 여백을 음수 마진으로 되돌린다(RankedBars와 동일). -->
        <div class="retro-titlebar -mx-4 mb-3 rounded-t-2xl sm:-mx-5 sm:mb-4">
          <h2 :id="titleId" class="retro-title">{{ title }}</h2>
        </div>
      </template>
    </ShGapBars>
  </section>
</template>
