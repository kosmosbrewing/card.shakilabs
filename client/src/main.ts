import { createApp } from "vue";
import { createHead } from "@unhead/vue/client";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import "./assets/css/main.css";
import "@shakilabs/ui/styles.css";
import "./assets/css/responsive-accessibility.css";
import { initAnalytics, trackEvent } from "./lib/analytics";
import { captureSentryException, initSentry } from "./lib/sentry";
import { hasInAppGuide } from "./seo/guideRoutes";
import { removePrerenderChrome, removePrerenderContent } from "./utils/prerenderFallback";

function normalizeErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

async function bootstrap(): Promise<void> {
  const app = createApp(App);
  const head = createHead();
  const pinia = createPinia();

  app.config.errorHandler = (error, _instance, info) => {
    console.error("[global-error]", error, info);
    trackEvent("app_error", {
      message: normalizeErrorMessage(error),
      info,
    });
  };

  window.addEventListener("error", (event) => {
    trackEvent("app_error", {
      message: normalizeErrorMessage(event.error ?? event.message),
      info: "window.error",
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    trackEvent("app_error", {
      message: normalizeErrorMessage(event.reason),
      info: "window.unhandledrejection",
    });
  });

  initSentry(app);
  app.use(pinia);
  app.use(router);
  app.use(head);

  await router.isReady();
  app.mount("#app");

  // 공유 헤더·푸터는 Vue가 방금 같은 내용을 렌더했으니 바로 치운다.
  removePrerenderChrome();
  // 본문은 화면이 이미 같은 내용을 렌더하는 라우트에서만 바로 치운다.
  // 가이드가 필요한 라우트는 SeoRichContent가 대체 렌더를 올린 뒤 직접 제거한다.
  if (!hasInAppGuide(router.currentRoute.value.path)) {
    removePrerenderContent();
  }

  // GA 초기화를 LCP 이후로 미룸
  if (typeof requestIdleCallback === "function") {
    requestIdleCallback(() => initAnalytics(), { timeout: 4000 });
  } else {
    setTimeout(() => initAnalytics(), 0);
  }
}

void bootstrap().catch((error) => {
  captureSentryException(error, "bootstrap");
  console.error("[bootstrap] failed", error);
});
