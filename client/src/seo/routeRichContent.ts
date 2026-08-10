// 프리렌더 가이드 본문을 앱 화면에서도 렌더하기 위한 다리.
//
// 단일 출처: 정적 HTML을 만드는 scripts/prerender-*.mjs를 그대로 import한다.
// 문구를 이쪽에 복사하면 언젠가 어긋나고, 어긋난 순간 다시 "크롤러만 보는 텍스트"가 된다.
// (scripts/는 순수 ESM이라 Node 빌드 스크립트와 Vite 번들 양쪽에서 그대로 쓸 수 있다.
//  prerender-layout.mjs만 node:fs를 쓰므로 여기서 import하지 않는다.)
import { buildRichContent } from "../../scripts/prerender-content.mjs";
import { buildHomeExtraContent } from "../../scripts/prerender-home.mjs";
import { guidePlacementFor, hasInAppGuide } from "./guideRoutes";

export { guidePlacementFor, hasInAppGuide };

// 계산기 라우트는 화면에 이미 자체 h1(계산기 이름)이 있다. 가이드 제목까지 h1로 두면
// 한 페이지에 h1이 둘이 된다. 텍스트는 그대로 두고 태그만 낮춘다(자수 변화 없음).
function demoteHeading(html: string): string {
  return html.replace(/<h1(\s[^>]*)?>/i, "<h2$1>").replace(/<\/h1>/i, "</h2>");
}

/**
 * 라우트에 대응하는 가이드 본문 HTML. 가이드를 넣지 않는 라우트는 빈 문자열.
 *
 * 반환값은 빌드 타임 상수에서만 나온다 — 경로는 고정 목록·고정 정규식으로만 매칭하고
 * 사용자 입력이 문자열에 섞이는 경로가 없다. (v-html 사용 근거)
 */
export function richContentFor(path: string): string {
  const placement = guidePlacementFor(path);
  if (placement === "none") return "";

  // 홈은 화면이 히어로·상황표·3단계를 이미 렌더한다. 나머지 블록만 덧붙인다.
  if (path === "/") return buildHomeExtraContent();

  const html = buildRichContent(path);
  if (!html) return "";
  // 정책·소개 페이지는 가이드 본문이 곧 페이지 본문이라 h1을 유지한다.
  return placement === "before" ? html : demoteHeading(html);
}
