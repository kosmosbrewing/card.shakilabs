// 공개 상수 스토어 (car-tools는 원격 로드 불필요, 로컬 폴백만 사용)

import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { DEFAULT_SITE_URL } from "@/lib/site";
import { FUEL_PRICES } from "@/data/fuelPrices";

interface CarToolsConstants {
  siteUrl: string;
  fuelDataUpdated: string;
  supportEmail: string;
}

const fallbackConstants: CarToolsConstants = {
  siteUrl: DEFAULT_SITE_URL,
  fuelDataUpdated: FUEL_PRICES.lastUpdated,
  supportEmail: "shakilabs@gmail.com",
};

export const useConstantsStore = defineStore("constants", () => {
  const constants = ref<CarToolsConstants>(fallbackConstants);
  const isLoading = ref(false);
  const isLoaded = ref(false);
  const loadError = ref<string | null>(null);

  async function loadConstants(): Promise<CarToolsConstants> {
    // car-tools는 백엔드 없이 로컬 데이터만 사용
    constants.value = fallbackConstants;
    isLoaded.value = true;
    return constants.value;
  }

  const siteUrl = computed(() => constants.value.siteUrl);
  const fuelDataUpdated = computed(() => constants.value.fuelDataUpdated);
  const supportEmail = computed(() => constants.value.supportEmail);

  return {
    constants,
    isLoading,
    isLoaded,
    loadError,
    siteUrl,
    fuelDataUpdated,
    supportEmail,
    loadConstants,
  };
});
