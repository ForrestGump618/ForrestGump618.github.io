import { toTagSlug } from "./url";

export interface TagGroup {
  slug: string;
  name: string;
  count: number;
}

export function collectTagGroups(tags: Iterable<string>): TagGroup[] {
  const groups = new Map<string, TagGroup>();

  for (const tag of tags) {
    const name = tag.trim();
    const slug = toTagSlug(name);

    if (!slug) continue;

    const current = groups.get(slug);
    if (current) {
      current.count += 1;
      continue;
    }

    groups.set(slug, {
      slug,
      name,
      count: 1,
    });
  }

  return Array.from(groups.values());
}

export function hasTagSlug(tags: readonly string[] | null | undefined, slug: string): boolean {
  return (tags ?? []).some((tag) => toTagSlug(tag) === slug);
}
