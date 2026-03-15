import { computed, ref } from "vue";
import { showAlert } from "./useAlert";
import { copyToClipboard } from "@/lib/routeState";
import { trackEvent } from "@/lib/analytics";

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

interface ResultShareOptions {
  page: string;
  summaryText: () => string;
  shareUrl: () => string;
  shareTitle: () => string;
  shareDescription: () => string;
  buttonTitle: string;
}

export function useResultShare(options: ResultShareOptions) {
  const showShareModal = ref(false);
  const kakaoBusy = ref(false);

  const shareSummary = computed(() => options.summaryText());

  function openShare(): void {
    trackEvent("ux_share_modal_open", { page: options.page });
    showShareModal.value = true;
  }

  function closeShare(): void {
    showShareModal.value = false;
  }

  async function copyLink(): Promise<void> {
    try {
      const copied = await copyToClipboard(options.shareUrl());
      if (copied) {
        trackEvent("ux_share_link_copy_success", { page: options.page });
        showAlert("링크가 복사되었습니다");
      } else {
        trackEvent("ux_share_link_copy_fail", { page: options.page });
        showAlert("링크 복사에 실패했습니다", { type: "error" });
      }
    } catch {
      trackEvent("ux_share_link_copy_fail", { page: options.page });
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

      const url = options.shareUrl();
      window.Kakao.Share.sendDefault({
        objectType: "feed",
        content: {
          title: options.shareTitle(),
          description: options.shareDescription(),
          imageUrl: `${window.location.origin}/favicon.png`,
          link: { mobileWebUrl: url, webUrl: url },
        },
        buttons: [
          {
            title: options.buttonTitle,
            link: { mobileWebUrl: url, webUrl: url },
          },
        ],
      });
      trackEvent("ux_share_kakao_success", { page: options.page });
    } catch {
      trackEvent("ux_share_kakao_fail", { page: options.page });
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
