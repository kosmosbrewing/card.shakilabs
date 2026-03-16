export type AffiliateItem = {
  label: string;
  href: string;
  description: string;
};

export const AFFILIATE_DISCLOSURE_TEXT =
  "이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.";

function buildAffiliateItem(label: string, rawHref: string | undefined, description: string): AffiliateItem | null {
  const href = rawHref?.trim();
  if (!href) return null;

  return { label, href, description };
}

const maybeFuelAffiliateItems = [
  buildAffiliateItem(
    "주유 할인카드",
    import.meta.env.VITE_COUPANG_FUEL_CARD_URL,
    "비교 결과를 본 뒤 실제 발급 상품 구성을 확인하세요."
  ),
  buildAffiliateItem(
    "주유 쿠폰·주유권",
    import.meta.env.VITE_COUPANG_FUEL_VOUCHER_URL,
    "주유비 절약에 바로 쓸 수 있는 상품만 모았습니다."
  ),
];

export const fuelAffiliateItems = maybeFuelAffiliateItems.filter((item): item is AffiliateItem => item !== null);
