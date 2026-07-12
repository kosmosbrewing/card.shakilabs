import { describe, expect, it } from "vitest";
import {
  divergingBarWidth,
  normalizeSegments,
  positiveBarWidth,
  progressBarWidth,
} from "./chartMath";

describe("chartMath", () => {
  it("keeps positive bars on an honest zero baseline", () => {
    expect(positiveBarWidth(0, 100)).toBe(0);
    expect(positiveBarWidth(25, 100)).toBe(25);
    expect(positiveBarWidth(null, 100)).toBe(0);
  });

  it("uses one shared magnitude for both sides", () => {
    expect(divergingBarWidth(-50, 100)).toBe(25);
    expect(divergingBarWidth(100, 100)).toBe(50);
  });

  it("caps progress without inventing a minimum width", () => {
    expect(progressBarWidth(0)).toBe(0);
    expect(progressBarWidth(0.8)).toBe(80);
    expect(progressBarWidth(1.2)).toBe(100);
  });

  it("normalizes only positive composition values", () => {
    expect(normalizeSegments([30, 70])).toEqual([0.3, 0.7]);
    expect(normalizeSegments([0, -1])).toEqual([0, 0]);
  });
});
