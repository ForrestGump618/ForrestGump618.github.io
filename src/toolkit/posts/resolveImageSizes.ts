/**
 * 构建期解析正文 HTML 中图片的真实尺寸：
 * 本地图片读文件头，远程图片只 fetch 头部字节（带超时，失败静默跳过）。
 * 结果交给 wrapRenderedImages 注入 width/height，让浏览器提前预留纵横比。
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { type ImageSize, parseImageSize } from "./imageSize";

const IMG_TAG_PATTERN = /<img\b[^>]*>/gi;
const SRC_PATTERN = /\bsrc\s*=\s*(["'])(?<src>[^"']+)\1/i;

export type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export interface ResolveImageSizesOptions {
  /** 文章文件所在目录，用于解析相对路径图片 */
  baseDir?: string;
  /** 站点 public 目录，用于解析 / 开头的站内图片 */
  publicDir?: string;
  fetchImpl?: FetchLike;
  timeoutMs?: number;
}

function toLocalPath(src: string, options: ResolveImageSizesOptions): string | null {
  const clean = src.split(/[?#]/)[0] ?? "";
  if (!clean || clean.startsWith("data:")) {
    return null;
  }
  if (clean.startsWith("/")) {
    return options.publicDir ? path.join(options.publicDir, clean) : null;
  }
  return options.baseDir ? path.resolve(options.baseDir, clean) : null;
}

async function readRemoteSize(
  src: string,
  fetchImpl: FetchLike,
  timeoutMs: number,
): Promise<ImageSize | null> {
  const response = await fetchImpl(src, {
    signal: AbortSignal.timeout(timeoutMs),
    headers: { Range: "bytes=0-65535" },
  });
  if (!response.ok && response.status !== 206) {
    return null;
  }
  const buffer = new Uint8Array(await response.arrayBuffer());
  return parseImageSize(buffer);
}

export async function resolveImageSizes(
  html: string,
  options: ResolveImageSizesOptions = {},
): Promise<Map<string, ImageSize>> {
  const { fetchImpl = fetch, timeoutMs = 8000 } = options;
  const pending = new Map<string, Promise<ImageSize | null>>();

  for (const tag of html.match(IMG_TAG_PATTERN) ?? []) {
    // 已声明尺寸的图片无需解析
    if (/\bwidth\s*=/i.test(tag) && /\bheight\s*=/i.test(tag)) {
      continue;
    }
    const src = tag.match(SRC_PATTERN)?.groups?.src;
    if (!src || src.startsWith("data:") || pending.has(src)) {
      continue;
    }

    const task = /^https?:\/\//i.test(src)
      ? readRemoteSize(src, fetchImpl, timeoutMs).catch(() => null)
      : (() => {
          const localPath = toLocalPath(src, options);
          if (!localPath) {
            return Promise.resolve(null);
          }
          return readFile(localPath)
            .then((buffer) => parseImageSize(new Uint8Array(buffer)))
            .catch(() => null);
        })();

    pending.set(src, task);
  }

  const sizes = new Map<string, ImageSize>();
  await Promise.all(
    [...pending.entries()].map(async ([src, task]) => {
      const size = await task;
      if (size) {
        sizes.set(src, size);
      }
    }),
  );
  return sizes;
}
