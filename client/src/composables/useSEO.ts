import { useHead } from "@unhead/vue";
import { toValue, type MaybeRefOrGetter } from "vue";
import { buildCanonicalUrl, normalizeCanonicalUrl } from "@/utils/canonicalUrl";
import { buildJsonLdScripts, collectJsonLdTypes } from "@/utils/jsonLd";
import { normalizeTitle } from "../../scripts/seo-meta.mjs";

// Snapshot taken at module evaluation time, which runs before the app mounts and
// therefore before unhead writes any tag. So this only ever sees the JSON-LD that
// index.html and the prerender step baked into the served HTML.
const PRERENDERED_JSONLD_TYPES: ReadonlySet<string> =
  typeof document === "undefined"
    ? new Set<string>()
    : collectJsonLdTypes(document);

// 제목 레시피는 scripts/seo-meta.mjs 한 곳에만 있다 — 프리렌더(scripts/prerender.mjs)도 같은
// 함수를 import해서, 원시 HTML의 <title>과 하이드레이션 뒤 useHead가 쓰는 <title>이 같다.
// 라우터(beforeEach)가 이 모듈에서 normalizeTitle을 가져가므로 여기서 다시 내보낸다.
export { normalizeTitle };

type SEOOptions = {
  title: MaybeRefOrGetter<string>;
  description: MaybeRefOrGetter<string>;
  ogImage?: MaybeRefOrGetter<string | undefined>;
  noindex?: MaybeRefOrGetter<boolean | undefined>;
  jsonLd?: MaybeRefOrGetter<
    Record<string, unknown> | Record<string, unknown>[] | undefined
  >;
  /**
   * canonical / og:url이 가리킬 앱 상대 경로를 강제한다.
   * 변종 라우트(/fuel-card/hyundai 등)는 대표 페이지 경로("/fuel-card")를 넘긴다 —
   * 프리렌더 HTML이 이미 대표 URL로 canonical을 박아두므로, 하이드레이션 뒤
   * unhead가 현재 주소로 덮어써서 신호가 뒤집히는 것을 막는다.
   * noindex가 아니라 canonical 통합인 이유: 랭킹 신호를 대표 페이지로 합치기 위해서다.
   */
  canonicalPath?: MaybeRefOrGetter<string | undefined>;
};

export function useSEO({
  title,
  description,
  ogImage,
  noindex = false,
  jsonLd,
  canonicalPath,
}: SEOOptions): void {
  useHead(() => {
    const resolvedTitle = normalizeTitle(toValue(title));
    const resolvedDescription = toValue(description);
    const resolvedNoindex = Boolean(toValue(noindex));
    const resolvedOgImage = toValue(ogImage);
    const resolvedJsonLd = toValue(jsonLd);
    const resolvedJsonLdArray = Array.isArray(resolvedJsonLd)
      ? resolvedJsonLd.filter(
          (entry): entry is Record<string, unknown> =>
            Boolean(entry) && typeof entry === "object"
        )
      : resolvedJsonLd && typeof resolvedJsonLd === "object"
        ? [resolvedJsonLd]
        : [];
    // canonical과 og:url은 항상 같은 값에서 나온다 (통합 경로 우선, 없으면 현재 주소).
    const resolvedCanonicalPath = toValue(canonicalPath);
    const currentUrl =
      typeof window === "undefined"
        ? undefined
        : resolvedCanonicalPath
          ? buildCanonicalUrl(
              resolvedCanonicalPath,
              window.location.origin,
              import.meta.env.BASE_URL,
            )
          : normalizeCanonicalUrl(window.location.href);

    return {
      title: resolvedTitle,
      link: currentUrl ? [{ rel: "canonical", href: currentUrl }] : [],
      meta: [
        { name: "description", content: resolvedDescription },
        { property: "og:title", content: resolvedTitle },
        { property: "og:description", content: resolvedDescription },
        { name: "twitter:title", content: resolvedTitle },
        { name: "twitter:description", content: resolvedDescription },
        ...(currentUrl ? [{ property: "og:url", content: currentUrl }] : []),
        ...(resolvedNoindex ? [{ name: "robots", content: "noindex,nofollow" }] : []),
        ...(resolvedOgImage
          ? [
              { property: "og:image", content: resolvedOgImage },
              { name: "twitter:image", content: resolvedOgImage },
            ]
          : []),
      ],
      script: buildJsonLdScripts(resolvedJsonLdArray, PRERENDERED_JSONLD_TYPES),
    };
  });
}
