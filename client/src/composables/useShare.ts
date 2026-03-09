// 주유 할인카드 공유 기능

import { computed, ref } from "vue";
import { showAlert } from "./useAlert";
import { buildAbsoluteUrl, copyToClipboard } from "@/lib/routeState";
import { trackEvent } from "@/lib/analytics";
import type { FuelCardCalcResult } from "@/utils/calculator";
import type { FuelType } from "@/data/fuelPrices";
import { FUEL_TYPE_LABELS } from "@/data/fuelPrices";

declare global {
  interface Window {
    Kakao?: {
      init: (key: string) => void;
      isInitialized: () => boolean;
      Share: {
        sendDefault: (params: Record<string, unknown>) => void;
      };
    };
  }
}

let kakaoSdkPromise: Promise<void> | null = null;

interface ShareContext {
  fuelType: { value: FuelType };
  monthlySpend: { value: number };
  bestCard: { value: FuelCardCalcResult | null };
}

export function useShare(ctx: ShareContext) {
  const showShareModal = ref(false);
  const kakaoBusy = ref(false);

  const shareSummary = computed(() => {
    const best = ctx.bestCard.value;
    if (!best) return "";
    return `월 ${ctx.monthlySpend.value.toLocaleString()}원 ${FUEL_TYPE_LABELS[ctx.fuelType.value]} 주유 → ${best.card.issuer} ${best.card.name} 연 ${best.annualNet.toLocaleString()}원 절약 ⛽`;
  });

  function openShare(): void {
    trackEvent("ux_share_modal_open", { page: "fuel-card" });
    showShareModal.value = true;
  }

  function closeShare(): void {
    showShareModal.value = false;
  }

  function getShareUrl(): string {
    const path = "/fuel-card";
    return buildAbsoluteUrl(path, {
      fuel: ctx.fuelType.value !== "gasoline" ? ctx.fuelType.value : null,
      monthly: ctx.monthlySpend.value !== 200000 ? ctx.monthlySpend.value : null,
    });
  }

  function getShareText(): string {
    const best = ctx.bestCard.value;
    if (!best) return "주유 할인카드 비교 계산기";
    return `월 ${ctx.monthlySpend.value.toLocaleString()}원 주유 → ${best.card.issuer} ${best.card.name}가 가장 유리!`;
  }

  async function copyLink(): Promise<void> {
    const shareUrl = getShareUrl();
    const copied = await copyToClipboard(shareUrl);
    try {
      if (!copied) throw new Error("Clipboard API unavailable");
      trackEvent("ux_share_link_copy_success", { page: "fuel-card" });
      showAlert("링크가 복사되었습니다");
    } catch {
      trackEvent("ux_share_link_copy_fail", { page: "fuel-card" });
      showAlert("링크 복사에 실패했습니다", { type: "error" });
    }
  }

  async function ensureKakaoSdk(): Promise<void> {
    if (window.Kakao) return;
    if (kakaoSdkPromise) return kakaoSdkPromise;

    const key = (import.meta.env.VITE_KAKAO_JS_KEY || "").trim();
    if (!key) throw new Error("KAKAO_JS_KEY not configured");

    kakaoSdkPromise = new Promise<void>((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>('script[data-kakao-sdk="true"]');
      if (existing) {
        if (window.Kakao) { resolve(); return; }
        if (existing.dataset.loaded === "true") { reject(new Error("Kakao SDK not available")); return; }
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", () => reject(new Error("Kakao SDK load failed")), { once: true });
        return;
      }

      const script = document.createElement("script");
      script.src = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js";
      script.async = true;
      script.dataset.kakaoSdk = "true";
      script.onload = () => { script.dataset.loaded = "true"; resolve(); };
      script.onerror = () => reject(new Error("Kakao SDK load failed"));
      document.head.appendChild(script);
    }).then(() => {
      if (window.Kakao && !window.Kakao.isInitialized()) {
        window.Kakao.init(key);
      }
    }).finally(() => {
      if (!window.Kakao) kakaoSdkPromise = null;
    });

    return kakaoSdkPromise;
  }

  async function shareKakao(): Promise<void> {
    if (kakaoBusy.value) return;
    kakaoBusy.value = true;

    try {
      await ensureKakaoSdk();
      if (!window.Kakao?.Share) throw new Error("Kakao Share not available");

      window.Kakao.Share.sendDefault({
        objectType: "feed",
        content: {
          title: getShareText(),
          description: "주유 할인카드 비교 계산기 — 내 주유 패턴에 맞는 최적 카드 찾기",
          imageUrl: `${window.location.origin}/favicon.png`,
          link: { mobileWebUrl: getShareUrl(), webUrl: getShareUrl() },
        },
        buttons: [
          {
            title: "카드 비교하기",
            link: { mobileWebUrl: getShareUrl(), webUrl: getShareUrl() },
          },
        ],
      });
      trackEvent("ux_share_kakao_success", { page: "fuel-card" });
    } catch {
      trackEvent("ux_share_kakao_fail", { page: "fuel-card" });
      showAlert("카카오톡 공유에 실패했습니다", { type: "error" });
    } finally {
      kakaoBusy.value = false;
    }
  }

  return {
    showShareModal,
    kakaoBusy,
    shareSummary,
    openShare,
    closeShare,
    shareKakao,
    copyLink,
  };
}
