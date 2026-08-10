import { describe, expect, it, vi } from "vitest";
import { removePrerenderChrome, removePrerenderContent } from "./prerenderFallback";

function fakeRoot(tagNames: string[]) {
  const blocks = tagNames.map((tagName) => ({ tagName, remove: vi.fn() }));
  const root = {
    querySelectorAll: vi.fn(() => blocks),
  } as unknown as ParentNode;
  return { root, blocks };
}

describe("prerender fallback cleanup", () => {
  it("removes only chrome blocks when clearing chrome", () => {
    const { root, blocks } = fakeRoot(["HEADER", "ARTICLE", "FOOTER", "NAV"]);

    expect(removePrerenderChrome(root)).toBe(3);
    expect(root.querySelectorAll).toHaveBeenCalledWith("body > [data-seo-prerender]");
    expect(blocks[0].remove).toHaveBeenCalledOnce();
    expect(blocks[2].remove).toHaveBeenCalledOnce();
    expect(blocks[3].remove).toHaveBeenCalledOnce();
    // 본문은 대체 렌더가 끝난 뒤에만 지운다 — chrome 정리에 휩쓸리면 안 된다.
    expect(blocks[1].remove).not.toHaveBeenCalled();
  });

  it("removes only content blocks when clearing content", () => {
    const { root, blocks } = fakeRoot(["HEADER", "ARTICLE", "SECTION", "FOOTER"]);

    expect(removePrerenderContent(root)).toBe(2);
    expect(blocks[1].remove).toHaveBeenCalledOnce();
    expect(blocks[2].remove).toHaveBeenCalledOnce();
    expect(blocks[0].remove).not.toHaveBeenCalled();
    expect(blocks[3].remove).not.toHaveBeenCalled();
  });
});
