/**
 * 语言徽标颜色环数量
 */
export const LANG_RING_COUNT = 8;

/**
 * 常用语言到颜色环索引的精选映射表。
 *
 * 索引对应的色相（见 palette.css 的 --lang-ring-*）：
 *   0 红/橙   1 黄      2 绿      3 蓝
 *   4 紫     5 青      6 品红    7 青绿
 *
 * 颜色尽量贴近各语言的官方品牌色，观感更自然。
 * 未命中的语言回退到哈希分配，保证总有颜色。
 */
const LANG_COLOR_TABLE: Record<string, number> = {
  // 红/橙 (ring 0)
  rust: 0,
  html: 0,
  ruby: 0,
  swift: 0,
  svelte: 0,
  astro: 0,
  "astro-html": 0,
  // 黄 (ring 1)
  javascript: 1,
  js: 1,
  json: 1,
  jsonc: 1,
  json5: 1,
  // 绿 (ring 2)
  shell: 2,
  bash: 2,
  sh: 2,
  zsh: 2,
  vue: 2,
  markdown: 2,
  md: 2,
  mdx: 2,
  // 蓝 (ring 3)
  typescript: 3,
  ts: 3,
  python: 3,
  py: 3,
  c: 3,
  cpp: 3,
  "c++": 3,
  css: 3,
  sql: 3,
  // 紫 (ring 4)
  csharp: 4,
  "c#": 4,
  cs: 4,
  php: 4,
  kotlin: 4,
  kt: 4,
  // 青 (ring 5)
  go: 5,
  golang: 5,
  docker: 5,
  dockerfile: 5,
  yaml: 5,
  yml: 5,
  toml: 5,
  // 品红 (ring 6)
  graphql: 6,
  scss: 6,
  sass: 6,
  less: 6,
  // 青绿 (ring 7)
  dockercompose: 7,
  ini: 7,
  diff: 7,
  plaintext: 7,
  text: 7,
};

/**
 * 将语言名映射到 0..LANG_RING_COUNT-1 的索引。
 *
 * 优先查精选颜色表；未命中时回退到哈希分配，保证任意输入都有稳定颜色。
 */
export function langBadgeIndex(lang: string): number {
  const name = (lang || "").trim().toLowerCase();
  if (name.length === 0) return 0;
  if (name in LANG_COLOR_TABLE) return LANG_COLOR_TABLE[name];
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
