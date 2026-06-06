export interface CoverConfig {
  urls: string[];
}

export function defineCovers(urls: string[]): CoverConfig {
  const processedUrls = (urls || [])
    .filter((url) => typeof url === "string" && url.trim().length > 0)
    .map((url) => url.trim());

  return {
    urls: [...new Set(processedUrls)],
  };
}
