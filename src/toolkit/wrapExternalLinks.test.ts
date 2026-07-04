import { describe, expect, it } from "bun:test";
import { wrapExternalLinks } from "./wrapExternalLinks";

describe("wrapExternalLinks", () => {
  const siteUrl = "https://example.com";

  it("为外链添加 target/rel/exturl 与图标", () => {
    const html = `<p>见 <a href="https://astro.build/">Astro</a> 官网。</p>`;
    const out = wrapExternalLinks(html, { siteUrl });
    expect(out).toContain('target="_blank"');
    expect(out).toContain('rel="noopener noreferrer"');
    expect(out).toContain('class="exturl"');
    expect(out).toContain("i-ri-external-link-line");
    expect(out).toContain("Astro<i");
  });

  it("保留链接原始文本", () => {
    const html = `<a href="https://foo.bar/baz">点击 <strong>这里</strong></a>`;
    const out = wrapExternalLinks(html, { siteUrl });
    expect(out).toContain("点击 <strong>这里</strong>");
  });

  it("站内绝对 URL 不处理", () => {
    const html = `<a href="https://example.com/posts/hello/">hello</a>`;
    expect(wrapExternalLinks(html, { siteUrl })).toBe(html);
  });

  it("相对路径不处理", () => {
    const html = `<a href="/posts/hello/">hello</a>`;
    expect(wrapExternalLinks(html, { siteUrl })).toBe(html);
  });

  it("锚点不处理", () => {
    const html = `<a href="#section">跳转</a>`;
    expect(wrapExternalLinks(html, { siteUrl })).toBe(html);
  });

  it("mailto/tel 协议不处理", () => {
    const mail = `<a href="mailto:a@b.com">mail</a>`;
    const tel = `<a href="tel:+861234">call</a>`;
    expect(wrapExternalLinks(mail, { siteUrl })).toBe(mail);
    expect(wrapExternalLinks(tel, { siteUrl })).toBe(tel);
  });

  it("协议相对 URL 视为外链", () => {
    const html = `<a href="//cdn.example.com/x">cdn</a>`;
    const out = wrapExternalLinks(html, { siteUrl });
    expect(out).toContain('target="_blank"');
  });

  it("已有 target 属性不重复处理", () => {
    const html = `<a href="https://foo.bar" target="_self">x</a>`;
    expect(wrapExternalLinks(html, { siteUrl })).toBe(html);
  });

  it("已带外链图标不重复嵌套", () => {
    const html = `<a href="https://foo.bar">x<i class="i-ri-external-link-line"></i></a>`;
    expect(wrapExternalLinks(html, { siteUrl })).toBe(html);
  });

  it("无 siteUrl 时所有 http(s) 绝对 URL 视为外链", () => {
    const html = `<a href="https://foo.bar">x</a>`;
    const out = wrapExternalLinks(html);
    expect(out).toContain('target="_blank"');
  });

  it("非法 href 不处理", () => {
    const html = `<a href="https://[invalid">x</a>`;
    expect(wrapExternalLinks(html, { siteUrl })).toBe(html);
  });

  it("siteUrl 末尾斜杠被规范化", () => {
    const html = `<a href="https://example.com/x">x</a>`;
    expect(wrapExternalLinks(html, { siteUrl: "https://example.com/" })).toBe(html);
  });

  it("siteUrl 含子路径时仍按 origin 比对", () => {
    const html = `<a href="https://example.com/posts/a">a</a>`;
    expect(wrapExternalLinks(html, { siteUrl: "https://example.com/blog" })).toBe(html);
  });
});
