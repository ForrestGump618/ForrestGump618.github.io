import { describe, expect, it } from "bun:test";
import { wrapRenderedImages } from "./wrapRenderedImages";

describe("wrapRenderedImages", () => {
  it("无 title 的图片包装为 image-zoom", () => {
    const html = `<p><img src="/a.png" alt="alt"/></p>`;
    const out = wrapRenderedImages(html);
    expect(out).toBe(`<p><image-zoom><img src="/a.png" alt="alt"></image-zoom></p>`);
  });

  it("带 title 的图片包装为 figure + figcaption", () => {
    const html = `<img src="/a.png" alt="alt" title="说明文字"/>`;
    const out = wrapRenderedImages(html);
    expect(out).toBe(
      `<figure class="md-figure"><image-zoom><img src="/a.png" alt="alt" title="说明文字"></image-zoom><figcaption>说明文字</figcaption></figure>`,
    );
  });

  it("单引号 title 也被识别", () => {
    const html = `<img src="/a.png" title='cap'/>`;
    const out = wrapRenderedImages(html);
    expect(out).toContain("<figcaption>cap</figcaption>");
    expect(out).toContain('class="md-figure"');
  });

  it("空 title 不触发 figure", () => {
    const html = `<img src="/a.png" title=""/>`;
    const out = wrapRenderedImages(html);
    expect(out).toBe(`<image-zoom><img src="/a.png" title=""></image-zoom>`);
  });

  it("无 title 属性保持原行为", () => {
    const html = `<img src="/a.png"/>`;
    expect(wrapRenderedImages(html)).toBe(`<image-zoom><img src="/a.png"></image-zoom>`);
  });

  it("处理多张图片", () => {
    const html = `<img src="/a.png"/><img src="/b.png" title="b 说明"/>`;
    const out = wrapRenderedImages(html);
    expect(out).toContain('<image-zoom><img src="/a.png"></image-zoom>');
    expect(out).toContain("<figcaption>b 说明</figcaption>");
  });

  it("img 无自闭合斜杠也能匹配", () => {
    const html = `<img src="/a.png" title="cap">`;
    const out = wrapRenderedImages(html);
    expect(out).toContain("<figcaption>cap</figcaption>");
  });
});
