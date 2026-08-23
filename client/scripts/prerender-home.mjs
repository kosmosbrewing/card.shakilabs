// Card app home (/) meta + rich content builder.
// The home is the highest-authority page of the app, so it gets its own copy
// instead of reusing the /fuel-card calculator or the /all directory listing.
// NOTE: keep comments in English - every character under client/scripts is
// collected into the shipped font subset (see font-subset-config.mjs).

import { CAP_BINDS_UNDER_200K, CAP_THRESHOLDS, formatWon } from "./card-data-derived.mjs";

// Colors are theme tokens, not literal hex: this markup now ships into the Vue
// DOM as well as the static file, and hardcoded light values are unreadable in
// dark mode. The tokens are defined in index.html critical CSS, so they resolve
// with JavaScript disabled too.
const ARTICLE = "max-width:920px;margin:0 auto;padding:24px 16px;line-height:1.75;font-size:15px;color:hsl(var(--foreground));";
const H1 = "font-size:28px;line-height:1.3;margin:0 0 16px;color:hsl(var(--foreground));";
const H2 = "font-size:20px;line-height:1.35;margin:28px 0 10px;padding-bottom:6px;border-bottom:2px solid hsl(var(--border));color:hsl(var(--foreground));";
const H3 = "font-size:16px;line-height:1.4;margin:18px 0 6px;color:hsl(var(--foreground));";
const P = "margin:0 0 10px;";
const TABLE = "width:100%;border-collapse:collapse;margin:10px 0 16px;font-size:14px;";
const TH = "padding:8px 10px;background:hsl(var(--muted));text-align:left;border:1px solid hsl(var(--border));color:hsl(var(--foreground));font-weight:600;";
const TD = "padding:8px 10px;border:1px solid hsl(var(--border));";
const OL = "margin:0 0 12px 20px;padding:0;";
const LI = "margin-bottom:6px;";
const CALLOUT = "background:hsl(var(--accent));border-left:4px solid hsl(var(--primary));padding:12px 14px;margin:12px 0 16px;border-radius:4px;";

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

const STEPS = [
  ["소비를 먼저 적는다", "주유비, 해외결제, 구독료처럼 매달 반복되는 금액부터 적으세요. 혜택률보다 실제 지출 규모가 절약액을 결정합니다."],
  ["한도와 실적을 확인한다", "할인율이 높아도 월 할인 한도가 낮으면 체감 절약은 작습니다. 전월 실적 조건도 함께 보세요."],
  ["연회비를 빼고 비교한다", "연간 절약액에서 연회비를 뺀 순혜택이 실제 이득입니다. 순혜택이 음수면 연회비가 낮은 카드가 낫습니다."],
];

// Failure modes that flip a conclusion. Kept distinct from STEPS (a procedure)
// and from the /all directory (which tool to open) so the home does not repeat
// either one -- duplicated blocks were the actual thin-content problem here.
// What the app actually computes. STEPS is a procedure and PITFALLS are failure
// modes; neither says what the numbers on the result screens mean. Ten tools
// share exactly four output metrics, so defining them once on the home makes
// every calculator readable without repeating the definition on each one.
const METRICS = [
  [
    "연간 절약액",
    "월 지출에 카드 혜택률을 적용하고 월 할인 한도로 자른 뒤 12개월을 더합니다.",
    "한도에 걸리는 달이 있으면 지출을 더 늘려도 이 값은 오르지 않습니다.",
  ],
  [
    "순혜택",
    "연간 절약액에서 연회비와 실적을 채우려고 추가로 쓴 금액을 뺍니다.",
    "열 개 계산기가 모두 이 값으로 순위를 매기므로, 서로 다른 계산기의 결과도 이 값끼리 비교하면 됩니다.",
  ],
  [
    "회수 기간",
    "연회비를 월 평균 절약액으로 나눠 몇 개월 만에 본전이 되는지 계산합니다.",
    "12개월을 넘으면 1년을 다 써도 연회비를 못 뽑는다는 뜻입니다.",
  ],
  [
    "실질 가치",
    "포인트·마일리지를 전환처와 노선별로 원화 환산액으로 바꿉니다.",
    "1포인트가 1원에 못 미치면 현금성으로 쓰는 편이 낫습니다.",
  ],
];

const PITFALLS = [
  [
    "월 할인 한도를 안 본다",
    "리터당 150원 할인이라도 월 한도가 1만원이면 주유비를 아무리 늘려도 연간 절약액은 12만원에서 멈춥니다. 할인율보다 한도가 먼저 결론을 정하는 경우가 많습니다.",
  ],
  [
    "실적 채우기 비용을 빼먹는다",
    "전월 실적 30만원을 채우려고 평소 안 쓰던 10만원을 더 썼다면, 그 10만원은 혜택이 아니라 비용입니다. 순혜택은 할인액에서 이 추가 지출을 뺀 값입니다.",
  ],
  [
    "해외결제에서 원화(DCC)로 승인한다",
    "현지 단말기가 원화 결제를 권하면 가맹점 환전 수수료가 얹혀 3~8% 손해가 납니다. 같은 카드라도 결제 통화 선택 하나로 금액이 갈립니다.",
  ],
  [
    "첫해 면제 연회비를 계속 면제로 본다",
    "발급 첫해만 면제되는 조건이 흔합니다. 2년차부터 연회비가 붙는다면 회수 시점 계산은 면제가 끝난 뒤 기준으로 다시 해야 합니다.",
  ],
];

export function buildHomeMeta(siteUrl) {
  const title = "카드 계산기 | 주유·해외결제·연회비 혜택 비교 2026";
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

  const stepItems = STEPS.map(
    ([heading, body]) => `<li style="${LI}"><strong>${heading}</strong> — ${body}</li>`,
  ).join("");

  return `
    <h1 style="${H1}">카드 혜택, 발급 전에 숫자로 확인하세요</h1>
    <p style="${P}">
      카드 광고는 최대 할인율을 앞세우지만, 실제로 돌아오는 금액은 내 소비 규모와 월 할인 한도, 전월 실적, 연회비를 모두 반영해야 나옵니다.
      ShakiLabs 카드 계산기는 주유·해외결제·연회비·포인트 등 카드 선택에 필요한 계산을 10개 도구로 나눠 제공합니다.
      회원가입이나 개인정보 입력 없이 금액만 넣으면 결과를 바로 확인할 수 있습니다.
    </p>

    <h2 style="${H2}">지금 상황부터 고르세요</h2>
    <p style="${P}">카드 이름이 아니라 지금 겪고 있는 상황에서 출발하면 필요한 계산기를 빠르게 찾을 수 있습니다.</p>
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
    </table>

    <h2 style="${H2}">카드 고르기 3단계</h2>
    <ol style="${OL}">${stepItems}</ol>`;
}

// Blocks HomeView.vue does not render. Imported by src/seo/routeRichContent.ts.
export function buildHomeExtraContent() {
  const pitfallItems = PITFALLS.map(
    ([heading, body]) => `
        <tr>
          <td style="${TD}"><strong>${heading}</strong></td>
          <td style="${TD}">${body}</td>
        </tr>`,
  ).join("");

  const metricRows = METRICS.map(
    ([name, how, read]) => `
        <tr>
          <td style="${TD}"><strong>${name}</strong></td>
          <td style="${TD}">${how}</td>
          <td style="${TD}">${read}</td>
        </tr>`,
  ).join("");

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
    <div style="${CALLOUT}">
      할인율이 가장 높은 카드가 항상 유리한 것은 아닙니다. 월 할인 한도에 먼저 걸리면 소비를 늘려도 절약액은 그대로입니다.
    </div>

    <h2 style="${H2}">계산기가 내놓는 네 가지 숫자</h2>
    <p style="${P}">
      계산기마다 화면은 다르지만 결론에 쓰는 지표는 네 가지입니다. 이 네 값의 뜻을 알아두면 어떤 계산기를 열어도 결과를 같은 방식으로 읽을 수 있습니다.
    </p>
    <table style="${TABLE}">
      <thead>
        <tr>
          <th style="${TH}">지표</th>
          <th style="${TH}">어떻게 계산하나</th>
          <th style="${TH}">어떻게 읽나</th>
        </tr>
      </thead>
      <tbody>${metricRows}
      </tbody>
    </table>

    <h2 style="${H2}">할인율이 무의미해지는 지출액</h2>
    <p style="${P}">
      위의 첫 번째 지표를 카드 하나에 대입해 보면 광고 문구와 실제 절약액이 왜 벌어지는지 한 줄로 드러납니다.
      월 할인 한도를 할인율로 나눈 금액이 "이 지출을 넘기면 더 써도 할인이 늘지 않는 지점"이고,
      이 값은 연회비 회수 계산기가 비교하는 ${CAP_THRESHOLDS.length}장에서 아래처럼 벌어집니다.
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

    <h2 style="${H2}">혜택 계산에서 자주 놓치는 것</h2>
    <p style="${P}">아래 네 가지는 계산에 넣고 빼는 것만으로 "어느 카드가 유리한가"의 답이 뒤집히는 항목입니다.</p>
    <table style="${TABLE}">
      <thead>
        <tr>
          <th style="${TH}">놓치는 항목</th>
          <th style="${TH}">결론이 뒤집히는 이유</th>
        </tr>
      </thead>
      <tbody>${pitfallItems}
      </tbody>
    </table>

    <h2 style="${H2}">계산 기준</h2>
    <p style="${P}">
      카드 혜택·연회비·수수료 정보는 각 카드사가 공개한 상품 안내를 기준으로 정리하며, 유가와 환율처럼 자주 바뀌는 값은 공공 데이터를 참고해 갱신합니다.
      계산 결과는 입력한 금액에 근거한 추정치이므로 실제 청구액과 다를 수 있고, 최종 조건은 카드사 공식 안내에서 확인해야 합니다.
    </p>

    <h2 style="${H2}">자주 묻는 질문</h2>
    <h3 style="${H3}">Q1. 어떤 계산기부터 써야 하나요?</h3>
    <p style="${P}">매달 고정으로 나가는 지출이 가장 큰 항목부터 계산하세요. 차량을 운행하면 주유 할인카드, 해외 결제가 잦으면 해외결제 수수료 계산기가 절약액이 가장 크게 나오는 편입니다.</p>
    <h3 style="${H3}">Q2. 계산 결과대로 카드를 발급하면 되나요?</h3>
    <p style="${P}">계산 결과는 공개된 혜택 조건을 입력값에 적용한 추정치입니다. 카드사 정책 변경이나 신규 회원 한정 조건이 있을 수 있으므로 발급 전 카드사 공식 페이지에서 조건을 확인하세요.</p>
    <h3 style="${H3}">Q3. 개인정보나 카드번호를 입력해야 하나요?</h3>
    <p style="${P}">입력값은 월 지출 금액처럼 계산에 필요한 숫자뿐이며 모두 브라우저 안에서만 처리됩니다. 카드번호나 개인정보를 입력받지 않고 서버로 전송하지도 않습니다.</p>
    <h3 style="${H3}">Q4. 이용료가 있나요?</h3>
    <p style="${P}">모든 계산기는 무료입니다. 본 서비스는 금융 상품을 판매하거나 중개하지 않으며, 특정 카드사의 발급을 권유하지 않습니다.</p>
    <h3 style="${H3}">Q5. 계산 결과가 카드사 광고보다 적게 나옵니다.</h3>
    <p style="${P}">카드사 안내는 보통 조건이 전부 맞아떨어졌을 때의 최대 할인율을 앞세웁니다. 이 계산기는 월 할인 한도와 전월 실적, 연회비를 모두 적용한 뒤의 금액을 보여주므로 광고 문구보다 작게 나오는 것이 정상입니다. 두 숫자가 크게 벌어진다면 한도에 먼저 걸리고 있다는 신호입니다.</p>
    <h3 style="${H3}">Q6. 계산기를 여러 개 써야 하나요?</h3>
    <p style="${P}">보통은 하나로 끝납니다. 지출이 한 항목에 몰려 있으면 그 계산기 하나면 충분하고, 주유와 해외결제처럼 두 항목이 모두 크면 각각의 순혜택을 더해 카드 한 장으로 둘 다 감당되는지 보면 됩니다.</p>`;
}

export function buildHomeContent() {
  return `<article data-seo-prerender="card-home" style="${ARTICLE}">${buildHomeIntroContent()}
${buildHomeExtraContent()}
  </article>`;
}
