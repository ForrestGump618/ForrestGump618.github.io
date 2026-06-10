import { describe, expect, it } from "bun:test";
import { calculateReadTime, getExcerpt, transformIndexPosts } from "./transformIndexPosts";

type MockPost = {
  id: string;
  body?: string;
  data: {
    title: string;
    date: Date;
    description?: string;
    encrypted?: boolean;
    categories?: string[];
  };
};

describe("transformIndexPosts", () => {
  it("calculates read time with ceil strategy", () => {
    expect(calculateReadTime(0)).toBe(0);
    expect(calculateReadTime(1)).toBe(1);
    expect(calculateReadTime(300)).toBe(1);
    expect(calculateReadTime(301)).toBe(2);
  });

  it("returns encrypted excerpt when post is encrypted", () => {
    const post: MockPost = {
      id: "encrypted-post",
      body: "secret content",
      data: {
        title: "Encrypted",
        date: new Date("2025-01-01T00:00:00Z"),
        encrypted: true,
        description: "should not show",
      },
    };

    // eslint-disable-next-line no-unsafe-type-assertion
    expect(getExcerpt(post as any, "[ENCRYPTED]")).toBe("[ENCRYPTED]");
  });

  it("prioritizes description, then falls back to body excerpt", () => {
    const withDescription: MockPost = {
      id: "with-description",
      body: "this body should not be used",
      data: {
        title: "With Description",
        date: new Date("2025-01-01T00:00:00Z"),
        description: "description first",
      },
    };

    const longBody = "a".repeat(350);
    const withoutDescription: MockPost = {
      id: "without-description",
      body: longBody,
      data: {
        title: "Without Description",
        date: new Date("2025-01-01T00:00:00Z"),
      },
    };

    // eslint-disable-next-line no-unsafe-type-assertion
    expect(getExcerpt(withDescription as any, "[ENCRYPTED]")).toBe("description first");
    // eslint-disable-next-line no-unsafe-type-assertion
    expect(getExcerpt(withoutDescription as any, "[ENCRYPTED]")).toBe(longBody.slice(0, 300));
  });

  it("builds transformed cards with url, category and stats", () => {
    const body = Array.from({ length: 301 }, (_, i) => `w${i}`).join(" ");
    const post: MockPost = {
      id: "folder/Hello World.md",
      body,
      data: {
        title: "Hello",
        date: new Date("2025-01-02T00:00:00Z"),
        categories: ["父级", "末级"],
      },
    };

    // eslint-disable-next-line no-unsafe-type-assertion
    const transformed = transformIndexPosts([post as any], {
      encryptedExcerpt: "[ENCRYPTED]",
      // eslint-disable-next-line no-unsafe-type-assertion
      resolveCover: () => "cover://test" as any,
    });

    expect(transformed).toHaveLength(1);
    expect(transformed[0]).toMatchObject({
      title: "Hello",
      url: "/posts/folder/Hello%20World/",
      excerpt: body.slice(0, 300),
      category: "末级",
      categoryUrl: "/categories/%E6%9C%AB%E7%BA%A7/",
      wordCount: 301,
      readTime: 2,
      cover: "cover://test",
    });
  });

  it("returns undefined category fields when category list is empty", () => {
    const post: MockPost = {
      id: "no-category",
      body: "one two",
      data: {
        title: "No Category",
        date: new Date("2025-01-03T00:00:00Z"),
        categories: [],
      },
    };

    // eslint-disable-next-line no-unsafe-type-assertion
    const transformed = transformIndexPosts([post as any], {
      encryptedExcerpt: "[ENCRYPTED]",
    });

    expect(transformed[0].category).toBeUndefined();
    expect(transformed[0].categoryUrl).toBeUndefined();
  });
});
