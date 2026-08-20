export interface CardToolLink {
  path: string;
  title: string;
  description: string;
  /**
   * "언제 이 계산기를 쓰는가" — 계산기가 무엇을 하는지(description)가 아니라
   * 어떤 상황에서 결론이 갈리는지를 적는다. 허브(/all)가 링크 목록에 그치지 않고
   * 도구 선택 자체를 안내하도록 만드는 문장이다.
   * scripts/prerender-card-hub.mjs가 같은 문장을 정적 HTML로도 내보낸다
   * (cardNavigation.test.ts가 두 곳의 동기화를 검사한다).
   */
  whenToUse: string;
  /**
   * "무엇을 넣으면 무엇이 나오는가" — 실제 입력 필드와 결과 지표를 한 문장으로 적는다.
   * whenToUse가 도구를 고르게 한다면 이 문장은 계산기를 열기 전에 필요한 입력값이
   * 손에 있는지 확인하게 한다. 문구는 계산기 화면의 입력 라벨·결과 카드 라벨에서
   * 뽑으므로 계산기 UI를 바꾸면 여기도 같이 고쳐야 한다.
   * scripts/prerender-card-hub.mjs가 같은 문장을 정적 HTML로도 내보낸다
   * (cardNavigation.test.ts가 두 곳의 동기화를 검사한다).
   */
  inputsOutputs: string;
}

export interface CardToolGroup {
  key: string;
  title: string;
  description: string;
  tools: readonly CardToolLink[];
}

export const CARD_TOOL_GROUPS: readonly CardToolGroup[] = [
  {
    key: "benefit",
    title: "혜택·고정지출",
    description: "카드 혜택이 실제 지출보다 큰지 확인하세요.",
    tools: [
      {
        path: "/fuel-card",
        title: "주유 카드 비교",
        description: "월 주유비에 맞는 카드별 연간 순혜택을 비교합니다.",
        whenToUse:
          "매달 주유비를 10만원 이상 쓰는데 어떤 카드가 유리한지 모를 때. 리터당 할인이 큰 카드라도 월 할인 한도에 먼저 걸리면 주유를 더 해도 절약액은 늘지 않으므로, 할인율이 아니라 한도까지 반영한 연간 절약액으로 골라야 합니다.",
        inputsOutputs:
          "월 주유비와 유종, 자주 가는 주유소를 넣으면 카드별 월 절약액·연 절약액과 할인을 반영한 체감 유가, 전월 실적 조건이 순위표로 나옵니다.",
      },
      {
        path: "/min-spend",
        title: "전월 실적",
        description: "혜택을 받기 위해 필요한 최소 추가 지출을 계산합니다.",
        whenToUse:
          "실적을 채우려고 평소 안 하던 소비를 하고 있을 때. 실적 미달로 놓치는 혜택보다 억지 지출이 더 크면 그 카드는 손해이므로, 추가 지출을 뺀 순혜택이 양수인지부터 확인하세요.",
        inputsOutputs:
          "월 주유비와 월 생활비를 넣으면 카드별 실적 충족 여부와 부족액, 월 할인액, 추가 지출을 뺀 순혜택이 순위표로 나옵니다.",
      },
      {
        path: "/annual-fee",
        title: "연회비 회수",
        description: "연간 혜택이 연회비를 회수하는 시점을 확인합니다.",
        whenToUse:
          "연회비가 비싼 프리미엄 카드를 발급할지 망설일 때, 또는 갱신을 앞두고 유지할지 정할 때. 연간 혜택에서 연회비를 뺀 값이 음수면 혜택이 아무리 화려해도 유지할 이유가 없습니다.",
        inputsOutputs:
          "카테고리별 월 카드 지출을 넣으면 카드별 월 혜택과 연 순혜택, 연회비를 회수하는 데 걸리는 개월 수가 나옵니다.",
      },
      {
        path: "/credit-vs-debit",
        title: "신용 vs 체크",
        description: "소비 패턴별 소득공제와 혜택 차이를 비교합니다.",
        whenToUse:
          "연말정산 소득공제와 카드 할인 중 어느 쪽이 큰지 헷갈릴 때. 체크카드는 공제율이 높고 신용카드는 부가 혜택이 크므로, 총급여 대비 카드 사용액이 공제 문턱을 넘는지에 따라 답이 뒤집힙니다.",
        inputsOutputs:
          "월 카드 사용액과 신용카드 연회비, 두 카드의 혜택률을 넣으면 신용·체크 각각의 연간 순혜택과 어느 쪽이 유리한지가 나옵니다.",
      },
    ],
  },
  {
    key: "overseas",
    title: "해외·여행 결제",
    description: "출국과 직구 전에 수수료와 세금을 점검하세요.",
    tools: [
      {
        path: "/overseas-payment",
        title: "해외결제 수수료",
        description: "DCC와 카드사 수수료를 포함한 결제 비용을 비교합니다.",
        whenToUse:
          "출국 전에 어떤 카드를 들고 갈지 정할 때. 현지 단말기가 권하는 원화(DCC) 결제는 가맹점 환전 수수료가 얹히므로, 같은 카드라도 결제 통화를 무엇으로 고르느냐에서 손해가 갈립니다.",
        inputsOutputs:
          "결제 금액과 통화를 고르면 카드별 총 수수료와 현지통화로 결제했을 때의 실부담액, 원화(DCC)로 승인했을 때 더 나가는 금액이 나옵니다.",
      },
      {
        path: "/duty-free",
        title: "면세 한도",
        description: "면세 한도 초과 시 예상 관세를 계산합니다.",
        whenToUse:
          "입국 전 면세점·현지 쇼핑 금액이 1인 기본 면세 한도 800달러를 넘을 것 같을 때. 초과분에는 품목별 관세와 부가세 10%가 붙고, 자진신고하면 세액 일부를 감면받으므로 신고 여부를 미리 정해야 합니다.",
        inputsOutputs:
          "구매 예상 금액과 물품 카테고리를 넣으면 면세 한도 초과분과 간이세율·일반세율 기준 최종 세액, 실효 세율, 세금까지 더한 총 원화 비용이 나옵니다.",
      },
      {
        path: "/customs",
        title: "해외직구 관세",
        description: "직구 품목과 금액 기준 예상 세금을 확인합니다.",
        whenToUse:
          "해외 쇼핑몰 장바구니를 결제하기 직전에. 목록통관 면세 기준을 넘기면 배송비까지 과세표준에 들어가 최종 결제액이 크게 뛰므로, 주문을 나눌지 합칠지가 여기서 갈립니다.",
        inputsOutputs:
          "상품가와 배송비를 달러로 넣고 품목을 고르면 총 결제 금액과 관세·부가세로 나눈 예상 관부가세, 세금까지 더한 원화 착지가가 나옵니다.",
      },
      {
        path: "/mileage",
        title: "마일리지 가치",
        description: "노선별 항공 마일리지의 체감 가치를 비교합니다.",
        whenToUse:
          "쌓인 마일리지를 항공권으로 쓸지 좌석 승급에 쓸지 고를 때. 같은 마일이라도 노선과 좌석 등급에 따라 1마일의 원화 가치가 달라져, 단거리 이코노미 발권이 오히려 손해인 경우가 있습니다.",
        inputsOutputs:
          "항공사와 보유 마일리지, 좌석 등급을 고르면 노선별 필요 마일과 1마일 가치, 지금 보유량으로 발권 가능한 노선이 나옵니다.",
      },
    ],
  },
  {
    key: "payment",
    title: "포인트·결제 관리",
    description: "쌓인 포인트와 카드 이용기간을 놓치지 마세요.",
    tools: [
      {
        path: "/point-convert",
        title: "포인트 전환",
        description: "포인트 전환 비율과 실제 가치를 비교합니다.",
        whenToUse:
          "카드 포인트를 현금성으로 쓸지 항공·호텔로 넘길지 정할 때. 전환 비율이 좋아 보여도 최소 전환 단위와 소멸 예정일에 걸리면 실제로 건지는 금액이 줄어드니, 전환처별 실질 가치로 비교하세요.",
        inputsOutputs:
          "보유 포인트를 넣으면 전환처별 예상 환산가치와 실제로 넘어가는 전환 단위, 가장 가치가 높은 전환처가 순위로 나옵니다.",
      },
      {
        path: "/billing-cycle",
        title: "결제일 이용기간",
        description: "결제일별 카드 이용기간을 확인합니다.",
        whenToUse:
          "큰 지출을 언제 긁을지, 결제일을 며칠로 바꿀지 정할 때. 같은 금액이라도 이용기간 시작일 직후에 결제하면 청구까지 유예가 가장 길어지고, 하루 차이로 이번 달 청구서에 잡히기도 합니다.",
        inputsOutputs:
          "카드 사용일과 결제일을 고르면 청구 사이클 일수와 결제까지 남는 총 이용 가능 기간, 이용기간 시작일 직후에 썼을 때의 최대 유예일이 나옵니다.",
      },
    ],
  },
] as const;

export interface CardHomeEntry {
  path: string;
  situation: string;
  checkpoint: string;
  label: string;
}

// 홈은 카테고리 나열(/all)과 겹치지 않도록 "상황 → 계산기" 진입점만 노출한다.
// 정적 프리렌더(scripts/prerender-home.mjs)와 같은 순서를 유지한다.
export const CARD_HOME_ENTRIES: readonly CardHomeEntry[] = [
  { path: "/fuel-card", situation: "매달 주유비가 부담된다", checkpoint: "카드별 리터당 할인과 월 할인 한도", label: "주유 할인카드 비교" },
  { path: "/overseas-payment", situation: "해외여행·직구를 앞두고 있다", checkpoint: "해외수수료와 DCC 원화결제 손해액", label: "해외결제 수수료 비교" },
  { path: "/annual-fee", situation: "연회비가 아까운지 모르겠다", checkpoint: "연간 혜택이 연회비를 넘는 시점", label: "연회비 회수 계산" },
  { path: "/min-spend", situation: "실적 채우려 억지 소비를 한다", checkpoint: "실적 충족에 드는 추가 지출", label: "전월 실적 계산" },
  { path: "/point-convert", situation: "쌓인 포인트·마일리지가 있다", checkpoint: "전환처별 1포인트 실질 가치", label: "포인트 전환 비교" },
  { path: "/duty-free", situation: "면세 한도를 넘길 것 같다", checkpoint: "초과분 예상 관세와 부가세", label: "면세 한도 계산" },
] as const;
