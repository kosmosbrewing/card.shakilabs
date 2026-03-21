// 빌드 후 라우트별 SEO HTML 생성
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, resolve } from "path";
import { SEO_ROUTES } from "./seo-routes.mjs";

const DIST_DIR = resolve(import.meta.dirname, "../dist");
const INDEX_HTML = resolve(DIST_DIR, "index.html");
const SITE_URL = "https://shakilabs.com/card";

const ISSUER_LABELS = {
  hyundai: "현대카드",
  shinhan: "신한카드",
  kb: "KB국민카드",
  samsung: "삼성카드",
  lotte: "롯데카드",
  hana: "하나카드",
};

const OVERSEAS_LABELS = {
  usd: "미국 달러",
  eur: "유로",
  jpy: "일본 엔",
  gbp: "영국 파운드",
  cny: "중국 위안",
  thb: "태국 바트",
  vnd: "베트남 동",
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
    itemListElement: items.map((item, index) => {
      const entry = { "@type": "ListItem", position: index + 1, name: item.name };
      if (item.url) entry.item = item.url;
      return entry;
    }),
  };
}

function buildMeta(route) {
  const issuerMatch = route.match(/^\/fuel-card\/(hyundai|shinhan|kb|samsung|lotte|hana)$/);
  if (issuerMatch) {
    const issuer = issuerMatch[1];
    const label = ISSUER_LABELS[issuer] ?? issuer;
    const title = `${label} 주유 할인카드 비교 | 카드 계산기`;
    const description = `${label} 주유 할인카드를 비교합니다. 월 주유비 기준 연간 절약액과 실적 조건을 한눈에 확인하세요.`;
    const canonical = `${SITE_URL}/fuel-card/${issuer}`;

    return {
      title,
      description,
      canonical,
      appPath: "/fuel-card",
      jsonLd: { "@context": "https://schema.org", "@type": "WebPage", name: title, description, url: canonical, inLanguage: "ko" },
      breadcrumb: buildBreadcrumb([
        { name: "홈", url: SITE_URL },
        { name: "주유 할인카드", url: `${SITE_URL}/fuel-card` },
        { name: label },
      ]),
    };
  }

  const fuelMatch = route.match(/^\/fuel-card\/(gasoline|diesel)$/);
  if (fuelMatch) {
    const fuelType = fuelMatch[1];
    const label = fuelType === "gasoline" ? "휘발유" : "경유";
    const title = `${label} 주유 할인카드 추천 | 카드 계산기`;
    const description = `${label} 주유 시 가장 유리한 할인카드를 비교합니다. 카드별 리터당 할인액과 연간 절약액을 확인하세요.`;
    const canonical = `${SITE_URL}/fuel-card/${fuelType}`;

    return {
      title,
      description,
      canonical,
      appPath: "/fuel-card",
      jsonLd: { "@context": "https://schema.org", "@type": "WebPage", name: title, description, url: canonical, inLanguage: "ko" },
      breadcrumb: buildBreadcrumb([
        { name: "홈", url: SITE_URL },
        { name: "주유 할인카드", url: `${SITE_URL}/fuel-card` },
        { name: label },
      ]),
    };
  }

  const monthlyMatch = route.match(/^\/fuel-card\/monthly\/(\d+)$/);
  if (monthlyMatch) {
    const amount = Number.parseInt(monthlyMatch[1], 10);
    const manWon = Math.round(amount / 10000);
    const title = `월 ${manWon}만원 주유 시 추천 카드 | 카드 계산기`;
    const description = `월 주유비 ${manWon}만원 기준 가장 절약되는 주유 할인카드를 비교합니다.`;
    const canonical = `${SITE_URL}/fuel-card/monthly/${amount}`;

    return {
      title,
      description,
      canonical,
      appPath: "/fuel-card",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: `월 ${manWon}만원 주유하면 어떤 카드가 유리한가요?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: "카드별 리터당 할인액, 월 할인 한도, 연회비를 종합 비교하여 최적 카드를 찾을 수 있습니다.",
            },
          },
        ],
      },
      breadcrumb: buildBreadcrumb([
        { name: "홈", url: SITE_URL },
        { name: "주유 할인카드", url: `${SITE_URL}/fuel-card` },
        { name: `월 ${manWon}만원` },
      ]),
    };
  }

  const overseasMatch = route.match(/^\/overseas-payment\/(usd|eur|jpy|gbp|cny|thb|vnd)$/);
  if (overseasMatch) {
    const currency = overseasMatch[1];
    const label = OVERSEAS_LABELS[currency] ?? currency.toUpperCase();
    const title = `${label} 해외결제 카드 비교 | DCC 수수료 계산기`;
    const description = `${label} 결제 시 카드별 해외수수료, 캐시백, DCC 원화결제 손해를 비교합니다.`;
    const canonical = `${SITE_URL}/overseas-payment/${currency}`;

    return {
      title,
      description,
      canonical,
      appPath: "/overseas-payment",
      jsonLd: { "@context": "https://schema.org", "@type": "WebPage", name: title, description, url: canonical, inLanguage: "ko" },
      breadcrumb: buildBreadcrumb([
        { name: "홈", url: SITE_URL },
        { name: "해외결제 비교", url: `${SITE_URL}/overseas-payment` },
        { name: label },
      ]),
    };
  }

  if (route === "/overseas-payment") {
    const title = "해외결제 카드 비교 + DCC 수수료 계산기 | 카드 계산기";
    const description = "현지통화 결제와 DCC 원화결제를 비교하고, 카드별 해외수수료와 혜택을 한 번에 계산합니다.";
    const canonical = `${SITE_URL}/overseas-payment`;

    return {
      title,
      description,
      canonical,
      appPath: "/overseas-payment",
      jsonLd: [
        { "@context": "https://schema.org", "@type": "WebPage", name: title, description, url: canonical, inLanguage: "ko" },
        { "@context": "https://schema.org", "@type": "WebApplication", name: title, url: canonical, applicationCategory: "FinanceApplication", operatingSystem: "Any", inLanguage: "ko", offers: { "@type": "Offer", price: "0", priceCurrency: "KRW" } },
      ],
      breadcrumb: buildBreadcrumb([
        { name: "홈", url: SITE_URL },
        { name: "해외결제 비교" },
      ]),
    };
  }

  if (route === "/min-spend") {
    const title = "전월 실적 채우기 최소 비용 계산기 | 카드 계산기";
    const description = "내 월 지출 패턴을 기준으로 카드별 전월 실적 충족 여부와 추가 지출까지 반영한 순혜택을 계산합니다.";
    const canonical = `${SITE_URL}/min-spend`;

    return {
      title,
      description,
      canonical,
      appPath: "/min-spend",
      jsonLd: [
        { "@context": "https://schema.org", "@type": "WebPage", name: title, description, url: canonical, inLanguage: "ko" },
        { "@context": "https://schema.org", "@type": "WebApplication", name: title, url: canonical, applicationCategory: "FinanceApplication", operatingSystem: "Any", inLanguage: "ko", offers: { "@type": "Offer", price: "0", priceCurrency: "KRW" } },
      ],
      breadcrumb: buildBreadcrumb([
        { name: "홈", url: SITE_URL },
        { name: "실적 채우기 계산기" },
      ]),
    };
  }

  if (route === "/annual-fee") {
    const title = "연회비 회수 계산기 | 카드 혜택 vs 연회비 손익분석 2026";
    const description = "월 소비 패턴을 기준으로 카드별 연회비 회수 기간, 연 순혜택, ROI를 비교하는 계산기입니다.";
    const canonical = `${SITE_URL}/annual-fee`;

    return {
      title,
      description,
      canonical,
      appPath: "/annual-fee",
      jsonLd: [
        { "@context": "https://schema.org", "@type": "WebPage", name: title, description, url: canonical, inLanguage: "ko" },
        { "@context": "https://schema.org", "@type": "WebApplication", name: title, url: canonical, applicationCategory: "FinanceApplication", operatingSystem: "Any", inLanguage: "ko", offers: { "@type": "Offer", price: "0", priceCurrency: "KRW" } },
      ],
      breadcrumb: buildBreadcrumb([
        { name: "홈", url: SITE_URL },
        { name: "연회비 회수 계산기" },
      ]),
    };
  }

  if (route === "/duty-free") {
    const title = "면세 한도 초과 관세 계산기 | 해외쇼핑 관세·부가세 자동 계산 2026";
    const description = "구매 금액과 물품 카테고리를 입력하면 800달러 초과분에 대한 예상 관세와 부가세를 계산합니다.";
    const canonical = `${SITE_URL}/duty-free`;

    return {
      title,
      description,
      canonical,
      appPath: "/duty-free",
      jsonLd: [
        { "@context": "https://schema.org", "@type": "WebPage", name: title, description, url: canonical, inLanguage: "ko" },
        { "@context": "https://schema.org", "@type": "WebApplication", name: title, url: canonical, applicationCategory: "FinanceApplication", operatingSystem: "Any", inLanguage: "ko", offers: { "@type": "Offer", price: "0", priceCurrency: "KRW" } },
      ],
      breadcrumb: buildBreadcrumb([
        { name: "홈", url: SITE_URL },
        { name: "관세 계산기" },
      ]),
    };
  }

  if (route === "/mileage") {
    const title = "마일리지 가치 계산기 | 1마일 원화 가치 · 좌석등급별 가성비 비교 2026";
    const description = "항공사별 마일리지 사용처를 비교해 1마일당 원화 가치와 최적 노선을 계산합니다.";
    const canonical = `${SITE_URL}/mileage`;

    return {
      title,
      description,
      canonical,
      appPath: "/mileage",
      jsonLd: [
        { "@context": "https://schema.org", "@type": "WebPage", name: title, description, url: canonical, inLanguage: "ko" },
        { "@context": "https://schema.org", "@type": "WebApplication", name: title, url: canonical, applicationCategory: "FinanceApplication", operatingSystem: "Any", inLanguage: "ko", offers: { "@type": "Offer", price: "0", priceCurrency: "KRW" } },
      ],
      breadcrumb: buildBreadcrumb([
        { name: "홈", url: SITE_URL },
        { name: "마일리지 가치 계산기" },
      ]),
    };
  }

  if (route === "/credit-vs-debit") {
    const title = "신용카드 vs 체크카드 비교 | 연회비까지 반영한 실속 계산";
    const description = "월 카드 사용액과 연회비를 기준으로 신용카드와 체크카드 중 어떤 쪽이 더 실속인지 계산합니다.";
    const canonical = `${SITE_URL}/credit-vs-debit`;

    return {
      title,
      description,
      canonical,
      appPath: "/credit-vs-debit",
      jsonLd: [
        { "@context": "https://schema.org", "@type": "WebPage", name: title, description, url: canonical, inLanguage: "ko" },
        { "@context": "https://schema.org", "@type": "WebApplication", name: title, url: canonical, applicationCategory: "FinanceApplication", operatingSystem: "Any", inLanguage: "ko", offers: { "@type": "Offer", price: "0", priceCurrency: "KRW" } },
      ],
      breadcrumb: buildBreadcrumb([
        { name: "홈", url: SITE_URL },
        { name: "신용카드 vs 체크카드" },
      ]),
    };
  }

  if (route === "/point-convert") {
    const title = "포인트 전환 비교 | 항공·호텔·현금성 포인트 가치 계산";
    const description = "보유 포인트를 어디로 넘겨야 가치가 큰지 예상 환산가치 기준으로 비교합니다.";
    const canonical = `${SITE_URL}/point-convert`;

    return {
      title,
      description,
      canonical,
      appPath: "/point-convert",
      jsonLd: [
        { "@context": "https://schema.org", "@type": "WebPage", name: title, description, url: canonical, inLanguage: "ko" },
        { "@context": "https://schema.org", "@type": "WebApplication", name: title, url: canonical, applicationCategory: "FinanceApplication", operatingSystem: "Any", inLanguage: "ko", offers: { "@type": "Offer", price: "0", priceCurrency: "KRW" } },
      ],
      breadcrumb: buildBreadcrumb([
        { name: "홈", url: SITE_URL },
        { name: "포인트 전환 비교" },
      ]),
    };
  }

  if (route === "/billing-cycle") {
    const title = "결제일별 이용기간 계산기 | 카드 결제일에 따른 최대 유예일";
    const description = "카드 결제일과 사용일을 기준으로 실제 결제까지 남는 이용 가능 기간을 계산합니다.";
    const canonical = `${SITE_URL}/billing-cycle`;

    return {
      title,
      description,
      canonical,
      appPath: "/billing-cycle",
      jsonLd: [
        { "@context": "https://schema.org", "@type": "WebPage", name: title, description, url: canonical, inLanguage: "ko" },
        { "@context": "https://schema.org", "@type": "WebApplication", name: title, url: canonical, applicationCategory: "FinanceApplication", operatingSystem: "Any", inLanguage: "ko", offers: { "@type": "Offer", price: "0", priceCurrency: "KRW" } },
      ],
      breadcrumb: buildBreadcrumb([
        { name: "홈", url: SITE_URL },
        { name: "결제일별 이용기간" },
      ]),
    };
  }

  if (route === "/customs") {
    const title = "해외직구 관세 계산기 | 상품가+배송비 기준 예상 세금";
    const description = "해외직구 상품가와 배송비를 입력하면 품목별 예상 관부가세를 계산합니다.";
    const canonical = `${SITE_URL}/customs`;

    return {
      title,
      description,
      canonical,
      appPath: "/customs",
      jsonLd: [
        { "@context": "https://schema.org", "@type": "WebPage", name: title, description, url: canonical, inLanguage: "ko" },
        { "@context": "https://schema.org", "@type": "WebApplication", name: title, url: canonical, applicationCategory: "FinanceApplication", operatingSystem: "Any", inLanguage: "ko", offers: { "@type": "Offer", price: "0", priceCurrency: "KRW" } },
      ],
      breadcrumb: buildBreadcrumb([
        { name: "홈", url: SITE_URL },
        { name: "해외직구 관세 계산기" },
      ]),
    };
  }

  if (route === "/about") {
    const title = "서비스 안내 | 카드 계산기";
    const description = "주유 할인카드와 해외결제 카드를 비교해 실질 비용을 계산하는 도구입니다.";
    const canonical = `${SITE_URL}/about`;

    return {
      title,
      description,
      canonical,
      appPath: "/fuel-card",
      jsonLd: { "@context": "https://schema.org", "@type": "AboutPage", name: title, description, url: canonical, inLanguage: "ko" },
      breadcrumb: buildBreadcrumb([
        { name: "홈", url: SITE_URL },
        { name: "서비스 안내" },
      ]),
    };
  }

  if (route === "/privacy") {
    const title = "개인정보 처리방침 | 카드 계산기";
    const description = "shakilabs.com/card 개인정보 처리방침 안내 페이지입니다.";
    const canonical = `${SITE_URL}/privacy`;

    return {
      title,
      description,
      canonical,
      appPath: "/fuel-card",
      jsonLd: { "@context": "https://schema.org", "@type": "WebPage", name: title, description, url: canonical, inLanguage: "ko" },
      breadcrumb: buildBreadcrumb([
        { name: "홈", url: SITE_URL },
        { name: "개인정보 처리방침" },
      ]),
    };
  }

  const title = "주유 할인카드 비교 계산기 | 내 주유량에 맞는 최적 카드 찾기 2026";
  const description = "월 주유 금액만 입력하면 카드별 절약액을 즉시 비교합니다. 현대카드, 신한카드, KB국민, 삼성카드 주유 할인 한눈에.";
  const canonical = `${SITE_URL}/fuel-card`;

  return {
    title,
    description,
    canonical,
    appPath: "/fuel-card",
    jsonLd: [
      { "@context": "https://schema.org", "@type": "WebSite", name: "shakilabs.com/card", url: SITE_URL, description, inLanguage: "ko" },
      { "@context": "https://schema.org", "@type": "WebApplication", name: title, url: canonical, applicationCategory: "FinanceApplication", operatingSystem: "Any", inLanguage: "ko", offers: { "@type": "Offer", price: "0", priceCurrency: "KRW" } },
    ],
    breadcrumb: buildBreadcrumb([
      { name: "홈", url: SITE_URL },
      { name: "주유 할인카드 비교" },
    ]),
  };
}

function buildPrerenderSection(meta) {
  return `
    <section data-seo-prerender style="max-width:920px;margin:0 auto;padding:20px 16px;line-height:1.6;">
      <h1 style="font-size:28px;line-height:1.3;margin:0 0 12px;">${meta.title.split(" | ")[0]}</h1>
      <p style="margin:0 0 10px;">${meta.description}</p>
      <p style="margin:0;"><a href="/card${meta.appPath}">계산기 열기</a></p>
    </section>`;
}

function replaceTag(html, pattern, next) {
  if (pattern.test(html)) return html.replace(pattern, next);
  return html;
}

function applyMeta(html, meta) {
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

  const jsonLdArray = [meta.jsonLd, meta.breadcrumb].flat().filter(Boolean);
  const jsonLdTag = `    <script type="application/ld+json" data-seo-prerender="jsonld">${toSafeJson(jsonLdArray)}</script>`;
  output = output.replace(/\n?\s*<script type="application\/ld\+json" data-seo-prerender="jsonld">[\s\S]*?<\/script>/i, "");
  output = output.replace("</head>", `${jsonLdTag}\n  </head>`);

  const prerenderSection = buildPrerenderSection(meta);
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
  const html = applyMeta(template, meta);
  writeFileSync(filePath, html, "utf-8");
  console.log(`[prerender] ${route} -> ${filePath}`);
}

console.log(`[prerender] Done. ${SEO_ROUTES.length} routes processed.`);
