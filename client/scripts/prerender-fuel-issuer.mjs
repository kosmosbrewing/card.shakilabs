// Body of the six /fuel-card/<issuer> pages, built from the card data only.
//
// Why this file exists: the previous body kept a hand-written ISSUER_DATA table
// that disagreed with src/data/fuelCards.ts on four of six issuers - it named
// cards the calculator does not have (taptap O, LOCA LIKIT ALL, "1Q 5%"), put a
// station restriction on KB that the data does not carry, and printed one
// hard-coded savings table (20/30/50/70 man-won) on all six pages. Those pages
// get the most Naver impressions in the fuel family, so the crawler copy was the
// least accurate text on the site.
//
// Now every claim is read from the mirrored card rows (card-data-mirror.mjs,
// parity-tested against fuelCards.ts) and every number comes from fuelResult,
// the mirror of the calculator engine, via fuel-issuer-facts.mjs. src/seo/fuelIssuerContent.test.ts parses
// the rendered tables and compares each cell with the TypeScript data and
// engine, so editing a card without this page following turns the suite red.
//
// The same string ships in the static HTML and, through routeRichContent.ts, in
// the hydrated page, so the hydration survival gate sees identical sentences.
//
// NOTE: comments here are intentionally ASCII-only. scripts/ is scanned by
// font-subset-config.mjs and every character becomes part of the shipped font
// subset. Korean strings are page copy and belong in the subset.
import { CARD_BENEFIT_DATA_VERIFIED_AT, formatWon } from "./card-data-derived.mjs";
import { FUEL_CARDS, FUEL_PRICES } from "./card-data-mirror.mjs";
import {
  FUEL_TYPE,
  REFERENCE_SPEND,
  breakEvenSpend,
  cardsForIssuer,
  discountLabel,
  savingsAt,
  spendTiers,
} from "./fuel-issuer-facts.mjs";
import { FUEL_ISSUERS, ISSUER_SIMULATION_AMOUNTS } from "./seo-meta.mjs";

const ARTICLE = "padding:24px 0;line-height:1.75;font-size:15px;color:hsl(var(--foreground));";
const H1 = "font-size:28px;line-height:1.3;margin:0 0 16px;color:hsl(var(--foreground));";
const H2 = "font-size:20px;line-height:1.35;margin:28px 0 10px;padding-bottom:6px;border-bottom:2px solid hsl(var(--border));color:hsl(var(--foreground));";
const H3 = "font-size:16px;line-height:1.4;margin:18px 0 6px;color:hsl(var(--foreground));";
const P = "margin:0 0 10px;";
const NOTE = "font-size:13px;color:hsl(var(--muted-foreground));margin:0 0 10px;";
const TABLE = "width:100%;border-collapse:collapse;margin:10px 0 16px;font-size:14px;";
const TH = "padding:8px 10px;background:hsl(var(--muted));text-align:left;border:1px solid hsl(var(--border));color:hsl(var(--foreground));font-weight:600;";
const TD = "padding:8px 10px;border:1px solid hsl(var(--border));";
const UL = "margin:0 0 12px 20px;padding:0;";
const LI = "margin-bottom:4px;";
const CALLOUT = "background:hsl(var(--accent));border-left:4px solid hsl(var(--primary));padding:12px 14px;margin:12px 0 16px;border-radius:4px;";

const won = (value) => `${formatWon(Math.round(value))}원`;
const manWon = (value) => `${value / 10000}만원`;
const pct = (rate) => `${Number((rate * 100).toFixed(1))}%`;

function termsRow(card) {
  const tiers = spendTiers(card);
  const brands = card.discount.brandRestriction;
  const cells = [
    card.name,
    discountLabel(card),
    tiers.map((tier) => `${won(tier.minSpend)} 이상`).join(" / "),
    tiers.map((tier) => won(tier.monthlyCap)).join(" / "),
    won(card.annualFee),
    brands.length > 0 ? `${brands.join("·")} 주유소만` : null,
  ].filter((cell) => cell !== null);
  return `<tr data-card-id="${card.id}">${cells.map((cell) => `<td style="${TD}">${cell}</td>`).join("")}</tr>`;
}

function termsTable(cards) {
  const restricted = cards.some((card) => card.discount.brandRestriction.length > 0);
  const head = ["카드", "할인 방식", "전월 실적", "월 할인 한도", "연회비", ...(restricted ? ["주유소"] : [])];
  return (
    `<table data-issuer-terms style="${TABLE}"><thead><tr>${head.map((cell) => `<th style="${TH}">${cell}</th>`).join("")}</tr></thead>` +
    `<tbody>${cards.map(termsRow).join("")}</tbody></table>`
  );
}

function savingsTable(card) {
  const rows = ISSUER_SIMULATION_AMOUNTS.map((amount) => {
    const result = savingsAt(card, amount);
    const cells = [
      manWon(amount),
      `${won(result.monthlyDiscount)}${result.isCapExceeded ? " (한도)" : ""}`,
      pct(result.monthlyDiscount / amount),
      won(result.annualNet),
    ];
    return `<tr data-spend="${amount}">${cells.map((cell) => `<td style="${TD}">${cell}</td>`).join("")}</tr>`;
  }).join("");
  const head = ["월 주유비", "월 할인", "실효 할인율", "연회비 뺀 연간 절약액"];
  return (
    `<table data-issuer-savings="${card.id}" style="${TABLE}"><thead><tr>${head.map((cell) => `<th style="${TH}">${cell}</th>`).join("")}</tr></thead>` +
    `<tbody>${rows}</tbody></table>`
  );
}

function rangeText(values) {
  const low = Math.min(...values);
  const high = Math.max(...values);
  return low === high ? `모든 구간에서 ${won(low)}` : `${won(low)}~${won(high)}`;
}

function cardSummary(card) {
  const tiers = spendTiers(card);
  const brands = card.discount.brandRestriction;
  const results = ISSUER_SIMULATION_AMOUNTS.map((amount) => savingsAt(card, amount));
  const limit =
    tiers.length === 1
      ? `전월 실적 ${won(tiers[0].minSpend)} 이상일 때 월 ${won(tiers[0].monthlyCap)}까지 할인됩니다.`
      : `월 할인 한도는 전월 실적에 따라 ${tiers.map((tier) => `${won(tier.minSpend)} 이상 ${won(tier.monthlyCap)}`).join(", ")}으로 달라집니다.`;
  const station = brands.length > 0 ? ` 할인은 ${brands.join("·")} 주유소에서만 적용됩니다.` : "";
  const first = ISSUER_SIMULATION_AMOUNTS[0];
  const last = ISSUER_SIMULATION_AMOUNTS[ISSUER_SIMULATION_AMOUNTS.length - 1];
  return (
    `<p style="${P}"><strong>${card.name}</strong>의 할인 방식은 ${discountLabel(card)}이고 연회비는 ${won(card.annualFee)}입니다. ${limit}${station}</p>` +
    `<p style="${P}">휘발유 ${won(FUEL_PRICES[FUEL_TYPE])}/L 기준으로 월 주유비 ${manWon(first)}~${manWon(last)}을 넣으면 ` +
    `월 할인은 ${rangeText(results.map((result) => result.monthlyDiscount))}, ` +
    `연회비를 뺀 연간 절약액은 ${rangeText(results.map((result) => result.annualNet))}입니다.</p>`
  );
}

function breakEvenText(card) {
  const spend = breakEvenSpend(card);
  const monthlyFee = won(card.annualFee / 12);
  if (spend === null) {
    return `<p style="${P}">${card.name}의 최저 구간 월 할인 한도는 연회비 월 환산액 ${monthlyFee}보다 작아, 주유 할인만으로는 연회비를 회수할 수 없습니다.</p>`;
  }
  return (
    `<p style="${P}">${card.name}의 연회비 ${won(card.annualFee)}을 12개월로 나누면 월 ${monthlyFee}입니다. ` +
    `휘발유 기준 월 주유비가 <strong>${won(spend)}</strong> 이상이면 월 할인이 이 금액을 넘어, 연회비를 내고도 절약액이 남습니다.</p>`
  );
}

function faqSavingsAnswer(card) {
  const result = savingsAt(card, REFERENCE_SPEND);
  const yearly = result.annualNet + card.annualFee;
  const verdict = result.annualNet >= 0 ? `연 ${won(result.annualNet)}이 남습니다` : `연 ${won(-result.annualNet)} 손해입니다`;
  return (
    `휘발유를 월 ${won(REFERENCE_SPEND)}어치 주유하면 ${card.name}의 월 할인은 ${won(result.monthlyDiscount)}입니다. ` +
    `1년 할인 ${won(yearly)}에서 연회비 ${won(card.annualFee)}을 빼면 ${verdict}. 실적 조건을 놓친 달이 있으면 그만큼 줄어듭니다.`
  );
}

function otherIssuers(slug) {
  return Object.keys(FUEL_ISSUERS)
    .filter((other) => other !== slug)
    .map((other) => {
      const facts = cardsForIssuer(other)
        .map((card) => `${card.name}, ${discountLabel(card)}, 월 ${manWon(REFERENCE_SPEND)} 주유 시 연 ${won(savingsAt(card, REFERENCE_SPEND).annualNet)}`)
        .join(" / ");
      return `<li style="${LI}"><a href="/card/fuel-card/${other}">${FUEL_ISSUERS[other].label} 주유카드</a> — ${facts}</li>`;
    })
    .join("");
}

function scopeRange(values) {
  return `${won(Math.min(...values))}~${won(Math.max(...values))}`;
}

export function buildFuelCardIssuerContent(slug) {
  const issuer = FUEL_ISSUERS[slug];
  const cards = cardsForIssuer(slug);
  if (!issuer || cards.length === 0) return null;
  const { label } = issuer;
  const minSpends = FUEL_CARDS.map((card) => spendTiers(card)[0].minSpend);
  const caps = FUEL_CARDS.flatMap((card) => spendTiers(card).map((tier) => tier.monthlyCap));
  const lead = cards[0];

  return `
    <article data-seo-prerender="fuel-card-issuer" style="${ARTICLE}">
      <nav aria-label="breadcrumb" style="font-size:13px;color:hsl(var(--muted-foreground));margin-bottom:10px;">
        <a href="/card/fuel-card" style="color:hsl(var(--muted-foreground));text-decoration:none;">홈</a> ›
        <a href="/card/fuel-card" style="color:hsl(var(--muted-foreground));text-decoration:none;">주유 할인카드</a> ›
        ${label}
      </nav>

      <h1 style="${H1}">${label} 주유 할인카드 비교 (2026년)</h1>

      <p style="${P}">
        이 서비스가 비교하는 ${label} 주유 할인카드는 <strong>${cards.map((card) => card.name).join(", ")}</strong>입니다.
        아래 조건과 절약액은 모두 계산기와 같은 카드 데이터(${CARD_BENEFIT_DATA_VERIFIED_AT} 확인)에서 나옵니다.
      </p>
      ${cards.map(cardSummary).join("")}

      <h2 style="${H2}">1. ${label} 주유카드 할인 조건</h2>
      ${termsTable(cards)}

      <h2 style="${H2}">2. 월 주유비별 예상 절약액</h2>
      ${cards.map((card) => `${cards.length > 1 ? `<h3 style="${H3}">${card.name}</h3>` : ""}${savingsTable(card)}`).join("")}
      <p style="${NOTE}">
        휘발유 ${won(FUEL_PRICES[FUEL_TYPE])}/L(${FUEL_PRICES.lastUpdated} Opinet 전국 평균) 기준이며 전월 실적 조건은 채웠다고 가정합니다.
        ${lead.discount.brandRestriction.length > 0 ? `${lead.discount.brandRestriction.join("·")} 주유소에서 주유한 경우입니다. ` : ""}
        연간 절약액 = (월 할인 - 연회비 / 12) × 12. "(한도)"는 월 할인 한도에 걸린 구간입니다.
      </p>

      <div style="${CALLOUT}">
        <strong>실적 조건 확인 필수</strong><br>
        ${lead.name}의 할인은 전월 실적 ${won(spendTiers(lead)[0].minSpend)} 이상이어야 적용됩니다.
        이 조건을 못 채운 달에는 할인 없이 연회비만 부담하게 됩니다.
      </div>

      <h2 style="${H2}">3. 연회비를 넘기는 주유비</h2>
      ${cards.map(breakEvenText).join("")}

      <h2 style="${H2}">4. 주유 할인카드 선택 체크리스트</h2>
      <ul style="${UL}">
        <li style="${LI}"><strong>실적 조건</strong>: 전월 사용액 기준(이 서비스의 주유카드 ${FUEL_CARDS.length}장은 최저 구간 ${scopeRange(minSpends)})</li>
        <li style="${LI}"><strong>할인 한도</strong>: 월 최대 할인액(같은 ${FUEL_CARDS.length}장 기준 ${scopeRange(caps)})</li>
        <li style="${LI}"><strong>제휴 주유소</strong>: SK·GS·현대오일뱅크·S-Oil 등 중 특정 브랜드 제한 여부</li>
        <li style="${LI}"><strong>연회비</strong>: 할인액이 연회비를 초과해야 실익 발생</li>
        <li style="${LI}"><strong>추가 혜택</strong>: 카페·편의점·대중교통 등 생활업종 결합 여부</li>
      </ul>

      <h2 style="${H2}">5. 자주 묻는 질문 (FAQ)</h2>

      <h3 style="${H3}">Q1. ${label} 주유카드 실적은 주유만으로 채울 수 있나요?</h3>
      <p style="${P}">
        대부분의 카드에서 실적 인정 금액은 전체 결제액 기준이며, 주유 외 생활업종 결제도 포함됩니다.
        단, 세금·공과금·상품권·포인트 사용은 실적에서 제외되므로 카드사 약관을 확인해야 합니다.
      </p>

      <h3 style="${H3}">Q2. 연회비 대비 절약액이 남나요?</h3>
      <p style="${P}">${faqSavingsAnswer(lead)}</p>

      <h3 style="${H3}">Q3. 주유 카드와 다른 할인카드를 중복 사용할 수 있나요?</h3>
      <p style="${P}">
        네. 주유는 주유 특화 카드로, 생활비는 다른 포인트·캐시백 카드로 분리 사용하는 것이 가장 효율적입니다.
        단, 카드별 실적 조건을 모두 채울 수 있는지 확인이 필요합니다.
      </p>

      <h2 style="${H2}">6. 다른 카드사 비교</h2>
      <ul style="${UL}">
        ${otherIssuers(slug)}
        <li style="${LI}"><a href="/card/fuel-card">전체 주유카드 비교</a></li>
      </ul>

      <p style="font-size:12px;color:hsl(var(--muted-foreground));margin-top:24px;">
        ※ 카드 조건은 ${CARD_BENEFIT_DATA_VERIFIED_AT}에 ${label} 공식 페이지와 대조한 데이터이며,
        혜택·한도는 카드사의 정책에 따라 변경될 수 있습니다. 최종 가입 조건은 ${label} 공식 페이지에서 확인하세요.
      </p>
    </article>`;
}
