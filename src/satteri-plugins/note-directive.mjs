import { defineMdastPlugin } from "satteri";

/**
 * note-directive（satteri 版）：
 * 将 :::info, :::warning 等容器指令转换为 Note MDX 组件
 *
 * 与 remark 版逻辑一致，适配 satteri 插件 API：
 * - 订阅 containerDirective / leafDirective visitor
 * - 通过 ctx.replaceNode 替换为 mdxJsxFlowElement
 */
export default function noteDirective() {
  const validTypes = new Set(["info", "warning", "success", "danger", "primary", "default"]);

  function buildReplacement(node) {
    const type = node.name;
    if (!validTypes.has(type)) return null;

    const attributes = node.attributes || {};
    const jsxAttributes = [{ type: "mdxJsxAttribute", name: "type", value: type }];

    if (attributes.title) {
      jsxAttributes.push({ type: "mdxJsxAttribute", name: "title", value: attributes.title });
    }
    if (attributes.icon) {
      jsxAttributes.push({ type: "mdxJsxAttribute", name: "icon", value: attributes.icon });
    }

    return {
      type: "mdxJsxFlowElement",
      name: "Note",
      attributes: jsxAttributes,
      children: node.children,
    };
  }

  return defineMdastPlugin({
    name: "note-directive",
    containerDirective(node, ctx) {
      const replacement = buildReplacement(node);
      if (replacement) ctx.replaceNode(node, replacement);
    },
    leafDirective(node, ctx) {
      const replacement = buildReplacement(node);
      if (replacement) ctx.replaceNode(node, replacement);
    },
  });
}
