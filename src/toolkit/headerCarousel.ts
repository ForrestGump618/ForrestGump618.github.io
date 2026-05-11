import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { ImageMetadata } from "astro";

export type HeaderCarouselCover = ImageMetadata | string;

export function normalizeCarouselCoverPayload(payload: unknown): string[] {
  if (Array.isArray(payload)) {
    return payload.filter(
      (item): item is string => typeof item === "string" && item.trim().length > 0,
    );
  }

  if (typeof payload === "object" && payload !== null) {
    const record = payload as Record<string, unknown>;

    if (Array.isArray(record.images)) {
      return record.images.filter(
        (item): item is string => typeof item === "string" && item.trim().length > 0,
      );
    }

    if (Array.isArray(record.urls)) {
      return record.urls.filter(
        (item): item is string => typeof item === "string" && item.trim().length > 0,
      );
    }
  }

  return [];
}

export async function loadCarouselSource(source?: string): Promise<string[]> {
  if (!source) return [];

  try {
    if (/^https?:\/\//.test(source)) {
      const response = await fetch(source);
      if (!response.ok) return [];
      const payload = (await response.json()) as unknown;
      return normalizeCarouselCoverPayload(payload);
    }

    if (source.startsWith("/")) {
      const projectRoot = path.dirname(fileURLToPath(import.meta.url));
      const rootDir = path.resolve(projectRoot, "..");
      const filePath = path.join(rootDir, "..", "public", source.replace(/^\//, ""));
      const raw = await readFile(filePath, "utf-8");
      return normalizeCarouselCoverPayload(JSON.parse(raw) as unknown);
    }
  } catch {
    return [];
  }

  return [];
}

export async function resolveHeaderCarouselCovers(options: {
  carouselUrls?: string[];
  carouselSource?: string;
  fallbackCovers: HeaderCarouselCover[];
}): Promise<HeaderCarouselCover[]> {
  const directCarouselUrls = (options.carouselUrls || []).filter(
    (item): item is string => typeof item === "string" && item.trim().length > 0,
  );

  if (directCarouselUrls.length > 0) {
    return directCarouselUrls;
  }

  const sourceCarouselUrls = await loadCarouselSource(options.carouselSource);
  if (sourceCarouselUrls.length > 0) {
    return sourceCarouselUrls;
  }

  return options.fallbackCovers;
}
