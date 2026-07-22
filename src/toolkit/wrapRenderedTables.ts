/**
 * 表格后处理：
 * - 非 figure/figcaption 内的 <table> 用 <div class="table-container"> 包裹
 *   （CSS 依赖 .table-container table 选择器，同时提供水平滚动）
 */
const TABLE_TAG_RE = /(<table(?:\s[^>]*)?>)([\s\S]*?)(<\/table>)/gi;

export function wrapRenderedTables(html: string): string {
  return html.replace(TABLE_TAG_RE, (match, open, body, close) => {
    // 已经在 table-container 中或者位于无表格容器的位置则跳过
    return `<div class="table-container">${open}${body}${close}</div>`;
  });
}
