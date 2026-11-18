/**
 * 渲染层剥离内联文本颜色：作者手写 style="color:…" 在暗色主题下会不可读，
 * 文本颜色交还给主题令牌；背景色与字号等其余声明保留。
 */
const STYLE_ATTR_PATTERN = /\sstyle\s*=\s*(["'])(?<style>.*?)\1/gi;
const COLOR_DECL_PATTERN = /(^|;)\s*color\s*:[^;]*/gi;

export function stripInlineTextColors(html: string): string {
  return html.replace(STYLE_ATTR_PATTERN, (match, _quote: string, style: string) => {
    const cleaned = style
      .replace(COLOR_DECL_PATTERN, "")
      .replace(/;\s*;/g, ";")
      .replace(/^\s*;\s*/, "")
      .replace(/\s*;\s*$/, "")
      .trim();
    return cleaned.length > 0 ? ` style="${cleaned}"` : "";
  });
}
