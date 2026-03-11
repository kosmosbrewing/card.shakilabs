# 04.card 품질 개선 이슈

> **기준 문서**: `docs/BOILERPLATE_FRONTEND.md`, `docs/MVP_QUALITY_MANUAL.md`
> **점검일**: 2026-03-09 (1차), 2026-03-10 (2차)

---

## 🔴 HIGH — 즉시 수정

### ~~H1. index.html 반응형 font-size 누락~~ ✅ 해결
- `@media (max-width: 640px) { html { font-size: 14px; } }` 추가

### ~~H2. 동적 라우트 meta.title 누락 (3건)~~ ✅ 해결
- CardIssuer, FuelType, MonthlyAmount 라우트에 meta.title 추가

### ~~H3. OG 이미지 파일 누락~~ ✅ 해결
- `scripts/generate-og-image.mjs` 생성, `public/og-image.png` (1200×630) 생성 완료

### ~~H4. App.vue 페이지 전환 Transition 누락~~ ✅ 해결
- `<Transition name="page-fade" mode="out-in">` 래퍼 + CSS 추가

### ~~H5. GmarketSans woff2 미참조~~ ✅ 해결
- `main.css` @font-face에 woff2 format 우선 선언 추가

### ~~H6. KakaoTalk 공유 아이콘 에셋 누락~~ ✅ 해결
- `public/images/icons/kakaotalk-sharing-medium.svg` 추가
- `ShareModal.vue` 참조 경로를 로컬 SVG 에셋으로 교체
- `public/images/icons/` 디렉토리 생성으로 404 해소

---

## 🟡 MEDIUM — 다음 배포 전 수정

### ~~M1. Vite 청크 분리 — lucide-vue-next 미분리~~ ✅ 해결
- `lucide-vue-next` → `"icons"` 별도 청크, `radix-vue` → `"ui"` 분리

### ~~M2. SEO 빌드 스크립트 누락~~ ✅ 해결
- `scripts/seo-routes.mjs`, `generate-sitemap.mjs`, `prerender.mjs` 생성
- 빌드 시 14개 라우트 프리렌더 확인

### ~~M3. ads.txt 누락~~ ✅ 해결
- `public/ads.txt` 생성 (Google AdSense)

### ~~M4. package.json 빌드 스크립트 미비~~ ✅ 해결
- `"prebuild": "node scripts/generate-sitemap.mjs"`
- `"build": "vite build && node scripts/prerender.mjs"`

### ~~M5. `retro-titlebar-actions` CSS 클래스 미정의~~ ✅ 해결
- `main.css`에 `.retro-titlebar-actions { @apply flex items-center gap-2; }` 추가

### ~~M6. SectionShareButton 미구현~~ ✅ 해결
- `components/common/SectionShareButton.vue` 추가
- `FuelCardView.vue` SummaryBanner 하단에 인라인 공유 CTA + `ShareModal` 연결

---

## 🟢 LOW — 개선 권장 (미처리)

### ~~L1. 공통 컴포넌트 누락~~ ✅ 해결
- `components/common/EmptyState.vue`
- `components/common/ErrorMessage.vue`
- 기존 `WittyState.vue`를 재사용하는 래퍼 형태로 추가

### ~~L2. Composable 누락~~ ✅ 해결
- `composables/useUrlParams.ts` 추가
- `composables/useRecentCalcs.ts` 추가

### ~~L3. public/images/ 디렉토리 없음~~ ✅ 해결
- `public/images/icons/` 디렉토리 생성
- 공유 아이콘 로컬 에셋 배치

---

## 점검 요약

| 등급 | 전체 | 해결 | 미해결 |
|------|------|------|--------|
| 🔴 HIGH | 6 | 6 | 0 |
| 🟡 MEDIUM | 6 | 6 | 0 |
| 🟢 LOW | 3 | 3 | 0 |
| **합계** | **15** | **15** | **0** |

> 문서 기준 미해결 항목은 모두 반영 완료.
