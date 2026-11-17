import { describe, expect, it } from "bun:test";
import { parseImageSize } from "./imageSize";

function pngBytes(width: number, height: number): Uint8Array {
  const bytes = new Uint8Array(24);
  bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 0);
  bytes.set([0x49, 0x48, 0x44, 0x52], 12); // IHDR
  new DataView(bytes.buffer).setUint32(16, width);
  new DataView(bytes.buffer).setUint32(20, height);
  return bytes;
}

describe("parseImageSize", () => {
  it("解析 PNG 的 IHDR 宽高", () => {
    expect(parseImageSize(pngBytes(1440, 1000))).toEqual({ width: 1440, height: 1000 });
  });

  it("解析 GIF 的逻辑屏幕尺寸", () => {
    const bytes = new Uint8Array(10);
    bytes.set([0x47, 0x49, 0x46, 0x38, 0x39, 0x61], 0); // GIF89a
    bytes[6] = 0x2c;
    bytes[7] = 0x01; // 300
    bytes[8] = 0x90;
    bytes[9] = 0x01; // 400
    expect(parseImageSize(bytes)).toEqual({ width: 300, height: 400 });
  });

  it("跳过 JPEG 前置段后读取 SOF0 宽高", () => {
    const bytes = new Uint8Array([
      0xff,
      0xd8, // SOI
      0xff,
      0xe0,
      0x00,
      0x04,
      0x00,
      0x00, // APP0，长度 4
      0xff,
      0xc0,
      0x00,
      0x11,
      0x08,
      0x02,
      0xbc,
      0x04,
      0x4c, // SOF0：700 x 1100
      0x00,
      0x00,
      0x00,
    ]);
    expect(parseImageSize(bytes)).toEqual({ width: 1100, height: 700 });
  });

  it("解析 WebP VP8X 扩展格式画布尺寸", () => {
    const bytes = new Uint8Array(30);
    bytes.set([0x52, 0x49, 0x46, 0x46], 0); // RIFF
    bytes.set([0x57, 0x45, 0x42, 0x50], 8); // WEBP
    bytes.set([0x56, 0x50, 0x38, 0x58], 12); // VP8X
    // 画布 1200 x 630（存储为减一的 24 位小端）
    bytes[24] = 1199 & 0xff;
    bytes[25] = (1199 >> 8) & 0xff;
    bytes[26] = (1199 >> 16) & 0xff;
    bytes[27] = 629 & 0xff;
    bytes[28] = (629 >> 8) & 0xff;
    bytes[29] = (629 >> 16) & 0xff;
    expect(parseImageSize(bytes)).toEqual({ width: 1200, height: 630 });
  });

  it("解析 WebP VP8L 无损格式宽高", () => {
    const bytes = new Uint8Array(30);
    bytes.set([0x52, 0x49, 0x46, 0x46], 0);
    bytes.set([0x57, 0x45, 0x42, 0x50], 8);
    bytes.set([0x56, 0x50, 0x38, 0x4c], 12); // VP8L
    bytes[20] = 0x2f;
    const bits = (800 - 1) | ((600 - 1) << 14);
    bytes[21] = bits & 0xff;
    bytes[22] = (bits >> 8) & 0xff;
    bytes[23] = (bits >> 16) & 0xff;
    bytes[24] = (bits >> 24) & 0xff;
    expect(parseImageSize(bytes)).toEqual({ width: 800, height: 600 });
  });

  it("解析 SVG 的 width/height 属性", () => {
    const bytes = new TextEncoder().encode(
      `<svg xmlns="http://www.w3.org/2000/svg" width="120px" height="60"><rect/></svg>`,
    );
    expect(parseImageSize(bytes)).toEqual({ width: 120, height: 60 });
  });

  it("无显式尺寸时回退到 viewBox", () => {
    const bytes = new TextEncoder().encode(`<svg viewBox="0 0 320 160"></svg>`);
    expect(parseImageSize(bytes)).toEqual({ width: 320, height: 160 });
  });

  it("未知格式返回 null", () => {
    expect(parseImageSize(new Uint8Array([1, 2, 3, 4]))).toBeNull();
    expect(parseImageSize(new Uint8Array(0))).toBeNull();
  });
});
