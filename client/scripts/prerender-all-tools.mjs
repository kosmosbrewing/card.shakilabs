export function buildAllToolsMeta(siteUrl, buildBreadcrumb) {
  const title = "카드 계산기 전체 보기 | 목적별 카드 비교 도구";
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
