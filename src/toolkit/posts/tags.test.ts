import { describe, expect, it } from "bun:test";
import { collectTagGroups, hasTagSlug } from "./tags";

describe("tag helpers", () => {
  it("groups tags by normalized slug", () => {
    const groups = collectTagGroups(["astro", "Astro", "MDX", "mdx", "shokaX"]);

    expect(groups).toEqual([
      { slug: "astro", name: "astro", count: 2 },
      { slug: "mdx", name: "MDX", count: 2 },
      { slug: "shokax", name: "shokaX", count: 1 },
    ]);
  });

  it("matches tags by normalized slug", () => {
    expect(hasTagSlug(["Astro", "MDX"], "astro")).toBe(true);
    expect(hasTagSlug(["Astro", "MDX"], "shokax")).toBe(false);
  });
});
