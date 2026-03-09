import path from "path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwind from "tailwindcss";
import autoprefixer from "autoprefixer";

const APP_ID = "car-tools";
const DEV_PORT = 5174;

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
  },
  base: "/",
  css: {
    postcss: {
      plugins: [tailwind(), autoprefixer()],
    },
  },
  plugins: [vue()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  define: {
    __APP_ID__: JSON.stringify(APP_ID),
  },
  server: {
    port: DEV_PORT,
  },
  esbuild: {
    drop: ["console", "debugger"],
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    minify: "esbuild",
    rollupOptions: {
      output: {
        assetFileNames: "assets/[name].[hash][extname]",
        chunkFileNames: "assets/[name].[hash].js",
        entryFileNames: "assets/[name].[hash].js",
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          // 프레임워크 코어 (변경 빈도 낮음 → 장기 캐시)
          if (id.includes("vue") || id.includes("pinia") || id.includes("vue-router")) {
            return "vendor";
          }
          // UI 라이브러리
          if (id.includes("radix-vue") || id.includes("lucide-vue-next")) {
            return "ui";
          }
          // 기타 라이브러리
          return "libs";
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
});
