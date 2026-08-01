// vue-router의 base("/card/") 정규화 때문에 /card 로 들어와도 주소가 /card/ 로 바뀐다.
// vercel.json은 trailingSlash:false 이므로, 정적 프리렌더·사이트맵과 같은 형태(끝 슬래시 없음)로 맞춘다.
export function normalizeCanonicalUrl(href: string): string {
  try {
    const url = new URL(href);
    url.search = "";
    url.hash = "";
    if (url.pathname.length > 1 && url.pathname.endsWith("/")) {
      url.pathname = url.pathname.replace(/\/+$/, "");
    }
    return url.toString();
  } catch {
    const withoutQuery = href.split("#")[0].split("?")[0];
    return withoutQuery.length > 1 && withoutQuery.endsWith("/")
      ? withoutQuery.replace(/\/+$/, "")
      : withoutQuery;
  }
}
