export interface CompareSource {
  name: string;
  url: string;
  basis: string;
}

export const SOURCE_VERIFIED_AT = "2026-03-11";

const OPINET_MAIN = "https://www.opinet.co.kr/user/main/opinetIntro.do";
const OPINET_GUIDE = "https://www.opinet.co.kr/user/dopds/dopDs_4.do";
const CUSTOMS_TAX = "https://www.customs.go.kr/kcs/ad/tax/ItemTaxCalculation.do";
const CUSTOMS_MAIN = "https://customs.go.kr/kcs/main.do";
const SMBS_MAIN = "https://www.smbs.biz/";
const KOREAN_AIR_MAIN = "https://www.koreanair.com/";
const ASIANA_MAIN = "https://flyasiana.com/";

export const FUEL_COMPARE_SOURCES: CompareSource[] = [
  { name: "Opinet", url: OPINET_MAIN, basis: "전국 평균 유가 공개" },
  { name: "Opinet", url: OPINET_GUIDE, basis: "가격조사 및 공개기준" },
  { name: "현대카드", url: "https://www.hyundaicard.com/", basis: "카드상품·혜택 안내" },
  { name: "신한카드 Mr.Life", url: "https://www.shinhancard.com/conts/person/card_info/major/benefit/propose/1270468_31350.jsp", basis: "공식 혜택 안내" },
  { name: "KB국민 탄탄대로 올쇼핑", url: "https://m.kbcard.com/BON/DVIEW/MBEM0009", basis: "공식 혜택 안내" },
  { name: "삼성카드 taptap O", url: "https://www.samsungcard.com/personal/card/taptap/UHPPCA0209M0.jsp", basis: "공식 혜택 안내" },
  { name: "롯데카드 LOCA 365", url: "https://m.lottecard.co.kr/app/LPBNFOA_V100.lc", basis: "공식 혜택 안내" },
  { name: "하나카드", url: "https://www.hanacard.co.kr/", basis: "카드상품·혜택 안내" },
];

export const ANNUAL_FEE_SOURCES: CompareSource[] = [
  { name: "현대카드", url: "https://www.hyundaicard.com/", basis: "카드상품·혜택 안내" },
  { name: "신한카드 Mr.Life", url: "https://www.shinhancard.com/conts/person/card_info/major/benefit/propose/1270468_31350.jsp", basis: "공식 혜택 안내" },
  { name: "KB국민 탄탄대로 올쇼핑", url: "https://m.kbcard.com/BON/DVIEW/MBEM0009", basis: "공식 혜택 안내" },
  { name: "삼성카드 taptap O", url: "https://www.samsungcard.com/personal/card/taptap/UHPPCA0209M0.jsp", basis: "공식 혜택 안내" },
  { name: "롯데카드 LOCA 365", url: "https://m.lottecard.co.kr/app/LPBNFOA_V100.lc", basis: "공식 혜택 안내" },
  { name: "하나카드", url: "https://www.hanacard.co.kr/", basis: "카드상품·혜택 안내" },
  { name: "우리카드", url: "https://pc.wooricard.com/", basis: "카드상품·혜택 안내" },
  { name: "NH농협카드", url: "https://card.nonghyup.com/", basis: "카드상품·혜택 안내" },
];

export const OVERSEAS_COMPARE_SOURCES: CompareSource[] = [
  { name: "서울외국환중개", url: SMBS_MAIN, basis: "매매기준율 참고" },
  { name: "현대카드", url: "https://www.hyundaicard.com/", basis: "해외이용·카드상품 안내" },
  { name: "신한카드", url: "https://www.shinhancard.com/", basis: "해외이용·카드상품 안내" },
  { name: "KB국민카드", url: "https://card.kbcard.com/", basis: "해외이용·카드상품 안내" },
  { name: "삼성카드", url: "https://www.samsungcard.com/", basis: "해외이용·카드상품 안내" },
  { name: "롯데카드", url: "https://www.lottecard.co.kr/", basis: "해외이용·카드상품 안내" },
  { name: "하나카드 트래블로그", url: "https://m.hanacard.co.kr/mobile_web/landing/travlog/j24_snsad", basis: "공식 상품 안내" },
  { name: "트래블월렛", url: "https://www.travel-wallet.com/", basis: "공식 서비스 안내" },
  { name: "토스뱅크", url: "https://www.tossbank.com/", basis: "카드·해외이용 안내" },
  { name: "우리카드", url: "https://pc.wooricard.com/", basis: "해외이용·체크카드 안내" },
  { name: "카카오뱅크", url: "https://www.kakaobank.com/products/checkcard", basis: "체크카드 안내" },
];

export const DUTY_FREE_SOURCES: CompareSource[] = [
  { name: "관세청", url: CUSTOMS_TAX, basis: "여행자 휴대품 예상세액 조회" },
  { name: "관세청", url: CUSTOMS_MAIN, basis: "면세범위·관세환율 정보" },
];

export const MILEAGE_SOURCES: CompareSource[] = [
  { name: "대한항공", url: KOREAN_AIR_MAIN, basis: "스카이패스·보너스 항공권 안내" },
  { name: "아시아나항공", url: ASIANA_MAIN, basis: "아시아나클럽·보너스 항공권 안내" },
];

export const ABOUT_PAGE_SOURCES: CompareSource[] = [
  { name: "Opinet", url: OPINET_MAIN, basis: "유가 정보" },
  { name: "서울외국환중개", url: SMBS_MAIN, basis: "환율 참고" },
  { name: "관세청", url: CUSTOMS_TAX, basis: "휴대품 예상세액 조회" },
  { name: "대한항공", url: KOREAN_AIR_MAIN, basis: "마일리지 안내" },
  { name: "아시아나항공", url: ASIANA_MAIN, basis: "마일리지 안내" },
];
