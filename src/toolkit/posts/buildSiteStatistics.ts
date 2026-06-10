import type { Post } from "@/toolkit/posts/types";

export interface CountItem {
  name: string;
  count: number;
}

export interface MonthlyPostCount {
  year: number;
  month: number;
  label: string;
  count: number;
}

export interface SitePostStatistics {
  totalPosts: number;
  totalCategories: number;
  totalTags: number;
  topCategory: CountItem | null;
  monthlyPostCounts: MonthlyPostCount[];
  categoryCounts: CountItem[];
  tagCounts: CountItem[];
}

interface BuildSiteStatisticsOptions {
  includeDrafts?: boolean;
}

function sortCountItems(map: Map<string, number>): CountItem[] {
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .toSorted((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function buildSiteStatistics(
  posts: Post[],
  options: BuildSiteStatisticsOptions = {},
): SitePostStatistics {
  const includeDrafts = options.includeDrafts ?? false;
  const publishedPosts = includeDrafts ? posts : posts.filter((post) => !post.data.draft);

  const monthlyMap = new Map<string, number>();
  const categoryMap = new Map<string, number>();
  const tagMap = new Map<string, number>();

  publishedPosts.forEach((post) => {
    const date = post.data.date;
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const monthKey = `${year}-${String(month).padStart(2, "0")}`;
    monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + 1);

    (post.data.categories || []).forEach((category) => {
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    });

    (post.data.tags || []).forEach((tag) => {
      tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
    });
  });

  const monthlyPostCounts: MonthlyPostCount[] = Array.from(monthlyMap.entries())
    .map(([label, count]) => {
      const [yearText, monthText] = label.split("-");
      return {
        year: Number(yearText),
        month: Number(monthText),
        label,
        count,
      };
    })
    .toSorted((a, b) => a.year - b.year || a.month - b.month);

  const categoryCounts = sortCountItems(categoryMap);
  const tagCounts = sortCountItems(tagMap);

  return {
    totalPosts: publishedPosts.length,
    totalCategories: categoryCounts.length,
    totalTags: tagCounts.length,
    topCategory: categoryCounts[0] || null,
    monthlyPostCounts,
    categoryCounts,
    tagCounts,
  };
}
