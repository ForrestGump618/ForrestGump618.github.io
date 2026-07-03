import { describe, expect, it } from "bun:test";
import { wrapCodeGroups } from "./wrapCodeGroups";
const pre = (lang: string, body = "code") =>
  `<pre class="astro-code astro-code-themes" data-language="${lang}">${body}</pre>`;
const codeBlock = (lang: string, body = "code") =>
  `<code-block>${pre(lang, body)}</code-block>`;

describe("wrapCodeGroups", () => {
  it("将 code-group 内的多个 code-block 重组为 Tabs 结构", () => {
    const html = `<div class="code-group">${codeBlock("js")}${codeBlock("ts")}</div>`;
    const out = wrapCodeGroups(html);
    expect(out).toContain('class="tabs code-group"');
    expect(out).toContain('data-tab-label="JS"');
    expect(out).toContain('data-tab-label="TS"');
    expect(out).toContain('data-tab-value="cg-0"');
    expect(out).toContain('data-tab-value="cg-1"');
    expect(out).toContain('role="tablist"');
    // 每个 tab 内仍保留 code-block
    expect(out).toContain("<code-block>");
  });

  it("空 code-group（无 code-block）保持原样", () => {
    const html = `<div class="code-group"><p>no code</p></div>`;
    expect(wrapCodeGroups(html)).toBe(html);
  });

  it("单个 code-block 也生成 Tabs（客户端会隐藏 nav）", () => {
    const html = `<div class="code-group">${codeBlock("js")}</div>`;
    const out = wrapCodeGroups(html);
    expect(out).toContain('data-tab-label="JS"');
    expect(out).toContain('class="tabs code-group"');
  });

  it("无法识别语言时使用 Tab N 作为标签", () => {
    const html = `<div class="code-group"><code-block><pre class="astro-code">x</pre></code-block></div>`;
    const out = wrapCodeGroups(html);
    expect(out).toContain('data-tab-label="Tab 1"');
  });

  it("优先使用 data-language 属性提取语言", () => {
    const html = `<div class="code-group">${codeBlock("js")}</div>`;
    const out = wrapCodeGroups(html);
    expect(out).toContain('data-tab-label="JS"');
  });

  it("回退到 class 中的 language-XXX", () => {
    const html = `<div class="code-group"><code-block><pre class="astro-code language-python">x</pre></code-block></div>`;
    const out = wrapCodeGroups(html);
    expect(out).toContain('data-tab-label="PYTHON"');
  });

  it("code-group 外的 code-block 不受影响", () => {
    const html = `${codeBlock("js")}<div class="code-group">${codeBlock("ts")}</div>`;
    const out = wrapCodeGroups(html);
    // 外部的 code-block 保持原样（不在 tabs 内）
    expect(out.startsWith("<code-block>")).toBe(true);
    // 内部的被重组
    expect(out).toContain('data-tab-label="TS"');
  });

  it("处理 code-block 间的空白与换行", () => {
    const html = `<div class="code-group">\n  ${codeBlock("js")}\n  ${codeBlock("ts")}\n</div>`;
    const out = wrapCodeGroups(html);
    expect(out).toContain('data-tab-label="JS"');
    expect(out).toContain('data-tab-label="TS"');
  });

  it("语言名含连字符也能提取", () => {
    const html = `<div class="code-group">${codeBlock("vue-html")}</div>`;
    const out = wrapCodeGroups(html);
    expect(out).toContain('data-tab-label="VUE-HTML"');
  });
});
