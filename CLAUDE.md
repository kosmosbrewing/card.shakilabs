# card.shakilabs — 작업 규칙

- 스택: Vue 3 + Vite(클라이언트 SPA) + 자체 프리렌더(`client/scripts/prerender.mjs`), 공통 UI `@shakilabs/ui`(`client/vendor/*.tgz` 고정). 배포는 Vercel Git 통합(`shakilabs.com/card`).

## 검증 (CI와 같은 순서, `client/`에서)
```sh
npm ci
npm run typecheck && npm test
npm run build            # 프리렌더 + validate-static-output·accent-tokens·폰트 게이트 포함
npm run verify:hydration && npm run verify:mobile-overflow
npm run verify:brand-font && npm run verify:supply-chain
```
- 빌드가 "UI characters changed"로 멈추면 `npm run fonts:subset` 후 다시 빌드.
- prebuild가 `public/sitemap.xml`의 lastmod만 바꿨다면 그 변경은 커밋하지 않는다.
- 테스트를 skip하거나 게이트를 끄지 않는다.

## 계산기 화면 레이아웃
1. lg(1024px) 이상은 `ShCalculatorSplit`으로 왼쪽 입력 | 오른쪽 결과 2등분. 모바일은 DOM 순서대로 입력 → 결과 → 보조.
2. 결과가 입력보다 300px 이상 길면 below-input(비교표·가정 노트·관련 계산기 링크) 또는 결과 상세를 1×2 아래 전폭으로.
3. sticky는 컴포넌트가 창·내용 높이로 스스로 판정한다 — 뷰에서 켜지 않는다.
4. 반폭 칸(입력/결과/below-input) 안의 표·차트가 가로 스크롤로 잘리면 안 된다 — 넓은 표는 전폭 아래로 내린다.
