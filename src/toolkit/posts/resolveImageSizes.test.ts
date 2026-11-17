import { afterAll, describe, expect, it } from "bun:test";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { resolveImageSizes } from "./resolveImageSizes";

function pngBytes(width: number, height: number): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(24);
  bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 0);
  bytes.set([0x49, 0x48, 0x44, 0x52], 12);
  new DataView(bytes.buffer).setUint32(16, width);
  new DataView(bytes.buffer).setUint32(20, height);
  return bytes;
}

const dir = await mkdtemp(path.join(tmpdir(), "image-sizes-"));
afterAll(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe("resolveImageSizes", () => {
  it("解析相对路径与站内绝对路径的本地图片", async () => {
    await writeFile(path.join(dir, "local.png"), pngBytes(640, 480));
    await writeFile(path.join(dir, "abs.png"), pngBytes(100, 50));

    const html = `<img src="./local.png"><img src="/abs.png">`;
    const sizes = await resolveImageSizes(html, { baseDir: dir, publicDir: dir });
    expect(sizes.get("./local.png")).toEqual({ width: 640, height: 480 });
    expect(sizes.get("/abs.png")).toEqual({ width: 100, height: 50 });
  });

  it("远程图片走注入的 fetch，失败时静默跳过", async () => {
    const html = `<img src="https://example.com/a.png"><img src="https://example.com/bad.png">`;
    const fetchImpl = async (input: RequestInfo | URL): Promise<Response> => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      if (url.endsWith("bad.png")) {
        throw new Error("network down");
      }
      return new Response(pngBytes(800, 600));
    };

    const sizes = await resolveImageSizes(html, { fetchImpl });
    expect(sizes.get("https://example.com/a.png")).toEqual({ width: 800, height: 600 });
    expect(sizes.has("https://example.com/bad.png")).toBe(false);
  });

  it("已声明尺寸、data URI 与无法解析的图片被跳过", async () => {
    const html = [
      `<img src="https://example.com/sized.png" width="10" height="10">`,
      `<img src="data:image/png;base64,AAAA">`,
      `<img src="./missing.png">`,
    ].join("");
    let calls = 0;
    const fetchImpl = async (): Promise<Response> => {
      calls += 1;
      return new Response(pngBytes(1, 1));
    };

    const sizes = await resolveImageSizes(html, { baseDir: dir, fetchImpl });
    expect(calls).toBe(0);
    expect(sizes.size).toBe(0);
  });

  it("同一 src 只解析一次", async () => {
    const html = `<img src="https://example.com/x.png"><img src="https://example.com/x.png">`;
    let calls = 0;
    const fetchImpl = async (): Promise<Response> => {
      calls += 1;
      return new Response(pngBytes(2, 2));
    };

    const sizes = await resolveImageSizes(html, { fetchImpl });
    expect(calls).toBe(1);
    expect(sizes.get("https://example.com/x.png")).toEqual({ width: 2, height: 2 });
  });
});
