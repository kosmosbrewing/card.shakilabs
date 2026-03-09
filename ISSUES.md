# 04.card 품질 개선 이슈

> **기준 문서**: `docs/BOILERPLATE_FRONTEND.md`, `docs/MVP_QUALITY_MANUAL.md`
> **점검일**: 2026-03-09

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

---

## 🟢 LOW — 개선 권장 (미처리)

### L1. 공통 컴포넌트 누락
- `EmptyState.vue` — 빈 상태 (아이콘 + 메시지) 표시
- `ErrorMessage.vue` — 에러 상태 표시
- **현재**: `WittyState.vue`로 대체 사용 중, 필요 시 02.finance에서 복사

### L2. Composable 누락
- `useUrlParams.ts` — URL 쿼리 파라미터 동기화
- `useRecentCalcs.ts` — 최근 계산 이력 (localStorage)
- **현재**: 기능 자체가 미구현 상태, 필요 시 추가

### L3. public/images/ 디렉토리 없음
- **기준**: 브랜드 에셋 전용 디렉토리
- **현재**: favicon.png만 public/ 루트에 존재

---

## 점검 요약

| 등급 | 전체 | 해결 | 미해결 |
|------|------|------|--------|
| 🔴 HIGH | 5 | 5 | 0 |
| 🟡 MEDIUM | 4 | 4 | 0 |
| 🟢 LOW | 3 | 0 | 3 |
| **합계** | **12** | **9** | **3** |

> LOW 3건은 현재 기능에 영향 없는 선택적 개선 항목입니다.
