import { describe, expect, test } from "bun:test";

import { countWords, estimateReadTime, getReadingStats, toReadableText } from "./readingStats";

describe("字数统计", () => {
  test("中文按字计", () => {
    expect(countWords("记录的目的")).toBe(5);
  });

  test("英文按词计，忽略标点", () => {
    expect(countWords("learn record and keep asking")).toBe(5);
  });

  test("忽略代码块内容", () => {
    const body = "正文一段\n\n```js\nconst a = 1;\n```\n\n结尾";
    expect(countWords(body)).toBe(6);
  });

  test("忽略图片与链接地址，保留链接文字", () => {
    const body = "看图 ![示意](a.png) 和 [论文](https://example.com)";
    expect(countWords(body)).toBe(5);
  });

  test("忽略 HTML 标签", () => {
    expect(countWords("<div>五个字的内容</div>")).toBe(6);
  });

  test("空正文返回 0", () => {
    expect(countWords("")).toBe(0);
    expect(estimateReadTime("")).toBe(0);
  });
});

describe("阅读时长", () => {
  test("至少 1 分钟", () => {
    expect(estimateReadTime("短")).toBe(1);
  });

  test("300 字约 1 分钟，301 字约 2 分钟", () => {
    expect(estimateReadTime("字".repeat(300))).toBe(1);
    expect(estimateReadTime("字".repeat(301))).toBe(2);
  });

  test("getReadingStats 口径一致", () => {
    const stats = getReadingStats("字".repeat(600));
    expect(stats.wordCount).toBe(600);
    expect(stats.readTime).toBe(2);
  });

  test("toReadableText 归一化空白", () => {
    expect(toReadableText("  a   b  ")).toBe("a b");
  });
});
