import { describe, expect, test } from "bun:test";
import { computeScrollProgress } from "./scrollProgress";

describe("computeScrollProgress", () => {
  test("顶部为 0、底部为 1、中间线性", () => {
    expect(computeScrollProgress(0, 2000, 800)).toBe(0);
    expect(computeScrollProgress(1200, 2000, 800)).toBe(1);
    expect(computeScrollProgress(600, 2000, 800)).toBe(0.5);
  });

  test("不可滚动的页面恒为 0", () => {
    expect(computeScrollProgress(0, 800, 800)).toBe(0);
    expect(computeScrollProgress(0, 600, 800)).toBe(0);
  });

  test("越界滚动被夹取到 [0, 1]", () => {
    expect(computeScrollProgress(-50, 2000, 800)).toBe(0);
    expect(computeScrollProgress(5000, 2000, 800)).toBe(1);
  });
});
