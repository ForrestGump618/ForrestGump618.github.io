import { describe, expect, it } from "bun:test";
import { PRESS_RING_MAX, PRESS_RING_MS, shouldPressRing } from "./pressRing";

describe("shouldPressRing", () => {
  it("主键且未减少动画时触发", () => {
    expect(shouldPressRing({ button: 0 }, false)).toBe(true);
  });

  it("减少动画偏好下关闭", () => {
    expect(shouldPressRing({ button: 0 }, true)).toBe(false);
  });

  it("非主键不触发", () => {
    expect(shouldPressRing({ button: 1 }, false)).toBe(false);
    expect(shouldPressRing({ button: 2 }, false)).toBe(false);
  });

  it("常量处于合理区间", () => {
    expect(PRESS_RING_MS).toBeGreaterThan(200);
    expect(PRESS_RING_MS).toBeLessThan(900);
    expect(PRESS_RING_MAX).toBeGreaterThan(0);
  });
});
