import path from "node:path";
import { fileURLToPath } from "node:url";

import type { Loader, LoaderContext, ParseDataOptions } from "astro/loaders";

export const FOLDER_CATEGORY_TOKEN = "${folder}";

type FrontmatterCategories = string | string[] | null | undefined;

export function resolveFolderCategories(filePath: string, postsBasePath: string): string[] {
  const relativePath = path.relative(postsBasePath, filePath);
  const directory = path.dirname(relativePath);

  if (!directory || directory === ".") {
    return [];
  }

  return directory
    .split(path.sep)
    .map((segment) => segment.trim())
    .filter(Boolean);
}

export function normalizeFolderCategories(
  categories: FrontmatterCategories,
  filePath: string | undefined,
  postsBasePath: string,
): FrontmatterCategories {
  if (!filePath) {
    return categories;
  }

  const shouldUseFolder =
    categories === FOLDER_CATEGORY_TOKEN ||
    (Array.isArray(categories) &&
      categories.length === 1 &&
      categories[0] === FOLDER_CATEGORY_TOKEN);

  return shouldUseFolder ? resolveFolderCategories(filePath, postsBasePath) : categories;
}

export function withFolderCategories(loader: Loader, postsBase = "src/posts"): Loader {
  return {
    ...loader,
    name: `${loader.name}-folder-categories`,
    async load(context: LoaderContext) {
      const postsBasePath = path.resolve(fileURLToPath(context.config.root), postsBase);

      await loader.load({
        ...context,
        parseData<TData extends Record<string, unknown>>(
          props: ParseDataOptions<TData>,
        ): Promise<TData> {
          const data = {
            ...props.data,
            categories: normalizeFolderCategories(
              props.data.categories as FrontmatterCategories,
              props.filePath,
              postsBasePath,
            ),
          };

          return context.parseData({
            ...props,
            data,
          });
        },
      });
    },
  };
}
