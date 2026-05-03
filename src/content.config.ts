import { glob } from "astro/loaders";
import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { FOLDER_CATEGORY_TOKEN, withFolderCategories } from "./toolkit/posts/folderCategories";

const posts = defineCollection({
  loader: withFolderCategories(
    glob({
      pattern: "**/*.{md,mdx}",
      base: "src/posts",
    }),
  ),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string().optional(),
      date: z.date().refine((date) => !Number.isNaN(date.getTime()), {
        message: "Invalid date format",
      }),
      updated: z.date().optional(),
      tags: z.array(z.string()).nullable().optional(),
      categories: z.preprocess(
        (categories) =>
          categories === FOLDER_CATEGORY_TOKEN ? [FOLDER_CATEGORY_TOKEN] : categories,
        z.array(z.string()).nullable().optional(),
      ),
      draft: z.boolean().optional(),
      cover: image().optional(),
      sticky: z.boolean().optional(),
      license: z
        .enum([
          "CC-BY-4.0",
          "CC-BY-SA-4.0",
          "CC-BY-ND-4.0",
          "CC-BY-NC-4.0",
          "CC-BY-NC-SA-4.0",
          "CC-BY-NC-ND-4.0",
          "NOREPRINT",
        ])
        .optional(),
      // 加密相关字段
      encrypted: z.boolean().default(false),
      password: z.string().optional(), // 构建时用于加密，不会输出到前端
    }),
});

// 动态/说说集合
const moments = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: "src/moments",
  }),
  schema: ({ image }) =>
    z.object({
      date: z.date().refine((date) => !Number.isNaN(date.getTime()), {
        message: "Invalid date format",
      }),
      images: z.array(z.union([z.string(), image()])).optional(),
    }),
});

export const collections = {
  posts,
  moments,
};
