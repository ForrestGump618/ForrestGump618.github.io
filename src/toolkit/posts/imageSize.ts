/**
 * 图片真实尺寸解析：只读文件头部字节，支持 PNG / JPEG / GIF / WebP / SVG。
 * 用于构建期为正文图片注入 width/height，避免懒加载图片撑开布局引发整页重排。
 */

export interface ImageSize {
  width: number;
  height: number;
}

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

function readU32BE(bytes: Uint8Array, offset: number): number {
  return (
    (((bytes[offset] ?? 0) << 24) |
      ((bytes[offset + 1] ?? 0) << 16) |
      ((bytes[offset + 2] ?? 0) << 8) |
      (bytes[offset + 3] ?? 0)) >>>
    0
  );
}

function readU16LE(bytes: Uint8Array, offset: number): number {
  return (bytes[offset] ?? 0) | ((bytes[offset + 1] ?? 0) << 8);
}

function readU24LE(bytes: Uint8Array, offset: number): number {
  return (bytes[offset] ?? 0) | ((bytes[offset + 1] ?? 0) << 8) | ((bytes[offset + 2] ?? 0) << 16);
}

function parsePng(bytes: Uint8Array): ImageSize | null {
  if (bytes.length < 24) {
    return null;
  }
  if (!PNG_SIGNATURE.every((byte, index) => bytes[index] === byte)) {
    return null;
  }
  const width = readU32BE(bytes, 16);
  const height = readU32BE(bytes, 20);
  return width > 0 && height > 0 ? { width, height } : null;
}

function parseGif(bytes: Uint8Array): ImageSize | null {
  if (bytes.length < 10) {
    return null;
  }
  const header = String.fromCharCode(...bytes.slice(0, 4));
  if (header !== "GIF8") {
    return null;
  }
  const width = readU16LE(bytes, 6);
  const height = readU16LE(bytes, 8);
  return width > 0 && height > 0 ? { width, height } : null;
}

function parseJpeg(bytes: Uint8Array): ImageSize | null {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) {
    return null;
  }

  let offset = 2;
  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = bytes[offset + 1] ?? 0;
    // 无负载的独立标记
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      offset += 2;
      continue;
    }
    if (marker === 0xd9) {
      return null;
    }

    const length = ((bytes[offset + 2] ?? 0) << 8) | (bytes[offset + 3] ?? 0);
    const isSof =
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf);

    if (isSof) {
      const height = ((bytes[offset + 5] ?? 0) << 8) | (bytes[offset + 6] ?? 0);
      const width = ((bytes[offset + 7] ?? 0) << 8) | (bytes[offset + 8] ?? 0);
      return width > 0 && height > 0 ? { width, height } : null;
    }

    if (length < 2) {
      return null;
    }
    offset += 2 + length;
  }

  return null;
}

function parseWebp(bytes: Uint8Array): ImageSize | null {
  if (bytes.length < 30) {
    return null;
  }
  const riff = String.fromCharCode(...bytes.slice(0, 4));
  const webp = String.fromCharCode(...bytes.slice(8, 12));
  if (riff !== "RIFF" || webp !== "WEBP") {
    return null;
  }

  const chunk = String.fromCharCode(...bytes.slice(12, 16));
  if (chunk === "VP8 ") {
    // 有损帧：3 字节帧标签 + 3 字节起始码后为 14 位宽高
    if (bytes[23] !== 0x9d || bytes[24] !== 0x01 || bytes[25] !== 0x2a) {
      return null;
    }
    const width = readU16LE(bytes, 26) & 0x3fff;
    const height = readU16LE(bytes, 28) & 0x3fff;
    return width > 0 && height > 0 ? { width, height } : null;
  }

  if (chunk === "VP8L") {
    if (bytes[20] !== 0x2f) {
      return null;
    }
    const bits =
      (bytes[21] ?? 0) |
      ((bytes[22] ?? 0) << 8) |
      ((bytes[23] ?? 0) << 16) |
      ((bytes[24] ?? 0) << 24);
    const width = (bits & 0x3fff) + 1;
    const height = ((bits >>> 14) & 0x3fff) + 1;
    return { width, height };
  }

  if (chunk === "VP8X") {
    const width = readU24LE(bytes, 24) + 1;
    const height = readU24LE(bytes, 27) + 1;
    return { width, height };
  }

  return null;
}

function parseSvg(bytes: Uint8Array): ImageSize | null {
  const head = new TextDecoder().decode(bytes.slice(0, 4096));
  const tag = head.match(/<svg\b[^>]*>/i)?.[0];
  if (!tag) {
    return null;
  }

  const widthAttr = tag.match(/\bwidth\s*=\s*["']\s*([\d.]+)\s*(?:px)?\s*["']/i);
  const heightAttr = tag.match(/\bheight\s*=\s*["']\s*([\d.]+)\s*(?:px)?\s*["']/i);
  if (widthAttr && heightAttr) {
    const width = Math.round(Number(widthAttr[1]));
    const height = Math.round(Number(heightAttr[1]));
    if (width > 0 && height > 0) {
      return { width, height };
    }
  }

  const viewBox = tag.match(
    /\bviewBox\s*=\s*["']\s*[\d.-]+[\s,]+[\d.-]+[\s,]+([\d.]+)[\s,]+([\d.]+)/i,
  );
  if (viewBox) {
    const width = Math.round(Number(viewBox[1]));
    const height = Math.round(Number(viewBox[2]));
    if (width > 0 && height > 0) {
      return { width, height };
    }
  }

  return null;
}

export function parseImageSize(bytes: Uint8Array): ImageSize | null {
  return (
    parsePng(bytes) ?? parseGif(bytes) ?? parseJpeg(bytes) ?? parseWebp(bytes) ?? parseSvg(bytes)
  );
}
