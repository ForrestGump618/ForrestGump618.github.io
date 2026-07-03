import { defineMdastPlugin, type MdastPluginDefinition, type MdxJsxAttributeNode } from "satteri";

/**
 * span-directive（satteri 版）：
 * 将 :span[xxx] 行内指令转换为 <span>xxx</span>
 *
 * 与 remark 版逻辑一致，适配 satteri 插件 API：
 * - 订阅 textDirective visitor
 * - 通过 ctx.replaceNode 替换为 mdxJsxTextElement
 */
export default function spanDirective(): MdastPluginDefinition {
  return defineMdastPlugin({
    name: "span-directive",
    textDirective(node, ctx) {
      if (node.name !== "span") return;

      const jsxAttributes: MdxJsxAttributeNode[] = [];

      // class 属性（来自 {.class} 语法）
      if (node.attributes?.class) {
        jsxAttributes.push({
          type: "mdxJsxAttribute",
          name: "class",
          value: node.attributes.class,
        });
      }

      // 其他属性
      for (const [key, value] of Object.entries(node.attributes ?? {})) {
        if (key === "class") continue;
        jsxAttributes.push({ type: "mdxJsxAttribute", name: key, value: value });
      }

      ctx.replaceNode(node, {
        type: "mdxJsxTextElement",
        name: "span",
        attributes: jsxAttributes,
        children: node.children,
      });
    },
  });
}
