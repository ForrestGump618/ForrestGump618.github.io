import { describe, expect, it } from "bun:test";
import { LANG_RING_COUNT, langBadgeIndex, langBadgeColor } from "./langBadge";

describe("langBadgeIndex", () => {
  it("返回 0..7 范围内的索引", () => {
    for (const input of ["js", "ts", "python", "rust", "go", "html", "css", "unknown"]) {
      const idx = langBadgeIndex(input);
      expect(idx).toBeGreaterThanOrEqual(0);
      expect(idx).toBeLessThan(LANG_RING_COUNT);
    }
  });

  it("同一个语言始终映射到同一个索引（确定性）", () => {
    const lang = "javascript";
    const first = langBadgeIndex(lang);
    for (let i = 0; i < 20; i++) {
      expect(langBadgeIndex(lang)).toBe(first);
    }
  });

  it("空字符串返回 0", () => {
    expect(langBadgeIndex("")).toBe(0);
    expect(langBadgeIndex("   ")).toBe(0);
  });

  it("大小写不敏感", () => {
    expect(langBadgeIndex("TS")).toBe(langBadgeIndex("ts"));
    expect(langBadgeIndex("TypeScript")).toBe(langBadgeIndex("typescript"));
  });
});

describe("langBadgeColor", () => {
  it("返回 var(--lang-ring-N) 格式", () => {
    const color = langBadgeColor("js");
    expect(color).toMatch(/^var\(--lang-ring-\d+\)$/);
  });

  it("与 langBadgeIndex 结果一致", () => {
    const lang = "python";
    const idx = langBadgeIndex(lang);
    expect(langBadgeColor(lang)).toBe(`var(--lang-ring-${idx})`);
  });
});
