import { createApp } from "vue";
import { createHead } from "@vueuse/head";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import "./assets/css/main.css";
import { initAnalytics, trackEvent } from "./lib/analytics";

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

  app.use(pinia);
  app.use(router);
  app.use(head);

  await router.isReady();
  app.mount("#app");

  // GA 초기화를 LCP 이후로 미룸
  if (typeof requestIdleCallback === "function") {
    requestIdleCallback(() => initAnalytics(), { timeout: 4000 });
  } else {
    setTimeout(() => initAnalytics(), 0);
  }
}

void bootstrap().catch((error) => {
  console.error("[bootstrap] failed", error);
});
