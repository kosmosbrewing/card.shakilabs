import { splitLongParagraphs } from "./split-long-paragraphs.mjs";
// Body of the /fuel-card/monthly/<amount> pages, computed from the card data.
//
// Why: the hand-written version assumed a flat "average 5%" discount for its
// headline savings, recommended cards per spend bracket that the engine does
// not rank first (Hyundai O at 300k/500k), and printed a four-card table with
// its own formulas - including "taptap O", which is not a fuel card in the data,
// and a 20,000 won KB cap where the data says 80,000. Every number below now
// comes from fuelResult (the engine mirror) over all mirrored fuel cards, the
// same formula the issuer pages use. src/seo/fuelIssuerContent.test.ts
// recomputes the table with src/utils/calculator.ts.
//
// NOTE: comments here are intentionally ASCII-only. scripts/ is scanned by
// font-subset-config.mjs and every character becomes part of the shipped font
// subset. Korean strings are page copy and belong in the subset.
import { CARD_BENEFIT_DATA_VERIFIED_AT } from "./card-data-derived.mjs";
import { FUEL_PRICES } from "./card-data-mirror.mjs";
import {
  FUEL_TYPE,
  cardDisplayName,
  discountLabel,
  fleetScope,
  issuerLabelOf,
  rankedAt,
  won,
  wonRange,
} from "./fuel-issuer-facts.mjs";

const ARTICLE = "padding:24px 0;line-height:1.75;font-size:15px;color:hsl(var(--foreground));";
const H1 = "font-size:28px;line-height:1.3;margin:0 0 16px;color:hsl(var(--foreground));";
const H2 = "font-size:20px;line-height:1.35;margin:28px 0 10px;padding-bottom:6px;border-bottom:2px solid hsl(var(--border));color:hsl(var(--foreground));";
const H3 = "font-size:16px;line-height:1.4;margin:18px 0 6px;color:hsl(var(--foreground));";
const P = "margin:0 0 10px;";
const TABLE = "width:100%;border-collapse:collapse;margin:10px 0 16px;font-size:14px;";
const TH = "padding:8px 10px;background:hsl(var(--muted));text-align:left;border:1px solid hsl(var(--border));color:hsl(var(--foreground));font-weight:600;";
const TD = "padding:8px 10px;border:1px solid hsl(var(--border));";
const UL = "margin:0 0 12px 20px;padding:0;";
const LI = "margin-bottom:4px;";
const CALLOUT = "background:hsl(var(--accent));border-left:4px solid hsl(var(--primary));padding:12px 14px;margin:12px 0 16px;border-radius:4px;";

const named = (row) => `${cardDisplayName(row.card)}(연 ${won(row.annualNet)})`;

function savingsTable(rows) {
  const head = ["카드사", "카드명", "할인 방식", "월 할인", "연회비 뺀 연간 절약액"];
  const body = rows
    .map((row) => {
      const brands = row.card.discount.brandRestriction;
      const cells = [
        issuerLabelOf(row.card),
        row.card.name,
        `${discountLabel(row.card)}${brands.length > 0 ? ` · ${brands.join("·")} 주유소만` : ""}`,
        `${won(row.monthlyDiscount)}${row.isCapExceeded ? " (한도)" : ""}`,
        won(row.annualNet),
      ];
      return `<tr data-card-id="${row.card.id}">${cells.map((cell) => `<td style="${TD}">${cell}</td>`).join("")}</tr>`;
    })
    .join("");
  return (
    `<table data-monthly-savings style="${TABLE}"><thead><tr>${head.map((cell) => `<th style="${TH}">${cell}</th>`).join("")}</tr></thead>` +
    `<tbody>${body}</tbody></table>`
  );
}

function rankingText(rows, amountLabel) {
  const top = rows.slice(0, 3);
  const restricted = top.filter((row) => row.card.discount.brandRestriction.length > 0);
  const capped = rows.filter((row) => row.isCapExceeded).map((row) => cardDisplayName(row.card));
  return (
    `<p style="${P}">월 ${amountLabel}원에서 연회비를 뺀 연간 절약액 순위는 ` +
    `${top.map((row, index) => `${index + 1}위 ${named(row)}`).join(", ")}입니다.` +
    `${restricted.map((row) => ` 단, ${cardDisplayName(row.card)} 할인은 ${row.card.discount.brandRestriction.join("·")} 주유소에서만 적용됩니다.`).join("")}` +
    ` 이 금액에서 월 할인 한도에 걸리는 카드는 ${capped.length > 0 ? `${capped.join(", ")}입니다` : "없습니다"}.</p>`
  );
}

function feeText(rows) {
  const { fees } = fleetScope();
  const byDiscount = [...rows].sort((a, b) => b.annualNet + b.card.annualFee - (a.annualNet + a.card.annualFee))[0];
  const byNet = rows[0];
  return (
    `<p style="${P}">카드 ${rows.length}장의 연회비는 ${wonRange(fees)}입니다. ` +
    `연회비를 빼기 전 연간 할인이 가장 큰 카드는 ${cardDisplayName(byDiscount.card)}(연 ${won(byDiscount.annualNet + byDiscount.card.annualFee)})이고, ` +
    `연회비를 뺀 뒤에는 ${named(byNet)}입니다. ` +
    `${byDiscount.card.id === byNet.card.id ? "이 금액에서는 연회비가 1위를 바꾸지 않습니다." : "이 금액에서는 연회비 때문에 1위가 바뀝니다."}</p>`
  );
}

function minSpendAnswer(amount, amountLabel) {
  const { count, minSpends } = fleetScope();
  const met = minSpends.filter((minSpend) => amount >= minSpend).length;
  const reach =
    met === count
      ? `주유비 ${amountLabel}원만으로 ${count}장 모두 최저 조건을 채웁니다.`
      : `주유비 ${amountLabel}원만으로 최저 조건을 채우는 카드는 ${count}장 중 ${met}장이므로, 나머지는 생활비·외식비·교통비를 같은 카드로 결제해 실적을 채워야 합니다.`;
  return `이 서비스의 주유카드 ${count}장은 전월 실적 조건이 최저 구간 ${wonRange(minSpends)}입니다. ${reach}`;
}

function buildFuelMonthlyContentRaw(amount) {
  const amountLabel = amount.toLocaleString("ko-KR");
  const rows = rankedAt(amount);
  const best = rows[0];
  const worst = rows[rows.length - 1];

  return `
    <article data-seo-prerender="fuel-card-monthly" style="${ARTICLE}">
      <nav aria-label="breadcrumb" style="font-size:13px;color:hsl(var(--muted-foreground));margin-bottom:10px;">
        <a href="/card/fuel-card" style="color:hsl(var(--muted-foreground));text-decoration:none;">홈</a> ›
        <a href="/card/fuel-card" style="color:hsl(var(--muted-foreground));text-decoration:none;">주유 할인카드</a> ›
        월 ${amountLabel}원
      </nav>

      <h1 style="${H1}">월 주유비 ${amountLabel}원 최적 할인카드 (2026)</h1>

      <p style="${P}">
        월 주유비 <strong>${amountLabel}원</strong>을 카드 ${rows.length}장에 넣으면 연회비를 뺀 연간 절약액 1위는
        <strong>${cardDisplayName(best.card)}</strong>(연 <strong style="color:hsl(var(--savings));">${won(best.annualNet)}</strong>)이고,
        최하위는 ${named(worst)}입니다.
      </p>

      <p style="${P}">
        휘발유 ${won(FUEL_PRICES[FUEL_TYPE])}/L(${FUEL_PRICES.lastUpdated} Opinet 전국 평균)로 계산했으며 전월 실적 조건은 채웠다고 가정합니다.
        표의 절약액은 카드사별 상세 페이지와 같은 공식, (월 할인 - 연회비 / 12) × 12입니다.
      </p>

      <h2 style="${H2}">1. 이 주유비 구간의 절약액 순위</h2>
      ${rankingText(rows, amountLabel)}

      <h2 style="${H2}">2. 카드사별 예상 절약액 비교</h2>
      ${savingsTable(rows)}

      <div style="${CALLOUT}">
        <strong>절약액 계산 기준</strong><br>
        위 표는 계산기와 같은 카드 데이터(${CARD_BENEFIT_DATA_VERIFIED_AT} 확인)와 공식으로 계산한 값입니다.
        실제 할인액은 전월 실적·주유소 브랜드 제한·월 한도에 따라 달라지며,
        정확한 값은 카드사 공식 시뮬레이터에서 확인할 수 있습니다.
      </div>

      <h2 style="${H2}">3. 연회비 대비 순절약액</h2>
      ${feeText(rows)}

      <h2 style="${H2}">4. 자주 묻는 질문</h2>

      <h3 style="${H3}">Q1. 월 ${amountLabel}원이면 실적 조건을 채울 수 있나요?</h3>
      <p style="${P}">${minSpendAnswer(amount, amountLabel)}</p>

      <h3 style="${H3}">Q2. 카드 여러 장을 쓰면 할인이 더 되나요?</h3>
      <p style="${P}">
        카드별로 실적 조건을 모두 채울 수 있다면 유리할 수 있으나, 실적을 분산해 놓치면 오히려 손해입니다.
        일반적으로 메인 카드 1장 + 서브 카드 1장 조합이 관리 면에서 효율적입니다.
      </p>

      <h3 style="${H3}">Q3. 할인율과 한도 중 뭐가 더 중요한가요?</h3>
      <p style="${P}">
        월 주유비가 적으면 "할인율"이, 많으면 "한도"가 중요합니다.
        월 20만원 × 10% = 2만원이지만 한도가 1만원이면 의미 없습니다.
      </p>

      <h2 style="${H2}">5. 관련 페이지</h2>
      <ul style="${UL}">
        <li style="${LI}"><a href="/card/fuel-card">전체 주유카드 비교</a></li>
        <li style="${LI}"><a href="/card/annual-fee">연회비 비교</a></li>
        <li style="${LI}"><a href="/card/min-spend">최소 실적 조건</a></li>
      </ul>

      <p style="font-size:13px;color:hsl(var(--muted-foreground));margin-top:24px;">
        ※ 본 계산은 휘발유·전월 실적 충족을 가정한 계산값이며, 실제 할인액은 카드사·주유소·실적 조건에 따라 다를 수 있습니다.
      </p>
    </article>`;
}

// v8b: 문단 ≤250자 — 빌더 반환 HTML의 긴 <p>를 문장 경계에서 나눈다(정적·런타임 공통)
export function buildFuelMonthlyContent(amount) {
  return splitLongParagraphs(buildFuelMonthlyContentRaw(amount));
}
