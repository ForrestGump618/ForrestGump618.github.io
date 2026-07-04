import { defineMdastPlugin, type MdastPluginDefinition } from "satteri";

/**
 * ruby-directive（satteri 版）：
 * 将 :ruby[文本(注音)] 行内指令转换为 <ruby> HTML 元素
 *
 * 等价于 remark-ruby-directive，适配 satteri 插件 API：
 * - 订阅 textDirective visitor（需要 features.directive: true）
 * - 通过 ctx.replaceNode 返回 { rawHtml } 直接输出 HTML
 *
 * 支持的语法：
 *   :ruby[とある科学の超電磁砲(レールガン)]
 *   :ruby[とある科学の超電磁砲（レールガン）]  （全角括号）
 *
 * 约束（与 remark-ruby-directive 一致）：
 * - 正文不能包含空格
 * - 只能有一对括号
 * - 括号不能嵌套
 *
 * 渲染结果：
 *   <ruby data-ruby="注音">正文<rp>(</rp><rt>注音</rt><rp>)</rp></ruby>
 */

// 匹配 "正文(注音)" 格式，支持全角/半角括号
const RUBY_REGEX = /^([^\s(（]+)([（(])([^）)]+)([）)])$/;

// 转义 HTML 特殊字符
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildRubyHtml(value: string, ruby: string): string {
  const escapedValue = escapeHtml(value);
  const escapedRuby = escapeHtml(ruby);
  return `<ruby data-ruby="${escapedRuby}">${escapedValue}<rp>(</rp><rt>${escapedRuby}</rt><rp>)</rp></ruby>`;
}

export default function rubyDirective(): MdastPluginDefinition {
  return defineMdastPlugin({
    name: "ruby-directive",
    textDirective(node, ctx) {
      if (node.name !== "ruby") return;

      // 取第一个子节点（必须是 text 节点）
      const firstChild = node.children?.[0];
      if (!firstChild || firstChild.type !== "text" || typeof firstChild.value !== "string") return;

      const text = firstChild.value;
      const matches = text.match(RUBY_REGEX);
      if (!matches) return;

      const [, value, , ruby] = matches;
      const html = buildRubyHtml(value, ruby);
      ctx.replaceNode(node, { rawHtml: html });
    },
  });
}
