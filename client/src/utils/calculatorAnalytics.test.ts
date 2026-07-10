import { afterEach, describe, expect, it, vi } from "vitest";
import { createCalculatorAnalytics } from "@/utils/calculatorAnalytics";

describe("calculatorAnalytics", () => {
  afterEach(() => vi.useRealTimers());

  it("마일리지 값 없이 계산 퍼널을 기록한다", () => {
    vi.useFakeTimers();
    const track = vi.fn();
    const analytics = createCalculatorAnalytics({
      calculatorId: () => "mileage_value",
      pagePath: () => "/card/mileage",
      track,
      debounceMs: 100,
    });

    analytics.recordInteraction();
    analytics.recordInteraction();
    vi.advanceTimersByTime(100);

    expect(track.mock.calls.map(([eventName]) => eventName)).toEqual([
      "calculator_start",
      "calculator_submit",
      "result_view",
    ]);
    expect(track.mock.calls[2]?.[1]).not.toHaveProperty("miles");
  });
});
