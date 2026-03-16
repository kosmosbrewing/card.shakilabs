import { describe, expect, it } from "vitest";
import { OVERSEAS_CARDS } from "@/data/overseasCards";
import { calculateOverseasPayment, formatFeeRate } from "@/utils/overseasCalculator";

function getCard(id: string) {
  const card = OVERSEAS_CARDS.find((item) => item.id === id);
  if (!card) throw new Error(`Card not found: ${id}`);
  return card;
}

describe("overseasCalculator", () => {
  it("keeps a fee-free debit card cost equal to the base exchange amount", () => {
    const result = calculateOverseasPayment(getCard("hana-travelog-debit"), {
      currency: "USD",
      foreignAmount: 100,
      dccMarkupRate: 0.05,
    });

    expect(result.baseKrwAmount).toBe(138000);
    expect(result.cardFeeAmount).toBe(0);
    expect(result.localCurrencyNet).toBe(138000);
    expect(result.dccTotal).toBe(144900);
    expect(result.dccDifference).toBe(6900);
    expect(formatFeeRate(result.card)).toBe("수수료 면제");
  });

  it("marks benefit cards with unmet minimum spend as warnings", () => {
    const result = calculateOverseasPayment(getCard("kb-wishtone"), {
      currency: "USD",
      foreignAmount: 100,
      dccMarkupRate: 0.05,
    });

    expect(result.cardFeeAmount).toBe(1380);
    expect(result.benefitAmount).toBe(976);
    expect(result.localCurrencyNet).toBe(138404);
    expect(result.isMinSpendWarning).toBe(true);
  });
});
