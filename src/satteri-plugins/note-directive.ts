import { defineMdastPlugin, type MdastPluginDefinition, type MdxJsxAttributeNode } from "satteri";

/**
 * note-directive（satteri 版）：
 * 将 :::info, :::warning 等容器指令转换为 Note MDX 组件
 *
 * 与 remark 版逻辑一致，适配 satteri 插件 API：
 * - 订阅 containerDirective / leafDirective visitor
 * - containerDirective → mdxJsxFlowElement（块级）
 * - leafDirective → mdxJsxTextElement（行内）
 */
const VALID_TYPES = new Set(["info", "warning", "success", "danger", "primary", "default"]);

function buildAttributes(node: {
  name: string;
  attributes?: Record<string, string | null | undefined> | null;
}): MdxJsxAttributeNode[] {
  const type = node.name;
  const attributes = node.attributes ?? {};
  const jsxAttributes: MdxJsxAttributeNode[] = [
    { type: "mdxJsxAttribute", name: "type", value: type },
  ];

  if (attributes.title) {
    jsxAttributes.push({ type: "mdxJsxAttribute", name: "title", value: attributes.title });
  }
  if (attributes.icon) {
    jsxAttributes.push({ type: "mdxJsxAttribute", name: "icon", value: attributes.icon });
  }
  return jsxAttributes;
}

export default function noteDirective(): MdastPluginDefinition {
  return defineMdastPlugin({
    name: "note-directive",
    containerDirective(node, ctx) {
      if (!VALID_TYPES.has(node.name)) return;
      ctx.replaceNode(node, {
        type: "mdxJsxFlowElement",
        name: "Note",
        attributes: buildAttributes(node),
        children: node.children,
      });
    },
    leafDirective(node, ctx) {
      if (!VALID_TYPES.has(node.name)) return;
      ctx.replaceNode(node, {
        type: "mdxJsxTextElement",
        name: "Note",
        attributes: buildAttributes(node),
        children: node.children,
      });
    },
  });
}
