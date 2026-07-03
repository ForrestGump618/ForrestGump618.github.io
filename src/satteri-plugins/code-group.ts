import { defineMdastPlugin, type MdastPluginDefinition, type MdxJsxAttributeNode } from "satteri";

/**
 * code-group（satteri 版）：
 * 将 :::code-group 容器指令转换为 <div class="code-group">。
 *
 * 设计要点：
 * - 不替换子节点（code 块保持原位），让 Shiki 正常对每个代码块做高亮渲染。
 * - 仅在容器层打 class 标记，后续由 wrapCodeGroups 后处理将连续 <code-block>
 *   重组为可切换的 Tabs 结构（与 Tabs.astro 输出一致，复用 initAllTabs 客户端逻辑）。
 *
 * 语法：
 * :::code-group
 * ```js
 * const a = 1
 * ```
 * ```ts
 * const a: number = 1
 * ```
 * :::
 */
export default function codeGroup(): MdastPluginDefinition {
  return defineMdastPlugin({
    name: "code-group",
    containerDirective(node, ctx) {
      if (node.name !== "code-group") return;
      const attributes: MdxJsxAttributeNode[] = [
        { type: "mdxJsxAttribute", name: "class", value: "code-group" },
      ];
      ctx.replaceNode(node, {
        type: "mdxJsxFlowElement",
        name: "div",
        attributes,
        children: node.children,
      });
    },
  });
}
