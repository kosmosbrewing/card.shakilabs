// Card 프리렌더 공통 레이아웃 (header + footer)
// 모든 프리렌더 페이지에 정적으로 주입되어 크롤러의 사이트 항해 신호 확보
//
// 색상은 리터럴 hex가 아니라 테마 토큰(hsl(var(--...)))을 쓴다. prerender-content.mjs와
// 같은 규칙이다. 하드코딩된 밝은색 계열은 다크 모드에서 배경과 같은 톤이 되어 글이 안 보인다.
// 이 블록은 마운트 직후 제거되지만 그 전까지는 사람이 보는 화면이다.

import { readFileSync } from "node:fs";

// 공유 카탈로그 단일 출처 — Vue 푸터와 같은 목록을 정적 HTML에도 심는다(JS 없이도 크롤 경로 확보)
const SERVICE_CATALOG = JSON.parse(
  readFileSync(
    new URL("../node_modules/@shakilabs/ui/dist/services.json", import.meta.url),
    "utf8",
  ),
);
const CURRENT_APP = "card";

function buildOtherServicesBlock() {
  const rows = SERVICE_CATALOG.categories
    .map((category) => {
      const items = SERVICE_CATALOG.services.filter(
        (service) => service.categoryId === category.id && service.app !== CURRENT_APP,
      );
      if (!items.length) return "";
      const links = items
        .map(
          (service) =>
            `<a href="${service.href}" style="color:hsl(var(--muted-foreground));text-decoration:none;margin-right:12px;">${service.shortLabel}</a>`,
        )
        .join("");
      return `<p style="margin:0 0 4px;"><span style="display:inline-block;min-width:78px;color:hsl(var(--muted-foreground));">${category.label}</span>${links}</p>`;
    })
    .filter(Boolean)
    .join("");
  return `<nav aria-label="다른 서비스" style="margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid hsl(var(--border));font-size:12px;line-height:2;">
        <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:hsl(var(--muted-foreground));">다른 서비스</p>
        ${rows}
      </nav>`;
}

export function buildPrerenderHeader() {
  return `
    <header data-seo-prerender="header" style="max-width:1120px;margin:0 auto;padding:14px 16px;border-bottom:1px solid hsl(var(--border));">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;">
        <a href="/card/fuel-card" style="font-weight:700;font-size:18px;color:hsl(var(--foreground));text-decoration:none;">ShakiLabs 카드 계산기</a>
        <nav aria-label="주요 메뉴" style="display:flex;gap:16px;flex-wrap:wrap;font-size:14px;">
          <a href="/card/fuel-card" style="color:hsl(var(--muted-foreground));text-decoration:none;">주유 할인카드</a>
          <a href="/card/overseas-payment" style="color:hsl(var(--muted-foreground));text-decoration:none;">해외결제</a>
          <a href="/card/annual-fee" style="color:hsl(var(--muted-foreground));text-decoration:none;">연회비</a>
          <a href="/card/mileage" style="color:hsl(var(--muted-foreground));text-decoration:none;">마일리지</a>
          <a href="/card/about" style="color:hsl(var(--muted-foreground));text-decoration:none;">서비스 소개</a>
        </nav>
      </div>
    </header>`;
}

const CATEGORIES = {
  "주유 할인": [
    { href: "/card/fuel-card", label: "주유 할인카드 비교" },
    { href: "/card/fuel-card/hyundai", label: "현대카드 주유" },
    { href: "/card/fuel-card/shinhan", label: "신한카드 주유" },
    { href: "/card/fuel-card/kb", label: "KB국민카드 주유" },
    { href: "/card/fuel-card/samsung", label: "삼성카드 주유" },
    { href: "/card/fuel-card/gasoline", label: "휘발유 카드" },
    { href: "/card/fuel-card/diesel", label: "경유 카드" },
  ],
  "해외 결제": [
    { href: "/card/overseas-payment", label: "해외결제 수수료 비교" },
    { href: "/card/overseas-payment/usd", label: "미국 달러(USD)" },
    { href: "/card/overseas-payment/eur", label: "유로(EUR)" },
    { href: "/card/overseas-payment/jpy", label: "일본 엔(JPY)" },
    { href: "/card/overseas-payment/gbp", label: "영국 파운드(GBP)" },
    { href: "/card/overseas-payment/cny", label: "중국 위안(CNY)" },
    { href: "/card/overseas-payment/thb", label: "태국 바트(THB)" },
    { href: "/card/overseas-payment/vnd", label: "베트남 동(VND)" },
  ],
  "혜택 비교": [
    { href: "/card/annual-fee", label: "연회비 비교" },
    { href: "/card/mileage", label: "항공 마일리지 카드" },
    { href: "/card/duty-free", label: "면세점 할인" },
    { href: "/card/min-spend", label: "최소 실적 조건" },
    { href: "/card/credit-vs-debit", label: "신용 vs 체크카드" },
    { href: "/card/point-convert", label: "포인트 전환" },
    { href: "/card/billing-cycle", label: "결제일 가이드" },
    { href: "/card/customs", label: "해외직구 관세" },
  ],
};

export function buildPrerenderFooter() {
  const blocks = Object.entries(CATEGORIES)
    .map(([category, items]) => {
      const links = items
        .map(
          (item) =>
            `<li style="margin-bottom:4px;"><a href="${item.href}" style="color:hsl(var(--muted-foreground));text-decoration:none;font-size:13px;">${item.label}</a></li>`
        )
        .join("");
      return `
      <div>
        <h3 style="font-size:13px;font-weight:700;color:hsl(var(--muted-foreground));margin:0 0 8px;">${category}</h3>
        <ul style="list-style:none;padding:0;margin:0;">${links}</ul>
      </div>`;
    })
    .join("");

  return `
    <footer data-seo-prerender="footer" style="max-width:1120px;margin:40px auto 0;padding:24px 16px;border-top:1px solid hsl(var(--border));background:hsl(var(--muted));">
      <nav aria-label="카드 계산기 전체" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:20px;margin-bottom:20px;">
        ${blocks}
      </nav>
      ${buildOtherServicesBlock()}
      <div style="padding-top:16px;border-top:1px solid hsl(var(--border));font-size:12px;color:hsl(var(--muted-foreground));line-height:1.8;">
        <p style="margin:0 0 6px;">운영 <strong>Shakilabs</strong> · 문의 <a href="mailto:skdba1313@gmail.com" style="color:hsl(var(--muted-foreground));">skdba1313@gmail.com</a></p>
        <p style="margin:0 0 6px;">
          <a href="/card/about" style="color:hsl(var(--muted-foreground));margin-right:12px;">서비스 소개</a>
          <a href="/card/privacy" style="color:hsl(var(--muted-foreground));margin-right:12px;">개인정보처리방침</a>
          <a href="/card/terms" style="color:hsl(var(--muted-foreground));margin-right:12px;">이용약관</a>
          <!-- 블로그는 root 앱 소유(shakilabs.com/blog). JS 없는 크롤러에게도 도달 경로를 주려면
               Vue 푸터뿐 아니라 이 정적 푸터에도 같은 절대경로가 있어야 한다. -->
          <a href="/blog" style="color:hsl(var(--muted-foreground));">블로그</a>
        </p>
        <p style="margin:0;">
          본 서비스의 카드 정보는 각 카드사 공식 페이지에서 확인 가능한 공개 데이터를 기반으로 합니다.
          혜택·한도·수수료는 카드사의 정책 변경에 따라 달라질 수 있으며, 최종 가입·이용 조건은 반드시 해당 카드사 공식 페이지에서 확인하시기 바랍니다.
          본 서비스는 금융 상품 판매·중개 서비스가 아닙니다.
        </p>
      </div>
    </footer>`;
}
