import { describe, expect, it } from "bun:test";
import { buildHeadingUrl } from "./headingAnchors";

describe("buildHeadingUrl", () => {
  it("组装带 hash 的绝对链接", () => {
    expect(buildHeadingUrl("https://example.com", "/posts/eve/", "usage")).toBe(
      "https://example.com/posts/eve/#usage",
    );
  });

  it("中文与特殊字符 id 会被编码", () => {
    expect(buildHeadingUrl("https://example.com", "/posts/笔记/", "安装 与 配置")).toBe(
      `https://example.com/posts/%E7%AC%94%E8%AE%B0/#${encodeURIComponent("安装 与 配置")}`,
    );
  });

  it("保留尾斜杠路径", () => {
    expect(buildHeadingUrl("https://example.com", "/posts/a/b/", "x")).toBe(
      "https://example.com/posts/a/b/#x",
    );
  });
});
