import { splitLongParagraphs } from "./split-long-paragraphs.mjs";
// Card app home (/) meta + rich content builder.
// The home is the highest-authority page of the app, so it gets its own copy
// instead of reusing the /fuel-card calculator or the /all directory listing.
// NOTE: keep comments in English - every character under client/scripts is
// collected into the shipped font subset (see font-subset-config.mjs).

import { CAP_BINDS_UNDER_200K, CAP_THRESHOLDS, formatWon } from "./card-data-derived.mjs";
import { pageTitleFor } from "./seo-meta.mjs";

// Colors are theme tokens, not literal hex: this markup now ships into the Vue
// DOM as well as the static file, and hardcoded light values are unreadable in
// dark mode. The tokens are defined in index.html critical CSS, so they resolve
// with JavaScript disabled too.
// 폭·가운데 정렬은 싣지 않는다 — 감싸는 .sh-container(프레임)가 정한다. 920px 자체 가운데 정렬은
// 프레임(1152) 안에서 다시 가운데로 가 본문이 제목·계산기(x=168)보다 108px 안쪽(276)에서 시작했다.
const ARTICLE = "padding:24px 0;line-height:1.75;font-size:15px;color:hsl(var(--foreground));";
const H1 = "font-size:28px;line-height:1.3;margin:0 0 16px;color:hsl(var(--foreground));";
const H2 = "font-size:20px;line-height:1.35;margin:28px 0 10px;padding-bottom:6px;border-bottom:2px solid hsl(var(--border));color:hsl(var(--foreground));";
const P = "margin:0 0 10px;";
const TABLE = "width:100%;border-collapse:collapse;margin:10px 0 16px;font-size:14px;";
const TH = "padding:8px 10px;background:hsl(var(--muted));text-align:left;border:1px solid hsl(var(--border));color:hsl(var(--foreground));font-weight:600;";
const TD = "padding:8px 10px;border:1px solid hsl(var(--border));";

// Situation-first routing table. Deliberately framed by "when this happens"
// so it does not repeat the category grid rendered on /all.
const SITUATIONS = [
  ["매달 주유비가 부담된다", "카드별 리터당 할인과 월 할인 한도", "/fuel-card", "주유 할인카드 비교"],
  ["해외여행·직구를 앞두고 있다", "해외수수료와 DCC 원화결제 손해액", "/overseas-payment", "해외결제 수수료 비교"],
  ["연회비가 아까운지 모르겠다", "연간 혜택이 연회비를 넘는 시점", "/annual-fee", "연회비 회수 계산"],
  ["실적 채우려 억지 소비를 한다", "실적 충족에 드는 추가 지출", "/min-spend", "전월 실적 계산"],
  ["쌓인 포인트·마일리지가 있다", "전환처별 1포인트 실질 가치", "/point-convert", "포인트 전환 비교"],
  ["면세 한도를 넘길 것 같다", "초과분 예상 관세와 부가세", "/duty-free", "면세 한도 계산"],
];

export function buildHomeMeta(siteUrl) {
  // Title comes from seo-meta.mjs so HomeView.vue renders the identical string.
  const title = pageTitleFor("/");
  const description =
    "주유 할인부터 해외결제 수수료, 연회비 회수, 포인트 전환까지 카드 혜택 10가지를 목적별로 계산합니다. 내 소비 패턴에 맞는 카드를 직접 비교해 보세요.";
  const canonical = siteUrl;

  return {
    title,
    description,
    canonical,
    appPath: "/all",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "ShakiLabs 카드 계산기",
        url: canonical,
        description,
        inLanguage: "ko",
      },
      {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "카드 계산기 목록",
        itemListElement: SITUATIONS.map(([, , path, label], index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: label,
          url: `${siteUrl}${path}`,
        })),
      },
    ],
    // The home is the breadcrumb root, so a single-item trail adds nothing.
    breadcrumb: null,
  };
}

// The home body is split in two because HomeView.vue already renders the hero,
// the situation table (as cards) and the three steps from the same data. Only
// the remaining blocks are handed to the app, so a visitor never reads the same
// argument twice while the static file keeps the full document.
function buildHomeIntroContent() {
  const situationRows = SITUATIONS.map(
    ([situation, checkpoint, path, label]) => `
        <tr>
          <td style="${TD}">${situation}</td>
          <td style="${TD}">${checkpoint}</td>
          <td style="${TD}"><a href="/card${path}">${label}</a></td>
        </tr>`,
  ).join("");

  // Hub copy is one sentence, same as HomeView.vue. The three-sentence intro,
  // the "3 steps" procedure, the metric glossary, the pitfalls table and the
  // six-question FAQ were generic essay blocks (GA4, 28 days: 4 home views).
  // What stays is the situation table (the index) and the cap-threshold data
  // the home alone derives from the card data set.
  return `
    <h1 style="${H1}">카드 혜택, 발급 전에 숫자로 확인하세요</h1>
    <p style="${P}">주유·해외결제·연회비·포인트 등 카드 혜택 계산기 10개. 금액만 넣으면 회원가입 없이 바로 계산합니다.</p>

    <h2 style="${H2}">지금 상황부터 고르세요</h2>
    <table style="${TABLE}">
      <thead>
        <tr>
          <th style="${TH}">이런 상황이라면</th>
          <th style="${TH}">확인해야 할 숫자</th>
          <th style="${TH}">계산기</th>
        </tr>
      </thead>
      <tbody>${situationRows}
      </tbody>
    </table>`;
}

// Blocks HomeView.vue does not render. Imported by src/seo/routeRichContent.ts.
function buildHomeExtraContentRaw() {
  const capRows = CAP_THRESHOLDS.map(
    (row) => `
        <tr>
          <td style="${TD}">${row.card}</td>
          <td style="${TD}">${row.category}</td>
          <td style="${TD}">${row.rate}%</td>
          <td style="${TD}">${formatWon(row.monthlyCap)}원</td>
          <td style="${TD}">${formatWon(row.capAtSpend)}원</td>
        </tr>`,
  ).join("");
  // CAP_THRESHOLDS is sorted by the spend at which the cap binds, so the first
  // row is the card that stops paying soonest. The lowest headline rate has to
  // be looked up separately - that is the card at the other end of the argument.
  const earliestCapRow = CAP_THRESHOLDS[0];
  const lowestRateRow = [...CAP_THRESHOLDS].sort(
    (a, b) => Number(a.rate) - Number(b.rate),
  )[0];

  return `
    <h2 style="${H2}">할인율이 무의미해지는 지출액</h2>
    <p style="${P}">
      월 할인 한도를 할인율로 나눈 금액이 "이 지출을 넘기면 더 써도 할인이 늘지 않는 지점"입니다.
      연회비 회수 계산기가 비교하는 ${CAP_THRESHOLDS.length}장에서 이 값은 아래처럼 벌어집니다.
      각 카드의 혜택 중 할인율이 가장 높은 항목, 즉 카드사가 앞세우는 숫자를 기준으로 잡았습니다.
    </p>
    <table style="${TABLE}">
      <thead>
        <tr>
          <th style="${TH}">카드</th>
          <th style="${TH}">대표 혜택</th>
          <th style="${TH}">할인율</th>
          <th style="${TH}">월 한도</th>
          <th style="${TH}">한도에 닿는 월 지출</th>
        </tr>
      </thead>
      <tbody>${capRows}
      </tbody>
    </table>
    <p style="${P}">
      ${CAP_THRESHOLDS.length}장 중 ${CAP_BINDS_UNDER_200K}장은 월 ${formatWon(200000)}원 이하 지출에서 이미 한도에 닿습니다.
      할인율이 높을수록 한도에 빨리 걸린다는 뜻이기도 합니다.
      할인율이 가장 낮은 카드는 ${lowestRateRow.card}(${lowestRateRow.rate}%)이고,
      월 한도가 ${formatWon(lowestRateRow.monthlyCap)}원이라 월 ${formatWon(lowestRateRow.capAtSpend)}원까지 할인이 계속 늘어납니다.
      반대로 한도에 가장 빨리 닿는 카드는 ${earliestCapRow.card}(${earliestCapRow.rate}%)이고,
      월 ${formatWon(earliestCapRow.capAtSpend)}원을 넘기는 순간 그 항목에서는 더 이상 할인이 붙지 않습니다.
      해당 항목 지출이 한도 지점을 크게 넘는다면 할인율이 낮고 한도가 큰 카드를 함께 계산해 보세요.
      항목별 한도를 다 채워도 월 통합한도가 한 번 더 자르는 카드가 있으므로, 최종 판단은 순혜택으로 해야 합니다.
    </p>

    <h2 style="${H2}">계산 기준</h2>
    <p style="${P}">
      카드 혜택·연회비·수수료 정보는 각 카드사가 공개한 상품 안내를 기준으로 정리하며, 유가와 환율처럼 자주 바뀌는 값은 공공 데이터를 참고해 갱신합니다.
      계산 결과는 입력한 금액에 근거한 추정치이므로 실제 청구액과 다를 수 있고, 최종 조건은 카드사 공식 안내에서 확인해야 합니다.
    </p>`;
}

function buildHomeContentRaw() {
  return `<article data-seo-prerender="card-home" style="${ARTICLE}">${buildHomeIntroContent()}
${buildHomeExtraContent()}
  </article>`;
}

// v8b: 문단 ≤250자 — 빌더 반환 HTML의 긴 <p>를 문장 경계에서 나눈다(정적·런타임 공통)
export function buildHomeExtraContent() {
  return splitLongParagraphs(buildHomeExtraContentRaw());
}

// v8b: 문단 ≤250자 — 빌더 반환 HTML의 긴 <p>를 문장 경계에서 나눈다(정적·런타임 공통)
export function buildHomeContent() {
  return splitLongParagraphs(buildHomeContentRaw());
}
