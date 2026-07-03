import { defineHastPlugin, type HastPluginDefinition } from "satteri";
import type { Element } from "hast";

/**
 * autolink-headings（satteri 版）：
 * 为标题添加锚点链接，等价于 rehype-autolink-headings
 *
 * 策略：订阅 hast element visitor（过滤 h1-h6），将标题子节点包裹在 <a href="#id"> 中
 * 依赖 satteriHeadingIdsPlugin 已为标题添加 id 属性
 */
export interface AutolinkHeadingsOptions {
  /** 行为模式：wrap（包裹所有子节点）或 append（追加锚点链接） */
  behavior?: "wrap" | "append";
  /** 锚点链接的 class 名 */
  className?: string;
}

export default function autolinkHeadings(
  options: AutolinkHeadingsOptions = {},
): HastPluginDefinition {
  const behavior = options.behavior ?? "wrap";
  const className = options.className ?? "heading-anchor";

  return defineHastPlugin({
    name: "autolink-headings",
    element: {
      filter: ["h1", "h2", "h3", "h4", "h5", "h6"],
      visit(node: Element, ctx) {
        const id = node.properties?.id;
        if (!id || typeof id !== "string") return;

        if (behavior === "wrap") {
          // 将标题的所有子节点包裹在 <a> 中
          const anchor: Element = {
            type: "element",
            tagName: "a",
            properties: {
              href: `#${id}`,
              class: className,
              "aria-label": "Permalink to this heading",
            },
            children: node.children,
          };
          ctx.setProperty(node, "children", [anchor]);
        } else if (behavior === "append") {
          // 在标题末尾追加一个锚点链接
          const anchor: Element = {
            type: "element",
            tagName: "a",
            properties: {
              href: `#${id}`,
              class: className,
            },
            children: [{ type: "text", value: "#" }],
          };
          ctx.appendChild(node, anchor);
        }
      },
    },
  });
}
