import type { ImageMetadata } from "astro";
import { postCovers } from "@/data/postCovers";
import { findCoverImage } from "./registry";
import { resolveCoverCore } from "./resolveCover";
import type { FrontmatterCover } from "./resolveCover";
import { coverAltFromTitle, typographicCover } from "./typographic";
import type { CoverInput, ResolvedCover } from "./types";

export type {
  CoverInput,
  CoverKind,
  CoverMode,
  CoverSpec,
  ResolvedCover,
  TypographicPattern,
} from "./types";
export type { FrontmatterCover } from "./resolveCover";
export { resolveCoverCore, normalizeCoverImagePath } from "./resolveCover";
export { coverAltFromTitle, typographicCover, stableHash } from "./typographic";
export { findCoverImage, coverImageMap } from "./registry";

/** frontmatter.cover 是 content collection 的 image() 结果时拿到构建期图片 */
function frontmatterImageOf(cover: CoverInput["cover"]): ImageMetadata | undefined {
  return cover && typeof cover === "object" ? cover : undefined;
}

/**
 * frontmatter 只声明图片；类型/裁切/图注等交给 postCovers 合并，
 * 这样作者指定封面不会把科研图表降级成普通照片。
 */
function frontmatterSpecOf(input: CoverInput): FrontmatterCover | null {
  const cover = input.cover;
  if (typeof cover !== "string" || !cover.trim()) {
    return null;
  }

  return { image: cover };
}

/**
 * 文章封面解析（构建期）：优先作者指定封面，其次内容数据表，
 * 再次由标题/分类派生的文字封面，最后是无封面。
 */
export function resolvePostCover(input: CoverInput): ResolvedCover {
  const frontmatterImage = frontmatterImageOf(input.cover);
  const frontmatterSpec = frontmatterSpecOf(input);
  const core = resolveCoverCore(input, postCovers, frontmatterSpec);

  if (core.kind === "none") {
    return {
      kind: "none",
      alt: "",
      mode: "cover",
      tones: core.tones,
      pattern: core.pattern,
      band: false,
      origin: core.origin,
    };
  }

  /**
   * frontmatter 用的是已解析的图片元数据（content collection image()）时，
   * 解析核心拿不到路径，这里把作者图片补回去。
   */
  const kind =
    frontmatterImage && !core.imagePath && !core.remoteSrc && core.kind === "typographic"
      ? "photograph"
      : core.kind;

  if (kind === "typographic") {
    return {
      kind: "typographic",
      alt: core.alt,
      caption: core.caption,
      credit: core.credit,
      mode: "cover",
      tones: core.tones,
      kicker: core.kicker,
      pattern: core.pattern,
      band: core.band,
      origin: core.origin,
    };
  }

  const Image = frontmatterImage ?? findCoverImage(core.imagePath);
  const src = core.remoteSrc;

  // 登记了图片但构建期找不到资源：安全回退为文字封面，绝不渲染破图
  if (!Image && !src) {
    const derived = typographicCover(input);

    return {
      kind: "typographic",
      alt: core.alt || coverAltFromTitle(input.title),
      mode: "cover",
      tones: core.tones ?? derived.tones,
      kicker: core.kicker ?? derived.kicker,
      pattern: core.pattern ?? derived.pattern,
      band: false,
      origin: core.origin,
    };
  }

  return {
    kind,
    Image,
    src,
    alt: core.alt,
    caption: core.caption,
    credit: core.credit,
    focus: core.focus,
    mode: core.mode,
    tones: core.tones,
    kicker: core.kicker,
    pattern: core.pattern,
    band: core.band,
    origin: core.origin,
  };
}
