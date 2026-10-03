import { pageTitleFor } from "./seo-meta.mjs";

export function buildAllToolsMeta(siteUrl, buildBreadcrumb) {
  // 허브 제목은 seo-meta.mjs가 단일 출처다(CardToolsView.vue도 같은 값을 쓴다).
  const title = pageTitleFor("/all");
  const description = "혜택·고정지출, 해외·여행 결제, 포인트·결제 관리 목적별 카드 계산기를 한곳에서 찾으세요.";
  const canonical = `${siteUrl}/all`;

  return {
    title,
    description,
    canonical,
    appPath: "/all",
    jsonLd: { "@context": "https://schema.org", "@type": "CollectionPage", name: title, description, url: canonical, inLanguage: "ko" },
    breadcrumb: buildBreadcrumb([
      { name: "홈", url: siteUrl },
      { name: "카드 계산기 전체 보기" },
    ]),
  };
}
