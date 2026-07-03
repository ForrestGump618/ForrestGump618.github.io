/**
 * code-group 后处理：
 * 将 <div class="code-group"> 内连续的 <code-block> 重组为可切换的 Tabs 结构。
 *
 * 输出结构与 src/components/mdx/Tabs.astro 一致，因此客户端无需新增初始化逻辑——
 * initAllTabs()（src/toolkit/initMdxComponents.ts）会自动识别 .md .tabs 并绑定交互。
 *
 * Tab 标签取自代码块语言（<pre class="...language-XXX"> 中的 XXX，大写化）。
 *
 * 必须在 wrapRenderedCodeBlocks 之后执行（它先把 <pre> 包成 <code-block>）。
 */

// 匹配 <div class="code-group">...</div>（非贪婪，含属性边界）
const CODE_GROUP_PATTERN = /<div class="code-group">(?<inner>[\s\S]*?)<\/div>/g;

// 匹配单个 <code-block>...</code-block>
const CODE_BLOCK_PATTERN = /<code-block>(?<block>[\s\S]*?)<\/code-block>/g;

// 从 <pre> 提取语言标识：优先 data-language 属性（Shiki 双主题输出），
// 其次 class 中的 language-XXX（单主题或其它渲染器）
const DATA_LANG_PATTERN = /\bdata-language=(?<quote>["'])(?<lang>[\w-]+)\k<quote>/;
const CLASS_LANG_PATTERN = /class="[^"]*\blanguage-(?<lang>[\w-]+)/;

function extractLabel(blockHtml: string, fallback: string): string {
  const dataMatch = blockHtml.match(DATA_LANG_PATTERN);
  if (dataMatch?.groups?.lang) return dataMatch.groups.lang.toUpperCase();
  const classMatch = blockHtml.match(CLASS_LANG_PATTERN);
  if (classMatch?.groups?.lang) return classMatch.groups.lang.toUpperCase();
  return fallback;
}

export function wrapCodeGroups(html: string): string {
  return html.replace(CODE_GROUP_PATTERN, (match, inner) => {
    const blocks = [...inner.matchAll(CODE_BLOCK_PATTERN)].map((m) => m.groups!.block);
    if (blocks.length === 0) return match;

    const tabs = blocks
      .map((block, i) => {
        const label = extractLabel(block, `Tab ${i + 1}`);
        const value = `cg-${i}`;
        return `<section class="tab-item" data-tab-label="${label}" data-tab-value="${value}"><code-block>${block}</code-block></section>`;
      })
      .join("");

    return `<div class="tabs code-group" data-default-value=""><div class="nav" aria-label="Code group 导航"><ul role="tablist"></ul></div><div class="tabs-panels">${tabs}</div></div>`;
  });
}
