<script setup lang="ts">
// 차트 본체는 @shakilabs/ui ShMetricBars(signed 도메인) — 이 파일은 card retro 크롬과 톤 변환만 담당한다.
// 승격 이유: 로컬 svg에는 role·aria-value*가 전혀 없어 스크린리더에 값이 안 갔고,
// rx가 viewBox 단위라 폭이 넓을수록 코너가 늘어나 RankedBars(승격분)와 막대 모양이 갈렸다.
import { computed } from "vue";
import { ShMetricBars } from "@shakilabs/ui";
import type { MetricBarGroup } from "@shakilabs/ui";

type DivergingItem = { key: string; label: string; value: number };

const props = defineProps<{
  title: string;
  /** 그룹 라벨 겸 스크린리더 문맥 — 막대 aria-label이 "<metricLabel> <항목 라벨>"로 조합된다 */
  metricLabel: string;
  items: readonly DivergingItem[];
  formatValue: (value: number) => string;
}>();

// 승격 전 fill-loss/fill-savings를 그대로 유지한다(앱 CSS가 danger→--loss, success→--savings로 고정).
const metrics = computed<MetricBarGroup[]>(() => [{
  key: "diverging",
  label: props.metricLabel,
  values: props.items.map((item) => ({
    key: item.key,
    label: item.label,
    value: item.value,
    tone: item.value < 0 ? ("danger" as const) : ("success" as const),
  })),
}]);
</script>

<template>
  <section class="retro-panel overflow-hidden">
    <!-- 차트 루트가 본문 여백을 갖고, 타이틀바만 음수 마진으로 패널 폭까지 흘려 기존 크롬을 유지한다 -->
    <ShMetricBars
      class="px-4 pb-3 sm:px-5 sm:pb-4"
      :metrics="metrics"
      :format-value="formatValue"
      domain="signed"
      note="0원 기준선을 두고 왼쪽이 손실, 오른쪽이 혜택입니다."
      show-scale
    >
      <template #header="{ titleId }">
        <!-- 타이틀바는 패널 폭 전체를 채워야 해서 본문 좌우 여백을 음수 마진으로 되돌린다. -->
        <div class="retro-titlebar -mx-4 mb-3 rounded-t-2xl sm:-mx-5 sm:mb-4">
          <h2 :id="titleId" class="retro-title">{{ title }}</h2>
        </div>
      </template>
    </ShMetricBars>
  </section>
</template>
