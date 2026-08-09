// Static prerender of the /all directory hub.
//
// The "whenToUse" copy below is duplicated from src/data/cardNavigation.ts on
// purpose: scripts/ is plain .mjs and cannot import the typed source. The build
// is not free to drift, though -- src/data/cardNavigation.test.ts reads this
// file as text and fails when a whenToUse sentence here stops matching the one
// the app renders.
//
// Why the hub carries this at all: a bare list of links is a thin page. The
// directory has to help pick a tool, which means saying when each calculator
// changes the answer, not just what it computes.
const groups = [
  {
    title: "혜택·고정지출",
    description: "카드 혜택이 실제 지출보다 큰지 확인하세요.",
    tools: [
      [
        "/fuel-card",
        "주유 카드 비교",
        "매달 주유비를 10만원 이상 쓰는데 어떤 카드가 유리한지 모를 때. 리터당 할인이 큰 카드라도 월 할인 한도에 먼저 걸리면 주유를 더 해도 절약액은 늘지 않으므로, 할인율이 아니라 한도까지 반영한 연간 절약액으로 골라야 합니다.",
      ],
      [
        "/min-spend",
        "전월 실적",
        "실적을 채우려고 평소 안 하던 소비를 하고 있을 때. 실적 미달로 놓치는 혜택보다 억지 지출이 더 크면 그 카드는 손해이므로, 추가 지출을 뺀 순혜택이 양수인지부터 확인하세요.",
      ],
      [
        "/annual-fee",
        "연회비 회수",
        "연회비가 비싼 프리미엄 카드를 발급할지 망설일 때, 또는 갱신을 앞두고 유지할지 정할 때. 연간 혜택에서 연회비를 뺀 값이 음수면 혜택이 아무리 화려해도 유지할 이유가 없습니다.",
      ],
      [
        "/credit-vs-debit",
        "신용카드 vs 체크카드",
        "연말정산 소득공제와 카드 할인 중 어느 쪽이 큰지 헷갈릴 때. 체크카드는 공제율이 높고 신용카드는 부가 혜택이 크므로, 총급여 대비 카드 사용액이 공제 문턱을 넘는지에 따라 답이 뒤집힙니다.",
      ],
    ],
  },
  {
    title: "해외·여행 결제",
    description: "출국과 직구 전에 수수료와 세금을 점검하세요.",
    tools: [
      [
        "/overseas-payment",
        "해외결제 수수료",
        "출국 전에 어떤 카드를 들고 갈지 정할 때. 현지 단말기가 권하는 원화(DCC) 결제는 가맹점 환전 수수료가 얹히므로, 같은 카드라도 결제 통화를 무엇으로 고르느냐에서 손해가 갈립니다.",
      ],
      [
        "/duty-free",
        "면세 한도",
        "입국 전 면세점·현지 쇼핑 금액이 1인 기본 면세 한도 800달러를 넘을 것 같을 때. 초과분에는 품목별 관세와 부가세 10%가 붙고, 자진신고하면 세액 일부를 감면받으므로 신고 여부를 미리 정해야 합니다.",
      ],
      [
        "/customs",
        "해외직구 관세",
        "해외 쇼핑몰 장바구니를 결제하기 직전에. 목록통관 면세 기준을 넘기면 배송비까지 과세표준에 들어가 최종 결제액이 크게 뛰므로, 주문을 나눌지 합칠지가 여기서 갈립니다.",
      ],
      [
        "/mileage",
        "마일리지 가치",
        "쌓인 마일리지를 항공권으로 쓸지 좌석 승급에 쓸지 고를 때. 같은 마일이라도 노선과 좌석 등급에 따라 1마일의 원화 가치가 달라져, 단거리 이코노미 발권이 오히려 손해인 경우가 있습니다.",
      ],
    ],
  },
  {
    title: "포인트·결제 관리",
    description: "쌓인 포인트와 카드 이용기간을 놓치지 마세요.",
    tools: [
      [
        "/point-convert",
        "포인트 전환",
        "카드 포인트를 현금성으로 쓸지 항공·호텔로 넘길지 정할 때. 전환 비율이 좋아 보여도 최소 전환 단위와 소멸 예정일에 걸리면 실제로 건지는 금액이 줄어드니, 전환처별 실질 가치로 비교하세요.",
      ],
      [
        "/billing-cycle",
        "결제일 이용기간",
        "큰 지출을 언제 긁을지, 결제일을 며칠로 바꿀지 정할 때. 같은 금액이라도 이용기간 시작일 직후에 결제하면 청구까지 유예가 가장 길어지고, 하루 차이로 이번 달 청구서에 잡히기도 합니다.",
      ],
    ],
  },
];

const PICK_STEPS = [
  [
    "고정 지출부터 적는다",
    "주유비, 통신비, 해외 구독료처럼 매달 반복되는 금액이 절약액의 크기를 결정합니다. 가끔 쓰는 항목의 높은 할인율은 연간으로 보면 거의 영향이 없습니다.",
  ],
  [
    "한도와 실적을 함께 본다",
    "할인율이 높아도 월 할인 한도가 낮으면 체감 절약은 한도에서 멈춥니다. 전월 실적 조건이 있으면 실적을 채우는 데 드는 추가 지출까지 비용으로 넣어야 합니다.",
  ],
  [
    "연회비를 빼고 결론을 낸다",
    "연간 절약액에서 연회비를 뺀 순혜택이 실제 이득입니다. 순혜택이 음수면 혜택 구성이 좋아 보여도 연회비가 낮은 카드가 낫습니다.",
  ],
];

export function buildCardHubContent() {
  const sections = groups
    .map(
      (group) => `
    <section style="margin-top:24px;">
      <h2 style="font-size:20px;margin:0 0 6px;">${group.title}</h2>
      <p style="margin:0 0 10px;color:#475569;">${group.description}</p>
      <ul style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:8px;list-style:none;margin:0;padding:0;">
        ${group.tools
          .map(
            ([path, label, whenToUse]) =>
              `<li style="border:1px solid #cbd5e1;padding:12px;"><a href="/card${path}" style="text-decoration:none;color:#0f172a;font-weight:600;">${label} 계산하기 →</a><p style="margin:6px 0 0;color:#475569;font-size:14px;"><strong>언제 쓰나요?</strong> ${whenToUse}</p></li>`,
          )
          .join("")}
      </ul>
    </section>`,
    )
    .join("");

  const steps = PICK_STEPS.map(
    ([heading, body]) =>
      `<li style="margin-bottom:6px;"><strong>${heading}</strong> — ${body}</li>`,
  ).join("");

  return `<article data-seo-prerender="card-tool-directory" style="max-width:920px;margin:0 auto;padding:24px 16px;line-height:1.65;">
    <h1 style="font-size:28px;margin:0 0 10px;">목적별 카드 계산기 전체 보기</h1>
    <p style="margin:0 0 10px;color:#475569;">혜택 회수, 해외 결제, 포인트 관리 중 지금 필요한 결정과 가까운 도구에서 시작하세요. 각 도구에는 "언제 쓰는가"를 함께 적어 두었으니, 계산기 이름이 아니라 지금 겪고 있는 상황과 맞는 쪽을 고르면 됩니다.</p>
    <p style="margin:0;color:#475569;">카드 혜택은 할인율만 보면 실제 절약액을 크게 벗어납니다. 월 할인 한도, 전월 실적 조건, 연회비 세 가지가 함께 걸리기 때문입니다. 아래 계산기는 모두 이 세 가지를 반영한 순혜택 기준으로 결과를 냅니다. 회원가입이나 카드번호 입력 없이 금액만 넣으면 됩니다.</p>
    ${sections}
    <section style="margin-top:28px;">
      <h2 style="font-size:20px;margin:0 0 6px;">어떤 계산기부터 열어야 하나요</h2>
      <p style="margin:0 0 10px;color:#475569;">도구가 여러 개라 어디서 시작할지 모르겠다면 아래 순서대로 확인하면 대부분의 카드 선택이 끝납니다.</p>
      <ol style="margin:0 0 12px 20px;padding:0;color:#475569;">${steps}</ol>
      <p style="margin:0;color:#475569;font-size:14px;">계산 결과는 입력한 금액과 공개된 카드 상품 조건에 근거한 추정치입니다. 실제 청구액과 다를 수 있으며 최종 조건은 각 카드사 공식 안내에서 확인해야 합니다.</p>
    </section>
  </article>`;
}

export function appendCardHubLink(route, content) {
  if (!content || route === "/all") return content;
  return `${content}<nav data-seo-prerender="card-directory-link" style="max-width:920px;margin:0 auto;padding:0 16px 24px;"><a href="/card/all">카드 계산기 전체 보기 →</a></nav>`;
}
