// body 직계에 실린 프리렌더 블록을 정리한다.
//
// 블록은 두 종류이고, 지우는 시점이 다르다.
//  - chrome (header/footer/nav): Vue가 항상 같은 내비게이션을 다시 그린다 → 마운트 즉시 제거.
//  - content (article/section):  그 페이지의 본문이다 → 화면에 다시 그린 쪽이 직접 제거.
//
// 원래는 둘을 구분하지 않고 "body > [data-seo-prerender]"를 전부 지웠다. 프리렌더가
// Vue 출력의 사본이던 시절에는 맞는 코드였지만, 프리렌더에만 있는 가이드 본문이
// 들어온 뒤로는 같은 코드가 "크롤러만 보이고 사람은 못 보는 텍스트"를 만들었다.
// 그래서 content 제거는 대체 렌더를 책임지는 쪽(SeoRichContent / main.ts)만 호출한다.
const SELECTOR = "body > [data-seo-prerender]";
const CHROME_TAGS = new Set(["HEADER", "FOOTER", "NAV"]);

function blocksIn(root: ParentNode): Element[] {
  return Array.from(root.querySelectorAll(SELECTOR));
}

function removeAll(blocks: Element[]): number {
  blocks.forEach((block) => block.remove());
  return blocks.length;
}

/** 공유 헤더·푸터·내비 프리렌더 블록을 제거한다(Vue가 동일한 내비를 렌더한다). */
export function removePrerenderChrome(root: ParentNode = document): number {
  return removeAll(blocksIn(root).filter((block) => CHROME_TAGS.has(block.tagName)));
}

/**
 * 본문 프리렌더 블록을 제거한다.
 * 호출 전에 같은 내용이 화면에 렌더되어 있어야 한다 — 그렇지 않으면 사람에게만
 * 본문이 사라지는 은닉 텍스트 상태가 된다.
 */
export function removePrerenderContent(root: ParentNode = document): number {
  return removeAll(blocksIn(root).filter((block) => !CHROME_TAGS.has(block.tagName)));
}
