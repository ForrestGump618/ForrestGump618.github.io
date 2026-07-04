import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getCollection } from "astro:content";
import themeConfig from "@/theme.config";
import { toPostHref } from "@/toolkit/posts/url";

// 生成站点 RSS 订阅源（/rss.xml）
export async function GET(context: APIContext) {
  const posts = await getCollection("posts");
  const published = posts
    .filter((post) => !post.data.draft)
    .toSorted((a, b) => b.data.date.getTime() - a.data.date.getTime());

  const siteName = themeConfig.siteName;
  const description =
    themeConfig.sidebar?.description || themeConfig.brand?.subtitle || `${siteName} 的文章订阅`;

  return rss({
    title: siteName,
    description,
    // 项目路由要求保留尾斜杠
    trailingSlash: true,
    site: context.site ?? "https://preview.astro.kaitaku.xyz",
    items: published.map((post) => ({
      title: post.data.title,
      description:
        post.data.description || (post.body ?? "").slice(0, 150).replace(/\s+/g, " ").trim(),
      pubDate: post.data.date,
      link: toPostHref(post.id),
      categories: post.data.categories ?? undefined,
    })),
  });
}
