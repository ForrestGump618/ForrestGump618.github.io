/**
 * 语言徽标颜色环数量
 */
export const LANG_RING_COUNT = 8;

/**
 * 将语言名哈希到 0..LANG_RING_COUNT-1 的索引
 */
export function langBadgeIndex(lang: string): number {
  const name = (lang || "").trim().toLowerCase();
  if (name.length === 0) return 0;
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return hash % LANG_RING_COUNT;
}

/**
 * 返回语言徽标对应的 CSS 变量引用，如 var(--lang-ring-3)
 */
export function langBadgeColor(lang: string): string {
  return `var(--lang-ring-${langBadgeIndex(lang)})`;
}
