import { describe, expect, it } from "vitest";
// ?raw로 읽는다: scripts/는 .mjs라 타입이 없고, 여기서 필요한 것은 실행 결과가 아니라
// "같은 문장이 들어 있는가"뿐이다. (node:fs를 쓰면 @types/node 의존이 새로 생긴다)
import HUB_PRERENDER_SOURCE from "../../scripts/prerender-card-hub.mjs?raw";
import { CARD_HOME_ENTRIES, CARD_TOOL_GROUPS } from "./cardNavigation";

describe("card navigation", () => {
  it("groups every primary card tool exactly once", () => {
    const paths = CARD_TOOL_GROUPS.flatMap((group) => group.tools.map((tool) => tool.path));

    expect(paths).toHaveLength(10);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("points every home entry at a real tool route", () => {
    const paths = new Set(
      CARD_TOOL_GROUPS.flatMap((group) => group.tools.map((tool) => tool.path)),
    );
    const entryPaths = CARD_HOME_ENTRIES.map((entry) => entry.path);

    expect(entryPaths.length).toBeGreaterThan(0);
    expect(new Set(entryPaths).size).toBe(entryPaths.length);
    for (const path of entryPaths) {
      expect(paths.has(path)).toBe(true);
    }
  });

  // 허브(/all)는 하이드레이션 뒤에는 이 뷰가, 크롤러에게는 프리렌더 HTML이 보인다.
  // 둘 중 하나만 두꺼우면 얇은 페이지 문제가 그대로 남으므로 같은 문장을 강제한다.
  it("keeps every whenToUse sentence in sync with the prerendered hub", () => {
    const tools = CARD_TOOL_GROUPS.flatMap((group) => group.tools);

    for (const tool of tools) {
      expect(tool.whenToUse.length).toBeGreaterThan(60);
      expect(
        HUB_PRERENDER_SOURCE.includes(tool.whenToUse),
        `prerender-card-hub.mjs is missing the whenToUse copy for ${tool.path}`,
      ).toBe(true);
    }
  });

  // 허브가 다시 링크 목록으로 축소되는 것을 막는 하한선.
  // 페이지 전체의 1,500자 기준은 실제 산출물(dist/all/index.html)에서
  // scripts/validate-static-output.mjs가 검사한다 — 여기서는 뷰가 렌더하는
  // 안내 문구가 통째로 사라지지 않았는지만 본다.
  // 1,000자는 현재 값(1,055자)에 가깝게 잡은 회귀 방지선이다. 링크 라벨만 남으면
  // 이 값은 0에 수렴하므로, 도구 하나가 통째로 설명을 잃어도 여기서 걸린다.
  it("carries substantive per-tool guidance, not just link labels", () => {
    const guidanceChars = CARD_TOOL_GROUPS.flatMap((group) => group.tools).reduce(
      (total, tool) => total + tool.whenToUse.length,
      0,
    );

    expect(guidanceChars).toBeGreaterThan(1000);
  });
});
