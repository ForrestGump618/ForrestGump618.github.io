import type { ImageMetadata } from "astro";

/** 封面类型：摄影 / 科研图表 / 编辑插画 / 文字封面 / 无封面 */
export type CoverKind = "photograph" | "scientific" | "illustration" | "typographic" | "none";

/** cover = 裁切填充（适合摄影、插画）；fit = 完整展示（适合科研图表、截图） */
export type CoverMode = "cover" | "fit";

/** 文字封面的几何纹样变体，由工具函数稳定派生 */
export type TypographicPattern = "rules" | "grid" | "orbit" | "stack";

/**
 * 作者/数据表可声明的封面规格。
 * image 为「以仓库 src/ 为根」的路径，例如：
 *   "posts/口腔科学总结/牙体解剖.png"
 *   "assets/images/cover-2.avif"
 */
export interface CoverSpec {
  kind: CoverKind;
  image?: string;
  alt?: string;
  caption?: string;
  credit?: string;
  /** CSS object-position，例如 "50% 30%" */
  focus?: string;
  mode?: CoverMode;
  /** 文字封面的双色：[纸色, 墨色] */
  tones?: readonly [string, string];
  /** 文字封面的小标签（通常为分类名） */
  kicker?: string;
  pattern?: TypographicPattern;
  /**
   * 是否允许出现在首页「科研图表」带。
   * 只有真正有科学意义的图表/图解才开启；产品截图、示例动图等仅作封面。
   */
  band?: boolean;
}

/** 封面来源：作者指定 / 内容数据表 / 由标题分类派生 */
export type CoverOrigin = "frontmatter" | "table" | "derived";

/** 渲染层消费的最终封面数据 */
export interface ResolvedCover {
  kind: CoverKind;
  origin?: CoverOrigin;
  Image?: ImageMetadata;
  /** 远程图片地址（无本地元数据时使用） */
  src?: string;
  alt: string;
  caption?: string;
  credit?: string;
  focus?: string;
  mode: CoverMode;
  tones: readonly [string, string];
  kicker?: string;
  pattern: TypographicPattern;
  /** 是否进入首页科研图表带 */
  band: boolean;
}

/** 解析封面所需的文章最小信息 */
export interface CoverInput {
  id: string;
  title: string;
  categories?: readonly (string | null | undefined)[] | null;
  tags?: readonly (string | null | undefined)[] | null;
  /** frontmatter.cover：content collection 的 image() 或原始字符串 */
  cover?: ImageMetadata | string | null;
  description?: string | null;
}
