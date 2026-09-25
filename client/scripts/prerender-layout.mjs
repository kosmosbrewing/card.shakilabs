// Card 프리렌더 공통 레이아웃 (header + footer)
// 모든 프리렌더 페이지에 정적으로 주입되어 크롤러의 사이트 항해 신호 확보
//
// 색상은 리터럴 hex가 아니라 테마 토큰(hsl(var(--...)))을 쓴다. prerender-content.mjs와
// 같은 규칙이다. 하드코딩된 밝은색 계열은 다크 모드에서 배경과 같은 톤이 되어 글이 안 보인다.
// 이 블록은 마운트 직후 제거되지만 그 전까지는 사람이 보는 화면이다.

import { readFileSync } from "node:fs";

import { PRIMARY_NAV_ITEMS } from "./primary-nav-items.mjs";

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

const CURRENT_SERVICE = SERVICE_CATALOG.services.find((service) => service.app === CURRENT_APP);

// 헤더 사이트 링크 — Vue 헤더(AppHeader.vue의 links)와 같은 두 개. 모바일에서는 ☰ 안으로 들어간다.
// 테마 토글의 정적 쌍둥이 — 패키지 ShThemeToggle과 같은 클래스·같은 아이콘. 수화 전이라 동작하지 않지만
// 자리가 비어 있으면 수화 때 데스크톱 사이트 링크가 60px 옆으로 밀린다.
const STATIC_THEME_TOGGLE = `<div class="sh-global-header__utility"><button type="button" class="sh-theme-toggle" aria-label="다크 모드로 전환" style="width:44px;min-height:44px;border:0;background:transparent;color:#fafafa;"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" width="20" height="20"><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.6" /><path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" /></svg></button></div>`;

const SITE_LINKS = [
  { href: "/blog", label: "블로그" },
  { href: "/card/about", label: "소개" },
];

/**
 * 전체 메뉴(☰)의 **정적 쌍둥이** — 0.3.38 "순수 내비게이션" 구조와 같다.
 *
 * 왜 필요한가: 이 앱의 프리렌더 산출물에는 Vue 출력이 없다 — 크롤러와 첫 페인트가
 * 보는 셸은 전부 이 파일이 만든다. 메뉴를 Vue에만 두면 모바일 탭 줄이 숨은 상태에서
 * 원시 HTML의 헤더 경로가 사라진다. 수화 후 헤더와 같은 클래스·같은 목록
 * (scripts/primary-nav-items.mjs)으로 심는다.
 *
 * 트리거는 수화 전이라 동작하지 않는다. 패널은 패키지 CSS가
 * `visibility:hidden; transform:translateX(100%)`로 숨기므로(스타일시트는 렌더
 * 블로킹이라 첫 페인트에 이미 도착해 있다) 화면에는 보이지 않고 DOM에만 남는다.
 */
function buildPrerenderDrawer() {
  const links = PRIMARY_NAV_ITEMS.map(
    ({ to, label }) => `<a class="sh-nav-drawer__link" href="/card${to}">${label}</a>`,
  ).join("");
  const siteLinks = SITE_LINKS.map(
    ({ href, label }) => `<a class="sh-nav-drawer__site-link" href="${href}">${label}</a>`,
  ).join("");

  return `<button type="button" class="sh-nav-drawer__trigger" aria-label="메뉴 열기" aria-expanded="false" aria-controls="sh-nav-drawer-prerender" style="border:0;background:transparent;color:#fafafa;">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" width="22" height="22"><path d="M4 7h16M4 12h16M4 17h16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" /></svg>
        </button>
        <div class="sh-nav-drawer" data-open="false">
          <div class="sh-nav-drawer__scrim"></div>
          <nav id="sh-nav-drawer-prerender" class="sh-nav-drawer__panel" aria-label="전체 메뉴" aria-hidden="true" tabindex="-1">
            <div class="sh-nav-drawer__head"><p class="sh-nav-drawer__heading"><span class="sh-nav-drawer__eyebrow">ShakiLabs</span>${CURRENT_SERVICE.shortLabel}</p></div>
            <div class="sh-nav-drawer__list">${links}</div>
            <div class="sh-nav-drawer__site">${siteLinks}</div>
          </nav>
        </div>`;
}

// v3 AppShell: 프리렌더 정적 마크업도 실제 Vue 출력(검정 ShGlobalHeader + 조용한 탭 줄)과
// 같은 모양이어야 수화 전후 헤더가 깜빡이지 않는다(BL-038). header/nav를 별개의
// body 직계 블록으로 나눈다 - removePrerenderChrome()이 HEADER/NAV 태그를 각각 지운다.
// data-seo-prerender는 태그 바로 뒤 첫 속성이어야 한다 — prerender.mjs가 재실행 때
// `<header data-seo-prerender`·`<nav data-seo-prerender` 형태로 옛 블록을 찾아 지운다.
// 탭 줄은 패키지 클래스를 그대로 쓴다: 조용한 탭 모양, 모바일 숨김(☰가 있을 때)이 CSS로 같이 온다.
// 사이트 링크 묶음(nav)에는 display를 인라인으로 주지 않는다 — 모바일 접힘 규칙을 이기면 안 된다.
export function buildPrerenderHeader() {
  const link = ({ href, label }) =>
    `<a class="sh-global-header__link" href="${href}" style="display:inline-flex;align-items:center;min-height:44px;padding-inline:10px;color:#a3a3a3;font-size:13px;font-weight:500;text-decoration:none;">${label}</a>`;
  const tabs = PRIMARY_NAV_ITEMS.map(
    ({ to, label }) =>
      `<a class="sh-primary-navigation__link" href="/card${to}"><span class="sh-primary-navigation__label">${label}</span></a>`,
  ).join("");

  return `
    <header data-seo-prerender="header" class="sh-global-header sh-global-header--has-app" style="position:sticky;top:0;z-index:50;background:#0a0a0a;color:#fafafa;">
      <div class="sh-global-header__inner" style="display:flex;align-items:center;gap:16px;height:56px;margin-inline:auto;padding-inline:var(--sh-container-gutter, 16px);max-width:var(--sh-header-content-width, 72rem);">
        <div class="sh-global-header__start" style="display:flex;align-items:center;min-width:0;">
          <a class="sh-global-header__brand" href="/" aria-label="ShakiLabs 홈" style="display:inline-flex;align-items:center;min-height:44px;color:#fafafa;font-size:15px;font-weight:700;letter-spacing:-0.01em;text-decoration:none;white-space:nowrap;"><span class="sh-global-header__brand-text">ShakiLabs</span></a>
          <span class="sh-global-header__sep" aria-hidden="true" style="margin-inline:10px 4px;color:rgb(255 255 255 / 28%);font-size:16px;font-weight:400;">/</span>
          <a class="sh-global-header__app" href="${CURRENT_SERVICE.href}" style="display:inline-flex;align-items:center;min-height:44px;padding-inline:6px;color:#fafafa;font-size:15px;font-weight:600;text-decoration:none;white-space:nowrap;">${CURRENT_SERVICE.shortLabel}</a>
        </div>
        <div class="sh-global-header__end" style="display:flex;align-items:center;gap:16px;margin-inline-start:auto;">
          <nav class="sh-global-header__nav" aria-label="사이트 메뉴">${SITE_LINKS.map(link).join("")}</nav>
          ${STATIC_THEME_TOGGLE}
          ${buildPrerenderDrawer()}
        </div>
      </div>
    </header>
    <nav data-seo-prerender="nav" class="sh-primary-navigation" aria-label="주요 메뉴">
      <div class="sh-primary-navigation__container"><div class="sh-primary-navigation__list">${tabs}</div></div>
    </nav>`;
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
