import type { TypographicPattern } from "./types";

/** 低饱和双色调色板：纸色 + 墨色，均与站点的暖中性 + 梅子红强调色兼容 */
const TONE_FAMILIES = {
  bio: [
    ["#edf1ea", "#2c3a31"],
    ["#e9efe9", "#26332c"],
    ["#f0f1e8", "#33392a"],
  ],
  medicine: [
    ["#f5ede8", "#3c2d28"],
    ["#f6efe9", "#402f2a"],
    ["#f2ece6", "#352a26"],
  ],
  computing: [
    ["#eceef1", "#28303a"],
    ["#eaeef3", "#252d38"],
    ["#eef0f3", "#2b333d"],
  ],
  statistics: [
    ["#f2eff0", "#352d33"],
    ["#f1eef2", "#332b36"],
    ["#f4f0ef", "#3a2f33"],
  ],
  essay: [
    ["#f6f0e5", "#3b3226"],
    ["#f7f2e8", "#3f352a"],
    ["#f4eee3", "#382f24"],
  ],
  resource: [
    ["#eff0ee", "#2f332f"],
    ["#eef0ef", "#2b312e"],
    ["#f1f2ef", "#343832"],
  ],
} as const satisfies Record<string, readonly (readonly [string, string])[]>;

const PATTERNS: readonly TypographicPattern[] = ["rules", "grid", "orbit", "stack"];

/** FNV-1a 32 位哈希：同输入必得同结果（不使用随机数） */
export function stableHash(value: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }

  return hash >>> 0;
}

type ToneFamily = keyof typeof TONE_FAMILIES;

/** 依据分类名把文章映射到克制的色系（不引入高饱和色） */
export function resolveToneFamily(categories: readonly string[]): ToneFamily {
  const joined = categories.join(" ");

  if (/生物信息|组学|单细胞|基因组|转录组|测序/.test(joined)) return "bio";
  if (/医学|临床|口腔|心脏|解剖|病理|肿瘤|流行病|药学|护理/.test(joined)) {
    return "medicine";
  }
  if (/深度学习|机器学习|算法|计算机|人工智能|编程|前端|数据库|网络/.test(joined)) {
    return "computing";
  }
  if (/统计|概率|数学|数据/.test(joined)) return "statistics";
  if (/随笔|生活|回忆|思考|记录|杂谈/.test(joined)) return "essay";
  if (/资源|课程|收藏|工具|汇总|开源/.test(joined)) return "resource";

  return "essay";
}

/** 稳定派生文字封面规格：双色、纹样、kicker */
export function typographicCover(input: {
  id: string;
  title: string;
  categories?: readonly (string | null | undefined)[] | null;
}): {
  tones: readonly [string, string];
  pattern: TypographicPattern;
  kicker: string;
} {
  const categories = (input.categories ?? [])
    .filter((category): category is string => Boolean(category && category.trim()))
    .map((category) => category.trim());
  const family = resolveToneFamily(categories);
  const familyTones = TONE_FAMILIES[family];
  const hash = stableHash(input.id || input.title);
  const tones = familyTones[hash % familyTones.length];
  const pattern = PATTERNS[(hash >>> 8) % PATTERNS.length];
  const kicker = categories[0] ?? "Echo";

  return { tones, pattern, kicker };
}

/** 生成简洁的封面替代文本（图片缺失或仅为装饰时使用） */
export function coverAltFromTitle(title: string): string {
  const trimmed = title.trim();

  return trimmed ? `《${trimmed}》封面` : "文章封面";
}
