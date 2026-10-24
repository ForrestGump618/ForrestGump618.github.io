import type {
  CoverInput,
  CoverKind,
  CoverMode,
  CoverOrigin,
  CoverSpec,
  TypographicPattern,
} from "./types";
import { coverAltFromTitle, typographicCover } from "./typographic";

/** 纯解析结果：不包含构建期图片元数据，便于单元测试 */
export interface CoverCore {
  kind: CoverKind;
  /** 以 src/ 为根的本地图片路径 */
  imagePath?: string;
  /** 远程图片地址 */
  remoteSrc?: string;
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
  origin: CoverOrigin;
}

/** 把数据表/frontmatter 里的图片路径规范化为以 src/ 为根的相对路径 */
export function normalizeCoverImagePath(path: string): string {
  return path
    .trim()
    .replace(/^\.\//, "")
    .replace(/^\/?src\//, "")
    .replace(/^\//, "");
}

/** 判断是否为远程图片 */
export function isRemoteCover(path: string): boolean {
  return /^https?:\/\//i.test(path.trim());
}

/**
 * 归一化文章标识：Astro content loader 会对文件名做 slug 化（去掉标点等），
 * 而内容数据表按人类可读标题登记，因此需要一种去标点、忽略大小写的对照方式。
 */
function normalizeCoverKey(value: string): string {
  return value.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");
}

/** 先按 id 精确匹配、再按标题精确匹配，最后按 slug 化后的 id/标题对照 */
function findTableEntry(
  table: Record<string, CoverSpec>,
  input: CoverInput,
): CoverSpec | undefined {
  const direct = table[input.id] ?? table[input.title];
  if (direct) {
    return direct;
  }

  const targets = new Set([normalizeCoverKey(input.id), normalizeCoverKey(input.title)]);
  for (const [key, spec] of Object.entries(table)) {
    if (targets.has(normalizeCoverKey(key))) {
      return spec;
    }
  }

  return undefined;
}

function isKnownKind(value: unknown): value is CoverKind {
  return (
    value === "photograph" ||
    value === "scientific" ||
    value === "illustration" ||
    value === "typographic" ||
    value === "none"
  );
}

function resolveMode(kind: CoverKind, mode?: CoverMode): CoverMode {
  if (mode === "cover" || mode === "fit") {
    return mode;
  }

  // 科研图表与信息型插画默认完整展示，避免裁掉坐标轴与标注
  return kind === "scientific" || kind === "illustration" ? "fit" : "cover";
}

function typographicResult(
  input: CoverInput,
  spec: CoverSpec | null,
  origin: CoverOrigin,
): CoverCore {
  const derived = typographicCover(input);

  return {
    kind: "typographic",
    alt: spec?.alt?.trim() || coverAltFromTitle(input.title),
    caption: spec?.caption,
    credit: spec?.credit,
    mode: "cover",
    tones: spec?.tones ?? derived.tones,
    kicker: spec?.kicker ?? derived.kicker,
    pattern: spec?.pattern ?? derived.pattern,
    band: spec?.band ?? false,
    origin,
  };
}

/**
 * frontmatter.cover 只负责「用哪张图」；封面类型、裁切方式与说明文字
 * 从内容数据表（postCovers）合并，避免科研图表被强制当作普通照片裁切。
 */
export type FrontmatterCover = Partial<Omit<CoverSpec, "image">> & { image: string };

/**
 * 封面解析核心（纯函数）：
 * 1. 作者明确指定的封面（frontmatter）
 * 2. 内容数据表登记的封面（postCovers）
 * 3. 依据标题/分类稳定派生的文字封面
 * 4. 无封面
 * 全程不使用随机数，同输入必得同结果。
 */
export function resolveCoverCore(
  input: CoverInput,
  table: Record<string, CoverSpec> = {},
  frontmatterSpec: FrontmatterCover | null = null,
): CoverCore {
  const entry = findTableEntry(table, input);
  const derived = typographicCover(input);

  if (frontmatterSpec?.image?.trim()) {
    const rawImage = frontmatterSpec.image.trim();
    const tableKind =
      entry && entry.kind !== "none" && isKnownKind(entry.kind) ? entry.kind : undefined;
    const kind = isKnownKind(frontmatterSpec.kind)
      ? frontmatterSpec.kind
      : (tableKind ?? "photograph");

    return {
      kind,
      imagePath: isRemoteCover(rawImage) ? undefined : normalizeCoverImagePath(rawImage),
      remoteSrc: isRemoteCover(rawImage) ? rawImage : undefined,
      alt: frontmatterSpec.alt?.trim() || entry?.alt?.trim() || coverAltFromTitle(input.title),
      caption: frontmatterSpec.caption ?? entry?.caption,
      credit: frontmatterSpec.credit ?? entry?.credit,
      focus: frontmatterSpec.focus ?? entry?.focus,
      mode: resolveMode(kind, frontmatterSpec.mode ?? entry?.mode),
      tones: frontmatterSpec.tones ?? entry?.tones ?? derived.tones,
      kicker: frontmatterSpec.kicker ?? entry?.kicker ?? derived.kicker,
      pattern: frontmatterSpec.pattern ?? entry?.pattern ?? derived.pattern,
      band: frontmatterSpec.band ?? entry?.band ?? false,
      origin: "frontmatter",
    };
  }
  if (entry) {
    if (entry.kind === "none") {
      return {
        kind: "none",
        alt: "",
        mode: "cover",
        tones: entry.tones ?? typographicCover(input).tones,
        pattern: entry.pattern ?? typographicCover(input).pattern,
        band: false,
        origin: "table",
      };
    }

    if (entry.image?.trim()) {
      const rawImage = entry.image.trim();
      const kind = isKnownKind(entry.kind) ? entry.kind : "photograph";

      return {
        kind,
        imagePath: isRemoteCover(rawImage) ? undefined : normalizeCoverImagePath(rawImage),
        remoteSrc: isRemoteCover(rawImage) ? rawImage : undefined,
        alt: entry.alt?.trim() || coverAltFromTitle(input.title),
        caption: entry.caption,
        credit: entry.credit,
        focus: entry.focus,
        mode: resolveMode(kind, entry.mode),
        tones: entry.tones ?? typographicCover(input).tones,
        kicker: entry.kicker ?? typographicCover(input).kicker,
        pattern: entry.pattern ?? typographicCover(input).pattern,
        band: entry.band ?? false,
        origin: "table",
      };
    }

    return typographicResult(input, entry, "table");
  }

  return typographicResult(input, null, "derived");
}
