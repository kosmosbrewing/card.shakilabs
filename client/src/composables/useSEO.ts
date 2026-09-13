import { useHead } from "@unhead/vue";
import { toValue, type MaybeRefOrGetter } from "vue";
import { buildCanonicalUrl, normalizeCanonicalUrl } from "@/utils/canonicalUrl";
import { buildJsonLdScripts, collectJsonLdTypes } from "@/utils/jsonLd";

// Snapshot taken at module evaluation time, which runs before the app mounts and
// therefore before unhead writes any tag. So this only ever sees the JSON-LD that
// index.html and the prerender step baked into the served HTML.
const PRERENDERED_JSONLD_TYPES: ReadonlySet<string> =
  typeof document === "undefined"
    ? new Set<string>()
    : collectJsonLdTypes(document);

// 정본 규칙(디자인 시스템 §11.1): "{페이지} | {카테고리} | ShakiLabs".
const CATEGORY = "카드 계산기";
const TITLE_SUFFIX = ` | ${CATEGORY} | ShakiLabs`;
const DEFAULT_TITLE = CATEGORY;
const LEGACY_TITLE_SUFFIXES = [
  TITLE_SUFFIX,
  " | Car Tools 2026",
  " | Car Tools",
  ` | ${CATEGORY}`,
  " | ShakiLabs",
] as const;

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

// 뷰가 넘기는 title에 이미 "|"가 들어있어도(서브타이틀 병기) 배지를 건너뛰지
// 않는다 — 예전에는 pipe 유무로 두 레시피가 섞였다(카테고리 배지 있음/없음).
// 항상 한 레시피만 적용해 배지 유무가 페이지마다 갈리지 않게 한다.
export function normalizeTitle(rawTitle: string): string {
  const trimmed = rawTitle.trim();
  let baseTitle = trimmed || DEFAULT_TITLE;

  for (const suffix of LEGACY_TITLE_SUFFIXES) {
    if (baseTitle.endsWith(suffix)) {
      baseTitle = baseTitle.slice(0, -suffix.length).trimEnd();
      break;
    }
  }

  if (!baseTitle) {
    baseTitle = DEFAULT_TITLE;
  }

  // v3 §11.1의 레시피는 `{페이지} | {카테고리} | ShakiLabs` 3단이다.
  // 페이지 이름이 자체 부제를 pipe로 달고 있으면 4단이 되어 어디까지가 페이지명인지
  // 읽히지 않는다. 부제는 검색 키워드를 담고 있으므로 버리지 않고 구분자만 중점으로 바꾼다.
  baseTitle = baseTitle.replace(/\s*\|\s*/g, " · ");

  // 카테고리 없는 루트 예외(§11.1): 페이지 이름이 이미 카테고리로 시작하면
  // ("카드 계산기 | ...") 배지를 또 붙이지 않고 ShakiLabs만 덧붙인다.
  if (baseTitle.startsWith(CATEGORY)) {
    return `${baseTitle} | ShakiLabs`;
  }

  return `${baseTitle}${TITLE_SUFFIX}`;
}

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
