import path from "node:path";
import { fileURLToPath } from "node:url";

import { slug as githubSlug } from "github-slugger";

/**
 * 文章 id 归一化：
 * folder-per-post 布局（X/X.md）会让 glob loader 生成「X/X」式双层 id，
 * 进而产出 /posts/X/X/ 的重复 URL。这里把末尾连续重复的路径段折叠为一段。
 */
export function normalizePostId(id: string): string {
  const segments = id.split("/").filter(Boolean);
  while (segments.length >= 2 && segments.at(-1) === segments.at(-2)) {
    segments.pop();
  }
  return segments.join("/");
}

/** 判断源文件是否为「目录/同名文件」布局（用于生成旧双层 URL 的重定向） */
export function hasNestedDuplicateName(filePath: string): boolean {
  const segments = filePath.replace(/\\/g, "/").split("/").filter(Boolean);
  if (segments.length < 2) {
    return false;
  }
  const fileName = segments.at(-1)!.replace(/\.(md|mdx)$/i, "");
  return fileName === segments.at(-2);
}

/**
 * glob loader 的 generateId：与 Astro 默认算法一致（逐段 github-slugger、
 * 去掉末尾 /index、frontmatter.slug 优先），最后折叠重复的末尾路径段。
 */
export function generateNormalizedPostId({
  entry,
  base,
  data,
}: {
  entry: string;
  base: URL;
  data: Record<string, unknown>;
}): string {
  if (typeof data.slug === "string" && data.slug) {
    return normalizePostId(data.slug);
  }
  const entryPath = fileURLToPath(new URL(encodeURI(entry), base));
  const relativePath = path.relative(fileURLToPath(base), entryPath);
  const withoutExt = relativePath.slice(0, relativePath.length - path.extname(relativePath).length);
  const slug = withoutExt
    .split(path.sep)
    .map((segment) => githubSlug(segment))
    .join("/")
    .replace(/\/index$/, "");
  return normalizePostId(slug);
}
