const groups = [
  {
    title: "혜택·고정지출",
    description: "카드 혜택이 실제 지출보다 큰지 확인하세요.",
    tools: [
      ["/fuel-card", "주유 카드 비교"],
      ["/min-spend", "전월 실적"],
      ["/annual-fee", "연회비 회수"],
      ["/credit-vs-debit", "신용카드 vs 체크카드"],
    ],
  },
  {
    title: "해외·여행 결제",
    description: "출국과 직구 전에 수수료와 세금을 점검하세요.",
    tools: [
      ["/overseas-payment", "해외결제 수수료"],
      ["/duty-free", "면세 한도"],
      ["/customs", "해외직구 관세"],
      ["/mileage", "마일리지 가치"],
    ],
  },
  {
    title: "포인트·결제 관리",
    description: "쌓인 포인트와 카드 이용기간을 놓치지 마세요.",
    tools: [
      ["/point-convert", "포인트 전환"],
      ["/billing-cycle", "결제일 이용기간"],
    ],
  },
];

export function buildCardHubContent() {
  const sections = groups.map((group) => `
    <section style="margin-top:24px;">
      <h2 style="font-size:20px;margin:0 0 6px;">${group.title}</h2>
      <p style="margin:0 0 10px;color:#475569;">${group.description}</p>
      <ul style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:8px;list-style:none;margin:0;padding:0;">
        ${group.tools.map(([path, label]) => `<li><a href="/card${path}" style="display:block;border:1px solid #cbd5e1;padding:12px;text-decoration:none;color:#0f172a;">${label} 계산하기 →</a></li>`).join("")}
      </ul>
    </section>`).join("");

  return `<article data-seo-prerender="card-tool-directory" style="max-width:920px;margin:0 auto;padding:24px 16px;line-height:1.65;">
    <h1 style="font-size:28px;margin:0 0 10px;">목적별 카드 계산기 전체 보기</h1>
    <p style="margin:0;color:#475569;">혜택 회수, 해외 결제, 포인트 관리 중 지금 필요한 결정과 가까운 도구에서 시작하세요.</p>
    ${sections}
  </article>`;
}

export function appendCardHubLink(route, content) {
  if (!content || route === "/all") return content;
  return `${content}<nav data-seo-prerender="card-directory-link" style="max-width:920px;margin:0 auto;padding:0 16px 24px;"><a href="/card/all">카드 계산기 전체 보기 →</a></nav>`;
}
