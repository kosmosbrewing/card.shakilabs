// 가이드 본문이 곧 페이지 본문인 라우트(정책·소개).
//
// 두 곳이 같은 목록을 알아야 한다.
//  - src/seo/guideRoutes.ts  : 수화 후 AppLayout이 .sh-container--prose(42rem)로 감싼다.
//  - scripts/prerender.mjs   : 첫 페인트(JS 없음)의 원시 HTML에 같은 래퍼를 싣는다.
// 두 목록이 어긋나면 첫 페인트 920px → 수화 후 672px로 본문이 한 번 좁아지는
// 레이아웃 시프트가 생긴다(2026-09 실측). guideRoutes.ts는 앱 초기 번들이 import하므로
// 무거운 prerender-content.mjs를 끌어오게 만들 수 없어, 상수만 이 얇은 모듈에 두고
// src/seo/guideRoutes.test.ts가 두 목록의 일치를 강제한다.
export const PROSE_SHELL_ROUTES = Object.freeze(["/about", "/terms", "/privacy"]);
