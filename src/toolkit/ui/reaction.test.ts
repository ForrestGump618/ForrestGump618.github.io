import { describe, expect, test } from "bun:test";
import { formatReactionMs, gradeReaction, reactionDelayMs } from "./reaction";

describe("reactionDelayMs", () => {
  test("随机等待落在 [min, max] 区间", () => {
    expect(reactionDelayMs(() => 0)).toBe(1200);
    expect(reactionDelayMs(() => 1)).toBe(3200);
    expect(reactionDelayMs(() => 0.5)).toBe(2200);
    expect(reactionDelayMs(() => 0.5, 100, 200)).toBe(150);
  });
});

describe("gradeReaction", () => {
  test("按阈值分级", () => {
    expect(gradeReaction(199).label).toBe("闪电");
    expect(gradeReaction(200).label).toBe("敏锐");
    expect(gradeReaction(259).label).toBe("敏锐");
    expect(gradeReaction(260).label).toBe("稳健");
    expect(gradeReaction(329).label).toBe("稳健");
    expect(gradeReaction(330).label).toBe("慢热");
  });
});

describe("formatReactionMs", () => {
  test("四舍五入到整数毫秒", () => {
    expect(formatReactionMs(243.4)).toBe("243 ms");
    expect(formatReactionMs(243.6)).toBe("244 ms");
  });
});
