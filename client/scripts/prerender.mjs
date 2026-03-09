// 빌드 후 라우트별 SEO HTML 생성
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { SEO_ROUTES, CARD_ISSUERS } from "./seo-routes.mjs";

const DIST_DIR = resolve(import.meta.dirname, "../dist");
const INDEX_HTML = resolve(DIST_DIR, "index.html");
const SITE_URL = "https://car.shakilabs.com";

const ISSUER_LABELS = {
  hyundai: "현대카드",
  shinhan: "신한카드",
  kb: "KB국민카드",
  samsung: "삼성카드",
  lotte: "롯데카드",
  hana: "하나카드",
};

if (!existsSync(INDEX_HTML)) {
  console.warn("[prerender] dist/index.html not found. Skipping prerender.");
  process.exit(0);
}

const template = readFileSync(INDEX_HTML, "utf-8");

function escapeAttr(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function toSafeJson(value) {
  return JSON.stringify(value).replace(/<\/?script/gi, (matched) =>
    matched.replace("</", "<\\/")
  );
}

function buildBreadcrumb(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => {
      const entry = { "@type": "ListItem", position: i + 1, name: item.name };
      if (item.url) entry.item = item.url;
      return entry;
    }),
  };
}

function buildMeta(route) {
  // 카드사별 페이지
  const issuerMatch = route.match(/^\/fuel-card\/(hyundai|shinhan|kb|samsung|lotte|hana)$/);
  if (issuerMatch) {
    const issuer = issuerMatch[1];
    const label = ISSUER_LABELS[issuer] || issuer;
    const title = `${label} 주유 할인카드 비교 | Car Tools`;
    const description = `${label} 주유 할인카드를 비교합니다. 월 주유비 기준 연간 절약액과 실적 조건을 한눈에 확인하세요.`;
    const canonical = `${SITE_URL}/fuel-card/${issuer}`;
    return {
      title, description, canonical,
      jsonLd: { "@context": "https://schema.org", "@type": "WebPage", name: title, description, url: canonical, inLanguage: "ko" },
      breadcrumb: buildBreadcrumb([{ name: "홈", url: SITE_URL }, { name: "주유 할인카드", url: `${SITE_URL}/fuel-card` }, { name: label }]),
    };
  }

  // 유종별 페이지
  const fuelMatch = route.match(/^\/fuel-card\/(gasoline|diesel)$/);
  if (fuelMatch) {
    const fuelType = fuelMatch[1];
    const label = fuelType === "gasoline" ? "휘발유" : "경유";
    const title = `${label} 주유 할인카드 추천 | Car Tools`;
    const description = `${label} 주유 시 가장 유리한 할인카드를 비교합니다. 카드별 리터당 할인액과 연간 절약액을 확인하세요.`;
    const canonical = `${SITE_URL}/fuel-card/${fuelType}`;
    return {
      title, description, canonical,
      jsonLd: { "@context": "https://schema.org", "@type": "WebPage", name: title, description, url: canonical, inLanguage: "ko" },
      breadcrumb: buildBreadcrumb([{ name: "홈", url: SITE_URL }, { name: "주유 할인카드", url: `${SITE_URL}/fuel-card` }, { name: label }]),
    };
  }

  // 월 금액별 페이지
  const monthlyMatch = route.match(/^\/fuel-card\/monthly\/(\d+)$/);
  if (monthlyMatch) {
    const amount = Number.parseInt(monthlyMatch[1], 10);
    const manWon = Math.round(amount / 10000);
    const title = `월 ${manWon}만원 주유 시 추천 카드 | Car Tools`;
    const description = `월 주유비 ${manWon}만원 기준 가장 절약되는 주유 할인카드를 비교합니다.`;
    const canonical = `${SITE_URL}/fuel-card/monthly/${amount}`;
    return {
      title, description, canonical,
      jsonLd: {
        "@context": "https://schema.org", "@type": "FAQPage",
        mainEntity: [{
          "@type": "Question",
          name: `월 ${manWon}만원 주유하면 어떤 카드가 유리한가요?`,
          acceptedAnswer: { "@type": "Answer", text: "카드별 리터당 할인액, 월 할인 한도, 연회비를 종합 비교하여 최적 카드를 찾을 수 있습니다." },
        }],
      },
      breadcrumb: buildBreadcrumb([{ name: "홈", url: SITE_URL }, { name: "주유 할인카드", url: `${SITE_URL}/fuel-card` }, { name: `월 ${manWon}만원` }]),
    };
  }

  if (route === "/about") {
    const title = "서비스 안내 | Car Tools";
    const description = "주유 할인카드 비교 계산기. 내 주유 패턴에 맞는 최적 카드를 찾아보세요.";
    const canonical = `${SITE_URL}/about`;
    return {
      title, description, canonical,
      jsonLd: { "@context": "https://schema.org", "@type": "AboutPage", name: title, description, url: canonical, inLanguage: "ko" },
      breadcrumb: buildBreadcrumb([{ name: "홈", url: SITE_URL }, { name: "서비스 안내" }]),
    };
  }

  if (route === "/privacy") {
    const title = "개인정보 처리방침 | Car Tools";
    const description = "car.shakilabs.com 서비스의 개인정보 처리 원칙을 안내합니다.";
    const canonical = `${SITE_URL}/privacy`;
    return {
      title, description, canonical,
      jsonLd: { "@context": "https://schema.org", "@type": "WebPage", name: title, description, url: canonical, inLanguage: "ko" },
      breadcrumb: buildBreadcrumb([{ name: "홈", url: SITE_URL }, { name: "개인정보 처리방침" }]),
    };
  }

  // 메인 (fuel-card)
  const title = "주유 할인카드 비교 계산기 | 내 주유량에 맞는 최적 카드 찾기 2026";
  const description = "월 주유 금액만 입력하면 카드별 절약액을 즉시 비교합니다. 현대카드, 신한카드, KB국민, 삼성카드 주유 할인 한눈에.";
  const canonical = `${SITE_URL}/fuel-card`;
  return {
    title, description, canonical,
    jsonLd: [
      { "@context": "https://schema.org", "@type": "WebSite", name: "car.shakilabs.com", url: SITE_URL, description, inLanguage: "ko" },
      { "@context": "https://schema.org", "@type": "WebApplication", name: title, url: canonical, applicationCategory: "FinanceApplication", operatingSystem: "Any", inLanguage: "ko", offers: { "@type": "Offer", price: "0", priceCurrency: "KRW" } },
    ],
    breadcrumb: buildBreadcrumb([{ name: "홈", url: SITE_URL }, { name: "주유 할인카드 비교" }]),
  };
}

function buildPrerenderSection(route, meta) {
  return `
    <section data-seo-prerender style="max-width:920px;margin:0 auto;padding:20px 16px;line-height:1.6;">
      <h1 style="font-size:28px;line-height:1.3;margin:0 0 12px;">${meta.title.split(" | ")[0]}</h1>
      <p style="margin:0 0 10px;">${meta.description}</p>
      <p style="margin:0;"><a href="/fuel-card">주유 할인카드 비교 계산기 열기</a></p>
    </section>`;
}

function replaceTag(html, pattern, next) {
  if (pattern.test(html)) return html.replace(pattern, next);
  return html;
}

function applyMeta(html, route, meta) {
  const escapedTitle = escapeAttr(meta.title);
  const escapedDescription = escapeAttr(meta.description);
  const escapedCanonical = escapeAttr(meta.canonical);
  const escapedOgImage = escapeAttr(`${SITE_URL}/og-image.png`);

  let output = html;
  output = replaceTag(output, /<title>[\s\S]*?<\/title>/i, `<title>${escapedTitle}</title>`);
  output = replaceTag(output, /<meta name="description" content="[^"]*"\s*\/?>/i, `<meta name="description" content="${escapedDescription}" />`);
  output = replaceTag(output, /<link rel="canonical" href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${escapedCanonical}" />`);
  output = replaceTag(output, /<meta property="og:title" content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${escapedTitle}" />`);
  output = replaceTag(output, /<meta property="og:description" content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${escapedDescription}" />`);
  output = replaceTag(output, /<meta property="og:url" content="[^"]*"\s*\/?>/i, `<meta property="og:url" content="${escapedCanonical}" />`);
  output = replaceTag(output, /<meta property="og:image" content="[^"]*"\s*\/?>/i, `<meta property="og:image" content="${escapedOgImage}" />`);
  output = replaceTag(output, /<meta name="twitter:title" content="[^"]*"\s*\/?>/i, `<meta name="twitter:title" content="${escapedTitle}" />`);
  output = replaceTag(output, /<meta name="twitter:description" content="[^"]*"\s*\/?>/i, `<meta name="twitter:description" content="${escapedDescription}" />`);
  output = replaceTag(output, /<meta name="twitter:image" content="[^"]*"\s*\/?>/i, `<meta name="twitter:image" content="${escapedOgImage}" />`);

  // JSON-LD
  const jsonLdArray = [meta.jsonLd, meta.breadcrumb].flat().filter(Boolean);
  const jsonLdTag = `    <script type="application/ld+json" data-seo-prerender="jsonld">${toSafeJson(jsonLdArray)}</script>`;
  output = output.replace(/\n?\s*<script type="application\/ld\+json" data-seo-prerender="jsonld">[\s\S]*?<\/script>/i, "");
  output = output.replace("</head>", `${jsonLdTag}\n  </head>`);

  // Prerender section
  const prerenderSection = buildPrerenderSection(route, meta);
  output = output.replace(/\n?\s*<section data-seo-prerender[\s\S]*?<\/section>/i, "");
  if (output.includes('<div id="app"></div>')) {
    output = output.replace('<div id="app"></div>', `<div id="app"></div>${prerenderSection}`);
  } else {
    output = output.replace("</body>", `${prerenderSection}\n  </body>`);
  }

  return output;
}

for (const route of SEO_ROUTES) {
  const filePath = route === "/fuel-card"
    ? INDEX_HTML
    : resolve(DIST_DIR, route.slice(1), "index.html");
  const dir = dirname(filePath);

  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  const meta = buildMeta(route);
  const html = applyMeta(template, route, meta);
  writeFileSync(filePath, html, "utf-8");
  console.log(`[prerender] ${route} -> ${filePath}`);
}

console.log(`[prerender] Done. ${SEO_ROUTES.length} routes processed.`);
