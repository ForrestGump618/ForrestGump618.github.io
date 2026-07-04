/**
 * 外链标识后处理：
 * 为文章正文中的外部链接自动添加 target="_blank"、rel 安全属性与 ↗ 图标。
 * 站内链接（相对路径、锚点、同源绝对 URL）保持原样。
 *
 * 约定沿用 hexo-theme-shokaX 的 `.exturl .ic` 样式（见 src/styles/post.css）。
 */

// 匹配 <a href="...">...</a>，捕获属性、引号、href 与内部文本
const LINK_PATTERN =
  /<a(?<attrs>[^>]*?\bhref=(?<quote>["'])(?<href>[^"']+)\k<quote>[^>]*?)>(?<text>[\s\S]*?)<\/a>/g;

// 已带 target 属性的链接不重复处理
const HAS_TARGET = /\btarget\s*=/i;
// 已带外链图标的链接不重复嵌套
const HAS_EXTURL_ICON = /i-ri-external-link-line/;

export interface WrapExternalLinksOptions {
  /** 站点 URL（如 https://example.com 或 https://example.com/sub），用于识别同源绝对 URL */
  siteUrl?: string;
}

/**
 * 从站点 URL 字符串安全提取 origin（兼容带/不带尾斜杠、空值等情况）
 */
function normalizeSiteOrigin(siteUrl?: string): string {
  if (!siteUrl) return "";
  try {
    return new URL(siteUrl).origin;
  } catch {
    return siteUrl.replace(/\/$/, "");
  }
}

/**
 * 判断 href 是否为外部链接
 */
function isExternalHref(href: string, siteOrigin: string): boolean {
  // 锚点与查询：站内
  if (href.startsWith("#") || href.startsWith("?")) {
    return false;
  }
  // 协议相对 //host：视为外链（须在 "/" 判断之前，避免被误判为相对路径）
  if (href.startsWith("//")) return true;
  // 相对路径：站内
  if (href.startsWith("/")) {
    return false;
  }
  // mailto/tel/javascript 等非 http(s) 协议：不处理
  if (/^[a-z][a-z0-9+.-]*:/i.test(href) && !/^https?:/i.test(href)) {
    return false;
  }
  try {
    // 协议相对 //host 需基址解析；无 siteOrigin 时直接视为外链
    const base = href.startsWith("//") && siteOrigin ? siteOrigin : undefined;
    const url = new URL(href, base);
    return url.origin !== siteOrigin;
  } catch {
    // 非法 URL：保守不处理
    return false;
  }
}

export function wrapExternalLinks(
  html: string,
  options: WrapExternalLinksOptions = {},
): string {
  const siteOrigin = normalizeSiteOrigin(options.siteUrl);
  return html.replace(LINK_PATTERN, (match, attrs, _quote, href, text) => {
    if (HAS_TARGET.test(attrs)) return match;
    if (HAS_EXTURL_ICON.test(text)) return match;
    if (!isExternalHref(href, siteOrigin)) return match;

    const newAttrs = `${attrs} class="exturl" target="_blank" rel="noopener noreferrer"`;
    return `<a${newAttrs}>${text}<i class="i-ri-external-link-line" aria-hidden="true"></i></a>`;
  });
}
