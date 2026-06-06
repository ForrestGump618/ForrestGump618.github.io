import type { ImageMetadata } from "astro";
import type { CollectionEntry } from "astro:content";
import { countWords } from "./calculateStats";
import { toCategoryHref, toPostHref } from "./url";

const DEFAULT_EXCERPT_LENGTH = 300;
const DEFAULT_WORDS_PER_MINUTE = 300;

export interface TransformedIndexPost {
  slug: string;
  title: string;
  url: string;
  date: Date;
  excerpt: string;
  cover?: ImageMetadata | string;
  category?: string;
  categoryUrl?: string;
  wordCount: number;
  readTime: number;
}

export interface TransformIndexPostsOptions {
  encryptedExcerpt: string;
  excerptLength?: number;
  wordsPerMinute?: number;
  resolveCover?: (post: CollectionEntry<"posts">) => ImageMetadata | string | undefined;
}

export function calculateReadTime(
  wordCount: number,
  wordsPerMinute: number = DEFAULT_WORDS_PER_MINUTE,
): number {
  if (wordCount <= 0 || wordsPerMinute <= 0) {
    return 0;
  }

  return Math.ceil(wordCount / wordsPerMinute);
}

export function getExcerpt(
  post: CollectionEntry<"posts">,
  encryptedExcerpt: string,
  excerptLength: number = DEFAULT_EXCERPT_LENGTH,
): string {
  if (post.data.encrypted) {
    return encryptedExcerpt;
  }

  if (post.data.description) {
    return post.data.description;
  }

  if (post.body) {
    return post.body.slice(0, excerptLength);
  }

  return "";
}

export function transformIndexPosts(
  postList: CollectionEntry<"posts">[],
  options: TransformIndexPostsOptions,
): TransformedIndexPost[] {
  const {
    encryptedExcerpt,
    excerptLength = DEFAULT_EXCERPT_LENGTH,
    wordsPerMinute = DEFAULT_WORDS_PER_MINUTE,
    resolveCover,
  } = options;

  return postList.map((post) => {
    const wordCount = countWords(post.body || "");
    const readTime = calculateReadTime(wordCount, wordsPerMinute);
    const lastCategory = post.data.categories?.at(-1);

    return {
      slug: post.id,
      title: post.data.title,
      url: toPostHref(post.id),
      date: post.data.date,
      excerpt: getExcerpt(post, encryptedExcerpt, excerptLength),
      cover: resolveCover?.(post),
      category: lastCategory,
      categoryUrl: lastCategory ? toCategoryHref(lastCategory) : undefined,
      wordCount,
      readTime,
    };
  });
}
