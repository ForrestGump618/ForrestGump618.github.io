import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { ImageMetadata } from "astro";
import defineCovers from "@/covers.config";

export type HeaderCarouselCover = ImageMetadata | string;

export async function resolveHeaderCovers(options: {
  carouselUrls?: string[];
  fallbackCovers: HeaderCarouselCover[];
}): Promise<HeaderCarouselCover[]> {
  const directCarouselUrls = (options.carouselUrls || []).filter(
    (item): item is string => typeof item === "string" && item.trim().length > 0,
  );

  if (directCarouselUrls.length > 0) {
    return directCarouselUrls;
  }

  const sourceCarouselUrls = defineCovers.urls;
  if (sourceCarouselUrls.length > 0) {
    return sourceCarouselUrls;
  }

  return options.fallbackCovers;
}
