import type { ImageMetadata } from "astro";
import coversConfig from "@/covers.config";

export type HeaderCover = ImageMetadata | string;

export async function resolveHeaderCovers(options: {
  coverUrls?: string[];
  fallbackCovers: HeaderCover[];
}): Promise<HeaderCover[]> {
  const directCoverUrls = (options.coverUrls || [])
    .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    .map((url) => url.trim());

  if (directCoverUrls.length > 0) {
    return directCoverUrls;
  }

  const configCoverUrls = coversConfig.urls;
  if (configCoverUrls.length > 0) {
    return configCoverUrls;
  }

  return options.fallbackCovers;
}
