import { describe, expect, test } from "bun:test";

import { resolveCoverCore } from "./resolveCover";
import { stableHash, typographicCover } from "./typographic";
import type { CoverInput, CoverSpec } from "./types";

const baseInput = {
  id: "深度学习笔记（一）：线性回归",
  title: "深度学习笔记（一）：线性回归",
  categories: ["深度学习"],
  tags: ["机器学习"],
} satisfies CoverInput;

const table: Record<string, CoverSpec> = {
  [baseInput.id]: {
    kind: "scientific",
    image: "posts/深度学习笔记（一）：线性回归/fig1.png",
    alt: "线性回归示意图",
  },
  "口腔科学总结/口腔科学总结": {
    kind: "scientific",
    image: "posts/口腔科学总结/牙体解剖.png",
  },
  无图文章: { kind: "typographic", kicker: "随笔" },
  隐藏文章: { kind: "none" },
};

describe("封面解析优先级", () => {
  test("作者指定的 frontmatter 封面优先级最高", () => {
    const cover = resolveCoverCore(baseInput, table, {
      kind: "photograph",
      image: "assets/images/cover-2.avif",
    });

    expect(cover.kind).toBe("photograph");
    expect(cover.origin).toBe("frontmatter");
    expect(cover.imagePath).toBe("assets/images/cover-2.avif");
    expect(cover.mode).toBe("cover");
  });

  test("数据表登记的科研图表默认完整展示（fit）", () => {
    const cover = resolveCoverCore(baseInput, table);

    expect(cover.kind).toBe("scientific");
    expect(cover.origin).toBe("table");
    expect(cover.imagePath).toBe("posts/深度学习笔记（一）：线性回归/fig1.png");
    expect(cover.mode).toBe("fit");
    expect(cover.alt).toBe("线性回归示意图");
  });

  test("数据表登记 none 时不渲染封面", () => {
    const cover = resolveCoverCore({ id: "隐藏文章", title: "隐藏文章", categories: [] }, table);

    expect(cover.kind).toBe("none");
    expect(cover.origin).toBe("table");
    expect(cover.alt).toBe("");
  });

  test("数据表登记 typographic 时合并自定义 kicker", () => {
    const cover = resolveCoverCore(
      { id: "无图文章", title: "无图文章", categories: ["随笔"] },
      table,
    );

    expect(cover.kind).toBe("typographic");
    expect(cover.kicker).toBe("随笔");
    expect(cover.origin).toBe("table");
  });

  test("未登记文章稳定派生文字封面", () => {
    const input: CoverInput = {
      id: "记录的目的",
      title: "记录的目的",
      categories: ["随笔"],
    };
    const first = resolveCoverCore(input, table);
    const second = resolveCoverCore(input, table);

    expect(first.kind).toBe("typographic");
    expect(first.origin).toBe("derived");
    expect(first.tones).toEqual(second.tones);
    expect(first.pattern).toBe(second.pattern);
    expect(first.kicker).toBe("随笔");
    expect(first.alt).toBe("《记录的目的》封面");
  });

  test("远程图片走 remoteSrc，不当作本地路径", () => {
    const cover = resolveCoverCore(baseInput, table, {
      kind: "photograph",
      image: "https://example.com/cover.png",
    });

    expect(cover.remoteSrc).toBe("https://example.com/cover.png");
    expect(cover.imagePath).toBeUndefined();
  });

  test("路径规范化：去掉 ./ 与 src/ 前缀", () => {
    const cover = resolveCoverCore(
      baseInput,
      {},
      {
        kind: "photograph",
        image: "./src/posts/a/b.png",
      },
    );

    expect(cover.imagePath).toBe("posts/a/b.png");
  });
});

describe("文字封面派生", () => {
  test("同一文章多次调用结果一致（无随机）", () => {
    const first = typographicCover(baseInput);
    const second = typographicCover(baseInput);

    expect(first).toEqual(second);
  });

  test("不同文章倾向于不同纹样与色板", () => {
    const a = typographicCover({ id: "a", title: "A", categories: ["生物信息学"] });
    const b = typographicCover({ id: "b", title: "B", categories: ["生物信息学"] });

    expect(a.tones).toHaveLength(2);
    expect(b.tones).toHaveLength(2);
  });

  test("分类决定色系：生物信息学偏冷绿，随笔偏暖褐", () => {
    const bio = typographicCover({ id: "x", title: "x", categories: ["生物信息学"] });
    const essay = typographicCover({ id: "x", title: "x", categories: ["随笔"] });

    expect(bio.kicker).toBe("生物信息学");
    expect(essay.kicker).toBe("随笔");
    expect(bio.tones[0]).not.toBe(essay.tones[0]);
  });

  test("无分类时使用 Echo 作为标签", () => {
    const cover = typographicCover({ id: "x", title: "x", categories: [] });

    expect(cover.kicker).toBe("Echo");
  });

  test("哈希稳定且落在 32 位无符号范围", () => {
    expect(stableHash("Echo")).toBe(stableHash("Echo"));
    expect(stableHash("Echo")).toBeGreaterThanOrEqual(0);
    expect(stableHash("Echo")).toBeLessThanOrEqual(0xffffffff);
    expect(stableHash("Echo")).not.toBe(stableHash("echo"));
  });

  test("slug 化后的 id 仍能命中按标题登记的封面条目", () => {
    const sluggedInput: CoverInput = {
      id: "LINGER从单细胞多组学数据推断基因调控网络/LINGER从单细胞多组学数据推断基因调控网络",
      title: "LINGER：从单细胞多组学数据推断基因调控网络",
      categories: ["生物信息学"],
      tags: null,
    };
    const sluggedTable: Record<string, CoverSpec> = {
      "LINGER：从单细胞多组学数据推断基因调控网络/LINGER：从单细胞多组学数据推断基因调控网络": {
        kind: "scientific",
        image: "posts/LINGER：从单细胞多组学数据推断基因调控网络/LINGER.png",
        alt: "LINGER 模型流程图",
        mode: "fit",
        band: true,
      },
    };

    const cover = resolveCoverCore(sluggedInput, sluggedTable);

    expect(cover.kind).toBe("scientific");
    expect(cover.band).toBe(true);
    expect(cover.origin).toBe("table");
  });
});
