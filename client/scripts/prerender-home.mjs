// Card app home (/) meta + rich content builder.
// The home is the highest-authority page of the app, so it gets its own copy
// instead of reusing the /fuel-card calculator or the /all directory listing.
// NOTE: keep comments in English - every character under client/scripts is
// collected into the shipped font subset (see font-subset-config.mjs).

const ARTICLE = "max-width:920px;margin:0 auto;padding:24px 16px;line-height:1.75;font-size:15px;color:#334155;";
const H1 = "font-size:28px;line-height:1.3;margin:0 0 16px;color:#0f172a;";
const H2 = "font-size:20px;line-height:1.35;margin:28px 0 10px;padding-bottom:6px;border-bottom:2px solid #3b82f633;color:#0f172a;";
const H3 = "font-size:16px;line-height:1.4;margin:18px 0 6px;color:#0f172a;";
const P = "margin:0 0 10px;";
const TABLE = "width:100%;border-collapse:collapse;margin:10px 0 16px;font-size:14px;";
const TH = "padding:8px 10px;background:#f1f5f9;text-align:left;border:1px solid #cbd5e1;color:#334155;font-weight:600;";
const TD = "padding:8px 10px;border:1px solid #cbd5e1;";
const OL = "margin:0 0 12px 20px;padding:0;";
const LI = "margin-bottom:6px;";
const CALLOUT = "background:#eff6ff;border-left:4px solid #3b82f6;padding:12px 14px;margin:12px 0 16px;border-radius:4px;";

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

export function buildHomeContent() {
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

  return `<article data-seo-prerender="card-home" style="${ARTICLE}">
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
    <ol style="${OL}">${stepItems}</ol>
    <div style="${CALLOUT}">
      할인율이 가장 높은 카드가 항상 유리한 것은 아닙니다. 월 할인 한도에 먼저 걸리면 소비를 늘려도 절약액은 그대로입니다.
    </div>

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
  </article>`;
}
