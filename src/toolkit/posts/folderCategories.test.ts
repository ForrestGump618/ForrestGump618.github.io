import { describe, expect, it } from "bun:test";

import {
  FOLDER_CATEGORY_TOKEN,
  normalizeFolderCategories,
  resolveFolderCategories,
} from "./folderCategories";

describe("resolveFolderCategories", () => {
  it("根据 posts 基准目录解析嵌套分类", () => {
    expect(
      resolveFolderCategories(
        "E:\\workspace\\astro-blog-shokax\\src\\posts\\foo\\bar\\1.md",
        "E:\\workspace\\astro-blog-shokax\\src\\posts",
      ),
    ).toEqual(["foo", "bar"]);
  });

  it("根目录文章解析为空分类", () => {
    expect(
      resolveFolderCategories(
        "E:\\workspace\\astro-blog-shokax\\src\\posts\\hello-world.md",
        "E:\\workspace\\astro-blog-shokax\\src\\posts",
      ),
    ).toEqual([]);
  });

  it("根据 POSIX 风格路径解析嵌套分类", () => {
    expect(
      resolveFolderCategories(
        "/home/runner/work/astro-blog-shokax/astro-blog-shokax/src/posts/foo/bar/1.md",
        "/home/runner/work/astro-blog-shokax/astro-blog-shokax/src/posts",
      ),
    ).toEqual(["foo", "bar"]);
  });
});

describe("normalizeFolderCategories", () => {
  it("将数组形式的 ${folder} 替换为文件夹分类", () => {
    expect(
      normalizeFolderCategories(
        [FOLDER_CATEGORY_TOKEN],
        "E:\\workspace\\astro-blog-shokax\\src\\posts\\foo\\bar\\1.md",
        "E:\\workspace\\astro-blog-shokax\\src\\posts",
      ),
    ).toEqual(["foo", "bar"]);
  });

  it("将字符串形式的 ${folder} 替换为文件夹分类", () => {
    expect(
      normalizeFolderCategories(
        FOLDER_CATEGORY_TOKEN,
        "E:\\workspace\\astro-blog-shokax\\src\\posts\\foo\\bar\\1.md",
        "E:\\workspace\\astro-blog-shokax\\src\\posts",
      ),
    ).toEqual(["foo", "bar"]);
  });

  it("保留显式分类", () => {
    expect(
      normalizeFolderCategories(
        ["Frontend", "Astro"],
        "E:\\workspace\\astro-blog-shokax\\src\\posts\\foo\\bar\\1.md",
        "E:\\workspace\\astro-blog-shokax\\src\\posts",
      ),
    ).toEqual(["Frontend", "Astro"]);
  });
});
