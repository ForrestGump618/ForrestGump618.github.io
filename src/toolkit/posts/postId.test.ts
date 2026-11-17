import { describe, expect, it } from "bun:test";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { generateNormalizedPostId, hasNestedDuplicateName, normalizePostId } from "./postId";

describe("normalizePostId", () => {
  it("折叠末尾重复的双层路径段", () => {
    expect(normalizePostId("心脏听诊总结/心脏听诊总结")).toBe("心脏听诊总结");
    expect(normalizePostId("linger/linger")).toBe("linger");
  });

  it("折叠多层连续重复", () => {
    expect(normalizePostId("a/a/a")).toBe("a");
    expect(normalizePostId("分类/文章/文章")).toBe("分类/文章");
  });

  it("保留正常的扁平与嵌套 id", () => {
    expect(normalizePostId("eve")).toBe("eve");
    expect(normalizePostId("分类/文章")).toBe("分类/文章");
    expect(normalizePostId("")).toBe("");
  });
});

describe("hasNestedDuplicateName", () => {
  it("识别目录/同名 Markdown 布局", () => {
    expect(hasNestedDuplicateName("src/posts/心脏听诊总结/心脏听诊总结.md")).toBe(true);
    expect(hasNestedDuplicateName("E:\\repo\\src\\posts\\X\\X.mdx")).toBe(true);
  });

  it("排除扁平文件与不同名嵌套文件", () => {
    expect(hasNestedDuplicateName("src/posts/eve.md")).toBe(false);
    expect(hasNestedDuplicateName("src/posts/分类/文章.md")).toBe(false);
    expect(hasNestedDuplicateName("src/posts/X/index.md")).toBe(false);
  });
});

describe("generateNormalizedPostId", () => {
  const base = pathToFileURL(path.resolve("test-posts") + path.sep);
  const generate = (entry: string, data: Record<string, unknown> = {}) =>
    generateNormalizedPostId({ entry, base, data });

  it("折叠目录/同名文件的双层 id", () => {
    expect(generate("心脏听诊总结/心脏听诊总结.md")).toBe("心脏听诊总结");
    expect(
      generate(
        "LINGER：从单细胞多组学数据推断基因调控网络/LINGER：从单细胞多组学数据推断基因调控网络.md",
      ),
    ).toBe("linger从单细胞多组学数据推断基因调控网络");
  });

  it("与默认算法一致地 slug 化普通文件", () => {
    expect(generate("Hello World！.md")).toBe("hello-world");
    expect(generate("分类/文章.md")).toBe("分类/文章");
    expect(generate("X/index.md")).toBe("x");
  });

  it("frontmatter.slug 优先且同样折叠重复段", () => {
    expect(generate("X/X.md", { slug: "custom/custom" })).toBe("custom");
    expect(generate("X.md", { slug: "kept" })).toBe("kept");
  });
});
