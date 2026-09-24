// 가이드 본문이 곧 페이지 본문인 라우트(정책·소개) — 가이드가 뷰보다 **위**에 온다.
//
// src/seo/guideRoutes.ts가 이 순서로 배치하고, src/seo/guideRoutes.test.ts가 두 목록의 일치를 강제한다.
// 폭은 이 목록과 무관하다: 0.3.35부터 프리렌더 첫 페인트(scripts/prerender.mjs)와 수화 후(AppLayout)
// 모두 전 라우트의 가이드를 같은 .sh-container--prose(프레임 + 글줄 42rem)로 감싼다.
// guideRoutes.ts는 앱 초기 번들이 import하므로 무거운 prerender-content.mjs를 끌어오게 만들 수 없어,
// 상수만 이 얇은 모듈에 둔다.
export const PROSE_SHELL_ROUTES = Object.freeze(["/about", "/terms", "/privacy"]);
