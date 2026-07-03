const IMAGE_TAG_PATTERN = /<img(?<attributes>[^>]*?)\s*\/?>/g;

// 提取 title 属性（双引号或单引号，非空）
const TITLE_PATTERN = /\btitle=(?<quote>["'])(?<title>[^"']+)\k<quote>/i;

/**
 * 图片后处理：
 * - 带 title 的图片渲染为 <figure class="md-figure"><image-zoom><img/></image-zoom><figcaption>title</figcaption></figure>
 * - 无 title 的图片保持原有行为：<image-zoom><img/></image-zoom>
 *
 * title 来自 GFM 图片语法 `![alt](src "title")`，satteri 会输出为 <img title="...">。
 * alt 作为无障碍替代文本保留在 img 上，title 用作可见说明。
 */
export function wrapRenderedImages(html: string): string {
  return html.replace(IMAGE_TAG_PATTERN, (_, attributes = "") => {
    const img = `<img${attributes}>`;
    const titleMatch = attributes.match(TITLE_PATTERN);
    if (!titleMatch) {
      return `<image-zoom>${img}</image-zoom>`;
    }
    const title = titleMatch.groups!.title;
    return `<figure class="md-figure"><image-zoom>${img}</image-zoom><figcaption>${title}</figcaption></figure>`;
  });
}
