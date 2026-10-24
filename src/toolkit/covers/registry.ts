import type { ImageMetadata } from "astro";

/**
 * 构建期图片登记表：
 * - src/assets/images/*：站点通用配图（摄影、文字封面底图等）
 * - src/posts/**：文章目录内的真实图片（科研图表、截图、流程图）
 * 键统一为「以仓库 src/ 为根的路径」，例如 "posts/口腔科学总结/牙体解剖.png"。
 */
const assetModules = import.meta.glob<ImageMetadata>(
  "../assets/images/*.{avif,webp,png,jpg,jpeg}",
  { eager: true, import: "default" },
);

const postModules = import.meta.glob<ImageMetadata>(
  "../posts/**/*.{avif,webp,png,jpg,jpeg,gif,svg}",
  { eager: true, import: "default" },
);

function toRegistryKey(modulePath: string): string {
  return modulePath
    .replace(/^\.\.\//, "")
    .replace(/^\/?src\//, "")
    .replace(/^\.\//, "");
}

export const coverImageMap: ReadonlyMap<string, ImageMetadata> = new Map(
  Object.entries({ ...assetModules, ...postModules }).map(
    ([modulePath, image]) => [toRegistryKey(modulePath), image] as const,
  ),
);

/** 按以 src/ 为根的路径查找构建期图片元数据 */
export function findCoverImage(path?: string): ImageMetadata | undefined {
  if (!path) {
    return undefined;
  }

  return coverImageMap.get(toRegistryKey(path));
}

export const coverImageCount = coverImageMap.size;
