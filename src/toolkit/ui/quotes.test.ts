import { describe, expect, test } from "bun:test";
import { QUOTES, pickNextQuoteIndex } from "./quotes";

describe("pickNextQuoteIndex", () => {
  test("任何随机取值都不会停留在当前一句", () => {
    for (const current of [0, 3, QUOTES.length - 1]) {
      for (const rand of [0, 0.25, 0.5, 0.75, 0.999]) {
        expect(pickNextQuoteIndex(current, () => rand)).not.toBe(current);
      }
    }
  });

  test("结果始终落在合法下标内", () => {
    for (const rand of [0, 0.5, 0.999]) {
      const next = pickNextQuoteIndex(QUOTES.length - 1, () => rand);
      expect(next).toBeGreaterThanOrEqual(0);
      expect(next).toBeLessThan(QUOTES.length);
    }
  });

  test("rand 为 0 时顺序切换到下一句", () => {
    expect(pickNextQuoteIndex(0, () => 0)).toBe(1);
    expect(pickNextQuoteIndex(QUOTES.length - 1, () => 0)).toBe(0);
  });
});
